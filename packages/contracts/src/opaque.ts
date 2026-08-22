declare const opaqueBrand: unique symbol;

export type Opaque<Value, Brand extends string> = Value & {
  readonly [opaqueBrand]: Brand;
};

export type Uuid<Brand extends string = "Uuid"> = Opaque<
  string,
  `Uuid:${Brand}`
>;

export type EmpresaId = Uuid<"Empresa">;
export type UsuarioId = Uuid<"Usuario">;
export type AtorId = Uuid<"Ator">;
export type OperacaoId = Uuid<"Operacao">;
export type CorrelacaoId = Uuid<"Correlacao">;
export type RegistroSinteticoId = Uuid<"RegistroSintetico">;
export type EventoAuditoriaId = Uuid<"EventoAuditoria">;
export type MensagemOutboxId = Uuid<"MensagemOutbox">;
export type ArquivoPrivadoId = Uuid<"ArquivoPrivado">;

export type IdempotencyKey = Opaque<string, "IdempotencyKey">;
export type ContextVersion = Opaque<string, "ContextVersion">;
export type CsrfToken = Opaque<string, "CsrfToken">;
export type Sha256Hex = Opaque<string, "Sha256Hex">;
export type UtcInstantText = Opaque<string, "UtcInstantText">;

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue =
  JsonPrimitive | { readonly [key: string]: JsonValue } | readonly JsonValue[];

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const UTC_INSTANT_PATTERN =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/;
const SHA_256_PATTERN = /^[0-9a-f]{64}$/;

export class ContractValidationError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "ContractValidationError";
    this.code = code;
  }
}

export function isUuid(value: unknown): value is Uuid {
  return typeof value === "string" && UUID_PATTERN.test(value);
}

export function uuid<Brand extends string>(value: string): Uuid<Brand> {
  const canonical = value.toLowerCase();
  if (!UUID_PATTERN.test(canonical)) {
    throw new ContractValidationError(
      "UUID_INVALIDO",
      "O identificador deve ser um UUID canônico com variante válida.",
    );
  }

  return canonical as Uuid<Brand>;
}

function opaqueToken<Brand extends string>(
  value: string,
  brandCode: Brand,
  minimumLength: number,
  maximumLength: number,
): Opaque<string, Brand> {
  if (
    value.length < minimumLength ||
    value.length > maximumLength ||
    /\s/.test(value)
  ) {
    throw new ContractValidationError(
      `${brandCode.toUpperCase()}_INVALIDO`,
      "O token opaco possui formato ou tamanho inválido.",
    );
  }

  return value as Opaque<string, Brand>;
}

export function idempotencyKey(value: string): IdempotencyKey {
  return opaqueToken(value, "IdempotencyKey", 8, 200);
}

export function contextVersion(value: string): ContextVersion {
  return opaqueToken(value, "ContextVersion", 8, 200);
}

export function csrfToken(value: string): CsrfToken {
  return opaqueToken(value, "CsrfToken", 16, 500);
}

export function sha256Hex(value: string): Sha256Hex {
  if (!SHA_256_PATTERN.test(value)) {
    throw new ContractValidationError(
      "SHA256_INVALIDO",
      "O hash deve conter 64 caracteres hexadecimais minúsculos.",
    );
  }

  return value as Sha256Hex;
}

export function utcInstantText(value: string): UtcInstantText {
  const parsed = Date.parse(value);
  const normalizedInput = value.replace(
    /(?:\.(\d{1,3}))?Z$/,
    (_match, fraction: string | undefined) =>
      `.${(fraction ?? "").padEnd(3, "0")}Z`,
  );
  if (
    !UTC_INSTANT_PATTERN.test(value) ||
    Number.isNaN(parsed) ||
    new Date(parsed).toISOString() !== normalizedInput
  ) {
    throw new ContractValidationError(
      "INSTANTE_UTC_INVALIDO",
      "O instante deve estar em UTC e no formato RFC 3339.",
    );
  }

  return value as UtcInstantText;
}
