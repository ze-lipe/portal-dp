import { createHash } from "node:crypto";

import { describe, expect, it } from "vitest";

import {
  InvalidTaskPayloadError,
  parseMaterializationPayload,
} from "./payload.js";

describe("parseMaterializationPayload", () => {
  it("valida tipo, tamanho e hash antes da escrita privada", () => {
    const bytes = Buffer.from(
      JSON.stringify({
        schema: "ETP00_PRIVATE_EVIDENCE_V1",
        companyId: "00000000-0000-4000-8000-00000000000a",
        proofRootId: "20000000-0000-4000-8000-00000000000a",
        operationId: "50000000-0000-4000-8000-000000000001",
        synthetic: true,
      }),
      "utf8",
    );
    const parsed = parseMaterializationPayload({
      object_id: "50000000-0000-4000-8000-000000000001",
      owner_type: "synthetic_operation",
      owner_id: "50000000-0000-4000-8000-000000000001",
      media_type: "application/json",
      content_base64: bytes.toString("base64"),
      sha256: createHash("sha256").update(bytes).digest("hex"),
    });
    expect(parsed.bytes).toEqual(bytes);
  });

  it("rejeita JSON ativo ou fora do schema sintetico fechado", () => {
    const bytes = Buffer.from('{"synthetic":true,"html":"<script>"}', "utf8");
    expect(() =>
      parseMaterializationPayload({
        object_id: "50000000-0000-4000-8000-000000000001",
        owner_type: "synthetic_operation",
        owner_id: "50000000-0000-4000-8000-000000000001",
        media_type: "application/json",
        content_base64: bytes.toString("base64"),
        sha256: createHash("sha256").update(bytes).digest("hex"),
      }),
    ).toThrow(InvalidTaskPayloadError);
  });
});
