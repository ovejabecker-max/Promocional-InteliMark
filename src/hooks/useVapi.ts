import { useState, useEffect, useCallback, useRef } from "react";
import Vapi from "@vapi-ai/web";
import type { VapiConfig, VapiCallStatus, VapiHookReturn } from "../types/vapi";
import {
  vapiLogger,
  createVapiError,
  notifyUser,
} from "../utils/vapiErrorHandler";
import {
  VapiReconnectionManager,
  DEFAULT_RECONNECTION_CONFIG,
} from "../utils/vapiReconnection";

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
    reconnection: {
      isReconnecting: false,
      attempt: 0,
      maxAttempts:
        config.autoReconnect?.maxAttempts ||
        DEFAULT_RECONNECTION_CONFIG.maxAttempts,
      nextRetryIn: 0,
    },
  });

  const [assistantVolume, setAssistantVolume] = useState<number>(0);

  const vapiRef = useRef<Vapi | null>(null);
  const reconnectionManagerRef = useRef<VapiReconnectionManager | null>(null);

  useEffect(() => {
    vapiRef.current = new Vapi(config.publicKey);
    const vapi = vapiRef.current;

    // Inicializar manager de reconexión
    reconnectionManagerRef.current = new VapiReconnectionManager(
      config.autoReconnect || {},
      {
        onReconnectAttempt: (attempt, delay) => {
          vapiLogger.info(`Intento de reconexión ${attempt}`, { delay });
          setCallStatus((prev) => ({
            ...prev,
            status: "reconnecting",
            reconnection: {
              ...prev.reconnection!,
              isReconnecting: true,
              attempt,
              nextRetryIn: delay,
            },
          }));
        },
        onReconnectSuccess: () => {
          vapiLogger.info("Reconexión exitosa");
          setCallStatus((prev) => ({
            ...prev,
            error: null,
            reconnection: {
              ...prev.reconnection!,
              isReconnecting: false,
              attempt: 0,
              nextRetryIn: 0,
            },
          }));
        },
        onReconnectFailure: (finalAttempt) => {
          vapiLogger.error(
            `Fallo en reconexión, intento final: ${finalAttempt}`
          );
          if (finalAttempt) {
            setCallStatus((prev) => ({
              ...prev,
              status: "error",
              reconnection: {
                ...prev.reconnection!,
                isReconnecting: false,
                nextRetryIn: 0,
              },
            }));
          }
        },
      }
    );

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

    vapi.on("error", async (originalError: Error) => {
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

      // Intentar reconexión automática si es apropiado
      const reconnectionManager = reconnectionManagerRef.current;
      if (
        reconnectionManager &&
        vapiError.isRecoverable &&
        reconnectionManager.shouldAttemptReconnection(vapiError.type)
      ) {
        vapiLogger.info("Iniciando reconexión automática", {
          errorType: vapiError.type,
          attempt: reconnectionManager.currentAttemptNumber + 1,
        });

        try {
          await reconnectionManager.startReconnection(async () => {
            // Función de reconexión que reutiliza la lógica de start
            const assistantId =
              config.assistantId ||
              import.meta.env.VITE_VAPI_ASSISTANT_ID ||
              "8a540a3e-e5f2-43c9-a398-723516f8bf80";

            await vapi.start(assistantId);
          });
        } catch (reconnectionError) {
          vapiLogger.error(
            "Reconexión automática fallida",
            reconnectionError as Error
          );
          // El error ya se maneja en el manager, no necesitamos hacer más aquí
        }
      }
    });

    return () => {
      if (vapi) {
        vapi.stop();
      }
    };
  }, [config.publicKey, config.assistantId, config.autoReconnect]);

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

  // Función para cancelar reconexión automática
  const cancelReconnection = useCallback(() => {
    if (reconnectionManagerRef.current) {
      reconnectionManagerRef.current.cancelReconnection();
      setCallStatus((prev) => ({
        ...prev,
        status: prev.error ? "error" : "inactive",
        reconnection: {
          ...prev.reconnection!,
          isReconnecting: false,
          attempt: 0,
          nextRetryIn: 0,
        },
      }));
    }
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
    isReconnecting: callStatus.reconnection?.isReconnecting || false,
    reconnectionAttempt: callStatus.reconnection?.attempt || 0,
    maxReconnectionAttempts: callStatus.reconnection?.maxAttempts || 0,
    nextRetryIn: callStatus.reconnection?.nextRetryIn || 0,
    start,
    stop,
    toggleCall,
    retry,
    clearError,
    cancelReconnection,
    messages: callStatus.messages,
    activeTranscript: callStatus.activeTranscript || "",
  };
};
