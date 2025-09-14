import { useState, useEffect, useCallback, useRef } from "react";
import Vapi from "@vapi-ai/web";
import type { VapiConfig, VapiCallStatus, VapiHookReturn } from "../types/vapi";
import {
  vapiLogger,
  createVapiError,
  notifyUser,
} from "../utils/vapiErrorHandler";

interface VapiMessage {
  type?: string;
  role?: string;
  content?: string;
  transcriptType?: string;
  transcript?: string;
}

export const useVapi = (config: VapiConfig): VapiHookReturn => {
  const [callStatus, setCallStatus] = useState<VapiCallStatus>({
    status: "inactive",
    messages: [],
    activeTranscript: "",
    isUserSpeaking: false,
    error: null,
  });

  const [assistantVolume, setAssistantVolume] = useState<number>(0);

  const vapiRef = useRef<Vapi | null>(null);

  useEffect(() => {
    vapiRef.current = new Vapi(config.publicKey);
    const vapi = vapiRef.current;

    vapi.on("call-start", () => {
      setCallStatus((prev) => ({ ...prev, status: "active" }));
    });

    vapi.on("call-end", () => {
      setCallStatus((prev) => ({
        ...prev,
        status: "inactive",
        activeTranscript: "",
      }));
      setAssistantVolume(0); // Reset volume when call ends
    });

    vapi.on("speech-start", () => {
      // User started speaking - evento específico para cuando el usuario habla
      setCallStatus((prev) => ({
        ...prev,
        isUserSpeaking: true,
      }));
    });

    vapi.on("speech-end", () => {
      // User stopped speaking - evento específico para cuando el usuario para de hablar
      setCallStatus((prev) => ({
        ...prev,
        isUserSpeaking: false,
      }));
    });

    // Consolidado: Un solo handler para todos los mensajes de Vapi
    vapi.on("message", (message: VapiMessage) => {
      // Manejar mensajes del asistente
      if (
        message.type === "assistant-message" ||
        (message.role === "assistant" && message.content)
      ) {
        if (message.role && message.content) {
          setCallStatus((prev) => ({
            ...prev,
            messages: [
              ...(prev.messages || []),
              {
                role: message.role as string,
                content: message.content as string,
                timestamp: new Date(),
              },
            ],
          }));
        }
        // Simular volumen cuando el asistente habla
        setAssistantVolume(0.8); // Volume spike when assistant speaks
      }

      // Manejar transcripciones parciales
      if (
        message.type === "transcript" &&
        message.transcriptType === "partial"
      ) {
        setCallStatus((prev) => ({
          ...prev,
          activeTranscript: message.transcript,
        }));
      }

      // Si es una transcripción final del asistente, reducir volumen gradualmente
      if (
        message.type === "transcript" &&
        message.transcriptType === "final" &&
        message.role === "assistant"
      ) {
        // Gradual volume fade after assistant finishes speaking
        setTimeout(() => setAssistantVolume(0.3), 500);
        setTimeout(() => setAssistantVolume(0.1), 1000);
        setTimeout(() => setAssistantVolume(0), 1500);
      }
    });

    vapi.on("error", (originalError: Error) => {
      const vapiError = createVapiError(originalError);

      vapiLogger.error("Vapi connection error", originalError, {
        errorType: vapiError.type,
        isRecoverable: vapiError.isRecoverable,
        config: { assistantId: config.assistantId },
      });

      setCallStatus((prev) => ({
        ...prev,
        status: "error",
        error: vapiError,
      }));

      setAssistantVolume(0); // Reset volume on error

      // Notificar al usuario sobre el error
      notifyUser(vapiError);
    });

    return () => {
      if (vapi) {
        vapi.stop();
      }
    };
  }, [config.publicKey, config.assistantId]);

  const start = useCallback(async () => {
    try {
      vapiLogger.info("Iniciando llamada Vapi", {
        assistantId: config.assistantId,
      });

      // Limpiar errores previos
      setCallStatus((prev) => ({ ...prev, status: "loading", error: null }));

      const assistantId =
        config.assistantId ||
        import.meta.env.VITE_VAPI_ASSISTANT_ID ||
        "8a540a3e-e5f2-43c9-a398-723516f8bf80";

      // Starting call with Assistant ID
      await vapiRef.current?.start(assistantId);

      vapiLogger.info("Llamada Vapi iniciada exitosamente");
    } catch (error) {
      const vapiError = createVapiError(
        error as Error,
        "Error al iniciar la llamada"
      );

      vapiLogger.error("Error al iniciar llamada Vapi", error as Error, {
        assistantId: config.assistantId,
        errorType: vapiError.type,
      });

      setCallStatus((prev) => ({
        ...prev,
        status: "error",
        error: vapiError,
      }));

      notifyUser(vapiError);
    }
  }, [config.assistantId]);

  const stop = useCallback(() => {
    try {
      vapiLogger.info("Deteniendo llamada Vapi");
      // Stopping call manually
      vapiRef.current?.stop();
    } catch (error) {
      const vapiError = createVapiError(
        error as Error,
        "Error al detener la llamada"
      );

      vapiLogger.error("Error al detener llamada Vapi", error as Error);

      setCallStatus((prev) => ({
        ...prev,
        status: "error",
        error: vapiError,
      }));

      notifyUser(vapiError);
    }
  }, []);

  // Función para reintentar la conexión
  const retry = useCallback(async () => {
    vapiLogger.info("Reintentando conexión Vapi");
    await start();
  }, [start]);

  // Función para limpiar errores
  const clearError = useCallback(() => {
    vapiLogger.debug("Limpiando errores Vapi");
    setCallStatus((prev) => ({ ...prev, error: null }));
  }, []);

  const toggleCall = useCallback(() => {
    if (callStatus.status === "active") {
      stop();
    } else if (
      callStatus.status === "inactive" ||
      callStatus.status === "error"
    ) {
      start();
    }
  }, [callStatus.status, start, stop]);

  return {
    isSessionActive: callStatus.status === "active",
    isLoading: callStatus.status === "loading",
    isUserSpeaking: callStatus.isUserSpeaking || false,
    assistantVolume,
    error: callStatus.error || null,
    hasError: !!callStatus.error,
    start,
    stop,
    toggleCall,
    retry,
    clearError,
    messages: callStatus.messages,
    activeTranscript: callStatus.activeTranscript || "",
  };
};
