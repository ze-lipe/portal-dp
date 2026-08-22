# Documento 22D

## Caderno Executável dos 25 Cenários Compostos Obrigatórios

> **Status:** aprovado integralmente pelo usuário com o Documento 22 em 22 de agosto de 2026.  
> **Data-base:** 22 de agosto de 2026.  
> **Autoridade funcional:** Documento Mestre, seção 36; Documentos 17 a 21A aprovados.  
> **Estratégia e casos proprietários:** Documentos 22, 22A, 22B e 22C.  
> **Contagem:** 25 cenários compostos, adicionais às 440 âncoras funcionais.

---

# 1. Finalidade

Este anexo materializa, sem deixar decisões para o código, os 25 cenários exigidos pelo Documento Mestre. Cada cenário possui entradas sintéticas, memória/oráculo, recibos esperados e estados finais. Ele não substitui os casos-raiz do Documento 22A: combina-os em jornadas de negócio capazes de revelar dupla contagem, corte incorreto, documento indevido ou estado incoerente.

---

# 2. Premissas comuns

- empresa `EMP-A`, fuso `America/Sao_Paulo` e dados exclusivamente sintéticos;
- percentual padrão de adiantamento de 40%; data prevista do adiantamento no dia 20; pagamento final previsto no dia 5 do mês seguinte;
- D30 inclusivo, divisor fixo 30 e memória por segmento mensal;
- cálculo decimal de maior precisão, persistência em duas casas e arredondamento monetário normal apenas na fronteira aprovada; a parcela final absorve eventual centavo residual;
- confirmação integral e independente por participante, grupo e evento;
- oficial, RA/reembolso, complementos, PSR, contrato MEI, rescisão oficial, acerto de RA e ajuste positivo nunca se confirmam ou se compensam implicitamente;
- recibo definitivo somente depois do pagamento; oficial e rescisão oficial nunca geram recibo interno;
- K06 e rescisão oficial são entradas autoritativas do contador e não são recalculados;
- salário redondo fica desmarcado e reembolso vale zero, salvo indicação expressa;
- grupos não mencionados estão resolvidos pela massa-base, sem esconder pendência necessária ao fechamento;
- relógio, datas efetivas, sequência anual de recibos, fixture e versão do cálculo são congelados na execução.

---

# 3. Cenários executáveis

### CEN-CMP-001 — Início dia 1 e admissão dia 15

**Entradas:** competência 09/2026; início 01/09; admissão 15/09; base PSR confirmada R$ 2.000,00, excluindo a RA; salário-base oficial R$ 2.000,00; RA R$ 1.000,00; todos os grupos internos divididos em 40%/60%; K06 R$ 640,00, já líquido do adiantamento oficial.

**Memória/oráculo:** PSR de 01 a 14, D30 = 14: `2.000 ÷ 30 × 14 = 933,33`, adiantamento R$ 373,33 e final R$ 560,00. Base oficial de 15 a 30, D30 = 16: R$ 1.066,67 e adiantamento oficial R$ 426,67. O oficial final é exatamente K06 = R$ 640,00, sem nova dedução de R$ 426,67. RA começa em 01/09: total R$ 1.000,00, adiantamento R$ 400,00 e final R$ 600,00. Após a admissão, o total acordado somente leitura é R$ 3.000,00; PSR não entra nele.

**Recibos esperados:** RA de R$ 400,00 e R$ 600,00; PSR de R$ 373,33 e R$ 560,00; nenhum recibo oficial.

**Estados finais:** base PSR encerrada em 14/09; vínculo formal ativo; todos os grupos pagos individualmente; competência fechada.

### CEN-CMP-002 — Início dia 1 e admissão dia 20

**Entradas:** competência 09/2026; início 01/09; admissão 20/09; base PSR R$ 2.000,00, excluindo RA; salário-base R$ 2.000,00; RA R$ 1.000,00; 40%/60%; K06 R$ 733,33.

**Memória/oráculo:** PSR de 01 a 19, D30 = 19: R$ 1.266,67, adiantamento R$ 506,67 e final R$ 760,00. Base oficial de 20 a 30, D30 = 11: R$ 733,33; como a admissão ocorreu depois do dia 15, adiantamento oficial = R$ 0,00 e o final é exatamente K06. A RA usa o início das atividades, totaliza R$ 1.000,00 e permanece em R$ 400,00/R$ 600,00.

**Recibos esperados:** dois recibos de RA e dois de PSR; nenhum oficial.

**Estados finais:** adiantamento oficial não aplicável; PSR encerrado em 19/09; demais grupos pagos; competência fechada.

### CEN-CMP-003 — Fronteira inclusiva dos dias 15 e 16

**Entradas:** competência 09/2026. Empregados `E15` e `E16` iniciam e são admitidos nos dias 15 e 16, com salário-base R$ 3.000,00 e, sem outros descontos, K06 de R$ 960,00 e R$ 1.500,00. Vínculos sem registro `U15/U16` possuem base PSR R$ 2.000,00, RA R$ 900,00 e complemento R$ 300,00. MEIs `M15/M16` possuem contrato mensal R$ 3.000,00. Todos usam 40%/60%.

**Memória/oráculo:** no dia 15, D30 até o fim = 16 e existe adiantamento: oficial e MEI têm base R$ 1.600,00 e adiantamento R$ 640,00; RA tem total R$ 480,00 e adiantamento R$ 192,00; PSR total R$ 1.066,67 e adiantamento R$ 426,67; complemento é integral R$ 300,00 e adiantamento R$ 120,00. No dia 16, D30 = 15 e não existe adiantamento inicial: oficial/MEI R$ 1.500,00, RA R$ 450,00, PSR R$ 1.000,00 e complemento integral R$ 300,00 seguem ao final. Nenhuma verba desaparece e complemento não é proporcionalizado.

**Recibos esperados:** nenhum oficial. Dia 15: RA R$ 192,00/R$ 288,00; PSR R$ 426,67/R$ 640,00; complemento R$ 120,00/R$ 180,00; MEI R$ 640,00/R$ 960,00. Dia 16: somente finais de RA R$ 450,00, PSR R$ 1.000,00, complemento R$ 300,00 e MEI R$ 1.500,00.

**Estados finais:** casos do dia 15 com adiantamento e final pagos; casos do dia 16 com adiantamento não aplicável e final pago.

### CEN-CMP-004 — Fevereiro comum e composição numérica do pagamento final

**Entradas:** fevereiro/2026, 28 dias; empregado mensalista ativo o mês inteiro; salário redondo marcado; salário-base R$ 3.000,00; adiantamento oficial pago R$ 1.200,00; K06 informado R$ 1.800,00; RA R$ 900,00 em 40%/60%; complemento R$ 300,00 em 40%/60%; reembolso confirmado como zero no adiantamento e reembolso manual de IR R$ 50,00 somente no final.

**Memória/oráculo:** D30 do mês completo = 30. RA: R$ 360,00 no adiantamento e R$ 540,00 no final. Complemento: R$ 120,00 e R$ 180,00. Grupo RA/reembolso final = `540 + 50 = 590`. **Pagamento oficial = R$ 1.800,00**: o K06 já contém o desconto do adiantamento e o sistema **não subtrai novamente** R$ 1.200,00. Total operacional final, sem fundir confirmações: `R$ 1.800,00 + R$ 590,00 + R$ 180,00 = R$ 2.570,00`.

**Recibos esperados:** adiantamento RA R$ 360,00; adiantamento de complemento R$ 120,00; final RA/reembolso R$ 590,00; final de complemento R$ 180,00; nenhum recibo dos R$ 1.800,00 oficiais.

**Estados finais:** seis confirmações independentes preservadas — oficial, RA/reembolso e complemento em cada evento; todos os grupos pagos; competência fechada sem dupla dedução.

### CEN-CMP-005 — Fevereiro bissexto com 29 dias

**Entradas:** MEI ativo de 01/02/2028 a 29/02/2028; valor mensal R$ 3.000,00; 40%/60%.

**Memória/oráculo:** D30 = 30, base R$ 3.000,00, adiantamento R$ 1.200,00 e final R$ 1.800,00. O dia adicional do calendário não altera a mensalidade.

**Recibos esperados:** MEI adiantamento R$ 1.200,00 e MEI final R$ 1.800,00.

**Estados finais:** grupos pagos; competência fechada; contrato segue sua vigência.

### CEN-CMP-006 — Mês com 31 dias

**Entradas:** MEI ativo de 01/01/2026 a 31/01/2026; valor mensal R$ 3.000,00; 40%/60%.

**Memória/oráculo:** D30 = 30, nunca 31; base R$ 3.000,00, adiantamento R$ 1.200,00 e final R$ 1.800,00. O dia 31 não cria pagamento adicional.

**Recibos esperados:** dois recibos MEI, um por evento.

**Estados finais:** grupos pagos; competência fechada.

### CEN-CMP-007 — Início e saída no mesmo dia

**Entradas:** vínculo sem registro; início e desligamento sem registro em 14/09/2026; base PSR R$ 2.000,00; RA R$ 1.000,00; saída anterior ao adiantamento.

**Memória/oráculo:** D30 unitário = 1. PSR = R$ 66,67 e RA proporcional = R$ 33,33. Adiantamentos não pagos são cancelados. Não existe salário oficial, rescisão oficial ou ASO demissional.

**Recibos esperados:** PSR final R$ 66,67 e acerto complementar de RA R$ 33,33.

**Estados finais:** vínculo inativo em 15/09; financeiro quitado após os dois pagamentos; nenhuma segunda proporcionalidade.

### CEN-CMP-008 — Período sem registro atravessando competências

**Entradas:** início 20/01/2026; admissão 10/03/2026; base PSR R$ 2.000,00; pagamento 100% no final; RA zero para isolar o PSR.

**Memória/oráculo:** janeiro, 20 a 31: D30 = 11 e PSR R$ 733,33. Fevereiro inteiro: D30 = 30 e PSR R$ 2.000,00. Março, 01 a 09: D30 = 9 e PSR R$ 600,00. Total informativo = R$ 3.333,33, preservando três linhas independentes; a admissão encerra o PSR no dia anterior e não altera linhas pagas anteriores.

**Recibos esperados:** um recibo PSR final por competência: R$ 733,33, R$ 2.000,00 e R$ 600,00.

**Estados finais:** três linhas pagas e imutáveis; PSR encerrado em 09/03; vínculo formal ativo.

### CEN-CMP-009 — RA alterada antes do adiantamento

**Entradas:** competência intermediária; RA R$ 900,00 alterada para R$ 1.200,00 antes de pagamento; 40%/60%.

**Memória/oráculo:** a nova versão vale para toda a competência. O cálculo não pago R$ 360,00/R$ 540,00 é substituído por adiantamento R$ 480,00 e final R$ 720,00. Não existe média nem ajuste F04.

**Recibos esperados:** RA de R$ 480,00 e R$ 720,00.

**Estados finais:** versão R$ 1.200,00 vigente; versão anterior histórica; eventos pagos; competência fechada.

### CEN-CMP-010 — RA corrigida depois do adiantamento pago

**Entradas:** RA original R$ 900,00; adiantamento R$ 360,00 já pago; correção autorizada da competência para R$ 1.200,00; final ainda aberto; justificativa registrada.

**Memória/oráculo:** novo total devido R$ 1.200,00 menos R$ 360,00 efetivamente pagos da mesma RA resulta em **saldo final R$ 840,00**. Não há pagamento negativo, compensação com outro grupo ou ajuste separado enquanto o final está aberto. O recibo de R$ 360,00 permanece como fato pago.

**Recibos esperados:** recibo RA do adiantamento R$ 360,00 preservado e recibo RA final R$ 840,00.

**Estados finais:** correção auditada; total efetivo R$ 1.200,00; adiantamento e final pagos; nenhuma duplicação.

### CEN-CMP-011 — Complemento criado depois do adiantamento

**Entradas:** adiantamento já pago; final aberto; complemento avulso “Serviço extraordinário” R$ 500,00 criado na competência.

**Memória/oráculo:** o complemento não reabre o adiantamento, não é proporcional e segue integralmente ao final. Não altera salário-base, RA, total acordado ou PSR.

**Recibos esperados:** somente recibo de complementos do final, R$ 500,00.

**Estados finais:** complemento pago no final; adiantamento anterior preservado; competência apta a fechar.

### CEN-CMP-012 — Desligamento antes da data do adiantamento

**Entradas:** empregado formal de competência anterior; saída 10/09/2026; adiantamento previsto 20/09 ainda não pago; RA R$ 900,00; complemento R$ 200,00; rescisão oficial R$ 1.700,00.

**Memória/oráculo:** RA proporcional = `900 ÷ 30 × 10 = 300`, destinada ao acerto. Complemento permanece integral R$ 200,00 e migra ao final. Oficial segue exclusivamente a rescisão informada. Adiantamentos são cancelados sem criar recibo.

**Recibos esperados:** complemento final R$ 200,00 e acerto RA R$ 300,00; nenhum recibo da rescisão.

**Estados finais:** adiantamentos cancelados por desligamento; rescisão e acerto pagos separadamente; vínculo inativo em 11/09.

### CEN-CMP-013 — Desligamento na data do adiantamento antes da confirmação

**Entradas:** saída 20/09/2026; adiantamento previsto para o mesmo dia, ainda não confirmado; RA R$ 900,00; complemento R$ 200,00; rescisão oficial R$ 2.000,00.

**Memória/oráculo:** data prevista não prova pagamento. RA proporcional = R$ 600,00; adiantamentos são cancelados; complemento R$ 200,00 segue ao final; rescisão permanece separada.

**Recibos esperados:** complemento final R$ 200,00 e acerto RA R$ 600,00; nenhum recibo de adiantamento ou oficial.

**Estados finais:** adiantamentos cancelados; financeiro quitado após os eventos finais; vínculo inativo em 21/09.

### CEN-CMP-014 — Desligamento depois do adiantamento pago

**Entradas:** saída 25/09/2026; RA R$ 900,00 com R$ 360,00 pagos; complemento R$ 200,00 com R$ 80,00 pagos; adiantamento oficial também pago; rescisão oficial R$ 3.000,00.

**Memória/oráculo:** RA proporcional = R$ 750,00 e saldo do acerto = `máximo(0, 750 − 360) = 390`. Complemento final = `200 − 80 = 120`. Oficial e complemento não reduzem o acerto de RA. A rescisão substitui K06 mensal.

**Recibos esperados:** RA adiantamento R$ 360,00; complemento adiantamento R$ 80,00; complemento final R$ 120,00; acerto RA R$ 390,00; nenhum recibo oficial.

**Estados finais:** pagamentos históricos preservados; rescisão e acerto quitados separadamente; competência final resolvida.

### CEN-CMP-015 — Desligamento na primeira competência

**Entradas:** início 05/09; admissão 10/09; saída 25/09; desligamento informado em 25/09, depois das confirmações de 20/09; salário-base R$ 3.000,00; base PSR R$ 3.000,00; RA R$ 900,00; complemento R$ 200,00; 40%/60%; adiantamentos pagos no dia 20; rescisão oficial autoritativa R$ 2.500,00.

**Memória/oráculo:** PSR 05 a 09, D30 = 5: R$ 500,00, com R$ 200,00/R$ 300,00. Base oficial projetada desde 10/09 tem D30 = 21 e adiantamento R$ 840,00, mas o final é substituído pela rescisão do contador. Como a saída só foi informada depois do adiantamento, a RA projetada em 20/09 para 05 a 30 era R$ 780,00, dos quais R$ 312,00 foram pagos; RA devida até a saída, 05 a 25, D30 = 21, é R$ 630,00; acerto = R$ 318,00. Complemento continua integral R$ 80,00/R$ 120,00. A rescisão R$ 2.500,00 tem confirmação própria e não entra no acerto. Não existe RA mensal integral paralela.

**Recibos esperados:** PSR R$ 200,00 e R$ 300,00; RA adiantamento R$ 312,00; complemento R$ 80,00 e R$ 120,00; acerto RA R$ 318,00; nenhum recibo da rescisão oficial R$ 2.500,00.

**Estados finais:** primeira e última competência coincidem; financeiro quitado sem dupla proporcionalidade; vínculo inativo em 26/09.

### CEN-CMP-016 — Rescisão oficial e acerto de RA separados

**Entradas:** saída 30/09; RA vigente R$ 1.200,00; RA paga no adiantamento R$ 480,00; rescisão oficial R$ 5.000,00; aviso indenizado 12 dias; 6/12 de 13º; 6/12 de férias; férias vencidas confirmadas.

**Memória/oráculo:** saldo RA R$ 720,00; aviso R$ 480,00; 13º R$ 600,00; férias proporcionais R$ 600,00 e terço R$ 200,00; férias vencidas R$ 1.200,00 e terço R$ 400,00, sem dobra. Acerto total = R$ 4.200,00. Salário-base, complemento, PSR, reembolso e rescisão oficial não entram no cálculo.

**Recibos esperados:** recibo RA/reembolso do adiantamento R$ 480,00 preservado; um recibo próprio do acerto RA R$ 4.200,00; nenhum dos R$ 5.000,00 da rescisão.

**Estados finais:** rescisão oficial e acerto RA pagos com confirmações e datas independentes; financeiro quitado.

### CEN-CMP-017 — Recibo pago, cancelado e substituído

**Entradas:** salário redondo marcado para o evento de adiantamento; grupo RA/reembolso pago por R$ 450,00, sendo RA R$ 400,00 e reembolso manual R$ 50,00. Correção F04 altera o reembolso real para R$ 80,00. `N` é o próximo número congelado da sequência anual.

**Memória/oráculo:** novo devido R$ 480,00; valor efetivamente pago R$ 450,00; ajuste positivo R$ 30,00. O pagamento original não é apagado. Original `N`, substituto `N+1` e ajuste `N+2`; nenhum número é reutilizado.

**Recibos esperados:** durante F04, `N` fica `Cancelado` e consultável enquanto a substituição ainda não foi emitida. Depois da emissão de `N+1`, o estado final de `N` passa a `Substituído`, com snapshot e hash originais preservados; `N+1` fica `Substituto vigente` e declara os R$ 450,00 efetivamente pagos; `N+2` documenta o ajuste definitivo de R$ 30,00 depois de confirmado. Cada versão conserva número, snapshot, hash, motivo, autor e datas próprios.

**Estados finais:** `N` substituído e consultável; `N+1` substituto vigente; `N+2` ajuste definitivo pago; cadeia completa, imutável e sem reutilização de número.

### CEN-CMP-018 — MEI iniciando e encerrando no mesmo mês

**Entradas:** contrato MEI com vigência prevista de 10/09 a 20/09/2026; valor mensal R$ 3.000,00; serviço adicional R$ 200,00; 40%/60%; adiantamento previsto em 20/09 ainda não pago quando o encerramento é apurado.

**Memória/oráculo:** há um único intervalo, D30 = 11; base proporcional = R$ 1.100,00. Como o contrato encerra na data prevista do adiantamento e ele ainda não foi pago, o grupo de adiantamento tem valor devido zero e fica `Não aplicável`; toda a base segue ao final. Pagamento final = base R$ 1.100,00 + serviço adicional integral R$ 200,00 = R$ 1.300,00. Serviço adicional não integra a base do adiantamento. Encerramento contratual MEI não usa o estado trabalhista `Cancelado por desligamento`.

**Recibos esperados:** nenhum recibo de adiantamento; recibo MEI final R$ 1.300,00, detalhando base R$ 1.100,00 e serviço R$ 200,00.

**Estados finais:** contrato ativo até o fim de 20/09 e encerrado a partir de 21/09; adiantamento não aplicável; final pago; competência fechada.

### CEN-CMP-019 — Renovação contínua sem alteração

**Entradas:** contrato MEI até 31/12/2026, R$ 3.000,00 e 40%/60%; renovação programada para começar em 01/01/2027 com as mesmas condições.

**Memória/oráculo:** a nova vigência começa no dia seguinte, sem lacuna, sobreposição, novo cadastro ou inativação. O corte do dia 15 não reaplica. Janeiro/2027 usa base integral R$ 3.000,00, adiantamento R$ 1.200,00 e final R$ 1.800,00.

**Recibos esperados:** MEI adiantamento R$ 1.200,00 e final R$ 1.800,00.

**Estados finais:** mesmo contrato contínuo ativo; vigência anterior histórica; renovação efetivada.

### CEN-CMP-020 — Renovação contínua com mudança de valor no meio do mês

**Entradas:** contrato contínuo; valor R$ 3.000,00 de 01 a 15/09 e R$ 3.600,00 de 16 a 30/09; mudança programada antes do adiantamento; 40%/60%.

**Memória/oráculo:** segmento antigo: `3.000 ÷ 30 × 15 = 1.500`; novo: `3.600 ÷ 30 × 15 = 1.800`; total R$ 3.300,00. Adiantamento R$ 1.320,00 e final R$ 1.980,00. A vigência iniciada no dia 16 não reaplica o corte porque não houve interrupção.

**Recibos esperados:** MEI adiantamento R$ 1.320,00 e final R$ 1.980,00, com as duas vigências na memória.

**Estados finais:** contrato contínuo ativo; duas vigências adjacentes e não sobrepostas; pagamentos quitados.

### CEN-CMP-021 — Serviço adicional MEI depois do pagamento final

**Entradas:** base MEI R$ 3.000,00; adiantamento R$ 1.200,00 e final R$ 1.800,00 já pagos; depois, serviço adicional “Instalação extra” R$ 500,00.

**Memória/oráculo:** o serviço é integral, avulso, somente da competência e não altera o adiantamento. Como o final já foi pago, surge ajuste positivo R$ 500,00; documentos e pagamentos anteriores permanecem imutáveis.

**Recibos esperados:** recibos MEI originais preservados e novo recibo de ajuste positivo R$ 500,00 após confirmação.

**Estados finais:** ajuste pago; competência fechada; nenhuma recorrência criada.

### CEN-CMP-022 — Campo oculto no painel, histórico e Excel

**Entradas:** perfil empresarial sem visualização de salário-base e RA; empregado possui salário-base R$ 3.000,00 e RA R$ 900,00; execução proprietária de `TST-API-005`, de suas projeções `::FLD` e `::DOC` e dos canais de busca, lista, ordenação, filtros, totais, detalhe, histórico, mensagens de erro, notificações, Excel e download.

**Memória/oráculo:** todos os canais omitem completamente nomes de campos, valores e qualquer derivação reveladora; ocultação significa ausência, e não máscara, zero, nulo ou coluna vazia. A API não envia o valor integral ao navegador. Busca, lista, ordenação, filtros, totais, detalhe, histórico, erros, notificações, Excel e download permanecem coerentes com a mesma permissão. Tentativa direta não amplia o acesso; usuário autorizado continua vendo os campos.

**Recibos esperados:** nenhum.

**Estados finais:** dados e pagamentos inalterados; omissão/negação auditável; zero vazamento.

### CEN-CMP-023 — Tentativa de acesso cruzado entre empresas

**Entradas:** usuário autorizado somente na `EMP-A` tenta consultar, alterar, exportar e baixar colaborador, competência, recibo e ASO da `EMP-B`; a mesma bateria é executada primeiro com um ID real conhecido de B e depois com um ID sintaticamente válido inexistente.

**Memória/oráculo:** para consulta, alteração, exportação e download, o ID real de B e o inexistente produzem exatamente o mesmo status, código de erro, corpo e cabeçalhos observáveis, além de cumprir o ensaio de indistinguibilidade temporal do Documento 22 §13.1. Nenhuma resposta confirma existência. Há zero linhas, totais, arquivos ou metadados de B; a RLS produz zero efeito de leitura e escrita; nenhuma mutação, confirmação, tarefa, recibo ou exportação é criada. Evento de segurança não copia conteúdo sensível.

**Recibos esperados:** nenhum.

**Estados finais:** contexto continua `EMP-A`; dados das duas empresas intactos; tentativa negada e correlacionada.

### CEN-CMP-024 — ASO demissional com não comparecimento

**Entradas:** demissão formal em 30/09/2026; acompanhamento demissional criado, marcado como agendado e depois como não compareceu.

**Memória/oráculo:** não comparecimento não cria exame, resultado, aptidão, vencimento ou dispensa. A pendência não desaparece com o tempo; pode ser reagendada ou encerrada sem realização somente com permissão e justificativa. Não bloqueia quitação financeira e não produz alerta de vencimento futuro.

**Recibos esperados:** nenhum decorrente do ASO.

**Estados finais:** acompanhamento `Não compareceu`; pendência demissional permanece até realização ou encerramento autorizado; vínculo inativo e financeiro independente.

### CEN-CMP-025 — Retificação de ASO e alerta apenas pela versão vigente

**Entradas:** periódico vigente com vencimento 30/09/2026; relógio em 01/09/2026. Em 05/09, retificação altera o vencimento para 31/12/2026.

**Memória/oráculo:** em 01/09 existe uma ocorrência de vencimento. A retificação cria nova versão e resolve a ocorrência baseada em 30/09; a histórica não gera alerta. Em 01/12, 30 dias antes de 31/12, surge exatamente uma nova ocorrência. Repetição não duplica notificação e resultado clínico não aparece nela.

**Recibos esperados:** nenhum.

**Estados finais:** nova versão vigente; anterior histórica; somente a ocorrência da versão vigente permanece ativa.

---

# 4. Rastreabilidade executável dos cenários

Cada cenário tem proprietários nominais na baseline funcional ou técnica. A etapa indica quando a jornada composta fica executável; o gate e as evidências abaixo são o mínimo, sem substituir exigências adicionais dos casos proprietários.

| Cenário | TST/QAT proprietários | ETP | Gate | Evidência mínima |
|---|---|---|---|---|
| CEN-CMP-001 | TST-B04-VIN-07/TST-B06-PSR-06/TST-G08-03 | ETP-07 | GAT-06/07 | EV-CALC/EV-BD/EV-AUD |
| CEN-CMP-002 | TST-B04-VIN-07/TST-B06-PSR-08/TST-G08-03 | ETP-07 | GAT-06/07 | EV-CALC/EV-BD/EV-AUD |
| CEN-CMP-003 | TST-B06-PSR-08/TST-B05-CON-01/TST-G08-03 | ETP-07 | GAT-06/07 | EV-CALC/EV-BD/EV-AUD |
| CEN-CMP-004 | TST-G08-03/TST-P09-01/TST-R11-02 | ETP-07 | GAT-06/07 | EV-CALC/EV-BD/EV-ARQ |
| CEN-CMP-005 | TST-B05-CON-01/TST-G08-03/TST-R11-02 | ETP-06 | GAT-06/07 | EV-CALC/EV-BD/EV-ARQ |
| CEN-CMP-006 | TST-B05-CON-01/TST-G08-03/TST-R11-02 | ETP-06 | GAT-06/07 | EV-CALC/EV-BD/EV-ARQ |
| CEN-CMP-007 | TST-D12-23/TST-D12-20 | ETP-09 | GAT-06/07/08 | EV-CALC/EV-BD/EV-AUD |
| CEN-CMP-008 | TST-B06-PSR-02/TST-B06-PSR-06 | ETP-07 | GAT-06/07 | EV-CALC/EV-BD/EV-AUD |
| CEN-CMP-009 | TST-B06-RA-02/TST-G08-06 | ETP-05 | GAT-06 | EV-CALC/EV-BD/EV-AUD |
| CEN-CMP-010 | TST-B06-RA-03/TST-G08-11 | ETP-07 | GAT-06/07 | EV-CALC/EV-BD/EV-AUD |
| CEN-CMP-011 | TST-B06-CMP-05/TST-G08-15 | ETP-07 | GAT-06/07 | EV-CALC/EV-BD/EV-AUD |
| CEN-CMP-012 | TST-D12-09/TST-D12-20/TST-G08-09 | ETP-09 | GAT-06/07/08 | EV-CALC/EV-BD/EV-AUD |
| CEN-CMP-013 | TST-D12-09/TST-D12-20/TST-G08-09 | ETP-09 | GAT-06/07/08 | EV-CALC/EV-BD/EV-AUD |
| CEN-CMP-014 | TST-D12-14/TST-D12-20 | ETP-09 | GAT-06/07/08 | EV-CALC/EV-BD/EV-AUD |
| CEN-CMP-015 | TST-D12-14/TST-D12-20/TST-B06-PSR-06 | ETP-09 | GAT-06/07/08 | EV-CALC/EV-BD/EV-AUD |
| CEN-CMP-016 | TST-D12-18/TST-D12-20/TST-D12-22/TST-R11-02 | ETP-09 | GAT-06/07/08 | EV-CALC/EV-BD/EV-ARQ |
| CEN-CMP-017 | TST-G08-12/TST-R11-04/TST-R11-05/TST-C10-08/TST-P10-01/TST-P10-02 | ETP-07 | GAT-06/07 | EV-CALC/EV-BD/EV-AUD/EV-ARQ |
| CEN-CMP-018 | TST-B05-CON-05/TST-G08-03/TST-G08-07/TST-R11-02 | ETP-06 | GAT-06/07 | EV-CALC/EV-BD/EV-ARQ |
| CEN-CMP-019 | TST-B05-CON-02/TST-B05-CON-04 | ETP-06 | GAT-05/06/07 | EV-CALC/EV-BD/EV-TEM |
| CEN-CMP-020 | TST-B05-CON-10/TST-G08-03 | ETP-06 | GAT-06 | EV-CALC/EV-BD/EV-AUD |
| CEN-CMP-021 | TST-API-022/TST-R11-02 | ETP-07 | GAT-06/07 | EVD-CON/EV-BD/EV-ARQ |
| CEN-CMP-022 | TST-API-005/TST-B03-PRF-03/TST-EXP-01 | ETP-10 | GAT-04/08 | EVD-CTR/EV-SEG/EV-ARQ |
| CEN-CMP-023 | TST-API-001/TST-API-002/QAT-SEC-006 | ETP-00 | GAT-02 | EVD-CTR/EVD-SEC |
| CEN-CMP-024 | TST-ASO-A02/TST-ASO-A06/TST-NOT-O08 | ETP-09 | GAT-08 | EV-BD/EV-AUD/EV-SEG |
| CEN-CMP-025 | TST-ASO-E05/TST-ASO-P05A/TST-ASO-P03/TST-ASO-P12/TST-NOT-O02/TST-NOT-O04 | ETP-10 | GAT-08/09 | EV-BD/EV-TEM/EV-JOB/EV-AUD/EV-SEG |

---

# 5. Valores dependentes de entrada externa

- K06 e rescisão oficial são fixtures do contador; o sistema não deve derivá-los.
- O número absoluto do recibo depende da sequência anual. `N`, `N+1` e `N+2` tornam o cenário 17 determinístico sem inventar o saldo real.
- Datas efetivas dependem da confirmação; a execução usa relógio congelado.
- Reembolso usa somente o valor real manualmente informado, sem cálculo de INSS, IR ou sindicato.

---

# 6. Regra de aceite

Cada cenário precisa passar integralmente em domínio, persistência, autorização, auditoria, documentos e interface aplicáveis. Divergência em qualquer valor, recibo proibido/ausente, estado final, vínculo empresarial ou memória reprova o cenário inteiro. A evidência usa o ID `CEN-CMP-*` junto dos `TST-*` e `QAT-*` proprietários.

---

**Situação desta versão:** 25 cenários compostos materializados, revisados e aprovados pelo usuário.  
**Continuidade vigente:** pacote 23/23A–23D aprovado; preparar o repositório e iniciar a `ETP-00`; execução permanece `NOT_RUN_PLANNED`.  
**Código de produção:** ainda não iniciado.
