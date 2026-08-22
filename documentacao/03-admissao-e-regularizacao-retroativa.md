# Regras de Negócio — Admissão e Regularização Retroativa

**Status:** rascunho de descoberta — versão 0.1  
**Data:** 10 de agosto de 2026

## 1. Finalidade

Este documento define como preservar os dados de uma pessoa que começou a trabalhar antes da confirmação do registro e depois passou a constar na folha oficial. O objetivo é manter a continuidade histórica e financeira, sem criar uma folha paralela ou fazer uma estimativa interna parecer um holerite.

O documento não autoriza usar o sistema para manter deliberadamente pessoas trabalhando sem registro. Dados de casos existentes terão finalidade restrita de auditoria, preservação de evidências, conciliação histórica e encaminhamento a profissional responsável.

## 2. Princípio central

Dentro de cada CNPJ, o colaborador terá um único vínculo contínuo. A confirmação posterior do registro não cria outro colaborador, não apaga o período anterior e não reinicia a competência.

O sistema separará claramente:

1. fatos operacionais informados pela empresa;
2. estimativas ou memórias de cálculo fornecidas por profissional responsável;
3. valores oficiais recebidos do contador;
4. pagamentos efetivamente realizados;
5. diferenças ainda não conciliadas.

“Sem registro” não será uma modalidade normal de folha. A situação aparecerá como **registro não confirmado — pendência crítica**, acompanhada até a regularização.

A alegação de que a pessoa prefere não ser registrada não altera o comportamento do produto: ela não poderá ser ativada no fluxo normal de colaboradores e folha sem confirmação da admissão preliminar ou completa.

## 3. Datas do vínculo

O sistema manterá campos diferentes para:

- **data de início do trabalho informada:** primeiro dia em que a pessoa efetivamente trabalhou, conforme informação e evidência disponíveis;
- **data de admissão constante no eSocial:** data que aparece no registro oficial vigente;
- **data de transmissão ou confirmação:** dia em que o evento foi enviado e confirmado;
- **data da última retificação:** quando houver correção posterior;
- **data de desligamento:** quando aplicável.

A data de início do trabalho informada é obrigatória para organizar o período afetado. Se ela não for conhecida, o sistema mostrará “data de início pendente” e não assumirá automaticamente o primeiro dia do mês, a data atual ou qualquer outra data.

## 4. Situações do vínculo e da regularização

O sistema manterá duas situações independentes.

### Situação operacional

1. pré-admissão;
2. trabalhando;
3. afastado;
4. trabalho encerrado;
5. desligado oficialmente.

### Situação de registro e conformidade

1. registro aguardando confirmação;
2. registro não confirmado — pendência crítica;
3. encaminhado ao contador;
4. em regularização;
5. registro confirmado com divergência de datas;
6. registro confirmado — competências anteriores pendentes;
7. retificação ou ajuste solicitado;
8. trabalho encerrado sem registro confirmado — regularização pendente;
9. regularizado e conciliado.

A pessoa pode estar com a situação operacional “trabalho encerrado” e, ao mesmo tempo, com a situação de conformidade “regularização pendente”. A situação “regularizado e conciliado” exige documento ou referência da correção oficial e conciliação financeira. O simples pagamento de um valor ou a saída da pessoa não regulariza o vínculo.

## 5. Caso de regularização

Cada divergência abrirá um caso contendo:

- CNPJ e vínculo;
- data em que a pendência foi identificada;
- datas divergentes e quantidade de dias afetados;
- responsável interno;
- data de envio ao contador;
- orientação e providência solicitada pelo contador;
- prazo e situação;
- documentos, recibos e evidências;
- competências afetadas;
- situação de reabertura, correção e novo fechamento de cada competência afetada;
- motivo e comprovante de encerramento.

Alterações ocorrerão por novas versões. O histórico original não poderá ser apagado.

## 6. Dados do período trabalhado

Para que o período anterior à confirmação não seja perdido, o sistema poderá registrar:

- primeiro e último dia do período afetado;
- dias efetivamente trabalhados;
- horários ou quantidade de horas, quando disponíveis;
- faltas, feriados, horas extras e outras ocorrências;
- salário acordado e sua vigência;
- documentos ou fonte da informação;
- observações e responsável pelo lançamento.

Esse registro não substitui um controle de ponto nem define sozinho o valor oficial da remuneração.

## 7. Estimativa fornecida por profissional

O módulo não calculará salário, folha, líquido, tributos, encargos ou verbas rescisórias de pessoa sem registro.

Dentro de um caso formal de regularização, poderá ser armazenada uma estimativa ou memória de cálculo preparada pelo contador ou assessor trabalhista responsável. O registro deverá conter:

- período considerado;
- base salarial informada;
- documento ou memória de cálculo recebida;
- valor informado;
- nome do responsável profissional;
- data de recebimento;
- situação de validação;
- aviso de que não é holerite nem folha oficial.

Sem documento ou responsável profissional, o sistema armazenará somente fatos históricos, dias, ocorrências, documentos e pagamentos já realizados, sem produzir valores calculados ou programar pagamentos.

## 8. Competência com registro no meio do mês

A competência terá uma única linha principal para o colaborador e poderá mostrar segmentos informativos, por exemplo:

- período trabalhado antes da confirmação do registro;
- período já coberto pelo registro recebido;
- estimativa profissional do período, quando existente;
- valor oficial do contador;
- pagamentos realizados;
- diferença a conciliar.

Esses segmentos servem para explicar a linha do tempo, não para criar dois vínculos ou duas folhas independentes.

Se o contador retificar a admissão e emitir nova folha contemplando todo o período, a nova versão passa a ser oficial. A estimativa anterior permanece no histórico como “substituída e conciliada”. Se a folha ainda não contemplar o período, a competência permanece pendente.

### 8.1 Trabalho encerrado antes da confirmação do registro

Se a pessoa começar a trabalhar e sair antes da confirmação do registro, o sistema deverá:

- manter uma única ficha no CNPJ;
- registrar o primeiro e o último dia efetivamente trabalhados;
- registrar o motivo da saída conforme informação recebida, sem calcular automaticamente a classificação ou as verbas rescisórias;
- mudar a situação operacional para “trabalho encerrado”;
- manter a situação de conformidade como “regularização pendente”;
- identificar todas as competências alcançadas;
- preservar dias, horas, ocorrências, salário acordado, estimativas profissionais e documentos;
- registrar pagamentos efetuados e o saldo ainda não conciliado;
- encaminhar ao contador os dados necessários para o tratamento oficial da admissão, remuneração e desligamento;
- vincular posteriormente os recibos, eventos e valores oficiais à mesma ficha, sem criar novo vínculo;
- manter o caso nos relatórios de pendências mesmo que a pessoa não apareça mais entre os colaboradores ativos.

Se o vínculo tiver atravessado mais de uma competência, cada mês será acompanhado separadamente. A competência do encerramento também deverá guardar os valores oficiais de desligamento recebidos do contador.

## 9. Pagamentos anteriores à regularização

Uma saída financeira já realizada antes do recebimento da folha corrigida poderá ser registrada retrospectivamente para preservar o histórico do caixa e as evidências, com:

- vínculo e CNPJ;
- competência e período de referência;
- data e valor;
- forma de pagamento;
- comprovante;
- origem da informação;
- situação “pagamento a conciliar”.

Depois que o contador fornecer as verbas oficiais, o pagamento será alocado a elas. A alocação não apagará a situação anterior nem alterará retroativamente o comprovante.

Essa função não agenda, recomenda ou executa pagamentos futuros para trabalho sem registro.

## 10. Fluxo de regularização

1. Registrar a data real de início informada e as evidências disponíveis.
2. Abrir automaticamente uma pendência crítica quando não houver confirmação do registro.
3. Registrar dias, horas e ocorrências do período afetado.
4. Se o trabalho terminar, registrar o último dia e encerrar apenas a situação operacional.
5. Encaminhar os dados ao contador.
6. Anexar, quando existente, uma estimativa ou memória de cálculo recebida do profissional responsável.
7. Registrar pagamentos anteriores como valores a conciliar.
8. Receber a confirmação de admissão, desligamento e os valores oficiais corrigidos, conforme o caso.
9. Listar todas as competências alcançadas pelo início retroativo.
10. Acompanhar em cada competência: reabertura pendente, remuneração incluída ou retificada, novo fechamento e nova apuração conferida.
11. Importar a nova versão oficial e comparar com a estimativa recebida e os pagamentos.
12. Alocar os pagamentos às verbas oficiais e resolver diferenças.
13. Encerrar o caso somente com comprovação e conciliação completas.

## 11. Regras de integridade

- Um colaborador não pode ser duplicado quando o registro for confirmado.
- O CNPJ do vínculo e dos registros financeiros é obrigatório e imutável.
- A data de início informada nunca é apagada por uma data oficial posterior.
- Valores estimados por profissional, oficiais e pagos permanecem em campos e versões separados.
- O sistema não gera holerite para estimativas ou registros históricos.
- O sistema não marca uma folha como regular apenas porque houve pagamento.
- Correções exigem motivo, usuário, data e valores anteriores e posteriores.
- Competências afetadas permanecem sinalizadas até a conciliação.
- Acesso e exportação seguem as permissões do CNPJ ativo.

## 12. Prevenção de novos casos

O sistema permitirá cadastrar uma pré-admissão e reunir documentos antes do primeiro dia. A ativação normal do vínculo deverá exigir confirmação do registro preliminar ou completo. Sem essa confirmação, o sistema não abrirá folha normal, não calculará salário e não programará pagamento. Se for informado que a pessoa já começou a trabalhar, será criado somente um caso restrito de pendência crítica, com orientação para encaminhamento profissional.

## 13. Funcionalidades não permitidas

- Manter uma lista operacional de pessoas trabalhando sem registro como se fosse uma categoria contratual.
- Calcular mensalmente salário líquido ou “folha sem holerite” para essas pessoas.
- Programar pagamentos recorrentes com base nessa condição.
- Usar a declaração de recusa da pessoa como dispensa de registro.
- Marcar o caso como regular apenas porque a pessoa recebeu ou deixou a empresa.
- Importar a planilha atual com a finalidade de continuar automaticamente o mesmo processo.

A planilha existente poderá ser importada futuramente apenas para formar um arquivo histórico restrito, identificar valores e competências e preparar um dossiê para análise profissional.

## 14. Referências oficiais

- O Ministério do Trabalho e Emprego orienta o envio da admissão ao eSocial antes do início das atividades: [Perguntas Frequentes do MTE](https://www.gov.br/trabalho-e-emprego/pt-br/acesso-a-informacao/perguntas-frequentes).
- Desde 2 de janeiro de 2026, o registro e as anotações da CTPS Digital são realizados exclusivamente por meio do eSocial: [Portaria Consolidada MTE nº 1/2025](https://www.gov.br/trabalho-e-emprego/pt-br/assuntos/legislacao/portarias-1/portarias-vigentes-3/PDFPortariaMTEConsolidadan1de17dedezembrode2025compiladaem20.01.2026.pdf).
- O eSocial permite o envio extemporâneo da admissão e orienta a reabertura das folhas afetadas para informar a remuneração do período: [Perguntas Frequentes — Produção Empresas](https://www.gov.br/esocial/pt-br/empresas/perguntas-frequentes/perguntas-frequentes-producao-empresas-e-ambiente-de-testes/).
- O desligamento e suas verbas são informados pelo evento S-2299, dentro de um vínculo previamente cadastrado: [Manual WEB Geral do eSocial](https://www.gov.br/esocial/pt-br/empresas/manual-web-geral).
- O processamento dos eventos extemporâneos e seus efeitos sobre competências fechadas estão descritos no [Manual de Orientação do eSocial S-1.3](https://www.gov.br/esocial/pt-br/documentacao-tecnica/manuais/mos-s-1-3-consolidada-ate-a-no-s-1-3-08-2026.pdf).
- A obrigatoriedade do registro e as consequências da manutenção de empregado não registrado constam dos arts. 41 e 47 da [CLT consolidada](https://www.planalto.gov.br/ccivil_03/decreto-lei/del5452compilado.htm).

Este documento define requisitos do produto e não substitui a validação do procedimento concreto pelo contador ou pela assessoria trabalhista responsável.
