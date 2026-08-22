import { createHash, randomUUID } from "node:crypto";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import {
  assertLimitedServiceRole,
  executeSyntheticEnterpriseCommand,
  SyntheticAuthorizationDeniedError,
  SyntheticContextVersionConflictError,
  withTenantTransaction,
} from "@portal-dp/database";
import {
  canonicalSyntheticIntent,
  idempotencyKey,
  uuid,
  type SyntheticEnterpriseCommand,
} from "@portal-dp/contracts";
import {
  createSyntheticCommandForCompanyA,
  ETP00_IDS,
} from "@portal-dp/testing";
import { Pool } from "pg";
import { afterAll, beforeAll, describe, expect, test } from "vitest";

import { createApiApplication } from "../../../apps/api/src/app-factory.js";
import { loadConfig } from "../../../apps/api/src/config.js";
import { WorkerRunner } from "../../../apps/worker/src/runner.js";
import {
  ACTOR,
  COMPANY_A,
  COMPANY_B,
  COMPANY_UNKNOWN,
  applyMigrations,
  applySyntheticSeeds,
  createTestPool,
  queryTenant,
} from "./database-harness.js";
import { renderPageInRealBrowser } from "./real-browser.js";

let bootstrapPool: Pool;
let appPool: Pool;
let workerPool: Pool;
let privateObjectRoot: string;

const command = createSyntheticCommandForCompanyA();
const infrastructureIds = {
  operationId: uuid<"Operacao">(ETP00_IDS.operationA),
  outboxTaskId: uuid<"MensagemOutbox">(ETP00_IDS.outboxA),
  privateObjectId: uuid<"ArquivoPrivado">(ETP00_IDS.privateFileA),
};
const proof = {
  companyId: command.intencao.empresa_id,
  actorId: command.ator_id,
  correlationId: command.correlacao_id,
  operationId: infrastructureIds.operationId,
  proofRootId: command.intencao.registro_id,
  outboxTaskId: infrastructureIds.outboxTaskId,
  privateObjectId: infrastructureIds.privateObjectId,
  idempotencyKey: command.idempotency_key,
};

function createSyntheticCommand(input: {
  code: string;
  value: string;
  recordId?: string;
  expectedVersion?: number;
}): SyntheticEnterpriseCommand {
  return {
    ator_id: uuid<"Ator">(ACTOR),
    correlacao_id: uuid<"Correlacao">(randomUUID()),
    idempotency_key: idempotencyKey(`idem-etp00-${randomUUID()}`),
    intencao: {
      empresa_id: uuid<"Empresa">(COMPANY_A),
      registro_id: uuid<"RegistroSintetico">(input.recordId ?? randomUUID()),
      codigo: input.code,
      valor: input.value,
      ...(input.expectedVersion === undefined
        ? {}
        : { versao_esperada: input.expectedVersion }),
    },
  };
}

function createInfrastructureIds() {
  return {
    operationId: uuid<"Operacao">(randomUUID()),
    outboxTaskId: uuid<"MensagemOutbox">(randomUUID()),
    privateObjectId: uuid<"ArquivoPrivado">(randomUUID()),
  };
}

function servicePool(
  environmentKey: "DATABASE_URL" | "WORKER_DATABASE_URL",
): Pool {
  const connectionString = process.env[environmentKey]?.trim();
  if (!connectionString)
    throw new Error(`${environmentKey} is required for the vertical proof`);
  return new Pool({
    connectionString,
    max: 3,
    application_name: `portal-dp-etp00-${environmentKey.toLowerCase()}`,
    connectionTimeoutMillis: 10_000,
  });
}

async function setSyntheticActorGrant(
  actorId: string,
  granted: boolean,
): Promise<void> {
  const client = await bootstrapPool.connect();
  try {
    await client.query("BEGIN");
    await client.query(
      `SELECT set_config('app.company_id', $1, true),
              set_config('app.actor_id', $2, true),
              set_config('app.correlation_id', $3, true)`,
      [COMPANY_A, actorId, randomUUID()],
    );
    if (granted) {
      await client.query(
        `INSERT INTO portal_dp.synthetic_actor_company_grants
          (company_id, actor_id, granted_by)
         VALUES ($1, $2, $3)
         ON CONFLICT (company_id, actor_id) DO NOTHING`,
        [COMPANY_A, actorId, ACTOR],
      );
    } else {
      await client.query(
        `DELETE FROM portal_dp.synthetic_actor_company_grants
          WHERE company_id = $1 AND actor_id = $2`,
        [COMPANY_A, actorId],
      );
    }
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

beforeAll(async () => {
  bootstrapPool = createTestPool();
  await applyMigrations(bootstrapPool);
  await applySyntheticSeeds(bootstrapPool);
  appPool = servicePool("DATABASE_URL");
  workerPool = servicePool("WORKER_DATABASE_URL");
  privateObjectRoot = await mkdtemp(join(tmpdir(), "portal-dp-etp00-"));
  await assertLimitedServiceRole(
    appPool,
    "portal_dp_app",
    "portal_dp_app_login",
  );
});

afterAll(async () => {
  await Promise.all([bootstrapPool?.end(), appPool?.end(), workerPool?.end()]);
  if (privateObjectRoot)
    await rm(privateObjectRoot, { recursive: true, force: true });
});

// Os cenários compartilham a mesma prova sintética e verificam etapas encadeadas;
// executá-los em paralelo criaria disputas artificiais e resultados instáveis.
describe.sequential("ETP-00 synthetic vertical proof", () => {
  test("startup rejects a service login with any hidden extra membership", async () => {
    await bootstrapPool.query("GRANT portal_dp_ops TO portal_dp_app_login");
    try {
      await expect(
        assertLimitedServiceRole(
          appPool,
          "portal_dp_app",
          "portal_dp_app_login",
        ),
      ).rejects.toThrow(/not constrained/u);
    } finally {
      await bootstrapPool.query(
        "REVOKE portal_dp_ops FROM portal_dp_app_login",
      );
    }
    await expect(
      assertLimitedServiceRole(appPool, "portal_dp_app", "portal_dp_app_login"),
    ).resolves.toBeUndefined();
  });

  test("RESET ROLE returns the API to a powerless login, never to bootstrap", async () => {
    const client = await appPool.connect();
    try {
      const active = await client.query<{
        current_user: string;
        session_user: string;
      }>("SELECT current_user, session_user");
      expect(active.rows).toEqual([
        { current_user: "portal_dp_app", session_user: "portal_dp_app_login" },
      ]);

      await client.query("RESET ROLE");
      const reset = await client.query<{
        current_user: string;
        session_user: string;
      }>("SELECT current_user, session_user");
      expect(reset.rows).toEqual([
        {
          current_user: "portal_dp_app_login",
          session_user: "portal_dp_app_login",
        },
      ]);
      await expect(
        client.query("SELECT * FROM portal_dp.companies"),
      ).rejects.toMatchObject({
        code: "42501",
      });
      await client.query("SET ROLE portal_dp_app");
    } finally {
      client.release();
    }
  });

  test("serves the canonical public session contract through the real API", async () => {
    const productionConfig = loadConfig({
      ...process.env,
      NODE_ENV: "production",
      API_CORS_ENABLED: "false",
      ETP00_SYNTHETIC_PROOF_ENABLED: "false",
    });
    const app = await createApiApplication(productionConfig);
    try {
      const server = app.getHttpAdapter().getInstance();
      let publicSessionRequests = 0;
      server.addHook("onResponse", (request, _reply, done) => {
        if (request.method === "GET" && request.url === "/api/v1/sessao") {
          publicSessionRequests += 1;
        }
        done();
      });
      await app.listen(0, "127.0.0.1");

      const response = await server.inject({
        method: "GET",
        url: "/api/v1/sessao",
      });
      expect(response.statusCode).toBe(200);
      expect(response.headers["cache-control"]).toBe("no-store");
      expect(response.headers["x-correlation-id"]).toMatch(/^[0-9a-f-]{36}$/u);
      expect(response.headers["x-context-version"]).toBe(
        "public-etp00-0.0.0-etp00",
      );
      expect(response.headers["set-cookie"]).toContain("portal_dp_csrf=");
      expect(response.headers["set-cookie"]).toContain("HttpOnly");
      expect(response.headers["set-cookie"]).toContain("SameSite=Strict");
      expect(response.headers["set-cookie"]).toContain("Secure");
      expect(response.json()).toMatchObject({
        data: {
          estado: "PUBLICA",
          autenticada: false,
          contexto_versao: "public-etp00-0.0.0-etp00",
        },
        meta: { correlacao_id: response.headers["x-correlation-id"] },
      });

      const screen = await server.inject({ method: "GET", url: "/" });
      expect(screen.statusCode).toBe(200);
      expect(screen.headers["content-type"]).toContain("text/html");
      expect(screen.body).toContain('<div id="root"></div>');

      const live = await server.inject({ method: "GET", url: "/health/live" });
      expect(live.statusCode).toBe(200);
      expect(live.json()).toEqual({ status: "alive" });
      const ready = await server.inject({
        method: "GET",
        url: "/health/ready",
      });
      expect(ready.statusCode).toBe(200);
      expect(ready.json()).toEqual({ status: "ready" });
      const prefixedHealth = await server.inject({
        method: "GET",
        url: "/api/v1/health/ready",
      });
      expect(prefixedHealth.statusCode).toBe(404);

      // A rota de prova e compilada no artefato, mas deve permanecer inacessivel
      // quando a configuracao efetiva da aplicacao for de producao.
      const csrfToken = response.json().data.csrf_token as string;
      const cookie = String(response.headers["set-cookie"]).split(";")[0]!;
      const syntheticRoute = await server.inject({
        method: "PATCH",
        url: "/api/v1/etp00/provas-sinteticas/00000000-0000-4000-8000-000000000000",
        headers: {
          origin: productionConfig.webOrigin,
          cookie,
          "x-csrf-token": csrfToken,
          "x-company-id": COMPANY_A,
          "x-actor-id": ACTOR,
          "x-context-version": "1",
          "x-correlation-id": randomUUID(),
          "idempotency-key": `idem-etp00-production-${randomUUID()}`,
        },
        payload: {
          codigo: "PROVA-PRODUCAO-DESABILITADA",
          valor: "nao-deve-ser-processado",
          versao_esperada: 1,
        },
      });
      expect(syntheticRoute.statusCode).toBe(404);

      const requestsBeforeBrowser = publicSessionRequests;
      const renderedDom = await renderPageInRealBrowser(await app.getUrl());
      expect(publicSessionRequests).toBeGreaterThan(requestsBeforeBrowser);
      expect(renderedDom).toContain(
        "API conectada · versao public-etp00-0.0.0-etp00",
      );
      expect(renderedDom).not.toContain(
        "A base tecnica ainda nao esta disponivel.",
      );
    } finally {
      await app.close();
    }
  });

  test("commits business, audit, idempotency and outbox atomically for company A", async () => {
    await expect(
      executeSyntheticEnterpriseCommand(appPool, command, infrastructureIds),
    ).resolves.toEqual({
      operacao_id: proof.operationId,
      empresa_id: proof.companyId,
      registro_id: proof.proofRootId,
      versao_final: 1,
      resultado: "CONCLUIDA",
    });

    const snapshot = await withTenantTransaction(
      appPool,
      {
        companyId: proof.companyId,
        actorId: proof.actorId,
        correlationId: proof.correlationId,
      },
      async (client) => {
        const [roots, audits, idempotency, outbox] = await Promise.all([
          client.query<{ count: string }>(
            "SELECT count(*)::text AS count FROM portal_dp.enterprise_proof_roots WHERE id = $1",
            [proof.proofRootId],
          ),
          client.query<{
            operation_id: string;
            event_sequence: number;
            action_code: string;
            idempotency_actor_id: string;
            idempotency_key: string;
            result: string;
            previous_version: number | null;
            final_version: number | null;
            change_set: {
              mudancas: Array<{
                campo: string;
                classificacao: string;
                anterior: unknown;
                novo: unknown;
              }>;
            };
          }>(
            `SELECT operation_id, event_sequence, action_code,
                    idempotency_actor_id, idempotency_key,
                    result, previous_version, final_version, change_set
               FROM portal_dp.audit_events
              WHERE correlation_id = $1`,
            [proof.correlationId],
          ),
          client.query<{
            scope_type: string;
            actor_id: string;
            operation_id: string;
            status: string;
          }>(
            `SELECT scope_type, actor_id, operation_id, status
               FROM portal_dp.idempotency_records
              WHERE idempotency_key = $1`,
            [proof.idempotencyKey],
          ),
          client.query<{ correlation_id: string; status: string }>(
            "SELECT correlation_id, status FROM portal_dp.outbox_tasks WHERE id = $1",
            [proof.outboxTaskId],
          ),
        ]);
        return { roots, audits, idempotency, outbox };
      },
    );

    expect(snapshot.roots.rows[0]?.count).toBe("1");
    expect(snapshot.audits.rows).toEqual([
      {
        operation_id: proof.operationId,
        event_sequence: 1,
        action_code: "ETP00.REGISTRO_SINTETICO.GRAVAR",
        idempotency_actor_id: proof.actorId,
        idempotency_key: proof.idempotencyKey,
        result: "SUCESSO",
        previous_version: null,
        final_version: 1,
        change_set: {
          mudancas: [
            {
              campo: "codigo",
              classificacao: "INTERNA",
              anterior: null,
              novo: command.intencao.codigo,
            },
            {
              campo: "valor",
              classificacao: "INTERNA",
              anterior: null,
              novo: command.intencao.valor,
            },
          ],
        },
      },
    ]);
    expect(snapshot.idempotency.rows).toEqual([
      {
        scope_type: "EMPRESARIAL",
        actor_id: proof.actorId,
        operation_id: proof.operationId,
        status: "COMPLETED",
      },
    ]);
    expect(snapshot.outbox.rows).toEqual([
      { correlation_id: proof.correlationId, status: "PENDING" },
    ]);
  });

  test("reconciles a lost response and rejects a reused key with another intent", async () => {
    await expect(
      executeSyntheticEnterpriseCommand(appPool, command, infrastructureIds),
    ).resolves.toMatchObject({ resultado: "REPETICAO_RECONCILIADA" });
    await expect(
      executeSyntheticEnterpriseCommand(
        appPool,
        {
          ...command,
          intencao: { ...command.intencao, valor: "valor-divergente" },
        },
        infrastructureIds,
      ),
    ).rejects.toMatchObject({ code: "23505" });

    const counts = await withTenantTransaction(
      appPool,
      {
        companyId: proof.companyId,
        actorId: proof.actorId,
        correlationId: proof.correlationId,
      },
      async (client) =>
        client.query<{ roots: string; tasks: string }>(
          `SELECT
             (SELECT count(*) FROM portal_dp.enterprise_proof_roots WHERE id = $1)::text AS roots,
             (SELECT count(*) FROM portal_dp.outbox_tasks WHERE id = $2)::text AS tasks`,
          [proof.proofRootId, proof.outboxTaskId],
        ),
    );
    expect(counts.rows).toEqual([{ roots: "1", tasks: "1" }]);
  });

  test("denies the same technical actor in company B and in an unknown company", async () => {
    const denied = (companyId: string): SyntheticEnterpriseCommand => ({
      ...command,
      correlacao_id: uuid<"Correlacao">(randomUUID()),
      intencao: {
        ...command.intencao,
        empresa_id: uuid<"Empresa">(companyId),
        registro_id: uuid<"RegistroSintetico">(randomUUID()),
      },
    });

    const deniedIds = () => ({
      operationId: uuid<"Operacao">(randomUUID()),
      outboxTaskId: uuid<"MensagemOutbox">(randomUUID()),
      privateObjectId: uuid<"ArquivoPrivado">(randomUUID()),
    });
    const deniedBCommand = denied(COMPANY_B);
    const deniedBIds = deniedIds();
    const deniedUnknownCommand = denied(COMPANY_UNKNOWN);
    const deniedUnknownIds = deniedIds();

    await expect(
      executeSyntheticEnterpriseCommand(appPool, deniedBCommand, deniedBIds),
    ).rejects.toBeInstanceOf(SyntheticAuthorizationDeniedError);
    await expect(
      executeSyntheticEnterpriseCommand(appPool, deniedBCommand, deniedBIds),
    ).rejects.toBeInstanceOf(SyntheticAuthorizationDeniedError);
    await expect(
      executeSyntheticEnterpriseCommand(
        appPool,
        deniedUnknownCommand,
        deniedUnknownIds,
      ),
    ).rejects.toBeInstanceOf(SyntheticAuthorizationDeniedError);

    const deniedState = await withTenantTransaction(
      appPool,
      {
        companyId: COMPANY_B,
        actorId: deniedBCommand.ator_id,
        correlationId: deniedBCommand.correlacao_id,
      },
      async (client) => {
        const [audit, idempotency, roots, tasks, unknownAudit] =
          await Promise.all([
            client.query<{
              operation_id: string;
              event_sequence: number;
              action_code: string;
              idempotency_actor_id: string;
              idempotency_key: string;
              result: string;
              entity_id: string;
              safe_error_reference: string;
              change_set: { mudancas: unknown[] };
            }>(
              `SELECT operation_id, event_sequence, action_code,
                      idempotency_actor_id, idempotency_key, result, entity_id,
                      safe_error_reference, change_set
                 FROM portal_dp.audit_events
                WHERE operation_id = $1`,
              [deniedBIds.operationId],
            ),
            client.query<{
              scope_type: string;
              actor_id: string;
              operation_id: string;
              status: string;
              response_status: number;
            }>(
              `SELECT scope_type, actor_id, operation_id,
                      status, response_status
                 FROM portal_dp.idempotency_records
                WHERE idempotency_key = $1`,
              [deniedBCommand.idempotency_key],
            ),
            client.query<{ count: string }>(
              "SELECT count(*)::text AS count FROM portal_dp.enterprise_proof_roots WHERE id = $1",
              [deniedBCommand.intencao.registro_id],
            ),
            client.query<{ count: string }>(
              "SELECT count(*)::text AS count FROM portal_dp.outbox_tasks WHERE operation_id = $1",
              [deniedBIds.operationId],
            ),
            client.query<{ count: string }>(
              "SELECT count(*)::text AS count FROM portal_dp.audit_events WHERE operation_id = $1",
              [deniedUnknownIds.operationId],
            ),
          ]);
        return { audit, idempotency, roots, tasks, unknownAudit };
      },
    );
    expect(deniedState.audit.rows).toEqual([
      {
        operation_id: deniedBIds.operationId,
        event_sequence: 1,
        action_code: "ETP00.REGISTRO_SINTETICO.GRAVAR",
        idempotency_actor_id: deniedBCommand.ator_id,
        idempotency_key: deniedBCommand.idempotency_key,
        result: "NEGADO",
        entity_id: deniedBCommand.intencao.registro_id,
        safe_error_reference: "RECURSO_NAO_ENCONTRADO",
        change_set: { mudancas: [] },
      },
    ]);
    expect(deniedState.idempotency.rows).toEqual([
      {
        scope_type: "EMPRESARIAL",
        actor_id: deniedBCommand.ator_id,
        operation_id: deniedBIds.operationId,
        status: "COMPLETED",
        response_status: 404,
      },
    ]);
    expect(deniedState.roots.rows[0]?.count).toBe("0");
    expect(deniedState.tasks.rows[0]?.count).toBe("0");
    expect(deniedState.unknownAudit.rows[0]?.count).toBe("0");
  });

  test("worker materializes one private object and preserves correlation", async () => {
    const runner = new WorkerRunner(workerPool, {
      nodeEnv: "test",
      databaseUrl: process.env["WORKER_DATABASE_URL"]!,
      workerId: "portal-dp-etp00-integration-worker",
      actorId: ACTOR,
      companyIds: [COMPANY_A],
      pollIntervalMs: 100,
      leaseSeconds: 30,
      outboxDelayAlertMs: 300_000,
      privateObjectRoot,
    });

    await expect(runner.runOnce()).resolves.toBe(true);
    await expect(runner.runOnce()).resolves.toBe(false);

    const bytes = await readFile(
      join(privateObjectRoot, COMPANY_A, `${proof.privateObjectId}.bin`),
    );
    expect(JSON.parse(bytes.toString("utf8"))).toMatchObject({
      schema: "ETP00_PRIVATE_EVIDENCE_V1",
      companyId: COMPANY_A,
      operationId: proof.operationId,
      synthetic: true,
    });

    const state = await withTenantTransaction(
      appPool,
      {
        companyId: COMPANY_A,
        actorId: ACTOR,
        correlationId: proof.correlationId,
      },
      async (client) => {
        const [task, object, audit] = await Promise.all([
          client.query<{ status: string; attempt_count: number }>(
            "SELECT status, attempt_count FROM portal_dp.outbox_tasks WHERE id = $1",
            [proof.outboxTaskId],
          ),
          client.query<{ validation_status: string }>(
            "SELECT validation_status FROM portal_dp.private_objects WHERE id = $1",
            [proof.privateObjectId],
          ),
          client.query<{
            event_sequence: number;
            action_code: string;
            idempotency_actor_id: string;
            idempotency_key: string;
            result: string;
          }>(
            `SELECT event_sequence, action_code, idempotency_actor_id,
                    idempotency_key, result
               FROM portal_dp.audit_events
              WHERE correlation_id = $1
              ORDER BY event_sequence`,
            [proof.correlationId],
          ),
        ]);
        return { task, object, audit };
      },
    );
    expect(state.task.rows).toEqual([
      { status: "SUCCEEDED", attempt_count: 1 },
    ]);
    expect(state.object.rows).toEqual([{ validation_status: "AVAILABLE" }]);
    expect(state.audit.rows).toEqual([
      {
        event_sequence: 1,
        action_code: "ETP00.REGISTRO_SINTETICO.GRAVAR",
        idempotency_actor_id: proof.actorId,
        idempotency_key: proof.idempotencyKey,
        result: "SUCESSO",
      },
      {
        event_sequence: 2,
        action_code: "ETP00.ARQUIVO_PRIVADO.MATERIALIZAR",
        idempotency_actor_id: proof.actorId,
        idempotency_key: proof.idempotencyKey,
        result: "SUCESSO",
      },
    ]);

    expect(
      await queryTenant(
        bootstrapPool,
        "portal_dp_app",
        COMPANY_B,
        "SELECT id FROM portal_dp.private_objects WHERE id = $1",
        [proof.privateObjectId],
      ),
    ).toEqual([]);

    const terminalTaskId = randomUUID();
    const terminalObjectId = randomUUID();
    const terminalOperationId = randomUUID();
    const terminalCorrelationId = randomUUID();
    const terminalIdempotencyKey = `idem-terminal-${randomUUID()}`;
    const terminalBytes = Buffer.from(
      JSON.stringify({ schema: "ETP00_TERMINAL_FAILURE_V1" }),
      "utf8",
    );
    const terminalHash = createHash("sha256")
      .update(terminalBytes)
      .digest("hex");

    await withTenantTransaction(
      appPool,
      {
        companyId: COMPANY_A,
        actorId: ACTOR,
        correlationId: terminalCorrelationId,
      },
      async (client) => {
        await client.query(
          "SELECT portal_dp.claim_idempotency($1, $2, $3, $4)",
          [
            terminalIdempotencyKey,
            createHash("sha256").update(terminalIdempotencyKey).digest(),
            terminalOperationId,
            terminalCorrelationId,
          ],
        );
        await client.query(
          `INSERT INTO portal_dp.outbox_tasks
            (company_id, id, proof_root_id, actor_id, operation_id,
             correlation_id, idempotency_key, task_type, dedupe_key, payload,
             max_attempts)
           VALUES ($1, $2, $3, $4, $5, $6, $7,
                   'ETP00.GERAR_EVIDENCIA_PRIVADA', $8, $9::jsonb, 1)`,
          [
            COMPANY_A,
            terminalTaskId,
            proof.proofRootId,
            ACTOR,
            terminalOperationId,
            terminalCorrelationId,
            terminalIdempotencyKey,
            `ETP00:${terminalOperationId}`,
            JSON.stringify({
              object_id: terminalObjectId,
              owner_type: "synthetic_operation",
              owner_id: terminalOperationId,
              media_type: "application/json",
              content_base64: terminalBytes.toString("base64"),
              sha256: terminalHash,
            }),
          ],
        );
      },
    );

    const unusableStorageRoot = join(privateObjectRoot, "not-a-directory");
    await writeFile(unusableStorageRoot, "synthetic blocker", "utf8");
    const failingRunner = new WorkerRunner(workerPool, {
      nodeEnv: "test",
      databaseUrl: process.env["WORKER_DATABASE_URL"]!,
      workerId: "portal-dp-etp00-terminal-worker",
      actorId: ACTOR,
      companyIds: [COMPANY_A],
      pollIntervalMs: 100,
      leaseSeconds: 30,
      outboxDelayAlertMs: 300_000,
      privateObjectRoot: unusableStorageRoot,
    });
    await expect(failingRunner.runOnce()).resolves.toBe(true);

    const terminalState = await withTenantTransaction(
      appPool,
      {
        companyId: COMPANY_A,
        actorId: ACTOR,
        correlationId: terminalCorrelationId,
      },
      async (client) => {
        const [task, object, availableObject] = await Promise.all([
          client.query<{ status: string }>(
            "SELECT status FROM portal_dp.outbox_tasks WHERE id = $1",
            [terminalTaskId],
          ),
          client.query<{ validation_status: string }>(
            "SELECT validation_status FROM portal_dp.private_objects WHERE id = $1",
            [terminalObjectId],
          ),
          client.query<{ validation_status: string }>(
            "SELECT validation_status FROM portal_dp.private_objects WHERE id = $1",
            [proof.privateObjectId],
          ),
        ]);
        return { task, object, availableObject };
      },
    );
    expect(terminalState.task.rows).toEqual([{ status: "FAILED" }]);
    expect(terminalState.object.rows).toEqual([
      { validation_status: "REJECTED" },
    ]);
    expect(terminalState.availableObject.rows).toEqual([
      { validation_status: "AVAILABLE" },
    ]);
  });

  test("revalidates authorization before replay and audits a revoked attempt neutrally", async () => {
    const actorId = randomUUID();
    const correlationId = randomUUID();
    const suffix = randomUUID().replaceAll("-", "").slice(0, 12).toUpperCase();
    const revokedCommand: SyntheticEnterpriseCommand = {
      ...command,
      ator_id: uuid<"Ator">(actorId),
      correlacao_id: uuid<"Correlacao">(correlationId),
      idempotency_key: idempotencyKey(`idem-etp00-revoked-${randomUUID()}`),
      intencao: {
        ...command.intencao,
        registro_id: uuid<"RegistroSintetico">(randomUUID()),
        codigo: `ETP00.REVOKE.${suffix}`,
        valor: "autorizacao-revalidada",
      },
    };
    const revokedIds = {
      operationId: uuid<"Operacao">(randomUUID()),
      outboxTaskId: uuid<"MensagemOutbox">(randomUUID()),
      privateObjectId: uuid<"ArquivoPrivado">(randomUUID()),
    };

    await setSyntheticActorGrant(actorId, true);
    try {
      await expect(
        executeSyntheticEnterpriseCommand(appPool, revokedCommand, revokedIds),
      ).resolves.toMatchObject({ resultado: "CONCLUIDA" });

      await setSyntheticActorGrant(actorId, false);
      await expect(
        executeSyntheticEnterpriseCommand(appPool, revokedCommand, revokedIds),
      ).rejects.toBeInstanceOf(SyntheticAuthorizationDeniedError);

      const audit = await withTenantTransaction(
        appPool,
        { companyId: COMPANY_A, actorId, correlationId },
        async (client) =>
          client.query<{
            event_sequence: number;
            result: string;
            safe_error_reference: string | null;
          }>(
            `SELECT event_sequence, result, safe_error_reference
               FROM portal_dp.audit_events
              WHERE operation_id = $1
              ORDER BY event_sequence`,
            [revokedIds.operationId],
          ),
      );
      expect(audit.rows).toEqual([
        {
          event_sequence: 1,
          result: "SUCESSO",
          safe_error_reference: null,
        },
        {
          event_sequence: 2,
          result: "NEGADO",
          safe_error_reference: "RECURSO_NAO_ENCONTRADO",
        },
      ]);
    } finally {
      await setSyntheticActorGrant(actorId, false);
    }
  });

  test("holds the authorization grant fence until the business transaction ends", async () => {
    const actorId = randomUUID();
    const correlationId = randomUUID();
    await setSyntheticActorGrant(actorId, true);
    const locker = await appPool.connect();
    const revoker = await bootstrapPool.connect();
    try {
      await locker.query("BEGIN");
      await locker.query(
        `SELECT set_config('app.company_id', $1, true),
                set_config('app.actor_id', $2, true),
                set_config('app.correlation_id', $3, true)`,
        [COMPANY_A, actorId, correlationId],
      );
      const authorization = await locker.query<{ authorized: boolean }>(
        "SELECT authorized FROM portal_dp.lock_synthetic_authorization()",
      );
      expect(authorization.rows).toEqual([{ authorized: true }]);

      await revoker.query("BEGIN");
      // O prazo curto não mede desempenho: comprova que a revogação permanece
      // bloqueada enquanto a transação autorizada conserva o FOR SHARE.
      await revoker.query("SET LOCAL lock_timeout = '150ms'");
      await revoker.query(
        `SELECT set_config('app.company_id', $1, true),
                set_config('app.actor_id', $2, true),
                set_config('app.correlation_id', $3, true)`,
        [COMPANY_A, actorId, randomUUID()],
      );
      await expect(
        revoker.query(
          `DELETE FROM portal_dp.synthetic_actor_company_grants
            WHERE company_id = $1 AND actor_id = $2`,
          [COMPANY_A, actorId],
        ),
      ).rejects.toMatchObject({ code: "55P03" });
      await revoker.query("ROLLBACK");
      await locker.query("COMMIT");
    } finally {
      await revoker.query("ROLLBACK").catch(() => undefined);
      await locker.query("ROLLBACK").catch(() => undefined);
      revoker.release();
      locker.release();
      await setSyntheticActorGrant(actorId, false);
    }

    // CON-08: a versão de contexto divergente interrompe o comando antes do
    // claim idempotente, da auditoria e da gravação do registro.
    const staleContextCommand = createSyntheticCommand({
      code: `PROVA.CONTEXTO.${randomUUID().slice(0, 8).toUpperCase()}`,
      value: "contexto-divergente",
    });
    const staleContextIds = createInfrastructureIds();
    await expect(
      executeSyntheticEnterpriseCommand(
        appPool,
        staleContextCommand,
        staleContextIds,
        { expectedContextVersion: 2 },
      ),
    ).rejects.toBeInstanceOf(SyntheticContextVersionConflictError);
    const staleContextState = await withTenantTransaction(
      appPool,
      {
        companyId: COMPANY_A,
        actorId: ACTOR,
        correlationId: staleContextCommand.correlacao_id,
      },
      async (client) =>
        client.query<{ roots: string; operations: string }>(
          `SELECT
             (SELECT count(*) FROM portal_dp.enterprise_proof_roots WHERE id = $1)::text AS roots,
             (
               SELECT count(*)
                 FROM portal_dp.idempotency_records
                WHERE operation_id = $2
             )::text AS operations`,
          [
            staleContextCommand.intencao.registro_id,
            staleContextIds.operationId,
          ],
        ),
    );
    expect(staleContextState.rows).toEqual([{ roots: "0", operations: "0" }]);

    // CON-05: uma operação já reivindicada permanece em andamento e o serviço
    // não executa um segundo efeito para a mesma chave e intenção.
    const inProgressCommand = createSyntheticCommand({
      code: `PROVA.ANDAMENTO.${randomUUID().slice(0, 8).toUpperCase()}`,
      value: "ainda-em-processamento",
    });
    const inProgressIds = createInfrastructureIds();
    const inProgressHash = createHash("sha256")
      .update(canonicalSyntheticIntent(inProgressCommand.intencao))
      .digest();
    await withTenantTransaction(
      appPool,
      {
        companyId: COMPANY_A,
        actorId: ACTOR,
        correlationId: inProgressCommand.correlacao_id,
      },
      async (client) => {
        const claim = await client.query<{ claimed: boolean }>(
          "SELECT portal_dp.claim_idempotency($1, $2, $3, $4) AS claimed",
          [
            inProgressCommand.idempotency_key,
            inProgressHash,
            inProgressIds.operationId,
            inProgressCommand.correlacao_id,
          ],
        );
        expect(claim.rows).toEqual([{ claimed: true }]);
      },
    );
    await expect(
      executeSyntheticEnterpriseCommand(
        appPool,
        inProgressCommand,
        inProgressIds,
        { expectedContextVersion: 1 },
      ),
    ).resolves.toEqual({
      operacao_id: inProgressIds.operationId,
      empresa_id: COMPANY_A,
      registro_id: inProgressCommand.intencao.registro_id,
      resultado: "EM_PROCESSAMENTO",
    });
    const inProgressEffects = await withTenantTransaction(
      appPool,
      {
        companyId: COMPANY_A,
        actorId: ACTOR,
        correlationId: inProgressCommand.correlacao_id,
      },
      async (client) =>
        client.query<{ roots: string; outbox: string; status: string }>(
          `SELECT
             (SELECT count(*) FROM portal_dp.enterprise_proof_roots WHERE id = $1)::text AS roots,
             (SELECT count(*) FROM portal_dp.outbox_tasks WHERE operation_id = $2)::text AS outbox,
             (SELECT status FROM portal_dp.idempotency_records WHERE operation_id = $2) AS status`,
          [inProgressCommand.intencao.registro_id, inProgressIds.operationId],
        ),
    );
    expect(inProgressEffects.rows).toEqual([
      { roots: "0", outbox: "0", status: "IN_PROGRESS" },
    ]);

    // CON-06: duas criações realmente concorrentes compartilham a chave
    // natural; uma vence e a outra recebe somente a associação autorizada.
    const naturalCode = `PROVA.NATURAL.${randomUUID()
      .slice(0, 8)
      .toUpperCase()}`;
    const naturalCommands = [
      createSyntheticCommand({
        code: naturalCode,
        value: "corrida-natural-a",
      }),
      createSyntheticCommand({
        code: naturalCode,
        value: "corrida-natural-b",
      }),
    ] as const;
    const naturalIds = [
      createInfrastructureIds(),
      createInfrastructureIds(),
    ] as const;
    const naturalResults = await Promise.all(
      naturalCommands.map((naturalCommand, index) =>
        executeSyntheticEnterpriseCommand(
          appPool,
          naturalCommand,
          naturalIds[index]!,
          { expectedContextVersion: 1 },
        ),
      ),
    );
    expect(naturalResults.map(({ resultado }) => resultado).sort()).toEqual([
      "CHAVE_NATURAL_EXISTENTE",
      "CONCLUIDA",
    ]);
    const naturalWinner = naturalResults.find(
      ({ resultado }) => resultado === "CONCLUIDA",
    );
    const naturalLoser = naturalResults.find(
      ({ resultado }) => resultado === "CHAVE_NATURAL_EXISTENTE",
    );
    expect(naturalLoser?.registro_id).toBe(naturalWinner?.registro_id);
    const naturalState = await withTenantTransaction(
      appPool,
      {
        companyId: COMPANY_A,
        actorId: ACTOR,
        correlationId: randomUUID(),
      },
      async (client) =>
        client.query<{
          roots: string;
          operations: string;
          outbox: string;
          cancellations: string;
        }>(
          `SELECT
             (SELECT count(*) FROM portal_dp.enterprise_proof_roots WHERE proof_key = $1)::text AS roots,
             (
               SELECT count(*) FROM portal_dp.idempotency_records
                WHERE operation_id = ANY($2::uuid[])
                  AND status = 'COMPLETED'
             )::text AS operations,
             (
               SELECT count(*) FROM portal_dp.outbox_tasks
                WHERE operation_id = ANY($2::uuid[])
             )::text AS outbox,
             (
               SELECT count(*) FROM portal_dp.audit_events
                WHERE operation_id = ANY($2::uuid[])
                  AND result = 'CANCELADO'
                  AND safe_error_reference = 'CHAVE_NATURAL_EXISTENTE'
             )::text AS cancellations`,
          [naturalCode, naturalIds.map(({ operationId }) => operationId)],
        ),
    );
    expect(naturalState.rows).toEqual([
      { roots: "1", operations: "2", outbox: "1", cancellations: "1" },
    ]);

    // CON-01 e CON-02: a fronteira HTTP usa PostgreSQL real para atualizar
    // n→n+1 com auditoria atômica e para negar uma versão antiga sem expor o registro.
    const api = await createApiApplication(
      loadConfig({
        ...process.env,
        NODE_ENV: "test",
        API_CORS_ENABLED: "true",
        WEB_ORIGIN: "http://localhost:5173",
        ETP00_SYNTHETIC_PROOF_ENABLED: "true",
      }),
    );
    try {
      await api.init();
      const server = api.getHttpAdapter().getInstance();
      const session = await server.inject({
        method: "GET",
        url: "/api/v1/sessao",
      });
      const csrfToken = session.json().data.csrf_token as string;
      const cookie = String(session.headers["set-cookie"]).split(";")[0]!;
      const updateCorrelationId = randomUUID();
      const updateKey = `idem-etp00-update-${randomUUID()}`;
      const commonHeaders = {
        origin: "http://localhost:5173",
        cookie,
        "x-csrf-token": csrfToken,
        "x-company-id": COMPANY_A,
        "x-actor-id": ACTOR,
        "x-context-version": "1",
      };
      const rejectedBeforeInterceptor = await server.inject({
        method: "PATCH",
        url: `/api/v1/etp00/provas-sinteticas/${proof.proofRootId}`,
        headers: {
          ...commonHeaders,
          origin: "https://origem-invalida.example",
          "x-correlation-id": "nao-e-uuid-valor-injetado",
          "idempotency-key": `idem-etp00-guard-${randomUUID()}`,
        },
        payload: {
          codigo: command.intencao.codigo,
          valor: "valor-que-nao-deve-chegar-ao-controller",
          versao_esperada: 1,
        },
      });
      expect(rejectedBeforeInterceptor.statusCode).toBe(403);
      const guardProblem = rejectedBeforeInterceptor.json();
      expect(guardProblem.correlacao_id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/u,
      );
      expect(guardProblem.correlacao_id).not.toContain("injetado");
      expect(rejectedBeforeInterceptor.headers["x-correlation-id"]).toBe(
        guardProblem.correlacao_id,
      );
      const updated = await server.inject({
        method: "PATCH",
        url: `/api/v1/etp00/provas-sinteticas/${proof.proofRootId}`,
        headers: {
          ...commonHeaders,
          "x-correlation-id": updateCorrelationId,
          "idempotency-key": updateKey,
        },
        payload: {
          codigo: command.intencao.codigo,
          valor: "valor-a-atualizado",
          versao_esperada: 1,
        },
      });
      expect(updated.statusCode).toBe(200);
      const updatedBody = updated.json();
      expect(updatedBody).toMatchObject({
        empresa_id: COMPANY_A,
        registro_id: proof.proofRootId,
        versao_final: 2,
        resultado: "CONCLUIDA",
      });

      const replayedUpdate = await server.inject({
        method: "PATCH",
        url: `/api/v1/etp00/provas-sinteticas/${proof.proofRootId}`,
        headers: {
          ...commonHeaders,
          "x-correlation-id": randomUUID(),
          "idempotency-key": updateKey,
        },
        payload: {
          codigo: command.intencao.codigo,
          valor: "valor-a-atualizado",
          versao_esperada: 1,
        },
      });
      expect(replayedUpdate.statusCode).toBe(200);
      expect(replayedUpdate.json()).toMatchObject({
        operacao_id: updatedBody.operacao_id,
        versao_final: 2,
        resultado: "REPETICAO_RECONCILIADA",
      });

      const atomicUpdate = await withTenantTransaction(
        appPool,
        {
          companyId: COMPANY_A,
          actorId: ACTOR,
          correlationId: updateCorrelationId,
        },
        async (client) =>
          client.query<{
            version: number;
            value: string;
            previous_version: number;
            final_version: number;
            changes: number;
            completed: string;
            outbox: string;
          }>(
            `SELECT root.version,
                    root.payload ->> 'value' AS value,
                    audit.previous_version,
                    audit.final_version,
                    jsonb_array_length(audit.change_set -> 'mudancas') AS changes,
                    idempotency.status AS completed,
                    (
                      SELECT count(*) FROM portal_dp.outbox_tasks
                       WHERE operation_id = audit.operation_id
                    )::text AS outbox
               FROM portal_dp.enterprise_proof_roots AS root
               JOIN portal_dp.audit_events AS audit
                 ON audit.entity_id = root.id
                AND audit.correlation_id = $2
               JOIN portal_dp.idempotency_records AS idempotency
                 ON idempotency.operation_id = audit.operation_id
              WHERE root.id = $1`,
            [proof.proofRootId, updateCorrelationId],
          ),
      );
      expect(atomicUpdate.rows).toEqual([
        {
          version: 2,
          value: "valor-a-atualizado",
          previous_version: 1,
          final_version: 2,
          changes: 1,
          completed: "COMPLETED",
          outbox: "1",
        },
      ]);

      const staleCorrelationId = randomUUID();
      const staleKey = `idem-etp00-stale-${randomUUID()}`;
      const stale = await server.inject({
        method: "PATCH",
        url: `/api/v1/etp00/provas-sinteticas/${proof.proofRootId}`,
        headers: {
          ...commonHeaders,
          "x-correlation-id": staleCorrelationId,
          "idempotency-key": staleKey,
        },
        payload: {
          codigo: command.intencao.codigo,
          valor: "valor-que-nao-pode-sobrescrever",
          versao_esperada: 1,
        },
      });
      expect(stale.statusCode).toBe(409);
      expect(stale.headers["content-type"]).toContain(
        "application/problem+json",
      );
      const staleProblem = stale.json();
      expect(Object.keys(staleProblem).sort()).toEqual(
        [
          "code",
          "correlacao_id",
          "detail",
          "instance",
          "status",
          "title",
          "type",
          "versao_atual",
        ].sort(),
      );
      expect(staleProblem).toMatchObject({
        status: 409,
        code: "VERSAO_DESATUALIZADA",
        correlacao_id: staleCorrelationId,
        versao_atual: 2,
      });
      expect(JSON.stringify(staleProblem)).not.toContain(
        "valor-que-nao-pode-sobrescrever",
      );
      const staleState = await withTenantTransaction(
        appPool,
        {
          companyId: COMPANY_A,
          actorId: ACTOR,
          correlationId: staleCorrelationId,
        },
        async (client) =>
          client.query<{ version: number; operations: string }>(
            `SELECT root.version,
                    (
                      SELECT count(*) FROM portal_dp.idempotency_records
                       WHERE idempotency_key = $2
                    )::text AS operations
               FROM portal_dp.enterprise_proof_roots AS root
              WHERE root.id = $1`,
            [proof.proofRootId, staleKey],
          ),
      );
      expect(staleState.rows).toEqual([{ version: 2, operations: "0" }]);

      const neutralDenials = [];
      for (const companyId of [COMPANY_B, COMPANY_UNKNOWN]) {
        const denied = await server.inject({
          method: "PATCH",
          url: `/api/v1/etp00/provas-sinteticas/${proof.proofRootId}`,
          headers: {
            ...commonHeaders,
            "x-company-id": companyId,
            "x-correlation-id": randomUUID(),
            "idempotency-key": `idem-etp00-http-denied-${randomUUID()}`,
          },
          payload: {
            codigo: command.intencao.codigo,
            valor: "valor-sintetico-negado",
            versao_esperada: 1,
          },
        });
        expect(denied.statusCode).toBe(404);
        expect(denied.headers["content-type"]).toContain(
          "application/problem+json",
        );
        const problem = denied.json();
        expect(problem).toMatchObject({
          status: 404,
          code: "HTTP_404",
          detail: "Recurso nao encontrado.",
        });
        expect(JSON.stringify(problem)).not.toContain(companyId);
        expect(JSON.stringify(problem)).not.toContain("valor-sintetico-negado");
        neutralDenials.push({
          title: problem.title,
          status: problem.status,
          code: problem.code,
          detail: problem.detail,
        });
      }
      expect(neutralDenials[0]).toEqual(neutralDenials[1]);
    } finally {
      await api.close();
    }

    // As provas acima criam efeitos assíncronos válidos. Drená-los impede que
    // cenários posteriores confundam essas tarefas com sua própria massa.
    const drainRunner = new WorkerRunner(workerPool, {
      nodeEnv: "test",
      databaseUrl: process.env["WORKER_DATABASE_URL"]!,
      workerId: "portal-dp-etp00-gap-drain-worker",
      actorId: ACTOR,
      companyIds: [COMPANY_A],
      pollIntervalMs: 100,
      leaseSeconds: 30,
      outboxDelayAlertMs: 300_000,
      privateObjectRoot,
    });
    let drained = 0;
    while (await drainRunner.runOnce()) {
      drained += 1;
      if (drained > 10) throw new Error("Synthetic outbox did not drain");
    }
    expect(drained).toBeGreaterThanOrEqual(3);
  });
});
