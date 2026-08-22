import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { access, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const scriptPath = resolve(
  repositoryRoot,
  "scripts/write-secret-scan-result.mjs",
);
const forwardStreamScriptPath = resolve(
  repositoryRoot,
  "scripts/forward-counted-stream.mjs",
);

async function runScenario({
  installOutcome,
  scanStepOutcome,
  exitCode,
  sarif,
  scopeProof = { isShallow: false, commitCount: 4, streamBytes: 4096 },
}) {
  const temporaryDirectory = await mkdtemp(
    join(tmpdir(), "portal-dp-secret-scan-"),
  );
  const exitCodePath = join(temporaryDirectory, "exit-code.txt");
  const sarifPath = join(temporaryDirectory, "raw.sarif");
  const scopeProofPath = join(temporaryDirectory, "scope.txt");
  const streamCountPath = join(temporaryDirectory, "stream-count.txt");
  const gitStderrPath = join(temporaryDirectory, "git-log.stderr");
  const outputPath = join(temporaryDirectory, "sanitized.json");
  const githubOutputPath = join(temporaryDirectory, "github-output.txt");

  if (exitCode !== undefined) {
    await writeFile(exitCodePath, `${exitCode}\n`, "utf8");
  }
  if (sarif !== undefined) {
    await writeFile(
      sarifPath,
      typeof sarif === "string" ? sarif : `${JSON.stringify(sarif)}\n`,
      "utf8",
    );
  }
  if (scopeProof !== null) {
    await writeFile(
      scopeProofPath,
      `isShallow=${scopeProof.isShallow}\ncommitCount=${scopeProof.commitCount}\nstreamBytes=${scopeProof.streamBytes}\n`,
      "utf8",
    );
    await writeFile(streamCountPath, `${scopeProof.streamBytes}\n`, "utf8");
    await writeFile(gitStderrPath, "", "utf8");
  }

  const execution = spawnSync(process.execPath, [scriptPath], {
    cwd: repositoryRoot,
    encoding: "utf8",
    env: {
      ...process.env,
      SECRET_SCAN_INSTALL_OUTCOME: installOutcome,
      SECRET_SCAN_STEP_OUTCOME: scanStepOutcome,
      SECRET_SCAN_EXIT_CODE_PATH: exitCodePath,
      SECRET_SCAN_REPORT_PATH: sarifPath,
      SECRET_SCAN_SCOPE_PATH: scopeProofPath,
      SECRET_SCAN_STREAM_COUNT_PATH: streamCountPath,
      SECRET_SCAN_GIT_STDERR_PATH: gitStderrPath,
      SECRET_SCAN_OUTPUT_PATH: outputPath,
      GITHUB_OUTPUT: githubOutputPath,
    },
  });

  assert.equal(execution.status, 0, execution.stderr);
  const serializedReport = await readFile(outputPath, "utf8");
  const report = JSON.parse(serializedReport);
  const githubOutput = await readFile(githubOutputPath, "utf8");

  // Os insumos temporários não podem sobreviver como artefatos do job.
  await assert.rejects(access(sarifPath));
  await assert.rejects(access(exitCodePath));
  await assert.rejects(access(scopeProofPath));
  await assert.rejects(access(streamCountPath));
  await assert.rejects(access(gitStderrPath));

  return {
    temporaryDirectory,
    report,
    serializedReport,
    githubOutput,
    stdout: execution.stdout,
  };
}

function sarifWithResults(results) {
  return {
    version: "2.1.0",
    runs: [{ tool: { driver: { name: "gitleaks" } }, results }],
  };
}

test("encaminha o fluxo Git sem persistir conteúdo e registra só a contagem", async () => {
  const temporaryDirectory = await mkdtemp(
    join(tmpdir(), "portal-dp-counted-stream-"),
  );
  const countPath = join(temporaryDirectory, "count.txt");
  const payload = Buffer.from(
    ["diff --git a/exemplo b/exemplo\n", "+linha de teste\n"].join(""),
  );
  const execution = spawnSync(
    process.execPath,
    [forwardStreamScriptPath, countPath],
    {
      cwd: repositoryRoot,
      input: payload,
    },
  );

  assert.equal(execution.status, 0, execution.stderr.toString("utf8"));
  assert.deepEqual(execution.stdout, payload);
  assert.equal(
    (await readFile(countPath, "utf8")).trim(),
    String(payload.length),
  );
  await rm(temporaryDirectory, { recursive: true, force: true });
});

test("aprova somente varredura integral concluída e sem achados", async () => {
  const scenario = await runScenario({
    installOutcome: "success",
    scanStepOutcome: "success",
    exitCode: 0,
    sarif: sarifWithResults([]),
  });

  assert.equal(scenario.report.schemaVersion, 2);
  assert.equal(scenario.report.scope, "full-git-history-all-refs-streamed");
  assert.equal(scenario.report.repositoryNotShallowVerified, true);
  assert.equal(scenario.report.repositoryCommitCount, 4);
  assert.equal(scenario.report.repositoryGitStreamBytes, 4096);
  assert.equal(scenario.report.findingCount, 0);
  assert.equal(scenario.report.failureCode, null);
  assert.equal(scenario.report.passed, true);
  assert.match(scenario.githubOutput, /^passed=true$/m);
  await rm(scenario.temporaryDirectory, { recursive: true, force: true });
});

test("reprova achado sem copiar o conteúdo sensível para a evidência", async () => {
  const sensitiveValue = ["valor", "sensivel", "nao", "persistir"].join("-");
  const sensitivePath = ["caminho", "privado", "fixture"].join("/");
  const sensitiveEmail = ["autor", "interno"].join("@").concat(".invalid");
  const sensitiveMessage = ["mensagem", "sigilosa", "commit"].join("-");
  const scenario = await runScenario({
    installOutcome: "success",
    scanStepOutcome: "failure",
    exitCode: 2,
    sarif: sarifWithResults([
      {
        message: { text: sensitiveValue },
        locations: [
          { physicalLocation: { artifactLocation: { uri: sensitivePath } } },
        ],
        properties: { email: sensitiveEmail, commitMessage: sensitiveMessage },
      },
    ]),
  });

  assert.equal(scenario.report.outcome, "findings");
  assert.equal(scenario.report.findingCount, 1);
  assert.equal(scenario.report.passed, false);
  for (const value of [
    sensitiveValue,
    sensitivePath,
    sensitiveEmail,
    sensitiveMessage,
  ]) {
    assert.equal(scenario.serializedReport.includes(value), false);
    assert.equal(scenario.stdout.includes(value), false);
    assert.equal(scenario.githubOutput.includes(value), false);
  }
  assert.match(scenario.githubOutput, /^passed=false$/m);
  await rm(scenario.temporaryDirectory, { recursive: true, force: true });
});

test("falha fechada quando instalação ou integridade não é aprovada", async () => {
  const scenario = await runScenario({
    installOutcome: "failure",
    scanStepOutcome: "skipped",
  });

  assert.equal(scenario.report.outcome, "operational_failure");
  assert.equal(scenario.report.failureCode, "INSTALL_OR_INTEGRITY_FAILURE");
  assert.equal(scenario.report.findingCount, null);
  assert.equal(scenario.report.passed, false);
  await rm(scenario.temporaryDirectory, { recursive: true, force: true });
});

test("distingue erros operacionais do scanner de um achado", async () => {
  for (const exitCode of [1, 124, 137]) {
    const scenario = await runScenario({
      installOutcome: "success",
      scanStepOutcome: "failure",
      exitCode,
    });

    assert.equal(scenario.report.outcome, "operational_failure");
    assert.equal(scenario.report.failureCode, "SCANNER_OPERATIONAL_ERROR");
    assert.equal(scenario.report.findingCount, null);
    assert.equal(scenario.report.passed, false);
    await rm(scenario.temporaryDirectory, { recursive: true, force: true });
  }
});

test("reprova inconsistência entre código de saída e relatório", async () => {
  const scenario = await runScenario({
    installOutcome: "success",
    scanStepOutcome: "success",
    exitCode: 0,
    sarif: sarifWithResults([{}]),
  });

  assert.equal(scenario.report.outcome, "operational_failure");
  assert.equal(scenario.report.failureCode, "EXIT_CODE_REPORT_MISMATCH");
  assert.equal(scenario.report.passed, false);
  await rm(scenario.temporaryDirectory, { recursive: true, force: true });
});

test("reprova SARIF ausente, malformado ou com identidade inesperada", async () => {
  const documents = [
    undefined,
    "{",
    { version: "2.1.0", runs: [] },
    { version: "2.1.0", runs: [{ results: [] }, { results: [] }] },
    {
      version: "2.1.0",
      runs: [{ tool: { driver: { name: "outro-scanner" } }, results: [] }],
    },
  ];

  for (const sarif of documents) {
    const scenario = await runScenario({
      installOutcome: "success",
      scanStepOutcome: "success",
      exitCode: 0,
      sarif,
    });
    assert.equal(
      scenario.report.failureCode,
      "MISSING_OR_INVALID_SARIF_REPORT",
    );
    assert.equal(scenario.report.passed, false);
    await rm(scenario.temporaryDirectory, { recursive: true, force: true });
  }
});

test("reprova divergências de achado e resultado da etapa", async () => {
  const scenarios = [
    {
      scanStepOutcome: "failure",
      exitCode: 2,
      sarif: sarifWithResults([]),
      failureCode: "EXIT_CODE_REPORT_MISMATCH",
    },
    {
      scanStepOutcome: "success",
      exitCode: 2,
      sarif: sarifWithResults([{}]),
      failureCode: "STEP_OUTCOME_MISMATCH",
    },
  ];

  for (const item of scenarios) {
    const scenario = await runScenario({
      installOutcome: "success",
      ...item,
    });
    assert.equal(scenario.report.failureCode, item.failureCode);
    assert.equal(scenario.report.passed, false);
    await rm(scenario.temporaryDirectory, { recursive: true, force: true });
  }
});

test("reprova comprovante vazio do fluxo Git", async () => {
  const scenario = await runScenario({
    installOutcome: "success",
    scanStepOutcome: "success",
    exitCode: 0,
    sarif: sarifWithResults([]),
    scopeProof: { isShallow: false, commitCount: 4, streamBytes: 0 },
  });

  assert.equal(scenario.report.failureCode, "MISSING_OR_INVALID_SCOPE_PROOF");
  assert.equal(scenario.report.passed, false);
  await rm(scenario.temporaryDirectory, { recursive: true, force: true });
});
