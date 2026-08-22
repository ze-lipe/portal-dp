import { randomUUID } from "node:crypto";

const safeCorrelationId =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu;

export function normalizedCorrelationId(value: unknown): string {
  // Guards podem rejeitar a chamada antes do interceptor. A mesma regra precisa
  // proteger também o filtro de erros para nunca refletir um cabeçalho arbitrário.
  return typeof value === "string" && safeCorrelationId.test(value)
    ? value
    : randomUUID();
}
