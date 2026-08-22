import assert from "node:assert/strict";
import {
  chmod,
  mkdtemp,
  mkdir,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import {
  finalizeEvidenceRun,
  sha256Bytes,
  validateEvidenceRun,
} from "../../scripts/evidence-repository.mjs";

const FIXED_TIME = "2026-08-22T12:00:00.000Z";
const HASH_A = "a".repeat(64);
const HASH_B = "b".repeat(64);

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
  } finally {
    await rm(paths.root, { recursive: true, force: true });
  }
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
    await rm(paths.root, { recursive: true, force: true });
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
    await rm(paths.root, { recursive: true, force: true });
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
    await rm(paths.root, { recursive: true, force: true });
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
    await rm(paths.root, { recursive: true, force: true });
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
    await rm(paths.root, { recursive: true, force: true });
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
    await rm(paths.root, { recursive: true, force: true });
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
    await rm(paths.root, { recursive: true, force: true });
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
    await rm(paths.root, { recursive: true, force: true });
  }
});

test("keeps a GitHub evidence package incomplete when any required job fails", async () => {
  const paths = await fixture();
  try {
    const receiptBytes = Buffer.from('{"custody":"accepted"}\n');
    await writeFile(join(paths.source, "evidence-run-context.json"), "{}\n");
    await writeFile(join(paths.source, "sast-semgrep.json"), "{}\n");
    await writeFile(join(paths.source, "gitleaks-result.json"), "{}\n");
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
      { id: "SAST_REPORT", match: "**/sast-semgrep.json" },
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
    await rm(paths.root, { recursive: true, force: true });
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
    await rm(paths.root, { recursive: true, force: true });
  }
});
