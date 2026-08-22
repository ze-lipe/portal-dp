import type {
  ContextVersion,
  CorrelacaoId,
  CsrfToken,
  UtcInstantText,
} from "./opaque.js";

export interface PublicSessionData {
  readonly estado: "PUBLICA";
  readonly autenticada: false;
  readonly csrf_token: CsrfToken;
  readonly contexto_versao: ContextVersion;
  readonly aviso_em: null;
  readonly expira_em: null;
  readonly limite_absoluto_em: null;
}

export interface PublicSessionResponse {
  readonly data: PublicSessionData;
  readonly meta: {
    readonly correlacao_id: CorrelacaoId;
    readonly gerado_em: UtcInstantText;
  };
}

export function createPublicSessionResponse(input: {
  readonly csrfToken: CsrfToken;
  readonly contextVersion: ContextVersion;
  readonly correlationId: CorrelacaoId;
  readonly generatedAt: UtcInstantText;
}): PublicSessionResponse {
  return Object.freeze({
    data: Object.freeze({
      estado: "PUBLICA" as const,
      autenticada: false as const,
      csrf_token: input.csrfToken,
      contexto_versao: input.contextVersion,
      aviso_em: null,
      expira_em: null,
      limite_absoluto_em: null,
    }),
    meta: Object.freeze({
      correlacao_id: input.correlationId,
      gerado_em: input.generatedAt,
    }),
  });
}
