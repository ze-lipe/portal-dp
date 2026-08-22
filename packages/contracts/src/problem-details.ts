import type { CorrelacaoId, JsonValue } from "./opaque.js";
import { ContractValidationError } from "./opaque.js";

export interface ProblemFieldError {
  readonly code: string;
  readonly pointer?: string;
  readonly detail?: string;
}

export interface ProblemDetails {
  readonly type: string;
  readonly title: string;
  readonly status: number;
  readonly code: string;
  readonly detail?: string;
  readonly instance?: string;
  readonly correlacao_id?: CorrelacaoId;
  readonly errors?: readonly ProblemFieldError[];
  readonly meta?: Readonly<Record<string, JsonValue>>;
}

export function createProblemDetails(input: ProblemDetails): ProblemDetails {
  if (!input.type || !input.title || !input.code) {
    throw new ContractValidationError(
      "PROBLEM_DETAILS_INCOMPLETO",
      "Problem Details exige type, title e code.",
    );
  }

  if (
    !Number.isInteger(input.status) ||
    input.status < 400 ||
    input.status > 599
  ) {
    throw new ContractValidationError(
      "STATUS_HTTP_INVALIDO",
      "Problem Details exige um status HTTP de erro.",
    );
  }

  const errors = input.errors?.map((error) => Object.freeze({ ...error }));
  return Object.freeze({
    ...input,
    ...(errors === undefined ? {} : { errors: Object.freeze(errors) }),
    ...(input.meta === undefined
      ? {}
      : { meta: Object.freeze({ ...input.meta }) }),
  });
}

export function isProblemDetails(value: unknown): value is ProblemDetails {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Partial<ProblemDetails>;
  return (
    typeof candidate.type === "string" &&
    typeof candidate.title === "string" &&
    typeof candidate.code === "string" &&
    typeof candidate.status === "number" &&
    Number.isInteger(candidate.status) &&
    candidate.status >= 400 &&
    candidate.status <= 599
  );
}
