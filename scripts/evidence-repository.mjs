import { createHash, randomUUID } from "node:crypto";
import {
  copyFile,
  chmod,
  mkdir,
  readFile,
  readdir,
  rename,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import { createReadStream } from "node:fs";
import { basename, dirname, join, relative, resolve, sep } from "node:path";

export const EVIDENCE_CONTRACT_VERSION = "portal-dp/evidence-repository@1.0.0";
export const EVIDENCE_SCHEMA_VERSION = 1;

export function etp00EvidenceRequirements(provider, outcomes) {
  if (provider !== "github-actions") return [];
  const requirements = [
    {
      id: "EXECUTION_CONTEXT",
      match: "**/evidence-run-context.json",
    },
  ];
  if (outcomes["code-and-postgres"] === "success") {
    requirements.push(
      { id: "DATABASE_TEST_REPORT", match: "**/gat-02-vitest.json" },
      { id: "SCA_REPORT", match: "**/pnpm-audit-production.json" },
      { id: "LICENSE_REPORT", match: "**/licenses-production.json" },
      { id: "SBOM", match: "**/*.cdx.json" },
    );
  }
  if (["success", "failure"].includes(outcomes["sast"])) {
    requirements.push({ id: "SAST_REPORT", match: "**/sast-semgrep.json" });
  }
  if (outcomes["oci-image"] === "success") {
    requirements.push(
      { id: "OCI_ARTIFACT", match: "**/portal-dp.oci.tar" },
      { id: "OCI_DIGEST", match: "**/portal-dp.oci.sha256" },
      { id: "OCI_API_READY", match: "**/oci-api-ready.json" },
      {
        id: "OCI_API_SESSION_CHECK",
        match: "**/oci-api-session-check.json",
      },
      {
        id: "OCI_WORKER_VERIFICATION",
        match: "**/oci-worker-verification.json",
      },
      { id: "TRIVY_IMAGE_REPORT", match: "**/trivy-image.json" },
      { id: "TRIVY_CONFIG_REPORT", match: "**/trivy-config.json" },
    );
  }
  return requirements;
}

const HASH_PATTERN = /^[a-f0-9]{64}$/u;
const RUN_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/u;

function fail(message) {
  throw new Error(`Evidence repository contract violation: ${message}`);
}

function requireText(value, field) {
  if (typeof value !== "string" || value.trim() === "") {
    fail(`${field} must be a non-empty string`);
  }
  return value.trim();
}

function requireHash(value, field) {
  if (typeof value !== "string" || !HASH_PATTERN.test(value)) {
    fail(`${field} must be a lowercase SHA-256`);
  }
  return value;
}

function requireIsoInstant(value, field) {
  requireText(value, field);
  if (
    Number.isNaN(Date.parse(value)) ||
    new Date(value).toISOString() !== value
  ) {
    fail(`${field} must be a canonical UTC ISO instant`);
  }
  return value;
}

function uniqueSorted(values, field) {
  if (!Array.isArray(values)) fail(`${field} must be an array`);
  const result = [
    ...new Set(values.map((value) => requireText(value, field))),
  ].sort();
  if (result.length === 0) fail(`${field} must not be empty`);
  return result;
}

function isMissing(error) {
  return error instanceof Error && "code" in error && error.code === "ENOENT";
}

async function exists(path) {
  try {
    await stat(path);
    return true;
  } catch (error) {
    if (isMissing(error)) return false;
    throw error;
  }
}

export async function sha256File(path) {
  const hash = createHash("sha256");
  for await (const chunk of createReadStream(path)) hash.update(chunk);
  return hash.digest("hex");
}

export function sha256Bytes(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

function normalizedRelativePath(root, path) {
  const value = relative(root, path).split(sep).join("/");
  if (
    value === "" ||
    value === "." ||
    value === ".." ||
    value.startsWith("../") ||
    value.startsWith("/")
  ) {
    fail(`unsafe evidence path ${value}`);
  }
  return value;
}

async function collectFiles(root) {
  const files = [];
  async function walk(directory) {
    const entries = await readdir(directory, { withFileTypes: true });
    entries.sort((left, right) => left.name.localeCompare(right.name));
    for (const entry of entries) {
      const path = join(directory, entry.name);
      if (entry.isSymbolicLink()) {
        fail(`symbolic links are forbidden in evidence input: ${path}`);
      }
      if (entry.isDirectory()) await walk(path);
      else if (entry.isFile()) files.push(path);
      else fail(`unsupported evidence input type: ${path}`);
    }
  }
  await walk(root);
  return files;
}

function globExpression(pattern) {
  const normalized = requireText(pattern, "binding.match").replaceAll(
    "\\",
    "/",
  );
  let expression = "^";
  for (let index = 0; index < normalized.length; index += 1) {
    const character = normalized[index];
    const next = normalized[index + 1];
    if (character === "*" && next === "*") {
      if (normalized[index + 2] === "/") {
        expression += "(?:.*/)?";
        index += 2;
      } else {
        expression += ".*";
        index += 1;
      }
    } else if (character === "*") {
      expression += "[^/]*";
    } else if (character === "?") {
      expression += "[^/]";
    } else {
      expression += character.replace(/[|\\{}()[\]^$+?.]/gu, "\\$&");
    }
  }
  return new RegExp(`${expression}$`, "u");
}

async function loadBindings(path) {
  const bytes = await readFile(path);
  const parsed = JSON.parse(bytes.toString("utf8"));
  if (parsed.schemaVersion !== 1) fail("unsupported evidence binding schema");
  const version = requireText(parsed.bindingsVersion, "bindingsVersion");
  if (!Array.isArray(parsed.rules) || parsed.rules.length === 0) {
    fail("binding catalog must contain rules");
  }
  const identifiers = new Set();
  const rules = parsed.rules.map((rule, index) => {
    const id = requireText(rule.id, `rules[${index}].id`);
    if (identifiers.has(id)) fail(`duplicate binding rule ${id}`);
    identifiers.add(id);
    return {
      id,
      match: requireText(rule.match, `rules[${index}].match`),
      expression: globExpression(rule.match),
      cases: uniqueSorted(rule.cases, `rules[${index}].cases`),
    };
  });
  return {
    version,
    sha256: sha256Bytes(bytes),
    rules,
  };
}

function bindingFor(path, catalog) {
  const matched = catalog.rules.filter((rule) => rule.expression.test(path));
  if (matched.length === 0) fail(`no case binding for ${path}`);
  return {
    ruleIds: matched.map((rule) => rule.id).sort(),
    caseIds: [...new Set(matched.flatMap((rule) => rule.cases))].sort(),
  };
}

function mediaType(path) {
  const lower = path.toLowerCase();
  if (lower.endsWith(".json")) return "application/json";
  if (lower.endsWith(".html")) return "text/html";
  if (lower.endsWith(".xml")) return "application/xml";
  if (lower.endsWith(".tar")) return "application/x-tar";
  if (lower.endsWith(".zip")) return "application/zip";
  if (lower.endsWith(".log") || lower.endsWith(".txt")) return "text/plain";
  return "application/octet-stream";
}

async function captureFile({ sourcePath, logicalPath, temporaryRun, catalog }) {
  const temporaryObject = join(temporaryRun, `.capture-${randomUUID()}`);
  await copyFile(sourcePath, temporaryObject);
  const [sha256, details] = await Promise.all([
    sha256File(temporaryObject),
    stat(temporaryObject),
  ]);
  const storedPath = `objects/sha256/${sha256.slice(0, 2)}/${sha256}`;
  const type = mediaType(logicalPath);
  if (type === "application/json") {
    try {
      JSON.parse(await readFile(temporaryObject, "utf8"));
    } catch {
      await rm(temporaryObject, { force: true });
      fail(`invalid JSON evidence: ${logicalPath}`);
    }
  }
  const destination = join(temporaryRun, ...storedPath.split("/"));
  await mkdir(dirname(destination), { recursive: true });
  if (await exists(destination)) await rm(temporaryObject, { force: true });
  else await rename(temporaryObject, destination);
  const binding = bindingFor(logicalPath, catalog);
  return {
    sourcePath: logicalPath,
    storedPath,
    sha256,
    bytes: details.size,
    mediaType: type,
    caseIds: binding.caseIds,
    bindingRuleIds: binding.ruleIds,
    aclId: "ACL-EVIDENCE-GENERAL",
  };
}

function validateIdentity(identity, field) {
  if (identity === null) return;
  if (!identity || typeof identity !== "object" || Array.isArray(identity)) {
    fail(`${field} must be an object or null`);
  }
  requireText(identity.provider, `${field}.provider`);
  requireText(identity.subject, `${field}.subject`);
  if (identity.displayName !== null && identity.displayName !== undefined) {
    requireText(identity.displayName, `${field}.displayName`);
  }
}

async function asvsSnapshot(path) {
  if (!path || !(await exists(path))) {
    return {
      status: "NAO_DISPONIVEL",
      sourceSha256: null,
      approvalSubjectSha256: null,
      approvedSubjectSha256: null,
      responsible: null,
      approvedAt: null,
      approvalComplete: false,
    };
  }
  const bytes = await readFile(path);
  const parsed = JSON.parse(bytes.toString("utf8"));
  const approval = parsed.approval ?? {};
  const status = requireText(approval.status, "ASVS approval.status");
  const approvalComplete =
    status === "APROVADO" &&
    typeof approval.responsible === "string" &&
    approval.responsible.trim() !== "" &&
    typeof approval.approvedAt === "string" &&
    !Number.isNaN(Date.parse(approval.approvedAt)) &&
    new Date(approval.approvedAt).toISOString() === approval.approvedAt &&
    typeof parsed.approvalSubjectSha256 === "string" &&
    HASH_PATTERN.test(parsed.approvalSubjectSha256) &&
    approval.subjectSha256 === parsed.approvalSubjectSha256;
  return {
    status,
    sourceSha256: sha256Bytes(bytes),
    approvalSubjectSha256: parsed.approvalSubjectSha256 ?? null,
    approvedSubjectSha256: approval.subjectSha256 ?? null,
    responsible: approval.responsible ?? null,
    approvedAt: approval.approvedAt ?? null,
    approvalComplete,
  };
}

async function readManifestAndDigest(manifestPath) {
  const bytes = await readFile(manifestPath);
  return {
    bytes,
    manifest: JSON.parse(bytes.toString("utf8")),
    digest: sha256Bytes(bytes),
  };
}

function validateVersions(versions) {
  if (!versions || typeof versions !== "object" || Array.isArray(versions)) {
    fail("versions must be an object");
  }
  requireText(versions.application, "versions.application");
  requireText(versions.schema.version, "versions.schema.version");
  requireHash(versions.schema.sha256, "versions.schema.sha256");
  requireText(versions.fixture.version, "versions.fixture.version");
  requireHash(versions.fixture.sha256, "versions.fixture.sha256");
}

function validateAcl(acl) {
  if (!acl || typeof acl !== "object" || Array.isArray(acl)) {
    fail("accessControl must be an object");
  }
  if (acl.id !== "ACL-EVIDENCE-GENERAL" || acl.immutable !== true) {
    fail("accessControl must identify the immutable general evidence ACL");
  }
  requireText(acl.classification, "accessControl.classification");
  requireText(acl.enforcement, "accessControl.enforcement");
  uniqueSorted(acl.readers, "accessControl.readers");
  uniqueSorted(acl.writers, "accessControl.writers");
  requireText(acl.retention.policy, "accessControl.retention.policy");
  requireText(acl.retention.minimum, "accessControl.retention.minimum");
  requireIsoInstant(acl.retention.reviewAt, "accessControl.retention.reviewAt");
  requireIsoInstant(
    acl.retention.transportExpiresAt,
    "accessControl.retention.transportExpiresAt",
  );
  requireText(
    acl.retention.longTermProviderStatus,
    "accessControl.retention.longTermProviderStatus",
  );
  if (
    !["CONFIGURADO", "PENDENTE_ANTES_RELEASE_CANDIDATE"].includes(
      acl.retention.longTermProviderStatus,
    )
  ) {
    fail("unsupported long-term retention provider status");
  }
  if (acl.retention.longTermProviderStatus === "CONFIGURADO") {
    requireText(
      acl.retention.longTermProvider,
      "accessControl.retention.longTermProvider",
    );
    requireText(
      acl.retention.longTermObjectReference,
      "accessControl.retention.longTermObjectReference",
    );
    const receiptSourcePath = requireText(
      acl.retention.longTermReceiptSourcePath,
      "accessControl.retention.longTermReceiptSourcePath",
    );
    if (
      receiptSourcePath.startsWith("/") ||
      receiptSourcePath.startsWith("../") ||
      receiptSourcePath.includes("/../") ||
      receiptSourcePath.includes("\\")
    ) {
      fail("long-term receipt source path is unsafe");
    }
    requireHash(
      acl.retention.longTermReceiptSha256,
      "accessControl.retention.longTermReceiptSha256",
    );
  } else if (
    acl.retention.longTermProvider !== null ||
    acl.retention.longTermObjectReference !== null ||
    acl.retention.longTermReceiptSourcePath !== null ||
    acl.retention.longTermReceiptSha256 !== null
  ) {
    fail("pending long-term retention cannot declare an unverified provider");
  }
  if (
    !Number.isSafeInteger(acl.retention.transportRetentionDays) ||
    acl.retention.transportRetentionDays < 1
  ) {
    fail("accessControl.retention.transportRetentionDays must be positive");
  }
  if (
    Date.parse(acl.retention.reviewAt) >=
    Date.parse(acl.retention.transportExpiresAt)
  ) {
    fail("retention review must occur before transport expiration");
  }
}

function validateExecution(execution) {
  if (!execution || typeof execution !== "object" || Array.isArray(execution)) {
    fail("execution must be an object");
  }
  const provider = requireText(execution.provider, "execution.provider");
  for (const field of [
    "repository",
    "revision",
    "ref",
    "workflow",
    "attempt",
  ]) {
    if (execution[field] !== null) {
      requireText(execution[field], `execution.${field}`);
    }
  }
  if (
    !execution.outcomes ||
    typeof execution.outcomes !== "object" ||
    Array.isArray(execution.outcomes) ||
    !execution.metadata ||
    typeof execution.metadata !== "object" ||
    Array.isArray(execution.metadata)
  ) {
    fail("execution outcomes and metadata must be objects");
  }
  validateIdentity(execution.initiator, "execution.initiator");
  if (provider === "github-actions") {
    for (const field of [
      "repository",
      "revision",
      "ref",
      "workflow",
      "attempt",
    ]) {
      requireText(execution[field], `execution.${field}`);
    }
    if (!/^[a-f0-9]{40}(?:[a-f0-9]{24})?$/u.test(execution.revision)) {
      fail("execution.revision must be a Git commit SHA in GitHub Actions");
    }
  }
}

function evaluateCompleteness({
  artifacts,
  requirements,
  downloadOutcome,
  acl,
}) {
  const requirementIds = new Set();
  const evaluated = (requirements ?? []).map((requirement, index) => {
    const id = requireText(requirement.id, `requirements[${index}].id`);
    if (requirementIds.has(id))
      fail(`duplicate completeness requirement ${id}`);
    requirementIds.add(id);
    const match = requireText(
      requirement.match,
      `requirements[${index}].match`,
    );
    const minimumCount = requirement.minimumCount ?? 1;
    if (!Number.isSafeInteger(minimumCount) || minimumCount < 1) {
      fail(`requirements[${index}].minimumCount must be positive`);
    }
    const minimumBytes = requirement.minimumBytes ?? 1;
    if (!Number.isSafeInteger(minimumBytes) || minimumBytes < 1) {
      fail(`requirements[${index}].minimumBytes must be positive`);
    }
    const expression = globExpression(match);
    const matchedArtifacts = artifacts.filter((artifact) =>
      expression.test(artifact.sourcePath),
    );
    const matchedSourcePaths = matchedArtifacts
      .map((artifact) => artifact.sourcePath)
      .sort();
    const qualifyingSourcePaths = matchedArtifacts
      .filter((artifact) => artifact.bytes >= minimumBytes)
      .map((artifact) => artifact.sourcePath)
      .sort();
    return {
      id,
      match,
      minimumCount,
      minimumBytes,
      matchedSourcePaths,
      qualifyingSourcePaths,
      satisfied: qualifyingSourcePaths.length >= minimumCount,
    };
  });
  const transportRequired = downloadOutcome !== null;
  const transportSatisfied =
    !transportRequired || downloadOutcome === "success";
  const retentionSatisfied =
    acl.retention.longTermProviderStatus === "CONFIGURADO" &&
    artifacts.some(
      (artifact) =>
        artifact.sourcePath === acl.retention.longTermReceiptSourcePath &&
        artifact.sha256 === acl.retention.longTermReceiptSha256,
    );
  return {
    artifactDownloadOutcome: downloadOutcome,
    transportSatisfied,
    retentionSatisfied,
    requirements: evaluated,
    complete:
      transportSatisfied &&
      retentionSatisfied &&
      evaluated.every((requirement) => requirement.satisfied),
  };
}

function validateCompleteness(completeness, artifacts, acl, execution) {
  if (
    !completeness ||
    typeof completeness !== "object" ||
    Array.isArray(completeness)
  ) {
    fail("completeness must be an object");
  }
  if (
    completeness.artifactDownloadOutcome !== null &&
    !["success", "failure", "cancelled", "skipped"].includes(
      completeness.artifactDownloadOutcome,
    )
  ) {
    fail("unsupported artifact download outcome");
  }
  if (
    execution.provider === "github-actions" &&
    completeness.artifactDownloadOutcome === null
  ) {
    fail("GitHub evidence must record the artifact download outcome");
  }
  const expectedRequirements = etp00EvidenceRequirements(
    execution.provider,
    execution.outcomes,
  );
  for (const expected of expectedRequirements) {
    const declared = completeness.requirements?.find(
      (requirement) => requirement.id === expected.id,
    );
    if (!declared || declared.match !== expected.match) {
      fail(`missing mandatory evidence requirement ${expected.id}`);
    }
  }
  const recalculated = evaluateCompleteness({
    artifacts,
    requirements: completeness.requirements,
    downloadOutcome: completeness.artifactDownloadOutcome,
    acl,
  });
  if (JSON.stringify(completeness) !== JSON.stringify(recalculated)) {
    fail("evidence completeness result is inconsistent");
  }
}

async function hardenRunFiles(runDirectory) {
  async function harden(directory) {
    const entries = await readdir(directory, { withFileTypes: true });
    for (const entry of entries) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) {
        await harden(path);
      } else if (entry.isFile()) {
        await chmod(path, 0o440);
      }
    }
  }
  await harden(runDirectory);
}

async function hardenRunDirectories(runDirectory) {
  async function harden(directory) {
    const entries = await readdir(directory, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) await harden(join(directory, entry.name));
    }
    await chmod(directory, 0o550);
  }
  await harden(runDirectory);
}

function validateAsvsGate(gate) {
  if (!gate || typeof gate !== "object" || Array.isArray(gate)) {
    fail("qualityGates.asvs must be an object");
  }
  const status = requireText(gate.status, "qualityGates.asvs.status");
  if (
    ![
      "APROVADO",
      "AGUARDA_APROVACAO_SEGURANCA",
      "REJEITADO",
      "NAO_DISPONIVEL",
    ].includes(status)
  ) {
    fail("qualityGates.asvs.status is unsupported");
  }
  if (gate.sourceSha256 !== null) {
    requireHash(gate.sourceSha256, "qualityGates.asvs.sourceSha256");
  }
  if (gate.approvalSubjectSha256 !== null) {
    requireHash(
      gate.approvalSubjectSha256,
      "qualityGates.asvs.approvalSubjectSha256",
    );
  }
  if (gate.approvedSubjectSha256 !== null) {
    requireHash(
      gate.approvedSubjectSha256,
      "qualityGates.asvs.approvedSubjectSha256",
    );
  }
  const actuallyApproved =
    gate.status === "APROVADO" &&
    typeof gate.responsible === "string" &&
    gate.responsible.trim() !== "" &&
    typeof gate.approvedAt === "string" &&
    !Number.isNaN(Date.parse(gate.approvedAt)) &&
    new Date(gate.approvedAt).toISOString() === gate.approvedAt &&
    gate.approvedSubjectSha256 === gate.approvalSubjectSha256;
  if (gate.approvalComplete !== actuallyApproved) {
    fail("ASVS approval completeness is inconsistent");
  }
  if (
    status === "AGUARDA_APROVACAO_SEGURANCA" &&
    (gate.responsible !== null ||
      gate.approvedAt !== null ||
      gate.approvedSubjectSha256 !== null)
  ) {
    fail("pending ASVS approval cannot name an approver or approval instant");
  }
}

function validateReplacement(replacement, runId) {
  if (!replacement || typeof replacement !== "object") {
    fail("replacement must be an object");
  }
  if (!Array.isArray(replacement.chain))
    fail("replacement.chain must be an array");
  const seen = new Set([runId]);
  for (const [index, item] of replacement.chain.entries()) {
    requireText(item.runId, `replacement.chain[${index}].runId`);
    if (!RUN_ID_PATTERN.test(item.runId)) {
      fail(`replacement.chain[${index}].runId contains unsafe characters`);
    }
    requireHash(
      item.manifestSha256,
      `replacement.chain[${index}].manifestSha256`,
    );
    if (seen.has(item.runId)) fail("replacement chain contains a cycle");
    seen.add(item.runId);
  }
  if (replacement.previous === null) {
    if (replacement.chain.length !== 0 || replacement.reason !== null) {
      fail("an original manifest cannot have a replacement chain or reason");
    }
    return;
  }
  const previous = replacement.previous;
  requireText(previous.runId, "replacement.previous.runId");
  if (!RUN_ID_PATTERN.test(previous.runId)) {
    fail("replacement.previous.runId contains unsafe characters");
  }
  requireHash(previous.manifestSha256, "replacement.previous.manifestSha256");
  requireText(replacement.reason, "replacement.reason");
  const last = replacement.chain.at(-1);
  if (
    !last ||
    last.runId !== previous.runId ||
    last.manifestSha256 !== previous.manifestSha256
  ) {
    fail("replacement.previous must be the last chain element");
  }
}

export async function finalizeEvidenceRun(options) {
  const runId = requireText(options.runId, "runId");
  if (!RUN_ID_PATTERN.test(runId)) fail("runId contains unsafe characters");
  const scope = requireText(options.scope ?? "ETP-00", "scope");
  const sourceDirectory = resolve(options.sourceDirectory);
  const outputRoot = resolve(options.outputRoot);
  const bindingsPath = resolve(options.bindingsPath);
  const finalRun = join(outputRoot, "runs", runId);
  const temporaryRun = join(
    outputRoot,
    "runs",
    `.tmp-${runId}-${randomUUID()}`,
  );
  if (await exists(finalRun))
    fail(`run ${runId} already exists and cannot be overwritten`);
  if (!(await exists(sourceDirectory)))
    fail("evidence source directory does not exist");
  const files = await collectFiles(sourceDirectory);
  if (files.length === 0) fail("evidence source directory is empty");
  const catalog = await loadBindings(bindingsPath);
  const generatedAt = (
    options.generatedAt ?? new Date().toISOString()
  ).toString();
  requireIsoInstant(generatedAt, "generatedAt");
  validateIdentity(options.responsible.identity, "responsible.identity");
  requireText(options.responsible.role, "responsible.role");
  validateAcl(options.accessControl);
  validateVersions(options.versions);

  await mkdir(dirname(temporaryRun), { recursive: true });
  await mkdir(temporaryRun, { recursive: false });
  try {
    const artifacts = [];
    for (const [index, sourcePath] of files.entries()) {
      const logicalPath = normalizedRelativePath(sourceDirectory, sourcePath);
      const captured = await captureFile({
        sourcePath,
        logicalPath,
        temporaryRun,
        catalog,
      });
      artifacts.push({
        artifactId: `EVD-${scope}-${runId}-${String(index + 1).padStart(4, "0")}`,
        ...captured,
      });
    }

    let previous = null;
    let chain = [];
    let replacementReason = null;
    if (options.supersedesManifestPath) {
      replacementReason = requireText(
        options.replacementReason,
        "replacementReason",
      );
      const prior = await validateEvidenceRun({
        manifestPath: resolve(options.supersedesManifestPath),
      });
      if (prior.manifest.runId === runId) fail("a run cannot replace itself");
      previous = {
        runId: prior.manifest.runId,
        manifestSha256: prior.manifestSha256,
      };
      chain = [...prior.manifest.replacement.chain, previous];
    }

    const asvs = await asvsSnapshot(options.asvsManifestPath);
    const manifest = {
      schemaVersion: EVIDENCE_SCHEMA_VERSION,
      contractVersion: EVIDENCE_CONTRACT_VERSION,
      manifestId: `EVD-${scope}-${runId}`,
      runId,
      scope,
      generatedAt,
      execution: {
        provider: requireText(options.execution.provider, "execution.provider"),
        repository: options.execution.repository ?? null,
        revision: options.execution.revision ?? null,
        ref: options.execution.ref ?? null,
        workflow: options.execution.workflow ?? null,
        attempt: options.execution.attempt ?? null,
        outcomes: options.execution.outcomes ?? {},
        metadata: options.execution.metadata ?? {},
        initiator: options.execution.initiator ?? null,
      },
      responsible: {
        role: options.responsible.role,
        identity: options.responsible.identity ?? null,
      },
      versions: options.versions,
      caseBindings: {
        version: catalog.version,
        sha256: catalog.sha256,
      },
      cases: [
        ...new Set(artifacts.flatMap((artifact) => artifact.caseIds)),
      ].sort(),
      accessControl: options.accessControl,
      completeness: evaluateCompleteness({
        artifacts,
        requirements: options.requirements,
        downloadOutcome: options.artifactDownloadOutcome ?? null,
        acl: options.accessControl,
      }),
      qualityGates: {
        asvs,
        sealingDoesNotApproveRelease: true,
      },
      replacement: {
        previous,
        reason: replacementReason,
        chain,
      },
      artifacts,
    };
    validateExecution(manifest.execution);
    validateCompleteness(
      manifest.completeness,
      manifest.artifacts,
      manifest.accessControl,
      manifest.execution,
    );
    validateAsvsGate(manifest.qualityGates.asvs);
    const manifestBytes = Buffer.from(`${JSON.stringify(manifest, null, 2)}\n`);
    const manifestSha256 = sha256Bytes(manifestBytes);
    await writeFile(join(temporaryRun, "manifest.json"), manifestBytes, {
      flag: "wx",
    });
    await writeFile(
      join(temporaryRun, "manifest.sha256"),
      `${manifestSha256}  manifest.json\n`,
      { flag: "wx" },
    );
    if (await exists(finalRun)) fail(`run ${runId} appeared while sealing`);
    await hardenRunFiles(temporaryRun);
    await rename(temporaryRun, finalRun);
    await hardenRunDirectories(finalRun);
    return {
      manifestPath: join(finalRun, "manifest.json"),
      manifestSha256,
      manifest,
    };
  } catch (error) {
    await rm(temporaryRun, { recursive: true, force: true });
    throw error;
  }
}

export async function validateEvidenceRun(options) {
  const manifestPath = resolve(options.manifestPath);
  const runDirectory = dirname(manifestPath);
  const repositoryRuns = dirname(runDirectory);
  const { bytes, manifest, digest } = await readManifestAndDigest(manifestPath);
  const sidecar = await readFile(join(runDirectory, "manifest.sha256"), "utf8");
  if (sidecar !== `${digest}  manifest.json\n`)
    fail("manifest checksum sidecar mismatch");
  if (
    manifest.schemaVersion !== EVIDENCE_SCHEMA_VERSION ||
    manifest.contractVersion !== EVIDENCE_CONTRACT_VERSION
  ) {
    fail("unsupported manifest schema or contract version");
  }
  const runId = requireText(manifest.runId, "runId");
  if (!RUN_ID_PATTERN.test(runId) || basename(runDirectory) !== runId) {
    fail("runId does not match its immutable repository directory");
  }
  const scope = requireText(manifest.scope, "scope");
  if (manifest.manifestId !== `EVD-${scope}-${runId}`) {
    fail("manifestId does not match scope and runId");
  }
  requireIsoInstant(manifest.generatedAt, "generatedAt");
  validateExecution(manifest.execution);
  requireText(manifest.responsible.role, "responsible.role");
  validateIdentity(manifest.responsible.identity, "responsible.identity");
  validateVersions(manifest.versions);
  requireText(manifest.caseBindings.version, "caseBindings.version");
  requireHash(manifest.caseBindings.sha256, "caseBindings.sha256");
  validateAcl(manifest.accessControl);
  validateAsvsGate(manifest.qualityGates?.asvs);
  if (manifest.qualityGates?.sealingDoesNotApproveRelease !== true) {
    fail("sealing must not be represented as release approval");
  }
  validateReplacement(manifest.replacement, runId);
  if (!Array.isArray(manifest.artifacts) || manifest.artifacts.length === 0) {
    fail("manifest must contain at least one artifact");
  }
  validateCompleteness(
    manifest.completeness,
    manifest.artifacts,
    manifest.accessControl,
    manifest.execution,
  );

  const artifactIds = new Set();
  const sourcePaths = new Set();
  const artifactCases = new Set();
  for (const [index, artifact] of manifest.artifacts.entries()) {
    const prefix = `artifacts[${index}]`;
    const artifactId = requireText(artifact.artifactId, `${prefix}.artifactId`);
    const expectedArtifactId = `EVD-${scope}-${runId}-${String(index + 1).padStart(4, "0")}`;
    if (artifactId !== expectedArtifactId) {
      fail(`artifactId sequence mismatch at ${prefix}`);
    }
    if (artifactIds.has(artifactId)) fail(`duplicate artifactId ${artifactId}`);
    artifactIds.add(artifactId);
    const sourcePath = requireText(artifact.sourcePath, `${prefix}.sourcePath`);
    if (
      sourcePath.startsWith("/") ||
      sourcePath === ".." ||
      sourcePath.startsWith("../") ||
      sourcePath.includes("/../") ||
      sourcePath.includes("\\")
    ) {
      fail(`unsafe sourcePath ${sourcePath}`);
    }
    if (sourcePaths.has(sourcePath)) fail(`duplicate sourcePath ${sourcePath}`);
    sourcePaths.add(sourcePath);
    const sha256 = requireHash(artifact.sha256, `${prefix}.sha256`);
    const expectedStoredPath = `objects/sha256/${sha256.slice(0, 2)}/${sha256}`;
    if (artifact.storedPath !== expectedStoredPath) {
      fail(`content-addressed path mismatch for ${sourcePath}`);
    }
    if (!Number.isSafeInteger(artifact.bytes) || artifact.bytes < 0) {
      fail(`invalid byte length for ${sourcePath}`);
    }
    requireText(artifact.mediaType, `${prefix}.mediaType`);
    if (artifact.aclId !== manifest.accessControl.id) {
      fail(`ACL mismatch for ${sourcePath}`);
    }
    const caseIds = uniqueSorted(artifact.caseIds, `${prefix}.caseIds`);
    uniqueSorted(artifact.bindingRuleIds, `${prefix}.bindingRuleIds`);
    for (const caseId of caseIds) artifactCases.add(caseId);
    const objectPath = join(runDirectory, ...expectedStoredPath.split("/"));
    const details = await stat(objectPath);
    if (!details.isFile() || details.size !== artifact.bytes) {
      fail(`object size mismatch for ${sourcePath}`);
    }
    if ((await sha256File(objectPath)) !== sha256) {
      fail(`object checksum mismatch for ${sourcePath}`);
    }
    if (artifact.mediaType === "application/json") {
      try {
        JSON.parse(await readFile(objectPath, "utf8"));
      } catch {
        fail(`invalid JSON object for ${sourcePath}`);
      }
    }
  }
  const declaredCases = uniqueSorted(manifest.cases, "cases");
  if (
    JSON.stringify(declaredCases) !== JSON.stringify([...artifactCases].sort())
  ) {
    fail("top-level cases must equal the union of artifact cases");
  }

  if (options.requireChainTargets !== false) {
    for (const [index, item] of manifest.replacement.chain.entries()) {
      const target = join(repositoryRuns, item.runId, "manifest.json");
      if (!(await exists(target)))
        fail(`replacement target ${item.runId} is absent`);
      const targetResult = await validateEvidenceRun({
        manifestPath: target,
        requireChainTargets: false,
      });
      if (targetResult.manifestSha256 !== item.manifestSha256) {
        fail(`replacement target checksum mismatch for ${item.runId}`);
      }
      const expectedPrefix = manifest.replacement.chain.slice(0, index);
      if (
        JSON.stringify(targetResult.manifest.replacement.chain) !==
        JSON.stringify(expectedPrefix)
      ) {
        fail(`replacement chain is not linear at ${item.runId}`);
      }
    }
  }

  if (
    options.requireComplete === true &&
    manifest.completeness.complete !== true
  ) {
    fail("evidence run is sealed but incomplete");
  }

  return {
    manifest,
    manifestSha256: digest,
    manifestBytes: bytes.length,
    artifacts: manifest.artifacts.length,
  };
}

export async function aggregateFileSetHash(root, paths) {
  const resolvedRoot = resolve(root);
  const normalized = paths
    .map((path) => resolve(path))
    .sort((left, right) => left.localeCompare(right));
  if (normalized.length === 0) fail("aggregate hash file set is empty");
  const hash = createHash("sha256");
  for (const path of normalized) {
    const logicalPath = normalizedRelativePath(resolvedRoot, path);
    hash.update(logicalPath);
    hash.update("\0");
    hash.update(await sha256File(path));
    hash.update("\n");
  }
  return hash.digest("hex");
}
