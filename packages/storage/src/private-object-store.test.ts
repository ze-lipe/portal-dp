import { createHash, randomUUID } from "node:crypto";
import { chmod, link, mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { LocalPrivateObjectStore } from "./private-object-store.js";

describe("LocalPrivateObjectStore", () => {
  it("materializa uma unica copia e reconcilia repeticao identica", async () => {
    const root = await mkdtemp(join(tmpdir(), "portal-dp-object-"));
    const store = new LocalPrivateObjectStore(root);
    const bytes = Buffer.from("synthetic-etp00", "utf8");
    const input = {
      companyId: randomUUID(),
      objectId: randomUUID(),
      bytes,
      expectedSha256: createHash("sha256").update(bytes).digest("hex"),
    };

    expect((await store.putIfAbsent(input)).disposition).toBe("CREATED");
    expect((await store.putIfAbsent(input)).disposition).toBe(
      "ALREADY_PRESENT",
    );
  });

  it("publica atomicamente uma unica copia sob concorrencia", async () => {
    const root = await mkdtemp(join(tmpdir(), "portal-dp-object-"));
    const store = new LocalPrivateObjectStore(root);
    const bytes = Buffer.from("synthetic-etp00-concurrent", "utf8");
    const input = {
      companyId: randomUUID(),
      objectId: randomUUID(),
      bytes,
      expectedSha256: createHash("sha256").update(bytes).digest("hex"),
    };

    const results = await Promise.all([
      store.putIfAbsent(input),
      store.putIfAbsent(input),
    ]);

    expect(results.map((result) => result.disposition).sort()).toEqual([
      "ALREADY_PRESENT",
      "CREATED",
    ]);
    await expect(
      store.readAuthorized(input, async () => true),
    ).resolves.toEqual(bytes);
  });

  it("reconcilia destino duravel na janela de queda antes de remover o temporario", async () => {
    const root = await mkdtemp(join(tmpdir(), "portal-dp-object-"));
    const store = new LocalPrivateObjectStore(root);
    const bytes = Buffer.from("synthetic-etp00-crash-window", "utf8");
    const input = {
      companyId: randomUUID(),
      objectId: randomUUID(),
      bytes,
      expectedSha256: createHash("sha256").update(bytes).digest("hex"),
    };
    const directory = join(root, input.companyId);
    const orphan = join(directory, `.${input.objectId}.orphan.tmp`);
    const destination = join(directory, `${input.objectId}.bin`);
    await mkdir(directory, { mode: 0o700 });
    await writeFile(orphan, bytes, { mode: 0o600 });
    await link(orphan, destination);

    await expect(store.putIfAbsent(input)).resolves.toMatchObject({
      disposition: "ALREADY_PRESENT",
      sha256: input.expectedSha256,
    });
  });

  it("reautoriza antes de ler e usa resposta neutra", async () => {
    const root = await mkdtemp(join(tmpdir(), "portal-dp-object-"));
    const store = new LocalPrivateObjectStore(root);
    const bytes = Buffer.from("private", "utf8");
    const input = {
      companyId: randomUUID(),
      objectId: randomUUID(),
      bytes,
      expectedSha256: createHash("sha256").update(bytes).digest("hex"),
    };
    await store.putIfAbsent(input);

    await expect(
      store.readAuthorized(input, async () => false),
    ).rejects.toThrow("not found");
    await expect(
      store.readAuthorized(input, async () => true),
    ).resolves.toEqual(bytes);
  });

  it.skipIf(process.platform === "win32")(
    "falha fechado para raiz ou objeto com permissoes amplas",
    async () => {
      const root = await mkdtemp(join(tmpdir(), "portal-dp-object-"));
      const store = new LocalPrivateObjectStore(root);
      const bytes = Buffer.from("private-permissions", "utf8");
      const input = {
        companyId: randomUUID(),
        objectId: randomUUID(),
        bytes,
        expectedSha256: createHash("sha256").update(bytes).digest("hex"),
      };

      await chmod(root, 0o755);
      await expect(store.putIfAbsent(input)).rejects.toThrow(
        /security validation failed/u,
      );
      await chmod(root, 0o700);
      await store.putIfAbsent(input);
      await chmod(join(root, input.companyId, `${input.objectId}.bin`), 0o644);
      await expect(
        store.readAuthorized(input, async () => true),
      ).rejects.toThrow(/security validation failed/u);
    },
  );
});
