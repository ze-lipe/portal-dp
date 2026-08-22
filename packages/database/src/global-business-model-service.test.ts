import { describe, expect, it } from "vitest";

import {
  ETP00_MODEL_KEY,
  ETP00_MODEL_VERSIONS,
} from "./global-business-model-service.js";

describe("modelo empresarial global sintético", () => {
  it("mantém V1 e V2 canônicas, fechadas e default-deny", () => {
    expect(ETP00_MODEL_KEY).toBe("ETP00_MINIMUM_DENY_BY_DEFAULT");
    expect(ETP00_MODEL_VERSIONS.map((entry) => entry.version)).toEqual([1, 2]);
    expect(
      ETP00_MODEL_VERSIONS.every(
        (entry) => entry.catalog.default_effect === "DENY",
      ),
    ).toBe(true);
    expect(ETP00_MODEL_VERSIONS[0].catalog.operations).toEqual([
      "EMPRESA.SINTETICA.LER",
      "EMPRESA.SINTETICA.ALTERAR",
    ]);
    expect(ETP00_MODEL_VERSIONS[1].catalog.operations).toContain(
      "ARQUIVO.SINTETICO.BAIXAR",
    );
  });
});
