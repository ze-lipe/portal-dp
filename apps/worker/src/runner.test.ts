import { describe, expect, it } from "vitest";

import { PrivateObjectIntegrityError } from "@portal-dp/storage";
import { CircuitOpenError } from "@portal-dp/integrations";

import { InvalidTaskPayloadError } from "./payload.js";
import { classifyOutboxError, rotatedCompanyIds } from "./runner.js";

describe("resiliência do worker", () => {
  it.each([
    [new InvalidTaskPayloadError(), "INVALID_TASK_DATA"],
    [new PrivateObjectIntegrityError(), "PRIVATE_OBJECT_INTEGRITY_FAILED"],
    [new CircuitOpenError(), "STORAGE_TRANSIENT"],
    [
      Object.assign(new Error("connection reset"), { code: "08006" }),
      "DATABASE_TRANSIENT",
    ],
    [
      Object.assign(new Error("deadlock"), { code: "40P01" }),
      "DATABASE_TRANSIENT",
    ],
    [Object.assign(new Error("busy"), { code: "EBUSY" }), "STORAGE_TRANSIENT"],
    [new Error("unknown internal failure"), "PERMANENT_PROCESSING_FAILURE"],
  ] as const)(
    "classifica %s sem repetir falha desconhecida",
    (error, expected) => {
      expect(classifyOutboxError(error)).toBe(expected);
    },
  );

  it("alterna a primeira empresa e evita monopolização por backlog contínuo", () => {
    const companies = ["a", "b", "c"];
    expect(
      rotatedCompanyIds(companies, 0).map(({ companyId }) => companyId),
    ).toEqual(["a", "b", "c"]);
    expect(
      rotatedCompanyIds(companies, 1).map(({ companyId }) => companyId),
    ).toEqual(["b", "c", "a"]);
    expect(
      rotatedCompanyIds(companies, 2).map(({ companyId }) => companyId),
    ).toEqual(["c", "a", "b"]);
  });
});
