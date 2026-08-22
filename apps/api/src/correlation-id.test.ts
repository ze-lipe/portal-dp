import { describe, expect, it } from "vitest";

import { normalizedCorrelationId } from "./correlation-id.js";

describe("identificador de correlacao", () => {
  it("preserva UUID valido e substitui entrada arbitraria", () => {
    const valid = "40000000-0000-4000-8000-000000000001";
    expect(normalizedCorrelationId(valid)).toBe(valid);

    const normalized = normalizedCorrelationId("valor\r\ninjetado");
    expect(normalized).not.toContain("injetado");
    expect(normalized).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/u,
    );
  });
});
