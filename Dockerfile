# syntax=docker/dockerfile:1.7
FROM node:24.19.0-bookworm-slim AS build
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
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm typecheck && pnpm test:unit && pnpm build

FROM node:24.19.0-bookworm-slim AS production-dependencies
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

FROM node:24.19.0-bookworm-slim AS runtime
ENV NODE_ENV=production
ENV API_HOST=0.0.0.0
ENV PRIVATE_OBJECT_ROOT=/var/lib/portal-dp/private-objects
RUN groupadd --system portal \
    && useradd --system --gid portal --uid 10001 portal \
    && install -d -o portal -g portal -m 0700 /var/lib/portal-dp/private-objects
WORKDIR /app
COPY --from=production-dependencies --chown=portal:portal /workspace/node_modules ./node_modules
COPY --from=production-dependencies --chown=portal:portal /workspace/apps ./apps
COPY --from=production-dependencies --chown=portal:portal /workspace/packages ./packages
COPY --from=build --chown=portal:portal /workspace/apps/api/dist ./apps/api/dist
COPY --from=build --chown=portal:portal /workspace/apps/web/dist ./apps/web/dist
COPY --from=build --chown=portal:portal /workspace/apps/worker/dist ./apps/worker/dist
COPY --from=build --chown=portal:portal /workspace/packages/contracts/dist ./packages/contracts/dist
COPY --from=build --chown=portal:portal /workspace/packages/database/dist ./packages/database/dist
COPY --from=build --chown=portal:portal /workspace/packages/domain/dist ./packages/domain/dist
COPY --from=build --chown=portal:portal /workspace/packages/integrations/dist ./packages/integrations/dist
COPY --from=build --chown=portal:portal /workspace/packages/observability/dist ./packages/observability/dist
COPY --from=build --chown=portal:portal /workspace/packages/storage/dist ./packages/storage/dist
VOLUME ["/var/lib/portal-dp/private-objects"]
USER 10001
EXPOSE 3000
CMD ["node", "apps/api/dist/main.js"]
