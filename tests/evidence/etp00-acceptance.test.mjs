import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import {
  chmod,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import { join, relative, resolve, sep } from "node:path";
import { promisify } from "node:util";
import test from "node:test";

import {
  etp00EvidenceRequirements,
  finalizeEvidenceRun,
} from "../../scripts/evidence-repository.mjs";
import { aggregateContentScanEntries } from "../../scripts/content-scan-aggregate.mjs";
import { removeHardenedFixture } from "./remove-hardened-fixture.mjs";

const execute = promisify(execFile);
const root = resolve(import.meta.dirname, "../..");
const validator = resolve(root, "scripts/validate-etp00-acceptance.mjs");
const templatePath = resolve(
  root,
  "evidencias/manifests/etp00-acceptance-v1.json",
);
const asvsApplicabilityPath = resolve(
  root,
  "evidencias/manifests/asvs-applicability-v5.0.0.json",
);
const asvsStageTemplatePath = resolve(
  root,
  "evidencias/manifests/asvs-stage-gates-v5.0.0.json",
);
const canonicalBindingsPath = resolve(
  root,
  "evidencias/manifests/evidence-bindings-etp00-v1.json",
);
const fixedTime = "2026-08-22T12:00:00.000Z";
const acceptedTime = "2026-08-22T13:00:00.000Z";
const fixtureOciArchive = "contract-fixture-evidence:portal-dp.oci.tar\n";
const fixtureOciArchiveSha256 = createHash("sha256")
  .update(fixtureOciArchive)
  .digest("hex");
const outcomes = {
  "planning-windows": "success",
  "code-and-postgres": "success",
  "secret-scan": "success",
  sast: "success",
  "oci-image": "success",
};
const sbomFixtures = [
  ["portal-dp-0.0.0-test.cdx.json", "portal-dp"],
  ["portal-dp-api-0.0.0-test.cdx.json", "api"],
  ["portal-dp-contracts-0.0.0-test.cdx.json", "contracts"],
  ["portal-dp-database-0.0.0-test.cdx.json", "database"],
  ["portal-dp-domain-0.0.0-test.cdx.json", "domain"],
  ["portal-dp-integrations-0.0.0-test.cdx.json", "integrations"],
  ["portal-dp-observability-0.0.0-test.cdx.json", "observability"],
  ["portal-dp-storage-0.0.0-test.cdx.json", "storage"],
  ["portal-dp-testing-0.0.0-test.cdx.json", "testing"],
  ["portal-dp-web-0.0.0-test.cdx.json", "web"],
  ["portal-dp-worker-0.0.0-test.cdx.json", "worker"],
];

function repositoryRelative(path) {
  return relative(root, path).split(sep).join("/");
}

async function json(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

function contentSecretScanReport(profile, scopes, coverage = null) {
  const scopeStats = coverage
    ? [
        {
          scope: scopes[0],
          fileCount: coverage.fileCount,
          byteCount: coverage.byteCount,
        },
      ]
    : scopes.map((scope) => ({
        scope,
        fileCount: 1,
        byteCount: 128,
      }));
  return {
    schemaVersion: 1,
    reportType: "CONTENT_SECRET_SCAN_RESULT",
    profile,
    scanner: "gitleaks-cli+portal-dp-prohibited-data",
    scannerVersion: "8.24.3",
    scannerDistributionSha256:
      "9991e0b2903da4c8f6122b5c3186448b927a5da4deef1fe45271c3793f4ee29c",
    integrityVerified: true,
    scannerVersionVerified: true,
    scanMode: "directory-with-archives",
    scopes,
    scopeStats,
    fileCount: coverage?.fileCount ?? scopeStats.length,
    byteCount: coverage?.byteCount ?? scopeStats.length * 128,
    aggregateSha256: coverage?.aggregateSha256 ?? "a".repeat(64),
    prohibitedDataPolicy: "PORTAL_DP_PROHIBITED_DATA_V2",
    prohibitedDataArchiveInspection: "FAIL_CLOSED_TAR_ZIP_OCI_V1",
    prohibitedDataArchiveMaxDepth: 4,
    prohibitedDataArchiveMaxEntries: 50_000,
    prohibitedDataArchiveMaxEntryBytes: 268_435_456,
    prohibitedDataArchiveMaxExpandedBytes: 2_147_483_648,
    prohibitedDataArchiveMaxCompressionRatio: 200,
    prohibitedDataArchiveEntryCount: 3,
    prohibitedDataExpandedByteCount: 1536,
    prohibitedDataFindingCount: 0,
    configurationPolicy: "BUILT_IN_DEFAULT_NO_REPOSITORY_OVERRIDES",
    gitleaksAllowIgnored: true,
    archiveDepth: 3,
    decodeDepth: 2,
    timeoutSeconds: 300,
    reportFormat: "sarif-2.1.0-temporary",
    redacted: true,
    rawReportRetained: false,
    stagedInputRetained: false,
    installOutcome: "success",
    scanStepOutcome: "success",
    exitCode: 0,
    gitleaksFindingCount: 0,
    findingCount: 0,
    outcome: "success",
    failureCode: null,
    passed: true,
    conclusion: "SEM_ACHADOS_BLOQUEADORES",
  };
}

function artifactContent(name, gatCatalog) {
  const reports = {
    "gat-02-vitest.json": {
      success: true,
      numTotalTests: gatCatalog.expectedCount,
      numPassedTests: gatCatalog.expectedCount,
      numFailedTests: 0,
      numPendingTests: 0,
      testResults: [
        {
          assertionResults: gatCatalog.caseTitles.map((title) => ({
            title,
            status: "passed",
          })),
        },
      ],
    },
    "pnpm-audit-production.json": {
      metadata: {
        vulnerabilities: { low: 0, moderate: 0, high: 0, critical: 0 },
      },
    },
    "licenses-production.json": {
      generatedAt: fixedTime,
      packages: [{ name: "fixture-package", version: "1.0.0", license: "MIT" }],
    },
    "sast-semgrep.json": {
      version: "1.172.0",
      results: [],
      errors: [],
      paths: { scanned: ["apps/api/src/app.module.ts"] },
      redaction: {
        status: "APLICADA",
        policy: "SEMGREP_FINDINGS_ALLOWLIST_V1",
        excluded: "Fixture sem conteudo bruto.",
      },
      portalDpRuleSnapshot: {
        status: "VERIFICADO",
        capturedAt: "2026-08-22",
        uniqueRuleIds: 563,
        networkUsedDuringScan: false,
        snapshots: [
          {
            sha256:
              "1fff4cefffa4debfe8e4f61cf1a8b1b022d98b72b1a9d72d4eeef8a5eeaa8a53",
          },
          {
            sha256:
              "6248ea7477e6da0db10305c0281f7cd908485691747f4fd641275145075f3b22",
          },
          {
            sha256:
              "eb9ce79ff8974938061ec2ab0bb1e8c20a17372458cfaa4e8bcb24ac7e22a41f",
          },
        ],
      },
    },
    "gitleaks-result.json": {
      schemaVersion: 2,
      scanner: "gitleaks-cli",
      scannerVersion: "8.24.3",
      scannerDistributionSha256:
        "9991e0b2903da4c8f6122b5c3186448b927a5da4deef1fe45271c3793f4ee29c",
      integrityVerified: true,
      scannerVersionVerified: true,
      scope: "full-git-history-all-refs-streamed",
      repositoryNotShallowVerified: true,
      repositoryCommitCount: 4,
      repositoryGitStreamBytes: 4096,
      gitLogOptions: [
        "-p",
        "-U0",
        "--full-history",
        "--all",
        "--diff-filter=tuxdb",
      ],
      configurationPolicy: "BUILT_IN_DEFAULT_NO_REPOSITORY_OVERRIDES",
      gitleaksAllowIgnored: true,
      decodeDepth: 2,
      timeoutSeconds: 300,
      reportFormat: "sarif-2.1.0-temporary",
      redacted: true,
      rawReportRetained: false,
      installOutcome: "success",
      scanStepOutcome: "success",
      exitCode: 0,
      findingCount: 0,
      outcome: "success",
      failureCode: null,
      passed: true,
      conclusion: "SEM_ACHADOS_BLOQUEADORES",
    },
    "content-secret-scan-generated.json": contentSecretScanReport("GENERATED", [
      "BUILD_PACKAGE",
      "GENERATED_EVIDENCE",
      "TEST_FIXTURES",
    ]),
    "content-secret-scan-sast-evidence.json": contentSecretScanReport(
      "SAST_EVIDENCE",
      ["SAST_EVIDENCE"],
    ),
    "content-secret-scan-oci-evidence.json": contentSecretScanReport(
      "OCI_EVIDENCE",
      ["OCI_EVIDENCE"],
    ),
    "content-secret-scan-collected-evidence.json": contentSecretScanReport(
      "COLLECTED_EVIDENCE",
      ["COLLECTED_EVIDENCE"],
    ),
    "image-secret-scan-result.json": {
      schemaVersion: 1,
      reportType: "IMAGE_LAYER_SECRET_SCAN_RESULT",
      scanner: "trivy",
      scannerVersion: "0.70.0",
      scannerVersionConfigured: true,
      scannerVersionObserved: "0.70.0",
      scannerVersionVerified: true,
      actionRevision: "ed142fd0673e97e23eac54620cfb913e5ce36c25",
      actionRevisionPinned: true,
      scope: "OCI_IMAGE_FILESYSTEM_AND_LAYERS",
      scanMode: "container-image-secret-only",
      configurationPolicy: "CONTROLLED_NO_IGNORE_OR_SKIP_OVERRIDES",
      expectedImageReference: `portal-dp:${"1".repeat(40)}`,
      expectedImageId: `sha256:${"b".repeat(64)}`,
      imageId: `sha256:${"b".repeat(64)}`,
      imageLayerCount: 1,
      targetCount: 1,
      exitCodePolicy: 1,
      stepOutcome: "success",
      findingCount: 0,
      redacted: true,
      rawReportRetained: false,
      outcome: "success",
      failureCode: null,
      passed: true,
      conclusion: "SEM_ACHADOS_BLOQUEADORES",
    },
    "trivy-scan-result.json": {
      schemaVersion: 1,
      reportType: "TRIVY_SCAN_RESULT",
      scanner: "trivy",
      scannerVersion: "0.70.0",
      actionRevision: "ed142fd0673e97e23eac54620cfb913e5ce36c25",
      configurationPolicy: "CONTROLLED_NO_IGNORE_OR_SKIP_OVERRIDES",
      expectedImageReference: `portal-dp:${"1".repeat(40)}`,
      expectedImageId: `sha256:${"b".repeat(64)}`,
      expectedConfigArtifactName: ".",
      expectedConfigCommit: "1".repeat(40),
      imageStepOutcome: "success",
      configStepOutcome: "success",
      reports: {
        image: {
          structurallyValid: true,
          approved: true,
          failureCode: null,
          artifactName: `portal-dp:${"1".repeat(40)}`,
          artifactType: "container_image",
          targetCount: 1,
          findingCount: 0,
          imageId: `sha256:${"b".repeat(64)}`,
          packageCount: 1,
        },
        config: {
          structurallyValid: true,
          approved: true,
          failureCode: null,
          artifactName: ".",
          artifactType: "repository",
          targetCount: 1,
          findingCount: 0,
          commit: "1".repeat(40),
          metadataSanitized: true,
          requiredTargetType: "dockerfile",
        },
      },
      rawReportsPublished: true,
      rawFindingReportsRetained: false,
      redacted: true,
      outcome: "success",
      failureCode: null,
      passed: true,
      conclusion: "SEM_ACHADOS_BLOQUEADORES",
    },
    "build-toolchain-verification.json": {
      schemaVersion: 1,
      reportType: "BUILD_TOOLCHAIN_VERIFICATION",
      status: "PASSOU",
      verifiedAt: fixedTime,
      source: "GITHUB_ACTIONS_OCI_BUILD",
      expected: {
        buildxVersion: "v0.36.1",
        buildKitVersion: "v0.32.2",
        buildKitImage:
          "moby/buildkit:v0.32.2@sha256:28a898719c18a33f4e8000685287fa36fd0dd9560c6440227d3a732d79bb41d8",
        driver: "docker-container",
        platform: "linux/amd64",
      },
      observed: {
        buildxVersion: "v0.36.1",
        driver: "docker-container",
        nodes: [
          {
            status: "running",
            buildKitVersion: "v0.32.2",
            platforms: ["linux/amd64"],
          },
        ],
      },
      sanitization: "Fixture de contrato sem dados de ambiente.",
    },
    "trivy-image.json": {
      SchemaVersion: 2,
      Trivy: { Version: "0.70.0" },
      ReportID: "019c0000-0000-7000-8000-000000000001",
      CreatedAt: "2026-08-22T10:11:12Z",
      ArtifactID: `sha256:${"d".repeat(64)}`,
      ArtifactName: `portal-dp:${"1".repeat(40)}`,
      ArtifactType: "container_image",
      Metadata: {
        ImageID: `sha256:${"b".repeat(64)}`,
        DiffIDs: [`sha256:${"f".repeat(64)}`],
        RepoTags: [`portal-dp:${"1".repeat(40)}`],
        Reference: `portal-dp:${"1".repeat(40)}`,
      },
      Results: [
        {
          Target: "portal-dp (debian 13)",
          Class: "os-pkgs",
          Type: "debian",
          Packages: [{ Name: "base-files", Version: "13.8+deb13u1" }],
        },
      ],
    },
    "trivy-config.json": {
      SchemaVersion: 2,
      Trivy: { Version: "0.70.0" },
      ReportID: "019c0000-0000-7000-8000-000000000002",
      CreatedAt: "2026-08-22T10:11:13Z",
      ArtifactID: `sha256:${"1".repeat(64)}`,
      ArtifactName: ".",
      ArtifactType: "repository",
      Metadata: {
        RepoURL: "https://github.com/ze-lipe/portal-dp",
        Commit: "1".repeat(40),
      },
      Results: [
        {
          Target: "Dockerfile",
          Class: "config",
          Type: "dockerfile",
          MisconfSummary: { Successes: 31, Failures: 0 },
        },
      ],
    },
    "oci-build-link.json": {
      schemaVersion: 2,
      builder: "docker/build-push-action",
      buildDigest: `sha256:${"a".repeat(64)}`,
      localImageId: `sha256:${"b".repeat(64)}`,
      ociArchiveSha256: fixtureOciArchiveSha256,
      metadata: {
        containerImageDigest: `sha256:${"a".repeat(64)}`,
        containerImageConfigDigest: `sha256:${"b".repeat(64)}`,
      },
      ociIndex: {
        digest: `sha256:${"c".repeat(64)}`,
        manifestCount: 2,
        attestationDescriptorCount: 1,
        imageLayerCount: 1,
        allImageLayerBlobsVerified: true,
        buildDigestLinked: true,
        configDigestLinked: true,
        linkage: "DESCRIPTOR_GRAPH",
        linkedMediaType: "application/vnd.oci.image.manifest.v1+json",
        attestations: {
          referenceLinked: true,
          provenanceLinked: true,
          sbomLinked: true,
        },
      },
      sanitization: "Fixture de contrato sem metadados brutos.",
    },
    "oci-api-ready.json": { status: "ready" },
    "oci-api-session-check.json": {
      verified: true,
      endpoint: "/api/v1/sessao",
      statusCode: 200,
    },
    "oci-worker-verification.json": {
      verified: true,
      status: "SUCCEEDED",
      attempt_count: 1,
      validation_status: "AVAILABLE",
      audit_count: "2",
    },
    "security-configuration-verification.json": {
      schemaVersion: 2,
      reportType: "OCI_SECURITY_CONFIGURATION_VERIFICATION",
      status: "PASSOU",
      verifiedAt: fixedTime,
      source: "SMOKE_OCI_ETP00",
      sanitization: "Fixture de contrato sem dados de ambiente.",
      assertions: {
        processIdentity: { status: "PASSOU", user: "65532:65532" },
        immutableRootFilesystem: {
          status: "PASSOU",
          readOnly: true,
          writablePersistentMounts: [],
        },
        droppedCapabilities: { status: "PASSOU", values: ["ALL"] },
        privilegeEscalation: { status: "PASSOU", noNewPrivileges: true },
        workerRuntimeSecurity: {
          status: "PASSOU",
          user: "65532:65532",
          readOnly: true,
          droppedCapabilities: ["ALL"],
          noNewPrivileges: true,
          persistentMounts: [
            {
              destination: "/var/lib/portal-dp/private-objects",
              type: "volume",
              writable: true,
            },
          ],
        },
        syntheticApiRoute: {
          status: "PASSOU",
          enabled: false,
          observedStatusCode: 404,
        },
        runtime: {
          status: "PASSOU",
          base: "gcr.io/distroless/nodejs24-debian13:nonroot@sha256:ffab599740d4aaa66029d02b9e6d3de4f622fefb7410081c5ef69c86430f364d",
          entrypoint: ["/nodejs/bin/node"],
          command: ["apps/api/dist/main.js"],
        },
        privateObjectStorage: {
          status: "PASSOU",
          path: "/var/lib/portal-dp/private-objects",
          imageDeclaredVolumes: [],
          explicitWorkerMount: true,
          rootPermissions: "65532:65532:700",
          objectPermissions: "65532:65532:600",
        },
      },
    },
  };
  const sbomName = new Map(sbomFixtures).get(name);
  if (sbomName) {
    return `${JSON.stringify({
      bomFormat: "CycloneDX",
      specVersion: "1.7",
      metadata: {
        component: { name: sbomName, version: "0.0.0-test" },
      },
      components:
        sbomName === "api"
          ? [{ name: "fixture-package", version: "1.0.0" }]
          : [],
    })}\n`;
  }
  if (name.endsWith(".json")) {
    return `${JSON.stringify(
      reports[name] ?? { contractFixtureEvidence: name },
    )}\n`;
  }
  if (name === "portal-dp.oci.sha256") {
    return `${fixtureOciArchiveSha256}  portal-dp.oci.tar\n`;
  }
  if (name === "portal-dp.oci.tar") return fixtureOciArchive;
  if (name === "unit-tests.log") {
    return "contract fixture unit tests\nETP00_UNIT_TEST_COMMAND_STATUS=PASSOU\n";
  }
  return `contract-fixture-evidence:${name}\n`;
}

async function createApprovedFixture(options = {}) {
  const fixtureRoot = options.temporaryPath
    ? resolve(root, "tmp")
    : resolve(root, "evidencias");
  await mkdir(fixtureRoot, { recursive: true });
  const directory = await mkdtemp(
    resolve(fixtureRoot, ".acceptance-contract-"),
  );
  try {
    return await populateApprovedFixture(directory, options);
  } catch (error) {
    await removeHardenedFixture(directory);
    throw error;
  }
}

async function populateApprovedFixture(directory, options) {
  const source = join(directory, "source");
  const raw = join(source, "raw");
  const repository = join(directory, "evidence-repository");
  const stageGatesPath = join(directory, "asvs-stage-gates.json");
  const acceptancePath = join(directory, "acceptance.json");
  await mkdir(raw, { recursive: true });

  const artifactFiles = [
    "evidence-run-context.json",
    "unit-tests.log",
    "gat-02-vitest.json",
    "build-toolchain-verification.json",
    "pnpm-audit-production.json",
    "licenses-production.json",
    ...sbomFixtures.map(([name]) => name),
    "sast-semgrep.json",
    "gitleaks-result.json",
    "content-secret-scan-generated.json",
    "content-secret-scan-sast-evidence.json",
    "content-secret-scan-oci-evidence.json",
    "content-secret-scan-collected-evidence.json",
    "image-secret-scan-result.json",
    "trivy-scan-result.json",
    "portal-dp.oci.tar",
    "portal-dp.oci.sha256",
    "oci-build-link.json",
    "oci-api-ready.json",
    "oci-api-session-check.json",
    "oci-worker-verification.json",
    "trivy-image.json",
    "trivy-config.json",
    "security-configuration-verification.json",
  ];
  const gatCatalog = await json(
    resolve(root, "evidencias/manifests/gat-02-cases-v1.json"),
  );
  for (const name of artifactFiles) {
    await writeFile(join(raw, name), artifactContent(name, gatCatalog));
  }
  if (options.gitleaksExtraFields) {
    const gitleaksPath = join(raw, "gitleaks-result.json");
    const gitleaksReport = await json(gitleaksPath);
    Object.assign(gitleaksReport, options.gitleaksExtraFields);
    await writeFile(gitleaksPath, `${JSON.stringify(gitleaksReport)}\n`);
  }
  if (options.trivyImageId) {
    const trivyImagePath = join(raw, "trivy-image.json");
    const report = await json(trivyImagePath);
    report.Metadata.ImageID = options.trivyImageId;
    await writeFile(trivyImagePath, `${JSON.stringify(report)}\n`);
  }
  if (options.trivyConfigCommit) {
    const trivyConfigPath = join(raw, "trivy-config.json");
    const report = await json(trivyConfigPath);
    report.Metadata.Commit = options.trivyConfigCommit;
    await writeFile(trivyConfigPath, `${JSON.stringify(report)}\n`);
  }
  if (options.imageSecretImageId) {
    const imageSecretPath = join(raw, "image-secret-scan-result.json");
    const report = await json(imageSecretPath);
    report.expectedImageId = options.imageSecretImageId;
    report.imageId = options.imageSecretImageId;
    await writeFile(imageSecretPath, `${JSON.stringify(report)}\n`);
  }

  const collectedSummaryName = "content-secret-scan-collected-evidence.json";
  const collectedAggregateEntries = [];
  for (const name of artifactFiles.filter(
    (artifactName) => artifactName !== collectedSummaryName,
  )) {
    const bytes = await readFile(join(raw, name));
    collectedAggregateEntries.push({
      scope: "COLLECTED_EVIDENCE",
      logicalPath: `raw/${name}`,
      byteCount: bytes.length,
      sha256: createHash("sha256").update(bytes).digest("hex"),
    });
  }
  const collectedCoverage = aggregateContentScanEntries(
    collectedAggregateEntries,
  );
  const collectedReport = contentSecretScanReport(
    "COLLECTED_EVIDENCE",
    ["COLLECTED_EVIDENCE"],
    collectedCoverage,
  );
  if (options.collectedAggregateSha256) {
    collectedReport.aggregateSha256 = options.collectedAggregateSha256;
  }
  await writeFile(
    join(raw, collectedSummaryName),
    `${JSON.stringify(collectedReport)}\n`,
  );

  const template = await json(templatePath);

  const sealed = await finalizeEvidenceRun({
    runId: "gh-123456789-1",
    scope: "ETP-00",
    sourceDirectory: source,
    outputRoot: repository,
    bindingsPath: canonicalBindingsPath,
    asvsManifestPath: asvsApplicabilityPath,
    generatedAt: fixedTime,
    execution: {
      provider: "github-actions",
      repository: "example/portal-dp",
      revision: "1".repeat(40),
      ref: "refs/heads/test",
      workflow:
        options.executionWorkflow ??
        "example/portal-dp/.github/workflows/ci.yml@refs/heads/test",
      attempt: "1",
      outcomes,
      metadata: {
        event: "pull_request",
        githubRunId: "123456789",
        githubRunAttempt: "1",
        runUrl:
          "https://github.com/example/portal-dp/actions/runs/123456789/attempts/1",
        ...(options.executionMetadata ?? {}),
      },
      initiator: {
        provider: "github",
        subject: "actor-id:test",
        displayName: "Ator da fixture de contrato",
      },
    },
    responsible: {
      role: options.responsibleRole ?? "AUTOMACAO_ETP00",
      identity: {
        provider: "github",
        subject: "runner:test",
        displayName: "Executor da fixture de contrato",
      },
    },
    requirements: etp00EvidenceRequirements("github-actions", outcomes),
    artifactDownloadOutcome: "success",
    versions: {
      application: "0.0.0-test",
      schema: { version: "0001_test", sha256: "a".repeat(64) },
      fixture: { version: "ETP00_FIXTURE_TEST", sha256: "b".repeat(64) },
    },
    accessControl: {
      id: "ACL-EVIDENCE-GENERAL",
      immutable: true,
      classification: "INTERNO_RESTRITO",
      enforcement: "TEST_ACL",
      readers: ["test:reader"],
      writers: ["test:writer"],
      retention: {
        policy: "TEST_POLICY",
        minimum: "ATE_FIM_DO_PROJETO",
        transportRetentionDays: 90,
        reviewAt: "2026-11-06T12:00:00.000Z",
        transportExpiresAt: "2026-11-20T12:00:00.000Z",
        longTermProviderStatus: "PENDENTE_ANTES_RELEASE_CANDIDATE",
        longTermProvider: null,
        longTermObjectReference: null,
        longTermReceiptSourcePath: null,
        longTermReceiptSha256: null,
      },
    },
  });

  const stageGates = await json(asvsStageTemplatePath);
  stageGates.evidenceRepository.runManifestPath = repositoryRelative(
    sealed.manifestPath,
  );
  stageGates.evidenceRepository.runManifestSha256 = sealed.manifestSha256;
  stageGates.evidenceRepository.bindingCatalogSha256 =
    sealed.manifest.caseBindings.sha256;
  const stage = stageGates.stageGates.find((item) => item.stage === "ETP-00");
  stage.status = "CONTRIBUICAO_CONCLUIDA";
  for (const result of stage.results) {
    result.status = "EXECUTADA";
    result.result = "CONTRIBUICAO_COMPROVADA";
    result.evidenceArtifactIds = sealed.manifest.artifacts
      .filter((artifact) => artifact.caseIds.includes(result.caseId))
      .map((artifact) => artifact.artifactId)
      .sort();
    result.producedAt = fixedTime;
    result.responsible = "Executor sintético de teste";
    result.defectOrRisk = null;
  }
  await writeFile(stageGatesPath, `${JSON.stringify(stageGates, null, 2)}\n`);

  const ociArtifact = sealed.manifest.artifacts.find((item) =>
    item.sourcePath.endsWith("portal-dp.oci.tar"),
  );
  const gatArtifact = sealed.manifest.artifacts.find((item) =>
    item.sourcePath.endsWith("gat-02-vitest.json"),
  );
  template.manifestId = "ACE-ETP-00-TESTE-SINTETICO";
  template.status = "APROVADA";
  template.references.asvsStageGatesPath = repositoryRelative(stageGatesPath);
  template.evidence = {
    runManifestPath: repositoryRelative(sealed.manifestPath),
    runManifestSha256: sealed.manifestSha256,
    bindingCatalogSha256: sealed.manifest.caseBindings.sha256,
    applicationArtifact: {
      artifactId: ociArtifact.artifactId,
      sourcePath: ociArtifact.sourcePath,
      sha256: ociArtifact.sha256,
    },
  };
  template.versions = {
    application: sealed.manifest.versions.application,
    schema: {
      version: sealed.manifest.versions.schema.version,
      migrationsSha256: sealed.manifest.versions.schema.sha256,
    },
    fixture: sealed.manifest.versions.fixture,
  };
  template.coverage = {
    verifiedBacklogItemIds: template.scope.requiredBacklogItemIds,
    verifiedDocumentCaseIds: template.scope.requiredDocumentCaseIds,
  };
  template.results = {
    jobOutcomes: outcomes,
    gates: [
      {
        gateId: "GAT-01",
        status: "APROVADO",
        evidenceArtifactIds: [ociArtifact.artifactId],
        notes: "Resultado sintético usado somente pelo teste do validador.",
      },
      {
        gateId: "GAT-02",
        status: "APROVADO",
        evidenceArtifactIds: [gatArtifact.artifactId],
        notes: "Resultado sintético usado somente pelo teste do validador.",
      },
    ],
    measurements: {
      status: "REVISADO",
      entries: [
        {
          id: "MED-TESTE-001",
          description: "Contagem sintética para testar o contrato de medição.",
          value: 20,
          unit: "casos",
          result: "PASSOU",
          evidenceArtifactId: gatArtifact.artifactId,
        },
      ],
      justification: null,
    },
  };
  template.environment = {
    provider: sealed.manifest.execution.provider,
    repository: sealed.manifest.execution.repository,
    revision: sealed.manifest.execution.revision,
    ref: sealed.manifest.execution.ref,
    workflow: sealed.manifest.execution.workflow,
    attempt: sealed.manifest.execution.attempt,
    runUrl: sealed.manifest.execution.metadata.runUrl,
    databaseEngine: "PostgreSQL",
    databaseVersion: "18-test",
    containerPlatform: "linux/amd64",
    dataKind: "SINTETICA",
  };
  template.residuals = { reviewed: true, defects: [], risks: [] };
  template.homologations = [
    {
      area: "ENGENHARIA_E_SEGURANCA",
      name: "Homologador sintético de segurança",
      role: "Teste automatizado",
      decision: "APROVADO",
      githubRunVerified: true,
      approvedAt: acceptedTime,
      observations: "Aceite sintético; não representa aprovação real.",
    },
    {
      area: "RESPONSAVEL_DE_PRODUTO",
      name: "Homologador sintético de produto",
      role: "Teste automatizado",
      decision: "APROVADO",
      githubRunVerified: true,
      approvedAt: acceptedTime,
      observations: "Aceite sintético; não representa aprovação real.",
    },
  ];
  template.decision = {
    status: "APROVADA",
    decidedAt: acceptedTime,
    decidedBy: "Homologador sintético de produto",
    conclusion: "Decisão sintética usada somente para testar o fail-closed.",
  };
  await writeFile(acceptancePath, `${JSON.stringify(template, null, 2)}\n`);

  return { directory, acceptancePath, stageGatesPath, template, sealed };
}

test("mantem o template pendente sem inventar execucao ou aceite", async () => {
  const structural = await execute(process.execPath, [
    validator,
    "--manifest",
    templatePath,
    "--allow-pending",
  ]);
  assert.match(structural.stdout, /"ready":false/u);

  await assert.rejects(
    execute(process.execPath, [validator, "--manifest", templatePath]),
    /permanece pendente/u,
  );
});

test("rejeita uma afirmacao de hash inserida no template pendente", async () => {
  await mkdir(resolve(root, "tmp"), { recursive: true });
  const directory = await mkdtemp(resolve(root, "tmp/etp00-pending-"));
  try {
    const manifest = await json(templatePath);
    const path = join(directory, "pending-with-fake-hash.json");
    manifest.evidence.runManifestSha256 = "c".repeat(64);
    await writeFile(path, `${JSON.stringify(manifest, null, 2)}\n`);
    await assert.rejects(
      execute(process.execPath, [
        validator,
        "--manifest",
        path,
        "--allow-pending",
      ]),
      /nao pode antecipar hash/u,
    );
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("mantem o aceite bloqueado se a aprovacao de Seguranca for removida", async () => {
  const fixture = await createApprovedFixture();
  try {
    const stageGates = await json(fixture.stageGatesPath);
    stageGates.scopeCorrection.approval = {
      status: "PENDENTE_APROVACAO_SEGURANCA",
      responsible: null,
      approvedAt: null,
      subjectSha256: null,
    };
    await writeFile(
      fixture.stageGatesPath,
      `${JSON.stringify(stageGates, null, 2)}\n`,
    );
    await assert.rejects(
      execute(process.execPath, [
        validator,
        "--manifest",
        fixture.acceptancePath,
      ]),
      /scope correction still requires named security approval/u,
    );
  } finally {
    await removeHardenedFixture(fixture.directory);
  }
});

test("rejeita bypass sintetico, papel de teste e repositorio temporario", async () => {
  const fixture = await createApprovedFixture({
    temporaryPath: true,
    executionMetadata: { syntheticTest: true },
    responsibleRole: "AUTOMACAO_ETP00_TESTE",
  });
  try {
    await assert.rejects(
      execute(process.execPath, [
        validator,
        "--manifest",
        fixture.acceptancePath,
      ]),
      /nao pode usar bypass sintetico, papel de teste ou artefato temporario/u,
    );
  } finally {
    await removeHardenedFixture(fixture.directory);
  }
});

test("rejeita runUrl hospedada fora da origem canonica do GitHub", async () => {
  const fixture = await createApprovedFixture({
    executionMetadata: {
      runUrl:
        "https://host-malicioso.example/example/portal-dp/actions/runs/123456789/attempts/1",
    },
  });
  try {
    await assert.rejects(
      execute(process.execPath, [
        validator,
        "--manifest",
        fixture.acceptancePath,
      ]),
      /origem canonica GitHub diverge/u,
    );
  } finally {
    await removeHardenedFixture(fixture.directory);
  }
});

test("rejeita execucao originada de outro arquivo de workflow", async () => {
  const fixture = await createApprovedFixture({
    executionWorkflow:
      "example/portal-dp/.github/workflows/outro.yml@refs/heads/test",
  });
  try {
    await assert.rejects(
      execute(process.execPath, [
        validator,
        "--manifest",
        fixture.acceptancePath,
      ]),
      /workflow canonico/u,
    );
  } finally {
    await removeHardenedFixture(fixture.directory);
  }
});

test("rejeita reducao do minimo canonico de onze SBOMs", async () => {
  const fixture = await createApprovedFixture();
  try {
    const manifest = await json(fixture.sealed.manifestPath);
    const sbomRequirement = manifest.completeness.requirements.find(
      (requirement) => requirement.id === "SBOM",
    );
    sbomRequirement.minimumCount = 1;
    const bytes = Buffer.from(`${JSON.stringify(manifest, null, 2)}\n`);
    const digest = createHash("sha256").update(bytes).digest("hex");
    const sidecar = resolve(
      fixture.sealed.manifestPath,
      "..",
      "manifest.sha256",
    );
    await chmod(fixture.sealed.manifestPath, 0o640);
    await chmod(sidecar, 0o640);
    await writeFile(fixture.sealed.manifestPath, bytes);
    await writeFile(sidecar, `${digest}  manifest.json\n`);
    await assert.rejects(
      execute(process.execPath, [
        validator,
        "--manifest",
        fixture.acceptancePath,
      ]),
      /missing mandatory evidence requirement SBOM/u,
    );
  } finally {
    await removeHardenedFixture(fixture.directory);
  }
});

test("rejeita scan Trivy vinculado a outra imagem OCI", async () => {
  const fixture = await createApprovedFixture({
    trivyImageId: `sha256:${"9".repeat(64)}`,
  });
  try {
    await assert.rejects(
      execute(process.execPath, [
        validator,
        "--manifest",
        fixture.acceptancePath,
      ]),
      /ImageID local esperado/u,
    );
  } finally {
    await removeHardenedFixture(fixture.directory);
  }
});

test("rejeita scan de segredos vinculado a outro ImageID local", async () => {
  const fixture = await createApprovedFixture({
    imageSecretImageId: `sha256:${"9".repeat(64)}`,
  });
  try {
    await assert.rejects(
      execute(process.execPath, [
        validator,
        "--manifest",
        fixture.acceptancePath,
      ]),
      /image secret scan does not match oci-build-link\.localImageId/u,
    );
  } finally {
    await removeHardenedFixture(fixture.directory);
  }
});

test("rejeita scan Trivy de configuracao vinculado a outra revisao", async () => {
  const fixture = await createApprovedFixture({
    trivyConfigCommit: "9".repeat(40),
  });
  try {
    await assert.rejects(
      execute(process.execPath, [
        validator,
        "--manifest",
        fixture.acceptancePath,
      ]),
      /commit esperado/u,
    );
  } finally {
    await removeHardenedFixture(fixture.directory);
  }
});

test("rejeita hash de artefato que diverge do pacote selado", async () => {
  const fixture = await createApprovedFixture();
  try {
    fixture.template.evidence.applicationArtifact.sha256 = "f".repeat(64);
    await writeFile(
      fixture.acceptancePath,
      `${JSON.stringify(fixture.template, null, 2)}\n`,
    );
    await assert.rejects(
      execute(process.execPath, [
        validator,
        "--manifest",
        fixture.acceptancePath,
      ]),
      /hash do artefato diverge/u,
    );
  } finally {
    await removeHardenedFixture(fixture.directory);
  }
});

test("rejeita aceite que omite um item do backlog verificado", async () => {
  const fixture = await createApprovedFixture();
  try {
    fixture.template.coverage.verifiedBacklogItemIds.pop();
    await writeFile(
      fixture.acceptancePath,
      `${JSON.stringify(fixture.template, null, 2)}\n`,
    );
    await assert.rejects(
      execute(process.execPath, [
        validator,
        "--manifest",
        fixture.acceptancePath,
      ]),
      /verifiedBacklogItemIds diverge/u,
    );
  } finally {
    await removeHardenedFixture(fixture.directory);
  }
});

test("rejeita conteúdo extra em evidência sanitizada de segredos", async () => {
  const canary = ["conteudo", "sensivel", "indevido"].join("-");
  const fixture = await createApprovedFixture({
    gitleaksExtraFields: { rawReport: canary },
  });
  try {
    await assert.rejects(
      execute(process.execPath, [
        validator,
        "--manifest",
        fixture.acceptancePath,
      ]),
      /clean full-history redacted scan/u,
    );
  } finally {
    await removeHardenedFixture(fixture.directory);
  }
});

test("rejeita agregado COLLECTED_EVIDENCE adulterado", async () => {
  const fixture = await createApprovedFixture({
    collectedAggregateSha256: "f".repeat(64),
  });
  try {
    await assert.rejects(
      execute(process.execPath, [
        validator,
        "--manifest",
        fixture.acceptancePath,
      ]),
      /COLLECTED_EVIDENCE aggregate does not match/u,
    );
  } finally {
    await removeHardenedFixture(fixture.directory);
  }
});
