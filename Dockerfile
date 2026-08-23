# syntax=docker/dockerfile:1.7.1@sha256:a57df69d0ea827fb7266491f2813635de6f17269be881f696fbfdf2d83dda33e
FROM node:24.19.0-bookworm-slim@sha256:3638d9a6fe4030bd716be989438248074489337ba3275657f93595428be4fc03 AS build
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable
WORKDIR /workspace

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json tsconfig.tools.json tsconfig.tests.json ./
COPY apps ./apps
COPY packages ./packages
COPY openapi ./openapi
COPY scripts ./scripts
COPY database ./database
# Estes arquivos existem apenas na etapa de validacao da imagem. Eles nao sao
# copiados para o runtime final, mas tornam o build reproduzivel fora do CI.
COPY tests ./tests
COPY evidencias/manifests ./evidencias/manifests
COPY documentacao ./documentacao
COPY docs ./docs
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
# Os testes de seguranca leem a receita, o workflow canonico e somente os
# snapshots publicos e imutaveis do Semgrep. Nenhum desses arquivos segue para
# o runtime final.
COPY Dockerfile ./Dockerfile
COPY .github/workflows/ci.yml ./.github/workflows/ci.yml
COPY security/semgrep/registry-snapshots ./security/semgrep/registry-snapshots
RUN pnpm typecheck && PORTAL_DP_IMAGE_BUILD_VALIDATION=1 pnpm test:unit && pnpm build

FROM node:24.19.0-bookworm-slim@sha256:3638d9a6fe4030bd716be989438248074489337ba3275657f93595428be4fc03 AS production-dependencies
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable
WORKDIR /workspace
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/package.json
COPY apps/web/package.json ./apps/web/package.json
COPY apps/worker/package.json ./apps/worker/package.json
COPY packages/contracts/package.json ./packages/contracts/package.json
COPY packages/database/package.json ./packages/database/package.json
COPY packages/domain/package.json ./packages/domain/package.json
COPY packages/integrations/package.json ./packages/integrations/package.json
COPY packages/observability/package.json ./packages/observability/package.json
COPY packages/storage/package.json ./packages/storage/package.json
COPY packages/testing/package.json ./packages/testing/package.json
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile
# A imagem final nao possui shell. O diretorio privado nasce aqui com a
# identidade nao privilegiada padrao do distroless.
RUN install -d -o 65532 -g 65532 -m 0700 /runtime-private-objects

FROM gcr.io/distroless/nodejs24-debian13:nonroot@sha256:ffab599740d4aaa66029d02b9e6d3de4f622fefb7410081c5ef69c86430f364d AS runtime
LABEL org.opencontainers.image.base.name="gcr.io/distroless/nodejs24-debian13:nonroot@sha256:ffab599740d4aaa66029d02b9e6d3de4f622fefb7410081c5ef69c86430f364d"
ENV NODE_ENV=production
ENV API_HOST=0.0.0.0
ENV PRIVATE_OBJECT_ROOT=/var/lib/portal-dp/private-objects
WORKDIR /app
# O processo pode ler o programa, mas nao e proprietario dele. Este diretorio
# permanece somente leitura na API; o worker deve receber um volume explicito
# em tempo de execucao para materializar objetos privados.
COPY --from=production-dependencies /workspace/node_modules ./node_modules
COPY --from=production-dependencies /workspace/apps ./apps
COPY --from=production-dependencies /workspace/packages ./packages
COPY --from=build /workspace/apps/api/dist ./apps/api/dist
COPY --from=build /workspace/apps/web/dist ./apps/web/dist
COPY --from=build /workspace/apps/worker/dist ./apps/worker/dist
COPY --from=build /workspace/packages/contracts/dist ./packages/contracts/dist
COPY --from=build /workspace/packages/database/dist ./packages/database/dist
COPY --from=build /workspace/packages/domain/dist ./packages/domain/dist
COPY --from=build /workspace/packages/integrations/dist ./packages/integrations/dist
COPY --from=build /workspace/packages/observability/dist ./packages/observability/dist
COPY --from=build /workspace/packages/storage/dist ./packages/storage/dist
COPY --from=production-dependencies --chown=65532:65532 --chmod=0700 /runtime-private-objects /var/lib/portal-dp/private-objects
USER 65532:65532
EXPOSE 3000
CMD ["apps/api/dist/main.js"]
