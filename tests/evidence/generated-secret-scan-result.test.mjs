import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  access,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { aggregateContentScanDirectory } from "../../scripts/content-scan-aggregate.mjs";
import { validateSealedEvidenceScanReceipt } from "../../scripts/validate-sealed-evidence-scan-receipt.mjs";

const repositoryRoot = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const scriptPath = resolve(
  repositoryRoot,
  "scripts/write-generated-secret-scan-result.mjs",
);

function sarifWithResults(results) {
  return {
    version: "2.1.0",
    runs: [{ tool: { driver: { name: "gitleaks" } }, results }],
  };
}

async function runScenario({
  installOutcome = "success",
  scanStepOutcome = "success",
  exitCode = 0,
  sarif = sarifWithResults([]),
  scopeProof = true,
  prohibitedDataFindingCount = 0,
  profile = "GENERATED",
} = {}) {
  const directory = await mkdtemp(
    join(tmpdir(), "portal-dp-generated-secret-scan-"),
  );
  const exitCodePath = join(directory, "exit-code.txt");
  const sarifPath = join(directory, "raw.sarif");
  const scopeProofPath = join(directory, "scope.txt");
  const stagedInputPath = join(directory, "staged-input");
  const outputPath = join(directory, "sanitized.json");
  const githubOutputPath = join(directory, "github-output.txt");

  let subjectManifestPath;
  let sealedCoverage;
  if (profile === "SEALED_EVIDENCE") {
    const sealedDirectory = join(directory, "sealed-run-a");
    subjectManifestPath = join(sealedDirectory, "manifest.json");
    await mkdir(join(sealedDirectory, "objects"), { recursive: true });
    await writeFile(
      subjectManifestPath,
      `${JSON.stringify({ runId: "run-a" })}\n`,
      "utf8",
    );
    await writeFile(
      join(sealedDirectory, "objects", "evidence.bin"),
      "evidência selada A\n",
      "utf8",
    );
    sealedCoverage = await aggregateContentScanDirectory(
      sealedDirectory,
      "SEALED_EVIDENCE",
    );
  }

  await writeFile(exitCodePath, `${exitCode}\n`, "utf8");
  await writeFile(sarifPath, `${JSON.stringify(sarif)}\n`, "utf8");
  if (scopeProof) {
    const proofScopes =
      profile === "SEALED_EVIDENCE"
        ? ["SEALED_EVIDENCE"]
        : ["BUILD_PACKAGE", "GENERATED_EVIDENCE", "TEST_FIXTURES"];
    const proofScopeStats = sealedCoverage
      ? `SEALED_EVIDENCE:${sealedCoverage.fileCount}:${sealedCoverage.byteCount}`
      : "BUILD_PACKAGE:2:1024,GENERATED_EVIDENCE:3:2048,TEST_FIXTURES:2:1024";
    await writeFile(
      scopeProofPath,
      [
        `scopes=${proofScopes.join(",")}`,
        `scopeStats=${proofScopeStats}`,
        `fileCount=${sealedCoverage?.fileCount ?? 7}`,
        `byteCount=${sealedCoverage?.byteCount ?? 4096}`,
        `aggregateSha256=${sealedCoverage?.aggregateSha256 ?? "a".repeat(64)}`,
        "prohibitedDataPolicy=PORTAL_DP_PROHIBITED_DATA_V2",
        "prohibitedDataArchiveInspection=FAIL_CLOSED_TAR_ZIP_OCI_V1",
        "prohibitedDataArchiveMaxDepth=4",
        "prohibitedDataArchiveMaxEntries=50000",
        "prohibitedDataArchiveMaxEntryBytes=268435456",
        "prohibitedDataArchiveMaxExpandedBytes=2147483648",
        "prohibitedDataArchiveMaxCompressionRatio=200",
        "prohibitedDataArchiveEntryCount=3",
        "prohibitedDataExpandedByteCount=1536",
        `prohibitedDataFindingCount=${prohibitedDataFindingCount}`,
        "",
      ].join("\n"),
      "utf8",
    );
  }
  await writeFile(stagedInputPath, "conteúdo temporário", "utf8");

  const execution = spawnSync(process.execPath, [scriptPath], {
    cwd: repositoryRoot,
    encoding: "utf8",
    env: {
      ...process.env,
      GENERATED_SECRET_SCAN_INSTALL_OUTCOME: installOutcome,
      GENERATED_SECRET_SCAN_STEP_OUTCOME: scanStepOutcome,
      GENERATED_SECRET_SCAN_EXIT_CODE_PATH: exitCodePath,
      GENERATED_SECRET_SCAN_REPORT_PATH: sarifPath,
      GENERATED_SECRET_SCAN_SCOPE_PROOF_PATH: scopeProofPath,
      GENERATED_SECRET_SCAN_STAGED_INPUT_PATH: stagedInputPath,
      GENERATED_SECRET_SCAN_OUTPUT_PATH: outputPath,
      GENERATED_SECRET_SCAN_PROFILE: profile,
      ...(subjectManifestPath
        ? {
            GENERATED_SECRET_SCAN_SUBJECT_MANIFEST_PATH: subjectManifestPath,
          }
        : {}),
      GITHUB_OUTPUT: githubOutputPath,
    },
  });

  assert.equal(execution.status, 0, execution.stderr);
  const serializedReport = await readFile(outputPath, "utf8");
  const report = JSON.parse(serializedReport);
  const githubOutput = await readFile(githubOutputPath, "utf8");
  for (const path of [
    exitCodePath,
    sarifPath,
    scopeProofPath,
    stagedInputPath,
  ]) {
    await assert.rejects(access(path));
  }
  return {
    directory,
    report,
    serializedReport,
    stdout: execution.stdout,
    githubOutput,
    outputPath,
    subjectManifestPath,
  };
}

test("aprova pacote, fixtures e evidências geradas somente após varredura limpa", async () => {
  const scenario = await runScenario();
  assert.equal(scenario.report.reportType, "CONTENT_SECRET_SCAN_RESULT");
  assert.equal(scenario.report.profile, "GENERATED");
  assert.deepEqual(scenario.report.scopes, [
    "BUILD_PACKAGE",
    "GENERATED_EVIDENCE",
    "TEST_FIXTURES",
  ]);
  assert.equal(scenario.report.fileCount, 7);
  assert.equal(scenario.report.byteCount, 4096);
  assert.equal(scenario.report.prohibitedDataFindingCount, 0);
  assert.equal(
    scenario.report.prohibitedDataArchiveInspection,
    "FAIL_CLOSED_TAR_ZIP_OCI_V1",
  );
  assert.equal(scenario.report.prohibitedDataArchiveEntryCount, 3);
  assert.equal(scenario.report.prohibitedDataExpandedByteCount, 1536);
  assert.equal(scenario.report.passed, true);
  assert.match(scenario.githubOutput, /^passed=true$/mu);
  await rm(scenario.directory, { recursive: true, force: true });
});

test("reprova dado proibido sem copiar o valor para a evidência", async () => {
  const scenario = await runScenario({
    scanStepOutcome: "failure",
    exitCode: 2,
    prohibitedDataFindingCount: 2,
  });
  assert.equal(scenario.report.gitleaksFindingCount, 0);
  assert.equal(scenario.report.prohibitedDataFindingCount, 2);
  assert.equal(scenario.report.findingCount, 2);
  assert.equal(scenario.report.outcome, "findings");
  assert.equal(scenario.report.passed, false);
  await rm(scenario.directory, { recursive: true, force: true });
});

test("aceita perfil fechado de evidência coletada", async () => {
  const scenario = await runScenario({
    profile: "COLLECTED_EVIDENCE",
    scopeProof: false,
  });
  assert.equal(scenario.report.profile, "COLLECTED_EVIDENCE");
  assert.equal(scenario.report.failureCode, "MISSING_OR_INVALID_SCOPE_PROOF");
  assert.equal(scenario.report.passed, false);
  await rm(scenario.directory, { recursive: true, force: true });
});

test("vincula o recibo SEALED_EVIDENCE ao run e rejeita recibo trocado", async () => {
  const scenario = await runScenario({ profile: "SEALED_EVIDENCE" });
  try {
    assert.equal(scenario.report.subject.runId, "run-a");
    assert.equal(
      scenario.report.subject.aggregateSha256,
      scenario.report.aggregateSha256,
    );
    const accepted = await validateSealedEvidenceScanReceipt({
      manifestPath: scenario.subjectManifestPath,
      receiptPath: scenario.outputPath,
    });
    assert.equal(accepted.passed, true);

    const swappedDirectory = join(scenario.directory, "sealed-run-b");
    const swappedManifestPath = join(swappedDirectory, "manifest.json");
    await mkdir(join(swappedDirectory, "objects"), { recursive: true });
    await writeFile(
      swappedManifestPath,
      `${JSON.stringify({ runId: "run-b" })}\n`,
      "utf8",
    );
    await writeFile(
      join(swappedDirectory, "objects", "evidence.bin"),
      "evidência selada B\n",
      "utf8",
    );

    await assert.rejects(
      validateSealedEvidenceScanReceipt({
        manifestPath: swappedManifestPath,
        receiptPath: scenario.outputPath,
      }),
      /recibo SEALED_EVIDENCE nao corresponde/u,
    );
  } finally {
    await rm(scenario.directory, { recursive: true, force: true });
  }
});

test("não persiste conteúdo sensível encontrado no pacote gerado", async () => {
  const sensitiveValue = ["segredo", "gerado", "nao", "publicar"].join("-");
  const sensitivePath = ["evidencias", "privadas", "resultado"].join("/");
  const scenario = await runScenario({
    scanStepOutcome: "failure",
    exitCode: 2,
    sarif: sarifWithResults([
      {
        message: { text: sensitiveValue },
        locations: [
          { physicalLocation: { artifactLocation: { uri: sensitivePath } } },
        ],
      },
    ]),
  });

  assert.equal(scenario.report.outcome, "findings");
  assert.equal(scenario.report.passed, false);
  for (const value of [sensitiveValue, sensitivePath]) {
    assert.equal(scenario.serializedReport.includes(value), false);
    assert.equal(scenario.stdout.includes(value), false);
    assert.equal(scenario.githubOutput.includes(value), false);
  }
  await rm(scenario.directory, { recursive: true, force: true });
});

test("falha fechada se cobertura, scanner ou relatório bruto não forem comprovados", async () => {
  const scenarios = [
    {
      installOutcome: "failure",
      scanStepOutcome: "skipped",
      exitCode: 1,
      sarif: sarifWithResults([]),
      expected: "INSTALL_OR_INTEGRITY_FAILURE",
    },
    { scopeProof: false, expected: "MISSING_OR_INVALID_SCOPE_PROOF" },
    {
      sarif: { version: "2.1.0", runs: [] },
      expected: "MISSING_OR_INVALID_SARIF_REPORT",
    },
    {
      scanStepOutcome: "failure",
      exitCode: 124,
      expected: "SCANNER_OPERATIONAL_ERROR",
    },
  ];

  for (const item of scenarios) {
    const scenario = await runScenario(item);
    assert.equal(scenario.report.failureCode, item.expected);
    assert.equal(scenario.report.passed, false);
    await rm(scenario.directory, { recursive: true, force: true });
  }
});
