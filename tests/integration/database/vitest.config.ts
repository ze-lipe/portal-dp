import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

const workspace = (path: string): string =>
  fileURLToPath(new URL(`../../../${path}`, import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@portal-dp/contracts": workspace("packages/contracts/src/index.ts"),
      "@portal-dp/database": workspace("packages/database/src/index.ts"),
      "@portal-dp/domain": workspace("packages/domain/src/index.ts"),
      "@portal-dp/integrations": workspace(
        "packages/integrations/src/index.ts",
      ),
      "@portal-dp/observability": workspace(
        "packages/observability/src/index.ts",
      ),
      "@portal-dp/storage": workspace("packages/storage/src/index.ts"),
      "@portal-dp/testing": workspace("packages/testing/src/index.ts"),
    },
  },
  test: {
    include: ["tests/integration/database/**/*.integration.test.ts"],
    testTimeout: 30_000,
    hookTimeout: 60_000,
    fileParallelism: false,
    sequence: {
      concurrent: false,
    },
  },
});
