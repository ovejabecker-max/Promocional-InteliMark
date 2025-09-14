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

export interface VapiCallStatus {
  status: "inactive" | "loading" | "active" | "ended";
  call?: unknown; // Tipo más seguro que 'any'
  activeTranscript?: string;
  isUserSpeaking?: boolean;
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
  start: () => Promise<void>;
  stop: () => void;
  toggleCall: () => void;
  messages: VapiCallStatus["messages"];
  activeTranscript: string;
}
