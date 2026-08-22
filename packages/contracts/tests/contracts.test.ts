import { describe, expect, it } from "vitest";

import {
  canonicalSyntheticIntent,
  containsPublicFileUrl,
  contextVersion,
  createProblemDetails,
  createPublicSessionResponse,
  csrfToken,
  idempotencyKey,
  isProblemDetails,
  pageCursor,
  parseCursorPageRequest,
  createCursorPage,
  sha256Hex,
  utcInstantText,
  uuid,
} from "../src/index.js";

describe("tipos opacos de contrato", () => {
  it("normaliza UUID e recusa formatos inválidos", () => {
    expect(uuid<"Empresa">("00000000-0000-4000-8000-00000000000a")).toBe(
      "00000000-0000-4000-8000-00000000000a",
    );
    expect(() => uuid("empresa-a")).toThrowError(/UUID/);
  });

  it("valida tokens, instante e SHA-256 canônicos", () => {
    expect(idempotencyKey("idem-etp00-0001")).toBe("idem-etp00-0001");
    expect(utcInstantText("2026-08-22T12:00:00.000Z")).toContain("Z");
    expect(sha256Hex("a".repeat(64))).toHaveLength(64);
    expect(() => sha256Hex("A".repeat(64))).toThrowError(/hash/i);
  });
});

describe("contratos HTTP mínimos", () => {
  it("cria a sessão pública sem antecipar autenticação", () => {
    const response = createPublicSessionResponse({
      csrfToken: csrfToken("csrf-etp00-deterministico"),
      contextVersion: contextVersion("contexto-publico-v1"),
      correlationId: uuid<"Correlacao">("40000000-0000-4000-8000-000000000001"),
      generatedAt: utcInstantText("2026-08-22T12:00:00.000Z"),
    });

    expect(response.data).toMatchObject({
      estado: "PUBLICA",
      autenticada: false,
      expira_em: null,
    });
  });

  it("produz Problem Details estável", () => {
    const problem = createProblemDetails({
      type: "https://portal.invalid/problemas/versao-desatualizada",
      title: "O registro foi alterado.",
      status: 412,
      code: "VERSAO_DESATUALIZADA",
    });

    expect(isProblemDetails(problem)).toBe(true);
    expect(Object.isFrozen(problem)).toBe(true);
  });

  it("aplica paginação opaca, limitada e sem parâmetros extras", () => {
    const cursor = pageCursor("cursor_opaco_etp00_0001");
    expect(parseCursorPageRequest({ cursor, limite: "50" })).toEqual({
      cursor,
      limite: 50,
    });
    expect(
      createCursorPage({
        data: [{ id: "registro-sintetico" }],
        limite: 50,
        proximoCursor: cursor,
      }).meta,
    ).toEqual({ proximo_cursor: cursor, limite: 50 });
    expect(() => parseCursorPageRequest({ limite: "1e2" })).toThrow(/inteiro/i);
    expect(() => parseCursorPageRequest({ pagina: 1 })).toThrow(
      /não pertence/i,
    );
  });
});

describe("contratos da prova vertical", () => {
  it("canoniza a intenção sem depender da ordem de propriedades", () => {
    const intent = {
      empresa_id: uuid<"Empresa">("00000000-0000-4000-8000-00000000000a"),
      registro_id: uuid<"RegistroSintetico">(
        "20000000-0000-4000-8000-00000000000a",
      ),
      codigo: "PROVA.A",
      valor: "valor-1",
    } as const;

    expect(canonicalSyntheticIntent(intent)).toBe(
      '["ETP00_SYNTHETIC_INTENT_V1","00000000-0000-4000-8000-00000000000a","20000000-0000-4000-8000-00000000000a","PROVA.A","valor-1",null]',
    );
  });

  it("detecta URL pública acidental em metadado de arquivo", () => {
    expect(containsPublicFileUrl({ chave_privada: "objetos/1" })).toBe(false);
    expect(
      containsPublicFileUrl({ public_url: "https://example.invalid/a" }),
    ).toBe(true);
  });
});
