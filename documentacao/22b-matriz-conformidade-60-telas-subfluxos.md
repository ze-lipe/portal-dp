# Documento 22B

## Matriz de Conformidade das 60 Telas e Subfluxos

> **Status:** aprovado integralmente pelo usuário com os Documentos 22 e 22A em 22 de agosto de 2026.  
> **Data-base:** 22 de agosto de 2026.  
> **Inventário visual:** Documento 16 aprovado.  
> **Estratégia:** Documento 22 aprovado.

---

# 1. Finalidade

Esta matriz impede que a cobertura dos 440 IDs funcionais — 436 transições e quatro regras de projeção `ASO-R*` — seja confundida com cobertura integral da interface. Cada uma das **60 telas ou subfluxos aprovados** recebe um caso-raiz visual próprio `QAT-UI-*`, os pacotes comuns, massa, etapa, evidência, homologadores e gate.

Os `QAT-UI-*` são casos de qualidade e não entram na coleção das 440 âncoras `TST-*`.

---

# 2. Pacote obrigatório por tela

Cada linha executa, conforme aplicabilidade:

1. carregamento sem conteúdo residual;
2. vazio sem filtro;
3. filtro sem resultado;
4. validação com preservação apenas de valor autorizado;
5. falha de leitura sem reenvio de mutação;
6. processamento com bloqueio de duplo clique;
7. sucesso somente depois do commit e releitura;
8. falha de mutação com estado reconciliado;
9. resposta incerta sem repetição cega;
10. conflito com recarga e revisão;
11. sessão expirada ou revogada com limpeza;
12. contexto desatualizado com limpeza;
13. rascunho que não atravessa sessão, empresa, entidade ou permissão;
14. quatro estados de campo quando houver dado protegido;
15. teclado, foco, rótulos, contraste, mensagens e estado não dependente de cor;
16. zoom/reflow e conteúdo dinâmico sem perda da ação principal;
17. autorização revalidada pela API; esconder controle nunca é o único mecanismo;
18. ausência de segredo e dado proibido no DOM, URL, armazenamento local, captura e telemetria.

Na ETP-00, os 28 estados `UI-*` recebem uma prova-base em uma fatia sintética. Esta matriz reaplica o contrato a cada tela quando ela passa a existir e fecha as 60 na ETP-11. A etapa da matriz indica a **primeira prova visual útil**, não declara a tela inteira definitivamente concluída: toda integração acrescentada em etapa posterior reabre os casos afetados.

---

# 3. Contrato automático

O gate deverá provar:

- conjunto de IDs visuais igual ao inventário do Documento 16;
- total igual a 60;
- duplicados e lacunas iguais a zero;
- um `QAT-UI-<ID>` por tela;
- etapa, pacotes, massa, níveis, evidências, homologação e gate não vazios;
- `PAC-UI-01` e `PAC-ACE-01` presentes em todas as linhas;
- qualquer caso não aplicável com justificativa;
- regressão de todas as telas existentes a cada marco posterior.

---

# 4. Matriz

| Caso visual | ID | Tela/subfluxo | Escopo aprovado | Primeira prova visual | Pacotes | Massas | Níveis | Evidências | Homologação | Gate |
|---|---|---|---|---|---|---|---|---|---|---|
| QAT-UI-A01 | A01 | Login | Pública, sem dados empresariais | ETP-01 | PAC-UI-01/PAC-ACE-01/PAC-SES-01/PAC-AUT-01 | MASS-BASE/MASS-AUT/MASS-TEN | NIV-COMP/NIV-E2E/NIV-SEC/NIV-HML | EV-UI/EV-ACE/EV-HTTP/EV-SEG | HML-ENG/SEG/PROD | GAT-03 |
| QAT-UI-A02 | A02 | Primeiro acesso | Autenticação parcial | ETP-01 | PAC-UI-01/PAC-ACE-01/PAC-SES-01/PAC-AUT-01 | MASS-BASE/MASS-AUT/MASS-TEN | NIV-COMP/NIV-E2E/NIV-SEC/NIV-HML | EV-UI/EV-ACE/EV-HTTP/EV-SEG | HML-ENG/SEG/PROD | GAT-03 |
| QAT-UI-A03 | A03 | Configuração inicial do TOTP | Master em primeiro acesso | ETP-01 | PAC-UI-01/PAC-ACE-01/PAC-SES-01/PAC-AUT-01 | MASS-BASE/MASS-AUT/MASS-TEN | NIV-COMP/NIV-E2E/NIV-SEC/NIV-HML | EV-UI/EV-ACE/EV-HTTP/EV-SEG | HML-ENG/SEG/PROD | GAT-03 |
| QAT-UI-A04 | A04 | Validação TOTP | Master autenticado parcialmente | ETP-01 | PAC-UI-01/PAC-ACE-01/PAC-SES-01/PAC-AUT-01 | MASS-BASE/MASS-AUT/MASS-TEN | NIV-COMP/NIV-E2E/NIV-SEC/NIV-HML | EV-UI/EV-ACE/EV-HTTP/EV-SEG | HML-ENG/SEG/PROD | GAT-03 |
| QAT-UI-A05 | A05 | Solicitar recuperação | Pública, resposta neutra | ETP-01 | PAC-UI-01/PAC-ACE-01/PAC-SES-01/PAC-AUT-01 | MASS-BASE/MASS-AUT/MASS-TEN | NIV-COMP/NIV-E2E/NIV-SEC/NIV-HML | EV-UI/EV-ACE/EV-HTTP/EV-SEG | HML-ENG/SEG/PROD | GAT-03 |
| QAT-UI-A06 | A06 | Redefinir senha | Token único de 30 minutos | ETP-01 | PAC-UI-01/PAC-ACE-01/PAC-SES-01/PAC-AUT-01 | MASS-BASE/MASS-AUT/MASS-TEN | NIV-COMP/NIV-E2E/NIV-SEC/NIV-HML | EV-UI/EV-ACE/EV-HTTP/EV-SEG | HML-ENG/SEG/PROD | GAT-03 |
| QAT-UI-A07 | A07 | Seleção de empresa | Usuário autenticado | ETP-02 | PAC-UI-01/PAC-ACE-01/PAC-SES-01/PAC-EMP-01 | MASS-BASE/MASS-AUT/MASS-TEN | NIV-COMP/NIV-E2E/NIV-SEC/NIV-HML | EV-UI/EV-ACE/EV-HTTP/EV-SEG | HML-ENG/SEG/PROD | GAT-02 |
| QAT-UI-A08 | A08 | Cadastro de empresa | Permissão global específica | ETP-02 | PAC-UI-01/PAC-ACE-01/PAC-SES-01/PAC-EMP-01 | MASS-BASE/MASS-AUT/MASS-TEN | NIV-COMP/NIV-E2E/NIV-SEC/NIV-HML | EV-UI/EV-ACE/EV-HTTP/EV-SEG | HML-ENG/SEG/PROD | GAT-02 |
| QAT-UI-A09 | A09 | Minha Conta | Próprio usuário | ETP-01 | PAC-UI-01/PAC-ACE-01/PAC-SES-01/PAC-EMP-01/PAC-AUT-01 | MASS-BASE/MASS-AUT/MASS-TEN | NIV-COMP/NIV-E2E/NIV-SEC/NIV-HML | EV-UI/EV-ACE/EV-HTTP/EV-SEG | HML-ENG/SEG/PROD | GAT-03 |
| QAT-UI-A10 | A10 | Configurações da empresa | Empresa ativa e permissão própria | ETP-02 | PAC-UI-01/PAC-ACE-01/PAC-SES-01/PAC-EMP-01 | MASS-BASE/MASS-AUT/MASS-TEN | NIV-COMP/NIV-E2E/NIV-SEC/NIV-HML | EV-UI/EV-ACE/EV-HTTP/EV-SEG | HML-ENG/SEG/PROD | GAT-02 |
| QAT-UI-P01 | P01 | Painel da empresa | Resumo empresarial autorizado | ETP-10 | PAC-UI-01/PAC-ACE-01/PAC-SES-01/PAC-EMP-01 | MASS-BASE/MASS-TEN | NIV-COMP/NIV-E2E/NIV-SEC/NIV-HML | EV-UI/EV-ACE/EV-HTTP/EV-SEG | HML-DP/PROD | GAT-01–09 |
| QAT-UI-C01 | C01 | Lista de colaboradores | Empregados e MEIs sem misturar regras | ETP-04A | PAC-UI-01/PAC-ACE-01/PAC-SES-01/PAC-EMP-01/PAC-AUT-01/PAC-CAM-01 | MASS-CAD/MASS-FIN/MASS-ASO/MASS-DOC/MASS-FLD/MASS-TEN | NIV-COMP/NIV-E2E/NIV-SEC/NIV-HML | EV-UI/EV-ACE/EV-HTTP/EV-SEG | HML-DP/CTB/PROD | GAT-05 |
| QAT-UI-C02 | C02 | Novo empregado ou recontratação | Fluxo guiado por CPF | ETP-04A | PAC-UI-01/PAC-ACE-01/PAC-SES-01/PAC-EMP-01/PAC-AUT-01/PAC-CAM-01 | MASS-CAD/MASS-FIN/MASS-ASO/MASS-DOC/MASS-FLD/MASS-TEN | NIV-COMP/NIV-E2E/NIV-SEC/NIV-HML | EV-UI/EV-ACE/EV-HTTP/EV-SEG | HML-DP/CTB/PROD | GAT-05 |
| QAT-UI-C03 | C03 | Visão geral do empregado | Fonte contextual do vínculo | ETP-04A | PAC-UI-01/PAC-ACE-01/PAC-SES-01/PAC-EMP-01/PAC-AUT-01/PAC-CAM-01 | MASS-CAD/MASS-FIN/MASS-ASO/MASS-DOC/MASS-FLD/MASS-TEN | NIV-COMP/NIV-E2E/NIV-SEC/NIV-HML | EV-UI/EV-ACE/EV-HTTP/EV-SEG | HML-DP/CTB/PROD | GAT-05 |
| QAT-UI-C04 | C04 | Condições financeiras | Vigências financeiras do empregado | ETP-04A | PAC-UI-01/PAC-ACE-01/PAC-SES-01/PAC-EMP-01/PAC-AUT-01/PAC-CAM-01 | MASS-CAD/MASS-FIN/MASS-ASO/MASS-DOC/MASS-FLD/MASS-TEN | NIV-COMP/NIV-E2E/NIV-SEC/NIV-HML | EV-UI/EV-ACE/EV-HTTP/EV-SEG | HML-DP/CTB/PROD | GAT-05 |
| QAT-UI-C05 | C05 | Competências e pagamentos do empregado | Projeção por participante | ETP-05 | PAC-UI-01/PAC-ACE-01/PAC-SES-01/PAC-EMP-01/PAC-AUT-01/PAC-CAM-01 | MASS-CAD/MASS-FIN/MASS-ASO/MASS-DOC/MASS-FLD/MASS-TEN | NIV-COMP/NIV-E2E/NIV-SEC/NIV-HML | EV-UI/EV-ACE/EV-HTTP/EV-SEG | HML-DP/CTB/PROD | GAT-06 |
| QAT-UI-C06 | C06 | ASOs do empregado | Projeção contextual de ASO | ETP-08A | PAC-UI-01/PAC-ACE-01/PAC-SES-01/PAC-EMP-01/PAC-AUT-01/PAC-CAM-01 | MASS-CAD/MASS-FIN/MASS-ASO/MASS-DOC/MASS-FLD/MASS-TEN | NIV-COMP/NIV-E2E/NIV-SEC/NIV-HML | EV-UI/EV-ACE/EV-HTTP/EV-SEG | HML-DP/CTB/PROD | GAT-08 |
| QAT-UI-C07 | C07 | Recibos do empregado | Projeção documental | ETP-06 | PAC-UI-01/PAC-ACE-01/PAC-SES-01/PAC-EMP-01/PAC-AUT-01/PAC-CAM-01 | MASS-CAD/MASS-FIN/MASS-ASO/MASS-DOC/MASS-FLD/MASS-TEN | NIV-COMP/NIV-E2E/NIV-SEC/NIV-HML | EV-UI/EV-ACE/EV-HTTP/EV-SEG | HML-DP/CTB/PROD | GAT-07 |
| QAT-UI-C08 | C08 | Histórico do empregado | Projeção da auditoria única | ETP-10 | PAC-UI-01/PAC-ACE-01/PAC-SES-01/PAC-EMP-01/PAC-AUT-01/PAC-CAM-01 | MASS-CAD/MASS-FIN/MASS-ASO/MASS-DOC/MASS-FLD/MASS-TEN | NIV-COMP/NIV-E2E/NIV-SEC/NIV-HML | EV-UI/EV-ACE/EV-HTTP/EV-SEG | HML-DP/CTB/PROD | GAT-01–09 |
| QAT-UI-M01 | M01 | Novo MEI e contrato | Fluxo guiado por CNPJ | ETP-04B | PAC-UI-01/PAC-ACE-01/PAC-SES-01/PAC-EMP-01/PAC-AUT-01/PAC-CAM-01 | MASS-MEI/MASS-FIN/MASS-DOC/MASS-FLD/MASS-TEN | NIV-COMP/NIV-E2E/NIV-SEC/NIV-HML | EV-UI/EV-ACE/EV-HTTP/EV-SEG | HML-DP/CTB/PROD | GAT-05 |
| QAT-UI-M02 | M02 | Visão geral do MEI | Cadastro e contrato atual | ETP-04B | PAC-UI-01/PAC-ACE-01/PAC-SES-01/PAC-EMP-01/PAC-AUT-01/PAC-CAM-01 | MASS-MEI/MASS-FIN/MASS-DOC/MASS-FLD/MASS-TEN | NIV-COMP/NIV-E2E/NIV-SEC/NIV-HML | EV-UI/EV-ACE/EV-HTTP/EV-SEG | HML-DP/CTB/PROD | GAT-05 |
| QAT-UI-M03 | M03 | Contrato, vigências e renovação | Fonte contratual | ETP-04B | PAC-UI-01/PAC-ACE-01/PAC-SES-01/PAC-EMP-01/PAC-AUT-01/PAC-CAM-01 | MASS-MEI/MASS-FIN/MASS-DOC/MASS-FLD/MASS-TEN | NIV-COMP/NIV-E2E/NIV-SEC/NIV-HML | EV-UI/EV-ACE/EV-HTTP/EV-SEG | HML-DP/CTB/PROD | GAT-05 |
| QAT-UI-M04 | M04 | Competências e pagamentos do MEI | Projeção financeira | ETP-05 | PAC-UI-01/PAC-ACE-01/PAC-SES-01/PAC-EMP-01/PAC-AUT-01/PAC-CAM-01 | MASS-MEI/MASS-FIN/MASS-DOC/MASS-FLD/MASS-TEN | NIV-COMP/NIV-E2E/NIV-SEC/NIV-HML | EV-UI/EV-ACE/EV-HTTP/EV-SEG | HML-DP/CTB/PROD | GAT-06 |
| QAT-UI-M05 | M05 | Recibos do MEI | Projeção documental | ETP-06 | PAC-UI-01/PAC-ACE-01/PAC-SES-01/PAC-EMP-01/PAC-AUT-01/PAC-CAM-01 | MASS-MEI/MASS-FIN/MASS-DOC/MASS-FLD/MASS-TEN | NIV-COMP/NIV-E2E/NIV-SEC/NIV-HML | EV-UI/EV-ACE/EV-HTTP/EV-SEG | HML-DP/CTB/PROD | GAT-07 |
| QAT-UI-M06 | M06 | Histórico do MEI | Projeção da auditoria única | ETP-10 | PAC-UI-01/PAC-ACE-01/PAC-SES-01/PAC-EMP-01/PAC-AUT-01/PAC-CAM-01 | MASS-MEI/MASS-FIN/MASS-DOC/MASS-FLD/MASS-TEN | NIV-COMP/NIV-E2E/NIV-SEC/NIV-HML | EV-UI/EV-ACE/EV-HTTP/EV-SEG | HML-DP/CTB/PROD | GAT-01–09 |
| QAT-UI-K01 | K01 | Lista de competências | Pesquisa e seleção ampliada | ETP-05 | PAC-UI-01/PAC-ACE-01/PAC-SES-01/PAC-EMP-01/PAC-AUT-01/PAC-CAM-01 | MASS-FIN/MASS-D30/MASS-DOC/MASS-FLD/MASS-TEN | NIV-COMP/NIV-E2E/NIV-SEC/NIV-HML | EV-UI/EV-ACE/EV-HTTP/EV-SEG | HML-DP/CTB/PROD | GAT-06 |
| QAT-UI-K02 | K02 | Nova competência | Criação mensal | ETP-05 | PAC-UI-01/PAC-ACE-01/PAC-SES-01/PAC-EMP-01/PAC-AUT-01/PAC-CAM-01 | MASS-FIN/MASS-D30/MASS-DOC/MASS-FLD/MASS-TEN | NIV-COMP/NIV-E2E/NIV-SEC/NIV-HML | EV-UI/EV-ACE/EV-HTTP/EV-SEG | HML-DP/CTB/PROD | GAT-06 |
| QAT-UI-K03 | K03 | Resumo e checklist | Autoridade para fechamento | ETP-05 | PAC-UI-01/PAC-ACE-01/PAC-SES-01/PAC-EMP-01/PAC-AUT-01/PAC-CAM-01 | MASS-FIN/MASS-D30/MASS-DOC/MASS-FLD/MASS-TEN | NIV-COMP/NIV-E2E/NIV-SEC/NIV-HML | EV-UI/EV-ACE/EV-HTTP/EV-SEG | HML-DP/CTB/PROD | GAT-06 |
| QAT-UI-K04 | K04 | Participantes e cálculos | Visão coletiva | ETP-05 | PAC-UI-01/PAC-ACE-01/PAC-SES-01/PAC-EMP-01/PAC-AUT-01/PAC-CAM-01 | MASS-FIN/MASS-D30/MASS-DOC/MASS-FLD/MASS-TEN | NIV-COMP/NIV-E2E/NIV-SEC/NIV-HML | EV-UI/EV-ACE/EV-HTTP/EV-SEG | HML-DP/CTB/PROD | GAT-06 |
| QAT-UI-K05 | K05 | Detalhe financeiro do participante | Memória e lançamentos mensais | ETP-05 | PAC-UI-01/PAC-ACE-01/PAC-SES-01/PAC-EMP-01/PAC-AUT-01/PAC-CAM-01 | MASS-FIN/MASS-D30/MASS-DOC/MASS-FLD/MASS-TEN | NIV-COMP/NIV-E2E/NIV-SEC/NIV-HML | EV-UI/EV-ACE/EV-HTTP/EV-SEG | HML-DP/CTB/PROD | GAT-06 |
| QAT-UI-K06 | K06 | Líquidos do contador | Digitação individual rápida | ETP-05 | PAC-UI-01/PAC-ACE-01/PAC-SES-01/PAC-EMP-01/PAC-AUT-01/PAC-CAM-01 | MASS-FIN/MASS-D30/MASS-DOC/MASS-FLD/MASS-TEN | NIV-COMP/NIV-E2E/NIV-SEC/NIV-HML | EV-UI/EV-ACE/EV-HTTP/EV-SEG | HML-DP/CTB/PROD | GAT-06 |
| QAT-UI-K07 | K07 | Saldo inicial de implantação | Somente competência de corte | ETP-05 | PAC-UI-01/PAC-ACE-01/PAC-SES-01/PAC-EMP-01/PAC-AUT-01/PAC-CAM-01 | MASS-FIN/MASS-D30/MASS-DOC/MASS-FLD/MASS-TEN | NIV-COMP/NIV-E2E/NIV-SEC/NIV-HML | EV-UI/EV-ACE/EV-HTTP/EV-SEG | HML-DP/CTB/PROD | GAT-06 |
| QAT-UI-F01 | F01 | Abas de adiantamento e final | Cartões por grupo e evento | ETP-05 | PAC-UI-01/PAC-ACE-01/PAC-SES-01/PAC-EMP-01/PAC-AUT-01/PAC-CAM-01 | MASS-FIN/MASS-D30/MASS-DOC/MASS-FLD/MASS-TEN | NIV-COMP/NIV-E2E/NIV-SEC/NIV-HML | EV-UI/EV-ACE/EV-HTTP/EV-SEG | HML-DP/CTB/PROD | GAT-06 |
| QAT-UI-F02 | F02 | Participantes do grupo | Conferência individual | ETP-05 | PAC-UI-01/PAC-ACE-01/PAC-SES-01/PAC-EMP-01/PAC-AUT-01/PAC-CAM-01 | MASS-FIN/MASS-D30/MASS-DOC/MASS-FLD/MASS-TEN | NIV-COMP/NIV-E2E/NIV-SEC/NIV-HML | EV-UI/EV-ACE/EV-HTTP/EV-SEG | HML-DP/CTB/PROD | GAT-06 |
| QAT-UI-F03 | F03 | Confirmação em lote | Mesmo grupo e evento | ETP-07 | PAC-UI-01/PAC-ACE-01/PAC-SES-01/PAC-EMP-01/PAC-AUT-01/PAC-CAM-01 | MASS-FIN/MASS-D30/MASS-DOC/MASS-FLD/MASS-TEN | NIV-COMP/NIV-E2E/NIV-SEC/NIV-HML | EV-UI/EV-ACE/EV-HTTP/EV-SEG | HML-DP/CTB/PROD | GAT-06/07 |
| QAT-UI-F04 | F04 | Correção financeira guiada | Correção não destrutiva | ETP-07 | PAC-UI-01/PAC-ACE-01/PAC-SES-01/PAC-EMP-01/PAC-AUT-01/PAC-CAM-01 | MASS-FIN/MASS-D30/MASS-DOC/MASS-FLD/MASS-TEN | NIV-COMP/NIV-E2E/NIV-SEC/NIV-HML | EV-UI/EV-ACE/EV-HTTP/EV-SEG | HML-DP/CTB/PROD | GAT-06/07 |
| QAT-UI-F05 | F05 | Ajustes financeiros | Positivos e absorvidos | ETP-07 | PAC-UI-01/PAC-ACE-01/PAC-SES-01/PAC-EMP-01/PAC-AUT-01/PAC-CAM-01 | MASS-FIN/MASS-D30/MASS-DOC/MASS-FLD/MASS-TEN | NIV-COMP/NIV-E2E/NIV-SEC/NIV-HML | EV-UI/EV-ACE/EV-HTTP/EV-SEG | HML-DP/CTB/PROD | GAT-06/07 |
| QAT-UI-D01 | D01 | Visão filtrada de desligamentos | Dentro de Colaboradores | ETP-09 | PAC-UI-01/PAC-ACE-01/PAC-SES-01/PAC-EMP-01/PAC-AUT-01/PAC-CAM-01 | MASS-CAD/MASS-FIN/MASS-D30/MASS-ASO/MASS-FLD/MASS-TEN | NIV-COMP/NIV-E2E/NIV-SEC/NIV-HML | EV-UI/EV-ACE/EV-HTTP/EV-SEG | HML-DP/CTB/PROD | GAT-06/07/08 |
| QAT-UI-D02 | D02 | Registrar ou programar desligamento | Cadastro da saída | ETP-09 | PAC-UI-01/PAC-ACE-01/PAC-SES-01/PAC-EMP-01/PAC-AUT-01/PAC-CAM-01 | MASS-CAD/MASS-FIN/MASS-D30/MASS-ASO/MASS-FLD/MASS-TEN | NIV-COMP/NIV-E2E/NIV-SEC/NIV-HML | EV-UI/EV-ACE/EV-HTTP/EV-SEG | HML-DP/CTB/PROD | GAT-06/07/08 |
| QAT-UI-D03 | D03 | Desligamento e acerto | Fonte única em dois contextos | ETP-09 | PAC-UI-01/PAC-ACE-01/PAC-SES-01/PAC-EMP-01/PAC-AUT-01/PAC-CAM-01 | MASS-CAD/MASS-FIN/MASS-D30/MASS-ASO/MASS-FLD/MASS-TEN | NIV-COMP/NIV-E2E/NIV-SEC/NIV-HML | EV-UI/EV-ACE/EV-HTTP/EV-SEG | HML-DP/CTB/PROD | GAT-06/07/08 |
| QAT-UI-R01 | R01 | Recibos da competência | Lista e filtros | ETP-06 | PAC-UI-01/PAC-ACE-01/PAC-SES-01/PAC-EMP-01/PAC-AUT-01/PAC-CAM-01 | MASS-FIN/MASS-DOC/MASS-FLD/MASS-TEN | NIV-COMP/NIV-E2E/NIV-SEC/NIV-HML | EV-UI/EV-ACE/EV-HTTP/EV-SEG | HML-DP/CTB/PROD | GAT-07 |
| QAT-UI-R02 | R02 | Detalhe e pré-visualização | Documento e versões | ETP-06 | PAC-UI-01/PAC-ACE-01/PAC-SES-01/PAC-EMP-01/PAC-AUT-01/PAC-CAM-01 | MASS-FIN/MASS-DOC/MASS-FLD/MASS-TEN | NIV-COMP/NIV-E2E/NIV-SEC/NIV-HML | EV-UI/EV-ACE/EV-HTTP/EV-SEG | HML-DP/CTB/PROD | GAT-07 |
| QAT-UI-R03 | R03 | Impressão e download em lote | Definitivos elegíveis | ETP-07 | PAC-UI-01/PAC-ACE-01/PAC-SES-01/PAC-EMP-01/PAC-AUT-01/PAC-CAM-01 | MASS-FIN/MASS-DOC/MASS-FLD/MASS-TEN | NIV-COMP/NIV-E2E/NIV-SEC/NIV-HML | EV-UI/EV-ACE/EV-HTTP/EV-SEG | HML-DP/CTB/PROD | GAT-06/07 |
| QAT-UI-S01 | S01 | Central de ASO | Pendências e realizados | ETP-08A | PAC-UI-01/PAC-ACE-01/PAC-SES-01/PAC-EMP-01/PAC-AUT-01/PAC-CAM-01 | MASS-CAD/MASS-ASO/MASS-FLD/MASS-TEN | NIV-COMP/NIV-E2E/NIV-SEC/NIV-HML | EV-UI/EV-ACE/EV-HTTP/EV-SEG | HML-DP/JUR/SEG | GAT-08 |
| QAT-UI-S02 | S02 | Acompanhamento | Estado operacional sem resultado inventado | ETP-08A | PAC-UI-01/PAC-ACE-01/PAC-SES-01/PAC-EMP-01/PAC-AUT-01/PAC-CAM-01 | MASS-CAD/MASS-ASO/MASS-FLD/MASS-TEN | NIV-COMP/NIV-E2E/NIV-SEC/NIV-HML | EV-UI/EV-ACE/EV-HTTP/EV-SEG | HML-DP/JUR/SEG | GAT-08 |
| QAT-UI-S03 | S03 | Registrar exame realizado | Cadastro ou retificação | ETP-08A | PAC-UI-01/PAC-ACE-01/PAC-SES-01/PAC-EMP-01/PAC-AUT-01/PAC-CAM-01 | MASS-CAD/MASS-ASO/MASS-FLD/MASS-TEN | NIV-COMP/NIV-E2E/NIV-SEC/NIV-HML | EV-UI/EV-ACE/EV-HTTP/EV-SEG | HML-DP/JUR/SEG | GAT-08 |
| QAT-UI-S04 | S04 | Detalhe e versões | Snapshot e resultado sensível | ETP-08A | PAC-UI-01/PAC-ACE-01/PAC-SES-01/PAC-EMP-01/PAC-AUT-01/PAC-CAM-01 | MASS-CAD/MASS-ASO/MASS-FLD/MASS-TEN | NIV-COMP/NIV-E2E/NIV-SEC/NIV-HML | EV-UI/EV-ACE/EV-HTTP/EV-SEG | HML-DP/JUR/SEG | GAT-08 |
| QAT-UI-S05 | S05 | Catálogo de clínicas | Escopo global | ETP-08A | PAC-UI-01/PAC-ACE-01/PAC-SES-01/PAC-EMP-01/PAC-AUT-01/PAC-CAM-01 | MASS-CAD/MASS-ASO/MASS-FLD/MASS-TEN | NIV-COMP/NIV-E2E/NIV-SEC/NIV-HML | EV-UI/EV-ACE/EV-HTTP/EV-SEG | HML-DP/JUR/SEG | GAT-08 |
| QAT-UI-S06 | S06 | Cadastro e detalhe da clínica | Versão global | ETP-08A | PAC-UI-01/PAC-ACE-01/PAC-SES-01/PAC-EMP-01/PAC-AUT-01/PAC-CAM-01 | MASS-CAD/MASS-ASO/MASS-FLD/MASS-TEN | NIV-COMP/NIV-E2E/NIV-SEC/NIV-HML | EV-UI/EV-ACE/EV-HTTP/EV-SEG | HML-DP/JUR/SEG | GAT-08 |
| QAT-UI-N01 | N01 | Central de notificações | Empresa ativa e origem autorizada | ETP-10 | PAC-UI-01/PAC-ACE-01/PAC-SES-01/PAC-EMP-01/PAC-AUT-01/PAC-CAM-01 | MASS-BASE/MASS-ASO/MASS-FLD/MASS-TEN | NIV-COMP/NIV-E2E/NIV-SEC/NIV-HML | EV-UI/EV-ACE/EV-HTTP/EV-SEG | HML-DP/PROD | GAT-01–09 |
| QAT-UI-H01 | H01 | Auditoria empresarial | Uma empresa | ETP-04C | PAC-UI-01/PAC-ACE-01/PAC-SES-01/PAC-EMP-01/PAC-AUT-01/PAC-CAM-01 | MASS-BASE/MASS-TEN/MASS-INC/MASS-FLD | NIV-COMP/NIV-E2E/NIV-SEC/NIV-HML | EV-UI/EV-ACE/EV-HTTP/EV-SEG | HML-SEG/JUR/PROD | GAT-02/08 |
| QAT-UI-H02 | H02 | Auditoria global | Somente master | ETP-10 | PAC-UI-01/PAC-ACE-01/PAC-SES-01/PAC-AUT-01/PAC-CAM-01 | MASS-BASE/MASS-TEN/MASS-INC/MASS-FLD | NIV-COMP/NIV-E2E/NIV-SEC/NIV-HML | EV-UI/EV-ACE/EV-HTTP/EV-SEG | HML-SEG/JUR/PROD | GAT-01–09 |
| QAT-UI-H03 | H03 | Detalhe imutável do evento | Somente leitura e redação por campo | ETP-04C | PAC-UI-01/PAC-ACE-01/PAC-SES-01/PAC-AUT-01/PAC-CAM-01 | MASS-BASE/MASS-TEN/MASS-INC/MASS-FLD | NIV-COMP/NIV-E2E/NIV-SEC/NIV-HML | EV-UI/EV-ACE/EV-HTTP/EV-SEG | HML-SEG/JUR/PROD | GAT-02/08 |
| QAT-UI-U01 | U01 | Usuários | Administração global master-only | ETP-03 | PAC-UI-01/PAC-ACE-01/PAC-SES-01/PAC-AUT-01/PAC-CAM-01 | MASS-BASE/MASS-AUT/MASS-FLD | NIV-COMP/NIV-E2E/NIV-SEC/NIV-HML | EV-UI/EV-ACE/EV-HTTP/EV-SEG | HML-ENG/SEG/PROD | GAT-04 |
| QAT-UI-U02 | U02 | Detalhe do usuário | Identidade, acesso e segurança | ETP-03 | PAC-UI-01/PAC-ACE-01/PAC-SES-01/PAC-AUT-01/PAC-CAM-01 | MASS-BASE/MASS-AUT/MASS-FLD | NIV-COMP/NIV-E2E/NIV-SEC/NIV-HML | EV-UI/EV-ACE/EV-HTTP/EV-SEG | HML-ENG/SEG/PROD | GAT-04 |
| QAT-UI-U03 | U03 | Perfis empresariais | Exatamente uma empresa | ETP-03 | PAC-UI-01/PAC-ACE-01/PAC-SES-01/PAC-AUT-01/PAC-EMP-01/PAC-CAM-01 | MASS-BASE/MASS-AUT/MASS-FLD/MASS-TEN | NIV-COMP/NIV-E2E/NIV-SEC/NIV-HML | EV-UI/EV-ACE/EV-HTTP/EV-BD/EV-SEG | HML-ENG/SEG/PROD | GAT-04 |
| QAT-UI-U04 | U04 | Matriz de permissões | Módulo, tela, ação e campo | ETP-03 | PAC-UI-01/PAC-ACE-01/PAC-SES-01/PAC-AUT-01/PAC-CAM-01 | MASS-BASE/MASS-AUT/MASS-FLD | NIV-COMP/NIV-E2E/NIV-SEC/NIV-HML | EV-UI/EV-ACE/EV-HTTP/EV-SEG | HML-ENG/SEG/PROD | GAT-04 |
| QAT-UI-U05 | U05 | Perfis globais e modelos | Escopo global | ETP-03 | PAC-UI-01/PAC-ACE-01/PAC-SES-01/PAC-AUT-01/PAC-CAM-01 | MASS-BASE/MASS-AUT/MASS-FLD | NIV-COMP/NIV-E2E/NIV-SEC/NIV-HML | EV-UI/EV-ACE/EV-HTTP/EV-SEG | HML-ENG/SEG/PROD | GAT-04 |
| QAT-UI-I01 | I01 | Central e registro de incidente | Permissões separadas | ETP-08B | PAC-UI-01/PAC-ACE-01/PAC-SES-01/PAC-AUT-01/PAC-APP-01/PAC-SEN-01 | MASS-AUT/MASS-INC | NIV-COMP/NIV-E2E/NIV-SEC/NIV-HML | EV-UI/EV-ACE/EV-HTTP/EV-SEG | HML-SEG/JUR/PROD | GAT-04/09 |
| QAT-UI-I02 | I02 | Acompanhamento do incidente | Linha do tempo imutável | ETP-08B | PAC-UI-01/PAC-ACE-01/PAC-SES-01/PAC-AUT-01/PAC-APP-01/PAC-SEN-01 | MASS-AUT/MASS-INC | NIV-COMP/NIV-E2E/NIV-SEC/NIV-HML | EV-UI/EV-ACE/EV-HTTP/EV-SEG | HML-SEG/JUR/PROD | GAT-04/09 |

---

# 5. Critério de conclusão

Uma tela somente é aceita quando:

- suas âncoras funcionais aplicáveis passaram;
- o `QAT-UI-*` passou;
- a API negou ações não autorizadas;
- a interface não reteve conteúdo após revogação/contexto inválido;
- automação e revisão manual de acessibilidade passaram;
- o homologador aplicável registrou a decisão;
- não existe SEV-0/1.

---

**Situação desta versão:** 60 linhas revisadas e aprovadas pelo usuário.  
**Continuidade vigente:** pacote 23/23A–23D aprovado; preparar o repositório e iniciar a `ETP-00`; execução permanece `NOT_RUN_PLANNED`.
