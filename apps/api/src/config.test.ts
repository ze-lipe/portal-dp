import { describe, expect, it } from "vitest";

import { loadConfig } from "./config.js";

describe("loadConfig", () => {
  it.each(["development", "homologation", "production"] as const)(
    "rejeita a prova sintetica fora de teste: %s",
    (nodeEnv) => {
      expect(() =>
        loadConfig({
          NODE_ENV: nodeEnv,
          DATABASE_URL: "postgresql://portal:secret@db.example/portal",
          ETP00_SYNTHETIC_PROOF_ENABLED: "true",
        }),
      ).toThrow(/synthetic proof/i);
    },
  );

  it("mantem a prova sintetica desligada por padrao", () => {
    expect(loadConfig({ NODE_ENV: "test" }).syntheticProofEnabled).toBe(false);
  });

  it("rejeita CORS em producao same-origin", () => {
    expect(() =>
      loadConfig({
        NODE_ENV: "production",
        DATABASE_URL: "postgresql://portal:secret@db.example/portal",
        API_CORS_ENABLED: "true",
      }),
    ).toThrow(/CORS must remain disabled/i);
  });

  it("normaliza endpoint vazio de telemetria como desabilitado", () => {
    expect(
      loadConfig({ NODE_ENV: "test", OTEL_EXPORTER_OTLP_ENDPOINT: "" })
        .telemetryEndpoint,
    ).toBeUndefined();
  });

  it("deriva o endpoint HTTP de traces a partir do endpoint OTLP geral", () => {
    const config = loadConfig({
      NODE_ENV: "test",
      OTEL_EXPORTER_OTLP_ENDPOINT: "http://collector.example:4318",
    });
    expect(config.telemetryEndpoint).toBe(
      "http://collector.example:4318/v1/traces",
    );
    expect(config.telemetryMetricsEndpoint).toBe(
      "http://collector.example:4318/v1/metrics",
    );
  });
});
