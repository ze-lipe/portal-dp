import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import test from "node:test";

const root = resolve(import.meta.dirname, "../..");
const manifestPath = resolve(
  root,
  "evidencias/manifests/etp00-ui-con-coverage-v1.json",
);
const stateMatrixPath = resolve(
  root,
  "documentacao/17-matriz-formal-estados-transicoes.md",
);
const executableMatrixPath = resolve(
  root,
  "documentacao/22a-matriz-executavel-casos-perfis-evidencias.md",
);

const expectedUiIds = [
  "UI-01",
  "UI-02",
  "UI-03",
  "UI-04",
  "UI-05",
  "UI-06",
  "UI-07",
  "UI-08",
  "UI-08A",
  "UI-09",
  "UI-10",
  "UI-10A",
  "UI-11",
  "UI-12",
  "UI-13",
  "UI-14",
  "UI-15",
  "UI-16",
  "UI-17",
  "UI-18",
  "UI-19",
  "UI-20",
  "UI-21",
  "UI-22",
  "UI-23",
  "UI-24",
  "UI-25",
  "UI-26",
];
const expectedConIds = Array.from(
  { length: 9 },
  (_, index) => `CON-${String(index + 1).padStart(2, "0")}`,
);

async function loadReport() {
  return JSON.parse(await readFile(manifestPath, "utf8"));
}

function sorted(values) {
  return [...values].sort((left, right) => left.localeCompare(right));
}

function countCoverage(cases) {
  return cases.reduce(
    (counts, item) => {
      counts[item.coverage] = (counts[item.coverage] ?? 0) + 1;
      return counts;
    },
    {
      BASE_AUTOMATIZADA: 0,
      PARCIAL: 0,
      SEM_PROVA_AUTOMATIZADA_EXPLICITA: 0,
    },
  );
}

test("mapeia exatamente os 28 casos UI e as nove políticas CON da ETP-00", async () => {
  const [report, stateMatrix, executableMatrix] = await Promise.all([
    loadReport(),
    readFile(stateMatrixPath, "utf8"),
    readFile(executableMatrixPath, "utf8"),
  ]);

  assert.equal(report.reportType, "INVENTARIO_DE_COBERTURA_AUTOMATIZADA");
  assert.equal(
    report.interpretation.executionClaim,
    "NAO_SUBSTITUI_RESULTADO_DE_EXECUCAO",
  );
  assert.equal(report.cases.length, 37);

  const transitionIds = report.cases.map((item) => item.transitionId);
  assert.equal(new Set(transitionIds).size, 37);
  assert.deepEqual(
    sorted(transitionIds.filter((id) => id.startsWith("UI-"))),
    sorted(expectedUiIds),
  );
  assert.deepEqual(
    sorted(transitionIds.filter((id) => id.startsWith("CON-"))),
    sorted(expectedConIds),
  );

  // A matriz de estados define CON-10 para a ETP-07; por isso a baseline
  // seleciona somente CON-01–09, como determinado pela matriz executável.
  for (const transitionId of [...expectedUiIds, ...expectedConIds]) {
    assert.match(stateMatrix, new RegExp(`^\\| ${transitionId} \\|`, "mu"));
  }

  const assignedRows = [
    ...executableMatrix.matchAll(
      /^\| (TST-(?:UI|CON)-[0-9]+A?) \| ((?:UI|CON)-[0-9]+A?) \|[^\r\n]*\| ETP-00 \|/gmu,
    ),
  ].map((match) => ({ caseId: match[1], transitionId: match[2] }));
  assert.deepEqual(
    assignedRows,
    report.cases.map(({ caseId, transitionId }) => ({ caseId, transitionId })),
  );
});

test("cada referência automatizada aponta para arquivo e âncora existentes", async () => {
  const report = await loadReport();
  const catalogEntries = Object.entries(report.evidenceCatalog);
  const sourceByEvidence = new Map();

  await Promise.all(
    catalogEntries.map(async ([evidenceId, evidence]) => {
      const source = await readFile(resolve(root, evidence.file), "utf8");
      assert.ok(
        source.includes(evidence.anchor),
        `${evidenceId} não encontrou a âncora declarada em ${evidence.file}`,
      );
      sourceByEvidence.set(evidenceId, source);
    }),
  );

  for (const item of report.cases) {
    assert.equal(item.caseId, `TST-${item.transitionId}`);
    assert.ok(item.evidenceRefs.length > 0);
    for (const evidenceRef of item.evidenceRefs) {
      assert.ok(
        sourceByEvidence.has(evidenceRef),
        `${item.caseId} referencia evidência inexistente: ${evidenceRef}`,
      );
    }

    const selectors = item.selectors ?? (item.selector ? [item.selector] : []);
    if (selectors.length > 0) {
      const sources = item.evidenceRefs.map((id) => sourceByEvidence.get(id));
      for (const selector of selectors) {
        assert.ok(
          sources.some((source) => source.includes(`"${selector}"`)),
          `${item.caseId} não possui o seletor ${selector} no teste declarado`,
        );
      }
    }
    if (item.coverage === "PARCIAL") {
      assert.ok(
        Array.isArray(item.gaps) && item.gaps.length > 0,
        `${item.caseId} precisa declarar sua lacuna real`,
      );
    }
  }
});

test("o resumo é derivado dos 37 itens e não fabrica aprovação", async () => {
  const report = await loadReport();
  const uiCases = report.cases.filter((item) =>
    item.transitionId.startsWith("UI-"),
  );
  const concurrencyCases = report.cases.filter((item) =>
    item.transitionId.startsWith("CON-"),
  );

  assert.deepEqual(report.summary.ui, countCoverage(uiCases));
  assert.deepEqual(report.summary.concurrency, countCoverage(concurrencyCases));
  assert.deepEqual(report.summary.total, countCoverage(report.cases));
  assert.equal(Object.hasOwn(report, "approval"), false);
  assert.equal(Object.hasOwn(report, "executionResult"), false);
});
