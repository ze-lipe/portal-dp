# Documento 23A

## Registro de Parâmetros, Responsáveis e Prontidão Pré-Produção

> **Status:** aprovado integralmente pelo usuário em 22/08/2026.  
> **Data-base:** 22 de agosto de 2026.  
> **Autoridade:** Documento 23.  
> **Finalidade:** manter campos reais ainda não conhecidos como bloqueadores visíveis, sem inventar valores.

---

# 1. Regra de uso

Este registro é preenchido progressivamente durante `ETP-00` a `ETP-11`. Aprovar o modelo não aprova os valores futuros.

Estados permitidos:

| Estado | Significado |
|---|---|
| `PENDENTE` | ainda não definido ou sem evidência |
| `EM_VALIDAÇÃO` | proposta existe, mas falta prova ou aceite |
| `APROVADO` | valor, responsável e evidência aceitos |
| `REJEITADO` | proposta recusada; impede o gate até substituição |
| `NÃO_APLICÁVEL` | somente quando o item é condicional e existe justificativa aprovada |

Regras:

- nenhum item obrigatório pode ficar vazio;
- `A DEFINIR` é uma pendência explícita, nunca aprovação;
- toda alteração preserva versão, autor, data, motivo e evidência;
- item `REJEITADO` ou `PENDENTE` no seu gate produz `NO-GO`;
- `MF-01` pode ficar `NÃO_APLICÁVEL À V1` sem bloquear a primeira versão.

---

# 2. Registro mestre de parâmetros

| ID | Parâmetro | Valor atual | Responsável pelo fechamento | Limite | Evidência | Estado inicial | Bloqueia |
|---|---|---|---|---|---|---|---|
| `PRM-001` | provedor de hospedagem | A DEFINIR | `ROL-OPS` | antes de `BK-362` | decisão técnica/comercial | `PENDENTE` | produção |
| `PRM-002` | região e residência de dados | A DEFINIR | `ROL-OPS` + `ROL-JUR` | antes de provisionar produção | inventário/região | `PENDENTE` | produção |
| `PRM-003` | orçamento mensal aprovado | A DEFINIR | `ROL-PROD` | antes da contratação | aprovação | `PENDENTE` | contratação |
| `PRM-004` | uma ou duas réplicas web | A DEFINIR | `ROL-OPS` + `ROL-PROD` | antes do SLO final | topologia | `PENDENTE` | promessa de disponibilidade |
| `PRM-005` | banco com failover ou restauração controlada | A DEFINIR | `ROL-OPS` | antes de `GAT-10` | arquitetura implantada | `PENDENTE` | SLO/produção |
| `PRM-006` | provedor de e-mail | A DEFINIR | `ROL-OPS` | antes de `ETP-01` em produção | contrato/teste | `PENDENTE` | convite/recuperação |
| `PRM-007` | domínio, remetente, SPF, DKIM e DMARC | A DEFINIR | `ROL-OPS` + `ROL-SEG` | antes do smoke | verificações DNS/entrega | `PENDENTE` | abertura de usuários |
| `PRM-008` | provedor de CEP | A DEFINIR | `ROL-ENG` | antes de produção | teste e contingência | `PENDENTE` | não bloqueia se manual funciona |
| `PRM-009` | armazenamento de objetos | A DEFINIR | `ROL-OPS` | antes de `ETP-06` | inventário/ACL | `PENDENTE` | recibos/Excel |
| `PRM-010` | KMS e cofre de segredos | A DEFINIR | `ROL-SEG` + `ROL-OPS` | antes de produção | inventário/rotação | `PENDENTE` | produção |
| `PRM-011` | observabilidade e monitor externo | A DEFINIR | `ROL-OPS` | antes de `GAT-10` | painéis/alertas | `PENDENTE` | `GO` |
| `PRM-012` | repositório definitivo de evidências e `registro_externo_autoridade` independente do app/banco, append-only, com CAS, cadeia `ProductionGo`/`T_GO`/`T_RET`/`T_REENT`/`authority_epoch` | A DEFINIR | `ROL-QA` + `ROL-SEG` | antes da primeira evidência executada | ACL/checksum/retenção; época/hash anterior; escrita condicional; restauração e reconciliação idempotentes | `PENDENTE` | `ETP-11` |
| `PRM-013` | disponibilidade mensal formal | A DEFINIR | `ROL-PROD` + `ROL-OPS` | antes da política de serviço | SLO aprovado | `PENDENTE` | somente promessa/SLO |
| `PRM-014` | janela e horário de suporte | A DEFINIR | `ROL-PROD` + `ROL-OPS` | antes do ensaio RTO final | calendário | `PENDENTE` | medição RTO/produção |
| `PRM-015` | prazo de reconhecimento da severidade operacional do alerta | A DEFINIR | `ROL-OPS` + `ROL-INC` | antes de `GAT-10` | matriz de escalonamento | `PENDENTE` | alertas/produção |
| `PRM-016` | retenção de snapshot/base backup | A DEFINIR | `ROL-OPS` | antes do primeiro backup real | política/configuração | `PENDENTE` | `GO` |
| `PRM-017` | janela imutável, cópia isolada, chaves históricas, cadeia de autoridade recuperável, disponibilidade do registro externo e cenário de credencial/chave comprometida | A DEFINIR | `ROL-OPS` + `ROL-SEG` | antes da restauração | isolamento, restauração criptográfica/autoridade, CAS externo e exercício de comprometimento | `PENDENTE` | `GO` |
| `PRM-018` | agenda trimestral de restauração | A DEFINIR | `ROL-OPS` | antes da produção | calendário | `PENDENTE` | `GO` |
| `PRM-019` | custódia da conta de emergência da infraestrutura/nuvem, fora do produto e sem identidade master ou `BYPASSRLS` | A DEFINIR | `ROL-SEG` + `ROL-PROD` | antes do exercício de incidente | termo de custódia e prova de separação do produto | `PENDENTE` | `GO` |
| `PRM-020` | política de IP/User-Agent | A DEFINIR | `ROL-JUR` + `ROL-SEG` | antes da coleta em produção | decisão de minimização | `PENDENTE` | produção |
| `PRM-021` | política depois de seis anos | A DEFINIR | `ROL-JUR` + `ROL-PROD` | antes da produção | política aprovada | `PENDENTE` | produção |
| `PRM-022` | navegadores/tecnologias assistivas | A DEFINIR | `ROL-QA` | antes do `GAT-10` | matriz executada | `PENDENTE` | `GAT-10` |
| `PRM-023` | revisor independente de segurança | A DEFINIR | `ROL-SEG` | antes da revisão final | nome/escopo/relatório | `PENDENTE` | `GAT-10` |
| `PRM-024` | versões exatas de runtime/bibliotecas | A DEFINIR NA `ETP-00` | `ROL-ENG` | entrada da `ETP-00` | lockfiles/baseline | `PENDENTE` | implementação |
| `PRM-025` | parâmetros/fornecedor de `MF-01` | NÃO APLICÁVEL À V1 | `ROL-PROD` | somente se priorizada | nova decisão | `NÃO_APLICÁVEL` | não bloqueia V1 |
| `PRM-026` | domínio real dos URIs de Problem Details | A DEFINIR | `ROL-ENG` + `ROL-SEG` | antes do candidato | OpenAPI/DNS/configuração | `PENDENTE` | `GAT-10` |
| `PRM-027` | limites finais de logo e rate limits, iguais ou mais restritivos que o baseline | A DEFINIR | `ROL-ENG` + `ROL-SEG` | antes dos testes finais | configuração/casos | `PENDENTE` | `GAT-10` |
| `PRM-028` | validade máxima de pré-carga real mantida fechada após `NO-GO` | A DEFINIR | `ROL-IMP` + `ROL-DP` + `ROL-SEG` | antes de `WIN-001` | decisão temporal/controles | `PENDENTE` | carga real |
| `PRM-029` | local, acesso, prazo e eliminação dos extratos temporários reais | A DEFINIR | `ROL-SEG` + `ROL-JUR` + `ROL-DP` | antes da primeira extração | ACL/cifra/termo | `PENDENTE` | carga real |
| `PRM-030` | plano `ENT-IMP-01/02/03/04/05`: identidades `MIGRACAO_PRE_GO` (master ou comum nominal), empresas/classes/ações/expiração; invocadores de PREPARAR/PROMOVER/FINALIZAR/INVALIDAR_GO; aprovadores pessoais; operador eventual de `API-REC-009`; dono do fence, revisores, canal e revogação | A DEFINIR | `ROL-CTB` + `ROL-DP` + `ROL-SEG` + `ROL-OPS` | antes da janela real | RACI nominal; convite allowlisted; capacidades restritas; segregação; fence/dreno; consumo/revogação e corridas exercitadas | `PENDENTE` | janela real |
| `PRM-031` | fonte de tempo, tolerância e plano de fence por `SRC-*`: mecanismo de bloqueio/somente leitura, geração, ACK, drenagem, corte e reabertura | A DEFINIR | `ROL-OPS` + `ROL-SEG` | antes da carga seca 2 | configuração por fonte; todos os ACKs na mesma geração; falha/reabertura ensaiadas | `PENDENTE` | `GO` |
| `PRM-032` | decisão pós-delta por manifesto+entrada+empresa+ano+`ciclo_aplicacao_id`: `candidato_final_versao/hash` e `ledger_conteudo_versao/hash`; nova semente, ausência dupla ou semente existente; decisões pessoais distintas DP/Contábil | A DEFINIR NA EXECUÇÃO | `ROL-CTB` + `ROL-DP` | depois do último delta e antes de `CTL-IMP-003/FINALIZAR` | `ENT-IMP-03` append-only sobre hashes exatos; identidade própria, origem/prova e eventual operador de `PRM-030` vinculados | `PENDENTE` | `CTL-IMP-003`/`GO` |

`PRM-030` aprova configuração e pessoas, nunca candidato, valor ou ramo. `MIGRACAO_PRE_GO` é adicional à permissão normal, só nasce depois de `CTL-IMP-001/PROMOVER` para manifesto `APROVADO` já persistido e antes da primeira ação que a exige; fica limitada ao manifesto/ações nominados e incapaz de confirmar pagamento, emitir recibo definitivo ou produzir entrega externa; expira/revoga no fechamento, `NO-GO` ou troca de autoridade. `PRM-032` é repetível por manifesto+entrada+empresa+ano+ciclo. `REABERTO`, candidato novo ou novo `ledger_conteudo_hash` invalida decisões dependentes sem apagá-las; cada aprovador decide na própria sessão e o executor técnico não o representa.

O `registro_externo_autoridade` não é uma segunda fonte funcional. É o ponto de compromisso recuperável das trocas de autoridade quando o ambiente afetado não pode gravar. Cada evento contém instalação, época monotônica, hash/época anterior esperados, fonte anterior/nova, marco `T_GO`, `T_RET` ou `T_REENT`, manifesto/fence/mapa numérico aplicáveis, decisores, instante e hash encadeado. Somente um sucessor confirma por CAS. A fonte de destino permanece bloqueada até a confirmação durável; `ENT-IMP-04` é reconciliada idempotentemente com esse evento antes de o sistema aceitar qualquer mutação.

---

# 3. Competência, carga e janela

Identificadores `EMP-01`, `EMP-02` e `EMP-03` são placeholders; não substituem razão social ou CNPJ no preenchimento real.

| ID | Empresa | Competência inicial | Adiantamento já ocorreu? | K07 esperado? | Snapshot da fonte | Dono da fonte | Estado |
|---|---|---|---|---|---|---|---|
| `CUT-EMP-01` | `EMP-01` | A DEFINIR | A DEFINIR | A DEFINIR | A DEFINIR | A DEFINIR | `PENDENTE` |
| `CUT-EMP-02` | `EMP-02` | A DEFINIR | A DEFINIR | A DEFINIR | A DEFINIR | A DEFINIR | `PENDENTE` |
| `CUT-EMP-03` | `EMP-03` | A DEFINIR | A DEFINIR | A DEFINIR | A DEFINIR | A DEFINIR | `PENDENTE` |

| ID | Janela | Início | Fim/limite | Autoridade | Comunicação | Estado |
|---|---|---|---|---|---|---|
| `WIN-001` | pré-carga real em produção fechada | A DEFINIR | A DEFINIR | A DEFINIR | A DEFINIR | `PENDENTE` |
| `WIN-002` | congelamento técnico | A DEFINIR | `GO/NO-GO` | A DEFINIR | A DEFINIR | `PENDENTE` |
| `WIN-003` | virada | A DEFINIR | A DEFINIR | A DEFINIR | A DEFINIR | `PENDENTE` |
| `WIN-004` | hipercuidado | `GO` | o mais tardio entre competência inicial fechada/reconciliada +2 dias úteis e primeiro adiantamento normal do sistema +2 dias úteis | A DEFINIR | A DEFINIR | `PENDENTE` |

| ID | Decisão da virada | Valor | Responsável | Evidência | Estado |
|---|---|---|---|---|---|
| `DEC-001` | autoridade nominal de aborto | A DEFINIR | `ROL-PROD` + `ROL-IMP` | aceite nominal | `PENDENTE` |
| `DEC-002` | limite para decidir `GO/NO-GO` | A DEFINIR | `ROL-IMP` + `ROL-PROD` | cronograma aprovado | `PENDENTE` |
| `DEC-003` | canal externo da sala de situação | A DEFINIR | `ROL-IMP` + `ROL-INC` | teste de acesso | `PENDENTE` |
| `DEC-004` | mensagens aprovadas de abertura, `NO-GO`, aborto e contingência | A DEFINIR | `ROL-PROD` + `OWN-013` | modelos aprovados | `PENDENTE` |

Critérios:

- a decisão deve dizer se as três empresas usarão a mesma competência;
- se forem diferentes, cada justificativa e sequência de ativação precisa estar aprovada antes de `T-1`;
- nenhuma empresa é improvisadamente excluída da virada;
- duração planejada usa o tempo da carga seca 2 mais margem documentada.

---

# 4. Responsáveis e substitutos

| ID | Função | Titular | Substituto | Canal externo | Disponível na janela? | Evidência | Estado |
|---|---|---|---|---|---|---|---|
| `OWN-001` | produto/direção | A DEFINIR | A DEFINIR | A DEFINIR | A DEFINIR | nome/aceite | `PENDENTE` |
| `OWN-002` | implantação | A DEFINIR | A DEFINIR | A DEFINIR | A DEFINIR | nome/aceite | `PENDENTE` |
| `OWN-003` | engenharia | A DEFINIR | A DEFINIR | A DEFINIR | A DEFINIR | nome/aceite | `PENDENTE` |
| `OWN-004` | infraestrutura/operação | A DEFINIR | A DEFINIR | A DEFINIR | A DEFINIR | nome/aceite | `PENDENTE` |
| `OWN-005` | segurança | A DEFINIR | A DEFINIR | A DEFINIR | A DEFINIR | nome/aceite | `PENDENTE` |
| `OWN-006` | qualidade | A DEFINIR | A DEFINIR | A DEFINIR | A DEFINIR | nome/aceite | `PENDENTE` |
| `OWN-007` | DP/operação funcional | A DEFINIR | A DEFINIR | A DEFINIR | A DEFINIR | nome/aceite | `PENDENTE` |
| `OWN-008` | contábil | A DEFINIR | A DEFINIR | A DEFINIR | A DEFINIR | nome/aceite | `PENDENTE` |
| `OWN-009` | jurídico/privacidade | A DEFINIR | A DEFINIR | A DEFINIR | A DEFINIR | nome/aceite | `PENDENTE` |
| `OWN-010` | coordenação de incidente | A DEFINIR | A DEFINIR | A DEFINIR | A DEFINIR | nome/aceite | `PENDENTE` |
| `OWN-011` | backup/restauração | A DEFINIR | A DEFINIR | A DEFINIR | A DEFINIR | nome/aceite | `PENDENTE` |
| `OWN-012` | alertas/monitoramento | A DEFINIR | A DEFINIR | A DEFINIR | A DEFINIR | nome/aceite | `PENDENTE` |
| `OWN-013` | comunicação interna | A DEFINIR | A DEFINIR | A DEFINIR | A DEFINIR | nome/aceite | `PENDENTE` |
| `OWN-014` | master funcional — identidade inicial 1 | A DEFINIR | A DEFINIR para cobertura após o bootstrap | A DEFINIR | A DEFINIR | identidade pessoal/aceite/primeiro acesso/TOTP/recuperação/ativação conjunta | `PENDENTE` |
| `OWN-015` | master funcional — identidade inicial 2 | A DEFINIR | A DEFINIR para cobertura após o bootstrap | A DEFINIR | A DEFINIR | identidade pessoal/aceite/primeiro acesso/TOTP/recuperação/ativação conjunta | `PENDENTE` |

Responsável sem substituto não atende o gate. O canal de acionamento precisa funcionar quando a aplicação estiver indisponível.

`OWN-014` e `OWN-015` identificam pessoas distintas, com e-mails pessoais distintos, e mapeiam o papel `ROL-MST`. Os dois titulares são obrigatórios no bootstrap: cada um sai de `PENDENTE_PRIMEIRO_ACESSO` para `PRONTO_AGUARDANDO_PAR` somente pelos próprios atos, e ambos chegam a `ATIVADO_CONJUNTAMENTE` no mesmo commit que torna o agregado `CONSUMIDO`. A cobertura indicada como substituição vale somente depois dessa ativação, exige outro master apto e nunca autoriza uma pessoa a concluir o acesso, conhecer o segredo ou operar em nome da outra.

---

# 5. Homologadores nominais

| ID | Área | Nome | Escopo de aceite | Evidência esperada | Estado |
|---|---|---|---|---|---|
| `HML-001` | Engenharia | A DEFINIR | artefato, esquema, migração e compatibilidade | termo técnico | `PENDENTE` |
| `HML-002` | Segurança | A DEFINIR | isolamento, identidade, arquivos e revisão independente | relatório/termo | `PENDENTE` |
| `HML-003` | DP/operação | A DEFINIR | carga, cadastros, competência, ASO e operação | termo operacional | `PENDENTE` |
| `HML-004` | Contábil | A DEFINIR | D30, K06/K07, pagamentos, valores e recibos | termo contábil | `PENDENTE` |
| `HML-005` | Jurídico/privacidade | A DEFINIR | recibos, ASO mínimo, dados, retenção e incidente | termo jurídico | `PENDENTE` |
| `HML-006` | Produto/direção | A DEFINIR | integração, risco residual e `GO/NO-GO` | decisão final | `PENDENTE` |
| `HML-007` | Operação de infraestrutura | A DEFINIR | deploy, alerta, backup, restauração e suporte | termo operacional técnico | `PENDENTE` |

---

# 6. Matriz RACI

Legenda: `R` executa, `A` responde/aprova, `C` consulta, `I` informado.

| Atividade | PROD | IMP | ENG | OPS | SEG | QA | DP | CTB | JUR | INC | MST |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| escolher competência | I | C | I | I | I | C | A/R | A/R | I | I | I |
| preparar ambiente | I | C | R | A/R | C | C | I | I | I | I | I |
| congelar artefato | I | A | R | R | C | C | I | I | I | I | I |
| executar carga seca | I | A | C | C | C | R | R | C | I | I | R |
| preparar fonte real | I | C | I | C | C | C | A/R | R | C | I | I |
| invocar o bootstrap técnico de uso único | I | A | C | R | R | C | I | I | I | I | I |
| concluir atos pessoais e ativar conjuntamente os dois masters | I | A | I | I | C | C | I | I | I | I | R |
| criar modelo, empresas, perfis, usuários e associações iniciais | I | A | C | I | C | C | C | I | I | I | R |
| executar pré-carga | I | A | C | C | I | C | R | C | I | I | R |
| reconciliar cadastros | I | A | C | I | C | R | R | C | I | I | C |
| reconciliar K07 | I | A | I | I | I | C | R | A/R | I | I | I |
| preparar/versionar escopo e candidatos, sem registrar decisão alheia | I | A | C | R | R | C | C | C | I | I | I |
| registrar decisões pessoais `ENT-IMP-03` de escopo/final | I | A | C | C | C | C | R | R | I | I | I |
| promover/finalizar/fechar/invalidar por `CTL-IMP-001–004` | I | A | C | R | R | C | C | C | I | I | I |
| executar `API-REC-009`, confirmar ausência ou verificar seed existente | I | A | C | I | C | C | R | A/R | I | I | I |
| publicar/migrar | I | A | R | R | C | C | I | I | I | I | I |
| decidir `GO/NO-GO` | A | R | C | C | C | C | C | C | C | I | C |
| executar smoke | I | A | C | C | C | R | R | C | I | I | R |
| abortar antes do compromisso | A | R | C | C | C | C | I | I | I | I | I |
| restaurar | I | C | C | A/R | C | C | I | I | I | C | I |
| declarar/coordenar incidente | I | I | C | C | C | I | C | I | C | A/R | C |
| sair do hipercuidado | A | R | C | C | C | C | R | C | C | I | C |

Nas fases técnicas, exatamente uma pessoa de OPS ou Segurança prepara/promove/finaliza/invalida; a outra revisa. Cada pessoa DP/Contábil registra sua própria decisão em `ENT-IMP-03`; nenhuma fase técnica cria aprovação em nome dela. Os formulários pré-`GO` só podem ser usados pelas identidades pessoais de `PRM-030` — inclusive masters, se nominados — com permissão normal mais `MIGRACAO_PRE_GO`. `API-REC-009` tem um operador pessoal exato e revisão distinta. Ninguém compartilha conta ou aprova o próprio ato sozinho.

Acúmulo de papéis não elimina a revisão independente exigida para financeiro e segurança.

Na invocação técnica, exatamente uma pessoa nominal de `ROL-OPS` **ou** `ROL-SEG` executa; a outra área e `ROL-QA` realizam a revisão separada prevista no caderno de carga. A marcação `R` nas duas colunas indica elegibilidade alternativa, não dupla execução. Na linha seguinte, `ROL-MST` significa conjuntamente `OWN-014` e `OWN-015`: cada titular executa apenas senha, TOTP e recuperação próprios; nenhum deles invoca o comando técnico ou conclui pelo outro. A ativação do par é efeito atômico do protocolo, não um terceiro ato manual.

Esta RACI atribui responsabilidade, não permissão de produto. Toda execução usa identidade pessoal e continua subordinada ao escopo, às capacidades globais/empresariais, à ação, ao objeto, ao estado, ao campo, à versão e à reautenticação dos Documentos 17 e 20; nenhum executor recebe `BYPASSRLS` pela função desta tabela.

---

# 7. Fontes autorizativas da carga

| ID | Classe | Fonte real | Proprietário | Snapshot | Delta permitido | Fence/somente leitura | ACK da geração e dreno | Reabertura ensaiada | Revisor | Estado |
|---|---|---|---|---|---|---|---|---|---|---|
| `SRC-001` | empresas/configurações | A DEFINIR | A DEFINIR | A DEFINIR | sim, formal | A DEFINIR | A DEFINIR | A DEFINIR | A DEFINIR | `PENDENTE` |
| `SRC-002` | usuários/associações | A DEFINIR | A DEFINIR | A DEFINIR | sim, formal | A DEFINIR | A DEFINIR | A DEFINIR | A DEFINIR | `PENDENTE` |
| `SRC-003` | empregados ativos | A DEFINIR | A DEFINIR | A DEFINIR | sim, formal | A DEFINIR | A DEFINIR | A DEFINIR | A DEFINIR | `PENDENTE` |
| `SRC-004` | MEIs/contratos ativos | A DEFINIR | A DEFINIR | A DEFINIR | sim, formal | A DEFINIR | A DEFINIR | A DEFINIR | A DEFINIR | `PENDENTE` |
| `SRC-005` | condições financeiras | A DEFINIR | A DEFINIR | A DEFINIR | sim, formal | A DEFINIR | A DEFINIR | A DEFINIR | A DEFINIR | `PENDENTE` |
| `SRC-006` | complementos vigentes | A DEFINIR | A DEFINIR | A DEFINIR | sim, formal | A DEFINIR | A DEFINIR | A DEFINIR | A DEFINIR | `PENDENTE` |
| `SRC-007` | clínicas/último ASO | A DEFINIR | A DEFINIR | A DEFINIR | sim, formal | A DEFINIR | A DEFINIR | A DEFINIR | A DEFINIR | `PENDENTE` |
| `SRC-008` | K07/pagamentos reais | A DEFINIR | A DEFINIR | A DEFINIR | sim, dupla revisão | A DEFINIR | A DEFINIR | A DEFINIR | A DEFINIR | `PENDENTE` |
| `SRC-009` | complementos avulsos e serviços adicionais da competência inicial | A DEFINIR | A DEFINIR | A DEFINIR | sim, formal | A DEFINIR | A DEFINIR | A DEFINIR | A DEFINIR | `PENDENTE` |

Uma classe sem fonte e proprietário definidos não entra na carga real.

---

# 8. Checklist de prontidão

| Gate | Condições cumulativas | Resultado inicial |
|---|---|---|
| `RDY-PLAN` | Documento 23 e anexos aprovados | `APROVADO` |
| `RDY-BUILD` | Docs. 21–23 aprovados, versões técnicas fixadas | `PENDENTE` |
| `RDY-ENV` | produção separada, fornecedores e menor privilégio | `PENDENTE` |
| `RDY-PEOPLE` | `OWN-*` e `HML-*` completos | `PENDENTE` |
| `RDY-DATA` | `CUT-*`, `SRC-*`, duas cargas secas e reconciliação aprovadas; manifesto criado antes de `MIGRACAO_PRE_GO`; identidades/capacidades nominadas; `PRM-032` corrente; hashes distintos; entradas inativas; capacidades revogadas; `go_elegivel = true`, nenhum `ENT-IMP-05`; todos os ACKs de fence na mesma geração e negações exercitados | `PENDENTE` |
| `RDY-REC` | backup/restauração dentro de RPO/RTO; chaves e cadeia `ProductionGo`/`T_GO`/`T_RET`/`T_REENT` recuperáveis; `registro_externo_autoridade`/CAS e cortes antes/depois das trocas exercitados, inclusive app/banco indisponíveis em `T_RET`, sem abrir alvo contra a autoridade corrente | `PENDENTE` |
| `RDY-SEC` | segurança independente, isolamento e incidente aprovados; `QAT-SEC-029` e `QAT-SEC-026` comprovam bootstrap singleton, ativação conjunta, consumo e ausência de replay/backdoor | `PENDENTE` |
| `RDY-RC` | `ETP-11`, `GAT-10`, artefato/hash e zero bloqueador | `PENDENTE` |
| `RDY-OPS` | todos os runbooks aplicáveis possuem ficha completa, titular/substituto e acesso; críticos foram ensaiados | `PENDENTE` |
| `RDY-CUT` | janela, presença, comunicação e retorno prontos | `PENDENTE` |
| `RDY-GO` | Documento 23C integral; decisão binária; evento CAS externo, `ENT-IMP-04` e `authority_epoch` reconciliados antes da abertura | `PENDENTE` |

---

# 9. Registro de decisão e mudança

Toda alteração futura usa:

| Campo | Regra |
|---|---|
| ID | nunca reutilizado |
| versão anterior | sempre preservada |
| proposta | valor novo e motivo |
| impacto | gates, prazo, custo, risco e reexecução |
| aprovadores | papéis e nomes aplicáveis |
| evidência | link/ID e checksum |
| vigência | instante a partir do qual vale |
| resultado | aprovada ou rejeitada |

Mudança de competência, fonte, ordem da carga, K07, artefato ou janela depois da carga seca 2 reabre a avaliação do ensaio.

---

# 10. Critério de conclusão do 23A

O Documento 23A fica operacionalmente completo somente quando:

- `PRM-001` a `PRM-024` e `PRM-026` a `PRM-032` estão aprovados ou, quando realmente condicionais, justificados como não aplicáveis;
- `PRM-025` continua fora da V1;
- `CUT-EMP-01` a `CUT-EMP-03` estão aprovados;
- `WIN-001` a `WIN-004` estão aprovados;
- `DEC-001` a `DEC-004` estão aprovados;
- todo `OWN-*` possui titular e substituto;
- todo `HML-*` possui nome e escopo aceito;
- toda fonte `SRC-001` a `SRC-009` possui proprietário, snapshot, mecanismo de fence/somente leitura, ACK/dreno na mesma geração, reabertura ensaiada e revisor;
- todos os gates `RDY-*` anteriores a `RDY-GO` passaram;
- nenhuma senha, token, TOTP ou dado sensível foi registrado neste arquivo.

---

**Situação desta versão:** modelo concluído; valores reais permanecem explicitamente pendentes.  
**Próxima ação:** aprovação do modelo com o Documento 23 e preenchimento progressivo durante o desenvolvimento.  
**Código de produção:** ainda não iniciado.
