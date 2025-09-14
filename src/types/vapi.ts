// Tipos TypeScript para Vapi
export interface VapiConfig {
  publicKey: string;
  assistantId?: string; // Para usar asistentes pre-configurados
  assistant?: {
    name?: string;
    model?: {
      provider: string;
      model: string;
      messages?: Array<{
        role: string;
        content: string;
      }>;
    };
    voice?: {
      provider: string;
      voiceId: string;
    };
  };
}

// Tipos de errores específicos de Vapi
export type VapiErrorType =
  | "connection_failed"
  | "authentication_failed"
  | "assistant_not_found"
  | "microphone_access_denied"
  | "network_error"
  | "timeout_error"
  | "unknown_error";

export interface VapiError {
  type: VapiErrorType;
  message: string;
  originalError?: Error;
  timestamp: Date;
  isRecoverable: boolean;
}

export interface VapiCallStatus {
  status: "inactive" | "loading" | "active" | "ended" | "error";
  call?: unknown; // Tipo más seguro que 'any'
  activeTranscript?: string;
  isUserSpeaking?: boolean;
  error?: VapiError | null;
  messages?: Array<{
    role: string;
    content: string;
    timestamp: Date;
  }>;
}

export interface VapiHookReturn {
  isSessionActive: boolean;
  isLoading: boolean;
  isUserSpeaking: boolean;
  assistantVolume: number;
  error: VapiError | null;
  hasError: boolean;
  start: () => Promise<void>;
  stop: () => void;
  toggleCall: () => void;
  retry: () => Promise<void>;
  clearError: () => void;
  messages: VapiCallStatus["messages"];
  activeTranscript: string;
}
