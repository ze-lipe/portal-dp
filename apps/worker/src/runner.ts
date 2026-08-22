import { randomUUID } from "node:crypto";

import {
  assertLimitedServiceRole,
  withTenantTransaction,
} from "@portal-dp/database";
import {
  CircuitBreaker,
  CircuitOpenError,
  executeWithRetry,
  type FailureDisposition,
} from "@portal-dp/integrations";
import {
  currentTraceIdentifiers,
  recordDependencyAttempt,
  recordDependencyCircuitTransition,
  recordOutboxAttempt,
  recordOutboxLag,
  recordWorkerPoll,
  sanitizeOperationalEvent,
  withTelemetrySpan,
} from "@portal-dp/observability";
import {
  LocalPrivateObjectStore,
  PrivateObjectIntegrityError,
  type PrivateObjectStore,
} from "@portal-dp/storage";
import type { Pool } from "pg";

import type { WorkerConfig } from "./config.js";
import {
  InvalidTaskPayloadError,
  parseMaterializationPayload,
} from "./payload.js";

type OutboxTask = {
  company_id: string;
  id: string;
  actor_id: string;
  operation_id: string;
  correlation_id: string;
  idempotency_key: string;
  task_type: string;
  created_at: Date;
  lease_token: string;
  payload: unknown;
};

export class WorkerRunner {
  readonly #store: PrivateObjectStore;
  #initialized = false;
  #stopping = false;
  #nextCompanyIndex = 0;
  readonly #storageCircuit = new CircuitBreaker({
    failureThreshold: 3,
    openDurationMs: 30_000,
    onTransition: (from, to) =>
      recordDependencyCircuitTransition("private_object_store", from, to),
  });

  constructor(
    private readonly pool: Pool,
    private readonly config: WorkerConfig,
    store?: PrivateObjectStore,
  ) {
    this.#store =
      store ?? new LocalPrivateObjectStore(config.privateObjectRoot);
  }

  async start(): Promise<void> {
    while (!this.#stopping) {
      const processed = await this.runOnce();
      if (!processed && !this.#stopping)
        await delay(this.config.pollIntervalMs);
    }
  }

  async runOnce(): Promise<boolean> {
    if (!this.#initialized) {
      await assertLimitedServiceRole(
        this.pool,
        "portal_dp_worker",
        "portal_dp_worker_login",
      );
      this.#initialized = true;
    }

    for (const { companyId, index } of rotatedCompanyIds(
      this.config.companyIds,
      this.#nextCompanyIndex,
    )) {
      if (this.#stopping) return false;
      // O atraso é medido antes do lease para continuar visível mesmo quando
      // nenhuma tarefa puder ser obtida nesta passagem.
      await this.#observeOutboxLag(companyId);
      const task = await this.#lease(companyId);
      if (!task) continue;
      this.#nextCompanyIndex = (index + 1) % this.config.companyIds.length;
      try {
        await withTelemetrySpan(
          "portal_dp.outbox.process",
          {
            "portal.company_id": task.company_id,
            "portal.task_type": task.task_type,
          },
          async () => {
            try {
              await this.#process(task);
            } catch (error) {
              await this.#fail(task, error);
              throw error;
            }
          },
        );
      } catch {
        // A falha já foi persistida dentro do span; o loop continua vivo.
      }
      recordWorkerPoll();
      return true;
    }
    recordWorkerPoll();
    return false;
  }

  stop(): void {
    this.#stopping = true;
  }

  async #lease(companyId: string): Promise<OutboxTask | null> {
    return withTenantTransaction(
      this.pool,
      { companyId, actorId: this.config.actorId, correlationId: randomUUID() },
      async (client) => {
        const result = await client.query<OutboxTask>(
          `SELECT company_id, id, actor_id, operation_id, correlation_id,
                  idempotency_key, task_type, lease_token, payload, created_at
             FROM portal_dp.lease_next_outbox_task($1, $2)`,
          [this.config.workerId, this.config.leaseSeconds],
        );
        return result.rows[0] ?? null;
      },
    );
  }

  async #observeOutboxLag(companyId: string): Promise<void> {
    const correlationId = randomUUID();
    await withTelemetrySpan(
      "portal_dp.outbox.observe_lag",
      { "portal.company_id": companyId },
      async () => {
        const lagMs = await withTenantTransaction(
          this.pool,
          { companyId, actorId: this.config.actorId, correlationId },
          async (client) => {
            const result = await client.query<{ lag_ms: number | null }>(
              `SELECT extract(
                        epoch FROM clock_timestamp() - min(created_at)
                      )::double precision * 1000 AS lag_ms
                 FROM portal_dp.outbox_tasks
                WHERE (status = 'PENDING' AND available_at <= clock_timestamp())
                   OR (status = 'LEASED' AND lease_until <= clock_timestamp())`,
            );
            return result.rows[0]?.lag_ms ?? null;
          },
        );
        if (lagMs === null) return;
        const boundedLagMs = Math.max(0, lagMs);
        recordOutboxLag(boundedLagMs, "oldest_pending");
        if (boundedLagMs >= this.config.outboxDelayAlertMs) {
          log("warn", {
            event: "outbox_delay_threshold_exceeded",
            companyId,
            correlationId,
            lagMs: boundedLagMs,
            thresholdMs: this.config.outboxDelayAlertMs,
          });
        }
      },
    );
  }

  async #process(task: OutboxTask): Promise<void> {
    if (task.task_type !== "ETP00.GERAR_EVIDENCIA_PRIVADA") {
      throw new Error("Unsupported task type");
    }
    const payload = parseMaterializationPayload(task.payload);
    // O fluxo é retomável: reserva metadados, grava o objeto idempotente e só
    // então conclui metadados, auditoria e outbox na mesma transação.
    await this.#reserveMetadata(task, payload);
    await this.#putPrivateObject({
      companyId: task.company_id,
      objectId: payload.objectId,
      bytes: payload.bytes,
      expectedSha256: payload.sha256,
    });

    await withTenantTransaction(
      this.pool,
      {
        companyId: task.company_id,
        actorId: this.config.actorId,
        correlationId: task.correlation_id,
      },
      async (client) => {
        const finalized = await client.query<{ id: string }>(
          `UPDATE portal_dp.private_objects
              SET validation_status = 'AVAILABLE'
            WHERE company_id = $1
              AND id = $2
              AND source_task_id = $3
              AND validation_status IN ('PENDING_VALIDATION', 'AVAILABLE')
          RETURNING id`,
          [task.company_id, payload.objectId, task.id],
        );
        if (finalized.rowCount !== 1)
          throw new Error("Private object reservation is missing");

        const auditSequence = await client.query<{ value: number }>(
          `SELECT portal_dp.next_audit_event_sequence($1) AS value`,
          [task.operation_id],
        );
        const eventSequence = auditSequence.rows[0]?.value;
        if (!Number.isInteger(eventSequence) || eventSequence === undefined) {
          throw new Error("Audit event sequence allocation failed");
        }
        await client.query(
          `INSERT INTO portal_dp.audit_events
            (company_id, id, actor_id, operation_id, event_sequence,
             correlation_id, idempotency_actor_id, idempotency_key,
             transition_id, action_code,
             result, entity_type, entity_id, change_set)
           VALUES ($1, $2, $3, $4, $10, $5, $7, $6,
                   'ETP00-PRIVATE-OBJECT-MATERIALIZED',
                   'ETP00.ARQUIVO_PRIVADO.MATERIALIZAR',
                   'SUCESSO', 'private_object', $8, $9::jsonb)`,
          [
            task.company_id,
            randomUUID(),
            this.config.actorId,
            task.operation_id,
            task.correlation_id,
            task.idempotency_key,
            task.actor_id,
            payload.objectId,
            JSON.stringify({
              mudancas: [
                {
                  campo: "validation_status",
                  classificacao: "INTERNA",
                  anterior: "PENDING_VALIDATION",
                  novo: "AVAILABLE",
                },
              ],
            }),
            eventSequence,
          ],
        );
        const completion = await client.query<{ completed: boolean }>(
          "SELECT portal_dp.complete_outbox_task($1, $2, $3) AS completed",
          [task.id, this.config.workerId, task.lease_token],
        );
        if (!completion.rows[0]?.completed)
          throw new Error("Outbox lease is no longer valid");
      },
    );
    log("info", {
      event: "outbox_completed",
      companyId: task.company_id,
      taskId: task.id,
    });
    recordOutboxAttempt("succeeded");
  }

  async #putPrivateObject(
    input: Parameters<PrivateObjectStore["putIfAbsent"]>[0],
  ): Promise<void> {
    // Tentativas curtas tratam uma chamada ao armazenamento; se ainda falhar, a
    // outbox reagenda o efeito de forma durável e com limite próprio.
    await executeWithRetry({
      operation: async () =>
        this.#storageCircuit.execute(
          async () => this.#store.putIfAbsent(input),
          classifyStorageFailure,
        ),
      classify: classifyStorageFailure,
      policy: { maxAttempts: 2, baseDelayMs: 50, maxDelayMs: 100 },
      onAttempt: ({ attempt, outcome }) =>
        recordDependencyAttempt("private_object_store", attempt, outcome),
    });
  }

  async #reserveMetadata(
    task: OutboxTask,
    payload: ReturnType<typeof parseMaterializationPayload>,
  ): Promise<void> {
    // Um reprocessamento pode encontrar a reserva anterior, mas todos os campos
    // precisam coincidir com a tarefa original para manter a idempotência.
    await withTenantTransaction(
      this.pool,
      {
        companyId: task.company_id,
        actorId: this.config.actorId,
        correlationId: task.correlation_id,
      },
      async (client) => {
        await client.query(
          `INSERT INTO portal_dp.private_objects
            (company_id, id, source_task_id, owner_type, owner_id,
             storage_key, media_type, byte_size, sha256,
             validation_status, created_by)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8,
                   decode($9, 'hex'), 'PENDING_VALIDATION', $10)
           ON CONFLICT (company_id, source_task_id) DO NOTHING`,
          [
            task.company_id,
            payload.objectId,
            task.id,
            payload.ownerType,
            payload.ownerId,
            `companies/${task.company_id}/etp00/${payload.objectId}`,
            payload.mediaType,
            payload.bytes.byteLength,
            payload.sha256,
            this.config.actorId,
          ],
        );
        const existing = await client.query<{
          id: string;
          owner_type: string;
          owner_id: string;
          storage_key: string;
          media_type: string;
          hash: string;
          byte_size: string;
        }>(
          `SELECT id, owner_type, owner_id, storage_key, media_type,
                  encode(sha256, 'hex') AS hash, byte_size::text
             FROM portal_dp.private_objects
            WHERE source_task_id = $1`,
          [task.id],
        );
        const expectedStorageKey = `companies/${task.company_id}/etp00/${payload.objectId}`;
        const record = existing.rows[0];
        if (
          record?.id !== payload.objectId ||
          record.owner_type !== payload.ownerType ||
          record.owner_id !== payload.ownerId ||
          record.storage_key !== expectedStorageKey ||
          record.media_type !== payload.mediaType ||
          record.hash !== payload.sha256 ||
          record.byte_size !== String(payload.bytes.byteLength)
        ) {
          throw new Error(
            "Materialized private object metadata differs from the task",
          );
        }
      },
    );
  }

  async #fail(task: OutboxTask, error: unknown): Promise<void> {
    const errorCode = classifyOutboxError(error);
    const nextStatus = await withTenantTransaction(
      this.pool,
      {
        companyId: task.company_id,
        actorId: this.config.actorId,
        correlationId: task.correlation_id,
      },
      async (client) => {
        const result = await client.query<{ next_status: string | null }>(
          "SELECT portal_dp.fail_outbox_task($1, $2, $3, $4) AS next_status",
          [task.id, this.config.workerId, task.lease_token, errorCode],
        );
        const status = result.rows[0]?.next_status ?? null;
        if (status === "FAILED") {
          await client.query(
            `UPDATE portal_dp.private_objects
                SET validation_status = 'REJECTED'
              WHERE company_id = $1
                AND source_task_id = $2
                AND validation_status = 'PENDING_VALIDATION'`,
            [task.company_id, task.id],
          );
        }
        return status;
      },
    );
    log("warn", {
      event: "outbox_failed",
      companyId: task.company_id,
      taskId: task.id,
      correlationId: task.correlation_id,
      nextStatus: nextStatus ?? "STALE_LEASE",
      errorCode,
    });
    recordOutboxAttempt(
      nextStatus === "PENDING"
        ? "retry"
        : nextStatus === null
          ? "stale_lease"
          : isRetryableOutboxCode(errorCode)
            ? "exhausted"
            : "permanent",
    );
  }
}

function classifyStorageFailure(error: unknown): FailureDisposition {
  if (error instanceof PrivateObjectIntegrityError) return "PERMANENT";
  if (error instanceof CircuitOpenError) return "TRANSIENT";
  if (
    hasErrorCode(error) &&
    ["EBUSY", "EIO", "EMFILE", "ENFILE", "ETIMEDOUT"].includes(error.code)
  ) {
    return "TRANSIENT";
  }
  return "PERMANENT";
}

function isRetryableOutboxCode(errorCode: string): boolean {
  return (
    errorCode === "DATABASE_TRANSIENT" || errorCode === "STORAGE_TRANSIENT"
  );
}

export function classifyOutboxError(error: unknown): string {
  // Somente códigos explicitamente conhecidos são repetíveis. Falhas
  // desconhecidas tornam-se permanentes para evitar ciclos infinitos.
  if (error instanceof InvalidTaskPayloadError) return error.safeCode;
  if (error instanceof PrivateObjectIntegrityError) return error.safeCode;
  if (error instanceof CircuitOpenError) return "STORAGE_TRANSIENT";
  if (error instanceof Error && error.message === "Unsupported task type") {
    return "UNSUPPORTED_TASK";
  }
  if (hasErrorCode(error)) {
    if (
      error.code.startsWith("08") ||
      ["40001", "40P01", "55P03", "57014", "57P01", "57P02", "57P03"].includes(
        error.code,
      )
    ) {
      return "DATABASE_TRANSIENT";
    }
    if (
      ["EBUSY", "EIO", "EMFILE", "ENFILE", "ETIMEDOUT"].includes(error.code)
    ) {
      return "STORAGE_TRANSIENT";
    }
  }
  return "PERMANENT_PROCESSING_FAILURE";
}

export function rotatedCompanyIds(
  companyIds: readonly string[],
  startIndex: number,
): Array<{ companyId: string; index: number }> {
  // O ponto inicial avança depois de cada tarefa para que uma empresa com fila
  // contínua não monopolize o worker.
  if (companyIds.length === 0) return [];
  const safeStart =
    Number.isSafeInteger(startIndex) && startIndex >= 0
      ? startIndex % companyIds.length
      : 0;
  return companyIds.map((_, offset) => {
    const index = (safeStart + offset) % companyIds.length;
    return { companyId: companyIds[index]!, index };
  });
}

function hasErrorCode(error: unknown): error is { code: string } {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string"
  );
}

function log(level: "info" | "warn", record: Record<string, unknown>): void {
  process.stdout.write(
    `${JSON.stringify({
      level,
      record: sanitizeOperationalEvent({
        ...record,
        ...currentTraceIdentifiers(),
      }),
    })}\n`,
  );
}

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}
