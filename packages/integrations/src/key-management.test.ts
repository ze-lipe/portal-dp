import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

import { describe, expect, it } from "vitest";

import {
  KeyManagementUnavailableError,
  ProtectedDataUnavailableError,
  protectSensitiveBytes,
  revealSensitiveBytes,
  UnconfiguredKeyManagement,
  type KeyContext,
  type KeyManagementPort,
  type WrappedDataKey,
} from "./key-management.js";

class RotatingSyntheticKeyManagement implements KeyManagementPort {
  readonly #keys = new Map<string, Buffer>();
  #activeVersion = "synthetic-v1";
  lastWrappedDataKey?: Uint8Array;
  lastUnwrappedDataKey?: Uint8Array;

  rotate(): void {
    this.#activeVersion = "synthetic-v2";
  }

  retire(version: string): void {
    this.#keys.delete(version);
  }

  async wrapDataKey(
    context: KeyContext,
    plaintextDataKey: Uint8Array,
  ): Promise<WrappedDataKey> {
    this.lastWrappedDataKey = plaintextDataKey;
    const keyVersion = `${context.purpose}:${this.#activeVersion}`;
    const wrappingKey = this.#keys.get(keyVersion) ?? randomBytes(32);
    this.#keys.set(keyVersion, wrappingKey);
    const iv = randomBytes(12);
    const cipher = createCipheriv("aes-256-gcm", wrappingKey, iv, {
      authTagLength: 16,
    });
    cipher.setAAD(syntheticContext(context));
    const wrapped = Buffer.concat([
      cipher.update(plaintextDataKey),
      cipher.final(),
    ]);
    return {
      keyVersion,
      wrappedKey: Buffer.concat([iv, cipher.getAuthTag(), wrapped]),
    };
  }

  async unwrapDataKey(
    context: KeyContext,
    wrapped: WrappedDataKey,
  ): Promise<Uint8Array> {
    const wrappingKey = this.#keys.get(wrapped.keyVersion);
    if (!wrappingKey) throw new KeyManagementUnavailableError();
    const bytes = Buffer.from(wrapped.wrappedKey);
    const decipher = createDecipheriv(
      "aes-256-gcm",
      wrappingKey,
      bytes.subarray(0, 12),
      { authTagLength: 16 },
    );
    decipher.setAAD(syntheticContext(context));
    decipher.setAuthTag(bytes.subarray(12, 28));
    const dataKey = Buffer.concat([
      decipher.update(bytes.subarray(28)),
      decipher.final(),
    ]);
    this.lastUnwrappedDataKey = dataKey;
    return dataKey;
  }
}

const baseContext: KeyContext = {
  companyId: "00000000-0000-4000-8000-00000000000a",
  entityType: "employee",
  fieldName: "cpf",
  recordId: "00000000-0000-4000-8000-000000000101",
  recordVersion: 1,
  purpose: "REGISTRATION_DATA",
};

describe("proteção por porta de gerenciamento de chaves", () => {
  it("falha fechado sem KMS e não devolve conteúdo aberto", async () => {
    const plaintext = Buffer.from("synthetic-sensitive-value", "utf8");
    await expect(
      protectSensitiveBytes(
        new UnconfiguredKeyManagement(),
        baseContext,
        plaintext,
      ),
    ).rejects.toMatchObject({ safeCode: "KEY_MANAGEMENT_UNAVAILABLE" });
  });

  it("separa finalidade, preserva versões e zera chaves de dados", async () => {
    const kms = new RotatingSyntheticKeyManagement();
    const plaintext = Buffer.from("synthetic-sensitive-value", "utf8");
    const versionOne = await protectSensitiveBytes(kms, baseContext, plaintext);
    expect(versionOne.ciphertext).not.toContain(plaintext.toString("utf8"));
    expect(allZeros(kms.lastWrappedDataKey)).toBe(true);

    kms.rotate();
    const objectContext: KeyContext = {
      ...baseContext,
      entityType: "private_object",
      fieldName: "content",
      purpose: "PRIVATE_OBJECT",
    };
    const versionTwo = await protectSensitiveBytes(
      kms,
      objectContext,
      plaintext,
    );
    expect(versionTwo.keyVersion).not.toBe(versionOne.keyVersion);
    await expect(
      revealSensitiveBytes(kms, baseContext, versionOne),
    ).resolves.toEqual(plaintext);
    expect(allZeros(kms.lastUnwrappedDataKey)).toBe(true);

    kms.retire(versionOne.keyVersion);
    await expect(
      revealSensitiveBytes(kms, baseContext, versionOne),
    ).rejects.toBeInstanceOf(KeyManagementUnavailableError);
  });

  it("rejeita transplante entre campo, registro ou versão", async () => {
    const kms = new RotatingSyntheticKeyManagement();
    const envelope = await protectSensitiveBytes(
      kms,
      baseContext,
      Buffer.from("synthetic-sensitive-value", "utf8"),
    );
    for (const context of [
      { ...baseContext, fieldName: "address" },
      {
        ...baseContext,
        recordId: "00000000-0000-4000-8000-000000000102",
      },
      { ...baseContext, recordVersion: 2 },
    ]) {
      await expect(
        revealSensitiveBytes(kms, context, envelope),
      ).rejects.toBeInstanceOf(ProtectedDataUnavailableError);
    }
  });

  it("rejeita tag GCM truncada e Base64 não canônico", async () => {
    const kms = new RotatingSyntheticKeyManagement();
    const envelope = await protectSensitiveBytes(
      kms,
      baseContext,
      Buffer.from("synthetic-sensitive-value", "utf8"),
    );
    await expect(
      revealSensitiveBytes(kms, baseContext, {
        ...envelope,
        authenticationTag: Buffer.from(envelope.authenticationTag, "base64")
          .subarray(0, 8)
          .toString("base64"),
      }),
    ).rejects.toBeInstanceOf(ProtectedDataUnavailableError);
    await expect(
      revealSensitiveBytes(kms, baseContext, {
        ...envelope,
        initializationVector: "%%%",
      }),
    ).rejects.toBeInstanceOf(ProtectedDataUnavailableError);
  });

  it("normaliza erro bruto do adaptador sem revelar sua mensagem", async () => {
    const unsafeMessage = "sdk-secret-provider-detail";
    const broken: KeyManagementPort = {
      async wrapDataKey() {
        throw new Error(unsafeMessage);
      },
      async unwrapDataKey() {
        throw new Error(unsafeMessage);
      },
    };
    let error: unknown;
    try {
      await protectSensitiveBytes(
        broken,
        baseContext,
        Buffer.from("synthetic-sensitive-value", "utf8"),
      );
    } catch (caught) {
      error = caught;
    }
    expect(error).toBeInstanceOf(KeyManagementUnavailableError);
    expect(String(error)).not.toContain(unsafeMessage);
  });
});

function syntheticContext(context: KeyContext): Buffer {
  return Buffer.from(
    JSON.stringify([
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

function allZeros(value: Uint8Array | undefined): boolean {
  return value !== undefined && value.every((byte) => byte === 0);
}
