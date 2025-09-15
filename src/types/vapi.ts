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
  // Configuraciones de reconexión automática
  autoReconnect?: {
    enabled?: boolean;
    maxAttempts?: number;
    initialDelay?: number;
    maxDelay?: number;
    backoffFactor?: number;
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
  status:
    | "inactive"
    | "loading"
    | "active"
    | "ended"
    | "error"
    | "reconnecting"
    | "permission-required"
    | "permission-denied";
  call?: unknown; // Tipo más seguro que 'any'
  activeTranscript?: string;
  isUserSpeaking?: boolean;
  error?: VapiError | null;
  reconnection?: {
    isReconnecting: boolean;
    attempt: number;
    maxAttempts: number;
    nextRetryIn: number; // milliseconds
  };
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
  error: VapiError | null;
  hasError: boolean;
  isReconnecting: boolean;
  reconnectionAttempt: number;
  maxReconnectionAttempts: number;
  nextRetryIn: number;
  start: () => Promise<void>;
  stop: () => void;
  toggleCall: () => void;
  retry: () => Promise<void>;
  clearError: () => void;
  cancelReconnection: () => void;
  // Nuevos campos para manejo de permisos
  needsPermission: boolean;
  isPermissionDenied: boolean;
  requestMicrophonePermission: () => Promise<boolean>;
  // Campos para transcripción y mensajes
  messages: Array<{ role: string; content: string; timestamp: Date }>;
  activeTranscript: string;
}
