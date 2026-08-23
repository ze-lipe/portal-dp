import { createHash } from "node:crypto";
import {
  copyFile,
  lstat,
  mkdir,
  readFile,
  readdir,
  writeFile,
} from "node:fs/promises";
import { dirname, relative, resolve, sep } from "node:path";

import {
  createProhibitedDataInspection,
  inspectProhibitedData,
  prohibitedDataArchivePolicy,
} from "./prohibited-data-content-scan.mjs";
import { aggregateContentScanEntries } from "./content-scan-aggregate.mjs";

const supportedScopes = new Set([
  "BUILD_PACKAGE",
  "COLLECTED_EVIDENCE",
  "GENERATED_EVIDENCE",
  "OCI_EVIDENCE",
  "SAST_EVIDENCE",
  "SEALED_EVIDENCE",
  "TEST_FIXTURES",
]);
const policyVersion = "PORTAL_DP_PROHIBITED_DATA_V3";

function argument(name) {
  const index = process.argv.indexOf(`--${name}`);
  return index === -1 ? undefined : process.argv[index + 1];
}

function fail(message) {
  throw new Error(`Content secret scan staging failed: ${message}`);
}

function within(parent, child) {
  const path = relative(parent, child);
  return path === "" || (!path.startsWith(`..${sep}`) && path !== "..");
}

async function collectFiles(directory, logicalRoot, result) {
  const entries = await readdir(directory, { withFileTypes: true });
  entries.sort((left, right) => left.name.localeCompare(right.name));
  for (const entry of entries) {
    const path = resolve(directory, entry.name);
    if (entry.isSymbolicLink()) fail("symbolic links are forbidden");
    if (entry.isDirectory()) {
      await collectFiles(path, logicalRoot, result);
    } else if (entry.isFile()) {
      const logicalPath = relative(logicalRoot, path).split(sep).join("/");
      if (result.has(logicalPath)) fail(`duplicate input ${logicalPath}`);
      result.set(logicalPath, path);
    } else {
      fail("unsupported input type");
    }
  }
}

const repositoryRoot = resolve(argument("root") ?? process.cwd());
const stagingDirectory = resolve(argument("staging") ?? "");
const proofPath = resolve(argument("proof") ?? "");
if (!argument("staging") || !argument("proof")) {
  fail("--staging and --proof are required");
}
if (
  within(repositoryRoot, stagingDirectory) ||
  within(repositoryRoot, proofPath)
) {
  fail("temporary staging and proof must stay outside the repository");
}

const scopeInputs = new Map();
for (let index = 2; index < process.argv.length; index += 1) {
  if (process.argv[index - 1] !== "--scope") continue;
  const specification = process.argv[index];
  const separator = specification.indexOf("=");
  if (separator < 1) fail("each --scope must use NAME=PATH");
  const scope = specification.slice(0, separator);
  const path = resolve(repositoryRoot, specification.slice(separator + 1));
  if (!supportedScopes.has(scope)) fail(`unsupported scope ${scope}`);
  if (!within(repositoryRoot, path)) fail("scan input escaped the repository");
  const details = await lstat(path).catch(() => null);
  if (!details) fail(`missing scan input for ${scope}`);
  if (details.isSymbolicLink()) fail("symbolic scan roots are forbidden");
  const inputs = scopeInputs.get(scope) ?? [];
  inputs.push(path);
  scopeInputs.set(scope, inputs);
}
if (scopeInputs.size === 0) fail("at least one --scope is required");

await mkdir(stagingDirectory, { recursive: false });
const aggregateEntries = [];
const scopeStats = [];
let totalFiles = 0;
let totalBytes = 0;
const prohibitedDataInspection = createProhibitedDataInspection();

for (const scope of [...scopeInputs.keys()].sort()) {
  const files = new Map();
  const inputs = scopeInputs.get(scope);
  const usesScopeRelativePaths = [
    "COLLECTED_EVIDENCE",
    "SEALED_EVIDENCE",
  ].includes(scope);
  if (usesScopeRelativePaths && inputs.length !== 1) {
    fail(`${scope} requires exactly one directory root`);
  }
  for (const input of inputs) {
    const details = await lstat(input);
    if (details.isDirectory()) {
      await collectFiles(
        input,
        usesScopeRelativePaths ? input : repositoryRoot,
        files,
      );
    } else if (details.isFile()) {
      if (usesScopeRelativePaths) {
        fail(`${scope} requires a directory root`);
      }
      files.set(relative(repositoryRoot, input).split(sep).join("/"), input);
    } else {
      fail("unsupported scan root type");
    }
  }
  if (files.size === 0) fail(`scope ${scope} has no regular files`);

  let scopeBytes = 0;
  for (const [logicalPath, sourcePath] of [...files.entries()].sort()) {
    const bytes = await readFile(sourcePath);
    const sha256 = createHash("sha256").update(bytes).digest("hex");
    const targetPath = resolve(stagingDirectory, scope, logicalPath);
    await mkdir(dirname(targetPath), { recursive: true });
    await copyFile(sourcePath, targetPath);
    aggregateEntries.push({
      scope,
      logicalPath,
      byteCount: bytes.length,
      sha256,
    });
    inspectProhibitedData(bytes, logicalPath, prohibitedDataInspection);
    scopeBytes += bytes.length;
  }
  scopeStats.push(`${scope}:${files.size}:${scopeBytes}`);
  totalFiles += files.size;
  totalBytes += scopeBytes;
}

const aggregate = aggregateContentScanEntries(aggregateEntries);

await writeFile(
  proofPath,
  [
    `scopes=${[...scopeInputs.keys()].sort().join(",")}`,
    `scopeStats=${scopeStats.join(",")}`,
    `fileCount=${totalFiles}`,
    `byteCount=${totalBytes}`,
    `aggregateSha256=${aggregate.aggregateSha256}`,
    `prohibitedDataPolicy=${policyVersion}`,
    `prohibitedDataArchiveInspection=${prohibitedDataArchivePolicy.identifier}`,
    `prohibitedDataArchiveMaxDepth=${prohibitedDataArchivePolicy.maxDepth}`,
    `prohibitedDataArchiveMaxEntries=${prohibitedDataArchivePolicy.maxEntries}`,
    `prohibitedDataArchiveMaxEntryBytes=${prohibitedDataArchivePolicy.maxEntryBytes}`,
    `prohibitedDataArchiveMaxExpandedBytes=${prohibitedDataArchivePolicy.maxExpandedBytes}`,
    `prohibitedDataArchiveMaxCompressionRatio=${prohibitedDataArchivePolicy.maxCompressionRatio}`,
    `prohibitedDataArchiveEntryCount=${prohibitedDataInspection.archiveEntryCount}`,
    `prohibitedDataExpandedByteCount=${prohibitedDataInspection.expandedByteCount}`,
    `prohibitedDataFindingCount=${prohibitedDataInspection.findingCount}`,
    "",
  ].join("\n"),
  { encoding: "utf8", flag: "wx" },
);

process.stdout.write(
  `${JSON.stringify({
    staged: true,
    scopes: [...scopeInputs.keys()].sort(),
    fileCount: totalFiles,
    byteCount: totalBytes,
    prohibitedDataFindingCount: prohibitedDataInspection.findingCount,
    archiveEntryCount: prohibitedDataInspection.archiveEntryCount,
    expandedByteCount: prohibitedDataInspection.expandedByteCount,
  })}\n`,
);
