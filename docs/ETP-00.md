# ETP-00 — Baseline executavel

## Objetivo

Demonstrar uma fatia vertical real e reutilizavel sem antecipar funcionalidades
das etapas seguintes. A prova usa apenas massa sintetica A/B/C.

## Escopo aprovado

- `BK-001–015`;
- `BK-077`;
- `BK-320` e `BK-331`;
- `BK-360`, `BK-361` e `BK-363`.

## Prova de encerramento

1. PostgreSQL real recebe migracoes por papel proprietario.
2. API e worker usam papeis limitados, sem propriedade e sem `BYPASSRLS`.
3. O modelo global sintetico recebe V1 e V2 sem alterar V1.
4. Uma operacao da empresa A grava negocio, auditoria, idempotencia e outbox na
   mesma transacao.
5. O worker materializa um unico objeto privado, explicitamente vinculado a A.
6. Repetir chave e intencao devolve o resultado anterior, sem duplicacao.
7. Reutilizar a chave com outra intencao falha.
8. B, contexto ausente e identificador inexistente nao acessam A.
9. O pool nao conserva contexto de empresa entre transacoes.
10. Falha obrigatoria da auditoria reverte toda a mutacao.

## Estados de prontidao

| Estado                  | Situacao inicial                                |
| ----------------------- | ----------------------------------------------- |
| `PlanningReady`         | verdadeiro, comprovado pelos Documentos 22 e 23 |
| `D23PlanningReady`      | verdadeiro                                      |
| `GAT-01`                | em execucao na ETP-00                           |
| `GAT-02`                | depende dos testes com PostgreSQL real          |
| `ReleaseCandidateReady` | falso                                           |
| `CutoverReady`          | falso                                           |
| `ProductionGo`          | falso                                           |

## Checkpoint de implementação — 2026-08-22

- repositório Git inicializado na branch `main`, com a baseline registrada no
  primeiro commit somente depois da aprovação ASVS;
- manifesto ASVS aprovado por `Jose Felipe Leite Marques — Desenvolvedor`,
  vinculado ao hash canônico `0481f3e75fc1a86bb64e8c49c77e1b4211a2d879bd709745861df396cdcc4032`;
- estrutura React, API NestJS/Fastify, worker e pacotes compartilhados compilando;
- suítes locais automatizadas aprovadas e 20 cenários PostgreSQL preparados;
- contrato OpenAPI e validadores dos Documentos 22 e 23 aprovados localmente;
- onze SBOMs CycloneDX gerados, 289 pacotes de produção com licenças aprovadas e
  auditoria atual de dependências sem vulnerabilidade conhecida;
- pipeline preparado com política de licenças, SAST Semgrep fixado por digest,
  varredura Trivy fixada por SHA e smoke da API/worker no mesmo artefato OCI;
- `QAT-SEC-034` cobre separadamente o histórico Git completo, builds, fixtures,
  evidências antes do upload e as camadas da imagem OCI real; relatórios brutos
  de achados permanecem temporários e somente resumos sanitizados são enviados;
- imagem sem `VOLUME` implícito: a API não recebe persistência gravável e o
  worker recebe somente o armazenamento privado montado explicitamente;
- repositório mínimo de evidências com manifesto por execução, objetos por
  SHA-256, casos, versões, identidade disponível, ACL, retenção e cadeia de
  substituição, validado por testes fail-closed;
- logins técnicos separados do bootstrap, RLS `FORCE`, idempotência estreita,
  outbox, arquivo privado retomável e correlação ponta a ponta implementados;
- tela pública e API configuradas para o empacotamento no mesmo artefato, sem
  reutilizar referência visual, código ou estrutura da pasta removida.

O checkpoint não encerra a etapa. Faltam a execução dos 20 cenários contra
PostgreSQL 18 real e a execução completa do pipeline, incluindo SAST,
construção/inspeção da imagem OCI e smoke do artefato. Esses resultados não são
simulados nem substituídos por mocks.

Neste computador, PostgreSQL e Docker continuam indisponíveis. Por isso, a prova
do banco real, o smoke do UID não privilegiado e os relatórios de licença/imagem
dependem do CI. O SAST pode executar em paralelo, mas nenhum desses resultados
integra o pacote de encerramento antes de sua execução real; a simples definição
do pipeline não é tratada como evidência.

O contrato detalhado está em `docs/EVIDENCE-REPOSITORY.md`. Selar uma execução
preserva os resultados inclusive quando um gate falha; não altera o estado
`APROVADO` nem substitui a aprovação nominal registrada no ASVS.
O pacote fica estruturalmente verificável, porém `complete=false` até haver
recibo de custódia no repositório durável de longo prazo. Os 90 dias do GitHub
Actions são transporte, não a retenção oficial exigida.
Uma execução tecnicamente reprovada é primeiro selada e varrida para
preservação; o gate de completude falha somente depois da publicação segura do
pacote incompleto. Se a coleta ou o pacote selado falhar na varredura de
conteúdo, esse material não é publicado e sobrevive apenas o resumo sanitizado.
Por isso, o CI desta etapa valida estrutura, hashes, resultados dos jobs e cadeia
sem exigir `--require-complete`; esse gate permanece reservado ao candidato à
liberação da ETP-11, quando a custódia durável já deverá estar configurada.

A telemetria já publica atraso da outbox, sinal de vida do worker, tentativas
internas das dependências, exaustão e transições do circuit breaker. A regra
externa que alerta pela ausência de `portal_dp.worker.polls` será configurada no
destino de observabilidade escolhido antes da produção; ela não pode ser
validada neste computador sem esse destino.

## Restricoes

- sem dados reais;
- sem login/TOTP ou cadastro real de empresa nesta etapa;
- banco e os sete papéis `portal_dp_*` dedicados e novos; a migração inicial
  falha se encontrar qualquer papel homônimo preexistente, para não herdar ACL,
  propriedade, configuração ou associação de outro ambiente;
- sem reaproveitar o schema D1/SQLite do prototipo Sites;
- sem declarar sucesso do `GAT-02` usando doubles, mocks, D1 ou SQLite;
- primeiro commit de produção permitido somente com aprovação ASVS válida;
  condição atendida em 2026-08-22.

## Gates ASVS sem ambiguidade

- a aplicabilidade está aprovada e vinculada ao hash canônico; isso autorizou o
  primeiro commit, mas não afirma que controles de segurança passaram;
- a correção controlada `COR-ASVS-ETP00-001` delimitou dez contribuições
  executáveis na ETP-00; ela preserva como casos integrais diferidos
  `QAT-RES-009`, `QAT-SEC-023`, `QAT-SEC-037` e `TST-API-010`, sem afirmar que
  passaram;
- cada contribuição exige evidência real, semanticamente válida e vinculada ao
  caso pelo catálogo canônico e pela mesma execução selada;
- a correção foi aprovada nominalmente por
  `Jose Felipe Leite Marques — Desenvolvedor` em
  `2026-08-22T22:32:42.089Z`, vinculada ao hash canônico do objeto aprovado;
- o fechamento integral dos 211 controles selecionados pertence à
  ETP-11/GAT-10 e continua bloqueado.

O validador usa, respectivamente,
`--require-applicability-approved`, `--require-stage ETP-00` e
`--require-final`. A opção posterior inclui as anteriores e nenhum estado é
promovido apenas porque o pipeline ou o caso foi planejado.
O comando `verify:etp00:gate` executa os gates técnicos que produzem as
evidências. O fechamento nominal usa `verify:etp00:acceptance`, que acrescenta o
gate de contribuições ASVS e permanece vermelho até as dez contribuições estarem
executadas, datadas, atribuídas e ligadas aos artefatos da execução selada, e
até a correção de escopo possuir aprovação nominal válida. Mesmo então, nenhum
caso integral futuro é promovido para `PASSOU`.
