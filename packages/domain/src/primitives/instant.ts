import { DomainInvariantError } from "../errors.js";

const UTC_INSTANT_PATTERN =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/;

export class UtcInstant {
  readonly epochMilliseconds: number;
  readonly canonical: string;

  private constructor(epochMilliseconds: number) {
    this.epochMilliseconds = epochMilliseconds;
    this.canonical = new Date(epochMilliseconds).toISOString();
    Object.freeze(this);
  }

  static parse(value: string): UtcInstant {
    if (!UTC_INSTANT_PATTERN.test(value)) {
      throw new DomainInvariantError(
        "INSTANTE_UTC_INVALIDO",
        "O instante deve usar RFC 3339 em UTC, com sufixo Z.",
      );
    }

    const parsed = Date.parse(value);
    const normalizedInput = value.replace(
      /(?:\.(\d{1,3}))?Z$/,
      (_match, fraction: string | undefined) =>
        `.${(fraction ?? "").padEnd(3, "0")}Z`,
    );
    if (
      !Number.isFinite(parsed) ||
      new Date(parsed).toISOString() !== normalizedInput
    ) {
      throw new DomainInvariantError(
        "INSTANTE_UTC_INEXISTENTE",
        "O instante UTC informado não existe.",
      );
    }

    return new UtcInstant(parsed);
  }

  static fromDate(value: Date): UtcInstant {
    const epochMilliseconds = value.getTime();
    if (!Number.isFinite(epochMilliseconds)) {
      throw new DomainInvariantError(
        "INSTANTE_UTC_INEXISTENTE",
        "A data não representa um instante válido.",
      );
    }

    return new UtcInstant(epochMilliseconds);
  }

  compare(other: UtcInstant): number {
    return this.epochMilliseconds - other.epochMilliseconds;
  }

  equals(other: UtcInstant): boolean {
    return this.epochMilliseconds === other.epochMilliseconds;
  }

  toDate(): Date {
    return new Date(this.epochMilliseconds);
  }

  toString(): string {
    return this.canonical;
  }
}
