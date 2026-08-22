import { FastifyOtelInstrumentation } from "@fastify/otel";
import {
  metrics,
  SpanStatusCode,
  trace,
  type Counter,
  type Histogram,
} from "@opentelemetry/api";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-http";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
import { NodeSDK } from "@opentelemetry/sdk-node";

let httpRequests: Counter | undefined;
let httpDuration: Histogram | undefined;
let outboxAttempts: Counter | undefined;
let outboxLag: Histogram | undefined;
let workerPolls: Counter | undefined;
let circuitTransitions: Counter | undefined;
let dependencyAttempts: Counter | undefined;

// Os instrumentos nascem sob demanda porque o provedor OpenTelemetry pode ser
// instalado depois da importação deste módulo durante a inicialização.
function getHttpInstruments(): {
  requests: Counter;
  duration: Histogram;
} {
  const meter = metrics.getMeter("portal-dp");
  httpRequests ??= meter.createCounter("portal_dp.http.server.requests", {
    description: "Quantidade de respostas HTTP por metodo e classe de status.",
  });
  httpDuration ??= meter.createHistogram("portal_dp.http.server.duration_ms", {
    description: "Duracao das respostas HTTP em milissegundos.",
    unit: "ms",
  });
  return { requests: httpRequests, duration: httpDuration };
}

function getOutboxAttempts(): Counter {
  const meter = metrics.getMeter("portal-dp");
  outboxAttempts ??= meter.createCounter("portal_dp.outbox.attempts", {
    description: "Tentativas do worker por resultado tecnico permitido.",
  });
  return outboxAttempts;
}

export interface TelemetryHandle {
  enabled: boolean;
  shutdown(): Promise<void>;
}

export function recordHttpServerRequest(input: {
  method: string;
  statusCode: number;
  durationMs: number;
}): void {
  const attributes = {
    "http.request.method": input.method,
    "http.response.status_class": `${Math.floor(input.statusCode / 100)}xx`,
  };
  const instruments = getHttpInstruments();
  instruments.requests.add(1, attributes);
  instruments.duration.record(Math.max(0, input.durationMs), attributes);
}

export function recordOutboxAttempt(
  result: "succeeded" | "retry" | "exhausted" | "permanent" | "stale_lease",
): void {
  getOutboxAttempts().add(1, { "portal.outbox.result": result });
}

export function recordOutboxLag(
  lagMs: number,
  source: "oldest_pending" | "leased_task" = "leased_task",
): void {
  const meter = metrics.getMeter("portal-dp");
  outboxLag ??= meter.createHistogram("portal_dp.outbox.lag_ms", {
    description: "Atraso entre a criacao e o processamento da tarefa.",
    unit: "ms",
  });
  outboxLag.record(Math.max(0, lagMs), { "portal.outbox.source": source });
}

export function recordWorkerPoll(): void {
  const meter = metrics.getMeter("portal-dp");
  workerPolls ??= meter.createCounter("portal_dp.worker.polls", {
    description:
      "Consultas completas do worker; ausência é monitorada externamente.",
  });
  workerPolls.add(1);
}

export function recordDependencyCircuitTransition(
  dependency: string,
  from: "CLOSED" | "OPEN" | "HALF_OPEN",
  to: "CLOSED" | "OPEN" | "HALF_OPEN",
): void {
  const meter = metrics.getMeter("portal-dp");
  circuitTransitions ??= meter.createCounter(
    "portal_dp.dependency.circuit.transitions",
    { description: "Transições de circuit breaker por dependência." },
  );
  circuitTransitions.add(1, {
    "portal.dependency": dependency,
    "portal.circuit.from": from,
    "portal.circuit.to": to,
  });
}

export function recordDependencyAttempt(
  dependency: string,
  attempt: number,
  result: "succeeded" | "transient_failure" | "permanent_failure" | "exhausted",
): void {
  const meter = metrics.getMeter("portal-dp");
  dependencyAttempts ??= meter.createCounter("portal_dp.dependency.attempts", {
    description: "Tentativas internas por dependência e resultado.",
  });
  dependencyAttempts.add(1, {
    "portal.dependency": dependency,
    "portal.dependency.attempt": attempt,
    "portal.dependency.result": result,
  });
}

export async function withTelemetrySpan<T>(
  name: string,
  attributes: Record<string, string>,
  work: () => Promise<T>,
): Promise<T> {
  return trace
    .getTracer("portal-dp")
    .startActiveSpan(name, { attributes }, async (span) => {
      try {
        const result = await work();
        span.setStatus({ code: SpanStatusCode.OK });
        return result;
      } catch (error) {
        span.setStatus({ code: SpanStatusCode.ERROR });
        // A exceção original pode conter dados protegidos; o span registra apenas
        // descrição genérica e o diagnóstico usa o evento sanitizado correlato.
        span.recordException({
          name: "OperationError",
          message: "Operation failed; consult the correlated sanitized event",
        });
        throw error;
      } finally {
        span.end();
      }
    });
}

export function currentTraceIdentifiers(): {
  traceId?: string;
  spanId?: string;
} {
  const context = trace.getActiveSpan()?.spanContext();
  if (!context || !context.traceId || /^0+$/u.test(context.traceId)) return {};
  return { traceId: context.traceId, spanId: context.spanId };
}

export async function startTelemetry(input: {
  serviceName: string;
  endpoint?: string | undefined;
  metricsEndpoint?: string | undefined;
  instrumentFastify?: boolean | undefined;
  instrumentNode?: boolean | undefined;
  onFailure?: ((error: unknown) => void) | undefined;
}): Promise<TelemetryHandle> {
  if (!input.endpoint && !input.metricsEndpoint)
    return { enabled: false, shutdown: async () => undefined };

  const sdk = new NodeSDK({
    serviceName: input.serviceName,
    ...(input.endpoint
      ? { traceExporter: new OTLPTraceExporter({ url: input.endpoint }) }
      : {}),
    ...(input.metricsEndpoint
      ? {
          metricReaders: [
            new PeriodicExportingMetricReader({
              exporter: new OTLPMetricExporter({ url: input.metricsEndpoint }),
              exportIntervalMillis: 60_000,
              exportTimeoutMillis: 10_000,
            }),
          ],
        }
      : {}),
    instrumentations: [
      ...(input.instrumentFastify
        ? [new FastifyOtelInstrumentation({ registerOnInitialization: true })]
        : []),
      ...(input.instrumentNode === false
        ? []
        : [
            getNodeAutoInstrumentations({
              "@opentelemetry/instrumentation-fs": { enabled: false },
            }),
          ]),
    ],
  });

  try {
    await sdk.start();
    return { enabled: true, shutdown: async () => sdk.shutdown() };
  } catch (error) {
    input.onFailure?.(error);
    return { enabled: false, shutdown: async () => undefined };
  }
}
