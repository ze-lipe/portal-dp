const scopes = new Set(["image", "config"]);
const stepOutcomes = new Set(["success", "failure", "cancelled", "skipped"]);
const summaryOutcomes = new Set([
  "success",
  "success_with_accepted_risk",
  "findings",
  "operational_failure",
]);
const digestPattern = /^sha256:[a-f0-9]{64}$/u;
const uuidV7Pattern =
  /^[a-f0-9]{8}-[a-f0-9]{4}-7[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/u;
const rfc3339Pattern =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/u;

export const TRIVY_REPORT_CONTRACT = Object.freeze({
  schemaVersion: 2,
  trivyVersion: "0.70.0",
  actionRevision: "ed142fd0673e97e23eac54620cfb913e5ce36c25",
  imageArtifactType: "container_image",
  configArtifactType: "repository",
  imageResultClasses: Object.freeze(["os-pkgs", "lang-pkgs"]),
  configResultClass: "config",
  requiredConfigType: "dockerfile",
});

const acceptedBaseImageName = "gcr.io/distroless/nodejs24-debian13:nonroot";
const acceptedBaseImageDigest =
  "sha256:ffab599740d4aaa66029d02b9e6d3de4f622fefb7410081c5ef69c86430f364d";
const acceptedDockerfileFrontend =
  "docker/dockerfile:1.7.1@sha256:a57df69d0ea827fb7266491f2813635de6f17269be881f696fbfdf2d83dda33e";

/**
 * Excecao de risco temporaria, imutavel e deliberadamente estreita. Ela nao
 * altera a configuracao do Trivy: o scanner continua falhando e exibindo o
 * achado; somente a classificacao posterior pode aprovar esta ocorrencia.
 */
export const TRIVY_TEMPORARY_RISK_ACCEPTANCE = Object.freeze({
  id: "RA-TRIVY-CVE-2026-14456-001",
  vulnerabilityId: "CVE-2026-14456",
  packageName: "libssl3t64",
  installedVersion: "3.5.6-1~deb13u2",
  inventoryVersion: "3.5.6",
  inventoryRelease: "1~deb13u2",
  inventoryArchitecture: "amd64",
  affectedLayer: Object.freeze({
    digest:
      "sha256:cf397222899a3b6b98c35941fd44d79f8ff61303349b3bece21b49dacc1ac106",
    diffId:
      "sha256:80bb2aedf42cbf9911cb9073be23406c0e7f799f8083bf13a1cd2d460a25e383",
  }),
  severity: "HIGH",
  status: "fix_deferred",
  resultClass: "os-pkgs",
  targetType: "debian",
  maximumOccurrences: 1,
  fixedVersionPolicy: "ABSENT_NULL_OR_EMPTY",
  baseImage: Object.freeze({
    name: acceptedBaseImageName,
    digest: acceptedBaseImageDigest,
    reference: `${acceptedBaseImageName}@${acceptedBaseImageDigest}`,
  }),
  approvalDate: "2026-08-23",
  approvedAt: "2026-08-23T00:59:42-03:00",
  validFrom: "2026-08-23T00:59:42-03:00",
  expiresAt: "2026-09-21T23:59:59-03:00",
  approvedBy: Object.freeze({
    name: "Jose Felipe Leite Marques",
    role: "Desenvolvedor",
  }),
  justification:
    "A aplicacao Nest/Node utiliza HTTP e nao instancia servidor ou listener OpenSSL QUIC; a vulnerabilidade exige o processamento de pacotes QUIC Initial por esse listener.",
});

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function assertObject(value, message) {
  if (!isObject(value)) throw new Error(message);
}

function assertExactKeys(value, allowedKeys, label) {
  const unexpected = Object.keys(value).filter(
    (key) => !allowedKeys.includes(key),
  );
  if (unexpected.length > 0) {
    throw new Error(
      `${label} possui campos desconhecidos: ${unexpected.sort().join(", ")}`,
    );
  }
}

function assertNonEmptyString(value, message) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(message);
  }
}

function assertDigest(value, message) {
  if (typeof value !== "string" || !digestPattern.test(value)) {
    throw new Error(message);
  }
}

function assertTimestamp(value, message) {
  if (
    typeof value !== "string" ||
    !rfc3339Pattern.test(value) ||
    !Number.isFinite(Date.parse(value))
  ) {
    throw new Error(message);
  }
}

function isWithinTemporaryAcceptanceWindow(evaluatedAt) {
  const instant = Date.parse(evaluatedAt);
  return (
    instant >= Date.parse(TRIVY_TEMPORARY_RISK_ACCEPTANCE.validFrom) &&
    instant <= Date.parse(TRIVY_TEMPORARY_RISK_ACCEPTANCE.expiresAt)
  );
}

export function temporaryRiskAcceptanceEvidence() {
  const policy = TRIVY_TEMPORARY_RISK_ACCEPTANCE;
  return {
    id: policy.id,
    vulnerabilityId: policy.vulnerabilityId,
    packageName: policy.packageName,
    installedVersion: policy.installedVersion,
    inventoryVersion: policy.inventoryVersion,
    inventoryRelease: policy.inventoryRelease,
    inventoryArchitecture: policy.inventoryArchitecture,
    affectedLayer: { ...policy.affectedLayer },
    severity: policy.severity,
    status: policy.status,
    resultClass: policy.resultClass,
    targetType: policy.targetType,
    maximumOccurrences: policy.maximumOccurrences,
    fixedVersionPolicy: policy.fixedVersionPolicy,
    baseImage: { ...policy.baseImage },
    approvalDate: policy.approvalDate,
    approvedAt: policy.approvedAt,
    validFrom: policy.validFrom,
    expiresAt: policy.expiresAt,
    approvedBy: { ...policy.approvedBy },
    justification: policy.justification,
    observedOccurrenceCount: 1,
  };
}

/**
 * Valida a prova minima produzida pelo build OCI antes de permitir que uma
 * finding seja enquadrada na excecao temporaria. A igualdade do localImageId
 * vincula essa prova ao mesmo ImageID efetivamente examinado pelo Trivy.
 */
export function validateTrivyOciBuildEvidence(
  evidence,
  { expectedImageId } = {},
) {
  assertObject(evidence, "a prova OCI do Trivy deve ser um objeto JSON");
  assertDigest(
    expectedImageId,
    "a prova OCI do Trivy exige um ImageID esperado valido",
  );
  if (
    evidence.schemaVersion !== 4 ||
    evidence.builder !== "docker/build-push-action"
  ) {
    throw new Error("a prova OCI do Trivy nao usa o schema 4 esperado");
  }
  for (const [field, message] of [
    ["buildDigest", "buildDigest OCI invalido"],
    ["ociImageManifestDigest", "manifesto OCI invalido"],
    ["runtimeManifestDigest", "manifesto runtime invalido"],
    ["localImageId", "ImageID local OCI invalido"],
  ]) {
    assertDigest(evidence[field], message);
  }
  if (evidence.localImageId !== expectedImageId) {
    throw new Error("a prova OCI nao corresponde ao ImageID examinado");
  }
  if (
    evidence.runtimeBase !==
      TRIVY_TEMPORARY_RISK_ACCEPTANCE.baseImage.reference ||
    evidence.dockerfileFrontend !== acceptedDockerfileFrontend ||
    evidence.dockerfileSourceLinked !== true ||
    evidence.dockerfileFrontendLinked !== true ||
    evidence.provenanceDependencyLinked !== true ||
    evidence.runtimeBaseLabelLinked !== true
  ) {
    throw new Error("a prova OCI nao comprova a base e o Dockerfile esperados");
  }
  if (
    typeof evidence.dockerfileSha256 !== "string" ||
    !/^[a-f0-9]{64}$/u.test(evidence.dockerfileSha256) ||
    typeof evidence.ociArchiveSha256 !== "string" ||
    !/^[a-f0-9]{64}$/u.test(evidence.ociArchiveSha256)
  ) {
    throw new Error("a prova OCI possui hash de origem invalido");
  }

  assertObject(evidence.metadata, "a prova OCI nao possui metadata vinculada");
  if (
    evidence.metadata.containerImageDigest !== evidence.buildDigest ||
    evidence.metadata.containerImageConfigDigest !== evidence.localImageId ||
    evidence.metadata.ociImageManifestDigest !==
      evidence.ociImageManifestDigest ||
    evidence.metadata.runtimeManifestDigest !== evidence.runtimeManifestDigest
  ) {
    throw new Error("a prova OCI possui metadata divergente");
  }

  assertObject(evidence.ociIndex, "a prova OCI nao possui indice vinculado");
  assertDigest(evidence.ociIndex.digest, "o indice da prova OCI e invalido");
  if (
    !Number.isSafeInteger(evidence.ociIndex.manifestCount) ||
    evidence.ociIndex.manifestCount < 1 ||
    !Number.isSafeInteger(evidence.ociIndex.attestationDescriptorCount) ||
    evidence.ociIndex.attestationDescriptorCount < 1 ||
    !Number.isSafeInteger(evidence.ociIndex.imageLayerCount) ||
    evidence.ociIndex.imageLayerCount < 1 ||
    evidence.ociIndex.allImageLayerBlobsVerified !== true ||
    evidence.ociIndex.buildDigestLinked !== true ||
    evidence.ociIndex.ociImageManifestLinked !== true ||
    evidence.ociIndex.runtimeConfigLinked !== true ||
    evidence.ociIndex.configDigestLinked !== true ||
    !["INDEX_ROOT", "DESCRIPTOR_GRAPH"].includes(evidence.ociIndex.linkage)
  ) {
    throw new Error("a prova OCI nao comprova o grafo da imagem");
  }
  assertObject(
    evidence.ociIndex.attestations,
    "a prova OCI nao possui attestations vinculadas",
  );
  if (
    evidence.ociIndex.attestations.referenceLinked !== true ||
    evidence.ociIndex.attestations.provenanceLinked !== true ||
    evidence.ociIndex.attestations.sbomLinked !== true
  ) {
    throw new Error("a prova OCI nao comprova provenance e SBOM vinculados");
  }
  return {
    schemaVersion: 4,
    imageId: evidence.localImageId,
    runtimeBase: evidence.runtimeBase,
    approved: true,
  };
}

function optionalArray(result, field, label) {
  if (!Object.hasOwn(result, field)) return [];
  if (!Array.isArray(result[field])) {
    throw new Error(`${label} possui ${field} em formato invalido`);
  }
  return result[field];
}

function validateReportEnvelope(report, label, expectedTrivyVersion) {
  assertObject(report, `${label} nao contem um objeto JSON valido`);
  assertExactKeys(
    report,
    [
      "SchemaVersion",
      "Trivy",
      "ReportID",
      "CreatedAt",
      "ArtifactID",
      "ArtifactName",
      "ArtifactType",
      "Metadata",
      "Results",
    ],
    label,
  );
  if (report.SchemaVersion !== TRIVY_REPORT_CONTRACT.schemaVersion) {
    throw new Error(`${label} possui SchemaVersion incompativel`);
  }
  assertObject(report.Trivy, `${label} nao identifica a versao do Trivy`);
  assertExactKeys(report.Trivy, ["Version"], `${label}.Trivy`);
  if (report.Trivy.Version !== expectedTrivyVersion) {
    throw new Error(
      `${label} foi produzido por uma versao inesperada do Trivy`,
    );
  }
  if (
    typeof report.ReportID !== "string" ||
    !uuidV7Pattern.test(report.ReportID)
  ) {
    throw new Error(`${label} possui ReportID UUIDv7 invalido`);
  }
  if (
    typeof report.CreatedAt !== "string" ||
    !rfc3339Pattern.test(report.CreatedAt) ||
    !Number.isFinite(Date.parse(report.CreatedAt))
  ) {
    throw new Error(`${label} possui CreatedAt invalido`);
  }
  assertNonEmptyString(
    report.ArtifactName,
    `${label} nao identifica o artefato`,
  );
  assertNonEmptyString(report.ArtifactType, `${label} nao identifica o tipo`);
  if (!Array.isArray(report.Results) || report.Results.length === 0) {
    throw new Error(`${label} nao contem cobertura verificavel`);
  }
}

function validateImageMetadata(metadata, label, expectedArtifactName, imageId) {
  assertObject(metadata, `${label} nao contem metadados da imagem`);
  assertExactKeys(
    metadata,
    [
      "Size",
      "OS",
      "ImageID",
      "DiffIDs",
      "RepoTags",
      "RepoDigests",
      "Reference",
      "ImageConfig",
      "Layers",
    ],
    `${label}.Metadata`,
  );
  if (metadata.ImageID !== imageId) {
    throw new Error(`${label} nao corresponde ao ImageID local esperado`);
  }
  if (metadata.Reference !== expectedArtifactName) {
    throw new Error(`${label} nao corresponde a referencia de imagem esperada`);
  }
  if (
    !Array.isArray(metadata.RepoTags) ||
    !metadata.RepoTags.includes(expectedArtifactName) ||
    metadata.RepoTags.some(
      (item) => typeof item !== "string" || item.trim() === "",
    )
  ) {
    throw new Error(`${label} nao vincula a etiqueta local examinada`);
  }
  if (
    !Array.isArray(metadata.DiffIDs) ||
    metadata.DiffIDs.length === 0 ||
    metadata.DiffIDs.some((item) => !digestPattern.test(String(item)))
  ) {
    throw new Error(`${label} nao comprova as camadas da imagem examinada`);
  }
  if (
    Object.hasOwn(metadata, "Size") &&
    (!Number.isSafeInteger(metadata.Size) || metadata.Size <= 0)
  ) {
    throw new Error(`${label} possui tamanho de imagem invalido`);
  }
  if (Object.hasOwn(metadata, "OS") && !isObject(metadata.OS)) {
    throw new Error(
      `${label} possui metadados de sistema operacional invalidos`,
    );
  }
  if (
    Object.hasOwn(metadata, "RepoDigests") &&
    (!Array.isArray(metadata.RepoDigests) ||
      metadata.RepoDigests.some(
        (item) => typeof item !== "string" || item.trim() === "",
      ))
  ) {
    throw new Error(`${label} possui RepoDigests invalidos`);
  }
  if (
    Object.hasOwn(metadata, "ImageConfig") &&
    !isObject(metadata.ImageConfig)
  ) {
    throw new Error(`${label} possui ImageConfig invalido`);
  }
  if (Object.hasOwn(metadata, "Layers") && !Array.isArray(metadata.Layers)) {
    throw new Error(`${label} possui Layers invalido`);
  }
}

function validateImageResults(report, label, requireSanitizedPackageMetadata) {
  let coverage = 0;
  let packageCount = 0;
  let findingCount = 0;
  const findings = [];
  let packageMetadataSanitized = true;
  for (const result of report.Results) {
    assertObject(result, `${label} possui resultado invalido`);
    assertExactKeys(
      result,
      ["Target", "Class", "Type", "Vulnerabilities", "Packages"],
      `${label}.Results`,
    );
    assertNonEmptyString(result.Target, `${label} possui alvo invalido`);
    assertNonEmptyString(result.Type, `${label} possui tipo de alvo invalido`);
    if (!TRIVY_REPORT_CONTRACT.imageResultClasses.includes(result.Class)) {
      throw new Error(`${label} possui classe fora do scanner vuln`);
    }
    coverage += 1;
    const packages = optionalArray(result, "Packages", label);
    if (packages.some((item) => !isObject(item))) {
      throw new Error(`${label} possui inventario de pacotes malformado`);
    }
    for (const packageEntry of packages) {
      if (Object.hasOwn(packageEntry, "Maintainer")) {
        packageMetadataSanitized = false;
      }
      if (Object.hasOwn(packageEntry, "Identifier")) {
        if (!isObject(packageEntry.Identifier)) {
          if (requireSanitizedPackageMetadata) {
            throw new Error(`${label} possui Identifier de pacote malformado`);
          }
        } else if (Object.hasOwn(packageEntry.Identifier, "PURL")) {
          packageMetadataSanitized = false;
        }
      }
    }
    packageCount += packages.length;
    const vulnerabilities = optionalArray(result, "Vulnerabilities", label);
    if (vulnerabilities.some((item) => !isObject(item))) {
      throw new Error(`${label} possui achado de vulnerabilidade malformado`);
    }
    findingCount += vulnerabilities.length;
    findings.push(
      ...vulnerabilities.map((finding) => ({
        finding,
        packages,
        resultClass: result.Class,
        targetType: result.Type,
      })),
    );
  }
  if (coverage === 0 || packageCount === 0) {
    throw new Error(
      `${label} nao comprova inventario e cobertura do scanner vuln`,
    );
  }
  if (requireSanitizedPackageMetadata && !packageMetadataSanitized) {
    throw new Error(
      `${label} ainda contem Maintainer ou Identifier.PURL de pacote`,
    );
  }
  return {
    targetCount: coverage,
    packageCount,
    findingCount,
    findings,
    packageMetadataSanitized,
  };
}

function imageBaseReference(metadata) {
  const labels = metadata?.ImageConfig?.config?.Labels;
  if (!isObject(labels)) return null;
  const value = labels["org.opencontainers.image.base.name"];
  return typeof value === "string" ? value : null;
}

function hasAllowedFixedVersion(finding) {
  return (
    !Object.hasOwn(finding, "FixedVersion") ||
    finding.FixedVersion === null ||
    finding.FixedVersion === ""
  );
}

function hasExactAffectedPackage(candidate, policy) {
  const expectedId = `${policy.packageName}@${policy.installedVersion}`;
  const matches = candidate.packages.filter(
    (packageEntry) =>
      packageEntry.Name === policy.packageName &&
      packageEntry.Version === policy.inventoryVersion &&
      packageEntry.Release === policy.inventoryRelease &&
      packageEntry.Arch === policy.inventoryArchitecture &&
      packageEntry.ID === expectedId &&
      packageEntry.Layer?.Digest === policy.affectedLayer.digest &&
      packageEntry.Layer?.DiffID === policy.affectedLayer.diffId,
  );
  const [packageEntry] = matches;
  const findingUid = candidate.finding?.PkgIdentifier?.UID;
  return (
    matches.length === 1 &&
    typeof findingUid === "string" &&
    findingUid !== "" &&
    packageEntry?.Identifier?.UID === findingUid &&
    candidate.finding?.Layer?.Digest === policy.affectedLayer.digest &&
    candidate.finding?.Layer?.DiffID === policy.affectedLayer.diffId
  );
}

function hasExpectedOciBuildEvidence(evidence, expectedImageId) {
  try {
    validateTrivyOciBuildEvidence(evidence, { expectedImageId });
    return true;
  } catch {
    return false;
  }
}

function classifyTemporaryImageRisk(
  report,
  findings,
  evaluatedAt,
  ociBuildEvidence,
  expectedImageId,
) {
  const policy = TRIVY_TEMPORARY_RISK_ACCEPTANCE;
  const [candidate] = findings;
  const eligible =
    findings.length === policy.maximumOccurrences &&
    candidate?.resultClass === policy.resultClass &&
    candidate?.targetType === policy.targetType &&
    candidate?.finding?.VulnerabilityID === policy.vulnerabilityId &&
    candidate?.finding?.PkgID ===
      `${policy.packageName}@${policy.installedVersion}` &&
    candidate?.finding?.PkgName === policy.packageName &&
    candidate?.finding?.InstalledVersion === policy.installedVersion &&
    candidate?.finding?.Severity === policy.severity &&
    candidate?.finding?.Status === policy.status &&
    hasAllowedFixedVersion(candidate?.finding ?? {}) &&
    hasExactAffectedPackage(candidate, policy) &&
    report.Metadata?.OS?.Family === "debian" &&
    typeof report.Metadata?.OS?.Name === "string" &&
    /^13(?:\.|$)/u.test(report.Metadata.OS.Name) &&
    report.Metadata.DiffIDs.filter(
      (diffId) => diffId === policy.affectedLayer.diffId,
    ).length === 1 &&
    imageBaseReference(report.Metadata) === policy.baseImage.reference &&
    hasExpectedOciBuildEvidence(ociBuildEvidence, expectedImageId) &&
    isWithinTemporaryAcceptanceWindow(evaluatedAt);
  return eligible
    ? {
        acceptedRiskFindingCount: 1,
        blockingFindingCount: 0,
        riskAcceptance: temporaryRiskAcceptanceEvidence(),
      }
    : {
        acceptedRiskFindingCount: 0,
        blockingFindingCount: findings.length,
        riskAcceptance: null,
      };
}

function validateMisconfigurationSummary(summary, label) {
  assertObject(summary, `${label} nao comprova a execucao dos controles`);
  assertExactKeys(
    summary,
    ["Successes", "Failures"],
    `${label}.MisconfSummary`,
  );
  for (const field of ["Successes", "Failures"]) {
    if (!Number.isSafeInteger(summary[field]) || summary[field] < 0) {
      throw new Error(`${label} possui ${field} invalido`);
    }
  }
  if (summary.Successes + summary.Failures === 0) {
    throw new Error(
      `${label} nao comprova controles de configuracao executados`,
    );
  }
}

function validateConfigResults(report, label) {
  let coverage = 0;
  let dockerfileCoverage = 0;
  let findingCount = 0;
  for (const result of report.Results) {
    assertObject(result, `${label} possui resultado invalido`);
    assertExactKeys(
      result,
      ["Target", "Class", "Type", "MisconfSummary", "Misconfigurations"],
      `${label}.Results`,
    );
    assertNonEmptyString(result.Target, `${label} possui alvo invalido`);
    assertNonEmptyString(result.Type, `${label} possui tipo de alvo invalido`);
    if (result.Class !== TRIVY_REPORT_CONTRACT.configResultClass) {
      throw new Error(`${label} possui classe fora do scanner misconfig`);
    }
    validateMisconfigurationSummary(result.MisconfSummary, label);
    coverage += 1;
    if (result.Type === TRIVY_REPORT_CONTRACT.requiredConfigType) {
      dockerfileCoverage += 1;
    }
    const misconfigurations = optionalArray(result, "Misconfigurations", label);
    if (misconfigurations.some((item) => !isObject(item))) {
      throw new Error(`${label} possui achado de configuracao malformado`);
    }
    findingCount += misconfigurations.length;
  }
  if (coverage === 0 || dockerfileCoverage === 0) {
    throw new Error(`${label} nao comprova cobertura misconfig do Dockerfile`);
  }
  return { targetCount: coverage, findingCount };
}

/**
 * Valida o JSON nativo do Trivy sem confiar no codigo de saida da action.
 * Os valores esperados fornecidos pelo fluxo vinculam o relatorio ao artefato
 * local efetivamente construido; a validacao posterior preserva esse formato.
 */
export function inspectTrivyReport(
  report,
  {
    label,
    scope,
    expectedArtifactName,
    expectedImageId,
    expectedConfigCommit,
    expectedTrivyVersion = TRIVY_REPORT_CONTRACT.trivyVersion,
    requireSanitizedConfigMetadata = false,
    requireSanitizedPackageMetadata = false,
    evaluatedAt,
    ociBuildEvidence,
  },
) {
  assertNonEmptyString(label, "o relatorio Trivy precisa de um rotulo");
  if (!scopes.has(scope)) {
    throw new Error(`escopo Trivy desconhecido: ${scope}`);
  }
  if (expectedTrivyVersion !== TRIVY_REPORT_CONTRACT.trivyVersion) {
    throw new Error("versao esperada do Trivy diverge do contrato pinado");
  }
  validateReportEnvelope(report, label, expectedTrivyVersion);

  if (scope === "image") {
    const effectiveEvaluationTime = evaluatedAt ?? report.CreatedAt;
    assertTimestamp(
      effectiveEvaluationTime,
      `${label} recebeu instante de avaliacao invalido`,
    );
    const artifactName = expectedArtifactName ?? report.ArtifactName;
    const imageId = expectedImageId ?? report.Metadata?.ImageID;
    assertNonEmptyString(artifactName, `${label} nao recebeu o nome esperado`);
    assertDigest(imageId, `${label} nao recebeu um ImageID esperado valido`);
    if (report.ArtifactName !== artifactName) {
      throw new Error(
        `${label} examinou um nome de imagem diferente do esperado`,
      );
    }
    if (report.ArtifactType !== TRIVY_REPORT_CONTRACT.imageArtifactType) {
      throw new Error(`${label} nao e um relatorio de container_image`);
    }
    assertDigest(report.ArtifactID, `${label} possui ArtifactID invalido`);
    validateImageMetadata(report.Metadata, label, artifactName, imageId);
    const {
      targetCount,
      packageCount,
      findingCount,
      findings,
      packageMetadataSanitized,
    } = validateImageResults(report, label, requireSanitizedPackageMetadata);
    const risk = classifyTemporaryImageRisk(
      report,
      findings,
      effectiveEvaluationTime,
      ociBuildEvidence,
      imageId,
    );
    return {
      label,
      scope,
      scanner: "vuln",
      artifactName,
      artifactType: report.ArtifactType,
      imageId,
      targetCount,
      packageCount,
      packageMetadataSanitized,
      findingCount,
      acceptedRiskFindingCount: risk.acceptedRiskFindingCount,
      blockingFindingCount: risk.blockingFindingCount,
      riskAcceptance: risk.riskAcceptance,
      evaluatedAt: effectiveEvaluationTime,
      trivyVersion: report.Trivy.Version,
      approved: risk.blockingFindingCount === 0,
    };
  }

  const artifactName = expectedArtifactName ?? ".";
  if (report.ArtifactName !== artifactName) {
    throw new Error(`${label} examinou um caminho diferente do esperado`);
  }
  if (report.ArtifactType !== TRIVY_REPORT_CONTRACT.configArtifactType) {
    throw new Error(`${label} nao e um relatorio do repositorio examinado`);
  }
  assertDigest(report.ArtifactID, `${label} possui ArtifactID invalido`);
  assertObject(report.Metadata, `${label} possui Metadata invalido`);
  assertExactKeys(
    report.Metadata,
    [
      "RepoURL",
      "Branch",
      "Tags",
      "Commit",
      "CommitMsg",
      "Author",
      "Committer",
      "ImageConfig",
    ],
    `${label}.Metadata`,
  );
  if (
    requireSanitizedConfigMetadata &&
    ["Author", "Committer", "CommitMsg"].some((field) =>
      Object.hasOwn(report.Metadata, field),
    )
  ) {
    throw new Error(`${label} ainda contem identidade ou mensagem do Git`);
  }
  const configCommit = expectedConfigCommit ?? report.Metadata.Commit;
  if (
    typeof configCommit !== "string" ||
    !/^[a-f0-9]{40}(?:[a-f0-9]{24})?$/u.test(configCommit) ||
    report.Metadata.Commit !== configCommit
  ) {
    throw new Error(`${label} nao corresponde ao commit esperado`);
  }
  for (const field of [
    "RepoURL",
    "Branch",
    "CommitMsg",
    "Author",
    "Committer",
  ]) {
    if (
      Object.hasOwn(report.Metadata, field) &&
      typeof report.Metadata[field] !== "string"
    ) {
      throw new Error(`${label} possui ${field} invalido`);
    }
  }
  if (
    Object.hasOwn(report.Metadata, "Tags") &&
    (!Array.isArray(report.Metadata.Tags) ||
      report.Metadata.Tags.some((item) => typeof item !== "string"))
  ) {
    throw new Error(`${label} possui Tags invalidas`);
  }
  if (
    Object.hasOwn(report.Metadata, "ImageConfig") &&
    !isObject(report.Metadata.ImageConfig)
  ) {
    throw new Error(`${label} possui ImageConfig invalido`);
  }
  const { targetCount, findingCount } = validateConfigResults(report, label);
  return {
    label,
    scope,
    scanner: "misconfig",
    artifactName,
    artifactType: report.ArtifactType,
    commit: configCommit,
    requiredTargetType: TRIVY_REPORT_CONTRACT.requiredConfigType,
    targetCount,
    findingCount,
    acceptedRiskFindingCount: 0,
    blockingFindingCount: findingCount,
    riskAcceptance: null,
    trivyVersion: report.Trivy.Version,
    approved: findingCount === 0,
  };
}

/**
 * Mantém a API histórica do gate: o relatório precisa ser estruturalmente
 * válido e também não pode conter achado bloqueador.
 */
export function validateTrivyReport(report, options) {
  const inspected = inspectTrivyReport(report, options);
  if (!inspected.approved) {
    const noun =
      inspected.scope === "image" ? "vulnerabilidade" : "configuracao";
    throw new Error(`${inspected.label} contem ${noun} bloqueadora`);
  }
  return inspected;
}

function assertNullableNonNegativeInteger(value, label) {
  if (value !== null && (!Number.isSafeInteger(value) || value < 0)) {
    throw new Error(`${label} deve ser inteiro nao negativo ou null`);
  }
}

function validateSummaryReportEntry(entry, scope, label, schemaVersion) {
  assertObject(entry, `${label} nao contem objeto valido`);
  const commonKeys = [
    "approved",
    "artifactName",
    "artifactType",
    "failureCode",
    "findingCount",
    "structurallyValid",
    "targetCount",
  ];
  if (schemaVersion === 2) {
    commonKeys.push("acceptedRiskFindingCount", "blockingFindingCount");
  }
  assertExactKeys(
    entry,
    scope === "image"
      ? [
          ...commonKeys,
          "imageId",
          "packageCount",
          ...(schemaVersion === 2 ? ["packageMetadataSanitized"] : []),
        ]
      : [...commonKeys, "commit", "metadataSanitized", "requiredTargetType"],
    label,
  );
  if (
    typeof entry.structurallyValid !== "boolean" ||
    typeof entry.approved !== "boolean" ||
    (entry.failureCode !== null &&
      (typeof entry.failureCode !== "string" || entry.failureCode === ""))
  ) {
    throw new Error(`${label} possui estado estrutural invalido`);
  }
  for (const field of ["artifactName", "artifactType"]) {
    if (
      entry[field] !== null &&
      (typeof entry[field] !== "string" || entry[field].trim() === "")
    ) {
      throw new Error(`${label}.${field} deve ser texto nao vazio ou null`);
    }
  }
  const countFields = ["findingCount", "targetCount"];
  if (schemaVersion === 2) {
    countFields.push("acceptedRiskFindingCount", "blockingFindingCount");
  }
  for (const field of countFields) {
    assertNullableNonNegativeInteger(entry[field], `${label}.${field}`);
  }
  if (scope === "image") {
    if (entry.imageId !== null && !digestPattern.test(entry.imageId)) {
      throw new Error(`${label}.imageId deve ser digest valido ou null`);
    }
    assertNullableNonNegativeInteger(
      entry.packageCount,
      `${label}.packageCount`,
    );
    if (
      schemaVersion === 2 &&
      typeof entry.packageMetadataSanitized !== "boolean"
    ) {
      throw new Error(`${label}.packageMetadataSanitized deve ser booleano`);
    }
  } else if (
    (entry.commit !== null &&
      (typeof entry.commit !== "string" ||
        !/^[a-f0-9]{40}(?:[a-f0-9]{24})?$/u.test(entry.commit))) ||
    typeof entry.metadataSanitized !== "boolean" ||
    (entry.requiredTargetType !== null &&
      (typeof entry.requiredTargetType !== "string" ||
        entry.requiredTargetType === ""))
  ) {
    throw new Error(`${label} possui metadados estruturais invalidos`);
  }
  if (!entry.structurallyValid) {
    if (
      entry.approved ||
      entry.failureCode === null ||
      (schemaVersion === 2 &&
        (entry.findingCount !== null ||
          entry.acceptedRiskFindingCount !== null ||
          entry.blockingFindingCount !== null ||
          (scope === "image" && entry.packageMetadataSanitized !== false)))
    ) {
      throw new Error(`${label} invalido precisa falhar de modo fechado`);
    }
    return;
  }
  const decisionIsCoherent =
    schemaVersion === 1
      ? entry.approved === (entry.findingCount === 0)
      : entry.findingCount ===
          entry.acceptedRiskFindingCount + entry.blockingFindingCount &&
        entry.approved === (entry.blockingFindingCount === 0) &&
        (scope === "image" || entry.acceptedRiskFindingCount === 0);
  if (
    entry.failureCode !== null ||
    entry.findingCount === null ||
    entry.targetCount === null ||
    !decisionIsCoherent
  ) {
    throw new Error(`${label} possui decisao divergente dos achados`);
  }
  if (scope === "image") {
    assertDigest(entry.imageId, `${label}.imageId deve ser digest valido`);
    if (!Number.isSafeInteger(entry.packageCount) || entry.packageCount < 1) {
      throw new Error(`${label}.packageCount nao comprova inventario`);
    }
    if (schemaVersion === 2 && entry.packageMetadataSanitized !== true) {
      throw new Error(`${label} nao comprova sanitizacao dos pacotes`);
    }
  } else if (
    typeof entry.commit !== "string" ||
    !/^[a-f0-9]{40}(?:[a-f0-9]{24})?$/u.test(entry.commit) ||
    entry.metadataSanitized !== true ||
    entry.requiredTargetType !== TRIVY_REPORT_CONTRACT.requiredConfigType
  ) {
    throw new Error(`${label} nao comprova commit, sanitizacao e Dockerfile`);
  }
}

function validateRiskAcceptanceEvidence(value, label) {
  assertObject(value, `${label} nao contem objeto valido`);
  const expected = temporaryRiskAcceptanceEvidence();
  assertExactKeys(value, Object.keys(expected), label);
  assertObject(value.baseImage, `${label}.baseImage nao contem objeto valido`);
  assertExactKeys(
    value.baseImage,
    Object.keys(expected.baseImage),
    `${label}.baseImage`,
  );
  assertObject(
    value.approvedBy,
    `${label}.approvedBy nao contem objeto valido`,
  );
  assertExactKeys(
    value.approvedBy,
    Object.keys(expected.approvedBy),
    `${label}.approvedBy`,
  );
  assertObject(
    value.affectedLayer,
    `${label}.affectedLayer nao contem objeto valido`,
  );
  assertExactKeys(
    value.affectedLayer,
    Object.keys(expected.affectedLayer),
    `${label}.affectedLayer`,
  );
  for (const key of Object.keys(expected)) {
    if (
      key === "baseImage" ||
      key === "approvedBy" ||
      key === "affectedLayer"
    ) {
      continue;
    }
    if (value[key] !== expected[key]) {
      throw new Error(`${label}.${key} diverge da aprovacao registrada`);
    }
  }
  for (const key of Object.keys(expected.baseImage)) {
    if (value.baseImage[key] !== expected.baseImage[key]) {
      throw new Error(`${label}.baseImage.${key} diverge da base aprovada`);
    }
  }
  for (const key of Object.keys(expected.approvedBy)) {
    if (value.approvedBy[key] !== expected.approvedBy[key]) {
      throw new Error(`${label}.approvedBy.${key} diverge da aprovacao`);
    }
  }
  for (const key of Object.keys(expected.affectedLayer)) {
    if (value.affectedLayer[key] !== expected.affectedLayer[key]) {
      throw new Error(
        `${label}.affectedLayer.${key} diverge da camada aprovada`,
      );
    }
  }
}

/**
 * Valida o resumo que sempre pode ser preservado. Achados são um resultado
 * estrutural válido, mas só passam no gate quando `requireApproved` é usado.
 */
export function validateTrivyScanSummary(
  report,
  {
    expectedImageReference,
    expectedImageId,
    expectedConfigCommit,
    requireApproved = false,
  } = {},
) {
  assertObject(report, "resumo Trivy nao contem objeto JSON valido");
  if (![1, 2].includes(report.schemaVersion)) {
    throw new Error("resumo Trivy possui schemaVersion incompativel");
  }
  const summaryKeys = [
    "actionRevision",
    "conclusion",
    "configurationPolicy",
    "configStepOutcome",
    "expectedConfigArtifactName",
    "expectedConfigCommit",
    "expectedImageId",
    "expectedImageReference",
    "failureCode",
    "outcome",
    "passed",
    "rawFindingReportsRetained",
    "rawReportsPublished",
    "redacted",
    "reportType",
    "reports",
    "scanner",
    "scannerVersion",
    "schemaVersion",
    "imageStepOutcome",
  ];
  if (report.schemaVersion === 2) {
    summaryKeys.push(
      "evaluatedAt",
      "ociBuildEvidenceValid",
      "reportPublicationStatus",
      "riskAcceptance",
    );
  }
  assertExactKeys(report, summaryKeys, "resumo Trivy");
  if (
    report.reportType !== "TRIVY_SCAN_RESULT" ||
    report.scanner !== "trivy" ||
    report.scannerVersion !== TRIVY_REPORT_CONTRACT.trivyVersion ||
    report.actionRevision !== TRIVY_REPORT_CONTRACT.actionRevision ||
    report.configurationPolicy !== "CONTROLLED_NO_IGNORE_OR_SKIP_OVERRIDES" ||
    report.expectedConfigArtifactName !== "." ||
    typeof report.expectedImageReference !== "string" ||
    !/^portal-dp:[a-f0-9]{40}$/u.test(report.expectedImageReference) ||
    typeof report.expectedConfigCommit !== "string" ||
    !/^[a-f0-9]{40}(?:[a-f0-9]{24})?$/u.test(report.expectedConfigCommit) ||
    (report.expectedImageId !== null &&
      !digestPattern.test(report.expectedImageId)) ||
    !stepOutcomes.has(report.imageStepOutcome) ||
    !stepOutcomes.has(report.configStepOutcome) ||
    !summaryOutcomes.has(report.outcome) ||
    typeof report.passed !== "boolean" ||
    typeof report.rawReportsPublished !== "boolean" ||
    typeof report.rawFindingReportsRetained !== "boolean" ||
    report.redacted !== true ||
    (report.failureCode !== null &&
      (typeof report.failureCode !== "string" || report.failureCode === "")) ||
    typeof report.conclusion !== "string" ||
    report.conclusion === ""
  ) {
    throw new Error("resumo Trivy possui envelope invalido");
  }
  assertObject(report.reports, "resumo Trivy nao contem relatorios");
  assertExactKeys(report.reports, ["config", "image"], "resumo Trivy.reports");
  validateSummaryReportEntry(
    report.reports.image,
    "image",
    "resumo Trivy.image",
    report.schemaVersion,
  );
  validateSummaryReportEntry(
    report.reports.config,
    "config",
    "resumo Trivy.config",
    report.schemaVersion,
  );

  if (report.schemaVersion === 1) {
    if (
      report.rawFindingReportsRetained !== false ||
      report.outcome === "success_with_accepted_risk"
    ) {
      throw new Error("resumo Trivy legado possui estado de risco invalido");
    }
  } else {
    assertTimestamp(report.evaluatedAt, "resumo Trivy.evaluatedAt invalido");
    if (
      typeof report.ociBuildEvidenceValid !== "boolean" ||
      !["failed", "not_attempted", "published"].includes(
        report.reportPublicationStatus,
      )
    ) {
      throw new Error("resumo Trivy nao identifica a prova OCI e a publicacao");
    }
  }

  if (
    (expectedImageReference !== undefined &&
      report.expectedImageReference !== expectedImageReference) ||
    (expectedImageId !== undefined &&
      report.expectedImageId !== expectedImageId) ||
    (expectedConfigCommit !== undefined &&
      report.expectedConfigCommit !== expectedConfigCommit)
  ) {
    throw new Error("resumo Trivy diverge do artefato ou commit esperado");
  }
  if (
    report.reports.image.structurallyValid &&
    report.expectedImageId !== report.reports.image.imageId
  ) {
    throw new Error("resumo Trivy nao vincula o ImageID local examinado");
  }

  const allStructured =
    report.reports.image.structurallyValid &&
    report.reports.config.structurallyValid;
  const stepOutcomesMatch =
    allStructured &&
    report.imageStepOutcome ===
      (report.reports.image.findingCount === 0 ? "success" : "failure") &&
    report.configStepOutcome ===
      (report.reports.config.findingCount === 0 ? "success" : "failure");
  const scansApproved =
    stepOutcomesMatch &&
    report.reports.image.approved &&
    report.reports.config.approved;
  const ociBuildEvidenceValid =
    report.schemaVersion === 1 ? true : report.ociBuildEvidenceValid;
  const expectedPublicationStatus =
    report.schemaVersion === 1
      ? report.rawReportsPublished
        ? "published"
        : "not_attempted"
      : scansApproved && ociBuildEvidenceValid
        ? report.rawReportsPublished
          ? "published"
          : "failed"
        : "not_attempted";
  const allApproved =
    scansApproved &&
    ociBuildEvidenceValid &&
    expectedPublicationStatus === "published";
  const totalFindings = allStructured
    ? report.reports.image.findingCount + report.reports.config.findingCount
    : 0;
  const totalAcceptedRisks =
    report.schemaVersion === 2 && allStructured
      ? report.reports.image.acceptedRiskFindingCount +
        report.reports.config.acceptedRiskFindingCount
      : 0;
  if (report.schemaVersion === 2) {
    if (totalAcceptedRisks === 1) {
      validateRiskAcceptanceEvidence(
        report.riskAcceptance,
        "resumo Trivy.riskAcceptance",
      );
      if (!isWithinTemporaryAcceptanceWindow(report.evaluatedAt)) {
        throw new Error("resumo Trivy usa aceitacao fora da vigencia");
      }
    } else if (report.riskAcceptance !== null || totalAcceptedRisks !== 0) {
      throw new Error("resumo Trivy possui aceitacao de risco incoerente");
    }
  }
  const expectedAcceptedOutcome = allApproved && totalAcceptedRisks === 1;
  if (
    (report.schemaVersion === 2 &&
      report.reportPublicationStatus !== expectedPublicationStatus) ||
    report.passed !== allApproved ||
    report.rawReportsPublished !==
      (expectedPublicationStatus === "published") ||
    report.rawFindingReportsRetained !== (allApproved && totalFindings > 0) ||
    (allApproved &&
      !expectedAcceptedOutcome &&
      (report.outcome !== "success" ||
        report.failureCode !== null ||
        report.conclusion !== "SEM_ACHADOS_BLOQUEADORES")) ||
    (expectedAcceptedOutcome &&
      (report.outcome !== "success_with_accepted_risk" ||
        report.failureCode !== null ||
        report.conclusion !== "APROVADA_COM_RISCO_TEMPORARIO_ACEITO")) ||
    (report.outcome === "findings" &&
      report.conclusion !== "NAO_APROVADA_ACHADO_TRIVY") ||
    (report.outcome === "operational_failure" &&
      report.conclusion !== "NAO_APROVADA_FALHA_OPERACIONAL") ||
    (!allApproved &&
      ["success", "success_with_accepted_risk"].includes(report.outcome)) ||
    (report.outcome === "findings" &&
      (!stepOutcomesMatch ||
        (report.reports.image.findingCount === 0 &&
          report.reports.config.findingCount === 0))) ||
    (report.outcome === "operational_failure" && report.failureCode === null)
  ) {
    throw new Error("resumo Trivy possui conclusao incoerente");
  }
  if (requireApproved && !allApproved) {
    throw new Error("resumo Trivy nao foi aprovado pelo gate");
  }
  return { allStructured, approved: allApproved, outcome: report.outcome };
}
