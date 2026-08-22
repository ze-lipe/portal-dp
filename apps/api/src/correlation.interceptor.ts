import { randomUUID } from "node:crypto";

import {
  type ExecutionContext,
  Injectable,
  type NestInterceptor,
} from "@nestjs/common";
import type { CallHandler } from "@nestjs/common";
import type { FastifyReply, FastifyRequest } from "fastify";
import type { Observable } from "rxjs";

const safeCorrelationId =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu;

@Injectable()
export class CorrelationInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const reply = context.switchToHttp().getResponse<FastifyReply>();
    const requested = request.headers["x-correlation-id"];
    const correlationId =
      typeof requested === "string" && safeCorrelationId.test(requested)
        ? requested
        : randomUUID();

    request.headers["x-correlation-id"] = correlationId;
    reply.header("x-correlation-id", correlationId);
    return next.handle();
  }
}
