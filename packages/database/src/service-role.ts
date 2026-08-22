import type { Pool } from "pg";

const allowedServiceRoles = new Set(["portal_dp_app", "portal_dp_worker"]);

export async function assertLimitedServiceRole(
  pool: Pool,
  expectedRole: string,
  expectedSessionUser: string,
): Promise<void> {
  if (!allowedServiceRoles.has(expectedRole))
    throw new Error("Unexpected service role");
  // Valida o papel lógico e também a identidade que abriu a conexão. Isso
  // detecta privilégio oculto por SET ROLE e mantém RESET ROLE sem acesso.
  const result = await pool.query<{
    current_user: string;
    session_user: string;
    rolsuper: boolean;
    rolcreaterole: boolean;
    rolcreatedb: boolean;
    rolbypassrls: boolean;
    current_can_login: boolean;
    session_super: boolean;
    session_createrole: boolean;
    session_createdb: boolean;
    session_bypassrls: boolean;
    session_can_login: boolean;
    can_set_role: boolean;
  }>(`
    SELECT current_user,
           session_user,
           current_role.rolsuper,
           current_role.rolcreaterole,
           current_role.rolcreatedb,
           current_role.rolbypassrls,
           current_role.rolcanlogin AS current_can_login,
           login_role.rolsuper AS session_super,
           login_role.rolcreaterole AS session_createrole,
           login_role.rolcreatedb AS session_createdb,
           login_role.rolbypassrls AS session_bypassrls,
           login_role.rolcanlogin AS session_can_login,
           pg_catalog.pg_has_role(session_user, current_user, 'SET') AS can_set_role
      FROM pg_catalog.pg_roles AS current_role
      JOIN pg_catalog.pg_roles AS login_role
        ON login_role.rolname = session_user
     WHERE current_role.rolname = current_user
  `);
  const role = result.rows[0];
  if (
    !role ||
    role.current_user !== expectedRole ||
    role.session_user !== expectedSessionUser ||
    role.rolsuper ||
    role.rolcreaterole ||
    role.rolcreatedb ||
    role.rolbypassrls ||
    role.current_can_login ||
    role.session_super ||
    role.session_createrole ||
    role.session_createdb ||
    role.session_bypassrls ||
    !role.session_can_login ||
    !role.can_set_role
  ) {
    throw new Error(
      `Database connection is not constrained to ${expectedSessionUser} -> ${expectedRole}`,
    );
  }
}
