# Documento 18

## Modelo Lógico de Dados, Relacionamentos, Restrições e Manifesto de Estados

**Sistema:** Portal interno multiempresa de Departamento Pessoal  
**Versão:** 1.0  
**Situação:** aprovado integralmente pelo usuário  
**Data:** 21/08/2026  
**Base aprovada:** Documentos 16 e 17, Documento Mestre 07 e refinamentos aprovados dos Lotes 1 a 7  
**Alinhamento normativo:** em 22/08/2026, a regra já aprovada no Documento Mestre §23.3 para término MEI antes/na data do adiantamento ainda não pago foi explicitamente propagada ao modelo; não houve nova decisão funcional.  
**Sincronização técnica posterior:** autoridade `ENT-IMP-*`, guarda de `ProductionGo` e controles correlatos alinhados ao pacote 23, aprovado integralmente pelo usuário em 22/08/2026; a aprovação funcional anterior permanece inalterada.  

---

# 1. Finalidade

Este documento transforma as regras funcionais e as transições aprovadas em um modelo lógico implementável. Ele define:

- entidades e respectivas fontes únicas;
- campos, tipos lógicos, obrigatoriedade e sensibilidade;
- chaves, relacionamentos e cardinalidades;
- versionamento, imutabilidade e concorrência;
- isolamento entre empresas;
- restrições de integridade e a camada responsável por cada uma;
- projeções derivadas que não podem virar fontes editáveis;
- manifesto completo dos estados do Documento 17;
- rastreabilidade entre regras, entidades e restrições.

O documento é independente de fornecedor. Ele não contém SQL físico, contrato HTTP, escolha de linguagem, provedor de nuvem ou desenho de implantação.

---

# 2. Autoridade e rastreabilidade

## 2.1 Ordem de autoridade

Em caso de divergência:

1. Documento 18, depois de aprovado, para estrutura lógica e integridade dos dados;
2. Documento 17 aprovado, para comportamento, estados e transições;
3. Documento 16 aprovado, para consolidação funcional e de telas;
4. Documento Mestre 07;
5. Fluxo Integrado 08 e Lotes 1 a 7;
6. documentos de descoberta anteriores.

O Documento 18 não pode alterar silenciosamente uma regra funcional. Se uma necessidade estrutural revelar conflito real, a regra volta para decisão e ambos os documentos recebem nova versão.

## 2.2 Identificadores estáveis

Este documento usa cinco famílias próprias:

| Prefixo | Finalidade |
|---|---|
| `ENT-*` | Entidade lógica. |
| `REL-*` | Relacionamento e cardinalidade. |
| `RST-*` | Restrição de integridade. |
| `PRJ-*` | Projeção derivada. |
| `EST-*` | Linha do manifesto técnico de estados. |

Cada entidade e restrição indica os IDs correspondentes do Documento 17. Os IDs funcionais não são reutilizados como nomes de tabela.

O [Documento 18A — Matriz de Rastreabilidade dos IDs Funcionais — Transições e Regras de Projeção](./18a-matriz-rastreabilidade-transicoes.md) integra este modelo como anexo verificável. Ele contém uma linha individual para cada um dos **440 IDs funcionais: 436 transições e quatro regras de projeção `ASO-R01` a `ASO-R04`**, ligando cada ID às entidades, relações/restrições, projeções/estados, operação e âncora de teste correspondentes.

---

# 3. Escopo e limites

## 3.1 Incluído

- empresa, configurações e logo;
- autenticação, TOTP, recuperação, sessões e segurança de acesso;
- usuários, masters, perfis, ações e permissões por campo;
- pessoa empresarial, vínculo empregado e recontratação;
- prestador MEI, contratos, renovações e vigências;
- condições financeiras do empregado e do MEI;
- competências, participantes, cálculos, grupos e pagamentos;
- correções, ajustes positivos e diferenças absorvidas;
- recibos, arquivos privados e lotes documentais;
- desligamentos e acerto complementar de RA;
- clínicas, acompanhamentos e exames de ASO;
- notificações, exportações, incidentes e auditoria;
- idempotência, concorrência, retenção e implantação inicial.

## 3.2 Fora deste documento

- tabelas físicas, índices específicos de um banco e scripts de migração;
- endpoints, formatos de requisição e respostas de API;
- escolha de hospedagem, banco, linguagem, framework ou provedor de e-mail;
- topologia de backup, observabilidade e recuperação de desastre;
- agendamento de ASO e envio ao colaborador da melhoria futura `MF-01`;
- aplicativo móvel, integração bancária, eSocial, importação de holerite e nota fiscal de MEI;
- anexos, imagem ou PDF do ASO;
- diagnóstico, CID, médico, CRM, descrição de restrição ou observação clínica livre.

Esses limites impedem que decisões técnicas posteriores alterem o dado funcional aprovado.

---

# 4. Decisões estruturais vinculantes

1. **Pessoa não é global:** o CPF identifica uma pessoa dentro de uma empresa. O mesmo CPF em outro CNPJ gera outro registro e não pode ser inferido por consulta cruzada.
2. **Prestador não é global:** o CNPJ do MEI é único dentro da empresa contratante; pode existir em outro CNPJ contratante sem exposição cruzada.
3. **Clínica é global:** clínica não possui `empresa_id`, mas usá-la em um exame não concede acesso ao catálogo global nem a outras empresas.
4. **Master é papel sistêmico:** não depende de associação empresarial, mas continua sujeito à seleção de uma única empresa e ao isolamento de dados.
5. **Incidente usa escopo restrito:** a autorização de incidente não deriva de perfil empresarial nem do papel master.
6. **Participante financeiro é um supertipo:** cada participante de competência aponta exclusivamente para um vínculo empregado ou para um contrato MEI.
7. **Nenhuma associação empresarial livre:** toda relação entre registros empresariais carrega a mesma empresa e é protegida por chave estrangeira composta ou mecanismo equivalente.
8. **Histórico é imutável:** pagamentos, recibos, versões substituídas, entradas de incidente e auditorias não são sobrescritos.
9. **Estado derivado não é editável:** situação temporal, total acordado, prazo de ASO e demais projeções são calculados das fontes aprovadas.
10. **Dinheiro não usa ponto flutuante binário:** valores persistidos usam duas casas; cálculos intermediários usam precisão decimal maior e arredondamento normal na terceira casa.
11. **Vigências não se sobrepõem:** condições do mesmo tipo e proprietário usam intervalos inclusivos sem sobreposição.
12. **Exclusão física é excepcional:** dados operacionais, históricos, perfis, clínicas, usuários, pagamentos, recibos, ASOs, incidentes e auditoria não são fisicamente excluídos pela operação comum.
13. **Auditoria e negócio são atômicos:** quando a auditoria é obrigatória, ambos concluem na mesma transação ou nenhum conclui.
14. **O navegador não é autoridade:** autenticação, empresa, perfil, campo, versão e estado são revalidados no servidor em toda leitura ou mutação.

---

# 5. Convenções de nomenclatura e tipos lógicos

## 5.1 Nomenclatura

- entidades e campos usam `snake_case` em português;
- chave primária termina em `_id`;
- referência empresarial sempre explicita `empresa_id`;
- datas de negócio começam com `data_`; instantes técnicos terminam com `_em`;
- competências usam `competencia_mes`, normalizada para o primeiro dia do mês;
- estados persistidos usam código canônico, nunca texto livre de interface;
- valores normalizados para busca terminam com `_normalizado`;
- snapshots imutáveis terminam com `_snapshot` ou pertencem a uma entidade de versão.

## 5.2 Tipos lógicos

| Tipo | Semântica lógica | Regras |
|---|---|---|
| `id` | Identificador opaco e globalmente único. | Não contém CPF, CNPJ, sequência ou significado de negócio. |
| `inteiro` | Número inteiro assinado. | Limites físicos serão escolhidos na arquitetura. |
| `versao` | Inteiro positivo de concorrência/versionamento. | Começa em 1 e cresce sem reutilização. |
| `booleano` | Verdadeiro ou falso. | Não substitui estado com mais de duas possibilidades. |
| `codigo` | Valor de catálogo fechado. | Persistido por código estável; rótulo é apresentação. |
| `texto_curto` | Nome, título ou descrição curta validada. | Tamanho físico definido posteriormente. |
| `texto_longo` | Justificativa ou descrição controlada. | Sem HTML executável; campos sensíveis têm regras próprias. |
| `cpf` | Valor lógico de onze dígitos. | Validado na entrada e revelado somente com autorização; não fica em coluna de busca em claro. |
| `cnpj` | Quatorze dígitos como texto. | Validação estrutural e dígitos verificadores; nunca numérico. |
| `cep` | Oito dígitos como texto. | Consulta externa é auxiliar; salvamento manual continua possível. |
| `email` | Endereço original e forma normalizada. | Unicidade usa a forma normalizada sem diferença de maiúsculas. |
| `telefone` | Texto normalizado com DDI/DDD quando informado. | Opcional no MEI; não é identificador. |
| `data` | Data civil sem horário. | Datas operacionais são interpretadas em `America/Sao_Paulo`. |
| `competencia` | Mês civil. | Armazenado logicamente como primeiro dia do mês. |
| `instante` | Momento inequívoco. | Persistido em UTC; exibido no fuso autorizado. |
| `moeda` | Decimal com duas casas. | Faixa não negativa, salvo campos explícitos de diferença matemática. |
| `decimal_calculo` | Decimal de alta precisão. | Mínimo lógico de seis casas intermediárias. |
| `percentual` | Decimal maior que ou igual a 0 e menor que ou igual a 100. | Parcelamento em duas vezes exige maior que 0 e menor que 100. |
| `hash` | Resumo criptográfico ou de integridade. | Algoritmo e tamanho físicos ficam para a arquitetura. |
| `segredo_cifrado` | Material secreto protegido. | Nunca aparece em auditoria, exportação ou resposta comum. |
| `dado_protegido` | Dado pessoal cifrado ou protegido por mecanismo equivalente. | Chaves e rotação serão definidas na arquitetura. |
| `indice_busca_segura` | Resumo determinístico com chave e escopo. | Permite igualdade/unicidade sem armazenar CPF pesquisável em claro. |
| `json_canonico` | Estrutura imutável e ordenada para snapshot técnico. | Permitido para filtros, resposta idempotente e snapshot; não substitui campos relacionais críticos. |

## 5.3 Datas, competências e D30

- intervalos de negócio são inclusivos;
- `fim_vigencia` nulo significa indeterminado;
- `fim aplicável` do contrato MEI é a data efetiva, se informada; caso contrário, a prevista;
- divisor mensal comercial é sempre 30;
- o algoritmo `D30` e `PARTILHAR_D30` pertence ao Documento 17, seção 12.4;
- memória de cálculo guarda datas, posições D30 e fórmula usada, mas o rótulo temporal continua derivado;
- fevereiro, mês com 31 dias e mudança de vigência não podem atribuir a mesma posição comercial duas vezes.

## 5.4 Moeda e percentuais

- valor automático, eventual valor manual e valor final são campos diferentes;
- a justificativa é obrigatória quando `valor_final` difere de `valor_automatico`;
- arredondamento para moeda ocorre somente na fronteira definida pela fórmula;
- parcela final é calculada por diferença para preservar o total de duas casas;
- não existe arredondamento especial para complementos;
- diferenças negativas nunca viram pagamento, cobrança ou desconto futuro.

---

# 6. Colunas transversais, versionamento e imutabilidade

## 6.1 Colunas comuns de raiz mutável

| Campo | Tipo | Regra |
|---|---|---|
| `<entidade>_id` | `id` | Chave primária imutável. |
| `empresa_id` | `id` | Obrigatório em entidade empresarial. Ausente somente nos escopos globais/restritos expressamente listados. |
| `versao_lock` | `versao` | Controle de concorrência otimista. |
| `criado_em` | `instante` | Instante do servidor. |
| `criado_por_usuario_id` | `id` | Usuário executor ou ator técnico identificado. |
| `atualizado_em` | `instante` | Última mutação confirmada. |
| `atualizado_por_usuario_id` | `id` | Executor da última mutação. |

## 6.2 Padrão raiz + versões

Cadastros que precisam preservar correções usam:

```text
entidade_raiz
  ├─ identidade estável e proprietário
  ├─ versao_atual_id
  └─ estado operacional quando realmente persistido

entidade_versao
  ├─ entidade_raiz_id
  ├─ numero_versao
  ├─ dados imutáveis daquela versão
  ├─ inicio_vigencia/fim_vigencia quando aplicável
  ├─ motivo e justificativa quando exigidos
  └─ autor e instante
```

Uma versão nunca é atualizada para parecer que sempre teve o novo conteúdo. Corrigir cria nova versão e troca o ponteiro atual na mesma transação.

## 6.3 Entidades somente de acréscimo

São append-only:

- confirmação de pagamento;
- saldo inicial de implantação e suas versões corretivas;
- recibo e snapshot emitido;
- entrada da linha do tempo de incidente;
- evento de acompanhamento de ASO;
- auditoria e alterações de campo;
- resultado de diferença absorvida;
- operação idempotente concluída.

Cancelamento administrativo acrescenta estado ou versão; não apaga o fato anterior.

## 6.4 Concorrência

- toda mutação envia a versão lida;
- versão obsoleta produz conflito sem sobrescrita;
- unicidades críticas são revalidadas dentro da transação;
- lotes elegíveis obedecem `todos ou nenhum`;
- uma resposta incerta é reconciliada pela chave idempotente antes de nova tentativa;
- chave igual com intenção diferente é rejeitada.

---

# 7. Escopos e isolamento multiempresa

## 7.1 Classes de escopo

| Classe | Entidades principais | Regra de acesso |
|---|---|---|
| Empresarial | pessoa, vínculo, MEI, competência, pagamento, recibo, ASO, notificação e histórico empresarial | Exige uma única empresa selecionada e autorizada. |
| Global administrativo | usuário, modelo de perfil, clínica e auditoria global autorizada | Exige função global própria; empresa anteriormente selecionada não filtra nem concede. |
| Restrito de incidente | incidente, entradas e alcance | Exige autorização nominal própria; não herda acesso empresarial. |
| Técnico privado | sessão, token, arquivo, operação idempotente | Exige proprietário, finalidade e escopo correlacionado. |

## 7.2 Regras obrigatórias

1. Toda tabela empresarial possui `empresa_id` não nulo.
2. A chave candidata `(empresa_id, entidade_id)` existe onde for necessária para FKs compostas.
3. Toda FK empresarial inclui ou comprova a igualdade do `empresa_id` nos dois lados.
4. Consultas empresariais recebem o escopo do servidor, nunca um CNPJ confiado ao navegador.
5. Identificador de outro CNPJ retorna resposta neutra de não encontrado.
6. Cache, arquivo, filtro, paginação e contador carregam a empresa e a versão de autorização.
7. RLS ou mecanismo equivalente é defesa adicional obrigatória; não substitui autorização de ação/campo.
8. Master seleciona uma empresa por vez e não consulta dados combinados em telas empresariais.
9. Clínica global e incidente restrito são exceções explícitas, nunca precedentes para tornar outras entidades globais.

## 7.3 Sensibilidade

| Classe | Exemplos | Tratamento lógico |
|---|---|---|
| Restrita cadastral | CPF, endereço, telefone e e-mail | Campo omitido, mascarado, somente leitura ou editável conforme perfil. |
| Restrita financeira | salário, RA, complemento, líquido, pagamento e recibo | Nunca entra em resposta, total, filtro ou exportação sem permissão. |
| Restrita clínica | resultado de ASO e restrição derivada | Omitida integralmente sem permissão; acesso explícito auditado. |
| Segredo | senha, TOTP, código e token | Somente hash ou cifra; nunca exportado ou auditado em claro. |
| Segurança | IP, navegador e tentativa | Retenção e acesso específicos a definir antes da produção. |

---

# 8. Visão lógica integrada

## 8.1 Domínios

```text
IDENTIDADE E ACESSO
  usuário ─ credenciais ─ sessões
       └─ perfis/autorizações ─ empresa

EMPRESA E PESSOAS
  empresa ─ pessoa empresarial ─ vínculo empregado ─ desligamento
         └─ prestador MEI ─ contrato ─ vigências/renovação

FINANCEIRO
  condições versionadas ─ competência ─ participante
                         └─ grupo ─ componente ─ cálculo
                                  ├─ conferência ─ pagamento ─ recibo
                                  └─ correção ─ ajuste/diferença

SAÚDE OCUPACIONAL
  vínculo ─ acompanhamento ─ exame lógico ─ versão
       clínica global ───────────────┘

CONTROLE
  origem empresarial ─ notificação ─ leitura
  qualquer mutação ─ auditoria
  pedido ─ exportação temporária
  escopo restrito ─ incidente ─ entradas imutáveis
```

## 8.2 Relação central da competência

```text
competencia 1 ── N competencia_participante
competencia_participante N ── 1 vínculo empregado XOR contrato MEI
competencia_participante 1 ── N grupo_financeiro
grupo_financeiro 1 ── N componente_financeiro
grupo_financeiro 1 ── N memoria_calculo
grupo_financeiro 1 ── 0..N conferencia
grupo_financeiro 1 ── 0..N confirmacao_pagamento
confirmacao_pagamento 1 ── 0..1 recibo lógico
grupo_financeiro 1 ── 0..1 correção aberta; N correções históricas
correção 1 ── N resultado_por_verba
```

## 8.3 Regra contra polimorfismo livre

Quando uma entidade puder apontar para mais de um subtipo, o modelo usa uma das duas formas:

1. supertipo explícito, como `competencia_participante`; ou
2. colunas de FK tipadas com restrição XOR, como a origem de um componente.

Não será aceita uma dupla genérica `tipo_entidade + id` sem integridade adicional para relações financeiras, clínicas ou empresariais críticas.

## 8.4 Registro consolidado de relacionamentos

| ID | Relacionamento | Cardinalidade e regra |
|---|---|---|
| REL-AUT-01 | usuário → versões de identidade | 1:N; uma versão atual. |
| REL-AUT-02 | usuário → credenciais/sessões | 1:N histórico; no máximo uma credencial vigente por finalidade quando definido. |
| REL-AUT-03 | bootstrap master inicial → usuários membros | Singleton: exatamente dois usuários distintos; cada usuário pertence no máximo ao único agregado inicial; ativação e instante conjunto mudam os dois ou nenhum. |
| REL-ACL-01 | empresa → perfis empresariais | 1:N; perfil pertence a uma empresa. |
| REL-ACL-02 | perfil → versões → permissões | 1:N e versão 1:N ações/campos; snapshot imutável. |
| REL-ACL-03 | usuário comum ↔ empresa | N:N por associação; exatamente um perfil vigente por par. |
| REL-ACL-04 | usuário comum → associações de perfil global | 1:N histórico; no máximo uma versão atual e vigente por usuário. |
| REL-ACL-05 | usuário → versões de autorização de incidente | 1:N histórico; no máximo uma versão atual por usuário, independente de perfis. |
| REL-ACL-06 | contingência master → executor, afetado e autorização curta | Cada contingência liga exatamente um executor, um master afetado e uma autorização curta; no máximo uma aberta. |
| REL-ACL-07 | associação de perfil → migração → perfis origem/destino | A associação é empresarial XOR global; origem e destino têm o mesmo tipo/escopo. |
| REL-COL-01 | empresa → pessoas | 1:N; CPF único dentro da empresa por índice seguro. |
| REL-COL-02 | pessoa → vínculos | 1:N; episódios sem sobreposição. |
| REL-COL-03 | pessoa/vínculo → versões | 1:N; uma atual por raiz. |
| REL-MEI-01 | empresa → prestadores | 1:N; CNPJ MEI único dentro da empresa. |
| REL-MEI-02 | prestador → contratos → vigências/renovações | 1:N e 1:N; versões atuais sem sobreposição; renovação liga origem e destino contínuos. |
| REL-FIN-01 | vínculo → condições financeiras | 1:N por tipo; intervalos do mesmo eixo sem sobreposição. |
| REL-FIN-02 | vínculo → complementos | 1:N recorrentes e 1:N avulsos por competência. |
| REL-FIN-03 | contrato MEI → serviços avulsos | 1:N por competência; somente pagamento final. |
| REL-FIN-04 | participante empregado+competência+evento → reembolso → versões → itens | 1:0..1 raiz por evento, 1:N versões e 1:N itens imutáveis por versão. |
| REL-FIN-05 | base do período sem registro → linhas por competência | 1:N; no máximo uma linha versionada por vínculo+competência. |
| REL-CPT-00 | empresa → competências → participantes | 1:N e N:N pela entidade de participação; nunca mistura empresas. |
| REL-PAG-01 | participante da competência → grupos | 1:N por grupo+evento. |
| REL-PAG-02 | grupo → versões/componentes/memórias | 1:N em cada eixo; uma versão corrente do grupo. |
| REL-PAG-03 | grupo → confirmação → pagamento real | 1:0..N histórico; uma confirmação administrativa vigente por ciclo. |
| REL-PAG-04 | confirmação versão → componentes pagos | 1:N; soma igual ao pagamento real. |
| REL-COR-01 | grupo pago → correções F04 | 1:N histórico; no máximo uma aberta no escopo mínimo. |
| REL-COR-02 | correção → resultados → ajuste/diferença | 1:N; cada resultado gera no máximo um destino permitido. |
| REL-REC-01 | confirmação → recibo lógico | 1:0..N por tipo/versão documental. |
| REL-REC-02 | recibo → snapshot/itens/arquivo | 1:1, 1:N e 1:1. |
| REL-REC-03 | recibo predecessor → sucessor | 1:0..1 direto; cadeia preservada. |
| REL-IMP-01 | manifesto de carga → entradas empresa+ano | 1:N; uma única entrada por manifesto+empresa+ano, sempre dentro das empresas e dos anos explicitamente aprovados para a tentativa. |
| REL-IMP-02 | entrada do manifesto → sequência de recibo/autorização curta/aprovações | 1:0..1 raiz de sequência já existente ou criada pela semente; 1:N autorizações históricas, no máximo uma vigente; 1:N aprovações append-only sobre versão e hash exatos. |
| REL-IMP-03 | guarda de autoridade da implantação → manifesto reconciliado/eventos de comutação | 1:0..1 vínculo de `ProductionGo`, gravado uma única vez contra o manifesto exato; 1:N eventos de autoridade append-only e exatamente uma fonte autoritativa corrente. |
| REL-IMP-04 | manifesto/guarda → eventos de inelegibilidade de `GO` | 1:N fatos append-only; cada evento liga o manifesto exato, causa/origem/delta e hashes do conteúdo selado, sem reabrir nem reterminalizar o manifesto. |
| REL-DES-01 | vínculo → ciclos de desligamento | 1:N histórico; no máximo um programado/efetivo vigente. |
| REL-DES-02 | desligamento formal → rescisão/acerto RA/ASO demissional | 1:0..1 em cada obrigação aplicável e independente. |
| REL-ASO-00 | vínculo → acompanhamentos/exames/referência | 1:N, 1:N e 1:0..1; MEI proibido. |
| REL-NOT-01 | origem → condição → ocorrências → leituras | 1:N, 1:N sequencial e 1:N por usuário. |
| REL-EXP-01 | usuário → pedidos → tentativas/arquivo | 1:N; arquivo pertence ao solicitante. |
| REL-INC-01 | incidente → entradas → alcances/evidências | 1:N append-only; filhos pertencem à entrada. |
| REL-AUD-01 | operação → eventos → mudanças/correlações | 1:N; trilha somente de acréscimo. |

Os relacionamentos detalhados das seções 17 e 22 refinam, sem duplicar a fonte, as linhas `REL-CPT-00` e `REL-ASO-00`. A relação global clínica → versões possui uma única definição canônica: `REL-CLI-01`, na seção 22.7.

---

# 9. Padrão do dicionário lógico

Cada catálogo de entidade registra, em coluna ou em regra geral da própria seção:

| Coluna | Significado |
|---|---|
| ID | Identificador `ENT-*`. |
| Entidade | Nome lógico estável. |
| Escopo | Empresarial, global, restrito ou técnico privado. |
| Finalidade | Fonte única ou responsabilidade. |
| Chave e unicidade | PK e chaves naturais. |
| Ciclo | Mutável versionada, append-only, derivada ou temporária. |
| Regras 17 | IDs funcionais mais diretamente relacionados. |

Os campos detalhados usam `Campo`, `Tipo`, `Obrigatório`, `Origem`, `Regra` e `Sensibilidade`. `Condicional` significa que a própria regra descrita determina quando o valor é obrigatório.

Quando todas as entidades de uma seção repetem o mesmo escopo/ciclo, a tabela pode omitir a coluna para legibilidade, mas o atributo continua vinculante e deve aparecer no texto. O inventário automatizado tratará metadado omitido e não inferível como erro.

---

# 10. Camadas de garantia das restrições

| Camada | Responsabilidade |
|---|---|
| Banco | `NOT NULL`, `CHECK`, FK, unicidade, não sobreposição quando suportada e isolamento estrutural. |
| Transação | Mínimo de masters, lote todos-ou-nenhum, numeração, troca de versão e auditoria atômica. |
| Serviço de domínio | Fórmulas, condições temporais, autorização cumulativa e decisões que envolvem várias entidades. |
| Autorização/RLS | Empresa, tela, ação, campo, arquivo, perfil e revogação atual. |
| Interface | Prevenção e orientação; nunca é a única barreira. |
| Rotina temporal | Virada de datas, prazo de ASO, expiração e retenção. |

Toda `RST-*` da seção consolidada indicará uma ou mais camadas. Regra crítica nunca fica somente na interface.

---

# 11. Empresa, configurações e logo

## 11.1 Catálogo de entidades

| ID | Entidade | Escopo | Finalidade | Chave e unicidade | Ciclo | Regras 17 |
|---|---|---|---|---|---|---|
| ENT-EMP-01 | `empresa` | Global administrativo | Identidade estável de cada CNPJ empregador/contratante. | PK `empresa_id`; CNPJ atual único global. | Raiz não excluível. | B02-EMP-01 a B02-EMP-08 |
| ENT-EMP-02 | `empresa_versao` | Empresarial | Snapshot versionado de razão social, nome fantasia e CNPJ. | Única por empresa+número; uma versão atual. | Imutável por versão. | B02-EMP-01, B02-EMP-04 |
| ENT-EMP-03 | `empresa_configuracao_versao` | Empresarial | Padrões operacionais de competência e K06. | Única por empresa+versão; vigências sem sobreposição. | Imutável por versão. | B02-EMP-04, P09-01 a P09-04 |
| ENT-EMP-04 | `empresa_logo_versao` | Empresarial | Liga a empresa ao arquivo privado de logo usado no cabeçalho. | Uma versão vigente por empresa. | Versionada; anterior preservada. | B02-EMP-04, R11-02 |

## 11.2 Campos de `empresa`

| Campo | Tipo | Obrigatório | Origem | Regra | Sensibilidade |
|---|---|---|---|---|---|
| `empresa_id` | `id` | Sim | Sistema | Identidade técnica imutável. | Interna |
| `cnpj_atual_normalizado` | `cnpj` | Sim | Cadastro/retificação | Único global; espelha a versão atual. | Cadastral |
| `empresa_versao_atual_id` | `id` | Sim | Versionamento | FK para versão da mesma empresa. | Interna |
| `configuracao_versao_atual_id` | `id` | Sim | Versionamento | FK para configuração atual da mesma empresa. | Financeira |
| `situacao` | `codigo` | Sim | Transição | `ATIVA` ou `INATIVA`; não há exclusão. | Interna |
| `competencia_inicial` | `competencia` | Sim | Implantação | Imutável após criação; nenhuma competência anterior pode ser criada. | Operacional |
| `modelo_perfil_origem_id` | `id` | Sim | Criação | Referência informativa ao modelo copiado; não mantém herança viva. | Interna |
| `versao_lock` | `versao` | Sim | Sistema | Concorrência otimista. | Técnica |

## 11.3 Campos versionados da empresa

| Campo | Tipo | Obrigatório | Regra |
|---|---|---|---|
| `empresa_versao_id` | `id` | Sim | PK da versão. |
| `empresa_id` | `id` | Sim | Pertence à raiz. |
| `numero_versao` | `versao` | Sim | Único e crescente. |
| `razao_social` | `texto_curto` | Sim | Usada no sistema e no snapshot dos recibos. |
| `nome_fantasia` | `texto_curto` | Sim | Exibição auxiliar e identificação na seleção. |
| `cnpj_normalizado` | `cnpj` | Sim | Mantém o CNPJ daquela versão. |
| `motivo_correcao` | `codigo` | Condicional | Obrigatório quando não for a versão inicial. |
| `justificativa` | `texto_longo` | Condicional | Obrigatória para correção sensível. |
| `criado_em` / `criado_por_usuario_id` | `instante` / `id` | Sim | Imutáveis. |

## 11.4 Configuração empresarial

| Campo | Tipo | Obrigatório | Regra |
|---|---|---|---|
| `liquido_contador_desconta_adiantamento_padrao` | `booleano` | Sim | Inicialmente verdadeiro; K06 permite confirmação excepcional por linha. |
| `dia_sugerido_adiantamento` | `inteiro` | Opcional | Dia de 1 a 31, normalmente 20, 21 ou 22; apenas preenche a competência. |
| `dia_sugerido_pagamento_final` | `inteiro` | Opcional | Dia de 1 a 31, normalmente 5 ou 6 do mês seguinte; apenas preenche a competência. |
| `inicio_competencia` | `competencia` | Sim | Primeira competência em que a versão vale. |
| `fim_competencia` | `competencia` | Opcional | Última competência inclusiva; nulo significa vigente até substituição. |
| `numero_versao` | `versao` | Sim | Crescente por empresa. |

O corte do dia 15 e o divisor 30 são regras do produto, não configurações empresariais da primeira versão. Os dias sugeridos apenas preenchem novas competências; as datas previstas efetivas pertencem à competência e permanecem editáveis.

O percentual de adiantamento padrão possui uma única fonte: `ENT-FIN-01`. Criar uma empresa grava, na mesma transação, a vigência inicial de 40%; `empresa_configuracao_versao` não duplica esse valor.

## 11.5 Logo

`empresa_logo_versao` guarda `empresa_id`, `arquivo_privado_id`, versão, início/fim de uso, autor e instante. O arquivo:

- aceita somente PNG ou JPEG validado pelo conteúdo real;
- possui limite de 2 MB;
- é reprocessado para remover metadados e conteúdo ativo;
- nunca recebe URL pública permanente;
- não altera recibos já emitidos, que guardam o snapshot correspondente.

---

# 12. Autenticação, credenciais e sessões

## 12.1 Catálogo de entidades

| ID | Entidade | Escopo | Finalidade | Chave e unicidade | Ciclo | Regras 17 |
|---|---|---|---|---|---|---|
| ENT-AUT-01 | `usuario` | Global administrativo | Identidade estável, situação administrativa, papel base e revisão de autorização. | PK; e-mail atual normalizado único global. | Raiz não excluível. | B01-AUT-*, B03-USR-* |
| ENT-AUT-02 | `usuario_identidade_versao` | Global administrativo | Nome e e-mail de cada versão. | Usuário+número únicos; uma atual. | Imutável. | B03-USR-10, B03-USR-11 |
| ENT-AUT-03 | `credencial_senha` | Técnico privado | Hash da senha definitiva e sua vigência. | Uma credencial vigente por usuário. | Versões invalidadas preservadas sem hash reutilizável. | B01-AUT-01 a B01-AUT-05, B01-AUT-25 |
| ENT-AUT-04 | `credencial_primeiro_acesso` | Técnico privado | Credencial temporária de 24 horas. | Hash único; no máximo uma vigente por usuário. | Consumida, vencida ou invalidada. | B01-AUT-04, B01-AUT-08, B01-AUT-09 |
| ENT-AUT-05 | `token_recuperacao_senha` | Técnico privado | Link de recuperação de 30 minutos. | Hash único; uma intenção vigente por usuário. | Append-only de emissão/consumo. | B01-AUT-10 a B01-AUT-12 |
| ENT-AUT-06 | `credencial_totp` | Técnico privado | Segredo TOTP cifrado e estado da configuração. | Uma atual por master. | Versionada; segredo anterior invalidado. | B01-AUT-13 a B01-AUT-17, B03-MST-05 a B03-MST-07 |
| ENT-AUT-07 | `serie_codigo_recuperacao_totp` | Técnico privado | Agrupa os códigos apresentados uma única vez. | Uma série vigente por credencial. | Série anterior invalidada. | B01-AUT-15, B01-AUT-26 |
| ENT-AUT-08 | `codigo_recuperacao_totp` | Técnico privado | Hash individual de código de uso único. | Série+hash únicos. | Vigente, consumido ou invalidado. | B01-AUT-15, B01-AUT-26 |
| ENT-AUT-09 | `sessao_usuario` | Técnico privado | Autenticação, escopo atual, prazos e revogação. | Identificador/hash de sessão único. | Temporária; não reativável. | B01-AUT-18 a B01-AUT-24, B02-CTX-* |
| ENT-AUT-10 | `tentativa_autenticacao` | Técnico privado | Evidência segura de tentativa e limitação de abuso. | ID próprio; correlação controlada. | Append-only. | B01-AUT-05 a B01-AUT-07, B01-AUT-16/16A |
| ENT-AUT-11 | `bloqueio_autenticacao` | Técnico privado | Janela temporária de 15 minutos. | Uma janela ativa por chave de controle. | Temporal. | B01-AUT-06, B01-AUT-07, B01-AUT-16A |
| ENT-AUT-12 | `autorizacao_curta` | Técnico privado | Reautenticação, recuperação controlada de TOTP ou capacidade efêmera de implantação para semente anual e acesso nominal de migração pré-`GO`. | Token/hash único e finalidade/escopo vinculados; no máximo uma vigente por sujeito+finalidade+escopo exato. | Curta, consumível ou temporal, revogável e não reutilizável. | B01-AUT-17, B03-MST-05 a B03-MST-07, Documento 23 |
| ENT-AUT-13 | `mensagem_transacional_saida` | Técnico privado | Pedido idempotente de convite ou recuperação por e-mail. | Finalidade+operação idempotente. | Append-only de tentativas. | B01-AUT-10, B03-USR-01, B03-USR-04 |
| ENT-AUT-14 | `bootstrap_master_inicial` | Global técnico crítico | Agregado de uso único que forma exatamente as duas identidades master iniciais e impede aptidão individual antecipada. | Singleton da instalação; exatamente dois usuários distintos e dois e-mails distintos; intenção técnica única. | `ABERTO` até a ativação conjunta; depois `CONSUMIDO` terminal e não recriável. | Suporte técnico de BK-033; não cria novo ID funcional |

## 12.2 Campos centrais de `usuario`

| Campo | Tipo | Obrigatório | Regra | Sensibilidade |
|---|---|---|---|---|
| `usuario_id` | `id` | Sim | Identidade imutável. | Interna |
| `identidade_versao_atual_id` | `id` | Sim | FK para versão do mesmo usuário. | Cadastral |
| `email_atual_normalizado` | `email` | Sim | Único sem diferença de maiúsculas. | Cadastral |
| `situacao_administrativa` | `codigo` | Sim | `ATIVO`, `BLOQUEADO_ADMINISTRATIVAMENTE` ou `INATIVO`. | Segurança |
| `papel_base` | `codigo` | Sim | `COMUM` ou `MASTER`; aptidão master é derivada. | Crítica |
| `estado_primeiro_acesso` | `codigo` | Sim | `PENDENTE`, `CONCLUIDO` ou `VENCIDO`. | Segurança |
| `revisao_autorizacao` | `inteiro` | Sim | Incrementa em toda redução ou mudança relevante de acesso. | Técnica |
| `versao_lock` | `versao` | Sim | Concorrência. | Técnica |

`usuario_identidade_versao` guarda nome, e-mail original, e-mail normalizado, motivo, autor e instante. Alterar e-mail revoga as sessões previstas e nunca reutiliza a versão anterior como atual.

## 12.3 Credenciais e segredos

| Entidade | Campos lógicos mínimos | Regras de proteção |
|---|---|---|
| `credencial_senha` | usuário, hash, algoritmo/parametrização identificada, criada, invalidada, motivo | Somente hash forte; senha mínima de 10 caracteres validada antes do hash; nunca auditar conteúdo. |
| `credencial_primeiro_acesso` | usuário, hash, emissão, expiração, consumo, invalidação e motivo | Sem enum próprio; seu uso é derivado dos instantes. `usuario.estado_primeiro_acesso` é a única fonte funcional; reenvio invalida imediatamente a credencial anterior. |
| `token_recuperacao_senha` | usuário elegível, hash, emissão, expiração, consumo/invalidação | Validade de 30 minutos; resposta pública não revela existência. |
| `credencial_totp` | usuário, segredo cifrado, estado, configurada/invalidada, versão | Somente master; cifra separada; executor administrativo nunca vê segredo. |
| `codigo_recuperacao_totp` | série, hash, posição aleatória, consumido/invalidado | Apresentado em claro somente uma vez na geração. |
| `autorizacao_curta` | usuário, sessão, tipo, ação, entidade, versão, escopo, hash, expiração, consumo/revogação; para semente: manifesto, entrada, empresa, ano, valor e `ledger_conteudo_versao/hash`; para migração: manifesto, usuário, empresas, classes/ações permitidas e janela exatos | Não autoriza outro ator, ação, entidade, versão, empresa, ano, valor, manifesto, entrada, ledger ou sessão. `MIGRACAO_PRE_GO` só nasce depois de `CTL-IMP-001/PROMOVER`, para manifesto `APROVADO` já persistido, e antes da primeira ação de carga que a exige; `SEMENTE_RECIBO_IMPLANTACAO` nasce apenas no estágio final aprovado. Nenhuma é concedida por perfil/tela comum. A primeira é adicional à permissão normal, não admite pagamento, recibo definitivo ou efeito externo, e toda autorização de implantação expira ou é revogada no fechamento, `NO-GO` ou troca de autoridade. |

## 12.4 Sessão

| Campo | Tipo | Obrigatório | Regra |
|---|---|---|---|
| `sessao_usuario_id` | `id` | Sim | PK privada. |
| `usuario_id` | `id` | Sim | Usuário autenticado; ausente somente antes de uma autenticação correlacionável, que não vira sessão liberada. |
| `estado_sessao` | `codigo` | Sim | `SENHA_TEMPORARIA_ACEITA`, `SENHA_DEFINITIVA_ACEITA_TOTP_PENDENTE`, `RESTRITA_A03`, `AUTENTICADA`, `EXPIRADA`, `ENCERRADA` ou `REVOGADA`. Sessão pública não autenticada é ausência. |
| `totp_concluido` | `booleano` | Sim | Verdadeiro somente depois de fator válido na sessão corrente. |
| `tipo_escopo` | `codigo` | Condicional | Obrigatório somente em `AUTENTICADA`: `SEM_EMPRESA`, `EMPRESARIAL`, `GLOBAL` ou `INCIDENTE_RESTRITO`; nulo nas demais fases. |
| `empresa_id` | `id` | Condicional | Exatamente uma quando o escopo for empresarial; nula nos demais. |
| `incidente_contexto_id` | `id` | Condicional | Somente no escopo restrito e com autorização atual. |
| `revisao_autorizacao_conhecida` | `inteiro` | Sim | Comparada à revisão atual do usuário. |
| `iniciada_em` / `ultima_atividade_em` | `instante` | Sim | Atividade automática não renova a janela. |
| `expira_inatividade_em` | `instante` | Sim | Trinta minutos após a última atividade válida. |
| `expira_absoluta_em` | `instante` | Sim | Oito horas após o início, sem renovação. |
| `encerrada_em` / `motivo_encerramento` | `instante` / `codigo` | Condicional | Obrigatórios quando expirada, encerrada ou revogada. |

Não existe `manter conectado`. Troca de empresa limpa competência, filtros, arquivos, prévias, retornos e rascunhos do contexto anterior.

## 12.5 Limitação de tentativas

`tentativa_autenticacao` não guarda senha, TOTP ou código. Ela registra finalidade, instante, resultado neutro e chaves de correlação protegidas. `bloqueio_autenticacao` começa na quinta tentativa válida para o controle e termina após 15 minutos. Bloqueio temporário não altera a situação administrativa do usuário.

IP e identificação de navegador possuem campos opcionais classificados; o prazo e a forma definitiva de retenção continuam no gate pré-produção.

## 12.6 Bootstrap dos masters iniciais

`bootstrap_master_inicial` é um agregado técnico singleton, criado somente pelo plano de controle de implantação e nunca por uma rota pública ou por uma conta de emergência. Ele referencia exatamente dois `usuario` com papel base `MASTER`, pessoas e e-mails distintos, a intenção idempotente assinada, o executor nominal, os revisores, os instantes e a versão de concorrência. Para cada membro, persiste `estado_membro` com o domínio fechado `PENDENTE_PRIMEIRO_ACESSO`, `PRONTO_AGUARDANDO_PAR` ou `ATIVADO_CONJUNTAMENTE`; o agregado persiste `estado_bootstrap` igual a `ABERTO` ou `CONSUMIDO`.

O fluxo vinculante é:

1. uma única transação de segurança cria o agregado e exatamente os dois usuários em `PENDENTE_PRIMEIRO_ACESSO`, com credenciais próprias de primeiro acesso e sem sessão operacional;
2. cada pessoa conclui a própria senha, configura o próprio TOTP e recebe a própria série de recuperação; esse commit muda somente seu membro para `PRONTO_AGUARDANDO_PAR` e encerra a sessão restrita;
3. enquanto o outro membro não estiver pronto, `master_apto` permanece falso e qualquer nova entrada continua restrita ao estado do bootstrap, sem escopo global ou empresarial;
4. quando o segundo membro fica pronto, a mesma transação bloqueia o singleton e os dois usuários, valida novamente ambos e muda os dois membros para `ATIVADO_CONJUNTAMENTE`, o agregado para `CONSUMIDO`, incrementa as revisões de autorização e revoga toda sessão parcial; somente um novo login poderá gerar acesso operacional;
5. falha antes do commit integral preserva o último estado confirmado, sem ativar apenas um master; repetição reconcilia a intenção, e concorrência possui um único finalizador;
6. depois de `CONSUMIDO`, nenhuma nova invocação, recriação, alteração de membros ou reabertura é aceita; permanece somente a evidência auditável, sem conta, senha ou rota residual.

O primeiro membro pronto pode aguardar o par, mas não pode promover a si mesmo, criar empresa, entrar no escopo global nem usar a contingência ordinária de masters. Nenhum operador técnico configura senha, TOTP ou recuperação em nome dos titulares.

---

# 13. Usuários, perfis, permissões e autorização de incidente

## 13.1 Catálogo de entidades

| ID | Entidade | Escopo | Finalidade | Chave e unicidade | Ciclo | Regras 17 |
|---|---|---|---|---|---|---|
| ENT-ACL-01 | `recurso_autorizacao` | Global administrativo | Catálogo de módulo, tela, ação, campo, documento e exportação. | Código único e estável. | Gerenciado por versão do sistema. | B03-PRF-01 a B03-PRF-10 |
| ENT-ACL-02 | `dependencia_recurso` | Global administrativo | Dependências como editar→ver e exportar→ver. | Recurso origem+recurso exigido únicos. | Catálogo técnico. | B03-PRF-03, B03-PRF-04 |
| ENT-ACL-03 | `perfil` | Empresarial ou global | Identidade estável de perfil empresarial, global ou modelo. | Nome normalizado único dentro de escopo+tipo. | Não excluível. | B03-PRF-01 a B03-PRF-10 |
| ENT-ACL-04 | `perfil_versao` | Mesmo escopo do perfil | Nome, descrição, situação e versão autorizativa. | Perfil+número únicos; uma atual. | Imutável. | B03-PRF-02, B03-PRF-07 a B03-PRF-10 |
| ENT-ACL-05 | `perfil_permissao_acao` | Mesmo escopo do perfil | Permissão explícita de tela/ação/documento/exportação. | Perfil versão+recurso únicos. | Snapshot da versão. | B03-PRF-03, B03-PRF-04 |
| ENT-ACL-06 | `perfil_permissao_campo` | Mesmo escopo do perfil | Estado `oculto`, `mascarado`, leitura ou edição. | Perfil versão+campo únicos. | Snapshot da versão. | B03-PRF-03, B03-PRF-04 |
| ENT-ACL-07 | `usuario_empresa_perfil` | Empresarial | Associação do usuário comum a exatamente um perfil da empresa. | Uma associação vigente por usuário+empresa. | Versionada/removível sem exclusão. | B03-USR-12 a B03-USR-14 |
| ENT-ACL-08 | `usuario_perfil_global` | Global administrativo | Funções globais comuns autorizadas. | Uma versão atual por usuário; no máximo uma vigente. | Versões imutáveis e append-only. | B03-USR-15, B03-USR-16 |
| ENT-ACL-09 | `autorizacao_incidente` | Restrito de incidente | Permissões cumulativas e responsabilidade nominal. | Uma versão atual por usuário. | Versões imutáveis e revogáveis. | B03-INC-01 a B03-INC-05, INC-* |
| ENT-ACL-10 | `migracao_perfil` | Empresarial/global | Controla substituição segura de perfil arquivado. | Perfil origem+perfil destino+operação. | Append-only operacional. | B03-PRF-07, B03-PRF-11 |
| ENT-ACL-11 | `contingencia_master` | Global crítico | Registra a exceção controlada durante recuperação de TOTP de um dos dois masters aptos. | No máximo uma aberta; operação única. | Append-only, concluível. | B03-MST-05 a B03-MST-07 |

## 13.2 Catálogo de recurso

| Campo | Tipo | Regra |
|---|---|---|
| `recurso_codigo` | `codigo` | Estável e único. |
| `tipo_recurso` | `codigo` | `MODULO`, `TELA`, `ACAO`, `CAMPO`, `DOCUMENTO` ou `EXPORTACAO`. |
| `recurso_pai_id` | `id` | Hierarquia visual/funcional; não concede por herança implícita. |
| `escopo_permitido` | `codigo` | Empresarial, global ou restrito. |
| `sensibilidade` | `codigo` | Pública interna, cadastral, financeira, clínica, crítica ou segredo. |
| `estrategia_mascara` | `codigo` | Obrigatória somente para campo mascarável. |
| `ativo` | `booleano` | Recurso novo nasce negado em todos os perfis. |

Ausência de permissão significa negar. Um perfil não recebe automaticamente recurso novo.

## 13.3 Perfil e permissões

`perfil` possui somente identidade, `tipo_perfil` (`EMPRESARIAL`, `GLOBAL` ou `MODELO_EMPRESARIAL`), `empresa_id` obrigatório no empresarial, `versao_atual_id` e `versao_lock`. Nome, descrição e situação pertencem exclusivamente a `perfil_versao`. Perfil copiado de um modelo ganha identidade própria e não herda mudanças futuras silenciosamente.

`perfil_permissao_acao` guarda `permitido`. `perfil_permissao_campo` guarda exatamente um estado:

```text
OCULTO
MASCARADO
VISIVEL_SEM_EDICAO
VISIVEL_E_EDITAVEL
```

Regras cumulativas:

- edição exige visualização;
- criação exige acesso de edição a todos os campos obrigatórios;
- exportação exige a ação e a visibilidade de cada coluna;
- histórico antes/depois exige permissão atual do campo;
- campo oculto não chega ao navegador, filtro, total, notificação ou arquivo;
- campo mascarado nunca vira editável pelo simples fato de a tela ser editável;
- não existem exceções individuais de permissão na primeira versão.

## 13.4 Associação empresarial

| Campo | Tipo | Obrigatório | Regra |
|---|---|---|---|
| `usuario_empresa_perfil_id` | `id` | Sim | PK. |
| `usuario_id` | `id` | Sim | Deve ser usuário comum. |
| `empresa_id` | `id` | Sim | Empresa do perfil. |
| `perfil_id` | `id` | Sim | FK composta com a mesma empresa. |
| `situacao` | `codigo` | Sim | `VIGENTE` ou `REMOVIDA`; ausência é raiz, não código persistido. |
| `inicio_em` / `fim_em` | `instante` | Sim/condicional | Intervalo administrativo. |
| `versao_lock` | `versao` | Sim | Concorrência. |

Master apto não precisa dessas linhas para acessar empresas, mas continua obrigado a selecionar uma delas. Rebaixar master não restaura perfil antigo automaticamente.

## 13.5 Associação de perfil global

Cada linha de `usuario_perfil_global` é uma versão imutável da associação global do usuário comum:

| Campo | Tipo | Obrigatório | Regra |
|---|---|---|---|
| `usuario_perfil_global_id` | `id` | Sim | PK da versão. |
| `usuario_id` | `id` | Sim | Deve ser usuário comum. |
| `perfil_id` | `id` | Condicional | Obrigatório quando `VIGENTE`; perfil do tipo `GLOBAL`. |
| `situacao` | `codigo` | Sim | `VIGENTE` ou `REMOVIDA`. |
| `numero_versao` | `versao` | Sim | Crescente por usuário. |
| `versao_anterior_id` | `id` | Condicional | Predecessora do mesmo usuário. |
| `eh_atual` | `booleano` | Sim | No máximo uma versão atual; existindo histórico para o usuário, exatamente uma das versões é atual. |
| `inicio_em` / `fim_em` | `instante` | Sim/condicional | Intervalo administrativo da versão; sem ativação futura automática. |
| `justificativa` | `texto_longo` | Condicional | Obrigatória em redução, troca ou retirada. |
| `criado_em` / `criado_por_usuario_id` | `instante` / `id` | Sim | Prova administrativa. |

Atribuir, trocar ou retirar perfil global cria outra versão e incrementa a revisão de autorização do usuário. Perfil global não substitui associação empresarial, não concede dados empresariais conjuntos e não é restaurado silenciosamente depois de uma retirada.

## 13.6 Autorização de incidente

| Campo | Tipo | Obrigatório | Regra |
|---|---|---|---|
| `autorizacao_incidente_id` | `id` | Sim | PK da versão restrita. |
| `usuario_id` | `id` | Sim | Usuário comum ou master autorizado explicitamente. |
| `numero_versao` | `versao` | Sim | Crescente por usuário. |
| `versao_anterior_id` | `id` | Condicional | Predecessora do mesmo usuário. |
| `eh_atual` | `booleano` | Sim | No máximo uma versão atual; existindo histórico para o usuário, exatamente uma das versões é atual. |
| `pode_registrar` | `booleano` | Sim | Independente das permissões de consulta. |
| `pode_consultar` | `booleano` | Sim | Necessário para conhecer incidentes. |
| `pode_acompanhar` | `booleano` | Sim | Exige `pode_consultar`. |
| `pode_concluir_reabrir` | `booleano` | Sim | Exige consultar e acompanhar. |
| `funcao_nominal` | `codigo` | Condicional | `RESPONSAVEL` ou `SUBSTITUTO` quando vigente. |
| `situacao` | `codigo` | Sim | `VIGENTE` ou `REVOGADA`. |
| `justificativa` | `texto_longo` | Sim | Obrigatória para concessão crítica, alteração, redução ou revogação. |
| `criado_em` / `criado_por_usuario_id` | `instante` / `id` | Sim | Prova administrativa. |

Designar, alterar, revogar ou reautorizar cria uma nova versão imutável. Papel master não concede esses valores. A autorização restrita também não concede acesso a empregados, salários, ASOs ou empresas mencionadas.

## 13.7 Contingência de masters

`master_apto` é a projeção da conjunção: usuário ativo, não bloqueado administrativamente, primeiro acesso concluído, senha definitiva vigente, TOTP configurado e nenhuma redefinição exigida. Para um dos dois membros de `bootstrap_master_inicial`, soma-se obrigatoriamente a condição de o agregado estar `CONSUMIDO` e ambos os membros estarem `ATIVADO_CONJUNTAMENTE`; antes desse commit conjunto, `master_apto` é falso mesmo que a senha e o TOTP individuais já estejam válidos. Toda promoção, ativação conjunta, inativação, bloqueio, rebaixamento ou reset relevante bloqueia/revalida o conjunto de masters na mesma transação.

Depois que o bootstrap é consumido, o mínimo normal é dois masters aptos. A única exceção operacional é a contingência formal aprovada, registrada com início, executor, master afetado, justificativa e conclusão. O período anterior ao consumo não é contingência: é formação inicial fechada, com exatamente dois membros ainda sem aptidão ou acesso operacional, regida pela seção 12.6.

Para que o eixo de papel sistêmico seja exclusivo, aplica-se esta precedência: papel `COMUM`; master bloqueado/inativo ou inelegível em `MASTER_NAO_APTO`; membro do bootstrap já pronto, mas ainda sem commit conjunto, em `MASTER_BOOTSTRAP_PRONTO_AGUARDANDO_PAR`; master com redefinição exigida em `MASTER_RECONFIGURACAO_TOTP`; master ainda sem TOTP em `MASTER_TOTP_PENDENTE`; e `MASTER_APTO` somente quando toda a conjunção — inclusive a barreira conjunta do bootstrap, quando aplicável — for verdadeira. `MASTER_NAO_APTO` é uma classificação técnica derivada, não um terceiro papel administrativo nem uma nova forma de bloqueio.

`contingencia_master` contém ainda autorização curta relacionada, versão de autorização anterior, impacto confirmado, instante limite operacional e responsável pela conclusão. Ela só pode abrir quando existem exatamente dois masters aptos e o reset controlado reduz temporariamente esse total para um; qualquer outra redução permanece bloqueada. Conclusão exige TOTP novo configurado e master novamente apto.

A contingência referencia obrigatoriamente um executor master diferente do afetado e uma única `autorizacao_curta`. A autorização pertence ao afetado, à finalidade de recuperação e àquela contingência; seu consumo e a conclusão ocorrem atomicamente. Nenhuma autorização pode ser reutilizada em outra contingência.

## 13.8 Migração de associação de perfil

`migracao_perfil` registra a substituição concluída de um perfil arquivado por outro ativo. Cada registro contém:

| Campo | Tipo | Obrigatório | Regra |
|---|---|---|---|
| `migracao_perfil_id` | `id` | Sim | PK append-only. |
| `usuario_id` | `id` | Sim | Usuário cuja associação foi migrada. |
| `usuario_empresa_perfil_id` | `id` | Condicional | Preenchido somente na migração empresarial. |
| `usuario_perfil_global_id` | `id` | Condicional | Preenchido somente na migração global. |
| `perfil_origem_id` / `perfil_destino_id` | `id` | Sim | Mesmo tipo/escopo; no empresarial, mesma empresa. |
| `operacao_idempotente_id` | `id` | Sim | Uma migração confirmada por intenção. |
| `justificativa` | `texto_longo` | Sim | Motivo e impacto revistos. |
| `concluida_em` / `concluida_por_usuario_id` | `instante` / `id` | Sim | Commit atômico da troca. |

Exatamente uma das duas associações é preenchida. A migração, a nova versão da associação, a revisão de autorização, a revogação do acesso anterior e a auditoria concluem na mesma transação; falha não deixa migração aberta ou associação parcial.

---

# 14. Pessoa empresarial e vínculo empregado

## 14.1 Catálogo de entidades

| ID | Entidade | Escopo | Finalidade | Chave e unicidade | Ciclo | Regras 17 |
|---|---|---|---|---|---|---|
| ENT-COL-01 | `pessoa_empresa` | Empresarial | Identidade estável da pessoa dentro do CNPJ. | PK; CPF atual único por empresa. | Raiz não excluível. | B04-VIN-01 a B04-VIN-05 |
| ENT-COL-02 | `pessoa_empresa_versao` | Empresarial | Nome, CPF e endereço completo de cada versão. | Pessoa+número únicos; uma atual. | Imutável. | B04-VIN-04, B04-VIN-05 |
| ENT-COL-03 | `vinculo_empregado` | Empresarial | Episódio contratual independente, inclusive recontratação. | PK; períodos da pessoa sem sobreposição. | Raiz não excluível. | B04-VIN-01 a B04-VIN-10 |
| ENT-COL-04 | `vinculo_empregado_versao` | Empresarial | Datas de início e admissão de cada versão. | Vínculo+número únicos; uma atual. | Imutável. | B04-VIN-07 a B04-VIN-09 |

O desligamento é entidade própria da seção 21. O vínculo não possui botão ou campo de inativação manual.

## 14.2 Pessoa e endereço

| Campo | Tipo | Obrigatório | Regra | Sensibilidade |
|---|---|---|---|---|
| `pessoa_empresa_id` | `id` | Sim | Identidade técnica; nunca compartilhada entre empresas. | Interna |
| `empresa_id` | `id` | Sim | Proprietária. | Interna |
| `cpf_busca_segura` | `indice_busca_segura` | Sim | Único junto com `empresa_id`; calculado do CPF normalizado com chave apropriada. | Restrita cadastral |
| `versao_atual_id` | `id` | Sim | Mesma pessoa e empresa. | Interna |
| `versao_lock` | `versao` | Sim | Concorrência. | Técnica |

`pessoa_empresa_versao` contém:

- `nome_completo` obrigatório;
- `cpf_protegido` obrigatório, do tipo `dado_protegido`;
- `cpf_busca_segura` obrigatório, idêntico ao índice da raiz para aquela versão;
- `cep`, `logradouro`, `numero`, `bairro`, `municipio` e `uf` obrigatórios;
- `complemento` opcional;
- `origem_endereco` como `CEP` ou `MANUAL`, apenas informativa;
- motivo, justificativa, autor e instante quando houver correção.

Falha na busca de CEP não impede o preenchimento manual. O sistema não guarda uma cópia global da consulta de CEP.

O CPF em claro existe somente durante entrada ou apresentação autorizada. Busca, unicidade e recontratação usam `empresa_id + cpf_busca_segura`; versões e snapshots que precisem reproduzi-lo guardam o valor protegido, nunca uma coluna normalizada pesquisável em claro.

## 14.3 Vínculo

| Campo | Tipo | Obrigatório | Regra |
|---|---|---|---|
| `vinculo_empregado_id` | `id` | Sim | Identidade do episódio. |
| `empresa_id` | `id` | Sim | Igual ao da pessoa. |
| `pessoa_empresa_id` | `id` | Sim | FK composta na mesma empresa. |
| `versao_atual_id` | `id` | Sim | Versão vigente das datas. |
| `ordem_recontratacao` | `inteiro` | Sim | Crescente por pessoa; não é identificador público. |
| `versao_lock` | `versao` | Sim | Concorrência. |

`vinculo_empregado_versao` contém `data_inicio_atividades` obrigatória e `data_admissao` opcional. Admissão nunca antecede o início. Uma admissão futura permanece programada; a condição `registrado formalmente` só passa a valer quando a data for alcançada.

## 14.4 Projeções e intervalos

- situação temporal vem do início e do desligamento vigente;
- condição de registro vem da admissão e da data operacional;
- tipo de encerramento vem do ciclo de desligamento;
- recontratação cria novo vínculo depois do fim inclusivo do anterior;
- o mesmo vínculo não pode ser simultaneamente encerrado sem registro e demitido formalmente;
- condições financeiras pertencem ao vínculo e não são copiadas para a recontratação.

Para impedir sobreposição, a implementação usará restrição de intervalo no banco quando disponível ou validação transacional serializada sobre todos os vínculos da pessoa.

---

# 15. Prestador, contrato, renovação e vigências MEI

## 15.1 Catálogo de entidades

| ID | Entidade | Escopo | Finalidade | Chave e unicidade | Ciclo | Regras 17 |
|---|---|---|---|---|---|---|
| ENT-MEI-01 | `prestador_mei` | Empresarial | Identidade estável do CNPJ MEI dentro da contratante. | PK; CNPJ atual único por empresa. | Raiz não excluível. | B05-MEI-01 a B05-MEI-05 |
| ENT-MEI-02 | `prestador_mei_versao` | Empresarial | Cadastro e contato de cada versão. | Prestador+número únicos; uma atual. | Imutável. | B05-MEI-04, B05-MEI-05 |
| ENT-MEI-03 | `contrato_mei` | Empresarial | Episódio contínuo de contratação. | PK; contratos do prestador sem sobreposição. | Raiz não excluível. | B05-CON-01 a B05-CON-12 |
| ENT-MEI-04 | `contrato_mei_versao` | Empresarial | Correções de início e encerramento efetivo do episódio. | Contrato+número únicos; uma atual. | Imutável. | B05-CON-06 a B05-CON-06D |
| ENT-MEI-05 | `vigencia_contrato_mei` | Empresarial | Identidade estável de cada período contratado/renovado. | Contrato+sequência únicos. | Raiz versionada. | B05-CON-02 a B05-CON-11 |
| ENT-MEI-06 | `vigencia_contrato_mei_versao` | Empresarial | Datas, valor mensal e forma de pagamento de cada versão. | Vigência+número únicos; uma atual. | Append-only. | B05-CON-02 a B05-CON-11 |
| ENT-MEI-07 | `renovacao_contrato_mei` | Empresarial | Liga a vigência corrente à próxima vigência contínua programada/iniciada. | Uma renovação por vigência de origem e uma origem por destino. | Raiz de ciclo não excluível. | B05-CON-02 a B05-CON-04 |

Serviço adicional pertence somente à competência e será detalhado nas seções financeiras.

## 15.2 Prestador MEI

| Campo | Tipo | Obrigatório | Regra | Sensibilidade |
|---|---|---|---|---|
| `prestador_mei_id` | `id` | Sim | Identidade por empresa. | Interna |
| `empresa_id` | `id` | Sim | Contratante. | Interna |
| `cnpj_atual_normalizado` | `cnpj` | Sim | Único na empresa. | Cadastral |
| `versao_atual_id` | `id` | Sim | Versão do mesmo prestador. | Interna |

Cada versão contém razão social, nome fantasia, CNPJ e endereço completo obrigatório até o CEP. Telefone e e-mail são opcionais. Correção de CNPJ exige permissão específica, justificativa e unicidade revalidada.

## 15.3 Contrato e vigência

| Campo | Tipo | Obrigatório | Regra |
|---|---|---|---|
| `contrato_mei_id` | `id` | Sim | Identidade do episódio contínuo. |
| `empresa_id` | `id` | Sim | Igual ao prestador. |
| `prestador_mei_id` | `id` | Sim | FK composta na mesma empresa. |
| `versao_atual_id` | `id` | Sim | Versão cadastral do contrato. |
| `versao_lock` | `versao` | Sim | Concorrência. |

`contrato_mei_versao` é a única fonte de `data_inicio_original` e `data_encerramento_efetivo`, além de número, predecessor, motivo, justificativa, autor e instante. A raiz nunca duplica essas datas. A versão atual determina o fim efetivo; versões antigas permanecem históricas.

`vigencia_contrato_mei` contém somente empresa, contrato, sequência, `versao_atual_id` e `versao_lock`. Cada `vigencia_contrato_mei_versao` contém:

| Campo | Tipo | Obrigatório | Regra |
|---|---|---|---|
| `vigencia_contrato_mei_versao_id` | `id` | Sim | PK imutável. |
| `vigencia_contrato_mei_id` / `empresa_id` | `id` | Sim | Mesma raiz e empresa. |
| `data_inicio` | `data` | Sim | Renovação começa no dia seguinte ao fim anterior. |
| `data_final_prevista` | `data` | Sim | Inclusiva e não anterior ao início. |
| `valor_mensal` | `moeda` | Sim | Maior que zero. |
| `quantidade_parcelas` | `inteiro` | Sim | 1 ou 2. |
| `evento_parcela_unica` | `codigo` | Condicional | Adiantamento ou final quando houver uma parcela. |
| `percentual_adiantamento` | `percentual` | Condicional | Maior que 0 e menor que 100 quando houver duas. |
| `numero_versao` | `versao` | Sim | Edição futura cria nova versão lógica. |
| `versao_anterior_id` | `id` | Condicional | Correção da mesma vigência; não representa renovação. |

`renovacao_contrato_mei` liga `vigencia_origem_id` e `vigencia_destino_id` do mesmo contrato e empresa, com estado persistido `PROGRAMADA` ou `INICIADA`, programação/início, autor e operação idempotente. `NAO_PROGRAMADA` é a ausência derivada dessa entidade. A versão atual do destino deve começar no dia seguinte ao fim previsto atual da origem. Iniciar preserva o registro e não o reutiliza para outra renovação.

A não sobreposição considera somente as versões atuais efetivas das vigências. Versões históricas corrigidas podem repetir o intervalo de sua sucessora e nunca entram juntas no cálculo. Renovação de negócio usa `renovacao_contrato_mei`; correção usa `versao_anterior_id` dentro da mesma vigência.

Renovação contínua permanece no mesmo contrato e não reaplica o corte de entrada. Retorno depois de interrupção cria outro contrato e reaplica o corte.

A primeira e a última competência do contrato usam `valor_mensal ÷ 30 × D30(período ativo)`; competências intermediárias usam o valor integral. Na primeira competência, início entre os dias 1 e 15 permite o adiantamento configurado; início no dia 16 ou depois leva toda a base proporcional ao pagamento final. Na última competência, se `fim_aplicavel <= data_prevista_adiantamento` e não existe pagamento efetivo da base no adiantamento, o valor devido no grupo de adiantamento MEI é zero, toda a base proporcional é encaminhada ao pagamento final, o grupo zero fica elegível a `NAO_APLICAVEL` e nenhum pagamento/recibo de adiantamento pode ser criado. Caso contrário, o final deduz somente o adiantamento da própria base que tiver sido efetivamente pago; eventual excedente absorvido nunca reduz serviço adicional.

## 15.4 Proibições estruturais do MEI

Nenhuma FK do MEI pode apontar para salário-base, RA, holerite/K06, salário redondo, complemento trabalhista, ASO, rescisão ou nota fiscal. O contrato usa apenas valor mensal, serviço adicional avulso da competência, pagamento e recibo próprios.

---

# 16. Condições financeiras do empregado e do MEI

## 16.1 Catálogo de entidades

| ID | Entidade | Escopo | Finalidade | Chave e unicidade | Ciclo | Regras 17 |
|---|---|---|---|---|---|---|
| ENT-FIN-01 | `percentual_adiantamento_empresa_vigencia` | Empresarial | Histórico do padrão empresarial. | Empresa+intervalo sem sobreposição. | Temporal versionada. | B06-FIN-04 a B06-FIN-08 |
| ENT-FIN-02 | `salario_base_vigencia` | Empresarial | Salário oficial mensal do holerite para controle interno. | Vínculo+intervalo sem sobreposição. | Temporal versionada. | B06-FIN-01 a B06-FIN-03 |
| ENT-FIN-03 | `excecao_adiantamento_vigencia` | Empresarial | Percentual excepcional do vínculo. | Vínculo+intervalo sem sobreposição. | Temporal versionada. | B06-FIN-04 a B06-FIN-08 |
| ENT-FIN-04 | `remuneracao_adicional` | Empresarial | Identidade estável da RA do vínculo. | No máximo uma identidade corrente por vínculo. | Raiz preservada. | B06-RA-01 a B06-RA-06 |
| ENT-FIN-05 | `remuneracao_adicional_vigencia` | Empresarial | Valor e distribuição mensal da RA. | RA+intervalo sem sobreposição. | Temporal versionada. | B06-RA-01 a B06-RA-06 |
| ENT-FIN-06 | `salario_redondo_vigencia` | Empresarial | Marcador que exige informar reembolso real por evento. | Vínculo+intervalo sem sobreposição. | Temporal versionada. | B06-REB-01 a B06-REB-05 |
| ENT-FIN-07 | `complemento_recorrente` | Empresarial | Identidade e descrição estável de cada complemento. | PK; vários por vínculo. | Raiz preservada. | B06-CMP-01 a B06-CMP-04 |
| ENT-FIN-08 | `complemento_recorrente_vigencia` | Empresarial | Valor, competências e distribuição do complemento. | Complemento+intervalo sem sobreposição. | Temporal versionada. | B06-CMP-01 a B06-CMP-04 |
| ENT-FIN-09 | `base_periodo_sem_registro_vigencia` | Empresarial | Base mensal própria do PSR, separada de salário e RA. | Vínculo+intervalo sem sobreposição. | Temporal versionada. | B06-PSR-01 a B06-PSR-08 |
| ENT-FIN-10 | `complemento_avulso_competencia` | Empresarial | Complemento exclusivo de uma competência. | PK; múltiplos por vínculo+competência. | Versionado até pagamento. | B06-CMP-05 a B06-CMP-08 |
| ENT-FIN-11 | `servico_adicional_mei_competencia` | Empresarial | Serviço extra do MEI, somente no final. | PK; múltiplos por contrato+competência. | Versionado até pagamento. | B05-CON-10/11, G08-15 |
| ENT-FIN-12 | `reembolso_evento` | Empresarial | Situação informacional do salário redondo em cada evento. | Participante empregado+competência+evento únicos. | Versionado; pago preservado. | B06-REB-03 a B06-REB-05 |
| ENT-FIN-13 | `reembolso_evento_item` | Empresarial | Valores reais por categoria. | Reembolso versão+categoria únicos. | Imutável por versão. | B06-REB-03 a B06-REB-05 |
| ENT-FIN-14 | `linha_psr_competencia` | Empresarial | Linha proporcional do período sem registro em cada mês. | Vínculo+competência únicos. | Calculada/versionada. | B06-PSR-02 a B06-PSR-06 |
| ENT-FIN-15 | `reembolso_evento_versao` | Empresarial | Estado e conjunto versionado dos valores reais/zero por evento. | Reembolso+número únicos; uma atual. | Append-only; itens imutáveis. | B06-REB-03 a B06-REB-05 |

## 16.2 Padrão de vigência financeira

Cada entidade marcada `Temporal versionada` representa logicamente uma raiz estável e suas versões imutáveis. A raiz guarda `condicao_id`, empresa, proprietário tipado, `versao_atual_id` e `versao_lock`; datas e valores pertencem somente à versão. As versões usam:

| Campo | Tipo | Regra |
|---|---|---|
| `inicio_competencia` | `competencia` | Primeira competência devida. |
| `fim_competencia` | `competencia` | Última inclusiva; opcional. |
| `valor_mensal` | `moeda` | Maior que zero quando aplicável. |
| `numero_versao` | `versao` | Crescente por condição. |
| `versao_anterior_id` | `id` | Liga a versão corrigida da mesma identidade quando houver. |
| `motivo` / `justificativa` | `codigo` / `texto_longo` | Condicionais conforme impacto. |

Não há duas **versões atuais efetivas** do mesmo tipo/proprietário cobrindo a mesma competência. Uma versão histórica pode repetir o intervalo de sua sucessora porque deixou de ser efetiva; apenas a versão apontada por cada raiz entra na verificação e no cálculo. Quando uma nova condição de negócio começa, cria-se outra raiz/intervalo; quando se corrige a mesma condição, cria-se `versao_anterior_id` sob a mesma raiz. Alteração retroativa que alcance pagamento ou competência fechada não reescreve o passado; abre F04.

Cada ID ENT-FIN marcado `Temporal versionada` cataloga um **agregado lógico único** composto por raiz e versões. O Documento 19 deverá nomear ambas as estruturas físicas com rastreabilidade ao mesmo ENT-FIN (por exemplo, sufixos `_raiz` e `_versao`); nenhuma tabela de versão pode surgir anônima ou com fonte concorrente.

## 16.3 Salário-base, percentual e total acordado

`salario_base_vigencia.valor_mensal` é o salário oficial do holerite. Alterá-lo serve ao controle interno; qualquer diferença oficial continua no líquido do contador.

O percentual aplicável é a exceção individual vigente, se existir; caso contrário, o padrão da empresa. `salario_total_acordado` não é campo: é `salário-base + RA vigente`, projetado para exibição.

## 16.4 Remuneração adicional

| Campo | Tipo | Obrigatório | Regra |
|---|---|---|---|
| `valor_mensal` | `moeda` | Sim | Valor fixo positivo fora do holerite. |
| `inicio_competencia` | `competencia` | Sim | A primeira competência usa a data de início das atividades para proporcionalidade. |
| `fim_competencia` | `competencia` | Opcional | Última integral, salvo proporcionalidade do desligamento. |
| `quantidade_parcelas` | `inteiro` | Sim | 1 ou 2. |
| `evento_parcela_unica` | `codigo` | Condicional | Adiantamento ou final quando uma. |
| `percentual_adiantamento` | `percentual` | Condicional | Maior que 0 e menor que 100 quando duas. |

Uma RA criada após o adiantamento pago segue integralmente ao pagamento final da competência aberta. No desligamento, somente valores da própria RA podem ser deduzidos do acerto de RA.

## 16.5 Salário redondo e reembolso

`salario_redondo_vigencia` guarda apenas o marcador e seu intervalo. Quando aplicável, cada evento exige `reembolso_evento` em um dos estados:

- pendente de informação;
- valores reais informados;
- zero confirmado.

`reembolso_evento` é a raiz e guarda empresa, participante empregado, competência, evento, `versao_atual_id` e `versao_lock`. Cada `reembolso_evento_versao` guarda:

| Campo | Tipo | Obrigatório | Regra |
|---|---|---|---|
| `reembolso_evento_versao_id` / `reembolso_evento_id` | `id` | Sim | Versão e raiz da mesma empresa. |
| `numero_versao` | `versao` | Sim | Crescente por raiz. |
| `estado` | `codigo` | Sim | `PENDENTE_INFORMACAO`, `VALORES_REAIS_INFORMADOS` ou `ZERO_CONFIRMADO`. |
| `valor_total` | `moeda` | Sim | Soma dos itens; zero nos estados pendente/zero confirmado. |
| `versao_anterior_id` | `id` | Condicional | Predecessora imutável da mesma raiz. |
| `criado_em` / `criado_por_usuario_id` | `instante` / `id` | Sim | Confirmação administrativa da versão. |

Cada `reembolso_evento_item` aponta obrigatoriamente para `reembolso_evento_versao_id`. Itens aceitam categorias `INSS`, `IR`, `SINDICATO` e `OUTRO`, descrição obrigatória somente para outro e valor não negativo. O sistema não calcula imposto, alíquota governamental ou contribuição sindical. Zero confirmado não pode coexistir com item positivo. Substituir valores, confirmar zero ou reabrir informação cria outra versão e outro conjunto de itens; pagamentos, componentes e F04 preservam a versão exata que utilizaram.

Reembolso pode existir no adiantamento e no final. Ele integra o grupo `RA e reembolso`, mas nunca compensa silenciosamente a RA.

## 16.6 Complementos

Complemento recorrente:

- possui descrição e identidade próprias;
- aceita prazo determinado ou indeterminado;
- é integral em cada competência aplicável;
- aceita uma parcela no evento escolhido ou duas pelo percentual informado;
- pode coexistir com outros complementos;
- encerrar mantém o valor integral até a última competência inclusiva.

Complemento avulso:

- pertence a uma única competência e vínculo;
- aceita múltiplas linhas;
- guarda descrição, valor e distribuição;
- não cria recorrência;
- depois de adiantamento pago, novo avulso devido segue ao final;
- depois do final pago, segue para ajuste positivo.

## 16.7 Período sem registro

`base_periodo_sem_registro_vigencia` é independente de salário-base e RA. Ela representa o valor mensal acordado antes da formalização. `linha_psr_competencia` guarda:

- competência;
- início inclusivo na competência;
- fim inclusivo provisório ou definitivo;
- posições D30 atribuídas;
- base mensal e valor proporcional;
- memória de cálculo/versionamento.

A versão da base guarda também as decisões humanas aprovadas:

| Campo | Tipo | Obrigatório | Regra |
|---|---|---|---|
| `modo_pagamento` | `codigo` | Sim | `DIVIDIDO` ou `SOMENTE_FINAL`. |
| `dias_fora_oficial_confirmados` | `booleano` | Sim | Deve ser verdadeiro para confirmar a base. |
| `confirmado_em` / `confirmado_por_usuario_id` | `instante` / `id` | Sim | Prova de quem confirmou que os dias não estão no oficial. |

Quando o modo é `DIVIDIDO`, cada `linha_psr_competencia` guarda `percentual_adiantamento_aplicado` e a versão exata do padrão empresarial ou da exceção individual que o forneceu; o saldo segue ao pagamento final. `SOMENTE_FINAL` destina 100% ao final. A primeira competência continua sujeita ao corte de entrada: início das atividades entre os dias 1 e 15 permite adiantamento proporcional; início no dia 16 ou depois leva todo o valor proporcional ao pagamento final, sem apagar a escolha versionada.

O limite final é o primeiro entre dia anterior à admissão, saída sem registro e fim da competência. RA, complemento e reembolso não entram nessa linha.

## 16.8 Serviço adicional MEI

`servico_adicional_mei_competencia` possui contrato, competência, descrição e valor positivo. É sempre avulso, integral e exclusivo do pagamento final. Não existe configuração recorrente, percentual, nota fiscal ou dedução do adiantamento da base contratual.

---

# 17. Competência, participante, K06 e saldo inicial

## 17.1 Catálogo de entidades

| ID | Entidade | Escopo | Finalidade | Chave e unicidade | Ciclo | Regras 17 |
|---|---|---|---|---|---|---|
| ENT-CPT-01 | `competencia` | Empresarial | Identidade estável de um mês financeiro. | Empresa+mês únicos. | Raiz versionada. | K07-01 a K07-14, D12-15/16 |
| ENT-CPT-02 | `competencia_versao` | Empresarial | Snapshot de estado, datas previstas, fechamento e reabertura. | Competência+número únicos; uma atual. | Append-only. | K07-03 a K07-14, C10-04 |
| ENT-CPT-03 | `participante_financeiro` | Empresarial | Supertipo de vínculo empregado ou contrato MEI. | Uma identidade por vínculo ou contrato. | Raiz estável. | G08-01, K07-03, P09-06 |
| ENT-CPT-04 | `competencia_participante` | Empresarial | Materializa a participação em uma competência. | Competência+participante únicos. | Append-only operacional. | K07-01, K07-03, G08-01 |
| ENT-CPT-05 | `liquido_contador_k06` | Empresarial | Identidade da entrada líquida oficial por empregado/mês. | Competência+participante empregado únicos. | Raiz versionada. | P09-00A a P09-04 |
| ENT-CPT-06 | `liquido_contador_k06_versao` | Empresarial | Cada valor e confirmação informados. | K06+número únicos. | Append-only. | P09-01 a P09-04, C10-18 |
| ENT-CPT-07 | `saldo_inicial_implantacao` | Empresarial | Pagamento real anterior à implantação necessário aos saldos. | Participante+grupo+evento únicos na implantação. | Raiz exclusiva da implantação. | P09-14 a P09-15 |
| ENT-CPT-08 | `saldo_inicial_implantacao_versao` | Empresarial | Correções do saldo inicial sem competência/recibo fictício. | Saldo+número únicos. | Append-only. | P09-14A |

## 17.2 Competência e versões

### ENT-CPT-01 — `competencia`

| Campo | Tipo | Obrigatório | Regra |
|---|---|---|---|
| `competencia_id` | `id` | Sim | Identidade imutável. |
| `empresa_id` | `id` | Sim | Empresa proprietária. |
| `competencia_mes` | `competencia` | Sim | Primeiro dia do mês; imutável depois da criação. |
| `versao_atual_id` | `id` | Sim | FK para versão da mesma competência. |
| `versao_lock` | `versao` | Sim | Concorrência otimista. |
| `criado_em` / `criado_por_usuario_id` | `instante` / `id` | Sim | Momento e executor autorizados. |

### ENT-CPT-02 — `competencia_versao`

| Campo | Tipo | Obrigatório | Regra |
|---|---|---|---|
| `competencia_versao_id` | `id` | Sim | PK imutável. |
| `empresa_id` / `competencia_id` | `id` | Sim | FK composta para a mesma empresa. |
| `numero_versao` | `versao` | Sim | Crescente e sem reutilização. |
| `estado_competencia` | `codigo` | Sim | `EM_PREPARACAO`, `AGUARDANDO_HOLERITES`, `EM_CONFERENCIA`, `FECHADA` ou `REABERTA`. |
| `data_prevista_adiantamento` | `data` | Sim | Planejamento; não prova pagamento. |
| `data_prevista_pagamento_final` | `data` | Sim | Pode pertencer ao mês seguinte. |
| `versao_anterior_id` | `id` | Condicional | Nula apenas na versão inicial. |
| `motivo_reabertura` / `justificativa_reabertura` | `codigo` / `texto_longo` | Condicional | Obrigatórios na reabertura. |
| `fechada_em` / `fechada_por_usuario_id` | `instante` / `id` | Condicional | Obrigatórios na versão fechada. |
| `criado_em` / `criado_por_usuario_id` | `instante` / `id` | Sim | Autor da versão ou rotina identificada. |

A versão fechada constitui o snapshot preservado. Reabrir cria outra versão e nunca altera a versão fechada anterior.

## 17.3 Participante financeiro

### ENT-CPT-03 — `participante_financeiro`

| Campo | Tipo | Obrigatório | Regra |
|---|---|---|---|
| `participante_financeiro_id` | `id` | Sim | PK estável. |
| `empresa_id` | `id` | Sim | Proprietária. |
| `tipo_participante` | `codigo` | Sim | `EMPREGADO` ou `MEI`. |
| `vinculo_empregado_id` | `id` | Condicional | Obrigatório somente para empregado. |
| `contrato_mei_id` | `id` | Condicional | Obrigatório somente para MEI. |
| `criado_em` | `instante` | Sim | Materialização da identidade. |

Exatamente uma das duas FKs de origem deve estar preenchida; origem e participante pertencem à mesma empresa. Existe no máximo um participante por vínculo e um por contrato.

### ENT-CPT-04 — `competencia_participante`

| Campo | Tipo | Obrigatório | Regra |
|---|---|---|---|
| `competencia_participante_id` | `id` | Sim | PK. |
| `empresa_id` | `id` | Sim | Igual à competência e ao participante. |
| `competencia_id` | `id` | Sim | Competência proprietária. |
| `participante_financeiro_id` | `id` | Sim | Empregado ou MEI. |
| `origem_inclusao` | `codigo` | Sim | Criação, atualização idempotente ou materialização do desligamento. |
| `incluido_em` / `incluido_por_usuario_id` | `instante` / `id` | Sim/condicional | Rotina técnica identificada pode não ter usuário. |

Inclusão tardia não modifica grupo pago ou recibo. Ela cria somente identidades ausentes e encaminha impacto histórico à reabertura/F04.

## 17.4 K06 — líquido do contador

### ENT-CPT-05 — `liquido_contador_k06`

| Campo | Tipo | Obrigatório | Regra |
|---|---|---|---|
| `liquido_contador_k06_id` | `id` | Sim | PK. |
| `empresa_id` / `competencia_id` | `id` | Sim | Mesmo escopo. |
| `participante_financeiro_id` | `id` | Sim | Deve ser empregado. |
| `estado_k06` | `codigo` | Sim | `PENDENTE`, `PREENCHIDO` ou `INCONSISTENTE`. |
| `versao_atual_id` | `id` | Condicional | Nula enquanto nunca preenchido. |
| `versao_lock` | `versao` | Sim | Concorrência. |

### ENT-CPT-06 — `liquido_contador_k06_versao`

| Campo | Tipo | Obrigatório | Regra | Sensibilidade |
|---|---|---|---|---|
| `numero_versao` | `versao` | Sim | Crescente. | Interna |
| `valor_liquido` | `moeda` | Sim | Não negativo; digitado individualmente. | Financeira |
| `ja_desconta_adiantamento_oficial` | `booleano` | Sim | Pré-preenchível pelo padrão, mas confirmado na linha. | Financeira |
| `origem_valor` | `codigo` | Sim | `CONTADOR_DIGITADO_MANUALMENTE`. | Interna |
| `informado_em` / `informado_por_usuario_id` | `instante` / `id` | Sim | Autor e momento. | Interna |
| `versao_anterior_id` | `id` | Condicional | Preserva substituições. | Interna |

Consistência reproduzível:

```text
INCONSISTENTE quando
  o líquido declara descontar adiantamento oficial
  e o adiantamento considerado é maior que zero
  e não existe pagamento real correspondente
  e não existe saldo inicial elegível.
```

Nos demais casos válidos, depois da informação, fica `PREENCHIDO`. K06 não é importado, decomposto ou recalculado pelo sistema.

## 17.5 Saldo inicial da implantação

### ENT-CPT-07 — `saldo_inicial_implantacao`

| Campo | Tipo | Obrigatório | Regra |
|---|---|---|---|
| `saldo_inicial_implantacao_id` | `id` | Sim | PK. |
| `empresa_id` / `participante_financeiro_id` | `id` | Sim | Mesmo escopo. |
| `competencia_inicial_id` | `id` | Sim | Primeira competência financeira real. |
| `grupo_codigo` / `evento_codigo` | `codigo` | Sim | Origem real anterior conhecida. |
| `versao_atual_id` | `id` | Sim | Versão corrente. |
| `versao_lock` | `versao` | Sim | Concorrência. |

### ENT-CPT-08 — `saldo_inicial_implantacao_versao`

| Campo | Tipo | Obrigatório | Regra |
|---|---|---|---|
| `numero_versao` | `versao` | Sim | Crescente. |
| `valor_pago_real` | `moeda` | Sim | Maior que zero. |
| `data_pagamento_real` | `data` | Sim | Pode anteceder a implantação. |
| `justificativa_correcao` | `texto_longo` | Condicional | Obrigatória depois da inicial. |
| `registrado_em` / `registrado_por_usuario_id` | `instante` / `id` | Sim | Momento no sistema e executor. |
| `versao_anterior_id` | `id` | Condicional | Preserva original. |

`Ausente` é a inexistência de ENT-CPT-07, não uma linha vazia. Saldo inicial não cria competência anterior, pagamento interno ou recibo fictício.

## 17.6 Relacionamentos e projeções

| ID | Relacionamento | Cardinalidade |
|---|---|---|
| REL-CPT-01 | empresa → competência | 1:N |
| REL-CPT-02 | competência → versões | 1:N; uma atual |
| REL-CPT-03 | vínculo → participante financeiro | 1:0..1 |
| REL-CPT-04 | contrato MEI → participante financeiro | 1:0..1 |
| REL-CPT-05 | competência ↔ participante | N:N por competência-participante |
| REL-CPT-06 | participante empregado da competência → K06 | 1:0..1 |
| REL-CPT-07 | K06 → versões | 1:N |
| REL-CPT-08 | participante → saldos iniciais | 1:N por grupo/evento |

As projeções canônicas são definidas uma única vez na seção 27.2. Nesta competência aplicam-se:

- o indicador `Em pagamentos` (`PRJ-CPT-01`);
- o checklist de fechamento (`PRJ-CPT-02`);
- a elegibilidade do participante (`PRJ-CPT-03`).

Invariantes:

- uma competência por empresa/mês;
- mês não anterior ao corte empresarial;
- fechamento não confirma pagamento;
- reabertura não apaga versões, pagamentos ou recibos;
- toda FK comprova a mesma empresa.

---

# 18. Grupos, componentes, cálculos, conferência e pagamento

## 18.1 Catálogo de entidades

| ID | Entidade | Escopo | Finalidade | Chave/unicidade | Ciclo | Regras 17 |
|---|---|---|---|---|---|---|
| ENT-PAG-01 | `catalogo_grupo_financeiro` | Global técnico | Nove grupos aprovados. | Código único. | Catálogo por migração. | Documento 17, 13.1 |
| ENT-PAG-02 | `catalogo_evento_financeiro` | Global técnico | Adiantamento, final, desligamento, ajuste e sem pagamento. | Código único. | Catálogo. | Documento 17, 12.3/13.1 |
| ENT-PAG-03 | `catalogo_grupo_evento` | Global técnico | Combina grupo, participante, evento e recibo permitido. | Grupo+tipo+evento únicos. | Catálogo. | Documento 17, 13.1 |
| ENT-PAG-04 | `grupo_financeiro` | Empresarial | Identidade do grupo indivisível. | Competência+participante+grupo+evento únicos. | Raiz versionada. | G08-01 a G08-16 |
| ENT-PAG-05 | `grupo_financeiro_versao` | Empresarial | Estado, totais e memória de cada versão. | Grupo+número únicos. | Append-only. | G08-02 a G08-16 |
| ENT-PAG-06 | `fonte_componente_financeiro` | Empresarial | Supertipo relacional da origem de verba. | Uma identidade por origem tipada. | Raiz estável. | Documento 17, 13.4 |
| ENT-PAG-07 | `componente_financeiro` | Empresarial | Identidade de cada verba dentro do grupo. | Grupo+fonte únicos. | Raiz versionada. | G08-01 a G08-16 |
| ENT-PAG-08 | `componente_financeiro_versao` | Empresarial | Valores automático, manual e final. | Componente+número únicos. | Append-only. | G08-03 a G08-16 |
| ENT-PAG-09 | `memoria_calculo` | Empresarial | Snapshot reproduzível do cálculo. | Uma principal por versão do grupo. | Imutável. | Documento 17, 12.4/13.4 |
| ENT-PAG-10 | `memoria_calculo_operando` | Empresarial | Operandos tipados da fórmula. | Memória+código+sequência. | Imutável. | Documento 17, 13.4 |
| ENT-PAG-11 | `memoria_calculo_d30` | Empresarial | Segmentos e posições comerciais. | Memória+mês+sequência. | Imutável. | Documento 17, 12.4 |
| ENT-PAG-12 | `conferencia_grupo` | Empresarial | Conferência de uma versão calculada. | Versão+sequência. | Append-only. | G08-05, D12-21 |
| ENT-PAG-13 | `pagamento_real` | Empresarial | Fato imutável do dinheiro entregue. | Operação idempotente única. | Append-only. | P09-05 a P09-16 |
| ENT-PAG-14 | `confirmacao_pagamento` | Empresarial | Liga grupo e pagamento real. | Uma identidade lógica por grupo pago. | Raiz versionada. | P09-05 a P09-16, C10-05 |
| ENT-PAG-15 | `confirmacao_pagamento_versao` | Empresarial | Confirmação, cancelamento administrativo e reconfirmação. | Confirmação+número únicos. | Append-only. | P09-10 a P09-13, C10-05 a C10-13 |
| ENT-PAG-16 | `lote_confirmacao` | Empresarial | Resultado-pai confirmado de F03. | Operação idempotente única. | Imutável após commit. | P09-06 |
| ENT-PAG-17 | `lote_confirmacao_item` | Empresarial | Resultado individual no lote. | Lote+grupo únicos. | Append-only. | P09-06 |
| ENT-PAG-18 | `confirmacao_pagamento_componente` | Empresarial | Prova quanto de cada versão de verba compôs o pagamento. | Confirmação versão+componente versão únicos. | Imutável. | P09-05/06, C10-07 a C10-13, D12-20 |

Escopo/ciclo: ENT-PAG-01 a 03 são catálogos globais técnicos; ENT-PAG-04 a 18 são empresariais. Raízes mutáveis possuem versão; versões, memórias, pagamentos, alocações e itens de lote são imutáveis/append-only.

## 18.2 Catálogos vinculantes

Grupos:

```text
OFICIAL_EMPREGADO
RA_REEMBOLSO
COMPLEMENTOS
PERIODO_SEM_REGISTRO
CONTRATO_MEI
RESCISAO_OFICIAL
ACERTO_COMPLEMENTAR_RA
AJUSTE_POSITIVO
DIFERENCA_ABSORVIDA
```

Eventos:

```text
ADIANTAMENTO
PAGAMENTO_FINAL
DESLIGAMENTO
AJUSTE
SEM_PAGAMENTO
```

O catálogo grupo-evento informa participante permitido, recibo, possibilidade de confirmação, tratamento de zero e destinos permitidos. Combinação ausente é proibida.

## 18.3 Grupo e versão

### ENT-PAG-04 — `grupo_financeiro`

| Campo | Tipo | Obrigatório | Regra |
|---|---|---|---|
| `grupo_financeiro_id` | `id` | Sim | PK. |
| `empresa_id` / `competencia_id` | `id` | Sim | Mesmo tenant. |
| `competencia_participante_id` | `id` | Sim | Participante daquela competência. |
| `grupo_codigo` / `evento_codigo` | `codigo` | Sim | Combinação permitida no catálogo. |
| `versao_atual_id` | `id` | Sim | Versão corrente. |
| `versao_lock` | `versao` | Sim | Concorrência. |

Chave natural: empresa + competência + participante + grupo + evento.

### ENT-PAG-05 — `grupo_financeiro_versao`

| Campo | Tipo | Obrigatório | Regra |
|---|---|---|---|
| `numero_versao` | `versao` | Sim | Crescente. |
| `estado_grupo` | `codigo` | Sim | Código canônico do manifesto. |
| `memoria_calculo_id` | `id` | Condicional | Obrigatória a partir de calculado. |
| `valor_automatico_total` | `moeda` | Condicional | Soma automática das verbas. |
| `valor_manual_total` | `moeda` | Condicional | Somente quando autorizado. |
| `valor_final_total` | `moeda` | Condicional | Total efetivo da versão. |
| `motivo_nao_aplicavel` | `codigo` | Condicional | Obrigatório em `NAO_APLICAVEL`. |
| `motivo_cancelamento_desligamento` | `codigo` | Condicional | Obrigatório no cancelamento correspondente. |
| `versao_anterior_id` | `id` | Condicional | Cadeia histórica. |

Estados persistidos: `NAO_GERADO`, `PENDENTE_DADOS`, `CALCULADO`, `PRONTO_PAGAMENTO`, `PAGO`, `NAO_APLICAVEL`, `CANCELADO_POR_DESLIGAMENTO` e `EM_CORRECAO`.

## 18.4 Fonte e componente

`fonte_componente_financeiro` é supertipo relacional. Cada origem concreta — salário, K06, RA, reembolso, complemento, PSR, contrato MEI, serviço, rescisão, acerto ou ajuste — possui uma ligação 1:1 única com ele. Não existe `tipo + id` sem FK verificável.

`componente_financeiro` guarda empresa, grupo, fonte, código da verba e versão atual. Sua versão guarda:

| Campo | Tipo | Regra |
|---|---|---|
| `valor_automatico` | `moeda` | Fórmula ou fonte autoritativa. |
| `valor_manual` | `moeda` | Opcional e autorizado. |
| `valor_final` | `moeda` | Manual, se houver; caso contrário automático. |
| `diferenca_manual` | `decimal_calculo` | Manual menos automático. |
| `justificativa_manual` | `texto_longo` | Obrigatória na sobrescrita. |
| `origem_versao_id` | `id` | Versão exata da fonte. |
| `grupo_financeiro_versao_id` | `id` | Versão do grupo. |

## 18.5 Memória de cálculo

`memoria_calculo` guarda fórmula e versão do algoritmo, intervalo, base, percentual, D30, valor intermediário, valor arredondado, regra de arredondamento, snapshot canônico e hash.

`memoria_calculo_operando` guarda código, tipo, valor, unidade, fonte/versão e sequência. `memoria_calculo_d30` guarda competência, intervalo civil, intervalo da vigência, posições comerciais, quantidade, base e valor proporcional.

Restrições:

- a soma das posições coincide com o D30 total do direito;
- uma posição não pertence a duas vigências;
- memória confirmada nunca é alterada;
- recálculo cria nova memória e nova versão.
- na última competência MEI, a memória registra `fim_aplicavel`, `data_prevista_adiantamento`, ausência/presença do pagamento efetivo da base, valor zero do adiantamento quando a regra terminal incidir e a mesma base redirecionada ao final; essa projeção ocorre antes da conferência e de qualquer recibo.

## 18.6 Conferência e pagamento

`conferencia_grupo` contém grupo, versão, sequência, resultado, autor, instante e hash conferido. Somente uma conferência concluída da versão corrente habilita `PRONTO_PAGAMENTO`.

### ENT-PAG-13 — `pagamento_real`

| Campo | Tipo | Obrigatório | Regra |
|---|---|---|---|
| `pagamento_real_id` | `id` | Sim | PK imutável. |
| `empresa_id` | `id` | Sim | Proprietária. |
| `valor_pago` | `moeda` | Sim | Maior que zero. |
| `data_pagamento_efetivo` | `data` | Sim | Não futura. |
| `confirmado_em` / `confirmado_por_usuario_id` | `instante` / `id` | Sim | Servidor e executor. |
| `operacao_idempotente_id` | `id` | Sim | Impede duplicidade. |
| `lote_confirmacao_id` | `id` | Condicional | Somente F03. |

Não existe estado de estorno, processamento bancário ou devolução.

`confirmacao_pagamento` liga empresa, grupo e pagamento real e aponta para sua versão atual. Cada `confirmacao_pagamento_versao` guarda a versão exata do grupo confirmada, estado `VIGENTE`, `CANCELADA_ADMINISTRATIVAMENTE` ou `RECONFIRMADA`, predecessor, autor, instante e F04 quando aplicável. Cancelar administrativamente nunca altera `pagamento_real`.

`confirmacao_pagamento_componente` guarda empresa, versão da confirmação, versão do componente, fonte/versão autoritativa, valor final da verba e valor considerado efetivamente pago. A soma por confirmação precisa ser exatamente `pagamento_real.valor_pago`. É a fonte para deduzir RA já paga, saldo por verba, recibo e F04; total de grupo isolado nunca substitui essa proveniência.

## 18.7 Confirmação em lote

`lote_confirmacao` guarda empresa, competência, grupo, evento, data efetiva comum, `operacao_idempotente_id`, solicitante e instante do commit. Não possui estado técnico próprio: andamento, conclusão ou falha sem commit pertencem exclusivamente a ENT-TEC-01. Cada item guarda grupo, versão conferida, participante, pagamento, confirmação e recibo produzido.

Todos os itens têm mesma empresa, competência, grupo e evento. Conflito em qualquer item elegível reverte o conjunto inteiro.

## 18.8 Invariantes

- somente grupo pronto pode ser confirmado;
- valor zero segue não aplicável e nunca gera pagamento/recibo;
- no adiantamento MEI, `fim_aplicavel <= data_prevista_adiantamento` sem pagamento efetivo da base é uma origem obrigatória de valor zero; a base proporcional permanece integralmente devida no grupo final e o estado trabalhista `CANCELADO_POR_DESLIGAMENTO` é proibido;
- pagamento é integral por participante+grupo+evento;
- confirmar um grupo não altera outro;
- componentes não se compensam silenciosamente;
- grupo pago só muda por F04;
- oficial e rescisão preservam o valor do contador;
- parcela final deduz somente o efetivamente pago da mesma verba;
- pagamento, auditoria e numeração aplicável concluem juntos.

---

# 19. Correções, ajustes positivos e diferenças absorvidas

## 19.1 Catálogo de entidades

| ID | Entidade | Escopo | Finalidade | Chave/unicidade | Ciclo | Regras 17 |
|---|---|---|---|---|---|---|
| ENT-COR-01 | `correcao_financeira` | Empresarial | Identidade da jornada F04 no escopo mínimo. | No máximo uma aberta por competência+participante+grupo+evento. | Raiz versionada. | C10-01 a C10-19 |
| ENT-COR-02 | `correcao_financeira_versao` | Empresarial | Cada etapa persistida da jornada. | Correção+número únicos. | Append-only. | C10-01 a C10-19 |
| ENT-COR-03 | `resultado_correcao_componente` | Empresarial | Resultado positivo, negativo ou zero por verba. | Correção+componente únicos. | Imutável. | C10-07 a C10-10 |
| ENT-COR-04 | `ajuste_positivo` | Empresarial | Nova obrigação de um resultado positivo. | Uma por resultado positivo. | Raiz versionada; pagamento preservado. | P10-01 a P10-04 |
| ENT-COR-05 | `diferenca_absorvida` | Empresarial | Excedente definitivo suportado pela empresa. | Uma por resultado negativo. | Imutável. | N10-01/02 |
| ENT-COR-06 | `coordenacao_correcao` | Empresarial | Liga F04 independentes da mesma alteração. | PK própria. | Raiz estável. | C10-19 |
| ENT-COR-07 | `coordenacao_correcao_item` | Empresarial | Relação entre coordenação e F04. | Coordenador+correção únicos. | Imutável. | C10-19 |

Todas as entidades ENT-COR são empresariais. Correção e coordenação são raízes versionadas; etapas, resultados, ajustes e diferenças preservam histórico e não admitem edição destrutiva.

## 19.2 Correção financeira

`correcao_financeira` contém:

- empresa, competência, participante, grupo e evento;
- versão original do grupo;
- confirmação, pagamento real e recibo de origem quando aplicáveis;
- natureza `INTERNA_CALCULAVEL` ou `CONTROLE_AUTORITATIVO`;
- versão atual, iniciador, responsável e concorrência.

A restrição parcial de correção aberta usa:

```text
empresa + competência + participante + grupo + evento
onde conclusão ainda não existe
```

## 19.3 Etapas versionadas

`correcao_financeira_versao` guarda etapa, motivo, justificativa, competência reaberta, confirmação cancelada, responsável, resumo/hash do impacto, autor e versão anterior.

Etapas:

```text
AGUARDANDO_JUSTIFICATIVA
AGUARDANDO_REABERTURA
AGUARDANDO_CANCELAMENTO_ADMINISTRATIVO
EM_EDICAO
RECALCULANDO
AGUARDANDO_RECONFIRMACAO
DOCUMENTO_SUBSTITUTO_PENDENTE
CONCLUIDA
```

Conflito, falta de permissão e resposta incerta preservam a etapa persistida e são resultados transversais.

## 19.4 Resultado por verba

| Campo | Tipo | Obrigatório | Regra |
|---|---|---|---|
| `resultado_correcao_componente_id` | `id` | Sim | PK. |
| `correcao_financeira_id` | `id` | Sim | F04 proprietária. |
| `componente_financeiro_id` | `id` | Sim | Mesma verba corrigida. |
| `valor_pago_mesma_verba` | `moeda` | Sim | Pagamento histórico da verba. |
| `novo_valor_devido` | `moeda` | Sim | Resultado correto. |
| `diferenca_matematica` | `decimal_calculo` | Sim | Novo devido menos pago. |
| `tipo_resultado` | `codigo` | Sim | `POSITIVO`, `NEGATIVO` ou `ZERO`. |
| `valor_resultado` | `moeda` | Sim | Módulo da diferença, ou zero. |
| `memoria_calculo_id` | `id` | Sim | Prova reproduzível. |
| `materializado_em` | `instante` | Sim | Mesma transação da apuração. |

Coerência:

- positivo exige diferença maior que zero;
- negativo exige diferença menor que zero;
- zero exige igualdade;
- a mesma F04 pode ter resultados positivos e negativos sem compensá-los.

## 19.5 Ajuste positivo

`ajuste_positivo` contém empresa, resultado de origem, fonte financeira, grupo de ajuste, valor devido, estado, justificativa e eventual pagamento real.

Estados: `PENDENTE`, `PAGO` e `EM_CORRECAO`.

- nasce sempre pendente e com valor positivo;
- é pago integralmente;
- produz recibo próprio quando pago;
- corrigir ajuste pago abre outra F04;
- não altera novamente o grupo histórico de origem.

## 19.6 Diferença absorvida

`diferenca_absorvida` guarda resultado, componente, valor pago, novo devido, excedente positivo, motivo, autor e instante. Seu estado fixo é `ABSORVIDA_PELA_EMPRESA`.

Ela não possui pagamento, recibo, vencimento, saldo futuro, cobrança ou compensação.

## 19.7 Coordenação entre competências

`coordenacao_correcao` identifica alteração, empresa, justificativa e iniciador. Seus itens ligam cada F04, competência, grupo e evento. Coordenação não cria uma correção multicompetência; cada F04 mantém permissão, fechamento e conclusão próprios.

## 19.8 Invariantes

- pagamento real nunca é apagado ou reduzido;
- cancelamento administrativo não é estorno;
- depois de cancelar a confirmação, a jornada só termina formalmente;
- componente fora do escopo permanece imutável;
- positivo não nasce pago;
- negativo não gera cobrança, recibo ou desconto;
- oficial/rescisão autoritativos não criam ajuste interno;
- F04 aberta bloqueia fechamento;
- recibo anterior permanece histórico;
- resposta incerta é reconciliada antes de repetir.

---

# 20. Recibos, snapshots, arquivos e lotes documentais

## 20.1 Catálogo de entidades

| ID | Entidade | Escopo | Finalidade | Chave/unicidade | Ciclo | Regras 17 |
|---|---|---|---|---|---|---|
| ENT-REC-01 | `sequencia_recibo_empresa` | Empresarial | Último número anual comprometido, semente inicial controlada e fence durável da primeira faixa real quando aplicáveis. | Empresa+ano únicos. | Raiz versionada com concorrência transacional, semente de uso único e primeira faixa reconciliada uma única vez. | R11-02, Documento 17 16.7; QAT-REC-007 |
| ENT-REC-02 | `recibo` | Empresarial | Emissão lógica e cadeia de substituição. | Número único; emissão única por confirmação/tipo/versão. | Raiz documental versionada; não excluível. | R11-01 a R11-09 |
| ENT-REC-03 | `recibo_snapshot` | Empresarial | Cabeçalho imutável do PDF. | Um por recibo. | Imutável. | R11-02, Documento 17 16.6 |
| ENT-REC-04 | `recibo_snapshot_item` | Empresarial | Verbas detalhadas. | Snapshot+sequência. | Imutável. | Documento 17 16.5/16.6 |
| ENT-REC-05 | `arquivo_recibo` | Empresarial privado | Estado e integridade do PDF privado. | Um por recibo. | Raiz técnica versionada. | A11-01 a A11-07 |
| ENT-REC-06 | `tentativa_arquivo_recibo` | Técnico privado | Geração, regeneração e validação. | Arquivo+número da tentativa. | Append-only. | A11-01 a A11-03A |
| ENT-REC-07 | `lote_documental` | Empresarial | Pedido de PDF consolidado ou ZIP. | Chave idempotente. | Raiz temporária versionada. | L11-01 a L11-08 |
| ENT-REC-08 | `lote_documental_item` | Empresarial | Recibos congelados no lote. | Lote+recibo. | Imutável. | L11-01 a L11-08 |
| ENT-REC-09 | `arquivo_lote_documental` | Empresarial privado | Pacote temporário. | Um vigente por pedido. | Raiz técnica temporária. | L11-03B a L11-08 |
| ENT-REC-10 | `tentativa_arquivo_lote` | Técnico privado | Tentativas técnicas do pacote. | Arquivo+número. | Append-only. | L11-04, L11-07 |
| ENT-REC-11 | `arquivo_privado` | Escopo herdado da associação tipada | Metadados comuns do objeto privado. | Identificador/hash; exatamente uma associação proprietária após commit. | Raiz técnica sem enum próprio. | A11-*, L11-*, EXP-* |

Recibos, snapshots e lotes são empresariais; `arquivo_privado` herda escopo empresarial, global ou restrito do proprietário tipado. Snapshots, itens, tentativas e arquivos concluídos são imutáveis; pedidos temporários apenas avançam pelo ciclo autorizado.

## 20.2 Numeração e recibo lógico

`sequencia_recibo_empresa` guarda empresa, ano, último número comprometido e versão de concorrência. A reserva ocorre na transação da confirmação e nunca reutiliza número comprometido. Seu domínio completo é `primeira_faixa_estado = NAO_EXIGIDA | AGUARDANDO_EMISSAO | PENDENTE_RECONCILIACAO | RECONCILIADA`. Para cada empresa+ano inicial da implantação, guarda ainda `primeira_faixa_id`, primeiro/último número, quantidade, hash da faixa, operação/correlação, `authority_epoch`, manifesto/ramo, instantes, aprovadores da reconciliação e `evento_auditoria_id`; demais raízes nascem e permanecem em `NAO_EXIGIDA`.

Na implantação, `ENT-IMP-01/02` guardam primeiro apenas o candidato de semente. A raiz pode receber uma única semente anual controlada somente depois de a fonte anterior estar congelada, todos os deltas de numeração terem sido aplicados, o maior número externo final ter sido recalculado e a entrada exata do manifesto ter chegado a `FINAL_APROVADO`, sempre antes da primeira reserva interna daquela combinação empresa+ano. A semente representa o maior número externo já reservado ou comprometido no controle anterior, não um recibo criado pelo sistema. A raiz preserva `numero_semente_inicial`, `manifesto_carga_id`, `manifesto_carga_empresa_ano_id`, código de origem, referência de origem, justificativa, ator, instante e versão; a auditoria registra antes/depois sem anexar documento externo. A primeira reserva interna é exatamente `semente + 1`.

A definição da semente exige operador nominal com ação específica, reautenticação, contexto empresarial atual e `autorizacao_curta` de finalidade `SEMENTE_RECIBO_IMPLANTACAO`, vinculada à entrada persistida de manifesto, empresa, ano, versão final de deltas e janela exatos. Valor negativo, regressivo em relação ao maior número conhecido, segunda definição incompatível, existência de recibo interno no mesmo ano, ano fora do manifesto, janela fechada/revogada ou colisão com número já reservado são rejeitados sem efeito. Definição concorrente, fechamento/revogação do manifesto, definição contra primeira emissão e duas primeiras emissões travam as mesmas chaves canônicas de manifesto+entrada e empresa+ano: no máximo uma intenção válida confirma; a perdedora recebe conflito de precondição/versão e precisa reler. A semente não cria pagamento, recibo, snapshot, arquivo ou outbox. Se não houver numeração anterior, a entrada registra `SEM_NUMERACAO_ANTERIOR` por declaração dupla, nenhuma semente é persistida e a primeira reserva parte do valor inicial padrão. Toda autorização não consumida é revogada no fechamento/`NO-GO`; tentativa nova pós-janela produz zero efeito. Repetição idempotente exata pode somente recuperar o resultado já gravado, sem executar de novo. Delta posterior à resolução da semente torna a tentativa atual inelegível: em manifesto ainda não terminal, `CTL-IMP-004` confirma `FECHADO_NO_GO`; em manifesto já `FECHADO_RECONCILIADO`, `CTL-IMP-004(INVALIDAR_GO)` acrescenta `ENT-IMP-05` sem mudar o terminal. Se o máximo externo final ou a prova de ausência mudar depois de uma semente imutável, exige baseline limpo e nova carga; se o candidato permanecer idêntico, uma nova tentativa apenas verifica a semente existente, sem reabrir capacidade nem reexecutar a definição.

Toda reserva de recibo lê `ENT-IMP-04`, captura `authority_epoch` e exige `POS_GO_SISTEMA_AUTORITATIVO`. Para empresa+ano da implantação inicial, a primeira emissão exige adicionalmente manifesto exato `FECHADO_RECONCILIADO`, `go_elegivel`, ausência de `ENT-IMP-05`, `ProductionGo` write-once e ramo final válido; ausência cria a raiz no padrão somente no commit da emissão. O primeiro comando legítimo reserva uma faixa atômica — um número ou todo o lote — e muda a raiz para `PENDENTE_RECONCILIACAO` no mesmo commit, com limites/hash/correlação. Enquanto esse estado vigorar, qualquer comando posterior que precise de número na mesma empresa+ano falha fechado sem reservar. `CTL-REC-001(CONFIRMAR_PRIMEIRA_FAIXA)`, executado após `RBK-018` por identidades pessoais e revisão separada, confere autoridade/época, manifesto/ramo, faixa esperada, raiz, recibos lógicos, auditoria, snapshots, outbox e arquivos; só então grava `RECONCILIADA` append-only e libera a próxima reserva. Resposta incerta usa `RBK-025/RBK-018`; não existe desbloqueio manual nem recibo de teste.

`NO-GO`, supersessão, inelegibilidade, autoridade anterior ou estado intermediário falham sem número. Anos/empresas posteriores dispensam apenas a prova do manifesto inicial e continuam bloqueados durante `[T_RET,T_REENT)`. A ordem é guarda global → manifesto → entradas ordenadas → autorizações → raiz empresa+ano; emissão com época obsoleta perde a corrida para a troca de autoridade. `CTL-REC-001` usa a mesma guarda/raiz e não altera número, pagamento ou conteúdo do recibo.

| Campo de `recibo` | Tipo | Obrigatório | Regra |
|---|---|---|---|
| `recibo_id` | `id` | Sim | PK. |
| `empresa_id` | `id` | Sim | Tenant. |
| `confirmacao_pagamento_id` / `versao_id` | `id` | Sim | Fato documentado. |
| `tipo_documental` | `codigo` | Sim | Somente tipo aprovado. |
| `ano_numero` / `sequencia_numero` | `inteiro` | Sim | Únicos por empresa. |
| `numero_formatado` | `texto_curto` | Sim | Inicialmente `AAAA-000000`. |
| `versao_documental` | `versao` | Sim | Cresce na cadeia. |
| `estado_documental` | `codigo` | Sim | `DEFINITIVO_VIGENTE`, `CANCELADO`, `SUBSTITUIDO` ou `SUBSTITUTO_VIGENTE`. |
| `recibo_predecessor_id` | `id` | Condicional | Documento anterior. |
| `motivo_cancelamento` / `correcao_financeira_id` | `codigo` / `id` | Condicional | Correção documental. |
| `emitido_em` | `instante` | Sim | Emissão lógica. |

Unicidades:

- empresa+ano+sequência;
- empresa+número formatado;
- confirmação+tipo+versão documental;
- no máximo um sucessor direto por predecessor.

Prévia é renderização temporária de um grupo calculado/pronto. Não ocupa número nem cria recibo definitivo.

## 20.3 Snapshot imutável

`recibo_snapshot` guarda:

- razão social, CNPJ e logo da empresa naquele momento;
- empregado com nome/CPF ou MEI com razão social/nome fantasia/CNPJ;
- competência, evento e tipo;
- total numérico e por extenso;
- data efetiva e data de emissão;
- número, versão e predecessor;
- campo de assinatura manual do participante;
- snapshot canônico e hash.

Não existe assinatura da empresa.

CPF do empregado no snapshot é `dado_protegido`; a renderização em PDF ocorre somente no serviço autorizado. O arquivo resultante permanece privado e cifrado em repouso conforme a arquitetura.

Itens guardam sequência, fonte/componente, código e descrição da verba, valor e memória/hash de origem.

Geram recibo:

- RA e reembolso por evento;
- complementos por evento;
- período sem registro;
- contrato MEI por evento;
- ajuste positivo;
- acerto complementar de RA.

Não geram: oficial, K06, rescisão oficial, diferença absorvida e valor zero.

## 20.4 Arquivo privado

`arquivo_privado` contém:

- escopo e `empresa_id` quando empresarial;
- finalidade técnica controlada;
- chave privada de armazenamento;
- tipo real, tamanho e hash;
- criação, expiração opcional e `descartado_em` opcional, sem enum de estado;
- nenhuma URL pública permanente.

O proprietário é determinado exclusivamente pela FK tipada em `empresa_logo_versao`, `arquivo_recibo`, `arquivo_lote_documental` ou `arquivo_exportacao`. Não existe `tipo_proprietario + id`; depois do commit, um objeto pertence a exatamente uma dessas associações. Estado documental, estado do pedido e disponibilidade de download permanecem nas entidades tipadas, não em `arquivo_privado`.

`arquivo_recibo` relaciona recibo, arquivo privado, estado `PENDENTE_GERACAO`, `DISPONIVEL`, `FALHOU` ou `INDISPONIVEL`, hash esperado/físico e validações. Tentativas guardam operação, resultado e erro seguro.

Falha ou divergência não reserva outro número, não modifica o snapshot e não desfaz pagamento.

## 20.5 Lote documental

`lote_documental` guarda empresa, competência, solicitante, tipo `PDF_CONSOLIDADO` ou `ZIP`, estado, operação idempotente, snapshot, conclusão e expiração. Itens congelam recibo, número, versão e hash.

Estados do pacote: `PREPARANDO`, `PROCESSANDO`, `PRONTO`, `FALHOU`, `EXPIRADO` e `INDISPONIVEL`.

- todos os recibos pertencem à mesma empresa e competência;
- geração é todos-ou-nenhum;
- pacote expira em 24 horas;
- recibos individuais não expiram por essa regra;
- nova intenção após falha/expiração cria novo pedido ligado ao anterior.

## 20.6 Invariantes

- número anual é único, crescente e não reutilizável;
- semente inicial é única por empresa+ano, autorizada, auditada e anterior à primeira reserva interna; nunca diminui o último número comprometido;
- definitivo nasce somente depois do pagamento integral;
- snapshot é imutável;
- reimpressão mantém número e snapshot;
- substituto recebe novo número;
- total zero cancela sem sucessor;
- arquivo divergente não é entregue;
- permissões de visualizar, baixar, reimprimir, regenerar e gerar lote são independentes;
- download revalida sessão, empresa e conteúdo integral.

---

# 21. Desligamento, rescisão oficial e acerto de RA

## 21.1 Catálogo de entidades

| ID | Entidade | Escopo | Finalidade | Chave/unicidade | Ciclo | Regras 17 |
|---|---|---|---|---|---|---|
| ENT-DES-01 | `desligamento` | Empresarial | Identidade de um ciclo de saída. | No máximo um programado/efetivo vigente por vínculo. | Raiz versionada. | D12-01 a D12-08 |
| ENT-DES-02 | `desligamento_versao` | Empresarial | Data, tipo, aviso e correções. | Desligamento+número únicos. | Append-only. | D12-01 a D12-08 |
| ENT-DES-03 | `decisao_adiantamento_desligamento` | Empresarial | Decisão sobre grupo atrasado não pago. | Desligamento+grupo únicos. | Imutável por decisão; sucessor explícito se permitido. | D12-11 a D12-13A |
| ENT-DES-04 | `destino_financeiro_desligamento` | Empresarial | Rastreia origem até destino. | Origem+desligamento únicos. | Imutável. | D12-09 a D12-14 |
| ENT-DES-05 | `rescisao_oficial` | Empresarial | Identidade do valor autoritativo do contador. | Uma por desligamento formal. | Raiz versionada. | D12-17 a D12-19 |
| ENT-DES-06 | `rescisao_oficial_versao` | Empresarial | Valor positivo ou zero confirmado. | Rescisão+número únicos. | Append-only. | D12-18/18A, C10-18 |
| ENT-DES-07 | `acerto_complementar_ra` | Empresarial | Identidade do cálculo exclusivo de RA. | Um por desligamento aplicável. | Raiz versionada. | D12-20 a D12-22 |
| ENT-DES-08 | `acerto_complementar_ra_versao` | Empresarial | Parâmetros, memória e total. | Acerto+número únicos. | Append-only. | Documento 17, 17.5 |
| ENT-DES-09 | `acerto_complementar_ra_item` | Empresarial | Linhas detalhadas do acerto. | Versão+componente únicos. | Imutável. | Documento 17, 17.5 |
| ENT-DES-10 | `reconciliacao_cancelamento_desligamento` | Empresarial | Coordena cancelamento corretivo. | Uma aberta por desligamento. | Raiz versionada. | D12-07A, D12-08A a D12-08C |
| ENT-DES-11 | `reconciliacao_cancelamento_item` | Empresarial | Grupo, destino, F04 ou documento reconciliado. | Reconciliação+tipo+item únicos. | Append-only. | D12-08A a D12-08B |

Todas as entidades ENT-DES são empresariais e carregam o mesmo `empresa_id` do vínculo. Raízes usam versão; versões, decisões, destinos, itens e reconciliações concluídas são preservados.

## 21.2 Desligamento e versões

`desligamento` guarda empresa, vínculo, versão atual, concorrência e criação. Ciclo cancelado permanece histórico e não impede um futuro novo ciclo legítimo; segundo ciclo não cancelado simultâneo é proibido.

| Campo da versão | Tipo | Obrigatório | Regra |
|---|---|---|---|
| `numero_versao` | `versao` | Sim | Crescente. |
| `estado_ciclo` | `codigo` | Sim | `PROGRAMADO`, `EFETIVO` ou `CANCELADO`. |
| `tipo_encerramento` | `codigo` | Sim | `ENCERRADO_SEM_REGISTRO` ou `DEMITIDO_FORMALMENTE`. |
| `data_saida` | `data` | Sim | Último dia inclusivo. |
| `tipo_aviso` | `codigo` | Condicional | `TRABALHADO` ou `INDENIZADO`. |
| `dias_aviso_indenizado` | `inteiro` | Condicional | Positivo somente quando indenizado. |
| `competencia_final_mes` | `competencia` | Sim | Mês da saída. |
| `competencia_final_id` | `id` | Condicional | Nula enquanto a competência não existe. |
| `motivo_correcao_cancelamento` / `justificativa` | `codigo` / `texto_longo` | Condicional | Motivo da operação, não da demissão. |
| `versao_anterior_id` | `id` | Condicional | Cadeia. |

Não existe campo de motivo trabalhista do desligamento.

## 21.3 Decisão e destinos do adiantamento

`decisao_adiantamento_desligamento` guarda desligamento, grupo/versão analisados, justificativa, executor, instante e uma escolha:

- pagar adiantamento atrasado;
- cancelar e encaminhar;
- retirar RA e preservar reembolso.

`destino_financeiro_desligamento` guarda origem, valor, tratamento, destino, valor destinado, memória e decisão.

Regras:

- toda verba retirada possui destino ou prova de não aplicabilidade;
- RA segue somente ao acerto de RA;
- complemento e PSR seguem aos finais próprios;
- reembolso real permanece no evento mensal;
- oficial segue exclusivamente a referência do contador.

## 21.4 Rescisão oficial

`rescisao_oficial` liga desligamento, participante, grupo e versão atual. A versão guarda:

- valor informado pelo contador;
- estado `INFORMADA` ou `ZERO_CONFIRMADO`;
- confirmação de que não inclui RA;
- motivo do zero quando aplicável;
- autor, instante, versão anterior e justificativa corretiva.

Valor positivo segue conferência/pagamento. Zero segue `Não aplicável`. Nenhum gera recibo interno.

## 21.5 Acerto complementar de RA

`acerto_complementar_ra` liga desligamento, participante, grupo e RA vigente na saída.

Sua versão guarda:

- RA mensal vigente e data real da saída;
- início do direito, posições D30 e RA proporcional;
- RA efetivamente paga no adiantamento;
- saldo e excedente absorvido;
- tipo de aviso e dias indenizados;
- avos de 13º e férias, de 0 a 12;
- confirmação de férias vencidas;
- total automático, manual autorizado, diferença e total final;
- memória, justificativa, autor e versão anterior.

Itens permitidos:

```text
SALDO_RA
AVISO_INDENIZADO_RA
DECIMO_TERCEIRO_RA
FERIAS_PROPORCIONAIS_RA
UM_TERCO_PROPORCIONAL_RA
FERIAS_VENCIDAS_RA
UM_TERCO_VENCIDAS_RA
```

Cada item preserva valor automático, eventual valor manual, valor final e memória.

## 21.6 Reconciliação do cancelamento

`reconciliacao_cancelamento_desligamento` guarda desligamento, início, responsável, justificativa, conclusão e concorrência. Seus itens ligam grupo, destino, correção ou recibo e registram tratamento exigido/concluído.

A conclusão é atômica. Qualquer item pendente mantém a projeção financeira `EM_CORRECAO`.

## 21.7 Aplicação das projeções de desligamento

A projeção temporal canônica `PRJ-DES-01`, definida na seção 27.2, resulta em futuro, ativo, encerramento programado, último dia ativo ou inativo. A inativação ocorre no dia seguinte à saída.

A projeção financeira canônica `PRJ-DES-02`, também definida na seção 27.2, aplica a seguinte prioridade aprovada:

1. N/A;
2. em correção;
3. aguardando criação da competência;
4. decisão necessária;
5. pendente de dados;
6. desligamento informado após pagamento;
7. aguardando conferência;
8. grupos pendentes;
9. financeiro quitado.

Não existe coluna editável para essas projeções.

## 21.8 Invariantes

- MEI nunca participa;
- formal exige admissão; sem registro exige ausência dela;
- saída não antecede início e é inclusiva;
- pagamento ou ASO não controlam inativação;
- programação pode existir antes da competência final;
- rescisão e acerto RA são independentes;
- acerto usa RA vigente, sem média;
- somente RA paga deduz saldo RA;
- excedente de RA não reduz aviso, 13º ou férias;
- salário-base, complemento, reembolso e PSR não entram;
- aviso trabalhado não cria linha adicional;
- não existe dobra de férias nem imposto/desconto no acerto;
- cancelamento com efeitos exige reconciliação/F04;
- pagamentos, recibos e versões nunca são apagados.

---

# 22. ASO, acompanhamento, exame e clínicas

## 22.1 Catálogo de entidades

| ID | Entidade | Escopo | Finalidade | Chave/unicidade | Ciclo | Regras 17 |
|---|---|---|---|---|---|---|
| ENT-CLI-01 | `clinica` | Global | Identidade estável da clínica. | CNPJ atual único global. | Raiz versionada. | CLI-01 a CLI-07 |
| ENT-CLI-02 | `clinica_versao` | Global | Cadastro histórico. | Clínica+número únicos. | Append-only. | CLI-02 a CLI-04 |
| ENT-ASO-01 | `aso_acompanhamento` | Empresarial | Necessidade manual ou demissional. | Unicidades por origem. | Raiz versionada. | ASO-A01 a ASO-A14 |
| ENT-ASO-02 | `aso_acompanhamento_evento` | Empresarial | Linha do tempo imutável. | Acompanhamento+sequência. | Append-only. | ASO-A04 a ASO-A14 |
| ENT-ASO-03 | `aso_exame` | Empresarial | Identidade lógica do exame. | Unicidades condicionais por tipo. | Raiz versionada. | ASO-E01 a ASO-E10 |
| ENT-ASO-04 | `aso_exame_versao` | Empresarial | Retificações/invalidações. | Exame+número; uma vigente. | Append-only. | ASO-E05 a ASO-E09 |
| ENT-ASO-05 | `aso_resultado_sensivel` | Empresarial restrito | Resultado protegido. | Um por versão confirmada. | Imutável. | ASO-R01 a ASO-R04, ASO-E08 |
| ENT-ASO-06 | `aso_clinica_snapshot` | Empresarial | Cadastro da clínica no exame. | Um por versão. | Imutável. | CLI-05/06, Documento 17 18.4 |
| ENT-ASO-07 | `aso_referencia_alerta` | Empresarial | Fonte única da referência do vínculo. | Uma raiz por vínculo. | Raiz versionada. | ASO-P06 a ASO-P12 |
| ENT-ASO-08 | `aso_referencia_alerta_versao` | Empresarial | Promoção, supressão e substituição. | Referência+número únicos. | Append-only. | ASO-P06 a ASO-P12 |

ENT-CLI-01/02 têm escopo global cadastral; ENT-ASO-01 a 08 são empresariais, e ENT-ASO-05 possui acesso clínico restrito. Versões, eventos, resultados e snapshots são imutáveis; raízes usam concorrência otimista.

## 22.2 Clínica global

`clinica` contém CNPJ atual, estado `ATIVA`/`INATIVA`, versão atual e concorrência. Não possui empresa. Cada versão guarda razão social, nome fantasia, CNPJ, motivo, autor e versão anterior.

- CNPJ é único globalmente;
- clínica inativa não entra em novo exame;
- alteração não modifica snapshot histórico;
- não existe associação clínica–empresa;
- catálogo não revela empresas, exames, empregados ou quantidade de usos.

## 22.3 Acompanhamento

| Campo | Tipo | Obrigatório | Regra |
|---|---|---|---|
| `aso_acompanhamento_id` | `id` | Sim | PK. |
| `empresa_id` / `vinculo_empregado_id` | `id` | Sim | Empregado da mesma empresa. |
| `tipo_exame` | `codigo` | Sim | Periódico, retorno, mudança de riscos ou demissional. |
| `origem_acompanhamento` | `codigo` | Sim | `NECESSIDADE_MANUAL` ou `DESLIGAMENTO_FORMAL`. |
| `desligamento_id` | `id` | Condicional | Obrigatório no demissional. |
| `estado_acompanhamento` | `codigo` | Sim | Código canônico. |
| `exame_realizado_id` | `id` | Condicional | Quando realizado. |
| `versao_lock` | `versao` | Sim | Concorrência. |

Estados: `PENDENTE`, `AGENDADO`, `NAO_COMPARECEU`, `REALIZADO`, `ENCERRADO_SEM_REALIZACAO` e `CANCELADO`.

Na primeira versão, `AGENDADO` não armazena data, horário, local ou clínica. MF-01 continua fora do modelo.

Unicidades:

- um acompanhamento demissional por empresa+desligamento;
- no máximo um manual ativo por empresa+vínculo+tipo+origem;
- evento de acompanhamento é append-only e sequencial.

## 22.4 Exame lógico e versões

`aso_exame` guarda empresa, vínculo, tipo, acompanhamento opcional, desligamento demissional, versão atual e concorrência.

Tipos: admissional, periódico, retorno ao trabalho, mudança de riscos ocupacionais e demissional.

| Campo da versão | Tipo | Obrigatório | Regra |
|---|---|---|---|
| `numero_versao` | `versao` | Sim | Crescente. |
| `estado_versao` | `codigo` | Sim | `VIGENTE`, `SUBSTITUIDA` ou `INVALIDADA_ADMINISTRATIVAMENTE`. |
| `data_exame` | `data` | Sim | Não futura. |
| `data_vencimento` | `data` | Condicional | Obrigatória nos monitorados; nula no demissional. |
| `clinica_id` / `clinica_snapshot_id` | `id` | Sim | Clínica global ativa e snapshot. |
| `resultado_sensivel_id` | `id` | Sim | Escolha consciente. |
| `versao_substituida_id` | `id` | Condicional | Retificação. |
| `motivo_retificacao` / `justificativa_invalidacao` | `codigo` / `texto_longo` | Condicional | Conforme ação. |

Regras:

- uma versão vigente por exame lógico;
- um admissional vigente por vínculo;
- um demissional vigente por desligamento;
- periódico é novo exame lógico;
- retificação cria versão;
- invalidação preserva dados e retira efeitos ativos.

## 22.5 Resultado e clínica do snapshot

`aso_resultado_sensivel` guarda versão, empresa e exatamente um resultado: `APTO`, `APTO_COM_RESTRICAO` ou `INAPTO`. O acesso é explícito e auditado.

Restrição é derivada:

```text
APTO               → SEM_RESTRICAO
APTO_COM_RESTRICAO → COM_RESTRICAO
INAPTO             → NAO_APLICAVEL
sem exame vigente  → INEXISTENTE
```

Não existem descrição de restrição, diagnóstico, CID, médico, CRM, observação, documento, imagem, PDF ou assinatura.

`aso_clinica_snapshot` guarda versão global da clínica, razão social, nome fantasia, CNPJ, instante e hash canônico.

## 22.6 Referência e prazo

Uma `aso_referencia_alerta` por vínculo aponta para suas versões. A versão pode guardar `SEM_REFERENCIA`, `REFERENCIA_ATIVA`, `SUPRIMIDO_POR_VINCULO_INATIVO` ou `NAO_APLICAVEL`, com exame, versão, motivo e predecessor.

`INFORMATIVO` é projeção para exame vigente que não é a referência. Demissional projeta não aplicável.

Prazo é sempre derivado:

```text
SEM_PRAZO                    sem vencimento aplicável
VIGENTE                      vencimento > hoje + 30 dias
VENCENDO_EM_ATE_30_DIAS      hoje <= vencimento <= hoje + 30 dias
VENCIDO                      vencimento < hoje
NAO_APLICAVEL                demissional
```

Ele não cria versão diária. Vencimento sugerido é exame + 12 meses de calendário, editável antes da confirmação.

## 22.7 Relacionamentos

| ID | Relacionamento | Cardinalidade |
|---|---|---|
| REL-CLI-01 | clínica → versões | 1:N |
| REL-ASO-01 | vínculo → acompanhamentos | 1:N |
| REL-ASO-02 | desligamento formal → acompanhamento demissional | 1:1 |
| REL-ASO-03 | acompanhamento → eventos | 1:N |
| REL-ASO-04 | acompanhamento realizado → exame | 1:1 |
| REL-ASO-05 | vínculo → exames | 1:N |
| REL-ASO-06 | exame → versões | 1:N |
| REL-ASO-07 | versão → resultado | 1:1 |
| REL-ASO-08 | versão → snapshot de clínica | 1:1 |
| REL-ASO-09 | vínculo → referência | 1:0..1 |
| REL-ASO-10 | referência → versões | 1:N |

## 22.8 Invariantes

- ASO somente para empregado;
- demissional exige desligamento formal; admissional exige admissão;
- exame não futuro; vencimento não anterior ao exame;
- demissional não aceita vencimento;
- não comparecimento exige passagem por agendado;
- encerramento sem realização somente demissional;
- cancelamento da saída não apaga exame feito;
- exame não se transfere de empresa, pessoa ou vínculo;
- somente admissional/periódico pode ser referência;
- invalidar referência promove o candidato elegível mais recente ou fica sem referência;
- vínculo inativo suprime alerta sem apagar exame;
- clínica é revalidada ativa na confirmação;
- resultado oculto não entra em API, filtro, total, histórico visível, notificação ou Excel.

---

# 23. Notificações e leitura individual

## 23.1 Catálogo de entidades

| ID | Entidade | Escopo | Finalidade | Chave/unicidade | Ciclo | Regras 17 |
|---|---|---|---|---|---|---|
| ENT-NOT-01 | `catalogo_tipo_notificacao` | Global técnico | Define tipos estáveis, origem admitida, discriminadores e regra de urgência. | Código único. | Catálogo por migração. | NOT-O01 a NOT-O11 |
| ENT-NOT-02 | `fonte_notificavel` | Empresarial | Supertipo relacional para uma origem empresarial autorizável. | Uma fonte por origem concreta. | Raiz estável. | NOT-O01 a NOT-O11 |
| ENT-NOT-03 | `notificacao_condicao` | Empresarial | Identidade determinística da condição que pode ficar ativa ou resolvida. | Empresa+tipo+fonte+discriminadores únicos. | Raiz estável. | NOT-O01 a NOT-O10 |
| ENT-NOT-04 | `notificacao_ocorrencia` | Empresarial | Uma aparição operacional da condição. | Condição+sequência únicos; uma ativa por condição. | Raiz versionada. | NOT-O01 a NOT-O11 |
| ENT-NOT-05 | `notificacao_leitura_usuario` | Empresarial por usuário | Estado individual de leitura. | Ocorrência+usuário únicos. | Mutável com versão. | NOT-L01 a NOT-L06 |
| ENT-NOT-06 | `notificacao_condicao_discriminador` | Empresarial | Discriminadores tipados que participam da identidade da condição. | Condição+código únicos. | Imutável dentro da identidade. | NOT-O01 a NOT-O11 |

## 23.2 Fonte e chave da condição

`fonte_notificavel` contém `empresa_id`, código da família e exatamente uma ligação tipada à origem concreta permitida. As ligações possíveis são definidas pelo catálogo e usam FK real; uma combinação genérica `tipo + id` sem integridade não é aceita.

A chave canônica é:

```text
empresa + tipo estável + fonte tipada + discriminadores normalizados
```

Os discriminadores são linhas tipadas e ordenadas, como competência, evento, grupo, acompanhamento ou referência de vencimento. O hash da chave pode acelerar a unicidade, mas os valores canônicos continuam armazenados e conferíveis.

Cada `notificacao_condicao_discriminador` contém:

| Campo | Tipo | Obrigatório | Regra |
|---|---|---|---|
| `notificacao_condicao_id` / `empresa_id` | `id` | Sim | Mesma empresa da condição. |
| `discriminador_codigo` | `codigo` | Sim | Nome estável definido pelo tipo. |
| `ordem_canonica` | `inteiro` | Sim | Ordem determinística no hash. |
| `competencia_id` | `id` | Condicional | Competência da mesma empresa. |
| `grupo_financeiro_id` | `id` | Condicional | Grupo da mesma empresa. |
| `evento_codigo` / `grupo_codigo` | `codigo` | Condicional | Valores financeiros controlados. |
| `aso_acompanhamento_id` | `id` | Condicional | Acompanhamento da mesma empresa. |
| `aso_referencia_alerta_id` | `id` | Condicional | Referência da mesma empresa. |
| `codigo_valor` / `data_valor` | `codigo` / `data` | Condicional | Somente quando o catálogo admitir. |

Exatamente uma forma de valor é preenchida por linha. O catálogo do tipo define discriminadores obrigatórios, opcionais e proibidos; texto livre nunca participa da identidade.

## 23.3 Condição e ocorrência

`notificacao_condicao` guarda:

- empresa, tipo, fonte e discriminadores;
- hash canônico;
- instante em que foi reconhecida pela primeira vez;
- última reavaliação;
- sequência da última ocorrência;
- versão para concorrência.

`notificacao_ocorrencia` guarda:

- condição e sequência;
- estado `ATIVA` ou `RESOLVIDA`;
- subestado controlado da origem;
- nível de urgência e versão da regra que o produziu;
- `resumo_codigo`, `destino_recurso_codigo` e `revisao_urgencia` crescente somente em escalada real;
- início, última atualização, resolução e motivo derivado;
- instante em que deixa a consulta operacional de 90 dias;
- versão para concorrência.

Restrições:

- existe no máximo uma ocorrência ativa por condição;
- reavaliação da mesma condição atualiza a ocorrência ativa e não cria uma linha diária;
- condição resolvida que reaparece cria a próxima sequência, sem reabrir a anterior;
- urgência maior pode redefinir leituras para não lidas na mesma transação;
- resolução vem exclusivamente da fonte; não existe botão manual para resolver;
- após 90 dias, a ocorrência resolvida sai da central, mas origem e auditoria permanecem conforme suas retenções;
- texto e contadores não contêm resultado clínico, remuneração, CPF ou CNPJ desnecessário.

## 23.4 Leitura e autorização

`notificacao_leitura_usuario` contém ocorrência, usuário, estado `NAO_LIDA` ou `LIDA`, `lida_em`, `revisao_urgencia_reconhecida`, última redefinição por urgência, versão e operação idempotente. O destino é reautorizado antes de abrir.

- a leitura nasce somente quando o usuário pode conhecer a origem;
- retirada de permissão torna a ocorrência invisível sem apagar a leitura;
- restauração preserva leitura anterior, salvo escalada real de urgência durante a ausência;
- marcar a página como lida afeta somente IDs carregados, filtrados e novamente autorizados;
- o sino conta apenas `ATIVA + NAO_LIDA + atualmente autorizada`;
- empresa e permissão são aplicadas antes de lista, filtro, agrupamento e contagem;
- atualização periódica do sino não renova a sessão.

## 23.5 Relacionamentos e invariantes

```text
origem empresarial 1 ── 1 fonte_notificavel
fonte_notificavel 1 ── N notificacao_condicao
notificacao_condicao 1 ── N notificacao_ocorrencia
notificacao_condicao 1 ── N notificacao_condicao_discriminador
notificacao_ocorrencia 1 ── N notificacao_leitura_usuario
usuario 1 ── N notificacao_leitura_usuario
```

- `RST-NOT-01` — todas as entidades da cadeia carregam a mesma empresa, garantida por FK composta ou política equivalente no banco.
- `RST-NOT-02` — chave canônica e índice parcial impedem duas ocorrências ativas equivalentes.
- `RST-NOT-03` — leitura não altera a origem nem a ocorrência.
- `RST-NOT-04` — perda de autorização remove item, prévia e contador na próxima resposta.
- `RST-NOT-05` — não há e-mail, SMS, push, comentário, atribuição ou adiamento na primeira versão.
- `RST-NOT-06` — conclusão de exportação não cria notificação.

---

# 24. Exportações temporárias

## 24.1 Catálogo de entidades

| ID | Entidade | Escopo | Finalidade | Chave/unicidade | Ciclo | Regras 17 |
|---|---|---|---|---|---|---|
| ENT-EXP-01 | `pedido_exportacao` | Empresarial ou global, exatamente um | Snapshot autorizado do pedido. | Chave idempotente única por solicitante e intenção. | Temporário com histórico. | EXP-01 a EXP-13 |
| ENT-EXP-02 | `pedido_exportacao_coluna` | Mesmo do pedido | Colunas e tratamento de visibilidade fixados. | Pedido+ordem e pedido+campo únicos. | Imutável. | EXP-01 a EXP-05 |
| ENT-EXP-03 | `pedido_exportacao_filtro` | Mesmo do pedido | Filtros tipados e normalizados. | Pedido+ordem únicos. | Imutável. | EXP-01 a EXP-06 |
| ENT-EXP-04 | `tentativa_geracao_exportacao` | Técnico privado | Execuções e erros seguros. | Pedido+número únicos. | Append-only. | EXP-07 a EXP-09, EXP-13 |
| ENT-EXP-05 | `arquivo_exportacao` | Técnico privado | Arquivo privado temporário. | Um disponível por pedido concluído. | Temporário imutável. | EXP-08 a EXP-12 |

## 24.2 Pedido e snapshot autorizado

`pedido_exportacao` guarda:

| Campo | Tipo | Obrigatório | Regra |
|---|---|---|---|
| `pedido_exportacao_id` | `id` | Sim | PK. |
| `solicitante_usuario_id` | `id` | Sim | Dono exclusivo do arquivo. |
| `escopo_tipo` | `codigo` | Sim | `EMPRESARIAL` ou `GLOBAL`. |
| `empresa_id` | `id` | Condicional | Obrigatório somente no empresarial. |
| `origem_codigo` | `codigo` | Sim | C01, K03, S01, S05, H01 ou H02. |
| `estado` | `codigo` | Sim | Estado canônico do manifesto. |
| `chave_idempotente` / `hash_intencao` | `hash` | Sim | Repetição segura. |
| `operacao_idempotente_id` | `id` | Sim | Liga à fonte transversal de repetição segura. |
| `competencia_versao_id` | `id` | Condicional | Obrigatória em K03 para fixar a versão financeira. |
| `instante_corte_fonte` | `instante` | Sim | Corte lógico para reconstruir a seleção. |
| `pedido_anterior_id` | `id` | Condicional | Liga a nova intenção ao pedido anterior encerrado. |
| `autorizacao_curta_id` | `id` | Condicional | Reautenticação recente de H02 quando exigida. |
| `evento_confirmacao_sensivel_id` | `id` | Condicional | Confirmação auditada para resultado/restrição de ASO. |
| `versao_autorizacao_solicitante` | `versao` | Sim | Snapshot para detectar revogação. |
| `snapshot_fixado_em` | `instante` | Sim | Filtros e colunas não mudam depois. |
| `expira_em` | `instante` | Condicional | Pronto + 24 horas. |
| `indisponivel_em` / `motivo` | `instante` / `codigo` | Condicional | Perda de autorização ou descarte. |
| `versao_lock` | `versao` | Sim | Concorrência do ciclo assíncrono. |

O pedido empresarial e o global são XOR. H02 é global e exclusivo de master com TOTP concluído; S05 contém somente o cadastro global de clínica. O pedido de ASO só inclui resultado/restrição quando todas as permissões cumulativas forem confirmadas e auditadas.

Cada coluna referencia obrigatoriamente o recurso de autorização do campo e registra ordem, cabeçalho, tipo lógico de saída e tratamento fixado: integral autorizado ou mascarado. Campo oculto não recebe linha. Esse snapshot descreve o pedido, mas não substitui a revalidação atual no download.

Cada filtro referencia campo autorizado, operador admitido pelo seu tipo e exatamente um valor tipado entre texto, código, data, competência, número, booleano ou identificador autorizado. Não aceita consulta, fórmula ou expressão livre.

## 24.3 Arquivo e geração

`arquivo_exportacao` referencia `ENT-REC-11 — arquivo_privado` e guarda formato, MIME real, tamanho, hash, criação, expiração e última validação de integridade. Não duplica chave física, proprietário ou regra de privacidade e não existe URL pública permanente.

- pedido sem linhas autorizadas não é criado;
- todo conteúdo é regenerado a partir do snapshot autorizado, nunca de dados trazidos pelo navegador;
- CPF/CNPJ são texto, datas são datas e valores/percentuais são números;
- nenhuma fórmula de negócio é incluída;
- texto iniciado por `=`, `+`, `-` ou `@` é neutralizado contra fórmula de planilha;
- geração falha por inteiro: arquivo vazio, misto entre empresas ou parcialmente autorizado não é entregue;
- download revalida sessão, dono, empresa, rota, ação e campo; `no-store` é obrigatório;
- expiração de sessão não apaga o arquivo antes de 24 horas, mas exige novo login;
- perda de permissão torna-o `INDISPONIVEL` definitivamente;
- falha, expiração ou indisponibilidade exigem novo pedido; o anterior não é reativado;
- não existe importação de retorno, central de exportações ou notificação de conclusão.

## 24.4 Restrições

- `RST-EXP-01` — pedido tem exatamente um escopo e nunca mistura empresas.
- `RST-EXP-02` — arquivo pertence exclusivamente ao solicitante.
- `RST-EXP-03` — pedido e download revalidam autorização em momentos distintos.
- `RST-EXP-04` — mesma chave e intenção recuperam o mesmo pedido; intenção diferente com a mesma chave é rejeitada.
- `RST-EXP-05` — `PRONTO` exige arquivo íntegro e todas as linhas autorizadas.
- `RST-EXP-06` — `EXPIRADO` e `INDISPONIVEL` não voltam a pronto.
- `RST-EXP-07` — arquivo e tentativas nunca alteram estado de negócio, pagamento ou recibo.
- `RST-EXP-08` — pedido, início, conclusão, falha, indisponibilidade, expiração, download e negação geram a auditoria apropriada.
- `RST-EXP-09` — zero linhas não cria pedido operacional nem arquivo; a tentativa segura pode ser auditada conforme política.
- `RST-EXP-10` — K03 fixa uma versão da competência e não mistura valores de versões posteriores.
- `RST-EXP-11` — novo pedido após falha, expiração ou indisponibilidade preserva vínculo com o anterior.

---

# 25. Registro restrito de incidentes

## 25.1 Catálogo de entidades

| ID | Entidade | Escopo | Finalidade | Chave/unicidade | Ciclo | Regras 17 |
|---|---|---|---|---|---|---|
| ENT-INC-01 | `incidente` | Restrito | Identidade, estado e controle de concorrência. | Código único nunca reutilizado. | Raiz versionada. | INC-01 a INC-10 |
| ENT-INC-02 | `incidente_entrada` | Restrito | Linha do tempo e correções. | Incidente+sequência únicos. | Append-only. | INC-02 a INC-09 |
| ENT-INC-03 | `incidente_alcance` | Restrito | Categorias e quantidades conhecidas/estimadas. | Entrada+categoria+ordem. | Imutável por entrada. | INC-01, INC-05, INC-08 |
| ENT-INC-04 | `incidente_empresa_mencionada` | Restrito | Registra possível/confirmado alcance empresarial. | Alcance+empresa únicos. | Append-only. | INC-01, INC-05 |
| ENT-INC-05 | `incidente_referencia_evidencia` | Restrito | Referência para localização segura externa. | Entrada+ordem únicas. | Append-only. | INC-01, INC-03, INC-04 |

## 25.2 Incidente e linha do tempo

`incidente` contém código, estado `ABERTO`, `EM_TRATAMENTO` ou `CONCLUIDO`, datas percebida e de conhecimento, registrador e `versao_lock`. A descrição inicial é a primeira entrada, não um campo que possa ser reescrito, e não existe “versão corrente” sem entidade de versão.

`incidente_entrada` contém sequência, categoria controlada, descrição objetiva, autor, instante do servidor, estado anterior/final quando houver transição, entrada corrigida quando aplicável e chave idempotente. Entrada anterior nunca é editada; correção acrescenta outra linha explicitamente relacionada.

Categorias abrangem registro inicial, contenção, evidência, alcance, correção, restauração, avaliação jurídica/LGPD, comunicações já realizadas, decisão, monitoramento, conclusão, melhoria, reabertura e correção relacionada.

Campos estruturados condicionais de `incidente_entrada`:

| Campo | Obrigatório | Regra |
|---|---|---|
| `responsavel_referenciado` | Condicional | Avaliação jurídica/LGPD. |
| `data_referenciada` | Condicional | Avaliação, decisão ou comunicação. |
| `conclusao_codigo` | Condicional | Conclusão controlada da avaliação. |
| `decisao_codigo` | Condicional | Decisão humana registrada, nunca automática. |
| `justificativa` | Condicional | Avaliação, desconhecimento, conclusão, correção ou reabertura. |
| `prazo_aplicavel` | Condicional | Quando a avaliação definir prazo. |
| `destinatario_comunicacao_codigo` | Condicional | ANPD ou titulares, somente para comunicação realizada. |
| `protocolo_referencia` | Condicional | Referência segura da comunicação externa. |
| `entrada_decisao_id` | Condicional | Comunicação aponta para a decisão anterior. |
| `operacao_idempotente_id` | Sim | Uma criação/entrada por operação confirmada. |

Avaliação jurídica/LGPD exige responsável, data, conclusão, decisão e justificativa. Comunicação exige decisão anterior, destinatário, data e protocolo/referência. JSON livre não substitui esses campos.

`incidente_alcance` pertence a uma entrada e guarda categoria, quantidade, marcador conhecida/estimada/desconhecida e justificativa. `incidente_empresa_mencionada` pertence a um alcance/entrada e não concede associação, perfil, contexto ou acesso operacional à empresa. A referência de evidência pertence a uma entrada e guarda somente descrição segura, localização externa protegida e classificação; não há upload na primeira versão.

## 25.3 Conclusão e acesso

O fechamento transacional exige entradas que comprovem:

1. alcance final ou justificativa de desconhecido;
2. contenção;
3. correção ou decisão documentada;
4. avaliação jurídica/LGPD;
5. situação das comunicações aplicáveis;
6. conclusão objetiva;
7. melhoria ou justificativa para nenhuma melhoria.

Reabrir exige permissão cumulativa, TOTP quando master, reautenticação, justificativa e versão atual; preserva a conclusão e volta para `EM_TRATAMENTO`, nunca para aberto.

Permissões de registrar, consultar, acompanhar e concluir/reabrir são independentes e cumulativas conforme o Documento 17. Quem só registra recebe a confirmação do próprio envio, sem lista, contador, identidade ou conteúdo de outros registros.

## 25.4 Restrições

- `RST-INC-01` — estado, nova entrada e auditoria concluem na mesma transação.
- `RST-INC-02` — identificador e sequências não são reutilizados.
- `RST-INC-03` — linha do tempo, incidente e auditoria permanecem por no mínimo seis anos.
- `RST-INC-04` — não há exclusão física, edição retroativa ou entrada em incidente concluído sem reabertura.
- `RST-INC-05` — sistema apenas registra avaliação e comunicação; não decide obrigação jurídica nem envia comunicação.
- `RST-INC-06` — texto livre bloqueia senha, token, segredo, chave privada, resultado clínico e cópia de base ou identificador pessoal integral desnecessário.
- `RST-INC-07` — empresa mencionada não amplia acesso empresarial.
- `RST-INC-08` — auditoria correlacionada a incidente só é exibida com autorização restrita atual; H02 comum não revela sua existência ou metadados.

---

# 26. Auditoria, acesso sensível, idempotência e concorrência

## 26.1 Catálogo de entidades

| ID | Entidade | Escopo | Finalidade | Chave/unicidade | Ciclo | Regras 17 |
|---|---|---|---|---|---|---|
| ENT-AUD-01 | `evento_auditoria` | Global, empresarial ou restrito | Fonte única das ações auditáveis. | Operação+sequência únicos. | Append-only. | §3.3, H01/H02, todos os blocos mutáveis |
| ENT-AUD-02 | `mudanca_campo_auditoria` | Mesmo do evento | Antes/depois autorizado por campo. | Evento+ordem únicos. | Append-only. | B03-PRF, histórico do colaborador |
| ENT-AUD-03 | `acesso_sensivel_auditoria` | Mesmo do recurso | Consulta, revelação, exportação ou download sensível. | Evento+recurso+ordem. | Append-only. | ASO-R04, EXP, recibos, H01/H02 |
| ENT-AUD-04 | `correlacao_evento_auditoria` | Mesmo do evento | Liga o evento às raízes usadas pelos históricos contextuais. | Evento+correlação tipada únicos. | Append-only. | §3.3, C08, M06, H01 a H03 |
| ENT-TEC-01 | `operacao_idempotente` | Técnico com escopo | Fonte única da repetição segura e reconciliação. | Ator+escopo+chave únicos. | Raiz versionada. | CON-03 a CON-05, UI-14, UI-18/19 |
| ENT-TEC-02 | `tentativa_operacao` | Técnico privado | Tentativas, conflitos e falhas seguras. | Operação+sequência únicos. | Append-only. | CON-01 a CON-10 |

## 26.2 Evento de auditoria

Campos mínimos:

| Campo | Obrigatório | Regra |
|---|---|---|
| `evento_auditoria_id`, `ocorrido_em` | Sim | ID imutável e instante do servidor. |
| `escopo_tipo`, `empresa_id` | Sim/condicional | Empresa obrigatória somente no evento empresarial. |
| `ator_usuario_id`, `sessao_id` | Condicional | Ator de sistema é explicitamente classificado. |
| `operacao_idempotente_id`, `correlacao_lote_id` | Condicional | Une comando, itens e efeitos. |
| `transicao_documento17_id` | Sim para ação funcional | ID aprovado que autorizou a mudança. |
| `acao_codigo`, `resultado_codigo` | Sim | Catálogos controlados. |
| `entidade_tipo`, `entidade_id` | Sim | Alvo descritivo; não substitui FK do domínio. |
| `versao_anterior`, `versao_final` | Condicional | Concorrência e reconstrução. |
| `justificativa`, `referencia_erro_segura` | Condicional | Conforme transição. |
| `ip_rede`, `navegador_identificacao` | Condicional | Classificação e retenção ainda pré-produção. |

A dupla descritiva `entidade_tipo + entidade_id` é permitida apenas na trilha transversal: ela não concede acesso nem garante integridade do negócio. Mudanças críticas ainda possuem suas FKs reais nas entidades de domínio.

O resultado mínimo é `SUCESSO`, `NEGADO`, `FALHA` ou `CANCELADO`. Validação, conflito e resposta incerta são motivos controlados do resultado, não novos resultados mínimos.

`correlacao_evento_auditoria` usa FKs tipadas para empresa, pessoa, vínculo, prestador MEI, contrato, competência, participante, grupo, desligamento, exame de ASO ou incidente. Cada linha preenche exatamente uma correlação. Ela localiza e autoriza históricos, sem conceder acesso.

`mudanca_campo_auditoria` guarda campo canônico, classificação e valores canônicos anterior/novo em armazenamento protegido. Para nome, endereço, salário-base, RA e demais campos cujo antes/depois integra o histórico aprovado, hash isolado não substitui os valores recuperáveis pelo prazo mínimo. Senha, token, TOTP, segredo, código de recuperação e chave privada nunca entram na trilha. A permissão atual do observador é aplicada antes de apresentar antes/depois.

## 26.3 Duas consultas, uma única fonte

- o histórico dentro do colaborador é uma projeção de `evento_auditoria` filtrada por pessoa, vínculo, condições financeiras, competências, pagamentos, desligamentos e ASOs autorizados;
- a auditoria empresarial/global é outra projeção da mesma fonte, com filtros e escopo próprios;
- não existe tabela paralela de “histórico do colaborador”;
- resultado de ASO e valores financeiros só aparecem quando a permissão atual correspondente também existir;
- acesso sensível relevante gera `acesso_sensivel_auditoria` sem armazenar novamente o dado revelado.
- H01 e H02 abrem nos últimos 30 dias e cada pesquisa interativa aceita no máximo 366 dias;
- H01 exige uma empresa; H02 é global e exclusivo de master; evento restrito de incidente exige também sua autorização própria.

## 26.4 Operação idempotente e resposta incerta

`operacao_idempotente` guarda ator, escopo, empresa opcional, chave, hash da intenção canônica, ação, alvo, estado técnico, início/fim, hash/referência segura do resultado e versão.

Estados técnicos persistidos: `EM_PROCESSAMENTO`, `CONCLUIDA` e `FALHA_SEM_COMMIT`. A ausência antes da primeira recepção não é armazenada. `RESPOSTA_INCERTA` pertence à interação/reconciliação de UI-14; enquanto a fonte não provar conclusão ou ausência de commit, a operação permanece bloqueada para repetição e é consultada pela mesma chave.

- mesma chave, ator, escopo e intenção devolvem o andamento ou resultado anterior;
- mesma chave com intenção diferente é rejeitada;
- resultado incerto é reconciliado contra a fonte autoritativa antes de nova tentativa;
- a nova tentativa explícita após ausência confirmada usa intenção preservada e política de chave documentada no contrato de API;
- operações definidas como atômicas não publicam subconjunto de efeitos;
- falha na auditoria obrigatória reverte negócio, versão, notificação e documento da mesma transação.

Unicidade lógica:

```text
ator + tipo de escopo + identificador normalizado do escopo + chave
```

O identificador é a empresa, o incidente restrito ou o marcador global correspondente.

## 26.5 Concorrência e revogação

- toda raiz mutável usa versão de concorrência;
- atualização condiciona a versão esperada e incrementa exatamente uma vez;
- versão antiga retorna conflito, nunca sobrescreve ou mescla silenciosamente;
- autorizações possuem revisão crescente por usuário; sessão carrega o snapshot dessa revisão;
- cada leitura sensível e cada mutação revalidam revisão, contexto, empresa, ação e campo;
- revogação efetiva impede o commit e limpa o conteúdo na próxima resposta;
- a granularidade física da revogação de sessões será fechada no Documento 20, sem admitir cache de autorização obsoleto.

## 26.6 Retenção e integridade

Eventos funcionais, acessos sensíveis exigidos, correções e incidentes têm retenção mínima de seis anos. A política posterior ao mínimo e os prazos específicos de IP/navegador serão decididos antes da produção. Particionamento ou arquivamento pode mudar o local físico, nunca a continuidade lógica nem a autorização.

---

# 27. Projeções derivadas unificadas

## 27.1 Princípio

Projeção é uma leitura determinística de fontes persistidas. Ela não possui formulário próprio, não recebe enum editável e não cria uma segunda verdade. Pode ser implementada por consulta, visão, materialização reconstruível ou serviço de leitura, desde que a fórmula, a versão e o isolamento sejam preservados.

## 27.2 Catálogo de projeções

| ID | Projeção | Fontes principais | Regra |
|---|---|---|---|
| PRJ-EMP-01 | Modo histórico da empresa | Empresa e contexto | Empresa inativa permite somente consultas históricas autorizadas. |
| PRJ-ACL-01 | Permissão efetiva | Usuário, papel, associação, perfil, ação, campo e revisão | Aplica a interseção mais restritiva; campo nunca amplia ação. |
| PRJ-ACL-02 | Master apto | Usuário, senha, primeiro acesso, TOTP, bloqueios e, para membro inicial, bootstrap consumido/ativação conjunta | Só conta na contingência quem satisfaz todos os requisitos; membro aguardando o par nunca conta. |
| PRJ-ACL-03 | Autorização restrita efetiva | Usuário, versão de `autorizacao_incidente`, permissões cumulativas, função nominal, sessão, escopo e revisão | É independente de papel/perfis; só existe para usuário elegível, autorização vigente e escopo restrito revalidado. |
| PRJ-CTX-01 | Contexto efetivo | Sessão, revisão, empresa e escopo | Só existe enquanto todos os elementos atuais permanecem válidos. |
| PRJ-COL-01 | Condição de registro | Início, admissão e data operacional | Separa sem registro de formalmente registrado. |
| PRJ-COL-02 | Tipo de encerramento | Desligamento vigente e admissão | Não encerrado, encerrado sem registro ou demitido formalmente. |
| PRJ-COL-03 | Total salarial acordado | Salário-base vigente + RA vigente | Somente leitura; nunca editável. |
| PRJ-COL-04 | Histórico do colaborador | Auditoria e correlações tipadas | Filtrado por colaborador, empresa e permissões atuais. |
| PRJ-MEI-01 | Situação temporal do contrato | Início e encerramento previsto/efetivo | Futuro, ativo, encerramento programado ou encerrado. |
| PRJ-MEI-02 | Continuidade contratual | Vigências e intervalos | Renovação contínua permanece no contrato; interrupção cria outro. |
| PRJ-FIN-01 | Aplicabilidade da condição | Competência e vigências | Futuro, vigente, fim programado ou encerrado são calculados. |
| PRJ-CPT-01 | Indicador “Em pagamentos” | Grupos prontos ainda não pagos | Não substitui estado oficial da competência. |
| PRJ-CPT-02 | Checklist de fechamento | K06, grupos, pagamentos, ajustes, correções e documentos | Fecha somente quando todos os requisitos aplicáveis estão resolvidos. |
| PRJ-CPT-03 | Participante aplicável | Vínculo/contrato e intervalo | Inclui sem duplicidade quando há direito em parte do mês. |
| PRJ-PAG-01 | Total devido por evento | Componentes finais dos grupos aplicáveis | Sem compensar grupos independentes. |
| PRJ-PAG-02 | Saldo de verba | Devido proporcional menos pago da própria verba | Nunca deduz verba diferente. |
| PRJ-PAG-03 | Elegibilidade do adiantamento | Primeira/última competência, grupo/verba, datas controladoras e pagamento real | Oficial usa admissão; RA, complementos e PSR usam início das atividades; MEI usa início do contrato. Dia 1 a 15 permite adiantamento conforme a configuração; dia 16 em diante leva o devido ao final. Renovação MEI contínua não reaplica o corte. Na última competência MEI, `fim_aplicavel <= data_prevista_adiantamento` sem pagamento efetivo zera o grupo de adiantamento e redireciona toda a base proporcional ao final, sem recibo de adiantamento. |
| PRJ-DES-01 | Situação temporal do desligamento/vínculo | Início, saída e data operacional | Futuro, ativo, encerramento programado, último dia ativo ou inativo. |
| PRJ-DES-02 | Situação financeira do desligamento | Saída, competência final, dados, grupos e correções | Precedência definida na seção 21.7. |
| PRJ-ASO-01 | Restrição | Resultado vigente | Sem restrição, com restrição, N/A ou inexistente. |
| PRJ-ASO-02 | Prazo | Vencimento e data operacional | Sem prazo, vigente, vencendo em até 30 dias, vencido ou N/A. |
| PRJ-ASO-03 | Classificação da referência | Referência ativa e versões do exame | Ativa, informativa, suprimida ou não aplicável. |
| PRJ-NOT-01 | Central e contador | Ocorrência, leitura, urgência e permissão | Só ativa+não lida+autorizada entra no sino. |
| PRJ-REC-01 | Elegibilidade de recibo | Pagamento, grupo, valor e tipo | Definitivo somente após pagamento integral e valor positivo. |
| PRJ-EXP-01 | Elegibilidade de download | Pedido, arquivo, prazo, dono, escopo e permissão | Arquivo pronto pode ser negado sem alterar seu histórico. |
| PRJ-INC-01 | Checklist do incidente | Entradas e detalhes estruturados | Exige comprovação dos sete requisitos aprovados. |
| PRJ-SEG-01 | Aviso de inatividade | Última atividade humana e relógio | Aviso aos 25 minutos; expiração aos 30. |

## 27.3 Segurança e reconstrução

- empresa e permissão são aplicadas antes de total, filtro, ordenação, paginação e contagem;
- projeção que mistura fontes exige todas as permissões cumulativas;
- campo oculto é omitido antes do cálculo visível, sem permitir inferência por diferença de totais;
- materialização possui empresa, versão da regra, instante de construção e mecanismo de invalidação; pode ser descartada e refeita;
- relógio diário não cria versões históricas apenas para mudar rótulo temporal;
- nenhum estado derivado pode ser alterado por API ou importação.

---

# 28. Manifesto técnico de estados

## 28.1 Contrato do manifesto

Este manifesto é vinculante para enums, restrições, projeções, APIs, testes e auditoria.

| Natureza | Significado |
|---|---|
| <code>raiz</code> | Estado inicial alcançável de um eixo. Pode corresponder a um valor persistido ou à ausência comprovada da entidade, conforme a coluna de armazenamento. |
| <code>persistido</code> | Estado não terminal gravado em entidade ou versão própria. |
| <code>derivado</code> | Projeção calculada de fontes persistidas; não possui comando de edição nem coluna de estado própria. |
| <code>terminal operacional</code> | Encerra o fluxo comum daquela entidade ou versão. Consulta continua permitida; eventual alteração usa correção, reabertura, sucessor ou nova entidade expressamente autorizada. |

Regras de interpretação:

- <code>—</code> significa ausência da entidade e nunca integra enum;
- <code>N/A</code> significa não aplicabilidade derivada e nunca é livremente editável;
- “correção autorizada” não é uma saída comum: exige a permissão, justificativa, versão e auditoria previstas no Documento 17;
- resultados transversais como falta de permissão, conflito e resposta incerta preservam o último estado persistido;
- estados de UI são efêmeros e nunca substituem estados de negócio;
- estado derivado é recalculado depois de toda mudança de sua fonte;
- pagamento real e evento de auditoria são fatos imutáveis, não eixos de estado;
- versões numéricas <code>n</code>/<code>n+1</code>, seleção local, mutação preparada e tarefa preparada são condições técnicas, não enums de negócio.

## 28.2 Autenticação, credenciais e sessão

| ID EST | Eixo | Estado | Natureza | Armazenamento/fonte | Condição de entrada | Saídas comuns | Correção autorizada |
|---|---|---|---|---|---|---|---|
| EST-AUT-PA-01 | Primeiro acesso | <code>PENDENTE</code> | raiz | <code>usuario.estado_primeiro_acesso</code>; credencial temporária vigente | Convite ou reenvio válido | Concluir senha → <code>CONCLUIDO</code>; expirar 24h → <code>VENCIDO</code> | Reenvio B03-USR-04 invalida a credencial anterior e cria nova validade |
| EST-AUT-PA-02 | Primeiro acesso | <code>CONCLUIDO</code> | terminal operacional | <code>usuario.estado_primeiro_acesso</code> | Senha definitiva aceita em B01-AUT-08 | Nenhuma no eixo de primeiro acesso | Recuperação troca a senha, não este estado |
| EST-AUT-PA-03 | Primeiro acesso | <code>VENCIDO</code> | persistido | <code>usuario.estado_primeiro_acesso</code>; expiração da credencial | Passar 24h sem consumo | Reenvio → <code>PENDENTE</code> | Somente nova credencial por B03-USR-04 |
| EST-AUT-BL-01 | Bloqueio de autenticação | <code>LIVRE</code> | raiz | Ausência de <code>bloqueio_autenticacao</code> ativo ou prazo terminado | Conta sem janela de bloqueio vigente | Quinta falha válida → <code>BLOQUEADO_TEMPORARIAMENTE</code> | Correção da origem técnica; nunca altera bloqueio administrativo |
| EST-AUT-BL-02 | Bloqueio de autenticação | <code>BLOQUEADO_TEMPORARIAMENTE</code> | persistido | <code>bloqueio_autenticacao</code> com início e fim | Quinta tentativa válida do controle | Fim de 15 minutos → <code>LIVRE</code> | Somente correção técnica auditada de prazo indevido |
| EST-AUT-TC-01 | Credencial TOTP | <code>NAO_APLICAVEL</code> | derivado | Usuário comum, sem credencial TOTP exigível | Papel sistêmico comum | Promoção a master → <code>PENDENTE</code> | Corrigir o papel sistêmico |
| EST-AUT-TC-02 | Credencial TOTP | <code>PENDENTE</code> | raiz | <code>credencial_totp.estado</code> ou exigência master sem configuração | Convite/promoção de master | Configurar → <code>CONFIGURADA</code> | Reset administrativo mantém ou recria a pendência controlada |
| EST-AUT-TC-03 | Credencial TOTP | <code>CONFIGURADA</code> | persistido | <code>credencial_totp.estado</code>; segredo atual cifrado | B01-AUT-13 ou B03-MST-07 concluído | Reset → <code>REDEFINICAO_EXIGIDA</code> | Nova configuração gera versão e invalida segredo/série anteriores |
| EST-AUT-TC-04 | Credencial TOTP | <code>REDEFINICAO_EXIGIDA</code> | persistido | Nova versão de <code>credencial_totp</code> e autorização curta | Reset normal, contingência ou reativação sem TOTP válido | Configurar em A03 → <code>CONFIGURADA</code> | Reemitir autorização curta sem restaurar segredo anterior |
| EST-AUT-BM-01 | Membro do bootstrap master | <code>PENDENTE_PRIMEIRO_ACESSO</code> | raiz | <code>bootstrap_master_inicial.estado_membro</code> | Commit único cria exatamente os dois membros | Próprio titular conclui senha/TOTP → <code>PRONTO_AGUARDANDO_PAR</code> | Repetir/reconciliar a intenção; nunca ativar manualmente |
| EST-AUT-BM-02 | Membro do bootstrap master | <code>PRONTO_AGUARDANDO_PAR</code> | persistido | Mesmo campo; senha, TOTP e recuperação próprios válidos | Titular conclui seu fluxo pessoal | Segundo membro pronto → ambos <code>ATIVADO_CONJUNTAMENTE</code> na mesma transação | Corrigir somente a própria credencial pelo fluxo permitido; sem aptidão operacional |
| EST-AUT-BM-03 | Membro do bootstrap master | <code>ATIVADO_CONJUNTAMENTE</code> | terminal operacional | Mesmo campo e instante conjunto idêntico nos dois membros | Validação dos dois sob lock no commit final | Nenhuma saída do eixo | Gestão posterior usa os fluxos comuns de master; o bootstrap não reabre |
| EST-AUT-BG-01 | Agregado bootstrap master | <code>ABERTO</code> | raiz | <code>bootstrap_master_inicial.estado_bootstrap</code> | Criação singleton com dois membros pendentes | Commit conjunto → <code>CONSUMIDO</code> | Falha parcial não muda para consumido; reconciliar a mesma intenção |
| EST-AUT-BG-02 | Agregado bootstrap master | <code>CONSUMIDO</code> | terminal operacional | Mesmo campo, instante, hash da intenção e auditoria | Ambos ativados conjuntamente no mesmo commit | Nenhuma; invocação e replay executável são recusados | Consulta apenas da evidência; nunca recriar ou reabrir |
| EST-AUT-FS-01 | Fator TOTP da sessão | <code>NAO_CONCLUIDO</code> | raiz | <code>sessao_usuario.totp_concluido = falso</code> | Nova sessão master antes do segundo fator | Código válido → <code>CONCLUIDO</code> | Reiniciar login; nunca marcar manualmente |
| EST-AUT-FS-02 | Fator TOTP da sessão | <code>CONCLUIDO</code> | persistido | <code>sessao_usuario.totp_concluido = verdadeiro</code> após validação corrente | B01-AUT-14 ou B01-AUT-15 | Termina com a sessão | Nova sessão exige novo fator; reset revoga a sessão |
| EST-AUT-SE-01 | Sessão | <code>NAO_AUTENTICADA</code> | raiz | Ausência de sessão autenticada válida | Entrada pública, logout, expiração ou revogação | Senha válida → etapa correspondente | Novo login cria nova sessão; sessão antiga não é reativada |
| EST-AUT-SE-02 | Sessão | <code>SENHA_TEMPORARIA_ACEITA</code> | persistido | <code>sessao_usuario.estado_sessao</code> restrito à A02 | Credencial temporária válida | Definir senha → comum sem empresa ou master restrito A03 | Reiniciar primeiro acesso com credencial válida |
| EST-AUT-SE-03 | Sessão | <code>SENHA_DEFINITIVA_ACEITA_TOTP_PENDENTE</code> | persistido | <code>sessao_usuario.estado_sessao</code> | Master apto com senha válida e TOTP configurado; membro inicial somente depois do consumo/ativação conjunta | Segundo fator → <code>AUTENTICADA_SEM_EMPRESA</code> | Reiniciar login após bloqueio, expiração ou falha |
| EST-AUT-SE-04 | Sessão | <code>RESTRITA_A03</code> | persistido | Estado da sessão e finalidade restrita | Master com TOTP pendente, redefinição exigida ou membro de bootstrap ainda não ativado conjuntamente | Configuração/consulta do estado permitida → <code>ENCERRADA</code> | Nova autorização curta conforme B01-AUT-17; bootstrap nunca ganha escopo operacional |
| EST-AUT-SE-05 | Ciclo da sessão | <code>AUTENTICADA</code> | persistido | <code>sessao_usuario.estado_sessao = AUTENTICADA</code> | Login/TOTP completo | Trocar escopo preserva o ciclo; expirar, encerrar ou revogar termina | Nova autenticação após estado terminal |
| EST-AUT-SP-01 | Projeção composta da sessão | <code>AUTENTICADA_SEM_EMPRESA</code> | derivado | Sessão autenticada + <code>tipo_escopo = SEM_EMPRESA</code> | Login completo ou saída de contexto | Selecionar empresa, global ou incidente; encerrar | Corrigir/revalidar fontes |
| EST-AUT-SP-02 | Projeção composta da sessão | <code>CONTEXTO_EMPRESARIAL</code> | derivado | Sessão autenticada + <code>tipo_escopo = EMPRESARIAL</code> e um <code>empresa_id</code> | Empresa autorizada selecionada | Voltar ao seletor; abrir global/incidente; encerrar | Nova seleção explícita |
| EST-AUT-SP-03 | Projeção composta da sessão | <code>ESCOPO_GLOBAL</code> | derivado | Sessão autenticada + <code>tipo_escopo = GLOBAL</code>; empresa nula | Função global autorizada | Voltar ao seletor/empresa; abrir incidente; encerrar | Reentrada explícita |
| EST-AUT-SP-04 | Projeção composta da sessão | <code>ESCOPO_RESTRITO_INCIDENTES</code> | derivado | Sessão autenticada + <code>tipo_escopo = INCIDENTE_RESTRITO</code> | I01/I02 com autorização restrita | Seletor, global ou empresa autorizada | Reentrada explícita; incidente não concede empresa |
| EST-AUT-SE-09 | Sessão | <code>AVISO_INATIVIDADE</code> | derivado | Sessão ativa e relógio entre 25 e 30 minutos de inatividade | Limiar temporal | Continuar → contexto anterior; prazo → expirada; sair → encerrada | Corrigir relógio técnico; não ampliar limite absoluto |
| EST-AUT-SE-10 | Ciclo da sessão | <code>EXPIRADA</code> | terminal operacional | <code>estado_sessao = EXPIRADA</code>, `encerrada_em` e motivo temporal | 30 minutos inativa ou 8 horas absolutas | Nenhuma na mesma sessão | Novo login cria outra sessão |
| EST-AUT-SE-11 | Ciclo da sessão | <code>ENCERRADA</code> | terminal operacional | <code>estado_sessao = ENCERRADA</code>, `encerrada_em` e motivo | Saída explícita ou encerramento obrigatório | Nenhuma na mesma sessão | Novo login |
| EST-AUT-SE-12 | Ciclo da sessão | <code>REVOGADA</code> | terminal operacional | <code>estado_sessao = REVOGADA</code>, `encerrada_em`, motivo e revisão | Evento crítico de segurança/acesso | Nenhuma na mesma sessão | Novo login se elegível |
| EST-AUT-TR-01 | Token de recuperação | <code>NAO_EMITIDO</code> | derivado | Ausência de token elegível | Nenhuma solicitação válida | Solicitar → <code>VIGENTE</code> | Não se aplica |
| EST-AUT-TR-02 | Token de recuperação | <code>VIGENTE</code> | raiz | <code>token_recuperacao_senha</code>; hash e expiração futura | Solicitação elegível | Consumir, vencer ou invalidar | Emitir sucessor invalida o atual |
| EST-AUT-TR-03 | Token de recuperação | <code>CONSUMIDO</code> | terminal operacional | Instante de consumo | Nova senha salva | Nenhuma | Solicitar outro token |
| EST-AUT-TR-04 | Token de recuperação | <code>VENCIDO</code> | terminal operacional | Expiração sem consumo | Completar 30 minutos | Nenhuma | Solicitar outro token |
| EST-AUT-TR-05 | Token de recuperação | <code>INVALIDADO</code> | terminal operacional | Instante e motivo de invalidação | Sucessor, troca de senha ou inativação | Nenhuma | Solicitar outro token quando elegível |

## 28.3 Empresa, contexto e edição local

| ID EST | Eixo | Estado | Natureza | Armazenamento/fonte | Condição de entrada | Saídas comuns | Correção autorizada |
|---|---|---|---|---|---|---|---|
| EST-CTX-EM-01 | Empresa | <code>ATIVA</code> | raiz | <code>empresa.situacao</code> | Criação válida | Inativar sem pendências → <code>INATIVA</code> | Nova versão cadastral; não altera o ciclo |
| EST-CTX-EM-02 | Empresa | <code>INATIVA</code> | terminal operacional | <code>empresa.situacao = INATIVA</code> | B02-EMP-05 | Nenhuma operação ordinária | Não há reativação aprovada; modo histórico é EST-CTX-MO-02 |
| EST-CTX-CS-01 | Contexto da sessão | <code>SEM_EMPRESA</code> | raiz | <code>sessao_usuario.tipo_escopo = SEM_EMPRESA</code> | Login completo ou limpeza de contexto | Empresarial, global ou incidente | Revalidar e selecionar |
| EST-CTX-CS-02 | Contexto da sessão | <code>EMPRESARIAL</code> | persistido | <code>tipo_escopo = EMPRESARIAL</code> e exatamente um <code>empresa_id</code> | Seleção autorizada | Sem empresa, global, incidente ou término | Nova seleção explícita |
| EST-CTX-CS-03 | Contexto da sessão | <code>GLOBAL</code> | persistido | <code>tipo_escopo = GLOBAL</code>; empresa nula | Função global autorizada | Empresa, seletor, incidente ou término | Reentrada explícita |
| EST-CTX-CS-04 | Contexto da sessão | <code>INCIDENTE_RESTRITO</code> | persistido | <code>tipo_escopo = INCIDENTE_RESTRITO</code>; autorização vigente | Abrir I01/I02 | Empresa, seletor, global ou término | Reentrada explícita |
| EST-CTX-CS-05 | Contexto da sessão | <code>CONTEXTO_ANTERIOR_INVALIDADO</code> | terminal operacional | Revisão/contexto atual no servidor e marca da aba antiga | Troca ou revogação | Nenhuma ação pela aba antiga | Reabrir no contexto atual |
| EST-CTX-MO-01 | Modo do contexto empresarial | <code>OPERACIONAL</code> | derivado | Empresa do contexto está ativa | Seleção de empresa ativa | Inativação → histórico | Corrigir a fonte empresarial |
| EST-CTX-MO-02 | Modo do contexto empresarial | <code>HISTORICO</code> | derivado | Empresa do contexto está inativa | Seleção histórica ou inativação | Trocar/sair | Não concede mutação |
| EST-CTX-EL-01 | Edição local | <code>SEM_ALTERACAO</code> | raiz | Memória efêmera da interface | Formulário aberto/recém-salvo | Editar ou processar | Recarregar a fonte |
| EST-CTX-EL-02 | Edição local | <code>ALTERACAO_NAO_SALVA</code> | derivado | Rascunho da sessão e contexto atuais | Campo autorizado alterado | Salvar ou aguardar descarte | Descartar/revisar; nunca armazenamento local |
| EST-CTX-EL-03 | Edição local | <code>AGUARDANDO_DECISAO_DESCARTE</code> | derivado | Modal efêmero | Navegação com rascunho | Permanecer ou descartar | Revalidar antes de preservar |
| EST-CTX-EL-04 | Edição local | <code>PROCESSANDO</code> | derivado | Operação idempotente e UI | Envio válido | Sucesso, falha, conflito ou reconciliação | Reconciliar antes de repetir |

## 28.4 Usuário, papel, perfil e permissões

| ID EST | Eixo | Estado | Natureza | Armazenamento/fonte | Condição de entrada | Saídas comuns | Correção autorizada |
|---|---|---|---|---|---|---|---|
| EST-ACL-US-01 | Usuário | <code>ATIVO</code> | raiz | <code>usuario.situacao_administrativa</code> | Convite, desbloqueio ou reativação | Bloquear ou inativar | Desbloqueio/reativação autorizados |
| EST-ACL-US-02 | Usuário | <code>BLOQUEADO_ADMINISTRATIVAMENTE</code> | persistido | Mesmo campo | B03-USR-05 | Desbloquear ou inativar | B03-USR-06 |
| EST-ACL-US-03 | Usuário | <code>INATIVO</code> | persistido | Mesmo campo | B03-USR-07 | Reativar conforme papel/credenciais | B03-USR-08/09A/09B |
| EST-ACL-PS-01 | Papel sistêmico | <code>COMUM</code> | raiz | <code>usuario.papel_base = COMUM</code> | Convite comum ou rebaixamento | Promover → master TOTP pendente | Promoção/rebaixamento protegidos |
| EST-ACL-PS-02 | Papel sistêmico | <code>MASTER_TOTP_PENDENTE</code> | derivado | Papel master e TOTP não configurado | Convite/promoção ou membro inicial pendente | Configurar → master apto comum ou, no bootstrap, <code>MASTER_BOOTSTRAP_PRONTO_AGUARDANDO_PAR</code> | Corrigir papel ou configurar TOTP |
| EST-ACL-PS-02A | Papel sistêmico | <code>MASTER_BOOTSTRAP_PRONTO_AGUARDANDO_PAR</code> | derivado | Membro em <code>PRONTO_AGUARDANDO_PAR</code> e agregado ainda <code>ABERTO</code> | Próprio titular conclui senha/TOTP | Commit conjunto dos dois → <code>MASTER_APTO</code> | Nunca editar aptidão; concluir o par pelo protocolo singleton |
| EST-ACL-PS-03 | Papel sistêmico | <code>MASTER_APTO</code> | derivado | Conjunção da seção 13.7 | Todos os requisitos verdadeiros | Bloqueio, inativação, rebaixamento ou reset | Restaurar cada fonte; nunca editar aptidão |
| EST-ACL-PS-04 | Papel sistêmico | <code>MASTER_RECONFIGURACAO_TOTP</code> | derivado | Master e redefinição exigida | Reset/reativação controlada | Configurar → master apto | Nova autorização curta |
| EST-ACL-PS-05 | Papel sistêmico | <code>MASTER_NAO_APTO</code> | derivado | Papel master, mas usuário bloqueado/inativo ou fora dos estados TOTP pendente, bootstrap aguardando par, apto e reconfiguração | Bloqueio/inativação ou credencial inválida | Revisar e restaurar fontes → estado master aplicável | Nunca editar aptidão diretamente |
| EST-ACL-CM-00 | Contingência de masters | <code>BOOTSTRAP_INICIAL</code> | derivado | Existe `bootstrap_master_inicial` aberto e nenhuma ativação conjunta | Criação singleton dos dois membros | Consumo conjunto → <code>NORMAL</code> | Não permite operação nem B03-MST-06; resolver pelo protocolo inicial |
| EST-ACL-CM-01 | Contingência de masters | <code>NORMAL</code> | derivado | Ausência de `contingencia_master` aberta e pelo menos dois aptos | Operação normal/conclusão do reset | Exceção formal → degradada | Corrigir fontes de aptidão |
| EST-ACL-CM-02 | Contingência de masters | <code>DEGRADADA</code> | derivado | Existe exatamente uma `contingencia_master` com `conclusao_em` nula | Reset controlado de um dos dois aptos | Novo TOTP e conclusão atômica → normal | Somente concluir a recuperação |
| EST-ACL-AE-01 | Associação empresarial | <code>AUSENTE</code> | derivado | Ausência de associação vigente | Usuário não associado | Associar → vigente | Não se aplica |
| EST-ACL-AE-02 | Associação empresarial | <code>VIGENTE</code> | raiz | <code>usuario_empresa_perfil.situacao = VIGENTE</code>; exatamente um perfil é invariante | Associação/migração | Trocar perfil ou retirar | Nova versão autorizada |
| EST-ACL-AE-03 | Associação empresarial | <code>REMOVIDA</code> | terminal operacional | <code>usuario_empresa_perfil.situacao = REMOVIDA</code> | B03-USR-14 | Nenhuma na versão | Nova associação explícita |
| EST-ACL-AG-01 | Associação global | <code>AUSENTE</code> | derivado | Nenhuma versão atual de `usuario_perfil_global` | Usuário comum sem perfil global | Atribuir → vigente | Não se aplica |
| EST-ACL-AG-02 | Associação global | <code>VIGENTE</code> | raiz | Versão atual com <code>situacao = VIGENTE</code> | B03-USR-15 ou migração | Trocar, retirar ou tornar-se legada | Nova versão autorizativa |
| EST-ACL-AG-03 | Associação global | <code>REMOVIDA</code> | terminal operacional | Versão atual com <code>situacao = REMOVIDA</code> | B03-USR-16 | Nenhuma na versão | Nova atribuição explícita cria outra versão |
| EST-ACL-PF-01 | Perfil empresarial/global | <code>ATIVO</code> | raiz | <code>perfil_versao.situacao</code> | Criação/duplicação | Arquivar | Nova versão da matriz |
| EST-ACL-PF-02 | Perfil empresarial/global | <code>ARQUIVADO</code> | terminal operacional | Mesmo campo | B03-PRF-05/10 | Nenhuma nova atribuição | Criar/duplicar substituto |
| EST-ACL-AP-01 | Associação a perfil | <code>VIGENTE</code> | derivado | Associação empresarial ou global vigente + perfil atual ativo | Atribuição/migração | Arquivamento → legada | Troca/migração |
| EST-ACL-AP-02 | Associação a perfil | <code>LEGADA_MIGRACAO_PENDENTE</code> | derivado | Associação empresarial ou global vigente aponta a perfil arquivado | Arquivamento em uso | Migrar → vigente | B03-PRF-07/11 |
| EST-ACL-AC-01 | Permissão de ação | <code>NEGADA</code> | persistido/derivado por ausência | Ausência da permissão ou <code>perfil_permissao_acao.permitido = falso</code> | Perfil nasce negado ou nova versão nega | Nova versão pode permitir | Nunca ampliar por ausência ou pelo campo |
| EST-ACL-AC-02 | Permissão de ação | <code>PERMITIDA</code> | persistido | <code>perfil_permissao_acao.permitido = verdadeiro</code> e dependências válidas | Matriz autorizada | Nova versão pode negar | A permissão de campo não substitui esta ação |
| EST-ACL-CA-01 | Estado de campo | <code>OCULTO</code> | persistido | <code>perfil_permissao_campo</code> | Matriz salva | Nova versão pode mudar | Nova versão; nunca sobrescrever histórico |
| EST-ACL-CA-02 | Estado de campo | <code>MASCARADO</code> | persistido | Mesmo snapshot e estratégia de máscara | Matriz salva | Nova versão | Valor integral nunca chega ao cliente |
| EST-ACL-CA-03 | Estado de campo | <code>VISIVEL_SEM_EDICAO</code> | persistido | Mesmo snapshot | Matriz salva | Nova versão | Respeitar dependências |
| EST-ACL-CA-04 | Estado de campo | <code>VISIVEL_E_EDITAVEL</code> | persistido | Mesmo snapshot e ação editar | Matriz coerente | Nova versão | Edição também depende do negócio |
| EST-ACL-AI-01 | Autorização de incidente | <code>AUSENTE</code> | derivado | Ausência de autorização atual | Usuário não designado | Designar → vigente | Não se aplica |
| EST-ACL-AI-02 | Autorização de incidente | <code>VIGENTE</code> | raiz | <code>autorizacao_incidente.situacao = VIGENTE</code> | B03-INC-01/05 | Alterar ou revogar | Nova versão autorizativa |
| EST-ACL-AI-03 | Autorização de incidente | <code>REVOGADA</code> | terminal operacional | Versão revogada | B03-INC-03/04 | Nenhuma na versão | B03-INC-05 cria nova versão |

## 28.5 Pessoa e vínculo empregado

| ID EST | Eixo | Estado | Natureza | Armazenamento/fonte | Condição de entrada | Saídas comuns | Correção autorizada |
|---|---|---|---|---|---|---|---|
| EST-COL-ST-01 | Situação temporal do vínculo | <code>FUTURO</code> | derivado | Datas atuais do vínculo e desligamento | Início posterior à data operacional | Data inicial → ativo; programação → encerramento programado | B04-VIN-08/09 ou D12-07 |
| EST-COL-ST-02 | Situação temporal do vínculo | <code>ATIVO</code> | derivado | Início alcançado e saída não efetiva | Virada da data inicial ou cancelamento válido | Programar saída; último dia ativo | Corrigir datas/fontes |
| EST-COL-ST-03 | Situação temporal do vínculo | <code>ENCERRAMENTO_PROGRAMADO</code> | derivado | Ciclo programado com saída futura | D12-01 | Data da saída → último dia ativo; cancelar → futuro/ativo | D12-05/07/07A |
| EST-COL-ST-04 | Situação temporal do vínculo | <code>ULTIMO_DIA_ATIVO</code> | derivado | Data operacional igual à saída inclusiva | D12-02/03 | Dia seguinte → inativo | D12-07/07A |
| EST-COL-ST-05 | Situação temporal do vínculo | <code>INATIVO</code> | derivado | Data posterior à saída efetiva | D12-04 ou saída retroativa | Nenhuma saída comum | D12-07/07A; nunca inativação/reativação manual |
| EST-COL-RG-01 | Condição de registro | <code>SEM_REGISTRO</code> | derivado | Admissão ausente ou futura e início alcançado | Vínculo ativo sem admissão alcançada | Admissão alcançada → registrado | Corrigir versão das datas; impacto usa F04 |
| EST-COL-RG-02 | Condição de registro | <code>REGISTRADO_FORMALMENTE</code> | derivado | Admissão válida e alcançada | B04-VIN-06A/07 | Permanece até encerramento | Correção versionada; não apagar histórico |
| EST-COL-TE-01 | Tipo de encerramento | <code>NAO_ENCERRADO</code> | derivado | Ausência de ciclo efetivo ou cancelado reconciliado | Vínculo sem saída | Registrar saída → tipo aplicável | Corrigir/cancelar desligamento |
| EST-COL-TE-02 | Tipo de encerramento | <code>ENCERRADO_SEM_REGISTRO</code> | terminal operacional | <code>desligamento_versao.tipo_encerramento</code> | Saída sem admissão | Nenhuma no vínculo | D12-07/07A; recontratação cria vínculo |
| EST-COL-TE-03 | Tipo de encerramento | <code>DEMITIDO_FORMALMENTE</code> | terminal operacional | Mesmo campo | Saída com admissão | Nenhuma no vínculo | D12-07/07A; recontratação cria vínculo |
| EST-COL-CP-01 | Cadastro da pessoa | <code>VIGENTE</code> | raiz | <code>pessoa_empresa.versao_atual_id</code> | Criação ou nova versão atual | Correção → nova versão | B04-VIN-04/05 |
| EST-COL-CP-02 | Cadastro da pessoa | <code>CORRIGIDO_EM_NOVA_VERSAO</code> | terminal operacional | Versão anterior imutável e sucessora atual | Nome, endereço ou CPF corrigido | Nenhuma na versão histórica | Outra correção cria versão posterior |

## 28.6 Prestador e contrato MEI

| ID EST | Eixo | Estado | Natureza | Armazenamento/fonte | Condição de entrada | Saídas comuns | Correção autorizada |
|---|---|---|---|---|---|---|---|
| EST-MEI-CP-01 | Cadastro do prestador | <code>VIGENTE</code> | raiz | Ponteiro atual de <code>prestador_mei</code> | Criação ou nova versão | Correção cadastral | B05-MEI-04/05 |
| EST-MEI-CP-02 | Cadastro do prestador | <code>CORRIGIDO_EM_NOVA_VERSAO</code> | terminal operacional | Versão anterior imutável | Cadastro corrigido | Nenhuma na versão antiga | Nova versão posterior |
| EST-MEI-ST-01 | Situação temporal do contrato | <code>FUTURO</code> | derivado | Início/fim aplicável e data operacional | Início futuro | Data inicial → ativo | B05-CON-06/06B/06C |
| EST-MEI-ST-02 | Situação temporal do contrato | <code>ATIVO</code> | derivado | Hoje dentro do intervalo aplicável | Início alcançado/renovação contínua | Encerramento programado ou encerrado | Corrigir versão contratual |
| EST-MEI-ST-03 | Situação temporal do contrato | <code>ENCERRAMENTO_PROGRAMADO</code> | derivado | Encerramento efetivo futuro | B05-CON-06/06C | Dia seguinte ao fim → encerrado | B05-CON-06C/06D |
| EST-MEI-ST-04 | Situação temporal do contrato | <code>ENCERRADO</code> | derivado | Hoje posterior ao fim aplicável | B05-CON-05/06A/06D | Nenhuma no contrato | B05-CON-06B; retorno cria novo contrato |
| EST-MEI-RN-01 | Renovação | <code>NAO_PROGRAMADA</code> | derivado | Ausência de `renovacao_contrato_mei` para a vigência corrente | Contrato sem renovação pendente | Programar → programada | Não se aplica |
| EST-MEI-RN-02 | Renovação | <code>PROGRAMADA</code> | persistido | `renovacao_contrato_mei.estado = PROGRAMADA` | B05-CON-02 | Data seguinte → iniciada; nova vigência passa a não programada | B05-CON-03 |
| EST-MEI-RN-03 | Renovação | <code>INICIADA</code> | terminal operacional | `renovacao_contrato_mei.estado = INICIADA` | B05-CON-04 | Contrato segue ativo; o ciclo histórico é preservado | Corrigir versões das vigências, nunca reutilizar a renovação |
| EST-MEI-CT-01 | Continuidade | <code>CONTINUA</code> | derivado | Vigências consecutivas do mesmo contrato | Renovação no dia seguinte | Fim sem renovação → interrompida | Corrigir vigências |
| EST-MEI-CT-02 | Continuidade | <code>INTERROMPIDA</code> | derivado | Contrato encerrado sem continuidade | B05-CON-05/06A | Retorno cria novo contrato | Corrigir fim aplicável |
| EST-MEI-VC-01 | Vigência de valor/condições | <code>FUTURA</code> | derivado | Vigência ainda não alcançada | Nova condição futura | Data inicial → vigente | Nova versão sem sobreposição |
| EST-MEI-VC-02 | Vigência de valor/condições | <code>VIGENTE</code> | derivado | Data dentro do intervalo | Início alcançado | Fim/substituição → encerrada | Nova versão; impacto pago usa F04 |
| EST-MEI-VC-03 | Vigência de valor/condições | <code>ENCERRADA_SUBSTITUIDA</code> | terminal operacional | Vigência histórica terminada/sucedida | Fim ou substituição | Nenhuma na versão | Nova versão corretiva |

## 28.7 Condições financeiras

| ID EST | Eixo | Estado | Natureza | Armazenamento/fonte | Condição de entrada | Saídas comuns | Correção autorizada |
|---|---|---|---|---|---|---|---|
| EST-FIN-CV-01 | Condição versionada | <code>NAO_CONFIGURADA</code> | derivado | Ausência de vigência aplicável | Nenhuma versão criada | Criar → futura/vigente | Não se aplica |
| EST-FIN-CV-02 | Condição versionada | <code>FUTURA</code> | derivado | Intervalo inicia depois | Nova versão futura | Início → vigente | Substituir por nova versão |
| EST-FIN-CV-03 | Condição versionada | <code>VIGENTE</code> | derivado | Competência dentro do intervalo | Início alcançado | Programar fim/substituir | Nova versão; pago/fechado usa F04 |
| EST-FIN-CV-04 | Condição versionada | <code>ENCERRAMENTO_PROGRAMADO</code> | derivado | Fim inclusivo futuro | Programação de fim | Competência posterior → encerrada | Remover/alterar fim por versão |
| EST-FIN-CV-05 | Condição versionada | <code>ENCERRADA_SUBSTITUIDA</code> | terminal operacional | Intervalo encerrado ou versão sucedida | Fim/substituição | Nenhuma na versão | Nova versão corretiva |
| EST-FIN-OP-01 | Origem do percentual | <code>PADRAO_EMPRESARIAL</code> | derivado | Nenhuma exceção individual aplicável | Padrão vigente | Exceção começa → individual | Corrigir vigências |
| EST-FIN-OP-02 | Origem do percentual | <code>EXCECAO_INDIVIDUAL_VIGENTE</code> | derivado | Exceção cobre a competência | Vigência individual alcançada | Fim → padrão | Nova versão da exceção |
| EST-FIN-RA-01 | RA | <code>SEM_RA</code> | derivado | Ausência de RA aplicável | Nenhuma vigência | Criar → futura/vigente | Não se aplica |
| EST-FIN-RA-02 | RA | <code>FUTURA</code> | derivado | Vigência futura | Criação futura | Início → vigente | Nova versão |
| EST-FIN-RA-03 | RA | <code>VIGENTE</code> | derivado | Competência dentro da vigência | Início alcançado | Programar fim/substituir | Nova versão; efeito pago usa F04 |
| EST-FIN-RA-04 | RA | <code>ENCERRAMENTO_PROGRAMADO</code> | derivado | Última competência informada | B06-RA-04 | Competência seguinte → encerrada | Remover/prorrogar por versão |
| EST-FIN-RA-05 | RA | <code>ENCERRADA_SUBSTITUIDA</code> | terminal operacional | Vigência terminada/sucedida | Fim/substituição | Nenhuma na versão | Nova versão; saída usa RA vigente |
| EST-FIN-SR-01 | Salário redondo | <code>DESMARCADO</code> | derivado | Ausência de vigência aplicável | Nunca ativado ou fim ultrapassado | Ativar → marcado | Criar vigência |
| EST-FIN-SR-02 | Salário redondo | <code>MARCADO</code> | derivado | Marcador cobre a competência | B06-REB-01 | Programar fim | Nova versão |
| EST-FIN-SR-03 | Salário redondo | <code>ENCERRAMENTO_PROGRAMADO</code> | derivado | Fim inclusivo futuro | B06-REB-02 | Após fim → desmarcado | B06-REB-02A |
| EST-FIN-RE-01 | Reembolso por evento | <code>PENDENTE_INFORMACAO</code> | raiz | <code>reembolso_evento_versao.estado</code> na versão atual | Evento aplicável sem confirmação | Informar valores ou confirmar zero | B06-REB-04C antes do pagamento |
| EST-FIN-RE-02 | Reembolso por evento | <code>VALORES_REAIS_INFORMADOS</code> | persistido | Versão atual e seus itens imutáveis | B06-REB-03/04A | Calcular, conferir e pagar | Antes do pagamento nova versão; depois F04 |
| EST-FIN-RE-03 | Reembolso por evento | <code>ZERO_CONFIRMADO</code> | persistido | Versão atual sem item positivo | B06-REB-04/04B | Resolver grupo sem linha positiva | Antes do pagamento reabrir em nova versão; depois F04 |
| EST-FIN-CR-01 | Complemento recorrente | <code>FUTURO</code> | derivado | Vigência futura | Criação futura | Início → vigente | Nova versão |
| EST-FIN-CR-02 | Complemento recorrente | <code>VIGENTE</code> | derivado | Competência no intervalo | Início alcançado | Programar fim/substituir | Nova versão; pago usa F04 |
| EST-FIN-CR-03 | Complemento recorrente | <code>ENCERRAMENTO_PROGRAMADO</code> | derivado | Última competência informada | B06-CMP-04 | Competência seguinte → encerrado | Remover/prorrogar |
| EST-FIN-CR-04 | Complemento recorrente | <code>ENCERRADO_SUBSTITUIDO</code> | terminal operacional | Vigência terminada/sucedida | Fim/substituição | Nenhuma na versão | Nova versão corretiva |
| EST-FIN-CA-01 | Complemento avulso | <code>CRIADO_NA_COMPETENCIA</code> | raiz | <code>complemento_avulso_competencia</code> | B06-CMP-05 | Distribuir/calcular | Versionar enquanto não pago |
| EST-FIN-CA-02 | Complemento avulso | <code>DESTINADO_AO_FINAL</code> | derivado | Adiantamento pago e final aberto | B06-CMP-07 | Calcular/conferir/pagar no final | Corrigir fonte; depois F04 |
| EST-FIN-CA-03 | Complemento avulso | <code>ENCAMINHADO_A_AJUSTE_POSITIVO</code> | terminal operacional | Ligação ao resultado positivo/F05 | Criado/aumentado após final pago | Ajuste segue eixo próprio | Corrigir pela F04 |
| EST-FIN-PS-01 | Período sem registro | <code>BASE_PENDENTE</code> | raiz | Ausência de base confirmada | Vínculo sem admissão/base | Confirmar → base confirmada | Informar versão válida |
| EST-FIN-PS-02 | Período sem registro | <code>BASE_CONFIRMADA</code> | persistido | Versão da base com valor, modo, confirmação dos dias fora do oficial, autor e instante | B06-PSR-01 | Materializar linha; admissão/saída encerra | Nova versão; pago usa F04 |
| EST-FIN-PS-03 | Período sem registro | <code>LINHA_CALCULADA_COMPETENCIA</code> | persistido | <code>linha_psr_competencia</code> e memória D30 | B06-PSR-02/05 | Conferir/pagar/recalcular | B06-PSR-03; pago/fechado usa F04 |
| EST-FIN-PS-04 | Período sem registro | <code>ENCERRADO</code> | derivado | Admissão ou saída atingida | B06-PSR-06/desligamento | Nenhuma linha após o limite | Corrigir datas/base e usar F04 |
| EST-FIN-IF-01 | Impacto financeiro | <code>SEM_EVENTO_GERADO</code> | derivado | Nenhum grupo/componente materializado | Condição sem competência | Materialização → aberto | Corrigir fonte |
| EST-FIN-IF-02 | Impacto financeiro | <code>ABERTO_RECALCULAVEL</code> | derivado | Grupo não pago/fechado | Materialização/recálculo | Pagamento/fechamento | Alterar fonte e reconferir |
| EST-FIN-IF-03 | Impacto financeiro | <code>PAGO_FECHADO_SUJEITO_F04</code> | terminal operacional | Pagamento real ou competência fechada | Confirmação/fechamento | Nenhuma edição direta | F04, reabertura e versão |

## 28.8 Competência, grupo, K06 e confirmação

| ID EST | Eixo | Estado | Natureza | Armazenamento/fonte | Condição de entrada | Saídas comuns | Correção autorizada |
|---|---|---|---|---|---|---|---|
| EST-CPT-EC-01 | Competência | <code>EM_PREPARACAO</code> | raiz | <code>competencia_versao.estado_competencia</code> | K07-01 | Aguardando holerites ou conferência | Nova versão enquanto aberta |
| EST-CPT-EC-02 | Competência | <code>AGUARDANDO_HOLERITES</code> | persistido | Mesmo campo | Adiantamentos resolvidos e K06 pendente/inconsistente | K06 resolvido → conferência | Atualizar fontes/participantes |
| EST-CPT-EC-03 | Competência | <code>EM_CONFERENCIA</code> | persistido | Mesmo campo | Dados oficiais resolvidos ou não exigidos | Fechar → fechada | Recalcular/conferir grupos |
| EST-CPT-EC-04 | Competência | <code>FECHADA</code> | terminal operacional | Versão fechada imutável | Checklist K07-08/11 | Reabrir → nova versão reaberta | K07-10; não desfaz pagamentos |
| EST-CPT-EC-05 | Competência | <code>REABERTA</code> | persistido | Nova <code>competencia_versao</code> | K07-10 | Fechar novamente | Nova reabertura preserva versões |
| EST-CPT-IP-01 | Indicador da competência | <code>EM_PAGAMENTOS</code> | derivado | Existe grupo pronto não pago | K07-07 | Some quando nenhum pronto permanece | Corrigir grupos; nunca editar indicador |
| EST-PAG-GR-01 | Grupo financeiro | <code>NAO_GERADO</code> | raiz | <code>grupo_financeiro_versao.estado_grupo</code> | G08-01 | Pendente, calculado ou não aplicável | Reversão pode retornar aqui |
| EST-PAG-GR-02 | Grupo financeiro | <code>PENDENTE_DADOS</code> | persistido | Mesmo campo e impedimentos | Cálculo sem dado obrigatório | Resolver → calculado | Corrigir fonte |
| EST-PAG-GR-03 | Grupo financeiro | <code>CALCULADO</code> | persistido | Mesmo campo, memória e totais | Cálculo/recálculo | Conferir → pronto; zero → N/A | Nova versão calculada |
| EST-PAG-GR-04 | Grupo financeiro | <code>PRONTO_PAGAMENTO</code> | persistido | Estado e conferência vigente | G08-05 | Confirmar → pago; recalcular → calculado | Recalcular antes do pagamento |
| EST-PAG-GR-05 | Grupo financeiro | <code>PAGO</code> | terminal operacional | Estado e <code>pagamento_real</code> imutável | P09-05/06 | Nenhuma edição comum | F04; fato real permanece |
| EST-PAG-GR-06 | Grupo financeiro | <code>NAO_APLICAVEL</code> | terminal operacional | Estado, motivo e total zero | G08-07/correção para zero | Nenhuma comum | G08-08/08A |
| EST-PAG-GR-07 | Grupo financeiro | <code>CANCELADO_POR_DESLIGAMENTO</code> | terminal operacional | Estado, motivo, saída e destino | G08-09/D12-09/13 | Nenhuma comum | D12-08A/08C ou F04 |
| EST-PAG-GR-08 | Grupo financeiro | <code>EM_CORRECAO</code> | persistido | Estado ligado à F04 | C10-05/G08-12 | Reconfirmar → pago ou N/A | Concluir F04 |
| EST-CPT-K6-01 | K06 | <code>PENDENTE</code> | raiz | <code>liquido_contador_k06.estado_k06</code> | Linha criada sem valor | Informar → preenchido | Informar versão |
| EST-CPT-K6-02 | K06 | <code>PREENCHIDO</code> | persistido | Mesmo campo e versão autoritativa | P09-01/03 | Pode tornar-se inconsistente | Substituir antes do pagamento; depois C10-18 |
| EST-CPT-K6-03 | K06 | <code>INCONSISTENTE</code> | persistido | Mesmo campo e regra de 17.4 | P09-02 | Resolver → preenchido | Confirmar origem ou substituir informação |
| EST-CPT-SI-01 | Saldo inicial | <code>AUSENTE</code> | derivado | Ausência de <code>saldo_inicial_implantacao</code> | Nenhum lançamento | Registrar → registrado | Não se aplica |
| EST-CPT-SI-02 | Saldo inicial | <code>SALDO_INICIAL_REGISTRADO</code> | raiz | Entidade com versão 1 | P09-14 | Correção → nova versão | P09-14A |
| EST-CPT-SI-03 | Saldo inicial | <code>SALDO_INICIAL_EM_NOVA_VERSAO</code> | derivado | Versão atual posterior à inicial | P09-14A | Permanece atual | Outra correção cria versão |
| EST-PAG-CF-01 | Confirmação administrativa | <code>VIGENTE</code> | raiz | <code>confirmacao_pagamento_versao</code> | Pagamento confirmado | F04 → cancelada | Somente C10-05 |
| EST-PAG-CF-02 | Confirmação administrativa | <code>CANCELADA_ADMINISTRATIVAMENTE</code> | persistido | Nova versão; pagamento preservado | C10-05 | Reconfirmar | Concluir F04 |
| EST-PAG-CF-03 | Confirmação administrativa | <code>RECONFIRMADA</code> | persistido | Versão após C10-11/11A/12 | F04 reconfirmada | Nova F04 pode cancelar nova versão | Outra F04 |

## 28.9 Correção, ajuste, recibo e arquivos

| ID EST | Eixo | Estado | Natureza | Armazenamento/fonte | Condição de entrada | Saídas comuns | Correção autorizada |
|---|---|---|---|---|---|---|---|
| EST-COR-F4-01 | Jornada F04 | <code>AGUARDANDO_JUSTIFICATIVA</code> | raiz | <code>correcao_financeira_versao.etapa</code> | C10-01 | Reabertura ou cancelamento | Descartar antes de C10-05 |
| EST-COR-F4-02 | Jornada F04 | <code>AGUARDANDO_REABERTURA</code> | persistido | Mesmo campo | Justificativa com competência fechada | Reabrir → aguardando cancelamento | Descartar preserva reabertura já concluída |
| EST-COR-F4-03 | Jornada F04 | <code>AGUARDANDO_CANCELAMENTO_ADMINISTRATIVO</code> | persistido | Mesmo campo | Justificativa com competência aberta/reaberta | Cancelar → em edição | Descartar somente antes de C10-05 |
| EST-COR-F4-04 | Jornada F04 | <code>EM_EDICAO</code> | persistido | Mesmo campo; confirmação cancelada | C10-05 | Salvar → recalculando | Deve terminar formalmente |
| EST-COR-F4-05 | Jornada F04 | <code>RECALCULANDO</code> | persistido | Mesmo campo e nova memória | C10-06/18 | Apurar/validar → reconfirmação | Nova versão no escopo liberado |
| EST-COR-F4-06 | Jornada F04 | <code>AGUARDANDO_RECONFIRMACAO</code> | persistido | Resultados por verba materializados | C10-07/18A | Concluir ou aguardar substituto | Corrigir cálculo por versão |
| EST-COR-F4-07 | Jornada F04 | <code>DOCUMENTO_SUBSTITUTO_PENDENTE</code> | persistido | Recibo anterior cancelado | C10-11A | Emitir substituto → concluída | Regenerar arquivo não substitui emissão |
| EST-COR-F4-08 | Jornada F04 | <code>CONCLUIDA</code> | terminal operacional | Versão final imutável | C10-11/12/13 | Nenhuma na F04 | Novo problema cria outra F04 |
| EST-COR-AJ-01 | Ajuste positivo | <code>PENDENTE</code> | raiz | <code>ajuste_positivo.estado</code> | C10-08/P10-01 | Pagar → pago | Corrigir origem por F04 |
| EST-COR-AJ-02 | Ajuste positivo | <code>PAGO</code> | terminal operacional | Estado e pagamento real | P10-02 | Nenhuma edição | P10-04 abre F04 |
| EST-COR-AJ-03 | Ajuste positivo | <code>EM_CORRECAO</code> | persistido | Estado e F04 associada | P10-04 | Conclusão produz obrigação correta | Somente F04 |
| EST-COR-DA-01 | Diferença absorvida | <code>ABSORVIDA_PELA_EMPRESA</code> | terminal operacional | <code>diferenca_absorvida</code> | C10-09/N10-01 | Consulta/exportação | Nova F04 na origem; nunca cobrança |
| EST-REC-DO-01 | Recibo documental | <code>PREVIA</code> | derivado | Renderização temporária sem recibo/número | R11-01 | Descartar ou gerar definitivo após pagamento | Regerar da versão corrente |
| EST-REC-DO-02 | Recibo documental | <code>DEFINITIVO_VIGENTE</code> | raiz | <code>recibo.estado_documental</code> e snapshot | R11-02 | Correção → cancelado | F04/R11-04 |
| EST-REC-DO-03 | Recibo documental | <code>CANCELADO</code> | terminal operacional | Mesmo campo, motivo e cadeia | R11-04/correção zero | Sucessor torna predecessor substituído | R11-05; zero fica sem sucessor |
| EST-REC-DO-04 | Recibo documental | <code>SUBSTITUIDO</code> | terminal operacional | Predecessor com sucessor | R11-05 | Consulta | Corrigir o sucessor |
| EST-REC-DO-05 | Recibo documental | <code>SUBSTITUTO_VIGENTE</code> | persistido | Novo recibo, número e predecessor | R11-05/C10-13 | Nova F04 pode cancelar | F04 gera nova cadeia |
| EST-REC-PF-01 | Fence da primeira faixa real | <code>NAO_EXIGIDA</code> | terminal operacional | <code>sequencia_recibo_empresa.primeira_faixa_estado</code> | Raiz fora das empresas+anos da implantação inicial | Nenhuma | Nunca converter em raiz inicial nem liberar manualmente |
| EST-REC-PF-02 | Fence da primeira faixa real | <code>AGUARDANDO_EMISSAO</code> | raiz | Mesmo campo; manifesto/ramo inicial elegível | Raiz de empresa+ano inicial criada ou semeada antes da primeira emissão legítima | Primeiro commit da faixa → <code>PENDENTE_RECONCILIACAO</code> | Não emitir recibo de teste; falha sem commit preserva o estado |
| EST-REC-PF-03 | Fence da primeira faixa real | <code>PENDENTE_RECONCILIACAO</code> | persistido | Mesmo campo, faixa/hash/correlação, época e manifesto gravados no commit | Primeira faixa legítima comprometida | <code>CTL-REC-001</code> após <code>RBK-018</code> → <code>RECONCILIADA</code> | Divergência ou resposta incerta mantém o fence; usar <code>RBK-025/RBK-018</code>; sem desbloqueio manual |
| EST-REC-PF-04 | Fence da primeira faixa real | <code>RECONCILIADA</code> | terminal operacional | Mesmo campo e evento append-only de confirmação | <code>CTL-REC-001</code> confirmou toda a primeira faixa | Reservas seguintes seguem o fluxo normal | Nunca retornar, reabrir ou alterar a prova da primeira faixa |
| EST-REC-AR-01 | Arquivo do recibo | <code>PENDENTE_GERACAO</code> | raiz | <code>arquivo_recibo.estado</code> | Emissão lógica concluída | Disponível ou falhou | Geração idempotente |
| EST-REC-AR-02 | Arquivo do recibo | <code>DISPONIVEL</code> | persistido | Arquivo privado e hash íntegro | A11-01/03 | Divergência → indisponível | Regenerar do mesmo snapshot |
| EST-REC-AR-03 | Arquivo do recibo | <code>FALHOU</code> | persistido | Estado e tentativa técnica | A11-02/03A | Regenerar | A11-03/03A |
| EST-REC-AR-04 | Arquivo do recibo | <code>INDISPONIVEL</code> | persistido | Hash divergente/arquivo ausente | A11-06 | Regenerar → disponível | Investigação e A11-03 |
| EST-REC-LD-01 | Lote documental | <code>PREPARANDO</code> | raiz | <code>lote_documental.estado</code> | L11-02/03 | Processando ou falhou | Novo pedido após término |
| EST-REC-LD-02 | Lote documental | <code>PROCESSANDO</code> | persistido | Mesmo campo e itens congelados | L11-03A | Pronto ou falhou | Reconciliar; nunca subconjunto |
| EST-REC-LD-03 | Lote documental | <code>PRONTO</code> | persistido | Arquivo temporário íntegro | L11-03B | Expirado/indisponível | Novo pedido |
| EST-REC-LD-04 | Lote documental | <code>FALHOU</code> | terminal operacional | Pedido sem pacote | L11-04 | Nenhuma no pedido | L11-08 cria outro |
| EST-REC-LD-05 | Lote documental | <code>EXPIRADO</code> | terminal operacional | Prazo de 24h | L11-06 | Nenhuma | Novo pedido |
| EST-REC-LD-06 | Lote documental | <code>INDISPONIVEL</code> | terminal operacional | Integridade/arquivo inválido | L11-07 | Nenhuma | Investigar e criar outro |

## 28.10 Desligamento

A situação temporal e o tipo de encerramento reutilizam os eixos únicos <code>EST-COL-ST-*</code> e <code>EST-COL-TE-*</code>; não existe uma segunda fonte.

| ID EST | Eixo | Estado | Natureza | Armazenamento/fonte | Condição de entrada | Saídas comuns | Correção autorizada |
|---|---|---|---|---|---|---|---|
| EST-DES-CD-01 | Ciclo do desligamento | <code>N/A</code> | derivado | Ausência de ciclo ou cancelado reconciliado | Vínculo sem desligamento vigente | Programar/registrar | Não se aplica |
| EST-DES-CD-02 | Ciclo do desligamento | <code>PROGRAMADO</code> | raiz | <code>desligamento_versao.estado_ciclo</code> | D12-01/correção futura | Data → efetivo; cancelar → cancelado | D12-05/07/07A |
| EST-DES-CD-03 | Ciclo do desligamento | <code>EFETIVO</code> | persistido | Mesmo campo | D12-02/03 | Permanece efetivo | D12-07/07A e F04 |
| EST-DES-CD-04 | Ciclo do desligamento | <code>CANCELADO</code> | terminal operacional | Mesmo campo e motivo | D12-05/07A | Novo desligamento cria outro ciclo | Reconciliar; não reativar ciclo |
| EST-DES-SF-01 | Situação financeira | <code>N/A</code> | derivado | PRJ-DES-02 sem ciclo aplicável | Sem saída/cancelado reconciliado | Nova saída gera projeção | Corrigir fontes |
| EST-DES-SF-02 | Situação financeira | <code>EM_CORRECAO</code> | derivado | F04, reconciliação, reabertura ou documento aberto | Fonte corretiva aberta | Concluir → próximo estado | Concluir fontes |
| EST-DES-SF-03 | Situação financeira | <code>AGUARDANDO_CRIACAO_COMPETENCIA</code> | derivado | Competência final inexistente | D12-15 | Criar competência | Corrigir competência final/criar K07 |
| EST-DES-SF-04 | Situação financeira | <code>DECISAO_NECESSARIA</code> | derivado | Adiantamento atrasado exige escolha | D12-11 | Pagar ou encaminhar | Decisão autorizada |
| EST-DES-SF-05 | Situação financeira | <code>PENDENTE_DADOS</code> | derivado | Falta dado obrigatório | Materialização incompleta | Informar → conferência/grupos | Corrigir fonte ausente |
| EST-DES-SF-06 | Situação financeira | <code>DESLIGAMENTO_INFORMADO_APOS_PAGAMENTO</code> | derivado | Oficial mensal pago e substituto não resolvido | D12-17 | Resolver rescisão | F04 autoritativa |
| EST-DES-SF-07 | Situação financeira | <code>AGUARDANDO_CONFERENCIA</code> | derivado | Grupo calculado aplicável | Dados completos | Conferir | Corrigir cálculo/fonte |
| EST-DES-SF-08 | Situação financeira | <code>GRUPOS_PENDENTES</code> | derivado | Grupo, pagamento, ajuste ou destino aberto | Conferência parcial | Resolver → quitado | Corrigir eixo de origem |
| EST-DES-SF-09 | Situação financeira | <code>FINANCEIRO_QUITADO</code> | derivado | Todas as obrigações resolvidas | D12-25 | Nova correção → em correção | F04/reconciliação; ASO não altera |
| EST-DES-RO-01 | Rescisão oficial | <code>PENDENTE_INFORMACAO</code> | derivado | Demissão formal sem versão informada/zero | Materialização | Informar ou confirmar zero | Corrigir origem |
| EST-DES-RO-02 | Rescisão oficial | <code>INFORMADA</code> | persistido | <code>rescisao_oficial_versao.estado</code> | D12-18 | Conferir/pagar | Antes do pagamento nova versão; depois C10-18 |
| EST-DES-RO-03 | Rescisão oficial | <code>ZERO_CONFIRMADO</code> | terminal operacional | Mesmo campo, zero e motivo | D12-18A | Grupo N/A | Correção autoritativa versionada |

## 28.11 ASO e clínica

| ID EST | Eixo | Estado | Natureza | Armazenamento/fonte | Condição de entrada | Saídas comuns | Correção autorizada |
|---|---|---|---|---|---|---|---|
| EST-ASO-AC-01 | Acompanhamento | <code>PENDENTE</code> | raiz | <code>aso_acompanhamento.estado_acompanhamento</code> | ASO-A01/A02 ou invalidação | Agendar, realizar, encerrar ou cancelar | ASO-A11/A14 pode reabrir |
| EST-ASO-AC-02 | Acompanhamento | <code>AGENDADO</code> | persistido | Mesmo campo | ASO-A04/A05 | Não compareceu, realizado, encerrado ou cancelado | Nova transição preserva eventos |
| EST-ASO-AC-03 | Acompanhamento | <code>NAO_COMPARECEU</code> | persistido | Mesmo campo e evento append-only | ASO-A06 | Reagendar, realizar, encerrar ou cancelar | ASO-A05 |
| EST-ASO-AC-04 | Acompanhamento | <code>REALIZADO</code> | terminal operacional | Estado e exame ligado | ASO-A07/A03 | Nenhuma comum | Invalidar exame → pendente/cancelado |
| EST-ASO-AC-05 | Acompanhamento | <code>ENCERRADO_SEM_REALIZACAO</code> | terminal operacional | Estado e justificativa demissional | ASO-A08 | Nenhuma | Cancelamento da saída não reabre |
| EST-ASO-AC-06 | Acompanhamento | <code>CANCELADO</code> | terminal operacional | Estado e motivo/origem | ASO-A09/A10/A10A/A12/A13 | Nenhuma | Nova necessidade cria outro acompanhamento |
| EST-ASO-EV-01 | Versão do exame | <code>VIGENTE</code> | raiz | <code>aso_exame_versao.estado_versao</code> | Novo exame/retificação | Retificar → substituída; invalidar → invalidada | Nova versão |
| EST-ASO-EV-02 | Versão do exame | <code>SUBSTITUIDA</code> | terminal operacional | Versão histórica com sucessora | ASO-E05 | Consulta | Retificar a vigente |
| EST-ASO-EV-03 | Versão do exame | <code>INVALIDADA_ADMINISTRATIVAMENTE</code> | terminal operacional | Versão histórica e justificativa | ASO-E06 | Consulta | Cadastrar/retificar lançamento correto |
| EST-ASO-RS-01 | Resultado clínico | <code>APTO</code> | persistido | <code>aso_resultado_sensivel.resultado</code> | Escolha consciente | Permanece na versão | Retificar exame |
| EST-ASO-RS-02 | Resultado clínico | <code>APTO_COM_RESTRICAO</code> | persistido | Mesma entidade sensível | Escolha consciente | Permanece | Retificar exame |
| EST-ASO-RS-03 | Resultado clínico | <code>INAPTO</code> | persistido | Mesma entidade sensível | Escolha consciente | Permanece | Retificar exame |
| EST-ASO-RD-01 | Restrição | <code>SEM_RESTRICAO</code> | derivado | Resultado <code>APTO</code> | ASO-R01 | Nova versão pode mudar | Corrigir exame |
| EST-ASO-RD-02 | Restrição | <code>COM_RESTRICAO</code> | derivado | Resultado <code>APTO_COM_RESTRICAO</code> | ASO-R02 | Nova versão pode mudar | Corrigir exame |
| EST-ASO-RD-03 | Restrição | <code>NAO_APLICAVEL</code> | derivado | Resultado <code>INAPTO</code> | ASO-R03 | Nova versão pode mudar | Corrigir exame |
| EST-ASO-RD-04 | Restrição | <code>INEXISTENTE</code> | derivado | Sem exame vigente ligado | ASO-R04 | Exame vigente → projeção correspondente | Registrar/retificar fonte |
| EST-ASO-PR-01 | Prazo | <code>SEM_PRAZO</code> | derivado | Sem vencimento monitorável | Ausência de exame monitorado | Exame → vigente/vencendo/vencido | Corrigir exame |
| EST-ASO-PR-02 | Prazo | <code>VIGENTE</code> | derivado | Vencimento > hoje + 30 dias | ASO-P01A/P05A | Janela → vencendo | Retificar vencimento |
| EST-ASO-PR-03 | Prazo | <code>VENCENDO_EM_ATE_30_DIAS</code> | derivado | Hoje ≤ vencimento ≤ hoje+30 | ASO-P01B/P03/P05B | Passar vencimento → vencido | Retificar vencimento |
| EST-ASO-PR-04 | Prazo | <code>VENCIDO</code> | derivado | Vencimento < hoje | ASO-P01C/P04/P05C | Permanece até nova versão | Retificar vencimento |
| EST-ASO-PR-05 | Prazo | <code>NAO_APLICAVEL</code> | derivado | Exame demissional | ASO-P02 | Permanece | Corrigir tipo por lançamento correto |
| EST-ASO-RF-01 | Referência de alerta | <code>SEM_REFERENCIA</code> | raiz | Versão sem exame ou ausência equivalente | Nenhum exame elegível | Promover → ativa | Corrigir fonte |
| EST-ASO-RF-02 | Referência de alerta | <code>REFERENCIA_ATIVA</code> | persistido | <code>aso_referencia_alerta_versao</code> | ASO-P06/P07/P10A/P12 | Informativa, suprimida ou N/A | Retificar/invalidar com reconciliação |
| EST-ASO-RF-03 | Referência de alerta | <code>INFORMATIVO</code> | derivado | Exame vigente que não é referência | Novo periódico/tipo não referencial | Pode ser promovido | Corrigir/invalidar fonte |
| EST-ASO-RF-04 | Referência de alerta | <code>SUPRIMIDO_POR_VINCULO_INATIVO</code> | persistido | Versão da referência e vínculo inativo | ASO-P09 | Permanece enquanto inativo | Correção do desligamento recalcula |
| EST-ASO-RF-05 | Referência de alerta | <code>NAO_APLICAVEL</code> | derivado | Demissional ou sem candidato elegível | ASO-P08B/P10B | Novo elegível pode criar referência | Corrigir fonte |
| EST-CLI-ES-01 | Clínica | <code>ATIVA</code> | raiz | <code>clinica.estado</code> | CLI-01/reativação | Inativar | CLI-02/03 |
| EST-CLI-ES-02 | Clínica | <code>INATIVA</code> | persistido | Mesmo campo | CLI-03 | Reativar | CLI-04; snapshot não muda |

## 28.12 Notificação, exportação e incidente

| ID EST | Eixo | Estado | Natureza | Armazenamento/fonte | Condição de entrada | Saídas comuns | Correção autorizada |
|---|---|---|---|---|---|---|---|
| EST-NOT-OC-01 | Ocorrência de notificação | <code>ATIVA</code> | raiz | <code>notificacao_ocorrencia.estado</code> | Condição surge sem ativa equivalente | Origem resolvida → resolvida | Corrigir origem; N01 não altera |
| EST-NOT-OC-02 | Ocorrência de notificação | <code>RESOLVIDA</code> | terminal operacional | Mesmo campo, motivo e instante | NOT-O03/O10 | Nenhuma reabertura | Reaparecimento cria nova sequência |
| EST-NOT-LE-01 | Leitura individual | <code>NAO_LIDA</code> | raiz | <code>notificacao_leitura_usuario.estado</code> ou ausência materializada | Nova ocorrência/autorização/urgência | Marcar → lida | Urgência real pode retornar |
| EST-NOT-LE-02 | Leitura individual | <code>LIDA</code> | persistido | Mesma entidade | NOT-L01/L02 | Urgência → não lida | Repetição idempotente; resolução não muda |
| EST-EXP-AR-01 | Arquivo de exportação | <code>PREPARANDO</code> | raiz | <code>pedido_exportacao.estado</code> | EXP-01 a 05 | Processando ou falhou | Novo pedido após término |
| EST-EXP-AR-02 | Arquivo de exportação | <code>PROCESSANDO</code> | persistido | Mesmo campo e snapshot | EXP-07 | Pronto ou falhou | Reconciliar; não duplicar |
| EST-EXP-AR-03 | Arquivo de exportação | <code>PRONTO</code> | persistido | Arquivo privado íntegro | EXP-08 | Expirado ou indisponível | Baixar após reautorização válida |
| EST-EXP-AR-04 | Arquivo de exportação | <code>FALHOU</code> | terminal operacional | Pedido encerrado sem arquivo | EXP-09 | Nenhuma no pedido | EXP-13 cria outro |
| EST-EXP-AR-05 | Arquivo de exportação | <code>EXPIRADO</code> | terminal operacional | Prazo de 24h | EXP-12 | Nenhuma | Novo pedido |
| EST-EXP-AR-06 | Arquivo de exportação | <code>INDISPONIVEL</code> | terminal operacional | Autorização/escopo/arquivo inválido | EXP-11 | Nenhuma | Nova autorização não reativa; novo pedido |
| EST-INC-EI-01 | Incidente | <code>ABERTO</code> | raiz | <code>incidente.estado</code> | INC-01 | Em tratamento ou concluído | Entrada corretiva append-only |
| EST-INC-EI-02 | Incidente | <code>EM_TRATAMENTO</code> | persistido | Mesmo campo | INC-02/09 | Concluir | Nova entrada imutável; nunca aberto |
| EST-INC-EI-03 | Incidente | <code>CONCLUIDO</code> | terminal operacional | Estado e entrada de conclusão | INC-08 | Reabrir → em tratamento | INC-09 com reautenticação |

## 28.13 Estados comuns de UI

Todos os estados abaixo existem somente na memória da interface ou como projeção da resposta do servidor. Nenhum vira coluna de entidade de negócio.

| ID EST | Eixo | Estado | Natureza | Armazenamento/fonte | Condição de entrada | Saídas comuns | Correção autorizada |
|---|---|---|---|---|---|---|---|
| EST-UI-01 | UI comum | <code>INICIAL</code> | raiz | Memória efêmera da rota | Tela ainda não carregada | Carregando | Reabrir rota |
| EST-UI-02 | UI comum | <code>PRINCIPAL</code> | derivado | Resposta autorizada renderizada | Leitura com dados | Editar, filtrar, processar ou navegar | Recarregar |
| EST-UI-03 | UI comum | <code>PRINCIPAL_COM_ALTERACOES</code> | derivado | Rascunho autorizado | Campo alterado | Enviar ou aguardar descarte | Corrigir/descartar |
| EST-UI-04 | UI comum | <code>PRINCIPAL_AGUARDANDO_DESCARTE</code> | derivado | Modal local | Navegação com rascunho | Permanecer ou descartar | Revalidar contexto |
| EST-UI-05 | UI comum | <code>VAZIO</code> | derivado | Consulta sem registros | Coleção sem filtro = zero | Atualizar | Alterar fonte quando autorizado |
| EST-UI-06 | UI comum | <code>FILTRO_SEM_RESULTADO</code> | derivado | Consulta filtrada sem linhas | Filtro = zero | Limpar/alterar filtro | Ajustar filtros |
| EST-UI-07 | UI comum | <code>CARREGANDO</code> | derivado | Requisição de leitura | Abrir/atualizar/filtrar | Principal, vazio, filtro ou falha | Tentar novamente |
| EST-UI-08 | UI comum | <code>VALIDACAO</code> | derivado | Erros sem mutação | Formulário inválido | Corrigir → alterações | Corrigir campos permitidos |
| EST-UI-09 | UI comum | <code>PROCESSANDO</code> | derivado | Operação idempotente enviada | Comando válido | Sucesso, conflito, falha ou reconciliação | Não repetir antes do resultado |
| EST-UI-10 | UI comum | <code>PROCESSANDO_EM_RECONCILIACAO</code> | derivado | Resultado técnico desconhecido | Perda de resposta | Sucesso ou falha sem commit | Consultar pela chave |
| EST-UI-11 | UI comum | <code>SUCESSO</code> | derivado | Resultado persistido relido | Transação e auditoria concluídas | Principal | Nova intenção usa novo comando |
| EST-UI-12 | UI comum | <code>FALHA</code> | derivado | Categoria visual genérica | Leitura/mutação falhou | Subtipo aplicável | Conforme subtipo |
| EST-UI-13 | UI comum | <code>FALHA_DE_LEITURA</code> | derivado | Consulta falhou sem mutação | UI-08 | Carregando | Repetir só a consulta |
| EST-UI-14 | UI comum | <code>FALHA_MUTACAO_AUSENCIA_CONFIRMADA</code> | derivado | Reconciliação provou ausência de commit | UI-08A/19 | Nova tentativa explícita | Nova chave/intenção válida |
| EST-UI-15 | UI comum | <code>CONFLITO</code> | derivado | Versão divergente | Concorrência rejeita gravação | Recarregar | Revisar; nunca mesclar silenciosamente |
| EST-UI-16 | UI comum | <code>SEM_PERMISSAO</code> | derivado | Autorização insuficiente | Negação/revogação | Rota permitida | Obter acesso legítimo e reabrir |
| EST-UI-17 | UI comum | <code>SESSAO_EXPIRADA</code> | derivado | Sessão terminal no servidor | Expiração/revogação | Autenticar | Comando antigo não é reenviado |
| EST-UI-18 | UI comum | <code>CONTEXTO_INVALIDO</code> | derivado | Aba pertence a contexto removido | Troca de escopo | Abrir destino válido | Nova seleção explícita |

## 28.14 Controle técnico de repetição

Estes estados pertencem ao registro técnico da operação idempotente; não são estados de uma entidade funcional.

| ID EST | Eixo | Estado | Natureza | Armazenamento/fonte | Condição de entrada | Saídas comuns | Correção autorizada |
|---|---|---|---|---|---|---|---|
| EST-TEC-ID-01 | Operação idempotente | <code>AUSENTE</code> | derivado | Nenhum registro para ator, escopo e chave | Comando não recebido | Chave nova → em processamento | Não se aplica |
| EST-TEC-ID-02 | Operação idempotente | <code>EM_PROCESSAMENTO</code> | raiz | <code>operacao_idempotente.estado</code> e hash da intenção | Comando novo aceito | Commit → concluída; ausência provada → falha sem commit | Reconciliar; repetição retorna andamento |
| EST-TEC-ID-03 | Operação idempotente | <code>CONCLUIDA</code> | terminal operacional | Resultado e referência persistidos | Transação confirmou uma vez | Nenhuma | Mesma chave retorna resultado |
| EST-TEC-ID-04 | Operação idempotente | <code>FALHA_SEM_COMMIT</code> | terminal operacional | Reconciliação provou ausência | Operação encerrou sem persistência | Nenhuma | Nova tentativa explícita usa chave válida |
| EST-TEC-ID-05 | Resultado da operação | <code>RESPOSTA_INCERTA</code> | derivado | Ausência de resposta conclusiva; não é estado persistido | Conexão perdida após envio | Reconciliar → estado técnico real | Nunca repetir antes da reconciliação |

## 28.15 Manifesto técnico da carga de implantação

Estes estados pertencem ao agregado técnico restrito `ENT-IMP-01/02`. Eles não são opções de tela comum, não integram perfis empresariais e não criam uma nova transição funcional do Documento 17.

| ID EST | Eixo | Estado | Natureza | Armazenamento/fonte | Condição de entrada | Saídas comuns | Correção autorizada |
|---|---|---|---|---|---|---|---|
| EST-IMP-MF-01 | Manifesto de carga | <code>RASCUNHO</code> | raiz | <code>manifesto_carga_implantacao.estado</code> | Nova tentativa técnica, com ID e baseline próprios | Aprovação nominal → <code>APROVADO</code>; desistência → <code>FECHADO_NO_GO</code> | Nova versão antes da aprovação; nunca sobrescrever versão aprovada |
| EST-IMP-MF-02 | Manifesto de carga | <code>APROVADO</code> | persistido | Mesmo campo, versão/hash e aprovações exatas | DP/Contábil e revisores técnicos aprovam o conteúdo | Abrir janela → <code>JANELA_ABERTA</code>; cancelar → <code>FECHADO_NO_GO</code> | Nova tentativa se o conteúdo aprovado mudar |
| EST-IMP-MF-03 | Manifesto de carga | <code>JANELA_ABERTA</code> | persistido | Estado, abertura, expiração, artefato e ledger vinculados | Plano de controle abre a janela da tentativa | Selar versão final dos deltas → <code>DELTAS_APLICADOS</code>; fechar/expirar | Fechar a tentativa e criar outro manifesto; não reabrir o mesmo ID |
| EST-IMP-MF-04 | Manifesto de carga | <code>DELTAS_APLICADOS</code> | persistido | Estado, `ledger_conteudo_versao/hash` selado e fonte congelada | Todos os deltas selados foram aplicados e as entradas foram finalizadas | Resolver todas as entradas → <code>SEMENTES_RESOLVIDAS</code>; fechar/expirar | Delta posterior confirma `FECHADO_NO_GO` por `CTL-IMP-004` e exige outro manifesto; se o manifesto já estiver reconciliado, aplica-se `INVALIDAR_GO`/`ENT-IMP-05` sem mudar o terminal |
| EST-IMP-MF-05 | Manifesto de carga | <code>SEMENTES_RESOLVIDAS</code> | persistido | Todas as entradas estão em um estado final permitido | Cada empresa+ano possui semente persistida, ausência dupla ou semente anterior verificada | Reconciliação completa → <code>FECHADO_RECONCILIADO</code>; falha → <code>FECHADO_NO_GO</code> | Nova tentativa; não reabrir capacidade no manifesto resolvido |
| EST-IMP-MF-06 | Manifesto de carga | <code>FECHADO_RECONCILIADO</code> | terminal operacional | Fechamento, revogação, hashes de conteúdo/reconciliação e evidências | Reconciliação sem divergência e capacidade revogada | Nenhuma transição no mesmo manifesto; `ENT-IMP-05` pode torná-lo inelegível para `GO` sem mudar este terminal | Nova tentativa referencia este manifesto e verifica fatos imutáveis |
| EST-IMP-MF-07 | Manifesto de carga | <code>FECHADO_NO_GO</code> | terminal operacional | Motivo, instante e revogação persistidos | Cancelamento, falha, delta novo ou decisão `NO-GO` | Nenhuma no mesmo manifesto | Nova tentativa com novo ID; baseline limpo quando a regra exigir |
| EST-IMP-MF-08 | Manifesto de carga | <code>EXPIRADO</code> | terminal operacional | Expiração e revogação persistidas | Fim da janela sem fechamento anterior | Nenhuma no mesmo manifesto | Nova tentativa com novo ID |
| EST-IMP-EA-01 | Entrada empresa+ano | <code>CANDIDATO</code> | raiz | <code>manifesto_carga_empresa_ano.estado</code> e versões append-only do candidato | Pré-carga registra máximo conhecido ou indicação de ausência dentro do escopo aprovado | Finalizar após deltas → um dos três estados finais de decisão | Nova versão append-only até `CTL-IMP-003`, sem mudar empresas/anos/artefato aprovados |
| EST-IMP-EA-02 | Entrada empresa+ano | <code>FINAL_APROVADO</code> | persistido | Máximo final, fonte/hash, dupla revisão e `ledger_conteudo_versao/hash` | Existe sequência externa, não existe raiz interna e a semente é necessária | Commit da API → <code>SEMENTE_PERSISTIDA</code>; fechamento revoga a capacidade | Fechar a tentativa; valor final diferente exige novo manifesto |
| EST-IMP-EA-03 | Entrada empresa+ano | <code>SEMENTE_PERSISTIDA</code> | terminal operacional da entrada | FK para `ENT-REC-01`, valor e operação idempotente | `API-REC-009` confirma uma única vez | Contribui para `SEMENTES_RESOLVIDAS` | Nunca editar/apagar; nova tentativa apenas verifica se o candidato é idêntico |
| EST-IMP-EA-04 | Entrada empresa+ano | <code>SEM_NUMERACAO_ANTERIOR</code> | terminal operacional da entrada | Declarações distintas de DP e Contábil sobre fonte/hash exatos | Ausência comprovada depois de todos os deltas | Contribui para `SEMENTES_RESOLVIDAS`; primeira emissão usa início padrão | Nova tentativa revalida a ausência; não cria raiz zero |
| EST-IMP-EA-05 | Entrada empresa+ano | <code>SEMENTE_EXISTENTE_VERIFICADA</code> | terminal operacional da entrada | FK para raiz imutável anterior e igualdade do candidato | Nova tentativa encontra a mesma semente já persistida e nenhuma emissão interna | Contribui para `SEMENTES_RESOLVIDAS`, sem capacidade de seed | Divergência exige `NO-GO` e baseline limpo; nunca alterar a raiz |
| EST-IMP-GA-01 | Guarda de autoridade | <code>PRE_GO_CONTROLE_ANTERIOR</code> | persistido | `guarda_autoridade_implantacao.estado_autoridade`; `production_go_id` nulo | Fundação técnica cria o singleton antes da carga | `IMP-CUT-018`: CAS externo em `T_GO`, reconciliação local e abertura fail-closed → <code>POS_GO_SISTEMA_AUTORITATIVO</code> | `NO-GO` mantém este estado; nova tentativa ainda pode ser criada |
| EST-IMP-GA-02 | Guarda de autoridade | <code>POS_GO_SISTEMA_AUTORITATIVO</code> | persistido | Mesmo campo; vínculo write-once do `ProductionGo` e evento corrente reconciliado com o registro externo | CAS externo em `T_GO` confirma a nova fonte; `ENT-IMP-04` coincide antes da abertura | Contingência formal → <code>POS_GO_CONTROLE_ANTERIOR_CONTINGENCIA</code> | Nunca limpar/trocar o vínculo do primeiro `GO`; correção usa evento append-only |
| EST-IMP-GA-03 | Guarda de autoridade | <code>POS_GO_CONTROLE_ANTERIOR_CONTINGENCIA</code> | persistido | Mesmo campo; prova do primeiro `GO` preservada | Retorno seguro transfere a autoridade em `T_RET` | Nova reentrada aprovada em `T_REENT` → <code>POS_GO_SISTEMA_AUTORITATIVO</code> | Evento de reentrada append-only; nunca reabrir o plano de semente inicial |

## 28.16 Gates obrigatórios derivados deste manifesto

Antes de implementar enums, constraints ou máquinas de estado, o projeto deve provar:

1. 100% dos IDs <code>EST-*</code> possuem implementação ou projeção rastreada;
2. nenhum enum persistido aceita valor fora do eixo correspondente;
3. <code>—</code>, ausência e <code>N/A</code> não foram transformados em opção editável;
4. cada estado persistido não terminal possui ao menos uma entrada alcançável e uma saída legítima;
5. cada terminal operacional possui consulta e caminho de correção, sucessor ou nova entidade quando o Documento 17 permitir;
6. cada derivado possui fórmula/fonte única e nenhum endpoint de edição;
7. estados UI, resultados transversais e estados de negócio permanecem separados;
8. transições preservam os IDs do Documento 17 na auditoria e nos testes;
9. pagamento real, snapshot, versão histórica, evento de auditoria e linha do tempo append-only nunca recebem transição destrutiva;
10. o validador acusa estado órfão, duplicado, inalcançável ou sem correção antes da homologação.

---

# 29. Matriz consolidada de restrições e camada de garantia

As restrições locais de cada domínio continuam vinculantes. A matriz abaixo consolida os invariantes transversais que precisam ser verificáveis antes de qualquer implementação ser considerada completa.

| ID | Restrição | Camadas mínimas | Evidência esperada |
|---|---|---|---|
| RST-GER-01 | Toda linha empresarial possui `empresa_id` obrigatório e relações empresariais preservam o mesmo valor. | Banco + RLS/autorização | FK composta ou proteção equivalente; teste cruzado negado. |
| RST-GER-02 | Nenhuma consulta, total, filtro, exportação ou arquivo mistura empresas. | RLS/autorização + serviço | Testes de isolamento em todas as rotas. |
| RST-GER-03 | A sessão possui no máximo um contexto operacional por vez; contexto global/restrito não herda empresa. | Serviço + autorização | Matriz de contexto e testes com abas antigas. |
| RST-GER-04 | E-mail de usuário e CNPJ de empresa são únicos globalmente depois da normalização. | Banco | Índices únicos e corrida de criação. |
| RST-GER-05 | CPF da pessoa e CNPJ do MEI são únicos dentro de cada empresa; reuso ocorre na mesma raiz histórica. | Banco + domínio | Chave natural e testes de recontratação/novo contrato. |
| RST-GER-06 | CNPJ da clínica é único globalmente, sem associação direta clínica–empresa. | Banco | Índice único global e teste de não vazamento de usos. |
| RST-GER-07 | Vínculos de uma pessoa e contratos de um MEI não se sobrepõem. | Banco quando possível + domínio | Testes de fronteira inclusiva e concorrência. |
| RST-GER-08 | Condições financeiras versionadas não se sobrepõem no mesmo eixo; cada data aplicável encontra no máximo uma versão. | Banco quando possível + domínio | Testes por intervalo e D30. |
| RST-GER-09 | Versão anterior, número e ponteiro atual formam cadeia contínua, sem ciclos ou duas versões vigentes. | Banco + transação | Integridade de cadeia e corrida de atualização. |
| RST-GER-10 | Registros financeiros, auditoria, incidentes e snapshots imutáveis não sofrem edição destrutiva nem exclusão comum. | Banco + autorização | Permissões de banco e testes negativos. |
| RST-GER-11 | Participante financeiro referencia exatamente vínculo empregado XOR contrato MEI. | Banco | `CHECK`/FK e teste das quatro combinações. |
| RST-GER-12 | Grupo, evento, participante e recibo obedecem ao catálogo vinculante; combinação ausente é proibida. | Banco + domínio | Catálogo semântico e testes de cada combinação. |
| RST-GER-13 | Grupo pago exige conferência da versão corrente, valor positivo, pagamento real e confirmação atômica. | Transação + domínio | Teste de commit e rollback completos. |
| RST-GER-14 | Um evento não é parcelado dentro do mesmo grupo; grupos independentes podem ser confirmados separadamente. | Banco + domínio | Unicidade de confirmação e cenários por grupo. |
| RST-GER-15 | Grupo pago/competência fechada só recebe correção pelo F04; nenhuma versão histórica ou recibo é reescrito. | Domínio + autorização | Testes F04 e hash de snapshot. |
| RST-GER-16 | Numeração definitiva é anual, crescente, única e nunca reutilizada; prévia não recebe número; semente inicial autorizada só antecede a primeira reserva, preserva origem e não cria recibo. Na implantação, a primeira faixa fica `PENDENTE_RECONCILIACAO` e bloqueia a faixa seguinte até `CTL-REC-001` confirmar `RECONCILIADA`. | Transação + banco + autorização | Teste concorrente de semente versus semente/emissão, colisão, primeira faixa versus emissão seguinte, resposta incerta, lote e cancelamento. |
| RST-GER-17 | Snapshot documental é imutável; reimpressão mantém número; substituição cria novo número e liga predecessor. | Banco + domínio | Comparação de hashes e cadeia documental. |
| RST-GER-18 | Arquivo privado só é entregue depois de validar dono, escopo, autorização atual e integridade. | Autorização + armazenamento | Testes de revogação, hash e `no-store`. |
| RST-GER-19 | Resultado clínico é omitido integralmente sem permissão cumulativa e todo acesso sensível exigido é auditado. | Autorização + auditoria | Testes de tela, API, filtro, total e Excel. |
| RST-GER-20 | Senhas, tokens, TOTP, códigos e segredos nunca aparecem em logs, auditoria, exportação ou resposta posterior. | Segurança + revisão | Varredura automatizada e testes de segredo. |
| RST-GER-21 | Mutação e auditoria obrigatória concluem juntas; falha de uma reverte ambas. | Transação | Teste de falha injetada. |
| RST-GER-22 | Mesma chave idempotente com mesma intenção produz um efeito; com intenção diferente é rejeitada. | Banco + domínio | Repetição, concorrência e reconciliação. |
| RST-GER-23 | Versão antiga nunca sobrescreve registro atual. | Banco + serviço | Teste de duas sessões concorrentes. |
| RST-GER-24 | Revogação de usuário, empresa, perfil, campo ou sessão impede nova leitura/commit sem cache obsoleto. | Autorização | Teste durante comando e em aba já aberta. |
| RST-GER-25 | Estado derivado não possui endpoint/campo de escrita e é reconstruível a partir das fontes declaradas. | Contrato + domínio | Teste de tentativa de escrita e recomputação. |
| RST-GER-26 | Rotinas temporais são idempotentes e não criam duplicação diária. | Rotina + banco | Execuções repetidas na mesma data. |
| RST-GER-27 | Texto livre é tratado como dado; fórmulas de planilha, HTML, comandos e conteúdo proibido são neutralizados/bloqueados. | Serviço + saída | Testes de injeção e exportação. |
| RST-GER-28 | Dados permanentes têm retenção mínima de seis anos; temporários obedecem aos prazos específicos. | Retenção + armazenamento | Política, rotina e teste de restauração. |
| RST-GER-29 | Migração inicial não fabrica competências, recibos ou pagamentos anteriores à competência de corte; snapshot+delta não inventam encerramentos, item não pago segue o fluxo normal e fato pago aparece apenas em K07. | Migração + homologação | Relatório por classe, reconciliação snapshot/delta/K07 e testes de dupla contagem. |
| RST-GER-30 | Todo enum de estado persistido e toda projeção de estado pertence ao manifesto da seção 28. | Banco + CI | Verificador automático de cobertura e alcançabilidade. |
| RST-GER-31 | Depois do consumo do bootstrap existem pelo menos dois masters aptos, salvo exatamente uma contingência B03-MST-06 formal e aberta. Antes disso, admite-se somente um agregado inicial singleton com exatamente dois membros não aptos: cada um pode chegar a `PRONTO_AGUARDANDO_PAR`, mas ambos viram aptos apenas no mesmo commit que os marca `ATIVADO_CONJUNTAMENTE` e consome o agregado. | Transação + banco/domínio + plano de controle | Unicidade do singleton; locks canônicos nos dois usuários; corridas de invocação/configuração e falha injetada confirmam zero ativação parcial; replay após consumo é recusado; corridas comuns de bloquear, inativar, rebaixar e resetar permanecem bloqueadas. |
| RST-GER-32 | Existe no máximo um manifesto não terminal por instalação/virada e uma entrada com `entrada_ativa = true` por empresa+ano; `entrada_ativa BOOLEAN NOT NULL DEFAULT TRUE`, `CHECK (entrada_ativa = (encerrada_em IS NULL))`, escrita direta proibida e somente `CTL-IMP-004` permite `TRUE → FALSE`, nunca reativação. Semente inicial, ausência e primeira emissão usam manifesto/entrada persistidos, `ledger_conteudo_versao/hash`, `reconciliacao_ledger_versao/hash`, janela e autorização aplicáveis. Para chave da implantação, a primeira emissão exige manifesto `FECHADO_RECONCILIADO`, `go_elegivel = true`, ausência de `ENT-IMP-05`, ramo final válido, `ProductionGo` write-once apontando para o manifesto exato e fonte autoritativa corrente no sistema. Toda mutação normal global ou empresarial, inclusive de ano/empresa posterior, exige `POS_GO_SISTEMA_AUTORITATIVO` na `authority_epoch` corrente e projeção local reconciliada com o `registro_externo_autoridade`; antes do `GO`, somente fundação/bootstrap e `MIGRACAO_PRE_GO` em allowlists exatas. `CTL-IMP-001–004`, `API-REC-009`, `IMP-CUT-018`, evento de inelegibilidade e emissão seguem a ordem de locks guarda global de autoridade → manifesto → entradas ordenadas → autorizações ordenadas → guarda/raiz empresa+ano ordenada. Manifesto fechado nunca reabre. | Banco + transação + plano de controle + autorização + registro externo CAS | Singleton/índices únicos parciais locais; `NULL`/reativação recusados; corridas fechamento×semente/ausência×emissão/GO×emissão/delta×`GO`; falhas antes/depois do CAS externo; `FECHADO_RECONCILIADO` sem `GO`; `NO-GO`/`ENT-IMP-05`; manifesto supersedido; ano futuro em contingência; falha parcial; replay; negação pós-janela; verificação de semente existente sem nova capacidade. |

---

# 30. Índices lógicos, paginação e metas de desempenho

## 30.1 Premissas de volume

O desenho inicial considera aproximadamente:

- três empresas;
- 65 vínculos ativos;
- cerca de 300 vínculos inativos e crescimento contínuo por rotatividade;
- até 10 usuários simultâneos;
- competências mensais, versões, pagamentos, auditoria e recibos crescendo ao longo dos anos.

Esse porte comporta uma aplicação web modular única e banco relacional único. Não há necessidade inicial de microsserviços, cache distribuído, busca externa ou processamento em tempo real.

## 30.2 Índices lógicos obrigatórios

O desenho físico do Documento 19 poderá adaptar a tecnologia, mas precisa atender pelo menos aos seguintes caminhos:

| Domínio | Chaves de acesso/indexação lógica |
|---|---|
| Empresa | CNPJ normalizado; situação+nome. |
| Usuário e ACL | E-mail normalizado; usuário+empresa; perfil+empresa; revisão de autorização. |
| Pessoa/vínculo | `(empresa_id, cpf_busca_segura)` único; empresa+nome normalizado; vínculo+pessoa; datas autoritativas de início/saída. |
| MEI | Empresa+CNPJ; prestador+datas efetivas atuais de contrato/vigência. |
| Condições | Empresa+vínculo/contrato+tipo+início/fim da versão atual efetiva. |
| Competência | Empresa+competência única; empresa+estado; competência+participante. |
| Financeiro | Participante+grupo+evento; grupo+estado; K06 pendente; pagamentos por competência/data. |
| Recibo | Empresa+ano+sequência; confirmação+tipo; predecessor; estado documental. |
| Desligamento | Empresa+vínculo+ciclo/data autoritativa; competência final; fontes das pendências financeiras. |
| ASO | Empresa+vínculo+tipo/data; vencimento aplicável; referência ativa; clínica global por CNPJ. |
| Notificação | Empresa+estado+urgência; condição+sequência; usuário+leitura; chave ativa única. |
| Auditoria | Empresa+instante; entidade+ID+instante; ator+instante; transição+instante. |
| Exportação | Solicitante+estado+expiração; empresa+criação. |
| Incidente | Estado+atualização; código único; sequência da linha do tempo. |
| Idempotência | Ator+tipo de escopo+identificador normalizado do escopo+chave, único. |
| Correção F04 | Unicidade parcial de correção aberta por empresa+competência+participante+grupo+evento. |

Índices de unicidade parcial ou mecanismo equivalente devem garantir versão vigente, ocorrência ativa, referência ativa e demais “no máximo um” sem depender de verificação prévia vulnerável a corrida.

Estados temporais derivados não recebem índice próprio. São indexadas as datas, versões atuais e fontes persistidas usadas para calculá-los.

## 30.3 Leitura e tarefas longas

- listas são paginadas e ordenadas por chave estável; inativos ficam fora do padrão;
- busca de nome usa forma normalizada, preservando o valor original;
- filtros sempre começam por empresa quando o escopo for empresarial;
- painel usa consultas agregadas autorizadas, sem carregar todas as linhas;
- exportações e lotes longos usam tarefa de fundo com progresso consultável;
- tarefas de fundo carregam explicitamente empresa, ator, autorização e chave idempotente;
- nenhuma tarefa periódica renova sessão;
- recibo individual pode ser gerado de forma síncrona se respeitar a meta e migrar para tarefa controlada sem mudar a regra funcional.

## 30.4 Metas aprovadas

| Operação | Meta inicial |
|---|---|
| Login, seletor, listas e filtros usuais | Até 2 segundos na maior parte das requisições. |
| Painel | Até 3 segundos. |
| Cálculo de competência com até 100 participantes | Até 5 segundos. |
| Excel operacional | Até 30 segundos. |
| Recibo individual | Até 5 segundos. |
| Lote longo | Exibe progresso e não bloqueia a sessão. |

As metas serão medidas com volume representativo, controle de autorização ativo e banco com histórico, não apenas em base vazia.

---

# 31. Retenção, inativação, arquivamento e restauração lógica

## 31.1 Matriz de retenção

| Classe | Retenção aprovada |
|---|---|
| Vínculos, contratos, condições, competências, cálculos, pagamentos, correções e recibos | Mínimo de seis anos; sem exclusão automática na primeira versão. |
| Auditoria funcional e incidentes | Mínimo de seis anos. |
| ASO informativo | Preservado conforme política interna; documento físico permanece sob guarda da empresa. |
| Notificação resolvida | Visível na central por 90 dias; origem e auditoria seguem os próprios prazos. |
| Exportação e lote temporário | Conteúdo do arquivo disponível por no máximo 24 horas e descartável depois; metadados do pedido, resultado e auditoria seguem a retenção aplicável. |
| Sessão, token, senha temporária e autorização curta | Expiração funcional própria; segredos inutilizados são removidos ou tornados irrecuperáveis conforme segurança. |
| IP e identificação básica de navegador | Prazo e classificação ainda necessários antes da produção. |

## 31.2 Regras de ciclo

- inativar não significa excluir;
- vínculo, contrato, empresa, usuário e clínica preservam identidade e história;
- empresa inativa permanece somente em modo histórico e não é reativada na primeira versão;
- usuário e clínica podem ser reativados pelas transições autorizadas;
- versões substituídas, pagamentos, recibos, correções e auditoria não retornam a estado anterior por edição;
- arquivamento físico futuro precisa manter chave, cadeia, hash, autorização e capacidade de reconstrução;
- a política de descarte após seis anos será definida antes de qualquer eliminação.

## 31.3 Backup não é retenção

O modelo pressupõe backup diário completo, recuperação pontual, cópia cifrada separada, RPO de uma hora, RTO de até oito horas úteis e restauração integral inicialmente. Haverá teste de restauração antes da produção e repetição trimestral, com evidência de integridade e tempo medido. A arquitetura e o procedimento serão detalhados nos Documentos 19 e 23. Backup não autoriza apagar a fonte viva antes do prazo.

---

# 32. Rastreabilidade dos 18 blocos do Documento 17

| Bloco 17 | Domínio | Seções e entidades principais deste documento |
|---:|---|---|
| 01 | Autenticação e sessão | §12; ENT-AUT-01 a 14, ENT-TEC-01. |
| 02 | Empresa e contexto | §§11–12; ENT-EMP-01 a 04, ENT-AUT-09. |
| 03 | Usuário, master e permissão | §13; ENT-ACL-01 a 11. |
| 04 | Pessoa e vínculo | §14; ENT-COL-01 a 04. |
| 05 | MEI e contrato | §15; ENT-MEI-01 a 07. |
| 06 | Condições financeiras | §16; ENT-FIN-01 a 15. |
| 07 | Competência | §17; ENT-CPT-01 a 08. |
| 08 | Grupos e cálculo | §18; ENT-PAG-01 a 12. |
| 09 | Pagamento | §18; ENT-PAG-13 a 18. |
| 10 | Correção financeira | §19; ENT-COR-01 a 07. |
| 11 | Recibos e lotes | §20; ENT-REC-01 a 11. |
| 12 | Desligamento | §21; ENT-DES-01 a 11. |
| 13 | Acompanhamento ASO | §22; ENT-ASO-01 e 02. |
| 14 | Exame, prazo e clínica | §22; ENT-ASO-03 a 08, ENT-CLI-01 e 02. |
| 15 | Notificação | §23; ENT-NOT-01 a 06. |
| 16 | Exportação | §24; ENT-EXP-01 a 05. |
| 17 | Incidente | §25; ENT-INC-01 a 05. |
| 18 | UI, concorrência e idempotência | §§26–28; ENT-AUD-01 a 04, ENT-TEC-01 e 02, projeções e manifesto. |

A tabela acima oferece a visão resumida por bloco. A prova exaustiva está no [Documento 18A](./18a-matriz-rastreabilidade-transicoes.md): os 440 IDs do Documento 17 aparecem exatamente uma vez, sem lacuna, duplicidade ou célula de suporte vazia. O arquivo define também o contrato de verificação automática dessa igualdade de conjuntos.

Cada transição mutável aparece em pelo menos um teste do Documento 22 e aponta para a entidade, restrição e operação técnica correspondente. O Documento 22 preserva os identificadores `TST-<ID funcional>` reservados no Documento 18A. Nenhum ID removido pode ser reutilizado com outro significado.

---

# 33. Implantação inicial e competência de corte

## 33.1 Regra de corte

Cada empresa possui uma `competencia_inicial`. O sistema:

- não cria competências, cálculos, pagamentos ou recibos anteriores a ela;
- aceita apenas o histórico mínimo necessário para sustentar os registros atuais;
- prefere iniciar em competência cujo adiantamento ainda não ocorreu;
- trata pagamento real já ocorrido na competência de corte exclusivamente como saldo inicial de implantação K07;
- leva recorrentes vigentes e avulsos de empregado/serviços adicionais MEI já conhecidos e ainda não pagos ao fluxo normal da competência inicial.

## 33.2 Ordem da carga manual controlada

1. bootstrap global de uso único cria exatamente dois masters pendentes, sem acesso operacional;
2. ambos concluem primeiro acesso e TOTP, são ativados conjuntamente e o bootstrap se autodesabilita sem backdoor;
3. um master apto cria e versiona o modelo empresarial global inicial;
4. um master apto cria empresas, logos e configurações pelo fluxo B02, usando versão válida do modelo;
5. demais perfis, permissões, usuários e associações;
6. pessoas e vínculos empregados ativos no snapshot, seguidos dos vínculos encerrados legitimamente no delta até o congelamento final;
7. prestadores MEI e contratos ativos no snapshot, seguidos dos contratos encerrados legitimamente no mesmo delta;
8. condições financeiras vigentes e futuras já conhecidas;
9. clínicas e o último ASO necessário ao controle atual;
10. competência de corte e participantes;
11. complementos recorrentes vigentes, complementos avulsos de empregado e serviços adicionais MEI da competência inicial já conhecidos e ainda não pagos, todos pelas entidades e comandos normais;
12. K06 disponível e saldos K07 de pagamentos reais já ocorridos no mês, sem recriar a obrigação como pagável;
13. depois do congelamento da fonte, aplicação de todos os deltas — inclusive reservas externas de numeração — e recálculo do candidato final por empresa+ano;
14. semente anual única de `ENT-REC-01`, quando houver numeração anterior, usando manifesto/janela/autorização efêmera exatos; ou declaração dupla de ausência, sempre antes da primeira reserva interna;
15. revogação das autorizações de semente, prova negativa pós-janela, reconciliação e termo de homologação da carga.

O bootstrap antecede a primeira classe empresarial apenas para formar a autoridade global mínima. Ele não é importação de dados, não cria empresa e deixa de existir como caminho utilizável depois da ativação conjunta dos dois masters.

A entrada será manual pelos formulários aprovados. Eventual utilitário técnico de carga só poderá ser usado na implantação, com validação, relatório e homologação; ele não se transforma em importação mensal por planilha.

O snapshot define o conjunto inicial. O delta contém somente mudanças reais ocorridas entre esse snapshot e o congelamento final; por isso pode encerrar legitimamente um vínculo ou contrato que estava ativo no snapshot, mas não introduz encerramento, competência ou evento fictício. Item conhecido e não pago segue cálculo, conferência e pagamento normais. Item já pago aparece exclusivamente em K07 e nunca é duplicado no fluxo comum.

## 33.3 Saldo inicial

O saldo inicial registra participante, grupo, evento, valor realmente pago, data real, usuário e marca permanente. Ele:

- não cria recibo retroativo;
- não fabrica uma confirmação comum anterior ao sistema;
- participa apenas das deduções necessárias da competência de corte;
- possui versões imutáveis para correção autorizada;
- é conciliado com os grupos antes de qualquer pagamento final.

## 33.4 Validações de entrada

Antes de liberar a competência:

- CPF/CNPJ e e-mail sem duplicidade no escopo correto;
- vínculos, contratos e condições sem sobreposição;
- datas coerentes;
- pelo menos dois masters aptos;
- toda associação comum com exatamente um perfil ativo por empresa;
- salário-base/RA, contrato MEI e percentuais com vigência válida;
- referência de ASO determinística;
- saldo inicial conciliado ou inexistência confirmada;
- recorrentes e avulsos/serviços da competência inicial classificados sem sobreposição entre “não pago no fluxo normal” e “já pago por K07”;
- snapshot e delta conciliados, com todo encerramento do delta ligado a uma mudança real;
- semente anual ausente ou inicializada uma única vez após os deltas, conciliada por manifesto+empresa+ano, com origem, autorização efêmera, versão e ausência de colisão; janela/capacidade revogadas e tentativa pós-janela com zero efeito antes da primeira emissão interna;
- contagens por empresa assinadas pela homologação operacional.

Falha em qualquer item impede a virada. A estratégia de retorno seguro e a janela estão detalhadas no Documento 23 e anexos 23A–23D.

Antes da produção também são gates objetivos: teste de isolamento multiempresa, restauração completa em ambiente controlado, exercício do procedimento de incidente e homologações nominalmente assinadas pelas áreas contábil, jurídica e operacional.

## 33.5 Autoridade técnica persistida do manifesto de carga

O manifesto de carga não é uma planilha solta nem apenas uma evidência externa. O banco mantém um agregado técnico restrito que materializa a tentativa e permite ao servidor revalidar atomicamente toda guarda usada pela semente anual.

| ID | Entidade | Escopo | Finalidade | Chave/unicidade | Ciclo | Rastreio |
|---|---|---|---|---|---|---|
| ENT-IMP-01 | `manifesto_carga_implantacao` | Global técnico crítico | Autoridade persistida de uma tentativa de carga/virada, sua janela, baseline, artefato e versão final dos deltas. | `manifesto_carga_id` único; no máximo um manifesto não terminal por instalação/virada; uma tentativa possui um manifesto; referência opcional ao anterior. | Máquina `EST-IMP-MF-*`; fechado não reabre. | BK-371; Documento 23; QAT-REC-007 |
| ENT-IMP-02 | `manifesto_carga_empresa_ano` | Empresarial técnico crítico | Decisão exata de semente ou ausência para cada empresa+ano incluído. | Manifesto+empresa+ano únicos; no máximo uma entrada ativa por empresa+ano; empresa/ano precisam integrar o escopo aprovado. | Máquina `EST-IMP-EA-*`; candidato possui versões append-only até a finalização. | BK-210/371; API-REC-009; QAT-REC-007 |
| ENT-IMP-03 | `aprovacao_manifesto_carga` | Global/empresarial herdado | Aprovação ou rejeição nominal sobre versão e hash imutáveis do manifesto ou da entrada. | Alvo+versão+papel+decisor únicos; decisores exigidos precisam ser pessoas distintas quando houver dupla revisão. | Append-only; correção usa nova decisão sobre nova versão antes do commit aplicável — `CTL-IMP-001` para o escopo ou `CTL-IMP-003` para o candidato/hash final pós-delta. | Documento 23A; GAT-07/GAT-10 |
| ENT-IMP-04 | `guarda_autoridade_implantacao` | Global técnico crítico | Projeção local versionada da autoridade operacional e prova unidirecional do primeiro `ProductionGo`, reconciliada com o `registro_externo_autoridade`. | Singleton por instalação; `production_go_id` e vínculo ao manifesto são únicos e gravados uma única vez. | Raiz versionada com eventos de comutação append-only; o vínculo de `GO` nunca é limpo ou trocado; abertura falha fechado se a projeção divergir do último CAS externo. | BK-210/371/374; IMP-CUT-018; TST-API-010; QAT-REC-007 |
| ENT-IMP-05 | `evento_inelegibilidade_manifesto` | Global técnico crítico | Tornar um manifesto, inclusive já `FECHADO_RECONCILIADO`, inelegível para `GO` sem mudar seu terminal. | `(manifesto_carga_id, evento_tipo, origem_tipo, origem_id)` único; chave idempotente única. | Append-only; `CTL-IMP-004(INVALIDAR_GO)` acrescenta o fato sob os mesmos locks de `IMP-CUT-018`. | BK-371/374; IMP-DRY-020; TST-API-010; QAT-REC-007 |

`manifesto_carga_implantacao` guarda, no mínimo: instalação/virada, tentativa e manifesto anterior; `escopo_versao/hash` — candidato de liberação, esquema, baseline, empresas e anos —; início/expiração da janela; instante do congelamento; `ledger_delta_id`, `ciclo_aplicacao_id`, `ledger_conteudo_versao/hash` e `ledger_conteudo_selado_em`, imutáveis depois de `CTL-IMP-003`; `ledger_estado_reconciliacao`, `reconciliacao_ledger_versao/hash` e `reconciliado_em`, fixados depois; estado; versão de concorrência; atores e instantes de criação, abertura, fechamento e motivo. `manifesto_carga_empresa_ano` guarda empresa, ano, histórico append-only dos candidatos, decisão/valor final, `candidato_final_versao/hash`, origem da prova, conteúdo selado aplicável, raiz de sequência existente quando houver, autorização curta, resultado, `entrada_ativa BOOLEAN NOT NULL DEFAULT TRUE` e `encerrada_em`. O índice parcial único `(empresa_id, ano) WHERE entrada_ativa = true` é local à tabela; `CHECK (entrada_ativa = (encerrada_em IS NULL))`, bloqueio de escrita direta e regra de domínio impedem `NULL` e `FALSE → TRUE`; somente `CTL-IMP-004` grava `TRUE → FALSE` e `encerrada_em` no mesmo commit. Atualizar candidato não muda o escopo aprovado e é permitido somente até `CTL-IMP-003`.

`aprovacao_manifesto_carga` guarda `fase_aprovacao`, manifesto/versão, alvo/tipo/ID/versão/hash, ciclo, `ledger_conteudo_versao/hash`, papel, `usuario_aprovador_id`, decisão, chave idempotente, justificativa e instante. Em `CTL-IMP-001/DECIDIR_ESCOPO` e `CTL-IMP-003/DECIDIR_FINAL`, cada aprovador autenticado grava exclusivamente a própria decisão append-only; o executor técnico não representa, delega nem preenche em nome dele. A mesma identidade não satisfaz DP e Contábil; rejeição, ciclo anterior ou hash/versão antiga não podem ser reaproveitados, e correção exige nova versão com novas decisões.

`evento_inelegibilidade_manifesto` guarda manifesto/instalação, `evento_tipo = INELEGIBILIDADE_GO`, `causa_codigo` (`DELTA_POSTERIOR`, `DECISAO_NO_GO`, `SUPERSESSAO` ou `INTEGRIDADE_INVALIDADA`), origem/ID, delta quando aplicável, ledger/ciclo/hash de conteúdo, instantes de detecção/registro, ator, justificativa, idempotência e auditoria. A projeção `go_elegivel` é derivada: manifesto em `FECHADO_RECONCILIADO`, nenhum `ENT-IMP-05`, nenhum sucessor e nenhum delta posterior não materializado; ela nunca é um booleano editável.

`guarda_autoridade_implantacao` nasce antes da primeira tentativa em `PRE_GO_CONTROLE_ANTERIOR` e guarda `instalacao_id`, estado de autoridade, `authority_epoch BIGINT NOT NULL`, versão e evento corrente. Toda troca incrementa a época. No primeiro `GO`, recebe `production_go_id`, manifesto/versão/hash de escopo, `ledger_delta_id`, `ledger_conteudo_versao/hash`, `reconciliacao_ledger_versao/hash`, geração/hash do fence final, hash do pacote de decisão, decisores, `production_go_em`, fonte anterior, fonte nova e `authority_switched_at`; os campos do primeiro `GO` são write-once. Uma contingência altera apenas a projeção versionada da fonte atual e acrescenta evento de autoridade append-only; nunca apaga nem substitui a prova histórica.

O `registro_externo_autoridade`, independente do app/banco, guarda eventos append-only com `instalacao_id`, `authority_epoch`, época/hash anterior esperados, fonte anterior/nova, marco `T_GO`, `T_RET` ou `T_REENT`, manifesto/fence/mapa numérico aplicáveis, decisores, instante e hash encadeado. A escrita usa compare-and-swap: só existe um sucessor de uma época. A troca é fail-closed em duas fases, sem alegar transação distribuída: preparar o mesmo candidato local/externo, manter destino bloqueado, confirmar o evento externo e reconciliar idempotentemente `ENT-IMP-04`. Falha antes do CAS conserva a autoridade anterior; falha depois do CAS conserva o destino fechado até a projeção local coincidir. Em `T_RET`, o evento externo pode confirmar com o banco indisponível; `ENT-IMP-04` precisa ser recomposta antes de o sistema voltar a aceitar mutações.

Toda mutação normal global ou empresarial, ou efeito de compromisso, lê a época corrente e exige `POS_GO_SISTEMA_AUTORITATIVO`, além de projeção local reconciliada com o último evento externo conhecido no início/retomada do ambiente; a troca invalida execução com época obsoleta. Antes do `GO`, somente fundação/bootstrap e a capacidade temporal `MIGRACAO_PRE_GO` aprovada executam suas allowlists exatas. Durante a autoridade do controle anterior permanecem apenas segurança, leitura, incidente e reconciliação controlada.

As operações do plano de controle seguem este contrato:

1. `CTL-IMP-001/PREPARAR`, por OPS ou Segurança nominal, bloqueia `ENT-IMP-04`, exige `production_go_id` ausente, cria/versiona `ENT-IMP-01/02` em `RASCUNHO` e congela somente `escopo_versao/hash`; em `CTL-IMP-001/DECIDIR_ESCOPO`, cada aprovador registra pessoalmente a própria `ENT-IMP-03`; `CTL-IMP-001/PROMOVER`, novamente por executor técnico nominal, relê o conjunto no próprio commit e só confirma `RASCUNHO → APROVADO` quando todas as decisões obrigatórias, distintas, atuais e exatas estiverem presentes. O executor técnico nunca cria decisão pelo aprovador; ausência, rejeição, versão/hash antiga ou representação mantém `RASCUNHO`, impede `CTL-IMP-002` e não cria capacidade;
2. abrir a janela somente para o artefato, baseline, fonte e ledger aprovados;
3. depois do congelamento, ainda em `JANELA_ABERTA`, versionar candidatos e selar `ledger_conteudo_versao/hash`; em `CTL-IMP-003/DECIDIR_FINAL`, DP e Contábil, como pessoas distintas, registram suas próprias decisões sobre cada `candidato_final_versao/hash` e o mesmo conteúdo selado; `CTL-IMP-003/FINALIZAR`, por OPS ou Segurança nominal, bloqueia guarda, manifesto e entradas, relê as decisões, valida o snapshot externo e persiste apenas o conteúdo imutável, sem alegar lock distribuído. Aprovação representada, ausente, antiga, de outro ciclo/hash ou pelo mesmo decisor falha fechado; somente então confirma `JANELA_ABERTA → DELTAS_APLICADOS` e resolve os três ramos; se todos já terminarem em ausência/verificação, promove `SEMENTES_RESOLVIDAS` no mesmo commit;
4. criar `ENT-AUT-12` somente para entrada `FINAL_APROVADO`, vinculada ao operador, sessão, manifesto, entrada, empresa, ano, valor final e expiração exatos;
5. `CTL-IMP-004` aceita `FECHADO_RECONCILIADO` somente a partir de `SEMENTES_RESOLVIDAS`, fixa `reconciliacao_ledger_versao/hash`, exige as reconciliações aprovadas, revoga capacidades e grava todas as entradas `entrada_ativa = false`/`encerrada_em` no mesmo commit; de outro estado não terminal só admite `FECHADO_NO_GO` ou `EXPIRADO`. No modo `CTL-IMP-004(INVALIDAR_GO)`, somente para manifesto já reconciliado e com `production_go_id` ausente, bloqueia `ENT-IMP-04 → manifesto`, acrescenta `ENT-IMP-05`, mantém o terminal/entradas/capacidades e é idempotente;
6. depois de todos os bloqueadores, o fence externo suspende aceitação, drena fatos em voo e sela geração, corte, último delta, contagem e conteúdo; `IMP-CUT-018` bloqueia a mesma guarda, valida a prova ainda vigente, manifesto exato mais recente `FECHADO_RECONCILIADO`, `go_elegivel = true`, ausência de `ENT-IMP-05`, sucessor ou delta posterior, prepara o mesmo candidato local/externo, confirma o evento CAS em `T_GO`, reconcilia `ENT-IMP-04` e só então libera o sistema.

Antes do `ProductionGo`, a reconciliação da numeração registra somente `proximo_numero_interno_projetado`; não existe reserva, emissão ou consumo real de número.

`CTL-IMP-001–004`, `API-REC-009`, `ENT-IMP-05`, `IMP-CUT-018` e a emissão seguem exatamente a ordem: guarda global `ENT-IMP-04`; manifesto; entradas empresa+ano ordenadas; autorizações ordenadas; guarda/raiz empresa+ano ordenada. Se `CTL-IMP-004(INVALIDAR_GO)` ou um delta aceito confirmar primeiro, `IMP-CUT-018` falha; se o `GO` confirmar primeiro, a tentativa de invalidar é rejeitada pela época/fence e o fato deve ser submetido no fluxo normal do sistema. Ledger externo somente se torna autoritativo após troca formal em `T_RET`. O fence impede fato aceito invisível entre o último selo e o commit. Falha parcial não deixa manifesto fechado com entrada ativa/capacidade vigente, `GO` sem autoridade, autorização consumida sem semente ou semente sem entrada.

Antes de `CTL-IMP-003`, `REABERTO` cria novo ciclo no mesmo manifesto e repete selo, decisões pessoais e finalização. A partir de `CTL-IMP-003`, delta aceito supersede a tentativa: se não terminal, `CTL-IMP-004` fecha `FECHADO_NO_GO`; se já `FECHADO_RECONCILIADO`, `CTL-IMP-004(INVALIDAR_GO)` acrescenta `ENT-IMP-05` sem reterminalizar. Em ambos, outra tentativa usa novo manifesto/janela. Semente idêntica pode ser somente verificada; mudança do máximo/prova após semente imutável exige baseline limpo, sem editar a raiz.

Depois do primeiro `ProductionGo` persistido em `ENT-IMP-04`, não se cria, reabre ou altera manifesto inicial nem autorização de semente de implantação. Anos/empresas futuros dispensam somente a prova do manifesto inicial: sua numeração e toda mutação normal continuam condicionadas a `POS_GO_SISTEMA_AUTORITATIVO` na `authority_epoch` corrente, são negadas durante `[T_RET,T_REENT)` e voltam somente após a troca em `T_REENT`.

---

# 34. Definições que continuam necessárias antes da produção

Estas decisões não bloqueiam a aprovação do modelo lógico nem o início do Documento 19, mas precisam estar encerradas antes da produção:

1. responsáveis e substitutos nominais pelo plano de incidentes;
2. plataforma de hospedagem;
3. provedor de e-mail transacional;
4. fronteira física transacional da confirmação em lote, preservando o “todos ou nenhum” aprovado;
5. granularidade física da revogação de sessões/autorizações, sem cache obsoleto;
6. classificação e retenção mínima de IP e identificação de navegador;
7. responsáveis nominais pela homologação contábil, jurídica e operacional;
8. competência inicial real de cada empresa;
9. data e janela de implantação;
10. política de arquivamento ou eliminação depois do mínimo de seis anos;
11. parâmetros e fornecedor da MF-01, somente se o agendamento e os avisos externos forem priorizados no futuro.

Os Documentos 19, 20 e o pacote 23 materializam esses itens técnicos e operacionais nos respectivos níveis. Nenhum deles pode alterar silenciosamente as regras deste modelo.

---

# 35. Estado da sequência documental

Os Documentos 19/20, 21/21A e os pacotes 22/22A–22D e 23/23A–23D já foram aprovados. Na data da aprovação, a continuidade era preparar o repositório e iniciar a `ETP-00` na ordem do Documento 21, com os gates do Documento 22. O checkpoint posterior registra a baseline em implementação controlada em `docs/ETP-00.md`; produção permanece não iniciada.

---

# 36. Critérios de aprovação do Documento 18

O documento estará aprovado quando o usuário confirmar:

- entidades, campos, fontes únicas e cardinalidades;
- separação empresarial e exceções globais/restritas;
- pessoa/vínculo empregado e prestador/contrato MEI;
- condições versionadas e D30;
- competência, grupos, componentes, pagamento e correção;
- recibos, arquivos, desligamento e ASO;
- notificações, exportações, incidentes e auditoria;
- idempotência, concorrência e ausência de edição destrutiva;
- projeções derivadas sem segunda fonte;
- manifesto de 100% dos estados;
- restrições e respectivas camadas de garantia;
- índices lógicos e metas de desempenho;
- retenção mínima e implantação inicial;
- definições pré-produção e sequência dos Documentos 19 a 23.

## 36.1 Gates objetivos de qualidade do modelo

Além da aprovação temática, a passagem para implementação física exige:

- 100% das entidades com escopo, chave, ciclo e rastreabilidade definidos;
- 100% dos estados do Documento 17 classificados por `EST-*`;
- 100% dos enums de estado persistidos contidos em um único eixo do manifesto;
- 100% das transições mutáveis ligadas a entidade, restrição e âncora de teste já materializada no Documento 22;
- igualdade automática entre os 440 IDs do Documento 17 e as 440 linhas do Documento 18A, sem duplicidade, lacuna ou referência vazia;
- zero ID de definição duplicado ou referência funcional inexistente;
- zero FK empresarial sem garantia de mesmo `empresa_id`;
- zero relação pendente, órfã ou polimórfica livre nos domínios críticos;
- zero intervalo sobreposto onde a regra exigir unicidade temporal;
- zero versão atual múltipla, cadeia quebrada ou alteração destrutiva de histórico;
- zero estado persistido inalcançável ou sem saída/correção autorizada;
- uma única fonte para cada valor, estado e histórico;
- todos os exemplos normativos de D30 e pagamento reproduzidos exatamente;
- metas da seção 30 verificadas com volume representativo;
- teste de isolamento multiempresa sem vazamento em tela, API, arquivo, total, filtro ou erro;
- teste de restauração, exercício de incidente e homologações externas concluídos antes da produção.

O Documento 22 transforma esses limiares em casos e evidências executáveis. Nenhuma exceção silenciosa é aceita.

**Situação atual:** aprovado integralmente pelo usuário; sincronização técnica do pacote 23 também aprovada em 22/08/2026.  
**Continuidade na data da aprovação:** preparar o repositório e iniciar a `ETP-00`.  
**Checkpoint posterior:** baseline em implementação controlada conforme `docs/ETP-00.md`; produção permanece não autorizada e os procedimentos formais continuam `NOT_RUN_PLANNED`.
