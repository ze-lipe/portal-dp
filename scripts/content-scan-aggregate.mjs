import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import { join, relative, resolve, sep } from "node:path";

const hashPattern = /^[a-f0-9]{64}$/u;

function compareText(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}

function normalizedPath(value) {
  if (
    typeof value !== "string" ||
    value.length === 0 ||
    value.includes("\0") ||
    value.includes("\n") ||
    value.includes("\r") ||
    value.startsWith("/") ||
    value === ".." ||
    value.startsWith("../") ||
    value.includes("/../") ||
    value.includes("\\")
  ) {
    throw new Error("caminho invalido no agregado da varredura de conteudo");
  }
  return value;
}

/**
 * Calcula o identificador deterministico do conjunto efetivamente examinado.
 * O caminho faz parte do registro para impedir substituicao ou omissao de um
 * arquivo por outro que tenha os mesmos bytes.
 */
export function aggregateContentScanEntries(entries) {
  if (!Array.isArray(entries) || entries.length === 0) {
    throw new Error("o agregado da varredura exige ao menos um arquivo");
  }
  const normalized = entries
    .map((entry) => {
      if (
        !entry ||
        typeof entry !== "object" ||
        typeof entry.scope !== "string" ||
        !/^[A-Z_]+$/u.test(entry.scope) ||
        !Number.isSafeInteger(entry.byteCount) ||
        entry.byteCount < 0 ||
        !hashPattern.test(entry.sha256 ?? "")
      ) {
        throw new Error(
          "entrada invalida no agregado da varredura de conteudo",
        );
      }
      return {
        scope: entry.scope,
        logicalPath: normalizedPath(entry.logicalPath),
        byteCount: entry.byteCount,
        sha256: entry.sha256,
      };
    })
    .sort(
      (left, right) =>
        compareText(left.scope, right.scope) ||
        compareText(left.logicalPath, right.logicalPath),
    );
  const identities = new Set();
  const hash = createHash("sha256");
  let byteCount = 0;
  for (const entry of normalized) {
    const identity = `${entry.scope}\0${entry.logicalPath}`;
    if (identities.has(identity)) {
      throw new Error("arquivo duplicado no agregado da varredura de conteudo");
    }
    identities.add(identity);
    hash.update(
      `${entry.scope}\0${entry.logicalPath}\0${entry.byteCount}\0${entry.sha256}\n`,
    );
    byteCount += entry.byteCount;
    if (!Number.isSafeInteger(byteCount)) {
      throw new Error("tamanho total invalido na varredura de conteudo");
    }
  }
  return {
    aggregateSha256: hash.digest("hex"),
    fileCount: normalized.length,
    byteCount,
  };
}

/** Enumera um diretorio sem seguir links e calcula o mesmo agregado do staging. */
export async function aggregateContentScanDirectory(directory, scope) {
  const root = resolve(directory);
  const entries = [];
  async function walk(current) {
    const children = await readdir(current, { withFileTypes: true });
    children.sort((left, right) => compareText(left.name, right.name));
    for (const child of children) {
      const path = join(current, child.name);
      if (child.isSymbolicLink()) {
        throw new Error("links simbolicos sao proibidos no recibo selado");
      }
      if (child.isDirectory()) {
        await walk(path);
      } else if (child.isFile()) {
        const bytes = await readFile(path);
        entries.push({
          scope,
          logicalPath: relative(root, path).split(sep).join("/"),
          byteCount: bytes.length,
          sha256: createHash("sha256").update(bytes).digest("hex"),
        });
      } else {
        throw new Error("tipo fisico nao suportado no recibo selado");
      }
    }
  }
  await walk(root);
  return aggregateContentScanEntries(entries);
}
