import { z } from "zod";

const uuid = z.string().uuid();
const schema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "homologation", "production"])
    .default("development"),
  WORKER_DATABASE_URL: z.string().min(1),
  WORKER_ID: z.string().min(3).max(100).default("portal-dp-worker-etp00"),
  WORKER_ACTOR_ID: uuid.default("10000000-0000-4000-8000-000000000001"),
  WORKER_COMPANY_IDS: z.string().default(""),
  WORKER_POLL_INTERVAL_MS: z.coerce
    .number()
    .int()
    .min(100)
    .max(60_000)
    .default(1_000),
  WORKER_LEASE_SECONDS: z.coerce.number().int().min(5).max(3_600).default(30),
  OUTBOX_DELAY_ALERT_MS: z.coerce
    .number()
    .int()
    .min(1_000)
    .max(86_400_000)
    .default(300_000),
  PRIVATE_OBJECT_ROOT: z.string().min(1).default("./tmp/private-objects"),
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
  ETP00_SYNTHETIC_PROOF_ENABLED: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true"),
});

export interface WorkerConfig {
  nodeEnv: "development" | "test" | "homologation" | "production";
  databaseUrl: string;
  workerId: string;
  actorId: string;
  companyIds: string[];
  pollIntervalMs: number;
  leaseSeconds: number;
  outboxDelayAlertMs: number;
  privateObjectRoot: string;
  telemetryEndpoint?: string | undefined;
  telemetryMetricsEndpoint?: string | undefined;
}

function telemetryEndpoint(parsed: z.infer<typeof schema>): string | undefined {
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
  parsed: z.infer<typeof schema>,
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

export function loadWorkerConfig(
  environment: NodeJS.ProcessEnv = process.env,
): WorkerConfig {
  const parsed = schema.parse(environment);
  if (
    parsed.NODE_ENV === "production" &&
    parsed.ETP00_SYNTHETIC_PROOF_ENABLED
  ) {
    throw new Error("Synthetic ETP-00 worker is forbidden in production");
  }
  if (!parsed.ETP00_SYNTHETIC_PROOF_ENABLED) {
    throw new Error(
      "ETP-00 worker requires explicit synthetic proof enablement",
    );
  }
  const companyIds = [
    ...new Set(
      parsed.WORKER_COMPANY_IDS.split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  ];
  for (const companyId of companyIds) uuid.parse(companyId);
  if (companyIds.length === 0)
    throw new Error("At least one synthetic company must be configured");

  return {
    nodeEnv: parsed.NODE_ENV,
    databaseUrl: parsed.WORKER_DATABASE_URL,
    workerId: parsed.WORKER_ID,
    actorId: parsed.WORKER_ACTOR_ID,
    companyIds,
    pollIntervalMs: parsed.WORKER_POLL_INTERVAL_MS,
    leaseSeconds: parsed.WORKER_LEASE_SECONDS,
    outboxDelayAlertMs: parsed.OUTBOX_DELAY_ALERT_MS,
    privateObjectRoot: parsed.PRIVATE_OBJECT_ROOT,
    telemetryEndpoint: telemetryEndpoint(parsed),
    telemetryMetricsEndpoint: telemetryMetricsEndpoint(parsed),
  };
}
