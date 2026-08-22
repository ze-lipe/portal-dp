export type FailureDisposition = "TRANSIENT" | "PERMANENT";
export type CircuitState = "CLOSED" | "OPEN" | "HALF_OPEN";

export class CircuitOpenError extends Error {
  readonly safeCode = "DEPENDENCY_CIRCUIT_OPEN";

  constructor() {
    super("External dependency is temporarily unavailable");
    this.name = "CircuitOpenError";
  }
}

export interface RetryPolicy {
  readonly maxAttempts: number;
  readonly baseDelayMs: number;
  readonly maxDelayMs: number;
}

export interface RetryAttemptEvent {
  readonly attempt: number;
  readonly outcome:
    "succeeded" | "transient_failure" | "permanent_failure" | "exhausted";
}

export async function executeWithRetry<T>(input: {
  operation: () => Promise<T>;
  classify: (error: unknown) => FailureDisposition;
  policy: RetryPolicy;
  random?: () => number;
  wait?: (milliseconds: number) => Promise<void>;
  onAttempt?: (event: RetryAttemptEvent) => void;
}): Promise<T> {
  assertRetryPolicy(input.policy);
  const wait = input.wait ?? delay;
  // Somente falhas classificadas como transitórias recebem nova tentativa.
  // Adaptadores seguros devem tratar falhas desconhecidas como permanentes.
  for (let attempt = 1; attempt <= input.policy.maxAttempts; attempt += 1) {
    try {
      const result = await input.operation();
      input.onAttempt?.({ attempt, outcome: "succeeded" });
      return result;
    } catch (error) {
      if (input.classify(error) === "PERMANENT") {
        input.onAttempt?.({ attempt, outcome: "permanent_failure" });
        throw error;
      }
      const retryDelay = nextRetryDelayMs(
        attempt,
        input.policy,
        input.random ?? Math.random,
      );
      if (retryDelay === null) {
        input.onAttempt?.({ attempt, outcome: "exhausted" });
        throw error;
      }
      input.onAttempt?.({ attempt, outcome: "transient_failure" });
      await wait(retryDelay);
    }
  }
  throw new Error("Retry loop ended unexpectedly");
}

export function nextRetryDelayMs(
  attempt: number,
  policy: RetryPolicy,
  random: () => number = Math.random,
): number | null {
  assertRetryPolicy(policy);
  if (
    !Number.isInteger(attempt) ||
    attempt < 1 ||
    attempt >= policy.maxAttempts
  ) {
    return null;
  }
  const exponential = Math.min(
    policy.maxDelayMs,
    policy.baseDelayMs * 2 ** Math.min(attempt - 1, 30),
  );
  const sampled = random();
  if (!Number.isFinite(sampled)) throw new Error("Invalid retry jitter source");
  const boundedRandom = Math.min(1, Math.max(0, sampled));
  const jitter = Math.floor(exponential * 0.25 * boundedRandom);
  return Math.min(policy.maxDelayMs, exponential + jitter);
}

export class CircuitBreaker {
  #state: CircuitState = "CLOSED";
  #consecutiveTransientFailures = 0;
  #openedAt = 0;
  #probeInFlight = false;

  constructor(
    private readonly options: {
      failureThreshold: number;
      openDurationMs: number;
      now?: () => number;
      onTransition?: (from: CircuitState, to: CircuitState) => void;
    },
  ) {
    if (
      !Number.isInteger(options.failureThreshold) ||
      options.failureThreshold < 1 ||
      !Number.isInteger(options.openDurationMs) ||
      options.openDurationMs < 1
    ) {
      throw new Error("Invalid circuit breaker configuration");
    }
  }

  get state(): CircuitState {
    // Depois do período aberto, uma única chamada de prova decide se a
    // dependência voltou; concorrentes continuam bloqueadas durante a prova.
    if (
      this.#state === "OPEN" &&
      this.#now() - this.#openedAt >= this.options.openDurationMs
    ) {
      this.#setState("HALF_OPEN");
    }
    return this.#state;
  }

  async execute<T>(
    operation: () => Promise<T>,
    classify: (error: unknown) => FailureDisposition,
  ): Promise<T> {
    const state = this.state;
    if (state === "OPEN" || (state === "HALF_OPEN" && this.#probeInFlight)) {
      throw new CircuitOpenError();
    }
    if (state === "HALF_OPEN") this.#probeInFlight = true;

    try {
      const result = await operation();
      this.#setState("CLOSED");
      this.#consecutiveTransientFailures = 0;
      return result;
    } catch (error) {
      if (classify(error) === "TRANSIENT") {
        this.#consecutiveTransientFailures += 1;
        if (
          state === "HALF_OPEN" ||
          this.#consecutiveTransientFailures >= this.options.failureThreshold
        ) {
          this.#setState("OPEN");
          this.#openedAt = this.#now();
        }
      } else {
        this.#consecutiveTransientFailures = 0;
        if (state === "HALF_OPEN") this.#setState("CLOSED");
      }
      throw error;
    } finally {
      if (state === "HALF_OPEN") this.#probeInFlight = false;
    }
  }

  #now(): number {
    return (this.options.now ?? Date.now)();
  }

  #setState(next: CircuitState): void {
    if (this.#state === next) return;
    const previous = this.#state;
    this.#state = next;
    this.options.onTransition?.(previous, next);
  }
}

function assertRetryPolicy(policy: RetryPolicy): void {
  if (
    !Number.isSafeInteger(policy.maxAttempts) ||
    policy.maxAttempts < 1 ||
    !Number.isSafeInteger(policy.baseDelayMs) ||
    policy.baseDelayMs < 1 ||
    !Number.isSafeInteger(policy.maxDelayMs) ||
    policy.maxDelayMs < policy.baseDelayMs
  ) {
    throw new Error("Invalid retry policy");
  }
}

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}
