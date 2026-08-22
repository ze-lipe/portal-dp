# Infraestrutura da ETP-00

O compose local fornece somente PostgreSQL real para desenvolvimento sintetico.
Desenvolvimento e homologacao usam bancos, credenciais, objetos e telemetria
independentes. Producao nao e provisionada antes da escolha de hospedagem e dos
gates aprovados.

O login local `portal_dp_bootstrap` existe somente para migrações e provisionamento
controlado. A API autentica como `portal_dp_app_login` e assume somente
`portal_dp_app`; o worker autentica como `portal_dp_worker_login` e assume somente
`portal_dp_worker`. Ao executar `RESET ROLE`, cada processo volta a uma identidade
sem privilégios próprios, nunca ao bootstrap. Nenhum processo web pode ser
proprietário ou possuir `BYPASSRLS`. Em homologação, as senhas são injetadas pelo
cofre e nunca copiadas dos exemplos locais.
