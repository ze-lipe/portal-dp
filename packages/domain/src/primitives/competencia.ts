import { DomainInvariantError } from "../errors.js";
import { CivilDate } from "./civil-date.js";

const COMPETENCIA_PATTERN = /^(\d{4})-(\d{2})$/;

export class Competencia {
  readonly year: number;
  readonly month: number;
  readonly canonical: string;

  private constructor(year: number, month: number, canonical: string) {
    this.year = year;
    this.month = month;
    this.canonical = canonical;
    Object.freeze(this);
  }

  static parse(value: string): Competencia {
    const match = COMPETENCIA_PATTERN.exec(value);
    if (match === null) {
      throw new DomainInvariantError(
        "COMPETENCIA_INVALIDA",
        "A competência deve usar o formato YYYY-MM.",
      );
    }

    const year = Number(match[1]);
    const month = Number(match[2]);
    if (year < 1 || month < 1 || month > 12) {
      throw new DomainInvariantError(
        "COMPETENCIA_INEXISTENTE",
        "A competência informada não existe.",
      );
    }

    return new Competencia(year, month, value);
  }

  firstDay(): CivilDate {
    return CivilDate.parse(`${this.canonical}-01`);
  }

  compare(other: Competencia): number {
    return this.canonical.localeCompare(other.canonical);
  }

  equals(other: Competencia): boolean {
    return this.canonical === other.canonical;
  }

  toString(): string {
    return this.canonical;
  }
}
