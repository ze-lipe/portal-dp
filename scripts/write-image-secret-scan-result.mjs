import { appendFile, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const allowedStepOutcomes = new Set([
  "success",
  "failure",
  "cancelled",
  "skipped",
]);
const trivyVersion = "0.70.0";
const trivyActionRevision = "ed142fd0673e97e23eac54620cfb913e5ce36c25";
const digestPattern = /^sha256:[a-f0-9]{64}$/u;

const stepOutcome = process.env["IMAGE_SECRET_SCAN_STEP_OUTCOME"];
const rawReportPath = process.env["IMAGE_SECRET_SCAN_REPORT_PATH"];
const expectedImageReference = process.env["IMAGE_SECRET_SCAN_EXPECTED_IMAGE"];
const configuredExpectedImageId =
  process.env["IMAGE_SECRET_SCAN_EXPECTED_IMAGE_ID"];
const expectedImageId = digestPattern.test(configuredExpectedImageId ?? "")
  ? configuredExpectedImageId
  : null;
const outputPath = resolve(
  process.env["IMAGE_SECRET_SCAN_OUTPUT_PATH"] ??
    resolve(
      import.meta.dirname,
      "../evidencias/resumos-seguranca/image-secret-scan-result.json",
    ),
);

if (!stepOutcome || !allowedStepOutcomes.has(stepOutcome)) {
  throw new Error("IMAGE_SECRET_SCAN_STEP_OUTCOME deve ser conhecido");
}
if (
  !expectedImageReference ||
  !/^portal-dp:[a-f0-9]{40}$/u.test(expectedImageReference)
) {
  throw new Error("IMAGE_SECRET_SCAN_EXPECTED_IMAGE deve identificar o commit");
}

async function inspectRawReport() {
  if (!rawReportPath) return null;
  try {
    const report = JSON.parse(await readFile(rawReportPath, "utf8"));
    if (
      report?.SchemaVersion !== 2 ||
      report.Trivy?.Version !== trivyVersion ||
      report.ArtifactName !== expectedImageReference ||
      report.ArtifactType !== "container_image" ||
      !digestPattern.test(report.Metadata?.ImageID ?? "") ||
      report.Metadata.ImageID !== expectedImageId ||
      !Array.isArray(report.Metadata?.DiffIDs) ||
      report.Metadata.DiffIDs.length === 0 ||
      report.Metadata.DiffIDs.some((digest) => !digestPattern.test(digest)) ||
      !Array.isArray(report.Metadata?.RepoTags) ||
      !report.Metadata.RepoTags.includes(expectedImageReference) ||
      (report.Results !== undefined && !Array.isArray(report.Results))
    ) {
      return null;
    }

    let findingCount = 0;
    for (const result of report.Results ?? []) {
      if (
        !result ||
        typeof result !== "object" ||
        Array.isArray(result) ||
        typeof result.Target !== "string" ||
        result.Target === "" ||
        "Vulnerabilities" in result ||
        "Misconfigurations" in result ||
        "Licenses" in result ||
        (result.Secrets !== undefined && !Array.isArray(result.Secrets))
      ) {
        return null;
      }
      findingCount += result.Secrets?.length ?? 0;
    }
    return {
      findingCount,
      targetCount: report.Results?.length ?? 0,
      imageLayerCount: report.Metadata.DiffIDs.length,
      imageId: report.Metadata.ImageID,
      scannerVersionObserved: report.Trivy.Version,
    };
  } catch {
    return null;
  }
}

let inspected = null;
let outcome = "operational_failure";
let failureCode = null;
try {
  inspected = await inspectRawReport();
  if (expectedImageId === null) {
    failureCode = "MISSING_OR_INVALID_EXPECTED_IMAGE_ID";
  } else if (inspected === null) {
    failureCode = "MISSING_OR_INVALID_TRIVY_REPORT";
  } else if (stepOutcome === "success" && inspected.findingCount === 0) {
    outcome = "success";
  } else if (stepOutcome === "failure" && inspected.findingCount > 0) {
    outcome = "findings";
  } else {
    failureCode = "STEP_OUTCOME_REPORT_MISMATCH";
  }
} finally {
  // O JSON bruto contém trechos, caminhos e identificadores do achado. Só o
  // resumo abaixo pode sair do diretório temporário do executor.
  if (rawReportPath) await rm(rawReportPath, { force: true });
}

const passed = outcome === "success";
const conclusion = passed
  ? "SEM_ACHADOS_BLOQUEADORES"
  : outcome === "findings"
    ? "NAO_APROVADA_ACHADO_DE_SEGREDO"
    : "NAO_APROVADA_FALHA_OPERACIONAL";

const report = {
  schemaVersion: 1,
  reportType: "IMAGE_LAYER_SECRET_SCAN_RESULT",
  scanner: "trivy",
  scannerVersion: trivyVersion,
  scannerVersionConfigured: true,
  scannerVersionObserved: inspected?.scannerVersionObserved ?? null,
  scannerVersionVerified: inspected?.scannerVersionObserved === trivyVersion,
  actionRevision: trivyActionRevision,
  actionRevisionPinned: true,
  scope: "OCI_IMAGE_FILESYSTEM_AND_LAYERS",
  scanMode: "container-image-secret-only",
  configurationPolicy: "CONTROLLED_NO_IGNORE_OR_SKIP_OVERRIDES",
  expectedImageReference,
  expectedImageId,
  imageId: inspected?.imageId ?? null,
  imageLayerCount: inspected?.imageLayerCount ?? null,
  targetCount: inspected?.targetCount ?? null,
  exitCodePolicy: 1,
  stepOutcome,
  findingCount: inspected?.findingCount ?? null,
  redacted: true,
  rawReportRetained: false,
  outcome,
  failureCode,
  passed,
  conclusion,
};

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, {
  encoding: "utf8",
  flag: "wx",
});

const githubOutputPath = process.env["GITHUB_OUTPUT"];
if (githubOutputPath) {
  await appendFile(
    githubOutputPath,
    `passed=${String(passed)}\noutcome=${outcome}\n`,
    "utf8",
  );
}
process.stdout.write(
  `${JSON.stringify({ report: outputPath, outcome, passed, redacted: true })}\n`,
);
