import { createHash } from "node:crypto";
import { appendFile, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

import { aggregateContentScanDirectory } from "./content-scan-aggregate.mjs";

const allowedStepOutcomes = new Set([
  "success",
  "failure",
  "cancelled",
  "skipped",
]);
const scannerVersion = "8.30.1";
const scannerDistributionSha256 =
  "551f6fc83ea457d62a0d98237cbad105af8d557003051f41f3e7ca7b3f2470eb";
const profiles = {
  COLLECTED_EVIDENCE: ["COLLECTED_EVIDENCE"],
  GENERATED: ["BUILD_PACKAGE", "GENERATED_EVIDENCE", "TEST_FIXTURES"],
  OCI_EVIDENCE: ["OCI_EVIDENCE"],
  SAST_EVIDENCE: ["SAST_EVIDENCE"],
  SEALED_EVIDENCE: ["SEALED_EVIDENCE"],
};
const profile = process.env["GENERATED_SECRET_SCAN_PROFILE"] ?? "GENERATED";
const expectedScopes = profiles[profile];
if (!expectedScopes) {
  throw new Error("GENERATED_SECRET_SCAN_PROFILE nao e suportado");
}

const installOutcome = process.env["GENERATED_SECRET_SCAN_INSTALL_OUTCOME"];
const scanStepOutcome = process.env["GENERATED_SECRET_SCAN_STEP_OUTCOME"];
const exitCodePath = process.env["GENERATED_SECRET_SCAN_EXIT_CODE_PATH"];
const rawReportPath = process.env["GENERATED_SECRET_SCAN_REPORT_PATH"];
const scopeProofPath = process.env["GENERATED_SECRET_SCAN_SCOPE_PROOF_PATH"];
const stagedInputPath = process.env["GENERATED_SECRET_SCAN_STAGED_INPUT_PATH"];
const subjectManifestPath =
  process.env["GENERATED_SECRET_SCAN_SUBJECT_MANIFEST_PATH"];
const outputPath = resolve(
  process.env["GENERATED_SECRET_SCAN_OUTPUT_PATH"] ??
    resolve(
      import.meta.dirname,
      `../evidencias/resumos-seguranca/content-secret-scan-${profile.toLowerCase().replaceAll("_", "-")}.json`,
    ),
);

if (!installOutcome || !allowedStepOutcomes.has(installOutcome)) {
  throw new Error(
    "GENERATED_SECRET_SCAN_INSTALL_OUTCOME deve ser um resultado conhecido",
  );
}
if (!scanStepOutcome || !allowedStepOutcomes.has(scanStepOutcome)) {
  throw new Error(
    "GENERATED_SECRET_SCAN_STEP_OUTCOME deve ser um resultado conhecido",
  );
}

async function readExitCode() {
  if (!exitCodePath) return null;
  try {
    const value = (await readFile(exitCodePath, "utf8")).trim();
    if (!/^(?:0|[1-9][0-9]{0,2})$/u.test(value)) return null;
    const parsed = Number(value);
    return parsed <= 255 ? parsed : null;
  } catch {
    return null;
  }
}

async function countSarifFindings() {
  if (!rawReportPath) return null;
  try {
    const document = JSON.parse(await readFile(rawReportPath, "utf8"));
    if (
      document?.version !== "2.1.0" ||
      !Array.isArray(document.runs) ||
      document.runs.length !== 1
    ) {
      return null;
    }
    const [run] = document.runs;
    if (run?.tool?.driver?.name !== "gitleaks" || !Array.isArray(run.results)) {
      return null;
    }
    return run.results.length;
  } catch {
    return null;
  }
}

async function readScopeProof() {
  if (!scopeProofPath) return null;
  try {
    const proof = await readFile(scopeProofPath, "utf8");
    const escapedScopes = expectedScopes.join(",");
    const match = new RegExp(
      `^scopes=${escapedScopes}\\r?\\nscopeStats=([^\\r\\n]+)\\r?\\nfileCount=([1-9][0-9]*)\\r?\\nbyteCount=([1-9][0-9]*)\\r?\\naggregateSha256=([a-f0-9]{64})\\r?\\nprohibitedDataPolicy=PORTAL_DP_PROHIBITED_DATA_V2\\r?\\nprohibitedDataArchiveInspection=FAIL_CLOSED_TAR_ZIP_OCI_V1\\r?\\nprohibitedDataArchiveMaxDepth=4\\r?\\nprohibitedDataArchiveMaxEntries=50000\\r?\\nprohibitedDataArchiveMaxEntryBytes=268435456\\r?\\nprohibitedDataArchiveMaxExpandedBytes=2147483648\\r?\\nprohibitedDataArchiveMaxCompressionRatio=200\\r?\\nprohibitedDataArchiveEntryCount=(0|[1-9][0-9]*)\\r?\\nprohibitedDataExpandedByteCount=(0|[1-9][0-9]*)\\r?\\nprohibitedDataFindingCount=(0|[1-9][0-9]*)\\r?\\n?$`,
      "u",
    ).exec(proof);
    if (!match) return null;
    const scopeStats = match[1].split(",").map((item) => {
      const fields = /^([A-Z_]+):([1-9][0-9]*):([1-9][0-9]*)$/u.exec(item);
      if (!fields) return null;
      return {
        scope: fields[1],
        fileCount: Number(fields[2]),
        byteCount: Number(fields[3]),
      };
    });
    const fileCount = Number(match[2]);
    const byteCount = Number(match[3]);
    const prohibitedDataArchiveEntryCount = Number(match[5]);
    const prohibitedDataExpandedByteCount = Number(match[6]);
    const prohibitedDataFindingCount = Number(match[7]);
    if (!Number.isSafeInteger(fileCount) || !Number.isSafeInteger(byteCount)) {
      return null;
    }
    if (
      scopeStats.some((item) => item === null) ||
      JSON.stringify(scopeStats.map((item) => item.scope)) !==
        JSON.stringify(expectedScopes) ||
      scopeStats.reduce((total, item) => total + item.fileCount, 0) !==
        fileCount ||
      scopeStats.reduce((total, item) => total + item.byteCount, 0) !==
        byteCount ||
      !Number.isSafeInteger(prohibitedDataArchiveEntryCount) ||
      !Number.isSafeInteger(prohibitedDataExpandedByteCount) ||
      !Number.isSafeInteger(prohibitedDataFindingCount)
    ) {
      return null;
    }
    return {
      scopeStats,
      fileCount,
      byteCount,
      aggregateSha256: match[4],
      prohibitedDataArchiveEntryCount,
      prohibitedDataExpandedByteCount,
      prohibitedDataFindingCount,
    };
  } catch {
    return null;
  }
}

let exitCode = null;
let findingCount = null;
let gitleaksFindingCount = null;
let scopeProof = null;
let outcome = "operational_failure";
let failureCode = null;

try {
  if (installOutcome !== "success") {
    failureCode = "INSTALL_OR_INTEGRITY_FAILURE";
  } else {
    exitCode = await readExitCode();
    if (exitCode === null) {
      failureCode = "MISSING_OR_INVALID_EXIT_CODE";
    } else if (exitCode !== 0 && exitCode !== 2) {
      failureCode = "SCANNER_OPERATIONAL_ERROR";
    } else {
      scopeProof = await readScopeProof();
      gitleaksFindingCount = await countSarifFindings();
      if (scopeProof === null) {
        failureCode = "MISSING_OR_INVALID_SCOPE_PROOF";
      } else if (gitleaksFindingCount === null) {
        failureCode = "MISSING_OR_INVALID_SARIF_REPORT";
      } else {
        findingCount =
          gitleaksFindingCount + scopeProof.prohibitedDataFindingCount;
      }
      if (failureCode !== null) {
        // A causa estrutural anterior prevalece sem inferir resultado do scan.
      } else if (
        (exitCode === 0 && scanStepOutcome !== "success") ||
        (exitCode === 2 && scanStepOutcome !== "failure")
      ) {
        failureCode = "STEP_OUTCOME_MISMATCH";
      } else if (exitCode === 0 && findingCount === 0) {
        outcome = "success";
      } else if (exitCode === 2 && findingCount > 0) {
        outcome = "findings";
      } else {
        failureCode = "EXIT_CODE_REPORT_MISMATCH";
      }
    }
  }
} finally {
  // O relatório bruto e a cópia de varredura podem conter o próprio segredo.
  // Eles são eliminados antes de qualquer publicação do job.
  await Promise.all(
    [rawReportPath, exitCodePath, scopeProofPath, stagedInputPath]
      .filter((path) => typeof path === "string" && path.length > 0)
      .map((path) => rm(path, { recursive: true, force: true })),
  );
}

let sealedSubject = null;
if (profile === "SEALED_EVIDENCE") {
  if (!subjectManifestPath) {
    throw new Error(
      "GENERATED_SECRET_SCAN_SUBJECT_MANIFEST_PATH e obrigatorio para SEALED_EVIDENCE",
    );
  }
  const manifestBytes = await readFile(subjectManifestPath);
  const manifest = JSON.parse(manifestBytes.toString("utf8"));
  if (
    typeof manifest.runId !== "string" ||
    !/^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/u.test(manifest.runId)
  ) {
    throw new Error(
      "manifesto do recibo SEALED_EVIDENCE possui runId invalido",
    );
  }
  const physicalAggregate = await aggregateContentScanDirectory(
    dirname(resolve(subjectManifestPath)),
    "SEALED_EVIDENCE",
  );
  sealedSubject = {
    runId: manifest.runId,
    manifestSha256: createHash("sha256").update(manifestBytes).digest("hex"),
    aggregateSha256: physicalAggregate.aggregateSha256,
  };
  if (
    scopeProof !== null &&
    (scopeProof.aggregateSha256 !== physicalAggregate.aggregateSha256 ||
      scopeProof.fileCount !== physicalAggregate.fileCount ||
      scopeProof.byteCount !== physicalAggregate.byteCount)
  ) {
    outcome = "operational_failure";
    failureCode = "SEALED_SCOPE_AGGREGATE_MISMATCH";
  }
}

const passed = outcome === "success";
const conclusion = passed
  ? "SEM_ACHADOS_BLOQUEADORES"
  : outcome === "findings"
    ? "NAO_APROVADA_ACHADO_DE_SEGREDO"
    : "NAO_APROVADA_FALHA_OPERACIONAL";

// Só metadados de decisão e cobertura sobrevivem; nenhum caminho ou trecho
// descoberto pelo scanner é copiado para esta evidência sanitizada.
const report = {
  schemaVersion: 1,
  reportType: "CONTENT_SECRET_SCAN_RESULT",
  profile,
  scanner: "gitleaks-cli+portal-dp-prohibited-data",
  scannerVersion,
  scannerDistributionSha256,
  integrityVerified: installOutcome === "success",
  scannerVersionVerified: installOutcome === "success",
  scanMode: "directory-with-archives",
  scopes: expectedScopes,
  scopeStats: scopeProof?.scopeStats ?? null,
  fileCount: scopeProof?.fileCount ?? null,
  byteCount: scopeProof?.byteCount ?? null,
  aggregateSha256: scopeProof?.aggregateSha256 ?? null,
  prohibitedDataPolicy: "PORTAL_DP_PROHIBITED_DATA_V2",
  prohibitedDataArchiveInspection: "FAIL_CLOSED_TAR_ZIP_OCI_V1",
  prohibitedDataArchiveMaxDepth: 4,
  prohibitedDataArchiveMaxEntries: 50_000,
  prohibitedDataArchiveMaxEntryBytes: 268_435_456,
  prohibitedDataArchiveMaxExpandedBytes: 2_147_483_648,
  prohibitedDataArchiveMaxCompressionRatio: 200,
  prohibitedDataArchiveEntryCount:
    scopeProof?.prohibitedDataArchiveEntryCount ?? null,
  prohibitedDataExpandedByteCount:
    scopeProof?.prohibitedDataExpandedByteCount ?? null,
  prohibitedDataFindingCount: scopeProof?.prohibitedDataFindingCount ?? null,
  configurationPolicy: "BUILT_IN_DEFAULT_NO_REPOSITORY_OVERRIDES",
  gitleaksAllowIgnored: true,
  archiveDepth: 3,
  decodeDepth: 2,
  timeoutSeconds: 300,
  reportFormat: "sarif-2.1.0-temporary",
  redacted: true,
  rawReportRetained: false,
  stagedInputRetained: false,
  installOutcome,
  scanStepOutcome,
  exitCode,
  gitleaksFindingCount,
  findingCount,
  outcome,
  failureCode,
  passed,
  conclusion,
};
if (sealedSubject !== null) {
  // O recibo fica fora do pacote e vincula simultaneamente identidade,
  // manifesto, inventario fisico examinado e a decisao produzida pelo scan.
  report.subject = {
    ...sealedSubject,
    outcome,
    passed,
    conclusion,
  };
}

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
