const sensitiveKey =
  /(?:password|senha|secret|token|authorization|cookie|cpf|cnpj|email|phone|telefone|address|endereco)/iu;

export type LogValue =
  null | boolean | number | string | LogValue[] | { [key: string]: LogValue };

const operationalKeys = new Set([
  "event",
  "companyId",
  "taskId",
  "nextStatus",
  "errorCode",
  "correlationId",
  "traceId",
  "spanId",
  "lagMs",
  "thresholdMs",
]);

export function sanitizeOperationalEvent(
  value: Record<string, unknown>,
): Record<string, null | boolean | number | string> {
  // A lista é fechada: campos novos são descartados até revisão explícita para
  // reduzir a inclusão acidental de dados pessoais nos eventos operacionais.
  const output: Record<string, null | boolean | number | string> = {};
  for (const [key, item] of Object.entries(value)) {
    if (!operationalKeys.has(key)) continue;
    if (
      item === null ||
      typeof item === "boolean" ||
      typeof item === "number"
    ) {
      output[key] = item;
    } else if (typeof item === "string") {
      output[key] = item.slice(0, 200);
    }
  }
  return output;
}

export function sanitizeLogRecord(value: unknown, depth = 0): LogValue {
  if (depth > 6) return "[REDACTED_DEPTH]";
  if (value === null || typeof value === "boolean" || typeof value === "number")
    return value;
  if (typeof value === "string")
    return value.length > 500 ? `${value.slice(0, 500)}…` : value;
  if (Array.isArray(value))
    return value.slice(0, 50).map((item) => sanitizeLogRecord(item, depth + 1));
  if (typeof value !== "object") return String(value);

  const output: { [key: string]: LogValue } = {};
  for (const [key, item] of Object.entries(value).slice(0, 100)) {
    output[key] = sensitiveKey.test(key)
      ? "[REDACTED]"
      : sanitizeLogRecord(item, depth + 1);
  }
  return output;
}
