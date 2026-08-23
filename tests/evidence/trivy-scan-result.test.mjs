import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { access, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";

import { validateTrivyScanSummary } from "../../scripts/trivy-report-contract.mjs";

const repositoryRoot = resolve(import.meta.dirname, "../..");
const script = resolve(repositoryRoot, "scripts/write-trivy-scan-result.mjs");
const revision = "a".repeat(40);
const imageReference = `portal-dp:${revision}`;
const imageId = `sha256:${"b".repeat(64)}`;

function imageReport(vulnerabilities = []) {
  return {
    SchemaVersion: 2,
    Trivy: { Version: "0.70.0" },
    ReportID: "019c0000-0000-7000-8000-000000000001",
    CreatedAt: "2026-08-22T10:11:12Z",
    ArtifactID: `sha256:${"c".repeat(64)}`,
    ArtifactName: imageReference,
    ArtifactType: "container_image",
    Metadata: {
      ImageID: imageId,
      DiffIDs: [`sha256:${"d".repeat(64)}`],
      RepoTags: [imageReference],
      Reference: imageReference,
    },
    Results: [
      {
        Target: "portal-dp (debian 13)",
        Class: "os-pkgs",
        Type: "debian",
        Packages: [{ Name: "base-files", Version: "13.8" }],
        ...(vulnerabilities.length > 0
          ? { Vulnerabilities: vulnerabilities }
          : {}),
      },
    ],
  };
}

function configReport(misconfigurations = []) {
  return {
    SchemaVersion: 2,
    Trivy: { Version: "0.70.0" },
    ReportID: "019c0000-0000-7000-8000-000000000002",
    CreatedAt: "2026-08-22T10:11:13Z",
    ArtifactID: `sha256:${"e".repeat(64)}`,
    ArtifactName: ".",
    ArtifactType: "repository",
    Metadata: {
      RepoURL: "https://github.com/example/portal-dp",
      Commit: revision,
      Author: "Pessoa <pessoa@empresa.com.br>",
      Committer: "GitHub <noreply@github.com>",
      CommitMsg: "Mensagem livre que nao deve ser publicada",
    },
    Results: [
      {
        Target: "Dockerfile",
        Class: "config",
        Type: "dockerfile",
        MisconfSummary: {
          Successes: 31,
          Failures: misconfigurations.length,
        },
        ...(misconfigurations.length > 0
          ? { Misconfigurations: misconfigurations }
          : {}),
      },
    ],
  };
}

async function runScenario({
  image = imageReport(),
  config = configReport(),
  imageStepOutcome = "success",
  configStepOutcome = "success",
  expectedImageId = imageId,
} = {}) {
  const directory = await mkdtemp(join(tmpdir(), "portal-dp-trivy-result-"));
  const rawImage = join(directory, "raw-image.json");
  const rawConfig = join(directory, "raw-config.json");
  const summaryPath = join(directory, "summary.json");
  const approvedImage = join(directory, "approved", "trivy-image.json");
  const approvedConfig = join(directory, "approved", "trivy-config.json");
  const githubOutput = join(directory, "github-output.txt");
  if (image !== undefined) {
    await writeFile(rawImage, JSON.stringify(image), "utf8");
  }
  if (config !== undefined) {
    await writeFile(rawConfig, JSON.stringify(config), "utf8");
  }
  const execution = spawnSync(process.execPath, [script], {
    cwd: repositoryRoot,
    encoding: "utf8",
    env: {
      ...process.env,
      TRIVY_SCAN_IMAGE_REPORT_PATH: rawImage,
      TRIVY_SCAN_CONFIG_REPORT_PATH: rawConfig,
      TRIVY_SCAN_EXPECTED_IMAGE: imageReference,
      TRIVY_SCAN_EXPECTED_IMAGE_ID: expectedImageId,
      TRIVY_SCAN_EXPECTED_CONFIG_COMMIT: revision,
      TRIVY_SCAN_IMAGE_STEP_OUTCOME: imageStepOutcome,
      TRIVY_SCAN_CONFIG_STEP_OUTCOME: configStepOutcome,
      TRIVY_SCAN_OUTPUT_PATH: summaryPath,
      TRIVY_SCAN_APPROVED_IMAGE_PATH: approvedImage,
      TRIVY_SCAN_APPROVED_CONFIG_PATH: approvedConfig,
      GITHUB_OUTPUT: githubOutput,
    },
  });
  assert.equal(execution.status, 0, execution.stderr);
  await assert.rejects(access(rawImage));
  await assert.rejects(access(rawConfig));
  const serialized = await readFile(summaryPath, "utf8");
  return {
    directory,
    execution,
    summary: JSON.parse(serialized),
    serialized,
    approvedImage,
    approvedConfig,
  };
}

test("publica somente o par aprovado e remove metadados pessoais do config", async () => {
  const scenario = await runScenario();
  try {
    assert.equal(scenario.summary.passed, true);
    assert.equal(scenario.summary.rawReportsPublished, true);
    assert.deepEqual(
      validateTrivyScanSummary(scenario.summary, {
        expectedImageReference: imageReference,
        expectedImageId: imageId,
        expectedConfigCommit: revision,
        requireApproved: true,
      }),
      { allStructured: true, approved: true, outcome: "success" },
    );
    const config = JSON.parse(await readFile(scenario.approvedConfig, "utf8"));
    for (const field of ["Author", "Committer", "CommitMsg"]) {
      assert.equal(Object.hasOwn(config.Metadata, field), false);
    }
    for (const sensitive of [
      "pessoa@empresa.com.br",
      "noreply@github.com",
      "Mensagem livre que nao deve ser publicada",
    ]) {
      assert.equal(scenario.serialized.includes(sensitive), false);
      assert.equal(JSON.stringify(config).includes(sensitive), false);
    }
    await access(scenario.approvedImage);
  } finally {
    await rm(scenario.directory, { recursive: true, force: true });
  }
});

test("preserva resumo estrutural de achado sem publicar relatorios brutos", async () => {
  const scenario = await runScenario({
    image: imageReport([{ VulnerabilityID: "CVE-TEST", Severity: "HIGH" }]),
    imageStepOutcome: "failure",
  });
  try {
    assert.equal(scenario.summary.outcome, "findings");
    assert.equal(scenario.summary.reports.image.structurallyValid, true);
    assert.equal(scenario.summary.reports.image.findingCount, 1);
    assert.equal(scenario.summary.passed, false);
    assert.equal(scenario.summary.rawReportsPublished, false);
    await assert.rejects(access(scenario.approvedImage));
    await assert.rejects(access(scenario.approvedConfig));
    assert.deepEqual(validateTrivyScanSummary(scenario.summary), {
      allStructured: true,
      approved: false,
      outcome: "findings",
    });
  } finally {
    await rm(scenario.directory, { recursive: true, force: true });
  }
});

test("falha fechada para versao, ImageID ou resultado do passo incoerente", async () => {
  const cases = [
    { image: { ...imageReport(), Trivy: { Version: "0.69.3" } } },
    { expectedImageId: `sha256:${"f".repeat(64)}` },
    { expectedImageId: "" },
    { imageStepOutcome: "failure" },
  ];
  for (const item of cases) {
    const scenario = await runScenario(item);
    try {
      assert.equal(scenario.summary.outcome, "operational_failure");
      assert.equal(scenario.summary.passed, false);
      assert.equal(scenario.summary.rawReportsPublished, false);
      await assert.rejects(access(scenario.approvedImage));
      await assert.rejects(access(scenario.approvedConfig));
    } finally {
      await rm(scenario.directory, { recursive: true, force: true });
    }
  }
});
