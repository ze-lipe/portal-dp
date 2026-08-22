import { resolve } from "node:path";

import helmet from "@fastify/helmet";
import fastifyStatic from "@fastify/static";
import { NestFactory } from "@nestjs/core";
import {
  FastifyAdapter,
  type NestFastifyApplication,
} from "@nestjs/platform-fastify";
import { recordHttpServerRequest } from "@portal-dp/observability";

import { AppModule } from "./app.module.js";
import type { AppConfig } from "./config.js";
import { CorrelationInterceptor } from "./correlation.interceptor.js";
import { ProblemDetailsFilter } from "./problem-details.filter.js";
import { UnsafeOriginGuard } from "./unsafe-origin.guard.js";

export async function createApiApplication(
  config: AppConfig,
): Promise<NestFastifyApplication> {
  // Estas opções impedem coerção silenciosa, remoção de campos e propriedades
  // especiais. Alterá-las exige nova avaliação de segurança.
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      bodyLimit: 1024 * 1024,
      trustProxy: false,
      requestIdHeader: false,
      onProtoPoisoning: "error",
      onConstructorPoisoning: "error",
      ajv: {
        customOptions: {
          allErrors: false,
          coerceTypes: false,
          removeAdditional: false,
          useDefaults: false,
        },
      },
    }),
    { bufferLogs: true },
  );

  app
    .getHttpAdapter()
    .getInstance()
    .addHook("onResponse", (request, reply, done) => {
      recordHttpServerRequest({
        method: request.method,
        statusCode: reply.statusCode,
        durationMs: reply.elapsedTime,
      });
      done();
    });

  await app.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        baseUri: ["'self'"],
        connectSrc: ["'self'"],
        frameAncestors: ["'none'"],
        imgSrc: ["'self'", "data:"],
        objectSrc: ["'none'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'"],
      },
    },
  });
  if (config.corsEnabled) {
    app.enableCors({
      origin: config.webOrigin,
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    });
  }
  app.setGlobalPrefix("api/v1", {
    exclude: ["health/live", "health/ready"],
  });
  app.useGlobalInterceptors(app.get(CorrelationInterceptor));
  app.useGlobalGuards(app.get(UnsafeOriginGuard));
  app.useGlobalFilters(new ProblemDetailsFilter());
  if (config.nodeEnv === "production") {
    await app.register(fastifyStatic, {
      root: resolve(import.meta.dirname, "../../web/dist"),
      prefix: "/",
      index: ["index.html"],
      serveDotFiles: false,
      cacheControl: true,
    });
  }
  return app;
}
