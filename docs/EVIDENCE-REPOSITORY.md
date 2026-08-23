# Contrato do repositório de evidências — ETP-00

## Finalidade

Cada execução relevante é encerrada em um diretório novo e não sobrescrevível:

```text
evidencias/repositorio/runs/<run-id>/
  manifest.json
  manifest.sha256
  objects/sha256/<prefixo>/<sha256>
```

Os objetos são copiados para endereços derivados do SHA-256. O manifesto e seu
arquivo de checksum fecham a execução. Alterar um objeto, o manifesto ou sua
associação com casos faz a validação falhar.

O CI sempre inclui um contexto sanitizado com os resultados de cada job. Assim,
mesmo uma falha anterior à geração dos relatórios recebe manifesto próprio; a
ausência de anexos esperados permanece visível e nunca é convertida em sucesso.
O manifesto diferencia `sealed` de `complete`: ele pode preservar uma execução
reprovada, mas `--require-complete` falha se qualquer job obrigatório não for
aprovado, se o download não terminar, se um relatório obrigatório não estiver
presente ou se a retenção oficial ainda não estiver comprovada.

O contrato executável é `portal-dp/evidence-repository@1.2.0`, esquema 2. Ele
exige:

- versão da aplicação, agregado das migrações e hash da fixture sintética;
- SHA-256, tamanho, tipo, caminho lógico e caminho content-addressed de cada
  relatório ou anexo;
- ao menos um caso por artefato, obtido do catálogo versionado e também
  identificado por hash;
- instante, origem, revisão, resultados dos jobs e responsável pela execução;
- identidade distinta do iniciador e da automação executora quando o ambiente
  fornece ambas;
- ACL, classificação, mecanismo de aplicação e metadados de retenção;
- estado da aprovação ASVS, sem converter o fechamento da evidência em aceite;
- vínculo com o manifesto anterior quando uma execução corrige outra.

O catálogo
`evidencias/manifests/evidence-bindings-etp00-v1.json` define quais caminhos
podem produzir cada regra de binding e a quais casos ela se aplica. O manifesto
selado registra a versão, o caminho e o SHA-256 desse catálogo. O gate recalcula
os bindings a partir dos artefatos, exige os grupos obrigatórios por caso e
recusa um ID apenas declarado, um arquivo arbitrário ou um catálogo alterado.
Relatórios críticos também passam por validação semântica específica; JSON
bem-formado, isoladamente, não comprova o requisito.

O relatório do histórico Git não substitui a cobertura dos arquivos produzidos
durante a execução. Antes de cada upload, o CI varre builds, fixtures, SBOMs e
demais evidências; também inspeciona a imagem OCI real e suas camadas. A coleta
agregada e o pacote já selado são varridos novamente. Relatórios brutos de
achados ficam somente no diretório temporário do executor, salvo a cópia nativa
e minimizada do Trivy exigida para recalcular uma aceitação de risco nominal. Os
demais artefatos recebem apenas resumos sanitizados com versão da ferramenta,
escopo, contagens e hash agregado, sem caminho, trecho ou valor encontrado.

## Imutabilidade e substituição

Um `run-id` existente nunca é reaberto nem sobrescrito. Uma correção usa outro
`run-id`, informa o manifesto substituído e uma justificativa. A nova versão
herda toda a cadeia de hashes; as anteriores continuam necessárias para validar
a sequência completa.

Como o repositório atual é público, os artefatos transportados pelo GitHub
Actions são classificados como `PUBLICO_SANITIZADO`; o manifesto não afirma uma
restrição que o transporte não aplica. Somente material aprovado pelas varreduras
anteriores pode ser publicado. Um repositório privado futuro deverá usar
explicitamente `INTERNO_RESTRITO` com o mecanismo privado correspondente. O
manifesto registra o workflow como escritor efetivo e o ator apenas como
iniciador. Os arquivos locais recebem permissão somente leitura como defesa
adicional, mas o filesystem local continua sendo apenas tamper-evident, não WORM.
Os dados de origem presentes no manifesto são declarações da própria execução.
Por isso, um aceite real também exige que cada homologador abra a `runUrl` no
GitHub e confirme a execução, o commit, a tentativa, os jobs e o pacote; essa
confirmação fica registrada em `githubRunVerified` e não é inferida apenas dos
campos locais.

O prazo de 90 dias do artifact é somente transporte e não autoriza eliminação.
Enquanto não existirem provedor durável, referência do objeto e hash do recibo
de custódia, `retentionSatisfied` e `complete` permanecem falsos. Essas três
informações entram por `EVIDENCE_LONG_TERM_PROVIDER`,
`EVIDENCE_LONG_TERM_OBJECT_REFERENCE` e
`EVIDENCE_LONG_TERM_RECEIPT_SOURCE_PATH` e
`EVIDENCE_LONG_TERM_RECEIPT_SHA256`, junto de
`EVIDENCE_LONG_TERM_PROVIDER_STATUS=CONFIGURADO`. O gate não aceita apenas uma
declaração sem recibo. A política mínima continua sendo preservação até o fim do
projeto e revisão antes do candidato à produção.

## Execução local

Coloque somente resultados sanitizados em `evidencias/coleta` e execute:

```text
corepack pnpm evidence:finalize -- --run-id local-001
corepack pnpm evidence:verify -- --manifest evidencias/repositorio/runs/local-001/manifest.json
```

A primeira verificação prova estrutura, hashes e cadeia mesmo para uma execução
reprovada. Use `--require-complete` somente quando os anexos e a custódia de longo
prazo estiverem disponíveis; caso contrário, a falha é intencional.

O gate de contribuições da ETP-00 usa internamente a completude técnica: exige
transporte concluído, todos os jobs aprovados e todos os requisitos e artefatos
técnicos obrigatórios presentes, sem exigir `retentionSatisfied`. Essa separação
não flexibiliza falha de execução nem ausência de prova; apenas evita antecipar
na ETP-00 o recibo de custódia durável planejado para a ETP-11. O estado
`complete` e a opção `--require-complete` continuam reservados à combinação de
completude técnica e retenção oficial comprovada.

O pipeline da ETP-00 executa a primeira verificação e preserva inclusive uma
execução reprovada. O gate `--require-complete` volta a ser obrigatório no
candidato à liberação, depois da configuração do repositório durável prevista
para a ETP-11; essa separação não transforma falha técnica em aprovação.

Para corrigir uma execução, use um novo identificador:

```text
corepack pnpm evidence:finalize -- --run-id local-002 --supersedes evidencias/repositorio/runs/local-001/manifest.json --replacement-reason "Correção do relatório"
```

Senha, cookie, token CSRF, TOTP, credencial, CPF/CNPJ integral, salário, ASO ou
conteúdo pessoal não pode ser colocado na coleta geral. O script comprova
integridade e metadados; ele não substitui sanitização, homologação humana nem a
aprovação nominal ASVS.

A política complementar `PORTAL_DP_PROHIBITED_DATA_V3` bloqueia CPF e CNPJ com
dígitos verificadores válidos, e-mail fora dos domínios reservados de teste e
valores estruturados de CID/CRM. Metadados públicos de dependências sob
`node_modules` não são classificados como dados empresariais; esses bytes ainda
passam integralmente por Gitleaks, Trivy e SCA. O restante da imagem, os SBOMs e
as evidências continuam cobertos pela política. Nenhum campo CycloneDX é
isentado da varredura: hashes, referências, componentes, identificadores e texto
livre são examinados integralmente. Uma massa sintética que precise
parecer válida exige alteração formal e versionada; não se admite exceção
silenciosa no repositório.

JSON fora de dependências de terceiros é reconhecido pelo conteúdo, mesmo sem
extensão, validado sem chaves repetidas e interpretado semanticamente antes da
inspeção. Chaves e valores textuais são examinados separadamente depois da
decodificação, inclusive controles como quebra de linha e tabulação; assim,
nomes alternativos e escapes Unicode não ocultam dados. Arquivo
com extensão `.json` precisa ser JSON UTF-8 válido. Conteúdo com padrão
UTF-16LE/BE também recebe uma segunda leitura própria, inclusive para reconhecer
JSON sem extensão, além da leitura binária original.

A inspeção compactada `FAIL_CLOSED_TAR_ZIP_OCI_V2` mantém validação estrita da
extensão para arquivos fornecidos diretamente. Em entradas internas de uma OCI
ou de outro arquivo, a assinatura binária é autoritativa: um nome terminado em
`.gz` sem assinatura gzip só é aceito como bytes comuns quando está sob
`node_modules`, onde algumas dependências publicam fixtures com extensão
incorreta. Fora dessa fronteira a divergência continua falhando de forma fechada;
gzip real é sempre expandido e submetido aos mesmos limites de profundidade,
tamanho e taxa de compressão.

Os onze SBOMs CycloneDX preservam o inventário completo produzido pelo pnpm.
Antes da varredura e da publicação, um normalizador fail-closed regenera o
`serialNumber` aleatório de cada inventário até obter um UUID v4 único que passe
pelo mesmo detector de dados proibidos. Isso elimina colisões numéricas
acidentais sem criar exceção no scanner. O normalizador também converte somente
URLs VCS GitHub de componentes terceiros com transporte SSH/SCP ou userinfo HTTPS
para HTTPS sem userinfo e remove endereços presentes nos campos próprios de autor
terceiro. Componentes internos, metadados do SBOM e texto arbitrário não recebem
essa exceção. A transformação não elimina componentes, dependências, licenças,
hashes nem referências externas que não sejam o VCS normalizado; JSON malformado,
chaves duplicadas e formatos de contato ou VCS desconhecidos interrompem o fluxo.

Uma coincidência numérica dentro de hash criptográfico também bloqueia o fluxo;
não existe isenção genérica para esse campo. A triagem deve localizar o hash,
conferi-lo contra o pacote oficial imutável e então substituir/atualizar a
dependência ou registrar uma exceção individual, nominal e com prazo. O valor só
pode ser liberado depois dessa comprovação, preservando a evidência da análise.

O Gitleaks está fixado na versão `8.30.1`, com a distribuição Linux x64
validada pelo SHA-256 oficial antes da execução. Essa versão mantém habilitada a
varredura de segredos em arquivos compactados com profundidade máxima três; uma
versão sem suporte a esse parâmetro é tratada como falha operacional, sem
reduzir silenciosamente a cobertura.

## Aceitação temporária e nominal do Trivy

A decisão `RA-TRIVY-CVE-2026-14456-001` foi autorizada por
`Jose Felipe Leite Marques`, no papel de `Desenvolvedor` e aprovador de
segurança, em 23 de agosto de 2026. O instante conservador registrado para a
autorização e o início de sua validade é `2026-08-23T00:59:42-03:00`; ela vale
até, no máximo,
`2026-09-21T23:59:59-03:00`. Depois desse instante, a própria validação a
recusa, ainda que nenhum arquivo do repositório seja alterado.

A aceitação cobre somente uma ocorrência `HIGH` de `CVE-2026-14456` no pacote
Debian `libssl3t64@3.5.6-1~deb13u2`, com estado `fix_deferred`, sem versão
corrigida informada, arquitetura, identificadores e camada exatamente fixados
no contrato executável. Ela também exige Debian 13 e a imagem-base completa:

```text
gcr.io/distroless/nodejs24-debian13:nonroot@sha256:ffab599740d4aaa66029d02b9e6d3de4f622fefb7410081c5ef69c86430f364d
```

O vínculo não depende somente de uma label: o gate comprova o último `FROM` e a
label do estágio runtime no Dockerfile, a configuração da imagem, o digest da
camada afetada e a dependência imutável registrada no provenance SLSA do mesmo
artefato OCI. Qualquer ocorrência adicional, versão, base, plataforma, camada,
status, severidade ou pacote divergente volta a bloquear a execução.

A justificativa técnica é restrita ao sistema atual: a aplicação Node/Nest
publica HTTP e não cria listener OpenSSL QUIC/HTTP3 ou UDP. A vulnerabilidade
atinge o processamento de pacotes QUIC Initial por um listener que use essa
funcionalidade. As referências primárias de acompanhamento são o
[aviso do OpenSSL](https://www.openssl-library.org/news/vulnerabilities-3.6/),
o [rastreador de segurança do Debian](https://security-tracker.debian.org/tracker/CVE-2026-14456)
e a [política de atualizações do Distroless](https://github.com/GoogleContainerTools/distroless#operating-system-updates-for-security-fixes-and-cves).

O passo nativo do Trivy permanece reprovado e o achado continua contabilizado;
a aprovação ocorre somente na classificação posterior e aparece como
`success_with_accepted_risk`. Para permitir a reavaliação independente, o
relatório nativo publicado preserva a vulnerabilidade, o inventário, os IDs e
os digests necessários. Antes da publicação pública, remove exclusivamente
`Packages[].Maintainer` e `Packages[].Identifier.PURL`, após validar o relatório
original e comprovar que essa minimização não muda a decisão. A cópia minimizada
passa novamente pelo detector de dados proibidos.

A aceitação termina antecipadamente quando existir imagem-base corrigida ou
quando o pacote/identidade da base mudar. A introdução de QUIC, HTTP/3 ou listener
UDP também exige remover a aceitação antes da mudança. A renovação não é
automática: precisa de nova decisão nominal, prazo, justificativa, contrato e
testes.

O resumo Trivy isolado descreve a decisão, mas não autoriza uma liberação. Todo
consumidor presente ou futuro precisa usar a validação de coerência crítica, que
recalcula o achado preservado e o confronta com a prova OCI do mesmo pacote
selado.

A aprovação ASVS exige responsável nominal, instante ISO válido e o SHA-256 do
perfil/controles exatamente aprovados. Alterar esse conteúdo invalida o vínculo;
o gate não aceita data textual arbitrária nem aprovação herdada por engano.
