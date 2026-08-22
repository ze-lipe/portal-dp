import {
  ContractValidationError,
  type JsonValue,
  type Opaque,
} from "./opaque.js";

export type PageCursor = Opaque<string, "PageCursor">;

export interface CursorPageRequest {
  readonly cursor?: PageCursor;
  readonly limite: number;
}

export interface CursorPage<T extends JsonValue> {
  readonly data: readonly T[];
  readonly meta: {
    readonly proximo_cursor: PageCursor | null;
    readonly limite: number;
  };
}

const allowedQueryKeys = new Set(["cursor", "limite"]);

export function pageCursor(value: string): PageCursor {
  if (
    value.length < 16 ||
    value.length > 500 ||
    !/^[A-Za-z0-9_-]+$/u.test(value)
  ) {
    throw new ContractValidationError(
      "CURSOR_INVALIDO",
      "O cursor de paginação deve ser opaco e canônico.",
    );
  }
  return value as PageCursor;
}

export function parseCursorPageRequest(
  input: Readonly<Record<string, unknown>>,
): CursorPageRequest {
  for (const key of Object.keys(input)) {
    if (!allowedQueryKeys.has(key)) {
      throw new ContractValidationError(
        "PARAMETRO_DESCONHECIDO",
        `O parâmetro ${key} não pertence ao contrato de paginação.`,
      );
    }
  }

  const rawLimit = input["limite"];
  const limit = rawLimit === undefined ? 25 : parseStrictInteger(rawLimit);
  if (limit < 1 || limit > 100) {
    throw new ContractValidationError(
      "LIMITE_PAGINA_INVALIDO",
      "O limite deve ser um inteiro entre 1 e 100.",
    );
  }

  const rawCursor = input["cursor"];
  if (rawCursor !== undefined && typeof rawCursor !== "string") {
    throw new ContractValidationError(
      "CURSOR_INVALIDO",
      "O cursor deve ser informado uma única vez como texto.",
    );
  }

  return Object.freeze({
    ...(rawCursor === undefined ? {} : { cursor: pageCursor(rawCursor) }),
    limite: limit,
  });
}

export function createCursorPage<T extends JsonValue>(input: {
  data: readonly T[];
  limite: number;
  proximoCursor?: PageCursor | null;
}): CursorPage<T> {
  if (
    !Number.isInteger(input.limite) ||
    input.limite < 1 ||
    input.limite > 100
  ) {
    throw new ContractValidationError(
      "LIMITE_PAGINA_INVALIDO",
      "O limite deve ser um inteiro entre 1 e 100.",
    );
  }
  if (input.data.length > input.limite) {
    throw new ContractValidationError(
      "PAGINA_EXCEDE_LIMITE",
      "A página não pode conter mais itens que o limite solicitado.",
    );
  }

  return Object.freeze({
    data: Object.freeze([...input.data]),
    meta: Object.freeze({
      proximo_cursor: input.proximoCursor ?? null,
      limite: input.limite,
    }),
  });
}

function parseStrictInteger(value: unknown): number {
  if (typeof value === "number" && Number.isInteger(value)) return value;
  if (typeof value === "string" && /^(?:0|[1-9]\d*)$/u.test(value)) {
    return Number(value);
  }
  throw new ContractValidationError(
    "LIMITE_PAGINA_INVALIDO",
    "O limite deve ser um inteiro sem coerção ambígua.",
  );
}
