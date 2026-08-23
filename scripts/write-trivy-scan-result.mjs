import { appendFile, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

import {
  TRIVY_REPORT_CONTRACT,
  inspectTrivyReport,
  validateTrivyScanSummary,
} from "./trivy-report-contract.mjs";

const allowedStepOutcomes = new Set([
  "success",
  "failure",
  "cancelled",
  "skipped",
]);
const digestPattern = /^sha256:[a-f0-9]{64}$/u;

const rawImagePath = process.env["TRIVY_SCAN_IMAGE_REPORT_PATH"];
const rawConfigPath = process.env["TRIVY_SCAN_CONFIG_REPORT_PATH"];
const expectedImageReference = process.env["TRIVY_SCAN_EXPECTED_IMAGE"];
const configuredExpectedImageId = process.env["TRIVY_SCAN_EXPECTED_IMAGE_ID"];
const expectedConfigCommit = process.env["TRIVY_SCAN_EXPECTED_CONFIG_COMMIT"];
const imageStepOutcome = normalizeStepOutcome(
  process.env["TRIVY_SCAN_IMAGE_STEP_OUTCOME"],
);
const configStepOutcome = normalizeStepOutcome(
  process.env["TRIVY_SCAN_CONFIG_STEP_OUTCOME"],
);
const outputPath = resolve(
  process.env["TRIVY_SCAN_OUTPUT_PATH"] ??
    resolve(
      import.meta.dirname,
      "../evidencias/resumos-seguranca/trivy-scan-result.json",
    ),
);
const approvedImagePath = resolve(
  process.env["TRIVY_SCAN_APPROVED_IMAGE_PATH"] ??
    resolve(import.meta.dirname, "../evidencias/resultados/trivy-image.json"),
);
const approvedConfigPath = resolve(
  process.env["TRIVY_SCAN_APPROVED_CONFIG_PATH"] ??
    resolve(import.meta.dirname, "../evidencias/resultados/trivy-config.json"),
);

if (
  typeof expectedImageReference !== "string" ||
  !/^portal-dp:[a-f0-9]{40}$/u.test(expectedImageReference)
) {
  throw new Error("TRIVY_SCAN_EXPECTED_IMAGE deve identificar o commit");
}
if (
  typeof expectedConfigCommit !== "string" ||
  !/^[a-f0-9]{40}(?:[a-f0-9]{24})?$/u.test(expectedConfigCommit)
) {
  throw new Error(
    "TRIVY_SCAN_EXPECTED_CONFIG_COMMIT deve ser um commit valido",
  );
}

function normalizeStepOutcome(value) {
  return allowedStepOutcomes.has(value) ? value : "skipped";
}

function emptyInspection(scope, failureCode, metadataSanitized = false) {
  const common = {
    structurallyValid: false,
    approved: false,
    failureCode,
    artifactName: null,
    artifactType: null,
    targetCount: null,
    findingCount: null,
  };
  return scope === "image"
    ? { ...common, imageId: null, packageCount: null }
    : {
        ...common,
        commit: null,
        metadataSanitized,
        requiredTargetType: null,
      };
}

function sanitizeConfigMetadata(report) {
  if (
    report !== null &&
    typeof report === "object" &&
    !Array.isArray(report) &&
    report.Metadata !== null &&
    typeof report.Metadata === "object" &&
    !Array.isArray(report.Metadata)
  ) {
    // Esses campos vêm do Git e podem conter nome, e-mail ou texto livre do
    // commit. O SHA continua vinculando a varredura sem publicar esses dados.
    delete report.Metadata.Author;
    delete report.Metadata.Committer;
    delete report.Metadata.CommitMsg;
  }
  return report;
}

async function inspectRawReport(path, scope) {
  if (
    scope === "image" &&
    !digestPattern.test(configuredExpectedImageId ?? "")
  ) {
    return {
      document: null,
      summary: emptyInspection(scope, "MISSING_OR_INVALID_EXPECTED_IMAGE_ID"),
    };
  }
  if (typeof path !== "string" || path === "") {
    return {
      document: null,
      summary: emptyInspection(scope, "MISSING_TRIVY_REPORT"),
    };
  }
  try {
    const document = JSON.parse(await readFile(path, "utf8"));
    const sanitized = scope === "config";
    if (sanitized) sanitizeConfigMetadata(document);
    const inspected = inspectTrivyReport(document, {
      label: scope === "image" ? "trivy-image" : "trivy-config",
      scope,
      expectedArtifactName: scope === "image" ? expectedImageReference : ".",
      expectedImageId:
        scope === "image" && digestPattern.test(configuredExpectedImageId ?? "")
          ? configuredExpectedImageId
          : undefined,
      expectedConfigCommit:
        scope === "config" ? expectedConfigCommit : undefined,
      expectedTrivyVersion: TRIVY_REPORT_CONTRACT.trivyVersion,
      requireSanitizedConfigMetadata: scope === "config",
    });
    const common = {
      structurallyValid: true,
      approved: inspected.approved,
      failureCode: null,
      artifactName: inspected.artifactName,
      artifactType: inspected.artifactType,
      targetCount: inspected.targetCount,
      findingCount: inspected.findingCount,
    };
    return {
      document,
      summary:
        scope === "image"
          ? {
              ...common,
              imageId: inspected.imageId,
              packageCount: inspected.packageCount,
            }
          : {
              ...common,
              commit: inspected.commit,
              metadataSanitized: true,
              requiredTargetType: inspected.requiredTargetType,
            },
    };
  } catch {
    return {
      document: null,
      summary: emptyInspection(
        scope,
        "MISSING_OR_INVALID_TRIVY_REPORT",
        scope === "config",
      ),
    };
  }
}

function stepMatchesReport(stepOutcome, summary) {
  if (!summary.structurallyValid) return false;
  return summary.approved
    ? stepOutcome === "success"
    : stepOutcome === "failure" && summary.findingCount > 0;
}

async function writeApprovedReports(imageDocument, configDocument) {
  await Promise.all([
    mkdir(dirname(approvedImagePath), { recursive: true }),
    mkdir(dirname(approvedConfigPath), { recursive: true }),
  ]);
  try {
    await writeFile(
      approvedImagePath,
      `${JSON.stringify(imageDocument, null, 2)}\n`,
      { encoding: "utf8", flag: "wx" },
    );
    await writeFile(
      approvedConfigPath,
      `${JSON.stringify(configDocument, null, 2)}\n`,
      { encoding: "utf8", flag: "wx" },
    );
    return true;
  } catch {
    // Nunca deixe um par parcial parecer uma aprovação válida.
    await Promise.all([
      rm(approvedImagePath, { force: true }),
      rm(approvedConfigPath, { force: true }),
    ]);
    return false;
  }
}

let image;
let config;
try {
  [image, config] = await Promise.all([
    inspectRawReport(rawImagePath, "image"),
    inspectRawReport(rawConfigPath, "config"),
  ]);
} finally {
  // Os relatórios temporários podem conter achados ou metadados pessoais.
  await Promise.all(
    [rawImagePath, rawConfigPath]
      .filter((path) => typeof path === "string" && path !== "")
      .map((path) => rm(path, { force: true })),
  );
}

const expectedImageId = digestPattern.test(configuredExpectedImageId ?? "")
  ? configuredExpectedImageId
  : null;
const structurallyValid =
  expectedImageId !== null &&
  image.summary.structurallyValid &&
  config.summary.structurallyValid;
const stepOutcomesMatch =
  structurallyValid &&
  stepMatchesReport(imageStepOutcome, image.summary) &&
  stepMatchesReport(configStepOutcome, config.summary);
const reportsApproved =
  stepOutcomesMatch && image.summary.approved && config.summary.approved;

let rawReportsPublished = false;
let publicationFailed = false;
if (reportsApproved) {
  rawReportsPublished = await writeApprovedReports(
    image.document,
    config.document,
  );
  publicationFailed = !rawReportsPublished;
}

const passed = reportsApproved && rawReportsPublished;
const hasFindings =
  structurallyValid &&
  (Number(image.summary.findingCount ?? 0) > 0 ||
    Number(config.summary.findingCount ?? 0) > 0);
const outcome = passed
  ? "success"
  : stepOutcomesMatch && hasFindings
    ? "findings"
    : "operational_failure";
let failureCode = null;
if (outcome === "operational_failure") {
  failureCode =
    expectedImageId === null
      ? "MISSING_OR_INVALID_EXPECTED_IMAGE_ID"
      : !image.summary.structurallyValid
        ? image.summary.failureCode
        : !config.summary.structurallyValid
          ? config.summary.failureCode
          : publicationFailed
            ? "APPROVED_REPORT_PUBLICATION_FAILURE"
            : "STEP_OUTCOME_REPORT_MISMATCH";
}
const conclusion = passed
  ? "SEM_ACHADOS_BLOQUEADORES"
  : outcome === "findings"
    ? "NAO_APROVADA_ACHADO_TRIVY"
    : "NAO_APROVADA_FALHA_OPERACIONAL";

const report = {
  schemaVersion: 1,
  reportType: "TRIVY_SCAN_RESULT",
  scanner: "trivy",
  scannerVersion: TRIVY_REPORT_CONTRACT.trivyVersion,
  actionRevision: TRIVY_REPORT_CONTRACT.actionRevision,
  configurationPolicy: "CONTROLLED_NO_IGNORE_OR_SKIP_OVERRIDES",
  expectedImageReference,
  expectedImageId,
  expectedConfigArtifactName: ".",
  expectedConfigCommit,
  imageStepOutcome,
  configStepOutcome,
  reports: {
    image: image.summary,
    config: config.summary,
  },
  rawReportsPublished,
  rawFindingReportsRetained: false,
  redacted: true,
  outcome,
  failureCode,
  passed,
  conclusion,
};

validateTrivyScanSummary(report, {
  expectedImageReference,
  expectedImageId,
  expectedConfigCommit,
  requireApproved: false,
});
await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, {
  encoding: "utf8",
  flag: "wx",
});

const githubOutputPath = process.env["GITHUB_OUTPUT"];
if (githubOutputPath) {
  await appendFile(
    githubOutputPath,
    `structurally-valid=${String(structurallyValid)}\npassed=${String(passed)}\noutcome=${outcome}\n`,
    "utf8",
  );
}
process.stdout.write(
  `${JSON.stringify({ report: outputPath, outcome, passed, redacted: true })}\n`,
);
