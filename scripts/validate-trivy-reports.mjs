import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import {
  TRIVY_REPORT_CONTRACT,
  validateTrivyReport,
} from "./trivy-report-contract.mjs";

const allowedArguments = new Set([
  "image",
  "config",
  "image-name",
  "image-id",
  "config-name",
  "config-commit",
  "trivy-version",
  "action-revision",
]);

function parseArguments(values) {
  const parsed = new Map();
  for (let index = 0; index < values.length; index += 2) {
    const token = values[index];
    const value = values[index + 1];
    if (typeof token !== "string" || !token.startsWith("--")) {
      throw new Error(`argumento Trivy invalido: ${String(token)}`);
    }
    const name = token.slice(2);
    if (!allowedArguments.has(name)) {
      throw new Error(`argumento Trivy desconhecido: --${name}`);
    }
    if (
      parsed.has(name) ||
      typeof value !== "string" ||
      value === "" ||
      value.startsWith("--")
    ) {
      throw new Error(`valor ausente ou duplicado para --${name}`);
    }
    parsed.set(name, value);
  }
  for (const name of allowedArguments) {
    if (!parsed.has(name)) throw new Error(`informe --${name} <valor>`);
  }
  return parsed;
}

async function readReport(path, label, options) {
  let report;
  try {
    report = JSON.parse(await readFile(resolve(path), "utf8"));
  } catch {
    throw new Error(`${label} ausente ou nao contem JSON valido`);
  }
  return validateTrivyReport(report, { label, ...options });
}

const argumentsByName = parseArguments(process.argv.slice(2));
const trivyVersion = argumentsByName.get("trivy-version");
const actionRevision = argumentsByName.get("action-revision");
if (trivyVersion !== TRIVY_REPORT_CONTRACT.trivyVersion) {
  throw new Error("a versao informada do Trivy diverge do contrato pinado");
}
if (actionRevision !== TRIVY_REPORT_CONTRACT.actionRevision) {
  throw new Error(
    "a revisao informada da trivy-action diverge do contrato pinado",
  );
}

const summaries = await Promise.all([
  readReport(argumentsByName.get("image"), "trivy-image", {
    scope: "image",
    expectedArtifactName: argumentsByName.get("image-name"),
    expectedImageId: argumentsByName.get("image-id"),
    expectedTrivyVersion: trivyVersion,
  }),
  readReport(argumentsByName.get("config"), "trivy-config", {
    scope: "config",
    expectedArtifactName: argumentsByName.get("config-name"),
    expectedConfigCommit: argumentsByName.get("config-commit"),
    expectedTrivyVersion: trivyVersion,
  }),
]);

// A saida contem apenas metadados de rastreabilidade e contagens.
process.stdout.write(
  `${JSON.stringify({
    approved: true,
    toolchain: {
      trivyVersion,
      trivyActionRevision: actionRevision,
    },
    reports: summaries,
  })}\n`,
);
