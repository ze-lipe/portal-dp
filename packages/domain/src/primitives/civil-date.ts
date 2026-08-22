import { DomainInvariantError } from "../errors.js";

const CIVIL_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

function isLeapYear(year: number): boolean {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

function daysInMonth(year: number, month: number): number {
  const days = [
    31,
    isLeapYear(year) ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ];
  return days[month - 1] ?? 0;
}

export class CivilDate {
  readonly year: number;
  readonly month: number;
  readonly day: number;
  readonly canonical: string;

  private constructor(
    year: number,
    month: number,
    day: number,
    canonical: string,
  ) {
    this.year = year;
    this.month = month;
    this.day = day;
    this.canonical = canonical;
    Object.freeze(this);
  }

  static parse(value: string): CivilDate {
    const match = CIVIL_DATE_PATTERN.exec(value);
    if (match === null) {
      throw new DomainInvariantError(
        "DATA_CIVIL_INVALIDA",
        "A data civil deve usar o formato YYYY-MM-DD.",
      );
    }

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    if (
      year < 1 ||
      month < 1 ||
      month > 12 ||
      day < 1 ||
      day > daysInMonth(year, month)
    ) {
      throw new DomainInvariantError(
        "DATA_CIVIL_INEXISTENTE",
        "A data civil informada não existe no calendário.",
      );
    }

    return new CivilDate(year, month, day, value);
  }

  compare(other: CivilDate): number {
    return this.canonical.localeCompare(other.canonical);
  }

  equals(other: CivilDate): boolean {
    return this.canonical === other.canonical;
  }

  toString(): string {
    return this.canonical;
  }
}
