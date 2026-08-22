import { describe, expect, it } from "vitest";

import {
  UtcInstant,
  planSyntheticEnterpriseMutation,
  syntheticActorId,
  syntheticCompanyId,
  syntheticCorrelationId,
  syntheticOperationId,
  syntheticOutboxId,
  syntheticRecordId,
  type Clock,
} from "../src/index.js";

class FixedClock implements Clock {
  now(): UtcInstant {
    return UtcInstant.parse("2026-08-22T12:00:00.000Z");
  }
}

const ids = {
  companyA: syntheticCompanyId("00000000-0000-4000-8000-00000000000a"),
  companyB: syntheticCompanyId("00000000-0000-4000-8000-00000000000b"),
  actor: syntheticActorId("10000000-0000-4000-8000-000000000001"),
  record: syntheticRecordId("20000000-0000-4000-8000-00000000000a"),
  operation: syntheticOperationId("50000000-0000-4000-8000-000000000001"),
  correlation: syntheticCorrelationId("40000000-0000-4000-8000-000000000001"),
  outbox: syntheticOutboxId("60000000-0000-4000-8000-000000000001"),
} as const;

describe("plano puro da operação sintética", () => {
  it("produz negócio, auditoria e outbox com a mesma empresa e correlação", () => {
    const plan = planSyntheticEnterpriseMutation({
      companyId: ids.companyA,
      actorId: ids.actor,
      recordId: ids.record,
      operationId: ids.operation,
      correlationId: ids.correlation,
      outboxId: ids.outbox,
      code: "PROVA.VERTICAL",
      value: "valor-a",
      clock: new FixedClock(),
    });

    expect(plan.record.companyId).toBe(ids.companyA);
    expect(plan.audit.companyId).toBe(ids.companyA);
    expect(plan.outbox.companyId).toBe(ids.companyA);
    expect(plan.audit.correlationId).toBe(plan.outbox.correlationId);
    expect(plan.record.version.value).toBe(1);
  });

  it("nega atualização em empresa divergente", () => {
    const original = planSyntheticEnterpriseMutation({
      companyId: ids.companyA,
      actorId: ids.actor,
      recordId: ids.record,
      operationId: ids.operation,
      correlationId: ids.correlation,
      outboxId: ids.outbox,
      code: "PROVA.VERTICAL",
      value: "valor-a",
      clock: new FixedClock(),
    });

    expect(() =>
      planSyntheticEnterpriseMutation({
        companyId: ids.companyB,
        actorId: ids.actor,
        recordId: ids.record,
        operationId: ids.operation,
        correlationId: ids.correlation,
        outboxId: ids.outbox,
        code: "PROVA.VERTICAL",
        value: "valor-b",
        existing: original.record,
        expectedVersion: original.record.version,
        clock: new FixedClock(),
      }),
    ).toThrowError(/não pertence/i);
  });

  it("nega atualização que tenta trocar o identificador existente", () => {
    const original = planSyntheticEnterpriseMutation({
      companyId: ids.companyA,
      actorId: ids.actor,
      recordId: ids.record,
      operationId: ids.operation,
      correlationId: ids.correlation,
      outboxId: ids.outbox,
      code: "PROVA.VERTICAL",
      value: "valor-a",
      clock: new FixedClock(),
    });

    expect(() =>
      planSyntheticEnterpriseMutation({
        companyId: ids.companyA,
        actorId: ids.actor,
        recordId: syntheticRecordId("21000000-0000-4000-8000-00000000000a"),
        operationId: ids.operation,
        correlationId: ids.correlation,
        outboxId: ids.outbox,
        code: "PROVA.VERTICAL",
        value: "valor-b",
        existing: original.record,
        expectedVersion: original.record.version,
        clock: new FixedClock(),
      }),
    ).toThrowError(/identificador/i);
  });
});
