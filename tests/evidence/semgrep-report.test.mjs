import assert from "node:assert/strict";
import test from "node:test";

import { attachSemgrepRuleSnapshot } from "../../scripts/finalize-semgrep-report.mjs";

test("vincula o relatorio SAST aos snapshots locais imutaveis", async () => {
  const report = await attachSemgrepRuleSnapshot({
    version: "1.172.0",
    results: [
      {
        check_id: "typescript.exemplo",
        path: "apps/api/src/exemplo.ts",
        start: { line: 10, col: 2, offset: 100 },
        end: { line: 10, col: 20, offset: 118 },
        extra: {
          severity: "ERROR",
          message: "CANARIO_NAO_PERSISTIR",
          lines: "segredo=CANARIO_NAO_PERSISTIR",
          metavars: { $VALOR: { abstract_content: "CANARIO_NAO_PERSISTIR" } },
          dataflow_trace: { taint_source: "CANARIO_NAO_PERSISTIR" },
        },
      },
    ],
    errors: [],
    paths: { scanned: ["apps/api/src/app.module.ts"] },
  });
  assert.equal(report.portalDpRuleSnapshot.status, "VERIFICADO");
  assert.equal(report.portalDpRuleSnapshot.uniqueRuleIds, 563);
  assert.equal(report.portalDpRuleSnapshot.networkUsedDuringScan, false);
  assert.deepEqual(
    report.portalDpRuleSnapshot.snapshots.map((item) => item.rules),
    [36, 560, 74],
  );
  assert.deepEqual(report.results, [
    {
      checkId: "typescript.exemplo",
      severity: "ERROR",
      path: "apps/api/src/exemplo.ts",
      start: { line: 10, col: 2 },
      end: { line: 10, col: 20 },
    },
  ]);
  assert.equal(JSON.stringify(report).includes("CANARIO_NAO_PERSISTIR"), false);
  assert.equal(report.redaction.status, "APLICADA");
});
