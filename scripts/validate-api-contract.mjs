import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const [openapi, manifestText] = await Promise.all([
  readFile(resolve(root, "openapi/portal-dp-v1.yaml"), "utf8"),
  readFile(resolve(root, "openapi/operation-manifest.json"), "utf8"),
]);
const manifest = JSON.parse(manifestText);
const errors = [];
const ids = new Set();
const routes = new Set();

for (const operation of manifest.operations) {
  if (ids.has(operation.operationId))
    errors.push(`Duplicate operation ${operation.operationId}`);
  ids.add(operation.operationId);
  const routeKey = `${operation.method} ${operation.path}`;
  if (routes.has(routeKey)) errors.push(`Duplicate route ${routeKey}`);
  routes.add(routeKey);
  if (!openapi.includes(`operationId: ${operation.operationId}`)) {
    errors.push(`Operation ${operation.operationId} is missing from OpenAPI`);
  }
  const pathMarker = `  ${operation.path}:`;
  const pathStart = openapi.indexOf(pathMarker);
  const nextPath =
    pathStart < 0
      ? -1
      : openapi.indexOf("\n  /", pathStart + pathMarker.length);
  const pathBlock =
    pathStart < 0
      ? ""
      : openapi.slice(pathStart, nextPath < 0 ? undefined : nextPath);
  if (
    pathStart < 0 ||
    !pathBlock.includes(`\n    ${operation.method.toLowerCase()}:`)
  ) {
    errors.push(`Route ${routeKey} is missing from OpenAPI`);
  }
  if (!operation.owner || !operation.stage || !operation.authentication) {
    errors.push(
      `Operation ${operation.operationId} has incomplete ownership metadata`,
    );
  }
}

const declaredOpenApiIds = [
  ...openapi.matchAll(/^\s+operationId:\s+(\S+)\s*$/gmu),
].map((match) => match[1]);
for (const operationId of declaredOpenApiIds) {
  if (!ids.has(operationId))
    errors.push(`OpenAPI operation ${operationId} is missing from manifest`);
}

if (errors.length > 0) {
  console.error(JSON.stringify({ valid: false, errors }, null, 2));
  process.exitCode = 1;
} else {
  console.log(JSON.stringify({ valid: true, operations: ids.size }));
}
