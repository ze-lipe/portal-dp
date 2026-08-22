import "reflect-metadata";

import { startTelemetry } from "@portal-dp/observability";
import type { NestFastifyApplication } from "@nestjs/platform-fastify";

import { loadConfig } from "./config.js";

const config = loadConfig();
const telemetry = await startTelemetry({
  serviceName: `${config.appName}-api`,
  endpoint: config.telemetryEndpoint,
  metricsEndpoint: config.telemetryMetricsEndpoint,
  instrumentFastify: true,
  onFailure: () =>
    process.stderr.write(
      "Telemetria indisponivel; auditoria permanece obrigatoria.\n",
    ),
});

// Os módulos HTTP são carregados depois da telemetria para a instrumentação
// automática interceptá-los desde a inicialização.
const [{ Logger }, { createApiApplication }] = await Promise.all([
  import("@nestjs/common"),
  import("./app-factory.js"),
]);

let app: NestFastifyApplication | undefined;

try {
  app = await createApiApplication(config);

  let shuttingDown = false;
  const shutdown = async (): Promise<void> => {
    if (shuttingDown) return;
    shuttingDown = true;
    await app?.close();
    await telemetry.shutdown();
  };
  process.once("SIGINT", () => void shutdown());
  process.once("SIGTERM", () => void shutdown());

  await app.listen(config.port, config.host);
  Logger.log(
    `API ${config.appVersion} pronta em ${config.host}:${config.port}`,
    "Bootstrap",
  );
} catch (error) {
  await app?.close().catch(() => undefined);
  await telemetry.shutdown().catch(() => undefined);
  throw error;
}
