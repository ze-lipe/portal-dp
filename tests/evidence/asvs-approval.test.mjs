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
const validatorPath = resolve(root, "scripts/validate-asvs-manifest.mjs");

async function modifiedManifest(change) {
  const directory = await mkdtemp(join(tmpdir(), "portal-dp-asvs-"));
  const path = join(directory, "manifest.json");
  const manifest = JSON.parse(await readFile(baselinePath, "utf8"));
  change(manifest);
  await writeFile(path, `${JSON.stringify(manifest, null, 2)}\n`);
  return { directory, path };
}

function validate(path) {
  return spawnSync(
    process.execPath,
    [validatorPath, "--manifest", path, "--require-approved"],
    { cwd: root, encoding: "utf8" },
  );
}

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
