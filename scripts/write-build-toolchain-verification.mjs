import { execFileSync } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const expected = Object.freeze({
  buildxVersion: "v0.36.1",
  buildKitVersion: "v0.32.2",
  buildKitImage:
    "moby/buildkit:v0.32.2@sha256:28a898719c18a33f4e8000685287fa36fd0dd9560c6440227d3a732d79bb41d8",
  driver: "docker-container",
  platform: "linux/amd64",
});

function requireString(value, field) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${field} ausente ou invalido`);
  }
  return value;
}

function normalizePlatforms(value, index) {
  const platforms = requireString(value, `nodes[${index}].platforms`)
    .split(",")
    .map((platform) => platform.trim())
    .filter(Boolean)
    .sort();
  if (!platforms.includes(expected.platform)) {
    throw new Error(`nodes[${index}] nao oferece ${expected.platform}`);
  }
  return [...new Set(platforms)];
}

/**
 * Converte a saida potencialmente sensivel da action em uma lista permitida.
 * Nome, endpoint, flags, rotulos e opcoes do driver nunca sao persistidos.
 */
export function createBuildToolchainReport(input) {
  if (input.driver !== expected.driver) {
    throw new Error("driver do Buildx diverge do valor aprovado");
  }
  if (
    typeof input.buildxVersionOutput !== "string" ||
    !new RegExp(
      `\\b${expected.buildxVersion.replaceAll(".", "\\.")}\\b`,
      "u",
    ).test(input.buildxVersionOutput)
  ) {
    throw new Error("versao efetiva do Buildx diverge do valor aprovado");
  }

  let rawNodes;
  try {
    rawNodes = JSON.parse(input.nodesJson);
  } catch {
    throw new Error("nodes do Buildx nao contem JSON valido");
  }
  if (!Array.isArray(rawNodes) || rawNodes.length === 0) {
    throw new Error("nodes do Buildx devem formar uma lista nao vazia");
  }

  const nodes = rawNodes.map((node, index) => {
    if (typeof node !== "object" || node === null || Array.isArray(node)) {
      throw new Error(`nodes[${index}] possui tipo invalido`);
    }
    if (node.status !== "running") {
      throw new Error(`nodes[${index}] nao esta em execucao`);
    }
    if (node.buildkit !== expected.buildKitVersion) {
      throw new Error(`nodes[${index}] usa BuildKit nao aprovado`);
    }
    return {
      status: "running",
      buildKitVersion: expected.buildKitVersion,
      platforms: normalizePlatforms(node.platforms, index),
    };
  });

  return {
    schemaVersion: 1,
    reportType: "BUILD_TOOLCHAIN_VERIFICATION",
    status: "PASSOU",
    verifiedAt: new Date().toISOString(),
    source: "GITHUB_ACTIONS_OCI_BUILD",
    expected: {
      buildxVersion: expected.buildxVersion,
      buildKitVersion: expected.buildKitVersion,
      buildKitImage: expected.buildKitImage,
      driver: expected.driver,
      platform: expected.platform,
    },
    observed: {
      buildxVersion: expected.buildxVersion,
      driver: expected.driver,
      nodes,
    },
    sanitization:
      "Lista permitida: sem nome, endpoint, opcoes, flags, rotulos ou topologia dos nodes.",
  };
}

async function main() {
  const buildxVersionOutput = execFileSync("docker", ["buildx", "version"], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  const report = createBuildToolchainReport({
    driver: process.env["BUILDX_DRIVER"],
    nodesJson: process.env["BUILDX_NODES_JSON"],
    buildxVersionOutput,
  });
  const output = resolve(
    "evidencias/resultados/build-toolchain-verification.json",
  );
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, `${JSON.stringify(report, null, 2)}\n`, {
    flag: "wx",
  });
  process.stdout.write(
    `${JSON.stringify({ written: "evidencias/resultados/build-toolchain-verification.json" })}\n`,
  );
}

if (resolve(process.argv[1] ?? "") === resolve(import.meta.filename)) {
  await main();
}
