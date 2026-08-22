import { DomainInvariantError } from "../errors.js";
import type { Clock } from "../primitives/clock.js";
import type { UtcInstant } from "../primitives/instant.js";
import { parseUuid, type Uuid } from "../primitives/opaque.js";
import { Version } from "../primitives/version.js";

export type SyntheticCompanyId = Uuid<"SyntheticCompany">;
export type SyntheticActorId = Uuid<"SyntheticActor">;
export type SyntheticRecordId = Uuid<"SyntheticRecord">;
export type SyntheticOperationId = Uuid<"SyntheticOperation">;
export type SyntheticCorrelationId = Uuid<"SyntheticCorrelation">;
export type SyntheticOutboxId = Uuid<"SyntheticOutbox">;

export function syntheticCompanyId(value: string): SyntheticCompanyId {
  return parseUuid<"SyntheticCompany">(value);
}

export function syntheticActorId(value: string): SyntheticActorId {
  return parseUuid<"SyntheticActor">(value);
}

export function syntheticRecordId(value: string): SyntheticRecordId {
  return parseUuid<"SyntheticRecord">(value);
}

export function syntheticOperationId(value: string): SyntheticOperationId {
  return parseUuid<"SyntheticOperation">(value);
}

export function syntheticCorrelationId(value: string): SyntheticCorrelationId {
  return parseUuid<"SyntheticCorrelation">(value);
}

export function syntheticOutboxId(value: string): SyntheticOutboxId {
  return parseUuid<"SyntheticOutbox">(value);
}

export interface SyntheticRecord {
  readonly id: SyntheticRecordId;
  readonly companyId: SyntheticCompanyId;
  readonly code: string;
  readonly value: string;
  readonly version: Version;
}

export interface SyntheticAuditPlan {
  readonly outcome: "SUCESSO";
  readonly companyId: SyntheticCompanyId;
  readonly actorId: SyntheticActorId;
  readonly operationId: SyntheticOperationId;
  readonly correlationId: SyntheticCorrelationId;
  readonly action: "ETP00.REGISTRO_SINTETICO.GRAVAR";
  readonly previousVersion: Version | null;
  readonly finalVersion: Version;
  readonly changedFields: readonly {
    readonly field: "codigo" | "valor";
    readonly before: string | null;
    readonly after: string;
  }[];
  readonly occurredAt: UtcInstant;
}

export interface SyntheticOutboxPlan {
  readonly id: SyntheticOutboxId;
  readonly companyId: SyntheticCompanyId;
  readonly actorId: SyntheticActorId;
  readonly operationId: SyntheticOperationId;
  readonly correlationId: SyntheticCorrelationId;
  readonly type: "ETP00.GERAR_EVIDENCIA_PRIVADA";
  readonly recordId: SyntheticRecordId;
  readonly createdAt: UtcInstant;
}

export interface SyntheticMutationPlan {
  readonly record: SyntheticRecord;
  readonly audit: SyntheticAuditPlan;
  readonly outbox: SyntheticOutboxPlan;
  readonly canonicalIntent: string;
}

function validateText(code: string, value: string): void {
  if (!/^[A-Z][A-Z0-9_.-]{2,79}$/.test(code)) {
    throw new DomainInvariantError(
      "CODIGO_SINTETICO_INVALIDO",
      "O código sintético deve ser canônico e limitado.",
    );
  }

  if (value.length < 1 || value.length > 200 || /[\r\n]/.test(value)) {
    throw new DomainInvariantError(
      "VALOR_SINTETICO_INVALIDO",
      "O valor sintético deve ser curto e não conter quebras de linha.",
    );
  }
}

export function planSyntheticEnterpriseMutation(input: {
  readonly companyId: SyntheticCompanyId;
  readonly actorId: SyntheticActorId;
  readonly operationId: SyntheticOperationId;
  readonly correlationId: SyntheticCorrelationId;
  readonly outboxId: SyntheticOutboxId;
  readonly recordId: SyntheticRecordId;
  readonly code: string;
  readonly value: string;
  readonly expectedVersion?: Version;
  readonly existing?: SyntheticRecord;
  readonly clock: Clock;
}): SyntheticMutationPlan {
  validateText(input.code, input.value);

  if (
    input.existing !== undefined &&
    input.existing.companyId !== input.companyId
  ) {
    throw new DomainInvariantError(
      "EMPRESA_DIVERGENTE",
      "O registro não pertence à empresa da transação.",
    );
  }

  if (input.existing !== undefined && input.existing.id !== input.recordId) {
    throw new DomainInvariantError(
      "REGISTRO_DIVERGENTE",
      "A atualização deve preservar o identificador do registro existente.",
    );
  }

  if (input.existing === undefined && input.expectedVersion !== undefined) {
    throw new DomainInvariantError(
      "VERSAO_INESPERADA_NA_CRIACAO",
      "Uma criação não recebe versão anterior.",
    );
  }

  if (input.existing !== undefined) {
    if (
      input.expectedVersion === undefined ||
      !input.existing.version.equals(input.expectedVersion)
    ) {
      throw new DomainInvariantError(
        "VERSAO_DESATUALIZADA",
        "A atualização exige a versão atual exata.",
      );
    }
  }

  const previousVersion = input.existing?.version ?? null;
  const finalVersion = previousVersion?.next() ?? Version.initial();
  const occurredAt = input.clock.now();
  const record = Object.freeze({
    id: input.recordId,
    companyId: input.companyId,
    code: input.code,
    value: input.value,
    version: finalVersion,
  });

  const changedFields = [
    ...(input.existing?.code === input.code
      ? []
      : [
          Object.freeze({
            field: "codigo" as const,
            before: input.existing?.code ?? null,
            after: input.code,
          }),
        ]),
    ...(input.existing?.value === input.value
      ? []
      : [
          Object.freeze({
            field: "valor" as const,
            before: input.existing?.value ?? null,
            after: input.value,
          }),
        ]),
  ];

  if (changedFields.length === 0) {
    throw new DomainInvariantError(
      "OPERACAO_SEM_ALTERACAO",
      "A mutação sintética exige alteração efetiva.",
    );
  }

  const canonicalIntent = JSON.stringify([
    "ETP00_SYNTHETIC_INTENT_V1",
    input.companyId,
    input.recordId,
    input.code,
    input.value,
    input.expectedVersion?.value ?? null,
  ]);

  return Object.freeze({
    record,
    audit: Object.freeze({
      outcome: "SUCESSO" as const,
      companyId: input.companyId,
      actorId: input.actorId,
      operationId: input.operationId,
      correlationId: input.correlationId,
      action: "ETP00.REGISTRO_SINTETICO.GRAVAR" as const,
      previousVersion,
      finalVersion,
      changedFields: Object.freeze(changedFields),
      occurredAt,
    }),
    outbox: Object.freeze({
      id: input.outboxId,
      companyId: input.companyId,
      actorId: input.actorId,
      operationId: input.operationId,
      correlationId: input.correlationId,
      type: "ETP00.GERAR_EVIDENCIA_PRIVADA" as const,
      recordId: input.recordId,
      createdAt: occurredAt,
    }),
    canonicalIntent,
  });
}
