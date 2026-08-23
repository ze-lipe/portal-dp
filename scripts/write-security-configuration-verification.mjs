import { mkdir, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, relative, resolve, sep } from "node:path";

import { validateSecurityConfigurationReport } from "./security-configuration-contract.mjs";

const root = resolve(import.meta.dirname, "..");
const expectedBase =
  "gcr.io/distroless/nodejs24-debian13:nonroot@sha256:ffab599740d4aaa66029d02b9e6d3de4f622fefb7410081c5ef69c86430f364d";
const privateObjectPath = "/var/lib/portal-dp/private-objects";

function argument(name) {
  const index = process.argv.indexOf(`--${name}`);
  return index === -1 ? undefined : process.argv[index + 1];
}

function requireExact(name, expected) {
  const value = argument(name);
  if (value !== expected) {
    throw new Error(`${name} nao comprovou o valor seguro esperado`);
  }
  return value;
}

function requireJsonArray(name, expected) {
  const value = argument(name);
  let parsed;
  try {
    parsed = JSON.parse(value ?? "");
  } catch {
    throw new Error(`${name} nao contem JSON valido`);
  }
  if (
    !Array.isArray(parsed) ||
    JSON.stringify(parsed) !== JSON.stringify(expected)
  ) {
    throw new Error(`${name} nao comprovou a configuracao segura esperada`);
  }
  return parsed;
}

function requireNoNewPrivileges(name) {
  const value = argument(name);
  let parsed;
  try {
    parsed = JSON.parse(value ?? "");
  } catch {
    throw new Error(`${name} nao contem JSON valido`);
  }
  if (
    !Array.isArray(parsed) ||
    parsed.length !== 1 ||
    !["no-new-privileges", "no-new-privileges:true"].includes(parsed[0])
  ) {
    throw new Error(`${name} nao comprovou no-new-privileges`);
  }
  return true;
}

function requireNoDeclaredVolumes(name) {
  const value = argument(name);
  let parsed;
  try {
    parsed = JSON.parse(value ?? "");
  } catch {
    throw new Error(`${name} nao contem JSON valido`);
  }
  if (
    parsed !== null &&
    (typeof parsed !== "object" ||
      Array.isArray(parsed) ||
      Object.keys(parsed).length !== 0)
  ) {
    throw new Error(`${name} encontrou volume declarado pela imagem`);
  }
  return [];
}

function requirePersistentMounts(name, expected, { writableOnly }) {
  const value = argument(name);
  let parsed;
  try {
    parsed = JSON.parse(value ?? "");
  } catch {
    throw new Error(`${name} nao contem JSON valido`);
  }
  if (!Array.isArray(parsed)) {
    throw new Error(`${name} nao contem a lista de montagens do container`);
  }

  const supportedTypes = new Set([
    "bind",
    "cluster",
    "npipe",
    "tmpfs",
    "volume",
  ]);
  const persistentTypes = new Set(["bind", "cluster", "npipe", "volume"]);
  const persistentMounts = [];
  for (const mount of parsed) {
    if (
      mount === null ||
      typeof mount !== "object" ||
      typeof mount.Type !== "string" ||
      !supportedTypes.has(mount.Type) ||
      typeof mount.Destination !== "string" ||
      !isAbsolute(mount.Destination) ||
      typeof mount.RW !== "boolean"
    ) {
      throw new Error(`${name} contem montagem sem formato seguro conhecido`);
    }
    // tmpfs e efemero e ja esta limitado pelas opcoes do runtime. Montagens
    // persistentes sao comparadas sem conservar origem, nome ou dado do host.
    if (persistentTypes.has(mount.Type) && (!writableOnly || mount.RW)) {
      persistentMounts.push({
        destination: mount.Destination,
        type: mount.Type,
        writable: mount.RW,
      });
    }
  }
  persistentMounts.sort((left, right) =>
    left.destination.localeCompare(right.destination),
  );
  if (JSON.stringify(persistentMounts) !== JSON.stringify(expected)) {
    throw new Error(
      `${name} nao comprovou as montagens persistentes esperadas`,
    );
  }
  return persistentMounts;
}

const privateWorkerMount = [
  {
    destination: privateObjectPath,
    type: "volume",
    writable: true,
  },
];

const imageDeclaredVolumes = requireNoDeclaredVolumes("image-declared-volumes");
const apiWritablePersistentMounts = requirePersistentMounts("api-mounts", [], {
  writableOnly: true,
});
const workerPersistentMounts = requirePersistentMounts(
  "worker-mounts",
  privateWorkerMount,
  { writableOnly: false },
);

const outputPath = resolve(
  root,
  argument("output") ??
    "evidencias/resultados/security-configuration-verification.json",
);
const relativeOutput = relative(root, outputPath);
if (
  relativeOutput === "" ||
  relativeOutput === ".." ||
  relativeOutput.startsWith(`..${sep}`) ||
  isAbsolute(relativeOutput)
) {
  throw new Error("output deve permanecer dentro do repositorio");
}

const report = {
  schemaVersion: 2,
  reportType: "OCI_SECURITY_CONFIGURATION_VERIFICATION",
  status: "PASSOU",
  verifiedAt: new Date().toISOString(),
  source: "SMOKE_OCI_ETP00",
  sanitization:
    "Somente fatos de configuracao previamente selecionados; sem ambiente, segredo, ID de container ou inspect bruto.",
  assertions: {
    processIdentity: {
      status: "PASSOU",
      user: requireExact("user", "65532:65532"),
    },
    immutableRootFilesystem: {
      status: "PASSOU",
      readOnly: requireExact("read-only", "true") === "true",
      writablePersistentMounts: apiWritablePersistentMounts,
    },
    droppedCapabilities: {
      status: "PASSOU",
      values: requireJsonArray("cap-drop", ["ALL"]),
    },
    privilegeEscalation: {
      status: "PASSOU",
      noNewPrivileges: requireNoNewPrivileges("security-options"),
    },
    workerRuntimeSecurity: {
      status: "PASSOU",
      user: requireExact("worker-user", "65532:65532"),
      readOnly: requireExact("worker-read-only", "true") === "true",
      droppedCapabilities: requireJsonArray("worker-cap-drop", ["ALL"]),
      noNewPrivileges: requireNoNewPrivileges("worker-security-options"),
      persistentMounts: workerPersistentMounts,
    },
    syntheticApiRoute: {
      status: "PASSOU",
      enabled: false,
      observedStatusCode: Number.parseInt(
        requireExact("synthetic-route-status", "404"),
        10,
      ),
    },
    runtime: {
      status: "PASSOU",
      base: requireExact("runtime-base", expectedBase),
      entrypoint: requireJsonArray("entrypoint", ["/nodejs/bin/node"]),
      command: requireJsonArray("command", ["apps/api/dist/main.js"]),
    },
    privateObjectStorage: {
      status: "PASSOU",
      path: privateObjectPath,
      imageDeclaredVolumes,
      explicitWorkerMount: true,
      rootPermissions: requireExact(
        "private-root-permissions",
        "65532:65532:700",
      ),
      objectPermissions: requireExact(
        "private-object-permissions",
        "65532:65532:600",
      ),
    },
  },
};

validateSecurityConfigurationReport(report);

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, {
  flag: "wx",
});

process.stdout.write(
  `${JSON.stringify({ written: relativeOutput.split(sep).join("/") })}\n`,
);
