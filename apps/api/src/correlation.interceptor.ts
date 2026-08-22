import {
  type ExecutionContext,
  Injectable,
  type NestInterceptor,
} from "@nestjs/common";
import type { CallHandler } from "@nestjs/common";
import type { FastifyReply, FastifyRequest } from "fastify";
import type { Observable } from "rxjs";

import { normalizedCorrelationId } from "./correlation-id.js";

@Injectable()
export class CorrelationInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const reply = context.switchToHttp().getResponse<FastifyReply>();
    const correlationId = normalizedCorrelationId(
      request.headers["x-correlation-id"],
    );

    request.headers["x-correlation-id"] = correlationId;
    reply.header("x-correlation-id", correlationId);
    return next.handle();
  }
}
