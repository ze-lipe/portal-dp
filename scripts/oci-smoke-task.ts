import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

import { Pool } from "pg";

import { executeSyntheticProof } from "../packages/database/src/index.js";

const COMPANY_A = "00000000-0000-4000-8000-00000000000a";
const ACTOR = "10000000-0000-4000-8000-000000000001";
const statePath = resolve(
  process.env["OCI_SMOKE_STATE_PATH"] ??
    "evidencias/resultados/oci-smoke-task.json",
);

interface SmokeState {
  companyId: string;
  correlationId: string;
  operationId: string;
  outboxTaskId: string;
  privateObjectId: string;
}

function databaseUrl(key: "DATABASE_URL" | "MIGRATOR_DATABASE_URL"): string {
  const value = process.env[key]?.trim();
  if (!value) throw new Error(`${key} is required for the OCI smoke`);
  return value;
}

async function prepare(): Promise<void> {
  const state: SmokeState = {
    companyId: COMPANY_A,
    correlationId: randomUUID(),
    operationId: randomUUID(),
    outboxTaskId: randomUUID(),
    privateObjectId: randomUUID(),
  };
  const pool = new Pool({
    connectionString: databaseUrl("DATABASE_URL"),
    application_name: "portal-dp-oci-smoke-prepare",
    max: 1,
    connectionTimeoutMillis: 10_000,
  });
  try {
    await executeSyntheticProof(pool, {
      companyId: state.companyId,
      actorId: ACTOR,
      correlationId: state.correlationId,
      operationId: state.operationId,
      proofRootId: randomUUID(),
      outboxTaskId: state.outboxTaskId,
      privateObjectId: state.privateObjectId,
      idempotencyKey: `oci-smoke-${randomUUID()}`,
      code: "PROVA.OCI.SMOKE",
      value: `artifact-${process.env["GITHUB_SHA"]?.slice(0, 12) ?? "local"}`,
    });
  } finally {
    await pool.end();
  }
  await mkdir(dirname(statePath), { recursive: true });
  await writeFile(statePath, `${JSON.stringify(state, null, 2)}\n`, "utf8");
  process.stdout.write(`${JSON.stringify({ prepared: true, ...state })}\n`);
}

async function verify(): Promise<void> {
  const state = JSON.parse(await readFile(statePath, "utf8")) as SmokeState;
  const pool = new Pool({
    connectionString: databaseUrl("MIGRATOR_DATABASE_URL"),
    application_name: "portal-dp-oci-smoke-verify",
    max: 1,
    connectionTimeoutMillis: 10_000,
  });
  try {
    const result = await pool.query<{
      status: string;
      attempt_count: number;
      validation_status: string | null;
      audit_count: string;
    }>(
      `SELECT task.status,
              task.attempt_count,
              object.validation_status,
              (SELECT count(*)::text
                 FROM portal_dp.audit_events AS audit
                WHERE audit.company_id = task.company_id
                  AND audit.correlation_id = task.correlation_id) AS audit_count
         FROM portal_dp.outbox_tasks AS task
         LEFT JOIN portal_dp.private_objects AS object
           ON object.company_id = task.company_id
          AND object.id = $3
        WHERE task.company_id = $1
          AND task.id = $2`,
      [state.companyId, state.outboxTaskId, state.privateObjectId],
    );
    const row = result.rows[0];
    if (
      result.rowCount !== 1 ||
      row?.status !== "SUCCEEDED" ||
      row.attempt_count !== 1 ||
      row.validation_status !== "AVAILABLE" ||
      row.audit_count !== "2"
    ) {
      throw new Error(`OCI worker smoke is incomplete: ${JSON.stringify(row)}`);
    }
    process.stdout.write(
      `${JSON.stringify({ verified: true, ...state, ...row })}\n`,
    );
  } finally {
    await pool.end();
  }
}

const mode = process.argv[2];
if (mode === "prepare") await prepare();
else if (mode === "verify") await verify();
else throw new Error("Use: oci-smoke-task.ts prepare|verify");
