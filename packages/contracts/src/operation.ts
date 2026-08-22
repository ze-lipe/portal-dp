import type {
  ArquivoPrivadoId,
  AtorId,
  CorrelacaoId,
  EmpresaId,
  EventoAuditoriaId,
  IdempotencyKey,
  JsonValue,
  MensagemOutboxId,
  OperacaoId,
  RegistroSinteticoId,
  Sha256Hex,
  UtcInstantText,
} from "./opaque.js";

export type OperationScope =
  | { readonly tipo: "EMPRESARIAL"; readonly empresa_id: EmpresaId }
  | { readonly tipo: "GLOBAL" }
  | { readonly tipo: "TECNICO_PRIVADO" };

export type IdempotentOperationState =
  "EM_PROCESSAMENTO" | "CONCLUIDA" | "FALHA_SEM_COMMIT";

export interface IdempotentOperationContract {
  readonly operacao_id: OperacaoId;
  readonly ator_id: AtorId;
  readonly escopo: OperationScope;
  readonly chave: IdempotencyKey;
  readonly intencao_sha256: Sha256Hex;
  readonly estado: IdempotentOperationState;
  readonly iniciado_em: UtcInstantText;
  readonly concluido_em?: UtcInstantText;
  readonly resultado_referencia?: string;
}

export interface SyntheticEnterpriseIntent {
  readonly empresa_id: EmpresaId;
  readonly registro_id: RegistroSinteticoId;
  readonly codigo: string;
  readonly valor: string;
  readonly versao_esperada?: number;
}

export interface SyntheticEnterpriseCommand {
  readonly ator_id: AtorId;
  readonly correlacao_id: CorrelacaoId;
  readonly idempotency_key: IdempotencyKey;
  readonly intencao: SyntheticEnterpriseIntent;
}

export interface SyntheticEnterpriseCompletedResult {
  readonly operacao_id: OperacaoId;
  readonly empresa_id: EmpresaId;
  readonly registro_id: RegistroSinteticoId;
  readonly versao_final: number;
  readonly resultado: "CONCLUIDA" | "REPETICAO_RECONCILIADA";
}

export interface SyntheticEnterpriseInProgressResult {
  readonly operacao_id: OperacaoId;
  readonly empresa_id: EmpresaId;
  readonly registro_id: RegistroSinteticoId;
  readonly resultado: "EM_PROCESSAMENTO";
}

export interface SyntheticEnterpriseNaturalKeyResult {
  readonly operacao_id: OperacaoId;
  readonly empresa_id: EmpresaId;
  readonly registro_id: RegistroSinteticoId;
  readonly versao_final: number;
  readonly resultado: "CHAVE_NATURAL_EXISTENTE";
}

export type SyntheticEnterpriseResult =
  | SyntheticEnterpriseCompletedResult
  | SyntheticEnterpriseInProgressResult
  | SyntheticEnterpriseNaturalKeyResult;

export type AuditOutcome = "SUCESSO" | "NEGADO" | "FALHA" | "CANCELADO";

export interface AuditFieldChangeContract {
  readonly campo: string;
  readonly classificacao: "INTERNA" | "CADASTRAL" | "FINANCEIRA" | "SENSIVEL";
  readonly anterior: JsonValue;
  readonly novo: JsonValue;
}

export interface AuditEventContract {
  readonly evento_id: EventoAuditoriaId;
  readonly ocorrido_em: UtcInstantText;
  readonly escopo: OperationScope;
  readonly ator_id: AtorId;
  readonly operacao_id?: OperacaoId;
  readonly correlacao_id: CorrelacaoId;
  readonly acao_codigo: string;
  readonly transicao_id?: string;
  readonly resultado: AuditOutcome;
  readonly entidade_tipo: string;
  readonly entidade_id: string;
  readonly versao_anterior?: number;
  readonly versao_final?: number;
  readonly referencia_erro_segura?: string;
  readonly mudancas: readonly AuditFieldChangeContract[];
}

export interface OutboxMessageContract {
  readonly mensagem_id: MensagemOutboxId;
  readonly tipo: string;
  readonly criado_em: UtcInstantText;
  readonly empresa_id: EmpresaId;
  readonly ator_id: AtorId;
  readonly operacao_id: OperacaoId;
  readonly correlacao_id: CorrelacaoId;
  readonly idempotency_key: IdempotencyKey;
  readonly payload: Readonly<Record<string, JsonValue>>;
}

export type PrivateFileOwner = {
  readonly tipo: "OPERACAO_SINTETICA_ETP00";
  readonly operacao_id: OperacaoId;
};

export interface PrivateFileContract {
  readonly arquivo_id: ArquivoPrivadoId;
  readonly empresa_id: EmpresaId;
  readonly proprietario: PrivateFileOwner;
  readonly finalidade: "EVIDENCIA_PROVA_VERTICAL";
  readonly chave_privada: string;
  readonly mime_real: string;
  readonly tamanho_bytes: number;
  readonly sha256: Sha256Hex;
  readonly criado_em: UtcInstantText;
}

export function canonicalSyntheticIntent(
  intent: SyntheticEnterpriseIntent,
): string {
  return JSON.stringify([
    "ETP00_SYNTHETIC_INTENT_V1",
    intent.empresa_id,
    intent.registro_id,
    intent.codigo,
    intent.valor,
    intent.versao_esperada ?? null,
  ]);
}

export function containsPublicFileUrl(value: unknown): boolean {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const record = value as Record<string, unknown>;
  return ["url", "public_url", "signed_url", "download_url"].some(
    (field) => typeof record[field] === "string" && record[field] !== "",
  );
}
