import {
  ClosedMinimumCatalog,
  MinimumGlobalBusinessModelService,
  globalBusinessModelId,
  modelAuthorId,
  parseUuid,
  type GlobalBusinessModel,
  type Uuid,
} from "@portal-dp/domain";
import {
  contextVersion,
  csrfToken,
  idempotencyKey,
  utcInstantText,
  uuid,
  type SyntheticEnterpriseCommand,
} from "@portal-dp/contracts";

import { FixedClock } from "./fixed-clock.js";

export type FixtureCompanyId = Uuid<"FixtureCompany">;
export type PlannedMasterId = Uuid<"PlannedMaster">;

export interface PlannedMasterFixture {
  readonly id: PlannedMasterId;
  readonly nome: string;
  readonly email: string;
  readonly estado: "PREVISTO_SEM_LOGIN";
}

export interface CompanyFixture {
  readonly id: FixtureCompanyId;
  readonly codigo: "A" | "B" | "C";
  readonly nome: string;
}

export interface Etp00Fixture {
  readonly fixtureVersion: "ETP00_FIXTURE_V1";
  readonly generatedAt: "2026-08-22T12:00:00.000Z";
  readonly mastersPrevistos: readonly [
    PlannedMasterFixture,
    PlannedMasterFixture,
  ];
  readonly companies: readonly [CompanyFixture, CompanyFixture, CompanyFixture];
  readonly model: GlobalBusinessModel;
  readonly technicalActorId: Uuid<"SyntheticActor">;
  readonly publicSession: {
    readonly csrfToken: ReturnType<typeof csrfToken>;
    readonly contextVersion: ReturnType<typeof contextVersion>;
  };
}

export const ETP00_IDS = Object.freeze({
  master1: "10000000-0000-4000-8000-000000000001",
  master2: "10000000-0000-4000-8000-000000000002",
  model: "30000000-0000-4000-8000-000000000001",
  companyA: "00000000-0000-4000-8000-00000000000a",
  companyB: "00000000-0000-4000-8000-00000000000b",
  companyC: "00000000-0000-4000-8000-00000000000c",
  technicalActor: "10000000-0000-4000-8000-000000000001",
  fixtureRecordA: "20000000-0000-4000-8000-00000000000a",
  recordA: "21000000-0000-4000-8000-00000000000a",
  correlationA: "40000000-0000-4000-8000-000000000001",
  operationA: "50000000-0000-4000-8000-000000000001",
  outboxA: "60000000-0000-4000-8000-000000000001",
  privateFileA: "70000000-0000-4000-8000-000000000001",
});

export const ETP00_MINIMUM_CATALOG_CODES = Object.freeze([
  "EMPRESA.SINTETICA.LER",
  "EMPRESA.SINTETICA.ALTERAR",
  "ARQUIVO.SINTETICO.BAIXAR",
] as const);

export function createEtp00Fixture(): Etp00Fixture {
  const clock = new FixedClock("2026-08-22T12:00:00.000Z");
  const catalog = new ClosedMinimumCatalog("v1", ETP00_MINIMUM_CATALOG_CODES);
  const service = new MinimumGlobalBusinessModelService(catalog, clock);
  const author = modelAuthorId(ETP00_IDS.master1);
  const model = service.createInitial({
    id: globalBusinessModelId(ETP00_IDS.model),
    name: "Modelo empresarial mínimo ETP-00",
    createdBy: author,
    grantedCodes: ["EMPRESA.SINTETICA.LER", "EMPRESA.SINTETICA.ALTERAR"],
  });

  const mastersPrevistos = Object.freeze([
    Object.freeze({
      id: parseUuid<"PlannedMaster">(ETP00_IDS.master1),
      nome: "Master sintético 1",
      email: "master1@example.invalid",
      estado: "PREVISTO_SEM_LOGIN" as const,
    }),
    Object.freeze({
      id: parseUuid<"PlannedMaster">(ETP00_IDS.master2),
      nome: "Master sintético 2",
      email: "master2@example.invalid",
      estado: "PREVISTO_SEM_LOGIN" as const,
    }),
  ] as const);

  const companies = Object.freeze([
    Object.freeze({
      id: parseUuid<"FixtureCompany">(ETP00_IDS.companyA),
      codigo: "A" as const,
      nome: "Empresa sintética A",
    }),
    Object.freeze({
      id: parseUuid<"FixtureCompany">(ETP00_IDS.companyB),
      codigo: "B" as const,
      nome: "Empresa sintética B",
    }),
    Object.freeze({
      id: parseUuid<"FixtureCompany">(ETP00_IDS.companyC),
      codigo: "C" as const,
      nome: "Empresa sintética C",
    }),
  ] as const);

  return Object.freeze({
    fixtureVersion: "ETP00_FIXTURE_V1" as const,
    generatedAt: "2026-08-22T12:00:00.000Z" as const,
    mastersPrevistos,
    companies,
    model,
    technicalActorId: parseUuid<"SyntheticActor">(ETP00_IDS.technicalActor),
    publicSession: Object.freeze({
      csrfToken: csrfToken("csrf-etp00-deterministico"),
      contextVersion: contextVersion("contexto-publico-etp00-v1"),
    }),
  });
}

export function createSyntheticCommandForCompanyA(): SyntheticEnterpriseCommand {
  return Object.freeze({
    ator_id: uuid<"Ator">(ETP00_IDS.technicalActor),
    correlacao_id: uuid<"Correlacao">(ETP00_IDS.correlationA),
    idempotency_key: idempotencyKey("idem-etp00-empresa-a-0001"),
    intencao: Object.freeze({
      empresa_id: uuid<"Empresa">(ETP00_IDS.companyA),
      registro_id: uuid<"RegistroSintetico">(ETP00_IDS.recordA),
      codigo: "PROVA.VERTICAL",
      valor: "valor-a",
    }),
  });
}

export const ETP00_GENERATED_AT = utcInstantText("2026-08-22T12:00:00.000Z");
