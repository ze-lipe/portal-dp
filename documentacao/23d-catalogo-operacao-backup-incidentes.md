# Documento 23D

## Catálogo de Operação, Backup, Continuidade e Incidentes

> **Status:** aprovado integralmente pelo usuário em 22/08/2026.  
> **Data-base:** 22 de agosto de 2026.  
> **Autoridade:** Documento 23 e Documento 19 §§24–28.  
> **Execução:** futura; responsáveis nominais serão preenchidos no Documento 23A.

---

# 1. Contrato comum de runbook

Todo runbook executável contém:

1. ID, versão e proprietário;
2. gatilho observável;
3. severidade inicial;
4. autoridade para iniciar e encerrar;
5. pré-condições e acessos;
6. ações ordenadas;
7. pontos de parada/aborto;
8. controles de segurança e dados;
9. verificação da recuperação;
10. comunicação e escalonamento;
11. evidências sanitizadas;
12. retorno ao estado normal;
13. causa, ação preventiva e novo ensaio quando aplicável.

Runbook nunca pede senha, TOTP ou código de recuperação. Comando ou tela administrativa excepcional usa conta pessoal, MFA, menor privilégio, correlação e auditoria.

---

# 2. Catálogo mínimo

| ID | Runbook | Gatilho | Proprietário | Primeira ação segura | Evidência de encerramento |
|---|---|---|---|---|---|
| `RBK-001` | publicação normal | versão aprovada | ENG/OPS | confirmar hash, backup e janela | smoke + versão + observação |
| `RBK-002` | rollback de aplicação | defeito no artefato, unidade inteira compatível | ENG/OPS | fencear mutações/consumidores e confirmar compatibilidade | hash anterior + smoke + outbox reconciliada |
| `RBK-003` | migração interrompida | executor falha ou drift | ENG/OPS | bloquear tráfego e preservar log | catálogo/RLS íntegros |
| `RBK-004` | restauração integral/PITR | perda/corrupção/exercício | OPS | declarar, congelar e escolher corte lógico | RPO/RTO + reconciliação |
| `RBK-005` | exclusão/corrupção acidental | integridade não confiável | OPS/INC | bloquear mutações e preservar evidência | dados/hashes reconciliados |
| `RBK-006` | suspeita de vazamento entre empresas | sinal A×B | SEG/INC | conter acesso e revogar sessões | escopo/correção/regressão |
| `RBK-007` | segredo/chave comprometido | exposição ou anomalia | SEG/OPS | revogar/rotacionar e conter | versões rotacionadas + impacto |
| `RBK-008` | banco indisponível | conexão/saúde falha | OPS | retirar mutações e avaliar failover/restauração | integridade + smoke |
| `RBK-009` | worker/outbox atrasado | tarefa >5/10 min | OPS/ENG | impedir repetição manual e inspecionar leases | fila normal + zero duplicação |
| `RBK-010` | objetos/PDF/Excel indisponíveis | storage/worker falha | OPS/ENG | preservar fatos lógicos | arquivos retomados/expirados corretamente |
| `RBK-011` | hash de recibo divergente | reconciliação falha | SEG/ENG/INC | bloquear download afetado | origem/snapshot/hash resolvidos |
| `RBK-012` | e-mail indisponível | rejeição/timeout | OPS | manter outbox e não duplicar envio | retomada/idempotência |
| `RBK-013` | CEP indisponível | timeout/erro | OPS/DP | usar preenchimento manual | serviço recuperado sem perder cadastro |
| `RBK-014` | KMS indisponível | falha de chave | OPS/SEG | falhar fechado para dado protegido | chave/serviço íntegros |
| `RBK-015` | saturação de banco/armazenamento | recurso >limiar | OPS/ENG | conter carga não crítica | capacidade e causa tratadas |
| `RBK-016` | DNS/certificado | monitor externo falha | OPS | impedir exposição insegura | DNS/TLS/monitor válidos |
| `RBK-017` | perda de acesso master | master não acessa | MST/SEG | usar fluxo aprovado, nunca backdoor | pelo menos dois aptos |
| `RBK-018` | reconciliação/handoff de numeração | primeira emissão, restauração, resposta incerta ou troca `T_RET/T_REENT` | CTB/ENG | fencear a chave e obter comprometidos/reservados/incertos | próximo número seguro, lacunas e zero reuso |
| `RBK-019` | carga inicial e virada | janela aprovada | IMP/DP/OPS | seguir Documentos 23B/23C | termo `GO/NO-GO` |
| `RBK-020` | retorno ao controle anterior | indisponibilidade prolongada após `GO` | PROD/IMP/INC | congelar, executar `RBK-018`, preparar ledger e trocar autoridade/época com protocolo fail-closed | ledger, mapa numérico e cadeia `T_RET/T_REENT` íntegros |
| `RBK-021` | entrada/saída de administrador | mudança de pessoal | SEG/OPS | conceder/revogar nominalmente | inventário/ACL revisados |
| `RBK-022` | revisão periódica de acesso | trimestre ou mudança | SEG/PROD | extrair inventário sanitizado | acessos mínimos aprovados |
| `RBK-023` | preservação de evidência | incidente/mudança crítica | INC/SEG | copiar com checksum e ACL | cadeia de custódia |
| `RBK-024` | encerramento de incidente | causa contida/corrigida | INC | validar monitoramento e obrigações | termo/lições/ações |
| `RBK-025` | resposta incerta | cliente perdeu resposta | ENG/OPS | consultar idempotência/fonte | resultado único provado |
| `RBK-026` | auditoria com lacuna/hash | checkpoint diverge | SEG/INC | bloquear operação afetada e preservar estado | continuidade restaurada/explicada |
| `RBK-027` | recibo lógico sem arquivo | reconciliação encontra pendência | ENG/OPS | não alterar pagamento, retomar worker | um único PDF correto |
| `RBK-028` | objeto órfão/ausente | inventário diverge | ENG/OPS | restringir download e reconciliar origem | inventário/hash íntegros |
| `RBK-029` | rotina temporal perdida | job não executou | ENG/OPS | retomar com data de referência e idempotência | resultado sem duplicação |
| `RBK-030` | dado real em não produção | varredura/detecção | SEG/INC | isolar ambiente e acesso | eliminação/impacto/causa |
| `RBK-031` | pipeline de backup degradado | atraso preventivo/crítico ou falha de WAL/base/objetos/checkpoint | OPS/SEG | proteger a fonte atual e diagnosticar a cadeia sem restaurar por reflexo | ponto restaurável novamente íntegro ou decisão formal de congelar/recuperar |

Este catálogo é o índice do planejamento, não a afirmação de que 31 procedimentos já estão prontos para uso. Antes de `CutoverReady`, cada `RBK-001–031` aplicável recebe ficha completa com os 13 campos da seção 1, titular/substituto, acessos verificados, versão e revisão. Os críticos `RBK-002`, `RBK-004`, `RBK-006`, `RBK-007`, `RBK-008`, `RBK-009`, `RBK-017`, `RBK-018`, `RBK-019`, `RBK-020`, `RBK-025`, `RBK-026`, `RBK-030` e `RBK-031` precisam de ensaio pré-produção; os demais precisam estar operacionalizados, embora não necessariamente exercitados. O gate é `RDY-OPS`.

---

# 3. Rotinas e calendário

| ID | Rotina | Cadência | Atraso/limite | Retentativa | Evidência | Dono |
|---|---|---|---|---|---|---|
| `OPS-JOB-001` | PDF/recibo | orientada a evento, worker contínuo | advertir 5 min; alta 10 min | idempotente e limitada | fila/objeto/hash | ENG/OPS |
| `OPS-JOB-002` | Excel/ZIP | orientada a evento | mesmos limiares de fila | idempotente | arquivo/expiração | ENG/OPS |
| `OPS-JOB-003` | e-mail transacional aprovado da V1 | orientada a outbox | calibrar por provedor; nunca entregar expirado | backoff/idempotência | primeiro acesso/recuperação e demais mensagens já aprovadas, sem destinatário em claro | OPS |
| `OPS-JOB-004` | notificação funcional | orientada a evento | sem ampliar acesso | idempotente | origem/estado | ENG |
| `OPS-JOB-005` | expiração de temporários | ao menos horária | nenhum >24 h disponível | recupera execução perdida | contagem eliminada | OPS |
| `OPS-JOB-006` | ASO/referência/alerta 30 dias | evento + varredura diária | concluir no dia de referência | idempotente por ocorrência | contagem/ocorrência | ENG/DP |
| `OPS-JOB-007` | admissão futura | diária | recuperar execução perdida | idempotente | transições | ENG/DP |
| `OPS-JOB-008` | renovação/encerramento MEI | diária | recuperar execução perdida | idempotente | transições | ENG/DP |
| `OPS-JOB-009` | sessão/token técnico | validação em todo uso + limpeza periódica | nunca aceitar expirado | segura | contagens agregadas | ENG/SEG |
| `OPS-JOB-010` | fila/lease/outbox | a cada poucos minutos | 5/10 min | reconciliação antes de repetir | idade/tentativas | OPS |
| `OPS-JOB-011` | recibo sem arquivo | frequente + integral diária | alerta alto quando repetido | retomar worker | lista opaca | ENG/OPS |
| `OPS-JOB-012` | objeto/hash | frequente + integral diária | divergência crítica | reconciliar, não regenerar fonte | inventário/hashes | SEG/OPS |
| `OPS-JOB-013` | checkpoint de auditoria | diário | nenhum dia sem checkpoint | alerta crítico | hash em destino separado | SEG/OPS |
| `OPS-JOB-014` | WAL/PITR | contínuo | prevenir aos 45 min; crítico >60 min | automática/alertada | cadeia legível/ponto restaurável | OPS |
| `OPS-JOB-015` | snapshot/base backup | diário | idade configurada; falha alerta imediatamente | nova execução controlada | backup/inventário/hash verificados | OPS |
| `OPS-JOB-016` | cópia isolada de banco/objetos/evidências, chaves e `registro_externo_autoridade` da cadeia `ProductionGo`/`T_GO`/`T_RET`/`T_REENT` | contínua/periódica | prevenir 45 min; crítico >60 min | retomável | conta separada; inventário/hash; CAS, chaves, `authority_epoch`, manifesto/fence e eventos no mesmo corte | OPS/SEG |
| `OPS-JOB-017` | certificado/chave/storage | diária | antecedência calibrada | alerta/escalonamento | validade/capacidade | OPS/SEG |
| `OPS-JOB-018` | restauração integral a partir da cópia isolada | trimestral | dentro do trimestre | repetir após correção | termo RPO/RTO e origem isolada | OPS/SEG |
| `OPS-JOB-019` | exercício de incidente | pré-produção, anual e após mudança crítica | data aprovada | novo exercício após falha | ata/melhorias | INC/SEG |
| `OPS-JOB-020` | revisão administrativa | trimestral e após mudança de pessoal | nenhuma conta órfã | revogação imediata | inventário/aceite | SEG/PROD |

Rotina empresarial usa uma empresa por transação. Nenhuma rotina fabrica evento retroativo ao “ajustar” o relógio.

## 3.1 Escopo durante congelamento, pré-carga e retorno

Uma ordem de “bloquear workers, agendadores ou efeitos externos” alcança somente consumidores funcionais que mutam negócio, produzem documento ou tentam entrega externa. Ela nunca desliga:

- validação/expiração de sessão, token e temporário de segurança (`OPS-JOB-005/009`);
- checkpoint de auditoria (`OPS-JOB-013`);
- WAL/PITR, base backup, cópia isolada e verificação de chaves recuperáveis (`OPS-JOB-014–016`);
- monitoramento de certificado, chave, storage, capacidade, saúde e alertas (`OPS-JOB-017`, painéis e matriz de alertas);
- pager, canal externo de incidente e observação da fila, mesmo quando o consumidor da fila estiver fenceado.

Antes de liberar os jobs temporais funcionais `OPS-JOB-006–008` depois de uma pausa:

1. fixar a data/hora de referência do corte;
2. executar prévia sem mutação, separada por empresa e tipo de transição;
3. comparar contagens e efeitos esperados com DP e com o manifesto da carga/contingência;
4. resolver divergência antes de qualquer catch-up;
5. executar o catch-up uma única vez, com lease, idempotência e a referência congelada;
6. reconciliar transições, alertas e auditoria antes de reativar a cadência normal.

Se a expiração de segurança ou qualquer rotina que deveria permanecer ativa tiver sido perdida, a operação falha fechado e segue `RBK-029`; não se libera acesso ou efeito externo apenas para “colocar a fila em dia”.

---

# 4. Painéis operacionais

| ID | Painel | Sinais mínimos | Dado proibido |
|---|---|---|---|
| `DSH-001` | saúde externa | DNS, TLS, login neutro e vida | conta/dado real |
| `DSH-002` | aplicação | requisição, erro, p50/p95/p99, versão | corpo/valor pessoal |
| `DSH-003` | banco | CPU, I/O, conexão, locks, longas, autovacuum | SQL com valores |
| `DSH-004` | worker | fila, idade, tentativa, lease, falha definitiva | conteúdo da tarefa |
| `DSH-005` | documentos/numeração | lógico sem arquivo, órfão/hash, primeira faixa ainda não reconciliada e chave fenceada | conteúdo do recibo/Excel |
| `DSH-006` | segurança | login/bloqueio/negação agregados | CPF, e-mail ou IP sem política |
| `DSH-007` | continuidade/autoridade | ponto restaurável, RPO, ensaio, fonte/`authority_epoch` e cadeia `T_GO/T_RET/T_REENT` | segredo/chave |
| `DSH-008` | capacidade | CPU, memória, conexão, storage e tendência | dado funcional |
| `DSH-009` | dependências | e-mail/CEP/objetos/KMS e latência | destinatário/endereço |

Alertas operacionais são externos à central funcional. Monitor externo não usa conta real e não depende da aplicação monitorada.

---

# 5. Matriz de alerta e escalonamento

| ID | Condição | Severidade inicial | Ação |
|---|---|---|---|
| `ALT-001` | banco/todas as réplicas indisponíveis | crítica | `RBK-008` |
| `ALT-002` | último ponto restaurável >60 min | crítica | `RBK-031`; restauração somente se perda/corrupção/integridade não confiável |
| `ALT-003` | suspeita de vazamento A×B | crítica | `RBK-006` |
| `ALT-004` | recibo/numeração/auditoria divergente ou primeira faixa não reconciliada | crítica | fence imediato; `RBK-011/018/025/026` |
| `ALT-005` | worker parado ou fila >10 min | alta | `RBK-009` |
| `ALT-006` | tarefa >5 min | advertência | triagem/deduplicação |
| `ALT-007` | storage indisponível | alta | `RBK-010/028` |
| `ALT-008` | falha definitiva | alta | runbook do componente |
| `ALT-009` | p95 fora da meta em três janelas | média | medir consulta/recurso |
| `ALT-010` | recurso >70% sustentado | média | `RBK-015` |
| `ALT-011` | rejeição elevada de e-mail | média | `RBK-012` |
| `ALT-012` | limpeza temporária incompleta | informativa/média por duração | `OPS-JOB-005` |
| `ALT-013` | certificado/chave próximo do limite | informativa escalável | `RBK-007/016` |
| `ALT-014` | último ponto lógico completo atinge 45 min | alta preventiva | `RBK-031` |
| `ALT-015` | falha de WAL, base backup, cópia de objetos ou checkpoint comum | crítica imediata | `RBK-031` |

Antes da produção, cada severidade recebe:

- titular e substituto;
- canal externo;
- prazo de reconhecimento;
- escalonamento sem resposta;
- critérios para direção, DP, Jurídico/LGPD e fornecedor;
- janela de suporte.

O alerta é deduplicado e não esconde repetições relevantes.

Esta severidade operacional é uma classificação inicial de alerta, separada de `SEV-0–3` dos defeitos e da escala de vulnerabilidades. A triagem pode abrir incidente ou defeito na taxonomia adequada; não existe conversão automática nem rebaixamento por nomes parecidos. Alerta operacional crítico ou alto sem resolução segura bloqueia o `GO`.

Alertas de ASO permanecem exclusivamente na central/painel do sistema. E-mail, WhatsApp ou SMS de agendamento/lembrete ao colaborador pertencem a `MF-01` e não fazem parte da V1.

## 5.1 Runbook `RBK-002` — rollback da unidade de aplicação

1. bloquear novas mutações e fencear web, API, workers, agendadores e consumidores afetados;
2. inventariar leases, mensagens, pedidos idempotentes e efeitos externos em voo;
3. provar que o hash anterior é compatível com esquema, configuração, segredos, objetos e contratos de fila atuais;
4. se a prova falhar, não fazer rollback: escolher rollforward ou restauração conforme o caso;
5. promover conjuntamente as versões compatíveis de web, API e worker;
6. executar smoke técnico/funcional com efeitos externos controlados;
7. reconciliar outbox, leases, respostas incertas, recibos e numeração;
8. liberar consumidores e mutações gradualmente;
9. demonstrar zero duplicação e registrar causa, decisão e evidências.

## 5.2 Runbook `RBK-031` — pipeline de backup degradado

1. reconhecer o alerta e identificar componente, último corte íntegro e idade real;
2. proteger a fonte atual contra mudança destrutiva e preservar logs da cadeia;
3. verificar credenciais, quota, WAL, base backup, objetos, checkpoint, inventário e hashes;
4. corrigir/reiniciar somente o componente seguro e idempotente da cadeia;
5. gerar e validar novo corte lógico comum na conta isolada;
6. aos 45 minutos sem novo corte recuperável, preparar contenção e mecanismo durável alternativo previamente aprovado; ao atingir 60 minutos, bloquear obrigatoriamente novas mutações ou transferi-las por protocolo fail-closed com fence, época e confirmação durável, mantendo incidente/escalonamento até novo corte íntegro;
7. declarar perda/corrupção/integridade não confiável e acionar `RBK-004` somente quando houver esse gatilho — atraso isolado não restaura produção;
8. encerrar após provar legibilidade, continuidade, inventário, hashes e alerta normalizado; escrever sem corte comum recuperável além de 60 minutos é proibido.

---

# 6. Runbook `RBK-004` — restauração integral

Réplica não é backup. A recuperação somente é válida quando banco, objetos, chaves, metadados e hashes pertencem a um corte lógico coerente.

## 6.1 Gatilhos

- perda ou corrupção confirmada;
- integridade não confiável;
- desastre de infraestrutura;
- exercício trimestral.

Para qualquer causa, se não existir corte lógico comum e confiável dentro de 60 minutos, integridade prevalece sobre o RPO. Reconstrução por evidência confiável precisa reconciliar também `ENT-IMP-04`, primeiro `ProductionGo`, eventos `T_GO/T_RET/T_REENT`, `authority_epoch` e ledger de contingência; sem prova exata da autoridade corrente, o alvo fica em quarentena. Incidente, DP, Contábil e Jurídico decidem antes de `REC-018`.

### 6.1.1 Ramo obrigatório quando houver suspeita de comprometimento

Se perda, corrupção ou indisponibilidade puder decorrer de comprometimento de conta, segredo, artefato, pipeline ou infraestrutura, `RBK-004` é executado em conjunto com `RBK-007`. Antes de expor o alvo recuperado:

- escolher corte comprovadamente anterior ao primeiro indicador confiável do comprometimento; se isso não puder ser provado, manter o alvo em quarentena;
- reconstruir o alvo a partir de infraestrutura declarativa revisada, em conta/projeto ou domínio administrativo considerado limpo e separado do domínio possivelmente afetado;
- implantar somente artefato confiável por hash e origem aprovados, sem reutilizar imagem, configuração ou binário do ambiente suspeito;
- procurar persistência em identidades, papéis, políticas, banco, funções, extensões, objetos, inicialização, workers, pipelines, DNS e integrações;
- revogar e rotacionar, pelo `RBK-007`, credenciais administrativas, aplicação, banco, storage, e-mail, KMS e demais segredos potencialmente alcançados;
- provar que chaves históricas necessárias continuam recuperáveis, sem reativar credencial comprometida;
- repetir isolamento, autorização, integridade e smoke de segurança depois da rotação.

Ausência de corte anterior confiável, domínio limpo, artefato confiável, busca de persistência ou rotação aplicável impede `REC-018`.

## 6.2 Sequência

| ID | Ação | Resultado |
|---|---|---|
| `REC-001` | abrir incidente/exercício, validar relógios e iniciar `RTO-T0` | autoridade, fonte de tempo, tolerância e relógio corrido/útil registrados |
| `REC-002` | congelar mudanças e preservar evidências | nenhuma mutação concorrente |
| `REC-003` | escolher corte comprovado e obter do `registro_externo_autoridade` o último evento confirmado `ProductionGo`/`T_GO/T_RET/T_REENT`, época/hash anterior, manifesto, fence e mapa numérico; em comprometimento, corte anterior ao indicador | banco/objetos/chaves e cadeia CAS de autoridade coerentes |
| `REC-004` | criar alvo de recuperação isolado/em quarentena; em comprometimento, em domínio administrativo limpo | sem rota pública, efeito externo ou dependência administrativa do ambiente suspeito |
| `REC-005` | restaurar banco | versão/ponto corretos |
| `REC-006` | restaurar objetos, versões de chaves KMS, metadados recuperáveis ou mecanismo equivalente | mesmo corte lógico e capacidade de decifrar sem credencial comprometida |
| `REC-007` | implantar artefato compatível e confiável | hash/origem aprovados; nenhuma imagem ou configuração do ambiente suspeito |
| `REC-008` | validar esquema, RLS e constraints | catálogo íntegro |
| `REC-009` | conferir empresas, usuários e permissões | isolamento preservado |
| `REC-010` | conferir pagamentos, recibos e hashes | fatos/objetos coerentes |
| `REC-011` | conferir auditoria/checkpoints e reconciliar/reconstituir idempotentemente `ENT-IMP-04` somente pelo último evento CAS externo e sua cadeia exata | primeiro `production_go_id` preservado; fonte e `authority_epoch` correntes comprovadas; nenhuma projeção local adiantada/atrasada |
| `REC-012` | revogar globalmente todas as sessões, tokens e autorizações temporárias, inclusive posteriores ao corte | época/revogação global e rotação de chave quando aplicável impedem qualquer credencial antiga |
| `REC-013` | invalidar séries de códigos do corte e reconciliar senha/TOTP posteriores | recuperação segura quando necessário |
| `REC-014` | executar `RBK-018` e reconciliar maior numeração por empresa+ano | emitidos/reservados/incertos viram fatos ou lacunas; zero reuso |
| `REC-015` | reconciliar outbox/leases | nenhuma duplicação externa |
| `REC-016` | executar smoke crítico | jornadas aprovadas |
| `REC-017` | calcular RPO/RTO e reconciliar também autoridade/ledger; na exceção, reconstruir por evidência, registrar perda e repetir provas afetadas | nenhum domínio ou evento de autoridade inexplicado; tempo restante conhecido |
| `REC-018` | escolher ramo e autorizar `RTO-T1` somente com cadeia comprovada | autoridade sistema: pode abrir alvo; autoridade controle anterior+ledger: alvo permanece sem mutação e segue `RBK-020` até `T_REENT`; exercício não recebe tráfego |
| `REC-019` | calcular RTO final e registrar diferenças, melhorias e destino do ambiente antigo | RTO ≤8 h úteis, plano e preservação de evidências |
| `REC-020` | encerrar o ambiente correto | exercício elimina laboratório; incidente mantém ativo apenas o alvo coerente com a autoridade e preserva o afetado |

## 6.3 Evidência

- ponto e backups usados;
- tempo de cada passo;
- RPO e RTO corrido/útil;
- contagens de empresas, usuários, vínculos, pagamentos e recibos;
- inventário/hashes;
- sessões, numeração, outbox e cadeia `ProductionGo`/`T_GO`/`T_RET`/`T_REENT`/`authority_epoch` reconciliados;
- quando houver exceção de RPO: inventário de evidências, fatos reconstruídos, reconciliação integral, perda residual e decisões nominais;
- ausência de e-mail real;
- aprovadores;
- exercício: termo de eliminação do laboratório; incidente: termo de virada, isolamento/preservação e destino futuro autorizado do ambiente afetado.

No exercício, `RTO-T1` experimental é o instante em que todos os controles permitiriam abrir o tráfego, embora nenhuma rota real seja liberada. No incidente, `RTO-T1` exige tráfego efetivamente reaberto ao alvo recuperado. O exercício elimina seu laboratório; o incidente jamais elimina o ambiente que acabou de se tornar produção.

Restauração reprovada impede produção ou mantém incidente aberto até correção e novo ensaio completo.

---

# 7. Runbook `RBK-006` — suspeita de vazamento entre empresas

1. registrar `INC-T0` em canal externo;
2. impedir novas leituras/mutações da área afetada;
3. revogar todas as sessões potencialmente afetadas;
4. preservar logs, traces sanitizados, auditoria e hashes;
5. identificar rota, tarefa, arquivo, filtro, total, pool e empresas envolvidas;
6. testar A×B×inexistente em ambiente isolado;
7. corrigir causa em código, RLS, contexto ou autorização;
8. executar regressão completa de isolamento;
9. avaliar alcance e obrigações com Jurídico/LGPD;
10. restaurar somente se houver corrupção/perda, não por reflexo;
11. autorizar retorno e monitorar recorrência;
12. registrar decisão, comunicação, causa e prevenção.

Master sem ACL nominal de incidente não ganha acesso ao conteúdo do incidente.

---

# 8. Runbook `RBK-009` — worker/outbox atrasado

1. observar idade, tamanho, lease e tentativas;
2. não reenviar manualmente comandos financeiros/documentais;
3. verificar saúde do banco, worker, storage e dependência;
4. identificar se existe lease válido ou tarefa abandonada;
5. reconciliar chave idempotente e efeito já persistido;
6. retomar worker ou liberar lease conforme contrato;
7. mover para falha definitiva somente no limite aprovado;
8. intervenção manual recebe novo ID, usuário e justificativa;
9. confirmar zero pagamento, número, arquivo ou e-mail duplicado;
10. registrar causa e capacidade.

---

# 9. Runbook `RBK-017` — perda de acesso master

- usar código de recuperação individual quando elegível;
- se exatamente um dos dois masters ainda estiver apto, usar somente a contingência `B03-MST-06`;
- a sessão restrita acessa exclusivamente o fluxo aprovado;
- infraestrutura não redefine TOTP da aplicação;
- não existe conta mestra secreta ou backdoor;
- se nenhum master estiver apto e não houver recuperação utilizável, interromper e abrir nova decisão funcional antes de qualquer desbloqueio;
- o sistema nunca pode ser levado a menos de dois masters aptos por operação comum.

---

# 10. Runbook `RBK-020` — retorno ao controle anterior

1. direção/implantação/resposta a incidentes autorizam a contingência;
2. bloquear novas mutações no sistema e fencear/drenar consumidores, outbox, leases e efeitos em voo;
3. criar checkpoint e inventariar fatos/respostas incertas desde o `GO`;
4. preparar controle anterior e ledger como alocador único de numeração, ainda sem aceitar fato;
5. executar `RBK-018`: por empresa+ano apurar último comprometido, reservas e números incertos, reservar lacunas e fixar próximo número seguro; repetir fence/dreno e criar checkpoint final;
6. registrar `authority_switched_at = T_RET`, incrementar `authority_epoch`, anexar hash do mapa numérico, ativar ledger e tornar controle anterior autoritativo pelo protocolo fail-closed;
7. registrar cada novo fato uma única vez no intervalo de contingência e comunicar usuários, intervalo de autoridade e responsabilidades;
8. corrigir/recuperar o sistema ainda fechado, sem apagar fatos anteriores;
9. preparar reentrada, mantendo toda mutação normal — inclusive ano futuro — bloqueada no sistema;
10. suspender novos fatos no controle anterior e selar o ledger num corte `L`;
11. aplicar fatos, emitidos/reservados/incertos e lacunas; avançar monotonicamente a raiz normal sem alterar semente inicial;
12. reconciliar fatos, valores, números, documentos, auditoria, leases, outbox e época;
13. se surgir fato novo depois de `L`, invalidar a reconciliação, manter controle anterior + ledger autoritativos e repetir os passos 10–12;
14. somente após igualdade, executar novo `GO/NO-GO` e registrar `authority_switched_at = T_REENT` com nova `authority_epoch` pelo protocolo fail-closed;
15. encerrar o ledger depois de provar a troca e preservar o manifesto integral.

## 10.1 Protocolo fail-closed de autoridade

O `registro_externo_autoridade` fica em domínio independente do app/banco e do controle funcional anterior. Cada troca:

1. fenceia origem e destino e drena efeitos em voo;
2. prepara evento com época/hash anterior esperados, nova época, fontes, instante, mapa numérico e aprovações;
3. mantém a fonte de destino incapaz de aceitar fatos;
4. confirma um único sucessor por CAS append-only;
5. só depois do ACK durável habilita a fonte de destino;
6. reconcilia `ENT-IMP-04` idempotentemente antes de qualquer abertura do sistema.

Falha antes do CAS mantém a autoridade anterior. Falha depois do CAS não desfaz o evento: mantém as interfaces funcionais fechadas até a projeção local coincidir. Em `T_RET`, app/banco podem estar indisponíveis; o evento externo confirmado é a prova autoritativa, e a projeção local será recomposta antes de `T_REENT`. Nenhuma escrita dupla, cache obsoleto ou “último operador vence” é aceito.

Os intervalos são vinculantes:

- o sistema permanece a fonte autoritativa dos fatos aceitos/confirmados antes de `T_RET`, e o checkpoint final imediatamente anterior materializa essa fronteira;
- o controle anterior, acompanhado do ledger protegido, é autoritativo para fatos aceitos/confirmados em `[T_RET,T_REENT)`; a data efetiva de negócio pode ser anterior e não altera a fonte que aceitou o fato;
- o sistema retirado permanece somente leitura e como evidência; não disputa autoridade com o ledger;
- na reentrada, o novo `GO` em `T_REENT`, somente depois da reconciliação integral, encerra o intervalo do ledger e torna o sistema autoritativo para fatos aceitos a partir de `T_REENT`.
- antes de `T_REENT`, web/API/jobs/workers/leases/outbox rejeitam qualquer mutação com época obsoleta; anos/empresas futuros não são exceção.

Se o controle anterior, o ledger, o manifesto, o CAS externo ou a reconciliação aplicável falharem, mantém-se o ramo fail-closed e o incidente aberto. Nunca se anuncia a fonte de destino antes do ACK durável e nunca se abre o sistema com `ENT-IMP-04` divergente.

---

# 11. Segurança operacional

## 11.1 Acesso administrativo

- contas pessoais;
- MFA obrigatório;
- menor privilégio;
- acesso temporário quando possível;
- logs de ação;
- revisão trimestral e após mudança de pessoal;
- conta de emergência exclusiva da infraestrutura/nuvem, fora do produto, protegida, testada e com custódia dividida; ela não é master, não redefine credencial da aplicação, não acessa dado empresarial por conveniência e nunca possui `BYPASSRLS`;
- nenhuma credencial em ticket, documento ou chat.

## 11.2 Segredos e chaves

- fora do código e do artefato;
- versão e rotação definidas;
- chaves históricas preservadas enquanto houver ciphertext;
- comprometimento aciona `RBK-007`;
- indisponibilidade de KMS falha fechado para dado protegido;
- perder chave necessária invalida o backup correspondente.

## 11.3 Logs/evidências

São proibidos senha, token, cookie, TOTP, código, segredo, CPF/CNPJ integral desnecessário, endereço, contato, valor financeiro detalhado, resultado de ASO, corpo integral e conteúdo de arquivo.

## 11.4 Backup defensivo

- tráfego e repouso cifrados;
- cópia isolada em conta/projeto, credenciais e domínio administrativo separados;
- versões históricas de chaves KMS, metadados recuperáveis ou mecanismo equivalente permanecem vinculados ao mesmo checkpoint de banco/objetos; provedor que não permita exportação precisa demonstrar recuperação, proteção contra exclusão e continuidade no domínio isolado;
- imutabilidade e proteção contra exclusão inclusive pelo administrador primário de produção;
- verificação diária de legibilidade, cadeia, inventário e hashes de banco, WAL, objetos, checkpoint e evidências;
- alerta preventivo aos 45 minutos, crítico ao exceder 60 e imediato em falha de componente da cadeia;
- exercício trimestral sempre parte da cópia isolada;
- runbooks, contatos e evidências também possuem cópia protegida fora da aplicação;
- réplica não substitui backup e atraso isolado aciona `RBK-031`, não restauração reflexa.

---

# 12. Operação financeira mensal

Antes do adiantamento:

- participantes e elegibilidade atualizados;
- grupos prontos e impedimentos conhecidos;
- K07 aplicável conciliado somente na primeira competência;
- filas, storage, recibos e backups saudáveis;
- nenhum pagamento de teste em produção.

Depois do adiantamento:

- confirmações por grupo/evento reconciliadas;
- datas efetivas e recibos correspondentes;
- números sem duplicação;
- falha de PDF não desfaz pagamento;
- resposta incerta reconciliada antes de repetir.

No primeiro recibo legítimo de cada empresa+ano inicial, o commit grava na raiz `PENDENTE_RECONCILIACAO`, limites/hash/correlação e mantém a chave fenceada para a emissão seguinte. `RBK-018` confirma autoridade/época, manifesto/ramo, número esperado, raiz, recibo lógico, auditoria, snapshot, outbox e arquivo; depois, `CTL-REC-001(CONFIRMAR_PRIMEIRA_FAIXA)` registra `RECONCILIADA` append-only e libera a próxima reserva. Se o primeiro comando for lote, toda a primeira faixa atômica é reconciliada. Não se cria recibo de teste; resposta incerta aciona também `RBK-025`, e falha de PDF não desfaz o recibo lógico nem libera o fence.

Antes/depois do final:

- K06 individual e indicador conferidos;
- correções/ajustes abertos tratados;
- grupos independentes resolvidos;
- documentos e hashes reconciliados;
- competência fecha somente sem pendência.

---

# 13. Incidentes

## 13.1 Fluxo

1. detectar e registrar;
2. classificar;
3. preservar evidência;
4. conter;
5. identificar alcance;
6. erradicar causa;
7. recuperar e restaurar somente quando aplicável;
8. avaliar obrigações;
9. registrar decisões/comunicações;
10. monitorar;
11. concluir;
12. registrar melhoria.

## 13.2 Registro externo e reconciliação

Se o sistema estiver indisponível ou suspeito, o registro externo protegido é a fonte do incidente. Depois, somente fatos aprovados são reconciliados em I01/I02, mantendo referência à evidência original.

## 13.3 Exercícios

- antes da produção: vazamento A×B;
- anual: cenário revisado;
- depois de mudança crítica: cenário afetado;
- falha do exercício gera plano e repetição.

Contenção, preservação de evidência e avaliação jurídica não pausam fora da janela nominal de suporte. Todo incidente registra tempo corrido e tempo útil separadamente; a operação não oculta espera ou atraso do relógio real.

---

# 14. Continuidade documental

Runbooks, contatos, parâmetros essenciais e instruções de restauração devem existir fora da aplicação, em repositório protegido e acessível durante indisponibilidade. A cópia:

- não contém segredo aberto;
- possui versão/checksum;
- tem acesso nominal;
- é revisada após mudança;
- é testada nos exercícios.

---

# 15. Relatório mensal de operação

Sem dados pessoais detalhados, registra:

- disponibilidade observada e janela medida;
- p95 dos fluxos principais;
- incidentes por severidade;
- alertas recorrentes;
- fila/worker e falhas definitivas;
- documentos pendentes/divergentes;
- idade máxima do ponto restaurável;
- resultado do último backup/restauração;
- capacidade e tendência;
- acessos administrativos alterados;
- vulnerabilidades e patches;
- problemas, proprietários e prazo.

---

# 16. Critério de aprovação do 23D

O planejamento será aprovado quando o usuário confirmar:

- o catálogo de 31 runbooks e o gate `RDY-OPS` que exige fichas completas antes de produção;
- o calendário de rotinas;
- painéis e alertas fora do sino funcional;
- os marcos de cinco e dez minutos para fila;
- a restauração integral em 20 passos;
- RTO começando na indisponibilidade/integridade não confiável e terminando só na reabertura validada;
- RPO sobre banco, objetos, metadados, hashes e chaves no mesmo corte;
- nenhum suporte solicitando credencial;
- nenhum acesso direto ao banco como rotina comum;
- recuperação master sem backdoor;
- restauração reconciliando a cadeia protegida de `ProductionGo`, `T_GO`, `T_RET`, `T_REENT` e `authority_epoch`, sem abrir um alvo cuja autoridade corrente não esteja comprovada;
- retorno ao controle anterior com ledger, handoff numérico sem reuso em `T_RET/T_REENT` e nova decisão fail-closed de autoridade;
- primeira emissão legítima por empresa+ano inicial fenceada até a reconciliação integral da primeira faixa;
- exercício de incidente antes da produção, anual e após mudança crítica.

---

**Situação desta versão:** catálogo e modelos concluídos; rotinas ainda não executadas.  
**Estado de execução:** `NOT_RUN_PLANNED`.  
**Próxima ação:** aprovação com o Documento 23 e nomeação futura dos proprietários.
