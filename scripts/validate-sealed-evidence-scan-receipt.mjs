import { appendFile, readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

import { aggregateContentScanDirectory } from "./content-scan-aggregate.mjs";
import { sha256Bytes } from "./evidence-repository.mjs";
import { validateContentSecretScanReport } from "./secret-scan-contract.mjs";

function argument(values, name) {
  const index = values.indexOf(`--${name}`);
  return index === -1 ? undefined : values[index + 1];
}

/**
 * Confere o recibo externo antes de qualquer upload. Ele pode registrar uma
 * varredura reprovada, mas nunca pode ser reutilizado para outro run ou pacote.
 */
export async function validateSealedEvidenceScanReceipt({
  manifestPath,
  receiptPath,
}) {
  const resolvedManifestPath = resolve(manifestPath);
  const manifestBytes = await readFile(resolvedManifestPath);
  const manifest = JSON.parse(manifestBytes.toString("utf8"));
  const receipt = JSON.parse(await readFile(resolve(receiptPath), "utf8"));
  validateContentSecretScanReport(receipt, "SEALED_EVIDENCE", {
    requireClean: false,
  });

  const aggregate = await aggregateContentScanDirectory(
    dirname(resolvedManifestPath),
    "SEALED_EVIDENCE",
  );
  const manifestSha256 = sha256Bytes(manifestBytes);
  if (
    receipt.subject.runId !== manifest.runId ||
    receipt.subject.manifestSha256 !== manifestSha256 ||
    receipt.subject.aggregateSha256 !== aggregate.aggregateSha256 ||
    (receipt.passed === true &&
      (receipt.aggregateSha256 !== aggregate.aggregateSha256 ||
        receipt.fileCount !== aggregate.fileCount ||
        receipt.byteCount !== aggregate.byteCount))
  ) {
    throw new Error(
      "recibo SEALED_EVIDENCE nao corresponde ao run, manifesto e pacote examinados",
    );
  }
  return {
    runId: manifest.runId,
    manifestSha256,
    aggregateSha256: aggregate.aggregateSha256,
    outcome: receipt.outcome,
    passed: receipt.passed,
    conclusion: receipt.conclusion,
  };
}

async function main() {
  const values = process.argv.slice(2);
  const manifestPath = argument(values, "manifest");
  const receiptPath = argument(values, "receipt");
  if (!manifestPath || !receiptPath) {
    throw new Error("Use --manifest <path> --receipt <path>");
  }
  const result = await validateSealedEvidenceScanReceipt({
    manifestPath,
    receiptPath,
  });
  if (process.env["GITHUB_OUTPUT"]) {
    await appendFile(
      process.env["GITHUB_OUTPUT"],
      `passed=${String(result.passed)}\noutcome=${result.outcome}\n`,
      "utf8",
    );
  }
  process.stdout.write(`${JSON.stringify({ valid: true, ...result })}\n`);
}

if (resolve(process.argv[1] ?? "") === resolve(import.meta.filename)) {
  await main();
}
