import { describe, expect, it } from "vitest";

import { loadWorkerConfig } from "./config.js";

describe("loadWorkerConfig", () => {
  it("falha fechado sem habilitacao sintetica explicita", () => {
    expect(() =>
      loadWorkerConfig({ WORKER_DATABASE_URL: "postgresql://db/test" }),
    ).toThrow(/explicit synthetic/i);
  });

  it("rejeita habilitacao sintetica em producao", () => {
    expect(() =>
      loadWorkerConfig({
        NODE_ENV: "production",
        WORKER_DATABASE_URL: "postgresql://db/test",
        ETP00_SYNTHETIC_PROOF_ENABLED: "true",
        WORKER_COMPANY_IDS: "00000000-0000-4000-8000-00000000000a",
      }),
    ).toThrow(/forbidden/i);
  });

  it("configura um limiar finito para alertar atraso da outbox", () => {
    const config = loadWorkerConfig({
      NODE_ENV: "test",
      WORKER_DATABASE_URL: "postgresql://db/test",
      ETP00_SYNTHETIC_PROOF_ENABLED: "true",
      WORKER_COMPANY_IDS: "00000000-0000-4000-8000-00000000000a",
      OUTBOX_DELAY_ALERT_MS: "45000",
    });
    expect(config.outboxDelayAlertMs).toBe(45_000);
  });
});
