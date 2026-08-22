-- ETP-00 / BK-003 / BK-005 / BK-006 / BK-007 / BK-008 / BK-009 /
-- BK-077 / BK-320 / BK-331

CREATE TABLE portal_dp.global_company_model_versions (
  model_key portal_dp.nonempty_text NOT NULL,
  version portal_dp.positive_version NOT NULL,
  catalog jsonb NOT NULL,
  default_effect text NOT NULL DEFAULT 'DENY',
  content_hash portal_dp.sha256_digest
    GENERATED ALWAYS AS (
      portal_dp_extensions.digest(catalog::text, 'sha256')
    ) STORED,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  created_by uuid NOT NULL,
  PRIMARY KEY (model_key, version),
  CONSTRAINT global_model_default_deny_ck
    CHECK (default_effect = 'DENY'),
  CONSTRAINT global_model_catalog_object_ck
    CHECK (jsonb_typeof(catalog) = 'object'),
  CONSTRAINT global_model_catalog_closed_ck
    CHECK (
      catalog ->> 'default_effect' = 'DENY'
      AND jsonb_typeof(catalog -> 'operations') = 'array'
      AND jsonb_typeof(catalog -> 'fields') = 'array'
    )
);

CREATE TABLE portal_dp.companies (
  id uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid(),
  synthetic_key text UNIQUE,
  legal_name portal_dp.nonempty_text NOT NULL,
  is_synthetic boolean NOT NULL DEFAULT false,
  model_key portal_dp.nonempty_text NOT NULL,
  model_version portal_dp.positive_version NOT NULL,
  version portal_dp.positive_version NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  created_by uuid NOT NULL,
  CONSTRAINT companies_model_fk
    FOREIGN KEY (model_key, model_version)
    REFERENCES portal_dp.global_company_model_versions (model_key, version)
    ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT companies_synthetic_key_ck
    CHECK ((is_synthetic AND synthetic_key IS NOT NULL) OR NOT is_synthetic)
);

CREATE TABLE portal_dp.synthetic_actor_company_grants (
  company_id uuid NOT NULL,
  actor_id uuid NOT NULL,
  granted_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  granted_by uuid NOT NULL,
  PRIMARY KEY (company_id, actor_id),
  CONSTRAINT synthetic_actor_company_fk
    FOREIGN KEY (company_id) REFERENCES portal_dp.companies (id)
    ON UPDATE RESTRICT ON DELETE RESTRICT
);

CREATE TABLE portal_dp.enterprise_proof_roots (
  company_id uuid NOT NULL,
  id uuid NOT NULL DEFAULT pg_catalog.gen_random_uuid(),
  proof_key portal_dp.nonempty_text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  version portal_dp.positive_version NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  created_by uuid NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  updated_by uuid NOT NULL,
  PRIMARY KEY (company_id, id),
  CONSTRAINT enterprise_proof_company_fk
    FOREIGN KEY (company_id) REFERENCES portal_dp.companies (id)
    ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT enterprise_proof_key_uq UNIQUE (company_id, proof_key),
  CONSTRAINT enterprise_proof_payload_object_ck
    CHECK (jsonb_typeof(payload) = 'object')
);

CREATE TABLE portal_dp.audit_events (
  company_id uuid NOT NULL,
  id uuid NOT NULL DEFAULT pg_catalog.gen_random_uuid(),
  occurred_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  scope_type text NOT NULL DEFAULT 'EMPRESARIAL',
  actor_id uuid NOT NULL,
  operation_id uuid NOT NULL,
  event_sequence portal_dp.positive_version NOT NULL DEFAULT 1,
  correlation_id uuid NOT NULL,
  idempotency_actor_id uuid,
  idempotency_key portal_dp.nonempty_text,
  transition_id portal_dp.nonempty_text NOT NULL,
  action_code portal_dp.nonempty_text NOT NULL,
  result text NOT NULL,
  entity_type portal_dp.nonempty_text NOT NULL,
  entity_id uuid NOT NULL,
  previous_version portal_dp.positive_version,
  final_version portal_dp.positive_version,
  safe_error_reference portal_dp.nonempty_text,
  change_set jsonb NOT NULL DEFAULT '{"mudancas":[]}'::jsonb,
  PRIMARY KEY (company_id, id),
  CONSTRAINT audit_company_fk
    FOREIGN KEY (company_id) REFERENCES portal_dp.companies (id)
    ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT audit_result_ck
    CHECK (result IN ('SUCESSO', 'NEGADO', 'FALHA', 'CANCELADO')),
  CONSTRAINT audit_scope_ck
    CHECK (scope_type = 'EMPRESARIAL'),
  CONSTRAINT audit_idempotency_binding_ck
    CHECK (
      (idempotency_actor_id IS NULL AND idempotency_key IS NULL)
      OR (idempotency_actor_id IS NOT NULL AND idempotency_key IS NOT NULL)
    ),
  CONSTRAINT audit_operation_sequence_uq
    UNIQUE (company_id, operation_id, event_sequence),
  CONSTRAINT audit_versions_ck
    CHECK (
      (previous_version IS NULL AND final_version IS NULL)
      OR (previous_version IS NULL AND final_version = 1)
      OR (previous_version IS NOT NULL AND final_version = previous_version + 1)
    ),
  CONSTRAINT audit_change_set_object_ck
    CHECK (
      jsonb_typeof(change_set) = 'object'
      AND jsonb_typeof(change_set -> 'mudancas') = 'array'
    )
);

CREATE INDEX audit_events_entity_idx
  ON portal_dp.audit_events (company_id, entity_type, entity_id, occurred_at DESC);
CREATE INDEX audit_events_correlation_idx
  ON portal_dp.audit_events (company_id, correlation_id);

CREATE TABLE portal_dp.idempotency_records (
  company_id uuid NOT NULL,
  id uuid NOT NULL DEFAULT pg_catalog.gen_random_uuid(),
  scope_type text NOT NULL DEFAULT 'EMPRESARIAL',
  actor_id uuid NOT NULL,
  operation_id uuid NOT NULL,
  idempotency_key portal_dp.nonempty_text NOT NULL,
  intent_hash portal_dp.sha256_digest NOT NULL,
  correlation_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'IN_PROGRESS',
  response_status integer,
  response_body jsonb,
  version portal_dp.positive_version NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  completed_at timestamptz,
  PRIMARY KEY (company_id, id),
  CONSTRAINT idempotency_company_fk
    FOREIGN KEY (company_id) REFERENCES portal_dp.companies (id)
    ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT idempotency_scope_ck CHECK (scope_type = 'EMPRESARIAL'),
  CONSTRAINT idempotency_actor_scope_key_uq
    UNIQUE (company_id, scope_type, actor_id, idempotency_key),
  CONSTRAINT idempotency_operation_uq UNIQUE (company_id, operation_id),
  CONSTRAINT idempotency_operation_link_uq
    UNIQUE (
      company_id, scope_type, actor_id, idempotency_key, operation_id
    ),
  CONSTRAINT idempotency_status_ck
    CHECK (status IN ('IN_PROGRESS', 'COMPLETED', 'FAILED')),
  CONSTRAINT idempotency_response_ck
    CHECK (response_body IS NULL OR jsonb_typeof(response_body) = 'object'),
  CONSTRAINT idempotency_completed_ck
    CHECK (
      (status = 'IN_PROGRESS' AND completed_at IS NULL)
      OR (status IN ('COMPLETED', 'FAILED') AND completed_at IS NOT NULL)
    )
);

-- A chave composta obriga auditoria e outbox a apontarem para a mesma empresa,
-- ator, chave e operação, impedindo vínculos causais cruzados.
ALTER TABLE portal_dp.audit_events
  ADD CONSTRAINT audit_idempotency_fk
  FOREIGN KEY (
    company_id, scope_type, idempotency_actor_id,
    idempotency_key, operation_id
  )
  REFERENCES portal_dp.idempotency_records (
    company_id, scope_type, actor_id, idempotency_key, operation_id
  )
  ON UPDATE RESTRICT ON DELETE RESTRICT;

CREATE TABLE portal_dp.outbox_tasks (
  company_id uuid NOT NULL,
  id uuid NOT NULL DEFAULT pg_catalog.gen_random_uuid(),
  proof_root_id uuid,
  scope_type text NOT NULL DEFAULT 'EMPRESARIAL',
  actor_id uuid NOT NULL,
  operation_id uuid NOT NULL,
  correlation_id uuid NOT NULL,
  idempotency_key portal_dp.nonempty_text NOT NULL,
  task_type portal_dp.nonempty_text NOT NULL,
  dedupe_key portal_dp.nonempty_text NOT NULL,
  payload jsonb NOT NULL,
  status text NOT NULL DEFAULT 'PENDING',
  available_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  lease_owner text,
  lease_token uuid,
  lease_until timestamptz,
  attempt_count integer NOT NULL DEFAULT 0,
  max_attempts integer NOT NULL DEFAULT 8,
  last_error_code text,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  finished_at timestamptz,
  PRIMARY KEY (company_id, id),
  CONSTRAINT outbox_company_fk
    FOREIGN KEY (company_id) REFERENCES portal_dp.companies (id)
    ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT outbox_proof_root_fk
    FOREIGN KEY (company_id, proof_root_id)
    REFERENCES portal_dp.enterprise_proof_roots (company_id, id)
    ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT outbox_idempotency_fk
    FOREIGN KEY (
      company_id, scope_type, actor_id, idempotency_key, operation_id
    )
    REFERENCES portal_dp.idempotency_records (
      company_id, scope_type, actor_id, idempotency_key, operation_id
    )
    ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT outbox_scope_ck CHECK (scope_type = 'EMPRESARIAL'),
  CONSTRAINT outbox_dedupe_uq UNIQUE (company_id, dedupe_key),
  CONSTRAINT outbox_payload_object_ck
    CHECK (jsonb_typeof(payload) = 'object'),
  CONSTRAINT outbox_status_ck
    CHECK (status IN ('PENDING', 'LEASED', 'SUCCEEDED', 'FAILED')),
  CONSTRAINT outbox_attempts_ck
    CHECK (attempt_count >= 0 AND max_attempts > 0 AND attempt_count <= max_attempts),
  -- Lease e término formam uma máquina de estados fechada: somente LEASED tem
  -- token/prazo; somente SUCCEEDED ou FAILED possui data de término.
  CONSTRAINT outbox_lease_ck
    CHECK (
      (status = 'LEASED'
       AND lease_owner IS NOT NULL
       AND lease_token IS NOT NULL
       AND lease_until IS NOT NULL)
      OR (status <> 'LEASED'
          AND lease_owner IS NULL
          AND lease_token IS NULL
          AND lease_until IS NULL)
    ),
  CONSTRAINT outbox_finished_ck
    CHECK (
      (status IN ('SUCCEEDED', 'FAILED') AND finished_at IS NOT NULL)
      OR (status IN ('PENDING', 'LEASED') AND finished_at IS NULL)
    )
);

CREATE INDEX outbox_claim_idx
  ON portal_dp.outbox_tasks
    (company_id, status, available_at, lease_until, created_at)
  WHERE status IN ('PENDING', 'LEASED');

CREATE TABLE portal_dp.private_objects (
  company_id uuid NOT NULL,
  id uuid NOT NULL DEFAULT pg_catalog.gen_random_uuid(),
  source_task_id uuid NOT NULL,
  owner_type portal_dp.nonempty_text NOT NULL,
  owner_id uuid NOT NULL,
  storage_key portal_dp.nonempty_text NOT NULL,
  media_type portal_dp.nonempty_text NOT NULL,
  byte_size bigint NOT NULL,
  sha256 portal_dp.sha256_digest NOT NULL,
  validation_status text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  created_by uuid NOT NULL,
  PRIMARY KEY (company_id, id),
  CONSTRAINT private_object_company_fk
    FOREIGN KEY (company_id) REFERENCES portal_dp.companies (id)
    ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT private_object_task_fk
    FOREIGN KEY (company_id, source_task_id)
    REFERENCES portal_dp.outbox_tasks (company_id, id)
    ON UPDATE RESTRICT ON DELETE RESTRICT,
  -- Cada tarefa produz no máximo um objeto, sempre no namespace da própria
  -- empresa como defesa adicional ao RLS.
  CONSTRAINT private_object_one_effect_per_task_uq
    UNIQUE (company_id, source_task_id),
  CONSTRAINT private_object_storage_key_uq UNIQUE (company_id, storage_key),
  CONSTRAINT private_object_storage_namespace_ck
    CHECK (storage_key LIKE 'companies/' || company_id::text || '/%'),
  CONSTRAINT private_object_size_ck CHECK (byte_size >= 0),
  CONSTRAINT private_object_validation_ck
    CHECK (validation_status IN ('PENDING_VALIDATION', 'AVAILABLE', 'REJECTED', 'QUARANTINED'))
);

COMMENT ON TABLE portal_dp.global_company_model_versions IS
  'BK-077: catalogo global minimo, fechado, versionado e append-only.';
COMMENT ON TABLE portal_dp.enterprise_proof_roots IS
  'BK-015: raiz empresarial sintetica usada pela prova vertical da ETP-00.';
COMMENT ON TABLE portal_dp.audit_events IS
  'BK-006/320/331: auditoria funcional atomica e append-only.';
COMMENT ON TABLE portal_dp.idempotency_records IS
  'BK-007: mesma chave e intencao produzem um unico efeito empresarial.';
COMMENT ON TABLE portal_dp.outbox_tasks IS
  'BK-008: outbox/fila duravel por empresa, com lease e retomada.';
COMMENT ON TABLE portal_dp.private_objects IS
  'BK-009: somente metadados de objeto privado; nunca URL publica.';

ALTER TABLE portal_dp.global_company_model_versions OWNER TO portal_dp_owner;
ALTER TABLE portal_dp.companies OWNER TO portal_dp_owner;
ALTER TABLE portal_dp.synthetic_actor_company_grants OWNER TO portal_dp_owner;
ALTER TABLE portal_dp.enterprise_proof_roots OWNER TO portal_dp_owner;
ALTER TABLE portal_dp.audit_events OWNER TO portal_dp_owner;
ALTER TABLE portal_dp.idempotency_records OWNER TO portal_dp_owner;
ALTER TABLE portal_dp.outbox_tasks OWNER TO portal_dp_owner;
ALTER TABLE portal_dp.private_objects OWNER TO portal_dp_owner;
