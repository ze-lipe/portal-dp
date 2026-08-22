import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const sourcePath = resolve(
  root,
  "documentacao/referencias/OWASP_Application_Security_Verification_Standard_5.0.0_en.flat.json",
);
const manifestPath = resolve(
  root,
  "evidencias/manifests/asvs-applicability-v5.0.0.json",
);
const evidencePath = resolve(
  root,
  "evidencias/manifests/asvs-evidence-index-v5.0.0.json",
);

const expectedHash =
  "8201b20eec2908c3380ac600c91c8ba746346fbb808859366abb232027532311";
const technologyAbsent = new Map([
  [
    "V9",
    "A arquitetura aprovada nao usa tokens autocontidos. Se isso mudar, o controle volta para avaliacao.",
  ],
  [
    "V10",
    "A arquitetura aprovada nao usa OAuth nem OIDC. Se isso mudar, o controle volta para avaliacao.",
  ],
  [
    "V17",
    "A arquitetura aprovada nao usa WebRTC. Se isso mudar, o controle volta para avaliacao.",
  ],
]);
const additionalRiskSelected = new Map([
  [
    "V1.2.10",
    "Controle L3 selecionado por risco porque exportacoes XLSX/Excel estao no escopo funcional aprovado.",
  ],
]);

const controlOwners = {
  V1: ["QAT-SEC-032", "QAT-SEC-035"],
  V2: ["QAT-SEC-032", "TST-API-010"],
  V3: ["QAT-SEC-032", "TST-UI-01"],
  V4: ["TST-API-020", "QAT-SEC-032"],
  V5: ["QAT-SEC-032", "QAT-SEC-006"],
  V6: ["QAT-SEC-006", "QAT-SEC-037"],
  V7: ["QAT-SEC-007", "QAT-SEC-037"],
  V8: ["QAT-SEC-006", "TST-API-001"],
  V11: ["QAT-SEC-023", "QAT-RES-009"],
  V12: ["QAT-SEC-037", "TST-API-020"],
  V13: ["QAT-SEC-021", "QAT-SEC-037"],
  V14: ["QAT-SEC-034", "QAT-SEC-006"],
  V15: ["QAT-SEC-035", "QAT-SEC-032"],
  V16: ["QAT-AUD-007", "TST-API-020"],
};
const controlOwnersById = {
  "V1.2.10": ["QAT-SEC-013", "TST-EXP-01"],
};

function versionedId(requirementId) {
  return `v5.0.0-${requirementId.replace(/^V/, "")}`;
}

function evidenceId(requirementId) {
  return `EVD-ASVS-${requirementId.replaceAll(".", "-").toUpperCase()}`;
}

function classify(requirement) {
  const absentReason = technologyAbsent.get(requirement.chapter_id);
  if (absentReason) {
    return {
      profileSelected: false,
      situation: "NAO_APLICAVEL",
      justification: absentReason,
    };
  }

  const additionalReason = additionalRiskSelected.get(requirement.req_id);
  if (additionalReason) {
    return {
      profileSelected: true,
      situation: "APLICAVEL",
      justification: additionalReason,
    };
  }

  if (requirement.L === "3") {
    return {
      profileSelected: false,
      situation: "NAO_APLICAVEL",
      justification:
        "Controle adicional L3 fora do perfil inicial L1 mais L2 por risco; requer confirmacao de Seguranca e reavaliacao se risco ou arquitetura mudar.",
    };
  }

  return {
    profileSelected: true,
    situation: "APLICAVEL",
    justification:
      requirement.L === "1"
        ? "Controle L1 incluido no perfil inicial."
        : "Controle L2 selecionado por risco devido a dados pessoais, multiempresa, autorizacao, arquivos, criptografia ou auditoria.",
  };
}

const source = await readFile(sourcePath);
const sourceHash = createHash("sha256").update(source).digest("hex");
if (sourceHash !== expectedHash) {
  throw new Error(`ASVS source hash mismatch: ${sourceHash}`);
}

const parsed = JSON.parse(source.toString("utf8"));
if (!Array.isArray(parsed.requirements) || parsed.requirements.length !== 345) {
  throw new Error("ASVS source must contain exactly 345 requirements");
}

const controls = parsed.requirements.map((requirement) => {
  const classification = classify(requirement);
  const cases = classification.profileSelected
    ? (controlOwnersById[requirement.req_id] ??
      controlOwners[requirement.chapter_id] ?? ["QAT-SEC-028"])
    : [];
  const evidence = evidenceId(requirement.req_id);

  return {
    asvsId: versionedId(requirement.req_id),
    sourceId: requirement.req_id,
    chapter: requirement.chapter_id,
    level: `L${requirement.L}`,
    title: requirement.req_description,
    ...classification,
    ownerCase: cases[0] ?? null,
    complementaryCases: cases.slice(1),
    evidenceId: classification.profileSelected ? evidence : null,
    responsible: "SEG — titular nominal a definir antes da producao",
    result: classification.profileSelected ? "BLOQUEADO" : "BLOQUEADO",
    defectOrRisk: classification.profileSelected
      ? "Controle ainda nao executado; evidencias serao produzidas nas etapas e gates proprietarios."
      : "Classificacao aguarda aprovacao nominal de Seguranca antes do primeiro commit de producao.",
  };
});

const selectedL2 = controls
  .filter((control) => control.level === "L2" && control.profileSelected)
  .map((control) => control.asvsId);
const selectedAdditional = controls
  .filter((control) => control.level === "L3" && control.profileSelected)
  .map((control) => control.asvsId);

const manifest = {
  schemaVersion: 1,
  manifestId: "QAT-SEC-028-ASVS-5.0.0-ETP00",
  generatedAt: "2026-08-22T00:00:00.000Z",
  source: {
    name: "OWASP Application Security Verification Standard 5.0.0",
    sha256: sourceHash,
    totalControls: 345,
    l1Controls: 70,
  },
  profile: {
    name: "Portal DP — L1 aplicavel, L2 selecionado e adicionais por risco",
    selectionRule:
      "L1 e L2, exceto tecnologias ausentes; L3 fora do perfil inicial e sujeito a reavaliacao.",
    selectedL2,
    selectedAdditional,
  },
  approval: {
    status: "AGUARDA_APROVACAO_SEGURANCA",
    responsible: null,
    approvedAt: null,
    subjectSha256: null,
    note: "Obrigatorio aprovar antes do primeiro commit classificado como codigo de producao.",
  },
  controls,
};
manifest.approvalSubjectSha256 = createHash("sha256")
  .update(
    JSON.stringify({
      schemaVersion: manifest.schemaVersion,
      manifestId: manifest.manifestId,
      source: manifest.source,
      profile: manifest.profile,
      controls: manifest.controls,
    }),
  )
  .digest("hex");

const evidenceIndex = {
  schemaVersion: 1,
  manifestId: manifest.manifestId,
  generatedAt: manifest.generatedAt,
  records: controls
    .filter((control) => control.profileSelected)
    .map((control) => ({
      evidenceId: control.evidenceId,
      asvsId: control.asvsId,
      status: "PLANEJADA",
      result: "BLOQUEADO",
      artifactSha256: null,
      producedAt: null,
      responsible: control.responsible,
    })),
};

await mkdir(dirname(manifestPath), { recursive: true });
await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
await writeFile(
  evidencePath,
  `${JSON.stringify(evidenceIndex, null, 2)}\n`,
  "utf8",
);

console.log(
  JSON.stringify({
    manifestPath,
    evidencePath,
    total: controls.length,
    selectedL2: selectedL2.length,
    selectedAdditional: selectedAdditional.length,
    approval: manifest.approval.status,
  }),
);
