import { DomainInvariantError } from "../errors.js";

declare const domainOpaqueBrand: unique symbol;

export type Opaque<Value, Brand extends string> = Value & {
  readonly [domainOpaqueBrand]: Brand;
};

export type Uuid<Brand extends string = "Uuid"> = Opaque<
  string,
  `Uuid:${Brand}`
>;

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

export function parseUuid<Brand extends string>(value: string): Uuid<Brand> {
  const canonical = value.toLowerCase();
  if (!UUID_PATTERN.test(canonical)) {
    throw new DomainInvariantError(
      "UUID_INVALIDO",
      "O identificador deve ser um UUID canônico com variante válida.",
    );
  }

  return canonical as Uuid<Brand>;
}

export function isUuid(value: unknown): value is Uuid {
  return typeof value === "string" && UUID_PATTERN.test(value);
}
