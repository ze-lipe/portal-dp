# Migrações PostgreSQL da ETP-00

As migrações são aplicadas, em ordem lexical, por uma identidade exclusiva de
bootstrap, diferente de todos os papéis usados em runtime:

1. `0001_etp00_bootstrap.sql`: extensão, schemas, domínios e papéis lógicos;
2. `0002_etp00_core_tables.sql`: modelo BK-077 e a fatia empresarial mínima;
3. `0003_etp00_security_and_functions.sql`: RLS, privilégios, imutabilidade,
   idempotência e protocolo de worker.

O executor recomendado em desenvolvimento/CI chama-se `portal_dp_bootstrap`.
Ele precisa criar extensão e papéis e transferir objetos para
`portal_dp_owner`. `portal_dp_owner` é deliberadamente `NOLOGIN`, sem
`SUPERUSER` e sem `BYPASSRLS`; a migração falha se encontrar uma versão insegura
desse papel ou se for executada como ele.

## Contexto empresarial

Toda operação de API ou worker abre uma transação e configura:

```sql
SELECT set_config('app.company_id', :company_id, true);
SELECT set_config('app.actor_id', :actor_id, true);
SELECT set_config('app.correlation_id', :correlation_id, true);
```

O terceiro argumento `true` torna os valores locais à transação, equivalendo a
`SET LOCAL`. Sem contexto, as políticas são default-deny. Nunca se usa `SET`
persistente numa conexão do pool.

A chave idempotente é vinculada à empresa, ao escopo empresarial, ao ator e à
operação. A API não reconcilia uma resposta anterior até revalidar a autorização
atual. `lock_synthetic_authorization()` mantém locks `FOR SHARE` curtos na
empresa e na concessão encontrada; uma revogação concorrente espera o término
da transação e nunca atravessa silenciosamente o commit autorizado.

## Auditoria funcional

Cada evento empresarial informa operação e sequência, ação canônica, resultado,
alvo, ator e correlação. Quando a ação nasce de comando idempotente, a chave é
ligada por FK ao registro técnico da mesma empresa. Versões anterior/final e uma
referência de erro segura são preenchidas apenas quando aplicáveis. Eventos de
alteração carregam `mudancas` em formato canônico (`campo`, `classificacao`,
`anterior` e `novo`); quando não há mudança publicável, o array permanece vazio.
Eventos de
sucesso permanecem na transação da mutação; uma negação sintética concluída é
confirmada em sua própria transação antes de a camada de serviço devolver o erro
neutro.

## Contratos do worker

- `lease_next_outbox_task(owner, seconds)` obtém no máximo uma tarefa da empresa
  ativa com `FOR UPDATE SKIP LOCKED`, recupera lease vencido, incrementa a
  tentativa e emite um `lease_token` UUID exclusivo da aquisição;
- `fail_outbox_task(task_id, owner, lease_token, error_code)` rejeita lease
  obsoleto, encerra imediatamente códigos permanentes e aplica aos transitórios
  backoff exponencial com jitter de ±25%, limitado a uma hora, retornando
  `PENDING` ou `FAILED`;
- `complete_outbox_task(task_id, owner, lease_token)` aceita somente a aquisição
  atual e não expirada e retorna `true` uma única vez.

Ao alcançar `FAILED`, a mesma transação rejeita qualquer reserva de objeto ainda
em `PENDING_VALIDATION`; objetos `AVAILABLE` permanecem imutáveis nesse fluxo.

Os arquivos não contêm comando para SQLite, D1 ou mocks. GAT-02 deve executar
essas migrações e os testes de integração em PostgreSQL real.
