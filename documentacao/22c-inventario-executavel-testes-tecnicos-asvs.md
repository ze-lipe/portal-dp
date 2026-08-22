# Documento 22C

## Inventário Executável de Testes Técnicos e Contratos ASVS/WCAG

> **Status:** aprovado integralmente pelo usuário com o Documento 22 em 22 de agosto de 2026.  
> **Data-base:** 22 de agosto de 2026.  
> **Autoridades:** Documentos 17 a 21A aprovados.  
> **Estratégia:** Documento 22 e anexos 22A/22B.  
> **Contagem deste anexo:** 119 casos técnicos individuais, fora das 440 âncoras funcionais e das 60 provas visuais.

---

# 1. Finalidade e regra de contagem

Este anexo elimina famílias técnicas genéricas sem proprietário. Ele preserva os 22 identificadores `TST-API-001` a `TST-API-022` já reservados pelo Documento 20 e enumera segurança, auditoria, desempenho, resiliência, recuperação, acessibilidade e consistência documental. Todas as linhas são **casos obrigatórios planejados**, ainda não resultados executados; sua presença neste arquivo não significa que o comportamento já passou.

| Família | Quantidade |
|---|---:|
| `TST-API-001–022` | 22 |
| `QAT-AUD-001–008` | 8 |
| `QAT-SEC-001–041` | 41 |
| `QAT-PERF-001–007` | 7 |
| `QAT-RES-001–016` | 16 |
| `QAT-REC-001–008` | 8 |
| `QAT-A11Y-001–008` | 8 |
| `QAT-DOC-001–009` | 9 |
| **Total técnico** | **119** |

Esses 119 casos não entram na contagem das 440 linhas do Documento 22A. Os oito casos `QAT-A11Y` são parametrizados pelas 60 telas/subfluxos do Documento 22B, produzindo uma projeção planejada de **480 combinações tela × caso-raiz** sem criar 480 novos casos-raiz. O manifesto WCAG descrito na seção 11.3 detalhará, dentro dessas combinações, os critérios de sucesso aplicáveis.

---

# 2. Dicionário

## 2.1 Fonte

| Código | Fonte |
|---|---|
| `SRC-API` | Documento 20, seção 30 |
| `SRC-AUD` | Documento 19, auditoria; Documento 22, seção 16 |
| `SRC-SEC` | Documento 19, segurança e ameaças; Documento 22, seção 20 |
| `SRC-PERF` | Documento 21, seção 34.3; Documento 22, seção 21 |
| `SRC-RES` | Documento 19, resiliência; Documento 22, seção 22 |
| `SRC-REC` | Documento 19, backup; Documento 22, seção 23 |
| `SRC-A11Y` | Documento 16 e Documento 22, seção 24 |
| `SRC-DOC` | Documentos 17 a 22D e seus anexos |

## 2.2 Proprietário, camada e evidência

- `ENG`: Engenharia; `QA`: Qualidade; `SEG`: Segurança; `OPS`: Operação de infraestrutura.
- `CTR`: contrato/API/PostgreSQL; `CON`: concorrência; `AUD`: auditoria; `SEC`: segurança; `PIPE`: pipeline; `PERF`: desempenho; `FAL`: falha injetada; `REC`: recuperação; `A11Y`: acessibilidade; `DOC`: consistência documental.
- `EVD-CTR`, `EVD-CON`, `EVD-AUD`, `EVD-SEC`, `EVD-PIPE`, `EVD-PERF`, `EVD-FAL`, `EVD-REC`, `EVD-A11Y` e `EVD-DOC` são tipos. A execução cria o ID imutável `EVD-<ETP>-<execução>-<artefato>`.

## 2.3 Clusters ASVS

`A-ENC` V1; `A-VAL` V2; `A-WEB` V3; `A-API` V4; `A-FILE` V5; `A-AUTH` V6; `A-SESS` V7; `A-AUTZ` V8; `A-CRY` V11; `A-TLS` V12; `A-CONF` V13; `A-DATA` V14; `A-CODE` V15; `A-LOG` V16. O cluster orienta seleção, mas não substitui o ID individual versionado do controle.

## 2.4 Semântica de etapa e gate

A coluna `ETP` identifica a primeira etapa proprietária do caso técnico. A coluna `Gate` identifica os gates cuja prova o caso reforça ou **revalida quando se torna aplicável**; ela não autoriza uma etapa futura a aprovar retroativamente um gate anterior. A prova mínima de um gate anterior é fornecida pelos casos funcionais, de contrato ou pelas variações já executáveis naquela etapa, e a prova transversal tardia funciona como regressão adicional.

`QAT-SEC-028` é uma condição de **entrada e primeira atividade da ETP-00**, concluída antes do primeiro commit de código de produção. Para acessibilidade, `QAT-A11Y-001–007` pertencem à regressão final, mas suas variações são executadas também na etapa inicial de cada tela; `QAT-A11Y-008` possui prova-base na ETP-03 e regressão na ETP-11.

## 2.5 Rastreabilidade técnica herdada e executável

Casos funcionais recebem `ID funcional → OPR → BK/EPC → ETP` individualmente no Documento 22A. Casos técnicos transversais não inventam um ID funcional: cada ID abaixo herda **exatamente uma** regra desta tabela. A expansão automática deve resolver ao menos um requisito técnico e um `BK/EPC` garantidor existente para cada um dos 119 IDs. A regra mais específica prevalece sobre a ampla; nesta versão, os padrões são disjuntos e qualquer sobreposição, ausência ou referência inexistente é erro.

| Chave resolvida | Requisito técnico proprietário | BK/EPC garantidor |
|---|---|---|
| `TST-API-001–022` | `ARQ-004/ARQ-005/ARQ-008`; Documento 19 §§8, 10–12, 14 e 17; Documento 20 §30 | `BK-010/BK-376`; `EPC-01/EPC-18` |
| `QAT-AUD-001–008` | `ARQ-005`; Documento 19 §27 | `BK-006/BK-320/BK-331`; `EPC-01/EPC-16` |
| `QAT-SEC-001–027` | Documento 19 §§13–19 e ameaças `AME-01–27` da §29 | `BK-365/BK-366/BK-377`; `EPC-18` |
| `QAT-SEC-028–040` | Documento 19 §§23, 29 e 32; ASVS 5.0.0 | `BK-365/BK-366/BK-379`; `EPC-18` |
| `QAT-SEC-041` | Documento 19 §28 | `BK-340/BK-341/BK-342/BK-343/BK-344/BK-345/BK-346/BK-347/BK-348/BK-349/BK-373`; `EPC-17/EPC-18` |
| `QAT-PERF-001–007` | Documento 19 §21 | `BK-364/BK-367`; `EPC-18` |
| `QAT-RES-001–016` | `ARQ-002/ARQ-006/ARQ-010`; Documento 19 §22 | `BK-361/BK-375`; `EPC-18` |
| `QAT-REC-001–008` | `ARQ-005/ARQ-007/ARQ-010`; Documento 18 §§20/33; Documento 20 §20.3; Documento 22 §§11.5/17/23 | `BK-003/BK-210/BK-368/BK-371`; `EPC-01/EPC-11/EPC-18` |
| `QAT-A11Y-001–008` | Documento 19 §7.3; Documento 22 §24; WCAG 2.2 AA | `BK-378`; `EPC-18` |
| `QAT-DOC-001–008` | contratos dos Documentos 17–22D | `BK-014/BK-376`; `EPC-01/EPC-18` |
| `QAT-DOC-009` | Documento 22 §33.1 | `BK-013/BK-379`; `EPC-01/EPC-18` |

---

# 3. Casos de contrato e API

| ID | Objetivo | Fonte | Massa | Camada | Prop. | ETP | Gate | Evidência | Rastreio |
|---|---|---|---|---|---|---|---|---|---|
| TST-API-001 | ID real de B e inexistente respondem indistinguíveis ao usuário de A | SRC-API | MASS-TEN | CTR | ENG | ETP-00 | GAT-02 | EVD-CTR | AME-06; A-AUTZ |
| TST-API-002 | Filtros, totais, paginação e ordenação nunca misturam empresas | SRC-API | MASS-TEN/MASS-LOAD | CTR | ENG | ETP-00 | GAT-02 | EVD-CTR | AME-06/24; A-AUTZ/A-VAL |
| TST-API-003 | Master continua sujeito à empresa ativa e não infere incidente | SRC-API | MASS-BASE/MASS-INC | CTR | ENG | ETP-08B | GAT-02/04 | EVD-CTR | AME-06/22; A-AUTZ/A-DATA |
| TST-API-004 | Escopos global, empresarial e incidente são mutuamente exclusivos | SRC-API | MASS-BASE/MASS-INC | CTR | ENG | ETP-08B | GAT-04/09 | EVD-CTR | AME-06/22; A-AUTZ |
| TST-API-005 | Campo oculto não aparece em projeção, total, histórico ou arquivo | SRC-API | MASS-FLD | CTR | ENG | ETP-03 | GAT-04/08 | EVD-CTR | AME-08/18/22; A-AUTZ/A-DATA |
| TST-API-006 | Campo mascarado nunca chega integral nem é aceito como atualização | SRC-API | MASS-FLD | CTR | ENG | ETP-03 | GAT-04 | EVD-CTR | AME-08/18; A-AUTZ/A-DATA |
| TST-API-007 | Campo somente leitura e propriedade extra rejeitam a escrita inteira | SRC-API | MASS-FLD | CTR | ENG | ETP-03 | GAT-04 | EVD-CTR | AME-08; A-AUTZ/A-VAL |
| TST-API-008 | Redução de acesso revoga sessões e impede commit aberto | SRC-API | MASS-BASE/MASS-FLD | CON | ENG | ETP-03 | GAT-04 | EVD-CON | AME-09; A-SESS/A-AUTZ |
| TST-API-009 | Reautenticação vale cinco minutos e fica vinculada a ação, alvo, versão e impacto | SRC-API | MASS-AUT | CTR | ENG | ETP-03 | GAT-04 | EVD-CTR | AME-05/09; A-AUTH/A-SESS/A-AUTZ |
| TST-API-010 | Idempotência e locks deixam um resultado em fechamento×semente, ausência×primeira emissão, `GO`×primeira emissão e delta×`GO`; aprovação pessoal não pode ser representada e rejeita mesmo decisor DP/Contábil, ciclo/hash antigo; `entrada_ativa = NULL` e `FALSE → TRUE` falham; conteúdo e reconciliação usam hashes distintos; `ENT-IMP-05` bloqueia `GO`; delta/`INVALIDAR_GO` primeiro faz `IMP-CUT-018` perder e `GO` primeiro rejeita o delta, exigindo submissão no fluxo normal do sistema; ano futuro funciona com sistema autoritativo e `authority_epoch` corrente, falha em `[T_RET,T_REENT)` e volta só após `T_REENT`, sempre sem efeito parcial | SRC-API | MASS-FIN/MASS-DOC/MASS-LOAD | CON | ENG | ETP-00 | GAT-06/07 | EVD-CON | AME-15/16; A-AUTZ/A-VAL/A-CODE |
| TST-API-011 | ETag antigo devolve 412 sem sobrescrever estado | SRC-API | MASS-CAD/MASS-MEI | CON | ENG | ETP-04A | GAT-05 | EVD-CON | AME-09/16; A-VAL/A-CODE |
| TST-API-012 | Falha da auditoria reverte integralmente a mutação crítica | SRC-API | MASS-BASE | AUD | ENG | ETP-00 | GAT-09 | EVD-AUD | AME-17; A-VAL/A-LOG |
| TST-API-013 | Item inelegível em lote resulta em zero confirmações | SRC-API | MASS-FIN | CON | ENG | ETP-07 | GAT-06 | EVD-CON | AME-16; A-VAL/A-CODE |
| TST-API-014 | Falha de PDF não desfaz pagamento confirmado | SRC-API | MASS-FIN/MASS-DOC | FAL | ENG | ETP-06 | GAT-07 | EVD-FAL | AME-15; A-FILE/A-VAL |
| TST-API-015 | Efeito comprometido conclui, mas download exige autorização atual | SRC-API | MASS-DOC/MASS-FLD | CTR | ENG | ETP-04C | GAT-04/08 | EVD-CTR | AME-09/14/22; A-AUTZ/A-FILE |
| TST-API-016 | Exportação revalida autorização no pedido, worker e download | SRC-API | MASS-TEN/MASS-FLD/MASS-DOC | CTR | ENG | ETP-10 | GAT-08 | EVD-CTR | AME-06/09/14/22; A-AUTZ/A-FILE |
| TST-API-017 | Worker sem empresa/divergente falha fechado e repetição não duplica | SRC-API | MASS-TEN/MASS-DOC | FAL | ENG | ETP-04C | GAT-02/07/08 | EVD-FAL | AME-06/07/15; A-AUTZ/A-CODE |
| TST-API-018 | Recuperação para conta existente/inexistente e login inválido produzem resposta neutra; login válido segue o fluxo normal | SRC-API | MASS-AUT | SEC | ENG | ETP-01 | GAT-03 | EVD-SEC | AME-02; A-AUTH |
| TST-API-019 | Polling, painel e contador não renovam sessão | SRC-API | MASS-AUT | CTR | ENG | ETP-01 | GAT-03 | EVD-CTR | AME-03; A-SESS |
| TST-API-020 | Erro nunca expõe SQL, pilha, segredo ou dado de outro CNPJ | SRC-API | MASS-BASE/MASS-TEN | SEC | SEG | ETP-00 | GAT-10 | EVD-SEC | AME-18; A-API/A-LOG/A-DATA |
| TST-API-021 | Prévia vencida, consumida ou divergente autoriza zero alterações | SRC-API | MASS-BASE/MASS-FLD | CON | ENG | ETP-03 | GAT-04 | EVD-CON | AME-05/09/16; A-AUTZ/A-VAL |
| TST-API-022 | Serviço adicional MEI recalcula antes do pagamento e usa F04 depois | SRC-API | MASS-MEI/MASS-FIN | CON | ENG | ETP-07 | GAT-06/07 | EVD-CON | AME-15/16; A-VAL/A-CODE |

---

# 4. Casos de auditoria

| ID | Objetivo | Fonte | Massa | Camada | Prop. | ETP | Gate | Evidência | Rastreio |
|---|---|---|---|---|---|---|---|---|---|
| QAT-AUD-001 | Provar append-only e negar UPDATE/DELETE ao papel normal | SRC-AUD | MASS-BASE | AUD | ENG | ETP-00 | GAT-09 | EVD-AUD | AME-17; A-LOG |
| QAT-AUD-002 | Provar atomicidade entre mutação, evento e rollback | SRC-AUD | MASS-BASE/MASS-FIN | AUD | ENG | ETP-00 | GAT-09 | EVD-AUD | AME-17; A-VAL/A-LOG |
| QAT-AUD-003 | Antes/depois respeitam permissão atual e redação por campo | SRC-AUD | MASS-FLD | AUD | QA | ETP-03 | GAT-04/09 | EVD-AUD | AME-08/18/22; A-AUTZ/A-DATA |
| QAT-AUD-004 | Consulta, revelação, exportação e download sensíveis geram evento sem copiar conteúdo | SRC-AUD | MASS-FLD/MASS-DOC/MASS-ASO | AUD | QA | ETP-10 | GAT-08/09 | EVD-AUD | AME-18/22; A-LOG/A-DATA |
| QAT-AUD-005 | Histórico do colaborador e auditoria geral projetam a mesma fonte | SRC-AUD | MASS-CAD/MASS-FIN/MASS-ASO | AUD | QA | ETP-10 | GAT-09 | EVD-AUD | AME-17/18; A-LOG/A-AUTZ |
| QAT-AUD-006 | Checkpoint/hash detecta alteração, lacuna ou divergência | SRC-AUD | MASS-REC | AUD | SEG | ETP-07 | GAT-09/10 | EVD-AUD | AME-17/20; A-LOG/A-CRY |
| QAT-AUD-007 | UTC do servidor e correlação atravessam API, domínio, outbox e worker | SRC-AUD | MASS-BASE | AUD | QA | ETP-00 | GAT-09 | EVD-AUD | AME-18/25; A-LOG |
| QAT-AUD-008 | Retenção e escopos empresarial/global/incidente preservam autorização | SRC-AUD | MASS-LOAD/MASS-INC | AUD | SEG | ETP-11 | GAT-09/10 | EVD-AUD | AME-17/22; A-LOG/A-DATA |

---

# 5. Casos de segurança

| ID | Objetivo | Fonte | Massa | Camada | Prop. | ETP | Gate | Evidência | Rastreio |
|---|---|---|---|---|---|---|---|---|---|
| QAT-SEC-001 | Força bruta, senha comprometida, quinto erro, bloqueio, Argon2id e alerta | SRC-SEC | MASS-AUT | SEC | SEG | ETP-01 | GAT-03 | EVD-SEC | AME-01; A-AUTH/A-CRY/A-LOG |
| QAT-SEC-002 | Enumeração por mensagem, status, corpo, tempo e recuperação | SRC-SEC | MASS-AUT | SEC | SEG | ETP-01 | GAT-03 | EVD-SEC | AME-02; A-AUTH/A-LOG |
| QAT-SEC-003 | Fixação, roubo, rotação, logout, expiração e reuso de sessão | SRC-SEC | MASS-AUT | SEC | SEG | ETP-01 | GAT-03 | EVD-SEC | AME-03; A-WEB/A-SESS |
| QAT-SEC-004 | Consumo atômico de TOTP e código de recuperação concorrente | SRC-SEC | MASS-AUT | CON | SEG | ETP-01 | GAT-03 | EVD-CON | AME-04; A-AUTH/A-CRY |
| QAT-SEC-005 | Reset/contingência master exige fluxo, reautenticação, justificativa e auditoria | SRC-SEC | MASS-AUT/MASS-BASE | SEC | SEG | ETP-03 | GAT-04 | EVD-SEC | AME-05; A-AUTH/A-AUTZ/A-LOG |
| QAT-SEC-006 | IDOR/BOLA A×B×inexistente em API, tela, arquivo e tarefa | SRC-SEC | MASS-TEN | SEC | SEG | ETP-00 | GAT-02 | EVD-SEC | AME-06; A-AUTZ/A-DATA |
| QAT-SEC-007 | Reutilização de conexão nunca conserva contexto empresarial | SRC-SEC | MASS-TEN | CON | SEG | ETP-00 | GAT-02 | EVD-CON | AME-07; A-AUTZ/A-CODE |
| QAT-SEC-008 | Mass assignment, campo oculto/readonly e DTO fechado | SRC-SEC | MASS-FLD | SEC | SEG | ETP-03 | GAT-04 | EVD-SEC | AME-08; A-VAL/A-AUTZ/A-CODE |
| QAT-SEC-009 | Aba antiga e operação aberta falham após redução de acesso | SRC-SEC | MASS-FLD/MASS-AUT | CON | SEG | ETP-03 | GAT-04 | EVD-CON | AME-09; A-SESS/A-AUTZ |
| QAT-SEC-010 | CSRF, Origin, SameSite, método e requisição cross-site | SRC-SEC | MASS-AUT | SEC | SEG | ETP-01 | GAT-03 | EVD-SEC | AME-10; A-WEB/A-SESS |
| QAT-SEC-011 | XSS refletido, persistido, DOM e exportado em textos livres | SRC-SEC | MASS-BASE | SEC | SEG | ETP-11 | GAT-10 | EVD-SEC | AME-11; A-ENC/A-WEB/A-DATA |
| QAT-SEC-012 | SQL injection em filtros, busca, ordenação e comandos | SRC-SEC | MASS-BASE/MASS-LOAD | SEC | SEG | ETP-11 | GAT-10 | EVD-SEC | AME-12; A-ENC/A-API/A-CODE |
| QAT-SEC-013 | Fórmula em Excel para =, +, -, @, tab e nulo | SRC-SEC | MASS-DOC | SEC | SEG | ETP-04C | GAT-08 | EVD-SEC | AME-13; A-ENC/A-FILE |
| QAT-SEC-014 | Download direto, objeto privado, ID alheio, expirado e hash divergente | SRC-SEC | MASS-TEN/MASS-DOC | SEC | SEG | ETP-04C | GAT-08 | EVD-SEC | AME-14; A-FILE/A-AUTZ/A-DATA |
| QAT-SEC-015 | Worker repetido/interrompido gera único efeito, número e arquivo | SRC-SEC | MASS-DOC/MASS-FIN | CON | SEG | ETP-07 | GAT-07 | EVD-CON | AME-15; A-VAL/A-CODE |
| QAT-SEC-016 | Conflito no último candidato reverte lote inteiro | SRC-SEC | MASS-FIN | CON | SEG | ETP-07 | GAT-06 | EVD-CON | AME-16; A-VAL/A-CODE |
| QAT-SEC-017 | Privilégios, append-only e checkpoint detectam adulteração da auditoria | SRC-SEC | MASS-REC | SEC | SEG | ETP-07 | GAT-09/10 | EVD-SEC | AME-17; A-LOG/A-CRY |
| QAT-SEC-018 | Logs não contêm segredo, CPF/CNPJ integral, salário ou ASO | SRC-SEC | MASS-BASE | SEC | SEG | ETP-11 | GAT-10 | EVD-SEC | AME-18; A-LOG/A-DATA |
| QAT-SEC-019 | Cópia de backup permanece cifrada, isolada e inacessível ao operador comum | SRC-SEC | MASS-REC | SEC | SEG | ETP-11 | GAT-10 | EVD-SEC | AME-19; A-CRY/A-DATA/A-CONF |
| QAT-SEC-020 | Exclusão/ransomware não remove cópia protegida e restauração funciona | SRC-SEC | MASS-REC | REC | SEG | ETP-11 | GAT-10 | EVD-REC | AME-20; A-CONF/A-CRY/A-LOG |
| QAT-SEC-021 | Dependências, lockfile, licença, SBOM, artefato imutável e promoção do mesmo hash entre ambientes sem rebuild | SRC-SEC | MASS-BASE | PIPE | SEG | ETP-00 | GAT-10 | EVD-PIPE | AME-21; A-CONF/A-CODE |
| QAT-SEC-022 | Exportação volumosa respeita menor privilégio, escopo, auditoria e alerta | SRC-SEC | MASS-LOAD/MASS-TEN | SEC | SEG | ETP-10 | GAT-08/09 | EVD-SEC | AME-22; A-AUTZ/A-DATA/A-LOG |
| QAT-SEC-023 | KMS indisponível/rotacionado falha fechado e separa chaves | SRC-SEC | MASS-REC | FAL | SEG | ETP-00 | GAT-10 | EVD-FAL | AME-23; A-CRY/A-CONF |
| QAT-SEC-024 | Paginação, quota, timeout e concorrência resistem a esgotamento | SRC-SEC | MASS-LOAD | PERF | SEG | ETP-11 | GAT-10 | EVD-PERF | AME-24; A-VAL/A-API/A-CONF |
| QAT-SEC-025 | Deriva do relógio do servidor acima do limite configurado gera alerta; sincronização, UTC, fuso, relógio injetável e fronteiras nunca ampliam sessão/prazo | SRC-SEC | MASS-AUT/MASS-D30 | SEC | SEG | ETP-11 | GAT-03/06/09 | EVD-SEC | AME-25; A-VAL/A-SESS/A-LOG |
| QAT-SEC-026 | Após `CONSUMIDO`, bootstrap/replay/conta de infraestrutura não reabrem acesso; dois masters sem fator/código continuam sem backdoor técnico | SRC-SEC | MASS-AUT | SEC | SEG | ETP-03 | GAT-03/04 | EVD-SEC | AME-26; A-AUTH/A-AUTZ/A-CONF |
| QAT-SEC-027 | URL local/privada, metadata, redirecionamento e DNS não permitem SSRF | SRC-SEC | MASS-BASE | SEC | SEG | ETP-10 | GAT-10 | EVD-SEC | AME-27; A-ENC/A-TLS/A-CONF |
| QAT-SEC-028 | Antes do primeiro commit de produção, gerar manifesto ASVS L1 aplicável e L2 selecionado, com N/A justificado | SRC-SEC | MASS-BASE | DOC | SEG | ETP-00 | GAT-01 | EVD-DOC | ASVS aplicável |
| QAT-SEC-029 | Verificar senha/primeiro acesso/recuperação/TOTP e o bootstrap singleton: 2 pendentes, primeiro pronto sem aptidão, commit conjunto/consumo, concorrência, replay e falha parcial sem acesso antecipado | SRC-SEC | MASS-AUT | SEC | SEG | ETP-01 | GAT-03 | EVD-SEC | AME-01/02/04/26; A-AUTH/A-AUTZ/A-CONF |
| QAT-SEC-030 | Verificar envelope autenticado, nonce, AAD, HMAC, versões e chaves | SRC-SEC | MASS-TEN/MASS-REC | SEC | SEG | ETP-11 | GAT-10 | EVD-SEC | AME-19/23; A-CRY/A-DATA |
| QAT-SEC-031 | Verificar TLS, HSTS, CSP, CORS, cookie, no-store e Referrer-Policy | SRC-SEC | MASS-AUT | SEC | SEG | ETP-01 | GAT-03/10 | EVD-SEC | AME-03/10/11/18; A-WEB/A-TLS/A-DATA |
| QAT-SEC-032 | Verificar mídia, limites, parsing, erro uniforme e deserialização segura | SRC-SEC | MASS-BASE | SEC | SEG | ETP-00 | GAT-01/10 | EVD-SEC | AME-11/12/18/24; A-VAL/A-API/A-CODE |
| QAT-SEC-033 | Rejeitar logo grande, malformado, poliglota, ativo ou excessivo | SRC-SEC | MASS-DOC | SEC | SEG | ETP-04C | GAT-08 | EVD-SEC | AME-11/14/24; A-FILE/A-ENC |
| QAT-SEC-034 | Detectar segredo/dado proibido em repositório, build, fixture e evidência | SRC-SEC | MASS-BASE | PIPE | SEG | ETP-00 | GAT-10 | EVD-PIPE | AME-18/21; A-CONF/A-DATA/A-LOG |
| QAT-SEC-035 | Executar SAST e bloquear achado crítico/alto | SRC-SEC | MASS-BASE | PIPE | SEG | ETP-00 | GAT-10 | EVD-PIPE | AME-11/12/21/27; A-ENC/A-CODE |
| QAT-SEC-036 | Executar SCA, licença, SBOM e dependência vulnerável | SRC-SEC | MASS-BASE | PIPE | SEG | ETP-00 | GAT-10 | EVD-PIPE | AME-21; A-CONF/A-CODE |
| QAT-SEC-037 | Validar imagem, ambientes/chaves/dados segregados, configuração segura no startup e segredos externos; MFA e menor privilégio em toda conta administrativa; serviço sem login humano, segredo compartilhado ou privilégio administrativo amplo | SRC-SEC | MASS-BASE | PIPE | SEG | ETP-00 | GAT-10 | EVD-PIPE | AME-19/21/23/26; A-AUTH/A-CONF/A-TLS |
| QAT-SEC-038 | Executar DAST autenticado em papéis, escopos e rotas principais | SRC-SEC | MASS-BASE/MASS-TEN | SEC | SEG | ETP-11 | GAT-10 | EVD-SEC | AME-02/06/08/10/11/12/14 |
| QAT-SEC-039 | Executar avaliação independente sem conflito com implementador | SRC-SEC | MASS-BASE | SEC | SEG | ETP-11 | GAT-10 | EVD-SEC | AME-01–27; ASVS aplicável |
| QAT-SEC-040 | Fechar cada controle ASVS com resultado, evidência, defeito ou risco aceito | SRC-SEC | MASS-BASE | DOC | SEG | ETP-11 | GAT-10 | EVD-DOC | ASVS aplicável |
| QAT-SEC-041 | Exercitar incidente ou vazamento: detecção, acesso nominal, contenção, linha do tempo, evidência sanitizada, alcance, restauração e reabertura, sem disparo externo pelo sistema | SRC-SEC | MASS-INC/MASS-REC | SEC | SEG | ETP-08B | GAT-09/10 | EVD-SEC | Documento 19 §28; A-AUTZ/A-DATA/A-LOG/A-CONF |

`QAT-SEC-029` executa obrigatoriamente, sob o mesmo ID: (a) duas invocações concorrentes de `CTL-BST-001`; (b) repetição exata após resposta perdida e intenção divergente; (c) primeiro titular em `PRONTO_AGUARDANDO_PAR` tentando concluir login e obter sessão operacional; (d) dois titulares configurando TOTP simultaneamente; (e) falha injetada antes de persistir a ativação conjunta; e (f) novo login somente depois de ambos `ATIVADO_CONJUNTAMENTE` e do agregado `CONSUMIDO`. Os oráculos são exatamente dois membros, zero terceiro usuário, zero `master_apto` antecipado, zero sessão operacional intermediária, um único instante de ativação para o par e nenhuma alteração parcial. `QAT-SEC-026` tenta novamente o comando técnico depois do consumo e comprova que só a evidência append-only permanece.

---

# 6. Casos de desempenho

| ID | Objetivo | Fonte | Massa | Camada | Prop. | ETP | Gate | Evidência | Rastreio |
|---|---|---|---|---|---|---|---|---|---|
| QAT-PERF-001 | Login, seletor, lista e filtro com p95 até 2 s | SRC-PERF | MASS-LOAD/MASS-AUT | PERF | QA | ETP-11 | GAT-10 | EVD-PERF | AME-24; A-VAL/A-CONF |
| QAT-PERF-002 | Painel empresarial com p95 até 3 s | SRC-PERF | MASS-LOAD | PERF | QA | ETP-11 | GAT-10 | EVD-PERF | AME-24; A-CONF |
| QAT-PERF-003 | Competência de uma empresa com 100 participantes e p95 até 5 s | SRC-PERF | MASS-FIN/MASS-LOAD | PERF | QA | ETP-05 | GAT-06/10 | EVD-PERF | AME-16/24/25; A-VAL/A-CODE |
| QAT-PERF-004 | Recibo imediato/assíncrono respeita limites e estado visível | SRC-PERF | MASS-DOC/MASS-LOAD | PERF | QA | ETP-07 | GAT-07/10 | EVD-PERF | AME-15/24; A-FILE/A-CODE |
| QAT-PERF-005 | Excel operacional tem p95 até 30 s | SRC-PERF | MASS-DOC/MASS-LOAD | PERF | QA | ETP-10 | GAT-08/10 | EVD-PERF | AME-13/22/24; A-FILE/A-DATA |
| QAT-PERF-006 | Lote de 100 itens respeita aceite/progresso, p95, máximo, retomada e não bloqueia a sessão | SRC-PERF | MASS-FIN/MASS-LOAD | PERF | QA | ETP-11 | GAT-06/10 | EVD-PERF | AME-15/16/24; A-VAL/A-CODE/A-CONF |
| QAT-PERF-007 | Dez usuários simultâneos preservam isolamento e metas dos fluxos concorrentes | SRC-PERF | MASS-TEN/MASS-LOAD | PERF | QA | ETP-11 | GAT-02/10 | EVD-PERF | AME-06/07/24; A-AUTZ/A-CONF |

---

# 7. Casos de resiliência

| ID | Objetivo | Fonte | Massa | Camada | Prop. | ETP | Gate | Evidência | Rastreio |
|---|---|---|---|---|---|---|---|---|---|
| QAT-RES-001 | Banco indisponível não produz gravação local/parcial | SRC-RES | MASS-BASE | FAL | OPS | ETP-00 | GAT-10 | EVD-FAL | AME-16/24; A-VAL/A-CONF |
| QAT-RES-002 | Falha de réplica retira só ela do tráfego quando HA existe | SRC-RES | MASS-LOAD | FAL | OPS | ETP-11 | GAT-10 | EVD-FAL | AME-24; A-CONF |
| QAT-RES-003 | Worker indisponível preserva fluxo síncrono e tarefas aguardam | SRC-RES | MASS-DOC | FAL | OPS | ETP-00 | GAT-07/10 | EVD-FAL | AME-15; A-CODE |
| QAT-RES-004 | Worker interrompido retoma sem duplicar efeito | SRC-RES | MASS-DOC/MASS-FIN | FAL | OPS | ETP-00 | GAT-07/10 | EVD-FAL | AME-15; A-CODE |
| QAT-RES-005 | Storage indisponível após pagamento preserva pagamento e sinaliza arquivo | SRC-RES | MASS-FIN/MASS-DOC | FAL | OPS | ETP-06 | GAT-07 | EVD-FAL | AME-14/15; A-FILE |
| QAT-RES-006 | E-mail indisponível não amplia token e retoma idempotente | SRC-RES | MASS-AUT | FAL | OPS | ETP-01 | GAT-03 | EVD-FAL | AME-02/15; A-AUTH |
| QAT-RES-007 | CEP indisponível permite endereço manual sem ampliar confiança | SRC-RES | MASS-CAD/MASS-MEI | FAL | OPS | ETP-04A | GAT-05 | EVD-FAL | AME-24/27; A-VAL |
| QAT-RES-008 | Telemetria indisponível não desliga auditoria nem libera ação | SRC-RES | MASS-BASE | FAL | OPS | ETP-00 | GAT-09/10 | EVD-FAL | AME-17/18; A-LOG |
| QAT-RES-009 | KMS indisponível rejeita operação sensível sem dado aberto | SRC-RES | MASS-REC | FAL | OPS | ETP-00 | GAT-10 | EVD-FAL | AME-23; A-CRY/A-CONF |
| QAT-RES-010 | Outbox atrasada preserva negócio e alerta atraso | SRC-RES | MASS-DOC | FAL | OPS | ETP-00 | GAT-09/10 | EVD-FAL | AME-15/24; A-CODE/A-LOG |
| QAT-RES-011 | Hash divergente bloqueia download e gera alerta | SRC-RES | MASS-DOC | FAL | OPS | ETP-04C | GAT-08/09 | EVD-FAL | AME-14/17; A-FILE/A-LOG |
| QAT-RES-012 | Resposta perdida após commit reconcilia exatamente um efeito | SRC-RES | MASS-FIN/MASS-DOC | FAL | OPS | ETP-00 | GAT-06/07 | EVD-FAL | AME-15/16; A-VAL/A-CODE |
| QAT-RES-013 | Candidato de lote alterado confirma zero itens | SRC-RES | MASS-FIN | FAL | OPS | ETP-07 | GAT-06 | EVD-FAL | AME-16; A-VAL/A-CODE |
| QAT-RES-014 | Saúde, métricas e alertas provam 5/10 minutos e deduplicação | SRC-RES | MASS-LOAD | FAL | OPS | ETP-11 | GAT-09/10 | EVD-FAL | AME-18/24; A-LOG/A-CONF |
| QAT-RES-015 | Retry aceita apenas falha transitória, aplica limite, backoff+jitter e circuit open/half-open/close sem tempestade | SRC-RES | MASS-BASE/MASS-LOAD | FAL | OPS | ETP-00 | GAT-09/10 | EVD-FAL | AME-15/24; A-VAL/A-CODE/A-CONF |
| QAT-RES-016 | Reconciliações de outbox, arquivo, número, pagamento, ASO, auditoria, backup e temporário são idempotentes e não inventam efeito | SRC-RES | MASS-REC/MASS-DOC/MASS-ASO | FAL | OPS | ETP-11 | GAT-07/09/10 | EVD-FAL | AME-15/17/20/25; A-VAL/A-LOG/A-CODE |

---

# 8. Casos de recuperação

| ID | Objetivo | Fonte | Massa | Camada | Prop. | ETP | Gate | Evidência | Rastreio |
|---|---|---|---|---|---|---|---|---|---|
| QAT-REC-001 | Comprovar corte lógico comum dentro do RPO de uma hora | SRC-REC | MASS-REC | REC | OPS | ETP-11 | GAT-10 | EVD-REC | AME-19/20; A-DATA |
| QAT-REC-002 | Restaurar pontos distintos por PITR dentro da janela de 35 dias e, separadamente, restaurar a base a partir do backup/snapshot diário | SRC-REC | MASS-REC | REC | OPS | ETP-11 | GAT-10 | EVD-REC | AME-20; infraestrutura |
| QAT-REC-003 | Restaurar objetos, hashes, metadados, chaves e cadeia protegida de autoridade (`ProductionGo`, `T_GO`, `T_RET`, `T_REENT`, `authority_epoch`) no corte; evento ausente só é recomposto idempotentemente por prova externa exata | SRC-REC | MASS-REC | REC | OPS | ETP-11 | GAT-10 | EVD-REC | AME-19/20/23; A-CRY/A-DATA |
| QAT-REC-004 | Laboratório fica isolado, sem rota pública ou efeito externo | SRC-REC | MASS-REC | REC | OPS | ETP-11 | GAT-10 | EVD-REC | AME-19/22/27; A-CONF/A-TLS |
| QAT-REC-005 | Validar migração/base limpa, upgrade n-1, expand/contract, rollforward/rollback e preservação de RLS, constraints, empresas, permissões, pagamentos, recibos, auditoria, `ENT-IMP-04`, primeiro `production_go_id` e eventos de autoridade append-only | SRC-REC | MASS-REC | REC | OPS | ETP-11 | GAT-10 | EVD-REC | AME-06/17/20; DOD-02; A-AUTZ/A-LOG |
| QAT-REC-006 | Invalidar sessões, tokens, códigos e temporários; reconciliar credenciais | SRC-REC | MASS-REC/MASS-AUT | REC | OPS | ETP-11 | GAT-03/10 | EVD-REC | AME-03/04/05/26; A-AUTH/A-SESS |
| QAT-REC-007 | Exercitar `ENT-IMP-01/02/03/04/05`, `CTL-IMP-001–004` e `CTL-REC-001`: decisões próprias/append-only; `entrada_ativa` não nula/irreversível; hashes distintos; três ramos; `ENT-IMP-05` sem reterminalização; corridas fechamento×seed, ausência×primeira emissão, `GO`×primeira emissão e delta×`GO`; fence/ACK por fonte; falhas antes/depois do CAS; app/banco indisponíveis em `T_RET`; projeção local defasada; manifesto inelegível sem `GO`; ano futuro bloqueado em `[T_RET,T_REENT)`; handoff numérico; primeira faixa `PENDENTE_RECONCILIACAO` bloqueia a seguinte e só vira `RECONCILIADA` após prova integral; mudança pós-seed força `NO-GO`/baseline limpo | SRC-REC | MASS-REC/MASS-DOC/MASS-LOAD | REC | OPS | ETP-11 | GAT-07/10 | EVD-REC | AME-15/16/20; A-AUTZ/A-VAL/A-CODE |
| QAT-REC-008 | Medir RPO/RTO e aprovar o ramo; testar cortes antes/depois de `T_GO`, `T_RET` e `T_REENT`, recompor a cadeia de autoridade por prova externa e manter alvo fechado se controle anterior+ledger forem correntes; sem corte comum confiável ≤60 min, rejeitar corte suspeito, reconstruir/reconciliar por evidência e obter decisão nominal antes da abertura | SRC-REC | MASS-REC | REC | OPS | ETP-11 | GAT-10 | EVD-REC | AME-19/20; A-CONF/A-LOG |

---

# 9. Casos de acessibilidade

Cada caso gera resultados com o ID canônico da tela, por exemplo `QAT-A11Y-001::A01`, e referencia o caso visual correspondente `QAT-UI-A01`. Não existe uma terceira identidade `ECR-*`. A coluna ETP usa `ETP-11` como proprietária da regressão final; cada variação é executada também na **ETP inicial do respectivo `QAT-UI-*` informada no Documento 22B**.

| ID | Objetivo | Fonte | Massa | Camada | Prop. | ETP | Gate | Evidência | Rastreio |
|---|---|---|---|---|---|---|---|---|---|
| QAT-A11Y-001 | Automação aplicável nas 60 telas/subfluxos | SRC-A11Y | MASS-22B | A11Y | QA | ETP-11 | GAT-10 | EVD-A11Y | WCAG 2.2 AA |
| QAT-A11Y-002 | Teclado completo, foco visível e retorno após modal | SRC-A11Y | MASS-22B | A11Y | QA | ETP-11 | GAT-10 | EVD-A11Y | WCAG 2.2 AA |
| QAT-A11Y-003 | Rótulo, instrução e erro ligados ao campo e resumo | SRC-A11Y | MASS-22B | A11Y | QA | ETP-11 | GAT-10 | EVD-A11Y | WCAG 2.2 AA |
| QAT-A11Y-004 | Contraste e estado não dependem somente de cor | SRC-A11Y | MASS-22B | A11Y | QA | ETP-11 | GAT-10 | EVD-A11Y | WCAG 2.2 AA |
| QAT-A11Y-005 | Tabelas, cabeçalhos, botões e estados têm semântica correta | SRC-A11Y | MASS-22B | A11Y | QA | ETP-11 | GAT-10 | EVD-A11Y | WCAG 2.2 AA |
| QAT-A11Y-006 | Zoom/reflow/responsividade sem perda e nenhuma ação só por hover | SRC-A11Y | MASS-22B | A11Y | QA | ETP-11 | GAT-10 | EVD-A11Y | WCAG 2.2 AA |
| QAT-A11Y-007 | Carregamento, progresso, erro e conclusão são anunciáveis | SRC-A11Y | MASS-22B | A11Y | QA | ETP-11 | GAT-10 | EVD-A11Y | WCAG 2.2 AA |
| QAT-A11Y-008 | Tecnologia assistiva, confirmação irreversível e remoção após revogação; prova-base na ETP-03 e regressão final | SRC-A11Y | MASS-22B | A11Y | QA | ETP-03 | GAT-04/10 | EVD-A11Y | WCAG 2.2 AA; A-AUTZ |

---

# 10. Casos de consistência documental

| ID | Objetivo | Fonte | Massa | Camada | Prop. | ETP | Gate | Evidência | Rastreio |
|---|---|---|---|---|---|---|---|---|---|
| QAT-DOC-001 | Validar exatamente 440 IDs funcionais únicos | SRC-DOC | MASS-DOC | DOC | QA | ETP-00 | GAT-01 | EVD-DOC | Docs 17/21/21A/22A |
| QAT-DOC-002 | Validar 436 transições e quatro projeções ASO-R | SRC-DOC | MASS-DOC | DOC | QA | ETP-00 | GAT-01 | EVD-DOC | Docs 17/20A/22A |
| QAT-DOC-003 | Validar 253 itens, 18 épicos, proprietários, cobertura e todo o DAG; no subgrafo de `BK-077`, provar predecessores imediatos completos: `077←014`; `040←004/027/041/077`; `063←014`; `064←063`; `066←010/011/063`; `065←040/063/064/066/077`; `074←040/064/065/077`, com etapas corretas e sem núcleo parcial implícito | SRC-DOC | MASS-DOC | DOC | QA | ETP-00 | GAT-01 | EVD-DOC | Docs 21/21A |
| QAT-DOC-004 | Validar 18 suítes, 60 telas, 24 vetores D30 e 25 cenários compostos | SRC-DOC | MASS-DOC | DOC | QA | ETP-00 | GAT-01 | EVD-DOC | Docs 17/22/22B/22D |
| QAT-DOC-005 | Detectar referência órfã, duplicada, inexistente ou ambígua | SRC-DOC | MASS-DOC | DOC | QA | ETP-00 | GAT-01 | EVD-DOC | Docs 17–22D |
| QAT-DOC-006 | Validar ID → OPR/API → BK/EPC → ETP → teste/evidência e cenário composto aplicável | SRC-DOC | MASS-DOC | DOC | QA | ETP-00 | GAT-01 | EVD-DOC | Docs 20/20A/21A/22A/22C/22D |
| QAT-DOC-007 | Detectar dependência futura, ciclo ou etapa incompatível | SRC-DOC | MASS-DOC | DOC | QA | ETP-00 | GAT-01 | EVD-DOC | Docs 21/21A/22 |
| QAT-DOC-008 | Provar reprodutibilidade, gerador determinístico e igualdade por hash | SRC-DOC | MASS-DOC | DOC | QA | ETP-11 | GAT-01/10 | EVD-DOC | Docs 22A/22B/22C/22D |
| QAT-DOC-009 | Validar repositório de evidências: ACL de menor privilégio, checksum, manifesto imutável, retenção e detecção de substituição | SRC-DOC | MASS-DOC | DOC | QA | ETP-00 | GAT-01/10 | EVD-DOC | Documento 22 §33.1 |

---

# 11. Contrato do manifesto ASVS

## 11.1 Fonte congelada

A fonte é o artefato oficial inglês `OWASP_Application_Security_Verification_Standard_5.0.0_en.flat.json` da release `v5.0.0_release`, nunca a branch mutável `master`. O importador exige **345 controles totais**, **70 controles L1**, IDs versionados e o SHA-256:

`8201b20eec2908c3380ac600c91c8ba746346fbb808859366abb232027532311`

Fonte fixada: <https://github.com/OWASP/ASVS/releases/download/v5.0.0_release/OWASP_Application_Security_Verification_Standard_5.0.0_en.flat.json>.

## 11.2 Uma linha por controle avaliado

| Campo | Regra |
|---|---|
| ID ASVS | versionado, por exemplo `v5.0.0-8.2.2` |
| Nível | L1, L2 ou adicional adotado por risco |
| Situação | `APLICÁVEL`, `NÃO_APLICÁVEL` ou `ADIADO` |
| Justificativa | obrigatória para `NÃO_APLICÁVEL`; aprovada por Segurança |
| Caso proprietário | ao menos um `TST-API-*` ou `QAT-SEC-*` |
| Casos complementares | demais QAT/TST que produzem prova |
| Evidência | ID real `EVD-*`, não apenas o tipo |
| Responsável | nome e papel na execução |
| Resultado | passou, falhou ou bloqueado |
| Defeito/risco | obrigatório quando não passou |

`ADIADO` bloqueia o gate final. Todos os L1 aplicáveis são obrigatórios. Os L2 escolhidos por risco são enumerados nominalmente antes de qualquer código de produção. Controles de tecnologia ausente — por exemplo OAuth/OIDC, token autocontido, WebRTC, GraphQL ou WebSocket — só recebem `NÃO_APLICÁVEL` com justificativa verificável; se a arquitetura mudar, voltam automaticamente para avaliação.

## 11.3 Contrato do manifesto WCAG 2.2 AA

A referência normativa congelada é a Recomendação W3C **WCAG 2.2**, versão de 12 de dezembro de 2024: <https://www.w3.org/TR/2024/REC-WCAG22-20241212/>. Antes da implementação visual, sua versão e o hash do artefato obtido serão registrados no repositório; uma fonte mutável não poderá substituir silenciosamente a versão homologada.

O manifesto terá uma linha para cada critério de sucesso de níveis A e AA avaliado, com:

| Campo | Regra |
|---|---|
| Critério WCAG | identificador e título da versão congelada |
| Nível | A ou AA |
| Situação | `APLICÁVEL`, `NÃO_APLICÁVEL` ou `ADIADO` |
| Justificativa | obrigatória para `NÃO_APLICÁVEL`, com aprovação de QA; mudança da tela força reavaliação |
| Tela/jornada | um ou mais IDs canônicos do Documento 22B e o estado exercitado |
| Método | automatizado, teclado, tecnologia assistiva, inspeção humana ou combinação |
| Caso proprietário | um ou mais `QAT-A11Y-001–008` |
| Evidência e resultado | ID real `EVD-*`, passou, falhou ou bloqueado |
| Defeito/risco | obrigatório quando não passou; `ADIADO` bloqueia o GAT-10 |

Os 480 vínculos raiz `oito QAT-A11Y × 60 telas/subfluxos` formam o índice de execução. O manifesto de critérios registra a aplicabilidade fina sem inflar a contagem dos oito casos-raiz. Automação não substitui teclado, tecnologia assistiva ou inspeção humana quando o critério exigir avaliação manual.

---

# 12. Contratos de validação

## 12.1 Validador documental atual

O validador do pacote de planejamento falha se:

1. não houver exatamente 119 IDs técnicos únicos;
2. algum `TST-API-001–022` estiver ausente ou renomeado;
3. alguma ameaça `AME-01–27` não possuir `QAT-SEC` proprietário do mesmo ordinal;
4. algum caso estiver sem objetivo ou usar fonte, massa, camada, proprietário, ETP, gate ou evidência fora dos catálogos permitidos;
5. um caso técnico entrar na contagem das 440 âncoras;
6. a projeção estrutural não corresponder a 60 telas únicas × oito `QAT-A11Y` = 480 vínculos planejados;
7. o artefato oficial ASVS importado divergir do SHA-256 fixado, de 345 IDs totais únicos, de 70 controles L1 ou do padrão de ID esperado;
8. algum dos 119 IDs não resolver exatamente uma regra de rastreabilidade técnica, ou referenciar `ARQ`, `BK` ou `EPC` inexistente;
9. Documento 22, 22A, 22B, 22C e 22D divergirem nas contagens e vínculos estruturais verificados, inclusive nos 25 vínculos cenário → testes → etapa → gate → evidência;
10. o Documento 22A divergir do seu gerador determinístico.

O script documental atual não declara que `QAT-DOC-*`, `QAT-SEC-*` ou qualquer outro caso futuro já passou. Ele valida o plano, os vínculos e a baseline importada.

## 12.2 Validador de implementação e gates

Antes da ETP-00 concluir — e novamente no GAT-10 — o validador de implementação deverá falhar se:

1. o manifesto de aplicabilidade não possuir uma linha para cada um dos 345 controles importados;
2. controle L1 aplicável ou L2 selecionado não possuir caso, ID real de evidência e resultado;
3. existir `NÃO_APLICÁVEL` sem justificativa e aprovação de Segurança;
4. existir `ADIADO` no gate final;
5. algum dos 119 casos depender de etapa futura para aprovar uma etapa anterior, considerada a semântica de revalidação da seção 2.4;
6. alguma das 60 telas não possuir os oito resultados A11Y aplicáveis;
7. algum critério A/AA do manifesto WCAG estiver sem decisão, método, tela aplicável, resultado ou justificativa aprovada quando não aplicável;
8. evidência contiver dado proibido, checksum divergente ou cadeia de custódia incompleta;
9. qualquer `QAT-DOC-*` detectar órfão, duplicidade, ciclo, dependência futura, divergência de hash ou gerador não determinístico.

---

**Situação desta versão:** 119 casos técnicos enumerados, revisados e aprovados pelo usuário.  
**Continuidade vigente:** pacote 23/23A–23D aprovado; preparar o repositório e iniciar a `ETP-00`; execução permanece `NOT_RUN_PLANNED`.  
**Código de produção:** ainda não iniciado.
