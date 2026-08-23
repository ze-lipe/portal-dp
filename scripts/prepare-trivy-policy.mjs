import { mkdir, lstat, writeFile } from "node:fs/promises";
import { relative, resolve, sep } from "node:path";

const forbiddenRootFiles = [
  ".trivy.yaml",
  ".trivy.yml",
  ".trivyignore",
  ".trivyignore.yaml",
  ".trivyignore.yml",
  ".trivy-secret.yaml",
  ".trivy-secret.yml",
  "trivy.yaml",
  "trivy.yml",
  "trivy-secret.yaml",
  "trivy-secret.yml",
];

function argument(name) {
  const index = process.argv.indexOf(`--${name}`);
  return index === -1 ? undefined : process.argv[index + 1];
}

function fail(message) {
  throw new Error(`Trivy policy preparation failed: ${message}`);
}

function within(parent, child) {
  const path = relative(parent, child);
  return path === "" || (!path.startsWith(`..${sep}`) && path !== "..");
}

const repositoryRoot = resolve(argument("root") ?? process.cwd());
const outputDirectory = resolve(argument("output-directory") ?? "");
if (!argument("output-directory")) fail("--output-directory is required");
if (within(repositoryRoot, outputDirectory)) {
  fail("controlled policy files must stay outside the repository");
}

// Nenhuma variavel herdada pode alterar silenciosamente os inputs pinados da
// action. A propria action cria variaveis somente dentro do seu passo isolado.
const inheritedOverrides = Object.entries(process.env)
  .filter(
    ([name, value]) =>
      (name === "TRIVY_CMD" || name.startsWith("TRIVY_")) &&
      typeof value === "string" &&
      value !== "",
  )
  .map(([name]) => name)
  .sort();
if (inheritedOverrides.length > 0) {
  fail(`inherited overrides are forbidden: ${inheritedOverrides.join(", ")}`);
}

for (const name of forbiddenRootFiles) {
  const details = await lstat(resolve(repositoryRoot, name)).catch(() => null);
  if (details !== null) fail(`repository override is forbidden: ${name}`);
}

await mkdir(outputDirectory, { mode: 0o700 });
await writeFile(resolve(outputDirectory, "trivy.yaml"), "{}\n", {
  encoding: "utf8",
  flag: "wx",
  mode: 0o600,
});
await writeFile(resolve(outputDirectory, ".trivyignore"), "", {
  encoding: "utf8",
  flag: "wx",
  mode: 0o600,
});

process.stdout.write(
  `${JSON.stringify({
    policy: "CONTROLLED_NO_IGNORE_OR_SKIP_OVERRIDES",
    controlledConfig: resolve(outputDirectory, "trivy.yaml"),
    controlledIgnore: resolve(outputDirectory, ".trivyignore"),
  })}\n`,
);
