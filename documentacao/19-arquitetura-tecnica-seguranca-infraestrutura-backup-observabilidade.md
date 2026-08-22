# Documento 19

## Arquitetura Técnica, Segurança, Infraestrutura, Backup e Observabilidade

**Sistema:** Portal interno multiempresa de Departamento Pessoal  
**Versão:** 1.0  
**Situação:** aprovado integralmente pelo usuário  
**Data:** 21/08/2026  
**Base aprovada:** Documentos 16, 17, 18 e 18A; Documento Mestre 07; Fluxo Integrado 08 e Lotes 1 a 7

---

# 1. Finalidade

Este documento transforma o modelo funcional e lógico aprovado em uma arquitetura técnica implementável. Ele define:

- estilo e limites da aplicação;
- tecnologias de referência;
- módulos e responsabilidades;
- arquitetura física do banco de dados;
- isolamento multiempresa em todas as camadas;
- autenticação, sessão, TOTP, autorização e revogação;
- proteção dos dados, arquivos e integrações;
- transações, concorrência, idempotência e processamento em segundo plano;
- ambientes, publicação e cadeia de entrega;
- backup, restauração e continuidade;
- logs, métricas, rastreamento e alertas;
- capacidade inicial, metas e critérios para ampliação;
- ameaças principais e respectivos controles;
- decisões que podem aguardar o fornecedor de hospedagem sem bloquear o desenvolvimento.

O documento não cria funcionalidades. Toda escolha técnica existe para implementar as regras já aprovadas, especialmente os 440 IDs funcionais do Documento 17 — 436 transições e quatro regras de projeção `ASO-R*` — e as entidades, relações e restrições do Documento 18.

---

# 2. Autoridade, rastreabilidade e limites

## 2.1 Ordem de autoridade

Em caso de divergência:

1. Documento 18 aprovado, para estrutura, integridade e fonte dos dados;
2. Documento 17 aprovado, para estados, transições e comportamento;
3. Documento 16 aprovado, para consolidação funcional e visual;
4. Documento Mestre 07;
5. este Documento 19, para a forma técnica de implementar os itens anteriores;
6. Documento 20 aprovado, para contratos de API e matriz técnica de autorização;
7. Documento 21 aprovado, para backlog, dependências e etapas;
8. Documento 22 aprovado, para testes, homologação e rastreabilidade;
9. pacote do Documento 23 aprovado, para implantação, migração inicial, operação e retorno seguro.

Uma facilidade do framework, do provedor ou do banco não pode enfraquecer regra funcional, transação, histórico, isolamento ou permissão. Se uma restrição aprovada não puder ser implementada na tecnologia escolhida, troca-se a tecnologia ou registra-se uma nova decisão formal; não se adapta silenciosamente a regra.

## 2.2 Famílias de identificadores

| Prefixo | Finalidade |
|---|---|
| `ARQ-*` | Decisão de arquitetura da aplicação. |
| `DAD-*` | Decisão física de dados. |
| `SEG-*` | Controle de segurança. |
| `INF-*` | Infraestrutura e ambientes. |
| `BKP-*` | Backup, restauração e continuidade. |
| `OBS-*` | Logs, métricas, rastreamento e alertas. |
| `OPS-*` | Entrega, operação e resposta. |

Esses identificadores serão usados nos Documentos 20 a 23 e nos testes técnicos. Eles não substituem `ENT-*`, `REL-*`, `RST-*`, `PRJ-*`, `EST-*` nem os IDs de transição do Documento 17.

## 2.3 Incluído

- arquitetura da primeira versão;
- requisitos obrigatórios de plataforma, sem escolher ainda uma marca de nuvem;
- referência tecnológica suficiente para iniciar o repositório de produção;
- separação entre aplicação web, processador de tarefas, PostgreSQL e arquivos privados;
- políticas técnicas de segurança e continuidade;
- critérios de aceite arquiteturais.

## 2.4 Fora deste documento

- nomes e formatos exatos dos endpoints, que pertencem ao Documento 20;
- tabelas SQL e migrações completas, que serão produzidas no desenvolvimento a partir do Documento 18;
- fornecedor definitivo de hospedagem e e-mail;
- valores comerciais de serviços;
- responsáveis nominais por incidentes e homologações;
- competência, data e janela reais da implantação;
- instruções passo a passo de restauração e reversão, que pertencem ao Documento 23;
- a melhoria futura `MF-01 — Agendamento de ASO e lembretes ao colaborador`.

---

# 3. Premissas vinculantes

| Tema | Premissa aprovada |
|---|---|
| Empresas | Três CNPJs no início, com seleção explícita de uma empresa por vez. |
| Pessoas | Cerca de 65 colaboradores ativos e mais de 300 inativos, com alta rotatividade. |
| Usuários | Até aproximadamente 10 usuários simultâneos. |
| Crescimento | Interno e moderado; o produto não será comercializado para terceiros. |
| Disponibilidade | Sistema interno; manutenção programada é aceitável, desde que comunicada e recuperável. |
| Dados | Financeiros, cadastrais, clínicos informativos, autenticação e auditoria. |
| Retenção | Mínimo de seis anos para os registros aprovados; sem eliminação automática geral na primeira versão. |
| Arquivos | Recibos e logos privados; Excel, PDF consolidado e ZIP temporários; nenhum arquivo de ASO. |
| Desempenho | Listas e filtros usuais até 2 s; painel até 3 s; competência com 100 participantes até 5 s; Excel até 30 s; recibo individual até 5 s. |
| Continuidade | RPO máximo de uma hora e RTO máximo de oito horas úteis. |
| Autenticação | Senha; TOTP obrigatório apenas para master; sessão com aviso aos 25 min, inatividade de 30 min e limite absoluto de 8 h. |
| Escopo | Sem folha contábil completa, banco, eSocial, ponto, férias, nota fiscal, aplicativo móvel ou portal do colaborador. |

Essas premissas justificam uma arquitetura simples e robusta. O sistema precisa de segurança forte e transações corretas, não de distribuição em grande escala.

---

# 4. Decisões arquiteturais principais

| ID | Decisão proposta | Consequência |
|---|---|---|
| ARQ-001 | Usar um **monólito modular**. | Uma aplicação de negócio, organizada por módulos internos, sem microsserviços. |
| ARQ-002 | Separar execução web e processamento de tarefas, usando o mesmo código de domínio. | Falha ou lentidão de PDF/Excel não bloqueia as telas. |
| ARQ-003 | Usar interface React com TypeScript e API/backend TypeScript em Node.js LTS, estruturado em módulos. | Uma linguagem principal reduz duplicação de tipos e custo de manutenção. |
| ARQ-004 | Servir interface e API sob a mesma origem HTTPS. | Simplifica cookies seguros, CSP, CORS e proteção contra CSRF. |
| ARQ-005 | Usar PostgreSQL gerenciado como fonte transacional única. | Permite RLS, FKs compostas, restrições de exclusão, locks, transações e PITR. |
| ARQ-006 | Usar caixa de saída e fila durável inicialmente no PostgreSQL. | Evita um broker externo na primeira versão e preserva efeitos assíncronos. |
| ARQ-007 | Usar armazenamento privado de objetos para recibos, logos e temporários. | Banco guarda metadados e hashes; conteúdo binário fica fora das tabelas. |
| ARQ-008 | Usar sessão opaca mantida no servidor, não JWT no navegador. | Revogação imediata e contexto empresarial controlado no servidor. |
| ARQ-009 | Não usar Kubernetes, microsserviços, cache distribuído, mecanismo externo de busca, WebSocket ou data lake na primeira versão. | Menos custo, pontos de falha e complexidade operacional. |
| ARQ-010 | Manter arquitetura portável entre provedores por contêiner, PostgreSQL padrão, armazenamento compatível com objetos e OpenTelemetry. | A escolha posterior de hospedagem não reescreve o domínio. |

## 4.1 Tecnologias de referência

| Camada | Referência | Regra de versão |
|---|---|---|
| Interface | React + TypeScript, aplicação web responsiva sem modo offline | Versões estáveis e suportadas, fixadas no arquivo de dependências. |
| Construção da interface | Vite ou ferramenta estável equivalente | Sem dependência de renderização no servidor para telas internas. |
| Backend | Node.js em linha LTS + NestJS com adaptador HTTP estável | Usar somente versão LTS do runtime e versão suportada do framework no início do desenvolvimento. |
| Banco | PostgreSQL gerenciado | Versão suportada pelo projeto PostgreSQL e pelo fornecedor; extensões previamente aprovadas. |
| Acesso a dados | Camada tipada + migrações SQL versionadas | SQL explícito para RLS, índices parciais, ranges, exclusões e triggers. |
| Tarefas | Processo Node.js separado + outbox/fila no PostgreSQL | Mesma versão do artefato da aplicação. |
| Arquivos | Armazenamento privado compatível com objetos | Sem contêiner ou objeto público. |
| Telemetria | OpenTelemetry + destino escolhido na hospedagem | Código não fica preso a um único fornecedor de monitoramento. |
| Entrega | Contêiner OCI imutável | O mesmo artefato segue de homologação para produção. |

O framework e a biblioteca de acesso a dados não são autoridades de integridade. Restrições do Documento 18 deverão existir no banco mesmo que a aplicação também as valide.

## 4.2 Justificativa da linguagem

A base visual já produzida usa React e TypeScript. Manter TypeScript no backend permite:

- compartilhar contratos gerados e tipos básicos, sem compartilhar regras de autorização com o navegador;
- reaproveitar conhecimento e componentes visuais;
- executar a aplicação web e o processador de tarefas com o mesmo domínio;
- reduzir a quantidade de linguagens e pipelines para um sistema pequeno;
- manter testes unitários, de integração e ponta a ponta no mesmo ecossistema.

Essa escolha não autoriza reutilizar automaticamente o starter de publicação dos protótipos. A produção terá autenticação própria, PostgreSQL e as barreiras descritas neste documento.

## 4.3 Artefatos atuais e produção

O diretório de protótipos publicado com `vinext`, Sites e opções de D1/R2 é um artefato de visualização. Para a produção:

- layouts, textos, componentes e fluxos aprovados podem ser reaproveitados;
- cabeçalhos de identidade fornecidos pela plataforma de protótipos não substituem usuário, senha, TOTP, sessão e permissões do sistema;
- D1 não será a fonte de dados da produção;
- o banco de produção será PostgreSQL, porque o modelo aprovado depende de RLS, transações fortes, FKs compostas, ranges e restrições de exclusão;
- qualquer código reaproveitado passará pelas mesmas revisões, testes e políticas do novo projeto de produção.

---

# 5. Visão de componentes

```text
Navegador
   │ HTTPS / mesma origem
   ▼
Borda: TLS, limites, cabeçalhos e proteção básica
   │
   ▼
Aplicação web modular ───────────────► provedor de CEP
   │                         └───────► provedor de e-mail transacional
   │
   ├── PostgreSQL privado
   │      ├── negócio e auditoria
   │      ├── sessões e autorizações
   │      ├── idempotência
   │      └── outbox e fila de tarefas
   │
   ├── armazenamento privado de objetos
   │      ├── logos
   │      ├── recibos permanentes
   │      └── Excel/PDF/ZIP temporários
   │
   └── telemetria estruturada

Processador de tarefas
   ├── consome a fila PostgreSQL com lease
   ├── gera PDF, Excel e lotes
   ├── envia e-mail de autenticação
   ├── materializa alertas e expira temporários
   └── grava resultado, auditoria técnica e métricas
```

## 5.1 Fluxo síncrono

1. O navegador envia cookie de sessão e token contra requisição forjada.
2. A aplicação resolve a sessão no servidor.
3. Revalida usuário, credenciais/fatores vigentes, `usuario.revisao_autorizacao` e contexto.
4. Abre transação no banco.
5. Aplica contexto de empresa e ator somente à transação atual.
6. Autoriza rota, ação, entidade, estado e campos.
7. Executa validação e comando de domínio.
8. Persiste negócio, histórico, auditoria, idempotência e outbox de modo atômico.
9. Confirma a transação.
10. Serializa apenas os campos autorizados e devolve correlação segura.

## 5.2 Fluxo assíncrono

1. A transação de negócio grava uma mensagem na outbox.
2. O publicador torna a tarefa disponível na fila durável.
3. O processador adquire lease exclusivo por prazo curto.
4. Revalida referência, empresa, versão e autorização exigível.
5. Executa efeito idempotente.
6. Grava arquivo/resultado e conclui a tarefa.
7. Em falha, libera para nova tentativa com espera progressiva.
8. Depois do limite, move para falha definitiva, preserva diagnóstico sanitizado e gera alerta operacional.

Nenhuma tarefa renova sessão, assume empresa ausente ou usa dados de uma tarefa anterior.

---

# 6. Monólito modular e limites internos

Os módulos são separações de código e responsabilidade dentro de uma implantação, não serviços independentes.

| Módulo | Responsabilidade | Fontes principais do Documento 18 |
|---|---|---|
| Identidade | Login, senha, primeiro acesso, recuperação, TOTP, sessões e códigos | `ENT-AUT-*` |
| Acesso | Usuários, master, empresas autorizadas, perfis, ações, campos e incidente restrito | `ENT-ACL-*` |
| Contexto empresarial | Seleção, troca, inativação e configurações da empresa | `ENT-EMP-*`, `ENT-AUT-09` |
| Colaboradores | Pessoa empresarial, versões, vínculo, recontratação e detalhes | `ENT-COL-*` |
| MEI | Prestador, versões, contratos e renovações | `ENT-MEI-*` |
| Condições financeiras | Salário-base, RA, período sem registro, complementos e condições MEI | `ENT-FIN-*` |
| Competências | Competência, participantes, memória de cálculo, grupos e eventos | `ENT-CPT-*`, `ENT-PAG-01` a `ENT-PAG-12` |
| Pagamentos | Confirmações, cancelamentos, correções, ajustes e diferenças absorvidas | `ENT-PAG-13` a `ENT-PAG-18`, `ENT-COR-*` |
| Recibos e arquivos | Numeração, snapshots, versões, PDF, lotes e downloads | `ENT-REC-*` |
| Desligamentos | Saída, rescisão oficial informada e acerto complementar de RA | `ENT-DES-*` |
| Saúde ocupacional | Clínicas, acompanhamento, exames, versões e alertas de ASO | `ENT-ASO-*`, `ENT-CLI-*` |
| Notificações | Central interna e ocorrências temporais | `ENT-NOT-*` |
| Exportações | Pedidos, snapshots autorizados, Excel e expiração | `ENT-EXP-*` |
| Incidentes | Registro, responsáveis autorizados, linha do tempo e conclusão | `ENT-INC-*` |
| Auditoria | Eventos, mudanças de campo e histórico unificado | `ENT-AUD-*` |
| Plataforma | Idempotência, outbox, fila, relógio, arquivos, correlação e saúde | `ENT-TEC-*` |

## 6.1 Regras entre módulos

- Interface HTTP chama casos de uso; não acessa repositório diretamente.
- Um módulo não altera tabelas pertencentes a outro sem usar seu serviço de aplicação ou comando interno publicado.
- Eventos internos existem para efeitos posteriores; não substituem a transação que precisa ser atômica.
- Dependências circulares entre módulos são proibidas.
- Cálculo financeiro usa um núcleo puro, determinístico e testável, sem consultar relógio ou banco durante a fórmula.
- Auditoria é chamada pela unidade de trabalho comum e não pode ser esquecida por um controlador isolado.
- Autorização e contexto empresarial são infraestrutura transversal obrigatória, não código opcional em cada tela.

## 6.2 Camadas internas

```text
Interface HTTP / tarefas temporais
              │
              ▼
Casos de uso e autorização
              │
              ▼
Domínio: regras, estados e cálculos
              │
              ▼
Persistência, arquivos, e-mail e telemetria
```

O domínio não conhece NestJS, HTTP, provedor de e-mail ou armazenamento. Essa separação permite testar as regras aprovadas sem infraestrutura.

---

# 7. Arquitetura da interface web

## 7.1 Estado no navegador

- Sessão é representada apenas pelo cookie opaco; nenhum token de acesso fica em `localStorage`, `sessionStorage` ou IndexedDB.
- Empresa ativa, competência, filtros e rascunhos permanecem somente em memória e são conferidos com o contexto devolvido pelo servidor.
- Trocar empresa aborta requisições em voo, limpa caches, arquivos, prévias, seleções e rascunhos.
- Aba aberta em contexto antigo recebe invalidação na próxima resposta e não salva.
- Não haverá modo offline, PWA com cache de dados, sincronização posterior ou armazenamento local de dados pessoais.
- Atualização automática do painel ou sino não conta como atividade humana e não renova a sessão.

## 7.2 Permissão na interface

O servidor devolve uma projeção mínima das capacidades efetivas para montar a tela. Essa projeção ajuda a experiência, mas não autoriza operações. A API volta a conferir tudo.

Para cada campo, a interface recebe apenas um dos estados aprovados:

- oculto: campo e valor não são enviados;
- mascarado: somente representação já mascarada é enviada;
- visível sem edição;
- visível e editável.

Pedidos contendo campo oculto, somente leitura ou desconhecido são rejeitados. A aplicação não ignora silenciosamente tentativa de sobregravação.

## 7.3 Acessibilidade e proteção visual

- Navegação completa por teclado;
- foco visível e ordem previsível;
- rótulos associados aos campos;
- mensagens de erro junto do campo e em resumo;
- contraste adequado;
- status não representado apenas por cor;
- confirmação explícita para ações destrutivas ou irreversíveis;
- dados sensíveis não aparecem em título de página, URL, telemetria do navegador ou mensagens genéricas;
- impressão pelo navegador não substitui o recibo definitivo controlado.

## 7.4 Atualização e concorrência

Cada formulário editável carrega a versão do registro. Em conflito:

- o servidor rejeita a gravação antiga;
- a tela informa que o registro mudou;
- exibe somente dados que o usuário ainda pode ver;
- oferece recarregar e refazer conscientemente;
- nunca combina automaticamente dois valores financeiros ou de estado.

---

# 8. Arquitetura da API

## 8.1 Estilo

- API HTTP JSON sob `/api/v1` ou prefixo equivalente;
- mesma origem da aplicação web;
- recursos e comandos explícitos, sem GraphQL na primeira versão;
- nenhuma mutação por `GET`;
- códigos de erro estáveis e mensagens humanas neutras;
- respostas de erro não expõem SQL, pilha, existência de outra empresa ou regra interna sensível;
- os contratos correspondentes estão formalizados no Documento 20.

## 8.2 Cabeçalhos e metadados

| Elemento | Finalidade |
|---|---|
| Cookie `__Host-...` | Identificador opaco da sessão. |
| Token CSRF | Vincular mutação à sessão legítima. |
| Chave de idempotência | Repetir comando sem duplicar efeito. |
| Versão/ETag lógico | Detectar edição concorrente. |
| ID de correlação | Ligar requisição, auditoria, outbox e tarefa. |

`empresa_id`, `usuario_id`, papel master e permissões enviados pela tela nunca são aceitos como autoridade. A empresa efetiva vem da sessão no servidor.

## 8.3 Validação

Cada entrada passa por quatro níveis:

1. **Contrato:** tipo, formato, tamanho, catálogo e campo desconhecido;
2. **Autorização:** ação, empresa, perfil, estado e campo;
3. **Domínio:** datas, unicidade, transição, fórmula e pré-condição;
4. **Banco:** FK, `CHECK`, unicidade, exclusão, RLS e concorrência.

Falha em qualquer nível não deixa alteração parcial. Validação no navegador serve apenas para rapidez.

## 8.4 Consultas

- Paginação obrigatória em listas potencialmente crescentes;
- ordenação determinística com desempate por ID;
- inativos fora da consulta padrão;
- filtros permitidos por lista fechada;
- consultas com limite de tempo;
- nenhum total é calculado antes de aplicar empresa e permissões de campo;
- exportação extensa cria snapshot assíncrono em vez de manter requisição longa;
- parâmetros são vinculados; concatenação de SQL com entrada é proibida.

---

# 9. Arquitetura física de dados

## 9.1 Banco de referência

`DAD-001` — A produção usará PostgreSQL gerenciado, em versão suportada na implantação, com:

- transações ACID;
- FKs compostas;
- `CHECK`, unicidade parcial e constraints deferrable quando necessárias;
- tipos `range` e restrições de exclusão para vigências sem sobreposição;
- Row-Level Security;
- bloqueio de linha e níveis de isolamento;
- extensões aprovadas, como `btree_gist`, quando justificadas;
- recuperação pontual;
- criptografia em trânsito e em repouso;
- métricas, logs e manutenção automatizada.

Não haverá um banco por CNPJ. O isolamento será lógico e obrigatório dentro de um banco, reforçado por empresa, chaves e RLS.

## 9.2 Mapeamento dos tipos lógicos

| Tipo do Documento 18 | Representação física de referência | Observação |
|---|---|---|
| `id` | `uuid` | Gerado no servidor; nunca contém dado de negócio. |
| `inteiro` | `integer` ou `bigint` | Escolha pelo limite do campo; sempre assinado e validado. |
| `versao` | `bigint` positivo | Crescente por raiz; também usado em concorrência otimista. |
| `booleano` | `boolean` | Sem valores ternários implícitos. |
| `codigo` | `text` com `CHECK` ou catálogo | Não usar enum físico quando dificultar evolução segura. |
| `texto_curto` | `varchar(n)` | Limite definido por campo. |
| `texto_longo` | `text` + limite na aplicação e banco | Somente nos campos aprovados. |
| `cpf` | entrada canônica de 11 dígitos; persistência como `dado_protegido` + índice seguro | Nunca cria coluna de busca em claro. |
| `cnpj` | `char(14)` ou `varchar(14)` | Texto validado, nunca número. |
| `cep` | `char(8)` ou `varchar(8)` | Texto validado; zeros iniciais preservados. |
| `email` | original + forma normalizada em `varchar(320)` | Unicidade usa a forma normalizada. |
| `telefone` | `varchar(20)` ou limite equivalente | Forma normalizada com DDI/DDD quando aplicável. |
| `data` | `date` | Data civil, sem conversão de fuso. |
| `competencia` | `date` no primeiro dia do mês | API apresenta `AAAA-MM`; `CHECK` exige dia 1. |
| `instante` | `timestamptz` | Persistido em UTC e apresentado em `America/Sao_Paulo`. |
| `moeda` | `numeric(18,2)` | Nunca `float` ou `double`. |
| `decimal_calculo` | `numeric(24,8)` | Intermediários; resultado monetário arredonda normalmente na terceira casa. |
| `percentual` | `numeric(9,6)` | Faixa de 0 a 100 conferida por `CHECK`. |
| `hash` | `bytea` | Algoritmo e versão em coluna própria quando necessário. |
| `segredo_cifrado` | ciphertext, nonce, versão de chave e metadados protegidos | Nunca aparece em resposta comum, auditoria ou exportação. |
| `dado_protegido` | envelope cifrado + metadados | Cifra autenticada, versão de chave e AAD. |
| `indice_busca_segura` | `bytea` HMAC | Chave diferente da cifra; sempre escopado corretamente. |
| `json_canonico` | `jsonb` validado + hash da serialização canônica | Somente snapshot técnico aprovado; nunca substitui campos relacionais críticos. |

## 9.3 Dinheiro, cálculo e tempo

- Valores persistidos têm duas casas decimais.
- Fórmulas usam precisão maior e só arredondam no ponto aprovado da memória de cálculo.
- O divisor comercial é sempre 30 nos casos aprovados.
- O relógio técnico é UTC; competência, vencimentos, datas de pagamento e datas civis usam calendário de São Paulo.
- A aplicação recebe um serviço de relógio, substituível em testes.
- Rotinas mensais não dependem do fuso padrão da máquina.
- Alteração de versão do banco, biblioteca decimal ou fuso exige regressão dos cenários de fevereiro, mês com 31 dias e limites dia 15/16.

## 9.4 Organização física

Recomenda-se separar responsabilidades por schemas ou proprietários equivalentes:

| Schema lógico | Conteúdo |
|---|---|
| `app` | Negócio empresarial e global. |
| `identity` | Credenciais, sessões, tokens, TOTP e revisões. |
| `audit` | Auditoria append-only e mudanças de campo. |
| `jobs` | Idempotência, outbox, tarefas, leases e falhas. |
| `ops` | Versão de esquema, checkpoints e integridade. |

A separação organiza privilégios, mas não muda as fontes do Documento 18.

## 9.5 Papéis do banco

| Papel | Pode | Não pode |
|---|---|---|
| Proprietário/migração | Criar e alterar estrutura em implantação controlada | Atender requisição web. |
| Aplicação empresarial | Operar tabelas empresariais sob RLS | Possuir tabela, usar `BYPASSRLS`, alterar política ou escolher outra empresa livremente. |
| Aplicação global restrita | Usar funções/views explicitamente concedidas | Fazer consulta empresarial genérica. |
| Processador | Executar tarefas aprovadas sob contexto explícito | Varrer todas as empresas em uma única tarefa empresarial. |
| Auditoria | Inserir pelos caminhos controlados e consultar conforme função | Atualizar ou excluir evento. |
| Leitura operacional | Consultar metadados técnicos mínimos | Ler CPF, salário, resultado de ASO ou segredo. |
| Backup | Executar capacidade gerenciada de cópia/restauração | Fazer login na aplicação ou alterar dado. |

A credencial proprietária não fica disponível ao processo web. Tabelas empresariais usam `FORCE ROW LEVEL SECURITY` quando aplicável.

## 9.6 Índices

O desenho inicial seguirá os acessos aprovados, sem indexar tudo indiscriminadamente:

- `(empresa_id, estado, id)` para listas;
- `(empresa_id, competencia, estado)` para competências e pagamentos;
- `(empresa_id, cpf_busca_segura)` único para pessoa;
- `(empresa_id, cnpj_normalizado)` ou índice seguro conforme a classificação para MEI;
- `(empresa_id, data_vencimento)` para alertas de ASO;
- `(empresa_id, criado_em, id)` para históricos;
- índices parciais para versões atuais e estados ativos;
- GiST/exclusão para vigências não sobrepostas;
- índices que sustentam FKs e RLS.

Índice contendo dado protegido não pode ser criado apenas por conveniência. Consultas reais e planos serão medidos em homologação.

## 9.7 Versionamento e imutabilidade

- Raízes editáveis possuem `versao_lock`.
- Versões e eventos históricos recebem apenas inserção.
- Pagamento, recibo, auditoria, incidente e snapshots não são sobrescritos.
- Triggers ou privilégios de banco bloqueiam `UPDATE`/`DELETE` indevidos nas tabelas imutáveis.
- Correção cria versão, cancelamento ou evento compensatório conforme o Documento 17.
- Número de recibo é reservado e confirmado na transação; número cancelado não volta à sequência.
- Restauração preserva sequências, versões, hashes e idempotências.

## 9.8 Migrações

- Toda mudança de estrutura é versionada e revisada.
- Apenas um executor aplica migração por ambiente.
- Migrações usam o padrão adicionar → preencher → passar a usar → retirar em versão futura.
- Mudança destrutiva não é implantada junto da primeira versão que deixa de usar a estrutura antiga.
- Dado histórico não é reescrito sem rotina explícita, idempotente, auditável e testada em cópia.
- Antes de migração de risco há backup verificável e ensaio em base representativa.
- Reverter a aplicação não tenta desfazer destrutivamente uma migração já confirmada; usa compatibilidade ou correção progressiva.

---

# 10. Isolamento multiempresa em profundidade

## 10.1 Princípio

`SEG-001` — O isolamento é aplicado simultaneamente na sessão, caso de uso, consulta, relacionamento, banco, arquivo, tarefa, auditoria e exportação. Nenhuma barreira isolada é considerada suficiente.

## 10.2 Contexto no servidor

- A sessão mantém exatamente um dos escopos: sem empresa, empresarial, global ou incidente restrito.
- Escopo empresarial contém exatamente uma empresa autorizada.
- A tela não pode substituir esse valor por URL, corpo, cabeçalho ou campo oculto.
- Selecionar outra empresa passa primeiro pelo seletor e incrementa `sessao_usuario.versao_lock`, usado como revisão técnica do contexto; não cria uma segunda fonte funcional.
- Troca de empresa limpa o contexto anterior; não carrega dados combinados.
- Master também seleciona uma empresa para operar dados empresariais.
- Função global e incidente restrito têm entradas explícitas e não herdam empresa silenciosamente.

## 10.3 Contexto no PostgreSQL

Cada operação empresarial deve:

1. adquirir conexão;
2. abrir transação;
3. aplicar com `SET LOCAL` ou `set_config(..., true)` o usuário, a empresa, o escopo, a revisão e a correlação;
4. executar somente dentro da transação;
5. confirmar ou reverter;
6. devolver conexão ao pool sem contexto persistente.

RLS usa `USING` para leitura e `WITH CHECK` para gravação. Ausência ou formato inválido do contexto produz negação padrão. A aplicação web não é dona das tabelas e não possui `BYPASSRLS`.

## 10.4 Relacionamentos

- Toda FK entre registros empresariais inclui `empresa_id` ou mecanismo estrutural equivalente.
- Uma FK simples por ID não é aceita se puder ligar CNPJs diferentes.
- `empresa_id` não pode ser alterado depois da criação; transferência entre empresas significa novo registro conforme a regra funcional.
- Clínica é global, mas a ligação ao ASO e seu snapshot continuam empresariais.
- Incidente restrito e funções globais usam relações e permissões próprias; não existe `empresa_id = NULL` como passe livre.

## 10.5 Operações globais

Operações globais não recebem um papel com leitura genérica de todas as tabelas. Elas usam:

- módulos e rotas específicos;
- função global ou autorização de incidente válida;
- TOTP concluído quando master;
- reautenticação quando exigida;
- views ou funções de banco com saída mínima e contrato fixo;
- auditoria de consulta/exportação;
- serialização por campo.

Rotina temporal que precise avaliar todas as empresas percorre uma empresa por transação e por tarefa filha. Uma falha não troca o contexto da próxima.

## 10.6 Arquivos, buscas e mensagens

- Chave física de arquivo é aleatória e sem nome, CPF, CNPJ ou competência.
- `arquivo_privado` guarda escopo, empresa quando empresarial e metadados físicos; o vínculo de propriedade existe exclusivamente por uma FK tipada de logo, recibo, lote ou exportação.
- Download responde não encontrado quando o escopo não corresponde.
- Busca, contagem, duplicidade e tempo de resposta não confirmam registro de outro CNPJ.
- Erros técnicos e filas guardam IDs opacos, não conteúdo empresarial.
- Toda tentativa cruzada relevante gera auditoria segura, sem revelar o alvo ao solicitante.

## 10.7 Teste obrigatório de isolamento

Cada endpoint, comando, arquivo, tarefa e consulta empresarial deverá possuir teste com:

- usuário da empresa A;
- objeto válido da empresa B;
- ID conhecido e ID inexistente;
- mudança de contexto em aba concorrente;
- conexão de banco reutilizada;
- permissão reduzida durante a operação;
- worker recebendo tarefa sem empresa ou com empresa divergente.

O resultado aceitável é nenhuma leitura, escrita, inferência, arquivo ou efeito em B.

---

# 11. Transações, concorrência e idempotência

## 11.1 Unidade de trabalho

`DAD-002` — Para cada comando crítico, os itens abaixo fazem parte da mesma transação:

- mudança de negócio;
- nova versão ou evento histórico;
- atualização da raiz/estado;
- auditoria obrigatória;
- consumo ou conclusão da chave de idempotência;
- mensagem da outbox;
- incremento de revisão que invalide autorização, quando aplicável.

Se qualquer item falhar, nenhum é confirmado.

## 11.2 Fronteiras principais

| Operação | Fronteira atômica |
|---|---|
| Editar cadastro/condição | Versão nova, raiz atual, auditoria e efeitos temporais. |
| Calcular/recalcular | Snapshot de entradas, memória, linhas, versão e auditoria. |
| Confirmar grupo | Estado, valor efetivo, data, pagamento, numeração lógica, recibo lógico, auditoria e outbox. |
| Confirmar lote | Todos os participantes elegíveis ou nenhum; PDFs ficam fora da transação. |
| Cancelar/substituir recibo | Cancelamento, justificativa, nova versão/número quando aplicável, auditoria e outbox. |
| Alterar acesso | Perfil/associação, revisões e revogação das sessões afetadas. |
| Registrar exame | Versão, resultado protegido, clínica snapshot, referência de alerta e auditoria. |
| Concluir incidente | Entrada imutável de conclusão, estado, versão concorrente e auditoria. |

## 11.3 Confirmação em lote

Para até 100 participantes, a regra “todos ou nenhum” será implementada por uma única transação final curta:

1. prévia e validações pesadas antes do commit;
2. reabertura da transação final;
3. bloqueio ordenado das linhas relevantes;
4. revalidação de versões, permissões, valores e idempotência;
5. inserção dos pagamentos, recibos lógicos, números, auditorias e outbox;
6. commit único.

PDF, Excel, ZIP, e-mail ou chamada externa nunca ocorre dentro dessa transação. Conflito em um participante reverte o lote completo e devolve a lista segura de impedimentos. Uma saga com pagamento parcial do lote é proibida.

## 11.4 Concorrência

- Edição comum usa versão otimista.
- Numeração, fechamento, confirmação e seleção de tarefa usam locks de banco curtos.
- Locks são adquiridos em ordem canônica para reduzir deadlock.
- Deadlock ou erro transitório pode ser repetido pelo servidor somente se a operação for idempotente.
- A resposta nunca declara sucesso antes do commit.
- A autorização e a revisão são verificadas novamente imediatamente antes do commit sensível.

## 11.5 Idempotência

Comandos críticos recebem chave opaca e escopo composto por usuário, empresa/escopo, operação e recurso.

A entrada de idempotência guarda:

- hash canônico da requisição autorizada;
- estado persistido `EM_PROCESSAMENTO`, `CONCLUIDA` ou `FALHA_SEM_COMMIT`;
- referência ao resultado;
- versão da autorização e do contexto;
- prazos e correlação.

Mesma chave e mesmo hash devolvem o resultado anterior. Mesma chave com conteúdo diferente é conflito. Chave de uma empresa, usuário ou comando não vale para outro.

`AUSENTE` e `RESPOSTA_INCERTA` são projeções da interação/reconciliação, não estados persistidos. Enquanto não houver prova de conclusão ou de ausência de commit, a operação permanece bloqueada para repetição. Os estados de `operacao_idempotente` também não se confundem com disponível, em lease, repetindo ou falha definitiva da fila de tarefas.

## 11.6 Efeito já pago

Depois da confirmação real:

- edição não reescreve pagamento;
- correção usa cancelamento controlado, substituição e/ou ajuste financeiro positivo;
- erro favorável ao colaborador pode ser registrado como diferença absorvida;
- não existe ajuste negativo automático para recuperar valor;
- todas as versões e recibos permanecem preservados.

---

# 12. Processamento em segundo plano

## 12.1 Estratégia inicial

`ARQ-011` — A primeira versão usará outbox e fila durável no próprio PostgreSQL, consumida por um processo separado. Não haverá RabbitMQ, Kafka, Redis ou serviço de fila adicional inicialmente.

Essa solução é suficiente para o volume conhecido e reduz custo operacional. Ela poderá ser substituída por fila gerenciada sem alterar o domínio se métricas demonstrarem necessidade.

## 12.2 Tarefas assíncronas

- gerar PDF definitivo;
- regenerar arquivo a partir do mesmo snapshot;
- gerar PDF consolidado ou ZIP;
- gerar Excel;
- enviar convite, primeiro acesso e recuperação;
- materializar e resolver notificações temporais;
- expirar arquivos temporários;
- verificar referências de ASO;
- executar verificações de integridade;
- tarefas técnicas de reconciliação autorizadas.

## 12.3 Contrato da tarefa

Toda tarefa contém:

- ID e tipo;
- empresa ou escopo global explícito;
- usuário/origem e revisão de autorização;
- entidade, versão e transição relacionada;
- chave idempotente;
- correlação;
- instante de disponibilidade;
- tentativas e último erro sanitizado;
- payload mínimo, preferindo referências a cópia de dados sensíveis.

### 12.3.1 Autoridade conforme a origem

| Classe | Exemplos | Regra de autorização no worker |
|---|---|---|
| Efeito já comprometido pelo commit | PDF do recibo, convite já emitido, materialização de notificação | Executa sob autoridade técnica do efeito confirmado e snapshot imutável; revogação posterior do solicitante não desfaz o negócio. Entrega/visualização continua sujeita à permissão atual. |
| Pedido ainda autorizável | Excel, lote documental, regeneração ou consulta extensa | Revalida solicitante, escopo, ação, campos e revisão antes de gerar e novamente antes de disponibilizar. |
| Rotina de sistema | expiração, alerta temporal, reconciliação | Usa identidade técnica mínima e processa uma empresa por transação; não simula sessão humana. |

Essa distinção evita dois erros: gerar uma exportação depois da perda de acesso ou deixar de produzir um recibo obrigatório apenas porque o usuário que confirmou o pagamento saiu do sistema.

## 12.4 Entrega e repetição

- A semântica é “uma ou mais vezes”.
- O efeito final é idempotente.
- Lease possui vencimento; travamento do processo permite retomada.
- Retentativa usa espera progressiva com aleatoriedade e limite por tipo.
- Erro permanente não é repetido infinitamente.
- Depois do limite, tarefa vai para falha definitiva e dispara alerta.
- Intervenção manual exige usuário, justificativa e novo ID de operação.
- Reiniciar worker não duplica pagamento, número, recibo ou arquivo.

## 12.5 Estado funcional e estado técnico

A fila não cria uma segunda verdade funcional:

- pagamento confirmado continua confirmado se o PDF atrasar;
- `arquivo_recibo`, e não o recibo lógico, usa os estados aprovados `PENDENTE_GERACAO`, `DISPONIVEL`, `FALHOU` e `INDISPONIVEL`;
- e-mail falho não estende token nem restaura credencial antiga;
- arquivo só fica disponível depois de hash e metadados confirmados;
- notificação só muda por comando idempotente.

## 12.6 Capacidade e promoção para fila externa

Começar com um worker e concorrência de duas a quatro tarefas. Considerar fila externa somente se, de forma recorrente:

- tarefa mais antiga exceder cinco minutos sem falha de dependência;
- banco sofrer contenção causada pela fila;
- processamento precisar escalar independentemente de modo frequente;
- houver necessidade de isolamento operacional não atendida;
- volume futuro superar materialmente o escopo interno aprovado.

---

# 13. Autenticação e sessão

## 13.1 Senhas

`SEG-002` — Senhas serão armazenadas com Argon2id, salt aleatório por credencial e parâmetros registrados junto do hash.

- mínimo funcional aprovado: 10 caracteres;
- máximo aceito: ao menos 128 caracteres;
- espaços e caracteres Unicode são aceitos sem corte silencioso;
- não se exige composição artificial de maiúscula, número e símbolo;
- senha comum ou conhecida como comprometida é recusada por lista/serviço seguro, sem registrar a senha;
- referência inicial mínima para calibração: 19 MiB de memória, duas iterações e paralelismo 1; aumentar quando o tempo medido permitir e nunca ficar abaixo da orientação de segurança vigente no início do desenvolvimento;
- autenticação bem-sucedida pode atualizar o hash para parâmetros novos;
- senha nunca é cifrada reversivelmente, enviada por e-mail ou incluída em auditoria.

## 13.2 Primeiro acesso e recuperação

| Item | Regra |
|---|---|
| Credencial temporária | 24 horas, uso único, somente hash persistido. |
| Recuperação | 30 minutos, uso único, somente hash persistido. |
| Emissão nova | Invalida imediatamente a anterior da mesma finalidade. |
| Resposta pública | Neutra para e-mail existente, inexistente ou inelegível. |
| Alteração de senha | Revoga todas as sessões e tokens anteriores. |
| Página de recuperação | Sem script de terceiro e com `Referrer-Policy: no-referrer`. |

Tokens têm pelo menos 256 bits aleatórios. O e-mail contém link para o próprio domínio do sistema, nunca senha ou dado empresarial.

Rotas de primeiro acesso e recuperação são redigidas na borda, proxy, aplicação e telemetria. Na primeira validação, o token da URL é trocado por uma sessão restrita de curta duração e o navegador é redirecionado para uma URL limpa. Token, query string sensível e fragmento de credencial nunca entram em access log, trace, histórico ou ferramenta de análise.

## 13.3 TOTP dos masters

`SEG-003` — TOTP será compatível com Google Authenticator e aplicativos RFC 6238 equivalentes.

- obrigatório para master; usuário comum não configura TOTP na primeira versão;
- passo de 30 segundos e seis dígitos;
- tolerância inicial máxima de um intervalo anterior ou posterior;
- contador aceito é consumido atomicamente para impedir repetição;
- segredo é cifrado com chave exclusiva e mostrado somente no cadastro do próprio master;
- QR Code não é armazenado como imagem;
- executor administrativo nunca vê segredo ou código de outro master;
- códigos de recuperação são mostrados uma vez e persistidos somente por hash;
- nova série invalida a anterior;
- quinto código inválido no controle aplicável bloqueia por 15 minutos;
- reset e contingência seguem `B03-MST-05` a `B03-MST-07`.

Recomendação de implementação: dez códigos de recuperação de uso único.

## 13.4 Sessão opaca

`SEG-004` — O cookie conterá somente um identificador aleatório. O servidor guarda o hash e todo o estado da sessão.

| Propriedade | Regra |
|---|---|
| Entropia | Pelo menos 256 bits aleatórios. |
| Cookie | Prefixo `__Host-`, `Secure`, `HttpOnly`, `Path=/`, sem `Domain`, `SameSite=Strict` quando compatível; `Lax` somente se teste funcional justificar. |
| Inatividade | Aviso aos 25 minutos; expiração aos 30 minutos. |
| Limite absoluto | 8 horas, nunca ampliado por atividade, TOTP ou troca de empresa. |
| Rotação | Depois de autenticação, conclusão do TOTP e mudança relevante de privilégio. |
| Logout | Invalida no servidor; sessão não volta a ser válida. |
| Atividade humana | Somente ação explícita aprovada renova a janela de inatividade. |

Sessão não é armazenada em memória exclusiva de uma réplica. Duas réplicas atendem o mesmo usuário sem afinidade obrigatória.

## 13.5 Reautenticação

Operações críticas usam autorização recente de cinco minutos vinculada a:

- usuário e sessão;
- ação e entidade;
- empresa/escopo;
- versão atual;
- resumo do impacto;
- senha e TOTP quando o ator é master.

Uma reautenticação não autoriza outra ação nem amplia as oito horas.

## 13.6 Bloqueio e limitação

- Quinta tentativa válida de senha ou TOTP ativa bloqueio de 15 minutos conforme o Documento 17.
- Limitador adicional por origem protegida, conta correlacionada e finalidade reduz abuso distribuído.
- Resposta não informa qual fator falhou.
- Bloqueio técnico não altera a situação administrativa do usuário.
- IP não é usado sozinho para bloquear uma rede inteira da empresa.

## 13.7 Risco residual proposto para aceitação

Usuários comuns permanecem sem segundo fator e com mínimo de 10 caracteres, conforme decisão funcional. A arquitetura compensa com:

- Argon2id;
- bloqueio e rate limit;
- verificação de senha comprometida;
- sessão curta e revogável;
- acesso empresarial e por campo;
- alerta de anomalia e auditoria.

Essa escolha deve ser registrada como risco aceito e impede afirmar conformidade integral com um perfil que exija MFA para todos ou senha maior para fator único. A estrutura permitirá adicionar TOTP a usuários comuns futuramente, mas isso não integra a primeira versão.

## 13.8 Limite da recuperação dos masters

A primeira versão possui somente os caminhos já aprovados:

- `B01-AUT-15`, quando o próprio master possui código de recuperação válido;
- `B03-MST-06`, quando exatamente um dos dois masters continua apto e inicia a contingência controlada do outro.

Não haverá backdoor, senha universal, conta oculta ou identidade de infraestrutura capaz de alterar credenciais da aplicação. Se nenhum master estiver apto e não existir código de recuperação utilizável, o sistema permanece bloqueado para administração master. Criar uma recuperação para esse cenário exigirá decisão funcional e nova versão dos Documentos 17 e 18 antes da implementação.

---

# 14. Autorização, campo e revogação

## 14.1 Decisão de autorização

Uma ação só é permitida quando todas as condições forem verdadeiras:

```text
usuário elegível
+ sessão válida
+ revisão atual
+ escopo correto
+ empresa autorizada
+ ação permitida
+ objeto pertencente ao escopo
+ estado compatível
+ campo permitido
+ pré-condições da transição
```

A ausência de qualquer permissão resulta em negação. Recurso, tela, ação e campo novos nascem negados.

## 14.2 Motor central

`SEG-005` — Um componente central e testável calcula a política efetiva. Ele é usado por:

- rotas;
- casos de uso;
- carga de objeto;
- serialização;
- histórico;
- filtros e totais;
- exportação;
- recibos e arquivos;
- tarefas assíncronas.

Não se aceita copiar manualmente regras de perfil em vários controladores.

## 14.3 Campos

- Oculto: o servidor não consulta nem envia quando desnecessário.
- Mascarado: o servidor produz somente o valor mascarado.
- Visível sem edição: aparece, mas qualquer envio para alteração é rejeitado.
- Visível e editável: passa ainda pelas regras de estado e domínio.
- Edição implica visualização.
- Criação exige edição dos campos obrigatórios.
- Valor mascarado nunca retorna como substituto do valor integral.
- Campo oculto também sai de filtro, ordenação, total, histórico, notificação e Excel.

## 14.4 Revogação

`SEG-006` — Na primeira versão, qualquer redução efetiva de empresa, perfil, ação, campo, papel, autorização de incidente ou situação administrativa:

1. incrementa a revisão de autorização;
2. revoga **todas as sessões** do usuário afetado;
3. invalida autorizações curtas e a capacidade de download dos pedidos afetados;
4. impede leitura ou commit na primeira requisição seguinte;
5. registra evento e motivo.

Alterar um perfil incrementa e revoga todos os usuários afetados na mesma transação. O volume de até dez usuários simultâneos torna essa estratégia simples, segura e operacionalmente aceitável.

Mudança de senha, recuperação, reset de TOTP, promoção/rebaixamento, bloqueio ou inativação também revoga todas as sessões. Nenhuma revogação depende de TTL de cache.

Revogação não apaga recibo permanente, snapshot ou arquivo definitivo. Ela impede a entrega e torna pedido temporário incompatível indisponível até existir autorização atual válida.

## 14.5 Cache de autorização

- Não haverá cache distribuído de permissão.
- Dentro de uma requisição, a política pode ser reutilizada.
- Entre requisições, sessão e revisão são novamente verificadas.
- Catálogos imutáveis podem ser cacheados; dados, perfis efetivos e campos não.
- Resposta autenticada usa `Cache-Control: no-store, private`.
- CDN não armazena página, JSON, PDF ou Excel autenticado.

## 14.6 Master e incidente

- Master administra usuários e perfis, mas não ignora empresa ativa.
- Master não recebe automaticamente conteúdo de incidente.
- Acesso a incidente exige autorização restrita, função nominal e escopo explícito.
- TOTP concluído não substitui permissão.
- A função global usa contratos próprios; não existe painel multi-CNPJ de dados operacionais.

---

# 15. Criptografia, chaves e dados protegidos

## 15.1 Em trânsito e em repouso

- HTTPS obrigatório; TLS moderno e certificado renovado automaticamente.
- HSTS será habilitado depois de validar todos os subdomínios.
- Banco, volumes, objetos, snapshots e backups cifrados pelo provedor.
- Comunicação interna usa TLS e identidade de serviço quando disponível.
- Chaves ficam em serviço de gestão de chaves/cofre, nunca no repositório.

## 15.2 Proteção na aplicação

Usar cifra autenticada por envelope, como AES-256-GCM ou equivalente aprovado, para:

- CPF recuperável;
- resultado restrito de ASO;
- segredo TOTP;
- referências restritas de evidência;
- antes/depois de auditoria classificado para proteção adicional;
- outros campos marcados `dado_protegido` no Documento 18.

Cada cifra possui nonce único, versão da chave e dados adicionais autenticados contendo finalidade, entidade, campo, empresa, registro e versão quando aplicável. Copiar ciphertext para outro campo ou registro deve falhar na decifragem.

## 15.3 Busca segura

CPF normalizado usa:

- valor cifrado para recuperação autorizada;
- HMAC-SHA-256 ou função equivalente para igualdade/unicidade;
- chave diferente da chave de cifra;
- `empresa_id` no escopo criptográfico e no índice.

Com o volume previsto, filtro autorizado de resultado clínico consulta o conjunto empresarial permitido e trata o valor protegido no serviço. Um índice sensível adicional só poderá nascer depois de necessidade medida e nova análise de ameaça; nunca se cria coluna aberta apenas para facilitar a interface.

## 15.4 Separação de chaves

| Finalidade | Separação mínima |
|---|---|
| Dados cadastrais | Chave própria. |
| Dados clínicos | Chave própria. |
| Auditoria protegida | Chave própria. |
| TOTP | Chave própria. |
| Índice seguro | Chave HMAC própria. |
| Arquivos/objetos | Chave gerenciada própria do ambiente. |
| Backups | Chave e domínio administrativo separados do uso diário. |

Novas gravações usam a chave atual; versões antigas permanecem decifráveis pelo prazo necessário. Exclusão de chave exige proteção contra exclusão acidental, aprovação independente e prova de que nenhum dado vivo depende dela.

## 15.5 Segredos

Credenciais de banco, e-mail, objetos, CI/CD, backup e integrações ficam em cofre:

- separados por ambiente e serviço;
- com menor privilégio;
- preferencialmente por identidade de carga de trabalho;
- rotacionados e inventariados;
- acessados por pessoa somente em exceção nominal e auditada;
- varridos no commit, build e artefato;
- nunca impressos em log, erro ou pipeline.

---

# 16. Segurança da aplicação web

## 16.1 Requisição forjada

Como a sessão usa cookie, toda mutação exige:

- token CSRF vinculado à sessão;
- validação de origem;
- `SameSite` como defesa adicional;
- método não seguro explicitamente autorizado;
- rejeição de conteúdo simples inesperado;
- reautenticação/confirmação humana nas ações críticas.

`SameSite` sozinho não substitui o token.

## 16.2 XSS e conteúdo

- React escapa texto por padrão; uso de HTML bruto é proibido salvo componente revisado e sanitizado.
- CSP restrita, sem `unsafe-eval` e sem origem curinga.
- `object-src 'none'`, `base-uri 'none'` e `frame-ancestors 'none'`.
- Scripts de terceiros não entram nas páginas de login, TOTP ou recuperação.
- Texto de incidente, nome, endereço e demais entradas nunca viram HTML executável.

## 16.3 Cabeçalhos

No mínimo:

- `Strict-Transport-Security` após validação;
- `Content-Security-Policy`;
- `X-Content-Type-Options: nosniff`;
- `Referrer-Policy: no-referrer`;
- `Permissions-Policy` mínima;
- `Cache-Control: no-store, private` em conteúdo autenticado;
- política contra incorporação por terceiros.

## 16.4 Injeção e sobregravação

- SQL parametrizado;
- modelos de entrada por comando, sem vincular entidade inteira;
- campos desconhecidos rejeitados;
- catálogos validados por lista fechada;
- nomes de coluna e ordenação escolhidos em mapa interno;
- limites de tamanho em aplicação e borda;
- erro de validação não ecoa conteúdo sensível desnecessário.

Campos livres de incidente passam ainda por validação específica que bloqueia senha, token, segredo, chave, resultado clínico, cópia de base e identificador pessoal integral desnecessário. A negação não ecoa o conteúdo detectado e não o registra em log ou auditoria.

## 16.5 Planilha

- Dados são gravados como tipos corretos.
- Texto iniciado por `=`, `+`, `-` ou `@` é neutralizado.
- Não são geradas macros, fórmulas dinâmicas ou links externos.
- Excel respeita a matriz atual de campos e o snapshot autorizado.
- Nome de planilha e arquivo é produzido pelo servidor e sanitizado.

## 16.6 Limitação de abuso

Aplicar limites diferentes para:

- login, TOTP e recuperação;
- consulta de CEP;
- pesquisa/lista;
- geração de Excel/lotes;
- download;
- operações críticas.

O limitador considera usuário, sessão, finalidade e origem protegida, sem permitir que um único IP compartilhado bloqueie todos os funcionários.

---

# 17. Arquivos privados e geração documental

## 17.1 Conteúdos armazenados

| Conteúdo | Persistência |
|---|---|
| Logo da empresa | Privado, versionado e substituível por nova versão. |
| Recibo individual | Permanente pelo prazo aplicável; arquivo por versão imutável. |
| PDF consolidado/ZIP | Temporário por até 24 horas. |
| Excel | Temporário por até 24 horas. |
| Documento de ASO | Proibido na primeira versão. |

## 17.2 Upload de logo

- máximo inicial de 2 MB;
- somente PNG ou JPEG confirmado pelo conteúdo;
- limite de dimensões e pixels;
- decodificação e nova codificação pelo servidor;
- remoção de metadados;
- hash criptográfico;
- varredura adicional quando o provedor oferecer;
- nenhuma execução de SVG, script ou formato ativo.

## 17.3 PDF e Excel

- Geração ocorre em ambiente isolado do worker.
- Template não busca conteúdo remoto.
- Snapshot contém somente dados necessários e autorizados.
- PDF definitivo liga número, versão, hash e recibo lógico.
- Regenerar o mesmo recibo usa o mesmo snapshot e não inventa novo conteúdo.
- Prévia tem a marca textual aprovada `PRÉVIA — PAGAMENTO NÃO CONFIRMADO` e não recebe número.
- Logo aparece no cabeçalho, sem ser marca d'água.

Para tornar a reprodução verificável, cada tentativa registra versão do template, renderizador, fontes incorporadas, localidade, fuso, configuração e hash do artefato gerador. Metadados variáveis que não pertencem ao recibo são removidos. O snapshot possui hash canônico semântico e cada PDF possui hash binário físico:

- com o mesmo artefato gerador, a regeneração deve reproduzir o hash binário esperado;
- se uma atualização de segurança impedir o uso do renderizador antigo, a regeneração autorizada pode produzir novo hash físico, mas deve manter exatamente o snapshot, o hash semântico, o número e a versão documental; a tentativa e a troca física ficam registradas;
- divergência sem explicação bloqueia a entrega.

O worker documental executa sem privilégio administrativo, com diretório temporário exclusivo, limites de CPU, memória, tamanho e tempo, e sem saída de rede durante a renderização. O conteúdo temporário é eliminado ao terminar a tarefa, com sucesso ou falha.

## 17.4 Armazenamento

- contêiner/bucket privado;
- chaves aleatórias sem dado de negócio;
- criptografia, versionamento e checksum;
- ambientes e classes de retenção separados;
- `arquivo_privado` guarda escopo, empresa quando empresarial, finalidade, chave física, MIME real, tamanho, hash, criação, expiração e descarte opcional, sem enum de estado;
- exatamente uma associação tipada — logo, arquivo de recibo, lote documental ou exportação — determina o proprietário;
- disponibilidade e estado ficam na entidade tipada correspondente, nunca em colunas genéricas `tipo_proprietario + id`;
- objeto órfão ou metadado sem objeto gera alerta de reconciliação.

Versionamento do armazenamento não pode preservar versões antigas de Excel, PDF consolidado ou ZIP além das 24 horas. Todas as versões físicas e marcadores de exclusão desses temporários seguem a mesma política de descarte.

## 17.5 Download

Para o volume aprovado, o arquivo será transmitido pela aplicação depois de nova autorização. Não se usará URL pública ou link permanente.

Antes de cada entrega:

1. revalidar sessão e revisão;
2. revalidar solicitante, empresa/escopo, ação e campos;
3. verificar estado e validade temporal;
4. conferir hash e tamanho;
5. registrar acesso quando exigido;
6. enviar como anexo, com `no-store` e `nosniff`.

Expiração da sessão não apaga um temporário antes das 24 horas, mas exige novo login e autorização. Perda de permissão bloqueia imediatamente o download.

---

# 18. Integrações externas

## 18.1 E-mail transacional

Na primeira versão, e-mail atende somente:

- convite e primeiro acesso;
- reenvio autorizado;
- recuperação de senha;

Qualquer outra categoria de mensagem depende de aprovação funcional futura.

Não envia pagamento, salário, ASO, arquivo ou notificação operacional. `MF-01` continua futura.

O provedor fica atrás de uma interface própria. Requisitos:

- domínio remetente autenticado com SPF e DKIM;
- política DMARC definida antes da produção;
- TLS e credencial em cofre;
- identificador estável de envio e chave idempotente do provedor quando suportada;
- retorno/webhook com assinatura validada;
- webhook valida assinatura, timestamp, tolerância de relógio, idempotência e prevenção de replay;
- conteúdo neutro, sem CPF, salário ou dado clínico;
- registro de destino protegido, tipo, identificador do provedor, datas e resultado;
- falha não estende validade de token;
- homologação usa caixa de captura ou lista fechada.

Envio externo é tratado como “uma ou mais vezes”: se houver queda depois de o provedor aceitar e antes de devolver confirmação, a repetição usa exatamente o mesmo identificador, conteúdo, token e link. Nunca emite nova credencial implicitamente. Um provedor sem deduplicação pode entregar duas cópias idênticas, mas somente um token de uso único continuará válido.

Webhook atualiza somente o estado técnico de entrega da mensagem correspondente. Ele não ativa usuário, não troca senha, não consome token e não altera estado financeiro ou funcional.

## 18.2 Consulta de CEP

- Somente o CEP é enviado ao provedor.
- Nome, CPF, empresa e endereço parcial não são enviados.
- Timeout curto e repetição limitada.
- Indisponibilidade libera preenchimento manual.
- Resposta é validada antes de preencher.
- Usuário confirma e pode corrigir conforme a regra aprovada.
- Provedor é substituível e não se torna fonte histórica do endereço.

## 18.3 Saída de rede

A aplicação e o worker terão saída limitada aos destinos necessários: e-mail, CEP, observabilidade e serviços da própria plataforma. Banco e armazenamento não ficam expostos publicamente.

Destinos externos são fixos ou pertencem a lista permitida por configuração. Nenhuma URL fornecida pelo usuário, importada de texto ou recebida em webhook é buscada pelo servidor; essa regra reduz risco de requisição forjada pelo servidor.

---

# 19. Ambientes

## 19.1 Ambientes obrigatórios

| Ambiente | Finalidade | Dados |
|---|---|---|
| Local | Desenvolvimento individual | Fictícios, gerados e descartáveis. |
| Testes automáticos | Integração e ponta a ponta efêmeros | Fábricas determinísticas e cenários sintéticos. |
| Homologação | Revisão funcional, contábil, jurídica, segurança, carga e restauração | Sintéticos representativos ou anonimizados por processo aprovado. |
| Produção | Uso real | Dados reais e controles máximos. |

## 19.2 Separação

`INF-001` — Produção e não produção não compartilham:

- banco;
- bucket/contêiner;
- fila/outbox operacional;
- chave criptográfica;
- segredo;
- domínio/remetente ativo de e-mail;
- conta de serviço;
- telemetria que permita consulta cruzada;
- backup.

Dados reais não são copiados para desenvolvimento ou homologação. Um dump mascarado informal não é aceito como anonimização.

## 19.3 Configuração

- O mesmo artefato passa por homologação e produção.
- Diferenças ficam em configuração validada, não em branches de código.
- Configuração ausente ou insegura impede a inicialização.
- Modo de depuração, stack trace e documentação administrativa ficam desativados externamente em produção.
- Relógio, fuso, domínio, origem permitida, limites, KMS e destinos são verificados no startup.
- Segredo nunca é usado como valor padrão.

## 19.4 Acesso administrativo

- Contas pessoais, nunca compartilhadas.
- MFA obrigatório na hospedagem, repositório, CI/CD, banco administrativo, observabilidade, e-mail e KMS.
- Menor privilégio e revisão periódica.
- Master da aplicação não se torna administrador da infraestrutura.
- Administrador da infraestrutura não recebe automaticamente acesso funcional aos dados.
- Conta de emergência fica selada, monitorada, com uso excepcional e revisão posterior.

---

# 20. Topologia de produção

## 20.1 Baseline

`INF-002` — Topologia inicial recomendada:

- uma região principal, preferencialmente no Brasil ou América do Sul conforme avaliação jurídica, latência e oferta;
- proteção de borda e TLS gerenciado;
- uma réplica pequena como mínimo operacional, ou duas réplicas quando se buscar atualização sem interrupção e disponibilidade de 99,5%;
- um worker, com possibilidade de segunda réplica;
- PostgreSQL gerenciado privado;
- armazenamento privado de objetos;
- telemetria gerenciada ou coletor dedicado;
- e-mail transacional externo;
- cópia de backup em domínio administrativo separado.

## 20.2 Desenho de implantação recomendado com alta disponibilidade

```text
Internet corporativa
        │
        ▼
DNS / TLS / borda / limites
        │
        ▼
Balanceamento privado da aplicação
   ┌───────────────┴───────────────┐
   ▼                               ▼
Web A                           Web B
   └───────────────┬───────────────┘
                   │ rede privada
          ┌────────┼────────┐
          ▼        ▼        ▼
     PostgreSQL  Objetos   Worker
          │        │        │
          └────────┴────────┘
                   │
              Telemetria
```

Somente a borda HTTPS é pública. Banco e objetos não aceitam acesso público direto.

## 20.3 Aplicação sem estado local

Réplicas web não guardam como fonte:

- sessão;
- empresa ativa;
- autorização;
- idempotência;
- arquivo definitivo;
- fila;
- rascunho funcional.

Reiniciar ou substituir uma réplica não perde operação confirmada. Diretório local é temporário e não contém arquivo permanente.

## 20.4 Alta disponibilidade proporcional

- Duas réplicas web evitam interrupção em atualização comum.
- Quando a plataforma permitir, as duas réplicas ficam em domínios de falha distintos; no mesmo host/domínio, elas protegem apenas contra falha de processo e implantação, não contra falha da infraestrutura.
- O worker pode começar com uma réplica porque a fila preserva tarefas.
- Banco gerenciado com failover automático é preferível; se o custo impedir, a restauração controlada deve demonstrar RTO de oito horas úteis e a indisponibilidade residual será aceita formalmente.
- Multi-região ativa não é necessária.
- Réplica de leitura não é necessária no volume inicial.
- Escala automática é opcional; limite máximo impede custo descontrolado.

Com uma única réplica, manutenção programada e falha do processo podem causar interrupção breve; isso é aceitável apenas se a meta de 99,5% não for contratada. A escolha entre uma e duas réplicas será feita junto da hospedagem e do orçamento, sem alterar o código porque a aplicação é sem estado local.

## 20.5 Rede

- banco, worker e objetos em rede privada ou controles equivalentes;
- firewall por origem e porta;
- saída controlada;
- painel administrativo do provedor não exposto por credencial compartilhada;
- logs de acesso da borda sem conteúdo sensível;
- proteção básica contra volumetria do próprio provedor;
- nenhuma conexão direta do navegador com banco ou bucket.

## 20.6 Saúde

| Endpoint | Responde quando | Não revela |
|---|---|---|
| Vida | Processo e loop principal funcionam | Banco, segredo ou versão detalhada publicamente. |
| Prontidão | Dependências essenciais permitem atender com segurança | String de conexão ou diagnóstico interno. |
| Saúde operacional autenticada | Componentes e atrasos podem ser investigados | Dados de negócio. |

Instância não pronta sai do tráfego. Vida não deve reiniciar processo apenas porque um provedor externo está temporariamente indisponível.

---

# 21. Capacidade inicial e desempenho

## 21.1 Dimensionamento de partida

Os valores são ponto inicial a validar, não compra antecipada obrigatória:

| Componente | Capacidade inicial recomendada |
|---|---|
| Aplicação web | Duas réplicas de 0,5–1 vCPU e 1–2 GB cada. |
| Worker | Uma réplica de 0,5–1 vCPU e 1–2 GB; concorrência 2–4. |
| PostgreSQL | 2 vCPUs, 4 GB, 20–50 GB expansíveis. |
| Objetos | Reserva inicial de 10–20 GB, com crescimento medido. |
| Pool | Pequeno, limitado por processo e abaixo da capacidade do banco. |
| Logs | Sem corpos; retenção operacional curta. |

O orçamento de conexões é global, não por processo:

```text
soma dos máximos dos pools web
+ máximo do worker
+ conexões de migração/observabilidade
+ reserva administrativa
<= 70% a 80% de max_connections
```

Ao menos 20% fica reservado para manutenção, restauração e diagnóstico. A configuração é validada antes do deploy; aumentar réplicas sem recalcular os pools é proibido.

## 21.2 Metas de aplicação

| Fluxo | Meta inicial em homologação representativa |
|---|---|
| Login, seletor, lista e filtro comum | até 2 segundos na maior parte das requisições; acompanhar p95. |
| Painel | até 3 segundos. |
| Competência com até 100 participantes | até 5 segundos. |
| Excel operacional | até 30 segundos. |
| Recibo individual | até 5 segundos. |
| Lote longo | processa em segundo plano e mostra progresso, sem bloquear sessão. |

## 21.3 Disponibilidade proposta

A meta numérica será definida com o fornecedor e o orçamento. **99,5% mensal durante a janela operacional** só poderá ser assumido se houver banco com failover automático, réplicas web em domínios de falha distintos, monitoramento externo e suporte compatível. Se a opção for restauração controlada de até oito horas úteis, não se prometerá 99,5%; a indisponibilidade residual será registrada e comunicada. As metas funcionais de desempenho e o RPO/RTO continuam vinculantes.

## 21.4 Estratégias de desempenho

- listas paginadas;
- filtros indexados e permitidos;
- inativos fora do padrão;
- agregados simples no painel;
- queries sem N+1;
- batch interno controlado;
- pool limitado;
- timeout por consulta e por chamada externa;
- PDF/Excel fora da requisição longa quando necessário;
- nenhum cache distribuído inicial;
- nenhuma atualização em tempo real;
- auditoria sempre filtrada por período e escopo.

## 21.5 Gatilhos de ampliação

Investigar e medir antes de ampliar. Gatilhos iniciais:

- CPU, memória, conexões ou armazenamento acima de 70% por período sustentado;
- p95 acima da meta em três janelas representativas;
- tarefa mais antiga acima de cinco minutos de modo recorrente;
- consultas lentas frequentes;
- autovacuum ou crescimento de auditoria afetando operações;
- cálculo de 100 participantes acima de cinco segundos;
- Excel acima de 30 segundos;
- recibo individual acima de cinco segundos.

Particionamento físico, réplica de leitura, cache ou fila externa só entram depois de evidência. Com o volume atual, introduzi-los agora aumentaria risco.

---

# 22. Comportamento diante de falhas

| Falha | Comportamento seguro |
|---|---|
| Banco indisponível | Novas leituras/mutações protegidas falham; nada é salvo localmente. |
| Uma réplica web indisponível | Sai do balanceamento; a outra atende. |
| Worker indisponível | Telas e pagamentos síncronos continuam; tarefas aguardam. |
| Objetos indisponíveis | Pagamento permanece válido; arquivo fica pendente/falha controlada. |
| E-mail indisponível | Token mantém validade original; envio repete ou usuário solicita nova emissão autorizada. |
| CEP indisponível | Usuário preenche manualmente. |
| Observabilidade indisponível | Auditoria transacional continua; operação crítica pode falhar se sua própria auditoria falhar. |
| KMS indisponível | Operação que precisa cifrar/decifrar falha fechada; dado não é gravado aberto. |
| Outbox atrasada | Efeito de negócio confirmado permanece; alerta mede atraso. |
| Hash de arquivo divergente | Download bloqueado e alerta operacional gerado; uma pessoa autorizada avalia e, quando aplicável, registra incidente por `INC-01`. |
| Backup atrasado | Alerta crítico antes de ultrapassar RPO. |
| Autorização muda no meio | Commit ou entrega é negado; sessão afetada é revogada. |

Não se transforma indisponibilidade em permissão ampla, modo sem auditoria ou gravação parcial.

## 22.1 Circuitos e retentativas

- Repetir apenas erro transitório conhecido.
- Usar espera progressiva e aleatoriedade.
- Não repetir comando HTTP do usuário sem chave idempotente.
- Limitar concorrência por integração.
- Abrir circuito temporário quando dependência falha repetidamente.
- Recuperação do circuito começa com poucas tentativas.
- Erro permanente vai para ação humana, sem loop infinito.

## 22.2 Reconciliação

Rotinas periódicas conferem:

- outbox não publicada;
- tarefa presa além do lease;
- recibo lógico sem arquivo por prazo anormal;
- objeto sem metadado e metadado sem objeto;
- hash divergente;
- temporário vencido ainda disponível;
- sequência/número e versão inconsistentes;
- referência de ASO desatualizada;
- auditoria faltante em comando crítico;
- backup/PITR fora da janela.

Reconciliação informa e corrige somente quando a ação é segura, idempotente e prevista. Não inventa pagamento ou recibo.

Ausência de auditoria obrigatória não pode ser “corrigida” fabricando depois um evento com aparência de atomicidade. Ela abre incidente de integridade, preserva evidências e bloqueia correção automática até investigação.

---

# 23. Entrega contínua e cadeia de software

## 23.1 Repositório

- branch principal protegida;
- commits e mudanças rastreáveis;
- revisão por outra pessoa quando houver equipe disponível;
- decisão crítica exige aprovação nominal de implantação mesmo em equipe pequena;
- segredos e arquivos de produção proibidos;
- dependências fixadas por lockfile;
- documentação e código mudam juntos quando uma decisão arquitetural for alterada.

## 23.2 Pipeline mínimo

1. formatação e análise estática;
2. testes unitários;
3. testes de integração com PostgreSQL real;
4. testes das migrações;
5. testes de contratos e autorização;
6. testes ponta a ponta principais;
7. varredura de segredos;
8. análise de dependências e licenças;
9. SAST;
10. build do frontend/backend/worker;
11. geração de SBOM;
12. varredura do contêiner;
13. identificação e assinatura/hash do artefato;
14. publicação em registro privado.

## 23.3 Promoção

```text
commit aprovado
      ↓
artefato imutável
      ↓
homologação + migração + testes
      ↓
aprovações funcionais/técnicas
      ↓
produção com atualização gradual
      ↓
smoke tests e observação
```

Produção recebe o mesmo hash homologado. Não se recompila especificamente para produção.

## 23.4 Implantação

- migração por executor único;
- verificação prévia de backup e compatibilidade;
- atualização gradual das réplicas;
- prontidão antes de receber tráfego;
- smoke tests sem dado sensível;
- monitoramento reforçado depois da publicação;
- registro de versão, autorizações, início, fim e resultado.

## 23.5 Reversão

- Código volta para artefato anterior compatível.
- Migração expandir–contrair mantém compatibilidade.
- Migração destrutiva não é revertida automaticamente.
- Corrupção ou erro de dados segue restauração/forward fix do Documento 23.
- Reversão não apaga eventos, números, recibos ou auditoria criados legitimamente.

## 23.6 Vulnerabilidades

- Crítica ou alta conhecida e explorável bloqueia produção até correção ou decisão excepcional formal com controle compensatório e prazo.
- Média exige plano e responsável.
- Dependência fora de suporte não entra em produção.
- Runtime Node.js deve estar em linha Active LTS ou Maintenance LTS durante operação.
- Atualizações de segurança passam por homologação acelerada, sem ignorar testes essenciais.

## 23.7 Baseline de verificação

A matriz de segurança do Documento 22 adota **OWASP ASVS 5.0 Nível 1 integral mais os controles selecionados do Nível 2 aplicáveis ao risco do sistema**, incluindo autorização por campo, criptografia, arquivos, auditoria e multiempresa.

O sistema não declarará conformidade integral com o Nível 2 enquanto usuários comuns permanecerem sem MFA e com a regra de senha aprovada. Cada controle aplicável terá teste ou justificativa formal; referência externa não substitui as transições dos Documentos 17 e 18.

---

# 24. Backup e recuperação

## 24.1 Objetivos vinculantes

| Objetivo | Meta |
|---|---|
| RPO | Perda máxima de uma hora para banco, objetos permanentes e metadados necessários em conjunto. |
| RTO | Restauração integral em até oito horas úteis. |
| Escopo inicial | Sistema inteiro, não um CNPJ isolado. |
| Primeiro teste | Antes da produção. |
| Repetição | Trimestral, com evidência e tempo medido. |

## 24.2 Banco

`BKP-001` — Estratégia recomendada:

- registro contínuo de transações/WAL para PITR;
- base backup ou snapshot diário restaurável;
- janela inicial de PITR de 35 dias;
- cópia cifrada em conta, projeto, cofre ou domínio administrativo separado;
- ao menos uma cópia protegida contra alteração/exclusão pelo operador comum;
- monitoramento da idade do último backup e da continuidade do log;
- teste automático básico mais restauração humana trimestral;
- réplica não conta como backup.

## 24.3 Objetos permanentes

- versionamento habilitado;
- inventário de objetos e hashes;
- replicação ou cópia cifrada e isolada com atraso comprovado máximo de 60 minutos;
- metadados do banco e objeto restaurados para o mesmo ponto lógico;
- chaves históricas preservadas enquanto houver ciphertext;
- exclusão acidental protegida por janela e autorização independente.

O sistema mantém um checkpoint de recuperação que correlaciona o ponto do banco, a geração/inventário dos objetos e os hashes necessários. O indicador monitorado é o **último ponto comprovadamente restaurável do sistema completo**, não apenas o horário em que um job de backup terminou. Se banco ou objetos ultrapassarem 60 minutos de atraso no mesmo corte lógico, o RPO está violado e o alerta é crítico.

## 24.4 Temporários

Excel, PDF consolidado e ZIP expiram em 24 horas e não precisam de arquivo histórico. Se entrarem tecnicamente em uma cópia, a restauração não os torna novamente disponíveis depois do prazo. A rotina de expiração volta a aplicá-lo.

## 24.5 Segredos, configuração e infraestrutura

Recuperação inclui:

- versões necessárias das chaves;
- configuração não secreta versionada;
- procedimento para recriar segredos rotacionáveis;
- DNS e certificados;
- artefatos da aplicação;
- infraestrutura reproduzível;
- fila/outbox e leases tratados sem duplicar efeitos;
- contatos e runbook fora da própria aplicação.

Perder uma chave necessária equivale a perder os dados cifrados. Backup sem chaves recuperáveis é inválido.

## 24.6 Ordem de restauração

1. declarar incidente e congelar mudanças;
2. escolher o último corte lógico comprovadamente restaurável;
3. criar ambiente isolado, sem rota pública, com worker/agendador desligados e saída para e-mail, CEP e webhooks bloqueada;
4. restaurar banco;
5. restaurar objetos e chaves do mesmo corte lógico;
6. implantar versão compatível da aplicação ainda sem efeitos externos;
7. validar migrações, hashes, sequências, empresas, permissões, pagamentos, recibos e auditoria;
8. invalidar todas as sessões, tokens temporários, autorizações curtas e séries de códigos de recuperação presentes no ponto restaurado;
9. reconciliar alterações de senha/TOTP posteriores ao ponto e exigir recuperação segura de todo usuário cujo estado mais recente não possa ser provado;
10. reconciliar a maior numeração de recibo conhecida contra banco, objetos, checkpoints e evidências externas, reservando como lacuna todo número possivelmente emitido depois do corte;
11. medir RPO e RTO;
12. aprovar o retorno;
13. rotacionar credenciais quando necessário;
14. habilitar tráfego e efeitos externos de modo controlado;
15. documentar diferenças e lições.

O passo a passo executável está fechado no pacote do Documento 23 aprovado.

Uma restauração nunca reativa silenciosamente sessão encerrada, token consumido, senha anterior, TOTP substituído ou código de recuperação já usado. Número de recibo possivelmente visto fora do sistema também nunca é reutilizado, mesmo que isso deixe lacuna justificada na sequência.

## 24.7 Evidência trimestral

Cada exercício registra:

- data, responsáveis e ponto escolhido;
- backup e versões usados;
- tempo por etapa;
- RPO real;
- RTO real;
- quantidade de empresas, usuários, vínculos, pagamentos e recibos conferidos;
- resultado dos hashes e continuidade da auditoria;
- impossibilidade de enviar e-mail real;
- falhas encontradas, plano e novo teste.

O ambiente temporário de restauração possui segurança equivalente à produção, acesso nominal, nenhuma rota pública ou efeito externo, logs de acesso e eliminação comprovada ao fim do exercício.

## 24.8 Backup não é retenção

- Dados vivos permanecem pelo prazo aprovado.
- Backup possui ciclo próprio de recuperação.
- Nenhum backup autoriza apagar a fonte antes da política.
- Backup também não deve preservar indefinidamente temporários já expirados.
- Política depois de seis anos será decidida antes da produção e refletida nos ciclos de cópia.

---

# 25. Retenção e ciclo de vida

| Classe | Regra inicial |
|---|---|
| Cadastros, vínculos, condições, competências, pagamentos e recibos | mínimo de seis anos; sem exclusão automática comum na primeira versão. |
| Auditoria e incidentes | mínimo de seis anos, append-only. |
| Registro informativo de ASO | mínimo de seis anos no sistema; documento físico continua fora dele. |
| Recibo definitivo | preservado com sua versão e hash. |
| Excel/PDF consolidado/ZIP | conteúdo até 24 horas. |
| Notificação resolvida | visível na central por 90 dias; evento relevante continua na auditoria. |
| Sessão/token | até término funcional e janela técnica mínima necessária. |
| Logs operacionais | 30 dias pesquisáveis como recomendação inicial. |
| IP/User-Agent bruto | não será coletado além do necessário até a política específica pré-produção. |
| Backup/PITR | ciclo próprio; referência inicial de 35 dias para PITR. |

## 25.1 Eliminação futura

A política posterior ao mínimo de seis anos deverá definir:

- base e finalidade;
- classes elimináveis e preserváveis;
- retenção legal/suspensão;
- aprovação;
- banco, objeto, índice, busca e backup;
- evidência sem preservar o conteúdo eliminado;
- impossibilidade de reaparecimento por restauração.

Não haverá botão operacional de “apagar histórico” na primeira versão.

## 25.2 IP e identificação de navegador

Permanece uma decisão pré-produção. Recomendação:

- coletar somente em evento de segurança justificado;
- proteger o IP completo;
- guardar User-Agent reduzido a navegador/sistema e versão principal, sem fingerprint persistente;
- manter bruto por até 90 dias;
- preservar por prazo maior somente quando incorporado a incidente, com justificativa;
- eliminar o valor bruto e conservar apenas a ocorrência necessária à auditoria.

IP e identificação detalhada de navegador ficam em registro de contexto de segurança separado e expirável, correlacionado ao evento de auditoria. O evento permanente conserva somente referência opaca ou indicador mínimo. Quando necessário a um incidente, a evidência recebe cópia própria, classificação, justificativa e retenção do incidente. Assim, a eliminação do valor bruto não altera a trilha append-only.

---

# 26. Observabilidade

## 26.1 Separação de finalidades

| Registro | Finalidade | Regra |
|---|---|---|
| Auditoria funcional | Provar quem fez o quê e as versões de negócio | Transacional, append-only, mínimo de seis anos. |
| Log técnico | Diagnosticar execução e falha | Sanitizado, retenção curta, não substitui auditoria. |
| Métrica | Medir saúde, capacidade e tendência | Agregada, sem dado pessoal. |
| Trace | Ligar passos de uma operação | IDs opacos e atributos mínimos. |
| Alerta | Chamar responsável para condição operacional | Fora da central funcional; não contém conteúdo sensível. |

`OBS-001` — A instrumentação usará OpenTelemetry para manter portabilidade.

## 26.2 Logs estruturados

Campos permitidos quando aplicáveis:

- instante UTC;
- ambiente, serviço e versão;
- nível e código do evento;
- ID de requisição/correlação/trace;
- operação idempotente;
- transição do Documento 17;
- usuário e empresa por ID opaco;
- rota normalizada;
- resultado e duração;
- código de erro sanitizado;
- número da tentativa da tarefa.

Proibido:

- senha, token, cookie, TOTP, segredo ou chave;
- CPF/CNPJ completo sem necessidade excepcional aprovada;
- nome, endereço, telefone ou e-mail aberto;
- salário, RA, complemento, líquido ou memória detalhada;
- resultado de ASO;
- corpo integral de requisição/resposta;
- conteúdo de PDF, Excel ou incidente;
- SQL com valores.

Uma biblioteca central de redação aplica as regras. Testes varrem logs por padrões proibidos.

## 26.3 Métricas

### Aplicação

- requisições, duração p50/p95/p99 e erros;
- logins, bloqueios, falhas TOTP e recuperação;
- autorizações negadas e tentativas cruzadas;
- operações por módulo e estado;
- conflito de concorrência e repetição idempotente.

### Banco

- CPU, memória, armazenamento e I/O;
- conexões e uso do pool;
- locks, deadlocks e transações longas;
- consultas lentas;
- autovacuum e crescimento de tabelas/índices;
- falhas de RLS/constraint agregadas.

### Tarefas e arquivos

- tamanho e idade da fila;
- leases vencidos, retentativas e falhas definitivas;
- tempo de PDF, Excel e lote;
- recibos lógicos sem arquivo;
- temporários expirados e descartados;
- objeto ausente, órfão ou hash divergente;
- uso de armazenamento.

### Dependências e continuidade

- e-mails aceitos, rejeitados e devolvidos;
- falhas/latência de CEP;
- backup mais recente e continuidade do PITR;
- resultado e duração do último teste de restauração;
- certificado e chave próximos da rotação;
- versão implantada por ambiente.

## 26.4 Rastreamento

- Correlação nasce na borda ou aplicação.
- Propaga por caso de uso, banco, outbox, fila e worker.
- Erros e operações críticas recebem amostragem suficiente.
- Leitura comum pode ser amostrada.
- Atributos não incluem valor de negócio sensível.
- Trace não é usado como histórico funcional.

## 26.4.1 Retenção inicial da telemetria

| Sinal | Retenção proposta |
|---|---|
| Logs operacionais pesquisáveis | 30 dias. |
| Traces comuns | 14 dias. |
| Traces de erro/críticos, ainda sanitizados | 30 dias. |
| Métricas em resolução operacional | 30 dias. |
| Métricas agregadas de tendência | 13 meses. |
| Checkpoints de integridade da auditoria | no mínimo o mesmo prazo de seis anos da trilha correspondente. |

Custos e fornecedor podem ajustar resolução, nunca incluir dado proibido nem reduzir checkpoints abaixo da auditoria.

## 26.5 Alertas iniciais

| Severidade | Exemplos |
|---|---|
| Crítica | Banco indisponível; todas as réplicas fora; backup/PITR além do RPO; restauração falhou; possível vazamento; integridade de recibo/auditoria comprometida. |
| Alta | Worker parado; fila mais antiga acima de 10 min; falha definitiva; objetos indisponíveis; PDFs definitivos falhando repetidamente. |
| Média | p95 acima da meta; recursos acima de 70%; rejeição elevada de e-mail; anomalia de login; reconciliação pendente. |
| Informativa | Limpeza temporária incompleta; crescimento acima da previsão; certificado/chave perto da renovação. |

Limites serão calibrados após dados reais, sem remover a cobertura mínima.

Cinco minutos de idade da tarefa mais antiga é **advertência para investigação**; dez minutos é **alerta alto**. Ambos exigem duração mínima e deduplicação para não alertar por pico momentâneo.

## 26.5.1 Verificação externa

Um monitor fora da própria aplicação verificará periodicamente:

- resolução DNS e certificado;
- abertura neutra da página pública de login;
- endpoint mínimo de vida sem detalhes;
- sinal independente de backup/PITR e da cadeia de alertas.

Ele não usa conta real, não acessa dados e alerta por canal independente do sistema monitorado. Isso permite detectar queda total da aplicação ou do coletor interno.

## 26.6 Destinatários e escalonamento

Antes da produção serão definidos:

- responsável primário e substituto por severidade;
- canal fora da aplicação;
- prazo de reconhecimento;
- quando acionar direção, DP, jurídico/LGPD e fornecedor;
- janela de suporte;
- regra de escalonamento sem resposta.

O sino de notificações funcionais não será usado para alertar que o próprio sistema está fora do ar.

---

# 27. Auditoria técnica e integridade

## 27.1 Auditoria funcional

`SEG-007` — A trilha do Documento 18 é uma fonte de negócio protegida:

- somente acréscimo;
- escrita na mesma transação da operação;
- instante do servidor;
- ator humano ou sistema explicitamente identificado;
- sessão, empresa/escopo, ação, resultado, entidade, versão, transição e correlação;
- mudanças de campo protegidas;
- leitura conforme permissão atual;
- mínimo de seis anos;
- nenhuma senha, token, TOTP, código de recuperação ou chave.

O papel normal da aplicação pode inserir por caminho controlado, mas não alterar ou apagar evento confirmado.

A aplicação grava auditoria na mesma conexão e transação do negócio, por função de banco de contrato fixo pertencente ao papel de auditoria ou por privilégio exclusivo de `INSERT`. O processo web não recebe `UPDATE` ou `DELETE` nessas tabelas, e o evento obrigatório nunca é enviado por conexão assíncrona separada.

## 27.2 Histórico dentro do colaborador

O histórico apresentado dentro do colaborador e a auditoria geral usam a mesma fonte de eventos:

- a visão do colaborador filtra os eventos relacionados à sua pessoa/vínculos;
- antes/depois respeita a permissão atual do observador;
- evento financeiro ou clínico aparece apenas no nível autorizado;
- o histórico geral inclui as demais ações administrativas e de segurança;
- não existe uma cópia simplificada que possa divergir da auditoria.

## 27.3 Integridade adicional

Recomendação:

- encadear ou agrupar hashes de auditoria por período;
- gerar checkpoint diário;
- armazenar checkpoint em destino imutável separado;
- verificar continuidade automaticamente;
- alertar falha de inserção, lacuna ou divergência;
- validar checkpoints no teste de restauração.

O hash ajuda a detectar adulteração, mas não substitui privilégios, backup ou retenção.

## 27.4 Relógio e correlação

- Servidores sincronizam relógio.
- Instante técnico é UTC.
- Correlação liga requisição, idempotência, pagamento, recibo, outbox e tarefa.
- Usuário não escolhe o instante da auditoria.
- Data efetiva de pagamento é campo funcional separado do instante de registro.

---

# 28. Resposta a incidentes

## 28.1 Relação com o módulo do sistema

O módulo I01/I02 registra e acompanha incidentes, mas não substitui o plano operacional. Se a aplicação estiver indisponível ou sob suspeita, a equipe precisa de canal e formulário externo protegido; depois, os fatos aprovados podem ser reconciliados no módulo sem apagar a evidência original.

## 28.2 Fluxo mínimo

1. detectar e registrar;
2. classificar gravidade;
3. preservar evidências;
4. conter;
5. identificar empresas, usuários, sessões, chaves e dados afetados;
6. erradicar a causa;
7. restaurar;
8. avaliar obrigações com jurídico/LGPD;
9. registrar decisões e comunicações;
10. monitorar recorrência;
11. concluir;
12. registrar melhorias.

## 28.3 Responsáveis

Antes da produção serão nomeados, com substitutos:

- coordenador do incidente;
- responsável técnico;
- responsável de DP;
- representante da direção;
- apoio jurídico/LGPD;
- responsável por comunicação;
- responsável por backup/restauração.

Esses nomes não são decisão de código e podem aguardar a preparação da produção.

## 28.4 Controles operacionais

- lista de contatos fora do sistema;
- canal seguro de acionamento;
- acesso de emergência sem conta compartilhada;
- capacidade de revogar todas as sessões;
- rotação emergencial de credenciais e chaves;
- preservação de logs, backups e hashes;
- ambiente isolado para análise;
- decisão humana sobre comunicação externa;
- registro simples de incidente aprovado;
- exercício antes da produção usando vazamento entre empresas como cenário principal;
- exercício anual e depois de mudança crítica.

## 28.5 Limite operacional da recuperação master

O plano de incidente ajuda a conter e documentar, mas não cria transição de credencial. A primeira versão exercita:

- o código de recuperação individual de `B01-AUT-15`;
- a contingência `B03-MST-06` quando exatamente um dos dois masters ainda está apto;
- a ausência de backdoor.

Se nenhum master estiver apto e não houver código de recuperação utilizável, nenhuma identidade de infraestrutura redefine TOTP. O desbloqueio dependerá de nova decisão funcional e nova versão dos Documentos 17 e 18.

---

# 29. Modelo de ameaças

| ID | Ameaça | Impacto | Controles principais | Evidência esperada |
|---|---|---|---|---|
| AME-01 | Força bruta ou senha reutilizada | Tomada de conta | Argon2id, senha comprometida, bloqueio, rate limit e alerta | Teste do quinto erro e carga de tentativas. |
| AME-02 | Enumeração de usuário | Descoberta de contas | Resposta neutra, tempos controlados e log protegido | Teste com e-mail existente/inexistente. |
| AME-03 | Roubo/fixação de sessão | Acesso indevido | Cookie opaco, rotação, CSP, CSRF, expiração e revogação | Teste de rotação/logout/reuso. |
| AME-04 | Reutilização de TOTP | Segundo fator contornado | Consumo atômico do intervalo, uso único e bloqueio | Repetir o mesmo código em concorrência. |
| AME-05 | Abuso de reset master | Perda de controle administrativo | Reautenticação, justificativa, contingência e auditoria | Cenários B03-MST-05 a 07. |
| AME-06 | IDOR entre CNPJs | Vazamento/alteração multiempresa | Contexto servidor, FK composta, RLS e resposta neutra | Matriz A×B em toda rota e arquivo. |
| AME-07 | Contexto vazando no pool | Consulta na empresa anterior | Transação + `SET LOCAL`, RLS default deny e teste de conexão reutilizada | Teste automatizado de pool. |
| AME-08 | Escalada por campo/mass assignment | Alteração não autorizada | DTO por comando, motor central e campos rejeitados | Enviar campo oculto/readonly. |
| AME-09 | Permissão obsoleta em aba | Leitura/commit após redução | Revisão e revogação de todas as sessões | Reduzir perfil com formulário aberto. |
| AME-10 | CSRF | Comando pela sessão da vítima | Token, origem, SameSite e interação em ação crítica | Testes cross-site. |
| AME-11 | XSS | Roubo de ação/dado | Escape, CSP, sem HTML bruto e sanitização | Payloads em todos os textos livres. |
| AME-12 | SQL injection | Leitura/alteração arbitrária | Query parametrizada e mapas fechados | SAST e testes de entrada. |
| AME-13 | Fórmula em Excel | Execução ao abrir exportação | Neutralização e tipos corretos | Células com `=`, `+`, `-`, `@`. |
| AME-14 | Download direto | Vazamento de recibo/exportação | Objeto privado, proxy autenticado, hash e no-store | URL/ID de outra empresa e permissão revogada. |
| AME-15 | Tarefa duplicada | Pagamento, número ou arquivo duplicado | Outbox, idempotência, lease e unicidade | Entrega repetida/interrupção do worker. |
| AME-16 | Sucesso parcial em lote | Inconsistência financeira | Transação única final e locks ordenados | Conflito no último participante. |
| AME-17 | Alteração da auditoria | Perda de prova | Append-only, papéis separados, checkpoint e backup | Tentativas de `UPDATE`/`DELETE` e hash divergente. |
| AME-18 | Vazamento por log | Exposição indireta | Redação central, sem corpos e testes de padrões | Varredura de logs de homologação. |
| AME-19 | Cópia/backup roubado | Exposição em massa | Cifra, domínio separado, menor privilégio e chaves protegidas | Teste de acesso e inventário. |
| AME-20 | Ransomware/exclusão | Indisponibilidade/perda | Cópia isolada, proteção contra exclusão e restauração trimestral | Exercício dentro de RPO/RTO. |
| AME-21 | Dependência comprometida | Código malicioso | Lockfile, SCA, SBOM, build imutável e revisão | Pipeline e inventário. |
| AME-22 | Insider exportando volume | Exfiltração autorizada indevidamente | Menor privilégio, escopo único, auditoria e alerta de anomalia | Teste/alerta de volume. |
| AME-23 | KMS indisponível/comprometido | Indisponibilidade ou exposição | Chaves separadas, rotação e falha fechada | Exercício de indisponibilidade/rotação. |
| AME-24 | Consulta/arquivo esgotando recurso | Negação de serviço e custo | Paginação, limites, fila, timeout e concorrência controlada | Teste de carga e quota. |
| AME-25 | Relógio/fuso incorreto | Competência, sessão ou vencimento errado | UTC, fuso explícito, relógio injetável e cenários de fronteira | Testes dia/mês/fuso. |
| AME-26 | Ambos os masters sem TOTP e sem recuperação válida | Bloqueio administrativo | Ausência de backdoor; nova decisão funcional obrigatória | Teste comprova que não há caminho técnico informal. |
| AME-27 | Requisição forjada pelo servidor para destino arbitrário | Acesso a rede/metadados internos | Destinos fixos ou permitidos; nenhuma URL de usuário é buscada; saída de rede limitada | Testes com URL local, privada, redirecionamento e DNS controlado. |

## 29.1 Riscos residuais declarados

| ID | Risco | Tratamento |
|---|---|---|
| RIS-SEG-01 | Usuário comum sem MFA e senha mínima de 10 caracteres | Mantém decisão funcional; controles compensatórios da seção 13.7; aceite explícito ao aprovar este documento. |
| RIS-INF-01 | Falha do banco pode causar indisponibilidade se não houver standby automático | Escolha de HA ou aceitação formal condicionada ao ensaio de RTO antes da produção. |
| RIS-OPS-01 | Pequena equipe pode não ter revisão humana independente em todo commit | Pipeline obrigatório e aprovação nominal de produção; teste de segurança independente antes da entrada. |
| RIS-BKP-01 | Restauração inicial é integral, não por empresa | Aceito para a primeira versão; comunicação e validação consideram todos os CNPJs. |

---

# 30. Seleção futura de fornecedores

## 30.1 Hospedagem

A marca pode ser escolhida depois, mas a comparação deve avaliar a mesma arquitetura.

| Critério | Peso sugerido | Condição mínima |
|---|---:|---|
| Segurança e identidade | 20% | MFA, contas pessoais, cofre/KMS, rede privada e logs administrativos. |
| PostgreSQL | 20% | RLS, extensões necessárias, PITR, métricas, versão suportada e restauração. |
| Backup/continuidade | 15% | RPO/RTO possíveis, cópia isolada e proteção contra exclusão. |
| Operação/observabilidade | 15% | logs, métricas, alertas, saúde, suporte e exportação de telemetria. |
| Região/localização | 10% | latência, disponibilidade regional, contrato e avaliação jurídica. |
| Portabilidade | 10% | contêiner, PostgreSQL, objetos, saída de dados e ausência de lock-in excessivo. |
| Custo total | 10% | aplicação, banco, objetos, logs, backup, tráfego, suporte e impostos. |

Itens eliminatórios:

- banco sem recursos necessários ao Documento 18;
- impossibilidade de RPO/RTO;
- objeto público obrigatório;
- ausência de MFA administrativo;
- ausência de backup exportável/restaurável;
- runtime ou banco fora de suporte;
- contrato incompatível com uso e proteção dos dados.

## 30.2 Comparação de custos

Pedir orçamento com a mesma cesta:

- duas réplicas web;
- um worker;
- PostgreSQL 2 vCPU/4 GB e 50 GB expansíveis;
- opção com e sem failover automático;
- 20 GB de objetos;
- PITR por 35 dias e cópia isolada;
- 30 dias de logs operacionais;
- e-mail de baixo volume;
- DNS/TLS/borda;
- cofre de segredos e KMS;
- registro privado de contêiner e pipeline;
- ingestão, armazenamento e consulta de logs, métricas e traces;
- verificação sintética externa;
- WAF/limites quando cobrados à parte;
- execução e armazenamento dos testes trimestrais de restauração;
- transferência e armazenamento da cópia isolada ou em outra região;
- suporte, impostos e saída do fornecedor.

Fixar preço antes de escolher região, HA, retenção e observabilidade produziria comparação enganosa.

## 30.3 E-mail

O provedor deverá oferecer:

- domínio verificado, SPF, DKIM e suporte a DMARC;
- API estável e TLS;
- webhook assinado;
- correlação e, preferencialmente, chave de idempotência/deduplicação;
- métricas de entrega, rejeição e devolução;
- contrato e tratamento adequados;
- capacidade de exportar registros;
- custo compatível com baixo volume.

Fornecedor e domínio remetente permanecem pré-produção.

## 30.4 Provedor de CEP

Escolher serviço com disponibilidade adequada e termos compatíveis. Como existe preenchimento manual, a consulta de CEP é conveniência, não dependência crítica.

---

# 31. Alternativas deliberadamente não adotadas

| Alternativa | Motivo da não adoção na primeira versão |
|---|---|
| Microsserviços | Volume pequeno; aumentaria rede, autorização, consistência e operação. |
| Kubernetes | Custo e complexidade sem necessidade de escala. |
| Banco por empresa | Dificulta clínica global, master, auditoria global, migração e restauração; RLS/FKs já atendem. |
| D1/SQLite como produção | Não materializa adequadamente todas as restrições e RLS exigidas pelo modelo aprovado. |
| JWT de longa duração no navegador | Revogação e troca de permissão ficam mais frágeis; risco de armazenamento no cliente. |
| `localStorage` para sessão/dados | Exposição a scripts e persistência indevida. |
| Fila externa desde o início | Outbox/fila PostgreSQL atende o volume com menos operação. |
| Redis/cache distribuído | Risco de permissão/dado obsoleto sem ganho necessário. |
| Elasticsearch | Busca relacional indexada é suficiente. |
| WebSocket/tempo real | Painel e sino podem atualizar periodicamente sem renovar sessão. |
| Multi-região ativa | Complexidade e custo incompatíveis com o sistema interno. |
| Arquivos binários dentro do banco | Aumenta backup e I/O; metadado e integridade ficam no banco, conteúdo em objetos. |
| URL pública ou permanente de arquivo | Enfraquece revogação e isolamento. |
| Gerar PDF dentro da transação | Aumenta lock e risco de timeout; arquivo é efeito assíncrono idempotente. |
| Usar autenticação da plataforma de protótipo | Não implementa o cadastro, TOTP, perfil, contexto e auditoria aprovados. |
| Particionar tabelas desde o primeiro dia | Volume conhecido não justifica; medir crescimento antes. |

---

# 32. Verificações obrigatórias antes da produção

## 32.1 Arquitetura e dados

- migrações criam todas as PKs, FKs compostas, `CHECK`, unicidades, exclusões e RLS do Documento 18;
- papel web não é proprietário de tabela e não possui `BYPASSRLS`;
- tabela imutável rejeita alteração/exclusão;
- dinheiro nunca usa ponto flutuante;
- competência e fuso passam pelos casos de fronteira;
- cálculo puro reproduz o caderno de cenários aprovado;
- esquema restaurado produz o mesmo manifesto de restrições.

## 32.2 Autenticação e autorização

- senha, token e TOTP nunca aparecem em log/auditoria;
- quinto erro e prazo de 15 minutos funcionam;
- primeiro acesso de 24 h e recuperação de 30 min vencem e são uso único;
- TOTP repetido é rejeitado;
- aviso aos 25 min, expiração aos 30 min e limite de 8 h são do servidor;
- os quatro estados de campo funcionam em tela, API, histórico, total e Excel;
- redução de permissão revoga todas as sessões afetadas;
- master sem autorização de incidente não infere incidente;
- payload com campo não editável é recusado por inteiro.

## 32.3 Multiempresa

- toda rota e tarefa é testada com empresas A e B;
- conexão reutilizada não conserva contexto;
- troca em outra aba impede commit;
- arquivo, exportação, total, filtro e duplicidade não vazam B;
- função global não vira consulta genérica;
- worker sem empresa falha fechado;
- clínica global não revela usos empresariais.

## 32.4 Transações e tarefas

- clique repetido não duplica nada;
- conflito em um item reverte lote inteiro;
- worker interrompido retoma sem duplicar efeito;
- mensagem entregue duas vezes gera um único resultado;
- storage indisponível depois do pagamento mantém pagamento e sinaliza arquivo;
- e-mail falho não estende token;
- fila de falhas e retentativa manual são auditáveis;
- autorização reduzida entre pedido e download bloqueia entrega.

## 32.5 Arquivos

- logo malformado, grande ou ativo é recusado;
- PDF não busca recurso remoto;
- prévia não recebe número;
- número cancelado não é reutilizado;
- hash divergente bloqueia download;
- temporário expira em 24 h;
- restauração não reabre temporário vencido;
- planilha neutraliza fórmula e respeita os campos.

## 32.6 Segurança

- modelagem de ameaça revisada;
- SAST, SCA, segredo, SBOM e contêiner passam no pipeline;
- DAST autenticado em homologação;
- teste independente ou invasão controlada antes da produção;
- zero vulnerabilidade crítica/alta sem tratamento formal;
- CSP e cookies verificados no navegador;
- CSRF, XSS, injeção, IDOR e mass assignment testados;
- logs varridos por dados proibidos;
- acesso administrativo protegido por MFA.

## 32.7 Desempenho e resiliência

- carga de 100 participantes dentro da meta;
- 10 usuários simultâneos nos fluxos principais;
- consultas/listas com histórico representativo;
- fila, PDF, Excel e recibo medidos;
- se a opção de duas réplicas/99,5% for adotada, uma réplica web pode falhar sem queda total;
- banco, storage, e-mail, CEP, KMS e worker são simulados indisponíveis;
- timeout e retentativa não produzem efeito duplicado.

## 32.8 Backup e incidente

- restauração integral em ambiente isolado dentro de RPO/RTO;
- banco, objetos, hashes, sequências, permissões e auditoria conferidos;
- e-mail real bloqueado no exercício;
- alerta de backup atrasado testado;
- cópia isolada inacessível ao operador comum;
- exercício de vazamento entre empresas concluído;
- código de recuperação individual e contingência `B03-MST-06` exercitados sem backdoor;
- responsáveis e substitutos nomeados.

---

# 33. Decisões fechadas por este documento

Após a aprovação do Documento 19, ficam vinculantes:

1. monólito modular;
2. React/TypeScript na interface e Node.js LTS/TypeScript no backend;
3. API e interface na mesma origem;
4. PostgreSQL gerenciado como fonte única;
5. RLS, FKs compostas e contexto por transação;
6. sessão opaca no servidor;
7. Argon2id e TOTP dos masters;
8. motor central de autorização por ação, objeto e campo;
9. revogação de todas as sessões dos usuários afetados por redução de acesso;
10. nenhuma autorização em cache entre requisições na primeira versão;
11. outbox e fila durável no PostgreSQL com worker separado;
12. armazenamento privado de objetos e download pela aplicação;
13. uma réplica web como mínimo, duas para atualização sem interrupção/99,5%, e um worker inicial;
14. OpenTelemetry e separação entre auditoria e log técnico;
15. RPO de uma hora, RTO de oito horas úteis e restauração integral trimestral;
16. ambientes totalmente separados;
17. artefato imutável promovido de homologação para produção;
18. ausência de microsserviços, Kubernetes, cache distribuído e busca externa;
19. protótipo visual não é automaticamente a base de autenticação ou banco da produção;
20. risco residual `RIS-SEG-01` registrado sem ampliar a primeira versão.

---

# 34. Definições que podem aguardar a preparação da produção

Não invalidam os Documentos 20 a 23 já aprovados. Devem ser resolvidas nos gates indicados pelo Documento 23 antes da produção; `D23PlanningReady = true`, mas `CutoverReady` e `ProductionGo` permanecem falsos:

1. fornecedor e região de hospedagem;
2. orçamento mensal máximo;
3. PostgreSQL com failover automático ou restauração controlada, desde que cumpra o RTO;
4. provedor, domínio e remetente de e-mail;
5. provedor de consulta de CEP;
6. ferramenta final de observabilidade;
7. meta formal de disponibilidade e horário de suporte;
8. responsáveis e substitutos por alertas, backup e incidentes;
9. responsáveis pela homologação contábil, jurídica e operacional;
10. custódia da conta de emergência da infraestrutura;
11. classificação final, prazo e acesso a IP/User-Agent, dentro da recomendação da seção 25.2;
12. retenção de snapshots/base backups, janela imutável, conta/domínio e região da cópia isolada, preservando o RPO já vinculante;
13. definição operacional exata do início e do fim da medição do RTO;
14. política de arquivamento/eliminação após o mínimo de seis anos;
15. competência inicial real;
16. data e janela de implantação;
17. parâmetros e fornecedor de `MF-01`, somente se ela for priorizada.

Versões exatas de runtime e bibliotecas serão fixadas no começo do desenvolvimento, sempre em linhas estáveis e suportadas, sem reabrir a arquitetura.

---

# 35. Critérios de aprovação deste documento

O Documento 19 pode ser aprovado quando o usuário confirmar que:

- a solução será um sistema único e modular, não vários microsserviços;
- PostgreSQL e armazenamento privado atendem o modelo aprovado;
- a sessão permanece no servidor;
- usuários afetados por redução de permissão precisarão entrar novamente;
- o processamento de PDF, Excel e e-mail pode ocorrer em segundo plano;
- pagamento confirmado não é revertido por falha posterior de PDF;
- a produção terá ambientes, chaves e dados separados;
- backup e restauração seguem RPO/RTO aprovados;
- logs técnicos não conterão dados pessoais/financeiros/clínicos detalhados;
- alerta operacional ficará fora do sino funcional;
- o risco residual dos usuários comuns sem MFA e com senha mínima de 10 caracteres está conscientemente registrado;
- fornecedor e responsáveis nominais podem ser definidos antes da produção, sem bloquear os próximos documentos.

---

# 36. Referências técnicas

As referências orientam a implementação e os testes; não substituem as regras internas aprovadas:

- [PostgreSQL — Row Security Policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html);
- [PostgreSQL — Range Types e Exclusion Constraints](https://www.postgresql.org/docs/current/rangetypes.html);
- [Node.js — linhas de lançamento e suporte](https://nodejs.org/en/about/previous-releases);
- [NestJS — documentação oficial](https://docs.nestjs.com/);
- [OpenTelemetry — documentação](https://opentelemetry.io/docs/);
- [OWASP — Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html);
- [OWASP — Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html);
- [OWASP — Cross-Site Request Forgery Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html);
- [OWASP — Multi-Tenant Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Multi_Tenant_Security_Cheat_Sheet.html);
- [OWASP — Cryptographic Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html);
- [OWASP — Application Security Verification Standard](https://owasp.org/www-project-application-security-verification-standard/).

A referência de conformidade e a versão do ASVS já estão registradas no baseline do Documento 22. As versões exatas de runtime e bibliotecas serão fixadas no início do desenvolvimento, conforme este documento, para manter a homologação reproduzível.

---

# 37. Situação consolidada e próxima etapa

Os Documentos 20, 21 e 22 e o pacote do **Documento 23 — Implantação, Migração Inicial, Operação e Retorno Seguro** estão aprovados integralmente.

Com essa aprovação, a próxima etapa autorizada é preparar o repositório e executar a `ETP-00 — Baseline executável`, respeitando os gates, dependências, critérios de entrada e estados de prontidão dos Documentos 21, 22 e 23. A preparação não implica liberação de carga real, virada ou produção: `D23PlanningReady = true`, enquanto `CutoverReady` e `ProductionGo` continuam condicionados aos respectivos gates futuros.

---

**Situação final:** Documento 19 aprovado integralmente pelo usuário.  
**Estado do programa:** Documentos 20 a 23 e respectivos anexos aprovados; a `ETP-00` é a próxima etapa autorizada. Nenhum código de produção foi iniciado.
