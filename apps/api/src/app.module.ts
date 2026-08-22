import { Module } from "@nestjs/common";

import { APP_CONFIG, loadConfig } from "./config.js";
import { CorrelationInterceptor } from "./correlation.interceptor.js";
import { DatabaseService } from "./database.service.js";
import { HealthController } from "./health.controller.js";
import { SessionController } from "./session.controller.js";
import { UnsafeOriginGuard } from "./unsafe-origin.guard.js";

@Module({
  controllers: [HealthController, SessionController],
  providers: [
    { provide: APP_CONFIG, useFactory: () => loadConfig() },
    DatabaseService,
    CorrelationInterceptor,
    UnsafeOriginGuard,
  ],
})
export class AppModule {}
