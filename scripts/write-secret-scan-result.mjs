import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const allowedOutcomes = new Set(["success", "failure", "cancelled", "skipped"]);
const outcome = process.env["SECRET_SCAN_OUTCOME"];

if (!outcome || !allowedOutcomes.has(outcome)) {
  throw new Error(
    "SECRET_SCAN_OUTCOME deve conter um resultado conhecido do CI",
  );
}

const outputPath = resolve(
  import.meta.dirname,
  "../evidencias/resultados/gitleaks-result.json",
);
await mkdir(dirname(outputPath), { recursive: true });

// O relatório registra a execução sem reproduzir um possível segredo detectado.
const report = {
  schemaVersion: 1,
  scanner: "gitleaks/gitleaks-action",
  scannerRevision: "e0c47f4f8be36e29cdc102c57e68cb5cbf0e8d1e",
  scope: "event-commit-range",
  redacted: true,
  outcome,
  passed: outcome === "success",
  conclusion:
    outcome === "success"
      ? "SEM_ACHADOS_BLOQUEADORES"
      : "NAO_APROVADA_ACHADO_OU_FALHA_OPERACIONAL",
};

await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, {
  encoding: "utf8",
  flag: "wx",
});

process.stdout.write(
  `${JSON.stringify({ report: outputPath, outcome, redacted: true })}\n`,
);
