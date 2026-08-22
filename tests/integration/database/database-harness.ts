import { createHash, randomUUID } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { Pool, type PoolClient, type QueryResultRow } from "pg";
import { ensureEtp00GlobalBusinessModel } from "@portal-dp/database";

export const COMPANY_A = "00000000-0000-4000-8000-00000000000a";
export const COMPANY_B = "00000000-0000-4000-8000-00000000000b";
export const COMPANY_C = "00000000-0000-4000-8000-00000000000c";
export const COMPANY_UNKNOWN = "00000000-0000-4000-8000-000000000099";
export const ACTOR = "10000000-0000-4000-8000-000000000001";
export const ROOT_A = "20000000-0000-4000-8000-00000000000a";
export const ROOT_B = "20000000-0000-4000-8000-00000000000b";

export type DatabaseRole =
  "portal_dp_app" | "portal_dp_worker" | "portal_dp_audit" | "portal_dp_ops";

const allowedRoles = new Set<DatabaseRole>([
  "portal_dp_app",
  "portal_dp_worker",
  "portal_dp_audit",
  "portal_dp_ops",
]);

const workspaceRoot = fileURLToPath(new URL("../../../", import.meta.url));
const migrationsDirectory = join(workspaceRoot, "database", "migrations");
const seedsDirectory = join(workspaceRoot, "database", "seeds");

export function requireTestDatabaseUrl(): string {
  const value = process.env["TEST_DATABASE_URL"]?.trim();
  if (!value) {
    throw new Error(
      "TEST_DATABASE_URL is required. GAT-02 must run against a disposable real PostgreSQL database.",
    );
  }
  const parsed = new URL(value);
  if (parsed.protocol !== "postgres:" && parsed.protocol !== "postgresql:") {
    throw new Error("TEST_DATABASE_URL must use postgres:// or postgresql://");
  }
  return value;
}

export function createTestPool(max = 4): Pool {
  return new Pool({
    connectionString: requireTestDatabaseUrl(),
    max,
    application_name: "portal-dp-etp00-gat02",
    statement_timeout: 15_000,
    query_timeout: 20_000,
  });
}

async function sortedSqlFiles(directory: string): Promise<string[]> {
  return (await readdir(directory))
    .filter((entry) => /^\d+.*\.sql$/u.test(entry))
    .sort((left, right) => left.localeCompare(right, "en"));
}

export async function applyMigrations(pool: Pool): Promise<void> {
  const client = await pool.connect();
  try {
    // O hash impede alterar uma migração já aplicada. Cada arquivo e seu registro
    // no histórico são confirmados juntos na mesma transação.
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.portal_dp_schema_migrations (
        version text PRIMARY KEY,
        sha256 text NOT NULL,
        applied_at timestamptz NOT NULL DEFAULT clock_timestamp()
      )
    `);

    for (const filename of await sortedSqlFiles(migrationsDirectory)) {
      const sql = await readFile(join(migrationsDirectory, filename), "utf8");
      const sha256 = createHash("sha256").update(sql).digest("hex");
      const applied = await client.query<{ sha256: string }>(
        "SELECT sha256 FROM public.portal_dp_schema_migrations WHERE version = $1",
        [filename],
      );

      if (applied.rowCount === 1) {
        if (applied.rows[0]?.sha256 !== sha256) {
          throw new Error(`Applied migration ${filename} has changed`);
        }
        continue;
      }

      await client.query("BEGIN");
      try {
        await client.query(sql);
        await client.query(
          "INSERT INTO public.portal_dp_schema_migrations (version, sha256) VALUES ($1, $2)",
          [filename, sha256],
        );
        await client.query("COMMIT");
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      }
    }
  } finally {
    client.release();
  }
}

export async function applySyntheticSeeds(pool: Pool): Promise<void> {
  await ensureEtp00GlobalBusinessModel(pool);
  const client = await pool.connect();
  try {
    for (const filename of await sortedSqlFiles(seedsDirectory)) {
      const sql = await readFile(join(seedsDirectory, filename), "utf8");
      await client.query("BEGIN");
      try {
        await client.query(sql);
        await client.query("COMMIT");
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      }
    }
  } finally {
    client.release();
  }
}

export async function inTenantTransaction<T>(
  pool: Pool,
  role: DatabaseRole,
  companyId: string,
  actorId: string,
  callback: (client: PoolClient) => Promise<T>,
  correlationId = randomUUID(),
): Promise<T> {
  if (!allowedRoles.has(role)) {
    throw new Error(`Role ${role} is not allowed by the integration harness`);
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(`SET LOCAL ROLE ${role}`);
    await client.query(
      `SELECT set_config('app.company_id', $1, true),
              set_config('app.actor_id', $2, true),
              set_config('app.correlation_id', $3, true)`,
      [companyId, actorId, correlationId],
    );
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function queryTenant<T extends QueryResultRow>(
  pool: Pool,
  role: DatabaseRole,
  companyId: string,
  text: string,
  values: readonly unknown[] = [],
): Promise<T[]> {
  return inTenantTransaction(pool, role, companyId, ACTOR, async (client) => {
    const result = await client.query<T>(text, [...values]);
    return result.rows;
  });
}
