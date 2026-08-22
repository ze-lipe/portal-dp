# Sistema Web de Departamento Pessoal

## Documento Mestre de Planejamento Funcional

**Versão:** 1.0 — planejamento aprovado e refinado pelos protótipos  
**Situação:** Lotes 1 a 7, Documentos 16 a 21A, pacote 22/22A–22D e pacote 23/23A–23D aprovados integralmente; `ETP-00` é a próxima etapa  
**Abrangência:** Cenários 1 a 10 e auditoria geral aprovada  

> Este documento é a fonte oficial do planejamento funcional. Quando houver divergência com rascunhos, anotações ou documentos anteriores, prevalece a regra aqui consolidada.

## Mapa de leitura

- **Fundamentos do produto:** seções 1 a 10;
- **Empregado, competência e pagamentos:** seções 11 a 22;
- **Prestador MEI e ASO:** seções 23 e 24;
- **Painel, notificações, Excel e auditoria:** seções 25 a 29;
- **Arquitetura, operação e implantação:** seções 30 a 34;
- **Aceite, testes e próximos passos:** seções 35 a 38.

---

# 1. Visão executiva

O produto será um sistema web interno de Departamento Pessoal para controlar empregados e prestadores MEI de um grupo empresarial composto inicialmente por três CNPJs.

O sistema deverá centralizar cadastros, condições financeiras, competências, pagamentos internos, recibos, desligamentos, ASOs, clínicas, notificações e auditoria, sem tentar substituir a folha oficial produzida pela contabilidade.

O porte esperado da primeira versão é:

- Aproximadamente 65 vínculos ativos;
- Aproximadamente 300 vínculos inativos ao longo do histórico;
- Até 10 usuários simultâneos;
- Três empresas iniciais, com possibilidade de cadastrar outras;
- Uso exclusivamente interno, sem comercialização do sistema.

## 1.1 Objetivos

- Manter os dados de cada CNPJ rigorosamente separados;
- Carregar e operar somente a empresa selecionada;
- Controlar acesso por usuário, perfil, tela, ação e campo;
- Preservar todo o histórico relevante;
- Calcular apenas os valores internos expressamente definidos neste documento;
- Registrar o líquido oficial informado pela contabilidade sem recalculá-lo;
- Evitar pagamento duplicado, perda de valor e alteração destrutiva;
- Facilitar a rotina mensal com conferência, confirmação em lote e recibos;
- Controlar ASOs de forma informativa, com o mínimo necessário de dados;
- Oferecer rastreabilidade por auditoria e documentos versionados;
- Manter desempenho simples e previsível para o porte da empresa.

## 1.2 Princípios obrigatórios

1. Uma única empresa ativa por sessão;
2. Isolamento multiempresa também no banco de dados;
3. Nenhum cálculo oficial de folha ou rescisão;
4. Valores pagos nunca são apagados ou sobrescritos;
5. Correções preservam original, justificativa e versões;
6. Recibos são privados, imutáveis e substituídos por novos documentos;
7. Permissões são validadas no servidor;
8. Campos ocultos não podem ser inferidos por filtros, totais ou exportações;
9. Estado operacional deve ser derivado sempre que possível;
10. O sistema não toma decisões jurídicas, médicas ou contábeis;
11. Nenhuma funcionalidade fora do escopo deve influenciar a arquitetura da primeira versão.

---

# 2. Escopo da primeira versão

## 2.1 Incluído

- Login, recuperação de senha e segurança da conta;
- TOTP obrigatório para masters, compatível com Google Authenticator e aplicativos equivalentes;
- Dois usuários masters aptos;
- Seleção e troca de empresa;
- Cadastro de empresa no seletor por usuário autorizado;
- Usuários, perfis e permissões;
- Permissões por tela, ação e campo;
- Cadastro e histórico de empregados;
- Cadastro, contratos e renovações de prestadores MEI;
- Endereço com busca por CEP e preenchimento manual;
- Salário-base oficial;
- Remuneração adicional;
- Total acordado derivado;
- Salário redondo e reembolsos manuais;
- Complementos recorrentes e avulsos do empregado;
- Período sem registro;
- Competências mensais;
- Adiantamento e pagamento final;
- Datas previstas e datas efetivas;
- Entrada manual do líquido do contador;
- Cálculos automáticos aprovados;
- Edição autorizada de cálculos com justificativa;
- Confirmações independentes por grupo;
- Correções e ajustes financeiros;
- Recibos privados em PDF;
- Desligamento formal e desligamento sem registro;
- Rescisão oficial informada pelo contador;
- Acerto complementar calculado somente sobre a remuneração adicional;
- Cadastro de clínicas compartilhadas;
- ASOs admissionais, periódicos, de retorno, de mudança de riscos ocupacionais e demissionais;
- Alertas internos de ASO;
- Painel da empresa selecionada;
- Central interna de notificações;
- Exportações Excel;
- Histórico contextual;
- Auditoria empresarial e global;
- Registro simples de incidentes;
- Backup, restauração e controles de segurança;
- Implantação por competência de corte.

## 2.2 Fora do escopo

- Autocadastro de usuários;
- Portal do empregado ou do prestador;
- Aplicativo móvel nativo;
- Controle de férias como módulo;
- Controle de ocorrências, afastamentos ou licenças;
- Controle de cartão de ponto;
- Cálculo de horas ou horas extras;
- Relatório gerencial de ocorrências;
- Folha oficial completa;
- Cálculo automático de INSS, Imposto de Renda ou sindicato;
- Cálculo da rescisão oficial;
- Importação de holerites ou planilhas;
- Integração bancária;
- Dados bancários;
- Integração com contabilidade;
- Integração com eSocial;
- Nota fiscal de MEI;
- Armazenamento de número ou data de nota fiscal;
- Assinatura digital;
- Upload de comprovante de pagamento;
- PDF, imagem ou anexo do ASO;
- Diagnóstico, CID ou prontuário;
- Médico, CRM ou descrição clínica da restrição;
- Grau de risco da empresa;
- Dispensa automática ou sugerida de ASO demissional;
- Agenda operacional completa de ASO, com data, horário, local, reagendamento e cancelamento;
- Lembretes externos ao colaborador por WhatsApp, e-mail ou SMS;
- Painel financeiro consolidado entre CNPJs;
- Histórico financeiro anterior à competência de corte;
- Exceções individuais de permissão fora dos perfis;
- Exclusão física de histórico;
- Motor avançado de aprovação;
- Microsserviços, banco separado por CNPJ ou infraestrutura distribuída.

## 2.3 Validações externas antes da produção

O contador e o jurídico da empresa deverão homologar:

- Exemplos de cálculo;
- Fórmulas do período sem registro;
- Fórmulas do acerto complementar da remuneração adicional;
- Textos e apresentação dos recibos;
- Terminologia utilizada para empregado e prestador MEI.

Essa homologação não altera a regra do sistema sem uma mudança formal deste documento.

## 2.4 Catálogo de melhorias futuras

### MF-01 — Agendamento de ASO e lembretes ao colaborador

**Situação:** melhoria futura registrada em 21/08/2026; não integra a primeira versão nem altera o Lote 6 aprovado.

**Objetivo:** evoluir o estado operacional `Agendado` para uma agenda real e permitir lembretes automáticos ao colaborador antes do exame.

Escopo a ser estudado quando a melhoria for priorizada:

- Data, horário, clínica, endereço ou orientação de comparecimento;
- Criação, reagendamento e cancelamento com histórico imutável;
- Um ou mais lembretes configuráveis, sem envio duplicado;
- WhatsApp, e-mail e SMS como canais possíveis;
- Canal preferencial por colaborador e eventual canal de contingência;
- Estados `Programado`, `Enviado`, `Entregue`, `Falhou`, `Cancelado` e `Dispensado` para cada tentativa de comunicação;
- Nova tentativa controlada, idempotência e registro do provedor;
- Confirmação de que telefone e e-mail continuam atuais antes de ativar os envios;
- Permissões próprias para administrar agenda, modelos, canais e reenvios;
- Auditoria de agendamento, reagendamento, cancelamento e comunicação;
- Mensagem mínima, sem resultado, restrição, diagnóstico, CID ou qualquer informação clínica desnecessária.

Recomendação preliminar para o estudo futuro:

1. Avaliar WhatsApp como canal principal, por ser uma comunicação operacional direta;
2. Usar e-mail como canal alternativo quando houver endereço confirmado;
3. Reservar SMS como contingência para telefone sem WhatsApp ou falha do canal principal.

A escolha definitiva permanece pendente de comparação de custo, cobertura, fornecedor, regras de uso, modelos aprovados, entrega, transparência ao titular e validação jurídica. Nenhum canal será ativado automaticamente apenas porque existe telefone ou e-mail no cadastro.

---

# 3. Glossário oficial

| Termo | Definição |
|---|---|
| Empresa ativa | Único CNPJ selecionado e carregado na sessão operacional. |
| Competência | Mês de referência dos cálculos e pagamentos. |
| Competência de corte | Primeiro mês financeiro controlado pelo sistema. |
| Pessoa | Cadastro civil reutilizado em vínculos do mesmo empregado. |
| Vínculo | Relação de um empregado com uma empresa. Recontratação cria novo vínculo. |
| Prestador MEI | Pessoa jurídica contratada, identificada pelo CNPJ. Não é empregado no sistema. |
| Contrato MEI | Relação contratual do prestador com uma empresa. |
| Vigência MEI | Período financeiro dentro do contrato, inclusive uma renovação contínua. |
| Salário-base oficial | Valor bruto mensal que consta ou constará no holerite. |
| Líquido do contador | Valor líquido informado manualmente a partir do holerite ou rescisão oficial. |
| Remuneração adicional — RA | Valor mensal fixo acordado fora do holerite para completar o salário total. |
| Total acordado | Salário-base oficial mais remuneração adicional. É derivado e não editável. |
| Complemento | Valor adicional do empregado, recorrente ou avulso, integral por competência. |
| Salário redondo | Marcador de que descontos reais do holerite poderão ser reembolsados. Não arredonda valores. |
| Reembolso | Valor manual relativo aos descontos efetivamente identificados no holerite. |
| Período sem registro | Período entre o início das atividades e a admissão, ou até a saída sem registro. |
| Grupo financeiro | Conjunto de componentes confirmado integralmente em um evento. |
| Evento | Momento de adiantamento, pagamento final, desligamento ou ajuste. |
| Confirmação | Registro de que o valor integral do grupo foi efetivamente pago. |
| Não aplicável | Estado auditado de um grupo cujo valor devido é zero. |
| Ajuste positivo | Diferença adicional a pagar depois de uma correção. |
| Diferença absorvida | Valor pago a maior encerrado sem cobrança ou compensação futura. |
| Rescisão oficial | Líquido informado pelo contador no desligamento formal. |
| Acerto complementar | Cálculo interno de desligamento realizado somente sobre a RA. |
| Serviço adicional MEI | Valor avulso por serviço extra, devido somente no pagamento final da competência. |
| Renovação programada | Próxima vigência MEI confirmada antes do término, sem renovação silenciosa. |
| ASO | Registro informativo de exame ocupacional, sem armazenamento do documento. |
| Retificação | Nova versão que corrige um registro, preservando a versão anterior. |
| Histórico contextual | Visão filtrada da auditoria dentro de empregado, MEI, ASO ou outro registro. |
| Snapshot | Fotografia imutável dos dados utilizados em cálculo, confirmação ou documento. |
| Delta de implantação | Mudanças reais ocorridas entre o snapshot inicial da carga e o congelamento final, aplicadas sem inventar histórico. |

---

# 4. Atores e responsabilidades

## 4.1 Master

- Papel sistêmico global;
- Acesso a todas as empresas atuais e futuras;
- Obrigação de selecionar uma empresa para operações empresariais;
- Administração exclusiva de usuários, perfis e papel master;
- Acesso à auditoria global;
- TOTP obrigatório;
- Não depende de perfil empresarial;
- Não pode ser inativado ou rebaixado se isso deixar menos de dois masters aptos, salvo a contingência formal e estrita `B03-MST-06`.

## 4.2 Usuário interno

- Acessa somente empresas associadas;
- Possui exatamente um perfil em cada empresa;
- Opera somente telas, ações e campos autorizados;
- Não administra usuários ou perfis;
- Pode receber um perfil global limitado para funções compartilhadas.

## 4.3 Usuário com permissão global

Pode receber, conforme configuração do master:

- Permissão para cadastrar empresa;
- Permissão para cadastrar ou editar clínicas compartilhadas;
- Permissão para exportar o catálogo de clínicas.

Uma permissão global não concede acesso aos dados operacionais de todas as empresas.

## 4.4 Contador

É fonte externa do líquido do holerite e da rescisão oficial. Não é usuário obrigatório do sistema e não transfere ao sistema a responsabilidade de calcular a folha.

## 4.5 Empregado e prestador MEI

São registros administrados pelos usuários internos. Não possuem acesso ao sistema na primeira versão.

---

# 5. Multiempresa e empresas

## 5.1 Contexto ativo

- Após o login, o usuário escolhe uma empresa autorizada;
- Uma única empresa fica ativa;
- Todas as consultas, cálculos, arquivos e notificações usam esse contexto;
- Trocar empresa retorna ao seletor;
- A troca limpa os dados e filtros da empresa anterior;
- Uma aba antiga não pode salvar depois da troca;
- Masters também escolhem uma empresa para operar;
- Não existe filtro de empresa dentro das telas operacionais;
- Não existe carregamento conjunto dos três CNPJs.

## 5.2 Cadastro da empresa

Campos:

| Campo | Tipo | Obrigatório | Regra |
|---|---|---:|---|
| Razão social | Texto | Sim | Identificação jurídica. |
| Nome fantasia | Texto | Sim | Nome de apresentação. |
| CNPJ | Texto | Sim | Validado segundo o formato vigente e único no sistema. |
| Logo | Imagem | Não | PNG ou JPEG, até 2 MB. |
| Percentual padrão de adiantamento | Percentual | Sim | Padrão inicial de 40%, editável. |
| Dia sugerido do adiantamento | Número | Não | Normalmente 20, 21 ou 22; apenas sugestão para a competência. |
| Dia sugerido do pagamento final | Número | Não | Normalmente 5 ou 6 do mês seguinte; apenas sugestão. |
| Competência inicial | Mês/ano | Sim | Primeiro mês financeiro do sistema. |
| Modelo de perfil do criador | Referência | Sim | Modelo global configurado pelo master e copiado para a nova empresa. |
| Situação | Estado | Sim | Ativa ou inativa. |

Regras:

- A empresa pode ser criada no seletor por usuário com permissão global;
- O criador comum recebe automaticamente uma cópia empresarial do modelo de perfil padrão;
- O perfil padrão não concede gestão de usuários;
- Masters recebem acesso automaticamente;
- Empresa com competência, pagamento, ajuste ou desligamento pendente não pode ser inativada;
- Inativação impede novas operações, mas preserva a consulta histórica;
- Empresa nunca é excluída fisicamente.

## 5.3 Logo

- O conteúdo real do arquivo será validado;
- Metadados desnecessários serão removidos;
- O logo usado em um recibo ficará no snapshot do documento;
- Trocar o logo não altera recibos já emitidos.

---

# 6. Autenticação, usuários e Minha Conta

## 6.1 Telas de acesso

- Login;
- Primeiro acesso e troca de senha temporária;
- Configuração TOTP para master;
- Recuperação de senha;
- Seleção de empresa;
- Minha Conta.

## 6.2 Usuário

Campos:

| Campo | Obrigatório | Regra |
|---|---:|---|
| Nome | Sim | Nome do usuário interno. |
| E-mail | Sim | Único globalmente e comparado sem diferença entre maiúsculas e minúsculas. |
| Situação | Sim | Ativo, bloqueado ou inativo. |
| Papel master | Sim | Sim ou não, protegido pelas regras de contingência. |
| Empresas autorizadas | Condicional | Não exigidas para master. |
| Perfil por empresa | Condicional | Exatamente um para cada associação de usuário comum. |
| Perfil global | Não | Somente funções globais delegadas. |

Não existe autocadastro. Somente master cria, ativa, bloqueia ou inativa usuários.

## 6.3 Política de senha

- Mínimo de 10 caracteres;
- Senha temporária válida por 24 horas;
- Troca obrigatória no primeiro acesso;
- Link de recuperação válido por 30 minutos;
- Token de recuperação de uso único;
- Bloqueio por 15 minutos após cinco tentativas inválidas;
- Mensagem de login e recuperação não revela se o e-mail existe;
- Troca ou recuperação de senha revoga as sessões anteriores.

## 6.4 TOTP

- Obrigatório somente para masters;
- Compatível com Google Authenticator e aplicativos equivalentes;
- Configurado por QR Code e confirmação de código;
- Códigos de recuperação de uso único;
- Um master pode redefinir o TOTP do outro após reautenticação e justificativa;
- Reset de TOTP encerra sessões e gera auditoria;
- Segredo e códigos nunca aparecem no histórico.

## 6.5 Sessão

- Expiração após 30 minutos de inatividade;
- Aviso aos 25 minutos;
- Duração máxima contínua de 8 horas;
- Sem opção de manter conectado;
- Atualização automática do painel não renova a sessão;
- Bloqueio, troca de senha, mudança de perfil ou revogação encerram o acesso;
- Troca de empresa não amplia a duração da sessão.

## 6.6 Minha Conta

Permite:

- Visualizar nome e e-mail;
- Alterar a senha informando a senha atual;
- Configurar e confirmar TOTP quando aplicável;
- Gerar novos códigos de recuperação após reautenticação;
- Encerrar outras sessões;
- Sair.

Não permite:

- Alterar o próprio perfil;
- Alterar empresas autorizadas;
- Promover-se a master;
- Alterar o próprio e-mail sem fluxo administrativo;
- Remover a proteção TOTP de um master sem recuperação válida.

## 6.7 E-mails na primeira versão

E-mails serão usados somente para:

- Convite ou primeiro acesso;
- Recuperação de senha.

Alertas de competência, pagamento, ASO ou desligamento não serão enviados por e-mail.

A melhoria futura `MF-01` poderá acrescentar lembretes externos de agendamento de ASO depois de estudo próprio de canal, fornecedor, transparência, segurança e governança.

---

# 7. Perfis e permissões

## 7.1 Modelo

- Perfis empresariais pertencem a uma empresa;
- Um perfil pode ser reutilizado por vários usuários da empresa;
- Usuário comum possui um perfil por empresa;
- Não existem exceções individuais na primeira versão;
- Perfis globais controlam apenas ações globais;
- Master é um papel sistêmico fora dos perfis;
- Novos módulos e campos entram negados por padrão.

## 7.2 Dimensões

### Tela

Define se a tela aparece e pode ser acessada.

### Ação

Exemplos:

- Visualizar;
- Criar;
- Editar;
- Inativar;
- Calcular;
- Confirmar pagamento;
- Marcar não aplicável;
- Cancelar confirmação;
- Reabrir competência;
- Sobrescrever cálculo;
- Retificar;
- Exportar;
- Baixar documento;
- Consultar histórico.

### Campo

Estados:

- Oculto;
- Mascarado;
- Visível sem edição;
- Visível e editável.

## 7.3 Dependências

- Editar exige visualizar;
- Exportar exige visualizar os campos exportados;
- Baixar exige acesso ao documento;
- Campo editável também exige a ação correspondente;
- Cancelar pagamento não é concedido automaticamente com confirmar;
- Sobrescrever exige acesso ao cálculo e à memória;
- Retificar ASO exige acesso ao registro vigente;
- Perfil com permissão de criar deve poder preencher todos os campos obrigatórios;
- Campo oculto não pode aparecer em filtro, total, histórico ou Excel;
- Campo mascarado é mascarado antes de chegar ao navegador;
- Total derivado é ocultado quando permitir inferir um componente restrito.

## 7.4 Administração

- Exclusiva dos masters;
- Perfis podem ser duplicados para facilitar a configuração das empresas;
- O master pode manter um modelo empresarial usado somente para iniciar empresas novas; alterações futuras no modelo não mudam perfis já copiados;
- O sistema mostra quantos usuários utilizam o perfil;
- Perfil atribuído não é apagado; pode ser arquivado;
- Alteração de perfil passa a valer imediatamente;
- Mudanças críticas exigem justificativa e auditoria.

---

# 8. Mapa de módulos e telas

| Módulo | Tela ou função principal |
|---|---|
| Acesso | Login, primeiro acesso, TOTP e recuperação. |
| Seleção de empresa | Empresas autorizadas, entrada no contexto e cadastro autorizado. |
| Painel | Indicadores da empresa e competência selecionada. |
| Colaboradores | Lista de empregados e prestadores MEI com filtros por tipo e situação. |
| Empregado | Cadastro, vínculo, remuneração, pagamentos, ASOs e histórico. |
| Prestador MEI | Cadastro, contratos, renovações, pagamentos e histórico. |
| Competências | Participantes, cálculos, grupos, eventos, ajustes e fechamento. |
| Pagamentos | Visão por competência, evento, grupo e participante. |
| Desligamentos | Desligamento, rescisão oficial e acerto complementar. |
| Recibos | Consulta, prévias, emitidos, cancelados e substitutos. |
| ASO | Controle de exames, pendências, prazos e versões. |
| Clínicas | Catálogo compartilhado dentro do controle de ASO. |
| Notificações | Pendências e alertas internos. |
| Auditoria | Eventos da empresa e auditoria global master-only. |
| Usuários e perfis | Administração exclusiva dos masters. |
| Minha Conta | Segurança da própria conta. |
| Incidentes | Registro simples e restrito. |

## 8.1 Fluxo principal

1. Login;
2. TOTP, quando o usuário for master;
3. Seleção da empresa;
4. Painel da empresa;
5. Navegação pelos módulos autorizados;
6. Retorno ao seletor para trocar empresa.

## 8.2 Lista de colaboradores

- Uma lista operacional com filtro por Empregado ou MEI;
- Pesquisa por nome e documento conforme permissão;
- Ativos exibidos por padrão;
- Inativos acessados por filtro;
- Paginação;
- Acesso ao detalhe próprio de cada tipo;
- Cadastro de novo empregado ou MEI conforme permissão;
- Exportação conforme permissão específica.

---

# 9. Estados e convenções gerais

## 9.1 Datas

- Datas de negócio são armazenadas como datas, sem horário;
- Auditoria usa data e hora;
- A zona operacional é `America/Sao_Paulo`;
- Competência é armazenada como mês/ano;
- Datas previstas e efetivas são campos diferentes;
- Data final de vínculo ou contrato é inclusiva.

## 9.2 Valores

- Valores monetários usam decimal, nunca ponto flutuante;
- A terceira casa decimal é arredondada normalmente para centavos;
- Não existe arredondamento especial de complemento;
- Cálculos intermediários preservam precisão;
- Cada componente é consolidado em centavos;
- A primeira parcela é arredondada;
- A parcela final é calculada por diferença, absorvendo eventual centavo residual.

## 9.3 Estados derivados

Sempre que possível, situações como ativo, inativo, vencido, em alerta, total acordado e restrição serão derivadas dos dados de origem, e não livremente digitadas.

## 9.4 Integridade

- Nenhum registro histórico relevante é excluído fisicamente;
- Um cancelamento não apaga o que aconteceu;
- Uma retificação cria nova versão;
- Um pagamento efetivo permanece registrado mesmo quando sua confirmação documental é substituída;
- Toda ação sensível registra auditoria na mesma operação.

---

# 10. Convenção comercial de 30 dias — D30

Todos os cálculos proporcionais usarão uma única função de dias comerciais.

## 10.1 Regras

- Divisor fixo 30;
- Datas inicial e final inclusivas;
- Dia 31 equivale ao dia comercial 30;
- Último dia de fevereiro equivale ao dia comercial 30;
- Fevereiro completo equivale a 30 dias;
- Mês de 31 dias completo equivale a 30 dias;
- Intervalo de um dia equivale a um dia;
- Um intervalo dentro da competência nunca ultrapassa 30 dias;
- Intervalos atravessando competências são divididos mês a mês.

## 10.2 Exemplos oficiais

| Intervalo | Dias D30 |
|---|---:|
| Dia 1 ao último dia do mês | 30 |
| Dia 15 ao último dia do mês | 16 |
| Dia 16 ao último dia do mês | 15 |
| Dia 1 a dia 14 | 14 |
| Mesma data inicial e final | 1 |
| Fevereiro inteiro | 30 |
| Dia 1 a dia 31 | 30 |

Os mesmos exemplos deverão ser utilizados nos testes automatizados e na homologação do usuário.

---

# 11. Empregado — cadastro, pessoa e vínculo

## 11.1 Pessoa

Campos:

| Campo | Tipo | Obrigatório | Regra |
|---|---|---:|---|
| Nome completo | Texto | Sim | Aceita acentos, espaços, hífen e apóstrofo. |
| CPF | Texto | Sim | Validado, preservando zeros e aceitando digitação com ou sem máscara. |
| CEP | Texto | Sim | Oito dígitos; consulta externa é apenas uma sugestão. |
| Logradouro | Texto | Sim | Preenchido pelo CEP ou manualmente. |
| Número | Texto | Sim | Aceita número ou `S/N`. |
| Complemento | Texto | Não | Informação adicional do endereço. |
| Bairro | Texto | Sim | Preenchido ou confirmado pelo usuário. |
| Cidade | Texto | Sim | Preenchido ou confirmado pelo usuário. |
| Estado | Seleção | Sim | Unidade federativa. |

Regras:

- Um CPF representa uma pessoa dentro da empresa;
- O mesmo CPF não é duplicado na mesma empresa;
- O mesmo CPF pode existir em outro CNPJ sem revelar a existência entre empresas;
- Recontratação reutiliza a pessoa e cria novo vínculo;
- Nome, CPF e endereço mantêm histórico;
- Correção de CPF com histórico financeiro exige permissão e justificativa;
- Falha da busca de CEP não impede preenchimento manual.

## 11.2 Vínculo

Campos:

| Campo | Obrigatório | Regra |
|---|---:|---|
| Empresa | Sim | Definida pelo contexto ativo. |
| Pessoa | Sim | Referência ao cadastro civil. |
| Data de início das atividades | Sim | Primeiro dia efetivo de atividade. |
| Data de admissão/registro no eSocial | Não | A mesma data representa admissão formal e registro. |
| Data de desligamento sem registro | Não | Usada somente quando nunca houve admissão. |
| Data de demissão formal | Não | Usada somente quando existe admissão. |
| Situação | Derivada | Calculada a partir das datas. |

Validações:

- A admissão não pode anteceder o início das atividades;
- Desligamento sem registro exige ausência de admissão;
- Demissão formal exige admissão;
- Os dois tipos de encerramento não podem coexistir;
- A data final não pode anteceder a data inicial correspondente;
- Não pode haver dois vínculos ativos ou sobrepostos do mesmo CPF na mesma empresa;
- Novo vínculo somente depois do encerramento efetivo do anterior;
- Data futura programa o início ou o encerramento;
- O vínculo continua operacional até a data final inclusiva;
- Depois da data final, o vínculo é inativado automaticamente;
- A inativação não bloqueia pagamentos, correções ou documentos da última competência.

Situações derivadas:

- Futuro;
- Ativo sem registro;
- Ativo registrado;
- Encerramento programado;
- Encerrado sem registro;
- Demitido formalmente.

## 11.3 Recontratação

Ao informar um CPF já existente e com vínculo encerrado:

1. O sistema identifica a pessoa;
2. Informa que existe vínculo anterior;
3. Oferece `Criar novo vínculo`;
4. Não copia pagamentos ou condições automaticamente;
5. Mantém acesso separado ao histórico de cada vínculo.

Um vínculo anterior ao início do sistema não precisa ser reconstruído. Se a pessoa não estiver na base de corte, sua contratação futura poderá ser registrada como primeiro vínculo conhecido pelo sistema.

## 11.4 Histórico dentro do empregado

A tela do empregado apresentará uma área de histórico com filtros para:

- Dados pessoais;
- Endereço;
- Datas do vínculo;
- Salário-base;
- Remuneração adicional;
- Complementos;
- Salário redondo e reembolsos;
- Competências e pagamentos;
- Desligamento;
- ASOs;
- Recibos.

Essa área é uma visão contextual da auditoria única, e não um histórico paralelo.

---

# 12. Condições financeiras do empregado

## 12.1 Salário-base oficial

Definição: valor bruto mensal informado para o holerite.

Campos:

- Valor mensal;
- Competência inicial de vigência;
- Competência final, quando encerrado;
- Percentual individual de adiantamento, quando existir exceção;
- Usuário e data da alteração;
- Justificativa quando a alteração for correção.

Regras:

- Valor maior que zero;
- Histórico por versão;
- Vigências não podem se sobrepor;
- Alteração em uma competência vale para a competência inteira;
- O sistema não gera diferença oficial automática de reajuste;
- O líquido informado pelo contador já contém a diferença oficial aplicável;
- Dependências calculadas pelo próprio sistema, como período sem registro, podem ser recalculadas;
- Evento já pago somente é alterado pelo fluxo formal de correção.

## 12.2 Líquido do contador

- Digitado colaborador por colaborador;
- Não será importado;
- Já vem descontando o adiantamento oficial;
- Já contém eventuais diferenças oficiais do salário-base;
- Não contém RA, complementos ou reembolsos;
- Não é decomposto nem recalculado;
- Não se desconta novamente o adiantamento;
- Na competência de desligamento formal, é substituído pelo líquido da rescisão oficial.

Se não houver adiantamento oficial efetivamente pago e o holerite aparentar considerá-lo, o sistema apresentará um aviso para conferência antes do pagamento final.

## 12.3 Percentual de adiantamento

- Padrão da empresa: inicialmente 40%;
- Pode ser alterado por empresa;
- Pode ter exceção por empregado;
- Exceção possui vigência por competência;
- Pagamento dividido exige percentual maior que 0% e menor que 100%;
- 100% em um único evento é representado como parcela única, não como divisão 0%/100%.

## 12.4 Remuneração adicional — RA

Definição: valor mensal fixo acordado fora do holerite para completar o salário.

Campos:

| Campo | Obrigatório | Regra |
|---|---:|---|
| Valor mensal | Sim | Pode ser zero quando não houver RA. |
| Competência inicial | Sim, se valor positivo | Início da versão. |
| Competência final | Não | Opcional para encerramento programado. |
| Forma de pagamento | Sim | Uma ou duas parcelas. |
| Evento da parcela única | Condicional | Adiantamento ou pagamento final. |
| Percentual do adiantamento | Condicional | Obrigatório quando houver duas parcelas. |

Regras:

- Uma versão vigente por competência;
- Versões substituem-se, não se somam;
- Alteração em competência posterior à primeira vale integralmente no mês;
- Primeira competência é proporcional desde o início das atividades;
- Competência de desligamento é proporcional até a saída e fica no acerto complementar;
- Não existe média de RA no desligamento;
- Usa-se o valor vigente na data de saída;
- RA não está incluída no líquido do contador.

## 12.5 Total acordado

```text
Total acordado = salário-base oficial + remuneração adicional
```

- Calculado automaticamente;
- Somente leitura;
- Não inclui complemento;
- Não inclui reembolso;
- Não pode ser editado.

## 12.6 Salário redondo

Campo de marcação no vínculo:

- Marcado: o sistema lembra que descontos reais do holerite podem ser reembolsados;
- Desmarcado: não exige conferência de reembolso;
- Não arredonda salário nem valores;
- Não calcula impostos;
- Pode gerar reembolso no adiantamento, no pagamento final ou em ambos.

Para cada evento aplicável, o usuário deverá:

- Informar os valores reais; ou
- Confirmar expressamente que não houve reembolso naquele evento.

Categorias disponíveis para organização, sem valor pré-calculado:

- INSS;
- Imposto de Renda;
- Sindicato;
- Outro.

## 12.7 Complementos do empregado

Tipos:

### Recorrente

- Valor fixo;
- Competência inicial obrigatória;
- Competência final opcional;
- Pode permanecer indeterminado;
- Ao encerrar, informa-se a última competência devida.

### Avulso

- Pertence somente à competência em que foi criado;
- Podem existir vários na mesma competência.

Campos:

- Descrição;
- Valor;
- Tipo;
- Competência inicial;
- Competência final, quando aplicável;
- Uma ou duas parcelas;
- Evento da parcela única;
- Percentual do adiantamento, se dividido;
- Situação e versões.

Regras:

- Valor integral na competência;
- Sem proporcionalidade por dia;
- Sem arredondamento especial;
- Complementos diferentes podem coexistir;
- Versões do mesmo complemento não podem se sobrepor;
- Alteração no mês vale para a competência inteira;
- Complemento criado depois do adiantamento pago migra para o pagamento final;
- Se o pagamento final já ocorreu, gera ajuste positivo;
- Não entra em salário-base, RA, total acordado ou acerto complementar do desligamento.

## 12.8 Alterações financeiras

Antes de salvar uma alteração, o sistema mostrará:

- Competências afetadas;
- Eventos ainda abertos;
- Eventos já pagos;
- Se haverá recálculo;
- Se a mudança começará na competência seguinte;
- Se será necessário iniciar correção.

Sem evento confirmado, a competência aberta pode ser recalculada.

Com evento pago:

- Renegociação comum começa na competência seguinte;
- Correção da competência atual exige justificativa e o fluxo de correção.

---

# 13. Corte do adiantamento — dia 15

O dia 15 é inclusivo.

## 13.1 Salário oficial

- Usa a data de admissão;
- Admissão até o dia 15: pode haver adiantamento oficial proporcional;
- Admissão a partir do dia 16: não há adiantamento oficial na primeira competência;
- O pagamento final oficial continua sendo exatamente o líquido do contador.

```text
Base oficial proporcional =
salário-base ÷ 30 × D30(admissão, fim da competência)

Adiantamento oficial =
base oficial proporcional × percentual aplicável
```

## 13.2 RA, complementos e período sem registro

- Usam a data de início das atividades para verificar o corte;
- Início até o dia 15: podem participar do adiantamento conforme configuração;
- Início a partir do dia 16: toda a parcela devida migra para o pagamento final;
- Nenhuma verba desaparece por perder o corte.

## 13.3 MEI

- Usa a data inicial do contrato;
- Início até o dia 15: pode receber adiantamento;
- Início a partir do dia 16: recebe somente no pagamento final da primeira competência;
- Renovação contínua não reaplica o corte.

---

# 14. Período sem registro

## 14.1 Intervalo

Com admissão posterior:

```text
Início das atividades, inclusive,
até o dia anterior à admissão
```

Sem admissão:

- Até o desligamento sem registro; ou
- Até o final de cada competência encerrada, enquanto o vínculo permanecer ativo.

## 14.2 Base de referência

Quando ainda não existia salário oficial formal:

- O sistema sugere o primeiro salário-base informado;
- O usuário confirma a base mensal do período sem registro;
- Pode corrigir antes do pagamento, com justificativa;
- A base fica congelada no recibo;
- Ela não cria uma terceira remuneração recorrente.

## 14.3 Cálculo

```text
Valor do período sem registro =
base de referência ÷ 30 × D30(intervalo sem registro)
```

Regras:

- Uma linha por competência;
- Não inclui RA;
- Não inclui complementos;
- Não pode sobrepor dias cobertos pela admissão;
- Antes de pagar, o usuário confirma que os dias não estão no valor oficial do contador;
- Pode ser 100% no pagamento final;
- Ou dividido entre adiantamento e final;
- Possui recibo próprio em cada evento efetivamente pago;
- Alteração depois do pagamento gera ajuste, nunca sobrescrita;
- Se o vínculo for encerrado sem registro, o último intervalo termina na data de saída inclusiva.

---

# 15. Competências

## 15.1 Cadastro

Campos:

| Campo | Obrigatório | Regra |
|---|---:|---|
| Empresa | Sim | Contexto ativo. |
| Competência | Sim | Mês/ano único na empresa. |
| Data prevista do adiantamento | Sim | Copiada do padrão e editável. |
| Data prevista do pagamento final | Sim | Pode ocorrer no mês seguinte. |
| Situação | Sim | Conforme fluxo. |
| Versão | Automática | Incrementada em reabertura ou correção. |

Não haverá cálculo automático de quinto dia útil ou calendário de feriados. O usuário informa as datas previstas corretas.

## 15.2 Situações da competência

- Em preparação;
- Aguardando holerites;
- Em conferência;
- Fechada;
- Reaberta.

`Em pagamentos` poderá ser exibido como situação visual derivada quando os cálculos estiverem prontos, mas ainda houver grupos aguardando confirmação.

## 15.3 Participantes

Ao criar a competência, o sistema inclui os vínculos e contratos com período ativo no mês.

A tela financeira reúne empregados e MEIs, sempre identificados pelo tipo e com filtros próprios. As regras e os grupos permanecem separados.

Se um vínculo ou contrato for cadastrado ou corrigido depois:

- Competência aberta: participante e cálculos são atualizados;
- Competência fechada: exige fluxo de correção;
- Nenhum reprocessamento pode duplicar participante ou componente.

## 15.4 Checklist de fechamento

Antes do fechamento:

- Todos os líquidos necessários foram informados;
- Todos os grupos aplicáveis estão pagos ou não aplicáveis;
- Salários redondos foram conferidos;
- Desligamentos da competência estão quitados;
- Ajustes positivos estão pagos;
- Diferenças negativas estão absorvidas;
- Não existe correção em andamento;
- Não existe edição concorrente pendente.

Fechamento é ação explícita. Não ocorre automaticamente.

Reabertura exige permissão e justificativa e não apaga a versão fechada anterior.

---

# 16. Catálogo oficial de grupos financeiros

| Grupo | Participante | Eventos | Componentes | Recibo interno |
|---|---|---|---|---|
| Oficial do empregado | Empregado | Adiantamento e final | Adiantamento calculado e líquido do contador | Não |
| RA e reembolso | Empregado | Adiantamento e final | RA e reembolsos do salário redondo | Sim, separado por evento |
| Complementos | Empregado | Adiantamento e final | Todos os complementos detalhados | Sim, separado por evento |
| Período sem registro | Empregado | Adiantamento e final | Base proporcional do intervalo | Sim, próprio |
| Contrato MEI | MEI | Adiantamento e final | Base contratual e serviços adicionais no final | Sim, separado por evento |
| Rescisão oficial | Empregado formal | Desligamento | Líquido informado pelo contador | Não |
| Acerto complementar de RA | Empregado | Desligamento | Saldo e verbas calculadas somente sobre RA | Sim |
| Ajuste positivo | Empregado ou MEI | Ajuste | Diferença adicional a pagar | Sim |
| Diferença absorvida | Empregado ou MEI | Sem pagamento | Valor pago a maior | Não |

## 16.1 Estado Não aplicável

Pode ser utilizado somente quando:

- O valor final do grupo é zero;
- Não existem componentes devidos;
- O usuário possui permissão;
- O motivo é informado;
- Usuário e data são auditados.

Somente pode ser revertido em competência aberta ou reaberta.

## 16.2 Independência

- Cada grupo é calculado e confirmado separadamente;
- Confirmar o oficial não confirma RA ou complementos;
- Confirmar RA não confirma complementos;
- Não existe pagamento parcial dentro do mesmo grupo e evento;
- Grupos independentes podem ser pagos em datas reais diferentes;
- A competência fecha somente quando todos estiverem resolvidos.

---

# 17. Composição mensal do empregado

## 17.1 Adiantamento

Pode conter, conforme elegibilidade e configuração:

- Adiantamento oficial;
- Parcela da RA;
- Reembolsos do evento;
- Parcelas dos complementos.

O período sem registro pode ser pago na mesma data, mas permanece em grupo e recibo próprios.

## 17.2 Pagamento final

```text
Pagamento oficial = líquido do contador

Saldo de cada verba não oficial =
máximo(0, total devido da verba − valor efetivamente pago da mesma verba)
```

O valor operacional exibido ao usuário poderá apresentar a soma dos grupos, mas cada grupo continua com confirmação e recibo próprios.

Regras:

- Nunca descontar novamente o adiantamento oficial do líquido;
- Nunca deduzir o total de um grupo de outro grupo;
- Deduzir somente valor efetivamente pago da mesma origem;
- RA ou complemento criado depois do adiantamento migra para o final;
- Se o final já foi pago, diferença positiva vira ajuste;
- Valor pago acima do novo total vira diferença absorvida, nunca pagamento negativo.

---

# 18. Cálculo, conferência e pagamento

## 18.1 Estados do grupo

- Não gerado;
- Pendente de dados;
- Calculado;
- Pronto para pagamento;
- Pago;
- Não aplicável;
- Cancelado por desligamento;
- Em correção.

`Pago` significa confirmação de pagamento efetivo. Como não existe integração bancária, o sistema não criará um estado de processamento bancário.

## 18.2 Valores preservados

Para cada grupo e componente:

- Valor calculado ou informado;
- Valor manual, quando houver sobrescrita;
- Valor final devido;
- Valor efetivamente pago;
- Data efetiva;
- Versão;
- Usuário;
- Justificativa, quando aplicável.

## 18.3 Edição de cálculo automático

Usuário autorizado pode alterar um cálculo automático.

O sistema guarda:

- Fórmula e memória original;
- Valor originalmente calculado;
- Valor substituto;
- Diferença;
- Justificativa;
- Usuário e data;
- Recibos e pagamentos afetados.

Sem a permissão específica, o campo calculado é somente leitura.

## 18.4 Confirmação

- É integral por grupo e evento;
- Exige data efetiva;
- Exige que o grupo esteja pronto;
- Valor zero não é pago: deve ser marcado como não aplicável;
- Adiantamento e final são independentes;
- Grupos de um mesmo participante são independentes;
- Depois da confirmação, os componentes ficam bloqueados;
- Cancelamento exige permissão e justificativa;
- Reconfirmação cria nova versão histórica.

## 18.5 Entrada rápida do líquido

A competência terá uma tabela para digitação manual:

- Um empregado por linha;
- Navegação pelo teclado;
- Campo de líquido;
- Situação preenchido, pendente ou inconsistente;
- Salvamento individual;
- Sem importação de planilha.

## 18.6 Confirmação em lote

Usuário autorizado poderá selecionar vários participantes do mesmo grupo e evento.

Antes de confirmar, o sistema mostrará:

- Grupo e evento;
- Quantidade de participantes;
- Total;
- Data efetiva;
- Registros impedidos;
- Recibos que serão gerados.

Cada participante continuará com confirmação, auditoria e recibo próprios. A operação em lote não transforma os registros em um pagamento coletivo.

## 18.7 Concorrência

Se outro usuário alterar o registro enquanto a tela estiver aberta:

- O salvamento antigo será bloqueado;
- Nenhum dado será sobrescrito;
- O usuário deverá atualizar e conferir a versão recente.

Mensagem:

> Este registro foi alterado por outro usuário. Atualize a tela antes de continuar.

---

# 19. Correções e ajustes financeiros

## 19.1 Regra geral

```text
Ajuste = novo total devido − total efetivamente pago
```

- Resultado positivo: ajuste adicional a pagar;
- Resultado zero: nenhuma movimentação;
- Resultado negativo: diferença absorvida pela empresa;
- Nunca existe pagamento negativo;
- Nunca existe cobrança ou compensação automática futura;
- Uma verba não compensa silenciosamente outra.

## 19.2 Ajuste positivo

- Possui vínculo com competência, participante, grupo e evento de origem;
- Possui motivo e memória da diferença;
- Gera evento próprio de pagamento;
- Exige confirmação integral e data efetiva;
- Gera recibo próprio;
- Fica pendente no painel até ser pago.

## 19.3 Diferença absorvida

Campos:

- Origem;
- Valor pago;
- Novo valor devido;
- Diferença;
- Motivo;
- Justificativa;
- Usuário;
- Data de encerramento;
- Estado `Absorvido pela empresa`.

Não gera recibo, cobrança ou pendência futura. Aparece somente no histórico, auditoria e exportações autorizadas.

## 19.4 Fluxo guiado de correção

1. Selecionar participante, grupo e evento;
2. Informar justificativa;
3. Reabrir a competência, se estiver fechada;
4. Cancelar administrativamente a confirmação afetada;
5. Marcar recibos vigentes como cancelados ou substituídos;
6. Liberar somente o escopo selecionado;
7. Corrigir e recalcular;
8. Gerar ajuste positivo ou diferença absorvida;
9. Reconfirmar o estado correto;
10. Gerar novos documentos;
11. Fechar novamente a competência quando todos os itens estiverem resolvidos.

O pagamento efetivamente realizado permanece no histórico durante todo o fluxo.

## 19.5 Alteração de verba depois do adiantamento

Para RA, complemento ou base MEI:

```text
Saldo final = máximo(0, novo total devido − valor pago da mesma verba)

Excedente = máximo(0, valor pago da mesma verba − novo total devido)
```

- Saldo positivo migra ao pagamento final;
- Se o final já foi pago, gera ajuste positivo;
- Excedente é absorvido;
- A origem usada na dedução deve ser exatamente a mesma verba.

---

# 20. Recibos

## 20.1 Tipos emitidos

### Empregado

- RA e reembolso do adiantamento;
- Complementos do adiantamento;
- Período sem registro do adiantamento, quando aplicável;
- RA e reembolso do pagamento final;
- Complementos do pagamento final;
- Período sem registro do pagamento final, quando aplicável;
- Ajuste positivo;
- Acerto complementar de desligamento sobre RA.

O recibo de RA e reembolso pode ser emitido quando houver somente reembolso e RA igual a zero, desde que o total do grupo seja positivo.

### MEI

- Adiantamento contratual;
- Pagamento final contratual, incluindo serviços adicionais detalhados;
- Ajuste positivo.

Não serão emitidos pelo sistema:

- Recibo interno do salário oficial;
- Recibo interno do líquido do holerite;
- Recibo interno da rescisão oficial do contador;
- Recibo de diferença negativa;
- Recibo de evento com valor zero.

## 20.2 Momento de emissão

- Prévia pode ser gerada antes do pagamento;
- Prévia não possui número;
- Prévia contém a marca textual `PRÉVIA — PAGAMENTO NÃO CONFIRMADO`;
- Recibo definitivo é emitido somente após a confirmação integral;
- Um recibo definitivo declara o pagamento efetivamente confirmado;
- Reimprimir a mesma versão não cria novo número.

## 20.3 Numeração

- Sequência anual por empresa;
- Número único e nunca reutilizado;
- Recibo substituto recebe novo número;
- Original e substituto ficam ligados entre si;
- Documento cancelado permanece consultável com sua situação;
- Numeração é protegida contra cliques repetidos e emissões simultâneas.

Na implantação, uma semente anual controlada poderá registrar, por empresa+ano, o maior número externo já reservado ou comprometido no controle anterior. Ela:

- exige operador nominal com autorização específica, reautenticação, origem/referência e auditoria;
- só pode ser definida antes da primeira reserva interna daquela combinação empresa+ano;
- não cria recibo, pagamento ou documento retroativo;
- faz a primeira emissão interna usar o número imediatamente seguinte;
- é versionada e protegida pela mesma concorrência da emissão;
- rejeita valor regressivo, colisão, segunda definição incompatível e corrida com a primeira emissão.

Quando a empresa não possuir numeração anterior no ano, essa ausência será confirmada por declaração dupla no manifesto da carga; nenhuma semente será criada e a primeira emissão começará no número inicial padrão da série.

## 20.4 Conteúdo obrigatório

- Número único;
- Razão social da empresa;
- CNPJ da empresa;
- Logo utilizado na emissão;
- Nome e CPF do empregado, ou razão social/nome fantasia e CNPJ do MEI;
- Competência;
- Evento;
- Detalhamento dos valores;
- Total numérico;
- Total por extenso;
- Data efetiva do pagamento;
- Data de emissão;
- Identificação de versão ou substituição;
- Campo de assinatura manual do empregado ou prestador.

Não haverá assinatura da empresa.

## 20.5 Armazenamento

- PDF privado;
- Snapshot imutável;
- Hash de integridade;
- Download com nova verificação de sessão, empresa e permissão;
- Sem URL pública permanente;
- Emissão, download, cancelamento e substituição auditados.

## 20.6 Impressão em lote

O usuário autorizado poderá gerar:

- Um PDF consolidado para impressão; ou
- Um pacote com recibos individuais.

Os documentos continuam individualmente numerados e armazenados.

---

# 21. Desligamento

## 21.1 Tipos

### Desligamento sem registro

- Usado quando nunca houve admissão formal;
- Encerra o vínculo na data informada;
- Fecha o período sem registro;
- Pode gerar acerto complementar da RA conforme aplicabilidade confirmada;
- Não gera rescisão oficial nem ASO demissional.

### Demissão formal

- Exige admissão;
- Encerra o vínculo formal;
- Gera controle da rescisão oficial;
- Gera cálculo do acerto complementar da RA;
- Gera pendência de ASO demissional.

## 21.2 Campos

- Data real de saída;
- Tipo de encerramento;
- Aviso trabalhado, indenizado ou não aplicável;
- Dias de aviso indenizado, quando aplicável;
- Líquido da rescisão oficial, no desligamento formal;
- Confirmação de que o líquido oficial não contém RA;
- Avos confirmados de décimo terceiro sobre RA;
- Avos confirmados de férias sobre RA;
- Indicador de férias vencidas;
- Valores calculados e valores ajustados;
- Datas efetivas das quitações;
- Justificativas de correção.

Não haverá campo de motivo do desligamento.

## 21.3 Programação e inativação

- Data futura cria encerramento programado;
- O vínculo continua ativo até a data inclusiva;
- Na data seguinte, fica inativo automaticamente;
- Pagamentos e documentos da última competência continuam disponíveis;
- Cancelamento de desligamento exige permissão e justificativa;
- Cancelar o desligamento não desfaz pagamentos automaticamente.

## 21.4 Adiantamento na competência final

Se a saída ocorrer antes ou na data prevista do adiantamento e o evento ainda não tiver sido pago:

- O adiantamento é cancelado por desligamento;
- Oficial fica para a rescisão do contador;
- RA fica para o acerto complementar;
- Complementos migram para o pagamento final;
- Período sem registro migra para o pagamento final com recibo próprio.

Se já houve pagamento:

- O valor efetivamente pago permanece;
- Somente a RA efetivamente paga é deduzida do acerto de RA;
- Oficial e complementos não são deduzidos do acerto de RA;
- Eventual excedente vira diferença absorvida.

## 21.5 Última competência

No desligamento formal:

- O líquido da rescisão oficial substitui o líquido mensal oficial;
- Os dois não podem coexistir;
- RA mensal integral não é gerada;
- O saldo de RA aparece apenas no acerto complementar;
- Complementos permanecem no grupo mensal pelo valor integral;
- Período sem registro permanece em grupo próprio;
- Salário redondo não gera reembolso na rescisão ou no acerto complementar.

A competência só fecha quando rescisão oficial, acerto de RA, complementos, período sem registro e ajustes aplicáveis estiverem resolvidos.

---

# 22. Rescisão oficial e acerto complementar de RA

## 22.1 Rescisão oficial

- Valor digitado a partir do contador;
- Não é calculado pelo sistema;
- Não é decomposto;
- Não contém RA;
- Não gera recibo interno;
- Possui confirmação e data efetiva próprias;
- Fica separada do acerto complementar.

## 22.2 Base do acerto de RA

- Usa a RA vigente na data real de saída;
- Não usa média;
- Não inclui salário-base;
- Não inclui complemento;
- Não inclui reembolso;
- Não inclui período sem registro;
- Não inclui impostos ou descontos;
- Deduz somente a RA efetivamente paga no adiantamento.

## 22.3 Saldo proporcional da RA

```text
RA proporcional =
RA vigente ÷ 30 × D30(início do direito na competência, data de saída)

Saldo de RA =
máximo(0, RA proporcional − RA efetivamente paga no adiantamento)
```

Se início e saída ocorrerem na mesma competência, existe uma única proporcionalidade entre as duas datas.

## 22.4 Aviso indenizado sobre RA

```text
Aviso indenizado sobre RA =
RA vigente ÷ 30 × dias indenizados confirmados
```

Aviso trabalhado já está representado pelos dias trabalhados e não gera linha adicional.

## 22.5 Décimo terceiro sobre RA

```text
13º sobre RA =
RA vigente × avos confirmados ÷ 12
```

## 22.6 Férias proporcionais sobre RA

```text
Férias sobre RA =
RA vigente × avos confirmados ÷ 12

Um terço = férias calculadas ÷ 3
```

## 22.7 Férias vencidas sobre RA

O sistema pergunta se existe período vencido.

Quando a resposta for sim:

```text
Férias vencidas sobre RA = RA vigente

Um terço = RA vigente ÷ 3
```

Não existe dobra. Eventual necessidade diferente será tratada por ajuste manual autorizado e justificado.

## 22.8 Total do acerto

```text
Total do acerto de RA =
saldo proporcional de RA
+ aviso indenizado sobre RA
+ 13º sobre RA
+ férias proporcionais sobre RA
+ um terço proporcional
+ férias vencidas sobre RA
+ um terço das férias vencidas
```

Cada verba exige confirmação de aplicabilidade. O usuário autorizado pode ajustar o cálculo, mantendo memória original e justificativa.

## 22.9 Pagamento e recibo

- Acerto de RA possui confirmação própria;
- Pode ser pago em data diferente da rescisão oficial;
- Não existe pagamento parcial dentro do acerto;
- Gera recibo próprio;
- Rescisão oficial e acerto de RA permanecem separados, mesmo que a transferência externa tenha ocorrido no mesmo dia.

---

# 23. Prestador MEI

## 23.1 Cadastro

Campos:

| Campo | Obrigatório | Regra |
|---|---:|---|
| CNPJ | Sim | Validado e reutilizado dentro da mesma empresa. |
| Razão social | Sim | Identificação jurídica. |
| Nome fantasia | Sim | Nome de apresentação. |
| CEP | Sim | Busca opcional e preenchimento manual disponível. |
| Logradouro | Sim | Endereço obrigatório. |
| Número | Sim | Aceita `S/N`. |
| Complemento | Não | Endereço. |
| Bairro | Sim | Endereço. |
| Cidade | Sim | Endereço. |
| Estado | Sim | Endereço. |
| Telefone | Não | Contato opcional. |
| E-mail | Não | Contato opcional. |

Regras:

- Mesmo CNPJ na mesma empresa reutiliza o prestador;
- O mesmo CNPJ pode contratar com empresas diferentes;
- Não se revela a existência em outra empresa;
- Correção de CNPJ com histórico exige fluxo autorizado;
- Prestador não possui salário, holerite, RA, salário redondo, complemento trabalhista, ASO ou rescisão trabalhista.

## 23.2 Contrato

Campos:

- Empresa contratante;
- Prestador;
- Data inicial;
- Data final prevista;
- Data de encerramento efetivo, quando houver;
- Valor mensal;
- Uma ou duas parcelas;
- Evento da parcela única;
- Percentual do adiantamento, quando dividido;
- Situação;
- Vigências e renovações.

Validações:

- Valor mensal maior que zero;
- Data final prevista igual ou posterior à inicial;
- Contratos do mesmo prestador na mesma empresa não podem se sobrepor;
- Duas parcelas precisam totalizar 100%;
- Em duas parcelas, os percentuais devem ser maiores que 0% e menores que 100%;
- Parcela única pode ser escolhida no adiantamento ou no pagamento final;
- Se o corte impedir o adiantamento inicial, a parcela migra para o final.

Situações derivadas:

- Futuro;
- Ativo;
- Renovação programada;
- Encerramento programado;
- Encerrado.

## 23.3 Cálculo mensal

Competências intermediárias:

```text
Base MEI = valor mensal integral
```

Primeira e última competências:

```text
Base MEI =
valor mensal ÷ 30 × D30(período ativo na competência)
```

Se início e encerramento ocorrerem no mesmo mês, existe um único intervalo proporcional.

Com duas parcelas:

```text
Adiantamento MEI = base MEI × percentual

Pagamento final MEI =
base MEI − adiantamento efetivamente pago
+ serviços adicionais
```

Se o contrato encerrar antes ou na data prevista do adiantamento e ele ainda não tiver sido pago, toda a base proporcional vai para o pagamento final.

Adiantamento maior que a base proporcional final resulta em pagamento final zero e diferença absorvida.

## 23.4 Serviços adicionais

- Uma ou mais linhas na competência;
- Descrição obrigatória;
- Valor positivo;
- Não recorrente;
- Integral;
- Somente no pagamento final;
- Não entra na base do adiantamento;
- Incluído de forma detalhada no recibo final;
- Criado depois do pagamento final gera ajuste positivo.

## 23.5 Renovação programada

- Pode ser criada antes do término;
- Não exige esperar o contrato encerrar;
- Não cria novo cadastro do MEI;
- Cria nova vigência ligada ao mesmo contrato contínuo;
- Próxima vigência começa no dia seguinte;
- Não há inativação entre vigências;
- O histórico anterior permanece;
- O sistema copia valor e condições, permitindo alterações antes da confirmação;
- Renovação contínua não reaplica o corte do dia 15;
- Sem renovação, o contrato termina na data prevista;
- Retorno depois de uma interrupção cria novo contrato.

Mudança de valor no meio da competência:

```text
Valor da competência =
valor antigo ÷ 30 × dias da vigência antiga
+ valor novo ÷ 30 × dias da nova vigência
```

Os intervalos não se sobrepõem e a soma dos dias não ultrapassa 30.

---

# 24. Clínicas e ASO

## 24.1 Clínica compartilhada

Campos:

- Razão social obrigatória;
- Nome fantasia obrigatório;
- CNPJ obrigatório;
- Situação ativa ou inativa.

Regras:

- Catálogo global compartilhado entre CNPJs;
- CNPJ único no catálogo;
- Clínica utilizada não pode ser excluída;
- Clínica inativa permanece no histórico;
- Clínica inativa não pode ser usada em novo agendamento ou exame;
- Alteração exige permissão global;
- Cada ASO preserva um snapshot da clínica;
- Acesso à clínica não concede acesso aos ASOs de outras empresas.

## 24.2 Tipos de ASO

- Admissional;
- Periódico;
- Retorno ao trabalho;
- Mudança de riscos ocupacionais;
- Demissional.

## 24.3 Dados do exame realizado

| Campo | Obrigatório | Regra |
|---|---:|---|
| Empresa | Sim | Contexto do vínculo. |
| Empregado e vínculo | Sim | MEI não possui ASO. |
| Tipo | Sim | Um dos cinco tipos aprovados. |
| Clínica | Sim | Deve estar ativa na data do cadastro. |
| Data do exame | Sim | Data real da realização. |
| Data de vencimento | Sim, quando monitorada | Sugerida em 12 meses e editável. |
| Resultado | Sim | Apto, apto com restrição ou inapto. |
| Versão | Automática | Retificação preserva versões anteriores. |

Não serão armazenados:

- Documento, PDF ou imagem;
- Descrição da restrição;
- Diagnóstico ou CID;
- Médico ou CRM;
- Exames complementares;
- Assinaturas;
- Grau de risco.

Resultado é obrigatório somente ao concluir um exame como realizado. Agendamento, não comparecimento ou encerramento sem realização não possuem resultado clínico.

## 24.4 Estados separados

### Acompanhamento

- Pendente;
- Agendado;
- Realizado;
- Não compareceu;
- Encerrado sem realização.

Na primeira versão, `Agendado` é somente um estado operacional, sem data, horário ou envio ao colaborador. A agenda real pertence à melhoria futura `MF-01`.

### Resultado

- Apto;
- Apto com restrição;
- Inapto.

### Prazo, derivado

- Vigente;
- Vencendo em até 30 dias;
- Vencido.

### Restrição, derivada

- Sem restrição;
- Com restrição.

`Não compareceu` não é resultado clínico e não cria um ASO fictício.

## 24.5 Regras por tipo

### Admissional

- Um exame vigente por vínculo;
- Retificação cria nova versão;
- Comparado com a data de início das atividades;
- Se ocorrer depois do início, gera aviso de conferência, sem decisão automática;
- Uma recontratação em novo vínculo pode ter novo admissional.

### Periódico

- Podem existir vários ao longo do vínculo;
- Cada realização é novo exame, não retificação do anterior;
- O mais recente é referência para alertas;
- Vencimento inicial sugerido em 12 meses, mas sempre editável.

### Retorno e mudança de riscos

- Criados manualmente quando o responsável identificar a necessidade;
- Podem existir várias ocorrências;
- Duplicidade exata de tipo, vínculo e data gera aviso;
- O sistema não deduz necessidade a partir de ocorrências ou riscos não cadastrados.

### Demissional

- Um exame vigente por desligamento formal;
- Todo desligamento formal gera pendência;
- Não existe dispensa;
- Se já houver ASO demissional válido vinculado ao desligamento, a pendência nasce resolvida;
- Se o empregado não comparecer, registrar `Não compareceu`;
- Encerrar sem realização exige permissão e justificativa;
- Encerramento sem realização não cria ASO;
- Pendência de ASO não bloqueia a quitação financeira;
- ASO demissional não gera alerta de vencimento futuro.

## 24.6 Alertas

- Alerta interno começa 30 dias antes do vencimento;
- Versão substituída não gera alerta;
- Vínculo inativo não recebe novo alerta periódico;
- Pendência demissional permanece até ASO realizado ou encerramento autorizado sem realização;
- Notificação não expõe resultado clínico;
- O painel pode mostrar somente quantidade e acesso à lista conforme permissão.

---

# 25. Painel da empresa

## 25.1 Cabeçalho

- Logo;
- Razão social ou nome fantasia;
- CNPJ;
- Competência selecionada;
- Data e hora da última atualização;
- Ação Atualizar;
- Ação Trocar empresa.

## 25.2 Competência padrão

Ordem de seleção:

1. Manter a competência escolhida durante a sessão;
2. Caso contrário, usar a competência com pagamento próximo ou vencido;
3. Caso não exista, usar o mês atual;
4. Caso não exista, usar a competência aberta mais recente.

A competência sempre será mostrada de forma destacada para evitar confusão entre mês de referência e data real do pagamento.

## 25.3 Indicadores cadastrais

- Empregados ativos registrados;
- Empregados ativos sem registro;
- Empregados com encerramento programado;
- Empregados inativos;
- MEIs ativos;
- MEIs a iniciar;
- MEIs com renovação programada;
- MEIs próximos do encerramento;
- MEIs encerrados.

## 25.4 Indicadores da competência

- Situação da competência;
- Participantes;
- Grupos pendentes;
- Grupos prontos;
- Grupos pagos;
- Grupos não aplicáveis;
- Correções em andamento;
- Ajustes positivos pendentes;
- Diferenças absorvidas, somente como histórico autorizado.

Não haverá indicador `A recuperar`, pois nenhuma diferença negativa será cobrada futuramente.

## 25.5 Pagamentos

- Adiantamentos pendentes e pagos;
- Pagamentos finais pendentes e pagos;
- Líquidos do contador pendentes;
- RA e reembolsos pendentes;
- Complementos pendentes;
- Períodos sem registro pendentes;
- Eventos MEI pendentes;
- Salários redondos sem valor ou confirmação de zero;
- Rescisões oficiais pendentes;
- Acertos complementares pendentes;
- Recibos a substituir após correção.

## 25.6 ASO

- Exames vencendo em 30 dias;
- Exames vencidos;
- Pendências demissionais;
- Não comparecimentos ainda não encerrados.

O painel geral não mostra diagnóstico, descrição ou resultado clínico. A abertura do detalhe exige permissão específica.

## 25.7 Permissões

- Cartão sem permissão é omitido, não exibido com zero;
- Usuário sem acesso a valores pode visualizar apenas quantidades autorizadas;
- Total derivado é ocultado quando permitir inferência de campo restrito;
- Cada cartão abre uma lista filtrada;
- Nenhum pagamento ou alteração é realizado diretamente no painel.

---

# 26. Central interna de notificações

## 26.1 Princípios

- Somente dentro do sistema;
- Sempre limitada à empresa ativa;
- Derivada de registros operacionais;
- Não substitui o estado da entidade de origem;
- Uma condição ativa gera uma única notificação lógica;
- Marcar como lida não resolve a pendência;
- Leitura é individual por usuário;
- Correção da origem resolve a notificação automaticamente;
- Revogação de permissão remove a notificação da visão do usuário.

## 26.2 Tipos

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

## 26.3 Antecedências

- Pagamento: 3 dias corridos antes da data prevista e urgente na data;
- Desligamento programado: 7 dias corridos antes;
- Encerramento de MEI: 30 dias corridos antes;
- ASO: 30 dias corridos antes do vencimento.

Não haverá calendário de feriados para os alertas da primeira versão.

## 26.4 Agrupamento

- Pendências financeiras agrupadas por tipo e competência;
- Ao abrir, o usuário vê a lista detalhada;
- ASOs podem permanecer individualizados pelo vencimento;
- Uma mudança de urgência atualiza a mesma notificação;
- Não se cria nova notificação a cada dia.

## 26.5 Estados

### Operacional

- Ativa;
- Resolvida.

### Leitura

- Não lida;
- Lida.

Notificações resolvidas permanecem consultáveis na central por 90 dias. A auditoria correspondente segue sua retenção própria.

## 26.6 Ações

- Abrir o registro relacionado;
- Marcar como lida;
- Marcar itens visíveis como lidos.

Não haverá:

- Exclusão manual;
- Comentários;
- Atribuição de responsável;
- Adiamento;
- Escalonamento;
- E-mail, SMS ou push.

Essa restrição vale para a central interna da primeira versão. A melhoria futura `MF-01` estudará lembretes externos exclusivamente ligados a agendamentos de ASO, sem transformar a central em uma plataforma geral de mensagens.

---

# 27. Exportações Excel

## 27.1 Regras gerais

- Uma empresa por arquivo;
- Empresa ativa validada no pedido e no download;
- Permissão de exportar separada da permissão de visualizar;
- Filtros da tela aplicados ao arquivo;
- Campos ocultos omitidos;
- Campos mascarados permanecem mascarados;
- CPF e CNPJ como texto;
- Datas como datas;
- Valores e percentuais como números;
- Nenhuma fórmula de negócio recalcula o resultado;
- Textos protegidos contra execução como fórmula;
- Nenhum arquivo vazio;
- Sem importação de retorno;
- Arquivo privado disponível por 24 horas;
- Somente o solicitante pode baixar;
- Sessão, empresa e permissão são revalidadas;
- Solicitação, conclusão, falha e download são auditados;
- Exportação financeira identifica competência e versão.

## 27.2 Colaboradores

Um arquivo com duas abas.

### Empregados

- Empresa;
- Nome;
- CPF conforme permissão;
- Situação do vínculo;
- Início das atividades;
- Admissão;
- Desligamento sem registro;
- Demissão formal;
- Endereço conforme permissão;
- Salário-base vigente conforme permissão;
- RA vigente conforme permissão;
- Total acordado conforme permissão;
- Percentual de adiantamento;
- Salário redondo;
- Identificador do vínculo.

### MEIs

- Empresa contratante;
- CNPJ;
- Razão social;
- Nome fantasia;
- Endereço conforme permissão;
- Situação do contrato;
- Data inicial;
- Data final prevista;
- Encerramento efetivo;
- Valor mensal conforme permissão;
- Quantidade de parcelas;
- Evento da parcela única;
- Percentual do adiantamento;
- Identificador do contrato.

## 27.3 Pagamentos

Arquivo por empresa e competência com cinco abas:

### Resumo

- Empresa e competência;
- Estado e versão;
- Quantidades por tipo de participante;
- Totais por grupo e evento;
- Quantidades por situação;
- Ajustes positivos;
- Diferenças absorvidas.

### Eventos

- Participante;
- Tipo;
- Grupo;
- Evento;
- Valor calculado;
- Valor manual;
- Valor final;
- Valor pago;
- Situação;
- Data efetiva;
- Usuário e data de confirmação;
- Indicador de correção.

### Componentes

- Participante;
- Grupo e evento;
- Categoria;
- Descrição;
- Origem;
- Memória de cálculo;
- Valor original;
- Valor manual;
- Valor final.

### Ajustes

- Origem;
- Valor pago anteriormente;
- Novo valor devido;
- Diferença;
- Natureza positiva ou absorvida;
- Situação;
- Data e justificativa.

### Recibos

- Número;
- Tipo;
- Participante;
- Evento;
- Valor;
- Situação;
- Data de emissão;
- Documento substituído ou substituto.

## 27.4 ASOs

- Empregado e vínculo;
- CPF conforme permissão;
- Tipo;
- Clínica;
- CNPJ da clínica;
- Data do exame;
- Vencimento;
- Estado do prazo;
- Resultado conforme permissão;
- Situação do acompanhamento;
- Versão vigente ou substituída.

Não inclui descrição de restrição, diagnóstico, CID, médico, CRM ou arquivo.

## 27.5 Clínicas

Exportação global, com permissão própria:

- Razão social;
- Nome fantasia;
- CNPJ;
- Situação;
- Data de cadastro;
- Última alteração.

Não inclui empregados, ASOs ou empresas que utilizam a clínica.

## 27.6 Auditoria

### Empresarial

- Somente empresa ativa;
- Respeita filtros e permissões atuais.

### Global

- Arquivo separado;
- Somente master;
- Nunca inclui senha, hash de senha, segredo TOTP ou códigos de recuperação.

---

# 28. Histórico e auditoria

## 28.1 Fonte única

- Uma única fonte de eventos imutáveis;
- Histórico do empregado é filtro dessa fonte;
- Histórico do MEI, ASO, clínica, competência e recibo também;
- Auditoria geral empresarial usa a mesma origem;
- Auditoria global adiciona eventos de segurança e administração.

## 28.2 Evento de auditoria

Contém:

- Escopo global ou empresarial;
- Empresa, quando aplicável;
- Usuário;
- Data e hora;
- Módulo;
- Entidade e identificador;
- Ação;
- Resultado;
- Campos alterados;
- Antes e depois;
- Justificativa;
- Versão;
- Referência da operação.

## 28.3 Eventos auditados

- Login, falhas relevantes e bloqueios;
- Recuperação de senha e TOTP;
- Sessões encerradas por segurança;
- Criação, bloqueio e inativação de usuário;
- Promoção ou rebaixamento de master;
- Perfis e permissões;
- Empresas e clínicas;
- Pessoas e vínculos;
- Condições financeiras;
- Sobrescritas de cálculo;
- Competências e reaberturas;
- Confirmações e cancelamentos;
- Ajustes;
- Desligamentos;
- ASOs e retificações;
- Abertura de detalhe sensível de ASO;
- Recibos e downloads;
- Exportações;
- Tentativas negadas ou cruzadas entre empresas;
- Incidentes e restaurações relevantes.

Não será auditada cada atualização automática do painel ou cada leitura comum de lista.

## 28.4 Valores sensíveis

Para ver antes e depois, o usuário precisa:

- Permissão de histórico ou auditoria; e
- Permissão atual para visualizar o campo.

Sem a segunda permissão, o evento informa `campo restrito alterado`, com valores ocultos ou mascarados.

Senhas, tokens, TOTP, códigos de recuperação e cookies nunca são registrados.

Eventos de autenticação podem guardar IP e identificação básica do navegador em área protegida, acessível somente aos masters, com retenção técnica própria.

## 28.5 Imutabilidade

- A aplicação apenas acrescenta eventos;
- Alteração e auditoria são gravadas juntas;
- Se a auditoria obrigatória falhar, a ação é revertida;
- Usuários e masters não editam ou apagam a auditoria;
- Correção gera novo evento relacionado.

---

# 29. Validações e mensagens

## 29.1 Níveis

| Nível | Efeito |
|---|---|
| Bloqueio | A operação não pode continuar. |
| Exceção autorizada | Exige permissão, justificativa e auditoria. |
| Aviso com confirmação | A ação é válida, mas o impacto precisa ser confirmado. |
| Informação | Orienta sem impedir. |

## 29.2 Comportamento da tela

- Erro ao lado do campo;
- Resumo no início quando houver vários erros;
- Foco no primeiro campo inválido;
- Dados preenchidos preservados;
- Mensagem explica problema e correção;
- Falha técnica não mostra banco, código ou estrutura interna;
- Campo sem permissão não é mencionado pela mensagem.

## 29.3 Validações no servidor

- Campos obrigatórios;
- Formato, tamanho e catálogo permitido;
- CPF e CNPJ;
- E-mail;
- Percentuais e valores;
- Datas e vigências;
- Duplicidades;
- Transições de estado;
- Empresa ativa;
- Perfil e permissão;
- Campo editável;
- Versão do registro;
- Idempotência;
- Regras também protegidas no banco quando aplicável.

## 29.4 Mensagens padronizadas

Exemplos:

> Este CPF já possui vínculo ativo nesta empresa.

> Há um vínculo anterior encerrado. Crie um novo vínculo para registrar a recontratação.

> A data de admissão não pode ser anterior ao início das atividades.

> Este período se sobrepõe a uma vigência existente.

> Os percentuais das parcelas devem totalizar 100%.

> O líquido do contador ainda não foi informado.

> Este grupo possui valores devidos e não pode ser marcado como não aplicável.

> O grupo já foi pago. Inicie uma correção para alterar os valores.

> Cancelar esta confirmação invalidará os recibos vigentes. Informe a justificativa.

> Esta tela foi aberta em outra empresa. Reabra o registro no contexto atual.

> Sua sessão expirou. Entre novamente para continuar.

> Seu perfil não permite realizar esta ação nesta empresa.

> Nenhum registro corresponde aos filtros. Ajuste a pesquisa antes de exportar.

> Não foi possível registrar a operação com segurança. Nenhuma alteração foi concluída.

---

# 30. Segurança e arquitetura técnica de referência

## 30.1 Arquitetura proporcional

- Aplicação web modular única;
- Backend único;
- PostgreSQL;
- Armazenamento privado de PDFs;
- Armazenamento temporário privado de Excel;
- Serviço de e-mail apenas para autenticação;
- Rotina agendada simples para alertas, inativações e expiração de arquivos;
- Sem microsserviços;
- Sem banco separado por empresa;
- Sem cache distribuído;
- Sem mecanismo externo de busca;
- Sem filas generalizadas.

## 30.2 Isolamento multiempresa

- `empresa_id` obrigatório nas entidades empresariais;
- Empresa ativa obtida da sessão;
- Servidor não confia em empresa enviada pela tela;
- Chaves e relacionamentos impedem associação entre CNPJs;
- Row-Level Security como segunda barreira;
- Arquivos, tarefas e auditoria carregam o contexto;
- Tarefa sem empresa falha de forma segura;
- Registro de outra empresa responde como não encontrado;
- Busca, total e duplicidade não revelam existência externa.

## 30.3 Proteção de dados

- HTTPS obrigatório;
- Senhas com hash forte;
- CPF protegido e pesquisável por índice seguro;
- Segredo TOTP cifrado separadamente;
- Arquivos privados;
- Logs sem CPF completo, remuneração detalhada, resultado clínico ou segredo;
- Consulta de CEP envia somente o CEP;
- Dados reais não são copiados para desenvolvimento ou teste;
- Segredos ficam fora do código e do repositório.

## 30.4 Idempotência

Obrigatória em:

- Criação de registros críticos;
- Cálculo e recálculo;
- Fechamento e reabertura;
- Confirmação e cancelamento;
- Geração e substituição de recibo;
- Exportação.

Clique repetido ou nova tentativa após falha de conexão não pode duplicar pessoa, pagamento, recibo ou arquivo.

## 30.5 Controle de edição simultânea

- Registros editáveis possuem versão;
- Salvamento baseado em versão antiga é rejeitado;
- Confirmações, numeração e fechamento usam transações;
- Operação e auditoria são atômicas;
- Restrições únicas tratam cadastros simultâneos.

---

# 31. Desempenho e capacidade

## 31.1 Premissas

- 65 ativos;
- Aproximadamente 300 inativos;
- 10 usuários simultâneos;
- Três CNPJs;
- Crescimento interno moderado.

## 31.2 Regras

- Listas paginadas;
- Inativos não carregados por padrão;
- Índices por empresa, competência, situação e datas;
- Painel com consultas agregadas simples;
- Auditoria sempre consultada por filtros e intervalo;
- Toda exportação Excel usa processamento em segundo plano pelo worker, com snapshot do pedido, estado visível, arquivo privado e reautorização na entrega;
- Arquivos pequenos podem ficar prontos rapidamente, mas percorrem o mesmo ciclo assíncrono; auditorias extensas e demais lotes longos não bloqueiam a sessão;
- Sem atualização em tempo real;
- Sem cache compartilhado inicialmente.

## 31.3 Metas iniciais

- Login, seletor e listas usuais: até 2 segundos na maior parte das requisições;
- Pesquisa e filtros comuns: até 2 segundos;
- Abertura do painel: até 3 segundos;
- Cálculo de uma competência com até 100 participantes: até 5 segundos;
- Geração de Excel operacional: até 30 segundos;
- Geração individual de recibo: até 5 segundos;
- Lotes podem continuar em processamento com indicação de progresso, sem travar a sessão.

Essas metas serão validadas no ambiente de homologação.

---

# 32. Backups, retenção e incidentes

## 32.1 Backup

- Backup diário completo;
- Recuperação pontual dos dados entre backups;
- Banco, PDFs e chaves necessárias protegidos conjuntamente;
- Cópia cifrada separada do ambiente operacional;
- Acesso restrito;
- Backup não substitui a retenção do sistema.

Metas:

- RPO: perda máxima de 1 hora de dados;
- RTO: restauração em até 8 horas úteis.

## 32.2 Teste de restauração

- Um teste completo antes da produção;
- Repetição trimestral;
- Restauração primeiro em ambiente isolado;
- Conferência de empresas, permissões, pagamentos, recibos, hashes e auditoria;
- Restauração de apenas um CNPJ fica fora da primeira versão.

## 32.3 Retenção

- Retenção mínima de 6 anos;
- Sem exclusão automática na primeira versão;
- Recibos, vínculos, pagamentos e auditoria permanecem preservados;
- Exportações temporárias expiram em 24 horas;
- Notificações resolvidas ficam 90 dias na central;
- Backups possuem ciclo rotativo próprio;
- Política de arquivamento ou eliminação após o prazo será definida futuramente;
- O ASO físico continua guardado pela empresa conforme sua política e orientação jurídica;
- O sistema mantém somente o registro informativo aprovado.

## 32.4 Incidentes

Antes da produção serão definidos nominalmente:

- Coordenador do incidente;
- Responsável técnico;
- Responsável de DP;
- Representante da direção;
- Apoio jurídico/LGPD;
- Substitutos.

Fluxo mínimo:

1. Registrar o incidente;
2. Conter o problema;
3. Preservar evidências;
4. Identificar empresas, usuários e dados afetados;
5. Corrigir;
6. Restaurar, quando necessário;
7. Avaliar obrigações com o jurídico;
8. Registrar decisões e conclusão;
9. Aplicar melhorias.

Será realizado um exercício antes da produção, usando como caso principal tentativa de vazamento entre empresas.

---

# 33. Ambientes e publicação

- Desenvolvimento, teste e produção separados;
- Bancos e arquivos diferentes;
- Credenciais diferentes;
- Remetentes de e-mail diferentes;
- Nenhum dado real em desenvolvimento;
- Produção com HTTPS e modo de depuração desativado;
- Acesso administrativo à hospedagem protegido por MFA;
- Segredos em mecanismo seguro da plataforma;
- Rotação de credenciais documentada;
- Atualizações testadas antes de chegar à produção;
- Migrações de banco possuem procedimento de backup e reversão.

---

# 34. Implantação e competência de corte

## 34.1 Estratégia recomendada

Iniciar em uma competência cujo adiantamento ainda não tenha ocorrido.

Se o início ocorrer depois de algum pagamento da competência, será permitido lançamento inicial auditado com:

- Grupo;
- Evento;
- Valor efetivamente pago;
- Data real;
- Usuário;
- Indicação `Saldo inicial de implantação`.

Não serão fabricados recibos ou competências anteriores.

## 34.2 Dados iniciais

- Dois masters iniciais criados por bootstrap global de uso único, ambos com primeiro acesso e TOTP concluídos antes da ativação conjunta;
- Um modelo empresarial global inicial, versionado e válido;
- Três empresas;
- Logos e padrões financeiros;
- Perfis empresariais e globais;
- Usuários;
- Pessoas e vínculos empregados ativos no snapshot, mais os vínculos encerrados legitimamente no delta até o congelamento final;
- Prestadores MEI e contratos ativos no snapshot, mais os contratos encerrados legitimamente no mesmo delta;
- Condições financeiras vigentes;
- Complementos recorrentes vigentes;
- Complementos avulsos de empregado e serviços adicionais MEI da competência inicial que já sejam conhecidos e ainda não tenham sido pagos;
- Último ASO necessário ao controle atual;
- Clínicas;
- Líquidos K06 da competência inicial, quando disponíveis;
- Pagamentos já realizados na competência de corte, se houver, exclusivamente como K07;
- Semente anual de recibos, quando houver numeração anterior a preservar, sem fabricar os documentos anteriores.

Datas de início, admissão, contrato e último ASO podem ser anteriores ao corte sem gerar movimentação retroativa.

Recorrentes vigentes e avulsos/serviços já conhecidos, mas ainda não pagos, entram pelo fluxo normal de cálculo, conferência e pagamento da competência inicial. Qualquer fato já pago entra somente por K07, não reaparece como lançamento pagável e não gera recibo retroativo.

## 34.3 Checklist de entrada

1. Executar o bootstrap global de uso único e criar exatamente dois masters iniciais ainda sem acesso operacional;
2. Fazer os dois concluírem primeiro acesso e TOTP, ativá-los conjuntamente e comprovar que o bootstrap se autodesabilitou sem conta, senha ou rota de emergência;
3. Um master apto cria e valida o modelo empresarial global inicial;
4. Um master apto cadastra e valida as empresas pelo fluxo normal, com a versão válida do modelo;
5. Testar a recuperação dos dois masters;
6. Configurar os demais perfis;
7. Cadastrar usuários;
8. Conferir seletor de cada usuário;
9. Definir competência inicial;
10. Inserir os dados do snapshot;
11. Separar itens conhecidos e não pagos para o fluxo normal e fatos já pagos para K07;
12. Congelar a fonte, aplicar e reconciliar todos os deltas legítimos, inclusive qualquer reserva externa de numeração posterior ao snapshot;
13. Finalizar o manifesto persistido e, por empresa+ano, inicializar a semente uma única vez quando houver sequência externa, registrar ausência dupla sem criar raiz quando não houver, ou apenas verificar uma semente imutável idêntica de tentativa anterior; revogar a capacidade e provar negação pós-janela antes da primeira emissão interna;
14. Comparar quantidades e valores com controles atuais;
15. Testar isolamento entre empresas;
16. Fazer backup;
17. Testar restauração;
18. Executar exercício de incidente;
19. Definir janela de liberação e responsável;
20. Manter procedimento de retorno para o controle anterior caso a conferência falhe.

O bootstrap é uma exceção técnica global estritamente inicial: ele cria apenas as duas identidades master pendentes e se encerra depois da ativação conjunta. Ele não cadastra empresa, não concede acesso empresarial antecipado e não permanece como mecanismo operacional.

Não haverá módulo de importação para essa etapa.

---

# 35. Critérios de aceite funcionais

## 35.1 Multiempresa e acesso

1. Usuário da empresa A não visualiza, pesquisa, conta ou exporta dados da B;
2. Trocar empresa limpa o contexto anterior;
3. Aba antiga não salva na nova empresa;
4. Master seleciona empresa para operar;
5. Usuário comum recebe somente seu perfil;
6. Campo oculto não aparece em tela, filtro, total, histórico ou Excel;
7. Campo mascarado nunca chega integralmente ao navegador;
8. O sistema nunca fica com menos de dois masters aptos, salvo enquanto a contingência formal `B03-MST-06` estiver aberta e estritamente limitada.

## 35.2 Cadastros

1. CPF com ou sem máscara é reconhecido como o mesmo;
2. Não existem dois vínculos ativos do mesmo CPF na mesma empresa;
3. Recontratação cria novo vínculo e preserva o anterior;
4. CEP indisponível permite preenchimento manual;
5. Datas incompatíveis são bloqueadas;
6. MEI reutiliza o cadastro existente na mesma empresa;
7. Contratos ou vigências MEI não se sobrepõem;
8. Encerramento nunca apaga o histórico.

## 35.3 Cálculos

1. Dia 15 recebe adiantamento quando elegível e dia 16 não;
2. Fevereiro completo resulta em 30 dias;
3. Mês de 31 dias resulta em 30 dias;
4. Intervalo de um dia resulta em um dia;
5. Nenhum intervalo mensal supera 30 dias;
6. Parcela final recompõe exatamente o total;
7. Complemento não é proporcional;
8. RA é proporcional somente na primeira e na última competência do vínculo;
9. Período sem registro não inclui RA ou complemento;
10. Líquido oficial não sofre novo desconto do adiantamento;
11. Valor oficial reajustado não gera diferença automática do sistema;
12. Alteração depois do pagamento preserva o valor efetivo e gera ajuste.

## 35.4 Competências e pagamentos

1. Uma competência por empresa e mês;
2. Grupos são confirmados independentemente;
3. Não existe pagamento parcial no mesmo grupo;
4. Data efetiva é obrigatória;
5. Grupo com valor devido não pode ser não aplicável;
6. Competência não fecha com pendência;
7. Reabertura preserva a versão anterior;
8. Clique repetido não duplica cálculo, pagamento ou recibo;
9. Confirmação em lote mantém registros individuais;
10. Edição simultânea não sobrescreve o dado recente.

## 35.5 Desligamento

1. Desligamento sem registro e formal não coexistem;
2. Rescisão oficial substitui o líquido mensal oficial;
3. RA mensal integral não coexiste com acerto proporcional;
4. Somente RA efetivamente paga é deduzida do acerto;
5. Complementos permanecem integrais na última competência;
6. Salário redondo não entra na rescisão ou acerto;
7. Acerto contém somente verbas sobre RA;
8. Rescisão oficial e acerto RA permanecem separados;
9. Desligamento futuro não inativa antecipadamente;
10. Pendência de ASO não bloqueia quitação financeira.

## 35.6 MEI

1. Primeira e última competências usam D30;
2. Competências intermediárias usam valor integral;
3. Início depois do dia 15 não gera adiantamento inicial;
4. Serviço adicional vai somente ao final;
5. Renovação contínua não reaplica o corte;
6. Mudança de valor no meio do mês divide as vigências sem duplicidade;
7. Renovação programada impede inativação indevida;
8. Encerramento antecipado usa a data efetiva;
9. Adiantamento acima da base final não cria pagamento negativo;
10. MEI não recebe campos trabalhistas.

## 35.7 ASO

1. MEI não possui ASO;
2. Segundo admissional ou demissional vigente direciona à retificação;
3. Periódicos podem se repetir como novos exames;
4. Versão substituída não gera alerta;
5. Vencimento inicial é sugerido em 12 meses e pode ser alterado;
6. Não existe dispensa demissional;
7. Não comparecimento não cria exame ou resultado;
8. Encerramento sem realização exige permissão e justificativa;
9. Não são armazenados arquivo, diagnóstico, médico ou descrição de restrição;
10. Notificações não revelam resultado clínico.

## 35.8 Recibos, Excel e auditoria

1. Recibo definitivo somente depois do pagamento;
2. Prévia não recebe número;
3. Recibo substituído preserva o original;
4. Número cancelado não é reutilizado;
5. Semente anual só é aceita antes da primeira emissão interna, com autorização, origem, versão e auditoria; a primeira emissão usa o número seguinte;
6. Definições/emissões concorrentes ou colidentes não duplicam nem reutilizam número;
7. Não existe recibo interno do oficial ou da rescisão oficial;
8. Arquivo de outra empresa não pode ser baixado;
9. Excel respeita campos e empresa;
10. Excel não executa texto como fórmula;
11. Operação sensível sem auditoria é revertida;
12. Segredos de autenticação não aparecem em histórico ou exportação.

---

# 36. Caderno obrigatório de cenários de teste

Antes da implementação dos cálculos, devem existir exemplos aprovados para:

1. Início dia 1 e admissão dia 15;
2. Início dia 1 e admissão dia 20;
3. Início ou admissão no dia 15 versus dia 16;
4. Fevereiro com 28 dias;
5. Fevereiro com 29 dias;
6. Mês com 31 dias;
7. Início e saída no mesmo dia;
8. Período sem registro atravessando competências;
9. RA alterada antes do adiantamento;
10. RA alterada depois do adiantamento;
11. Complemento criado depois do adiantamento;
12. Desligamento antes da data prevista do vale;
13. Desligamento na data do vale antes da confirmação;
14. Desligamento depois do adiantamento pago;
15. Desligamento na primeira competência;
16. Rescisão oficial e acerto de RA;
17. Recibo pago, cancelado e substituído;
18. MEI iniciando e encerrando no mesmo mês;
19. Renovação contínua sem alteração;
20. Renovação contínua com mudança de valor no meio do mês;
21. Serviço adicional MEI depois do pagamento final;
22. Campo oculto no painel, histórico e Excel;
23. Tentativa de acesso cruzado entre empresas;
24. ASO demissional com não comparecimento;
25. Retificação de ASO e alerta usando somente a versão vigente.

Cada cenário deverá informar entradas, memória, resultado esperado, recibos esperados e estados finais.

---

# 37. Ordem posterior à aprovação deste documento

1. Aprovação do Documento Mestre;
2. Fluxos integrados de navegação e telas;
3. Protótipos das telas principais;
4. Matriz formal de estados e transições;
5. Modelo de dados;
6. Arquitetura técnica detalhada;
7. Contratos de API e regras de autorização;
8. Backlog priorizado da primeira versão;
9. Estratégia de testes;
10. Plano de implantação;
11. Desenvolvimento por etapas;
12. Homologação com casos reais anonimizados;
13. Entrada em produção.

---

# 38. Situação do planejamento

Os Cenários 1 a 10, a auditoria geral e seus ajustes estão incorporados neste documento. Os Lotes 1 a 7 dos protótipos de baixa fidelidade foram aprovados; o Lote 7 foi aprovado integralmente em 21/08/2026.

A melhoria `MF-01 — Agendamento de ASO e lembretes ao colaborador` está registrada apenas no catálogo futuro e não altera o escopo aprovado da primeira versão.

O Documento 16 reúne a consolidação final e as propostas de fechamento aprovadas em 21/08/2026. O Documento 17, que transforma essas regras na matriz formal de estados e transições, foi aprovado integralmente em 21/08/2026. O Documento 18 — Modelo Lógico de Dados, Relacionamentos e Restrições — e o Documento 18A, sua matriz exaustiva de rastreabilidade, foram aprovados integralmente em 21/08/2026. O Documento 19 — Arquitetura Técnica, Segurança, Infraestrutura, Backup e Observabilidade — foi aprovado integralmente em 21/08/2026. Os Documentos 20 e 20A — Contratos de API, Autorização e Rastreabilidade Técnica — foram aprovados integralmente em 22/08/2026. O Documento 21 — Backlog Priorizado e Plano de Desenvolvimento por Etapas — e o Documento 21A — Matriz de Rastreabilidade entre Backlog, Etapas e Testes — foram aprovados integralmente pelo usuário em 22/08/2026. O pacote do Documento 22 — Estratégia de Testes, Homologação e Rastreabilidade — e seus anexos 22A a 22D foram aprovados integralmente pelo usuário em 22/08/2026; seus anexos preservam 440 casos funcionais, 60 telas/subfluxos, 119 casos técnicos individuais e os 25 cenários compostos obrigatórios, com validação documental do planejamento sem erro. O pacote do Documento 23 — Implantação, Migração Inicial, Operação e Retorno Seguro — e seus anexos 23A a 23D foi aprovado integralmente pelo usuário em 22/08/2026; `D23PlanningReady = true`, mas ele não registra execução real nem autoriza produção. Os gates de execução permanecem planejados e ainda não foram executados; portanto, o sistema ainda não está liberado para produção. A continuidade autorizada é preparar o repositório e iniciar a `ETP-00`. Conforme a lista completa do Documento 21 §39, antes da produção ainda deverão ser definidos, entre outros:

O **Documento 22D — Caderno Executável dos 25 Cenários Compostos Obrigatórios** é o anexo nominal que materializa a exigência da seção 36 deste Documento Mestre.

- Responsáveis por incidentes;
- Plataforma de hospedagem;
- Provedor de e-mail transacional;
- Responsáveis pela homologação contábil, jurídica e operacional;
- Data e janela da implantação.

Qualquer mudança de regra após a aprovação deverá ser registrada como nova versão deste Documento Mestre.
