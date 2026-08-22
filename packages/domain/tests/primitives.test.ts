import { describe, expect, it } from "vitest";

import {
  BasisPoints,
  CalculationDecimal6,
  CivilDate,
  Competencia,
  Money,
  Percent,
  UtcInstant,
  Version,
  parseUuid,
} from "../src/index.js";

describe("tipos canônicos", () => {
  it("mantém UUID opaco e versão estritamente positiva", () => {
    expect(parseUuid<"Teste">("30000000-0000-4000-8000-000000000001")).toBe(
      "30000000-0000-4000-8000-000000000001",
    );
    expect(Version.initial().next().value).toBe(2);
    expect(() => Version.of(0)).toThrowError(/versão/i);
  });

  it("distingue data civil, competência e instante UTC", () => {
    expect(CivilDate.parse("2028-02-29").toString()).toBe("2028-02-29");
    expect(() => CivilDate.parse("2027-02-29")).toThrowError(/não existe/i);
    expect(Competencia.parse("2026-09").firstDay().toString()).toBe(
      "2026-09-01",
    );
    expect(UtcInstant.parse("2026-08-22T12:00:00Z").toString()).toBe(
      "2026-08-22T12:00:00.000Z",
    );
    expect(() => UtcInstant.parse("2026-08-22T09:00:00-03:00")).toThrowError(
      /UTC/,
    );
    expect(() => UtcInstant.parse("2026-02-30T12:00:00Z")).toThrowError(
      /não existe/i,
    );
  });
});

describe("dinheiro e percentual sem ponto flutuante", () => {
  it("persiste centavos em bigint e serializa duas casas", () => {
    const value = Money.parse("3000.00");
    expect(value.cents).toBe(300_000n);
    expect(value.add(Money.parse("0.01")).toDecimal()).toBe("3000.01");
    expect(() => Money.parse("30.1")).toThrowError(/duas casas/i);
  });

  it("preserva seis casas intermediárias e arredonda somente ao converter em moeda", () => {
    expect(CalculationDecimal6.fromRatio(1n, 3n).toString()).toBe("0.333333");
    expect(CalculationDecimal6.parse("150.505000").toMoney().toString()).toBe(
      "150.51",
    );
    expect(
      CalculationDecimal6.fromMoney(Money.parse("10.00"))
        .multiply(CalculationDecimal6.parse("0.333333"))
        .toMoney()
        .toString(),
    ).toBe("3.33");
  });

  it("calcula basis points com arredondamento normal", () => {
    expect(
      Money.parse("10.01")
        .multiplyBasisPoints(BasisPoints.of(5_000))
        .toString(),
    ).toBe("5.01");
    expect(
      Money.parse("10.00").multiplyPercent(Percent.parse("40.0000")).toString(),
    ).toBe("4.00");
    expect(Percent.parse("100.0000").scaledValue).toBe(1_000_000n);
    expect(Percent.parse("12.3456").toString()).toBe("12.3456");
    expect(
      Money.parse("100.00")
        .multiplyPercent(Percent.parse("12.3456"))
        .toString(),
    ).toBe("12.35");
    expect(() => Percent.parse("100.01")).toThrowError(/0 e 100/i);
  });
});
