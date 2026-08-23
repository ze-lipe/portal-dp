import { execFileSync, spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const digestPattern = /^sha256:[a-f0-9]{64}$/u;
const inTotoStatementV1 = "https://in-toto.io/Statement/v1";
const slsaProvenanceV1 = "https://slsa.dev/provenance/v1";
const spdxDocumentPredicate = "https://spdx.dev/Document";
const buildkitAttestationArtifactType =
  "application/vnd.docker.attestation.manifest.v1+json";
export const expectedRuntimeBase =
  "gcr.io/distroless/nodejs24-debian13:nonroot@sha256:ffab599740d4aaa66029d02b9e6d3de4f622fefb7410081c5ef69c86430f364d";
export const expectedDockerfileFrontend =
  "docker/dockerfile:1.7.1@sha256:a57df69d0ea827fb7266491f2813635de6f17269be881f696fbfdf2d83dda33e";
const expectedRuntimeRepository = "gcr.io/distroless/nodejs24-debian13";
const expectedRuntimeTag = "nonroot";
const expectedRuntimeDigest = expectedRuntimeBase.slice(
  expectedRuntimeBase.indexOf("@sha256:") + "@sha256:".length,
);
const expectedRuntimePlatform = "linux/amd64";
const expectedDockerfileFrontendRepository = "docker/dockerfile";
const expectedDockerfileFrontendTag = "1.7.1";
const expectedDockerfileFrontendDigest = expectedDockerfileFrontend.slice(
  expectedDockerfileFrontend.indexOf("@sha256:") + "@sha256:".length,
);
const expectedDockerfilePath = "Dockerfile";
const runtimeBaseLabel = "org.opencontainers.image.base.name";

function dockerfileLogicalInstructions(dockerfile) {
  const instructions = [];
  let continued = "";

  for (const physicalLine of dockerfile.split(/\r?\n/u)) {
    const line = physicalLine.trimEnd();
    if (continued === "" && /^\s*#\s*escape\s*=/iu.test(line)) {
      throw new Error("Dockerfile nao pode alterar o caractere de escape");
    }
    if (continued === "" && /^\s*(?:#.*)?$/u.test(line)) continue;
    // Este verificador intencionalmente aceita um subconjunto simples do
    // Dockerfile. Sem um parser de heredoc, linhas literais poderiam parecer
    // novos FROM/LABEL; portanto a sintaxe e recusada de forma fechada.
    if (line.includes("<<")) {
      throw new Error("Dockerfile nao pode usar heredoc nesta prova");
    }

    const fragment = line.trim();
    const hasContinuation = fragment.endsWith("\\");
    const content = hasContinuation
      ? fragment.slice(0, -1).trimEnd()
      : fragment;
    continued = continued === "" ? content : `${continued} ${content}`;
    if (!hasContinuation) {
      instructions.push(continued);
      continued = "";
    }
  }

  if (continued !== "") {
    throw new Error("Dockerfile termina com continuacao incompleta");
  }
  return instructions;
}

function inspectDockerfile(dockerfileBytes) {
  if (!Buffer.isBuffer(dockerfileBytes) || dockerfileBytes.length === 0) {
    throw new Error("Dockerfile usado no build nao foi informado");
  }
  let dockerfile;
  try {
    dockerfile = new TextDecoder("utf-8", { fatal: true }).decode(
      dockerfileBytes,
    );
  } catch {
    throw new Error("Dockerfile usado no build nao possui UTF-8 valido");
  }
  if (dockerfile.includes("\u0000")) {
    throw new Error("Dockerfile usado no build possui byte nulo");
  }
  const expectedSyntaxDirective = `# syntax=${expectedDockerfileFrontend}`;
  if (dockerfile.split(/\r?\n/u, 1)[0] !== expectedSyntaxDirective) {
    throw new Error(
      `Dockerfile deve iniciar exatamente com ${expectedSyntaxDirective}`,
    );
  }

  const instructions = dockerfileLogicalInstructions(dockerfile);
  const fromIndexes = instructions
    .map((instruction, index) =>
      /^FROM(?:\s|$)/iu.test(instruction) ? index : -1,
    )
    .filter((index) => index >= 0);
  if (fromIndexes.length === 0) {
    throw new Error("Dockerfile usado no build nao possui FROM");
  }

  const runtimeFrom = `FROM ${expectedRuntimeBase} AS runtime`;
  const lastFromIndex = fromIndexes.at(-1);
  if (instructions[lastFromIndex] !== runtimeFrom) {
    throw new Error(
      `ultimo FROM do Dockerfile deve ser exatamente ${runtimeFrom}`,
    );
  }

  const expectedLabel = `LABEL ${runtimeBaseLabel}="${expectedRuntimeBase}"`;
  const runtimeStageLabels = instructions
    .slice(lastFromIndex + 1)
    .filter((instruction) =>
      new RegExp(
        `^LABEL\\s+${runtimeBaseLabel.replaceAll(".", "\\.")}(?:=|\\s)`,
        "iu",
      ).test(instruction),
    );
  if (
    runtimeStageLabels.length !== 1 ||
    runtimeStageLabels[0] !== expectedLabel
  ) {
    throw new Error(
      `estagio runtime do Dockerfile deve declarar exatamente ${expectedLabel}`,
    );
  }

  return createHash("sha256").update(dockerfileBytes).digest("hex");
}

function isExpectedImageDependency(dependency, { repository, tag, digest }) {
  if (
    !dependency ||
    typeof dependency !== "object" ||
    Array.isArray(dependency) ||
    dependency.digest?.sha256 !== digest ||
    typeof dependency.uri !== "string"
  ) {
    return false;
  }

  const [packageReference, query = ""] = dependency.uri.split("?", 2);
  if (packageReference !== `pkg:docker/${repository}@${tag}`) {
    return false;
  }
  const qualifiers = new URLSearchParams(query);
  if (
    qualifiers.getAll("platform").length !== 1 ||
    qualifiers.get("platform") !== expectedRuntimePlatform
  ) {
    return false;
  }
  const digestQualifiers = qualifiers.getAll("digest");
  if (
    digestQualifiers.length !== 1 ||
    digestQualifiers[0] !== `sha256:${digest}`
  ) {
    return false;
  }
  return [...qualifiers.keys()].every((key) =>
    ["digest", "platform"].includes(key),
  );
}

function isExpectedRuntimeDependency(dependency) {
  return isExpectedImageDependency(dependency, {
    repository: expectedRuntimeRepository,
    tag: expectedRuntimeTag,
    digest: expectedRuntimeDigest,
  });
}

function isExpectedDockerfileFrontendDependency(dependency) {
  return isExpectedImageDependency(dependency, {
    repository: expectedDockerfileFrontendRepository,
    tag: expectedDockerfileFrontendTag,
    digest: expectedDockerfileFrontendDigest,
  });
}

function assertDigest(value, label) {
  if (!digestPattern.test(value ?? "")) {
    throw new Error(`${label} deve ser um digest SHA-256 valido`);
  }
}

function digestBytes(bytes) {
  return `sha256:${createHash("sha256").update(bytes).digest("hex")}`;
}

function parseJson(bytes, label) {
  try {
    return JSON.parse(bytes.toString("utf8"));
  } catch {
    throw new Error(`${label} nao contem JSON valido`);
  }
}

function assertExpectedBuilderId(value) {
  if (
    typeof value !== "string" ||
    value.length === 0 ||
    value.trim() !== value
  ) {
    throw new Error("expectedBuilderId deve ser uma string nao vazia");
  }
}

function assertStatementEnvelope({
  document,
  expectedStatementType,
  expectedPredicateType,
  imageReference,
  label,
}) {
  if (document?._type !== expectedStatementType) {
    throw new Error(
      `${label} usa envelope in-toto diferente de ${expectedStatementType}`,
    );
  }
  if (document.predicateType !== expectedPredicateType) {
    throw new Error(`${label} possui predicateType divergente`);
  }
  if (
    !Array.isArray(document.subject) ||
    !document.subject.some(
      (subject) =>
        subject?.digest?.sha256 === imageReference.slice("sha256:".length),
    )
  ) {
    throw new Error(`${label} nao referencia a imagem`);
  }
  if (
    !document.predicate ||
    typeof document.predicate !== "object" ||
    Array.isArray(document.predicate)
  ) {
    throw new Error(`${label} nao possui predicate valido`);
  }
}

function assertProvenanceStatement({
  document,
  predicateType,
  imageReference,
  expectedBuilderId,
}) {
  if (predicateType !== slsaProvenanceV1) {
    throw new Error(`versao de provenance OCI nao suportada: ${predicateType}`);
  }
  assertStatementEnvelope({
    document,
    expectedStatementType: inTotoStatementV1,
    expectedPredicateType: slsaProvenanceV1,
    imageReference,
    label: "provenance SLSA v1",
  });
  if (
    typeof document.predicate?.buildDefinition?.buildType !== "string" ||
    document.predicate.buildDefinition.buildType.trim() === ""
  ) {
    throw new Error(
      "provenance SLSA v1 nao possui buildDefinition.buildType valido",
    );
  }
  const externalParameters =
    document.predicate.buildDefinition.externalParameters;
  if (externalParameters?.configSource?.path !== expectedDockerfilePath) {
    throw new Error(
      `provenance SLSA v1 nao comprova configSource.path=${expectedDockerfilePath}`,
    );
  }
  const buildRequest = externalParameters?.request;
  const localNames = Array.isArray(buildRequest?.locals)
    ? buildRequest.locals.map((item) => item?.name)
    : [];
  if (
    buildRequest?.frontend !== "gateway.v0" ||
    buildRequest?.args?.source !== expectedDockerfileFrontend ||
    !localNames.includes("context") ||
    !localNames.includes("dockerfile")
  ) {
    throw new Error(
      "provenance SLSA v1 nao comprova o frontend Gateway imutavel do Dockerfile",
    );
  }
  const resolvedDependencies =
    document.predicate.buildDefinition.resolvedDependencies;
  const runtimeDependencies = Array.isArray(resolvedDependencies)
    ? resolvedDependencies.filter(isExpectedRuntimeDependency)
    : [];
  if (runtimeDependencies.length !== 1) {
    throw new Error(
      "provenance SLSA v1 nao comprova a dependencia Distroless fixada",
    );
  }
  const dockerfileFrontendDependencies = Array.isArray(resolvedDependencies)
    ? resolvedDependencies.filter(isExpectedDockerfileFrontendDependency)
    : [];
  if (dockerfileFrontendDependencies.length !== 1) {
    throw new Error(
      "provenance SLSA v1 nao comprova o frontend Dockerfile fixado",
    );
  }
  const observedBuilderId = document.predicate?.runDetails?.builder?.id;
  if (typeof observedBuilderId !== "string" || observedBuilderId.length === 0) {
    throw new Error(
      "provenance SLSA v1 nao possui runDetails.builder.id valido",
    );
  }
  if (observedBuilderId !== expectedBuilderId) {
    throw new Error("builder id do provenance diverge do expectedBuilderId");
  }
  return {
    dockerfileFrontendLinked: true,
    dockerfileSourceLinked: true,
    provenanceDependencyLinked: true,
  };
}

function assertSbomStatement({ document, imageReference }) {
  // O BuildKit atual envolve o predicado SPDX no Statement v1 do in-toto.
  assertStatementEnvelope({
    document,
    expectedStatementType: inTotoStatementV1,
    expectedPredicateType: spdxDocumentPredicate,
    imageReference,
    label: "SBOM SPDX",
  });
  if (
    !String(document.predicate?.spdxVersion ?? "").startsWith("SPDX-") ||
    document.predicate?.dataLicense !== "CC0-1.0" ||
    document.predicate?.SPDXID !== "SPDXRef-DOCUMENT" ||
    typeof document.predicate?.name !== "string" ||
    document.predicate.name === "" ||
    typeof document.predicate?.documentNamespace !== "string" ||
    document.predicate.documentNamespace === "" ||
    typeof document.predicate?.creationInfo?.created !== "string" ||
    Number.isNaN(Date.parse(document.predicate.creationInfo.created)) ||
    !Array.isArray(document.predicate?.creationInfo?.creators) ||
    document.predicate.creationInfo.creators.length === 0 ||
    !Array.isArray(document.predicate?.packages) ||
    document.predicate.packages.length === 0
  ) {
    throw new Error("SBOM SPDX nao possui documento valido");
  }
}

function assertBuildkitAttestationManifest({ document, imageReference }) {
  if (document?.artifactType !== buildkitAttestationArtifactType) {
    throw new Error(
      `manifesto de attestation OCI nao possui artifactType ${buildkitAttestationArtifactType}`,
    );
  }
  if (
    !document.subject ||
    typeof document.subject !== "object" ||
    Array.isArray(document.subject) ||
    document.subject.digest !== imageReference
  ) {
    throw new Error(
      "subject.digest do manifesto de attestation diverge da imagem referenciada",
    );
  }
}

function childDescriptors(document) {
  const children = [];
  if (Array.isArray(document?.manifests)) {
    children.push(...document.manifests);
  }
  if (
    document?.schemaVersion === 2 &&
    Array.isArray(document?.layers) &&
    document?.config &&
    typeof document.config === "object"
  ) {
    children.push({ ...document.config, descriptorKind: "config" });
  }
  return children;
}

function attestationLayerDescriptors(document) {
  if (!Array.isArray(document?.layers)) return [];
  return document.layers.map((layer) => ({
    ...layer,
    descriptorKind: "attestation-layer",
    predicateType: layer?.annotations?.["in-toto.io/predicate-type"] ?? null,
  }));
}

function imageLayerDescriptors(document) {
  if (!Array.isArray(document?.layers)) return [];
  return document.layers.map((layer) => ({
    ...layer,
    descriptorKind: "image-layer",
  }));
}

function isAttestationDescriptor(descriptor) {
  return (
    descriptor?.annotations?.["vnd.docker.reference.type"] ===
      "attestation-manifest" ||
    (descriptor?.platform?.os === "unknown" &&
      descriptor?.platform?.architecture === "unknown")
  );
}

async function hashFile(path) {
  const hash = createHash("sha256");
  for await (const chunk of createReadStream(path)) {
    hash.update(chunk);
  }
  return hash.digest("hex");
}

/**
 * Produz somente os vínculos mínimos necessários para provar que a imagem local,
 * o resultado do Buildx e o arquivo OCI nasceram da mesma construção. Metadados,
 * anotações e conteúdo dos blobs não são persistidos na evidência final.
 */
export async function createOciBuildEvidence({
  buildDigest,
  dockerfileBytes,
  localImageId,
  ociArchiveSha256,
  expectedBuilderId,
  metadata,
  runtimeImageDigest,
  runtimeImageId,
  runtimeMetadata,
  indexBytes,
  readBlob,
  verifyBlob,
}) {
  assertDigest(buildDigest, "buildDigest");
  assertDigest(localImageId, "localImageId");
  assertDigest(runtimeImageDigest, "runtimeImageDigest");
  assertDigest(runtimeImageId, "runtimeImageId");
  assertExpectedBuilderId(expectedBuilderId);
  const dockerfileSha256 = inspectDockerfile(dockerfileBytes);
  if (runtimeImageId !== localImageId) {
    throw new Error("ImageID do Buildx diverge da imagem local");
  }
  if (!/^[a-f0-9]{64}$/u.test(ociArchiveSha256 ?? "")) {
    throw new Error("ociArchiveSha256 deve ser um SHA-256 valido");
  }
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    throw new Error("metadata do Buildx deve ser um objeto JSON");
  }
  if (metadata["containerimage.digest"] !== buildDigest) {
    throw new Error("digest informado pelo Buildx diverge do buildDigest");
  }
  const buildConfigDigest = metadata["containerimage.config.digest"];
  if (buildConfigDigest !== undefined && buildConfigDigest !== localImageId) {
    throw new Error("config digest do Buildx diverge da imagem local");
  }
  if (
    !runtimeMetadata ||
    typeof runtimeMetadata !== "object" ||
    Array.isArray(runtimeMetadata)
  ) {
    throw new Error("metadata da imagem executavel deve ser um objeto JSON");
  }
  if (runtimeMetadata["containerimage.digest"] !== runtimeImageDigest) {
    throw new Error(
      "digest da imagem executavel diverge do metadata do Buildx",
    );
  }
  if (runtimeMetadata["containerimage.config.digest"] !== runtimeImageId) {
    throw new Error(
      "config digest da imagem executavel diverge da imagem local",
    );
  }
  if (!Buffer.isBuffer(indexBytes) || indexBytes.length === 0) {
    throw new Error("index.json do arquivo OCI nao foi informado");
  }
  if (typeof readBlob !== "function") {
    throw new Error("leitor de blobs OCI nao foi informado");
  }
  if (verifyBlob !== undefined && typeof verifyBlob !== "function") {
    throw new Error("verificador de blobs OCI possui tipo invalido");
  }

  const index = parseJson(indexBytes, "index.json do arquivo OCI");
  if (index.schemaVersion !== 2 || !Array.isArray(index.manifests)) {
    throw new Error("index.json do arquivo OCI possui estrutura invalida");
  }
  if (index.manifests.length === 0) {
    throw new Error("arquivo OCI nao possui manifestos");
  }

  const indexDigest = digestBytes(indexBytes);
  const queue = index.manifests.map((descriptor) => ({
    descriptor,
    parentDigest: indexDigest,
    attestationReference: null,
  }));
  const visited = new Set();
  const graph = new Map();
  const verifiedImageLayerDigests = new Set();
  const attestationDescriptorDigests = new Set();
  const predicatesByReference = new Map();
  const provenanceProofsByReference = new Map();
  let runtimeConfigBase = null;
  let buildNode =
    indexDigest === buildDigest
      ? {
          digest: indexDigest,
          mediaType: index.mediaType ?? null,
          document: index,
        }
      : null;
  let attestationDescriptorCount = 0;

  while (queue.length > 0) {
    const { descriptor, parentDigest, attestationReference } = queue.shift();
    assertDigest(descriptor?.digest, "descriptor OCI");
    if (!Number.isSafeInteger(descriptor?.size) || descriptor.size < 0) {
      throw new Error(
        `descriptor OCI ${descriptor?.digest} possui tamanho invalido`,
      );
    }
    let effectiveAttestationReference = attestationReference;
    const attestationManifest = isAttestationDescriptor(descriptor);
    if (attestationManifest) {
      attestationDescriptorCount += 1;
      attestationDescriptorDigests.add(descriptor.digest);
      effectiveAttestationReference =
        descriptor?.annotations?.["vnd.docker.reference.digest"] ?? null;
      assertDigest(
        effectiveAttestationReference,
        "referencia da attestation OCI",
      );
    }
    const existingNode = graph.get(descriptor.digest);
    if (existingNode) {
      if (existingNode.size !== descriptor.size) {
        throw new Error(
          `descriptor OCI ${descriptor.digest} possui tamanhos divergentes`,
        );
      }
      existingNode.parentDigests.add(parentDigest);
      existingNode.descriptorKinds.add(descriptor.descriptorKind ?? "content");
    } else {
      graph.set(descriptor.digest, {
        parentDigests: new Set([parentDigest]),
        mediaType: descriptor.mediaType ?? null,
        size: descriptor.size,
        descriptorKinds: new Set([descriptor.descriptorKind ?? "content"]),
      });
    }
    if (visited.has(descriptor.digest)) continue;
    visited.add(descriptor.digest);

    if (descriptor.descriptorKind === "image-layer" && verifyBlob) {
      if ((await verifyBlob(descriptor.digest, descriptor.size)) !== true) {
        throw new Error(
          `blob OCI ${descriptor.digest} nao corresponde ao digest`,
        );
      }
      verifiedImageLayerDigests.add(descriptor.digest);
      continue;
    }

    const bytes = await readBlob(descriptor.digest);
    if (
      !Buffer.isBuffer(bytes) ||
      bytes.length !== descriptor.size ||
      digestBytes(bytes) !== descriptor.digest
    ) {
      throw new Error(
        `blob OCI ${descriptor.digest} nao corresponde ao digest`,
      );
    }
    if (descriptor.descriptorKind === "image-layer") {
      verifiedImageLayerDigests.add(descriptor.digest);
      continue;
    }

    let document = null;
    const mediaType = String(descriptor.mediaType ?? "");
    if (mediaType.includes("json") || descriptor.digest === buildDigest) {
      document = parseJson(bytes, `blob OCI ${descriptor.digest}`);
      if (attestationManifest) {
        assertBuildkitAttestationManifest({
          document,
          imageReference: effectiveAttestationReference,
        });
      }
      if (descriptor.descriptorKind === "attestation-layer") {
        const predicateType = String(descriptor.predicateType ?? "");
        if (predicateType.startsWith("https://slsa.dev/provenance/")) {
          const provenanceProof = assertProvenanceStatement({
            document,
            predicateType,
            imageReference: effectiveAttestationReference,
            expectedBuilderId,
          });
          const proofs =
            provenanceProofsByReference.get(effectiveAttestationReference) ??
            [];
          proofs.push(provenanceProof);
          provenanceProofsByReference.set(
            effectiveAttestationReference,
            proofs,
          );
        } else if (predicateType === spdxDocumentPredicate) {
          assertSbomStatement({
            document,
            imageReference: effectiveAttestationReference,
          });
        } else {
          // Tipos desconhecidos exigem uma decisão explícita antes de entrarem no gate.
          throw new Error(
            `predicate de attestation OCI nao suportado: ${predicateType}`,
          );
        }
        const predicates =
          predicatesByReference.get(effectiveAttestationReference) ?? new Set();
        predicates.add(predicateType);
        predicatesByReference.set(effectiveAttestationReference, predicates);
      }
      if (
        descriptor.descriptorKind === "config" &&
        descriptor.digest === localImageId
      ) {
        runtimeConfigBase =
          document?.config?.Labels?.[runtimeBaseLabel] ?? null;
      }
      const children = childDescriptors(document);
      if (attestationManifest) {
        children.push(...attestationLayerDescriptors(document));
      } else {
        children.push(...imageLayerDescriptors(document));
      }
      for (const child of children) {
        queue.push({
          descriptor: child,
          parentDigest: descriptor.digest,
          attestationReference: effectiveAttestationReference,
        });
      }
    }
    if (descriptor.digest === buildDigest) {
      buildNode = {
        digest: descriptor.digest,
        mediaType: descriptor.mediaType ?? null,
        document,
      };
    }
  }

  if (!buildNode) {
    throw new Error("buildDigest nao esta vinculado ao grafo do arquivo OCI");
  }
  if (attestationDescriptorCount === 0) {
    throw new Error("arquivo OCI nao possui manifesto de attestation");
  }

  const buildReachable = new Set([buildDigest]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const [digest, node] of graph) {
      if (
        [...node.parentDigests].some((parent) => buildReachable.has(parent)) &&
        !buildReachable.has(digest)
      ) {
        buildReachable.add(digest);
        changed = true;
      }
    }
  }
  const configNode = graph.get(localImageId);
  if (
    !configNode ||
    !configNode.descriptorKinds.has("config") ||
    !buildReachable.has(localImageId)
  ) {
    throw new Error(
      "imagem local nao esta vinculada como config do buildDigest no arquivo OCI",
    );
  }
  const verifiedBuildLayerDigests = [...verifiedImageLayerDigests].filter(
    (digest) => buildReachable.has(digest),
  );
  if (verifiedBuildLayerDigests.length === 0) {
    throw new Error(
      "buildDigest nao possui camada de imagem verificavel no arquivo OCI",
    );
  }
  const imageManifestDigests = [...configNode.parentDigests].filter(
    (digest) =>
      buildReachable.has(digest) && !attestationDescriptorDigests.has(digest),
  );
  if (imageManifestDigests.length !== 1) {
    throw new Error(
      "artefato OCI nao possui um unico manifesto executavel vinculado ao config local",
    );
  }
  const ociImageManifestDigest = imageManifestDigests[0];
  const linkedPredicates = predicatesByReference.get(ociImageManifestDigest);
  const provenanceLinked = linkedPredicates?.has(slsaProvenanceV1) ?? false;
  const sbomLinked = linkedPredicates?.has(spdxDocumentPredicate) ?? false;
  if (!provenanceLinked || !sbomLinked) {
    throw new Error(
      "arquivo OCI nao comprova provenance e SBOM vinculados a imagem",
    );
  }
  const provenanceProofs =
    provenanceProofsByReference.get(ociImageManifestDigest) ?? [];
  const provenanceDependencyLinked =
    provenanceProofs.length > 0 &&
    provenanceProofs.every(
      (proof) => proof.provenanceDependencyLinked === true,
    );
  const dockerfileSourceLinked =
    provenanceProofs.length > 0 &&
    provenanceProofs.every((proof) => proof.dockerfileSourceLinked === true);
  const dockerfileFrontendLinked =
    provenanceProofs.length > 0 &&
    provenanceProofs.every((proof) => proof.dockerfileFrontendLinked === true);
  if (
    !provenanceDependencyLinked ||
    !dockerfileSourceLinked ||
    !dockerfileFrontendLinked
  ) {
    throw new Error(
      "provenance vinculado nao comprova a base e o Dockerfile esperados",
    );
  }
  if (runtimeConfigBase !== expectedRuntimeBase) {
    throw new Error(
      "label da base na configuracao da imagem diverge do runtime esperado",
    );
  }

  const buildDescriptor = graph.get(buildDigest);
  return {
    schemaVersion: 4,
    builder: "docker/build-push-action",
    buildDigest,
    dockerfileFrontend: expectedDockerfileFrontend,
    dockerfileFrontendLinked,
    dockerfileSha256,
    dockerfileSourceLinked,
    ociImageManifestDigest,
    provenanceDependencyLinked,
    runtimeBase: expectedRuntimeBase,
    runtimeBaseLabelLinked: true,
    runtimeManifestDigest: runtimeImageDigest,
    localImageId,
    ociArchiveSha256,
    metadata: {
      containerImageDigest: buildDigest,
      containerImageConfigDigest: localImageId,
      ociImageManifestDigest,
      runtimeManifestDigest: runtimeImageDigest,
    },
    ociIndex: {
      digest: indexDigest,
      manifestCount: index.manifests.length,
      attestationDescriptorCount,
      imageLayerCount: verifiedBuildLayerDigests.length,
      allImageLayerBlobsVerified: true,
      buildDigestLinked: true,
      ociImageManifestLinked: true,
      runtimeConfigLinked: true,
      configDigestLinked: true,
      linkage: indexDigest === buildDigest ? "INDEX_ROOT" : "DESCRIPTOR_GRAPH",
      linkedMediaType:
        indexDigest === buildDigest
          ? (index.mediaType ?? null)
          : (buildDescriptor?.mediaType ?? buildNode.mediaType ?? null),
      attestations: {
        referenceLinked: true,
        provenanceLinked,
        sbomLinked,
      },
    },
    sanitization:
      "Somente digests, a referencia publica da base e provas estruturais; metadados, anotacoes e conteudo OCI foram descartados.",
  };
}

function archiveEntry(archivePath, entry) {
  return execFileSync("tar", ["-xOf", archivePath, entry], {
    encoding: null,
    maxBuffer: 32 * 1024 * 1024,
  });
}

async function archiveEntryDigest(archivePath, entry) {
  return new Promise((resolveDigest, reject) => {
    const child = spawn("tar", ["-xOf", archivePath, entry], {
      stdio: ["ignore", "pipe", "pipe"],
    });
    const hash = createHash("sha256");
    let bytes = 0;
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      bytes += chunk.length;
      hash.update(chunk);
    });
    child.stderr.setEncoding("utf8");
    child.stderr.on("data", (chunk) => {
      if (stderr.length < 8192) stderr += chunk;
    });
    child.once("error", reject);
    child.once("close", (code) => {
      if (code !== 0) {
        reject(new Error(`tar nao leu ${entry}: ${stderr.trim()}`));
        return;
      }
      resolveDigest({ digest: `sha256:${hash.digest("hex")}`, bytes });
    });
  });
}

async function main() {
  const archivePath = resolve(process.argv[2] ?? "");
  const outputPath = resolve(root, "evidencias/resultados/oci-build-link.json");
  const metadata = parseJson(
    Buffer.from(process.env.OCI_BUILD_METADATA_JSON ?? "", "utf8"),
    "metadata do Buildx",
  );
  const report = await createOciBuildEvidence({
    buildDigest: process.env.OCI_BUILD_DIGEST,
    dockerfileBytes: await readFile(resolve(root, expectedDockerfilePath)),
    localImageId: process.env.OCI_LOCAL_IMAGE_ID,
    expectedBuilderId: process.env.OCI_EXPECTED_BUILDER_ID,
    ociArchiveSha256: await hashFile(archivePath),
    metadata,
    runtimeImageDigest: process.env.OCI_RUNTIME_DIGEST,
    runtimeImageId: process.env.OCI_RUNTIME_IMAGE_ID,
    runtimeMetadata: parseJson(
      Buffer.from(process.env.OCI_RUNTIME_METADATA_JSON ?? "", "utf8"),
      "metadata da imagem executavel",
    ),
    indexBytes: archiveEntry(archivePath, "index.json"),
    readBlob: async (digest) =>
      archiveEntry(archivePath, `blobs/sha256/${digest.slice(7)}`),
    verifyBlob: async (digest, expectedBytes) => {
      const observed = await archiveEntryDigest(
        archivePath,
        `blobs/sha256/${digest.slice(7)}`,
      );
      return observed.digest === digest && observed.bytes === expectedBytes;
    },
  });
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, {
    flag: "wx",
  });
  process.stdout.write(
    `${JSON.stringify({ written: "evidencias/resultados/oci-build-link.json" })}\n`,
  );
}

if (resolve(process.argv[1] ?? "") === resolve(import.meta.filename)) {
  await main();
}
