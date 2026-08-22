# ADR-0001 — Versoes da baseline ETP-00

- Estado: aceito para a ETP-00
- Data: 2026-08-22

## Runtime e plataforma

| Componente                       | Versao fixada                   |
| -------------------------------- | ------------------------------- |
| Node.js                          | 24.19.0 LTS                     |
| pnpm                             | 11.22.0                         |
| TypeScript                       | 5.9.3                           |
| NestJS                           | 11.1.29                         |
| Fastify                          | 5.11.0                          |
| OpenTelemetry oficial do Fastify | 0.20.1                          |
| Servidor de arquivos Fastify     | 10.1.3                          |
| React                            | 19.2.8                          |
| Vite                             | 8.2.1                           |
| PostgreSQL                       | 18.x, validacao inicial em 18.6 |

As versoes exatas das dependencias ficam no lockfile. Atualizacoes passam pelo
fluxo de mudanca, verificacao de compatibilidade, SCA, testes e nova evidencia.
