# Fixture sintética da ETP-00

O comando de carga chama primeiro `ensureEtp00GlobalBusinessModel`, que cria e
valida o modelo BK-077 nas versões 1 e 2 por um serviço versionado. Depois,
`0001_etp00_synthetic_fixture.sql` cria somente dados artificiais e estáveis:

- empresas `A`, `B` e `C`;
- uma raiz de prova empresarial para cada empresa;
- um ator técnico sintético sem credencial ou identidade humana, autorizado
  somente na empresa `A`; `B` permanece o cenário empresarial de negação e `C`
  valida a evolução versionada do modelo.

O serviço e o arquivo devem ser aplicados depois das migrações por uma identidade
de migração controlada. Ambos são idempotentes. O serviço usa lock transacional,
mantém as versões append-only e rejeita conteúdo divergente; o SQL de empresas
falha se esse modelo ainda não tiver sido materializado.

Os identificadores são deliberadamente reconhecíveis e não podem ser usados em
produção ou substituídos por informações reais em testes automatizados.
