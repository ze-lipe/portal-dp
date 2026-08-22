import { describe, expect, it } from "vitest";

import {
  ClosedMinimumCatalog,
  MinimumGlobalBusinessModelService,
  UtcInstant,
  Version,
  globalBusinessModelId,
  modelAuthorId,
  type Clock,
} from "../src/index.js";

class FixedClock implements Clock {
  constructor(private readonly instant: UtcInstant) {}

  now(): UtcInstant {
    return this.instant;
  }
}

describe("BK-077 — núcleo global mínimo", () => {
  const catalog = new ClosedMinimumCatalog("v1", [
    "EMPRESA.SINTETICA.LER",
    "EMPRESA.SINTETICA.ALTERAR",
    "ARQUIVO.SINTETICO.BAIXAR",
  ]);
  const service = new MinimumGlobalBusinessModelService(
    catalog,
    new FixedClock(UtcInstant.parse("2026-08-22T12:00:00.000Z")),
  );
  const author = modelAuthorId("10000000-0000-4000-8000-000000000001");

  it("cria versão válida com default-deny", () => {
    const model = service.createInitial({
      id: globalBusinessModelId("30000000-0000-4000-8000-000000000001"),
      name: "Modelo mínimo ETP-00",
      createdBy: author,
      grantedCodes: ["EMPRESA.SINTETICA.LER"],
    });

    expect(model.current.version.value).toBe(1);
    expect(model.current.allows("EMPRESA.SINTETICA.LER")).toBe(true);
    expect(model.current.allows("EMPRESA.SINTETICA.ALTERAR")).toBe(false);
    expect(model.current.allows("RECURSO.NOVO")).toBe(false);
  });

  it("versiona sem alterar a versão anterior", () => {
    const v1 = service.createInitial({
      id: globalBusinessModelId("30000000-0000-4000-8000-000000000001"),
      name: "Modelo mínimo ETP-00",
      createdBy: author,
      grantedCodes: ["EMPRESA.SINTETICA.LER"],
    });
    const v2 = service.version({
      model: v1,
      expectedVersion: Version.initial(),
      name: "Modelo mínimo ETP-00 v2",
      changedBy: author,
      grantedCodes: ["EMPRESA.SINTETICA.LER", "EMPRESA.SINTETICA.ALTERAR"],
    });

    expect(v1.current.version.value).toBe(1);
    expect(v1.current.allows("EMPRESA.SINTETICA.ALTERAR")).toBe(false);
    expect(v2.current.version.value).toBe(2);
    expect(v2.versions()).toHaveLength(2);
    expect(Object.isFrozen(v2.versions())).toBe(true);
  });

  it("recusa concessão fora do catálogo e versão obsoleta", () => {
    expect(() =>
      service.createInitial({
        id: globalBusinessModelId("30000000-0000-4000-8000-000000000001"),
        name: "Modelo mínimo ETP-00",
        createdBy: author,
        grantedCodes: ["RECURSO.NAO_CATALOGADO"],
      }),
    ).toThrowError(/catálogo/i);

    const model = service.createInitial({
      id: globalBusinessModelId("30000000-0000-4000-8000-000000000001"),
      name: "Modelo mínimo ETP-00",
      createdBy: author,
    });
    expect(() =>
      service.version({
        model,
        expectedVersion: Version.of(2),
        name: "Modelo corrigido",
        changedBy: author,
        grantedCodes: [],
      }),
    ).toThrowError(/versão esperada/i);
  });
});
