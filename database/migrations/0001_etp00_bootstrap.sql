-- ETP-00 / BK-003 / BK-005
-- Bootstrap exclusivo do PostgreSQL. Esta migração exige uma identidade de
-- migração autorizada a criar papéis e extensões em banco descartável ou controlado.

DO $roles$
DECLARE
  preexisting_roles text;
BEGIN
  SELECT string_agg(rolname, ', ' ORDER BY rolname)
    INTO preexisting_roles
    FROM pg_catalog.pg_roles
   WHERE rolname IN (
     'portal_dp_owner', 'portal_dp_app', 'portal_dp_worker',
     'portal_dp_audit', 'portal_dp_ops',
     'portal_dp_app_login', 'portal_dp_worker_login'
   );

  IF preexisting_roles IS NOT NULL THEN
    RAISE EXCEPTION
      'portal-dp requires new dedicated roles; preexisting roles found: %',
      preexisting_roles
      USING ERRCODE = '42501';
  END IF;

  CREATE ROLE portal_dp_owner NOLOGIN;
  CREATE ROLE portal_dp_app NOLOGIN;
  CREATE ROLE portal_dp_worker NOLOGIN;
  CREATE ROLE portal_dp_audit NOLOGIN;
  CREATE ROLE portal_dp_ops NOLOGIN;
  CREATE ROLE portal_dp_app_login NOLOGIN;
  CREATE ROLE portal_dp_worker_login NOLOGIN;
END
$roles$;

ALTER ROLE portal_dp_owner
  NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOREPLICATION NOBYPASSRLS;
ALTER ROLE portal_dp_app
  NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOREPLICATION NOBYPASSRLS;
ALTER ROLE portal_dp_worker
  NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOREPLICATION NOBYPASSRLS;
ALTER ROLE portal_dp_audit
  NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOREPLICATION NOBYPASSRLS;
ALTER ROLE portal_dp_ops
  NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOREPLICATION NOBYPASSRLS;
ALTER ROLE portal_dp_app_login
  NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOREPLICATION NOBYPASSRLS;
ALTER ROLE portal_dp_worker_login
  NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOREPLICATION NOBYPASSRLS;

-- As identidades de login não herdam privilégios e assumem explicitamente o
-- papel lógico. RESET ROLE retorna a uma identidade sem acesso ao negócio.
GRANT portal_dp_app TO portal_dp_app_login;
GRANT portal_dp_worker TO portal_dp_worker_login;

-- Um papel reaproveitado pode conservar associacoes antigas mesmo depois de
-- seus atributos serem restringidos. A migracao falha fechado se qualquer
-- login tecnico puder assumir outro papel ou se o papel logico herdar uma
-- associacao nao prevista.
DO $service_role_memberships$
DECLARE
  unexpected_membership text;
BEGIN
  SELECT format('%s -> %s', login_role.rolname, granted_role.rolname)
    INTO unexpected_membership
    FROM (
      VALUES
        ('portal_dp_app_login'::name, 'portal_dp_app'::name),
        ('portal_dp_worker_login'::name, 'portal_dp_worker'::name)
    ) AS expected(login_name, role_name)
    JOIN pg_catalog.pg_roles AS login_role
      ON login_role.rolname = expected.login_name
    JOIN pg_catalog.pg_auth_members AS membership
      ON membership.member = login_role.oid
    JOIN pg_catalog.pg_roles AS granted_role
      ON granted_role.oid = membership.roleid
   WHERE granted_role.rolname <> expected.role_name
   LIMIT 1;

  IF unexpected_membership IS NOT NULL THEN
    RAISE EXCEPTION
      'unexpected direct service-role membership: %', unexpected_membership
      USING ERRCODE = '42501';
  END IF;

  SELECT format('%s -> %s', service_role.rolname, granted_role.rolname)
    INTO unexpected_membership
    FROM pg_catalog.pg_roles AS service_role
    JOIN pg_catalog.pg_auth_members AS membership
      ON membership.member = service_role.oid
    JOIN pg_catalog.pg_roles AS granted_role
      ON granted_role.oid = membership.roleid
   WHERE service_role.rolname IN ('portal_dp_app', 'portal_dp_worker')
   LIMIT 1;

  IF unexpected_membership IS NOT NULL THEN
    RAISE EXCEPTION
      'service role must not be a member of another role: %', unexpected_membership
      USING ERRCODE = '42501';
  END IF;
END
$service_role_memberships$;

DO $bootstrap_separation$
BEGIN
  IF current_user = 'portal_dp_owner' THEN
    RAISE EXCEPTION
      'migrations must run as portal_dp_bootstrap (or equivalent), never as portal_dp_owner'
      USING ERRCODE = '42501';
  END IF;
END
$bootstrap_separation$;

COMMENT ON ROLE portal_dp_owner IS
  'ETP-00: proprietario logico de schemas e objetos; nunca atende requisicoes.';
COMMENT ON ROLE portal_dp_app IS
  'ETP-00: privilegios minimos da API; sem propriedade e sem BYPASSRLS.';
COMMENT ON ROLE portal_dp_worker IS
  'ETP-00: consumidor da outbox e gravador de metadados privados por empresa.';
COMMENT ON ROLE portal_dp_audit IS
  'ETP-00: leitura restrita de auditoria, sempre sob contexto empresarial.';
COMMENT ON ROLE portal_dp_ops IS
  'ETP-00: diagnostico operacional restrito, sem mutacao de negocio.';
COMMENT ON ROLE portal_dp_app_login IS
  'ETP-00: identidade de login sem privilegios proprios; somente pode assumir portal_dp_app.';
COMMENT ON ROLE portal_dp_worker_login IS
  'ETP-00: identidade de login sem privilegios proprios; somente pode assumir portal_dp_worker.';

CREATE SCHEMA IF NOT EXISTS portal_dp AUTHORIZATION portal_dp_owner;
CREATE SCHEMA IF NOT EXISTS portal_dp_extensions AUTHORIZATION portal_dp_owner;

DO $schema_owners$
BEGIN
  IF EXISTS (
    SELECT 1
      FROM pg_catalog.pg_namespace AS namespace
      JOIN pg_catalog.pg_roles AS owner_role ON owner_role.oid = namespace.nspowner
     WHERE namespace.nspname IN ('portal_dp', 'portal_dp_extensions')
       AND owner_role.rolname <> 'portal_dp_owner'
  ) THEN
    RAISE EXCEPTION 'portal_dp schemas already exist with an unexpected owner'
      USING ERRCODE = '42501';
  END IF;
END
$schema_owners$;

REVOKE ALL ON SCHEMA portal_dp FROM PUBLIC;
REVOKE ALL ON SCHEMA portal_dp_extensions FROM PUBLIC;

GRANT USAGE ON SCHEMA portal_dp TO
  portal_dp_app, portal_dp_worker, portal_dp_audit, portal_dp_ops;

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA portal_dp_extensions;

CREATE DOMAIN portal_dp.positive_version AS integer
  CHECK (VALUE > 0);

CREATE DOMAIN portal_dp.sha256_digest AS bytea
  CHECK (octet_length(VALUE) = 32);

CREATE DOMAIN portal_dp.nonempty_text AS text
  CHECK (length(btrim(VALUE)) > 0);

ALTER DOMAIN portal_dp.positive_version OWNER TO portal_dp_owner;
ALTER DOMAIN portal_dp.sha256_digest OWNER TO portal_dp_owner;
ALTER DOMAIN portal_dp.nonempty_text OWNER TO portal_dp_owner;

COMMENT ON SCHEMA portal_dp IS
  'ETP-00: fonte transacional PostgreSQL do monolito modular.';
COMMENT ON DOMAIN portal_dp.positive_version IS
  'Versao otimista e de modelo, sempre positiva.';
COMMENT ON DOMAIN portal_dp.sha256_digest IS
  'SHA-256 binario com exatamente 32 bytes.';
