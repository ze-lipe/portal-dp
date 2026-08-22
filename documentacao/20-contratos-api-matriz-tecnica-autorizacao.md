# Documento 20

## Contratos de API e Matriz Técnica de Autorização

**Sistema:** Portal interno multiempresa de Departamento Pessoal  
**Versão:** 1.0 — aprovado  
**Situação:** aprovado integralmente pelo usuário em 22/08/2026  
**Data:** 21/08/2026  
**Base aprovada:** Documentos 16, 17, 18, 18A e 19; Documento Mestre 07; Fluxo Integrado 08 e Lotes 1 a 7  
**Alinhamento normativo:** em 22/08/2026, a regra já aprovada no Documento Mestre §23.3 para término MEI antes/na data do adiantamento ainda não pago foi explicitamente propagada aos contratos; não houve nova decisão funcional.  
**Sincronização técnica posterior:** `ENT-IMP-*`, `CTL-IMP-*`, guarda de `ProductionGo` e provas correlatas alinhadas ao pacote 23, aprovado integralmente pelo usuário em 22/08/2026; a aprovação anterior permanece inalterada.  

---

# 1. Finalidade

Este documento transforma as regras funcionais, o modelo lógico e a arquitetura aprovados em contratos implementáveis entre a interface, a API, o banco, o processador de tarefas e os arquivos privados. Ele define:

- padrão HTTP e versionamento da API;
- formatos de entrada, saída, erro, paginação e arquivo;
- rotas de consulta, criação, edição e comandos de estado;
- autenticação parcial, sessão, TOTP, reautenticação e troca de escopo;
- autorização por sessão, empresa, função, objeto, estado, transição e campo;
- idempotência, concorrência, confirmação humana e resposta incerta;
- auditoria, correlação e tratamento de acessos sensíveis;
- contratos assíncronos de PDF, Excel, lotes, e-mail e rotinas temporais;
- matriz de ações necessárias em cada domínio;
- requisitos de testes de contrato, isolamento e negação;
- rastreabilidade até os 440 IDs funcionais do Documento 17: 436 transições executáveis e quatro regras de projeção `ASO-R*`.

O Documento 20 não inicia o desenvolvimento e não altera cálculo, fluxo, campo ou estado já aprovado. Ele determina como esses comportamentos serão expostos e protegidos tecnicamente.

---

# 2. Autoridade, rastreabilidade e identificadores

## 2.1 Ordem de autoridade

Em caso de divergência:

1. Documento 18 e 18A, para estrutura, integridade e fontes de dados;
2. Documento 17, para estados, transições, pré-condições e correções;
3. Documento 16, para consolidação funcional e visual;
4. Documento Mestre 07;
5. Documento 19, para arquitetura, segurança, infraestrutura e operação;
6. este Documento 20, para os contratos de comunicação e a decisão técnica de autorização;
7. pacote 22/22A–22D aprovado, para casos, gates e evidências de teste.

Uma rota não cria uma nova regra de negócio. Quando uma operação HTTP representar várias transições, o serviço executa somente as transições cujas pré-condições forem verdadeiras e registra cada ID do Documento 17 aplicado.

## 2.2 Famílias de identificadores

| Prefixo | Finalidade |
|---|---|
| `API-*` | Operação ou família pública da API. |
| `OPR-*` | Intenção/caso de uso executado pela aplicação. |
| `DTO-*` | Contrato de entrada ou saída. |
| `AUTZ-*` | Política técnica de autorização. |
| `TX-*` | Perfil de transação. |
| `ERR-*` | Erro estável consumido pela interface. |
| `IDEM-*` | Perfil de idempotência. |
| `CONC-*` | Perfil de concorrência. |
| `APIAUD-*` | Perfil de auditoria e acesso sensível. |
| `JOB-*` | Contrato de tarefa assíncrona ou temporal. |
| `UIX-*` | Realização exclusivamente local da interface. |

Esses IDs não substituem `ENT-*`, `REL-*`, `RST-*`, `PRJ-*`, `EST-*`, `ARQ-*`, `SEG-*` nem os IDs das transições. A implementação e os testes citarão os dois conjuntos.

## 2.3 Cobertura exaustiva

O [Documento 20A — Matriz de Rastreabilidade API, Autorização e Transições](./20a-matriz-rastreabilidade-api-autorizacao-transicoes.md) integra este documento como anexo verificável. Ele contém exatamente uma linha para cada um dos 440 IDs funcionais do Documento 17 — 436 transições executáveis e quatro regras de projeção `ASO-R*` —, classificando cada ID como:

- chamada HTTP pública;
- comando interno decorrente de outra chamada;
- evento temporal do servidor;
- efeito assíncrono já comprometido;
- pedido assíncrono ainda autorizável;
- guarda de negação/validação; ou
- estado exclusivamente local da interface.

Não serão criados 436 endpoints nem endpoints artificiais para as quatro regras de projeção `ASO-R*`. Uma única operação bem delimitada pode orquestrar transições relacionadas dentro de uma transação, desde que a auditoria e os testes preservem os 440 IDs individuais.

---

# 3. Decisões vinculantes do contrato

| ID | Decisão | Consequência |
|---|---|---|
| API-DEC-001 | API funcional HTTP JSON sob `/api/v1`, servida na mesma origem da interface; somente sondas mínimas de saúde usam `/health/*`. | Cookie seguro, CSP, CSRF e política de origem permanecem simples; saúde não expõe contrato funcional. |
| API-DEC-002 | Rotas e campos usam português; caminhos usam `kebab-case` e JSON usa `snake_case`. | O contrato acompanha o vocabulário dos documentos e do banco. |
| API-DEC-003 | Não usar GraphQL, RPC genérico nem endpoint administrativo universal. | Cada ação sensível possui contrato, autorização e auditoria identificáveis. |
| API-DEC-004 | Rotas empresariais usam `/api/v1/empresa/...` e a empresa vem exclusivamente da sessão. | O cliente nunca escolhe `empresa_id` em uma operação empresarial. |
| API-DEC-005 | Identificadores são opacos e não sequenciais. | UUID não substitui autorização, mas reduz enumeração trivial. |
| API-DEC-006 | Alterações de estado usam comandos explícitos, não `PATCH` de campo de estado. | `fechar`, `reabrir`, `pagar`, `cancelar` e `inativar` mantêm suas pré-condições. |
| API-DEC-007 | Recursos de negócio não são excluídos fisicamente por rota comum. | Inativação, arquivamento, cancelamento e substituição preservam histórico. |
| API-DEC-008 | Dinheiro e percentuais não usam número de ponto flutuante no JSON. | Valores monetários são strings decimais com duas casas; cálculo interno usa decimal. |
| API-DEC-009 | Escritas críticas exigem chave de idempotência e versão atual. | Repetição, duplo clique e concorrência não duplicam efeitos nem sobrescrevem dados. |
| API-DEC-010 | Respostas autenticadas e arquivos usam `Cache-Control: no-store, private`. | Aba, proxy ou CDN não guarda conteúdo empresarial. |
| API-DEC-011 | Todo objeto, função e campo é autorizado no servidor em cada requisição. | Ocultar botão no navegador nunca é controle de segurança. |
| API-DEC-012 | Identificador de outro CNPJ ou escopo restrito responde de forma neutra. | A API não confirma existência de CPF, CNPJ, colaborador, recibo, exame ou incidente alheio. |
| API-DEC-013 | Operações longas usam pedido assíncrono e progresso consultável. | A sessão não fica bloqueada e a tarefa não renova inatividade. |
| API-DEC-014 | Contrato OpenAPI será gerado do código e comparado a este baseline. | Mudança incompatível não entra sem nova versão documental. |

## 3.1 Limites

Não integram a primeira versão:

- API pública para terceiros;
- webhooks externos;
- aplicativo móvel;
- integração bancária, eSocial, ponto ou importação de holerite;
- nota fiscal do MEI;
- upload de documento de ASO;
- agendamento de ASO e mensagens ao colaborador da melhoria futura `MF-01`;
- consulta agregada de dados operacionais de vários CNPJs;
- exceção individual de permissão fora dos perfis;
- edição ou exclusão direta de auditoria, pagamento ou versão histórica.

---

# 4. Estilo HTTP, mídia e versionamento

## 4.1 Origem e prefixos

| Espaço | Prefixo | Autoridade |
|---|---|---|
| Público/autenticação parcial | `/api/v1/autenticacao` | Sem sessão ou etapa parcial específica. |
| Conta própria | `/api/v1/minha-conta` | Usuário autenticado agindo sobre si. |
| Contexto | `/api/v1/contexto` | Sessão autenticada, sem confiar no navegador. |
| Empresa atual | `/api/v1/empresa` | Exatamente uma empresa fixada na sessão. |
| Global administrativo | `/api/v1/global` | Função global ou papel master conforme a ação. |
| Incidente restrito | `/api/v1/incidentes` | Autorização de incidente independente. |
| Reconciliação idempotente | `/api/v1/operacoes-idempotentes` | Consulta da própria intenção no escopo atual. |
| Saúde operacional mínima | `/health/live` e `/health/ready` | Exceção não funcional, sem sessão, dados, versão detalhada ou dependências reveladas. |
| Interno | Sem rota pública | Worker/agendador chama casos de uso internamente. |

É proibido oferecer rota empresarial no formato `/empresas/{empresa_id}/...`. A seleção inicial pode receber um identificador opaco de empresa autorizável, mas depois do sucesso a empresa fica na sessão do servidor.

## 4.2 Métodos

| Método | Uso |
|---|---|
| `GET` | Consulta sem mudança funcional. Nunca revela segredo por parâmetro de URL. |
| `POST` | Criação, pré-validação, revelação sensível ou comando explícito. |
| `PATCH` | Alteração parcial de campos editáveis de uma raiz versionada. |
| `PUT` | Substituição completa de configuração pequena ou conclusão de etapa única. |
| `DELETE` | Apenas encerramento de sessão/contexto próprio ou cancelamento técnico definido; não exclui negócio. |

Comandos usam sub-recurso verbal no plural, por exemplo `/acoes/fechamento`, `/acoes/reabertura` e `/acoes/confirmacao-pagamento`. Não se aceita `PATCH { estado: "PAGO" }`.

## 4.3 Mídia e codificação

- JSON: `application/json; charset=utf-8`;
- erros: `application/problem+json`;
- PDF: `application/pdf`;
- Excel: formato `.xlsx` com tipo de mídia oficial;
- ZIP: `application/zip`;
- todos os nomes de download vêm de metadado seguro do servidor;
- nenhuma resposta autenticada é armazenável em cache compartilhado.

## 4.4 Evolução

- `/api/v1` aceita acréscimos compatíveis e opcionais;
- remover/renomear campo, mudar significado, tornar opcional em obrigatório ou alterar estado exige `/api/v2` ou migração formal coordenada;
- campos desconhecidos em comandos de escrita são rejeitados; em leitura, a interface tolera novos campos opcionais somente quando o contrato declarar extensibilidade;
- enum desconhecido não é tratado como um enum conhecido; a interface mostra estado seguro e bloqueia comando dependente;
- o cabeçalho `Deprecation` e documentação de substituição serão usados antes de retirar contrato compatível;
- cliente e servidor do mesmo lançamento terão teste automático de compatibilidade OpenAPI.

---

# 5. Tipos canônicos e envelopes

## 5.1 Tipos JSON

| Tipo lógico | Representação | Exemplo | Regra |
|---|---|---|---|
| ID | string opaca | `"2d75..."` | Nunca CPF, CNPJ, sequência ou chave composta. |
| Data civil | `YYYY-MM-DD` | `"2026-09-15"` | Sem fuso; validada no calendário. |
| Competência | `YYYY-MM` | `"2026-09"` | Servidor normaliza para a fonte lógica aprovada. |
| Instante | RFC 3339 UTC | `"2026-08-21T22:10:30Z"` | Servidor é autoridade temporal. |
| Dinheiro | string decimal | `"3000.00"` | Exatamente duas casas na resposta; até duas na entrada antes da normalização. |
| Percentual | string decimal | `"40.0000"` | Precisão definida no DTO; nunca `0.4` implícito. |
| CPF/CNPJ/CEP | string canônica de dígitos | `"12345678901"` | Máscara é apresentação; dígitos e verificadores validados. |
| Booleano | JSON boolean | `true` | Não substitui enum com mais de dois estados. |
| Estado | código em maiúsculas | `"ABERTA"` | Catálogo fechado, sem rótulo de tela como fonte. |
| Texto | string UTF-8 | `"Comércio Exemplo"` | Normalização e limite por campo; sem HTML executável. |

Arredondamento monetário ocorre apenas quando um cálculo produz terceira casa: arredondamento decimal normal para duas casas. Não existe arredondamento de complementos para inteiro.

## 5.2 Resposta individual

```json
{
  "data": {
    "id": "identificador-opaco",
    "versao": 3
  },
  "meta": {
    "correlacao_id": "correlacao-opaca",
    "gerado_em": "2026-08-21T22:10:30Z"
  }
}
```

`meta` não contém empresa, permissão, total oculto ou diagnóstico interno. Uma resposta de criação retorna `201`, cabeçalho `Location` e representação mínima autorizada.

## 5.3 Coleção paginada

```json
{
  "data": [],
  "meta": {
    "limite": 25,
    "proximo_cursor": null,
    "ha_mais": false,
    "correlacao_id": "correlacao-opaca"
  }
}
```

Contagem total só aparece quando a própria consulta e o campo agregado forem autorizados. O cursor é opaco, assinado, ligado ao filtro, ordenação, empresa/escopo e prazo; alterá-los invalida o cursor.

## 5.4 Capacidades de interface

Consultas de detalhe podem devolver:

```json
{
  "capacidades": {
    "acoes": ["EMPREGADO.EDITAR_CADASTRO"],
    "campos": {
      "nome": "VISIVEL_E_EDITAVEL",
      "cpf": "MASCARADO"
    }
  }
}
```

Essa projeção serve apenas para montar a tela. O servidor recalcula a autorização quando a ação for executada. Recurso oculto não é listado.

---

# 6. Contrato uniforme de erros

## 6.1 Formato

Erros seguem Problem Details para HTTP APIs, com extensões estáveis:

```json
{
  "type": "https://sistema.interno/problemas/versao-desatualizada",
  "title": "O registro foi alterado por outra operação.",
  "status": 412,
  "code": "VERSAO_DESATUALIZADA",
  "detail": "Atualize os dados antes de tentar novamente.",
  "instance": "/erros/correlacao-opaca",
  "correlacao_id": "correlacao-opaca",
  "errors": []
}
```

- `code` é estável e controla a reação da interface;
- `title` e `detail` são mensagens para a pessoa e podem evoluir sem quebrar o contrato;
- `errors` pode indicar `pointer` JSON e código de validação, mas nunca valor secreto nem campo oculto ao observador;
- stack trace, SQL, nome de tabela, caminho interno, segredo e existência cruzada nunca são enviados;
- falha após commit não muda sucesso em falha de negócio; ela é reconciliada por idempotência.

## 6.2 Status HTTP

| Status | Uso normativo |
|---:|---|
| `200` | Consulta ou comando concluído com representação. |
| `201` | Recurso criado. |
| `202` | Pedido assíncrono aceito, ainda não concluído. |
| `204` | Comando concluído sem corpo. |
| `400` | JSON, cabeçalho ou parâmetro estrutural inválido. |
| `401` | Sessão ausente, expirada, revogada ou etapa de autenticação insuficiente. |
| `403` | Função conhecida pelo usuário, mas ação permitida ausente; não usar se isso revelar objeto/escopo secreto. |
| `404` | Recurso inexistente ou não revelável naquele escopo. |
| `409` | Estado de domínio incompatível, duplicidade autorizável ou conflito de idempotência. |
| `412` | `If-Match` não corresponde à versão/fingerprint atual. |
| `413` | Corpo ou logo acima do limite permitido. |
| `415` | Tipo de mídia não suportado. |
| `422` | Campos válidos em JSON, mas inconsistentes com regra de validação conhecida. |
| `428` | Pré-condição obrigatória ausente, como `If-Match` ou reautenticação. |
| `429` | Limite de tentativas/requisições atingido; usar `Retry-After` quando seguro. |
| `503` | Dependência temporariamente indisponível; não afirmar ausência de commit. |

## 6.3 Catálogo mínimo de códigos

| ID | `code` | Status usual | Comportamento |
|---|---|---:|---|
| ERR-001 | `AUTENTICACAO_NECESSARIA` | 401 | Limpa conteúdo e abre A01. |
| ERR-002 | `ETAPA_AUTENTICACAO_INCORRETA` | 401 | Mantém apenas a etapa parcial autorizada. |
| ERR-003 | `SESSAO_EXPIRADA` | 401 | Não repete comando; volta ao login. |
| ERR-004 | `SESSAO_REVOGADA` | 401 | Limpa todos os contextos e rascunhos. |
| ERR-005 | `CONTEXTO_EMPRESA_NECESSARIO` | 409 | Volta ao seletor sem carregar empresa. |
| ERR-006 | `CONTEXTO_INVALIDO` | 404 | Não confirma empresa, incidente ou objeto. |
| ERR-007 | `REAUTENTICACAO_NECESSARIA` | 428 | Abre confirmação vinculada à ação. |
| ERR-008 | `RECURSO_NAO_ENCONTRADO` | 404 | Resposta neutra inclusive entre empresas. |
| ERR-009 | `ACAO_NAO_AUTORIZADA` | 403 | Não executa nem devolve campos protegidos. |
| ERR-010 | `CAMPO_NAO_PERMITIDO` | 403 | Rejeita a requisição inteira, sem mass assignment. |
| ERR-011 | `VALIDACAO_FALHOU` | 422 | Indica somente campos reveláveis. |
| ERR-012 | `VERSAO_OBRIGATORIA` | 428 | Exige `If-Match`. |
| ERR-013 | `VERSAO_DESATUALIZADA` | 412 | Recarrega e não mescla silenciosamente. |
| ERR-014 | `ESTADO_INCOMPATIVEL` | 409 | Mostra estado atual permitido e próximo passo seguro. |
| ERR-015 | `DUPLICIDADE` | 409 | Detalhe somente dentro do escopo autorizado. |
| ERR-016 | `CHAVE_IDEMPOTENCIA_OBRIGATORIA` | 400 | Não inicia o comando. |
| ERR-017 | `CHAVE_IDEMPOTENCIA_REUTILIZADA` | 409 | Mesma chave com intenção diferente. |
| ERR-019 | `RESPOSTA_INCERTA` | 409 | Bloqueia repetição e orienta reconciliar. |
| ERR-020 | `EMPRESA_INATIVA` | 409 | Permite somente histórico autorizado. |
| ERR-021 | `PENDENCIA_IMPEDE_OPERACAO` | 409 | Resumo limitado aos dados permitidos. |
| ERR-022 | `ARQUIVO_INDISPONIVEL` | 404 | Não revela se existe em outro escopo. |
| ERR-023 | `TAREFA_FALHOU` | 409 | Mantém negócio já confirmado; oferece ação autorizada. |
| ERR-024 | `LIMITE_REQUISICOES` | 429 | Não revela chaves de controle. |
| ERR-025 | `SERVICO_TEMPORARIAMENTE_INDISPONIVEL` | 503 | Permite repetição somente após reconciliação/idempotência. |
| ERR-026 | `CONTEXTO_DESATUALIZADO` | 409 | Aba antiga não lê nem grava no novo contexto da sessão. |
| ERR-027 | `CSRF_INVALIDO` | 403 | Rejeita antes do caso de uso, com resposta neutra. |
| ERR-028 | `PREVISAO_EXPIRADA` | 409 | Exige gerar nova prévia. |
| ERR-029 | `PREVISAO_DIVERGENTE` | 412 | Versão/impacto mudou; não confirma. |
| ERR-030 | `CARGA_MUITO_GRANDE` | 413 | Não processa corpo/logo acima do limite. |
| ERR-031 | `TIPO_MIDIA_NAO_SUPORTADO` | 415 | Aceita somente mídia declarada pela rota. |
| ERR-032 | `INTEGRIDADE_ARQUIVO_FALHOU` | 409 | Bloqueia primeiro byte e gera alerta operacional. |

`202 Accepted` e pedido `EM_PROCESSAMENTO` são respostas normais de sucesso assíncrono, não Problem Details. Elas devolvem `Location`, `Retry-After` quando aplicável e o mesmo `pedido_id` idempotente.

---

# 7. Cabeçalhos, sessão e proteção da requisição

## 7.1 Cabeçalhos comuns

| Cabeçalho | Direção | Regra |
|---|---|---|
| `X-Correlation-Id` | resposta | Gerado/validado pelo servidor; entrada arbitrária nunca vira confiança. |
| `X-Context-Version` | requisição/resposta autenticada | Precondição opaca da versão do escopo atual; impede que aba antiga opere na empresa recém-selecionada. |
| `Idempotency-Key` | requisição de escrita crítica | Opaca, aleatória, nova por intenção humana. |
| `If-Match` | atualização/comando sobre versão | ETag forte da representação/aggregate autorizado. |
| `ETag` | resposta versionada | Derivado de versão/fingerprint, sem dados pessoais. |
| `X-CSRF-Token` | método não seguro | Vinculado à sessão e origem; não substitui `SameSite`. |
| `X-Reauthentication-Id` | comando com reautenticação | Referência opaca de uso único; nunca em URL. |
| `Retry-After` | 429/503/202 quando aplicável | Prazo seguro, sem confirmar existência de conta. |
| `Content-Disposition` | arquivo | Nome sanitizado pelo servidor. |

## 7.2 Cookie

A sessão usa cookie opaco com prefixo `__Host-`, `Secure`, `HttpOnly`, `Path=/`, sem `Domain` e `SameSite=Strict` quando compatível. O ID em claro não fica no banco; o servidor mantém representação protegida. Não existe “manter conectado”.

### 7.2.1 Ciclo de CSRF, origem e rotação

- `GET /api/v1/sessao` cria, quando necessário, uma sessão pública mínima e um token CSRF sem autenticar usuário;
- todo método não seguro valida simultaneamente token CSRF, cabeçalho `Origin` da mesma origem e `Content-Type` permitido;
- CORS permanece fechado à mesma origem e não aceita credenciais de origem externa;
- conclusão de login, TOTP, primeiro acesso, recuperação, troca de senha e mudança relevante de privilégio rotaciona ID de sessão e CSRF;
- a dupla anterior é invalidada no servidor antes da nova resposta;
- rotação não amplia o limite absoluto de oito horas;
- toda resposta de `/api/v1/sessao` e `/api/v1/autenticacao`, inclusive sessão restrita dos membros do bootstrap, troca de token, TOTP, recuperação e erro, usa `Cache-Control: no-store`; cache compartilhado nunca pode reutilizá-la; o comando técnico que cria o agregado inicial não é rota pública;
- falha de CSRF/origem ocorre antes do caso de uso e não revela conta, empresa ou objeto.

## 7.3 Atividade e consulta automática

Somente atividade humana explícita aprovada renova a inatividade. Polling de tarefa, contador de notificação, painel automático, aviso temporal e download em andamento não renovam a sessão. A interface chama uma operação própria para “continuar sessão” após o aviso dos 25 minutos.

Sessão, bloqueio, credencial temporária, token de recuperação, autorização curta e TOTP são comparados ao relógio do servidor em cada uso. Mesmo com agendador/worker parado, a API recusa imediatamente item vencido. O aviso de 25 minutos é projeção da interface a partir dos prazos do servidor; tarefas temporais apenas limpam/materializam registros e não são a barreira de validade.

### 7.3.1 Versão do contexto e abas antigas

- toda entrada ou saída de `SEM_EMPRESA`, `EMPRESARIAL`, `GLOBAL` ou `INCIDENTE_RESTRITO` incrementa uma versão opaca mantida na sessão;
- o servidor devolve `X-Context-Version` ao carregar/selecionar contexto;
- toda requisição autenticada dependente de contexto, inclusive leitura, envia a versão observada por aquela aba;
- versão ausente retorna 428; versão diferente retorna `CONTEXTO_DESATUALIZADO` sem executar consulta ou comando;
- o cabeçalho é apenas precondição: não contém `empresa_id` e não escolhe autoridade;
- a interface não atualiza silenciosamente abas antigas com a versão nova; a aba antiga limpa conteúdo e orienta reabrir no contexto atual;
- idempotência, reconciliação e download também validam o contexto/escopo apropriado.

Isso impede o cenário em que uma aba aberta na empresa A, depois da seleção da empresa B em outra aba, salvaria um novo registro na B usando o formulário visual da A.

## 7.4 Política de corpo e limites

- JSON comum: limite inicial de 1 MiB, normalmente muito abaixo disso;
- logo: contrato multipart específico, tipo real e dimensão validados;
- nenhuma outra rota aceita arquivo na primeira versão;
- lista de IDs em lote: limite funcional explícito, inicialmente 100 itens;
- texto livre possui tamanho e finalidade definidos no DTO;
- campos repetidos, chaves ambíguas e JSON inválido são rejeitados;
- conteúdo comprimido de entrada não é aceito inicialmente.

---

# 8. Perfis técnicos de operação

| Perfil | Semântica | Idempotência | Concorrência | Auditoria |
|---|---|---|---|---|
| `QRY` | Consulta autorizada. | Não. | Snapshot consistente; ETag quando raiz. | Somente se sensível ou exigido. |
| `PRE` | Pré-validação sem revelar duplicidade indevida. | Opcional. | Lê estado atual. | Negação relevante pode ser auditada. |
| `NEW` | Criação de raiz/versão. | `IDEM-01`. | Unicidade e lock curto quando necessário. | `APIAUD-01`. |
| `UPD` | Atualização versionada de campos. | `IDEM-01`. | `CONC-01` com `If-Match`. | Antes/depois atômico. |
| `CMD` | Transição explícita. | `IDEM-01`. | `CONC-02`; revalida antes do commit. | Transição e efeitos atômicos. |
| `CRIT` | Comando de alto impacto. | `IDEM-01`. | `CONC-02`. | Confirmação humana e auditoria crítica; reautenticação somente quando o manifesto a exigir. |
| `REVEAL` | Revelação de dado sensível. | Chave de intenção opcional. | Revalida objeto e revisão. | `APIAUD-02` obrigatório. |
| `FILE` | Download privado. | Não cria negócio. | Revalida pedido/arquivo e hash. | `APIAUD-02` obrigatório. |
| `ASYNC` | Pedido de trabalho longo. | `IDEM-02`. | Snapshot/fingerprint do pedido. | Pedido e entrega auditados. |
| `INTERNAL` | Tarefa de worker/agendador. | Chave da tarefa. | Lease + versão. | Ator técnico e transição de origem. |
| `UI` | Estado somente da interface. | Não aplicável. | Não persiste. | Não cria evento de negócio. |

## 8.1 `IDEM-01` — comando transacional

- obrigatório em criação e comando de negócio;
- não se aplica a envio de senha, TOTP ou código: cada tentativa explícita é contada e submetida ao limite de abuso;
- unicidade: ator + tipo de escopo + empresa/incidente/global + chave;
- hash usa somente a intenção canônica depois de remover campos não autorizados — e campos não autorizados causam rejeição antes do hash;
- mesma chave e mesmo hash localizam a referência do resultado anterior, revalidam sessão, revisão, escopo, objeto e campos e então constroem uma nova resposta autorizada;
- corpo JSON, PDF ou Excel antigo nunca é devolvido diretamente do registro técnico de idempotência;
- mesma chave e hash diferente retorna `CHAVE_IDEMPOTENCIA_REUTILIZADA`;
- resposta incerta é consultada pela mesma chave antes de nova tentativa.

## 8.2 `IDEM-02` — pedido assíncrono

Além de `IDEM-01`, o resultado inicial é um `pedido_id` estável. Repetir o pedido não cria segunda exportação, lote ou regeneração. Um novo pedido humano intencional usa nova chave.

## 8.3 `CONC-01` — raiz versionada

- `GET` devolve ETag forte correspondente à `versao_lock`;
- `PATCH` exige `If-Match` exatamente igual;
- versão antiga retorna 412;
- o servidor não mescla campos nem aplica “última gravação vence”.

## 8.4 `CONC-02` — comando sobre agregado

- exige ETag/fingerprint da raiz de coordenação;
- bloqueio curto protege numeração, confirmação, fechamento ou lote;
- dentro da transação, o servidor revalida sessão, revisão, empresa, estado, autorização, campos e pré-condições;
- mudança concorrente rejeita o conjunto inteiro;
- comando em lote aprovado como atômico conclui todos os itens ou nenhum.

## 8.5 `APIAUD-01` — mudança

Registra ator, sessão, escopo, empresa quando aplicável, ação, entidade, versão anterior/final, transições do Documento 17, idempotência, correlação, resultado e mudanças de campo autorizadas. Senha, token, TOTP e código nunca entram.

## 8.6 `APIAUD-02` — acesso sensível

Registra consulta, revelação, exportação ou download sensível, sem duplicar o conteúdo revelado. Abrange CPF integral quando exigido, valores financeiros, resultado de ASO, recibo, Excel, auditoria detalhada e incidente.

## 8.7 `APIAUD-SEGURANCA` — autenticação e acesso

Registra resultado sanitizado de login, bloqueio, TOTP, recuperação, sessão, reautenticação, revogação e negação relevante. Nunca registra senha, token, segredo, código, fator que falhou ou confirmação indevida da existência de conta.

## 8.8 `UIX-ESTADO-COMUM` — realização local da interface

Representa aviso, confirmação visual, descarte de rascunho, fechamento de modal, tentativa novamente e demais mudanças efêmeras que não criam fato de negócio. Não persiste estado próprio, não contorna autorização e, quando precisa reconciliar ou concluir uma intenção, usa o contrato público tipado e a `X-Context-Version` observada pela aba.

---

# 9. Algoritmo central de autorização

## 9.1 Decisão fail-closed

Toda operação, inclusive leitura, segue esta ordem:

```text
1. contrato reconhecido e entrada estruturalmente válida
2. sessão/etapa de autenticação válida
3. usuário e credenciais elegíveis
4. revisão de autorização atual
5. escopo correto
6. empresa atual autorizada, quando empresarial
7. ação explicitamente permitida
8. objeto pertencente ao escopo e alcançável
9. estado e transição compatíveis
10. campos de entrada permitidos
11. campos de saída permitidos
12. reautenticação/confirmação humana, quando exigidas
13. versão/idempotência válidas
14. para toda mutação normal global ou empresarial, ou efeito de compromisso, `ENT-IMP-04` na `authority_epoch` observada e fonte corrente `POS_GO_SISTEMA_AUTORITATIVO`; antes do `GO`, somente fundação/bootstrap e `MIGRACAO_PRE_GO` nominalmente allowlisted podem executar seus atos exatos sem efeito de compromisso; durante contingência, apenas segurança, incidente e reconciliação controlada
15. nova verificação imediatamente antes do commit ou entrega
```

Qualquer ausência nega. Identidade opaca, posse da URL, botão visível, papel master, TOTP concluído, perfil empresarial ou responsabilidade por incidente, isoladamente, nunca bastam.

## 9.2 Escopos

| Escopo | Conteúdo permitido | Conteúdo proibido |
|---|---|---|
| `PUBLICO` | Login e recuperação com resposta neutra. | Conta, empresa ou dado operacional. |
| `PRIMEIRO_ACESSO` | Definir senha definitiva. | Seletor, empresa, global e incidente. |
| `TOTP_CONFIGURACAO` | Configurar TOTP do master ou consultar apenas o próprio estado de espera do bootstrap. | Qualquer outra função ou escopo operacional. |
| `TOTP_VALIDACAO` | Validar TOTP/código de recuperação. | Qualquer dado empresarial/global. |
| `SEM_EMPRESA` | Minha conta, empresas autorizáveis e escolha de contexto. | Dados de colaborador, pagamento, ASO ou painel. |
| `EMPRESARIAL` | Uma empresa atual. | Outra empresa ou total multiempresa. |
| `GLOBAL` | Função global expressamente autorizada. | Dados operacionais empresariais combinados. |
| `INCIDENTE_RESTRITO` | Incidentes conforme autorização independente. | Empresa, salário, ASO ou usuário além do necessário. |
| `TECNICO_INTERNO` | Tarefa mínima com escopo explícito. | Simular master ou varrer empresas na mesma transação. |

## 9.3 Master

- usuários e perfis são administrados somente por master;
- master precisa concluir TOTP na sessão;
- para ler dados operacionais, master seleciona exatamente uma empresa;
- master não herda autorização de incidente;
- ações críticas de master exigem reautenticação recente de cinco minutos, vinculada à ação, alvo, versão e impacto;
- depois do consumo do bootstrap permanecem obrigatórios dois masters aptos, salvo contingência formal já aprovada; antes do consumo, os dois membros iniciais ficam sem aptidão e sem acesso operacional até o commit conjunto.

## 9.4 Mudança e revogação

- toda redução efetiva de empresa, perfil, ação, campo, papel, autorização de incidente ou situação incrementa a revisão e revoga todas as sessões do afetado, conforme `SEG-006`;
- senha, recuperação, reset de TOTP, promoção/rebaixamento, bloqueio e inativação também revogam todas as sessões;
- concessão ou aumento de permissão incrementa a revisão e passa a valer somente depois de nova avaliação completa; nenhuma decisão fica em cache entre requisições;
- perfil alterado aplica a operação e a revogação dos usuários afetados na mesma transação;
- arquivo/pedido existente continua armazenado, mas a entrega é negada se a autorização atual não bastar.

## 9.5 Negação neutra

Retorna 404 neutro quando o identificador:

- pertence a outra empresa;
- é global sem função global;
- é incidente sem autorização restrita;
- é arquivo/pedido de outro solicitante sem função adequada;
- é colaborador, MEI, recibo, ASO ou clínica não alcançável;
- permitiria inferir CPF/CNPJ/e-mail já existente fora do escopo.

403 é reservado para uma função já revelada ao usuário na qual uma ação específica não foi concedida. Negação não devolve nome, estado, proprietário, empresa nem contagem.

## 9.6 Catálogo de políticas `AUTZ-*`

| Política | Aplicação |
|---|---|
| `AUTZ-SESSAO` | Etapa de autenticação, elegibilidade, prazo, revisão e próprio usuário. |
| `AUTZ-ESCOPO` | Entrada/saída exclusiva de empresa, global ou incidente. |
| `AUTZ-EMPRESA` | Empresa da sessão, estado ativo/histórico, ação e campos empresariais. |
| `AUTZ-MASTER` | Master apto, TOTP concluído e função administrativa declarada. |
| `AUTZ-MASTER-CRITICO` | `AUTZ-MASTER` mais reautenticação, impacto e contingência. |
| `AUTZ-EMPREGADO` | Vínculo/pessoa da empresa atual, estado e campo. |
| `AUTZ-MEI` | Prestador da empresa atual e campos cadastrais. |
| `AUTZ-MEI-CONTRATO` | Contrato/vigência MEI da empresa atual, estado e campo. |
| `AUTZ-FINANCEIRO` | Competência/participante/grupo e campos financeiros próprios. |
| `AUTZ-COMPETENCIA` | Competência da empresa, estado, checklist e transição. |
| `AUTZ-PAGAMENTO` | Grupo+evento elegível, conferência, data, versão e confirmação. |
| `AUTZ-CORRECAO` | Fato pago, jornada F04, justificativa e verba isolada. |
| `AUTZ-AJUSTE` | Ajuste positivo/diferença absorvida do participante e empresa. |
| `AUTZ-RECIBO` | Tipo documental, conteúdo integral, empresa e ação atual. |
| `AUTZ-ARQUIVO` | Metadado, hash, estado, prazo e autorização do recurso tipado. |
| `AUTZ-LOTE` | Solicitante, empresa, documentos elegíveis e todos-ou-nenhum. |
| `AUTZ-DESLIGAMENTO` | Vínculo/ciclo, estado temporal, parte oficial e acerto RA separados. |
| `AUTZ-ASO` | Vínculo, acompanhamento/exame, tipo e campos informativos. |
| `AUTZ-ASO-RESULTADO` | `AUTZ-ASO` mais ação explícita de resultado e acesso sensível. |
| `AUTZ-CLINICA` | Ação global da clínica sem revelar usos de outros CNPJs. |
| `AUTZ-NOTIFICACAO` | Usuário atual e origem ainda autorizada. |
| `AUTZ-EXPORTACAO` | Origem, solicitante, filtros, colunas e autorização tripla. |
| `AUTZ-INCIDENTE-RESTRITO` | Capacidades independentes de incidente; nunca herdadas do master. |
| `AUTZ-RESPOSTA` | Serialização, máscara, ausência de cache e negação neutra. |
| `AUTZ-TRANSVERSAL` | Revalidação de sessão, revisão, escopo, objeto e campo antes do commit. |

Essas políticas agrupam verificações; não são permissões implícitas. A ação semântica correspondente do catálogo da seção 14 continua obrigatória e recurso novo nasce negado.

---

# 10. Autorização por campo e anti-mass-assignment

## 10.1 Estados

| Estado | Consulta | Escrita | Filtro/ordenação/total | Exportação/histórico |
|---|---|---|---|---|
| `OCULTO` | Não enviado. | Rejeitada. | Indisponível. | Ausente. |
| `MASCARADO` | Somente máscara produzida no servidor. | Rejeitada, salvo ação separada autorizada sobre o campo integral. | Somente operação segura prevista. | Mascarado ou ausente conforme contrato. |
| `VISIVEL_SEM_EDICAO` | Integral autorizado. | Rejeitada. | Permitido se a ação correspondente existir. | Integral somente com exportar/histórico. |
| `VISIVEL_E_EDITAVEL` | Integral autorizado. | Permitida se estado/transição também permitirem. | Permitido conforme ação. | Integral conforme ação própria. |

## 10.2 Regras cumulativas

1. O DTO de entrada é específico por comando; não se reutiliza entidade do banco.
2. Campo desconhecido, oculto, mascarado ou somente leitura enviado para escrita rejeita a requisição inteira.
3. Não se remove silenciosamente campo indevido antes de salvar.
4. Criação exige edição de todos os campos obrigatórios daquele caminho.
5. Campo mascarado recebido de volta nunca é tratado como valor integral nem como “não alterar”.
6. Erro de validação só cita campo que o observador pode conhecer.
7. Serialização de resposta ocorre depois da autorização e antes de logs/telemetria.
8. Histórico antes/depois usa a permissão atual do observador, não a permissão histórica do autor.
9. Exportação congela colunas autorizadas no pedido e revalida antes de gerar/disponibilizar.
10. Filtro e ordenação usam lista permitida; nome de coluna arbitrário nunca chega ao SQL.

## 10.3 Revelação separada

Para valores normalmente mascarados, a tela pode chamar comando específico de revelação, quando existir ação própria. A resposta:

- contém apenas o valor solicitado;
- usa `no-store`;
- expira visualmente ao sair da tela ou trocar contexto;
- é auditada como acesso sensível;
- não muda o estado permanente da permissão;
- é negada se a sessão/revisão mudar.

---

# 11. Paginação, busca, filtros e ordenação

| Regra | Definição |
|---|---|
| Paginação | Cursor opaco; padrão 25; máximo 100. |
| Ordenação | Lista fechada por recurso; sempre inclui ID opaco como desempate. |
| Busca | Texto normalizado e limitado; não busca globalmente CPF/CNPJ entre empresas. |
| Filtros | Catálogo por tela; campos ocultos são rejeitados. |
| Inativos | Fora do padrão, incluídos por filtro explícito autorizado. |
| Consistência | Cursor carrega fingerprint de consulta; mudança incompatível exige nova busca. |
| Totais | Somente agregados autorizados; nunca revelam linhas ocultas ou outra empresa. |
| Prazo | Histórico interativo H01/H02 abre em 30 dias e aceita intervalo máximo de 366 dias. |

Listas não devolvem todos os detalhes usados na tela de edição. O detalhe é carregado sob nova autorização. Autocomplete e consulta de CEP têm limite, timeout e resposta mínima.

---

# 12. Transações, prévias e confirmação humana

## 12.1 Fronteira padrão

Uma requisição mutável conclui atomicamente:

- raiz/versões de negócio;
- mudança de estado;
- revisão de autorização, quando aplicável;
- auditoria funcional e mudanças de campo;
- idempotência;
- outbox dos efeitos comprometidos;
- notificações que façam parte da mesma decisão.

Falha em qualquer parte anterior ao commit deixa todos sem alteração.

## 12.2 Prévia não é fonte

Prévia de fechamento, pagamento em lote, inativação, alteração de acesso ou correção devolve:

- `previsao_id` opaco;
- resumo autorizado do impacto;
- fingerprint das versões e itens;
- prazo curto, inicialmente dez minutos;
- ações que serão executadas;
- bloqueios detectados.

Toda prévia fica vinculada, no servidor, ao usuário, à sessão, à `X-Context-Version`, à empresa/escopo, à revisão de autorização, à ação, ao alvo, às versões e ao impacto consultado. O servidor guarda somente referência e fingerprint protegidos. O ID não concede acesso, não pode ser transferido entre usuários ou sessões e é consumido uma única vez, sob lock, na mesma transação do comando confirmado.

A confirmação envia `previsao_id`, `If-Match`, chave de idempotência e confirmação explícita. O servidor reautoriza e recalcula antes do commit; qualquer expiração, consumo anterior, mudança de vínculo, versão, permissão ou impacto invalida a prévia. Valor calculado pelo navegador nunca é autoridade.

## 12.3 Reautenticação crítica

`POST /api/v1/autenticacao/reautenticacoes` recebe credenciais adequadas e finalidade. A autorização curta:

- dura no máximo cinco minutos;
- pertence à sessão, usuário, ação, alvo, empresa/escopo, versão e impacto;
- pertence também à `X-Context-Version` e ao `previsao_id`, quando houver;
- exige senha e, para master, TOTP;
- o servidor guarda somente seu hash e devolve `reauthentication_id` opaco;
- a ação envia esse ID em `X-Reauthentication-Id` ou campo explícito do comando, nunca em URL;
- seu consumo ocorre sob lock na mesma transação do comando crítico; duas requisições concorrentes não conseguem dois commits;
- mudança de sessão, contexto, alvo, versão, impacto, prévia ou revisão invalida a prova;
- não renova o limite absoluto da sessão;
- não é enviada em URL nem reutilizada.

O endpoint de reautenticação aceita somente sessão plenamente autenticada, usa limite de abuso próprio e não se torna caminho alternativo de login.

Reautenticação não é exigida para toda operação financeira. Na primeira versão, ela se aplica às situações já aprovadas:

| Política | Situações |
|---|---|
| `REAUTH-PROPRIA` | Troca da própria senha, encerramento das outras sessões quando exigido e regeneração de códigos TOTP. |
| `REAUTH-MASTER` | Promoção/rebaixamento, reset/contingência TOTP, ações que reduzam masters, reativação crítica e mudança administrativa explicitamente marcada. |
| `REAUTH-ACESSO` | Troca/retirada de perfil ou empresa, perfil em uso/redução, migração e autorização de incidente. |
| `REAUTH-INCIDENTE` | Reabrir incidente concluído. |
| `REAUTH-EXPORTACAO-GLOBAL` | Toda criação de exportação H02; a consulta de progresso não exige nova prova e o download revalida a autorização atual. |
| `REAUTH-SEMENTE-RECIBO` | Definição única da semente anual por operador nominal, depois dos deltas finais e antes da primeira reserva interna; exige manifesto+empresa+ano em janela aberta e autorização curta `SEMENTE_RECIBO_IMPLANTACAO`. |
| `SEM_REAUTH` | Pagamento, cálculo, conferência, fechamento comum, cadastro, ASO e demais operações sem indicação expressa; continuam exigindo sessão, permissão, versão, idempotência e confirmação humana. |

## 12.4 Pagamento e recibo

A confirmação financeira sempre grava o pagamento e a auditoria na mesma transação. Somente tipo documental aprovado e valor positivo cria também recibo lógico, snapshot e número nessa transação. Grupo oficial, K06, rescisão oficial, diferença absorvida e valor zero não reservam número, não criam snapshot e não publicam `JOB-001`. Quando houver recibo, a geração física do PDF pode ocorrer depois; falha do PDF não desfaz pagamento. Recibo definitivo nunca recebe prévia como número real.

---

# 13. Operações assíncronas, arquivos e downloads

## 13.1 Estado do pedido

```text
ACEITO -> EM_PROCESSAMENTO -> CONCLUIDO
                         \-> FALHOU
CONCLUIDO -> EXPIRADO, somente para temporários
```

O estado técnico do pedido não substitui o estado funcional do recibo, pagamento, competência ou exportação.

## 13.2 Contrato público

- pedido retorna `202`, `Location` e o ID do recurso tipado, como exportação ou lote documental;
- o progresso é consultado no próprio recurso: `GET /exportacoes/{id}`, `GET /lotes-documentais/{id}` ou `GET /recibos/{id}`;
- polling automático não renova sessão;
- cancelamento só existe antes do efeito e quando o tipo declarar cancelável;
- falha definitiva não permite “tentar de novo” com a mesma intenção sem reconciliação;
- novo disparo humano autorizado usa nova chave, justificativa quando exigida e nova operação.

Não existe central ou endpoint genérico de jobs para usuários. Exportações continuam acessíveis a partir da tela que as solicitou, como aprovado.

## 13.3 Autoridade do worker

| Classe | Exemplos | Regra |
|---|---|---|
| `EFEITO_COMPROMETIDO` | PDF de recibo, convite já emitido, notificação do commit. | Executa com identidade técnica sobre snapshot confirmado; revogação posterior não desfaz negócio. |
| `PEDIDO_AUTORIZAVEL` | Excel, ZIP, lote, regeneração. | Revalida solicitante, empresa/escopo, ação, campos e revisão antes de gerar e disponibilizar. |
| `ROTINA_SISTEMA` | Expiração, alerta de ASO, reconciliação. | Uma empresa por tarefa/transação; identidade técnica mínima. |

`X-Context-Version` é precondição de requisições, reconciliações e downloads, não credencial do worker. A tarefa persiste empresa/escopo, autoridade mínima e snapshot necessários. `EFEITO_COMPROMETIDO` continua após troca de contexto, logout ou expiração de sessão porque apenas materializa decisão já confirmada. `PEDIDO_AUTORIZAVEL` revalida usuário, revisão, ação, campos e pertencimento, mas não exige que o navegador ainda esteja com aquela empresa selecionada; a disponibilização e o download continuam condicionados ao contexto e à autorização atuais.

## 13.4 Arquivo privado

- storage não é público;
- download passa por `/api/v1` e revalida autorização atual;
- hash, tamanho, tipo, estado e pertencimento são conferidos antes do primeiro byte;
- URL permanente ou assinada entregue ao navegador é proibida na primeira versão;
- rotas de download usam `Content-Disposition: attachment`; visualização de PDF, logo e prévia tipada podem usar `inline`;
- todo arquivo usa MIME fechado e confirmado, `X-Content-Type-Options: nosniff` e `Cache-Control: no-store, private`;
- autorização/auditoria exigível é confirmada antes de enviar o primeiro byte;
- logo só pode ser exibido por rota autenticada ou incorporado a snapshot autorizado;
- temporários de Excel/PDF consolidado/ZIP expiram em 24 horas;
- recibo definitivo segue sua retenção e versões; não é eliminado pela expiração da sessão.

Prévia síncrona e visualização inline usam o mesmo renderizador documental isolado dos definitivos: processo/diretório exclusivo, limites de CPU, memória, tamanho e tempo e nenhuma saída de rede durante a renderização. A API pode aguardar esse processo por até a meta aprovada; ela nunca renderiza HTML/PDF dentro do processo web privilegiado.

---

# 14. Catálogo de ações de autorização

O catálogo abaixo é vinculante em conceito. Os códigos poderão ser detalhados em migração sem mudar sua semântica.

## 14.1 Empresarial

| Família | Ações principais |
|---|---|
| Painel | `PAINEL.VER`. |
| Empresa | `EMPRESA.VER_CONFIGURACAO`, `EMPRESA.EDITAR_CONFIGURACAO`, `EMPRESA.EDITAR_LOGO`, `EMPRESA.INATIVAR`, `EMPRESA.EXPORTAR_HISTORICO`. |
| Empregado | `EMPREGADO.LISTAR`, `EMPREGADO.CRIAR`, `EMPREGADO.RECONTRATAR`, `EMPREGADO.VER`, `EMPREGADO.EDITAR_CADASTRO`, `EMPREGADO.EDITAR_ENDERECO`, `EMPREGADO.VER_FINANCEIRO`, `EMPREGADO.EDITAR_FINANCEIRO`, `EMPREGADO.VER_HISTORICO`, `EMPREGADO.EXPORTAR`. |
| MEI | `MEI.LISTAR`, `MEI.CRIAR`, `MEI.VER`, `MEI.EDITAR`, `MEI.GERIR_CONTRATO`, `MEI.RENOVAR_CONTRATO`, `MEI.VER_FINANCEIRO`, `MEI.VER_HISTORICO`, `MEI.EXPORTAR`. |
| Competência | `COMPETENCIA.LISTAR`, `COMPETENCIA.CRIAR`, `COMPETENCIA.VER`, `COMPETENCIA.CALCULAR`, `COMPETENCIA.CONFERIR`, `COMPETENCIA.FECHAR`, `COMPETENCIA.REABRIR`, `COMPETENCIA.EXPORTAR`. |
| Financeiro | `FINANCEIRO.INFORMAR_LIQUIDO`, `FINANCEIRO.LANCAR_COMPLEMENTO`, `FINANCEIRO.INFORMAR_REEMBOLSO`, `FINANCEIRO.CONFERIR_GRUPO`, `PAGAMENTO.CONFIRMAR`, `PAGAMENTO.CONFIRMAR_LOTE`, `PAGAMENTO.CANCELAR_CONFIRMACAO`, `CORRECAO.INICIAR`, `CORRECAO.CONCLUIR`, `AJUSTE.CONFIRMAR`. |
| Recibo | `RECIBO.LISTAR`, `RECIBO.VER`, `RECIBO.BAIXAR`, `RECIBO.REGENERAR_ARQUIVO`, `RECIBO.CANCELAR`, `RECIBO.SUBSTITUIR`, `RECIBO.GERAR_LOTE`, `RECIBO.CONFIGURAR_SEMENTE_INICIAL` — esta última não é atribuível por perfil comum: só operador nominal com capacidade efêmera do manifesto/empresa/ano durante a janela controlada. |
| Desligamento | `DESLIGAMENTO.LISTAR`, `DESLIGAMENTO.REGISTRAR`, `DESLIGAMENTO.EDITAR`, `DESLIGAMENTO.CANCELAR_PROGRAMACAO`, `DESLIGAMENTO.VER_ACERTO`, `DESLIGAMENTO.CONFIRMAR_ACERTO`. |
| ASO | `ASO.LISTAR`, `ASO.ACOMPANHAR`, `ASO.REGISTRAR_EXAME`, `ASO.RETIFICAR_EXAME`, `ASO.VER_RESULTADO`, `ASO.REGISTRAR_NAO_COMPARECIMENTO`, `ASO.RESOLVER_PENDENCIA`, `ASO.EXPORTAR`. |
| Notificação | `NOTIFICACAO.LISTAR`, `NOTIFICACAO.MARCAR_LIDA`, `NOTIFICACAO.ABRIR_ORIGEM`. |
| Auditoria | `AUDITORIA_EMPRESARIAL.LISTAR`, `AUDITORIA_EMPRESARIAL.VER_DETALHE`, `AUDITORIA_EMPRESARIAL.EXPORTAR`. |

## 14.2 Global e master

| Família | Ações principais |
|---|---|
| Empresa global | `EMPRESA_GLOBAL.LISTAR`, `EMPRESA_GLOBAL.CRIAR`, `EMPRESA_GLOBAL.ENTRAR`, `EMPRESA_GLOBAL.VER_HISTORICO`. |
| Clínica global | `CLINICA.LISTAR`, `CLINICA.CRIAR`, `CLINICA.EDITAR`, `CLINICA.INATIVAR`, `CLINICA.REATIVAR`, `CLINICA.EXPORTAR`. |
| Usuário | `USUARIO.LISTAR`, `USUARIO.CONVIDAR`, `USUARIO.VER`, `USUARIO.EDITAR_IDENTIDADE`, `USUARIO.ASSOCIAR_EMPRESA`, `USUARIO.TROCAR_PERFIL`, `USUARIO.REMOVER_EMPRESA`, `USUARIO.BLOQUEAR`, `USUARIO.INATIVAR`, `USUARIO.REATIVAR`. |
| Master | `MASTER.CONVIDAR`, `MASTER.PROMOVER`, `MASTER.REBAIXAR`, `MASTER.RESETAR_TOTP`, `MASTER.CONCLUIR_CONTINGENCIA`. |
| Perfil | `PERFIL.LISTAR`, `PERFIL.CRIAR`, `PERFIL.VER`, `PERFIL.EDITAR_MATRIZ`, `PERFIL.COPIAR`, `PERFIL.ARQUIVAR`, `PERFIL.MIGRAR_ASSOCIACOES`. |
| Autorização global | `ACESSO_GLOBAL.ATRIBUIR`, `ACESSO_GLOBAL.TROCAR`, `ACESSO_GLOBAL.RETIRAR`. |
| Incidente ACL | `ACESSO_INCIDENTE.CONCEDER`, `ACESSO_INCIDENTE.ALTERAR`, `ACESSO_INCIDENTE.REVOGAR`. |
| Auditoria global | `AUDITORIA_GLOBAL.LISTAR`, `AUDITORIA_GLOBAL.VER_DETALHE`, `AUDITORIA_GLOBAL.EXPORTAR`; exclusiva de master. |

Usuários, perfis, matrizes e ações master permanecem exclusivos do master. Cadastrar empresa pode ser concedido a usuário comum por perfil global específico.

## 14.3 Incidente restrito

| Capacidade independente | Ações |
|---|---|
| Registrar | `INCIDENTE.REGISTRAR`. |
| Consultar | `INCIDENTE.LISTAR`, `INCIDENTE.VER`. |
| Acompanhar | `INCIDENTE.ADICIONAR_ENTRADA`, `INCIDENTE.ATUALIZAR_CHECKLIST`. |
| Concluir/reabrir | `INCIDENTE.CONCLUIR`, `INCIDENTE.REABRIR`. |

Essas capacidades são cumulativas somente conforme o modelo aprovado: acompanhar exige consultar; concluir/reabrir exige consultar e acompanhar. Master não as recebe automaticamente.

---

# 15. Catálogo HTTP — acesso, conta e contexto

As rotas das tabelas já incluem o prefixo `/api/v1`. `QRY`, `NEW`, `UPD`, `CMD`, `CRIT`, `REVEAL`, `FILE` e `ASYNC` referem-se aos perfis da seção 8.

## 15.1 Autenticação e sessão

| ID | Método e rota | Finalidade/telas | Perfil e autorização |
|---|---|---|---|
| API-AUT-001 | `GET /api/v1/sessao` | Estado mínimo da sessão, CSRF, aviso/expiração e `X-Context-Version` para A01–A10. | Público ou sessão existente; nunca traz dados empresariais. |
| API-AUT-002 | `POST /api/v1/autenticacao/sessoes` | Login; realiza o resultado compatível de B01-AUT-01 a B01-AUT-06. | `DTO-AUT-001`; público; limite de abuso; resposta neutra; membro de bootstrap aberto nunca recebe sessão operacional e pode obter somente estado restrito. |
| API-AUT-002A | `POST /api/v1/autenticacao/primeiro-acesso/trocas-token` | Validar credencial do link e criar sessão restrita de curta duração. | Token no corpo; B01-AUT-04; resposta manda limpar a URL. |
| API-AUT-003 | `PUT /api/v1/autenticacao/primeiro-acesso/senha` | Definir senha definitiva em A02. | Somente `PRIMEIRO_ACESSO`; B01-AUT-08/09. |
| API-AUT-004 | `POST /api/v1/autenticacao/recuperacoes-senha` | Solicitar link de 30 minutos em A05. | Público; sempre resposta equivalente; B01-AUT-10/10A. |
| API-AUT-004A | `POST /api/v1/autenticacao/recuperacoes-senha/trocas-token` | Trocar token do link por sessão restrita de recuperação. | Token no corpo, uso único; URL é limpa antes de A06. |
| API-AUT-005 | `PUT /api/v1/autenticacao/recuperacoes-senha` | Definir nova senha sem reenviar o token original. | Sessão restrita vigente; B01-AUT-11/12. |
| API-AUT-006 | `POST /api/v1/autenticacao/totp/desafios-configuracao` | Criar desafio e URI `otpauth` para Google Authenticator. | Somente `TOTP_CONFIGURACAO`; segredo mostrado uma vez. |
| API-AUT-007 | `GET /api/v1/autenticacao/totp/desafios-configuracao/qr-code` | Imagem privada do desafio corrente. | Mesma sessão restrita; `no-store`; sem URL pública. |
| API-AUT-008 | `PUT /api/v1/autenticacao/totp/configuracao` | Confirmar TOTP, mostrar nova série uma vez, encerrar sessão restrita e exigir novo login; no bootstrap, deixar o primeiro membro apenas pronto e fazer o commit conjunto quando o segundo ficar pronto. | Master em A03; B01-AUT-13 e, conforme a origem, B03-MST-02 ou B03-MST-07 na mesma transação; ramo técnico de BK-033 nunca concede aptidão individual antecipada. |
| API-AUT-009 | `POST /api/v1/autenticacao/totp/verificacoes` | Segundo fator do master em A04. | `TOTP_VALIDACAO`; B01-AUT-14/16/16A; exige `master_apto`, inclusive consumo/ativação conjunta para membro inicial. |
| API-AUT-010 | `POST /api/v1/autenticacao/totp/codigos-recuperacao/verificacoes` | Consumir código de recuperação. | `TOTP_VALIDACAO`; B01-AUT-15/16/16A. |
| API-AUT-010A | `POST /api/v1/autenticacao/totp/reconfiguracoes/sessoes` | Master em redefinição autentica e entra exclusivamente em A03. | Senha válida e autorização curta vigente; B01-AUT-17. |
| API-AUT-011 | `POST /api/v1/sessao/continuacoes` | Ação humana “Continuar sessão”. | Sessão em aviso; B01-AUT-19. |
| API-AUT-012 | `DELETE /api/v1/sessao` | Sair. | Próprio usuário; B01-AUT-21; 204. |
| API-AUT-013 | `POST /api/v1/autenticacao/reautenticacoes` | Criar autorização curta de cinco minutos para ação crítica. | Sessão atual; senha e TOTP do master quando aplicável. |
| API-AUT-014 | `POST /api/v1/operacoes-idempotentes/reconciliacoes` | Reconciliar resposta perdida pela chave enviada no cabeçalho. | Próprio ator e escopo atual; nunca retorna snapshot não mais autorizado. |

Todos os métodos não seguros, inclusive login, exigem token contra CSRF emitido pelo servidor. Senha, TOTP, token e código não entram em log, auditoria ou hash genérico de payload.

Links de primeiro acesso e recuperação pousam em página do próprio domínio, sem scripts de terceiros e com `Referrer-Policy: no-referrer`. A interface extrai a credencial do fragmento/entrada protegida, envia-a uma única vez no corpo da operação de troca e imediatamente usa URL limpa por substituição de histórico. O backend devolve apenas sessão restrita `HttpOnly`; proxy, aplicação, telemetria e analytics redigem a rota. A senha definitiva é enviada somente depois, sem repetir o token original.

### 15.1.1 `CTL-BST-001` — bootstrap master pelo plano de controle

`CTL-BST-001` é um comando técnico de implantação, não uma rota `/api/v1`, uma capacidade concedida a usuário ou uma conta de emergência. Ele só existe antes do consumo do singleton `bootstrap_master_inicial`, em produção fechada, e exige executor pessoal nominal de Segurança ou Operação, autorização de implantação assinada, revisão separada, canal administrativo com autenticação forte, allowlist temporal e intenção idempotente com hash dos dois nomes/e-mails distintos. Nenhum segredo de primeiro acesso, senha ou TOTP integra a intenção, o log ou a evidência.

Sob `TX-003`, a primeira intenção válida bloqueia a chave singleton da instalação e cria todos ou nenhum destes elementos: o agregado `ABERTO`, exatamente dois usuários master, os dois membros em `PENDENTE_PRIMEIRO_ACESSO`, suas credenciais temporárias próprias e os pedidos de entrega allowlisted. Invocações concorrentes serializam na mesma chave: uma única intenção confirma; uma intenção diferente recebe conflito, e a repetição exata de uma resposta incerta apenas reconcilia o resultado já persistido, sem executar outra criação.

Cada titular usa `API-AUT-002A`, `API-AUT-003` e `API-AUT-006–008` em sessão restrita. No ramo de BK-033, `API-AUT-008`:

1. configura somente a credencial e a recuperação do próprio titular;
2. muda seu membro de `PENDENTE_PRIMEIRO_ACESSO` para `PRONTO_AGUARDANDO_PAR`;
3. mantém `master_apto = false` e encerra a sessão restrita quando o par ainda não estiver pronto;
4. quando o par já estiver pronto, bloqueia o agregado e os dois usuários, revalida ambos e, no mesmo commit, marca os dois `ATIVADO_CONJUNTAMENTE`, consome o agregado, incrementa as revisões e revoga todas as sessões parciais;
5. exige novo login após o commit para qualquer acesso operacional.

Falha injetada antes desse commit integral ativa zero masters e preserva o último estado confirmado. Duas configurações simultâneas possuem um único finalizador, sem sessão operacional intermediária. Depois de `CONSUMIDO`, `CTL-BST-001` é recusado inclusive em replay, a credencial técnica/allowlist expira e nenhuma rota, conta, senha ou mecanismo de reabertura permanece na aplicação; a evidência append-only continua consultável pelo procedimento de implantação. Esse ramo técnico implementa `BK-033` sem criar ou reatribuir ID funcional da matriz dos 440 IDs funcionais.

## 15.2 Minha conta

| ID | Método e rota | Finalidade | Perfil e autorização |
|---|---|---|---|
| API-CONTA-001 | `GET /api/v1/minha-conta` | Nome, e-mail, segurança e estados próprios em A09. | `QRY`; alvo é o usuário da sessão. |
| API-CONTA-003 | `PUT /api/v1/minha-conta/senha` | Trocar senha e revogar todas as sessões. | `CRIT`; senha atual, TOTP se master; B01-AUT-25. |
| API-CONTA-004 | `GET /api/v1/minha-conta/sessoes` | Listar sessões próprias com metadados mínimos. | `QRY`; sem ID reutilizável de cookie. |
| API-CONTA-005 | `POST /api/v1/minha-conta/sessoes/encerramento-das-outras` | Encerrar todas as outras sessões. | `CRIT`; reautenticação; B01-AUT-22. |
| API-CONTA-006 | `POST /api/v1/minha-conta/codigos-recuperacao-totp/regeneracoes` | Regenerar série e mostrar uma única vez. | Master; senha+TOTP recentes; B01-AUT-26. |

Se a resposta única com códigos se perder, ela não é reproduzida por idempotência. O master entra novamente e solicita outra série, invalidando a anterior.

Minha Conta não permite alterar nome ou e-mail na primeira versão. Esses campos são administrados pelo master em U02; A09 oferece consulta, troca de senha, sessões e códigos de recuperação.

## 15.3 Seleção e troca de escopo

| ID | Método e rota | Finalidade | Perfil e autorização |
|---|---|---|---|
| API-CTX-001 | `GET /api/v1/contexto/empresas-selecionaveis` | Lista mínima de empresas ativas e históricas autorizadas em A07. | Sessão `SEM_EMPRESA`; master ou associação atual. |
| API-CTX-002 | `PUT /api/v1/contexto/empresa` | Fixar uma empresa ativa/histórica na sessão. | `DTO-CTX-001`; recebe somente ID opaco candidato; B02-CTX-01 a 03. |
| API-CTX-003 | `DELETE /api/v1/contexto` | Sair da empresa/global/incidente e limpar contexto. | Sessão válida; B02-CTX-04/07/11A. |
| API-CTX-004 | `PUT /api/v1/contexto/global` | Entrar explicitamente em função global. | Master ou perfil global atual; B02-CTX-08/09/11B. |
| API-CTX-005 | `PUT /api/v1/contexto/incidentes` | Entrar em escopo restrito de incidentes. | Autorização de incidente vigente; B02-CTX-10/11. |
| API-CTX-006 | `GET /api/v1/contexto/capacidades/{tela_codigo}` | Projeção mínima de ações/campos da tela. | Escopo atual; não concede e não inclui ocultos. |

Rascunho não salvo é estado local: a interface pergunta se deseja descartar antes de chamar `DELETE /contexto`. O servidor não recebe nem persiste o conteúdo descartado. Uma aba com contexto anterior recebe 404/409 neutro e limpa a tela.

---

# 16. Catálogo HTTP — empresa, painel e administração global de empresas

## 16.1 Empresa e painel

| ID | Método e rota | Tela/finalidade | Ação e perfil |
|---|---|---|---|
| API-EMPRESA-001 | `GET /api/v1/empresa` | Cadastro da empresa atual em A10. | `QRY`; `EMPRESA.VER_CONFIGURACAO`; campos autorizados. |
| API-EMPRESA-002 | `PATCH /api/v1/empresa/cadastro` | Editar razão social, nome, endereço e demais campos editáveis. | `UPD`; `EMPRESA.EDITAR_CONFIGURACAO`; `If-Match`. |
| API-EMPRESA-003 | `GET /api/v1/empresa/configuracoes` | Padrões versionados, incluindo percentual padrão. | `QRY`; empresa atual. |
| API-EMPRESA-004 | `PATCH /api/v1/empresa/configuracoes` | Criar nova versão dos padrões futuros. | `UPD`; campos próprios; recibos emitidos não mudam. |
| API-EMPRESA-005 | `PUT /api/v1/empresa/logo` | Validar e criar versão de logo. | `UPD`; multipart específico, máximo inicial 2 MiB, PNG/JPEG real. |
| API-EMPRESA-006 | `GET /api/v1/empresa/logo` | Exibir logo privado atual. | `QRY/FILE`; sem metadados desnecessários. |
| API-EMPRESA-007 | `POST /api/v1/empresa/acoes/inativacao/previas` | Mostrar pendências e impacto. | `PRE`; `EMPRESA.INATIVAR`. |
| API-EMPRESA-008 | `POST /api/v1/empresa/acoes/inativacao` | Inativar em modo histórico ou negar por pendência. | `CRIT`; B02-EMP-05/06; prévia e versão. |
| API-PAINEL-001 | `GET /api/v1/empresa/painel` | P01, agregados da empresa selecionada. | `QRY`; `PAINEL.VER`; sem dados multiempresa. |

O backend decodifica e recodifica o logo, remove metadados, confirma MIME, calcula hash e só então grava a versão. Não há upload direto ao armazenamento.

## 16.2 Funções globais de empresa

| ID | Método e rota | Finalidade | Ação e perfil |
|---|---|---|---|
| API-GEMP-001 | `GET /api/v1/global/empresas` | Listar empresas administráveis, não dados operacionais. | `EMPRESA_GLOBAL.LISTAR`. |
| API-GEMP-002 | `GET /api/v1/global/modelos-perfil-empresarial` | Modelos permitidos para nova empresa. | Necessário ao cadastro em A08. |
| API-GEMP-003 | `POST /api/v1/global/empresas/prevalidacoes-cnpj` | Validar CNPJ sem inferência indevida. | `PRE`; função global de cadastro. |
| API-GEMP-004 | `POST /api/v1/global/empresas` | Criar empresa, configurações, cópia independente do modelo e logo opcional. | `NEW`; `DTO-GEMP-001`; `EMPRESA_GLOBAL.CRIAR`; B02-EMP-01/02. |
| API-GEMP-005 | `GET /api/v1/global/empresas/{id}` | Metadados administrativos autorizados. | `QRY`; não inclui colaboradores/pagamentos. |

`API-GEMP-004` aceita `application/json` quando não houver logo ou `multipart/form-data` com a parte JSON `dados` (`DTO-GEMP-001`) e a parte binária opcional `logo`. O arquivo passa pela mesma validação, recodificação, remoção de metadados, limite de 2 MiB e armazenamento privado de `API-EMPRESA-005`; não existe upload direto nem empresa parcialmente criada por falha do logo. A empresa, sua configuração inicial, a cópia independente da versão escolhida do modelo, os acessos obrigatórios e a referência da eventual versão de logo formam o único resultado comprometido.

Os masters aptos mantêm o acesso global aprovado à nova empresa. Quando o criador for usuário comum com `EMPRESA_GLOBAL.CRIAR`, a transação também o associa à nova empresa com exatamente o perfil empresarial copiado do modelo selecionado; falha nessa associação reverte toda a criação.

O corpo da criação indica `destino_pos_criacao: "SELETOR" | "ENTRAR"`. Essa indicação é intenção de navegação, não troca de escopo dentro da transação. `ENTRAR` só cria o novo contexto empresarial depois do commit, mediante a mesma revalidação de `API-CTX-002`; se essa revalidação falhar, a empresa permanece criada e a resposta orienta retorno ao seletor. O CNPJ duplicado recebe mensagem neutra quando a existência não puder ser revelada.

---

# 17. Catálogo HTTP — colaboradores empregados

## 17.1 Lista, cadastro e vínculo

| ID | Método e rota | Tela/finalidade | Ação/perfil |
|---|---|---|---|
| API-COL-001 | `GET /api/v1/empresa/colaboradores` | C01; lista discriminada `EMPREGADO`/`MEI`. | `EMPREGADO.LISTAR` e/ou `MEI.LISTAR`; cada linha usa projeção própria. |
| API-COL-002 | `POST /api/v1/empresa/colaboradores/exportacoes` | Excel da lista com filtros atuais. | `ASYNC`; ações de exportar e colunas autorizadas. |
| API-EMP-001 | `POST /api/v1/empresa/empregados/prevalidacoes-cpf` | C02; classifica novo, recontratável ou impedido dentro da empresa. | `PRE`; CPF no corpo, nunca na URL. |
| API-EMP-002 | `POST /api/v1/empresa/empregados` | Criar pessoa+endereço+vínculo ou recontratação. | `NEW`; `DTO-EMP-001`; B04-VIN-01/02/03; CPF e datas válidos. |
| API-EMP-003 | `GET /api/v1/empresa/empregados/{vinculo_id}` | C03; visão geral autorizada. | `QRY`; `EMPREGADO.VER`; objeto da empresa atual. |
| API-EMP-004 | `PATCH /api/v1/empresa/empregados/{id}/pessoa` | Editar nome e campos pessoais aprovados. | `UPD`; `EMPREGADO.EDITAR_CADASTRO`. |
| API-EMP-005 | `PATCH /api/v1/empresa/empregados/{id}/endereco` | Editar endereço, com CEP obrigatório no cadastro. | `UPD`; `EMPREGADO.EDITAR_ENDERECO`. |
| API-EMP-006 | `POST /api/v1/empresa/empregados/{id}/acoes/correcao-cpf` | Corrigir CPF de forma auditada. | `CRIT`; versão, justificativa e unicidade; B04-VIN-05. |
| API-EMP-007 | `PATCH /api/v1/empresa/empregados/{id}/vinculo` | Alterar datas e atributos ainda editáveis. | `UPD`; B04-VIN-07/07A/08/09; não muda estado pago. |

CPF igual só permite recontratação quando o vínculo anterior estiver encerrado/inativo conforme as regras aprovadas. A API nunca cria segunda pessoa ativa para contornar a validação.

## 17.2 Visões contextuais

| ID | Método e rota | Tela | Fonte |
|---|---|---|---|
| API-EMP-008 | `GET /api/v1/empresa/empregados/{id}/competencias` | C05 | Exige cumulativamente `EMPREGADO.VER` e `EMPREGADO.VER_FINANCEIRO`; campos financeiros atuais. |
| API-EMP-009 | `GET /api/v1/empresa/empregados/{id}/asos` | C06 | Exige `EMPREGADO.VER` e `ASO.LISTAR/ACOMPANHAR`; resultado só com `ASO.VER_RESULTADO`. |
| API-EMP-010 | `GET /api/v1/empresa/empregados/{id}/recibos` | C07 | Exige `EMPREGADO.VER`, `RECIBO.LISTAR` e campos/conteúdo documental permitidos. |
| API-EMP-011 | `GET /api/v1/empresa/empregados/{id}/historico` | C08 | Exige `EMPREGADO.VER_HISTORICO` mais ação/campo atual de cada evento. |

Essas rotas não duplicam fontes. Pagamento, ASO, recibo e auditoria mantêm suas entidades; o colaborador apenas oferece filtro contextual.

## 17.3 Condições financeiras do empregado

| ID | Método e rota | Finalidade | Ação/perfil |
|---|---|---|---|
| API-FINEMP-001 | `GET /api/v1/empresa/empregados/{id}/condicoes-financeiras` | C04; vigências e projeção do total acordado. | `EMPREGADO.VER_FINANCEIRO`; total derivado e não editável. |
| API-FINEMP-002 | `POST /api/v1/empresa/empregados/{id}/salarios-base` | Criar versão inicial/futura/vigente do salário do holerite. | `NEW/CMD`; B06-FIN-01/02. |
| API-FINEMP-003 | `POST /api/v1/empresa/empregados/{id}/salarios-base/{condicao_id}/acoes/correcao` | Corrigir vigência/valor retroativo sem calcular diferença oficial. | `CRIT`; B06-FIN-03; F04 quando houver impacto interno pago. |
| API-FINEMP-004 | `POST /api/v1/empresa/empregados/{vinculo_id}/excecoes-adiantamento` | Criar/alterar percentual individual. | `NEW/CMD`; B06-FIN-04/06. |
| API-FINEMP-005 | `POST /api/v1/empresa/empregados/{vinculo_id}/excecoes-adiantamento/{excecao_id}/acoes/encerramento` | Programar fim e retorno ao padrão. | `CMD`; B06-FIN-05. |
| API-FINEMP-006 | `POST /api/v1/empresa/empregados/{vinculo_id}/remuneracoes-adicionais` | Criar nova versão da RA. | `NEW/CMD`; `DTO-FIN-001`; B06-RA-01/02/06. |
| API-FINEMP-007 | `POST /api/v1/empresa/empregados/{vinculo_id}/remuneracoes-adicionais/{ra_id}/acoes/correcao` | Corrigir condição atingida por pagamento. | `CRIT`; B06-RA-03; nunca compensa outra verba. |
| API-FINEMP-008 | `POST /api/v1/empresa/empregados/{vinculo_id}/remuneracoes-adicionais/{ra_id}/acoes/encerramento` | Programar última competência devida. | `CMD`; B06-RA-04. |
| API-FINEMP-009 | `POST /api/v1/empresa/empregados/{vinculo_id}/salarios-redondos` | Marcar/alterar vigência do lembrete de reembolso real. | `CMD`; B06-REB-01/02/02A; não calcula impostos. |
| API-FINEMP-010 | `POST /api/v1/empresa/empregados/{vinculo_id}/complementos-recorrentes` | Criar/alterar complemento fixo recorrente. | `NEW/CMD`; B06-CMP-01/02. |
| API-FINEMP-011 | `POST /api/v1/empresa/empregados/{vinculo_id}/complementos-recorrentes/{complemento_id}/acoes/correcao` | Corrigir efeito já pago/fechado. | `CRIT`; B06-CMP-03; conduz a F04. |
| API-FINEMP-012 | `POST /api/v1/empresa/empregados/{vinculo_id}/complementos-recorrentes/{complemento_id}/acoes/encerramento` | Definir última competência inclusiva. | `CMD`; B06-CMP-04. |
| API-FINEMP-013 | `POST /api/v1/empresa/empregados/{vinculo_id}/bases-periodo-sem-registro` | Informar/alterar base mensal própria e forma de pagamento. | `NEW/CMD`; `DTO-FIN-002`; B06-PSR-01/03/07/08. |

O salário-base é o valor oficial do holerite. A remuneração adicional é o valor acordado fora do holerite. `salario_total_acordado = salario_base + remuneracao_adicional` é projeção somente leitura. RA começa na data de início das atividades na primeira competência e salário-base atualizado não gera diferença automática, pois essa diferença já vem no líquido do contador.

---

# 18. Catálogo HTTP — prestador MEI e contratos

## 18.1 Cadastro e contrato

| ID | Método e rota | Tela/finalidade | Ação/perfil |
|---|---|---|---|
| API-MEI-001 | `POST /api/v1/empresa/prestadores-mei/prevalidacoes-cnpj` | M01; verificar CNPJ no escopo empresarial. | `PRE`; resposta mínima. |
| API-MEI-002 | `POST /api/v1/empresa/prestadores-mei` | Criar prestador, endereço obrigatório e primeiro contrato. | `NEW`; `DTO-MEI-001`; B05-MEI-01/02/03; transação única. |
| API-MEI-003 | `GET /api/v1/empresa/prestadores-mei/{id}` | M02; cadastro e contrato atual. | `QRY`; `MEI.VER`. |
| API-MEI-004 | `PATCH /api/v1/empresa/prestadores-mei/{id}/cadastro` | Razão social, fantasia, telefone/e-mail opcionais e endereço. | `UPD`; B05-MEI-04. |
| API-MEI-005 | `POST /api/v1/empresa/prestadores-mei/{id}/acoes/correcao-cnpj` | Corrigir CNPJ versionado. | `CRIT`; B05-MEI-05. |
| API-MEI-006 | `GET /api/v1/empresa/contratos-mei/{id}` | M03; contrato, vigências e renovações. | `QRY`; `MEI.GERIR_CONTRATO`. |
| API-MEI-007 | `POST /api/v1/empresa/contratos-mei/{id}/acoes/renovacao` | Renovar antes do fim, sem esperar encerrar. | `CMD`; B05-CON-02/03/04; sem sobreposição. |
| API-MEI-008 | `POST /api/v1/empresa/contratos-mei/{id}/vigencias-financeiras` | Nova vigência de valor/forma. | `NEW/CMD`; B05-CON-09/10. |
| API-MEI-009 | `POST /api/v1/empresa/contratos-mei/{id}/acoes/correcao` | Corrigir datas/condições preservando versões. | `CRIT`; B05-CON-06B/06C/06D/11. |
| API-MEI-010 | `POST /api/v1/empresa/contratos-mei/{id}/acoes/encerramento` | Registrar/programar fim. | `CMD`; B05-CON-06/06A. |
| API-MEI-011 | `POST /api/v1/empresa/prestadores-mei/{id}/contratos` | Criar retorno após interrupção efetiva. | `NEW`; B05-CON-07/08. |

Contrato renovado mantém a mesma identidade quando não houver interrupção. Um novo vínculo contratual só nasce depois de interrupção real. Não há salário por fora, RA, complemento recorrente ou nota fiscal no MEI.

## 18.2 Visões financeiras, recibos e histórico

| ID | Método e rota | Tela | Fonte |
|---|---|---|---|
| API-MEI-012 | `GET /api/v1/empresa/contratos-mei/{id}/competencias` | M04 | Exige `MEI.VER` e `MEI.VER_FINANCEIRO`; campos atuais. |
| API-MEI-013 | `GET /api/v1/empresa/contratos-mei/{id}/competencias/{competencia_id}` | M04 | Mesmas ações, base mensal, D30 e serviço adicional autorizado. |
| API-MEI-014 | `GET /api/v1/empresa/prestadores-mei/{id}/recibos` | M05 | Exige `MEI.VER`, `RECIBO.LISTAR` e conteúdo documental permitido. |
| API-MEI-015 | `GET /api/v1/empresa/prestadores-mei/{id}/historico` | M06 | Exige `MEI.VER_HISTORICO` mais ação/campo atual de cada evento. |

O serviço adicional do MEI é lançado somente na competência e vai integralmente ao pagamento final. O corte de adiantamento é o mesmo do empregado: início no dia 15 ou antes pode receber; início no dia 16 ou depois recebe somente no final.

---

# 19. Catálogo HTTP — competências, cálculos e pagamentos

## 19.1 Competência e participantes

| ID | Método e rota | Tela/finalidade | Ação/perfil |
|---|---|---|---|
| API-CPT-001 | `GET /api/v1/empresa/competencias` | K01; lista por período/estado. | `COMPETENCIA.LISTAR`; cursor. |
| API-CPT-002 | `POST /api/v1/empresa/competencias` | K02; criar competência mensal única. | `NEW`; `COMPETENCIA.CRIAR`; K07-01/02. |
| API-CPT-003 | `GET /api/v1/empresa/competencias/{id}` | K03; resumo, estados oficiais e indicador de pagamentos. | `COMPETENCIA.VER`; ETag do agregado. |
| API-CPT-004 | `GET /api/v1/empresa/competencias/{id}/checklist-fechamento` | Checklist normativo atual. | `QRY`; não é estado editável. |
| API-CPT-005 | `POST /api/v1/empresa/competencias/{id}/acoes/atualizacao-participantes` | Incluir/atualizar elegíveis da empresa. | `CMD`; K07-03/04 e G08-01. |
| API-CPT-006 | `POST /api/v1/empresa/competencias/{id}/acoes/calculo` | Calcular/recalcular até 100 participantes. | `CMD`; G08-02/03/04/06; síncrono na meta de 5 s. |
| API-CPT-007 | `POST /api/v1/empresa/competencias/{id}/acoes/fechamento/previas` | Exibir checklist, impacto e blockers. | `PRE`; `COMPETENCIA.FECHAR`. |
| API-CPT-008 | `POST /api/v1/empresa/competencias/{id}/acoes/fechamento` | Fechar somente depois dos pagamentos exigidos. | `CRIT`; K07-08/09/11; prévia+ETag. |
| API-CPT-009 | `POST /api/v1/empresa/competencias/{id}/acoes/reabertura` | Reabrir com permissão específica. | `CRIT`; K07-10; justificativa e versão. |
| API-CPT-010 | `GET /api/v1/empresa/competencias/{id}/participantes` | K04; visão coletiva. | `QRY`; campos financeiros autorizados. |
| API-CPT-011 | `GET /api/v1/empresa/competencias/{id}/participantes/{participante_id}` | K05; memória e lançamentos do participante. | `QRY`; objeto da competência/empresa. |
| API-CPT-012 | `POST /api/v1/empresa/competencias/{id}/exportacoes` | Excel geral da competência/pagamentos. | `ASYNC`; `COMPETENCIA.EXPORTAR`; snapshot de filtros/colunas. |

O indicador “em pagamentos” não é um terceiro estado da competência. A situação de adiantamento, pagamento final e cada grupo/evento permanece separada. O fechamento acontece depois da conclusão dos eventos exigidos, não antes.

## 19.2 Líquido do contador e saldo inicial

| ID | Método e rota | Finalidade | Ação/perfil |
|---|---|---|---|
| API-K06-001 | `GET /api/v1/empresa/competencias/{id}/liquidos-contador` | K06; digitação individual rápida. | `QRY`; `FINANCEIRO.INFORMAR_LIQUIDO`. |
| API-K06-002 | `PUT /api/v1/empresa/competencias/{id}/liquidos-contador/{participante_id}` | Informar/substituir líquido que já desconta o adiantamento oficial. | `UPD`; `DTO-K06-001`; P09-01/01A/02/03; `If-Match`. |
| API-K07-001 | `GET /api/v1/empresa/competencias/{id}/saldos-iniciais` | K07; apenas competência real de corte. | `QRY`; ação específica. |
| API-K07-002 | `POST /api/v1/empresa/competencias/{id}/saldos-iniciais` | Registrar saldo de implantação confirmado. | `NEW`; P09-14/15. |
| API-K07-003 | `POST /api/v1/empresa/saldos-iniciais/{id}/acoes/correcao` | Corrigir saldo inicial preservando origem. | `CRIT`; P09-14A. |

O líquido do contador não inclui RA nem complementos e é digitado colaborador por colaborador. Não há importação de planilha ou armazenamento do holerite.

Na competência inicial, vínculo/contrato ativo no snapshot pode chegar encerrado somente quando o delta registrar um encerramento real entre o snapshot e o congelamento final. Complementos recorrentes vigentes, complementos avulsos de empregado e serviços adicionais MEI já conhecidos e ainda não pagos usam `API-LAN-*`, cálculo, conferência e pagamento normais. Componente já pago não é recriado por essas rotas: entra exclusivamente por `API-K07-*`, com sua data e origem, e não gera recibo retroativo.

## 19.3 Lançamentos de competência

| ID | Método e rota | Finalidade | Ação/perfil |
|---|---|---|---|
| API-LAN-001 | `POST /api/v1/empresa/competencias/{id}/participantes/{participante_id}/complementos-avulsos` | Vários complementos exclusivos da competência. | `NEW`; B06-CMP-05/06/07. |
| API-LAN-002 | `PATCH /api/v1/empresa/competencias/{id}/participantes/{participante_id}/complementos-avulsos/{item_id}` | Corrigir avulso ainda não pago. | `UPD`; pago conduz a F04. |
| API-LAN-003 | `POST /api/v1/empresa/competencias/{id}/participantes/{participante_id}/servicos-adicionais-mei` | Serviço extra MEI, somente pagamento final. | `NEW`; `DTO-MEI-002`; contrato MEI vigente. |
| API-LAN-004 | `PUT /api/v1/empresa/competencias/{id}/participantes/{participante_id}/reembolsos/{evento}` | Informar valores reais ou confirmar zero. | `UPD/CMD`; B06-REB-03/04/04A/04B. |
| API-LAN-005 | `POST /api/v1/empresa/competencias/{id}/participantes/{participante_id}/reembolsos/{evento}/acoes/reabertura` | Voltar para pendente antes do pagamento. | `CMD`; B06-REB-04C. |
| API-LAN-006 | `POST /api/v1/empresa/competencias/{id}/participantes/{participante_id}/periodo-sem-registro/acoes/calculo` | Calcular linha D30 da competência. | `CMD`; B06-PSR-02/05/06/07/08. |
| API-LAN-007 | `PATCH /api/v1/empresa/competencias/{id}/participantes/{participante_id}/servicos-adicionais-mei/{item_id}` | Corrigir serviço extra MEI antes do pagamento final. | `UPD`; `DTO-MEI-002`; `If-Match`; recalcula e exige nova conferência. |

Reembolso real pode existir no adiantamento e no final. O sistema não preenche INSS, IR ou sindicato automaticamente; registra somente os valores reais informados, conforme a decisão posterior de deixar o cálculo tributário de lado.

`API-LAN-007` é permitido somente enquanto o grupo MEI do pagamento final ainda não estiver pago. A correção cria versão do item, invalida cálculo/conferência anteriores e recalcula o grupo; não sobrescreve memória histórica. Depois do pagamento, essa rota responde `ERR-014`/`ESTADO_INCOMPATIVEL`, com o próximo passo seguro `INICIAR_CORRECAO_FINANCEIRA`, e a alteração passa obrigatoriamente pela jornada F04 de `API-COR-001`, vinculada ao item e ao grupo pagos. F04 preserva pagamento e recibo, apura ajuste positivo ou diferença absorvida e nunca cria cobrança negativa ao prestador.

## 19.4 Grupos e conferência

| ID | Método e rota | Tela/finalidade | Ação/perfil |
|---|---|---|---|
| API-GRP-001 | `GET /api/v1/empresa/competencias/{id}/grupos-financeiros` | F01; abas de adiantamento/final e filtros por grupo/estado. | `QRY`; somente grupos autorizados. |
| API-GRP-002 | `GET /api/v1/empresa/grupos-financeiros/{id}` | F02; componentes, memória e conferência. | `QRY`; campo e objeto. |
| API-GRP-003 | `POST /api/v1/empresa/grupos-financeiros/{id}/acoes/calculo` | Recalcular um grupo aberto, inclusive redirecionamento terminal da base MEI. | `CMD`; G08-02/03/04/06; memória registra datas, pagamento efetivo e destino. |
| API-GRP-004 | `POST /api/v1/empresa/grupos-financeiros/{id}/ajustes-manuais` | Editar valor permitido preservando cálculo automático e motivo. | `NEW/CMD`; G08-04A; nunca sobrescreve fonte automática. |
| API-GRP-005 | `POST /api/v1/empresa/grupos-financeiros/{id}/acoes/conferencia` | Conferir grupo calculado. | `CMD`; G08-05. |
| API-GRP-006 | `POST /api/v1/empresa/grupos-financeiros/{id}/acoes/nao-aplicabilidade` | Confirmar grupo não aplicável quando permitido, inclusive adiantamento MEI calculado em zero pela regra terminal. | `CMD`; G08-07; não cria pagamento nem recibo. |
| API-GRP-007 | `POST /api/v1/empresa/grupos-financeiros/{id}/acoes/reversao-nao-aplicabilidade` | Reabrir classificação antes de pagamento/fechamento. | `CMD`; G08-08/08A. |

Os três grupos do empregado permanecem financeiramente independentes:

1. oficial do holerite;
2. RA e reembolso real;
3. complementos.

O período sem registro possui grupo/recibo próprio. O MEI possui base contratual e eventual serviço adicional conforme o catálogo aprovado. A interface pode apresentar tudo na mesma competência sem misturar confirmações.

No MEI, se `fim_aplicavel <= data_prevista_adiantamento` e ainda não existe pagamento efetivo da base no adiantamento, `API-GRP-003` deve calcular o adiantamento devido como zero e encaminhar atomicamente toda a base proporcional ao grupo final. `API-GRP-006` resolve o grupo zero como não aplicável. Prévia ou confirmação de pagamento desse adiantamento responde `ERR-014`/`ESTADO_INCOMPATIVEL`, sem pagamento, numeração ou recibo; o fluxo nunca usa `CANCELADO_POR_DESLIGAMENTO`.

## 19.5 Confirmação individual e em lote

| ID | Método e rota | Finalidade | Ação/perfil |
|---|---|---|---|
| API-PAG-001 | `POST /api/v1/empresa/grupos-financeiros/{id}/acoes/confirmacao-pagamento/previas` | Mostrar valor, evento, data e, somente quando aplicável, recibo decorrente. | `PRE`; `PAGAMENTO.CONFIRMAR`. |
| API-PAG-002 | `POST /api/v1/empresa/grupos-financeiros/{id}/acoes/confirmacao-pagamento` | Confirmar exatamente um grupo+evento, sem parcelamento interno. | `CRIT`; P09-05/07–13/16 e G08-10; recibo condicional ao tipo; efeitos atômicos. |
| API-PAG-003 | `POST /api/v1/empresa/competencias/{id}/acoes/confirmacao-pagamento-em-lote/previas` | Validar conjunto homogêneo. | `PRE`; `DTO-PAG-003`; `PAGAMENTO.CONFIRMAR_LOTE`. |
| API-PAG-004 | `POST /api/v1/empresa/competencias/{id}/acoes/confirmacao-pagamento-em-lote` | Confirmar todos ou nenhum. | `CRIT`; `DTO-PAG-004`; P09-06; candidato congelado na prévia. |

### Contrato do lote

O lote usa dois contratos diferentes por finalidade e nunca os mistura: `DTO-PAG-003` cria a prévia com evento, data e itens; `DTO-PAG-004` confirma somente o candidato congelado por `previsao_id`. Competência vem da rota. O comando final não repete nem pode alterar grupo, evento, data, itens, valores ou ETags.

- máximo inicial de 100 itens;
- mesmo CNPJ, competência, grupo, evento e data;
- cada item elegível e conferido;
- uma falha cancela o lote inteiro;
- não se usa `207 Multi-Status` nem sucesso parcial;
- cada pagamento/recibo recebe seu próprio número e auditoria, ligados por correlação de lote.

## 19.6 Datas e corte de adiantamento

- o adiantamento é um evento da competência e registra a data real de pagamento, normalmente dia 20, 21 ou 22;
- o pagamento final registra a data real, normalmente dia 5 ou 6 do mês seguinte;
- datas usuais são sugestões, não validação rígida de calendário;
- empregado ou MEI com início das atividades/contrato no dia 15 ou antes pode ter adiantamento proporcional;
- início no dia 16 ou depois recebe somente no pagamento final;
- na última competência MEI, fim aplicável antes ou na data prevista do adiantamento ainda não pago prevalece sobre o corte de entrada: o adiantamento devido é zero, toda a base proporcional segue ao final e nenhum recibo de adiantamento é emitido;
- desligamento antes do adiantamento ou decisão de cancelá-lo segue o fluxo próprio do desligamento;
- todo cálculo de mensalista/MEI proporcional usa divisor comercial 30, independentemente de o mês ter 28, 29, 30 ou 31 dias.

---

# 20. Catálogo HTTP — correções, ajustes, desligamentos e recibos

## 20.1 Correção financeira e ajustes

| ID | Método e rota | Tela/finalidade | Ação/perfil |
|---|---|---|---|
| API-COR-001 | `POST /api/v1/empresa/grupos-financeiros/{id}/correcoes-financeiras` | F04; iniciar correção guiada de uma verba paga. | `NEW`; `DTO-COR-001`; `CORRECAO.INICIAR`; C10-01. |
| API-COR-002 | `GET /api/v1/empresa/correcoes-financeiras/{id}` | Ver jornada, versões e impacto. | `QRY`; objeto empresarial. |
| API-COR-003 | `PATCH /api/v1/empresa/correcoes-financeiras/{id}` | Alterar motivo/memória ainda editável. | `UPD`; não altera pagamento confirmado. |
| API-COR-004 | `POST /api/v1/empresa/correcoes-financeiras/{id}/acoes/cancelamento-confirmacao` | Cancelar confirmação com justificativa e preservar versões. | `CRIT`; C10-04/05, G08-12. |
| API-COR-005 | `POST /api/v1/empresa/correcoes-financeiras/{id}/acoes/apuracao` | Apurar saldo positivo ou excedente absorvido por verba. | `CMD`; C10-06 a C10-10. |
| API-COR-006 | `POST /api/v1/empresa/correcoes-financeiras/{id}/acoes/reconfirmacao` | Confirmar versão substituta quando cabível. | `CRIT`; C10-11/11A/12. |
| API-COR-007 | `POST /api/v1/empresa/correcoes-financeiras/{id}/acoes/conclusao` | Encerrar jornada somente sem pendências. | `CRIT`; C10-13/18/18A/19. |
| API-AJU-001 | `GET /api/v1/empresa/competencias/{id}/ajustes-financeiros` | F05; positivos e absorvidos. | `QRY`; campos autorizados. |
| API-AJU-002 | `POST /api/v1/empresa/ajustes-positivos/{id}/acoes/confirmacao-pagamento` | Pagar ajuste positivo e gerar recibo correspondente. | `CRIT`; P10-02/03. |
| API-AJU-003 | `POST /api/v1/empresa/ajustes-positivos/{id}/acoes/correcao` | Corrigir ajuste ainda não consolidado. | `CMD`; P10-04. |
| API-AJU-004 | `GET /api/v1/empresa/diferencas-absorvidas/{id}` | Ver erro favorável preservado para o colaborador. | `QRY`; N10-02; nunca cria cobrança negativa. |

Depois de pagamento real, a correção padrão cancela controladamente a confirmação, exige justificativa, substitui recibos quando necessário e preserva todas as versões. Não existe ajuste negativo automático para recuperar erro da empresa.

## 20.2 Desligamento

| ID | Método e rota | Tela/finalidade | Ação/perfil |
|---|---|---|---|
| API-DES-001 | `GET /api/v1/empresa/desligamentos` | D01 dentro de Colaboradores. | `DESLIGAMENTO.LISTAR`; filtros de saída/situação. |
| API-DES-002 | `POST /api/v1/empresa/empregados/{vinculo_id}/desligamentos` | Registrar ou programar desligamento e criar/ligar acompanhamento demissional. | `NEW`; `DTO-DES-001`; D12-01/02/08/14/15 e ASO-A02/A03 na mesma transação. |
| API-DES-003 | `GET /api/v1/empresa/desligamentos/{id}` | D03; fonte cadastral e financeira. | `QRY`; campos por permissão. |
| API-DES-004 | `POST /api/v1/empresa/desligamentos/{id}/acoes/correcao` | Corrigir data/aviso preservando versões. | `CRIT`; D12-07/07A. |
| API-DES-005 | `POST /api/v1/empresa/desligamentos/{id}/acoes/cancelamento` | Cancelar programação/registro e reconciliar acompanhamento demissional. | `CRIT`; D12-05/06/07A/08A–08C e ASO-A10/A10A/A10B quando aplicáveis. |
| API-DES-006 | `PUT /api/v1/empresa/desligamentos/{id}/decisao-adiantamento` | Cancelar/manter/tratar adiantamento conforme data e pagamento. | `CMD`; D12-10 a D12-13A. |
| API-DES-007 | `PUT /api/v1/empresa/desligamentos/{id}/rescisao-oficial` | Informar valor do contador separado. | `UPD`; `DTO-DES-002`; D12-17/18/18A. |
| API-DES-008 | `POST /api/v1/empresa/desligamentos/{id}/rescisao-oficial/acoes/confirmacao-pagamento` | Registrar pagamento oficial sem recibo interno. | `CRIT`; D12-19. |
| API-DES-009 | `POST /api/v1/empresa/desligamentos/{id}/acerto-ra/acoes/calculo` | Calcular exclusivamente a RA vigente e proporcional devida. | `CMD`; `DTO-DES-003`; D12-20; divisor 30. |
| API-DES-010 | `POST /api/v1/empresa/desligamentos/{id}/acerto-ra/acoes/conferencia` | Conferir memória e aviso trabalhado/indenizado. | `CMD`; `DTO-DES-004`; D12-21. |
| API-DES-011 | `POST /api/v1/empresa/desligamentos/{id}/acerto-ra/acoes/confirmacao-pagamento` | Pagar acerto complementar positivo e gerar recibo. | `CRIT`; D12-22. |
| API-DES-012 | `GET /api/v1/empresa/desligamentos/{id}/reconciliacao-cancelamento` | Mostrar impactos pendentes de um cancelamento. | `QRY`; D12-08A–08C. |

O motivo amplo do desligamento não é obrigatório. Quando aplicável, `tipo_aviso` aceita somente `TRABALHADO` ou `INDENIZADO`; quando não aplicável, o campo fica ausente/nulo. Férias vencidas são uma pergunta para o cálculo do acerto de RA; não cria módulo de férias. Complementos e reembolso não entram no cálculo do acerto complementar.

Se o adiantamento de RA já foi efetivamente pago, o acerto calcula somente o saldo proporcional ainda devido. Se o valor já pago cobrir ou exceder a RA proporcional, a RA a pagar é zero; não se cria cobrança negativa.

## 20.3 Recibos e arquivos

| ID | Método e rota | Tela/finalidade | Ação/perfil |
|---|---|---|---|
| API-REC-001 | `GET /api/v1/empresa/competencias/{id}/recibos` | R01; lista documental da competência. | `RECIBO.LISTAR`. |
| API-REC-002 | `GET /api/v1/empresa/recibos/{id}` | R02; snapshot, cadeia, estado e arquivo. | `RECIBO.VER`; `DTO-REC-001`; ETag documental. |
| API-REC-003 | `GET /api/v1/empresa/recibos/{id}/versoes` | Cadeia preservada de cancelados/substitutos. | `RECIBO.VER`; R11-07. |
| API-REC-004 | `POST /api/v1/empresa/grupos-financeiros/{id}/previas-recibo` | PDF sem número e com marca d'água “PRÉVIA”. | `PRE`; `AUTZ-RECIBO`; exige acesso integral a todos os campos obrigatórios do documento e registra `APIAUD-02`; renderizador isolado; `no-store`; R11-01. |
| API-REC-005 | `POST /api/v1/empresa/recibos/{id}/acoes/reimpressao` | Registrar reimpressão do mesmo definitivo. | `CMD`; R11-03; não cria novo número. |
| API-REC-006 | `POST /api/v1/empresa/recibos/{id}/arquivo/acoes/regeneracao` | Gerar arquivo físico do mesmo snapshot. | `ASYNC`; A11-03/03A; sem mudar conteúdo semântico. |
| API-REC-007 | `GET /api/v1/empresa/recibos/{id}/arquivo/visualizacao` | Abrir PDF inline. | `FILE`; autorização integral e acesso auditado. |
| API-REC-008 | `GET /api/v1/empresa/recibos/{id}/arquivo/download` | Baixar PDF. | `FILE`; autorização integral e acesso auditado. |
| API-REC-009 | `POST /api/v1/empresa/recibos/sequencias/{ano}/acoes/semente-inicial` | Carga controlada pós-delta; fixar o maior número externo final do ano, sem criar recibo. | `CRIT`; operador nominal; `RECIBO.CONFIGURAR_SEMENTE_INICIAL`; `REAUTH-SEMENTE-RECIBO`; manifesto/janela/capacidade efêmera exatos; `If-None-Match: *`, chave idempotente e auditoria. |
| API-LOT-001 | `POST /api/v1/empresa/competencias/{id}/lotes-documentais` | R03; pedir PDF consolidado ou ZIP. | `ASYNC`; `DTO-DOC-001`; L11-01–03. |
| API-LOT-002 | `GET /api/v1/empresa/lotes-documentais/{id}` | Acompanhar o próprio lote. | `QRY`; solicitante, empresa e ação atuais. |
| API-LOT-003 | `GET /api/v1/empresa/lotes-documentais/{id}/arquivo` | Baixar temporário pronto. | `FILE`; L11-05; expira em 24 h. |
| API-LOT-004 | `POST /api/v1/empresa/lotes-documentais/{id}/acoes/nova-solicitacao` | Criar novo pedido após falha/expiração autorizada. | `ASYNC`; L11-08; nova chave. |

Cancelamento e substituição de recibo são efeitos da correção financeira, não botões de alteração livre. O número é sequencial por empresa e ano; prévia nunca consome número.

`API-REC-009` recebe `manifesto_carga_id`, `manifesto_carga_empresa_ano_id`, `autorizacao_curta_id`, `maior_numero_externo_reservado` inteiro não negativo, `origem` do catálogo de implantação, `referencia_origem` e `justificativa`. O servidor deriva a empresa do contexto e exige que `ENT-IMP-01/02`, rota `{ano}`, empresa, valor final, autorização curta, usuário e sessão coincidam exatamente; o manifesto precisa estar em `DELTAS_APLICADOS`, dentro da janela, com fonte congelada e `ledger_conteudo_versao/hash`, e a entrada precisa estar em `FINAL_APROVADO`. `RECIBO.CONFIGURAR_SEMENTE_INICIAL` e a autorização curta não podem ser concedidos pela administração normal de perfis.

O servidor rejeita sem efeito ano futuro/fora do manifesto, janela fechada, estado do manifesto/entrada divergente, `ledger_conteudo_versao/hash` diferente, autorização vencida/consumida/revogada, delta pendente, recibo ou reserva interna já existente, valor regressivo, colisão, raiz com semente incompatível ou divergência de contexto/reautenticação/precondição. Semente versus semente, fechamento/revogação versus semente e semente versus primeira emissão seguem a ordem de locks guarda global `ENT-IMP-04` → manifesto → entradas empresa+ano ordenadas → autorizações ordenadas → guarda/raiz empresa+ano ordenada, mesmo antes de existir a raiz; no máximo uma intenção confirma, e a primeira emissão interna reserva exatamente `semente + 1`. O commit `TX-002` inclui, todos ou nenhum: `ENT-IMP-02`, guarda/raiz `ENT-REC-01`, consumo de `ENT-AUT-12`, idempotência e auditoria; muda a entrada para `SEMENTE_PERSISTIDA` e promove o manifesto para `SEMENTES_RESOLVIDAS` quando todas as entradas estiverem resolvidas, sem pagamento, recibo, snapshot, arquivo ou outbox. Repetir a mesma intenção/chave pelo mesmo ator autorizado pode recuperar o resultado original, mesmo após o consumo, antes de avaliar a precondição, mas nunca cria novo efeito; nova chave depois do commit ou depois do fechamento é rejeitada. `GO`, `NO-GO`, encerramento da reconciliação ou expiração revogam todas as autorizações restantes. Delta posterior torna a tentativa inelegível: não terminal fecha em `FECHADO_NO_GO`; já reconciliada recebe `ENT-IMP-05` por `CTL-IMP-004(INVALIDAR_GO)`, sem reterminalização. Mudança do maior número externo final ou da prova de ausência depois do commit imutável exige nova carga sobre baseline limpo.

Se a conciliação pós-delta comprovar ausência de numeração anterior naquele ano, `ENT-IMP-02` registra `SEM_NUMERACAO_ANTERIOR` por declaração dupla, `API-REC-009` não é chamado, nenhuma autorização curta é necessária e a primeira emissão inicia no padrão da série. Ausência presumida ou campo vazio não substitui essa decisão registrada. Em nova tentativa posterior a `NO-GO`, uma semente já persistida e ainda sem emissão interna só pode ser classificada como `SEMENTE_EXISTENTE_VERIFICADA` quando o candidato final for idêntico; não se emite nova capacidade nem se chama a API. Divergência que exija outra semente força baseline limpo.

Toda reserva normal de recibo consulta `ENT-IMP-04`, captura `authority_epoch` e exige fonte corrente `POS_GO_SISTEMA_AUTORITATIVO`. Para empresa+ano do escopo inicial, a primeira reserva exige adicionalmente manifesto exato `FECHADO_RECONCILIADO`, `go_elegivel = true`, ausência de `ENT-IMP-05`, `production_go_id` write-once e entrada em `SEMENTE_PERSISTIDA`, `SEM_NUMERACAO_ANTERIOR` ou `SEMENTE_EXISTENTE_VERIFICADA`; ausência cria a sequência no padrão somente nessa primeira emissão. O primeiro comando legítimo grava `primeira_faixa_estado = PENDENTE_RECONCILIACAO`, limites/hash/correlação, época e manifesto no mesmo commit da faixa. Enquanto pendente, a próxima reserva da empresa+ano responde `ERR-014/ESTADO_INCOMPATIVEL`, detalhe seguro `PRIMEIRA_FAIXA_PENDENTE`, sem consumir número. Manifesto reconciliado sem `GO`, inelegibilidade/`NO-GO`, manifesto diferente/supersedido, estado intermediário ou autoridade anterior também falham sem número. Anos/empresas posteriores dispensam apenas a prova do manifesto inicial: funcionam normalmente enquanto o sistema é a fonte corrente, são negados durante `[T_RET,T_REENT)` e retomam somente após a troca em `T_REENT`.

### 20.3.1 `CTL-IMP-001–004` — autoridade do manifesto pelo plano de controle

Estes comandos técnicos não são rotas `/api/v1`, permissões de perfil, telas administrativas comuns nem credenciais permanentes. Eles operam sob `TX-003`, por canal administrativo forte, com identidade pessoal, revisão separada, idempotência, auditoria append-only e menor privilégio temporal. Acesso às telas na produção fechada exige simultaneamente permissão normal e `ENT-AUT-12` de finalidade `MIGRACAO_PRE_GO`, vinculada pelo `PRM-030` a usuário, manifesto, empresas, classes/ações e expiração; ela só pode ser emitida depois de `CTL-IMP-001/PROMOVER`, para manifesto `APROVADO` já persistido, e antes da primeira ação de carga que a exige. Pode incluir master ou usuário comum nominal, mas nunca permite pagamento, recibo definitivo, entrega externa ou outra operação de compromisso. Convite/primeiro acesso desses nomes usa allowlist de entrega exclusiva e a capacidade é revogada no fechamento, `NO-GO`, expiração ou troca de autoridade. O índice parcial da entrada usa `entrada_ativa BOOLEAN NOT NULL DEFAULT TRUE`, `CHECK (entrada_ativa = (encerrada_em IS NULL))`; somente `CTL-IMP-004` faz `TRUE → FALSE`, e `NULL`, escrita direta ou reativação são recusados.

| ID | Comando do plano de controle | Efeito vinculante |
|---|---|---|
| `CTL-IMP-001` | preparar, decidir e promover o manifesto | `PREPARAR`, por OPS/Segurança nominal, cria/versiona `RASCUNHO` e congela somente `escopo_versao/hash`. Em `DECIDIR_ESCOPO`, cada aprovador autenticado grava sua própria `ENT-IMP-03` append-only; o executor técnico não representa o aprovador. `PROMOVER` relê decisões no commit e só confirma `RASCUNHO → APROVADO` com conjunto distinto, atual e exato; rejeição, ausência, versão/hash antiga ou representação deixam `RASCUNHO`. |
| `CTL-IMP-002` | abrir a janela exata | Sob lock do manifesto, vincula candidato de liberação, esquema, baseline, fonte, ledger, início/expiração e operadores; muda `APROVADO → JANELA_ABERTA`. Repetição exata reconcilia; tentativa divergente conflita. |
| `CTL-IMP-003` | decidir finais e finalizar deltas | `DECIDIR_FINAL` recebe de DP e Contábil, em sessões pessoais distintas, decisões sobre `candidato_final_versao/hash` e `ledger_conteudo_versao/hash` do ciclo. `FINALIZAR`, por OPS/Segurança nominal, relê o conjunto sob locks, rejeita representação, mesmo decisor, ciclo/hash antigo ou delta pendente, fixa o conteúdo selado, confirma `DELTAS_APLICADOS`, resolve os ramos e cria `ENT-AUT-12` somente para `FINAL_APROVADO`. |
| `CTL-IMP-004` | fechar, revogar, expirar ou invalidar elegibilidade | No fechamento, fixa `reconciliacao_ledger_versao/hash`, revoga capacidades e grava entradas inativas/`encerrada_em` no mesmo commit; `FECHADO_RECONCILIADO` exige `SEMENTES_RESOLVIDAS` e reconciliação aprovada. De outro não terminal só admite `FECHADO_NO_GO/EXPIRADO`. `INVALIDAR_GO`, somente sobre `FECHADO_RECONCILIADO` com `production_go_id` nulo, acrescenta `ENT-IMP-05` sob locks guarda→manifesto, sem mudar o terminal, reabrir entrada ou recriar capacidade. |
| `CTL-REC-001` | confirmar a primeira faixa real | Canal administrativo forte, após `RBK-018`; CTB/ENG em identidades pessoais distintas conferem autoridade/época, manifesto/ramo, limites/hash, raiz, recibos lógicos, auditoria, snapshots, outbox e arquivos. `CONFIRMAR_PRIMEIRA_FAIXA` muda apenas `PENDENTE_RECONCILIACAO → RECONCILIADA`, append-only e idempotente; não altera número, pagamento ou recibo. Divergência/resposta incerta mantém o fence e aciona `RBK-025`. |

`CTL-IMP-001–004`, `API-REC-009`, `ENT-IMP-05`, `IMP-CUT-018` e emissão usam a ordem guarda `ENT-IMP-04` → manifesto → entradas ordenadas → autorizações → guardas/raízes. O fence final externo suspende aceitação, drena fatos em voo e sela geração, corte, último delta, contagem e `ledger_conteudo_versao/hash`. `IMP-CUT-018` exige essa prova vigente, manifesto exato `FECHADO_RECONCILIADO`, `go_elegivel = true`, nenhum `ENT-IMP-05`, sucessor ou delta posterior. Sem alegar transação distribuída, prepara o mesmo candidato de época/hash em `ENT-IMP-04` e no `registro_externo_autoridade`, mantém o destino bloqueado, confirma por CAS o evento `T_GO`, reconcilia a projeção local e só então abre. Falha antes do CAS reabre a fonte anterior; falha depois mantém ambas as interfaces funcionais fechadas até a reconciliação. `INVALIDAR_GO`/delta primeiro faz o `GO` perder; `GO` primeiro rejeita a tentativa de delta pela época/fence, e o fato entra pelo fluxo normal do sistema. Ledger externo só se torna autoritativo após a troca formal em `T_RET`.

Cada evento externo contém instalação, `authority_epoch`, época/hash anterior esperados, fonte anterior/nova, marco, manifesto/fence/mapa numérico aplicáveis, decisores, instante e hash encadeado. Em `T_RET`, pode ser confirmado com app/banco indisponíveis; nesse caso, o controle anterior+ledger só abre depois do CAS e `ENT-IMP-04` é recomposta idempotentemente antes de qualquer reabertura do sistema. Inicialização, retomada e toda mutação normal recusam projeção local defasada.

Antes de `CTL-IMP-003`, delta cria novo ciclo no mesmo manifesto e exige novo selo/decisões. A partir de `CTL-IMP-003`, delta supersede: manifesto não terminal fecha `FECHADO_NO_GO`; reconciliado recebe `CTL-IMP-004(INVALIDAR_GO)`/`ENT-IMP-05` sem reterminalização. A nova tentativa usa manifesto/janela novos; semente idêntica é apenas verificada, e mudança do máximo/prova após semente exige baseline limpo.

Depois do primeiro `ProductionGo` write-once, comandos do manifesto inicial e novas capacidades de semente são recusados. Anos/empresas futuros usam o fluxo normal, mas toda mutação continua exigindo `POS_GO_SISTEMA_AUTORITATIVO` e `authority_epoch` atual; durante `[T_RET,T_REENT)` falha fechado, e somente `T_REENT` libera novamente.

## 20.4 Conteúdo dos recibos

Cada recibo definitivo aprovado contém:

- número único;
- logo no cabeçalho, quando cadastrado;
- razão social e CNPJ da empresa;
- nome e CPF do empregado, ou dados do MEI conforme o tipo;
- competência e evento `ADIANTAMENTO` ou `PAGAMENTO_FINAL`;
- detalhamento das verbas daquele tipo documental;
- total numérico e por extenso;
- data efetiva do pagamento;
- data de emissão;
- campo de assinatura apenas do colaborador/prestador.

Geram recibo: RA e reembolso por evento; complementos por evento; período sem registro por evento; contrato MEI por evento; ajuste positivo; e acerto complementar de RA. Não geram recibo interno: salário/adiantamento oficial, líquido do holerite, rescisão oficial do contador, diferença absorvida e evento de valor zero. Um recibo do adiantamento não incorpora automaticamente o pagamento final e vice-versa.

---

# 21. Catálogo HTTP — ASO, clínicas, notificações, exportações e auditoria

## 21.1 Acompanhamento e exame de ASO

| ID | Método e rota | Tela/finalidade | Ação/perfil |
|---|---|---|---|
| API-ASO-001 | `GET /api/v1/empresa/asos` | S01; central de pendências e realizados. | `ASO.LISTAR`; resultado protegido separadamente. |
| API-ASO-002 | `POST /api/v1/empresa/asos/exportacoes` | Excel autorizado da central. | `ASYNC`; `ASO.EXPORTAR`; campos atuais. |
| API-ASO-003 | `POST /api/v1/empresa/empregados/{id}/acompanhamentos-aso` | Criar acompanhamento manual somente periódico, retorno ao trabalho ou mudança de riscos ocupacionais. | `NEW`; ASO-A01. |
| API-ASO-004 | `GET /api/v1/empresa/acompanhamentos-aso/{id}` | S02; estado operacional, prazo e referência. | `QRY`; `ASO.ACOMPANHAR`. |
| API-ASO-005 | `POST /api/v1/empresa/acompanhamentos-aso/{id}/acoes/marcar-agendado` | Mudar para `AGENDADO` sem guardar data, horário, local ou clínica. | `CMD`; ASO-A04/05. |
| API-ASO-006 | `POST /api/v1/empresa/acompanhamentos-aso/{id}/acoes/nao-comparecimento` | Registrar que o colaborador não compareceu. | `CMD`; ASO-A06; pendência permanece resolvível. |
| API-ASO-007 | `POST /api/v1/empresa/acompanhamentos-aso/{id}/acoes/encerramento-sem-realizacao` | Encerrar justificadamente quando a regra permitir. | `CRIT`; ASO-A08. |
| API-ASO-008 | `POST /api/v1/empresa/acompanhamentos-aso/{id}/acoes/cancelamento` | Cancelar somente acompanhamento de origem manual. | `CRIT`; ASO-A09; demissional é consequência do desligamento. |
| API-ASO-009 | `POST /api/v1/empresa/asos/exames` | S03; registrar exame realizado e resolver acompanhamento. | `NEW`; `DTO-ASO-001`; ASO-E01 a E04 e ASO-A07. |
| API-ASO-010 | `GET /api/v1/empresa/asos/exames/{id}` | S04; detalhe da versão atual, sem resultado se não autorizado. | `QRY`; objeto empresarial. |
| API-ASO-011 | `GET /api/v1/empresa/asos/exames/{id}/versoes` | Versões e validade histórica. | `QRY`; ASO-E07. |
| API-ASO-012 | `POST /api/v1/empresa/asos/exames/{id}/acoes/retificacao` | Nova versão do exame. | `CRIT`; `DTO-ASO-002`; ASO-E05/09. |
| API-ASO-013 | `POST /api/v1/empresa/asos/exames/{id}/acoes/invalidacao` | Invalidar versão sem apagar. | `CRIT`; ASO-E06 e ASO-A11 a A14. |
| API-ASO-014 | `POST /api/v1/empresa/asos/exames/{id}/revelacoes/resultado` | Revelar `APTO`, `APTO_COM_RESTRICAO` ou `INAPTO`. | `REVEAL`; `ASO.VER_RESULTADO`; auditoria sensível. |
| API-ASO-015 | `GET /api/v1/empresa/asos/clinicas-selecionaveis` | Opções ativas mínimas para registrar exame. | `ASO.REGISTRAR_EXAME`; CLI-05; não concede S05/S06. |
| API-ASO-016 | `POST /api/v1/empresa/asos/exportacoes/confirmacoes-sensiveis` | Confirmar inclusão de resultado/restrição no Excel de ASO. | `REVEAL/PRE`; `DTO-EXP-001`; EXP-05; autorização e auditoria sensíveis. |

Não são armazenados PDF/imagem do ASO, descrição da restrição, diagnóstico, CID, médico ou CRM. O vencimento sugerido é data do exame + 12 meses, editável. O alerta nasce 30 dias antes do vencimento aplicável. O sistema é informativo; o documento físico permanece na empresa.

Admissional é exame lógico único por vínculo e não nasce de acompanhamento manual. O demissional nasce atomicamente do desligamento formal por ASO-A02/A03; cancelamento/correção do desligamento realiza ASO-A10/A10A/A10B sem uma rota ASO independente. Como a orientação operacional é exigir exame demissional, não se usa grau de risco para dispensá-lo automaticamente. Não comparecimento permanece pendente até novo agendamento, realização, encerramento justificado ou cancelamento permitido; não some apenas com o tempo.

## 21.2 Clínicas

| ID | Método e rota | Tela/finalidade | Ação/perfil |
|---|---|---|---|
| API-CLI-001 | `GET /api/v1/global/clinicas` | S05; catálogo compartilhado em faixa `Escopo global`. | `CLINICA.LISTAR`; não mostra usos por CNPJ. |
| API-CLI-002 | `POST /api/v1/global/clinicas/prevalidacoes-cnpj` | Verificar CNPJ global sem inferência indevida. | `PRE`; capacidade global de criar. |
| API-CLI-003 | `POST /api/v1/global/clinicas` | S06; criar clínica global por razão social/nome/CNPJ. | `NEW`; CLI-01; `CLINICA.CRIAR` global. |
| API-CLI-004 | `GET /api/v1/global/clinicas/{id}` | Detalhe cadastral global. | `QRY`; `CLINICA.LISTAR`. |
| API-CLI-005 | `PATCH /api/v1/global/clinicas/{id}` | Criar versão global. | `UPD`; CLI-02; capacidade global e `If-Match`. |
| API-CLI-006 | `POST /api/v1/global/clinicas/{id}/acoes/inativacao` | Impedir novos usos em todas as empresas. | `CRIT`; CLI-03; capacidade global, reautenticação, impacto e justificativa. |
| API-CLI-007 | `POST /api/v1/global/clinicas/{id}/acoes/reativacao` | Reativar cadastro existente. | `CRIT`; CLI-04; capacidade global e justificativa. |
| API-CLI-008 | `POST /api/v1/global/clinicas/exportacoes` | Excel global do cadastro. | `ASYNC`; CLI-07; nunca inclui uso empresarial. |

Clínica é global no banco e em S05/S06. Administração exige entrada explícita no escopo global e capacidade própria, independente do perfil empresarial de ASO. Para registrar um exame, a empresa usa apenas `API-ASO-015`, que devolve opções ativas mínimas e não permite administrar nem conhecer usos. `empresa_id` não é gravado na clínica e não é usado para duplicá-la. Toda mutação de clínica tem auditoria global; jamais lista empresas, exames, empregados ou contagens de uso.

## 21.3 Notificações internas

| ID | Método e rota | Finalidade | Ação/perfil |
|---|---|---|---|
| API-NOT-001 | `GET /api/v1/empresa/notificacoes/contador` | Contador do item lateral/sino conforme desenho aprovado. | `QRY`; somente ocorrências cuja origem ainda seja acessível. |
| API-NOT-002 | `GET /api/v1/empresa/notificacoes` | N01; central interna da empresa. | `NOTIFICACAO.LISTAR`; cursor/filtros. |
| API-NOT-003 | `POST /api/v1/empresa/notificacoes/{id}/acoes/marcar-lida` | Marcar uma ocorrência visível. | `CMD`; NOT-L01/03. |
| API-NOT-004 | `POST /api/v1/empresa/notificacoes/acoes/marcar-visiveis-como-lidas` | Marcar snapshot explícito da lista atual. | `CMD`; NOT-L02; máximo 100 IDs, todos ou nenhum. |
| API-NOT-005 | `GET /api/v1/empresa/notificacoes/{id}/destino` | Resolver a rota da origem após reautorizar. | `QRY`; NOT-L06; não concede a origem. |

Perder acesso à entidade de origem remove a notificação da projeção imediatamente. A central não envia e-mail, WhatsApp ou SMS. Isso pertence à melhoria futura `MF-01` apenas se priorizada.

## 21.4 Exportações tipadas

Cada tela cria o pedido no próprio endpoint, como `.../colaboradores/exportacoes`, `.../competencias/{id}/exportacoes` ou `.../asos/exportacoes`, usando a variante fechada de `DTO-EXP-001` daquela origem. Depois:

| ID | Método e rota | Finalidade | Autorização |
|---|---|---|---|
| API-EXP-001 | `GET /api/v1/empresa/exportacoes/{id}` | Consultar o pedido empresarial originado na tela. | Próprio solicitante, empresa atual, origem e ação vigentes. |
| API-EXP-002 | `GET /api/v1/empresa/exportacoes/{id}/arquivo` | Baixar `.xlsx` temporário. | `FILE`; revalidação e hash; 24 h. |
| API-EXP-003 | `GET /api/v1/global/exportacoes/{id}` | Consultar exportação global autorizada. | Próprio solicitante no escopo global. |
| API-EXP-004 | `GET /api/v1/global/exportacoes/{id}/arquivo` | Baixar Excel global. | `FILE`; sem dados empresariais conjuntos além da fonte permitida. |

Não existe menu ou lista central de exportações. O pedido aparece no contexto de origem. A autorização é verificada no pedido, no worker e no download. Perda de permissão torna o pedido indisponível, mas não muda registros de negócio.

## 21.5 Auditoria e histórico

| ID | Método e rota | Tela/finalidade | Ação/perfil |
|---|---|---|---|
| API-AUD-001 | `GET /api/v1/empresa/auditoria` | H01; uma empresa, 30 dias por padrão, até 366. | `AUDITORIA_EMPRESARIAL.LISTAR`. |
| API-AUD-002 | `POST /api/v1/empresa/auditoria/exportacoes` | Excel empresarial. | `ASYNC`; ação e campos atuais. |
| API-AUD-003 | `GET /api/v1/empresa/auditoria/eventos/{id}` | H03; detalhe imutável redigido. | `AUDITORIA_EMPRESARIAL.VER_DETALHE`. |
| API-AUD-004 | `GET /api/v1/empresa/auditoria/eventos/{id}/mudancas` | Antes/depois por campo atual. | `REVEAL`; acesso sensível quando aplicável. |
| API-AUD-005 | `GET /api/v1/global/auditoria` | H02; somente eventos globais, administrativos e de segurança permitidos. | Exclusivo de master em escopo global. |
| API-AUD-006 | `POST /api/v1/global/auditoria/exportacoes` | Excel do mesmo conjunto global limitado. | Master; `REAUTH-EXPORTACAO-GLOBAL` sempre obrigatória; `ASYNC`. |
| API-AUD-007 | `GET /api/v1/global/auditoria/eventos/{id}` | Detalhe de evento global autorizado. | Master; aceita somente evento global, administrativo ou de segurança não pertencente ao conteúdo interno de incidente. |

H01/H02/H03, C08 e M06 são projeções autorizadas da mesma fonte `evento_auditoria`; não existe tabela paralela de histórico. H02 não é painel multi-CNPJ: ele não lista eventos empresariais de colaborador, salário, pagamento, recibo ou ASO. Para esses eventos, o master seleciona uma empresa e usa H01. H02 também exclui incondicionalmente registro, conteúdo, alcance, avaliação, comunicação e linha do tempo de incidente. Somente concessão ou revogação administrativa da autorização restrita pode aparecer como evento global. Conteúdo interno de incidente é consultado exclusivamente no escopo `INCIDENTE_RESTRITO` pelas rotas `API-INC-*`; tentativa pela rota global retorna negação neutra `404`. Resultado de ASO, CPF integral e financeiro são filtrados novamente pela permissão atual do observador.

---

# 22. Catálogo HTTP — usuários, perfis, masters e incidentes

## 22.1 Usuários e associações

Todas estas rotas exigem escopo global e papel master apto, salvo indicação expressa. Usuário comum nunca administra usuários nem perfis.

| ID | Método e rota | Tela/finalidade | Perfil adicional |
|---|---|---|---|
| API-USR-001 | `GET /api/v1/global/usuarios` | U01; lista global master-only. | `USUARIO.LISTAR`. |
| API-USR-002 | `POST /api/v1/global/usuarios` | Convidar usuário comum ou master. | `NEW/CRIT`; B03-USR-01/02/03; nome e e-mail obrigatórios. |
| API-USR-003 | `GET /api/v1/global/usuarios/{id}` | U02; identidade, situação e acessos. | `USUARIO.VER`; campos protegidos. |
| API-USR-004 | `PATCH /api/v1/global/usuarios/{id}/identidade` | Alterar nome/e-mail. | `UPD/CRIT`; e-mail exige reautenticação; B03-USR-10/11. |
| API-USR-005 | `POST /api/v1/global/usuarios/{id}/acoes/reenvio-primeiro-acesso` | Nova credencial temporária de 24 h. | `CMD`; B03-USR-04; invalida anterior. |
| API-USR-006 | `POST /api/v1/global/usuarios/{id}/acoes/bloqueio` | Bloquear administrativamente. | `CRIT`; B03-USR-05. |
| API-USR-007 | `POST /api/v1/global/usuarios/{id}/acoes/desbloqueio` | Desbloquear sem mudar senha/TOTP. | `CRIT`; B03-USR-06. |
| API-USR-008 | `POST /api/v1/global/usuarios/{id}/acoes/inativacao` | Inativar e revogar sessões. | `CRIT`; B03-USR-07. |
| API-USR-009 | `POST /api/v1/global/usuarios/{id}/acoes/reativacao` | Reativar comum/master apto. | `CRIT`; B03-USR-08/09A. |
| API-USR-010 | `POST /api/v1/global/usuarios/{id}/acoes/reativacao-recuperacao-totp` | Reativar master ainda não apto. | `CRIT`; B03-USR-09B. |
| API-USR-011 | `GET /api/v1/global/usuarios/{id}/acessos-empresariais` | Associações atuais. | `QRY`. |
| API-USR-012 | `POST /api/v1/global/usuarios/{id}/acessos-empresariais` | Associar empresa e exatamente um perfil. | `CRIT`; B03-USR-12; consome prévia `API-USR-017`. |
| API-USR-013 | `POST /api/v1/global/usuarios/{id}/acessos-empresariais/{acesso_id}/acoes/troca-perfil` | Trocar perfil da mesma empresa. | `CRIT`; B03-USR-13; consome prévia `API-USR-018`. |
| API-USR-014 | `POST /api/v1/global/usuarios/{id}/acessos-empresariais/{acesso_id}/acoes/retirada` | Retirar empresa/perfil. | `CRIT`; B03-USR-14; consome prévia `API-USR-019`. |
| API-USR-015 | `POST /api/v1/global/usuarios/{id}/perfil-global/acoes/atribuicao` | Atribuir/trocar perfil global. | `CRIT`; B03-USR-15; consome prévia `API-USR-020`. |
| API-USR-016 | `POST /api/v1/global/usuarios/{id}/perfil-global/acoes/retirada` | Retirar função global. | `CRIT`; B03-USR-16; consome prévia `API-USR-021`. |
| API-USR-017 | `POST /api/v1/global/usuarios/{id}/acessos-empresariais/previas` | Prévia tipada de nova associação empresarial. | `PRE`; `DTO-ACL-001`; empresa, perfil e versões candidatos. |
| API-USR-018 | `POST /api/v1/global/usuarios/{id}/acessos-empresariais/{acesso_id}/acoes/troca-perfil/previas` | Prévia tipada de troca de perfil. | `PRE`; `DTO-ACL-001`; calcula redução e sessões afetadas. |
| API-USR-019 | `POST /api/v1/global/usuarios/{id}/acessos-empresariais/{acesso_id}/acoes/retirada/previas` | Prévia tipada de retirada empresarial. | `PRE`; `DTO-ACL-001`; impede usuário órfão quando aplicável. |
| API-USR-020 | `POST /api/v1/global/usuarios/{id}/perfil-global/acoes/atribuicao/previas` | Prévia tipada de atribuição/troca global. | `PRE`; `DTO-ACL-001`; perfil e versão candidatos. |
| API-USR-021 | `POST /api/v1/global/usuarios/{id}/perfil-global/acoes/retirada/previas` | Prévia tipada de retirada global. | `PRE`; `DTO-ACL-001`; impacto e sessões afetadas. |

## 22.2 Master e contingência

| ID | Método e rota | Finalidade | Perfil adicional |
|---|---|---|---|
| API-MST-001 | `POST /api/v1/global/usuarios/{id}/acoes/promocao-master` | Promover usuário. | `CRIT`; B03-MST-01; consome prévia `API-MST-005`. |
| API-MST-002 | `POST /api/v1/global/usuarios/{id}/acoes/rebaixamento-master` | Rebaixar sem restaurar perfil antigo. | `CRIT`; B03-MST-03/04; consome prévia `API-MST-006`. |
| API-MST-003 | `POST /api/v1/global/usuarios/{id}/acoes/redefinicao-totp` | Reset controlado quando contingência não é necessária. | `CRIT`; B03-MST-05; consome prévia `API-MST-007`. |
| API-MST-004 | `POST /api/v1/global/contingencias-master` | Abrir exceção quando exatamente dois aptos cairiam para um. | `CRIT`; B03-MST-06; executor diferente do afetado; consome `API-MST-008`. |
| API-MST-005 | `POST /api/v1/global/usuarios/{id}/acoes/promocao-master/previas` | Prévia tipada da promoção. | `PRE`; impacto, revogações e dois masters aptos. |
| API-MST-006 | `POST /api/v1/global/usuarios/{id}/acoes/rebaixamento-master/previas` | Prévia tipada do rebaixamento. | `PRE`; não promete restaurar perfil anterior. |
| API-MST-007 | `POST /api/v1/global/usuarios/{id}/acoes/redefinicao-totp/previas` | Prévia tipada da redefinição. | `PRE`; sessões e recuperação afetadas. |
| API-MST-008 | `POST /api/v1/global/contingencias-master/previas` | Prévia tipada da contingência. | `PRE`; afetado, executor e contagem de masters aptos. |

Não existe comando público separado para concluir contingência. Fora do bootstrap inicial, `API-AUT-008` configura o novo TOTP, consome a autorização curta, restaura a aptidão, encerra eventual contingência degradada, encerra a sessão restrita e exige novo login atomicamente. O ramo inicial obedece exclusivamente a `CTL-BST-001` e à barreira conjunta da seção 15.1.1; ele não usa nem abre `B03-MST-06`. Não existe backdoor nem recuperação administrativa se nenhum master já ativado estiver apto e não houver código de recuperação. Tal situação exige nova decisão funcional antes de qualquer implementação.

## 22.3 Perfis e matriz de permissões

| ID | Método e rota | Tela/finalidade | Perfil adicional |
|---|---|---|---|
| API-PRF-001 | `GET /api/v1/global/perfis-empresariais?empresa_id={id}` | U03; perfis de exatamente uma empresa. | Master; `empresa_id` é o objeto global da consulta. |
| API-PRF-002 | `POST /api/v1/global/perfis-empresariais` | Criar perfil empresarial. | `NEW`; B03-PRF-01/08. |
| API-PRF-003 | `GET /api/v1/global/perfis-empresariais/{id}/matriz` | U04; versão atual de ações/campos. | `QRY`; ETag. |
| API-PRF-004 | `PUT /api/v1/global/perfis-empresariais/{id}/matriz` | Substituir snapshot completo da matriz. | `CRIT`; `DTO-PRF-001`; B03-PRF-03/04; consome `API-PRF-028`. |
| API-PRF-005 | `POST /api/v1/global/perfis-empresariais/{id}/acoes/duplicacao` | Copiar como perfil independente. | `NEW`; B03-PRF-02. |
| API-PRF-006 | `POST /api/v1/global/perfis-empresariais/{id}/acoes/arquivamento/previas` | Prévia tipada das associações afetadas. | `PRE`; `DTO-ACL-001`; B03-PRF-05/06. |
| API-PRF-007 | `POST /api/v1/global/perfis-empresariais/{id}/acoes/arquivamento` | Arquivar quando elegível. | `CRIT`; consome `API-PRF-006`; não deixa usuário órfão. |
| API-PRF-008 | `POST /api/v1/global/perfis-empresariais/{id}/acoes/migracao-associacoes` | Migrar usuários para perfil ativo da mesma empresa. | `CRIT`; B03-PRF-07; todos ou nenhum; consome `API-PRF-029`. |
| API-PRF-009 | `GET /api/v1/global/perfis-globais` | U05; perfis globais. | Master. |
| API-PRF-010 | `POST /api/v1/global/perfis-globais` | Criar perfil global. | `NEW`; master. |
| API-PRF-011 | `PUT /api/v1/global/perfis-globais/{id}/matriz` | Atualizar a matriz por nova versão global. | `CRIT`; `DTO-PRF-001`; consome `API-PRF-018`. |
| API-PRF-012 | `POST /api/v1/global/perfis-globais/{id}/acoes/arquivamento` | Arquivar perfil global. | `CRIT`; B03-PRF-10; consome `API-PRF-019`. |
| API-PRF-013 | `GET /api/v1/global/perfis-globais/{id}/matriz` | U05; matriz global atual de ações/campos. | `QRY`; ETag; projeção master. |
| API-PRF-014 | `POST /api/v1/global/modelos-perfil-empresarial` | Criar modelo empresarial ou duplicá-lo por origem declarada. | `NEW`; `DTO-PRF-002`; B03-PRF-08. |
| API-PRF-015 | `POST /api/v1/global/perfis-globais/{id}/acoes/migracao-associacoes` | Migrar associações globais legadas para perfil global ativo. | `CRIT`; B03-PRF-11; todos ou nenhum; consome `API-PRF-020`. |
| API-PRF-016 | `GET /api/v1/global/perfis-globais/{id}` | Detalhe, estado e versão atual do perfil global. | `QRY`; master. |
| API-PRF-017 | `GET /api/v1/global/perfis-globais/{id}/versoes` | Histórico paginado de versões globais. | `QRY`; metadados e autor; conteúdo integral por ação/campo. |
| API-PRF-018 | `POST /api/v1/global/perfis-globais/{id}/matriz/previas` | Prévia tipada da nova matriz global. | `PRE`; `DTO-ACL-001`; usuários/sessões e reduções afetados. |
| API-PRF-019 | `POST /api/v1/global/perfis-globais/{id}/acoes/arquivamento/previas` | Prévia tipada do arquivamento global. | `PRE`; associações legadas e destino necessário. |
| API-PRF-020 | `POST /api/v1/global/perfis-globais/{id}/acoes/migracao-associacoes/previas` | Prévia tipada da migração global. | `PRE`; perfil destino ativo, usuários e versões. |
| API-PRF-021 | `GET /api/v1/global/modelos-perfil-empresarial/{id}` | Detalhe, estado e versão atual do modelo. | `QRY`; master; ETag. |
| API-PRF-022 | `GET /api/v1/global/modelos-perfil-empresarial/{id}/versoes` | Histórico paginado das versões do modelo. | `QRY`; master. |
| API-PRF-023 | `GET /api/v1/global/modelos-perfil-empresarial/{id}/versoes/{versao}` | Snapshot integral de uma versão do modelo. | `QRY`; master; matriz de ações/campos. |
| API-PRF-024 | `PUT /api/v1/global/modelos-perfil-empresarial/{id}` | Editar nome, descrição e matriz criando nova versão. | `CRIT`; `DTO-PRF-002`; `If-Match`; versão anterior imutável. |
| API-PRF-025 | `POST /api/v1/global/modelos-perfil-empresarial/{id}/acoes/arquivamento/previas` | Prévia tipada do arquivamento do modelo. | `PRE`; `DTO-ACL-001`; uso no seletor e versão atual. |
| API-PRF-026 | `POST /api/v1/global/modelos-perfil-empresarial/{id}/acoes/arquivamento` | Arquivar modelo para usos futuros. | `CRIT`; B03-PRF-10; consome `API-PRF-025`. |
| API-PRF-028 | `POST /api/v1/global/perfis-empresariais/{id}/matriz/previas` | Prévia tipada da nova matriz empresarial. | `PRE`; `DTO-ACL-001`; associações, reduções e sessões afetadas. |
| API-PRF-029 | `POST /api/v1/global/perfis-empresariais/{id}/acoes/migracao-associacoes/previas` | Prévia tipada da migração empresarial. | `PRE`; destino da mesma empresa e todos-ou-nenhum. |
| API-PRF-030 | `GET /api/v1/global/perfis-globais/{id}/versoes/{versao}` | Snapshot integral de uma versão do perfil global. | `QRY`; master; matriz de ações/campos. |

`API-GEMP-002` é a lista mínima de modelos ativos permitidos no cadastro de empresa e atende A08; detalhes administrativos e versões usam `API-PRF-021` a `API-PRF-023`. Toda edição de modelo cria uma versão, sem alterar snapshots anteriores. Empresa criada recebe cópia independente da versão explicitamente escolhida; arquivar, editar ou duplicar o modelo não propaga mudança às empresas existentes e, por isso, não existe comando de “migrar cópias de modelo”. A única migração global é a substituição explícita de associações legadas de perfil por `API-PRF-015`.

Não existe wildcard persistido, herança silenciosa nem permissão individual. Recurso novo nasce negado. `EDITAR` depende de `VER`; `EXPORTAR` depende de `VER`; criação só é válida quando os campos obrigatórios estiverem editáveis.

## 22.4 Autorização de incidente

| ID | Método e rota | Finalidade | Perfil adicional |
|---|---|---|---|
| API-ACLINC-001 | `GET /api/v1/global/usuarios/{id}/autorizacao-incidentes` | Consultar versão administrativa, sem conteúdo dos incidentes. | Master. |
| API-ACLINC-002 | `PUT /api/v1/global/usuarios/{id}/autorizacao-incidentes` | Conceder/alterar capacidades e função nominal. | `CRIT`; B03-INC-01/02/05; consome `API-ACLINC-004`. |
| API-ACLINC-003 | `POST /api/v1/global/usuarios/{id}/autorizacao-incidentes/acoes/revogacao` | Revogar autorização restrita. | `CRIT`; B03-INC-03/04; consome `API-ACLINC-005`. |
| API-ACLINC-004 | `POST /api/v1/global/usuarios/{id}/autorizacao-incidentes/previas` | Prévia tipada de concessão/alteração restrita. | `PRE`; `DTO-ACL-001`; capacidades independentes e função nominal. |
| API-ACLINC-005 | `POST /api/v1/global/usuarios/{id}/autorizacao-incidentes/acoes/revogacao/previas` | Prévia tipada de revogação restrita. | `PRE`; `DTO-ACL-001`; sessões de incidente afetadas. |

Toda alteração de associação empresarial, perfil global, função master, matriz de autorização ou capacidade de incidente possui prévia tipada própria. A confirmação recebe `DTO-ACL-002`, consome uma única vez a prévia ainda vigente e falha se alvo, versão, impacto, ator, sessão ou permissões tiverem mudado. O cliente não repete no comando final uma matriz diferente da previamente avaliada.

## 22.5 Registro e acompanhamento de incidente

| ID | Método e rota | Tela/finalidade | Capacidade restrita |
|---|---|---|---|
| API-INC-001 | `POST /api/v1/incidentes` | I01; registrar incidente. | `DTO-INC-001`; `pode_registrar`; INC-01. Registrar não concede consultar. |
| API-INC-002 | `GET /api/v1/incidentes` | I01; central. | `pode_consultar`; INC-10. |
| API-INC-003 | `GET /api/v1/incidentes/{id}` | I02; detalhe/checklist. | `pode_consultar`; resposta restrita. |
| API-INC-004 | `POST /api/v1/incidentes/{id}/acoes/inicio-tratamento` | Iniciar acompanhamento. | `DTO-INC-002`; `pode_acompanhar`; INC-02. |
| API-INC-005 | `POST /api/v1/incidentes/{id}/entradas` | Adicionar/corrigir linha do tempo imutável. | `DTO-INC-002`; `pode_acompanhar`; INC-03/04. |
| API-INC-006 | `POST /api/v1/incidentes/{id}/alcances` | Registrar alcance controlado. | `DTO-INC-003`; `pode_acompanhar`; INC-05. |
| API-INC-007 | `POST /api/v1/incidentes/{id}/avaliacoes-juridicas` | Registrar avaliação. | `DTO-INC-004`; `pode_acompanhar`; INC-06. |
| API-INC-008 | `POST /api/v1/incidentes/{id}/comunicacoes-registradas` | Registrar comunicação feita externamente; não enviar. | `DTO-INC-005`; `pode_acompanhar`; INC-07. |
| API-INC-009 | `POST /api/v1/incidentes/{id}/acoes/conclusao` | Concluir checklist. | `DTO-INC-006`; `pode_concluir_reabrir`; INC-08. |
| API-INC-010 | `POST /api/v1/incidentes/{id}/acoes/reabertura` | Reabrir com justificativa. | `CRIT`; `DTO-INC-007`; `pode_concluir_reabrir`; INC-09. |

Usuário com apenas `pode_registrar` recebe protocolo do próprio envio, mas não um endpoint de detalhe. Incidentes não aceitam anexos. Referência de evidência é texto controlado para localização externa.

---

# 23. Utilidades e integrações auxiliares

| ID | Método e rota | Finalidade | Regra |
|---|---|---|---|
| API-UTL-001 | `GET /api/v1/catalogos/{codigo}` | Enum/rótulo fechado necessário à tela atual. | Só catálogos declarados e observáveis; não é busca genérica no banco. |
| API-UTL-002 | `POST /api/v1/consultas-cep` | Buscar endereço auxiliar pelo CEP. | Corpo com CEP; timeout/rate limit; somente CEP vai ao fornecedor. |
| API-UTL-003 | `GET /health/live` | Verificar se o processo responde. | Público mínimo, sem versão, banco ou dependências. |
| API-UTL-004 | `GET /health/ready` | Verificar aptidão para receber tráfego. | Resultado público mínimo; detalhe apenas na rede/operação interna. |

A resposta de CEP é sugestão editável. O usuário confirma endereço e campos obrigatórios; indisponibilidade do fornecedor não impede preenchimento manual. Consulta não transmite nome, CPF, CNPJ, colaborador ou empresa.

---

# 24. DTOs normativos principais

Os DTOs abaixo definem a fronteira. O Documento 18 continua sendo o dicionário completo de campos.

## 24.1 Sessão e contexto

### DTO-AUT-001 — login

```json
{
  "email": "usuario@empresa.com.br",
  "senha": "segredo-na-requisicao"
}
```

Resultado discriminado, sem dados empresariais:

```json
{
  "data": {
    "proxima_etapa": "SELECIONAR_EMPRESA"
  },
  "meta": {
    "correlacao_id": "id-opaco"
  }
}
```

`proxima_etapa` pode ser `DEFINIR_SENHA`, `CONFIGURAR_TOTP`, `VALIDAR_TOTP` ou `SELECIONAR_EMPRESA`. Falha pública não confirma conta, papel ou fator.

### DTO-CTX-001 — selecionar empresa

```json
{
  "empresa_id": "id-opaco"
}
```

Esse é um dos poucos pontos em que `empresa_id` pode vir do cliente: ele é o objeto candidato do comando, não autoridade. Após validação, a empresa efetiva fica na sessão. Rotas empresariais posteriores rejeitam `empresa_id` no corpo/cabeçalho.

## 24.2 Empresa, perfis e alterações de acesso

### DTO-GEMP-001 — criar empresa

Parte JSON de `API-GEMP-004`:

```json
{
  "prevalidacao_cnpj_id": "id-opaco",
  "empresa": {
    "razao_social": "Empresa Exemplo Ltda.",
    "nome_fantasia": "Empresa Exemplo",
    "cnpj": "12345678000190",
    "competencia_inicial": "2026-09"
  },
  "configuracao_inicial": {
    "liquido_contador_desconta_adiantamento_padrao": true,
    "dia_sugerido_adiantamento": 20,
    "dia_sugerido_pagamento_final": 5
  },
  "modelo_perfil_empresarial": {
    "modelo_id": "id-opaco",
    "numero_versao": 3
  },
  "destino_pos_criacao": "ENTRAR"
}
```

`destino_pos_criacao` também pode ser `SELETOR`. A versão do modelo é obrigatória e precisa continuar ativa/elegível no commit; a cópia criada não mantém herança viva. O percentual inicial de adiantamento é gravado na fonte financeira única com o padrão aprovado de 40%, sem duplicá-lo na configuração. Quando houver logo, ele é a parte multipart opcional `logo`, nunca texto/base64 dentro deste DTO.

### DTO-ACL-001 — resultado de prévia tipada de acesso

```json
{
  "previsao_id": "id-opaco",
  "tipo_alteracao": "TROCA_PERFIL_EMPRESARIAL",
  "alvo": {
    "tipo": "ACESSO_EMPRESARIAL",
    "id": "id-opaco",
    "versao": 7
  },
  "estado_atual": {
    "perfil_id": "id-atual",
    "perfil_versao": 4
  },
  "estado_proposto": {
    "perfil_id": "id-novo",
    "perfil_versao": 2
  },
  "impacto": {
    "usuarios_afetados": 1,
    "sessoes_revogadas": 2,
    "reduz_acesso": true,
    "impede_usuario_orfao": false
  },
  "exige_reautenticacao": true,
  "exige_justificativa": true,
  "expira_em": "2026-09-20T14:35:00-03:00"
}
```

Cada rota de prévia possui um DTO de entrada fechado com apenas o candidato pertinente — por exemplo, empresa+perfil, novo perfil, matriz completa, capacidades de incidente ou usuário afetado. A saída comum acima discrimina `tipo_alteracao`, estado atual/proposto, versões e impacto; campos inaplicáveis são omitidos, nunca inventados como zero. A prévia fica vinculada a ator, sessão, alvo, versões, hash do candidato e revisão de autorização.

### DTO-ACL-002 — confirmar alteração de acesso previamente avaliada

```json
{
  "previsao_id": "id-opaco",
  "confirmado": true,
  "justificativa": "Alteração aprovada para nova atribuição"
}
```

A confirmação aplica exatamente o candidato congelado na prévia e a consome uma vez. Não aceita repetir ou alterar empresa, perfil, matriz, capacidades, usuário ou impacto. `justificativa` é obrigatória quando a prévia assim indicar; reautenticação é comprovada pelo mecanismo vinculado da seção 12, não por senha neste DTO.

### DTO-PRF-001 — snapshot completo de matriz

```json
{
  "acoes": [
    {
      "recurso": "COLABORADOR.VER",
      "permitida": true
    }
  ],
  "campos": [
    {
      "recurso": "EMPREGADO.CPF",
      "estado": "MASCARADO"
    }
  ]
}
```

O JSON ilustra a forma das entradas; no pedido real, cada recurso ativo do catálogo aplicável aparece exatamente uma vez no candidato da substituição completa. `estado` aceita apenas `OCULTO`, `MASCARADO`, `VISIVEL_SEM_EDICAO` ou `VISIVEL_E_EDITAVEL`; dependências são validadas em conjunto. Recurso criado depois dessa versão continua negado até nova versão explícita. O DTO é enviado à rota de prévia; o `PUT` final consome `DTO-ACL-002` e aplica o snapshot congelado.

### DTO-PRF-002 — criar ou versionar modelo empresarial

```json
{
  "nome": "Perfil operacional padrão",
  "descricao": "Modelo para novas empresas",
  "origem": null,
  "matriz": {
    "acoes": [
      {
        "recurso": "COLABORADOR.VER",
        "permitida": true
      }
    ],
    "campos": [
      {
        "recurso": "EMPREGADO.CPF",
        "estado": "MASCARADO"
      }
    ]
  }
}
```

Na criação nova, `origem` é nula/ausente e `matriz` completa é obrigatória. Na duplicação, `origem` contém `modelo_id` e `numero_versao`, enquanto `matriz` é omitida para garantir cópia exata e auditável; a cópia pode ser editada depois por nova versão. Na edição de um modelo existente, `origem` é omitida, `matriz` completa é obrigatória e `If-Match` identifica a versão base. Enviar simultaneamente origem e matriz, ou omitir a fonte exigida pelo modo, é rejeitado. `matriz` segue integralmente `DTO-PRF-001`; toda edição gera nova versão imutável.

## 24.3 Empregado e condições

### DTO-EMP-001 — criar empregado

```json
{
  "prevalidacao_id": "id-opaco",
  "pessoa": {
    "nome": "Nome completo",
    "cpf": "12345678901",
    "endereco": {
      "cep": "12345678",
      "logradouro": "Rua Exemplo",
      "numero": "100",
      "complemento": null,
      "bairro": "Centro",
      "cidade": "Cidade",
      "uf": "SP"
    }
  },
  "vinculo": {
    "data_inicio_atividades": "2026-09-01",
    "data_admissao": null
  },
  "condicoes_financeiras_iniciais": {
    "salario_redondo": {
      "competencia_inicial": "2026-09"
    }
  }
}
```

Data de início e data de admissão são diferentes. A admissão formal pode ser preenchida posteriormente. `data_demissao` formal e `data_desligamento_sem_registro` permanecem campos separados conforme o vínculo.

O checkbox “salário redondo” não é campo do vínculo. Desmarcado, `salario_redondo` fica ausente/nulo; marcado, cria `salario_redondo_vigencia` com competência inicial explícita na mesma transação, desde que o usuário também possua `EMPREGADO.EDITAR_FINANCEIRO`. Sem essa permissão, o campo não aparece e nenhuma vigência é criada.

Telefone e e-mail do empregado não integram a primeira versão; permanecem reservados à melhoria futura MF-01. Telefone/e-mail opcionais existem somente no cadastro do MEI nesta versão.

### DTO-FIN-001 — remuneração adicional

```json
{
  "valor_mensal": "1000.00",
  "competencia_inicial": "2026-09",
  "competencia_final": null,
  "forma_pagamento": "DUAS_PARCELAS",
  "percentual_adiantamento": "40.0000"
}
```

RA sem competência final é indeterminada. Encerrá-la depois cria nova versão com última competência inclusiva. Salário total acordado não é recebido no DTO.

### DTO-FIN-002 — base do período sem registro

```json
{
  "valor_mensal": "3000.00",
  "forma_pagamento": "ADIANTAMENTO_E_FINAL",
  "percentual_adiantamento": "40.0000",
  "confirmacao_exclusao_oficial": true
}
```

`forma_pagamento` também pode ser `SOMENTE_FINAL`. O corte do dia 15 pode forçar `SOMENTE_FINAL`, independentemente da preferência.

## 24.4 MEI

### DTO-MEI-001 — prestador e contrato inicial

```json
{
  "prevalidacao_id": "id-opaco",
  "cnpj": "12345678000190",
  "razao_social": "Prestador Exemplo",
  "nome_fantasia": "Exemplo Serviços",
  "telefone": null,
  "email": null,
  "endereco": {
    "cep": "12345678",
    "logradouro": "Rua Exemplo",
    "numero": "100",
    "complemento": null,
    "bairro": "Centro",
    "cidade": "Cidade",
    "uf": "SP"
  },
  "contrato": {
    "data_inicio": "2026-09-01",
    "data_fim_prevista": "2027-08-31",
    "valor_mensal": "3000.00",
    "forma_pagamento": "DUAS_PARCELAS",
    "percentual_adiantamento": "40.0000"
  }
}
```

Telefone e e-mail são opcionais; endereço até CEP e demais partes necessárias é obrigatório. Não existem campos de salário por fora, nota fiscal ou complemento recorrente.

### DTO-MEI-002 — serviço adicional de competência

```json
{
  "descricao": "Serviço adicional executado na competência",
  "valor": "250.00",
  "justificativa": "Correção da descrição e do valor"
}
```

Na criação por `API-LAN-003`, `descricao` e `valor` positivo são obrigatórios e `justificativa` é omitida. Na correção anterior ao pagamento por `API-LAN-007`, ao menos um dos dois campos muda e `justificativa` é obrigatória. Competência, participante, contrato MEI vigente e destino exclusivo ao pagamento final vêm da rota e do recurso autorizado; o cliente não os redefine no corpo.

## 24.5 Competência, pagamento e correção

### DTO-PAG-001 — confirmar grupo/evento

```json
{
  "previsao_id": "id-opaco",
  "data_pagamento": "2026-09-20",
  "confirmado": true
}
```

Grupo, evento, participante, valores e empresa vêm do recurso autorizado, não do corpo. `data_pagamento` é obrigatória, representa a data efetivamente paga e não pode ser futura no momento da confirmação. Um mesmo evento não aceita pagamento parcial.

### DTO-PAG-002 — resultado da confirmação

```json
{
  "pagamento_id": "id-opaco",
  "estado_pagamento": "CONFIRMADO",
  "recibo_id": null,
  "arquivo_estado": null,
  "versao": 4
}
```

`recibo_id` e `arquivo_estado` ficam nulos para oficial, K06, rescisão oficial, diferença absorvida e valor zero. Quando o tipo gera recibo, o ID lógico aparece e o arquivo pode continuar `PENDENTE_GERACAO` sem alterar o pagamento confirmado.

### DTO-PAG-003 — candidato de pagamento em lote

```json
{
  "evento": "ADIANTAMENTO",
  "data_pagamento": "2026-09-20",
  "itens": [
    {
      "grupo_id": "id-opaco",
      "etag": "versao-opaca"
    }
  ]
}
```

Todos os itens pertencem à mesma empresa, competência, evento e tipo de grupo, possuem valor integral elegível e respeitam o limite inicial de 100. A prévia autoriza cada item e congela IDs, versões, valores, documentos decorrentes e data efetiva. Item repetido, inacessível, já pago, sem conferência ou incompatível rejeita o candidato inteiro.

### DTO-PAG-004 — confirmar lote previamente avaliado

```json
{
  "previsao_id": "id-opaco",
  "confirmado": true
}
```

O comando não recebe novamente itens, valores, evento ou data. Ele consome o candidato congelado uma única vez e confirma todos ou nenhum em `TX-005`; qualquer ETag, permissão, estado, contexto ou impacto divergente invalida a prévia completa.

### DTO-COR-001 — iniciar F04 para verba paga

```json
{
  "verba_origem": {
    "tipo": "SERVICO_ADICIONAL_MEI",
    "item_id": "id-opaco",
    "versao_paga": 2
  },
  "motivo": "VALOR_INCORRETO",
  "justificativa": "Valor correto apurado após o pagamento"
}
```

O grupo financeiro pago vem de `API-COR-001`; o corpo identifica exatamente uma verba daquele grupo e sua versão paga. A API rejeita item de outro participante, competência, empresa, grupo ou versão. Outros tipos admitidos por F04 usam a mesma união discriminada fechada. Valor corrigido não é aplicado diretamente neste comando: a jornada preserva o fato pago e segue apuração/reconfirmação de `API-COR-003` a `API-COR-007`.

### DTO-K06-001 — líquido do contador

```json
{
  "valor_liquido": "1785.43",
  "confirmado": true
}
```

O valor já desconta o adiantamento oficial e não inclui RA/complementos. Ausência, zero e não aplicabilidade possuem semânticas diferentes e não são confundidas.

## 24.6 Desligamento, recibo, lote e exportação

### DTO-DES-001 — registrar ou programar desligamento

```json
{
  "natureza": "FORMAL",
  "data_demissao": "2026-09-18",
  "data_desligamento_sem_registro": null,
  "tipo_aviso": "INDENIZADO",
  "dias_aviso_indenizado": 30
}
```

`natureza` aceita `FORMAL` ou `SEM_REGISTRO` e exige exatamente a data correspondente, preservando os dois fatos separados. `tipo_aviso` aceita somente `TRABALHADO` ou `INDENIZADO`; fica nulo apenas quando a regra o considerar não aplicável. Os dias são aceitos somente para aviso indenizado. Motivo de desligamento não integra a primeira versão. Competência, situação do vínculo, adiantamento já pago e RA vigente são apurados pelo servidor.

### DTO-DES-002 — informar rescisão oficial do contador

```json
{
  "valor_rescisao_oficial": "0.00",
  "confirmacao_nao_inclui_ra": true,
  "motivo_zero": "NAO_HA_VALOR_OFICIAL",
  "justificativa_correcao": null
}
```

Valor positivo exige `motivo_zero` nulo/ausente; zero exige um código do catálogo. A confirmação de que o valor oficial não inclui RA é sempre obrigatória. Em substituição de versão existente, `If-Match` e justificativa corretiva são obrigatórios. A verba oficial segue pagamento próprio e nunca gera recibo interno.

### DTO-DES-003 — parâmetros confirmados do cálculo de RA

```json
{
  "avos_decimo_terceiro": 9,
  "avos_ferias": 9,
  "possui_ferias_vencidas": false
}
```

Os avos aceitam inteiros de 0 a 12. RA mensal vigente, data real da saída, início do direito, tipo/dias de aviso e RA já paga no adiantamento vêm das fontes versionadas; o cliente não os redefine. O servidor calcula saldo, aviso indenizado sem dobra, 13º, férias, terços e eventual férias vencidas exclusivamente sobre a RA vigente na saída, sempre com divisor 30 onde aplicável.

### DTO-DES-004 — conferir memória do acerto de RA

```json
{
  "calculo_id": "id-opaco",
  "confirmado": true,
  "sobrescritas": [
    {
      "item_codigo": "FERIAS_PROPORCIONAIS_RA",
      "valor_manual": "750.00",
      "justificativa": "Valor conferido e ajustado pelo responsável"
    }
  ]
}
```

Sem ajuste manual, `sobrescritas` é vazio. Cada sobrescrita exige permissão específica, valor monetário não negativo, justificativa e memória automática preservada; item fora do catálogo é rejeitado. A conferência revalida parâmetros, cálculo, RA vigente e pagamentos antes de fixar o total final. Excedente já pago é absorvido e nunca vira cobrança negativa.

### DTO-REC-001 — projeção autorizada de recibo

```json
{
  "recibo_id": "id-opaco",
  "numero": "2026-000123",
  "tipo_documental": "REMUNERACAO_ADICIONAL_REEMBOLSO",
  "evento": "ADIANTAMENTO",
  "empresa": {
    "razao_social": "Empresa Exemplo Ltda.",
    "cnpj": "12345678000190"
  },
  "favorecido": {
    "tipo": "EMPREGADO",
    "nome": "Nome completo",
    "cpf": "12345678901"
  },
  "competencia": "2026-09",
  "itens": [
    {
      "descricao": "Remuneração adicional",
      "valor": "600.00"
    }
  ],
  "total_numerico": "600.00",
  "total_extenso": "seiscentos reais",
  "data_pagamento": "2026-09-20",
  "data_emissao": "2026-09-20T14:30:00-03:00",
  "exibe_campo_assinatura_manual": true,
  "estado": "DEFINITIVO_VIGENTE",
  "arquivo_estado": "DISPONIVEL"
}
```

A projeção nasce exclusivamente do snapshot imutável. `favorecido` é uma união discriminada: empregado usa `nome` e `cpf`; MEI usa `razao_social`, `nome_fantasia` e `cnpj`. Se o observador não puder ver qualquer campo obrigatório do documento, a API não entrega um recibo parcial. O booleano apenas determina a impressão de uma linha em branco para assinatura manual; o sistema não registra assinatura digital. Não há assinatura da empresa. Estados documentais aceitos são `DEFINITIVO_VIGENTE`, `CANCELADO`, `SUBSTITUIDO` e `SUBSTITUTO_VIGENTE`; estados do arquivo são `PENDENTE_GERACAO`, `DISPONIVEL`, `FALHOU` e `INDISPONIVEL`.

### DTO-DOC-001 — solicitar lote documental

```json
{
  "formato": "PDF_CONSOLIDADO",
  "tipos_documentais": [
    "COMPLEMENTOS",
    "REMUNERACAO_ADICIONAL_REEMBOLSO"
  ],
  "recibo_ids": [
    "id-opaco-1",
    "id-opaco-2"
  ]
}
```

`formato` aceita `PDF_CONSOLIDADO` ou `ZIP`. Todos os recibos são vigentes, da empresa e competência da rota e integralmente visíveis; podem pertencer ao adiantamento ou ao pagamento final conforme a seleção feita na tela. A lista explícita é limitada, não aceita duplicados e vira snapshot do pedido; o worker não refaz uma seleção mais ampla.

### DTO-EXP-001 — pedido de exportação tipada

```json
{
  "filtros": {
    "situacao": "ATIVO"
  },
  "ordenacao": [
    {
      "campo": "nome",
      "direcao": "ASC"
    }
  ],
  "colunas": [
    "nome",
    "cpf_mascarado",
    "situacao"
  ],
  "confirmacao_sensivel_id": null
}
```

Cada rota `.../exportacoes` possui um schema fechado próprio para filtros, ordenações e colunas daquela tela; o exemplo acima é o da lista de colaboradores. Campo desconhecido ou sem permissão é rejeitado, não ignorado. A empresa/origem vêm da rota e da sessão. O pedido persiste o snapshot autorizado, e worker, consulta e download repetem as verificações aprovadas.

Na variante ASO, `confirmacao_sensivel_id` é obrigatória quando `colunas` inclui resultado clínico ou marcador de restrição e é proibida nos demais casos. `API-ASO-016` gera essa confirmação após apresentar o impacto; ela fica vinculada ao usuário, sessão, empresa, `X-Context-Version`, filtros, ordenação, colunas, permissões `ASO.VER_RESULTADO`/restrição e revisão autorizativa, possui prazo curto e é consumida uma única vez pela criação da exportação. A auditoria registra a confirmação e o pedido sensíveis sem copiar o conteúdo clínico.

## 24.7 ASO

### DTO-ASO-001 — exame realizado

```json
{
  "vinculo_empregado_id": "id-opaco",
  "acompanhamento_id": null,
  "desligamento_id": null,
  "tipo_exame": "PERIODICO",
  "data_exame": "2026-09-15",
  "data_vencimento": "2027-09-15",
  "clinica_id": "id-opaco",
  "resultado": "APTO"
}
```

Resultado pode ser `APTO`, `APTO_COM_RESTRICAO` ou `INAPTO`. `acompanhamento_id` é opcional; quando informado, precisa pertencer ao mesmo vínculo e estar em estado compatível. Admissional pode ser lançado diretamente e é único por vínculo. Demissional exige `desligamento_id`, possui acompanhamento criado pelo desligamento e não recebe vencimento. Periódico, retorno e mudança podem resolver acompanhamento manual ou ser registrados diretamente conforme a regra. Não há campo para descrição da restrição, CID, médico, CRM ou arquivo.

### DTO-ASO-002 — retificar exame

```json
{
  "motivo_retificacao": "CORRECAO_DATA_CLINICA",
  "exame_corrigido": {
    "tipo_exame": "PERIODICO",
    "data_exame": "2026-09-14",
    "data_vencimento": "2027-09-14",
    "clinica_id": "id-opaco",
    "resultado": "APTO"
  }
}
```

O vínculo, empresa e identidade da cadeia não podem mudar. A retificação exige `If-Match`, `motivo_retificacao` pertencente a catálogo fechado e todos os campos do novo snapshot; revalida unicidade, tipo, datas, clínica e autorização de resultado, cria nova versão e preserva a anterior. Demissional continua sem vencimento e nenhuma versão aceita descrição clínica, CID, médico, CRM ou arquivo.

## 24.8 Incidente restrito

### DTO-INC-001 — registrar incidente

```json
{
  "data_percebida": "2026-09-18T10:30:00-03:00",
  "data_conhecimento": "2026-09-18T11:00:00-03:00",
  "descricao_objetiva": "Ocorrência identificada e contida para avaliação.",
  "contencao_inicial": null,
  "alcances_iniciais": [
    {
      "categoria": "DADOS_CADASTRAIS",
      "quantidade": null,
      "qualidade_quantidade": "DESCONHECIDA",
      "justificativa": "A apuração inicial ainda não permite estimar a quantidade"
    }
  ],
  "referencias_evidencia": [
    {
      "descricao": "Registro preservado no cofre interno",
      "localizacao_externa": "referencia-controlada",
      "classificacao": "RESTRITA"
    }
  ]
}
```

O servidor gera código, estado `ABERTO`, registrador e instante. Descrição inicial, alcance, contenção e referências tornam-se entradas imutáveis. Cada alcance usa união fechada: `CONHECIDA` exige quantidade e pode omitir justificativa; `ESTIMADA` exige quantidade e justificativa; `DESCONHECIDA` exige quantidade nula e justificativa. Texto livre passa por limites e orientação contra dado pessoal integral; referência localiza evidência externa e não faz upload. Registrar devolve apenas protocolo ao usuário que não possua `pode_consultar`.

### DTO-INC-002 — entrada imutável ou início de tratamento

```json
{
  "categoria": "CONTENCAO",
  "descricao_objetiva": "Acesso preventivamente interrompido para apuração.",
  "entrada_corrigida_id": null,
  "justificativa": null,
  "referencias_evidencia": []
}
```

`API-INC-004` fixa a categoria `INICIO_TRATAMENTO`. Em `API-INC-005`, categoria vem de catálogo fechado. Para correção, `categoria` é `CORRECAO`, `entrada_corrigida_id` e justificativa são obrigatórias; a entrada anterior permanece intacta. Referências apenas localizam evidência externa protegida.

### DTO-INC-003 — alcance conhecido, estimado ou desconhecido

```json
{
  "categoria": "DADOS_CADASTRAIS",
  "qualidade_quantidade": "ESTIMADA",
  "quantidade": 12,
  "justificativa": "Estimativa baseada nos registros disponíveis",
  "empresas_mencionadas": [
    {
      "empresa_id": "id-opaco",
      "condicao": "POSSIVEL"
    }
  ]
}
```

A mesma união condicional de quantidade do `DTO-INC-001` é aplicada. Empresa mencionada precisa existir, mas não concede acesso empresarial nem permite carregar seus dados operacionais. A entrada e seus alcances são comprometidos juntos.

### DTO-INC-004 — avaliação jurídica/LGPD

```json
{
  "responsavel_referenciado": "Responsável pela avaliação",
  "data_referenciada": "2026-09-18",
  "conclusao_codigo": "RISCO_CONFIRMADO",
  "decisao_codigo": "COMUNICAR_ANPD",
  "justificativa": "Decisão humana registrada após a avaliação.",
  "prazo_aplicavel": "2026-09-20"
}
```

Todos os campos são estruturados e validados por catálogo/data; `prazo_aplicavel` é nulo somente quando a conclusão não definir prazo. O sistema registra a decisão humana e nunca decide automaticamente pela comunicação.

### DTO-INC-005 — comunicação externa já realizada

```json
{
  "entrada_decisao_id": "id-opaco",
  "destinatario_comunicacao_codigo": "ANPD",
  "data_referenciada": "2026-09-19",
  "protocolo_referencia": "protocolo-ou-referencia-segura"
}
```

A decisão anterior precisa pertencer ao mesmo incidente e autorizar o destinatário. A API registra comunicação realizada fora do sistema; não envia e-mail, SMS, WhatsApp nem mensagem à ANPD ou aos titulares.

### DTO-INC-006 — concluir incidente

```json
{
  "conclusao_codigo": "TRATAMENTO_CONCLUIDO",
  "descricao_objetiva": "Tratamento encerrado após verificação do checklist.",
  "justificativa": "As evidências e decisões aplicáveis foram registradas."
}
```

O servidor não confia no texto como checklist. Antes do commit, prova alcance final ou justificativa de desconhecimento, contenção, correção/restauração, avaliação, decisões, comunicações aplicáveis, conclusão e melhoria registrada ou justificativa explícita para não haver melhoria; ausência de qualquer requisito rejeita tudo.

### DTO-INC-007 — reabrir incidente

```json
{
  "descricao_objetiva": "Novo fato exige retomada do tratamento.",
  "justificativa": "Informação relevante recebida após a conclusão."
}
```

Reabertura exige `If-Match`, reautenticação `REAUTH-INCIDENTE`, autorização cumulativa atual e justificativa. Cria entrada imutável, preserva a conclusão anterior e leva o incidente a `EM_TRATAMENTO`, nunca de volta a `ABERTO`.

## 24.9 Semântica de ausência, `null` e limpeza

- campo ausente em `PATCH`: não alterar;
- `null`: limpar apenas quando o dicionário permitir e o campo for editável;
- string vazia não substitui `null`; é rejeitada ou normalizada segundo o campo;
- valor mascarado de apresentação não é aceito em nenhum DTO de escrita;
- coleção vazia em substituição completa significa remover todos os itens somente quando a ação permitir e a prévia mostrar impacto;
- data/valor derivado nunca é aceito para sobrescrever a projeção.

---

# 25. Manifesto canônico de operação

Cada operação implementada terá um manifesto versionado e verificável. Exemplo:

```yaml
operacao_id: OPR-PAGAMENTO-GERIR
api_id: API-PAG-002
metodo: POST
rota: /api/v1/empresa/grupos-financeiros/{id}/acoes/confirmacao-pagamento
telas: [F02]
escopos: [EMPRESARIAL]
origens_autorizacao: [MASTER_EMPRESARIAL, PERFIL_EMPRESARIAL]
acao: PAGAMENTO.CONFIRMAR
objeto: GRUPO_DA_EMPRESA_ATUAL
campos_entrada: DTO-PAG-001
campos_saida: DTO-PAG-002
transicoes_permitidas: [G08-10, P09-05, P09-07, P09-08, P09-09, P09-10, P09-12, P09-13, P09-16]
reauth: NAO_EXIGIDA
idempotencia: IDEM-01
concorrencia: CONC-02
transacao: TX-004
auditoria: APIAUD-01
outbox: [JOB-001 quando o tipo documental gerar recibo]
```

## 25.1 Campos obrigatórios do manifesto

1. ID da operação e do contrato HTTP, quando houver;
2. método, rota e telas consumidoras;
3. escopos e origens de concessão aceitos;
4. ação e dependências;
5. política de pertencimento do objeto;
6. DTO de entrada e projeção de saída;
7. campos lidos, editados, filtrados, ordenados, totalizados, exportados e documentados;
8. transições permitidas do Documento 17;
9. estados iniciais e pré-condições;
10. reautenticação e justificativa;
11. idempotência e concorrência;
12. perfil transacional;
13. auditoria/acesso sensível;
14. outbox, tarefa ou efeito temporal;
15. entidades, restrições e controles dos Documentos 18/19;
16. erros estáveis possíveis;
17. testes e evidências aprovados no pacote 22/22A–22D, executados na etapa aplicável.

## 25.2 Regras do manifesto

- o cliente nunca envia código estático `OPR-*`, papel, perfil, permissão, estado final ou ID da transição como autoridade; IDs opacos de recursos/pedidos continuam sendo apenas alvos a autorizar;
- o servidor determina e registra cada transição efetivamente realizada;
- comando composto pode gerar vários eventos de auditoria com a mesma correlação;
- uma linha singular de auditoria guarda um ID de transição, não lista ambígua;
- rota mutável sem transição aprovada não compila/passa o gate;
- ação/campo inexistente ou inativo faz a aplicação falhar de forma fechada na inicialização;
- nenhum controlador pode desviar do motor central;
- OpenAPI representa `API-*`, mas o manifesto também cobre worker, relógio, UI e política.

## 25.3 Extensões OpenAPI

Cada operação pública terá, no mínimo:

```text
operationId
x-api-id
x-operacao-id
x-telas
x-transicoes
x-escopos
x-acao
x-idempotencia
x-concorrencia
x-reauth
x-auditoria
```

O OpenAPI é artefato técnico gerado e validado; este documento e o manifesto de operações continuam sendo o baseline de intenção.

---

# 26. Perfis transacionais

| ID | Uso | Conteúdo atômico |
|---|---|---|
| TX-001 `LEITURA_RLS` | Consultas empresariais. | Transação somente leitura, contexto local de usuário/empresa/revisão, RLS e projeção autorizada. |
| TX-002 `ESCRITA_PADRAO` | Cadastro/versão comum. | Negócio, versão, histórico, auditoria, idempotência e outbox no mesmo commit. |
| TX-003 `SEGURANCA` | Perfil, usuário, master, bootstrap singleton, sessão, incidente ACL e plano de controle `ENT-IMP-*`/`CTL-IMP-*`. | Nova autorização, revisão, credencial inicial aplicável, manifesto/aprovação de implantação, revogações, autorizações curtas, idempotência, auditoria e outbox de segurança aplicável no mesmo commit. |
| TX-004 `FINANCEIRO` | Conferência/pagamento/correção. | Estado, componentes, pagamento, numeração, recibo lógico/snapshot, auditoria, idempotência e outbox. |
| TX-005 `LOTE_ATOMICO` | F03 e migrações. | Locks em ordem canônica e todos os itens ou nenhum. |
| TX-006 `PEDIDO_ASSINCRONO` | Excel/lote/regeneração. | Snapshot autorizado, pedido, idempotência, auditoria e outbox. |
| TX-007 `TAREFA` | Worker. | Lease, uma empresa/escopo, efeito idempotente, resultado e telemetria sanitizada. |
| TX-008 `TEMPORAL` | Prazo/alerta/expiração. | Uma empresa por transação; ator técnico; ocorrência deduplicada. |

PDF, Excel, ZIP, e-mail, CEP e storage nunca permanecem dentro da transação financeira/de negócio. Primeiro se confirma a decisão e grava a outbox; depois o worker realiza o efeito.

---

# 27. Contratos de tarefas e eventos temporais

| ID | Classe | Origem | Resultado |
|---|---|---|---|
| JOB-001 | `RECIBO_GERAR` | Pagamento/ajuste/acerto confirmado. | Arquivo do snapshot definitivo; efeito comprometido. |
| JOB-002 | `RECIBO_REGENERAR` | Pedido autorizado sobre snapshot existente. | Novo arquivo físico/hash, mesmo conteúdo semântico. |
| JOB-003 | `LOTE_DOCUMENTAL_GERAR` | R03. | PDF consolidado/ZIP temporário. |
| JOB-004 | `EXPORTACAO_GERAR` | Tela de origem. | `.xlsx` temporário com snapshot autorizado. |
| JOB-005 | `EMAIL_AUTENTICACAO_ENVIAR` | Convite/recuperação já emitidos. | Tentativa de e-mail; não estende token. |
| JOB-006 | `NOTIFICACAO_MATERIALIZAR` | Condição aprovada. | Ocorrência interna deduplicada. |
| JOB-007 | `ASO_REFERENCIA_REAVALIAR` | Evento temporal/alteração de exame. | Prazo/referência derivados e alerta de 30 dias. |
| JOB-008 | `TEMPORARIO_EXPIRAR` | Completar 24 horas. | Arquivo temporário indisponível; metadados preservados. |
| JOB-009 | `INTEGRIDADE_RECONCILIAR` | Rotina técnica. | Evidência/alerta operacional, nunca correção silenciosa de negócio. |

## 27.1 Conteúdo mínimo da tarefa

- ID, tipo e versão do contrato;
- empresa ou marcador global/restrito explícito;
- ator/origem e revisão aplicável;
- entidade, versão e transição de origem;
- chave idempotente e correlação;
- classe de autoridade;
- payload mínimo por referências;
- disponibilidade, tentativas e último erro sanitizado.

Tarefa empresarial sem empresa, com empresa divergente ou objeto de outro CNPJ falha de modo fechado. A identidade do worker não possui `BYPASSRLS`, não simula master e não processa várias empresas na mesma transação.

## 27.2 Famílias temporais referenciadas pelo Documento 20A

| Família | Eventos cobertos |
|---|---|
| `JOB-TEMPORAL-AUTENTICACAO-SESSAO` | Vencimento de token/credencial, bloqueio e sessão. |
| `JOB-TEMPORAL-EMPREGADO` | Admissão futura alcançada, com recálculo idempotente somente de eventos ainda abertos. |
| `JOB-TEMPORAL-MEI-CONTRATO` | Consumo da renovação contínua programada quando começa a vigência seguinte. |
| `JOB-TEMPORAL-LOTE-DOCUMENTAL` | Expiração de lote temporário. |
| `JOB-TEMPORAL-EXPORTACAO` | Expiração de exportação/arquivo em 24 horas. |
| `JOB-TEMPORAL-NOTIFICACAO-OCORRENCIA` | Condição temporal que materializa ou resolve ocorrência interna. |

Esses nomes identificam realizações temporais no anexo. Estado puramente derivado pode ser avaliado pelo relógio do servidor durante a leitura, sem linha ou tarefa persistida. Quando houver efeito materializado, a implantação pode agrupá-lo no mesmo agendador, mas cada execução conserva tipo, empresa/escopo, idempotência e correlação.

---

# 28. Matriz técnica resumida de autorização

| Família | Escopo | Origem aceita | Objeto | Campo | Reauth | Auditoria |
|---|---|---|---|---|---|---|
| Autenticação | Público/parcial | Contrato público/etapa | Própria tentativa | Segredos nunca saem | Conforme etapa | Segurança sanitizada |
| Minha conta | Autenticado | Próprio usuário | `usuario_id` da sessão | Identidade própria | Ações críticas | Mudança/segurança |
| Empresa/painel | Empresarial | Master ou perfil empresarial | Empresa da sessão | Matriz empresarial | Inativação | Mudança/acesso |
| Cadastro global de empresa | Global | Master ou perfil global específico | Empresa candidata | Campos globais | Crítica | Global |
| Usuários/perfis | Global | Master incorporado | Usuário/perfil autorizado | Matriz administrativa | Sim | Crítica e atômica |
| Empregado/MEI | Empresarial | Master ou perfil empresarial | Mesmo CNPJ | Cadastro/financeiro próprios | Correções críticas | Contextual |
| Competência/pagamento | Empresarial | Master ou perfil empresarial | Competência/participante da empresa | Financeiro por ação | Pagamento/correção | Financeira |
| Recibo/arquivo | Empresarial | Ação documental atual | Recibo da empresa | Conteúdo integral exigido | Regeneração/correção | Acesso sensível |
| ASO | Empresarial | Master ou perfil empresarial | Vínculo/exame da empresa | Resultado separado | Retificação/invalidação | Clínica/sensível |
| Clínica | Global na administração; empresarial somente na seleção do exame | Capacidade global de clínica; perfil de ASO apenas seleciona | Clínica global ativa | Cadastro global ou projeção mínima | Inativação/alteração | Global; seleção não concede gestão |
| Notificação | Empresarial | Usuário atual | Origem ainda acessível | Sem ampliação | Não | Leitura quando exigida |
| Exportação | Escopo da origem | Solicitante autorizado | Pedido próprio | Snapshot+revalidação | H02 global | Pedido/geração/download |
| Auditoria | Empresarial/global | Ação própria/master H02 | Evento observável | Redação atual | Exportação global | Acesso sensível |
| Incidente | Restrito | Autorização independente | Incidente alcançável | Campos restritos | Reabrir | Linha imutável |
| Worker | Técnico | Classe da tarefa | Referência+escopo | Payload mínimo | Não simula pessoa | Ator técnico |

## 28.1 Documento definitivo e permissão

PDF definitivo não sofre redação dinâmica. Para visualizar/baixar, o usuário precisa da ação documental e de acesso atual integral ao conteúdo obrigatório daquele tipo. Se faltar qualquer permissão, o arquivo é negado. Excel, por ser snapshot produzido para o solicitante, pode omitir ou mascarar colunas conforme a autorização aprovada no pedido.

---

# 29. Segurança específica da API

## 29.1 Proibições

- `X-Empresa-Id`, `X-Usuario-Id`, `X-Perfil`, papel ou permissão enviados pelo cliente;
- endpoint genérico `/transicoes`, `/estado`, `/admin` ou `/arquivos/{id}` sem vínculo tipado;
- filtros SQL, nomes de coluna ou `include/fields` livres;
- retorno de entidade completa depois de mutação sem nova serialização autorizada;
- `GET` que muda estado funcional;
- segredo em URL, log, analytics ou telemetria;
- URL pública/permanente de arquivo;
- DTO compartilhado com modelo do banco;
- resposta diferente que permita distinguir ID de outro CNPJ de ID inexistente;
- aceitar valor mascarado como valor real;
- ignorar campo extra em escrita;
- ação baseada somente em `if master`;
- cache de permissão entre requisições;
- worker com autoridade administrativa geral;
- sucesso parcial em lote aprovado como atômico.

## 29.2 Limitação de abuso

Limites separados cobrem login, TOTP, recuperação, CEP, busca exata de CPF/CNPJ, revelação sensível, exportação, prévia e download. A política considera finalidade, conta correlacionada protegida e origem, sem usar IP sozinho para bloquear toda a rede da empresa.

## 29.3 Logs

Logs técnicos podem conter método, ID do contrato, status, latência, correlação, código de erro, tamanho e escopo classificado. Não contêm corpo, query sensível, CPF/CNPJ, e-mail, salário, resultado de ASO, token, senha, TOTP, código, conteúdo de arquivo ou SQL com valores.

---

# 30. Gates automáticos e testes obrigatórios

## 30.1 Consistência documental

O validador do Documento 22 deverá provar:

```text
IDs do Documento 17 = IDs do Documento 18A = IDs do Documento 20A
total em cada conjunto = 440 IDs
transições executáveis em cada conjunto = 436
regras de projeção `ASO-R*` em cada conjunto = 4
duplicidades = 0
lacunas = 0
operações primárias ausentes = 0
```

## 30.2 Gates estáticos do contrato

1. Todo endpoint possui `API-*`, `OPR-*` e manifesto.
2. Toda mutação referencia transição válida do Documento 17.
3. Toda ação e campo existem e estão ativos no catálogo.
4. Recurso novo nasce negado em todos os perfis.
5. DTO não contém campo sem recurso/classificação.
6. Dependências de permissão não contêm ciclo.
7. Nenhuma rota empresarial aceita empresa do cliente como autoridade.
8. Nenhuma mutação usa `GET` ou fica sem CSRF.
9. Escrita crítica declara idempotência; raiz existente declara concorrência.
10. Operação assíncrona possui proprietário, estado, retomada e entrega.
11. Download reautoriza e usa `no-store`.
12. Operação crítica declara reautenticação.
13. Lote declara todos-ou-nenhum.
14. Todo erro usado existe no catálogo.
15. Toda leitura declara projeção de campos.
16. Toda alteração de associação, perfil, matriz, master ou capacidade de incidente consome prévia tipada vinculada ao candidato e às versões.

## 30.3 Cenários mínimos de segurança

| ID | Prova |
|---|---|
| TST-API-001 | ID real da empresa B enviado por usuário da A responde igual a ID inexistente. |
| TST-API-002 | Filtro, total, paginação e ordenação não misturam empresas. |
| TST-API-003 | Master também seleciona empresa e não infere incidente. |
| TST-API-004 | Escopo global, empresarial e incidente nunca coexistem. |
| TST-API-005 | Campo oculto não aparece em JSON, erro, filtro, total, histórico, notificação ou Excel. |
| TST-API-006 | Campo mascarado nunca chega integralmente nem é aceito de volta. |
| TST-API-007 | Campo somente leitura e propriedade extra rejeitam toda a escrita. |
| TST-API-008 | Redução de acesso revoga todas as sessões e impede commit aberto. |
| TST-API-009 | Reautenticação só vale cinco minutos para ação/alvo/versão/impacto vinculados. |
| TST-API-010 | Idempotência e locks deixam um único resultado em fechamento×semente, ausência×primeira emissão, `GO`×primeira emissão e delta×`GO`. Aprovação pessoal não pode ser representada; mesmo decisor DP/Contábil, ciclo/hash antigo ou outro `ledger_conteudo_hash` falham. `entrada_ativa = NULL` e `FALSE → TRUE` falham. `CTL-IMP-003` fixa conteúdo, `CTL-IMP-004` fixa reconciliação; manifesto com `ENT-IMP-05` nunca recebe `GO`. Delta/`INVALIDAR_GO` primeiro faz `IMP-CUT-018` falhar; `GO` primeiro rejeita o delta e exige o fluxo normal do sistema. Ano futuro é permitido com sistema autoritativo e `authority_epoch` corrente, negado em `[T_RET,T_REENT)` e retomado só após `T_REENT`; qualquer falha produz zero efeito parcial. |
| TST-API-011 | ETag antigo retorna 412 e não sobrescreve. |
| TST-API-012 | Falha de auditoria reverte a mutação. |
| TST-API-013 | Lote com um item inelegível confirma zero itens. |
| TST-API-014 | Pagamento confirmado permanece confirmado se o PDF falhar. |
| TST-API-015 | Revogação posterior permite gerar efeito comprometido, mas bloqueia download sem acesso atual. |
| TST-API-016 | Exportação revalida no pedido, worker e download. |
| TST-API-017 | Worker sem empresa/divergente falha; repetição não duplica número/arquivo. |
| TST-API-018 | Recuperação existente/inexistente e login inválido têm resposta neutra. |
| TST-API-019 | Polling, painel e contador não renovam sessão. |
| TST-API-020 | Erro nunca contém SQL, pilha, segredo ou dado de outro CNPJ. |
| TST-API-021 | Prévia de acesso vencida, consumida ou divergente em ator, alvo, versão, candidato, impacto ou revisão autoriza zero alterações. |
| TST-API-022 | Serviço adicional MEI é versionado e recalculado antes do pagamento; depois do pagamento, somente F04 o corrige sem sobrescrever fato ou recibo. |

## 30.4 Cenários mínimos funcionais de contrato

- empregado iniciado no dia 1 e admitido no dia 10: período sem registro usa base própria; salário-base e RA passam a vigorar conforme suas fontes, sem dupla contagem;
- ingresso dia 15: elegível a adiantamento proporcional; dia 16: somente final;
- fevereiro e mês com 31 dias usam D30;
- RA criada depois de adiantamento pago destina o devido corrente ao final;
- complemento avulso criado depois do adiantamento pago vai ao final;
- serviço adicional MEI corrigido antes do final pago invalida a conferência e recalcula; depois do final pago passa por F04;
- pagamento oficial, RA/reembolso e complementos podem ser confirmados separadamente;
- competência só fecha depois dos eventos exigidos;
- valor pago não é sobrescrito; correção gera cadeia preservada;
- desligamento com adiantamento de RA já pago apura somente saldo proporcional, nunca negativo;
- MEI renovado antes do fim mantém continuidade; novo contrato exige interrupção real;
- exame demissional não some por decurso do tempo após não comparecimento;
- recibos do adiantamento e do final permanecem separados.

---

# 31. Rastreabilidade por domínio

| Bloco do Documento 17 | Contratos principais | Entidades do Documento 18 | Controles do Documento 19 |
|---|---|---|---|
| 01 — Autenticação | API-AUT-*, API-CONTA-* | ENT-AUT-* | SEG-002 a SEG-004, sessão opaca |
| 02 — Empresa/contexto | API-CTX-*, API-EMPRESA-*, API-GEMP-* | ENT-EMP-*, ENT-AUT-09 | SEG-001, RLS, contexto único |
| 03 — Usuário/perfil | API-USR-*, API-MST-*, API-PRF-*, API-ACLINC-* | ENT-ACL-* | SEG-005/006, TX-003 |
| 04 — Empregado | API-EMP-* | ENT-COL-* | RLS, DTO por campo |
| 05 — MEI | API-MEI-* | ENT-MEI-* | RLS, vigências e concorrência |
| 06 — Condições | API-FINEMP-*, API-LAN-* | ENT-FIN-* | decimal, versões, TX-002 |
| 07 — Competência | API-CPT-*, API-K06-*, API-K07-* | ENT-CPT-* | locks curtos, D30 |
| 08 — Grupo/evento | API-GRP-* | ENT-GRP-* | cálculo determinístico |
| 09 — Pagamento | API-PAG-* | ENT-PAG-* | TX-004/005, idempotência |
| 10 — Correção | API-COR-*, API-AJU-* | ENT-COR-* | preservação, sem ajuste negativo |
| 11 — Recibo/arquivo | API-REC-*, API-LOT-* | ENT-REC-*, ENT-ARQ-* | storage privado, worker |
| 12 — Desligamento | API-DES-* | ENT-DES-* | D30, fatos separados |
| 13 — ASO | API-ASO-* | ENT-ASO-* | criptografia, acesso sensível |
| 14 — Clínica | API-CLI-* | ENT-CLI-* | entidade global autorizada |
| 15 — Notificação | API-NOT-* | ENT-NOT-* | projeção por origem atual |
| 16 — Exportação | rotas de origem + API-EXP-* | ENT-EXP-* | revalidação tripla, 24 h |
| 17 — Incidente | API-INC-* | ENT-INC-* | escopo restrito independente |
| 18 — UI/concorrência | API-AUT-014, UIX-* e políticas | ENT-TEC-*, estados UI | idempotência, ETag, no-store |

A correspondência individual, sem intervalos, fica no Documento 20A.

---

# 32. Viabilidade e desempenho do contrato

O inventário é compatível com o porte aprovado: três CNPJs, cerca de 65 ativos, mais de 300 inativos, alta rotatividade e até dez usuários simultâneos. A quantidade de contratos não implica serviços separados; todos pertencem ao monólito modular do Documento 19.

- listas por cursor e índices lógicos atendem até 2 s;
- painel agregado autorizado atende até 3 s;
- cálculo/fechamento de até 100 participantes permanece síncrono até 5 s;
- recibo individual/prévia até 5 s;
- Excel até 30 s, acompanhado pelo recurso de exportação;
- lote longo é assíncrono;
- autorização é recalculada por requisição sem cache distribuído;
- o volume pequeno torna viável revogar todas as sessões afetadas por redução de acesso;
- nenhuma rota carrega os dados das três empresas ao mesmo tempo.

Se medição real ultrapassar metas, primeiro serão ajustados consulta, índice, payload e tarefa. Não se introduz cache de autorização, microsserviço ou consulta multiempresa como atalho.

---

# 33. Definições que permanecem para antes da produção

Não bloqueiam os Documentos 21 e 22 nem o início posterior do desenvolvimento:

1. domínio real usado nos URIs de Problem Details;
2. fornecedor/região de hospedagem;
3. provedor/remetente de e-mail;
4. fornecedor de CEP;
5. responsáveis e substitutos por incidentes;
6. responsáveis nominais pelas homologações contábil, jurídica e operacional;
7. classificação/retenção final de IP e identificação de navegador;
8. competência inicial real;
9. data e janela de implantação;
10. política posterior ao mínimo de seis anos;
11. limites finais de logo e alguns rate limits, desde que iguais ou mais restritivos que o baseline;
12. parâmetros/fornecedor de `MF-01`, somente se priorizada.

A granularidade de revogação não está mais pendente: redução efetiva revoga todas as sessões dos usuários afetados, conforme o Documento 19 aprovado.

---

# 34. Critérios de aprovação do Documento 20

O documento poderá ser aprovado quando o usuário confirmar que:

- a API usa `/api/v1`, uma empresa da sessão e nenhum carregamento multiempresa operacional;
- dinheiro/percentual usam decimal em texto e datas seguem formatos canônicos;
- rotas de negócio usam comandos explícitos, sem exclusão física ou estado livre;
- erro de outro CNPJ é neutro;
- os quatro estados de campo protegem resposta, edição, filtro, total, histórico, Excel e documento;
- pagamento oficial, RA/reembolso, complementos e período sem registro permanecem individualizados;
- confirmação em lote é todos-ou-nenhum;
- competência fecha depois dos pagamentos exigidos e pode ser reaberta por ação específica;
- correção não sobrescreve pagamento/recibo;
- recibos e exportações são privados, reautorizados e sem URL pública;
- ASO não armazena documento/diagnóstico/descrição clínica;
- usuários/perfis são master-only; cadastro de empresa pode vir de perfil global específico;
- incidente continua em autorização independente do master;
- idempotência, ETag, reautenticação e auditoria são obrigatórios conforme o perfil;
- worker executa efeitos mínimos, uma empresa por transação;
- o Documento 20A cobre individualmente os 440 IDs funcionais: 436 transições executáveis e quatro regras de projeção `ASO-R*`;
- definições operacionais da seção 33 podem aguardar a preparação da produção.

---

# 35. Continuidade vigente

Os Documentos 21/21A e os pacotes 22/22A–22D e 23/23A–23D estão aprovados. Na data da aprovação, a continuidade era preparar o repositório e iniciar a `ETP-00` na ordem do Documento 21, com os gates e evidências do Documento 22. O checkpoint posterior registra a baseline em implementação controlada em `docs/ETP-00.md`.

---

# 36. Referências técnicas

- [RFC 9110 — HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110.html);
- [RFC 9457 — Problem Details for HTTP APIs](https://www.rfc-editor.org/rfc/rfc9457.html);
- [OWASP API Security — Broken Object Level Authorization](https://owasp.org/API-Security/editions/2023/en/0xa1-broken-object-level-authorization/);
- [OWASP API Security — Broken Function Level Authorization](https://owasp.org/API-Security/editions/2023/en/0xa5-broken-function-level-authorization/);
- [OWASP REST Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html);
- [OpenAPI Specification](https://spec.openapis.org/oas/latest.html).

As referências orientam o desenho técnico. As regras internas aprovadas continuam sendo a autoridade funcional.

---

**Situação final desta versão:** Documento 20 aprovado integralmente pelo usuário em 22/08/2026.  
**Anexo obrigatório:** Documento 20A — Matriz de Rastreabilidade API, Autorização e Transições.  
**Continuidade na data da aprovação:** pacote 23/23A–23D aprovado; preparar o repositório e iniciar a `ETP-00`; nenhum código de produção havia sido iniciado.  
**Checkpoint posterior:** baseline em implementação controlada conforme `docs/ETP-00.md`; produção não está autorizada nem foi iniciada.
