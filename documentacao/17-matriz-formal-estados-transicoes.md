# Documento 17

## Matriz Formal de Estados e Transições

**Sistema:** Portal interno multiempresa de Departamento Pessoal  
**Versão:** 1.0  
**Situação:** aprovado integralmente pelo usuário  
**Data:** 21/08/2026  
**Base aprovada:** Documento 16 e decisões anteriores nele consolidadas  
**Alinhamento normativo:** em 22/08/2026, a regra já aprovada no Documento Mestre §23.3 para término MEI antes/na data do adiantamento ainda não pago foi explicitamente propagada nesta matriz; não houve nova decisão funcional.  

---

# 1. Finalidade

Este documento transforma o planejamento funcional aprovado em regras executáveis de comportamento.

Ele define, para cada entidade:

- de qual estado uma operação pode partir;
- qual comando ou acontecimento provoca a transição;
- quem pode executá-lo;
- quais dados e permissões precisam ser válidos;
- qual estado passa a valer;
- quais efeitos financeiros, documentais e de notificação são produzidos;
- qual auditoria e proteção contra repetição são obrigatórias;
- quando a operação deve ser negada;
- como uma situação concluída pode ser corrigida sem apagar o histórico.

A matriz não escolhe tecnologia, não cria novas funcionalidades e não substitui a homologação contábil, jurídica, operacional ou de segurança.

---

# 2. Autoridade e leitura

## 2.1 Ordem de autoridade

Em caso de diferença de redação, aplica-se a seguinte ordem:

1. Documento 17, depois de aprovado;
2. Documento 16 aprovado;
3. Refinamentos aprovados nos Lotes 1 a 7;
4. Documento Mestre 07;
5. Fluxo Integrado 08;
6. documentos de descoberta anteriores.

Uma alteração futura da regra exige nova versão formal; não pode ser feita silenciosamente durante o desenvolvimento.

## 2.2 Como ler cada linha

| Coluna | Significado |
|---|---|
| ID | Identificador estável da regra ou transição para requisitos, testes e auditoria. IDs `ASO-R*` são regras de mapeamento; os demais identificam transições. |
| Entidade e estado inicial | Registro afetado e situação exigida antes da operação. |
| Evento ou comando | Ação humana, rotina automática ou acontecimento confirmado. |
| Ator e autorização | Papel e permissões mínimas; permissões de campo continuam cumulativas. |
| Pré-condições e validações | Dados, versão, contexto e regras que precisam ser satisfeitos. |
| Estado final | Situação persistida ou derivada depois do sucesso. |
| Efeitos | Alterações financeiras, documentais, notificações e sessões. |
| Auditoria e repetição | Registro obrigatório e comportamento diante de clique ou envio repetido. |
| Bloqueio ou correção | Resultado quando a regra falha e caminho legítimo para alterar algo concluído. |

Esses são os nove **campos semânticos obrigatórios**, não nove colunas físicas obrigatórias. Para manter o documento legível, as matrizes usam dois formatos compactos: seis colunas quando autorização, validações, efeitos, auditoria e bloqueio cabem em células combinadas; sete colunas quando `Efeitos` precisa ficar separado de `Auditoria/bloqueio`. O campo `Entidade` aparece junto ao estado inicial ou é definido pelo título da matriz. Nenhum campo semântico pode ser omitido da regra, ainda que esteja combinado na apresentação.

## 2.3 Convenções

- `Derivado` significa calculado a partir dos dados de origem e nunca editado diretamente;
- `Mesmo estado` significa que nenhum dado de negócio é alterado;
- `Terminal` impede transição operacional comum, mas não impede consulta ou correção autorizada;
- `N/A` significa que a dimensão não se aplica àquela entidade;
- Datas limites são inclusivas quando a regra não disser expressamente o contrário;
- Estado da tela, estado da entidade, estado do pagamento e estado documental nunca são fundidos;
- Uma projeção pode apresentar um estado, mas somente a fonte indicada no Documento 16 pode alterá-lo.
- Uma célula pode representar um **vetor de estados independentes**, separado por ponto e vírgula; isso não cria um estado geral novo. Qualquer resultado condicionado — use ou não a palavra `ou` — só pode ser abreviado quando a condição determinística que escolhe exatamente um resultado estiver escrita na mesma linha; caso contrário, os ramos precisam de transições separadas.

---

# 3. Contrato transversal de toda transição

As regras abaixo valem para todas as linhas, mesmo quando não forem repetidas na célula.

## 3.1 Contexto e autorização

1. O servidor identifica o usuário e a sessão atuais;
2. Revalida situação da conta, TOTP quando exigido e revogação;
3. Revalida o contexto: sem empresa, empresa ativa, escopo global ou incidente restrito;
4. Revalida empresa e perfil quando aplicáveis; nos demais contextos, revalida papel sistêmico e permissão global ou restrita, sempre com ação e campos no servidor;
5. Rejeita identificador pertencente a outro CNPJ como registro não encontrado;
6. Nunca envia campo oculto ao navegador, arquivo ou evento visível de auditoria;
7. Master não ignora o isolamento empresarial nem recebe acesso inerente a incidentes.

## 3.2 Integridade e concorrência

- Toda edição envia a versão lida pelo usuário;
- Versão antiga é rejeitada como conflito e nunca sobrescreve a mais recente;
- Restrições de unicidade também existem no banco;
- Operação de negócio e auditoria obrigatória concluem juntas ou nenhuma conclui;
- Confirmações, numeração, fechamento, dois masters e permissões usam transação;
- Resposta incerta é consultada antes de uma nova tentativa;
- Chave de repetição segura impede duplicidade sem bloquear uma nova ação intencional.

## 3.3 Auditoria mínima

Uma transição mutável registra, conforme aplicável:

- empresa ou escopo global/restrito;
- ator e sessão;
- entidade e identificador interno;
- comando e resultado;
- data e hora;
- versão anterior e nova;
- campos alterados, respeitando a permissão atual;
- justificativa quando exigida;
- chave de repetição e correlação do lote;
- origem da tela ou rotina.

Segredos, senha, TOTP, códigos, token e conteúdo proibido nunca aparecem na auditoria.

A auditoria é uma fonte única, somente de acréscimo e com retenção mínima de seis anos. H01 consulta uma empresa, H02 consulta o escopo global permitido e H03 apresenta o evento imutável; nenhuma dessas telas edita a trilha. Antes/depois é redigido no servidor conforme a permissão atual de histórico ou auditoria e do campo. A abertura de conteúdo sensível antes/depois é auditada. Pesquisa interativa abre em 30 dias e limita cada período a 366 dias.

## 3.4 Falhas

- Validação: mostrar os campos corrigíveis e preservar os valores permitidos;
- Sem permissão ou fora da empresa: resposta neutra, sem revelar existência;
- Conflito: não salvar parcialmente e oferecer recarga;
- Sessão expirada ou revogada: interromper a operação e limpar dados sensíveis;
- Falha de auditoria obrigatória: reverter a alteração de negócio;
- Falha posterior de arquivo: preservar o pagamento e a numeração já confirmados.

## 3.5 Correção

Dados históricos não são apagados nem sobrescritos. Depois de um efeito financeiro, documental ou de encerramento, a alteração usa o fluxo específico de correção, retificação, substituição, reabertura ou nova versão indicado nesta matriz.

---

# 4. Catálogo das dimensões independentes

| Dimensão | Natureza | Regra principal |
|---|---|---|
| Autenticação da sessão | Persistida e temporária | Credencial TOTP configurada não prova TOTP concluído na sessão atual. |
| Contexto de acesso | Temporária | Somente um CNPJ operacional por vez; escopos globais e de incidentes são explícitos. |
| Vínculo empregado | Persistida + derivada por data | Situação temporal, condição de registro e tipo de encerramento permanecem separados. |
| Contrato MEI | Persistida + derivada por data | Renovação contínua não é novo contrato; interrupção real é. |
| Competência | Persistida | Fechamento é explícito e depende do checklist integral. |
| Grupo financeiro | Persistida | Cada participante, grupo e evento possui ciclo próprio. |
| Confirmação | Persistida | Um grupo pago não confirma os demais. |
| Recibo | Persistida | Estado documental não altera o fato financeiro já confirmado. |
| Desligamento | Persistida + derivada por data | Inativação independe de pagamento e ASO. |
| ASO | Seis dimensões | Acompanhamento, resultado, restrição, versão, prazo e elegibilidade do alerta não se confundem. |
| Notificação | Persistida + derivada | Leitura individual não resolve a obrigação operacional. |
| Exportação | Temporária | Arquivo expira; evento de auditoria não. |
| Incidente | Persistida | Linha do tempo é somente de acréscimo. |

---

# 5. Resultado de uma transição

Cada comando termina exatamente em uma das categorias:

| Resultado | Persistência |
|---|---|
| Sucesso | Estado e efeitos completos, com auditoria. |
| Negado | Nenhuma alteração; tentativa sensível auditada. |
| Falha de validação | Nenhuma alteração; erros retornados sem expor dados externos. |
| Conflito | Nenhuma alteração; versão atual preservada. |
| Cancelado antes da conclusão | Nenhuma alteração de negócio, salvo registro mínimo quando a regra exigir. |
| Resposta incerta | Nenhuma repetição até reconciliar o estado real. |

Não existe sucesso parcial silencioso. As únicas operações em lote que aceitam resultados individuais são as que removem impedidos antes do envio; depois do envio transacional, aplica-se a regra `todos ou nenhum` definida para o lote elegível.

## 5.1 Manifesto técnico de estados

Este documento define os valores e as arestas funcionais. O Documento 18 deverá materializar um manifesto único com uma linha por `eixo + estado`, contendo: natureza (`raiz`, `persistido`, `derivado` ou `terminal operacional`), fonte, forma de armazenamento, condição de entrada, saídas comuns e correção autorizada.

Até esse manifesto existir, valem estas regras de interpretação:

- `—` representa ausência da entidade, não um valor persistido;
- um estado chamado expressamente de `derivado` não recebe edição nem aresta persistente própria;
- `terminal` significa terminal para o fluxo comum, mas ainda admite consulta/correção quando a matriz indicar;
- todo estado que não estiver marcado como ausência, derivado ou terminal é tratado como persistido não terminal;
- o desenvolvimento de enums/constraints e o gate automático de alcançabilidade só podem começar depois de 100% dos estados estarem classificados no manifesto do Documento 18.

---

# 6. Bloco 01 — Autenticação, primeiro acesso, TOTP e sessão

## 6.1 Eixos de estado

| Entidade/eixo | Estados |
|---|---|
| Primeiro acesso | Pendente; concluído; vencido |
| Bloqueio de autenticação | Livre; bloqueado temporariamente até data/hora |
| Credencial TOTP | Não aplicável; pendente; configurada; redefinição exigida |
| Sessão | Não autenticada; senha temporária aceita; senha definitiva aceita com TOTP pendente; sessão restrita à A03; autenticada sem empresa; contexto empresarial; escopo global; escopo restrito de incidentes; aviso de inatividade; expirada; encerrada; revogada |
| Token de recuperação | Não emitido; vigente; consumido; vencido ou invalidado |

O estado `TOTP configurada` pertence à credencial. O estado `TOTP concluído` pertence à autenticação da sessão; um não substitui o outro.

## 6.2 Matriz de transições

| ID | Estado inicial | Evento | Pré-condição/permissão | Estado final | Efeitos e auditoria/bloqueio |
|---|---|---|---|---|---|
| B01-AUT-01 | Sessão não autenticada; usuário comum ativo e livre | Entrar com senha definitiva válida | E-mail normalizado; senha válida; primeiro acesso concluído | Autenticada sem empresa | Rotaciona identificador da sessão; não carrega dados empresariais; audita sucesso sem senha. |
| B01-AUT-02 | Sessão não autenticada; master apto e livre | Entrar com senha definitiva válida | Senha válida; TOTP configurada | Senha definitiva aceita com TOTP pendente; A04 | Rotaciona sessão, mas não libera A07, escopo global ou empresa; audita etapa sem segredo. |
| B01-AUT-03 | Sessão não autenticada; master com TOTP pendente | Entrar com senha definitiva válida | Primeiro acesso concluído; conta ativa | Sessão restrita à A03 | Somente configuração do TOTP fica disponível; nenhum dado empresarial ou global é carregado. |
| B01-AUT-04 | Sessão não autenticada; primeiro acesso pendente | Entrar com credencial temporária válida | Credencial não consumida, emitida há menos de 24 horas e usuário não bloqueado/inativo | Senha temporária aceita; A02 | Autoriza somente definição de senha; rotaciona sessão; audita sem registrar credencial. |
| B01-AUT-05 | Sessão não autenticada | Informar credencial não aceita | Limitação de tentativas aplicável | Permanece não autenticada | Incrementa controle seguro; mensagem neutra; limpa senha; audita falha relevante sem confirmar existência da conta. |
| B01-AUT-06 | Livre; quatro falhas válidas para o controle | Quinta tentativa inválida | Regra de limitação atingida | Bloqueado temporariamente por 15 minutos | Revoga tentativa em andamento; resposta neutra; auditoria não expõe qual fator ou cadastro causou o bloqueio. |
| B01-AUT-07 | Bloqueado temporariamente | Atingir data/hora final do bloqueio | Evento temporal do servidor | Livre | Remove apenas bloqueio temporário; não altera bloqueio administrativo, inativação, senha ou TOTP. |
| B01-AUT-08 | Senha temporária aceita; primeiro acesso pendente | Definir senha definitiva | Mínimo de 10 caracteres; confirmação idêntica; credencial temporária ainda válida | Primeiro acesso concluído; comum: autenticada sem empresa; master: sessão restrita à A03 | Consome credencial temporária; armazena hash forte; rotaciona sessão; auditoria atômica. |
| B01-AUT-09 | Primeiro acesso pendente | Completar 24 horas sem uso | Evento temporal | Primeiro acesso vencido | Credencial deixa de ser aceita; A02 bloqueia e orienta novo envio sem revelar outros dados. |
| B01-AUT-10 | Qualquer estado público | Solicitar recuperação de senha | E-mail em formato válido; controles de abuso | Resposta pública neutra; token vigente apenas se conta elegível existir | Token é único, de 30 minutos e armazenado por hash; resposta é idêntica para e-mail existente ou inexistente; pedido auditado quando correlacionável. |
| B01-AUT-10A | Token de recuperação vigente | Vencer ou invalidar token | Completar 30 minutos → `Vencido`; emitir sucessor, alterar/recuperar senha ou inativar conta → `Invalidado` | Vencido ou invalidado, conforme a causa escrita | Rejeita uso posterior com resposta neutra; preserva somente metadados seguros e auditoria; nunca restaura token anterior. |
| B01-AUT-11 | Token de recuperação vigente | Definir nova senha | Token íntegro, não consumido, dentro de 30 minutos; senha válida | Token consumido; sessões anteriores revogadas; sessão não autenticada | Atualiza hash; não remove TOTP do master; retorna à A01; operação e auditoria atômicas. |
| B01-AUT-12 | Token vencido, consumido, inválido ou inexistente | Tentar redefinir senha | — | Permanece indisponível | Trata todos os casos visualmente da mesma forma; não altera senha; oferece solicitar novo link. |
| B01-AUT-13 | Sessão restrita à A03; TOTP pendente | Confirmar configuração TOTP | Segredo cifrado temporário; código válido e não reutilizado; usuário master | TOTP configurada; master apto se demais requisitos válidos; sessão encerrada | Mostra códigos de recuperação uma única vez, guarda apenas seus hashes, invalida a sessão restrita e exige novo login com senha e A04; audita sem segredo/código. |
| B01-AUT-14 | Senha definitiva aceita com TOTP pendente | Validar código TOTP | Código válido, dentro da tolerância aprovada, não reutilizado; limitação de tentativas | TOTP concluído na sessão; autenticada sem empresa | Rotaciona sessão; libera A07 e escopos autorizados; audita sucesso sem código. |
| B01-AUT-15 | Senha definitiva aceita com TOTP pendente | Usar código de recuperação | Código vigente, de uso único e hash correspondente | TOTP concluído na sessão; autenticada sem empresa; código consumido | Invalida somente o código usado; rotaciona sessão; audita sem registrar o código. |
| B01-AUT-16 | A03 ou A04; zero a três falhas válidas no fator | Informar TOTP/código de recuperação inválido ou reutilizado | Contagem segura por conta/sessão; janela vigente | Permanece na etapa atual; contador incrementado | Mensagem não revela qual fator estava correto; não libera contexto; audita falhas relevantes. |
| B01-AUT-16A | A03 ou A04; quatro falhas válidas no fator | Informar o quinto código inválido/reutilizado | Mesmo controle seguro | Bloqueado temporariamente por 15 minutos | Invalida a etapa corrente, não libera contexto e exige reinício seguro depois do prazo; B01-AUT-07 encerra somente esse bloqueio temporal; audita sem código. |
| B01-AUT-17 | Master em reconfiguração; credencial TOTP em `Redefinição exigida` | Autenticar para recuperar TOTP | Senha válida e autorização curta, auditada e de uso único criada por B03-MST-05, B03-MST-06 ou B03-USR-09B | Sessão restrita exclusivamente à A03 | Senha sozinha não libera seletor, empresa ou função global; após B03-MST-07 fica apto e precisa realizar novo login completo. |
| B01-AUT-18 | Sessão autenticada ativa; 25 minutos inativa | Atingir aviso de inatividade | Não atingiu 30 minutos nem limite absoluto | Aviso de inatividade | Exibe `Continuar sessão` e `Sair`; atualização automática não conta como atividade. |
| B01-AUT-19 | Aviso de inatividade | Continuar sessão | Ação explícita do usuário; sessão não revogada; limite de 8 horas ainda não atingido | Retorna ao mesmo contexto autenticado | Renova somente a janela de inatividade; nunca amplia o limite absoluto. |
| B01-AUT-20 | Sessão autenticada ou em aviso | Atingir 30 minutos de inatividade ou 8 horas absolutas | Evento temporal do servidor | Expirada | Limpa dados sensíveis e rascunhos; nenhuma ação é reenviada após novo login; registra encerramento de segurança. |
| B01-AUT-21 | Sessão autenticada | Sair | Próprio usuário | Encerrada | Invalida a sessão no servidor, limpa contexto e retorna a A01; audita encerramento. |
| B01-AUT-22 | Sessão autenticada | Encerrar outras sessões | Próprio usuário em A09; reautenticação quando exigida | Sessão atual permanece; demais ficam revogadas | Revogação efetiva no servidor e auditada; não existe ação administrativa genérica equivalente. |
| B01-AUT-23 | Sessão autenticada | Evento crítico de segurança ou acesso | Bloqueio, inativação, senha alterada/recuperada, reset TOTP, promoção/rebaixamento, retirada de empresa/perfil ou redução de acesso | Revogada no escopo aplicável | Aba aberta perde acesso e não conclui formulário; evento causador e revogação são auditados. |
| B01-AUT-24 | Sessão expirada, encerrada ou revogada | Repetir requisição pendente ou usar aba antiga | — | Permanece sem autorização | Servidor rejeita; não restaura formulário nem repete comando; resposta não inclui conteúdo em cache. |
| B01-AUT-25 | Sessão autenticada | Trocar a própria senha em A09 | Senha atual válida; nova senha com no mínimo 10 caracteres; confirmação idêntica; versão de segurança atual | Senha alterada; todas as sessões revogadas; não autenticada | Atualiza hash, invalida tokens anteriores, rotaciona credenciais e exige novo login; operação e auditoria atômicas sem registrar senha. |
| B01-AUT-26 | Sessão master com TOTP concluído | Regenerar os próprios códigos de recuperação em A09 | Reautenticação recente com senha e TOTP; confirmação explícita | Nova série vigente; série anterior invalidada | Mostra a nova série uma única vez, guarda somente hashes e audita sem códigos; repetição não volta a revelar a série. |

## 6.3 Invariantes e estados derivados

- Nenhum dado empresarial aparece antes de senha definitiva e, para master, TOTP concluído na sessão;
- Master nunca chega a A07, H02, U01–U05 ou empresa ativa sem concluir TOTP;
- Usuário comum não é obrigado a configurar TOTP na primeira versão;
- Senha, senha temporária, token, segredo TOTP, código TOTP, código de recuperação e cookie nunca entram em histórico, log funcional ou exportação;
- Credenciais temporárias, tokens e códigos de recuperação são de uso único e armazenados por hash; segredo TOTP é cifrado separadamente;
- Atualização automática de painel ou sino e troca de empresa não renovam a sessão;
- Reautenticação crítica é válida por cinco minutos e somente para executor, ação, entidade, versão, escopo e resumo confirmados;
- Mudança de entidade, versão, impacto, escopo, expiração ou revogação invalida imediatamente a reautenticação;
- O limite absoluto de oito horas nunca é reiniciado por TOTP, reautenticação ou troca de contexto;
- Bloqueio temporário de login, bloqueio administrativo e inativação são eixos distintos.

## 6.4 Transições proibidas

- Não autenticada → contexto empresarial/global sem passar pelas etapas aplicáveis;
- Senha aceita de master → A07 sem TOTP concluído;
- Token vencido/consumido → senha alterada;
- Código de recuperação usado → reutilização;
- Sessão expirada/revogada → retomada automática de formulário ou comando;
- Reautenticação de uma ação → autorização de ação, entidade ou versão diferente;
- Reset TOTP → exibição do novo segredo ao master executor;
- Remover livremente o TOTP obrigatório de um master;
- Criar opção `Manter conectado`.

**Base:** Documento 16, seções 7, 8.1, 9, 21.2–21.3, 23, 25 e 31.2–31.5; Lote 1, A01–A09.

---

# 7. Bloco 02 — Empresa, inativação e troca de contexto

## 7.1 Eixos de estado

| Entidade/eixo | Estados |
|---|---|
| Empresa | Ativa; inativa em modo histórico |
| Contexto da sessão | Autenticada sem empresa; contexto empresarial; escopo global; escopo restrito de incidentes; contexto anterior invalidado |
| Edição local | Sem alteração; alteração não salva; aguardando decisão de descarte; processando |

O contexto global e o restrito de incidentes não utilizam silenciosamente o `empresa_id` anteriormente selecionado. Uma empresa lembrada apenas como destino de retorno não é contexto operacional até nova validação.

## 7.2 Matriz de transições de contexto

| ID | Estado inicial | Evento | Pré-condição/permissão | Estado final | Efeitos e auditoria/bloqueio |
|---|---|---|---|---|---|
| B02-CTX-01 | Autenticada sem empresa | Selecionar empresa ativa | Usuário comum associado ou master; empresa autorizada e ativa | Contexto empresarial | Servidor fixa um único `empresa_id`, carrega somente P01 daquela empresa e registra seleção quando necessário. |
| B02-CTX-02 | Autenticada sem empresa | Selecionar empresa inativa | Acesso histórico autorizado | Contexto empresarial em modo histórico | Permite consultas e exportação histórica específica; bloqueia toda nova movimentação. |
| B02-CTX-03 | Autenticada sem empresa | Tentar selecionar empresa não autorizada ou identificador arbitrário | — | Permanece sem empresa | Resposta genérica; não confirma existência, situação ou dados do CNPJ; tentativa negada pode ser auditada. |
| B02-CTX-04 | Contexto empresarial; sem alteração local | Trocar empresa | Sessão válida | Autenticada sem empresa; A07 | Invalida contexto anterior; limpa competência, filtros, seleções, prévias, arquivos e dados; não renova sessão. |
| B02-CTX-05 | Contexto empresarial; alteração não salva | Solicitar troca de empresa | — | Contexto empresarial; aguardando decisão de descarte | Mostra impacto; nenhuma limpeza ou troca ocorre antes da escolha. |
| B02-CTX-06 | Aguardando decisão de descarte | Continuar editando | — | Contexto empresarial original | Preserva edição local; não audita mudança de negócio. |
| B02-CTX-07 | Aguardando decisão de descarte | Descartar e trocar | Sessão ainda válida | Autenticada sem empresa; A07 | Descarta apenas rascunho local, invalida retorno e limpa o contexto anterior. |
| B02-CTX-08 | Sem empresa ou contexto empresarial | Abrir função global | Permissão global ou papel master conforme a tela | Escopo global | Cabeçalho mostra `Escopo global`; empresa anterior não filtra consulta; operação global é reautorizada. |
| B02-CTX-09 | Escopo global | Voltar a uma empresa | Empresa de retorno ainda autorizada e revalidada, ou nova seleção em A07 | Contexto empresarial ou autenticada sem empresa | Nunca entra automaticamente por identificador de URL; recarrega somente depois da validação. |
| B02-CTX-10 | Sem empresa, empresarial ou global | Abrir I01/I02 | Permissão restrita específica e responsável autorizado | Escopo restrito de incidentes | Não herda perfil empresarial nem acesso operacional às empresas mencionadas no incidente. |
| B02-CTX-11 | Escopo restrito de incidentes | Abrir entidade operacional empresarial | Permissão empresarial própria e seleção explícita da empresa | Contexto empresarial | Revalida empresa, entidade, tela, ação e campos; conhecer o incidente não concede o acesso. |
| B02-CTX-11A | Escopo restrito de incidentes | Voltar ao seletor | Sessão válida | Autenticada sem empresa; A07 | Limpa incidente, possíveis empresas citadas, filtros e retornos restritos; não reaproveita contexto empresarial antigo. |
| B02-CTX-11B | Escopo restrito de incidentes | Abrir função global comum | Permissão global atual e seleção explícita | Escopo global | Encerra o contexto restrito, limpa seus dados e reautoriza a função global; responsabilidade por incidente não amplia a função global. |
| B02-CTX-12 | Contexto anterior invalidado ou aba de outra empresa | Ler, salvar, exportar, confirmar ou baixar | — | Permanece bloqueado | Limpa conteúdo; orienta reabrir no contexto atual; identificador cruzado responde como não encontrado. |

## 7.3 Matriz do ciclo da empresa

| ID | Estado inicial | Evento | Pré-condição/permissão | Estado final | Efeitos e auditoria/bloqueio |
|---|---|---|---|---|---|
| B02-EMP-01 | Empresa inexistente no escopo conhecido | Salvar nova empresa e voltar | Permissão global `Cadastrar empresa`; CNPJ válido e único; campos obrigatórios, modelo e versão válidos; logo opcional validado conforme regra segura | Empresa ativa; permanece em escopo global/A07 | Empresa, acesso dos masters e cópia empresarial do modelo são gravados atomicamente; criador comum recebe perfil copiado; clique repetido não duplica. |
| B02-EMP-02 | Empresa inexistente | Salvar nova empresa e entrar | Mesmas pré-condições de B02-EMP-01 | Empresa ativa; contexto empresarial | Depois da criação atômica, seleciona e revalida a empresa antes de abrir P01. |
| B02-EMP-03 | Empresa inexistente | Salvar CNPJ inválido, duplicado ou não autorizável | — | Permanece inexistente | Mensagem neutra `Não foi possível usar este CNPJ`; não revela cadastro preexistente; nenhuma cópia de perfil parcial. |
| B02-EMP-04 | Empresa ativa | Editar cadastro ou padrões | Empresa ativa selecionada; permissão A10/campo; versão atual; novo logo, se informado, validado conforme regra segura | Empresa ativa em nova versão | Competência inicial permanece somente leitura; logo/padrões futuros são atualizados; recibos já emitidos preservam snapshot; alteração e auditoria atômicas. |
| B02-EMP-05 | Empresa ativa | Inativar | Permissão específica; sem competência, pagamento, ajuste ou desligamento pendente; confirmação explícita | Inativa em modo histórico | Bloqueia novas operações; preserva dados, arquivos e histórico; contexto aberto passa a modo histórico; audita. |
| B02-EMP-06 | Empresa ativa com pendência | Tentar inativar | Existe ao menos uma pendência impeditiva | Permanece ativa | Operação negada com resumo permitido das pendências; não efetua alteração parcial. |
| B02-EMP-07 | Empresa inativa em modo histórico | Exportar consulta histórica | Permissão específica de exportar naquele CNPJ; filtros e campos autorizados | Permanece inativa | Pedido, arquivo e download carregam `empresa_id`, aparecem em H01/histórico, expiram em 24 horas e não reativam a empresa. |
| B02-EMP-08 | Empresa inativa | Criar, editar, calcular, confirmar, corrigir, reabrir ou emitir novo documento operacional | — | Permanece inativa | Servidor bloqueia; modo histórico não altera estados reais de vínculos/contratos e não cria movimento. |

## 7.4 Invariantes e estados derivados

- Existe no máximo um `empresa_id` operacional por sessão;
- Empresa ativa é obtida da sessão no servidor, nunca substituída por valor enviado pela tela;
- Entidades, arquivos, auditoria e tarefas empresariais carregam `empresa_id` obrigatório;
- Relacionamentos impedem associação cruzada e Row-Level Security atua como segunda barreira;
- Busca, total, duplicidade, erro e contagem não revelam registro de outro CNPJ;
- Master também seleciona empresa para operar dados empresariais;
- Master apto pode selecionar qualquer empresa atual ou futura e não depende de associação ou perfil empresarial; esse alcance não inclui automaticamente o escopo restrito de incidentes;
- Permissão global não concede acesso conjunto a colaboradores, pagamentos ou ASOs;
- Empresa inativa preserva a situação real de seus registros e apenas muda a capacidade operacional do contexto;
- Logo é opcional, limitado a 2 MB, aceito somente como PNG ou JPEG depois de decodificação real do conteúdo, reprocessado para remover metadados e armazenado de forma privada;
- Tarefa empresarial sem empresa falha de forma segura;
- Troca de empresa não amplia nem renova sessão.

## 7.5 Transições proibidas

- Selecionar mais de uma empresa operacional;
- Trocar empresa por parâmetro de URL ou corpo da requisição;
- Salvar por aba da empresa anterior;
- Agregar dados operacionais de vários CNPJs em painel ou tela empresarial;
- Usar perfil global como perfil empresarial;
- Inativar empresa com pendência impeditiva;
- Excluir fisicamente empresa;
- Alterar competência inicial por edição comum;
- Reativar empresa sem fluxo explicitamente aprovado;
- Usar escopo de incidente para acessar dados operacionais de empresa afetada.

**Base:** Documento 16, seções 7, 8.1, 9, 23–25 e 31.6; Lote 1, A07, A08 e A10.

---

# 8. Bloco 03 — Usuário, master, perfil e permissão

## 8.1 Eixos de estado

| Entidade/eixo | Estados |
|---|---|
| Usuário | Ativo; bloqueado administrativamente; inativo |
| Primeiro acesso | Pendente; concluído; vencido |
| Papel sistêmico | Comum; master com TOTP pendente; master apto; master em reconfiguração de TOTP |
| Associação empresarial | Ausente; vigente com exatamente um perfil; removida |
| Perfil empresarial/global | Ativo; arquivado |
| Associação a perfil | Vigente; legada em perfil arquivado com migração pendente |
| Estado de campo | Oculto; mascarado; visível sem edição; visível e editável |

Bloqueio temporário de autenticação é um eixo de segurança do Bloco 01 e nunca altera `Ativo`, `Bloqueado administrativamente` ou `Inativo`.

## 8.2 Matriz de usuário e acesso

| ID | Estado inicial | Evento | Pré-condição/permissão | Estado final | Efeitos e auditoria/bloqueio |
|---|---|---|---|---|---|
| B03-USR-01 | Usuário inexistente | Convidar usuário comum | Master; nome e e-mail válidos; e-mail único globalmente; ao menos uma empresa com exatamente um perfil ativo por associação | Ativo; comum; primeiro acesso pendente | Cria credencial temporária de 24 horas por hash; envia convite; operação idempotente e auditada. |
| B03-USR-02 | Usuário inexistente | Convidar novo master | Master executor reautenticado; nome/e-mail válidos; confirmação e justificativa | Ativo; master com primeiro acesso pendente e TOTP pendente | Não exige perfil empresarial; só ficará apto após senha definitiva e TOTP; convite e papel são auditados. |
| B03-USR-03 | Usuário existente ou e-mail indisponível | Repetir convite/criação | — | Sem duplicação | E-mail é comparado sem diferença de maiúsculas; mesma chave devolve resultado anterior; tentativa não cria segundo usuário. |
| B03-USR-04 | Primeiro acesso pendente ou vencido | Reenviar primeiro acesso | Master; usuário elegível; nova chave de solicitação | Primeiro acesso pendente com nova validade de 24 horas | Invalida imediatamente credencial anterior; novo reenvio intencional é permitido; audita emissão sem segredo. |
| B03-USR-05 | Ativo | Bloquear administrativamente | Master; permissão sistêmica; se master, reautenticação, justificativa e contingência preservada | Bloqueado administrativamente | Revoga sessões; bloqueio e revogação são atômicos e auditados. |
| B03-USR-06 | Bloqueado administrativamente | Desbloquear | Master; situação de segurança válida | Ativo | Não altera senha, TOTP nem primeiro acesso; audita. Bloqueio temporário de login continua independente. |
| B03-USR-07 | Ativo ou Bloqueado administrativamente | Inativar | Master; confirmação; se master, reautenticação, justificativa e pelo menos dois outros masters aptos | Inativo | Revoga todas as sessões; preserva histórico e associações como dados administrativos; não exclui. |
| B03-USR-08 | Inativo; papel comum | Reativar | Master; empresas, perfis, primeiro acesso e segurança revistos | Ativo | Não cria sessão; exige novo login; ação idempotente e auditada. Se credencial não estiver válida, usa primeiro acesso/recuperação. |
| B03-USR-09A | Inativo; papel master; TOTP configurado e válido | Reativar master | Executor reautenticado; justificativa; credenciais do reativado válidas; contingência preservada | Ativo; master apto | Todas as sessões permanecem revogadas; o acesso só ocorre em novo login com TOTP concluído na sessão; concessão crítica auditada. |
| B03-USR-09B | Inativo; papel master; TOTP ausente ou inválido | Reativar para recuperação | Executor reautenticado; justificativa; contingência preservada | Ativo; master em reconfiguração; credencial `Redefinição exigida`; ainda não apto | Na mesma transação, revoga sessões/segredo anterior e cria autorização curta, auditada e de uso único para A03 após senha válida; não conta para o mínimo e segue B01-AUT-17 e B03-MST-07. |
| B03-USR-10 | Usuário existente | Alterar nome | Master; campo editável; versão atual | Mesmo estado; nova versão de identidade | Audita antes/depois autorizado; não altera acesso nem credencial. |
| B03-USR-11 | Usuário existente | Alterar e-mail | Master reautenticado quando política exigir; e-mail válido e único; versão atual | Mesmo estado; novo identificador de login | Revoga sessões afetadas; auditoria atômica; não envia segredo. |
| B03-USR-12 | Comum; sem associação à empresa | Associar empresa e perfil | Master; empresa válida; perfil empresarial ativo da mesma empresa | Associação vigente com exatamente um perfil | Empresa e perfil são gravados juntos; acesso passa a valer imediatamente; sessões/autorização são atualizadas sem cache obsoleto; audita. |
| B03-USR-13 | Comum; associação vigente | Trocar perfil empresarial | Master reautenticado recentemente para a ação, usuário, empresa, versão e impacto; perfil ativo da mesma empresa; resumo e justificativa; versão atual | Associação vigente com novo perfil | Revoga acesso afetado, incrementa versão de autorização e audita. Nunca mantém dois perfis na empresa. |
| B03-USR-14 | Comum; associação vigente | Retirar empresa | Master reautenticado recentemente para a ação, usuário, empresa, versão e impacto; confirmação e justificativa | Associação removida | Revoga imediatamente acesso e sessões afetadas; aba antiga não conclui operação; audita. |
| B03-USR-15 | Comum; perfil global ausente | Atribuir perfil global | Master; perfil global ativo | Perfil global vigente | Concede apenas funções globais definidas, nunca dados operacionais conjuntos; atualiza autorização e audita. |
| B03-USR-16 | Perfil global vigente | Reduzir ou retirar perfil global | Master reautenticado recentemente para a ação, usuário, versão e impacto; confirmação e justificativa | Novo perfil global ou ausente | Revoga sessões/autorização afetadas; audita antes/depois autorizado. |

## 8.3 Matriz do papel master e recuperação

| ID | Estado inicial | Evento | Pré-condição/permissão | Estado final | Efeitos e auditoria/bloqueio |
|---|---|---|---|---|---|
| B03-MST-01 | Usuário comum ativo | Promover para master | Master executor; reautenticação de cinco minutos vinculada à ação; justificativa; versão atual | Master com TOTP pendente | Revoga sessões; associações/perfis anteriores viram metadados não efetivos; não conta na contingência; auditoria atômica. |
| B03-MST-02 | Master com TOTP pendente | Concluir B01-AUT-13 | Senha definitiva e configuração TOTP concluídas | Master apto; sessão encerrada | Passa a contar para o mínimo de dois; libera acesso master apenas em novo login com senha e TOTP concluído em A04. |
| B03-MST-03 | Master apto; haverá pelo menos dois outros aptos | Rebaixar para comum | Executor reautenticado; justificativa; empresas e perfis vigentes escolhidos explicitamente para o usuário rebaixado | Comum ativo com associações revisadas | Revoga todas as sessões; não restaura metadados antigos automaticamente; audita e atualiza autorização atomicamente. |
| B03-MST-04 | Master apto; operação deixaria menos de dois aptos | Bloquear, inativar ou rebaixar | — | Permanece master apto | Transação recusada; nenhuma revogação parcial; mensagem explica a contingência sem expor segredo. |
| B03-MST-05 | Master apto; depois da redefinição ainda restarão pelo menos dois outros masters aptos | Redefinir TOTP de outro master | Executor master reautenticado; justificativa; permissão; versão atual | Afetado em reconfiguração; credencial `Redefinição exigida`; contingência normal | Revoga sessões, invalida segredo anterior e cria autorização curta, auditada e de uso único para A03 após senha válida; executor nunca vê novo segredo/códigos. |
| B03-MST-06 | Exatamente dois masters aptos; um perdeu autenticador | Iniciar exceção controlada de reset | Outro master reautenticado com senha e TOTP; justificativa | Um apto; outro em reconfiguração com credencial `Redefinição exigida`; contingência degradada | Bloqueia qualquer outra ação que reduza masters; cria autorização curta de uso único para A03 após senha válida; auditoria crítica. |
| B03-MST-07 | Master em reconfiguração; credencial `Redefinição exigida`; modo normal/degradado | Configurar novo TOTP | Sessão restrita A03 conforme B01-AUT-17; código válido | Master apto; credencial `Configurada`; contingência normal; sessão encerrada | Novo segredo cifrado e recuperação renovada; autorização curta consumida; encerra eventual contingência degradada, exige novo login e audita. |

## 8.4 Matriz de perfis e permissões

| ID | Estado inicial | Evento | Pré-condição/permissão | Estado final | Efeitos e auditoria/bloqueio |
|---|---|---|---|---|---|
| B03-PRF-01 | Perfil empresarial inexistente | Criar perfil | Master; exatamente uma empresa ativa; nome único no escopo; matriz coerente | Perfil empresarial ativo, versão 1 | Novos itens começam negados; operação auditada. |
| B03-PRF-02 | Perfil ativo | Duplicar | Master; empresa atual; origem autorizada | Novo perfil ativo independente | Copia configuração para revisão, não associa usuários automaticamente e cria identidade/versão próprias. |
| B03-PRF-03 | Perfil ativo | Salvar matriz de permissões | Master; versão atual; impacto exibido; dependências válidas; se o perfil estiver em uso ou houver retirada de acesso, reautenticação recente vinculada à ação, perfil, empresa, versão e impacto, além de justificativa | Perfil ativo em nova versão | Aplicação é atômica; mostra usuários afetados; revoga acessos reduzidos; alteração e auditoria concluem juntas. |
| B03-PRF-04 | Perfil ativo em versão antiga | Salvar depois de alteração concorrente | Versão divergente | Permanece na versão mais recente do servidor | Nada é sobrescrito; exige atualizar, revisar matriz e confirmar impacto novamente; audita conflito quando aplicável. |
| B03-PRF-05 | Perfil ativo em uso | Arquivar | Master; impacto exibido; versão atual | Perfil arquivado; associações existentes tornam-se legadas com migração pendente | Bloqueia novas atribuições; não exclui nem retira acesso automaticamente; audita. |
| B03-PRF-06 | Perfil arquivado | Tentar nova atribuição | — | Permanece sem nova associação | Servidor rejeita; lista de seleção não oferece o perfil. |
| B03-PRF-07 | Associação empresarial legada em perfil arquivado | Migrar usuário | Master reautenticado recentemente; novo perfil ativo da mesma empresa; usuário, empresa, versão e impacto conferidos; justificativa | Associação vigente no novo perfil | Revoga autorização antiga, incrementa a versão de acesso, aplica a nova imediatamente e audita; usa as mesmas salvaguardas de B03-USR-13. |
| B03-PRF-08 | Perfil/modelo global inexistente | Criar ou duplicar | Master em escopo global; matriz global coerente | Perfil ou modelo global ativo | Funções globais não concedem dados empresariais; versão e auditoria próprias. |
| B03-PRF-09 | Modelo empresarial global ativo | Criar empresa usando modelo | Permissão de empresa; modelo vigente | Cópia empresarial ativa e independente | Alterações futuras no modelo não se propagam; cópia é gravada atomicamente com empresa. |
| B03-PRF-10 | Perfil global/modelo ativo em uso | Arquivar | Master reautenticado quando houver retirada de acesso; impacto, versão e justificativa | Arquivado; associações de perfil viram legadas com migração pendente; cópias empresariais do modelo permanecem independentes | Impede novas atribuições/cópias, revoga autorização global afetada e não apaga histórico; audita. |
| B03-PRF-11 | Associação global legada em perfil global arquivado | Migrar usuário comum | Master reautenticado recentemente; novo perfil global ativo; usuário, versão e impacto conferidos; justificativa | Associação global vigente no novo perfil | Revoga autorização global antiga, incrementa a versão de acesso e aplica a nova; nunca concede dados empresariais e segue as salvaguardas de B03-USR-16. |

## 8.4.1 Autorização restrita de incidentes

A autorização de incidentes é uma entidade própria, aplicável a usuário comum ou master e independente de perfil empresarial/global. Possui estados `Ausente`, `Vigente` e `Revogada`, permissões cumulativas e papel nominal `Responsável` ou `Substituto`. A primeira versão não usa vigência temporal automática; qualquer término exige revogação explícita ou evento de segurança B03-INC-04.

| ID | Estado inicial | Evento | Pré-condição/permissão | Estado final | Efeitos e auditoria/bloqueio |
|---|---|---|---|---|---|
| B03-INC-01 | Autorização ausente | Designar responsável ou substituto | Master executor em escopo global e reautenticado; usuário ativo; permissões restritas escolhidas; função nominal; justificativa | Autorização vigente | Cria escopo restrito sem conceder perfil empresarial; versão de autorização e designação nominal são auditadas. |
| B03-INC-02 | Autorização vigente | Alterar permissões ou função nominal | Master executor em escopo global e reautenticado; impacto, versão e justificativa; dependências cumulativas válidas | Autorização vigente em nova versão | Redução revoga imediatamente sessões no escopo restrito; ampliação exige nova entrada explícita em I01/I02; audita antes/depois. |
| B03-INC-03 | Autorização vigente | Revogar | Master executor em escopo global e reautenticado; impacto e justificativa; permanece ao menos um responsável nominal vigente antes da produção | Revogada | Revoga o escopo restrito e limpa abas abertas; preserva histórico; conhecer empresa citada não concede acesso operacional. |
| B03-INC-04 | Autorização vigente | Inativar ou bloquear administrativamente o usuário | Evento de segurança confirmado | Revogada para uso enquanto durar o impedimento | Revoga sessões restritas imediatamente; eventual restauração exige revisão e nova versão autorizativa, nunca reaproveitamento silencioso. |
| B03-INC-05 | Autorização revogada | Reautorizar depois de revisão | Master executor em escopo global e reautenticado; usuário novamente ativo/elegível; permissões, função nominal, impacto e justificativa revistos | Autorização vigente em nova versão | Cria nova versão e exige nova entrada explícita em I01/I02; não restaura sessão, leitura ou autorização anterior silenciosamente; audita a reautorização. |

## 8.5 Dependências obrigatórias da matriz de permissão

- Editar exige visualizar;
- Campo editável exige ação de editar e estado de negócio compatível;
- Criar exige acesso editável a todos os campos obrigatórios do fluxo;
- Exportar exige visualizar cada campo exportado;
- Baixar exige acesso ao documento;
- Confirmar, cancelar confirmação, marcar não aplicável, reabrir, sobrescrever e retificar são ações independentes;
- Campo oculto é removido de API, formulário, lista, pesquisa, filtro, ordenação, total, erro, histórico, notificação e Excel;
- Campo mascarado é transformado antes da resposta e nunca pode ser reenviado como edição capaz de sobrescrever o original;
- Total derivado é omitido quando permitir inferir componente restrito;
- Novo módulo, tela, ação ou campo entra negado por padrão.

## 8.6 Invariantes e transições proibidas

- Somente master cria ou administra usuários e perfis;
- Usuário comum possui exatamente um perfil empresarial em cada empresa associada;
- Master apto é papel sistêmico global, acessa todas as empresas atuais e futuras depois de selecionar uma delas e não depende de perfil empresarial;
- O acesso do master a I01/I02 e a eventos correlacionáveis em H02 continua condicionado à permissão restrita própria e à responsabilidade nominal; o papel master, sozinho, não o concede;
- Perfil global não substitui perfil empresarial;
- Não há exceção individual de permissão na primeira versão;
- Sempre existem pelo menos dois masters aptos, exceto durante a recuperação degradada formal B03-MST-06;
- Usuário, perfil e histórico não são excluídos fisicamente;
- `Master apto` é derivado da conjunção: ativo, não bloqueado, primeiro acesso concluído, senha definitiva válida e TOTP configurado;
- É proibido promover-se, alterar o próprio perfil/empresas/papel master ou editar o próprio e-mail por Minha Conta;
- É proibido reduzir master abaixo da contingência, salvo reset TOTP controlado que não bloqueia, inativa ou rebaixa;
- É proibido atribuir perfil de outra empresa, perfil arquivado ou salvar dependências incoerentes;
- É proibido restaurar automaticamente perfis antigos ao rebaixar master;
- É proibido revelar segredo TOTP ou código de recuperação ao executor administrativo.

**Base:** Documento 16, seções 8.5, 9, 21.2–21.4, 23–25 e 31.2–31.5; Lote 7, U01–U05.

---

# 9. Bloco 04 — Pessoa, vínculo empregado e recontratação

## 9.1 Eixos de estado

| Entidade/eixo | Estados |
|---|---|
| Situação temporal do vínculo | Futuro; ativo; encerramento programado; último dia ativo; inativo |
| Condição de registro | Sem registro; registrado formalmente |
| Tipo de encerramento | Não encerrado; encerrado sem registro; demitido formalmente |
| Cadastro da pessoa | Vigente; corrigido em nova versão |

As situações compostas mostradas na interface são derivadas desses eixos: `Futuro`, `Ativo sem registro`, `Ativo registrado`, `Encerramento programado`, `Encerrado sem registro` e `Demitido formalmente`.

## 9.2 Matriz de pessoa, vínculo e recontratação

| ID | Estado inicial | Evento | Pré-condição/permissão | Estado final | Efeitos e auditoria/bloqueio |
|---|---|---|---|---|---|
| B04-VIN-01 | CPF não existente na empresa | Criar empregado e primeiro vínculo | Empresa ativa; permissão de criar; CPF válido; nome/endereço completos; início obrigatório; admissão opcional e não anterior ao início | Pessoa vigente; vínculo futuro ou ativo; `Registrado formalmente` somente se a admissão já foi alcançada | Pessoa e vínculo são atômicos e idempotentes; admissão futura permanece programada sem antecipar o registro; pode salvar condições financeiras pendentes; audita criação. |
| B04-VIN-02 | Pessoa existente; todos os vínculos efetivamente encerrados | Criar recontratação | Permissão; novo período começa depois do encerramento anterior; sem sobreposição | Mesma pessoa; novo vínculo futuro ou ativo | Não copia salário, RA, complementos, pagamentos ou recibos; mantém históricos dos vínculos separados; audita. |
| B04-VIN-03 | CPF com vínculo ativo ou período sobreposto | Tentar criar novo vínculo | — | Sem novo vínculo | Bloqueia e oferece abrir vínculo autorizado existente; não duplica pessoa; não revela dados de outra empresa. |
| B04-VIN-04 | Pessoa vigente | Alterar nome ou endereço | Permissão de editar cada campo; versão atual; endereço continua completo | Pessoa em nova versão | Preserva antes/depois autorizado; falha de CEP permite manual; auditoria atômica. |
| B04-VIN-05 | Pessoa com CPF e histórico financeiro | Corrigir CPF | Permissão específica; justificativa; novo CPF válido e não usado na empresa; versão atual | Pessoa corrigida em nova versão | Preserva CPF anterior no histórico autorizado; revalida unicidade e vínculos; ação sensível auditada. |
| B04-VIN-06 | Vínculo futuro | Atingir data de início | Evento temporal; não existe encerramento anterior impeditivo | Admissão já alcançada: `Ativo registrado`; admissão ausente/futura: `Ativo sem registro` | A data operacional escolhe exatamente um ramo; não cria vínculo ou evento financeiro por si só; rotinas passam a considerar aplicabilidade. |
| B04-VIN-06A | Ativo sem registro; admissão futura já informada | Atingir data de admissão | Evento temporal; vínculo ainda ativo; admissão ≥ início | Ativo registrado | Encerra período sem registro no dia anterior à admissão, ativa a condição oficial e recalcula somente eventos abertos; pago/fechado segue F04; audita a virada derivada. |
| B04-VIN-07 | Ativo sem registro | Registrar admissão já alcançada | Permissão; início ≤ admissão ≤ data operacional; impacto revisto | Ativo registrado; condição financeira preserva seu estado independente | Encerra período sem registro no dia anterior; preserva/versiona RA; permite salvar condição financeira pendente, bloqueando somente cálculo/pagamento dependente; aberto recalcula e pago/fechado segue F04; audita. |
| B04-VIN-07A | Ativo sem registro | Informar admissão futura | Permissão; admissão > data operacional e admissão ≥ início; impacto revisto | Ativo sem registro; admissão programada | Mantém PSR até o dia anterior à admissão e agenda B04-VIN-06A; não antecipa salário oficial, filtros ou ASO admissional como realizado; audita. |
| B04-VIN-08 | Vínculo futuro ou ativo; sem pagamento afetado | Editar início ou admissão | Permissão de campo/ação; datas coerentes; sem sobreposição; versão atual | Situação derivada recalculada | Mostra competências/eventos afetados; recalcula apenas escopo interno aberto; audita antes/depois. |
| B04-VIN-09 | Vínculo com pagamento confirmado ou competência fechada | Alterar data com impacto financeiro retroativo | Permissão; justificativa | Datas versionadas; efeito financeiro direcionado a F04 | Não reescreve pagamento/recibo; preserva original; correção segue bloco próprio. |
| B04-VIN-10 | Vínculo inativo | Consultar histórico, concluir última competência ou tratar demissional pendente | Permissões atuais e empresa/contexto válidos | Permanece inativo | Permite operações históricas, financeiras/documentais e acompanhamento, realização, não comparecimento ou encerramento autorizado do ASO demissional; não cria condição ordinária ou alerta periódico novo. |

As viradas `Encerramento programado → Último dia ativo → Inativo` têm uma única fonte: D12-03 e D12-04. Este bloco apenas projeta esses estados na ficha/lista do colaborador; não cria uma segunda transição nem uma segunda auditoria.

## 9.3 Estados derivados

- `Futuro`: data de início posterior à data operacional;
- `Ativo sem registro`: início alcançado, admissão ausente ou ainda futura e sem saída efetiva anterior ao dia;
- `Ativo registrado`: início e admissão alcançados e sem saída efetiva anterior ao dia;
- `Encerramento programado`: data final futura já informada;
- `Último dia ativo`: data operacional igual à data final inclusiva;
- `Inativo`: data operacional posterior à saída real;
- Tipo `Encerrado sem registro` exige ausência de admissão;
- Tipo `Demitido formalmente` exige admissão alcançada até a data de saída;
- Empresa inativa altera somente o modo de operação, não a situação real do vínculo.

## 9.4 Invariantes e transições proibidas

- Um CPF representa uma pessoa dentro de cada empresa;
- O mesmo CPF pode existir em outro CNPJ sem que isso seja revelado;
- Períodos de vínculos da mesma pessoa não se sobrepõem e existe no máximo um ativo por vez;
- Admissão nunca antecede início das atividades;
- Data final é inclusiva e não antecede a data inicial aplicável;
- Desligamento sem registro e demissão formal são mutuamente exclusivos;
- Recontratação cria vínculo, não pessoa ou cópia financeira;
- Estado do vínculo não é livremente editável;
- É proibido inativar manualmente empregado;
- É proibido criar novo vínculo antes do encerramento efetivo do anterior;
- É proibido apagar vínculo, pessoa ou histórico relevante;
- É proibido recalcular silenciosamente evento pago após corrigir pessoa ou datas.

**Base:** Documento 16, seções 8.2, 10, 11, 23–24; Documento 07, seção 11; Lote 2, C01–C03 e C08. O registro detalhado de saída pertence ao Bloco 12.

---

# 10. Bloco 05 — Cadastro, contrato e vigência MEI

## 10.1 Eixos de estado

| Entidade/eixo | Estados |
|---|---|
| Cadastro do prestador | Vigente; corrigido em nova versão |
| Situação temporal do contrato | Futuro; ativo; encerramento programado; encerrado |
| Renovação | Não programada; programada; iniciada |
| Continuidade | Contínua; interrompida |
| Vigência de valor/condições | Futura; vigente; encerrada/substituída |

`Renovação programada` é uma próxima vigência ligada ao mesmo contrato contínuo. Retorno depois de interrupção é um novo contrato e não uma renovação.

Para toda derivação temporal, `fim aplicável = data de encerramento efetivo, quando informada; caso contrário, data final prevista`. A data efetiva registra ou corrige o último dia real e pode ser anterior ou posterior à prevista, desde que não sobreponha outro contrato/renovação e que impactos pagos/fechados sigam F04. Antes do início o contrato é `Futuro`; depois do fim aplicável é `Encerrado`; entre essas datas ele é `Encerramento programado` quando existe encerramento efetivo ainda futuro, e nos demais casos é `Ativo`.

## 10.2 Matriz do cadastro e contrato

| ID | Estado inicial | Evento | Pré-condição/permissão | Estado final | Efeitos e auditoria/bloqueio |
|---|---|---|---|---|---|
| B05-MEI-01 | CNPJ não existente na empresa | Criar prestador e contrato | Empresa ativa; permissão; CNPJ válido; razão social, nome fantasia e endereço completos; contrato válido | Cadastro vigente; contrato futuro ou ativo | Cadastro, contrato e auditoria são atômicos e idempotentes; situação deriva das datas. |
| B05-MEI-02 | Cadastro existente; contratos anteriores encerrados | Criar contrato após interrupção | Novo início posterior ao encerramento efetivo; sem sobreposição; permissão | Cadastro reutilizado; novo contrato futuro ou ativo; continuidade interrompida | Não duplica prestador nem apaga contratos anteriores; novo contrato recebe identidade própria; audita. |
| B05-MEI-03 | Contrato ativo ou período sobreposto | Tentar criar outro contrato | — | Sem novo contrato | Bloqueia; oferece abrir contrato autorizado; não revela existência em outro CNPJ. |
| B05-MEI-04 | Cadastro vigente | Editar razão social, nome fantasia, endereço ou contato | Permissão por campo; versão atual; obrigatórios válidos | Cadastro em nova versão | Telefone/e-mail continuam opcionais e protegidos; antes/depois autorizado é auditado. |
| B05-MEI-05 | Cadastro com histórico | Corrigir CNPJ | Permissão específica; justificativa; CNPJ válido e não usado na empresa; versão atual | Cadastro corrigido em nova versão | Preserva identificador anterior no histórico; não altera contratos ou pagamentos destrutivamente; audita. |
| B05-CON-01 | Contrato futuro | Atingir data inicial | Evento temporal; contrato e datas válidos | Contrato ativo | Situação derivada; primeira competência usa D30 e regra do corte; não cria novo cadastro. |
| B05-CON-02 | Contrato ativo; renovação não programada | Programar renovação contínua | Permissão; próxima data começa no dia seguinte à final prevista; condições revisadas; sem sobreposição | Renovação programada; próxima vigência futura | Copia condições somente para revisão; não inativa entre vigências; audita. |
| B05-CON-03 | Renovação programada | Editar próxima vigência | Permissão; vigência ainda não iniciada; versão atual; datas, valor, forma de pagamento e evento/percentual condicionais válidos | Renovação programada em nova versão | Recalcula apenas prévias futuras; preserva versão anterior e audita. |
| B05-CON-04 | Último dia da vigência atual; renovação programada | Iniciar dia seguinte | Evento temporal; continuidade confirmada | Contrato permanece ativo; nova vigência vigente; eixo corrente volta a `Renovação não programada` | Consome a programação; preserva `Renovação iniciada` somente no histórico; permite programar a renovação seguinte; não existe dia inativo nem reaplicação do corte. |
| B05-CON-05 | Contrato ativo sem renovação | Iniciar dia seguinte à data final prevista inclusiva | Nenhum encerramento efetivo diferente e nenhuma renovação vigente | Encerrado; continuidade interrompida | Permanece ativo durante toda a data final; última competência usa intervalo efetivamente ativo. Se o fim aplicável ocorreu antes ou na data prevista do adiantamento e a base ainda não foi paga nesse evento, o cálculo zera o adiantamento MEI, encaminha toda a base proporcional ao final e permite resolver o grupo zero por G08-07, sem recibo de adiantamento. Demais pagamentos/documentos pendentes continuam possíveis. |
| B05-CON-06 | Contrato ativo ou futuro | Registrar encerramento efetivo antecipado/corrigido | Permissão; data válida e não anterior ao início; sem sobreposição; renovação futura ausente ou reprogramada atomicamente por B05-CON-03; impacto exibido | Encerramento programado ou encerrado conforme data | Preserva data final prevista; última competência usa o fim aplicável; pago/fechado não é reescrito e segue F04; audita. |
| B05-CON-06A | Encerramento programado | Iniciar dia seguinte à data efetiva final inclusiva | Evento temporal do servidor; nenhuma correção posterior vigente | Encerrado; continuidade interrompida | Mantém contrato ativo durante todo o último dia, encerra sua participação operacional no dia seguinte e preserva pagamentos/documentos pendentes. |
| B05-CON-06B | Contrato encerrado | Corrigir data de encerramento efetivo | Permissão específica; justificativa; data válida; sem sobrepor contrato posterior/renovação; impacto e versão conferidos | Estado derivado exatamente pelo início, `fim aplicável` e data operacional | Preserva a versão anterior; data efetiva válida substitui a prevista como último dia real; só restaura operação quando hoje estiver no período corrigido; aberto recalcula e pago/fechado segue F04; audita. |
| B05-CON-06C | Encerramento programado; data ainda não efetiva | Corrigir data de encerramento | Permissão específica; justificativa; nova data válida; sem sobreposição; renovação ausente ou reprogramada atomicamente por B05-CON-03; impacto e versão conferidos | Encerramento programado em nova versão | Recalcula somente competências/eventos abertos atingidos e preserva a programação anterior; se a nova data já passou, usa B05-CON-06D; pagamento ou fechamento afetado segue F04; audita. |
| B05-CON-06D | Encerramento programado; nova data já passada | Corrigir data de encerramento | Mesmas validações de B05-CON-06C; renovação incompatível resolvida; data anterior ao dia operacional | Encerrado em nova versão; continuidade interrompida | Aplica o encerramento corrigido, preserva versões e materializa impacto autorizado; não encerra/desfaz pagamento silenciosamente; usa F04 quando aplicável; audita. |
| B05-CON-07 | Contrato encerrado; houve interrupção | Criar retorno | Permissão; novo período posterior e não sobreposto | Novo contrato futuro ou ativo | Não é renovação; reaplica regras de primeiro ingresso, inclusive corte; preserva contrato anterior. |
| B05-CON-08 | Contrato ainda ativo | Tentar criar retorno após interrupção | Não existe interrupção efetiva | Permanece contrato atual | Ação indisponível com explicação; não cria contrato paralelo. |
| B05-CON-09 | Contrato/vigência sem competência afetada ou pagamento | Alterar valor ou forma de pagamento com data futura | Permissão; nova vigência válida; valor > 0; parcela única com evento, ou duas parcelas com percentual > 0% e < 100% | Nova vigência futura; anterior termina no dia precedente | Não edita valor vigente destrutivamente; impede sobreposição; audita. |
| B05-CON-10 | Vigência ativa; competência aberta e evento não pago | Alterar valor/condições a partir de data na competência | Permissão; intervalos D30 válidos; versão atual | Nova vigência; competência marcada para recálculo | Usa `PARTILHAR_D30` da seção 12.4.2 para atribuir as posições comerciais uma única vez; grupos retornam ao cálculo e exigem nova conferência. |
| B05-CON-11 | Vigência com pagamento ou competência fechada | Alterar valor/condições com efeito retroativo | Permissão e justificativa | Nova versão contratual; efeito financeiro em F04 | Preserva confirmação e recibo; não recalcula silenciosamente; audita correção solicitada. |
| B05-CON-12 | Qualquer contrato | Empresa contratante é inativada | Evento do Bloco 02 | Situação contratual real permanece; contexto em modo histórico | Empresa inativa não encerra contrato artificialmente; bloqueia novas edições/movimentações ordinárias. |

## 10.3 Resultados financeiros derivados do contrato

- Competência intermediária completa usa o valor mensal integral;
- Primeira e última competências usam `valor mensal ÷ 30 × D30(período ativo)`;
- Em duas parcelas, início no dia 15 ou antes permite adiantamento proporcional conforme o percentual; início no dia 16 ou depois não gera adiantamento inicial e toda a base proporcional segue ao final;
- Em parcela única, o evento escolhido é adiantamento ou pagamento final; quando o corte impedir o adiantamento inicial, a parcela migra integralmente ao final;
- Na última competência, a regra de encerramento prevalece sobre o corte de entrada: se `fim aplicável <= data prevista do adiantamento` e não existe pagamento efetivo da base no adiantamento, o adiantamento MEI devido é zero, toda a base proporcional vai ao final, o grupo zero segue G08-07 e nenhum recibo de adiantamento é emitido; isso também vale quando a parcela única havia sido configurada no adiantamento;
- Renovação contínua não reaplica o corte; retorno após interrupção reaplica;
- Mudança de valor no meio do mês usa a partilha D30 entre vigências contíguas; a soma das posições deve coincidir exatamente com o D30 do direito total e nunca ultrapassa 30 na competência;
- Pagamento final da base deduz somente adiantamento da própria base efetivamente pago;
- Excedente de adiantamento sobre a base final produz diferença absorvida, nunca cobrança;
- Serviços adicionais são positivos, avulsos, integrais, exclusivos da competência e do pagamento final;
- Serviço adicional criado depois do final pago segue a ajuste positivo;
- Encerramento contratual é operado em M03/M04 e nunca usa D03 ou `Cancelado por desligamento`.

## 10.4 Invariantes e transições proibidas

- CNPJ é reutilizado dentro da mesma empresa e pode existir em outro CNPJ contratante sem revelação cruzada;
- Data inicial e data final prevista são obrigatórias; final é inclusiva e não antecede início;
- Data prevista e encerramento efetivo são campos diferentes;
- Valor mensal é maior que zero;
- Contratos do mesmo prestador na empresa não se sobrepõem;
- A condição mensal do MEI aceita uma ou duas parcelas; parcela única exige evento, duas parcelas exigem percentual maior que 0% e menor que 100%; na primeira competência, o corte do dia 15 pode suprimir a parcela de adiantamento e encaminhar todo o proporcional ao final;
- No encerramento MEI antes ou na data prevista do adiantamento ainda não pago, é proibido manter valor positivo ou confirmar o grupo de adiantamento; o redirecionamento integral ao final não usa `Cancelado por desligamento`;
- Cadastro MEI não possui salário-base, holerite, líquido do contador, RA, salário redondo, complemento trabalhista, ASO, rescisão ou nota fiscal;
- Situação não é livremente digitada e não existe inativação manual do MEI;
- É proibido editar destrutivamente vigência que já afetou competência ou pagamento;
- É proibido somar mais de 30 dias D30 na mesma competência;
- É proibido tratar retorno após interrupção como renovação contínua;
- É proibido deduzir serviço adicional do adiantamento da base;
- É proibido transformar diferença negativa em cobrança ao prestador.

**Base:** Documento 16, seções 8.2, 10, 12–14, 23–24 e 31.11/31.14; Documento 07, seção 23; Lote 2, M01–M06.

---

# 11. Bloco 06 — Condições financeiras e complementos do empregado

## 11.1 Eixos de estado

| Entidade/eixo | Estados |
|---|---|
| Condição versionada | Não configurada; futura; vigente; encerramento programado; encerrada/substituída |
| Origem do percentual de adiantamento | Padrão empresarial; exceção individual vigente |
| RA | Sem RA; futura; vigente; encerramento programado; encerrada/substituída |
| Salário redondo | Desmarcado; marcado; encerramento programado |
| Reembolso por evento | Pendente de informação; valores reais informados; zero confirmado |
| Complemento recorrente | Futuro; vigente; encerramento programado; encerrado/substituído |
| Complemento avulso | Criado na competência; destinado ao final; encaminhado a ajuste positivo |
| Período sem registro | Base pendente; base confirmada; linha calculada por competência; encerrado |
| Impacto financeiro | Sem evento gerado; aberto e recalculável; pago/fechado e sujeito a F04 |

Condições versionadas definem o devido. Os estados de grupo, conferência, confirmação e correção serão formalizados nos Blocos 07 a 10.

## 11.2 Matriz de salário-base, adiantamento e RA

| ID | Estado inicial | Evento | Pré-condição/permissão | Estado final | Efeitos e auditoria/bloqueio |
|---|---|---|---|---|---|
| B06-FIN-01 | Salário-base não configurado; admissão existente | Informar salário-base inicial | Permissão C04; valor > 0; competência inicial; sem sobreposição | Salário-base futuro ou vigente | Cria versão; total acordado é derivado; oficial do contador continua autoritativo; audita. |
| B06-FIN-02 | Salário-base vigente; escopo interno aberto/não pago | Alterar salário-base | Permissão; nova versão e vigência válidas; impacto exibido | Nova versão futura/vigente; anterior encerrada | Não cria diferença oficial automática; dependências internas aplicáveis podem recalcular e exigem conferência; audita. |
| B06-FIN-03 | Salário-base vigente; evento pago ou competência fechada | Corrigir vigência/valor retroativo | Permissão e justificativa | Nova versão; financeiro já pago preservado | Diferença oficial não é calculada; impacto interno que exigir correção vai a F04; recibo/confirmação não são reescritos. |
| B06-FIN-04 | Percentual herdado da empresa | Criar exceção individual | Permissão; percentual > 0% e < 100%; competência inicial e vigência sem sobreposição | Exceção individual futura ou vigente | Competências aplicáveis passam a usar a exceção; alteração auditada; padrão empresarial permanece intacto. |
| B06-FIN-05 | Exceção individual vigente | Encerrar exceção | Permissão; última competência devida válida | Exceção com encerramento programado; depois retorna ao padrão | Não altera competências anteriores nem eventos pagos; audita. |
| B06-FIN-06 | Exceção individual futura, vigente ou com encerramento programado | Alterar percentual/vigência, inclusive remover ou prorrogar o fim programado | Permissão; nova versão sem sobreposição; percentual > 0% e < 100%; impacto exibido | Versão anterior substituída; nova exceção futura/vigente ou com novo encerramento programado | Evento aberto volta ao cálculo/conferência; evento pago é preservado e impacto retroativo segue F04; audita. |
| B06-FIN-07 | Condição financeira futura | Atingir competência inicial | Vigência válida e não sobreposta | Condição vigente | Aplicabilidade é derivada; grupos ainda abertos passam a considerar a condição; o salvamento da versão, não a virada do calendário, contém a auditoria de alteração. |
| B06-FIN-08 | Condição com encerramento programado | Iniciar competência posterior à última devida | Evento temporal | Condição encerrada; padrão/próxima versão aplicável assume quando existir | Não apaga competências anteriores nem reprocessa pagamento; aplicabilidade é derivada da vigência. |
| B06-RA-01 | Sem RA | Criar RA positiva | Permissão; valor fixo; competência inicial; uma ou duas parcelas válidas | RA futura ou vigente | Cria versão; primeira competência usa início das atividades e D30; total acordado é recalculado; audita. |
| B06-RA-02 | RA vigente ou com encerramento programado; competência aberta/não paga | Alterar valor, parcelamento ou vigência, inclusive remover/prorrogar o fim | Permissão; nova versão sem sobreposição; impacto exibido | RA substituída por nova versão futura, vigente ou com novo fim programado | Alteração vale para a competência inteira, salvo proporcionalidade da primeira/última; grupos aplicáveis recalculam e voltam à conferência. |
| B06-RA-03 | RA vigente; evento pago ou competência fechada | Corrigir valor/vigência afetada | Permissão e justificativa | Nova versão; pagamento original preservado | Não reprocessa silenciosamente; inicia F04 e apura saldo/excedente somente contra RA efetivamente paga, sem compensar reembolso ou outra verba; audita. |
| B06-RA-04 | RA vigente | Programar encerramento próprio da RA | Permissão; última competência devida válida | Encerramento programado; depois encerrada | Mantém a RA integral até a última competência inclusiva; não cria proporcionalidade por encerrar a condição. Somente o desligamento do vínculo usa saldo proporcional no acerto do Bloco 12; audita. |
| B06-RA-05 | RA futura/vigente | Alterar admissão sem alterar início | Datas do vínculo válidas | Mesmo estado de RA, salvo versionamento explícito | Admissão não reinicia RA e não inclui RA no período sem registro; eventual impacto segue regras de evento aberto/pago. |
| B06-RA-06 | Sem RA devida no adiantamento; adiantamento já pago; final aberto | Criar RA na competência corrente | Permissão; competência aberta; valor positivo; vigência e forma válidas | RA vigente; valor corrente destinado ao pagamento final | Não reabre o adiantamento; todo o valor de RA devido na competência, já aplicada eventual proporcionalidade da primeira competência, segue ao final porque não existe RA paga da mesma verba a deduzir; audita. |

## 11.3 Matriz de salário redondo e reembolso real

| ID | Estado inicial | Evento | Pré-condição/permissão | Estado final | Efeitos e auditoria/bloqueio |
|---|---|---|---|---|---|
| B06-REB-01 | Salário redondo desmarcado | Ativar marcador | Permissão; competência inicial; vigência válida | Marcado | A competência inicial controla a aplicabilidade futura/vigente; cria lembrete por evento, não calcula imposto/valor e audita. |
| B06-REB-02 | Marcado | Programar encerramento | Permissão; competência final válida | Encerramento programado; depois desmarcado para competências futuras | Não apaga reembolsos anteriores; audita. |
| B06-REB-02A | Encerramento programado ainda não efetivado | Remover ou alterar competência final | Permissão; nova competência válida ou retirada explícita; impacto e versão conferidos | Marcado sem fim ou Encerramento programado em nova versão, conforme a ação | Preserva versões e reembolsos anteriores; eventos abertos são reavaliados e pagos não são reescritos; audita. |
| B06-REB-03 | Evento aplicável; `Pendente de informação` | Informar valores reais | Permissão K05/campos; categorias e valores válidos | Valores reais informados | Registra INSS, IR, sindicato e/ou outro apenas como dados manuais; compõe grupo `RA e reembolso`; audita linhas. |
| B06-REB-04 | Evento aplicável; `Pendente de informação` | Confirmar que não houve reembolso | Permissão e confirmação explícita | Zero confirmado | Resolve a entrada obrigatória do evento sem criar linha financeira positiva; audita confirmação. |
| B06-REB-04A | Valores reais informados ou zero confirmado; evento não pago | Substituir por valores reais | Permissão de editar reembolso; competência aberta; categorias/valores válidos; versão atual | Valores reais informados | Cria nova versão, recalcula somente `RA e reembolso` e exige nova conferência; grupo pronto volta a calculado; nunca altera RA. |
| B06-REB-04B | Valores reais informados ou zero confirmado; evento não pago | Confirmar zero | Permissão; competência aberta; confirmação explícita; versão atual | Zero confirmado | Cria nova versão, retira linhas positivas anteriores do evento ainda não pago, recalcula o grupo e exige nova conferência; audita. |
| B06-REB-04C | Valores reais informados ou zero confirmado; evento não pago | Reabrir informação | Permissão; competência aberta; justificativa; versão atual | Pendente de informação | Invalida somente a conferência corrente e bloqueia pagamento até nova informação/zero; preserva versões e audita. |
| B06-REB-05 | Valor de reembolso já pago | Corrigir valor | Permissão F04 e justificativa | Original preservado; ajuste positivo e/ou diferença absorvida por componente | Nunca compensa silenciosamente RA e reembolso; recibo de ajuste contém somente linhas positivas pagas. |

## 11.4 Matriz de complementos

| ID | Estado inicial | Evento | Pré-condição/permissão | Estado final | Efeitos e auditoria/bloqueio |
|---|---|---|---|---|---|
| B06-CMP-01 | Complemento recorrente inexistente | Criar recorrente | Permissão C04; descrição; valor fixo positivo; competência inicial; competência final opcional; forma/percentual válidos | Futuro ou vigente, com prazo determinado ou indeterminado | Cria versão; valor integral na competência; ausência de competência final mantém recorrência até encerramento posterior; vários complementos distintos podem coexistir; audita. |
| B06-CMP-02 | Recorrente vigente ou com encerramento programado; evento não pago | Alterar valor, descrição, parcelamento ou vigência, inclusive remover/prorrogar o fim | Permissão; nova versão sem sobreposição; impacto exibido | Versão anterior substituída; nova vigente/futura ou com novo fim programado | Alteração vale para toda a competência, sem dias proporcionais; recalcula evento aberto e exige nova conferência. |
| B06-CMP-03 | Recorrente vigente; evento pago/competência fechada | Corrigir competência afetada | Permissão e justificativa | Nova versão; pagamento preservado | Direciona a F04; nela, saldo e excedente são apurados somente contra o valor efetivamente pago do mesmo complemento; não sobrescreve recibo ou confirmação. |
| B06-CMP-04 | Recorrente vigente ou indeterminado | Encerrar | Permissão; última competência devida informada | Encerramento programado; depois encerrado | Mantém devido integral até a competência final inclusiva; audita. |
| B06-CMP-05 | Competência aberta | Criar complemento avulso | Permissão K05; descrição e valor positivo | Criado somente na competência | Pode coexistir com outros avulsos; não cria recorrência nem vigência em C04; audita. |
| B06-CMP-06 | Complemento devido; adiantamento ainda aberto | Definir uma ou duas parcelas | Parcela única com evento; duas parcelas com percentual > 0% e < 100% | Distribuição válida | Uma parcela vai ao evento escolhido; duas parcelas preservam total por diferença de centavos; sem arredondamento especial. |
| B06-CMP-07 | Complemento criado depois do adiantamento efetivamente pago | Calcular destino | Competência aberta; final não pago | Integralmente destinado ao pagamento final | Não reabre nem corrige adiantamento já pago; mantém recibo separado do complemento. |
| B06-CMP-08 | Complemento criado/corrigido depois do final pago | Apurar diferença | Valor positivo devido e permissão | Ajuste positivo pendente | F04/F05 preservam pagamento anterior; ajuste gera recibo apenas quando pago. |

## 11.5 Matriz do período sem registro

| ID | Estado inicial | Evento | Pré-condição/permissão | Estado final | Efeitos e auditoria/bloqueio |
|---|---|---|---|---|---|
| B06-PSR-01 | Vínculo sem admissão; base pendente | Confirmar base mensal própria | Permissão; valor positivo; confirmação de que dias não estão no oficial | Base confirmada | Base é independente de salário-base e RA; grava versão e auditoria. |
| B06-PSR-02 | Base confirmada; competência aplicável | Calcular linha da competência | Início atingido; intervalo dentro da competência; limite conhecido/provisório | Linha calculada por D30 | Usa o primeiro limite entre dia anterior à admissão, saída sem registro e fim da competência; nunca atravessa competência. |
| B06-PSR-03 | Linha calculada; evento aberto/não pago | Alterar admissão, saída ou base | Permissão; datas válidas; versão atual | Linha recalculada | Mostra memória, datas inclusivas e divisor 30; retorna à conferência; audita alteração de origem. |
| B06-PSR-04 | Linha paga ou competência fechada | Alterar admissão, saída ou base com impacto | Permissão e justificativa | Linha original preservada; correção F04 | Não sobrescreve valor pago ou recibo; apura diferença por componente. |
| B06-PSR-05 | Período aberto sem admissão/saída | Fechar cálculo provisório da competência | Base confirmada e fim da competência | Linha daquela competência calculada; período continua na seguinte | Cada competência recebe linha própria; novo mês não altera linha paga anterior. |
| B06-PSR-06 | Período sem registro vigente | Registrar admissão | Admissão ≥ início | Período encerrado no dia anterior à admissão | Competências abertas recalculam; pagas/fechadas seguem F04; RA permanece separada. |
| B06-PSR-07 | Base confirmada | Configurar pagamento dividido | Percentual de adiantamento aplicável ao empregado; início no dia 15 ou antes | Elegível a adiantamento e final | Percentual vem do padrão empresarial ou exceção individual da competência. |
| B06-PSR-08 | Base confirmada | Configurar 100% no final ou aplicar corte | Escolha explícita, ou início no dia 16 ou depois | Somente pagamento final | Nenhum valor desaparece; não cria divisão artificial 0%/100%. |

## 11.6 Estados e valores derivados

- `Total acordado = salário-base oficial + RA`;
- Total acordado é somente leitura e não inclui complemento, período sem registro ou reembolso;
- Sem salário-base, a soma informativa de base do período sem registro e RA chama-se `Composição informada do período`, não total acordado;
- RA da primeira competência é proporcional desde o início das atividades;
- RA de competências intermediárias é integral;
- RA da competência final é proporcional no acerto complementar e usa valor vigente na saída;
- Na primeira competência, o oficial usa a admissão para o corte: dia 15 ou antes permite adiantamento oficial proporcional; dia 16 ou depois deixa o oficial somente no líquido autoritativo do final;
- Na primeira competência, RA, complementos e período sem registro usam o início das atividades para o corte: dia 15 ou antes permite adiantamento conforme a configuração; dia 16 ou depois destina todo o devido ao final;
- Perder o corte nunca elimina valor devido, e data de corte, data prevista e data efetiva do pagamento permanecem referências distintas;
- Complemento é sempre integral na competência e nunca proporcional por dia;
- Período sem registro usa `base própria ÷ 30 × D30(intervalo)` e exclui RA/complemento;
- Salário-base alterado não cria diferença oficial automática, porque o líquido do contador já contém o ajuste oficial;
- Valores monetários persistem em centavos com arredondamento normal da terceira casa; a parcela final absorve centavo residual por diferença;
- O arredondamento especial para cima de complementos não existe.

### 11.6.1 Regras normativas e executáveis do D30

O cálculo do intervalo isolado, a partilha entre vigências contíguas, seus pseudocódigos e tabelas-verdade estão na seção 12.4. Toda proporcionalidade chama a regra adequada ao contexto; nenhuma implementação pode somar intervalos isolados sobrepostos nem substituí-los por dias corridos.

## 11.7 Invariantes e transições proibidas

- Vigências da mesma condição não se sobrepõem; versões substituem-se e não se somam;
- Complementos distintos podem coexistir; versões do mesmo complemento não se sobrepõem;
- Valor positivo de RA exige competência inicial;
- Duas parcelas exigem percentual maior que 0% e menor que 100%; 100% em um evento é parcela única;
- Alteração financeira mostra competências, eventos abertos, pagos, recálculo e necessidade de correção antes de salvar;
- Evento pago nunca é reprocessado silenciosamente;
- Em correção posterior ao adiantamento, `saldo final da verba = máximo(0, novo total devido da verba − valor efetivamente pago da mesma verba)` e `excedente = máximo(0, valor efetivamente pago da mesma verba − novo total devido da verba)`; saldo positivo vai ao final quando este ainda está aberto ou a ajuste quando já foi pago, e excedente é absorvido;
- Reembolso é sempre informado manualmente ou confirmado como zero;
- É proibido calcular automaticamente INSS, IR, sindicato, líquido oficial, folha ou rescisão;
- É proibido incluir RA/complemento na base do período sem registro;
- É proibido incluir complemento no total acordado ou no acerto complementar de RA;
- É proibido arredondar salário ou complemento sempre para cima;
- É proibido compensar silenciosamente componente positivo com componente pago a maior;
- É proibido copiar condições financeiras em recontratação;
- É proibido criar complemento avulso em C04 ou transformá-lo automaticamente em recorrente;
- É proibido editar total acordado.

**Base:** Documento 16, seções 10–14, 23–24 e 31.9–31.11; Documento 07, seção 12; Lote 2, C02–C04. Os estados de cálculo, confirmação, correção e documento são completados nos Blocos 07 a 11.

---

# 12. Bloco 07 — Competência

## 12.1 Convenções de leitura das matrizes

- `—` significa que a entidade ainda não existe;
- estado entre crases é persistido ou derivado de fonte persistida;
- `Indicador` não substitui estado oficial;
- permissão mencionada é sempre revalidada no servidor;
- toda ação sensível grava usuário, data/hora, empresa, versão, resultado e chave de repetição;
- falha da auditoria obrigatória reverte a ação de negócio;
- identificador de outra empresa responde como não encontrado;
- versão antiga bloqueia gravação e nunca sobrescreve a versão atual.

## 12.2 Escopos financeiros indivisíveis

```text
Competência = empresa + mês/ano + versão

Grupo do evento =
empresa + competência + participante + grupo + evento + versão

Correção =
empresa + competência + participante + grupo + evento + versão de origem

Recibo =
empresa + confirmação + tipo documental + versão
```

Não existe confirmação que misture empresas, competências, grupos ou eventos.

## 12.3 Eventos financeiros oficiais

- `Adiantamento`;
- `Pagamento final`;
- `Desligamento`;
- `Ajuste`.

`Pago` significa que um usuário autorizado confirmou que o dinheiro foi efetivamente entregue. Não existe estado de processamento bancário.

---

## 12.4 Função D30 executável e moeda

### 12.4.1 Algoritmo normativo do intervalo isolado

Todas as proporcionalidades aprovadas chamam uma única função. O intervalo é inclusivo e, quando atravessa competências, é dividido mês a mês.

```text
função dia_comercial(data):
    se dia(data) = 31:
        retornar 30
    se mês(data) = fevereiro e data = último_dia_do_mês(data):
        retornar 30
    retornar dia(data)

função D30(data_inicial, data_final):
    exigir data_inicial <= data_final
    total = 0
    cursor = primeiro_dia_do_mês(data_inicial)

    enquanto cursor <= data_final:
        inicio_segmento = máximo(data_inicial, cursor)
        fim_segmento = mínimo(data_final, último_dia_do_mês(cursor))

        inicio_comercial = dia_comercial(inicio_segmento)
        fim_comercial = dia_comercial(fim_segmento)

        dias_segmento = máximo(1, fim_comercial - inicio_comercial + 1)
        total = total + mínimo(30, dias_segmento)

        cursor = primeiro_dia_do_mês(cursor + 1 mês)

    retornar total
```

Consequências executáveis:

- a mesma data sempre representa um dia;
- dia 30 e dia 31 ocupam a mesma posição comercial quando pertencem ao mesmo segmento;
- o último dia de fevereiro ocupa a posição comercial 30;
- um segmento mensal nunca possui mais de 30 dias;
- intervalo entre meses soma os segmentos, sem aplicar limite 30 ao intervalo total.

### 12.4.2 Partilha D30 entre vigências contíguas

A função `D30` acima calcula um intervalo isolado. Quando **um mesmo direito mensal contínuo** é dividido entre duas ou mais vigências com bases diferentes, calcular cada trecho isoladamente pode somar 31 dias ou distribuir fevereiro incorretamente. Nessa situação, é obrigatória a função `PARTILHAR_D30`, que atribui cada posição comercial do direito exatamente uma vez.

```text
função PARTILHAR_D30(início_do_direito, fim_do_direito, vigências_contíguas):
    exigir vigências ordenadas, sem lacuna e sem sobreposição
    exigir que a união das vigências seja exatamente o intervalo do direito

    para cada competência alcançada:
        recortar o direito e as vigências para aquela competência
        posições_devidas = posições comerciais entre
                           dia_comercial(início_recortado) e
                           dia_comercial(fim_recortado), inclusive

        atribuir cada posição_devida a exatamente uma vigência:
            mês com 30 dias: posição p pertence ao dia p

            mês com 31 dias:
                posições 1 a 29 pertencem aos respectivos dias
                posição 30 pertence ao último dia alcançado entre 30 e 31
                que esteja dentro do direito recortado

            fevereiro:
                posições que correspondem a dias existentes pertencem
                aos respectivos dias
                posições residuais até 30 pertencem ao último dia de
                fevereiro, somente quando ele está dentro do direito

        dias_da_vigência = quantidade de posições atribuídas a ela

    exigir soma(dias_da_vigência) = D30(início_do_direito, fim_do_direito)
    retornar dias_da_vigência por competência e vigência
```

Regras de fronteira:

- o intervalo de direito é definido primeiro; a partilha não fabrica direito fora dele;
- um intervalo unitário continua valendo um dia, inclusive dia 31 ou último dia de fevereiro;
- em mês de 31 dias coberto até o dia 31, a posição 30 pertence à vigência que cobre o dia 31; se o direito terminar no dia 30, pertence à vigência que cobre o dia 30;
- em fevereiro coberto até o último dia, as posições residuais pertencem à vigência que cobre esse último dia; se o direito começar apenas no último dia, existe somente uma posição devida;
- uma vigência pode receber zero posições numa partilha de fronteira, mas nunca valor negativo; isso não transforma a data civil em inexistente nem altera a vigência cadastral;
- a memória guarda o intervalo total, cada vigência, as posições atribuídas e a prova de que a soma coincide com o D30 total.

### 12.4.3 Casos obrigatórios de teste do D30

| Caso | Entrada | Dias D30 | Memória com base de R$ 3.000,00 | Resultado |
|---|---|---:|---|---:|
| Mês de 31 dias completo | 01/01/2026 a 31/01/2026 | 30 | `3.000 ÷ 30 × 30` | R$ 3.000,00 |
| Fevereiro de 28 dias completo | 01/02/2026 a 28/02/2026 | 30 | `3.000 ÷ 30 × 30` | R$ 3.000,00 |
| Fevereiro bissexto completo | 01/02/2028 a 29/02/2028 | 30 | `3.000 ÷ 30 × 30` | R$ 3.000,00 |
| Dia 15 ao fim | 15/09/2026 a 30/09/2026 | 16 | `3.000 ÷ 30 × 16` | R$ 1.600,00 |
| Dia 16 ao fim | 16/09/2026 a 30/09/2026 | 15 | `3.000 ÷ 30 × 15` | R$ 1.500,00 |
| Dia 1 ao dia 28 | 01/01/2026 a 28/01/2026 | 28 | `3.000 ÷ 30 × 28` | R$ 2.800,00 |
| Dia 28 ao fim de mês com 31 dias | 28/01/2026 a 31/01/2026 | 3 | `3.000 ÷ 30 × 3` | R$ 300,00 |
| Dia 1 ao dia 29 | 01/01/2026 a 29/01/2026 | 29 | `3.000 ÷ 30 × 29` | R$ 2.900,00 |
| Dia 29 ao fim de mês com 31 dias | 29/01/2026 a 31/01/2026 | 2 | `3.000 ÷ 30 × 2` | R$ 200,00 |
| Dia 1 ao dia 30 | 01/01/2026 a 30/01/2026 | 30 | `3.000 ÷ 30 × 30` | R$ 3.000,00 |
| Dia 30 ao fim de mês com 31 dias | 30/01/2026 a 31/01/2026 | 1 | `3.000 ÷ 30 × 1` | R$ 100,00 |
| Início no dia 10 | 10/09/2026 a 30/09/2026 | 21 | `3.000 ÷ 30 × 21` | R$ 2.100,00 |
| Início ao dia anterior à admissão | 01/09/2026 a 14/09/2026 | 14 | `3.000 ÷ 30 × 14` | R$ 1.400,00 |
| Um único dia comum | 14/09/2026 a 14/09/2026 | 1 | `3.000 ÷ 30 × 1` | R$ 100,00 |
| Somente dia 31 | 31/01/2026 a 31/01/2026 | 1 | `3.000 ÷ 30 × 1` | R$ 100,00 |
| Dias 30 e 31 | 30/01/2026 a 31/01/2026 | 1 | `3.000 ÷ 30 × 1` | R$ 100,00 |
| Fim parcial de fevereiro | 27/02/2026 a 28/02/2026 | 4 | `3.000 ÷ 30 × 4` | R$ 400,00 |
| Último dia de fevereiro isolado | 28/02/2026 a 28/02/2026 | 1 | `3.000 ÷ 30 × 1` | R$ 100,00 |
| Último dia de fevereiro bissexto isolado | 29/02/2028 a 29/02/2028 | 1 | `3.000 ÷ 30 × 1` | R$ 100,00 |
| Intervalo entre competências | 31/01/2026 a 01/02/2026 | 2 | `1 dia em janeiro + 1 dia em fevereiro` | R$ 200,00 |
| Mudança MEI no meio do mês | R$ 3.000 de 01 a 15; R$ 3.600 de 16 a 30 | 15 + 15 | `3.000 ÷ 30 × 15 + 3.600 ÷ 30 × 15` | R$ 3.300,00 |
| Partilha no dia 31 | Direito de 01 a 31/01; R$ 3.000 de 01 a 30 e R$ 3.600 no dia 31 | 29 + 1 | `3.000 ÷ 30 × 29 + 3.600 ÷ 30 × 1` | R$ 3.020,00 |
| Partilha no fim de fevereiro comum | Direito de 01 a 28/02; R$ 3.000 de 01 a 27 e R$ 3.600 no dia 28 | 27 + 3 | `3.000 ÷ 30 × 27 + 3.600 ÷ 30 × 3` | R$ 3.060,00 |
| Último dia de fevereiro como direito unitário | Direito e vigência somente em 28/02; base R$ 3.600 | 1 | `3.600 ÷ 30 × 1` | R$ 120,00 |

### 12.4.4 Regra monetária executável

```text
valor_proporcional = base_mensal ÷ 30 × D30(início, fim)
valor_do_componente = arredondar_normal(valor_proporcional, 2 casas)

primeira_parcela = arredondar_normal(total_do_componente × percentual, 2 casas)
parcela_final_planejada = total_do_componente − primeira_parcela

saldo_final_real = máximo(
    0,
    total_devido_da_verba − valor_efetivamente_pago_da_mesma_verba
)
```

- cálculo intermediário usa decimal, nunca ponto flutuante binário;
- a terceira casa é arredondada normalmente (`0` a `4` mantém; `5` a `9` eleva a segunda casa);
- não existe arredondamento especial de complemento;
- parcela final por diferença absorve o centavo residual;
- valor efetivamente pago, e não parcela meramente prevista, controla o saldo real.

---

## 12.5 Estados oficiais e indicador derivado

Estados oficiais:

```text
Em preparação
Aguardando holerites
Em conferência
Fechada
Reaberta
```

`Em pagamentos` é apenas indicador derivado quando existem grupos prontos ainda não pagos. Não substitui nem altera o estado oficial.

## 12.6 Matriz de transições da competência

| ID | Estado inicial | Evento | Pré-condição/permissão | Estado final | Efeitos | Auditoria/bloqueio |
|---|---|---|---|---|---|---|
| K07-01 | — | Criar competência | Empresa ativa; mês igual ou posterior ao corte; `Criar competência`; todos os campos obrigatórios editáveis | Em preparação | Grava mês/ano único, datas previstas e versão 1; inclui vínculos e contratos ativos em alguma parte do mês | Operação idempotente; duplicidade empresa+mês, empresa inativa, clique repetido ou campo inválido bloqueiam |
| K07-02 | — | Tentar criar competência já existente | Mesma empresa e mês | Competência existente, sem alteração | Mostra destino para abrir a competência existente | Registra tentativa segura; não cria segunda competência nem incrementa versão |
| K07-03 | Em preparação, aguardando holerites, em conferência ou reaberta | Atualizar participantes | `Atualizar participantes`; competência aberta; versão atual | Mesmo estado oficial | Inclui ou corrige participantes sem duplicar; recalcula somente grupos ainda editáveis | Pagamento, recibo e grupo confirmado não são reprocessados; versão concorrente bloqueia |
| K07-04 | Fechada | Atualizar participantes ou condição retroativa | `Reabrir competência` e, conforme o caso, `Iniciar correção` | Fechada até confirmação da reabertura | Apenas apresenta impacto e direciona ao fluxo autorizado | Reprocessamento silencioso é proibido |
| K07-05 | Em preparação | Resolver todos os adiantamentos aplicáveis | Grupos do adiantamento resolvidos; existe ao menos um K06 obrigatório `Pendente` ou `Inconsistente`; sem correção aberta | Aguardando holerites | Atualiza checklist e mantém finais dependentes do contador como pendentes | A contagem considera o estado real de K06, não apenas a existência de empregados oficiais; não confirma pagamento |
| K07-05A | Em preparação | Resolver todos os adiantamentos com K06 já resolvido | Todos os grupos do adiantamento resolvidos; zero K06 obrigatório pendente/inconsistente, seja porque não é necessário ou porque já foi preenchido; sem correção aberta | Em conferência | Libera conferência dos grupos finais não oficiais, oficiais já informados ou MEI | Transição derivada e auditada; não fabrica grupo oficial |
| K07-06 | Aguardando holerites | Informar todos os líquidos oficiais necessários | K06 sem linha pendente ou inconsistente; valores salvos individualmente | Em conferência | Libera cálculo e conferência dos grupos finais | Valor oficial não é decomposto nem recalculado |
| K07-07 | Em preparação, aguardando holerites ou em conferência | Surgir grupo pronto ainda não pago | Leitura autorizada dos grupos | Mesmo estado oficial; indicador Em pagamentos ativo | Exibe pendências e links autorizados | Indicador não pode revelar grupo oculto e não produz auditoria financeira |
| K07-08 | Em preparação, aguardando holerites, em conferência ou reaberta | Fechar competência | `Fechar competência`; visão integral do checklist; versão atual; todos os requisitos resolvidos | Fechada | Congela versão, data e responsável; encerra indicador Em pagamentos | Revalidação integral e transação; repetição devolve o fechamento existente |
| K07-09 | Estado aberto ou reaberto | Tentar fechar com pendência | `Fechar competência`, mas checklist incompleto | Mesmo estado | Mostra quantidade e destino de cada impedimento autorizado | Bloqueia sem alterar versão; não revela categoria não autorizada |
| K07-10 | Fechada | Reabrir | `Reabrir competência`; justificativa; versão atual | Reaberta, nova versão | Preserva snapshot da versão fechada e libera somente operações autorizadas | Ação e auditoria atômicas; não desfaz pagamentos nem recibos |
| K07-11 | Reaberta | Fechar novamente | Mesmas condições de K07-08 | Fechada | Preserva todas as versões e registra novo fechamento | Não existe retorno automático a fechada |
| K07-12 | Qualquer estado editável | Salvar com versão antiga | Registro alterado por outro usuário | Mesmo estado atual do servidor | Descarta a tentativa antiga e exige atualização | Conflito auditado; nenhum dado recente é sobrescrito |
| K07-13 | Qualquer estado | Repetir ação após resposta incerta | Mesma chave de repetição e mesmo conteúdo | Estado real já persistido | Consulta resultado antes de oferecer nova tentativa | Mesma chave com conteúdo diferente é rejeitada |
| K07-14 | Qualquer estado | Inativar empresa | Permissão empresarial externa ao módulo | Mesmo estado, modo histórico | Bloqueia criar, recalcular, confirmar, corrigir, reabrir ou fechar | Consulta histórica permanece conforme permissão |

## 12.7 Checklist normativo de fechamento

A competência só pode fechar quando:

- todos os líquidos necessários estiverem informados e consistentes;
- todo grupo aplicável estiver `Pago`, `Não aplicável` ou terminalmente `Cancelado por desligamento` nas condições do Bloco 12;
- todo salário redondo tiver valor real ou confirmação expressa de zero por evento;
- rescisões oficiais e acertos complementares aplicáveis estiverem resolvidos;
- ajustes positivos estiverem pagos;
- diferenças negativas estiverem registradas como absorvidas;
- não houver correção aberta, conflito ou operação incerta;
- recibos substitutos exigidos pela correção estiverem resolvidos.

ASO demissional pendente não bloqueia o fechamento financeiro.

## 12.8 Invariantes da competência

1. Existe no máximo uma competência por empresa e mês.
2. Datas previstas são informadas pelo usuário, podem ser editadas e não provam pagamento.
3. Pagamento final pode possuir data prevista no mês seguinte.
4. Fechamento não confirma grupo nem pagamento.
5. Reabertura não apaga a versão anterior.
6. Trocar competência recarrega todas as abas e elimina seleção da competência anterior.
7. Vínculo ou contrato cadastrado depois atualiza competência aberta de forma idempotente; competência fechada exige reabertura/correção.
8. A empresa ativa e a competência selecionada são revalidadas em todas as rotas.

---

# 13. Bloco 08 — Grupo financeiro e evento

## 13.1 Catálogo vinculante

| Grupo | Participante | Eventos permitidos | Componentes | Recibo interno |
|---|---|---|---|---|
| Oficial do empregado | Empregado | Adiantamento; pagamento final | Adiantamento oficial calculado; líquido do contador | Não |
| RA e reembolso | Empregado | Adiantamento; pagamento final | RA; reembolsos reais por categoria | Sim, por evento |
| Complementos | Empregado | Adiantamento; pagamento final | Recorrentes e avulsos detalhados | Sim, por evento |
| Período sem registro | Empregado | Adiantamento; pagamento final | Base proporcional da linha mensal | Sim, próprio |
| Contrato MEI | MEI | Adiantamento; pagamento final | Base contratual; serviços adicionais somente no final | Sim, por evento |
| Rescisão oficial | Empregado formal | Desligamento | Líquido informado pelo contador | Não |
| Acerto complementar de RA | Empregado | Desligamento | Verbas calculadas exclusivamente sobre RA | Sim |
| Ajuste positivo | Empregado ou MEI | Ajuste | Linhas positivas da mesma origem | Sim |
| Diferença absorvida | Empregado ou MEI | Sem pagamento | Linhas negativas da mesma origem | Não |

## 13.2 Estados do grupo

```text
Não gerado
Pendente de dados
Calculado
Pronto para pagamento
Pago
Não aplicável
Cancelado por desligamento
Em correção
```

## 13.3 Matriz de transições do grupo

| ID | Estado inicial | Evento | Pré-condição/permissão | Estado final | Efeitos | Auditoria/bloqueio |
|---|---|---|---|---|---|---|
| G08-01 | — | Materializar participante e grupos | Participante ativo em alguma parte da competência; grupo conhecido para seu tipo | Não gerado | Cria uma única identidade por participante+grupo+evento | Atualização repetida não duplica participante, grupo ou componente |
| G08-02 | Não gerado | Calcular com dado obrigatório ausente | `Calcular`; condição aplicável, mas falta base, líquido, confirmação ou vigência | Pendente de dados | Registra impedimentos sem inventar valor | Não permite conferência nem pagamento |
| G08-03 | Não gerado | Calcular grupo completo | `Calcular`; dados e versões válidos | Calculado | Grava memória, valor calculado/informado e valor final devido; no MEI aplica antes da conferência o redirecionamento terminal da seção 10.3, produzindo adiantamento zero e toda a base proporcional no final quando cabível | Fórmula, operandos autorizados e versão auditados |
| G08-04 | Pendente de dados | Resolver impedimento e recalcular | Permissão de editar o dado e calcular | Calculado | Substitui pendência por memória válida | Se houver pagamento ou competência fechada, direciona a F04 |
| G08-04A | Calculado; ainda não pago | Ajustar manualmente um campo financeiro editável | Permissão específica de editar/sobrescrever o campo; justificativa; competência aberta; versão atual | Calculado em nova versão | Preserva fórmula e resultado automáticos, grava o valor manual e sua diferença e exige nova conferência; o oficial final e a rescisão só mudam pela substituição do valor informado pelo contador | Grupo pronto, pago ou sem permissão bloqueia edição direta; depois do pagamento usa F04 |
| G08-05 | Calculado | Concluir conferência | `Concluir conferência`; memória, valor, dados e versão válidos | Pronto para pagamento | Bloqueia edição ordinária e habilita confirmação | Pode ocorrer individualmente ou em lote homogêneo; versão antiga bloqueia |
| G08-06 | Calculado ou pronto para pagamento | Recalcular antes do pagamento | `Recalcular`; competência aberta; nenhuma confirmação no escopo | Calculado | Cria nova memória e exige nova conferência | Nunca conserva `Pronto` depois de recálculo |
| G08-07 | Calculado | Marcar não aplicável | Total final zero; nenhum componente devido; `Marcar não aplicável`; motivo; inclui adiantamento MEI zerado pela regra terminal da seção 10.3 | Não aplicável | Resolve o grupo sem pagamento ou recibo; no MEI preserva na memória o redirecionamento integral da base ao final | Usuário, motivo e data auditados; total positivo bloqueia |
| G08-08 | Não aplicável | Reverter sem dados suficientes | Competência aberta/reaberta; `Reverter não aplicável`; aplicabilidade confirmada; falta dado obrigatório | Não gerado | Reabre somente o grupo escolhido e registra os impedimentos no próximo cálculo | Exige auditoria; não fica pronto antes de resolver dados e calcular |
| G08-08A | Não aplicável | Reverter com dados completos e recalcular | Competência aberta/reaberta; `Reverter não aplicável`; dados, memória e versão válidos | Calculado | Reabre e calcula somente o grupo escolhido | Exige auditoria e nova conferência antes de pagar |
| G08-09 | Não gerado, pendente, calculado ou pronto | Cancelar por desligamento | Somente adiantamento do empregado; regras D12-09 ou D12-13; destino tratado; nenhum reembolso real permanece devido no próprio evento | Cancelado por desligamento | Resolve apenas o grupo de adiantamento e cria/ativa o destino compatível | Nunca encerra pagamento final, acerto ou ajuste; exige origem, destino e auditoria |
| G08-10 | Pronto para pagamento | Confirmar pagamento | Regras do Bloco 09 | Pago | Grava valor e data efetivamente pagos; emite recibo permitido | Confirmação integral e idempotente |
| G08-11 | Pago | Iniciar correção | `Iniciar correção`; justificativa; versão e escopo atuais | Pago até cancelamento administrativo | Cria preparação F04 sem alterar pagamento | Só muda para `Em correção` após F04 persistir |
| G08-12 | Pago | Cancelar confirmação administrativamente em F04 | Permissões de correção e cancelamento; justificativa | Em correção | Preserva dinheiro e data reais; invalida obrigação/documento vigente conforme o caso | Não é estorno; uma correção aberta por escopo |
| G08-13 | Em correção; F04 aguardando reconfirmação | Reconfirmar novo total positivo | Memória e resultados válidos; recibo anterior cancelado quando aplicável; versão atual | Pago; F04 concluída ou com documento substituto pendente | Executa atomicamente C10-11 ou C10-11A; ajuste positivo pode permanecer pendente em F05 | Pagamento histórico anterior continua preservado; substituto é emitido depois por C10-13 |
| G08-14 | Em correção; F04 aguardando reconfirmação | Reconfirmar novo total zero | `Marcar não aplicável`; motivo; memória e resultados válidos; versão atual | Não aplicável; F04 concluída | Executa atomicamente C10-12, mantém documento anterior cancelado e não cria substituto de zero | Valor pago histórico vira diferença absorvida e nunca é apagado |
| G08-15 | Verba nova que não integrou o adiantamento pago | Criar RA/complemento depois do adiantamento | Casos B06-RA-06 ou B06-CMP-07; final ainda não pago; competência aberta | Calculado no final | Todo o devido da nova verba segue ao final e exige conferência | Alterar valor, vigência ou memória de componente que integrou o evento pago é bloqueado e segue G08-11/G08-12 e F04 |
| G08-16 | Pago no final | Criar ou aumentar verba retroativa | Competência aberta/reaberta; origem identificada | Em correção por F04 | Depois da apuração, diferença positiva vira ajuste e negativa é absorvida | Edição direta do componente pago é bloqueada; ajuste nunca é criado fora da correção |

## 13.4 Memórias de cálculo obrigatórias

### Oficial do empregado

```text
início_base_oficial = máximo(
    primeiro_dia_da_competência,
    admissão
)

base_oficial_proporcional =
salário_base ÷ 30 × D30(início_base_oficial, fim_da_competência)

adiantamento_oficial =
arredondar(base_oficial_proporcional × percentual_aplicável, 2)

pagamento_final_oficial = líquido_informado_pelo_contador
```

- corte usa a admissão;
- admissão até dia 15 permite adiantamento proporcional;
- admissão a partir do dia 16 não gera adiantamento inicial;
- o líquido já considera o adiantamento e nunca sofre novo desconto;
- alteração do salário-base não gera diferença oficial interna.

### RA

- valor mensal fixo e versionado;
- primeira competência do vínculo: proporcional desde o início das atividades;
- competências intermediárias: valor integral;
- alteração numa competência posterior à primeira: vale integralmente desde o primeiro dia daquela competência;
- competência de desligamento: somente saldo proporcional no acerto complementar;
- uma ou duas parcelas conforme configuração;
- corte inicial usa o início das atividades.

### Complementos

- recorrentes vigentes e vários avulsos podem coexistir;
- valor integral na competência, sem proporcionalidade diária;
- não entram no total acordado nem no acerto de RA;
- complemento criado depois do adiantamento pago migra integralmente ao final;
- criado depois do final pago segue F04 e ajuste positivo.

### Período sem registro

```text
início_da_linha = máximo(
    primeiro_dia_da_competência,
    início_das_atividades
)

fim_da_linha = primeiro limite aplicável entre:
    dia anterior à admissão
    data da saída sem registro
    último dia da competência

valor_da_linha =
base_confirmada ÷ 30 × D30(início_da_linha, fim_da_linha)
```

- uma linha por competência;
- se o fim calculado anteceder o início da linha, não existe componente devido naquela competência;
- linha aberta sem admissão ou saída usa provisoriamente o fim da competência;
- não inclui RA nem complemento;
- exige confirmação de que os dias não estão no oficial;
- pode ser 100% final ou dividido pelo percentual aplicável do empregado;
- mudança após pagamento segue F04.

### Reembolso do salário redondo

- sistema não calcula tributo;
- usuário informa INSS, Imposto de Renda, sindicato ou outro, ou confirma zero;
- pode existir no adiantamento, final ou ambos;
- compõe o grupo com RA, mas é verba independente e não a compensa;
- não migra automaticamente para rescisão ou acerto.

### Base contratual MEI

```text
competência_intermediária = valor_mensal_integral

primeira_ou_última_competência =
valor_mensal ÷ 30 × D30(período_ativo)

adiantamento_MEI = 0, se
fim_aplicável <= data_prevista_adiantamento
e adiantamento_da_base_pago = 0

saldo_da_base = máximo(0, base_devida − adiantamento_da_base_pago)
excedente_absorvido = máximo(0, adiantamento_da_base_pago − base_devida)
final_MEI = saldo_da_base + serviços_adicionais
```

- serviço adicional é avulso, integral e somente final;
- excedente da base nunca reduz serviço adicional;
- com duas parcelas, `adiantamento planejado = base devida × percentual`; o final deduz somente esse adiantamento quando efetivamente pago;
- a regra terminal acima prevalece sobre o adiantamento planejado: quando o fim aplicável ocorre antes ou na data prevista e não houve pagamento da base no adiantamento, o planejado deixa de ser devido, o grupo do adiantamento calcula zero/segue G08-07 e toda a base proporcional compõe o final;
- em parcela única no adiantamento, toda a base vai ao adiantamento e o final contém apenas serviços adicionais; em parcela única no final, toda a base vai ao final;
- início até o dia 15 permite o evento de adiantamento configurado; a partir do dia 16 leva a base inicial ao final, mesmo quando a parcela única havia sido escolhida no adiantamento;
- encerramento contratual é operado em M03/M04, nunca em D03;
- mudança de valor em competência aberta e sem pagamento recalcula; pagamento ou fechamento exige F04.

## 13.5 Invariantes do grupo

1. Confirmar oficial não confirma RA, complemento ou período sem registro.
2. Confirmar RA e reembolso não confirma complementos.
3. Não existe pagamento parcial dentro do mesmo grupo e evento.
4. Componentes de um grupo composto são apurados sem compensação silenciosa.
5. Campo oculto não participa de memória, filtro, total ou estado que permita inferência.
6. Somente `Pronto para pagamento` pode ser confirmado.
7. Recalcular sempre retorna a `Calculado`.
8. Grupo pago é imutável fora de F04.

---

# 14. Bloco 09 — Confirmação e pagamento

## 14.1 Estados de K06

```text
Pendente
Preenchido
Inconsistente
```

`Alteração local não salva` e `Conflito de versão` são indicadores de interface ortogonais, não estados persistidos de K06. Cada entrada também guarda a confirmação `O líquido informado já desconta o adiantamento oficial?`, pré-preenchida como `Sim` pela regra empresarial aprovada e editável para uma exceção confirmada. É essa confirmação, combinada ao adiantamento devido e ao pagamento real, que torna P09-02 executável.

O saldo inicial K07 possui os estados persistidos `Ausente`, `Saldo inicial registrado` e `Saldo inicial em nova versão`. Ele é exclusivo da implantação e não é um pagamento ou competência fictícios.

## 14.2 Matriz de K06, confirmação e pagamento

| ID | Estado inicial | Evento | Pré-condição/permissão | Estado final | Efeitos | Auditoria/bloqueio |
|---|---|---|---|---|---|---|
| P09-00A | K06 pendente, preenchido ou inconsistente | Alterar campo na tela sem salvar | Campo editável; mesma sessão, empresa, competência e linha | Mesmo estado persistido; indicador local `Alteração não salva` | Mantém somente rascunho local autorizado | Sair/trocar contexto usa UI-15; nada entra em cálculo antes de salvar |
| P09-00B | K06 com edição local | Salvar com versão antiga | A linha mudou desde a leitura | Estado atual do servidor; indicador `Conflito de versão` | Descarta a tentativa antiga e exige recarregar/revisar | Nunca sobrescreve o líquido mais recente; audita o conflito quando aplicável |
| P09-01 | K06 pendente | Informar líquido do contador | `Editar líquido`; empregado elegível; valor monetário válido; confirmação sobre desconto do adiantamento oficial | K06 preenchido | Salva individualmente o valor autoritativo e o indicador confirmado | Sem importação, decomposição ou recibo; versão antiga bloqueia |
| P09-01A | K06 preenchido ou inconsistente; oficial final não pago | Substituir líquido antes do pagamento | `Editar líquido`; competência aberta/reaberta; novo valor e indicador válidos; versão atual | K06 preenchido em nova versão; grupo oficial `Calculado` | Invalida memória/prontidão anterior, recalcula e exige nova conferência | Preserva versões; se o oficial final já foi pago, edição direta bloqueia e usa C10-18 |
| P09-02 | K06 preenchido | Detectar líquido que desconta adiantamento não pago | Confirmação `Sim`; adiantamento oficial considerado maior que zero; sem pagamento real e sem saldo inicial K07 | K06 inconsistente | Bloqueia grupo oficial final e checklist | Mensagem orienta confirmar pagamento real, usar K07 quando elegível ou obter valor/indicador corrigido do contador |
| P09-03 | K06 inconsistente | Resolver divergência oficial | Adiantamento real confirmado, K07 válido ou novo líquido corrigido | K06 preenchido | Libera nova conferência do oficial final | Nunca cria ajuste ou recibo interno oficial |
| P09-04 | K06 preenchido | Informar demissão formal | Desligamento válido e rescisão oficial aplicável | K06 preenchido, somente histórico para a obrigação oficial | Substitui a referência vigente mensal pela rescisão oficial; o valor e eventual pagamento mensal permanecem históricos | Não permite duas obrigações oficiais vigentes; usa D12-17 em caso tardio |
| P09-05 | Pronto para pagamento | Confirmar individualmente | `Confirmar pagamento`; valor positivo; data efetiva válida e não futura; versão atual | Pago | Grava confirmação, valor efetivo, data, usuário e recibo permitido | Transação e chave idempotente; duplo clique não duplica |
| P09-06 | Prontos homogêneos | Confirmar em lote F03 | `Confirmar em lote`; mesma empresa, competência, grupo e evento; impedidos conhecidos removidos | Todos pagos ou todos permanecem prontos | Cada participante mantém pagamento, auditoria e recibo próprios | `Todos ou nenhum`: conflito durante a transação desfaz todo o conjunto elegível |
| P09-07 | Pronto para pagamento | Tentar confirmar valor zero | Valor final zero | Mesmo estado até tratamento | Direciona a `Não aplicável` | Pagamento e recibo de zero são proibidos |
| P09-08 | Calculado | Tentar confirmar sem conferência | Não está pronto | Calculado | Nenhum efeito | Bloqueia e oferece `Concluir conferência` somente se autorizado |
| P09-09 | Pronto para pagamento | Tentar confirmar com data futura ou inválida | Data não representa pagamento já ocorrido | Pronto para pagamento | Preserva formulário para correção | Não cria confirmação, recibo ou número |
| P09-10 | Pago | Repetir a mesma confirmação | Mesma chave e mesmo conteúdo | Pago | Retorna o pagamento existente | Chave igual com conteúdo diferente é rejeitada e auditada |
| P09-11 | Pronto para pagamento; resposta perdida | Reconciliar e encontrar a confirmação | Mesma chave, ator, grupo, evento e conteúdo; transação existe | Pago | Mostra o pagamento/recibo existente | É proibido reenviar antes da consulta; não cria segunda confirmação |
| P09-11A | Pronto para pagamento; resposta perdida | Reconciliar e provar ausência da confirmação | Mesma chave consultada; nenhuma transação existe | Pronto para pagamento | Habilita nova tentativa explícita segura | Não marca pago nem reaproveita resultado incerto |
| P09-12 | Não aplicável | Tentar pagar | Grupo sem valor devido | Não aplicável | Nenhum | Reversão exige competência aberta/reaberta, motivo e recálculo |
| P09-13 | Pago | Tentar editar componente | Confirmação efetiva existente | Pago | Oferece F04 conforme permissão | Edição direta é bloqueada |
| P09-14 | — | Registrar saldo inicial K07 | Somente primeira competência financeira; pagamento real anterior à implantação; `Registrar saldo inicial` | Saldo inicial registrado | Grava participante, grupo, evento, valor e data real; satisfaz a existência do pagamento para saldos posteriores | Individual, auditado, idempotente; não cria competência anterior nem recibo fictício |
| P09-14A | Saldo inicial registrado | Corrigir lançamento de implantação | Permissão específica; justificativa; versão atual; impacto em saldos dependentes exibido | Saldo inicial em nova versão | Preserva original, recalcula apenas saldos dependentes ainda abertos e exige conferência | Não fabrica competência anterior nem recibo; pagamento/fechamento afetado segue F04, e redução nunca cria cobrança |
| P09-15 | Saldo inicial registrado | Tentar confirmação normal duplicada | Mesma origem e pagamento | Saldo inicial registrado | Nenhum | Bloqueia duplicidade e orienta abrir o lançamento de implantação |
| P09-16 | Grupos independentes | Confirmar somente um grupo | Grupo selecionado pronto | Apenas o grupo selecionado fica pago | Demais grupos mantêm estados e datas próprios | Situação geral é derivada e não altera os demais |

## 14.3 Resultado de confirmação e documento

- pagamento e auditoria concluem juntos;
- emissão lógica do recibo permitido nasce da confirmação;
- falha posterior do arquivo PDF não desfaz pagamento nem número;
- oficial, líquido do holerite e rescisão oficial não geram recibo interno;
- confirmação em lote cria um evento-pai operacional e eventos individuais por participante;
- uma operação em lote nunca se transforma em pagamento coletivo.

## 14.4 Invariantes de pagamento

1. Sem integração bancária, somente o usuário declara pagamento real.
2. Data prevista nunca substitui data efetiva.
3. Data efetiva é obrigatória, válida e não futura.
4. Pagamento é integral no escopo participante+grupo+evento.
5. Não existe compensação entre grupos ou verbas.
6. Valor oficial continua exatamente como informado pelo contador.
7. Operação, auditoria e numeração lógica são protegidas contra repetição.
8. Permissão de confirmar individualmente não concede confirmação em lote.

---

# 15. Bloco 10 — Correção, ajuste e diferença absorvida

## 15.1 Princípio da correção

Cancelar administrativamente uma confirmação não é estorno. A correção:

- preserva o valor e a data realmente pagos;
- preserva cálculo, confirmação, recibo e auditoria anteriores;
- libera somente empresa+competência+participante+grupo+evento;
- cria nova versão, sem sobrescrever a antiga;
- calcula cada verba contra o pagamento da mesma verba;
- pode gerar simultaneamente ajuste positivo e diferença absorvida;
- nunca gera cobrança, pagamento negativo ou compensação futura automática.

## 15.2 Estados da jornada F04

```text
Aguardando justificativa
Aguardando reabertura
Aguardando cancelamento administrativo
Em edição
Recalculando
Aguardando reconfirmação
Documento substituto pendente
Concluída
```

Os estados detalhados pertencem à correção. `Ajuste positivo pendente` pertence à obrigação F05, não à etapa de F04. `Bloqueada por permissão`, `Conflito de versão` e `Resposta técnica incerta` são resultados transversais que preservam a última etapa persistida; não são atalhos para outra etapa. O grupo de origem usa apenas `Pago` ou `Em correção` durante essa jornada.

## 15.3 Matriz da correção F04

| ID | Estado inicial | Evento | Pré-condição/permissão | Estado final | Efeitos | Auditoria/bloqueio |
|---|---|---|---|---|---|---|
| C10-01 | Grupo pago; sem correção | Iniciar correção | `Iniciar correção`; acesso à origem; versão atual; permissões de reabrir, cancelar confirmação, editar, reconfirmar e tratar documento preavaliadas conforme o caso | Aguardando justificativa | Carrega empresa, competência, participante, grupo, evento, valores, pagamento e recibo quando houver | Ainda não altera o grupo; falta de qualquer permissão necessária bloqueia antes da reabertura; outra correção aberta no mesmo escopo bloqueia |
| C10-02 | Aguardando justificativa, reabertura ou cancelamento administrativo | Descartar antes do cancelamento da confirmação | C10-05 ainda não ocorreu | Sem correção ativa | Descarta a intenção e dados locais; se C10-04 já reabriu a competência, ela permanece reaberta com sua auditoria própria | Não cancela confirmação, pagamento ou recibo; depois de C10-05 somente conclusão formal encerra |
| C10-03 | Aguardando justificativa; competência fechada | Informar motivo e justificativa | Motivo autorizado; texto concreto; permissões preavaliadas | Aguardando reabertura | Registra intenção e impacto previsto | Sem justificativa ou permissão necessária não avança |
| C10-03A | Aguardando justificativa; competência aberta/reaberta | Informar motivo e justificativa | Motivo autorizado; texto concreto; permissões preavaliadas | Aguardando cancelamento administrativo | Registra intenção e impacto previsto | Não cria reabertura desnecessária; sem justificativa não avança |
| C10-04 | Aguardando reabertura | Reabrir competência | Competência fechada; `Reabrir competência`; versão atual | Aguardando cancelamento administrativo | Cria nova versão `Reaberta`; preserva fechamento anterior | Reabertura e auditoria atômicas; falta de permissão bloqueia toda a jornada |
| C10-05 | Aguardando cancelamento administrativo | Cancelar confirmação | `Cancelar confirmação`; confirmação vigente; documento vigente somente quando o tipo gerar recibo; versão atual | Em edição; grupo Em correção | Preserva valor/data pagos; cancela administrativamente a confirmação e, quando aplicável, o documento vigente; torna a correção persistente | Não é estorno; a partir daqui só conclusão formal encerra; uma correção por escopo |
| C10-06 | Em edição | Salvar nova memória ou valor | Permissão de editar/sobrescrever o componente; justificativa; escopo liberado | Recalculando | Mantém original e grava valor substituto, diferença e versão | Outro grupo/componente não liberado permanece imutável |
| C10-07 | Recalculando; grupo interno calculável | Apurar por verba | Dados e fórmulas válidos; não é controle oficial autoritativo | Aguardando reconfirmação | Para cada verba, materializa atomicamente exatamente um resultado C10-08, C10-09 ou C10-10, sem compensar outra | Fórmula, operando, original, pago e novo devido ficam auditáveis; todos os resultados existem antes de reconfirmar |
| C10-08 | Aguardando reconfirmação | Materializar resultado positivo de uma verba | `novo devido − pago da mesma verba > 0` | Aguardando reconfirmação; ajuste positivo associado | Cria uma obrigação F05 com memória e origem; não a paga | Exatamente um ajuste por resultado/origem; criação idempotente; pode coexistir com C10-09 de outra verba |
| C10-09 | Aguardando reconfirmação | Materializar resultado negativo de uma verba | `novo devido − pago da mesma verba < 0` | Aguardando reconfirmação; diferença absorvida associada | Registra excedente, motivo e encerramento; nenhuma obrigação futura | Não gera pagamento, cobrança ou recibo; pode coexistir com C10-08 de outra verba |
| C10-10 | Aguardando reconfirmação | Materializar resultado zero de uma verba | Novo devido igual ao pago daquela verba | Aguardando reconfirmação; resultado zero associado | Apenas preserva a nova memória correta | Não cria ajuste nem diferença absorvida |
| C10-11 | Aguardando reconfirmação | Reconfirmar grupo positivo sem recibo interno | `Reconfirmar grupo`; memória e resultados íntegros; tipo oficial ou sem documento substituto aplicável | Concluída; grupo pago | Grava nova versão correta sem declarar ajuste pendente como pago | Pagamento histórico continua consultável; oficial/rescisão não geram recibo |
| C10-11A | Aguardando reconfirmação | Reconfirmar grupo positivo com recibo interno | Mesmas condições; tipo documental aplicável | Documento substituto pendente; grupo pago | Grava nova versão correta e exige sucessor documental; ajuste positivo continua obrigação separada | Pagamento e recibo anteriores permanecem históricos |
| C10-12 | Aguardando reconfirmação | Reconfirmar grupo com novo total zero | `Marcar não aplicável`; motivo; memória e resultados íntegros | Concluída; grupo não aplicável | Cancela recibo anterior quando houver; registra o valor pago inteiro como absorvido | Não cria substituto de zero |
| C10-13 | Documento substituto pendente | Emitir substituto | Grupo reconfirmado; pagamento original preservado; autorização documental | Concluída; substituto vigente | Substituto declara somente o que já foi efetivamente pago; ajuste continua separado | Novo número; ligação completa com original |
| C10-14 | Correção persistente | Salvar e continuar depois | Usuário autorizado; etapa consistente | Mesma etapa persistida | Outro autorizado pode retomar do ponto registrado | Registra iniciador, responsável atual, horário e versão |
| C10-15 | Qualquer etapa persistente | Conflito de versão | Origem, competência ou correção alterada | Mesma etapa persistida; resultado `Conflito de versão` | Nenhuma gravação antiga é aplicada | Exige recarregar e rever impacto |
| C10-16A | Qualquer etapa crítica | Perder resposta depois do envio | Resultado técnico desconhecido | Mesma etapa conhecida; resultado `Resposta técnica incerta` | Bloqueia novo comando e inicia reconciliação pela chave | Não presume sucesso nem falha |
| C10-16 | Resposta técnica incerta | Reconciliar | Operação, correção, grupo, ajuste e documento consultados | Etapa real persistida encontrada | Reapresenta o estado confirmado e somente então oferece a ação cabível | Reenvio antes da reconciliação é bloqueado |
| C10-17 | Correção concluída com ajuste pendente | Tentar fechar competência | Ajuste positivo ainda não pago | Competência permanece aberta/reaberta | Grupo original pode estar correto, mas F05 segue pendente | Checklist bloqueia até P10-02 |
| C10-18 | Grupo oficial ou rescisão oficial em `Em edição` | Salvar novo controle autoritativo dentro de F04 | C10-01 a C10-05 concluídos conforme o estado da competência; novo valor fornecido pelo contador; permissão e justificativa | Recalculando | Preserva pagamento anterior e grava nova versão autoritativa para conferência | Não é atalho para pular reabertura/cancelamento; se houver desligamento tardio, aplica D12-17 |
| C10-18A | Recalculando; grupo oficial ou rescisão oficial | Validar controle autoritativo | Nova fonte do contador íntegra; memória antes/depois e versão válidas | Aguardando reconfirmação | Registra a diferença apenas como histórico de controle e segue C10-11; não cria C10-08/C10-09, ajuste, cobrança ou recibo interno oficial | Reconfirmação e auditoria são obrigatórias; valor autoritativo não é decomposto |
| C10-19 | Correção que alcança várias competências | Coordenar correções | Uma alteração afeta mais de uma competência | Uma correção independente por competência/grupo/evento | Liga as correções por referência coordenadora | Nunca libera várias competências numa única operação destrutiva |

## 15.4 Matriz do ajuste positivo e da diferença absorvida

Catálogos persistidos:

- ajuste positivo F05: `Pendente`, `Pago`, `Em correção`;
- diferença absorvida: `Absorvida pela empresa`.

| ID | Estado inicial | Evento | Pré-condição/permissão | Estado final | Efeitos | Auditoria/bloqueio |
|---|---|---|---|---|---|---|
| P10-01 | — | Criar ajuste positivo | Resultado positivo validado em F04 | Pendente | Grava origem, memória, valor e justificativa; cria obrigação própria | Não nasce pago e não emite recibo definitivo |
| P10-02 | Pendente | Confirmar pagamento do ajuste | `Confirmar ajuste`; valor positivo; data efetiva válida e não futura | Pago | Grava pagamento integral e emite recibo próprio | Idempotente; não altera novamente o grupo original |
| P10-03 | Pendente | Tentar parcelar ou pagar parcialmente | Ajuste maior que zero | Pendente | Nenhum | Parcelamento e confirmação parcial são proibidos |
| P10-04 | Pago | Corrigir ajuste pago | `Iniciar correção`; justificativa; versão atual | Em correção | Abre nova F04 e preserva ajuste, pagamento e recibo anteriores | Ajuste pago nunca é editado diretamente |
| N10-01 | — | Registrar diferença absorvida | Resultado negativo de uma ou mais verbas | Absorvida pela empresa | Grava por verba o pago, novo devido e excedente; pode coexistir com ajuste positivo | Não cria recibo, cobrança, desconto ou compensação |
| N10-02 | Absorvida pela empresa | Consultar ou exportar | Permissões de histórico/valores/exportação | Absorvida pela empresa | Exibe apenas em histórico, auditoria e Excel autorizado | Não oferece ação de pagamento |

## 15.5 Exemplo obrigatório sem compensação silenciosa

Uma correção do grupo `RA e reembolso` encontra:

```text
RA adicional devida:                 + R$ 100,00
Reembolso pago acima do novo devido: - R$  50,00
```

Resultado obrigatório:

- ajuste positivo de R$ 100,00, detalhando RA;
- diferença absorvida de R$ 50,00, detalhando reembolso;
- nenhum ajuste líquido de R$ 50,00;
- recibo somente para os R$ 100,00 quando forem efetivamente pagos.

## 15.6 Invariantes de correção

1. Uma correção aberta por empresa+competência+participante+grupo+evento.
2. O pagamento real nunca é apagado ou reduzido.
3. Cancelamento administrativo não devolve dinheiro.
4. Outro grupo não é liberado por consequência.
5. Resultado positivo não nasce pago.
6. Resultado negativo não gera saldo contra o participante.
7. Oficial e rescisão permanecem autoritativos do contador.
8. Correção aberta bloqueia fechamento.
9. Operação, auditoria e versões documentais são inseparáveis.

---

# 16. Bloco 11 — Recibo e arquivo

## 16.1 Estados independentes

Estado documental:

```text
Prévia
Definitivo vigente
Cancelado
Substituído
Substituto vigente
```

Estado do arquivo privado:

```text
Pendente de geração
Disponível
Falhou
Indisponível
```

O recibo definitivo pode existir com arquivo `Falhou`. O pagamento e o número continuam válidos.

## 16.2 Matriz do recibo

| ID | Estado inicial | Evento | Pré-condição/permissão | Estado final | Efeitos | Auditoria/bloqueio |
|---|---|---|---|---|---|---|
| R11-01 | — | Gerar prévia | Grupo calculado/pronto; `Visualizar prévia`; conteúdo integral autorizado | Prévia | Renderiza memória sem número e com marca `PRÉVIA — PAGAMENTO NÃO CONFIRMADO` | Não declara pagamento e não entra no lote definitivo |
| R11-02 | — | Confirmar pagamento de grupo com recibo | Confirmação integral concluída | Definitivo vigente; arquivo `Pendente de geração` | Reserva número anual único, cria snapshot e hash esperado | Pagamento/auditoria não dependem do sucesso posterior do PDF |
| R11-03 | Definitivo vigente ou Substituto vigente | Reimprimir a mesma versão | `Reimprimir`; acesso integral atual | Permanece na mesma versão vigente | Usa o mesmo número e snapshot daquela versão | Reimpressão auditada; nunca consome novo número |
| R11-04 | Definitivo vigente ou Substituto vigente | Cancelar durante nova F04 | Correção persistente; `Cancelar/substituir recibo` | Cancelado | Preserva número, snapshot, arquivo, cadeia e motivo | Permite novo sucessor por R11-05; documento continua consultável conforme permissão |
| R11-05 | Cancelado | Emitir sucessor | Grupo reconfirmado com pagamento histórico ainda documentável | Substituído; novo recibo substituto vigente | Novo número e vínculo bidirecional entre versões | Substituto não declara ajuste ainda pendente como pago |
| R11-06 | Cancelado | Correção resulta em zero | Grupo passa a não aplicável | Cancelado, sem sucessor | Preserva documento e pagamento histórico | Recibo zero e substituto de zero são proibidos |
| R11-07 | Substituído ou cancelado | Consultar versão histórica | `Visualizar documento`; conteúdo integral autorizado | Mesmo estado | Mostra marca e cadeia de versões | Não volta a ser vigente por consulta ou reimpressão |
| R11-08 | Qualquer documento | Tentar baixar sem acesso integral | Falta permissão atual para campo/documento | Mesmo estado | Nenhum arquivo é montado ou entregue | Resposta não identifica campo ou valor bloqueado |
| R11-09 | Qualquer documento de outra empresa | Abrir identificador direto | Empresa da sessão diferente | Não encontrado | Nenhum conteúdo | Tentativa cruzada auditada sem confirmar existência |

## 16.3 Matriz do arquivo do recibo

| ID | Estado inicial | Evento | Pré-condição/permissão | Estado final | Efeitos | Auditoria/bloqueio |
|---|---|---|---|---|---|---|
| A11-01 | Pendente de geração | Gerar PDF | Snapshot e número existentes | Disponível | Armazena PDF privado e hash; nenhuma URL pública permanente | Geração idempotente e auditada |
| A11-02 | Pendente de geração | Falhar geração | Erro técnico depois da confirmação | Falhou | Mantém pagamento, recibo, número e snapshot | Não reserva outro número e mostra regeneração controlada |
| A11-03 | Falhou ou Indisponível | Regenerar com sucesso depois de validação | `Regenerar arquivo`; mesmo snapshot e número; investigação/justificativa quando aplicável; novo hash corresponde ao esperado | Disponível | Reexecuta somente a criação física | Tentativa auditada; conteúdo, número e snapshot não mudam |
| A11-03A | Falhou ou Indisponível | Tentar regenerar e falhar | Mesmas autorizações; erro técnico ou hash ainda divergente | Falhou | Mantém pagamento, número e snapshot; nenhum arquivo é entregue | Nova falha auditada; oferece outra tentativa somente após nova validação |
| A11-04 | Disponível | Visualizar | `Visualizar`; sessão, empresa, registro e campos válidos | Disponível | Entrega visualização privada | Visualizar não concede download |
| A11-05 | Disponível | Baixar | `Baixar`; revalidação integral atual | Disponível | Entrega arquivo privado | Download auditado; permissão revogada bloqueia |
| A11-06 | Disponível | Detectar hash divergente | Hash físico diferente do snapshot | Indisponível | Bloqueia entrega e aciona regeneração/investigação | Divergência auditada como falha técnica |
| A11-07 | Qualquer | Trocar empresa ou expirar sessão | Contexto deixa de corresponder | Mesmo estado no servidor; conteúdo limpo na tela | Encerra acesso local | Reautenticação e empresa correta são exigidas |

## 16.4 Matriz de lote documental R03

O arquivo temporário do lote usa `Preparando`, `Processando`, `Pronto`, `Falhou`, `Expirado` e `Indisponível`. O estado não altera os recibos individuais de origem.

| ID | Estado inicial | Evento | Pré-condição/permissão | Estado final | Efeitos | Auditoria/bloqueio |
|---|---|---|---|---|---|---|
| L11-01 | Seleção local | Conferir elegibilidade | Definitivos vigentes da mesma empresa e competência; íntegros; acesso integral | Seleção elegível | Separa e explica impedidos antes da geração | Prévia não revela documento não autorizado |
| L11-02 | Seleção elegível | Solicitar PDF consolidado | `Gerar lote` e `Reimprimir` para todos; chave nova | Preparando; tipo PDF | Cria pedido temporário sem alterar recibos individuais | Clique repetido devolve o mesmo pedido; nova intenção recebe nova chave |
| L11-03 | Seleção elegível | Solicitar ZIP | `Gerar lote` e `Baixar` para todos; chave nova | Preparando; tipo ZIP | Cria pedido que empacotará os PDFs individuais, preservando números e hashes | Operação auditada; ainda não declara arquivo pronto |
| L11-03A | Preparando | Fixar snapshot do lote | Todos os itens reautorizados, íntegros e vinculados ao pedido | Processando | Congela a lista e inicia a geração física | Se qualquer item falhar, nenhum subconjunto é produzido |
| L11-03B | Processando | Concluir geração integral | Todos os itens permanecem elegíveis e íntegros; hash do lote gravado | Pronto | Disponibiliza PDF ou ZIP temporário por 24 horas | Conclusão auditada; nenhuma versão individual é criada ou alterada |
| L11-04 | Preparando ou Processando | Falhar ou perder elegibilidade | Erro técnico, permissão, versão ou integridade divergente em qualquer item | Falhou | Não produz nem disponibiliza subconjunto silencioso | Resultado é todos ou nenhum para o lote documental |
| L11-05 | Pronto | Baixar | Sessão, empresa, solicitante, prazo e permissões revalidados | Pronto | Entrega resultado temporário | Recibos de origem permanecem privados e não expiram com o pacote |
| L11-06 | Pronto | Completar 24 horas | Rotina temporal do servidor | Expirado | Remove acesso ao pacote temporário; recibos individuais permanecem | Expiração auditada; novo pacote exige novo pedido e nova autorização |
| L11-07 | Pronto | Detectar hash divergente ou arquivo ausente | Integridade física não corresponde ao pedido | Indisponível | Bloqueia entrega e abre investigação técnica | Não regenera silenciosamente nem muda os documentos de origem |
| L11-08 | Falhou, Expirado ou Indisponível | Solicitar novo lote | Seleção e permissões revalidadas; investigação encerrada quando aplicável; nova chave | Preparando em novo pedido | Usa novamente os recibos vigentes autorizados; não reutiliza pacote comprometido/expirado | Liga pedidos para auditoria, sem reutilizar o arquivo anterior |

## 16.5 Tipos documentais

Geram recibo:

- RA e reembolso, um por evento;
- complementos, outro por evento;
- período sem registro, próprio por evento;
- contrato MEI, um por evento;
- ajuste positivo;
- acerto complementar de RA.

Nunca geram recibo interno:

- salário ou adiantamento oficial;
- líquido do holerite;
- rescisão oficial do contador;
- diferença absorvida;
- evento de valor zero.

## 16.6 Conteúdo imutável do snapshot

- número no formato anual da empresa, inicialmente `AAAA-000000`;
- razão social, CNPJ e logo usados na emissão;
- empregado e CPF, ou razão social/nome fantasia e CNPJ do MEI;
- competência, evento e tipo;
- detalhamento das verbas;
- total numérico e por extenso;
- data efetiva e data de emissão;
- versão e relação de substituição;
- campo de assinatura manual do participante;
- nenhuma assinatura da empresa.

## 16.7 Invariantes documentais

1. Número é único, anual por empresa, crescente e nunca reutilizado.
2. Prévia não recebe número.
3. Definitivo nasce somente de pagamento confirmado.
4. Mesmo snapshot e versão mantêm o mesmo número.
5. Substituto recebe outro número.
6. Falha do arquivo não desfaz pagamento ou emissão lógica.
7. PDF é indivisível na primeira versão.
8. Ações de visualizar, baixar, reimprimir, regenerar e gerar lote são independentes.
9. Recibo permanente não expira pela regra de 24 horas das exportações temporárias.

---

# 17. Bloco 12 — Desligamento e inativação

## 17.1 Limite do bloco

Este bloco trata somente vínculo de empregado:

- demissão formal; ou
- desligamento sem registro.

Encerramento de contrato MEI pertence a M03/M04, usa a última competência contratual e não utiliza D03, `Decisão necessária` trabalhista ou `Cancelado por desligamento`.

## 17.2 Famílias independentes

Situação temporal:

```text
Futuro
Ativo
Encerramento programado
Último dia ativo
Inativo
```

Ciclo próprio do desligamento:

```text
Programado
Efetivo
Cancelado
```

Antes de existir um registro de desligamento, esse ciclo é `N/A`. Ele não substitui a situação temporal do vínculo nem a situação financeira.

Tipo de encerramento:

```text
Não encerrado
Encerrado sem registro
Demitido formalmente
```

O comando `Desligamento sem registro` grava o tipo canônico `Encerrado sem registro`; o comando `Demissão formal` grava `Demitido formalmente`. Essa correspondência é a mesma usada no Bloco 04.

Situação financeira:

```text
N/A
Pendente de dados
Aguardando criação da competência
Aguardando conferência
Grupos pendentes
Decisão necessária
Desligamento informado após pagamento
Financeiro quitado
Em correção
```

Essa situação financeira é uma **projeção derivada**, não um campo que o usuário edita. O sistema a recalcula depois de toda mudança relevante e usa a primeira condição verdadeira na ordem abaixo; os estados detalhados de cada grupo continuam visíveis e não são substituídos por esse resumo:

1. `N/A`: não existe ciclo de desligamento aplicável ou o ciclo vigente está `Cancelado` e já foi reconciliado;
2. `Em correção`: existe correção F04, reconciliação de cancelamento, reabertura ou substituição documental ainda não concluída;
3. `Aguardando criação da competência`: a competência final necessária ainda não existe;
4. `Decisão necessária`: existe adiantamento atrasado e não pago cujo destino exige escolha explícita;
5. `Pendente de dados`: falta ao menos um dado obrigatório de rescisão, RA, PSR, complemento, reembolso ou destino aplicável;
6. `Desligamento informado após pagamento`: o mensal oficial já pago foi preservado por D12-17 e sua obrigação oficial substituta ainda não foi resolvida;
7. `Aguardando conferência`: existe ao menos um grupo aplicável calculado que ainda precisa de conferência;
8. `Grupos pendentes`: os dados estão completos, mas existe grupo, pagamento, ajuste ou destino aplicável ainda não resolvido;
9. `Financeiro quitado`: todas as obrigações aplicáveis estão pagas, legitimamente zeradas, não aplicáveis, absorvidas ou encerradas pela regra correspondente.

Não existe transição manual entre esses nomes. A mudança ocorre somente pela alteração de suas fontes, e D12-25 formaliza a passagem para a última condição.

## 17.3 Matriz temporal e cadastral

| ID | Estado inicial | Evento | Pré-condição/permissão | Estado final | Efeitos | Auditoria/bloqueio |
|---|---|---|---|---|---|---|
| D12-01 | Vínculo futuro ou ativo sem saída; ciclo N/A ou último desligamento cancelado | Programar data futura | `Registrar desligamento`; tipo compatível; data válida; aviso válido | Novo ciclo `Programado`; temporal `Encerramento programado`; tipo escolhido | Grava novo registro com último dia inclusivo, tipo canônico, aviso, competência final e impacto previsto; liga eventual cancelado anterior apenas como histórico | Não inativa, não cria pagamento e não exige competência já existente |
| D12-02 | Vínculo ativo sem saída; ciclo N/A ou último desligamento cancelado | Registrar saída presente ou passada | Mesmas permissões; data válida | Novo ciclo `Efetivo`; temporal `Último dia ativo` ou `Inativo`, determinado pela data; tipo escolhido | Cria novo registro e efeitos financeiros/clínicos compatíveis; preserva cancelado anterior | Data não pode anteceder início; formal não pode anteceder admissão |
| D12-03 | Ciclo programado; temporal encerramento programado | Chegar à data de saída | Relógio do servidor em America/Sao_Paulo | Ciclo `Efetivo`; temporal `Último dia ativo` | Vínculo continua operacional até o fim do dia | Transição derivada auditável; não depende de quitação |
| D12-04 | Ciclo efetivo; temporal último dia ativo | Iniciar dia seguinte | Data de saída efetiva alcançada | Ciclo `Efetivo`; temporal `Inativo` | Retira vínculo das listas ativas; mantém última competência, documentos e correções | Não depende de pagamento ou ASO |
| D12-05 | Ciclo programado; saída ainda futura | Cancelar programação futura | `Cancelar desligamento`; sem pagamento, recibo, inativação, competência fechada, grupo `Cancelado por desligamento` ou destino financeiro materializado pela saída; justificativa | Ciclo `Cancelado`; temporal volta a `Futuro` ou `Ativo`; tipo `Não encerrado`; financeiro `N/A` derivado | Se o tipo era `Demitido formalmente`, usa ASO-A10/A10B; se era `Encerrado sem registro`, ASO é `N/A`; preserva linha do tempo e exames existentes | ASO isolado não bloqueia; nenhuma versão é apagada |
| D12-06 | Ciclo efetivo, vínculo inativo ou saída com efeito financeiro/documental | Tentar cancelamento simples | Existe pagamento, recibo, inativação, competência fechada, grupo `Cancelado por desligamento` ou destino financeiro materializado/afetado pela saída | Mesmo vetor de estados | Direciona a D12-07 e, quando necessário, D12-08A/F04 | Reativação automática e cancelamento destrutivo são proibidos; ASO isolado não satisfaz esta condição |
| D12-07 | Ciclo efetivo ou programado com fonte alterada | Corrigir data, aviso, dias ou bases | `Corrigir desligamento`; justificativa; impacto conferido | Data > hoje: ciclo `Programado`/`Encerramento programado`; data = hoje: ciclo `Efetivo`/`Último dia ativo`; data < hoje: ciclo `Efetivo`/`Inativo`; financeiro `Em correção` quando afetado | Antes de pagamento invalida cálculo; depois de pagamento abre F04; mudança de mês trata as duas competências | A comparação com a data operacional escolhe exatamente um ramo; preserva todas as versões e nunca muda competência silenciosamente |
| D12-07A | Ciclo programado/efetivo com efeitos que impedem D12-05 | Cancelar desligamento por correção autorizada | `Corrigir desligamento`; justificativa; impacto integral conferido; permissões de reabrir/corrigir/restaurar destinos; versão atual | Ciclo `Cancelado`; temporal volta explicitamente a `Futuro` ou `Ativo`; tipo `Não encerrado`; financeiro `Em correção` até reconciliar | Executa D12-08A para grupos cancelados/destinos ainda não pagos; efeitos pagos, recibos ou competências fechadas seguem F04; reconcilia a pendência demissional sem apagar exame/histórico | É uma reativação corretiva explícita, nunca automática; se qualquer reconciliação falhar, toda a mudança de ciclo é revertida |
| D12-08 | Qualquer vínculo já encerrado | Tentar segundo encerramento | Data final já efetiva | Mesmo estado | Oferece consulta/correção do existente | Segundo desligamento no mesmo vínculo é bloqueado |
| D12-08A | Ciclo cancelado; grupo `Cancelado por desligamento`; dados incompletos | Restaurar identidade da obrigação | Saída deixou de justificar o cancelamento; competência aberta/reaberta; origem/destino localizados | Grupo `Não gerado` | Reverte destino indevido e devolve o grupo ao cálculo com impedimentos explícitos | Não restaura pagamento/recibo; dados precisam ser resolvidos antes de calcular |
| D12-08C | Ciclo cancelado; grupo `Cancelado por desligamento`; dados completos | Restaurar e recalcular obrigação | Mesmas condições; memória válida e versão atual | Grupo `Calculado` | Reverte origem/destino, recalcula e exige nova conferência | Se já houve efeito real, segue F04; operação é atômica e auditada |
| D12-08B | Ciclo cancelado; financeiro em correção | Concluir reconciliação do cancelamento | Todos os grupos/destinos restaurados ou corrigidos; F04 e documentos aplicáveis concluídos; nenhuma pendência criada pela saída | Financeiro `N/A` derivado | Retira o desligamento cancelado do checklist financeiro vigente e preserva todas as versões, pagamentos e correções históricas | Revalidação integral e auditoria atômicas; qualquer pendência mantém `Em correção` |

## 17.4 Matriz financeira do desligamento

| ID | Estado inicial | Evento | Pré-condição/permissão | Estado final | Efeitos | Auditoria/bloqueio |
|---|---|---|---|---|---|---|
| D12-09 | Grupo de adiantamento não pago; saída antes ou na data prevista | Cancelar grupo sem valor que permaneça no evento | Desligamento válido; destino compatível materializado; no grupo `RA e reembolso`, reembolso real é zero/não aplicável | Adiantamento `Cancelado por desligamento`; obrigações de destino materializadas e ainda não resolvidas | Oficial segue contador; RA vai ao acerto; complementos e PSR aos finais próprios | Resolve só o adiantamento; origem e destinos são atômicos e auditados |
| D12-09A | Grupo `RA e reembolso` não pago; reembolso real positivo | Retirar RA e preservar reembolso no evento mensal | Saída antes/na data prevista; valor real do reembolso confirmado | Grupo recalculado somente com reembolso em `Calculado`; acerto de RA pendente somente se houver RA aplicável | Não cancela o grupo inteiro; remove apenas a RA aplicável do adiantamento, mantém o reembolso no evento e exige nova conferência | Checklist só resolve depois do reembolso ser pago ou legitimamente não aplicável; origem e eventual acerto são auditados juntos |
| D12-10 | Reembolso do adiantamento ainda não pago | Avaliar origem real | Existe ou não desconto real que origine reembolso | Valor positivo usa D12-09A; zero/não aplicável permite D12-09 | Não migra automaticamente para rescisão/acerto; permanece somente quando houver desconto real apurado | Confirmação de zero ou valor real é obrigatória quando salário redondo aplicar |
| D12-11 | Grupo pendente; saída depois da data prevista | Detectar atraso sem pagamento | Grupo ainda não pago | Decisão necessária | Suspende migração e pagamento automáticos | Mostra opções autorizadas por grupo; não decide sozinho |
| D12-12 | Decisão necessária | Pagar adiantamento atrasado | Grupo permite; `Confirmar pagamento`; data efetiva; justificativa | Grupo pago; destino recalculado | RA paga deduz somente RA no acerto; complemento/PSR pagos deduzem apenas suas origens | Oficial formal exige orientação expressa do contador; recibos somente dos grupos internos permitidos |
| D12-13 | Decisão necessária | Cancelar e encaminhar grupo sem valor remanescente no evento | `Cancelar adiantamento`; permissão do destino; justificativa; no grupo `RA e reembolso`, reembolso real zero/não aplicável | Adiantamento `Cancelado por desligamento`; obrigações de destino materializadas e ainda não resolvidas | RA vai ao acerto; complementos e PSR vão aos finais próprios; oficial segue contador | Cancelamento manual posterior é distinguido do automático e auditado |
| D12-13A | Decisão necessária; grupo `RA e reembolso` com reembolso real positivo | Cancelar RA e preservar reembolso | Permissão do grupo e, se houver RA aplicável, do acerto; justificativa; valor real confirmado | Grupo recalculado somente com reembolso em `Calculado`; acerto pendente somente para RA aplicável | Mantém reembolso no evento mensal, encaminha apenas a RA existente e exige nova conferência | Nunca marca o grupo inteiro como cancelado; checklist aguarda o reembolso ser resolvido |
| D12-14 | Adiantamento já pago | Registrar desligamento | Pagamento real localizado por verba | Grupos pagos preservados; acerto e eventos finais recalculados | Nas verbas internas, deduz somente valor pago da mesma verba e absorve eventual excedente; oficial segue o valor autoritativo do contador | Oficial, complemento, reembolso e PSR nunca reduzem acerto de RA |
| D12-15 | Competência final inexistente | Registrar/programar saída | Desligamento cadastral válido | Aguardando criação da competência | Mantém desligamento e pendência sem fabricar cálculo | Usuário autorizado pode abrir K02; criação posterior materializa uma vez |
| D12-15A | Aguardando criação da competência | Criar competência final com dados incompletos | K07-01 concluída para empresa/mês corretos; falta ao menos um campo obrigatório | Pendente de dados | Materializa uma única vez as identidades aplicáveis e seus impedimentos | Chave empresa+desligamento+competência impede duplicidade; não cria competência anterior |
| D12-15B | Aguardando criação da competência | Criar competência final com dados completos | K07-01 concluída; todos os dados obrigatórios válidos; versão atual | Aguardando conferência | Materializa e calcula uma única vez rescisão/acerto/grupos aplicáveis | Mesma chave impede duplicidade; não cria competência anterior |
| D12-16 | Competência final fechada | Registrar ou alterar saída | `Reabrir competência`; justificativa | Em correção após reabertura | Preserva versão fechada; grupos pagos seguem F04 | Nenhum reprocessamento silencioso |
| D12-17 | Oficial mensal já pago | Informar demissão tardiamente | Rescisão fornecida pelo contador; conferência expressa | Desligamento informado após pagamento | Preserva confirmação mensal histórica; cancela apenas obrigação mensal vigente; cria rescisão como nova referência | Não cria ajuste, cobrança ou recibo interno oficial; histórico pode mostrar ambos, nunca duas obrigações vigentes |
| D12-18 | Demissão formal pendente de dados | Informar rescisão oficial positiva | `Editar rescisão`; valor do contador > 0; confirmação de que não contém RA | Rescisão informada; Aguardando conferência | Substitui obrigação mensal vigente; não decompõe | Não gera recibo interno |
| D12-18A | Demissão formal pendente de dados | Informar rescisão oficial zero | `Editar rescisão`; valor do contador = 0; confirmação e motivo | Rescisão `Não aplicável`; motivo registrado | Substitui obrigação mensal vigente sem criar pagamento | Valor zero nunca fica pronto/pago e não gera recibo |
| D12-19 | Rescisão oficial pronta | Confirmar pagamento | `Confirmar rescisão`; data efetiva válida | Rescisão oficial paga | Grava pagamento separado do acerto de RA | Integral, idempotente e sem recibo interno |
| D12-20 | RA aplicável | Calcular acerto complementar | Dados confirmados; RA vigente na data real de saída | Acerto calculado | Cria memória exclusiva sobre RA; não gera RA mensal integral paralela | Cada verba exige aplicabilidade; versão e cálculo original preservados |
| D12-21 | Acerto de RA calculado | Concluir conferência | `Concluir conferência`; memória válida | Acerto pronto para pagamento | Habilita confirmação própria | Sobrescrita autorizada exige justificativa; após pago usa F04 |
| D12-22 | Acerto de RA pronto | Confirmar pagamento | `Confirmar acerto`; valor positivo; data efetiva | Acerto pago | Emite recibo próprio | Integral; independente da rescisão oficial |
| D12-23 | Tipo `Encerrado sem registro` | Materializar competência final | Ausência de admissão; período e RA aplicáveis | Grupos pendentes | Fecha PSR na saída inclusiva; pode criar acerto RA; não cria rescisão nem ASO demissional | `Encerrado sem registro` e `Demitido formalmente` são mutuamente exclusivos |
| D12-24 | Valores mensais internos já pagos | Informar desligamento posterior | Ao menos um grupo interno afetado | Em correção | Preserva pagamentos/recibos e abre F04 por grupo, com positivo em ajuste e negativo absorvido | Oficial segue exclusivamente D12-17; competência não fecha enquanto correções/ajustes estiverem pendentes |
| D12-25 | Qualquer situação financeira diferente de `N/A` ou `Financeiro quitado` | Recalcular a projeção financeira | Rescisão, acerto, complementos, PSR, ajustes, destinos e correções aplicáveis resolvidos | Financeiro quitado | Libera o requisito financeiro do checklist | ASO demissional não interfere neste estado; qualquer obrigação restante produz deterministicamente um dos estados anteriores da projeção |

## 17.5 Cálculo executável do acerto complementar de RA

```text
se competência_final = primeira_competência_do_vínculo:
    início_do_direito = máximo(
        primeiro_dia_da_competência,
        início_das_atividades
    )
senão:
    início_do_direito = primeiro_dia_da_competência

RA_proporcional =
RA_vigente_na_saída ÷ 30 × D30(início_do_direito, data_da_saída)

saldo_RA = máximo(
    0,
    RA_proporcional − RA_efetivamente_paga_no_adiantamento
)

excedente_RA_absorvido = máximo(
    0,
    RA_efetivamente_paga_no_adiantamento − RA_proporcional
)

aviso_indenizado_RA =
RA_vigente_na_saída ÷ 30 × dias_indenizados_confirmados

décimo_terceiro_RA =
RA_vigente_na_saída × avos_13_confirmados ÷ 12

férias_proporcionais_RA =
RA_vigente_na_saída × avos_férias_confirmados ÷ 12

um_terço_proporcional = férias_proporcionais_RA ÷ 3

se férias_vencidas_confirmadas:
    férias_vencidas_RA = RA_vigente_na_saída
    um_terço_vencidas = RA_vigente_na_saída ÷ 3
senão:
    férias_vencidas_RA = 0
    um_terço_vencidas = 0

total_acerto_RA =
saldo_RA
+ aviso_indenizado_RA
+ décimo_terceiro_RA
+ férias_proporcionais_RA
+ um_terço_proporcional
+ férias_vencidas_RA
+ um_terço_vencidas
```

Regras:

- usa a RA vigente na data real da saída, sem média;
- avos aceitam inteiros de 0 a 12;
- dias indenizados aceitam inteiro positivo quando aviso for indenizado;
- aviso trabalhado não cria linha adicional;
- não existe dobra de férias;
- salário-base, complemento, reembolso e PSR não entram;
- não existem impostos ou descontos no acerto;
- somente RA efetivamente paga deduz o saldo de RA;
- excedente da RA não reduz aviso, 13º ou férias;
- cálculo manual autorizado preserva fórmula, original, diferença e justificativa.

## 17.6 Invariantes do desligamento

1. Data de saída é inclusiva; inativação ocorre no dia seguinte.
2. Demissão formal exige admissão; desligamento sem registro exige ausência dela.
3. Os dois tipos nunca coexistem no mesmo vínculo.
4. Programação futura não exige dados financeiros completos.
5. Competência inexistente não impede programação e não autoriza fabricar cálculos.
6. Cancelamento simples não é permitido depois de efeitos.
7. Rescisão oficial e acerto de RA são obrigações independentes.
8. RA mensal integral não existe em paralelo ao acerto da competência final.
9. Complementos continuam integrais no grupo mensal.
10. PSR continua em grupo próprio e termina na admissão ou saída sem registro.
11. Reembolso não entra automaticamente na rescisão ou acerto.
12. Pagamento real e recibo nunca são apagados por correção de saída.
13. Nenhum valor é cobrado de volta do empregado; excedente é absorvido.
14. ASO demissional pendente não bloqueia quitação ou fechamento financeiro.
15. MEI nunca entra neste fluxo trabalhista.

---

## 17.7 Cobertura e rastreabilidade dos seis blocos

Esta matriz integrada cobre:

- estados oficiais e checklist da competência;
- D30 e moeda em forma executável;
- catálogo e independência dos grupos e eventos;
- corte do dia 15 por data controladora;
- K06 inconsistente;
- confirmação individual e F03 `todos ou nenhum`;
- ausência de pagamento parcial;
- F04 persistente e por escopo mínimo;
- apuração por verba sem compensação;
- ajuste positivo, diferença absorvida e correção de ajuste pago;
- estados independentes de recibo e arquivo;
- numeração, snapshot, hash, regeneração e lote R03;
- desligamento formal e sem registro;
- inativação no dia seguinte;
- `Decisão necessária` por grupo;
- oficial mensal já pago antes do desligamento tardio;
- rescisão oficial separada do acerto de RA;
- cálculo completo e exclusivo do acerto de RA;
- preservação de histórico, auditoria, idempotência e concorrência.

As transições de ASO, notificação e auditoria global pertencem aos blocos posteriores do Documento 17 e são apenas referenciadas aqui quando produzem ou deixam de produzir bloqueio financeiro.

---

# 18. Bloco 13 — Acompanhamento, exame, versão, prazo e alerta de ASO

## 18.1 Escopo e entidades separadas

O bloco mantém entidades e famílias independentes:

1. acompanhamento operacional;
2. exame lógico;
3. versão do exame;
4. resultado clínico;
5. restrição derivada;
6. prazo derivado;
7. elegibilidade como referência de alerta;
8. ocorrência de notificação, tratada formalmente no Bloco 15.

ASO existe somente para empregado. MEI não aparece em buscas, seleções, filtros, totais ou exportações de ASO.

## 18.2 Matriz do acompanhamento de ASO

Estados: `Pendente`, `Agendado`, `Não compareceu`, `Realizado`, `Encerrado sem realização` e `Cancelado`.

| ID | Estado inicial | Evento | Pré-condição/permissão | Estado final | Efeitos | Auditoria/bloqueio |
|---|---|---|---|---|---|---|
| ASO-A01 | Inexistente | Criar acompanhamento manual | Empresa ativa; vínculo de empregado da empresa; tipo `Periódico`, `Retorno ao trabalho` ou `Mudança de riscos ocupacionais`; permissão `Criar acompanhamento manual`; nenhuma necessidade manual ativa equivalente | Pendente | Cria origem `Necessidade manual`; não cria exame, clínica, resultado ou vencimento | Auditar criação; repetição devolve o mesmo resultado; duplicidade ativa bloqueia e oferece abrir a existente |
| ASO-A02 | Inexistente | Registrar desligamento formal | Desligamento formal válido; mesma empresa; nenhuma pendência demissional para o desligamento | Pendente | Cria acompanhamento demissional ligado ao desligamento | Mesma transação do desligamento e auditoria; desligamento sem registro bloqueia essa criação |
| ASO-A03 | Inexistente | Registrar desligamento formal já coberto por demissional vigente | Existe demissional vigente explicitamente ligado ao mesmo desligamento formal | Realizado | Cria o acompanhamento já resolvido e liga o exame existente; não gera alerta de vencimento | Auditar ligação; segundo demissional não é criado |
| ASO-A04 | Pendente | Marcar como agendado | Permissão `Marcar como agendado`; versão atual; contexto empresarial válido | Agendado | Acrescenta evento à linha do tempo; não cria data, horário, local ou clínica | Auditar transição; versão antiga, empresa trocada ou acompanhamento terminal bloqueiam |
| ASO-A05 | Não compareceu | Marcar novamente como agendado | Permissão `Voltar a agendado`; versão atual | Agendado | Preserva todas as ocorrências anteriores de não comparecimento | Auditar; nunca apaga a linha anterior |
| ASO-A06 | Agendado | Registrar não comparecimento | Permissão `Registrar não comparecimento`; versão atual | Não compareceu | Não cria exame, resultado ou dispensa; atualiza a notificação demissional na mesma ocorrência, quando aplicável | Auditar; `Pendente → Não compareceu` direto é bloqueado |
| ASO-A07 | Pendente, Agendado ou Não compareceu | Confirmar exame realizado em S03 | Permissão `Registrar exame realizado`; formulário e exame válidos; clínica ativa; versão atual | Realizado | Cria exame/versão vigente; liga o acompanhamento; recalcula referência, prazo e alerta de forma atômica | Auditar exame e transição; falha em qualquer etapa reverte tudo |
| ASO-A08 | Pendente, Agendado ou Não compareceu | Encerrar sem realização | Somente tipo demissional; permissão específica `Encerrar demissional sem realização`; justificativa; confirmação explícita; versão atual | Encerrado sem realização | Resolve a pendência sem criar exame, ASO, resultado ou dispensa | Auditar justificativa; ação proibida para acompanhamento manual, admissional, periódico, retorno ou mudança |
| ASO-A09 | Pendente, Agendado ou Não compareceu | Cancelar acompanhamento manual | Origem manual; permissão `Cancelar acompanhamento manual`; justificativa; confirmação; versão atual | Cancelado | Encerra somente a necessidade operacional e preserva toda a linha do tempo | Auditar; origem demissional ou exame já realizado bloqueiam |
| ASO-A10 | Pendente, Agendado, Não compareceu ou Realizado | Cancelar desligamento futuro | Desligamento ainda cancelável; acompanhamento demissional ligado; mesma transação de D12-05 | Cancelado | Resolve a notificação como cancelada; mantém linha do tempo e, se realizado, preserva exame/versão como histórico sem pendência demissional ativa | Auditar junto ao desligamento; cancelamento não apaga nem transforma o exame realizado em dispensa |
| ASO-A10A | Pendente, Agendado, Não compareceu ou Realizado | Cancelar desligamento por correção | D12-07A autorizado; acompanhamento demissional ligado; mesma transação | Cancelado | Resolve notificação, preserva linha do tempo e eventual exame/resultado históricos | Auditar junto à correção; nenhuma informação clínica é apagada ou reutilizada automaticamente |
| ASO-A10B | Encerrado sem realização | Cancelar desligamento simples ou por correção | D12-05 ou D12-07A autorizado; acompanhamento ligado | Encerrado sem realização; origem marcada como desligamento cancelado | Não reabre nem reclassifica o encerramento já ocorrido; mantém a notificação resolvida | Audita a ligação com o cancelamento e não cria dispensa/exame |
| ASO-A11 | Realizado | Invalidar a versão vigente lançada incorretamente | Permissão `Invalidar lançamento`; justificativa; confirmação crítica; versão vigente; necessidade ainda aplicável | Pendente | Mantém exame invalidado no histórico, retira seus efeitos ativos e reabre o acompanhamento relacionado | Auditar invalidação e reabertura atomicamente; não transfere exame a outra pessoa |
| ASO-A12 | Realizado; origem manual | Invalidar exame e cancelar necessidade manual que deixou de existir | Permissões `Invalidar lançamento` e `Cancelar acompanhamento manual`; justificativas; versão vigente | Cancelado | Mantém exame invalidado e linha do tempo; remove referência, prazo ativo e alerta | As duas ações são atômicas e auditadas; sem ambas as permissões, invalida e volta a `Pendente` por ASO-A11 |
| ASO-A13 | Realizado; demissional ligado a desligamento cancelado | Invalidar exame depois do cancelamento válido do desligamento | Permissão `Invalidar lançamento`; desligamento já cancelado; justificativa | Cancelado | Preserva exame invalidado e resolve a pendência como cancelada | Auditar e reconciliar a mesma ocorrência de notificação |
| ASO-A14 | Realizado; demissional ainda aplicável | Invalidar exame | Permissão `Invalidar lançamento`; desligamento formal continua válido; justificativa | Pendente | Reabre a necessidade demissional; não cria dispensa ou novo exame automaticamente | Auditar; acompanhamento permanece pendente até realização ou encerramento autorizado |

## 18.3 Matriz do exame lógico e de suas versões

Estados da versão: `Vigente`, `Substituída` e `Invalidada administrativamente`.

| ID | Estado inicial | Evento | Pré-condição/permissão | Estado final | Efeitos | Auditoria/bloqueio |
|---|---|---|---|---|---|---|
| ASO-E01 | Inexistente | Registrar novo admissional | Empresa ativa; vínculo com admissão formal; permissão de registrar; clínica ativa; data não futura; resultado escolhido; nenhum admissional vigente no vínculo | Versão 1 vigente | Cria exame lógico; sugere vencimento de 12 meses, editável; compara data com início das atividades | Auditar; ausência de admissão formal ou segundo admissional bloqueia e direciona à retificação |
| ASO-E02 | Inexistente | Registrar novo periódico | Empresa ativa; vínculo de empregado; campos válidos; clínica ativa; permissão de registrar | Versão 1 vigente | Cria novo exame lógico, mesmo que existam periódicos anteriores; pode assumir referência de alerta | Auditar; nunca retifica automaticamente o periódico anterior |
| ASO-E03 | Inexistente | Registrar retorno ao trabalho ou mudança de riscos | Empresa ativa; campos válidos; clínica ativa; permissão de registrar | Versão 1 vigente | Cria nova ocorrência do tipo | Mesmo vínculo, tipo e data gera aviso; continuar exige confirmação explícita e é auditado |
| ASO-E04 | Inexistente | Registrar demissional | Desligamento formal correspondente; clínica ativa; permissão de registrar; nenhum demissional vigente no mesmo desligamento | Versão 1 vigente | Liga exame ao desligamento e resolve o acompanhamento demissional; não cria vencimento futuro | Auditar; segundo demissional do mesmo desligamento bloqueia e direciona à retificação |
| ASO-E05 | Versão vigente | Retificar o mesmo exame | Permissão `Retificar exame`; mesma empresa, pessoa, vínculo, tipo e exame lógico; formulário válido; versão atual | Anterior substituída e nova versão vigente | Preserva snapshot anterior; recalcula resultado derivado, prazo, referência e alerta; não duplica exame lógico | Auditar antes/depois conforme permissão; conflito de versão bloqueia |
| ASO-E06 | Versão vigente | Invalidar lançamento incorreto | Permissão `Invalidar lançamento`; justificativa; confirmação; versão atual | Invalidada administrativamente | Remove a versão da referência e do alerta ativo; preserva todos os dados e reabre acompanhamento quando aplicável | Auditar; não excluir, editar retroativamente ou mover para outra pessoa |
| ASO-E07 | Versão `Substituída` ou `Invalidada administrativamente` | Abrir versão histórica | Permissão de consultar ASO e campos atuais | Permanece no mesmo estado | Exibe somente leitura; resultado permanece oculto sem autorização sensível | Abertura comum não muda vigência; tentativa de editar é bloqueada |
| ASO-E08 | Versão em estado `Vigente`, `Substituída` ou `Invalidada administrativamente` | Visualizar resultado clínico | Permissão `Visualizar resultado clínico`; sessão, empresa e registro revalidados; ação explícita | Permanece no mesmo estado | Revela resultado e, se também permitido, restrição derivada | Auditar acesso sensível; sem permissão, o campo nem chega ao navegador |
| ASO-E09 | Versão vigente | Alterar resultado, clínica, data ou vencimento | Deve usar `Retificar exame`; não existe edição destrutiva | Nova versão vigente somente por ASO-E05 | Mantém memória completa da mudança | Edição direta é proibida |
| ASO-E10 | Qualquer | Transferir exame para outra empresa, pessoa ou vínculo | Nunca permitido por retificação comum | Sem transição | Orienta invalidar o lançamento errado e cadastrar o correto | Bloqueio seguro; outra empresa responde como não encontrado |

## 18.4 Validações temporais e de conteúdo do exame

- data de exame futura é bloqueada;
- vencimento anterior à data do exame é bloqueado;
- demissional não recebe vencimento;
- admissional posterior ao início das atividades gera aviso de conferência, sem bloqueio automático;
- demissional anterior à data de saída gera aviso de conferência;
- periódico, retorno, mudança ou demissional anterior ao início das atividades é bloqueado;
- vencimento sugerido adiciona 12 meses de calendário; quando o dia não existir no mês final, usa o último dia válido;
- resultado começa vazio em novo exame e exige escolha consciente;
- retificação pode carregar a versão vigente para revisão, mas só grava uma nova versão;
- clínica escolhida é revalidada como ativa imediatamente antes da confirmação;
- razão social, nome fantasia e CNPJ da clínica são gravados em snapshot;
- documento, imagem, diagnóstico, CID, médico, CRM, descrição de restrição, assinatura e observação clínica livre não existem.

## 18.5 Resultado e restrição derivada

| ID | Resultado vigente | Restrição derivada | Regra |
|---|---|---|---|
| ASO-R01 | Apto | Sem restrição | Somente para usuário autorizado a ver resultado e restrição |
| ASO-R02 | Apto com restrição | Com restrição | Nenhuma descrição da restrição é armazenada |
| ASO-R03 | Inapto | Não aplicável | `Inapto` nunca é convertido em `Com restrição` |
| ASO-R04 | Sem exame vigente ligado | Inexistente | Acompanhamento pendente, agendado, não compareceu, encerrado ou cancelado não fabrica resultado; cancelamento por ASO-A10 pode preservar em histórico o resultado do exame que já havia sido realizado, sem torná-lo pendência ativa |

Resultado e restrição não usam máscara parcial. Sem permissão, são omitidos de API, tela, filtros, ordenação, totais, histórico, notificações e Excel.

## 18.6 Matriz de prazo, referência e alerta

O prazo é derivado pela data operacional `hoje`:

```text
Vencido: vencimento < hoje
Vencendo em até 30 dias: hoje <= vencimento <= hoje + 30 dias corridos
Vigente: vencimento > hoje + 30 dias corridos
```

Catálogos independentes:

- eixo `Prazo`: `Sem prazo`, `Vigente`, `Vencendo em até 30 dias`, `Vencido`, `Não aplicável`;
- eixo `Referência de alerta`: `Sem referência`, `Referência ativa`, `Informativo`, `Suprimido por vínculo inativo`, `Não aplicável`;
- a ocorrência de alerta usa `Ativa`/`Resolvida` e pertence ao Bloco 15; as linhas abaixo apenas criam, atualizam ou resolvem essa ocorrência como efeito.

| ID | Estado inicial | Evento | Pré-condição/permissão | Estado final | Efeitos | Auditoria/bloqueio |
|---|---|---|---|---|---|---|
| ASO-P01A | Prazo: Sem prazo | Confirmar exame monitorado vigente | Versão vigente; vencimento > hoje + 30 dias corridos | Prazo: Vigente | Calcula pela data operacional; não salva rótulo fixo | Gravação do exame é auditada; cálculo diário não gera auditoria |
| ASO-P01B | Prazo: Sem prazo | Confirmar exame monitorado na janela | Versão vigente; hoje ≤ vencimento ≤ hoje + 30 dias corridos | Prazo: Vencendo em até 30 dias | Cria/atualiza a condição de alerta aplicável | Gravação é auditada; cálculo diário não gera nova versão |
| ASO-P01C | Prazo: Sem prazo | Confirmar exame monitorado já vencido | Versão vigente; vencimento < hoje | Prazo: Vencido | Cria/atualiza a condição vencida e sua urgência | Gravação é auditada; cálculo diário não gera nova versão |
| ASO-P02 | Prazo: Sem prazo | Confirmar demissional | Tipo demissional | Prazo: Não aplicável; referência: Não aplicável | Nenhum alerta futuro de vencimento | Tentativa de informar vencimento demissional é bloqueada |
| ASO-P03 | Prazo: Vigente | Entrar na janela de 30 dias | Rotina diária; versão vigente e referência ativa | Prazo: Vencendo em até 30 dias | Cria ou atualiza uma única ocorrência de notificação autorizada | Não cria versão; rotina idempotente |
| ASO-P04 | Prazo: Vencendo em até 30 dias | Passar o dia do vencimento | Rotina diária; data atual maior que vencimento | Prazo: Vencido | Aumenta urgência na mesma ocorrência; leitura pode voltar a `Não lida` | Não cria nova ocorrência diária |
| ASO-P05A | Prazo: Vigente, Vencendo em até 30 dias ou Vencido | Retificar vencimento para além de 30 dias | Nova versão válida; vencimento > hoje + 30 dias | Prazo: Vigente | Recalcula e resolve eventual ocorrência que deixou de aplicar | Preserva prazo histórico; audita a nova versão |
| ASO-P05B | Prazo: Vigente, Vencendo em até 30 dias ou Vencido | Retificar vencimento para a janela | Nova versão válida; hoje ≤ vencimento ≤ hoje + 30 dias | Prazo: Vencendo em até 30 dias | Recalcula e cria/atualiza uma única ocorrência | Preserva prazo histórico; audita sem duplicar alerta |
| ASO-P05C | Prazo: Vigente, Vencendo em até 30 dias ou Vencido | Retificar vencimento para data passada | Nova versão válida; vencimento < hoje | Prazo: Vencido | Recalcula e cria/atualiza a urgência na mesma condição | Preserva prazo histórico; audita sem criar versão diária |
| ASO-P06 | Referência: Sem referência | Confirmar admissional vigente antes do primeiro periódico | Vínculo ativo; nenhum periódico vigente | Referência ativa | Admissional passa a orientar o alerta inicial | Uma única referência ativa protegida por regra de domínio |
| ASO-P07 | Referência admissional ou periódico anterior | Confirmar novo periódico vigente | Vínculo ativo; novo periódico válido | Novo periódico: Referência ativa; anterior: Informativo | Reconcilia prazo e notificação sem apagar exames anteriores | Auditar novo exame; não duplicar alerta para a condição anterior |
| ASO-P08A | Referência: qualquer | Confirmar retorno ou mudança de riscos | Exame válido desses tipos | Novo exame: Informativo | Não substitui admissional/periódico de referência | Nenhuma promoção automática a referência |
| ASO-P08B | Referência: qualquer | Confirmar demissional | Exame demissional válido | Novo exame: Não aplicável | Não substitui admissional/periódico de referência e não cria prazo | Nenhuma promoção automática a referência |
| ASO-P09 | Referência ativa | Inativar vínculo | Data efetiva atingida | Suprimido por vínculo inativo | Resolve alerta vigente com motivo derivado; mantém prazo histórico | Não apagar exame ou notificação resolvida |
| ASO-P10A | Referência ativa | Invalidar exame com candidato anterior elegível | Invalidação confirmada; existe versão vigente anterior de admissional/periódico permitida para o vínculo ativo | Candidato elegível mais recente: Referência ativa | Promove deterministicamente o exame anterior mais recente, recalcula prazo e atualiza/resolve a ocorrência | Auditar invalidação e promoção; nunca escolhe retorno, mudança ou demissional |
| ASO-P10B | Referência ativa | Invalidar exame sem candidato elegível | Invalidação confirmada; nenhuma versão vigente anterior de admissional/periódico pode ser referência | Referência: Não aplicável | Resolve ocorrência vigente; pode reabrir acompanhamento conforme ASO-A11/A14 | Auditar invalidação; prova ausência de candidato antes de concluir |
| ASO-P11 | Referência ativa | Retificar versão mantendo a mesma condição de alerta | Mesmo exame lógico permanece referência; prazo recalculado pela linha P05 aplicável | Permanece Referência ativa | Atualiza a mesma ocorrência lógica e seu resumo | Não resolve e recria artificialmente a notificação |
| ASO-P12 | Referência ativa; ocorrência resolvida | Condição de alerta reaparecer legitimamente | Nova ocorrência lógica depois da resolução | Referência ativa; nova ocorrência ativa | Incrementa sequência e cria leitura inicial `Não lida` | Ocorrência anterior permanece resolvida |

## 18.7 Identidades, unicidades e deduplicação

- acompanhamento demissional: único por `empresa + desligamento formal`;
- acompanhamento manual ativo: no máximo um por `empresa + vínculo + tipo + origem manual`;
- admissional vigente: único por `empresa + vínculo`;
- demissional vigente: único por `empresa + desligamento formal`;
- versão vigente: exatamente uma por exame lógico não invalidado;
- referência ativa de alerta: no máximo uma por vínculo;
- periódico é novo exame lógico, não versão do periódico anterior;
- retorno e mudança com mesmo vínculo, tipo e data geram aviso, não restrição única absoluta;
- criação, conclusão, retificação, invalidação e transições usam chave de repetição segura;
- unicidades são verificadas novamente dentro da transação e protegidas no banco.

## 18.8 Transições proibidas

- `Pendente → Não compareceu` sem passar por `Agendado`;
- qualquer estado terminal de acompanhamento voltar a ativo sem uma correção expressamente autorizada;
- encerrar sem realização um acompanhamento que não seja demissional;
- usar `Encerrado sem realização` como sinônimo de dispensa ou exame;
- criar acompanhamento demissional a partir de desligamento sem registro;
- lançar admissional sem admissão formal;
- criar segundo admissional vigente no mesmo vínculo ou segundo demissional vigente no mesmo desligamento;
- alterar uma versão histórica;
- transferir exame entre empresas, pessoas, vínculos ou desligamentos por edição comum;
- tornar retorno, mudança ou demissional referência periódica;
- gerar alerta a partir de versão substituída, invalidada, demissional ou vínculo inativo;
- revelar resultado ou restrição em painel, sino ou notificação.

---

# 19. Bloco 14 — Clínica

## 19.1 Escopo

Clínica é entidade global compartilhada, sem `empresa_id` operacional. S05 e S06 exibem faixa `Escopo global`. A permissão global de clínicas não concede acesso a empregado ou ASO; a permissão empresarial de ASO não concede administração do catálogo.

Estados: `Ativa` e `Inativa`.

## 19.2 Matriz da clínica

| ID | Estado inicial | Evento | Pré-condição/permissão | Estado final | Efeitos | Auditoria/bloqueio |
|---|---|---|---|---|---|---|
| CLI-01 | Inexistente | Cadastrar clínica | Permissão global `Criar clínica`; razão social e nome fantasia válidos; CNPJ estruturalmente válido e único | Ativa | Disponibiliza para novas seleções de exame | Auditar; CNPJ normalizado duplicado ou repetição concorrente bloqueia |
| CLI-02 | Ativa ou Inativa | Editar cadastro | Permissão global `Editar clínica`; versão atual; campos válidos | Permanece no mesmo estado | Atualiza catálogo; snapshots anteriores não mudam | Auditar antes/depois; versão antiga bloqueia |
| CLI-03 | Ativa | Inativar | Permissão global `Inativar clínica`; justificativa; resumo de impacto; confirmação; versão atual | Inativa | Retira de novas seleções; preserva consulta e snapshots | Auditar na mesma operação; não altera ASO anterior |
| CLI-04 | Inativa | Reativar | Permissão global `Reativar clínica`; justificativa; confirmação; versão atual | Ativa | Volta a novas seleções após confirmação | Auditar; versão ou CNPJ conflitante bloqueia |
| CLI-05 | Ativa | Selecionar em novo exame | Permissão empresarial de registrar exame; vínculo e empresa válidos; clínica revalidada como ativa | Permanece | ASO grava identificador e snapshot cadastral | Selecionar não exige visualizar S05; clínica inativa no instante da confirmação bloqueia |
| CLI-06 | Ativa ou Inativa | Abrir snapshot por S04 | Permissão empresarial de consultar o ASO | Permanece | Mostra dados gravados no exame, mesmo sem permissão global | Não revela utilização da clínica fora daquele ASO |
| CLI-07 | Ativa ou Inativa | Exportar catálogo | Permissão global `Exportar catálogo`; filtros válidos | Permanece | Encaminha pedido ao Bloco 16, somente com dados cadastrais | Auditar exportação; nunca incluir empresas, empregados, exames ou contagem de uso |

## 19.3 Invariantes e deduplicação

- CNPJ é único globalmente depois da normalização;
- clínica inicia ativa;
- clínica inativa continua consultável e editável conforme permissão;
- snapshot do ASO contém razão social, nome fantasia, CNPJ e momento/versão técnica usada;
- mudança global nunca reescreve snapshot;
- selecionar clínica em S03 não abre acesso ao catálogo global;
- administrar clínica não permite consultar seus usos;
- operações de criar, editar, inativar e reativar usam versão e idempotência.

## 19.4 Transições proibidas

- exclusão física de clínica na primeira versão;
- escolher clínica inativa em novo exame;
- editar snapshot histórico por meio de S05/S06;
- associar clínica global diretamente a empresa para conceder acesso;
- exibir empresas, empregados, ASOs, resultados ou quantidade de utilizações no catálogo ou Excel de clínicas;
- usar permissão global de clínica para atravessar o isolamento empresarial.

---

# 20. Bloco 15 — Notificação e leitura

## 20.1 Entidades e identidade lógica

Há duas entidades relacionadas e independentes:

- ocorrência operacional: `Ativa` ou `Resolvida`;
- leitura por usuário: `Não lida` ou `Lida`.

```text
chave da condição =
empresa + tipo estável + entidade de origem + discriminadores do domínio
```

Os discriminadores podem incluir competência, grupo, evento, acompanhamento ou referência de vencimento. Existe no máximo uma ocorrência ativa por chave. Um número sequencial só aumenta quando uma condição já resolvida reaparece legitimamente.

## 20.2 Matriz da ocorrência operacional

| ID | Estado inicial | Evento | Pré-condição/permissão | Estado final | Efeitos | Auditoria/bloqueio |
|---|---|---|---|---|---|---|
| NOT-O01 | Inexistente | Condição da origem tornar-se ativa | Empresa da origem definida; chave válida; nenhuma ocorrência ativa equivalente | Ativa | Cria ocorrência sequencial; leitura inicial é `Não lida` para cada usuário autorizado | Rotina idempotente; restrição única impede duplicidade diária |
| NOT-O02 | Ativa | Rotina reencontrar a mesma condição | Mesma chave da condição | Ativa | Atualiza referência, data ou urgência na mesma ocorrência | Não cria nova linha operacional |
| NOT-O03 | Ativa | Origem deixar de estar pendente | Mudança confirmada na entidade de origem | Resolvida | Move para resolvidas; preserva por 90 dias | Resolução derivada, nunca comando manual de N01 |
| NOT-O04 | Resolvida | Mesma condição reaparecer | Nova ocorrência lógica depois da resolução | Resolvida na anterior e nova Ativa | Incrementa sequência; nova leitura nasce `Não lida` | Não reabrir nem sobrescrever ocorrência anterior |
| NOT-O05 | Ativa | Urgência aumentar | Mesma condição; limiar de urgência atingido | Ativa | Atualiza a mesma ocorrência; leituras `Lida` afetadas voltam a `Não lida` | Não duplicar ocorrência |
| NOT-O06 | Ativa | Permissão da origem ser retirada de um usuário | Autorização atual não permite mais conhecer origem | Ativa, invisível ao usuário | Remove item, prévia e contador daquele usuário na próxima autorização | Não revela motivo, conteúdo ou existência; ocorrência empresarial não é apagada |
| NOT-O07 | Resolvida | Completar 90 dias | Rotina de retenção da central | Resolvida, fora da consulta operacional | Remove da aba recente; auditoria e origem seguem suas retenções | Não cria terceiro estado de negócio e não apaga auditoria |
| NOT-O08 | Ativa | Acompanhamento demissional ir para `Não compareceu` | Mesma S02 demissional | Ativa | Mantém tipo estável `Pendência de ASO demissional`; muda resumo, subestado e urgência | No máximo uma ocorrência ativa por acompanhamento |
| NOT-O09 | Ativa | Reagendar após não comparecimento | Mesma S02, transição autorizada para `Agendado` | Ativa | Atualiza resumo/subestado na mesma ocorrência | Não cria segunda ocorrência |
| NOT-O10 | Ativa | Realizar, encerrar ou cancelar a pendência demissional | Origem confirmada | Resolvida | Registra motivo derivado: realizada, encerrada ou cancelada | Preserva linha do tempo e 90 dias |
| NOT-O11 | Ativa; usuário passa a ter acesso à origem | Conceder ou restaurar autorização | Empresa, ocorrência e origem atualmente autorizadas | Ativa e visível para o usuário | Se nunca houve leitura, cria `Não lida`; se o acesso foi restaurado, preserva a leitura anterior, salvo urgência aumentada durante a ausência, quando volta a `Não lida` | Não altera a ocorrência empresarial; criação/restauração é idempotente e não revela período em que o usuário não tinha acesso |

## 20.3 Matriz da leitura individual

| ID | Estado inicial | Evento | Pré-condição/permissão | Estado final | Efeitos | Auditoria/bloqueio |
|---|---|---|---|---|---|---|
| NOT-L01 | Não lida | Marcar item como lido | Usuário, empresa, central, ocorrência e origem ainda autorizados | Lida | Atualiza somente a leitura do executor; origem permanece igual | Idempotente; item oculto ou de outra empresa é ignorado com resposta segura |
| NOT-L02 | Não lida | Marcar itens visíveis como lidos | IDs pertencem à página e aos filtros atuais e continuam autorizados | Lida nos IDs elegíveis | Não afeta resultados não carregados, ocultos ou de outra página | Revalidar lista no servidor; clique repetido não duplica efeito |
| NOT-L03 | Lida | Marcar novamente como lida | Mesmas autorizações | Lida | Nenhum efeito adicional | Retorna sucesso idempotente |
| NOT-L04 | Lida | Ocorrência tornar-se urgente | Ocorrência ativa e escalada real de urgência | Não lida | Recoloca no contador do sino para esse usuário | Atualização derivada; não cria ocorrência nova |
| NOT-L05 | Lida ou Não lida | Resolver ocorrência | Origem resolvida | Permanece | Estado de leitura é preservado na aba resolvida | Resolver não equivale a marcar como lida |
| NOT-L06 | Qualquer | Abrir origem | Permissão de N01 e da origem; empresa ativa correta | Permanece | Abre destino e preserva caminho de retorno | Reautorizar antes de carregar; falha não confirma entidade |

## 20.4 Contador, agrupamento e escopo

- sino conta somente ocorrências simultaneamente `Ativas`, `Não lidas` e autorizadas;
- lista, filtros, agrupamentos e quantidades são calculados depois de empresa e permissões;
- agrupamento financeiro não funde as ocorrências de origem nem altera suas chaves;
- ASOs podem permanecer individualizados;
- troca de empresa limpa sino, lista, filtros e retornos anteriores;
- atualização periódica do sino não renova a sessão;
- notificações nunca carregam resultado ou restrição clínica, salário, RA, CPF ou CNPJ desnecessário.

## 20.5 Transições proibidas

- resolver, reabrir ou excluir ocorrência manualmente em N01;
- usar `Marcar como lida` para alterar a origem;
- criar nova ocorrência diária para a mesma condição ativa;
- reabrir ocorrência resolvida em vez de criar nova sequência;
- mudar o tipo estável da pendência demissional ao registrar não comparecimento;
- marcar como lidos itens fora da página/filtros autorizados;
- exibir item, filtro, total ou contador quando a origem não é autorizada;
- gerar e-mail, SMS, push, comentário, atribuição, adiamento ou escalonamento manual;
- gerar notificação por conclusão de exportação.

---

# 21. Bloco 16 — Exportação

## 21.1 Escopos e estados

Escopos:

- empresarial ativo: C01, K03, S01 e H01;
- empresarial inativo em consulta histórica: mesmas origens, somente com permissão específica;
- global: S05 e H02;
- H02 permanece master-only e exportação global extensa pode exigir reautenticação recente.

Estados do arquivo temporário: `Preparando`, `Processando`, `Pronto`, `Falhou`, `Expirado` e `Indisponível`.

## 21.2 Matriz da exportação

| ID | Estado inicial | Evento | Pré-condição/permissão | Estado final | Efeitos | Auditoria/bloqueio |
|---|---|---|---|---|---|---|
| EXP-01 | Inexistente | Solicitar exportação empresarial | Sessão; empresa ativa; permissão específica de exportar; permissão atual dos campos; filtros válidos; resultado estimado não vazio | Preparando | Grava solicitante, `empresa_id`, origem, filtros, colunas, período e versão financeira quando aplicável | Auditar pedido; campo oculto omitido e mascarado permanece mascarado |
| EXP-02 | Inexistente | Solicitar exportação histórica de empresa inativa | Permissão específica de exportar no CNPJ inativo; somente consulta histórica | Preparando | Arquivo permanece empresarial e carrega o `empresa_id` inativo | Auditar em H01; tentativa de mutação ou ausência de permissão bloqueia |
| EXP-03 | Inexistente | Solicitar exportação global de clínicas | Permissão global `Exportar catálogo`; filtros válidos | Preparando | Snapshot contém somente cadastro de clínica | Auditar; uso, empresas, empregados e ASOs são proibidos |
| EXP-04 | Inexistente | Solicitar exportação global de auditoria | Master; TOTP concluído; H02 autorizado; período/filtros; reautenticação recente quando aplicável | Preparando | Snapshot global controlado; nunca inclui segredos | Auditar; usuário comum ou contexto inadequado bloqueia |
| EXP-05 | Pedido empresarial de ASO validado por EXP-01 | Incluir resultado clínico no Excel | Todas as condições de EXP-01; permissões atuais `Visualizar resultado clínico` e `Exportar ASOs`; confirmação sensível específica; permissão própria para restrição quando incluída | Preparando no mesmo pedido | Acrescenta somente resultado/restrição autorizados ao snapshot já empresarial | Auditar confirmação/exportação sensível; sem qualquer controle cumulativo, omite o campo ou bloqueia conforme a escolha, nunca cria pedido paralelo |
| EXP-06 | Inexistente | Solicitar exportação sem linhas | Filtros retornam zero registros autorizados | Inexistente | Não gera arquivo | Registrar resultado do pedido conforme política; orientar ajuste de filtros sem revelar dados ocultos |
| EXP-07 | Preparando | Iniciar geração assíncrona | Pedido íntegro e ainda autorizado | Processando | Reserva processamento privado | Auditar início quando aplicável; repetição recupera o mesmo pedido |
| EXP-08 | Preparando ou Processando | Concluir geração | Conteúdo e permissões do snapshot válidos; neutralização concluída | Pronto | Disponibiliza arquivo privado ao solicitante por até 24 horas | Auditar conclusão; nenhuma notificação ou e-mail |
| EXP-09 | Preparando ou Processando | Falhar geração | Erro técnico ou validação tardia | Falhou | Não altera dados de negócio, pagamentos ou documentos | Auditar falha sem dados sensíveis; nova tentativa é controlada |
| EXP-10 | Pronto | Baixar | Mesmo solicitante; sessão válida; empresa/escopo correto; permissões e campos atuais revalidados | Pronto | Entrega arquivo privado com `no-store` | Auditar download; mudança de permissão, empresa ou sessão nega sem entregar parcialmente |
| EXP-10A | Pronto | Sessão expirar, encerrar ou ser revogada | Arquivo ainda dentro de 24 horas | Pronto, sem download na sessão atual | Nega a tentativa atual; depois de nova autenticação, só libera ao mesmo solicitante se escopo e permissões continuarem válidos | Auditar negação; expiração da sessão não descarta definitivamente o arquivo |
| EXP-11 | Pronto | Perder autorização efetiva ou invalidar o escopo do pedido | Solicitante perdeu empresa, função global, campo ou permissão aplicável; ou arquivo foi descartado | Indisponível | Download passa a ser negado e o arquivo pode ser descartado | Auditar negação/indisponibilidade; nova sessão não restaura autorização retirada |
| EXP-12 | Pronto | Completar 24 horas | Rotina de expiração | Expirado | Remove acesso e descarta arquivo temporário conforme política | Auditar expiração |
| EXP-13 | Falhou, Expirado ou Indisponível | Solicitar novamente | Nova autorização e filtros válidos | Preparando em novo pedido | Preserva pedido anterior para auditoria; não o reativa | Nova chave para solicitação intencional; repetição acidental continua idempotente |

## 21.3 Conteúdo e formatação

- C01 exporta colaboradores conforme aba e filtros;
- K03 exporta a competência e sua versão, eventos, componentes, ajustes e recibos autorizados;
- S01 exporta uma linha por exame visível, somente sua versão atual vigente ou invalidada;
- versão atual invalidada entra marcada `Invalidada administrativamente` quando estiver visível;
- versões substituídas ficam em S04, histórico e auditoria e não entram no Excel operacional da primeira versão;
- S05 exporta somente cadastro global de clínicas;
- H01 contém uma empresa; H02 é global e master-only;
- CPF e CNPJ são texto; datas são datas; valores e percentuais são números;
- nenhuma fórmula de negócio recalcula valores;
- texto iniciado por `=`, `+`, `-` ou `@` é neutralizado;
- arquivo pertence exclusivamente ao solicitante e nunca possui URL pública permanente.

## 21.4 Idempotência, concorrência e transições proibidas

- chave de pedido considera solicitante, origem, escopo e identificador da operação;
- resposta incerta é consultada antes de permitir nova tentativa;
- mesma chave não gera dois arquivos;
- pedido e download revalidam autorização em momentos distintos;
- trocar empresa invalida o acesso ao arquivo empresarial do contexto anterior;
- não existe importação de retorno;
- não existe central ou item de menu de exportações;
- exportação não amplia permissão de visualização;
- arquivo vazio, misto entre empresas ou parcialmente autorizado é proibido;
- arquivo pronto nunca continua baixável depois de perda de autorização;
- PDF definitivo de recibo não usa estes estados nem expira em 24 horas.

---

# 22. Bloco 17 — Incidente

## 22.1 Escopo, permissões e estados

Incidente usa escopo restrito próprio, separado dos contextos empresarial e global comum.

Permissões independentes:

- `Registrar incidente`;
- `Consultar incidentes`;
- `Acrescentar acompanhamento`;
- `Concluir ou reabrir incidente`.

Dependências cumulativas: `Acrescentar acompanhamento` exige também `Consultar incidentes`; `Concluir ou reabrir` exige `Consultar incidentes` e capacidade de acrescentar a entrada imutável correspondente.

Estados: `Aberto`, `Em tratamento` e `Concluído`.

Usuário autorizado somente a registrar recebe confirmação do próprio envio, mas não lista, contador, identidade ou conteúdo dos demais incidentes.

## 22.2 Matriz do incidente

| ID | Estado inicial | Evento | Pré-condição/permissão | Estado final | Efeitos | Auditoria/bloqueio |
|---|---|---|---|---|---|---|
| INC-01 | Inexistente | Registrar incidente | Permissão `Registrar incidente`; datas percebida e de conhecimento; descrição objetiva; possíveis alcances; texto seguro | Aberto | Gera identificador único; grava registrador/data do servidor; contenção e referência de evidência são opcionais | Auditar criação; chave idempotente impede incidente duplicado |
| INC-02 | Aberto | Iniciar tratamento | Permissões `Consultar incidentes` e `Acrescentar acompanhamento`; versão atual; primeira ação de tratamento registrada | Em tratamento | Acrescenta linha imutável de início/ação | Auditar estado e entrada juntos; conflito bloqueia |
| INC-03 | Aberto ou Em tratamento | Acrescentar entrada | Permissões `Consultar incidentes` e `Acrescentar acompanhamento`; categoria válida; descrição objetiva; versão atual | Permanece | Acrescenta autor, data do servidor, categoria, descrição e referências | Auditar; entrada anterior nunca é editada ou excluída |
| INC-04 | Aberto ou Em tratamento | Corrigir informação anterior | Permissão de acompanhar; referência explícita à entrada corrigida | Permanece | Cria nova entrada relacionada e preserva a anterior | Auditar; edição retroativa é bloqueada |
| INC-05 | Aberto ou Em tratamento | Confirmar alcance | Permissão de acompanhar; categorias e quantidades conhecidas/estimadas; versão atual | Permanece | Atualiza projeção do alcance por nova entrada; não concede acesso empresarial | Auditar; dado pessoal integral em texto livre é bloqueado |
| INC-06 | Aberto ou Em tratamento | Registrar avaliação jurídica/LGPD | Permissão de acompanhar; responsável, data, conclusão, decisão, justificativa e prazo aplicável | Permanece | Registra avaliação manual; não toma decisão automática | Auditar; sistema não envia comunicação |
| INC-07 | Aberto ou Em tratamento | Registrar comunicação externa realizada | Permissão de acompanhar; decisão prévia; data, protocolo ou referência | Permanece | Acrescenta linha de comunicação à ANPD ou titulares | Auditar somente o registro; nenhum envio ocorre pelo sistema |
| INC-08 | Aberto ou Em tratamento | Concluir | Permissões `Consultar incidentes`, `Acrescentar acompanhamento` e `Concluir ou reabrir`; versão atual; checklist completo | Concluído | Acrescenta conclusão imutável e mantém retenção mínima de seis anos | Auditar; ausência de alcance/justificativa, contenção, correção/decisão, avaliação, comunicações aplicáveis ou conclusão bloqueia |
| INC-09 | Concluído | Reabrir | Permissões `Consultar incidentes`, `Acrescentar acompanhamento` e `Concluir ou reabrir`; reautenticação; justificativa; versão atual | Em tratamento | Preserva conclusão anterior e acrescenta nova entrada de reabertura | Auditar criticamente; nunca volta a `Aberto` |
| INC-10 | Qualquer | Consultar | Permissão `Consultar incidentes`; escopo restrito válido | Permanece | Exibe somente conteúdo autorizado | Acesso negado não revela existência; registrar sozinho não concede consulta |

## 22.3 Linha do tempo e checklist

Categorias permitidas:

- Registro inicial;
- Contenção;
- Evidência preservada;
- Alcance confirmado;
- Correção;
- Restauração;
- Avaliação jurídica/LGPD;
- Comunicação à ANPD;
- Comunicação aos titulares;
- Decisão;
- Monitoramento;
- Conclusão;
- Melhoria;
- Reabertura ou correção relacionada, como categoria técnica controlada.

Para concluir, exigir:

1. alcance final ou justificativa de desconhecido;
2. contenção registrada;
3. correção ou decisão documentada;
4. avaliação jurídica/LGPD;
5. situação das comunicações aplicáveis;
6. conclusão objetiva;
7. melhoria ou justificativa para nenhuma melhoria adicional.

## 22.4 Invariantes e deduplicação

- identificador de incidente é único e nunca reutilizado;
- criação e cada entrada usam chave de repetição segura;
- I02 carrega versão; salvamento antigo não sobrescreve;
- linha do tempo é somente de acréscimo;
- referência de evidência aponta para localização segura externa, sem upload;
- possível ou confirmado alcance empresarial não concede permissão operacional nos CNPJs;
- comunicação e decisão jurídica são registradas, nunca automatizadas;
- incidente, linha do tempo e auditoria permanecem por no mínimo seis anos;
- responsáveis nominais são definidos antes da produção;
- operação, nova entrada, mudança de estado e auditoria concluem atomicamente.

## 22.5 Transições proibidas

- `Concluído → Aberto`;
- `Em tratamento → Aberto`;
- acrescentar acompanhamento a incidente concluído sem reabrir;
- reabrir sem permissão, reautenticação, justificativa ou versão atual;
- editar ou excluir entrada anterior;
- excluir fisicamente incidente;
- anexar arquivo ou copiar base, CPF completo, resultado clínico, senha, token, segredo ou chave privada para texto livre;
- enviar automaticamente comunicação à ANPD ou titulares;
- decidir automaticamente obrigação jurídica;
- usar o incidente como meio de acessar dados operacionais de empresa afetada.

---

# 23. Bloco 18 — Estados comuns de tela e concorrência

## 23.1 Princípio

Estado de tela é uma projeção de interação e nunca substitui o estado da entidade de negócio. A interface só anuncia sucesso depois de receber e reler o resultado confirmado pelo servidor.

Estados comuns: `Inicial`, `Principal`, `Principal com alterações`, `Principal aguardando decisão de descarte`, `Vazio`, `Filtro sem resultado`, `Carregando`, `Validação`, `Processando`, `Processando em reconciliação`, `Sucesso`, `Falha`, `Conflito`, `Sem permissão`, `Sessão expirada` e `Contexto inválido`.

`Principal com alterações` é o vetor `Principal + edição local: alteração não salva`; `Principal aguardando decisão de descarte` é o mesmo modal referenciado por B02-CTX-05 a B02-CTX-07. Esses nomes não criam estado de negócio.
`Falha de leitura` e `Falha de mutação` são subtipos determinísticos de `Falha`, definidos pelo tipo do comando cuja ausência de conclusão já foi reconciliada.
UI-15 a UI-17 governam somente a projeção e o modal genérico. Quando o destino é troca de empresa, B02-CTX-05 a B02-CTX-07 governam a mutação do contexto no mesmo comando; não há duas mutações nem duas auditorias de negócio para a mesma decisão.

## 23.2 Matriz dos estados de tela

| ID | Estado inicial | Evento | Pré-condição/permissão | Estado final | Efeitos | Auditoria/bloqueio |
|---|---|---|---|---|---|---|
| UI-01 | Inicial ou Principal | Abrir, atualizar ou aplicar filtro | Sessão e rota válidas | Carregando | Exibe estrutura neutra; desabilita ação crítica | Não mostrar dado antigo ou de outro contexto |
| UI-02 | Carregando | Servidor retornar registros autorizados | Autorização e escopo confirmados | Principal | Renderiza somente campos permitidos | Leitura comum só é auditada quando regra sensível exigir |
| UI-03 | Carregando | Servidor retornar coleção vazia sem filtro | Escopo válido; nenhum registro autorizado | Vazio | Mostra mensagem específica e ação somente se autorizada | Não usar zero para confirmar módulo oculto |
| UI-04 | Carregando | Servidor retornar zero para filtros | Filtros válidos | Filtro sem resultado | Preserva filtros e oferece limpeza | Não confundir com ausência total de cadastro |
| UI-05 | Principal | Enviar formulário inválido | Validação local/servidor falhou sem mutação | Validação | Preserva somente valores autorizados no mesmo contexto; resumo e foco no primeiro erro | Não auditar como sucesso; campo proibido é descartado |
| UI-06 | Principal | Confirmar comando válido | Permissão, versão, contexto e confirmação aplicáveis | Processando | Desabilita repetição; mostra progresso textual | Gera/usa chave idempotente; nenhum segundo envio concorrente |
| UI-07 | Processando | Transação concluir | Negócio e auditoria obrigatória concluídos | Sucesso | Relê estado final; aplica revogações e mostra referência autorizada | Só anuncia sucesso após confirmação do servidor |
| UI-08 | Carregando | Falha técnica de leitura | Consulta não produziu mutação | Falha de leitura | Mensagem neutra com referência; preserva somente rascunho permitido | Não expõe stack, SQL, segredo, outro CNPJ ou resultado clínico; saída por UI-23 |
| UI-08A | Processando | Falha técnica de mutação com ausência confirmada | Reconciliação provou que nenhuma transação foi persistida | Falha de mutação com ausência confirmada | Mensagem neutra e nova tentativa explícita disponível | Resultado incerto usa UI-14, não esta linha; saída por UI-24 |
| UI-09 | Processando | Versão ficar obsoleta | Registro mudou desde a leitura | Conflito | Bloqueia sobrescrita; exige atualizar e revisar impacto | Auditar conflito quando previsto; nunca mesclar silenciosamente |
| UI-10 | Qualquer estado autenticado | Permissão ser negada ou revogada | Autorização atual insuficiente | Sem permissão | Limpa conteúdo restrito e inicia a localização da primeira área atualmente permitida | Sem nome, contagem, empresa ou existência do registro |
| UI-10A | Sem permissão | Concluir redirecionamento seguro | Sessão válida; primeira rota atualmente permitida localizada e revalidada | Carregando | Abre somente a área autorizada e não reutiliza conteúdo, filtro ou rascunho da rota recusada | Se nenhuma rota interna estiver permitida, remove o contexto empresarial e retorna ao ponto de seleção seguro governado pelo Bloco 02 |
| UI-11 | Qualquer estado autenticado | Sessão expirar ou ser revogada | Inatividade, limite absoluto ou evento de segurança | Sessão expirada | Limpa conteúdo e formulário; exige autenticação | Comando pendente não é reenviado após login |
| UI-12 | Principal ou Principal com alterações | Trocar empresa | Confirmação de descarte quando houver rascunho | Contexto inválido na aba antiga | Limpa empresa, competência, filtros, arquivos, prévias e dados sensíveis | Aba antiga não salva, confirma, exporta nem baixa |
| UI-13 | Qualquer | Abrir identificador de outro CNPJ | Relação empresarial não pertence à sessão | Sem permissão com resposta `não encontrado` | Nenhum conteúdo é carregado | Registrar tentativa conforme política sem revelar existência |
| UI-14 | Processando | Perder conexão após envio | Resultado ainda desconhecido | Processando em reconciliação | Consulta operação pela chave antes de permitir nova tentativa | Repetição só ocorre depois de provar ausência de conclusão |
| UI-15 | Principal com alterações | Sair, voltar ou trocar contexto | Existem alterações não salvas | Principal aguardando decisão de descarte | Modal oferece permanecer ou descartar; nada é salvo implicitamente | Confirmar outra entidade ou versão é bloqueado |
| UI-16 | Principal aguardando decisão de descarte | Permanecer | Sessão, contexto e autorização originais ainda válidos | Principal com alterações | Fecha o modal e preserva o rascunho somente no mesmo escopo | Se sessão/contexto/permissão mudou, o rascunho é limpo e a permanência é bloqueada |
| UI-17 | Principal aguardando decisão de descarte | Descartar e continuar | Confirmação explícita; comando de navegação original ainda válido | Destino original interno: `Carregando`; contexto removido/trocado: `Contexto inválido` | Descarta somente o rascunho e retoma a navegação solicitada | A condição do destino escolhe exatamente um ramo; não salva/confirma negócio; troca empresarial segue B02-CTX-07 |
| UI-18 | Processando em reconciliação | Encontrar transação concluída | Mesma chave, ator, escopo e intenção; resultado confirmado | Sucesso | Relê e mostra o estado persistido autorizado | Não repete o comando nem duplica efeito |
| UI-19 | Processando em reconciliação | Provar ausência de transação concluída | Consulta autoritativa encerrou sem resultado persistido | Falha de mutação com ausência confirmada | Explica que a ação não foi concluída e habilita UI-24 | Nunca repete automaticamente; nova tentativa usa chave/intenção válida conforme CON-03 |
| UI-20 | Vazio | Atualizar a coleção | Sessão, rota e contexto válidos | Carregando | Reconsulta a fonte autorizada | Não presume que o estado anterior continua vazio |
| UI-21 | Filtro sem resultado | Limpar ou alterar filtros | Filtros válidos | Carregando | Reexecuta a consulta com os novos critérios | Não altera dados de negócio |
| UI-22 | Validação | Corrigir campo | Mesmo formulário, sessão, empresa, entidade e autorização | Principal com alterações | Remove erros resolvidos e preserva somente valores autorizados | Novo envio volta a UI-06; troca de contexto limpa o rascunho |
| UI-23 | Falha de leitura | Tentar novamente | Sessão, contexto e rota revalidados | Carregando | Repete apenas a consulta | Não repete mutação ou arquivo por engano |
| UI-24 | Falha de mutação com ausência confirmada | Tentar novamente | Reconciliação provou que não houve commit; comando ainda permitido | Processando | Envia nova tentativa idempotente explícita | Se o resultado anterior permanecer incerto, UI-24 é bloqueada e volta a UI-14 |
| UI-25 | Conflito | Recarregar versão atual | Sessão, contexto, entidade e leitura autorizados | Carregando | Descarta a versão antiga e exige revisar impacto antes de novo envio | Nunca mescla nem sobrescreve silenciosamente |
| UI-26 | Sucesso | Concluir retorno visual | Estado persistido relido e mensagem acessível apresentada | Principal | Mantém referência autorizada e libera novas ações compatíveis | Não refaz a operação concluída |

## 23.3 Matriz de concorrência, idempotência e atomicidade

| ID | Estado inicial | Evento | Pré-condição/permissão | Estado final | Efeitos | Auditoria/bloqueio |
|---|---|---|---|---|---|---|
| CON-01 | Registro versão `n` | Salvar com versão `n` ainda atual | Permissão e validações atuais | Versão `n+1` | Grava mudança e auditoria juntas | Restrição de versão impede atualização perdida |
| CON-02 | Registro versão `n+1` | Salvar rascunho baseado em `n` | Versão enviada é antiga | Sem transição | Retorna conflito e dados mínimos para atualização | Nunca sobrescrever versão mais recente |
| CON-03 | Operação inexistente | Receber comando com chave nova | Escopo, ator, entidade e intenção correspondem à chave | Operação concluída uma vez | Persiste resultado consultável | Auditar operação normal |
| CON-04 | Operação já concluída | Repetir a mesma chave | Mesmo ator, escopo e intenção | Permanece concluída | Retorna o resultado anterior | Não duplicar exame, clínica, leitura, exportação, incidente ou entrada |
| CON-05 | Operação em andamento | Repetir a mesma chave | Processamento anterior ainda ativo | Permanece processando | Retorna andamento | Não iniciar segundo processamento |
| CON-06 | Entidade inexistente | Duas criações simultâneas com chave natural igual | Restrição única aplicável | Uma criada; outra bloqueada/associada | Mantém uma única entidade válida | Tratar CPF, CNPJ, versão vigente, referência ativa e chave de condição conforme domínio |
| CON-07 | Mutação preparada | Auditoria obrigatória falhar | Mesma transação | Sem transição | Reverte negócio, versão, notificação e arquivo relacionados | Retorna falha segura; não deixar sucesso sem trilha |
| CON-08 | Mutação preparada | Permissão ou contexto mudar antes do commit | Versão de autorização divergiu | Sem transição | Cancela comando e limpa modal/rascunho sensível | Auditar negação quando aplicável |
| CON-09 | Tarefa preparada | Executar rotina sem empresa exigida | Entidade empresarial sem `empresa_id` válido | Falhou com segurança | Nenhuma leitura ou alteração cruzada | Registrar erro técnico seguro |
| CON-10 | Lote preparado | Um item perder elegibilidade antes do commit | Regra do lote exige homogeneidade/atomicidade | Sem transição do lote | Cancela ou reconcilia conforme regra específica; nunca produz subconjunto silencioso quando proibido | Auditar bloqueio e itens inelegíveis sem vazar campos ocultos |

## 23.4 Regras transversais de segurança e experiência

- HTTPS é obrigatório em todo ambiente com dados reais;
- cookies de sessão usam `Secure`, `HttpOnly` e política `SameSite` apropriada;
- política de segurança de conteúdo e defesas contra injeção são obrigatórias;
- segredos ficam fora do código e do repositório, com credenciais e ambientes separados;
- logs técnicos não contêm CPF completo, remuneração detalhada, resultado clínico, senha, token, TOTP ou segredo;
- validação ocorre na interface, servidor e banco;
- ocultar botão não substitui autorização;
- campo oculto não chega ao navegador nem pode ser inferido por filtro, total, erro, histórico, notificação ou Excel;
- campo mascarado nunca chega integralmente ao navegador;
- respostas sensíveis e downloads usam política de cache adequada, incluindo `no-store`;
- operações de alteração usam proteção contra requisição forjada;
- texto livre é tratado como dado, nunca HTML ou comando;
- formulários não são persistidos em armazenamento local;
- rascunho só pode ser preservado durante a mesma sessão, empresa, entidade e autorização;
- foco, mensagens e estados não dependem apenas de cor;
- `Carregando` nunca exibe conteúdo residual;
- `Processando` bloqueia repetição;
- sessão expirada ou revogada limpa dado sensível imediatamente na próxima resposta/autorização;
- sem atualização em tempo real obrigatória; rotinas periódicas não renovam sessão.

## 23.5 Transições proibidas

- `Processando → Sucesso` antes de confirmação do servidor e auditoria obrigatória;
- reenviar automaticamente formulário depois de login;
- salvar aba da empresa anterior;
- reapresentar dado sensível depois de sessão, empresa ou permissão mudar;
- sobrescrever conflito de versão silenciosamente;
- repetir comando incerto sem reconciliar a primeira tentativa;
- concluir parcialmente operação definida como atômica;
- retornar detalhe técnico, segredo ou identificação de outro CNPJ em erro;
- usar atualização automática para prolongar sessão;
- manter download acessível depois de revogação de sessão, empresa ou permissão.

---

# 24. Rastreabilidade dos 18 blocos

| Bloco aprovado | Seção | Prefixos principais | Cobertura |
|---:|---:|---|---|
| 01 | 6 | B01-AUT | Login, primeiro acesso, senha, TOTP, recuperação e sessão. |
| 02 | 7 | B02-CTX, B02-EMP | Empresa, contexto, troca e modo histórico. |
| 03 | 8 | B03-USR, B03-MST, B03-PRF, B03-INC | Usuário, master, perfil, permissão por campo e autorização restrita de incidentes. |
| 04 | 9 | B04-VIN | Pessoa, vínculo empregado, admissão posterior e recontratação. |
| 05 | 10 | B05-MEI, B05-CON | Prestador, contrato, vigências, renovação e encerramento MEI. |
| 06 | 11 | B06-FIN, B06-RA, B06-REB, B06-CMP, B06-PSR | Condições financeiras, RA, reembolso, complementos e período sem registro. |
| 07 | 12 | K07 | Competência, D30, checklist, fechamento e reabertura. |
| 08 | 13 | G08 | Grupo financeiro e evento. |
| 09 | 14 | P09 | Líquido do contador, confirmação individual e lote F03. |
| 10 | 15 | C10, P10, N10 | F04, ajuste positivo e diferença absorvida. |
| 11 | 16 | R11, A11, L11 | Recibo, arquivo imutável e lote R03. |
| 12 | 17 | D12 | Desligamento, inativação, rescisão oficial e acerto de RA. |
| 13 | 18 | ASO | Acompanhamento, exame, versão, resultado, prazo e alerta. |
| 14 | 19 | CLI | Clínica global e snapshot empresarial. |
| 15 | 20 | NOT-O, NOT-L | Ocorrência de notificação e leitura individual. |
| 16 | 21 | EXP | Exportação privada, autorização no download e expiração. |
| 17 | 22 | INC | Incidente, linha do tempo, conclusão e reabertura. |
| 18 | 23 | UI, CON | Estados comuns, concorrência, repetição e atomicidade. |

Cada ID deve ser preservado no backlog, nos testes, na documentação de API e nos registros técnicos de erro. Uma regra não pode receber dois IDs diferentes apenas porque aparece em duas telas.

---

# 25. Contrato mínimo de testes

## 25.0 Rastreabilidade e gates objetivos

O catálogo de testes do desenvolvimento usará a chave `T-{ID DA REGRA}-{CENÁRIO}`. Toda transição mutável deve possuir ao menos um caso de sucesso e os casos transversais aplicáveis; toda regra de mapeamento `ASO-R*` deve possuir teste de cada entrada e saída. Uma dispensa só é válida quando registrada no catálogo com justificativa objetiva — nunca por ausência silenciosa do teste.

Considera-se mutável toda linha que cria, altera, versiona, confirma, paga, cancela, invalida, revoga, arquiva, resolve ou produz arquivo/ocorrência persistente. Linhas apenas de consulta ainda exigem testes de autorização, isolamento e ausência de efeito.

Antes da homologação e novamente antes da produção, o validador documental e a suíte precisam provar:

- 100% dos IDs ligados a pelo menos um caso e resultado esperado;
- zero ID duplicado, zero referência a ID inexistente e zero regra órfã;
- zero estado persistido fora do catálogo de seu eixo;
- todo resultado condicionado, independentemente da palavra `ou` ou da notação usada, possui um caso próprio para cada condição e exatamente um resultado esperado;
- o manifesto do Documento 18 classifica 100% dos estados; a partir dele, todo persistido não terminal possui entrada alcançável e saída legítima, e todo terminal possui consulta/correção quando aplicável;
- sucesso, bloqueio e correção cobertos para toda transição mutável;
- isolamento de empresa, autorização, concorrência e repetição cobertos sempre que aplicáveis;
- evidência automática ou roteiro assinado de homologação para cada caso obrigatório das seções 25.2 a 25.4.

## 25.1 Para cada transição mutável

Criar, quando aplicável, pelo menos estes casos:

1. sucesso com ator autorizado;
2. estado inicial inválido;
3. ação sem permissão;
4. campo oculto ou somente leitura;
5. entidade de outro CNPJ;
6. empresa ou contexto trocado;
7. sessão expirada ou revogada;
8. versão concorrente;
9. clique ou envio repetido com a mesma chave;
10. nova intenção legítima com nova chave;
11. falha da auditoria obrigatória;
12. resposta incerta seguida de reconciliação.

## 25.2 Casos financeiros obrigatórios

- D30 para todos os exemplos da seção 12.4;
- competência duplicada e competência de corte;
- início nos dias 15 e 16 para cada data controladora;
- líquido consistente e K06 inconsistente;
- confirmação individual e F03 `todos ou nenhum`;
- valor zero como `Não aplicável`, nunca como pago;
- mesma correção com ajuste positivo e diferença absorvida em verbas diferentes;
- adiantamento maior que o proporcional devido;
- desligamento antes, na data e depois da data prevista do adiantamento;
- oficial mensal já pago antes de demissão informada tardiamente;
- MEI com renovação contínua, interrupção e mudança de valor no meio da competência;
- falha do PDF depois de pagamento confirmado.

## 25.3 Casos de autorização e isolamento

- usuário comum em duas empresas com perfis diferentes;
- master sem perfil empresarial, mas obrigado a selecionar um CNPJ;
- master sem permissão de incidente;
- quatro estados de campo em tela, API, auditoria e Excel;
- permissão retirada enquanto uma aba ou arquivo permanece aberto;
- perfil arquivado ainda associado e migração posterior;
- duas operações concorrentes que tentariam deixar menos de dois masters aptos.

## 25.4 Casos de ASO, notificação e arquivo

- admissional único por vínculo e demissional único por desligamento formal;
- periódico novo versus retificação do mesmo exame;
- invalidação com necessidade ainda pendente e com cancelamento legítimo;
- transições de prazo para vencendo e vencido sem criar nova versão;
- mesma condição sem notificação diária duplicada;
- não comparecimento e reagendamento na mesma ocorrência demissional;
- versão atual invalidada presente no Excel e versões substituídas ausentes;
- arquivo pronto com sessão expirada, permissão retirada e prazo de 24 horas.

---

# 26. Pontos de revisão especialmente importantes

O usuário deve conferir toda a matriz, mas estes pontos merecem atenção especial porque transformam regras gerais em comportamento exato:

1. **D30:** o intervalo isolado e a partilha entre vigências contíguas têm regras complementares; a partilha atribui cada posição comercial uma única vez, inclusive no dia 31 e no fim de fevereiro; os resultados completos estão na seção 12.4;
2. **Admissão posterior:** a admissão pode ser salva com condição financeira pendente; somente o cálculo ou pagamento dependente fica bloqueado;
3. **Complemento recorrente:** pode permanecer indeterminado e, quando encerrado normalmente, continua integral até a última competência inclusiva;
4. **MEI:** contrato mensal usa adiantamento e final; o corte do primeiro ingresso pode encaminhar todo o proporcional ao final;
5. **Desligamento:** `Decisão necessária` é por grupo, e o oficial continua subordinado ao valor do contador;
6. **Correção:** diferenças positivas e negativas são apuradas por verba e podem coexistir sem compensação;
7. **TOTP:** recuperação normal e contingência com exatamente dois masters usam sessão restrita exclusivamente à A03;
8. **ASO:** invalidar um exame nunca deixa um estado sem catálogo; a necessidade volta a pendente ou termina como cancelada de forma justificada;
9. **Exportação:** expirar a sessão nega o download atual, mas não elimina o arquivo antes das 24 horas se a autorização continuar válida;
10. **Incidente:** consultar, acrescentar e concluir/reabrir possuem permissões cumulativas e escopo restrito próprio.

---

# 27. Itens pré-produção que permanecem fora da matriz

Continuam válidas as definições operacionais do item 32 do Documento 16, como hospedagem, provedor de e-mail, responsáveis nominais, competência real de corte, janela de implantação, retenção posterior a seis anos e eventual fornecedor da MF-01.

Elas não mudam estados funcionais, mas precisam estar resolvidas antes da entrada em produção.

---

# 28. Critérios de aprovação

O Documento 17 estará aprovado quando o usuário confirmar:

- os 18 blocos e suas transições;
- o algoritmo e os exemplos D30;
- estados derivados versus estados persistidos;
- pré-condições, permissões e transições proibidas;
- efeitos financeiros e documentais;
- isolamento multiempresa e permissões por campo;
- correção sem apagamento de histórico;
- regras de ASO, notificação, exportação e incidente;
- contrato mínimo de testes;
- os dez pontos destacados na seção 26.

Essa aprovação confirma a **regra funcional**. Ela não substitui o gate de desenvolvimento/homologação: antes da produção, as evidências da seção 25.0 devem atingir todos os limiares, sem exceção silenciosa.

**Situação atual:** matriz formal aprovada integralmente pelo usuário em 21/08/2026.  
**Próxima etapa autorizada:** elaborar o Documento 18 — Modelo Lógico de Dados, Relacionamentos e Restrições, usando os IDs desta matriz como rastreabilidade.
