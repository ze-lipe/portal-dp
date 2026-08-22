import { createHash } from "node:crypto";
import { lstat, readFile, realpath } from "node:fs/promises";
import {
  basename,
  dirname,
  isAbsolute,
  join,
  relative,
  resolve,
  sep,
} from "node:path";

import {
  loadEvidenceBindings,
  sha256File,
  validateEvidenceRun,
} from "./evidence-repository.mjs";
import { validateSecurityConfigurationReport } from "./security-configuration-contract.mjs";

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
  argument("evidence-index") ??
    resolve(root, "evidencias/manifests/asvs-evidence-index-v5.0.0.json"),
);
const stageGatesPath = resolve(
  argument("stage-gates") ??
    resolve(root, "evidencias/manifests/asvs-stage-gates-v5.0.0.json"),
);
const canonicalBindingsRelativePath =
  "evidencias/manifests/evidence-bindings-etp00-v1.json";
const canonicalBindingsPath = resolve(root, canonicalBindingsRelativePath);
const expectedHash =
  "8201b20eec2908c3380ac600c91c8ba746346fbb808859366abb232027532311";

const [sourceBytes, manifestText, evidenceText, stageGatesText] =
  await Promise.all([
    readFile(sourcePath),
    readFile(manifestPath, "utf8"),
    readFile(evidencePath, "utf8"),
    readFile(stageGatesPath, "utf8"),
  ]);
const source = JSON.parse(sourceBytes.toString("utf8"));
const manifest = JSON.parse(manifestText);
const evidenceIndex = JSON.parse(evidenceText);
const stageGates = JSON.parse(stageGatesText);
const canonicalBindingsBytes = await readFile(canonicalBindingsPath);
const canonicalBindingsSha256 = createHash("sha256")
  .update(canonicalBindingsBytes)
  .digest("hex");
const canonicalBindings = await loadEvidenceBindings(canonicalBindingsPath);
const canonicalRulesById = new Map(
  canonicalBindings.rules.map((rule) => [rule.id, rule]),
);
const errors = [];
const requireApproved =
  process.argv.includes("--require-approved") ||
  process.argv.includes("--require-applicability-approved");
const requiredStage = argument("require-stage");
const requireFinal = process.argv.includes("--require-final");

// Estes casos são a contribuição ASVS que já nasce executável na ETP-00.
// Um resultado de caso não encerra, isoladamente, nenhum controle ASVS.
const expectedEtp00Cases = [
  "QAT-AUD-007",
  "QAT-SEC-006",
  "QAT-SEC-007",
  "QAT-SEC-021",
  "QAT-SEC-032",
  "QAT-SEC-034",
  "QAT-SEC-035",
  "QAT-SEC-037",
  "TST-API-001",
  "TST-API-020",
];
const expectedDeferredIntegralCases = [
  "QAT-RES-009",
  "QAT-SEC-023",
  "QAT-SEC-037",
  "TST-API-010",
];
const expectedEtp00BindingGroups = new Map([
  ["QAT-AUD-007", [["BIND-UNIT-TEST-REPORT"], ["BIND-GAT-02-DATABASE"]]],
  [
    "QAT-SEC-006",
    [
      ["BIND-UNIT-TEST-REPORT"],
      ["BIND-GAT-02-DATABASE"],
      ["BIND-OCI-API-SESSION"],
    ],
  ],
  ["QAT-SEC-007", [["BIND-UNIT-TEST-REPORT"], ["BIND-GAT-02-DATABASE"]]],
  [
    "QAT-SEC-021",
    [
      ["BIND-SCA-PNPM"],
      ["BIND-LICENSES"],
      ["BIND-SBOM-CYCLONEDX"],
      ["BIND-BUILD-TOOLCHAIN"],
      ["BIND-OCI-ARTIFACT"],
      ["BIND-OCI-DIGEST"],
      ["BIND-OCI-BUILD-LINK"],
      ["BIND-TRIVY-IMAGE"],
    ],
  ],
  ["QAT-SEC-032", [["BIND-GAT-02-DATABASE"]]],
  ["QAT-SEC-034", [["BIND-SECRET-SCAN"]]],
  ["QAT-SEC-035", [["BIND-SAST"]]],
  [
    "QAT-SEC-037",
    [["BIND-SECURITY-CONFIG-VERIFICATION"], ["BIND-TRIVY-CONFIG"]],
  ],
  [
    "TST-API-001",
    [
      ["BIND-UNIT-TEST-REPORT"],
      ["BIND-GAT-02-DATABASE"],
      ["BIND-OCI-API-READY"],
    ],
  ],
  ["TST-API-020", [["BIND-UNIT-TEST-REPORT"], ["BIND-GAT-02-DATABASE"]]],
]);

function isIsoInstant(value) {
  return (
    typeof value === "string" &&
    !Number.isNaN(Date.parse(value)) &&
    new Date(value).toISOString() === value
  );
}

function isHash(value) {
  return typeof value === "string" && /^[a-f0-9]{64}$/u.test(value);
}

function isNamedResponsible(value) {
  return (
    typeof value === "string" &&
    value.trim() !== "" &&
    !/a definir|titular nominal/iu.test(value)
  );
}

async function safeRepositoryFile(value, label) {
  if (typeof value !== "string" || value.trim() === "" || isAbsolute(value)) {
    errors.push(`${label} must be a repository-relative file path`);
    return null;
  }
  const path = resolve(root, value);
  const repositoryRelativePath = relative(root, path);
  if (
    repositoryRelativePath === "" ||
    repositoryRelativePath === ".." ||
    repositoryRelativePath.startsWith(`..${sep}`) ||
    isAbsolute(repositoryRelativePath)
  ) {
    errors.push(`${label} is outside the repository`);
    return null;
  }
  try {
    const details = await lstat(path);
    if (!details.isFile() || details.isSymbolicLink()) {
      errors.push(`${label} must be a regular file, never a symbolic link`);
      return null;
    }
    const canonical = await realpath(path);
    const canonicalRelativePath = relative(root, canonical);
    if (
      canonicalRelativePath === "" ||
      canonicalRelativePath === ".." ||
      canonicalRelativePath.startsWith(`..${sep}`) ||
      isAbsolute(canonicalRelativePath)
    ) {
      errors.push(`${label} resolves outside the repository`);
      return null;
    }
    return path;
  } catch {
    errors.push(`${label} does not exist`);
    return null;
  }
}

function normalizedBindingGroups(value, caseId) {
  if (!Array.isArray(value) || value.length === 0) {
    errors.push(`${caseId} must declare required binding rule groups`);
    return [];
  }
  return value.map((group, groupIndex) => {
    if (!Array.isArray(group) || group.length === 0) {
      errors.push(
        `${caseId} binding group ${groupIndex + 1} must not be empty`,
      );
      return [];
    }
    const normalized = [...new Set(group)].sort();
    if (
      normalized.length !== group.length ||
      group.some((ruleId) => typeof ruleId !== "string" || ruleId === "")
    ) {
      errors.push(`${caseId} binding group ${groupIndex + 1} is invalid`);
    }
    return normalized;
  });
}

function hasHighOrCritical(items) {
  return (Array.isArray(items) ? items : []).some((item) =>
    ["HIGH", "CRITICAL"].includes(String(item?.Severity ?? "").toUpperCase()),
  );
}

async function validateCriticalEvidenceSemantics(run, runManifestPath) {
  const artifactsNamed = (name) =>
    run.artifacts.filter((artifact) => basename(artifact.sourcePath) === name);
  const oneArtifactNamed = (name) => {
    const matches = artifactsNamed(name);
    if (matches.length !== 1) {
      throw new Error(`${name} must occur exactly once in the sealed run`);
    }
    return matches[0];
  };
  const ociArchive = oneArtifactNamed("portal-dp.oci.tar");
  const expectedSbomComponents = [
    "api",
    "contracts",
    "database",
    "domain",
    "integrations",
    "observability",
    "portal-dp",
    "storage",
    "testing",
    "web",
    "worker",
  ];
  const sbomArtifacts = run.artifacts.filter((artifact) =>
    basename(artifact.sourcePath).endsWith(".cdx.json"),
  );
  if (sbomArtifacts.length !== expectedSbomComponents.length) {
    throw new Error("sealed run must contain the 11 expected CycloneDX SBOMs");
  }
  const observedSbomComponents = new Set();
  let totalSbomDependencies = 0;
  const ociDigestArtifact = oneArtifactNamed("portal-dp.oci.sha256");
  const ociDigestPath = join(
    dirname(runManifestPath),
    ...ociDigestArtifact.storedPath.split("/"),
  );
  const ociDigestText = await readFile(ociDigestPath, "utf8");
  const digestMatch = ociDigestText.match(/^([a-f0-9]{64})\s+\S+\s*$/u);
  if (!digestMatch || digestMatch[1] !== ociArchive.sha256) {
    throw new Error(
      "OCI digest report does not identify the sealed OCI archive",
    );
  }

  for (const artifact of run.artifacts) {
    const objectPath = join(
      dirname(runManifestPath),
      ...artifact.storedPath.split("/"),
    );
    const name = basename(artifact.sourcePath);
    if (name === "unit-tests.log") {
      const report = await readFile(objectPath, "utf8");
      if (!report.includes("ETP00_UNIT_TEST_COMMAND_STATUS=PASSOU")) {
        throw new Error(
          "unit test log does not prove successful command completion",
        );
      }
      continue;
    }
    if (artifact.mediaType !== "application/json") continue;
    const report = JSON.parse(await readFile(objectPath, "utf8"));
    if (name === "gat-02-vitest.json") {
      const catalog = JSON.parse(
        await readFile(
          resolve(root, "evidencias/manifests/gat-02-cases-v1.json"),
          "utf8",
        ),
      );
      const assertions = Array.isArray(report.testResults)
        ? report.testResults.flatMap((suite) => suite.assertionResults ?? [])
        : [];
      const actualTitles = assertions.map((item) => item.title).sort();
      const expectedTitles = [...catalog.caseTitles].sort();
      if (
        report.success !== true ||
        report.numTotalTests !== catalog.expectedCount ||
        report.numPassedTests !== catalog.expectedCount ||
        report.numFailedTests !== 0 ||
        report.numPendingTests !== 0 ||
        assertions.some((item) => item.status !== "passed") ||
        JSON.stringify(actualTitles) !== JSON.stringify(expectedTitles)
      ) {
        throw new Error("GAT-02 report does not prove the canonical 20 cases");
      }
    } else if (name === "gitleaks-result.json") {
      if (
        report.schemaVersion !== 1 ||
        report.redacted !== true ||
        report.outcome !== "success" ||
        report.passed !== true ||
        report.conclusion !== "SEM_ACHADOS_BLOQUEADORES"
      ) {
        throw new Error("Gitleaks report does not prove a clean redacted scan");
      }
    } else if (name === "sast-semgrep.json") {
      const snapshot = report.portalDpRuleSnapshot;
      const expectedSnapshotHashes = [
        "1fff4cefffa4debfe8e4f61cf1a8b1b022d98b72b1a9d72d4eeef8a5eeaa8a53",
        "6248ea7477e6da0db10305c0281f7cd908485691747f4fd641275145075f3b22",
        "eb9ce79ff8974938061ec2ab0bb1e8c20a17372458cfaa4e8bcb24ac7e22a41f",
      ];
      if (
        !Array.isArray(report.results) ||
        !Array.isArray(report.errors) ||
        !Array.isArray(report.paths?.scanned) ||
        report.paths.scanned.length === 0 ||
        report.paths.scanned.some(
          (path) => typeof path !== "string" || path === "",
        ) ||
        report.errors.length !== 0 ||
        report.results.some(
          (item) =>
            String(item?.severity).toUpperCase() === "ERROR" ||
            JSON.stringify(Object.keys(item).sort()) !==
              JSON.stringify(
                ["checkId", "end", "path", "severity", "start"].sort(),
              ),
        ) ||
        report.redaction?.status !== "APLICADA" ||
        report.redaction?.policy !== "SEMGREP_FINDINGS_ALLOWLIST_V1" ||
        snapshot?.status !== "VERIFICADO" ||
        snapshot?.capturedAt !== "2026-08-22" ||
        snapshot?.uniqueRuleIds !== 563 ||
        snapshot?.networkUsedDuringScan !== false ||
        !Array.isArray(snapshot?.snapshots) ||
        snapshot.snapshots.length !== 3 ||
        JSON.stringify(snapshot.snapshots.map((item) => item.sha256).sort()) !==
          JSON.stringify(expectedSnapshotHashes)
      ) {
        throw new Error("Semgrep report contains errors or blocking findings");
      }
    } else if (name === "trivy-image.json" || name === "trivy-config.json") {
      if (
        !Array.isArray(report.Results) ||
        report.Results.length === 0 ||
        report.Results.some(
          (target) =>
            typeof target?.Target !== "string" || target.Target === "",
        ) ||
        report.Results.some(
          (target) =>
            hasHighOrCritical(target.Vulnerabilities) ||
            hasHighOrCritical(target.Misconfigurations),
        )
      ) {
        throw new Error(`${name} contains blocking findings or invalid data`);
      }
    } else if (name === "pnpm-audit-production.json") {
      const vulnerabilities = report.metadata?.vulnerabilities;
      if (
        !vulnerabilities ||
        Number(vulnerabilities.high ?? 0) !== 0 ||
        Number(vulnerabilities.critical ?? 0) !== 0
      ) {
        throw new Error("pnpm audit report contains high/critical findings");
      }
    } else if (name === "licenses-production.json") {
      if (
        !Array.isArray(report.packages) ||
        report.packages.length === 0 ||
        report.packages.some(
          (item) =>
            typeof item.name !== "string" ||
            typeof item.version !== "string" ||
            typeof item.license !== "string" ||
            item.license === "",
        )
      ) {
        throw new Error("license report does not contain a valid inventory");
      }
    } else if (name.endsWith(".cdx.json")) {
      if (
        report.bomFormat !== "CycloneDX" ||
        report.specVersion !== "1.7" ||
        !Array.isArray(report.components) ||
        report.components.some(
          (component) =>
            typeof component?.name !== "string" ||
            component.name === "" ||
            typeof component?.version !== "string" ||
            component.version === "",
        ) ||
        typeof report.metadata?.component?.name !== "string" ||
        report.metadata.component.name === "" ||
        typeof report.metadata?.component?.version !== "string" ||
        report.metadata.component.version === ""
      ) {
        throw new Error("SBOM is not a valid CycloneDX component inventory");
      }
      observedSbomComponents.add(report.metadata.component.name);
      totalSbomDependencies += report.components.length;
    } else if (name === "build-toolchain-verification.json") {
      const expected = report.expected ?? {};
      const observed = report.observed ?? {};
      if (
        report.schemaVersion !== 1 ||
        report.reportType !== "BUILD_TOOLCHAIN_VERIFICATION" ||
        report.status !== "PASSOU" ||
        report.source !== "GITHUB_ACTIONS_OCI_BUILD" ||
        expected.buildxVersion !== "v0.36.1" ||
        expected.buildKitVersion !== "v0.32.2" ||
        expected.buildKitImage !==
          "moby/buildkit:v0.32.2@sha256:28a898719c18a33f4e8000685287fa36fd0dd9560c6440227d3a732d79bb41d8" ||
        expected.driver !== "docker-container" ||
        expected.platform !== "linux/amd64" ||
        observed.buildxVersion !== expected.buildxVersion ||
        observed.driver !== expected.driver ||
        !Array.isArray(observed.nodes) ||
        observed.nodes.length === 0 ||
        observed.nodes.some(
          (node) =>
            node.status !== "running" ||
            node.buildKitVersion !== expected.buildKitVersion ||
            !Array.isArray(node.platforms) ||
            !node.platforms.includes(expected.platform),
        )
      ) {
        throw new Error(
          "build toolchain report does not prove the pinned Buildx/BuildKit runtime",
        );
      }
    } else if (name === "security-configuration-verification.json") {
      validateSecurityConfigurationReport(report);
    } else if (name === "oci-api-ready.json") {
      if (
        report.status !== "ready" ||
        Object.keys(report).some((key) => key !== "status")
      ) {
        throw new Error(
          "OCI API readiness report is not the expected response",
        );
      }
    } else if (name === "oci-api-session-check.json") {
      if (
        report.verified !== true ||
        report.endpoint !== "/api/v1/sessao" ||
        report.statusCode !== 200
      ) {
        throw new Error(
          "OCI API session report does not prove the expected route",
        );
      }
    } else if (name === "oci-worker-verification.json") {
      if (
        report.verified !== true ||
        report.status !== "SUCCEEDED" ||
        report.attempt_count !== 1 ||
        report.validation_status !== "AVAILABLE" ||
        report.audit_count !== "2"
      ) {
        throw new Error(
          "OCI worker report does not prove the expected processing",
        );
      }
    } else if (name === "oci-build-link.json") {
      const expectedTopLevelKeys = [
        "buildDigest",
        "builder",
        "localImageId",
        "metadata",
        "ociArchiveSha256",
        "ociIndex",
        "sanitization",
        "schemaVersion",
      ];
      const expectedMetadataKeys = [
        "containerImageConfigDigest",
        "containerImageDigest",
      ];
      const expectedIndexKeys = [
        "attestationDescriptorCount",
        "attestations",
        "allImageLayerBlobsVerified",
        "buildDigestLinked",
        "configDigestLinked",
        "digest",
        "imageLayerCount",
        "linkage",
        "linkedMediaType",
        "manifestCount",
      ];
      if (
        report.schemaVersion !== 2 ||
        report.builder !== "docker/build-push-action" ||
        !/^sha256:[a-f0-9]{64}$/u.test(report.buildDigest ?? "") ||
        !/^sha256:[a-f0-9]{64}$/u.test(report.localImageId ?? "") ||
        report.ociArchiveSha256 !== ociArchive.sha256 ||
        JSON.stringify(Object.keys(report).sort()) !==
          JSON.stringify(expectedTopLevelKeys) ||
        JSON.stringify(Object.keys(report.metadata ?? {}).sort()) !==
          JSON.stringify(expectedMetadataKeys) ||
        report.metadata?.containerImageDigest !== report.buildDigest ||
        report.metadata?.containerImageConfigDigest !== report.localImageId ||
        JSON.stringify(Object.keys(report.ociIndex ?? {}).sort()) !==
          JSON.stringify(expectedIndexKeys) ||
        !/^sha256:[a-f0-9]{64}$/u.test(report.ociIndex?.digest ?? "") ||
        !Number.isInteger(report.ociIndex?.manifestCount) ||
        report.ociIndex.manifestCount < 1 ||
        !Number.isInteger(report.ociIndex?.attestationDescriptorCount) ||
        report.ociIndex.attestationDescriptorCount < 1 ||
        !Number.isInteger(report.ociIndex?.imageLayerCount) ||
        report.ociIndex.imageLayerCount < 1 ||
        report.ociIndex.allImageLayerBlobsVerified !== true ||
        report.ociIndex.buildDigestLinked !== true ||
        report.ociIndex.configDigestLinked !== true ||
        !["INDEX_ROOT", "DESCRIPTOR_GRAPH"].includes(report.ociIndex.linkage) ||
        typeof report.ociIndex.linkedMediaType !== "string" ||
        report.ociIndex.linkedMediaType === "" ||
        JSON.stringify(
          Object.keys(report.ociIndex.attestations ?? {}).sort(),
        ) !==
          JSON.stringify([
            "provenanceLinked",
            "referenceLinked",
            "sbomLinked",
          ]) ||
        report.ociIndex.attestations?.referenceLinked !== true ||
        report.ociIndex.attestations?.provenanceLinked !== true ||
        report.ociIndex.attestations?.sbomLinked !== true ||
        typeof report.sanitization !== "string" ||
        report.sanitization === ""
      ) {
        throw new Error(
          "OCI build link does not prove one coherent build artifact",
        );
      }
    }
  }
  if (
    JSON.stringify([...observedSbomComponents].sort()) !==
      JSON.stringify(expectedSbomComponents) ||
    totalSbomDependencies === 0
  ) {
    throw new Error(
      "SBOM set does not represent all workspaces and their dependencies",
    );
  }
}

async function validateArtifact(result, label) {
  if (!isHash(result.artifactSha256)) {
    errors.push(`${label} passed without a valid artifact SHA-256`);
    return;
  }
  if (typeof result.artifactPath !== "string" || result.artifactPath === "") {
    errors.push(`${label} passed without an artifact path`);
    return;
  }

  const artifactPath = resolve(root, result.artifactPath);
  const repositoryRelativePath = relative(root, artifactPath);
  if (
    repositoryRelativePath === "" ||
    repositoryRelativePath === ".." ||
    repositoryRelativePath.startsWith(`..${sep}`) ||
    isAbsolute(repositoryRelativePath)
  ) {
    errors.push(`${label} artifact is outside the repository`);
    return;
  }

  try {
    const bytes = await readFile(artifactPath);
    const hash = createHash("sha256").update(bytes).digest("hex");
    if (hash !== result.artifactSha256) {
      errors.push(`${label} artifact SHA-256 does not match its file`);
    }
  } catch {
    errors.push(`${label} artifact file does not exist`);
  }
}

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
  (Array.isArray(evidenceIndex.records) ? evidenceIndex.records : []).map(
    (record) => record.evidenceId,
  ),
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
  if (control.result !== "BLOQUEADO") {
    errors.push(
      `Applicability snapshot cannot claim an execution result for ${control.asvsId}`,
    );
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

const selectedControls = manifest.controls.filter(
  (control) => control.profileSelected,
);
const evidenceRecords = Array.isArray(evidenceIndex.records)
  ? evidenceIndex.records
  : [];
if (!Array.isArray(evidenceIndex.records)) {
  errors.push("ASVS evidence index records must be an array");
}
if (evidenceIndex.manifestId !== manifest.manifestId) {
  errors.push("ASVS evidence index references another applicability manifest");
}

const evidenceById = new Map();
const evidenceByControl = new Map();
for (const record of evidenceRecords) {
  if (evidenceById.has(record.evidenceId)) {
    errors.push(`Duplicate evidence record ${record.evidenceId}`);
  }
  if (evidenceByControl.has(record.asvsId)) {
    errors.push(`Duplicate ASVS result ${record.asvsId}`);
  }
  evidenceById.set(record.evidenceId, record);
  evidenceByControl.set(record.asvsId, record);

  if (!["PLANEJADA", "EM_EXECUCAO", "EXECUTADA"].includes(record.status)) {
    errors.push(`Unsupported evidence status for ${record.asvsId}`);
  }
  if (!["BLOQUEADO", "PASSOU", "FALHOU"].includes(record.result)) {
    errors.push(`Unsupported evidence result for ${record.asvsId}`);
  }
  if (record.status === "EXECUTADA" && record.result === "BLOQUEADO") {
    errors.push(`Executed evidence ${record.asvsId} cannot remain blocked`);
  }
  if (record.status !== "EXECUTADA" && record.result !== "BLOQUEADO") {
    errors.push(`Unexecuted evidence ${record.asvsId} cannot have a result`);
  }
  if (record.result === "FALHOU" && !record.defectOrRisk) {
    errors.push(`Failed evidence ${record.asvsId} must name a defect or risk`);
  }
  if (record.result === "PASSOU" || record.result === "FALHOU") {
    if (
      record.status !== "EXECUTADA" ||
      !isIsoInstant(record.producedAt) ||
      !isNamedResponsible(record.responsible)
    ) {
      errors.push(
        `Finished evidence ${record.asvsId} must be executed, dated and nominally responsible`,
      );
    }
    await validateArtifact(record, `ASVS evidence ${record.asvsId}`);
  }
}

for (const control of selectedControls) {
  const record = evidenceById.get(control.evidenceId);
  if (!record || record.asvsId !== control.asvsId) {
    errors.push(`Evidence mapping does not match ${control.asvsId}`);
  }
}
if (evidenceRecords.length !== selectedControls.length) {
  errors.push(
    "ASVS evidence index must have exactly one result for every selected control",
  );
}

const applicabilityReferenceIsValid =
  stageGates.applicability?.manifestId === manifest.manifestId &&
  stageGates.applicability?.status === manifest.approval.status &&
  stageGates.applicability?.subjectSha256 === approvalSubjectSha256;
if (!applicabilityReferenceIsValid) {
  errors.push("ASVS stage gates do not reference the approved applicability");
}

const scopeCorrection = stageGates.scopeCorrection ?? {};
const scopeCorrectionSubjectSha256 = createHash("sha256")
  .update(JSON.stringify(scopeCorrection.subject ?? {}))
  .digest("hex");
if (
  scopeCorrection.correctionId !== "COR-ASVS-ETP00-001" ||
  scopeCorrection.subject?.originalDeclaredCases !== 13 ||
  scopeCorrection.subject?.executableContributionCases !== 10 ||
  JSON.stringify(
    [...(scopeCorrection.subject?.deferredIntegralCaseIds ?? [])].sort(),
  ) !== JSON.stringify(expectedDeferredIntegralCases) ||
  typeof scopeCorrection.subject?.reason !== "string" ||
  scopeCorrection.subject.reason.trim() === "" ||
  scopeCorrection.subjectSha256 !== scopeCorrectionSubjectSha256
) {
  errors.push("ETP-00 scope correction subject is inconsistent");
}
const correctionApproval = scopeCorrection.approval ?? {};
const scopeCorrectionApproved =
  correctionApproval.status === "APROVADO" &&
  isNamedResponsible(correctionApproval.responsible) &&
  isIsoInstant(correctionApproval.approvedAt) &&
  correctionApproval.subjectSha256 === scopeCorrectionSubjectSha256;
if (
  correctionApproval.status === "PENDENTE_APROVACAO_SEGURANCA" &&
  (correctionApproval.responsible !== null ||
    correctionApproval.approvedAt !== null ||
    correctionApproval.subjectSha256 !== null)
) {
  errors.push("Pending ETP-00 scope correction cannot claim approval data");
} else if (
  !["PENDENTE_APROVACAO_SEGURANCA", "APROVADO"].includes(
    correctionApproval.status,
  )
) {
  errors.push("Unsupported ETP-00 scope correction approval status");
} else if (
  correctionApproval.status === "APROVADO" &&
  !scopeCorrectionApproved
) {
  errors.push(
    "ETP-00 scope correction approval must be nominal, dated and hash-bound",
  );
}

const etp00Gate = Array.isArray(stageGates.stageGates)
  ? stageGates.stageGates.find((gate) => gate.stage === "ETP-00")
  : undefined;
if (!etp00Gate) {
  errors.push("ASVS stage gates must declare ETP-00");
}

let etp00Ready = false;
if (etp00Gate) {
  if (etp00Gate.mode !== "CONTRIBUICAO_PARCIAL") {
    errors.push("ETP-00 ASVS gate must remain a partial contribution");
  }
  if (etp00Gate.fullCaseClosureClaimed !== false) {
    errors.push("ETP-00 cannot claim closure of the integral technical cases");
  }
  if (
    JSON.stringify([...(etp00Gate.deferredIntegralCaseIds ?? [])].sort()) !==
    JSON.stringify(expectedDeferredIntegralCases)
  ) {
    errors.push(
      "ETP-00 must keep KMS, administrative access and future financial flows explicitly deferred",
    );
  }
  const requiredCases = Array.isArray(etp00Gate.requiredCaseIds)
    ? etp00Gate.requiredCaseIds
    : [];
  const caseResults = Array.isArray(etp00Gate.results) ? etp00Gate.results : [];
  if (
    JSON.stringify([...requiredCases].sort()) !==
    JSON.stringify([...expectedEtp00Cases].sort())
  ) {
    errors.push("ETP-00 must enumerate the 10 executable ASVS contributions");
  }

  const evidenceRepository = stageGates.evidenceRepository ?? {};
  if (evidenceRepository.bindingCatalogPath !== canonicalBindingsRelativePath) {
    errors.push("ETP-00 must use the canonical evidence binding catalog");
  }
  if (evidenceRepository.bindingCatalogSha256 !== canonicalBindingsSha256) {
    errors.push("ETP-00 evidence binding catalog SHA-256 does not match");
  }

  const hasRunPath =
    typeof evidenceRepository.runManifestPath === "string" &&
    evidenceRepository.runManifestPath !== "";
  const hasRunHash = isHash(evidenceRepository.runManifestSha256);
  if (hasRunPath !== hasRunHash) {
    errors.push(
      "ETP-00 evidence run path and SHA-256 must be declared together",
    );
  }

  let evidenceRun = null;
  let evidenceRunReady = false;
  if (hasRunPath && hasRunHash) {
    const runManifestPath = await safeRepositoryFile(
      evidenceRepository.runManifestPath,
      "ETP-00 evidence run manifest",
    );
    if (runManifestPath) {
      try {
        const actualRunSha256 = await sha256File(runManifestPath);
        if (actualRunSha256 !== evidenceRepository.runManifestSha256) {
          errors.push("ETP-00 evidence run manifest SHA-256 does not match");
        }
        const checkedRun = await validateEvidenceRun({
          manifestPath: runManifestPath,
          requireTechnicalComplete: true,
          bindingsPath: canonicalBindingsPath,
        });
        evidenceRun = checkedRun.manifest;
        if (evidenceRun.execution?.provider !== "github-actions") {
          errors.push(
            "ETP-00 stage requires the sealed GitHub Actions evidence run",
          );
        }
        const repositoryRunPath = relative(root, runManifestPath)
          .split(sep)
          .join("/");
        if (
          evidenceRun.execution?.metadata?.syntheticTest === true ||
          /TESTE|TEST|FIXTURE/iu.test(evidenceRun.responsible?.role ?? "") ||
          repositoryRunPath === "tmp" ||
          repositoryRunPath.startsWith("tmp/") ||
          evidenceRun.artifacts.some(
            (artifact) =>
              artifact.sourcePath === "tmp" ||
              artifact.sourcePath.startsWith("tmp/"),
          )
        ) {
          errors.push(
            "ETP-00 stage cannot use synthetic bypasses, test roles, or temporary evidence",
          );
        }
        await validateCriticalEvidenceSemantics(evidenceRun, runManifestPath);
        if (evidenceRun.scope !== "ETP-00") {
          errors.push("ETP-00 stage references evidence from another scope");
        }
        const applicabilityManifestSha256 = createHash("sha256")
          .update(manifestText)
          .digest("hex");
        if (
          evidenceRun.qualityGates?.asvs?.status !== "APROVADO" ||
          evidenceRun.qualityGates?.asvs?.approvalComplete !== true ||
          evidenceRun.qualityGates?.asvs?.sourceSha256 !==
            applicabilityManifestSha256 ||
          evidenceRun.qualityGates?.asvs?.approvalSubjectSha256 !==
            approvalSubjectSha256 ||
          evidenceRun.qualityGates?.asvs?.approvedSubjectSha256 !==
            approvalSubjectSha256
        ) {
          errors.push(
            "ETP-00 evidence run does not bind the approved ASVS applicability",
          );
        }
        evidenceRunReady =
          actualRunSha256 === evidenceRepository.runManifestSha256 &&
          evidenceRun.scope === "ETP-00";
      } catch (error) {
        errors.push(`ETP-00 evidence run is invalid: ${error.message}`);
      }
    }
  }

  const resultsByCase = new Map();
  for (const result of caseResults) {
    if (resultsByCase.has(result.caseId)) {
      errors.push(`Duplicate ETP-00 case result ${result.caseId}`);
    }
    resultsByCase.set(result.caseId, result);

    const bindingGroups = normalizedBindingGroups(
      result.requiredBindingRuleIdGroups,
      result.caseId,
    );
    const expectedBindingGroups =
      expectedEtp00BindingGroups.get(result.caseId) ?? [];
    if (
      JSON.stringify(bindingGroups) !== JSON.stringify(expectedBindingGroups)
    ) {
      errors.push(
        `ETP-00 case ${result.caseId} does not declare its canonical binding groups`,
      );
    }
    for (const group of bindingGroups) {
      for (const ruleId of group) {
        const rule = canonicalRulesById.get(ruleId);
        if (!rule) {
          errors.push(
            `ETP-00 case ${result.caseId} references unknown binding rule ${ruleId}`,
          );
        } else if (!rule.cases.includes(result.caseId)) {
          errors.push(
            `Binding rule ${ruleId} is not linked to ETP-00 case ${result.caseId}`,
          );
        }
      }
    }

    const artifactIds = Array.isArray(result.evidenceArtifactIds)
      ? result.evidenceArtifactIds
      : [];
    if (!Array.isArray(result.evidenceArtifactIds)) {
      errors.push(
        `ETP-00 case ${result.caseId} evidenceArtifactIds must be an array`,
      );
    }
    if (
      artifactIds.some(
        (artifactId) =>
          typeof artifactId !== "string" || artifactId.trim() === "",
      ) ||
      new Set(artifactIds).size !== artifactIds.length ||
      JSON.stringify(artifactIds) !== JSON.stringify([...artifactIds].sort())
    ) {
      errors.push(
        `ETP-00 case ${result.caseId} evidenceArtifactIds must be unique and sorted`,
      );
    }
    if (!["PLANEJADA", "EM_EXECUCAO", "EXECUTADA"].includes(result.status)) {
      errors.push(`Unsupported ETP-00 status for ${result.caseId}`);
    }
    if (
      !["BLOQUEADO", "CONTRIBUICAO_COMPROVADA", "FALHOU"].includes(
        result.result,
      )
    ) {
      errors.push(`Unsupported ETP-00 result for ${result.caseId}`);
    }
    if (result.status === "EXECUTADA" && result.result === "BLOQUEADO") {
      errors.push(
        `Executed ETP-00 case ${result.caseId} cannot remain blocked`,
      );
    }
    if (result.status !== "EXECUTADA" && result.result !== "BLOQUEADO") {
      errors.push(
        `Unexecuted ETP-00 case ${result.caseId} cannot have a result`,
      );
    }
    if (result.result === "FALHOU" && !result.defectOrRisk) {
      errors.push(
        `Failed ETP-00 case ${result.caseId} must name a defect or risk`,
      );
    }
    if (
      result.result === "CONTRIBUICAO_COMPROVADA" ||
      result.result === "FALHOU"
    ) {
      if (
        result.status !== "EXECUTADA" ||
        !isIsoInstant(result.producedAt) ||
        !isNamedResponsible(result.responsible)
      ) {
        errors.push(
          `Finished ETP-00 case ${result.caseId} must be executed, dated and nominally responsible`,
        );
      }
      if (!evidenceRunReady || !evidenceRun) {
        errors.push(
          `Executed ETP-00 case ${result.caseId} requires one complete sealed evidence run`,
        );
      } else if (artifactIds.length === 0) {
        errors.push(
          `Executed ETP-00 case ${result.caseId} requires evidence artifact IDs`,
        );
      } else {
        const artifactsById = new Map(
          evidenceRun.artifacts.map((artifact) => [
            artifact.artifactId,
            artifact,
          ]),
        );
        const linkedArtifacts = [];
        for (const artifactId of artifactIds) {
          const artifact = artifactsById.get(artifactId);
          if (!artifact) {
            errors.push(
              `ETP-00 case ${result.caseId} references unknown evidence artifact ${artifactId}`,
            );
          } else if (!artifact.caseIds.includes(result.caseId)) {
            errors.push(
              `Evidence artifact ${artifactId} is not bound to ETP-00 case ${result.caseId}`,
            );
          } else {
            linkedArtifacts.push(artifact);
          }
        }
        for (const group of bindingGroups) {
          if (
            !linkedArtifacts.some((artifact) =>
              artifact.bindingRuleIds.some((ruleId) => group.includes(ruleId)),
            )
          ) {
            errors.push(
              `ETP-00 case ${result.caseId} does not cover required binding group ${group.join("|")}`,
            );
          }
        }
      }
    } else if (artifactIds.length !== 0) {
      errors.push(
        `Unexecuted ETP-00 case ${result.caseId} cannot claim evidence artifacts`,
      );
    }
  }
  for (const caseId of expectedEtp00Cases) {
    if (!resultsByCase.has(caseId)) {
      errors.push(`Missing ETP-00 case result ${caseId}`);
    }
  }
  if (caseResults.length !== expectedEtp00Cases.length) {
    errors.push("ETP-00 must have exactly one result per required case");
  }

  const allEtp00ContributionsProved = expectedEtp00Cases.every(
    (caseId) =>
      resultsByCase.get(caseId)?.status === "EXECUTADA" &&
      resultsByCase.get(caseId)?.result === "CONTRIBUICAO_COMPROVADA",
  );
  if (
    !["EM_EXECUCAO", "CONTRIBUICAO_CONCLUIDA", "BLOQUEADO"].includes(
      etp00Gate.status,
    )
  ) {
    errors.push("Unsupported ETP-00 aggregate status");
  }
  if (
    etp00Gate.status === "CONTRIBUICAO_CONCLUIDA" &&
    !allEtp00ContributionsProved
  ) {
    errors.push(
      "ETP-00 contribution cannot be concluded with incomplete assertions",
    );
  }
  if (
    (etp00Gate.status === "CONTRIBUICAO_CONCLUIDA" ||
      caseResults.some((result) => result.status === "EXECUTADA")) &&
    !evidenceRunReady
  ) {
    errors.push(
      "ETP-00 executed results require a complete canonical evidence repository run",
    );
  }
  etp00Ready =
    etp00Gate.status === "CONTRIBUICAO_CONCLUIDA" &&
    allEtp00ContributionsProved &&
    evidenceRunReady;
}

const finalClosure = stageGates.finalClosure;
if (
  finalClosure?.stage !== "ETP-11" ||
  finalClosure?.gate !== "GAT-10" ||
  finalClosure?.mode !== "CONTROLES_APLICAVEIS_INTEGRAIS" ||
  finalClosure?.evidenceIndexManifestId !== evidenceIndex.manifestId ||
  finalClosure?.expectedApplicableControls !== selectedControls.length
) {
  errors.push("ASVS final closure contract is inconsistent");
}
const allApplicableControlsPassed = selectedControls.every((control) => {
  const record = evidenceById.get(control.evidenceId);
  return record?.status === "EXECUTADA" && record.result === "PASSOU";
});
const finalEvidenceReady =
  finalClosure?.status === "CONCLUIDO" &&
  allApplicableControlsPassed &&
  !manifest.controls.some((control) => control.situation === "ADIADO");
if (!["BLOQUEADO", "CONCLUIDO"].includes(finalClosure?.status)) {
  errors.push("Unsupported ASVS final closure status");
}
if (finalClosure?.status === "CONCLUIDO" && !finalEvidenceReady) {
  errors.push(
    "ASVS final closure cannot be concluded with incomplete controls",
  );
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

const etp00ResultsReady =
  approvalIsComplete &&
  applicabilityReferenceIsValid &&
  scopeCorrectionApproved &&
  etp00Ready;
const finalClosureReady =
  approvalIsComplete &&
  applicabilityReferenceIsValid &&
  scopeCorrectionApproved &&
  etp00Ready &&
  finalEvidenceReady;

if (requiredStage && requiredStage !== "ETP-00") {
  errors.push(`Unsupported ASVS stage gate ${requiredStage}`);
}
if (requiredStage === "ETP-00" && !etp00ResultsReady) {
  errors.push(
    "ASVS ETP-00 requires every declared contribution to be proved without claiming integral case closure",
  );
}
if (requiredStage === "ETP-00" && !scopeCorrectionApproved) {
  errors.push(
    "ASVS ETP-00 scope correction still requires named security approval",
  );
}
if (requireFinal && !finalClosureReady) {
  errors.push(
    "ASVS final closure requires approved applicability and all applicable controls to pass with verifiable evidence",
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
      gates: {
        applicability: {
          ready: approvalIsComplete,
          required: requireApproved,
        },
        etp00Results: {
          ready: etp00ResultsReady,
          required: requiredStage === "ETP-00",
          provedContributions: etp00Gate
            ? etp00Gate.results.filter(
                (result) => result.result === "CONTRIBUICAO_COMPROVADA",
              ).length
            : 0,
          requiredCases: expectedEtp00Cases.length,
          scopeCorrectionApproval: correctionApproval.status,
        },
        finalClosure: {
          ready: finalClosureReady,
          required: requireFinal,
          passedControls: evidenceRecords.filter(
            (record) => record.result === "PASSOU",
          ).length,
          requiredControls: selectedControls.length,
        },
      },
    }),
  );
}
