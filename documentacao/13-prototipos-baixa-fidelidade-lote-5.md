# Sistema Web de Departamento Pessoal

## Protótipos de Baixa Fidelidade — Lote 5

**Tema:** desligamento, competência final e acerto financeiro complementar  
**Telas:** D01, D02 e D03  
**Data da versão:** 20/08/2026  
**Situação:** aprovado integralmente pelo usuário em 20/08/2026

---

# 1. Objetivo do lote

Este lote transforma as regras aprovadas de desligamento em um fluxo integrado entre `Colaboradores` e `Competências e Pagamentos`.

O objetivo é permitir:

- localizar desligamentos programados ou realizados;
- registrar uma demissão formal ou um desligamento sem registro;
- mostrar o impacto antes da confirmação;
- acompanhar a competência final;
- informar e confirmar separadamente a rescisão oficial do contador;
- calcular e confirmar o acerto complementar somente sobre a remuneração adicional — RA;
- manter complementos, período sem registro, ajustes e recibos em seus grupos próprios;
- acompanhar a pendência de ASO demissional sem bloquear a quitação financeira;
- preservar pagamentos, recibos, versões e auditoria durante cancelamentos ou correções.

Este documento não inicia desenvolvimento e não substitui as regras do Documento Mestre.

---

# 2. Fontes e precedência

Este lote aplica, nesta ordem:

1. `07-documento-mestre-planejamento-funcional.md`;
2. `08-fluxos-integrados-navegacao-telas.md`;
3. protótipos aprovados dos Lotes 1 a 4;
4. documentos anteriores apenas quando não conflitarem com o Documento Mestre.

Os Documentos 02, 03 e 06 registram a descoberta do produto, mas não prevalecem quando divergirem do planejamento consolidado.

---

# 3. Continuidade do que já foi aprovado

O Lote 5 mantém:

- sistema multiempresa com uma empresa ativa por sessão;
- nenhum carregamento conjunto dos três CNPJs;
- master também sujeito à seleção explícita de empresa;
- um único item lateral `Competências e Pagamentos`;
- desligamento dentro de `Colaboradores`, sem item lateral próprio;
- recibos dentro da competência e do participante;
- exportações dentro das telas de origem;
- histórico contextual como filtro da auditoria única;
- confirmação individual por grupo financeiro;
- inexistência de pagamento parcial dentro do mesmo grupo;
- divisor comercial D30;
- rescisão oficial recebida do contador, sem cálculo interno;
- cálculo interno de desligamento somente sobre a RA;
- recibo apenas para o acerto de RA e demais grupos internos permitidos;
- ASO meramente informativo, sem arquivo armazenado.

---

# 4. Telas incluídas

| Código | Tela | Contexto |
|---|---|---|
| D01 | Visão de desligamentos | Dentro de `Colaboradores` |
| D02 | Registrar ou programar desligamento | A partir do empregado ou de D01 |
| D03 | Área integrada de desligamento e acerto | Mesma fonte aberta pelo empregado ou pela competência |

D03 possui duas apresentações da mesma informação:

- **contexto cadastral:** datas, tipo, aviso, situação do vínculo, inativação e ASO;
- **contexto financeiro:** rescisão oficial, acerto de RA, outros grupos, confirmações e recibos.

Não existem dois registros de desligamento.

---

# 5. Limites do lote

Não fazem parte do Lote 5:

- cálculo ou decomposição da rescisão oficial;
- cálculo de salário-base, tributos ou encargos;
- campo de motivo do desligamento;
- módulo de férias;
- média de RA;
- férias em dobro;
- complemento, reembolso ou período sem registro dentro do acerto de RA;
- recibo interno da rescisão oficial;
- comprovante de pagamento;
- pagamento parcial do mesmo grupo;
- integração bancária, contábil ou com eSocial;
- arquivo, diagnóstico, médico, CRM ou descrição de restrição do ASO;
- encerramento trabalhista do MEI, que continua pertencendo ao contrato;
- exclusão física de versões ou histórico.

---

# 6. Arquitetura integrada

## 6.1 Menu lateral

O menu permanece:

1. Painel;
2. Colaboradores;
3. Competências e Pagamentos;
4. ASO e clínicas;
5. Notificações;
6. Auditoria, quando autorizada.

Não existe item `Desligamentos`.

## 6.2 Caminhos principais

```text
Colaboradores
└── D01 — Desligamentos
    ├── D02 — Registrar ou programar
    └── D03 — Dados do desligamento
        └── D03 — Abrir acerto na competência

Empregado
├── D02 — Registrar ou programar
└── D03 — Dados do desligamento

Competências e Pagamentos
└── Competência selecionada
    └── Desligamentos e acertos
        └── D03 — Fila e detalhe financeiro
            ├── F02 — Grupo mensal
            ├── F04 — Correção financeira
            ├── F05 — Ajuste
            ├── R02 — Recibo do acerto
            ├── S02 — Pendência demissional
            └── K03 — Checklist
```

## 6.3 Fonte única

Abrir D03 pelo empregado ou pela competência não cria cópia. As duas entradas recebem:

- o mesmo identificador de desligamento;
- o mesmo vínculo;
- a mesma competência final;
- as mesmas versões;
- as mesmas confirmações;
- os mesmos eventos de auditoria.

## 6.4 Preservação de contexto

| Origem | Destino | Retorno preservado |
|---|---|---|
| C01 | D01 | Pesquisa, filtros, página e rolagem |
| D01 | D02 | Filtros, página e empregado selecionado |
| C03 | D02 | Empregado e caminho de retorno |
| D02 concluído | D03 cadastral | Desligamento recém-criado |
| Competência | D03 financeiro | Empresa, competência, versão, filtros e linha |
| D03 cadastral | D03 financeiro | Empregado, desligamento e competência final |
| D03 financeiro | D03 cadastral | Competência, aba e linha |
| D03 | F04/R02/S02/K03 | Desligamento, grupo, versão e origem exatos |

Trocar de empresa elimina formulários, filtros, pilha de retorno, documentos e seleções do contexto anterior.

---

# 7. Controles exclusivos da revisão

O protótipo contém seletores que não existirão dessa forma no produto:

- tela;
- estado técnico;
- perfil de acesso;
- cenário de negócio.

Eles permitem homologar uma única interface contra diferentes situações sem criar arquivos separados.

## 7.1 Estados técnicos simulados

- Principal;
- Vazio;
- Carregando;
- Validação;
- Concorrência;
- Processando;
- Sucesso.

Estados técnicos não substituem os estados de negócio.

## 7.2 Perfis simulados

| Perfil | Objetivo de revisão |
|---|---|
| Gestor completo | Revisar todos os dados e ações |
| Departamento pessoal sem valores | Programar saídas sem inferir valores financeiros |
| Financeiro sem editar vínculo | Quitar grupos sem alterar datas ou tipo |
| Somente rescisão oficial | Ver e confirmar apenas o valor do contador |
| Somente acerto de RA | Ver memória e quitar apenas o acerto interno |
| Conferência sem confirmação | Conferir cálculos sem declarar pagamento |
| Consulta histórica | Abrir versões sem mutação |
| Sem acesso ao Lote 5 | Provar recusa sem vazamento |

## 7.3 Cenários simulados

O seletor cobre, no mínimo:

1. demissão formal futura;
2. saída antes do adiantamento ainda não pago;
3. saída na data do adiantamento antes da confirmação;
4. saída depois do adiantamento de RA pago;
5. desligamento sem registro;
6. início e saída na mesma competência;
7. início e saída no mesmo dia;
8. competência final ainda não criada;
9. rescisão aguardando contador;
10. aviso trabalhado;
11. aviso indenizado;
12. RA paga acima da proporcional;
13. RA igual a zero;
14. férias vencidas confirmadas;
15. rescisão paga e acerto pendente;
16. financeiro totalmente quitado;
17. ASO já vinculado;
18. programação cancelada;
19. desligamento informado depois de pagamento mensal;
20. empresa inativa;
21. tentativa de outro CNPJ;
22. saída depois da data prevista do adiantamento, com o grupo ainda pendente;
23. rescisão oficial igual a zero.

## 7.4 Data operacional da massa fictícia

Para manter os cenários coerentes entre si, o protótipo usa `30/09/2026` como data operacional simulada:

- saídas até essa data são tratadas como efetivadas;
- saídas posteriores são tratadas como programadas;
- uma data efetiva de pagamento não pode ultrapassar essa data;
- na implementação, a comparação será feita no servidor com a data corrente e o fuso horário configurado para a empresa.

Essa convenção existe somente na massa de revisão e não transforma uma data fixa em regra do produto.

---

# 8. Conceitos centrais

## 8.1 Desligamento, finanças e ASO são dimensões separadas

Um desligamento pode estar:

- programado, no último dia ativo, inativo ou cancelado;
- financeiramente pendente ou quitado;
- com ASO pendente ou resolvido.

Essas situações não devem ser comprimidas em um único estado ambíguo.

## 8.2 Data final inclusiva

- O empregado continua operacional até a data de saída, inclusive;
- A inativação automática ocorre no dia seguinte;
- Data futura não inativa antecipadamente;
- A inativação não bloqueia a conclusão da última competência.

## 8.3 Programação não exige dados financeiros

É possível registrar uma saída futura antes de receber:

- líquido da rescisão oficial;
- confirmação de ausência de RA no valor oficial;
- avos de 13º;
- avos de férias;
- informação de férias vencidas.

Esses dados entram posteriormente em D03.

## 8.4 Nenhum pagamento é apagado

Cancelar ou corrigir um desligamento:

- não afirma que o dinheiro voltou;
- não apaga confirmação;
- não apaga recibo;
- não restaura grupo automaticamente;
- não altera competência fechada silenciosamente.

---

# 9. D01 — Visão de desligamentos

**Aprovação do usuário:** aprovado integralmente em 20/08/2026, sem ajustes pendentes.

## 9.1 Posição

D01 abre como:

```text
Colaboradores > Desligamentos
```

O menu lateral continua selecionando `Colaboradores`.

## 9.2 Cabeçalho

- Título `Desligamentos`;
- Informação de que a visão contém somente empregados;
- `Iniciar desligamento`, conforme permissão;
- `Exportar colaboradores`, usando os filtros e campos autorizados;
- `Voltar para colaboradores`.

## 9.3 Filtros

- Texto por nome ou identificador autorizado;
- Competência final;
- Tipo: formal ou sem registro;
- Situação: programado, último dia ativo, inativo ou cancelado;
- Pendência financeira;
- Pendência de ASO;
- Período de saída.

## 9.4 Colunas

- Empregado;
- Tipo;
- Data de saída;
- Situação temporal;
- Aviso;
- Competência final;
- Situação financeira;
- ASO demissional;
- Ações autorizadas.

Colunas financeiras ou clínicas desaparecem quando o perfil não puder conhecê-las.

## 9.5 Indicadores

Podem aparecer, conforme permissão:

- Programados;
- Saída efetivada;
- Pendências financeiras;
- ASO demissional pendente.

Um indicador não autorizado é omitido, não exibido com zero.

## 9.6 Ações por linha

- Abrir D03;
- Abrir acerto na competência;
- Cancelar programação futura;
- Corrigir desligamento efetivado;
- Abrir ASO, quando autorizado.

## 9.7 Estados vazios

- Nenhum desligamento cadastrado;
- Nenhum resultado para os filtros;
- Nenhum desligamento na competência escolhida;
- Nenhum registro autorizado para o perfil.

---

# 10. D02 — Registrar ou programar desligamento

## 10.1 Organização

D02 utiliza três etapas:

1. Empregado e tipo;
2. Data e aviso;
3. Impacto e confirmação.

## 10.2 Etapa 1 — empregado e tipo

O empregado aparece em contexto somente leitura:

- Nome;
- CPF, quando permitido;
- Início das atividades;
- Admissão/registro no eSocial, quando existente;
- Situação atual do vínculo.

Escolha compatível:

| Vínculo | Tipo permitido |
|---|---|
| Possui admissão | Demissão formal |
| Nunca possuiu admissão | Desligamento sem registro |

Os dois tipos não coexistem.

## 10.3 Etapa 2 — data e aviso

Campos:

- Data de saída;
- Aviso trabalhado, indenizado ou não aplicável;
- Dias indenizados, somente quando aviso indenizado.

Não existe campo de motivo.

Comportamentos derivados:

- Data futura: `Programar desligamento`;
- Data presente ou passada: `Registrar desligamento`;
- Competência final: mês da saída;
- Inativação: dia seguinte à saída.

Validações:

- Data não pode anteceder o início correspondente;
- Demissão formal não pode anteceder a admissão;
- Vínculo já encerrado não aceita segundo desligamento;
- Aviso indenizado exige dias inteiros positivos;
- Aviso trabalhado ou não aplicável não aceita dias indenizados;
- MEI não entra nesse fluxo.

## 10.4 Etapa 3 — impacto

Antes de salvar, o sistema mostra:

- último dia ativo;
- data da inativação;
- competência final e existência dela;
- impacto separado em cada grupo do adiantamento;
- destino do oficial;
- destino da RA;
- destino dos complementos;
- destino do período sem registro;
- criação da rescisão oficial, quando formal;
- criação do acerto de RA;
- criação da pendência demissional, quando formal;
- aviso de que ASO não bloqueia a quitação.

A prévia reaplica permissões por grupo e por campo. Um perfil cadastral sem acesso financeiro vê somente datas, inativação, competência e impactos clínicos autorizados; nomes de grupos, estados e valores financeiros ocultos não aparecem nem podem ser inferidos por totais.

## 10.5 Impacto por grupo

| Grupo | Se ainda não foi pago e a saída é até a data prevista | Se já foi pago |
|---|---|---|
| Oficial | Cancelado no adiantamento; valor final vem da rescisão | Pagamento preservado; não deduz RA |
| RA e reembolso | RA segue ao acerto; reembolso não entra | Somente RA paga deduz RA |
| Complementos | Migram para o pagamento final | Permanecem no próprio grupo |
| Período sem registro | Migra ao final com recibo próprio | Permanece no próprio grupo |

`Cancelado por desligamento` existe somente no adiantamento ainda não pago.

## 10.6 Confirmação

A confirmação repete:

- Empregado;
- Tipo;
- Data;
- Aviso;
- Competência final;
- Inativação;
- Impactos principais.

Salvar D02 não cria uma competência inexistente automaticamente.

---

# 11. D03 — Fonte única em dois contextos

## 11.1 Contexto cadastral

Aberto pelo empregado ou D01:

- Linha do tempo;
- Tipo, data e aviso;
- Situação do vínculo;
- Data de inativação;
- Programação, cancelamento ou correção;
- ASO demissional;
- Link para o acerto na competência.

## 11.2 Contexto financeiro

Aberto pela competência:

- Fila de desligamentos da competência;
- Rescisão oficial;
- Acerto complementar de RA;
- Complementos;
- Período sem registro;
- Ajustes;
- Confirmações e datas efetivas;
- Recibos permitidos;
- Checklist da competência.

## 11.3 Divisão de permissões

- Programar saída não concede visão de valores;
- Quitar valores não concede edição da data ou do tipo;
- Visualizar rescisão não concede visualizar RA;
- Visualizar RA não concede rescisão;
- Visualizar memória não concede sobrescrever;
- Confirmar rescisão não confirma acerto;
- Confirmar acerto não confirma rescisão;
- Abrir ASO exige permissão própria.

---

# 12. Linha do tempo e estados do vínculo

## 12.1 Linha do tempo

1. Desligamento criado ou programado;
2. Último dia ativo;
3. Inativação automática no dia seguinte;
4. Competência final resolvida posteriormente, se necessário;
5. ASO acompanhado separadamente.

## 12.2 Situações derivadas

- Encerramento programado;
- Último dia ativo;
- Demitido formalmente;
- Encerrado sem registro;
- Inativo;
- Programação cancelada, apenas no histórico;
- Em correção.

## 12.3 Situação financeira derivada

- Pendente de dados;
- Aguardando conferência;
- Grupos pendentes;
- Financeiro quitado;
- Em correção.

Não existe campo livre de situação financeira.

---

# 13. Competência final

## 13.1 Derivação

A competência final vem da data de saída. O usuário não a escolhe livremente.

## 13.2 Competência inexistente

Quando a competência ainda não existe:

- o desligamento é salvo normalmente;
- D03 mostra `Aguardando criação da competência`;
- nenhum cálculo ou pagamento é fabricado;
- usuário autorizado pode ir a K02;
- a materialização posterior deve ser idempotente;
- após a criação, o retorno abre o mesmo desligamento.

## 13.3 Competência fechada

Se a saída for registrada ou alterada em competência fechada:

- não existe reprocessamento silencioso;
- reabertura exige permissão, justificativa e nova versão;
- grupos pagos seguem correção formal;
- versão fechada anterior permanece preservada.

## 13.4 Checklist

A competência só fecha quando estiverem resolvidos, conforme aplicabilidade:

- Rescisão oficial;
- Acerto de RA;
- Complementos;
- Período sem registro;
- Ajustes positivos;
- Correções e recibos afetados.

ASO demissional pendente não bloqueia o fechamento financeiro.

---

# 14. Rescisão oficial

## 14.1 Fonte

- Valor digitado a partir do contador;
- Não calculado;
- Não decomposto;
- Não contém RA;
- Substitui o líquido mensal oficial;
- Não pode coexistir com o líquido mensal na competência final.

## 14.2 Campos

- Valor informado;
- Confirmação obrigatória de que não contém RA;
- Estado;
- Data efetiva;
- Valor efetivamente pago;
- Versão e usuário.

## 14.3 Confirmação

- Integral;
- Independente do acerto de RA;
- Pode ocorrer em outra data;
- Não gera recibo interno;
- Exige data efetiva válida e não futura;
- Clique repetido não duplica confirmação.

## 14.4 Valor zero — proposta

Quando o contador confirmar valor zero, a proposta deste lote é resolver a rescisão como `Não aplicável`, com motivo, permissão e auditoria. Não haverá pagamento ou recibo de valor zero.

---

# 15. Acerto complementar de RA

## 15.1 Base exclusiva

Inclui somente verbas calculadas sobre a RA vigente na data real de saída.

Não inclui:

- Salário-base;
- Complementos;
- Reembolso;
- Período sem registro;
- Impostos;
- Descontos;
- Média de RA.

## 15.2 Início do direito na competência

A regra consolidada distingue somente a primeira competência do vínculo:

```text
Se a competência final for a primeira competência do vínculo:
início do direito = máximo(início da competência, início das atividades)

Nas competências seguintes:
início do direito = primeiro dia da competência
```

A RA vigente na data de saída é aplicada à competência inteira. Por isso, uma versão de RA incluída ou alterada durante uma competência posterior vale desde o primeiro dia daquela competência para este acerto; ela não cria uma proporcionalidade diária pela data da alteração.

A data usada, a versão vigente da RA e a regra aplicada deverão aparecer na memória e na auditoria.

## 15.3 Saldo proporcional

```text
RA proporcional =
RA vigente ÷ 30 × D30(início do direito, data de saída)

Saldo de RA =
máximo(0, RA proporcional − RA efetivamente paga no adiantamento)

Excedente absorvido =
máximo(0, RA efetivamente paga no adiantamento − RA proporcional)
```

Somente o componente RA efetivamente pago é deduzido. Reembolso do mesmo recibo não participa.

O excedente não reduz aviso, 13º ou férias.

## 15.4 Aviso indenizado

```text
Aviso indenizado sobre RA =
RA vigente ÷ 30 × dias indenizados confirmados
```

Aviso trabalhado já está representado pelos dias trabalhados e não cria linha adicional.

## 15.5 Décimo terceiro

```text
13º sobre RA =
RA vigente × avos confirmados ÷ 12
```

## 15.6 Férias proporcionais

```text
Férias proporcionais sobre RA =
RA vigente × avos confirmados ÷ 12

1/3 proporcional =
férias proporcionais sobre RA ÷ 3
```

## 15.7 Férias vencidas

Quando confirmado `Sim`:

```text
Férias vencidas sobre RA = RA vigente
1/3 das férias vencidas = RA vigente ÷ 3
```

Não existe dobra.

## 15.8 Total

```text
Total do acerto de RA =
saldo proporcional de RA
+ aviso indenizado sobre RA
+ 13º sobre RA
+ férias proporcionais sobre RA
+ 1/3 proporcional
+ férias vencidas sobre RA
+ 1/3 das férias vencidas
```

## 15.9 Aplicabilidade

Cada verba exige confirmação explícita de aplicabilidade.

Avos aceitam inteiros de 0 a 12. Dias indenizados aceitam inteiro positivo, sem inventar um limite jurídico máximo neste protótipo.

## 15.10 Sobrescrita

Usuário autorizado pode substituir o total ou componente calculado. O sistema preserva:

- Fórmula;
- Memória original;
- Valor original;
- Valor manual;
- Diferença;
- Justificativa;
- Usuário e data;
- Pagamentos e recibos afetados.

Depois de pago, a memória não é editada diretamente; abre F04.

## 15.11 Pagamento e recibo

- Confirmação própria;
- Pagamento integral;
- Data efetiva obrigatória;
- Pode ocorrer em data diferente da rescisão;
- Recibo próprio somente depois da confirmação;
- Valor zero não gera recibo;
- Diferença absorvida não gera recibo;
- Falha do PDF não desfaz pagamento ou número.

---

# 16. Outros grupos da última competência

## 16.1 Complementos

- Permanecem integrais no grupo mensal;
- Não são proporcionais por dia;
- Não entram no acerto de RA;
- Não entram em aviso, 13º ou férias;
- Mantêm confirmação e recibo próprios.

## 16.2 Período sem registro

- Permanece em grupo próprio;
- Termina na admissão ou na saída sem registro, conforme o vínculo;
- Usa base confirmada e D30;
- Não inclui RA ou complemento;
- Mantém confirmação e recibo próprios.

Proposta de segurança contra dupla contagem: D03 exige confirmar que a base informada para o período sem registro não contém a RA calculada separadamente.

## 16.3 Reembolsos

Salário redondo não cria reembolso novo na rescisão ou no acerto complementar.

## 16.4 Ajustes

Ajustes positivos existentes permanecem em F05 e continuam bloqueando o fechamento até serem resolvidos.

---

# 17. Adiantamento na competência final

## 17.1 Saída até a data prevista, grupo ainda não pago

- Oficial: `Cancelado por desligamento` e substituído pela rescisão;
- RA: cancelada no adiantamento e levada ao acerto;
- Complementos: migram ao pagamento final;
- Período sem registro: migra ao final com recibo próprio.

## 17.2 Grupo já pago

- Pagamento real é preservado;
- Somente RA paga deduz RA proporcional;
- Oficial, complemento, reembolso e período sem registro não deduzem RA;
- Excesso de RA vira diferença absorvida;
- Nenhum valor é cobrado de volta.

## 17.3 Saída depois da data prevista, grupo ainda pendente

Os documentos aprovados determinam que o grupo permaneça pendente para conferência, mas não escolheram automaticamente entre pagar o adiantamento atrasado ou migrá-lo.

Proposta do protótipo: estado `Decisão necessária`, sem cálculo ou pagamento automático. A decisão operacional deverá ser aprovada antes da implementação.

---

# 18. Desligamento sem registro

- Exige ausência de admissão formal;
- Encerra o vínculo na data inclusiva;
- Fecha o período sem registro;
- Não gera rescisão oficial;
- Não gera ASO demissional;
- Pode gerar acerto de RA quando houver RA aplicável;
- Complementos e período sem registro continuam em seus grupos;
- Inativação ocorre no dia seguinte.

Se início e saída ocorrerem na mesma competência, existe apenas um intervalo D30 por verba.

Se início e saída forem no mesmo dia, o intervalo vale um dia.

---

# 19. ASO demissional

Somente demissão formal:

- Todo desligamento cria pendência;
- ASO demissional válido já vinculado faz a pendência nascer resolvida;
- Um ASO demissional vigente por desligamento;
- Novo registro direciona à retificação;
- Não existe dispensa;
- `Não compareceu` não cria exame;
- Encerrar sem realização exige permissão e justificativa;
- Não gera vencimento futuro;
- Não bloqueia pagamentos ou fechamento financeiro.

Proposta para cancelamento posterior: preservar exame e vínculo histórico; retirar somente a pendência ativa ligada à programação cancelada. Outro desligamento exigirá nova análise.

---

# 20. Cancelamento e correção do desligamento

## 20.1 Cancelar programação futura

Proposta recomendada:

- Disponível enquanto a saída ainda for futura;
- Exige permissão e justificativa;
- Mostra impactos antes de confirmar;
- Cancela a programação, não pagamentos;
- Preserva a versão cancelada no histórico.

## 20.2 Saída já efetivada ou com efeitos

Se já existir pagamento, recibo, inativação, ASO ou competência fechada:

- Não oferecer cancelamento simples;
- Usar `Corrigir desligamento`;
- Preservar versões;
- Recalcular apenas grupos não pagos;
- Enviar grupos pagos para F04;
- Nunca mudar a competência final silenciosamente;
- Nunca reativar vínculo automaticamente.

## 20.3 Fontes alteradas

Mudança de data, aviso, dias indenizados, avos, férias vencidas ou RA vigente:

- Antes do pagamento: invalida o cálculo e volta a `Pendente de conferência`;
- Depois do pagamento: abre correção formal;
- Mudança de mês exige avaliar as duas competências e preservar a anterior.

---

# 21. Desligamento informado depois do pagamento mensal

Proposta de estado seguro: `Desligamento informado após pagamento`.

Nesse estado:

- O valor já pago permanece;
- O líquido mensal não é substituído silenciosamente;
- A RA mensal paga não é apagada;
- O sistema abre correção guiada;
- Ajuste positivo ou diferença absorvida seguem F04/F05;
- Recibos anteriores permanecem consultáveis;
- A competência não fecha até a correção terminar.

---

# 22. Permissões

## 22.1 Cadastrais

- Visualizar lista;
- Visualizar dados do desligamento;
- Criar ou programar;
- Editar programação futura;
- Cancelar programação futura;
- Corrigir desligamento efetivado;
- Visualizar impacto sem valores;
- Visualizar situação de ASO;
- Abrir ASO;
- Consultar histórico.

## 22.2 Financeiras

- Visualizar área financeira;
- Visualizar valores;
- Visualizar memória de RA;
- Informar rescisão oficial;
- Confirmar ausência de RA no oficial;
- Confirmar pagamento oficial;
- Informar aplicabilidade do acerto;
- Calcular ou recalcular;
- Sobrescrever cálculo;
- Marcar não aplicável;
- Confirmar acerto de RA;
- Iniciar correção;
- Cancelar confirmação;
- Visualizar, baixar ou reimprimir recibo;
- Consultar histórico financeiro.

## 22.3 Composição

Nenhuma permissão implica automaticamente outra. Em especial:

- Criar desligamento não vê valores;
- Quitar não altera vínculo;
- Ver memória não sobrescreve;
- Confirmar rescisão não confirma RA;
- Confirmar RA não concede, por si só, permissão para visualizar, baixar ou reimprimir o recibo;
- Abrir D03 não reabre competência;
- Permissão de ASO continua separada.

---

# 23. Segurança e isolamento

## 23.1 Empresa ativa

Desligamento, vínculo, competência, grupos, recibos, ASO e auditoria devem pertencer à mesma empresa ativa.

O servidor:

- Deriva a empresa da sessão;
- Não confia em CNPJ enviado pela tela;
- Responde como não encontrado para registro de outro CNPJ;
- Revalida links de painel, competência e notificação;
- Bloqueia mutações em empresa inativa;
- Exige seleção explícita até do master.

## 23.2 Concorrência

Ações críticas carregam versão. Registro desatualizado:

- Não sobrescreve;
- Mostra conflito;
- Preserva dados digitados quando seguro;
- Exige atualização e nova conferência.

## 23.3 Repetição segura

- Duplo clique cria um único desligamento;
- Mesma confirmação não paga duas vezes;
- Mesmo acerto não recebe dois recibos;
- Resposta perdida devolve o resultado existente;
- Mesma chave com dados diferentes é recusada;
- Materialização posterior da competência não duplica participante.

## 23.4 Empresa inativa

Empresa inativa abre em modo histórico:

- Sem criar, alterar, confirmar, corrigir ou emitir novo documento;
- Permitindo somente consultas autorizadas;
- Mantendo a empresa claramente identificada.

---

# 24. Auditoria

Registrar, na mesma operação de negócio:

- Criação e programação;
- Alteração de data, tipo e aviso;
- Cancelamento ou correção;
- Inativação automática;
- Criação e resolução da pendência demissional;
- Valor oficial e confirmação de ausência de RA;
- Avos, dias, férias vencidas e aplicabilidade;
- Memória original e manual;
- Confirmações e cancelamentos financeiros;
- Ajustes e diferenças absorvidas;
- Emissão e substituição do recibo;
- Visualização, download e reimpressão de recibos, como ações sensíveis independentes;
- Reabertura e fechamento da competência;
- Tentativas negadas e conflitos.

Cada evento guarda:

- Empresa;
- Vínculo;
- Competência;
- Usuário ou rotina do sistema;
- Data e hora;
- Versão;
- Origem;
- Justificativa, quando exigida;
- Valores antes e depois conforme a permissão atual.

Falha obrigatória da auditoria reverte a alteração de negócio.

---

# 25. Estados seguros e mensagens

O protótipo demonstra:

- Sem desligamentos;
- Nenhum resultado por filtro;
- Programado;
- Último dia ativo;
- Inativo no dia seguinte;
- Cancelado no histórico;
- Sem competência final;
- Competência fechada;
- Aguardando contador;
- Aguardando confirmação de ausência de RA;
- Aguardando avos ou aplicabilidade;
- Calculado;
- Pronto para pagamento;
- Pago;
- Não aplicável;
- Em correção;
- Diferença absorvida;
- ASO pendente sem bloqueio financeiro;
- Conflito de versão;
- Processamento idempotente;
- Empresa inativa;
- Tentativa de outro CNPJ;
- Desligamento tardio após pagamento.

Nenhum erro confirma a existência de registro em outra empresa.

---

# 26. Exportação aplicável

Não existe central de exportações.

D01 reutiliza a exportação de colaboradores com:

- Filtros atuais;
- Empresa ativa;
- Campos autorizados;
- Tipo e situação do desligamento;
- Datas permitidas;
- Estados financeiro e de ASO somente quando autorizados.

Valores e resultados clínicos ocultos não aparecem nem podem ser inferidos por total ou coluna vazia.

---

# 27. Acessibilidade e responsividade

- Texto acompanha todos os estados;
- Cor nunca comunica sozinha;
- Controles usam elementos nativos;
- Campos possuem rótulo;
- Modais possuem título e confirmação explícita;
- Foco segue a ordem visual;
- Primeiro campo inválido recebe foco;
- Tabelas permanecem roláveis em tela estreita;
- Blocos paralelos empilham em 736, 360 e 320 pixels;
- Tema claro e escuro mantêm contraste;
- Processamento bloqueia repetição.

---

# 28. Casos obrigatórios de homologação

## 28.1 Cadastro e datas

- [ ] Demissão formal futura;
- [ ] Desligamento sem registro;
- [ ] Tipo incompatível com admissão;
- [ ] Data anterior ao início ou admissão;
- [ ] Data igual ao início;
- [ ] Inativação somente no dia seguinte;
- [ ] Cancelamento de programação futura;
- [ ] Correção depois de efeito financeiro;
- [ ] Competência final derivada da saída;
- [ ] Competência final ainda inexistente.

## 28.2 Adiantamento e duplicidade

- [ ] Saída antes da data prevista e grupo não pago;
- [ ] Saída na data prevista antes da confirmação;
- [ ] Saída depois da data com grupo ainda pendente;
- [ ] Saída depois da RA paga;
- [ ] Somente RA paga deduz RA;
- [ ] Reembolso do mesmo recibo não é deduzido;
- [ ] Oficial pago não deduz RA;
- [ ] Complemento pago não deduz RA;
- [ ] RA mensal não coexiste com o acerto;
- [ ] Líquido mensal não coexiste com rescisão oficial.

## 28.3 Cálculo do acerto

- [ ] D30 em fevereiro de 28 dias;
- [ ] D30 em fevereiro de 29 dias;
- [ ] Saída no dia 31;
- [ ] Início e saída no mesmo dia;
- [ ] RA paga menor, igual e maior que a proporcional;
- [ ] Primeira competência inicia o direito na data de início das atividades;
- [ ] Competência posterior usa o primeiro dia e a RA vigente na saída;
- [ ] Aviso trabalhado sem linha adicional;
- [ ] Aviso indenizado com dias confirmados;
- [ ] 13º com 0 a 12 avos;
- [ ] Férias proporcionais e um terço;
- [ ] Férias vencidas sem dobra;
- [ ] RA zero;
- [ ] Sobrescrita com justificativa;
- [ ] Sobrescrita negada por permissão.

## 28.4 Confirmações e documentos

- [ ] Rescisão e acerto confirmados separadamente;
- [ ] Datas efetivas podem ser diferentes;
- [ ] Rescisão não gera recibo;
- [ ] Acerto pago gera um recibo;
- [ ] Zero não gera recibo;
- [ ] Diferença absorvida não gera recibo;
- [ ] Duplo clique não duplica pagamento ou recibo;
- [ ] Cada verba tem aplicabilidade confirmada explicitamente antes da quitação;
- [ ] Grupo de valor zero exige motivo e resolução auditada, sem recibo;
- [ ] Falha de PDF preserva pagamento e número;
- [ ] Competência não fecha com grupo financeiro pendente.

## 28.5 Segurança

- [ ] Perfil cadastral não vê valores;
- [ ] Financeiro não altera datas;
- [ ] Rescisão e RA podem ser ocultadas independentemente;
- [ ] Campo oculto não aparece em total, filtro ou exportação;
- [ ] Acesso cruzado responde como não encontrado;
- [ ] Troca de empresa invalida formulário;
- [ ] Troca de empregado ou competência não reutiliza rascunho, confirmação, valor ou recibo do contexto anterior;
- [ ] Permissão revogada invalida modal;
- [ ] Conflito não sobrescreve versão;
- [ ] Empresa inativa permite somente consulta;
- [ ] Entrada pelo empregado e pela competência mostra o mesmo registro.

---

# 29. Propostas novas para aprovação

**Aprovação do usuário:** as oito propostas desta seção foram aprovadas integralmente em 20/08/2026.

As propostas aprovadas são:

1. Cancelamento simples somente de programação futura; desligamento efetivado usa correção guiada;
2. Estado `Desligamento informado após pagamento`, sem substituição automática;
3. Estado `Decisão necessária` quando a saída ocorre depois da data prevista e o adiantamento continua pendente;
4. Exibição explícita da regra já consolidada para o início do direito da RA na primeira competência e nas competências posteriores;
5. Confirmação de que a base do período sem registro exclui RA;
6. Rescisão oficial zero resolvida como `Não aplicável`, com motivo e auditoria;
7. Preservação do ASO histórico quando a programação for cancelada;
8. Avos limitados de 0 a 12 e dias indenizados inteiros positivos, sem limite máximo jurídico inventado.

---

# 30. Checklist de revisão do usuário

Antes de aprovar, revisar especialmente:

1. D01 dentro de Colaboradores, sem item lateral;
2. As três etapas de D02;
3. A diferença entre formal e sem registro;
4. A prévia do impacto por grupo;
5. O cancelamento futuro versus correção efetivada;
6. Os dois contextos da mesma D03;
7. A separação entre rescisão oficial e acerto de RA;
8. A memória D30 e as verbas sobre RA;
9. A dedução somente da RA paga;
10. O tratamento de excedente absorvido;
11. Complementos e período sem registro fora do acerto;
12. O recibo somente do acerto pago;
13. A independência do ASO;
14. Os perfis com dados ocultos;
15. As oito propostas da seção 29;
16. A visualização em celular.

---

# 31. Situação e próxima etapa

**Situação atual:** Lote 5 aprovado integralmente pelo usuário em 20/08/2026, incluindo D01, D02, D03 e as oito propostas da seção 29.  
**Evolução posterior:** o Lote 6 — S01 a S06, cobrindo acompanhamento de ASO, exames, versões e clínicas compartilhadas — foi aprovado integralmente pelo usuário em 21/08/2026.  
**Próximo passo:** elaborar e revisar o Lote 7 — notificações, auditoria, administração, segurança e incidentes.
