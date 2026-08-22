import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";

const root = resolve(import.meta.dirname, "../..");
const baselinePath = resolve(
  root,
  "evidencias/manifests/asvs-applicability-v5.0.0.json",
);
const stageGatesBaselinePath = resolve(
  root,
  "evidencias/manifests/asvs-stage-gates-v5.0.0.json",
);
const validatorPath = resolve(root, "scripts/validate-asvs-manifest.mjs");

async function modifiedManifest(change) {
  const directory = await mkdtemp(join(tmpdir(), "portal-dp-asvs-"));
  const path = join(directory, "manifest.json");
  const manifest = JSON.parse(await readFile(baselinePath, "utf8"));
  change(manifest);
  await writeFile(path, `${JSON.stringify(manifest, null, 2)}\n`);
  return { directory, path };
}

async function modifiedStageGates(change) {
  const directory = await mkdtemp(join(tmpdir(), "portal-dp-asvs-stage-"));
  const path = join(directory, "stage-gates.json");
  const manifest = JSON.parse(await readFile(stageGatesBaselinePath, "utf8"));
  change(manifest);
  await writeFile(path, `${JSON.stringify(manifest, null, 2)}\n`);
  return { directory, path };
}

function validate(path, ...extraArguments) {
  return spawnSync(
    process.execPath,
    [
      validatorPath,
      "--manifest",
      path,
      "--require-approved",
      ...extraArguments,
    ],
    { cwd: root, encoding: "utf8" },
  );
}

test("separates approved applicability from stage and final results", () => {
  const applicability = validate(baselinePath);
  assert.equal(applicability.status, 0);
  const summary = JSON.parse(applicability.stdout);
  assert.equal(summary.gates.applicability.ready, true);
  assert.equal(summary.gates.etp00Results.ready, false);
  assert.equal(summary.gates.finalClosure.ready, false);

  const stage = validate(baselinePath, "--require-stage", "ETP-00");
  assert.equal(stage.status, 1);
  assert.match(
    `${stage.stdout}${stage.stderr}`,
    /every declared contribution/u,
  );

  const finalClosure = validate(baselinePath, "--require-final");
  assert.equal(finalClosure.status, 1);
  assert.match(
    `${finalClosure.stdout}${finalClosure.stderr}`,
    /final closure requires approved applicability/u,
  );
});

test("rejects an incomplete ETP-00 case inventory", async () => {
  const fixture = await modifiedStageGates((stageGates) => {
    stageGates.stageGates[0].requiredCaseIds.pop();
    stageGates.stageGates[0].results.pop();
  });
  try {
    const result = validate(baselinePath, "--stage-gates", fixture.path);
    assert.equal(result.status, 1);
    assert.match(
      `${result.stdout}${result.stderr}`,
      /10 executable ASVS contributions/u,
    );
  } finally {
    await rm(fixture.directory, { recursive: true, force: true });
  }
});

test("rejects an arbitrary repository file as an ETP-00 case proof", async () => {
  const fixture = await modifiedStageGates((stageGates) => {
    stageGates.stageGates[0].results[0] = {
      ...stageGates.stageGates[0].results[0],
      status: "EXECUTADA",
      result: "CONTRIBUICAO_COMPROVADA",
      artifactPath: "package.json",
      artifactSha256: "a".repeat(64),
      producedAt: "2026-08-22T21:00:00.000Z",
      responsible: "Pessoa Responsavel — SEG",
    };
  });
  try {
    const result = validate(baselinePath, "--stage-gates", fixture.path);
    assert.equal(result.status, 1);
    assert.match(
      `${result.stdout}${result.stderr}`,
      /requires one complete sealed evidence run/u,
    );
  } finally {
    await rm(fixture.directory, { recursive: true, force: true });
  }
});

test("rejects aggregate closure while underlying results are incomplete", async () => {
  const fixture = await modifiedStageGates((stageGates) => {
    stageGates.stageGates[0].status = "CONTRIBUICAO_CONCLUIDA";
    stageGates.finalClosure.status = "CONCLUIDO";
  });
  try {
    const result = validate(baselinePath, "--stage-gates", fixture.path);
    assert.equal(result.status, 1);
    assert.match(
      `${result.stdout}${result.stderr}`,
      /contribution cannot be concluded with incomplete assertions/u,
    );
    assert.match(
      `${result.stdout}${result.stderr}`,
      /final closure cannot be concluded with incomplete controls/u,
    );
  } finally {
    await rm(fixture.directory, { recursive: true, force: true });
  }
});

test("does not accept execution results inside the applicability snapshot", async () => {
  const fixture = await modifiedManifest((manifest) => {
    manifest.controls[0].result = "PASSOU";
  });
  try {
    const result = validate(fixture.path);
    assert.equal(result.status, 1);
    assert.match(
      `${result.stdout}${result.stderr}`,
      /Applicability snapshot cannot claim an execution result/u,
    );
  } finally {
    await rm(fixture.directory, { recursive: true, force: true });
  }
});

test("rejects an ASVS approval with an invalid instant", async () => {
  const fixture = await modifiedManifest((manifest) => {
    manifest.approval = {
      ...manifest.approval,
      status: "APROVADO",
      responsible: "SEG-NOMINAL",
      approvedAt: "not-an-instant",
      subjectSha256: manifest.approvalSubjectSha256,
    };
  });
  try {
    const result = validate(fixture.path);
    assert.equal(result.status, 1);
    assert.match(
      `${result.stdout}${result.stderr}`,
      /valid instant and matching subject hash/u,
    );
  } finally {
    await rm(fixture.directory, { recursive: true, force: true });
  }
});

test("invalidates ASVS approval when the approved content changes", async () => {
  const fixture = await modifiedManifest((manifest) => {
    manifest.approval = {
      ...manifest.approval,
      status: "APROVADO",
      responsible: "SEG-NOMINAL",
      approvedAt: "2026-08-22T12:00:00.000Z",
      subjectSha256: manifest.approvalSubjectSha256,
    };
    manifest.controls[0].title = `${manifest.controls[0].title} altered`;
  });
  try {
    const result = validate(fixture.path);
    assert.equal(result.status, 1);
    assert.match(
      `${result.stdout}${result.stderr}`,
      /approval subject hash does not match/u,
    );
  } finally {
    await rm(fixture.directory, { recursive: true, force: true });
  }
});
