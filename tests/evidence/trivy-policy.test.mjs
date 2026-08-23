import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

import { removeHardenedFixture } from "./remove-hardened-fixture.mjs";

const script = resolve("scripts/prepare-trivy-policy.mjs");

async function scenario({ file, environment } = {}) {
  const directory = await mkdtemp(join(tmpdir(), "portal-dp-trivy-policy-"));
  const repository = join(directory, "repository");
  const output = join(directory, "controlled");
  await mkdir(repository);
  if (file) await writeFile(join(repository, file), "skip-files: ['**']\n");
  const execution = spawnSync(
    process.execPath,
    [script, "--root", repository, "--output-directory", output],
    {
      encoding: "utf8",
      env: {
        ...Object.fromEntries(
          Object.entries(process.env).filter(
            ([name]) => name !== "TRIVY_CMD" && !name.startsWith("TRIVY_"),
          ),
        ),
        ...environment,
      },
    },
  );
  return { directory, execution, output };
}

test("gera configuracao e ignore vazios fora do repositorio", async () => {
  const result = await scenario();
  try {
    assert.equal(result.execution.status, 0, result.execution.stderr);
    assert.equal(
      await readFile(join(result.output, "trivy.yaml"), "utf8"),
      "{}\n",
    );
    assert.equal(
      await readFile(join(result.output, ".trivyignore"), "utf8"),
      "",
    );
  } finally {
    await removeHardenedFixture(result.directory);
  }
});

test("rejeita arquivos locais e variaveis que reduziriam a varredura", async () => {
  for (const item of [
    { file: "trivy.yaml" },
    { file: ".trivyignore.yaml" },
    { environment: { TRIVY_SKIP_FILES: "**" } },
    { environment: { TRIVY_IGNORE_POLICY: "permitir.rego" } },
    { environment: { TRIVY_CMD: "outro-binario" } },
  ]) {
    const result = await scenario(item);
    try {
      assert.notEqual(result.execution.status, 0);
      assert.match(
        result.execution.stderr,
        /repository override|inherited overrides/u,
      );
    } finally {
      await removeHardenedFixture(result.directory);
    }
  }
});
