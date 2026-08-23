import assert from "node:assert/strict";
import test from "node:test";

import {
  TRIVY_REPORT_CONTRACT,
  TRIVY_TEMPORARY_RISK_ACCEPTANCE,
  inspectTrivyReport,
  temporaryRiskAcceptanceEvidence,
  validateTrivyOciBuildEvidence,
  validateTrivyReport,
} from "../../scripts/trivy-report-contract.mjs";

const imageName = `portal-dp:${"a".repeat(40)}`;
const imageId = `sha256:${"b".repeat(64)}`;
const artifactId = `sha256:${"c".repeat(64)}`;
const layerId = `sha256:${"d".repeat(64)}`;
const configCommit = "e".repeat(40);
const acceptedEvaluationTime = "2026-08-23T12:00:00-03:00";
const acceptedBaseReference =
  "gcr.io/distroless/nodejs24-debian13:nonroot@sha256:ffab599740d4aaa66029d02b9e6d3de4f622fefb7410081c5ef69c86430f364d";
const affectedLayer = {
  Digest:
    "sha256:cf397222899a3b6b98c35941fd44d79f8ff61303349b3bece21b49dacc1ac106",
  DiffID:
    "sha256:80bb2aedf42cbf9911cb9073be23406c0e7f799f8083bf13a1cd2d460a25e383",
};
const packageUid = "8510e5499804c1a";

function ociBuildEvidence() {
  const buildDigest = `sha256:${"1".repeat(64)}`;
  const runtimeManifestDigest = `sha256:${"2".repeat(64)}`;
  const ociImageManifestDigest = `sha256:${"3".repeat(64)}`;
  return {
    schemaVersion: 4,
    builder: "docker/build-push-action",
    buildDigest,
    dockerfileSha256: "4".repeat(64),
    dockerfileSourceLinked: true,
    dockerfileFrontend:
      "docker/dockerfile:1.7.1@sha256:a57df69d0ea827fb7266491f2813635de6f17269be881f696fbfdf2d83dda33e",
    dockerfileFrontendLinked: true,
    ociImageManifestDigest,
    provenanceDependencyLinked: true,
    runtimeBase: acceptedBaseReference,
    runtimeBaseLabelLinked: true,
    runtimeManifestDigest,
    localImageId: imageId,
    ociArchiveSha256: "5".repeat(64),
    metadata: {
      containerImageDigest: buildDigest,
      containerImageConfigDigest: imageId,
      ociImageManifestDigest,
      runtimeManifestDigest,
    },
    ociIndex: {
      digest: `sha256:${"6".repeat(64)}`,
      manifestCount: 2,
      attestationDescriptorCount: 1,
      imageLayerCount: 3,
      allImageLayerBlobsVerified: true,
      buildDigestLinked: true,
      ociImageManifestLinked: true,
      runtimeConfigLinked: true,
      configDigestLinked: true,
      linkage: "DESCRIPTOR_GRAPH",
      linkedMediaType: "application/vnd.oci.image.index.v1+json",
      attestations: {
        referenceLinked: true,
        provenanceLinked: true,
        sbomLinked: true,
      },
    },
    sanitization: "fixture tecnica",
  };
}

function acceptedVulnerability() {
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

function acceptedPackage() {
  return {
    ID: "libssl3t64@3.5.6-1~deb13u2",
    Name: "libssl3t64",
    Version: "3.5.6",
    Release: "1~deb13u2",
    Arch: "amd64",
    Identifier: { UID: packageUid },
    Layer: { ...affectedLayer },
  };
}

function attachAcceptedPackage(report) {
  Object.assign(report.Results[0].Packages[0], acceptedPackage());
  report.Metadata.DiffIDs = [affectedLayer.DiffID];
}

function imageReport() {
  return {
    SchemaVersion: 2,
    Trivy: { Version: "0.70.0" },
    ReportID: "019c0000-0000-7000-8000-000000000001",
    CreatedAt: "2026-08-22T10:11:12.123456789Z",
    ArtifactID: artifactId,
    ArtifactName: imageName,
    ArtifactType: "container_image",
    Metadata: {
      Size: 1024,
      OS: { Family: "debian", Name: "13.6" },
      ImageID: imageId,
      DiffIDs: [layerId],
      RepoTags: [imageName],
      Reference: imageName,
      ImageConfig: {},
      Layers: [],
    },
    Results: [
      {
        Target: "portal-dp (debian 13)",
        Class: "os-pkgs",
        Type: "debian",
        Packages: [{ Name: "base-files", Version: "13.8+deb13u1" }],
      },
      {
        Target: "nodejs/bin/node",
        Class: "lang-pkgs",
        Type: "gobinary",
        Packages: [{ Name: "node", Version: "24.10.0" }],
        Vulnerabilities: [],
      },
    ],
  };
}

function configReport() {
  return {
    SchemaVersion: 2,
    Trivy: { Version: "0.70.0" },
    ReportID: "019c0000-0000-7000-8000-000000000002",
    CreatedAt: "2026-08-22T10:11:13Z",
    ArtifactName: ".",
    ArtifactType: "repository",
    ArtifactID: `sha256:${"f".repeat(64)}`,
    Metadata: {
      RepoURL: "https://github.com/ze-lipe/portal-dp",
      Commit: configCommit,
      CommitMsg: "fixture",
    },
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

const imageOptions = {
  label: "imagem",
  scope: "image",
  expectedArtifactName: imageName,
  expectedImageId: imageId,
  expectedTrivyVersion: "0.70.0",
};
const configOptions = {
  label: "configuracao",
  scope: "config",
  expectedArtifactName: ".",
  expectedConfigCommit: configCommit,
  expectedTrivyVersion: "0.70.0",
};
const acceptedImageOptions = {
  ...imageOptions,
  evaluatedAt: acceptedEvaluationTime,
  ociBuildEvidence: ociBuildEvidence(),
};

test("aprova relatorios vinculados e com cobertura dos scanners esperados", () => {
  const imageSummary = validateTrivyReport(imageReport(), imageOptions);
  assert.deepEqual(
    {
      approved: imageSummary.approved,
      scanner: imageSummary.scanner,
      imageId: imageSummary.imageId,
      targetCount: imageSummary.targetCount,
      packageCount: imageSummary.packageCount,
      trivyVersion: imageSummary.trivyVersion,
    },
    {
      approved: true,
      scanner: "vuln",
      imageId,
      targetCount: 2,
      packageCount: 2,
      trivyVersion: "0.70.0",
    },
  );
  const configSummary = validateTrivyReport(configReport(), configOptions);
  assert.equal(configSummary.approved, true);
  assert.equal(configSummary.scanner, "misconfig");
  assert.equal(configSummary.requiredTargetType, "dockerfile");
});

test("rejeita schema, versao, identificador, data ou campos desconhecidos", () => {
  for (const mutate of [
    (report) => (report.SchemaVersion = 1),
    (report) => (report.Trivy.Version = "0.69.3"),
    (report) => (report.ReportID = "nao-e-uuidv7"),
    (report) => (report.CreatedAt = "ontem"),
    (report) => (report.CampoInventado = true),
  ]) {
    const report = imageReport();
    mutate(report);
    assert.throws(
      () => validateTrivyReport(report, imageOptions),
      /SchemaVersion|versao inesperada|UUIDv7|CreatedAt|campos desconhecidos/u,
    );
  }
  assert.throws(
    () =>
      validateTrivyReport(imageReport(), {
        ...imageOptions,
        expectedTrivyVersion: "0.69.3",
      }),
    /contrato pinado/u,
  );
});

test("rejeita relatorio de imagem desvinculado do nome, tipo ou ImageID local", () => {
  for (const mutate of [
    (report) => (report.ArtifactName = "portal-dp:outra"),
    (report) => (report.ArtifactType = "filesystem"),
    (report) => (report.ArtifactID = "sha256:curto"),
    (report) => (report.Metadata.ImageID = `sha256:${"e".repeat(64)}`),
    (report) => (report.Metadata.Reference = "portal-dp:outra"),
    (report) => (report.Metadata.RepoTags = ["portal-dp:outra"]),
    (report) => (report.Metadata.DiffIDs = []),
  ]) {
    const report = imageReport();
    mutate(report);
    assert.throws(() => validateTrivyReport(report, imageOptions));
  }
});

test("rejeita ausencia ou classe incompativel de cobertura vuln", () => {
  for (const results of [
    [],
    [{ Target: "Dockerfile", Class: "config", Type: "dockerfile" }],
    [{ Target: "portal-dp", Class: "os-pkgs", Type: "" }],
  ]) {
    const report = imageReport();
    report.Results = results;
    assert.throws(() => validateTrivyReport(report, imageOptions));
  }
});

test("rejeita relatorio limpo sem inventario de pacotes", () => {
  const report = imageReport();
  for (const result of report.Results) delete result.Packages;
  assert.throws(
    () => validateTrivyReport(report, imageOptions),
    /inventario e cobertura/u,
  );
});

test("exige remocao fail-closed de Maintainer e Identifier.PURL quando solicitado", () => {
  const report = imageReport();
  report.Results[0].Packages[0].Maintainer =
    "Debian Maintainer <maintainer@debian.org>";
  report.Results[0].Packages[0].Identifier = {
    PURL: "pkg:deb/debian/base-files@13.8",
    UID: "uid-publico",
  };
  const native = inspectTrivyReport(report, imageOptions);
  assert.equal(native.packageMetadataSanitized, false);
  assert.throws(
    () =>
      inspectTrivyReport(report, {
        ...imageOptions,
        requireSanitizedPackageMetadata: true,
      }),
    /Maintainer ou Identifier\.PURL/u,
  );
  delete report.Results[0].Packages[0].Maintainer;
  delete report.Results[0].Packages[0].Identifier.PURL;
  const retained = inspectTrivyReport(report, {
    ...imageOptions,
    requireSanitizedPackageMetadata: true,
  });
  assert.equal(retained.packageMetadataSanitized, true);
  assert.equal(report.Results[0].Packages[0].Identifier.UID, "uid-publico");
});

test("rejeita vulnerabilidade fora da excecao e achado malformado", () => {
  const finding = imageReport();
  finding.Results[0].Vulnerabilities = [{ Severity: "LOW" }];
  const inspected = inspectTrivyReport(finding, imageOptions);
  assert.equal(inspected.findingCount, 1);
  assert.equal(inspected.approved, false);
  assert.throws(
    () => validateTrivyReport(finding, imageOptions),
    /vulnerabilidade bloqueadora/u,
  );

  const malformed = imageReport();
  malformed.Results[0].Vulnerabilities = "nenhuma";
  assert.throws(
    () => validateTrivyReport(malformed, imageOptions),
    /formato invalido/u,
  );
});

test("aceita temporariamente somente a ocorrencia exata e a mantem visivel", () => {
  const report = imageReport();
  report.Metadata.ImageConfig = {
    config: {
      Labels: {
        "org.opencontainers.image.base.name": acceptedBaseReference,
      },
    },
  };
  attachAcceptedPackage(report);
  report.Results[0].Vulnerabilities = [acceptedVulnerability()];
  const inspected = validateTrivyReport(report, {
    ...acceptedImageOptions,
  });
  assert.equal(inspected.findingCount, 1);
  assert.equal(inspected.acceptedRiskFindingCount, 1);
  assert.equal(inspected.blockingFindingCount, 0);
  assert.equal(inspected.approved, true);
  assert.deepEqual(inspected.riskAcceptance, temporaryRiskAcceptanceEvidence());
  assert.equal(
    report.Results[0].Vulnerabilities[0].VulnerabilityID,
    "CVE-2026-14456",
  );
});

test("exige prova OCI schema 4 vinculada ao mesmo ImageID para aceitar a CVE", () => {
  assert.deepEqual(
    validateTrivyOciBuildEvidence(ociBuildEvidence(), {
      expectedImageId: imageId,
    }),
    {
      schemaVersion: 4,
      imageId,
      runtimeBase: acceptedBaseReference,
      approved: true,
    },
  );

  const proofMutations = [
    (proof) => (proof.schemaVersion = 3),
    (proof) => (proof.localImageId = `sha256:${"0".repeat(64)}`),
    (proof) => (proof.runtimeBase = proof.runtimeBase.replace(/.$/u, "0")),
    (proof) => (proof.dockerfileSourceLinked = false),
    (proof) => (proof.dockerfileFrontendLinked = false),
    (proof) => (proof.provenanceDependencyLinked = false),
    (proof) => (proof.runtimeBaseLabelLinked = false),
    (proof) => (proof.metadata.containerImageConfigDigest = proof.buildDigest),
    (proof) => (proof.ociIndex.allImageLayerBlobsVerified = false),
    (proof) => (proof.ociIndex.attestations.provenanceLinked = false),
  ];
  for (const mutateProof of [null, ...proofMutations]) {
    const report = imageReport();
    report.Metadata.ImageConfig = {
      config: {
        Labels: {
          "org.opencontainers.image.base.name": acceptedBaseReference,
        },
      },
    };
    attachAcceptedPackage(report);
    report.Results[0].Vulnerabilities = [acceptedVulnerability()];
    const proof = ociBuildEvidence();
    if (mutateProof) mutateProof(proof);
    const inspected = inspectTrivyReport(report, {
      ...acceptedImageOptions,
      ociBuildEvidence: mutateProof === null ? undefined : proof,
    });
    assert.equal(inspected.acceptedRiskFindingCount, 0);
    assert.equal(inspected.blockingFindingCount, 1);
    assert.equal(inspected.approved, false);
  }
});

test("bloqueia qualquer divergencia da excecao temporaria", () => {
  const mutations = [
    (report) =>
      (report.Results[0].Vulnerabilities[0].VulnerabilityID = "CVE-OUTRA"),
    (report) =>
      (report.Results[0].Vulnerabilities[0].PkgID = "libssl3t64@3.5.7"),
    (report) => (report.Results[0].Vulnerabilities[0].PkgName = "libssl-outro"),
    (report) =>
      (report.Results[0].Vulnerabilities[0].InstalledVersion = "3.5.7"),
    (report) => (report.Results[0].Vulnerabilities[0].Severity = "CRITICAL"),
    (report) => (report.Results[0].Vulnerabilities[0].Status = "affected"),
    (report) => (report.Results[0].Class = "lang-pkgs"),
    (report) => (report.Results[0].Type = "gobinary"),
    (report) => (report.Results[0].Packages[0].Name = "base-files"),
    (report) => (report.Results[0].Packages[0].Version = "3.5.7"),
    (report) => (report.Results[0].Packages[0].Release = "2"),
    (report) => (report.Results[0].Packages[0].Arch = "arm64"),
    (report) => (report.Results[0].Packages[0].ID = "libssl3t64@3.5.7"),
    (report) => report.Results[0].Packages.push(acceptedPackage()),
    (report) =>
      (report.Results[0].Packages[0].Identifier.UID = "uid-divergente"),
    (report) =>
      (report.Results[0].Vulnerabilities[0].PkgIdentifier.UID =
        "uid-divergente"),
    (report) =>
      (report.Results[0].Packages[0].Layer.Digest = `sha256:${"0".repeat(64)}`),
    (report) =>
      (report.Results[0].Vulnerabilities[0].Layer.DiffID = `sha256:${"0".repeat(64)}`),
    (report) => {
      report.Results[0].Packages[0] = {
        ID: "base-files@13.8",
        Name: "base-files",
        Version: "13.8",
      };
      report.Results[1].Packages[0] = acceptedPackage();
    },
    (report) => (report.Metadata.OS.Family = "alpine"),
    (report) => (report.Metadata.OS.Name = "12"),
    (report) => (report.Metadata.OS.Name = "14"),
    (report) => (report.Metadata.OS.Name = "13x"),
    (report) => (report.Metadata.DiffIDs = [layerId]),
    (report) =>
      (report.Metadata.ImageConfig.config.Labels[
        "org.opencontainers.image.base.name"
      ] = acceptedBaseReference.replace(/.$/u, "0")),
    (report) => (report.Results[0].Vulnerabilities[0].FixedVersion = "3.5.7-1"),
  ];
  for (const mutate of mutations) {
    const report = imageReport();
    report.Metadata.ImageConfig = {
      config: {
        Labels: {
          "org.opencontainers.image.base.name": acceptedBaseReference,
        },
      },
    };
    attachAcceptedPackage(report);
    report.Results[0].Vulnerabilities = [acceptedVulnerability()];
    mutate(report);
    const inspected = inspectTrivyReport(report, {
      ...acceptedImageOptions,
    });
    assert.equal(inspected.acceptedRiskFindingCount, 0);
    assert.equal(inspected.blockingFindingCount, 1);
    assert.equal(inspected.approved, false);
  }
});

test("bloqueia duplicata, outro achado e uso fora da vigencia", () => {
  const makeAcceptedReport = () => {
    const report = imageReport();
    report.Metadata.ImageConfig = {
      config: {
        Labels: {
          "org.opencontainers.image.base.name": acceptedBaseReference,
        },
      },
    };
    attachAcceptedPackage(report);
    report.Results[0].Vulnerabilities = [acceptedVulnerability()];
    return report;
  };
  assert.equal(
    TRIVY_TEMPORARY_RISK_ACCEPTANCE.approvedAt,
    TRIVY_TEMPORARY_RISK_ACCEPTANCE.validFrom,
  );
  const firstValidInstant = inspectTrivyReport(makeAcceptedReport(), {
    ...acceptedImageOptions,
    evaluatedAt: TRIVY_TEMPORARY_RISK_ACCEPTANCE.validFrom,
  });
  assert.equal(firstValidInstant.acceptedRiskFindingCount, 1);
  assert.equal(firstValidInstant.blockingFindingCount, 0);
  for (const vulnerabilities of [
    [acceptedVulnerability(), acceptedVulnerability()],
    [acceptedVulnerability(), { VulnerabilityID: "CVE-OUTRA" }],
  ]) {
    const report = makeAcceptedReport();
    report.Results[0].Vulnerabilities = vulnerabilities;
    const inspected = inspectTrivyReport(report, {
      ...acceptedImageOptions,
    });
    assert.equal(inspected.findingCount, 2);
    assert.equal(inspected.acceptedRiskFindingCount, 0);
    assert.equal(inspected.blockingFindingCount, 2);
    assert.equal(inspected.approved, false);
  }
  for (const evaluatedAt of [
    "2026-08-23T00:59:41-03:00",
    "2026-09-22T00:00:00-03:00",
  ]) {
    const inspected = inspectTrivyReport(makeAcceptedReport(), {
      ...acceptedImageOptions,
      evaluatedAt,
    });
    assert.equal(inspected.acceptedRiskFindingCount, 0);
    assert.equal(inspected.blockingFindingCount, 1);
    assert.equal(inspected.approved, false);
  }
});

test("rejeita config sem Dockerfile, resumo real ou classe misconfig", () => {
  for (const mutate of [
    (report) => (report.Results[0].Type = "terraform"),
    (report) => (report.Results[0].Class = "secret"),
    (report) => delete report.Results[0].MisconfSummary,
    (report) =>
      (report.Results[0].MisconfSummary = { Successes: 0, Failures: 0 }),
    (report) => (report.ArtifactName = "./outro"),
    (report) => (report.ArtifactType = "filesystem"),
    (report) => (report.Metadata.Commit = "0".repeat(40)),
  ]) {
    const report = configReport();
    mutate(report);
    assert.throws(() => validateTrivyReport(report, configOptions));
  }
});

test("rejeita qualquer configuracao encontrada e mistura de scanners", () => {
  const finding = configReport();
  finding.Results[0].Misconfigurations = [{ Severity: "LOW" }];
  assert.throws(
    () => validateTrivyReport(finding, configOptions),
    /configuracao bloqueadora/u,
  );

  const mixedImage = imageReport();
  mixedImage.Results[0].Secrets = [];
  assert.throws(
    () => validateTrivyReport(mixedImage, imageOptions),
    /campos desconhecidos/u,
  );
});

test("mantem a versao e revisao pinadas no contrato", () => {
  assert.equal(TRIVY_REPORT_CONTRACT.trivyVersion, "0.70.0");
  assert.equal(
    TRIVY_REPORT_CONTRACT.actionRevision,
    "ed142fd0673e97e23eac54620cfb913e5ce36c25",
  );
  assert.equal(
    TRIVY_TEMPORARY_RISK_ACCEPTANCE.expiresAt,
    "2026-09-21T23:59:59-03:00",
  );
});
