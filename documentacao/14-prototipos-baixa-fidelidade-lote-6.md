# Documento 14

## Protótipos de Baixa Fidelidade — Lote 6

**Sistema:** Portal interno multiempresa de Departamento Pessoal  
**Lote:** 6 — ASO, clínicas, pendências, prazos e alertas  
**Situação:** aprovado integralmente pelo usuário  
**Data de elaboração:** 20/08/2026  
**Data de aprovação:** 21/08/2026  
**Telas:** S01 a S06

---

# 1. Objetivo

Este lote transforma as regras já aprovadas de saúde ocupacional em um fluxo operacional único para:

- acompanhar necessidades de ASO;
- registrar exames realizados sem armazenar o documento físico;
- controlar vencimentos e pendências;
- registrar não comparecimento sem fabricar exame ou resultado;
- encerrar pendência demissional sem realização, somente com autorização e justificativa;
- preservar retificações como novas versões;
- administrar o catálogo global de clínicas compartilhado entre os CNPJs;
- gerar alertas internos sem revelar resultado clínico;
- permitir exportação contextual com os campos autorizados;
- manter histórico e auditoria na fonte única do sistema.

O sistema continua sendo um controle informativo interno. Ele não substitui o PCMSO, a clínica, o ASO físico nem a orientação jurídica e ocupacional da empresa.

---

# 2. Fontes consolidadas

Este documento consolida:

- Documento 07, especialmente as seções 7, 24, 25, 26, 27, 28, 30 e 32;
- Documento 08, especialmente S01 a S06, fluxo 15.10 e matriz de rotas;
- entradas contextuais de ASO já aprovadas no Lote 2;
- ligação demissional já aprovada no Lote 5;
- decisões do usuário sobre clínica compartilhada, alerta de 30 dias, vencimento sugerido de 12 meses, ausência de arquivo e ausência de descrição clínica.

A verificação regulatória utilizada nesta etapa foi limitada à estrutura de proteção e minimização. Como resultado e aptidão são dados referentes à saúde, o projeto os trata como dados sensíveis e exige autorização específica. Isso não altera as regras operacionais já aprovadas.

---

# 3. Escopo do Lote 6

## 3.1 Incluído

- S01 — Central de ASO;
- S02 — Acompanhamento de ASO;
- S03 — Registrar exame realizado ou retificar exame vigente;
- S04 — Detalhe, resultado autorizado e versões do ASO;
- S05 — Catálogo global de clínicas;
- S06 — Cadastro e detalhe da clínica;
- alertas derivados dentro do módulo;
- entradas e retornos pelo painel, colaborador, desligamento e notificações;
- exportação de ASOs e clínicas em suas próprias telas;
- histórico contextual e auditoria dos eventos sensíveis.

## 3.2 Fora deste lote

- Central completa de notificações N01, prevista para o Lote 7;
- Auditoria geral H01 a H03, prevista para o Lote 7;
- Usuários e perfis U01 a U05, previstos para o Lote 7;
- Upload, PDF, imagem ou digitalização do ASO;
- Diagnóstico, CID ou descrição da restrição;
- Médico, CRM ou assinatura;
- Exames complementares;
- Grau de risco da empresa;
- Agenda com data, horário, local, observação, reagendamento ou cancelamento — registrada como melhoria futura `MF-01` no Documento Mestre;
- Lembretes externos ao colaborador por WhatsApp, e-mail ou SMS — registrados na mesma melhoria futura `MF-01`;
- Integração com clínica, eSocial ou aplicativo móvel;
- Dispensa demissional;
- Controle de férias ou ocorrências mensais.

## 3.3 Relação com o Lote 7

O Lote 6 cria e resolve as condições de origem. O Lote 7 apenas apresentará essas condições na central de notificações.

Marcar uma notificação como lida nunca resolverá um ASO. Somente a alteração da entidade de origem poderá resolver o alerta.

---

# 4. Mapa de telas

```text
Menu ASO
└── S01 — Central de ASO
    ├── Aba Pendências e acompanhamento
    │   └── S02 — Acompanhamento
    │       └── S03 — Registrar exame realizado
    ├── Aba Exames realizados
    │   └── S04 — Detalhe e versões
    │       ├── S03 — Retificar exame vigente
    │       ├── Empregado — aba ASO
    │       ├── Histórico contextual
    │       └── S06 — Retrato e clínica global
    ├── Exportar ASOs
    └── S05 — Clínicas compartilhadas
        └── S06 — Cadastro ou detalhe da clínica
```

Entradas contextuais adicionais:

- Painel da empresa → S01 com filtro aplicado;
- Colaborador → S02 ou S04;
- Desligamento formal → S02 da pendência demissional;
- Notificação futura → registro de origem em S01 ou S02;
- S03 → S06 para cadastrar clínica, quando autorizado;
- S06 → retorno à tela de origem com filtros e formulário preservados.

---

# 5. Conceitos obrigatoriamente separados

## 5.1 Acompanhamento

- Pendente;
- Agendado;
- Realizado;
- Não compareceu;
- Encerrado sem realização.

## 5.2 Resultado clínico

Existe somente para exame realizado:

- Apto;
- Apto com restrição;
- Inapto.

## 5.3 Prazo derivado

Existe quando o exame possui vencimento, independentemente de ele ser ou não a referência ativa de alerta:

- Vigente;
- Vencendo em até 30 dias;
- Vencido.

## 5.4 Elegibilidade do alerta

É calculada separadamente do prazo:

- Referência ativa;
- Informativo;
- Suprimido por vínculo inativo;
- Não aplicável.

Um exame pode continuar `Vencido` no histórico e, ao mesmo tempo, estar com alerta `Suprimido`. Somente a referência ativa do vínculo alimenta os indicadores e a central de notificações.

## 5.5 Restrição derivada

Existe somente para quem puder visualizar o resultado:

- Sem restrição;
- Com restrição.

`Com restrição` deriva exclusivamente de `Apto com restrição`. Nenhuma descrição é armazenada.

`Inapto` é um resultado próprio. Ele não é convertido em `Com restrição`; nesse caso, a restrição derivada aparece como `Não aplicável` somente para quem já puder ver o resultado.

## 5.6 Regras contra mistura

- `Não compareceu` não é resultado;
- `Encerrado sem realização` não é exame, ASO ou dispensa;
- `Agendado` não possui data ou clínica;
- Resultado não resolve sozinho uma pendência: o exame realizado e seu vínculo correto resolvem;
- Prazo é calculado pela data atual e não é salvo como texto fixo;
- Mudança diária de prazo não cria nova versão;
- Versão substituída não gera alerta;
- Resultado e restrição nunca aparecem no painel geral ou nas notificações.

---

# 6. Tipos de ASO

## 6.1 Admissional

- Um exame vigente por vínculo;
- O protótipo propõe exigir data de admissão formal antes do lançamento; essa regra ainda depende da aprovação expressa da seção 28;
- Novo vínculo por recontratação pode ter novo admissional;
- Segundo admissional do mesmo vínculo direciona à retificação;
- Data do exame é comparada com o início das atividades;
- Exame posterior ao início gera aviso de conferência, sem bloqueio automático.

## 6.2 Periódico

- Pode se repetir durante o vínculo;
- Cada realização é um novo exame;
- Corrigir o mesmo exame usa retificação;
- Somente o periódico vigente mais recente orienta o próximo alerta;
- Vencimento inicial é sugerido em 12 meses e pode ser alterado.

## 6.3 Retorno ao trabalho

- Criado manualmente;
- Pode haver várias ocorrências;
- Mesmo vínculo, tipo e data gera aviso de possível duplicidade;
- O sistema não deduz a necessidade por afastamentos, pois esse controle não existe no escopo.

## 6.4 Mudança de riscos ocupacionais

- Criado manualmente;
- Pode haver várias ocorrências;
- Mesmo vínculo, tipo e data gera aviso de possível duplicidade;
- Não existe cadastro de grau de risco ou descrição de risco neste sistema.

## 6.5 Demissional

- Um exame vigente por desligamento formal;
- Todo desligamento formal cria pendência;
- Desligamento sem registro não cria ASO demissional;
- Não existe dispensa;
- Exame demissional válido já vinculado faz a pendência nascer resolvida;
- Não comparecimento mantém a pendência ativa;
- Encerrar sem realização exige permissão, justificativa e confirmação crítica;
- ASO demissional não gera vencimento futuro;
- Pendência demissional não bloqueia pagamento ou fechamento financeiro.

---

# 7. Estados de prazo e alerta

Para a data operacional `hoje`:

```text
Vencido:
vencimento < hoje

Vencendo em até 30 dias:
hoje <= vencimento <= hoje + 30 dias corridos

Vigente:
vencimento > hoje + 30 dias corridos
```

Regras:

- O dia do vencimento ainda pertence a `Vencendo em até 30 dias`;
- No dia seguinte passa a `Vencido`;
- Uma condição ativa gera um único alerta lógico;
- A mudança de urgência atualiza o mesmo alerta;
- Não se cria outra notificação a cada dia;
- Demissional nunca entra nessa contagem;
- Vínculo inativo não recebe novo alerta periódico;
- Versão substituída não alerta;
- Um periódico novo substitui o anterior apenas como referência de alerta, sem apagar o exame anterior;
- Enquanto ainda não existir periódico, o protótipo usa o admissional vigente como referência inicial de alerta; essa proposta depende da aprovação expressa da seção 28;
- Retorno ao trabalho e mudança de riscos mantêm vencimento informativo, mas não substituem a referência de alerta;
- Prazo e elegibilidade do alerta são exibidos separadamente;
- Um vínculo possui no máximo uma referência ativa de alerta;
- Painel e notificação mostram somente quantidade, empregado autorizado, tipo, vencimento e prazo; nunca resultado ou restrição.

---

# 8. S01 — Central de ASO

## 8.1 Posição

S01 é a entrada do item lateral `ASO` e mantém a empresa ativa visível.

## 8.2 Abas

### Pendências e acompanhamento

Exibe necessidades ainda operacionais:

- Pendente;
- Agendado;
- Não compareceu;
- Demissional aguardando realização ou encerramento autorizado.

### Exames realizados

Exibe uma linha por exame na sua versão atual, inclusive quando invalidada. As versões históricas não são duplicadas na central: ficam em S04, acessível pela linha correspondente.

## 8.3 Indicadores

- Vencendo em 30 dias;
- Vencidos;
- Demissionais pendentes;
- Não comparecimentos ainda não encerrados.

Indicadores não mostram resultado clínico. Um indicador sem permissão é omitido, não exibido com zero.

## 8.4 Filtros

- Empregado ou identificador;
- Tipo;
- Acompanhamento;
- Prazo;
- Clínica;
- Período do exame;
- Período do vencimento;
- Resultado, somente no modo sensível autorizado;
- Restrição derivada, somente no modo sensível autorizado.

## 8.5 Colunas — acompanhamento

- Empregado e vínculo;
- Tipo;
- Origem da pendência;
- Acompanhamento;
- Data de referência;
- Ações autorizadas.

## 8.6 Colunas — exames realizados

- Empregado e vínculo;
- Tipo;
- Clínica;
- Data do exame;
- Vencimento;
- Prazo;
- Versão;
- Resultado e restrição somente quando o modo sensível estiver autorizado e ativado;
- Ações autorizadas.

## 8.7 Modo sensível

Por padrão, S01 não mostra resultado nem restrição. Usuário com permissão específica pode ativar `Mostrar resultados clínicos`.

Ao ativar:

- o servidor revalida empresa e permissão;
- resultado, filtro e restrição passam a ser enviados;
- um evento de acesso sensível é registrado por consulta ou página, não por linha;
- mudar filtro ou página cria nova consulta auditada;
- desativar remove imediatamente os campos da tela;
- revogação da permissão remove os campos na próxima resposta;
- URL, breadcrumb, contador e mensagem continuam sem resultado.

## 8.8 Ações

- Abrir acompanhamento;
- Registrar exame realizado;
- Abrir detalhe e versões;
- Acessar clínicas, com permissão global;
- Exportar ASOs conforme filtros e campos autorizados.

## 8.9 Ordenação recomendada

Na aba de pendências:

1. Demissional pendente;
2. Não compareceu;
3. Pendente;
4. Agendado;
5. Empregado e data de origem.

Na aba de exames:

1. Vencido;
2. Vencendo em até 30 dias;
3. Vigente;
4. Data de exame mais recente.

---

# 9. S02 — Acompanhamento de ASO

## 9.1 Conteúdo

- Empresa ativa;
- Empregado e vínculo;
- Tipo;
- Origem da necessidade;
- Estado atual;
- Ligação com desligamento formal, quando demissional;
- Linha do tempo operacional;
- Exame realizado ou encerramento relacionado, quando existir;
- Histórico contextual autorizado.

## 9.2 Transições

```text
Pendente -> Agendado
Agendado -> Não compareceu
Não compareceu -> Agendado
Pendente/Agendado/Não compareceu -> Realizado, após S03
Pendente/Agendado/Não compareceu -> Encerrado sem realização,
somente para demissional e com autorização
Pendente/Agendado/Não compareceu -> Cancelado,
somente para acompanhamento manual, com autorização e justificativa
```

## 9.3 Agendado

`Agendado` é apenas um estado operacional. Não cria:

- data;
- horário;
- clínica;
- observação;
- comprovante;
- histórico de reagendamento.

A linha do tempo registra somente a transição, usuário e momento.

## 9.4 Não compareceu

- Não exige resultado;
- Não cria exame;
- Não resolve pendência demissional;
- Pode voltar a `Agendado`;
- Pode ser encerrado sem realização somente com a permissão específica, no caso demissional;
- Permanece visível nos acessos pelo colaborador, desligamento e S01.

## 9.5 Encerramento sem realização

Antes de confirmar, mostrar:

- empregado;
- vínculo e desligamento;
- estado atual;
- confirmação de que nenhum ASO ou resultado será criado;
- justificativa obrigatória;
- aviso de que a pendência deixará de ficar ativa;
- aviso de que o registro continuará no histórico.

A ação não é denominada `Dispensar exame`.

## 9.6 Cancelamento de acompanhamento manual

Quando a necessidade manual foi criada por engano ou deixou de existir, o protótipo propõe `Cancelar acompanhamento`:

- somente para origem manual;
- permissão específica;
- justificativa obrigatória;
- confirmação de que nenhum exame, resultado ou dispensa será criado;
- preservação de toda a linha do tempo;
- auditoria na mesma operação.

## 9.7 Programação cancelada

Quando um desligamento futuro é cancelado:

- a pendência demissional ativa é cancelada;
- versões históricas permanecem;
- nenhum ASO realizado é apagado;
- S02 abre somente em consulta histórica;
- nenhuma ação de agendar, não comparecer, realizar ou encerrar fica disponível.

---

# 10. S03 — Registrar exame realizado

## 10.1 Modos

- Novo exame;
- Concluir acompanhamento;
- Retificar exame vigente.

## 10.2 Campos

| Campo | Obrigatório | Regra |
|---|---:|---|
| Empresa | Derivada | Empresa ativa do vínculo. |
| Empregado e vínculo | Sim | Somente empregado; MEI não aparece. |
| Admissão formal | Derivada | Obrigatória no admissional se a proposta da seção 28 for aprovada. |
| Tipo | Sim | Um dos cinco tipos aprovados. |
| Desligamento formal | Condicional | Obrigatório no demissional. |
| Clínica | Sim | Clínica ativa no momento da confirmação. |
| Data do exame | Sim | Data real, válida e não futura. |
| Vencimento | Condicional | Sugerido em 12 meses quando monitorado e sempre editável. |
| Resultado | Sim | Apto, apto com restrição ou inapto. |

Em exame novo, `Resultado` sempre começa vazio e exige escolha consciente. Somente a retificação carrega o resultado da versão vigente, que permanece editável antes da criação da nova versão.

## 10.3 Campos inexistentes

Não há campo para:

- arquivo;
- diagnóstico ou CID;
- descrição de restrição;
- médico ou CRM;
- exame complementar;
- assinatura;
- grau de risco;
- observação clínica livre.

## 10.4 Vencimento sugerido

- É calculado a partir da data do exame;
- Pode ser alterado antes de salvar;
- Vencimento não pode ser anterior à data do exame;
- Demissional não recebe vencimento;
- A sugestão não substitui a confirmação do usuário.

## 10.5 Clínica

- Somente clínicas ativas aparecem na seleção;
- O usuário pode selecionar clínica sem possuir acesso ao catálogo global;
- Se possuir permissão global de criação, pode abrir S06 e voltar ao mesmo formulário;
- Ao salvar, o ASO preserva razão social, nome fantasia e CNPJ da clínica como snapshot;
- Alteração futura no catálogo não modifica o exame.

## 10.6 Duplicidade por tipo

### Admissional

Se já existir admissional vigente no mesmo vínculo:

- bloquear novo exame;
- mostrar o registro vigente;
- oferecer `Abrir e retificar` conforme permissão.

Enquanto se revisa este lote, o protótipo bloqueia o admissional sem admissão formal para demonstrar a proposta da seção 28. A data de início das atividades continua visível para a conferência temporal.

### Periódico

Novo exame cria novo registro. Não é tratado como duplicidade do anterior.

### Retorno e mudança de riscos

Mesmo tipo, vínculo e data:

- mostrar possível duplicidade;
- oferecer abertura do registro existente;
- permitir continuar como novo somente após confirmação explícita;
- não tomar decisão automática.

### Demissional

Se já existir demissional vigente para o mesmo desligamento:

- bloquear novo exame;
- oferecer `Abrir e retificar` conforme permissão.

## 10.7 Avisos de data

- Admissional posterior ao início das atividades: aviso de conferência, sem bloqueio;
- Demissional anterior à saída: aviso de conferência, sem decisão automática;
- Admissional anterior ou igual ao início das atividades: permitido;
- Periódico, retorno, mudança de riscos ou demissional anterior ao início das atividades: bloqueio;
- Data futura: bloqueio;
- Vínculo de outra empresa: responder como não encontrado.

## 10.8 Confirmação

Antes de salvar, repetir:

- empregado e vínculo;
- tipo;
- clínica;
- data do exame;
- vencimento, quando existir;
- resultado;
- acompanhamento que será resolvido;
- indicação `Nova versão`, quando retificação.

O resumo nunca transforma ausência de informação em confirmação. Imediatamente antes de gravar, o sistema revalida o vínculo e sua versão, a clínica ativa, o desligamento formal nos demissionais, as regras de duplicidade e o próprio formulário. Mudança em qualquer um desses pontos cancela a confirmação e devolve o usuário à revisão.

Duplo clique ou repetição após falha de conexão não pode criar dois exames ou versões.

---

# 11. S04 — Detalhe e versões do ASO

## 11.1 Conteúdo não clínico

- Empregado e vínculo;
- Tipo;
- Clínica utilizada no momento do exame;
- Data do exame;
- Vencimento;
- Prazo derivado;
- Acompanhamento relacionado;
- Versão vigente;
- Linha do tempo;
- Versões substituídas.

## 11.2 Resultado sensível

Resultado e restrição não aparecem automaticamente.

Usuário autorizado usa `Visualizar resultado clínico`. A ação:

- revalida sessão, empresa, registro e permissão;
- registra acesso sensível;
- revela somente resultado e restrição derivada;
- nunca revela descrição, diagnóstico ou documento;
- deixa de funcionar imediatamente após revogação da permissão.

## 11.3 Versões

- Retificar cria nova versão;
- Versão anterior permanece imutável;
- Uma versão é marcada como vigente;
- Somente a vigente gera prazo e alerta;
- Histórico permite comparar campos autorizados;
- Resultado anterior continua oculto sem permissão atual;
- Abertura de versão substituída não a torna vigente;
- Editar clínica global não reescreve o snapshot de nenhuma versão.

## 11.4 Retificação

Pode alterar campos informativos do mesmo exame, mas não pode transferir o ASO para outra empresa ou vínculo.

Se o exame tiver sido lançado para a pessoa errada, o sistema não moverá silenciosamente o registro. Esse caso seguirá uma correção administrativa específica a ser definida antes do desenvolvimento, preservando a trilha original.

## 11.5 Ações

- Visualizar resultado, quando autorizado;
- Retificar;
- Abrir empregado;
- Abrir clínica;
- Consultar histórico;
- Voltar à mesma página, aba, filtros e ordenação de S01.

---

# 12. S05 — Catálogo global de clínicas

## 12.1 Escopo

O catálogo é compartilhado entre os três CNPJs e não pertence à empresa ativa.

Permissão global de clínicas:

- não concede acesso a ASOs;
- não concede acesso a empregados;
- não revela quais empresas utilizaram a clínica;
- não mostra quantidade de exames ou empresas;
- não permite atravessar o isolamento empresarial.

## 12.2 Filtros

- Razão social ou nome fantasia;
- CNPJ;
- Situação ativa ou inativa.

## 12.3 Colunas

- Razão social;
- Nome fantasia;
- CNPJ;
- Situação;
- Data de cadastro;
- Última alteração;
- Ações autorizadas.

## 12.4 Ações

- Cadastrar;
- Abrir detalhe;
- Editar;
- Inativar;
- Exportar catálogo.

Não existe exclusão de clínica utilizada.

## 12.5 Exportação

A exportação contém somente dados cadastrais da clínica. Não inclui:

- empregados;
- ASOs;
- empresas;
- contagem de utilização;
- resultado clínico.

---

# 13. S06 — Cadastro e detalhe da clínica

## 13.1 Campos

| Campo | Obrigatório | Regra |
|---|---:|---|
| Razão social | Sim | Texto normalizado. |
| Nome fantasia | Sim | Texto normalizado. |
| CNPJ | Sim | Válido e único no catálogo global. |
| Situação | Automática | Ativa ao cadastrar; inativação é ação separada. |

## 13.2 Validações

- CNPJ estruturalmente válido;
- CNPJ único no catálogo global;
- Espaços externos removidos;
- Razão social e nome fantasia não podem conter somente espaços;
- Salvamento com versão antiga é bloqueado;
- Tentativa repetida não duplica clínica.

## 13.3 Edição

- Alterar cadastro exige permissão global;
- A tela avisa que exames anteriores preservam o snapshot antigo;
- Clínica inativa permanece consultável;
- Clínica inativa não aparece em nova seleção de exame;
- Clínica utilizada não pode ser excluída.

## 13.4 Inativação

Exige:

- permissão específica;
- resumo de impacto;
- confirmação explícita;
- justificativa;
- versão vigente;
- auditoria concluída na mesma operação.

A inativação não altera exames anteriores.

---

# 14. Integração com colaborador e desligamento

## 14.1 Aba ASO do empregado

Mostra, conforme permissão:

- pendências ativas;
- último exame por tipo;
- prazo do periódico de referência;
- histórico de exames;
- ação para abrir S02 ou S04;
- ação para registrar exame.

Resultado clínico continua sob permissão e abertura sensível.

## 14.2 Desligamento formal

- D02 cria pendência demissional ativa;
- D03 abre a mesma S02;
- ASO demissional vigente já vinculado resolve a pendência;
- não comparecimento mantém pendência;
- encerramento autorizado resolve a pendência sem criar exame;
- quitação financeira permanece independente.

Se a data ou a versão do desligamento for corrigida depois de existir ASO demissional, a ligação não será transferida silenciosamente. O vínculo anterior permanece histórico e uma ação explícita de conferência e religação será necessária, conforme proposta da seção 28.

## 14.3 Desligamento sem registro

Não cria pendência, exame ou ASO demissional.

## 14.4 MEI

MEI não aparece na busca de vínculo de S03 e não possui aba ASO.

---

# 15. Criação de acompanhamento manual

## 15.1 Origem

Além da pendência demissional automática, S01 oferece `Novo acompanhamento` para usuário autorizado.

O fluxo manual informa somente:

- empregado e vínculo;
- tipo esperado;
- origem `Necessidade manual`.

Tipos permitidos:

- Periódico;
- Retorno ao trabalho;
- Mudança de riscos ocupacionais.

Admissional normalmente é registrado diretamente como exame realizado. Demissional nasce exclusivamente do desligamento formal.

## 15.2 Resultado

- Cria S02 no estado `Pendente`;
- Não cria exame;
- Não cria resultado;
- Não exige clínica;
- Não cria vencimento por si só;
- Duplicidade aberta para o mesmo vínculo e tipo é avisada antes da confirmação;
- Pode ser cancelado com permissão e justificativa, se a proposta for aprovada;
- Repetição da mesma operação não cria duas pendências.

---

# 16. Permissões

## 16.1 Empresariais — ASO

Separar, no mínimo:

- Visualizar S01;
- Visualizar dados cadastrais do ASO;
- Visualizar resultado clínico;
- Visualizar restrição derivada;
- Criar acompanhamento manual;
- Marcar como agendado;
- Registrar não comparecimento;
- Voltar a agendado;
- Registrar exame realizado;
- Retificar exame;
- Invalidar lançamento incorreto, se a proposta for aprovada;
- Encerrar demissional sem realização;
- Cancelar acompanhamento manual, se a proposta for aprovada;
- Exportar ASOs;
- Consultar histórico contextual.

## 16.2 Globais — clínicas

Separar:

- Visualizar catálogo;
- Criar clínica;
- Editar clínica;
- Inativar clínica;
- Reativar clínica, se a proposta for aprovada;
- Exportar catálogo.

## 16.3 Campos

Estados continuam:

- Oculto;
- Mascarado;
- Visível sem edição;
- Visível e editável.

`Mascarado` é adequado ao CPF e a outros identificadores quando o perfil precisa reconhecer o registro sem receber o valor completo. Resultado clínico e restrição não usam máscara parcial: ficam inteiramente ocultos/protegidos quando o perfil não possui a permissão correspondente.

Regras:

- Campo oculto não chega ao navegador;
- Resultado oculto também desaparece de filtro, ordenação, total, histórico e Excel;
- Restrição derivada exige simultaneamente permissão atual para o resultado e permissão própria para a restrição;
- Registrar ou retificar exige edição de todos os campos obrigatórios;
- Selecionar uma clínica ativa em S03 não exige visualizar o catálogo global;
- Administrar clínicas não concede acesso a nenhum ASO;
- Encerrar sem realização não é concedido automaticamente com alterar acompanhamento;
- Retificar não é concedido automaticamente com criar exame;
- Exportar não é concedido automaticamente com visualizar.

## 16.4 Perfis usados no protótipo

| Perfil | Objetivo da revisão |
|---|---|
| Gestor ASO completo | Provar todo o fluxo empresarial e o acesso global autorizado. |
| Saúde ocupacional | Registrar, visualizar resultado e retificar, sem administrar clínicas. |
| Operacional sem resultado | Acompanhar pendências sem conhecer aptidão ou restrição. |
| Consulta cadastral | Ver datas, tipo, clínica e prazo sem alterar. |
| Clínicas global | Administrar somente o catálogo compartilhado. |
| Sem acesso | Provar recusa sem vazamento. |

---

# 17. Multiempresa e escopo global

## 17.1 ASO empresarial

- Todo acompanhamento e exame possui empresa obrigatória;
- Empresa é derivada do vínculo e da sessão;
- Servidor não confia em empresa enviada pela tela;
- Relações impedem clínica global de atravessar o vínculo empresarial;
- Link de outro CNPJ responde como não encontrado;
- Busca, total, filtro e duplicidade não revelam registro externo;
- Troca de empresa limpa formulário, filtros, resultado revelado e pilha de retorno;
- Empresa inativa permite somente consulta autorizada.

## 17.2 Clínica global

- Clínica não recebe `empresa_id` operacional;
- CNPJ é único no catálogo compartilhado;
- A permissão é global e independente dos perfis empresariais;
- Cabeçalho deve indicar `Escopo global`;
- A tela não lista utilização por empresa;
- Abrir S05 a partir de S03 preserva o caminho de retorno, mas não transfere dados empresariais para o catálogo.

## 17.3 Snapshot

O ASO empresarial preserva:

- identificador da clínica global;
- razão social usada;
- nome fantasia usado;
- CNPJ usado;
- versão ou momento do snapshot.

A permissão global revogada não impede a leitura do snapshot no exame quando o usuário ainda possui permissão empresarial para o ASO.

---

# 18. Exportações

## 18.1 ASO

Antes de gerar, mostrar:

- empresa ativa;
- aba de origem;
- filtros;
- intervalo;
- colunas autorizadas;
- quantidade estimada.

Campos possíveis:

- empregado e vínculo;
- CPF conforme permissão;
- tipo;
- clínica e CNPJ da clínica;
- data do exame;
- vencimento;
- prazo;
- acompanhamento;
- versão vigente ou substituída;
- resultado somente com permissão específica e confirmação sensível da exportação, conforme proposta da seção 28.

Não exportar:

- descrição de restrição;
- diagnóstico ou CID;
- médico ou CRM;
- arquivo;
- dado de outro CNPJ.

## 18.2 Clínicas

Exportação global contém:

- razão social;
- nome fantasia;
- CNPJ;
- situação;
- data de cadastro;
- última alteração.

Nunca contém uso, empresa, empregado ou ASO.

## 18.3 Segurança do arquivo

- Arquivo privado;
- Pertence ao solicitante;
- ASO empresarial fica vinculado à empresa ativa;
- Expira em 24 horas;
- Revogação de sessão ou permissão impede novo download;
- Cada download empresarial revalida solicitante, sessão, empresa atualmente selecionada, permissão de exportar e permissão atual de cada campo;
- Cada download do catálogo global de clínicas revalida solicitante, sessão e permissão global de exportar clínicas, sem depender da empresa selecionada;
- Conteúdo iniciado por `=`, `+`, `-` ou `@` é neutralizado para não executar como fórmula;
- Exportação vazia é recusada;
- Geração e download são auditados.

---

# 19. Histórico e auditoria

## 19.1 Fonte única

O histórico dentro do empregado, acompanhamento, ASO e clínica é apenas uma visão filtrada da mesma fonte imutável de auditoria.

## 19.2 Eventos obrigatórios

- Criação de acompanhamento;
- Marcação como agendado;
- Não comparecimento;
- Retorno a agendado;
- Encerramento sem realização e justificativa;
- Registro de exame;
- Retificação;
- Invalidação administrativa, se aprovada;
- Abertura de resultado sensível;
- Ativação do modo sensível de S01;
- Exportação;
- Criação, edição, inativação ou reativação de clínica;
- Tentativa negada ou cruzada;
- Conflito de versão.

## 19.3 Conteúdo

- Escopo global ou empresarial;
- Empresa, quando empresarial;
- Usuário;
- Data e hora;
- Entidade e identificador;
- Ação e resultado;
- Antes e depois;
- Justificativa;
- Versão;
- Referência da operação.

Resultado antes e depois somente aparece para quem também possuir a permissão clínica atual. Caso contrário, o histórico informa `campo restrito alterado`.

## 19.4 Eventos não necessários

- Atualização automática diária de prazo;
- Abertura comum de S01 sem modo sensível;
- Contagem do painel;
- Leitura de notificação sem resultado.

Falha obrigatória da auditoria reverte a alteração de negócio.

---

# 20. Proteção dos dados de saúde

- HTTPS obrigatório;
- Resultado clínico separado das permissões operacionais;
- Restrição derivada protegida como o resultado;
- API omite campos proibidos antes de responder;
- Logs técnicos não recebem CPF completo, resultado ou restrição;
- URL, título, breadcrumb e mensagem de erro não recebem resultado;
- Formulários não são gravados no armazenamento local do navegador;
- Resultado revelado é limpo ao trocar empresa, perder sessão ou permissão;
- Dados reais não são copiados para desenvolvimento ou teste;
- Banco, volumes, backups e exportações temporárias são cifrados em repouso;
- Respostas sensíveis e downloads temporários usam política de cache `no-store`;
- Auditoria de leitura sensível é obrigatória;
- Nenhum documento físico é armazenado.

O resultado é necessário para o controle aprovado, mas o sistema deliberadamente não coleta informações clínicas adicionais.

---

# 21. Concorrência, repetição e falhas

## 21.1 Versão

- S02, S03, S04 e S06 carregam versão;
- Salvar com versão antiga é recusado;
- Dados digitados podem ser preservados quando isso não expuser informação de outro contexto;
- Usuário deve atualizar e conferir novamente.

## 21.2 Idempotência

Obrigatória para:

- Criar acompanhamento;
- Marcar transição;
- Registrar exame;
- Retificar;
- Encerrar sem realização;
- Criar, editar ou inativar clínica;
- Solicitar exportação.

Duplo clique ou repetição após perda de resposta devolve o resultado já concluído.

## 21.3 Operação e auditoria

Alteração e auditoria são atômicas. Se uma delas falhar, nenhuma transição fica concluída.

## 21.4 Sessão e contexto

- Sessão expirada limpa dados sensíveis e formulários;
- Ação não é reenviada automaticamente após novo login;
- Trocar empresa com edição não salva exige confirmação;
- Trocar empresa invalida o formulário antigo;
- Permissão revogada invalida modal aberto;
- Link copiado só funciona com empresa e permissão atuais.

---

# 22. Estados gerais das telas

Cada tela relevante demonstra:

- Principal;
- Vazio sem registros;
- Filtro sem resultado;
- Carregando;
- Erro de validação;
- Conflito de edição;
- Processando;
- Sucesso;
- Acesso negado;
- Registro de outro CNPJ como não encontrado;
- Empresa inativa em consulta histórica;
- Clínica inativa;
- Versão substituída.

Regras de mensagem:

- Não exibir dado antigo durante erro de carregamento;
- Foco vai ao primeiro campo inválido;
- Processamento bloqueia repetição;
- Acesso negado não confirma existência;
- Estado vazio oferece ação somente quando o usuário puder executá-la;
- Resultado clínico não aparece na mensagem de erro.

---

# 23. Retenção e documentos físicos

- Registro informativo permanece por pelo menos seis anos;
- Não há exclusão automática na primeira versão;
- Versões e auditoria permanecem preservadas;
- Exportações temporárias expiram em 24 horas;
- Notificações resolvidas permanecem 90 dias na futura central;
- ASO físico permanece sob guarda adotada pela empresa e orientação jurídica;
- O sistema não afirma substituir a guarda física;
- Política de eliminação após o prazo mínimo será definida futuramente.

---

# 24. Desempenho e volume

Premissas existentes:

- Aproximadamente 65 empregados ativos;
- Cerca de 300 inativos históricos;
- Até 10 usuários simultâneos;
- Três CNPJs;
- Catálogo de clínicas pequeno e global.

Regras:

- Listas paginadas;
- Inativos não carregados por padrão, exceto quando necessários a demissionais e filtros explícitos;
- Índices por empresa, vínculo, tipo, acompanhamento, data do exame, vencimento e versão vigente;
- Alertas calculados por rotina simples;
- Sem atualização em tempo real;
- Pesquisa e filtros comuns com meta de até dois segundos;
- Exportação operacional com meta de até trinta segundos.

---

# 25. Dados iniciais na implantação

Na competência de corte serão cadastrados:

- Clínicas ativas e inativas necessárias ao histórico;
- Último ASO necessário ao controle atual por empregado ativo;
- Vencimento vigente;
- Resultado somente para usuários autorizados;
- Pendências demissionais ainda abertas.

Datas anteriores ao corte podem ser informadas sem produzir movimentação financeira retroativa.

Não haverá importação em massa na primeira implantação.

---

# 26. Matriz resumida de telas

| Tela | Origem | Saída | Acesso principal | Bloqueio específico |
|---|---|---|---|---|
| S01 | Menu, painel, colaborador | S02–S05 | Visualizar central | Resultado oculto sem permissão. |
| S02 | S01, colaborador, D03 | S03 ou origem | Alterar acompanhamento | Encerrar exige permissão e justificativa. |
| S03 | S01 ou S02 | S04 | Criar ou retificar exame | Duplicidade e campos obrigatórios. |
| S04 | S01 ou colaborador | S03, empregado, clínica, histórico | Ver detalhe | Resultado exige autorização e auditoria. |
| S05 | S01 ou administração global | S06 | Ver catálogo global | Não revela utilização. |
| S06 | S05, S03 ou S04 | Origem preservada | Criar, editar ou inativar | CNPJ duplicado ou versão antiga. |

---

# 27. Cenários obrigatórios de homologação

## 27.1 Central e prazo

- [ ] Central sem registros;
- [ ] Filtro sem resultado;
- [ ] Vencendo exatamente em 30 dias;
- [ ] Vencendo na data atual;
- [ ] Vencido no dia seguinte;
- [ ] Indicador abre lista filtrada;
- [ ] Demissional não entra no vencimento;
- [ ] Versão substituída não alerta;
- [ ] Vínculo inativo não recebe novo alerta periódico;
- [ ] Somente a referência aprovada alimenta o primeiro alerta;
- [ ] Prazo e elegibilidade do alerta aparecem como estados independentes;
- [ ] Periódico anterior permanece informativo sem duplicar o indicador;
- [ ] Lançamento invalidado não alimenta prazo ativo nem alerta.

## 27.2 Acompanhamento

- [ ] Pendência manual;
- [ ] Pendência demissional automática;
- [ ] Agendado sem campos de agenda;
- [ ] Não comparecimento sem exame ou resultado;
- [ ] Voltar a agendado preservando a linha do tempo;
- [ ] Realização resolve o acompanhamento;
- [ ] Encerramento demissional com permissão e justificativa;
- [ ] Encerramento negado sem permissão;
- [ ] Cancelamento de necessidade manual com permissão, justificativa e histórico;
- [ ] Duplicidade de necessidade manual ativa é impedida;
- [ ] Pendência não desaparece com o tempo;
- [ ] Cancelamento do desligamento preserva histórico e remove somente a pendência ativa;
- [ ] Entrada pelo colaborador ou desligamento retorna à mesma origem e contexto.

## 27.3 Exame e tipo

- [ ] MEI não aparece;
- [ ] Lançamento direto exige seleção de empregado e vínculo da empresa ativa;
- [ ] Admissional anterior ao início;
- [ ] Admissional posterior ao início gera aviso;
- [ ] Admissional sem admissão formal demonstra o bloqueio ainda sujeito à proposta 12;
- [ ] Segundo admissional direciona à retificação;
- [ ] Periódico novo preserva anteriores;
- [ ] Retorno com duplicidade exata;
- [ ] Mudança de riscos com duplicidade exata;
- [ ] Demissional ligado ao desligamento correto;
- [ ] Segundo demissional direciona à retificação;
- [ ] Demissional sem vencimento;
- [ ] Data futura bloqueada;
- [ ] Vencimento anterior ao exame bloqueado;
- [ ] Sugestão de 12 meses editável;
- [ ] Clínica inativa ausente da seleção;
- [ ] Confirmação repetida não duplica exame.

## 27.4 Versões

- [ ] Retificação cria nova versão;
- [ ] Versão anterior permanece somente leitura;
- [ ] Alerta passa somente à vigente;
- [ ] Clínica histórica preserva snapshot;
- [ ] Conflito não sobrescreve versão;
- [ ] Resultado anterior continua protegido pela permissão atual;
- [ ] Exame de empregado errado não é transferido por retificação comum;
- [ ] Invalidação preserva a versão, remove seus efeitos ativos e reabre o acompanhamento aplicável;
- [ ] Correção do desligamento relacionado exige conferência explícita e não religa automaticamente.

## 27.5 Clínicas

- [ ] CNPJ válido;
- [ ] CNPJ duplicado no catálogo global;
- [ ] Clínica utilizada não é excluída;
- [ ] Clínica inativa permanece no histórico;
- [ ] Inativação exige justificativa;
- [ ] Reativação exige permissão, justificativa, versão e auditoria;
- [ ] Alteração global não modifica ASO anterior;
- [ ] Usuário global não descobre empresas ou empregados;
- [ ] Retorno a S03 preserva o formulário;
- [ ] Exportação não inclui utilização.

## 27.6 Segurança

- [ ] Perfil sem resultado não recebe campo, filtro, total, histórico ou Excel;
- [ ] Resultado e restrição não aparecem no painel ou notificação;
- [ ] Ativação do modo sensível é auditada;
- [ ] Abertura do resultado em S04 é auditada;
- [ ] Permissão de resultado sem permissão de restrição não revela a restrição derivada;
- [ ] Permissão revogada bloqueia próxima consulta;
- [ ] Usuário da empresa A recebe `não encontrado` ao tentar ASO da B;
- [ ] Troca de empresa invalida S03 ou S04 aberto;
- [ ] Empresa inativa bloqueia mutações;
- [ ] Usuário de clínica global não recebe ASOs;
- [ ] Falha de auditoria impede a alteração;
- [ ] Exportação é privada, expira e neutraliza fórmulas;
- [ ] Download revalida sessão, empresa ativa e permissões atuais e usa cache `no-store`.

## 27.7 Usabilidade e acessibilidade

- [ ] Navegação por teclado;
- [ ] Foco no primeiro erro;
- [ ] Modais com título, resumo e confirmação;
- [ ] Tabelas contidas em tela estreita;
- [ ] Campos e ações empilham em 736, 360 e 320 pixels;
- [ ] Estado não depende somente de cor;
- [ ] Voltar restaura aba, página, filtros e ordenação;
- [ ] Processamento impede duplo envio.

---

# 28. Propostas aprovadas

O usuário aprovou expressamente em 21/08/2026 os seguintes refinamentos:

1. **Novo acompanhamento manual em S01:** permitir criar pendência para periódico, retorno e mudança de riscos sem criar exame fictício;
2. **Referência do primeiro alerta:** até existir o primeiro periódico, usar o admissional vigente como referência; depois, somente o periódico vigente mais recente; retorno, mudança de riscos e demissional não substituem essa referência;
3. **Cálculo de 12 meses:** adicionar doze meses de calendário; se o dia não existir no mês final, usar o último dia válido, como 29/02 → 28/02 no ano seguinte;
4. **Confirmação sensível:** em S01, resultado fica oculto por padrão e só aparece após ação explícita auditada por consulta ou página; na exportação, a inclusão do resultado exige uma confirmação sensível própria, além da permissão atual, sem depender de a coluna estar aberta na tela;
5. **Duplicidade de retorno e mudança:** permitir continuar como novo após aviso e confirmação explícita, sem decisão automática;
6. **Encerramento sem realização:** restringir exclusivamente à pendência demissional;
7. **Reativação de clínica:** permitir reativar clínica inativa com permissão global, justificativa, versão e auditoria;
8. **Erro de empregado ou vínculo:** proibir transferência por retificação e oferecer `Invalidar lançamento`, preservando registro e justificativa; depois, cadastrar o exame correto; a invalidação remove o exame da referência, do prazo ativo e dos alertas e reabre o acompanhamento relacionado quando ainda aplicável, inclusive o demissional;
9. **Linha do tempo do não comparecimento:** preservar cada ocorrência mesmo depois de novo agendamento, realização ou encerramento;
10. **Data futura:** bloquear exame marcado como realizado com data posterior à data operacional;
11. **Correção do desligamento relacionado:** nunca mover automaticamente um ASO demissional para outra versão ou data de desligamento; preservar a ligação anterior e exigir conferência explícita antes de religar;
12. **Admissional e admissão formal:** exigir que o vínculo possua data de admissão formal antes de permitir o lançamento do exame admissional, sem impedir que a data do exame seja anterior ao início das atividades;
13. **Cancelamento de acompanhamento manual:** permitir cancelar uma necessidade manual criada por engano ou que deixou de existir, com permissão, justificativa, confirmação, linha do tempo imutável e auditoria.

---

# 29. Pontos revisados pelo usuário

A aprovação integral abrangeu:

1. As duas abas de S01;
2. Os quatro indicadores sem resultado clínico;
3. O modo sensível para visualizar resultado;
4. A criação manual de acompanhamento;
5. As transições de S02;
6. O significado de `Não compareceu`;
7. O encerramento demissional sem realização;
8. Os campos mínimos de S03;
9. A sugestão editável de vencimento;
10. As regras de duplicidade por tipo;
11. A retificação com versões imutáveis;
12. O snapshot da clínica;
13. A separação entre ASO empresarial e clínica global;
14. As treze propostas da seção 28.

---

# 30. Registro de aprovação

O usuário confirmou integralmente:

- S01 a S06;
- navegação e retornos;
- estados de acompanhamento, resultado, prazo e restrição;
- permissões empresariais e globais;
- alertas e supressões;
- regras de versão e duplicidade;
- exportações;
- treze propostas da seção 28.

**Situação atual:** Lote 6 aprovado integralmente pelo usuário em 21/08/2026, incluindo S01 a S06 e as treze propostas da seção 28.  
**Melhoria futura registrada depois da aprovação:** `MF-01 — Agendamento de ASO e lembretes ao colaborador`, sem alteração do escopo da primeira versão.  
**Evolução posterior:** o Lote 7 foi aprovado integralmente em 21/08/2026 e está documentado em `15-prototipos-baixa-fidelidade-lote-7.md`. O próximo passo é a consolidação final dos protótipos e a matriz formal de estados e transições.
