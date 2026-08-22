import { describe, expect, it } from "vitest";

import { sessionStatusFromResponse } from "./session-state.js";

describe("sessionStatusFromResponse", () => {
  it("aceita somente a sessao publica minima esperada", () => {
    expect(
      sessionStatusFromResponse({
        data: {
          estado: "PUBLICA",
          autenticada: false,
          contexto_versao: "public-etp00-0.0.0-etp00",
        },
      }),
    ).toEqual({
      kind: "ready",
      version: "public-etp00-0.0.0-etp00",
    });
  });

  it("trata payload invalido sem revelar detalhes", () => {
    expect(sessionStatusFromResponse(null)).toEqual({
      kind: "error",
      message: "Resposta invalida do servidor.",
    });
  });
});
