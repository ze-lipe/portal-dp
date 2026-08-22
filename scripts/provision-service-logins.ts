import { Pool } from "pg";

const databaseUrl = process.env["MIGRATOR_DATABASE_URL"]?.trim();
if (!databaseUrl) throw new Error("MIGRATOR_DATABASE_URL is required");

const credentials = [
  {
    role: "portal_dp_app_login",
    password: process.env["APP_DATABASE_PASSWORD"]?.trim(),
  },
  {
    role: "portal_dp_worker_login",
    password: process.env["WORKER_DATABASE_PASSWORD"]?.trim(),
  },
] as const;

function passwordLiteral(value: string | undefined, role: string): string {
  if (
    !value ||
    value.length < 16 ||
    /\s/u.test(value) ||
    /CHANGE_ME/u.test(value)
  ) {
    throw new Error(
      `${role} requires a non-placeholder password with at least 16 characters`,
    );
  }
  return `'${value.replaceAll("'", "''")}'`;
}

const pool = new Pool({
  connectionString: databaseUrl,
  application_name: "portal-dp-login-provisioner",
  max: 1,
  connectionTimeoutMillis: 10_000,
});

const client = await pool.connect();
try {
  await client.query("BEGIN");
  for (const credential of credentials) {
    await client.query(
      `ALTER ROLE ${credential.role} LOGIN PASSWORD ${passwordLiteral(
        credential.password,
        credential.role,
      )}`,
    );
  }
  await client.query("COMMIT");

  const verification = await client.query<{ rolname: string }>(`
    SELECT rolname
      FROM pg_catalog.pg_roles
     WHERE rolname IN ('portal_dp_app_login', 'portal_dp_worker_login')
       AND rolcanlogin
       AND NOT rolsuper
       AND NOT rolcreaterole
       AND NOT rolcreatedb
       AND NOT rolbypassrls
       AND NOT rolinherit
  `);
  if (verification.rowCount !== 2) {
    throw new Error("Service login roles are not constrained as required");
  }
  process.stdout.write(JSON.stringify({ provisionedServiceLogins: 2 }) + "\n");
} catch (error) {
  await client.query("ROLLBACK").catch(() => undefined);
  throw error;
} finally {
  client.release();
  await pool.end();
}
