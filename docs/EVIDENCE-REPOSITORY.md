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
reprovada, mas `--require-complete` falha se o download não terminar, se um job
bem-sucedido não entregar seu relatório obrigatório ou se a retenção oficial
ainda não estiver comprovada.

O contrato executável é `portal-dp/evidence-repository@1.0.0`. Ele exige:

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

## Imutabilidade e substituição

Um `run-id` existente nunca é reaberto nem sobrescrito. Uma correção usa outro
`run-id`, informa o manifesto substituído e uma justificativa. A nova versão
herda toda a cadeia de hashes; as anteriores continuam necessárias para validar
a sequência completa.

O armazenamento do GitHub Actions aplica a ACL do repositório ao artefato
selado. O manifesto registra o workflow como escritor efetivo e o ator apenas
como iniciador. Os arquivos locais recebem permissão somente leitura como defesa
adicional, mas o filesystem local continua sendo apenas tamper-evident, não WORM.

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

Para corrigir uma execução, use um novo identificador:

```text
corepack pnpm evidence:finalize -- --run-id local-002 --supersedes evidencias/repositorio/runs/local-001/manifest.json --replacement-reason "Correção do relatório"
```

Senha, cookie, token CSRF, TOTP, credencial, CPF/CNPJ integral, salário, ASO ou
conteúdo pessoal não pode ser colocado na coleta geral. O script comprova
integridade e metadados; ele não substitui sanitização, homologação humana nem a
aprovação nominal ASVS.

A aprovação ASVS exige responsável nominal, instante ISO válido e o SHA-256 do
perfil/controles exatamente aprovados. Alterar esse conteúdo invalida o vínculo;
o gate não aceita data textual arbitrária nem aprovação herdada por engano.
