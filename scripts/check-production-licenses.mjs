import {
  mkdir,
  readFile,
  readdir,
  realpath,
  writeFile,
} from "node:fs/promises";
import { basename, dirname, join, relative, resolve } from "node:path";

const workspaceRoot = resolve(import.meta.dirname, "..");
const reportPath = resolve(
  process.env["LICENSE_REPORT_PATH"] ??
    "evidencias/resultados/licenses-production.json",
);
const approvedAtoms = new Set([
  "0BSD",
  "Apache-2.0",
  "BlueOak-1.0.0",
  "BSD",
  "BSD-2-Clause",
  "BSD-3-Clause",
  "CC-BY-3.0",
  "CC-BY-4.0",
  "CC0-1.0",
  "ISC",
  "MIT",
  "MPL-2.0",
  "Python-2.0",
  "Unicode-3.0",
  "Unicode-DFS-2016",
  "Unlicense",
]);
const denied = /(?:^|[^A-Z])(?:L?A?GPL|SSPL|BUSL|Commons-Clause)(?:$|[^A-Z])/iu;
const visitedDirectories = new Set();
const inventory = new Map();

function normalizeAtom(value) {
  return value
    .trim()
    .replace(/^\(+|\)+$/gu, "")
    .replace(/\*$/u, "");
}

function isApprovedExpression(expression) {
  if (
    typeof expression !== "string" ||
    expression.trim() === "" ||
    /unknown|unlicensed|see license in/iu.test(expression) ||
    denied.test(expression)
  ) {
    return false;
  }
  const atoms = expression
    .replace(/[()]/gu, " ")
    .split(/\s+(?:AND|OR|WITH)\s+/iu)
    .map(normalizeAtom)
    .filter(Boolean);
  return atoms.length > 0 && atoms.every((atom) => approvedAtoms.has(atom));
}

async function readManifest(directory) {
  return JSON.parse(await readFile(join(directory, "package.json"), "utf8"));
}

function licenseExpression(manifest) {
  if (typeof manifest.license === "string") return manifest.license;
  if (
    manifest.license &&
    typeof manifest.license === "object" &&
    typeof manifest.license.type === "string"
  ) {
    return manifest.license.type;
  }
  if (Array.isArray(manifest.licenses)) {
    const values = manifest.licenses
      .map((item) =>
        typeof item === "string"
          ? item
          : item && typeof item.type === "string"
            ? item.type
            : undefined,
      )
      .filter(Boolean);
    if (values.length > 0) return values.join(" OR ");
  }
  return "UNKNOWN";
}

async function resolveDependencyDirectory(fromDirectory, dependencyName) {
  let current = fromDirectory;
  while (true) {
    const modulesDirectory =
      basename(current) === "node_modules"
        ? current
        : join(current, "node_modules");
    const candidate = join(modulesDirectory, dependencyName);
    try {
      await readFile(join(candidate, "package.json"), "utf8");
      return realpath(candidate);
    } catch (error) {
      if (!isMissingFile(error)) throw error;
    }
    const parent = dirname(current);
    if (parent === current) return undefined;
    current = parent;
  }
}

async function visitPackage(directory, internal) {
  const canonicalDirectory = await realpath(directory);
  if (visitedDirectories.has(canonicalDirectory)) return;
  visitedDirectories.add(canonicalDirectory);

  const manifest = await readManifest(canonicalDirectory);
  if (!internal) {
    const license = licenseExpression(manifest);
    const key = `${String(manifest.name)}@${String(manifest.version)}`;
    inventory.set(key, {
      name: String(manifest.name),
      version: String(manifest.version),
      license,
      path: relative(workspaceRoot, canonicalDirectory).replaceAll("\\", "/"),
    });
  }

  const required = Object.keys(manifest.dependencies ?? {});
  const optional = Object.keys(manifest.optionalDependencies ?? {});
  for (const dependencyName of [...new Set([...required, ...optional])]) {
    const dependencyDirectory = await resolveDependencyDirectory(
      canonicalDirectory,
      dependencyName,
    );
    if (!dependencyDirectory) {
      if (optional.includes(dependencyName)) continue;
      throw new Error(
        `Cannot resolve production dependency ${dependencyName} from ${canonicalDirectory}`,
      );
    }
    await visitPackage(
      dependencyDirectory,
      dependencyName === "portal-dp" ||
        dependencyName.startsWith("@portal-dp/"),
    );
  }
}

async function workspaceDirectories() {
  const directories = [workspaceRoot];
  for (const group of ["apps", "packages"]) {
    const groupDirectory = join(workspaceRoot, group);
    for (const entry of await readdir(groupDirectory, {
      withFileTypes: true,
    })) {
      if (entry.isDirectory())
        directories.push(join(groupDirectory, entry.name));
    }
  }
  return directories;
}

function isMissingFile(error) {
  return error instanceof Error && "code" in error && error.code === "ENOENT";
}

for (const directory of await workspaceDirectories()) {
  await visitPackage(directory, true);
}

const packages = [...inventory.values()].sort((left, right) =>
  `${left.name}@${left.version}`.localeCompare(
    `${right.name}@${right.version}`,
  ),
);
if (packages.length === 0) {
  throw new Error("Production dependency license inventory is empty");
}
await mkdir(dirname(reportPath), { recursive: true });
await writeFile(
  reportPath,
  `${JSON.stringify({ generatedAt: new Date().toISOString(), packages }, null, 2)}\n`,
  "utf8",
);

const rejected = packages.filter(
  ({ license }) => !isApprovedExpression(license),
);
if (rejected.length > 0) {
  throw new Error(
    `Unapproved production licenses: ${rejected
      .map(({ name, version, license }) => `${name}@${version} (${license})`)
      .join(", ")}`,
  );
}

process.stdout.write(
  `${JSON.stringify({
    approvedProductionPackages: packages.length,
    report: reportPath,
  })}\n`,
);
