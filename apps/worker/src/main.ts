import { startTelemetry } from "@portal-dp/observability";

import { loadWorkerConfig } from "./config.js";
import { WorkerRunner } from "./runner.js";

const config = loadWorkerConfig();
const telemetry = await startTelemetry({
  serviceName: "portal-dp-worker",
  endpoint: config.telemetryEndpoint,
  metricsEndpoint: config.telemetryMetricsEndpoint,
  onFailure: () =>
    process.stderr.write(
      "Telemetry indisponivel; auditoria permanece obrigatoria.\n",
    ),
});
const { Pool } = await import("pg");
const pool = new Pool({
  connectionString: config.databaseUrl,
  application_name: "portal-dp-worker",
  max: 4,
  connectionTimeoutMillis: 5_000,
  idleTimeoutMillis: 30_000,
});
const runner = new WorkerRunner(pool, config);

const shutdown = (): void => runner.stop();
process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);

try {
  await runner.start();
} finally {
  await pool.end();
  await telemetry.shutdown();
}
