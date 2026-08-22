import { Controller, Get, ServiceUnavailableException } from "@nestjs/common";

import { DatabaseService } from "./database.service.js";

@Controller("health")
export class HealthController {
  constructor(private readonly database: DatabaseService) {}

  @Get("live")
  live(): { status: "alive" } {
    return { status: "alive" };
  }

  @Get("ready")
  async ready(): Promise<{ status: "ready" }> {
    try {
      await this.database.probe();
      return { status: "ready" };
    } catch {
      throw new ServiceUnavailableException(
        "Dependencia obrigatoria indisponivel",
      );
    }
  }
}
