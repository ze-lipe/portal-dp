import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
function argument(name) {
  const index = process.argv.indexOf(`--${name}`);
  return index === -1 ? undefined : process.argv[index + 1];
}
const sourcePath = resolve(
  root,
  "documentacao/referencias/OWASP_Application_Security_Verification_Standard_5.0.0_en.flat.json",
);
const manifestPath = resolve(
  argument("manifest") ??
    resolve(root, "evidencias/manifests/asvs-applicability-v5.0.0.json"),
);
const evidencePath = resolve(
  root,
  "evidencias/manifests/asvs-evidence-index-v5.0.0.json",
);
const expectedHash =
  "8201b20eec2908c3380ac600c91c8ba746346fbb808859366abb232027532311";

const [sourceBytes, manifestText, evidenceText] = await Promise.all([
  readFile(sourcePath),
  readFile(manifestPath, "utf8"),
  readFile(evidencePath, "utf8"),
]);
const source = JSON.parse(sourceBytes.toString("utf8"));
const manifest = JSON.parse(manifestText);
const evidenceIndex = JSON.parse(evidenceText);
const errors = [];
const requireApproved = process.argv.includes("--require-approved");

const sourceHash = createHash("sha256").update(sourceBytes).digest("hex");
if (sourceHash !== expectedHash || manifest.source.sha256 !== expectedHash) {
  errors.push("ASVS source hash is not the frozen 5.0.0 baseline");
}
if (source.requirements.length !== 345 || manifest.controls.length !== 345) {
  errors.push("Manifest must have one row for each of the 345 ASVS controls");
}
if (source.requirements.filter((item) => item.L === "1").length !== 70) {
  errors.push("Frozen ASVS source must contain exactly 70 L1 controls");
}
const approvalSubjectSha256 = createHash("sha256")
  .update(
    JSON.stringify({
      schemaVersion: manifest.schemaVersion,
      manifestId: manifest.manifestId,
      source: manifest.source,
      profile: manifest.profile,
      controls: manifest.controls,
    }),
  )
  .digest("hex");
if (manifest.approvalSubjectSha256 !== approvalSubjectSha256) {
  errors.push("ASVS approval subject hash does not match the manifest content");
}

const ids = new Set();
const evidenceIds = new Set(
  evidenceIndex.records.map((record) => record.evidenceId),
);
for (const control of manifest.controls) {
  if (ids.has(control.asvsId))
    errors.push(`Duplicate control ${control.asvsId}`);
  ids.add(control.asvsId);
  if (!["APLICAVEL", "NAO_APLICAVEL", "ADIADO"].includes(control.situation)) {
    errors.push(`Invalid situation for ${control.asvsId}`);
  }
  if (control.situation === "NAO_APLICAVEL" && !control.justification) {
    errors.push(`Missing N/A justification for ${control.asvsId}`);
  }
  if (control.profileSelected) {
    if (!control.ownerCase)
      errors.push(`Missing owner case for ${control.asvsId}`);
    if (!control.evidenceId || !evidenceIds.has(control.evidenceId)) {
      errors.push(`Missing real evidence record for ${control.asvsId}`);
    }
    if (!control.responsible || !control.result) {
      errors.push(`Missing responsible/result for ${control.asvsId}`);
    }
  }
}

const actualSelectedL2 = manifest.controls
  .filter((control) => control.level === "L2" && control.profileSelected)
  .map((control) => control.asvsId);
if (
  JSON.stringify(actualSelectedL2) !==
  JSON.stringify(manifest.profile.selectedL2)
) {
  errors.push(
    "Selected L2 controls must be enumerated nominally and deterministically",
  );
}
const actualSelectedAdditional = manifest.controls
  .filter((control) => control.level === "L3" && control.profileSelected)
  .map((control) => control.asvsId);
if (
  JSON.stringify(actualSelectedAdditional) !==
  JSON.stringify(manifest.profile.selectedAdditional)
) {
  errors.push("Additional risk-selected controls must be enumerated nominally");
}

const approvedAtIsValid =
  typeof manifest.approval.approvedAt === "string" &&
  !Number.isNaN(Date.parse(manifest.approval.approvedAt)) &&
  new Date(manifest.approval.approvedAt).toISOString() ===
    manifest.approval.approvedAt;
const approvalIsComplete =
  manifest.approval.status === "APROVADO" &&
  typeof manifest.approval.responsible === "string" &&
  manifest.approval.responsible.trim() !== "" &&
  approvedAtIsValid &&
  manifest.approval.subjectSha256 === approvalSubjectSha256;
if (manifest.approval.status === "APROVADO" && !approvalIsComplete) {
  errors.push(
    "ASVS approval must have a named approver, valid instant and matching subject hash",
  );
}
if (
  manifest.approval.status === "AGUARDA_APROVACAO_SEGURANCA" &&
  (manifest.approval.responsible !== null ||
    manifest.approval.approvedAt !== null ||
    manifest.approval.subjectSha256 !== null)
) {
  errors.push("Pending ASVS approval cannot contain approval credentials");
}
if (requireApproved && !approvalIsComplete) {
  errors.push(
    "ASVS applicability requires named security approval before the first commit",
  );
}

if (errors.length > 0) {
  console.error(JSON.stringify({ valid: false, errors }, null, 2));
  process.exitCode = 1;
} else {
  console.log(
    JSON.stringify({
      valid: true,
      controls: manifest.controls.length,
      selectedL2: actualSelectedL2.length,
      selectedAdditional: actualSelectedAdditional.length,
      approval: manifest.approval.status,
      gateReady: approvalIsComplete,
      approvalRequired: requireApproved,
    }),
  );
}
