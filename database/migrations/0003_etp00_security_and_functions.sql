-- ETP-00 / GAT-02
-- Toda operação empresarial usa contexto local à transação. O chamador inicia a
-- transação e define app.company_id, app.actor_id e app.correlation_id com
-- set_config(..., true), equivalente a SET LOCAL, antes de acessar qualquer dado.

CREATE FUNCTION portal_dp.current_company_id()
RETURNS uuid
LANGUAGE sql
STABLE
PARALLEL SAFE
SET search_path = pg_catalog
AS $function$
  SELECT nullif(current_setting('app.company_id', true), '')::uuid
$function$;

CREATE FUNCTION portal_dp.current_actor_id()
RETURNS uuid
LANGUAGE sql
STABLE
PARALLEL SAFE
SET search_path = pg_catalog
AS $function$
  SELECT nullif(current_setting('app.actor_id', true), '')::uuid
$function$;

CREATE FUNCTION portal_dp.current_correlation_id()
RETURNS uuid
LANGUAGE sql
STABLE
PARALLEL SAFE
SET search_path = pg_catalog
AS $function$
  SELECT nullif(current_setting('app.correlation_id', true), '')::uuid
$function$;

CREATE FUNCTION portal_dp.reject_append_only_mutation()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog
AS $function$
BEGIN
  RAISE EXCEPTION '% is append-only; % is forbidden', TG_TABLE_NAME, TG_OP
    USING ERRCODE = '55000';
END
$function$;

CREATE FUNCTION portal_dp.enforce_next_global_model_version()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog, portal_dp
AS $function$
DECLARE
  previous_version integer;
BEGIN
  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(NEW.model_key::text, 0)
  );

  SELECT max(version)::integer
    INTO previous_version
    FROM portal_dp.global_company_model_versions
   WHERE model_key = NEW.model_key;

  IF previous_version IS NULL AND NEW.version <> 1 THEN
    RAISE EXCEPTION 'first global model version must be 1'
      USING ERRCODE = '23514';
  ELSIF previous_version IS NOT NULL AND NEW.version <> previous_version + 1 THEN
    RAISE EXCEPTION 'global model version must follow %', previous_version
      USING ERRCODE = '23514';
  END IF;

  RETURN NEW;
END
$function$;

CREATE TRIGGER global_model_next_version_trg
  BEFORE INSERT ON portal_dp.global_company_model_versions
  FOR EACH ROW EXECUTE FUNCTION portal_dp.enforce_next_global_model_version();

CREATE TRIGGER global_model_append_only_trg
  BEFORE UPDATE OR DELETE ON portal_dp.global_company_model_versions
  FOR EACH ROW EXECUTE FUNCTION portal_dp.reject_append_only_mutation();

CREATE TRIGGER audit_events_append_only_trg
  BEFORE UPDATE OR DELETE ON portal_dp.audit_events
  FOR EACH ROW EXECUTE FUNCTION portal_dp.reject_append_only_mutation();

-- Os bloqueios FOR SHARE mantêm empresa e concessão estáveis até o fim da
-- transação. Uma revogação concorrente aguarda a gravação já autorizada.
CREATE FUNCTION portal_dp.lock_synthetic_authorization()
RETURNS TABLE (content_hash bytea, authorized boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, portal_dp
SET row_security = on
AS $function$
DECLARE
  scoped_company uuid := portal_dp.current_company_id();
  scoped_actor uuid := portal_dp.current_actor_id();
  model_allows boolean;
  grant_is_active boolean;
BEGIN
  IF scoped_company IS NULL OR scoped_actor IS NULL THEN
    RAISE EXCEPTION 'tenant and actor context are required'
      USING ERRCODE = '22023';
  END IF;

  SELECT model.content_hash,
         model.default_effect = 'DENY'
           AND model.catalog -> 'operations' ? 'EMPRESA.SINTETICA.ALTERAR'
    INTO content_hash, model_allows
    FROM portal_dp.companies AS company
    JOIN portal_dp.global_company_model_versions AS model
      ON model.model_key = company.model_key
     AND model.version = company.model_version
   WHERE company.id = scoped_company
     AND company.is_synthetic
   FOR SHARE OF company;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  PERFORM 1
    FROM portal_dp.synthetic_actor_company_grants AS actor_grant
   WHERE actor_grant.company_id = scoped_company
     AND actor_grant.actor_id = scoped_actor
   FOR SHARE OF actor_grant;
  grant_is_active := FOUND;

  authorized := model_allows AND grant_is_active;
  RETURN NEXT;
END
$function$;

-- O bloqueio consultivo usa empresa + operação e serializa somente esta
-- sequência; assim, MAX + 1 não bloqueia operações independentes.
CREATE FUNCTION portal_dp.next_audit_event_sequence(p_operation_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, portal_dp
SET row_security = on
AS $function$
DECLARE
  scoped_company uuid := portal_dp.current_company_id();
  next_sequence integer;
BEGIN
  IF scoped_company IS NULL OR p_operation_id IS NULL THEN
    RAISE EXCEPTION 'tenant context and operation id are required'
      USING ERRCODE = '22023';
  END IF;

  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(
      scoped_company::text || ':' || p_operation_id::text,
      0
    )
  );
  SELECT coalesce(max(event_sequence), 0) + 1
    INTO next_sequence
    FROM portal_dp.audit_events
   WHERE company_id = scoped_company
     AND operation_id = p_operation_id;
  RETURN next_sequence;
END
$function$;

-- A chave é exclusiva por empresa e ator. Em concorrência, ON CONFLICT evita o
-- segundo efeito e FOR UPDATE serializa a conferência de intenção e operação.
CREATE FUNCTION portal_dp.claim_idempotency(
  p_idempotency_key text,
  p_intent_hash bytea,
  p_operation_id uuid,
  p_correlation_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, portal_dp
SET row_security = on
AS $function$
DECLARE
  scoped_company uuid := portal_dp.current_company_id();
  scoped_actor uuid := portal_dp.current_actor_id();
  scoped_correlation uuid := portal_dp.current_correlation_id();
  existing_hash bytea;
  existing_operation uuid;
  inserted_count bigint;
BEGIN
  IF scoped_company IS NULL OR scoped_actor IS NULL OR scoped_correlation IS NULL THEN
    RAISE EXCEPTION 'tenant, actor and correlation context are required'
      USING ERRCODE = '22023';
  END IF;
  IF p_idempotency_key IS NULL OR btrim(p_idempotency_key) = '' THEN
    RAISE EXCEPTION 'idempotency key is required' USING ERRCODE = '22023';
  END IF;
  IF p_intent_hash IS NULL OR octet_length(p_intent_hash) <> 32 THEN
    RAISE EXCEPTION 'intent hash must be SHA-256' USING ERRCODE = '22023';
  END IF;
  IF p_operation_id IS NULL THEN
    RAISE EXCEPTION 'operation id is required' USING ERRCODE = '22023';
  END IF;
  IF p_correlation_id IS DISTINCT FROM scoped_correlation THEN
    RAISE EXCEPTION 'correlation must match transaction context'
      USING ERRCODE = '42501';
  END IF;

  INSERT INTO portal_dp.idempotency_records (
    company_id, scope_type, actor_id, operation_id,
    idempotency_key, intent_hash, correlation_id
  ) VALUES (
    scoped_company, 'EMPRESARIAL', scoped_actor, p_operation_id,
    p_idempotency_key, p_intent_hash, p_correlation_id
  )
  ON CONFLICT (company_id, scope_type, actor_id, idempotency_key) DO NOTHING;

  GET DIAGNOSTICS inserted_count = ROW_COUNT;
  IF inserted_count = 1 THEN
    RETURN true;
  END IF;

  SELECT intent_hash, operation_id
    INTO existing_hash, existing_operation
    FROM portal_dp.idempotency_records
   WHERE company_id = scoped_company
     AND scope_type = 'EMPRESARIAL'
     AND actor_id = scoped_actor
     AND idempotency_key = p_idempotency_key
   FOR UPDATE;

  IF existing_hash IS DISTINCT FROM p_intent_hash THEN
    RAISE EXCEPTION 'idempotency key already belongs to another intent'
      USING ERRCODE = '23505';
  END IF;
  IF existing_operation IS DISTINCT FROM p_operation_id THEN
    RAISE EXCEPTION 'idempotency key already belongs to another operation'
      USING ERRCODE = '23505';
  END IF;

  RETURN false;
END
$function$;

-- SKIP LOCKED permite workers concorrentes. Cada retomada recebe token novo para
-- um worker com lease vencido não concluir a tentativa atual.
CREATE FUNCTION portal_dp.lease_next_outbox_task(
  p_lease_owner text,
  p_lease_seconds integer DEFAULT 30
)
RETURNS SETOF portal_dp.outbox_tasks
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, portal_dp
SET row_security = on
AS $function$
DECLARE
  scoped_company uuid := portal_dp.current_company_id();
BEGIN
  IF scoped_company IS NULL THEN
    RAISE EXCEPTION 'tenant context is required' USING ERRCODE = '22023';
  END IF;
  IF p_lease_owner IS NULL OR btrim(p_lease_owner) = '' THEN
    RAISE EXCEPTION 'lease owner is required' USING ERRCODE = '22023';
  END IF;
  IF p_lease_seconds < 1 OR p_lease_seconds > 3600 THEN
    RAISE EXCEPTION 'lease seconds must be between 1 and 3600'
      USING ERRCODE = '22023';
  END IF;

  WITH exhausted AS (
    UPDATE portal_dp.outbox_tasks AS task
       SET status = 'FAILED',
           lease_owner = NULL,
           lease_token = NULL,
           lease_until = NULL,
           last_error_code = COALESCE(task.last_error_code, 'LEASE_EXHAUSTED'),
           finished_at = clock_timestamp()
     WHERE task.company_id = scoped_company
       AND task.status = 'LEASED'
       AND task.lease_until <= clock_timestamp()
       AND task.attempt_count >= task.max_attempts
    RETURNING task.company_id, task.id
  )
  UPDATE portal_dp.private_objects AS object
     SET validation_status = 'REJECTED'
    FROM exhausted
   WHERE object.company_id = exhausted.company_id
     AND object.source_task_id = exhausted.id
     AND object.validation_status = 'PENDING_VALIDATION';

  RETURN QUERY
  WITH candidate AS (
    SELECT task.company_id, task.id
      FROM portal_dp.outbox_tasks AS task
     WHERE task.company_id = scoped_company
       AND task.available_at <= clock_timestamp()
       AND task.attempt_count < task.max_attempts
       AND (
         task.status = 'PENDING'
         OR (
           task.status = 'LEASED'
           AND task.lease_until <= clock_timestamp()
         )
       )
     ORDER BY task.available_at, task.created_at, task.id
     FOR UPDATE SKIP LOCKED
     LIMIT 1
  )
  UPDATE portal_dp.outbox_tasks AS task
     SET status = 'LEASED',
         lease_owner = p_lease_owner,
         lease_token = pg_catalog.gen_random_uuid(),
         lease_until = clock_timestamp() + make_interval(secs => p_lease_seconds),
         attempt_count = task.attempt_count + 1
    FROM candidate
   WHERE task.company_id = candidate.company_id
     AND task.id = candidate.id
  RETURNING task.*;
END
$function$;

CREATE FUNCTION portal_dp.complete_idempotency(
  p_idempotency_key text,
  p_intent_hash bytea,
  p_response_status integer,
  p_response_body jsonb
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, portal_dp
SET row_security = on
AS $function$
DECLARE
  scoped_company uuid := portal_dp.current_company_id();
  scoped_actor uuid := portal_dp.current_actor_id();
  updated_count bigint;
  existing_hash bytea;
  existing_status text;
BEGIN
  IF scoped_company IS NULL OR scoped_actor IS NULL THEN
    RAISE EXCEPTION 'tenant and actor context are required'
      USING ERRCODE = '22023';
  END IF;
  IF p_intent_hash IS NULL OR octet_length(p_intent_hash) <> 32 THEN
    RAISE EXCEPTION 'intent hash must be SHA-256' USING ERRCODE = '22023';
  END IF;
  IF p_response_status < 200
     OR p_response_status >= 500
     OR (p_response_status >= 300 AND p_response_status < 400) THEN
    RAISE EXCEPTION 'completed response status must be conclusive (2xx or 4xx)'
      USING ERRCODE = '22023';
  END IF;
  IF p_response_body IS NULL OR jsonb_typeof(p_response_body) <> 'object' THEN
    RAISE EXCEPTION 'completed response body must be an object'
      USING ERRCODE = '22023';
  END IF;

  UPDATE portal_dp.idempotency_records
     SET status = 'COMPLETED',
         response_status = p_response_status,
         response_body = p_response_body,
         completed_at = clock_timestamp(),
         version = version + 1
   WHERE company_id = scoped_company
     AND scope_type = 'EMPRESARIAL'
     AND actor_id = scoped_actor
     AND idempotency_key = p_idempotency_key
     AND intent_hash = p_intent_hash
     AND status = 'IN_PROGRESS';

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  IF updated_count = 1 THEN
    RETURN true;
  END IF;

  SELECT intent_hash, status
    INTO existing_hash, existing_status
    FROM portal_dp.idempotency_records
   WHERE company_id = scoped_company
     AND scope_type = 'EMPRESARIAL'
     AND actor_id = scoped_actor
     AND idempotency_key = p_idempotency_key;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'idempotency claim does not exist' USING ERRCODE = 'P0002';
  END IF;
  IF existing_hash IS DISTINCT FROM p_intent_hash THEN
    RAISE EXCEPTION 'idempotency key already belongs to another intent'
      USING ERRCODE = '23505';
  END IF;
  IF existing_status = 'COMPLETED' THEN
    RETURN false;
  END IF;
  RAISE EXCEPTION 'idempotency claim is not completable' USING ERRCODE = '55000';
END
$function$;

-- A tentativa aumenta ao obter o lease, não ao registrar a falha. Somente erros
-- transitórios explícitos voltam à fila; o jitter reduz novas colisões.
CREATE FUNCTION portal_dp.fail_outbox_task(
  p_task_id uuid,
  p_lease_owner text,
  p_lease_token uuid,
  p_error_code text
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, portal_dp
SET row_security = on
AS $function$
DECLARE
  scoped_company uuid := portal_dp.current_company_id();
  current_attempt integer;
  allowed_attempts integer;
  resulting_status text;
  retryable boolean;
  base_retry_seconds integer;
  retry_seconds integer;
BEGIN
  IF scoped_company IS NULL THEN
    RAISE EXCEPTION 'tenant context is required' USING ERRCODE = '22023';
  END IF;
  IF p_lease_owner IS NULL OR btrim(p_lease_owner) = '' THEN
    RAISE EXCEPTION 'lease owner is required' USING ERRCODE = '22023';
  END IF;
  IF p_lease_token IS NULL THEN
    RAISE EXCEPTION 'lease token is required' USING ERRCODE = '22023';
  END IF;
  IF p_error_code IS NULL OR btrim(p_error_code) = '' OR length(p_error_code) > 100 THEN
    RAISE EXCEPTION 'sanitized error code is required and limited to 100 characters'
      USING ERRCODE = '22023';
  END IF;

  SELECT attempt_count, max_attempts
    INTO current_attempt, allowed_attempts
    FROM portal_dp.outbox_tasks
   WHERE company_id = scoped_company
     AND id = p_task_id
     AND status = 'LEASED'
     AND lease_owner = p_lease_owner
     AND lease_token = p_lease_token
     AND lease_until > clock_timestamp()
   FOR UPDATE;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  retryable := p_error_code IN (
    'DATABASE_TRANSIENT',
    'STORAGE_TRANSIENT'
  );

  IF NOT retryable OR current_attempt >= allowed_attempts THEN
    UPDATE portal_dp.outbox_tasks
       SET status = 'FAILED',
           lease_owner = NULL,
           lease_token = NULL,
           lease_until = NULL,
           last_error_code = p_error_code,
           finished_at = clock_timestamp()
     WHERE company_id = scoped_company
       AND id = p_task_id;
    resulting_status := 'FAILED';
  ELSE
    base_retry_seconds := least(
      3600,
      power(2, least(current_attempt, 10))::integer
    );
    retry_seconds := least(
      3600,
      greatest(
        1,
        round(base_retry_seconds * (0.75 + random() * 0.5))::integer
      )
    );
    UPDATE portal_dp.outbox_tasks
       SET status = 'PENDING',
           available_at = clock_timestamp() + make_interval(secs => retry_seconds),
           lease_owner = NULL,
           lease_token = NULL,
           lease_until = NULL,
           last_error_code = p_error_code,
           finished_at = NULL
     WHERE company_id = scoped_company
       AND id = p_task_id;
    resulting_status := 'PENDING';
  END IF;

  RETURN resulting_status;
END
$function$;

CREATE FUNCTION portal_dp.complete_outbox_task(
  p_task_id uuid,
  p_lease_owner text,
  p_lease_token uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, portal_dp
SET row_security = on
AS $function$
DECLARE
  scoped_company uuid := portal_dp.current_company_id();
  updated_count bigint;
BEGIN
  IF scoped_company IS NULL THEN
    RAISE EXCEPTION 'tenant context is required' USING ERRCODE = '22023';
  END IF;
  IF p_lease_owner IS NULL OR btrim(p_lease_owner) = '' THEN
    RAISE EXCEPTION 'lease owner is required' USING ERRCODE = '22023';
  END IF;
  IF p_lease_token IS NULL THEN
    RAISE EXCEPTION 'lease token is required' USING ERRCODE = '22023';
  END IF;

  UPDATE portal_dp.outbox_tasks
     SET status = 'SUCCEEDED',
         lease_owner = NULL,
         lease_token = NULL,
         lease_until = NULL,
         finished_at = clock_timestamp()
   WHERE company_id = scoped_company
     AND id = p_task_id
     AND status = 'LEASED'
     AND lease_owner = p_lease_owner
     AND lease_token = p_lease_token
     AND lease_until > clock_timestamp();

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count = 1;
END
$function$;

ALTER FUNCTION portal_dp.current_company_id() OWNER TO portal_dp_owner;
ALTER FUNCTION portal_dp.current_actor_id() OWNER TO portal_dp_owner;
ALTER FUNCTION portal_dp.current_correlation_id() OWNER TO portal_dp_owner;
ALTER FUNCTION portal_dp.reject_append_only_mutation() OWNER TO portal_dp_owner;
ALTER FUNCTION portal_dp.enforce_next_global_model_version() OWNER TO portal_dp_owner;
ALTER FUNCTION portal_dp.lock_synthetic_authorization() OWNER TO portal_dp_owner;
ALTER FUNCTION portal_dp.next_audit_event_sequence(uuid) OWNER TO portal_dp_owner;
ALTER FUNCTION portal_dp.claim_idempotency(text, bytea, uuid, uuid) OWNER TO portal_dp_owner;
ALTER FUNCTION portal_dp.complete_idempotency(text, bytea, integer, jsonb) OWNER TO portal_dp_owner;
ALTER FUNCTION portal_dp.lease_next_outbox_task(text, integer) OWNER TO portal_dp_owner;
ALTER FUNCTION portal_dp.fail_outbox_task(uuid, text, uuid, text) OWNER TO portal_dp_owner;
ALTER FUNCTION portal_dp.complete_outbox_task(uuid, text, uuid) OWNER TO portal_dp_owner;

REVOKE ALL ON ALL TABLES IN SCHEMA portal_dp FROM PUBLIC;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA portal_dp FROM PUBLIC;

ALTER TABLE portal_dp.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_dp.companies FORCE ROW LEVEL SECURITY;
CREATE POLICY companies_tenant_policy ON portal_dp.companies
  TO PUBLIC
  USING (id = portal_dp.current_company_id())
  WITH CHECK (id = portal_dp.current_company_id());

ALTER TABLE portal_dp.synthetic_actor_company_grants ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_dp.synthetic_actor_company_grants FORCE ROW LEVEL SECURITY;
CREATE POLICY synthetic_actor_company_tenant_policy
  ON portal_dp.synthetic_actor_company_grants
  TO PUBLIC
  USING (company_id = portal_dp.current_company_id())
  WITH CHECK (company_id = portal_dp.current_company_id());

ALTER TABLE portal_dp.enterprise_proof_roots ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_dp.enterprise_proof_roots FORCE ROW LEVEL SECURITY;
CREATE POLICY enterprise_proof_tenant_policy ON portal_dp.enterprise_proof_roots
  TO PUBLIC
  USING (company_id = portal_dp.current_company_id())
  WITH CHECK (company_id = portal_dp.current_company_id());

ALTER TABLE portal_dp.audit_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_dp.audit_events FORCE ROW LEVEL SECURITY;
CREATE POLICY audit_events_tenant_policy ON portal_dp.audit_events
  TO PUBLIC
  USING (company_id = portal_dp.current_company_id())
  WITH CHECK (
    company_id = portal_dp.current_company_id()
    AND actor_id = portal_dp.current_actor_id()
    AND correlation_id = portal_dp.current_correlation_id()
  );

ALTER TABLE portal_dp.idempotency_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_dp.idempotency_records FORCE ROW LEVEL SECURITY;
CREATE POLICY idempotency_tenant_policy ON portal_dp.idempotency_records
  TO PUBLIC
  USING (
    company_id = portal_dp.current_company_id()
    AND scope_type = 'EMPRESARIAL'
    AND actor_id = portal_dp.current_actor_id()
  )
  WITH CHECK (
    company_id = portal_dp.current_company_id()
    AND scope_type = 'EMPRESARIAL'
    AND actor_id = portal_dp.current_actor_id()
  );

ALTER TABLE portal_dp.outbox_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_dp.outbox_tasks FORCE ROW LEVEL SECURITY;
CREATE POLICY outbox_tenant_policy ON portal_dp.outbox_tasks
  TO PUBLIC
  USING (company_id = portal_dp.current_company_id())
  WITH CHECK (company_id = portal_dp.current_company_id());

ALTER TABLE portal_dp.private_objects ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_dp.private_objects FORCE ROW LEVEL SECURITY;
CREATE POLICY private_objects_tenant_policy ON portal_dp.private_objects
  TO PUBLIC
  USING (company_id = portal_dp.current_company_id())
  WITH CHECK (company_id = portal_dp.current_company_id());

GRANT SELECT ON portal_dp.global_company_model_versions TO
  portal_dp_app, portal_dp_worker, portal_dp_audit, portal_dp_ops;

GRANT SELECT ON portal_dp.companies TO
  portal_dp_app, portal_dp_worker, portal_dp_audit, portal_dp_ops;

GRANT SELECT ON portal_dp.synthetic_actor_company_grants TO portal_dp_app;

GRANT SELECT, INSERT, UPDATE ON portal_dp.enterprise_proof_roots TO portal_dp_app;
GRANT SELECT ON portal_dp.enterprise_proof_roots TO portal_dp_worker;

GRANT SELECT, INSERT ON portal_dp.audit_events TO portal_dp_app, portal_dp_worker;
GRANT SELECT ON portal_dp.audit_events TO portal_dp_audit;

GRANT SELECT ON portal_dp.idempotency_records TO portal_dp_app;

GRANT SELECT, INSERT ON portal_dp.outbox_tasks TO portal_dp_app;
GRANT SELECT ON portal_dp.outbox_tasks TO portal_dp_worker;
GRANT SELECT ON portal_dp.outbox_tasks TO portal_dp_ops;

GRANT SELECT ON portal_dp.private_objects TO portal_dp_app, portal_dp_ops;
GRANT SELECT, INSERT, UPDATE ON portal_dp.private_objects TO portal_dp_worker;

GRANT EXECUTE ON FUNCTION portal_dp.current_company_id() TO
  portal_dp_app, portal_dp_worker, portal_dp_audit, portal_dp_ops;
GRANT EXECUTE ON FUNCTION portal_dp.current_actor_id() TO
  portal_dp_app, portal_dp_worker, portal_dp_audit, portal_dp_ops;
GRANT EXECUTE ON FUNCTION portal_dp.current_correlation_id() TO
  portal_dp_app, portal_dp_worker, portal_dp_audit, portal_dp_ops;
GRANT EXECUTE ON FUNCTION portal_dp.lock_synthetic_authorization()
  TO portal_dp_app;
GRANT EXECUTE ON FUNCTION portal_dp.next_audit_event_sequence(uuid)
  TO portal_dp_app, portal_dp_worker;
GRANT EXECUTE ON FUNCTION portal_dp.claim_idempotency(text, bytea, uuid, uuid)
  TO portal_dp_app;
GRANT EXECUTE ON FUNCTION portal_dp.complete_idempotency(text, bytea, integer, jsonb)
  TO portal_dp_app;
GRANT EXECUTE ON FUNCTION portal_dp.lease_next_outbox_task(text, integer)
  TO portal_dp_worker;
GRANT EXECUTE ON FUNCTION portal_dp.fail_outbox_task(uuid, text, uuid, text)
  TO portal_dp_worker;
GRANT EXECUTE ON FUNCTION portal_dp.complete_outbox_task(uuid, text, uuid)
  TO portal_dp_worker;

ALTER DEFAULT PRIVILEGES FOR ROLE portal_dp_owner IN SCHEMA portal_dp
  REVOKE ALL ON TABLES FROM PUBLIC;
ALTER DEFAULT PRIVILEGES FOR ROLE portal_dp_owner IN SCHEMA portal_dp
  REVOKE ALL ON FUNCTIONS FROM PUBLIC;
