import { execFile } from "node:child_process";
import { lstat, readFile, realpath } from "node:fs/promises";
import { isAbsolute, relative, resolve, sep } from "node:path";
import { promisify } from "node:util";

import { sha256File, validateEvidenceRun } from "./evidence-repository.mjs";

const execute = promisify(execFile);
const root = resolve(import.meta.dirname, "..");
const hashPattern = /^[a-f0-9]{64}$/u;
const requiredBacklogItemIds = [
  ...Array.from(
    { length: 15 },
    (_, index) => `BK-${String(index + 1).padStart(3, "0")}`,
  ),
  "BK-077",
  "BK-320",
  "BK-331",
  "BK-360",
  "BK-361",
  "BK-363",
].sort();
const requiredGateIds = ["GAT-01", "GAT-02"];
const requiredHomologationAreas = [
  "ENGENHARIA_E_SEGURANCA",
  "RESPONSAVEL_DE_PRODUTO",
];
const requiredGithubJobs = [
  "planning-windows",
  "code-and-postgres",
  "secret-scan",
  "sast",
  "oci-image",
].sort();
const canonicalUiCoveragePath = resolve(
  root,
  "evidencias/manifests/etp00-ui-con-coverage-v1.json",
);
const canonicalAsvsStagePath = resolve(
  root,
  "evidencias/manifests/asvs-stage-gates-v5.0.0.json",
);
const canonicalBindingsPath = resolve(
  root,
  "evidencias/manifests/evidence-bindings-etp00-v1.json",
);

function argument(name) {
  const index = process.argv.indexOf(`--${name}`);
  return index === -1 ? undefined : process.argv[index + 1];
}

const manifestPath = resolve(
  argument("manifest") ?? "evidencias/manifests/etp00-acceptance-v1.json",
);
const allowPending = process.argv.includes("--allow-pending");
const errors = [];

function fail(message) {
  errors.push(message);
}

function object(value, field) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    fail(`${field} deve ser um objeto`);
    return {};
  }
  return value;
}

function text(value, field) {
  if (typeof value !== "string" || value.trim() === "") {
    fail(`${field} deve ser um texto nao vazio`);
    return null;
  }
  return value.trim();
}

function hash(value, field) {
  if (typeof value !== "string" || !hashPattern.test(value)) {
    fail(`${field} deve ser um SHA-256 minusculo`);
    return null;
  }
  return value;
}

function instant(value, field) {
  const parsed = text(value, field);
  if (
    parsed &&
    (Number.isNaN(Date.parse(parsed)) ||
      new Date(parsed).toISOString() !== parsed)
  ) {
    fail(`${field} deve ser um instante ISO UTC canonico`);
    return null;
  }
  return parsed;
}

function sortedStrings(value, field, { allowEmpty = false } = {}) {
  if (!Array.isArray(value)) {
    fail(`${field} deve ser uma lista`);
    return [];
  }
  const parsed = value
    .map((item, index) => text(item, `${field}[${index}]`))
    .filter(Boolean);
  if (!allowEmpty && parsed.length === 0) {
    fail(`${field} nao pode ficar vazio`);
  }
  if (new Set(parsed).size !== parsed.length) {
    fail(`${field} nao pode conter duplicidades`);
  }
  const sorted = [...parsed].sort();
  if (JSON.stringify(parsed) !== JSON.stringify(sorted)) {
    fail(`${field} deve permanecer em ordem lexicografica`);
  }
  return sorted;
}

function sameList(actual, expected, field) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    fail(`${field} diverge do escopo normativo da ETP-00`);
  }
}

function sameObject(actual, expected, field) {
  const entries = (value) =>
    Object.fromEntries(
      Object.entries(value ?? {}).sort(([a], [b]) => a.localeCompare(b)),
    );
  if (JSON.stringify(entries(actual)) !== JSON.stringify(entries(expected))) {
    fail(`${field} diverge do manifesto de execucao`);
  }
}

function repositoryPath(value, field) {
  const parsed = text(value, field);
  if (!parsed || isAbsolute(parsed)) {
    if (parsed) fail(`${field} deve ser relativo ao repositorio`);
    return null;
  }
  const path = resolve(root, parsed);
  const rel = relative(root, path);
  if (
    rel === "" ||
    rel === ".." ||
    rel.startsWith(`..${sep}`) ||
    isAbsolute(rel)
  ) {
    fail(`${field} aponta para fora do repositorio`);
    return null;
  }
  return path;
}

async function readJson(path, field) {
  try {
    await assertSafeFile(path, field);
    return JSON.parse(await readFile(path, "utf8"));
  } catch (error) {
    fail(`${field} nao pode ser lido: ${error.message}`);
    return {};
  }
}

async function assertSafeFile(path, field) {
  const details = await lstat(path);
  if (!details.isFile() || details.isSymbolicLink()) {
    throw new Error(`${field} deve ser um arquivo regular, nunca um link`);
  }
  const canonical = await realpath(path);
  const rel = relative(root, canonical);
  if (
    rel === "" ||
    rel === ".." ||
    rel.startsWith(`..${sep}`) ||
    isAbsolute(rel)
  ) {
    throw new Error(`${field} resolve para fora do repositorio`);
  }
}

async function expectedDocumentCaseIds(references) {
  const declaredUiPath = repositoryPath(
    references.uiConCoveragePath,
    "references.uiConCoveragePath",
  );
  repositoryPath(
    references.asvsStageGatesPath,
    "references.asvsStageGatesPath",
  );
  const declaredBindingsPath = repositoryPath(
    references.evidenceBindingsPath,
    "references.evidenceBindingsPath",
  );
  if (declaredUiPath !== canonicalUiCoveragePath) {
    fail("references.uiConCoveragePath deve apontar para o catalogo canonico");
  }
  if (declaredBindingsPath !== canonicalBindingsPath) {
    fail(
      "references.evidenceBindingsPath deve apontar para o catalogo canonico",
    );
  }
  // O escopo esperado sempre nasce dos catálogos canônicos. Um manifesto de
  // execução não pode redefinir os IDs obrigatórios apontando para outro arquivo.
  const [uiCoverage, stageGates] = await Promise.all([
    readJson(canonicalUiCoveragePath, "inventario UI/CON"),
    readJson(canonicalAsvsStagePath, "manifesto de gates ASVS"),
  ]);
  const uiCases = Array.isArray(uiCoverage.cases)
    ? uiCoverage.cases.map((item) => item.caseId)
    : [];
  const etp00 = Array.isArray(stageGates.stageGates)
    ? stageGates.stageGates.find((gate) => gate.stage === "ETP-00")
    : null;
  const asvsCases = Array.isArray(etp00?.requiredCaseIds)
    ? etp00.requiredCaseIds
    : [];
  if (uiCases.length !== 37) {
    fail("o inventario UI/CON deve conter os 37 casos da ETP-00");
  }
  if (asvsCases.length !== 10) {
    fail(
      "o gate ASVS deve conter somente as 10 contribuicoes tecnicas executaveis da ETP-00",
    );
  }
  const result = [...new Set([...uiCases, ...asvsCases])].sort();
  if (result.length !== uiCases.length + asvsCases.length) {
    fail("os catalogos documentais da ETP-00 contem IDs duplicados");
  }
  return result;
}

function validatePending(manifest) {
  if (manifest.manifestId !== "ACE-ETP-00-PENDENTE") {
    fail("o template pendente deve manter manifestId ACE-ETP-00-PENDENTE");
  }
  const nullableValues = [
    ...Object.values(
      object(
        manifest.evidence?.applicationArtifact,
        "evidence.applicationArtifact",
      ),
    ),
    manifest.evidence?.runManifestPath,
    manifest.evidence?.runManifestSha256,
    manifest.evidence?.bindingCatalogSha256,
    manifest.versions?.application,
    manifest.versions?.schema?.version,
    manifest.versions?.schema?.migrationsSha256,
    manifest.versions?.fixture?.version,
    manifest.versions?.fixture?.sha256,
    ...Object.entries(object(manifest.environment, "environment"))
      .filter(([key]) => key !== "dataKind")
      .map(([, value]) => value),
    manifest.decision?.decidedAt,
    manifest.decision?.decidedBy,
    manifest.decision?.conclusion,
  ];
  if (nullableValues.some((value) => value !== null)) {
    fail(
      "o template pendente nao pode antecipar hash, versao, execucao ou decisao",
    );
  }
  if (
    manifest.status !== "PENDENTE" ||
    manifest.decision?.status !== "PENDENTE" ||
    manifest.results?.measurements?.status !== "PENDENTE" ||
    manifest.residuals?.reviewed !== false
  ) {
    fail("o template deve permanecer explicitamente PENDENTE e nao revisado");
  }
  for (const [field, value] of [
    [
      "coverage.verifiedBacklogItemIds",
      manifest.coverage?.verifiedBacklogItemIds,
    ],
    [
      "coverage.verifiedDocumentCaseIds",
      manifest.coverage?.verifiedDocumentCaseIds,
    ],
    ["results.measurements.entries", manifest.results?.measurements?.entries],
    ["residuals.defects", manifest.residuals?.defects],
    ["residuals.risks", manifest.residuals?.risks],
    ["homologations", manifest.homologations],
  ]) {
    if (!Array.isArray(value) || value.length !== 0) {
      fail(`${field} deve ficar vazio enquanto o aceite estiver pendente`);
    }
  }
  if (
    !manifest.results?.jobOutcomes ||
    Object.keys(manifest.results.jobOutcomes).length !== 0
  ) {
    fail("results.jobOutcomes deve ficar vazio enquanto nao houver CI real");
  }
  const gates = Array.isArray(manifest.results?.gates)
    ? manifest.results.gates
    : [];
  sameList(
    gates.map((gate) => gate.gateId).sort(),
    requiredGateIds,
    "results.gates[].gateId",
  );
  if (
    gates.length !== 2 ||
    gates.some(
      (gate) =>
        gate.status !== "NAO_EXECUTADO" ||
        gate.notes !== null ||
        !Array.isArray(gate.evidenceArtifactIds) ||
        gate.evidenceArtifactIds.length !== 0,
    )
  ) {
    fail("GAT-01 e GAT-02 devem permanecer NAO_EXECUTADO no template");
  }
  if (manifest.environment?.dataKind !== "SINTETICA") {
    fail("environment.dataKind deve ser SINTETICA");
  }
}

function validateResiduals(residuals, homologatorNames) {
  if (residuals.reviewed !== true) {
    fail("residuals.reviewed deve ser verdadeiro antes do aceite");
  }
  if (!Array.isArray(residuals.defects)) {
    fail("residuals.defects deve ser uma lista, mesmo quando vazia");
  }
  const defects = Array.isArray(residuals.defects) ? residuals.defects : [];
  const defectIds = new Set();
  for (const [index, defect] of defects.entries()) {
    const field = `residuals.defects[${index}]`;
    const id = text(defect.id, `${field}.id`);
    if (id && defectIds.has(id)) fail(`${field}.id esta duplicado`);
    if (id) defectIds.add(id);
    if (!["SEV-0", "SEV-1", "SEV-2", "SEV-3"].includes(defect.severity)) {
      fail(`${field}.severity e invalida`);
    }
    if (!["ABERTO", "MITIGADO", "ENCERRADO"].includes(defect.status)) {
      fail(`${field}.status e invalido`);
    }
    text(defect.description, `${field}.description`);
    text(defect.owner, `${field}.owner`);
    if (
      ["SEV-0", "SEV-1"].includes(defect.severity) &&
      defect.status !== "ENCERRADO"
    ) {
      fail(`${field} bloqueia o aceite por severidade ${defect.severity}`);
    }
  }

  if (!Array.isArray(residuals.risks)) {
    fail("residuals.risks deve ser uma lista, mesmo quando vazia");
  }
  const risks = Array.isArray(residuals.risks) ? residuals.risks : [];
  const riskIds = new Set();
  for (const [index, risk] of risks.entries()) {
    const field = `residuals.risks[${index}]`;
    const id = text(risk.id, `${field}.id`);
    if (id && riskIds.has(id)) fail(`${field}.id esta duplicado`);
    if (id) riskIds.add(id);
    text(risk.description, `${field}.description`);
    text(risk.owner, `${field}.owner`);
    text(risk.treatment, `${field}.treatment`);
    if (!["ACEITO", "MITIGADO", "ENCERRADO"].includes(risk.decision)) {
      fail(`${field}.decision e invalida`);
    }
    const acceptedBy = text(risk.acceptedBy, `${field}.acceptedBy`);
    if (acceptedBy && !homologatorNames.has(acceptedBy)) {
      fail(`${field}.acceptedBy nao e um homologador deste aceite`);
    }
  }
}

async function validateApproved(manifest, expectedCases) {
  const evidence = object(manifest.evidence, "evidence");
  const runManifestPath = repositoryPath(
    evidence.runManifestPath,
    "evidence.runManifestPath",
  );
  const expectedRunHash = hash(
    evidence.runManifestSha256,
    "evidence.runManifestSha256",
  );
  const expectedBindingsHash = hash(
    evidence.bindingCatalogSha256,
    "evidence.bindingCatalogSha256",
  );
  if (!runManifestPath || !expectedRunHash || !expectedBindingsHash) return;

  let checked;
  try {
    await assertSafeFile(runManifestPath, "evidence.runManifestPath");
    checked = await validateEvidenceRun({
      manifestPath: runManifestPath,
      requireTechnicalComplete: true,
      bindingsPath: canonicalBindingsPath,
    });
  } catch (error) {
    fail(`o pacote de evidencias referenciado e invalido: ${error.message}`);
    return;
  }
  const actualRunHash = await sha256File(runManifestPath);
  if (actualRunHash !== expectedRunHash) {
    fail("evidence.runManifestSha256 nao confere com o arquivo referenciado");
  }
  const actualBindingsHash = await sha256File(canonicalBindingsPath);
  if (
    expectedBindingsHash !== actualBindingsHash ||
    checked.manifest.caseBindings?.sha256 !== actualBindingsHash
  ) {
    fail(
      "evidence.bindingCatalogSha256 diverge do catalogo canonico ou da execucao",
    );
  }
  const run = checked.manifest;
  const runPathWithinRepository = relative(root, runManifestPath)
    .split(sep)
    .join("/");
  if (
    run.execution?.metadata?.syntheticTest === true ||
    /TESTE|TEST|FIXTURE/iu.test(run.responsible?.role ?? "") ||
    runPathWithinRepository === "tmp" ||
    runPathWithinRepository.startsWith("tmp/") ||
    (run.artifacts ?? []).some(
      (artifact) =>
        artifact.sourcePath === "tmp" || artifact.sourcePath.startsWith("tmp/"),
    )
  ) {
    fail(
      "um aceite aprovado nao pode usar bypass sintetico, papel de teste ou artefato temporario",
    );
  }
  if (run.scope !== "ETP-00")
    fail("o pacote de evidencias nao pertence a ETP-00");
  if (run.execution?.provider !== "github-actions") {
    fail("o aceite exige a execucao completa do pipeline GitHub Actions");
  }
  const githubRunMatch = /^gh-(\d+)-(\d+)$/u.exec(run.runId ?? "");
  const runUrlText = run.execution?.metadata?.runUrl;
  let runUrl = null;
  try {
    runUrl = new URL(runUrlText);
  } catch {
    fail("o pacote deve registrar a URL canonica da execucao GitHub");
  }
  if (
    !githubRunMatch ||
    run.execution?.metadata?.githubRunId !== githubRunMatch?.[1] ||
    run.execution?.metadata?.githubRunAttempt !== githubRunMatch?.[2] ||
    run.execution?.attempt !== githubRunMatch?.[2] ||
    runUrl?.origin !== "https://github.com" ||
    runUrl?.username !== "" ||
    runUrl?.password !== "" ||
    runUrl?.search !== "" ||
    runUrl?.hash !== "" ||
    runUrl?.pathname !==
      `/${run.execution?.repository}/actions/runs/${githubRunMatch?.[1]}/attempts/${githubRunMatch?.[2]}`
  ) {
    fail(
      "a origem canonica GitHub diverge do host, run-id, tentativa ou repositorio",
    );
  }
  const workflowPrefix = `${run.execution?.repository}/.github/workflows/ci.yml@`;
  if (
    typeof run.execution?.workflow !== "string" ||
    !run.execution.workflow.startsWith(workflowPrefix) ||
    run.execution.workflow.length === workflowPrefix.length
  ) {
    fail(
      "a execucao nao pertence ao workflow canonico .github/workflows/ci.yml",
    );
  }
  sameList(
    [...(run.completeness?.requiredExecutionJobs ?? [])].sort(),
    requiredGithubJobs,
    "completeness.requiredExecutionJobs",
  );
  if (
    run.completeness?.transportSatisfied !== true ||
    run.completeness?.executionSatisfied !== true ||
    !Array.isArray(run.completeness?.requirements) ||
    run.completeness.requirements.some((item) => item.satisfied !== true)
  ) {
    fail(
      "o pacote nao comprova transporte, jobs e artefatos obrigatorios da etapa",
    );
  }

  const artifact = object(
    evidence.applicationArtifact,
    "evidence.applicationArtifact",
  );
  const artifactId = text(
    artifact.artifactId,
    "evidence.applicationArtifact.artifactId",
  );
  const sourcePath = text(
    artifact.sourcePath,
    "evidence.applicationArtifact.sourcePath",
  );
  const artifactHash = hash(
    artifact.sha256,
    "evidence.applicationArtifact.sha256",
  );
  const sealedArtifact = run.artifacts?.find(
    (candidate) => candidate.artifactId === artifactId,
  );
  if (!sealedArtifact) {
    fail("o artefato da aplicacao nao existe no pacote selado");
  } else {
    if (sealedArtifact.sourcePath !== sourcePath) {
      fail("o caminho do artefato diverge do pacote selado");
    }
    if (sealedArtifact.sha256 !== artifactHash) {
      fail("o hash do artefato diverge do pacote selado");
    }
    if (!sealedArtifact.sourcePath.endsWith("portal-dp.oci.tar")) {
      fail("o artefato de aplicacao deve ser a imagem OCI portal-dp.oci.tar");
    }
  }

  const versions = object(manifest.versions, "versions");
  if (
    text(versions.application, "versions.application") !==
    run.versions?.application
  ) {
    fail("versions.application diverge do pacote selado");
  }
  const schema = object(versions.schema, "versions.schema");
  if (
    text(schema.version, "versions.schema.version") !==
    run.versions?.schema?.version
  ) {
    fail("versions.schema.version diverge do pacote selado");
  }
  if (
    hash(schema.migrationsSha256, "versions.schema.migrationsSha256") !==
    run.versions?.schema?.sha256
  ) {
    fail("versions.schema.migrationsSha256 diverge do pacote selado");
  }
  const fixture = object(versions.fixture, "versions.fixture");
  if (
    text(fixture.version, "versions.fixture.version") !==
    run.versions?.fixture?.version
  ) {
    fail("versions.fixture.version diverge do pacote selado");
  }
  if (
    hash(fixture.sha256, "versions.fixture.sha256") !==
    run.versions?.fixture?.sha256
  ) {
    fail("versions.fixture.sha256 diverge do pacote selado");
  }

  const coverage = object(manifest.coverage, "coverage");
  sameList(
    sortedStrings(
      coverage.verifiedBacklogItemIds,
      "coverage.verifiedBacklogItemIds",
    ),
    requiredBacklogItemIds,
    "coverage.verifiedBacklogItemIds",
  );
  sameList(
    sortedStrings(
      coverage.verifiedDocumentCaseIds,
      "coverage.verifiedDocumentCaseIds",
    ),
    expectedCases,
    "coverage.verifiedDocumentCaseIds",
  );

  const results = object(manifest.results, "results");
  const outcomes = object(results.jobOutcomes, "results.jobOutcomes");
  sameObject(outcomes, run.execution?.outcomes, "results.jobOutcomes");
  for (const job of requiredGithubJobs) {
    if (outcomes[job] !== "success") fail(`o job ${job} nao foi aprovado`);
  }
  const artifactsById = new Map(
    (run.artifacts ?? []).map((item) => [item.artifactId, item]),
  );
  const gates = Array.isArray(results.gates) ? results.gates : [];
  const gateIds = sortedStrings(
    gates.map((gate) => gate.gateId),
    "results.gates[].gateId",
  );
  sameList(gateIds, requiredGateIds, "results.gates[].gateId");
  for (const [index, gate] of gates.entries()) {
    const field = `results.gates[${index}]`;
    if (gate.status !== "APROVADO") fail(`${field}.status deve ser APROVADO`);
    text(gate.notes, `${field}.notes`);
    const artifactIds = sortedStrings(
      gate.evidenceArtifactIds,
      `${field}.evidenceArtifactIds`,
    );
    for (const id of artifactIds) {
      const linked = artifactsById.get(id);
      if (!linked) {
        fail(`${field} referencia artefato inexistente ${id}`);
      } else if (!linked.caseIds?.includes(gate.gateId)) {
        fail(`${field} referencia artefato sem vinculo ao ${gate.gateId}`);
      }
    }
  }

  const measurements = object(results.measurements, "results.measurements");
  if (measurements.status !== "REVISADO") {
    fail("results.measurements.status deve ser REVISADO");
  }
  const measurementEntries = Array.isArray(measurements.entries)
    ? measurements.entries
    : [];
  if (measurementEntries.length === 0) {
    text(measurements.justification, "results.measurements.justification");
  }
  for (const [index, entry] of measurementEntries.entries()) {
    const field = `results.measurements.entries[${index}]`;
    text(entry.id, `${field}.id`);
    text(entry.description, `${field}.description`);
    if (
      !["string", "number"].includes(typeof entry.value) ||
      entry.value === ""
    ) {
      fail(`${field}.value deve registrar o valor medido`);
    }
    text(entry.unit, `${field}.unit`);
    if (entry.result !== "PASSOU") fail(`${field}.result deve ser PASSOU`);
    const linkedId = text(
      entry.evidenceArtifactId,
      `${field}.evidenceArtifactId`,
    );
    if (linkedId && !artifactsById.has(linkedId)) {
      fail(`${field}.evidenceArtifactId nao existe no pacote selado`);
    }
  }

  const environment = object(manifest.environment, "environment");
  for (const field of [
    "provider",
    "repository",
    "revision",
    "ref",
    "workflow",
    "attempt",
  ]) {
    if (
      text(environment[field], `environment.${field}`) !==
      run.execution?.[field]
    ) {
      fail(`environment.${field} diverge do pacote selado`);
    }
  }
  if (
    text(environment.runUrl, "environment.runUrl") !==
    run.execution?.metadata?.runUrl
  ) {
    fail("environment.runUrl diverge do pacote selado");
  }
  text(environment.databaseEngine, "environment.databaseEngine");
  text(environment.databaseVersion, "environment.databaseVersion");
  text(environment.containerPlatform, "environment.containerPlatform");
  if (environment.dataKind !== "SINTETICA") {
    fail("environment.dataKind deve ser SINTETICA");
  }

  const homologations = Array.isArray(manifest.homologations)
    ? manifest.homologations
    : [];
  const homologationAreas = sortedStrings(
    homologations.map((item) => item.area),
    "homologations[].area",
  );
  sameList(
    homologationAreas,
    requiredHomologationAreas,
    "homologations[].area",
  );
  const homologatorNames = new Set();
  const homologationInstants = [];
  for (const [index, approval] of homologations.entries()) {
    const field = `homologations[${index}]`;
    const name = text(approval.name, `${field}.name`);
    if (name) homologatorNames.add(name);
    text(approval.role, `${field}.role`);
    if (approval.decision !== "APROVADO") {
      fail(`${field}.decision deve ser APROVADO`);
    }
    if (approval.githubRunVerified !== true) {
      fail(`${field}.githubRunVerified deve confirmar a consulta externa`);
    }
    const approvedAt = instant(approval.approvedAt, `${field}.approvedAt`);
    if (approvedAt) homologationInstants.push(approvedAt);
    text(approval.observations, `${field}.observations`);
  }
  validateResiduals(object(manifest.residuals, "residuals"), homologatorNames);

  const decision = object(manifest.decision, "decision");
  if (decision.status !== "APROVADA") {
    fail("decision.status deve ser APROVADA");
  }
  const decidedAt = instant(decision.decidedAt, "decision.decidedAt");
  const decidedBy = text(decision.decidedBy, "decision.decidedBy");
  text(decision.conclusion, "decision.conclusion");
  if (decidedBy && !homologatorNames.has(decidedBy)) {
    fail("decision.decidedBy deve ser um homologador deste aceite");
  }
  if (
    decidedAt &&
    homologationInstants.some(
      (value) => Date.parse(value) > Date.parse(decidedAt),
    )
  ) {
    fail("decision.decidedAt nao pode anteceder uma homologacao obrigatoria");
  }
  if (decidedAt && Date.parse(decidedAt) < Date.parse(run.generatedAt)) {
    fail("a decisao nao pode anteceder a execucao de evidencias");
  }

  // O gate ASVS continua sendo a autoridade para as 10 contribuicoes
  // executaveis da ETP-00; os 13 casos integrais originais continuam
  // rastreados pela correcao de escopo e pelas etapas proprietarias futuras.
  const asvsStagePath = repositoryPath(
    manifest.references?.asvsStageGatesPath,
    "references.asvsStageGatesPath",
  );
  if (asvsStagePath) {
    try {
      await assertSafeFile(asvsStagePath, "references.asvsStageGatesPath");
      const asvsStage = JSON.parse(await readFile(asvsStagePath, "utf8"));
      if (
        asvsStage.evidenceRepository?.runManifestPath !==
          manifest.evidence.runManifestPath ||
        asvsStage.evidenceRepository?.runManifestSha256 !==
          manifest.evidence.runManifestSha256 ||
        asvsStage.evidenceRepository?.bindingCatalogPath !==
          manifest.references.evidenceBindingsPath ||
        asvsStage.evidenceRepository?.bindingCatalogSha256 !==
          manifest.evidence.bindingCatalogSha256
      ) {
        fail(
          "o gate ASVS e o aceite devem referenciar a mesma execucao selada e o mesmo catalogo canonico",
        );
      }
      await execute(process.execPath, [
        resolve(root, "scripts/validate-asvs-manifest.mjs"),
        "--require-stage",
        "ETP-00",
        "--stage-gates",
        asvsStagePath,
      ]);
    } catch (error) {
      fail(
        `o gate ASVS da ETP-00 nao foi concluido: ${error.stderr || error.message}`,
      );
    }
  }
}

const manifest = await readJson(manifestPath, "manifesto de aceite");
if (manifest.schemaVersion !== 1) fail("schemaVersion deve ser 1");
if (manifest.manifestType !== "ACEITE_DE_ETAPA") {
  fail("manifestType deve ser ACEITE_DE_ETAPA");
}
if (manifest.stage !== "ETP-00") fail("stage deve ser ETP-00");
if (!/^ACE-ETP-00-[A-Za-z0-9._-]+$/u.test(manifest.manifestId ?? "")) {
  fail("manifestId deve usar o prefixo ACE-ETP-00 e um sufixo seguro");
}
if (manifest.references?.document21Section !== "35.3") {
  fail("o aceite deve referenciar o Documento 21, secao 35.3");
}
if (manifest.references?.document22Decision !== "QLT-011") {
  fail("o aceite deve referenciar a decisao QLT-011 do Documento 22");
}

const scope = object(manifest.scope, "scope");
sameList(
  sortedStrings(scope.requiredGateIds, "scope.requiredGateIds"),
  requiredGateIds,
  "scope.requiredGateIds",
);
sameList(
  sortedStrings(scope.requiredBacklogItemIds, "scope.requiredBacklogItemIds"),
  requiredBacklogItemIds,
  "scope.requiredBacklogItemIds",
);
sameList(
  sortedStrings(
    scope.requiredHomologationAreas,
    "scope.requiredHomologationAreas",
  ),
  requiredHomologationAreas,
  "scope.requiredHomologationAreas",
);
const expectedCases = await expectedDocumentCaseIds(
  object(manifest.references, "references"),
);
sameList(
  sortedStrings(scope.requiredDocumentCaseIds, "scope.requiredDocumentCaseIds"),
  expectedCases,
  "scope.requiredDocumentCaseIds",
);

if (manifest.status === "PENDENTE") {
  validatePending(manifest);
  if (!allowPending) {
    fail(
      "a ETP-00 permanece pendente; use --allow-pending apenas para validar o template",
    );
  }
} else if (manifest.status === "APROVADA") {
  if (manifest.manifestId === "ACE-ETP-00-PENDENTE") {
    fail("um aceite aprovado deve receber um manifestId definitivo e imutavel");
  }
  await validateApproved(manifest, expectedCases);
} else if (manifest.status === "REJEITADA") {
  fail("a decisao registrada rejeita a ETP-00");
} else {
  fail("status deve ser PENDENTE, APROVADA ou REJEITADA");
}

if (errors.length > 0) {
  throw new Error(
    `Manifesto de aceite ETP-00 invalido:\n- ${errors.join("\n- ")}`,
  );
}

process.stdout.write(
  `${JSON.stringify({
    valid: true,
    stage: "ETP-00",
    status: manifest.status,
    ready: manifest.status === "APROVADA",
  })}\n`,
);
