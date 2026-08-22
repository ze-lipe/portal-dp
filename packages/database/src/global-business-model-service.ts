import type { Pool, PoolClient } from "pg";

export const ETP00_MODEL_KEY = "ETP00_MINIMUM_DENY_BY_DEFAULT";
export const ETP00_MODEL_AUTHOR_ID = "10000000-0000-4000-8000-000000000001";

export const ETP00_MODEL_VERSIONS = Object.freeze([
  Object.freeze({
    version: 1,
    catalog: Object.freeze({
      schema_version: 1,
      default_effect: "DENY",
      operations: Object.freeze([
        "EMPRESA.SINTETICA.LER",
        "EMPRESA.SINTETICA.ALTERAR",
      ]),
      fields: Object.freeze([]),
    }),
  }),
  Object.freeze({
    version: 2,
    catalog: Object.freeze({
      schema_version: 2,
      default_effect: "DENY",
      operations: Object.freeze([
        "EMPRESA.SINTETICA.LER",
        "EMPRESA.SINTETICA.ALTERAR",
        "ARQUIVO.SINTETICO.BAIXAR",
      ]),
      fields: Object.freeze([]),
    }),
  }),
] as const);

export interface EnsuredGlobalModelVersion {
  readonly version: number;
  readonly contentHash: string;
}

export async function ensureEtp00GlobalBusinessModel(
  pool: Pool,
): Promise<readonly EnsuredGlobalModelVersion[]> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    // O bloqueio torna inicializações concorrentes determinísticas. Versões
    // existentes nunca são corrigidas silenciosamente: divergência indica drift.
    await client.query(
      "SELECT pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended($1, 0))",
      [ETP00_MODEL_KEY],
    );
    for (const expected of ETP00_MODEL_VERSIONS) {
      await ensureVersion(client, expected.version, expected.catalog);
    }

    const verified = await client.query<{
      version: number;
      content_hash: string;
      catalog_matches: boolean;
    }>(
      `SELECT model.version,
              encode(model.content_hash, 'hex') AS content_hash,
              model.catalog = expected.catalog AS catalog_matches
         FROM portal_dp.global_company_model_versions AS model
         JOIN (
           VALUES (1, $2::jsonb), (2, $3::jsonb)
         ) AS expected(version, catalog)
           ON expected.version = model.version
        WHERE model.model_key = $1
          AND model.default_effect = 'DENY'
        ORDER BY model.version`,
      [
        ETP00_MODEL_KEY,
        JSON.stringify(ETP00_MODEL_VERSIONS[0].catalog),
        JSON.stringify(ETP00_MODEL_VERSIONS[1].catalog),
      ],
    );
    const extraVersions = await client.query<{ count: string }>(
      `SELECT count(*)::text AS count
         FROM portal_dp.global_company_model_versions
        WHERE model_key = $1
          AND version NOT IN (1, 2)`,
      [ETP00_MODEL_KEY],
    );
    if (
      verified.rowCount !== ETP00_MODEL_VERSIONS.length ||
      verified.rows.some(
        (row) =>
          !row.catalog_matches || !/^[0-9a-f]{64}$/u.test(row.content_hash),
      ) ||
      extraVersions.rows[0]?.count !== "0"
    ) {
      throw new Error("Synthetic global business model drift detected");
    }

    await client.query("COMMIT");
    return Object.freeze(
      verified.rows.map((row) =>
        Object.freeze({
          version: row.version,
          contentHash: row.content_hash,
        }),
      ),
    );
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function ensureVersion(
  client: PoolClient,
  version: number,
  catalog: Readonly<Record<string, unknown>>,
): Promise<void> {
  const existing = await client.query<{ matches: boolean }>(
    `SELECT catalog = $3::jsonb AND default_effect = 'DENY' AS matches
       FROM portal_dp.global_company_model_versions
      WHERE model_key = $1 AND version = $2`,
    [ETP00_MODEL_KEY, version, JSON.stringify(catalog)],
  );
  if (existing.rowCount === 1) {
    if (!existing.rows[0]?.matches) {
      throw new Error(
        `Synthetic global model V${version} differs from canonical content`,
      );
    }
    return;
  }

  await client.query(
    `INSERT INTO portal_dp.global_company_model_versions
       (model_key, version, catalog, created_by)
     VALUES ($1, $2, $3::jsonb, $4)`,
    [ETP00_MODEL_KEY, version, JSON.stringify(catalog), ETP00_MODEL_AUTHOR_ID],
  );
}
