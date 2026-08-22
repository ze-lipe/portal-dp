import { useEffect, useState } from "react";

import {
  sessionStatusFromResponse,
  type SessionStatus,
} from "./session-state.js";

export function App(): React.JSX.Element {
  const [status, setStatus] = useState<SessionStatus>({ kind: "loading" });

  useEffect(() => {
    const controller = new AbortController();
    void fetch("/api/v1/sessao", {
      credentials: "include",
      headers: { Accept: "application/json" },
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("session-unavailable");
        setStatus(sessionStatusFromResponse(await response.json()));
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError")
          return;
        setStatus({
          kind: "error",
          message: "A base tecnica ainda nao esta disponivel.",
        });
      });

    return () => controller.abort();
  }, []);

  return (
    <main className="shell">
      <section className="card" aria-labelledby="page-title">
        <p className="eyebrow">ETP-00 · Baseline executavel</p>
        <h1 id="page-title">Portal DP</h1>
        <p className="summary">
          A fundacao segura do sistema esta sendo preparada. Nenhum dado real e
          carregado nesta etapa.
        </p>
        <nav className="foundationNav" aria-label="Navegação da fundação">
          <a href="#status">Base técnica</a>
          {[
            "Painel",
            "Colaboradores",
            "Competências e pagamentos",
            "ASO e clínicas",
            "Notificações",
          ].map((label) => (
            <span key={label} aria-disabled="true" title="Etapa futura">
              {label}
            </span>
          ))}
        </nav>
        <div id="status">
          <Status status={status} />
        </div>
      </section>
    </main>
  );
}

function Status({ status }: { status: SessionStatus }): React.JSX.Element {
  switch (status.kind) {
    case "loading":
      return <p role="status">Verificando a base tecnica…</p>;
    case "ready":
      return (
        <div className="status statusSuccess" role="status">
          <span aria-hidden="true">✓</span>
          <span>API conectada · versao {status.version}</span>
        </div>
      );
    case "error":
      return (
        <div className="status statusError" role="alert">
          <span>{status.message}</span>
          <button type="button" onClick={() => window.location.reload()}>
            Tentar novamente
          </button>
        </div>
      );
    case "empty":
      return <p role="status">Nenhuma sessao ativa.</p>;
    case "validation":
      return <p role="alert">Revise os campos indicados antes de continuar.</p>;
    case "conflict":
      return (
        <p role="alert">
          A versao foi alterada. Recarregue antes de continuar.
        </p>
      );
    case "revoked":
      return <p role="alert">O acesso foi revogado. Entre novamente.</p>;
    case "uncertain":
      return (
        <p role="alert">
          A confirmacao e incerta. Consulte o resultado antes de repetir.
        </p>
      );
  }
}
