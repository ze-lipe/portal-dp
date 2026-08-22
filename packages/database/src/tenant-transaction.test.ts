import { describe, expect, it } from "vitest";

import type { TenantTransactionContext } from "./tenant-transaction.js";

describe("TenantTransactionContext", () => {
  it("mantem empresa, ator e correlacao como requisitos separados", () => {
    const context: TenantTransactionContext = {
      companyId: "00000000-0000-4000-8000-00000000000a",
      actorId: "10000000-0000-4000-8000-000000000001",
      correlationId: "30000000-0000-4000-8000-000000000001",
    };
    expect(Object.keys(context).sort()).toEqual([
      "actorId",
      "companyId",
      "correlationId",
    ]);
  });
});
