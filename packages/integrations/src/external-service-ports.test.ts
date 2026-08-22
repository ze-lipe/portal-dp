import { describe, expect, it } from "vitest";

import {
  UnconfiguredCepLookup,
  UnconfiguredTransactionalEmail,
} from "./external-service-ports.js";

describe("portas externas substituíveis", () => {
  it("mantém CEP manual disponível quando não há fornecedor", async () => {
    await expect(
      new UnconfiguredCepLookup().lookup("00000000"),
    ).resolves.toEqual({
      status: "UNAVAILABLE",
      retryable: false,
      safeCode: "CEP_PROVIDER_NOT_CONFIGURED",
    });
  });

  it("não simula envio de e-mail sem fornecedor", async () => {
    await expect(
      new UnconfiguredTransactionalEmail().deliver({
        messageId: "synthetic-message",
        templateCode: "SYNTHETIC_TEMPLATE",
        recipientReference: "synthetic-recipient",
        variables: {},
      }),
    ).resolves.toMatchObject({
      status: "UNAVAILABLE",
      retryable: false,
    });
  });
});
