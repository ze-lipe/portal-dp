import { DomainInvariantError } from "../errors.js";
import { Money } from "./money.js";

const SCALE = 1_000_000n;
const MONEY_TO_SCALE = 10_000n;
const PATTERN = /^-?(0|[1-9]\d*)\.(\d{6})$/;

function divideHalfAwayFromZero(
  numerator: bigint,
  denominator: bigint,
): bigint {
  if (denominator <= 0n) {
    throw new DomainInvariantError(
      "DIVISOR_INVALIDO",
      "O divisor decimal deve ser positivo.",
    );
  }
  const sign = numerator < 0n ? -1n : 1n;
  const absolute = numerator < 0n ? -numerator : numerator;
  const quotient = absolute / denominator;
  const remainder = absolute % denominator;
  return (quotient + (remainder * 2n >= denominator ? 1n : 0n)) * sign;
}

export class CalculationDecimal6 {
  static readonly scale = SCALE;
  readonly scaledValue: bigint;

  private constructor(scaledValue: bigint) {
    this.scaledValue = scaledValue;
    Object.freeze(this);
  }

  static parse(value: string): CalculationDecimal6 {
    const match = PATTERN.exec(value);
    if (!match) {
      throw new DomainInvariantError(
        "DECIMAL_CALCULO_INVALIDO",
        "O decimal de cálculo exige exatamente seis casas.",
      );
    }
    const negative = value.startsWith("-");
    const absolute = BigInt(match[1] ?? "0") * SCALE + BigInt(match[2] ?? "0");
    return new CalculationDecimal6(negative ? -absolute : absolute);
  }

  static fromMoney(value: Money): CalculationDecimal6 {
    return new CalculationDecimal6(value.cents * MONEY_TO_SCALE);
  }

  static fromRatio(
    numerator: bigint,
    denominator: bigint,
  ): CalculationDecimal6 {
    return new CalculationDecimal6(
      divideHalfAwayFromZero(numerator * SCALE, denominator),
    );
  }

  multiply(other: CalculationDecimal6): CalculationDecimal6 {
    return new CalculationDecimal6(
      divideHalfAwayFromZero(this.scaledValue * other.scaledValue, SCALE),
    );
  }

  toMoney(): Money {
    return Money.fromCents(
      divideHalfAwayFromZero(this.scaledValue, MONEY_TO_SCALE),
    );
  }

  toString(): string {
    const negative = this.scaledValue < 0n;
    const absolute = negative ? -this.scaledValue : this.scaledValue;
    const whole = absolute / SCALE;
    const fraction = (absolute % SCALE).toString().padStart(6, "0");
    return `${negative ? "-" : ""}${whole}.${fraction}`;
  }
}
