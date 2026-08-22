import { createHash, randomUUID } from "node:crypto";
import { constants } from "node:fs";
import { link, lstat, mkdir, open, unlink } from "node:fs/promises";
import { resolve, sep } from "node:path";

const opaqueId =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu;

export interface PrivateObjectWrite {
  companyId: string;
  objectId: string;
  bytes: Uint8Array;
  expectedSha256: string;
}

export interface PrivateObjectResult {
  objectId: string;
  sha256: string;
  size: number;
  disposition: "CREATED" | "ALREADY_PRESENT";
}

export type ObjectAuthorization = (input: {
  companyId: string;
  objectId: string;
}) => Promise<boolean>;

export interface PrivateObjectStore {
  putIfAbsent(input: PrivateObjectWrite): Promise<PrivateObjectResult>;
  readAuthorized(
    input: { companyId: string; objectId: string },
    authorize: ObjectAuthorization,
  ): Promise<Uint8Array>;
}

export class PrivateObjectIntegrityError extends Error {
  readonly safeCode = "PRIVATE_OBJECT_INTEGRITY_FAILED";

  constructor() {
    super("Private object integrity validation failed");
    this.name = "PrivateObjectIntegrityError";
  }
}

export class PrivateObjectSecurityError extends Error {
  readonly safeCode = "PRIVATE_OBJECT_STORAGE_UNSAFE";

  constructor() {
    super("Private object storage security validation failed");
    this.name = "PrivateObjectSecurityError";
  }
}

export class LocalPrivateObjectStore implements PrivateObjectStore {
  readonly #root: string;

  constructor(root: string) {
    this.#root = resolve(root);
  }

  async putIfAbsent(input: PrivateObjectWrite): Promise<PrivateObjectResult> {
    this.#assertOpaqueId(input.companyId, "companyId");
    this.#assertOpaqueId(input.objectId, "objectId");
    const actualHash = createHash("sha256").update(input.bytes).digest("hex");
    if (actualHash !== input.expectedSha256.toLowerCase()) {
      throw new PrivateObjectIntegrityError();
    }

    const path = this.#safePath(input.companyId, input.objectId);
    const directory = resolve(path, "..");
    await mkdir(this.#root, { recursive: true, mode: 0o700 });
    await this.#assertSecureDirectory(this.#root);
    await mkdir(directory, { recursive: true, mode: 0o700 });
    await this.#assertSecureDirectory(directory);
    const temporaryPath = resolve(
      directory,
      `.${input.objectId}.${randomUUID()}.tmp`,
    );

    let temporaryCreated = false;
    try {
      // A gravação ocorre em temporário exclusivo e sincronizado. O hard link
      // publica o destino atomicamente sem sobrescrever um objeto existente.
      const handle = await open(temporaryPath, "wx", 0o600);
      temporaryCreated = true;
      try {
        await handle.writeFile(input.bytes);
        await handle.sync();
      } finally {
        await handle.close();
      }

      await link(temporaryPath, path);
      // O fsync do arquivo não torna a entrada de diretório durável sozinho.
      // No runtime Linux, sincronizamos a criação do link antes de remover o
      // temporário; uma queda entre essas operações deixa ao menos uma cópia
      // íntegra e endereçável do objeto.
      await syncDirectory(directory);
      await unlink(temporaryPath);
      await syncDirectory(directory);
      temporaryCreated = false;
      await this.#assertSecureObject(path);
      return {
        objectId: input.objectId,
        sha256: actualHash,
        size: input.bytes.byteLength,
        disposition: "CREATED",
      };
    } catch (error) {
      if (temporaryCreated) {
        await unlink(temporaryPath).catch(() => undefined);
        await syncDirectory(directory).catch(() => undefined);
      }
      if (!isAlreadyExists(error)) throw error;
      // Destino existente só é repetição idempotente quando possui o mesmo hash;
      // qualquer divergência é uma falha de integridade.
      await this.#assertSecureDirectory(directory);
      const existing = await this.#readSecureObject(path);
      const existingHash = createHash("sha256").update(existing).digest("hex");
      if (existingHash !== actualHash) throw new PrivateObjectIntegrityError();
      return {
        objectId: input.objectId,
        sha256: existingHash,
        size: existing.byteLength,
        disposition: "ALREADY_PRESENT",
      };
    }
  }

  async readAuthorized(
    input: { companyId: string; objectId: string },
    authorize: ObjectAuthorization,
  ): Promise<Uint8Array> {
    this.#assertOpaqueId(input.companyId, "companyId");
    this.#assertOpaqueId(input.objectId, "objectId");
    // A autorização precede a leitura e a resposta neutra não revela se um
    // objeto pertencente a outra empresa realmente existe.
    if (!(await authorize(input))) throw new Error("Private object not found");
    const path = this.#safePath(input.companyId, input.objectId);
    await this.#assertSecureDirectory(this.#root);
    await this.#assertSecureDirectory(resolve(path, ".."));
    return this.#readSecureObject(path);
  }

  async #assertSecureDirectory(path: string): Promise<void> {
    const details = await lstat(path).catch(() => null);
    const identity = currentProcessIdentity();
    if (!details?.isDirectory() || details.isSymbolicLink()) {
      throw new PrivateObjectSecurityError();
    }
    if (
      process.platform !== "win32" &&
      (!identity ||
        (details.mode & 0o777) !== 0o700 ||
        details.uid !== identity.uid ||
        details.gid !== identity.gid)
    ) {
      throw new PrivateObjectSecurityError();
    }
  }

  async #assertSecureObject(path: string): Promise<void> {
    const handle = await open(
      path,
      constants.O_RDONLY | constants.O_NOFOLLOW,
    ).catch(() => null);
    if (!handle) throw new PrivateObjectSecurityError();
    try {
      const details = await handle.stat();
      const identity = currentProcessIdentity();
      if (
        !details.isFile() ||
        (process.platform !== "win32" &&
          (!identity ||
            (details.mode & 0o777) !== 0o600 ||
            details.uid !== identity.uid ||
            details.gid !== identity.gid))
      ) {
        throw new PrivateObjectSecurityError();
      }
    } finally {
      await handle.close();
    }
  }

  async #readSecureObject(path: string): Promise<Uint8Array> {
    const handle = await open(
      path,
      constants.O_RDONLY | constants.O_NOFOLLOW,
    ).catch(() => null);
    if (!handle) throw new PrivateObjectSecurityError();
    try {
      const details = await handle.stat();
      const identity = currentProcessIdentity();
      if (
        !details.isFile() ||
        (process.platform !== "win32" &&
          (!identity ||
            (details.mode & 0o777) !== 0o600 ||
            details.uid !== identity.uid ||
            details.gid !== identity.gid))
      ) {
        throw new PrivateObjectSecurityError();
      }
      return await handle.readFile();
    } finally {
      await handle.close();
    }
  }

  #assertOpaqueId(value: string, field: string): void {
    if (!opaqueId.test(value))
      throw new Error(`${field} must be an opaque UUID`);
  }

  #safePath(companyId: string, objectId: string): string {
    const candidate = resolve(this.#root, companyId, `${objectId}.bin`);
    if (!candidate.startsWith(`${this.#root}${sep}`))
      throw new Error("Unsafe private object path");
    return candidate;
  }
}

function currentProcessIdentity(): { uid: number; gid: number } | null {
  if (
    typeof process.getuid !== "function" ||
    typeof process.getgid !== "function"
  ) {
    return null;
  }
  return { uid: process.getuid(), gid: process.getgid() };
}

async function syncDirectory(path: string): Promise<void> {
  // O ambiente de produção é Linux. O Windows não oferece a mesma operação
  // para handles de diretório e é usado aqui apenas para desenvolvimento local.
  if (process.platform === "win32") return;
  const handle = await open(path, "r");
  try {
    await handle.sync();
  } finally {
    await handle.close();
  }
}

function isAlreadyExists(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error && error.code === "EEXIST";
}
