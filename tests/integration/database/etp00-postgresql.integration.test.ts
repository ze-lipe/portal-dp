import { createHash, randomUUID } from "node:crypto";
import { sanitizeOperationalEvent } from "@portal-dp/observability";
import type { Pool, PoolClient } from "pg";
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { classifyOutboxError } from "../../../apps/worker/src/runner.js";
import {
  ACTOR,
  COMPANY_A,
  COMPANY_B,
  COMPANY_C,
  COMPANY_UNKNOWN,
  ROOT_A,
  ROOT_B,
  applyMigrations,
  applySyntheticSeeds,
  createTestPool,
  inTenantTransaction,
  queryTenant,
} from "./database-harness.js";

type CountRow = { count: string };
type IdRow = { id: string };

let pool: Pool;

function sha256(value: string): Buffer {
  return createHash("sha256").update(value).digest();
}

async function prepareOutboxIdentity(
  client: PoolClient,
  prefix: string,
): Promise<{
  correlationId: string;
  idempotencyKey: string;
  operationId: string;
}> {
  const context = await client.query<{ correlation_id: string }>(
    "SELECT portal_dp.current_correlation_id()::text AS correlation_id",
  );
  const correlationId = context.rows[0]!.correlation_id;
  const idempotencyKey = `${prefix}-${randomUUID()}`;
  const operationId = randomUUID();
  await client.query("SELECT portal_dp.claim_idempotency($1, $2, $3, $4)", [
    idempotencyKey,
    sha256(idempotencyKey),
    operationId,
    correlationId,
  ]);
  return { correlationId, idempotencyKey, operationId };
}

beforeAll(async () => {
  pool = createTestPool();
  await applyMigrations(pool);
  await applySyntheticSeeds(pool);
});

afterAll(async () => {
  await pool?.end();
});

describe.sequential("ETP-00 PostgreSQL baseline", () => {
  test("uses limited logical roles and FORCE RLS on every tenant table", async () => {
    const roleResult = await pool.query<{
      rolname: string;
      rolcanlogin: boolean;
      rolsuper: boolean;
      rolcreaterole: boolean;
      rolcreatedb: boolean;
      rolreplication: boolean;
      rolbypassrls: boolean;
    }>(`
      SELECT rolname, rolcanlogin, rolsuper, rolcreaterole, rolcreatedb,
             rolreplication, rolbypassrls
        FROM pg_catalog.pg_roles
       WHERE rolname IN (
         'portal_dp_owner', 'portal_dp_app', 'portal_dp_worker',
         'portal_dp_audit', 'portal_dp_ops'
       )
       ORDER BY rolname
    `);

    expect(roleResult.rows).toHaveLength(5);
    for (const role of roleResult.rows) {
      expect(role).toMatchObject({
        rolcanlogin: false,
        rolsuper: false,
        rolcreaterole: false,
        rolcreatedb: false,
        rolreplication: false,
        rolbypassrls: false,
      });
    }

    const loginResult = await pool.query<{
      rolname: string;
      rolcanlogin: boolean;
      rolinherit: boolean;
      rolsuper: boolean;
      rolcreaterole: boolean;
      rolcreatedb: boolean;
      rolreplication: boolean;
      rolbypassrls: boolean;
    }>(`
      SELECT rolname, rolcanlogin, rolinherit, rolsuper,
             rolcreaterole, rolcreatedb, rolreplication, rolbypassrls
        FROM pg_catalog.pg_roles
       WHERE rolname IN ('portal_dp_app_login', 'portal_dp_worker_login')
       ORDER BY rolname
    `);
    expect(loginResult.rows).toHaveLength(2);
    for (const role of loginResult.rows) {
      expect(role).toMatchObject({
        rolcanlogin: true,
        rolinherit: false,
        rolsuper: false,
        rolcreaterole: false,
        rolcreatedb: false,
        rolreplication: false,
        rolbypassrls: false,
      });
    }

    const memberships = await pool.query<{
      member_role: string;
      granted_role: string;
    }>(`
      SELECT member_role.rolname AS member_role,
             granted_role.rolname AS granted_role
        FROM pg_catalog.pg_auth_members AS membership
        JOIN pg_catalog.pg_roles AS member_role
          ON member_role.oid = membership.member
        JOIN pg_catalog.pg_roles AS granted_role
          ON granted_role.oid = membership.roleid
       WHERE member_role.rolname IN (
               'portal_dp_app_login',
               'portal_dp_worker_login',
               'portal_dp_app',
               'portal_dp_worker'
             )
       ORDER BY member_role.rolname, granted_role.rolname
    `);
    expect(memberships.rows).toEqual([
      {
        member_role: "portal_dp_app_login",
        granted_role: "portal_dp_app",
      },
      {
        member_role: "portal_dp_worker_login",
        granted_role: "portal_dp_worker",
      },
    ]);

    const rlsResult = await pool.query<{
      relname: string;
      relrowsecurity: boolean;
      relforcerowsecurity: boolean;
    }>(`
      SELECT cls.relname, cls.relrowsecurity, cls.relforcerowsecurity
        FROM pg_catalog.pg_class AS cls
        JOIN pg_catalog.pg_namespace AS ns ON ns.oid = cls.relnamespace
       WHERE ns.nspname = 'portal_dp'
         AND cls.relname IN (
           'companies',
           'synthetic_actor_company_grants',
           'enterprise_proof_roots',
           'audit_events',
           'idempotency_records',
           'outbox_tasks',
           'private_objects'
         )
       ORDER BY cls.relname
    `);

    expect(rlsResult.rows).toHaveLength(7);
    for (const relation of rlsResult.rows) {
      expect(relation.relrowsecurity).toBe(true);
      expect(relation.relforcerowsecurity).toBe(true);
    }

    const privilegeResult = await pool.query<{
      app_owns_table: boolean;
      app_updates_audit: boolean;
      app_deletes_audit: boolean;
      app_inserts_global_model: boolean;
      app_updates_idempotency: boolean;
      worker_updates_outbox: boolean;
    }>(`
      SELECT
        EXISTS (
          SELECT 1
            FROM pg_catalog.pg_class AS cls
            JOIN pg_catalog.pg_roles AS owner_role ON owner_role.oid = cls.relowner
            JOIN pg_catalog.pg_namespace AS ns ON ns.oid = cls.relnamespace
           WHERE ns.nspname = 'portal_dp'
             AND owner_role.rolname = 'portal_dp_app'
        ) AS app_owns_table,
        has_table_privilege('portal_dp_app', 'portal_dp.audit_events', 'UPDATE')
          AS app_updates_audit,
        has_table_privilege('portal_dp_app', 'portal_dp.audit_events', 'DELETE')
          AS app_deletes_audit,
        has_table_privilege(
          'portal_dp_app', 'portal_dp.global_company_model_versions', 'INSERT'
        ) AS app_inserts_global_model,
        has_table_privilege(
          'portal_dp_app', 'portal_dp.idempotency_records', 'UPDATE'
        ) AS app_updates_idempotency,
        has_table_privilege(
          'portal_dp_worker', 'portal_dp.outbox_tasks', 'UPDATE'
        ) AS worker_updates_outbox
    `);

    expect(privilegeResult.rows[0]).toEqual({
      app_owns_table: false,
      app_updates_audit: false,
      app_deletes_audit: false,
      app_inserts_global_model: false,
      app_updates_idempotency: false,
      worker_updates_outbox: false,
    });
  });

  test("defaults every tenant relation to no rows when context is absent", async () => {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query("SET LOCAL ROLE portal_dp_app");
      const result = await client.query<{
        companies: string;
        roots: string;
        audit: string;
        idempotency: string;
        outbox: string;
        objects: string;
      }>(`
        SELECT
          (SELECT count(*)::text FROM portal_dp.companies) AS companies,
          (SELECT count(*)::text FROM portal_dp.enterprise_proof_roots) AS roots,
          (SELECT count(*)::text FROM portal_dp.audit_events) AS audit,
          (SELECT count(*)::text FROM portal_dp.idempotency_records) AS idempotency,
          (SELECT count(*)::text FROM portal_dp.outbox_tasks) AS outbox,
          (SELECT count(*)::text FROM portal_dp.private_objects) AS objects
      `);
      expect(result.rows[0]).toEqual({
        companies: "0",
        roots: "0",
        audit: "0",
        idempotency: "0",
        outbox: "0",
        objects: "0",
      });
      await client.query("COMMIT");

      // CON-09: uma tarefa empresarial sem empresa falha no PostgreSQL e o
      // registro operacional conserva somente um código técnico sanitizado.
      await client.query("BEGIN");
      await client.query("SET LOCAL ROLE portal_dp_worker");
      let technicalError: unknown;
      try {
        await client.query(
          "SELECT id FROM portal_dp.lease_next_outbox_task('worker-sem-empresa', 30)",
        );
      } catch (error) {
        technicalError = error;
      }
      await client.query("ROLLBACK");
      expect(technicalError).toMatchObject({ code: "22023" });
      const safeErrorCode = classifyOutboxError(technicalError);
      const safeEvent = sanitizeOperationalEvent({
        event: "outbox_failed",
        taskId: "tarefa-sintetica-sem-empresa",
        errorCode: safeErrorCode,
        companyId: undefined,
        message:
          technicalError instanceof Error ? technicalError.message : "erro",
        payload: { empresa_id: null, dado: "nao-pode-aparecer" },
      });
      expect(safeEvent).toEqual({
        event: "outbox_failed",
        taskId: "tarefa-sintetica-sem-empresa",
        errorCode: "PERMANENT_PROCESSING_FAILURE",
      });
      expect(JSON.stringify(safeEvent)).not.toContain("nao-pode-aparecer");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  });

  test("keeps BK-077 versions sequential, immutable and deny-by-default", async () => {
    const versions = await pool.query<{
      version: number;
      default_effect: string;
      hash_size: number;
    }>(`
      SELECT version, default_effect, octet_length(content_hash)::integer AS hash_size
        FROM portal_dp.global_company_model_versions
       WHERE model_key = 'ETP00_MINIMUM_DENY_BY_DEFAULT'
       ORDER BY version
    `);

    expect(versions.rows).toEqual([
      { version: 1, default_effect: "DENY", hash_size: 32 },
      { version: 2, default_effect: "DENY", hash_size: 32 },
    ]);

    await expect(
      pool.query(`
        UPDATE portal_dp.global_company_model_versions
           SET catalog = catalog
         WHERE model_key = 'ETP00_MINIMUM_DENY_BY_DEFAULT' AND version = 1
      `),
    ).rejects.toMatchObject({ code: "55000" });

    await expect(
      pool.query(
        `INSERT INTO portal_dp.global_company_model_versions
          (model_key, version, catalog, created_by)
         VALUES (
           'NON_SEQUENTIAL_TEST', 2,
           '{"default_effect":"DENY","operations":[],"fields":[]}'::jsonb,
           $1
         )`,
        [ACTOR],
      ),
    ).rejects.toMatchObject({ code: "23514" });
  });

  test("isolates company A from B and from an unknown company", async () => {
    const visibleInA = await queryTenant<IdRow>(
      pool,
      "portal_dp_app",
      COMPANY_A,
      "SELECT id FROM portal_dp.enterprise_proof_roots WHERE id = $1",
      [ROOT_A],
    );
    const aRootInB = await queryTenant<IdRow>(
      pool,
      "portal_dp_app",
      COMPANY_B,
      "SELECT id FROM portal_dp.enterprise_proof_roots WHERE id = $1",
      [ROOT_A],
    );
    const aRootInUnknown = await queryTenant<IdRow>(
      pool,
      "portal_dp_app",
      COMPANY_UNKNOWN,
      "SELECT id FROM portal_dp.enterprise_proof_roots WHERE id = $1",
      [ROOT_A],
    );
    const missingInA = await queryTenant<IdRow>(
      pool,
      "portal_dp_app",
      COMPANY_A,
      "SELECT id FROM portal_dp.enterprise_proof_roots WHERE id = $1",
      [randomUUID()],
    );

    expect(visibleInA).toEqual([{ id: ROOT_A }]);
    expect(aRootInB).toEqual([]);
    expect(aRootInUnknown).toEqual([]);
    expect(missingInA).toEqual([]);

    await expect(
      inTenantTransaction(
        pool,
        "portal_dp_app",
        COMPANY_A,
        ACTOR,
        async (client) => {
          await client.query(
            `INSERT INTO portal_dp.enterprise_proof_roots
              (company_id, proof_key, payload, created_by, updated_by)
             VALUES ($1, $2, '{}'::jsonb, $3, $3)`,
            [COMPANY_B, `cross-tenant-${randomUUID()}`, ACTOR],
          );
        },
      ),
    ).rejects.toMatchObject({ code: "42501" });
  });

  test("does not retain tenant context when a pooled connection is reused", async () => {
    const oneConnectionPool = createTestPool(1);
    try {
      const firstClient = await oneConnectionPool.connect();
      try {
        await firstClient.query("BEGIN");
        await firstClient.query("SET LOCAL ROLE portal_dp_app");
        await firstClient.query(
          "SELECT set_config('app.company_id', $1, true), set_config('app.actor_id', $2, true)",
          [COMPANY_A, ACTOR],
        );
        const inA = await firstClient.query<CountRow>(
          "SELECT count(*)::text AS count FROM portal_dp.enterprise_proof_roots WHERE id = $1",
          [ROOT_A],
        );
        expect(inA.rows[0]?.count).toBe("1");
        await firstClient.query("COMMIT");
      } finally {
        firstClient.release();
      }

      const reusedClient = await oneConnectionPool.connect();
      try {
        await reusedClient.query("BEGIN");
        await reusedClient.query("SET LOCAL ROLE portal_dp_app");
        const context = await reusedClient.query<{
          company_id: string | null;
          correlation_id: string | null;
        }>(
          `SELECT portal_dp.current_company_id()::text AS company_id,
                  portal_dp.current_correlation_id()::text AS correlation_id`,
        );
        const withoutContext = await reusedClient.query<CountRow>(
          "SELECT count(*)::text AS count FROM portal_dp.enterprise_proof_roots",
        );
        expect(context.rows[0]?.company_id).toBeNull();
        expect(context.rows[0]?.correlation_id).toBeNull();
        expect(withoutContext.rows[0]?.count).toBe("0");

        await reusedClient.query(
          "SELECT set_config('app.company_id', $1, true), set_config('app.actor_id', $2, true)",
          [COMPANY_B, ACTOR],
        );
        const inB = await reusedClient.query<IdRow>(
          "SELECT id FROM portal_dp.enterprise_proof_roots ORDER BY id",
        );
        expect(inB.rows).toEqual([{ id: ROOT_B }]);
        await reusedClient.query("COMMIT");
      } finally {
        reusedClient.release();
      }
    } finally {
      await oneConnectionPool.end();
    }
  });

  test("rolls back the business mutation when mandatory audit fails", async () => {
    const proofId = randomUUID();
    const correlationId = randomUUID();
    await expect(
      inTenantTransaction(
        pool,
        "portal_dp_app",
        COMPANY_A,
        ACTOR,
        async (client) => {
          await client.query(
            `INSERT INTO portal_dp.enterprise_proof_roots
              (company_id, id, proof_key, payload, created_by, updated_by)
             VALUES ($1, $2, $3, '{"atomic":true}'::jsonb, $4, $4)`,
            [COMPANY_A, proofId, `atomic-${proofId}`, ACTOR],
          );
          await client.query(
            `INSERT INTO portal_dp.audit_events
              (company_id, actor_id, operation_id, correlation_id,
               transition_id, action_code, result, entity_type, entity_id,
               change_set)
             VALUES ($1, $2, $3, $4, 'ETP00-PROOF-CREATE',
                     'ETP00.REGISTRO_SINTETICO.GRAVAR', 'INVALID_RESULT',
                     'enterprise_proof_root', $5,
                     '{"mudancas":[]}'::jsonb)`,
            [COMPANY_A, ACTOR, randomUUID(), correlationId, proofId],
          );
        },
        correlationId,
      ),
    ).rejects.toMatchObject({ code: "23514" });

    const rows = await queryTenant<IdRow>(
      pool,
      "portal_dp_app",
      COMPANY_A,
      "SELECT id FROM portal_dp.enterprise_proof_roots WHERE id = $1",
      [proofId],
    );
    expect(rows).toEqual([]);
  });

  test("keeps successful audit events append-only", async () => {
    const eventId = randomUUID();
    const correlationId = randomUUID();
    await inTenantTransaction(
      pool,
      "portal_dp_app",
      COMPANY_A,
      ACTOR,
      async (client) => {
        await client.query(
          `INSERT INTO portal_dp.audit_events
            (company_id, id, actor_id, operation_id, correlation_id,
             transition_id, action_code, result, entity_type, entity_id,
             change_set)
           VALUES ($1, $2, $3, $2, $4, 'ETP00-AUDIT-PROOF',
                   'ETP00.AUDITORIA.PROVAR_IMUTABILIDADE', 'SUCESSO',
                   'enterprise_proof_root', $5,
                   '{"mudancas":[{"campo":"synthetic","classificacao":"INTERNA","anterior":null,"novo":true}]}'::jsonb)`,
          [COMPANY_A, eventId, ACTOR, correlationId, ROOT_A],
        );
      },
      correlationId,
    );

    await expect(
      inTenantTransaction(
        pool,
        "portal_dp_app",
        COMPANY_A,
        ACTOR,
        async (client) => {
          await client.query(
            `INSERT INTO portal_dp.audit_events
              (company_id, actor_id, operation_id, correlation_id,
               transition_id, action_code, result, entity_type, entity_id,
               change_set)
             VALUES ($1, $2, $3, $4,
                     'ETP00-AUDIT-CORRELATION-MISMATCH',
                     'ETP00.AUDITORIA.PROVAR_CORRELACAO', 'SUCESSO',
                     'enterprise_proof_root', $5,
                     '{"mudancas":[]}'::jsonb)`,
            [COMPANY_A, ACTOR, randomUUID(), randomUUID(), ROOT_A],
          );
        },
        correlationId,
      ),
    ).rejects.toMatchObject({ code: "42501" });

    await expect(
      pool.query(
        "UPDATE portal_dp.audit_events SET change_set = '{}'::jsonb WHERE company_id = $1 AND id = $2",
        [COMPANY_A, eventId],
      ),
    ).rejects.toMatchObject({ code: "55000" });
    await expect(
      pool.query(
        "DELETE FROM portal_dp.audit_events WHERE company_id = $1 AND id = $2",
        [COMPANY_A, eventId],
      ),
    ).rejects.toMatchObject({ code: "55000" });
  });

  test("claims idempotency once and rejects reuse for another intent", async () => {
    const key = `idem-${randomUUID()}`;
    const intentA = sha256("same-intent");
    const intentB = sha256("different-intent");
    const operationId = randomUUID();
    const firstCorrelation = randomUUID();
    const replayCorrelation = randomUUID();

    const first = await inTenantTransaction(
      pool,
      "portal_dp_app",
      COMPANY_A,
      ACTOR,
      async (client) =>
        client.query<{ claimed: boolean }>(
          "SELECT portal_dp.claim_idempotency($1, $2, $3, $4) AS claimed",
          [key, intentA, operationId, firstCorrelation],
        ),
      firstCorrelation,
    );
    const replay = await inTenantTransaction(
      pool,
      "portal_dp_app",
      COMPANY_A,
      ACTOR,
      async (client) =>
        client.query<{ claimed: boolean }>(
          "SELECT portal_dp.claim_idempotency($1, $2, $3, $4) AS claimed",
          [key, intentA, operationId, replayCorrelation],
        ),
      replayCorrelation,
    );

    expect(first.rows[0]?.claimed).toBe(true);
    expect(replay.rows[0]?.claimed).toBe(false);

    await expect(
      inTenantTransaction(
        pool,
        "portal_dp_app",
        COMPANY_A,
        ACTOR,
        async (client) => {
          await client.query(
            "SELECT portal_dp.claim_idempotency($1, $2, $3, $4)",
            [key, intentB, operationId, replayCorrelation],
          );
        },
        replayCorrelation,
      ),
    ).rejects.toMatchObject({ code: "23505" });

    const sameKeyInB = await inTenantTransaction(
      pool,
      "portal_dp_app",
      COMPANY_B,
      ACTOR,
      async (client) =>
        client.query<{ claimed: boolean }>(
          "SELECT portal_dp.claim_idempotency($1, $2, $3, $4) AS claimed",
          [key, intentB, randomUUID(), replayCorrelation],
        ),
      replayCorrelation,
    );
    expect(sameKeyInB.rows[0]?.claimed).toBe(true);

    const secondActor = randomUUID();
    const secondActorCorrelation = randomUUID();
    const sameKeyForAnotherActor = await inTenantTransaction(
      pool,
      "portal_dp_app",
      COMPANY_A,
      secondActor,
      async (client) =>
        client.query<{ claimed: boolean }>(
          "SELECT portal_dp.claim_idempotency($1, $2, $3, $4) AS claimed",
          [key, intentB, randomUUID(), secondActorCorrelation],
        ),
      secondActorCorrelation,
    );
    expect(sameKeyForAnotherActor.rows[0]?.claimed).toBe(true);

    const [firstActorView, secondActorView] = await Promise.all([
      inTenantTransaction(
        pool,
        "portal_dp_app",
        COMPANY_A,
        ACTOR,
        async (client) =>
          client.query<{ actor_id: string }>(
            `SELECT actor_id
               FROM portal_dp.idempotency_records
              WHERE idempotency_key = $1`,
            [key],
          ),
      ),
      inTenantTransaction(
        pool,
        "portal_dp_app",
        COMPANY_A,
        secondActor,
        async (client) =>
          client.query<{ actor_id: string }>(
            `SELECT actor_id
               FROM portal_dp.idempotency_records
              WHERE idempotency_key = $1`,
            [key],
          ),
      ),
    ]);
    expect(firstActorView.rows).toEqual([{ actor_id: ACTOR }]);
    expect(secondActorView.rows).toEqual([{ actor_id: secondActor }]);
  });

  test("leases, resumes and completes an outbox task exactly once per company", async () => {
    const taskId = randomUUID();
    const dedupeKey = `outbox-${taskId}`;
    await inTenantTransaction(
      pool,
      "portal_dp_app",
      COMPANY_A,
      ACTOR,
      async (client) => {
        const identity = await prepareOutboxIdentity(client, "lease");
        await client.query(
          `INSERT INTO portal_dp.outbox_tasks
            (company_id, id, proof_root_id, actor_id, operation_id,
             correlation_id, idempotency_key, task_type, dedupe_key, payload)
           VALUES ($1, $2, $3, $4, $5, $6, $7,
                   'ETP00.TEST.LEASE', $8, '{"synthetic":true}'::jsonb)`,
          [
            COMPANY_A,
            taskId,
            ROOT_A,
            ACTOR,
            identity.operationId,
            identity.correlationId,
            identity.idempotencyKey,
            dedupeKey,
          ],
        );
      },
    );

    await expect(
      inTenantTransaction(
        pool,
        "portal_dp_app",
        COMPANY_A,
        ACTOR,
        async (client) => {
          const identity = await prepareOutboxIdentity(
            client,
            "lease-duplicate",
          );
          await client.query(
            `INSERT INTO portal_dp.outbox_tasks
              (company_id, proof_root_id, actor_id, operation_id,
               correlation_id, idempotency_key, task_type, dedupe_key, payload)
             VALUES ($1, $2, $3, $4, $5, $6,
                     'ETP00.TEST.LEASE', $7, '{}'::jsonb)`,
            [
              COMPANY_A,
              ROOT_A,
              ACTOR,
              identity.operationId,
              identity.correlationId,
              identity.idempotencyKey,
              dedupeKey,
            ],
          );
        },
      ),
    ).rejects.toMatchObject({ code: "23505" });

    const invisibleInB = await queryTenant<IdRow>(
      pool,
      "portal_dp_worker",
      COMPANY_B,
      "SELECT id FROM portal_dp.outbox_tasks WHERE id = $1",
      [taskId],
    );
    expect(invisibleInB).toEqual([]);

    const firstLease = await inTenantTransaction(
      pool,
      "portal_dp_worker",
      COMPANY_A,
      ACTOR,
      async (client) =>
        client.query<{
          id: string;
          attempt_count: number;
          lease_owner: string;
          lease_token: string;
        }>(
          "SELECT id, attempt_count, lease_owner, lease_token FROM portal_dp.lease_next_outbox_task($1, $2)",
          ["shared-worker", 30],
        ),
    );
    expect(firstLease.rows[0]).toMatchObject({
      id: taskId,
      attempt_count: 1,
      lease_owner: "shared-worker",
    });
    expect(firstLease.rows[0]?.lease_token).toMatch(/^[0-9a-f-]{36}$/u);
    const firstLeaseToken = firstLease.rows[0]!.lease_token;

    // Manipulação exclusiva da massa de teste para forçar retomada sem espera
    // real; o código de produção não altera leases fora das funções controladas.
    await pool.query(
      `UPDATE portal_dp.outbox_tasks
          SET lease_until = clock_timestamp() - interval '1 second'
        WHERE company_id = $1 AND id = $2`,
      [COMPANY_A, taskId],
    );

    const resumedLease = await inTenantTransaction(
      pool,
      "portal_dp_worker",
      COMPANY_A,
      ACTOR,
      async (client) =>
        client.query<{
          id: string;
          attempt_count: number;
          lease_owner: string;
          lease_token: string;
        }>(
          "SELECT id, attempt_count, lease_owner, lease_token FROM portal_dp.lease_next_outbox_task($1, $2)",
          ["shared-worker", 30],
        ),
    );
    expect(resumedLease.rows[0]).toMatchObject({
      id: taskId,
      attempt_count: 2,
      lease_owner: "shared-worker",
    });
    expect(resumedLease.rows[0]?.lease_token).toMatch(/^[0-9a-f-]{36}$/u);
    const resumedLeaseToken = resumedLease.rows[0]!.lease_token;
    expect(resumedLeaseToken).not.toBe(firstLeaseToken);

    const staleCompletion = await inTenantTransaction(
      pool,
      "portal_dp_worker",
      COMPANY_A,
      ACTOR,
      async (client) =>
        client.query<{ completed: boolean }>(
          "SELECT portal_dp.complete_outbox_task($1, $2, $3) AS completed",
          [taskId, "shared-worker", firstLeaseToken],
        ),
    );
    const completion = await inTenantTransaction(
      pool,
      "portal_dp_worker",
      COMPANY_A,
      ACTOR,
      async (client) =>
        client.query<{ completed: boolean }>(
          "SELECT portal_dp.complete_outbox_task($1, $2, $3) AS completed",
          [taskId, "shared-worker", resumedLeaseToken],
        ),
    );
    const repeatedCompletion = await inTenantTransaction(
      pool,
      "portal_dp_worker",
      COMPANY_A,
      ACTOR,
      async (client) =>
        client.query<{ completed: boolean }>(
          "SELECT portal_dp.complete_outbox_task($1, $2, $3) AS completed",
          [taskId, "shared-worker", resumedLeaseToken],
        ),
    );

    expect(staleCompletion.rows[0]?.completed).toBe(false);
    expect(completion.rows[0]?.completed).toBe(true);
    expect(repeatedCompletion.rows[0]?.completed).toBe(false);
  });

  test("reschedules failures with bounded backoff and becomes terminal at max attempts", async () => {
    const taskId = randomUUID();
    await inTenantTransaction(
      pool,
      "portal_dp_app",
      COMPANY_A,
      ACTOR,
      async (client) => {
        const identity = await prepareOutboxIdentity(client, "retry");
        await client.query(
          `INSERT INTO portal_dp.outbox_tasks
            (company_id, id, proof_root_id, actor_id, operation_id,
             correlation_id, idempotency_key, task_type, dedupe_key, payload, max_attempts)
           VALUES ($1, $2, $3, $4, $5, $6, $7,
                   'ETP00.TEST.RETRY', $8, '{}'::jsonb, 2)`,
          [
            COMPANY_A,
            taskId,
            ROOT_A,
            ACTOR,
            identity.operationId,
            identity.correlationId,
            identity.idempotencyKey,
            `retry-${taskId}`,
          ],
        );
      },
    );

    const firstLease = await inTenantTransaction(
      pool,
      "portal_dp_worker",
      COMPANY_A,
      ACTOR,
      async (client) =>
        client.query<{ id: string; lease_token: string }>(
          "SELECT id, lease_token FROM portal_dp.lease_next_outbox_task($1, 30)",
          ["retry-worker"],
        ),
    );
    expect(firstLease.rows[0]?.id).toBe(taskId);
    const firstLeaseToken = firstLease.rows[0]!.lease_token;

    const retry = await inTenantTransaction(
      pool,
      "portal_dp_worker",
      COMPANY_A,
      ACTOR,
      async (client) =>
        client.query<{ status: string }>(
          "SELECT portal_dp.fail_outbox_task($1, $2, $3, $4) AS status",
          [taskId, "retry-worker", firstLeaseToken, "DATABASE_TRANSIENT"],
        ),
    );
    expect(retry.rows[0]?.status).toBe("PENDING");

    const pending = await queryTenant<{
      status: string;
      has_backoff: boolean;
      last_error_code: string;
    }>(
      pool,
      "portal_dp_worker",
      COMPANY_A,
      `SELECT status,
              available_at > created_at AS has_backoff,
              last_error_code
         FROM portal_dp.outbox_tasks
        WHERE id = $1`,
      [taskId],
    );
    expect(pending).toEqual([
      {
        status: "PENDING",
        has_backoff: true,
        last_error_code: "DATABASE_TRANSIENT",
      },
    ]);

    await pool.query(
      `UPDATE portal_dp.outbox_tasks
          SET available_at = clock_timestamp()
        WHERE company_id = $1 AND id = $2`,
      [COMPANY_A, taskId],
    );

    const secondLease = await inTenantTransaction(
      pool,
      "portal_dp_worker",
      COMPANY_A,
      ACTOR,
      async (client) =>
        client.query<{
          id: string;
          attempt_count: number;
          lease_token: string;
        }>(
          "SELECT id, attempt_count, lease_token FROM portal_dp.lease_next_outbox_task($1, 30)",
          ["retry-worker"],
        ),
    );
    expect(secondLease.rows[0]).toMatchObject({ id: taskId, attempt_count: 2 });
    const secondLeaseToken = secondLease.rows[0]!.lease_token;
    expect(secondLeaseToken).not.toBe(firstLeaseToken);

    const terminal = await inTenantTransaction(
      pool,
      "portal_dp_worker",
      COMPANY_A,
      ACTOR,
      async (client) =>
        client.query<{ status: string }>(
          "SELECT portal_dp.fail_outbox_task($1, $2, $3, $4) AS status",
          [taskId, "retry-worker", secondLeaseToken, "SYNTHETIC_TERMINAL"],
        ),
    );
    expect(terminal.rows[0]?.status).toBe("FAILED");

    const failed = await queryTenant<{
      status: string;
      attempt_count: number;
      finished: boolean;
    }>(
      pool,
      "portal_dp_worker",
      COMPANY_A,
      `SELECT status, attempt_count, finished_at IS NOT NULL AS finished
         FROM portal_dp.outbox_tasks
        WHERE id = $1`,
      [taskId],
    );
    expect(failed).toEqual([
      { status: "FAILED", attempt_count: 2, finished: true },
    ]);

    const permanentTaskId = randomUUID();
    await inTenantTransaction(
      pool,
      "portal_dp_app",
      COMPANY_A,
      ACTOR,
      async (client) => {
        const identity = await prepareOutboxIdentity(client, "permanent");
        await client.query(
          `INSERT INTO portal_dp.outbox_tasks
            (company_id, id, proof_root_id, actor_id, operation_id,
             correlation_id, idempotency_key, task_type, dedupe_key, payload)
           VALUES ($1, $2, $3, $4, $5, $6, $7,
                   'ETP00.TEST.PERMANENT', $8, '{}'::jsonb)`,
          [
            COMPANY_A,
            permanentTaskId,
            ROOT_A,
            ACTOR,
            identity.operationId,
            identity.correlationId,
            identity.idempotencyKey,
            `permanent-${permanentTaskId}`,
          ],
        );
      },
    );
    const permanentLease = await inTenantTransaction(
      pool,
      "portal_dp_worker",
      COMPANY_A,
      ACTOR,
      async (client) =>
        client.query<{ lease_token: string }>(
          `SELECT lease_token
             FROM portal_dp.lease_next_outbox_task($1, 30)`,
          ["permanent-worker"],
        ),
    );
    const permanent = await inTenantTransaction(
      pool,
      "portal_dp_worker",
      COMPANY_A,
      ACTOR,
      async (client) =>
        client.query<{ status: string }>(
          "SELECT portal_dp.fail_outbox_task($1, $2, $3, $4) AS status",
          [
            permanentTaskId,
            "permanent-worker",
            permanentLease.rows[0]!.lease_token,
            "SYNTHETIC_PERMANENT",
          ],
        ),
    );
    expect(permanent.rows[0]?.status).toBe("FAILED");
  });

  test("keeps private object metadata isolated and exposes no public URL", async () => {
    const taskId = randomUUID();
    const objectId = randomUUID();
    const storageKey = `companies/${COMPANY_A}/etp00/${objectId}`;

    await inTenantTransaction(
      pool,
      "portal_dp_app",
      COMPANY_A,
      ACTOR,
      async (client) => {
        const identity = await prepareOutboxIdentity(client, "file");
        await client.query(
          `INSERT INTO portal_dp.outbox_tasks
            (company_id, id, proof_root_id, actor_id, operation_id,
             correlation_id, idempotency_key, task_type, dedupe_key, payload)
           VALUES ($1, $2, $3, $4, $5, $6, $7,
                   'ETP00.TEST.FILE', $8, '{}'::jsonb)`,
          [
            COMPANY_A,
            taskId,
            ROOT_A,
            ACTOR,
            identity.operationId,
            identity.correlationId,
            identity.idempotencyKey,
            `file-${taskId}`,
          ],
        );
      },
    );

    await inTenantTransaction(
      pool,
      "portal_dp_worker",
      COMPANY_A,
      ACTOR,
      async (client) => {
        const lease = await client.query<{ id: string; lease_token: string }>(
          "SELECT id, lease_token FROM portal_dp.lease_next_outbox_task($1, 30)",
          ["file-worker"],
        );
        expect(lease.rows[0]?.id).toBe(taskId);
        await client.query(
          `INSERT INTO portal_dp.private_objects
            (company_id, id, source_task_id, owner_type, owner_id,
             storage_key, media_type, byte_size, sha256,
             validation_status, created_by)
           VALUES ($1, $2, $3, 'enterprise_proof_root', $4,
                   $5, 'application/pdf', 17, $6, 'AVAILABLE', $7)`,
          [
            COMPANY_A,
            objectId,
            taskId,
            ROOT_A,
            storageKey,
            sha256("fixture"),
            ACTOR,
          ],
        );
        const completed = await client.query<{ completed: boolean }>(
          "SELECT portal_dp.complete_outbox_task($1, $2, $3) AS completed",
          [taskId, "file-worker", lease.rows[0]!.lease_token],
        );
        expect(completed.rows[0]?.completed).toBe(true);
      },
    );

    const inA = await queryTenant<IdRow>(
      pool,
      "portal_dp_app",
      COMPANY_A,
      "SELECT id FROM portal_dp.private_objects WHERE id = $1",
      [objectId],
    );
    const inB = await queryTenant<IdRow>(
      pool,
      "portal_dp_app",
      COMPANY_B,
      "SELECT id FROM portal_dp.private_objects WHERE id = $1",
      [objectId],
    );
    const unknown = await queryTenant<IdRow>(
      pool,
      "portal_dp_app",
      COMPANY_UNKNOWN,
      "SELECT id FROM portal_dp.private_objects WHERE id = $1",
      [objectId],
    );

    expect(inA).toEqual([{ id: objectId }]);
    expect(inB).toEqual([]);
    expect(unknown).toEqual([]);

    const urlColumns = await pool.query<CountRow>(`
      SELECT count(*)::text AS count
        FROM information_schema.columns
       WHERE table_schema = 'portal_dp'
         AND table_name = 'private_objects'
         AND column_name IN ('url', 'public_url', 'download_url')
    `);
    expect(urlColumns.rows[0]?.count).toBe("0");

    await expect(
      inTenantTransaction(
        pool,
        "portal_dp_worker",
        COMPANY_A,
        ACTOR,
        async (client) => {
          await client.query(
            `INSERT INTO portal_dp.private_objects
              (company_id, source_task_id, owner_type, owner_id,
               storage_key, media_type, byte_size, sha256,
               validation_status, created_by)
             VALUES ($1, $2, 'enterprise_proof_root', $3,
                     $4, 'application/pdf', 1, $5, 'AVAILABLE', $6)`,
            [
              COMPANY_A,
              taskId,
              ROOT_A,
              `companies/${COMPANY_A}/duplicate/${randomUUID()}`,
              sha256("duplicate"),
              ACTOR,
            ],
          );
        },
      ),
    ).rejects.toMatchObject({ code: "23505" });

    await expect(
      inTenantTransaction(
        pool,
        "portal_dp_worker",
        COMPANY_A,
        ACTOR,
        async (client) => {
          await client.query(
            `INSERT INTO portal_dp.private_objects
              (company_id, source_task_id, owner_type, owner_id,
               storage_key, media_type, byte_size, sha256,
               validation_status, created_by)
             VALUES ($1, $2, 'enterprise_proof_root', $3,
                     $4, 'application/pdf', 1, $5, 'AVAILABLE', $6)`,
            [
              COMPANY_B,
              taskId,
              ROOT_A,
              `companies/${COMPANY_B}/cross-tenant/${randomUUID()}`,
              sha256("x"),
              ACTOR,
            ],
          );
        },
      ),
    ).rejects.toMatchObject({ code: "42501" });
  });

  test("keeps all three approved synthetic companies addressable only in their own context", async () => {
    for (const companyId of [COMPANY_A, COMPANY_B, COMPANY_C]) {
      const rows = await queryTenant<{ id: string; is_synthetic: boolean }>(
        pool,
        "portal_dp_app",
        companyId,
        "SELECT id, is_synthetic FROM portal_dp.companies",
      );
      expect(rows).toEqual([{ id: companyId, is_synthetic: true }]);
    }
  });
});
