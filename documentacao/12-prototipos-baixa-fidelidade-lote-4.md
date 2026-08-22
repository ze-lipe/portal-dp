# Sistema Web de Departamento Pessoal

## Protótipos de Baixa Fidelidade — Lote 4

**Escopo:** Correções, ajustes financeiros e recibos — F04, F05 e R01 a R03  
**Data de elaboração:** 20/08/2026  
**Situação:** aprovado pelo usuário em 20/08/2026  
**Protótipo interativo:** `lote-4-correcoes-ajustes-recibos.html`

---

# 1. Objetivo do lote

Este lote transforma em telas navegáveis o fluxo posterior a um pagamento confirmado. Ele valida:

- Correção financeira sem apagar o que realmente aconteceu;
- Preservação do valor e da data efetivamente pagos;
- Reabertura controlada de competência fechada;
- Cancelamento administrativo de confirmação;
- Edição limitada ao participante, grupo e evento escolhidos;
- Apuração de diferença positiva, zero ou absorvida;
- Confirmação independente de ajuste positivo;
- Consulta, prévia, emissão, substituição, download e reimpressão de recibos;
- Geração de recibos em lote;
- Permissões independentes por tela, ação, campo e documento;
- Isolamento entre empresas também nos arquivos e links;
- Estados vazios, validação, concorrência, processamento e sucesso;
- Continuidade do módulo único `Competências e Pagamentos`.

O lote não inicia o desenvolvimento. Ele materializa as regras para revisão antes do modelo de dados, da arquitetura e do código.

---

# 2. Fontes e precedência

Foram utilizadas como fontes:

1. `07-documento-mestre-planejamento-funcional.md`, fonte principal das regras de negócio;
2. `08-fluxos-integrados-navegacao-telas.md`, fonte da navegação e dos estados aprovados;
3. `11-prototipos-baixa-fidelidade-lote-3.md`, fonte de continuidade da competência e dos pagamentos;
4. Documentos anteriores, apenas quando não divergem da consolidação mais recente;
5. Todas as confirmações posteriores do usuário registradas na conversa.

Em caso de divergência, prevalecem os Documentos 07 e 08, cada um em sua finalidade. As propostas novas deste lote estão separadas na seção 18 e só se tornam definitivas depois da aprovação do usuário.

---

# 3. Continuidade do que já foi aprovado

O Lote 4 preserva:

- Um único item lateral `Competências e Pagamentos`;
- Ajustes e recibos como abas internas da competência;
- Ausência de itens laterais separados para pagamentos, ajustes, desligamentos, recibos ou exportações;
- Uma única empresa ativa por vez;
- Uma única competência financeira ativa no contexto;
- Grupos e eventos confirmados de forma independente;
- Pagamento integral dentro de cada participante + grupo + evento;
- Ausência de pagamento parcial no mesmo evento;
- `Pago` como confirmação de que o dinheiro foi realmente entregue, sem estado bancário;
- Líquido do contador autoritativo e sem recibo interno;
- Recibos separados para RA e reembolso, complementos e período sem registro;
- Recibos próprios do MEI e dos ajustes positivos;
- Nenhum recibo para salário oficial, líquido do holerite, rescisão oficial, valor zero ou diferença absorvida;
- Fechamento explícito da competência, separado da confirmação dos pagamentos;
- Permissões por perfil, tela, ação e campo;
- PDF indivisível na primeira versão: sem acesso atual ao conteúdo completo, não há download parcial ou documento redigido;
- Confirmação em lote do Lote 3 com comportamento `todos ou nenhum`;
- Operações críticas protegidas contra cliques repetidos e respostas incertas.

---

# 4. Telas incluídas

| Código | Tela | Papel no fluxo |
|---|---|---|
| F04 | Correção financeira guiada | Corrigir um grupo já pago sem apagar o pagamento ou as versões anteriores |
| F05 | Ajustes financeiros | Consultar e quitar ajustes positivos e consultar diferenças absorvidas |
| R01 | Recibos da competência | Pesquisar e operar documentos autorizados na competência selecionada |
| R02 | Detalhe e pré-visualização | Exibir a prévia ou o snapshot definitivo e sua cadeia de versões |
| R03 | Impressão e download em lote | Conferir elegibilidade e gerar agrupamento autorizado de recibos |

F04, R02 e R03 são subfluxos contextuais. F05 é a aba `Ajustes financeiros`; R01 é a aba `Recibos`.

---

# 5. Limites deste lote

O protótipo não implementa por completo:

- K01 a K07 e F01 a F03, já cobertos pelo Lote 3;
- D01 a D03, que pertencem ao Lote 5;
- ASO, clínicas, notificações, administração e auditoria global;
- Exportação Excel definitiva;
- Geração real de PDF, ZIP, hash ou armazenamento;
- Integração bancária;
- Upload de comprovantes;
- Importação de holerite ou planilha;
- Assinatura digital;
- Cobrança, estorno ou compensação automática;
- PDF parcialmente ocultado;
- Alteração destrutiva de pagamento, ajuste, recibo ou auditoria.

Botões simulados mostram o comportamento esperado, mas não geram arquivos reais.

---

# 6. Arquitetura integrada do módulo

## 6.1 Menu lateral

O menu continua com:

```text
Painel
Colaboradores
Competências e Pagamentos
ASO e clínicas
Notificações
Auditoria, quando autorizada
```

Não surgem itens próprios para `Ajustes` ou `Recibos`.

## 6.2 Invólucro permanente

As cinco telas mantêm visíveis:

- Empresa ativa;
- CNPJ;
- Competência;
- Situação oficial da competência;
- Versão;
- Datas previstas do adiantamento e do pagamento final;
- Abas autorizadas;
- Ação para trocar de empresa.

## 6.3 Abas da competência

O protótipo mantém o conjunto integrado:

1. Resumo;
2. Participantes;
3. Líquidos do contador;
4. Adiantamento;
5. Pagamento final;
6. Desligamentos e acertos;
7. Ajustes financeiros;
8. Recibos.

As seis primeiras remetem aos lotes próprios. As duas últimas são plenamente exploradas neste lote.

## 6.4 Troca de empresa

Trocar de empresa:

- Encerra o contexto atual;
- Invalida seleções, correções abertas na tela, retornos e arquivos da empresa anterior;
- Não envia automaticamente ações pendentes;
- Exige escolha explícita da nova empresa;
- Recarrega permissões, competências, campos e documentos;
- Não revela se um identificador existe em outro CNPJ.

---

# 7. Controles exclusivos da revisão

Acima da janela simulada existem quatro seletores que não farão parte do produto:

1. Tela para revisar;
2. Estado da tela;
3. Acesso simulado;
4. Cenário de revisão.

Setas permitem percorrer as cinco telas.

## 7.1 Estados simulados

- Principal;
- Vazio;
- Carregando;
- Validação;
- Concorrência;
- Processando;
- Sucesso.

## 7.2 Cenários simulados

- RA paga com diferença positiva;
- Correção sem diferença;
- Diferença absorvida pela empresa;
- Novo total igual a zero;
- Competência fechada;
- Grupo oficial sem recibo interno;
- Ajuste positivo pendente;
- Ajuste positivo pago;
- RA igual a zero com recibo contendo somente reembolso;
- Recibo de pagamento final do MEI;
- Prévia sem número;
- Recibo cancelado sem substituto;
- Original substituído e substituto vigente;
- Arquivo indisponível;
- Recibo localizado em outra competência da mesma empresa;
- Tentativa de localizar recibo de outro CNPJ;
- Lote com elegíveis e impedidos;
- Lote sem documento elegível;
- Empresa inativa em consulta histórica.

## 7.3 Perfis simulados

| Perfil de revisão | Finalidade principal |
|---|---|
| Gestor financeiro completo | Ver todas as telas, valores e ações do lote |
| Corrige, mas não reabre | Provar que iniciar correção não concede reabertura |
| Inicia correção, sem cancelar ou editar | Provar as permissões intermediárias de F04 |
| Vê ajustes, mas não confirma | Separar conferência da quitação do ajuste |
| Ajustes sem diferenças absorvidas | Provar a retirada de cartão, contagem, aba e valores derivados |
| Recibos: somente visualizar | Provar que visualizar não concede download ou reimpressão |
| Recibos: visualizar e baixar | Provar download permitido e reimpressão negada |
| Recibos: visualizar e reimprimir | Provar reimpressão permitida e download negado |
| Recibos: gerar lote completo | Provar que gerar lote é uma permissão própria |
| Valores financeiros ocultos | Provar que totais derivados, documentos e inferências são omitidos |
| Sem acesso ao Lote 4 | Provar recusa de rota e ausência de dados |

Esses perfis servem para homologação. Os perfis reais serão configuráveis por empresa.

---

# 8. Conceitos centrais

## 8.1 Correção não é estorno

Cancelar uma confirmação em F04 é uma ação administrativa. Ela:

- Não afirma que o dinheiro voltou;
- Não apaga a data efetiva;
- Não reduz o total historicamente entregue;
- Não exclui o recibo;
- Não apaga a memória anterior;
- Não remove a auditoria;
- Apenas libera o escopo autorizado para recomposição.

## 8.2 Escopo mínimo

Toda correção pertence a:

```text
empresa + competência + participante + grupo + evento + versão
```

Outro participante, grupo ou evento permanece bloqueado.

## 8.3 Fórmula principal

```text
Ajuste = novo total devido − valor efetivamente pago da mesma verba
```

| Resultado | Tratamento |
|---|---|
| Positivo | Criar ajuste positivo pendente |
| Zero | Não criar movimentação financeira |
| Negativo | Registrar diferença absorvida pela empresa |

Nunca existe:

- Pagamento negativo;
- Cobrança ao participante;
- Recuperação automática de valor;
- Compensação automática em competência futura;
- Compensação silenciosa entre verbas.

## 8.4 Ajuste não nasce pago

Criar o ajuste positivo apenas registra uma obrigação. O pagamento exige:

- Permissão própria;
- Conferência;
- Confirmação integral;
- Data efetiva não futura;
- Auditoria;
- Emissão posterior do recibo próprio.

## 8.5 Documento definitivo

Um recibo definitivo declara pagamento confirmado. Por isso:

- Prévia não possui número;
- Prévia não declara pagamento;
- Documento definitivo nasce somente depois da confirmação integral;
- Reimprimir não cria outra versão;
- Substituir cria novo número e mantém a ligação com o anterior.

---

# 9. F04 — Correção financeira guiada

## 9.1 Origens

F04 pode ser aberta por:

- K05 — detalhe financeiro do participante;
- F02 — participantes de um grupo e evento;
- R02 — detalhe do recibo;
- F05 — origem de um ajuste;
- Notificação autorizada;
- Histórico autorizado.

O contexto chega preenchido. O usuário não escolhe outro CNPJ pela rota.

## 9.2 Organização visual

A sequência funcional completa foi agrupada em cinco etapas visuais:

1. Origem e justificativa;
2. Liberação do escopo;
3. Correção e recálculo;
4. Apuração da diferença;
5. Conclusão e documentos.

Agrupar visualmente não elimina nenhuma ação de negócio ou evento de auditoria.

## 9.3 Etapa 1 — origem e justificativa

Exibe:

- Participante e identificador;
- Tipo de participante;
- Empresa e competência;
- Grupo e evento;
- Versão;
- Total originalmente calculado;
- Valor manual anterior, quando existir;
- Valor final anterior;
- Valor efetivamente pago;
- Data efetiva original;
- Recibo relacionado, quando existir;
- Motivo;
- Justificativa obrigatória.

Sem justificativa, não é possível avançar.

## 9.4 Etapa 2 — liberação

O sistema avalia:

- Competência aberta ou fechada;
- Permissão de reabertura;
- Versão atual;
- Confirmação vigente;
- Documento vigente;
- Existência de outra correção aberta para o mesmo escopo;
- Permissões de cancelamento e substituição.

Se a competência estiver fechada:

```text
Fechada, versão 1
→ Reaberta, versão 2
```

A versão fechada permanece preservada.

Depois da reabertura, o sistema:

1. Cancela administrativamente a confirmação afetada;
2. Preserva o valor e a data realmente pagos;
3. Marca o recibo vigente como cancelado, quando houver;
4. Libera somente o escopo selecionado;
5. Mantém os demais grupos bloqueados.

## 9.5 Etapa 3 — correção

Mostra, lado a lado:

- Memória original;
- Valor calculado original;
- Valor manual anterior;
- Novo valor informado;
- Origem do componente;
- Diferença;
- Justificativa da alteração.

O valor original nunca é sobrescrito. A correção cria nova versão.

Para `RA e reembolso`, a apuração é por componente. RA não compensa silenciosamente reembolso, e reembolso não compensa RA.

## 9.6 Etapa 4 — apuração

Exibe:

- Novo total devido;
- Valor efetivamente pago da mesma verba;
- Memória da subtração;
- Natureza do resultado;
- Efeito no checklist;
- Documento esperado.

Resultado positivo:

- Cria exatamente um ajuste pendente;
- Não o confirma;
- Não emite ainda o recibo do ajuste;
- Mantém a competência impedida de fechar.

Resultado zero:

- Não cria ajuste;
- Não cria diferença absorvida;
- Permite seguir à reconfirmação.

Resultado negativo:

- Cria registro de diferença absorvida;
- Não cria pagamento, cobrança ou recibo;
- Não gera pendência futura.

## 9.7 Etapa 5 — conclusão

Antes de concluir, a tela confirma:

- Pagamento real preservado;
- Novo total devido;
- Resultado da diferença;
- Reconfirmação do grupo;
- Situação do recibo anterior;
- Documento substituto aplicável;
- Ajuste positivo pendente, quando houver;
- Retorno ao checklist.

O grupo permanece `Em correção` até essa conclusão.

## 9.8 Persistência da jornada

Proposta deste lote:

- Antes do cancelamento administrativo, a jornada pode ser descartada;
- Depois do cancelamento, ela se torna uma correção aberta, persistente e auditada;
- O usuário pode salvar e continuar depois;
- Outro usuário autorizado pode retomar;
- A tela mostra quem iniciou e a etapa atual;
- Só pode existir uma correção aberta para o mesmo escopo;
- Uma correção aberta bloqueia o fechamento da competência.

Não se pretende manter uma transação técnica longa enquanto o usuário percorre as etapas.

## 9.9 Estados da correção

- Preparação;
- Aguardando justificativa;
- Aguardando reabertura;
- Aguardando cancelamento administrativo;
- Em edição;
- Recalculando;
- Aguardando reconfirmação;
- Documento substituto pendente;
- Ajuste positivo pendente;
- Concluída;
- Bloqueada por permissão;
- Conflito de versão;
- Resposta técnica incerta.

---

# 10. F05 — Ajustes financeiros

## 10.1 Abas internas

- `Pendentes de pagamento`;
- `Pagos`;
- `Diferenças absorvidas`.

## 10.2 Filtros

- Participante;
- Tipo de participante;
- Grupo de origem;
- Evento de origem;
- Situação;
- Período;
- Correção ou identificador de origem.

Filtros nunca apresentam grupos não autorizados.

## 10.3 Ajuste positivo pendente

Campos e informações:

- Empresa e competência;
- Participante;
- Grupo e evento de origem;
- Correção relacionada;
- Motivo e justificativa;
- Valor pago anteriormente;
- Novo valor devido;
- Memória da diferença;
- Valor do ajuste;
- Data de criação;
- Situação.

Ações:

- Conferir;
- Abrir origem;
- Confirmar pagamento, quando autorizado.

## 10.4 Confirmação do ajuste

A confirmação:

- É integral;
- Não permite parcelamento;
- Exige data efetiva;
- Não aceita data futura;
- Exige declaração explícita de que o pagamento ocorreu;
- Cria um único pagamento;
- Emite um único recibo próprio;
- Move o ajuste para `Pagos`;
- Não altera novamente o grupo original;
- Atualiza painel e checklist.

## 10.5 Ajustes pagos

Exibem:

- Valor;
- Data efetiva;
- Usuário e horário da confirmação;
- Recibo;
- Correção e grupo de origem;
- Ações de abrir origem e recibo.

Se um ajuste pago precisar ser corrigido, ele entra em um novo F04. Não é editado diretamente.

## 10.6 Diferenças absorvidas

Exibem:

- Origem;
- Valor efetivamente pago;
- Novo valor devido;
- Diferença;
- Motivo;
- Justificativa;
- Usuário;
- Data de encerramento;
- Situação `Absorvido pela empresa`.

Não oferecem:

- Botão de pagar;
- Recibo;
- Cobrança;
- Desconto;
- Compensação futura.

---

# 11. R01 — Recibos da competência

## 11.1 Filtros

- Evento;
- Tipo de recibo;
- Participante;
- Situação;
- Período de emissão;
- Número.

## 11.2 Colunas

- Seleção para lote;
- Número ou indicação de prévia;
- Versão;
- Participante;
- Tipo;
- Evento;
- Competência;
- Data efetiva;
- Data de emissão;
- Total autorizado;
- Situação;
- Ações autorizadas.

## 11.3 Tipos permitidos

### Empregado

- RA e reembolso do adiantamento;
- Complementos do adiantamento;
- Período sem registro do adiantamento;
- RA e reembolso do pagamento final;
- Complementos do pagamento final;
- Período sem registro do pagamento final;
- Ajuste positivo;
- Acerto complementar de desligamento sobre RA.

### MEI

- Adiantamento contratual;
- Pagamento final contratual, com serviços adicionais detalhados;
- Ajuste positivo.

O recibo de RA e reembolso pode conter apenas reembolso quando a RA for zero e o total confirmado for positivo.

## 11.4 Tipos proibidos

R01 nunca oferece recibo interno de:

- Salário oficial;
- Líquido do holerite;
- Rescisão oficial do contador;
- Diferença absorvida;
- Evento de valor zero.

## 11.5 Situações documentais

- Prévia;
- Definitivo vigente;
- Cancelado;
- Substituído;
- Substituto vigente.

`Arquivo indisponível` é condição técnica, não substitui a situação documental.

## 11.6 Pesquisa por número

- Busca somente na empresa ativa;
- Pode localizar outra competência da mesma empresa;
- Antes de mudar o seletor, mostra a competência localizada e pede confirmação;
- Revalida a permissão do recibo e da competência;
- Outro CNPJ responde apenas como não encontrado;
- A busca não revela contagem ou existência externa.

## 11.7 Ações independentes

- Visualizar;
- Abrir origem;
- Baixar;
- Reimprimir;
- Selecionar para lote;
- Iniciar correção, quando aplicável.

Visualizar não concede download. Download e reimpressão continuam ações de negócio e auditoria distintas. Essa separação não promete impedir que o navegador ofereça `Salvar como PDF` durante uma impressão autorizada.

---

# 12. R02 — Detalhe e pré-visualização

## 12.1 Organização da tela

O protótipo combina:

- Painel de situação, ações e integridade;
- Histórico de versões, quando existir;
- Folha simulada do recibo.

## 12.2 Conteúdo da folha

- Logo usado na emissão;
- Razão social e CNPJ da empresa;
- Número, quando definitivo;
- Versão;
- Nome e CPF do empregado, ou identificação empresarial e CNPJ do MEI;
- Competência;
- Evento;
- Tipo;
- Detalhamento;
- Total numérico;
- Total por extenso;
- Data efetiva;
- Data de emissão;
- Relação com versão anterior ou substituta;
- Campo de assinatura manual do participante.

Não existe campo de assinatura da empresa.

## 12.3 Prévia

- Não recebe número;
- Exibe a marca textual `PRÉVIA — PAGAMENTO NÃO CONFIRMADO`;
- Não afirma que houve pagamento;
- Não pode ser confundida visualmente com o definitivo;
- Não entra no lote operacional de documentos definitivos.

## 12.4 Definitivo

- Nasce somente após a confirmação integral;
- Mantém o snapshot usado na emissão;
- Mantém o logo original, mesmo se a empresa trocar o logo depois;
- Reimpressão da mesma versão não cria número novo;
- Substituto recebe número novo;
- Original cancelado ou substituído permanece consultável;
- Número nunca é reutilizado.

## 12.5 Arquivo indisponível

Se o pagamento foi confirmado e o PDF falhou:

- O pagamento não é desfeito;
- O número não é perdido;
- O recibo permanece registrado;
- A tela mostra a falha técnica sem alterar a situação financeira;
- Regeneração controlada usa o mesmo número e snapshot;
- A nova tentativa é idempotente e auditada.

## 12.6 Documento indivisível

Para baixar o recibo, o perfil precisa ter acesso atual a todo o conteúdo. Se um campo necessário estiver oculto:

- O PDF não é entregue;
- Não é criada versão parcialmente ocultada;
- A mensagem não revela o valor bloqueado.

O bloqueio também da folha renderizada dentro do sistema é uma proposta conservadora deste lote, descrita na seção 18.13, e não é tratado como decisão anterior já aprovada.

---

# 13. R03 — Impressão e download em lote

## 13.1 Etapas

1. Conferir seleção e impedimentos;
2. Escolher formato;
3. Gerar e baixar.

## 13.2 Elegibilidade proposta

O lote operacional aceita somente recibos:

- Definitivos;
- Vigentes;
- Da empresa ativa;
- Autorizados integralmente;
- Com arquivo íntegro e disponível.

Prévia, cancelado, substituído, arquivo indisponível e documento sem autorização permanecem fora do lote. Versões históricas continuam acessíveis individualmente em R02.

## 13.3 Formatos

- PDF consolidado para impressão;
- Pacote ZIP com PDFs individuais.

O PDF consolidado exige acesso ao conteúdo completo, `Gerar lote` e reimpressão para todos os elegíveis. O ZIP exige acesso ao conteúdo completo, `Gerar lote` e download. A separação entre reimprimir e baixar organiza o fluxo e a auditoria, mas não funciona como fronteira técnica absoluta: um navegador pode permitir salvar um PDF aberto para impressão.

## 13.4 Antes da geração

A tela mostra:

- Quantidade selecionada;
- Quantidade elegível;
- Quantidade impedida;
- Motivo de cada impedimento;
- Formato escolhido;
- Permissão necessária;
- Empresa e competência.

## 13.5 Durante e depois

- Clique repetido não cria outro pedido;
- A tela mostra progresso;
- O usuário pode continuar usando o sistema;
- O resultado não mistura empresas;
- Mudança de versão ou permissão cancela o lote inteiro, sem subconjunto silencioso;
- Cada recibo mantém número, arquivo, hash e auditoria individuais;
- O lote não altera documentos;
- Download final revalida sessão, empresa e permissões.

---

# 14. Permissões do lote

## 14.1 F04

- Visualizar correção;
- Iniciar correção;
- Ver valores e memória;
- Reabrir competência;
- Cancelar confirmação;
- Sobrescrever valor;
- Recalcular;
- Reconfirmar grupo;
- Ver recibo relacionado;
- Cancelar ou substituir recibo.

## 14.2 F05

- Visualizar ajustes;
- Ver valores;
- Abrir origem;
- Ver diferenças absorvidas;
- Confirmar ajuste positivo;
- Acessar recibo do ajuste;

## 14.3 R01 a R03

- Visualizar lista;
- Pesquisar;
- Visualizar documento;
- Abrir origem;
- Baixar documento;
- Reimprimir documento;
- Regenerar arquivo indisponível;
- Gerar lote;
- Baixar pacote ZIP;
- Imprimir PDF consolidado.

## 14.4 Regra de composição

Nenhuma permissão é concedida por consequência informal. Exemplos:

- Confirmar pagamento não concede cancelar confirmação;
- Corrigir não concede reabrir;
- Visualizar ajuste não concede pagar;
- Visualizar recibo não concede baixar;
- Baixar um recibo não concede gerar lote;
- Ser master não dispensa o controle de empresa e campo na sessão ativa.

---

# 15. Segurança, isolamento e arquivos

## 15.1 Empresa ativa

- `empresa_id` pertence à sessão e é obrigatório em correção, ajuste, recibo, arquivo e auditoria;
- O servidor não confia em empresa enviada pela tela;
- Relacionamentos cruzados entre CNPJs são bloqueados também no banco;
- Row-Level Security atua como segunda barreira;
- Identificador externo responde como não encontrado;
- Filtros, totais e duplicidade não revelam existência em outra empresa.

## 15.2 PDF privado

- Sem endereço público permanente;
- Snapshot imutável;
- Hash de integridade;
- Abertura e download revalidam sessão, empresa, registro, ação e campos;
- Divergência de hash bloqueia a entrega e registra falha técnica;
- Logo e conteúdo pertencem ao snapshot;
- Pagamento, numeração e arquivo têm estados separados.

## 15.3 Concorrência e repetição segura

Possuem versão e chave de repetição segura:

- Início e conclusão de F04;
- Reabertura;
- Cancelamento e reconfirmação;
- Criação de ajuste ou diferença absorvida;
- Confirmação do ajuste;
- Emissão, regeneração e substituição do recibo;
- Geração de lote;
- Exportação.

Comportamento esperado:

- Apenas uma correção abre para o mesmo escopo;
- Versão antiga nunca sobrescreve versão nova;
- Repetir a mesma operação devolve o resultado já existente;
- A mesma chave com conteúdo diferente é rejeitada;
- Duplo clique não duplica ajuste, pagamento, número, documento ou lote;
- Resposta incerta consulta o estado real antes de permitir nova tentativa.

## 15.4 Empresa inativa

Permite somente consulta histórica autorizada. Ficam bloqueados:

- Iniciar ou concluir correção;
- Reabrir competência;
- Confirmar ajuste;
- Criar substituto;
- Regenerar arquivo;
- Gerar novo lote;
- Exportar novo arquivo.

---

# 16. Auditoria

## 16.1 Fonte única

O histórico de correção, ajuste e recibo é filtro da mesma fonte imutável de auditoria usada pelo restante do sistema.

## 16.2 Conteúdo mínimo da correção

- Empresa;
- Usuário;
- Data e hora;
- Participante;
- Competência;
- Grupo e evento;
- Justificativa;
- Versão anterior e nova;
- Valor calculado anterior;
- Valor efetivamente pago preservado;
- Novo valor devido;
- Resultado positivo, zero ou absorvido;
- Confirmação anterior e nova;
- Recibo anterior e eventual substituto;
- Referência única da operação.

## 16.3 Eventos documentais

São auditados:

- Geração de prévia;
- Emissão;
- Visualização;
- Download;
- Reimpressão;
- Cancelamento;
- Substituição;
- Regeneração;
- Divergência de hash;
- Geração e download de lote;
- Tentativa negada ou cruzada entre empresas.

## 16.4 Falha de auditoria

Se uma ação financeira exigir auditoria e a gravação falhar, a ação de negócio inteira é revertida. A auditoria nunca é editada ou apagada por usuário ou master.

---

# 17. Estados seguros e mensagens

| Situação | Resposta da tela |
|---|---|
| Sem permissão | Recusa sem carregar conteúdo restrito |
| Outra empresa | Não encontrado, sem confirmar existência |
| Competência fechada | Solicitar reabertura autorizada e justificada |
| Versão antiga | Bloquear avanço e pedir atualização |
| Outra correção aberta | Mostrar responsável e permitir retomada autorizada |
| Campo obrigatório ausente | Preservar dados e focar o primeiro erro |
| Operação em andamento | Bloquear repetição e mostrar progresso |
| Resposta incerta | Consultar o estado real antes de tentar novamente |
| Falha de arquivo | Preservar pagamento e número; permitir regeneração controlada |
| Hash divergente | Não entregar arquivo e registrar falha técnica |
| Sessão expirada | Limpar o conteúdo e exigir nova autenticação |
| Permissão revogada | Interromper a ação e não entregar documento ou lote |

As mensagens nunca usam apenas cor. Estado, efeito e próximo passo aparecem em texto.

---

# 18. Propostas novas para aprovação neste lote

Esta seção fecha lacunas que não estavam inteiramente definidas. As propostas foram representadas no protótipo para revisão.

## 18.1 Recibo substituto quando existe diferença positiva

Proposta:

- O substituto do grupo original declara somente o pagamento que realmente ocorreu na data original;
- O documento mostra o detalhamento corrigido compatível com esse pagamento;
- O saldo ainda não pago fica ligado ao ajuste positivo;
- O ajuste recebe seu próprio recibo somente depois de ser pago;
- O substituto nunca declara como pago o saldo ainda pendente.

Alternativa mais restritiva para futura decisão: manter o original apenas cancelado até o ajuste ser pago. A regra proposta acima é preferida porque preserva um comprovante correto do valor que efetivamente já foi entregue sem antecipar o ajuste.

## 18.2 Cancelado e substituído

Proposta:

- `Cancelado`: o documento deixou de ser vigente e ainda não possui sucessor;
- `Substituído`: existe um novo documento vigente relacionado;
- `Substituto vigente`: documento atual da cadeia.

## 18.3 Novo total igual a zero

Proposta:

- O grupo passa a `Não aplicável` depois da correção;
- O pagamento realizado permanece no histórico;
- A diferença integral é absorvida;
- O recibo anterior fica cancelado;
- Não existe substituto de valor zero.

## 18.4 Grupo composto de RA e reembolso

Proposta:

- A fórmula é aplicada por componente;
- RA deduz apenas RA paga;
- Reembolso deduz apenas reembolso pago;
- Um excedente não reduz silenciosamente a falta do outro;
- O recibo do grupo continua detalhando os dois componentes.

## 18.5 Correção que alcança mais de uma competência

Proposta:

- Criar uma correção por competência, grupo e evento;
- Relacionar as correções por uma referência coordenadora;
- Não liberar várias competências numa única jornada destrutiva;
- Cada competência mantém versão, checklist e documentos próprios.

## 18.6 Correção de ajuste já pago

Proposta:

- Abrir novo F04 tendo o ajuste pago como origem;
- Preservar ajuste, pagamento e recibo anteriores;
- Apurar nova diferença positiva, zero ou absorvida;
- Nunca editar o ajuste pago diretamente.

## 18.7 Lote de documentos

Proposta:

- Apenas definitivos vigentes entram no lote operacional;
- Versões históricas são acessadas individualmente;
- `Gerar lote` é permissão própria;
- PDF consolidado exige conteúdo completo, gerar lote e reimpressão;
- Pacote ZIP exige conteúdo completo, gerar lote e download;
- Mudança de permissão ou versão cancela todo o lote, sem resultado parcial silencioso.

Reimpressão e download permanecem ações distintas para autorização de negócio e auditoria, mas o sistema não promete impedir `Salvar como PDF` quando a impressão já foi autorizada.

## 18.8 Formato de número

Proposta visual:

```text
2026-000001
```

O número continua sendo uma sequência anual por empresa, única e nunca reutilizada. O formato pode ser alterado antes do desenvolvimento sem mudar a regra de unicidade.

## 18.9 Motivo e justificativa

Proposta:

- `Motivo` é uma categoria selecionável para relatórios;
- `Justificativa` é texto obrigatório que explica o caso concreto;
- Ambos são preservados na auditoria;
- O catálogo inicial pode conter `Valor ou componente incorreto`, `Condição financeira corrigida` e `Outro motivo autorizado`.

## 18.10 Pacote individual

Proposta: o pacote de PDFs individuais será um arquivo ZIP.

## 18.11 Data efetiva do ajuste

Proposta: seguir a mesma regra dos demais pagamentos — data obrigatória, válida e não futura.

Para tornar a massa fictícia testável, o protótipo usa `31/10/2026` como data operacional simulada. Na implementação, a comparação será feita no servidor com a data corrente e o fuso horário definido para a empresa; a data escolhida deverá ser preservada no ajuste, no histórico e no recibo correspondente.

## 18.12 Grupo oficial

Existe uma decisão ainda sensível:

- O líquido oficial é autoritativo;
- Não é decomposto nem recalculado;
- Não gera recibo interno;
- Uma diferença oficial não deve ser transformada automaticamente em ajuste com recibo.

Proposta conservadora do protótipo: F04 pode registrar e auditar a correção do controle oficial, mas não cria ajuste interno ou recibo enquanto a forma operacional dessa diferença não for aprovada. O valor corrigido deve vir novamente do contador e permanecer no grupo oficial.

## 18.13 Visualização interna sem acesso integral

A decisão anterior tornou obrigatório o acesso integral para baixar o PDF e rejeitou PDF parcialmente ocultado. Este lote propõe estender a mesma proteção à folha renderizada dentro de R02:

- Metadados autorizados podem continuar aparecendo em listas sem valores restritos;
- A folha completa não é montada quando algum de seus campos estiver oculto;
- Não existe prévia parcialmente redigida na primeira versão;
- A recusa não revela o campo ou valor ausente.

Essa extensão permanece proposta até a aprovação explícita deste lote.

---

# 19. Exportação aplicável

Não existe central de exportações. Dentro da competência, a exportação autorizada mantém as cinco abas já planejadas:

1. Resumo;
2. Eventos;
3. Componentes;
4. Ajustes;
5. Recibos.

Regras:

- Uma empresa por arquivo;
- Uma competência por arquivo;
- Filtros e versão registrados;
- Campos ocultos omitidos;
- Campos mascarados permanecem mascarados;
- CPF e CNPJ preservados como texto;
- Texto neutralizado contra execução como fórmula;
- Arquivo privado e pertencente ao solicitante;
- Expiração em 24 horas;
- Nova validação no download;
- Empresa inativa não gera novo arquivo.

---

# 20. Navegação e retorno

| Origem | Destino | Contexto preservado |
|---|---|---|
| K05 ou F02 | F04 | Empresa, competência, participante, grupo e evento |
| R02 | F04 | Recibo e origem financeira |
| F04 com diferença positiva | F05 | Correção e ajuste criado |
| F04 com documento substituto | R02 | Cadeia de versões |
| F04 concluído | K03 | Competência e checklist |
| Aba Ajustes financeiros | F05 | Competência e filtros |
| F05 pago | R02 | Ajuste e recibo |
| Aba Recibos | R01 | Competência |
| C07 ou M05 | R01/R02 | Participante e caminho de retorno |
| R01 | R02 | Competência, filtros, página e seleção |
| R01 | R03 | Seleção elegível |
| R02 | Origem | Empresa, competência, aba e filtros |
| R03 | R01 | Competência, filtros e lista |

Voltar restaura o contexto apenas enquanto a mesma empresa e as mesmas permissões continuarem válidas.

---

# 21. Acessibilidade e responsividade

O protótipo foi preparado para:

- 736 pixels;
- 360 pixels;
- 320 pixels;
- Temas claro e escuro;
- Navegação por teclado;
- Foco visível;
- Rótulos associados aos campos;
- Estados descritos em texto;
- Tabelas com rolagem horizontal controlada;
- Etapas com rótulo e não apenas cor;
- Folha do recibo reorganizada em coluna em telas estreitas;
- Botões sem sobreposição;
- Valores e datas no padrão brasileiro.

---

# 22. Casos obrigatórios de homologação

1. Competência fechada e usuário sem permissão de reabrir;
2. Competência aberta com grupo já pago;
3. Dois usuários iniciando correção no mesmo escopo;
4. Conflito depois do cancelamento administrativo;
5. Novo devido maior que o pago;
6. Novo devido igual ao pago;
7. Novo devido menor que o pago;
8. Novo devido igual a zero;
9. Grupo oficial sem recibo interno;
10. RA e reembolso corrigidos por componentes distintos;
11. Ajuste criado e ainda não pago;
12. Ajuste confirmado integralmente;
13. Ajuste pago sendo corrigido novamente;
14. Diferença absorvida;
15. Correção salva e retomada por outro autorizado;
16. Falha de conexão depois de ação crítica;
17. Duplo clique em reabertura, cancelamento, reconfirmação, pagamento ou emissão;
18. Prévia sem número;
19. Recibo definitivo vigente;
20. Original cancelado sem substituto;
21. Original substituído e substituto vigente;
22. Recibo de RA e reembolso contendo apenas reembolso;
23. Arquivo indisponível depois do pagamento;
24. Regeneração usando o mesmo número;
25. Divergência de hash;
26. Revogação de download com R02 aberto;
27. Visualizar permitido, baixar e reimprimir negados;
28. Baixar permitido e reimprimir negado;
29. Reimprimir permitido e baixar negado;
30. Campo financeiro oculto impedindo o PDF inteiro;
31. Busca por número em outra competência da mesma empresa;
32. Tentativa de recibo de outro CNPJ;
33. Troca de empresa com correção aberta;
34. Lote sem documento elegível;
35. Lote misto com versões vigentes e históricas;
36. Permissão revogada durante a geração do lote;
37. Empresa inativa em consulta histórica;
38. Exportação sem campos ocultos e sem fórmula executável.

---

# 23. Critérios de aceite do lote

## 23.1 Correção

- [ ] Nenhuma correção apaga valor pago, data efetiva, memória, auditoria ou documento;
- [ ] Competência fechada exige permissão, justificativa e nova versão;
- [ ] Apenas o participante, grupo e evento escolhidos são liberados;
- [ ] Cancelamento administrativo não afirma estorno;
- [ ] Uma única correção pode ficar aberta para o mesmo escopo;
- [ ] Correção aberta pode ser retomada e bloqueia o fechamento;
- [ ] Versão antiga não sobrescreve versão recente;
- [ ] Resultado positivo cria exatamente um ajuste pendente;
- [ ] Resultado zero não cria movimentação;
- [ ] Resultado negativo cria apenas diferença absorvida;
- [ ] Uma verba não compensa silenciosamente outra;
- [ ] Grupo oficial não gera recibo interno.

## 23.2 Ajustes

- [ ] Criar ajuste não o marca como pago;
- [ ] Ajuste positivo exige confirmação integral e data efetiva;
- [ ] Data futura é recusada;
- [ ] Não existe parcelamento dentro do ajuste;
- [ ] Pagamento cria um único recibo próprio;
- [ ] Diferença absorvida não gera pagamento, cobrança, desconto, compensação ou recibo;
- [ ] Ajuste pendente impede o fechamento;
- [ ] Ajuste pago só é corrigido por um novo F04.

## 23.3 Recibos

- [ ] Prévia não possui número e mostra a marca aprovada;
- [ ] Definitivo só nasce depois do pagamento integral;
- [ ] Oficial, líquido, rescisão oficial, valor zero e diferença absorvida não geram recibo;
- [ ] Reimpressão mantém número e versão;
- [ ] Número cancelado nunca é reutilizado;
- [ ] Substituto recebe novo número e liga todas as versões;
- [ ] Documento histórico permanece consultável;
- [ ] Falha de arquivo preserva pagamento e número;
- [ ] Regeneração controlada reutiliza o número;
- [ ] PDF exige acesso atual a todo o conteúdo;
- [ ] Visualizar, baixar, reimprimir e gerar lote são permissões independentes;
- [ ] Busca de outro CNPJ não revela existência.

## 23.4 Lote e segurança

- [ ] O lote não mistura empresas;
- [ ] Apenas documentos elegíveis entram no lote operacional;
- [ ] Mudança de permissão ou versão cancela o conjunto inteiro;
- [ ] Cada recibo mantém número, arquivo, hash e auditoria próprios;
- [ ] Clique repetido não duplica solicitação ou arquivo;
- [ ] Download revalida sessão, empresa e permissões;
- [ ] Hash inválido impede a entrega;
- [ ] Operação financeira e auditoria concluem juntas ou nenhuma conclui;
- [ ] Campos ocultos não aparecem nem podem ser inferidos;
- [ ] Empresa inativa não cria nova correção, emissão, lote ou exportação.

## 23.5 Experiência

- [ ] Estados e impedimentos possuem texto, não apenas cor;
- [ ] Erros preservam os dados informados;
- [ ] Primeiro campo inválido recebe foco;
- [ ] Processamento bloqueia repetição;
- [ ] Retorno preserva competência, origem e filtros quando autorizado;
- [ ] Fluxo funciona em 736, 360 e 320 pixels;
- [ ] Tema claro e escuro permanecem legíveis.

---

# 24. Checklist de revisão do usuário

Antes de aprovar este lote, revisar especialmente:

1. As cinco etapas visuais de F04;
2. A persistência da correção depois do cancelamento administrativo;
3. A apuração por componente de RA e reembolso;
4. O recibo substituto quando existe ajuste positivo pendente;
5. A regra de recibo cancelado, substituído e substituto vigente;
6. O tratamento de novo total igual a zero;
7. A separação entre conferir e pagar um ajuste;
8. As três permissões de visualizar, baixar e reimprimir;
9. A permissão própria para gerar lote;
10. A inclusão apenas de definitivos vigentes no lote;
11. O formato visual `2026-000001`;
12. O pacote ZIP;
13. A regra conservadora do grupo oficial;
14. A visualização em celular.

---

# 25. Situação e próxima etapa

**Situação atual:** aprovado pelo usuário em 20/08/2026.  
**Próxima etapa:** Lote 5 — D01 a D03 dentro de Colaboradores e da competência, cobrindo desligamento, competência final e acerto financeiro.
