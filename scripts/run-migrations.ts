import { Pool } from "pg";

import { applySqlDirectory } from "./database-files.js";

const databaseUrl = process.env["MIGRATOR_DATABASE_URL"]?.trim();
if (!databaseUrl) throw new Error("MIGRATOR_DATABASE_URL is required");

const pool = new Pool({
  connectionString: databaseUrl,
  application_name: "portal-dp-migrator",
  max: 1,
  connectionTimeoutMillis: 10_000,
});

const client = await pool.connect();
try {
  await client.query(
    "SELECT pg_advisory_lock(hashtextextended('portal-dp-migrations', 0))",
  );
  await applySqlDirectory(client, { directory: "migrations", track: true });

  const unsafeRoles = await client.query<{ rolname: string }>(`
    SELECT rolname
      FROM pg_catalog.pg_roles
     WHERE rolname IN (
       'portal_dp_owner', 'portal_dp_app', 'portal_dp_worker',
       'portal_dp_audit', 'portal_dp_ops',
       'portal_dp_app_login', 'portal_dp_worker_login'
     )
       AND (
         rolsuper OR rolcreaterole OR rolcreatedb OR
         rolreplication OR rolbypassrls
       )
  `);
  if ((unsafeRoles.rowCount ?? 0) > 0) {
    throw new Error(
      `Unsafe service roles: ${unsafeRoles.rows.map((row) => row.rolname).join(", ")}`,
    );
  }
  console.log(JSON.stringify({ migrated: true, unsafeServiceRoles: 0 }));
} finally {
  await client
    .query(
      "SELECT pg_advisory_unlock(hashtextextended('portal-dp-migrations', 0))",
    )
    .catch(() => undefined);
  client.release();
  await pool.end();
}
