import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";

import { createOciBuildEvidence } from "../../scripts/write-oci-build-evidence.mjs";

function digest(bytes) {
  return `sha256:${createHash("sha256").update(bytes).digest("hex")}`;
}

function jsonBytes(value) {
  return Buffer.from(JSON.stringify(value));
}

function fixture() {
  const configBytes = jsonBytes({ architecture: "amd64", os: "linux" });
  const localImageId = digest(configBytes);
  const imageLayerBytes = Buffer.from("camada de aplicacao da fixture");
  const imageLayerDigest = digest(imageLayerBytes);
  const manifestBytes = jsonBytes({
    schemaVersion: 2,
    mediaType: "application/vnd.oci.image.manifest.v1+json",
    config: {
      mediaType: "application/vnd.oci.image.config.v1+json",
      digest: localImageId,
      size: configBytes.length,
    },
    layers: [
      {
        mediaType: "application/vnd.oci.image.layer.v1.tar+gzip",
        digest: imageLayerDigest,
        size: imageLayerBytes.length,
      },
    ],
  });
  const buildDigest = digest(manifestBytes);
  const provenanceBytes = jsonBytes({
    _type: "https://in-toto.io/Statement/v0.1",
    subject: [{ digest: { sha256: buildDigest.slice(7) } }],
    predicateType: "https://slsa.dev/provenance/v0.2",
    predicate: {
      buildType: "https://mobyproject.org/buildkit@v1",
      builder: { id: "https://github.com/docker/build-push-action" },
    },
  });
  const provenanceDigest = digest(provenanceBytes);
  const sbomBytes = jsonBytes({
    _type: "https://in-toto.io/Statement/v0.1",
    subject: [{ digest: { sha256: buildDigest.slice(7) } }],
    predicateType: "https://spdx.dev/Document",
    predicate: {
      spdxVersion: "SPDX-2.3",
      dataLicense: "CC0-1.0",
      SPDXID: "SPDXRef-DOCUMENT",
      name: "fixture-sbom",
      documentNamespace: "https://example.invalid/spdx/fixture",
      creationInfo: {
        created: "2026-08-22T12:00:00.000Z",
        creators: ["Tool: fixture"],
      },
      packages: [{ SPDXID: "SPDXRef-Package-fixture", name: "fixture" }],
    },
  });
  const sbomDigest = digest(sbomBytes);
  const attestationConfigBytes = jsonBytes({});
  const attestationConfigDigest = digest(attestationConfigBytes);
  const attestationBytes = jsonBytes({
    schemaVersion: 2,
    mediaType: "application/vnd.oci.image.manifest.v1+json",
    config: {
      mediaType: "application/vnd.oci.empty.v1+json",
      digest: attestationConfigDigest,
      size: attestationConfigBytes.length,
    },
    layers: [
      {
        mediaType: "application/vnd.in-toto+json",
        digest: provenanceDigest,
        size: provenanceBytes.length,
        annotations: {
          "in-toto.io/predicate-type": "https://slsa.dev/provenance/v0.2",
        },
      },
      {
        mediaType: "application/vnd.in-toto+json",
        digest: sbomDigest,
        size: sbomBytes.length,
        annotations: {
          "in-toto.io/predicate-type": "https://spdx.dev/Document",
        },
      },
    ],
  });
  const attestationDigest = digest(attestationBytes);
  const indexBytes = jsonBytes({
    schemaVersion: 2,
    mediaType: "application/vnd.oci.image.index.v1+json",
    manifests: [
      {
        mediaType: "application/vnd.oci.image.manifest.v1+json",
        digest: buildDigest,
        size: manifestBytes.length,
        platform: { os: "linux", architecture: "amd64" },
        annotations: { sensitive: "CANARIO_NAO_PERSISTIR" },
      },
      {
        mediaType: "application/vnd.oci.image.manifest.v1+json",
        digest: attestationDigest,
        size: attestationBytes.length,
        platform: { os: "unknown", architecture: "unknown" },
        annotations: {
          "vnd.docker.reference.type": "attestation-manifest",
          "vnd.docker.reference.digest": buildDigest,
        },
      },
    ],
  });
  const blobs = new Map([
    [buildDigest, manifestBytes],
    [attestationDigest, attestationBytes],
    [attestationConfigDigest, attestationConfigBytes],
    [localImageId, configBytes],
    [imageLayerDigest, imageLayerBytes],
    [provenanceDigest, provenanceBytes],
    [sbomDigest, sbomBytes],
  ]);
  return { buildDigest, localImageId, indexBytes, blobs };
}

async function buildReport(overrides = {}) {
  const value = fixture();
  return createOciBuildEvidence({
    buildDigest: value.buildDigest,
    localImageId: value.localImageId,
    ociArchiveSha256: "c".repeat(64),
    metadata: {
      "containerimage.digest": value.buildDigest,
      "containerimage.config.digest": value.localImageId,
      "buildx.build.provenance": { sensitive: "CANARIO_NAO_PERSISTIR" },
    },
    indexBytes: value.indexBytes,
    readBlob: async (blobDigest) => value.blobs.get(blobDigest),
    ...overrides,
  });
}

test("vincula Buildx, imagem local e grafo OCI sem persistir metadados brutos", async () => {
  const report = await buildReport();
  assert.equal(report.schemaVersion, 2);
  assert.equal(report.ociIndex.buildDigestLinked, true);
  assert.equal(report.ociIndex.configDigestLinked, true);
  assert.equal(report.ociIndex.linkage, "DESCRIPTOR_GRAPH");
  assert.equal(report.ociIndex.attestationDescriptorCount, 1);
  assert.equal(report.ociIndex.imageLayerCount, 1);
  assert.equal(report.ociIndex.allImageLayerBlobsVerified, true);
  assert.deepEqual(report.ociIndex.attestations, {
    referenceLinked: true,
    provenanceLinked: true,
    sbomLinked: true,
  });
  assert.equal(JSON.stringify(report).includes("CANARIO_NAO_PERSISTIR"), false);
  assert.deepEqual(Object.keys(report.metadata).sort(), [
    "containerImageConfigDigest",
    "containerImageDigest",
  ]);
});

test("rejeita metadata do Buildx independente do digest declarado", async () => {
  await assert.rejects(
    buildReport({
      metadata: {
        "containerimage.digest": `sha256:${"d".repeat(64)}`,
        "containerimage.config.digest": fixture().localImageId,
      },
    }),
    /diverge do buildDigest/u,
  );
});

test("rejeita imagem local que nao e config alcancavel do build", async () => {
  const value = fixture();
  const unrelatedBytes = jsonBytes({ unrelated: true });
  const unrelatedDigest = digest(unrelatedBytes);
  value.blobs.set(unrelatedDigest, unrelatedBytes);
  await assert.rejects(
    createOciBuildEvidence({
      buildDigest: value.buildDigest,
      localImageId: unrelatedDigest,
      ociArchiveSha256: "e".repeat(64),
      metadata: {
        "containerimage.digest": value.buildDigest,
        "containerimage.config.digest": unrelatedDigest,
      },
      indexBytes: value.indexBytes,
      readBlob: async (blobDigest) => value.blobs.get(blobDigest),
    }),
    /nao esta vinculada como config/u,
  );
});

test("rejeita blob OCI cujo conteudo nao corresponde ao descriptor", async () => {
  const value = fixture();
  await assert.rejects(
    buildReport({
      readBlob: async (blobDigest) =>
        blobDigest === value.buildDigest
          ? Buffer.from("conteudo adulterado")
          : value.blobs.get(blobDigest),
    }),
    /nao corresponde ao digest/u,
  );
});

test("rejeita arquivo OCI sem attestations de provenance e SBOM", async () => {
  const value = fixture();
  const index = JSON.parse(value.indexBytes.toString("utf8"));
  index.manifests = index.manifests.filter(
    (descriptor) => descriptor.platform?.os !== "unknown",
  );
  await assert.rejects(
    buildReport({ indexBytes: jsonBytes(index) }),
    /nao possui manifesto de attestation/u,
  );
});

test("rejeita arquivo OCI sem o payload de uma camada da imagem", async () => {
  const value = fixture();
  const manifest = JSON.parse(
    value.blobs.get(value.buildDigest).toString("utf8"),
  );
  value.blobs.delete(manifest.layers[0].digest);
  await assert.rejects(
    createOciBuildEvidence({
      buildDigest: value.buildDigest,
      localImageId: value.localImageId,
      ociArchiveSha256: "b".repeat(64),
      metadata: {
        "containerimage.digest": value.buildDigest,
        "containerimage.config.digest": value.localImageId,
      },
      indexBytes: value.indexBytes,
      readBlob: async (blobDigest) => value.blobs.get(blobDigest),
    }),
    /nao corresponde ao digest/u,
  );
});

test("rejeita attestation com predicate vazio mesmo quando os digests conferem", async () => {
  const value = fixture();
  const index = JSON.parse(value.indexBytes.toString("utf8"));
  const attestationDescriptor = index.manifests.find(
    (descriptor) => descriptor.platform?.os === "unknown",
  );
  const oldAttestationDigest = attestationDescriptor.digest;
  const attestation = JSON.parse(
    value.blobs.get(oldAttestationDigest).toString("utf8"),
  );
  const provenanceLayer = attestation.layers.find((layer) =>
    String(layer.annotations?.["in-toto.io/predicate-type"]).includes(
      "provenance",
    ),
  );
  const invalidStatementBytes = jsonBytes({
    _type: "https://in-toto.io/Statement/v0.1",
    subject: [{ digest: { sha256: value.buildDigest.slice(7) } }],
    predicateType: "https://slsa.dev/provenance/v0.2",
    predicate: {},
  });
  const invalidStatementDigest = digest(invalidStatementBytes);
  value.blobs.delete(provenanceLayer.digest);
  value.blobs.set(invalidStatementDigest, invalidStatementBytes);
  provenanceLayer.digest = invalidStatementDigest;
  provenanceLayer.size = invalidStatementBytes.length;
  const newAttestationBytes = jsonBytes(attestation);
  const newAttestationDigest = digest(newAttestationBytes);
  value.blobs.delete(oldAttestationDigest);
  value.blobs.set(newAttestationDigest, newAttestationBytes);
  attestationDescriptor.digest = newAttestationDigest;
  attestationDescriptor.size = newAttestationBytes.length;

  await assert.rejects(
    createOciBuildEvidence({
      buildDigest: value.buildDigest,
      localImageId: value.localImageId,
      ociArchiveSha256: "9".repeat(64),
      metadata: {
        "containerimage.digest": value.buildDigest,
        "containerimage.config.digest": value.localImageId,
      },
      indexBytes: jsonBytes(index),
      readBlob: async (blobDigest) => value.blobs.get(blobDigest),
    }),
    /declaracao in-toto/u,
  );
});

test("rejeita buildDigest que nao pertence ao grafo OCI", async () => {
  const value = fixture();
  const outsideDigest = `sha256:${"f".repeat(64)}`;
  await assert.rejects(
    createOciBuildEvidence({
      buildDigest: outsideDigest,
      localImageId: value.localImageId,
      ociArchiveSha256: "a".repeat(64),
      metadata: {
        "containerimage.digest": outsideDigest,
        "containerimage.config.digest": value.localImageId,
      },
      indexBytes: value.indexBytes,
      readBlob: async (blobDigest) => value.blobs.get(blobDigest),
    }),
    /nao esta vinculado ao grafo/u,
  );
});
