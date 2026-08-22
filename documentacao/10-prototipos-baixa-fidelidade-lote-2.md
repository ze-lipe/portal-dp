# Sistema Web de Departamento Pessoal

## Protótipos de Baixa Fidelidade — Lote 2

**Escopo:** Colaboradores, Empregado e Prestador MEI  
**Empresa ilustrativa:** Comercial Exemplo Ltda.  
**Data da versão:** 20/08/2026  
**Base normativa:** Documentos 07, 08 e decisões já aprovadas pelo usuário

---

# 1. Objetivo do lote

O Lote 2 valida como o usuário localizará, cadastrará e consultará empregados e prestadores MEI dentro de uma única empresa ativa.

Este lote deve confirmar:

- Uma lista única de colaboradores, sem misturar regras de Empregado e MEI;
- Cadastro guiado de novo empregado e recontratação;
- Separação entre pessoa, vínculo e condições financeiras;
- Cadastro guiado de MEI e contrato;
- Separação entre prestador, contrato, vigências e competências;
- Abas contextuais de competências, ASO, recibos e histórico;
- Permissões por tela, ação e campo;
- Comportamento em empresa inativa;
- Preservação do contexto ao voltar para a lista;
- Destinos futuros sem duplicar os módulos de competências, pagamentos, desligamentos, recibos, ASO ou auditoria.

---

# 2. Situação do lote anterior

O Lote 1 foi aprovado pelo usuário em 16/08/2026.

O Lote 2 herda:

- Cabeçalho com razão social, CNPJ e situação da empresa ativa;
- Menu lateral aprovado;
- Troca de empresa;
- Minha Conta e encerramento da sessão;
- Estados seguros de sessão, permissão, contexto e falha;
- Modo histórico para empresa inativa;
- Omissão de conteúdo não autorizado.

---

# 3. Telas incluídas

| Código | Tela |
|---|---|
| C01 | Lista de colaboradores |
| C02 | Novo empregado ou recontratação |
| C03 | Empregado: visão geral |
| C04 | Empregado: condições financeiras |
| C05 | Empregado: competências e pagamentos |
| C06 | Empregado: ASOs |
| C07 | Empregado: recibos |
| C08 | Empregado: histórico |
| M01 | Novo MEI e contrato |
| M02 | MEI: visão geral |
| M03 | Contrato, vigências e renovação |
| M04 | MEI: competências e pagamentos |
| M05 | MEI: recibos |
| M06 | MEI: histórico |

C03 a C08 são abas de um único detalhe de empregado.

M02 a M06 são abas de um único detalhe de MEI.

C06 a C08 e M05 a M06 são apenas entradas contextuais neste lote. Os componentes completos serão validados novamente nos lotes próprios de recibos, ASO e auditoria.

---

# 4. Decisões de organização adotadas

## 4.1 Lista por vínculo ou contrato

A lista C01 representa:

- Uma linha por vínculo de empregado;
- Uma linha por contrato do MEI;
- Nunca uma única linha genérica por pessoa ou prestador.

Essa organização permite:

- Recontratações com históricos separados;
- Contratos novos depois de uma interrupção;
- Situação, datas e identificador próprios;
- Acesso direto ao vínculo ou contrato correto.

## 4.2 Cadastro sem tela intermediária

C01 terá duas ações explícitas:

- Novo empregado;
- Novo MEI.

Não será criada uma tela exclusiva para escolher o tipo.

## 4.3 Destinos de outros lotes

Os destinos abaixo aparecem somente como navegação simulada:

- K05, F02, F04 e F05;
- D02;
- R02;
- S02 a S04;
- H03.

O Lote 2 não reproduz a operação interna dessas telas.

## 4.4 Data final prevista do MEI

Regra aprovada para o MVP:

- A data final prevista do contrato será obrigatória;
- Ela alimentará o alerta de término e o fluxo de renovação;
- A data deverá ser igual ou posterior à data inicial.

Decisão aprovada pelo usuário em 20/08/2026.

## 4.5 Agrupamento Eventos programados

Organização aprovada para C01:

- A aba `Eventos programados` reunirá somente registros que possuam um evento futuro já confirmado no cadastro;
- Para Empregado, incluirá encerramento programado;
- Para MEI, incluirá renovação programada e encerramento programado;
- Vínculo ou contrato apenas `Futuro`, sem encerramento ou renovação programada, continuará identificado por sua situação e poderá ser encontrado pelo filtro de situação;
- O tipo e o evento programado permanecerão explícitos em cada linha, sem tratar renovação de MEI como desligamento;
- A contagem respeitará empresa, tipo, campos e registros que o perfil pode conhecer.

Organização aprovada pelo usuário em 20/08/2026.

---

# 5. Controles exclusivos da revisão

O protótipo conterá quatro seletores que não pertencerão ao sistema definitivo.

## 5.1 Tela para revisar

Permite alternar entre C01 a C08 e M01 a M06.

## 5.2 Estado da tela

Permite revisar:

- Principal;
- Validação ou conflito;
- Processando;
- Carregamento neutro;
- Vazio ou filtro sem resultado;
- Cenário especial da tela;
- Alterações não salvas;
- Empresa inativa em modo histórico.

## 5.3 Cenário do registro

Permite revisar a regra de negócio sem misturar o estado técnico da tela com a situação do vínculo ou contrato.

Empregado:

- CPF novo;
- Recontratação de pessoa com vínculo encerrado;
- CPF com vínculo ativo ou sobreposto;
- Vínculo futuro;
- Ativo sem registro;
- Ativo registrado;
- Encerramento programado;
- Encerrado sem registro;
- Demitido formalmente;
- Admissão posterior com competências ainda abertas;
- Admissão posterior com evento pago ou competência fechada.

MEI:

- CNPJ novo;
- Prestador reutilizado;
- Contrato ativo ou sobreposto;
- Contrato futuro;
- Contrato ativo;
- Renovação programada;
- Encerramento programado;
- Contrato encerrado;
- Retorno depois de interrupção;
- Primeira competência até o dia 15;
- Primeira competência a partir do dia 16;
- Primeira ou última competência proporcional por D30.

A empresa inativa continuará sendo um estado separado. Ativar o modo histórico da empresa não mudará artificialmente a situação do empregado ou do contrato MEI.

## 5.4 Acesso simulado

Permite revisar:

- Operação completa;
- Consulta sem edição;
- Documentos pessoais mascarados, sem edição dos próprios campos mascarados;
- Condições financeiras ocultas;
- Salário-base visível com remuneração adicional oculta;
- Resultado do ASO oculto;
- Consulta sem permissão de exportar;
- Consulta e reimpressão de recibos sem permissão de baixar;
- Consulta e download de recibos sem permissão de reimprimir;
- Somente visão geral;
- Somente empregados;
- Somente MEIs;
- Sem permissão para criar Empregado;
- Sem permissão para criar MEI;
- Sem todos os campos obrigatórios editáveis para o cadastro;
- Sem acesso a Colaboradores.

Os perfis simulados devem demonstrar que:

- Uma ação de criação não aparece se o usuário não puder editar todos os campos obrigatórios daquele fluxo;
- Documento ou endereço mascarado nunca é usado como valor editável que possa sobrescrever o dado real;
- Perfil sem financeiro pode cadastrar pessoa e vínculo de empregado com condição pendente quando a regra permitir, mas não inicia M01 se não puder informar o contrato obrigatório;
- Acesso a uma tela não concede automaticamente acesso a todas as abas, ações ou campos dela;
- URL digitada diretamente recebe as mesmas verificações aplicadas à navegação visível.

---

# 6. Estrutura global do detalhe

## 6.1 Cabeçalho empresarial

Permanece visível em todas as telas:

- Logo;
- Razão social;
- CNPJ;
- Situação da empresa;
- Notificações autorizadas;
- Minha Conta;
- Trocar empresa;
- Sair.

## 6.2 Contexto individual

O detalhe do empregado apresenta:

- Tipo Empregado;
- Identificador interno do vínculo;
- Nome;
- CPF autorizado;
- Situação;
- Início das atividades;
- Admissão/registro no eSocial ou ausência de admissão;
- Data de desligamento sem registro, somente quando aplicável;
- Data de demissão formal, somente quando aplicável.

As quatro datas permanecem conceitualmente distintas. A tela não usará um único campo genérico `Encerramento` quando já houver uma saída efetiva. Apenas a data final compatível com o tipo do vínculo será exibida.

O detalhe do MEI apresenta:

- Tipo MEI;
- Identificador interno do contrato;
- Nome fantasia;
- CNPJ autorizado;
- Situação;
- Razão social;
- Início e final previsto do contrato.

No MEI, data final prevista e encerramento efetivo permanecem campos distintos. O modo histórico da empresa apenas bloqueia edição; não altera a situação derivada do contrato.

## 6.3 Abas

Empregado:

1. Visão geral;
2. Condições financeiras;
3. Competências e pagamentos;
4. ASOs;
5. Recibos;
6. Histórico.

MEI:

1. Visão geral;
2. Contrato e vigências;
3. Competências e pagamentos;
4. Recibos;
5. Histórico.

Aba sem permissão não aparece. A rota correspondente também deve ser rejeitada pelo servidor.

---

# 7. Fluxo integrado

~~~mermaid
flowchart TD
    P["Painel ou menu"] --> C01["C01 — Lista de colaboradores"]

    C01 --> C02["C02 — Novo empregado ou recontratação"]
    C02 --> C03["C03 — Empregado: visão geral"]
    C03 --> C04["C04 — Condições financeiras"]
    C03 --> C05["C05 — Competências e pagamentos"]
    C03 --> C06["C06 — ASOs"]
    C03 --> C07["C07 — Recibos"]
    C03 --> C08["C08 — Histórico"]

    C01 --> M01["M01 — Novo MEI e contrato"]
    M01 --> M02["M02 — MEI: visão geral"]
    M02 --> M03["M03 — Contrato e vigências"]
    M02 --> M04["M04 — Competências e pagamentos"]
    M02 --> M05["M05 — Recibos"]
    M02 --> M06["M06 — Histórico"]

    C04 -. "Lote futuro" .-> KF["K05 ou F04"]
    C03 -. "Lote futuro" .-> D02["D02 — Desligamento"]
    C06 -. "Lote futuro" .-> S["Central ASO"]
    C07 -. "Lote futuro" .-> R["Detalhe do recibo"]
    C08 -. "Lote futuro" .-> H["Detalhe da auditoria"]
    M04 -. "Lote futuro" .-> KFM["Competência e pagamento"]
    M05 -. "Lote futuro" .-> RM["Detalhe do recibo"]
    M06 -. "Lote futuro" .-> HM["Detalhe da auditoria"]
~~~

Ao voltar de um detalhe para C01, o sistema preservará:

- Pesquisa;
- Tipo;
- Situação;
- Aba de ativos, eventos programados ou encerrados;
- Ordenação;
- Página.

Trocar de empresa elimina esse contexto.

---

# 8. C01 — Lista de colaboradores

## 8.1 Finalidade

Reunir Empregados e MEIs em uma única lista operacional, mantendo o tipo sempre explícito.

## 8.2 Conteúdo

- Pesquisa;
- Filtro de tipo;
- Filtro de situação;
- Abas Ativos, Eventos programados e Encerrados;
- Tabela paginada;
- Quantidade autorizada;
- Novo empregado;
- Novo MEI;
- Exportar Excel.

`Eventos programados` segue a proposta da seção 4.5. A lista também oferece acesso contextual à visão D01 de desligamentos do empregado, sem transformar D01 em item do menu lateral.

## 8.3 Pesquisa

Com documento integralmente visível:

- Nome;
- CPF;
- Razão social;
- Nome fantasia;
- CNPJ.

Com documento mascarado ou oculto:

- Somente nome, razão social ou nome fantasia autorizados;
- O documento completo não pode ser usado para confirmar a existência do registro.

## 8.4 Colunas propostas

- Nome;
- Identificador do vínculo ou contrato;
- Tipo;
- Documento autorizado;
- Situação;
- Data inicial;
- Ação.

Campos financeiros não aparecem na lista inicial.

## 8.5 Situação inicial

- Apenas ativos;
- Inativos e encerrados somente depois de filtro;
- Eventos programados somente depois da escolha da aba ou do filtro correspondente;
- Paginação obrigatória;
- Uma empresa por consulta.

## 8.6 Exportação contextual

O botão fica em C01 e exige permissão própria.

O arquivo:

- Exibe antes da geração uma prévia autorizada com empresa, filtros, abas, colunas permitidas e quantidade estimada;
- A prévia não enumera coluna, tipo ou registro que o perfil não possa conhecer;
- Usa os filtros atuais;
- Pertence à empresa ativa;
- Possui aba Empregados quando autorizada;
- Possui aba MEIs quando autorizada;
- Omite campos ocultos;
- Mantém campos mascarados;
- Grava CPF e CNPJ como texto, preservando zeros e impedindo conversão numérica;
- Grava datas como datas e valores/percentuais autorizados como números;
- Neutraliza texto iniciado por `=`, `+`, `-` ou `@` e qualquer conteúdo que possa ser interpretado como fórmula;
- Não é criado quando não houver registros autorizados;
- Fica privado por 24 horas;
- É baixado somente pelo solicitante;
- Revalida sessão, solicitante, empresa ativa e permissões no pedido e novamente no download;
- É invalidado para aquela sessão quando houver troca de empresa, encerramento de sessão ou perda da permissão aplicável;
- Não pode ser baixado por uma aba pertencente ao contexto empresarial anterior;
- Registra solicitação, escopo autorizado, conclusão, falha e download na auditoria;
- Nunca cria fórmula de negócio nem serve como arquivo de importação de retorno.

---

# 9. C02 — Novo empregado ou recontratação

## 9.1 Organização

Fluxo guiado dentro do mesmo código C02:

1. CPF;
2. Pessoa e endereço;
3. Vínculo;
4. Condições iniciais;
5. Revisão.

## 9.2 Etapa CPF

### CPF novo

- Validar formato;
- Pesquisar somente na empresa ativa;
- Autorizar novo cadastro.

### CPF com vínculo anterior encerrado

- Reutilizar a pessoa;
- Mostrar resumo do vínculo anterior;
- Criar novo vínculo;
- Não copiar remunerações, complementos ou pagamentos.

### CPF com vínculo ativo ou sobreposto

- Bloquear;
- Oferecer acesso ao vínculo existente;
- Não criar pessoa ou vínculo duplicado.

## 9.3 Pessoa e endereço

Campos:

- Nome completo obrigatório;
- CPF obrigatório;
- CEP obrigatório;
- Logradouro obrigatório;
- Número obrigatório, aceitando S/N;
- Complemento opcional;
- Bairro obrigatório;
- Cidade obrigatória;
- Estado obrigatório.

A busca por CEP é apenas auxiliar. A falha permite digitação manual.

O cadastro de empregado não possui telefone ou e-mail.

## 9.4 Vínculo

Campos:

- Empresa derivada do contexto;
- Data de início das atividades obrigatória;
- Data de admissão ou registro no eSocial opcional;
- Situação derivada.

Regras:

- Admissão não pode anteceder o início;
- Vínculo futuro pode ser salvo;
- Sem admissão, a situação futura ou ativa será Sem registro;
- Desligamento sem registro e demissão formal ficam no fluxo de desligamento;
- Não existe botão livre para inativar;
- Data final é inclusiva e a inativação derivada ocorre no dia seguinte à saída;
- Desligamento sem registro exige ausência de admissão;
- Demissão formal exige admissão;
- As duas datas finais nunca coexistem.

## 9.5 Condições iniciais

### Salário-base oficial

- Disponível quando existe admissão;
- Valor mensal do holerite;
- Competência inicial;
- Percentual individual de adiantamento, quando houver exceção.

O padrão da empresa e a exceção individual serão visualmente distintos:

- `Usar padrão da empresa — 40%`, inicialmente;
- `Configurar exceção individual`, revelando percentual e vigência;
- O campo de exceção não será preenchido com `40%` apenas para repetir o padrão.

### Remuneração adicional

- Independente da admissão;
- Pode vigorar desde o início das atividades;
- Valor fixo;
- Competência inicial obrigatória quando o valor for positivo;
- Competência final opcional;
- Uma ou duas parcelas;
- Evento da parcela única;
- Percentual próprio quando dividida.

### Período sem registro

- Base mensal confirmada separadamente;
- Não inclui RA ou complemento;
- Pode ser dividido ou 100% no pagamento final;
- Quando dividido, usa o percentual de adiantamento aplicável ao empregado naquela competência, respeitando padrão empresarial ou exceção individual;
- Regra aprovada pelo usuário em 20/08/2026.

Exemplo coerente com o caso aprovado de R$ 3.000,00 mensais:

```text
Base própria do período sem registro = R$ 2.000,00
RA independente = R$ 1.000,00
Composição informada do período = R$ 3.000,00
```

`Composição informada do período` é apenas um resumo para conferência e não recebe o nome `total acordado` enquanto não houver salário-base oficial.

### Salário redondo

- Apenas marcador;
- Competência inicial obrigatória quando o marcador for ativado;
- Competência final opcional quando o marcador for encerrado;
- Não arredonda salário;
- Não calcula tributos;
- Não preenche INSS, Imposto de Renda ou sindicato.

### Total acordado

- Salário-base oficial mais RA;
- Somente leitura;
- Não inclui complemento, reembolso ou período sem registro;
- Sem salário-base oficial, o protótipo usa a expressão Composição informada do período, sem chamar o resultado de total acordado.

### Corte inclusivo do dia 15

As condições iniciais mostram qual data controla a elegibilidade ao adiantamento:

- Salário oficial usa a data de admissão;
- RA, complementos e período sem registro usam a data de início das atividades;
- Admissão ou início até o dia 15, inclusive, pode participar do adiantamento conforme configuração;
- Admissão ou início a partir do dia 16 não gera adiantamento inicial para a respectiva verba;
- Nesse caso, toda a parcela devida migra para o pagamento final e nenhum valor desaparece.

## 9.6 Salvamento

O usuário poderá:

- Salvar vínculo com condições pendentes e abrir C03;
- Continuar para condições;
- Concluir o cadastro e abrir C03;
- Abrir C04 pela aba.

Cadastro e auditoria concluem juntos ou nada é salvo.

---

# 10. C03 — Empregado: visão geral

## 10.1 Conteúdo

- Nome e CPF autorizado;
- Endereço autorizado;
- Início das atividades;
- Admissão ou ausência de admissão;
- Encerramento programado ou efetivo;
- Situação derivada;
- Alertas contextuais;
- Abas do detalhe.

Datas do vínculo:

- Data de início das atividades;
- Data de admissão/registro no eSocial;
- Data de desligamento sem registro;
- Data de demissão formal.

As datas finais são condicionais e mutuamente exclusivas. Em vínculo ativo, a tela informa que não há saída programada. Em vínculo encerrado, utiliza o rótulo específico e mostra a data efetiva.

## 10.2 Situações representáveis

- Futuro;
- Ativo sem registro;
- Ativo registrado;
- Encerramento programado;
- Encerrado sem registro;
- Demitido formalmente.

O cenário de empresa inativa é independente dessa lista: a tela fica somente leitura, mas preserva a situação real do vínculo.

## 10.3 Ações

Conforme permissão e situação:

- Editar pessoa e endereço;
- Editar datas do vínculo;
- Registrar admissão;
- Registrar ou programar desligamento;
- Abrir abas autorizadas.

O desligamento abre D02 no Lote 5. Não existe item próprio no menu.

## 10.4 Admissão registrada posteriormente

Ao acionar `Registrar admissão` em um vínculo sem registro, o fluxo guiado deverá:

1. Informar a data de admissão/registro no eSocial;
2. Bloquear data anterior ao início das atividades;
3. Informar o salário-base oficial e sua competência inicial;
4. Exibir a RA vigente desde o início e permitir mantê-la ou criar nova versão;
5. Encerrar o intervalo sem registro no dia anterior à admissão, preservando linhas, cálculos e recibos existentes;
6. Mostrar o total acordado derivado depois que salário-base e RA estiverem definidos;
7. Listar competências e eventos afetados;
8. Recalcular somente competência aberta e evento ainda não pago;
9. Direcionar a F04 quando houver pagamento confirmado ou competência fechada;
10. Gravar vínculo, versões financeiras e auditoria na mesma operação segura.

O sistema não decide automaticamente como dividir o valor total entre salário-base e RA, não reinicia a RA na admissão e não inclui a RA na base do período sem registro.

---

# 11. C04 — Empregado: condições financeiras

## 11.1 Blocos

- Salário-base e adiantamento;
- RA;
- Total acordado;
- Período sem registro;
- Salário redondo;
- Complementos recorrentes;
- Prévia de impacto.

## 11.2 Versões

- Vigências não podem se sobrepor;
- Alteração no mês vale para a competência inteira;
- Versões substituem-se e não se somam;
- Histórico não é apagado;
- Competência aberta e sem pagamento pode recalcular apenas o escopo interno aplicável;
- Evento pago direciona à correção.

## 11.3 Salário-base

- Alteração não cria diferença oficial no sistema;
- A diferença oficial já vem no líquido do contador;
- Dependências internas ainda abertas podem ser recalculadas.

## 11.4 RA

- Pode vigorar desde o início das atividades;
- Competência inicial é obrigatória quando houver valor positivo;
- Competência final é opcional para encerramento programado;
- Primeira competência proporcional;
- Competências intermediárias integrais;
- Última competência proporcional dentro do acerto;
- Evento pago nunca é reprocessado silenciosamente.

## 11.5 Período sem registro

- Início inclusivo até o dia anterior à admissão;
- Uma linha D30 por competência;
- Base confirmada separadamente;
- Sem RA e sem complemento;
- Divisão usa, como proposta, o percentual de adiantamento aplicável ao empregado;
- Cada pagamento efetivo terá recibo próprio.

A memória deve mostrar divisor fixo 30, datas inclusivas e o intervalo considerado. Dia 31 e último dia de fevereiro equivalem ao dia comercial 30; mês completo sempre equivale a 30 dias.

## 11.6 Complementos

Em C04:

- Somente recorrentes;
- Descrição obrigatória;
- Valor fixo;
- Competência inicial obrigatória;
- Competência final opcional, inclusive vigência indeterminada;
- Uma ou duas parcelas;
- Evento da parcela única, adiantamento ou pagamento final;
- Percentual do adiantamento, quando dividido;
- Situação;
- Versão;
- Ação de encerrar informando a última competência devida.

Regras visíveis:

- Complementos diferentes podem coexistir;
- Versões do mesmo complemento não podem se sobrepor;
- O valor é integral na competência e não sofre proporcionalidade diária;
- Alteração no mês vale para a competência inteira;
- Complemento criado depois do adiantamento pago migra para o pagamento final;
- Se o pagamento final já tiver ocorrido, a diferença segue para ajuste positivo.

O cenário de revisão `Novo complemento recorrente` exibirá todos os campos condicionais. Ao escolher parcela única, o percentual desaparece e o evento torna-se obrigatório; ao escolher duas parcelas, o percentual torna-se obrigatório e deve ser maior que 0% e menor que 100%.

Complemento avulso:

- Não é criado em C04;
- Abre a competência correspondente em K05.

## 11.7 Salário redondo

- C04 mantém o marcador e suas competências inicial e final;
- Os valores reais ou confirmação de zero pertencem a cada evento em K05;
- O marcador não calcula tributos, não arredonda valores e não cria reembolso sozinho.

---

# 12. C05 — Empregado: competências e pagamentos

## 12.1 Finalidade

Apresentar o histórico financeiro do empregado desde a competência de corte, sem criar uma segunda central de pagamentos.

## 12.2 Conteúdo

- Competência;
- Situação;
- Eventos;
- Grupos autorizados;
- Valores autorizados;
- Ajustes;
- Datas.

## 12.3 Saídas

- K05;
- F02;
- F05;
- R02.

Abrir um recibo em C05 direciona a R02 já com empresa, empregado, competência, evento, grupo e documento preservados. A rota continua condicionada às permissões atuais de recibo e download.

As operações completas serão validadas nos Lotes 3 e 4.

---

# 13. C06 — Empregado: ASOs

## 13.1 Conteúdo contextual

- Pendência;
- Tipo esperado;
- Prazo;
- Acompanhamento;
- Último exame autorizado;
- Data;
- Clínica;
- Resultado autorizado.

## 13.2 Limites deste lote

Não mostrar:

- Arquivo do ASO;
- Imagem;
- Diagnóstico;
- CID;
- Médico;
- Descrição da restrição.

O fluxo completo será validado no Lote 6.

---

# 14. C07 — Empregado: recibos

## 14.1 Conteúdo contextual

- Número;
- Versão;
- Tipo;
- Evento;
- Competência;
- Valor autorizado;
- Situação;
- Ações autorizadas.

## 14.2 Situações

- Prévia;
- Definitivo vigente;
- Cancelado;
- Substituído;
- Substituto vigente;
- Arquivo indisponível.

O fluxo completo será validado no Lote 4.

---

# 15. C08 — Empregado: histórico

## 15.1 Fonte

C08 é uma visão filtrada da auditoria única e imutável.

Não existe um histórico paralelo.

## 15.2 Filtros

- Período;
- Dados pessoais;
- Vínculo;
- Finanças;
- Pagamentos;
- Desligamento;
- ASO;
- Recibos.

## 15.3 Permissão

Para visualizar antes e depois:

- O usuário precisa da permissão de histórico;
- O usuário também precisa da permissão atual do campo.

Campo oculto:

- Exibe apenas Campo restrito alterado;
- Não mostra o nome do campo;
- Não mostra valor anterior;
- Não mostra valor posterior;
- Não mostra detalhe que permita dedução.

---

# 16. M01 — Novo MEI e contrato

## 16.1 Organização

Fluxo guiado:

1. CNPJ;
2. Cadastro empresarial;
3. Contrato;
4. Revisão.

## 16.2 Etapa CNPJ

### CNPJ novo

- Validar;
- Pesquisar somente na empresa ativa;
- Autorizar novo prestador.

### Prestador existente

- Reutilizar o cadastro;
- Criar contrato sem sobreposição;
- Preservar contratos anteriores.

### Contrato ativo ou sobreposto

- Bloquear;
- Oferecer acesso ao contrato existente;
- Não revelar dados de outra empresa.

## 16.3 Cadastro empresarial

- CNPJ obrigatório;
- Razão social obrigatória;
- Nome fantasia obrigatório;
- Endereço completo obrigatório;
- Telefone opcional;
- E-mail opcional.

Telefone e e-mail continuam protegidos como dados pessoais.

## 16.4 Contrato

- Empresa derivada;
- Data inicial obrigatória;
- Data final prevista obrigatória;
- Valor contratual mensal obrigatório e maior que zero;
- Uma ou duas parcelas;
- Evento da parcela única;
- Percentual do adiantamento contratual quando dividido.

Regras de datas e parcelas:

- Data final prevista é inclusiva e não pode anteceder a inicial;
- Contratos do mesmo prestador na empresa não podem se sobrepor;
- Em duas parcelas, o percentual deve ser maior que 0% e menor que 100%;
- Início até o dia 15, inclusive, pode gerar adiantamento contratual;
- Início a partir do dia 16 não gera adiantamento na primeira competência: toda a base proporcional devida vai ao pagamento final.

## 16.5 Campos que não existem

- Salário-base;
- Holerite;
- RA;
- Salário redondo;
- Complemento trabalhista;
- ASO;
- Rescisão trabalhista;
- Número da nota fiscal;
- Data da nota fiscal;
- Arquivo de nota fiscal.

---

# 17. M02 — MEI: visão geral

## 17.1 Conteúdo

- Nome fantasia;
- Razão social;
- CNPJ autorizado;
- Contato autorizado;
- Endereço autorizado;
- Contrato atual;
- Situação;
- Próximo evento;
- Abas.

## 17.2 Situações

- Futuro;
- Ativo;
- Renovação programada;
- Encerramento programado;
- Encerrado.

Não existe botão livre para inativar. A situação deriva do contrato.

Cenários representados separadamente:

- Contrato futuro, antes da data inicial;
- Contrato ativo;
- Renovação programada, com próxima vigência já confirmada;
- Encerramento programado, mantendo o contrato ativo até a data final inclusiva;
- Encerrado pelo término previsto sem renovação;
- Encerrado antecipadamente pela data efetiva.

Empresa inativa somente ativa o modo histórico e bloqueia edição; não transforma automaticamente contrato ativo em encerrado.

---

# 18. M03 — Contrato, vigências e renovação

## 18.1 Conteúdo

- Contrato atual;
- Datas previstas e efetivas;
- Valor;
- Parcelas;
- Linha do tempo;
- Próximo evento;
- Próxima vigência.

## 18.2 Renovação contínua

- Pode ser programada antes do término;
- Começa no dia seguinte;
- Copia as condições atuais para revisão;
- Preserva o histórico;
- Não reaplica o corte do dia 15;
- Não cria inativação entre vigências.

`Editar próxima vigência` só aparece quando existir renovação programada. Antes disso, a ação disponível é `Programar renovação`.

## 18.3 Retorno após interrupção

- Cria novo contrato;
- Não é renovação do contrato contínuo;
- Não pode sobrepor contrato anterior;
- A ação somente fica disponível depois do encerramento efetivo e da existência de uma interrupção;
- Enquanto o contrato atual estiver ativo, a ação permanece indisponível com explicação objetiva.

## 18.4 Mudança de valor

Quando a renovação muda o valor no meio da competência:

- Cada vigência usa seu intervalo D30;
- Intervalos não se sobrepõem;
- A soma não ultrapassa 30 dias.

## 18.5 Datas previstas e efetivas

- Data final prevista alimenta alerta e renovação;
- Encerramento efetivo registra uma saída antecipada ou confirmada;
- Os campos não são fundidos em uma única data;
- Sem renovação, o contrato encerra ao final da data prevista inclusiva;
- Primeira e última competências consideram o intervalo efetivamente ativo.

---

# 19. M04 — MEI: competências e pagamentos

## 19.1 Conteúdo

- Competência;
- Base contratual;
- Proporcionalidade;
- Adiantamento;
- Pagamento final;
- Serviços adicionais;
- Ajustes;
- Situação;
- Datas.

## 19.2 Regras visíveis

- Primeiro e último mês usam D30;
- Mês intermediário usa valor integral;
- Adiantamento efetivamente pago é deduzido do final;
- A partir do dia 16, não existe adiantamento na primeira competência e toda a base proporcional devida vai ao pagamento final;
- Serviço adicional é avulso;
- Serviço adicional é integral;
- Serviço adicional existe somente na competência;
- Serviço adicional pertence apenas ao pagamento final.

Exemplo de primeira competência proporcional:

```text
Contrato iniciado em 10/09/2026
D30(10/09, 30/09) = 21 dias
Base MEI = R$ 3.000,00 ÷ 30 × 21 = R$ 2.100,00
```

Como o dia 10 está dentro do corte inclusivo, pode haver adiantamento conforme o percentual contratual. Para início em 16/09, D30 resulta em 15 dias e toda a base proporcional segue ao pagamento final.

Na última competência, o sistema deduz somente o adiantamento efetivamente pago da mesma base. Se esse pagamento superar a base proporcional final, o pagamento final fica zero e a diferença é absorvida.

## 19.3 Limite

M04 é contextual. A confirmação acontece no módulo Competências e Pagamentos.

Saídas autorizadas:

- K05 para o participante MEI;
- F02 para os grupos do evento;
- F05 para ajustes financeiros do contrato;
- R02 para recibo relacionado, quando houver documento autorizado.

---

# 20. M05 — MEI: recibos

Conteúdo contextual:

- Número e versão;
- Adiantamento contratual;
- Pagamento final;
- Serviço adicional detalhado;
- Ajuste;
- Situação;
- Download autorizado.

O fluxo completo será validado no Lote 4.

---

# 21. M06 — MEI: histórico

Categorias:

- Cadastro;
- Contratos;
- Vigências;
- Pagamentos;
- Recibos;
- Encerramentos.

M06 usa a mesma fonte única da auditoria.

Valores e contatos seguem as permissões atuais.

---

# 22. Permissões por campo

## 22.1 Oculto

- Campo não chega à tela;
- Coluna não aparece;
- Campo não entra na busca;
- Campo não entra em filtro ou ordenação;
- Campo não entra em total;
- Campo não entra na exportação;
- Histórico não revela nome ou valor.

## 22.2 Mascarado

Padrões visuais propostos:

- CPF: ***.***.***-45;
- CNPJ: **.***.***/****-61;
- Telefone: (**) *****-1234;
- E-mail: j***@exemplo.com;
- Endereço: Endereço protegido;
- Valor financeiro: Valor protegido.

O mascaramento ocorre antes de o dado chegar ao navegador.

## 22.3 Visível sem edição

- Valor integral autorizado;
- Controle somente leitura;
- Servidor rejeita alteração direta.

## 22.4 Visível e editável

- Edição aparece quando a situação permite;
- Validações são repetidas no servidor;
- Alteração gera auditoria.

## 22.5 Totais derivados

O total acordado é omitido quando permitir deduzir salário-base ou RA restrita.

---

# 23. Estados transversais

| Estado | Comportamento |
|---|---|
| Sem registros | Mostrar orientação e ação somente se autorizada |
| Filtro sem resultado | Oferecer Limpar filtros |
| Carregando | Não reapresentar o registro anterior |
| Processando | Bloquear controles e repetição |
| Validação | Preservar dados permitidos e indicar os campos |
| Conflito de versão | Bloquear sobrescrita e pedir atualização |
| Sem permissão | Não revelar conteúdo |
| Aba de empresa anterior | Limpar conteúdo e orientar reabertura |
| Registro não encontrado | Resposta igual para inexistente ou outro CNPJ |
| Empresa inativa | Modo histórico e somente leitura |
| Alterações não salvas | Confirmar descarte antes de sair |
| Falha segura | Nada é concluído sem auditoria |

## 23.1 Alterações não salvas

Ao tentar trocar de aba, voltar à lista, abrir outro registro, trocar empresa, sair ou usar o botão Voltar do navegador:

- A tela informa que existem alterações não salvas;
- `Continuar editando` mantém o usuário no formulário e preserva os dados;
- `Descartar alterações` abandona somente a edição local e conclui a navegação solicitada;
- A troca de empresa, quando confirmada, elimina o contexto de retorno da empresa anterior;
- Expiração, revogação ou encerramento de sessão limpa os dados sensíveis e não oferece restauração automática;
- Depois de novo login, nenhuma operação pendente é reenviada automaticamente.

Enquanto uma gravação estiver processando, a navegação crítica permanece bloqueada até o sistema confirmar o resultado ou consultar o estado atual da operação.

---

# 24. Matriz de navegação

| Origem | Ação | Destino |
|---|---|---|
| P01 ou menu | Abrir Colaboradores | C01 |
| C01 | Novo empregado | C02 |
| C01 | Abrir empregado | C03 |
| C01 | Abrir desligamentos programados do empregado | D01 futuro |
| C01 | Novo MEI | M01 |
| C01 | Abrir MEI | M02 |
| C02 | Salvar vínculo com pendência | C03 |
| C02 | Concluir cadastro | C03 |
| C03 | Condições financeiras | C04 |
| C03 | Competências | C05 |
| C03 | ASOs | C06 |
| C03 | Recibos | C07 |
| C03 | Histórico | C08 |
| C03 | Registrar desligamento | D02 futuro |
| C04 | Complemento avulso | K05 futuro |
| C04 | Corrigir evento pago | F04 futuro |
| C05 | Abrir participante ou grupo | K05, F02 ou F05 futuros |
| C05 | Abrir recibo relacionado | R02 futuro |
| C06 | Abrir ASO | S02 a S04 futuros |
| C07 | Abrir recibo | R02 futuro |
| C08 | Abrir evento | H03 futuro |
| M01 | Salvar MEI e contrato | M02 |
| M02 | Abrir contrato | M03 |
| M02 | Abrir competências | M04 |
| M02 | Abrir recibos | M05 |
| M02 | Abrir histórico | M06 |
| M03 | Abrir competência afetada | M04 ou correção futura |
| M04 | Abrir participante ou grupo | K05, F02 ou F05 futuros |
| M04 | Abrir ajuste financeiro | F05 futuro |
| M04 | Abrir recibo relacionado | R02 futuro |
| M05 | Abrir recibo | R02 futuro |
| M06 | Abrir evento | H03 futuro |

## 24.1 Proteção das rotas

- Toda rota valida sessão, empresa ativa, tipo de registro, identificador, tela, ação e campos autorizados;
- C01→D01 preserva empresa e filtros, mas D01 reaplica a permissão de desligamento;
- C05→R02 preserva empregado, competência e recibo, mas R02 reaplica as permissões de documento e download;
- M04→F05 preserva contrato, competência e ajuste, mas F05 reaplica as permissões financeiras;
- M04→R02 preserva contrato, competência e recibo, mas R02 reaplica separadamente as permissões de visualizar, baixar e reimprimir;
- Botão oculto não substitui a validação no servidor;
- URL de outro CNPJ responde apenas como registro não encontrado;
- Aba comprovadamente pertencente ao contexto empresarial anterior limpa o conteúdo e exige reabertura;
- Troca de empresa invalida retorno, ação pendente, exportação e download do contexto anterior;
- Voltar de uma rota autorizada restaura os filtros e a página somente se a empresa continuar ativa na sessão.

---

# 25. Critérios de aceite do Lote 2

## 25.1 Lista e contexto

- [ ] C01 reúne Empregado e MEI com tipo explícito;
- [ ] Cada linha representa um vínculo ou contrato;
- [ ] Ativos aparecem por padrão;
- [ ] Inativos e encerrados dependem de filtro;
- [ ] Eventos programados distingue desligamentos de empregado de renovações e encerramentos MEI;
- [ ] Vínculo ou contrato apenas futuro continua disponível pelo filtro de situação;
- [ ] Lista é paginada;
- [ ] Empresa e CNPJ ativos permanecem visíveis;
- [ ] Voltar restaura filtros, ordenação e página;
- [ ] Trocar empresa limpa todo o contexto;
- [ ] Tipo sem permissão não aparece nem entra na quantidade.

## 25.2 Empregado

- [ ] CPF duplicado não cria outra pessoa;
- [ ] Vínculo ativo ou sobreposto bloqueia cadastro;
- [ ] Recontratação reutiliza a pessoa e cria vínculo novo;
- [ ] Condições financeiras não são copiadas na recontratação;
- [ ] Endereço completo é obrigatório;
- [ ] Falha do CEP permite preenchimento manual;
- [ ] Início e admissão são datas distintas;
- [ ] Desligamento sem registro e demissão formal permanecem datas distintas e mutuamente exclusivas;
- [ ] Admissão não antecede o início;
- [ ] Situação deriva das datas;
- [ ] Data final é inclusiva e a inativação ocorre no dia seguinte;
- [ ] Sem admissão, RA ainda pode existir;
- [ ] Salário-base só aparece quando aplicável;
- [ ] Registrar admissão posteriormente informa salário-base, preserva ou versiona RA e encerra o período sem registro no dia anterior;
- [ ] Admissão posterior recalcula apenas evento aberto e direciona a F04 quando já houver pagamento ou fechamento;
- [ ] Total acordado é somente leitura;
- [ ] Base sem registro não inclui RA ou complemento;
- [ ] O exemplo de R$ 3.000,00 usa base própria de R$ 2.000,00 e RA de R$ 1.000,00, sem duplicidade;
- [ ] Dia 15 é inclusivo; oficial usa admissão e RA, complemento e período sem registro usam início das atividades;
- [ ] RA positiva exige competência inicial;
- [ ] Salário redondo possui vigência e não calcula tributos;
- [ ] Complemento recorrente apresenta todos os campos e condições de parcela;
- [ ] Complemento avulso abre a competência;
- [ ] Evento pago direciona à correção;
- [ ] Não existe inativação manual do empregado.

## 25.3 MEI

- [ ] CNPJ existente reutiliza o prestador;
- [ ] Contrato sobreposto é bloqueado;
- [ ] Endereço completo é obrigatório;
- [ ] Telefone e e-mail são opcionais;
- [ ] Cadastro não possui campos trabalhistas;
- [ ] Cadastro não possui controle de nota fiscal;
- [ ] Valor usa a expressão contratual;
- [ ] Situação deriva do contrato;
- [ ] Renovação pode ser programada antes do fim;
- [ ] Renovação contínua começa no dia seguinte;
- [ ] Renovação contínua não reaplica o corte;
- [ ] Retorno depois de interrupção cria novo contrato;
- [ ] Criar contrato depois de interrupção não fica disponível enquanto o contrato atual estiver ativo;
- [ ] Editar próxima vigência só aparece quando existir renovação programada;
- [ ] Empresa inativa não altera artificialmente a situação do contrato;
- [ ] Dia 15 é inclusivo e início a partir do dia 16 leva toda a base proporcional ao pagamento final;
- [ ] O cenário D30 utiliza um intervalo realmente proporcional;
- [ ] Serviço adicional existe somente na competência e no final;
- [ ] Não existe inativação manual do MEI.

## 25.4 Permissões e segurança

- [ ] Campo oculto não aparece nem pode ser inferido;
- [ ] Campo mascarado nunca chega integralmente ao navegador;
- [ ] Pesquisa por documento integral exige permissão integral;
- [ ] Campo somente leitura é rejeitado no servidor se enviado diretamente;
- [ ] Total derivado restrito é omitido;
- [ ] Perfil sem todos os campos obrigatórios não recebe ação de criar;
- [ ] Campo mascarado não é apresentado como valor editável capaz de sobrescrever o original;
- [ ] Perfil sem financeiro não inicia M01 quando não puder informar o contrato obrigatório;
- [ ] Permissão de visualizar recibo não concede automaticamente baixar;
- [ ] Permissão de baixar recibo não concede automaticamente reimprimir;
- [ ] Permissão de reimprimir recibo não concede automaticamente baixar;
- [ ] Aba, ação ou rota não autorizada permanece indisponível mesmo por URL direta;
- [ ] Perfil alterado produz efeito imediato;
- [ ] URL de outro CNPJ responde apenas como não encontrado;
- [ ] Aba antiga não lê, salva, exporta ou baixa;
- [ ] Carregamento é neutro;
- [ ] Processamento impede repetição;
- [ ] Edição antiga não sobrescreve versão recente;
- [ ] Alteração e auditoria concluem juntas.
- [ ] Alteração não salva exige escolha entre continuar editando e descartar antes da navegação;

## 25.5 Abas contextuais

- [ ] C05 e M04 não viram centrais paralelas;
- [ ] C06 não antecipa dados clínicos ou arquivos;
- [ ] C07 e M05 preservam as versões;
- [ ] C08 e M06 usam a fonte única de auditoria;
- [ ] Destinos de outros lotes mantêm empresa e registro;
- [ ] C01→D01 reaplica permissão de desligamento;
- [ ] C05→R02 reaplica permissão de recibo e download;
- [ ] M04→F05 reaplica permissão financeira;
- [ ] M04→R02 reaplica separadamente visualizar, baixar e reimprimir recibo;
- [ ] Nenhuma ação financeira é confirmada diretamente neste lote.

## 25.6 Exportação

- [ ] A prévia mostra, separadamente por aba, somente empresa, filtros, colunas e quantidade autorizadas;
- [ ] As colunas de Empregados variam conforme documento, endereço, salário-base, remuneração adicional, total derivado e demais condições autorizadas;
- [ ] As colunas de MEIs variam conforme documento, cadastro empresarial, datas, valor contratual e condições autorizadas;
- [ ] CPF e CNPJ são exportados como texto;
- [ ] Textos potencialmente executáveis são neutralizados como fórmula;
- [ ] Campos ocultos são omitidos e campos mascarados permanecem mascarados;
- [ ] Pedido e download revalidam sessão, solicitante, empresa e permissão;
- [ ] Troca de empresa ou perda de acesso invalida o uso do arquivo naquela sessão;
- [ ] Solicitação, conclusão, falha e download geram auditoria;
- [ ] Arquivo vazio não é criado.

## 25.7 Usabilidade

- [ ] Formulários possuem blocos lógicos;
- [ ] Erro aparece no resumo e junto ao campo;
- [ ] Dados preenchidos são preservados após validação;
- [ ] Controles possuem rótulos;
- [ ] Navegação funciona por teclado;
- [ ] Tabelas possuem cabeçalhos;
- [ ] Layout reorganiza até 320 px;
- [ ] Significado não depende apenas de cor;
- [ ] Datas e valores usam padrão brasileiro.
- [ ] Estado técnico, cenário do registro e acesso simulado podem ser revisados separadamente.

---

# 26. Decisões aprovadas pelo usuário

1. Manter uma única lista C01 para Empregado e MEI;
2. Representar uma linha por vínculo de empregado ou contrato MEI;
3. Usar duas ações diretas, Novo empregado e Novo MEI;
4. Manter C02 como fluxo guiado de cinco etapas;
5. Permitir salvar o vínculo com condições financeiras pendentes;
6. Manter C03 a C08 como abas de um único detalhe;
7. Manter M01 como fluxo guiado de quatro etapas;
8. Manter M02 a M06 como abas de um único detalhe;
9. Tornar a data final prevista do contrato MEI obrigatória no MVP;
10. Quando o período sem registro for dividido, usar o percentual de adiantamento aplicável ao empregado naquela competência;
11. Usar a aba `Eventos programados` para agrupar desligamentos programados do empregado e renovações ou encerramentos programados do MEI, mantendo tipo e evento explícitos;
12. Usar um seletor de cenário separado do estado técnico da tela;
13. Usar os padrões de mascaramento descritos na seção 22;
14. Restringir pesquisa por documento quando o documento não estiver integralmente visível;
15. Ocultar a ação de criar quando o perfil não puder editar todos os campos obrigatórios do fluxo;
16. Manter C05, C06, C07, C08, M04, M05 e M06 apenas como entradas contextuais;
17. Não criar menu ou tela central de exportações;
18. Não criar tela independente de desligamento ou recibos neste lote;
19. Não criar inativação manual de empregado ou MEI;
20. Não antecipar confirmações financeiras neste lote;
21. Proteger as rotas contextuais C01→D01, C05→R02 e M04→F05 com nova validação de empresa, permissão e registro;
22. Preservar as quatro datas do empregado e separar datas previstas e efetivas do MEI.

---

# 27. Situação desta etapa

**Situação:** Lote 2 aprovado pelo usuário em 20/08/2026.  
**Decisões confirmadas:** data final prevista obrigatória do contrato MEI; percentual aplicável do empregado na divisão do período sem registro; agrupamento `Eventos programados`.  
**Etapa seguinte:** Lote 3 — estrutura unificada de Competências e Pagamentos, K01 a K07 e F01 a F03.
