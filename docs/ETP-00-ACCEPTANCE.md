# Pacote de aceite da ETP-00

Este contrato materializa o Documento 21 §35.3 e a decisão `QLT-011` do
Documento 22. Ele separa três fatos que não podem ser confundidos:

1. o template existe e está estruturalmente correto;
2. o CI executou e selou evidências verificáveis;
3. os homologadores analisaram essas evidências e aprovaram a etapa.

O arquivo versionado
`evidencias/manifests/etp00-acceptance-v1.json` representa somente o primeiro
fato. Ele permanece `PENDENTE`, sem hash, versão executada, resultado,
homologador ou decisão inventados.

## O que o manifesto registra

- SHA-256 do manifesto de evidências, do catálogo canônico de bindings e da
  imagem OCI testada;
- versão da aplicação, versão do esquema, SHA-256 das migrações e
  versão/SHA-256 da fixture;
- os 21 itens `BK-*`, `GAT-01`, `GAT-02` e os 47 casos documentais que formam o
  escopo da `ETP-00`;
- resultado de cada job do CI, de cada gate e das medições revisadas;
- ambiente exato da execução, incluindo revisão Git e versões de PostgreSQL e
  plataforma do contêiner;
- defeitos e riscos residuais, mesmo quando as listas forem vazias depois da
  revisão explícita;
- homologação de Engenharia/Segurança e do Responsável de Produto;
- instante, responsável e conclusão final.

O escopo esperado não é uma declaração de cobertura. O template mantém as
listas `coverage.verified*` vazias. Elas só recebem os mesmos IDs depois da
análise das evidências da execução real.

## Comandos

Validar somente que o template continua pendente e não contém afirmação
antecipada:

```text
corepack pnpm verify:etp00:acceptance-template
```

Executar o gate de aceite contra o caminho informado no próprio manifesto:

```text
node scripts/validate-etp00-acceptance.mjs --manifest evidencias/resultados/aceite-etp00-<run-id>.json
```

O comando abaixo reúne os gates técnicos, as dez contribuições ASVS executáveis
da etapa e o pacote nominal. Enquanto qualquer parte estiver pendente, ele
termina com erro:

```text
corepack pnpm verify:etp00:acceptance
```

`--allow-pending` existe exclusivamente para validar o template. Ele não libera
a etapa, não muda `ready` para verdadeiro e não deve ser usado como gate de
encerramento.

## Preenchimento depois do CI

1. Baixe o pacote selado da execução e preserve sua estrutura, incluindo
   `manifest.json`, `manifest.sha256` e `objects/sha256/**`.
2. Copie o template para
   `evidencias/resultados/aceite-etp00-<run-id>.json`. Não transforme o template
   versionado no resultado de uma execução específica.
3. Troque `manifestId` por um ID definitivo e imutável da execução.
4. Informe `evidence.runManifestPath` com caminho relativo ao repositório e
   copie para `evidence.runManifestSha256` o SHA-256 conferido do manifesto
   selado. Registre também o SHA-256 do catálogo canônico
   `evidencias/manifests/evidence-bindings-etp00-v1.json`; o manifesto ASVS e o
   aceite precisam referenciar exatamente a mesma execução e o mesmo catálogo.
5. Selecione em `evidence.applicationArtifact` a entrada exata
   `portal-dp.oci.tar` desse manifesto. Copie `artifactId`, `sourcePath` e
   `sha256`; não recalcule nem substitua a imagem depois da homologação.
6. Copie as versões de aplicação, esquema/migrações e fixture do bloco
   `versions` do manifesto selado.
7. Revise o escopo e somente então preencha `coverage.verified*` com todos os
   IDs esperados. Ausência de um ID bloqueia o aceite.
8. Copie os resultados dos jobs sem alterar seus nomes. Vincule `GAT-01`,
   `GAT-02` e cada medição aos `artifactId` que realmente os comprovam.
9. Registre o ambiente. Os seis campos de identidade da execução e `runUrl`
   precisam ser idênticos aos do pacote selado. Abra essa URL autenticada no
   GitHub e confira externamente repositório, commit, workflow, tentativa,
   resultados dos jobs e nome do pacote baixado; o manifesto prova integridade
   interna, mas não substitui essa consulta à fonte.
10. Revise defeitos e riscos. Marque `residuals.reviewed=true` mesmo quando as
    duas listas forem vazias; `SEV-0` ou `SEV-1` não encerrado bloqueia.
11. Depois da demonstração, cada área obrigatória registra nome, papel,
    decisão, instante e observações, e marca `githubRunVerified=true` somente
    depois da consulta externa do passo 9. Aprovação anterior da aplicabilidade
    ASVS não substitui este aceite da execução.
12. Por último, registre a decisão geral e altere o estado para `APROVADA`.
    Execute o validador final e preserve o manifesto aprovado junto das
    evidências.

Os dados usados continuam exclusivamente sintéticos. O pacote da `ETP-00` pode
ser aceito com a custódia durável ainda pendente até o candidato à liberação,
mas o transporte, os jobs, os relatórios e os objetos obrigatórios desta
execução precisam estar íntegros. A retenção oficial de longo prazo permanece
um gate separado antes do release candidate.

## Comportamentos fail-closed

O validador recusa, entre outros:

- template pendente usado como aceite;
- caminho absoluto ou fora do repositório;
- hash divergente do arquivo ou do objeto selado;
- imagem diferente de `portal-dp.oci.tar`;
- versão de esquema, migrações ou fixture diferente da execução;
- job do pipeline sem `success` ou requisito de evidência ausente;
- cobertura parcial de `BK-*`, casos UI/CON ou casos ASVS da etapa;
- artefato citado por um gate sem vínculo nominal ao próprio gate;
- ambiente diferente do manifesto de execução;
- URL de execução divergente do `run-id`, tentativa ou repositório, ou ausência
  da confirmação externa por cada homologador;
- medição não revisada, risco sem responsável ou defeito crítico/alto aberto;
- homologador ausente, decisão anterior à execução ou decisão geral pendente;
- contribuição ASVS da `ETP-00` ainda não concluída.
- correção controlada `COR-ASVS-ETP00-001` sem aprovação nominal de Segurança;
- execução marcada como sintética/teste ou localizada em caminho temporário
  apresentada como aceite real;
- artefato sem binding canônico para o próprio caso, grupo obrigatório de
  binding ausente ou relatório crítico semanticamente inválido.

Os testes usam identidades, hashes e aprovações explicitamente sintéticos em
diretório temporário apenas para provar esses bloqueios. Eles nunca alteram o
template nem representam uma execução ou homologação real.

O inventário original mantém 13 casos integrais. A correção controlada limita a
ETP-00 a dez contribuições executáveis e deixa `QAT-RES-009`, `QAT-SEC-023`,
`QAT-SEC-037` e `TST-API-010` integralmente bloqueados até existirem módulos e
provas específicas. A aprovação nominal dessa correção continua pendente; este
documento não a presume nem a substitui.
