import { describe, expect, it } from "vitest";

import {
  DeterministicUuidSequence,
  ETP00_IDS,
  createEtp00Fixture,
  createSyntheticCommandForCompanyA,
} from "../src/index.js";

describe("fixture determinística da ETP-00", () => {
  it("contém A/B/C e exatamente dois masters apenas previstos", () => {
    const fixture = createEtp00Fixture();

    expect(fixture.companies.map((company) => company.codigo)).toEqual([
      "A",
      "B",
      "C",
    ]);
    expect(fixture.companies.map((company) => company.id)).toEqual([
      "00000000-0000-4000-8000-00000000000a",
      "00000000-0000-4000-8000-00000000000b",
      "00000000-0000-4000-8000-00000000000c",
    ]);
    expect(fixture.mastersPrevistos).toHaveLength(2);
    expect(fixture.mastersPrevistos.map((master) => master.id)).toEqual([
      "10000000-0000-4000-8000-000000000001",
      "10000000-0000-4000-8000-000000000002",
    ]);
    expect(fixture.technicalActorId).toBe(fixture.mastersPrevistos[0].id);
    expect(ETP00_IDS.fixtureRecordA).toBe(
      "20000000-0000-4000-8000-00000000000a",
    );
    expect(ETP00_IDS.recordA).toBe("21000000-0000-4000-8000-00000000000a");
    expect(ETP00_IDS.correlationA).toBe("40000000-0000-4000-8000-000000000001");
    expect(
      fixture.mastersPrevistos.every(
        (master) => master.estado === "PREVISTO_SEM_LOGIN",
      ),
    ).toBe(true);
    for (const master of fixture.mastersPrevistos) {
      expect(master).not.toHaveProperty("senha");
      expect(master).not.toHaveProperty("totp");
      expect(master).not.toHaveProperty("sessao");
    }
  });

  it("é reproduzível e mantém o modelo mínimo em default-deny", () => {
    const first = createEtp00Fixture();
    const second = createEtp00Fixture();

    expect(first.fixtureVersion).toBe(second.fixtureVersion);
    expect(first.companies).toEqual(second.companies);
    expect(first.model.current.version.value).toBe(1);
    expect(first.model.current.allows("EMPRESA.SINTETICA.LER")).toBe(true);
    expect(first.model.current.allows("EMPRESA.SINTETICA.ALTERAR")).toBe(true);
    expect(first.model.current.allows("ARQUIVO.SINTETICO.BAIXAR")).toBe(false);
  });

  it("gera comando sintético exclusivamente para A", () => {
    const command = createSyntheticCommandForCompanyA();
    const fixture = createEtp00Fixture();

    expect(command.intencao.empresa_id).toBe(fixture.companies[0].id);
    expect(command.intencao.empresa_id).not.toBe(fixture.companies[1].id);
  });
});

describe("gerador de IDs determinístico", () => {
  it("é reiniciável e falha quando esgotado", () => {
    const sequence = new DeterministicUuidSequence<"Teste">([
      "90000000-0000-4000-8000-000000000001",
    ]);

    const first = sequence.next();
    expect(() => sequence.next()).toThrowError(/esgotada/i);
    sequence.reset();
    expect(sequence.next()).toBe(first);
  });
});
