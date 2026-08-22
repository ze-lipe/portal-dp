export type NavigationDestination = "INTERNAL" | "CONTEXT_CHANGE";

export type ResourceState<T> =
  | { readonly kind: "initial" }
  | { readonly kind: "loading" }
  | { readonly kind: "ready"; readonly data: T }
  | { readonly kind: "draft"; readonly data: T }
  | {
      readonly kind: "discard_confirmation";
      readonly data: T;
      readonly destination: NavigationDestination;
    }
  | { readonly kind: "empty" }
  | { readonly kind: "filtered_empty" }
  | {
      readonly kind: "validation";
      readonly data: T;
      readonly errors: Readonly<Record<string, string>>;
    }
  | { readonly kind: "processing"; readonly operationKey: string }
  | { readonly kind: "reconciling"; readonly operationKey: string }
  | { readonly kind: "success"; readonly data: T }
  | { readonly kind: "read_error"; readonly message: string }
  | { readonly kind: "mutation_error"; readonly message: string }
  | { readonly kind: "conflict" }
  | { readonly kind: "permission_denied" }
  | { readonly kind: "session_expired" }
  | { readonly kind: "context_invalid" };

export type ResourceEvent<T> =
  | { readonly type: "OPEN" | "REFRESH" | "APPLY_FILTER" }
  | { readonly type: "LOAD_READY"; readonly data: T }
  | { readonly type: "LOAD_EMPTY" }
  | { readonly type: "LOAD_FILTERED_EMPTY" }
  | { readonly type: "EDIT"; readonly data: T }
  | {
      readonly type: "INVALID";
      readonly data: T;
      readonly errors: Readonly<Record<string, string>>;
    }
  | { readonly type: "SUBMIT"; readonly operationKey: string }
  | { readonly type: "COMMIT"; readonly data: T }
  | { readonly type: "READ_FAIL"; readonly message: string }
  | { readonly type: "MUTATION_ABSENCE_CONFIRMED"; readonly message: string }
  | { readonly type: "CONFLICT" }
  | { readonly type: "REVOKE" }
  | { readonly type: "SAFE_REDIRECT_INTERNAL" }
  | { readonly type: "SAFE_REDIRECT_SELECTOR" }
  | { readonly type: "SESSION_EXPIRE" }
  | { readonly type: "COMPANY_CHANGED" }
  | { readonly type: "FOREIGN_RESOURCE" }
  | { readonly type: "CONNECTION_LOST" }
  | {
      readonly type: "REQUEST_NAVIGATION";
      readonly destination: NavigationDestination;
    }
  | { readonly type: "STAY" }
  | { readonly type: "DISCARD_INTERNAL" }
  | { readonly type: "DISCARD_CONTEXT" }
  | { readonly type: "RECONCILED_COMMITTED"; readonly data: T }
  | { readonly type: "RECONCILED_ABSENT"; readonly message: string }
  | { readonly type: "REFRESH_EMPTY" }
  | { readonly type: "CLEAR_FILTERS" }
  | { readonly type: "CORRECT_FIELD"; readonly data: T }
  | { readonly type: "RETRY_READ" }
  | { readonly type: "RETRY_MUTATION"; readonly operationKey: string }
  | { readonly type: "RELOAD_CONFLICT" }
  | { readonly type: "ACK_SUCCESS" };

export class InvalidResourceTransitionError extends Error {
  constructor(state: ResourceState<unknown>["kind"], event: string) {
    super(`Invalid resource transition: ${state} + ${event}`);
    this.name = "InvalidResourceTransitionError";
  }
}

/**
 * Máquina comum das transições UI-01–26. Uma transição não declarada falha
 * fechada: a interface não pode fabricar um estado autorizado ou reenviar uma
 * mutação apenas porque recebeu um evento fora de ordem.
 */
export function transitionResourceState<T>(
  current: ResourceState<T>,
  event: ResourceEvent<T>,
): ResourceState<T> {
  if (event.type === "SESSION_EXPIRE" && isAuthenticatedState(current)) {
    return { kind: "session_expired" };
  }
  if (event.type === "REVOKE" && isAuthorizedState(current)) {
    return { kind: "permission_denied" };
  }
  if (event.type === "FOREIGN_RESOURCE" && isAuthenticatedState(current)) {
    return { kind: "permission_denied" };
  }

  switch (current.kind) {
    case "initial":
      if (event.type === "OPEN") return { kind: "loading" };
      break;

    case "loading":
      if (event.type === "LOAD_READY") {
        return { kind: "ready", data: event.data };
      }
      if (event.type === "LOAD_EMPTY") return { kind: "empty" };
      if (event.type === "LOAD_FILTERED_EMPTY") {
        return { kind: "filtered_empty" };
      }
      if (event.type === "READ_FAIL") {
        return { kind: "read_error", message: event.message };
      }
      break;

    case "ready":
      if (
        event.type === "OPEN" ||
        event.type === "REFRESH" ||
        event.type === "APPLY_FILTER"
      ) {
        return { kind: "loading" };
      }
      if (event.type === "EDIT") return { kind: "draft", data: event.data };
      if (event.type === "INVALID") {
        return validationState(event.data, event.errors);
      }
      if (event.type === "SUBMIT") return processingState(event.operationKey);
      if (event.type === "COMPANY_CHANGED") return { kind: "context_invalid" };
      break;

    case "draft":
      if (event.type === "EDIT") return { kind: "draft", data: event.data };
      if (event.type === "INVALID") {
        return validationState(event.data, event.errors);
      }
      if (event.type === "SUBMIT") return processingState(event.operationKey);
      if (event.type === "REQUEST_NAVIGATION") {
        return {
          kind: "discard_confirmation",
          data: current.data,
          destination: event.destination,
        };
      }
      break;

    case "discard_confirmation":
      if (event.type === "STAY") {
        return { kind: "draft", data: current.data };
      }
      if (
        event.type === "DISCARD_INTERNAL" &&
        current.destination === "INTERNAL"
      ) {
        return { kind: "loading" };
      }
      if (
        event.type === "DISCARD_CONTEXT" &&
        current.destination === "CONTEXT_CHANGE"
      ) {
        return { kind: "context_invalid" };
      }
      break;

    case "empty":
      if (event.type === "REFRESH_EMPTY") return { kind: "loading" };
      break;

    case "filtered_empty":
      if (event.type === "CLEAR_FILTERS" || event.type === "APPLY_FILTER") {
        return { kind: "loading" };
      }
      break;

    case "validation":
      if (event.type === "CORRECT_FIELD") {
        return { kind: "draft", data: event.data };
      }
      break;

    case "processing":
      if (event.type === "COMMIT") return { kind: "success", data: event.data };
      if (event.type === "MUTATION_ABSENCE_CONFIRMED") {
        return { kind: "mutation_error", message: event.message };
      }
      if (event.type === "CONFLICT") return { kind: "conflict" };
      if (event.type === "CONNECTION_LOST") {
        return { kind: "reconciling", operationKey: current.operationKey };
      }
      break;

    case "reconciling":
      if (event.type === "RECONCILED_COMMITTED") {
        return { kind: "success", data: event.data };
      }
      if (event.type === "RECONCILED_ABSENT") {
        return { kind: "mutation_error", message: event.message };
      }
      break;

    case "success":
      if (event.type === "ACK_SUCCESS") {
        return { kind: "ready", data: current.data };
      }
      break;

    case "read_error":
      if (event.type === "RETRY_READ") return { kind: "loading" };
      break;

    case "mutation_error":
      if (event.type === "RETRY_MUTATION") {
        return processingState(event.operationKey);
      }
      break;

    case "conflict":
      if (event.type === "RELOAD_CONFLICT") return { kind: "loading" };
      break;

    case "permission_denied":
      if (event.type === "SAFE_REDIRECT_INTERNAL") return { kind: "loading" };
      if (event.type === "SAFE_REDIRECT_SELECTOR") {
        return { kind: "context_invalid" };
      }
      break;

    case "session_expired":
    case "context_invalid":
      break;
  }

  throw new InvalidResourceTransitionError(current.kind, event.type);
}

function validationState<T>(
  data: T,
  errors: Readonly<Record<string, string>>,
): ResourceState<T> {
  return {
    kind: "validation",
    data,
    errors: Object.freeze({ ...errors }),
  };
}

function processingState<T>(operationKey: string): ResourceState<T> {
  if (operationKey.trim().length === 0) {
    throw new Error("Operation key is required while processing");
  }
  return { kind: "processing", operationKey };
}

function isAuthenticatedState<T>(state: ResourceState<T>): boolean {
  return state.kind !== "initial" && state.kind !== "session_expired";
}

function isAuthorizedState<T>(state: ResourceState<T>): boolean {
  return (
    isAuthenticatedState(state) &&
    state.kind !== "permission_denied" &&
    state.kind !== "context_invalid"
  );
}
