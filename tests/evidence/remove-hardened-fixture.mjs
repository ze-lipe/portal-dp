import { chmod, lstat, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";

const projectRoot = resolve(import.meta.dirname, "../..");
const TEMPORARY_ROOTS = [
  { parent: resolve(tmpdir()), prefix: "portal-dp-evidence-" },
  {
    parent: resolve(projectRoot, "evidencias"),
    prefix: ".acceptance-contract-",
  },
  { parent: resolve(projectRoot, "tmp"), prefix: ".acceptance-contract-" },
];

async function restoreDirectoryWritePermission(directory) {
  let entries;
  try {
    // A selagem usa 0550 nos diretórios. O teste restaura somente a permissão
    // do proprietário e apenas durante o descarte da sua árvore temporária.
    await chmod(directory, 0o700);
    entries = await readdir(directory, { withFileTypes: true });
  } catch (error) {
    if (error?.code === "ENOENT") return;
    throw error;
  }

  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory() && !entry.isSymbolicLink()) {
      await restoreDirectoryWritePermission(path);
    } else if (entry.isFile()) {
      await chmod(path, 0o600);
    }
  }
}

export async function removeHardenedFixture(directory) {
  const fixtureRoot = resolve(directory);
  const fixtureName = basename(fixtureRoot);
  const knownTemporaryRoot = TEMPORARY_ROOTS.some(
    ({ parent, prefix }) =>
      dirname(fixtureRoot) === parent &&
      fixtureName.startsWith(prefix) &&
      fixtureName.length > prefix.length,
  );
  if (!knownTemporaryRoot) {
    throw new Error("a limpeza recusou uma raiz que não é fixture temporária");
  }

  let rootStatus;
  try {
    rootStatus = await lstat(fixtureRoot);
  } catch (error) {
    if (error?.code === "ENOENT") return;
    throw error;
  }
  if (!rootStatus.isDirectory() || rootStatus.isSymbolicLink()) {
    throw new Error("a raiz da fixture deve ser um diretório real");
  }

  await restoreDirectoryWritePermission(fixtureRoot);
  await rm(fixtureRoot, {
    recursive: true,
    force: true,
    maxRetries: 3,
    retryDelay: 25,
  });
}
