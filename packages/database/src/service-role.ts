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
  // Os casts para text também garantem que o driver decodifique os vetores.
  const result = await pool.query<{
    current_user: string;
    session_user: string;
    rolsuper: boolean;
    rolcreaterole: boolean;
    rolcreatedb: boolean;
    rolreplication: boolean;
    rolbypassrls: boolean;
    current_can_login: boolean;
    session_super: boolean;
    session_createrole: boolean;
    session_createdb: boolean;
    session_replication: boolean;
    session_bypassrls: boolean;
    session_can_login: boolean;
    current_inherit: boolean;
    session_inherit: boolean;
    can_set_role: boolean;
    settable_roles: string[];
    direct_roles: string[];
  }>(`
    SELECT current_user,
           session_user,
           current_role.rolsuper,
           current_role.rolcreaterole,
           current_role.rolcreatedb,
           current_role.rolreplication,
           current_role.rolbypassrls,
           current_role.rolcanlogin AS current_can_login,
           login_role.rolsuper AS session_super,
           login_role.rolcreaterole AS session_createrole,
           login_role.rolcreatedb AS session_createdb,
           login_role.rolreplication AS session_replication,
           login_role.rolbypassrls AS session_bypassrls,
           login_role.rolcanlogin AS session_can_login,
           current_role.rolinherit AS current_inherit,
           login_role.rolinherit AS session_inherit,
           pg_catalog.pg_has_role(session_user, current_user, 'SET') AS can_set_role,
           ARRAY(
             SELECT candidate.rolname::text
               FROM pg_catalog.pg_roles AS candidate
              WHERE candidate.rolname <> session_user
                AND pg_catalog.pg_has_role(
                      session_user,
                      candidate.rolname,
                      'SET'
                    )
              ORDER BY candidate.rolname
           ) AS settable_roles,
           ARRAY(
             SELECT granted_role.rolname::text
               FROM pg_catalog.pg_auth_members AS membership
               JOIN pg_catalog.pg_roles AS granted_role
                 ON granted_role.oid = membership.roleid
              WHERE membership.member = login_role.oid
              ORDER BY granted_role.rolname
           ) AS direct_roles
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
    role.rolreplication ||
    role.rolbypassrls ||
    role.current_can_login ||
    role.session_super ||
    role.session_createrole ||
    role.session_createdb ||
    role.session_replication ||
    role.session_bypassrls ||
    !role.session_can_login ||
    role.current_inherit ||
    role.session_inherit ||
    !role.can_set_role ||
    !Array.isArray(role.settable_roles) ||
    !Array.isArray(role.direct_roles) ||
    role.settable_roles.length !== 1 ||
    role.settable_roles[0] !== expectedRole ||
    role.direct_roles.length !== 1 ||
    role.direct_roles[0] !== expectedRole
  ) {
    throw new Error(
      `Database connection is not constrained to ${expectedSessionUser} -> ${expectedRole}`,
    );
  }
}
