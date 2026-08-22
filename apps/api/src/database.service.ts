import { Inject, Injectable } from "@nestjs/common";
import type { OnApplicationShutdown, OnModuleInit } from "@nestjs/common";
import type {
  SyntheticEnterpriseCommand,
  SyntheticEnterpriseResult,
} from "@portal-dp/contracts";
import {
  assertLimitedServiceRole,
  executeSyntheticEnterpriseCommand,
  type SyntheticProofInfrastructureIds,
  type SyntheticProofPreconditions,
} from "@portal-dp/database";
import { Pool } from "pg";

import { APP_CONFIG, type AppConfig } from "./config.js";

export const DATABASE = Symbol("DATABASE");

@Injectable()
export class DatabaseService implements OnModuleInit, OnApplicationShutdown {
  readonly #pool: Pool;

  constructor(@Inject(APP_CONFIG) config: AppConfig) {
    this.#pool = new Pool({
      connectionString: config.databaseUrl,
      application_name: `${config.appName}-api`,
      max: 10,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 2_000,
      allowExitOnIdle: config.nodeEnv === "test",
    });
  }

  async onModuleInit(): Promise<void> {
    // A aplicação deve usar o papel limitado, nunca o proprietário do banco ou
    // uma identidade capaz de ignorar o isolamento multiempresa.
    await assertLimitedServiceRole(
      this.#pool,
      "portal_dp_app",
      "portal_dp_app_login",
    );
  }

  async probe(): Promise<void> {
    await this.#pool.query("select 1 as ready");
  }

  async executeSyntheticCommand(
    command: SyntheticEnterpriseCommand,
    ids: SyntheticProofInfrastructureIds,
    preconditions: SyntheticProofPreconditions,
  ): Promise<SyntheticEnterpriseResult> {
    return executeSyntheticEnterpriseCommand(
      this.#pool,
      command,
      ids,
      preconditions,
    );
  }

  async onApplicationShutdown(): Promise<void> {
    await this.#pool.end();
  }
}
