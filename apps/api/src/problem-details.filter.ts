import {
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import type { ArgumentsHost } from "@nestjs/common";
import type { FastifyReply, FastifyRequest } from "fastify";

import { normalizedCorrelationId } from "./correlation-id.js";

@Catch()
export class ProblemDetailsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const request = host.switchToHttp().getRequest<FastifyRequest>();
    const reply = host.switchToHttp().getResponse<FastifyReply>();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const correlationId = normalizedCorrelationId(
      request.headers["x-correlation-id"],
    );
    // Erros internos recebem mensagem genérica. O diagnóstico usa a correlação,
    // sem devolver detalhes técnicos ou dados protegidos ao navegador.
    const publicDetail =
      status >= 500
        ? "Nao foi possivel concluir a operacao."
        : exception instanceof HttpException
          ? exception.message
          : "Requisicao invalida.";

    void reply
      .header("x-correlation-id", correlationId)
      .status(status)
      .type("application/problem+json")
      .send({
        type: `https://portal-dp.invalid/problems/http-${status}`,
        title: HttpStatus[status] ?? "Erro",
        status,
        code: `HTTP_${status}`,
        detail: publicDetail,
        instance: request.url,
        correlacao_id: correlationId,
      });
  }
}
