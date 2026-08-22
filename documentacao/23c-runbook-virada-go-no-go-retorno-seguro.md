# Documento 23C

## Runbook de Virada, Go/No-Go e Retorno Seguro

> **Status:** aprovado integralmente pelo usuário em 22/08/2026.  
> **Data-base:** 22 de agosto de 2026.  
> **Autoridade:** Documento 23.  
> **Execução:** `IMP-PRE-001–007` e as provas sintéticas de `IMP-PRE-009/010` são preparados durante `ETP-11/GAT-10`. Como `BK-362` integra a própria `ETP-11`, `IMP-PRE-004` pode provisionar e endurecer antes de `MAR-06` somente a infraestrutura de produção vazia, sem artefato funcional implantado, rota ou tráfego aberto, dado real ou efeito empresarial. Implantação funcional, exposição, tráfego, dado real ou efeito empresarial em produção — inclusive `IMP-PRE-008` e as revalidações finais — somente ocorre depois de `ETP-11`, `GAT-10` e `MAR-06`; o mesmo vale para `IMP-CUT-*`, `IMP-GNG-*` e `IMP-SMK-*`.

---

# 1. Contrato do runbook

Cada passo registra:

- ID;
- hora planejada e real;
- pré-condições;
- executor;
- revisor/aprovador;
- ação;
- resultado esperado;
- evidência;
- decisão diante da falha;
- situação.

Situações permitidas: `NÃO_INICIADO`, `EM_EXECUÇÃO`, `APROVADO`, `REPROVADO`, `BLOQUEADO`, `ABORTADO`, `INVALIDADO`. Esta última preserva a prova anterior, mas proíbe usá-la no ciclo/manifesto atual.

Passo `REPROVADO` não é marcado como aprovado por observação. Uma nova tentativa recebe nova execução e preserva a anterior.

---

# 2. Autoridade e comunicação

Antes da janela, preencher:

| Campo | Valor |
|---|---|
| responsável de implantação | A DEFINIR em `OWN-002` |
| autoridade final de `GO/NO-GO` | A DEFINIR em `OWN-001` |
| autoridade de aborto | A DEFINIR em `DEC-001` |
| responsável técnico | A DEFINIR em `OWN-003/004` |
| responsável funcional | A DEFINIR em `OWN-007` |
| responsável contábil | A DEFINIR em `OWN-008` |
| responsável de segurança | A DEFINIR em `OWN-005` |
| masters funcionais iniciais | A DEFINIR em `OWN-014` e `OWN-015`; pessoas distintas e ambas presentes no bootstrap |
| coordenador de incidente | A DEFINIR em `OWN-010` |
| canal externo da sala de situação | A DEFINIR em `DEC-003` |
| início/fim da janela | A DEFINIR em `WIN-003` |
| limite máximo para decidir | A DEFINIR em `DEC-002` |
| mensagens de abertura/`NO-GO`/aborto/contingência | A DEFINIR em `DEC-004` |

Somente o responsável de implantação conduz o relógio e chama os passos. Somente a autoridade final registra `GO`; qualquer responsável de segurança, integridade financeira, dados ou recuperação pode solicitar pausa e apresentar bloqueador objetivo.

---

# 3. Preparação relativa

| ID | Marco | Ação | Resultado esperado | Responsável | Evidência | Falha |
|---|---|---|---|---|---|---|
| `IMP-PRE-001` | `T-30` | fechar fornecedores e topologia | `PRM-001–012` aplicáveis aprovados | OPS/PROD | Doc. 23A | bloquear janela |
| `IMP-PRE-002` | `T-30` | fechar pessoas e substitutos | `OWN-*` e `HML-*` completos | PROD/IMP | Doc. 23A | bloquear janela |
| `IMP-PRE-003` | `T-30` | aprovar competência por empresa | `CUT-EMP-*` completos | DP/CTB | decisões | bloquear carga |
| `IMP-PRE-004` | `T-21` | provisionar e endurecer somente a infraestrutura de produção separada e vazia | zero recurso compartilhado indevido; zero artefato funcional, rota/tráfego, dado real ou efeito empresarial | OPS/SEG | inventário e prova de ausência de implantação/exposição | bloquear carga |
| `IMP-PRE-005` | durante `ETP-11`; revalidar em `T-14` | concluir carga seca 1 sintética, revalidá-la e repetir parte afetada após mudança material | `IMP-DRY-001–012` aprovados e ainda válidos | QA/DP | termo inicial + revalidação | bloquear DRY-2 |
| `IMP-PRE-006` | durante `ETP-11`; revalidar em `T-10` | corrigir/congelar roteiro sintético e concluir treinamento dos operadores | hash/versão únicos e operadores aptos | QA/ENG/IMP | manifesto + presença | bloquear DRY-2 |
| `IMP-PRE-007` | durante `ETP-11`; revalidar em `T-7` | concluir carga seca 2 e revalidar duração, margem e validade das evidências | `IMP-DRY-013–024` aprovados, tempo comportado e nenhuma mudança material | QA/DP/CTB | termo + medição/revalidação | bloquear candidato |
| `IMP-PRE-008` | antes de `T-5` | confirmar `ETP-11`, `GAT-10`, `MAR-06` e candidato imutável; depois selar snapshot, abrir ledger e iniciar pré-carga fechada | nenhum dado real antes de `MAR-06`; snapshot identificado e ledger contínuo | IMP/DP/OPS/QA | gates/trilha | parar carga |
| `IMP-PRE-009` | `T-3` | revalidar restauração, incidente e relógios | evidências continuam válidas; RPO/RTO e sincronização aprovados | OPS/SEG/INC | termos/medição | `NO-GO` |
| `IMP-PRE-010` | `T-2` | revalidar segurança, regressão, alertas e zero mudança material | `GAT-01–10` continuam válidos e zero bloqueador | QA/SEG | pacote 22 | `NO-GO` |
| `IMP-PRE-011` | `T-2` | congelar artefato/configuração | hash e esquema finais | ENG/OPS | manifesto | `NO-GO` |
| `IMP-PRE-012` | `T-1` | revalidar snapshot inicial, ledger e congelamento final | instante, donos e continuidade dos deltas comprovados | DP/QA | manifesto | `NO-GO` |
| `IMP-PRE-013` | `T-1` | confirmar presença/canais | titular e substituto alcançáveis | IMP | ata | `NO-GO` |
| `IMP-PRE-014` | `T-1` | confirmar plano fora da aplicação | runbooks/evidências acessíveis | OPS/SEG | teste de acesso | `NO-GO` |

---

# 4. Início da janela de virada

Sequência relativa `J+00` significa minutos desde a abertura formal da janela; os tempos reais serão calibrados pela carga seca 2.

| ID | Marco | Ação | Resultado esperado | Falha |
|---|---|---|---|---|
| `IMP-CUT-001` | `J+00` | abrir sala, validar sincronização e iniciar relógio oficial | participantes/canais e tolerância de tempo confirmados | `NO-GO` se papel obrigatório ausente ou relógio divergente |
| `IMP-CUT-002` | `J+05` | colocar fonte anterior em somente leitura e declarar congelamento final | nenhuma alteração direta; fato inevitável usa registro externo | pausar e reconciliar |
| `IMP-CUT-003` | `J+10` | confirmar fonte anterior ainda autoritativa, embora congelada | nenhuma operação empresarial autoritativa nem `efeito_de_compromisso` no novo sistema; pré-carga/bootstrap controlados não contam | incidente se divergente |
| `IMP-CUT-004` | `J+15` | capturar deltas, revisar impacto, selar `ledger_conteudo_versao/hash` e executar `CTL-IMP-002` | `SELADO_PARA_APLICACAO`, tentativa+ciclo/conteúdo vinculados e manifesto `JANELA_ABERTA`; fato novo segue a matriz | pausar se delta novo |
| `IMP-CUT-005` | `J+20` | validar último ponto restaurável | idade ≤60 min e corte comum | abortar |
| `IMP-CUT-006` | `J+25` | validar artefato/esquema | hashes/versões exatos | abortar |
| `IMP-CUT-007` | `J+30` | aplicar migração final, se houver | executor único, catálogo íntegro | seguir matriz técnica/abortar |
| `IMP-CUT-008` | após migração | verificar RLS/constraints/papéis | nenhum drift, `BYPASSRLS` ou perda | abortar |
| `IMP-CUT-009` | após verificação | iniciar artefato fechado | prontidão sem efeito externo | abortar/rollback compatível |
| `IMP-CUT-010` | após início | executar smoke técnico | saúde, conexão e versão válidas | abortar |
| `IMP-CUT-011` | após smoke | executar/referenciar `IMP-DAT-019` uma vez para o ciclo selado atual; repetição exata é idempotente e cada delta aplica no máximo uma vez por tentativa | todos os deltas pendentes do ciclo aplicados; anteriores conferidos; candidatos finais recalculados | reabrir com novo ciclo ou invalidar conforme impacto |
| `IMP-CUT-012` | após deltas | executar/referenciar `IMP-DAT-020` | estado `FECHADO_AGUARDANDO_RECONCILIACAO`, zero pendente, sem afirmar igualdade final | `NO-GO` |
| `IMP-CUT-013` | após ledger | DP/Contábil usam `CTL-IMP-003/DECIDIR_FINAL` nas próprias sessões sobre candidatos e conteúdo; OPS/Segurança usa `FINALIZAR`; executar `IMP-DAT-021–023` nos três ramos | decisões atuais/distintas, conteúdo fixo, zero divergência; próximo número somente projetado; nenhuma dupla seed | `NO-GO` |
| `IMP-CUT-014` | após empresas | executar `IMP-DAT-024/026`: reconciliar global, acessos e isolamento | dois masters, usuários, clínicas e A×B×inexistente íntegros | `NO-GO` |
| `IMP-CUT-015` | após reconciliação | fixar `reconciliacao_ledger_versao/hash`; de `SEMENTES_RESOLVIDAS`, fechar/revogar/inativar por `CTL-IMP-004`; testar pós-janela, ano futuro e emissão pré-`GO` | manifesto terminal, `go_elegivel`, nenhum `ENT-IMP-05`, entradas inativas, capacidades revogadas, guarda pré-`GO`; zero efeito indevido | `NO-GO` |
| `IMP-CUT-016` | antes da decisão | gerar checkpoint pós-carga | corte comum restaurável | `NO-GO` |
| `IMP-CUT-017` | antes da decisão | montar pacote; aplicar em cada `SRC-001–009` o mecanismo de `PRM-031`, suspender aceitação, drenar fatos em voo e selar geração, corte, último delta, contagem e conteúdo; obter todos os ACKs na mesma geração; DP/CTB confirmam completude | nenhum fato aceito fora; ACK/dreno por fonte, prova do fence, hashes, prévia de jobs e checklists anexados; ACK ausente/divergente dá `NO-GO` e reabre a fonte pelo procedimento ensaiado | `NO-GO` |

Delta novo depois do selo segue uma matriz mutuamente exclusiva pelo marco `CTL-IMP-003`:

| Situação | Transição e ação obrigatória |
|---|---|
| manifesto em `JANELA_ABERTA`, antes do commit de `CTL-IMP-003` | mover ledger para `REABERTO`; no mesmo manifesto, criar novo `ciclo_aplicacao_id`, versionar candidatos append-only, resselar, obter novas aprovações DP/Contábil e repetir `IMP-CUT-011–015`/`IMP-DAT-019–026` |
| a partir de `CTL-IMP-003`, par sem seed imutável | não terminal: `CTL-IMP-004 → FECHADO_NO_GO`; reconciliado: `CTL-IMP-004(INVALIDAR_GO)` acrescenta `ENT-IMP-05` sem reterminalizar; novo manifesto/janela e provas completas |
| a partir de `CTL-IMP-003`, seed imutável e candidato idêntico | mesmo caminho com `ENT-IMP-05` quando reconciliado; novo manifesto/janela; `SEMENTE_EXISTENTE_VERIFICADA`, sem capacidade/API |
| a partir de `CTL-IMP-003`, o par possui seed imutável e muda o maior número/prova de ausência, ou o impacto é indeterminado | ledger `INVALIDADO_EXIGE_NOVA_TENTATIVA`; `NO-GO`, revogação, baseline limpo e nova carga por `CTL-IMP-001/002`; não resselar a tentativa inválida |

Toda passagem para `REABERTO` ou para o estado terminal preserva, mas marca `INVALIDADO`, `IMP-DAT-020–028`, checkpoint, prévia de jobs, termo de carga e cada `IMP-GNG-*` dependente. No mínimo 008, 013, 014 e 015 retornam a `NÃO_INICIADO`; 011/012, 020–025 e 026 também retornam quando classe, homologação ou janela forem alcançadas. O novo ciclo só chega novamente a `IMP-CUT-016/017` depois de refazer as provas aplicáveis.

Na corrida delta×`GO`, `ENT-IMP-05` e `IMP-CUT-018` bloqueiam guarda→manifesto na mesma ordem. Inelegibilidade primeiro faz o `GO` falhar; `GO` primeiro impede invalidar o manifesto, rejeita a tentativa de delta pela época/fence e exige que o fato seja submetido no fluxo normal do sistema. O ledger externo só se torna autoritativo após troca formal em `T_RET`. O fence impede que um fato aceito antes de `T_GO` permaneça invisível; nada é aceito entre o fence final e a decisão.

Nenhum horário estimado autoriza pular passo. Se o limite da janela for atingido, a decisão padrão é `NO-GO`, salvo extensão formal anterior ao ponto de compromisso, com presença e revalidação de todos os itens temporais.

---

# 5. Checklist binário de `GO`

| ID | Condição | Prova | Aprovador | Estado inicial |
|---|---|---|---|---|
| `IMP-GNG-001` | Docs. 21, 22 e 23 aprovados; Documento 23A completo, inclusive `RDY-OPS`, e `CutoverReady = true` | baseline + `RDY-*`/23A | PROD/QA | `NÃO_INICIADO` |
| `IMP-GNG-002` | `ETP-11`, `GAT-10` e `MAR-06` aprovados | termos | QA/PROD | `NÃO_INICIADO` |
| `IMP-GNG-003` | artefato e esquema exatos | hash/manifesto | ENG/OPS | `NÃO_INICIADO` |
| `IMP-GNG-004` | zero SEV-0/1 | relatório de defeitos | QA | `NÃO_INICIADO` |
| `IMP-GNG-005` | zero crítica/alta de segurança | relatório independente | SEG | `NÃO_INICIADO` |
| `IMP-GNG-006` | SEV-2 somente conforme regra aprovada | registro de decisão | QA/PROD | `NÃO_INICIADO` |
| `IMP-GNG-007` | duas cargas secas aprovadas | termos DRY-1/2 | QA/DP | `NÃO_INICIADO` |
| `IMP-GNG-008` | carga final reconciliada | `IMP-DAT-021–028` | DP/CTB/QA | `NÃO_INICIADO` |
| `IMP-GNG-009` | exatamente dois masters iniciais aptos e ativados conjuntamente | testes de bootstrap/acesso | SEG | `NÃO_INICIADO` |
| `IMP-GNG-010` | TOTP/recuperação exercitados; bootstrap consumido/desabilitado sem senha padrão, conta ou rota residual | evidência sanitizada | SEG | `NÃO_INICIADO` |
| `IMP-GNG-011` | usuários/perfis/seletor corretos; nomes `MIGRACAO_PRE_GO` exatos, capacidades/convites fora da allowlist negados ou retidos e revogação comprovada | matriz/`PRM-030` | DP/SEG | `NÃO_INICIADO` |
| `IMP-GNG-012` | isolamento A×B×inexistente | casos do Doc. 22 | SEG/QA | `NÃO_INICIADO` |
| `IMP-GNG-013` | nenhum fato financeiro pré-corte | consulta negativa | CTB/QA | `NÃO_INICIADO` |
| `IMP-GNG-014` | K07 exato; decisões pessoais distintas sobre `candidato_final_versao/hash` e `ledger_conteudo_versao/hash`; `reconciliacao_ledger_versao/hash`; manifesto `FECHADO_RECONCILIADO`, `go_elegivel = true`, nenhum `ENT-IMP-05`/sucessor/delta; entradas inativas, capacidades revogadas, ramos resolvidos; guarda pré-`GO`; próximo número só projetado | manifesto/guarda, `PRM-032`, hashes e numeração | CTB/DP | `NÃO_INICIADO` |
| `IMP-GNG-015` | checkpoint dentro do RPO e relógios sincronizados | painel/manifesto/medição | OPS | `NÃO_INICIADO` |
| `IMP-GNG-016` | restauração dentro do RTO | termo | OPS/SEG | `NÃO_INICIADO` |
| `IMP-GNG-017` | alertas/canal externo funcionam e não há alerta operacional crítico/alto ativo sem resolução segura | ensaio de entrega/painel | OPS | `NÃO_INICIADO` |
| `IMP-GNG-018` | contas administrativas seguras | inventário/MFA | SEG | `NÃO_INICIADO` |
| `IMP-GNG-019` | responsáveis/substitutos presentes | ata | IMP | `NÃO_INICIADO` |
| `IMP-GNG-020` | homologação Engenharia | termo | ENG | `NÃO_INICIADO` |
| `IMP-GNG-021` | homologação Segurança | termo | SEG | `NÃO_INICIADO` |
| `IMP-GNG-022` | homologação DP | termo | DP | `NÃO_INICIADO` |
| `IMP-GNG-023` | homologação Contábil | termo | CTB | `NÃO_INICIADO` |
| `IMP-GNG-024` | homologação Jurídico/privacidade | termo | JUR | `NÃO_INICIADO` |
| `IMP-GNG-025` | homologação Operação | termo | OPS | `NÃO_INICIADO` |
| `IMP-GNG-026` | janela dentro do limite | relógio oficial | IMP | `NÃO_INICIADO` |
| `IMP-GNG-027` | runbooks operacionalizados e retorno pré/pós-`GO` acessível e exercitado | `RDY-OPS`, Doc. 23C/23D | IMP/OPS | `NÃO_INICIADO` |
| `IMP-GNG-028` | comunicação pronta | mensagem/canais | PROD/IMP | `NÃO_INICIADO` |

Para aprovar `IMP-GNG-014`, `ENT-IMP-01/02/03/04/05` precisa provar `escopo_versao/hash`, `ledger_conteudo_versao/hash`, `reconciliacao_ledger_versao/hash` e o ramo exato de cada empresa+ano: semente calculada depois dos deltas, ausência dupla sem chamada à API/raiz, ou semente anterior idêntica verificada sem nova capacidade. O manifesto deve estar `FECHADO_RECONCILIADO`, com `go_elegivel = true`, sem `ENT-IMP-05`, com entradas inativas, capacidades revogadas, fence final vigente e `ENT-IMP-04` ainda sem `production_go_id`; tentativas pós-janela, para outro ano/manifesto e a primeira emissão antes do `GO` devem produzir zero efeito auditado. As corridas fechamento×semente, `GO`×primeira emissão e delta×`GO` não podem deixar estado parcial.

Todos os 28 itens precisam estar `APROVADO`. `NÃO_APLICÁVEL` não é aceito nesse checklist.

Não existe “vamos abrir e completar depois”: qualquer controle pendente mantém a decisão em `NO-GO`.

---

# 6. Decisão e ponto de compromisso

## 6.1 `NO-GO`

Este ramo se aplica somente enquanto o CAS externo de `T_GO` ainda não foi confirmado. Se qualquer item de `IMP-GNG-001–028` falhar ou `IMP-CUT-018` falhar antes do CAS:

1. registrar `NO-GO`, motivo e horário;
2. manter ou restaurar produção fechada;
3. preservar logs, auditoria/checkpoints, `ENT-IMP-*`, seed eventualmente persistida e o estado da carga em meio append-only ou instância reprovada somente leitura;
4. confirmar no `registro_externo_autoridade` que não existe evento CAS de `T_GO`, provar que a fonte anterior continua autoritativa e reabilitar sua escrita e o ledger de deltas pelo procedimento ensaiado antes da retomada operacional;
5. se essa reabilitação pré-CAS falhar, declarar incidente e ativar o mecanismo externo de contingência vinculado à autoridade anterior; não operar sem fonte gravável/autoritativa;
6. se houve pré-carga real, escolher: mantê-la fechada apenas até `PRM-028`, sem delta que altere máximo/prova após seed, com zero emissão interna, ledger contínuo, efeitos bloqueados e seed somente verificada no novo manifesto; ou restaurar baseline numa instância limpa, preservar evidências da tentativa e repetir com novo manifesto/capacidade;
7. comunicar que não houve mudança da fonte oficial;
8. revogar acessos/capacidades; manifesto não terminal fecha `FECHADO_NO_GO`; se reconciliado, executar `CTL-IMP-004(INVALIDAR_GO)` para acrescentar `ENT-IMP-05`, sem reterminalizar/reabrir; guarda continua sem `production_go_id` e seed nunca é editada;
9. marcar inválidos `IMP-DAT-020–028` e os `IMP-GNG-*` dependentes se houver reabertura/delta; invalidar integralmente a pré-carga se fonte, esquema, roteiro ou artefato mudou, se a cadeia rompeu, se `PRM-028` venceu ou se o máximo/prova mudou após seed;
10. agendar nova janela somente após causa e gates afetados resolvidos.

Depois que o CAS de `T_GO` confirma, não existe conversão para `NO-GO` nem reabertura silenciosa da fonte anterior. Falha na reconciliação de `IMP-CUT-018` ou em `IMP-CUT-019–027` mantém as interfaces funcionais fechadas, abre incidente e preserva a autoridade indicada pelo evento externo; eventual retorno ao controle anterior ocorre somente por `RBK-020` e novo CAS formal em `T_RET`.

## 6.2 `GO`

Se todos passarem:

| ID | Ação | Resultado |
|---|---|---|
| `IMP-CUT-018` | bloquear guarda→manifesto e ambas as fontes; validar fence vigente, manifesto exato `FECHADO_RECONCILIADO`, `go_elegivel`, ausência de `ENT-IMP-05`/sucessor/delta e hashes; preparar o mesmo candidato em `ENT-IMP-04` e no registro externo; confirmar por CAS em `T_GO` e reconciliar a projeção local | `production_go_id` write-once, fence, `authority_epoch`, hashes e fonte sistema coincidem; antes do CAS, falha reabre fonte anterior; depois, mantém fechado até reconciliar |
| `IMP-CUT-019` | verificar evento externo, `ENT-IMP-04` e autoridade na mesma época/hash | não existe intervalo gravável ambíguo entre decisão e mudança da fonte |
| `IMP-CUT-020` | confirmar fonte anterior ainda somente leitura e retomar controladamente jobs temporais acumulados | autoridade única; data de referência/contagens de `IMP-DAT-027` reconciliadas sem duplicação antes de abrir usuários |
| `IMP-CUT-021` | manter efeitos externos bloqueados e abrir para masters | início do smoke funcional sem convite comum |
| `IMP-CUT-022` | executar smoke dos masters | acesso/contexto íntegros |
| `IMP-CUT-023` | com entrega ainda bloqueada: invalidar token antigo, cancelar/marcar sua outbox, enfileirar novo convite do piloto, reconciliar a fila; só então liberar entrega allowlisted e abrir o grupo | observação controlada sem corrida, mensagem expirada ou duplicada |
| `IMP-CUT-024` | executar smoke do piloto | funções críticas íntegras |
| `IMP-CUT-025` | repetir a ordem segura para os demais: invalidar token antigo, cancelar outbox anterior, enfileirar/reconciliar novo convite e só então liberar efeitos aprovados e abrir autorizados | produção disponível; nenhuma mensagem expirada ou duplicada entregue |
| `IMP-CUT-026` | comunicar abertura | usuários informados sem dado sensível |
| `IMP-CUT-027` | iniciar hipercuidado | escala, painéis e reconciliação ativos |

`Efeito_de_compromisso` é operação autoritativa, pagamento, número/recibo ou efeito externo fora das allowlists de bootstrap/migração. Toda mutação normal global ou empresarial exige `POS_GO_SISTEMA_AUTORITATIVO`, `authority_epoch` corrente e projeção local reconciliada com o último evento externo de autoridade. A primeira emissão inicial exige também manifesto/`ProductionGo`. Fato de compromisso antecipado exige incidente e não legitima emissão retroativamente.

---

# 7. Smoke funcional após `GO`

| ID | Jornada | Resultado obrigatório | Falha |
|---|---|---|---|
| `IMP-SMK-001` | login master + TOTP | entrada e sessão corretas | fechar tráfego |
| `IMP-SMK-002` | login usuário comum | sem MFA obrigatório e sem ampliar acesso | fechar tráfego |
| `IMP-SMK-003` | selecionar/trocar empresa | contexto anterior invalidado | incidente/fechar |
| `IMP-SMK-004` | A×B×inexistente | negação neutra sem vazamento | incidente/fechar |
| `IMP-SMK-005` | campo oculto/mascarado | servidor redige corretamente | incidente/fechar |
| `IMP-SMK-006` | consultar empregado/MEI | dados corretos da empresa | fechar/avaliar |
| `IMP-SMK-007` | consultar competência/K07 | valores e estados reconciliados | fechar financeiro |
| `IMP-SMK-008` | consultar ASO autorizado/não autorizado | resultado protegido | incidente/fechar |
| `IMP-SMK-009` | auditoria/correlação | eventos íntegros e sanitizados | fechar mutações |
| `IMP-SMK-010` | worker/storage controlados | tarefas e objeto privado íntegros | restringir função/avaliar retorno |
| `IMP-SMK-011` | monitor externo/alerta | canal independente entrega | manter fechado |

Nenhum smoke cria pagamento fictício, envia e-mail real indevido ou executa DAST/carga invasiva.

---

# 8. Árvore de decisão de retorno

```text
FALHA
├─ Antes de qualquer escrita em produção?
│  └─ Sim → abortar; fonte anterior continua oficial.
├─ Depois de migração, antes de carga/tráfego?
│  ├─ artefato anterior compatível → rollback de aplicação.
│  └─ incompatível/destrutivo → rollforward ou restauração do baseline.
├─ Depois da carga, antes do GO?
│  ├─ erro de origem/roteiro → manter fechado, corrigir e recarregar conforme autorização.
│  └─ integridade duvidosa → restaurar checkpoint e repetir.
├─ Depois do GO, mas sem fato real?
│  └─ retirar tráfego; rollback compatível ou rollforward.
└─ Depois de fato real?
   ├─ erro funcional/dado de negócio → correção versionada.
   ├─ dependência opcional → contingência específica.
   ├─ corrupção/perda → incidente, congelamento e restauração.
   └─ indisponibilidade prolongada → retorno operacional ao controle anterior.
```

---

# 9. Procedimentos de retorno

| ID | Gatilho | Ação principal | Verificação final |
|---|---|---|---|
| `IMP-RET-001` | aborto antes de escrita | encerrar janela e manter fonte anterior | zero efeito no novo sistema |
| `IMP-RET-002` | carga reprovada antes do `GO` | manter fechado, preservar auditoria/checkpoints append-only ou arquivar instância somente leitura; repetir em baseline limpo autorizado | nova reconciliação integral correlacionada à tentativa |
| `IMP-RET-003` | artefato defeituoso compatível | fencear mutações/consumidores, inventariar leases/mensagens/efeitos, provar compatibilidade com banco/configuração/segredos/filas e voltar web+API+worker como unidade | smoke, outbox/leases reconciliados e zero duplicação |
| `IMP-RET-004` | migração interrompida | bloquear unidade de publicação; rollback transacional seguro somente se provado, ou restauração/rollforward coerente de esquema, web, API e worker | catálogo/RLS, contratos de fila e efeitos íntegros |
| `IMP-RET-005` | esquema expandido | manter expansão e voltar código compatível | nenhum consumidor quebrado |
| `IMP-RET-006` | fato real + defeito corrigível | congelar área afetada e fazer rollforward | fato preservado e regressão |
| `IMP-RET-007` | corrupção/perda | declarar incidente e restaurar corte lógico | RPO/RTO/reconciliação |
| `IMP-RET-008` | dependência externa | aplicar runbook específico | operação segura/retomada idempotente |
| `IMP-RET-009` | retorno ao controle anterior | fencear; executar `RBK-018`; transformar reservas/incertos em lacunas; preparar época/mapa no registro externo e confirmar CAS em `T_RET`; reconciliar `ENT-IMP-04` quando disponível; só então abrir o ledger | sistema antes de `T_RET`; controle anterior+ledger e alocador único em `[T_RET,T_REENT)`; zero colisão; funciona com app/banco indisponíveis |
| `IMP-RET-010` | reentrada | suspender/selar em `L`; importar fatos/números/lacunas, avançar raiz sem mudar seed; reconciliar; preparar evento externo e local; confirmar CAS em `T_REENT`, reconciliar `ENT-IMP-04` e só então abrir | ano futuro continua negado até `T_REENT`; fato após `L` invalida e repete; nenhuma fonte abre com épocas divergentes |

## 9.1 Regras invioláveis

- nunca apagar pagamento, recibo, número ou auditoria legítimos;
- nunca reutilizar número possivelmente emitido;
- nunca restaurar backup para corrigir simples erro de digitação;
- nunca executar contração destrutiva na mesma janela;
- nunca repetir resposta incerta antes de reconciliar;
- nunca permitir dois controles autoritativos ao mesmo tempo;
- nunca usar K07 para fatos de contingência posteriores ao `GO` original.

---

# 10. Registro externo de contingência

Se o sistema ficar indisponível após o `GO`, o controle temporário contém:

- `contingencia_id` único;
- empresa;
- competência;
- participante;
- operação;
- grupo/evento e valor quando aplicável;
- data efetiva;
- executor/revisor;
- origem;
- recibo/número externo, se existir, sem colisão;
- ano, estado do número (`EMITIDO`, `RESERVADO` ou `INCERTO`), maior número anterior, próximo número seguro e geração do fence;
- situação de reentrada;
- correlação com o registro final no sistema.

Proteção:

- acesso nominal e restrito;
- armazenamento cifrado;
- nenhuma senha/TOTP;
- versão e checksum;
- cópia isolada;
- eliminação somente depois da reconciliação e retenção aprovadas.

Na reentrada, cada item recebe `JÁ_EXISTE`, `CRIAR_PELO_FLUXO_NORMAL`, `CORRIGIR`, `SOMENTE_EXTERNO` ou `BLOQUEADO`. Nenhum item é aplicado automaticamente sem idempotência e conferência.

---

# 11. Acompanhamento pós-abertura

| ID | Momento | Verificação | Aprovadores |
|---|---|---|---|
| `IMP-HYP-001` | primeira hora | erros, isolamento, fila, objetos, alertas e acessos | OPS/SEG/QA |
| `IMP-HYP-002` | fim do dia | cadastros/deltas, backup e nenhuma escrita dupla | DP/OPS/QA |
| `IMP-HYP-003` | `T+1` | participantes, K07, pagamentos, recibos e incidentes | DP/CTB/QA |
| `IMP-HYP-004` | `T+3` | capacidade, permissões, documentos e suporte | OPS/SEG/PROD |
| `IMP-HYP-005` | `T+7` | tendências, backup, falhas recorrentes e riscos | OPS/QA/PROD |
| `IMP-HYP-006` | primeiro adiantamento normal e primeiro recibo legítimo de cada empresa+ano inicial; K07 não conta | primeiro commit grava faixa/hash e `PENDENTE_RECONCILIACAO`; `RBK-018` confere autoridade/época, manifesto/ramo, número, raiz, recibo, auditoria, snapshot, outbox e arquivo; `CTL-REC-001` grava `RECONCILIADA` antes da próxima emissão; resposta incerta aciona `RBK-025` | DP/CTB/QA |
| `IMP-HYP-007` | primeiro final | K06, grupos, ajustes, recibos e fechamento | DP/CTB/QA |
| `IMP-HYP-008` | +2 dias úteis após o mais tardio entre fechamento/reconciliação da competência inicial e primeiro adiantamento normal | relatório de estabilização | PROD/IMP/todas as áreas |

Saída do hipercuidado exige todos aprovados e nenhum bloqueador de sigilo, integridade, recuperação ou operação.

---

# 12. Termo de decisão

O registro final contém:

- versão do Documento 23C;
- data e janela;
- artefato e esquema;
- resultado de cada `IMP-GNG-*`;
- decisão `GO` ou `NO-GO`;
- manifesto, `escopo_hash`, `ledger_conteudo_hash`, `reconciliacao_ledger_hash`, `go_elegivel`, ausência/presença de `ENT-IMP-05`, geração do fence, `production_go_id`, estado e `authority_epoch` de `ENT-IMP-04`;
- motivo;
- horário;
- assinaturas por papel/nome;
- ponto de compromisso, se houver;
- comunicação emitida;
- próximos passos;
- evidência e checksum.

---

# 13. Critério de aprovação do 23C

O planejamento será aprovado quando o usuário confirmar:

- a linha do tempo relativa;
- os 28 bloqueadores binários de `GO`;
- a inexistência de `GO condicionado`;
- o ponto de compromisso no `GO` ou primeiro efeito de compromisso;
- a abertura masters → piloto → demais como smoke, não escopo parcial;
- a árvore rollback/rollforward/restauração/contingência;
- a preservação de fatos e números;
- o retorno ao controle anterior com autoridade única;
- o handoff de numeração em `T_RET/T_REENT`, a restauração coerente da cadeia de autoridade e a trava de anos futuros durante contingência;
- a reconciliação positiva do primeiro recibo legítimo por empresa+ano antes da emissão seguinte;
- novo `GO/NO-GO` para reentrada;
- hipercuidado até dois dias úteis depois do mais tardio entre o fechamento/reconciliação da competência inicial e o primeiro adiantamento normal do sistema; K07 não conta como adiantamento normal.

---

**Situação desta versão:** runbook concluído; nenhuma etapa foi executada.  
**Estado de execução:** `NOT_RUN_PLANNED`; `ProductionGo = false`.  
**Próxima ação:** aprovação com o Documento 23.
