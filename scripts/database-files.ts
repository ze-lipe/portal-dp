import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";

import type { PoolClient } from "pg";

const root = resolve(import.meta.dirname, "..");

export async function applySqlDirectory(
  client: PoolClient,
  input: { directory: "migrations" | "seeds"; track: boolean },
): Promise<void> {
  const directory = resolve(root, "database", input.directory);
  const filenames = (await readdir(directory))
    .filter((name) => /^\d+.*\.sql$/u.test(name))
    .sort((left, right) => left.localeCompare(right, "en"));

  if (input.track) {
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.portal_dp_schema_migrations (
        version text PRIMARY KEY,
        sha256 text NOT NULL,
        applied_at timestamptz NOT NULL DEFAULT clock_timestamp()
      )
    `);
  }

  for (const filename of filenames) {
    const sql = await readFile(resolve(directory, filename), "utf8");
    const sha256 = createHash("sha256").update(sql).digest("hex");
    if (input.track) {
      const existing = await client.query<{ sha256: string }>(
        "SELECT sha256 FROM public.portal_dp_schema_migrations WHERE version = $1",
        [filename],
      );
      if (existing.rowCount === 1) {
        if (existing.rows[0]?.sha256 !== sha256) {
          throw new Error(`Applied migration ${filename} has changed`);
        }
        continue;
      }
    }

    await client.query("BEGIN");
    try {
      await client.query("SET LOCAL lock_timeout = '5s'");
      await client.query("SET LOCAL statement_timeout = '60s'");
      await client.query(sql);
      if (input.track) {
        await client.query(
          "INSERT INTO public.portal_dp_schema_migrations (version, sha256) VALUES ($1, $2)",
          [filename, sha256],
        );
      }
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    }
  }
}
