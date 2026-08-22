import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const expectedSnapshots = [
  {
    id: "nodejs",
    source: "https://semgrep.dev/c/p/nodejs",
    path: "security/semgrep/registry-snapshots/nodejs.json",
    sha256: "eb9ce79ff8974938061ec2ab0bb1e8c20a17372458cfaa4e8bcb24ac7e22a41f",
    rules: 36,
  },
  {
    id: "owasp-top-ten",
    source: "https://semgrep.dev/c/p/owasp-top-ten",
    path: "security/semgrep/registry-snapshots/owasp-top-ten.json",
    sha256: "1fff4cefffa4debfe8e4f61cf1a8b1b022d98b72b1a9d72d4eeef8a5eeaa8a53",
    rules: 560,
  },
  {
    id: "typescript",
    source: "https://semgrep.dev/c/p/typescript",
    path: "security/semgrep/registry-snapshots/typescript.json",
    sha256: "6248ea7477e6da0db10305c0281f7cd908485691747f4fd641275145075f3b22",
    rules: 74,
  },
];

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

export async function attachSemgrepRuleSnapshot(report) {
  if (!report || typeof report !== "object" || Array.isArray(report)) {
    throw new Error("relatorio bruto do Semgrep deve ser um objeto JSON");
  }
  const uniqueRuleIds = new Set();
  const snapshots = [];
  for (const expected of expectedSnapshots) {
    const bytes = await readFile(resolve(root, expected.path));
    if (sha256(bytes) !== expected.sha256) {
      throw new Error(`hash do snapshot Semgrep ${expected.id} divergiu`);
    }
    const snapshot = JSON.parse(bytes.toString("utf8"));
    if (
      !Array.isArray(snapshot.rules) ||
      snapshot.rules.length !== expected.rules
    ) {
      throw new Error(`quantidade de regras ${expected.id} divergiu`);
    }
    for (const rule of snapshot.rules) {
      if (typeof rule?.id !== "string" || rule.id === "") {
        throw new Error(`snapshot ${expected.id} contem ID de regra invalido`);
      }
      uniqueRuleIds.add(rule.id);
    }
    snapshots.push({ ...expected });
  }
  if (uniqueRuleIds.size !== 563) {
    throw new Error("uniao dos snapshots Semgrep divergiu de 563 IDs");
  }
  if (
    !Array.isArray(report.results) ||
    !Array.isArray(report.errors) ||
    !Array.isArray(report.paths?.scanned)
  ) {
    throw new Error("relatorio bruto do Semgrep possui estrutura invalida");
  }
  const position = (value) => ({
    line: Number(value?.line),
    col: Number(value?.col),
  });
  return {
    version: typeof report.version === "string" ? report.version : null,
    results: report.results.map((finding) => ({
      checkId: String(finding?.check_id ?? ""),
      severity: String(finding?.extra?.severity ?? ""),
      path: String(finding?.path ?? ""),
      start: position(finding?.start),
      end: position(finding?.end),
    })),
    errors: report.errors.map((error) => ({
      code: error?.code ?? null,
      level: typeof error?.level === "string" ? error.level : null,
      type: typeof error?.type === "string" ? error.type : null,
    })),
    paths: {
      scanned: report.paths.scanned.map((path) => String(path)),
    },
    redaction: {
      status: "APLICADA",
      policy: "SEMGREP_FINDINGS_ALLOWLIST_V1",
      excluded:
        "codigo-fonte, linhas, metavariaveis, traces, contexto, fingerprint e campos desconhecidos",
    },
    portalDpRuleSnapshot: {
      status: "VERIFICADO",
      capturedAt: "2026-08-22",
      uniqueRuleIds: uniqueRuleIds.size,
      snapshots,
      networkUsedDuringScan: false,
    },
  };
}

async function main() {
  const input = resolve(root, "evidencias/resultados/sast-semgrep.raw.json");
  const output = resolve(root, "evidencias/resultados/sast-semgrep.json");
  const report = JSON.parse(await readFile(input, "utf8"));
  const finalized = await attachSemgrepRuleSnapshot(report);
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, `${JSON.stringify(finalized, null, 2)}\n`, {
    flag: "wx",
  });
  process.stdout.write(
    `${JSON.stringify({ written: "evidencias/resultados/sast-semgrep.json" })}\n`,
  );
}

if (resolve(process.argv[1] ?? "") === resolve(import.meta.filename)) {
  await main();
}
