-- Massa exclusivamente sintética do BK-363. Nenhuma linha deste arquivo
-- representa pessoa, empresa, documento fiscal, pagamento ou documento real.

SELECT pg_catalog.pg_advisory_xact_lock(
  pg_catalog.hashtextextended('portal-dp-etp00-synthetic-fixture-v1', 0)
);

-- O modelo global V1/V2 é criado e validado pelo serviço canônico
-- ensureEtp00GlobalBusinessModel antes da carga das empresas. Este seed apenas
-- consome o modelo persistido; não o recria por SQL paralelo.
DO $require_global_model$
BEGIN
  IF (
    SELECT count(*)
      FROM portal_dp.global_company_model_versions
     WHERE model_key = 'ETP00_MINIMUM_DENY_BY_DEFAULT'
       AND version IN (1, 2)
       AND default_effect = 'DENY'
  ) <> 2 THEN
    RAISE EXCEPTION 'canonical ETP-00 global model service must run before seeds'
      USING ERRCODE = '55000';
  END IF;
END
$require_global_model$;

SELECT set_config('app.actor_id', '10000000-0000-4000-8000-000000000001', true);

SELECT set_config('app.company_id', '00000000-0000-4000-8000-00000000000a', true);
INSERT INTO portal_dp.companies (
  id, synthetic_key, legal_name, is_synthetic,
  model_key, model_version, created_by
) VALUES (
  '00000000-0000-4000-8000-00000000000a',
  'A',
  'Empresa Sintetica A',
  true,
  'ETP00_MINIMUM_DENY_BY_DEFAULT',
  1,
  '10000000-0000-4000-8000-000000000001'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO portal_dp.synthetic_actor_company_grants (
  company_id, actor_id, granted_by
) VALUES (
  '00000000-0000-4000-8000-00000000000a',
  '10000000-0000-4000-8000-000000000001',
  '10000000-0000-4000-8000-000000000001'
)
ON CONFLICT (company_id, actor_id) DO NOTHING;

INSERT INTO portal_dp.enterprise_proof_roots (
  company_id, id, proof_key, payload, created_by, updated_by
) VALUES (
  '00000000-0000-4000-8000-00000000000a',
  '20000000-0000-4000-8000-00000000000a',
  'FIXTURE-A',
  '{"fixture":"A","synthetic":true}'::jsonb,
  '10000000-0000-4000-8000-000000000001',
  '10000000-0000-4000-8000-000000000001'
)
ON CONFLICT (company_id, id) DO NOTHING;

SELECT set_config('app.company_id', '00000000-0000-4000-8000-00000000000b', true);
INSERT INTO portal_dp.companies (
  id, synthetic_key, legal_name, is_synthetic,
  model_key, model_version, created_by
) VALUES (
  '00000000-0000-4000-8000-00000000000b',
  'B',
  'Empresa Sintetica B',
  true,
  'ETP00_MINIMUM_DENY_BY_DEFAULT',
  1,
  '10000000-0000-4000-8000-000000000001'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO portal_dp.enterprise_proof_roots (
  company_id, id, proof_key, payload, created_by, updated_by
) VALUES (
  '00000000-0000-4000-8000-00000000000b',
  '20000000-0000-4000-8000-00000000000b',
  'FIXTURE-B',
  '{"fixture":"B","synthetic":true}'::jsonb,
  '10000000-0000-4000-8000-000000000001',
  '10000000-0000-4000-8000-000000000001'
)
ON CONFLICT (company_id, id) DO NOTHING;

SELECT set_config('app.company_id', '00000000-0000-4000-8000-00000000000c', true);
INSERT INTO portal_dp.companies (
  id, synthetic_key, legal_name, is_synthetic,
  model_key, model_version, created_by
) VALUES (
  '00000000-0000-4000-8000-00000000000c',
  'C',
  'Empresa Sintetica C',
  true,
  'ETP00_MINIMUM_DENY_BY_DEFAULT',
  2,
  '10000000-0000-4000-8000-000000000001'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO portal_dp.enterprise_proof_roots (
  company_id, id, proof_key, payload, created_by, updated_by
) VALUES (
  '00000000-0000-4000-8000-00000000000c',
  '20000000-0000-4000-8000-00000000000c',
  'FIXTURE-C',
  '{"fixture":"C","synthetic":true}'::jsonb,
  '10000000-0000-4000-8000-000000000001',
  '10000000-0000-4000-8000-000000000001'
)
ON CONFLICT (company_id, id) DO NOTHING;

DO $validate_fixture$
DECLARE
  fixture record;
  expected_grants integer;
BEGIN
  FOR fixture IN
    SELECT *
      FROM (VALUES
        ('00000000-0000-4000-8000-00000000000a'::uuid, 'A',
         'Empresa Sintetica A', 1,
         '20000000-0000-4000-8000-00000000000a'::uuid,
         'FIXTURE-A', '{"fixture":"A","synthetic":true}'::jsonb),
        ('00000000-0000-4000-8000-00000000000b'::uuid, 'B',
         'Empresa Sintetica B', 1,
         '20000000-0000-4000-8000-00000000000b'::uuid,
         'FIXTURE-B', '{"fixture":"B","synthetic":true}'::jsonb),
        ('00000000-0000-4000-8000-00000000000c'::uuid, 'C',
         'Empresa Sintetica C', 2,
         '20000000-0000-4000-8000-00000000000c'::uuid,
         'FIXTURE-C', '{"fixture":"C","synthetic":true}'::jsonb)
      ) AS expected(
        company_id, synthetic_key, legal_name, model_version,
        root_id, proof_key, payload
      )
  LOOP
    PERFORM set_config('app.company_id', fixture.company_id::text, true);

    IF (
      SELECT count(*)
        FROM portal_dp.companies
       WHERE id = fixture.company_id
         AND synthetic_key = fixture.synthetic_key
         AND legal_name::text = fixture.legal_name
         AND model_version = fixture.model_version
         AND is_synthetic
         AND model_key = 'ETP00_MINIMUM_DENY_BY_DEFAULT'
    ) <> 1 THEN
      RAISE EXCEPTION 'synthetic company fixture drift detected for %',
        fixture.synthetic_key USING ERRCODE = '23514';
    END IF;

    IF (
      SELECT count(*)
        FROM portal_dp.enterprise_proof_roots
       WHERE company_id = fixture.company_id
         AND id = fixture.root_id
         AND proof_key = fixture.proof_key
         AND payload = fixture.payload
    ) <> 1 THEN
      RAISE EXCEPTION 'synthetic proof-root fixture drift detected for %',
        fixture.synthetic_key USING ERRCODE = '23514';
    END IF;

    expected_grants := CASE WHEN fixture.synthetic_key = 'A' THEN 1 ELSE 0 END;
    IF (
      SELECT count(*)
        FROM portal_dp.synthetic_actor_company_grants
       WHERE company_id = fixture.company_id
         AND actor_id = '10000000-0000-4000-8000-000000000001'
    ) <> expected_grants THEN
      RAISE EXCEPTION 'synthetic actor grant drift detected for %',
        fixture.synthetic_key USING ERRCODE = '23514';
    END IF;
  END LOOP;
END
$validate_fixture$;

RESET app.company_id;
RESET app.actor_id;
