import { z } from "zod";

const environmentSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "homologation", "production"])
    .default("development"),
  APP_NAME: z.string().min(1).default("portal-dp"),
  APP_VERSION: z.string().min(1).default("0.0.0-etp00"),
  API_HOST: z.string().min(1).default("127.0.0.1"),
  API_PORT: z.coerce.number().int().min(1).max(65_535).default(3000),
  WEB_ORIGIN: z.string().url().default("http://localhost:5173"),
  API_CORS_ENABLED: z.enum(["true", "false"]).optional(),
  OTEL_EXPORTER_OTLP_ENDPOINT: z.string().url().optional().or(z.literal("")),
  OTEL_EXPORTER_OTLP_TRACES_ENDPOINT: z
    .string()
    .url()
    .optional()
    .or(z.literal("")),
  OTEL_EXPORTER_OTLP_METRICS_ENDPOINT: z
    .string()
    .url()
    .optional()
    .or(z.literal("")),
  DATABASE_URL: z
    .string()
    .min(1)
    .default(
      "postgresql://portal_dp_app_login:LOCAL_APP_CHANGE_ME@localhost:5432/portal_dp?options=-c%20role%3Dportal_dp_app",
    ),
  ETP00_SYNTHETIC_PROOF_ENABLED: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true"),
});

export type AppConfig = {
  nodeEnv: "development" | "test" | "homologation" | "production";
  appName: string;
  appVersion: string;
  host: string;
  port: number;
  webOrigin: string;
  corsEnabled: boolean;
  databaseUrl: string;
  telemetryEndpoint?: string | undefined;
  telemetryMetricsEndpoint?: string | undefined;
  syntheticProofEnabled: boolean;
};

export const APP_CONFIG = Symbol("APP_CONFIG");

function telemetryEndpoint(
  parsed: z.infer<typeof environmentSchema>,
): string | undefined {
  if (parsed.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT) {
    return parsed.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT;
  }
  if (!parsed.OTEL_EXPORTER_OTLP_ENDPOINT) return undefined;
  const base = parsed.OTEL_EXPORTER_OTLP_ENDPOINT.endsWith("/")
    ? parsed.OTEL_EXPORTER_OTLP_ENDPOINT
    : `${parsed.OTEL_EXPORTER_OTLP_ENDPOINT}/`;
  return new URL("v1/traces", base).toString();
}

function telemetryMetricsEndpoint(
  parsed: z.infer<typeof environmentSchema>,
): string | undefined {
  if (parsed.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT) {
    return parsed.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT;
  }
  if (!parsed.OTEL_EXPORTER_OTLP_ENDPOINT) return undefined;
  const base = parsed.OTEL_EXPORTER_OTLP_ENDPOINT.endsWith("/")
    ? parsed.OTEL_EXPORTER_OTLP_ENDPOINT
    : `${parsed.OTEL_EXPORTER_OTLP_ENDPOINT}/`;
  return new URL("v1/metrics", base).toString();
}

export function loadConfig(
  environment: NodeJS.ProcessEnv = process.env,
): AppConfig {
  const parsed = environmentSchema.parse(environment);
  if (
    parsed.NODE_ENV === "production" &&
    parsed.ETP00_SYNTHETIC_PROOF_ENABLED
  ) {
    throw new Error("ETP00 synthetic proof must be disabled in production");
  }
  const corsEnabled =
    parsed.API_CORS_ENABLED === undefined
      ? parsed.NODE_ENV !== "production"
      : parsed.API_CORS_ENABLED === "true";
  if (parsed.NODE_ENV === "production" && corsEnabled) {
    throw new Error(
      "CORS must remain disabled for the production same-origin deployment",
    );
  }
  if (
    parsed.NODE_ENV === "production" &&
    /LOCAL_(?:ONLY|APP)_CHANGE_ME/u.test(parsed.DATABASE_URL)
  ) {
    throw new Error("Production database credentials are not configured");
  }

  return {
    nodeEnv: parsed.NODE_ENV,
    appName: parsed.APP_NAME,
    appVersion: parsed.APP_VERSION,
    host: parsed.API_HOST,
    port: parsed.API_PORT,
    webOrigin: parsed.WEB_ORIGIN,
    corsEnabled,
    databaseUrl: parsed.DATABASE_URL,
    telemetryEndpoint: telemetryEndpoint(parsed),
    telemetryMetricsEndpoint: telemetryMetricsEndpoint(parsed),
    syntheticProofEnabled: parsed.ETP00_SYNTHETIC_PROOF_ENABLED,
  };
}
