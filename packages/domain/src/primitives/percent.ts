import { DomainInvariantError } from "../errors.js";

export class BasisPoints {
  readonly value: bigint;

  private constructor(value: bigint) {
    this.value = value;
    Object.freeze(this);
  }

  static of(value: bigint | number): BasisPoints {
    if (typeof value === "number" && !Number.isSafeInteger(value)) {
      throw new DomainInvariantError(
        "BASIS_POINTS_INVALIDO",
        "Basis points devem ser um inteiro entre 0 e 10.000.",
      );
    }

    const normalized = typeof value === "number" ? BigInt(value) : value;
    if (normalized < 0n || normalized > 10_000n) {
      throw new DomainInvariantError(
        "BASIS_POINTS_INVALIDO",
        "Basis points devem ser um inteiro entre 0 e 10.000.",
      );
    }

    return new BasisPoints(normalized);
  }

  toPercentDecimal(): string {
    const whole = this.value / 100n;
    const fraction = (this.value % 100n).toString().padStart(2, "0");
    return `${whole}.${fraction}`;
  }

  equals(other: BasisPoints): boolean {
    return this.value === other.value;
  }
}

export class Percent {
  static readonly scale = 10_000n;
  static readonly maximumScaledValue = 100n * Percent.scale;
  readonly scaledValue: bigint;

  private constructor(scaledValue: bigint) {
    this.scaledValue = scaledValue;
    Object.freeze(this);
  }

  static parse(value: string): Percent {
    const match = /^(0|[1-9]\d{0,2})(?:\.(\d{1,4}))?$/.exec(value);
    if (match === null) {
      throw new DomainInvariantError(
        "PERCENTUAL_INVALIDO",
        "O percentual deve ser decimal, entre 0 e 100, com até quatro casas.",
      );
    }

    const whole = BigInt(match[1] ?? "0");
    const fraction = BigInt((match[2] ?? "").padEnd(4, "0") || "0");
    const scaledValue = whole * Percent.scale + fraction;
    if (scaledValue > Percent.maximumScaledValue) {
      throw new DomainInvariantError(
        "PERCENTUAL_INVALIDO",
        "O percentual deve permanecer entre 0 e 100.",
      );
    }
    return new Percent(scaledValue);
  }

  static fromBasisPoints(value: BasisPoints): Percent {
    return new Percent(value.value * 100n);
  }

  toString(): string {
    const whole = this.scaledValue / Percent.scale;
    const fraction = (this.scaledValue % Percent.scale)
      .toString()
      .padStart(4, "0");
    return `${whole}.${fraction}`;
  }
}
