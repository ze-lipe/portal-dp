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
  planSyntheticEnterpriseMutation,
  syntheticActorId,
  syntheticCompanyId,
  syntheticCorrelationId,
  syntheticOperationId,
  syntheticOutboxId,
  syntheticRecordId,
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
}

export interface SyntheticProofResult {
  operacao_id: string;
  empresa_id: string;
  registro_id: string;
  versao_final: 1;
  resultado: "CONCLUIDA" | "REPETICAO_RECONCILIADA";
}

export interface SyntheticProofInfrastructureIds {
  operationId: OperacaoId;
  outboxTaskId: MensagemOutboxId;
  privateObjectId: ArquivoPrivadoId;
}

type IdempotencyReplay = {
  status: "IN_PROGRESS" | "COMPLETED" | "FAILED";
  response_body: Record<string, unknown> | null;
};

type DeniedSyntheticProof = { denied: true };
type SyntheticProofTransactionOutcome =
  SyntheticProofResult | DeniedSyntheticProof;

const deniedSyntheticProof: DeniedSyntheticProof = Object.freeze({
  denied: true,
});

export async function executeSyntheticEnterpriseCommand(
  pool: Pool,
  command: SyntheticEnterpriseCommand,
  ids: SyntheticProofInfrastructureIds,
): Promise<SyntheticEnterpriseResult> {
  if (command.intencao.versao_esperada !== undefined) {
    throw new Error("ETP-00 vertical proof accepts creation only");
  }
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
  });
  return result as SyntheticEnterpriseResult;
}

export async function executeSyntheticProof(
  pool: Pool,
  command: SyntheticProofCommand,
): Promise<SyntheticProofResult> {
  const plan = planSyntheticEnterpriseMutation({
    companyId: syntheticCompanyId(command.companyId),
    actorId: syntheticActorId(command.actorId),
    correlationId: syntheticCorrelationId(command.correlationId),
    operationId: syntheticOperationId(command.operationId),
    recordId: syntheticRecordId(command.proofRootId),
    outboxId: syntheticOutboxId(command.outboxTaskId),
    code: command.code,
    value: command.value,
    clock: new SystemClock(),
  });
  const contractIntent = canonicalSyntheticIntent({
    empresa_id:
      command.companyId as SyntheticEnterpriseCommand["intencao"]["empresa_id"],
    registro_id:
      command.proofRootId as SyntheticEnterpriseCommand["intencao"]["registro_id"],
    codigo: command.code,
    valor: command.value,
  });
  if (plan.canonicalIntent !== contractIntent) {
    throw new Error("Synthetic intent canonicalization drift detected");
  }
  if (
    command.idempotencyKey.length < 8 ||
    command.idempotencyKey.length > 200
  ) {
    throw new Error(
      "Idempotency key must contain between 8 and 200 characters",
    );
  }
  const intentHash = createHash("sha256").update(plan.canonicalIntent).digest();
  const outcome = await withTenantTransaction<SyntheticProofTransactionOutcome>(
    pool,
    {
      companyId: command.companyId,
      actorId: command.actorId,
      correlationId: command.correlationId,
    },
    async (client) => {
      // A autorização é relida e bloqueada antes de consultar a idempotência.
      // Isso impede reproduzir uma resposta antiga depois da revogação do acesso.
      const target = await client.query<{
        content_hash: Buffer;
        authorized: boolean;
      }>(
        `SELECT content_hash, authorized
           FROM portal_dp.lock_synthetic_authorization()`,
      );
      const targetState = target.rows[0];
      if (!targetState) return deniedSyntheticProof;

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

      // Negócio, auditoria, outbox e conclusão idempotente pertencem à mesma
      // transação: se qualquer parte falhar, todas as demais são desfeitas.
      await client.query(
        `INSERT INTO portal_dp.enterprise_proof_roots
          (company_id, id, proof_key, payload, version, created_by, updated_by)
         VALUES ($1, $2, $3, $4::jsonb, 1, $5, $5)`,
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

      const evidence = Buffer.from(
        JSON.stringify({
          schema: "ETP00_PRIVATE_EVIDENCE_V1",
          companyId: command.companyId,
          proofRootId: command.proofRootId,
          operationId: command.operationId,
          synthetic: true,
        }),
        "utf8",
      );
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
                 'ETP00-PROOF-CREATE',
                 'ETP00.REGISTRO_SINTETICO.GRAVAR',
                 'SUCESSO', 'enterprise_proof_root', $6, NULL, 1,
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

      const result: SyntheticProofResult = {
        operacao_id: command.operationId,
        empresa_id: command.companyId,
        registro_id: command.proofRootId,
        versao_final: 1,
        resultado: "CONCLUIDA",
      };
      const completion = await client.query<{ completed: boolean }>(
        `SELECT portal_dp.complete_idempotency($1, $2, 201, $3::jsonb) AS completed`,
        [command.idempotencyKey, intentHash, JSON.stringify(result)],
      );
      if (!completion.rows[0]?.completed) {
        throw new Error("Idempotency completion was not applied");
      }
      return result;
    },
  );
  if ("denied" in outcome) {
    throw new Error("Synthetic operation is not authorized");
  }
  return outcome;
}

async function reconcileExisting(
  client: PoolClient,
  command: SyntheticProofCommand,
): Promise<SyntheticProofTransactionOutcome> {
  // Estado incerto nunca dispara a mutação novamente. O chamador primeiro
  // reconcilia o resultado persistido para não criar um efeito duplicado.
  const record = await readExistingIdempotency(client, command);
  if (record?.status !== "COMPLETED" || !record.response_body) {
    throw new Error(
      "Idempotent operation outcome is uncertain; reconcile before retrying",
    );
  }
  if (record.response_body["resultado"] === "NEGADO") {
    return deniedSyntheticProof;
  }
  return {
    operacao_id: String(record.response_body["operacao_id"]),
    empresa_id: String(record.response_body["empresa_id"]),
    registro_id: String(record.response_body["registro_id"]),
    versao_final: 1,
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
