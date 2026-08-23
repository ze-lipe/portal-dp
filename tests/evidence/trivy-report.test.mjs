import assert from "node:assert/strict";
import test from "node:test";

import {
  TRIVY_REPORT_CONTRACT,
  inspectTrivyReport,
  validateTrivyReport,
} from "../../scripts/trivy-report-contract.mjs";

const imageName = `portal-dp:${"a".repeat(40)}`;
const imageId = `sha256:${"b".repeat(64)}`;
const artifactId = `sha256:${"c".repeat(64)}`;
const layerId = `sha256:${"d".repeat(64)}`;
const configCommit = "e".repeat(40);

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
      OS: { Family: "debian", Name: "13" },
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

test("rejeita qualquer vulnerabilidade e achado malformado", () => {
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
});
