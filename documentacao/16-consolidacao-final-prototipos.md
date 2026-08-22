# Documento 16

## Consolidação Final dos Protótipos de Baixa Fidelidade

**Sistema:** Portal interno multiempresa de Departamento Pessoal  
**Versão consolidada:** 1.0  
**Situação:** aprovado integralmente pelo usuário em 21/08/2026  
**Data:** 21/08/2026  
**Abrangência:** Documento Mestre, fluxo integrado e Lotes 1 a 7 aprovados

---

# 1. Finalidade desta consolidação

Este documento transforma os sete lotes de protótipos aprovados em uma única visão funcional do sistema. Ele não cria um novo módulo, não altera os cálculos aprovados e não inicia o desenvolvimento.

Seus objetivos são:

- demonstrar como as 60 telas e subfluxos formam um único produto;
- fixar a navegação final e os limites de cada contexto;
- definir a fonte única de cada informação;
- reunir as regras que atravessam mais de um módulo;
- impedir que uma implementação trate estados independentes como se fossem um único estado;
- registrar refinamentos posteriores que prevalecem sobre descrições antigas;
- separar decisões funcionais já encerradas de definições técnicas ou operacionais pré-produção;
- fornecer a base estável para a próxima entrega: a matriz formal de estados e transições.

O resultado esperado é uma referência que permita ao responsável de produto, desenvolvedores, testadores, contador, jurídico e usuários de homologação compreenderem o mesmo sistema.

---

# 2. Conclusão executiva

A primeira versão está funcionalmente definida e possui protótipos aprovados para todos os módulos previstos.

O sistema consolidado será:

- web e de uso exclusivamente interno;
- multiempresa, com um único CNPJ operacional ativo por sessão;
- destinado inicialmente a três empresas;
- dimensionado para aproximadamente 65 vínculos ativos, cerca de 300 inativos e até 10 usuários simultâneos;
- administrado por usuários internos, com pelo menos dois masters aptos;
- orientado a empregados e prestadores MEI, sem oferecer portal externo a eles;
- um controle interno complementar, sem substituir folha, contabilidade, eSocial, ponto, banco ou prontuário médico;
- baseado em histórico imutável, documentos versionados, confirmações explícitas e correções não destrutivas.

O produto possui somente seis itens operacionais no menu da empresa:

1. Painel;
2. Colaboradores;
3. Competências e Pagamentos;
4. ASO;
5. Notificações;
6. Auditoria, quando autorizada.

Desligamentos, recibos e exportações não ocupam itens próprios. Eles permanecem completos dentro dos contextos de Colaboradores, Competências e Pagamentos, ASO e Auditoria.

Configurações e perfis da empresa são abertos pela entrada `Administração`, fora do menu lateral. Usuários e modelos globais, clínicas compartilhadas, auditoria global e incidentes utilizam escopos próprios e não são misturados ao menu operacional de uma empresa.

---

# 3. Base documental e precedência

## 3.1 Fontes consolidadas

| Documento | Função |
|---|---|
| 07 — Documento Mestre | Regras de negócio, fórmulas, escopo, segurança e aceite funcional. |
| 08 — Fluxos Integrados | Navegação, inventário de telas, entradas, saídas e integração entre módulos. |
| 09 — Lote 1 | Acesso, conta, seleção de empresa, configurações e painel. |
| 10 — Lote 2 | Empregado, MEI, vínculos, contratos e condições financeiras. |
| 11 — Lote 3 | Competências, cálculos mensais, eventos e pagamentos. |
| 12 — Lote 4 | Correções, ajustes e recibos. |
| 13 — Lote 5 | Desligamento, rescisão oficial e acerto complementar. |
| 14 — Lote 6 | ASO, clínicas, prazos, alertas e versões. |
| 15 — Lote 7 | Notificações, auditoria, usuários, perfis, segurança e incidentes. |

## 3.2 Regra de precedência

1. Depois de aprovado, este Documento 16 prevalece para a visão consolidada, as normalizações e os vinte fechamentos explicitamente aprovados;
2. Uma regra específica aprovada posteriormente nos Documentos 09 a 15 prevalece sobre a redação geral anterior do mesmo assunto;
3. O Documento 07 continua sendo a fonte das fórmulas e limites do negócio que não tenham recebido refinamento explícito posterior;
4. O Documento 08 continua sendo a fonte do mapa de navegação, exceto onde um lote posterior o refinou;
5. Os Documentos 01 a 06 permanecem como descoberta e memória de decisões, sem superar a consolidação;
6. A futura matriz formal não poderá inventar transição que não esteja sustentada por essa hierarquia.

Se uma dúvida futura afetar fórmula, valor pago, isolamento de empresa, permissão, documento ou histórico, ela deverá ser tratada como mudança formal de planejamento, e não como interpretação livre durante o desenvolvimento.

---

# 4. Registro dos lotes aprovados

| Lote | Códigos | Entrega principal | Situação |
|---:|---|---|---|
| 1 | A01–A10 e P01 | Acesso, empresa, conta e painel | Aprovado em 16/08/2026 |
| 2 | C01–C08 e M01–M06 | Empregado, MEI e condições | Aprovado em 20/08/2026 |
| 3 | K01–K07 e F01–F03 | Competências, cálculos e pagamentos | Aprovado em 20/08/2026 |
| 4 | F04–F05 e R01–R03 | Correções, ajustes e recibos | Aprovado em 20/08/2026 |
| 5 | D01–D03 | Desligamento e acerto | Aprovado em 20/08/2026 |
| 6 | S01–S06 | ASO e clínicas | Aprovado em 21/08/2026 |
| 7 | N01, H01–H03, U01–U05 e I01–I02 | Notificações, administração e rastreabilidade | Aprovado em 21/08/2026 |

Total consolidado: **60 telas ou subfluxos funcionais**.

---

# 5. Escopo congelado da primeira versão

## 5.1 Incluído

- Autenticação, primeiro acesso, recuperação de senha e Minha Conta;
- TOTP obrigatório para masters;
- Seleção, troca, cadastro autorizado e configuração de empresa;
- Dois masters aptos como contingência mínima;
- Usuários, perfis empresariais, perfis globais e modelos iniciais;
- Permissões por módulo, tela, ação e campo;
- Estados de campo oculto, mascarado, visível sem edição e visível com edição;
- Cadastro, recontratação, histórico e desligamento de empregados;
- Cadastro, contratos, renovações, interrupções e encerramento de MEI;
- Condições financeiras do empregado;
- Período sem registro;
- Competências mensais;
- Líquido oficial e rescisão oficial informados manualmente;
- Cálculos internos expressamente aprovados;
- Adiantamento e pagamento final;
- Confirmação independente por grupo e evento;
- Correção guiada, ajuste positivo e diferença absorvida;
- Recibos internos privados e versionados;
- ASO informativo e clínicas compartilhadas;
- Painel, central interna de notificações e auditoria;
- Exportações Excel nas telas de origem;
- Registro simples e acompanhamento restrito de incidentes;
- Backup, restauração, retenção e competência de corte.

## 5.2 Fora do escopo

- Autocadastro e portal do empregado ou do prestador;
- Aplicativo móvel nativo;
- Férias como módulo;
- Ocorrências, afastamentos, licenças ou relatório gerencial relacionado;
- Ponto, horas extras ou cálculo de jornada;
- Folha oficial completa;
- Cálculo automático de INSS, Imposto de Renda ou sindicato;
- Cálculo da rescisão oficial;
- Importação de holerites ou planilhas;
- Integração bancária, contábil, eSocial ou dados bancários;
- Nota fiscal do MEI;
- Assinatura digital;
- Upload de comprovante de pagamento;
- Arquivo, imagem ou PDF de ASO;
- Diagnóstico, CID, prontuário, médico, CRM ou descrição clínica da restrição;
- Grau de risco e dispensa automática de demissional;
- Painel consolidado entre CNPJs;
- Exceção individual de permissão para usuário comum;
- Exclusão física de histórico;
- Motor complexo de aprovação;
- Microsserviços ou infraestrutura distribuída.

---

# 6. Arquitetura funcional consolidada

```text
Autenticação e conta
└── Seleção de empresa
    ├── Cadastrar empresa, quando permitido
    └── Entrar em exatamente uma empresa
        ├── Painel
        ├── Colaboradores
        │   ├── Empregado
        │   │   ├── Condições financeiras
        │   │   ├── Competências e pagamentos
        │   │   ├── ASO
        │   │   ├── Recibos
        │   │   ├── Histórico
        │   │   └── Desligamento
        │   └── MEI
        │       ├── Contrato e vigências
        │       ├── Competências e pagamentos
        │       ├── Recibos
        │       └── Histórico
        ├── Competências e Pagamentos
        │   ├── Resumo e checklist
        │   ├── Participantes e cálculos
        │   ├── Líquidos do contador
        │   ├── Adiantamento
        │   ├── Pagamento final
        │   ├── Desligamentos e acertos
        │   ├── Ajustes
        │   └── Recibos
        ├── ASO
        ├── Notificações
        ├── Auditoria empresarial
        └── Configurações da empresa — acesso pela Administração, fora do menu lateral
            ├── Cadastro empresarial — A10
            └── Perfis empresariais e matriz — U03/U04

Escopos próprios
├── Usuários globais e modelos de perfil — U01/U02/U05
├── Auditoria global
├── Clínicas compartilhadas
└── Incidentes
```

## 6.1 Princípio de integração

Uma mesma informação pode aparecer em mais de um ponto de entrada, mas nunca possui duas fontes de edição independentes.

Exemplos:

- D03 aparece a partir do empregado e da competência, mas utiliza o mesmo desligamento;
- C07, M05 e R01 mostram os mesmos recibos sob filtros diferentes;
- C08, M06, S04 e H03 consultam a mesma fonte de auditoria;
- C05 e M04 projetam os mesmos grupos financeiros existentes em K04/K05;
- N01 não copia a pendência: referencia a origem e deriva sua situação dela.

---

# 7. Contextos de segurança e navegação

## 7.1 Sem empresa ativa

Abrange:

- A01 a A08;
- seletor de empresa;
- administração global autorizada.

Nenhuma lista empresarial é pré-carregada antes da escolha da empresa.

A09 — Minha Conta herda o contexto de onde foi aberta: sem empresa quando acessada pelo seletor e empresarial quando acessada dentro de um CNPJ. Em ambos os casos, mostra somente dados e sessões da própria conta.

## 7.2 Empresa ativa

- Existe exatamente um `empresa_id` operacional na sessão;
- Cabeçalho exibe logo, razão social, CNPJ e ação `Trocar empresa`;
- Todas as consultas, totais, validações, arquivos e tarefas usam esse contexto;
- O servidor não aceita substituir a empresa por um identificador enviado pela tela;
- Perfil empresarial e permissões são avaliados dentro desse CNPJ;
- Master também seleciona uma empresa antes de operar dados empresariais.

## 7.3 Escopo global

Usado somente nas funções explicitamente compartilhadas:

- U01, U02 e U05;
- H02;
- S05 e S06;
- administração técnica autorizada.

O cabeçalho troca a empresa por uma faixa persistente `Escopo global`. Abrir um registro operacional exige selecionar ou revalidar sua empresa antes de continuar.

## 7.4 Escopo restrito de incidentes

- I01 e I02 não pertencem automaticamente ao master, ao DP ou ao perfil empresarial;
- O acesso depende de permissões próprias e responsáveis nominais;
- Conhecer o alcance do incidente não concede acesso operacional aos dados de cada empresa afetada;
- Usuário autorizado apenas a registrar não vê lista, contador ou identidade de outros incidentes.

## 7.5 Troca de empresa

1. Verificar alterações não salvas;
2. Pedir confirmação de descarte quando necessário;
3. Invalidar o contexto anterior;
4. Limpar competência, filtros, seleções, prévias, arquivos e dados sensíveis;
5. Voltar ao seletor;
6. Escolher e validar a nova empresa;
7. Carregar somente o novo painel.

Aba antiga comprovadamente pertencente ao contexto anterior é bloqueada. URL manipulada para outro CNPJ recebe resposta genérica de registro não encontrado.

---

# 8. Inventário consolidado das 60 telas

## 8.1 Acesso, empresa, conta e painel — 11

| Código | Tela | Natureza |
|---|---|---|
| A01 | Login | Pública, sem dados empresariais |
| A02 | Primeiro acesso | Autenticação parcial |
| A03 | Configuração inicial do TOTP | Master em primeiro acesso |
| A04 | Validação TOTP | Master autenticado parcialmente |
| A05 | Solicitar recuperação | Pública, resposta neutra |
| A06 | Redefinir senha | Token único de 30 minutos |
| A07 | Seleção de empresa | Usuário autenticado |
| A08 | Cadastro de empresa | Permissão global específica |
| A09 | Minha Conta | Próprio usuário |
| A10 | Configurações da empresa | Empresa ativa e permissão própria |
| P01 | Painel da empresa | Resumo empresarial autorizado |

## 8.2 Empregado e MEI — 14

| Código | Tela | Natureza |
|---|---|---|
| C01 | Lista de colaboradores | Empregados e MEIs sem misturar regras |
| C02 | Novo empregado ou recontratação | Fluxo guiado por CPF |
| C03 | Visão geral do empregado | Fonte contextual do vínculo |
| C04 | Condições financeiras | Vigências financeiras do empregado |
| C05 | Competências e pagamentos do empregado | Projeção por participante |
| C06 | ASOs do empregado | Projeção contextual de ASO |
| C07 | Recibos do empregado | Projeção documental |
| C08 | Histórico do empregado | Projeção da auditoria única |
| M01 | Novo MEI e contrato | Fluxo guiado por CNPJ |
| M02 | Visão geral do MEI | Cadastro e contrato atual |
| M03 | Contrato, vigências e renovação | Fonte contratual |
| M04 | Competências e pagamentos do MEI | Projeção financeira |
| M05 | Recibos do MEI | Projeção documental |
| M06 | Histórico do MEI | Projeção da auditoria única |

## 8.3 Competências, pagamentos, correções e recibos — 18

| Código | Tela | Natureza |
|---|---|---|
| K01 | Lista de competências | Pesquisa e seleção ampliada |
| K02 | Nova competência | Criação mensal |
| K03 | Resumo e checklist | Autoridade para fechamento |
| K04 | Participantes e cálculos | Visão coletiva |
| K05 | Detalhe financeiro do participante | Memória e lançamentos mensais |
| K06 | Líquidos do contador | Digitação individual rápida |
| K07 | Saldo inicial de implantação | Somente competência de corte |
| F01 | Abas de adiantamento e final | Cartões por grupo e evento |
| F02 | Participantes do grupo | Conferência individual |
| F03 | Confirmação em lote | Mesmo grupo e evento |
| F04 | Correção financeira guiada | Correção não destrutiva |
| F05 | Ajustes financeiros | Positivos e absorvidos |
| D01 | Visão filtrada de desligamentos | Dentro de Colaboradores |
| D02 | Registrar ou programar desligamento | Cadastro da saída |
| D03 | Desligamento e acerto | Fonte única em dois contextos |
| R01 | Recibos da competência | Lista e filtros |
| R02 | Detalhe e pré-visualização | Documento e versões |
| R03 | Impressão e download em lote | Definitivos elegíveis |

## 8.4 ASO e clínicas — 6

| Código | Tela | Natureza |
|---|---|---|
| S01 | Central de ASO | Pendências e realizados |
| S02 | Acompanhamento | Estado operacional sem resultado inventado |
| S03 | Registrar exame realizado | Cadastro ou retificação |
| S04 | Detalhe e versões | Snapshot e resultado sensível |
| S05 | Catálogo de clínicas | Escopo global |
| S06 | Cadastro e detalhe da clínica | Versão global |

## 8.5 Notificações, auditoria, administração e incidentes — 11

| Código | Tela | Natureza |
|---|---|---|
| N01 | Central de notificações | Empresa ativa e origem autorizada |
| H01 | Auditoria empresarial | Uma empresa |
| H02 | Auditoria global | Somente master |
| H03 | Detalhe imutável do evento | Somente leitura e redação por campo |
| U01 | Usuários | Administração global master-only |
| U02 | Detalhe do usuário | Identidade, acesso e segurança |
| U03 | Perfis empresariais | Exatamente uma empresa |
| U04 | Matriz de permissões | Módulo, tela, ação e campo |
| U05 | Perfis globais e modelos | Escopo global |
| I01 | Central e registro de incidente | Permissões separadas |
| I02 | Acompanhamento do incidente | Linha do tempo imutável |

---

# 9. Atores e autorização

## 9.1 Master

- Acessa todas as empresas atuais e futuras, sempre selecionando uma para operar;
- Administra usuários e perfis;
- Acessa auditoria global;
- Usa TOTP obrigatório;
- Não depende de perfil empresarial para obter acesso master;
- Não pode ser bloqueado, inativado ou rebaixado se a operação deixar menos de dois masters aptos;
- Ações críticas exigem reautenticação e justificativa.

Master apto significa simultaneamente:

- ativo;
- não bloqueado;
- primeiro acesso concluído;
- senha definitiva válida;
- TOTP configurado.

## 9.2 Usuário comum

- Não possui autocadastro;
- É convidado pelo master;
- Possui exatamente um perfil empresarial em cada empresa associada;
- Pode ter um perfil global opcional;
- Não recebe exceções individuais de permissão na primeira versão.

## 9.3 Usuário com função global

Pode receber perfil global para funções compartilhadas, como clínica. Isso não substitui o perfil empresarial nem autoriza dados operacionais de todas as empresas.

## 9.4 Contador

É uma fonte externa de valores, não um usuário obrigatório do sistema. Fornece:

- líquido do holerite;
- líquido da rescisão oficial;
- informações necessárias à homologação.

O sistema registra esses valores sem recalcular a folha ou a rescisão oficial.

## 9.5 Empregado e MEI

São participantes administrados. Não recebem login, portal, comunicação geral ou acesso aos dados na primeira versão.

## 9.6 Dimensões da permissão

1. Escopo empresarial ou global;
2. Módulo;
3. Tela;
4. Ação;
5. Campo;
6. Documento;
7. Operação crítica específica.

Campo oculto não aparece nem pode ser inferido por quantidade, filtro, total, erro, histórico, exportação, notificação ou resposta da API. Campo mascarado nunca chega integralmente ao navegador.

---

# 10. Fontes únicas e projeções

| Informação | Fonte única | Projeções ou entradas adicionais |
|---|---|---|
| Pessoa e vínculo empregado | C02/C03 | C01, K05, D03, S01, recibos e histórico |
| Condição financeira do empregado | C04 | K04, K05, F01/F02, D03 e recibos |
| Complemento avulso e reembolso real | K05 | F01/F02, recibos e histórico |
| Cadastro e contrato MEI | M01/M03 | M02, M04, K05 e recibos |
| Competência | K02/K03 | Painel, participantes, pagamentos, ajustes e notificações |
| Grupo financeiro | K05/F02 | C05, M04, F01, D03 e R01 |
| Confirmação de pagamento | F02/F03 ou confirmação própria aplicável | K03, K05, recibos, painel e auditoria |
| Correção | F04 | K03, K05, F05, R02 e histórico |
| Recibo | R01/R02 | C07, M05, K05 e D03 |
| Desligamento | D02/D03 | C03, D01, competência, ASO e notificações |
| Acompanhamento de ASO | S02 | C06, S01, D03 e notificações |
| Exame e versão de ASO | S03/S04 | S01, C06, histórico e auditoria |
| Prazo e alerta de ASO | Projeção derivada da versão de referência | S01, C06 e notificações |
| Clínica | S05/S06 | Snapshot gravado em cada ASO |
| Notificação | N01, derivada da origem | Sino e link contextual |
| Evento de auditoria | Fonte append-only central | C08, M06, H01–H03 e históricos contextuais |
| Usuário e perfis | U01–U05 | Login, seletor, menus, APIs, exportações e auditoria |
| Incidente | I01/I02 | Auditoria global restrita e plano operacional |

Uma projeção nunca mantém uma cópia editável separada da fonte.

---

# 11. Ciclo consolidado do empregado

## 11.1 Entrada

1. Informar CPF na empresa ativa;
2. CPF novo cria pessoa e vínculo;
3. CPF com vínculo encerrado permite recontratação reutilizando a pessoa;
4. CPF com vínculo ativo ou período sobreposto bloqueia novo vínculo;
5. Informar endereço completo obrigatório;
6. Informar início das atividades;
7. Informar admissão quando existir;
8. Salvar o vínculo mesmo que condições financeiras ainda estejam pendentes;
9. Configurar base do período sem registro, RA e salário-base conforme aplicabilidade;
10. Abrir visão geral e demais abas.

Início das atividades, admissão formal e saída são datas independentes.

## 11.2 Situação derivada

- Futuro, quando o início ainda não chegou;
- Ativo sem registro, quando iniciou e não possui admissão;
- Ativo registrado, quando possui admissão vigente;
- Desligamento programado, sem inativação antecipada;
- Último dia ativo;
- Inativo no dia seguinte à saída real;
- Histórico, sem novas condições ou movimentações ordinárias do vínculo encerrado; pagamentos, correções, recibos e documentos da última competência continuam possíveis conforme permissão.

## 11.3 Salário e remuneração

- Salário-base oficial é o salário do holerite;
- RA é o valor acordado fora do holerite;
- Total acordado é calculado e não editável;
- Líquido do contador já considera o adiantamento oficial;
- Alterar salário-base serve ao controle interno e não cria diferença automática, pois o ajuste oficial vem no líquido;
- RA pode existir desde o início das atividades, independentemente da admissão;
- RA é proporcional somente na primeira e última competência do vínculo;
- Complementos são integrais na competência e podem ser recorrentes ou avulsos;
- Salário redondo é um marcador; valores reais de reembolso são informados por evento, inclusive zero.

## 11.4 Período sem registro

- Começa no início das atividades;
- Em cada competência, termina no primeiro limite aplicável: dia anterior à admissão, data da saída sem registro ou último dia da própria competência;
- Se admissão e saída ainda não existirem, também pode ser apurado na competência aberta usando o fim dela como limite provisório;
- Mudança do limite antes do pagamento recalcula a linha; depois do pagamento segue F04;
- Usa divisor D30;
- Usa base sugerida e confirmada pelo usuário;
- Não inclui RA ou complemento;
- Pode ser dividido entre adiantamento e final ou ser 100% final;
- Exige confirmação de que os dias não estão no oficial do contador;
- Possui grupo e recibo próprios.

## 11.5 Histórico do empregado

C08 é uma projeção filtrada da auditoria única. Exibe pessoa, endereço, vínculo, condições, pagamentos, desligamento, ASO e recibos conforme as permissões atuais.

---

# 12. Ciclo consolidado do MEI

## 12.1 Cadastro e contrato

- CNPJ é validado dentro da empresa ativa;
- Cadastro pode ser reutilizado sem duplicar o prestador;
- Razão social, nome fantasia e endereço completo são obrigatórios;
- Telefone e e-mail são opcionais;
- Valor do contrato é mensal;
- Datas previstas e efetivas permanecem separadas;
- Forma de pagamento pode possuir adiantamento e final;
- Contratos e vigências não se sobrepõem.

## 12.2 Campos que não existem no MEI

- Salário-base;
- Holerite ou líquido do contador;
- RA;
- Salário redondo;
- Complemento trabalhista;
- ASO;
- Nota fiscal, número, data ou arquivo.

## 12.3 Competência e pagamento

- Primeiro e último mês são proporcionais por D30;
- Competências intermediárias usam o valor mensal integral;
- Início no dia 15 ou antes permite adiantamento proporcional;
- Início depois do dia 15 não gera adiantamento inicial;
- Serviços adicionais são avulsos da competência e destinados somente ao final;
- O adiantamento da base só deduz a própria base, nunca um serviço adicional;

```text
Saldo da base = máximo(0, base devida − adiantamento da base efetivamente pago)
Excedente absorvido = máximo(0, adiantamento da base efetivamente pago − base devida)
Final MEI = saldo da base + serviços adicionais
```

- Resultado negativo da base nunca gera cobrança: o excedente é absorvido;
- Serviço adicional permanece integralmente devido no pagamento final;
- Encerramento contratual é operado em M03/M04 e não usa D03 nem o estado trabalhista `Cancelado por desligamento`; na última competência, o adiantamento da base efetivamente pago é deduzido apenas da mesma base.

## 12.4 Renovação

- Renovação contínua começa no dia seguinte à vigência anterior;
- Não reaplica o corte de adiantamento como se fosse novo prestador;
- Pode ser programada antes do fim;
- Alteração de valor no meio da competência divide vigências por D30;
- Interrupção real exige novo contrato, preservando o anterior;
- Término normal usa a data final prevista, de forma inclusiva;
- Encerramento antecipado ou corrigido usa a data efetiva e nunca apaga contrato ou vigências anteriores.

---

# 13. Convenções de cálculo

## 13.1 D30

- O salário e o contrato são mensais;
- O divisor comercial é sempre 30;
- Fevereiro completo equivale a 30 dias;
- Mês com 31 dias também equivale a 30 dias;
- Intervalo de um dia equivale a um dia;
- Um intervalo mensal nunca supera 30 dias;
- As fórmulas completas e exemplos permanecem no Documento 07.

## 13.2 Corte do adiantamento

- As datas usadas no corte são diferentes por verba: admissão para o oficial; início das atividades para RA, complementos e período sem registro; início do contrato para MEI;
- Na primeira competência aplicável, data correspondente no dia 15 ou antes torna o grupo elegível ao adiantamento proporcional;
- Na primeira competência aplicável, data correspondente no dia 16 ou depois não gera adiantamento inicial, e o devido segue ao final conforme seu grupo;
- No oficial do empregado, o final continua exatamente o líquido informado pelo contador; nenhum adiantamento calculado é somado novamente;
- RA, complementos, período sem registro e base MEI aplicáveis seguem ao destino final conforme suas regras;
- Renovação MEI contínua e competências posteriores não reaplicam o corte;
- O dia 15 do corte, a data prevista do adiantamento e a data efetiva do pagamento são três referências distintas.

## 13.3 Moeda

- Valores monetários usam duas casas decimais;
- Cálculo interno pode manter precisão adicional;
- Exibição e persistência monetária obedecem ao arredondamento normal da terceira casa;
- O arredondamento especial sempre para cima dos complementos foi removido do sistema.

## 13.4 Limites de cálculo

O sistema calcula somente:

- RA e suas parcelas;
- complementos;
- período sem registro;
- incorpora ao grupo o reembolso informado manualmente ou confirmado como zero, sem calculá-lo;
- base contratual MEI e serviços adicionais;
- diferenças e ajustes desses valores;
- acerto complementar de desligamento calculado exclusivamente sobre RA.

Não calcula folha, tributos, líquido oficial ou rescisão oficial.

---

# 14. Catálogo financeiro consolidado

| Grupo | Participante | Evento | Recibo interno |
|---|---|---|---|
| Oficial do empregado | Empregado | Adiantamento e final | Não |
| RA e reembolso | Empregado | Adiantamento e final | Sim, por evento |
| Complementos | Empregado | Adiantamento e final | Sim, por evento |
| Período sem registro | Empregado | Adiantamento e final | Sim, próprio |
| Contrato MEI | MEI | Adiantamento e final | Sim, por evento |
| Rescisão oficial | Empregado formal | Desligamento | Não |
| Acerto complementar de RA | Empregado | Desligamento | Sim |
| Ajuste positivo | Empregado ou MEI | Ajuste | Sim |
| Diferença absorvida | Empregado ou MEI | Sem pagamento | Não |

Invariantes:

- Cada grupo e evento é independente;
- Confirmar um grupo não confirma outro;
- Não existe pagamento parcial dentro do mesmo grupo e evento;
- Cada valor pago possui data efetiva própria;
- Uma verba só deduz valor efetivamente pago da mesma verba;
- O oficial do contador permanece autoritativo e não é decomposto;
- Grupo de valor zero deve ser `Não aplicável`, com motivo, e não `Pago`;
- A competência só fecha quando todos os grupos aplicáveis estão resolvidos.

---

# 15. Operação mensal consolidada

## 15.1 Criação da competência

- Uma competência por empresa e mês;
- Datas previstas sugeridas pela empresa e editáveis;
- Sem cálculo automático de quinto dia útil ou feriados;
- Participantes são mostrados antes da confirmação;
- Inconsistências são informadas sem fabricar valores.

## 15.2 Situações oficiais

1. Em preparação;
2. Aguardando holerites;
3. Em conferência;
4. Fechada;
5. Reaberta.

`Em pagamentos` é somente um indicador visual derivado de grupos prontos ainda não pagos.

## 15.3 Fluxo mensal

1. Criar ou abrir a competência;
2. Atualizar participantes sem duplicar;
3. Calcular grupos aplicáveis;
4. Resolver dados pendentes;
5. Confirmar adiantamentos efetivamente pagos;
6. Informar líquidos do contador;
7. Calcular e conferir pagamento final;
8. Confirmar os grupos finais efetivamente pagos;
9. Resolver desligamentos, ajustes e recibos substitutos;
10. Conferir checklist;
11. Fechar por ação explícita.

## 15.4 Confirmação

- Integral por participante, grupo e evento;
- Data efetiva obrigatória e não futura;
- Pode ocorrer em lote somente para o mesmo grupo e evento;
- Cada participante mantém sua própria confirmação, auditoria e recibo;
- Registros impedidos são retirados antes do envio;
- Depois da retirada dos impedidos conhecidos, F03 confirma o conjunto elegível em modo `todos ou nenhum`; conflito surgido durante a transação desfaz todo o lote elegível;
- Clique repetido não duplica pagamento ou numeração;
- Diante de resposta incerta, consultar o estado real antes de permitir nova tentativa.

## 15.5 Fechamento

K03 é a única autoridade. O botão só fica disponível quando não houver:

- grupos não gerados ou pendentes;
- líquido obrigatório ausente;
- salário redondo sem valor ou confirmação de zero;
- pagamento aplicável sem resolução;
- ajuste positivo pendente;
- desligamento financeiro incompleto;
- correção aberta;
- recibo substituto pendente;
- conflito de edição.

Pendência de ASO demissional não bloqueia o fechamento financeiro.

---

# 16. Correções, ajustes e valores preservados

## 16.1 Regra geral

```text
Ajuste da verba = novo valor devido da verba − valor efetivamente pago da mesma verba
```

- Resultado positivo da verba: criar ajuste adicional a pagar;
- Resultado zero da verba: nenhuma movimentação financeira;
- Resultado negativo da verba: registrar diferença absorvida pela empresa;
- Em grupo composto, resultados positivos e negativos podem coexistir e nunca são compensados silenciosamente entre verbas;
- Nunca criar pagamento negativo, cobrança ou compensação futura.

## 16.2 Correção guiada

1. Selecionar participante, grupo e evento;
2. Informar justificativa;
3. Reabrir competência, quando necessário e permitido;
4. Cancelar administrativamente a confirmação afetada;
5. Invalidar ou substituir o recibo vigente quando aplicável;
6. Liberar somente o escopo escolhido;
7. Preservar cálculo original, valor pago e versões;
8. Corrigir e recalcular;
9. Criar ajuste positivo e/ou diferença absorvida, conforme o resultado de cada verba;
10. Reconfirmar o estado correto;
11. Emitir documento aplicável;
12. Voltar ao checklist e fechar novamente.

Regras da jornada F04:

- Antes do cancelamento administrativo, a preparação ainda pode ser descartada sem criar correção persistente;
- Depois do cancelamento, a correção é persistente e pode ser retomada por outro usuário autorizado;
- Existe no máximo uma correção aberta por empresa, competência, participante, grupo e evento;
- Correção aberta bloqueia o fechamento;
- Oficial mensal e rescisão oficial usam o ramo autoritativo do contador, sem ajuste ou recibo interno produzido pelo sistema.

## 16.3 Documento substituto e ajuste positivo

- Recibo definitivo nunca declara como pago um saldo ainda pendente;
- O valor já efetivamente entregue permanece documentado;
- O ajuste positivo recebe confirmação e recibo próprios somente quando pago;
- Original, cancelamento, substituição e ajuste ficam ligados pela mesma correção;
- Uma tentativa repetida não cria duas correções, dois ajustes ou dois documentos.

## 16.4 Diferença absorvida

- Registra pago, novo devido, diferença, justificativa, usuário e data;
- Não gera recibo;
- Não gera cobrança;
- Não reduz pagamento futuro;
- Não permanece como pendência financeira;
- Continua em histórico, auditoria e Excel autorizado.

---

# 17. Recibos consolidados

## 17.1 Tipos emitidos para empregado

- RA e reembolso do adiantamento;
- Complementos do adiantamento;
- Período sem registro do adiantamento;
- RA e reembolso do pagamento final;
- Complementos do pagamento final;
- Período sem registro do pagamento final;
- Ajuste positivo;
- Acerto complementar de desligamento sobre RA.

## 17.2 Tipos emitidos para MEI

- Adiantamento contratual;
- Pagamento final contratual, com serviços adicionais detalhados;
- Ajuste positivo.

## 17.3 Tipos proibidos

- Salário oficial;
- Líquido do holerite;
- Rescisão oficial do contador;
- Diferença absorvida;
- Evento de valor zero.

## 17.4 Ciclo documental

- Prévia: sem número e com `PRÉVIA — PAGAMENTO NÃO CONFIRMADO`;
- Definitivo vigente: somente depois da confirmação integral;
- Cancelado: preservado e sem reutilizar o número;
- Substituído: preservado e ligado ao novo documento;
- Substituto vigente: novo número e nova versão.

## 17.5 Conteúdo

- Número anual único por empresa;
- Empresa, CNPJ e logo do snapshot;
- Participante e documento;
- Competência e evento;
- Detalhamento;
- Total numérico e por extenso;
- Data efetiva e emissão;
- Versão e relação de substituição;
- Assinatura manual do participante;
- Sem assinatura da empresa.

## 17.6 Segurança

- PDF privado, imutável e com hash;
- Reimpressão da mesma versão não cria número;
- Visualizar, baixar, reimprimir e gerar lote são ações independentes;
- Documento é indivisível: sem acesso atual a todo o conteúdo, não há entrega parcial;
- Download revalida sessão, empresa e permissão;
- Falha de geração não desfaz o pagamento nem perde o número reservado;
- Regeneração usa o mesmo snapshot e é auditada.

## 17.7 Lote documental — R03

- Aceita somente recibos definitivos vigentes, íntegros e integralmente autorizados;
- Pode gerar um PDF consolidado ou um ZIP de PDFs individuais;
- Antes de concluir, revalida versão, integridade, empresa e todas as permissões;
- Mudança em qualquer item cancela o lote inteiro, sem produzir subconjunto silencioso;
- O lote não altera números, versões ou pagamentos dos recibos de origem.

---

# 18. Desligamento consolidado

## 18.1 Tipos

- Demissão formal;
- Desligamento sem registro.

Não coexistem no mesmo vínculo. Não existe campo de motivo; existe aviso trabalhado, indenizado ou não aplicável.

## 18.2 Responsabilidades por contexto

Em Colaboradores:

- data, tipo, aviso e programação;
- cancelamento de programação futura;
- situação do vínculo e inativação;
- pendência de ASO demissional.

Na competência:

- rescisão oficial;
- acerto de RA;
- complementos e período sem registro em grupos próprios;
- confirmações, ajustes e recibos.

As duas entradas usam D03 e a mesma fonte.

## 18.3 Inativação

- Data futura não inativa antecipadamente;
- No último dia, o vínculo ainda é identificado como último dia ativo;
- No dia seguinte à saída efetiva, a inativação é automática;
- Inativação não depende da quitação financeira ou do ASO;
- Histórico continua consultável.

Cancelamento simples só é permitido enquanto a programação for futura e ainda não tiver produzido efeitos. Depois disso, a alteração segue correção auditada.

## 18.4 Adiantamento na competência final

- Saída antes ou na data prevista, com adiantamento ainda não pago: cancelar o evento aplicável; RA segue ao acerto proporcional, enquanto complementos e período sem registro seguem integralmente aos respectivos grupos finais;
- Reembolso não migra automaticamente para rescisão ou acerto; só permanece devido no evento mensal quando existir desconto real já apurado que o origine;
- No grupo oficial do empregado, o cancelamento não soma adiantamento calculado ao final: o líquido mensal ou a rescisão continua sendo exatamente o valor informado pelo contador;
- Saída depois da data prevista, mas com grupo ainda pendente: usar `Decisão necessária`, sem migração automática;
- Adiantamento efetivamente pago é preservado e deduzido somente da mesma verba;
- Excedente vira diferença absorvida.

## 18.5 Rescisão oficial

- Valor informado pelo contador;
- Substitui o líquido mensal oficial na competência de demissão formal;
- Não é recalculado;
- Não inclui RA;
- Não gera recibo interno.

Desligamento sem registro não cria rescisão oficial nem ASO demissional. Rescisão oficial e acerto complementar de RA possuem confirmações e datas efetivas independentes.

## 18.6 Acerto complementar de RA

Usa a RA vigente na data real de saída e pode conter:

- saldo proporcional da RA até a saída;
- aviso indenizado sobre RA;
- 13º sobre RA;
- férias proporcionais sobre RA e um terço;
- férias vencidas sobre RA e um terço, sem dobra.

Cada verba exige aplicabilidade e dados confirmados. Aviso trabalhado já está nos dias trabalhados e não cria linha adicional. Salário-base, complemento, reembolso e período sem registro não entram nessa memória.

Na competência final, a RA mensal integral não é gerada em paralelo: o saldo proporcional devido aparece exclusivamente no acerto complementar, evitando duplicidade.

---

# 19. ASO e clínicas consolidados

## 19.1 Abrangência

ASO existe somente para empregado. Tipos:

- Admissional;
- Periódico;
- Retorno ao trabalho;
- Mudança de riscos ocupacionais;
- Demissional.

## 19.2 Estados obrigatoriamente separados

### Acompanhamento

- Pendente;
- Agendado;
- Realizado;
- Não compareceu;
- Encerrado sem realização;
- Cancelado, como terminal histórico de acompanhamento manual ou programação cancelada.

`Agendado` é apenas estado operacional na primeira versão. Não possui data, hora, local ou comunicação externa.

### Resultado

- Apto;
- Apto com restrição;
- Inapto.

### Prazo derivado

- Vigente;
- Vencendo em até 30 dias;
- Vencido;
- Não aplicável quando o tipo não possui vencimento futuro.

### Restrição derivada

- Sem restrição;
- Com restrição;
- Não aplicável para resultado `Inapto`.

Situação de acompanhamento, resultado, prazo e restrição nunca são fundidos num único campo.

## 19.3 Regras

- Admissional vigente é único por vínculo; repetição direciona à retificação;
- Demissional vigente é único por desligamento formal; repetição para o mesmo desligamento direciona à retificação;
- Periódico pode se repetir como novo exame;
- Retorno e mudança de riscos podem se repetir por ocorrência;
- Vencimento sugerido é 12 meses e pode ser editado;
- Demissional não cria vencimento futuro;
- Não comparecimento não cria exame, resultado ou dispensa;
- Encerramento sem realização exige permissão e justificativa;
- Cancelamento existe apenas como terminal histórico de acompanhamento manual ou de programação de desligamento cancelada;
- Pendência demissional persiste até realização ou encerramento autorizado;
- Cancelar desligamento futuro cancela a pendência demissional ativa, preservando a linha do tempo e qualquer exame já realizado;
- Versão substituída não gera alerta;
- Somente a versão de referência ativa participa do alerta.

## 19.4 Dados armazenados

- Tipo;
- Clínica em snapshot;
- Data do exame;
- Vencimento quando aplicável;
- Resultado;
- Versão e histórico.

Não há arquivo, diagnóstico, CID, médico, CRM ou texto da restrição.

A abertura de resultado sensível exige ação explícita e é auditada. Ocultar resultado também o remove de filtro, ordenação, total, histórico e Excel.

## 19.5 Clínica global

- Razão social, nome fantasia, CNPJ e situação;
- Compartilhada entre empresas;
- Alterações são auditadas e protegidas por versão técnica contra edição concorrente;
- Inativação não altera snapshots antigos;
- Catálogo nunca revela empresas, empregados ou exames que usaram a clínica;
- Usuário que pode consultar um ASO empresarial continua vendo o snapshot da clínica daquele exame, mesmo sem permissão para administrar o catálogo global.

## 19.6 Referência de prazo e alerta

- Antes do primeiro periódico, o admissional vigente é a referência inicial, quando existir;
- Depois do primeiro periódico, somente o periódico vigente mais recente pode ser referência ativa;
- Retorno, mudança de riscos e demissional não substituem essa referência;
- Existe no máximo uma referência ativa por vínculo;
- Versão substituída ou invalidada não alerta;
- Vínculo inativo suprime o alerta periódico;
- Demissional nunca gera vencimento futuro;
- Mudança diária de prazo é derivada e não cria versão nem evento de alteração.

---

# 20. Notificações consolidadas

## 20.1 Escopo

- Somente empresa ativa;
- Central e sino exigem permissão;
- Cada item exige permissão atual da origem;
- Contador é calculado depois de empresa e autorização;
- Campo ou módulo oculto não pode ser inferido pela contagem.

## 20.2 Estados separados

- Operacional: ativa ou resolvida;
- Individual: lida ou não lida.

Marcar como lida não resolve a obrigação. Resolver a origem move a mesma ocorrência para resolvidas.

## 20.3 Regras

- Urgentes e vencidas aparecem primeiro;
- `Marcar visíveis como lidas` afeta somente IDs autorizados da página e filtros atuais;
- Permissão retirada remove item e contador imediatamente;
- Link reautoriza antes de revelar a origem;
- Condição resolvida que volta a ocorrer cria nova ocorrência não lida;
- Aumento de urgência devolve uma ocorrência lida para não lida;
- Sino conta somente ativas, não lidas e autorizadas;
- Resolvidas permanecem 90 dias;
- Exportações não criam notificação;
- Não existe exclusão, comentário, atribuição, adiamento, envio por e-mail ou mensagem geral.

---

# 21. Auditoria, usuários, perfis e incidentes

## 21.1 Auditoria

- Fonte única e somente de acréscimo;
- H01 usa a empresa ativa;
- H02 é global e master-only;
- H03 é somente leitura;
- H01/H02 abrem com os últimos 30 dias, exigem período e limitam a pesquisa interativa a 366 dias;
- Antes e depois exigem acesso ao evento, permissão de histórico ou auditoria conforme a origem e permissão atual do campo;
- Campo restrito é redigido antes de chegar ao navegador;
- Abrir antes/depois sensível é uma ação auditada;
- Exportação global extensa exige master com TOTP concluído na sessão e reautenticação recente quando aplicável;
- Segredos nunca são registrados;
- Resultados mínimos: Sucesso, Negado, Falha e Cancelado quando a regra impedir a alteração antes de concluí-la;
- Operação de negócio e auditoria obrigatória são atômicas.

## 21.2 Usuários

- Cadastro somente pelo master;
- Nome e e-mail obrigatórios;
- E-mail único globalmente sem diferença entre maiúsculas e minúsculas;
- Convite temporário válido por 24 horas;
- Bloqueio administrativo, inativação e bloqueio temporário de login são estados diferentes;
- Não há exclusão física;
- Reenvio de primeiro acesso invalida a credencial anterior.

## 21.3 Sessões

Revogação automática ocorre em:

- bloqueio ou inativação;
- troca e recuperação de senha;
- redefinição de TOTP;
- promoção ou rebaixamento de master;
- retirada de empresa;
- troca de perfil;
- redução de perfil global;
- alteração de perfil que retire acesso.

Não existe ação administrativa genérica para encerrar sessões sem uma causa aprovada. O próprio usuário pode encerrar as demais sessões em Minha Conta.

## 21.4 Perfis

- U03/U04 sempre editam exatamente uma empresa;
- U05 contém perfis globais e modelos iniciais;
- Modelo copiado se torna perfil empresarial independente;
- Mudança posterior no modelo não se propaga;
- Perfil arquivado não recebe nova atribuição;
- Atribuições atuais permanecem até migração explícita, com impacto visível;
- Novos módulos, telas, ações e campos entram negados por padrão;
- Mudança é versionada, atômica, justificada, auditada e aplicada imediatamente.

## 21.5 Incidentes

Permissões independentes:

- Registrar;
- Consultar;
- Acrescentar acompanhamento;
- Concluir ou reabrir.

Situações:

- Aberto;
- Em tratamento;
- Concluído.

I01 registra data percebida, data de conhecimento pelo controlador, descrição, possível alcance e metadados automáticos. Contenção inicial e referência de evidência são opcionais no registro e podem ser acrescentadas em I02.

I02 mantém linha do tempo imutável de contenção, evidência, alcance, correção, restauração, avaliação jurídica/LGPD, comunicações, decisão, monitoramento, conclusão e melhoria.

O sistema não envia comunicação, não decide obrigação jurídica e não recebe anexos. Reabrir exige permissão, reautenticação, justificativa e nova entrada.

---

# 22. Exportações

Não existe menu ou central de exportações.

| Origem | Conteúdo |
|---|---|
| C01 | Colaboradores conforme aba, filtros e campos permitidos |
| K03 | Competência, eventos, componentes, ajustes e recibos autorizados |
| S01 | ASOs conforme filtros, versão atual vigente ou invalidada e campos autorizados |
| S05 | Catálogo global de clínicas, sem uso por empresas ou empregados |
| H01 | Auditoria da empresa |
| H02 | Auditoria global master-only |

Regras comuns:

- Arquivo privado e exclusivo do solicitante;
- Expiração em até 24 horas;
- Arquivo vazio não é gerado;
- Campo oculto é omitido e mascarado permanece mascarado;
- Resultado de ASO é omitido por padrão e só entra com permissão atual e confirmação sensível específica e auditada;
- CPF e CNPJ são exportados como texto; datas como datas; valores e percentuais como números;
- O arquivo não contém fórmulas de negócio recalculáveis;
- Texto perigoso para Excel é neutralizado;
- Download revalida sessão, solicitante, empresa ou escopo e permissões atuais;
- Permissão retirada depois da geração impede o download;
- Pedido, conclusão, falha, expiração e download são auditados;
- Resultado aparece na tela de origem;
- Nenhuma exportação gera e-mail ou notificação operacional.

---

# 23. Famílias de estados para a matriz formal

A próxima etapa não criará um estado geral único. Ela detalhará separadamente as seguintes famílias:

| Família | Estados macro consolidados |
|---|---|
| Tela | Vazio, filtro sem resultado, carregando, processando, concluído, falha, sessão expirada, sem permissão, conflito, validação |
| Empresa | Ativa, inativa em modo histórico |
| Usuário | Ativo, bloqueado, inativo; bloqueio temporário separado |
| Primeiro acesso | Pendente, concluído, vencido |
| Credencial TOTP | Não aplicável, pendente, configurada, redefinição exigida |
| Sessão de autenticação e contexto | Não autenticada, senha aceita com TOTP pendente, TOTP concluído, autenticada sem empresa, contexto empresarial, escopo global, escopo restrito de incidentes, aviso de inatividade, expirada, encerrada, revogada |
| Situação temporal do vínculo empregado | Futuro, ativo, encerramento programado, último dia ativo, inativo |
| Condição de registro do empregado | Sem registro, registrado formalmente |
| Tipo de encerramento do empregado | Não encerrado, encerrado sem registro, demitido formalmente |
| Contrato MEI | Futuro, ativo, renovação programada, encerramento programado, encerrado |
| Competência | Em preparação, aguardando holerites, em conferência, fechada, reaberta |
| Grupo financeiro | Não gerado, pendente de dados, calculado, pronto, pago, não aplicável, cancelado por desligamento, em correção |
| Ajuste positivo | Pendente, pago, em correção |
| Diferença absorvida | Absorvida pela empresa |
| Recibo | Prévia, definitivo vigente, cancelado, substituído, substituto vigente |
| Arquivo documental do recibo | Pendente de geração, disponível, falhou ou indisponível; nunca expira pela regra de 24 horas |
| Arquivo temporário de exportação ou lote | Preparando, processando, pronto, falhou, expirado ou indisponível |
| Desligamento | Programado, efetivo, cancelado; situação financeira derivada separada |
| Financeiro do desligamento | Pendente de dados, aguardando conferência, grupos pendentes, decisão necessária, desligamento informado após pagamento, financeiro quitado, em correção |
| ASO acompanhamento | Pendente, agendado, realizado, não compareceu, encerrado sem realização, cancelado |
| ASO resultado | Apto, apto com restrição, inapto |
| ASO restrição derivada | Sem restrição, com restrição, não aplicável |
| ASO versão | Vigente, substituída, invalidada administrativamente |
| ASO prazo | Vigente, vencendo, vencido, não aplicável |
| ASO elegibilidade do alerta | Referência ativa, informativo, suprimido por vínculo inativo, não aplicável |
| Clínica | Ativa, inativa |
| Notificação operacional | Ativa, resolvida |
| Leitura de notificação | Não lida, lida |
| Incidente | Aberto, em tratamento, concluído |
| Perfil | Ativo, arquivado |
| Associação a perfil | Vigente, legada em perfil arquivado com migração pendente |

Cada família terá eventos, pré-condições, permissões, efeitos, auditoria, notificações e bloqueios próprios.

---

# 24. Validações e integridade transversais

## 24.1 Validação em camadas

- Formato e obrigatoriedade na interface;
- Regras de negócio no servidor;
- Restrições e relacionamentos no banco;
- Permissão e empresa em todas as camadas;
- Mensagens próximas do campo e resumo no topo;
- Valores permitidos preservados depois de erro;
- Nenhum dado sensível reapresentado após sessão expirada.

## 24.2 Duplicidade

- CPF normalizado dentro da empresa;
- Os períodos dos vínculos da mesma pessoa não podem se sobrepor na empresa e pode existir no máximo um vínculo ativo por vez;
- CNPJ MEI normalizado e contrato sem sobreposição;
- Uma competência por empresa e mês;
- Numeração de recibo única por empresa e ano;
- Uma confirmação idempotente por operação;
- Regras específicas de duplicidade de ASO por tipo;
- Uma única correção F04 aberta por empresa, competência, participante, grupo e evento;
- Convite e usuário não duplicados por repetição.

## 24.3 Concorrência

- Registros editáveis possuem versão;
- Salvamento antigo é rejeitado;
- Fechamento, confirmação, numeração, dois masters e matriz de permissão usam transação;
- Operação e auditoria obrigatória concluem juntas ou nenhuma conclui;
- Restrição única protege criações simultâneas;
- A unicidade da correção aberta também é protegida contra duas iniciações concorrentes;
- Resposta incerta é reconciliada antes de repetir.

## 24.4 Exclusão e inativação

- Histórico relevante não é excluído fisicamente;
- Empregado e MEI encerrados permanecem consultáveis;
- Clínica e perfil em uso são inativados ou arquivados;
- Documento cancelado permanece disponível conforme permissão;
- Correção cria versão, nunca substituição destrutiva.

---

# 25. Segurança consolidada

## 25.1 Autenticação

- Senha definitiva com no mínimo dez caracteres;
- Senha temporária por 24 horas;
- Recuperação por link único de 30 minutos;
- Cinco falhas geram bloqueio temporário de 15 minutos;
- Tentativas de TOTP e códigos de recuperação também possuem limitação e proteção contra força bruta;
- Um código TOTP aceito não pode ser reutilizado na mesma janela temporal;
- Respostas de autenticação são neutras;
- TOTP obrigatório para master;
- Códigos de recuperação são únicos e de uso único;
- Códigos de recuperação, tokens de redefinição e credenciais temporárias são armazenados por hash, nunca de forma reversível;
- Não existe `Manter conectado`.

## 25.2 Sessão

- Aviso aos 25 minutos de inatividade;
- Expiração aos 30 minutos;
- Limite absoluto de 8 horas;
- Atualização automática do sino não renova a sessão;
- O identificador de sessão é rotacionado após senha aceita, TOTP concluído e elevação de privilégio;
- Troca de senha e eventos críticos revogam sessões aplicáveis;
- Revogação no servidor impede aba já aberta de concluir operação.

## 25.3 Dados e arquivos

- HTTPS obrigatório;
- Hash forte de senha;
- TOTP cifrado separadamente;
- CPF protegido e índice de busca seguro;
- PDFs e Excel privados;
- Logs sem CPF completo, remuneração detalhada, resultado clínico ou segredo;
- Consulta de CEP envia somente CEP;
- Dados reais não são usados em desenvolvimento;
- Segredos ficam fora do código e repositório.

## 25.4 Multiempresa

- `empresa_id` obrigatório nas entidades empresariais;
- Relacionamentos impedem associação cruzada;
- Row-Level Security como segunda barreira;
- Tarefa sem empresa falha com segurança;
- Arquivo e auditoria carregam escopo;
- Busca e erro não revelam existência externa.

## 25.5 Controles da aplicação web

- Proteção contra requisições forjadas em operações de alteração;
- Cookies de sessão `Secure`, `HttpOnly` e política `SameSite` apropriada;
- Política de conteúdo e defesa contra injeção na interface;
- Texto livre tratado como dado, nunca como HTML ou comando;
- Limites e orientação para descrição de incidente;
- Versão de autorização conferida nas operações sensíveis;
- Acesso à hospedagem protegido por MFA;
- Credenciais e ambientes separados.

---

# 26. Desempenho, backup e retenção

## 26.1 Metas iniciais

- Login, seletor, listas e filtros: até 2 segundos na maior parte das requisições;
- Painel: até 3 segundos;
- Cálculo de competência com até 100 participantes: até 5 segundos;
- Excel operacional: até 30 segundos;
- Recibo individual: até 5 segundos;
- Lote longo apresenta progresso sem bloquear a sessão.

## 26.2 Estratégia proporcional

- Aplicação web modular única;
- Backend único;
- PostgreSQL;
- Listas paginadas;
- Inativos fora da consulta padrão;
- Índices por empresa, competência, situação e data;
- Sem tempo real, cache distribuído ou busca externa;
- Processamento de fundo somente onde o volume justificar.

## 26.3 Backup

- Backup diário completo;
- Recuperação pontual entre backups;
- Cópia cifrada separada;
- RPO de 1 hora;
- RTO de até 8 horas úteis;
- Teste antes da produção e trimestral;
- Restauração inicialmente integral, não por CNPJ.

## 26.4 Retenção

- Mínimo de seis anos;
- Sem exclusão automática na primeira versão;
- Recibos, vínculos, pagamentos e auditoria preservados;
- Exportações temporárias por até 24 horas;
- Notificações resolvidas por 90 dias;
- ASO físico permanece sob guarda da empresa;
- Política após o prazo mínimo será definida futuramente.

---

# 27. Implantação e competência de corte

## 27.1 Estratégia

Preferir competência cujo adiantamento ainda não ocorreu.

Se houver pagamento real anterior ao início do sistema na competência de corte, K07 registra:

- participante;
- grupo e evento;
- valor efetivamente pago;
- data real;
- usuário;
- marca permanente `Saldo inicial de implantação`.

Não são fabricadas competências, recibos ou movimentações anteriores.

## 27.2 Dados iniciais

- Empresas e logos;
- Padrões financeiros;
- Dois masters aptos;
- Perfis e usuários;
- Empregados ativos;
- MEIs e contratos ativos;
- Condições e complementos vigentes;
- Último ASO necessário ao controle atual;
- Clínicas;
- Pagamentos reais já ocorridos na competência de corte.

## 27.3 Homologações externas

Antes da produção:

- Contador homologa exemplos e fórmulas;
- Jurídico homologa terminologia e recibos;
- Operação confere fluxos e quantidades;
- Segurança testa isolamento multiempresa;
- Equipe executa restauração e exercício de incidente.

---

# 28. Melhorias futuras e itens diferidos

## 28.1 MF-01 — Agendamento de ASO e lembretes

Registrada para estudo futuro, sem alterar a primeira versão:

- telefone e e-mail opcionais no cadastro do empregado, com confirmação de atualidade;
- data, horário, local e orientação;
- agendamento, reagendamento e cancelamento;
- lembretes por WhatsApp, e-mail ou SMS;
- canal preferencial e contingência;
- estados de envio e entrega;
- idempotência e auditoria por tentativa;
- validação jurídica, transparência e escolha de fornecedor.

Nenhum canal será ativado apenas porque telefone ou e-mail existe no cadastro.

## 28.2 Não transformar em escopo implícito

Os seguintes temas permanecem excluídos mesmo que pareçam tecnicamente próximos:

- comunicação geral com empregado;
- folha e tributos;
- banco;
- nota fiscal;
- ponto;
- férias;
- anexos;
- portal externo;
- painel multi-CNPJ.

---

# 29. Normalizações registradas nesta consolidação

Estas normalizações não representam novas funcionalidades. Elas apenas fixam a leitura coerente das decisões aprovadas:

1. O cabeçalho do Documento 12 passa a registrar que o Lote 4 foi aprovado em 20/08/2026;
2. I01 usa permissões separadas para registrar, consultar, acompanhar e concluir/reabrir, conforme o Lote 7;
3. Data de conhecimento pelo controlador integra o registro de incidente;
4. Contenção e referência de evidência são opcionais no registro inicial e podem ser acrescentadas em I02;
5. Incidente usa somente `Aberto`, `Em tratamento` e `Concluído`; etapas detalhadas ficam na linha do tempo;
6. Administração não possui ação genérica para encerrar sessões de terceiros; revogação é consequência das ações de segurança aprovadas;
7. Minha Conta continua permitindo ao próprio usuário encerrar as demais sessões;
8. Um perfil arquivado em uso bloqueia novas atribuições, preserva as atuais temporariamente e exige migração explícita;
9. Nova condição após resolução cria nova ocorrência de notificação, sem reabrir ou sobrescrever a ocorrência anterior;
10. Resultado da auditoria usa o catálogo mínimo `Sucesso`, `Negado`, `Falha` e `Cancelado`;
11. Novo módulo, tela, ação ou campo nasce negado por padrão;
12. `Agendado` em ASO permanece apenas um estado, e não uma agenda real;
13. A tela integrada `Competências e Pagamentos` não elimina a independência dos grupos, confirmações ou permissões;
14. Desligamento e recibo continuam como subfluxos completos, sem item próprio no menu;
15. Excel permanece na tela de origem, sem central ou item de menu.

---

# 30. Entradas da próxima etapa — matriz formal

A matriz será produzida em blocos para manter clareza e rastreabilidade:

1. Autenticação, primeiro acesso, TOTP e sessão;
2. Empresa ativa, inativação e troca de contexto;
3. Usuário, master, perfil e permissão;
4. Pessoa, vínculo empregado e recontratação;
5. Cadastro, contrato e vigência MEI;
6. Condições financeiras e complementos;
7. Competência;
8. Grupo financeiro e evento;
9. Confirmação e pagamento;
10. Correção, ajuste e diferença absorvida;
11. Recibo e arquivo;
12. Desligamento e inativação;
13. Acompanhamento, exame, versão, prazo e alerta de ASO;
14. Clínica;
15. Notificação e leitura;
16. Exportação;
17. Incidente;
18. Estados comuns de tela e concorrência.

Cada linha da matriz deverá informar:

- entidade;
- estado inicial;
- evento ou comando;
- ator e permissão;
- pré-condições;
- validações;
- estado final;
- efeitos financeiros;
- efeito documental;
- efeito em notificação;
- auditoria;
- idempotência;
- bloqueios e mensagem;
- possibilidade de reversão ou correção.

---

# 31. Propostas de fechamento para aprovação

As auditorias cruzadas dos sete lotes identificaram os pontos abaixo. As recomendações preservam o escopo e evitam deixar uma decisão funcional para o programador.

## 31.1 Incidentes e master

**Recomendação:** o papel master administra usuários e permissões, mas não recebe automaticamente acesso ao conteúdo de I01/I02. Para consultar ou acompanhar incidentes, o master também precisa receber a permissão restrita correspondente e ser incluído entre os responsáveis autorizados.

Sem a permissão restrita de incidente, H02 também omite os eventos correlacionáveis de I01/I02. Eventos técnicos genéricos de proteção podem aparecer sem identificador, origem ou metadado que permita inferir a existência de um incidente específico.

O perfil `Master completo` usado no protótipo representa um master que também recebeu todas as permissões opcionais; não transforma o acesso a incidentes em inerente ao papel.

## 31.2 Recuperação de TOTP com exatamente dois masters

**Recomendação:** manter a regra normal de dois masters aptos, com uma exceção controlada somente para recuperação de TOTP.

Se existirem exatamente dois masters aptos e um perder o autenticador:

1. O outro master reautentica com senha e TOTP próprios;
2. Informa justificativa;
3. Inicia a redefinição;
4. Todas as sessões do afetado são revogadas;
5. O afetado fica em `Master — reconfiguração de TOTP obrigatória` e sem acesso ao seletor, empresas ou funções globais;
6. O sistema mostra contingência degradada e bloqueia qualquer outra ação que reduza masters;
7. Após senha válida, uma autorização curta, auditada e de uso único cria uma sessão restrita exclusivamente à A03 para configurar o novo segredo; senha sozinha nunca libera outro recurso;
8. A conclusão restaura o estado apto e encerra a contingência.

Essa exceção não permite bloquear, inativar ou rebaixar um dos dois masters.

## 31.3 Janela de reautenticação crítica

**Recomendação:** considerar a reautenticação recente válida por **cinco minutos**, vinculada ao executor, ação, entidade, versão, escopo e resumo exibido.

Troca de empresa, alteração da entidade, mudança de versão, mudança do impacto, expiração, revogação ou encerramento da sessão invalida a confirmação imediatamente.

## 31.4 Promoção para master

**Recomendação:** depois da confirmação administrativa:

- revogar as sessões do promovido;
- preservar suas associações e perfis empresariais somente como metadados não efetivos para eventual revisão futura;
- colocar a conta em `Master — TOTP pendente`;
- exigir senha e configuração de TOTP antes de qualquer novo acesso ao sistema;
- contar a pessoa na contingência somente depois da configuração concluída.

Um rebaixamento futuro nunca restaura esses metadados automaticamente: exige nova revisão e atribuição explícita de empresas e perfis ainda vigentes.

## 31.5 Reativação e reenvio de primeiro acesso

**Recomendação:** incluir ações explícitas:

- `Reativar usuário`, exigindo situação, empresas, perfis e segurança válidos antes de liberar login;
- `Reenviar primeiro acesso`, invalidando imediatamente a credencial temporária anterior e criando nova validade de 24 horas.

As duas ações são auditadas e usam chave de repetição segura; um novo reenvio intencional continua permitido como nova solicitação. Reativar uma conta que ainda possua papel master é concessão crítica: exige reautenticação e justificativa do executor, TOTP válido do reativado antes do acesso global e respeito à contingência de dois masters.

## 31.6 Exportação em empresa inativa

**Recomendação:** permitir nova exportação como consulta histórica somente quando o usuário possuir permissão específica de exportar naquele CNPJ inativo.

A empresa permanece sem criação, edição, cálculo, confirmação ou nova movimentação. O arquivo é temporário, mas o pedido, a geração e o download continuam empresariais, carregam o `empresa_id` do CNPJ inativo e aparecem em H01 e no histórico correspondente. Nada disso reativa a empresa.

## 31.7 `Cancelado por desligamento` no checklist

**Recomendação:** tratar `Cancelado por desligamento` como terminal resolvido somente para grupo de adiantamento do empregado que:

- ainda não foi pago;
- foi cancelado por uma saída compatível;
- teve cada valor não oficial encaminhado ao pagamento final ou acerto correto; no oficial, teve o destino autoritativo do contador conferido sem migração calculada;
- possui origem, destino e justificativa registrados.

O estado não pode encerrar pagamento final, desligamento ou ajuste. Ele abrange dois modos explicitamente diferentes: cancelamento normal antes ou na data prevista e cancelamento manual posterior escolhido em `Decisão necessária`; o segundo nunca é automático e exige justificativa e permissões do destino.

## 31.8 Oficial mensal já pago antes de desligamento informado tardiamente

**Recomendação:** separar obrigação vigente de histórico financeiro:

- preservar para sempre a confirmação e o valor mensal efetivamente pagos;
- cancelar administrativamente apenas a obrigação oficial mensal que deixou de ser a referência vigente;
- registrar a rescisão oficial do contador como nova referência oficial;
- não criar ajuste, cobrança ou recibo interno sobre a diferença oficial;
- exigir conferência do usuário e do contador para marcar a situação oficial como resolvida.

Assim, o pagamento histórico e a rescisão podem coexistir no histórico, mas não como duas obrigações oficiais vigentes.

## 31.9 Correção de RA e reembolso por componente

**Recomendação:** apurar cada componente sem compensação silenciosa.

Se a mesma correção produzir RA adicional de R$ 100,00 e reembolso pago a maior de R$ 50,00:

- criar ajuste positivo de R$ 100,00, detalhando a RA;
- registrar diferença absorvida de R$ 50,00, detalhando o reembolso;
- não transformar o resultado em ajuste líquido de R$ 50,00.

O recibo do ajuste detalha apenas linhas positivas efetivamente pagas. O registro absorvido não gera recibo.

## 31.10 Período sem registro na competência aberta

**Recomendação:** calcular a linha da competência usando como final o primeiro limite aplicável entre:

1. dia anterior à admissão;
2. data da saída sem registro;
3. último dia da competência.

Se admissão e saída ainda não existirem, usar o fim da competência mesmo enquanto ela estiver aberta. Mudança antes do pagamento permite recálculo; mudança depois do pagamento exige F04. Nenhuma linha atravessa duas competências.

## 31.11 Tabela-verdade do D30

**Recomendação:** a matriz formal deverá incluir exemplos executáveis para:

- fevereiro com 28 e 29 dias;
- meses de 30 e 31 dias;
- início ou fim nos dias 15, 16, 28, 29, 30 e 31;
- um único dia;
- início e saída na mesma competência;
- intervalo atravessando competências;
- mudança de valor MEI no meio do mês;
- período sem registro antes da admissão.

Cada exemplo informará entrada, dias D30, memória e resultado monetário esperado.

## 31.12 Estado `Decisão necessária`

**Recomendação:** quando a saída ocorrer depois da data prevista do adiantamento e o grupo ainda não tiver sido pago, D03 não decide automaticamente. O usuário autorizado escolhe uma das opções:

1. **Pagar o adiantamento atrasado quando o grupo permitir:** manter o evento `Adiantamento`, informar data efetiva e emitir os recibos internos aplicáveis;
2. **Cancelar e encaminhar ao destino:** cancelar manualmente o adiantamento por desligamento e encaminhar cada verba ao seu destino compatível.

A decisão é tomada por grupo:

- Oficial em demissão formal segue a rescisão do contador; adiantamento oficial atrasado só pode ser registrado com orientação expressa do contador, evitando obrigação duplicada;
- RA pode ser paga como adiantamento e depois deduzida da própria RA no acerto, ou encaminhada ao acerto;
- Complementos e período sem registro podem ser pagos atrasados ou encaminhados integralmente aos respectivos grupos finais;
- Cada grupo preserva seu recibo próprio e nunca deduz outra verba.

MEI não participa desta decisão trabalhista: encerramento contratual permanece em M03/M04 e segue as regras da última competência do contrato.

A primeira opção exige permissão de confirmar o grupo. A segunda exige as permissões de cancelar o adiantamento e operar o destino. Ambas exigem justificativa e auditoria.

## 31.13 Líquido que desconta adiantamento oficial não pago

**Recomendação:** K06 deve marcar a linha como `Inconsistente` e bloquear a confirmação do oficial final quando:

- o líquido do contador considera o adiantamento oficial;
- o adiantamento não consta como efetivamente pago nem como saldo inicial K07.

A inconsistência termina quando o adiantamento é confirmado corretamente, K07 comprova o pagamento anterior ou o contador fornece um valor oficial corrigido.

## 31.14 Alteração de valor MEI durante vigência ativa

**Recomendação:** não editar destrutivamente o valor vigente.

- Se a nova data ainda não afetou competência ou pagamento, criar nova vigência a partir da data informada e encerrar a anterior no dia precedente;
- Dividir a competência por D30 quando a mudança ocorrer no meio do mês;
- Impedir sobreposição e soma acima de 30 dias;
- Se a competência estiver aberta e o evento ainda não tiver sido pago, recalcular normalmente apenas o escopo editável;
- Se já houver pagamento ou a competência estiver fechada, iniciar F04;
- Alteração retroativa nunca reescreve recibo ou confirmação.

## 31.15 Passagem de `Calculado` para `Pronto`

**Recomendação:** exigir ação explícita `Concluir conferência`, individual ou em lote homogêneo, por usuário autorizado.

O sistema só permite a ação quando memória, dados obrigatórios, valor final e versão estiverem válidos. Somente `Pronto para pagamento` pode ser confirmado. Recalcular devolve o grupo para `Calculado` e exige nova conferência.

## 31.16 Supressão do alerta de ASO

**Recomendação:** resolver a ocorrência somente quando a condição de alerta realmente terminar, por exemplo por vínculo inativo, exame invalidado sem nova referência ativa ou ausência de referência:

- resolver a notificação vigente com motivo derivado;
- preservar a ocorrência por 90 dias;
- não apagar prazo histórico;
- criar nova ocorrência somente quando uma condição já resolvida reaparecer como uma nova ocorrência lógica.

Substituir a versão do mesmo exame não resolve automaticamente o alerta. Se a versão atual continuar vencendo ou vencida, a mesma ocorrência lógica é atualizada; se outra referência ativa assumir a mesma condição, a rotina reconcilia a chave antes de decidir entre atualizar ou resolver.

## 31.17 Pendência demissional e não comparecimento

**Recomendação:** manter no máximo uma notificação ativa do tipo estável `Pendência de ASO demissional` por acompanhamento demissional.

Ao mudar para `Não compareceu`, a mesma ocorrência recebe novo resumo, subestado e urgência, em vez de mudar o tipo ou criar outra notificação. Reagendamento pode levar o acompanhamento de `Não compareceu` para `Agendado` na mesma ocorrência. Realização ou encerramento autorizado resolve a ocorrência; cancelamento do desligamento programado a resolve como cancelada, preservando a linha do tempo.

## 31.18 Exportação de versões de ASO

**Recomendação:** a exportação padrão de S01 deve refletir as linhas visíveis e incluir somente a versão atual de cada exame, seja ela vigente ou invalidada.

Versão atual invalidada entra como uma linha marcada `Invalidada` quando estiver visível pelos filtros. Somente versões substituídas ficam restritas a S04, histórico e auditoria e não entram no Excel operacional da primeira versão.

## 31.19 Reabertura de incidente

**Recomendação:** a transição aprovada será:

```text
Concluído → Em tratamento
```

A conclusão anterior permanece na linha do tempo. A reabertura exige permissão, reautenticação, justificativa e nova entrada auditada.

## 31.20 Identidade lógica da notificação

**Recomendação:** separar identidade da condição e recorrência:

```text
chave da condição = empresa + tipo estável + entidade de origem + discriminadores do domínio
```

Os discriminadores podem ser competência, grupo, evento, acompanhamento ou referência de vencimento, conforme o tipo. Existe no máximo uma ocorrência ativa por chave da condição. Um número sequencial de ocorrência é incrementado somente quando a condição já resolvida reaparece.

Essa separação impede duplicação diária da mesma condição sem impedir uma nova ocorrência independente depois de a anterior ter sido resolvida.

---

# 32. Definições ainda necessárias antes da produção

Não são decisões funcionais bloqueadoras da matriz, do modelo de dados ou do início da arquitetura técnica:

- nomes dos responsáveis e substitutos do plano de incidentes;
- plataforma de hospedagem;
- provedor de e-mail transacional;
- fronteira técnica transacional da confirmação em lote, preservando a regra funcional aprovada;
- granularidade técnica da revogação — todas as sessões do usuário ou somente autorizações empresariais afetadas — sem aceitar cache obsoleto;
- classificação e retenção mínima necessária de IP e identificação de navegador nos eventos de segurança;
- responsáveis nominais pela homologação contábil, jurídica e operacional;
- competência inicial real;
- data e janela de implantação;
- política de arquivamento ou eliminação após o mínimo de seis anos;
- parâmetros e fornecedor da melhoria futura MF-01, somente se ela for priorizada.

---

# 33. Critérios de aprovação desta consolidação

O Documento 16 estará aprovado quando o usuário confirmar:

- a visão única do sistema;
- os quatro contextos de acesso;
- os seis itens do menu empresarial;
- o inventário das 60 telas e subfluxos;
- as fontes únicas e projeções;
- os ciclos de empregado e MEI;
- o modelo de competência, grupos e pagamentos;
- correções, ajustes e recibos;
- desligamento e acerto de RA;
- ASO, clínicas e notificações;
- auditoria, usuários, perfis e incidentes;
- segurança, exportações, retenção e implantação;
- as quinze normalizações da seção 29;
- as vinte propostas de fechamento da seção 31;
- os dezoito blocos previstos para a matriz formal.

**Situação atual:** consolidação final aprovada integralmente pelo usuário em 21/08/2026, incluindo as vinte propostas de fechamento da seção 31.  
**Próxima etapa autorizada:** produzir o Documento 17 — Matriz Formal de Estados e Transições.
