import { createHash, randomUUID } from "node:crypto";

import {
  canonicalSyntheticIntent,
  type ArquivoPrivadoId,
  type MensagemOutboxId,
  type OperacaoId,
  type SyntheticEnterpriseCommand,
  type SyntheticEnterpriseResult,
} from "@portal-dp/contracts";
import {
  SystemClock,
  Version,
  planSyntheticEnterpriseMutation,
  syntheticActorId,
  syntheticCompanyId,
  syntheticCorrelationId,
  syntheticOperationId,
  syntheticOutboxId,
  syntheticRecordId,
  type SyntheticRecord,
} from "@portal-dp/domain";
import type { Pool, PoolClient } from "pg";

import { withTenantTransaction } from "./tenant-transaction.js";

export interface SyntheticProofCommand {
  companyId: string;
  actorId: string;
  correlationId: string;
  operationId: string;
  proofRootId: string;
  outboxTaskId: string;
  privateObjectId: string;
  idempotencyKey: string;
  code: string;
  value: string;
  expectedVersion?: number;
  expectedContextVersion?: number;
}

export interface SyntheticProofCompletedResult {
  operacao_id: string;
  empresa_id: string;
  registro_id: string;
  versao_final: number;
  resultado: "CONCLUIDA" | "REPETICAO_RECONCILIADA";
}

export interface SyntheticProofInProgressResult {
  operacao_id: string;
  empresa_id: string;
  registro_id: string;
  resultado: "EM_PROCESSAMENTO";
}

export interface SyntheticProofNaturalKeyResult {
  operacao_id: string;
  empresa_id: string;
  registro_id: string;
  versao_final: number;
  resultado: "CHAVE_NATURAL_EXISTENTE";
}

export type SyntheticProofResult =
  | SyntheticProofCompletedResult
  | SyntheticProofInProgressResult
  | SyntheticProofNaturalKeyResult;

export interface SyntheticProofInfrastructureIds {
  operationId: OperacaoId;
  outboxTaskId: MensagemOutboxId;
  privateObjectId: ArquivoPrivadoId;
}

export interface SyntheticProofPreconditions {
  expectedContextVersion?: number;
}

type IdempotencyReplay = {
  status: "IN_PROGRESS" | "COMPLETED" | "FAILED";
  response_body: Record<string, unknown> | null;
};

type ExistingProofRow = {
  id: string;
  proof_key: string;
  payload: Record<string, unknown>;
  version: number;
};

type DeniedSyntheticProof = { denied: true };
type SyntheticProofTransactionOutcome =
  SyntheticProofResult | DeniedSyntheticProof;

const deniedSyntheticProof: DeniedSyntheticProof = Object.freeze({
  denied: true,
});

export class SyntheticVersionConflictError extends Error {
  readonly code = "VERSAO_DESATUALIZADA";

  constructor(readonly currentVersion: number) {
    super("Synthetic record version is stale");
    this.name = "SyntheticVersionConflictError";
  }
}

export class SyntheticContextVersionConflictError extends Error {
  readonly code = "CONTEXTO_DESATUALIZADO";

  constructor(readonly currentContextVersion: number) {
    super("Synthetic company context version is stale");
    this.name = "SyntheticContextVersionConflictError";
  }
}

export class SyntheticAuthorizationDeniedError extends Error {
  readonly code = "RECURSO_NAO_ENCONTRADO";

  constructor() {
    super("Synthetic resource was not found");
    this.name = "SyntheticAuthorizationDeniedError";
  }
}

export async function executeSyntheticEnterpriseCommand(
  pool: Pool,
  command: SyntheticEnterpriseCommand,
  ids: SyntheticProofInfrastructureIds,
  preconditions: SyntheticProofPreconditions = {},
): Promise<SyntheticEnterpriseResult> {
  const result = await executeSyntheticProof(pool, {
    companyId: command.intencao.empresa_id,
    actorId: command.ator_id,
    correlationId: command.correlacao_id,
    operationId: ids.operationId,
    proofRootId: command.intencao.registro_id,
    outboxTaskId: ids.outboxTaskId,
    privateObjectId: ids.privateObjectId,
    idempotencyKey: command.idempotency_key,
    code: command.intencao.codigo,
    value: command.intencao.valor,
    ...(command.intencao.versao_esperada === undefined
      ? {}
      : { expectedVersion: command.intencao.versao_esperada }),
    ...(preconditions.expectedContextVersion === undefined
      ? {}
      : { expectedContextVersion: preconditions.expectedContextVersion }),
  });
  return result as SyntheticEnterpriseResult;
}

export async function executeSyntheticProof(
  pool: Pool,
  command: SyntheticProofCommand,
): Promise<SyntheticProofResult> {
  validateCommandPreconditions(command);
  const contractIntent = canonicalSyntheticIntent({
    empresa_id:
      command.companyId as SyntheticEnterpriseCommand["intencao"]["empresa_id"],
    registro_id:
      command.proofRootId as SyntheticEnterpriseCommand["intencao"]["registro_id"],
    codigo: command.code,
    valor: command.value,
    ...(command.expectedVersion === undefined
      ? {}
      : { versao_esperada: command.expectedVersion }),
  });
  const intentHash = createHash("sha256").update(contractIntent).digest();

  const outcome = await withTenantTransaction<SyntheticProofTransactionOutcome>(
    pool,
    {
      companyId: command.companyId,
      actorId: command.actorId,
      correlationId: command.correlationId,
    },
    async (client) => {
      // A autorização bloqueia empresa e concessão. A versão do contexto é
      // comparada antes da reivindicação idempotente ou de qualquer mutação.
      const target = await client.query<{
        content_hash: Buffer;
        authorized: boolean;
        context_version: number;
      }>(
        `SELECT auth_state.content_hash,
                auth_state.authorized,
                company.version AS context_version
           FROM portal_dp.lock_synthetic_authorization() AS auth_state
           JOIN portal_dp.companies AS company
             ON company.id = portal_dp.current_company_id()`,
      );
      const targetState = target.rows[0];
      if (!targetState) return deniedSyntheticProof;
      if (
        command.expectedContextVersion !== undefined &&
        targetState.context_version !== command.expectedContextVersion
      ) {
        throw new SyntheticContextVersionConflictError(
          targetState.context_version,
        );
      }

      const claim = await client.query<{ claimed: boolean }>(
        "SELECT portal_dp.claim_idempotency($1, $2, $3, $4) AS claimed",
        [
          command.idempotencyKey,
          intentHash,
          command.operationId,
          command.correlationId,
        ],
      );
      const claimed = claim.rows[0]?.claimed === true;

      if (!targetState.authorized || targetState.content_hash.length !== 32) {
        await persistDeniedAttempt(client, command, intentHash, claimed);
        return deniedSyntheticProof;
      }
      if (!claimed) return reconcileExisting(client, command);

      const existing = await readProofForUpdate(client, command.proofRootId);
      if (command.expectedVersion !== undefined && !existing) {
        await persistDeniedAttempt(client, command, intentHash, true);
        return deniedSyntheticProof;
      }
      if (
        existing &&
        command.expectedVersion !== undefined &&
        existing.version !== command.expectedVersion
      ) {
        throw new SyntheticVersionConflictError(existing.version);
      }
      if (existing && command.expectedVersion === undefined) {
        throw new SyntheticVersionConflictError(existing.version);
      }

      const plan = planMutation(command, existing);
      if (plan.canonicalIntent !== contractIntent) {
        throw new Error("Synthetic intent canonicalization drift detected");
      }

      if (existing) {
        const updated = await client.query<{ id: string }>(
          `UPDATE portal_dp.enterprise_proof_roots
              SET proof_key = $3,
                  payload = $4::jsonb,
                  version = $5,
                  updated_at = clock_timestamp(),
                  updated_by = $6
            WHERE company_id = $1
              AND id = $2
              AND version = $7
          RETURNING id`,
          [
            command.companyId,
            command.proofRootId,
            plan.record.code,
            JSON.stringify({
              code: plan.record.code,
              value: plan.record.value,
              synthetic: true,
            }),
            plan.record.version.value,
            command.actorId,
            command.expectedVersion,
          ],
        );
        if (updated.rowCount !== 1) {
          throw new SyntheticVersionConflictError(existing.version);
        }
      } else {
        const inserted = await client.query<{ id: string }>(
          `INSERT INTO portal_dp.enterprise_proof_roots
            (company_id, id, proof_key, payload, version, created_by, updated_by)
           VALUES ($1, $2, $3, $4::jsonb, 1, $5, $5)
           ON CONFLICT (company_id, proof_key) DO NOTHING
           RETURNING id`,
          [
            command.companyId,
            command.proofRootId,
            plan.record.code,
            JSON.stringify({
              code: plan.record.code,
              value: plan.record.value,
              synthetic: true,
            }),
            command.actorId,
          ],
        );
        if (inserted.rowCount !== 1) {
          return persistNaturalKeyConflict(
            client,
            command,
            intentHash,
            plan.record.code,
          );
        }
      }

      const evidence = createPrivateEvidence(command);
      const evidenceHash = createHash("sha256").update(evidence).digest("hex");
      const auditSequence = await nextAuditEventSequence(
        client,
        command.operationId,
      );
      await client.query(
        `INSERT INTO portal_dp.audit_events
          (company_id, id, actor_id, operation_id, event_sequence,
           correlation_id, idempotency_actor_id, idempotency_key,
           transition_id, action_code,
           result, entity_type, entity_id, previous_version, final_version,
           change_set)
         VALUES ($1, $2, $3, $2, $8, $4, $3, $5,
                 $9,
                 'ETP00.REGISTRO_SINTETICO.GRAVAR',
                 'SUCESSO', 'enterprise_proof_root', $6, $10, $11,
                 $7::jsonb)`,
        [
          command.companyId,
          command.operationId,
          command.actorId,
          command.correlationId,
          command.idempotencyKey,
          command.proofRootId,
          JSON.stringify({
            mudancas: plan.audit.changedFields.map((change) => ({
              campo: change.field,
              classificacao: "INTERNA",
              anterior: change.before,
              novo: change.after,
            })),
          }),
          auditSequence,
          existing ? "ETP00-PROOF-UPDATE" : "ETP00-PROOF-CREATE",
          plan.audit.previousVersion?.value ?? null,
          plan.audit.finalVersion.value,
        ],
      );
      await client.query(
        `INSERT INTO portal_dp.outbox_tasks
          (company_id, id, proof_root_id, actor_id, operation_id,
           correlation_id, idempotency_key, task_type, dedupe_key, payload)
         VALUES ($1, $2, $3, $4, $5, $6, $7,
                 'ETP00.GERAR_EVIDENCIA_PRIVADA', $8, $9::jsonb)`,
        [
          command.companyId,
          command.outboxTaskId,
          command.proofRootId,
          command.actorId,
          command.operationId,
          command.correlationId,
          command.idempotencyKey,
          `ETP00:${command.operationId}`,
          JSON.stringify({
            object_id: command.privateObjectId,
            owner_type: "synthetic_operation",
            owner_id: command.operationId,
            media_type: "application/json",
            content_base64: evidence.toString("base64"),
            sha256: evidenceHash,
          }),
        ],
      );

      const result: SyntheticProofCompletedResult = {
        operacao_id: command.operationId,
        empresa_id: command.companyId,
        registro_id: command.proofRootId,
        versao_final: plan.record.version.value,
        resultado: "CONCLUIDA",
      };
      const completion = await client.query<{ completed: boolean }>(
        `SELECT portal_dp.complete_idempotency($1, $2, $3, $4::jsonb) AS completed`,
        [
          command.idempotencyKey,
          intentHash,
          existing ? 200 : 201,
          JSON.stringify(result),
        ],
      );
      if (!completion.rows[0]?.completed) {
        throw new Error("Idempotency completion was not applied");
      }
      return result;
    },
  );
  if ("denied" in outcome) {
    // A fronteira HTTP transforma esta negação tipada em 404 neutro. O motivo
    // real permanece apenas na auditoria protegida do mesmo tenant.
    throw new SyntheticAuthorizationDeniedError();
  }
  return outcome;
}

function validateCommandPreconditions(command: SyntheticProofCommand): void {
  if (
    command.idempotencyKey.length < 8 ||
    command.idempotencyKey.length > 200
  ) {
    throw new Error(
      "Idempotency key must contain between 8 and 200 characters",
    );
  }
  for (const [name, value] of [
    ["expectedVersion", command.expectedVersion],
    ["expectedContextVersion", command.expectedContextVersion],
  ] as const) {
    if (value !== undefined && (!Number.isSafeInteger(value) || value < 1)) {
      throw new Error(`${name} must be a positive safe integer`);
    }
  }
}

function planMutation(
  command: SyntheticProofCommand,
  existing: ExistingProofRow | undefined,
) {
  const existingRecord: SyntheticRecord | undefined = existing
    ? {
        id: syntheticRecordId(existing.id),
        companyId: syntheticCompanyId(command.companyId),
        code: existing.proof_key,
        value: readSyntheticValue(existing.payload),
        version: Version.of(existing.version),
      }
    : undefined;
  return planSyntheticEnterpriseMutation({
    companyId: syntheticCompanyId(command.companyId),
    actorId: syntheticActorId(command.actorId),
    correlationId: syntheticCorrelationId(command.correlationId),
    operationId: syntheticOperationId(command.operationId),
    recordId: syntheticRecordId(command.proofRootId),
    outboxId: syntheticOutboxId(command.outboxTaskId),
    code: command.code,
    value: command.value,
    clock: new SystemClock(),
    ...(command.expectedVersion === undefined
      ? {}
      : { expectedVersion: Version.of(command.expectedVersion) }),
    ...(existingRecord === undefined ? {} : { existing: existingRecord }),
  });
}

function readSyntheticValue(payload: Record<string, unknown>): string {
  const value = payload["value"];
  if (typeof value !== "string") {
    throw new Error("Stored synthetic record payload is invalid");
  }
  return value;
}

async function readProofForUpdate(
  client: PoolClient,
  proofRootId: string,
): Promise<ExistingProofRow | undefined> {
  const result = await client.query<ExistingProofRow>(
    `SELECT id, proof_key, payload, version
       FROM portal_dp.enterprise_proof_roots
      WHERE id = $1
      FOR UPDATE`,
    [proofRootId],
  );
  return result.rows[0];
}

function createPrivateEvidence(command: SyntheticProofCommand): Buffer {
  return Buffer.from(
    JSON.stringify({
      schema: "ETP00_PRIVATE_EVIDENCE_V1",
      companyId: command.companyId,
      proofRootId: command.proofRootId,
      operationId: command.operationId,
      synthetic: true,
    }),
    "utf8",
  );
}

async function persistNaturalKeyConflict(
  client: PoolClient,
  command: SyntheticProofCommand,
  intentHash: Buffer,
  proofKey: string,
): Promise<SyntheticProofNaturalKeyResult> {
  // O perdedor da corrida só recebe o identificador e a versão da entidade que
  // a própria autorização empresarial permite consultar; nenhum dado é vazado.
  const existing = await client.query<{ id: string; version: number }>(
    `SELECT id, version
       FROM portal_dp.enterprise_proof_roots
      WHERE proof_key = $1`,
    [proofKey],
  );
  const record = existing.rows[0];
  if (!record) {
    throw new Error("Natural key conflict could not be reconciled");
  }
  const eventSequence = await nextAuditEventSequence(
    client,
    command.operationId,
  );
  await client.query(
    `INSERT INTO portal_dp.audit_events
      (company_id, id, actor_id, operation_id, event_sequence,
       correlation_id, idempotency_actor_id, idempotency_key,
       transition_id, action_code, result, entity_type, entity_id,
       safe_error_reference, change_set)
     VALUES ($1, $2, $3, $2, $4, $5, $3, $6,
             'ETP00-PROOF-NATURAL-KEY-CONFLICT',
             'ETP00.REGISTRO_SINTETICO.GRAVAR', 'CANCELADO',
             'enterprise_proof_root', $7,
             'CHAVE_NATURAL_EXISTENTE', '{"mudancas":[]}'::jsonb)`,
    [
      command.companyId,
      command.operationId,
      command.actorId,
      eventSequence,
      command.correlationId,
      command.idempotencyKey,
      record.id,
    ],
  );
  const result: SyntheticProofNaturalKeyResult = {
    operacao_id: command.operationId,
    empresa_id: command.companyId,
    registro_id: record.id,
    versao_final: record.version,
    resultado: "CHAVE_NATURAL_EXISTENTE",
  };
  const completion = await client.query<{ completed: boolean }>(
    `SELECT portal_dp.complete_idempotency($1, $2, 409, $3::jsonb) AS completed`,
    [command.idempotencyKey, intentHash, JSON.stringify(result)],
  );
  if (!completion.rows[0]?.completed) {
    throw new Error("Natural key conflict completion was not applied");
  }
  return result;
}

async function reconcileExisting(
  client: PoolClient,
  command: SyntheticProofCommand,
): Promise<SyntheticProofTransactionOutcome> {
  // Estado em processamento é consultável, mas nunca reinicia a mutação.
  const record = await readExistingIdempotency(client, command);
  if (record?.status === "IN_PROGRESS") {
    return {
      operacao_id: command.operationId,
      empresa_id: command.companyId,
      registro_id: command.proofRootId,
      resultado: "EM_PROCESSAMENTO",
    };
  }
  if (record?.status !== "COMPLETED" || !record.response_body) {
    throw new Error(
      "Idempotent operation outcome is uncertain; reconcile before retrying",
    );
  }
  if (record.response_body["resultado"] === "NEGADO") {
    return deniedSyntheticProof;
  }
  if (record.response_body["resultado"] === "CHAVE_NATURAL_EXISTENTE") {
    return {
      operacao_id: String(record.response_body["operacao_id"]),
      empresa_id: String(record.response_body["empresa_id"]),
      registro_id: String(record.response_body["registro_id"]),
      versao_final: Number(record.response_body["versao_final"]),
      resultado: "CHAVE_NATURAL_EXISTENTE",
    };
  }
  return {
    operacao_id: String(record.response_body["operacao_id"]),
    empresa_id: String(record.response_body["empresa_id"]),
    registro_id: String(record.response_body["registro_id"]),
    versao_final: Number(record.response_body["versao_final"]),
    resultado: "REPETICAO_RECONCILIADA",
  };
}

async function readExistingIdempotency(
  client: PoolClient,
  command: SyntheticProofCommand,
): Promise<IdempotencyReplay | undefined> {
  const replay = await client.query<IdempotencyReplay>(
    `SELECT status, response_body
       FROM portal_dp.idempotency_records
      WHERE company_id = $1
        AND scope_type = 'EMPRESARIAL'
        AND actor_id = $2
        AND idempotency_key = $3
        AND operation_id = $4`,
    [
      command.companyId,
      command.actorId,
      command.idempotencyKey,
      command.operationId,
    ],
  );
  return replay.rows[0];
}

async function persistDeniedAttempt(
  client: PoolClient,
  command: SyntheticProofCommand,
  intentHash: Buffer,
  claimed: boolean,
): Promise<void> {
  // A negativa preserva a auditoria, mas usa referência neutra para não revelar
  // se o registro existe em outra empresa ou se a permissão foi revogada.
  if (!claimed) {
    const replay = await readExistingIdempotency(client, command);
    if (replay?.response_body?.["resultado"] === "NEGADO") return;

    const priorDenial = await client.query<{ denied: boolean }>(
      `SELECT EXISTS (
         SELECT 1
           FROM portal_dp.audit_events
          WHERE company_id = $1
            AND operation_id = $2
            AND action_code = 'ETP00.REGISTRO_SINTETICO.GRAVAR'
            AND result = 'NEGADO'
       ) AS denied`,
      [command.companyId, command.operationId],
    );
    if (priorDenial.rows[0]?.denied) return;
  }

  const eventId = claimed ? command.operationId : randomUUID();
  const eventSequence = await nextAuditEventSequence(
    client,
    command.operationId,
  );
  const transition = claimed
    ? "ETP00-PROOF-CREATE"
    : "ETP00-PROOF-REPLAY-DENIED";
  await client.query(
    `INSERT INTO portal_dp.audit_events
      (company_id, id, actor_id, operation_id, event_sequence,
       correlation_id, idempotency_actor_id, idempotency_key,
       transition_id, action_code,
       result, entity_type, entity_id, safe_error_reference, change_set)
     VALUES ($1, $2, $3, $4, $5, $6, $3, $7, $8,
             'ETP00.REGISTRO_SINTETICO.GRAVAR',
             'NEGADO', 'enterprise_proof_root', $9,
             'RECURSO_NAO_ENCONTRADO', '{"mudancas":[]}'::jsonb)`,
    [
      command.companyId,
      eventId,
      command.actorId,
      command.operationId,
      eventSequence,
      command.correlationId,
      command.idempotencyKey,
      transition,
      command.proofRootId,
    ],
  );

  if (!claimed) return;
  const deniedCompletion = await client.query<{ completed: boolean }>(
    `SELECT portal_dp.complete_idempotency($1, $2, 404, $3::jsonb) AS completed`,
    [
      command.idempotencyKey,
      intentHash,
      JSON.stringify({
        resultado: "NEGADO",
        referencia_erro_segura: "RECURSO_NAO_ENCONTRADO",
      }),
    ],
  );
  if (!deniedCompletion.rows[0]?.completed) {
    throw new Error("Denied idempotency completion was not applied");
  }
}

async function nextAuditEventSequence(
  client: PoolClient,
  operationId: string,
): Promise<number> {
  const sequence = await client.query<{ event_sequence: number }>(
    `SELECT portal_dp.next_audit_event_sequence($1) AS event_sequence`,
    [operationId],
  );
  const value = sequence.rows[0]?.event_sequence;
  if (!Number.isInteger(value) || value === undefined || value < 1) {
    throw new Error("Audit event sequence allocation failed");
  }
  return value;
}
