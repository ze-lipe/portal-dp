import { readFile } from "node:fs/promises";
import { basename, dirname, join, resolve } from "node:path";

import { validateSecurityConfigurationReport } from "./security-configuration-contract.mjs";
import { aggregateContentScanEntries } from "./content-scan-aggregate.mjs";
import {
  validateContentSecretScanReport,
  validateImageSecretScanReport,
} from "./secret-scan-contract.mjs";
import {
  inspectTrivyReport,
  validateTrivyReport,
  validateTrivyScanSummary,
} from "./trivy-report-contract.mjs";
import {
  expectedDockerfileFrontend,
  expectedRuntimeBase,
} from "./write-oci-build-evidence.mjs";

const root = resolve(import.meta.dirname, "..");

function canonicalJson(value) {
  if (Array.isArray(value)) {
    return `[${value.map((item) => canonicalJson(item)).join(",")}]`;
  }
  if (value !== null && typeof value === "object") {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

function compareTrivyEntry(summaryEntry, inspected, scope) {
  const commonFields = [
    "approved",
    "artifactName",
    "artifactType",
    "targetCount",
    "findingCount",
  ];
  if (Object.hasOwn(summaryEntry, "acceptedRiskFindingCount")) {
    commonFields.push("acceptedRiskFindingCount", "blockingFindingCount");
  }
  const scopeFields =
    scope === "image"
      ? [
          "imageId",
          "packageCount",
          ...(Object.hasOwn(summaryEntry, "packageMetadataSanitized")
            ? ["packageMetadataSanitized"]
            : []),
        ]
      : ["commit", "requiredTargetType"];
  if (
    summaryEntry.structurallyValid !== true ||
    summaryEntry.failureCode !== null ||
    [...commonFields, ...scopeFields].some(
      (field) => summaryEntry[field] !== inspected[field],
    ) ||
    (scope === "config" && summaryEntry.metadataSanitized !== true)
  ) {
    throw new Error(
      `Trivy ${scope} summary diverges from its retained native report`,
    );
  }
}

/**
 * Recalcula a decisao a partir dos dois relatorios nativos. O instante salvo
 * no resumo e usado para preservar a validade historica da excecao; sealedAt
 * impede que uma nova execucao seja retrodatada depois do vencimento.
 */
export function validateTrivyEvidenceCoherence(
  summary,
  imageReport,
  configReport,
  {
    expectedImageReference,
    expectedImageId,
    expectedConfigCommit,
    ociBuildEvidence,
    requireApproved = false,
    sealedAt,
  } = {},
) {
  const validation = validateTrivyScanSummary(summary, {
    expectedImageReference,
    expectedImageId,
    expectedConfigCommit,
    requireApproved,
  });
  const reportsPresent = imageReport !== null && configReport !== null;
  if (
    summary.rawReportsPublished !== reportsPresent ||
    (imageReport === null) !== (configReport === null)
  ) {
    throw new Error(
      "Trivy summary diverges from the retained native report pair",
    );
  }
  if (!reportsPresent) return validation;

  const evaluatedAt =
    summary.schemaVersion === 2 ? summary.evaluatedAt : imageReport.CreatedAt;
  if (
    summary.schemaVersion === 2 &&
    Date.parse(evaluatedAt) !== Date.parse(imageReport.CreatedAt)
  ) {
    throw new Error(
      "Trivy evaluatedAt diverges from the native report CreatedAt",
    );
  }
  if (summary.schemaVersion === 2 && sealedAt !== undefined) {
    const evaluatedTime = Date.parse(evaluatedAt);
    const sealedTime = Date.parse(sealedAt);
    if (
      !Number.isFinite(sealedTime) ||
      sealedTime < evaluatedTime ||
      (summary.riskAcceptance !== null &&
        (sealedTime < Date.parse(summary.riskAcceptance.validFrom) ||
          sealedTime > Date.parse(summary.riskAcceptance.expiresAt)))
    ) {
      throw new Error(
        "Trivy evaluatedAt is not coherent with the sealed run timestamp",
      );
    }
  }

  const image = inspectTrivyReport(imageReport, {
    label: "trivy-image.json",
    scope: "image",
    expectedArtifactName: expectedImageReference,
    expectedImageId,
    evaluatedAt,
    ociBuildEvidence,
    requireSanitizedPackageMetadata: summary.schemaVersion === 2,
  });
  const config = inspectTrivyReport(configReport, {
    label: "trivy-config.json",
    scope: "config",
    expectedArtifactName: ".",
    expectedConfigCommit,
    requireSanitizedConfigMetadata: true,
  });
  compareTrivyEntry(summary.reports.image, image, "image");
  compareTrivyEntry(summary.reports.config, config, "config");
  if (
    summary.schemaVersion === 2 &&
    canonicalJson(summary.riskAcceptance) !==
      canonicalJson(image.riskAcceptance)
  ) {
    throw new Error(
      "Trivy risk acceptance diverges from the retained native finding",
    );
  }
  // Relatorios nativos so sao publicados quando a classificacao posterior os
  // aprovou; assim, um resumo adulterado nao consegue legitimar um bloqueio.
  validateTrivyReport(imageReport, {
    label: "trivy-image.json",
    scope: "image",
    expectedArtifactName: expectedImageReference,
    expectedImageId,
    evaluatedAt,
    ociBuildEvidence,
    requireSanitizedPackageMetadata: summary.schemaVersion === 2,
  });
  validateTrivyReport(configReport, {
    label: "trivy-config.json",
    scope: "config",
    expectedArtifactName: ".",
    expectedConfigCommit,
    requireSanitizedConfigMetadata: true,
  });
  return validation;
}

export async function validateCriticalEvidenceSemantics(
  run,
  runManifestPath,
  { requireCompleteSet = false } = {},
) {
  const artifactsNamed = (name) =>
    run.artifacts.filter((artifact) => basename(artifact.sourcePath) === name);
  const ociArchives = artifactsNamed("portal-dp.oci.tar");
  const ociArchive = ociArchives.length === 1 ? ociArchives[0] : null;
  const contentSecretProfiles = new Map([
    ["content-secret-scan-generated.json", "GENERATED"],
    ["content-secret-scan-sast-evidence.json", "SAST_EVIDENCE"],
    ["content-secret-scan-oci-evidence.json", "OCI_EVIDENCE"],
    ["content-secret-scan-collected-evidence.json", "COLLECTED_EVIDENCE"],
  ]);
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
  if (requireCompleteSet) {
    if (ociArchives.length !== 1) {
      throw new Error(
        "portal-dp.oci.tar must occur exactly once in the complete sealed run",
      );
    }
    if (artifactsNamed("portal-dp.oci.sha256").length !== 1) {
      throw new Error(
        "portal-dp.oci.sha256 must occur exactly once in the complete sealed run",
      );
    }
    if (sbomArtifacts.length !== expectedSbomComponents.length) {
      throw new Error(
        "complete sealed run must contain the 11 expected CycloneDX SBOMs",
      );
    }
    for (const name of contentSecretProfiles.keys()) {
      if (artifactsNamed(name).length !== 1) {
        throw new Error(`${name} must occur exactly once in the complete run`);
      }
    }
    if (artifactsNamed("image-secret-scan-result.json").length !== 1) {
      throw new Error(
        "image-secret-scan-result.json must occur exactly once in the complete run",
      );
    }
    if (artifactsNamed("trivy-scan-result.json").length !== 1) {
      throw new Error(
        "trivy-scan-result.json must occur exactly once in the complete run",
      );
    }
  }
  const observedSbomComponents = new Set();
  let totalSbomDependencies = 0;
  let collectedContentScanReport = null;

  const jsonReportNamed = async (name) => {
    const matches = artifactsNamed(name);
    if (matches.length > 1) {
      throw new Error(`${name} must not occur more than once in a sealed run`);
    }
    if (matches.length === 0) return null;
    const [artifact] = matches;
    if (artifact.mediaType !== "application/json") {
      throw new Error(`${name} must be sealed as application/json`);
    }
    const objectPath = join(
      dirname(runManifestPath),
      ...artifact.storedPath.split("/"),
    );
    return JSON.parse(await readFile(objectPath, "utf8"));
  };

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
    if (name === "portal-dp.oci.sha256") {
      const digestReport = await readFile(objectPath, "utf8");
      const digestMatch = digestReport.match(
        /^([a-f0-9]{64})\s+portal-dp\.oci\.tar\s*$/u,
      );
      if (
        !digestMatch ||
        (ociArchive !== null && digestMatch[1] !== ociArchive.sha256)
      ) {
        throw new Error(
          "OCI digest report does not identify the sealed OCI archive",
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
      const expectedKeys = [
        "conclusion",
        "configurationPolicy",
        "decodeDepth",
        "exitCode",
        "failureCode",
        "findingCount",
        "gitLogOptions",
        "gitleaksAllowIgnored",
        "installOutcome",
        "integrityVerified",
        "outcome",
        "passed",
        "rawReportRetained",
        "redacted",
        "reportFormat",
        "repositoryCommitCount",
        "repositoryGitStreamBytes",
        "repositoryNotShallowVerified",
        "scanner",
        "scannerDistributionSha256",
        "scannerVersion",
        "scannerVersionVerified",
        "scanStepOutcome",
        "schemaVersion",
        "scope",
        "timeoutSeconds",
      ].sort();
      if (
        JSON.stringify(Object.keys(report).sort()) !==
          JSON.stringify(expectedKeys) ||
        report.schemaVersion !== 2 ||
        report.scanner !== "gitleaks-cli" ||
        report.scannerVersion !== "8.30.1" ||
        report.scannerDistributionSha256 !==
          "551f6fc83ea457d62a0d98237cbad105af8d557003051f41f3e7ca7b3f2470eb" ||
        report.integrityVerified !== true ||
        report.scannerVersionVerified !== true ||
        report.scope !== "full-git-history-all-refs-streamed" ||
        report.repositoryNotShallowVerified !== true ||
        !Number.isSafeInteger(report.repositoryCommitCount) ||
        report.repositoryCommitCount < 1 ||
        !Number.isSafeInteger(report.repositoryGitStreamBytes) ||
        report.repositoryGitStreamBytes < 1 ||
        JSON.stringify(report.gitLogOptions) !==
          JSON.stringify([
            "-p",
            "-U0",
            "--full-history",
            "--all",
            "--diff-filter=tuxdb",
          ]) ||
        report.configurationPolicy !==
          "BUILT_IN_DEFAULT_NO_REPOSITORY_OVERRIDES" ||
        report.gitleaksAllowIgnored !== true ||
        report.decodeDepth !== 2 ||
        report.timeoutSeconds !== 300 ||
        report.reportFormat !== "sarif-2.1.0-temporary" ||
        report.redacted !== true ||
        report.rawReportRetained !== false ||
        report.installOutcome !== "success" ||
        report.scanStepOutcome !== "success" ||
        report.exitCode !== 0 ||
        report.findingCount !== 0 ||
        report.outcome !== "success" ||
        report.failureCode !== null ||
        report.passed !== true ||
        report.conclusion !== "SEM_ACHADOS_BLOQUEADORES"
      ) {
        throw new Error(
          "Gitleaks report does not prove a clean full-history redacted scan",
        );
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
      // Nesta primeira passagem validamos a estrutura. A decisao e recalculada
      // adiante, em conjunto com o resumo e com o instante historico selado.
      inspectTrivyReport(report, {
        label: name,
        scope: name === "trivy-image.json" ? "image" : "config",
        requireSanitizedConfigMetadata: name === "trivy-config.json",
      });
    } else if (name === "trivy-scan-result.json") {
      validateTrivyScanSummary(report, {
        expectedImageReference: `portal-dp:${run.execution?.revision ?? ""}`,
        expectedConfigCommit: run.execution?.revision,
        requireApproved: false,
      });
    } else if (contentSecretProfiles.has(name)) {
      validateContentSecretScanReport(report, contentSecretProfiles.get(name));
      if (name === "content-secret-scan-collected-evidence.json") {
        if (collectedContentScanReport !== null) {
          throw new Error(
            "content-secret-scan-collected-evidence.json must not occur more than once",
          );
        }
        collectedContentScanReport = report;
      }
    } else if (name === "image-secret-scan-result.json") {
      validateImageSecretScanReport(
        report,
        `portal-dp:${run.execution?.revision ?? ""}`,
        { requireClean: false },
      );
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
      if (!expectedSbomComponents.includes(report.metadata.component.name)) {
        throw new Error("SBOM identifies an unexpected workspace component");
      }
      if (observedSbomComponents.has(report.metadata.component.name)) {
        throw new Error("SBOM workspace component occurs more than once");
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
        "dockerfileFrontend",
        "dockerfileFrontendLinked",
        "dockerfileSha256",
        "dockerfileSourceLinked",
        "localImageId",
        "metadata",
        "ociArchiveSha256",
        "ociImageManifestDigest",
        "ociIndex",
        "provenanceDependencyLinked",
        "runtimeBase",
        "runtimeBaseLabelLinked",
        "runtimeManifestDigest",
        "sanitization",
        "schemaVersion",
      ];
      const expectedMetadataKeys = [
        "containerImageConfigDigest",
        "containerImageDigest",
        "ociImageManifestDigest",
        "runtimeManifestDigest",
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
        "ociImageManifestLinked",
        "runtimeConfigLinked",
      ];
      if (
        report.schemaVersion !== 4 ||
        report.builder !== "docker/build-push-action" ||
        !/^sha256:[a-f0-9]{64}$/u.test(report.buildDigest ?? "") ||
        report.dockerfileFrontend !== expectedDockerfileFrontend ||
        report.dockerfileFrontendLinked !== true ||
        !/^[a-f0-9]{64}$/u.test(report.dockerfileSha256 ?? "") ||
        report.dockerfileSourceLinked !== true ||
        !/^sha256:[a-f0-9]{64}$/u.test(report.ociImageManifestDigest ?? "") ||
        report.provenanceDependencyLinked !== true ||
        report.runtimeBase !== expectedRuntimeBase ||
        report.runtimeBaseLabelLinked !== true ||
        !/^sha256:[a-f0-9]{64}$/u.test(report.runtimeManifestDigest ?? "") ||
        !/^sha256:[a-f0-9]{64}$/u.test(report.localImageId ?? "") ||
        !/^[a-f0-9]{64}$/u.test(report.ociArchiveSha256 ?? "") ||
        (ociArchive !== null &&
          report.ociArchiveSha256 !== ociArchive.sha256) ||
        JSON.stringify(Object.keys(report).sort()) !==
          JSON.stringify([...expectedTopLevelKeys].sort()) ||
        JSON.stringify(Object.keys(report.metadata ?? {}).sort()) !==
          JSON.stringify([...expectedMetadataKeys].sort()) ||
        report.metadata?.containerImageDigest !== report.buildDigest ||
        report.metadata?.containerImageConfigDigest !== report.localImageId ||
        report.metadata?.ociImageManifestDigest !==
          report.ociImageManifestDigest ||
        report.metadata?.runtimeManifestDigest !==
          report.runtimeManifestDigest ||
        JSON.stringify(Object.keys(report.ociIndex ?? {}).sort()) !==
          JSON.stringify([...expectedIndexKeys].sort()) ||
        !/^sha256:[a-f0-9]{64}$/u.test(report.ociIndex?.digest ?? "") ||
        !Number.isInteger(report.ociIndex?.manifestCount) ||
        report.ociIndex.manifestCount < 1 ||
        !Number.isInteger(report.ociIndex?.attestationDescriptorCount) ||
        report.ociIndex.attestationDescriptorCount < 1 ||
        !Number.isInteger(report.ociIndex?.imageLayerCount) ||
        report.ociIndex.imageLayerCount < 1 ||
        report.ociIndex.allImageLayerBlobsVerified !== true ||
        report.ociIndex.buildDigestLinked !== true ||
        report.ociIndex.ociImageManifestLinked !== true ||
        report.ociIndex.runtimeConfigLinked !== true ||
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

  if (collectedContentScanReport !== null) {
    const [summaryArtifact] = artifactsNamed(
      "content-secret-scan-collected-evidence.json",
    );
    const aggregate = aggregateContentScanEntries(
      run.artifacts
        .filter(
          (artifact) => artifact.artifactId !== summaryArtifact.artifactId,
        )
        .map((artifact) => ({
          scope: "COLLECTED_EVIDENCE",
          logicalPath: artifact.sourcePath,
          byteCount: artifact.bytes,
          sha256: artifact.sha256,
        })),
    );
    if (
      collectedContentScanReport.aggregateSha256 !==
        aggregate.aggregateSha256 ||
      collectedContentScanReport.fileCount !== aggregate.fileCount ||
      collectedContentScanReport.byteCount !== aggregate.byteCount
    ) {
      throw new Error(
        "COLLECTED_EVIDENCE aggregate does not match the sealed artifact inventory",
      );
    }
  }

  // O gate imediato vincula o scan aos valores locais. No pacote selado,
  // repetimos o vinculo contra evidencias independentes da mesma execucao.
  const [
    trivySummaryReport,
    trivyImageReport,
    trivyConfigReport,
    imageSecretScanReport,
    ociBuildLinkReport,
  ] = await Promise.all([
    jsonReportNamed("trivy-scan-result.json"),
    jsonReportNamed("trivy-image.json"),
    jsonReportNamed("trivy-config.json"),
    jsonReportNamed("image-secret-scan-result.json"),
    jsonReportNamed("oci-build-link.json"),
  ]);
  const executionRevision = run.execution?.revision ?? null;
  const expectedImageReference =
    executionRevision === null
      ? (trivySummaryReport?.expectedImageReference ??
        imageSecretScanReport?.expectedImageReference)
      : `portal-dp:${executionRevision}`;
  const linkedImageId = ociBuildLinkReport?.localImageId;
  if (trivySummaryReport !== null) {
    validateTrivyEvidenceCoherence(
      trivySummaryReport,
      trivyImageReport,
      trivyConfigReport,
      {
        expectedImageReference,
        expectedImageId: linkedImageId ?? trivySummaryReport.expectedImageId,
        expectedConfigCommit:
          executionRevision ?? trivySummaryReport.expectedConfigCommit,
        ociBuildEvidence: ociBuildLinkReport,
        requireApproved: requireCompleteSet,
        sealedAt: run.generatedAt,
      },
    );
  } else if (trivyImageReport !== null || trivyConfigReport !== null) {
    throw new Error("retained Trivy reports require their decision summary");
  }
  if (imageSecretScanReport !== null) {
    validateImageSecretScanReport(
      imageSecretScanReport,
      expectedImageReference,
      { requireClean: requireCompleteSet },
    );
    if (
      linkedImageId !== undefined &&
      (imageSecretScanReport.expectedImageId !== linkedImageId ||
        imageSecretScanReport.imageId !== linkedImageId)
    ) {
      throw new Error(
        "image secret scan does not match oci-build-link.localImageId",
      );
    }
  }
  if (
    requireCompleteSet &&
    (JSON.stringify([...observedSbomComponents].sort()) !==
      JSON.stringify(expectedSbomComponents) ||
      totalSbomDependencies === 0)
  ) {
    throw new Error(
      "SBOM set does not represent all workspaces and their dependencies",
    );
  }
}
