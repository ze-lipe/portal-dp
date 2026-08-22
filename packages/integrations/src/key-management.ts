import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

export type KeyPurpose =
  | "REGISTRATION_DATA"
  | "CLINICAL_DATA"
  | "PROTECTED_AUDIT"
  | "TOTP_SECRET"
  | "PRIVATE_OBJECT"
  | "RESTRICTED_EVIDENCE_REFERENCE"
  | "OTHER_PROTECTED_DATA";

export interface KeyContext {
  readonly companyId: string;
  readonly entityType: string;
  readonly fieldName: string;
  readonly recordId: string;
  readonly recordVersion: number;
  readonly purpose: KeyPurpose;
}

export interface WrappedDataKey {
  readonly keyVersion: string;
  readonly wrappedKey: Uint8Array;
}

export interface KeyManagementPort {
  wrapDataKey(
    context: KeyContext,
    plaintextDataKey: Uint8Array,
  ): Promise<WrappedDataKey>;
  unwrapDataKey(
    context: KeyContext,
    wrapped: WrappedDataKey,
  ): Promise<Uint8Array>;
}

export class KeyManagementUnavailableError extends Error {
  readonly safeCode = "KEY_MANAGEMENT_UNAVAILABLE";

  constructor() {
    super("Sensitive operation is temporarily unavailable");
    this.name = "KeyManagementUnavailableError";
  }
}

export class ProtectedDataUnavailableError extends Error {
  readonly safeCode = "PROTECTED_DATA_UNAVAILABLE";

  constructor() {
    super("Protected data is not available");
    this.name = "ProtectedDataUnavailableError";
  }
}

export class UnconfiguredKeyManagement implements KeyManagementPort {
  async wrapDataKey(
    _context: KeyContext,
    _plaintextDataKey: Uint8Array,
  ): Promise<WrappedDataKey> {
    throw new KeyManagementUnavailableError();
  }

  async unwrapDataKey(
    _context: KeyContext,
    _wrapped: WrappedDataKey,
  ): Promise<Uint8Array> {
    throw new KeyManagementUnavailableError();
  }
}

export interface ProtectedEnvelope {
  readonly algorithm: "AES-256-GCM";
  readonly keyPurpose: KeyPurpose;
  readonly keyVersion: string;
  readonly wrappedKey: string;
  readonly initializationVector: string;
  readonly authenticationTag: string;
  readonly ciphertext: string;
}

export async function protectSensitiveBytes(
  kms: KeyManagementPort,
  context: KeyContext,
  plaintext: Uint8Array,
): Promise<ProtectedEnvelope> {
  assertContext(context);
  // Cada valor recebe uma chave de dados aleatória. O KMS protege somente essa
  // chave, permitindo trocar a chave mestra sem recriptografar todo o conteúdo.
  const dataKey = randomBytes(32);
  const initializationVector = randomBytes(12);
  try {
    const wrapped = await kms.wrapDataKey(context, dataKey);
    if (
      wrapped.keyVersion.trim().length === 0 ||
      wrapped.keyVersion.length > 200 ||
      wrapped.wrappedKey.byteLength === 0
    ) {
      throw new KeyManagementUnavailableError();
    }
    const cipher = createCipheriv(
      "aes-256-gcm",
      dataKey,
      initializationVector,
      { authTagLength: 16 },
    );
    // O contexto autenticado vincula a cifra à finalidade, empresa, campo,
    // registro e versão. Mover o envelope para outro contexto invalida a leitura.
    cipher.setAAD(contextBytes(context));
    const ciphertext = Buffer.concat([
      cipher.update(plaintext),
      cipher.final(),
    ]);
    return {
      algorithm: "AES-256-GCM",
      keyPurpose: context.purpose,
      keyVersion: wrapped.keyVersion,
      wrappedKey: Buffer.from(wrapped.wrappedKey).toString("base64"),
      initializationVector: initializationVector.toString("base64"),
      authenticationTag: cipher.getAuthTag().toString("base64"),
      ciphertext: ciphertext.toString("base64"),
    };
  } catch (error) {
    if (error instanceof KeyManagementUnavailableError) throw error;
    throw new KeyManagementUnavailableError();
  } finally {
    // Reduz a permanência da chave em memória, inclusive quando a operação falha.
    dataKey.fill(0);
  }
}

export async function revealSensitiveBytes(
  kms: KeyManagementPort,
  context: KeyContext,
  envelope: ProtectedEnvelope,
): Promise<Uint8Array> {
  assertContext(context);
  if (
    envelope.algorithm !== "AES-256-GCM" ||
    envelope.keyPurpose !== context.purpose ||
    envelope.keyVersion.trim().length === 0 ||
    envelope.keyVersion.length > 200
  ) {
    throw new ProtectedDataUnavailableError();
  }

  let dataKey: Uint8Array | undefined;
  try {
    const wrappedKey = decodeCanonicalBase64(envelope.wrappedKey);
    const initializationVector = decodeCanonicalBase64(
      envelope.initializationVector,
      12,
    );
    const authenticationTag = decodeCanonicalBase64(
      envelope.authenticationTag,
      16,
    );
    const ciphertext = decodeCanonicalBase64(envelope.ciphertext);
    if (wrappedKey.byteLength === 0) throw new ProtectedDataUnavailableError();

    dataKey = await kms.unwrapDataKey(context, {
      keyVersion: envelope.keyVersion,
      wrappedKey,
    });
    if (dataKey.byteLength !== 32) throw new ProtectedDataUnavailableError();
    const decipher = createDecipheriv(
      "aes-256-gcm",
      dataKey,
      initializationVector,
      { authTagLength: 16 },
    );
    // A leitura exige exatamente o mesmo contexto usado durante a proteção.
    decipher.setAAD(contextBytes(context));
    decipher.setAuthTag(authenticationTag);
    return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  } catch (error) {
    if (error instanceof KeyManagementUnavailableError) throw error;
    if (error instanceof ProtectedDataUnavailableError) throw error;
    throw new ProtectedDataUnavailableError();
  } finally {
    // A chave desembrulhada também não deve permanecer reutilizável na memória.
    dataKey?.fill(0);
  }
}

function contextBytes(context: KeyContext): Buffer {
  return Buffer.from(
    JSON.stringify([
      "portal-dp-envelope-v1",
      context.purpose,
      context.entityType,
      context.fieldName,
      context.companyId,
      context.recordId,
      context.recordVersion,
    ]),
    "utf8",
  );
}

function assertContext(context: KeyContext): void {
  for (const value of [
    context.companyId,
    context.entityType,
    context.fieldName,
    context.recordId,
  ]) {
    if (value.trim().length === 0 || value.length > 200) {
      throw new ProtectedDataUnavailableError();
    }
  }
  if (
    !Number.isSafeInteger(context.recordVersion) ||
    context.recordVersion < 1
  ) {
    throw new ProtectedDataUnavailableError();
  }
}

function decodeCanonicalBase64(value: string, length?: number): Buffer {
  // Somente Base64 canônico é aceito para eliminar representações ambíguas ou
  // malformadas antes de enviar material ao KMS ou ao decifrador.
  if (
    value.length > 8_000_000 ||
    !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/u.test(
      value,
    )
  ) {
    throw new ProtectedDataUnavailableError();
  }
  const decoded = Buffer.from(value, "base64");
  if (
    decoded.toString("base64") !== value ||
    (length !== undefined && decoded.byteLength !== length)
  ) {
    throw new ProtectedDataUnavailableError();
  }
  return decoded;
}
