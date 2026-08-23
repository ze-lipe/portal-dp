import { lstat, readFile, readdir, rename, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const EXPECTED_SBOM_COUNT = 11;
const CYCLONEDX_SCHEMA = "http://cyclonedx.org/schema/bom-1.7.schema.json";
const REDACTED_CONTACT = "[contato-publico-removido]";
const emailPattern = /\b[A-Z0-9._%+-]+@(?:[A-Z0-9-]+\.)+[A-Z]{2,63}\b/giu;
const exactEmailPattern = /^[A-Z0-9._%+-]+@(?:[A-Z0-9-]+\.)+[A-Z]{2,63}$/iu;
const githubRepositoryPathPattern = /^[A-Z0-9_.-]+\/[A-Z0-9_.-]+(?:\.git)?$/iu;
const githubLoginPattern = /^[A-Z0-9](?:[A-Z0-9-]{0,37}[A-Z0-9])?$/iu;

function fail(message) {
  throw new Error(`CycloneDX SBOM sanitization failed: ${message}`);
}

function argument(name) {
  const index = process.argv.indexOf(`--${name}`);
  return index === -1 ? undefined : process.argv[index + 1];
}

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

// JSON.parse aceita silenciosamente chaves repetidas. Esta leitura lexical
// adicional rejeita inclusive duplicacoes escritas com escapes Unicode, antes
// que qualquer contato seja removido do documento.
function assertNoDuplicateJsonKeys(text) {
  let position = 0;

  function skipWhitespace() {
    while (/\s/u.test(text[position] ?? "")) position += 1;
  }

  function parseString() {
    if (text[position] !== '"') fail("JSON string was expected");
    const start = position;
    position += 1;
    while (position < text.length) {
      if (text[position] === '"') {
        position += 1;
        return JSON.parse(text.slice(start, position));
      }
      if (text[position] === "\\") {
        position += text[position + 1] === "u" ? 6 : 2;
      } else {
        position += 1;
      }
    }
    fail("JSON string is unterminated");
  }

  function parseValue() {
    skipWhitespace();
    const token = text[position];
    if (token === "{") {
      parseObject();
      return;
    }
    if (token === "[") {
      parseArray();
      return;
    }
    if (token === '"') {
      parseString();
      return;
    }
    const remaining = text.slice(position);
    const primitive = remaining.match(
      /^(?:true|false|null|-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?)/u,
    )?.[0];
    if (!primitive) fail("JSON value was expected");
    position += primitive.length;
  }

  function parseObject() {
    position += 1;
    skipWhitespace();
    const keys = new Set();
    if (text[position] === "}") {
      position += 1;
      return;
    }
    while (position < text.length) {
      skipWhitespace();
      const key = parseString();
      if (keys.has(key)) fail("JSON contains a duplicate object key");
      keys.add(key);
      skipWhitespace();
      if (text[position] !== ":") fail("JSON object separator is missing");
      position += 1;
      parseValue();
      skipWhitespace();
      if (text[position] === "}") {
        position += 1;
        return;
      }
      if (text[position] !== ",") fail("JSON object is malformed");
      position += 1;
    }
    fail("JSON object is unterminated");
  }

  function parseArray() {
    position += 1;
    skipWhitespace();
    if (text[position] === "]") {
      position += 1;
      return;
    }
    while (position < text.length) {
      parseValue();
      skipWhitespace();
      if (text[position] === "]") {
        position += 1;
        return;
      }
      if (text[position] !== ",") fail("JSON array is malformed");
      position += 1;
    }
    fail("JSON array is unterminated");
  }

  parseValue();
  skipWhitespace();
  if (position !== text.length) fail("JSON contains trailing content");
}

function parseSbom(text) {
  let document;
  try {
    document = JSON.parse(text);
  } catch {
    fail("document is not valid JSON");
  }
  assertNoDuplicateJsonKeys(text);
  if (
    !isObject(document) ||
    document.$schema !== CYCLONEDX_SCHEMA ||
    document.bomFormat !== "CycloneDX" ||
    document.specVersion !== "1.7" ||
    !isObject(document.metadata) ||
    !isObject(document.metadata.component) ||
    !Array.isArray(document.components) ||
    !Array.isArray(document.dependencies)
  ) {
    fail("document is not the expected CycloneDX 1.7 inventory");
  }
  return document;
}

function isInternalComponent(component) {
  if (
    !isObject(component) ||
    typeof component.name !== "string" ||
    component.name.length === 0 ||
    typeof component.version !== "string" ||
    component.version.length === 0 ||
    typeof component.purl !== "string" ||
    component.purl.length === 0 ||
    component["bom-ref"] !== component.purl
  ) {
    fail("component identity is incomplete");
  }
  let decodedPurl;
  try {
    decodedPurl = decodeURIComponent(component.purl);
  } catch {
    fail("component purl is malformed");
  }
  if (!decodedPurl.startsWith("pkg:npm/")) {
    fail("component is not identified by an npm purl");
  }
  const internalByPurl = decodedPurl.startsWith("pkg:npm/@portal-dp/");
  const internalByGroup = component.group === "@portal-dp";
  if (internalByPurl !== internalByGroup) {
    fail("component has an ambiguous internal identity");
  }
  return internalByPurl;
}

function redactEmails(value) {
  emailPattern.lastIndex = 0;
  return value.replace(emailPattern, REDACTED_CONTACT);
}

function canonicalGithubVcsUrl(value) {
  const scpMatch = value.match(
    /^git@github\.com:([A-Z0-9_.-]+\/[A-Z0-9_.-]+(?:\.git)?)$/iu,
  );
  if (scpMatch) return `https://github.com/${scpMatch[1]}`;

  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    parsed = null;
  }
  if (
    parsed &&
    ["git+ssh:", "git+https:", "ssh:"].includes(parsed.protocol) &&
    ((["git+ssh:", "ssh:"].includes(parsed.protocol) &&
      parsed.username === "git") ||
      (parsed.protocol === "git+https:" &&
        githubLoginPattern.test(parsed.username))) &&
    parsed.password === "" &&
    parsed.hostname.toLowerCase() === "github.com" &&
    parsed.port === "" &&
    parsed.search === "" &&
    parsed.hash === ""
  ) {
    const repositoryPath = parsed.pathname.replace(/^\//u, "");
    if (githubRepositoryPathPattern.test(repositoryPath)) {
      return `https://github.com/${repositoryPath}`;
    }
  }
  if (
    (parsed && (parsed.username !== "" || parsed.password !== "")) ||
    /^[^@/\s:]+@[^@/\s:]+:/u.test(value)
  ) {
    fail("VCS reference contains unsupported user information");
  }
  emailPattern.lastIndex = 0;
  if (emailPattern.test(value)) {
    fail("VCS reference contains unsupported user information");
  }
  return value;
}

function sanitizeThirdPartyVcsReferences(component) {
  if (!Object.hasOwn(component, "externalReferences")) return 0;
  if (
    !Array.isArray(component.externalReferences) ||
    component.externalReferences.length === 0
  ) {
    fail("component externalReferences must be a non-empty array");
  }
  let normalizedVcsReferenceCount = 0;
  for (const reference of component.externalReferences) {
    if (
      !isObject(reference) ||
      typeof reference.type !== "string" ||
      reference.type.length === 0 ||
      typeof reference.url !== "string" ||
      reference.url.length === 0
    ) {
      fail("component external reference is invalid");
    }
    if (reference.type !== "vcs") continue;
    const canonical = canonicalGithubVcsUrl(reference.url);
    if (canonical !== reference.url) {
      reference.url = canonical;
      normalizedVcsReferenceCount += 1;
    }
  }
  return normalizedVcsReferenceCount;
}

function sanitizeThirdPartyAuthors(component) {
  let redactedEmailCount = 0;
  if (Object.hasOwn(component, "author")) {
    if (typeof component.author !== "string") {
      fail("legacy component author is not a string");
    }
    const sanitized = redactEmails(component.author);
    if (sanitized !== component.author) {
      component.author = sanitized;
      redactedEmailCount += 1;
    }
  }
  if (!Object.hasOwn(component, "authors")) return redactedEmailCount;
  if (!Array.isArray(component.authors) || component.authors.length === 0) {
    fail("component authors must be a non-empty array");
  }
  for (const author of component.authors) {
    if (
      !isObject(author) ||
      Object.keys(author).some(
        (key) => !["name", "email", "phone"].includes(key),
      )
    ) {
      fail("component author has an unexpected shape");
    }
    for (const field of ["name", "email", "phone"]) {
      if (
        Object.hasOwn(author, field) &&
        (typeof author[field] !== "string" || author[field].length === 0)
      ) {
        fail("component author contact field is invalid");
      }
    }
    if (Object.hasOwn(author, "email")) {
      if (!exactEmailPattern.test(author.email)) {
        fail("component author email is not a standalone address");
      }
      delete author.email;
      redactedEmailCount += 1;
    }
    if (Object.hasOwn(author, "name")) {
      const sanitized = redactEmails(author.name);
      if (sanitized !== author.name) {
        author.name = sanitized;
        redactedEmailCount += 1;
      }
    }
    if (Object.keys(author).length === 0) {
      fail("component author became empty after sanitization");
    }
  }
  return redactedEmailCount;
}

function sanitizeSbom(document) {
  let redactedEmailCount = 0;
  let normalizedVcsReferenceCount = 0;
  for (const component of document.components) {
    if (!isInternalComponent(component)) {
      redactedEmailCount += sanitizeThirdPartyAuthors(component);
      normalizedVcsReferenceCount += sanitizeThirdPartyVcsReferences(component);
    }
  }
  return { redactedEmailCount, normalizedVcsReferenceCount };
}

async function main() {
  const directoryArgument = argument("directory");
  if (!directoryArgument) fail("--directory is required");
  const directory = resolve(directoryArgument);
  const directoryDetails = await lstat(directory).catch(() => null);
  if (!directoryDetails?.isDirectory() || directoryDetails.isSymbolicLink()) {
    fail("SBOM directory is missing or is not a regular directory");
  }
  const entries = await readdir(directory, { withFileTypes: true });
  const sbomEntries = entries
    .filter((entry) => entry.name.toLowerCase().endsWith(".cdx.json"))
    .sort((left, right) => left.name.localeCompare(right.name));
  if (sbomEntries.length !== EXPECTED_SBOM_COUNT) {
    fail(`expected exactly ${EXPECTED_SBOM_COUNT} CycloneDX documents`);
  }
  if (
    new Set(sbomEntries.map((entry) => entry.name.toLowerCase())).size !==
    sbomEntries.length
  ) {
    fail("SBOM filenames collide when compared case-insensitively");
  }

  // Todos os documentos sao validados antes da primeira escrita. Assim, um
  // SBOM invalido nao deixa o conjunto parcialmente sanitizado.
  const documents = [];
  let redactedEmailCount = 0;
  let normalizedVcsReferenceCount = 0;
  for (const entry of sbomEntries) {
    if (!entry.isFile() || entry.isSymbolicLink()) {
      fail("SBOM input is not a regular file");
    }
    const path = resolve(directory, entry.name);
    const text = await readFile(path, "utf8");
    const document = parseSbom(text);
    const result = sanitizeSbom(document);
    redactedEmailCount += result.redactedEmailCount;
    normalizedVcsReferenceCount += result.normalizedVcsReferenceCount;
    documents.push({ path, document });
  }

  for (const [index, { path, document }] of documents.entries()) {
    const temporaryPath = `${path}.sanitized-${process.pid}-${index}`;
    await writeFile(temporaryPath, `${JSON.stringify(document, null, 2)}\n`, {
      encoding: "utf8",
      flag: "wx",
    });
    await rename(temporaryPath, path);
  }
  process.stdout.write(
    `${JSON.stringify({
      sanitized: true,
      documentCount: documents.length,
      redactedEmailCount,
      normalizedVcsReferenceCount,
    })}\n`,
  );
}

await main();
