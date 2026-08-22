export interface CepAddressSuggestion {
  readonly logradouro?: string;
  readonly bairro?: string;
  readonly cidade?: string;
  readonly uf?: string;
}

export type CepLookupResult =
  | { readonly status: "FOUND"; readonly suggestion: CepAddressSuggestion }
  | { readonly status: "NOT_FOUND" }
  | {
      readonly status: "UNAVAILABLE";
      readonly retryable: boolean;
      readonly safeCode:
        "CEP_PROVIDER_NOT_CONFIGURED" | "CEP_PROVIDER_UNAVAILABLE";
    };

export interface CepLookupPort {
  lookup(cep: string, signal?: AbortSignal): Promise<CepLookupResult>;
}

export interface TransactionalEmailMessage {
  readonly messageId: string;
  readonly templateCode: string;
  readonly recipientReference: string;
  readonly variables: Readonly<Record<string, string>>;
}

export type TransactionalEmailResult =
  | { readonly status: "ACCEPTED"; readonly providerReference: string }
  | {
      readonly status: "UNAVAILABLE";
      readonly retryable: boolean;
      readonly safeCode:
        "EMAIL_PROVIDER_NOT_CONFIGURED" | "EMAIL_PROVIDER_UNAVAILABLE";
    };

export interface TransactionalEmailPort {
  deliver(
    message: TransactionalEmailMessage,
    signal?: AbortSignal,
  ): Promise<TransactionalEmailResult>;
}

export class UnconfiguredCepLookup implements CepLookupPort {
  async lookup(_cep: string): Promise<CepLookupResult> {
    return {
      status: "UNAVAILABLE",
      retryable: false,
      safeCode: "CEP_PROVIDER_NOT_CONFIGURED",
    };
  }
}

export class UnconfiguredTransactionalEmail implements TransactionalEmailPort {
  async deliver(
    _message: TransactionalEmailMessage,
  ): Promise<TransactionalEmailResult> {
    return {
      status: "UNAVAILABLE",
      retryable: false,
      safeCode: "EMAIL_PROVIDER_NOT_CONFIGURED",
    };
  }
}
