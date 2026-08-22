import { parseUuid, type Uuid } from "@portal-dp/domain";

export class DeterministicUuidSequence<Brand extends string> {
  private cursor = 0;
  private readonly values: readonly Uuid<Brand>[];

  constructor(values: readonly string[]) {
    if (values.length === 0) {
      throw new Error("A sequência determinística exige ao menos um UUID.");
    }

    this.values = Object.freeze(values.map((value) => parseUuid<Brand>(value)));
  }

  next(): Uuid<Brand> {
    const value = this.values[this.cursor];
    if (value === undefined) {
      throw new Error("A sequência determinística de UUIDs foi esgotada.");
    }

    this.cursor += 1;
    return value;
  }

  reset(): void {
    this.cursor = 0;
  }
}
