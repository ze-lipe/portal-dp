import { describe, expect, it } from "vitest";

import {
  sanitizeLogRecord,
  sanitizeOperationalEvent,
} from "./sanitized-log.js";

describe("sanitizeLogRecord", () => {
  it("remove segredo e dado pessoal sem apagar a correlacao", () => {
    expect(
      sanitizeLogRecord({
        correlationId: "corr-1",
        cpf: "00000000000",
        nested: { Authorization: "Bearer secret", status: "ok" },
      }),
    ).toEqual({
      correlationId: "corr-1",
      cpf: "[REDACTED]",
      nested: { Authorization: "[REDACTED]", status: "ok" },
    });
  });

  it("usa lista permitida para eventos operacionais", () => {
    expect(
      sanitizeOperationalEvent({
        event: "outbox_completed",
        companyId: "empresa-opaca",
        message: "CPF 00000000000 salario 3000",
        payload: { email: "pessoa@example.invalid" },
      }),
    ).toEqual({ event: "outbox_completed", companyId: "empresa-opaca" });
  });
});
