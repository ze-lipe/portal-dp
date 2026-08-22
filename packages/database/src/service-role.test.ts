import type { Pool } from "pg";
import { describe, expect, it } from "vitest";

import { assertLimitedServiceRole } from "./service-role.js";

const safeRole = {
  current_user: "portal_dp_app",
  session_user: "portal_dp_app_login",
  rolsuper: false,
  rolcreaterole: false,
  rolcreatedb: false,
  rolreplication: false,
  rolbypassrls: false,
  current_can_login: false,
  session_super: false,
  session_createrole: false,
  session_createdb: false,
  session_replication: false,
  session_bypassrls: false,
  session_can_login: true,
  current_inherit: false,
  session_inherit: false,
  can_set_role: true,
  settable_roles: ["portal_dp_app"],
  direct_roles: ["portal_dp_app"],
};

function poolReturning(row: Record<string, unknown>): Pool {
  return {
    query: async () => ({ rows: [row] }),
  } as unknown as Pool;
}

describe("assertLimitedServiceRole", () => {
  it("aceita somente a associacao tecnica esperada", async () => {
    await expect(
      assertLimitedServiceRole(
        poolReturning(safeRole),
        "portal_dp_app",
        "portal_dp_app_login",
      ),
    ).resolves.toBeUndefined();
  });

  it("rejeita associacao direta ou transitiva adicional", async () => {
    await expect(
      assertLimitedServiceRole(
        poolReturning({
          ...safeRole,
          settable_roles: ["portal_dp_app", "portal_dp_ops"],
          direct_roles: ["portal_dp_app", "portal_dp_ops"],
        }),
        "portal_dp_app",
        "portal_dp_app_login",
      ),
    ).rejects.toThrow(/not constrained/u);
  });

  it("rejeita heranca de privilegios no login", async () => {
    await expect(
      assertLimitedServiceRole(
        poolReturning({ ...safeRole, session_inherit: true }),
        "portal_dp_app",
        "portal_dp_app_login",
      ),
    ).rejects.toThrow(/not constrained/u);
  });

  it("rejeita privilegio de replicacao no papel ou no login", async () => {
    await expect(
      assertLimitedServiceRole(
        poolReturning({ ...safeRole, rolreplication: true }),
        "portal_dp_app",
        "portal_dp_app_login",
      ),
    ).rejects.toThrow(/not constrained/u);
    await expect(
      assertLimitedServiceRole(
        poolReturning({ ...safeRole, session_replication: true }),
        "portal_dp_app",
        "portal_dp_app_login",
      ),
    ).rejects.toThrow(/not constrained/u);
  });
});
