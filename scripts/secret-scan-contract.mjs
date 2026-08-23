const sha256Pattern = /^[a-f0-9]{64}$/u;
const imageDigestPattern = /^sha256:[a-f0-9]{64}$/u;

export const contentSecretScanProfiles = {
  COLLECTED_EVIDENCE: ["COLLECTED_EVIDENCE"],
  GENERATED: ["BUILD_PACKAGE", "GENERATED_EVIDENCE", "TEST_FIXTURES"],
  OCI_EVIDENCE: ["OCI_EVIDENCE"],
  SAST_EVIDENCE: ["SAST_EVIDENCE"],
  SEALED_EVIDENCE: ["SEALED_EVIDENCE"],
};

function exactKeys(value, expected) {
  return (
    value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    JSON.stringify(Object.keys(value).sort()) ===
      JSON.stringify([...expected].sort())
  );
}

function validContentScanCoverage(report, expectedScopes) {
  return (
    Array.isArray(report.scopeStats) &&
    report.scopeStats.length === expectedScopes.length &&
    report.scopeStats.every(
      (item, index) =>
        exactKeys(item, ["scope", "fileCount", "byteCount"]) &&
        item.scope === expectedScopes[index] &&
        Number.isSafeInteger(item.fileCount) &&
        item.fileCount >= 1 &&
        Number.isSafeInteger(item.byteCount) &&
        item.byteCount >= 1,
    ) &&
    Number.isSafeInteger(report.fileCount) &&
    report.fileCount >= 1 &&
    report.scopeStats.reduce((total, item) => total + item.fileCount, 0) ===
      report.fileCount &&
    Number.isSafeInteger(report.byteCount) &&
    report.byteCount >= 1 &&
    report.scopeStats.reduce((total, item) => total + item.byteCount, 0) ===
      report.byteCount &&
    sha256Pattern.test(report.aggregateSha256 ?? "") &&
    Number.isSafeInteger(report.prohibitedDataArchiveEntryCount) &&
    report.prohibitedDataArchiveEntryCount >= 0 &&
    Number.isSafeInteger(report.prohibitedDataExpandedByteCount) &&
    report.prohibitedDataExpandedByteCount >= 0 &&
    Number.isSafeInteger(report.prohibitedDataFindingCount) &&
    report.prohibitedDataFindingCount >= 0
  );
}

function validSealedSubject(report, expectedProfile) {
  if (expectedProfile !== "SEALED_EVIDENCE")
    return report.subject === undefined;
  return (
    exactKeys(report.subject, [
      "aggregateSha256",
      "conclusion",
      "manifestSha256",
      "outcome",
      "passed",
      "runId",
    ]) &&
    /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/u.test(report.subject.runId ?? "") &&
    sha256Pattern.test(report.subject.manifestSha256 ?? "") &&
    sha256Pattern.test(report.subject.aggregateSha256 ?? "") &&
    report.subject.outcome === report.outcome &&
    report.subject.passed === report.passed &&
    report.subject.conclusion === report.conclusion
  );
}

export function validateContentSecretScanReport(
  report,
  expectedProfile,
  { requireClean = true } = {},
) {
  const expectedScopes = contentSecretScanProfiles[expectedProfile];
  const expectedKeys = [
    "aggregateSha256",
    "archiveDepth",
    "byteCount",
    "conclusion",
    "configurationPolicy",
    "decodeDepth",
    "exitCode",
    "failureCode",
    "fileCount",
    "findingCount",
    "gitleaksAllowIgnored",
    "gitleaksFindingCount",
    "installOutcome",
    "integrityVerified",
    "outcome",
    "passed",
    "profile",
    "prohibitedDataArchiveEntryCount",
    "prohibitedDataArchiveInspection",
    "prohibitedDataArchiveMaxCompressionRatio",
    "prohibitedDataArchiveMaxDepth",
    "prohibitedDataArchiveMaxEntries",
    "prohibitedDataArchiveMaxEntryBytes",
    "prohibitedDataArchiveMaxExpandedBytes",
    "prohibitedDataExpandedByteCount",
    "prohibitedDataFindingCount",
    "prohibitedDataPolicy",
    "rawReportRetained",
    "redacted",
    "reportFormat",
    "reportType",
    "scanMode",
    "scanner",
    "scannerDistributionSha256",
    "scannerVersion",
    "scannerVersionVerified",
    "scanStepOutcome",
    "schemaVersion",
    "scopes",
    "scopeStats",
    "stagedInputRetained",
    "timeoutSeconds",
  ];
  if (expectedProfile === "SEALED_EVIDENCE") expectedKeys.push("subject");
  const coverageValid = validContentScanCoverage(report, expectedScopes ?? []);
  const fixedContractInvalid =
    !expectedScopes ||
    !exactKeys(report, expectedKeys) ||
    report.schemaVersion !== 1 ||
    report.reportType !== "CONTENT_SECRET_SCAN_RESULT" ||
    report.profile !== expectedProfile ||
    report.scanner !== "gitleaks-cli+portal-dp-prohibited-data" ||
    report.scannerVersion !== "8.24.3" ||
    report.scannerDistributionSha256 !==
      "9991e0b2903da4c8f6122b5c3186448b927a5da4deef1fe45271c3793f4ee29c" ||
    report.integrityVerified !== true ||
    report.scannerVersionVerified !== true ||
    report.scanMode !== "directory-with-archives" ||
    JSON.stringify(report.scopes) !== JSON.stringify(expectedScopes) ||
    report.prohibitedDataPolicy !== "PORTAL_DP_PROHIBITED_DATA_V2" ||
    report.prohibitedDataArchiveInspection !== "FAIL_CLOSED_TAR_ZIP_OCI_V1" ||
    report.prohibitedDataArchiveMaxDepth !== 4 ||
    report.prohibitedDataArchiveMaxEntries !== 50_000 ||
    report.prohibitedDataArchiveMaxEntryBytes !== 268_435_456 ||
    report.prohibitedDataArchiveMaxExpandedBytes !== 2_147_483_648 ||
    report.prohibitedDataArchiveMaxCompressionRatio !== 200 ||
    report.configurationPolicy !== "BUILT_IN_DEFAULT_NO_REPOSITORY_OVERRIDES" ||
    report.gitleaksAllowIgnored !== true ||
    report.archiveDepth !== 3 ||
    report.decodeDepth !== 2 ||
    report.timeoutSeconds !== 300 ||
    report.reportFormat !== "sarif-2.1.0-temporary" ||
    report.redacted !== true ||
    report.rawReportRetained !== false ||
    report.stagedInputRetained !== false ||
    !["success", "failure", "cancelled", "skipped"].includes(
      report.installOutcome,
    ) ||
    !["success", "failure", "cancelled", "skipped"].includes(
      report.scanStepOutcome,
    ) ||
    !validSealedSubject(report, expectedProfile);

  const validSuccess =
    coverageValid &&
    report.prohibitedDataFindingCount === 0 &&
    report.installOutcome === "success" &&
    report.scanStepOutcome === "success" &&
    report.exitCode === 0 &&
    report.gitleaksFindingCount === 0 &&
    report.findingCount === 0 &&
    report.outcome === "success" &&
    report.failureCode === null &&
    report.passed === true &&
    report.conclusion === "SEM_ACHADOS_BLOQUEADORES" &&
    (expectedProfile !== "SEALED_EVIDENCE" ||
      report.subject.aggregateSha256 === report.aggregateSha256);
  const validFindings =
    coverageValid &&
    report.installOutcome === "success" &&
    report.scanStepOutcome === "failure" &&
    report.exitCode === 2 &&
    Number.isSafeInteger(report.gitleaksFindingCount) &&
    report.gitleaksFindingCount >= 0 &&
    Number.isSafeInteger(report.findingCount) &&
    report.findingCount > 0 &&
    report.findingCount ===
      report.gitleaksFindingCount + report.prohibitedDataFindingCount &&
    report.outcome === "findings" &&
    report.failureCode === null &&
    report.passed === false &&
    report.conclusion === "NAO_APROVADA_ACHADO_DE_SEGREDO";
  const validOperationalFailure =
    report.outcome === "operational_failure" &&
    typeof report.failureCode === "string" &&
    report.failureCode.length > 0 &&
    report.passed === false &&
    report.conclusion === "NAO_APROVADA_FALHA_OPERACIONAL" &&
    (report.exitCode === null ||
      (Number.isSafeInteger(report.exitCode) &&
        report.exitCode >= 0 &&
        report.exitCode <= 255)) &&
    (coverageValid ||
      (report.scopeStats === null &&
        report.fileCount === null &&
        report.byteCount === null &&
        report.aggregateSha256 === null &&
        report.prohibitedDataArchiveEntryCount === null &&
        report.prohibitedDataExpandedByteCount === null &&
        report.prohibitedDataFindingCount === null));

  if (
    fixedContractInvalid ||
    (requireClean
      ? !validSuccess
      : !validSuccess && !validFindings && !validOperationalFailure)
  ) {
    throw new Error(
      `content secret scan ${expectedProfile} is not a valid fail-closed proof`,
    );
  }
}

export function validateImageSecretScanReport(
  report,
  expectedImageReference,
  { requireClean = true } = {},
) {
  const expectedKeys = [
    "actionRevision",
    "actionRevisionPinned",
    "conclusion",
    "configurationPolicy",
    "exitCodePolicy",
    "expectedImageId",
    "expectedImageReference",
    "failureCode",
    "findingCount",
    "imageId",
    "imageLayerCount",
    "outcome",
    "passed",
    "rawReportRetained",
    "redacted",
    "reportType",
    "scanMode",
    "scanner",
    "scannerVersion",
    "scannerVersionConfigured",
    "scannerVersionObserved",
    "scannerVersionVerified",
    "schemaVersion",
    "scope",
    "stepOutcome",
    "targetCount",
  ];
  const fixedContractInvalid =
    !exactKeys(report, expectedKeys) ||
    report.schemaVersion !== 1 ||
    report.reportType !== "IMAGE_LAYER_SECRET_SCAN_RESULT" ||
    report.scanner !== "trivy" ||
    report.scannerVersion !== "0.70.0" ||
    report.scannerVersionConfigured !== true ||
    report.actionRevision !== "ed142fd0673e97e23eac54620cfb913e5ce36c25" ||
    report.actionRevisionPinned !== true ||
    report.scope !== "OCI_IMAGE_FILESYSTEM_AND_LAYERS" ||
    report.scanMode !== "container-image-secret-only" ||
    report.configurationPolicy !== "CONTROLLED_NO_IGNORE_OR_SKIP_OVERRIDES" ||
    report.expectedImageReference !== expectedImageReference ||
    report.exitCodePolicy !== 1 ||
    !["success", "failure", "cancelled", "skipped"].includes(
      report.stepOutcome,
    ) ||
    report.redacted !== true ||
    report.rawReportRetained !== false;

  const boundCoverage =
    imageDigestPattern.test(report.expectedImageId ?? "") &&
    imageDigestPattern.test(report.imageId ?? "") &&
    report.imageId === report.expectedImageId &&
    report.scannerVersionObserved === "0.70.0" &&
    report.scannerVersionVerified === true &&
    Number.isSafeInteger(report.imageLayerCount) &&
    report.imageLayerCount >= 1 &&
    Number.isSafeInteger(report.targetCount) &&
    report.targetCount >= 0 &&
    Number.isSafeInteger(report.findingCount) &&
    report.findingCount >= 0;
  const validSuccess =
    boundCoverage &&
    report.stepOutcome === "success" &&
    report.findingCount === 0 &&
    report.outcome === "success" &&
    report.failureCode === null &&
    report.passed === true &&
    report.conclusion === "SEM_ACHADOS_BLOQUEADORES";
  const validFindings =
    boundCoverage &&
    report.stepOutcome === "failure" &&
    report.findingCount > 0 &&
    report.outcome === "findings" &&
    report.failureCode === null &&
    report.passed === false &&
    report.conclusion === "NAO_APROVADA_ACHADO_DE_SEGREDO";
  const missingCoverage =
    report.imageId === null &&
    report.imageLayerCount === null &&
    report.targetCount === null &&
    report.findingCount === null &&
    report.scannerVersionObserved === null &&
    report.scannerVersionVerified === false;
  const validOperationalFailure =
    (boundCoverage || missingCoverage) &&
    (report.expectedImageId === null ||
      imageDigestPattern.test(report.expectedImageId)) &&
    report.outcome === "operational_failure" &&
    typeof report.failureCode === "string" &&
    report.failureCode.length > 0 &&
    report.passed === false &&
    report.conclusion === "NAO_APROVADA_FALHA_OPERACIONAL";

  if (
    fixedContractInvalid ||
    (requireClean
      ? !validSuccess
      : !validSuccess && !validFindings && !validOperationalFailure)
  ) {
    throw new Error("image secret scan is not a valid layer-bound proof");
  }
  return {
    approved: validSuccess,
    imageId: report.imageId,
    outcome: report.outcome,
    structurallyValid: true,
  };
}
