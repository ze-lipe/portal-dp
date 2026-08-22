# Sistema de Departamento Pessoal — Visão e Escopo Inicial

**Status:** rascunho de descoberta — versão 0.1  
**Data:** 10 de agosto de 2026

## 1. Contexto

A padaria opera por meio de três empresas, cada uma com CNPJ próprio. O sistema será usado para organizar os colaboradores, os ASOs e o controle financeiro dos pagamentos da folha, cujos cálculos são realizados pelo contador.

O sistema não calculará folha, tributos ou encargos no MVP. Ele receberá os valores oficiais do holerite/contracheque, controlará as parcelas a pagar, registrará os pagamentos e apontará diferenças ou pendências que precisem ser tratadas com o contador. Em casos de regularização, poderá armazenar uma estimativa fornecida por profissional responsável, sempre separada do valor oficial, mas não fará esse cálculo automaticamente.

## 2. Objetivos

- Manter os dados dos três CNPJs estritamente separados.
- Controlar o histórico dos vínculos de cada colaborador.
- Acompanhar admissão, registro, alterações salariais, desligamento e ASOs.
- Registrar o líquido oficial informado pelo contador em cada competência.
- Permitir uma política de pagamento em parcela única ou em duas parcelas: adiantamento e saldo.
- Conciliar o valor oficial, os eventos variáveis do mês e os pagamentos efetivamente realizados.
- Identificar divergências e acompanhar sua regularização com rastreabilidade.
- Preservar o período realmente trabalhado quando o registro for confirmado posteriormente, sem quebrar a continuidade do vínculo.
- Produzir alertas, relatórios e um histórico de auditoria por CNPJ.

## 3. Princípios obrigatórios

### 3.1 Separação por CNPJ

- O usuário sempre trabalhará dentro de um CNPJ selecionado explicitamente.
- Colaboradores, vínculos, salários, folhas, pagamentos, ASOs, documentos e relatórios pertencerão obrigatoriamente a um único CNPJ.
- Pesquisas e exportações usarão somente o CNPJ ativo.
- O MVP não terá relatório consolidado dos três CNPJs.
- Usuários poderão receber acesso a um, dois ou três CNPJs, mas visualizarão apenas um de cada vez.
- Uma transferência entre empresas encerrará o vínculo anterior e criará outro no novo CNPJ; o histórico não será movido nem misturado.

### 3.2 Histórico e rastreabilidade

- Alterações de salário e política de pagamento terão data de vigência e não apagarão valores antigos.
- Competências fechadas não poderão ser alteradas sem reabertura autorizada e justificativa.
- Pagamentos, estornos, alterações e downloads de documentos sensíveis serão auditados.
- Arquivos e comprovantes também serão protegidos pelas permissões do CNPJ correspondente.

### 3.3 Conformidade

O sistema não tratará remuneração omitida da folha como uma categoria normal denominada “por fora”. Ele distinguirá:

1. remuneração oficial informada pelo contador;
2. remuneração total acordada;
3. ocorrências fixas ou variáveis ainda não refletidas na folha;
4. divergências pendentes de regularização;
5. valores efetivamente pagos.

Uma diferença somente será considerada regularizada quando houver comprovação de que recebeu o tratamento oficial definido com o contador. O simples pagamento da diferença não encerrará a pendência.

Pessoas em pré-admissão poderão ser cadastradas para organização de documentos. Se começarem a trabalhar sem comprovação do registro, o sistema sinalizará uma pendência urgente de regularização; essa condição não será tratada como modalidade normal de contratação.

A manifestação da pessoa de que “não quer ser registrada” não será usada como autorização para ativar uma folha paralela. O sistema exigirá comprovação de admissão preliminar ou completa antes de liberar o fluxo operacional normal. Casos históricos poderão ser preservados em área restrita de auditoria e encaminhamento profissional, sem geração automática de pagamentos.

## 4. Escopo proposto para o MVP

O sistema oferecerá apenas dois tipos de relação: **CLT** e **MEI**. A pessoa poderá possuir históricos dos dois tipos em momentos diferentes, mas os dados financeiros e documentos de cada período permanecerão separados.

### 4.1 Empresas e acessos

- Cadastro independente dos três CNPJs.
- Configurações próprias por empresa.
- Usuários e perfis de acesso por CNPJ.
- Troca explícita da empresa ativa.

### 4.2 Colaboradores e vínculos

Esta seção corresponde ao vínculo CLT.

- Dados cadastrais do colaborador.
- CNPJ, matrícula, cargo e situação do vínculo.
- Datas de admissão, confirmação do registro e desligamento.
- Comprovante ou referência do registro.
- Histórico do salário contratual oficial e do valor apresentado no holerite/contracheque.
- Histórico da remuneração total acordada.
- Identificação da diferença entre o valor acordado e o valor oficial.
- Responsável, prazo, justificativa e situação de cada regularização.
- Política de pagamento em uma ou duas parcelas.
- Percentuais configuráveis, com total obrigatório de 100%.
- Distribuição das rubricas oficiais entre adiantamento e pagamento final.

Status iniciais sugeridos:

- pré-admissão;
- aguardando documentos;
- registro aguardando confirmação;
- registrado e ativo;
- afastado;
- desligado;
- trabalho encerrado sem registro confirmado;
- pendência de regularização.

#### Continuidade e admissão retroativa

- O colaborador terá um único vínculo contínuo dentro do CNPJ.
- Serão guardadas separadamente a data de início do trabalho informada, a data de admissão constante no eSocial e a data em que o registro foi transmitido ou confirmado.
- Se as datas divergirem, o sistema abrirá uma pendência crítica de regularização.
- O período anterior à confirmação não será apagado quando o holerite passar a existir.
- Uma estimativa fornecida por profissional responsável poderá ser registrada, sem aparência de holerite ou folha oficial.
- O valor oficial corrigido pelo contador substituirá a estimativa para fins de conciliação, preservando todas as versões no histórico.
- Pagamentos feitos antes da regularização ficarão como “pagamentos a conciliar” até serem vinculados às verbas oficiais correspondentes.
- Se a pessoa parar de trabalhar antes de qualquer confirmação do registro, o vínculo ficará operacionalmente encerrado, mas o caso de regularização continuará aberto.
- Serão preservados o primeiro dia, o último dia trabalhado, as competências, os valores estimados, os pagamentos e o saldo ainda não conciliado.

### 4.3 MEI

O sistema poderá cadastrar MEIs como relação distinta do vínculo de emprego e após validação do enquadramento pelo contador ou assessor responsável.

- A existência de CNPJ ou MEI não será tratada como prova automática de autonomia.
- O cadastro guardará contrato, escopo do serviço, CNPJ, atividade, início, encerramento, notas fiscais e pagamentos.
- O valor financeiro será denominado valor contratual ou honorário, nunca salário.
- O contrato poderá prever pagamento em uma ou duas parcelas, com percentuais que somem 100%.
- Itens adicionais somente serão aceitos quando vinculados ao contrato e ao documento fiscal aplicável.
- O MEI não usará campos de salário por fora, adiantamento salarial, horas extras, feriados ou folha.
- Sinais de rotina típica de empregado bloquearão a ativação como MEI até nova validação profissional.
- Uma transição legítima de MEI para CLT encerrará o contrato de serviço e criará um vínculo empregatício a partir da data validada, preservando os dois históricos.
- A transição posterior não regulariza automaticamente um período anterior que, na prática, já possuía características de emprego.

### 4.4 ASOs

- Tipo de exame e data de realização.
- Data de vencimento ou próxima convocação.
- Situação de aptidão conforme o documento.
- Arquivo do ASO.
- Alertas de vencimento.
- Acesso restrito aos usuários autorizados daquele CNPJ.

### 4.5 Competência mensal da folha

- Uma competência por CNPJ e mês.
- Data de recebimento dos dados do contador.
- Documento ou arquivo de origem.
- Líquido oficial por colaborador.
- Situação da competência: rascunho, em conferência, aprovada, paga ou fechada.
- Conciliação entre valor previsto e valor efetivamente pago.

### 4.6 Política de pagamento

Cada CNPJ poderá configurar:

- parcela única; ou
- duas parcelas: adiantamento salarial e saldo.

Na regra atual informada, o adiantamento corresponde a 40% do salário contratual oficial. O saldo é tratado na etapa de pagamento e confirmado pelos valores recebidos do contador.

As datas não são fixas. O planejamento usa janelas operacionais:

- adiantamento entre os dias 20 e 22 do mês da competência;
- pagamento final entre os dias 5 e 7 do mês seguinte.

A data exata do salário oficial será selecionada em cada competência e registrada separadamente da data em que o pagamento realmente ocorreu. As rubricas adicionais não ficam obrigadas a usar essa mesma data. Normalmente, sua data será informada somente quando o pagamento acontecer; uma programação antecipada será opcional.

Cada rubrica adicional poderá ter uma distribuição própria:

- 50% no adiantamento e 50% no pagamento;
- 100% no adiantamento;
- 100% no pagamento.

A configuração terá vigência, datas previstas e regra de composição. Mudanças futuras não alterarão competências anteriores.

### 4.7 Ocorrências fixas e variáveis

Esta seção se aplica à folha CLT. No MEI, valores adicionais pertencem ao contrato de serviço e ao documento fiscal correspondente.

Itens fixos poderão ser recorrentes mensalmente ou válidos para uma única competência. Itens variáveis, como horas extras e feriados trabalhados, terão competência, quantidade, valor, evidência, aprovação e situação perante o contador. Tanto os itens fixos quanto os variáveis poderão ser destinados ao adiantamento, ao pagamento ou divididos entre as duas parcelas.

A destinação ao adiantamento ou ao pagamento identifica a etapa de referência, não uma data bancária obrigatoriamente igual à do salário oficial. Dois itens adicionais do mesmo colaborador poderão ser pagos em dias diferentes, e um deles poderá, por exemplo, ser pago após o saldo oficial.

Situações sugeridas:

- a enviar ao contador;
- enviada ao contador;
- incluída na folha oficial;
- não incluída — pendente de regularização;
- corrigida em competência posterior;
- cancelada com justificativa.

Nenhum item pendente produzirá automaticamente um pagamento oculto.

O sistema terá ainda um registro retrospectivo de divergências remuneratórias para documentar pagamentos já ocorridos e não refletidos na folha, como diferença fixa, hora extra, feriado, bônus ou retirada ainda sem classificação. Esse registro não aceitará programação futura, recorrência automática ou geração de arquivo de pagamento.

### 4.8 Pagamentos

- Valor previsto, vencimento e situação de cada parcela.
- Pagamentos integrais ou parciais.
- Data, valor, forma de pagamento e comprovante.
- Ligação obrigatória do pagamento à parcela ou ocorrência que lhe deu origem.
- Indicação de saldo pendente, atraso ou diferença.
- Baixa independente para cada rubrica adicional, com programação antecipada opcional.
- Possibilidade de pagar rubricas diferentes do mesmo colaborador em datas distintas.
- Possibilidade de dividir uma mesma obrigação em mais de um pagamento, mantendo o saldo em aberto.

### 4.9 Alertas e relatórios

- Colaboradores por situação do vínculo e do registro.
- Colaboradores com diferença entre o início do trabalho informado e a admissão constante no eSocial.
- Pessoas que encerraram o trabalho antes da confirmação do registro, com pendências financeiras ou de regularização.
- Pendências de regularização e tempo em aberto.
- Líquido oficial por competência e CNPJ.
- Adiantamentos, saldos e parcelas únicas.
- Valores previstos, pagos, parciais e vencidos.
- Ocorrências variáveis por situação perante o contador.
- Pagamentos sem conciliação.
- ASOs vencidos ou próximos do vencimento.

## 5. Fluxo mensal proposto

1. Selecionar o CNPJ.
2. Abrir a competência do mês.
3. Registrar ou importar os líquidos oficiais enviados pelo contador.
4. Gerar a parcela única ou as parcelas de adiantamento e saldo, conforme a configuração vigente.
5. Conferir ocorrências fixas e registrar as variáveis do mês.
6. Enviar ao contador os eventos que ainda precisem entrar na folha.
7. Conferir o retorno e marcar quais eventos foram incluídos oficialmente.
8. Aprovar os valores previstos.
9. Registrar pagamentos e comprovantes.
10. Conciliar valores, resolver pendências e fechar a competência.

## 6. Fora do escopo inicial

- Cálculo líquido completo da folha, tributos e encargos.
- Cálculo, programação ou execução de uma folha paralela para pessoas trabalhando sem registro.
- Classificação automática de uma pessoa como autônoma ou MEI sem validação do caso concreto.
- Terceiro tipo de relação além de CLT e MEI no MVP.
- Transmissão direta ao eSocial.
- Integração bancária e execução automática de pagamentos.
- Controle de ponto.
- Recrutamento e seleção.
- Emissão de documentos trabalhistas.
- Relatório consolidado entre os três CNPJs.

## 7. Pontos ainda a definir

- Quais pessoas usarão o sistema e quais CNPJs cada uma poderá acessar.
- Quais MEIs atuais prestam serviços à empresa, quais atividades executam e quais contratos e notas fiscais existem.
- Quem será o profissional responsável por validar o enquadramento de cada prestador antes da ativação.
- Se os três números pertencem a raízes de CNPJ diferentes ou se existe relação de matriz e filial, informação que deverá ser confirmada com o contador.
- Qual é exatamente a base dos 40% do adiantamento: salário contratual bruto vigente ou outro valor informado pelo contador.
- Se o saldo oficial deve ser apenas uma previsão de 60% ou sempre o líquido final informado pelo contador, já considerando descontos e demais rubricas.
- Critério usado para escolher a data exata dentro das janelas de pagamento, inclusive em fins de semana e feriados.
- Formato em que o contador envia a folha: planilha, PDF, relatório ou outro.
- Formas de pagamento que deverão ser cadastradas.
- Categorias dos eventos fixos e variáveis usados atualmente.
- Processo de aprovação de horas extras e feriados.
- Prazos desejados para os alertas de ASO.
- Campos cadastrais e documentos obrigatórios do colaborador.
- Quais informações são registradas sobre o período trabalhado antes da confirmação da admissão: primeiro dia, dias trabalhados, horários e ocorrências.
- Forma de recebimento dos cálculos ou estimativas produzidos pelo contador ou assessor responsável.
- Confirmação do exemplo numérico apresentado na descoberta: o total acordado deve ser igual à soma do valor oficial com a diferença identificada.

## 8. Referências oficiais para validação

- O Ministério do Trabalho e Emprego orienta que a admissão seja enviada ao eSocial antes do início das atividades: [Perguntas Frequentes do MTE](https://www.gov.br/trabalho-e-emprego/pt-br/acesso-a-informacao/perguntas-frequentes).
- A partir de 2 de janeiro de 2026, o registro de empregados e as anotações da CTPS Digital são realizados exclusivamente por meio do eSocial: [Portaria Consolidada MTE nº 1/2025](https://www.gov.br/trabalho-e-emprego/pt-br/assuntos/legislacao/portarias-1/portarias-vigentes-3/PDFPortariaMTEConsolidadan1de17dedezembrode2025compiladaem20.01.2026.pdf).
- A legislação consolidada trata do registro, das anotações do vínculo e da remuneração: [CLT consolidada](https://www.planalto.gov.br/ccivil_03/decreto-lei/del5452compilado.htm).
- O manual vigente do eSocial informa que todas as verbas devidas ao trabalhador, inclusive as sem incidência tributária ou de FGTS, devem ser informadas em rubricas próprias: [Manual de Orientação do eSocial S-1.3](https://www.gov.br/esocial/pt-br/documentacao-tecnica/manuais/mos-s-1-3-consolidada-ate-a-no-s-1-3-08-2026.pdf).
- O eSocial prevê demonstrativos para diferentes pagamentos, inclusive adiantamento salarial e fechamento da folha: [Manual de Orientação do eSocial S-1.3](https://www.gov.br/esocial/pt-br/documentacao-tecnica/manuais/mos-s-1-3-consolidada-ate-a-no-s-1-3-08-2026.pdf).
- O eSocial permite o envio extemporâneo de admissão e orienta a reabertura das competências afetadas para incluir as remunerações correspondentes: [Perguntas Frequentes — Produção Empresas](https://www.gov.br/esocial/pt-br/empresas/perguntas-frequentes/perguntas-frequentes-producao-empresas-e-ambiente-de-testes/).
- O controle dos ASOs deverá seguir os requisitos aplicáveis da [NR-7 — PCMSO](https://www.gov.br/trabalho-e-emprego/pt-br/acesso-a-informacao/participacao-social/conselhos-e-orgaos-colegiados/comissao-tripartite-partitaria-permanente/arquivos/normas-regulamentadoras/nr-07-atualizada-2022.pdf).

Esta documentação descreve requisitos de produto e não substitui a validação trabalhista, contábil ou jurídica do caso concreto.
