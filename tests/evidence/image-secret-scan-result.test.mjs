import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { access, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";

const repositoryRoot = resolve(import.meta.dirname, "../..");
const script = resolve(
  repositoryRoot,
  "scripts/write-image-secret-scan-result.mjs",
);
const imageReference = `portal-dp:${"e".repeat(40)}`;
const imageId = `sha256:${"a".repeat(64)}`;

function rawReport(results = []) {
  return {
    SchemaVersion: 2,
    Trivy: { Version: "0.70.0" },
    ArtifactName: imageReference,
    ArtifactType: "container_image",
    Metadata: {
      ImageID: imageId,
      DiffIDs: [`sha256:${"b".repeat(64)}`, `sha256:${"c".repeat(64)}`],
      RepoTags: [imageReference],
    },
    Results: results,
  };
}

async function runScenario({
  stepOutcome = "success",
  report = rawReport(),
  expectedImageId = imageId,
} = {}) {
  const directory = await mkdtemp(join(tmpdir(), "portal-dp-image-secret-"));
  const rawPath = join(directory, "raw.json");
  const outputPath = join(directory, "summary.json");
  const githubOutputPath = join(directory, "github-output.txt");
  if (report !== undefined) {
    await writeFile(
      rawPath,
      typeof report === "string" ? report : `${JSON.stringify(report)}\n`,
      "utf8",
    );
  }
  const execution = spawnSync(process.execPath, [script], {
    cwd: repositoryRoot,
    encoding: "utf8",
    env: {
      ...process.env,
      IMAGE_SECRET_SCAN_STEP_OUTCOME: stepOutcome,
      IMAGE_SECRET_SCAN_REPORT_PATH: rawPath,
      IMAGE_SECRET_SCAN_EXPECTED_IMAGE: imageReference,
      IMAGE_SECRET_SCAN_EXPECTED_IMAGE_ID: expectedImageId,
      IMAGE_SECRET_SCAN_OUTPUT_PATH: outputPath,
      GITHUB_OUTPUT: githubOutputPath,
    },
  });
  assert.equal(execution.status, 0, execution.stderr);
  const serialized = await readFile(outputPath, "utf8");
  const summary = JSON.parse(serialized);
  await assert.rejects(access(rawPath));
  return { directory, summary, serialized, stdout: execution.stdout };
}

test("aprova a imagem real com camadas e zero segredo", async () => {
  const scenario = await runScenario({
    report: rawReport([{ Target: "portal-dp (debian 13)", Class: "secret" }]),
  });
  assert.equal(scenario.summary.reportType, "IMAGE_LAYER_SECRET_SCAN_RESULT");
  assert.equal(scenario.summary.imageLayerCount, 2);
  assert.equal(scenario.summary.imageId, imageId);
  assert.equal(scenario.summary.expectedImageId, imageId);
  assert.equal(scenario.summary.scannerVersionObserved, "0.70.0");
  assert.equal(scenario.summary.scannerVersionVerified, true);
  assert.equal(scenario.summary.findingCount, 0);
  assert.equal(scenario.summary.passed, true);
  await rm(scenario.directory, { recursive: true, force: true });
});

test("reprova achado sem preservar trecho, caminho ou identificador", async () => {
  const sensitiveValue = ["valor", "real", "nao", "publicar"].join("-");
  const sensitivePath = ["app", "private", "credential"].join("/");
  const scenario = await runScenario({
    stepOutcome: "failure",
    report: rawReport([
      {
        Target: sensitivePath,
        Class: "secret",
        Secrets: [
          { RuleID: "private-key", Match: sensitiveValue, StartLine: 10 },
        ],
      },
    ]),
  });
  assert.equal(scenario.summary.outcome, "findings");
  assert.equal(scenario.summary.findingCount, 1);
  assert.equal(scenario.summary.passed, false);
  for (const value of [sensitiveValue, sensitivePath]) {
    assert.equal(scenario.serialized.includes(value), false);
    assert.equal(scenario.stdout.includes(value), false);
  }
  await rm(scenario.directory, { recursive: true, force: true });
});

test("falha fechada para relatório ausente, escopo trocado ou resultado incoerente", async () => {
  const scenarios = [
    { report: null, expected: "MISSING_OR_INVALID_TRIVY_REPORT" },
    {
      report: { ...rawReport(), ArtifactType: "filesystem" },
      expected: "MISSING_OR_INVALID_TRIVY_REPORT",
    },
    {
      stepOutcome: "failure",
      report: rawReport(),
      expected: "STEP_OUTCOME_REPORT_MISMATCH",
    },
    {
      report: rawReport([{ Target: "x", Vulnerabilities: [] }]),
      expected: "MISSING_OR_INVALID_TRIVY_REPORT",
    },
    {
      report: { ...rawReport(), Trivy: { Version: "0.69.3" } },
      expected: "MISSING_OR_INVALID_TRIVY_REPORT",
    },
    {
      expectedImageId: `sha256:${"f".repeat(64)}`,
      expected: "MISSING_OR_INVALID_TRIVY_REPORT",
    },
    {
      expectedImageId: "",
      expected: "MISSING_OR_INVALID_EXPECTED_IMAGE_ID",
    },
  ];
  for (const item of scenarios) {
    const scenario = await runScenario(item);
    assert.equal(scenario.summary.failureCode, item.expected);
    assert.equal(scenario.summary.passed, false);
    await rm(scenario.directory, { recursive: true, force: true });
  }
});
