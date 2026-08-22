import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const packageJson = JSON.parse(
  await readFile(resolve(root, "package.json"), "utf8"),
);
const errors = [];

if (process.version !== `v${packageJson.engines.node}`) {
  errors.push(
    `Node esperado ${packageJson.engines.node}; encontrado ${process.version}`,
  );
}

if (
  process.env.NODE_ENV === "production" &&
  process.env.ETP00_SYNTHETIC_PROOF_ENABLED === "true"
) {
  errors.push("A prova sintetica ETP-00 nunca pode ser habilitada em producao");
}

for (const key of [
  "DATABASE_URL",
  "WORKER_DATABASE_URL",
  "MIGRATOR_DATABASE_URL",
]) {
  const value = process.env[key];
  if (
    process.env.NODE_ENV === "production" &&
    (!value || /LOCAL_(?:ONLY|APP|WORKER)_CHANGE_ME/u.test(value))
  ) {
    errors.push(`${key} ausente ou insegura para producao`);
  }
}

if (process.env.NODE_ENV === "production") {
  if (process.env.DATABASE_URL?.includes("portal_dp_bootstrap")) {
    errors.push("DATABASE_URL nunca pode autenticar como portal_dp_bootstrap");
  }
  if (process.env.WORKER_DATABASE_URL?.includes("portal_dp_bootstrap")) {
    errors.push(
      "WORKER_DATABASE_URL nunca pode autenticar como portal_dp_bootstrap",
    );
  }
}

if (errors.length > 0) {
  console.error(JSON.stringify({ valid: false, errors }, null, 2));
  process.exitCode = 1;
} else {
  console.log(
    JSON.stringify({
      valid: true,
      node: process.version,
      environment: process.env.NODE_ENV ?? "unset",
    }),
  );
}
