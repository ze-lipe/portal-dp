import { UtcInstant } from "./instant.js";

export interface Clock {
  now(): UtcInstant;
}

export class SystemClock implements Clock {
  now(): UtcInstant {
    return UtcInstant.fromDate(new Date());
  }
}
