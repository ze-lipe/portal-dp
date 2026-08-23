import { execFileSync, spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const digestPattern = /^sha256:[a-f0-9]{64}$/u;
const inTotoStatementV1 = "https://in-toto.io/Statement/v1";
const slsaProvenanceV1 = "https://slsa.dev/provenance/v1";
const spdxDocumentPredicate = "https://spdx.dev/Document";
const buildkitAttestationArtifactType =
  "application/vnd.docker.attestation.manifest.v1+json";

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
  const observedBuilderId = document.predicate?.runDetails?.builder?.id;
  if (typeof observedBuilderId !== "string" || observedBuilderId.length === 0) {
    throw new Error(
      "provenance SLSA v1 nao possui runDetails.builder.id valido",
    );
  }
  if (observedBuilderId !== expectedBuilderId) {
    throw new Error("builder id do provenance diverge do expectedBuilderId");
  }
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
  if (document?.config && typeof document.config === "object") {
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
          assertProvenanceStatement({
            document,
            predicateType,
            imageReference: effectiveAttestationReference,
            expectedBuilderId,
          });
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

  const buildDescriptor = graph.get(buildDigest);
  return {
    schemaVersion: 3,
    builder: "docker/build-push-action",
    buildDigest,
    ociImageManifestDigest,
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
      "Somente digests e contagens estruturais; metadados, anotacoes e conteudo OCI foram descartados.",
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
