import { type DynamicModule, Module } from "@nestjs/common";

import { APP_CONFIG, type AppConfig } from "./config.js";
import { CorrelationInterceptor } from "./correlation.interceptor.js";
import { DatabaseService } from "./database.service.js";
import { HealthController } from "./health.controller.js";
import { SessionController } from "./session.controller.js";
import { SyntheticProofController } from "./synthetic-proof.controller.js";
import { UnsafeOriginGuard } from "./unsafe-origin.guard.js";

@Module({})
export class AppModule {
  /**
   * Vincula uma unica configuracao validada a toda a instancia da aplicacao.
   * Isso evita que componentes internos releiam variaveis de ambiente diferentes
   * daquelas usadas para configurar a camada HTTP.
   */
  static register(config: AppConfig): DynamicModule {
    return {
      module: AppModule,
      controllers: [
        HealthController,
        SessionController,
        SyntheticProofController,
      ],
      providers: [
        { provide: APP_CONFIG, useValue: config },
        DatabaseService,
        CorrelationInterceptor,
        UnsafeOriginGuard,
      ],
    };
  }
}
