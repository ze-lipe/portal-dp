# Portal DP

Sistema interno multiempresa para gestao de departamento pessoal. Este repositorio
canonico nasce a partir do planejamento aprovado nos Documentos 01 a 23D.

## Estado atual

- etapa autorizada: `ETP-00 — Baseline executavel`;
- dados permitidos: exclusivamente sinteticos;
- producao, carga inicial e virada: nao autorizadas;
- aplicabilidade ASVS: aprovada nominalmente e vinculada ao conteúdo atual;
- arquitetura de producao: monolito modular com React, NestJS, worker e PostgreSQL.

A implementacao parte exclusivamente do planejamento aprovado, sem reutilizar
codigo, banco ou referencia visual de prototipos anteriores. A ETP-00 cria a
fundacao executavel, o isolamento multiempresa, auditoria,
idempotencia, outbox, armazenamento privado, telemetria e uma prova vertical
sintetica. Login, TOTP e usuarios reais comecam somente na ETP-01.

## Requisitos locais

- Node.js `24.19.0`;
- pnpm `11.22.0`;
- PostgreSQL `18.x` para os testes de integracao reais;
- PowerShell 7 para os validadores documentais.

Copie `.env.example` para `.env` apenas no ambiente local e troque todas as
credenciais. A API e o worker nunca podem usar o papel proprietario das migracoes.

## Comandos principais

```text
corepack pnpm install --frozen-lockfile
corepack pnpm verify:etp00:local
corepack pnpm verify:planning
corepack pnpm db:migrate
corepack pnpm db:provision:service-logins
corepack pnpm db:seed:synthetic
corepack pnpm security:licenses
corepack pnpm verify:etp00:gate
```

O ultimo comando exige PostgreSQL real. SQLite, D1 e mocks nao satisfazem o gate
de isolamento `GAT-02`. A aprovação nominal da aplicabilidade ASVS já foi
registrada e validada; qualquer alteração futura no conteúdo aprovado invalida o
vínculo e exige nova aprovação.

O CI acrescenta SAST, política de licenças, varredura da configuração e da imagem,
e executa API e worker em runtime distroless como UID/GID `65532`, usando o mesmo
artefato OCI. A imagem não declara volume implícito: a API não recebe volume
gravável e o worker recebe explicitamente apenas o armazenamento privado. O smoke
completo depende de Docker e PostgreSQL real; ele não é simulado em uma máquina
que não ofereça esses serviços.

Segredos e dados proibidos são verificados no histórico, nos arquivos gerados e
nas camadas da imagem antes de qualquer publicação. Achados brutos nunca viram
artefato; o CI preserva somente resumos sanitizados e falha de modo fechado.

Cada execução do CI reúne os relatórios disponíveis em um pacote imutável,
content-addressed e verificável. O contrato, a cadeia de substituição e as regras
de acesso estão descritos em `docs/EVIDENCE-REPOSITORY.md`. Esse fechamento não
aprova o manifesto ASVS nem substitui homologação nominal.
O artifact de 90 dias é apenas transporte; o gate de completude permanece
fechado até existir recibo verificável do repositório durável.

O encerramento nominal da etapa usa o template fail-closed descrito em
`docs/ETP-00-ACCEPTANCE.md`. O template permanece pendente até o pipeline real
produzir o artefato, as evidências serem conferidas e as duas áreas responsáveis
registrarem o aceite da execução.

## Como evolucoes futuras entram no sistema

Toda correcao ou nova funcionalidade segue um fluxo controlado:

1. registrar objetivo, motivo, prioridade e criterio de aceite;
2. avaliar impacto em regras, dados, permissoes, seguranca, calculos, telas,
   auditoria, migracoes e operacao;
3. classificar a mudanca como correcao, melhoria compativel, mudanca quebravel,
   regulatoria ou de seguranca;
4. atualizar os documentos e IDs de rastreabilidade afetados antes do codigo;
5. aprovar o recorte e a estrategia de migracao/retorno;
6. implementar com testes automatizados e, quando necessario, feature flag;
7. executar regressao multiempresa, seguranca e homologacao dos papeis responsaveis;
8. publicar o mesmo artefato imutavel validado, com notas e evidencias;
9. preservar historico: pagamentos, recibos e auditorias nunca sao reescritos
   silenciosamente.

Uma correcao urgente de seguranca pode usar o fluxo emergencial, mas recebe a
documentacao e a analise retrospectiva imediatamente depois da contencao.

## Padrão de comentários

Comentários de manutenção são escritos em português e explicam regras,
segurança e decisões que não sejam evidentes pelo próprio código. O padrão
completo está em `docs/PADRAO-COMENTARIOS.md`.
