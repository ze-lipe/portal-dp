import { describe, expect, it } from "vitest";

import { projectField, type FieldAccess } from "./field-access.js";
import {
  InvalidResourceTransitionError,
  transitionResourceState,
  type ResourceEvent,
  type ResourceState,
} from "./resource-state.js";

const data = "persistido";
const edited = "rascunho";
const operationKey = "idem-etp00-ui-0001";

type TransitionCase = readonly [
  id: string,
  current: ResourceState<string>,
  event: ResourceEvent<string>,
  expected: ResourceState<string>["kind"],
];

const approvedTransitions = [
  ["UI-01", { kind: "initial" }, { type: "OPEN" }, "loading"],
  ["UI-02", { kind: "loading" }, { type: "LOAD_READY", data }, "ready"],
  ["UI-03", { kind: "loading" }, { type: "LOAD_EMPTY" }, "empty"],
  [
    "UI-04",
    { kind: "loading" },
    { type: "LOAD_FILTERED_EMPTY" },
    "filtered_empty",
  ],
  [
    "UI-05",
    { kind: "ready", data },
    { type: "INVALID", data: edited, errors: { nome: "Obrigatório" } },
    "validation",
  ],
  [
    "UI-06",
    { kind: "draft", data: edited },
    { type: "SUBMIT", operationKey },
    "processing",
  ],
  [
    "UI-07",
    { kind: "processing", operationKey },
    { type: "COMMIT", data },
    "success",
  ],
  [
    "UI-08",
    { kind: "loading" },
    { type: "READ_FAIL", message: "Falha segura" },
    "read_error",
  ],
  [
    "UI-08A",
    { kind: "processing", operationKey },
    { type: "MUTATION_ABSENCE_CONFIRMED", message: "Não concluída" },
    "mutation_error",
  ],
  [
    "UI-09",
    { kind: "processing", operationKey },
    { type: "CONFLICT" },
    "conflict",
  ],
  ["UI-10", { kind: "ready", data }, { type: "REVOKE" }, "permission_denied"],
  [
    "UI-10A-interna",
    { kind: "permission_denied" },
    { type: "SAFE_REDIRECT_INTERNAL" },
    "loading",
  ],
  [
    "UI-10A-seletor",
    { kind: "permission_denied" },
    { type: "SAFE_REDIRECT_SELECTOR" },
    "context_invalid",
  ],
  [
    "UI-11",
    { kind: "draft", data: edited },
    { type: "SESSION_EXPIRE" },
    "session_expired",
  ],
  [
    "UI-12",
    { kind: "ready", data },
    { type: "COMPANY_CHANGED" },
    "context_invalid",
  ],
  [
    "UI-13",
    { kind: "ready", data },
    { type: "FOREIGN_RESOURCE" },
    "permission_denied",
  ],
  [
    "UI-14",
    { kind: "processing", operationKey },
    { type: "CONNECTION_LOST" },
    "reconciling",
  ],
  [
    "UI-15",
    { kind: "draft", data: edited },
    { type: "REQUEST_NAVIGATION", destination: "INTERNAL" },
    "discard_confirmation",
  ],
  [
    "UI-16",
    {
      kind: "discard_confirmation",
      data: edited,
      destination: "INTERNAL",
    },
    { type: "STAY" },
    "draft",
  ],
  [
    "UI-17-interna",
    {
      kind: "discard_confirmation",
      data: edited,
      destination: "INTERNAL",
    },
    { type: "DISCARD_INTERNAL" },
    "loading",
  ],
  [
    "UI-17-contexto",
    {
      kind: "discard_confirmation",
      data: edited,
      destination: "CONTEXT_CHANGE",
    },
    { type: "DISCARD_CONTEXT" },
    "context_invalid",
  ],
  [
    "UI-18",
    { kind: "reconciling", operationKey },
    { type: "RECONCILED_COMMITTED", data },
    "success",
  ],
  [
    "UI-19",
    { kind: "reconciling", operationKey },
    { type: "RECONCILED_ABSENT", message: "Ausência confirmada" },
    "mutation_error",
  ],
  ["UI-20", { kind: "empty" }, { type: "REFRESH_EMPTY" }, "loading"],
  ["UI-21", { kind: "filtered_empty" }, { type: "CLEAR_FILTERS" }, "loading"],
  [
    "UI-22",
    {
      kind: "validation",
      data: edited,
      errors: { nome: "Obrigatório" },
    },
    { type: "CORRECT_FIELD", data: edited },
    "draft",
  ],
  [
    "UI-23",
    { kind: "read_error", message: "Falha segura" },
    { type: "RETRY_READ" },
    "loading",
  ],
  [
    "UI-24",
    { kind: "mutation_error", message: "Ausência confirmada" },
    { type: "RETRY_MUTATION", operationKey: "idem-etp00-ui-0002" },
    "processing",
  ],
  ["UI-25", { kind: "conflict" }, { type: "RELOAD_CONFLICT" }, "loading"],
  ["UI-26", { kind: "success", data }, { type: "ACK_SUCCESS" }, "ready"],
] as const satisfies readonly TransitionCase[];

describe("fundação comum de interface", () => {
  it.each([
    ["HIDDEN", false, undefined, undefined],
    ["MASKED", true, false, true],
    ["READ_ONLY", true, false, false],
    ["EDITABLE", true, true, false],
  ] as const)(
    "projeta o campo %s sem ampliar acesso",
    (access, visible, editable, masked) => {
      const projection = projectField(
        "dado-sintetico-1234",
        access as FieldAccess,
      );
      expect(projection.visible).toBe(visible);
      if (projection.visible) {
        expect(projection.editable).toBe(editable);
        expect(projection.masked).toBe(masked);
      }
    },
  );

  it.each(approvedTransitions)(
    "%s aplica somente a transição aprovada",
    (_id, current, event, expected) => {
      expect(transitionResourceState(current, event).kind).toBe(expected);
    },
  );

  it("preserva o rascunho quando a pessoa escolhe permanecer", () => {
    const confirmation = transitionResourceState<string>(
      { kind: "draft", data: edited },
      { type: "REQUEST_NAVIGATION", destination: "INTERNAL" },
    );
    const restored = transitionResourceState(confirmation, { type: "STAY" });
    expect(restored).toEqual({ kind: "draft", data: edited });
  });

  it("preserva a chave enquanto o resultado incerto é reconciliado", () => {
    const state = transitionResourceState<string>(
      { kind: "processing", operationKey },
      { type: "CONNECTION_LOST" },
    );
    expect(state).toEqual({ kind: "reconciling", operationKey });
  });

  it("descarta o rascunho sensível quando a versão do contexto diverge", () => {
    // CON-08: a resposta do servidor invalida o contexto sem conservar `data`.
    const state = transitionResourceState<string>(
      { kind: "draft", data: edited },
      { type: "CONTEXT_VERSION_DIVERGED" },
    );
    expect(state).toEqual({ kind: "context_invalid" });
    expect("data" in state).toBe(false);
  });

  it("não restaura READY diretamente depois de revogação", () => {
    expect(() =>
      transitionResourceState<string>(
        { kind: "permission_denied" },
        { type: "LOAD_READY", data },
      ),
    ).toThrow(InvalidResourceTransitionError);

    const redirecting = transitionResourceState<string>(
      { kind: "permission_denied" },
      { type: "SAFE_REDIRECT_INTERNAL" },
    );
    expect(
      transitionResourceState(redirecting, { type: "LOAD_READY", data }),
    ).toEqual({ kind: "ready", data });
  });

  it.each([
    [
      "não reenvia enquanto o resultado é incerto",
      { kind: "reconciling", operationKey },
      { type: "RETRY_MUTATION", operationKey: "nova-chave" },
    ],
    [
      "não salva numa aba com contexto inválido",
      { kind: "context_invalid" },
      { type: "SUBMIT", operationKey },
    ],
    [
      "não confirma descarte para o destino divergente",
      {
        kind: "discard_confirmation",
        data: edited,
        destination: "INTERNAL",
      },
      { type: "DISCARD_CONTEXT" },
    ],
    [
      "não troca a empresa pulando a confirmação de descarte do rascunho",
      { kind: "draft", data: edited },
      { type: "COMPANY_CHANGED" },
    ],
    [
      "não fabrica dados depois de sessão expirada",
      { kind: "session_expired" },
      { type: "LOAD_READY", data },
    ],
  ] as const)("%s", (_description, current, event) => {
    expect(() => transitionResourceState<string>(current, event)).toThrow(
      InvalidResourceTransitionError,
    );
  });
});
