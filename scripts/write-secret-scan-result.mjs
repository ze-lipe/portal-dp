import { appendFile, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const allowedStepOutcomes = new Set([
  "success",
  "failure",
  "cancelled",
  "skipped",
]);
const scannerVersion = "8.24.3";
const scannerDistributionSha256 =
  "9991e0b2903da4c8f6122b5c3186448b927a5da4deef1fe45271c3793f4ee29c";

const installOutcome = process.env["SECRET_SCAN_INSTALL_OUTCOME"];
const scanStepOutcome = process.env["SECRET_SCAN_STEP_OUTCOME"];
const exitCodePath = process.env["SECRET_SCAN_EXIT_CODE_PATH"];
const rawReportPath = process.env["SECRET_SCAN_REPORT_PATH"];
const scopeProofPath = process.env["SECRET_SCAN_SCOPE_PATH"];
const streamCountPath = process.env["SECRET_SCAN_STREAM_COUNT_PATH"];
const gitStderrPath = process.env["SECRET_SCAN_GIT_STDERR_PATH"];
const outputPath = resolve(
  process.env["SECRET_SCAN_OUTPUT_PATH"] ??
    resolve(
      import.meta.dirname,
      "../evidencias/resultados/gitleaks-result.json",
    ),
);

if (!installOutcome || !allowedStepOutcomes.has(installOutcome)) {
  throw new Error(
    "SECRET_SCAN_INSTALL_OUTCOME deve ser um resultado conhecido",
  );
}
if (!scanStepOutcome || !allowedStepOutcomes.has(scanStepOutcome)) {
  throw new Error("SECRET_SCAN_STEP_OUTCOME deve ser um resultado conhecido");
}

let exitCode = null;
let findingCount = null;
let repositoryCommitCount = null;
let repositoryGitStreamBytes = null;
let repositoryNotShallowVerified = false;
let outcome = "operational_failure";
let failureCode = null;

async function readExitCode() {
  if (!exitCodePath) return null;
  try {
    const value = (await readFile(exitCodePath, "utf8")).trim();
    if (!/^(?:0|[1-9][0-9]{0,2})$/.test(value)) return null;
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
    const match =
      /^isShallow=false\r?\ncommitCount=([1-9][0-9]*)\r?\nstreamBytes=([1-9][0-9]*)\r?\n?$/.exec(
        proof,
      );
    if (!match) return null;
    const commitCount = Number(match[1]);
    const streamBytes = Number(match[2]);
    if (
      !Number.isSafeInteger(commitCount) ||
      !Number.isSafeInteger(streamBytes)
    ) {
      return null;
    }
    return { commitCount, streamBytes };
  } catch {
    return null;
  }
}

try {
  if (installOutcome !== "success") {
    failureCode = "INSTALL_OR_INTEGRITY_FAILURE";
  } else {
    exitCode = await readExitCode();
    if (exitCode === null) {
      failureCode = "MISSING_OR_INVALID_EXIT_CODE";
    } else if (exitCode !== 0 && exitCode !== 2) {
      failureCode =
        exitCode === 90
          ? "SHALLOW_OR_INVALID_REPOSITORY"
          : exitCode === 91
            ? "UNAPPROVED_SCANNER_OVERRIDE"
            : exitCode === 92
              ? "MISSING_OR_INVALID_GIT_STREAM_PROOF"
              : "SCANNER_OPERATIONAL_ERROR";
    } else {
      const scopeProof = await readScopeProof();
      repositoryCommitCount = scopeProof?.commitCount ?? null;
      repositoryGitStreamBytes = scopeProof?.streamBytes ?? null;
      repositoryNotShallowVerified = scopeProof !== null;
      findingCount = await countSarifFindings();
      if (!repositoryNotShallowVerified) {
        failureCode = "MISSING_OR_INVALID_SCOPE_PROOF";
      } else if (findingCount === null) {
        failureCode = "MISSING_OR_INVALID_SARIF_REPORT";
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
  // O SARIF pode conter caminhos e contexto sensível. Ele nunca vira artefato.
  await Promise.all(
    [
      rawReportPath,
      exitCodePath,
      scopeProofPath,
      streamCountPath,
      gitStderrPath,
    ]
      .filter((path) => typeof path === "string" && path.length > 0)
      .map((path) => rm(path, { force: true })),
  );
}

const passed = outcome === "success";
const conclusion = passed
  ? "SEM_ACHADOS_BLOQUEADORES"
  : outcome === "findings"
    ? "NAO_APROVADA_ACHADO_DE_SEGREDO"
    : "NAO_APROVADA_FALHA_OPERACIONAL";

// A evidência preserva apenas metadados suficientes para a decisão do gate.
const report = {
  schemaVersion: 2,
  scanner: "gitleaks-cli",
  scannerVersion,
  scannerDistributionSha256,
  integrityVerified: installOutcome === "success",
  scannerVersionVerified: installOutcome === "success",
  scope: "full-git-history-all-refs-streamed",
  repositoryNotShallowVerified,
  repositoryCommitCount,
  repositoryGitStreamBytes,
  gitLogOptions: [
    "-p",
    "-U0",
    "--full-history",
    "--all",
    "--diff-filter=tuxdb",
  ],
  configurationPolicy: "BUILT_IN_DEFAULT_NO_REPOSITORY_OVERRIDES",
  gitleaksAllowIgnored: true,
  decodeDepth: 2,
  timeoutSeconds: 300,
  reportFormat: "sarif-2.1.0-temporary",
  redacted: true,
  rawReportRetained: false,
  installOutcome,
  scanStepOutcome,
  exitCode,
  findingCount,
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
