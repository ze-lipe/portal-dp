import { resolve } from "node:path";

import { validateEvidenceRun } from "./evidence-repository.mjs";

function argument(name) {
  const index = process.argv.indexOf(`--${name}`);
  return index === -1 ? undefined : process.argv[index + 1];
}

const manifestPath =
  argument("manifest") ?? process.env["EVIDENCE_MANIFEST_PATH"];
if (!manifestPath) {
  throw new Error("Use --manifest <path> or define EVIDENCE_MANIFEST_PATH");
}

const result = await validateEvidenceRun({
  manifestPath: resolve(manifestPath),
  requireComplete: process.argv.includes("--require-complete"),
});
process.stdout.write(
  `${JSON.stringify({
    valid: true,
    manifestSha256: result.manifestSha256,
    runId: result.manifest.runId,
    artifacts: result.artifacts,
    cases: result.manifest.cases,
    asvsApproval: result.manifest.qualityGates.asvs.status,
    complete: result.manifest.completeness.complete,
    releaseApprovedBySealing: false,
  })}\n`,
);
