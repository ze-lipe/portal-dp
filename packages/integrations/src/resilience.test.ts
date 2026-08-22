import { describe, expect, it } from "vitest";

import {
  CircuitBreaker,
  CircuitOpenError,
  executeWithRetry,
  nextRetryDelayMs,
} from "./resilience.js";

describe("resiliência de integrações", () => {
  it("limita tentativas e aplica backoff exponencial com jitter limitado", () => {
    const policy = { maxAttempts: 4, baseDelayMs: 100, maxDelayMs: 1_000 };
    expect(nextRetryDelayMs(1, policy, () => 0)).toBe(100);
    expect(nextRetryDelayMs(2, policy, () => 1)).toBe(250);
    expect(nextRetryDelayMs(3, policy, () => 0.5)).toBe(450);
    expect(nextRetryDelayMs(4, policy, () => 0)).toBeNull();
  });

  it("abre, bloqueia tempestade, testa em half-open e fecha após sucesso", async () => {
    let now = 1_000;
    const transitions: string[] = [];
    const breaker = new CircuitBreaker({
      failureThreshold: 2,
      openDurationMs: 500,
      now: () => now,
      onTransition: (from, to) => transitions.push(`${from}->${to}`),
    });
    const transient = () => "TRANSIENT" as const;
    const failure = new Error("synthetic-timeout");

    await expect(
      breaker.execute(async () => Promise.reject(failure), transient),
    ).rejects.toBe(failure);
    await expect(
      breaker.execute(async () => Promise.reject(failure), transient),
    ).rejects.toBe(failure);
    expect(breaker.state).toBe("OPEN");
    await expect(
      breaker.execute(async () => "not-called", transient),
    ).rejects.toBeInstanceOf(CircuitOpenError);

    now += 500;
    expect(breaker.state).toBe("HALF_OPEN");
    await expect(
      breaker.execute(async () => "recovered", transient),
    ).resolves.toBe("recovered");
    expect(breaker.state).toBe("CLOSED");
    expect(transitions).toEqual([
      "CLOSED->OPEN",
      "OPEN->HALF_OPEN",
      "HALF_OPEN->CLOSED",
    ]);
  });

  it("executa retry somente para falha transitória e respeita o limite", async () => {
    let attempts = 0;
    const delays: number[] = [];
    const events: string[] = [];
    await expect(
      executeWithRetry({
        operation: async () => {
          attempts += 1;
          if (attempts < 3) throw new Error("synthetic-transient");
          return "ok";
        },
        classify: () => "TRANSIENT",
        policy: { maxAttempts: 3, baseDelayMs: 100, maxDelayMs: 1_000 },
        random: () => 0,
        wait: async (milliseconds) => {
          delays.push(milliseconds);
        },
        onAttempt: ({ attempt, outcome }) =>
          events.push(`${attempt}:${outcome}`),
      }),
    ).resolves.toBe("ok");
    expect(attempts).toBe(3);
    expect(delays).toEqual([100, 200]);
    expect(events).toEqual([
      "1:transient_failure",
      "2:transient_failure",
      "3:succeeded",
    ]);
  });

  it("distingue falha permanente e exaustão na observabilidade do retry", async () => {
    const events: string[] = [];
    const permanent = new Error("synthetic-permanent");
    await expect(
      executeWithRetry({
        operation: async () => Promise.reject(permanent),
        classify: () => "PERMANENT",
        policy: { maxAttempts: 2, baseDelayMs: 10, maxDelayMs: 20 },
        onAttempt: ({ attempt, outcome }) =>
          events.push(`${attempt}:${outcome}`),
      }),
    ).rejects.toBe(permanent);

    const exhausted = new Error("synthetic-exhausted");
    await expect(
      executeWithRetry({
        operation: async () => Promise.reject(exhausted),
        classify: () => "TRANSIENT",
        policy: { maxAttempts: 2, baseDelayMs: 10, maxDelayMs: 20 },
        random: () => 0,
        wait: async () => undefined,
        onAttempt: ({ attempt, outcome }) =>
          events.push(`${attempt}:${outcome}`),
      }),
    ).rejects.toBe(exhausted);
    expect(events).toEqual([
      "1:permanent_failure",
      "1:transient_failure",
      "2:exhausted",
    ]);
  });

  it("não repete falha permanente nem usa isso para abrir o circuito", async () => {
    const breaker = new CircuitBreaker({
      failureThreshold: 1,
      openDurationMs: 500,
    });
    const failure = new Error("synthetic-invalid-request");
    await expect(
      breaker.execute(
        async () => Promise.reject(failure),
        () => "PERMANENT",
      ),
    ).rejects.toBe(failure);
    expect(breaker.state).toBe("CLOSED");
  });

  it("fecha o half-open após falha permanente e bloqueia probes concorrentes", async () => {
    let now = 1_000;
    const breaker = new CircuitBreaker({
      failureThreshold: 1,
      openDurationMs: 100,
      now: () => now,
    });
    await expect(
      breaker.execute(
        async () => Promise.reject(new Error("synthetic-timeout")),
        () => "TRANSIENT",
      ),
    ).rejects.toThrow("synthetic-timeout");
    now += 100;

    let releaseProbe: (() => void) | undefined;
    const probe = breaker.execute(
      () =>
        new Promise<string>((resolve) => {
          releaseProbe = () => resolve("recovered");
        }),
      () => "TRANSIENT",
    );
    await expect(
      breaker.execute(
        async () => "concurrent",
        () => "TRANSIENT",
      ),
    ).rejects.toBeInstanceOf(CircuitOpenError);
    releaseProbe?.();
    await expect(probe).resolves.toBe("recovered");

    await expect(
      breaker.execute(
        async () => Promise.reject(new Error("synthetic-timeout-again")),
        () => "TRANSIENT",
      ),
    ).rejects.toThrow("synthetic-timeout-again");
    now += 100;
    await expect(
      breaker.execute(
        async () => Promise.reject(new Error("invalid-request")),
        () => "PERMANENT",
      ),
    ).rejects.toThrow("invalid-request");
    expect(breaker.state).toBe("CLOSED");
  });

  it.each([
    [
      { maxAttempts: 0, baseDelayMs: 100, maxDelayMs: 1_000 },
      (): number => 0.5,
    ],
    [{ maxAttempts: 3, baseDelayMs: 0, maxDelayMs: 1_000 }, (): number => 0.5],
    [{ maxAttempts: 3, baseDelayMs: 100, maxDelayMs: 99 }, (): number => 0.5],
    [
      { maxAttempts: 3, baseDelayMs: 100, maxDelayMs: 1_000 },
      (): number => Number.NaN,
    ],
  ] as const)("rejeita política ou jitter inválido %#", (policy, random) => {
    expect(() => nextRetryDelayMs(1, policy, random)).toThrow(/invalid/i);
  });
});
