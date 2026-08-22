import { Pool } from "pg";

import { ensureEtp00GlobalBusinessModel } from "../packages/database/src/global-business-model-service.js";
import { applySqlDirectory } from "./database-files.js";

if (process.env["NODE_ENV"] === "production") {
  throw new Error("Synthetic fixture is forbidden in production");
}
if (process.env["ETP00_SYNTHETIC_PROOF_ENABLED"] !== "true") {
  throw new Error(
    "ETP00_SYNTHETIC_PROOF_ENABLED=true is required for synthetic fixture",
  );
}
const databaseUrl = process.env["MIGRATOR_DATABASE_URL"]?.trim();
if (!databaseUrl) throw new Error("MIGRATOR_DATABASE_URL is required");

const pool = new Pool({
  connectionString: databaseUrl,
  application_name: "portal-dp-synthetic-seed",
  max: 1,
  connectionTimeoutMillis: 10_000,
});
const models = await ensureEtp00GlobalBusinessModel(pool);
const client = await pool.connect();
try {
  await applySqlDirectory(client, { directory: "seeds", track: false });
  console.log(
    JSON.stringify({
      seeded: true,
      dataClassification: "SYNTHETIC_ONLY",
      globalModelVersions: models.map((model) => model.version),
    }),
  );
} finally {
  client.release();
  await pool.end();
}
