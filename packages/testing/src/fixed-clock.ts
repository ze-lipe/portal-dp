import { UtcInstant, type Clock } from "@portal-dp/domain";

export class FixedClock implements Clock {
  private instant: UtcInstant;

  constructor(instant: UtcInstant | string) {
    this.instant =
      typeof instant === "string" ? UtcInstant.parse(instant) : instant;
  }

  now(): UtcInstant {
    return this.instant;
  }

  set(instant: UtcInstant | string): void {
    this.instant =
      typeof instant === "string" ? UtcInstant.parse(instant) : instant;
  }
}
