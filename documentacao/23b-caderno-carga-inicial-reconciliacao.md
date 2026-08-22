# Documento 23B

## Caderno Executável de Carga Inicial e Reconciliação

> **Status:** aprovado integralmente pelo usuário em 22/08/2026.  
> **Data-base:** 22 de agosto de 2026.  
> **Autoridade:** Documento 23; Documento 18 §33; `BK-371` e `BK-372`.  
> **Dados reais:** proibidos nas cargas secas; permitidos somente na carga final em produção fechada.

---

# 1. Contrato de execução

Cada linha deste caderno gera um registro com:

- ID;
- execução (`DRY-1`, `DRY-2` ou `REAL`);
- ambiente;
- empresa ou escopo global;
- instante inicial/final;
- executor;
- revisor;
- versão da fonte/fixture;
- contagem de entrada;
- contagem aceita;
- rejeições e motivos;
- evidência/checksum;
- situação `NÃO_INICIADO`, `EM_EXECUÇÃO`, `APROVADO`, `REPROVADO`, `BLOQUEADO` ou `INVALIDADO`; esta última preserva a evidência anterior, mas proíbe usá-la no ciclo atual.

Uma linha reprovada não é sobrescrita. Nova tentativa recebe execução/versão nova e referência à anterior.

---

# 2. Proibições

- não copiar dados reais para local, CI ou homologação;
- não fabricar competência, pagamento ou recibo anterior ao corte;
- não carregar inativos históricos apenas para “completar” a base;
- não importar projeção derivada como fonte;
- não registrar K07 sem pagamento real comprovado;
- não emitir recibo para K07;
- não usar planilha temporária desprotegida;
- não corrigir divergência diretamente no banco;
- não avançar etapa dependente com predecessor reprovado;
- não transformar o roteiro em importação mensal do produto.
- não liberar job funcional, agendador, outbox empresarial, convite comum ou efeito externo; só bootstrap e primeiro acesso dos nomes `MIGRACAO_PRE_GO` usam allowlist temporal. A capacidade de migração não permite pagamento/recibo/entrega; continuidade e segurança permanecem ativas.

---

# 3. Carga seca 1 — descoberta

| ID | Ação | Resultado esperado | Executor | Revisor | Evidência | Falha bloqueia |
|---|---|---|---|---|---|---|
| `IMP-DRY-001` | criar base limpa sintética | zero dado anterior e versão correta | ENG/OPS | QA | manifesto de schema | carga |
| `IMP-DRY-002` | simular bootstrap único de dois masters pendentes, primeiro acesso/TOTP, ativação conjunta e autodesativação | exatamente dois aptos; zero acesso antecipado, senha padrão, conta ou rota residual | MST/DP | SEG | testes de acesso/bootstrap | etapa seguinte |
| `IMP-DRY-003` | criar modelo global e três empresas sintéticas pelo fluxo normal | master apto, versão de modelo, CNPJ/configuração/competência válidos | MST/DP | SEG/QA | contagem/erros | etapa seguinte |
| `IMP-DRY-004` | carregar demais modelos, perfis e permissões | quatro estados de campo e dependências válidas | DP | SEG/QA | matriz | usuários |
| `IMP-DRY-005` | carregar usuários e associações | exatamente um perfil empresarial ativo por associação comum | DP | QA | contagem/seletor | cadastros |
| `IMP-DRY-006` | carregar empregados ativos sintéticos | CPF, datas, vínculos e endereço válidos | DP | QA | relatório | condições |
| `IMP-DRY-007` | carregar MEIs/contratos ativos sintéticos | CNPJ, endereço, vigência e contrato sem sobreposição | DP | QA | relatório | competência |
| `IMP-DRY-008` | carregar condições e complementos recorrentes vigentes | vigências válidas, total derivado e nenhuma projeção carregada | DP | CTB/QA | relatório financeiro | competência |
| `IMP-DRY-009` | carregar clínicas/último ASO | clínica global e referência determinística sem dado proibido | DP | JUR/QA | relatório ASO | alerta/controle |
| `IMP-DRY-010` | criar competência/participantes; registrar candidatos; aplicar delta e três ramos; simular o primeiro recibo legítimo de cada empresa+ano e pausar a chave até reconciliar número/manifesto/autoridade, sem recibo artificial | zero raiz antecipada; decisões próprias; próximo número projetado correto e, só após `GO` sintético, primeira faixa exata; resposta incerta usa reconciliação | DP | CTB/QA | consultas negativa/positiva, manifesto e memória | K07 |
| `IMP-DRY-011` | simular K07, inexistência e a bifurcação pago/não pago dos avulsos e serviços adicionais | caso já pago existe somente como K07, sem lançamento normal nem recibo; caso não pago permanece somente no fluxo normal; unicidade, auditoria e K06 coerente | DP | CTB/QA | memória, trilha e consultas de exclusividade | pagamento final |
| `IMP-DRY-012` | reconciliar e medir | divergências classificadas e roteiro corrigido | QA | DP/CTB/ENG | termo DRY-1 | DRY-2 |

Aceite da carga seca 1:

- ordem completa executada;
- tempos registrados;
- ambiguidades e dados ausentes identificados;
- falhas viraram correção do roteiro, regra de validação ou decisão controlada;
- nenhum dado real detectado;
- relatório assinado.

---

# 4. Carga seca 2 — ensaio geral

| ID | Ação | Resultado esperado | Executor | Revisor | Evidência | Falha bloqueia |
|---|---|---|---|---|---|---|
| `IMP-DRY-013` | recriar base limpa | nenhuma sobra da carga 1 | OPS | QA | manifesto | ensaio |
| `IMP-DRY-014` | congelar roteiro/fixture | versões e hashes únicos | QA | ENG | manifesto | ensaio |
| `IMP-DRY-015` | executar ordem com identidades pessoais, permissões normais e `MIGRACAO_PRE_GO` iguais à janela real; tentar ação/empresa/convite fora da allowlist | somente nomes de `PRM-030` operam, sem representação ou efeito de compromisso; revogação funciona | DP/OPS | QA/SEG | trilha/capacidades | `CutoverReady` |
| `IMP-DRY-016` | usar volume representativo, enriquecendo apenas a fixture de capacidade com inativos | 65 ativos, >300 inativos exclusivamente sintéticos, 100 participantes e 10 sessões; inativos fora do manifesto real | QA | OPS | contagens/manifesto da fixture | capacidade |
| `IMP-DRY-017` | provar isolamento durante a carga | A×B×inexistente sem vazamento | SEG/QA | ENG | casos/evidência | `GO` |
| `IMP-DRY-018` | simular snapshot e deltas | cada delta único, aplicado e conferido | DP | QA | ledger | virada |
| `IMP-DRY-019` | simular aborto e contingência completa, incluindo `RBK-018`: em `T_RET`, handoff do último número/reservas/incertos para ledger único; em `T_REENT`, importar números/lacunas e avançar raiz sem tocar seed | autoridade/`authority_epoch`, fatos, número e outbox têm fronteira única; ano futuro negado em `[T_RET,T_REENT)` e reentrada sem duplicação | IMP/QA | PROD/OPS/CTB | termo/mapa numérico/ledger | retorno |
| `IMP-DRY-020` | exercitar fases `CTL-IMP-001–004`, decisões próprias, hashes conteúdo×reconciliação, `entrada_ativa NULL`/reativação, três ramos e corridas; testar delta×`GO`, ACKs por `SRC-*`, falhas antes/depois do CAS e `ENT-IMP-05` pós-terminal | pré-003: novo ciclo; pós-003 não terminal: `FECHADO_NO_GO`; reconciliado: `INVALIDAR_GO` sem reterminalizar; delta primeiro bloqueia `GO`, `GO` primeiro rejeita o delta e exige fluxo normal do sistema; ACK/fence falho reabre fonte antes do CAS; depois do CAS permanece fechado até reconciliar; zero emissão indevida | DP/CTB | QA/ENG/SEG | trilha concorrente, hashes, ACKs, CAS, fence e consultas negativas | financeiro |
| `IMP-DRY-021` | executar migração limpa e n-1 | expand/contract e compatibilidade válidos | ENG/OPS | QA | relatório | publicação |
| `IMP-DRY-022` | executar reconciliação total | zero divergência obrigatória | QA/DP/CTB | PROD | manifesto | `GO` |
| `IMP-DRY-023` | medir duração e margem | janela real comporta p95/maior tempo com margem aprovada | IMP | PROD/OPS | cronograma | janela |
| `IMP-DRY-024` | assinar ensaio geral | QA, DP, CTB, ENG, SEG e OPS aprovam | QA | PROD | termo DRY-2 | carga real |

Mudança material após `IMP-DRY-024` reabre o ensaio conforme Documento 23 §14.2.

---

# 5. Preparação da fonte real

| ID | Controle | Resultado esperado | Dono | Revisor | Evidência |
|---|---|---|---|---|---|
| `IMP-SRC-001` | identificar fonte de empresas | uma fonte e proprietário | DP | QA | `SRC-001` |
| `IMP-SRC-002` | identificar fonte de usuários | uma fonte e proprietário | MST/DP | SEG | `SRC-002` |
| `IMP-SRC-003` | identificar fonte de empregados | somente ativos no corte | DP | QA | `SRC-003` |
| `IMP-SRC-004` | identificar fonte de MEI | somente contratos ativos | DP | QA | `SRC-004` |
| `IMP-SRC-005` | identificar fontes financeiras e reservas externas de recibos | condições, recorrentes, avulsos e serviços adicionais vigentes/futuros conhecidos; maior número compatível por empresa/ano ou ausência comprovada para decisão `PRM-032` | DP/CTB | QA | `SRC-005/006/009` + manifesto da semente |
| `IMP-SRC-006` | identificar fonte de clínica/ASO | último ASO necessário | DP | JUR/QA | `SRC-007` |
| `IMP-SRC-007` | identificar pagamentos do corte | somente valores realmente pagos | CTB/DP | QA | `SRC-008` |
| `IMP-SRC-008` | sanear duplicidades/datas | zero conflito obrigatório antes de digitar | donos | QA | relatório de saneamento |
| `IMP-SRC-009` | proteger fonte temporária | ACL, cifra, prazo e eliminação definidos | SEG/DP | JUR | registro de proteção |
| `IMP-SRC-010` | gerar snapshot identificado | instante/hash/versão por classe | donos | QA | manifesto do snapshot |

Saneamento acontece na fonte autoritativa ou por decisão explicitamente documentada. A carga não “corrige silenciosamente” o dado real.

---

# 6. Registro de deltas

Cada delta usa os campos:

| Campo | Obrigatoriedade/regra |
|---|---|
| `delta_id` | obrigatório, único e nunca reutilizado |
| `tentativa_carga_id` / `ciclo_aplicacao_id` | obrigatórios; somente antes de `CTL-IMP-003`, com manifesto em `JANELA_ABERTA`, a reabertura cria ciclo novo na mesma tentativa; a partir de `DELTAS_APLICADOS` cria sempre tentativa/manifesto novos, e baseline limpo é adicionalmente obrigatório quando houver incompatibilidade imutável |
| empresa | obrigatória quando empresarial |
| empresa+ano possivelmente afetados | obrigatórios quando o delta puder alcançar numeração de recibo |
| classe | empresa, usuário, empregado, MEI, condição, complemento, clínica, ASO, K07, reserva/semente anual de recibo ou outra aprovada |
| impacto na numeração | `NAO_AFETA_NUMERACAO`, `AFETA_NUMERACAO` ou `INDETERMINADO`; indeterminado é tratado como afeta |
| chave da origem | obrigatória; protegida quando sensível |
| operação | criar, alterar, encerrar ou cancelar na fonte |
| versão anterior/nova | obrigatória quando existir versionamento |
| instante efetivo | obrigatório |
| executor da fonte | obrigatório |
| origem/evidência | obrigatória |
| aplicador no sistema | preenchido na aplicação |
| instante de aplicação | preenchido na aplicação |
| resultado | aplicado, rejeitado ou não aplicável com motivo |
| revisor | obrigatório antes do `GO` |
| correlação/idempotência | obrigatória |

Controles:

- cada `delta_id` é aplicado no máximo uma vez por tentativa; repetição técnica na mesma tentativa+ciclo é idempotente, e uma nova tentativa sobre baseline limpo pode reaplicar a mesma origem com correlação explícita;
- estados permitidos do ledger são `ABERTO`, `SELADO_PARA_APLICACAO`, `FECHADO_AGUARDANDO_RECONCILIACAO`, `FECHADO_RECONCILIADO`, `REABERTO` e o terminal `INVALIDADO_EXIGE_NOVA_TENTATIVA`;
- `SELADO_PARA_APLICACAO` impede nova entrada enquanto os deltas são aplicados, mas ainda não afirma reconciliação;
- depois da aplicação, `IMP-DAT-020` produz `FECHADO_AGUARDANDO_RECONCILIACAO`;
- somente `IMP-DAT-021–026`, sem divergência, produzem `FECHADO_RECONCILIADO`;
- antes de `CTL-IMP-003`: `REABERTO → novo ciclo → SELADO_PARA_APLICACAO → IMP-DAT-019 → IMP-DAT-020 → FECHADO_AGUARDANDO_RECONCILIACAO → DECIDIR_FINAL → FINALIZAR → DELTAS_APLICADOS → IMP-DAT-021–023 → SEMENTES_RESOLVIDAS → IMP-DAT-024–026 → ledger FECHADO_RECONCILIADO → CTL-IMP-004 → manifesto FECHADO_RECONCILIADO`;
- depois de `CTL-IMP-003`, delta supersede: se não terminal, `CTL-IMP-004 → FECHADO_NO_GO`; se reconciliado, `CTL-IMP-004(INVALIDAR_GO)` acrescenta `ENT-IMP-05` sem reterminalizar; nova tentativa exige manifesto/janela novos;
- delta que altere o maior número externo final ou a prova de ausência para empresa+ano com semente já persistida move o ledger para `INVALIDADO_EXIGE_NOVA_TENTATIVA`, exige `NO-GO`, baseline limpo e nova tentativa; não existe saída de resselagem;
- cancelamento externo não libera número; qualquer incerteza sobre série, empresa, ano, reserva/emissão, maior número ou declaração de ausência conta como impacto de numeração;
- reabertura invalida, sem apagar versões, `IMP-DAT-020–028`, checkpoint, prévia dos jobs, termo de carga e os `IMP-GNG-*` dependentes; no mínimo 008, 013, 014 e 015 precisam ser refeitos, além dos itens de acesso/isolamento/janela/homologação alcançados;
- nenhum delta fica `PENDENTE` no `GO`;
- arquivo do ledger obedece à proteção da fonte real;
- o fence final suspende/drena a entrada, sela geração, corte, último delta, contagem e `ledger_conteudo_versao/hash`; nada é aceito até `GO/NO-GO`, e falha reabre a fonte anterior.

O rito usa `ENT-IMP-01/02/03/04/05`. `CTL-IMP-001` separa PREPARAR/DECIDIR_ESCOPO/PROMOVER; `CTL-IMP-003`, DECIDIR_FINAL/FINALIZAR. Conteúdo selado e reconciliação têm hashes distintos. `CTL-IMP-004` fecha ou acrescenta inelegibilidade pós-terminal; `entrada_ativa` é não nula, fecha com `encerrada_em` e nunca reativa. `ENT-IMP-05` e `IMP-CUT-018` usam guarda→manifesto, resolvendo delta×`GO` sem estado duplo.

---

# 7. Carga final real

## 7.1 Fundação e acesso

| ID | Ação | Pré-condição | Resultado esperado | Executor pessoal autorizado | Revisão separada | Falha |
|---|---|---|---|---|---|---|
| `IMP-DAT-001` | confirmar produção fechada e plano nominal | `RDY-ENV`, `PRM-030` | antes do manifesto, somente bootstrap/fundação master na allowlist; depois, identidade com permissão normal+`MIGRACAO_PRE_GO` exata; demais negados | `ROL-OPS` nominal | `ROL-SEG` | abortar |
| `IMP-DAT-002` | registrar snapshot, materializar `ENT-IMP-04` e bloquear efeitos | migrações prontas | baseline autorizado restaurável; guarda/época pré-`GO`; `production_go_id` nulo; zero efeito auditado; allowlists de bootstrap/migração; continuidade ativa | `ROL-OPS` nominal | `ROL-SEG` | abortar |
| `IMP-DAT-003` | invocar bootstrap de uso único | ambiente fechado e allowlist aprovada | exatamente 2 identidades master pendentes, sem acesso operacional | `ROL-SEG` ou `ROL-OPS` nominal, com autorização técnica de bootstrap de uso único | `ROL-QA` + outro entre `ROL-SEG/OPS` que não executou | abortar |
| `IMP-DAT-004` | cada titular concluir o próprio primeiro acesso/TOTP; ativar conjuntamente | dois em `PENDENTE_PRIMEIRO_ACESSO` | primeiro fica `PRONTO_AGUARDANDO_PAR` e `master_apto=false`; o commit do par marca ambos `ATIVADO_CONJUNTAMENTE`, agregado `CONSUMIDO`, exatamente 2 aptos, recuperação exercitada e zero sessão antecipada/backdoor | `OWN-014` e `OWN-015`, cada qual exclusivamente em sua identidade pessoal | `ROL-SEG` + `ROL-QA` | abortar |
| `IMP-DAT-005` | criar modelo empresarial global inicial | master apto e catálogo válido | modelo ativo, versionado e elegível | um de `OWN-014/015`, apto e reautenticado quando exigido | o outro master + `ROL-SEG` + `ROL-QA` | abortar |
| `IMP-DAT-006` | cadastrar empresas e sua configuração de competência inicial pelo B02/API normal | modelo vigente e `CUT-EMP-*` aprovado | 3 empresas válidas, acessos master e nenhuma movimentação financeira | um de `OWN-014/015`, apto e com capacidade global B02 válida | o outro master + `ROL-DP` + `ROL-CTB` + `ROL-QA` | corrigir/repetir |
| `IMP-DAT-007` | cadastrar demais modelos/perfis; executar `CTL-IMP-001/PREPARAR`, decisões pessoais `DECIDIR_ESCOPO` e `PROMOVER` | empresas/anos, fontes, artefato, baseline e `PRM-030` válidos | perfis versionados; manifesto exato materializado; `RASCUNHO → APROVADO` somente com decisões atuais, próprias e distintas; nenhuma capacidade ainda emitida | um de `OWN-014/015` + OPS/SEG e aprovadores pessoais | outro master + `ROL-SEG` + `ROL-QA` | corrigir/abortar abertura |
| `IMP-DAT-008` | cadastrar usuários/associações; ativar somente nomes de migração; testar revogação/campos | perfis, manifesto `APROVADO` e `PRM-030` válidos | seletor exato; convite allowlisted só para nomes; `MIGRACAO_PRE_GO` por manifesto/empresa/ação; demais retidos | um de `OWN-014/015`, apto | outro master + SEG + QA | abortar abertura |

Os códigos RACI não substituem autorização. Nas linhas `IMP-DAT-009–020`, a pessoa que usa tela deve constar em `PRM-030` e apresentar permissão normal mais `MIGRACAO_PRE_GO`; a capacidade pode pertencer a master ou usuário comum nominal, nunca autoriza ação não listada e é revogada no fechamento/`NO-GO`. Cada aprovador DP/Contábil decide na própria sessão; executor técnico não o representa. Em `IMP-DAT-004`, um master nunca configura o outro.

Para os gates, o agregado `CONSUMIDO` materializa “bootstrap consumido/desabilitado”: o comando técnico não reabre, não recria membros e não deixa rota operacional residual.

## 7.2 Participantes e fontes

| ID | Ação | Pré-condição | Resultado esperado | Revisão | Falha |
|---|---|---|---|---|---|
| `IMP-DAT-009` | cadastrar empregados ativos | fonte saneada | vínculos e datas válidos | DP/QA | corrigir fonte |
| `IMP-DAT-010` | cadastrar MEIs/contratos ativos | fonte saneada | CNPJ/vigência válidos | DP/QA | corrigir fonte |
| `IMP-DAT-011` | cadastrar condições financeiras | participantes válidos | vigências sem conflito | DP/CTB/QA | abortar financeiro |
| `IMP-DAT-012` | cadastrar complementos recorrentes | condições válidas | somente ainda vigentes | DP/CTB | corrigir |
| `IMP-DAT-013` | cadastrar clínicas | catálogo global | sem duplicidade e sem revelar usos | DP/QA | corrigir |
| `IMP-DAT-014` | cadastrar último ASO | vínculo/clínica válidos | referência atual determinística | DP/JUR/QA | corrigir |

## 7.3 Competência e saldos

| ID | Ação | Pré-condição | Resultado esperado | Revisão | Falha |
|---|---|---|---|---|---|
| `IMP-DAT-015` | criar competência/participantes no manifesto aprovado; depois lançar avulsos/serviços não pagos | cadastros válidos; manifesto/escopo/hash exatos | competência e candidatos versionáveis; zero semente antecipada | DP/CTB/QA | abortar financeiro |
| `IMP-DAT-016` | registrar K07 existente | origem comprovada | unicidade, auditoria e sem recibo | DP/CTB dupla | abortar `GO` |
| `IMP-DAT-017` | confirmar ausência de K07 no manifesto restrito | nenhum pagamento real | confirmação explícita sem entidade/linha zero | DP/CTB | abortar `GO` |
| `IMP-DAT-018` | validar K06 aplicável | K07/adiantamento resolvido | nenhuma inconsistência P09-02 | DP/CTB/QA | bloquear final |
| `IMP-DAT-019` | aplicar deltas do ciclo selado e conferir anteriores | fonte congelada, `SELADO_PARA_APLICACAO` | um sucesso por tentativa+delta/ciclo; candidato recalculado; `ledger_conteudo_versao/hash` imutável ao selar | DP/QA/CTB | reabrir ou invalidar |
| `IMP-DAT-020` | fechar entrada aplicada | zero delta pendente | `FECHADO_AGUARDANDO_RECONCILIACAO`; conteúdo fixo, sem alegar reconciliação | DP/QA | `NO-GO` |

## 7.4 Reconciliação e checkpoint

| ID | Ação | Pré-condição | Resultado esperado | Revisão | Falha |
|---|---|---|---|---|---|
| `IMP-DAT-021` | após DECIDIR_FINAL/FINALIZAR, resolver/reconciliar empresa 1 | conteúdo/candidatos aprovados; capacidade só em `FINAL_APROVADO` | zero divergência; próximo número projetado, sem emissão; nenhuma dupla seed | QA/DP/CTB | `NO-GO` |
| `IMP-DAT-022` | resolver/reconciliar empresa 2 | mesmas pré-condições | mesmo contrato, sem emissão | QA/DP/CTB | `NO-GO` |
| `IMP-DAT-023` | resolver/reconciliar empresa 3 | mesmas pré-condições | mesmo contrato, sem emissão | QA/DP/CTB | `NO-GO` |
| `IMP-DAT-024` | reconciliar escopo global | três empresas aprovadas | usuários, masters, clínicas e perfis íntegros | QA/SEG | `NO-GO` |
| `IMP-DAT-025` | provar piso temporal | carga completa | zero fato financeiro anterior | QA/CTB | `NO-GO` |
| `IMP-DAT-026` | provar isolamento | carga completa | A×B×inexistente neutro | SEG/QA | abortar |
| `IMP-DAT-027` | gerar checkpoint pós-carga e prévia dos jobs temporais acumulados | reconciliação aprovada | banco/objetos/chaves no mesmo corte; data de referência, contagens esperadas e idempotência comprovadas sem efeito externo | OPS/QA/DP | `NO-GO` |
| `IMP-DAT-028` | assinar termo de carga | itens 21–27 aprovados | aceite nominal completo | PROD/IMP | `NO-GO` |

Depois de `IMP-DAT-021–026`, fixa-se `reconciliacao_ledger_versao/hash`; somente de `SEMENTES_RESOLVIDAS`, `CTL-IMP-004` fecha, revoga e grava entrada inativa+`encerrada_em`. Isso não emite número. Delta pós-003 usa `FECHADO_NO_GO` se não terminal ou `INVALIDAR_GO`/`ENT-IMP-05` se já reconciliado; ambos exigem novo manifesto/janela. Seed idêntica é verificada; mudança incompatível exige baseline limpo.

Em `DECIDIR_FINAL`, DP e Contábil distintos gravam suas decisões sobre candidato e `ledger_conteudo_hash`; `FINALIZAR` só consome esse conjunto. Em `IMP-DAT-021–023`, o operador exato de `API-REC-009` usa sessão/capacidade próprias, sem substituir aprovações. OPS/Segurança executam fases técnicas; a outra área e QA revisam.

---

# 8. Manifesto de reconciliação por empresa

Para cada `EMP-01` a `EMP-03`, preencher:

| Métrica | Fonte | Sistema | Diferença permitida | Resultado |
|---|---:|---:|---:|---|
| vínculos empregados ativos | A PREENCHER | A PREENCHER | 0 | PENDENTE |
| MEIs ativos | A PREENCHER | A PREENCHER | 0 | PENDENTE |
| contratos MEI ativos | A PREENCHER | A PREENCHER | 0 | PENDENTE |
| condições vigentes | A PREENCHER | A PREENCHER | 0 | PENDENTE |
| condições futuras conhecidas | A PREENCHER | A PREENCHER | 0 | PENDENTE |
| complementos recorrentes vigentes | A PREENCHER | A PREENCHER | 0 | PENDENTE |
| complementos avulsos conhecidos e ainda não pagos no corte | A PREENCHER | A PREENCHER | 0 | PENDENTE |
| serviços adicionais MEI conhecidos e ainda não pagos no corte | A PREENCHER | A PREENCHER | 0 | PENDENTE |
| clínicas referenciadas | A PREENCHER | A PREENCHER | 0, após deduplicação global aprovada | PENDENTE |
| últimos ASOs necessários | A PREENCHER | A PREENCHER | 0 | PENDENTE |
| participantes da competência | A PREENCHER | A PREENCHER | 0 | PENDENTE |
| quantidade de K07 | A PREENCHER | A PREENCHER | 0 | PENDENTE |
| total K07 por grupo/evento | A PREENCHER | A PREENCHER | R$ 0,00 | PENDENTE |
| maior número externo reservado e próximo interno projetado por ano | A PREENCHER | A PREENCHER | projeção acima; zero reserva antes do `GO`; 0 colisão | PENDENTE |
| deltas | A PREENCHER | A PREENCHER | 0 pendente/duplicado | PENDENTE |
| fatos financeiros antes do corte | 0 | A PREENCHER | 0 | PENDENTE |

Não se soma salário, RA ou dados de ASO em evidência geral. Totais financeiros detalhados ficam em evidência restrita da homologação contábil.

---

# 9. Validações obrigatórias por classe

## 9.1 Identidade e acesso

- e-mail normalizado sem duplicidade global indevida;
- exatamente dois masters iniciais e pelo menos dois aptos;
- usuário comum ligado apenas às empresas permitidas;
- exatamente um perfil empresarial ativo por associação comum;
- perfil arquivado não recebe nova associação;
- seletor mostra somente empresas autorizadas;
- campo oculto não chega à tela, filtro, total, histórico ou Excel;
- redução de acesso revoga todas as sessões afetadas.

## 9.2 Empregado

- CPF normalizado;
- nenhum vínculo ativo duplicado na mesma empresa;
- datas coerentes;
- início e admissão continuam distintos;
- endereço obrigatório conforme dicionário;
- salário-base e RA em fontes separadas;
- total acordado somente derivado;
- inativo histórico não é criado sem necessidade atual.

## 9.3 MEI

- CNPJ normalizado;
- cadastro reutilizado na mesma empresa;
- contrato ativo sem sobreposição;
- valor mensal e percentual válidos;
- serviço adicional não é recorrente;
- nenhuma nota fiscal é registrada;
- não existe RA de empregado no MEI.

## 9.4 Financeiro

- vigências ordenadas, sem sobreposição;
- D30 permanece fonte de cálculo, não dado importado;
- K06 é digitado no momento operacional aplicável;
- K07 somente na primeira competência;
- origem/evidência e confirmação de ausência pertencem ao manifesto restrito; K07 persiste somente os campos do Documento 18;
- avulso de empregado ou serviço adicional MEI já pago entra somente como K07; ainda não pago entra pelo fluxo normal da competência inicial;
- valor monetário possui duas casas e igualdade exata;
- nenhuma projeção ou saldo derivado é carregado;
- nenhum recibo anterior ao corte existe.

## 9.5 ASO

- clínica compartilhada sem duplicação desnecessária;
- ASO pertence somente a empregado;
- apenas último exame necessário ao controle atual;
- validade sugerida de 12 meses, editável;
- nenhum arquivo, CID, médico, CRM ou descrição clínica;
- resultado protegido conforme permissão.

---

# 10. Tratamento de falhas

| Tipo | Tratamento |
|---|---|
| campo obrigatório ausente | rejeitar a linha, corrigir a fonte e reapresentar |
| campo opcional ausente | aceitar e registrar como opcional ausente |
| duplicidade proibida | bloquear unidade e sanear a fonte |
| conflito de vigência | bloquear entidade e condições dependentes |
| erro de digitação ainda não comprometido | corrigir pela própria tela, preservando auditoria |
| K07 incorreto antes do `GO` | usar versão corretiva autorizada e reconciliar novamente |
| candidato a K07 sem origem antes de persistir | omitir ou corrigir na fonte; nunca presumir |
| K07 já persistido cuja origem não é comprovável antes do `GO` | abortar a carga afetada; preservar auditoria/checkpoints append-only ou arquivar a instância reprovada somente leitura; restaurar baseline numa instância limpa e recarregar/reconciliar; nunca apagar/editar a evidência; P09-14A não fabrica origem |
| delta antes de `CTL-IMP-003`, com manifesto em `JANELA_ABERTA` | mover ledger para `REABERTO`, invalidar evidências, criar novo ciclo no mesmo manifesto, versionar candidatos, resselar, obter novas aprovações finais e repetir |
| delta a partir de `CTL-IMP-003` | não terminal: `CTL-IMP-004 → FECHADO_NO_GO`; reconciliado: `CTL-IMP-004(INVALIDAR_GO)` cria `ENT-IMP-05`, sem reterminalizar; novo manifesto/janela obrigatório; seed idêntica só verificada |
| delta tentado concorrente com `GO` | sob guarda→manifesto, delta/inelegibilidade primeiro bloqueia `IMP-CUT-018`; `GO` primeiro rejeita a tentativa pela época/fence, e o fato deve ser submetido pelo fluxo normal do sistema; ledger externo só se torna autoritativo após troca formal em `T_RET`; nunca coexistem `GO` e delta invisível no mesmo manifesto |
| delta de numeração/impacto indeterminado após semente persistida | `INVALIDADO_EXIGE_NOVA_TENTATIVA`, `NO-GO`, capacidade revogada, baseline limpo e nova carga; nunca alterar/apagar/reinicializar a raiz na tentativa inválida |
| ausência dupla deixa de ser verdadeira sem raiz/semente interna | invalidar a declaração, fechar o manifesto e criar nova tentativa/capacidade pós-delta; baseline limpo só é obrigatório se já houver semente imutável ou outro efeito incompatível |
| divergência depois do `GO` | usar correção funcional; não recarregar por cima |
| falha sistêmica | parar etapa, preservar evidência e seguir Documento 23C |
| dado real detectado em não produção | interromper, preservar evidência mínima, eliminar com segurança e declarar incidente |

---

# 11. Critério de aprovação do 23B

O caderno será aprovado como planejamento quando o usuário confirmar:

- a ordem de carga;
- as duas cargas secas sintéticas;
- a pré-carga real em produção fechada;
- identidades pessoais com permissão normal mais `MIGRACAO_PRE_GO`, sem convite ou efeito fora da allowlist;
- o registro obrigatório de deltas;
- as fases pessoais/técnicas, hashes separados, `ENT-IMP-05` e o fence delta×`GO`;
- as reconciliações por empresa e globais;
- tolerância zero para contagens obrigatórias, isolamento e K07;
- a exclusão dos inativos históricos reais;
- a proibição de fatos financeiros anteriores ao corte;
- que eventual utilitário é excepcional e não vira módulo de importação.

Na execução futura, `IMP-DAT-028` somente passa quando todas as linhas predecessoras tiverem evidência aprovada.

---

**Situação desta versão:** caderno executável concluído; nenhuma carga foi executada.  
**Estado de execução:** `NOT_RUN_PLANNED`.  
**Próxima ação:** aprovação com o Documento 23.
