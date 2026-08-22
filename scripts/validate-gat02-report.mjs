import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const reportPath = resolve(
  root,
  process.argv[2] ?? "evidencias/resultados/gat-02-vitest.json",
);
const catalogPath = resolve(root, "evidencias/manifests/gat-02-cases-v1.json");

const [report, catalog] = await Promise.all(
  [reportPath, catalogPath].map(async (path) =>
    JSON.parse(await readFile(path, "utf8")),
  ),
);

if (
  catalog.schemaVersion !== 1 ||
  catalog.gate !== "GAT-02" ||
  !Number.isSafeInteger(catalog.expectedCount) ||
  !Array.isArray(catalog.caseTitles)
) {
  throw new Error("O catalogo de casos GAT-02 e invalido");
}

const expectedTitles = [...catalog.caseTitles].sort();
if (
  expectedTitles.length !== catalog.expectedCount ||
  new Set(expectedTitles).size !== catalog.expectedCount
) {
  throw new Error("O catalogo GAT-02 deve conter titulos unicos e completos");
}

const assertions = Array.isArray(report.testResults)
  ? report.testResults.flatMap((suite) => suite.assertionResults ?? [])
  : [];
const actualTitles = assertions.map((item) => item.title).sort();
const allPassed = assertions.every((item) => item.status === "passed");

// A saida do runner so comprova o gate quando os mesmos 20 casos aprovados
// continuam presentes. Contagem isolada nao permite substituir um caso por outro.
const valid =
  report.success === true &&
  report.numTotalTests === catalog.expectedCount &&
  report.numPassedTests === catalog.expectedCount &&
  report.numFailedTests === 0 &&
  report.numPendingTests === 0 &&
  assertions.length === catalog.expectedCount &&
  allPassed &&
  JSON.stringify(actualTitles) === JSON.stringify(expectedTitles);

if (!valid) {
  throw new Error(
    `O relatorio GAT-02 nao comprova os ${catalog.expectedCount} casos esperados`,
  );
}

process.stdout.write(
  `${JSON.stringify({ valid: true, gate: catalog.gate, passed: assertions.length })}\n`,
);
