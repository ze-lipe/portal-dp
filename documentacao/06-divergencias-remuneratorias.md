# Registro de Divergências Remuneratórias

**Status:** rascunho de descoberta — versão 0.1  
**Data:** 10 de agosto de 2026

## 1. Finalidade

Este módulo preservará o histórico de valores relacionados a um vínculo CLT que já tenham sido pagos ou identificados, mas não estejam refletidos na folha oficial recebida do contador.

Ele permitirá controle financeiro, documental e de conciliação sem funcionar como folha paralela, calculadora ou programador de pagamentos fora da folha.

## 2. Diferença entre registrar e operar

O módulo poderá:

- registrar fatos e pagamentos já ocorridos;
- guardar datas, valores, motivos e comprovantes;
- indicar que uma divergência aparenta ser recorrente;
- somar valores históricos para relatórios restritos;
- encaminhar informações ao contador;
- comparar o histórico com uma folha posteriormente corrigida.

O módulo não poderá:

- calcular valores a pagar;
- sugerir o próximo pagamento;
- criar automaticamente o item no mês seguinte;
- aceitar uma data futura como pagamento realizado;
- programar transferência, PIX ou arquivo bancário;
- somar a divergência ao líquido oficial como obrigação normal;
- encerrar a pendência apenas porque houve pagamento.

## 3. Categorias iniciais

- diferença fixa de remuneração não refletida na folha;
- hora extra não refletida na folha;
- feriado trabalhado não refletido na folha;
- bônus não refletido na folha;
- retirada, adiantamento ou valor sem classificação definida;
- outra divergência, com descrição obrigatória.

“Retirada” ou qualquer categoria genérica permanecerá com situação “aguardando classificação” até validação do contador.

## 4. Dados obrigatórios

- CNPJ;
- vínculo CLT;
- competência;
- categoria da divergência;
- período ou data da ocorrência;
- descrição;
- quantidade informada, quando aplicável;
- valor já pago ou valor identificado;
- data efetiva do pagamento, quando já ocorreu;
- forma de pagamento;
- comprovante;
- origem da informação;
- usuário responsável pelo lançamento;
- data e hora do registro;
- situação perante o contador;
- observações e documentos.

O campo de recorrência servirá apenas para identificar repetição e elevar a prioridade da pendência. Ele não produzirá lançamentos futuros.

## 5. Situações

- ocorrência identificada;
- pagamento histórico registrado;
- aguardando classificação;
- a enviar ao contador;
- enviada ao contador;
- incluída ou retificada na folha oficial;
- conciliada com valor oficial;
- divergência de valor;
- não resolvida.

## 6. Regras de integridade

- Todo registro pertence a um único CNPJ e vínculo.
- A data de um pagamento realizado não pode estar no futuro.
- Um pagamento histórico exige comprovante ou justificativa explícita para sua ausência.
- O valor oficial e o valor histórico permanecem separados.
- A posterior inclusão na folha não apaga o registro anterior.
- Alterações criam versões com usuário, data, motivo e antes/depois.
- Registros não podem ser apagados por usuários comuns.
- O módulo não aparece como parte da folha oficial nem gera um segundo holerite.
- O acesso é restrito e todas as consultas e exportações são auditadas.

## 7. Fluxo

1. Selecionar o CNPJ e o vínculo CLT.
2. Registrar a ocorrência ou um pagamento que já aconteceu.
3. Informar competência, categoria, data, valor e evidência.
4. Marcar possível recorrência apenas para alerta.
5. Encaminhar a informação ao contador ou assessor.
6. Receber a classificação e, quando houver, a folha corrigida.
7. Comparar os valores histórico e oficial.
8. Conciliar ou manter a divergência em aberto.

## 8. Relatórios restritos

- divergências por CNPJ, competência e colaborador;
- valores por categoria;
- casos recorrentes;
- valores sem comprovante;
- valores aguardando classificação;
- divergências enviadas e ainda não corrigidas;
- histórico versus folha oficial;
- tempo de permanência de cada pendência.

Os relatórios não terão função de contas a pagar nem poderão gerar lotes bancários.

## 9. MEI

Este módulo não será usado para MEI. Pagamentos de MEI devem estar vinculados ao contrato de serviço e ao documento fiscal aplicável. Se um pagamento de MEI apresentar características de verba salarial, o cadastro será encaminhado para revisão do enquadramento.

## 10. Referências oficiais

- O eSocial orienta que todas as verbas devidas ao trabalhador, inclusive as sem incidência tributária ou de FGTS, sejam informadas em rubricas próprias: [Manual WEB Geral do eSocial](https://www.gov.br/esocial/pt-br/empresas/manual-web-geral).
- As regras gerais de salário e remuneração estão na [CLT consolidada](https://www.planalto.gov.br/ccivil_03/decreto-lei/del5452compilado.htm).

Este módulo registra a realidade histórica e as pendências de conformidade. Ele não substitui folha, holerite nem análise contábil ou trabalhista.
