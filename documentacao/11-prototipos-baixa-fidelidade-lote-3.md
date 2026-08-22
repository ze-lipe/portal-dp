# Sistema Web de Departamento Pessoal

## Protótipos de Baixa Fidelidade — Lote 3

**Escopo:** Competências e Pagamentos — K01 a K07 e F01 a F03  
**Data de elaboração:** 20/08/2026  
**Situação:** aprovado pelo usuário em 20/08/2026  
**Protótipo interativo:** `lote-3-competencias-pagamentos.html`

---

# 1. Objetivo do lote

Este lote transforma o coração da rotina mensal em uma experiência navegável antes do desenvolvimento. Ele valida:

- Um único módulo e um único item lateral, `Competências e Pagamentos`;
- Seleção explícita de uma empresa e uma competência por vez;
- Criação e acompanhamento das competências;
- Inclusão de empregados e MEIs sem duplicação;
- Cálculos e pendências por participante;
- Digitação individual do líquido enviado pelo contador;
- Separação entre adiantamento e pagamento final;
- Separação entre todos os grupos financeiros;
- Confirmação individual e em lote;
- Checklist e fechamento explícito da competência;
- Saldo inicial auditado na implantação;
- Permissões de tela, ação e campo;
- Estados vazios, validações, conflitos, processamento e sucesso;
- Continuidade para desligamentos, ajustes e recibos, sem antecipar os lotes próprios.

Este documento não inicia o desenvolvimento e não altera as regras já aprovadas no Documento Mestre.

---

# 2. Fontes e precedência

O lote foi consolidado a partir de:

1. `07-documento-mestre-planejamento-funcional.md`, fonte funcional principal;
2. `08-fluxos-integrados-navegacao-telas.md`, fonte da navegação aprovada;
3. `10-prototipos-baixa-fidelidade-lote-2.md`, fonte de continuidade com empregados e MEIs;
4. Documentos 02, 05 e 06, somente quando não divergem da consolidação posterior.

Em caso de divergência, prevalecem os Documentos 07, 08 e 10, nessa ordem de finalidade.

---

# 3. Situação dos lotes anteriores

- Lote 1 aprovado em 16/08/2026;
- Lote 2 aprovado em 20/08/2026;
- O fluxo integrado do menu foi aprovado;
- Não existem itens laterais separados para pagamentos, desligamentos, recibos ou exportações;
- Desligamento permanece dentro de Colaboradores e também aparece no contexto da competência;
- Recibos permanecem dentro de Competências e Pagamentos e nos contextos individuais;
- Exportação permanece na tela de origem;
- Notificações continuam como item próprio do menu.

---

# 4. Telas incluídas

| Código | Tela | Papel no fluxo |
|---|---|---|
| K01 | Lista de competências | Localizar, abrir, criar ou reabrir uma competência |
| K02 | Nova competência | Definir mês e datas previstas e conferir a inclusão inicial |
| K03 | Resumo e checklist | Coordenar toda a jornada mensal e controlar o fechamento |
| K04 | Participantes e cálculos | Conferir empregados e MEIs e os estados independentes dos grupos |
| K05 | Detalhe financeiro do participante | Examinar memória, lançamentos mensais, valores e bloqueios |
| K06 | Líquidos do contador | Digitar o líquido oficial empregado por empregado |
| K07 | Saldo inicial de implantação | Registrar pagamentos reais já ocorridos na competência de corte |
| F01 | Grupos do evento | Visualizar separadamente adiantamento ou pagamento final |
| F02 | Participantes do grupo e evento | Conferir e selecionar participantes de um único grupo |
| F03 | Confirmação em lote | Confirmar pagamentos integrais e mostrar o resultado individual |

F01 é uma única tela reutilizada em dois contextos: `Adiantamento` e `Pagamento final`.

---

# 5. Limites do lote

O protótipo mostra destinos, mas não implementa por completo:

- D03 — desligamentos e acertos;
- F04 — correção financeira guiada;
- F05 — ajustes financeiros;
- R01 a R03 — recibos e impressão;
- Auditoria completa;
- Exportação Excel definitiva.

Esses destinos aparecem apenas para validar a continuidade da navegação. As regras já aprovadas permanecem preservadas para os próximos lotes.

Não pertencem ao Lote 3:

- Integração bancária;
- Estado de processamento bancário;
- Importação de holerite ou planilha;
- Upload de comprovante;
- Nota fiscal do MEI;
- Reprocessamento silencioso de competência fechada;
- Pagamento parcial dentro do mesmo grupo e evento;
- Recibo interno de salário oficial, líquido do holerite ou rescisão oficial.

---

# 6. Arquitetura do módulo

Existe um único item lateral:

```text
Competências e Pagamentos
```

K01 é a visão ampliada das competências e não é uma aba interna. Depois de selecionar uma competência, o módulo apresenta:

1. Resumo e checklist — K03;
2. Participantes e cálculos — K04 e K05;
3. Líquidos do contador — K06;
4. Adiantamento — F01 a F03;
5. Pagamento final — F01 a F03;
6. Desligamentos e acertos — lote posterior;
7. Ajustes financeiros — lote posterior;
8. Recibos — lote posterior.

K07 aparece somente na primeira competência financeira e quando houver necessidade real de saldo inicial.

## 6.1 Invólucro permanente

Com competência selecionada, as telas mantêm:

- Empresa ativa;
- CNPJ;
- Competência;
- Situação oficial;
- Versão;
- Datas previstas do adiantamento e do pagamento final;
- Abas autorizadas;
- Ação de troca de empresa.

`Em pagamentos` pode aparecer ao lado da situação oficial, mas sempre como marcador visual derivado. Ele não substitui `Em preparação`, `Aguardando holerites`, `Em conferência`, `Fechada` ou `Reaberta`.

## 6.2 Entrada no módulo

- Com acesso a K01, o menu abre a lista de competências;
- Sem acesso a K01, mas com acesso a uma tela filha, o menu abre a primeira aba autorizada;
- Nesse segundo caso, o seletor mínimo mostra apenas mês/ano;
- O invólucro não concede nenhuma permissão de negócio;
- Sem qualquer tela autorizada, o item não aparece e uma rota direta é recusada.

## 6.3 Troca de competência

- Recarrega todas as abas;
- Não mantém valores, seleções ou resultados da competência anterior;
- Alteração não salva interrompe a troca até salvar ou descartar;
- Empresa, competência e permissões são revalidadas;
- Uma aba antiga não pode concluir operação no contexto anterior.

---

# 7. Controles exclusivos da revisão

Acima da janela simulada existem quatro controles que não farão parte do produto:

1. Tela para revisar;
2. Estado da tela;
3. Acesso simulado;
4. Cenário da competência.

Também existem setas para percorrer as dez telas.

## 7.1 Estados simulados

- Principal;
- Vazio;
- Carregando;
- Validação;
- Concorrência;
- Processando;
- Sucesso.

## 7.2 Cenários simulados

- Rotina mensal de setembro/2026;
- Aguardando holerites;
- Pronta para fechar;
- Grupos pagos separadamente;
- Empregado iniciado no dia 15;
- Empregado iniciado no dia 16;
- MEI iniciado no dia 16;
- Adiantamento cancelado por desligamento;
- Primeira competência com saldo inicial;
- Competência fechada, versão 1;
- Competência reaberta, versão 2;
- Confirmação em lote com registros impedidos;
- Tentativa de competência duplicada;
- Empresa inativa em consulta histórica.

## 7.3 Perfis simulados

| Perfil de revisão | Principal finalidade |
|---|---|
| Gestor financeiro completo | Conferir todas as telas, campos e ações do lote |
| Conferência sem confirmar | Editar dados permitidos, mas não confirmar pagamentos ou fechar |
| Pagamentos sem K01 | Provar que uma tela filha funciona sem conceder a lista ampliada |
| Somente grupo oficial | Provar que grupos internos ocultos não aparecem nem são inferidos |
| Quantidades, sem valores | Provar a retirada de valores e totais derivados |
| Somente leitura | Provar bloqueios por ação sem ocultar a informação autorizada |
| Sem acesso financeiro | Provar a recusa de rota e a ausência de dados |

Os perfis são exemplos de homologação. Os perfis reais continuarão sendo configurados por empresa.

---

# 8. Conceitos visíveis no lote

## 8.1 Situações da competência

```text
Em preparação
→ Aguardando holerites
→ Em conferência
→ Fechada
→ Reaberta
→ Fechada novamente por ação explícita
```

Regras:

- Fechamento não confirma pagamento;
- Fechamento não é automático;
- Reabertura exige permissão e justificativa;
- Reabertura cria nova versão;
- A versão fechada anterior permanece preservada;
- Reabrir não desfaz pagamentos nem libera silenciosamente grupos pagos.

## 8.2 Estados do grupo

- Não gerado;
- Pendente de dados;
- Calculado;
- Pronto para pagamento;
- Pago;
- Não aplicável;
- Cancelado por desligamento;
- Em correção.

`Cancelado por desligamento` existe somente no adiantamento, quando a saída ocorre antes ou na data prevista e o grupo ainda não foi pago.

## 8.3 Grupos financeiros

| Grupo | Participante | Eventos | Recibo interno |
|---|---|---|---|
| Oficial do empregado | Empregado | Adiantamento e final | Não |
| RA e reembolso | Empregado | Adiantamento e final | Sim, separado por evento |
| Complementos | Empregado | Adiantamento e final | Sim, separado por evento |
| Período sem registro | Empregado | Adiantamento e final | Sim, próprio |
| Contrato MEI | MEI | Adiantamento e final | Sim, separado por evento |

Cada participante pode ter estados diferentes nos grupos do mesmo evento. Confirmar um grupo não confirma nenhum outro.

---

# 9. K01 — Lista de competências

## 9.1 Finalidade

Localizar uma competência e compreender sua situação sem carregar os cálculos de todas as empresas ou de todos os meses.

## 9.2 Conteúdo

- Competência;
- Situação oficial;
- Versão;
- Data prevista do adiantamento;
- Data prevista do pagamento final;
- Participantes, quando permitido;
- Pendências, quando permitido;
- Correções em andamento, quando permitido;
- Data do último fechamento;
- Ações autorizadas.

## 9.3 Filtros

- Ano;
- Situação oficial;
- Existência de pendência.

## 9.4 Ações

- Criar competência;
- Abrir competência;
- Reabrir competência fechada com permissão e justificativa;
- Limpar filtros.

## 9.5 Estados especiais

- Nenhuma competência: orientar criação somente ao perfil autorizado;
- Filtro sem resultado: oferecer `Limpar filtros`;
- Competência fechada: consulta histórica, com reabertura separada;
- Empresa inativa: somente leitura;
- Perfil sem K01: lista ampliada indisponível, mesmo que uma tela filha esteja autorizada.

## 9.6 Validações

- Uma competência por empresa e mês;
- Não criar antes da competência de corte;
- Datas e contagens não autorizadas não aparecem;
- Reabertura usa a versão atual e não apaga a anterior.

---

# 10. K02 — Nova competência

## 10.1 Campos

| Campo | Tipo | Obrigatório | Regra |
|---|---|---:|---|
| Mês/ano | Competência | Sim | Único na empresa e não anterior ao corte |
| Data prevista do adiantamento | Data | Sim | Vem da sugestão empresarial e permanece editável |
| Data prevista do pagamento final | Data | Sim | Pode ocorrer no mês seguinte e permanece editável |

O sistema não calcula quinto dia útil e não consulta feriados.

## 10.2 Prévia antes da criação

- Quantidade de empregados;
- Quantidade de MEIs;
- Total de participantes;
- Vínculos ou contratos com inconsistência;
- Eventual competência já existente;
- Acesso à lista prevista.

Uma inconsistência cadastral pode incluir o participante com estado pendente quando a regra permitir. Ela não autoriza inventar valores.

## 10.3 Saída

Ao concluir com segurança:

1. A competência é criada em `Em preparação`;
2. Vínculos e contratos ativos em alguma parte do mês são incluídos;
3. A operação não duplica participante ou componente;
4. K03 é aberta.

## 10.4 Bloqueios

- Competência duplicada;
- Campo obrigatório ausente;
- Data inválida;
- Empresa inativa;
- Competência anterior ao corte;
- Perfil incapaz de preencher todos os campos obrigatórios;
- Clique repetido durante processamento.

---

# 11. K03 — Resumo e checklist

## 11.1 Finalidade

É a página central da rotina mensal e a única autoridade visual para o fechamento.

## 11.2 Resumo

O desenho representa:

- Participantes por tipo;
- Grupos não gerados;
- Pendentes de dados;
- Calculados;
- Prontos;
- Pagos;
- Não aplicáveis;
- Cancelados por desligamento;
- Em correção;
- Líquidos do contador pendentes;
- Salários redondos sem valor real ou confirmação de zero;
- Ajustes positivos pendentes;
- Diferenças absorvidas;
- Desligamentos não resolvidos;
- Recibos que precisam ser substituídos.

O protótipo resume os indicadores mais importantes em cartões e mantém os demais no checklist ou nos destinos contextuais. A implementação poderá expandir o resumo sem alterar a hierarquia.

## 11.3 Checklist bloqueador

- Todos os líquidos necessários informados;
- Todos os grupos aplicáveis pagos ou não aplicáveis;
- Salários redondos conferidos;
- Desligamentos quitados;
- Ajustes positivos pagos;
- Diferenças negativas registradas como absorvidas;
- Nenhuma correção aberta;
- Nenhuma edição concorrente;
- Nenhum recibo substituto pendente por uma correção aberta.

Cada pendência mostra quantidade e link para a lista correspondente, se o perfil puder acessar esse destino.

## 11.4 Ações

- Atualizar participantes;
- Calcular pendentes;
- Recalcular registros ainda editáveis;
- Abrir cada pendência;
- Exportar a competência;
- Fechar competência;
- Reabrir competência fechada.

Atualizar participantes:

- Em competência aberta, inclui ou corrige sem duplicação;
- Recalcula apenas o que ainda pode ser recalculado;
- Em competência fechada, direciona ao futuro F04;
- Nunca reprocessa silenciosamente pagamento ou documento.

## 11.5 Fechamento

- Botão desabilitado enquanto houver qualquer impedimento;
- Revalidação integral no servidor;
- Ação explícita;
- Não cria nem confirma pagamento;
- Registra usuário, data, versão e auditoria;
- Repetição segura não cria outra versão.

---

# 12. K04 — Participantes e cálculos

## 12.1 Tabela

Uma linha por participante, com identificação visível de `Empregado` ou `MEI`.

Colunas previstas:

- Participante;
- Tipo;
- Situação do vínculo ou contrato;
- Elegibilidade ao adiantamento;
- Grupos autorizados do adiantamento;
- Grupos autorizados do pagamento final;
- Desligamento;
- Ajustes;
- Situação derivada dos grupos autorizados;
- Ação de abrir K05.

A situação derivada nunca substitui o estado de cada grupo e não pode denunciar um grupo oculto.

## 12.2 Filtros

- Texto;
- Tipo;
- Grupo;
- Evento;
- Estado;
- Pendência;
- Desligamento.

Campo oculto não participa de filtro, pesquisa, ordenação ou contagem.

## 12.3 Ações em lote

- Calcular selecionados;
- Recalcular somente registros ainda não pagos;
- Abrir F02 para um único grupo e evento;
- Abrir F03 para seleção homogênea.

Uma operação nunca mistura:

- Empresas;
- Competências;
- Grupos;
- Eventos.

## 12.4 Cenários representados

- Oficial pago, RA pronta e complementos pendentes no mesmo empregado;
- Empregado com período sem registro;
- Início no dia 15;
- Início no dia 16 sem adiantamento;
- MEI proporcional sem adiantamento inicial;
- Grupo cancelado por desligamento;
- Filtro ou conjunto vazio.

---

# 13. K05 — Detalhe financeiro do participante

## 13.1 Cabeçalho

- Tipo e identificador do participante;
- Nome ou razão social, quando autorizado;
- Documento, quando autorizado;
- Origem do vínculo ou contrato;
- Competência;
- Evento selecionado;
- Estado do recorte.

## 13.2 Condições vigentes

- Data de início das atividades ou do contrato;
- Admissão formal para empregado;
- Regra do corte;
- Dias comerciais D30;
- Condições financeiras aplicáveis à competência.

## 13.3 Memória

Para cada componente autorizado:

- Nome e origem;
- Fórmula;
- Valor calculado ou informado;
- Valor manual, quando houver;
- Diferença;
- Valor final devido;
- Valor efetivamente pago;
- Data efetiva;
- Estado;
- Versão.

Se a fórmula ou qualquer operando permitir inferir um campo oculto, todo o trecho correspondente é omitido.

## 13.4 Edição do cálculo

Antes do pagamento, usuário autorizado pode substituir o valor calculado. O sistema preserva:

- Memória original;
- Valor calculado;
- Valor substituto;
- Diferença;
- Justificativa obrigatória;
- Usuário e data;
- Versão.

Depois do pagamento, o grupo fica bloqueado e a ação passa a ser `Iniciar correção`, com destino ao futuro F04.

## 13.5 Lançamentos mensais

Empregado:

- Cadastrar vários complementos avulsos da competência;
- Informar reembolso real ou confirmar zero por evento quando houver salário redondo;
- Confirmar que o período sem registro não está incluído no oficial.

MEI:

- Cadastrar vários serviços adicionais;
- Serviço adicional pertence somente ao pagamento final;
- Não existe complemento recorrente do MEI.

F02 apenas confere e confirma o que já foi calculado. Ele não cria verbas.

## 13.6 Regra de saldo

```text
Saldo = máximo(0, total devido − valor efetivamente pago da mesma verba)

Excedente = máximo(0, valor efetivamente pago da mesma verba − total devido)
```

- Uma verba nunca reduz outra;
- Um grupo nunca reduz outro;
- Excedente vira diferença absorvida;
- O líquido oficial é autoritativo e não entra nessa recomposição.

---

# 14. K06 — Líquidos do contador

## 14.1 Finalidade

Digitar manualmente o líquido oficial de cada empregado, sem importação.

## 14.2 Tabela

- Empregado;
- Documento, quando autorizado;
- Estado do adiantamento oficial;
- Campo do líquido;
- Situação da linha;
- Aviso ou impedimento;
- Último salvamento;
- Ação individual.

## 14.3 Estados da linha

- Pendente;
- Preenchido;
- Inconsistente;
- Alteração local não salva;
- Conflito de versão.

## 14.4 Comportamento

- Um empregado por linha;
- Navegação por teclado;
- Salvamento individual;
- Sem planilha;
- Sem decomposição;
- Sem recálculo;
- Sem recibo interno;
- Usuário sem edição vê somente o conteúdo autorizado.

O líquido já vem descontando o adiantamento oficial. O sistema não o desconta novamente.

Se o adiantamento oficial não consta como pago, a linha alerta que o líquido pode já considerá-lo e exige conferência antes do pagamento final.

Em demissão formal, a linha usa `Líquido da rescisão oficial` e não permite coexistência com o líquido mensal.

---

# 15. K07 — Saldo inicial de implantação

## 15.1 Disponibilidade

Somente:

- Na primeira competência financeira da empresa;
- Quando a implantação começou depois de algum pagamento real;
- Para perfil com permissão específica.

## 15.2 Campos

- Participante;
- Grupo;
- Evento;
- Valor efetivamente pago;
- Data real;
- Origem permanente `Saldo inicial de implantação`.

## 15.3 Regras

- Lançamento individual;
- Sem importação;
- Sem criação de competência anterior;
- Sem recibo fabricado;
- Sem duplicação com confirmação normal;
- Auditoria obrigatória;
- Indisponível nas competências seguintes.

Uma correção posterior deve usar o fluxo auditado apropriado, sem apagar o saldo original.

---

# 16. F01 — Grupos do evento

## 16.1 Contextos

- Adiantamento;
- Pagamento final.

Alternar o evento não altera empresa ou competência.

## 16.2 Cartões

Cada grupo autorizado mostra:

- Quantidade pronta;
- Quantidade pendente;
- Quantidade paga;
- Quantidade não aplicável;
- Quantidade em correção;
- Total autorizado, quando permitido;
- Data efetiva mais recente;
- Existência ou não de recibo interno;
- Ação de abrir F02;
- Ação de iniciar F03, quando houver elegíveis e permissão.

Grupo sem permissão é omitido. Ele não aparece com zero.

## 16.3 Independência

No mesmo evento pode existir:

- Oficial pago;
- RA e reembolso prontos;
- Complementos pendentes;
- Período sem registro não aplicável;
- MEI aguardando outro evento.

Nenhuma confirmação de um cartão altera os demais.

## 16.4 Conteúdo excluído

F01 não apresenta como cartões genéricos:

- Rescisão oficial;
- Acerto complementar de RA;
- Ajuste positivo;
- Diferença absorvida.

Esses itens possuem subfluxos próprios.

---

# 17. F02 — Participantes do grupo e evento

## 17.1 Contexto obrigatório

F02 sempre recebe:

```text
empresa + competência + evento + grupo
```

O cabeçalho deixa o caminho inequívoco, por exemplo:

```text
Setembro/2026 > Adiantamento > RA e reembolso
```

## 17.2 Tabela

- Seleção;
- Participante;
- Componentes;
- Valor final;
- Estado;
- Impedimento;
- Data efetiva;
- Recibo, quando existir;
- Ações autorizadas.

## 17.3 Ações por linha

- Conferir memória em K05;
- Editar cálculo autorizado em K05;
- Marcar `Não aplicável` quando o total for zero, com motivo e permissão;
- Confirmar integralmente;
- Iniciar F04 quando já pago;
- Abrir R02 quando houver recibo.

## 17.4 Impedimentos

- Dado obrigatório ausente;
- Conflito de versão;
- Total zero ainda não tratado;
- Correção aberta;
- Estado incompatível;
- Falta de permissão;
- Cancelamento por desligamento.

Somente registros prontos podem ser selecionados para F03.

---

# 18. F03 — Confirmação em lote

## 18.1 Etapas

1. Receber participantes do mesmo grupo e evento;
2. Retirar impedidos antes do envio;
3. Informar data efetiva;
4. Conferir quantidade e total autorizados;
5. Conferir os recibos que serão emitidos;
6. Confirmar uma única vez;
7. Mostrar o resultado de cada participante.

## 18.2 Regras

- Todos pertencem à mesma empresa, competência, grupo e evento;
- Confirmação integral por participante;
- Data efetiva obrigatória e não futura;
- Data efetiva pode diferir da prevista;
- Cada participante mantém pagamento, auditoria e recibo próprios;
- Oficial não gera recibo interno;
- Valor zero não é confirmado como pago;
- `Pago` significa que o usuário confirmou a ocorrência real;
- Não existe processamento bancário;
- Clique repetido não duplica pagamento ou número de recibo;
- Perda de conexão exige consulta do estado real antes de nova tentativa.

## 18.3 Resultados

- Nenhum elegível: botão final desabilitado;
- Processando: controles bloqueados;
- Sucesso: resultado individual e número do recibo permitido;
- Resposta incerta: nenhuma repetição até verificar o estado;
- Falha segura: informar que nenhuma alteração foi concluída;
- Mudança concorrente: rejeitar a versão antiga e voltar à conferência.

## 18.4 Decisão transacional aprovada

Para o volume previsto, o envio final do conjunto elegível será `todos ou nenhum`:

- Impedidos conhecidos são retirados antes do envio;
- Se surgir conflito durante a transação, nenhuma confirmação do lote é concluída;
- O usuário volta a F02, atualiza e confere novamente;
- Não existe sucesso coletivo com resultado parcial inesperado.

Esta decisão foi aprovada com o lote e será detalhada no desenho técnico.

---

# 19. Cálculos representados

## 19.1 D30

- Divisor fixo 30;
- Datas inicial e final inclusivas;
- Dia 31 equivale ao dia comercial 30;
- Último dia de fevereiro equivale ao dia comercial 30;
- Fevereiro completo equivale a 30 dias;
- Mês de 31 dias completo equivale a 30 dias;
- Dia 15 até o fim resulta em 16 dias;
- Dia 16 até o fim resulta em 15 dias;
- Um intervalo de um único dia resulta em um dia.

## 19.2 Oficial do empregado

```text
Base oficial proporcional =
salário-base ÷ 30 × D30(admissão, fim da competência)

Adiantamento oficial =
base oficial proporcional × percentual aplicável
```

- Usa a admissão formal;
- Até o dia 15, inclusive, pode haver adiantamento proporcional;
- A partir do dia 16, não há adiantamento oficial inicial;
- Pagamento final permanece exatamente o líquido do contador.

## 19.3 RA

- Primeira competência proporcional desde o início das atividades;
- Competências intermediárias integrais;
- Alteração no mês vale para a competência inteira;
- Até o dia 15 pode participar do adiantamento;
- A partir do dia 16, toda a RA devida vai ao final;
- Não está incluída no líquido do contador.

## 19.4 Complementos

- Recorrentes vigentes e avulsos da competência;
- Vários podem coexistir;
- Integrais, sem proporcionalidade diária;
- Sem arredondamento especial;
- Criado depois do adiantamento pago migra ao final;
- Depois do final pago, diferença positiva segue ao futuro ajuste.

## 19.5 Salário redondo

- Não calcula tributo;
- Reembolso real ou confirmação expressa de zero por evento;
- Categorias INSS, IR, sindicato e outro;
- Pode aparecer no adiantamento, no final ou em ambos;
- Integra `RA e reembolso`.

## 19.6 Período sem registro

```text
Valor = base confirmada ÷ 30 × D30(intervalo sem registro)
```

- Uma linha por competência;
- Termina no dia anterior à admissão ou na saída sem registro;
- Não inclui RA ou complemento;
- Exige confirmação de que não está no oficial;
- Pode ser 100% no final ou dividido;
- Quando dividido, usa o percentual de adiantamento aplicável;
- Início a partir do dia 16 leva todo o valor ao final;
- Grupo e recibo próprios.

## 19.7 MEI

```text
Primeira e última competências =
valor mensal ÷ 30 × D30(período ativo)

Pagamento final =
base MEI − adiantamento efetivamente pago da mesma base
+ serviços adicionais
```

- Início até o dia 15 pode gerar adiantamento;
- Início a partir do dia 16 leva toda a base inicial ao final;
- Renovação contínua não reaplica o corte;
- Serviço adicional é avulso e somente no final;
- Excedente pago vira diferença absorvida.

## 19.8 Moeda

- Armazenamento e exibição com duas casas;
- Cálculo intermediário com precisão suficiente;
- Terceira casa arredondada normalmente para centavos;
- Primeira parcela arredondada;
- Parcela final apurada por diferença para absorver eventual centavo residual;
- Nenhuma regra de arredondar complemento para número inteiro.

---

# 20. Permissões

## 20.1 Separação por tela, ação e campo

O acesso ao módulo não concede automaticamente:

- Ver K01;
- Criar competência;
- Ver resumo;
- Ver cada grupo;
- Ver valores;
- Editar líquido;
- Calcular;
- Sobrescrever;
- Marcar não aplicável;
- Confirmar individualmente;
- Confirmar em lote;
- Fechar;
- Reabrir;
- Registrar saldo inicial;
- Exportar;
- Ver, baixar ou reimprimir recibos.

## 20.2 Dependências propostas

- Confirmar pagamento exige visualizar valor final e componentes materiais do grupo;
- Confirmar em lote é separado de confirmar individualmente;
- Fechar e reabrir são separados;
- Cancelar confirmação não decorre de confirmar;
- Sobrescrever não decorre de calcular;
- Marcar não aplicável exige valor zero, motivo e permissão;
- Criar competência exige edição de todos os campos obrigatórios;
- Perfil novo e permissão nova começam negados.

## 20.3 Prevenção de inferência

- Grupo não autorizado é omitido, nunca mostrado com zero;
- Campo oculto não aparece em coluna, filtro, busca, contagem, total, mensagem ou exportação;
- Memória oculta fórmula e operandos que revelem o campo;
- Situação geral considera somente grupos autorizados ou é omitida;
- Total é rotulado como total do recorte visível;
- Se ainda permitir dedução, o total é omitido;
- F03 mostra apenas participantes, impedimentos e valores autorizados;
- Download de recibo exige acesso atual a todo o conteúdo do documento.

## 20.4 Fechamento e visibilidade

Recomenda-se conceder `Fechar competência` somente ao perfil autorizado a conhecer todas as categorias do checklist. Caso contrário, até o estado habilitado ou desabilitado do botão poderia revelar uma pendência oculta.

---

# 21. Segurança e integridade

## 21.1 Isolamento empresarial

- Empresa ativa vem da sessão, nunca de um campo confiado da tela;
- Toda entidade financeira carrega a empresa;
- Relacionamentos impedem associação cruzada entre CNPJs;
- Competência é única por empresa e mês;
- Row-Level Security permanece como segunda barreira;
- Identificador de outra empresa responde como inexistente;
- Master também trabalha uma empresa por vez;
- Troca de empresa limpa competência, filtros, seleções, edições e operações pendentes.

## 21.2 Concorrência

- Todo registro editável possui versão;
- Salvamento baseado em versão antiga é rejeitado;
- Nenhum dado recente é sobrescrito;
- Usuário atualiza e confere novamente;
- Confirmação, fechamento e numeração usam transação;
- Operação e auditoria concluem juntas.

## 21.3 Idempotência

Obrigatória em:

- Criar competência;
- Atualizar participantes;
- Calcular e recalcular;
- Salvar líquido;
- Registrar saldo inicial;
- Marcar não aplicável;
- Confirmar individualmente ou em lote;
- Fechar e reabrir;
- Emitir recibo;
- Exportar.

Mesma operação repetida devolve o resultado seguro já existente. Ela não cria outra pessoa, competência, componente, pagamento, recibo ou arquivo.

## 21.4 Auditoria mínima

- Criação da competência;
- Atualização de participantes;
- Cálculo e recálculo;
- Sobrescrita manual;
- Salvamento do líquido;
- Saldo inicial;
- Não aplicável e reversão;
- Confirmação individual e em lote;
- Fechamento e reabertura;
- Conflito de versão;
- Encaminhamento para correção;
- Emissão e acesso a recibo;
- Exportação;
- Tentativa negada ou cruzada.

F03 registra um evento pai do lote e eventos individuais por participante.

---

# 22. Recibos no contexto do lote

- Prévia antes do pagamento não possui número;
- Prévia contém `PRÉVIA — PAGAMENTO NÃO CONFIRMADO`;
- Definitivo nasce somente após confirmação integral;
- Oficial não gera recibo interno;
- RA e reembolso geram recibo próprio por evento;
- Complementos geram outro recibo próprio por evento;
- Período sem registro gera recibo próprio;
- Contrato MEI gera recibo por evento;
- Cada participante recebe documento individual;
- Reimprimir a mesma versão não gera novo número;
- Documento substituto recebe novo número e mantém relação com o anterior;
- Falha na criação do arquivo não desfaz o pagamento e não consome outro número na regeneração;
- Download revalida sessão, empresa e permissões atuais.

O detalhamento visual dos documentos pertence ao Lote 4.

---

# 23. Exportação contextual

K03 contém `Exportar competência`, sujeito a permissão própria.

Regras:

- Uma empresa e uma competência por arquivo;
- Versão identificada;
- Filtros da tela aplicados;
- Prévia mostra colunas e quantidade autorizadas;
- Campos ocultos omitidos;
- Campos mascarados permanecem mascarados;
- CPF e CNPJ como texto;
- Datas como datas;
- Valores e percentuais como números;
- Textos protegidos contra execução como fórmula;
- Nenhuma fórmula de negócio recalcula valores no Excel;
- Arquivo vazio não é criado;
- Arquivo privado e exclusivo do solicitante;
- Expira em 24 horas;
- Pedido e download revalidam sessão, empresa, versão e permissões;
- Perda de acesso a qualquer coluna invalida o download;
- Não existe central de exportações.

---

# 24. Navegação principal

| Origem | Ação | Destino |
|---|---|---|
| Menu ou painel | Abrir módulo | K01 ou primeira aba autorizada |
| K01 | Nova competência | K02 |
| K01 | Abrir competência | K03 |
| K01 | Reabrir | K03, nova versão |
| K02 | Criar | K03 em preparação |
| K02 | Cancelar | K01 |
| K03 | Participantes | K04 |
| K03 | Líquidos | K06 |
| K03 | Adiantamento | F01-Adiantamento |
| K03 | Pagamento final | F01-Final |
| K03 | Saldo inicial aplicável | K07 |
| K03 | Desligamento | D03 futuro |
| K03 | Ajuste | F05 futuro |
| K03 | Recibo | R01 futuro |
| K04 | Abrir participante | K05 |
| K04 | Abrir grupo | F02 |
| K05 | Conferir grupo | F02 |
| K05 | Grupo já pago | F04 futuro |
| K06 | Voltar | K03 |
| K07 | Concluir | K03 |
| F01 | Abrir grupo | F02 |
| F01 | Confirmar prontos | F03 |
| F02 | Conferir memória | K05 |
| F02 | Confirmar selecionados | F03 |
| F03 | Cancelar antes do envio | F02 |
| F03 | Sucesso | F02 ou R01 futuro |
| F03 | Resposta incerta | Permanecer até consultar o estado real |

Ao voltar de K05 ou F03, a implementação deverá preservar os filtros, o evento, o grupo e a página de origem.

---

# 25. Critérios de aceite

## 25.1 Contexto e navegação

- [ ] Existe um único item lateral `Competências e Pagamentos`;
- [ ] K01 não aparece como aba interna;
- [ ] Empresa e competência permanecem visíveis nas telas financeiras;
- [ ] Trocar competência recarrega todas as abas;
- [ ] Alteração não salva interrompe a troca;
- [ ] Perfil sem K01 pode abrir uma tela filha sem receber os dados da lista;
- [ ] Aba antiga não conclui operação depois da troca de empresa.

## 25.2 Competência

- [ ] Competência é única por empresa e mês;
- [ ] Criação mostra participantes e inconsistências antes de concluir;
- [ ] Participantes são incluídos sem duplicação;
- [ ] Situação oficial e `Em pagamentos` derivado são visualmente diferentes;
- [ ] Fechamento não confirma pagamento;
- [ ] Fechamento falha com qualquer impedimento do checklist;
- [ ] Reabertura exige permissão, justificativa e versão atual;
- [ ] Versão fechada anterior permanece preservada;
- [ ] Duplo clique em fechar ou reabrir não duplica versão.

## 25.3 Cálculos e líquido

- [ ] D30 usa divisor 30 e datas inclusivas;
- [ ] Dia 15 pode receber adiantamento e dia 16 não recebe na primeira competência;
- [ ] Oficial usa admissão; RA e período sem registro usam início das atividades; MEI usa início do contrato;
- [ ] Líquido é digitado individualmente;
- [ ] Líquido não é importado, decomposto ou recalculado;
- [ ] Adiantamento oficial não é descontado novamente;
- [ ] Demissão formal usa líquido da rescisão e não mantém o líquido mensal simultâneo;
- [ ] Complementos são integrais;
- [ ] Serviço adicional MEI aparece somente no final;
- [ ] Um componente oculto não pode ser reconstruído pela memória.

## 25.4 Grupos e pagamentos

- [ ] Estados permanecem independentes por grupo e evento;
- [ ] Oficial pago não confirma RA, complemento ou período sem registro;
- [ ] Somente `Pronto para pagamento` pode ser confirmado;
- [ ] Confirmação exige data efetiva não futura;
- [ ] Valor zero usa `Não aplicável`, motivo e permissão;
- [ ] Não existe pagamento parcial dentro de um grupo e evento;
- [ ] Grupo pago bloqueia edição direta;
- [ ] Seleção em lote não mistura empresa, competência, grupo ou evento;
- [ ] Impedidos são retirados antes do envio;
- [ ] Nenhum elegível desabilita a confirmação;
- [ ] Clique repetido não duplica pagamento ou recibo;
- [ ] Resposta incerta exige consulta do estado real.

## 25.5 Implantação

- [ ] K07 aparece somente na primeira competência aplicável;
- [ ] Saldo inicial registra valor e data efetivamente pagos;
- [ ] Origem permanente permanece visível;
- [ ] Saldo inicial não cria competência anterior;
- [ ] Saldo inicial não fabrica recibo;
- [ ] Saldo inicial não duplica uma confirmação normal.

## 25.6 Permissões e privacidade

- [ ] Acesso ao módulo não concede ações automaticamente;
- [ ] Grupo oculto não aparece em cartão, coluna, filtro, total, contagem ou mensagem;
- [ ] Situação geral não revela grupo oculto;
- [ ] Totais derivados são omitidos quando permitirem inferência;
- [ ] Servidor rejeita campo somente leitura injetado na requisição;
- [ ] Revogação entre prévia e confirmação rejeita a operação;
- [ ] Identificador de outra empresa responde como inexistente;
- [ ] Download e exportação revalidam as permissões atuais.

## 25.7 Concorrência e auditoria

- [ ] Versão antiga não sobrescreve registro novo;
- [ ] Falha de auditoria reverte a operação de negócio;
- [ ] Atualizar participantes repetidamente não duplica dados;
- [ ] F03 registra lote e confirmações individuais;
- [ ] Falha de arquivo preserva pagamento e número do recibo;
- [ ] Operações críticas usam chave de repetição segura.

## 25.8 Responsividade e acessibilidade

- [ ] Protótipo funciona em 736, 360 e 320 pixels;
- [ ] Tabelas possuem rolagem horizontal sem quebrar o restante da tela;
- [ ] Botões e campos mantêm rótulos compreensíveis;
- [ ] Foco de teclado permanece visível;
- [ ] Estado não depende somente de cor;
- [ ] Controles bloqueados explicam o impedimento próximo da ação;
- [ ] Erro preserva os dados informados e leva o foco ao primeiro campo inválido.

---

# 26. Decisões aprovadas neste lote

As quatro decisões abaixo não mudam o escopo funcional; fecham pontos técnicos e de segurança necessários antes do desenvolvimento:

1. **F03 todos ou nenhum:** depois de retirar impedidos conhecidos, um novo conflito durante o envio desfaz o lote elegível inteiro;
2. **Fechamento com visão integral:** somente perfil autorizado a conhecer todas as categorias do checklist pode fechar a competência;
3. **Recibo indivisível:** baixar um PDF definitivo exige autorização atual para todo o conteúdo do documento; a primeira versão não gera PDF parcialmente ocultado;
4. **K07 protegido:** correção de saldo inicial exige justificativa e fluxo auditado, sem apagar o lançamento original.

As quatro decisões foram aprovadas pelo usuário em 20/08/2026.

---

# 27. Pontos não bloqueadores para o desenho técnico

- Derivar automaticamente as passagens entre `Em preparação`, `Aguardando holerites` e `Em conferência` a partir dos fatos operacionais;
- Tornar explícita a passagem de `Calculado` para `Pronto para pagamento` por uma ação de conferência;
- Formalizar o catálogo completo de causas de `Inconsistente` em K06;
- Registrar uma confirmação inicial auditada de que K07 é necessário;
- Validar fórmulas, exemplos e textos dos recibos com as áreas contábil, jurídica e operacional antes da produção.

Nenhum desses pontos impede a aprovação do protótipo de baixa fidelidade.

---

# 28. Roteiro de revisão do usuário

Sugestão de sequência:

1. Percorrer K01 até F03 pelas setas;
2. Em K03, alternar entre `Rotina mensal` e `Pronta para fechar`;
3. Em K04 e K05, comparar dia 15, dia 16 e MEI dia 16;
4. Em F01, alternar adiantamento e pagamento final;
5. Em F02, selecionar e retirar participantes;
6. Em F03, revisar o lote, confirmar e observar o resultado individual;
7. Selecionar `Lote com registros impedidos`;
8. Selecionar `Primeira competência com saldo inicial` e abrir K07;
9. Trocar os perfis `Somente grupo oficial`, `Quantidades, sem valores` e `Pagamentos sem K01`;
10. Testar os estados `Validação`, `Concorrência`, `Processando` e `Vazio`;
11. Conferir as quatro decisões registradas na seção 26.

---

# 29. Situação e próxima etapa

**Situação atual:** Lote 3 aprovado pelo usuário em 20/08/2026.  
**Próxima etapa:** Lote 4 — F04, F05 e R01 a R03 dentro da competência, cobrindo correções, ajustes financeiros e recibos.
