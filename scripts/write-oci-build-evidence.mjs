import { execFileSync, spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const digestPattern = /^sha256:[a-f0-9]{64}$/u;

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
  metadata,
  indexBytes,
  readBlob,
  verifyBlob,
}) {
  assertDigest(buildDigest, "buildDigest");
  assertDigest(localImageId, "localImageId");
  if (!/^[a-f0-9]{64}$/u.test(ociArchiveSha256 ?? "")) {
    throw new Error("ociArchiveSha256 deve ser um SHA-256 valido");
  }
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    throw new Error("metadata do Buildx deve ser um objeto JSON");
  }
  if (metadata["containerimage.digest"] !== buildDigest) {
    throw new Error("digest informado pelo Buildx diverge do buildDigest");
  }
  if (metadata["containerimage.config.digest"] !== localImageId) {
    throw new Error("config digest do Buildx diverge da imagem local");
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
    if (isAttestationDescriptor(descriptor)) {
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
      if (descriptor.descriptorKind === "attestation-layer") {
        const predicateType = String(descriptor.predicateType ?? "");
        if (
          typeof document?._type !== "string" ||
          !document._type.startsWith("https://in-toto.io/Statement/") ||
          document.predicateType !== predicateType ||
          !Array.isArray(document.subject) ||
          !document.subject.some(
            (subject) =>
              subject?.digest?.sha256 ===
              effectiveAttestationReference?.slice("sha256:".length),
          ) ||
          !document.predicate ||
          typeof document.predicate !== "object" ||
          Array.isArray(document.predicate) ||
          (predicateType.startsWith("https://slsa.dev/provenance/") &&
            (typeof document.predicate?.buildType !== "string" ||
              document.predicate.buildType === "" ||
              typeof document.predicate?.builder?.id !== "string" ||
              document.predicate.builder.id === "")) ||
          (predicateType === "https://spdx.dev/Document" &&
            (!String(document.predicate?.spdxVersion ?? "").startsWith(
              "SPDX-",
            ) ||
              document.predicate?.dataLicense !== "CC0-1.0" ||
              document.predicate?.SPDXID !== "SPDXRef-DOCUMENT" ||
              typeof document.predicate?.name !== "string" ||
              document.predicate.name === "" ||
              typeof document.predicate?.documentNamespace !== "string" ||
              document.predicate.documentNamespace === "" ||
              typeof document.predicate?.creationInfo?.created !== "string" ||
              Number.isNaN(
                Date.parse(document.predicate.creationInfo.created),
              ) ||
              !Array.isArray(document.predicate?.creationInfo?.creators) ||
              document.predicate.creationInfo.creators.length === 0 ||
              !Array.isArray(document.predicate?.packages) ||
              document.predicate.packages.length === 0))
        ) {
          throw new Error(
            `declaracao in-toto ${descriptor.digest} nao referencia a imagem`,
          );
        }
        const predicates =
          predicatesByReference.get(effectiveAttestationReference) ?? new Set();
        predicates.add(predicateType);
        predicatesByReference.set(effectiveAttestationReference, predicates);
      }
      const children = childDescriptors(document);
      if (isAttestationDescriptor(descriptor)) {
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
  const imageManifestDigest = [...configNode.parentDigests].find(
    (digest) =>
      buildReachable.has(digest) && !attestationDescriptorDigests.has(digest),
  );
  const linkedPredicates = predicatesByReference.get(imageManifestDigest);
  const provenanceLinked = [...(linkedPredicates ?? [])].some((predicateType) =>
    predicateType.startsWith("https://slsa.dev/provenance/"),
  );
  const sbomLinked =
    linkedPredicates?.has("https://spdx.dev/Document") ?? false;
  if (!imageManifestDigest || !provenanceLinked || !sbomLinked) {
    throw new Error(
      "arquivo OCI nao comprova provenance e SBOM vinculados a imagem",
    );
  }

  const buildDescriptor = graph.get(buildDigest);
  return {
    schemaVersion: 2,
    builder: "docker/build-push-action",
    buildDigest,
    localImageId,
    ociArchiveSha256,
    metadata: {
      containerImageDigest: buildDigest,
      containerImageConfigDigest: localImageId,
    },
    ociIndex: {
      digest: indexDigest,
      manifestCount: index.manifests.length,
      attestationDescriptorCount,
      imageLayerCount: verifiedBuildLayerDigests.length,
      allImageLayerBlobsVerified: true,
      buildDigestLinked: true,
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
    ociArchiveSha256: await hashFile(archivePath),
    metadata,
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
