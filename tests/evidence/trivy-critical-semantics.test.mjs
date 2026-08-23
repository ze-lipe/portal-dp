import assert from "node:assert/strict";
import test from "node:test";

import { validateTrivyEvidenceCoherence } from "../../scripts/critical-evidence-semantics.mjs";
import {
  TRIVY_REPORT_CONTRACT,
  temporaryRiskAcceptanceEvidence,
} from "../../scripts/trivy-report-contract.mjs";

const revision = "a".repeat(40);
const imageReference = `portal-dp:${revision}`;
const imageId = `sha256:${"b".repeat(64)}`;
const evaluatedAt = "2026-08-23T12:00:00-03:00";
const baseReference =
  "gcr.io/distroless/nodejs24-debian13:nonroot@sha256:ffab599740d4aaa66029d02b9e6d3de4f622fefb7410081c5ef69c86430f364d";
const affectedLayer = {
  Digest:
    "sha256:cf397222899a3b6b98c35941fd44d79f8ff61303349b3bece21b49dacc1ac106",
  DiffID:
    "sha256:80bb2aedf42cbf9911cb9073be23406c0e7f799f8083bf13a1cd2d460a25e383",
};
const packageUid = "8510e5499804c1a";

function ociBuildEvidence() {
  return {
    schemaVersion: 4,
    builder: "docker/build-push-action",
    buildDigest: `sha256:${"1".repeat(64)}`,
    dockerfileFrontend:
      "docker/dockerfile:1.7.1@sha256:a57df69d0ea827fb7266491f2813635de6f17269be881f696fbfdf2d83dda33e",
    dockerfileFrontendLinked: true,
    dockerfileSha256: "2".repeat(64),
    dockerfileSourceLinked: true,
    localImageId: imageId,
    ociArchiveSha256: "3".repeat(64),
    ociImageManifestDigest: `sha256:${"4".repeat(64)}`,
    provenanceDependencyLinked: true,
    runtimeBase: baseReference,
    runtimeBaseLabelLinked: true,
    runtimeManifestDigest: `sha256:${"5".repeat(64)}`,
    metadata: {
      containerImageDigest: `sha256:${"1".repeat(64)}`,
      containerImageConfigDigest: imageId,
      ociImageManifestDigest: `sha256:${"4".repeat(64)}`,
      runtimeManifestDigest: `sha256:${"5".repeat(64)}`,
    },
    ociIndex: {
      digest: `sha256:${"6".repeat(64)}`,
      manifestCount: 2,
      attestationDescriptorCount: 1,
      imageLayerCount: 1,
      allImageLayerBlobsVerified: true,
      buildDigestLinked: true,
      ociImageManifestLinked: true,
      runtimeConfigLinked: true,
      configDigestLinked: true,
      linkage: "DESCRIPTOR_GRAPH",
      linkedMediaType: "application/vnd.oci.image.manifest.v1+json",
      attestations: {
        referenceLinked: true,
        provenanceLinked: true,
        sbomLinked: true,
      },
    },
    sanitization: "Fixture de prova OCI vinculada.",
  };
}

function vulnerability() {
  return {
    VulnerabilityID: "CVE-2026-14456",
    PkgID: "libssl3t64@3.5.6-1~deb13u2",
    PkgIdentifier: { UID: packageUid },
    PkgName: "libssl3t64",
    InstalledVersion: "3.5.6-1~deb13u2",
    Status: "fix_deferred",
    Severity: "HIGH",
    Layer: { ...affectedLayer },
  };
}

function imageReport() {
  return {
    SchemaVersion: 2,
    Trivy: { Version: "0.70.0" },
    ReportID: "019c0000-0000-7000-8000-000000000001",
    CreatedAt: "2026-08-23T15:00:00Z",
    ArtifactID: `sha256:${"c".repeat(64)}`,
    ArtifactName: imageReference,
    ArtifactType: "container_image",
    Metadata: {
      OS: { Family: "debian", Name: "13.6" },
      ImageID: imageId,
      DiffIDs: [affectedLayer.DiffID],
      RepoTags: [imageReference],
      Reference: imageReference,
      ImageConfig: {
        config: {
          Labels: {
            "org.opencontainers.image.base.name": baseReference,
          },
        },
      },
    },
    Results: [
      {
        Target: "portal-dp (debian 13)",
        Class: "os-pkgs",
        Type: "debian",
        Packages: [
          {
            ID: "libssl3t64@3.5.6-1~deb13u2",
            Name: "libssl3t64",
            Version: "3.5.6",
            Release: "1~deb13u2",
            Arch: "amd64",
            Identifier: { UID: packageUid },
            Layer: { ...affectedLayer },
          },
        ],
        Vulnerabilities: [vulnerability()],
      },
    ],
  };
}

function configReport() {
  return {
    SchemaVersion: 2,
    Trivy: { Version: "0.70.0" },
    ReportID: "019c0000-0000-7000-8000-000000000002",
    CreatedAt: "2026-08-23T15:00:00Z",
    ArtifactID: `sha256:${"e".repeat(64)}`,
    ArtifactName: ".",
    ArtifactType: "repository",
    Metadata: { Commit: revision },
    Results: [
      {
        Target: "Dockerfile",
        Class: "config",
        Type: "dockerfile",
        MisconfSummary: { Successes: 31, Failures: 0 },
      },
    ],
  };
}

function summary() {
  return {
    schemaVersion: 2,
    reportType: "TRIVY_SCAN_RESULT",
    scanner: "trivy",
    scannerVersion: TRIVY_REPORT_CONTRACT.trivyVersion,
    actionRevision: TRIVY_REPORT_CONTRACT.actionRevision,
    configurationPolicy: "CONTROLLED_NO_IGNORE_OR_SKIP_OVERRIDES",
    expectedImageReference: imageReference,
    expectedImageId: imageId,
    expectedConfigArtifactName: ".",
    expectedConfigCommit: revision,
    imageStepOutcome: "failure",
    configStepOutcome: "success",
    reports: {
      image: {
        structurallyValid: true,
        approved: true,
        failureCode: null,
        artifactName: imageReference,
        artifactType: "container_image",
        targetCount: 1,
        findingCount: 1,
        acceptedRiskFindingCount: 1,
        blockingFindingCount: 0,
        imageId,
        packageCount: 1,
        packageMetadataSanitized: true,
      },
      config: {
        structurallyValid: true,
        approved: true,
        failureCode: null,
        artifactName: ".",
        artifactType: "repository",
        targetCount: 1,
        findingCount: 0,
        acceptedRiskFindingCount: 0,
        blockingFindingCount: 0,
        commit: revision,
        metadataSanitized: true,
        requiredTargetType: "dockerfile",
      },
    },
    evaluatedAt,
    ociBuildEvidenceValid: true,
    reportPublicationStatus: "published",
    riskAcceptance: temporaryRiskAcceptanceEvidence(),
    rawReportsPublished: true,
    rawFindingReportsRetained: true,
    redacted: true,
    outcome: "success_with_accepted_risk",
    failureCode: null,
    passed: true,
    conclusion: "APROVADA_COM_RISCO_TEMPORARIO_ACEITO",
  };
}

const options = {
  expectedImageReference: imageReference,
  expectedImageId: imageId,
  expectedConfigCommit: revision,
  ociBuildEvidence: ociBuildEvidence(),
  requireApproved: true,
  sealedAt: "2026-08-23T16:00:00Z",
};

test("recalcula a excecao a partir do achado bruto preservado", () => {
  assert.deepEqual(
    validateTrivyEvidenceCoherence(
      summary(),
      imageReport(),
      configReport(),
      options,
    ),
    {
      allStructured: true,
      approved: true,
      outcome: "success_with_accepted_risk",
    },
  );
});

test("rejeita resumo ou relatorio bruto divergente", () => {
  const alteredSummary = summary();
  alteredSummary.reports.image.acceptedRiskFindingCount = 0;
  alteredSummary.reports.image.blockingFindingCount = 1;
  alteredSummary.reports.image.approved = false;
  alteredSummary.passed = false;
  alteredSummary.rawReportsPublished = false;
  alteredSummary.rawFindingReportsRetained = false;
  alteredSummary.outcome = "findings";
  alteredSummary.conclusion = "NAO_APROVADA_ACHADO_TRIVY";
  alteredSummary.riskAcceptance = null;
  assert.throws(() =>
    validateTrivyEvidenceCoherence(
      alteredSummary,
      imageReport(),
      configReport(),
      { ...options, requireApproved: false },
    ),
  );

  const alteredRaw = imageReport();
  alteredRaw.Results[0].Vulnerabilities.push({ VulnerabilityID: "CVE-OUTRA" });
  assert.throws(() =>
    validateTrivyEvidenceCoherence(
      summary(),
      alteredRaw,
      configReport(),
      options,
    ),
  );

  const unsanitizedRaw = imageReport();
  unsanitizedRaw.Results[0].Packages[0].Maintainer = `Debian Maintainer <${["maintainer", "debian.org"].join("@")}>`;
  assert.throws(
    () =>
      validateTrivyEvidenceCoherence(
        summary(),
        unsanitizedRaw,
        configReport(),
        options,
      ),
    /Maintainer/u,
  );
});

test("rejeita excecao sem a prova OCI exata da mesma imagem", () => {
  assert.throws(() =>
    validateTrivyEvidenceCoherence(summary(), imageReport(), configReport(), {
      ...options,
      ociBuildEvidence: undefined,
    }),
  );

  const otherImage = ociBuildEvidence();
  otherImage.localImageId = `sha256:${"9".repeat(64)}`;
  otherImage.metadata.containerImageConfigDigest = otherImage.localImageId;
  assert.throws(() =>
    validateTrivyEvidenceCoherence(summary(), imageReport(), configReport(), {
      ...options,
      ociBuildEvidence: otherImage,
    }),
  );
});

test("preserva evidencia historica e impede retrodatacao de nova execucao", () => {
  // A data atual da verificacao nao participa: valem evaluatedAt e sealedAt
  // preservados no pacote historico.
  assert.equal(
    validateTrivyEvidenceCoherence(
      summary(),
      imageReport(),
      configReport(),
      options,
    ).approved,
    true,
  );
  assert.throws(
    () =>
      validateTrivyEvidenceCoherence(summary(), imageReport(), configReport(), {
        ...options,
        sealedAt: "2026-09-22T12:00:00-03:00",
      }),
    /sealed run timestamp/u,
  );
});

test("mantem compatibilidade de leitura do schema v1", () => {
  const legacySummary = summary();
  legacySummary.schemaVersion = 1;
  legacySummary.imageStepOutcome = "success";
  legacySummary.reports.image.findingCount = 0;
  delete legacySummary.reports.image.acceptedRiskFindingCount;
  delete legacySummary.reports.image.blockingFindingCount;
  delete legacySummary.reports.image.packageMetadataSanitized;
  delete legacySummary.reports.config.acceptedRiskFindingCount;
  delete legacySummary.reports.config.blockingFindingCount;
  delete legacySummary.evaluatedAt;
  delete legacySummary.ociBuildEvidenceValid;
  delete legacySummary.reportPublicationStatus;
  delete legacySummary.riskAcceptance;
  legacySummary.rawFindingReportsRetained = false;
  legacySummary.outcome = "success";
  legacySummary.conclusion = "SEM_ACHADOS_BLOQUEADORES";

  const legacyImage = imageReport();
  legacyImage.Results[0].Vulnerabilities = [];
  legacyImage.Results[0].Packages[0].Maintainer = `Debian Maintainer <${["maintainer", "debian.org"].join("@")}>`;
  legacyImage.Results[0].Packages[0].Identifier = {
    PURL: "pkg:deb/debian/libssl3t64@3.5.6-1",
  };
  assert.equal(
    validateTrivyEvidenceCoherence(legacySummary, legacyImage, configReport(), {
      ...options,
      sealedAt: undefined,
    }).approved,
    true,
  );
});
