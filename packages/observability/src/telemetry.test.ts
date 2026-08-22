import { createServer } from "node:http";

import { afterAll, describe, expect, it } from "vitest";

import {
  currentTraceIdentifiers,
  recordDependencyAttempt,
  recordDependencyCircuitTransition,
  recordHttpServerRequest,
  recordOutboxAttempt,
  recordOutboxLag,
  recordWorkerPoll,
  startTelemetry,
  withTelemetrySpan,
} from "./telemetry.js";

describe("telemetria OpenTelemetry", () => {
  const shutdowns: Array<() => Promise<void>> = [];

  afterAll(async () => {
    await Promise.all(shutdowns.map((shutdown) => shutdown()));
  });

  it("mantem o trabalho disponivel quando o exportador nao foi configurado", async () => {
    const telemetry = await startTelemetry({ serviceName: "etp00-disabled" });
    shutdowns.push(telemetry.shutdown);

    await expect(
      withTelemetrySpan("etp00.no-exporter", {}, async () => "auditavel"),
    ).resolves.toBe("auditavel");
    expect(telemetry.enabled).toBe(false);
  });

  it("exporta um span OTLP real para um receptor controlado", async () => {
    const payloads: Array<{ path: string; bytes: Buffer }> = [];
    const receiver = createServer((request, response) => {
      const chunks: Buffer[] = [];
      request.on("data", (chunk: Buffer) => chunks.push(chunk));
      request.on("end", () => {
        payloads.push({
          path: request.url ?? "",
          bytes: Buffer.concat(chunks),
        });
        response.writeHead(200, { "content-type": "application/json" });
        response.end();
      });
    });
    await new Promise<void>((resolve, reject) => {
      receiver.once("error", reject);
      receiver.listen(0, "127.0.0.1", () => resolve());
    });

    const address = receiver.address();
    if (address === null || typeof address === "string") {
      throw new Error("OTLP test receiver did not expose a TCP port");
    }

    const telemetry = await startTelemetry({
      serviceName: "portal-dp-etp00-telemetry-test",
      endpoint: `http://127.0.0.1:${address.port}/v1/traces`,
      metricsEndpoint: `http://127.0.0.1:${address.port}/v1/metrics`,
      instrumentNode: false,
    });

    try {
      let identifiers: ReturnType<typeof currentTraceIdentifiers> = {};
      await withTelemetrySpan(
        "etp00.telemetry.proof",
        { "portal.company_id": "synthetic-company-a" },
        async () => {
          identifiers = currentTraceIdentifiers();
        },
      );
      expect(identifiers.traceId).toMatch(/^[0-9a-f]{32}$/u);
      expect(identifiers.spanId).toMatch(/^[0-9a-f]{16}$/u);
      recordHttpServerRequest({
        method: "GET",
        statusCode: 200,
        durationMs: 12,
      });
      recordOutboxAttempt("succeeded");
      recordOutboxLag(321);
      recordWorkerPoll();
      recordDependencyAttempt("synthetic-storage", 1, "transient_failure");
      recordDependencyCircuitTransition("synthetic-storage", "CLOSED", "OPEN");
      await expect(
        withTelemetrySpan("etp00.telemetry.failure", {}, async () => {
          throw new Error("synthetic-sensitive-error-detail");
        }),
      ).rejects.toThrow("synthetic-sensitive-error-detail");
      expect(telemetry.enabled).toBe(true);
      await telemetry.shutdown();
    } finally {
      await new Promise<void>((resolve, reject) => {
        receiver.close((error) => (error ? reject(error) : resolve()));
      });
    }

    expect(payloads.length).toBeGreaterThan(0);
    expect(
      payloads.some(
        (payload) =>
          payload.path === "/v1/traces" &&
          payload.bytes.includes(Buffer.from("etp00.telemetry.proof", "utf8")),
      ),
    ).toBe(true);
    expect(
      payloads.some(
        (payload) =>
          payload.path === "/v1/metrics" &&
          payload.bytes.includes(
            Buffer.from("portal_dp.http.server.requests", "utf8"),
          ) &&
          payload.bytes.includes(
            Buffer.from("portal_dp.outbox.attempts", "utf8"),
          ) &&
          payload.bytes.includes(
            Buffer.from("portal_dp.outbox.lag_ms", "utf8"),
          ) &&
          payload.bytes.includes(
            Buffer.from("portal_dp.worker.polls", "utf8"),
          ) &&
          payload.bytes.includes(
            Buffer.from("portal_dp.dependency.circuit.transitions", "utf8"),
          ) &&
          payload.bytes.includes(
            Buffer.from("portal_dp.dependency.attempts", "utf8"),
          ),
      ),
    ).toBe(true);
    expect(
      payloads.some((payload) =>
        payload.bytes.includes(
          Buffer.from("synthetic-sensitive-error-detail", "utf8"),
        ),
      ),
    ).toBe(false);
  });
});
