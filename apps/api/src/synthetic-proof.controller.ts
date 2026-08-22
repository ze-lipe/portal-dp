import { createHash, randomUUID } from "node:crypto";

import {
  BadRequestException,
  Controller,
  Inject,
  NotFoundException,
  Param,
  Patch,
  Req,
  Res,
  Body,
} from "@nestjs/common";
import {
  idempotencyKey,
  uuid,
  type SyntheticEnterpriseCommand,
} from "@portal-dp/contracts";
import {
  SyntheticAuthorizationDeniedError,
  SyntheticContextVersionConflictError,
  SyntheticVersionConflictError,
} from "@portal-dp/database";
import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

import { APP_CONFIG, type AppConfig } from "./config.js";
import { DatabaseService } from "./database.service.js";

const requestSchema = z
  .object({
    registroId: z.string().uuid(),
    empresaId: z.string().uuid(),
    atorId: z.string().uuid(),
    idempotencyKey: z.string().min(8).max(200),
    contextVersion: z.coerce.number().int().positive(),
    codigo: z.string().regex(/^[A-Z][A-Z0-9_.-]{2,79}$/u),
    valor: z
      .string()
      .min(1)
      .max(200)
      .regex(/^[^\r\n]+$/u),
    versaoEsperada: z.number().int().positive(),
  })
  .strict();

@Controller("etp00/provas-sinteticas")
export class SyntheticProofController {
  constructor(
    @Inject(APP_CONFIG) private readonly config: AppConfig,
    private readonly database: DatabaseService,
  ) {}

  @Patch(":registroId")
  async update(
    @Param("registroId") registroId: string,
    @Body() body: unknown,
    @Req() request: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
  ): Promise<unknown> {
    if (this.config.nodeEnv !== "test" || !this.config.syntheticProofEnabled) {
      throw new NotFoundException();
    }
    const objectBody =
      typeof body === "object" && body !== null
        ? (body as Record<string, unknown>)
        : {};
    const parsed = requestSchema.safeParse({
      registroId,
      empresaId: singleHeader(request.headers["x-company-id"]),
      atorId: singleHeader(request.headers["x-actor-id"]),
      idempotencyKey: singleHeader(request.headers["idempotency-key"]),
      contextVersion: singleHeader(request.headers["x-context-version"]),
      codigo: objectBody["codigo"],
      valor: objectBody["valor"],
      versaoEsperada: objectBody["versao_esperada"],
    });
    if (!parsed.success) {
      throw new BadRequestException("Requisicao sintetica invalida.");
    }

    const correlationId = singleHeader(request.headers["x-correlation-id"]);
    if (!correlationId) {
      throw new Error("Correlation interceptor did not establish context");
    }
    const command: SyntheticEnterpriseCommand = {
      ator_id: uuid<"Ator">(parsed.data.atorId),
      correlacao_id: uuid<"Correlacao">(correlationId),
      idempotency_key: idempotencyKey(parsed.data.idempotencyKey),
      intencao: {
        empresa_id: uuid<"Empresa">(parsed.data.empresaId),
        registro_id: uuid<"RegistroSintetico">(parsed.data.registroId),
        codigo: parsed.data.codigo,
        valor: parsed.data.valor,
        versao_esperada: parsed.data.versaoEsperada,
      },
    };

    try {
      const result = await this.database.executeSyntheticCommand(
        command,
        {
          operationId: uuid<"Operacao">(
            syntheticOperationIdForRequest({
              companyId: parsed.data.empresaId,
              actorId: parsed.data.atorId,
              idempotencyKey: parsed.data.idempotencyKey,
            }),
          ),
          outboxTaskId: uuid<"MensagemOutbox">(randomUUID()),
          privateObjectId: uuid<"ArquivoPrivado">(randomUUID()),
        },
        { expectedContextVersion: parsed.data.contextVersion },
      );
      if (result.resultado === "EM_PROCESSAMENTO") {
        reply.status(202);
      } else if (result.resultado === "CHAVE_NATURAL_EXISTENTE") {
        reply.status(409).type("application/json");
      }
      return result;
    } catch (error) {
      if (error instanceof SyntheticAuthorizationDeniedError) {
        throw new NotFoundException("Recurso nao encontrado.");
      }
      if (error instanceof SyntheticVersionConflictError) {
        reply.status(409).type("application/problem+json");
        return conflictProblem({
          code: error.code,
          detail: "O registro foi alterado. Recarregue a versao atual.",
          correlationId,
          instance: request.url,
          currentVersion: error.currentVersion,
        });
      }
      if (error instanceof SyntheticContextVersionConflictError) {
        reply.status(409).type("application/problem+json");
        return conflictProblem({
          code: error.code,
          detail:
            "O contexto empresarial mudou. Selecione a empresa novamente.",
          correlationId,
          instance: request.url,
          currentVersion: error.currentContextVersion,
        });
      }
      throw error;
    }
  }
}

export function syntheticOperationIdForRequest(input: {
  companyId: string;
  actorId: string;
  idempotencyKey: string;
}): string {
  // A mesma identidade causal produz o mesmo UUID em cada retry HTTP. Assim,
  // a chave nunca é reconciliada com uma operação aleatória diferente.
  const bytes = createHash("sha256")
    .update(
      JSON.stringify([
        "ETP00_HTTP_OPERATION_V1",
        input.companyId,
        input.actorId,
        input.idempotencyKey,
      ]),
    )
    .digest()
    .subarray(0, 16);
  bytes[6] = (bytes[6]! & 0x0f) | 0x50;
  bytes[8] = (bytes[8]! & 0x3f) | 0x80;
  const hex = bytes.toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function singleHeader(
  value: string | string[] | undefined,
): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function conflictProblem(input: {
  code: string;
  detail: string;
  correlationId: string;
  instance: string;
  currentVersion: number;
}): Record<string, unknown> {
  // A resposta expõe somente a versão necessária à atualização; código,
  // valor, empresa e identificadores internos da operação não retornam.
  return {
    type: "https://portal-dp.invalid/problems/conflito-de-versao",
    title: "Conflito",
    status: 409,
    code: input.code,
    detail: input.detail,
    instance: input.instance,
    correlacao_id: input.correlationId,
    versao_atual: input.currentVersion,
  };
}
