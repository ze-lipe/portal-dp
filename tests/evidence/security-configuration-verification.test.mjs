import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, stat } from "node:fs/promises";
import { resolve } from "node:path";
import { promisify } from "node:util";
import test from "node:test";

import { validateSecurityConfigurationReport } from "../../scripts/security-configuration-contract.mjs";

const execute = promisify(execFile);
const root = resolve(import.meta.dirname, "../..");
const writer = resolve(
  root,
  "scripts/write-security-configuration-verification.mjs",
);
const expectedBase =
  "gcr.io/distroless/nodejs24-debian13:nonroot@sha256:ffab599740d4aaa66029d02b9e6d3de4f622fefb7410081c5ef69c86430f364d";

function argumentsFor(output, overrides = {}) {
  const values = {
    user: "65532:65532",
    "read-only": "true",
    "cap-drop": '["ALL"]',
    "security-options": '["no-new-privileges"]',
    "worker-user": "65532:65532",
    "worker-read-only": "true",
    "worker-cap-drop": '["ALL"]',
    "worker-security-options": '["no-new-privileges"]',
    "synthetic-route-status": "404",
    "runtime-base": expectedBase,
    entrypoint: '["/nodejs/bin/node"]',
    command: '["apps/api/dist/main.js"]',
    "private-volume-declared": "true",
    "private-volume-mount": "volume:true",
    "private-root-permissions": "65532:65532:700",
    "private-object-permissions": "65532:65532:600",
    output,
    ...overrides,
  };
  return Object.entries(values).flatMap(([name, value]) => [
    `--${name}`,
    value,
  ]);
}

test("emite somente o relatorio sanitizado quando todos os fatos passam", async () => {
  await mkdir(resolve(root, "tmp"), { recursive: true });
  const directory = await mkdtemp(resolve(root, "tmp/security-config-"));
  const output = resolve(directory, "verification.json");
  try {
    await execute(process.execPath, [writer, ...argumentsFor(output)], {
      cwd: root,
    });
    const report = JSON.parse(await readFile(output, "utf8"));
    assert.equal(report.status, "PASSOU");
    assert.equal(report.assertions.processIdentity.user, "65532:65532");
    assert.equal(report.assertions.syntheticApiRoute.enabled, false);
    assert.equal(report.assertions.workerRuntimeSecurity.readOnly, true);
    assert.equal(
      report.assertions.privateObjectStorage.runtimeMount,
      "volume:true",
    );
    assert.equal(JSON.stringify(report).includes("DATABASE_URL"), false);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("falha fechado e nao cria relatorio quando um fato diverge", async () => {
  await mkdir(resolve(root, "tmp"), { recursive: true });
  const directory = await mkdtemp(resolve(root, "tmp/security-config-"));
  const output = resolve(directory, "verification.json");
  try {
    await assert.rejects(
      execute(
        process.execPath,
        [writer, ...argumentsFor(output, { user: "0:0" })],
        { cwd: root },
      ),
      /user nao comprovou/u,
    );
    await assert.rejects(stat(output), /ENOENT/u);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("rejeita JSON bem formado que nao comprova as assercoes de seguranca", () => {
  assert.throws(
    () =>
      validateSecurityConfigurationReport({
        schemaVersion: 1,
        reportType: "OCI_SECURITY_CONFIGURATION_VERIFICATION",
        status: "PASSOU",
        assertions: {},
      }),
    /does not prove the hardened runtime/u,
  );
});
