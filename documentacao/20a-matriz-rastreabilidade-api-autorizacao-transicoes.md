# Documento 20A

## Matriz de Rastreabilidade API, Autorização e Transições

> **Status:** aprovado integralmente pelo usuário com o Documento 20 em 22/08/2026.  
> **Data-base:** 21 de agosto de 2026.  
> **Autoridade funcional:** Documento 17 aprovado.  
> **Modelo lógico:** Documentos 18 e 18A aprovados.  
> **Arquitetura:** Documento 19 aprovado.  
> **Contratos referenciados:** Documento 20 aprovado.  
> **Sincronização técnica posterior:** raízes `ENT-IMP-01/02/03/04/05`, relações `REL-IMP-01/02/03/04`, fases pessoais de aprovação, inelegibilidade de `GO`, `authority_epoch` e provas de `ProductionGo` alinhadas ao pacote 23, aprovado integralmente pelo usuário em 22/08/2026.

---

# 1. Finalidade

Esta matriz prova como os **440 IDs funcionais** do Documento 17 chegam à implementação técnica sem criar um endpoint por ID. O conjunto é formado por **436 transições** e pelas **quatro regras de projeção `ASO-R01` a `ASO-R04`**. Cada ID aparece exatamente uma vez e recebe:

- uma operação primária `OPR-*`;
- um tipo de gatilho;
- um contrato HTTP, tarefa, estado local ou política técnica;
- um perfil transacional;
- uma política de idempotência/concorrência;
- uma política de autorização/auditoria;
- a âncora `TST-<ID>` já reservada para o Documento 22.

Uma operação pode realizar várias transições, conforme estado e resultado. O navegador nunca envia o ID da transição nem escolhe o estado final. Nas realizações do servidor sujeitas a auditoria, o servidor identifica cada transição efetivada e registra o evento segundo `APIAUD-*`; estados `UI_LOCAL` não geram auditoria de negócio, e projeções puras só auditam quando houver revelação sensível prevista. As quatro regras `ASO-R*` não representam mudança de estado: elas projetam um resultado já persistido conforme a autorização atual.

# 2. Contrato de verificação automática

O gate deverá provar:

1. conjunto de IDs do Documento 17 = conjunto do Documento 18A = primeira coluna deste documento;
2. contagem total = **440 IDs funcionais**, sendo **436 transições** e **quatro regras de projeção `ASO-R*`**;
3. duplicados = **zero**;
4. operação primária vazia = **zero**;
5. gatilho vazio = **zero**;
6. realização vazia = **zero**;
7. política técnica vazia = **zero**;
8. âncora de teste vazia = **zero**;
9. cada referência `API-*`, `JOB-*`, `UIX-*`, `AUTZ-*`, `TX-*`, `IDEM-*`, `CONC-*` ou `APIAUD-*` existe no Documento 20 ou no manifesto executável; cada `OPR-*` da coluna “Operação primária” declara uma família deste catálogo, e qualquer `OPR-*` usado fora dela precisa corresponder a uma dessas famílias ou a uma operação exata do manifesto;
10. cada `TST-<ID>` conserva exatamente o sufixo do ID funcional.

Para a verificação, a gramática de referências é fechada:

- um ID exato contém o prefixo completo, como `TX-002`, `JOB-004` ou `APIAUD-02`;
- na coluna “Operação primária”, cada valor `OPR-*` sem curinga, como `OPR-ASO-PRAZO-AVALIAR`, é a **chave declaratória de uma família semântica**, e não a alegação de que já exista um contrato executável com esse mesmo ID; o manifesto poderá expandi-la em operações técnicas exatas, mantendo a associação reversa;
- `PREFIXO-001/002` expande para `PREFIXO-001` e `PREFIXO-002`; a mesma regra vale para `TX-002/004`, `JOB-001/002`, `APIAUD-01/02` e formas equivalentes;
- uma família termina em `-*`, como `API-ASO-*`, e precisa possuir ao menos um membro declarado no Documento 20;
- referências completas separadas por ` / ` são verificadas individualmente;
- `N/A`, `perfil da operação`, `APIAUD conforme operação` e textos explicativos não são IDs e somente podem aparecer nas classes em que esta matriz os admite expressamente;
- prefixo desconhecido, abreviação fora dessa gramática ou família sem membro faz o gate falhar.

# 3. Classes de realização

| Classe | Significado |
|---|---|
| `HTTP` | Intenção iniciada por rota pública tipada. |
| `HTTP_INTERNO` | Resultado automático dentro do mesmo caso de uso iniciado por HTTP. |
| `JOB_WORKER` | Efeito em segundo plano com outbox/fila. |
| `JOB_TEMPORAL` | Passagem do tempo avaliada pelo relógio do servidor por agendador; só materializa efeito quando a regra exigir persistência. Estado puramente derivado pertence a `PROJECAO`. |
| `UI_LOCAL` | Estado local da interface, sem persistência própria. |
| `PROJECAO` | Regra pura que deriva apresentação/estado observável de uma fonte já persistida, sem comando ou transição própria. |
| `POLITICA` | Garantia transversal de concorrência, idempotência, autorização ou atomicidade. |

# 4. Resumo de cobertura

| Bloco funcional | Linhas esperadas | Linhas nesta matriz | Lacunas |
|---|---:|---:|---:|
| Bloco 01 — Autenticação | 28 | 28 | 0 |
| Bloco 02 — Empresa e contexto | 22 | 22 | 0 |
| Bloco 03 — Usuários e permissões | 40 | 40 | 0 |
| Bloco 04 — Pessoa e vínculo | 12 | 12 | 0 |
| Bloco 05 — MEI e contrato | 21 | 21 | 0 |
| Bloco 06 — Condições financeiras | 39 | 39 | 0 |
| Bloco 07 — Competência | 15 | 15 | 0 |
| Bloco 08 — Grupo financeiro | 18 | 18 | 0 |
| Bloco 09 — Confirmação e pagamento | 21 | 21 | 0 |
| Bloco 10 — Correções | 29 | 29 | 0 |
| Bloco 11 — Recibos e arquivos | 27 | 27 | 0 |
| Bloco 12 — Desligamento | 34 | 34 | 0 |
| Bloco 13 — ASO | 48 | 48 | 0 |
| Bloco 14 — Clínica | 7 | 7 | 0 |
| Bloco 15 — Notificação | 17 | 17 | 0 |
| Bloco 16 — Exportação | 14 | 14 | 0 |
| Bloco 17 — Incidente | 10 | 10 | 0 |
| Bloco 18 — UI e concorrência | 38 | 38 | 0 |
| **Total** | **440** | **440** | **0** |

# 5. Matriz exaustiva

| ID Documento 17 | Operação primária | Gatilho | Contrato/realização | Resultado ou intenção | Transação | Repetição/concorrência | Autorização/auditoria | Teste futuro |
|---|---|---|---|---|---|---|---|---|
| B01-AUT-01 | OPR-AUTENTICACAO-SESSAO | HTTP | API-AUT-* | Entrar com senha definitiva válida | TX-003 | sem idempotência de negócio; cada envio explícito conta uma tentativa e sofre limite de abuso | AUTZ-SESSAO; APIAUD-SEGURANCA | TST-B01-AUT-01 |
| B01-AUT-02 | OPR-AUTENTICACAO-SESSAO | HTTP | API-AUT-* | Entrar com senha definitiva válida | TX-003 | sem idempotência de negócio; cada envio explícito conta uma tentativa e sofre limite de abuso | AUTZ-SESSAO; APIAUD-SEGURANCA | TST-B01-AUT-02 |
| B01-AUT-03 | OPR-AUTENTICACAO-SESSAO | HTTP | API-AUT-* | Entrar com senha definitiva válida | TX-003 | sem idempotência de negócio; cada envio explícito conta uma tentativa e sofre limite de abuso | AUTZ-SESSAO; APIAUD-SEGURANCA | TST-B01-AUT-03 |
| B01-AUT-04 | OPR-AUTENTICACAO-SESSAO | HTTP | API-AUT-* | Entrar com credencial temporária válida | TX-003 | sem idempotência de negócio; cada envio explícito conta uma tentativa e sofre limite de abuso | AUTZ-SESSAO; APIAUD-SEGURANCA | TST-B01-AUT-04 |
| B01-AUT-05 | OPR-AUTENTICACAO-SESSAO | HTTP | API-AUT-* | Informar credencial não aceita | TX-003 | sem idempotência de negócio; cada envio explícito conta uma tentativa e sofre limite de abuso | AUTZ-SESSAO; APIAUD-SEGURANCA | TST-B01-AUT-05 |
| B01-AUT-06 | OPR-AUTENTICACAO-SESSAO | HTTP | API-AUT-* | Quinta tentativa inválida | TX-003 | sem idempotência de negócio; cada envio explícito conta uma tentativa e sofre limite de abuso | AUTZ-SESSAO; APIAUD-SEGURANCA | TST-B01-AUT-06 |
| B01-AUT-07 | OPR-AUTENTICACAO-SESSAO | JOB_TEMPORAL | JOB-TEMPORAL-AUTENTICACAO-SESSAO | Atingir data/hora final do bloqueio | TX-003 | prazo avaliado pelo relógio do servidor em cada uso; limpeza temporal idempotente, sem tentativa de autenticação | ator técnico; AUTZ-SESSAO; APIAUD-SEGURANCA | TST-B01-AUT-07 |
| B01-AUT-08 | OPR-AUTENTICACAO-SESSAO | HTTP | API-AUT-* | Definir senha definitiva | TX-003 | sem idempotência de negócio; cada envio explícito conta uma tentativa e sofre limite de abuso | AUTZ-SESSAO; APIAUD-SEGURANCA | TST-B01-AUT-08 |
| B01-AUT-09 | OPR-AUTENTICACAO-SESSAO | JOB_TEMPORAL | JOB-TEMPORAL-AUTENTICACAO-SESSAO | Completar 24 horas sem uso | TX-003 | validade recusada pelo relógio do servidor em cada uso; limpeza temporal idempotente, sem tentativa de autenticação | ator técnico; AUTZ-SESSAO; APIAUD-SEGURANCA | TST-B01-AUT-09 |
| B01-AUT-10 | OPR-AUTENTICACAO-SESSAO | HTTP | API-AUT-* | Solicitar recuperação de senha | TX-003 | sem idempotência de negócio; cada envio explícito conta uma tentativa e sofre limite de abuso | AUTZ-SESSAO; APIAUD-SEGURANCA | TST-B01-AUT-10 |
| B01-AUT-10A | OPR-AUTENTICACAO-SESSAO | JOB_TEMPORAL | JOB-TEMPORAL-AUTENTICACAO-SESSAO | Vencer ou invalidar token | TX-003 | validade recusada pelo relógio do servidor em cada uso; invalidação/limpeza idempotente, sem tentativa de autenticação | ator técnico; AUTZ-SESSAO; APIAUD-SEGURANCA | TST-B01-AUT-10A |
| B01-AUT-11 | OPR-AUTENTICACAO-SESSAO | HTTP | API-AUT-* | Definir nova senha | TX-003 | sem idempotência de negócio; cada envio explícito conta uma tentativa e sofre limite de abuso | AUTZ-SESSAO; APIAUD-SEGURANCA | TST-B01-AUT-11 |
| B01-AUT-12 | OPR-AUTENTICACAO-SESSAO | HTTP | API-AUT-* | Tentar redefinir senha | TX-003 | sem idempotência de negócio; cada envio explícito conta uma tentativa e sofre limite de abuso | AUTZ-SESSAO; APIAUD-SEGURANCA | TST-B01-AUT-12 |
| B01-AUT-13 | OPR-AUTENTICACAO-SESSAO | HTTP | API-AUT-* | Confirmar configuração TOTP | TX-003 | sem idempotência de negócio; cada envio explícito conta uma tentativa e sofre limite de abuso | AUTZ-SESSAO; APIAUD-SEGURANCA | TST-B01-AUT-13 |
| B01-AUT-14 | OPR-AUTENTICACAO-SESSAO | HTTP | API-AUT-* | Validar código TOTP | TX-003 | sem idempotência de negócio; cada envio explícito conta uma tentativa e sofre limite de abuso | AUTZ-SESSAO; APIAUD-SEGURANCA | TST-B01-AUT-14 |
| B01-AUT-15 | OPR-AUTENTICACAO-SESSAO | HTTP | API-AUT-* | Usar código de recuperação | TX-003 | sem idempotência de negócio; cada envio explícito conta uma tentativa e sofre limite de abuso | AUTZ-SESSAO; APIAUD-SEGURANCA | TST-B01-AUT-15 |
| B01-AUT-16 | OPR-AUTENTICACAO-SESSAO | HTTP | API-AUT-* | Informar TOTP/código de recuperação inválido ou reutilizado | TX-003 | sem idempotência de negócio; cada envio explícito conta uma tentativa e sofre limite de abuso | AUTZ-SESSAO; APIAUD-SEGURANCA | TST-B01-AUT-16 |
| B01-AUT-16A | OPR-AUTENTICACAO-SESSAO | HTTP | API-AUT-* | Informar o quinto código inválido/reutilizado | TX-003 | sem idempotência de negócio; cada envio explícito conta uma tentativa e sofre limite de abuso | AUTZ-SESSAO; APIAUD-SEGURANCA | TST-B01-AUT-16A |
| B01-AUT-17 | OPR-AUTENTICACAO-SESSAO | HTTP | API-AUT-* | Autenticar para recuperar TOTP | TX-003 | sem idempotência de negócio; cada envio explícito conta uma tentativa e sofre limite de abuso | AUTZ-SESSAO; APIAUD-SEGURANCA | TST-B01-AUT-17 |
| B01-AUT-18 | OPR-AUTENTICACAO-SESSAO | UI_LOCAL | UIX-ESTADO-COMUM / API-AUT-001 | Atingir aviso de inatividade | N/A | sem idempotência de mutação; relógio local usa os prazos autoritativos da sessão e não renova atividade | AUTZ-SESSAO; sem auditoria de negócio local | TST-B01-AUT-18 |
| B01-AUT-19 | OPR-AUTENTICACAO-SESSAO | HTTP | API-AUT-011 | Continuar sessão | TX-003 | comando explícito da sessão; não conta tentativa de autenticação e nunca amplia o limite absoluto | AUTZ-SESSAO; APIAUD-SEGURANCA | TST-B01-AUT-19 |
| B01-AUT-20 | OPR-AUTENTICACAO-SESSAO | JOB_TEMPORAL | JOB-TEMPORAL-AUTENTICACAO-SESSAO | Atingir 30 minutos de inatividade ou 8 horas absolutas | TX-003 | chave temporal por sessão e prazo; expiração idempotente, sem tentativa de autenticação | ator técnico; AUTZ-SESSAO; APIAUD-SEGURANCA | TST-B01-AUT-20 |
| B01-AUT-21 | OPR-AUTENTICACAO-SESSAO | HTTP | API-AUT-012 | Sair | TX-003 | encerramento idempotente da própria sessão; repetição permanece sem sessão e não conta tentativa | AUTZ-SESSAO; APIAUD-SEGURANCA | TST-B01-AUT-21 |
| B01-AUT-22 | OPR-AUTENTICACAO-SESSAO | HTTP | API-CONTA-005 | Encerrar outras sessões | TX-003 | IDEM-01; reautorização e conjunto de sessões reavaliados no commit | AUTZ-SESSAO; APIAUD-SEGURANCA | TST-B01-AUT-22 |
| B01-AUT-23 | OPR-AUTENTICACAO-SESSAO | HTTP_INTERNO | API-AUT-* / API-CONTA-* / API-USR-* / API-MST-* / API-PRF-* / API-ACLINC-* | Evento crítico de segurança ou acesso | TX-003 | herda idempotência e concorrência do evento causador; revogação é idempotente | AUTZ-TRANSVERSAL; APIAUD-SEGURANCA | TST-B01-AUT-23 |
| B01-AUT-24 | OPR-AUTENTICACAO-SESSAO | POLITICA | AUTZ-TRANSVERSAL / API-AUT-014 quando houver reconciliação | Repetir requisição pendente ou usar aba antiga | perfil da operação | falha fechada por sessão, autorização e X-Context-Version; só reconcilia comando já idempotente | AUTZ-TRANSVERSAL; APIAUD-SEGURANCA quando aplicável | TST-B01-AUT-24 |
| B01-AUT-25 | OPR-AUTENTICACAO-SESSAO | HTTP | API-AUT-* | Trocar a própria senha em A09 | TX-003 | sem idempotência de negócio; cada envio explícito conta uma tentativa e sofre limite de abuso | AUTZ-SESSAO; APIAUD-SEGURANCA | TST-B01-AUT-25 |
| B01-AUT-26 | OPR-AUTENTICACAO-SESSAO | HTTP | API-AUT-* | Regenerar os próprios códigos de recuperação em A09 | TX-003 | sem idempotência de negócio; cada envio explícito conta uma tentativa e sofre limite de abuso | AUTZ-SESSAO; APIAUD-SEGURANCA | TST-B01-AUT-26 |
| B02-CTX-01 | OPR-CONTEXTO-TROCAR | HTTP | API-CTX-* | Selecionar empresa ativa | TX-003 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-ESCOPO; APIAUD-SEGURANCA | TST-B02-CTX-01 |
| B02-CTX-02 | OPR-CONTEXTO-TROCAR | HTTP | API-CTX-* | Selecionar empresa inativa | TX-003 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-ESCOPO; APIAUD-SEGURANCA | TST-B02-CTX-02 |
| B02-CTX-03 | OPR-CONTEXTO-TROCAR | HTTP | API-CTX-* | Tentar selecionar empresa não autorizada ou identificador arbitrário | TX-003 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-ESCOPO; APIAUD-SEGURANCA | TST-B02-CTX-03 |
| B02-CTX-04 | OPR-CONTEXTO-TROCAR | HTTP | API-CTX-* | Trocar empresa | TX-003 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-ESCOPO; APIAUD-SEGURANCA | TST-B02-CTX-04 |
| B02-CTX-05 | OPR-CONTEXTO-TROCAR | UI_LOCAL | UIX-ESTADO-COMUM | Solicitar troca de empresa | N/A | sem idempotência de mutação; apenas abre a decisão de descarte | AUTZ-RESPOSTA; sem auditoria de negócio local | TST-B02-CTX-05 |
| B02-CTX-06 | OPR-CONTEXTO-TROCAR | UI_LOCAL | UIX-ESTADO-COMUM | Continuar editando | N/A | sem idempotência de mutação; preserva rascunho somente no contexto original ainda válido | AUTZ-RESPOSTA; sem auditoria de negócio local | TST-B02-CTX-06 |
| B02-CTX-07 | OPR-CONTEXTO-TROCAR | HTTP | API-CTX-003 após descarte local | Descartar e trocar | TX-003 | IDEM-01; revisão de contexto impede aba antiga de concluir | AUTZ-ESCOPO; APIAUD-SEGURANCA | TST-B02-CTX-07 |
| B02-CTX-08 | OPR-CONTEXTO-TROCAR | HTTP | API-CTX-* | Abrir função global | TX-003 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-ESCOPO; APIAUD-SEGURANCA | TST-B02-CTX-08 |
| B02-CTX-09 | OPR-CONTEXTO-TROCAR | HTTP | API-CTX-* | Voltar a uma empresa | TX-003 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-ESCOPO; APIAUD-SEGURANCA | TST-B02-CTX-09 |
| B02-CTX-10 | OPR-CONTEXTO-TROCAR | HTTP | API-CTX-* | Abrir I01/I02 | TX-003 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-ESCOPO; APIAUD-SEGURANCA | TST-B02-CTX-10 |
| B02-CTX-11 | OPR-CONTEXTO-TROCAR | HTTP | API-CTX-* | Abrir entidade operacional empresarial | TX-003 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-ESCOPO; APIAUD-SEGURANCA | TST-B02-CTX-11 |
| B02-CTX-11A | OPR-CONTEXTO-TROCAR | HTTP | API-CTX-* | Voltar ao seletor | TX-003 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-ESCOPO; APIAUD-SEGURANCA | TST-B02-CTX-11A |
| B02-CTX-11B | OPR-CONTEXTO-TROCAR | HTTP | API-CTX-* | Abrir função global comum | TX-003 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-ESCOPO; APIAUD-SEGURANCA | TST-B02-CTX-11B |
| B02-CTX-12 | OPR-CONTEXTO-TROCAR | HTTP | API-CTX-* | Ler, salvar, exportar, confirmar ou baixar | TX-003 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-ESCOPO; APIAUD-SEGURANCA | TST-B02-CTX-12 |
| B02-EMP-01 | OPR-EMPRESA-GERIR | HTTP | API-EMPRESA-* / API-GEMP-* | Salvar nova empresa e voltar | TX-002 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-EMPRESA; APIAUD-01 | TST-B02-EMP-01 |
| B02-EMP-02 | OPR-EMPRESA-GERIR | HTTP | API-EMPRESA-* / API-GEMP-* | Salvar nova empresa e entrar | TX-002 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-EMPRESA; APIAUD-01 | TST-B02-EMP-02 |
| B02-EMP-03 | OPR-EMPRESA-GERIR | HTTP | API-EMPRESA-* / API-GEMP-* | Salvar CNPJ inválido, duplicado ou não autorizável | TX-002 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-EMPRESA; APIAUD-01 | TST-B02-EMP-03 |
| B02-EMP-04 | OPR-EMPRESA-GERIR | HTTP | API-EMPRESA-* / API-GEMP-* | Editar cadastro ou padrões | TX-002 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-EMPRESA; APIAUD-01 | TST-B02-EMP-04 |
| B02-EMP-05 | OPR-EMPRESA-GERIR | HTTP | API-EMPRESA-* / API-GEMP-* | Inativar | TX-002 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-EMPRESA; APIAUD-01 | TST-B02-EMP-05 |
| B02-EMP-06 | OPR-EMPRESA-GERIR | HTTP | API-EMPRESA-* / API-GEMP-* | Tentar inativar | TX-002 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-EMPRESA; APIAUD-01 | TST-B02-EMP-06 |
| B02-EMP-07 | OPR-EMPRESA-GERIR | HTTP | API-EMPRESA-* / API-GEMP-* | Exportar consulta histórica | TX-002 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-EMPRESA; APIAUD-01 | TST-B02-EMP-07 |
| B02-EMP-08 | OPR-EMPRESA-GERIR | HTTP | API-EMPRESA-* / API-GEMP-* | Criar, editar, calcular, confirmar, corrigir, reabrir ou emitir novo documento operacional | TX-002 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-EMPRESA; APIAUD-01 | TST-B02-EMP-08 |
| B03-USR-01 | OPR-USUARIO-GERIR | HTTP | API-USR-* | Convidar usuário comum | TX-003 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-MASTER; APIAUD-01 | TST-B03-USR-01 |
| B03-USR-02 | OPR-USUARIO-GERIR | HTTP | API-USR-* | Convidar novo master | TX-003 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-MASTER; APIAUD-01 | TST-B03-USR-02 |
| B03-USR-03 | OPR-USUARIO-GERIR | HTTP | API-USR-* | Repetir convite/criação | TX-003 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-MASTER; APIAUD-01 | TST-B03-USR-03 |
| B03-USR-04 | OPR-USUARIO-GERIR | HTTP | API-USR-* | Reenviar primeiro acesso | TX-003 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-MASTER; APIAUD-01 | TST-B03-USR-04 |
| B03-USR-05 | OPR-USUARIO-GERIR | HTTP | API-USR-* | Bloquear administrativamente | TX-003 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-MASTER; APIAUD-01 | TST-B03-USR-05 |
| B03-USR-06 | OPR-USUARIO-GERIR | HTTP | API-USR-* | Desbloquear | TX-003 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-MASTER; APIAUD-01 | TST-B03-USR-06 |
| B03-USR-07 | OPR-USUARIO-GERIR | HTTP | API-USR-* | Inativar | TX-003 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-MASTER; APIAUD-01 | TST-B03-USR-07 |
| B03-USR-08 | OPR-USUARIO-GERIR | HTTP | API-USR-* | Reativar | TX-003 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-MASTER; APIAUD-01 | TST-B03-USR-08 |
| B03-USR-09A | OPR-USUARIO-GERIR | HTTP | API-USR-* | Reativar master | TX-003 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-MASTER; APIAUD-01 | TST-B03-USR-09A |
| B03-USR-09B | OPR-USUARIO-GERIR | HTTP | API-USR-* | Reativar para recuperação | TX-003 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-MASTER; APIAUD-01 | TST-B03-USR-09B |
| B03-USR-10 | OPR-USUARIO-GERIR | HTTP | API-USR-* | Alterar nome | TX-003 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-MASTER; APIAUD-01 | TST-B03-USR-10 |
| B03-USR-11 | OPR-USUARIO-GERIR | HTTP | API-USR-* | Alterar e-mail | TX-003 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-MASTER; APIAUD-01 | TST-B03-USR-11 |
| B03-USR-12 | OPR-USUARIO-GERIR | HTTP | API-USR-* | Associar empresa e perfil | TX-003 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-MASTER; APIAUD-01 | TST-B03-USR-12 |
| B03-USR-13 | OPR-USUARIO-GERIR | HTTP | API-USR-* | Trocar perfil empresarial | TX-003 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-MASTER; APIAUD-01 | TST-B03-USR-13 |
| B03-USR-14 | OPR-USUARIO-GERIR | HTTP | API-USR-* | Retirar empresa | TX-003 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-MASTER; APIAUD-01 | TST-B03-USR-14 |
| B03-USR-15 | OPR-USUARIO-GERIR | HTTP | API-USR-* | Atribuir perfil global | TX-003 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-MASTER; APIAUD-01 | TST-B03-USR-15 |
| B03-USR-16 | OPR-USUARIO-GERIR | HTTP | API-USR-* | Reduzir ou retirar perfil global | TX-003 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-MASTER; APIAUD-01 | TST-B03-USR-16 |
| B03-MST-01 | OPR-MASTER-GERIR | HTTP | API-MST-* | Promover para master | TX-003 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-MASTER-CRITICO; APIAUD-01 | TST-B03-MST-01 |
| B03-MST-02 | OPR-MASTER-GERIR | HTTP | API-MST-* | Concluir B01-AUT-13 | TX-003 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-MASTER-CRITICO; APIAUD-01 | TST-B03-MST-02 |
| B03-MST-03 | OPR-MASTER-GERIR | HTTP | API-MST-* | Rebaixar para comum | TX-003 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-MASTER-CRITICO; APIAUD-01 | TST-B03-MST-03 |
| B03-MST-04 | OPR-MASTER-GERIR | HTTP | API-MST-* | Bloquear, inativar ou rebaixar | TX-003 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-MASTER-CRITICO; APIAUD-01 | TST-B03-MST-04 |
| B03-MST-05 | OPR-MASTER-GERIR | HTTP | API-MST-* | Redefinir TOTP de outro master | TX-003 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-MASTER-CRITICO; APIAUD-01 | TST-B03-MST-05 |
| B03-MST-06 | OPR-MASTER-GERIR | HTTP | API-MST-* | Iniciar exceção controlada de reset | TX-003 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-MASTER-CRITICO; APIAUD-01 | TST-B03-MST-06 |
| B03-MST-07 | OPR-MASTER-GERIR | HTTP | API-MST-* | Configurar novo TOTP | TX-003 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-MASTER-CRITICO; APIAUD-01 | TST-B03-MST-07 |
| B03-PRF-01 | OPR-PERFIL-GERIR | HTTP | API-PRF-* | Criar perfil | TX-003 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-MASTER; APIAUD-01 | TST-B03-PRF-01 |
| B03-PRF-02 | OPR-PERFIL-GERIR | HTTP | API-PRF-* | Duplicar | TX-003 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-MASTER; APIAUD-01 | TST-B03-PRF-02 |
| B03-PRF-03 | OPR-PERFIL-GERIR | HTTP | API-PRF-* | Salvar matriz de permissões | TX-003 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-MASTER; APIAUD-01 | TST-B03-PRF-03 |
| B03-PRF-04 | OPR-PERFIL-GERIR | HTTP | API-PRF-* | Salvar depois de alteração concorrente | TX-003 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-MASTER; APIAUD-01 | TST-B03-PRF-04 |
| B03-PRF-05 | OPR-PERFIL-GERIR | HTTP | API-PRF-* | Arquivar | TX-003 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-MASTER; APIAUD-01 | TST-B03-PRF-05 |
| B03-PRF-06 | OPR-PERFIL-GERIR | HTTP | API-PRF-* | Tentar nova atribuição | TX-003 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-MASTER; APIAUD-01 | TST-B03-PRF-06 |
| B03-PRF-07 | OPR-PERFIL-GERIR | HTTP | API-PRF-* | Migrar usuário | TX-003 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-MASTER; APIAUD-01 | TST-B03-PRF-07 |
| B03-PRF-08 | OPR-PERFIL-GERIR | HTTP | API-PRF-* | Criar ou duplicar | TX-003 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-MASTER; APIAUD-01 | TST-B03-PRF-08 |
| B03-PRF-09 | OPR-PERFIL-GERIR | HTTP | API-PRF-* | Criar empresa usando modelo | TX-003 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-MASTER; APIAUD-01 | TST-B03-PRF-09 |
| B03-PRF-10 | OPR-PERFIL-GERIR | HTTP | API-PRF-* | Arquivar | TX-003 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-MASTER; APIAUD-01 | TST-B03-PRF-10 |
| B03-PRF-11 | OPR-PERFIL-GERIR | HTTP | API-PRF-* | Migrar usuário comum | TX-003 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-MASTER; APIAUD-01 | TST-B03-PRF-11 |
| B03-INC-01 | OPR-AUTORIZACAO-INCIDENTE-GERIR | HTTP | API-ACLINC-* | Designar responsável ou substituto | TX-003 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-MASTER-CRITICO; APIAUD-01 | TST-B03-INC-01 |
| B03-INC-02 | OPR-AUTORIZACAO-INCIDENTE-GERIR | HTTP | API-ACLINC-* | Alterar permissões ou função nominal | TX-003 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-MASTER-CRITICO; APIAUD-01 | TST-B03-INC-02 |
| B03-INC-03 | OPR-AUTORIZACAO-INCIDENTE-GERIR | HTTP | API-ACLINC-* | Revogar | TX-003 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-MASTER-CRITICO; APIAUD-01 | TST-B03-INC-03 |
| B03-INC-04 | OPR-AUTORIZACAO-INCIDENTE-GERIR | HTTP | API-ACLINC-* | Inativar ou bloquear administrativamente o usuário | TX-003 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-MASTER-CRITICO; APIAUD-01 | TST-B03-INC-04 |
| B03-INC-05 | OPR-AUTORIZACAO-INCIDENTE-GERIR | HTTP | API-ACLINC-* | Reautorizar depois de revisão | TX-003 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-MASTER-CRITICO; APIAUD-01 | TST-B03-INC-05 |
| B04-VIN-01 | OPR-EMPREGADO-GERIR | HTTP | API-EMP-* | Criar empregado e primeiro vínculo | TX-002 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-EMPREGADO; APIAUD-01 | TST-B04-VIN-01 |
| B04-VIN-02 | OPR-EMPREGADO-GERIR | HTTP | API-EMP-* | Criar recontratação | TX-002 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-EMPREGADO; APIAUD-01 | TST-B04-VIN-02 |
| B04-VIN-03 | OPR-EMPREGADO-GERIR | HTTP | API-EMP-* | Tentar criar novo vínculo | TX-002 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-EMPREGADO; APIAUD-01 | TST-B04-VIN-03 |
| B04-VIN-04 | OPR-EMPREGADO-GERIR | HTTP | API-EMP-* | Alterar nome ou endereço | TX-002 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-EMPREGADO; APIAUD-01 | TST-B04-VIN-04 |
| B04-VIN-05 | OPR-EMPREGADO-GERIR | HTTP | API-EMP-* | Corrigir CPF | TX-002 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-EMPREGADO; APIAUD-01 | TST-B04-VIN-05 |
| B04-VIN-06 | OPR-EMPREGADO-GERIR | PROJECAO | OPR-EMPREGADO-GERIR (situação temporal) | Atingir data de início | TX-001 | sem idempotência de mutação; situação derivada da data operacional e fontes vigentes | AUTZ-EMPREGADO; sem nova APIAUD além do cadastro/versão das fontes | TST-B04-VIN-06 |
| B04-VIN-06A | OPR-EMPREGADO-GERIR | JOB_TEMPORAL | JOB-TEMPORAL-EMPREGADO | Atingir data de admissão | TX-008 | chave temporal por vínculo, data e versão; recalcula somente eventos abertos de forma idempotente | ator técnico; AUTZ-EMPREGADO e AUTZ-FINANCEIRO; APIAUD-01 | TST-B04-VIN-06A |
| B04-VIN-07 | OPR-EMPREGADO-GERIR | HTTP | API-EMP-* | Registrar admissão já alcançada | TX-002 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-EMPREGADO; APIAUD-01 | TST-B04-VIN-07 |
| B04-VIN-07A | OPR-EMPREGADO-GERIR | HTTP | API-EMP-* | Informar admissão futura | TX-002 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-EMPREGADO; APIAUD-01 | TST-B04-VIN-07A |
| B04-VIN-08 | OPR-EMPREGADO-GERIR | HTTP | API-EMP-* | Editar início ou admissão | TX-002 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-EMPREGADO; APIAUD-01 | TST-B04-VIN-08 |
| B04-VIN-09 | OPR-EMPREGADO-GERIR | HTTP | API-EMP-* | Alterar data com impacto financeiro retroativo | TX-002 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-EMPREGADO; APIAUD-01 | TST-B04-VIN-09 |
| B04-VIN-10 | OPR-EMPREGADO-GERIR | POLITICA | OPR-EMPREGADO-GERIR (política para vínculo inativo) | Consultar histórico, concluir última competência ou tratar demissional pendente | perfil da operação | sem idempotência ou concorrência própria; cada ação permitida usa seu contrato e perfil | AUTZ-EMPREGADO reavaliada por ação; APIAUD conforme operação | TST-B04-VIN-10 |
| B05-MEI-01 | OPR-MEI-CADASTRO-GERIR | HTTP | API-MEI-* | Criar prestador e contrato | TX-002 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-MEI; APIAUD-01 | TST-B05-MEI-01 |
| B05-MEI-02 | OPR-MEI-CADASTRO-GERIR | HTTP | API-MEI-* | Criar contrato após interrupção | TX-002 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-MEI; APIAUD-01 | TST-B05-MEI-02 |
| B05-MEI-03 | OPR-MEI-CADASTRO-GERIR | HTTP | API-MEI-* | Tentar criar outro contrato | TX-002 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-MEI; APIAUD-01 | TST-B05-MEI-03 |
| B05-MEI-04 | OPR-MEI-CADASTRO-GERIR | HTTP | API-MEI-* | Editar razão social, nome fantasia, endereço ou contato | TX-002 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-MEI; APIAUD-01 | TST-B05-MEI-04 |
| B05-MEI-05 | OPR-MEI-CADASTRO-GERIR | HTTP | API-MEI-* | Corrigir CNPJ | TX-002 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-MEI; APIAUD-01 | TST-B05-MEI-05 |
| B05-CON-01 | OPR-MEI-CONTRATO-GERIR | PROJECAO | OPR-MEI-CONTRATO-GERIR (situação temporal) | Atingir data inicial | TX-001 | sem idempotência de mutação; situação derivada do intervalo e da data operacional | AUTZ-MEI-CONTRATO; sem nova APIAUD além do cadastro/versão das fontes | TST-B05-CON-01 |
| B05-CON-02 | OPR-MEI-CONTRATO-GERIR | HTTP | API-MEI-* | Programar renovação contínua | TX-002 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-MEI-CONTRATO; APIAUD-01 | TST-B05-CON-02 |
| B05-CON-03 | OPR-MEI-CONTRATO-GERIR | HTTP | API-MEI-* | Editar próxima vigência | TX-002 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-MEI-CONTRATO; APIAUD-01 | TST-B05-CON-03 |
| B05-CON-04 | OPR-MEI-CONTRATO-GERIR | JOB_TEMPORAL | JOB-TEMPORAL-MEI-CONTRATO | Iniciar dia seguinte | TX-008 | relógio do servidor; avaliação idempotente por contrato, data operacional e versão | AUTZ-MEI-CONTRATO; APIAUD-01 quando houver virada materializada | TST-B05-CON-04 |
| B05-CON-05 | OPR-MEI-CONTRATO-GERIR | PROJECAO | OPR-MEI-CONTRATO-GERIR (situação temporal) | Iniciar dia seguinte à data final prevista inclusiva | TX-001 | sem idempotência de mutação; encerramento derivado do intervalo vigente e ausência de renovação | AUTZ-MEI-CONTRATO; sem nova APIAUD além das fontes | TST-B05-CON-05 |
| B05-CON-06 | OPR-MEI-CONTRATO-GERIR | HTTP | API-MEI-* | Registrar encerramento efetivo antecipado/corrigido | TX-002 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-MEI-CONTRATO; APIAUD-01 | TST-B05-CON-06 |
| B05-CON-06A | OPR-MEI-CONTRATO-GERIR | PROJECAO | OPR-MEI-CONTRATO-GERIR (situação temporal) | Iniciar dia seguinte à data efetiva final inclusiva | TX-001 | sem idempotência de mutação; encerramento derivado da data efetiva e da data operacional | AUTZ-MEI-CONTRATO; sem nova APIAUD além das fontes | TST-B05-CON-06A |
| B05-CON-06B | OPR-MEI-CONTRATO-GERIR | HTTP | API-MEI-* | Corrigir data de encerramento efetivo | TX-002 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-MEI-CONTRATO; APIAUD-01 | TST-B05-CON-06B |
| B05-CON-06C | OPR-MEI-CONTRATO-GERIR | HTTP | API-MEI-* | Corrigir data de encerramento | TX-002 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-MEI-CONTRATO; APIAUD-01 | TST-B05-CON-06C |
| B05-CON-06D | OPR-MEI-CONTRATO-GERIR | HTTP | API-MEI-* | Corrigir data de encerramento | TX-002 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-MEI-CONTRATO; APIAUD-01 | TST-B05-CON-06D |
| B05-CON-07 | OPR-MEI-CONTRATO-GERIR | HTTP | API-MEI-* | Criar retorno | TX-002 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-MEI-CONTRATO; APIAUD-01 | TST-B05-CON-07 |
| B05-CON-08 | OPR-MEI-CONTRATO-GERIR | HTTP | API-MEI-* | Tentar criar retorno após interrupção | TX-002 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-MEI-CONTRATO; APIAUD-01 | TST-B05-CON-08 |
| B05-CON-09 | OPR-MEI-CONTRATO-GERIR | HTTP | API-MEI-* | Alterar valor ou forma de pagamento com data futura | TX-002 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-MEI-CONTRATO; APIAUD-01 | TST-B05-CON-09 |
| B05-CON-10 | OPR-MEI-CONTRATO-GERIR | HTTP | API-MEI-* | Alterar valor/condições a partir de data na competência | TX-002 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-MEI-CONTRATO; APIAUD-01 | TST-B05-CON-10 |
| B05-CON-11 | OPR-MEI-CONTRATO-GERIR | HTTP | API-MEI-* | Alterar valor/condições com efeito retroativo | TX-002 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-MEI-CONTRATO; APIAUD-01 | TST-B05-CON-11 |
| B05-CON-12 | OPR-MEI-CONTRATO-GERIR | HTTP | API-MEI-* | Empresa contratante é inativada | TX-002 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-MEI-CONTRATO; APIAUD-01 | TST-B05-CON-12 |
| B06-FIN-01 | OPR-FINANCEIRO-SALARIO-GERIR | HTTP | API-FINEMP-* | Informar salário-base inicial | TX-002 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-FINANCEIRO; APIAUD-01 | TST-B06-FIN-01 |
| B06-FIN-02 | OPR-FINANCEIRO-SALARIO-GERIR | HTTP | API-FINEMP-* | Alterar salário-base | TX-002 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-FINANCEIRO; APIAUD-01 | TST-B06-FIN-02 |
| B06-FIN-03 | OPR-FINANCEIRO-SALARIO-GERIR | HTTP | API-FINEMP-* | Corrigir vigência/valor retroativo | TX-002 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-FINANCEIRO; APIAUD-01 | TST-B06-FIN-03 |
| B06-FIN-04 | OPR-FINANCEIRO-SALARIO-GERIR | HTTP | API-FINEMP-* | Criar exceção individual | TX-002 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-FINANCEIRO; APIAUD-01 | TST-B06-FIN-04 |
| B06-FIN-05 | OPR-FINANCEIRO-SALARIO-GERIR | HTTP | API-FINEMP-* | Encerrar exceção | TX-002 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-FINANCEIRO; APIAUD-01 | TST-B06-FIN-05 |
| B06-FIN-06 | OPR-FINANCEIRO-SALARIO-GERIR | HTTP | API-FINEMP-* | Alterar percentual/vigência, inclusive remover ou prorrogar o fim programado | TX-002 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-FINANCEIRO; APIAUD-01 | TST-B06-FIN-06 |
| B06-FIN-07 | OPR-FINANCEIRO-SALARIO-GERIR | PROJECAO | OPR-FINANCEIRO-SALARIO-GERIR (avaliação de vigência) | Atingir competência inicial | TX-001 | sem idempotência de mutação; aplicabilidade derivada da competência consultada | AUTZ-FINANCEIRO; sem nova APIAUD além do salvamento da versão | TST-B06-FIN-07 |
| B06-FIN-08 | OPR-FINANCEIRO-SALARIO-GERIR | PROJECAO | OPR-FINANCEIRO-SALARIO-GERIR (avaliação de vigência) | Iniciar competência posterior à última devida | TX-001 | sem idempotência de mutação; aplicabilidade derivada da competência consultada | AUTZ-FINANCEIRO; sem nova APIAUD além do salvamento da versão | TST-B06-FIN-08 |
| B06-RA-01 | OPR-FINANCEIRO-RA-GERIR | HTTP | API-FINEMP-* | Criar RA positiva | TX-002/004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-FINANCEIRO; APIAUD-01 | TST-B06-RA-01 |
| B06-RA-02 | OPR-FINANCEIRO-RA-GERIR | HTTP | API-FINEMP-* | Alterar valor, parcelamento ou vigência, inclusive remover/prorrogar o fim | TX-002/004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-FINANCEIRO; APIAUD-01 | TST-B06-RA-02 |
| B06-RA-03 | OPR-FINANCEIRO-RA-GERIR | HTTP | API-FINEMP-* | Corrigir valor/vigência afetada | TX-002/004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-FINANCEIRO; APIAUD-01 | TST-B06-RA-03 |
| B06-RA-04 | OPR-FINANCEIRO-RA-GERIR | HTTP | API-FINEMP-* | Programar encerramento próprio da RA | TX-002/004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-FINANCEIRO; APIAUD-01 | TST-B06-RA-04 |
| B06-RA-05 | OPR-FINANCEIRO-RA-GERIR | HTTP | API-FINEMP-* | Alterar admissão sem alterar início | TX-002/004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-FINANCEIRO; APIAUD-01 | TST-B06-RA-05 |
| B06-RA-06 | OPR-FINANCEIRO-RA-GERIR | HTTP | API-FINEMP-* | Criar RA na competência corrente | TX-002/004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-FINANCEIRO; APIAUD-01 | TST-B06-RA-06 |
| B06-REB-01 | OPR-FINANCEIRO-REEMBOLSO-GERIR | HTTP | API-FINEMP-* / API-LAN-* | Ativar marcador | TX-002/004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-FINANCEIRO; APIAUD-01 | TST-B06-REB-01 |
| B06-REB-02 | OPR-FINANCEIRO-REEMBOLSO-GERIR | HTTP | API-FINEMP-* / API-LAN-* | Programar encerramento | TX-002/004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-FINANCEIRO; APIAUD-01 | TST-B06-REB-02 |
| B06-REB-02A | OPR-FINANCEIRO-REEMBOLSO-GERIR | HTTP | API-FINEMP-* / API-LAN-* | Remover ou alterar competência final | TX-002/004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-FINANCEIRO; APIAUD-01 | TST-B06-REB-02A |
| B06-REB-03 | OPR-FINANCEIRO-REEMBOLSO-GERIR | HTTP | API-FINEMP-* / API-LAN-* | Informar valores reais | TX-002/004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-FINANCEIRO; APIAUD-01 | TST-B06-REB-03 |
| B06-REB-04 | OPR-FINANCEIRO-REEMBOLSO-GERIR | HTTP | API-FINEMP-* / API-LAN-* | Confirmar que não houve reembolso | TX-002/004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-FINANCEIRO; APIAUD-01 | TST-B06-REB-04 |
| B06-REB-04A | OPR-FINANCEIRO-REEMBOLSO-GERIR | HTTP | API-FINEMP-* / API-LAN-* | Substituir por valores reais | TX-002/004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-FINANCEIRO; APIAUD-01 | TST-B06-REB-04A |
| B06-REB-04B | OPR-FINANCEIRO-REEMBOLSO-GERIR | HTTP | API-FINEMP-* / API-LAN-* | Confirmar zero | TX-002/004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-FINANCEIRO; APIAUD-01 | TST-B06-REB-04B |
| B06-REB-04C | OPR-FINANCEIRO-REEMBOLSO-GERIR | HTTP | API-FINEMP-* / API-LAN-* | Reabrir informação | TX-002/004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-FINANCEIRO; APIAUD-01 | TST-B06-REB-04C |
| B06-REB-05 | OPR-FINANCEIRO-REEMBOLSO-GERIR | HTTP | API-FINEMP-* / API-LAN-* | Corrigir valor | TX-002/004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-FINANCEIRO; APIAUD-01 | TST-B06-REB-05 |
| B06-CMP-01 | OPR-FINANCEIRO-COMPLEMENTO-GERIR | HTTP | API-FINEMP-* / API-LAN-* | Criar recorrente | TX-002/004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-FINANCEIRO; APIAUD-01 | TST-B06-CMP-01 |
| B06-CMP-02 | OPR-FINANCEIRO-COMPLEMENTO-GERIR | HTTP | API-FINEMP-* / API-LAN-* | Alterar valor, descrição, parcelamento ou vigência, inclusive remover/prorrogar o fim | TX-002/004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-FINANCEIRO; APIAUD-01 | TST-B06-CMP-02 |
| B06-CMP-03 | OPR-FINANCEIRO-COMPLEMENTO-GERIR | HTTP | API-FINEMP-* / API-LAN-* | Corrigir competência afetada | TX-002/004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-FINANCEIRO; APIAUD-01 | TST-B06-CMP-03 |
| B06-CMP-04 | OPR-FINANCEIRO-COMPLEMENTO-GERIR | HTTP | API-FINEMP-* / API-LAN-* | Encerrar | TX-002/004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-FINANCEIRO; APIAUD-01 | TST-B06-CMP-04 |
| B06-CMP-05 | OPR-FINANCEIRO-COMPLEMENTO-GERIR | HTTP | API-FINEMP-* / API-LAN-* | Criar complemento avulso | TX-002/004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-FINANCEIRO; APIAUD-01 | TST-B06-CMP-05 |
| B06-CMP-06 | OPR-FINANCEIRO-COMPLEMENTO-GERIR | HTTP | API-FINEMP-* / API-LAN-* | Definir uma ou duas parcelas | TX-002/004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-FINANCEIRO; APIAUD-01 | TST-B06-CMP-06 |
| B06-CMP-07 | OPR-FINANCEIRO-COMPLEMENTO-GERIR | HTTP | API-FINEMP-* / API-LAN-* | Calcular destino | TX-002/004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-FINANCEIRO; APIAUD-01 | TST-B06-CMP-07 |
| B06-CMP-08 | OPR-FINANCEIRO-COMPLEMENTO-GERIR | HTTP | API-FINEMP-* / API-LAN-* | Apurar diferença | TX-002/004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-FINANCEIRO; APIAUD-01 | TST-B06-CMP-08 |
| B06-PSR-01 | OPR-FINANCEIRO-PSR-GERIR | HTTP | API-FINEMP-* / API-LAN-* | Confirmar base mensal própria | TX-002/004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-FINANCEIRO; APIAUD-01 | TST-B06-PSR-01 |
| B06-PSR-02 | OPR-FINANCEIRO-PSR-GERIR | HTTP | API-FINEMP-* / API-LAN-* | Calcular linha da competência | TX-002/004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-FINANCEIRO; APIAUD-01 | TST-B06-PSR-02 |
| B06-PSR-03 | OPR-FINANCEIRO-PSR-GERIR | HTTP | API-FINEMP-* / API-LAN-* | Alterar admissão, saída ou base | TX-002/004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-FINANCEIRO; APIAUD-01 | TST-B06-PSR-03 |
| B06-PSR-04 | OPR-FINANCEIRO-PSR-GERIR | HTTP | API-FINEMP-* / API-LAN-* | Alterar admissão, saída ou base com impacto | TX-002/004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-FINANCEIRO; APIAUD-01 | TST-B06-PSR-04 |
| B06-PSR-05 | OPR-FINANCEIRO-PSR-GERIR | HTTP | API-FINEMP-* / API-LAN-* | Fechar cálculo provisório da competência | TX-002/004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-FINANCEIRO; APIAUD-01 | TST-B06-PSR-05 |
| B06-PSR-06 | OPR-FINANCEIRO-PSR-GERIR | HTTP | API-FINEMP-* / API-LAN-* | Registrar admissão | TX-002/004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-FINANCEIRO; APIAUD-01 | TST-B06-PSR-06 |
| B06-PSR-07 | OPR-FINANCEIRO-PSR-GERIR | HTTP | API-FINEMP-* / API-LAN-* | Configurar pagamento dividido | TX-002/004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-FINANCEIRO; APIAUD-01 | TST-B06-PSR-07 |
| B06-PSR-08 | OPR-FINANCEIRO-PSR-GERIR | HTTP | API-FINEMP-* / API-LAN-* | Configurar 100% no final ou aplicar corte | TX-002/004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-FINANCEIRO; APIAUD-01 | TST-B06-PSR-08 |
| K07-01 | OPR-COMPETENCIA-GERIR | HTTP | API-CPT-* / API-K07-* | Criar competência | TX-004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-COMPETENCIA; APIAUD-01 | TST-K07-01 |
| K07-02 | OPR-COMPETENCIA-GERIR | HTTP | API-CPT-* / API-K07-* | Tentar criar competência já existente | TX-004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-COMPETENCIA; APIAUD-01 | TST-K07-02 |
| K07-03 | OPR-COMPETENCIA-GERIR | HTTP | API-CPT-* / API-K07-* | Atualizar participantes | TX-004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-COMPETENCIA; APIAUD-01 | TST-K07-03 |
| K07-04 | OPR-COMPETENCIA-GERIR | HTTP | API-CPT-* / API-K07-* | Atualizar participantes ou condição retroativa | TX-004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-COMPETENCIA; APIAUD-01 | TST-K07-04 |
| K07-05 | OPR-COMPETENCIA-GERIR | HTTP | API-CPT-* / API-K07-* | Resolver todos os adiantamentos aplicáveis | TX-004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-COMPETENCIA; APIAUD-01 | TST-K07-05 |
| K07-05A | OPR-COMPETENCIA-GERIR | HTTP | API-CPT-* / API-K07-* | Resolver todos os adiantamentos com K06 já resolvido | TX-004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-COMPETENCIA; APIAUD-01 | TST-K07-05A |
| K07-06 | OPR-COMPETENCIA-GERIR | HTTP | API-CPT-* / API-K07-* | Informar todos os líquidos oficiais necessários | TX-004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-COMPETENCIA; APIAUD-01 | TST-K07-06 |
| K07-07 | OPR-COMPETENCIA-GERIR | HTTP | API-CPT-* / API-K07-* | Surgir grupo pronto ainda não pago | TX-004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-COMPETENCIA; APIAUD-01 | TST-K07-07 |
| K07-08 | OPR-COMPETENCIA-GERIR | HTTP | API-CPT-* / API-K07-* | Fechar competência | TX-004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-COMPETENCIA; APIAUD-01 | TST-K07-08 |
| K07-09 | OPR-COMPETENCIA-GERIR | HTTP | API-CPT-* / API-K07-* | Tentar fechar com pendência | TX-004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-COMPETENCIA; APIAUD-01 | TST-K07-09 |
| K07-10 | OPR-COMPETENCIA-GERIR | HTTP | API-CPT-* / API-K07-* | Reabrir | TX-004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-COMPETENCIA; APIAUD-01 | TST-K07-10 |
| K07-11 | OPR-COMPETENCIA-GERIR | HTTP | API-CPT-* / API-K07-* | Fechar novamente | TX-004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-COMPETENCIA; APIAUD-01 | TST-K07-11 |
| K07-12 | OPR-COMPETENCIA-GERIR | HTTP | API-CPT-* / API-K07-* | Salvar com versão antiga | TX-004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-COMPETENCIA; APIAUD-01 | TST-K07-12 |
| K07-13 | OPR-COMPETENCIA-GERIR | HTTP | API-CPT-* / API-K07-* | Repetir ação após resposta incerta | TX-004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-COMPETENCIA; APIAUD-01 | TST-K07-13 |
| K07-14 | OPR-COMPETENCIA-GERIR | HTTP | API-CPT-* / API-K07-* | Inativar empresa | TX-004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-COMPETENCIA; APIAUD-01 | TST-K07-14 |
| G08-01 | OPR-GRUPO-FINANCEIRO-GERIR | HTTP | API-GRP-* | Materializar participante e grupos | TX-004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-FINANCEIRO; APIAUD-01 | TST-G08-01 |
| G08-02 | OPR-GRUPO-FINANCEIRO-GERIR | HTTP | API-GRP-* | Calcular com dado obrigatório ausente | TX-004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-FINANCEIRO; APIAUD-01 | TST-G08-02 |
| G08-03 | OPR-GRUPO-FINANCEIRO-GERIR | HTTP | API-GRP-* | Calcular grupo completo | TX-004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-FINANCEIRO; APIAUD-01 | TST-G08-03 |
| G08-04 | OPR-GRUPO-FINANCEIRO-GERIR | HTTP | API-GRP-* | Resolver impedimento e recalcular | TX-004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-FINANCEIRO; APIAUD-01 | TST-G08-04 |
| G08-04A | OPR-GRUPO-FINANCEIRO-GERIR | HTTP | API-GRP-* | Ajustar manualmente um campo financeiro editável | TX-004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-FINANCEIRO; APIAUD-01 | TST-G08-04A |
| G08-05 | OPR-GRUPO-FINANCEIRO-GERIR | HTTP | API-GRP-* | Concluir conferência | TX-004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-FINANCEIRO; APIAUD-01 | TST-G08-05 |
| G08-06 | OPR-GRUPO-FINANCEIRO-GERIR | HTTP | API-GRP-* | Recalcular antes do pagamento | TX-004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-FINANCEIRO; APIAUD-01 | TST-G08-06 |
| G08-07 | OPR-GRUPO-FINANCEIRO-GERIR | HTTP | API-GRP-* | Marcar não aplicável | TX-004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-FINANCEIRO; APIAUD-01 | TST-G08-07 |
| G08-08 | OPR-GRUPO-FINANCEIRO-GERIR | HTTP | API-GRP-* | Reverter sem dados suficientes | TX-004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-FINANCEIRO; APIAUD-01 | TST-G08-08 |
| G08-08A | OPR-GRUPO-FINANCEIRO-GERIR | HTTP | API-GRP-* | Reverter com dados completos e recalcular | TX-004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-FINANCEIRO; APIAUD-01 | TST-G08-08A |
| G08-09 | OPR-GRUPO-FINANCEIRO-GERIR | HTTP | API-GRP-* | Cancelar por desligamento | TX-004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-FINANCEIRO; APIAUD-01 | TST-G08-09 |
| G08-10 | OPR-GRUPO-FINANCEIRO-GERIR | HTTP | API-GRP-* | Confirmar pagamento | TX-004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-FINANCEIRO; APIAUD-01 | TST-G08-10 |
| G08-11 | OPR-GRUPO-FINANCEIRO-GERIR | HTTP | API-GRP-* | Iniciar correção | TX-004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-FINANCEIRO; APIAUD-01 | TST-G08-11 |
| G08-12 | OPR-GRUPO-FINANCEIRO-GERIR | HTTP | API-GRP-* | Cancelar confirmação administrativamente em F04 | TX-004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-FINANCEIRO; APIAUD-01 | TST-G08-12 |
| G08-13 | OPR-GRUPO-FINANCEIRO-GERIR | HTTP | API-GRP-* | Reconfirmar novo total positivo | TX-004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-FINANCEIRO; APIAUD-01 | TST-G08-13 |
| G08-14 | OPR-GRUPO-FINANCEIRO-GERIR | HTTP | API-GRP-* | Reconfirmar novo total zero | TX-004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-FINANCEIRO; APIAUD-01 | TST-G08-14 |
| G08-15 | OPR-GRUPO-FINANCEIRO-GERIR | HTTP | API-GRP-* | Criar RA/complemento depois do adiantamento | TX-004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-FINANCEIRO; APIAUD-01 | TST-G08-15 |
| G08-16 | OPR-GRUPO-FINANCEIRO-GERIR | HTTP | API-GRP-* | Criar ou aumentar verba retroativa | TX-004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-FINANCEIRO; APIAUD-01 | TST-G08-16 |
| P09-00A | OPR-PAGAMENTO-GERIR | UI_LOCAL | UIX-ESTADO-COMUM | Alterar campo na tela sem salvar | N/A | sem idempotência de mutação; rascunho existe apenas na sessão, empresa, competência e linha originais | AUTZ-RESPOSTA; sem auditoria de negócio local | TST-P09-00A |
| P09-00B | OPR-PAGAMENTO-GERIR | HTTP | API-PAG-* / API-K06-* | Salvar com versão antiga | TX-004/005 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-PAGAMENTO; APIAUD-01 | TST-P09-00B |
| P09-01 | OPR-PAGAMENTO-GERIR | HTTP | API-PAG-* / API-K06-* | Informar líquido do contador | TX-004/005 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-PAGAMENTO; APIAUD-01 | TST-P09-01 |
| P09-01A | OPR-PAGAMENTO-GERIR | HTTP | API-PAG-* / API-K06-* | Substituir líquido antes do pagamento | TX-004/005 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-PAGAMENTO; APIAUD-01 | TST-P09-01A |
| P09-02 | OPR-PAGAMENTO-GERIR | HTTP | API-PAG-* / API-K06-* | Detectar líquido que desconta adiantamento não pago | TX-004/005 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-PAGAMENTO; APIAUD-01 | TST-P09-02 |
| P09-03 | OPR-PAGAMENTO-GERIR | HTTP | API-PAG-* / API-K06-* | Resolver divergência oficial | TX-004/005 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-PAGAMENTO; APIAUD-01 | TST-P09-03 |
| P09-04 | OPR-PAGAMENTO-GERIR | HTTP | API-PAG-* / API-K06-* | Informar demissão formal | TX-004/005 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-PAGAMENTO; APIAUD-01 | TST-P09-04 |
| P09-05 | OPR-PAGAMENTO-GERIR | HTTP | API-PAG-* / API-K06-* | Confirmar individualmente | TX-004/005 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-PAGAMENTO; APIAUD-01 | TST-P09-05 |
| P09-06 | OPR-PAGAMENTO-GERIR | HTTP | API-PAG-* / API-K06-* | Confirmar em lote F03 | TX-004/005 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-PAGAMENTO; APIAUD-01 | TST-P09-06 |
| P09-07 | OPR-PAGAMENTO-GERIR | HTTP | API-PAG-* / API-K06-* | Tentar confirmar valor zero | TX-004/005 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-PAGAMENTO; APIAUD-01 | TST-P09-07 |
| P09-08 | OPR-PAGAMENTO-GERIR | HTTP | API-PAG-* / API-K06-* | Tentar confirmar sem conferência | TX-004/005 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-PAGAMENTO; APIAUD-01 | TST-P09-08 |
| P09-09 | OPR-PAGAMENTO-GERIR | HTTP | API-PAG-* / API-K06-* | Tentar confirmar com data futura ou inválida | TX-004/005 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-PAGAMENTO; APIAUD-01 | TST-P09-09 |
| P09-10 | OPR-PAGAMENTO-GERIR | HTTP | API-PAG-* / API-K06-* | Repetir a mesma confirmação | TX-004/005 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-PAGAMENTO; APIAUD-01 | TST-P09-10 |
| P09-11 | OPR-PAGAMENTO-GERIR | HTTP | API-PAG-* / API-K06-* | Reconciliar e encontrar a confirmação | TX-004/005 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-PAGAMENTO; APIAUD-01 | TST-P09-11 |
| P09-11A | OPR-PAGAMENTO-GERIR | HTTP | API-PAG-* / API-K06-* | Reconciliar e provar ausência da confirmação | TX-004/005 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-PAGAMENTO; APIAUD-01 | TST-P09-11A |
| P09-12 | OPR-PAGAMENTO-GERIR | HTTP | API-PAG-* / API-K06-* | Tentar pagar | TX-004/005 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-PAGAMENTO; APIAUD-01 | TST-P09-12 |
| P09-13 | OPR-PAGAMENTO-GERIR | HTTP | API-PAG-* / API-K06-* | Tentar editar componente | TX-004/005 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-PAGAMENTO; APIAUD-01 | TST-P09-13 |
| P09-14 | OPR-PAGAMENTO-GERIR | HTTP | API-PAG-* / API-K06-* | Registrar saldo inicial K07 | TX-004/005 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-PAGAMENTO; APIAUD-01 | TST-P09-14 |
| P09-14A | OPR-PAGAMENTO-GERIR | HTTP | API-PAG-* / API-K06-* | Corrigir lançamento de implantação | TX-004/005 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-PAGAMENTO; APIAUD-01 | TST-P09-14A |
| P09-15 | OPR-PAGAMENTO-GERIR | HTTP | API-PAG-* / API-K06-* | Tentar confirmação normal duplicada | TX-004/005 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-PAGAMENTO; APIAUD-01 | TST-P09-15 |
| P09-16 | OPR-PAGAMENTO-GERIR | HTTP | API-PAG-* / API-K06-* | Confirmar somente um grupo | TX-004/005 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-PAGAMENTO; APIAUD-01 | TST-P09-16 |
| C10-01 | OPR-CORRECAO-FINANCEIRA-GERIR | HTTP | API-COR-* | Iniciar correção | TX-004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-CORRECAO; APIAUD-01 | TST-C10-01 |
| C10-02 | OPR-CORRECAO-FINANCEIRA-GERIR | HTTP | API-COR-* | Descartar antes do cancelamento da confirmação | TX-004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-CORRECAO; APIAUD-01 | TST-C10-02 |
| C10-03 | OPR-CORRECAO-FINANCEIRA-GERIR | HTTP | API-COR-* | Informar motivo e justificativa | TX-004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-CORRECAO; APIAUD-01 | TST-C10-03 |
| C10-03A | OPR-CORRECAO-FINANCEIRA-GERIR | HTTP | API-COR-* | Informar motivo e justificativa | TX-004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-CORRECAO; APIAUD-01 | TST-C10-03A |
| C10-04 | OPR-CORRECAO-FINANCEIRA-GERIR | HTTP | API-COR-* | Reabrir competência | TX-004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-CORRECAO; APIAUD-01 | TST-C10-04 |
| C10-05 | OPR-CORRECAO-FINANCEIRA-GERIR | HTTP | API-COR-* | Cancelar confirmação | TX-004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-CORRECAO; APIAUD-01 | TST-C10-05 |
| C10-06 | OPR-CORRECAO-FINANCEIRA-GERIR | HTTP | API-COR-* | Salvar nova memória ou valor | TX-004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-CORRECAO; APIAUD-01 | TST-C10-06 |
| C10-07 | OPR-CORRECAO-FINANCEIRA-GERIR | HTTP | API-COR-* | Apurar por verba | TX-004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-CORRECAO; APIAUD-01 | TST-C10-07 |
| C10-08 | OPR-CORRECAO-FINANCEIRA-GERIR | HTTP | API-COR-* | Materializar resultado positivo de uma verba | TX-004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-CORRECAO; APIAUD-01 | TST-C10-08 |
| C10-09 | OPR-CORRECAO-FINANCEIRA-GERIR | HTTP | API-COR-* | Materializar resultado negativo de uma verba | TX-004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-CORRECAO; APIAUD-01 | TST-C10-09 |
| C10-10 | OPR-CORRECAO-FINANCEIRA-GERIR | HTTP | API-COR-* | Materializar resultado zero de uma verba | TX-004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-CORRECAO; APIAUD-01 | TST-C10-10 |
| C10-11 | OPR-CORRECAO-FINANCEIRA-GERIR | HTTP | API-COR-* | Reconfirmar grupo positivo sem recibo interno | TX-004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-CORRECAO; APIAUD-01 | TST-C10-11 |
| C10-11A | OPR-CORRECAO-FINANCEIRA-GERIR | HTTP | API-COR-* | Reconfirmar grupo positivo com recibo interno | TX-004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-CORRECAO; APIAUD-01 | TST-C10-11A |
| C10-12 | OPR-CORRECAO-FINANCEIRA-GERIR | HTTP | API-COR-* | Reconfirmar grupo com novo total zero | TX-004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-CORRECAO; APIAUD-01 | TST-C10-12 |
| C10-13 | OPR-CORRECAO-FINANCEIRA-GERIR | HTTP | API-COR-* | Emitir substituto | TX-004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-CORRECAO; APIAUD-01 | TST-C10-13 |
| C10-14 | OPR-CORRECAO-FINANCEIRA-GERIR | HTTP | API-COR-* | Salvar e continuar depois | TX-004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-CORRECAO; APIAUD-01 | TST-C10-14 |
| C10-15 | OPR-CORRECAO-FINANCEIRA-GERIR | HTTP | API-COR-* | Conflito de versão | TX-004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-CORRECAO; APIAUD-01 | TST-C10-15 |
| C10-16A | OPR-CORRECAO-FINANCEIRA-GERIR | HTTP | API-COR-* | Perder resposta depois do envio | TX-004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-CORRECAO; APIAUD-01 | TST-C10-16A |
| C10-16 | OPR-CORRECAO-FINANCEIRA-GERIR | HTTP | API-COR-* | Reconciliar | TX-004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-CORRECAO; APIAUD-01 | TST-C10-16 |
| C10-17 | OPR-CORRECAO-FINANCEIRA-GERIR | HTTP | API-COR-* | Tentar fechar competência | TX-004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-CORRECAO; APIAUD-01 | TST-C10-17 |
| C10-18 | OPR-CORRECAO-FINANCEIRA-GERIR | HTTP | API-COR-* | Salvar novo controle autoritativo dentro de F04 | TX-004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-CORRECAO; APIAUD-01 | TST-C10-18 |
| C10-18A | OPR-CORRECAO-FINANCEIRA-GERIR | HTTP | API-COR-* | Validar controle autoritativo | TX-004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-CORRECAO; APIAUD-01 | TST-C10-18A |
| C10-19 | OPR-CORRECAO-FINANCEIRA-GERIR | HTTP | API-COR-* | Coordenar correções | TX-004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-CORRECAO; APIAUD-01 | TST-C10-19 |
| P10-01 | OPR-AJUSTE-POSITIVO-GERIR | HTTP | API-AJU-* | Criar ajuste positivo | TX-004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-AJUSTE; APIAUD-01 | TST-P10-01 |
| P10-02 | OPR-AJUSTE-POSITIVO-GERIR | HTTP | API-AJU-* | Confirmar pagamento do ajuste | TX-004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-AJUSTE; APIAUD-01 | TST-P10-02 |
| P10-03 | OPR-AJUSTE-POSITIVO-GERIR | HTTP | API-AJU-* | Tentar parcelar ou pagar parcialmente | TX-004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-AJUSTE; APIAUD-01 | TST-P10-03 |
| P10-04 | OPR-AJUSTE-POSITIVO-GERIR | HTTP | API-AJU-* | Corrigir ajuste pago | TX-004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-AJUSTE; APIAUD-01 | TST-P10-04 |
| N10-01 | OPR-DIFERENCA-ABSORVIDA-GERIR | HTTP | API-AJU-* | Registrar diferença absorvida | TX-004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-AJUSTE; APIAUD-01 | TST-N10-01 |
| N10-02 | OPR-DIFERENCA-ABSORVIDA-GERIR | HTTP | API-AJU-004 / API-EXP-* quando exportado | Consultar ou exportar | TX-001 na consulta; TX-006 no pedido de exportação | consulta sem idempotência de mutação; exportação usa IDEM-01 | AUTZ-AJUSTE; APIAUD-02 conforme acesso/exportação | TST-N10-02 |
| R11-01 | OPR-RECIBO-LOGICO-GERIR | HTTP | API-REC-* | Gerar prévia | TX-004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-RECIBO; APIAUD-01/02 | TST-R11-01 |
| R11-02 | OPR-RECIBO-LOGICO-GERIR | HTTP | API-REC-* | Confirmar pagamento de grupo com recibo | TX-004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-RECIBO; APIAUD-01/02 | TST-R11-02 |
| R11-03 | OPR-RECIBO-LOGICO-GERIR | HTTP | API-REC-* | Reimprimir a mesma versão | TX-004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-RECIBO; APIAUD-01/02 | TST-R11-03 |
| R11-04 | OPR-RECIBO-LOGICO-GERIR | HTTP_INTERNO | API-REC-* | Cancelar durante nova F04 | TX-004 | herda IDEM/CONC do comando originador | AUTZ-RECIBO; APIAUD-01/02 | TST-R11-04 |
| R11-05 | OPR-RECIBO-LOGICO-GERIR | HTTP | API-REC-* | Emitir sucessor | TX-004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-RECIBO; APIAUD-01/02 | TST-R11-05 |
| R11-06 | OPR-RECIBO-LOGICO-GERIR | HTTP | API-REC-* | Correção resulta em zero | TX-004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-RECIBO; APIAUD-01/02 | TST-R11-06 |
| R11-07 | OPR-RECIBO-LOGICO-GERIR | HTTP | API-REC-003 | Consultar versão histórica | TX-001 | sem idempotência de mutação; snapshot consistente e reautorizado | AUTZ-RECIBO; APIAUD-02 | TST-R11-07 |
| R11-08 | OPR-RECIBO-LOGICO-GERIR | HTTP | API-REC-007 / API-REC-008 | Tentar baixar sem acesso integral | TX-001 | sem idempotência de mutação; negação neutra antes do primeiro byte | AUTZ-RECIBO / AUTZ-ARQUIVO; APIAUD-02 | TST-R11-08 |
| R11-09 | OPR-RECIBO-LOGICO-GERIR | HTTP | API-REC-002 / API-REC-007 / API-REC-008 | Abrir identificador direto | TX-001 | sem idempotência de mutação; objeto e empresa revalidados sem revelar existência cruzada | AUTZ-RECIBO / AUTZ-ARQUIVO; APIAUD-02 | TST-R11-09 |
| A11-01 | OPR-ARQUIVO-RECIBO-GERIR | JOB_WORKER | API-REC-* / JOB-001/002 | Gerar PDF | TX-006/007 | chave de tarefa + lease + efeito idempotente | AUTZ-ARQUIVO; APIAUD-02 | TST-A11-01 |
| A11-02 | OPR-ARQUIVO-RECIBO-GERIR | JOB_WORKER | API-REC-* / JOB-001/002 | Falhar geração | TX-006/007 | chave de tarefa + lease + efeito idempotente | AUTZ-ARQUIVO; APIAUD-02 | TST-A11-02 |
| A11-03 | OPR-ARQUIVO-RECIBO-GERIR | JOB_WORKER | API-REC-* / JOB-001/002 | Regenerar com sucesso depois de validação | TX-006/007 | chave de tarefa + lease + efeito idempotente | AUTZ-ARQUIVO; APIAUD-02 | TST-A11-03 |
| A11-03A | OPR-ARQUIVO-RECIBO-GERIR | JOB_WORKER | API-REC-* / JOB-001/002 | Tentar regenerar e falhar | TX-006/007 | chave de tarefa + lease + efeito idempotente | AUTZ-ARQUIVO; APIAUD-02 | TST-A11-03A |
| A11-04 | OPR-ARQUIVO-RECIBO-GERIR | HTTP | API-REC-007 | Visualizar | TX-001 | sem idempotência de mutação; revalida autorização, metadado, estado e hash antes do primeiro byte | AUTZ-ARQUIVO; APIAUD-02 | TST-A11-04 |
| A11-05 | OPR-ARQUIVO-RECIBO-GERIR | HTTP | API-REC-008 | Baixar | TX-001 | sem idempotência de mutação; revalida autorização, metadado, estado e hash antes do primeiro byte | AUTZ-ARQUIVO; APIAUD-02 | TST-A11-05 |
| A11-06 | OPR-ARQUIVO-RECIBO-GERIR | JOB_WORKER | API-REC-* / JOB-001/002 | Detectar hash divergente | TX-006/007 | chave de tarefa + lease + efeito idempotente | AUTZ-ARQUIVO; APIAUD-02 | TST-A11-06 |
| A11-07 | OPR-ARQUIVO-RECIBO-GERIR | UI_LOCAL | UIX-ESTADO-COMUM | Trocar empresa ou expirar sessão | N/A | sem idempotência de mutação; limpa o conteúdo local e uma nova entrega sempre reautoriza | AUTZ-RESPOSTA; sem auditoria de negócio local | TST-A11-07 |
| L11-01 | OPR-LOTE-DOCUMENTAL-GERIR | HTTP | API-LOT-* / JOB-003/008 | Conferir elegibilidade | TX-006/007 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-LOTE; APIAUD-02 | TST-L11-01 |
| L11-02 | OPR-LOTE-DOCUMENTAL-GERIR | HTTP | API-LOT-* / JOB-003/008 | Solicitar PDF consolidado | TX-006/007 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-LOTE; APIAUD-02 | TST-L11-02 |
| L11-03 | OPR-LOTE-DOCUMENTAL-GERIR | HTTP | API-LOT-* / JOB-003/008 | Solicitar ZIP | TX-006/007 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-LOTE; APIAUD-02 | TST-L11-03 |
| L11-03A | OPR-LOTE-DOCUMENTAL-GERIR | HTTP | API-LOT-* / JOB-003/008 | Fixar snapshot do lote | TX-006/007 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-LOTE; APIAUD-02 | TST-L11-03A |
| L11-03B | OPR-LOTE-DOCUMENTAL-GERIR | JOB_WORKER | API-LOT-* / JOB-003/008 | Concluir geração integral | TX-006/007 | chave de tarefa + lease + efeito idempotente | AUTZ-LOTE; APIAUD-02 | TST-L11-03B |
| L11-04 | OPR-LOTE-DOCUMENTAL-GERIR | JOB_WORKER | API-LOT-* / JOB-003/008 | Falhar ou perder elegibilidade | TX-006/007 | chave de tarefa + lease + efeito idempotente | AUTZ-LOTE; APIAUD-02 | TST-L11-04 |
| L11-05 | OPR-LOTE-DOCUMENTAL-GERIR | HTTP | API-LOT-003 | Baixar | TX-001 | sem idempotência de mutação; revalida sessão, empresa, solicitante, prazo e arquivo | AUTZ-LOTE; APIAUD-02 | TST-L11-05 |
| L11-06 | OPR-LOTE-DOCUMENTAL-GERIR | JOB_TEMPORAL | JOB-TEMPORAL-LOTE-DOCUMENTAL | Completar 24 horas | TX-006/007 | chave de tarefa + lease + efeito idempotente | AUTZ-LOTE; APIAUD-02 | TST-L11-06 |
| L11-07 | OPR-LOTE-DOCUMENTAL-GERIR | HTTP | API-LOT-* / JOB-003/008 | Detectar hash divergente ou arquivo ausente | TX-006/007 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-LOTE; APIAUD-02 | TST-L11-07 |
| L11-08 | OPR-LOTE-DOCUMENTAL-GERIR | HTTP | API-LOT-* / JOB-003/008 | Solicitar novo lote | TX-006/007 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-LOTE; APIAUD-02 | TST-L11-08 |
| D12-01 | OPR-DESLIGAMENTO-GERIR | HTTP | API-DES-* | Programar data futura | TX-002/004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-DESLIGAMENTO; APIAUD-01 | TST-D12-01 |
| D12-02 | OPR-DESLIGAMENTO-GERIR | HTTP | API-DES-* | Registrar saída presente ou passada | TX-002/004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-DESLIGAMENTO; APIAUD-01 | TST-D12-02 |
| D12-03 | OPR-DESLIGAMENTO-GERIR | JOB_TEMPORAL | JOB-TEMPORAL-EMPREGADO | Chegar à data de saída | TX-008 | relógio do servidor; chave por vínculo, ciclo, data operacional e versão | AUTZ-DESLIGAMENTO; APIAUD-01 quando houver virada materializada | TST-D12-03 |
| D12-04 | OPR-DESLIGAMENTO-GERIR | JOB_TEMPORAL | JOB-TEMPORAL-EMPREGADO | Iniciar dia seguinte | TX-008 | relógio do servidor; chave por vínculo, ciclo, data operacional e versão | AUTZ-DESLIGAMENTO; APIAUD-01 quando houver virada materializada | TST-D12-04 |
| D12-05 | OPR-DESLIGAMENTO-GERIR | HTTP | API-DES-* | Cancelar programação futura | TX-002/004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-DESLIGAMENTO; APIAUD-01 | TST-D12-05 |
| D12-06 | OPR-DESLIGAMENTO-GERIR | HTTP | API-DES-* | Tentar cancelamento simples | TX-002/004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-DESLIGAMENTO; APIAUD-01 | TST-D12-06 |
| D12-07 | OPR-DESLIGAMENTO-GERIR | HTTP | API-DES-* | Corrigir data, aviso, dias ou bases | TX-002/004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-DESLIGAMENTO; APIAUD-01 | TST-D12-07 |
| D12-07A | OPR-DESLIGAMENTO-GERIR | HTTP | API-DES-* | Cancelar desligamento por correção autorizada | TX-002/004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-DESLIGAMENTO; APIAUD-01 | TST-D12-07A |
| D12-08 | OPR-DESLIGAMENTO-GERIR | HTTP | API-DES-* | Tentar segundo encerramento | TX-002/004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-DESLIGAMENTO; APIAUD-01 | TST-D12-08 |
| D12-08A | OPR-DESLIGAMENTO-GERIR | HTTP | API-DES-* | Restaurar identidade da obrigação | TX-002/004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-DESLIGAMENTO; APIAUD-01 | TST-D12-08A |
| D12-08C | OPR-DESLIGAMENTO-GERIR | HTTP | API-DES-* | Restaurar e recalcular obrigação | TX-002/004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-DESLIGAMENTO; APIAUD-01 | TST-D12-08C |
| D12-08B | OPR-DESLIGAMENTO-GERIR | HTTP | API-DES-* | Concluir reconciliação do cancelamento | TX-002/004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-DESLIGAMENTO; APIAUD-01 | TST-D12-08B |
| D12-09 | OPR-DESLIGAMENTO-GERIR | HTTP | API-DES-* | Cancelar grupo sem valor que permaneça no evento | TX-002/004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-DESLIGAMENTO; APIAUD-01 | TST-D12-09 |
| D12-09A | OPR-DESLIGAMENTO-GERIR | HTTP | API-DES-* | Retirar RA e preservar reembolso no evento mensal | TX-002/004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-DESLIGAMENTO; APIAUD-01 | TST-D12-09A |
| D12-10 | OPR-DESLIGAMENTO-GERIR | HTTP | API-DES-* | Avaliar origem real | TX-002/004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-DESLIGAMENTO; APIAUD-01 | TST-D12-10 |
| D12-11 | OPR-DESLIGAMENTO-GERIR | HTTP | API-DES-* | Detectar atraso sem pagamento | TX-002/004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-DESLIGAMENTO; APIAUD-01 | TST-D12-11 |
| D12-12 | OPR-DESLIGAMENTO-GERIR | HTTP | API-DES-* | Pagar adiantamento atrasado | TX-002/004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-DESLIGAMENTO; APIAUD-01 | TST-D12-12 |
| D12-13 | OPR-DESLIGAMENTO-GERIR | HTTP | API-DES-* | Cancelar e encaminhar grupo sem valor remanescente no evento | TX-002/004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-DESLIGAMENTO; APIAUD-01 | TST-D12-13 |
| D12-13A | OPR-DESLIGAMENTO-GERIR | HTTP | API-DES-* | Cancelar RA e preservar reembolso | TX-002/004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-DESLIGAMENTO; APIAUD-01 | TST-D12-13A |
| D12-14 | OPR-DESLIGAMENTO-GERIR | HTTP | API-DES-* | Registrar desligamento | TX-002/004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-DESLIGAMENTO; APIAUD-01 | TST-D12-14 |
| D12-15 | OPR-DESLIGAMENTO-GERIR | HTTP | API-DES-* | Registrar/programar saída | TX-002/004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-DESLIGAMENTO; APIAUD-01 | TST-D12-15 |
| D12-15A | OPR-DESLIGAMENTO-GERIR | HTTP | API-DES-* | Criar competência final com dados incompletos | TX-002/004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-DESLIGAMENTO; APIAUD-01 | TST-D12-15A |
| D12-15B | OPR-DESLIGAMENTO-GERIR | HTTP | API-DES-* | Criar competência final com dados completos | TX-002/004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-DESLIGAMENTO; APIAUD-01 | TST-D12-15B |
| D12-16 | OPR-DESLIGAMENTO-GERIR | HTTP | API-DES-* | Registrar ou alterar saída | TX-002/004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-DESLIGAMENTO; APIAUD-01 | TST-D12-16 |
| D12-17 | OPR-DESLIGAMENTO-GERIR | HTTP | API-DES-* | Informar demissão tardiamente | TX-002/004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-DESLIGAMENTO; APIAUD-01 | TST-D12-17 |
| D12-18 | OPR-DESLIGAMENTO-GERIR | HTTP | API-DES-* | Informar rescisão oficial positiva | TX-002/004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-DESLIGAMENTO; APIAUD-01 | TST-D12-18 |
| D12-18A | OPR-DESLIGAMENTO-GERIR | HTTP | API-DES-* | Informar rescisão oficial zero | TX-002/004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-DESLIGAMENTO; APIAUD-01 | TST-D12-18A |
| D12-19 | OPR-DESLIGAMENTO-GERIR | HTTP | API-DES-* | Confirmar pagamento | TX-002/004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-DESLIGAMENTO; APIAUD-01 | TST-D12-19 |
| D12-20 | OPR-DESLIGAMENTO-GERIR | HTTP | API-DES-* | Calcular acerto complementar | TX-002/004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-DESLIGAMENTO; APIAUD-01 | TST-D12-20 |
| D12-21 | OPR-DESLIGAMENTO-GERIR | HTTP | API-DES-* | Concluir conferência | TX-002/004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-DESLIGAMENTO; APIAUD-01 | TST-D12-21 |
| D12-22 | OPR-DESLIGAMENTO-GERIR | HTTP | API-DES-* | Confirmar pagamento | TX-002/004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-DESLIGAMENTO; APIAUD-01 | TST-D12-22 |
| D12-23 | OPR-DESLIGAMENTO-GERIR | HTTP | API-DES-* | Materializar competência final | TX-002/004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-DESLIGAMENTO; APIAUD-01 | TST-D12-23 |
| D12-24 | OPR-DESLIGAMENTO-GERIR | HTTP | API-DES-* | Informar desligamento posterior | TX-002/004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-DESLIGAMENTO; APIAUD-01 | TST-D12-24 |
| D12-25 | OPR-DESLIGAMENTO-GERIR | HTTP | API-DES-* | Recalcular a projeção financeira | TX-002/004 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-DESLIGAMENTO; APIAUD-01 | TST-D12-25 |
| ASO-A01 | OPR-ASO-ACOMPANHAMENTO-GERIR | HTTP | API-ASO-003 | Criar acompanhamento manual | TX-002 | IDEM-01; CONC-02 pela unicidade da necessidade manual ativa | AUTZ-ASO; APIAUD-01 | TST-ASO-A01 |
| ASO-A02 | OPR-ASO-ACOMPANHAMENTO-GERIR | HTTP_INTERNO | API-DES-002 | Registrar desligamento formal | TX-002 | herda IDEM-01 e CONC-01/02 do desligamento originador | AUTZ-ASO pela operação originadora; APIAUD-01 na mesma transação | TST-ASO-A02 |
| ASO-A03 | OPR-ASO-ACOMPANHAMENTO-GERIR | HTTP_INTERNO | API-DES-002 | Registrar desligamento formal já coberto por demissional vigente | TX-002 | herda IDEM-01 e CONC-01/02 do desligamento originador | AUTZ-ASO pela operação originadora; APIAUD-01 na mesma transação | TST-ASO-A03 |
| ASO-A04 | OPR-ASO-ACOMPANHAMENTO-GERIR | HTTP | API-ASO-005 | Marcar como agendado | TX-002 | IDEM-01; CONC-01 pela versão do acompanhamento | AUTZ-ASO; APIAUD-01 | TST-ASO-A04 |
| ASO-A05 | OPR-ASO-ACOMPANHAMENTO-GERIR | HTTP | API-ASO-005 | Marcar novamente como agendado | TX-002 | IDEM-01; CONC-01 pela versão do acompanhamento | AUTZ-ASO; APIAUD-01 | TST-ASO-A05 |
| ASO-A06 | OPR-ASO-ACOMPANHAMENTO-GERIR | HTTP | API-ASO-006 | Registrar não comparecimento | TX-002 | IDEM-01; CONC-01 pela versão do acompanhamento | AUTZ-ASO; APIAUD-01 | TST-ASO-A06 |
| ASO-A07 | OPR-ASO-ACOMPANHAMENTO-GERIR | HTTP_INTERNO | API-ASO-009 | Confirmar exame realizado em S03 | TX-002 | herda IDEM-01 e CONC-01/02 do registro de exame | AUTZ-ASO pela operação originadora; APIAUD-01 na mesma transação | TST-ASO-A07 |
| ASO-A08 | OPR-ASO-ACOMPANHAMENTO-GERIR | HTTP | API-ASO-007 | Encerrar sem realização | TX-002 | IDEM-01; CONC-01 pela versão do acompanhamento | AUTZ-ASO; APIAUD-01 | TST-ASO-A08 |
| ASO-A09 | OPR-ASO-ACOMPANHAMENTO-GERIR | HTTP | API-ASO-008 | Cancelar acompanhamento manual | TX-002 | IDEM-01; CONC-01 pela versão do acompanhamento | AUTZ-ASO; APIAUD-01 | TST-ASO-A09 |
| ASO-A10 | OPR-ASO-ACOMPANHAMENTO-GERIR | HTTP_INTERNO | API-DES-005 | Cancelar desligamento futuro | TX-002 | herda IDEM-01 e CONC-01/02 do cancelamento originador | AUTZ-ASO pela operação originadora; APIAUD-01 na mesma transação | TST-ASO-A10 |
| ASO-A10A | OPR-ASO-ACOMPANHAMENTO-GERIR | HTTP_INTERNO | API-DES-005 | Cancelar desligamento por correção | TX-002 | herda IDEM-01 e CONC-01/02 do cancelamento originador | AUTZ-ASO pela operação originadora; APIAUD-01 na mesma transação | TST-ASO-A10A |
| ASO-A10B | OPR-ASO-ACOMPANHAMENTO-GERIR | HTTP_INTERNO | API-DES-005 | Cancelar desligamento simples ou por correção | TX-002 | herda IDEM-01 e CONC-01/02 do cancelamento originador | AUTZ-ASO pela operação originadora; APIAUD-01 na mesma transação | TST-ASO-A10B |
| ASO-A11 | OPR-ASO-ACOMPANHAMENTO-GERIR | HTTP_INTERNO | API-ASO-013 | Invalidar a versão vigente lançada incorretamente | TX-002 | herda IDEM-01 e CONC-01/02 da invalidação originadora | AUTZ-ASO pela operação originadora; APIAUD-01 na mesma transação | TST-ASO-A11 |
| ASO-A12 | OPR-ASO-ACOMPANHAMENTO-GERIR | HTTP_INTERNO | API-ASO-013 | Invalidar exame e cancelar necessidade manual que deixou de existir | TX-002 | herda IDEM-01 e CONC-01/02 da invalidação originadora | AUTZ-ASO pela operação originadora; APIAUD-01 na mesma transação | TST-ASO-A12 |
| ASO-A13 | OPR-ASO-ACOMPANHAMENTO-GERIR | HTTP_INTERNO | API-ASO-013 | Invalidar exame depois do cancelamento válido do desligamento | TX-002 | herda IDEM-01 e CONC-01/02 da invalidação originadora | AUTZ-ASO pela operação originadora; APIAUD-01 na mesma transação | TST-ASO-A13 |
| ASO-A14 | OPR-ASO-ACOMPANHAMENTO-GERIR | HTTP_INTERNO | API-ASO-013 | Invalidar exame | TX-002 | herda IDEM-01 e CONC-01/02 da invalidação originadora | AUTZ-ASO pela operação originadora; APIAUD-01 na mesma transação | TST-ASO-A14 |
| ASO-E01 | OPR-ASO-EXAME-GERIR | HTTP | API-ASO-* | Registrar novo admissional | TX-002 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-ASO-RESULTADO; APIAUD-01/02 | TST-ASO-E01 |
| ASO-E02 | OPR-ASO-EXAME-GERIR | HTTP | API-ASO-* | Registrar novo periódico | TX-002 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-ASO-RESULTADO; APIAUD-01/02 | TST-ASO-E02 |
| ASO-E03 | OPR-ASO-EXAME-GERIR | HTTP | API-ASO-* | Registrar retorno ao trabalho ou mudança de riscos | TX-002 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-ASO-RESULTADO; APIAUD-01/02 | TST-ASO-E03 |
| ASO-E04 | OPR-ASO-EXAME-GERIR | HTTP | API-ASO-* | Registrar demissional | TX-002 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-ASO-RESULTADO; APIAUD-01/02 | TST-ASO-E04 |
| ASO-E05 | OPR-ASO-EXAME-GERIR | HTTP | API-ASO-* | Retificar o mesmo exame | TX-002 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-ASO-RESULTADO; APIAUD-01/02 | TST-ASO-E05 |
| ASO-E06 | OPR-ASO-EXAME-GERIR | HTTP | API-ASO-* | Invalidar lançamento incorreto | TX-002 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-ASO-RESULTADO; APIAUD-01/02 | TST-ASO-E06 |
| ASO-E07 | OPR-ASO-EXAME-GERIR | HTTP | API-ASO-011 | Abrir versão histórica | TX-001 | sem idempotência de mutação; versões são relidas e redigidas pela autorização atual | AUTZ-ASO; APIAUD-02 somente se houver resultado revelado | TST-ASO-E07 |
| ASO-E08 | OPR-ASO-EXAME-GERIR | HTTP | API-ASO-014 | Visualizar resultado clínico | TX-001 | sem idempotência de mutação; revelação separada e reautorizada a cada acesso | AUTZ-ASO-RESULTADO; APIAUD-02 | TST-ASO-E08 |
| ASO-E09 | OPR-ASO-EXAME-GERIR | HTTP | API-ASO-* | Alterar resultado, clínica, data ou vencimento | TX-002 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-ASO-RESULTADO; APIAUD-01/02 | TST-ASO-E09 |
| ASO-E10 | OPR-ASO-EXAME-GERIR | HTTP | API-ASO-* | Transferir exame para outra empresa, pessoa ou vínculo | TX-002 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-ASO-RESULTADO; APIAUD-01/02 | TST-ASO-E10 |
| ASO-R01 | OPR-ASO-RESULTADO-PROJETAR | PROJECAO | OPR-ASO-RESULTADO-PROJETAR / API-ASO-014 quando revelado | Sem restrição | TX-001 | regra pura; sem idempotência de mutação e sem persistir novo estado | AUTZ-ASO-RESULTADO; APIAUD-02 somente na revelação | TST-ASO-R01 |
| ASO-R02 | OPR-ASO-RESULTADO-PROJETAR | PROJECAO | OPR-ASO-RESULTADO-PROJETAR / API-ASO-014 quando revelado | Com restrição | TX-001 | regra pura; sem idempotência de mutação e sem persistir novo estado | AUTZ-ASO-RESULTADO; APIAUD-02 somente na revelação | TST-ASO-R02 |
| ASO-R03 | OPR-ASO-RESULTADO-PROJETAR | PROJECAO | OPR-ASO-RESULTADO-PROJETAR / API-ASO-014 quando revelado | Não aplicável | TX-001 | regra pura; sem idempotência de mutação e sem persistir novo estado | AUTZ-ASO-RESULTADO; APIAUD-02 somente na revelação | TST-ASO-R03 |
| ASO-R04 | OPR-ASO-RESULTADO-PROJETAR | PROJECAO | OPR-ASO-RESULTADO-PROJETAR / API-ASO-014 quando revelado | Inexistente | TX-001 | regra pura; sem idempotência de mutação e sem persistir novo estado | AUTZ-ASO-RESULTADO; APIAUD-02 somente na revelação | TST-ASO-R04 |
| ASO-P01A | OPR-ASO-PRAZO-AVALIAR | HTTP_INTERNO | API-ASO-009 | Confirmar exame monitorado vigente | TX-002 | herda IDEM-01 e CONC-01/02 do registro do exame | AUTZ-ASO pela operação originadora; sem nova APIAUD além do exame | TST-ASO-P01A |
| ASO-P01B | OPR-ASO-PRAZO-AVALIAR | HTTP_INTERNO | API-ASO-009 | Confirmar exame monitorado na janela | TX-002 | herda IDEM-01 e CONC-01/02 do registro do exame | AUTZ-ASO pela operação originadora; APIAUD-01 no exame e na ocorrência materializada | TST-ASO-P01B |
| ASO-P01C | OPR-ASO-PRAZO-AVALIAR | HTTP_INTERNO | API-ASO-009 | Confirmar exame monitorado já vencido | TX-002 | herda IDEM-01 e CONC-01/02 do registro do exame | AUTZ-ASO pela operação originadora; APIAUD-01 no exame e na ocorrência materializada | TST-ASO-P01C |
| ASO-P02 | OPR-ASO-PRAZO-AVALIAR | HTTP_INTERNO | API-ASO-009 | Confirmar demissional | TX-002 | herda IDEM-01 e CONC-01/02 do registro do exame | AUTZ-ASO pela operação originadora; sem nova APIAUD além do exame | TST-ASO-P02 |
| ASO-P03 | OPR-ASO-PRAZO-AVALIAR | JOB_TEMPORAL | JOB-007 | Entrar na janela de 30 dias | TX-008 | chave de tarefa temporal + deduplicação da condição; sem versão diária | ator técnico empresarial; APIAUD-01 apenas na ocorrência materializada | TST-ASO-P03 |
| ASO-P04 | OPR-ASO-PRAZO-AVALIAR | JOB_TEMPORAL | JOB-007 | Passar o dia do vencimento | TX-008 | chave de tarefa temporal + deduplicação da condição; sem nova ocorrência diária | ator técnico empresarial; APIAUD-01 apenas na ocorrência atualizada | TST-ASO-P04 |
| ASO-P05A | OPR-ASO-PRAZO-AVALIAR | HTTP_INTERNO | API-ASO-012 | Retificar vencimento para além de 30 dias | TX-002 | herda IDEM-01 e CONC-01 da retificação | AUTZ-ASO pela operação originadora; APIAUD-01 na retificação e reconciliação | TST-ASO-P05A |
| ASO-P05B | OPR-ASO-PRAZO-AVALIAR | HTTP_INTERNO | API-ASO-012 | Retificar vencimento para a janela | TX-002 | herda IDEM-01 e CONC-01 da retificação | AUTZ-ASO pela operação originadora; APIAUD-01 na retificação e ocorrência | TST-ASO-P05B |
| ASO-P05C | OPR-ASO-PRAZO-AVALIAR | HTTP_INTERNO | API-ASO-012 | Retificar vencimento para data passada | TX-002 | herda IDEM-01 e CONC-01 da retificação | AUTZ-ASO pela operação originadora; APIAUD-01 na retificação e ocorrência | TST-ASO-P05C |
| ASO-P06 | OPR-ASO-PRAZO-AVALIAR | HTTP_INTERNO | API-ASO-009 | Confirmar admissional vigente antes do primeiro periódico | TX-002 | herda IDEM-01 e CONC-01/02 do registro do exame | AUTZ-ASO pela operação originadora; APIAUD-01 no exame | TST-ASO-P06 |
| ASO-P07 | OPR-ASO-PRAZO-AVALIAR | HTTP_INTERNO | API-ASO-009 | Confirmar novo periódico vigente | TX-002 | herda IDEM-01 e CONC-01/02 do registro do exame | AUTZ-ASO pela operação originadora; APIAUD-01 no exame e reconciliação | TST-ASO-P07 |
| ASO-P08A | OPR-ASO-PRAZO-AVALIAR | HTTP_INTERNO | API-ASO-009 | Confirmar retorno ou mudança de riscos | TX-002 | herda IDEM-01 e CONC-01/02 do registro do exame | AUTZ-ASO pela operação originadora; sem APIAUD autônoma | TST-ASO-P08A |
| ASO-P08B | OPR-ASO-PRAZO-AVALIAR | HTTP_INTERNO | API-ASO-009 | Confirmar demissional | TX-002 | herda IDEM-01 e CONC-01/02 do registro do exame | AUTZ-ASO pela operação originadora; sem APIAUD autônoma | TST-ASO-P08B |
| ASO-P09 | OPR-ASO-PRAZO-AVALIAR | JOB_TEMPORAL | JOB-007 | Inativar vínculo na data efetiva | TX-008 | chave de tarefa temporal + efeito idempotente por vínculo e data efetiva | ator técnico empresarial; APIAUD-01 na reconciliação da ocorrência | TST-ASO-P09 |
| ASO-P10A | OPR-ASO-PRAZO-AVALIAR | HTTP_INTERNO | API-ASO-013 | Invalidar exame com candidato anterior elegível | TX-002 | herda IDEM-01 e CONC-01/02 da invalidação | AUTZ-ASO pela operação originadora; APIAUD-01 na invalidação e promoção | TST-ASO-P10A |
| ASO-P10B | OPR-ASO-PRAZO-AVALIAR | HTTP_INTERNO | API-ASO-013 | Invalidar exame sem candidato elegível | TX-002 | herda IDEM-01 e CONC-01/02 da invalidação | AUTZ-ASO pela operação originadora; APIAUD-01 na invalidação e reconciliação | TST-ASO-P10B |
| ASO-P11 | OPR-ASO-PRAZO-AVALIAR | HTTP_INTERNO | API-ASO-012 | Retificar versão mantendo a mesma condição de alerta | TX-002 | herda IDEM-01 e CONC-01 da retificação | AUTZ-ASO pela operação originadora; APIAUD-01 na retificação | TST-ASO-P11 |
| ASO-P12 | OPR-ASO-PRAZO-AVALIAR | JOB_WORKER | JOB-007 | Condição de alerta reaparecer legitimamente | TX-007 | chave de tarefa + sequência lógica + deduplicação da nova ocorrência | ator técnico empresarial; APIAUD-01 na nova ocorrência | TST-ASO-P12 |
| CLI-01 | OPR-CLINICA-GERIR | HTTP | API-CLI-* | Cadastrar clínica | TX-002 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-CLINICA; APIAUD-01 | TST-CLI-01 |
| CLI-02 | OPR-CLINICA-GERIR | HTTP | API-CLI-* | Editar cadastro | TX-002 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-CLINICA; APIAUD-01 | TST-CLI-02 |
| CLI-03 | OPR-CLINICA-GERIR | HTTP | API-CLI-* | Inativar | TX-002 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-CLINICA; APIAUD-01 | TST-CLI-03 |
| CLI-04 | OPR-CLINICA-GERIR | HTTP | API-CLI-* | Reativar | TX-002 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-CLINICA; APIAUD-01 | TST-CLI-04 |
| CLI-05 | OPR-CLINICA-GERIR | HTTP | API-ASO-015 | Selecionar em novo exame | TX-001 | sem idempotência de mutação; lista mínima de clínicas ativas no contexto do exame | AUTZ-ASO; sem conceder AUTZ-CLINICA global; sem APIAUD de mudança | TST-CLI-05 |
| CLI-06 | OPR-CLINICA-GERIR | HTTP | API-ASO-010 | Abrir snapshot por S04 | TX-001 | sem idempotência de mutação; snapshot histórico pertence ao exame autorizado | AUTZ-ASO; APIAUD-02 somente se a resposta revelar dado sensível | TST-CLI-06 |
| CLI-07 | OPR-CLINICA-GERIR | HTTP | API-CLI-008 / JOB-004 | Exportar catálogo | TX-006/007 | IDEM-02 no pedido; worker usa chave de tarefa, lease e snapshot autorizado | AUTZ-CLINICA e AUTZ-EXPORTACAO; APIAUD-02 | TST-CLI-07 |
| NOT-O01 | OPR-NOTIFICACAO-OCORRENCIA-GERIR | JOB_WORKER | JOB-006 | Condição da origem tornar-se ativa | TX-007 | chave de tarefa + chave lógica da ocorrência + unicidade ativa | ator técnico; AUTZ-NOTIFICACAO na projeção; APIAUD-01 | TST-NOT-O01 |
| NOT-O02 | OPR-NOTIFICACAO-OCORRENCIA-GERIR | JOB_WORKER | JOB-006 | Rotina reencontrar a mesma condição | TX-007 | chave de tarefa + atualização idempotente da ocorrência existente | ator técnico; AUTZ-NOTIFICACAO na projeção; APIAUD-01 | TST-NOT-O02 |
| NOT-O03 | OPR-NOTIFICACAO-OCORRENCIA-GERIR | JOB_WORKER | JOB-006 | Origem deixar de estar pendente | TX-007 | chave de tarefa + lease + resolução idempotente | ator técnico; AUTZ-NOTIFICACAO na projeção; APIAUD-01 | TST-NOT-O03 |
| NOT-O04 | OPR-NOTIFICACAO-OCORRENCIA-GERIR | JOB_WORKER | JOB-006 | Mesma condição reaparecer | TX-007 | chave de tarefa + sequência lógica; não reabre a ocorrência anterior | ator técnico; AUTZ-NOTIFICACAO na projeção; APIAUD-01 | TST-NOT-O04 |
| NOT-O05 | OPR-NOTIFICACAO-OCORRENCIA-GERIR | JOB_TEMPORAL | JOB-TEMPORAL-NOTIFICACAO-OCORRENCIA | Urgência aumentar | TX-008 | chave temporal + atualização idempotente da mesma ocorrência | ator técnico; AUTZ-NOTIFICACAO na projeção; APIAUD-01 | TST-NOT-O05 |
| NOT-O06 | OPR-NOTIFICACAO-OCORRENCIA-GERIR | HTTP_INTERNO | API-USR-* / API-PRF-* / API-ACLINC-* | Permissão da origem ser retirada de um usuário | TX-003 | herda IDEM-01 e CONC-01/02 da alteração de autorização | AUTZ-NOTIFICACAO recalculada; APIAUD-SEGURANCA na origem | TST-NOT-O06 |
| NOT-O07 | OPR-NOTIFICACAO-OCORRENCIA-GERIR | JOB_TEMPORAL | JOB-TEMPORAL-NOTIFICACAO-OCORRENCIA | Completar 90 dias | TX-008 | chave de tarefa temporal + efeito idempotente por ocorrência | ator técnico; AUTZ-NOTIFICACAO; APIAUD-01 | TST-NOT-O07 |
| NOT-O08 | OPR-NOTIFICACAO-OCORRENCIA-GERIR | HTTP_INTERNO | API-ASO-006 | Acompanhamento demissional ir para `Não compareceu` | TX-002 | herda IDEM-01 e CONC-01 da operação originadora | AUTZ-NOTIFICACAO pela origem; APIAUD-01 na mesma transação | TST-NOT-O08 |
| NOT-O09 | OPR-NOTIFICACAO-OCORRENCIA-GERIR | HTTP_INTERNO | API-ASO-005 | Reagendar após não comparecimento | TX-002 | herda IDEM-01 e CONC-01 da operação originadora | AUTZ-NOTIFICACAO pela origem; APIAUD-01 na mesma transação | TST-NOT-O09 |
| NOT-O10 | OPR-NOTIFICACAO-OCORRENCIA-GERIR | HTTP_INTERNO | API-ASO-009 / API-ASO-007 / API-DES-005 | Realizar, encerrar ou cancelar a pendência demissional | TX-002 | herda IDEM-01 e CONC-01/02 da operação originadora | AUTZ-NOTIFICACAO pela origem; APIAUD-01 na mesma transação | TST-NOT-O10 |
| NOT-O11 | OPR-NOTIFICACAO-OCORRENCIA-GERIR | HTTP_INTERNO | API-USR-* / API-PRF-* / API-ACLINC-* | Conceder ou restaurar autorização | TX-003 | herda IDEM-01 e CONC-01/02 da alteração de autorização | AUTZ-NOTIFICACAO recalculada; APIAUD-SEGURANCA na origem | TST-NOT-O11 |
| NOT-L01 | OPR-NOTIFICACAO-LEITURA-GERIR | HTTP | API-NOT-* | Marcar item como lido | TX-002 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-NOTIFICACAO; APIAUD-01 | TST-NOT-L01 |
| NOT-L02 | OPR-NOTIFICACAO-LEITURA-GERIR | HTTP | API-NOT-* | Marcar itens visíveis como lidos | TX-002 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-NOTIFICACAO; APIAUD-01 | TST-NOT-L02 |
| NOT-L03 | OPR-NOTIFICACAO-LEITURA-GERIR | HTTP | API-NOT-* | Marcar novamente como lida | TX-002 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-NOTIFICACAO; APIAUD-01 | TST-NOT-L03 |
| NOT-L04 | OPR-NOTIFICACAO-LEITURA-GERIR | JOB_TEMPORAL | JOB-TEMPORAL-NOTIFICACAO-OCORRENCIA | Ocorrência tornar-se urgente | TX-008 | chave temporal + atualização idempotente das leituras alcançadas | ator técnico; AUTZ-NOTIFICACAO na projeção; APIAUD-01 | TST-NOT-L04 |
| NOT-L05 | OPR-NOTIFICACAO-LEITURA-GERIR | JOB_WORKER | JOB-006 | Resolver ocorrência | TX-007 | chave de tarefa; preserva idempotentemente o estado individual de leitura | ator técnico; AUTZ-NOTIFICACAO na projeção; APIAUD-01 | TST-NOT-L05 |
| NOT-L06 | OPR-NOTIFICACAO-LEITURA-GERIR | HTTP | API-NOT-005 e rota autorizada da origem | Abrir origem | TX-001 | sem idempotência de mutação; resolve o destino sem ampliar a autorização | AUTZ-NOTIFICACAO / autorização da origem; APIAUD conforme a origem | TST-NOT-L06 |
| EXP-01 | OPR-EXPORTACAO-GERIR | HTTP | rotas de origem / API-EXP-* / JOB-004/008 | Solicitar exportação empresarial | TX-006/007 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-EXPORTACAO; APIAUD-02 | TST-EXP-01 |
| EXP-02 | OPR-EXPORTACAO-GERIR | HTTP | rotas de origem / API-EXP-* / JOB-004/008 | Solicitar exportação histórica de empresa inativa | TX-006/007 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-EXPORTACAO; APIAUD-02 | TST-EXP-02 |
| EXP-03 | OPR-EXPORTACAO-GERIR | HTTP | rotas de origem / API-EXP-* / JOB-004/008 | Solicitar exportação global de clínicas | TX-006/007 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-EXPORTACAO; APIAUD-02 | TST-EXP-03 |
| EXP-04 | OPR-EXPORTACAO-GERIR | HTTP | rotas de origem / API-EXP-* / JOB-004/008 | Solicitar exportação global de auditoria | TX-006/007 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-EXPORTACAO; APIAUD-02 | TST-EXP-04 |
| EXP-05 | OPR-EXPORTACAO-GERIR | HTTP | API-ASO-016 / API-ASO-002 / JOB-004 | Incluir resultado clínico no Excel | TX-006/007 | confirmação sensível de uso único vinculada ao candidato; IDEM-02 no pedido; worker reautoriza snapshot | AUTZ-ASO-RESULTADO e AUTZ-EXPORTACAO; APIAUD-02 | TST-EXP-05 |
| EXP-06 | OPR-EXPORTACAO-GERIR | HTTP | rotas de origem / API-EXP-* / JOB-004/008 | Solicitar exportação sem linhas | TX-006/007 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-EXPORTACAO; APIAUD-02 | TST-EXP-06 |
| EXP-07 | OPR-EXPORTACAO-GERIR | JOB_WORKER | JOB-004 | Iniciar geração assíncrona | TX-007 | chave de tarefa + lease + reserva idempotente do pedido | ator técnico; AUTZ-EXPORTACAO revalidada; APIAUD-02 | TST-EXP-07 |
| EXP-08 | OPR-EXPORTACAO-GERIR | JOB_WORKER | JOB-004 | Concluir geração | TX-007 | chave de tarefa + lease + publicação idempotente do mesmo artefato | ator técnico; AUTZ-EXPORTACAO revalidada; APIAUD-02 | TST-EXP-08 |
| EXP-09 | OPR-EXPORTACAO-GERIR | JOB_WORKER | JOB-004 | Falhar geração | TX-007 | chave de tarefa + lease + falha terminal idempotente | ator técnico; AUTZ-EXPORTACAO revalidada; APIAUD-02 | TST-EXP-09 |
| EXP-10 | OPR-EXPORTACAO-GERIR | HTTP | API-EXP-002 / API-EXP-004 | Baixar | TX-001 | sem idempotência de mutação; revalidação tripla e hash antes do primeiro byte | AUTZ-EXPORTACAO; APIAUD-02 | TST-EXP-10 |
| EXP-10A | OPR-EXPORTACAO-GERIR | POLITICA | AUTZ-SESSAO / AUTZ-EXPORTACAO | Sessão expirar, encerrar ou ser revogada | TX-001 | arquivo permanece pronto; nova entrega exige nova sessão e autorização completas | AUTZ-EXPORTACAO; APIAUD-02 na tentativa negada quando aplicável | TST-EXP-10A |
| EXP-11 | OPR-EXPORTACAO-GERIR | HTTP | rotas de origem / API-EXP-* / JOB-004/008 | Perder autorização efetiva ou invalidar o escopo do pedido | TX-006/007 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-EXPORTACAO; APIAUD-02 | TST-EXP-11 |
| EXP-12 | OPR-EXPORTACAO-GERIR | JOB_TEMPORAL | JOB-TEMPORAL-EXPORTACAO | Completar 24 horas | TX-006/007 | chave de tarefa + lease + efeito idempotente | AUTZ-EXPORTACAO; APIAUD-02 | TST-EXP-12 |
| EXP-13 | OPR-EXPORTACAO-GERIR | HTTP | rotas de origem / API-EXP-* / JOB-004/008 | Solicitar novamente | TX-006/007 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-EXPORTACAO; APIAUD-02 | TST-EXP-13 |
| INC-01 | OPR-INCIDENTE-GERIR | HTTP | API-INC-* | Registrar incidente | TX-002 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-INCIDENTE-RESTRITO; APIAUD-01/02 | TST-INC-01 |
| INC-02 | OPR-INCIDENTE-GERIR | HTTP | API-INC-* | Iniciar tratamento | TX-002 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-INCIDENTE-RESTRITO; APIAUD-01/02 | TST-INC-02 |
| INC-03 | OPR-INCIDENTE-GERIR | HTTP | API-INC-* | Acrescentar entrada | TX-002 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-INCIDENTE-RESTRITO; APIAUD-01/02 | TST-INC-03 |
| INC-04 | OPR-INCIDENTE-GERIR | HTTP | API-INC-* | Corrigir informação anterior | TX-002 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-INCIDENTE-RESTRITO; APIAUD-01/02 | TST-INC-04 |
| INC-05 | OPR-INCIDENTE-GERIR | HTTP | API-INC-* | Confirmar alcance | TX-002 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-INCIDENTE-RESTRITO; APIAUD-01/02 | TST-INC-05 |
| INC-06 | OPR-INCIDENTE-GERIR | HTTP | API-INC-* | Registrar avaliação jurídica/LGPD | TX-002 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-INCIDENTE-RESTRITO; APIAUD-01/02 | TST-INC-06 |
| INC-07 | OPR-INCIDENTE-GERIR | HTTP | API-INC-* | Registrar comunicação externa realizada | TX-002 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-INCIDENTE-RESTRITO; APIAUD-01/02 | TST-INC-07 |
| INC-08 | OPR-INCIDENTE-GERIR | HTTP | API-INC-* | Concluir | TX-002 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-INCIDENTE-RESTRITO; APIAUD-01/02 | TST-INC-08 |
| INC-09 | OPR-INCIDENTE-GERIR | HTTP | API-INC-* | Reabrir | TX-002 | IDEM-01 quando mutável; CONC-01/02 conforme raiz/agregado | AUTZ-INCIDENTE-RESTRITO; APIAUD-01/02 | TST-INC-09 |
| INC-10 | OPR-INCIDENTE-GERIR | HTTP | API-INC-002 / API-INC-003 | Consultar | TX-001 | sem idempotência de mutação; consulta reautorizada no escopo restrito | AUTZ-INCIDENTE-RESTRITO; APIAUD-02 | TST-INC-10 |
| UI-01 | OPR-INTERFACE-ESTADO-COMUM | UI_LOCAL | UIX-ESTADO-COMUM / API-AUT-014 quando necessário | Abrir, atualizar ou aplicar filtro | N/A | N/A; reconcilia pela API-AUT-014 quando aplicável | AUTZ-RESPOSTA; sem auditoria de negócio local | TST-UI-01 |
| UI-02 | OPR-INTERFACE-ESTADO-COMUM | UI_LOCAL | UIX-ESTADO-COMUM / API-AUT-014 quando necessário | Servidor retornar registros autorizados | N/A | N/A; reconcilia pela API-AUT-014 quando aplicável | AUTZ-RESPOSTA; sem auditoria de negócio local | TST-UI-02 |
| UI-03 | OPR-INTERFACE-ESTADO-COMUM | UI_LOCAL | UIX-ESTADO-COMUM / API-AUT-014 quando necessário | Servidor retornar coleção vazia sem filtro | N/A | N/A; reconcilia pela API-AUT-014 quando aplicável | AUTZ-RESPOSTA; sem auditoria de negócio local | TST-UI-03 |
| UI-04 | OPR-INTERFACE-ESTADO-COMUM | UI_LOCAL | UIX-ESTADO-COMUM / API-AUT-014 quando necessário | Servidor retornar zero para filtros | N/A | N/A; reconcilia pela API-AUT-014 quando aplicável | AUTZ-RESPOSTA; sem auditoria de negócio local | TST-UI-04 |
| UI-05 | OPR-INTERFACE-ESTADO-COMUM | UI_LOCAL | UIX-ESTADO-COMUM / API-AUT-014 quando necessário | Enviar formulário inválido | N/A | N/A; reconcilia pela API-AUT-014 quando aplicável | AUTZ-RESPOSTA; sem auditoria de negócio local | TST-UI-05 |
| UI-06 | OPR-INTERFACE-ESTADO-COMUM | UI_LOCAL | UIX-ESTADO-COMUM / API-AUT-014 quando necessário | Confirmar comando válido | N/A | N/A; reconcilia pela API-AUT-014 quando aplicável | AUTZ-RESPOSTA; sem auditoria de negócio local | TST-UI-06 |
| UI-07 | OPR-INTERFACE-ESTADO-COMUM | UI_LOCAL | UIX-ESTADO-COMUM / API-AUT-014 quando necessário | Transação concluir | N/A | N/A; reconcilia pela API-AUT-014 quando aplicável | AUTZ-RESPOSTA; sem auditoria de negócio local | TST-UI-07 |
| UI-08 | OPR-INTERFACE-ESTADO-COMUM | UI_LOCAL | UIX-ESTADO-COMUM / API-AUT-014 quando necessário | Falha técnica de leitura | N/A | N/A; reconcilia pela API-AUT-014 quando aplicável | AUTZ-RESPOSTA; sem auditoria de negócio local | TST-UI-08 |
| UI-08A | OPR-INTERFACE-ESTADO-COMUM | UI_LOCAL | UIX-ESTADO-COMUM / API-AUT-014 quando necessário | Falha técnica de mutação com ausência confirmada | N/A | N/A; reconcilia pela API-AUT-014 quando aplicável | AUTZ-RESPOSTA; sem auditoria de negócio local | TST-UI-08A |
| UI-09 | OPR-INTERFACE-ESTADO-COMUM | UI_LOCAL | UIX-ESTADO-COMUM / API-AUT-014 quando necessário | Versão ficar obsoleta | N/A | N/A; reconcilia pela API-AUT-014 quando aplicável | AUTZ-RESPOSTA; sem auditoria de negócio local | TST-UI-09 |
| UI-10 | OPR-INTERFACE-ESTADO-COMUM | UI_LOCAL | UIX-ESTADO-COMUM / API-AUT-014 quando necessário | Permissão ser negada ou revogada | N/A | N/A; reconcilia pela API-AUT-014 quando aplicável | AUTZ-RESPOSTA; sem auditoria de negócio local | TST-UI-10 |
| UI-10A | OPR-INTERFACE-ESTADO-COMUM | UI_LOCAL | UIX-ESTADO-COMUM / API-AUT-014 quando necessário | Concluir redirecionamento seguro | N/A | N/A; reconcilia pela API-AUT-014 quando aplicável | AUTZ-RESPOSTA; sem auditoria de negócio local | TST-UI-10A |
| UI-11 | OPR-INTERFACE-ESTADO-COMUM | UI_LOCAL | UIX-ESTADO-COMUM / API-AUT-014 quando necessário | Sessão expirar ou ser revogada | N/A | N/A; reconcilia pela API-AUT-014 quando aplicável | AUTZ-RESPOSTA; sem auditoria de negócio local | TST-UI-11 |
| UI-12 | OPR-INTERFACE-ESTADO-COMUM | UI_LOCAL | UIX-ESTADO-COMUM / API-AUT-014 quando necessário | Trocar empresa | N/A | N/A; reconcilia pela API-AUT-014 quando aplicável | AUTZ-RESPOSTA; sem auditoria de negócio local | TST-UI-12 |
| UI-13 | OPR-INTERFACE-ESTADO-COMUM | UI_LOCAL | UIX-ESTADO-COMUM / API-AUT-014 quando necessário | Abrir identificador de outro CNPJ | N/A | N/A; reconcilia pela API-AUT-014 quando aplicável | AUTZ-RESPOSTA; sem auditoria de negócio local | TST-UI-13 |
| UI-14 | OPR-INTERFACE-ESTADO-COMUM | UI_LOCAL | UIX-ESTADO-COMUM / API-AUT-014 quando necessário | Perder conexão após envio | N/A | N/A; reconcilia pela API-AUT-014 quando aplicável | AUTZ-RESPOSTA; sem auditoria de negócio local | TST-UI-14 |
| UI-15 | OPR-INTERFACE-ESTADO-COMUM | UI_LOCAL | UIX-ESTADO-COMUM / API-AUT-014 quando necessário | Sair, voltar ou trocar contexto | N/A | N/A; reconcilia pela API-AUT-014 quando aplicável | AUTZ-RESPOSTA; sem auditoria de negócio local | TST-UI-15 |
| UI-16 | OPR-INTERFACE-ESTADO-COMUM | UI_LOCAL | UIX-ESTADO-COMUM / API-AUT-014 quando necessário | Permanecer | N/A | N/A; reconcilia pela API-AUT-014 quando aplicável | AUTZ-RESPOSTA; sem auditoria de negócio local | TST-UI-16 |
| UI-17 | OPR-INTERFACE-ESTADO-COMUM | UI_LOCAL | UIX-ESTADO-COMUM / API-AUT-014 quando necessário | Descartar e continuar | N/A | N/A; reconcilia pela API-AUT-014 quando aplicável | AUTZ-RESPOSTA; sem auditoria de negócio local | TST-UI-17 |
| UI-18 | OPR-INTERFACE-ESTADO-COMUM | UI_LOCAL | UIX-ESTADO-COMUM / API-AUT-014 quando necessário | Encontrar transação concluída | N/A | N/A; reconcilia pela API-AUT-014 quando aplicável | AUTZ-RESPOSTA; sem auditoria de negócio local | TST-UI-18 |
| UI-19 | OPR-INTERFACE-ESTADO-COMUM | UI_LOCAL | UIX-ESTADO-COMUM / API-AUT-014 quando necessário | Provar ausência de transação concluída | N/A | N/A; reconcilia pela API-AUT-014 quando aplicável | AUTZ-RESPOSTA; sem auditoria de negócio local | TST-UI-19 |
| UI-20 | OPR-INTERFACE-ESTADO-COMUM | UI_LOCAL | UIX-ESTADO-COMUM / API-AUT-014 quando necessário | Atualizar a coleção | N/A | N/A; reconcilia pela API-AUT-014 quando aplicável | AUTZ-RESPOSTA; sem auditoria de negócio local | TST-UI-20 |
| UI-21 | OPR-INTERFACE-ESTADO-COMUM | UI_LOCAL | UIX-ESTADO-COMUM / API-AUT-014 quando necessário | Limpar ou alterar filtros | N/A | N/A; reconcilia pela API-AUT-014 quando aplicável | AUTZ-RESPOSTA; sem auditoria de negócio local | TST-UI-21 |
| UI-22 | OPR-INTERFACE-ESTADO-COMUM | UI_LOCAL | UIX-ESTADO-COMUM / API-AUT-014 quando necessário | Corrigir campo | N/A | N/A; reconcilia pela API-AUT-014 quando aplicável | AUTZ-RESPOSTA; sem auditoria de negócio local | TST-UI-22 |
| UI-23 | OPR-INTERFACE-ESTADO-COMUM | UI_LOCAL | UIX-ESTADO-COMUM / API-AUT-014 quando necessário | Tentar novamente | N/A | N/A; reconcilia pela API-AUT-014 quando aplicável | AUTZ-RESPOSTA; sem auditoria de negócio local | TST-UI-23 |
| UI-24 | OPR-INTERFACE-ESTADO-COMUM | UI_LOCAL | UIX-ESTADO-COMUM / API-AUT-014 quando necessário | Tentar novamente | N/A | N/A; reconcilia pela API-AUT-014 quando aplicável | AUTZ-RESPOSTA; sem auditoria de negócio local | TST-UI-24 |
| UI-25 | OPR-INTERFACE-ESTADO-COMUM | UI_LOCAL | UIX-ESTADO-COMUM / API-AUT-014 quando necessário | Recarregar versão atual | N/A | N/A; reconcilia pela API-AUT-014 quando aplicável | AUTZ-RESPOSTA; sem auditoria de negócio local | TST-UI-25 |
| UI-26 | OPR-INTERFACE-ESTADO-COMUM | UI_LOCAL | UIX-ESTADO-COMUM / API-AUT-014 quando necessário | Concluir retorno visual | N/A | N/A; reconcilia pela API-AUT-014 quando aplicável | AUTZ-RESPOSTA; sem auditoria de negócio local | TST-UI-26 |
| CON-01 | OPR-POLITICA-TRANSVERSAL | POLITICA | CONC-* / IDEM-* / AUTZ-* | Salvar com versão `n` ainda atual | perfil da operação | CONC-01; If-Match; sem sobrescrita | AUTZ-TRANSVERSAL; APIAUD conforme operação | TST-CON-01 |
| CON-02 | OPR-POLITICA-TRANSVERSAL | POLITICA | CONC-* / IDEM-* / AUTZ-* | Salvar rascunho baseado em `n` | perfil da operação | CONC-01; If-Match; sem sobrescrita | AUTZ-TRANSVERSAL; APIAUD conforme operação | TST-CON-02 |
| CON-03 | OPR-POLITICA-TRANSVERSAL | POLITICA | CONC-* / IDEM-* / AUTZ-* | Receber comando com chave nova | perfil da operação | IDEM-01; mesma intenção reapresenta resultado | AUTZ-TRANSVERSAL; APIAUD conforme operação | TST-CON-03 |
| CON-04 | OPR-POLITICA-TRANSVERSAL | POLITICA | CONC-* / IDEM-* / AUTZ-* | Repetir a mesma chave | perfil da operação | IDEM-01; mesma intenção reapresenta resultado | AUTZ-TRANSVERSAL; APIAUD conforme operação | TST-CON-04 |
| CON-05 | OPR-POLITICA-TRANSVERSAL | POLITICA | CONC-* / IDEM-* / AUTZ-* | Repetir a mesma chave | perfil da operação | IDEM-01; mesma intenção reapresenta resultado | AUTZ-TRANSVERSAL; APIAUD conforme operação | TST-CON-05 |
| CON-06 | OPR-POLITICA-TRANSVERSAL | POLITICA | CONC-* / IDEM-* / AUTZ-* | Duas criações simultâneas com chave natural igual | perfil da operação | CONC-02; unicidade; uma criação | AUTZ-TRANSVERSAL; APIAUD conforme operação | TST-CON-06 |
| CON-07 | OPR-POLITICA-TRANSVERSAL | POLITICA | CONC-* / IDEM-* / AUTZ-* | Auditoria obrigatória falhar | perfil da operação | rollback atômico; nenhuma confirmação parcial | AUTZ-TRANSVERSAL; APIAUD conforme operação | TST-CON-07 |
| CON-08 | OPR-POLITICA-TRANSVERSAL | POLITICA | CONC-* / IDEM-* / AUTZ-* | Permissão ou contexto mudar antes do commit | perfil da operação | revalidação antes do commit | AUTZ-TRANSVERSAL; APIAUD conforme operação | TST-CON-08 |
| CON-09 | OPR-POLITICA-TRANSVERSAL | POLITICA | CONC-* / IDEM-* / AUTZ-* | Executar rotina sem empresa exigida | perfil da operação | empresa obrigatória; falha fechada | AUTZ-TRANSVERSAL; APIAUD conforme operação | TST-CON-09 |
| CON-10 | OPR-POLITICA-TRANSVERSAL | POLITICA | CONC-* / IDEM-* / AUTZ-* | Um item perder elegibilidade antes do commit | perfil da operação | CONC-02; lote todos-ou-nenhum | AUTZ-TRANSVERSAL; APIAUD conforme operação | TST-CON-10 |

# 6. Resultado da cobertura

- IDs funcionais do Documento 17: **440**;
- transições efetivas: **436**;
- regras de mapeamento `ASO-R01` a `ASO-R04`: **4**;
- IDs no Documento 18A: **440**;
- IDs representados nesta matriz: **440**;
- duplicados: **0**;
- lacunas de operação, gatilho, realização ou teste: **0**;
- realizações exclusivamente locais de UI: **33**;
- projeções puras: **10**, sendo as quatro regras `ASO-R*`, as duas avaliações de vigência `B06-FIN-07/08` e quatro viradas temporais derivadas de vínculo/contrato (`B04-VIN-06`, `B05-CON-01/05/06A`);
- regras transversais `CON-*`: **10**;
- endpoints artificiais criados apenas para representar estado: **0**.

# 7. Regras metodológicas

- A coluna “Operação primária” declara famílias semânticas `OPR-*`. Esses valores não são endpoints e não precisam coincidir com um ID executável; o manifesto deverá expandir cada família em operações técnicas exatas e manter a associação reversa.
- A coluna “Contrato/realização” aponta contrato exato, família terminada em `-*`, tarefa, estado local, política ou operação projetora. Quando houver família, o manifesto executável detalhará o membro exato usado por cada caso de teste.
- `HTTP_INTERNO` não significa uma rota oculta; significa efeito automático do caso de uso, como criar auditoria, revogar sessão ou materializar uma versão na mesma transação.
- `JOB_TEMPORAL` usa o relógio do servidor, não aceita autoridade temporal do navegador e não renova sessão. Ele se aplica quando a passagem do tempo demanda execução materializada; cálculo puramente derivado usa `PROJECAO`.
- `JOB_WORKER` usa uma empresa por tarefa/transação e a classe de autoridade do Documento 20.
- `UI_LOCAL` não cria linha de negócio; quando precisa reconciliar uma resposta, chama o contrato idempotente já tipado.
- `UIX-ESTADO-COMUM` é o membro declarado nesta matriz da família `UIX-*` do Documento 20 e identifica somente a máquina de estados visual comum, sem contrato de rede próprio.
- `PROJECAO` não aceita `IDEM-01` nem concorrência de escrita: lê fonte autorizada em `TX-001` ou aplica regra pura e somente a revelação sensível pode produzir `APIAUD-*`.
- `POLITICA` é provada transversalmente em todas as operações aplicáveis e não recebe endpoint próprio.
- Uma operação composta registra um evento de auditoria por transição efetiva, todos ligados pela mesma correlação.
- O Documento 22 pode criar vários casos para um único `TST-<ID>`; o identificador é a âncora, não limite de quantidade.

---

**Situação final desta versão:** Documento 20A aprovado integralmente pelo usuário com o Documento 20 em 22/08/2026.  
**Continuidade na data da aprovação:** pacote 23/23A–23D aprovado; preparar o repositório e iniciar a `ETP-00`.  
**Checkpoint posterior:** baseline em implementação controlada conforme `docs/ETP-00.md`; produção permanece não autorizada.
