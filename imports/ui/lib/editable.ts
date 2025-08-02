export interface ClientValidation {
  check: (text: string | undefined) => boolean;
  errorMessage: () => string;
}

export interface ServerValidationErrorHandler {
  type: string;
  message: () => string;
}

export interface Store {
  clientValidations?: Record<string, ClientValidation>;
  serverValidationErrors?: ServerValidationErrorHandler[];
  onSave?: (text: string) => Promise<void>;
  onSuccess?: (text: string | undefined) => void;
  onError?: (err: unknown, text: string | undefined) => void;
}
