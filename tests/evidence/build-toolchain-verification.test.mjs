import assert from "node:assert/strict";
import test from "node:test";

import { createBuildToolchainReport } from "../../scripts/write-build-toolchain-verification.mjs";

const validInput = {
  driver: "docker-container",
  buildxVersionOutput:
    "github.com/docker/buildx v0.36.1 0123456789abcdef0123456789abcdef01234567",
  nodesJson: JSON.stringify([
    {
      name: "nao-deve-ser-persistido",
      endpoint: "unix:///var/run/docker.sock",
      driverOpts: ["segredo=nao-persistir"],
      status: "running",
      buildkit: "v0.32.2",
      platforms: "linux/amd64/v2,linux/amd64",
    },
  ]),
};

test("persiste apenas fatos permitidos da toolchain de build", () => {
  const report = createBuildToolchainReport(validInput);
  assert.equal(report.status, "PASSOU");
  assert.equal(report.observed.buildxVersion, "v0.36.1");
  assert.deepEqual(report.observed.nodes, [
    {
      status: "running",
      buildKitVersion: "v0.32.2",
      platforms: ["linux/amd64", "linux/amd64/v2"],
    },
  ]);
  const serialized = JSON.stringify(report);
  assert.equal(serialized.includes("nao-deve-ser-persistido"), false);
  assert.equal(serialized.includes("unix:///var/run/docker.sock"), false);
  assert.equal(serialized.includes("segredo=nao-persistir"), false);
});

test("falha fechado para versao, driver, status ou plataforma divergentes", () => {
  assert.throws(
    () =>
      createBuildToolchainReport({
        ...validInput,
        driver: "docker",
      }),
    /driver/u,
  );
  assert.throws(
    () =>
      createBuildToolchainReport({
        ...validInput,
        buildxVersionOutput: "github.com/docker/buildx v0.36.0",
      }),
    /Buildx/u,
  );
  assert.throws(
    () =>
      createBuildToolchainReport({
        ...validInput,
        nodesJson: JSON.stringify([
          {
            status: "stopped",
            buildkit: "v0.32.2",
            platforms: "linux/amd64",
          },
        ]),
      }),
    /execucao/u,
  );
  assert.throws(
    () =>
      createBuildToolchainReport({
        ...validInput,
        nodesJson: JSON.stringify([
          {
            status: "running",
            buildkit: "v0.32.1",
            platforms: "linux/amd64",
          },
        ]),
      }),
    /BuildKit/u,
  );
  assert.throws(
    () =>
      createBuildToolchainReport({
        ...validInput,
        nodesJson: JSON.stringify([
          {
            status: "running",
            buildkit: "v0.32.2",
            platforms: "linux/arm64",
          },
        ]),
      }),
    /linux\/amd64/u,
  );
});
