const scopes = new Set(["image", "config"]);
const stepOutcomes = new Set(["success", "failure", "cancelled", "skipped"]);
const summaryOutcomes = new Set(["success", "findings", "operational_failure"]);
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

function validateImageResults(report, label) {
  let coverage = 0;
  let packageCount = 0;
  let findingCount = 0;
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
    packageCount += packages.length;
    const vulnerabilities = optionalArray(result, "Vulnerabilities", label);
    if (vulnerabilities.some((item) => !isObject(item))) {
      throw new Error(`${label} possui achado de vulnerabilidade malformado`);
    }
    findingCount += vulnerabilities.length;
  }
  if (coverage === 0 || packageCount === 0) {
    throw new Error(
      `${label} nao comprova inventario e cobertura do scanner vuln`,
    );
  }
  return { targetCount: coverage, packageCount, findingCount };
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
    const { targetCount, packageCount, findingCount } = validateImageResults(
      report,
      label,
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
      findingCount,
      trivyVersion: report.Trivy.Version,
      approved: findingCount === 0,
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

function validateSummaryReportEntry(entry, scope, label) {
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
  assertExactKeys(
    entry,
    scope === "image"
      ? [...commonKeys, "imageId", "packageCount"]
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
  for (const field of ["findingCount", "targetCount"]) {
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
    if (entry.approved || entry.failureCode === null) {
      throw new Error(`${label} invalido precisa falhar de modo fechado`);
    }
    return;
  }
  if (
    entry.failureCode !== null ||
    entry.findingCount === null ||
    entry.targetCount === null ||
    entry.approved !== (entry.findingCount === 0)
  ) {
    throw new Error(`${label} possui decisao divergente dos achados`);
  }
  if (scope === "image") {
    assertDigest(entry.imageId, `${label}.imageId deve ser digest valido`);
    if (!Number.isSafeInteger(entry.packageCount) || entry.packageCount < 1) {
      throw new Error(`${label}.packageCount nao comprova inventario`);
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
  assertExactKeys(
    report,
    [
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
    ],
    "resumo Trivy",
  );
  if (
    report.schemaVersion !== 1 ||
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
    report.rawFindingReportsRetained !== false ||
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
  );
  validateSummaryReportEntry(
    report.reports.config,
    "config",
    "resumo Trivy.config",
  );

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
      (report.reports.image.approved ? "success" : "failure") &&
    report.configStepOutcome ===
      (report.reports.config.approved ? "success" : "failure");
  const allApproved =
    stepOutcomesMatch &&
    report.reports.image.approved &&
    report.reports.config.approved;
  if (
    report.passed !== allApproved ||
    report.rawReportsPublished !== allApproved ||
    (allApproved &&
      (report.outcome !== "success" ||
        report.failureCode !== null ||
        report.conclusion !== "SEM_ACHADOS_BLOQUEADORES")) ||
    (report.outcome === "findings" &&
      report.conclusion !== "NAO_APROVADA_ACHADO_TRIVY") ||
    (report.outcome === "operational_failure" &&
      report.conclusion !== "NAO_APROVADA_FALHA_OPERACIONAL") ||
    (!allApproved && report.outcome === "success") ||
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
