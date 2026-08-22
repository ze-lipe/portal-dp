import { DomainInvariantError } from "../errors.js";
import { Percent, type BasisPoints } from "./percent.js";

const MONEY_PATTERN = /^-?(0|[1-9]\d*)\.(\d{2})$/;

function roundedDivideHalfAwayFromZero(
  numerator: bigint,
  denominator: bigint,
): bigint {
  if (denominator <= 0n) {
    throw new DomainInvariantError(
      "DIVISOR_INVALIDO",
      "O divisor deve ser positivo.",
    );
  }

  const sign = numerator < 0n ? -1n : 1n;
  const absolute = numerator < 0n ? -numerator : numerator;
  let quotient = absolute / denominator;
  const remainder = absolute % denominator;
  if (remainder * 2n >= denominator) {
    quotient += 1n;
  }

  return quotient * sign;
}

export class Money {
  readonly cents: bigint;

  private constructor(cents: bigint) {
    this.cents = cents;
    Object.freeze(this);
  }

  static zero(): Money {
    return new Money(0n);
  }

  static fromCents(cents: bigint): Money {
    return new Money(cents);
  }

  static parse(value: string): Money {
    const match = MONEY_PATTERN.exec(value);
    if (match === null) {
      throw new DomainInvariantError(
        "MOEDA_INVALIDA",
        "Dinheiro deve ser uma string decimal com exatamente duas casas.",
      );
    }

    const negative = value.startsWith("-");
    const whole = BigInt(match[1] ?? "0");
    const fraction = BigInt(match[2] ?? "0");
    const cents = whole * 100n + fraction;
    return new Money(negative ? -cents : cents);
  }

  add(other: Money): Money {
    return new Money(this.cents + other.cents);
  }

  subtract(other: Money): Money {
    return new Money(this.cents - other.cents);
  }

  negate(): Money {
    return new Money(-this.cents);
  }

  multiplyBasisPoints(value: BasisPoints): Money {
    return new Money(
      roundedDivideHalfAwayFromZero(this.cents * value.value, 10_000n),
    );
  }

  multiplyPercent(value: Percent): Money {
    return new Money(
      roundedDivideHalfAwayFromZero(
        this.cents * value.scaledValue,
        100n * Percent.scale,
      ),
    );
  }

  equals(other: Money): boolean {
    return this.cents === other.cents;
  }

  toDecimal(): string {
    const negative = this.cents < 0n;
    const absolute = negative ? -this.cents : this.cents;
    const whole = absolute / 100n;
    const fraction = (absolute % 100n).toString().padStart(2, "0");
    return `${negative ? "-" : ""}${whole}.${fraction}`;
  }

  toString(): string {
    return this.toDecimal();
  }
}
