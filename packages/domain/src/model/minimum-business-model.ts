import { DomainInvariantError } from "../errors.js";
import type { Clock } from "../primitives/clock.js";
import type { UtcInstant } from "../primitives/instant.js";
import { parseUuid, type Opaque, type Uuid } from "../primitives/opaque.js";
import { Version } from "../primitives/version.js";

export type MinimumCatalogCode = Opaque<string, "MinimumCatalogCode">;
export type GlobalBusinessModelId = Uuid<"GlobalBusinessModel">;
export type ModelAuthorId = Uuid<"ModelAuthor">;

const CATALOG_CODE_PATTERN = /^[A-Z][A-Z0-9_]*(?:\.[A-Z][A-Z0-9_]*)+$/;

export function minimumCatalogCode(value: string): MinimumCatalogCode {
  if (!CATALOG_CODE_PATTERN.test(value)) {
    throw new DomainInvariantError(
      "CODIGO_CATALOGO_INVALIDO",
      "O código do catálogo deve ser canônico, fechado e segmentado.",
    );
  }

  return value as MinimumCatalogCode;
}

export function globalBusinessModelId(value: string): GlobalBusinessModelId {
  return parseUuid<"GlobalBusinessModel">(value);
}

export function modelAuthorId(value: string): ModelAuthorId {
  return parseUuid<"ModelAuthor">(value);
}

export class ClosedMinimumCatalog {
  readonly version: string;
  readonly codes: readonly MinimumCatalogCode[];
  private readonly codeSet: ReadonlySet<string>;

  constructor(version: string, codes: readonly string[]) {
    if (!/^v[1-9]\d*$/.test(version)) {
      throw new DomainInvariantError(
        "VERSAO_CATALOGO_INVALIDA",
        "A versão do catálogo deve usar v seguido de inteiro positivo.",
      );
    }

    const normalized = codes.map(minimumCatalogCode).sort();
    if (
      normalized.length === 0 ||
      new Set(normalized).size !== normalized.length
    ) {
      throw new DomainInvariantError(
        "CATALOGO_MINIMO_INVALIDO",
        "O catálogo mínimo deve conter códigos únicos.",
      );
    }

    this.version = version;
    this.codes = Object.freeze(normalized);
    this.codeSet = new Set<string>(normalized);
    Object.freeze(this);
  }

  knows(code: string): boolean {
    return this.codeSet.has(code);
  }

  assertKnown(code: string): MinimumCatalogCode {
    if (!this.knows(code)) {
      throw new DomainInvariantError(
        "RECURSO_FORA_CATALOGO",
        `O recurso ${code} não pertence ao catálogo mínimo fechado.`,
      );
    }

    return code as MinimumCatalogCode;
  }

  signature(): string {
    return `${this.version}:${this.codes.join("|")}`;
  }
}

export class GlobalBusinessModelVersion {
  readonly version: Version;
  readonly previousVersion: Version | null;
  readonly name: string;
  readonly catalogVersion: string;
  readonly catalogSignature: string;
  readonly createdAt: UtcInstant;
  readonly createdBy: ModelAuthorId;
  readonly grantedCodes: readonly MinimumCatalogCode[];
  private readonly grantedSet: ReadonlySet<string>;
  private readonly catalog: ClosedMinimumCatalog;

  private constructor(input: {
    readonly version: Version;
    readonly previousVersion: Version | null;
    readonly name: string;
    readonly catalog: ClosedMinimumCatalog;
    readonly createdAt: UtcInstant;
    readonly createdBy: ModelAuthorId;
    readonly grantedCodes: readonly string[];
  }) {
    const normalizedName = input.name.trim();
    if (normalizedName.length < 3 || normalizedName.length > 120) {
      throw new DomainInvariantError(
        "NOME_MODELO_INVALIDO",
        "O nome do modelo deve conter entre 3 e 120 caracteres.",
      );
    }

    const grants = input.grantedCodes
      .map((code) => input.catalog.assertKnown(code))
      .sort();
    if (new Set(grants).size !== grants.length) {
      throw new DomainInvariantError(
        "CONCESSAO_DUPLICADA",
        "Uma versão não pode repetir a mesma concessão.",
      );
    }

    this.version = input.version;
    this.previousVersion = input.previousVersion;
    this.name = normalizedName;
    this.catalog = input.catalog;
    this.catalogVersion = input.catalog.version;
    this.catalogSignature = input.catalog.signature();
    this.createdAt = input.createdAt;
    this.createdBy = input.createdBy;
    this.grantedCodes = Object.freeze(grants);
    this.grantedSet = new Set<string>(grants);
    Object.freeze(this);
  }

  static create(input: {
    readonly version: Version;
    readonly previousVersion: Version | null;
    readonly name: string;
    readonly catalog: ClosedMinimumCatalog;
    readonly createdAt: UtcInstant;
    readonly createdBy: ModelAuthorId;
    readonly grantedCodes: readonly string[];
  }): GlobalBusinessModelVersion {
    return new GlobalBusinessModelVersion(input);
  }

  allows(code: string): boolean {
    return this.catalog.knows(code) && this.grantedSet.has(code);
  }

  sameContent(name: string, grants: readonly string[]): boolean {
    const normalizedGrants = [...grants].sort();
    return (
      this.name === name.trim() &&
      this.grantedCodes.length === normalizedGrants.length &&
      this.grantedCodes.every((code, index) => code === normalizedGrants[index])
    );
  }
}

export class GlobalBusinessModel {
  readonly id: GlobalBusinessModelId;
  private readonly history: readonly GlobalBusinessModelVersion[];

  private constructor(
    id: GlobalBusinessModelId,
    history: readonly GlobalBusinessModelVersion[],
  ) {
    this.id = id;
    this.history = Object.freeze([...history]);
    Object.freeze(this);
  }

  static create(
    id: GlobalBusinessModelId,
    initial: GlobalBusinessModelVersion,
  ): GlobalBusinessModel {
    if (
      !initial.version.equals(Version.initial()) ||
      initial.previousVersion !== null
    ) {
      throw new DomainInvariantError(
        "VERSAO_INICIAL_INVALIDA",
        "O modelo deve iniciar na versão 1 e sem versão anterior.",
      );
    }

    return new GlobalBusinessModel(id, [initial]);
  }

  get current(): GlobalBusinessModelVersion {
    const current = this.history[this.history.length - 1];
    if (current === undefined) {
      throw new DomainInvariantError(
        "MODELO_SEM_VERSAO",
        "O modelo global deve possuir ao menos uma versão.",
      );
    }

    return current;
  }

  versions(): readonly GlobalBusinessModelVersion[] {
    return this.history;
  }

  append(version: GlobalBusinessModelVersion): GlobalBusinessModel {
    if (
      version.previousVersion === null ||
      !version.previousVersion.equals(this.current.version) ||
      !version.version.equals(this.current.version.next())
    ) {
      throw new DomainInvariantError(
        "CADEIA_VERSAO_INVALIDA",
        "A nova versão deve suceder exatamente a versão atual.",
      );
    }

    return new GlobalBusinessModel(this.id, [...this.history, version]);
  }
}

export class MinimumGlobalBusinessModelService {
  constructor(
    private readonly catalog: ClosedMinimumCatalog,
    private readonly clock: Clock,
  ) {}

  createInitial(input: {
    readonly id: GlobalBusinessModelId;
    readonly name: string;
    readonly createdBy: ModelAuthorId;
    readonly grantedCodes?: readonly string[];
  }): GlobalBusinessModel {
    const initial = GlobalBusinessModelVersion.create({
      version: Version.initial(),
      previousVersion: null,
      name: input.name,
      catalog: this.catalog,
      createdAt: this.clock.now(),
      createdBy: input.createdBy,
      grantedCodes: input.grantedCodes ?? [],
    });
    return GlobalBusinessModel.create(input.id, initial);
  }

  version(input: {
    readonly model: GlobalBusinessModel;
    readonly expectedVersion: Version;
    readonly name: string;
    readonly changedBy: ModelAuthorId;
    readonly grantedCodes: readonly string[];
  }): GlobalBusinessModel {
    const current = input.model.current;
    if (!current.version.equals(input.expectedVersion)) {
      throw new DomainInvariantError(
        "VERSAO_DESATUALIZADA",
        "A versão esperada não corresponde à versão atual do modelo.",
      );
    }

    if (current.catalogSignature !== this.catalog.signature()) {
      throw new DomainInvariantError(
        "CATALOGO_DIVERGENTE",
        "O modelo não pode ser versionado com outro catálogo silenciosamente.",
      );
    }

    if (current.sameContent(input.name, input.grantedCodes)) {
      throw new DomainInvariantError(
        "MODELO_SEM_ALTERACAO",
        "Uma nova versão exige alteração efetiva de conteúdo.",
      );
    }

    const next = GlobalBusinessModelVersion.create({
      version: current.version.next(),
      previousVersion: current.version,
      name: input.name,
      catalog: this.catalog,
      createdAt: this.clock.now(),
      createdBy: input.changedBy,
      grantedCodes: input.grantedCodes,
    });
    return input.model.append(next);
  }
}
