import { Inject, Injectable } from "@nestjs/common";
import type { CanActivate, ExecutionContext } from "@nestjs/common";
import type { FastifyRequest } from "fastify";

import { APP_CONFIG, type AppConfig } from "./config.js";
import { isUnsafeRequestAuthorized } from "./csrf.js";

const safeMethods = new Set(["GET", "HEAD", "OPTIONS"]);

@Injectable()
export class UnsafeOriginGuard implements CanActivate {
  constructor(@Inject(APP_CONFIG) private readonly config: AppConfig) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<FastifyRequest>();
    if (safeMethods.has(request.method)) return true;

    return isUnsafeRequestAuthorized({
      origin: request.headers.origin,
      expectedOrigin: this.config.webOrigin,
      cookie: request.headers.cookie,
      csrfHeader: request.headers["x-csrf-token"],
    });
  }
}
