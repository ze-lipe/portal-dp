import assert from "node:assert/strict";
import {
  chmod,
  mkdtemp,
  mkdir,
  readFile,
  stat,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import test from "node:test";

import {
  finalizeEvidenceRun,
  sha256Bytes,
  validateEvidenceRun,
} from "../../scripts/evidence-repository.mjs";
import { removeHardenedFixture } from "./remove-hardened-fixture.mjs";

const FIXED_TIME = "2026-08-22T12:00:00.000Z";
const HASH_A = "a".repeat(64);
const HASH_B = "b".repeat(64);
const EXPECTED_SBOM_COMPONENTS = [
  "api",
  "contracts",
  "database",
  "domain",
  "integrations",
  "observability",
  "portal-dp",
  "storage",
  "testing",
  "web",
  "worker",
];

async function fixture() {
  const root = await mkdtemp(join(tmpdir(), "portal-dp-evidence-"));
  const source = join(root, "source");
  const repository = join(root, "repository");
  const bindings = join(root, "bindings.json");
  const asvs = join(root, "asvs.json");
  await mkdir(source, { recursive: true });
  await writeFile(
    bindings,
    `${JSON.stringify({
      schemaVersion: 1,
      bindingsVersion: "TEST/1.0.0",
      rules: [{ id: "TEST-CASE", match: "**/*.json", cases: ["QAT-DOC-009"] }],
    })}\n`,
  );
  await writeFile(
    asvs,
    `${JSON.stringify({
      approval: {
        status: "AGUARDA_APROVACAO_SEGURANCA",
        responsible: null,
        approvedAt: null,
      },
    })}\n`,
  );
  return { root, source, repository, bindings, asvs };
}

function options(paths, runId, supersedesManifestPath) {
  return {
    runId,
    scope: "ETP-00",
    sourceDirectory: paths.source,
    outputRoot: paths.repository,
    bindingsPath: paths.bindings,
    supersedesManifestPath,
    replacementReason: supersedesManifestPath
      ? "Correção do relatório"
      : undefined,
    asvsManifestPath: paths.asvs,
    generatedAt: FIXED_TIME,
    execution: {
      provider: "test",
      repository: "portal-dp/test",
      revision: "1".repeat(40),
      ref: "refs/heads/test",
      workflow: "test",
      attempt: "1",
      outcomes: { tests: "success" },
      metadata: { synthetic: true },
    },
    responsible: {
      role: "QA",
      identity: {
        provider: "test",
        subject: "actor-id:1",
        displayName: "Test Runner",
      },
    },
    versions: {
      application: "0.0.0-test",
      schema: { version: "schema-v1", sha256: HASH_A },
      fixture: { version: "fixture-v1", sha256: HASH_B },
    },
    accessControl: {
      id: "ACL-EVIDENCE-GENERAL",
      immutable: true,
      classification: "INTERNO_RESTRITO",
      enforcement: "TEST_ACL",
      readers: ["test:reader"],
      writers: ["test:writer"],
      retention: {
        policy: "TEST_POLICY",
        minimum: "ATE_FIM_DO_PROJETO",
        transportRetentionDays: 90,
        reviewAt: "2026-11-06T12:00:00.000Z",
        transportExpiresAt: "2026-11-20T12:00:00.000Z",
        longTermProviderStatus: "PENDENTE_ANTES_RELEASE_CANDIDATE",
        longTermProvider: null,
        longTermObjectReference: null,
        longTermReceiptSourcePath: null,
        longTermReceiptSha256: null,
      },
    },
  };
}

async function populateCriticalSemanticFixture(
  paths,
  { auditHigh = false } = {},
) {
  await writeFile(
    paths.bindings,
    `${JSON.stringify({
      schemaVersion: 1,
      bindingsVersion: "TEST-SEMANTICS/1.0.0",
      rules: [
        { id: "TEST-JSON", match: "**/*.json", cases: ["QAT-SEC-021"] },
        { id: "TEST-OCI", match: "**/*.tar", cases: ["QAT-SEC-021"] },
        {
          id: "TEST-DIGEST",
          match: "**/*.sha256",
          cases: ["QAT-SEC-021"],
        },
      ],
    })}\n`,
  );

  const archiveBytes = Buffer.from("imagem OCI sintética para contrato\n");
  const archiveSha256 = sha256Bytes(archiveBytes);
  await writeFile(join(paths.source, "portal-dp.oci.tar"), archiveBytes);
  await writeFile(
    join(paths.source, "portal-dp.oci.sha256"),
    `${archiveSha256}  portal-dp.oci.tar\n`,
  );

  for (const [index, component] of EXPECTED_SBOM_COMPONENTS.entries()) {
    await writeFile(
      join(paths.source, `${component}-0.0.0.cdx.json`),
      `${JSON.stringify({
        bomFormat: "CycloneDX",
        specVersion: "1.7",
        metadata: { component: { name: component, version: "0.0.0" } },
        components:
          index === 0 ? [{ name: "dependencia-teste", version: "1.0.0" }] : [],
      })}\n`,
    );
  }

  if (auditHigh) {
    await writeFile(
      join(paths.source, "pnpm-audit-production.json"),
      `${JSON.stringify({
        metadata: { vulnerabilities: { high: 1, critical: 0 } },
      })}\n`,
    );
  }
}

function criticalSemanticOptions(paths, runId, artifactCount) {
  const result = options(paths, runId);
  result.requirements = [
    {
      id: "CRITICAL_SEMANTIC_FIXTURE",
      match: "**/*",
      minimumCount: artifactCount,
    },
  ];
  result.artifactDownloadOutcome = "success";
  return result;
}

test("seals and verifies a content-addressed evidence run", async () => {
  const paths = await fixture();
  try {
    await writeFile(join(paths.source, "report.json"), '{"passed":true}\n');
    const sealed = await finalizeEvidenceRun(options(paths, "run-001"));
    const checked = await validateEvidenceRun({
      manifestPath: sealed.manifestPath,
    });
    assert.equal(checked.artifacts, 1);
    assert.deepEqual(checked.manifest.cases, ["QAT-DOC-009"]);
    assert.equal(checked.manifest.qualityGates.asvs.approvalComplete, false);
    assert.equal(
      checked.manifest.qualityGates.sealingDoesNotApproveRelease,
      true,
    );
    assert.equal(checked.manifest.completeness.complete, false);
    await assert.rejects(
      validateEvidenceRun({
        manifestPath: sealed.manifestPath,
        requireComplete: true,
      }),
      /sealed but incomplete/u,
    );
    await assert.rejects(
      validateEvidenceRun({
        manifestPath: sealed.manifestPath,
        requireTechnicalComplete: true,
      }),
      /technically incomplete/u,
    );
    const manifestBytes = await readFile(sealed.manifestPath);
    assert.equal(sealed.manifestSha256, sha256Bytes(manifestBytes));
    if (process.platform !== "win32") {
      const artifactPath = join(
        dirname(sealed.manifestPath),
        ...checked.manifest.artifacts[0].storedPath.split("/"),
      );
      assert.equal((await stat(sealed.manifestPath)).mode & 0o777, 0o440);
      assert.equal((await stat(artifactPath)).mode & 0o777, 0o440);
      assert.equal(
        (await stat(dirname(sealed.manifestPath))).mode & 0o777,
        0o550,
      );
      assert.equal((await stat(dirname(artifactPath))).mode & 0o777, 0o550);
    }
  } finally {
    await removeHardenedFixture(paths.root);
  }
});

test("rejeita classificacao restrita sobre transporte publico", async () => {
  const paths = await fixture();
  try {
    await writeFile(join(paths.source, "report.json"), '{"passed":true}\n');
    const mismatched = options(paths, "run-acl-incompativel");
    mismatched.accessControl.enforcement =
      "GITHUB_PUBLIC_REPOSITORY_ACTIONS_ARTIFACT_VISIBILITY";
    await assert.rejects(
      finalizeEvidenceRun(mismatched),
      /classification does not match its real enforcement/u,
    );

    const publicSanitized = options(paths, "run-acl-publico");
    publicSanitized.accessControl.classification = "PUBLICO_SANITIZADO";
    publicSanitized.accessControl.enforcement =
      "GITHUB_PUBLIC_REPOSITORY_ACTIONS_ARTIFACT_VISIBILITY";
    const sealed = await finalizeEvidenceRun(publicSanitized);
    const checked = await validateEvidenceRun({
      manifestPath: sealed.manifestPath,
    });
    assert.equal(
      checked.manifest.accessControl.classification,
      "PUBLICO_SANITIZADO",
    );
  } finally {
    await removeHardenedFixture(paths.root);
  }
});

test("refuses to clean a path outside the known fixture roots", async () => {
  await assert.rejects(
    removeHardenedFixture(join(tmpdir(), "not-an-evidence-fixture")),
    /não é fixture temporária/u,
  );
});

test("passes the completeness gate only with artifacts and a custody receipt", async () => {
  const paths = await fixture();
  try {
    const receiptBytes = Buffer.from('{"custody":"accepted"}\n');
    await writeFile(join(paths.source, "report.json"), '{"passed":true}\n');
    await writeFile(join(paths.source, "custody-receipt.json"), receiptBytes);
    const completeOptions = options(paths, "run-complete");
    completeOptions.requirements = [
      { id: "REPORT", match: "**/report.json" },
      { id: "CUSTODY_RECEIPT", match: "**/custody-receipt.json" },
    ];
    completeOptions.artifactDownloadOutcome = "success";
    completeOptions.accessControl.retention.longTermProviderStatus =
      "CONFIGURADO";
    completeOptions.accessControl.retention.longTermProvider = "test-worm";
    completeOptions.accessControl.retention.longTermObjectReference =
      "test://evidence/run-complete";
    completeOptions.accessControl.retention.longTermReceiptSourcePath =
      "custody-receipt.json";
    completeOptions.accessControl.retention.longTermReceiptSha256 =
      sha256Bytes(receiptBytes);
    const sealed = await finalizeEvidenceRun(completeOptions);
    const checked = await validateEvidenceRun({
      manifestPath: sealed.manifestPath,
      requireComplete: true,
    });
    assert.equal(checked.manifest.completeness.complete, true);
    assert.equal(checked.manifest.completeness.retentionSatisfied, true);
  } finally {
    await removeHardenedFixture(paths.root);
  }
});

test("validates critical report semantics with technical completeness", async () => {
  const paths = await fixture();
  try {
    await populateCriticalSemanticFixture(paths);
    const sealed = await finalizeEvidenceRun(
      criticalSemanticOptions(paths, "run-critical-semantics", 13),
    );
    const checked = await validateEvidenceRun({
      manifestPath: sealed.manifestPath,
      requireTechnicalComplete: true,
    });
    assert.equal(checked.technicalCompletenessSatisfied, true);
    assert.equal(checked.criticalSemanticsValidated, true);
  } finally {
    await removeHardenedFixture(paths.root);
  }
});

test("rejects a technically complete run with invalid critical semantics", async () => {
  const paths = await fixture();
  try {
    await populateCriticalSemanticFixture(paths, { auditHigh: true });
    const sealed = await finalizeEvidenceRun(
      criticalSemanticOptions(paths, "run-critical-semantics-invalid", 14),
    );
    await assert.rejects(
      validateEvidenceRun({
        manifestPath: sealed.manifestPath,
        requireTechnicalComplete: true,
      }),
      /pnpm audit report contains high\/critical findings/u,
    );
  } finally {
    await removeHardenedFixture(paths.root);
  }
});

test("preserves an incomplete failed run after validating structure and hashes", async () => {
  const paths = await fixture();
  try {
    await populateCriticalSemanticFixture(paths, { auditHigh: true });
    const preservedOptions = criticalSemanticOptions(
      paths,
      "run-failed-preserved",
      14,
    );
    preservedOptions.execution.outcomes.tests = "failure";
    preservedOptions.artifactDownloadOutcome = "failure";
    const sealed = await finalizeEvidenceRun(preservedOptions);
    const checked = await validateEvidenceRun({
      manifestPath: sealed.manifestPath,
      preservationStructureOnly: true,
    });
    assert.equal(checked.technicalCompletenessSatisfied, false);
    assert.equal(checked.criticalSemanticsValidated, false);
    assert.equal(checked.artifacts, 14);
  } finally {
    await removeHardenedFixture(paths.root);
  }
});

test("refuses to overwrite an immutable run", async () => {
  const paths = await fixture();
  try {
    await writeFile(join(paths.source, "report.json"), "{}\n");
    await finalizeEvidenceRun(options(paths, "run-immutable"));
    await assert.rejects(
      finalizeEvidenceRun(options(paths, "run-immutable")),
      /already exists and cannot be overwritten/u,
    );
  } finally {
    await removeHardenedFixture(paths.root);
  }
});

test("detects object tampering", async () => {
  const paths = await fixture();
  try {
    await writeFile(join(paths.source, "report.json"), "{}\n");
    const sealed = await finalizeEvidenceRun(options(paths, "run-tamper"));
    const artifact = sealed.manifest.artifacts[0];
    const objectPath = join(
      paths.repository,
      "runs",
      "run-tamper",
      ...artifact.storedPath.split("/"),
    );
    await chmod(objectPath, 0o640);
    await writeFile(objectPath, "tampered\n");
    await assert.rejects(
      validateEvidenceRun({ manifestPath: sealed.manifestPath }),
      /object (?:size|checksum) mismatch/u,
    );
  } finally {
    await removeHardenedFixture(paths.root);
  }
});

test("rejeita arquivo extra fora do manifesto selado", async () => {
  const paths = await fixture();
  try {
    await writeFile(join(paths.source, "report.json"), '{"passed":true}\n');
    const sealed = await finalizeEvidenceRun(options(paths, "run-extra-file"));
    const runDirectory = dirname(sealed.manifestPath);
    if (process.platform !== "win32") await chmod(runDirectory, 0o750);
    await writeFile(join(runDirectory, "nao-declarado.txt"), "injetado\n");
    await assert.rejects(
      validateEvidenceRun({ manifestPath: sealed.manifestPath }),
      /undeclared file in sealed evidence/u,
    );
  } finally {
    await removeHardenedFixture(paths.root);
  }
});

test("preserves a verifiable replacement chain", async () => {
  const paths = await fixture();
  try {
    await writeFile(join(paths.source, "report.json"), '{"version":1}\n');
    const first = await finalizeEvidenceRun(options(paths, "run-v1"));
    await writeFile(join(paths.source, "report.json"), '{"version":2}\n');
    const second = await finalizeEvidenceRun(
      options(paths, "run-v2", first.manifestPath),
    );
    const checked = await validateEvidenceRun({
      manifestPath: second.manifestPath,
    });
    assert.deepEqual(checked.manifest.replacement.chain, [
      { runId: "run-v1", manifestSha256: first.manifestSha256 },
    ]);
    assert.equal(checked.manifest.replacement.reason, "Correção do relatório");
  } finally {
    await removeHardenedFixture(paths.root);
  }
});

test("rejects a replacement chain whose prior object was altered", async () => {
  const paths = await fixture();
  try {
    await writeFile(join(paths.source, "report.json"), '{"version":1}\n');
    const first = await finalizeEvidenceRun(options(paths, "run-chain-v1"));
    await writeFile(join(paths.source, "report.json"), '{"version":2}\n');
    const second = await finalizeEvidenceRun(
      options(paths, "run-chain-v2", first.manifestPath),
    );
    const firstObject = join(
      paths.repository,
      "runs",
      "run-chain-v1",
      ...first.manifest.artifacts[0].storedPath.split("/"),
    );
    await chmod(firstObject, 0o640);
    await writeFile(firstObject, "altered prior object\n");
    await assert.rejects(
      validateEvidenceRun({ manifestPath: second.manifestPath }),
      /object (?:size|checksum) mismatch/u,
    );
  } finally {
    await removeHardenedFixture(paths.root);
  }
});

test("fails closed when an artifact has no case binding", async () => {
  const paths = await fixture();
  try {
    await writeFile(join(paths.source, "unmapped.log"), "result\n");
    await assert.rejects(
      finalizeEvidenceRun(options(paths, "run-unmapped")),
      /no case binding/u,
    );
  } finally {
    await removeHardenedFixture(paths.root);
  }
});

test("fails closed when a JSON report is malformed", async () => {
  const paths = await fixture();
  try {
    await writeFile(join(paths.source, "broken.json"), "not-json\n");
    await assert.rejects(
      finalizeEvidenceRun(options(paths, "run-invalid-json")),
      /invalid JSON evidence/u,
    );
  } finally {
    await removeHardenedFixture(paths.root);
  }
});

test("does not allow a GitHub run to omit mandatory evidence requirements", async () => {
  const paths = await fixture();
  try {
    await writeFile(join(paths.source, "report.json"), "{}\n");
    const githubOptions = options(paths, "run-github-incomplete");
    githubOptions.execution = {
      ...githubOptions.execution,
      provider: "github-actions",
      repository: "owner/repository",
      revision: "a".repeat(40),
      ref: "refs/heads/main",
      workflow: "owner/repository/.github/workflows/ci.yml@refs/heads/main",
      attempt: "1",
      outcomes: {
        "planning-windows": "success",
        "code-and-postgres": "success",
        "secret-scan": "success",
        sast: "success",
        "oci-image": "success",
      },
      initiator: {
        provider: "github",
        subject: "actor-id:1",
        displayName: "initiator",
      },
    };
    githubOptions.requirements = [];
    githubOptions.artifactDownloadOutcome = "success";
    await assert.rejects(
      finalizeEvidenceRun(githubOptions),
      /missing mandatory evidence requirement EXECUTION_CONTEXT/u,
    );
  } finally {
    await removeHardenedFixture(paths.root);
  }
});

test("keeps a GitHub evidence package incomplete when any required job fails", async () => {
  const paths = await fixture();
  try {
    const receiptBytes = Buffer.from('{"custody":"accepted"}\n');
    await writeFile(join(paths.source, "evidence-run-context.json"), "{}\n");
    await writeFile(join(paths.source, "custody-receipt.json"), receiptBytes);

    const githubOptions = options(paths, "run-github-failed-job");
    githubOptions.execution = {
      ...githubOptions.execution,
      provider: "github-actions",
      repository: "owner/repository",
      revision: "a".repeat(40),
      ref: "refs/heads/main",
      workflow: "owner/repository/.github/workflows/ci.yml@refs/heads/main",
      attempt: "1",
      outcomes: {
        "planning-windows": "success",
        "code-and-postgres": "cancelled",
        "secret-scan": "success",
        sast: "failure",
        "oci-image": "skipped",
      },
      initiator: {
        provider: "github",
        subject: "actor-id:1",
        displayName: "initiator",
      },
    };
    githubOptions.requirements = [
      { id: "EXECUTION_CONTEXT", match: "**/evidence-run-context.json" },
      {
        id: "COLLECTED_EVIDENCE_SECRET_SCAN",
        match: "**/content-secret-scan-collected-evidence.json",
      },
      { id: "SAST_REPORT", match: "**/sast-semgrep.json" },
      {
        id: "SAST_EVIDENCE_SECRET_SCAN",
        match: "**/content-secret-scan-sast-evidence.json",
      },
      { id: "SECRET_SCAN_REPORT", match: "**/gitleaks-result.json" },
    ];
    githubOptions.artifactDownloadOutcome = "success";
    githubOptions.accessControl.retention.longTermProviderStatus =
      "CONFIGURADO";
    githubOptions.accessControl.retention.longTermProvider = "test-worm";
    githubOptions.accessControl.retention.longTermObjectReference =
      "test://evidence/run-github-failed-job";
    githubOptions.accessControl.retention.longTermReceiptSourcePath =
      "custody-receipt.json";
    githubOptions.accessControl.retention.longTermReceiptSha256 =
      sha256Bytes(receiptBytes);

    const sealed = await finalizeEvidenceRun(githubOptions);
    const checked = await validateEvidenceRun({
      manifestPath: sealed.manifestPath,
    });
    assert.equal(checked.manifest.completeness.retentionSatisfied, true);
    assert.equal(checked.manifest.completeness.executionSatisfied, false);
    assert.deepEqual(checked.manifest.completeness.unsuccessfulExecutionJobs, [
      "code-and-postgres",
      "sast",
      "oci-image",
    ]);
    assert.equal(checked.manifest.completeness.complete, false);
    await assert.rejects(
      validateEvidenceRun({
        manifestPath: sealed.manifestPath,
        requireComplete: true,
      }),
      /sealed but incomplete/u,
    );
    await assert.rejects(
      validateEvidenceRun({
        manifestPath: sealed.manifestPath,
        requireTechnicalComplete: true,
      }),
      /technically incomplete/u,
    );
  } finally {
    await removeHardenedFixture(paths.root);
  }
});

test("rejects invalid present evidence before reporting technical incompleteness", async () => {
  const paths = await fixture();
  try {
    await writeFile(join(paths.source, "evidence-run-context.json"), "{}\n");
    await writeFile(
      join(paths.source, "pnpm-audit-production.json"),
      `${JSON.stringify({
        metadata: { vulnerabilities: { high: 1, critical: 0 } },
      })}\n`,
    );

    const githubOptions = options(paths, "run-github-invalid-partial");
    githubOptions.execution = {
      ...githubOptions.execution,
      provider: "github-actions",
      repository: "owner/repository",
      revision: "a".repeat(40),
      ref: "refs/heads/main",
      workflow: "owner/repository/.github/workflows/ci.yml@refs/heads/main",
      attempt: "1",
      outcomes: {
        "planning-windows": "success",
        "code-and-postgres": "failure",
        "secret-scan": "skipped",
        sast: "skipped",
        "oci-image": "skipped",
      },
      initiator: {
        provider: "github",
        subject: "actor-id:1",
        displayName: "initiator",
      },
    };
    githubOptions.requirements = [
      { id: "EXECUTION_CONTEXT", match: "**/evidence-run-context.json" },
      {
        id: "COLLECTED_EVIDENCE_SECRET_SCAN",
        match: "**/content-secret-scan-collected-evidence.json",
      },
      { id: "UNIT_TEST_REPORT", match: "**/unit-tests.log" },
      { id: "DATABASE_TEST_REPORT", match: "**/gat-02-vitest.json" },
      { id: "SCA_REPORT", match: "**/pnpm-audit-production.json" },
      { id: "LICENSE_REPORT", match: "**/licenses-production.json" },
      { id: "SBOM", match: "**/*.cdx.json", minimumCount: 11 },
      {
        id: "GENERATED_CONTENT_SECRET_SCAN",
        match: "**/content-secret-scan-generated.json",
      },
    ];
    githubOptions.artifactDownloadOutcome = "success";

    const sealed = await finalizeEvidenceRun(githubOptions);
    await assert.rejects(
      validateEvidenceRun({
        manifestPath: sealed.manifestPath,
        requireTechnicalComplete: true,
      }),
      /pnpm audit report contains high\/critical findings/u,
    );
  } finally {
    await removeHardenedFixture(paths.root);
  }
});

test("rejects a GitHub evidence package with an omitted job outcome", async () => {
  const paths = await fixture();
  try {
    await writeFile(join(paths.source, "report.json"), "{}\n");
    const githubOptions = options(paths, "run-github-missing-outcome");
    githubOptions.execution = {
      ...githubOptions.execution,
      provider: "github-actions",
      repository: "owner/repository",
      revision: "a".repeat(40),
      ref: "refs/heads/main",
      workflow: "owner/repository/.github/workflows/ci.yml@refs/heads/main",
      attempt: "1",
      outcomes: {
        "planning-windows": "success",
        "code-and-postgres": "success",
        "secret-scan": "success",
        sast: "success",
      },
      initiator: {
        provider: "github",
        subject: "actor-id:1",
        displayName: "initiator",
      },
    };
    githubOptions.requirements = [];
    githubOptions.artifactDownloadOutcome = "success";

    await assert.rejects(
      finalizeEvidenceRun(githubOptions),
      /must record the GitHub job oci-image/u,
    );
  } finally {
    await removeHardenedFixture(paths.root);
  }
});
