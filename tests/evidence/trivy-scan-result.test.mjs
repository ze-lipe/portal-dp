import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  access,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";

import {
  createProhibitedDataInspection,
  inspectProhibitedData,
} from "../../scripts/prohibited-data-content-scan.mjs";
import { validateTrivyScanSummary } from "../../scripts/trivy-report-contract.mjs";

const repositoryRoot = resolve(import.meta.dirname, "../..");
const script = resolve(repositoryRoot, "scripts/write-trivy-scan-result.mjs");
const revision = "a".repeat(40);
const imageReference = `portal-dp:${revision}`;
const imageId = `sha256:${"b".repeat(64)}`;
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
// Montados em tempo de execucao para que a massa valide a remocao desses
// metadados sem transformar o proprio teste em evidencia proibida.
const personalAuthorEmail = ["pessoa", "empresa.com.br"].join("@");
const publicNoReplyEmail = ["noreply", "github.com"].join("@");

function validOciBuildEvidence() {
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

test("workflow entrega a prova OCI ao classificador Trivy", async () => {
  const workflow = await readFile(
    resolve(repositoryRoot, ".github/workflows/ci.yml"),
    "utf8",
  );
  assert.match(
    workflow,
    /TRIVY_SCAN_OCI_BUILD_LINK_PATH:\s*evidencias\/resultados\/oci-build-link\.json/u,
  );
});

test("build inclui o workflow somente na etapa de validacao", async () => {
  const dockerfile = await readFile(
    resolve(repositoryRoot, "Dockerfile"),
    "utf8",
  );
  const workflowCopy =
    "COPY .github/workflows/ci.yml ./.github/workflows/ci.yml";
  const productionStage = " AS production-dependencies";

  assert.equal(dockerfile.split(workflowCopy).length - 1, 1);
  assert.equal(
    dockerfile.indexOf(workflowCopy) < dockerfile.indexOf(productionStage),
    true,
  );
});

test("contexto Docker libera somente o workflow necessario", async (context) => {
  // O Docker usa .dockerignore para formar o contexto, mas nao o disponibiliza
  // dentro do build. A ausencia so e aceita na validacao interna explicitamente
  // marcada; no checkout normal, o arquivo continua obrigatorio e auditado.
  let dockerIgnore;
  try {
    dockerIgnore = await readFile(
      resolve(repositoryRoot, ".dockerignore"),
      "utf8",
    );
  } catch (error) {
    assert.equal(error?.code, "ENOENT");
    assert.equal(process.env.PORTAL_DP_IMAGE_BUILD_VALIDATION, "1");
    context.skip(".dockerignore nao e copiavel para a etapa interna do build");
    return;
  }

  const ignoreLines = dockerIgnore.split(/\r?\n/u);
  assert.deepEqual(
    ignoreLines.filter((line) => line.includes(".github")),
    [
      ".github/*",
      "!.github/workflows/",
      ".github/workflows/*",
      "!.github/workflows/ci.yml",
    ],
  );
});

function imageReport(vulnerabilities = []) {
  return {
    SchemaVersion: 2,
    Trivy: { Version: "0.70.0" },
    ReportID: "019c0000-0000-7000-8000-000000000001",
    CreatedAt: "2026-08-22T10:11:12Z",
    ArtifactID: `sha256:${"c".repeat(64)}`,
    ArtifactName: imageReference,
    ArtifactType: "container_image",
    Metadata: {
      ImageID: imageId,
      DiffIDs: [`sha256:${"d".repeat(64)}`],
      RepoTags: [imageReference],
      Reference: imageReference,
    },
    Results: [
      {
        Target: "portal-dp (debian 13)",
        Class: "os-pkgs",
        Type: "debian",
        Packages: [{ Name: "base-files", Version: "13.8" }],
        ...(vulnerabilities.length > 0
          ? { Vulnerabilities: vulnerabilities }
          : {}),
      },
    ],
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

function acceptedImageReport() {
  const report = imageReport([acceptedVulnerability()]);
  report.CreatedAt = acceptedEvaluationTime;
  report.Metadata.OS = { Family: "debian", Name: "13.6" };
  report.Metadata.DiffIDs = [affectedLayer.DiffID];
  Object.assign(report.Results[0].Packages[0], {
    ID: "libssl3t64@3.5.6-1~deb13u2",
    Name: "libssl3t64",
    Version: "3.5.6",
    Release: "1~deb13u2",
    Arch: "amd64",
    Identifier: {
      PURL: `pkg:deb/debian/libssl3t64@${["12345678", "000195"].join("")}`,
      UID: packageUid,
    },
    Layer: { ...affectedLayer },
    Maintainer: `Debian Maintainer <${["maintainer", "debian.org"].join("@")}>`,
  });
  report.Metadata.ImageConfig = {
    config: {
      Labels: {
        "org.opencontainers.image.base.name": acceptedBaseReference,
      },
    },
  };
  return report;
}

function configReport(misconfigurations = []) {
  return {
    SchemaVersion: 2,
    Trivy: { Version: "0.70.0" },
    ReportID: "019c0000-0000-7000-8000-000000000002",
    CreatedAt: "2026-08-22T10:11:13Z",
    ArtifactID: `sha256:${"e".repeat(64)}`,
    ArtifactName: ".",
    ArtifactType: "repository",
    Metadata: {
      RepoURL: "https://github.com/example/portal-dp",
      Commit: revision,
      Author: `Pessoa <${personalAuthorEmail}>`,
      Committer: `GitHub <${publicNoReplyEmail}>`,
      CommitMsg: "Mensagem livre que nao deve ser publicada",
    },
    Results: [
      {
        Target: "Dockerfile",
        Class: "config",
        Type: "dockerfile",
        MisconfSummary: {
          Successes: 31,
          Failures: misconfigurations.length,
        },
        ...(misconfigurations.length > 0
          ? { Misconfigurations: misconfigurations }
          : {}),
      },
    ],
  };
}

async function runScenario({
  image = imageReport(),
  config = configReport(),
  ociEvidence = validOciBuildEvidence(),
  imageStepOutcome = "success",
  configStepOutcome = "success",
  expectedImageId = imageId,
  precreateApprovedImage = false,
} = {}) {
  const directory = await mkdtemp(join(tmpdir(), "portal-dp-trivy-result-"));
  const rawImage = join(directory, "raw-image.json");
  const rawConfig = join(directory, "raw-config.json");
  const ociBuildLink = join(directory, "oci-build-link.json");
  const summaryPath = join(directory, "summary.json");
  const approvedImage = join(directory, "approved", "trivy-image.json");
  const approvedConfig = join(directory, "approved", "trivy-config.json");
  const githubOutput = join(directory, "github-output.txt");
  if (image !== undefined) {
    await writeFile(rawImage, JSON.stringify(image), "utf8");
  }
  if (config !== undefined) {
    await writeFile(rawConfig, JSON.stringify(config), "utf8");
  }
  if (ociEvidence !== null) {
    await writeFile(ociBuildLink, JSON.stringify(ociEvidence), "utf8");
  }
  if (precreateApprovedImage) {
    await mkdir(join(directory, "approved"), { recursive: true });
    await writeFile(approvedImage, "bloqueio sintetico", "utf8");
  }
  const execution = spawnSync(process.execPath, [script], {
    cwd: repositoryRoot,
    encoding: "utf8",
    env: {
      ...process.env,
      TRIVY_SCAN_IMAGE_REPORT_PATH: rawImage,
      TRIVY_SCAN_CONFIG_REPORT_PATH: rawConfig,
      TRIVY_SCAN_EXPECTED_IMAGE: imageReference,
      TRIVY_SCAN_EXPECTED_IMAGE_ID: expectedImageId,
      TRIVY_SCAN_EXPECTED_CONFIG_COMMIT: revision,
      TRIVY_SCAN_OCI_BUILD_LINK_PATH: ociBuildLink,
      TRIVY_SCAN_IMAGE_STEP_OUTCOME: imageStepOutcome,
      TRIVY_SCAN_CONFIG_STEP_OUTCOME: configStepOutcome,
      TRIVY_SCAN_OUTPUT_PATH: summaryPath,
      TRIVY_SCAN_APPROVED_IMAGE_PATH: approvedImage,
      TRIVY_SCAN_APPROVED_CONFIG_PATH: approvedConfig,
      GITHUB_OUTPUT: githubOutput,
    },
  });
  assert.equal(execution.status, 0, execution.stderr);
  await assert.rejects(access(rawImage));
  await assert.rejects(access(rawConfig));
  const serialized = await readFile(summaryPath, "utf8");
  return {
    directory,
    execution,
    summary: JSON.parse(serialized),
    serialized,
    approvedImage,
    approvedConfig,
  };
}

test("publica somente o par aprovado e remove metadados pessoais do config", async () => {
  const scenario = await runScenario();
  try {
    assert.equal(scenario.summary.passed, true);
    assert.equal(scenario.summary.ociBuildEvidenceValid, true);
    assert.equal(scenario.summary.reportPublicationStatus, "published");
    assert.equal(scenario.summary.rawReportsPublished, true);
    assert.deepEqual(
      validateTrivyScanSummary(scenario.summary, {
        expectedImageReference: imageReference,
        expectedImageId: imageId,
        expectedConfigCommit: revision,
        requireApproved: true,
      }),
      { allStructured: true, approved: true, outcome: "success" },
    );
    const config = JSON.parse(await readFile(scenario.approvedConfig, "utf8"));
    for (const field of ["Author", "Committer", "CommitMsg"]) {
      assert.equal(Object.hasOwn(config.Metadata, field), false);
    }
    for (const sensitive of [
      personalAuthorEmail,
      publicNoReplyEmail,
      "Mensagem livre que nao deve ser publicada",
    ]) {
      assert.equal(scenario.serialized.includes(sensitive), false);
      assert.equal(JSON.stringify(config).includes(sensitive), false);
    }
    await access(scenario.approvedImage);
  } finally {
    await rm(scenario.directory, { recursive: true, force: true });
  }
});

test("preserva resumo estrutural de achado sem publicar relatorios brutos", async () => {
  const scenario = await runScenario({
    image: imageReport([{ VulnerabilityID: "CVE-TEST", Severity: "HIGH" }]),
    imageStepOutcome: "failure",
  });
  try {
    assert.equal(scenario.summary.outcome, "findings");
    assert.equal(scenario.summary.reports.image.structurallyValid, true);
    assert.equal(scenario.summary.reports.image.findingCount, 1);
    assert.equal(scenario.summary.passed, false);
    assert.equal(scenario.summary.rawReportsPublished, false);
    await assert.rejects(access(scenario.approvedImage));
    await assert.rejects(access(scenario.approvedConfig));
    assert.deepEqual(validateTrivyScanSummary(scenario.summary), {
      allStructured: true,
      approved: false,
      outcome: "findings",
    });
  } finally {
    await rm(scenario.directory, { recursive: true, force: true });
  }
});

test("publica o achado bruto quando a unica CVE possui risco aceito", async () => {
  const nativeImage = acceptedImageReport();
  const nativeInspection = createProhibitedDataInspection();
  inspectProhibitedData(
    Buffer.from(JSON.stringify(nativeImage), "utf8"),
    "trivy-image.json",
    nativeInspection,
  );
  assert.ok(nativeInspection.findingCount >= 2);
  const scenario = await runScenario({
    image: nativeImage,
    imageStepOutcome: "failure",
  });
  try {
    assert.equal(scenario.summary.schemaVersion, 2);
    assert.equal(scenario.summary.evaluatedAt, acceptedEvaluationTime);
    assert.equal(scenario.summary.outcome, "success_with_accepted_risk");
    assert.equal(
      scenario.summary.conclusion,
      "APROVADA_COM_RISCO_TEMPORARIO_ACEITO",
    );
    assert.equal(scenario.summary.passed, true);
    assert.equal(scenario.summary.rawReportsPublished, true);
    assert.equal(scenario.summary.rawFindingReportsRetained, true);
    assert.equal(scenario.summary.reports.image.findingCount, 1);
    assert.equal(scenario.summary.reports.image.acceptedRiskFindingCount, 1);
    assert.equal(scenario.summary.reports.image.blockingFindingCount, 0);
    assert.equal(scenario.summary.reports.image.packageMetadataSanitized, true);
    assert.equal(
      scenario.summary.riskAcceptance.id,
      "RA-TRIVY-CVE-2026-14456-001",
    );
    const publishedImage = JSON.parse(
      await readFile(scenario.approvedImage, "utf8"),
    );
    assert.equal(
      publishedImage.Results[0].Vulnerabilities[0].VulnerabilityID,
      "CVE-2026-14456",
    );
    const retainedPackage = publishedImage.Results[0].Packages[0];
    assert.equal(Object.hasOwn(retainedPackage, "Maintainer"), false);
    assert.equal(Object.hasOwn(retainedPackage.Identifier, "PURL"), false);
    assert.equal(retainedPackage.Identifier.UID, packageUid);
    assert.equal(retainedPackage.ID, "libssl3t64@3.5.6-1~deb13u2");
    assert.equal(retainedPackage.Name, "libssl3t64");
    assert.equal(retainedPackage.Version, "3.5.6");
    assert.equal(retainedPackage.Release, "1~deb13u2");
    const retainedInspection = createProhibitedDataInspection();
    inspectProhibitedData(
      Buffer.from(JSON.stringify(publishedImage), "utf8"),
      "trivy-image.json",
      retainedInspection,
    );
    assert.equal(retainedInspection.findingCount, 0);
    await access(scenario.approvedConfig);
    assert.deepEqual(
      validateTrivyScanSummary(scenario.summary, {
        expectedImageReference: imageReference,
        expectedImageId: imageId,
        expectedConfigCommit: revision,
        requireApproved: true,
      }),
      {
        allStructured: true,
        approved: true,
        outcome: "success_with_accepted_risk",
      },
    );
  } finally {
    await rm(scenario.directory, { recursive: true, force: true });
  }
});

test("falha fechada sem prova OCI schema 4 exata e nao aceita a CVE", async () => {
  const invalidProofs = [
    null,
    { ...validOciBuildEvidence(), schemaVersion: 3 },
    {
      ...validOciBuildEvidence(),
      runtimeBase: acceptedBaseReference.replace(/.$/u, "0"),
    },
    {
      ...validOciBuildEvidence(),
      provenanceDependencyLinked: false,
    },
    {
      ...validOciBuildEvidence(),
      localImageId: `sha256:${"0".repeat(64)}`,
    },
  ];
  for (const ociEvidence of invalidProofs) {
    const scenario = await runScenario({
      image: acceptedImageReport(),
      ociEvidence,
      imageStepOutcome: "failure",
    });
    try {
      assert.equal(scenario.summary.outcome, "operational_failure");
      assert.equal(
        scenario.summary.failureCode,
        "MISSING_OR_INVALID_OCI_BUILD_LINK",
      );
      assert.equal(scenario.summary.passed, false);
      assert.equal(scenario.summary.ociBuildEvidenceValid, false);
      assert.equal(scenario.summary.reportPublicationStatus, "not_attempted");
      assert.equal(scenario.summary.reports.image.acceptedRiskFindingCount, 0);
      assert.equal(scenario.summary.reports.image.blockingFindingCount, 1);
      assert.equal(scenario.summary.riskAcceptance, null);
      assert.equal(scenario.summary.rawReportsPublished, false);
      await assert.rejects(access(scenario.approvedImage));
      await assert.rejects(access(scenario.approvedConfig));
    } finally {
      await rm(scenario.directory, { recursive: true, force: true });
    }
  }
});

test("preserva falha operacional para scans limpos sem prova OCI", async () => {
  const scenario = await runScenario({ ociEvidence: null });
  try {
    assert.equal(scenario.summary.reports.image.approved, true);
    assert.equal(scenario.summary.reports.config.approved, true);
    assert.equal(scenario.summary.ociBuildEvidenceValid, false);
    assert.equal(scenario.summary.reportPublicationStatus, "not_attempted");
    assert.equal(scenario.summary.outcome, "operational_failure");
    assert.equal(
      scenario.summary.failureCode,
      "MISSING_OR_INVALID_OCI_BUILD_LINK",
    );
    assert.equal(scenario.summary.passed, false);
    assert.equal(scenario.summary.rawReportsPublished, false);
    assert.deepEqual(validateTrivyScanSummary(scenario.summary), {
      allStructured: true,
      approved: false,
      outcome: "operational_failure",
    });
  } finally {
    await rm(scenario.directory, { recursive: true, force: true });
  }
});

test("preserva falha operacional quando o par aprovado nao e publicado", async () => {
  const scenario = await runScenario({ precreateApprovedImage: true });
  try {
    assert.equal(scenario.summary.reports.image.approved, true);
    assert.equal(scenario.summary.reports.config.approved, true);
    assert.equal(scenario.summary.ociBuildEvidenceValid, true);
    assert.equal(scenario.summary.reportPublicationStatus, "failed");
    assert.equal(scenario.summary.outcome, "operational_failure");
    assert.equal(
      scenario.summary.failureCode,
      "APPROVED_REPORT_PUBLICATION_FAILURE",
    );
    assert.equal(scenario.summary.passed, false);
    assert.equal(scenario.summary.rawReportsPublished, false);
    await assert.rejects(access(scenario.approvedImage));
    await assert.rejects(access(scenario.approvedConfig));
    assert.deepEqual(validateTrivyScanSummary(scenario.summary), {
      allStructured: true,
      approved: false,
      outcome: "operational_failure",
    });
  } finally {
    await rm(scenario.directory, { recursive: true, force: true });
  }
});

test("bloqueia CVE divergente, duplicada ou com correcao disponivel", async () => {
  const scenarios = [];
  const divergent = acceptedImageReport();
  divergent.Results[0].Vulnerabilities[0].PkgName = "libssl-outro";
  scenarios.push(divergent);
  const duplicated = acceptedImageReport();
  duplicated.Results[0].Vulnerabilities.push(acceptedVulnerability());
  scenarios.push(duplicated);
  const fixed = acceptedImageReport();
  fixed.Results[0].Vulnerabilities[0].FixedVersion = "3.5.7-1";
  scenarios.push(fixed);
  for (const image of scenarios) {
    const scenario = await runScenario({
      image,
      imageStepOutcome: "failure",
    });
    try {
      assert.equal(scenario.summary.outcome, "findings");
      assert.equal(scenario.summary.passed, false);
      assert.equal(scenario.summary.reports.image.acceptedRiskFindingCount, 0);
      assert.equal(scenario.summary.rawReportsPublished, false);
      assert.equal(scenario.summary.riskAcceptance, null);
      await assert.rejects(access(scenario.approvedImage));
    } finally {
      await rm(scenario.directory, { recursive: true, force: true });
    }
  }
});

test("rejeita resumo adulterado e preserva verificacao historica", async () => {
  const scenario = await runScenario({
    image: acceptedImageReport(),
    imageStepOutcome: "failure",
  });
  try {
    // A verificacao usa evaluatedAt preservado, portanto continua valida mesmo
    // quando executada posteriormente ao fim da excecao.
    assert.equal(
      validateTrivyScanSummary(scenario.summary, { requireApproved: true })
        .approved,
      true,
    );
    for (const mutate of [
      (summary) => (summary.reports.image.findingCount = 0),
      (summary) => (summary.reports.image.blockingFindingCount = 1),
      (summary) => (summary.reports.image.packageMetadataSanitized = false),
      (summary) =>
        (summary.riskAcceptance.baseImage.digest = `sha256:${"0".repeat(64)}`),
      (summary) => (summary.evaluatedAt = "2026-09-22T00:00:00-03:00"),
    ]) {
      const copy = structuredClone(scenario.summary);
      mutate(copy);
      assert.throws(() =>
        validateTrivyScanSummary(copy, { requireApproved: true }),
      );
    }
  } finally {
    await rm(scenario.directory, { recursive: true, force: true });
  }
});

test("falha fechada para versao, ImageID ou resultado do passo incoerente", async () => {
  const cases = [
    { image: { ...imageReport(), Trivy: { Version: "0.69.3" } } },
    { expectedImageId: `sha256:${"f".repeat(64)}` },
    { expectedImageId: "" },
    { imageStepOutcome: "failure" },
    { image: acceptedImageReport(), imageStepOutcome: "success" },
  ];
  for (const item of cases) {
    const scenario = await runScenario(item);
    try {
      assert.equal(scenario.summary.outcome, "operational_failure");
      assert.equal(scenario.summary.passed, false);
      assert.equal(scenario.summary.rawReportsPublished, false);
      await assert.rejects(access(scenario.approvedImage));
      await assert.rejects(access(scenario.approvedConfig));
    } finally {
      await rm(scenario.directory, { recursive: true, force: true });
    }
  }
});
