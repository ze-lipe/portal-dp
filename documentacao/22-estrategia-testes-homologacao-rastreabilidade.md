# Documento 22

## Estratégia de Testes, Homologação e Rastreabilidade

> **Status:** aprovado integralmente pelo usuário em 22 de agosto de 2026.  
> **Data-base:** 22 de agosto de 2026.  
> **Autoridade funcional:** Documento 17 aprovado.  
> **Modelo e rastreabilidade de dados:** Documentos 18 e 18A aprovados.  
> **Arquitetura e contratos:** Documentos 19, 20 e 20A aprovados.  
> **Backlog e ordem de execução:** Documentos 21 e 21A aprovados.  
> **Anexos verificáveis:** Documento 22A — Matriz Executável de Casos, Perfis e Evidências; Documento 22B — Matriz de Conformidade das 60 Telas e Subfluxos; Documento 22C — Inventário Executável de Testes Técnicos e Contratos ASVS/WCAG; Documento 22D — Caderno Executável dos 25 Cenários Compostos Obrigatórios.  
> **Sincronização técnica posterior:** testes `ENT-IMP-*`, `ProductionGo`, deltas e recuperação alinhados ao pacote 23, aprovado integralmente pelo usuário em 22/08/2026.  
> **Estado na data da aprovação:** o código de produção ainda não havia sido iniciado.  
> **Checkpoint posterior:** a implementação da baseline `ETP-00` está registrada em `docs/ETP-00.md`; nenhuma implantação de produção foi iniciada.

---

# 1. Finalidade

Este documento transforma o planejamento aprovado em uma estratégia verificável de qualidade. Ele define:

- como as 440 âncoras `TST-*` serão convertidas em casos executáveis;
- quais variações positivas, negativas, temporais, concorrentes e de segurança serão aplicadas;
- quais camadas de teste provarão cada tipo de comportamento;
- quais ambientes, massas, relógios e simuladores serão usados;
- como serão testados cálculo, pagamento, recibo, arquivos, ASO, multiempresa, autorização e auditoria;
- como desempenho, resiliência, restauração e acessibilidade serão medidos;
- quais evidências permitem homologar uma etapa;
- quais defeitos bloqueiam avanço;
- como os 440 IDs funcionais, 253 itens de backlog, 18 épicos, 15 etapas e dez gates permanecem rastreados.

Este documento não cria regra funcional, estado, cálculo, tela, permissão ou contrato novo. Se um teste revelar ambiguidade, a autoridade correspondente deverá ser corrigida antes do código; o teste não poderá escolher silenciosamente uma interpretação.

---

# 2. Ordem de autoridade

| Assunto | Fonte de autoridade |
|---|---|
| Regra funcional, estado, transição, cálculo e oráculo de negócio | Documento 17 |
| Entidade, relacionamento, restrição, RLS e persistência | Documentos 18 e 18A |
| Arquitetura, segurança, infraestrutura, desempenho, backup e observabilidade | Documento 19 |
| API, DTO, erro, autorização, transação, idempotência e tarefa | Documentos 20 e 20A |
| Item de trabalho, prioridade, dependência, etapa, gate e risco | Documentos 21 e 21A |
| Composição de testes, massa, evidência e homologação | Documento 22 e anexos 22A/22B/22C/22D |
| Implantação, carga inicial, operação e retorno seguro | Documento 23 e anexos 23A–23D |

Em divergência:

1. interrompe-se o caso afetado;
2. registra-se a inconsistência;
3. corrige-se primeiro o documento de autoridade;
4. atualizam-se as matrizes descendentes;
5. o validador de rastreabilidade volta a ser executado;
6. somente então o caso e o desenvolvimento prosseguem.

---

# 3. Decisões de qualidade fechadas

| ID | Decisão |
|---|---|
| QLT-001 | Os 440 IDs funcionais são obrigatórios; nenhum pode ser coberto apenas por declaração genérica. |
| QLT-002 | Cada `TST-<ID funcional>` é um caso-raiz estável e pode se decompor em variações com sufixo padronizado. |
| QLT-003 | Uma variação pode ser marcada como não aplicável somente com justificativa verificável e regra de aplicabilidade deste documento. |
| QLT-004 | PostgreSQL real é obrigatório para integração, RLS, locks, constraints, migrações e concorrência. Mock, SQLite ou repositório em memória não aprovam esses comportamentos. |
| QLT-005 | Dados reais de produção são proibidos em desenvolvimento, CI e homologação. |
| QLT-006 | O mesmo artefato imutável testado em homologação é o candidato promovido; produção não recebe recompilação especial. |
| QLT-007 | Automação e homologação humana se complementam. Uma não substitui a outra quando o gate exige ambas. |
| QLT-008 | RLS, autorização, auditoria, telemetria e proteções de produção permanecem ligadas durante testes de desempenho e homologação. |
| QLT-009 | Teste instável não pode ser convertido em sucesso por repetição automática silenciosa. |
| QLT-010 | Nenhum dado financeiro pago, recibo definitivo, histórico ou auditoria é apagado para facilitar teste de correção. |
| QLT-011 | A evidência de aceite identifica artefato, esquema, fixture, casos, resultado, ambiente e homologador. |
| QLT-012 | Não haverá implantação parcial em produção antes do candidato completo e dos Documentos 22 e 23 aprovados. |

---

# 4. Objetivos de qualidade

## 4.1 Correção funcional

Provar que cada intenção autorizada produz exatamente o estado, cálculo, arquivo ou projeção aprovado, inclusive nos limites de datas, competência, vigência, pagamento e desligamento.

## 4.2 Integridade

Provar que:

- restrições do banco permanecem válidas;
- transações são atômicas;
- concorrência não causa última gravação silenciosa;
- repetição não duplica pagamento, recibo, número, arquivo, e-mail ou notificação;
- fato já pago não é sobrescrito;
- histórico e cadeia documental permanecem íntegros.

## 4.3 Sigilo e menor privilégio

Provar negação por padrão, isolamento entre empresas, autorização por ação/objeto/estado/campo e ausência de vazamento em tela, API, erro, total, filtro, histórico, log, notificação, exportação e arquivo.

## 4.4 Disponibilidade e recuperação

Provar comportamento seguro diante de falha de dependência, retomada idempotente do worker, integridade de backup e restauração do sistema completo dentro do RPO e RTO aprovados.

## 4.5 Usabilidade e acessibilidade

Provar que as jornadas principais, os estados comuns e as mensagens são compreensíveis e utilizáveis por teclado, com foco, rótulos, contraste e informação não dependente apenas de cor.

## 4.6 Desempenho e capacidade

Provar as metas com volume representativo, dez usuários simultâneos e todos os controles de segurança e observabilidade ativos.

## 4.7 Operabilidade e rastreabilidade

Provar que falhas podem ser correlacionadas sem registrar conteúdo proibido e que cada requisito, operação, item, teste, evidência, defeito e aceite possui ligação verificável.

A rastreabilidade funcional é individual, por `ID funcional → OPR → BK/EPC → ETP → TST/EVD`, nos Documentos 21A e 22A. A rastreabilidade técnica transversal é resolvida por família ou subfaixa no Documento 22C e expandida automaticamente para cada `TST-API-*` e `QAT-*`; todo caso técnico precisa resultar em requisito técnico e `BK/EPC` garantidor existentes, sem sobreposição ambígua.

---

# 5. Unidade básica de teste

## 5.1 Caso-raiz

O identificador de cada caso-raiz é exatamente:

`TST-<ID do Documento 17>`

Exemplo:

`TST-K07-08` prova a intenção funcional de fechar uma competência e mantém os vínculos aprovados com sua operação, item de backlog, épico e etapa.

O caso-raiz não é considerado aprovado apenas porque o caminho nominal passou. Ele agrega as variações aplicáveis da seção 5.2.

## 5.2 Sufixos de variação

| Sufixo | Finalidade |
|---|---|
| `::NOM` | Caminho nominal e resultado funcional esperado. |
| `::VAL` | Campo inválido, catálogo fechado, limite, duplicidade ou pré-condição ausente. |
| `::AUT` | Ação, objeto, estado ou perfil não autorizado. |
| `::TEN` | Empresa A versus empresa B, identificador inexistente e contexto divergente. |
| `::FLD` | Campo oculto, mascarado, somente leitura e editável. |
| `::CTX` | Contexto ausente, versão de contexto antiga, troca de aba ou escopo incompatível. |
| `::CON` | ETag, versão, lock, chave natural ou alteração concorrente. |
| `::IDM` | Repetição, perda de resposta, mesma chave/mesma intenção e mesma chave/outra intenção. |
| `::AUD` | Evento, ator, empresa, antes/depois, correlação e sanitização. |
| `::FAL` | Falha de banco, auditoria, worker, storage, e-mail, CEP, KMS ou telemetria aplicável. |
| `::TMP` | Relógio, prazo, competência, fuso, expiração ou rotina temporal. |
| `::DOC` | Snapshot, número, hash, PDF, Excel, expiração e download. |
| `::A11Y` | Teclado, foco, rótulo, mensagem, contraste e leitor semântico aplicáveis. |
| `::PERF` | Latência, duração, capacidade, fila, taxa de erro ou consumo de recurso. |
| `::MIG` | Migração, constraint, compatibilidade de esquema e avanço/retorno. |
| `::REC` | Restauração, reconciliação e retorno seguro. |

Exemplo: `TST-P09-05::IDM` identifica a prova de repetição e resposta incerta do comportamento `P09-05`.

## 5.3 Campos obrigatórios de um caso funcional

Todo caso funcional executável do Documento 22A terá:

1. identificador estável;
2. título e intenção;
3. ID funcional;
4. `OPR-*`, `BK-*`, `EPC-*` e `ETP-*`;
5. pré-condições e estado inicial;
6. ator, perfil, empresa/escopo e estado dos campos;
7. fixture e relógio;
8. entrada ou evento;
9. passos automatizados ou roteiro humano;
10. oráculos de resposta, domínio, banco, auditoria e efeitos;
11. efeitos que obrigatoriamente não podem ocorrer;
12. camada e ambiente;
13. evidência esperada;
14. situação: não executado, aprovado, reprovado, bloqueado ou não aplicável justificado;
15. defeito associado, quando houver.

Os casos técnicos do Documento 22C seguem o mesmo rigor de objetivo, massa, ambiente, proprietário, etapa, gate, evidência, situação e defeito, mas não inventam um ID funcional ou `OPR-*`. Seu requisito técnico e `BK/EPC` garantidor são obtidos pela tabela normativa de herança do Documento 22C §2.5, cuja expansão é validada ID a ID.

## 5.4 Receita executável comum

Cada linha do Documento 22A é executada pela composição:

```text
DADO
    o estado inicial e as guardas do Documento 17;
    as entidades/restrições/projeções do Documento 18A;
    o ator, a empresa, o perfil e a fixture declarados;
QUANDO
    o gatilho e a realização do Documento 20A forem executados;
ENTÃO
    o estado e a intenção do Documento 17 deverão ser observados;
    o contrato, erro, transação, repetição e autorização do Documento 20 deverão ser respeitados;
    o banco, a auditoria, a outbox e os arquivos deverão satisfazer os oráculos aplicáveis;
    nenhum efeito proibido poderá existir.
```

Essa composição torna cada âncora executável sem copiar 440 vezes o mesmo texto transversal.

---

# 6. Perfis de aplicabilidade

## 6.1 Por classe de realização

| Classe do Documento 20A | Camadas mínimas |
|---|---|
| `HTTP` | contrato/API, integração real, autorização negativa e ponta a ponta quando houver tela |
| `HTTP_INTERNO` | regra unitária, integração transacional e caso de origem |
| `JOB_WORKER` | regra unitária, integração com outbox/fila, interrupção, retomada e duplicação |
| `JOB_TEMPORAL` | regra unitária com relógio controlado, API com prazo vencido e rotina idempotente |
| `UI_LOCAL` | componente, teclado/foco, integração visual e ponta a ponta da jornada |
| `PROJECAO` | unidade/propriedade, autorização de saída e integração com fonte persistida quando aplicável |
| `POLITICA` | integração adversarial, concorrência/idempotência/autorização e jornada que a consome |

## 6.2 Por característica técnica

| Característica encontrada no contrato | Variações adicionais obrigatórias |
|---|---|
| `IDEM-01` ou `IDEM-02` | `::IDM` com perda de resposta e chave divergente |
| `CONC-01` ou `CONC-02` | `::CON` com duas operações realmente concorrentes |
| `APIAUD-01` | `::AUD` com antes/depois e rollback se a auditoria falhar |
| `APIAUD-02` | `::AUD` sem copiar o conteúdo sensível |
| recurso empresarial | `::TEN` e `::CTX` |
| entrada ou saída sujeita a permissão por campo | `::FLD` |
| arquivo ou operação assíncrona | `::DOC` e `::FAL` |
| prazo ou expiração | `::TMP` com relógio do servidor |
| dinheiro, percentual, D30 ou saldo | casos dourados, propriedades e limites monetários |
| comando em lote | candidato alterado, um inelegível e todos-ou-nenhum |
| reautenticação | prazo, ação, alvo, versão, impacto, consumo único e concorrência |
| interface | `::A11Y` e estados de carregamento, vazio, validação, erro, conflito e revogação |

## 6.3 Uso de não aplicável

`N/A` somente é aceito quando:

- a variação não existe para aquela classe segundo as tabelas anteriores;
- a justificativa cita uma regra deste documento;
- o revisor de qualidade aprova a justificativa;
- o validador mantém o caso-raiz coberto.

Não são justificativas válidas:

- “o botão está escondido” para dispensar autorização;
- “já foi testado em outro módulo” sem composição rastreada;
- “nunca deve acontecer” para dispensar concorrência ou repetição;
- “é apenas interno” para dispensar empresa, autorização técnica ou auditoria aplicável;
- “o framework cuida” sem uma prova do comportamento configurado.

---

# 7. Camadas da estratégia

## 7.1 Validação documental e estática

Executada desde a ETP-00 e em toda mudança:

- igualdade dos 440 IDs entre Documentos 17, 18A, 20A, 21A e 22A;
- 436 transições e quatro regras de projeção `ASO-R*`;
- duplicados, órfãos e lacunas iguais a zero;
- 36 famílias `OPR-*` reconhecidas;
- um `BK-*`, um `EPC-*` e uma `ETP-*` proprietários por ID;
- todo `TST-*` com sufixo idêntico ao ID funcional;
- referências de entidade, restrição, projeção, estado, API, tarefa, política e erro existentes;
- OpenAPI, manifesto e DTO sem elemento órfão;
- dependências sem ciclo;
- mutação sem transição, autorização, idempotência ou concorrência exigível bloqueada;
- rota empresarial sem autoridade do cliente sobre `empresa_id`;
- arquivo sem reautorização ou resposta sensível sem `no-store` bloqueados.

## 7.2 Teste unitário e de propriedade

Aplica-se a:

- D30 e `PARTILHAR_D30`;
- decimal, arredondamento e partilha de centavos;
- guardas de estado;
- validações de CPF, CNPJ, CEP, competência, datas e intervalos;
- vigências e sobreposição;
- autorização pura por ação/objeto/estado/campo;
- projeção e máscara;
- composição de recibo;
- cálculo de hash/fingerprint;
- classificação de prazo e alertas;
- serialização sanitizada.

Regras críticas terão cobertura integral das decisões de domínio aprovadas. Cobertura de linha não substitui os casos dourados, propriedades e mutações relevantes.

## 7.3 Teste de componente

Cada componente de interface prova:

- estados carregando, vazio, preenchido, validação, erro, conflito e revogação;
- quatro estados de campo;
- teclado e foco;
- rótulos e mensagens;
- confirmação humana e cancelamento;
- limpeza de conteúdo após troca/revogação;
- ausência de valor sensível no DOM quando oculto;
- máscara produzida pelo servidor sem valor integral escondido no cliente.

## 7.4 Integração com PostgreSQL real

Prova:

- migrações em base limpa e em versão anterior;
- PK, FK composta, `CHECK`, unicidade, exclusão e imutabilidade;
- inspeção de catálogo e migração prova `ENABLE ROW LEVEL SECURITY` e `FORCE ROW LEVEL SECURITY` em cada tabela empresarial aplicável, além de políticas `USING` e `WITH CHECK` coerentes;
- RLS default-deny; tabela empresarial nova sem RLS/`FORCE` exigidos bloqueia o gate;
- papel web sem propriedade ou `BYPASSRLS`;
- `SET LOCAL` por transação e limpeza no pool;
- transação, rollback e outbox;
- locks e duas sessões concorrentes;
- índices e planos dos acessos críticos;
- retenção de histórico e impossibilidade de sobrescrita proibida.

## 7.5 Contrato e API

Cada operação pública prova:

- método, rota, status e esquema;
- DTO estrito e rejeição de propriedade extra;
- Problem Details e `code` estável;
- cookie, CSRF, origem e conteúdo permitido;
- `X-Context-Version`, `If-Match`, `Idempotency-Key` e reautenticação aplicáveis;
- serialização autorizada;
- negação neutra;
- nenhuma confirmação indevida de existência;
- compatibilidade entre OpenAPI, servidor e cliente.

## 7.6 Worker, outbox e tempo

Prova:

- tarefa contém escopo mínimo e uma empresa;
- claim/lease concorrente produz um executor efetivo;
- interrupção antes e depois de cada fronteira;
- reentrega produz um único efeito;
- efeito comprometido continua sem reabrir decisão;
- pedido autorizável revalida antes de gerar e entregar;
- rotina temporal é idempotente;
- prazo é recusado pela API mesmo com worker parado;
- fila de falhas e retomada manual são auditáveis.

## 7.7 Ponta a ponta

Usa navegador real e API/banco/worker reais do ambiente de teste. Cada etapa terá ao menos:

- sua demonstração obrigatória do Documento 21;
- um caminho nominal;
- uma negação de permissão;
- uma negação entre empresas;
- uma falha ou conflito relevante;
- um caso de retomada quando houver efeito assíncrono.

E2E não substitui as provas mais precisas das camadas inferiores.

## 7.8 Segurança

Combina:

- validações estáticas e de dependências;
- testes automatizados adversariais;
- DAST autenticado em homologação;
- revisão de configuração;
- revisão independente antes da produção;
- exercício de incidente e vazamento entre empresas.

## 7.9 Desempenho, resiliência e restauração

Executados em homologação representativa e no laboratório isolado de restauração, com procedimento, volume, duração e evidências deste documento.

---

# 8. Ambientes de teste

| Ambiente | Uso | Dados | Dependências |
|---|---|---|---|
| Local | desenvolvimento e testes rápidos | sintéticos descartáveis | PostgreSQL real local/isolado e simuladores |
| CI efêmero | unitário, integração, contrato, componente e E2E de mudança | fábricas determinísticas | banco e serviços isolados por execução |
| Homologação | regressão, aceite humano, DAST, desempenho e falhas | fixture sintética representativa ou anonimização formal aprovada | serviços equivalentes e integrações homologadas |
| Laboratório de restauração | exercício de backup e recuperação | cópia de teste produzida para o exercício | sem rota pública e sem efeitos externos |
| Produção | somente smoke seguro após implantação | dados reais | nenhuma massa de teste destrutiva |

## 8.1 Separação obrigatória

Produção e não produção não compartilham banco, bucket, fila, chave, segredo, remetente, conta de serviço, telemetria consultável em conjunto nem backup.

## 8.2 Serviços externos em teste

| Serviço | CI | Homologação |
|---|---|---|
| E-mail | caixa coletora/simulador sem entrega real | conta e remetente de homologação, destinatários controlados |
| CEP | resposta determinística e falhas simuladas | adaptador real homologado mais cenários de indisponibilidade |
| Objetos | implementação isolada com mesmas garantias contratuais | serviço escolhido, bucket privado exclusivo |
| KMS/segredos | chaves descartáveis isoladas | serviço e política equivalentes à produção |
| Observabilidade | coletor isolado e inspeção de sanitização | pilha representativa sem consulta cruzada |

Simulador não substitui ao menos um teste de contrato com cada fornecedor efetivamente escolhido antes da ETP-11.

## 8.3 Produção

Em produção somente são permitidos:

- vida e prontidão;
- acesso controlado de um usuário de homologação operacional já autorizado;
- seleção de empresa sem mutação;
- consulta mínima não sensível aprovada;
- verificação técnica de worker e dependências sem disparar efeito real.

Teste de carga, DAST invasivo, criação destrutiva e massa fictícia são proibidos em produção.

---

# 9. Fixture sintética e massas

## 9.1 Versionamento

A fixture comum recebe identificador imutável `FIX-MAJOR.MINOR.PATCH` e hash. Alteração que mude resultado esperado incrementa versão e exige regressão dos casos afetados.

Todos os geradores:

- usam semente registrada;
- produzem IDs opacos determinísticos somente no ambiente de teste;
- não consultam fonte real;
- registram versão do algoritmo;
- podem recriar a base do zero.

## 9.2 Pacotes de massa

| Pacote | Conteúdo mínimo |
|---|---|
| `MASS-BASE` | três empresas, dois masters aptos e perfis divergentes |
| `MASS-AUT` | primeiro acesso, senha definitiva, bloqueio, recuperação, TOTP, códigos, sessões e revisões; agregado bootstrap ausente/aberto/consumido com dois membros nos estados pendente/pronto/ativado |
| `MASS-TEN` | objetos equivalentes em A e B, IDs inexistentes e CPF/CNPJ iguais entre empresas |
| `MASS-FLD` | campo oculto, mascarado, somente leitura e editável |
| `MASS-CAD` | 65 vínculos ativos, mais de 300 inativos, recontratação, início sem registro e desligamento |
| `MASS-MEI` | contrato ativo, renovação contínua, retorno após interrupção e serviço adicional de competência |
| `MASS-FIN` | competência de uma única empresa com 100 participantes, líquido oficial, K06, RA, complemento, PSR, reembolso, serviço MEI, valor zero, correção e absorção |
| `MASS-D30` | todos os exemplos normativos da seção 12.4.3 do Documento 17 |
| `MASS-DOC` | recibos de tipos/eventos distintos, original, cancelado, substituto, lote, hash válido/divergente e temporário vencido |
| `MASS-ASO` | admissional, periódico, mudança de risco, retorno e demissional; vigente, vencendo, vencido, retificado e não comparecimento |
| `MASS-INC` | incidente restrito, linha do tempo, ACL nominal e master sem acesso |
| `MASS-LOAD` | massa exata da seção 21.4 mais carga sintética com snapshot, delta legítimo de encerramentos, delta tardio de número externo maior, recorrentes/avulsos/serviços não pagos, K07 e sementes com manifesto/janela/autorização aberta, revogada e divergente; 115 ativos, 400 inativos, 72 competências, 7.200 participações, 50.000 grupos/eventos, 10.000 recibos, 250.000 auditorias e dez sessões |
| `MASS-REC` | banco, objetos, chaves, sessões, números, hashes e auditoria para restauração |
| `MASS-22B` | os 60 IDs canônicos de tela/subfluxo do Documento 22B |

## 9.3 Relógio e calendário

- tempo vem de uma porta controlável nos testes;
- relógio do servidor é a autoridade;
- fuso padrão do produto é exercitado conforme a configuração aprovada;
- testes fixam instante, fuso e calendário;
- incluem fevereiro de 28 dias, fevereiro bissexto, mês de 30, mês de 31, limites dos dias 15/16 e virada de competência;
- nenhuma espera real longa é usada para provar 15 minutos, 24 horas ou 30 dias;
- execução aleatória registra a semente e o instante.

## 9.4 Proteção da massa

- e-mails e telefones não pertencem a pessoas reais;
- CPF/CNPJ matematicamente válidos são identificados e usados somente no ambiente isolado;
- logos e arquivos são artificiais;
- resultado de ASO é fictício e mínimo;
- logs de teste também obedecem à sanitização;
- qualquer dado recebido por engano de produção é tratado como incidente, não como fixture.

---

# 10. Oráculos

| Oráculo | Prova |
|---|---|
| Contrato | status, cabeçalho, DTO, Problem Details e código estável |
| Domínio | estado final, guardas, memória, saldo, prazo ou projeção |
| Persistência | linhas, versões, constraints, ausência de duplicação e rollback |
| Segurança | autorização, RLS, campo, negação neutra e ausência de vazamento |
| Auditoria | ator, sessão, escopo, empresa, ação, entidade, correlação e antes/depois autorizado |
| Assíncrono | outbox, tarefa, tentativas, lease, retomada e efeito único |
| Documento | tipo, snapshot, número, valor, hash, vínculo, privacidade e expiração |
| Interface | conteúdo, capacidades, estado, foco, mensagem e limpeza |
| Observabilidade | métrica/rastro útil e log sem dado proibido |
| Desempenho | duração, p95/limite, amostra, erro, fila e infraestrutura |
| Recuperação | corte lógico, RPO, RTO, reconciliação, sessões e números |

O resultado visual isolado nunca é o único oráculo de operação crítica.

---

# 11. Caderno financeiro obrigatório

## 11.1 Precisão

- entrada e saída monetária usam decimal em texto;
- cálculo interno usa decimal de maior precisão;
- persistência monetária usa duas casas;
- arredondamento ocorre apenas na fronteira aprovada;
- terceira casa de `0` a `4` mantém a segunda; de `5` a `9` eleva;
- não existe arredondamento especial de complemento;
- a parcela final absorve o centavo residual por diferença;
- ponto flutuante binário é proibido.

## 11.2 D30

Todos os 24 casos da seção 12.4.3 do Documento 17 são casos dourados obrigatórios. Além dos valores exatos, testes de propriedade comprovam:

1. intervalo válido nunca produz menos de um dia;
2. um segmento mensal nunca supera 30;
3. intervalo entre competências é soma dos segmentos;
4. dia 30 e 31 não são contados duas vezes no mesmo segmento;
5. fim de fevereiro completo alcança posição 30;
6. `PARTILHAR_D30` não cria lacuna ou sobreposição;
7. soma das vigências é igual ao D30 do direito total;
8. nenhuma vigência recebe valor negativo;
9. memória reproduz integralmente a atribuição.

## 11.3 Cenários financeiros compostos

São obrigatórios, além das 440 âncoras:

O Documento 22D materializa exatamente os **25 cenários compostos** exigidos pelo Documento Mestre §36. Cada um declara entradas, memória/oráculo, recibos esperados e estados finais. A lista abaixo funciona como índice de coberturas adicionais e não substitui os vetores completos do anexo.

- início das atividades dia 1 e admissão dia 15, com PSR em base própria e salário-base/RA sem dupla contagem;
- corte oficial testado pela **data de admissão**: dia 15 ou antes permite adiantamento oficial proporcional; dia 16 ou depois destina o oficial somente ao final;
- corte de RA, complementos e PSR testado pela **data de início das atividades**: dia 15 ou antes permite o adiantamento configurado; dia 16 ou depois destina o devido somente ao final;
- corte do contrato MEI testado pela **data de início do contrato**: dia 15 ou antes permite adiantamento contratual proporcional; dia 16 ou depois destina o devido somente ao final;
- caso misto com início das atividades no dia 1 e admissão no dia 16: RA, complementos e PSR seguem o corte do início, enquanto o oficial não recebe adiantamento;
- empregado e MEI em fevereiro e mês com 31 dias;
- RA criada depois do adiantamento pago destinada ao final;
- complemento avulso criado depois do adiantamento pago destinado ao final;
- serviço adicional MEI somente da competência e integral no pagamento final; corrigido antes do final pago, recalcula; depois do pagamento, somente F04;
- reembolso é valor real informado e conferido, sem cálculo automático de INSS, IR ou sindicato;
- oficial, RA/reembolso, complementos, PSR, contrato MEI, serviço adicional, rescisão oficial, acerto de RA e ajuste positivo confirmados separadamente quando aplicáveis;
- reembolso habilitado no adiantamento e no final;
- competência bloqueada enquanto evento obrigatório estiver aberto;
- ajuste manual preservando automático, justificativa, antes/depois e diferença;
- fato pago imutável e correção por cadeia;
- desligamento com RA parcialmente paga, saldo proporcional nunca negativo;
- rescisão oficial informada pelo contador separada do acerto de RA;
- MEI renovado continuamente e novo contrato somente após interrupção;
- valor zero sem número ou recibo;
- pagamento oficial/K06/rescisão oficial sem recibo complementar indevido;
- adiantamento e final com recibos separados para cada tipo documental aprovado.

## 11.4 Confirmação individual e lote

Cada **grupo e evento aplicável** é confirmado individualmente. Isso inclui oficial, RA/reembolso, complemento, PSR, contrato MEI, serviço adicional MEI no final, rescisão oficial, acerto complementar de RA e ajuste positivo. Confirmar um deles nunca confirma outro. O teste de lote comprova:

- conjunto congelado;
- nova autorização imediatamente antes do commit;
- um candidato alterado ou inelegível confirma zero itens;
- nenhuma confirmação parcial;
- repetição da mesma intenção não duplica;
- perda de resposta é reconciliada antes de nova tentativa;
- data efetiva e ator são preservados;
- pagamento final somente ocorre quando seu checklist permitir;
- fechamento somente ocorre depois de todos os eventos exigidos.

## 11.5 Carga da competência inicial

As duas cargas secas e a carga final controlada usam o mesmo oráculo de classes. Os testes devem provar:

- snapshot com vínculos/contratos ativos e delta contendo somente encerramentos reais ocorridos até o congelamento final;
- encerramento ausente do delta mantém o registro ativo, enquanto encerramento inventado ou sem origem bloqueia a carga;
- complementos recorrentes vigentes, complementos avulsos de empregado e serviços adicionais MEI já conhecidos e ainda não pagos entram pelas entidades/comandos normais, são calculados, conferidos e pagos sem atalho de migração;
- componente já pago entra exclusivamente por K07, participa apenas das deduções necessárias, não reaparece como pagável e não fabrica recibo;
- cada item fica em exatamente uma classe — não pago no fluxo normal ou já pago por K07 — sem omissão nem dupla contagem;
- a pré-carga registra apenas candidato em `ENT-IMP-01/02`; `CTL-IMP-001/PREPARAR`, decisões pessoais `DECIDIR_ESCOPO` e `PROMOVER` são fases distintas; `CTL-IMP-003/DECIDIR_FINAL` recebe decisões próprias e distintas de DP/Contábil e `FINALIZAR` fixa `candidato_final_versao/hash` e `ledger_conteudo_versao/hash`, sem representação pelo executor técnico;
- para cada empresa+ano, o oráculo bifurca: sequência externa existente exige entrada `FINAL_APROVADO`, operador nominal, reautenticação e autorização curta exata; ausência dupla usa `SEM_NUMERACAO_ANTERIOR`, não chama `API-REC-009`, não cria raiz/semente e faz a primeira emissão usar o início padrão; uma semente imutável idêntica de tentativa anterior usa `SEMENTE_EXISTENTE_VERIFICADA`, sem nova capacidade;
- semente×semente, fechamento×semente, ausência×primeira emissão, `GO`×primeira emissão e delta×`GO` produzem um único commit coerente; a primeira faixa grava `PENDENTE_RECONCILIACAO`, bloqueia a reserva seguinte e só `CTL-REC-001`, depois de `RBK-018`, grava `RECONCILIADA`; `entrada_ativa = NULL`, reativação, valor/estado/contexto/hash divergente e autorização revogada produzem zero efeito;
- antes de `CTL-IMP-003`, delta cria novo ciclo no mesmo manifesto; depois, manifesto não terminal fecha `FECHADO_NO_GO`, enquanto manifesto já reconciliado recebe `CTL-IMP-004(INVALIDAR_GO)` e `ENT-IMP-05` sem reterminalização. `ENT-IMP-05`, sucessor ou fato posterior bloqueia `IMP-CUT-018`; seed idêntica é só verificada e mudança do máximo/prova exige baseline limpo;
- `CTL-IMP-004` fixa `reconciliacao_ledger_versao/hash`, revoga capacidades e torna entradas inativas; `IMP-CUT-018` vincula esse conjunto, `ledger_conteudo_versao/hash`, escopo, fence final e pacote decisório. Antes do `GO`, reconcilia-se apenas `proximo_numero_interno_projetado`, sem reserva real;
- o fence final suspende/drena a entrada externa: fato aceito antes de `T_GO` pertence ao delta, nada é aceito entre fence e decisão e, a partir de `T_GO`, o fato pertence ao sistema; falha antes do CAS reabre a fonte anterior, enquanto falha depois do CAS mantém fechado até reconciliar `ENT-IMP-04`. O `registro_externo_autoridade` prova CAS, época/hash anterior e os marcos `T_GO/T_RET/T_REENT`; toda mutação, inclusive de ano futuro, é negada em `[T_RET,T_REENT)` e volta apenas após `T_REENT`;
- o primeiro recibo legítimo de cada empresa+ano inicial é reconciliado positivamente — manifesto, autoridade, ramo e número esperado — antes de liberar a próxima emissão daquela chave; resposta incerta usa `RBK-025/RBK-018`, sem recibo de teste;
- relatórios por empresa reconciliam snapshot, delta, condições, lançamentos, K06, K07, maior número externo reservado/comprometido, semente e `proximo_numero_interno_projetado` antes do aceite nominal.

Essas provas pertencem a `BK-371/372`, reforçam GAT-07/GAT-10 e reutilizam `TST-API-010`, `QAT-REC-007` e `QAT-DOC-003` sem criar nova âncora funcional.

## 11.6 Vetores dourados do acerto complementar de RA

Além do caso-raiz `TST-D12-20`, a implementação executa os vetores abaixo. Todos usam decimal exato, D30, data de saída inclusiva e arredondamento monetário normal somente na fronteira aprovada.

| Vetor | Entradas determinantes | Oráculo obrigatório |
|---|---|---|
| `ACR-01` | RA de R$ 900,00 até dia 14; RA de R$ 1.200,00 vigente no dia 20 da saída | usa R$ 1.200,00, sem média de versões |
| `ACR-02` | primeira competência; início dia 5; saída dia 10; RA vigente R$ 3.000,00 | D30 = 6; RA proporcional = R$ 600,00 |
| `ACR-03` | competência posterior; saída dia 10; RA vigente R$ 3.000,00 | início do direito no dia 1; D30 = 10; RA proporcional = R$ 1.000,00 |
| `ACR-04` | `ACR-03`; RA efetivamente paga no adiantamento = R$ 400,00 | saldo de RA = R$ 600,00; excedente = R$ 0,00 |
| `ACR-05` | `ACR-03`; RA efetivamente paga no adiantamento = R$ 1.200,00 | saldo de RA = R$ 0,00; excedente absorvido = R$ 200,00; nunca há cobrança de volta |
| `ACR-06` | `ACR-03`; oficial, complemento, reembolso e PSR já pagos; nenhuma RA paga | saldo de RA continua R$ 1.000,00; nenhuma verba diversa deduz RA |
| `ACR-07` | RA R$ 3.000,00; aviso indenizado de 12 dias | linha de aviso = R$ 1.200,00 |
| `ACR-08` | RA R$ 3.000,00; aviso trabalhado | linha adicional de aviso = R$ 0,00 |
| `ACR-09` | RA R$ 3.000,00; 6 avos de 13º | décimo terceiro sobre RA = R$ 1.500,00 |
| `ACR-10` | RA R$ 3.000,00; 6 avos de férias proporcionais | férias = R$ 1.500,00; terço = R$ 500,00 |
| `ACR-11` | RA R$ 3.000,00; férias vencidas confirmadas | férias vencidas = R$ 3.000,00; terço = R$ 1.000,00; sem dobra |
| `ACR-12` | saldo R$ 600,00; aviso R$ 1.200,00; 13º R$ 1.500,00; férias proporcionais R$ 1.500,00 + R$ 500,00; vencidas R$ 3.000,00 + R$ 1.000,00 | total do acerto = R$ 9.300,00; memória contém cada linha sem compensação cruzada |
| `ACR-13` | acerto criado na competência final | nenhuma RA mensal integral paralela; somente o saldo proporcional do acerto |
| `ACR-14` | salário-base, complemento, reembolso ou PSR alterados, mantendo as entradas de RA | resultado do acerto não muda; não há imposto ou desconto |

Os vetores também provam avos inteiros de 0 a 12, dias indenizados positivos somente para aviso indenizado, cálculo manual autorizado com fórmula/original/diferença/justificativa preservados e recibo próprio apenas quando o acerto positivo for efetivamente pago.

---

# 12. Estados, concorrência e repetição

## 12.1 Máquinas de estado

Para cada transição:

- estado inicial aceito produz o destino aprovado;
- outro estado retorna erro estável sem efeito;
- transição não declarada é impossível;
- ação concorrente não cria destino híbrido;
- projeção derivada não é persistida como autoridade;
- mudança temporal usa relógio do servidor;
- auditoria identifica a transição efetivada.

## 12.2 Concorrência real

Testes de concorrência usam duas conexões ou duas sessões simultâneas e barreira controlada. Não basta executar sequencialmente com versão antiga.

Casos mínimos:

- duas atualizações com o mesmo ETag;
- fechamento versus alteração de participante;
- pagamento versus recálculo;
- duas confirmações do mesmo grupo;
- duas reservas do próximo número;
- prévia consumida simultaneamente;
- alteração de perfil versus comando aberto;
- troca de contexto em outra aba;
- dois workers reivindicando a mesma tarefa.

## 12.3 Resposta incerta

O teste força perda de conexão depois do commit e antes da resposta. A segunda tentativa:

- não presume falha;
- consulta/reutiliza a mesma chave;
- devolve nova resposta autorizada sobre o resultado existente;
- não copia resposta sensível antiga do registro técnico;
- não cria segundo efeito.

---

# 13. Multiempresa e RLS

## 13.1 Matriz A × B × inexistente

Toda rota, tarefa, arquivo, total, filtro, busca, ordenação, paginação e duplicidade empresarial é exercitada com:

1. ator autorizado na empresa A e objeto A;
2. o mesmo ator e um ID real da empresa B;
3. o mesmo ator e ID inexistente;
4. contexto ausente;
5. versão de contexto antiga;
6. empresa inativa/histórica quando aplicável.

O comportamento de B e inexistente deve ser neutro e não revelar nome, estado, empresa, contagem ou tempo distinguível de forma material.

A prova temporal usa a mesma rota, sessão, infraestrutura e formato de identificador, com ordem aleatória intercalada entre ID real de B e ID inexistente. Depois de cinco minutos de aquecimento, são executadas duas rodadas independentes com no mínimo 200 observações válidas por classe em cada rodada. Status, código, corpo e cabeçalhos observáveis precisam ser idênticos. Para aprovação, o intervalo de confiança bootstrap de 95% da diferença das medianas deve ficar inteiro dentro de `±máximo(10 ms; 10% da mediana de referência)` e a diferença absoluta entre p95 deve ser no máximo `máximo(20 ms; 10% do p95 de referência)` nas duas rodadas. Timeout, erro ou amostra descartada sem justificativa reprova; massa, semente, limites e ferramenta ficam congelados por hash antes da execução.

## 13.2 Banco e pool

É obrigatório provar:

- RLS nega sem contexto;
- contexto existe somente na transação;
- conexão devolvida ao pool não carrega empresa anterior;
- FK composta impede relação cruzada;
- worker sem empresa ou com empresa divergente falha fechado;
- operação global não consulta dados empresariais combinados;
- clínica global não revela quais empresas a utilizaram.

## 13.3 Contexto em abas

Uma aba seleciona A, outra troca para B e a primeira tenta ler e gravar. A primeira:

- recebe `CONTEXTO_DESATUALIZADO`;
- não consulta A nem B;
- não grava;
- limpa o conteúdo;
- orienta reabrir no contexto atual.

---

# 14. Identidade, sessão e TOTP

Casos obrigatórios:

- senha com mínimo de dez caracteres, máximo aceito de ao menos 128, Unicode e espaços sem corte silencioso;
- ausência de regra artificial de composição e recusa de senha conhecida como comprometida sem registrá-la;
- Argon2id com salt individual, parâmetros persistidos, calibração e atualização segura do hash;
- credencial temporária válida por 24 horas e de uso único;
- recuperação válida por 30 minutos e resposta neutra para conta existente/inexistente;
- token temporário com ao menos 256 bits, somente hash persistido, emissão nova invalidando a anterior e troca da URL por sessão restrita/URL limpa;
- bloqueio por 15 minutos após cinco tentativas;
- TOTP obrigatório somente para master na V1;
- TOTP compatível com RFC 6238/aplicativo autenticador, seis dígitos, passo de 30 segundos e tolerância máxima inicial de um intervalo anterior ou posterior;
- intervalo TOTP consumido atomicamente e código repetido, inclusive concorrente, rejeitado;
- código de recuperação de uso único;
- bootstrap singleton cria exatamente dois masters em `PENDENTE_PRIMEIRO_ACESSO`, sem aptidão nem sessão operacional;
- o primeiro titular que conclui senha/TOTP fica em `PRONTO_AGUARDANDO_PAR` com `master_apto = false`;
- o segundo titular pronto provoca um único commit que marca ambos `ATIVADO_CONJUNTAMENTE`, o agregado `CONSUMIDO`, revoga sessões parciais e exige novo login;
- invocações/configurações concorrentes, repetição da mesma intenção, replay após consumo e falha injetada antes do commit não criam terceiro membro, ativação parcial, reabertura ou acesso antecipado;
- depois do bootstrap, existem dois masters aptos;
- aviso aos 25 minutos, inatividade aos 30 minutos e limite absoluto de oito horas;
- polling, painel, contador e download não renovam sessão;
- rotação de sessão/CSRF nos eventos aprovados;
- revogação de todas as sessões após redução de acesso ou evento crítico aprovado;
- cookie `__Host-`, `Secure`, `HttpOnly`, sem `Domain` e política `SameSite` aprovada;
- CSRF, origem e tipo de conteúdo recusados antes do caso de uso;
- token, senha, TOTP, código e segredo ausentes de resposta indevida, log e auditoria.

`QAT-SEC-029` é a prova proprietária de `BK-033` na ETP-01: cobre criação all-or-nothing, exatamente dois membros, estados `PENDENTE_PRIMEIRO_ACESSO → PRONTO_AGUARDANDO_PAR → ATIVADO_CONJUNTAMENTE/CONSUMIDO`, concorrência, resposta incerta, falha parcial e ausência de sessão operacional antes do commit conjunto. `QAT-SEC-026` reforça que, depois do consumo, o comando não reabre nem pode ser repetido como execução e que nenhum caminho de infraestrutura, conta de emergência ou administrador cria backdoor se os dois masters ficarem sem TOTP e sem código utilizável. Esse último estado exige nova decisão funcional.

---

# 15. Autorização por ação, objeto, estado e campo

## 15.1 Perfis

Cada ação é testada com:

- perfil autorizado;
- perfil sem ação;
- objeto não alcançável;
- estado incompatível;
- empresa errada;
- sessão revogada;
- master sem função operacional correspondente;
- master sem ACL de incidente.

## 15.2 Quatro estados de campo

| Estado | Provas |
|---|---|
| Oculto | ausente em JSON, DOM, erro, filtro, total, histórico, notificação, Excel e log |
| Mascarado | somente máscara do servidor; valor integral não fica oculto no cliente nem volta em escrita |
| Visível sem edição | leitura autorizada; escrita inteira rejeitada |
| Visível e editável | leitura e escrita somente com ação, objeto e estado também válidos |

Entrada com campo desconhecido ou não editável rejeita toda a requisição. O servidor não remove silenciosamente o campo antes de salvar.

## 15.3 Revogação durante operação

O teste pausa a operação depois da primeira autorização, reduz o acesso em outra sessão e libera o commit. A operação deve revalidar e concluir sem alteração.

---

# 16. Auditoria, histórico e observabilidade

## 16.1 Auditoria funcional

Toda mudança aplicável prova:

- ator e sessão;
- escopo e empresa;
- ação e entidade;
- versão anterior e final;
- transição;
- correlação;
- idempotência;
- antes/depois apenas dos campos autorizados;
- justificativa quando exigida;
- gravação na mesma transação.

Falha da auditoria em operação crítica reverte a mutação.

## 16.2 Histórico do colaborador

A mesma fonte de eventos deverá produzir:

- histórico contextual dentro do colaborador;
- visão de mudanças de nome, endereço e condições financeiras conforme permissão;
- visão geral de auditoria separada para outras ações;
- redação atual de campos segundo a permissão do observador;
- paginação e período sem expor dados de outra empresa.

## 16.3 Logs, métricas e rastros

O teste automatizado procura e reprova ocorrência indevida de:

- CPF/CNPJ integral;
- e-mail;
- salário ou valor financeiro;
- resultado de ASO;
- corpo de requisição/resposta;
- senha, token, TOTP ou código;
- conteúdo de arquivo;
- SQL com valores;
- stack trace exposta ao usuário.

Logs podem conter método, contrato, status, latência, correlação, código de erro, tamanho e escopo classificado.

---

# 17. Recibos, PDFs, Excel e arquivos

## 17.1 Recibo lógico e PDF

Provas mínimas:

- pagamento, auditoria, snapshot e número na mesma transação quando o tipo exige recibo;
- prévia sem número e com marca d'água de prévia;
- logo da empresa no cabeçalho quando cadastrado;
- número crescente no formato anual e único **por empresa**, nunca reutilizado;
- semente anual aceita somente depois dos deltas finais e antes da primeira reserva interna, com operador nominal, ação específica, reautenticação, origem, versão, auditoria e manifesto+empresa+ano/janela/autorização efêmera exatos;
- primeira emissão da carga, somente após `ProductionGo` write-once do manifesto exato e com o sistema como fonte autoritativa, usa exatamente o número seguinte; semente regressiva, concorrente incompatível ou colidente, manifesto apenas reconciliado sem `GO`, `NO-GO`, ano fora do manifesto, janela fechada ou autorização revogada confirmam zero alteração;
- fechamento/`GO/NO-GO` revoga capacidades restantes; repetição idempotente exata apenas consulta o resultado anterior, e delta de numeração posterior ao commit exige nova carga limpa;
- semente versus primeira emissão e duas emissões concorrentes preservam um único avanço da raiz empresa+ano;
- razão social, CNPJ e logo da empresa conforme o snapshot de emissão;
- empregado identificado por nome e CPF, ou MEI por razão social/nome fantasia e CNPJ;
- competência, evento, tipo, itens, total numérico e por extenso, data efetiva e data de emissão;
- versão, relação de cancelamento/substituição e assinatura manual do participante — colaborador ou prestador MEI;
- nenhum campo de assinatura da empresa;
- adiantamento e final separados;
- recibo de RA/reembolso separado de complemento;
- PSR em recibo próprio;
- MEI com recibos de adiantamento e final;
- ajuste positivo e acerto complementar de RA com recibos próprios quando positivos e pagos;
- salário/adiantamento oficial, líquido K06, rescisão oficial do contador, diferença absorvida e evento de valor zero nunca geram recibo interno;
- original preservado em cancelamento/substituição;
- número nunca reutilizado;
- regeneração pelo mesmo snapshot produz conteúdo lógico idêntico;
- falha do PDF não desfaz pagamento;
- renderizador sem saída de rede e com limites.

## 17.2 Excel

Cada exportação de colaboradores, ASO ou competência/pagamento prova:

- filtros e colunas congelados no pedido;
- autorização no pedido, worker e download;
- campo oculto ausente;
- máscara preservada;
- fórmula de planilha neutralizada;
- uma única empresa;
- arquivo privado;
- expiração em 24 horas;
- retirada da permissão bloqueia entrega.

## 17.3 Download

Antes do primeiro byte:

- sessão, contexto, autorização, pertencimento, estado e prazo são revalidados;
- MIME, tamanho e hash conferem;
- hash divergente bloqueia entrega e gera alerta;
- `Content-Disposition` é seguro;
- `nosniff` e `no-store, private` estão presentes;
- nenhuma URL pública ou permanente é devolvida.

---

# 18. ASO, clínica e notificações

## 18.1 ASO

Casos incluem:

- admissional associado ao início/admissão conforme regra aprovada;
- periódico;
- mudança de risco ocupacional;
- retorno ao trabalho;
- demissional ligado ao desligamento;
- vencimento sugerido em 12 meses e data editável;
- apto, apto com restrição e inapto sem descrição clínica;
- exame retificado preservando histórico;
- pendência demissional;
- agendamento operacional sem data/local na V1;
- não comparecimento sem desaparecimento por decurso do tempo;
- resultado cifrado, oculto por padrão e revelado apenas com auditoria;
- alerta de 30 dias, central interna e painel;
- nenhum PDF, imagem, CID, diagnóstico, médico, CRM ou texto de restrição.

As quatro regras `ASO-R01` a `ASO-R04` são projeções de resultado e exigem teste de autorização sem criar transição artificial.

## 18.2 Clínica global

Prova:

- CNPJ e cadastro global sem duplicidade indevida;
- criação, edição, inativação e reativação autorizadas;
- clínica inativa preserva histórico;
- busca global não revela empresas usuárias;
- uso em ASO continua empresarial.

## 18.3 Notificação

Prova:

- ocorrência nasce idempotentemente da origem;
- sino e tela própria apresentam apenas dados mínimos;
- abrir origem reautoriza;
- perda de acesso não deixa a notificação ampliar acesso;
- resolução vem da origem;
- item resolvido permanece visível pelo prazo aprovado;
- polling não renova sessão;
- “marcar visíveis como lidas” revalida até 100 IDs e, se qualquer ID perder elegibilidade, altera zero leituras.

MF-01 — agendamento real e lembrete ao colaborador por e-mail, WhatsApp ou SMS — permanece fora da V1 e não recebe caso de aceite de produção.

---

# 19. Incidente restrito

Casos obrigatórios:

- autorização nominal independente de master;
- master sem ACL recebe negação neutra;
- criação, acompanhamento, classificação, contenção, conclusão e reabertura conforme estados aprovados;
- reabertura com reautenticação;
- linha do tempo append-only;
- nenhum dado operacional desnecessário;
- acesso e mudança auditados;
- registro simples comporta responsáveis nominais quando definidos;
- simulação de vazamento entre empresas e acionamento do procedimento;
- evidência preservada com acesso restrito.

Os nomes dos responsáveis e substitutos continuam decisão necessária antes da produção, não antes da execução das primeiras etapas sintéticas.

O exercício operacional proprietário é `QAT-SEC-041` e cobre detecção, contenção, acesso nominal, linha do tempo, evidência sanitizada, avaliação de alcance, restauração e reabertura. O sistema registra fatos; não decide nem envia comunicação externa automaticamente.

---

# 20. Segurança

## 20.1 Baseline

A matriz de segurança usa a versão estável **OWASP ASVS 5.0.0** como baseline. O manifesto oficial em inglês, identificado por versão e SHA-256, é importado sem renumerar os controles. Todos os controles de Nível 1 aplicáveis e os controles de Nível 2 selecionados pelo risco do sistema entram no manifesto executável exigido pelo Documento 22C. Não será declarada conformidade integral com nível que exija MFA para todos enquanto usuários comuns permanecerem sem MFA obrigatório.

Cada controle recebe situação aplicável/não aplicável, justificativa, caso, evidência, responsável e resultado. Um `N/A` exige justificativa e aprovação de Segurança; controle aplicável sem caso bloqueia o gate. A seleção nominal dos controles de Nível 2 é congelada no manifesto antes de começar código de produção. As ameaças `AME-01` a `AME-27` do Documento 19 também recebem ao menos uma prova individual no Documento 22C.

Gerar e aprovar esse manifesto é condição de entrada e primeira atividade da ETP-00, antes do primeiro commit de código de produção, e não apenas uma prova de saída da etapa.

A aprovação acima decide **aplicabilidade**: congela fonte, perfil, controles
selecionados, exclusões justificadas e responsável pela decisão. Ela não declara
que um controle passou. Para evitar que um mesmo estado represente três coisas
diferentes, os gates ASVS ficam separados e falham fechados:

1. `APLICABILIDADE`: aprovação nominal do manifesto imutável, já concluída;
2. `RESULTADOS_ETP_00`: contribuição parcial das dez provas executáveis
   delimitadas pela correção controlada `COR-ASVS-ETP00-001`; o inventário
   original preserva 13 casos integrais, dos quais quatro permanecem diferidos
   integralmente e `QAT-SEC-037` conserva somente a contribuição limitada desta
   etapa; cada prova exige execução e artefato verificável, sem converter
   automaticamente controles em `PASSOU`; a correção permanece pendente de
   aprovação nominal de Segurança;
3. `FECHAMENTO_INTEGRAL`: somente na ETP-11/GAT-10, quando os 211 controles
   selecionados possuírem resultado executado e evidência verificável, sem
   `ADIADO`.

O manifesto de aplicabilidade aprovado permanece imutável. Seus campos de
resultado `BLOQUEADO` retratam o instante da seleção e não viram um placar vivo.
Resultados posteriores pertencem ao índice de evidências e ao manifesto de
gates por etapa, ambos vinculados ao SHA-256 do objeto aprovado. Mudar perfil,
seleção, justificativa ou controle invalida o vínculo e exige nova aprovação de
aplicabilidade; mudar resultado de execução não reescreve a aprovação original.

## 20.2 Cenários adversariais mínimos

- IDOR/BOLA entre empresas, escopos e incidentes;
- SQL injection;
- XSS refletido, persistido e em exportação;
- CSRF e origem externa;
- mass assignment e propriedade extra;
- SSRF e tentativa de recurso remoto no renderizador;
- upload de logo malformado, grande, poliglota ou ativo;
- enumeração de conta, CPF, CNPJ, empresa e objeto;
- bypass por mudança de método, rota, parâmetro, cabeçalho ou campo;
- sessão fixada, expirada, revogada ou reproduzida;
- TOTP/código repetido;
- prévia e reautenticação transferidas, expiradas, concorrentes ou divergentes;
- cache de resposta sensível;
- arquivo de outra empresa, expirado ou com hash divergente;
- segredo e dado proibido em log;
- dependência vulnerável, segredo no repositório e imagem insegura.

## 20.3 Pipeline de segurança

O pipeline inclui:

1. detecção de segredo;
2. SAST;
3. análise de dependência e licença;
4. SBOM;
5. varredura de imagem;
6. validação de configuração;
7. DAST autenticado em homologação;
8. teste independente antes da produção.

Vulnerabilidade crítica ou alta aberta bloqueia a produção. Risco residual somente de severidade inferior exige proprietário, prazo e controle compensatório. Essa regra mais restritiva do Documento 21 prevalece sobre redação anterior menos restritiva.

## 20.4 Criptografia e dados protegidos

Casos obrigatórios:

- CPF recuperável autorizado e resultado de ASO usam cifra autenticada por envelope;
- cada gravação usa nonce único, versão de chave e AAD com finalidade, entidade, campo, empresa, registro e versão aplicáveis;
- ciphertext ou metadado alterado falha na autenticação;
- copiar ciphertext para outra empresa, entidade, campo, registro ou versão não permite decifragem;
- índice de igualdade/unicidade usa HMAC com chave diferente da cifra e escopo correto;
- chaves de CPF, ASO, auditoria, TOTP, índice e arquivo permanecem separadas;
- gravações novas usam a chave vigente e versões antigas continuam legíveis enquanto houver dado vivo;
- KMS indisponível falha fechado e não grava dado em claro;
- segredo, chave e material protegido não entram em fixture, log, erro, evidência geral ou artefato de build;
- backup sem as chaves históricas necessárias é reprovado.

## 20.5 Modelo de ameaças

Cada ameaça `AME-01` a `AME-27` do Documento 19 possui ao menos um `QAT-SEC-*`, evidência e resultado. A matriz inclui força bruta, enumeração, sessão, TOTP, master, IDOR, pool, campo, aba obsoleta, CSRF, XSS, SQL injection, fórmula em Excel, arquivo, tarefa, lote, auditoria, log, backup, ransomware, dependência, exportação, KMS, esgotamento, relógio, indisponibilidade dos masters e SSRF.

## 20.6 Contas e configuração da plataforma

Antes da produção, testes comprovam MFA e menor privilégio para todas as contas administrativas da hospedagem, repositório, CI/CD, banco, observabilidade, e-mail e KMS. Contas de serviço não usam login humano, segredo compartilhado ou permissão administrativa ampla.

O artefato falha no startup diante de configuração insegura obrigatória ausente ou inválida. Homologação externa comprova TLS vigente, redirecionamento seguro, HSTS, CSP e demais cabeçalhos definidos na arquitetura; nenhum ambiente com dados reais aceita transporte aberto, cookie inseguro, depuração pública ou credencial padrão.

---

# 21. Desempenho e capacidade

## 21.1 Metas

| Fluxo | Meta |
|---|---|
| Login, seletor, lista e filtro comum | p95 de até 2 segundos |
| Painel da empresa | p95 de até 3 segundos |
| Cálculo de competência com 100 participantes | p95 de até 5 segundos |
| Recibo individual | p95 de até 5 segundos quando concluído imediatamente; no caminho assíncrono, aceite/progresso em até 2 segundos, arquivo disponível em p95 de 30 segundos e máximo de 60 segundos |
| Excel operacional | p95 de até 30 segundos |
| Lote longo de 100 itens | aceite/progresso em até 2 segundos, p95 de conclusão em até 60 segundos e máximo de 120 segundos; segundo plano, retomada e sessão não bloqueada |
| Concorrência | dez usuários simultâneos com isolamento e metas preservados |

## 21.2 Fronteira da medição

| Tipo | Início | Fim |
|---|---|---|
| Jornada interativa | ação humana automatizada no navegador | conteúdo útil estável e controles prontos |
| API síncrona | envio do primeiro byte | recebimento e validação do último byte |
| Cálculo | comando aceito pelo servidor | resultado persistido e resposta utilizável |
| Recibo assíncrono | commit que cria recibo lógico/outbox | arquivo íntegro no estado disponível; o tempo total é informado, sem transformar espera longa em requisição bloqueada |
| Excel | pedido aceito | arquivo íntegro disponível |
| Lote | pedido aceito | todos os itens concluídos ou falha final reconciliável |

Tempo de fila é registrado separadamente e também incluído no tempo total percebido.

## 21.3 Método

O relatório registra:

- hash do artefato;
- esquema e fixture;
- infraestrutura, réplicas, CPU, memória, banco e pool;
- volume por tabela relevante;
- concorrência;
- aquecimento;
- cache frio e quente quando houver diferença;
- duração e quantidade de amostras;
- p50, p95, p99, máximo e taxa de erro;
- tempo de fila;
- consumo de CPU, memória, conexão e I/O;
- consulta lenta e plano quando a meta falhar.

Para fluxos curtos, a execução representativa terá aquecimento mínimo de cinco minutos e ao menos 200 amostras válidas. Para cálculo, recibo e Excel, terá ao menos 30 execuções completas após preparo controlado. Integridade ou vazamento igual a um já reprova, independentemente da média.

A amostra de homologação aceita **zero erro funcional inesperado**, zero perda, zero duplicação, zero vazamento e zero quebra de isolamento. Falhas injetadas e respostas negativas esperadas são contabilizadas separadamente e só aprovam quando produzem exatamente o oráculo seguro. Um timeout ou erro de infraestrutura não é removido silenciosamente da amostra.

## 21.4 Massa representativa

- três empresas sintéticas: A com 100 ativos e 250 inativos, B com 10 ativos e 100 inativos, C com 5 ativos e 50 inativos;
- na empresa A, 100 participantes ativos na mesma competência, sendo 80 empregados e 20 MEIs; no conjunto, 115 ativos e 400 vínculos/contratos inativos;
- 72 competências, 7.200 participações mensais, 50.000 grupos/eventos financeiros, 10.000 recibos e 250.000 eventos de auditoria;
- competência de carga da empresa A com seus 100 participantes ativos, sem combinar empresas;
- arquivos, ASOs, notificações e históricos distribuídos pelos seis anos;
- dez sessões simultâneas;
- RLS, autorização, auditoria e telemetria ligadas.

Se uma meta falhar, a ordem de investigação e otimização do Documento 21, seção 34.4, é obrigatória.

## 21.5 Perfil misto de dez usuários

`QAT-PERF-007` usa dez sessões concorrentes com esta distribuição congelada antes da execução:

| Sessões | Jornada |
|---:|---|
| 2 | login, seleção de empresa e painel |
| 2 | lista, filtro e detalhe de colaborador |
| 2 | lista e detalhe de competência/pagamento |
| 1 | ASO e central de notificações |
| 1 | auditoria autorizada |
| 1 | consulta e download autorizado de recibo |
| 1 | pedido, acompanhamento e download de Excel |

O ensaio sobe uma sessão a cada cinco segundos, aquece por cinco minutos e mantém carga estável por pelo menos quinze minutos. O tempo de reflexão varia deterministicamente entre dois e cinco segundos por semente registrada. Artefato, fixture, roteiro, distribuição e semente são congelados por hash antes da execução. A amostra admite zero erro funcional inesperado, vazamento, perda, duplicação ou quebra de isolamento.

---

# 22. Resiliência e injeção de falhas

| Falha injetada | Oráculo seguro |
|---|---|
| Banco indisponível | nenhuma gravação local; erro controlado |
| Uma réplica web indisponível | sai do tráfego; outra atende se a topologia contratada possuir duas |
| Worker indisponível | negócio síncrono preservado; tarefa aguarda |
| Worker interrompido | retoma sem duplicação |
| Objetos indisponíveis após pagamento | pagamento permanece; arquivo fica pendente/falha controlada |
| E-mail indisponível | token não ganha prazo; envio retoma idempotentemente |
| CEP indisponível | preenchimento manual continua possível |
| Observabilidade indisponível | auditoria transacional continua; regra crítica falha se sua auditoria própria falhar |
| KMS indisponível | operação sensível falha fechada e não grava dado aberto |
| Outbox atrasada | negócio confirmado permanece e atraso é alertado |
| Hash divergente | download bloqueado e alerta gerado |
| Resposta perdida após commit | reconciliação encontra um único efeito |
| Candidato de lote alterado | zero itens confirmados |

Cada ensaio verifica logs sanitizados, métricas, alerta, recuperação e ausência de efeito duplicado.

## 22.1 Repetição, circuit breaker e reconciliação

Para cada dependência externa ou assíncrona aplicável:

- repetição automática ocorre somente em falha transitória classificada e possui limite, atraso exponencial e jitter;
- operação sem chave idempotente ou sem reconciliação segura não é repetida automaticamente;
- erro permanente, validação, autorização e conflito funcional não entram no retry;
- circuit breaker abre após o limiar aprovado, falha rápido, aguarda intervalo controlado e permite amostra limitada em `half-open`;
- sucesso em `half-open` fecha o circuito; nova falha o reabre sem tempestade;
- métricas distinguem tentativa, operação lógica, exaustão, circuito aberto e recuperação;
- nenhuma repetição renova token, prazo ou número de documento indevidamente.

As rotinas de reconciliação provam, no mínimo: outbox órfã ou atrasada; arquivo lógico sem objeto ou objeto sem registro; lacuna ou avanço de numeração; pagamento sem arquivo; sequência temporal pendente; projeção/alerta de ASO atrasado; checkpoint de auditoria; backup fora do RPO; exportação temporária expirada; e resposta perdida após commit. Toda correção é idempotente, auditável e nunca inventa um pagamento.

## 22.2 Observabilidade e alertas

As provas verificam:

- correlação do navegador/API até domínio, banco, outbox e worker;
- vida e prontidão sem detalhe interno;
- monitor externo sem conta real nem dado empresarial;
- canal operacional independente do sino funcional;
- tarefa mais antiga com cinco minutos como advertência e dez minutos como alerta alto, com duração mínima e deduplicação;
- alerta de backup antes da violação do RPO;
- alerta real de teste chegando ao responsável e substituto quando forem nomeados;
- falha da telemetria sem desativar auditoria ou liberar operação insegura.

---

# 23. Backup e restauração

O Documento 23 fecha o runbook; o aceite técnico obedece a:

| Objetivo | Critério |
|---|---|
| RPO | perda máxima comprovada de uma hora para banco, objetos e metadados no mesmo corte lógico |
| RTO | restauração integral em até oito horas úteis |
| Escopo | sistema inteiro, não um CNPJ isolado |
| Frequência | exercício sintético inicial antes da produção e, depois, restauração trimestral de backup real em laboratório protegido |

## 23.1 Exercício

1. declarar o exercício e congelar mudanças;
2. escolher corte lógico;
3. criar ambiente isolado, sem rota pública e com efeitos externos bloqueados;
4. restaurar banco, objetos e chaves compatíveis;
5. implantar o mesmo artefato;
6. validar migrações, hashes, empresas, permissões, pagamentos, recibos e auditoria;
7. invalidar todas as sessões, tokens temporários, autorizações curtas, segredos TOTP substituídos e séries de códigos de recuperação;
8. reconciliar credenciais e revogações posteriores ao corte, sem reativar segredo antigo;
9. reconciliar maior numeração conhecida e reservar lacunas;
10. medir RPO e margem projetada de RTO;
11. se não houver corte comum confiável em até uma hora, rejeitar todo corte suspeito, registrar a violação e reconstruir no alvo o intervalo perdido somente por evidências confiáveis, com cada fato identificado e idempotente;
12. reconciliar integralmente a reconstrução — contagens, valores, numeração, documentos, auditoria, outbox e credenciais — e registrar qualquer perda residual; incidente, DP, Contábil e Jurídico aprovam nominalmente esse resultado antes da abertura simulada/real;
13. executar smoke e jornadas críticas somente depois dessa aprovação quando a exceção existir;
14. registrar falhas, responsáveis e novo ensaio;
15. eliminar o ambiente temporário de forma comprovada.

O laboratório trimestral usa segurança equivalente à produção, dados minimizados quando possível, acesso nominal, trilha própria e efeitos externos bloqueados. Ao menos um ensaio controlado injeta a ausência de corte comum confiável dentro de 60 minutos e só é aprovado se executar reconstrução, reconciliação e decisão nominal completas; apenas registrar ou inventariar o intervalo não basta. O exercício sintético pré-produção não substitui a restauração periódica de uma cópia real depois da entrada em operação.

Restauração nunca reativa sessão encerrada, token consumido, senha anterior, TOTP substituído, código usado ou temporário já vencido.

## 23.2 Fontes que precisam ser comprovadas

- PITR do banco com janela inicial de 35 dias;
- base backup ou snapshot diário restaurável;
- cópia cifrada em domínio administrativo separado e protegida contra exclusão pelo operador comum;
- objetos permanentes versionados e copiados com atraso comprovado máximo de 60 minutos;
- checkpoint lógico comum entre banco, objetos, hashes e chaves;
- chaves históricas recuperáveis;
- fila/outbox reconciliada sem duplicação;
- temporários vencidos permanecendo indisponíveis depois da restauração.

---

# 24. Acessibilidade e experiência

As 60 telas/subfluxos manifestados serão exercitados conforme aplicabilidade:

- navegação completa por teclado;
- foco visível, ordem previsível e retorno correto após modal;
- rótulo programático;
- mensagem de erro ligada ao campo e resumo quando necessário;
- contraste adequado;
- estado não dependente apenas de cor;
- tabelas, cabeçalhos e botões semanticamente identificáveis;
- zoom e layout responsivo sem perda da ação principal;
- carregamento e progresso anunciáveis;
- conteúdo removido do DOM após revogação/contexto inválido;
- nenhuma ação disponível apenas por gesto ou hover;
- confirmação clara antes de ação irreversível.

O WCAG 2.2 nível AA será a referência para os critérios aplicáveis. O Documento 22C §11.3 fixa a fonte normativa e o contrato do manifesto por critério, tela, jornada, método, evidência e resultado. Automação detecta violações comuns; revisão por teclado, tecnologia assistiva e inspeção humana continuam obrigatórias nos fluxos críticos. A matriz final de navegadores e tecnologias assistivas será definida antes da ETP-11.

---

# 25. Suítes funcionais

| Suíte | Bloco | Âncoras | Foco |
|---|---|---:|---|
| ST-01 | Autenticação | 28 | senha, bloqueio, recuperação, TOTP, sessão e revogação |
| ST-02 | Empresa e contexto | 22 | cadastro, seleção, troca, histórico e contexto único |
| ST-03 | Usuários e permissões | 40 | usuário, master, perfil, campo, prévia e revogação |
| ST-04 | Pessoa e vínculo | 12 | empregado, datas, recontratação e inativação |
| ST-05 | MEI e contrato | 21 | cadastro, contrato, renovação, interrupção e proporcionalidade |
| ST-06 | Condições financeiras | 39 | salário-base, RA, complemento, PSR e reembolso |
| ST-07 | Competência | 15 | participantes, checklist, cálculo, fechamento e reabertura |
| ST-08 | Grupo financeiro | 18 | eventos, conferência, ajuste e estados individuais |
| ST-09 | Confirmação e pagamento | 21 | individual, lote, datas, repetição e reconciliação |
| ST-10 | Correções | 29 | F04, ajuste positivo e diferença absorvida |
| ST-11 | Recibos e arquivos | 27 | recibo lógico, PDF, lote, substituição e download |
| ST-12 | Desligamento | 34 | saída, rescisão oficial separada, acerto de RA e saldo |
| ST-13 | ASO | 48 | acompanhamento, exame, prazo, resultado e pendência |
| ST-14 | Clínica | 7 | catálogo global sem revelar usos |
| ST-15 | Notificação | 17 | ocorrência, leitura, origem e resolução |
| ST-16 | Exportação | 14 | snapshot, worker, campo, arquivo e expiração |
| ST-17 | Incidente | 10 | ACL independente, linha do tempo e reabertura |
| ST-18 | UI e concorrência | 38 | estados locais e políticas transversais |
| **Total** |  | **440** | cobertura exaustiva no Documento 22A |

---

# 26. Pacotes transversais reutilizáveis

| Pacote | Conteúdo |
|---|---|
| `PAC-MUT-01` | sucesso, estado inválido, validação e ausência de sucesso parcial |
| `PAC-AUT-01` | ação, objeto, estado, perfil e prévia |
| `PAC-EMP-01` | empresa A × B, inexistente, contexto e pool |
| `PAC-CAM-01` | quatro estados de campo e anti-mass-assignment |
| `PAC-SES-01` | sessão expirada/revogada, reautenticação e limpeza |
| `PAC-CON-01` | versão, chave natural, corrida e rollback |
| `PAC-IDEM-01` | mesma chave/intenção, chave divergente e nova intenção |
| `PAC-REC-01` | perda de resposta e reconciliação autoritativa |
| `PAC-AUD-01` | evento atômico, sanitização e rollback |
| `PAC-JOB-01` | lease, repetição, interrupção, retomada e efeito único |
| `PAC-TEM-01` | relógio, datas-limite e repetição temporal |
| `PAC-SEN-01` | omissão, revelação, cifra, auditoria e não inferência |
| `PAC-XLS-01` | tipos, neutralização, campos, expiração e hash |
| `PAC-APP-01` | linha append-only e correção por nova entrada |
| `PAC-UI-01` | carregamento, vazio, validação, falha, conflito e revogação |
| `PAC-ACE-01` | teclado, foco, rótulo, contraste e mensagens |

Os pacotes geram as variações da seção 5 e não agrupam artificialmente as 440 decisões.

---

# 27. Casos transversais adicionais

Auditoria, arquitetura e requisitos não funcionais não inventam IDs dentro da baseline funcional. O Documento 22C enumera **119 casos técnicos individuais**:

| Família | Conteúdo |
|---|---|
| `TST-API-001–022` | cenários técnicos mínimos já reservados com esses identificadores no Documento 20, seção 30 |
| `QAT-AUD-001–008` | infraestrutura append-only, antes/depois, acesso sensível e rollback |
| `QAT-SEC-001–041` | ASVS, ameaças, DAST, revisão independente e exercício operacional de incidente |
| `QAT-PERF-001–007` | metas, lote longo e concorrência |
| `QAT-RES-001–016` | falhas, retry/circuit breaker e reconciliações da seção 22 |
| `QAT-REC-001–008` | restauração e reconciliação |
| `QAT-A11Y-001–008` | automação e revisão parametrizada das 60 telas/subfluxos |
| `QAT-DOC-001–009` | igualdade, ausência de órfãos e integridade do repositório de evidências |

`TST-API-001–022` preserva exatamente os identificadores técnicos do Documento 20. Os demais casos técnicos usam `QAT-*`. Nenhuma dessas famílias integra ou altera a contagem das 440 âncoras funcionais `TST-<ID funcional>`.

---

# 28. Estratégia por etapa

Quando uma suíte `ST-*` aparece na tabela, significa **somente o subconjunto de linhas do Documento 22A cuja coluna ETP corresponde à etapa**, e não a suíte inteira antecipada. A contagem elimina essa ambiguidade.

| Etapa | Linhas primárias do 22A | Pacote mínimo de saída |
|---|---:|---|
| ETP-00 | 37 | subconjunto ST-18; validador documental, `BK-077` global mínimo/versionado, banco real, RLS A×B, auditoria, idempotência, worker, arquivos, telemetria, CI, 28 UI e nove políticas CON |
| ETP-01 | 27 | subconjunto ST-01, GAT-03, e-mail idempotente, segurança de sessão e `BK-033` comprovado por `QAT-SEC-029` sem alterar as 27 âncoras funcionais |
| ETP-02 | 10 | subconjuntos ST-02/ST-03, GAT-02, troca de aba e negação neutra |
| ETP-03 | 41 | subconjuntos ST-01/ST-02/ST-03, GAT-04, quatro campos, prévia e revogação durante a sessão |
| ETP-04A | 20 | subconjuntos ST-04/ST-06, GAT-05/06, versões e recontratação |
| ETP-04B | 13 | subconjunto ST-05, GAT-05/06, D30 e renovação/retorno |
| ETP-04C | 11 | primeiro subconjunto ST-16, GAT-02/08, arquivo privado e fórmula neutralizada |
| ETP-05 | 42 | subconjuntos ST-04/ST-05/ST-06/ST-07/ST-08/ST-09, GAT-06, 100 participantes em cinco segundos |
| ETP-06 | 27 | subconjuntos ST-02/ST-05/ST-07/ST-08/ST-09/ST-11, GAT-07, falha do PDF e efeito único |
| ETP-07 | 76 | subconjuntos ST-02/ST-04/ST-05/ST-06/ST-07/ST-08/ST-09/ST-10/ST-11/ST-18, GAT-06/07, lote, CON-10 e cadeia preservada |
| ETP-08A | 45 | subconjuntos ST-13/ST-14/ST-15, GAT-08, resultado sensível e alerta temporal |
| ETP-08B | 14 | subconjuntos ST-02/ST-17, GAT-04/09, ACL independente e linha imutável |
| ETP-09 | 55 | subconjuntos ST-02/ST-04/ST-08/ST-09/ST-10/ST-12/ST-13, GAT-06/07/08, saldo RA e pendência demissional |
| ETP-10 | 22 | subconjuntos ST-02/ST-13/ST-14/ST-15/ST-16, GAT-01 a 09 |
| ETP-11 | 0 novos; regressão de 440 | regressão total, 60 telas, segurança independente, desempenho, acessibilidade, falhas, restauração e GAT-10 |

UI e concorrência possuem prova-base na ETP-00 e suíte de conformidade reaplicada a cada tela/operação posterior. Uma etapa executa também a regressão das etapas anteriores.

`BK-077` é item técnico autônomo de suporte sem novo ID funcional: `QAT-DOC-003` prova o subgrafo pelos predecessores imediatos completos — `BK-077 ← BK-014`; `BK-040 ← BK-004/027/041/077`; `BK-063 ← BK-014`; `BK-064 ← BK-063`; `BK-066 ← BK-010/011/063`; `BK-065 ← BK-040/063/064/066/077`; `BK-074 ← BK-040/064/065/077` —, sua conclusão integral na ETP-00 e a ausência de núcleo parcial antecipado. O validador geral prova separadamente todo o DAG dos 253 itens. As âncoras B02 demonstram o consumo de `BK-077` na ETP-02 e as B03 comprovam a administração completa na ETP-03.

`BK-033` também é suporte técnico sem novo ID funcional: `QAT-SEC-029` é obrigatório na saída da ETP-01 e `QAT-SEC-026` permanece na regressão de segurança. Ambos usam `MASS-AUT`; nenhum deles entra na contagem de 440 `TST-*` funcionais.

---

# 29. Pipeline e frequência

## 29.1 Em toda alteração proposta

- formatação e análise estática;
- validação documental afetada;
- unitários e componentes afetados;
- integração afetada com PostgreSQL;
- contratos e autorização afetados;
- detecção de segredo.

## 29.2 Na integração à branch principal

- toda a etapa anterior;
- build dos artefatos;
- migrações limpa e incremental;
- regressão de API;
- E2E principal;
- SAST, dependências, licença, SBOM e imagem;
- relatório de cobertura e mutações críticas selecionadas.

## 29.3 Diariamente ou sob agenda

- regressão E2E ampliada;
- concorrência e repetição;
- worker/tempo;
- DAST leve autenticado;
- varredura de logs proibidos.

## 29.4 Por marco e candidato

- regressão cumulativa completa;
- desempenho representativo;
- injeção de falhas;
- DAST completo;
- acessibilidade;
- homologação por área;
- revisão independente;
- restauração no marco final.

---

# 30. Cobertura e mutação

Métrica de cobertura é um alarme, não o critério principal. A aprovação exige primeiro 100% das âncoras aplicáveis e dos gates.

Baseline técnica:

- regra crítica de D30, dinheiro, autorização, estado, idempotência, numeração e contexto: todas as decisões aprovadas e limites exercitados;
- código novo/alterado de domínio: ao menos 90% de linhas e 85% de ramos;
- conjunto automatizado geral: ao menos 80% de linhas e 75% de ramos;
- mutação nos núcleos D30/dinheiro, guardas financeiras e autorização: sobrevivente relevante igual a zero nos trechos selecionados ou justificativa revisada.

Exclusão de cobertura exige motivo técnico e não pode abranger regra de negócio. A meta poderá ser elevada por evidência; reduzi-la exige controle de mudança.

---

# 31. Teste instável

Um teste é instável quando o mesmo artefato, fixture, semente e ambiente alterna resultado sem mudança explicável.

Regras:

- falha inicial permanece visível;
- repetição diagnóstica registra todas as tentativas e não transforma o pipeline em aprovado;
- relógio, semente, concorrência e dependência são capturados;
- teste crítico financeiro, RLS, autorização, recibo ou restauração não pode ser colocado em quarentena para liberar marco;
- teste não crítico em quarentena recebe defeito, responsável e prazo curto;
- remover ou relaxar asserção para ocultar instabilidade é proibido.

---

# 32. Defeitos

| Severidade | Regra |
|---|---|
| SEV-0 | vazamento, bypass, corrupção, duplicação financeira/documental ou perda irreversível; interrompe etapa e bloqueia qualquer marco |
| SEV-1 | cálculo central errado, fluxo obrigatório indisponível, arquivo sensível indevido ou restauração inviável; bloqueia marco |
| SEV-2 | falha com alternativa segura; corrige ou recebe aceite formal antes do candidato |
| SEV-3 | ajuste sem risco de decisão, integridade ou sigilo; pode ter prazo e responsável |

Todo defeito registra:

- ambiente, artefato, esquema e fixture;
- TST/BK/ID afetados;
- passos e evidência;
- esperado e observado;
- severidade e risco;
- responsável;
- correção e regressão;
- decisão residual, quando permitida.

Nenhum marco é aprovado com SEV-0 ou SEV-1 aberto.

---

# 33. Evidências

## 33.1 Identificação

Evidências recebem `EVD-<ETP>-<execução>-<artefato>` e incluem:

- hash do código/artefato;
- versão de esquema/migração;
- versão/hash da fixture;
- ambiente e configuração não secreta;
- casos executados e resultado;
- duração e instante;
- ferramenta/versão;
- defeitos;
- responsável pela execução.

Cada execução fecha um manifesto com checksum dos relatórios e anexos, vínculo aos casos, ACL nominal, instante, responsável e cadeia de substituição. O manifesto é imutável; correção cria nova versão sem apagar a anterior. A capacidade mínima de armazenamento restrito e verificação de integridade existe antes da primeira evidência da ETP-00; fornecedor e retenção operacional de longo prazo podem ser fechados antes do candidato à produção.

## 33.2 Conteúdo

| Tipo | Evidência preferida |
|---|---|
| unitário/integração/contrato | relatório estruturado e log sanitizado |
| concorrência | linha do tempo das duas sessões e estado final |
| E2E | trace, vídeo/screenshot somente quando útil, DOM e requisições sanitizados |
| segurança | relatório técnico redigido, vetor, impacto e correção |
| desempenho | configuração, amostras, percentis, erros e recursos |
| restauração | corte, tempos, inventário, hashes, reconciliação e aprovação |
| homologação | roteiro, resultado, observações, papel, nome e decisão |

Senha, token, TOTP, código, CPF/CNPJ integral, salário, resultado de ASO e conteúdo de arquivo não entram na evidência geral. Evidência sensível excepcional recebe acesso restrito e retenção compatível.

---

# 34. Homologação

## 34.1 Papéis

| Área/papel | Aceita |
|---|---|
| Engenharia | arquitetura, dados, migração, contratos e integração |
| Segurança | identidade, autorização, RLS, arquivos, telemetria, vulnerabilidades e incidente |
| Departamento Pessoal/operação | cadastro, condições, competência, pagamento, ASO, notificações e carga |
| Contábil | líquido/rescisão do contador, D30, separação das verbas, memória e fechamento |
| Jurídico/privacidade | terminologia, recibos, minimização do ASO, retenção e incidente |
| Produto | fluxo, texto, permissão, usabilidade e integração |
| Operação de infraestrutura | deploy, alerta, backup, restauração e retorno |

Os nomes e substitutos serão definidos antes do marco correspondente e obrigatoriamente antes da produção.

## 34.2 Roteiro

Cada homologação:

1. usa artefato, esquema e fixture identificados;
2. informa pré-condições;
3. executa roteiro sem conhecimento interno do código;
4. compara valores e estados com oráculos;
5. registra dúvida ou defeito;
6. conclui aprovada, rejeitada ou bloqueada;
7. recebe nome, papel, data e observação;
8. repete casos afetados depois de correção.

## 34.3 Homologação contábil

É obrigatória para:

- todos os casos dourados D30;
- partilha de vigências;
- arredondamento/centavos;
- corte 15/16;
- PSR;
- RA e complemento;
- reembolso;
- MEI;
- pagamentos individualizados;
- fechamento;
- correção e ajuste;
- desligamento e acerto exclusivo de RA;
- conteúdo financeiro dos recibos.

## 34.4 Homologação jurídica/privacidade

É obrigatória para:

- textos e conteúdo dos recibos;
- retenção e acesso;
- ASO mínimo informativo;
- mascaramento e histórico;
- incidente;
- política de exportação;
- carga inicial e uso de dados.

---

# 35. Gates de aceite

## 35.1 Gate comum de item

Um `BK-*` somente fica concluído se:

- seu DoR estava completo;
- todos os `TST-*` proprietários e variações aplicáveis passaram;
- testes de integração e contrato aplicáveis passaram;
- nenhuma regressão foi introduzida;
- rastreabilidade continua íntegra;
- documentação e OpenAPI foram atualizadas;
- evidência foi anexada;
- homologador aplicável aceitou;
- não há SEV-0/1.

## 35.2 Gates GAT-01 a GAT-10

Os dez gates do Documento 21 permanecem vinculantes. O Documento 22 os materializa assim:

| Gate | Prova executável principal |
|---|---|
| GAT-01 | validadores documentais e manifesto sem órfãos |
| GAT-02 | matriz A×B×inexistente, RLS, pool, tarefa e arquivo |
| GAT-03 | ST-01, matriz de sessão/TOTP/CSRF e bootstrap one-shot com exatamente dois membros, ativação conjunta, consumo, concorrência/replay/falha parcial sem acesso antecipado |
| GAT-04 | matriz de ação/objeto/estado/campo e revogação |
| GAT-05 | constraints, versões, CPF/CNPJ, vigência e recontratação/renovação |
| GAT-06 | caderno D30/dinheiro, grupos, lote, fechamento, correção e saldo |
| GAT-07 | snapshot, semente anual pós-delta vinculada ao manifesto/janela, revogação/negação pós-janela, número, concorrência/colisão, hash, PDF, repetição e cadeia |
| GAT-08 | campo, ASO, Excel, download e temporário |
| GAT-09 | incidente, auditoria, notificação, telemetria e rotina temporal |
| GAT-10 | regressão total, segurança independente, desempenho, restauração, carga seca, responsáveis, fornecedores necessários definidos e Documentos 22/23 aprovados |

---

# 36. Critérios de entrada e saída da etapa

## 36.1 Entrada

Além do DoR do Documento 21:

- casos e variações estão identificados;
- fixture existe;
- oráculos estão decididos;
- dependência de teste existe;
- risco tem responsável;
- ambiente suporta o controle real que será provado.

## 36.2 Saída

Além da DoD:

- 100% dos casos proprietários foram executados;
- todos os `TST-API-*` e `QAT-*` aplicáveis à etapa e aos seus gates foram executados;
- todos os casos críticos passaram;
- regressão anterior passou;
- gates aplicáveis passaram;
- cobertura e segurança atenderam ao baseline;
- evidência está íntegra;
- defeitos obedecem à regra da seção 32;
- homologação aplicável foi assinada.

---

# 37. Responsabilidades

| Papel | Responsabilidade |
|---|---|
| Desenvolvedor | testes unitários, integração afetada, correção e evidência técnica |
| Revisor | independência mínima, legibilidade, risco, cobertura e rastreabilidade |
| Qualidade | estratégia, massa, regressão, defeito, evidência e gate |
| Segurança | matriz adversarial, configuração, DAST e revisão independente |
| Homologador de área | aceitar regra e resultado de sua especialidade |
| Operação | ambiente, observabilidade, falha, backup e restauração |
| Produto | decisão de escopo e aceite integrado |

Em equipe pequena, a mesma pessoa pode acumular papéis operacionais, mas:

- não pode aprovar sozinha risco crítico que implementou;
- financeiro e segurança exigem revisão adicional;
- candidato de produção exige responsáveis nominais;
- teste independente de segurança permanece obrigatório.

---

# 38. Ferramentas e portabilidade

Este documento fixa capacidades, não um fornecedor de teste. Na ETP-00, o repositório selecionará e fixará versões suportadas para:

- runner TypeScript;
- teste de componente;
- navegador E2E;
- PostgreSQL isolado;
- validação OpenAPI;
- análise estática/dependência/segredo/SBOM/imagem;
- DAST;
- carga;
- acessibilidade;
- relatórios estruturados.

Uma ferramenta pode ser substituída se:

1. mantiver os identificadores e evidências;
2. provar as mesmas camadas;
3. não enfraquecer gates;
4. passar pelo controle de mudança técnica;
5. não exigir dado real.

---

# 39. Fora do escopo de teste da V1

Não recebem teste de aceite da V1 porque estão fora do produto:

- folha oficial completa e tributos;
- rescisão oficial calculada pelo sistema;
- importação de holerite;
- integração bancária, eSocial, ponto ou nota fiscal MEI;
- férias, afastamentos e ocorrências;
- assinatura digital e comprovante anexado;
- PDF/imagem de ASO e conteúdo clínico proibido;
- aplicativo móvel, offline, API pública e webhooks;
- MF-01 de agendamento/comunicação ao colaborador;
- tecnologias descartadas no Documento 19.

Um teste pode confirmar a ausência/proibição dessas capacidades quando houver risco de entrada acidental.

---

# 40. Definições que podem aguardar a preparação da produção

Não bloqueiam este documento nem as primeiras etapas, mas bloqueiam o candidato final quando aplicáveis:

- nomes e substitutos de incidentes, backup e alertas;
- homologadores nominais;
- hospedagem/região/topologia;
- fornecedores de e-mail, CEP, objetos, KMS e observabilidade;
- disponibilidade/janela/suporte;
- parâmetros finais de backup;
- retenção mínima de IP/navegador em evento de segurança;
- competência inicial real;
- janela de implantação;
- política depois de seis anos;
- custódia da conta de emergência;
- parâmetros de MF-01 somente se futuramente priorizada;
- fornecedor/local definitivo e retenção operacional de longo prazo das evidências; a capacidade mínima com ACL, checksum, manifesto imutável e retenção até o fim do projeto é obrigatória já na ETP-00;
- matriz final de navegadores e tecnologias assistivas;
- nomes do revisor independente de segurança.

As versões exatas das ferramentas de teste serão fixadas no bootstrap técnico da ETP-00 antes de qualquer item que dependa delas. O contrato testável para detectar CPF integral e padrões de segredo no texto livre de incidentes deve ser fechado antes da entrada da ETP-08B.

---

# 41. Critérios de aprovação deste documento

O Documento 22 poderá ser aprovado quando o usuário confirmar que:

- a composição de caso-raiz e variações é compreensível;
- os 440 IDs permanecem obrigatórios e individualmente rastreados;
- PostgreSQL real e matriz A×B são obrigatórios;
- as massas sintéticas representam o uso esperado;
- D30, dinheiro, pagamentos individualizados, correção e desligamento estão cobertos;
- recibos, PDFs, Excel e downloads possuem provas de integridade e segurança;
- ASO, clínica, notificação e incidente estão cobertos sem ampliar o escopo;
- metas de desempenho e método de medição estão adequados;
- falhas, backup e restauração possuem critérios verificáveis;
- acessibilidade e homologação por área estão adequadas;
- severidades e gates impedem avanço inseguro;
- o Documento 22A contém exatamente as 440 linhas e vínculos aprovados;
- o Documento 22B contém exatamente as 60 telas/subfluxos aprovados;
- o Documento 22C contém exatamente os 119 casos técnicos, as 27 ameaças proprietárias e os contratos dos manifestos ASVS e WCAG;
- o Documento 22D contém exatamente os 25 cenários compostos exigidos pelo Documento Mestre, sem campo obrigatório vazio e com 25 vínculos nominais resolvidos para testes, etapa, gate e evidência;
- o pacote 23/23A–23D está aprovado integralmente pelo usuário;
- na data da aprovação deste planejamento, nenhum código de produção havia sido
  iniciado e a primeira execução então autorizada era a `ETP-00`; o checkpoint
  técnico posterior está registrado em `docs/ETP-00.md`.

## 41.1 Verificação documental concluída

Na execução final de 22 de agosto de 2026, o validador reprodutível do pacote confirmou:

| Controle estrutural | Resultado |
|---|---:|
| casos funcionais únicos | 440 |
| suítes funcionais | 18 |
| telas/subfluxos únicos | 60 |
| casos A11Y raiz e projeção estrutural | 8 e 480 combinações |
| casos técnicos únicos e rastreados | 119 e 119 |
| ameaças `AME` com proprietário | 27 |
| vetores dourados D30 | 24 |
| cenários compostos com entradas, memória, recibos e estados | 25 |
| rastreabilidade dos cenários compostos resolvida | 25 de 25 |
| contratos semânticos críticos dos cenários | 10 de 10 |
| propagação do corte terminal do MEI entre autoridades | 6 de 6 |
| baseline ASVS oficial | SHA-256 conferido; 345 IDs únicos; 70 L1 |
| gerador do Documento 22A | resultado idêntico ao arquivo versionado |
| erros estruturais/documentais | 0 |

Esse resultado significa `PlanningReady = true`. Os testes do produto, homologações e gates permanecem `NOT_RUN_PLANNED`; `ReleaseCandidateReady = false`. Portanto, esta verificação não afirma conformidade executada, funcionamento do sistema ou autorização de produção.

---

# 42. Continuidade registrada na aprovação

O pacote 23/23A–23D está aprovado integralmente. A continuidade é:

1. preparar o repositório e iniciar a `ETP-00 — Baseline executável`;
2. implementar as etapas seguintes com os gates e evidências deste documento;
3. manter `ReleaseCandidateReady`, `CutoverReady` e `ProductionGo` falsos até os respectivos gates;
4. manter a decisão de implantação reservada ao `MAR-06` e ao `GO/NO-GO` futuro.

---

**Situação desta versão:** aprovada integralmente pelo usuário em 22 de agosto de 2026.  
**Continuidade na data da aprovação:** pacote 23/23A–23D aprovado; preparar o repositório e iniciar a `ETP-00 — Baseline executável`.  
**Checkpoint posterior:** baseline `ETP-00` em implementação controlada conforme `docs/ETP-00.md`; produção não iniciada.
