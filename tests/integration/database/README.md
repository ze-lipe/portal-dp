# Integração PostgreSQL — GAT-02

Esta suíte não possui fallback para SQLite, D1, repositório em memória ou mock.
Ela exige `TEST_DATABASE_URL` apontando para um PostgreSQL real, vazio e
descartável. A identidade informada deve ser o bootstrap de migração separado
(`portal_dp_bootstrap` no ambiente de CI), com capacidade para criar extensão e
papéis, transferir propriedade a `portal_dp_owner` e executar `SET ROLE` nos
papéis lógicos da ETP-00. O login nunca pode ser `portal_dp_owner`.

Exemplo de execução a partir da raiz:

```text
TEST_DATABASE_URL=postgresql://... pnpm test:integration:database
```

A suíte aplica todas as migrações em ordem, confere o hash das já aplicadas e
carrega somente a fixture sintética. O banco deve ser descartado depois da
execução; eventos append-only não são eliminados pela própria suíte.

A prova vertical também exige `DATABASE_URL` autenticando como
`portal_dp_app_login` e `WORKER_DATABASE_URL` autenticando como
`portal_dp_worker_login`. Esses logins não possuem privilégios próprios e podem
assumir somente o papel lógico limitado correspondente; o bootstrap nunca é
reutilizado pela API ou pelo worker. As URLs ativam o papel lógico como opção de
inicialização da conexão. Por isso, conforme a semântica do PostgreSQL,
`RESET ROLE` preserva esse papel limitado; `SET ROLE NONE` volta ao login sem
privilégios.

O teste também constrói e abre a tela pública em Chrome, Edge ou Chromium real,
chama `/api/v1/sessao` pela própria página e confere o resultado renderizado. O
navegador não é baixado durante a execução: o executor deve fornecê-lo ou definir
`BROWSER_EXECUTABLE_PATH`. A suíte espera que `pnpm build` tenha sido executado
antes dela, como ocorre no pipeline da ETP-00.

O sandbox nativo do navegador permanece ligado por padrão. Apenas um executor de
teste já isolado que não consiga iniciá-lo pode definir
`BROWSER_DISABLE_SANDBOX=true`; essa exceção não é configuração de produção.
