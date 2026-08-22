# Documento 23

## Implantação, Migração Inicial, Operação e Retorno Seguro

> **Status:** aprovado integralmente pelo usuário em 22/08/2026.  
> **Data-base:** 22 de agosto de 2026.  
> **Autoridade funcional:** Documento Mestre e Documento 17 aprovados.  
> **Dados, arquitetura e contratos:** Documentos 18, 18A, 19, 20 e 20A aprovados.  
> **Backlog, testes e gates:** Documentos 21, 21A e pacote 22/22A–22D aprovados.  
> **Anexos executáveis:** Documentos 23A, 23B, 23C e 23D.  
> **Estado na data da aprovação:** o código de produção ainda não havia sido iniciado.  
> **Checkpoint posterior:** a baseline `ETP-00` está em implementação controlada conforme `docs/ETP-00.md`; nenhuma implantação de produção foi iniciada.

---

# 1. Resultado deste documento

Este documento encerra o planejamento necessário antes da preparação do repositório e da `ETP-00`. Ele transforma as decisões já aprovadas em um plano executável para:

- preparar produção sem misturar ambientes ou dados;
- definir a competência inicial de cada empresa;
- ensaiar a carga inicial duas vezes com dados sintéticos;
- fazer a carga real manual em produção ainda fechada;
- reconciliar cadastros, condições e saldos antes da abertura;
- promover exatamente o artefato homologado;
- decidir `GO` ou `NO-GO` por critérios objetivos;
- abortar uma virada ainda não comprometida;
- distinguir rollback de aplicação, rollforward, restauração e contingência operacional;
- operar, monitorar, suportar, recuperar e auditar o sistema depois da abertura.

A aprovação deste documento autoriza apenas a preparação da base técnica e o início futuro da `ETP-00`. Ela **não** afirma que o sistema existe, que testes passaram ou que produção está autorizada.

O pacote é composto por:

- **Documento 23A — Registro de Parâmetros, Responsáveis e Prontidão Pré-Produção**;
- **Documento 23B — Caderno Executável de Carga Inicial e Reconciliação**;
- **Documento 23C — Runbook de Virada, Go/No-Go e Retorno Seguro**;
- **Documento 23D — Catálogo de Operação, Backup, Continuidade e Incidentes**.

---

# 2. Autoridade e regra de interpretação

## 2.1 Hierarquia

Em caso de divergência:

1. o Documento 17 prevalece para estados, transições, cálculos e efeitos;
2. os Documentos 18/18A prevalecem para entidades, restrições e carga de dados;
3. o Documento 19 prevalece para arquitetura, segurança, backup e observabilidade;
4. os Documentos 20/20A prevalecem para contratos e autorização;
5. os Documentos 21/21A prevalecem para ordem de desenvolvimento;
6. o pacote 22 prevalece para testes, gates e evidências;
7. este Documento 23 prevalece para implantação, operação e retorno, sem alterar as autoridades anteriores.

## 2.2 O que este documento não faz

Este documento não:

- reabre regra funcional aprovada;
- escolhe antecipadamente fornecedor ainda não contratado;
- inventa data, competência, pessoa responsável ou contagem real;
- substitui o plano operacional de incidente;
- cria importação mensal por planilha;
- autoriza dado real em desenvolvimento ou homologação;
- transforma backup em política de retenção;
- transforma `PlanningReady` em autorização de produção.

---

# 3. Escopo da primeira implantação

Entram na implantação:

- os dois masters iniciais, formados pelo bootstrap global de uso único e ativados conjuntamente;
- o modelo empresarial global inicial;
- as três empresas iniciais, suas configurações e logos, criadas depois por master apto;
- perfis, usuários e associações autorizadas;
- empregados ativos no corte;
- MEIs e contratos ativos no corte;
- condições financeiras vigentes e futuras já conhecidas;
- complementos recorrentes ainda vigentes;
- complementos avulsos de empregado e serviços adicionais de MEI já conhecidos, ainda não pagos e pertencentes à competência inicial;
- clínicas compartilhadas e somente o último ASO necessário ao controle atual;
- primeira competência de cada empresa;
- K07 exclusivamente para pagamentos reais já ocorridos nessa competência;
- parâmetros operacionais, alertas, backups, evidências e responsáveis.

Não entram:

- histórico financeiro anterior à competência inicial;
- reconstrução dos mais de 300 vínculos inativos reais;
- competências, cálculos, pagamentos ou recibos retroativos;
- PDFs ou imagens de ASO;
- importação de holerite, nota fiscal MEI ou planilha mensal;
- dados reais em desenvolvimento, CI ou homologação;
- `MF-01 — Agendamento de ASO e lembretes ao colaborador`;
- qualquer outro item já excluído da V1.

Os mais de 300 inativos permanecem apenas na **fixture sintética de capacidade**, como enriquecimento técnico fora do manifesto real. Um vínculo ou contrato ativo no snapshot e encerrado por delta antes do `GO` permanece como inativo legítimo da implantação; a exclusão atinge somente inativos históricos já encerrados antes do snapshot. Se uma pessoa ausente da base de corte voltar no futuro, ela poderá entrar como primeiro vínculo conhecido pelo sistema, conforme o Documento Mestre.

---

# 4. Glossário operacional

| Termo | Significado vinculante |
|---|---|
| Carga seca | Ensaio integral com dados exclusivamente sintéticos em homologação. |
| Carga final | Entrada dos dados reais em produção fechada e controlada. |
| Pré-carga | Parte da carga final realizada antes da virada, ainda sem tornar o novo sistema autoritativo. |
| Competência de corte | Primeira competência financeira permitida para uma empresa. |
| Fonte anterior | Controle utilizado pela empresa antes do novo sistema. |
| Fonte autoritativa | Único local que, naquele instante, vale como registro oficial da operação. |
| Snapshot da fonte | Retrato identificado do controle anterior usado para a carga. |
| Delta | Mudança legítima ocorrida na fonte anterior depois do snapshot e antes do `GO`. |
| Manifesto de carga | Autoridade técnica persistida `ENT-IMP-01/02/03/04/05`: tentativa, escopo, conteúdo selado, reconciliação, empresas+anos, decisões pessoais, inelegibilidade append-only, revogação e guarda de autoridade/`ProductionGo`. Não é planilha solta. |
| Congelamento | Período em que mudanças técnicas/configurações ficam suspensas e alterações de negócio seguem somente pelo registro de deltas aprovado. |
| Virada/cutover | Janela que aplica deltas, reconcilia, decide `GO` e muda a fonte autoritativa. |
| `GO` | Decisão binária que autoriza abrir a produção. |
| `NO-GO` | Decisão binária que mantém produção fechada e a fonte anterior autoritativa. |
| Aborto | Encerramento da virada antes do ponto de compromisso operacional. |
| Rollback de aplicação | Retorno a um artefato anterior comprovadamente compatível. |
| Rollforward | Correção para frente de código, configuração ou esquema. |
| Restauração | Recuperação de banco, objetos, chaves e metadados para um corte lógico coerente. |
| Retorno ao controle anterior | Contingência operacional formal; não é apagar fatos do novo sistema. |
| `T_GO` | Instante lógico confirmado pelo CAS externo do primeiro `GO`, quando o sistema se torna autoritativo; `T-30…T+7` e `T0` da linha do tempo são relativos a este marco. |
| `T_RET` | Instante posterior em que uma contingência formal torna o controle anterior+ledger autoritativos. |
| `T_REENT` | Instante posterior em que, após reconciliação integral, o sistema volta a ser autoritativo. |
| Efeito de compromisso | Operação empresarial autoritativa, pagamento, recibo/número, efeito externo não pertencente ao bootstrap controlado ou uso operacional do novo sistema. Pré-carga e atos allowlisted do bootstrap não contam. |
| Hipercuidado | Período de monitoramento, suporte e reconciliação reforçados após o `GO`. |

---

# 5. Estados de prontidão

| Estado | Fica verdadeiro quando | Não significa |
|---|---|---|
| `D23PlanningReady` | Documento 23 e anexos passam na validação documental e são aprovados pelo usuário. | Sistema implementado ou testado. |
| `BuildStartAuthorized` | Documentos 21, 22 e 23 aprovados; repositório pode ser preparado e a `ETP-00` iniciada. | Autorização para produção. |
| `ReleaseCandidateReady` | `ETP-11` e `GAT-10` passam com artefato imutável e evidências. | Abertura automática. |
| `CutoverReady` | Parâmetros reais, pessoas, fornecedores, cargas secas, restauração, carga final e aprovações estão completos. | `GO` antecipado. |
| `ProductionGo` | `MAR-06` e checklist pré-virada aprovados; o candidato exato de `GO` foi confirmado por CAS externo em `T_GO`, reconciliado no vínculo write-once de `ENT-IMP-04` e somente então aberto pelo protocolo fail-closed. | Dispensa de smoke ou monitoramento. |
| `LiveStabilizing` | Produção abriu e está em hipercuidado. | Operação estabilizada. |
| `Operational` | Passou o mais tardio entre: fechamento/reconciliação da competência inicial + 2 dias úteis; e primeiro adiantamento normal executado pelo sistema + 2 dias úteis, sem bloqueador aberto. | Fim das rotinas de backup, segurança ou suporte. |

Estados futuros de execução permanecem `NOT_RUN_PLANNED` neste momento. Não existe `GO condicionado`: condição pendente resulta em `NO-GO`.

---

# 6. Decisões operacionais vinculantes

1. Cada empresa possui sua própria `competencia_inicial`.
2. Recomenda-se uma única virada coordenada para os três CNPJs e, se possível, a mesma competência; diferenças precisam ser aprovadas antes do congelamento.
3. Deve-se preferir competência cujo adiantamento ainda não ocorreu.
4. Nenhum fato financeiro anterior ao corte será criado.
5. Datas históricas mínimas de cadastro podem anteceder o corte sem gerar movimentação retroativa.
6. A carga real é manual pelos formulários aprovados.
7. Utilitário técnico excepcional de implantação não vira funcionalidade do produto nem importação mensal.
8. Haverá pelo menos duas cargas secas completas e sintéticas.
9. Dados reais entram somente em produção fechada.
10. A fonte anterior continua autoritativa até o `GO`.
11. Não haverá escrita dupla silenciosa.
12. O bootstrap global de uso único cria exatamente dois masters pendentes; ambos concluem primeiro acesso e TOTP antes da ativação conjunta e de qualquer acesso operacional; depois ele se autodesabilita sem senha padrão, conta ou rota de emergência **na aplicação**.
13. Um master apto cria o modelo empresarial global inicial; somente depois um master apto cria as três empresas pelo fluxo B02/API normal.
14. Pagamento real já ocorrido na competência de corte entra somente como K07.
15. K07 não cria recibo retroativo, pagamento comum ou competência fictícia.
16. O mesmo artefato homologado será promovido por hash, sem recompilação para produção.
17. Migração de esquema usa executor único e expand/contract.
18. Contração destrutiva ocorre somente em publicação posterior, depois de comprovada a ausência de consumidores antigos.
19. RPO é de até uma hora para o sistema inteiro em um corte lógico comum.
20. RTO é de até oito horas úteis para recuperação integral.
21. Restauração integral será demonstrada antes da produção e trimestralmente depois.
22. Uma reversão nunca apaga pagamento, auditoria, recibo ou número legitimamente criado.
23. Não existe implantação funcional **em produção**, exposição de tráfego produtivo ou uso de dado real antes de `MAR-06`; o provisionamento e o hardening de infraestrutura produtiva vazia podem ocorrer antes, sem aplicação operacional nem dado real.
24. Abertura primeiro aos masters e a um grupo controlado é apenas smoke progressivo da mesma V1 completa, não implantação parcial de módulos.
25. `MF-01` não participa de preparação, gates ou infraestrutura da V1.
26. O manifesto é persistido e fechado por tentativa; fases de `CTL-IMP-001/003` separam decisão pessoal da execução técnica. Seu ID nunca reabre; fato posterior usa `CTL-IMP-004(INVALIDAR_GO)`/`ENT-IMP-05`, sem reterminalização.

---

# 7. Papéis e segregação

## 7.1 Papéis

| Código | Papel | Responsabilidade principal |
|---|---|---|
| `ROL-PROD` | Produto/direção | Autorizar escopo, risco residual e decisão final de `GO/NO-GO`. |
| `ROL-IMP` | Responsável de implantação | Coordenar janela, relógio, checklist, comunicação e aborto. |
| `ROL-ENG` | Engenharia | Artefato, compatibilidade, migração, correção e rollforward. |
| `ROL-OPS` | Operação de infraestrutura | Ambientes, publicação, telemetria, backup, restauração e capacidade. |
| `ROL-SEG` | Segurança | Isolamento, identidade, segredos, revisão independente e incidente. |
| `ROL-QA` | Qualidade | Roteiros, evidências, regressão, gates e reconciliação técnica. |
| `ROL-DP` | DP/operação funcional | Fonte, carga, conferência dos cadastros e uso funcional. |
| `ROL-CTB` | Contábil | D30, K06, K07, valores e reconciliação financeira. |
| `ROL-JUR` | Jurídico/privacidade | Recibos, ASO mínimo, retenção, incidente e uso de dados. |
| `ROL-INC` | Coordenador de incidente | Classificação, contenção, evidência, decisão e comunicação. |
| `ROL-MST` | Master funcional | Administração do produto; não administra infraestrutura. |
| `ROL-FOR` | Fornecedor | Apoio delimitado, nominal, temporário e auditado. |

## 7.2 Regras de segregação

- Uma pessoa pode acumular papéis numa equipe pequena.
- Quem implementou um risco crítico não o aprova sozinho.
- Financeiro exige revisão adicional de `ROL-CTB`.
- Segurança exige revisão independente antes da produção.
- A decisão de `GO` exige produto, implantação, operação, DP, engenharia/segurança e homologações nominais aplicáveis.
- Conta de master não concede acesso de infraestrutura.
- Conta administrativa de infraestrutura é pessoal, usa MFA e menor privilégio.
- Fornecedor nunca recebe conta compartilhada ou acesso permanente por conveniência.

A matriz nominal fica no Documento 23A e deve estar completa antes de `CutoverReady`.

Os códigos `ROL-*` e a matriz RACI distribuem trabalho e prestação de contas; **não concedem autorização no produto**. Toda ação por tela ou API continua exigindo usuário pessoal, escopo, perfil ou capacidade global válida, ação/objeto/estado/campo autorizado, versão e reautenticação quando aplicáveis, conforme os Documentos 17 e 20. Nenhum papel operacional, fornecedor ou ator técnico recebe `BYPASSRLS` por constar neste plano.

---

# 8. Ambientes e produção

## 8.1 Separação

Existem quatro finalidades separadas:

| Ambiente | Dados | Uso |
|---|---|---|
| Local | sintéticos | desenvolvimento individual |
| Testes automáticos/CI | sintéticos efêmeros | testes e validação do artefato |
| Homologação | sintéticos versionados | cargas secas, segurança, desempenho e aceite |
| Produção | reais | carga final e operação autorizada |

Banco, objetos, chaves, segredos, contas, remetentes, telemetria e backups de produção não são compartilhados com não produção.

Produção pode ser provisionada e endurecida ainda vazia para concluir `ETP-11` e `GAT-10`. Isso não autoriza implantar funcionalidade para uso, expor tráfego, entregar efeitos externos ou inserir dados reais; essas ações continuam bloqueadas pelos gates deste documento.

## 8.2 Laboratório de restauração

Um **exercício** de restauração com backup real ocorre somente num laboratório temporário que:

- não é homologação;
- tem segurança equivalente à produção;
- possui acesso nominal e mínimo;
- não tem rota pública;
- inicia com worker e agendadores desligados;
- bloqueia e-mail e demais efeitos externos;
- registra acessos;
- é eliminado com evidência depois do exercício.

Em incidente real, usa-se alvo de recuperação isolado e em quarentena, que poderá se tornar a nova produção depois das validações; esse alvo não é eliminado como laboratório.

## 8.3 Prontidão do provedor

Antes de produção, precisam estar escolhidos e comprovados:

- hospedagem, região e topologia;
- PostgreSQL e decisão entre failover automático ou restauração controlada;
- uma ou duas réplicas web, conforme disponibilidade pretendida;
- objetos privados e versionados;
- KMS/segredos;
- e-mail, domínio e remetente;
- CEP com contingência manual;
- observabilidade e monitor externo;
- cópia isolada de backup;
- repositório protegido de evidências.

Não se declarará disponibilidade de 99,5% sem duas réplicas em domínios de falha distintos, banco com failover, monitor externo e suporte compatível.

---

# 9. Registro pré-produção

Cada parâmetro do Documento 23A possui:

- ID estável;
- decisão a preencher;
- responsável e substituto;
- data-limite/gate;
- evidência;
- estado `PENDENTE`, `EM_VALIDAÇÃO`, `APROVADO` ou `REJEITADO`;
- impacto objetivo no `GO`.

Fornecedor, nome ou data ainda não conhecidos não bloqueiam a aprovação deste planejamento. Eles continuam bloqueando `CutoverReady` e produção, sem valor padrão silencioso.

---

# 10. Candidato de liberação

## 10.1 Identidade

O candidato registra:

- hash do artefato web/API/worker;
- origem e versão do código;
- SBOM e relatórios de segurança;
- versão do esquema e conjunto ordenado de migrações;
- OpenAPI e catálogos;
- versão da fixture sintética;
- configuração não secreta;
- evidências dos gates;
- compatibilidade com a versão anterior;
- procedimento de publicação e retorno.

## 10.2 Promoção

- Produção recebe o artefato homologado, sem recompilar.
- Segredos são fornecidos por mecanismo seguro e nunca entram no artefato.
- Configuração obrigatória ausente ou insegura impede inicialização.
- Migrações são executadas uma única vez por executor exclusivo.
- Aplicação somente recebe tráfego depois de prontidão e smoke técnico.
- Hash divergente resulta em `NO-GO`.

---

# 11. Competência inicial por empresa

## 11.1 Escolha

Para cada CNPJ, `ROL-DP` e `ROL-CTB` registram:

- competência proposta;
- se o adiantamento já ocorreu;
- pagamentos reais já ocorridos no mês;
- data do snapshot da fonte;
- justificativa;
- impactos de K07;
- aprovação operacional e contábil.

A mesma competência para os três CNPJs é recomendada para reduzir complexidade operacional. O modelo continua aceitando competências iniciais diferentes, desde que a decisão seja anterior à carga e nunca seja improvisada durante a virada.

## 11.2 Imutabilidade e piso financeiro

Depois da criação da empresa e do primeiro fato dependente, a competência inicial não é alterada por edição comum. O sistema recusa:

- competência anterior;
- cálculo anterior;
- pagamento anterior;
- recibo anterior;
- K07 fora da primeira competência financeira.

Datas de início, admissão, contrato ou ASO anteriores continuam permitidas apenas como contexto atual.

## 11.3 K07

K07 registra exclusivamente:

- empresa e competência de corte;
- participante;
- grupo e evento;
- valor realmente pago;
- data efetiva real;
- usuário que registrou;
- marca permanente de saldo inicial;
- versões corretivas append-only.

A origem/evidência da conferência pertence ao **manifesto restrito de implantação**, correlacionado ao K07, e não cria coluna adicional em `ENT-CPT-07/08`. Da mesma forma, a confirmação de que não houve pagamento fica no manifesto: ausência de K07 significa inexistência da entidade, nunca uma linha de valor zero.

K07:

- não emite recibo retroativo;
- não ocupa número de recibo;
- não cria confirmação normal;
- não cria competência anterior;
- não é reutilizado em contingência posterior ao primeiro `GO`;
- participa somente das deduções necessárias da competência de corte.

Antes da persistência, um candidato sem origem comprovada é omitido ou corrigido na fonte. Se a falta de origem for descoberta depois de o K07 ter sido persistido e antes do `GO`, aborta-se a carga afetada, restaura-se o baseline autorizado e repete-se carga e reconciliação; não se apaga nem se edita a linha. P09-14A é reservado à correção versionada de K07 legítimo com dado errado, não à fabricação de origem ausente.

## 11.4 Semente anual de recibos

Para cada empresa e ano, `ENT-IMP-01/02/03` registra candidato e decisão; `ENT-IMP-04` guarda autoridade/época e `ENT-IMP-05` qualquer inelegibilidade. A raiz não é inicializada antes do congelamento, deltas, `ledger_conteudo_versao/hash`, `candidato_final_versao/hash` e decisões pessoais distintas DP/Contábil. Depois, cada entrada termina em semente única, ausência dupla sem raiz ou `SEMENTE_EXISTENTE_VERIFICADA`.

A operação exige manifesto, entrada, conteúdo selado e capacidade exatos. Havendo sequência, o próximo número projetado é `semente + 1`; na ausência, `AAAA-000001`, sem raiz zero. Antes do `ProductionGo`, isso é somente projeção: não existe reserva/emissão. A primeira emissão inicial exige `go_elegivel = true`, nenhum `ENT-IMP-05`, `ProductionGo` do manifesto exato e sistema autoritativo na época corrente. Delta pré-`CTL-IMP-003` cria novo ciclo na tentativa; depois, fecha manifesto não terminal em `FECHADO_NO_GO` ou, se já reconciliado, grava `ENT-IMP-05` por `INVALIDAR_GO` sem mudar o terminal. Nova tentativa usa novo manifesto/janela; semente idêntica é `SEMENTE_EXISTENTE_VERIFICADA`, e mudança do máximo/prova após semente persistida leva o ledger a `INVALIDADO_EXIGE_NOVA_TENTATIVA`, exigindo baseline limpo.

---

# 12. Escopo exato da carga real

| Ordem | Classe | Entra | Não entra |
|---:|---|---|---|
| 1 | Bootstrap master | duas identidades pendentes; primeiro acesso/TOTP; ativação conjunta; bootstrap consumido | acesso operacional antecipado, senha padrão, conta ou rota de emergência |
| 2 | Modelo inicial | modelo empresarial global válido e versionado, criado por master apto | perfil empresarial órfão ou herança viva |
| 3 | Empresas | três empresas criadas por master apto via B02/API, CNPJ, razão social, configurações, competência inicial e logo opcional | histórico de empresa inexistente no sistema |
| 4 | Perfis/usuários | demais modelos, perfis, permissões, usuários e associações vigentes | exceção individual fora do modelo aprovado |
| 5 | Empregados | pessoas e vínculos ativos no snapshot ou encerrados legitimamente por delta | reconstrução de vínculos encerrados antes do snapshot |
| 6 | MEIs | prestadores e contratos ativos no snapshot ou encerrados legitimamente por delta | notas fiscais ou contratos encerrados antes do snapshot sem necessidade atual |
| 7 | Condições | salário-base, RA, salário redondo, percentuais, PSR e vigências atuais/futuras conhecidas | total acordado como fonte editável ou fatos antigos |
| 8 | Complementos | recorrentes ainda vigentes; avulsos e serviços adicionais já conhecidos, ainda não pagos, da competência inicial | avulsos de competência anterior |
| 9 | Clínicas/ASO | clínicas compartilhadas e último ASO necessário ao controle | arquivo, médico, CRM, CID ou descrição clínica |
| 10 | Competência | primeira competência e participantes elegíveis | competências anteriores |
| 11 | K07 | pagamentos reais já ocorridos no corte | recibos fictícios ou pagamentos presumidos |
| 12 | K06 e lançamentos | no momento operacional correto da competência | importação de holerite |

Projeções derivadas — total acordado, estados, saldos, alertas e totais — não são carregadas como fonte editável; são reconstruídas pelo domínio.

---

# 13. Proteção dos dados reais durante a carga

- A fonte auxiliar real recebe acesso nominal e mínimo.
- Planilha ou extrato temporário, se inevitável, fica cifrado e em local aprovado.
- Não é enviado por e-mail comum ou mensageria pessoal.
- Não entra em repositório, log, ticket ou evidência geral.
- Operador não copia a fonte para homologação “para testar”.
- CPF/CNPJ integral e valores aparecem somente a quem precisa executar/conferir.
- Tela compartilhada, captura e relatório usam redação quando possível.
- Fonte temporária recebe prazo curto e eliminação comprovada depois da reconciliação.
- Exposição fora do fluxo aprovado é tratada como incidente e `NO-GO`.
- Jobs funcionais, agendadores empresariais, consumo da outbox empresarial e entregas externas ficam tecnicamente bloqueados por padrão durante a pré-carga.
- As únicas exceções são o bootstrap dos dois masters e o primeiro acesso dos nomes de `PRM-030`, por allowlist de entrega com destinatário/finalidade/expiração exatos.
- Tela de pré-carga exige permissão normal mais `MIGRACAO_PRE_GO`, vinculada a identidade, manifesto, empresa, classe e ação; pode alcançar master ou usuário comum nominal, mas nunca pagamento, recibo definitivo ou efeito externo. Convites comuns não nominados ficam retidos.
- WAL/PITR, backup, cópia isolada, monitoramento, pager, alertas críticos, expiração de segurança e checkpoint de auditoria permanecem ativos durante toda a pré-carga.

---

# 14. Duas cargas secas obrigatórias

## 14.1 Carga seca 1 — descoberta

- base limpa de homologação;
- fixture exclusivamente sintética;
- ordem integral da carga;
- três empresas, dois masters, perfis divergentes e volume representativo;
- medição por etapa;
- identificação de campo ausente, duplicidade, dependência e ambiguidade;
- simulação de K07 sem usar pagamento real;
- relatório de falhas e atualização do roteiro.

## 14.2 Carga seca 2 — ensaio geral

- nova base limpa;
- roteiro corrigido e congelado;
- mesmos papéis que atuarão na carga real, sempre que possível;
- volume de 65 ativos, mais de 300 inativos sintéticos, 100 participantes e dez usuários concorrentes;
- os inativos são expansão sintética exclusiva da fixture de capacidade e não fingem integrar o manifesto real;
- simulação de snapshot, deltas, reconciliação, `GO`, `NO-GO`, aborto e contingência completa depois do compromisso;
- migração em base limpa e `n-1` compatível;
- tempo por etapa e margem operacional;
- nenhum erro material pendente;
- termo assinado por QA, DP, Contábil e Engenharia.

Uma repetição parcial não substitui uma carga seca integral. Mudança material no roteiro depois da carga seca 2 exige repetir as partes afetadas e, se alterar ordem, corte, K07 ou reconciliação, repetir o ensaio completo.

---

# 15. Pré-carga real e registro de deltas

## 15.1 Duas janelas

Para o volume atual, a implantação será dividida em:

1. **janela de carga final:** produção permanece fechada; operadores autorizados cadastram dados reais ao longo do período aprovado;
2. **janela de virada:** congela-se o controle anterior, aplicam-se deltas, reconcilia-se e decide-se `GO/NO-GO`.

Isso evita concentrar toda a digitação na noite da virada.

## 15.2 Autoridade única

Durante a pré-carga:

- a fonte anterior ainda é autoritativa;
- o novo sistema não realiza operação real;
- toda alteração na fonte anterior depois do snapshot entra no registro de deltas;
- o delta recebe empresa, classe, entidade, valor quando aplicável, data, executor, origem e identificador único;
- o delta recebe também tentativa, ciclo de aplicação, empresa+ano potencialmente afetados e classificação `NAO_AFETA_NUMERACAO`, `AFETA_NUMERACAO` ou `INDETERMINADO`; esta última é tratada como impacto de numeração;
- cada `delta_id` é aplicado no máximo uma vez por tentativa; `IMP-DAT-019` confirma no máximo uma execução bem-sucedida por tentativa+ciclo, e uma reabertura cria novo ciclo idempotente sem duplicar os deltas já aplicados;
- jobs/efeitos empresariais permanecem bloqueados; somente bootstrap e `MIGRACAO_PRE_GO` nominal executam sua allowlist; continuidade, segurança, auditoria e observabilidade continuam ativas;
- convites comuns ficam retidos; somente identidades de migração aprovadas podem concluir primeiro acesso por entrega allowlisted, sempre com token anterior invalidado;
- ninguém opera fora das ações/empresas do manifesto; a capacidade expira ou é revogada no fechamento, `NO-GO` ou troca de autoridade.

## 15.3 `NO-GO` depois de pré-carga real

O Documento 23A fixa a validade máxima da pré-carga mantida fechada. Diante de `NO-GO`, a autoridade escolhe e registra um único ramo:

1. **manter fechado por prazo aprovado:** ledger contínuo, fonte anterior autoritativa, efeitos externos bloqueados, acesso temporário mínimo e reconciliação renovada antes da nova decisão; ou
2. **descartar a tentativa:** antes de restaurar, preservar exportação append-only verificável da auditoria/checkpoints da tentativa ou arquivar a instância reprovada em somente leitura; então restaurar o baseline numa instância limpa, eliminar somente o conjunto mutável da pré-carga e os extratos temporários com evidência, correlacionar a nova tentativa e repetir todo o trecho afetado.

Mudança de fonte, esquema, roteiro ou artefato, perda da cadeia de deltas ou expiração da validade aprovada invalida a pré-carga e obriga o segundo ramo. Em ambos, acessos temporários e a capacidade efêmera de inicializar semente anual são revogados, o manifesto é fechado e extratos auxiliares recebem destino comprovado. O manifesto fechado nunca reabre: nova decisão usa outro `manifesto_carga_id` e referencia a tentativa anterior.

Se a pré-carga for mantida fechada depois de uma semente persistida, isso só é permitido sem delta que altere o maior número/prova de ausência, dentro de `PRM-028`, com zero emissão/reserva interna e efeitos empresariais bloqueados. A nova tentativa apenas verifica a semente imutável idêntica, sem nova autorização nem nova chamada de inicialização. Se a tentativa for descartada, a evidência append-only preserva manifesto, semente, auditoria e checkpoints, mas o baseline restaurado não contém os dados mutáveis da tentativa e o novo manifesto executa sua própria decisão. Delta que altere o máximo/prova após semente persistida sempre obriga descarte, baseline limpo e nova carga.

Toda reabertura do ledger invalida, sem apagar as versões históricas, `IMP-DAT-020–028`, checkpoint, prévia de jobs, termo de carga e todos os `IMP-GNG-*` cuja prova dependa do manifesto/hash anterior. No mínimo, reexecutam-se `IMP-GNG-008`, `IMP-GNG-013`, `IMP-GNG-014` e `IMP-GNG-015`; os itens de acesso, isolamento, janela e homologação também retornam a pendente quando sua evidência foi afetada.

Se o `NO-GO` ocorrer depois do congelamento final, a escrita na fonte anterior, sua autoridade e o ledger de deltas são reativados em uma única decisão registrada antes de retomar a operação. Se essa retomada não puder ser comprovada, abre-se incidente e ledger externo de contingência; nunca se opera sem fonte gravável e autoritativa.

## 15.4 Congelamento

O congelamento abrange:

- código, esquema, perfis e configurações não emergenciais;
- no início da pré-carga, snapshot da fonte e ledger de deltas abertos;
- no congelamento final da virada, fonte anterior em modo somente leitura antes de fechar o ledger e reconciliar;
- fato inevitável entra no ledger controlado: antes de `CTL-IMP-003`, novo ciclo/reselo/decisões; depois, `FECHADO_NO_GO` se não terminal ou `CTL-IMP-004(INVALIDAR_GO)`/`ENT-IMP-05` se reconciliado, sempre com novo manifesto/janela. Mudança do máximo/prova após seed exige baseline limpo;
- imediatamente antes do `GO`, um fence suspende a aceitação externa, drena fatos em voo e sela geração, instante, último delta, contagem e `ledger_conteudo_versao/hash`; fato aceito antes de `T_GO` pertence ao delta, nada é aceito entre fence e decisão e fato a partir de `T_GO` pertence somente ao sistema. Falha do commit reabre a fonte anterior com continuidade;
- nenhuma mudança funcional durante a janela;
- correção emergencial apenas com novo artefato, evidência e decisão de reiniciar o gate afetado.

---

# 16. Ordem vinculante da carga final

1. validar ambiente, modo fechado, relógios sincronizados, efeitos externos bloqueados, acessos nominais e o singleton `ENT-IMP-04` em `PRE_GO_CONTROLE_ANTERIOR`, sem `production_go_id`;
2. executar o bootstrap de uso único para criar exatamente dois masters pendentes, sem acesso operacional;
3. ambos concluem primeiro acesso e TOTP, são ativados conjuntamente, exercitam recuperação e consomem/desabilitam o bootstrap sem backdoor;
4. um master apto cria e versiona o modelo empresarial global inicial;
5. um master apto cadastra empresas, logos, configurações e competência inicial pelo fluxo B02/API normal;
6. cadastrar os demais modelos e perfis globais/empresariais; em seguida, executar `CTL-IMP-001/PREPARAR`, cada aprovador usar `DECIDIR_ESCOPO` na própria sessão e o executor técnico usar `PROMOVER`, materializando e aprovando o manifesto exato das empresas, anos, fontes, artefato e baseline antes de qualquer capacidade de migração;
7. cadastrar usuários/associações; emitir somente os primeiros acessos allowlisted de `PRM-030` e conceder `MIGRACAO_PRE_GO` vinculada ao manifesto já persistido, mantendo os demais convites retidos;
8. conferir seletor, empresa e negação de toda ação fora da capacidade de cada operador;
9. cadastrar pessoas e vínculos empregados ativos no snapshot;
10. cadastrar prestadores MEI, contratos e vigências ativas no snapshot;
11. cadastrar condições financeiras vigentes e futuras conhecidas;
12. cadastrar complementos recorrentes ainda vigentes;
13. cadastrar clínicas compartilhadas;
14. cadastrar o último ASO necessário ao controle atual;
15. criar competência/participantes no escopo do manifesto já aprovado;
16. lançar pelo fluxo normal os complementos avulsos de empregado e serviços adicionais MEI já conhecidos, ainda não pagos, da competência inicial;
17. registrar K07 onde houver pagamento real anterior à virada;
18. registrar no manifesto restrito a ausência de K07 nos demais casos, sem criar entidade zero;
19. informar K06 e outros lançamentos somente no momento operacional aplicável;
20. depois do congelamento, abrir por `CTL-IMP-002`; executar `REABERTO → novo ciclo → SELADO_PARA_APLICACAO → IMP-DAT-019/020 → FECHADO_AGUARDANDO_RECONCILIACAO`;
21. recalcular candidatos; DP e Contábil usam `CTL-IMP-003/DECIDIR_FINAL` nas próprias sessões sobre candidatos e `ledger_conteudo_versao/hash`; OPS/Segurança usa `FINALIZAR`; então resolver semente, ausência ou verificação;
22. reconciliar por empresa/total, fixar `reconciliacao_ledger_versao/hash` e fechar por `CTL-IMP-004` somente desde `SEMENTES_RESOLVIDAS`; revogar capacidades, tornar entradas inativas, provar negações e `go_elegivel = true`. Esse fechamento não emite número;
23. criar checkpoint pós-carga;
24. assinar o termo de carga.

Uma etapa posterior não é aceita se o predecessor obrigatório ainda estiver divergente. A unidade lógica é auditada e idempotente; repetição não duplica cadastro, vínculo, contrato, associação, participante ou K07.

---

# 17. Reconciliação

## 17.1 Manifesto por empresa

Cada empresa terá manifesto versionado com:

- `manifesto_carga_id`, tentativa anterior correlata, estado, versão e hash persistidos;
- candidato de liberação, esquema, baseline, abertura/expiração e fechamento;
- instante do snapshot e do fechamento dos deltas;
- ID/ciclo e `ledger_conteudo_versao/hash` selados; estado e `reconciliacao_ledger_versao/hash` posteriores;
- fonte e responsável por cada classe;
- contagem de usuários, perfis e associações;
- contagem de vínculos empregados ativos;
- contagem de MEIs, contratos e vigências;
- contagem de condições e complementos;
- contagem dos avulsos e serviços adicionais conhecidos da competência inicial;
- contagem de clínicas e ASOs;
- participantes da competência;
- quantidade e soma de K07 por grupo/evento;
- maior número externo reservado por empresa/ano ou declaração dupla de inexistência de sequência compatível;
- estado de cada entrada empresa+ano: semente persistida, ausência dupla ou semente existente verificada;
- lista de deltas e estado de aplicação;
- exceções opcionais justificadas;
- executor, revisor, hash e versão do relatório.

## 17.2 Critérios sem tolerância

- zero CPF/CNPJ duplicado no escopo proibido;
- zero vínculo ou contrato ativo sobreposto;
- zero usuário ligado a empresa indevida;
- zero associação comum sem exatamente um perfil empresarial ativo;
- zero condição financeira inválida, lacuna indevida ou sobreposição;
- zero K07 duplicado por participante, grupo e evento;
- zero lançamento avulso/serviço adicional conhecido omitido ou duplicado na competência inicial;
- zero competência, pagamento ou recibo anterior ao corte;
- `proximo_numero_interno_projetado` acima de qualquer número externo compatível; nenhuma reserva/emissão antes do `GO`;
- manifesto/entrada/ledger/autorização consistentes, capacidade revogada e corrida fechamento×semente sem estado parcial;
- igualdade exata nas contagens obrigatórias;
- igualdade monetária exata nos saldos K07;
- todos os deltas aplicados uma única vez;
- referência determinística de ASO;
- pelo menos dois masters aptos;
- K07 conciliado ou inexistência confirmada.

Campo realmente opcional ausente não bloqueia, mas aparece no relatório. Qualquer divergência obrigatória impede `GO`.

---

# 18. Migração técnica e publicação

## 18.1 Antes da janela

- aplicar migrações em base limpa e numa cópia sintética `n-1`;
- verificar expand/contract e compatibilidade do artefato anterior;
- inventariar tabelas, constraints, índices, funções, RLS e papéis;
- proibir papel web proprietário ou com `BYPASSRLS`;
- verificar backup e restauração;
- congelar hash e ordem das migrações;
- definir rollforward para cada falha conhecida.

## 18.2 Na produção

1. retirar tráfego ou manter modo fechado;
2. registrar versão anterior e checkpoint;
3. confirmar backup lógico comum restaurável;
4. executar migração com papel exclusivo;
5. verificar versão, catálogo, RLS, constraints e integridade;
6. implantar exatamente o artefato aprovado;
7. iniciar aplicação com jobs funcionais, consumo de outbox empresarial e entregas externas ainda bloqueados, preservando continuidade, segurança, auditoria e observabilidade;
8. executar smoke técnico;
9. realizar/aplicar carga e deltas;
10. reconciliar;
11. gerar prévia dos jobs funcionais acumulados com data de referência, contagem esperada e prova de idempotência, sem efeito externo;
12. decidir `GO/NO-GO`;
13. depois do `GO`, executar a retomada controlada dos jobs temporais e reconciliar seu resultado;
14. liberar tráfego gradualmente.

Migração destrutiva não recebe rollback automático. Contração de colunas/tabelas fica para publicação posterior.

---

# 19. Linha do tempo relativa

| Marco | Entrega mínima |
|---|---|
| `T-30` | fornecedores, responsáveis, competência por empresa, janela, suporte e fontes definidos |
| `T-21` | produção provisionada e separação validada |
| durante `ETP-11` | executar cargas secas 1 e 2, restauração isolada, incidente, segurança, desempenho e pacote 22, sempre sem dado real |
| `T-14` | revalidar carga seca 1 e repetir parte afetada se houve mudança material |
| `T-10` | revalidar roteiro corrigido/congelado e concluir treinamento dos operadores |
| `T-7` | revalidar carga seca 2, duração, margem e validade das evidências |
| antes de `T-5` | concluir/aprovar `ETP-11`, `GAT-10` e `MAR-06`; identificar candidato imutável |
| `T-5` | depois de `MAR-06`, selar snapshot inicial, abrir ledger de deltas e iniciar pré-carga real em produção fechada |
| `T-3` | revalidar restauração, incidente, segurança, relógios e ausência de mudança material; não executar pela primeira vez |
| `T-2` | revalidar regressão, alertas, acesso, candidato e plano de retorno |
| `T-1` | revalidar snapshot inicial, continuidade do ledger e prontidão para congelamento final |
| `T0 = T_GO` | aplicação de deltas, reconciliação, checkpoint, `GO/NO-GO`, abertura e smoke |
| `T+1` | primeira reconciliação pós-abertura e revisão de alertas |
| `T+3` | revisão financeira, documental, acessos e capacidade |
| `T+7` | revisão de incidentes, filas, backup, recibos e pendências |
| marco mais tardio aprovado | saída do hipercuidado: competência inicial fechada +2 dias úteis e primeiro adiantamento normal do sistema +2 dias úteis |

Datas reais serão preenchidas no Documento 23A. A janela deve evitar, sempre que possível, proximidade crítica do adiantamento, pagamento final ou fechamento.

É vinculante: **nenhum dado real antes de `MAR-06`**. Todas as provas anteriores são sintéticas; `T-3` e `T-2` revalidam evidências já concluídas, não executam os gates pela primeira vez.

---

# 20. Decisão `GO/NO-GO`

## 20.1 `GO` exige cumulativamente

- Documentos 21, 22 e 23 aprovados;
- `CutoverReady = true`, com o Documento 23A integralmente preenchido e todos os gates `RDY-*` anteriores a `RDY-GO` aprovados;
- `MAR-06` alcançado;
- candidato imutável identificado por hash;
- versão de esquema correta;
- `GAT-01` a `GAT-10` aprovados;
- `ReleaseCandidateReady = true` na execução futura;
- zero `SEV-0` e `SEV-1` aberto;
- nenhum `SEV-2` sem decisão formal permitida pelo Documento 22;
- zero vulnerabilidade crítica ou alta aberta;
- duas cargas secas aprovadas;
- carga final reconciliada sem divergência obrigatória;
- dois masters iniciais aptos, com TOTP e recuperação exercitados, bootstrap consumido/desabilitado e nenhuma senha padrão, conta ou rota de emergência;
- seletor e autorização de todos os usuários conferidos;
- matriz A×B×inexistente sem vazamento;
- K07 conciliado ou ausência confirmada;
- último ponto lógico restaurável dentro do RPO;
- restauração pré-produção dentro do RTO;
- alertas e canal externo funcionando;
- zero alerta operacional crítico ou alto ainda ativo sem resolução segura;
- contas administrativas com MFA e menor privilégio;
- relógios sincronizados dentro da tolerância aprovada;
- sementes anuais de recibo reconciliadas por empresa/ano;
- manifesto corrente exato em `FECHADO_RECONCILIADO`, `go_elegivel = true`, nenhum `ENT-IMP-05`, sucessor ou delta posterior; `ledger_conteudo_versao/hash` e `reconciliacao_ledger_versao/hash` exatos; entradas inativas, capacidades revogadas e fence final vigente; imediatamente antes de `IMP-CUT-018`, `ENT-IMP-04` ainda em `PRE_GO_CONTROLE_ANTERIOR` e `production_go_id IS NULL`;
- responsáveis e substitutos presentes;
- homologações técnica, operacional, contábil, jurídica/privacidade e segurança assinadas;
- janela ainda dentro do limite aprovado;
- plano de retorno disponível fora da aplicação.

## 20.2 Regra binária

Qualquer evidência obrigatória ausente resulta em `NO-GO`. Não existe “vamos abrir e completar depois” para controle bloqueador.

---

# 21. Condições de aborto imediato

- hash do artefato ou versão do esquema divergente;
- migração incompleta, drift ou RLS ausente;
- checkpoint não restaurável ou fora do RPO;
- suspeita de vazamento entre empresas;
- divergência cadastral ou financeira obrigatória;
- candidato a K07 sem origem no manifesto ou K07 persistido cuja origem deixou de ser comprovável;
- menos de dois masters aptos;
- TOTP/recuperação dos masters não exercitados;
- efeito externo inesperado durante a carga;
- alerta crítico ou telemetria essencial inoperante;
- `SEV-0`, `SEV-1` ou vulnerabilidade crítica/alta descoberta;
- responsável obrigatório indisponível;
- janela excedida sem nova autorização e revalidação;
- smoke crítico falhando;
- incapacidade de executar o caminho de retorno.

CEP indisponível, isoladamente, usa preenchimento manual e não exige abortar. E-mail indisponível impede abrir para usuários que ainda dependam de convite, recuperação ou primeiro acesso. Telemetria opcional degradada só é tolerável se os sinais mínimos e o canal crítico independente continuarem íntegros e houver decisão formal.

---

# 22. Ponto de compromisso operacional

O responsável de implantação registra o instante exato em que a fonte autoritativa muda do controle anterior para o sistema. A troca usa protocolo fail-closed entre `ENT-IMP-04` e o `registro_externo_autoridade` independente definido em `PRM-012`; não pressupõe transação distribuída.

`IMP-CUT-018` primeiro mantém as duas fontes bloqueadas, prepara em `ENT-IMP-04` e no registro externo o mesmo candidato de época, manifesto, hashes, fence, decisores e fonte de destino, sempre com época/hash anterior esperados. A confirmação condicional append-only no registro externo é o ponto de compromisso `T_GO`; depois, `ENT-IMP-04` é finalizada ou recomposta idempotentemente com o evento exato. O sistema só aceita tráfego quando as duas provas coincidem. Falha antes do CAS aborta a preparação e permite reabrir a fonte anterior; falha depois do CAS mantém ambas as interfaces funcionais fechadas até reconciliar `ENT-IMP-04`, sem voltar silenciosamente. Assim, existe uma única autoridade, ainda que a falha produza indisponibilidade temporária.

O primeiro `production_go_id` e o vínculo ao manifesto continuam write-once. Nenhuma emissão inicial ocorre sem o evento externo confirmado, `ENT-IMP-04` reconciliada na mesma `authority_epoch` e o restante do checklist aprovado.

Antes desse instante:

- a fonte anterior continua oficial;
- pode-se abortar sem transportar operação real do novo sistema;
- carga divergente pode ser corrigida/repetida em produção ainda fechada conforme o runbook.

Pré-carga aprovada, cadastro técnico e e-mails allowlisted de bootstrap/migração nominal não mudam a fonte e não são `efeito_de_compromisso`; a capacidade não autoriza operação real.

Depois do `GO` **ou do primeiro efeito de compromisso no novo sistema, o que ocorrer primeiro**:

- não existe rollback simples de dados;
- banco, auditoria, pagamentos, recibos, números, objetos e outbox são preservados;
- retirada do sistema vira contingência operacional;
- correção funcional usa os fluxos versionados aprovados;
- restauração só é usada para perda, corrupção ou integridade não confiável, não para desfazer erro de negócio.

---

# 23. Matriz de retorno seguro

| Situação | Ação correta | Proibição |
|---|---|---|
| Falha antes de qualquer escrita | abortar e manter fonte anterior | simular que houve implantação |
| Erro de carga antes do `GO` | manter fechado, corrigir origem/roteiro e repetir de modo controlado | abrir com divergência |
| Falha só no artefato, esquema compatível | voltar ao artefato anterior homologado | recompilar às pressas |
| Migração falha antes de tráfego | rollback transacional seguro ou restauração do baseline; novo ensaio | desfazer migração destrutiva sem prova |
| Esquema expandido, aplicação nova falha | voltar código apenas se compatibilidade foi comprovada | contrair esquema imediatamente |
| Fato real já criado | congelar, preservar e preferir rollforward | apagar ou restaurar cegamente |
| Erro de valor de negócio | usar correção/versionamento funcional | usar backup para corrigir digitação |
| Vazamento/corrupção/perda | declarar incidente, isolar, escolher corte lógico, restaurar e reconciliar | continuar operando sem confiança |
| E-mail ou CEP falha | usar contingência segura | reverter todo o sistema sem necessidade |
| Storage falha após pagamento | preservar pagamento e retomar arquivo idempotentemente | desfazer pagamento |
| Resposta incerta | reconciliar fonte autoritativa antes de repetir | repetir comando às cegas |

O Documento 23C contém a árvore executável e os pontos de parada.

Rollback de aplicação é da **unidade coerente de publicação**, não de um processo isolado. Antes dele, bloqueiam-se novas mutações e consumidores, inventariam-se leases, mensagens e efeitos em voo, prova-se a compatibilidade do artefato anterior com banco, configuração, segredos e contratos de fila, e promovem-se web, API e worker como conjunto compatível. A conclusão exige reconciliar outbox/leases e demonstrar zero efeito duplicado.

---

# 24. Retorno temporário ao controle anterior

Se a contingência exigir retirar o sistema depois do ponto de compromisso:

1. declarar incidente ou mudança emergencial;
2. bloquear novas mutações e fencear/drenar consumidores, outbox, leases e efeitos em voo;
3. criar checkpoint preliminar do estado alcançado e preservar auditoria, objetos, pagamentos, recibos e números;
4. inventariar e anexar ao manifesto os fatos confirmados desde o `GO`, inclusive respostas incertas;
5. preparar/testar o ledger externo protegido e validar que o controle anterior consegue operar com contexto suficiente;
6. imediatamente antes da troca, repetir fence/dreno; por empresa+ano apurar último número comprometido, reservas confirmadas e respostas/números incertos, transformar incertezas em lacunas e fixar no ledger o próximo número seguro sem sobreposição;
7. criar checkpoint final; preparar a nova época e o hash do mapa numérico no `registro_externo_autoridade`; confirmar por CAS `authority_switched_at = T_RET`; somente depois ativar o controle anterior+ledger. Se `ENT-IMP-04` estiver disponível, reconciliá-la na mesma época antes da ativação; se estiver indisponível, recompô-la idempotentemente antes de qualquer futura reabertura do sistema. O sistema responde pelos fatos aceitos antes de `T_RET`, e o ledger é o único alocador a partir de `T_RET`;
8. registrar externamente, de forma restrita, cada nova operação da contingência e nunca lançar o mesmo fato nos dois controles sem reconciliação;
9. para reentrar, recuperar o sistema ainda fechado, agendar nova janela, suspender novos fatos no controle anterior e selar o ledger num corte `L`;
10. aplicar idempotentemente no sistema fechado todos os fatos, números emitidos/reservados/incertos e lacunas; avançar a raiz normal monotonicamente, sem alterar semente inicial;
11. provar igualdade de fatos, valores, números, documentos, auditoria, leases e outbox;
12. se surgir fato novo depois de `L`, invalidar a reconciliação, manter controle anterior + ledger autoritativos e repetir os passos 9–11 com novo corte;
13. somente depois da igualdade executar novo `GO/NO-GO`; preparar o mesmo candidato em `ENT-IMP-04` e no registro externo, confirmar por CAS `authority_switched_at = T_REENT`, reconciliar a projeção local e só então abrir o sistema: controle anterior + ledger respondem pelos fatos aceitos em `[T_RET,T_REENT)`; o sistema, pelos aceitos a partir de `T_REENT`;
14. encerrar o ledger somente depois de provar a troca e preservar o manifesto completo.

O ledger funcional externo mínimo contém empresa, competência, participante, grupo/evento, valor quando aplicável, data, executor, origem e identificador único. Separadamente, o `registro_externo_autoridade` guarda instalação, época monotônica, época/hash anterior, fonte anterior/nova, marco, fence, mapa numérico, manifesto quando aplicável, decisores, instante e hash encadeado. Nenhum deles autoriza escrita nas duas fontes ao mesmo tempo.

K07 não é utilizado para fatos da contingência posteriores à implantação original. Eles retornam pelos fluxos normais, correções autorizadas ou procedimento específico homologado.

---

# 25. Smoke seguro de produção

## 25.1 Antes da abertura geral

- endpoint de vida sem detalhes;
- versão e hash esperados;
- conexão, migração e RLS válidas;
- login de ambos os masters com TOTP;
- recuperação testada sem consumir indevidamente código real;
- seleção e troca de empresa;
- acesso A, negação B e inexistente neutro;
- perfil com oculto, mascarado, leitura e edição;
- consulta de empregado e MEI controlados;
- consulta da competência sem criar pagamento;
- acesso restrito de ASO;
- auditoria e correlação dos testes;
- worker, storage e alerta mínimo.
- prévia e retomada controlada dos jobs acumulados de ASO, admissão futura, MEI e expirações, com data de referência, contagem esperada e idempotência; controles de segurança vencidos nunca aguardam essa retomada.

## 25.2 Abertura progressiva

1. dois masters;
2. grupo piloto nominal de operação;
3. demais usuários autorizados.

Essa sequência ocorre dentro da mesma liberação completa e serve para observar acesso e isolamento. Falha crítica em qualquer passo fecha o tráfego e aciona o caminho correspondente; não se mantém “parte do sistema” em produção.

Teste destrutivo, DAST invasivo, carga pesada e e-mail para destinatário não controlado não são executados na produção real.

---

# 26. Hipercuidado

Começa no `GO` e termina somente após:

- primeiro adiantamento **normalmente executado pelo sistema** concluído e reconciliado; K07 não conta para este marco porque não exercita confirmação e recibo do sistema;
- primeiro pagamento final concluído e reconciliado;
- primeira competência fechada corretamente;
- dois dias úteis depois do fechamento/reconciliação da competência inicial;
- dois dias úteis depois do primeiro adiantamento normal do sistema;
- nenhum bloqueador de integridade, sigilo ou recuperação aberto;
- relatório de estabilização aprovado.

Durante o período:

- reconciliação diária de participantes, grupos, pagamentos, recibos e K07;
- no primeiro recibo legítimo de cada empresa+ano inicial, gravar `PENDENTE_RECONCILIACAO` com a faixa/hash/correlação no mesmo commit, bloquear a emissão seguinte da chave e executar `RBK-018`; somente `CTL-REC-001` muda para `RECONCILIADA` depois de confirmar autoridade/época, `ProductionGo`, manifesto/ramo, número esperado, raiz, recibo, auditoria, snapshot, outbox e arquivo; resposta incerta usa também `RBK-025`, sem recibo de teste;
- acompanhamento reforçado de erros, filas, objetos, backup e alertas;
- revisão diária de incidente e divergência;
- nenhuma mudança funcional não urgente;
- correção urgente com artefato identificado, teste e evidência;
- presença de responsáveis conforme escala definida;
- checkpoints em `T+1`, `T+3` e `T+7`.

---

# 27. Modelo de operação contínua

## 27.1 Cadências mínimas

| Cadência | Controles |
|---|---|
| Contínua/minutos | saúde externa, erros, banco, fila/outbox, leases, worker, efeitos externos e idade do último ponto restaurável |
| Horária | expiração de temporários, reconciliações rápidas de objetos/documentos e filas atrasadas |
| Diária | ASO/alerta de 30 dias, admissões futuras, renovação MEI, recibo sem arquivo, objeto/hash, checkpoint de auditoria, backup e capacidade |
| Por evento financeiro | conferência antes/depois de adiantamento e final; grupos, pagamentos, recibos e numeração |
| Semanal | tendências, falhas repetidas, storage, consultas lentas, dependências e problemas abertos |
| Mensal | fechamento operacional, capacidade, vulnerabilidades, contas ativas e relatório de serviço |
| Trimestral | restauração integral, revisão administrativa de acessos e recuperação de continuidade |
| Anual e após mudança crítica | exercício de incidente e revisão completa dos runbooks |

Toda rotina empresarial processa uma empresa por transação, com lease, idempotência, correlação e retomada. Execução perdida não é compensada alterando relógio ou fabricando evento retroativo.

## 27.2 Suporte

- suporte possui canal externo à aplicação;
- nenhuma pessoa de suporte solicita senha, TOTP ou código de recuperação;
- alteração direta de banco não é procedimento comum;
- ação excepcional exige incidente/mudança, dupla revisão, evidência e reconciliação;
- chamado não contém dado sensível desnecessário;
- severidade define reconhecimento, escalonamento e comunicação;
- problema recorrente recebe causa raiz e ação preventiva.

---

# 28. Observabilidade e alertas

## 28.1 Painéis mínimos

- saúde externa: DNS, TLS, login público neutro e vida;
- aplicação: disponibilidade observada, erro, p50/p95/p99 e versão;
- banco: conexões, locks, transações longas, I/O, armazenamento e autovacuum;
- worker: tamanho/idade da fila, retentativas, leases e falhas definitivas;
- documentos: recibo sem arquivo, objeto ausente, PDF/Excel falho e hash divergente;
- segurança: falhas de autenticação e negações cruzadas agregadas;
- continuidade: último corte lógico completo e último exercício de restauração;
- capacidade: CPU, memória, conexões e armazenamento;
- e-mail/CEP: falha e latência sem destinatário/endereço em claro.

## 28.2 Alertas mínimos

| Condição | Severidade inicial |
|---|---|
| banco indisponível, vazamento, auditoria/recibo corrompido, backup além de 60 min ou falha de WAL/base/objetos/checkpoint | crítica |
| idade do último corte lógico completo chegando a 45 min | alta preventiva |
| worker parado, tarefa >10 min, storage indisponível, falha definitiva | alta |
| tarefa >5 min | advertência para investigação |
| p95 fora da meta em três janelas, recursos >70% sustentado | média |
| limpeza temporária ou crescimento acima da tendência | informativa |

Alertas usam canal independente do sino funcional, deduplicação, responsável primário, substituto e prazo de reconhecimento. Nenhum alerta contém dado cadastral, financeiro ou clínico detalhado.

As severidades operacionais de alerta (`crítica`, `alta`, `média`, `advertência`, `informativa`) são uma taxonomia de triagem, distinta de `SEV-0–3` para defeitos e da classificação própria de vulnerabilidades. O alerta abre investigação; somente depois o incidente ou defeito recebe sua categoria, sem rebaixamento automático entre escalas.

---

# 29. SLO, RPO e RTO

## 29.1 Metas já vinculantes

- latências e capacidade do Documento 21;
- zero tolerância a vazamento entre empresas;
- zero tolerância a duplicação financeira/documental;
- zero tolerância a quebra da auditoria;
- temporários expiram em 24 horas;
- RPO máximo de uma hora;
- RTO máximo de oito horas úteis;
- restauração trimestral.

Disponibilidade mensal, janela de suporte e prazos por severidade permanecem parâmetros pré-produção.

## 29.2 Medição do RTO

`RTO-T0` é o primeiro instante confiável entre:

- o alerta que identifica produção indisponível ou integridade não confiável; e
- a declaração formal do incidente que exige recuperação integral.

Usa-se o mais antigo. Triagem, espera por autorização, contenção, preservação de evidência, avaliação jurídica, restauração, validação e reabertura contam no tempo corrido; nenhuma dessas atividades pausa apenas por ocorrer fora da janela de suporte. O relatório também registra tempo útil para comparar a meta operacional de oito horas, sem ocultar o tempo corrido.

`RTO-T1` ocorre somente quando:

- banco, objetos, chaves e versão compatível estão restaurados;
- sessões e credenciais temporárias antigas foram invalidadas;
- números, hashes, auditoria e outbox foram reconciliados;
- jornadas críticas passaram;
- efeitos externos foram liberados de modo controlado;
- tráfego foi reaberto;
- responsáveis técnico e operacional autorizaram o retorno.

“Banco restaurado” isoladamente não encerra o RTO. O exercício registra tempo corrido e tempo dentro da janela operacional; a meta de oito horas usa o calendário de suporte nominal que precisa ser definido antes da produção.

## 29.3 Medição do RPO

RPO real é a diferença entre o instante do incidente/corte de confiança e o último checkpoint comum restaurado de:

- banco;
- objetos permanentes;
- metadados e hashes;
- chaves recuperáveis;
- numeração e auditoria necessárias.
- `ENT-IMP-04`, primeiro `production_go_id`, eventos `T_GO/T_RET/T_REENT`, `authority_epoch` e ledger de contingência necessários para reconstruir a fonte corrente.

O objetivo vinculante é resultado menor ou igual a 60 minutos. Sempre que não existir corte lógico comum e confiável dentro desse limite — por comprometimento, corrupção não maliciosa, desastre, perda de chave ou outra causa — **integridade prevalece sobre a métrica**: nunca se escolhe um corte suspeito ou incoerente para aparentar cumprimento do RPO. Registra-se a violação, preserva-se o incidente aberto, reconstrói-se idempotentemente o intervalo perdido somente a partir de evidências confiáveis, reconciliam-se todos os domínios e registra-se qualquer perda residual sem inventar fato; incidente, DP, Contábil e Jurídico decidem nominalmente sobre o resultado antes da reabertura. Os controles adicionais de domínio administrativo limpo, busca de persistência e rotação abrangente continuam específicos do ramo de comprometimento.

---

# 30. Backup e restauração

## 30.1 Baseline

- WAL/PITR contínuo com janela inicial de 35 dias;
- snapshot/base backup diário;
- objetos versionados;
- criptografia em trânsito e em repouso para todas as cópias;
- cópia isolada em conta/projeto e credenciais separados, com atraso comprovado de até 60 minutos;
- imutabilidade e proteção contra exclusão inclusive pelo administrador primário de produção;
- inventário e hashes;
- chaves históricas e metadados de KMS recuperáveis — ou mecanismo equivalente para chaves não exportáveis — pertencentes ao mesmo corte lógico da cópia isolada;
- checkpoint lógico comum;
- proteção contra exclusão pelo operador comum;
- validação diária de legibilidade, cadeia, inventário e hashes;
- monitoramento preventivo aos 45 minutos e crítico ao exceder 60 minutos, além de alerta imediato para falha de WAL, base backup, objetos ou checkpoint comum;
- restauração trimestral obrigatoriamente a partir da cópia isolada;
- continuidade protegida do repositório de evidências, contatos e runbooks fora da aplicação.

Réplica não é backup. Snapshot de banco isolado não é recuperação completa se objetos ou chaves não pertencem ao mesmo corte.

Atraso ou falha da cadeia aciona `RBK-031` para proteger a fonte e recuperar o pipeline. `RBK-004` só é acionado quando existe perda, corrupção, integridade não confiável ou exercício programado.

Aos 45 minutos sem novo corte comum recuperável, `RBK-031` prepara contenção e qualquer mecanismo durável alternativo previamente aprovado. Ao atingir 60 minutos, novas mutações são obrigatoriamente bloqueadas ou desviadas para esse mecanismo por troca fail-closed com fence, época e confirmação durável; o incidente e o escalonamento permanecem abertos até existir novo corte íntegro. Não se aceita exceder o RPO continuando a escrever sem proteção.

## 30.2 Restauração integral

1. declarar incidente/exercício e congelar mudanças;
2. validar sincronização do relógio e registrar `RTO-T0` corrido/útil;
3. escolher corte lógico comprovado e obter do repositório externo protegido a cadeia de autoridade `ProductionGo`/`T_GO`/`T_RET`/`T_REENT`, manifesto, fence e épocas; havendo comprometimento, usar corte anterior ao primeiro indicador confiável;
4. criar alvo de recuperação isolado e em quarentena, com efeitos externos bloqueados; no ramo de comprometimento, usar infraestrutura e domínio administrativo limpos;
5. restaurar banco;
6. restaurar objetos, chaves históricas e metadados de KMS do mesmo corte, ou o mecanismo equivalente aprovado para chaves não exportáveis;
7. implantar versão compatível a partir de artefato imutável confiável; no ramo de comprometimento, o artefato e sua cadeia precisam anteceder a persistência suspeita ou ser reconstruídos por cadeia limpa e verificável;
8. verificar migrações, RLS, hashes, empresas, permissões, pagamentos, recibos, auditoria e reconciliar/reconstituir idempotentemente `ENT-IMP-04` somente pela prova externa exata, preservando o primeiro `production_go_id`;
9. no ramo de comprometimento, procurar mecanismos de persistência em identidades, infraestrutura, artefatos, segredos, jobs, filas, webhooks e políticas antes de qualquer exposição;
10. invalidar globalmente todas as sessões, tokens e autorizações temporárias, inclusive as que possam ter sido emitidas depois do corte, usando revogação global/época e rotação de chave quando aplicável;
11. invalidar séries de códigos presentes no corte, reconciliar senha/TOTP posteriores e exigir recuperação quando necessário;
12. se conta, segredo, chave, artefato ou infraestrutura puder ter sido comprometido, executar `RBK-007` e rotacionar credenciais de aplicação, banco, storage, e-mail, KMS e administração antes de expor o alvo;
13. reconciliar autoridade corrente, maior numeração e lacunas possíveis; sem prova da cadeia o alvo permanece em quarentena;
14. reconciliar outbox sem repetir efeito;
15. calcular o RPO e a margem projetada para o RTO; se o corte confiável exceder 60 minutos, rejeitar qualquer corte suspeito, registrar a violação e delimitar o intervalo a reconstruir por evidência confiável;
16. na exceção de RPO, executar no alvo a reconstrução idempotente de cada fato recuperável do intervalo e reconciliar contagens, valores, numeração, documentos, auditoria, outbox e credenciais; registrar explicitamente toda perda residual, sem inventar fato;
17. aprovar o resultado completo da recuperação; sempre que não houver corte comum confiável dentro do RPO, incidente, DP, Contábil e Jurídico decidem nominalmente sobre a reconstrução, a reconciliação e a perda residual, sem reduzir o corte de confiança;
18. no incidente real, se a autoridade corrente for o sistema, cortar tráfego ao alvo e registrar `RTO-T1`; se for controle anterior+ledger, manter o alvo sem mutações e entregá-lo ao `RBK-020`, permitindo reentrada apenas pelo CAS externo em `T_REENT` e posterior reconciliação local. No exercício, simular o ramo sem tráfego;
19. calcular o RTO final somente depois de `RTO-T1` e verificar a meta;
20. no exercício, eliminar o laboratório com evidência; no incidente, manter o alvo recuperado como produção;
21. preservar o ambiente antigo e as evidências quando houver incidente, conforme a retenção definida;
22. registrar diferenças, melhorias, violação de RPO quando houver e a decisão do ramo executado.

O exercício e o incidente compartilham os passos de recuperação, mas não o encerramento. Exercício nunca recebe tráfego de produção. Em incidente, o ambiente recuperado que recebeu a virada permanece ativo; somente o ambiente afetado é isolado e preservado ou eliminado mais tarde por decisão autorizada.

O Documento 23D contém o runbook detalhado e o calendário trimestral.

---

# 31. Resposta a incidentes

## 31.1 Integração sem dependência circular

O módulo I01/I02 registra o incidente quando o sistema está confiável. Se a aplicação estiver indisponível ou sob suspeita, usa-se canal e formulário externo protegido; fatos aprovados são reconciliados depois sem apagar a evidência original.

## 31.2 Preparação

Antes da produção:

- coordenador e substituto nomeados;
- técnico, DP, direção, jurídico/LGPD, comunicação e backup nomeados;
- lista de contatos fora do sistema;
- canal seguro de acionamento;
- conta de emergência da infraestrutura/nuvem, fora do produto, sem identidade master e sem `BYPASSRLS`, com custódia definida;
- capacidade de revogar todas as sessões;
- procedimentos de rotação de segredos/chaves;
- exercício de vazamento A×B concluído;
- recuperação dos masters exercitada sem backdoor.

Exercício repete-se anualmente e após mudança crítica.

---

# 32. Mudança, manutenção e publicação posterior

- Toda publicação promove artefato imutável entre ambientes.
- Mudança de esquema continua expand/contract.
- Backup e compatibilidade são verificados antes da publicação.
- Smoke e observação reforçada ocorrem depois.
- Mudança emergencial não elimina revisão, evidência ou reconciliação; apenas comprime o ciclo.
- Configuração é versionada, revisada e não contém segredo.
- Alteração de fornecedor reexecuta testes aplicáveis de falha, segurança, backup e observabilidade.
- Mudança crítica de infraestrutura/segurança exige novo exercício aplicável.
- Nenhuma otimização arquitetural descartada entra sem métrica e nova decisão.

---

# 33. Retenção e ciclo operacional

- registros permanentes e auditoria: mínimo de seis anos;
- ASO informativo no sistema: mínimo de seis anos;
- recibos definitivos: preservados com versão e hash;
- temporários: até 24 horas;
- notificação resolvida: 90 dias na central;
- logs operacionais: recomendação inicial de 30 dias;
- traces comuns: 14 dias; erros/críticos sanitizados: 30 dias;
- métricas agregadas de tendência: 13 meses;
- PITR: referência inicial de 35 dias;
- política depois de seis anos: obrigatória antes da produção;
- sem botão de exclusão geral na V1.

Backup segue seu ciclo de recuperação e não autoriza eliminação antecipada. Restauração não torna temporário vencido novamente disponível.

---

# 34. Evidências e termo de implantação

## 34.1 Fonte única

Este documento usa o mesmo repositório de evidências do Documento 22. Não cria uma segunda fonte paralela.

Cada evidência informa:

- ID do procedimento/caso/gate;
- ambiente e empresa/escopo;
- hash do artefato;
- versão de esquema;
- início e fim;
- executor e revisor;
- resultado;
- arquivo/registro e checksum;
- correlação;
- decisão e observação sanitizada.

Senha, token, TOTP, código, CPF/CNPJ integral, salário, resultado de ASO e conteúdo de arquivo não entram na evidência geral.

## 34.2 Termos

São produzidos, no mínimo:

- termo de cada carga seca;
- termo de restauração;
- termo do exercício de incidente;
- manifesto de carga por empresa;
- termo de carga final;
- registro `GO/NO-GO`;
- registro do ponto de compromisso;
- relatório de smoke;
- relatórios `T+1`, `T+3` e `T+7`;
- termo de saída do hipercuidado.

---

# 35. Rastreabilidade operacional principal

## 35.1 Raízes do Documento 23

Quando uma linha apresenta o primeiro e o último ID de uma família sequencial, ela referencia inclusivamente todos os IDs intermediários já enumerados no anexo correspondente; não é amostragem.

| ID | Fonte | IDs executáveis exatos | Evidência | Bloqueia |
|---|---|---|---|---|
| `D23-RQ-01` | Mestre §34; Doc. 18 §33; `BK-374` | `IMP-PRE-003`, `CUT-EMP-01`, `CUT-EMP-02`, `CUT-EMP-03` | decisão DP/Contábil | `GO` |
| `D23-RQ-02` | `RST-GER-29` | `IMP-DAT-025`, `IMP-GNG-013` | consulta negativa/manifesto | `GO` |
| `D23-RQ-03` | `BK-371` | `OWN-014`, `OWN-015`, `IMP-DAT-001`, `IMP-DAT-003`, `IMP-DAT-008`, `IMP-DAT-028` | executores nominais e relatório por etapa | `GO` |
| `D23-RQ-04` | P09-14/14A; API K07 | `IMP-DAT-016`, `IMP-DAT-017`, `IMP-GNG-014` | trilha/manifesto financeiro | `GO` |
| `D23-RQ-05` | `BK-372`, `RSK-08` | `IMP-DRY-001`, `IMP-DRY-024`, `IMP-GNG-007` | dois termos aprovados | `ETP-11/GO` |
| `D23-RQ-06` | Docs. 19/21/22 | `IMP-DAT-001`, `IMP-DAT-002`, `IMP-GNG-008` | origem, ACL e varredura | `GO/incidente` |
| `D23-RQ-07` | `QLT-006`, `BK-379` | `RDY-RC`, `IMP-GNG-002`, `IMP-GNG-003` | hash/SBOM/esquema | `GO` |
| `D23-RQ-08` | `DOD-02`, `QAT-REC-005` | `IMP-DRY-021`, `IMP-RET-004` | relatório de migração | `GO` |
| `D23-RQ-09` | `BK-360`, `BK-361`, `BK-362` | `RDY-ENV`, `IMP-PRE-004` | inventário/ACL | `GAT-10` |
| `D23-RQ-10` | `GAT-02`, `GAT-03`, `GAT-04`, `GAT-08`, `GAT-09`, `GAT-10` | `RDY-SEC`, `IMP-GNG-005`, `IMP-GNG-012`, `IMP-GNG-018` | QAT/ASVS/DAST | `GO` |
| `D23-RQ-11` | `ENT-IMP-01/02/03/04/05`, fases de `CTL-IMP-001/003`, `INVALIDAR_GO`, `BK-210/371/374`, `GAT-05/06/07` | `IMP-GNG-008`, `IMP-GNG-014`, `IMP-CUT-018` | decisões pessoais, hashes separados, fence delta×`GO`, guarda/época e `ProductionGo` por CAS fail-closed | `GO` |
| `D23-RQ-12` | Doc. 19 §24; `BK-368` | `OPS-JOB-014`, `OPS-JOB-015`, `OPS-JOB-016`, `IMP-GNG-015` | checkpoint lógico | `GO` |
| `D23-RQ-13` | `QAT-REC-001` a `QAT-REC-008` | `REC-001`, `REC-020`, `IMP-GNG-016` | RPO/RTO/hashes | `GO` |
| `D23-RQ-14` | `BK-369`, `QAT-RES-014` | `RDY-OPS`, `ALT-001`, `ALT-015`, `IMP-GNG-017` | teste de entrega | `GO` |
| `D23-RQ-15` | Doc. 19 §28; `QAT-SEC-041` | `OPS-JOB-019`, `IMP-PRE-009` | ata e melhorias | `GO` |
| `D23-RQ-16` | `BK-374` | `DEC-001`, `DEC-004`, `IMP-PRE-013` | plano/presença | `GO` |
| `D23-RQ-17` | Doc. 22 §8.3 | `IMP-SMK-001`, `IMP-SMK-011` | resultado/trace | abertura |
| `D23-RQ-18` | Doc. 19 §23.5 | `IMP-DRY-019`, `IMP-RET-001`, `IMP-RET-010`, `RBK-020` | árvore/ensaio | `GO` |
| `D23-RQ-19` | Doc. 22 §§34/37 | `HML-001`, `HML-002`, `HML-003`, `HML-004`, `HML-005`, `HML-006`, `HML-007`; `IMP-GNG-020`, `IMP-GNG-021`, `IMP-GNG-022`, `IMP-GNG-023`, `IMP-GNG-024`, `IMP-GNG-025` | manifesto de aceite | `GO` |
| `D23-RQ-20` | operação pós-implantação | `IMP-HYP-001`, `IMP-HYP-008`, `WIN-004` | T+1/T+3/T+7 e estabilização | estabilização |

## 35.2 Ponte completa do `EPC-18`

| Backlog | Seção do Documento 23 | Procedimento/gate | Teste ou gate | Evidência |
|---|---|---|---|---|
| `BK-360` | §§8 e 18 | `RDY-ENV`, `IMP-PRE-004` | `GAT-10` | inventário dos ambientes |
| `BK-361` | §§8, 27 e 28 | `RBK-010`, `RBK-012`, `RBK-013`, `RBK-028` | `QAT-RES-005`, `QAT-RES-006`, `QAT-RES-007`, `QAT-RES-008`, `QAT-RES-011` | falhas seguras de objetos, e-mail, CEP e telemetria |
| `BK-362` | §§8, 9 e 36 | `PRM-001`, `PRM-011`, `RDY-ENV` | `GAT-10` | fornecedores, ACL e topologia |
| `BK-363` | §14 | `IMP-DRY-001`, `IMP-DRY-014` | `ETP-11` | fixture/hash |
| `BK-364` | §14 | `IMP-DRY-016`, `IMP-DRY-023` | `GAT-10` | contagens e capacidade |
| `BK-365` | §§20 e 21 | `IMP-GNG-005`, `IMP-PRE-010` | `GAT-08`, `GAT-10` | SAST/DAST/SBOM/revisão |
| `BK-366` | §§8, 18 e 20 | `IMP-GNG-012`, `IMP-GNG-018` | `GAT-02`, `GAT-03`, `GAT-04`, `GAT-08`, `GAT-10`; `QAT-SEC-031`, `QAT-SEC-032`, `QAT-SEC-033`, `QAT-SEC-037` | hardening e negações |
| `BK-367` | §§14 e 29 | `IMP-DRY-016`, `IMP-DRY-023`, `DSH-002`, `DSH-003`, `DSH-004` | `QAT-PERF-001`, `QAT-PERF-002`, `QAT-PERF-003`, `QAT-PERF-004`, `QAT-PERF-005`, `QAT-PERF-006`, `QAT-PERF-007`; `GAT-10` | p95/recursos/filas |
| `BK-368` | §§29 e 30 | `REC-001`, `REC-020`, `OPS-JOB-018` | `QAT-REC-001`, `QAT-REC-002`, `QAT-REC-003`, `QAT-REC-004`, `QAT-REC-005`, `QAT-REC-006`, `QAT-REC-007`, `QAT-REC-008` | termo RPO/RTO da cópia isolada |
| `BK-369` | §§27 e 28 | `RDY-OPS`, `DSH-001`, `DSH-009`, `ALT-001`, `ALT-015` | `QAT-RES-014` | painéis, alertas e fichas |
| `BK-370` | §33 | `PRM-021`, `HML-005`, `RDY-RC` | `GAT-10` | política de seis anos, arquivamento/eliminação e aceite jurídico |
| `BK-371` | §§11 a 17 | `CTL-IMP-001–004`, `IMP-DAT-001`, `IMP-DAT-028` | `QAT-REC-007`, `GAT-05`, `GAT-06`, `GAT-07` | manifesto persistido e termo da carga real |
| `BK-372` | §14 | `IMP-DRY-001`, `IMP-DRY-024` | `ETP-11` | termos DRY-1/DRY-2 |
| `BK-373` | §§7, 9 e 31 | `OWN-001`, `OWN-013`, `OWN-014`, `OWN-015`, `HML-001`, `HML-007` | `GAT-10` | aceites nominais, incluindo os dois masters iniciais |
| `BK-374` | §§11, 19 a 22 | `CUT-EMP-01`, `WIN-003`, `DEC-001`, `DEC-004` | `IMP-GNG-001`, `IMP-GNG-028` | decisão/janela/comunicação |
| `BK-375` | §§23, 27 e 31 | `RBK-008`, `RBK-009`, `RBK-010`, `RBK-012`, `RBK-013`, `RBK-014`, `RBK-025` | `QAT-RES-001`, `QAT-RES-002`, `QAT-RES-003`, `QAT-RES-004`, `QAT-RES-005`, `QAT-RES-006`, `QAT-RES-007`, `QAT-RES-008`, `QAT-RES-009`, `QAT-RES-010`, `QAT-RES-011`, `QAT-RES-012`, `QAT-RES-013`, `QAT-RES-014`, `QAT-RES-015`, `QAT-RES-016` | relatórios de falha/retomada |
| `BK-376` | §§20 e 35 | `RDY-RC`, `IMP-GNG-002` | `GAT-01`, `GAT-02`, `GAT-03`, `GAT-04`, `GAT-05`, `GAT-06`, `GAT-07`, `GAT-08`, `GAT-09`, `GAT-10` | manifesto completo do pacote 22 |
| `BK-377` | §§20 e 25 | `IMP-GNG-012`, `IMP-SMK-004` | `QAT-SEC-006`, `QAT-SEC-007`; `GAT-02`, `GAT-10` | matriz A×B×inexistente e pool |
| `BK-378` | §§20 e 25 | `RDY-RC`, `IMP-GNG-002` | `QAT-A11Y-001`, `QAT-A11Y-002`, `QAT-A11Y-003`, `QAT-A11Y-004`, `QAT-A11Y-005`, `QAT-A11Y-006`, `QAT-A11Y-007`, `QAT-A11Y-008`; `GAT-10` | aceite das 60 telas/subfluxos |
| `BK-379` | §§10, 18 e 20 | `RDY-RC`, `IMP-GNG-002`, `IMP-GNG-003`, `IMP-GNG-004` | `GAT-10` | hash/SBOM/esquema/defeitos |

Os anexos expandem essas vinte raízes e os vinte itens do `EPC-18` sem inventar requisito funcional novo.

---

# 36. Definições que continuam pendentes antes da produção

| Grupo | Definição | Bloqueia |
|---|---|---|
| Pessoas | responsáveis e substitutos por implantação, alertas, backup e incidente | `CutoverReady` |
| Homologação | nomes de Contábil, Jurídico, DP, Segurança, Engenharia e Produto | `GAT-10/GO` |
| Infraestrutura | hospedagem, região, orçamento e topologia | produção |
| Disponibilidade | uma/duas réplicas e failover/restauração controlada | SLO/produção |
| Dependências | e-mail/remetente, CEP, objetos, KMS e observabilidade | `GAT-10` |
| API | domínio real de Problem Details e limites finais de logo/rate limits | `GAT-10` |
| E-mail | domínio, SPF, DKIM e DMARC | convites/recuperação em produção |
| Operação | disponibilidade prometida, suporte e reconhecimento por severidade | produção |
| Backup | retenções exatas, imutabilidade e localização da cópia isolada | `GO` |
| Segurança | custódia da conta de emergência da infraestrutura/nuvem, fora do produto, sem identidade master ou `BYPASSRLS` | `GO` |
| Privacidade | classificação, acesso e prazo de IP/User-Agent | produção |
| Dados | competência inicial real de cada CNPJ | carga real |
| Janela | data, duração, congelamento e comunicação | carga/virada |
| Virada | autoridade de aborto, prazo de decisão, sala externa e mensagens | carga/virada |
| Pré-carga | validade máxima após `NO-GO` e destino dos extratos temporários | carga real |
| Acesso de carga | identidades, ações, empresas, expiração e entrega allowlisted de `MIGRACAO_PRE_GO` | carga real |
| Fence | dono, geração, drenagem, reabertura em falha e prova temporal do último delta | `GO` |
| Fontes | proprietários, snapshot, contagens e totais reais | carga real |
| Documentos | semente anual de recibos por empresa/ano | `GO` |
| Tempo | fonte e tolerância de sincronização de relógios | `GO` |
| Evidências | repositório definitivo e retenção operacional | `ETP-11` |
| Compatibilidade | navegadores e tecnologias assistivas finais | `GAT-10` |
| Segurança | nome do revisor independente | `GAT-10` |
| Retenção | política depois do mínimo de seis anos | produção |
| Tecnologia | versões exatas de runtime/bibliotecas suportadas | `ETP-00` |
| Futuro | parâmetros de `MF-01`, somente se priorizada | não bloqueia V1 |

Nenhum desses campos recebe valor inventado. O Documento 23A é o registro controlado de fechamento.

---

# 37. Critérios de aprovação deste documento

O usuário poderá aprovar o Documento 23 quando confirmar que:

- planejamento, candidato, prontidão de virada e autorização de produção são estados diferentes;
- a competência inicial é por empresa;
- recomenda-se coordenar os três CNPJs numa única virada;
- os mais de 300 inativos são fixture sintética, não carga histórica real;
- entram vínculos/contratos ativos no snapshot, encerramentos legítimos trazidos pelo delta e somente os fatos atuais necessários definidos neste documento;
- o bootstrap cria e ativa conjuntamente dois masters, depois um master cria o modelo global e as empresas pelo fluxo normal;
- não haverá movimentação financeira anterior ao corte;
- K07 representa somente pagamento real da competência de corte;
- haverá duas cargas secas sintéticas e uma carga real final controlada;
- a pré-carga pode ocorrer em produção fechada durante alguns dias;
- a fonte anterior continua oficial até o `GO`;
- toda mudança depois do snapshot entra no registro de deltas;
- o manifesto é autoridade técnica persistida e fechada por tentativa; somente depois dos deltas finais cada empresa+ano recebe semente única, ausência dupla sem raiz ou verificação de semente imutável, com capacidade efêmera revogada antes da decisão e zero efeito fora da janela;
- decisões DP/Contábil são pessoais, conteúdo selado e reconciliação têm hashes distintos, `ENT-IMP-05` torna um terminal inelegível sem reabri-lo e o fence elimina a corrida delta×`GO`;
- `MIGRACAO_PRE_GO` permite somente a carga nominal restrita; toda mutação normal, inclusive futura, exige sistema autoritativo na época corrente;
- o retorno em `T_RET` e a reentrada em `T_REENT` transferem também a autoridade da numeração, preservando emitidos, reservas, incertezas e lacunas sem reutilização;
- a primeira emissão legítima de cada empresa+ano inicial é reconciliada antes de liberar a emissão seguinte da mesma chave;
- não existe escrita dupla silenciosa;
- artefato homologado será promovido sem recompilação;
- rollback de código, rollforward, restauração e retorno operacional são operações diferentes;
- RPO de uma hora e RTO de oito horas úteis serão demonstrados;
- se não houver corte comum confiável dentro do RPO, integridade prevalece, a violação é registrada, o intervalo é reconstruído/reconciliado por evidência confiável e nenhuma abertura ocorre sem decisão nominal sobre o resultado e eventual perda residual;
- restauração integral ocorrerá antes da produção e trimestralmente;
- condições de `NO-GO` e aborto são objetivas;
- não haverá abertura com `SEV-0/1` ou vulnerabilidade crítica/alta;
- todos os responsáveis e substitutos estarão nomeados antes do corte;
- smoke em produção será limitado e seguro;
- hipercuidado cobrirá o primeiro adiantamento normal do sistema, o primeiro final e o fechamento da competência, terminando dois dias úteis após o marco mais tardio; K07 não conta como adiantamento normal;
- `MF-01` continua fora da V1;
- aprovar este documento permite preparar a `ETP-00`, mas não autoriza produção.

---

# 38. Próximas etapas

Depois da aprovação deste Documento 23 e dos anexos:

1. atualizar a baseline do Documento Mestre;
2. criar o repositório de produção e os validadores da `ETP-00`;
3. fixar versões suportadas de runtime e ferramentas;
4. implementar `ETP-00` a `ETP-10`, preenchendo em paralelo os parâmetros e responsáveis já conhecíveis do Documento 23A;
5. entrar em `ETP-11` e executar, somente com dados sintéticos, cargas secas, restauração isolada, incidente, segurança, acessibilidade, capacidade e todo o pacote 22;
6. operacionalizar os runbooks, concluir `GAT-10` e produzir o candidato imutável;
7. alcançar `ETP-11` e `MAR-06` com os respectivos termos aprovados;
8. somente então completar parâmetros da janela real, autorizar seu uso e iniciar a pré-carga fechada; a infraestrutura de produção poderá ter sido provisionada e endurecida vazia antes, sem dado real, tráfego ou uso funcional;
9. executar o Documento 23C e decidir `GO/NO-GO` na futura virada.

Nenhuma carga real ou implantação é iniciada agora.

---

**Situação desta versão:** aprovada integralmente pelo usuário em 22/08/2026.  
**Estados de execução:** `D23PlanningReady = true`; `CutoverReady = false`; `ProductionGo = false`; procedimentos `NOT_RUN_PLANNED`.  
**Próxima ação na data da aprovação:** preparar o repositório e iniciar a `ETP-00 — Baseline executável`, seguindo os Documentos 21 e 22; o código de produção ainda não havia sido iniciado.  
**Checkpoint posterior:** baseline em implementação controlada conforme `docs/ETP-00.md`; nenhuma carga real ou implantação de produção foi iniciada.
