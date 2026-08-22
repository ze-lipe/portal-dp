import { NotFoundException } from "@nestjs/common";
import { SyntheticAuthorizationDeniedError } from "@portal-dp/database";
import type { FastifyReply, FastifyRequest } from "fastify";
import { describe, expect, it, vi } from "vitest";

import type { AppConfig } from "./config.js";
import type { DatabaseService } from "./database.service.js";
import {
  SyntheticProofController,
  syntheticOperationIdForRequest,
} from "./synthetic-proof.controller.js";

const baseIdentity = {
  companyId: "00000000-0000-4000-8000-00000000000a",
  actorId: "10000000-0000-4000-8000-000000000001",
  idempotencyKey: "idem-etp00-http-retry-0001",
};

describe("fronteira HTTP sintética da ETP-00", () => {
  it("mantém a identidade causal em retries e separa outra chave", () => {
    const first = syntheticOperationIdForRequest(baseIdentity);
    expect(syntheticOperationIdForRequest(baseIdentity)).toBe(first);
    expect(
      syntheticOperationIdForRequest({
        ...baseIdentity,
        idempotencyKey: "idem-etp00-http-retry-0002",
      }),
    ).not.toBe(first);
    expect(first).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/u,
    );
  });

  it.each(["development", "homologation", "production"] as const)(
    "não permite habilitar a rota em %s",
    async (nodeEnv) => {
      const controller = createController(nodeEnv, true);
      await expect(
        controller.update(
          "registro-invalido",
          {},
          {} as FastifyRequest,
          {} as FastifyReply,
        ),
      ).rejects.toBeInstanceOf(NotFoundException);
    },
  );

  it("mantém a rota fechada em teste sem habilitação explícita", async () => {
    const controller = createController("test", false);
    await expect(
      controller.update(
        "registro-invalido",
        {},
        {} as FastifyRequest,
        {} as FastifyReply,
      ),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("responde 202 enquanto a mesma operação ainda está em processamento", async () => {
    const execute = vi.fn().mockResolvedValue({
      operacao_id: "20000000-0000-4000-8000-000000000001",
      empresa_id: baseIdentity.companyId,
      registro_id: "30000000-0000-4000-8000-000000000001",
      resultado: "EM_PROCESSAMENTO",
    });
    const controller = createController("test", true, execute);
    const { reply, status } = recordedReply();

    const result = await controller.update(
      "30000000-0000-4000-8000-000000000001",
      validBody(),
      validRequest(),
      reply,
    );

    expect(result).toMatchObject({ resultado: "EM_PROCESSAMENTO" });
    expect(status).toHaveBeenCalledWith(202);
  });

  it("responde 409 JSON para associação autorizada por chave natural", async () => {
    const execute = vi.fn().mockResolvedValue({
      operacao_id: "20000000-0000-4000-8000-000000000001",
      empresa_id: baseIdentity.companyId,
      registro_id: "30000000-0000-4000-8000-000000000002",
      versao_final: 1,
      resultado: "CHAVE_NATURAL_EXISTENTE",
    });
    const controller = createController("test", true, execute);
    const { reply, status, type } = recordedReply();

    const result = await controller.update(
      "30000000-0000-4000-8000-000000000001",
      validBody(),
      validRequest(),
      reply,
    );

    expect(result).toMatchObject({ resultado: "CHAVE_NATURAL_EXISTENTE" });
    expect(status).toHaveBeenCalledWith(409);
    expect(type).toHaveBeenCalledWith("application/json");
  });

  it("converte negação empresarial em ausência neutra", async () => {
    const execute = vi
      .fn()
      .mockRejectedValue(new SyntheticAuthorizationDeniedError());
    const controller = createController("test", true, execute);

    await expect(
      controller.update(
        "30000000-0000-4000-8000-000000000001",
        validBody(),
        validRequest(),
        recordedReply().reply,
      ),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});

function createController(
  nodeEnv: AppConfig["nodeEnv"],
  syntheticProofEnabled: boolean,
  executeSyntheticCommand: ReturnType<typeof vi.fn> = vi.fn(),
): SyntheticProofController {
  const config: AppConfig = {
    nodeEnv,
    appName: "portal-dp-test",
    appVersion: "0.0.0-etp00",
    host: "127.0.0.1",
    port: 3000,
    webOrigin: "http://localhost:5173",
    corsEnabled: nodeEnv !== "production",
    databaseUrl: "postgresql://example.invalid/test",
    syntheticProofEnabled,
  };
  return new SyntheticProofController(config, {
    executeSyntheticCommand,
  } as unknown as DatabaseService);
}

function validBody(): Record<string, unknown> {
  return {
    codigo: "ETP00.TESTE",
    valor: "valor-sintetico",
    versao_esperada: 1,
  };
}

function validRequest(): FastifyRequest {
  return {
    url: "/api/v1/etp00/provas-sinteticas/30000000-0000-4000-8000-000000000001",
    headers: {
      "x-company-id": baseIdentity.companyId,
      "x-actor-id": baseIdentity.actorId,
      "idempotency-key": baseIdentity.idempotencyKey,
      "x-context-version": "1",
      "x-correlation-id": "40000000-0000-4000-8000-000000000001",
    },
  } as unknown as FastifyRequest;
}

function recordedReply(): {
  reply: FastifyReply;
  status: ReturnType<typeof vi.fn>;
  type: ReturnType<typeof vi.fn>;
} {
  const status = vi.fn();
  const type = vi.fn();
  const reply = { status, type } as unknown as FastifyReply;
  status.mockReturnValue(reply);
  type.mockReturnValue(reply);
  return { reply, status, type };
}
