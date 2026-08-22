export type SessionStatus =
  | { kind: "loading" }
  | { kind: "ready"; version: string }
  | { kind: "empty" }
  | { kind: "validation"; errors: Readonly<Record<string, string>> }
  | { kind: "error"; message: string }
  | { kind: "revoked" }
  | { kind: "conflict" }
  | { kind: "uncertain" };

export function sessionStatusFromResponse(input: unknown): SessionStatus {
  if (typeof input !== "object" || input === null) {
    return { kind: "error", message: "Resposta invalida do servidor." };
  }
  const value = input as Record<string, unknown>;
  const data = value["data"];
  if (typeof data === "object" && data !== null) {
    const session = data as Record<string, unknown>;
    if (
      session["estado"] === "PUBLICA" &&
      session["autenticada"] === false &&
      typeof session["contexto_versao"] === "string"
    ) {
      return { kind: "ready", version: session["contexto_versao"] };
    }
  }
  return { kind: "empty" };
}
