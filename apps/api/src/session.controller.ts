import { randomBytes, randomUUID } from "node:crypto";

import { Controller, Get, Inject, Req, Res } from "@nestjs/common";
import {
  contextVersion,
  createPublicSessionResponse,
  csrfToken,
  utcInstantText,
  uuid,
  type PublicSessionResponse,
} from "@portal-dp/contracts";
import type { FastifyReply, FastifyRequest } from "fastify";

import { APP_CONFIG, type AppConfig } from "./config.js";
import { createCsrfCookie } from "./csrf.js";

@Controller()
export class SessionController {
  constructor(@Inject(APP_CONFIG) private readonly config: AppConfig) {}

  @Get("sessao")
  publicSession(
    @Req() request: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
  ): PublicSessionResponse {
    const requestedCorrelation = request.headers["x-correlation-id"];
    const correlationId =
      typeof requestedCorrelation === "string"
        ? requestedCorrelation
        : randomUUID();
    const publicContextVersion = contextVersion(
      `public-etp00-${this.config.appVersion}`,
    );
    const token = csrfToken(randomBytes(32).toString("base64url"));
    reply.header("cache-control", "no-store");
    reply.header("x-context-version", publicContextVersion);
    reply.header(
      "set-cookie",
      createCsrfCookie(token, this.config.nodeEnv === "production"),
    );
    return createPublicSessionResponse({
      csrfToken: token,
      contextVersion: publicContextVersion,
      correlationId: uuid<"Correlacao">(correlationId),
      generatedAt: utcInstantText(new Date().toISOString()),
    });
  }
}
