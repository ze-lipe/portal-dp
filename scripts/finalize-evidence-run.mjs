import { readFile, readdir } from "node:fs/promises";
import { join, resolve } from "node:path";

import {
  aggregateFileSetHash,
  etp00EvidenceRequirements,
  finalizeEvidenceRun,
} from "./evidence-repository.mjs";

const root = resolve(import.meta.dirname, "..");

function argument(name) {
  const index = process.argv.indexOf(`--${name}`);
  return index === -1 ? undefined : process.argv[index + 1];
}

function csv(value, fallback) {
  const values = (value ?? fallback)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  return [...new Set(values)].sort();
}

function jsonObject(value, field) {
  if (!value) return {};
  const parsed = JSON.parse(value);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error(`${field} must be a JSON object`);
  }
  return parsed;
}

async function regularFiles(directory, suffix) {
  const entries = await readdir(directory, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(suffix))
    .map((entry) => join(directory, entry.name));
}

function initiatorIdentity() {
  const provider =
    process.env["EVIDENCE_IDENTITY_PROVIDER"] ??
    (process.env["GITHUB_ACTIONS"] === "true" ? "github" : "local");
  const subject =
    process.env["EVIDENCE_IDENTITY_SUBJECT"] ??
    (process.env["GITHUB_ACTOR_ID"]
      ? `actor-id:${process.env["GITHUB_ACTOR_ID"]}`
      : process.env["GITHUB_ACTOR"]
        ? `actor:${process.env["GITHUB_ACTOR"]}`
        : process.env["USERNAME"]
          ? `user:${process.env["USERNAME"]}`
          : undefined);
  if (!subject) return null;
  return {
    provider,
    subject,
    displayName:
      process.env["EVIDENCE_IDENTITY_DISPLAY_NAME"] ??
      process.env["GITHUB_ACTOR"] ??
      process.env["USERNAME"] ??
      null,
  };
}

function executorIdentity(initiator) {
  if (process.env["GITHUB_ACTIONS"] !== "true") return initiator;
  const repository = process.env["GITHUB_REPOSITORY"] ?? "unknown-repository";
  const runId = process.env["GITHUB_RUN_ID"] ?? "unknown-run";
  const attempt = process.env["GITHUB_RUN_ATTEMPT"] ?? "unknown-attempt";
  return {
    provider: "github-actions",
    subject: `workflow-run:${repository}:${runId}:${attempt}`,
    displayName: process.env["GITHUB_WORKFLOW"] ?? "GitHub Actions",
  };
}

const packageManifest = JSON.parse(
  await readFile(resolve(root, "package.json"), "utf8"),
);
const migrationDirectory = resolve(root, "database/migrations");
const fixturePaths = [
  resolve(root, "database/seeds/0001_etp00_synthetic_fixture.sql"),
  resolve(root, "packages/testing/src/etp00-fixture.ts"),
];
const migrationPaths = await regularFiles(migrationDirectory, ".sql");
const now = new Date();
const transportRetentionDays = Number.parseInt(
  process.env["EVIDENCE_RETENTION_DAYS"] ?? "90",
  10,
);
if (
  !Number.isSafeInteger(transportRetentionDays) ||
  transportRetentionDays < 2
) {
  throw new Error("EVIDENCE_RETENTION_DAYS must be an integer of at least 2");
}
const retentionReviewLeadDays = Math.min(
  14,
  Math.max(1, transportRetentionDays - 1),
);
const repository = process.env["GITHUB_REPOSITORY"] ?? null;
const initiator = initiatorIdentity();
const executor = executorIdentity(initiator);
const provider =
  process.env["GITHUB_ACTIONS"] === "true" ? "github-actions" : "local";
const outcomes = jsonObject(
  process.env["EVIDENCE_JOB_RESULTS_JSON"],
  "EVIDENCE_JOB_RESULTS_JSON",
);
const runId =
  argument("run-id") ??
  process.env["EVIDENCE_RUN_ID"] ??
  `local-${now.toISOString().replace(/[:.]/gu, "-")}`;

const result = await finalizeEvidenceRun({
  runId,
  scope: process.env["EVIDENCE_SCOPE"] ?? "ETP-00",
  sourceDirectory: resolve(
    root,
    argument("source") ??
      process.env["EVIDENCE_SOURCE_DIR"] ??
      "evidencias/coleta",
  ),
  outputRoot: resolve(
    root,
    argument("output") ??
      process.env["EVIDENCE_OUTPUT_DIR"] ??
      "evidencias/repositorio",
  ),
  bindingsPath: resolve(
    root,
    argument("bindings") ??
      process.env["EVIDENCE_BINDINGS"] ??
      "evidencias/manifests/evidence-bindings-etp00-v1.json",
  ),
  supersedesManifestPath:
    argument("supersedes") ?? process.env["EVIDENCE_SUPERSEDES_MANIFEST"],
  replacementReason:
    argument("replacement-reason") ??
    process.env["EVIDENCE_REPLACEMENT_REASON"],
  asvsManifestPath: resolve(
    root,
    "evidencias/manifests/asvs-applicability-v5.0.0.json",
  ),
  generatedAt: now.toISOString(),
  execution: {
    provider,
    repository,
    revision: process.env["GITHUB_SHA"] ?? null,
    ref: process.env["GITHUB_REF"] ?? null,
    workflow: process.env["GITHUB_WORKFLOW_REF"] ?? null,
    attempt: process.env["GITHUB_RUN_ATTEMPT"] ?? null,
    outcomes,
    metadata: jsonObject(
      process.env["EVIDENCE_METADATA_JSON"],
      "EVIDENCE_METADATA_JSON",
    ),
    initiator,
  },
  responsible: {
    role: process.env["EVIDENCE_RESPONSIBLE_ROLE"] ?? "AUTOMACAO_ETP00",
    identity: executor,
  },
  requirements: etp00EvidenceRequirements(provider, outcomes),
  artifactDownloadOutcome:
    process.env["EVIDENCE_ARTIFACT_DOWNLOAD_OUTCOME"] ?? null,
  versions: {
    application: String(packageManifest.version),
    schema: {
      version:
        process.env["EVIDENCE_SCHEMA_VERSION"] ??
        migrationPaths
          .map((path) =>
            path
              .split(/[\\/]/u)
              .at(-1)
              .replace(/\.sql$/u, ""),
          )
          .sort()
          .at(-1),
      sha256: await aggregateFileSetHash(root, migrationPaths),
    },
    fixture: {
      version: process.env["EVIDENCE_FIXTURE_VERSION"] ?? "ETP00_FIXTURE_V1",
      sha256: await aggregateFileSetHash(root, fixturePaths),
    },
  },
  accessControl: {
    id: "ACL-EVIDENCE-GENERAL",
    immutable: true,
    classification:
      process.env["EVIDENCE_CLASSIFICATION"] ?? "INTERNO_RESTRITO",
    enforcement:
      process.env["EVIDENCE_ACL_ENFORCEMENT"] ??
      (process.env["GITHUB_ACTIONS"] === "true"
        ? "GITHUB_PUBLIC_REPOSITORY_ACTIONS_ARTIFACT_VISIBILITY"
        : "FILESYSTEM_WORKSPACE_ACL"),
    readers: csv(
      process.env["EVIDENCE_ACL_READERS"],
      repository
        ? `repository:${repository}:actions-read`
        : "local:workspace-owner",
    ),
    writers: csv(
      process.env["EVIDENCE_ACL_WRITERS"],
      process.env["GITHUB_ACTIONS"] === "true"
        ? executor
          ? `${executor.provider}:${executor.subject}`
          : "workflow:github-actions"
        : executor
          ? `${executor.provider}:${executor.subject}`
          : "local:workspace-owner",
    ),
    retention: {
      policy: "PRESERVAR_ATE_FIM_DO_PROJETO_E_REAVALIAR_ANTES_DO_RC",
      minimum: "ATE_FIM_DO_PROJETO",
      transportRetentionDays,
      reviewAt: new Date(
        now.getTime() +
          (transportRetentionDays - retentionReviewLeadDays) *
            24 *
            60 *
            60 *
            1000,
      ).toISOString(),
      transportExpiresAt: new Date(
        now.getTime() + transportRetentionDays * 24 * 60 * 60 * 1000,
      ).toISOString(),
      longTermProviderStatus:
        process.env["EVIDENCE_LONG_TERM_PROVIDER_STATUS"] ??
        "PENDENTE_ANTES_RELEASE_CANDIDATE",
      longTermProvider: process.env["EVIDENCE_LONG_TERM_PROVIDER"] ?? null,
      longTermObjectReference:
        process.env["EVIDENCE_LONG_TERM_OBJECT_REFERENCE"] ?? null,
      longTermReceiptSourcePath:
        process.env["EVIDENCE_LONG_TERM_RECEIPT_SOURCE_PATH"] ?? null,
      longTermReceiptSha256:
        process.env["EVIDENCE_LONG_TERM_RECEIPT_SHA256"] ?? null,
    },
  },
});

process.stdout.write(
  `${JSON.stringify({
    sealed: true,
    manifestPath: result.manifestPath,
    manifestSha256: result.manifestSha256,
    artifacts: result.manifest.artifacts.length,
    cases: result.manifest.cases,
    complete: result.manifest.completeness.complete,
    asvsApproval: result.manifest.qualityGates.asvs.status,
    releaseApprovedBySealing: false,
  })}\n`,
);
