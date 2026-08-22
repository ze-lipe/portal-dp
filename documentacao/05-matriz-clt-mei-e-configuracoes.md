# Matriz de Cadastro e Pagamentos — CLT e MEI

**Status:** rascunho de descoberta — versão 0.1  
**Data:** 10 de agosto de 2026

## 1. Decisão de escopo

O MVP possuirá somente dois tipos de relação:

1. **CLT** — vínculo de emprego e controle da folha oficial;
2. **MEI** — contrato de prestação de serviço genuíno e validado.

A mesma pessoa poderá mudar de MEI para CLT, mas o sistema encerrará uma relação e abrirá outra, preservando documentos e pagamentos de cada período.

## 2. Matriz principal

| Informação ou função | CLT | MEI |
|---|---|---|
| CNPJ da empresa | Empregador | Contratante |
| Data inicial | Admissão/início do vínculo | Início do contrato de serviço |
| Confirmação | Recibo do S-2190/S-2200 | Contrato e validação profissional |
| Data final | Desligamento | Encerramento do contrato |
| Valor principal | Salário contratual oficial | Honorário ou valor contratual |
| Documento financeiro | Holerite/folha | Nota fiscal ou documento aplicável |
| Uma ou duas parcelas | Sim | Sim, quando previsto no contrato |
| Percentuais configuráveis | Sim, totalizando 100% | Sim, totalizando 100% |
| Adiantamento salarial | Sim | Não |
| Pagamento final da folha | Sim | Não |
| Parcela de serviço | Não | Sim |
| Rubricas fixas ou variáveis | Somente oficiais/validadas | Itens previstos no contrato e documento fiscal |
| Horas extras e feriados | Conforme folha oficial | Não como verba salarial |
| Diferença fora da folha | Pendência de regularização | Não se aplica |
| ASO de empregado | Sim | Não pelo mesmo fluxo do empregado |
| Transição para CLT | Não se aplica | Encerra MEI e abre CLT |

## 3. Configuração do CLT

### Cadastro

- CNPJ empregador;
- data real de início informada;
- data de admissão constante no eSocial;
- data de confirmação e recibo;
- cargo e salário contratual oficial;
- data e motivo do desligamento;
- histórico de alterações.

### Forma de pagamento

O usuário autorizado poderá configurar por vínculo ou por política do CNPJ:

- **parcela única:** 100% na etapa de pagamento;
- **duas parcelas:** adiantamento e pagamento final;
- percentual de cada etapa, sempre totalizando 100%;
- regra padrão atual de 40% no adiantamento e saldo no pagamento;
- vigência da configuração;
- datas operacionais da folha;
- forma de pagamento e conta utilizada.

O líquido final recebido do contador prevalece sobre qualquer previsão percentual.

### Rubricas adicionais oficiais

Cada rubrica poderá ser:

- fixa mensal;
- fixa em uma única competência;
- variável;
- destinada somente ao adiantamento;
- destinada somente ao pagamento final;
- dividida entre as etapas por percentuais que somem 100%.

Cada obrigação poderá ter data efetiva própria e ser paga separadamente, desde que esteja refletida oficialmente ou tenha tratamento validado pelo contador. Valores ainda fora da folha permanecem como pendência e não geram programação automática.

## 4. Configuração do MEI

### Cadastro

- CNPJ contratante;
- CPF, CNPJ e dados empresariais do MEI;
- atividade ou ocupação;
- escopo do serviço;
- início e encerramento do contrato;
- contrato e responsável pela validação;
- notas fiscais e demais documentos;
- histórico de pagamentos.

### Forma de pagamento

O contrato poderá definir:

- pagamento único;
- duas parcelas de serviço;
- percentuais de cada parcela, totalizando 100%;
- vencimento por data, período ou entrega;
- valor fixo contratual ou item adicional previsto;
- forma de pagamento;
- nota fiscal vinculada;
- data efetiva e comprovante.

No MEI, a interface usará “honorário”, “valor do serviço” e “parcela contratual”. Não utilizará “salário”, “vale”, “adiantamento salarial”, “hora extra”, “feriado trabalhado” ou “salário por fora”.

## 5. Transição de MEI para CLT

1. Encerrar o contrato MEI na data validada.
2. Manter intactos o contrato, as notas fiscais e os pagamentos de serviço.
3. Abrir a pré-admissão CLT para a mesma pessoa.
4. Confirmar o registro antes do início das atividades como empregado.
5. Criar salário, política de pagamento, folha e ASO apenas no novo vínculo.
6. Exibir os dois períodos em uma linha do tempo, sem misturar valores.

Se houver indícios de que o período MEI já funcionava como relação de emprego, a transição ficará bloqueada para revisão profissional. O sistema não usará a mudança de tipo para reclassificar silenciosamente o passado.

## 6. Restrições obrigatórias

- Não existe tipo “sem registro”.
- Não existe campo operacional “salário por fora”.
- CLT e MEI não compartilham folha, rubricas ou terminologia financeira.
- Um pagamento não pode ser transferido silenciosamente de uma relação para outra.
- Percentuais de parcelas devem totalizar 100%.
- Mudanças têm vigência e preservam o histórico.
- A classificação MEI exige validação registrada.
- O CNPJ é obrigatório em todo vínculo, contrato, documento e pagamento.

## 7. Referências

- Definição geral de empregado, atos que desvirtuem a legislação e contratação autônoma: [CLT consolidada — arts. 3º, 9º e 442-B](https://www.planalto.gov.br/ccivil_03/decreto-lei/del5452compilado.htm).
- Uma pessoa pode possuir MEI e também ter vínculo de emprego, pois uma condição não substitui a outra: [Portal do Empreendedor](https://www.gov.br/empresas-e-negocios/pt-br/empreendedor/perguntas-frequentes/o-que-e-o-microempreendedor-individual-mei/e-possivel-solicitar-a-inscricao).
