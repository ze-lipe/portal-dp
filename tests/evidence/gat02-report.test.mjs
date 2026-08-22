import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { promisify } from "node:util";
import test from "node:test";

const execute = promisify(execFile);
const root = resolve(import.meta.dirname, "../..");
const validator = resolve(root, "scripts/validate-gat02-report.mjs");
const catalogPath = resolve(root, "evidencias/manifests/gat-02-cases-v1.json");

async function report(status = "passed") {
  const catalog = JSON.parse(await readFile(catalogPath, "utf8"));
  const assertions = catalog.caseTitles.map((title) => ({ title, status }));
  return {
    success: status === "passed",
    numTotalTests: assertions.length,
    numPassedTests: status === "passed" ? assertions.length : 0,
    numFailedTests: 0,
    numPendingTests: status === "passed" ? 0 : assertions.length,
    testResults: [{ assertionResults: assertions }],
  };
}

test("accepts only the complete approved GAT-02 case catalog", async () => {
  const directory = await mkdtemp(join(tmpdir(), "portal-dp-gat02-"));
  try {
    const path = join(directory, "valid.json");
    await writeFile(path, `${JSON.stringify(await report())}\n`);
    const result = await execute(process.execPath, [validator, path]);
    assert.match(result.stdout, /"passed":20/u);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("rejects a GAT-02 report whose cases were skipped", async () => {
  const directory = await mkdtemp(join(tmpdir(), "portal-dp-gat02-"));
  try {
    const path = join(directory, "skipped.json");
    await writeFile(path, `${JSON.stringify(await report("skipped"))}\n`);
    await assert.rejects(
      execute(process.execPath, [validator, path]),
      /nao comprova os 20 casos esperados/u,
    );
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
