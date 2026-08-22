# Documento 15

## Protótipos de Baixa Fidelidade — Lote 7

**Sistema:** Portal interno multiempresa de Departamento Pessoal  
**Lote:** 7 — notificações, auditoria, usuários, perfis, segurança e incidentes  
**Situação:** aprovado integralmente pelo usuário  
**Data:** 21/08/2026

**Artefato interativo:** `lote-7-notificacoes-administracao.html`, com seletores de tela, perfil, cenário e estado para revisar N01, H01–H03, U01–U05 e I01–I02.
**Telas:** N01, H01 a H03, U01 a U05 e I01 a I02

---

# 1. Objetivo

Este lote fecha os protótipos de baixa fidelidade da primeira versão do sistema. Ele transforma as regras já aprovadas de administração, autorização, rastreabilidade e resposta a incidentes em fluxos verificáveis para:

- consultar notificações internas da empresa ativa;
- abrir com segurança a entidade que originou cada pendência;
- consultar auditoria empresarial e global;
- preservar valores restritos conforme a permissão atual;
- cadastrar e administrar usuários exclusivamente pelo master;
- administrar perfis empresariais no contexto de uma única empresa;
- administrar perfis globais e modelos usados na criação de empresas;
- aplicar permissões por módulo, tela, ação e campo;
- preservar no mínimo dois masters ativos e aptos;
- registrar e acompanhar incidentes de segurança sem criar uma plataforma complexa de chamados;
- validar exportações de auditoria, revogações de acesso, concorrência e falhas seguras.

Este documento não altera os lotes anteriores. Quando uma tela leva a colaborador, competência, recibo, desligamento ou ASO, o destino já aprovado apenas é reaberto no contexto correto.

---

# 2. Fontes consolidadas

O lote consolida:

- Documento Mestre de Planejamento Funcional;
- Fluxos Integrados de Navegação e Telas;
- Dicionário de campos e regras já aprovado;
- regras de autenticação, TOTP e sessão do Lote 1;
- regras de histórico contextual dos Lotes 2 a 6;
- regra de fonte única e imutável de auditoria;
- regra de no mínimo dois masters ativos;
- retenção mínima geral de seis anos;
- registro simples de incidentes aprovado para a primeira versão;
- decisão de manter notificações operacionais somente dentro do sistema;
- melhoria futura `MF-01`, que não faz parte deste lote.

Referências externas usadas apenas como apoio de segurança e conformidade:

- Resolução CD/ANPD nº 15/2024 e orientações oficiais sobre comunicação de incidentes;
- NIST SP 800-63B-4 para princípios de sessão e reautenticação;
- controles de autorização, registro de eventos e proteção de segredos já adotados no planejamento.

---

# 3. Escopo do Lote 7

## 3.1 Incluído

- N01 — Central de notificações;
- H01 — Auditoria da empresa ativa;
- H02 — Auditoria global;
- H03 — Detalhe imutável do evento;
- U01 — Usuários;
- U02 — Detalhe e administração do usuário;
- U03 — Perfis empresariais da empresa selecionada;
- U04 — Matriz de permissões do perfil;
- U05 — Perfis globais e modelos iniciais;
- I01 — Central restrita e registro de incidente;
- I02 — Acompanhamento do incidente;
- sino resumido de notificações no cabeçalho;
- reautenticação para ações administrativas críticas;
- exportação de auditoria dentro de H01 ou H02;
- revogação imediata de sessões quando acesso ou segurança mudarem;
- estados vazios, carregamento, validação, processamento, conflito, sucesso e acesso negado;
- navegação e retorno ao contexto de origem;
- critérios de aceite e cenários de homologação.

## 3.2 Fora deste lote

- Portal do empregado ou do prestador;
- notificações operacionais externas por e-mail, WhatsApp, SMS ou push;
- agenda real de ASO e seus lembretes, registrada apenas como melhoria futura `MF-01`;
- comentários, atribuição, adiamento ou escalonamento de notificações;
- central separada de exportações;
- encerramento genérico e manual de sessões por outro usuário;
- exceções de permissão configuradas individualmente por usuário comum;
- integração com provedor de identidade externo;
- chaves físicas, biometria ou passkeys;
- comunicação automática de incidente à ANPD ou aos titulares;
- anexos, uploads ou cofre de evidências no módulo de incidentes;
- plataforma de chamados, SLA ou distribuição de tarefas;
- análise automática de severidade ou decisão jurídica;
- exclusão ou edição de auditoria e linha do tempo de incidente.

---

# 4. Mapa de telas e escopos

```text
Empresa ativa
├── Sino resumido
│   └── N01 — Central de notificações
│       └── Registro operacional de origem
├── Auditoria
│   ├── H01 — Auditoria da empresa
│   └── H03 — Detalhe do evento empresarial
└── Administração da empresa
    ├── U03 — Perfis empresariais
    └── U04 — Matriz de permissões

Escopo global
├── Administração de usuários
│   ├── U01 — Usuários
│   └── U02 — Detalhe do usuário
├── U05 — Perfis globais e modelos iniciais
├── H02 — Auditoria global
│   └── H03 — Detalhe do evento global
└── Incidentes
    ├── I01 — Central e registro
    └── I02 — Acompanhamento
```

Regras de escopo:

- N01, H01, U03 e U04 exigem exatamente uma empresa ativa;
- H02, U01, U02, U05, I01 e I02 usam faixa persistente `Escopo global`;
- H03 herda o escopo e o retorno de quem o abriu;
- tela global nunca reutiliza silenciosamente a empresa que estava selecionada;
- abrir entidade empresarial a partir de H02 exige escolher e revalidar a empresa correspondente;
- acesso global não concede acesso operacional conjunto aos três CNPJs.

---

# 5. Conceitos obrigatoriamente separados

## 5.1 Situação operacional da notificação

- Ativa;
- Resolvida.

A situação deriva exclusivamente da entidade de origem. O usuário não a edita em N01.

## 5.2 Estado de leitura

- Não lida;
- Lida.

A leitura pertence ao usuário. Marcar como lida não resolve a obrigação.

## 5.3 Escopo de auditoria

- Empresarial: exatamente a empresa ativa;
- Global: somente master, sem empresa operacional ativa;
- Contextual: filtro da mesma fonte, aberto a partir de uma entidade.

## 5.4 Perfil empresarial

Pertence a uma única empresa e governa dados empresariais. Nunca é editado numa matriz que combine CNPJs.

## 5.5 Perfil global

Concede somente funções globais delegáveis, como cadastrar empresa ou administrar clínicas. Não concede acesso operacional automático às empresas.

## 5.6 Papel master

É papel sistêmico, fora dos perfis. Administra usuários e permissões, possui acesso às empresas e à auditoria global e exige TOTP.

## 5.7 Incidente

É um registro restrito de resposta a evento de segurança. Não é chamado, tarefa, denúncia trabalhista ou ocorrência operacional comum.

## 5.8 Regras contra mistura

- leitura não altera situação operacional;
- notificação não replica dados da origem;
- histórico contextual não cria uma segunda auditoria;
- perfil global não substitui o empresarial;
- modelo inicial não continua vinculado ao perfil já copiado;
- bloquear usuário não é igual a inativá-lo;
- redefinir TOTP não revela o novo segredo ao executor;
- evidência preservada não significa upload de arquivo;
- avaliar comunicação externa não significa enviá-la automaticamente.

---

# 6. N01 — Central de notificações

## 6.1 Posição e acesso

- Item próprio `Notificações` no menu lateral;
- Sino no cabeçalho com visão compacta;
- Empresa ativa obrigatória;
- Permissão para visualizar notificações;
- Cada item também exige a permissão atual para conhecer a entidade de origem.

O contador, a prévia do sino, as abas, os filtros e a lista são calculados depois de aplicar empresa e permissões. Nenhum total pode revelar pendência de módulo oculto.

## 6.2 Abas

### Ativas

Exibe condições que continuam pendentes na origem.

### Resolvidas recentemente

Exibe condições resolvidas nos últimos 90 dias, respeitando a permissão atual.

## 6.3 Tipos

### Financeiras

- Líquido do contador pendente;
- Salário redondo pendente;
- Grupo de adiantamento pendente;
- Grupo de pagamento final pendente;
- Confirmação cancelada aguardando correção;
- Ajuste positivo pendente;
- Recibo substituto pendente.

### Desligamento

- Desligamento programado próximo;
- Rescisão oficial pendente;
- Acerto complementar pendente;
- ASO demissional pendente;
- Não comparecimento pendente de encerramento.

### ASO

- Vencimento em até 30 dias;
- Vencido.

### MEI

- Contrato terminando em 30 dias;
- Renovação ainda não decidida;
- Pagamento pendente.

## 6.4 Antecedências

- Pagamento: três dias corridos antes da data prevista e urgente na data;
- Desligamento programado: sete dias corridos antes;
- Encerramento MEI: 30 dias corridos antes;
- ASO: 30 dias corridos antes do vencimento;
- Sem calendário de feriados na primeira versão.

## 6.5 Agrupamento

- Financeiras podem ser agrupadas por tipo e competência;
- O grupo mostra quantidade autorizada, nunca quantidade bruta;
- Ao abrir, lista somente participantes autorizados;
- ASOs podem permanecer individualizados;
- Alteração de urgência atualiza a mesma notificação lógica;
- Uma condição ativa não cria nova notificação a cada dia.

## 6.6 Filtros

- Texto autorizado da origem;
- Tipo;
- Módulo;
- Urgência;
- Leitura;
- Período de referência;
- Aba ativa ou resolvida.

Filtro não oferece opção para módulo que o usuário não pode conhecer.

## 6.7 Colunas e cartões

- Estado de leitura;
- Tipo e módulo;
- Resumo mínimo;
- Competência ou data de referência;
- Urgência textual;
- Quantidade autorizada quando agrupada;
- Ação `Abrir origem`.

Não exibe salário, RA, resultado clínico, CPF, CNPJ ou qualquer valor que não seja necessário para reconhecer a pendência.

## 6.8 Ações

- Abrir origem;
- Marcar item como lido;
- Marcar itens visíveis como lidos;
- Alternar abas;
- Voltar da origem preservando aba, filtros, página e ordenação.

Não existem exclusão, comentário, atribuição, adiamento, escalonamento ou mensagem externa.

## 6.9 Segurança do destino

Ao clicar em `Abrir origem`, o servidor revalida:

- sessão;
- usuário;
- empresa ativa;
- permissão da central;
- permissão do módulo de origem;
- entidade e vínculo com a empresa;
- campos que poderão ser enviados ao destino.

Se o acesso foi retirado, o item desaparece, o contador é recalculado e o destino responde sem revelar a existência do registro.

## 6.10 Sino do cabeçalho

- Mostra somente a contagem autorizada da empresa ativa;
- Exibe no máximo uma prévia compacta;
- Oferece `Ver todas`;
- Atualização automática não renova a sessão;
- Troca de empresa limpa contagem e prévia anteriores.

---

# 7. H01 — Auditoria da empresa

## 7.1 Escopo

- Exatamente a empresa ativa;
- Permissão empresarial de auditoria;
- Nenhum seletor interno de empresa;
- Empresa identificada permanentemente no cabeçalho e nos resultados.

## 7.2 Filtros

- Data inicial e final obrigatórias;
- Usuário;
- Módulo;
- Entidade;
- Ação;
- Resultado;
- Identificador da entidade ou referência da operação.

## 7.3 Lista

- Data e hora;
- Usuário autorizado;
- Módulo;
- Entidade;
- Ação;
- Resultado;
- Identificador;
- Ação `Abrir evento`.

A lista não mostra automaticamente valores antes e depois.

## 7.4 Eventos

Inclui, conforme o escopo empresarial:

- pessoas e vínculos;
- condições financeiras;
- competências e reaberturas;
- cálculos sobrescritos;
- pagamentos e cancelamentos;
- ajustes;
- desligamentos;
- ASOs, retificações e leitura sensível;
- recibos e downloads;
- exportações;
- tentativas negadas no contexto da empresa.

## 7.5 Exportação

- Fica dentro de H01;
- Usa o mesmo período e os mesmos filtros;
- Contém somente a empresa ativa;
- Omite ou mascara campos conforme a permissão atual;
- Pode ficar em processamento quando extensa;
- O andamento e o download aparecem somente em H01 para o solicitante;
- Arquivo expira em 24 horas;
- Download revalida sessão, solicitante, empresa e permissões de auditoria e campo;
- Exportação vazia é recusada.

---

# 8. H02 — Auditoria global

## 8.1 Acesso

- Somente master autenticado;
- TOTP já concluído na sessão;
- Escopo global explícito;
- Não depende de perfil empresarial;
- Não exige nem mistura uma empresa operacional ativa.

## 8.2 Conteúdo adicional

- Login, falhas relevantes e bloqueios;
- Recuperação de senha;
- Configuração e redefinição de TOTP;
- Revogação de sessões;
- Criação, bloqueio e inativação de usuários;
- Promoção e rebaixamento de master;
- Associações com empresas;
- Perfis empresariais e globais;
- Empresas e clínicas;
- Tentativas negadas entre empresas;
- incidentes;
- restaurações relevantes;
- eventos empresariais quando pesquisados pelo master.

## 8.3 Filtros adicionais

- Escopo global ou empresarial;
- Empresa, quando aplicável;
- Tipo de evento de segurança;
- Usuário afetado;
- Usuário executor;
- Referência de incidente.

## 8.4 Dados protegidos

Nunca aparecem:

- senha ou hash;
- senha temporária;
- token de recuperação;
- segredo TOTP;
- código TOTP;
- códigos de recuperação;
- cookie ou segredo de sessão;
- credencial de provedor;
- conteúdo técnico desnecessário.

IP e identificação básica de navegador, quando guardados, aparecem somente em área protegida de H03 e nunca como informação principal da lista.

## 8.5 Exportação global

- Arquivo próprio de H02;
- Somente master solicitante;
- Não depende de empresa ativa;
- Respeita filtros e período;
- Nunca inclui segredos;
- Pode ser processada em segundo plano;
- Download revalida master, sessão, TOTP válido e permissão global;
- Arquivo privado expira em 24 horas.

---

# 9. H03 — Detalhe imutável do evento

## 9.1 Aberturas possíveis

- H01;
- H02;
- histórico contextual do empregado;
- histórico contextual do MEI;
- competência, recibo, ASO, clínica ou incidente.

H03 preserva a origem e sempre oferece retorno ao contexto que a abriu.

## 9.2 Conteúdo

- Escopo global ou empresarial;
- Empresa quando aplicável;
- Data e hora;
- Usuário executor;
- Usuário ou entidade afetada, quando aplicável;
- Módulo;
- Entidade e identificador;
- Ação;
- Resultado;
- Campos alterados;
- Versão;
- Justificativa;
- Referência da operação;
- evento anterior ou relacionado, quando existir.

## 9.3 Antes e depois

Para revelar valores, o usuário precisa simultaneamente:

- acesso ao evento;
- permissão de histórico ou auditoria;
- permissão atual para visualizar o campo.

Comportamento por campo:

- Oculto: apenas `campo restrito alterado`;
- Mascarado: antes e depois mascarados;
- Visível sem edição: valores autorizados;
- Visível com edição: valores autorizados.

Campo proibido é removido antes da resposta do servidor; não fica apenas escondido por CSS.

## 9.4 Somente leitura

- Nenhum campo pode ser alterado;
- Nenhum evento pode ser excluído;
- Correção da entidade gera novo evento relacionado;
- Falha ao gravar auditoria obrigatória reverte a operação de negócio;
- Abrir evento não concede automaticamente acesso à entidade operacional.

---

# 10. U01 — Usuários

## 10.1 Acesso

- Exclusivo de master;
- Escopo global;
- Sem filtro de empresa operacional;
- Sem autocadastro.

## 10.2 Filtros

- Nome ou e-mail;
- Situação;
- Master ou comum;
- Estado do primeiro acesso;
- Empresa associada;
- Perfil empresarial;
- Perfil global.

## 10.3 Colunas

- Nome;
- E-mail;
- Situação global;
- Papel master;
- Primeiro acesso;
- Quantidade de empresas autorizadas;
- Perfil global;
- Última alteração administrativa;
- Ação `Abrir usuário`.

## 10.4 Ações

- Convidar usuário;
- Abrir;
- Bloquear;
- Desbloquear;
- Inativar.

Não existe exclusão física. Não existe ação administrativa genérica `Encerrar sessões`; as sessões são revogadas automaticamente pelas ações de segurança aprovadas.

## 10.5 Convite e primeiro acesso

- Master informa nome e e-mail;
- E-mail é único globalmente, sem diferença entre maiúsculas e minúsculas;
- Usuário comum recebe empresas e exatamente um perfil em cada uma;
- Perfil global é opcional;
- Master não recebe perfil empresarial obrigatório;
- Acesso temporário expira em 24 horas;
- Troca de senha é obrigatória;
- Master configura TOTP antes de chegar ao seletor;
- Operação repetida não cria convite ou usuário duplicado.

## 10.6 Situações

### Ativo

Pode autenticar quando os demais requisitos estiverem concluídos.

### Bloqueado

Não pode autenticar; bloqueio pode ser revertido. Todas as sessões vigentes são revogadas.

### Inativo

Não pode autenticar; registro e histórico permanecem. Reativação deve usar fluxo administrativo explícito.

## 10.7 Regra de contingência master

Bloquear, inativar ou rebaixar master é recusado transacionalmente quando o resultado deixaria menos de dois masters ativos e aptos.

O cálculo considera o estado confirmado no banco e continua seguro diante de duas operações simultâneas.

---

# 11. U02 — Detalhe do usuário

## 11.1 Blocos

### Identidade

- Nome;
- E-mail;
- Situação;
- Papel master;
- Data de criação;
- Primeiro acesso.

### Segurança

- Senha definitiva configurada ou pendente;
- TOTP aplicável, configurado ou pendente;
- Bloqueio temporário de login, quando existir;
- Última revogação automática de sessões;
- Ação de redefinir TOTP de outro master.

### Empresas e perfis

- Empresas associadas;
- Exatamente um perfil por empresa para usuário comum;
- Perfil global opcional;
- Master identificado como independente de perfil empresarial.

### Histórico administrativo

- Filtro contextual da auditoria única;
- Sem segredos;
- Antes e depois sujeitos à permissão.

## 11.2 Alterações

- Nome e e-mail podem ser administrados pelo master;
- Associação com empresa pode ser incluída ou removida;
- Perfil empresarial pode ser substituído;
- Perfil global pode ser atribuído ou retirado;
- Promoção ou rebaixamento de master exige fluxo crítico;
- Mudança passa a valer imediatamente;
- Sessões afetadas são revogadas automaticamente.

## 11.3 Promoção para master

- Exige resumo do impacto;
- Exige reautenticação do executor;
- Exige justificativa;
- O usuário promovido configura TOTP antes do acesso master completo;
- A promoção só conta para contingência depois que o usuário estiver apto.

## 11.4 Rebaixamento de master

- Exige reautenticação do executor;
- Exige justificativa;
- Revalida o mínimo de dois masters aptos dentro da mesma transação;
- Exige configurar empresas e perfis que o usuário comum conservará;
- Revoga todas as sessões do afetado.

## 11.5 Redefinição de TOTP de outro master

- Executor reautentica a própria conta;
- Justificativa obrigatória;
- Sessões do usuário afetado são encerradas;
- Segredo anterior é invalidado;
- Afetado configura novo segredo no próximo acesso;
- Executor nunca visualiza o novo segredo ou os novos códigos de recuperação;
- Evento é auditado sem segredos.

---

# 12. U03 — Perfis empresariais

## 12.1 Escopo

- Exclusivo de master;
- Exatamente a empresa selecionada;
- Cabeçalho persistente com razão social e CNPJ;
- Perfil é buscado pelo `empresa_id` da sessão, nunca apenas pelo identificador recebido da tela.

## 12.2 Lista

- Nome do perfil;
- Situação ativa ou arquivada;
- Quantidade de usuários;
- Versão;
- Última alteração;
- Ação `Abrir matriz`;
- Ação `Consultar impacto`.

## 12.3 Ações

- Criar;
- Duplicar;
- Abrir;
- Arquivar;
- Consultar usuários afetados.

Perfil atribuído não é excluído. Arquivamento impede novas atribuições, mas preserva usuários já relacionados até que sejam migrados de forma explícita.

## 12.4 Mudança de empresa

- Sair com edição não salva exige confirmação;
- Trocar empresa limpa lista, matriz e rascunho;
- Aba antiga não pode salvar depois da troca;
- Perfil de outra empresa responde como não encontrado.

---

# 13. U04 — Matriz de permissões

## 13.1 Organização

```text
Módulo
└── Tela
    ├── Ações
    └── Campos
```

A matriz usa grupos recolhíveis e pesquisa por nome, mas não mistura empresas.

## 13.2 Ações

Exemplos independentes:

- Visualizar;
- Criar;
- Editar;
- Inativar;
- Calcular;
- Confirmar pagamento;
- Cancelar confirmação;
- Marcar não aplicável;
- Sobrescrever cálculo;
- Reabrir competência;
- Retificar;
- Exportar;
- Baixar documento;
- Consultar histórico.

## 13.3 Estados de campo

- Oculto;
- Mascarado;
- Visível sem edição;
- Visível e editável.

Os estados valem conjuntamente para API, formulário, lista, filtro, total derivado, exportação e auditoria.

## 13.4 Dependências

- Editar exige visualizar;
- Campo editável exige ação de editar;
- Exportar exige visualizar cada campo exportado;
- Baixar exige acesso ao documento;
- Cancelar pagamento não é concedido com confirmar;
- Sobrescrever exige cálculo e memória;
- Retificar ASO exige acesso ao registro vigente;
- Criar exige campos obrigatórios editáveis;
- Campo oculto não aparece em filtro, total, mensagem, histórico ou Excel;
- Campo mascarado é mascarado antes da resposta;
- Total derivado é omitido quando permitir inferir valor restrito;
- Novos módulos, telas, ações e campos entram negados por padrão.

## 13.5 Salvamento

- A matriz é salva de forma atômica;
- Dependência incoerente bloqueia;
- Mostra resumo do que será concedido e retirado;
- Mostra quantos usuários serão afetados;
- Mudança crítica exige justificativa;
- Revalida empresa, perfil e versão;
- Cria nova versão e auditoria;
- Passa a valer imediatamente;
- Sessões afetadas são revogadas;
- Falha de auditoria reverte toda a mudança.

## 13.6 Conflito

Se outro master salvar primeiro:

- a versão antiga é recusada;
- nada é sobrescrito;
- a tela mostra o perfil vigente;
- o master deve revisar novamente o impacto.

---

# 14. U05 — Perfis globais e modelos iniciais

## 14.1 Escopo

- Global;
- Exclusivo de master;
- Sem empresa operacional selecionada.

## 14.2 Abas

### Perfis globais

Concedem funções compartilhadas limitadas, por exemplo:

- cadastrar empresa;
- cadastrar ou editar clínicas;
- exportar clínicas;
- função restrita de incidentes, quando aprovada.

Não concedem acesso automático a colaboradores, pagamentos ou ASOs de todas as empresas.

### Modelos empresariais iniciais

- Usados somente para copiar um perfil na criação de nova empresa;
- Alterar modelo não modifica perfis já copiados;
- Cada cópia recebe identidade e versão próprias na empresa.

## 14.3 Ações

- Criar;
- Duplicar;
- Abrir;
- Editar;
- Arquivar;
- Consultar onde é usado.

Item em uso não é excluído. Mudança crítica exige justificativa, versão e auditoria.

---

# 15. I01 — Central e registro de incidente

## 15.1 Acesso

- Escopo global restrito;
- Somente responsáveis autorizados;
- Responsáveis nominais serão definidos antes da produção;
- Usuário sem essa função não vê menu, contador ou existência de incidentes.

Permissões propostas separadamente:

- Registrar incidente;
- Consultar incidentes;
- Acrescentar acompanhamento;
- Concluir ou reabrir incidente.

Quem pode somente registrar não recebe automaticamente acesso à lista ou aos incidentes já existentes.

## 15.2 Dupla função da tela

Para não criar uma tela adicional, I01 possui:

- Lista mínima de incidentes que o responsável pode acompanhar;
- Ação `Registrar incidente`;
- Filtros de situação, período e identificador;
- Ação `Abrir acompanhamento`, com destino I02.

## 15.3 Campos do registro

| Campo | Obrigatório | Regra |
|---|---:|---|
| Data e hora percebida | Sim | Momento em que o evento foi percebido. |
| Data e hora do conhecimento pelo controlador | Sim | Necessária para acompanhar prazos externos. |
| Descrição objetiva | Sim | Fatos conhecidos, sem especulação desnecessária. |
| Possível alcance em empresas | Sim | Uma, várias, desconhecido ou não aplicável. |
| Possível alcance em usuários | Sim | Conhecido, estimado, desconhecido ou não aplicável. |
| Possível alcance em dados | Sim | Categorias gerais, sem copiar dados pessoais para o texto. |
| Contenção inicial | Não | Pode ser informada na criação ou acrescentada depois em I02. |
| Evidências preservadas | Não | Confirmação e referência de localização, sem upload; pode ser acrescentada em I02. |
| Registrador | Automático | Usuário autenticado. |
| Data do registro | Automática | Servidor. |
| Identificador | Automático | Único e não reutilizado. |

## 15.4 Conteúdo proibido

- Senha, token ou segredo;
- Cópia integral de base vazada;
- CPF completo em texto livre;
- Resultado clínico;
- Arquivo ou anexo;
- Chave técnica privada;
- Diagnóstico jurídico automático.

## 15.5 Confirmação

Antes de registrar, mostrar:

- identificador provisório;
- data percebida e data de conhecimento;
- alcance informado;
- contenção e referência de evidência, quando já informadas;
- aviso de que o evento será imutável e corrigido apenas por nova entrada.

Duplo clique ou repetição após falha não cria dois incidentes.

---

# 16. I02 — Acompanhamento do incidente

## 16.1 Cabeçalho

- Identificador;
- Situação;
- Data e hora percebida;
- Data e hora de conhecimento;
- Registrador;
- Última atualização;
- Escopo confirmado ou ainda em análise.

## 16.2 Situações propostas

- Aberto;
- Em tratamento;
- Concluído.

As etapas de contenção, análise, correção, restauração e monitoramento permanecem na linha do tempo. Assim, o módulo continua simples e a situação não vira um campo livre sem evidência.

## 16.3 Linha do tempo

Categorias:

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
- Melhoria.

Cada entrada contém autor, data do servidor, categoria, descrição objetiva e referências. Não pode ser editada ou excluída; correção cria nova entrada relacionada.

## 16.4 Escopo confirmado

- Empresas afetadas;
- Categorias de titulares;
- Categorias de dados;
- Quantidade conhecida ou estimada;
- Período do evento;
- Sistemas afetados;
- Estado de confirmação.

O acesso a essa informação permanece restrito ao grupo de resposta. Ela não amplia a permissão operacional do responsável sobre cada empresa.

## 16.5 Avaliação jurídica e comunicações

O sistema registra, sem decidir:

- responsável pela avaliação;
- data da avaliação;
- conclusão objetiva;
- necessidade ou não de comunicação;
- justificativa;
- data limite calculada ou informada;
- data efetiva de comunicação;
- protocolo ou referência externa;
- complementação posterior, quando aplicável.

Nenhuma comunicação é enviada automaticamente. A decisão e o envio permanecem sob responsabilidade dos responsáveis nominais e do jurídico/LGPD.

## 16.6 Conclusão

Para concluir, exigir:

- alcance final ou justificativa de desconhecido;
- contenção registrada;
- correção ou decisão documentada;
- avaliação jurídica/LGPD;
- situação das comunicações aplicáveis;
- conclusão objetiva;
- melhorias ou justificativa de nenhuma melhoria adicional.

Reabrir incidente concluído exige permissão, justificativa e nova entrada na linha do tempo.

## 16.7 Retenção

- Segue retenção mínima aprovada de seis anos;
- Não há exclusão automática na primeira versão;
- A linha do tempo e a auditoria relacionada permanecem preservadas;
- Referências externas podem apontar para evidências guardadas segundo o plano da empresa, mas o sistema não armazena o arquivo.

---

# 17. Perfis simulados no protótipo

## 17.1 Master completo

- N01, H01, H02, H03;
- U01 a U05;
- I01 e I02;
- Todos os campos autorizados, exceto segredos que nunca existem na resposta.

## 17.2 Auditor empresarial

- N01;
- H01 e H03 da empresa ativa;
- Sem H02 ou administração;
- Valores antes/depois dependem da permissão atual do campo.

## 17.3 DP operacional

- N01;
- Somente notificações e destinos operacionais permitidos;
- Sem auditoria geral, usuários, perfis ou incidentes.

## 17.4 Responsável por incidentes

- I01 e I02;
- Sem administração de usuário ou auditoria global completa;
- Visualiza somente o conteúdo restrito necessário à resposta.

## 17.5 Sem acesso

- Nenhuma tela do lote;
- Menu, sino, contagem e rotas não revelam conteúdo.

---

# 18. Reautenticação e confirmações críticas

Exigem reautenticação do executor e resumo humano do impacto:

- promover ou rebaixar master;
- bloquear ou inativar master;
- redefinir TOTP de outro master;
- alterar associação empresarial ou perfil com perda imediata de acesso;
- salvar mudança crítica em perfil utilizado;
- reabrir incidente concluído;
- exportar auditoria global extensa, se a sessão não tiver reautenticação recente.

Regras:

- Master informa a própria senha atual;
- Master informa o próprio TOTP quando aplicável;
- A confirmação fica vinculada à ação, entidade, versão e resumo exibido;
- Alteração no contexto invalida a confirmação;
- Falha não revela qual fator estava correto;
- Reautenticação não cria nova sessão longa nem ignora o limite máximo existente.

---

# 19. Revogação de sessões

Revogam imediatamente todas as sessões afetadas:

- Bloqueio;
- Inativação;
- Troca ou recuperação de senha;
- Redefinição de TOTP;
- Promoção ou rebaixamento de master;
- Retirada de empresa;
- Troca de perfil empresarial;
- Retirada ou redução de perfil global;
- Arquivamento ou alteração de perfil que retire acesso.

Não existe ação genérica administrativa para encerrar sessões sem uma causa aprovada. Minha Conta continua permitindo ao próprio usuário encerrar as demais sessões.

A revogação é efetiva no servidor. Aba já aberta perde acesso, limpa conteúdo e não conclui formulário pendente.

---

# 20. Exportação de auditoria

## 20.1 Estados

- Não solicitada;
- Preparando;
- Em processamento;
- Pronta;
- Falhou;
- Expirada.

## 20.2 Regras

- Fica na tela H01 ou H02;
- Não gera notificação em N01;
- Somente o solicitante vê o andamento e baixa;
- Arquivo privado expira em 24 horas;
- Filtros e período ficam no snapshot do pedido;
- Campo oculto é omitido;
- Campo mascarado permanece mascarado;
- Texto iniciado por `=`, `+`, `-` ou `@` é neutralizado;
- Download revalida sessão, escopo, solicitante e permissões atuais;
- Permissão retirada depois da geração impede download e descarta o arquivo quando necessário;
- Pedido, conclusão, falha, expiração e download são auditados;
- Arquivo vazio não é gerado.

---

# 21. Multiempresa e acesso global

## 21.1 Telas empresariais

- Empresa vem da sessão;
- Requisição não escolhe empresa livremente;
- Todas as tabelas empresariais carregam `empresa_id`;
- Row-Level Security atua como segunda barreira;
- Filtros, totais, notificações e exportações usam o mesmo escopo;
- Identificador de outro CNPJ responde como não encontrado.

## 21.2 Telas globais

- Faixa persistente `Escopo global`;
- Acesso independente do CNPJ anteriormente selecionado;
- Master ou função global específica;
- Abrir entidade empresarial exige seleção explícita e nova autorização;
- Nenhuma tabela global agrega valores financeiros operacionais dos CNPJs.

## 21.3 Troca de contexto

- Limpa filtros, resultados, rascunhos e valores sensíveis;
- Invalida modal e exportação do escopo anterior;
- Não renova a sessão;
- Solicita confirmação quando houver alteração não salva.

---

# 22. Auditoria da própria administração

Eventos obrigatórios:

- convite e criação de usuário;
- bloqueio, desbloqueio, inativação e reativação;
- alteração de nome ou e-mail;
- promoção e rebaixamento de master;
- redefinição de TOTP;
- associação ou retirada de empresa;
- atribuição ou troca de perfil;
- alteração de perfil global;
- criação, duplicação, alteração e arquivamento de perfil;
- visualização de antes/depois sensível em auditoria;
- exportação e download de auditoria;
- tentativa negada ou conflito;
- registro, atualização, conclusão e reabertura de incidente;
- comunicação externa registrada no incidente;
- restauração relevante.

Segredos nunca entram no evento. A auditoria da alteração é atômica com a própria alteração.

---

# 23. Concorrência, repetição e falhas

## 23.1 Versão

- U02, U04, U05 e I02 carregam versão;
- Salvamento antigo é bloqueado;
- Confirmação crítica revalida a versão imediatamente antes da transação;
- Nada é sobrescrito silenciosamente.

## 23.2 Idempotência

Obrigatória para:

- convidar usuário;
- bloquear, inativar ou promover;
- redefinir TOTP;
- salvar perfil;
- marcar notificações como lidas;
- solicitar exportação;
- registrar incidente;
- acrescentar entrada ao incidente;
- concluir ou reabrir incidente.

## 23.3 Operação atômica

- Alteração, revogação e auditoria concluem juntas;
- Regra de dois masters é conferida na mesma transação;
- Duas operações concorrentes não deixam menos de dois masters aptos;
- Falha de auditoria reverte a ação administrativa;
- Perda de conexão consulta o resultado antes de oferecer nova tentativa.

---

# 24. Estados gerais das telas

Todas as telas aplicáveis possuem:

## 24.1 Carregando

- Estrutura neutra;
- Sem dados de outro contexto;
- Sem ação crítica habilitada.

## 24.2 Vazio

- Mensagem específica;
- Ação útil quando autorizada;
- Não confirma existência em outro escopo.

## 24.3 Validação

- Resumo de erros;
- Erro próximo ao campo;
- Foco no primeiro campo inválido;
- Rascunho preservado apenas na sessão e no mesmo contexto.

## 24.4 Processando

- Ação repetida bloqueada;
- Progresso textual;
- Nenhuma duplicidade.

## 24.5 Conflito

- Versão recente não é sobrescrita;
- Usuário atualiza e revisa o impacto novamente.

## 24.6 Sucesso

- Estado final relido do servidor;
- Revogações já aplicadas;
- Referência da auditoria disponível quando autorizada.

## 24.7 Acesso negado

- Mensagem neutra;
- Sem nome, contagem, e-mail, empresa ou existência de registro restrito;
- Ação para voltar à primeira área permitida.

## 24.8 Sessão expirada

- Conteúdo limpo;
- Formulário não é reenviado após login;
- Nova autenticação obrigatória.

---

# 25. Desempenho e volume

- Listas paginadas;
- Notificações calculadas por empresa, usuário, condição e permissão;
- Índices por empresa, situação, data e origem;
- Auditoria sempre exige período;
- Filtros comuns respondem dentro das metas de até dois segundos;
- Lista inicial de auditoria usa período recente por padrão;
- Exportação operacional comum pode ser direta;
- Somente auditoria extensa fica em segundo plano;
- Sem atualização em tempo real;
- Sino pode atualizar em intervalo simples sem renovar sessão;
- Histórico de seis anos não é carregado de uma vez.

---

# 26. Acessibilidade e clareza

- Menu, sino, filtros, abas, tabelas e modais acessíveis por teclado;
- Foco visível;
- Estado expresso por texto e não somente cor;
- Cabeçalhos claros e tabelas contidas em telas estreitas;
- Erro associado ao campo;
- Modal com título, entidade, escopo, impacto e ação;
- Leituras dinâmicas importantes em região anunciada;
- Valores e datas no padrão brasileiro;
- Linguagem direta para usuários não técnicos;
- Matriz de permissão agrupada por módulo e tela;
- Perfil de campo usa os quatro rótulos completos, sem códigos isolados;
- Faixa `Escopo global` ou identificação da empresa permanece visível.

---

# 27. Cenários obrigatórios de homologação

## 27.1 Notificações

- [ ] Contador e lista mostram somente empresa e itens autorizados;
- [ ] Usuário sem acesso à origem não recebe item nem contagem;
- [ ] Marcar como lida não resolve a origem;
- [ ] Resolver a origem move a mesma notificação para resolvidas;
- [ ] Mudança de urgência não duplica a notificação;
- [ ] Marcar visíveis afeta somente IDs autorizados da página filtrada;
- [ ] Abrir origem revalida permissão e preserva retorno;
- [ ] Troca de empresa limpa o sino e a central;
- [ ] Resolvida permanece 90 dias;
- [ ] Exportação não gera notificação.

## 27.2 Auditoria

- [ ] H01 nunca mistura empresas;
- [ ] H02 é exclusivamente global e master;
- [ ] Período é obrigatório;
- [ ] H03 volta ao contexto de origem;
- [ ] Campo oculto não chega ao navegador;
- [ ] Campo mascarado continua mascarado;
- [ ] Segredos nunca aparecem;
- [ ] Evento não pode ser editado ou apagado;
- [ ] Falha de auditoria reverte o negócio;
- [ ] Exportação vazia é recusada;
- [ ] Download após perda de permissão é negado.

## 27.3 Usuários e masters

- [ ] E-mail é único sem diferença de maiúsculas;
- [ ] Convite repetido não duplica usuário;
- [ ] Usuário comum possui um perfil por empresa;
- [ ] Perfil global não substitui perfil empresarial;
- [ ] Master novo configura TOTP;
- [ ] Bloqueio e inativação revogam sessões;
- [ ] Troca de empresa ou perfil revoga sessões afetadas;
- [ ] Executor não vê segredo de TOTP redefinido;
- [ ] Rebaixamento preserva ao menos dois masters aptos;
- [ ] Duas alterações simultâneas preservam a contingência;
- [ ] Usuário sem permissão não descobre a existência da administração.

## 27.4 Perfis

- [ ] U03 e U04 usam exatamente a empresa ativa;
- [ ] Perfil de outro CNPJ responde como não encontrado;
- [ ] Os quatro estados valem em API, tela, Excel e auditoria;
- [ ] Dependência incoerente bloqueia salvamento;
- [ ] Impacto mostra usuários afetados;
- [ ] Mudança crítica exige justificativa;
- [ ] Salvamento cria versão e auditoria;
- [ ] Alteração vale imediatamente;
- [ ] Conflito não sobrescreve;
- [ ] Modelo alterado não muda perfil já copiado;
- [ ] Perfil usado é arquivado, não excluído.

## 27.5 Incidentes

- [ ] Somente responsáveis autorizados acessam I01 e I02;
- [ ] Registro contém data percebida e data de conhecimento;
- [ ] Duplo envio não cria dois incidentes;
- [ ] Não existe upload;
- [ ] Linha do tempo é somente de acréscimo;
- [ ] Correção cria nova entrada;
- [ ] Escopo confirmado não concede acesso operacional às empresas;
- [ ] Avaliação jurídica é registrada sem decisão automática;
- [ ] Comunicação externa não é enviada pelo sistema;
- [ ] Conclusão exige checklist;
- [ ] Reabertura exige justificativa;
- [ ] Retenção segue seis anos.

## 27.6 Sessão, falhas e acessibilidade

- [ ] Sessão avisa aos 25 minutos, expira aos 30 e termina em oito horas;
- [ ] Reautenticação não amplia indefinidamente a sessão;
- [ ] Aba antiga perde acesso depois de revogação;
- [ ] Modal não confirma entidade diferente da exibida;
- [ ] Clique repetido não duplica operação;
- [ ] Navegação completa por teclado;
- [ ] Foco chega ao primeiro erro;
- [ ] Telas funcionam em 736, 360 e 320 pixels;
- [ ] Estado não depende somente de cor;
- [ ] Falha técnica não expõe detalhes internos.

---

# 28. Propostas novas para aprovação

Este lote pede aprovação explícita para os seguintes refinamentos:

1. **Ordenação de N01:** urgentes e vencidas primeiro; depois data mais próxima, não lidas e data de criação, sem misturar tipos não autorizados;
2. **Marcar visíveis como lidas:** afetar somente os itens autorizados da página e dos filtros atuais, nunca todos os resultados ocultos ou ainda não carregados;
3. **Período da auditoria:** abrir H01 e H02 com os últimos 30 dias e limitar cada pesquisa interativa a 366 dias; períodos maiores continuam acessíveis por consultas consecutivas e exportações controladas;
4. **Leitura sensível em H03:** auditar quando antes/depois autorizados contiverem dado financeiro, dado de saúde, CPF completo, IP ou informação de segurança protegida;
5. **Master apto:** contar para o mínimo de dois somente quem estiver ativo, não bloqueado, com primeiro acesso concluído, senha definitiva válida e TOTP configurado;
6. **Reautenticação administrativa:** exigir senha atual e TOTP do executor para promoção, rebaixamento, bloqueio ou inativação de master e redefinição de TOTP de outro master;
7. **Matriz atômica:** U04 não salva permissão parcialmente; todas as dependências, versão, auditoria e revogações concluem juntas ou nenhuma mudança ocorre;
8. **I01 como central mínima:** reunir lista restrita e ação `Registrar incidente` na mesma tela, permitindo reabrir I02 sem criar uma nova tela;
9. **Estados simples do incidente:** usar somente `Aberto`, `Em tratamento` e `Concluído`; as etapas detalhadas permanecem na linha do tempo;
10. **Evidências sem upload:** armazenar somente confirmação e referência da localização segura da evidência;
11. **Linha do tempo imutável:** correção de informação de incidente cria nova entrada relacionada, sem editar a anterior;
12. **Datas regulatórias:** registrar separadamente percepção, conhecimento pelo controlador, decisão de comunicar, prazo aplicável e data efetiva;
13. **Comunicação externa manual:** o sistema registra decisão, protocolo e datas, mas não envia automaticamente comunicação à ANPD ou aos titulares;
14. **Download com permissão atual:** arquivo de auditoria já gerado deixa de ser baixável se sessão, escopo ou permissões tiverem mudado;
15. **Reabertura do incidente:** incidente concluído só pode ser reaberto com permissão, justificativa e nova entrada auditada;
16. **Permissões separadas de incidente:** separar registrar, consultar, acompanhar e concluir/reabrir, para que comunicar uma suspeita não revele os demais incidentes;
17. **Nova ocorrência de notificação:** se uma condição resolvida voltar a ocorrer, preservar a ocorrência anterior e criar uma nova notificação não lida;
18. **Escalada de urgência:** quando uma notificação lida passar a urgente, voltar a `Não lida` para o usuário;
19. **Contador do sino:** contar somente notificações simultaneamente ativas, não lidas e autorizadas;
20. **Primeiro acesso vencido:** permitir `Reenviar primeiro acesso`, invalidando a credencial anterior e auditando a nova emissão;
21. **Perfil arquivado em uso:** impedir novas atribuições e preservar temporariamente as atuais até migração explícita, sempre mostrando o impacto;
22. **Resultados da auditoria:** usar catálogo mínimo `Sucesso`, `Negado` e `Falha`, com `Cancelado` quando a própria regra de negócio cancelar a operação antes de alterar dados.

---

# 29. Pontos para revisão do usuário

Revisar especialmente:

1. A separação entre escopo empresarial e global;
2. As duas abas e a leitura individual de N01;
3. O que significa `Marcar visíveis como lidos`;
4. A navegação da notificação para a origem;
5. A diferença entre H01, H02 e histórico contextual;
6. A ocultação de antes/depois em H03;
7. As ações disponíveis em U01 e U02;
8. A regra de dois masters aptos;
9. A redefinição segura do TOTP de outro master;
10. A separação entre perfil empresarial, global e modelo inicial;
11. Os quatro estados de campo em U04;
12. O impacto e a aplicação imediata das permissões;
13. A central mínima de incidentes em I01;
14. Os estados e a linha do tempo de I02;
15. O registro manual da avaliação e comunicação externa;
16. As vinte e duas propostas da seção 28.

---

# 30. Registro de aprovação

O usuário confirmou integralmente:

- N01, H01 a H03, U01 a U05 e I01 a I02;
- navegação e retornos;
- escopos empresarial e global;
- leitura e resolução de notificações;
- auditoria e ocultação por campo;
- gestão de usuário, master, perfil e TOTP;
- revogações de sessão;
- matriz de permissões;
- registro e acompanhamento de incidentes;
- exportações de auditoria;
- vinte e duas propostas da seção 28.

**Situação atual:** Lote 7 aprovado integralmente pelo usuário em 21/08/2026, incluindo N01, H01 a H03, U01 a U05, I01 a I02 e as vinte e duas propostas da seção 28.  
**Evolução posterior:** a consolidação final do `16-consolidacao-final-prototipos.md` foi aprovada integralmente em 21/08/2026. O próximo passo autorizado é o Documento 17 — Matriz Formal de Estados e Transições.
