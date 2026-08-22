# Documento 21

## Backlog Priorizado e Plano de Desenvolvimento por Etapas

**Sistema:** Portal interno multiempresa de Departamento Pessoal  
**Versão:** 1.0 — aprovado  
**Situação:** aprovado integralmente pelo usuário em 22/08/2026  
**Data:** 22/08/2026  
**Base aprovada:** Documentos 16, 17, 18, 18A, 19, 20 e 20A; Documento Mestre 07; Fluxo Integrado 08 e Lotes 1 a 7  
**Alinhamento normativo:** em 22/08/2026, a regra já aprovada no Documento Mestre §23.3 para término MEI antes/na data do adiantamento ainda não pago foi explicitamente propagada ao backlog; não houve nova decisão funcional.  
**Sincronização técnica posterior:** dependências de implantação, `ENT-IMP-*`, `ProductionGo` e provas correlatas alinhadas ao pacote 23, aprovado integralmente pelo usuário em 22/08/2026.  

---

# 1. Finalidade

Este documento transforma todo o planejamento aprovado em uma ordem executável de desenvolvimento. Ele define:

- os épicos e itens do backlog da primeira versão;
- prioridade, porte relativo e dependências;
- o que é obrigatório na V1 e o que permanece como melhoria futura;
- a sequência de entregas verticais e os marcos de homologação;
- os critérios de entrada e saída de cada item;
- os gates que impedem avançar com isolamento, cálculo ou segurança incompletos;
- as frentes que podem trabalhar em paralelo sem romper os limites do monólito modular;
- a rastreabilidade dos 18 blocos de estados, do modelo de dados, da arquitetura e da API;
- os riscos que deverão ser reduzidos antes da produção;
- a passagem formal para os Documentos 22 e 23.

Este documento ainda **não inicia o desenvolvimento**. Conforme a decisão já aprovada, o código de produção começa somente depois da aprovação dos Documentos 21, 22 e 23.

O **Documento 21A — Matriz de Rastreabilidade entre Backlog, Etapas e Testes** é anexo obrigatório deste plano. Ele atribui, sem lacunas, um BK proprietário, um épico, uma etapa primária e uma âncora de teste a cada um dos 440 IDs funcionais.

---

# 2. Autoridade, limites e identificadores

## 2.1 Ordem de autoridade

Em caso de divergência:

1. Documento 18 e 18A, para entidades, relacionamentos, restrições e rastreabilidade de dados;
2. Documento 17, para estados, transições, fórmulas, guardas e comportamentos;
3. Documento 16, para consolidação funcional e visual;
4. Documento Mestre 07 e Fluxo Integrado 08;
5. Documento 19, para arquitetura, segurança, infraestrutura e operação;
6. Documento 20 e 20A, para contratos de API, autorização e realização técnica das transições;
7. este Documento 21, exclusivamente para prioridade, decomposição e ordem de construção;
8. pacote 22/22A–22D aprovado, para testes, homologação e evidências;
9. pacote 23/23A–23D aprovado, para implantação, migração, operação e retorno seguro.

Um item de backlog não altera uma regra aprovada. Se durante o desenvolvimento surgir conflito, o item é bloqueado, a divergência é registrada e os documentos de autoridade são corrigidos por decisão formal antes da continuação.

## 2.2 Famílias de identificadores

| Prefixo | Finalidade |
|---|---|
| `EPC-*` | Épico de produto ou plataforma. |
| `BK-*` | Item de backlog entregável e verificável. |
| `ETP-*` | Etapa ordenada de desenvolvimento. |
| `MAR-*` | Marco de produto demonstrável. |
| `GAT-*` | Gate obrigatório para permitir avanço. |
| `DOR-*` | Critério da Definição de Pronto para Iniciar. |
| `DOD-*` | Critério da Definição de Concluído. |
| `RSK-*` | Risco acompanhado durante a execução. |

Esses IDs não substituem nenhum identificador dos Documentos 17 a 20A. Cada `BK-*` deverá referenciar, no gerenciador de trabalho e nos testes, os IDs funcionais e técnicos realmente implementados.

## 2.3 Incluído

- primeira versão web interna;
- fundação técnica, interface, API, banco, worker e arquivos privados;
- autenticação, TOTP, sessão, empresa ativa e permissões;
- empregado, MEI, condições financeiras, competências e pagamentos;
- correções, recibos, desligamentos e ASO;
- clínicas, notificações internas, exportações, auditoria e incidentes;
- carga inicial controlada, segurança, desempenho, backup e observabilidade necessários para colocar a V1 em produção;
- preparação das evidências detalhadas no Documento 22;
- preparação operacional detalhada no Documento 23.

## 2.4 Fora deste documento

- estimativa em horas, dias ou datas sem equipe e disponibilidade definidas;
- escolha definitiva da hospedagem e dos provedores;
- casos de teste completos, pertencentes ao Documento 22;
- roteiro de implantação e rollback, pertencente ao Documento 23;
- implementação, migrações SQL finais ou código de produção;
- novas funcionalidades não aprovadas.

---

# 3. Estratégia de priorização

## 3.1 Classes de prioridade

| Prioridade | Significado | Regra |
|---|---|---|
| `P0` | Fundação, segurança ou integridade bloqueadora. | Deve existir antes de qualquer funcionalidade que dependa dela; não pode ser adiada para o fim. |
| `P1` | Capacidade central obrigatória da V1. | Necessária para operar o fluxo de Departamento Pessoal aprovado. |
| `P2` | Capacidade obrigatória de conclusão e operação da V1. | Pode vir depois do núcleo, mas é exigida antes da produção. |
| `MF` | Melhoria futura. | Não participa dos marcos de liberação da V1. |

`P2` não significa opcional. Todo item `P0`, `P1` e `P2` deste documento integra o escopo da primeira versão, salvo alteração formal aprovada.

## 3.2 Porte relativo

| Porte | Leitura | Conduta |
|---|---|---|
| `XS` | Mudança pequena, isolada e bem conhecida. | Pode entrar diretamente em uma etapa. |
| `S` | Entrega pequena com poucos componentes. | Deve continuar verificável de ponta a ponta. |
| `M` | Entrega média, normalmente envolvendo interface, API e dados. | Pode exigir subtarefas técnicas, sem perder um único resultado de aceite. |
| `L` | Entrega ampla, sensível ou com várias regras. | Deve ser planejada em fatias verticais internas. |
| `XL` | Grande demais ou incerta para iniciar. | É proibido iniciar; deve ser dividida até no máximo `L`. |

O porte representa complexidade, risco e quantidade de superfícies afetadas; não representa prazo. Datas só serão estimadas depois de conhecer equipe, jornada disponível, infraestrutura escolhida e velocidade observada nas primeiras etapas.

## 3.3 Critérios usados na ordem

A ordem favorece, nesta sequência:

1. isolamento multiempresa e proteção de dados;
2. integridade e auditabilidade;
3. dependências estruturais entre módulos;
4. entrega de fluxos completos que possam ser demonstrados;
5. regras financeiras de maior impacto;
6. redução antecipada de riscos técnicos;
7. acabamento operacional e preparação de produção.

Não será construída toda a interface para somente depois conectar o backend, nem todo o banco para somente depois validar os fluxos. Cada etapa entrega fatias verticais com banco, domínio, API, autorização, interface, auditoria e testes correspondentes.

---

# 4. Princípios vinculantes de execução

| ID | Princípio |
|---|---|
| PLN-01 | Cada operação empresarial usa exatamente uma empresa obtida da sessão; a interface nunca escolhe `empresa_id` como autoridade. |
| PLN-02 | RLS, chaves compostas, restrições e testes de acesso cruzado nascem junto da primeira tabela empresarial. |
| PLN-03 | Autorização por ação, objeto, estado e campo é uma capacidade central reutilizável, não condicionais espalhadas pelas telas. |
| PLN-04 | Histórico funcional e auditoria técnica usam a fonte única aprovada e são entregues junto de cada mutação. |
| PLN-05 | Fórmulas financeiras ficam em núcleo puro, decimal, determinístico, versionado e sem dependência do navegador. |
| PLN-06 | Confirmação, idempotência, concorrência e resposta incerta são implementadas antes de pagamentos reais. |
| PLN-07 | PDF, Excel, ZIP, e-mail e rotinas temporais usam outbox/fila durável e worker quando definido pelos Documentos 19 e 20. |
| PLN-08 | Nenhum arquivo privado recebe URL pública; toda entrega revalida sessão, empresa, objeto, permissão e integridade. |
| PLN-09 | Dados sensíveis não entram em URL, log técnico, telemetria, mensagem de erro ou ambiente não produtivo. |
| PLN-10 | A interface implementa carregamento, vazio, erro, conflito, permissão revogada e resposta incerta desde a primeira fatia. |
| PLN-11 | O mesmo artefato imutável segue entre ambientes; configuração e segredos ficam fora do código. |
| PLN-12 | Toda alteração de escopo passa por controle de mudança e atualiza rastreabilidade, backlog, teste e documentação afetados. |

---

# 5. Definição de Pronto para Iniciar — DoR

Um item `BK-*` somente pode entrar em desenvolvimento quando todos os critérios aplicáveis forem verdadeiros.

| ID | Critério obrigatório |
|---|---|
| DOR-01 | Resultado esperado, usuário beneficiado e limite do item estão claros. |
| DOR-02 | IDs aplicáveis dos Documentos 17, 18/18A, 19 e 20/20A foram vinculados. |
| DOR-03 | Critérios de aceite positivos, negativos e de permissão estão definidos. |
| DOR-04 | Empresa, escopo global/empresarial/restrito e dados sensíveis envolvidos estão classificados. |
| DOR-05 | Dependências obrigatórias estão concluídas. Substituto descartável só é permitido para adaptador externo não autoritativo; nunca substitui PostgreSQL/RLS, autorização, auditoria, pagamento, idempotência, transação ou recibo. |
| DOR-06 | Contrato de API e DTO já existem no Documento 20 ou a tarefa é puramente interna prevista nele. |
| DOR-07 | Estados de carregamento, vazio, validação, erro, conflito e revogação aplicáveis estão definidos. |
| DOR-08 | Migração, restrições, índices, RLS e efeito sobre dados existentes foram avaliados. |
| DOR-09 | Auditoria, idempotência, concorrência e tarefa assíncrona aplicáveis foram identificadas. |
| DOR-10 | Protótipo ou fluxo visual correspondente está aprovado, quando houver interface. |
| DOR-11 | Item tem porte entre `XS` e `L`; qualquer `XL` foi dividido. |
| DOR-12 | Não existe decisão funcional pendente que possa mudar materialmente a implementação. |
| DOR-13 | Riscos aplicáveis possuem `RSK-*`, proprietário e tratamento previsto para a etapa. |

Uma definição ainda permitida para antes da produção — como fornecedor de hospedagem — não bloqueia o item se houver uma interface técnica portável e um adaptador substituível já aprovados.

---

# 6. Definição de Concluído — DoD

Um item não fica concluído apenas porque a tela “funciona”. Todos os critérios aplicáveis deverão estar comprovados.

| ID | Critério obrigatório |
|---|---|
| DOD-01 | Código revisado, tipado, legível e dentro dos limites do monólito modular. |
| DOD-02 | Migrações e restrições foram aplicadas em ambiente limpo e em base com versão anterior compatível, com estratégia `expand/contract` quando necessária e caminhos de avanço e retorno (`rollforward/rollback`) ensaiados. |
| DOD-03 | Testes unitários cobrem regras puras, limites, datas e dinheiro aplicáveis. |
| DOD-04 | Testes de integração comprovam banco, transação, RLS, unicidade, concorrência e rollback aplicáveis. |
| DOD-05 | Testes de contrato comprovam rota, DTO, erro estável, idempotência, `ETag` e autorização aplicáveis. |
| DOD-06 | Testes de interface comprovam fluxo principal, teclado, foco, validação, estados vazios e falhas aplicáveis. |
| DOD-07 | Testes negativos comprovam negação neutra e ausência de vazamento entre empresas e campos. |
| DOD-08 | Auditoria e histórico registram ator, empresa, operação, correlação e mudanças autorizadas. |
| DOD-09 | Logs, métricas e rastros são suficientes e não contêm conteúdo pessoal, financeiro ou clínico indevido. |
| DOD-10 | OpenAPI, manifesto de operações e matriz de rastreabilidade continuam consistentes. |
| DOD-11 | Tarefas assíncronas são idempotentes, retomáveis e observáveis, quando aplicável. |
| DOD-12 | Nenhum segredo, URL pública de arquivo, permissão confiada ao cliente ou dado real de produção foi introduzido. |
| DOD-13 | Critérios de desempenho aplicáveis foram medidos em volume representativo. |
| DOD-14 | Documentação de uso, decisão ou operação afetada foi atualizada. |
| DOD-15 | Demonstração do resultado foi aceita pelo responsável de homologação aplicável. |
| DOD-16 | Não permanece `SEV-0` ou `SEV-1`; eventual `SEV-2/3` possui proprietário, prazo, impacto e aceite formal aplicável. |

O Documento 22 transforma esses critérios em casos, massa, evidências e gates automatizados exatos.

---

# 7. Mapa dos épicos

| Épico | Resultado de produto | Prioridade predominante |
|---|---|---|
| EPC-01 | Fundação técnica e fatia vertical segura | P0 |
| EPC-02 | Identidade, conta, TOTP e sessão | P0/P1 |
| EPC-03 | Empresa, seletor, contexto e painel | P0/P1 |
| EPC-04 | Usuários, master, perfis e permissões | P0/P1 |
| EPC-05 | Colaboradores empregados e recontratação | P1 |
| EPC-06 | Prestadores MEI e contratos | P1 |
| EPC-07 | Condições financeiras e vigências | P1 |
| EPC-08 | Competências, cálculos e grupos financeiros | P1 |
| EPC-09 | Confirmação e pagamento | P1 |
| EPC-10 | Correções, ajustes e diferença absorvida | P1 |
| EPC-11 | Recibos, arquivos e lotes documentais | P1/P2 |
| EPC-12 | Desligamentos e acerto complementar de RA | P1 |
| EPC-13 | ASO e clínicas compartilhadas | P1 |
| EPC-14 | Central de notificações internas | P2 |
| EPC-15 | Exportações em Excel | P2 |
| EPC-16 | Histórico e auditoria | P0/P1 |
| EPC-17 | Registro restrito de incidentes | P2 |
| EPC-18 | Operação, carga inicial e endurecimento para produção | P0/P2 |

---

# 8. Regras comuns do backlog

- A coluna “depende de” indica dependência mínima, não todos os componentes técnicos internos.
- Todo item herda a DoR, a DoD e os princípios da seção 4.
- “Aceite do épico” complementa, mas não substitui, os critérios específicos do item e os testes aprovados no pacote 22/22A–22D quando forem executados.
- Uma funcionalidade de interface inclui API e persistência reais, salvo quando o Documento 20 a classifica expressamente como `UI_LOCAL`.
- Um item pode ser dividido em subtarefas de banco, domínio, API, interface e testes, mas somente o resultado vertical completo recebe estado concluído.
- Ajustes estéticos que não mudem comportamento podem ser agrupados; permissões, dinheiro, transições, documentos e histórico nunca são tratados como acabamento estético.

---

# 9. EPC-01 — Fundação técnica e fatia vertical segura

**Objetivo:** disponibilizar uma base executável de produção e provar, antes dos módulos de negócio, que o caminho interface–API–banco–auditoria–worker respeita contexto, segurança e rastreabilidade.

| ID | Entrega verificável | Pri. | Porte | Depende de |
|---|---|---:|:---:|---|
| BK-001 | Estruturar o monólito modular com aplicações web, API e worker, pacotes internos e fronteiras de domínio aprovadas. | P0 | M | — |
| BK-002 | Fixar versões suportadas de Node.js, NestJS, React, TypeScript, PostgreSQL e bibliotecas; validar configuração na inicialização. | P0 | S | BK-001 |
| BK-003 | Criar migrações versionadas, schemas e papéis separados de proprietário, aplicação, worker, auditoria e operação. | P0 | L | BK-001 |
| BK-004 | Implementar unidade de trabalho com contexto de ator e empresa limitado à transação, RLS com negação padrão e `FORCE ROW LEVEL SECURITY` aplicável. | P0 | L | BK-003 |
| BK-005 | Implementar tipos canônicos de data, competência, instante, moeda, percentual, versão, relógio injetável e cálculo decimal. | P0 | M | BK-001 |
| BK-006 | Implementar correlação, auditoria atômica append-only e registro de mudanças de campo reutilizável pelos módulos. | P0 | L | BK-003, BK-005 |
| BK-007 | Implementar perfis centrais de idempotência, concorrência otimista, chaves naturais, locks e resposta incerta. | P0 | L | BK-003, BK-005 |
| BK-008 | Implementar outbox, fila PostgreSQL, lease, repetição progressiva, falha terminal e worker com uma empresa por tarefa. | P0 | L | BK-003, BK-006, BK-007 |
| BK-009 | Implementar porta para armazenamento privado, metadados, hash, varredura/validação e entrega reautorizada de arquivos. | P0 | L | BK-001, BK-003 |
| BK-010 | Implementar base HTTP `/api/v1`, Problem Details, validação estrita, CSRF, cookie opaco, paginação e manifesto OpenAPI/`OPR-*`. | P0 | L | BK-001, BK-007 |
| BK-011 | Implementar shell React, navegação, componentes básicos, quatro estados de campo e máquina comum de carregamento, vazio, erro, conflito e revogação. | P0 | L | BK-001, BK-010 |
| BK-012 | Implementar telemetria OpenTelemetry, logs estruturados sanitizados, métricas, rastros e endpoints mínimos de vida e prontidão. | P0 | M | BK-001, BK-006 |
| BK-013 | Criar pipeline de qualidade, testes, análise de dependências, imagem OCI imutável e promoção do mesmo artefato entre ambientes. | P0 | L | BK-001, BK-002 |
| BK-014 | Criar catálogos canônicos, seeds técnicos seguros e verificação automática das referências dos Documentos 17 a 20A. | P0 | M | BK-003, BK-010 |
| BK-015 | Entregar prova vertical com duas empresas fictícias, uma gravação empresarial, auditoria, tarefa e tentativa cruzada recusada. | P0 | M | BK-004 a BK-014 |

## 9.1 Aceite do épico

- Web, API e worker são construídos a partir do mesmo baseline e iniciam com configuração válida.
- O papel da aplicação não é proprietário de tabela e não possui `BYPASSRLS`.
- Ausência ou divergência de empresa falha de forma fechada.
- A prova com empresa A e B demonstra que consulta, alteração, auditoria, tarefa e arquivo não atravessam o limite.
- Repetir a mesma intenção não duplica efeito, auditoria obrigatória nem tarefa.
- Logs e rastros usam IDs técnicos, sem CPF, remuneração, resultado de ASO ou segredo.
- Build, migração, testes e verificação documental falham automaticamente diante de inconsistência.

---

# 10. EPC-02 — Identidade, conta, TOTP e sessão

**Objetivo:** permitir acesso seguro, recuperar a conta e controlar sessões revogáveis sem expor dados empresariais antes da autenticação completa.

| ID | Entrega verificável | Pri. | Porte | Depende de |
|---|---|---:|:---:|---|
| BK-020 | Implementar credencial de senha com hash forte, mínimo de dez caracteres, resposta neutra e proteção contra enumeração. | P0 | M | BK-010 |
| BK-021 | Implementar login, contagem de falhas e bloqueio temporário de 15 minutos após cinco tentativas, separado do bloqueio administrativo. | P0 | M | BK-020 |
| BK-022 | Implementar convite/primeiro acesso com credencial temporária única de 24 horas, senha definitiva e invalidação no reenvio. | P1 | M | BK-020, BK-008 |
| BK-023 | Implementar solicitação neutra e redefinição de senha por link único de 30 minutos, com revogação das sessões afetadas. | P1 | M | BK-020, BK-008 |
| BK-024 | Implementar configuração por QR/segredo e desafio TOTP obrigatório para master, compatível com Google Authenticator e equivalentes. | P0 | L | BK-020, BK-009 |
| BK-025 | Implementar códigos de recuperação de uso único, limitação de tentativas e redefinição controlada do TOTP sem revelar o novo segredo ao executor. | P0 | L | BK-024 |
| BK-026 | Implementar a exceção controlada `B03-MST-06` quando existirem exatamente dois masters aptos e um precisar reconfigurar TOTP. | P0 | L | BK-025, BK-068 |
| BK-027 | Implementar sessão opaca no servidor, rotação, aviso aos 25 minutos, inatividade de 30 minutos e limite absoluto de oito horas. | P0 | L | BK-010, BK-021 |
| BK-028 | Implementar logout, expiração, revogação imediata e limpeza de dados sensíveis nas abas abertas. | P0 | M | BK-027 |
| BK-029 | Implementar reautenticação crítica de cinco minutos vinculada ao ator, ação, entidade, versão, escopo e resumo confirmado. | P0 | L | BK-024, BK-027 |
| BK-030 | Implementar “Minha Conta” para dados próprios, alteração de senha, situação do TOTP e encerramento das próprias sessões conforme permissão. | P1 | M | BK-023 a BK-025, BK-027 a BK-029 |
| BK-031 | Implementar envio transacional idempotente dos e-mails de primeiro acesso e recuperação por porta substituível. | P1 | M | BK-008, BK-022, BK-023 |
| BK-032 | Implementar auditoria e proteção de abuso para login, recuperação, TOTP, reautenticação e revogação, sem registrar credenciais. | P0 | M | BK-006, BK-020 a BK-025, BK-027 a BK-031 |
| BK-033 | Implementar o agregado singleton e o comando de plano de controle do bootstrap: criar exatamente dois masters em `PENDENTE_PRIMEIRO_ACESSO`, permitir que cada titular chegue apenas a `PRONTO_AGUARDANDO_PAR` e, quando ambos estiverem prontos, marcar os dois `ATIVADO_CONJUNTAMENTE` e o agregado `CONSUMIDO` no mesmo commit, sem senha padrão, backdoor ou aptidão individual antecipada; concorrência, replay e falha parcial permanecem seguros. | P0 | L | BK-020, BK-022, BK-024, BK-027, BK-032 |

## 10.1 Aceite do épico

- Usuário comum entra com senha; master somente prossegue após TOTP concluído na sessão atual.
- Senha temporária, token, segredo TOTP, código TOTP, recuperação e cookie nunca aparecem em log, histórico, exportação ou resposta indevida.
- Um código TOTP aceito não pode ser reutilizado na mesma janela.
- E-mail repetido pelo worker não duplica convite e nunca renova silenciosamente a validade do token.
- Atualização automática de painel ou sino e troca de empresa não renovam a sessão.
- Revogação no servidor impede uma aba anterior de concluir nova operação.
- Nenhuma ação administrativa comum reduz a organização abaixo de dois masters aptos. A única exceção é `B03-MST-06`: temporariamente fica um master apto e outro em reconfiguração, em contingência degradada que bloqueia qualquer nova redução.
- O bootstrap inicial usa comando técnico nominal, revisado e de uso único. Cada titular conclui os próprios segredos; `master_apto` continua falso em `PENDENTE_PRIMEIRO_ACESSO` e `PRONTO_AGUARDANDO_PAR`. Somente o commit que ativa os dois conjuntamente consome o agregado e permite novo login operacional.
- Invocações e configurações concorrentes possuem um único resultado válido; falha antes do commit conjunto ativa zero masters; replay depois de `CONSUMIDO` é recusado e não deixa conta, senha, credencial técnica ou rota de emergência na aplicação.

---

# 11. EPC-03 — Empresa, seletor, contexto e painel

**Objetivo:** administrar empresas autorizadas e garantir que cada sessão carregue dados de somente uma empresa por vez.

| ID | Entrega verificável | Pri. | Porte | Depende de |
|---|---|---:|:---:|---|
| BK-040 | Implementar cadastro global atômico dentro do seletor: empresa/CNPJ, configurações, dias sugeridos, competência inicial, cópia independente de modelo ativo, acessos obrigatórios e logo opcional. | P1 | L | BK-004, BK-027, BK-041, BK-077 |
| BK-041 | Implementar validação e versionamento da configuração empresarial, percentual padrão de adiantamento, dados do recibo e logo opcional PNG/JPEG privado de até 2 MB. | P1 | M | BK-009, BK-014 |
| BK-042 | Implementar lista de empresas autorizadas ao usuário por papel/associação vigente, sem carregar dados operacionais de nenhuma delas. | P0 | M | BK-004, BK-027, BK-040 |
| BK-043 | Implementar seleção no servidor, fixando exatamente um contexto empresarial e sua versão na sessão. | P0 | L | BK-004, BK-027, BK-042 |
| BK-044 | Implementar troca de empresa retornando ao seletor, limpando competência, filtros, prévias, arquivos e rascunhos depois da confirmação de descarte. | P0 | M | BK-043, BK-011 |
| BK-045 | Implementar defesa contra abas antigas após troca de escopo, com erro neutro, limpeza e redirecionamento seguro. | P0 | M | BK-043, BK-044 |
| BK-046 | Implementar cabeçalho empresarial com logo, razão social, CNPJ e ação “Trocar empresa”. | P1 | S | BK-041, BK-043 |
| BK-047 | Implementar painel da empresa com agregados e atalhos autorizados, calculados somente depois de empresa e permissões. | P1 | L | BK-043, BK-067 |
| BK-048 | Implementar inativação e reativação da empresa; contexto inativo permanece histórico, bloqueia novas movimentações ordinárias e permite consulta/exportação histórica somente com permissão específica. | P1 | L | BK-040, BK-029 |
| BK-049 | Implementar escopos global e restrito de incidentes separados do contexto empresarial, sem coexistência implícita. | P0 | L | BK-027, BK-064, BK-069 |
| BK-050 | Comprovar negação neutra para empresa inexistente, inativa sem acesso ou não associada, sem revelar existência ou estado. | P0 | M | BK-042 a BK-046, BK-048 |

## 11.1 Aceite do épico

- A tela de seleção não faz consulta de colaboradores, ASO, competências ou pagamentos.
- Cadastro de nova empresa aparece no seletor somente para quem possui permissão global específica.
- A empresa nunca é aceita de campo, URL, cabeçalho ou payload do navegador como autoridade.
- Master pode acessar empresas atuais e futuras, mas ainda precisa selecionar uma empresa para operar dados empresariais.
- Empresa inativa não altera artificialmente o estado real de vínculos, contratos ou pagamentos.
- A tentativa de usar ID de outra empresa retorna resultado neutro e não contamina totais, histórico, arquivos ou auditoria funcional visível.

---

# 12. EPC-04 — Usuários, master, perfis e permissões

**Objetivo:** permitir que somente masters administrem usuários e perfis, com controle reutilizável por módulo, tela, ação e campo.

| ID | Entrega verificável | Pri. | Porte | Depende de |
|---|---|---:|:---:|---|
| BK-060 | Implementar identidade master-only de usuário com nome e e-mail globalmente único; a ativação do convite comum será orquestrada com sua associação inicial. | P1 | M | BK-022, BK-049 |
| BK-061 | Implementar bloqueio, desbloqueio, inativação, reativação e reenvio de primeiro acesso sem exclusão física. | P1 | L | BK-060, BK-029 |
| BK-062 | Implementar associações explícitas entre usuário comum, empresas e perfis empresariais vigentes. | P0 | L | BK-040, BK-060 |
| BK-063 | Implementar catálogo versionado de módulos, telas, ações e campos, com negação por padrão. | P0 | L | BK-014 |
| BK-064 | Implementar perfis globais, permissões de empresa e funções que não dependem de uma empresa operacional. | P0 | L | BK-063 |
| BK-065 | Implementar, depois de existir empresa, seus perfis e cópias independentes a partir de modelo global válido, incluindo criar, duplicar, arquivar e migrar atribuições explicitamente; a cópia não recebe mudanças futuras do modelo. | P0 | L | BK-040, BK-063, BK-064, BK-066, BK-077 |
| BK-066 | Implementar os quatro estados de campo: oculto, mascarado, visível sem edição e visível com edição. | P0 | L | BK-063, BK-010, BK-011 |
| BK-067 | Implementar projeção única de capacidades para resposta, formulário, filtro, total, painel, notificação/sino, histórico, Excel, documento e erro. | P0 | L | BK-065, BK-066 |
| BK-068 | Implementar promoção, rebaixamento e contingência de master, preservando dois masters aptos nas ações comuns e a exceção degradada estrita de `B03-MST-06`. | P0 | L | BK-024, BK-060, BK-029 |
| BK-069 | Implementar autorização nominal de incidentes separada do papel master e dos perfis empresariais. | P0 | M | BK-063, BK-064 |
| BK-070 | Implementar prévia tipada do impacto de alteração de acesso, confirmação sobre a mesma versão e revogação de todas as sessões afetadas. | P0 | L | BK-027, BK-062 a BK-069 |
| BK-071 | Implementar consulta administrativa de usuários, perfis, associações e estados de segurança, sem revelar segredos. | P1 | M | BK-060 a BK-070 |
| BK-072 | Implementar proteção contra atribuição em massa e rejeição de campos sem capacidade editável, inclusive quando enviados manualmente; valor mascarado nunca pode sobrescrever o original. | P0 | M | BK-066, BK-067 |
| BK-073 | Implementar auditoria crítica de concessão, redução, master, redefinição de TOTP e acesso restrito, com justificativa quando exigida. | P0 | M | BK-006, BK-068 a BK-070 |
| BK-074 | Implementar, depois de existir empresa, o ciclo administrativo completo de modelos globais: criar, duplicar, versionar, arquivar e copiar para empresa sem propagação posterior. | P1 | M | BK-040, BK-064, BK-065, BK-077 |
| BK-075 | Implementar edição master-only de nome e e-mail do usuário, com unicidade, versão, impacto exibido e auditoria. | P1 | M | BK-060, BK-070 |
| BK-076 | Orquestrar convite de usuário comum de forma atômica com ao menos uma empresa e um perfil válido; falha da associação não deixa acesso parcial. | P1 | L | BK-060, BK-062, BK-065 |
| BK-077 | Implementar, como item autônomo, o núcleo global mínimo de modelo empresarial antes da primeira empresa: catálogo mínimo fechado, negação por padrão, criação de uma versão válida e versionamento imutável; não antecipa nenhuma fração de BK-063/064/066, e o catálogo/perfis/campos administrativos completos e as cópias empresariais permanecem em BK-063–066/BK-074. | P0 | M | BK-014 |

## 12.1 Aceite do épico

- Não existe autocadastro público nem administração de usuário por perfil empresarial comum.
- Master não ganha autorização de incidente automaticamente.
- Campo oculto não chega ao navegador, filtro, total, histórico, Excel ou documento; campo mascarado mantém a máscara fora do fluxo específico de revelação.
- Enviar manualmente campo não editável é recusado, mesmo que a interface não o mostre.
- Prévia desatualizada ou com impacto diferente não muda nenhum acesso.
- Toda redução efetiva de acesso revoga todas as sessões dos usuários afetados antes de nova operação.
- Nenhuma operação administrativa comum deixa menos de dois masters aptos; somente a exceção controlada `B03-MST-06` admite um apto e um em reconfiguração temporariamente.

---

# 13. EPC-05 — Colaboradores empregados e recontratação

**Objetivo:** manter pessoa, vínculo empregado, endereços e ciclo de atividade sem confundir início de atividades, registro formal e desligamento.

| ID | Entrega verificável | Pri. | Porte | Depende de |
|---|---|---:|:---:|---|
| BK-080 | Implementar lista paginada com busca, filtros e separação padrão entre ativos e inativos. | P1 | M | BK-043, BK-067 |
| BK-081 | Implementar cadastro atômico de pessoa empresarial e primeiro vínculo empregado, com nome, CPF e endereço completo. | P1 | L | BK-004, BK-067 |
| BK-082 | Proteger CPF, gerar índice de busca seguro e validar unicidade por empresa sem revelar ocorrência em outro CNPJ. | P0 | L | BK-003, BK-004, BK-081 |
| BK-083 | Implementar datas independentes de início das atividades, admissão/registro formal, desligamento sem registro e demissão formal. | P1 | L | BK-081 |
| BK-084 | Implementar versões de nome, CPF, endereço e dados cadastrais com concorrência otimista e antes/depois autorizado. | P1 | L | BK-006, BK-007, BK-081 |
| BK-085 | Derivar vínculo futuro, ativo sem registro, ativo registrado, encerramento programado, último dia ativo e inativo, além de encerrado sem registro ou demitido formalmente, sem situação livre. | P1 | M | BK-083 |
| BK-086 | Projetar a inativação operacional no dia seguinte ao desligamento vindo exclusivamente do Bloco 12, sem botão ou segunda fonte de encerramento e sem apagar pessoa, histórico, pagamentos ou documentos. | P1 | M | BK-083, BK-085 |
| BK-087 | Implementar recontratação somente depois do vínculo anterior efetivamente encerrado, reutilizando a pessoa e criando novo vínculo. | P1 | L | BK-082, BK-086 |
| BK-088 | Impedir vínculos simultâneos ou sobrepostos da mesma pessoa na empresa e fornecer orientação segura para abrir vínculo existente. | P1 | M | BK-082, BK-087 |
| BK-089 | Implementar detalhe integrado do colaborador com dados, condições, ASO, recibos e histórico em abas ou seções autorizadas. | P1 | L | BK-067, BK-080, BK-084 |
| BK-090 | Implementar edição de endereço com consulta opcional de CEP e preenchimento manual de contingência. | P1 | M | BK-084, BK-361 |
| BK-091 | Preparar entrada manual das pessoas e vínculos ativos no snapshot da competência de corte e aplicar somente encerramentos legítimos do delta pelo fluxo aprovado, sem fabricar histórico anterior ao sistema. | P2 | M | BK-081 a BK-090 |

## 13.1 Aceite do épico

- CPF duplicado na mesma empresa não cria segunda pessoa; CPF igual em outra empresa não é revelado nem misturado.
- Início das atividades e admissão formal permanecem campos e fatos distintos.
- Data de desligamento sem registro e data de demissão formal permanecem separadas.
- Colaborador encerrado sai da lista ativa por padrão, mas continua pesquisável no histórico autorizado.
- Recontratação não reabre nem reescreve o vínculo anterior.
- O histórico dentro do colaborador e a auditoria separada consultam a mesma fonte de eventos, com projeções diferentes.

---

# 14. EPC-06 — Prestadores MEI e contratos

**Objetivo:** controlar cadastro empresarial e contratos mensais de MEI, sem transformar o prestador em empregado nem criar salário por fora.

| ID | Entrega verificável | Pri. | Porte | Depende de |
|---|---|---:|:---:|---|
| BK-100 | Implementar cadastro de MEI com CNPJ, razão social, nome fantasia, endereço completo obrigatório, telefone e e-mail opcionais. | P1 | L | BK-043, BK-067, BK-361 |
| BK-101 | Validar CNPJ e unicidade por empresa, preservando o cadastro para contratos futuros sem duplicação. | P1 | M | BK-100 |
| BK-102 | Implementar contrato mensal com início, fim previsto, valor, parcela única ou duas parcelas e percentual/evento condicionais. | P1 | L | BK-100, BK-005 |
| BK-103 | Implementar primeira e última competência por D30 e os dois cortes do MEI: início até dia 15 admite adiantamento proporcional e dia 16 ou depois leva a base ao final; na última competência, `fim_aplicavel <= data_prevista_adiantamento` sem pagamento efetivo zera o adiantamento, encaminha toda a base proporcional ao final e impede pagamento/recibo do adiantamento. | P1 | L | BK-102, BK-141 |
| BK-104 | Implementar renovação contínua programável antes do fim, iniciando no dia seguinte sem inativação nem reaplicação do corte. | P1 | L | BK-102 |
| BK-105 | Implementar edição da renovação ainda futura, mudança de valor/condições por vigências contíguas e prevenção de sobreposição. | P1 | L | BK-104, BK-007 |
| BK-106 | Implementar encerramento efetivo antecipado/corrigido, preservando fim previsto e versões; efeitos financeiros já confirmados serão encaminhados à F04 quando essa integração existir. | P1 | L | BK-102, BK-007 |
| BK-107 | Implementar retorno depois de interrupção como novo contrato; proibir tratá-lo como renovação contínua. | P1 | M | BK-106 |
| BK-108 | Implementar serviço adicional positivo, avulso, integral, exclusivo de uma competência e somente no pagamento final. | P1 | M | BK-102, BK-005 |
| BK-109 | Implementar detalhe do MEI com contrato atual, vigências, competências, pagamentos, recibos e histórico autorizados. | P1 | L | BK-100 a BK-108 |
| BK-110 | Impedir campos e fluxos inexistentes no MEI: salário-base, holerite, líquido do contador, RA, salário redondo, complemento trabalhista, ASO, rescisão e nota fiscal. | P1 | M | BK-100 a BK-109 |

## 14.1 Aceite do épico

- O cadastro pode sobreviver ao encerramento; a situação operacional deriva do contrato, não de um botão de inativação manual.
- Renovação pode ser programada antes de acabar; não é necessário esperar o contrato terminar.
- Uma interrupção real encerra a continuidade e o retorno recebe nova identidade contratual.
- Alterar valor no meio da competência divide as vigências sem contar mais de 30 posições comerciais.
- O serviço adicional não participa do adiantamento e não se torna recorrente.
- Não são armazenados número ou data de nota fiscal.
- Pagamento final da base MEI deduz somente adiantamento da própria base que tenha sido efetivamente pago.
- Se o contrato MEI terminar antes ou na data prevista do adiantamento e a base ainda não tiver sido paga nesse evento, o grupo de adiantamento calcula zero, fica não aplicável, não gera recibo e toda a base proporcional segue ao final; nunca usa cancelamento por desligamento.

---

# 15. EPC-07 — Condições financeiras e vigências

**Objetivo:** manter as fontes financeiras aprovadas do empregado com vigência, histórico e regras distintas, sem calcular folha oficial.

| ID | Entrega verificável | Pri. | Porte | Depende de |
|---|---|---:|:---:|---|
| BK-120 | Implementar salário-base oficial do holerite por vigência somente quando existir admissão formal, sem gerar diferença oficial retroativa. | P1 | L | BK-081, BK-083, BK-005 |
| BK-121 | Implementar RA como valor fixo acordado fora do holerite, com início, fim opcional e versões sem sobreposição. | P1 | L | BK-081, BK-005 |
| BK-122 | Exibir `salário-base + RA` como total acordado somente quando houver salário-base formal; sem ele, exibir separadamente `base PSR + RA` como “Composição informada do período”, nunca como total acordado. | P1 | M | BK-120, BK-121, BK-128 |
| BK-123 | Implementar percentual padrão de adiantamento da empresa, inicialmente 40%, e exceção versionada por empregado. | P1 | M | BK-041, BK-081 |
| BK-124 | Implementar destino/parcela da RA: uma parcela no evento escolhido ou duas parcelas por percentual válido. | P1 | M | BK-121, BK-123 |
| BK-125 | Implementar marcador “salário redondo” sem calcular tributos e lançamento real de reembolso por evento, inclusive zero. | P1 | M | BK-081 |
| BK-126 | Implementar complemento recorrente fixo, com competência inicial, término opcional, uma ou duas parcelas e destino/percentual válidos. | P1 | L | BK-081, BK-005 |
| BK-127 | Implementar múltiplos complementos avulsos, integrais e exclusivos da competência, sem proporcionalidade diária. | P1 | M | BK-081, BK-005 |
| BK-128 | Implementar base sugerida e confirmada do período sem registro, distinta do salário-base posterior e sem RA/complementos. | P1 | L | BK-083, BK-120 |
| BK-129 | Implementar opção do período sem registro entre adiantamento + final ou 100% no final, com confirmação de que os dias não estão no oficial. | P1 | M | BK-128, BK-123 |
| BK-130 | Implementar cálculo do intervalo sem registro do início até o primeiro limite aplicável, usando D30 e limite provisório em competência aberta. | P1 | L | BK-128, BK-141 |
| BK-131 | Implementar RA proporcional na primeira competência do vínculo e no saldo da competência do desligamento; encerramento próprio da condição mantém RA integral até sua competência final inclusiva. | P1 | L | BK-121, BK-141 |
| BK-132 | Implementar edição por nova vigência, prevenção de lacunas/sobreposições indevidas e conflito por versão. | P1 | L | BK-120 a BK-131, BK-007 |
| BK-133 | Invalidar e recalcular apenas competência aberta e verba não paga quando fonte financeira mudar. | P1 | M | BK-132, BK-148 |
| BK-134 | Encaminhar efeito sobre pagamento confirmado ou competência fechada à correção F04, sem sobrescrever memória, confirmação ou recibo. | P1 | M | BK-132, BK-190 |

## 15.1 Aceite do épico

- Salário-base é o oficial do holerite; RA é o valor fora do holerite; somente os dois são editáveis como fontes do total acordado.
- Alterar salário-base registra a nova vigência para controle, mas não cria acerto porque a diferença já vem no líquido do contador.
- RA começa na data de início das atividades, mesmo que a admissão formal aconteça depois.
- Complemento recorrente pode ser indeterminado até receber competência final; complemento avulso aceita várias linhas na mesma competência.
- Complementos não têm arredondamento especial e não são proporcionais por dias.
- Reembolso é valor real informado, não cálculo de INSS, imposto de renda ou sindicato.
- Período sem registro possui fonte, grupo, destino e recibo próprios.

---

# 16. EPC-08 — Competências, cálculos e grupos financeiros

**Objetivo:** construir a visão mensal por empresa e competência, calculando somente as verbas internas aprovadas e mantendo cada participante, grupo e evento em estado próprio.

| ID | Entrega verificável | Pri. | Porte | Depende de |
|---|---|---:|:---:|---|
| BK-140 | Implementar uma competência por empresa e mês, com estados oficiais, versão e datas previstas de adiantamento/final sugeridas e editáveis. | P1 | L | BK-043, BK-005 |
| BK-141 | Implementar núcleo puro `D30`, incluindo fevereiro, mês de 31 dias, intervalos inclusivos e partilha entre vigências sem superar 30. | P0 | L | BK-005 |
| BK-142 | Materializar participantes elegíveis sem duplicar e com origem exclusiva empregado ou MEI. | P1 | L | BK-085, BK-102, BK-140 |
| BK-143 | Implementar estado individual do participante, estado da competência e indicador visual derivado “Em pagamentos”. | P1 | M | BK-140, BK-142 |
| BK-144 | Implementar criação/edição versionada do líquido oficial `K06` antes do pagamento; marcar inconsistente quando ele descontar adiantamento oficial que não foi pago nem consta no saldo inicial `K07`. | P1 | L | BK-120, BK-142 |
| BK-145 | Implementar lançamentos de competência: complemento avulso, reembolso real e serviço adicional MEI, cada qual em sua fonte correta. | P1 | L | BK-125, BK-127, BK-108, BK-142 |
| BK-146 | Calcular os grupos do empregado: oficial, RA/reembolso, complementos e período sem registro, sem somar adiantamento oficial ao líquido final. | P1 | L | BK-120 a BK-131, BK-141 a BK-145 |
| BK-147 | Calcular base contratual e serviços adicionais do MEI, distinguindo base, adiantamento terminal zerado/redirecionado, saldo da base, excedente absorvido e final. | P1 | L | BK-102 a BK-108, BK-141, BK-142, BK-145 |
| BK-148 | Implementar grupos e eventos nos estados não gerado, pendente, calculado, pronto, pago, não aplicável, cancelado por desligamento e em correção. | P1 | L | BK-146, BK-147 |
| BK-149 | Persistir componentes e memória de cálculo imutável com fórmula, entradas, vigências, posições D30, precisão e resultado. | P1 | L | BK-141, BK-146 a BK-148 |
| BK-150 | Implementar prévia, recálculo, invalidação e conferência explícita do grupo, preservando fórmula, entradas e versões. | P1 | L | BK-148, BK-149 |
| BK-151 | Implementar estado `Não aplicável` para valor zero com motivo, incluindo o adiantamento MEI zerado pelo término antes/na data prevista sem pagamento, proibindo confirmar zero ou emitir recibo. | P1 | S | BK-148 |
| BK-152 | Implementar atualização controlada de participantes e fontes antes do fechamento, preservando fatos já pagos. | P1 | L | BK-142 a BK-151, BK-190 |
| BK-153 | Implementar entrada de saldo inicial da competência de corte somente nos casos aprovados, sem criar pagamentos anteriores fictícios. | P2 | L | BK-140, BK-149 |
| BK-154 | Otimizar cálculo de até 100 participantes para a meta de cinco segundos sem cache de autorização ou consulta multiempresa. | P2 | M | BK-140 a BK-151, BK-153 |
| BK-155 | Permitir ajuste manual autorizado antes do pagamento, com permissão específica, justificativa, competência aberta, valor automático e diferença preservados, nova versão e nova conferência. | P1 | L | BK-149, BK-150 |
| BK-156 | Aplicar os destinos tardios: RA/complemento criado após adiantamento pago vai integral ao final; após final pago segue F04; serviço adicional MEI após final pago vira ajuste positivo. | P1 | L | BK-108, BK-127, BK-133, BK-145, BK-190, BK-193 |

## 16.1 Aceite do épico

- O divisor é sempre 30 porque as remunerações e contratos são mensais, independentemente de o mês possuir 28, 29, 30 ou 31 dias.
- Persistência monetária usa duas casas; cálculo interno usa precisão adicional e arredonda normalmente na terceira casa no ponto aprovado.
- Oficial final é exatamente o líquido digitado do contador; o sistema não calcula folha, tributo ou líquido.
- O corte usa a data própria da verba: admissão para oficial, início das atividades para RA/complementos/período sem registro e início do contrato para MEI.
- Na primeira competência, data até dia 15 admite adiantamento proporcional; dia 16 ou depois leva o devido aplicável ao final.
- Na última competência MEI, `fim_aplicavel <= data_prevista_adiantamento` sem pagamento efetivo prevalece sobre o corte inicial: adiantamento zero/não aplicável, base proporcional integral no final e nenhuma confirmação ou recibo de adiantamento.
- Confirmar ou conferir um grupo não muda os demais.
- Uma mudança de fonte preserva a memória anterior quando já houver fato confirmado.
- Ajuste manual não sobrescreve o automático: ambos, a diferença, o motivo e o autor ficam preservados; depois do pagamento, a correção obrigatoriamente usa F04.

---

# 17. EPC-09 — Confirmação e pagamento

**Objetivo:** registrar o que foi efetivamente pago, de forma independente por participante, grupo e evento, individualmente ou em lote atômico.

| ID | Entrega verificável | Pri. | Porte | Depende de |
|---|---|---:|:---:|---|
| BK-170 | Implementar painel por competência com seleção de adiantamento ou pagamento final e situação individual de cada grupo. | P1 | L | BK-143, BK-148 |
| BK-171 | Implementar prévia autorizada e congelada da confirmação, com total, itens elegíveis, impedimentos e resumo por participante. | P1 | L | BK-149, BK-150 |
| BK-172 | Implementar confirmação individual integral com data efetiva obrigatória e não futura. | P1 | L | BK-007, BK-029, BK-171 |
| BK-173 | Confirmar separadamente oficial, RA/reembolso, complementos, período sem registro e contrato MEI. | P1 | L | BK-146 a BK-150, BK-172 |
| BK-174 | Impedir pagamento parcial dentro do mesmo participante, grupo e evento, sem impedir que grupos diferentes sejam pagos em momentos diferentes. | P1 | M | BK-172, BK-173 |
| BK-175 | Registrar datas efetivas independentes de adiantamento e pagamento final e manter a data prevista apenas como referência. | P1 | M | BK-140, BK-172 |
| BK-176 | Implementar lote para o mesmo grupo e evento, removendo impedidos conhecidos antes do envio e congelando até 100 candidatos elegíveis. | P1 | L | BK-171, BK-172 |
| BK-177 | Confirmar o lote elegível em modo todos-ou-nenhum, com locks em ordem canônica e rollback integral se um item perder elegibilidade. | P1 | L | BK-007, BK-176 |
| BK-178 | Criar uma confirmação, auditoria e recibo aplicável por participante no lote, sem transformar o lote em um único pagamento. | P1 | L | BK-006, BK-177, BK-210 |
| BK-179 | Implementar consulta idempotente do resultado individual depois de perda de conexão, impedindo repetição cega e duplicidade de número. | P0 | L | BK-007, BK-172 |
| BK-180 | Implementar cancelamento administrativo somente no ramo e estado permitidos, com justificativa e preservação do fato anterior. | P1 | M | BK-172, BK-190 |
| BK-181 | Implementar checklist de fechamento: todos os grupos aplicáveis resolvidos, sem correção, lote ou documento bloqueador. | P1 | L | BK-148, BK-172 a BK-180 |
| BK-182 | Implementar fechamento explícito e reabertura por master ou permissão específica, com reautenticação/justificativa aplicáveis. | P1 | L | BK-029, BK-070, BK-181 |
| BK-183 | Bloquear mutação ordinária em competência fechada e encaminhar correção ao fluxo aprovado. | P1 | M | BK-182, BK-190 |
| BK-184 | Estender a reconciliação de resposta incerta à confirmação em lote, recuperando o resultado atômico sem repetir candidatos. | P1 | M | BK-177, BK-179 |

## 17.1 Aceite do épico

- “Salário”, RA e complementos podem ser confirmados em momentos separados; confirmar um não confirma os outros.
- Adiantamento pode ser confirmado antes do fechamento; pagamento final depende de cálculo e conferência, não de fechamento prévio.
- Fechamento ocorre depois de todos os pagamentos e resoluções exigidos, não antes deles.
- Clique repetido, repetição de rede ou resposta perdida não duplica pagamento, auditoria ou recibo.
- Um conflito surgido dentro do lote produz zero confirmações daquele lote.
- O lote não chama PDF, armazenamento ou provedor externo dentro da transação financeira.
- Cada valor efetivamente pago conserva a própria data, memória, ator e correlação.

---

# 18. EPC-10 — Correções, ajustes e diferença absorvida

**Objetivo:** corrigir fatos financeiros sem apagar, reduzir silenciosamente ou reescrever o que já foi pago e documentado.

| ID | Entrega verificável | Pri. | Porte | Depende de |
|---|---|---:|:---:|---|
| BK-190 | Implementar abertura idempotente da jornada F04 por empresa, competência, participante, grupo e evento, com motivo e impacto. | P1 | L | BK-172, BK-149 |
| BK-191 | Implementar preparação descartável antes do cancelamento e correção persistente/retomável depois do cancelamento administrativo. | P1 | L | BK-190 |
| BK-192 | Apurar por verba o valor pago, novo devido e diferença, preservando memória, confirmação e recibo anteriores. | P1 | L | BK-149, BK-191 |
| BK-193 | Implementar ajuste positivo pendente, confirmação própria e recibo somente depois do pagamento efetivo. | P1 | L | BK-192, BK-172, BK-210 |
| BK-194 | Implementar diferença negativa como “absorvida pela empresa”, sem cobrança, desconto futuro, pendência ou recibo. | P1 | M | BK-192 |
| BK-195 | Implementar cancelamento/substituição do recibo afetado e nova versão ligada à mesma correção. | P1 | L | BK-192, BK-218 |
| BK-196 | Impedir mais de uma correção aberta para a mesma chave financeira e bloquear fechamento enquanto estiver aberta. | P1 | M | BK-190, BK-181 |
| BK-197 | Implementar correção do oficial mensal e da rescisão apenas pelo ramo autoritativo do contador, sem ajuste ou recibo interno. | P1 | M | BK-144, BK-234 |
| BK-198 | Implementar histórico completo da correção e reconciliação após resposta incerta, sem compensação silenciosa entre verbas. | P1 | M | BK-179, BK-190 a BK-196 |

## 18.1 Aceite do épico

- Pagamento confirmado nunca é sobrescrito nem fisicamente desfeito.
- Correção trabalha por verba; saldo de uma verba não compensa outra automaticamente.
- Erro favorável ao participante é absorvido pela empresa e não vira ajuste negativo.
- Ajuste positivo somente fica pago quando sua confirmação própria for concluída.
- Documento anterior continua íntegro, numerado e consultável conforme permissão.
- Repetir a correção não cria dois ajustes, duas diferenças ou duas substituições.

---

# 19. EPC-11 — Recibos, arquivos e lotes documentais

**Objetivo:** emitir documentos internos separados, íntegros e privados sem transformar a geração do PDF em autoridade do pagamento.

| ID | Entrega verificável | Pri. | Porte | Depende de |
|---|---|---:|:---:|---|
| BK-210 | Implementar modelo lógico de recibo, numeração anual única por empresa e semente anual pós-delta: autoridade persistida `ENT-IMP-01/02/03/04/05`, entrada ativa não nula e irreversível, manifesto+entrada+empresa+ano/janela, conteúdo/reconciliação com hashes distintos, decisões pessoais, autorização efêmera, inelegibilidade append-only, guarda `ProductionGo`/`authority_epoch`, registro externo CAS, concorrência fechamento×semente/`GO`×emissão/delta×`GO`, reserva atômica e fence durável `PENDENTE_RECONCILIACAO → CTL-REC-001 → RECONCILIADA` para a primeira faixa real. | P1 | L | BK-006, BK-009, BK-067, BK-172 |
| BK-211 | Implementar prévia sem número e com marca textual `PRÉVIA — PAGAMENTO NÃO CONFIRMADO`. | P1 | M | BK-171, BK-210 |
| BK-212 | Implementar snapshot imutável de empresa, logo, participante, documento, competência, evento, itens, total, datas e versão. | P1 | L | BK-041, BK-149, BK-210 |
| BK-213 | Implementar recibos separados do empregado para RA/reembolso, complementos e período sem registro, por adiantamento e final. | P1 | L | BK-173, BK-210 a BK-212 |
| BK-214 | Implementar recibos MEI separados para adiantamento contratual e pagamento final, detalhando serviços adicionais apenas no final. | P1 | M | BK-173, BK-210 a BK-212 |
| BK-215 | Implementar o tipo e snapshot de recibo próprio do ajuste positivo, reutilizando todo o conteúdo obrigatório comum. | P1 | M | BK-193, BK-210 a BK-212, BK-216 |
| BK-216 | Implementar total numérico e por extenso, número, razão social/CNPJ, nome/documento, competência, emissão e assinatura manual somente do participante. | P1 | M | BK-212 a BK-214 |
| BK-217 | Gerar PDF em worker isolado a partir do snapshot, com hash, arquivo privado e sem desfazer pagamento em caso de falha. | P1 | L | BK-008, BK-009, BK-212 |
| BK-218 | Implementar estados de recibo prévia, vigente, cancelado, substituído e substituto vigente, sem reutilização de número. | P1 | L | BK-210 |
| BK-219 | Implementar reimpressão e regeneração do mesmo snapshot sem novo número, auditando tentativa e resultado. | P2 | M | BK-217, BK-218 |
| BK-220 | Implementar visualização/download indivisível com revalidação de sessão, empresa, objeto, campos, permissão e hash antes do primeiro byte. | P1 | L | BK-009, BK-067, BK-217 |
| BK-221 | Implementar lote documental assíncrono em PDF consolidado ou ZIP, todos-ou-nenhum diante de mudança ou perda de acesso. | P2 | L | BK-008, BK-217, BK-220 |
| BK-222 | Bloquear recibos de salário oficial, líquido do holerite, rescisão oficial, diferença absorvida e evento de valor zero. | P1 | S | BK-210 a BK-221 |
| BK-223 | Cumprir meta de recibo individual de até cinco segundos ou apresentar processamento assíncrono observável sem duplicação. | P2 | M | BK-217, BK-220 |
| BK-224 | Implementar o tipo e snapshot de recibo próprio do acerto complementar de desligamento sobre RA, reutilizando todo o conteúdo obrigatório comum. | P1 | M | BK-210 a BK-212, BK-216, BK-238 |

## 19.1 Aceite do épico

- Recibo do adiantamento e recibo do pagamento final podem ser gerados no momento de cada evento confirmado.
- RA/reembolso e complementos permanecem em documentos separados; período sem registro também possui documento próprio.
- Falha de PDF não reverte pagamento e não libera o número para reutilização.
- Logo fica no cabeçalho; a marca d’água da prévia é textual e não substitui o logo.
- Assinatura da empresa não existe; o campo é somente para assinatura manual do participante.
- Documento definitivo não expira em 24 horas; essa regra é exclusiva de exportação e lote temporário.
- Sem acesso atual a todo o conteúdo, o servidor não fornece uma versão parcial do recibo.
- A semente anual só pode ser definida uma vez depois do congelamento, dos deltas finais e das aprovações DP/Contábil atuais, antes do primeiro número interno, por operador nominal com manifesto+empresa+ano em janela aberta e autorização curta efêmera não atribuível por perfil; fechamento/`GO/NO-GO` revoga o restante, e tentativa pós-janela ou ano divergente produz zero efeito. Para chaves da implantação, `FECHADO_RECONCILIADO` sem `ProductionGo` do manifesto exato também produz zero emissão.
- Duas definições concorrentes, uma definição concorrente com a primeira emissão, valor regressivo ou colisão confirmam no máximo uma intenção válida e jamais duplicam ou reutilizam número.

---

# 20. EPC-12 — Desligamentos e acerto complementar de RA

**Objetivo:** encerrar o vínculo na data correta, separar valores do contador das verbas internas e calcular exclusivamente o acerto complementar da RA.

| ID | Entrega verificável | Pri. | Porte | Depende de |
|---|---|---:|:---:|---|
| BK-230 | Implementar programação independente do financeiro: demissão formal exige admissão; desligamento sem registro exige ausência de admissão; tipos são mutuamente exclusivos e não há campo de motivo. | P1 | L | BK-083, BK-085 |
| BK-231 | Implementar aviso trabalhado, indenizado ou não aplicável, com validações conforme o tipo de saída. | P1 | M | BK-230 |
| BK-232 | Implementar correção e cancelamento simples somente enquanto futuro e sem efeitos; depois, encaminhar à correção auditada. | P1 | L | BK-230, BK-190 |
| BK-233 | Manter o vínculo ativo até o último dia e inativá-lo automaticamente no dia seguinte, sem depender de pagamento ou ASO. | P1 | M | BK-230, BK-085, BK-008 |
| BK-234 | Implementar rescisão oficial informada pelo contador, positiva ou zero/não aplicável, separada do líquido mensal, com confirmação e data próprias, sem cálculo nem recibo interno. | P1 | L | BK-140, BK-172, BK-230 |
| BK-235 | Implementar decisão do adiantamento final: cancelar antes/na data se não pago; preservar se pago; após a data prevista e ainda não pago, exigir escolher pagar atrasado ou cancelar/encaminhar. | P1 | L | BK-148, BK-172, BK-230 |
| BK-236 | Deduzir adiantamento efetivamente pago somente da mesma verba; excedente se torna diferença absorvida, nunca cobrança. | P1 | M | BK-194, BK-235 |
| BK-237 | Implementar parâmetros confirmados do acerto de RA: valor vigente na saída, aviso, avos e existência de férias vencidas. | P1 | L | BK-121, BK-230, BK-231 |
| BK-238 | Calcular saldo proporcional de RA, aviso indenizado, 13º, férias proporcionais/vencidas e um terço, sem dobra, preservando a memória automática. | P1 | L | BK-141, BK-237 |
| BK-239 | Excluir do cálculo salário-base, complemento, reembolso, período sem registro e rescisão oficial; aviso trabalhado não cria linha adicional. | P1 | M | BK-238 |
| BK-240 | Implementar conferência, confirmação e recibo próprios do acerto complementar de RA, independentes da rescisão oficial. | P1 | L | BK-172, BK-224, BK-238, BK-239, BK-248 |
| BK-241 | Evitar RA mensal integral paralela na competência final; usar apenas o saldo proporcional devido no acerto e descontar RA já paga. | P1 | L | BK-146, BK-235 a BK-240 |
| BK-242 | Criar ou atualizar atomicamente a pendência de acompanhamento de ASO demissional na demissão formal. | P1 | M | BK-230, BK-250 |
| BK-243 | Manter complementos e período sem registro nos grupos mensais próprios, sem incluí-los no acerto de RA. | P1 | M | BK-146, BK-230, BK-239 |
| BK-244 | Implementar visão única D03 acessível por Colaboradores e pela competência, sem duplicar fonte cadastral ou financeira. | P1 | L | BK-089, BK-170, BK-230 a BK-243 |
| BK-245 | Se a programação não tiver competência correspondente, registrar situação financeira “Aguardando criação” sem bloquear nem desfazer o desligamento cadastral. | P1 | M | BK-230 |
| BK-246 | Quando RA/reembolso positivo estiverem juntos, retirar somente a RA para o acerto e manter o reembolso real devido no evento mensal de origem. | P1 | M | BK-125, BK-235, BK-241 |
| BK-247 | Se a demissão formal for informada depois do oficial mensal pago, preservar o pagamento e trocar somente a obrigação oficial vigente pela rescisão, usando reconciliação/correção. | P1 | L | BK-197, BK-234, BK-235 |
| BK-248 | Permitir ajuste manual autorizado do acerto de RA antes do pagamento, preservando automático, manual, diferença, justificativa e nova conferência; depois de pago, usar F04. | P1 | L | BK-155, BK-238 |

## 20.1 Aceite do épico

- Saída no dia 10, antes do adiantamento, não cria adiantamento: o evento aplicável é cancelado e o acerto segue as regras proporcionais.
- Se o adiantamento da RA já tiver sido pago, ele permanece registrado e somente seu valor é deduzido do saldo de RA devido.
- Valor oficial da rescisão vem do contador e permanece visível separadamente do cálculo feito pelo sistema.
- O acerto usa sempre a RA vigente na data real da saída.
- Não existe cálculo em dobro de férias sobre RA e não existe reembolso no acerto complementar.
- A programação pode ocorrer sem competência criada ou dados financeiros completos; essas ausências geram pendências, não impedem o fato cadastral.
- Rescisão oficial e acerto de RA possuem confirmações e datas efetivas independentes.
- Reembolso real positivo não migra ao acerto de RA: permanece no evento mensal que o originou.
- Inativação cadastral não espera quitação financeira nem exame demissional.
- Desligamento sem registro não cria rescisão oficial nem ASO demissional.

---

# 21. EPC-13 — ASO e clínicas compartilhadas

**Objetivo:** controlar acompanhamento e informações mínimas de ASO para empregados, com resultado sensível, versões e alertas, sem armazenar o documento físico ou conteúdo clínico livre.

| ID | Entrega verificável | Pri. | Porte | Depende de |
|---|---|---:|:---:|---|
| BK-250 | Implementar acompanhamento de ASO separado do exame, nos estados pendente, agendado, realizado, não compareceu, encerrado sem realização e cancelado. | P1 | L | BK-081, BK-067 |
| BK-251 | Implementar tipos admissional, periódico, retorno ao trabalho, mudança de riscos ocupacionais e demissional. | P1 | S | BK-250 |
| BK-252 | Implementar catálogo global compartilhado de clínicas com razão social, nome fantasia, CNPJ globalmente único, situação, versão e auditoria. | P1 | L | BK-049, BK-067 |
| BK-253 | Impedir que o catálogo de clínica revele empresas, empregados ou exames que a utilizaram. | P0 | M | BK-252 |
| BK-254 | Permitir somente clínica ativa em novo exame e gravar snapshot imutável dela dentro de cada versão; inativação posterior não altera o passado. | P1 | M | BK-252, BK-250 |
| BK-255 | Implementar exame com data não futura, vencimento sugerido de 12 meses e editável quando aplicável, sempre igual ou posterior ao exame, resultado e versão. | P1 | L | BK-251, BK-254 |
| BK-256 | Implementar unicidade do admissional vigente por vínculo; repetição direciona à retificação. | P1 | M | BK-255 |
| BK-257 | Permitir periódicos, retornos e mudanças de risco repetidos como novas ocorrências válidas. | P1 | M | BK-255 |
| BK-258 | Implementar retificação por nova versão, preservando substituída/invalidada e elegendo uma única referência vigente. | P1 | L | BK-006, BK-007, BK-255 |
| BK-259 | Implementar resultado Apto, Apto com restrição e Inapto, cifrado e revelado somente por ação cumulativamente autorizada e auditada. | P0 | L | BK-066, BK-067, BK-255, BK-325 |
| BK-260 | Derivar separadamente acompanhamento, resultado, restrição e prazo; nunca condensar esses eixos em um único status. | P1 | M | BK-250, BK-255, BK-259 |
| BK-261 | Implementar referência de prazo: admissional antes do primeiro periódico e periódico vigente mais recente depois dele. | P1 | L | BK-251, BK-258 |
| BK-262 | Materializar alerta em 30 dias e vencimento por rotina idempotente, ignorando versão substituída e vínculo inativo. | P1 | L | BK-008, BK-261, BK-281 |
| BK-263 | Implementar não comparecimento sem criar exame/resultado; somente acompanhamento demissional pode ser encerrado sem realização, com permissão e justificativa. | P1 | M | BK-250, BK-251, BK-029 |
| BK-264 | Manter pendência demissional até exame realizado ou encerramento autorizado; cancelamento do desligamento cancela somente a pendência ativa. | P1 | L | BK-242, BK-250, BK-263 |
| BK-265 | Implementar lista/controle de ASO e visão no colaborador com filtros, prazos e campos autorizados. | P1 | L | BK-089, BK-250 a BK-263 |
| BK-266 | Proibir armazenamento de PDF/imagem, diagnóstico, CID, médico, CRM e descrição de restrição. | P0 | M | BK-255, BK-259 |
| BK-267 | Permitir demissional somente para desligamento formal, sem campo de vencimento; exame anterior à saída gera aviso, nunca dispensa automática ou grau de risco. | P1 | M | BK-230, BK-251, BK-255 |
| BK-268 | Implementar invalidação autorizada e justificada: preservar a versão, reabrir acompanhamento e promover referência anterior válida ou resolver o alerta. | P1 | L | BK-250, BK-258, BK-261, BK-262 |
| BK-269 | Validar admissional somente com admissão formal e avisar se sua data diferir do início; demais tipos não podem anteceder o início das atividades. | P1 | M | BK-083, BK-251, BK-255 |
| BK-270 | Implementar unicidade do demissional vigente por desligamento formal; repetição para o mesmo desligamento direciona à retificação. | P1 | M | BK-242, BK-255, BK-267 |

## 21.1 Aceite do épico

- `Agendado` é apenas estado operacional da V1, sem data, hora, local ou envio ao colaborador.
- Não comparecimento não faz a pendência sumir com o tempo; ela só termina por realização ou encerramento autorizado.
- Resultado oculto também desaparece de filtro, ordenação, total, histórico e Excel.
- “Apto com restrição” registra somente o resultado; não existe texto da restrição.
- Clínica inativada não altera o snapshot histórico gravado no exame.
- Demissional não tem vencimento futuro; orientação empresarial mantém o exame necessário sem cálculo de dispensa por grau de risco.
- Admissional depende de admissão formal; diferença em relação ao início das atividades é avisada sem apagar a distinção entre as duas datas.
- O papel físico do ASO continua guardado fora do sistema pela empresa.

---

# 22. EPC-14 — Central de notificações internas

**Objetivo:** apresentar pendências operacionais autorizadas no sino e em um item próprio do menu, sem transformar leitura em resolução nem enviar mensagens externas.

| ID | Entrega verificável | Pri. | Porte | Depende de |
|---|---|---:|:---:|---|
| BK-280 | Implementar item de menu, central e sino da empresa ativa, exibidos somente com permissão. | P2 | M | BK-043, BK-067 |
| BK-281 | Implementar ocorrência operacional deduplicada, vinculada à origem, com estados ativa e resolvida. | P1 | L | BK-006, BK-008 |
| BK-282 | Implementar leitura individual lida/não lida e ação “Marcar visíveis como lidas” somente para IDs autorizados da página atual. | P2 | M | BK-281 |
| BK-283 | Resolver a mesma ocorrência quando a origem for resolvida e criar nova ocorrência quando a condição voltar. | P2 | M | BK-281 |
| BK-284 | Reabrir como não lida quando a urgência aumentar, sem duplicar a obrigação. | P2 | M | BK-281, BK-282 |
| BK-285 | Calcular contador depois de empresa, origem, campo e autorização; retirada de permissão remove item e contagem imediatamente. | P2 | L | BK-067, BK-280 a BK-284 |
| BK-286 | Reautorizar o link contextual antes de revelar a origem e tratar destino inexistente, resolvido ou sem acesso de forma neutra. | P2 | M | BK-285 |
| BK-287 | Ordenar urgentes/vencidas primeiro e manter notificações resolvidas por 90 dias. | P2 | M | BK-281 a BK-286 |

## 22.1 Aceite do épico

- Marcar como lida não resolve a obrigação.
- Sino conta somente ocorrências ativas, não lidas e atualmente autorizadas.
- Troca de empresa limpa lista, contador, filtros e retornos anteriores.
- Atualização periódica do sino não renova sessão.
- Notificação não contém CPF, CNPJ desnecessário, salário, RA, resultado ou restrição clínica.
- Não existem exclusão, comentário, atribuição, adiamento, e-mail, SMS, WhatsApp ou mensagem geral na V1.

---

# 23. EPC-15 — Exportações em Excel

**Objetivo:** exportar dados autorizados diretamente de cada tela de origem, em arquivo temporário privado e seguro.

| ID | Entrega verificável | Pri. | Porte | Depende de |
|---|---|---:|:---:|---|
| BK-300 | Implementar a primeira ação de exportar na tela de colaboradores, sem criar menu de exportações, como fatia vertical do mecanismo comum. | P2 | L | BK-080 |
| BK-301 | Capturar pedido e snapshot de filtros, ordenação, colunas, escopo, versão de autorização e solicitante. | P2 | L | BK-067, BK-300 |
| BK-302 | Gerar Excel no worker com CPF/CNPJ como texto, datas como datas, números como números e texto perigoso neutralizado. | P2 | L | BK-008, BK-009, BK-301 |
| BK-303 | Omitir campo oculto e preservar máscara em qualquer exportação, sem aceitar valor mascarado como dado original. | P2 | M | BK-066, BK-072, BK-301 |
| BK-304 | Implementar pedido, processamento, pronto, falha, indisponível e expirado, sem gerar arquivo vazio. | P2 | M | BK-301, BK-302 |
| BK-305 | Entregar arquivo somente ao solicitante, após revalidar sessão, escopo, empresa, permissões atuais e hash. | P2 | L | BK-009, BK-302, BK-304 |
| BK-306 | Expirar arquivo temporário em até 24 horas e permitir nova solicitação idempotente conforme o contrato. | P2 | M | BK-008, BK-304, BK-305 |
| BK-307 | Auditar pedido, inclusão sensível, conclusão, falha, expiração e download sem registrar o conteúdo exportado. | P2 | M | BK-006, BK-303 a BK-306 |
| BK-308 | Cumprir meta de até 30 segundos para Excel operacional representativo e manter exportação extensa assíncrona. | P2 | M | BK-302 a BK-307 |
| BK-309 | Reutilizar o mecanismo aprovado nas telas de competência/pagamentos, ASO, clínicas e auditoria, respeitando cada fonte e permissão. | P2 | L | BK-170, BK-265, BK-252, BK-321, BK-300 a BK-308 |
| BK-310 | Na exportação de ASO, incluir somente a versão atual vigente ou invalidada identificada; resultado fica omitido por padrão e exige permissão e confirmação sensível auditada. | P2 | L | BK-259, BK-268, BK-303, BK-309 |

## 23.1 Aceite do épico

- Exportação respeita exatamente empresa, aba, filtros e campos autorizados no pedido.
- Perda de permissão depois da geração impede o download.
- Resultado do ASO fica fora por padrão e sua inclusão exige permissão atual, confirmação específica e auditoria.
- A planilha não contém fórmula de negócio recalculável nem célula executável vinda de texto do usuário.
- O resultado aparece na própria tela de origem e não gera notificação ou e-mail.
- Arquivo expirado não se torna público nem reaproveitável por outro usuário.

---

# 24. EPC-16 — Histórico e auditoria

**Objetivo:** oferecer duas projeções — histórico contextual e auditoria separada — sobre uma única fonte append-only, sempre redigida pelas permissões atuais.

| ID | Entrega verificável | Pri. | Porte | Depende de |
|---|---|---:|:---:|---|
| BK-320 | Consolidar evento de auditoria atômico para sucesso, negado, falha e cancelado aplicáveis, ligado à correlação e aos IDs de transição. | P0 | L | BK-006, BK-014 |
| BK-321 | Implementar auditoria empresarial H01, limitada à empresa ativa e aberta nos últimos 30 dias. | P1 | L | BK-043, BK-067, BK-320 |
| BK-322 | Implementar auditoria global H02 exclusiva de master apto, em escopo global e com TOTP concluído; eventos de incidente são omitidos sem ACL nominal independente. | P1 | L | BK-024, BK-049, BK-068, BK-320 |
| BK-323 | Implementar detalhe H03 somente leitura, com operação, ator, instante, resultado, alvo, correlação e mudanças permitidas. | P1 | M | BK-321 |
| BK-324 | Implementar histórico contextual dentro do colaborador e do MEI a partir dos mesmos eventos de auditoria. | P1 | L | BK-089, BK-109, BK-320 |
| BK-325 | Redigir antes/depois segundo origem, permissão atual do campo e ACL nominal de incidente; abertura sensível adicional é auditada. | P0 | L | BK-066, BK-067, BK-069, BK-320 |
| BK-326 | Implementar filtros por período, ator, ação, resultado e alvo, limitando pesquisa interativa a 366 dias. | P1 | M | BK-321 a BK-323 |
| BK-327 | Garantir que senha, token, TOTP, códigos, cookie e segredos nunca sejam eventos nem diferenças de campo. | P0 | S | BK-020 a BK-032, BK-320 |
| BK-328 | Preservar no mínimo seis anos, sem atualização ou exclusão de eventos na V1. | P2 | M | BK-320, BK-370 |
| BK-329 | Implementar acesso sensível auditado para resultado de ASO, documentos, exportações e antes/depois. | P1 | M | BK-220, BK-259, BK-303, BK-325 |
| BK-330 | Implementar exportação H01/H02 conforme EPC-15, com reautenticação adicional no global extenso. | P2 | M | BK-029, BK-300 a BK-308, BK-321, BK-322 |
| BK-331 | Comprovar que falha da auditoria obrigatória reverte a mutação de negócio, sem registro parcial. | P0 | M | BK-006, BK-320 |

## 24.1 Aceite do épico

- Histórico do colaborador fica dentro dele; histórico de MEI fica dentro do MEI; demais ações ficam na área de auditoria.
- Todos consultam a mesma fonte e não mantêm cópias divergentes.
- Usuário vê somente eventos e campos que ainda possui permissão para consultar.
- Pesquisa global não mistura dados na empresa ativa e exige master em escopo próprio.
- Alteração de nome, endereço, salário e demais campos autorizados exibe quem, quando e antes/depois permitido.
- Evento de auditoria é imutável e não pode ser corrigido destrutivamente; eventual correção cria novo evento relacionado.

---

# 25. EPC-17 — Registro restrito de incidentes

**Objetivo:** manter um registro simples e controlado de incidentes de segurança/privacidade, sem executar comunicação externa ou tomar decisão jurídica automaticamente.

| ID | Entrega verificável | Pri. | Porte | Depende de |
|---|---|---:|:---:|---|
| BK-340 | Implementar entrada em escopo restrito, independente de master e empresa ativa, com permissões nominais separadas. | P2 | L | BK-049, BK-069 |
| BK-341 | Implementar registro com datas percebida e de conhecimento, descrição, possível alcance e metadados técnicos sanitizados. | P2 | L | BK-320, BK-340 |
| BK-342 | Implementar estados aberto, em tratamento e concluído, com transições autorizadas. | P2 | M | BK-341 |
| BK-343 | Implementar linha do tempo append-only para contenção, evidência referenciada, alcance, correção, restauração, decisão e monitoramento. | P2 | L | BK-341, BK-342 |
| BK-344 | Implementar correção de informação por nova entrada relacionada, nunca alterando a entrada anterior. | P2 | M | BK-343 |
| BK-345 | Implementar avaliação jurídica/LGPD e comunicação externa somente como fatos informados, sem decisão ou envio pelo sistema. | P2 | M | BK-343 |
| BK-346 | Implementar conclusão e reabertura; reabrir exige permissão, reautenticação, justificativa e nova entrada. | P2 | L | BK-029, BK-342 a BK-345 |
| BK-347 | Implementar lista, consulta e acompanhamento redigidos para o conjunto exato de permissões restritas. | P2 | L | BK-340 a BK-346 |
| BK-348 | Proibir anexos, destinatários, disparo de comunicação e exposição automática de dados empresariais no registro. | P2 | S | BK-341 a BK-347 |
| BK-349 | Auditar acesso, alteração, negação e reabertura sem copiar a descrição integral para logs técnicos. | P2 | M | BK-320, BK-340 a BK-348 |

## 25.1 Aceite do épico

- Um master sem autorização nominal de incidente recebe negação neutra.
- Permissões de registrar, consultar, acompanhar e concluir/reabrir são independentes.
- Contextos empresarial, global e de incidente não coexistem implicitamente.
- O sistema registra comunicações externas que já ocorreram, mas não envia comunicação.
- Responsáveis nominais e substitutos do plano poderão ser definidos antes da produção sem mudar o modelo funcional.

---

# 26. EPC-18 — Operação, carga inicial e endurecimento para produção

**Objetivo:** transformar as fatias homologadas em um candidato de liberação reproduzível, recuperável, observável e seguro.

| ID | Entrega verificável | Pri. | Porte | Depende de |
|---|---|---:|:---:|---|
| BK-360 | Definir a separação lógica e provisionar desenvolvimento/homologação independentes; a produção física só será criada depois da escolha de hospedagem. | P0 | L | BK-002, BK-013 |
| BK-361 | Implementar portas substituíveis para CEP, e-mail, objetos e telemetria, com contingência segura e sem acoplar fornecedor ao domínio. | P0 | M | BK-001, BK-008, BK-009, BK-012 |
| BK-362 | Escolher fornecedores e provisionar produção separada — hospedagem/região, e-mail, CEP, objetos, chaves e observabilidade — dentro dos requisitos aprovados. | P2 | L | BK-360, BK-361 |
| BK-363 | Criar fixture sintética versionada e incremental: começa com bootstrap dos dois masters, modelo empresarial global e três empresas, depois perfis e isolamento, e recebe os estados de cada etapa quando o módulo existir. | P0 | L | BK-003, BK-014, BK-077 |
| BK-364 | Completar a fixture volumétrica com 65 ativos, mais de 300 inativos, 100 participantes, fevereiro, mês de 31 dias, dias 15/16 e dez usuários concorrentes. | P2 | M | BK-363, MAR-05 |
| BK-365 | Executar análise estática, dependências, imagem, segredos, DAST autenticado e revisão independente de segurança. | P2 | L | BK-013, BK-360 |
| BK-366 | Consolidar e validar o endurecimento de produção: TLS, CSP, CSRF, cookies, limites, uploads, criptografia, KMS, rede privada e privilégios de banco/objetos. | P2 | L | BK-004, BK-009, BK-010, BK-362 |
| BK-367 | Medir p95, consultas, conexões, CPU, memória, filas e metas aprovadas com a fixture representativa depois de MAR-05. | P2 | L | BK-364, MAR-05 |
| BK-368 | Configurar backup/PITR/cópia isolada e restaurar o sistema inteiro — banco, objetos, inventário/hashes, chaves recuperáveis e numeração — dentro do RPO/RTO. | P2 | L | BK-362 |
| BK-369 | Configurar alertas operacionais, painéis técnicos, runbooks e triagem sem reutilizar a central funcional de notificações. | P2 | L | BK-012, BK-360, BK-362 |
| BK-370 | Implementar retenção mínima de seis anos e documentar a política de arquivamento/eliminação posterior, sem eliminação automática geral na V1. | P2 | M | BK-360 |
| BK-371 | Preparar carga manual e plano de controle em uma ordem vinculante: bootstrap/masters; modelo; empresas; demais modelos/perfis; `CTL-IMP-001/PREPARAR → DECIDIR_ESCOPO → PROMOVER`, materializando manifesto `APROVADO`; somente então usuários/associações nominais e capacidade `MIGRACAO_PRE_GO` vinculada ao manifesto; vínculos/contratos; condições/recorrentes; clínicas/ASO; competência/participantes; avulsos/serviços não pagos; K07/ausência; K06; `CTL-IMP-002`; ledger `REABERTO → SELADO → FECHADO_AGUARDANDO_RECONCILIACAO`; `CTL-IMP-003/DECIDIR_FINAL → FINALIZAR`; resolução das sementes; reconciliação; `CTL-IMP-004`. Persistir conteúdo selado e reconciliação em hashes distintos; usar `ENT-IMP-05`/`INVALIDAR_GO` se fato posterior tornar um terminal inelegível; provar fence delta×`GO`, entrada ativa não nula/irreversível, autoridade por época, negação pós-janela/contingência e ausência de história inventada. | P2 | L | BK-033, BK-040/041, BK-065/068/070/076, BK-091, BK-100 a BK-109, BK-120 a BK-132, BK-140/153, BK-210, BK-252 a BK-265 |
| BK-372 | Executar ao menos duas cargas secas com dados sintéticos em homologação; gerar contagem/integridade e reconciliação assinada. Dados reais entram somente na carga final controlada de produção. | P2 | L | BK-371, BK-363 |
| BK-373 | Definir responsáveis e substitutos por incidente, backup, alertas e homologações contábil, jurídica e operacional. | P2 | S | BK-369 |
| BK-374 | Definir competência inicial real, data e janela de implantação, congelamento, comunicação interna e critérios de abortar. | P2 | M | BK-372, Documento 23 |
| BK-375 | Exercitar indisponibilidade de banco, worker, armazenamento, e-mail, CEP e KMS, comprovando comportamento seguro e retomada idempotente. | P2 | L | BK-361, BK-368, BK-369 |
| BK-376 | Comprovar cobertura de 60 telas/subfluxos, 440 IDs funcionais, contratos HTTP, tarefas e perfis transacionais sem órfãos. | P2 | L | MAR-05, BK-360–375 aplicáveis, Documento 22 |
| BK-377 | Executar regressão de isolamento em todas as rotas, tarefas, arquivos, filtros, totais e reutilização de conexão/pool. | P2 | L | MAR-05, BK-364, BK-366 |
| BK-378 | Concluir acessibilidade por teclado, foco, rótulos, contraste, mensagens e estados não dependentes de cor nas 60 telas/subfluxos manifestados. | P2 | L | MAR-05 |
| BK-379 | Criar candidato de liberação com hash do artefato, versão do esquema, fixture, evidências e zero defeito crítico ou alto aberto. | P2 | L | BK-365 a BK-378, Documentos 22 e 23 |

## 26.1 Aceite do épico

- Dados reais nunca são copiados para desenvolvimento ou homologação.
- O mesmo artefato imutável homologado é promovido; produção não recompila o código.
- A aplicação continua iniciando e operando de forma segura quando um provedor opcional falha.
- Restauração é demonstrada, não apenas descrita.
- Capacidade é medida para o cenário realista da empresa, sem adicionar microsserviço, cache ou fila externa por antecipação.
- A carga inicial começa na competência escolhida; o sistema não afirma possuir fatos anteriores que não foram cadastrados.
- Vínculos e contratos ativos no snapshot entram na carga; encerramentos ocorridos depois dele entram somente pelo delta legítimo, preservando suas datas e estados reais.
- Recorrentes vigentes e avulsos de empregado/serviços adicionais MEI já conhecidos e ainda não pagos na competência inicial percorrem cálculo, conferência e pagamento normais; fato já pago entra exclusivamente por K07 e não gera recibo retroativo.
- A pré-carga guarda só candidatos em autoridade persistida. Conteúdo selado e reconciliação possuem hashes separados; decisões pessoais distintas precedem a resolução de semente/ausência/verificação. Capacidades de migração/semente são mínimas e revogadas. `ENT-IMP-05` torna tentativa inelegível sem reterminalizar; a primeira emissão inicial exige `ProductionGo` do manifesto exato e toda mutação, inclusive futura, exige autoridade corrente/época. Semente não substitui recibo, pagamento ou histórico anterior.
- ETP-11/candidato de liberação não autoriza produção sozinho: ainda exige os gates do Documento 22 e o roteiro do Documento 23.

---

# 27. Dependências e caminho crítico

## 27.1 Caminho principal

```text
ETP-00 → ETP-01 → ETP-02 → ETP-03 → (ETP-04A ∥ ETP-04B) → ETP-05
                                                              │
                                                              ▼
                            ETP-06 → ETP-07 → ETP-09 → ETP-10 → ETP-11

ETP-04A → ETP-04C → ETP-08A ──────────────────────┘
                 └────────────────────────────────────────────┐
ETP-03  → ETP-08B ────────────────────────────────────────────┴→ ETP-10
```

Leitura:

- a fundação, a identidade, o contexto e o motor de acesso são sequenciais porque toda fatia posterior depende deles;
- empregado/condições e MEI/contratos podem avançar em paralelo depois do motor de acesso;
- competência depende das duas modalidades de participante e de suas fontes financeiras;
- ASO pode avançar em paralelo ao financeiro depois da raiz do empregado e da primeira fatia de auditoria sensível;
- incidente pode avançar depois do contexto restrito e da auditoria;
- desligamento depende do empregado, de pagamento/correção/recibo e do acompanhamento demissional de ASO;
- consolidação e candidato de liberação dependem da reunião de todas as frentes.

## 27.2 Dependências funcionais obrigatórias

| Origem | Dependência | Motivo |
|---|---|---|
| Toda operação empresarial | Identidade + sessão + contexto + RLS + autorização | Sem isso não existe isolamento confiável. |
| Condição financeira | Vínculo empregado | A condição pertence a uma raiz e vigência válidas. |
| Contrato MEI | Prestador MEI | O cadastro é reutilizado; contratos não duplicam a pessoa jurídica. |
| Competência | Empregado/MEI + condições/contrato + D30 | Participante e memória dependem de fontes vigentes. |
| Pagamento | Grupo calculado, pronto e conferido | Confirmação não fabrica nem edita cálculo. |
| Recibo definitivo | Pagamento efetivamente confirmado | PDF não é fonte de verdade financeira. |
| Correção | Fato já confirmado ou documento afetado | Preserva original e cria nova cadeia. |
| Desligamento financeiro | Vínculo + competência + RA + pagamentos + recibos | Dedução só ocorre dentro da mesma verba. |
| ASO | Vínculo empregado + autorização de resultado | MEI não possui ASO. |
| Notificação | Origem materializada e autorizável | Sino não cria obrigação autônoma. |
| Exportação | Fonte concluída + snapshot de autorização + worker/arquivo | Arquivo reflete a origem e expira. |
| Histórico contextual | Auditoria append-only + permissão atual | Não existe segunda fonte editável. |
| Incidente | Contexto restrito + ACL nominal + auditoria | Master sozinho não basta. |

## 27.3 Proibições de sequenciamento

- Não criar uma etapa “todas as tabelas” antes das fatias; cada tabela nasce com o fluxo que a usa.
- Não entregar cadastro empresarial antes de RLS e teste A×B.
- Não adiar auditoria, autorização por campo, idempotência ou concorrência para uma etapa de acabamento.
- Não confirmar pagamentos antes de provar resposta incerta e repetição idempotente.
- Não gerar recibo definitivo a partir de prévia ou de valor não confirmado.
- Não iniciar carga real antes de duas cargas secas e dos Documentos 22 e 23 aprovados.
- Não selecionar fornecedor por conveniência que obrigue trocar as decisões do Documento 19.

---

# 28. Plano de desenvolvimento por etapas

Cada etapa é vertical. O “gate de saída” é cumulativo: inclui a DoD, a regressão das etapas anteriores e os gates específicos citados.

| Etapa | Entrega vertical | Entrada | Gate de saída | Demonstração obrigatória |
|---|---|---|---|---|
| ETP-00 — Baseline executável | EPC-01, base de EPC-16/18 e `BK-077` autônomo: modelo empresarial global mínimo e versionado antes da primeira empresa, sem antecipar BK-063/064/066. React, API, worker, PostgreSQL, RLS, auditoria, idempotência, outbox, arquivos, telemetria e CI reais. | Documentos 21, 22 e 23 aprovados; Documentos 18 a 20A permanecem como base técnica. | GAT-01 e GAT-02; build dos artefatos; banco real; papel web sem propriedade/`BYPASSRLS`; referências documentais e ordem `BK-014 → BK-077` válidas. | O serviço cria/versiona pelo núcleo autônomo `BK-077` um modelo global sintético; uma tela pública chama a API; uma operação sintética empresarial em A funciona, em B é negada e a tarefa repetida não duplica efeito. |
| ETP-01 — Identidade e sessão | EPC-02: login, primeiro acesso, recuperação, TOTP master, códigos, bloqueio, sessão, Minha Conta, e-mail por outbox e `BK-033` com agregado singleton/controle one-shot. A redefinição de outro master `BK-026` conclui na ETP-03. | ETP-00. | GAT-03; segredos ausentes; tokens únicos; relógio do servidor; revogação; worker de e-mail idempotente; prova de exatamente dois membros, zero acesso antecipado, ativação conjunta, consumo e replay recusado. | Simular o bootstrap: o primeiro master fica `PRONTO_AGUARDANDO_PAR` sem aptidão; o segundo provoca um único commit que ativa ambos e consome o agregado; falha/concorrência não produzem ativação parcial. Depois, master entra com TOTP, usuário comum entra sem TOTP obrigatório e recuperação própria funciona. |
| ETP-02 — Empresa e contexto | EPC-03 para master e associação sintética: cadastro no seletor, configuração, logo, lista autorizada, seleção de uma empresa, troca, contexto histórico e negação neutra. O painel completo conclui na ETP-10. | ETP-01 e `BK-077` concluído na ETP-00. | GAT-02; RLS em toda tabela empresarial; contexto ausente/divergente falha fechado; aba antiga recusada. | Master cadastra empresa a partir de um modelo mínimo válido, seleciona, troca em outra aba e vê a primeira aba perder o contexto sem revelar dados. |
| ETP-03 — Motor de acesso e administração | EPC-04 e base de EPC-17: usuários, masters, associações, `BK-065/BK-074` completos depois da existência de empresa, perfis globais/empresariais, quatro estados de campo, convite atômico, prévia e revogação. | ETP-02. | GAT-04; negação padrão; redução revoga todas as sessões; campo oculto não chega a nenhuma projeção. | Criar perfil restrito, administrar/versionar modelo global, copiar perfil independente, convidar usuário, fazê-lo selecionar empresa, provar oculto/mascarado/leitura/edição e retirar acesso durante a sessão. |
| ETP-04A — Empregado e fontes financeiras | EPC-05 e fontes/vigências de EPC-07: pessoa, vínculo, recontratação, CPF protegido, salário-base, RA, complementos, reembolso e período sem registro; inclui o núcleo D30 compartilhado. Invalidação de grupos e F04 concluem nas ETP-05/07. | ETP-03. | GAT-05 e primeira parte de GAT-06; versões e vigências sem sobreposição; concorrência recusada. | Cadastrar, alterar versão, recontratar uma fixture cujo vínculo já veio encerrado pelo fluxo oficial e rejeitar vínculo/condição sobrepostos; nenhum encerramento manual é criado. |
| ETP-04B — MEI e contrato | EPC-06: prestador, contrato, renovação, interrupção, vigências e serviços adicionais, usando o mesmo núcleo D30. A integração de efeitos já pagos conclui na ETP-07. Pode ocorrer em paralelo à ETP-04A. | ETP-03 e núcleo D30 disponível. | GAT-05 e primeira parte de GAT-06; CNPJ e contratos íntegros; renovação contínua distinta de retorno. | Programar renovação antes do fim e criar novo contrato somente após interrupção efetiva. |
| ETP-04C — Primeira exportação e auditoria | Primeira fatia de EPC-15/16 sobre colaboradores, provando snapshot, worker, arquivo privado, redigido e expirável. | ETP-04A; worker estável. | GAT-02 e GAT-08 aplicáveis; retirada de permissão impede download; fórmula de planilha neutralizada. | Solicitar Excel, retirar permissão durante o processamento e comprovar entrega negada. |
| ETP-05 — Competência, cálculo e conferência | EPC-08: competência, participantes, D30, K06, lançamentos, grupos, memória, cálculo, ajuste manual controlado e conferência. | ETP-04A e ETP-04B. | GAT-06; casos D30; valor zero; até 100 participantes em até cinco segundos. | Calcular empregado e MEI na mesma competência, ajustar campo autorizado preservando o automático e recalcular somente o que ainda pode mudar. |
| ETP-06 — Pagamento individual e primeiro recibo | EPC-09 individual + EPC-11 básico: prévia, confirmação, numeração, snapshot, PDF e download. | ETP-05; outbox/storage homologados. | GAT-07; transação financeira atômica; falha do PDF não desfaz pagamento; repetição não duplica. | Confirmar um grupo, parar o worker, provar o pagamento preservado, retomar e obter exatamente um PDF. |
| ETP-07 — Lote, fechamento, correção e cadeia documental | Restante de EPC-09, destinos tardios `BK-156`, EPC-10 exceto `BK-197`, e EPC-11: lote/reconciliação, fechamento, F04, ajuste, absorção, substituição e lote documental. | ETP-06. | GAT-06 e GAT-07; candidato alterado reverte lote; original preservado; número nunca reutilizado. | Alterar um candidato depois da prévia, obter zero pagamentos; corrigir verba paga e preservar recibo original ligado ao substituto. |
| ETP-08A — Clínicas, ASO e alertas | EPC-13 exceto a integração demissional `BK-264/267/270`, mais a origem inicial de EPC-14. Pode avançar em paralelo às ETP-05 a 07. | ETP-04A, ETP-03 e a auditoria sensível da ETP-04C. | GAT-08; clínica não revela usos; resultado cifrado/redigido; nenhum conteúdo clínico proibido; rotina temporal idempotente. | Registrar exame, negar resultado ao perfil comum, revelar com auditoria ao autorizado e materializar alerta de 30 dias. |
| ETP-08B — Incidente restrito | EPC-17. Pode avançar em paralelo após ETP-03. | ETP-03 e auditoria estável. | GAT-04 e GAT-09 aplicáveis; master sem ACL específica negado; linha do tempo imutável. | Usuário nominal registra e acompanha incidente; master não autorizado recebe negação neutra. |
| ETP-09 — Desligamento e acerto de RA | EPC-12 integrado a ASO, competência, pagamento, correção e recibo; conclui `BK-197`, `BK-245–248` e a reconciliação/unicidade demissional `BK-264/267/270`. | ETP-04A, ETP-07 e ETP-08A. | GAT-06 a GAT-08; saldo de RA nunca negativo; rescisão do contador separada; pendência demissional íntegra. | Desligar empregado com RA já parcialmente paga, gerar apenas saldo positivo e manter pendência de ASO até resolução válida. |
| ETP-10 — Consolidação operacional | EPC-14, `BK-309`, interfaces operacionais restantes de EPC-15/16, painel final, expirações, reconciliações, lotes e integrações entre módulos; retenção `BK-328` conclui na ETP-11. | ETP-04C, ETP-07, ETP-08A, ETP-08B e ETP-09. | GAT-01 a GAT-09; todos os contratos possuem responsável; notificações não ampliam acesso. | Uma origem gera notificação, abre destino autorizado, exporta, aparece em histórico redigido e é resolvida pela própria origem. |
| ETP-11 — Candidato de liberação | EPC-18: segurança, acessibilidade, capacidade, backup/restauração, falhas, carga seca, responsáveis e pacote reproduzível. | ETP-00/01/02/03, ETP-04A/04B/04C, ETP-05/06/07, ETP-08A/08B e ETP-09/10. | GAT-10; cobertura total, zero SEV-0/SEV-1, metas medidas, restauração e isolamento comprovados. | Jornada completa entre duas empresas, dez usuários, falhas controladas e restauração sem vazamento, perda indevida ou duplicação. |

## 28.1 Alocação primária dos itens

| Etapa | Itens primários ou integrações que conclui |
|---|---|
| ETP-00 | `BK-001–015`; `BK-077` autônomo concluído para permitir modelo mínimo versionado antes da primeira empresa, sem entrega parcial de `BK-063/064/066`; auditoria `BK-320/331`; fundação operacional `BK-360/361/363`. |
| ETP-01 | `BK-020–025`, `BK-027–033`. |
| ETP-02 | `BK-040–046`, `BK-048/050`. |
| ETP-03 | `BK-026`, `BK-049`, `BK-060–076`; conclui integralmente `BK-063/064/066` e os fluxos administrativos B03 de `BK-065/074` depois de existir empresa, consumindo somente o núcleo autônomo `BK-077` concluído na `ETP-00`. |
| ETP-04A | `BK-080–090`, `BK-120–132` e o núcleo compartilhado `BK-141`. |
| ETP-04B | `BK-100–110`; consome o núcleo D30 já concluído na ETP-04A. |
| ETP-04C | `BK-300–307`, `BK-321/323/325` na primeira fonte autorizada. |
| ETP-05 | `BK-133`, `BK-140`, `BK-142–151`, `BK-153–155`; integração de fontes e invalidação ainda não paga. |
| ETP-06 | `BK-170–175`, `BK-179`, `BK-210–214`, `BK-216/217`, `BK-220/223`. |
| ETP-07 | `BK-134/152/156`, `BK-176–178`, `BK-180–184`, `BK-190–196`, `BK-198`, `BK-215`, `BK-218/219`, `BK-221/222`. |
| ETP-08A | `BK-250–263`, `BK-265/266`, `BK-268/269` e o núcleo de ocorrência `BK-281` exigido pelos alertas de ASO. |
| ETP-08B | `BK-340–349`. |
| ETP-09 | `BK-197`, `BK-224`, `BK-230–248`, `BK-264/267/270`. |
| ETP-10 | `BK-047`, `BK-280`, `BK-282–287`, `BK-308–310`, `BK-322/324`, `BK-326/327`, `BK-329/330` e integrações operacionais restantes. |
| ETP-11 | `BK-091/328`, `BK-362`, `BK-364–379` e todas as evidências de liberação. |

Intervalos da tabela incluem somente IDs existentes. Quando um item possui uma base antecipada e uma conclusão posterior explicitamente citada, ele só recebe estado concluído na última etapa; antes disso a base é um habilitador técnico interno, não uma entrega falsamente concluída.

## 28.2 Regra de propriedade

Cada um dos 440 IDs do Documento 17 deverá possuir exatamente uma etapa proprietária primária. Ele pode ser exercitado novamente em regressões de outras etapas, mas não pode ficar sem dono nem ter duas implementações concorrentes.

As 33 realizações exclusivamente locais da interface pertencem às telas que as utilizam; não viram endpoints. As projeções puras permanecem funções de leitura. As dez políticas `CON-*` são gates transversais, não um módulo isolado.

---

# 29. Marcos demonstráveis

| Marco | Concluído quando | Permite |
|---|---|---|
| MAR-00 — Baseline confiável | ETP-00 aprovada. | Desenvolver domínio sobre uma base segura. |
| MAR-01 — Acesso multiempresa | ETP-01 a ETP-03 aprovadas. | Homologar usuários reais fictícios, perfis e isolamento. |
| MAR-02 — Cadastros vigentes | ETP-04A e ETP-04B aprovadas. | Homologar empregado, MEI e condições sem movimentar dinheiro real. |
| MAR-03 — Ciclo mensal completo | ETP-05 a ETP-07 aprovadas. | Simular competência, pagamentos, recibos e correções de ponta a ponta. |
| MAR-04 — Saúde e desligamento | ETP-08A e ETP-09 aprovadas. | Homologar ASO e encerramento integrado. |
| MAR-05 — Governança operacional | ETP-04C, ETP-08B e ETP-10 aprovadas. | Homologar central, exportações, auditoria e incidentes. |
| MAR-06 — Candidato de liberação | ETP-11, Documento 22 e Documento 23 aprovados. | Autorizar a decisão final de implantação; não implanta automaticamente. |

Não haverá implantação parcial em produção antes de MAR-06. As etapas anteriores são demonstradas somente em ambientes sintéticos e de homologação.

---

# 30. Paralelização segura

## 30.1 Frentes de trabalho

| Frente | Responsabilidade contínua |
|---|---|
| Plataforma e segurança | Banco, RLS, sessão, autorização, auditoria, idempotência, worker, arquivos, CI e telemetria. |
| Domínio e API | Regras, estados, fórmulas, transações, DTOs e manifesto de operações. |
| Interface | Componentes, acessibilidade, fluxos, capacidades, estados comuns e integração real com API. |
| Qualidade e operação | Fixtures, automação, regressão, segurança, desempenho, evidências, backup e runbooks. |

Essas frentes não representam camadas entregues separadamente. Elas trabalham sobre a mesma fatia vertical e se encontram no gate da etapa.

## 30.2 Pode ocorrer em paralelo

- ETP-04A e ETP-04B depois do motor de acesso.
- Núcleo puro de D30 e fixtures financeiras enquanto os cadastros estabilizam, sem integrar antes das fontes aprovadas.
- ETP-08A depois que a raiz do empregado estiver estável.
- ETP-08B depois que contexto restrito e auditoria estiverem estáveis.
- Renderizadores de PDF/Excel depois que os snapshots e contratos estiverem congelados.
- Interface e backend de uma mesma fatia depois que DTO, capacidades e critérios forem acordados.
- Testes negativos, acessibilidade e telemetria desde o início da fatia.

## 30.3 Exige proprietário único ou serialização

- catálogo de ações/campos e motor central de autorização;
- migrações, RLS e constraints da mesma tabela;
- convenções de empresa, sessão, versão, idempotência e auditoria;
- cálculo, pagamento, numeração, recibo e correção do mesmo agregado;
- contrato de outbox e mudanças incompatíveis em payload de tarefa;
- alteração da função D30, precisão ou regra de corte;
- manifesto OpenAPI e gerador de rastreabilidade.

## 30.4 Limite de trabalho em andamento

Recomenda-se que uma equipe pequena mantenha no máximo:

- uma etapa principal em integração;
- uma frente paralela de domínio independente já liberada pelo gate anterior;
- uma frente de qualidade/regressão da etapa recém-concluída.

Abrir muitas telas ao mesmo tempo aumenta o risco de regras divergentes, migrações conflitantes e autorização duplicada. O limite real será ajustado à quantidade de pessoas, mas nenhum item pode atravessar duas etapas sem decisão explícita.

---

# 31. Registro obrigatório de cada item na ferramenta de trabalho

As tabelas deste documento são o catálogo executivo. Antes de um `BK-*` entrar como `Ready`, sua ficha deverá conter:

| Campo | Conteúdo obrigatório |
|---|---|
| Identidade | `BK-*`, épico, título, prioridade, porte e etapa. |
| Resultado | Comportamento observável e usuário/ator beneficiado. |
| Interface | Tela/subfluxo, estados locais e capacidades esperadas. |
| Rastreabilidade funcional | IDs do Documento 17 e telas do Documento 16. |
| Dados | `ENT-*`, `REL-*`, `RST-*`, `PRJ-*` e `EST-*` aplicáveis. |
| Contrato | `API-*`, `OPR-*`, `DTO-*`, `AUTZ-*`, `TX-*`, `IDEM-*`, `CONC-*`, `APIAUD-*` e `JOB-*` aplicáveis. |
| Escopo | Empresarial, global, próprio usuário ou incidente restrito. |
| Proteção | Classificação dos dados e estados dos campos. |
| Dependências | Itens e gates anteriores necessários. |
| Aceite | Sucesso, negação, erro, conflito, repetição e resposta incerta aplicáveis. |
| Evidência | Testes, capturas, relatórios, logs sanitizados e hash do artefato esperados. |
| Homologação | Papel responsável; nome será definido antes do marco aplicável. |
| Risco | `RSK-*` aplicáveis, proprietário, sinal objetivo e tratamento da etapa. |

O identificador `TST-<ID funcional>` será a âncora mínima de teste. Um único ID pode exigir vários casos, mas nenhum caso substitui a cobertura dos negativos transversais aplicáveis.

---

# 32. Matriz de cobertura funcional

## 32.1 Os 18 blocos do Documento 17

| Bloco | Conteúdo | Épico proprietário | Etapa primária |
|---:|---|---|---|
| 01 | Autenticação, primeiro acesso, TOTP e sessão | EPC-02 | ETP-01 |
| 02 | Empresa, inativação e troca de contexto | EPC-03 | ETP-02 |
| 03 | Usuário, master, perfil e permissão | EPC-04 | ETP-03 |
| 04 | Pessoa, vínculo empregado e recontratação | EPC-05 | ETP-04A |
| 05 | Cadastro, contrato e vigência MEI | EPC-06 | ETP-04B |
| 06 | Condições financeiras e complementos | EPC-07 | ETP-04A |
| 07 | Competência | EPC-08 | ETP-05 |
| 08 | Grupo financeiro e evento | EPC-08 | ETP-05 |
| 09 | Confirmação e pagamento | EPC-09 | ETP-06/07 |
| 10 | Correção, ajuste e diferença absorvida | EPC-10 | ETP-07 |
| 11 | Recibo e arquivo | EPC-11 | ETP-06/07 |
| 12 | Desligamento e inativação | EPC-12 | ETP-09 |
| 13 | Acompanhamento, exame, prazo e alerta de ASO | EPC-13 | ETP-08A |
| 14 | Clínica | EPC-13 | ETP-08A |
| 15 | Notificação e leitura | EPC-14 | ETP-10 |
| 16 | Exportação | EPC-15 | ETP-04C/10 |
| 17 | Incidente | EPC-17 | ETP-08B |
| 18 | Estados comuns, concorrência, idempotência e atomicidade | EPC-01/02/04/16/18 e cada tela afetada | Transversal a ETP-00–11 |

## 32.2 Famílias de telas e subfluxos

| Família visual aprovada | Backlog principal |
|---|---|
| A01–A06 e A09 — acesso e conta | EPC-02 |
| A07, A08 e A10 — empresa e contexto | EPC-03 |
| P01 — painel | EPC-03, EPC-14 e EPC-18 |
| U01–U05 — usuários e perfis | EPC-04 |
| C01–C08 — empregado e projeções | EPC-05, EPC-07, EPC-13 e EPC-16 |
| M01–M06 — MEI e projeções | EPC-06 e EPC-16 |
| K01–K07 — competência e conferência | EPC-08 e EPC-09 |
| F01–F05 — pagamento e correção | EPC-09 e EPC-10 |
| R01–R03 — recibos e lotes | EPC-11 |
| D01–D03 — desligamento integrado | EPC-12 |
| S01–S06 — ASO e clínicas | EPC-13 |
| N01 — notificações | EPC-14 |
| H01–H03 — auditoria | EPC-16 |
| I01–I02 — incidentes | EPC-17 |

O inventário aprovado possui 60 telas/subfluxos. O gate automático deve contar as referências reais nas fichas do backlog e nos testes; esta tabela serve como mapa humano, não como substituto da verificação.

## 32.3 Baseline de rastreabilidade

O baseline a preservar contém:

- 440 IDs funcionais, sendo 436 transições e quatro regras de projeção `ASO-R*`;
- exatamente a mesma coleção de 440 IDs nos Documentos 17, 18A e 20A;
- 36 famílias `OPR-*` atualmente usadas pelo Documento 20A;
- os 14 `API-DEC-*` e todo o catálogo HTTP aprovado do Documento 20;
- os oito perfis `TX-*` e nove contratos persistidos `JOB-001` a `JOB-009`;
- entidades, relacionamentos, restrições, projeções e estados do Documento 18;
- 60 telas/subfluxos da consolidação visual.
- a matriz individual do Documento 21A, com uma única linha para cada ID funcional.

O pipeline deverá obter as quantidades diretamente de manifestos versionados. Se o catálogo evoluir por uma correção documental aprovada, o baseline muda em um único commit rastreável; números escritos neste documento não autorizam aceitar lacuna.

## 32.4 Regra de cobertura

Para cada identificador aplicável devem existir:

1. um item `BK-*` proprietário;
2. uma etapa primária;
3. a realização técnica declarada;
4. ao menos uma âncora de teste;
5. evidência de aceite quando a etapa for concluída.

O gate falha diante de ID desconhecido, órfão, duplicado como proprietário ou referenciado por nome livre sem vínculo ao manifesto.

O Documento 21A é a prova documental inicial dessa propriedade. O Documento 22 deverá converter cada âncora reservada `TST-*` em caso executável ou em composição de casos explicitamente rastreada, sem alterar silenciosamente o BK ou a etapa proprietária.

---

# 33. Gates obrigatórios

## 33.1 Catálogo

| Gate | Momento mínimo | Evidência necessária |
|---|---|---|
| GAT-01 — Integridade documental | Desde ETP-00 | Igualdade dos 440 IDs; inventários válidos; um proprietário por ID; OpenAPI e manifesto sem rota, DTO, operação, tarefa ou teste órfão. |
| GAT-02 — Isolamento multiempresa | Desde a primeira tabela empresarial | RLS default-deny, FK composta, uma empresa por transação, negação neutra A×B, pool reutilizado sem contexto residual e arquivos/tarefas isolados. |
| GAT-03 — Identidade e sessão | Saída da ETP-01 | Hash e tokens seguros, TOTP master, limites temporais, bloqueio, CSRF, rotação, revogação, reautenticação e ausência de segredos em log; bootstrap singleton cria exatamente dois pendentes, mantém ambos não aptos até o commit conjunto, consome-se uma vez e recusa concorrência/replay sem efeito parcial. |
| GAT-04 — Autorização | Saída da ETP-03 e toda etapa posterior | Ação, objeto, estado e campo no servidor; negação padrão; anti-mass-assignment; prévia vinculante; revogação imediata; incidente separado. |
| GAT-05 — Integridade cadastral e temporal | Saída das ETP-04A/04B | CPF/CNPJ, vínculos, contratos e vigências sem duplicidade/sobreposição; versões e históricos íntegros; recontratação/renovação corretas. |
| GAT-06 — Cálculo e finanças | ETP-05–09 | D30 e moeda reproduzíveis; fonte correta; grupo independente; lote atômico; fechamento completo; correção sem sobrescrita; saldo nunca cobrado indevidamente. |
| GAT-07 — Recibos e arquivos | ETP-06–09 | Número/snapshot atômicos; original preservado; PDF privado e íntegro; repetição sem duplicação; falha posterior não reverte o financeiro. |
| GAT-08 — Dados sensíveis e exportação | ETP-04C/08A/10 | Campo oculto ausente, máscara preservada, ASO cifrado/revelado com auditoria, Excel neutralizado, download reautorizado e temporário expirado. |
| GAT-09 — Governança e operação | ETP-08B/10 | Incidente restrito, auditoria append-only, notificações sem ampliação de acesso, telemetria sanitizada e rotinas temporais idempotentes. |
| GAT-10 — Liberação | ETP-11 | Cobertura total, regressão, segurança independente, desempenho, restauração, carga seca, responsáveis, fornecedores e Documentos 22/23 aprovados. |

## 33.2 Gate comum por item

Cada item concluído deve comprovar, quando aplicável:

- caso nominal;
- validação e catálogo fechado;
- permissão negada;
- empresa A versus empresa B;
- campo oculto/mascarado/somente leitura/editável;
- sessão expirada ou revogada;
- concorrência por versão ou chave natural;
- repetição idempotente;
- perda de resposta e reconciliação;
- falha da auditoria com rollback;
- falha do worker ou provedor sem desfazer o negócio;
- log sanitizado e rastreabilidade.

Marcar um caso como `N/A` exige justificativa técnica verificável. “A tela esconde o botão” nunca é justificativa para dispensar autorização do servidor.

## 33.3 Severidade de defeitos

Para não confundir prioridade de backlog com defeito, será usada a família `SEV-*`:

| Severidade | Exemplo | Regra de marco |
|---|---|---|
| SEV-0 — Crítica | Vazamento entre empresas, bypass de autorização, corrupção de histórico, pagamento/numeração duplicados ou perda irreversível. | Interrompe a etapa e bloqueia qualquer marco. |
| SEV-1 — Alta | Cálculo central incorreto, fluxo obrigatório indisponível, arquivo sensível entregue indevidamente ou restauração inviável. | Bloqueia o marco até correção e regressão. |
| SEV-2 — Média | Falha com alternativa segura que não altera integridade ou sigilo. | Deve ser corrigida ou formalmente aceita antes do candidato de liberação. |
| SEV-3 — Baixa | Ajuste visual ou de clareza sem risco de decisão errada. | Pode entrar em backlog de acabamento, com responsável. |

Nenhum marco é aprovado com `SEV-0` ou `SEV-1` aberto.

---

# 34. Qualidade, segurança, desempenho e resiliência

## 34.1 Estratégia incremental de qualidade

- Teste unitário para fórmula, guarda, projeção e transformação pura.
- Integração com PostgreSQL real para RLS, transação, constraint, lock, índice e migração.
- Teste de contrato para cada operação HTTP e tarefa.
- Teste de componente para capacidades e estados da interface.
- Teste ponta a ponta para jornadas demonstráveis de cada etapa.
- Regressão cumulativa a cada marco.
- Teste de segurança automatizado no pipeline e independente antes da produção.
- Evidência com hash do artefato, versão do esquema e versão da fixture.

SQLite, D1 ou mock de repositório não substituem os testes de integração que comprovam comportamento próprio do PostgreSQL.

## 34.2 Baseline de segurança

A liberação deverá comprovar, no mínimo:

- controles do OWASP ASVS 5.0 nível 1 e controles selecionados do nível 2 já aprovados;
- sessão opaca, CSRF, CSP, cookies seguros e mesma origem;
- Argon2id ou parâmetro vigente aprovado para senhas;
- TOTP obrigatório para master e credenciais/códigos de uso único;
- autorização central, RLS e negação por padrão;
- proteção contra IDOR/BOLA, atribuição em massa, SQL injection, XSS, SSRF, upload malicioso e enumeração;
- criptografia em trânsito e repouso, envelope para dados classificados e chaves fora do código;
- storage privado, hash antes da entrega e nenhuma URL pública permanente;
- SAST, SCA, detecção de segredo, SBOM, varredura de imagem e DAST autenticado;
- zero vulnerabilidade crítica ou alta aberta na produção; aceitação residual só pode alcançar severidade menor, com proprietário, prazo e controle compensatório documentados.

Usuários comuns continuam sem MFA obrigatório na V1. Esse risco residual já foi conscientemente aceito e recebe controles compensatórios de senha, sessão, bloqueio, revogação, menor privilégio e auditoria; não se declarará conformidade integral com nível que exija MFA para todos.

## 34.3 Metas mensuráveis

| Fluxo | Meta de homologação representativa |
|---|---|
| Login, seletor, lista e filtro comum | p95 de até 2 segundos. |
| Painel da empresa | até 3 segundos. |
| Cálculo de competência com 100 participantes | até 5 segundos. |
| Recibo individual | até 5 segundos, ou processamento assíncrono com estado visível quando necessário. |
| Excel operacional | até 30 segundos. |
| Lote longo | assíncrono, com progresso, retomada e sem bloquear sessão. |
| Concorrência inicial | dez usuários simultâneos com isolamento e metas preservados. |
| Recuperação de dados | RPO de até uma hora e RTO de até oito horas úteis. |

As metas são verificadas com RLS, autorização, auditoria e telemetria ativos. Não vale medi-las desativando controles de produção.

O Documento 22 fixa para cada medição de desempenho: início e fim do cronômetro, p95 ou limite máximo aplicável, duração/amostra, aquecimento, cache frio/quente quando houver, tempo de fila incluído ou separado, taxa de erro, concorrência, volume e perfil exato da infraestrutura. O Documento 23 define especificamente o marco inicial e o marco final da medição de recuperação que comprova o RTO. Resultado sem esse contexto não aprova o gate.

## 34.4 Ordem de otimização

Se uma meta falhar:

1. medir consulta, índice, plano, payload e N+1;
2. corrigir algoritmo, lote interno, paginação ou fronteira assíncrona;
3. ajustar pool e capacidade proporcional;
4. somente depois avaliar réplica ou componente adicional.

Microsserviço, Kubernetes, cache distribuído, busca externa ou fila externa não entram como atalho. Qualquer mudança dessa natureza exige nova decisão arquitetural baseada em métricas.

## 34.5 Disponibilidade

A meta de 99,5% mensal somente poderá ser assumida se forem contratados banco com failover automático, réplicas web em domínios de falha distintos, monitoramento externo e suporte compatível. Sem esses elementos, o sistema continua sujeito ao RPO/RTO aprovado, mas não promete formalmente 99,5%.

---

# 35. Fixture, homologação e estimativa

## 35.1 Fixture sintética comum

A mesma base versionada acompanhará todas as etapas e conterá, no mínimo:

- três empresas com configurações diferentes;
- dois masters aptos e usuários com perfis divergentes;
- campo oculto, mascarado, somente leitura e editável;
- CPF e CNPJ iguais em empresas diferentes para provar isolamento;
- 65 vínculos ativos e mais de 300 inativos;
- empregado sem registro, registrado depois, recontratado e desligado;
- MEI ativo, renovado continuamente e retornando após interrupção;
- fevereiro de 28/29 dias, mês de 31 dias e limites dos dias 15/16;
- competência com 100 participantes;
- K06, RA, complemento, período sem registro, reembolso, serviço MEI e valores zero;
- resposta perdida, repetição, conflito, correção, ajuste e diferença absorvida;
- desligamento com RA já paga e pendência demissional;
- ASO vigente, vencendo, vencido, retificado e não comparecimento;
- dez sessões concorrentes.

## 35.2 Homologação por área

| Área/papel | Foco de homologação |
|---|---|
| Engenharia e segurança | Fundação, isolamento, identidade, autorização, arquivos, observabilidade e recuperação. |
| Departamento Pessoal/operação | Cadastros, condições, competência, pagamentos, ASO, notificações e carga inicial. |
| Contábil | Entrada do líquido/rescisão do contador, D30, separação de verbas, memória e fechamento. |
| Jurídico/privacidade | Terminologia, recibos, dados mínimos de ASO, retenção e registro de incidentes. |
| Responsável de produto | Fluxos, textos, permissões, usabilidade e aceite integrado. |

Os nomes das pessoas e substitutos serão definidos antes do marco correspondente e obrigatoriamente antes da produção.

## 35.3 Pacote de aceite de uma etapa

Cada aceite registra:

- hash do artefato;
- versão do esquema e das migrações;
- versão da fixture;
- itens `BK-*` e IDs documentais cobertos;
- resultados dos testes e medições;
- defeitos e decisões residuais;
- nome/papel do homologador;
- data e conclusão aprovada ou rejeitada.

## 35.4 Estimativa de prazo

Este documento não inventa um cronograma. A estimativa será produzida assim:

1. definir quantidade de pessoas, conhecimentos e horas efetivamente disponíveis;
2. decompor qualquer item `L` que ainda tenha mais de uma intenção dominante;
3. executar ETP-00 e ETP-01 e observar capacidade real de entrega com a DoD completa;
4. estimar as etapas restantes por porte e dependência, usando a velocidade observada;
5. incluir tempo explícito de homologação, correção, fornecedor e preparação operacional;
6. apresentar faixa de confiança, não uma data única sem margem;
7. replanejar por evidência a cada marco, sem retirar teste ou segurança para “cumprir data”.

Pontos ou portes não serão convertidos mecanicamente em horas.

---

# 36. Registro de riscos da execução

| ID | Risco | Sinal objetivo | Tratamento obrigatório |
|---|---|---|---|
| RSK-01 | Escopo perder rastreabilidade | Item, tela, rota ou entidade sem ID proprietário. | GAT-01 em todo pipeline; nenhuma entrega sem ficha completa. |
| RSK-02 | Confundir protótipo com arquitetura de produção | Uso de D1/SQLite, identidade da plataforma de protótipo ou starter de publicação como fonte real. | BK-001/002 separam a base; reutilizar somente layout/componente revisado. |
| RSK-03 | Vazamento entre empresas | ID de B retorna comportamento/dado diferente do inexistente de forma reveladora; contexto sobra no pool. | RLS, FK composta, `SET LOCAL`, teste A×B em rota/tarefa/arquivo e GAT-02. |
| RSK-04 | Permissão por campo se espalhar pelas telas | Regras duplicadas, resposta contém campo oculto ou edição manual é aceita. | Motor central, capacidade única, anti-mass-assignment e GAT-04. |
| RSK-05 | Erro financeiro | Divergência em D30, corte, K06, dedução ou acerto de RA. | Núcleo puro decimal, memórias, casos dourados, homologação contábil e GAT-06. |
| RSK-06 | Duplicidade assíncrona | Repetição cria segundo pagamento, número, arquivo, e-mail ou notificação. | Idempotência, outbox, lease, chave natural, reconciliação e teste de falha. |
| RSK-07 | Documento divergir do fato | PDF mostra valor não confirmado ou regeneração muda conteúdo. | Snapshot atômico, hash, cadeia imutável e GAT-07. |
| RSK-08 | Carga inicial inconsistente | Snapshot e delta divergem; vínculo/contrato é omitido; avulso não pago vira K07; fato pago passa pelo fluxo normal; manifesto não materializa versão final dos deltas; ou semente de recibo colide/corre com o fechamento. | Duas cargas secas, autoridade persistida `ENT-IMP-*`, plano `CTL-IMP-*`, relatório por classe, reconciliação snapshot+delta/K07/semente ou ausência, corrida fechamento×semente, correção da fonte e aceite nominal. |
| RSK-09 | Backup apenas teórico | Restauração nunca executada ou excede RPO/RTO. | Exercício completo antes da produção e rotina periódica no Documento 23. |
| RSK-10 | Fornecedor ser decidido tarde | Ausência de hospedagem, e-mail, CEP, storage ou KMS na ETP-11. | Portas substituíveis desde ETP-00 e decisão obrigatória em BK-362. |
| RSK-11 | Equipe pequena sem revisão suficiente | Mudança crítica aprovada por uma única pessoa e baixa regressão. | Automação forte, revisão adicional em financeiro/segurança e teste independente. |
| RSK-12 | Risco residual de autenticação | Usuário comum sem MFA ou indisponibilidade dos dois masters. | Menor privilégio, sessão curta, bloqueio, revogação, códigos exercitados e contingência sem backdoor. |
| RSK-13 | Exposição de ASO | Resultado aparece em filtro, contador, Excel, log ou perfil sem autorização. | Cifra, revelação explícita, redigido por padrão e GAT-08. |
| RSK-14 | Histórico degradar desempenho | p95 cresce com inativos/eventos e consultas ignoram índice/período. | Medir desde ETP-04A/04B, com paginação, índices dirigidos por acesso e limite de 366 dias. |
| RSK-15 | Fechamento incompleto | Competência fecha com correção, pagamento, documento ou decisão pendente. | Checklist único de K03, teste de cada bloqueador e regressão de ETP-07/09. |
| RSK-16 | Expansão informal de escopo | Funcionalidade futura entra por “ser fácil aproveitar”. | Lista de exclusões, controle de mudança e ausência de itens MF nos marcos da V1. |
| RSK-17 | Dependência externa bloquear operação | E-mail, CEP, storage ou telemetria indisponível. | Timeout, retomada, fallback manual aplicável e ensaio BK-375. |
| RSK-18 | Otimização prematura | Introdução de cache, broker ou microsserviço sem métrica. | Ordem da seção 34.4 e nova decisão arquitetural obrigatória. |

O responsável técnico por cada risco será nomeado no início da etapa em que ele se torna ativo. Risco sem proprietário bloqueia a entrada da etapa.

---

# 37. Fora da primeira versão

Os itens abaixo não recebem prioridade `P0`, `P1` ou `P2` e não podem entrar silenciosamente em uma etapa:

- autocadastro, portal externo de colaborador ou prestador;
- aplicativo móvel nativo, PWA offline ou sincronização posterior;
- API pública, webhooks para terceiros ou painel operacional consolidado dos três CNPJs;
- controle de férias, afastamentos, licenças, ocorrências, cartão de ponto, jornada ou hora extra;
- folha oficial completa, cálculo de tributos, INSS, imposto de renda, sindicato ou líquido oficial;
- cálculo oficial da rescisão, que continua vindo do contador;
- importação de holerite, PDF, planilha ou integração com o contador;
- integração bancária, dados bancários, eSocial ou sistema de ponto;
- nota fiscal de MEI, número, data ou arquivo;
- assinatura digital, comprovante de pagamento ou upload de recibo assinado;
- arquivo, imagem ou PDF de ASO;
- diagnóstico, CID, prontuário, médico, CRM ou descrição clínica/restrição;
- grau de risco e dispensa automática de exame demissional;
- exceção individual de permissão para usuário comum fora dos perfis aprovados;
- arredondamento especial de complemento sempre para cima;
- cobrança ou ajuste financeiro negativo contra empregado/MEI por erro da empresa;
- exclusão física de histórico e eliminação automática geral;
- workflow complexo de aprovação;
- GraphQL, WebSocket, microsserviços, Kubernetes, cache distribuído, busca externa, fila externa ou multi-região ativa sem nova decisão por métricas.

Essa lista não retira nenhuma capacidade já incluída nos Documentos 16 a 20A. Ela impede apenas que assuntos expressamente descartados ou adiados sejam confundidos com pendência da V1.

---

# 38. Melhoria futura MF-01

**MF-01 — Agendamento de ASO e lembretes ao colaborador** permanece registrada para avaliação depois da V1 estável.

Pode futuramente abranger:

- data, hora, clínica/local e situação de agendamento real;
- lembrete automático ao colaborador;
- seleção entre e-mail, WhatsApp ou SMS conforme custo, confiabilidade, consentimento e cobertura;
- histórico de tentativas, entrega e falha;
- reagendamento e cancelamento;
- modelos de mensagem sem resultado clínico ou dado excessivo.

Antes de priorizá-la será necessário decidir:

- canal e fornecedor;
- base legal, consentimento quando aplicável e regras de privacidade;
- fonte e validação de telefone/e-mail do colaborador;
- custo, limites, remetente e tratamento de opt-out;
- janela de envio, repetição e escalonamento;
- mensagens permitidas e dados proibidos;
- impacto sobre contrato, segurança, incidentes e retenção.

Na V1, `Agendado` continua apenas um estado operacional sem data/local e sem comunicação externa. Nenhuma infraestrutura específica de WhatsApp ou SMS será adicionada preventivamente.

---

# 39. Definições ainda necessárias antes da produção

Não bloqueiam a aprovação deste documento, o Documento 22 nem as primeiras etapas, desde que as abstrações aprovadas sejam preservadas. Bloqueiam o candidato final ou a entrada em produção quando indicado:

1. nomes dos responsáveis e substitutos por incidentes, alertas e backup;
2. responsáveis nominais pelas homologações contábil, jurídica, operacional e de segurança;
3. plataforma, região e topologia de hospedagem;
4. provedor e remetente de e-mail transacional;
5. provedor de consulta de CEP;
6. serviço de armazenamento de objetos, KMS/segredos e destino de observabilidade;
7. meta formal de disponibilidade, janela operacional e horário de suporte;
8. parâmetros finais de backup, região/domínio da cópia isolada e agenda de ensaios;
9. classificação, acesso e retenção mínima necessária de IP e identificação de navegador nos eventos de segurança;
10. competência inicial real;
11. data e janela de implantação;
12. política de arquivamento ou eliminação depois do mínimo de seis anos;
13. conta de emergência da infraestrutura e sua custódia;
14. parâmetros e fornecedor da MF-01, somente se a melhoria for futuramente priorizada.

Já não são pendências:

- revogação por redução de acesso: serão revogadas todas as sessões dos usuários afetados;
- TOTP de master: padrão TOTP compatível com Google Authenticator;
- sessão: aviso aos 25 minutos, inatividade aos 30 minutos e limite absoluto de oito horas;
- confirmação em lote: funcionalmente todos-ou-nenhum para o conjunto elegível congelado; a fronteira técnica será provada na ETP-07 sem mudar a regra.

---

# 40. Controle de mudanças do backlog

## 40.1 Regras

- ID `BK-*` nunca é reutilizado.
- Mover item entre prioridade ou etapa não muda seu ID e exige registrar motivo e impacto.
- Divisão preserva o item original como pai e cria novos IDs; não se apaga o histórico.
- Item retirado recebe estado cancelado/substituído e referência à decisão; não desaparece.
- Dependência nova reabre a avaliação do caminho crítico e dos marcos posteriores.
- Alteração funcional atualiza primeiro o documento de autoridade e depois backlog, contratos, dados e testes.
- Substituição técnica que preserva comportamento atualiza Documento 19/20 quando afetados e repassa os gates de segurança/desempenho.
- Correção apenas editorial pode ser feita sem reabrir escopo, mas continua versionada.

## 40.2 Solicitação de nova funcionalidade

Toda proposta nova informa:

1. problema e benefício;
2. quem usará;
3. empresa/escopo e dados afetados;
4. impacto sobre estados, cálculos, permissões e histórico;
5. telas, entidades, API, tarefas, arquivos e testes;
6. dependências e riscos;
7. decisão: incluir na V1, colocar em melhoria futura ou rejeitar.

Não se inicia a implementação enquanto a decisão não estiver aprovada e rastreada.

---

# 41. Critérios de aprovação do Documento 21

O documento poderá ser aprovado quando o usuário confirmar que:

- todo `P0`, `P1` e `P2` é obrigatório para a V1; a prioridade define ordem, não opcionalidade;
- os 18 épicos cobrem todos os módulos aprovados;
- o desenvolvimento ocorrerá em fatias verticais e não por camadas isoladas;
- fundação, RLS, autorização, auditoria, idempotência e worker começam antes dos fluxos de negócio;
- o caminho crítico e as paralelizações da seção 27/30 estão adequados;
- pagamentos, grupos e recibos permanecem individualizados;
- PDF/Excel não são executados dentro da transação financeira;
- ASO e incidente podem avançar em paralelo nos pontos indicados;
- os gates impedem avançar com isolamento, cálculo, recibo ou segurança incompletos;
- não haverá estimativa de calendário antes de conhecer equipe e capacidade real;
- as exclusões da seção 37 permanecem fora da V1;
- MF-01 permanece somente como melhoria futura;
- as definições da seção 39 podem aguardar a preparação da produção;
- a estratégia completa de testes/homologação está no Documento 22 e a implantação/retorno seguro está no Documento 23;
- o Documento 21A contém exatamente os mesmos 440 IDs dos Documentos 17, 18A e 20A, cada um com propriedade e etapa únicas;
- na data desta aprovação, nenhum código de produção havia sido iniciado; o início
  somente seria autorizado após a aprovação dos Documentos 21, 22 e 23.

---

# 42. Continuidade definida na aprovação

Com os pacotes 22/22A–22D e 23/23A–23D aprovados, a continuidade definida
naquele momento foi:

1. preparar o repositório e iniciar a `ETP-00`;
2. desenvolver por etapas seguindo este Documento 21;
3. aplicar os gates e evidências do Documento 22;
4. manter `ReleaseCandidateReady`, `CutoverReady` e `ProductionGo` falsos até seus respectivos gates futuros.

---

**Situação final desta versão:** Documentos 21 e 21A aprovados integralmente pelo usuário em 22/08/2026.  
**Continuidade na data da aprovação:** preparar o repositório e iniciar a `ETP-00 — Baseline executável`; o código de produção ainda não havia sido iniciado.  
**Checkpoint posterior:** baseline em implementação controlada conforme `docs/ETP-00.md`; nenhuma implantação de produção foi iniciada.
