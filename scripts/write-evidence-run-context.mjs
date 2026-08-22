import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const outputPath = resolve(
  root,
  process.env["EVIDENCE_SOURCE_DIR"] ?? "evidencias/coleta",
  "execution/evidence-run-context.json",
);

function jsonObject(value, field) {
  if (!value) return {};
  const parsed = JSON.parse(value);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error(`${field} must be a JSON object`);
  }
  return parsed;
}

const context = {
  schemaVersion: 1,
  runId: process.env["EVIDENCE_RUN_ID"] ?? null,
  generatedAt: new Date().toISOString(),
  provider:
    process.env["GITHUB_ACTIONS"] === "true" ? "github-actions" : "local",
  repository: process.env["GITHUB_REPOSITORY"] ?? null,
  revision: process.env["GITHUB_SHA"] ?? null,
  ref: process.env["GITHUB_REF"] ?? null,
  workflow: process.env["GITHUB_WORKFLOW_REF"] ?? null,
  attempt: process.env["GITHUB_RUN_ATTEMPT"] ?? null,
  artifactDownloadOutcome:
    process.env["EVIDENCE_ARTIFACT_DOWNLOAD_OUTCOME"] ?? null,
  actor:
    process.env["GITHUB_ACTOR_ID"] || process.env["GITHUB_ACTOR"]
      ? {
          id: process.env["GITHUB_ACTOR_ID"] ?? null,
          login: process.env["GITHUB_ACTOR"] ?? null,
        }
      : null,
  jobResults: jsonObject(
    process.env["EVIDENCE_JOB_RESULTS_JSON"],
    "EVIDENCE_JOB_RESULTS_JSON",
  ),
  metadata: jsonObject(
    process.env["EVIDENCE_METADATA_JSON"],
    "EVIDENCE_METADATA_JSON",
  ),
};

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(context, null, 2)}\n`, {
  flag: "wx",
});
process.stdout.write(`${JSON.stringify({ written: outputPath })}\n`);
