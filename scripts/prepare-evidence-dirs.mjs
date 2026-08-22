import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
await Promise.all([
  mkdir(resolve(root, "evidencias/resultados"), { recursive: true }),
  mkdir(resolve(root, "evidencias/artefatos"), { recursive: true }),
  mkdir(resolve(root, "evidencias/coleta"), { recursive: true }),
  mkdir(resolve(root, "evidencias/repositorio/runs"), { recursive: true }),
]);
