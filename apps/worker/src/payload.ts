import { createHash } from "node:crypto";

import { z } from "zod";

const base64Pattern =
  /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/u;
const payloadSchema = z
  .object({
    object_id: z.string().uuid(),
    owner_type: z.literal("synthetic_operation"),
    owner_id: z.string().uuid(),
    media_type: z.literal("application/json"),
    content_base64: z.string().min(4).max(1_400_000).regex(base64Pattern),
    sha256: z.string().regex(/^[0-9a-f]{64}$/u),
  })
  .strict();
const syntheticEvidenceSchema = z
  .object({
    schema: z.literal("ETP00_PRIVATE_EVIDENCE_V1"),
    companyId: z.string().uuid(),
    proofRootId: z.string().uuid(),
    operationId: z.string().uuid(),
    synthetic: z.literal(true),
  })
  .strict();

export interface MaterializationPayload {
  objectId: string;
  ownerType: "synthetic_operation";
  ownerId: string;
  mediaType: "application/json";
  bytes: Uint8Array;
  sha256: string;
}

export class InvalidTaskPayloadError extends Error {
  readonly safeCode = "INVALID_TASK_DATA";

  constructor() {
    super("Outbox task payload is invalid");
    this.name = "InvalidTaskPayloadError";
  }
}

export function parseMaterializationPayload(
  value: unknown,
): MaterializationPayload {
  try {
    // A validação cobre estrutura externa, tamanho decodificado, hash, UTF-8
    // estrito e o esquema do conteúdo interno antes de qualquer persistência.
    const parsed = payloadSchema.parse(value);
    const bytes = Buffer.from(parsed.content_base64, "base64");
    if (bytes.byteLength > 1_048_576) throw new InvalidTaskPayloadError();
    const actualHash = createHash("sha256").update(bytes).digest("hex");
    if (actualHash !== parsed.sha256) throw new InvalidTaskPayloadError();
    const decoded: unknown = JSON.parse(
      new TextDecoder("utf-8", { fatal: true }).decode(bytes),
    );
    syntheticEvidenceSchema.parse(decoded);
    return {
      objectId: parsed.object_id,
      ownerType: parsed.owner_type,
      ownerId: parsed.owner_id,
      mediaType: parsed.media_type,
      bytes,
      sha256: parsed.sha256,
    };
  } catch {
    throw new InvalidTaskPayloadError();
  }
}
