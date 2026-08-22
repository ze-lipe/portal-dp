# Regras de Negócio — Prestadores, MEI e Transição para Empregado

**Status:** rascunho de descoberta — versão 0.1  
**Data:** 10 de agosto de 2026

## 1. Finalidade

Este documento define como o sistema poderá controlar prestadores de serviço e MEIs verdadeiramente autônomos e como registrar uma eventual transição posterior para vínculo de emprego.

O módulo não servirá para substituir o registro de empregado por um cadastro de MEI nem para converter uma folha sem registro em pagamentos de fornecedor.

## 2. Princípio central

A categoria será determinada pela realidade da prestação e validada por profissional responsável. Possuir CNPJ, estar formalizado como MEI, emitir nota fiscal ou assinar contrato não transforma automaticamente uma relação de emprego em serviço autônomo.

O sistema manterá três conceitos separados:

- pessoa;
- contrato de prestação de serviço;
- vínculo de emprego.

Uma mesma pessoa poderá ter históricos distintos ao longo do tempo, mas cada período terá sua própria origem, documentos e validação.

## 3. Cadastro do prestador

O cadastro poderá conter:

- CNPJ empregador contratante;
- nome ou razão social do prestador;
- CPF e CNPJ do MEI ou empresa;
- atividade ou ocupação cadastrada;
- escopo e entregáveis do serviço;
- contrato e período de vigência;
- responsável pela contratação;
- valor, condição de cobrança e vencimento;
- notas fiscais;
- pagamentos e comprovantes;
- validação do contador ou assessor;
- situação do contrato;
- documentos de segurança e saúde aplicáveis.

O pagamento será tratado como pagamento de serviço vinculado a contrato e documento fiscal, não como salário.

## 4. Validação antes da ativação

Antes de ativar uma pessoa como prestador, o sistema exigirá uma decisão registrada do contador ou assessor responsável. A análise deverá considerar o trabalho realmente realizado.

Sinais que exigem bloqueio e revisão profissional incluem:

- pagamento tratado internamente como salário;
- adiantamento salarial e saldo mensal;
- horário ou escala definidos pela padaria;
- ordens e supervisão diária semelhantes às dos empregados;
- pagamento de horas extras ou feriados como verba trabalhista;
- execução pessoal e habitual integrada à rotina da empresa;
- uso do MEI apenas porque a pessoa não deseja registro.

O sistema não decidirá sozinho se existe ou não vínculo. Na presença desses sinais, a situação será “enquadramento pendente” e o fluxo normal de prestador ficará bloqueado.

## 5. Situações do prestador

- cadastro em análise;
- enquadramento pendente;
- aprovado como prestador;
- contrato ativo;
- contrato encerrado;
- transição para empregado em preparação;
- convertido em empregado;
- possível vínculo de emprego — revisão necessária.

## 6. Transição legítima para empregado

Quando uma prestação realmente autônoma terminar e começar um vínculo de emprego:

1. encerrar o contrato de prestação na data aplicável;
2. preservar notas fiscais, serviços e pagamentos anteriores;
3. abrir uma pré-admissão para a mesma pessoa;
4. exigir confirmação do registro preliminar ou completo antes do início das atividades como empregado;
5. criar o novo vínculo empregatício no CNPJ correto;
6. iniciar salário, folha, adiantamento, ASO e demais controles somente no vínculo de emprego;
7. exibir a linha do tempo completa sem fundir pagamentos de fornecedor com remuneração salarial.

A transição não altera retroativamente a natureza do período anterior. Se houver indícios de que a pessoa já trabalhava como empregada, o período anterior será enviado para revisão profissional e não será automaticamente aceito como prestação MEI.

## 7. Casos semelhantes aos descritos na descoberta

Uma pessoa que recebe salário mensal, adiantamento de 40%, complemento, horas extras ou feriados e trabalha dentro da rotina dirigida pela padaria não deverá ser simplesmente cadastrada como autônoma por possuir MEI. Esses sinais exigem revisão do enquadramento antes de qualquer cadastro de fornecedor.

## 8. Funcionalidades não permitidas

- Transformar automaticamente trabalhador sem registro em prestador MEI.
- Usar o MEI como período de experiência antes da admissão.
- Calcular folha, salário, adiantamento, horas extras ou feriados dentro do módulo de prestadores.
- Gerar notas fiscais em nome do prestador.
- Alterar retroativamente a classificação para ocultar um vínculo.
- Considerar o CNPJ do MEI como prova suficiente de autonomia.

## 9. Relatórios

- prestadores por CNPJ e situação;
- contratos e notas fiscais pendentes;
- pagamentos de serviço realizados e em aberto;
- contratos próximos do término;
- transições para empregado;
- cadastros bloqueados por necessidade de revisão;
- pessoas que possuem simultaneamente cadastro empresarial e vínculo de emprego, mantendo os períodos separados.

## 10. Referências oficiais

- A definição geral de empregado, a invalidação de atos destinados a fraudar a legislação e a contratação do autônomo estão nos arts. 3º, 9º e 442-B da [CLT consolidada](https://www.planalto.gov.br/ccivil_03/decreto-lei/del5452compilado.htm).
- O Portal do Empreendedor esclarece que uma pessoa pode possuir MEI e, ao mesmo tempo, ter emprego com carteira assinada, demonstrando que o CNPJ não substitui nem impede o vínculo: [Empresas & Negócios](https://www.gov.br/empresas-e-negocios/pt-br/empreendedor/perguntas-frequentes/o-que-e-o-microempreendedor-individual-mei/e-possivel-solicitar-a-inscricao).
- As ocupações permitidas e demais condições do MEI devem ser verificadas na documentação oficial: [Perguntas Frequentes — Empresas & Negócios](https://www.gov.br/empresas-e-negocios/pt-br/empreendedor/perguntas-frequentes).

Este documento descreve requisitos de produto e não substitui a análise trabalhista, tributária ou contratual do caso concreto.
