# Regras de Negócio — Folha e Pagamentos

**Status:** rascunho de descoberta — versão 0.1  
**Data:** 10 de agosto de 2026

## 1. Finalidade

Este documento aplica-se exclusivamente ao vínculo **CLT** e detalha como o sistema organizará o adiantamento salarial, o pagamento final e as rubricas adicionais oficiais. O contador continuará sendo a fonte dos valores oficiais da folha; o sistema fará planejamento, conferência, conciliação e controle dos pagamentos.

## 2. Conceitos

- **Salário contratual oficial:** salário vigente registrado no vínculo e refletido nos documentos oficiais.
- **Adiantamento oficial:** primeira parcela do salário, atualmente definida como 40% da base salarial configurada.
- **Saldo oficial:** valor devido na etapa final do mês, confirmado pelo retorno do contador.
- **Rubrica adicional:** valor fixo ou variável que precisa ser classificado e validado com o contador.
- **Distribuição:** regra que define em qual parcela uma rubrica será considerada.
- **Competência:** mês e ano a que a folha e as ocorrências pertencem.
- **Valor previsto:** valor preparado antes da conferência final.
- **Valor oficial:** valor confirmado no demonstrativo recebido do contador.
- **Valor pago:** saída financeira efetivamente realizada e comprovada.
- **Janela de pagamento:** intervalo de datas em que uma parcela normalmente é paga.
- **Data programada:** dia escolhido antecipadamente para o pagamento; obrigatória para o salário oficial e opcional para rubricas adicionais.
- **Data efetiva:** dia em que o pagamento realmente ocorreu.
- **Obrigação adicional:** valor individual gerado por uma rubrica em determinada competência e etapa de referência.
- **Alocação do pagamento:** ligação entre uma saída financeira e a obrigação específica que ela quita total ou parcialmente.

## 3. Regra do salário oficial

Para vínculos com duas parcelas:

1. o sistema calcula uma previsão de adiantamento equivalente a 40% da base configurada;
2. o pagamento final contém o saldo da remuneração oficial;
3. o valor final do contador prevalece sobre a previsão do sistema;
4. qualquer diferença entre previsão e valor oficial fica visível na conciliação;
5. descontos, tributos e encargos não são calculados pelo sistema no MVP.

Para vínculos com parcela única, não existe obrigação de adiantamento e o valor oficial é controlado integralmente na etapa de pagamento.

## 3.1 Janelas de pagamento

Na operação atual:

- o adiantamento é programado para um dos dias 20, 21 ou 22 do mês da competência;
- o pagamento final é programado para um dos dias 5, 6 ou 7 do mês seguinte à competência.

O sistema não fixará automaticamente um único dia. Ao abrir cada competência, o usuário escolherá a data programada de cada parcela dentro da respectiva janela. A data programada e a data efetiva serão guardadas separadamente.

Regras propostas:

- cada CNPJ possui suas próprias janelas, mesmo que inicialmente sejam iguais;
- uma data fora da janela exige justificativa e permissão adequada;
- uma parcela não paga até o encerramento da janela será destacada como pendente;
- reagendamentos mantêm a data anterior no histórico;
- a regra para fins de semana e feriados ainda precisa ser definida.

## 4. Configuração das rubricas adicionais

Cada rubrica terá obrigatoriamente:

- CNPJ e vínculo do colaborador;
- nome e categoria;
- valor ou forma de obtenção do valor;
- natureza fixa ou variável;
- recorrência mensal ou ocorrência única;
- início e, quando aplicável, fim da vigência;
- distribuição entre as parcelas;
- justificativa e evidência;
- aprovador;
- situação perante o contador e a folha oficial.

Uma diferença ainda não refletida na folha será apresentada como pendência de regularização e não como “salário por fora” disponível para programação automática.

Distribuições aceitas no MVP:

| Distribuição | Adiantamento | Pagamento |
|---|---:|---:|
| Dividida igualmente | 50% | 50% |
| Somente no adiantamento | 100% | 0% |
| Somente no pagamento | 0% | 100% |

A soma da distribuição deverá ser sempre 100%. Uma distribuição personalizada poderá ser avaliada futuramente, caso exista necessidade real.

A distribuição indica a etapa de referência e não obriga a rubrica a ser paga na mesma data do salário oficial. Por exemplo, uma rubrica destinada à etapa de pagamento poderá ser baixada em data posterior à data do saldo oficial, mesmo sem programação prévia.

## 5. Rubricas fixas

- Uma rubrica fixa recorrente gera um rascunho em cada competência durante sua vigência.
- Uma rubrica fixa de ocorrência única aparece somente na competência escolhida.
- O valor e a distribuição são copiados da configuração vigente.
- O rascunho precisa ser conferido antes do fechamento da parcela.
- Alterações futuras criam nova vigência e não modificam meses anteriores.

## 6. Rubricas variáveis

- São lançadas individualmente na competência em que ocorrerem.
- Devem possuir quantidade ou descrição da ocorrência, valor, evidência e aprovação.
- Podem ser destinadas somente ao adiantamento, somente ao pagamento ou divididas igualmente.
- Horas extras e feriados trabalhados devem ser enviados ao contador e classificados corretamente antes do fechamento oficial.
- Uma rubrica variável não se repete automaticamente no mês seguinte.

## 7. Conciliação e prevenção de dupla contagem

Uma rubrica terá uma das seguintes situações:

- rascunho;
- aprovada internamente;
- a enviar ao contador;
- enviada ao contador;
- incluída na folha oficial;
- não incluída — pendente de regularização;
- corrigida em competência posterior;
- cancelada com justificativa.

Regras obrigatórias:

- Se a rubrica já estiver incluída no líquido oficial recebido do contador, ela não poderá ser somada novamente ao total a pagar.
- Se ainda não estiver incluída, será exibida separadamente como pendência, sem aparentar que faz parte do valor oficial.
- A baixa financeira não muda automaticamente a situação contábil da rubrica.
- A regularização exige evidência da correção ou inclusão oficial validada com o contador.
- Toda mudança de valor, distribuição ou situação ficará no histórico de auditoria.

## 7.1 Obrigações e pagamentos independentes

Cada rubrica de uma competência gera sua própria obrigação. O sistema não agrupará obrigatoriamente todos os valores adicionais de um colaborador em um único pagamento.

A geração de obrigação futura e sua programação somente ocorrerão para rubrica já incluída oficialmente ou cuja classificação e tratamento tenham sido validados pelo contador. Quando um valor ainda estiver fora da folha, o sistema poderá registrar retrospectivamente uma saída já realizada para auditoria e conciliação, mas não criará uma rotina de pagamento paralelo.

Regras:

- cada obrigação possui valor, situação e saldo próprios;
- a data programada é opcional para a obrigação adicional;
- a data da obrigação pode ser diferente da data do salário oficial;
- duas rubricas do mesmo colaborador podem ser pagas em dias diferentes;
- uma obrigação pode receber um pagamento integral ou vários pagamentos parciais;
- um pagamento pode quitar somente a rubrica escolhida, sem baixar as demais;
- cada pagamento registra data efetiva, valor, forma de pagamento e comprovante;
- o sistema mostra separadamente o que está programado, parcialmente pago, pago ou ainda sem pagamento;
- pagamentos e obrigações sempre permanecem vinculados ao mesmo CNPJ e vínculo do colaborador;
- valores que ainda não receberam tratamento oficial continuam identificados como pendência de regularização, mesmo quando há registro da saída financeira.
- uma pendência sem tratamento oficial não pode gerar pagamento recorrente automático nem programação bancária.

## 8. Composição das parcelas

O sistema exibirá a composição sem misturar as origens:

### Adiantamento

- previsão de 40% do salário oficial;
- rubricas adicionais destinadas ao adiantamento e já validadas;
- total previsto;
- total oficial, quando disponível;
- total efetivamente pago;
- diferença pendente.

As rubricas listadas nessa etapa podem ter datas efetivas distintas da data do adiantamento oficial.

### Pagamento final

- saldo oficial informado pelo contador;
- rubricas adicionais destinadas ao pagamento e já validadas;
- total previsto;
- total oficial;
- total efetivamente pago;
- diferença pendente.

As rubricas listadas nessa etapa podem ter datas efetivas distintas da data do pagamento oficial. A interface deve exibir cada obrigação individualmente e também oferecer apenas uma soma informativa.

## 9. Fluxo mensal

1. O usuário seleciona o CNPJ e abre a competência.
2. O sistema usa o salário e as configurações vigentes naquele mês.
3. O adiantamento oficial é previsto pela regra de 40%.
4. O usuário escolhe a data programada do adiantamento entre os dias 20 e 22 e a do saldo entre os dias 5 e 7 do mês seguinte.
5. As rubricas fixas geram rascunhos e as variáveis são lançadas manualmente.
6. O usuário confere a distribuição de cada rubrica.
7. Os eventos são enviados ao contador.
8. O usuário registra ou importa os valores oficiais recebidos.
9. O sistema identifica itens já incluídos, diferenças e possíveis duplicidades.
10. As parcelas oficiais são aprovadas.
11. Cada obrigação adicional pode receber uma data programada, mas normalmente permanece sem data até o pagamento acontecer.
12. No momento da saída financeira, são registrados a data efetiva e o valor, alocados à obrigação correspondente e anexado o comprovante.
13. A competência só é fechada após a conferência das pendências.

## 10. Decisão ainda necessária

É preciso confirmar:

- se os 40% são calculados sobre o salário contratual bruto vigente;
- se o pagamento final será sempre substituído pelo líquido informado pelo contador;
- qual critério determina o dia exato dentro de cada janela;
- como fins de semana e feriados alteram a programação.

Essas definições evitam que descontos da folha sejam tratados incorretamente como parte de uma divisão simples de 40% e 60% e que o sistema programe pagamentos para datas inadequadas.
