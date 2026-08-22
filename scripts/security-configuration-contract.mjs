const expectedBase =
  "gcr.io/distroless/nodejs24-debian13:nonroot@sha256:ffab599740d4aaa66029d02b9e6d3de4f622fefb7410081c5ef69c86430f364d";

export function validateSecurityConfigurationReport(report) {
  const assertions = report?.assertions ?? {};
  const valid =
    report?.schemaVersion === 1 &&
    report?.reportType === "OCI_SECURITY_CONFIGURATION_VERIFICATION" &&
    report?.status === "PASSOU" &&
    Object.values(assertions).length === 8 &&
    Object.values(assertions).every((item) => item?.status === "PASSOU") &&
    assertions.processIdentity?.user === "65532:65532" &&
    assertions.immutableRootFilesystem?.readOnly === true &&
    JSON.stringify(assertions.droppedCapabilities?.values) ===
      JSON.stringify(["ALL"]) &&
    assertions.privilegeEscalation?.noNewPrivileges === true &&
    assertions.workerRuntimeSecurity?.user === "65532:65532" &&
    assertions.workerRuntimeSecurity?.readOnly === true &&
    JSON.stringify(assertions.workerRuntimeSecurity?.droppedCapabilities) ===
      JSON.stringify(["ALL"]) &&
    assertions.workerRuntimeSecurity?.noNewPrivileges === true &&
    assertions.syntheticApiRoute?.enabled === false &&
    assertions.syntheticApiRoute?.observedStatusCode === 404 &&
    assertions.runtime?.base === expectedBase &&
    JSON.stringify(assertions.runtime?.entrypoint) ===
      JSON.stringify(["/nodejs/bin/node"]) &&
    JSON.stringify(assertions.runtime?.command) ===
      JSON.stringify(["apps/api/dist/main.js"]) &&
    assertions.privateObjectStorage?.declaredVolume === true &&
    assertions.privateObjectStorage?.runtimeMount === "volume:true" &&
    assertions.privateObjectStorage?.rootPermissions === "65532:65532:700" &&
    assertions.privateObjectStorage?.objectPermissions === "65532:65532:600";
  if (!valid) {
    throw new Error(
      "security configuration report does not prove the hardened runtime",
    );
  }
  return report;
}
