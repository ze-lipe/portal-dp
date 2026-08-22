import { DomainInvariantError } from "../errors.js";

export class Version {
  readonly value: number;

  private constructor(value: number) {
    this.value = value;
    Object.freeze(this);
  }

  static of(value: number): Version {
    if (!Number.isSafeInteger(value) || value < 1) {
      throw new DomainInvariantError(
        "VERSAO_INVALIDA",
        "A versão deve ser um inteiro positivo seguro.",
      );
    }

    return new Version(value);
  }

  static initial(): Version {
    return new Version(1);
  }

  next(): Version {
    if (this.value === Number.MAX_SAFE_INTEGER) {
      throw new DomainInvariantError(
        "VERSAO_ESGOTADA",
        "A versão atingiu o maior inteiro seguro.",
      );
    }

    return new Version(this.value + 1);
  }

  equals(other: Version): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return String(this.value);
  }
}
