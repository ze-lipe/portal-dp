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
      `ALTER ROLE ${credential.role} WITH LOGIN NOSUPERUSER NOCREATEDB ` +
        `NOCREATEROLE NOINHERIT NOREPLICATION NOBYPASSRLS PASSWORD ${passwordLiteral(
          credential.password,
          credential.role,
        )}`,
    );
  }
  const verification = await client.query<{
    rolname: string;
    settable_roles: string[];
    direct_roles: string[];
  }>(`
    SELECT login_role.rolname,
           ARRAY(
             SELECT candidate.rolname
               FROM pg_catalog.pg_roles AS candidate
              WHERE candidate.rolname <> login_role.rolname
                AND pg_catalog.pg_has_role(
                      login_role.oid,
                      candidate.oid,
                      'SET'
                    )
              ORDER BY candidate.rolname
           ) AS settable_roles,
           ARRAY(
             SELECT granted_role.rolname
               FROM pg_catalog.pg_auth_members AS membership
               JOIN pg_catalog.pg_roles AS granted_role
                 ON granted_role.oid = membership.roleid
              WHERE membership.member = login_role.oid
              ORDER BY granted_role.rolname
           ) AS direct_roles
      FROM pg_catalog.pg_roles AS login_role
     WHERE login_role.rolname IN (
             'portal_dp_app_login',
             'portal_dp_worker_login'
           )
       AND login_role.rolcanlogin
       AND NOT login_role.rolsuper
       AND NOT login_role.rolcreaterole
       AND NOT login_role.rolcreatedb
       AND NOT login_role.rolreplication
       AND NOT login_role.rolbypassrls
       AND NOT login_role.rolinherit
     ORDER BY login_role.rolname
  `);
  const expectedMemberships = new Map([
    ["portal_dp_app_login", "portal_dp_app"],
    ["portal_dp_worker_login", "portal_dp_worker"],
  ]);
  if (
    verification.rowCount !== 2 ||
    verification.rows.some((role) => {
      const expectedRole = expectedMemberships.get(role.rolname);
      return (
        !expectedRole ||
        role.settable_roles.length !== 1 ||
        role.settable_roles[0] !== expectedRole ||
        role.direct_roles.length !== 1 ||
        role.direct_roles[0] !== expectedRole
      );
    })
  ) {
    throw new Error("Service login roles are not constrained as required");
  }
  // A ativacao dos logins e a verificacao de menor privilegio formam uma unica
  // transacao; qualquer associacao inesperada reverte tambem a senha/LOGIN.
  await client.query("COMMIT");
  process.stdout.write(JSON.stringify({ provisionedServiceLogins: 2 }) + "\n");
} catch (error) {
  await client.query("ROLLBACK").catch(() => undefined);
  throw error;
} finally {
  client.release();
  await pool.end();
}
