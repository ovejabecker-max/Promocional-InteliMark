import { useState, useEffect, useRef, useCallback } from "react";
import Vapi from "@vapi-ai/web";
import type { VapiConfig, VapiCallStatus, VapiHookReturn } from "../types/vapi";
import { createVapiError, notifyUser } from "../utils/vapiErrorHandler";
import {
  VapiReconnectionManager,
  DEFAULT_RECONNECTION_CONFIG,
} from "../utils/vapiReconnection";
import { vapiLogger } from "../utils/logger";
import { NotificationManager } from "../utils/notifications";
import { useMicrophonePermission } from "./useMicrophonePermission";

export const useVapi = (config: VapiConfig): VapiHookReturn => {
  // Hook para manejo de permisos de micrófono
  const { permissionState, requestPermission, canUseMicrophone } =
    useMicrophonePermission();

  const [callStatus, setCallStatus] = useState<VapiCallStatus>({
    status: "inactive",
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
    messages: [],
    activeTranscript: "",
  });

  const vapiRef = useRef<Vapi | null>(null);
  const reconnectionManagerRef = useRef<VapiReconnectionManager | null>(null);
  const eventListenersSetupRef = useRef(false);
  // Intervalo para countdown del próximo reintento (ms)
  const reconnectionCountdownIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    // Evitar configurar múltiples listeners
    if (eventListenersSetupRef.current) {
      return;
    }

    vapiRef.current = new Vapi(config.publicKey);
    const vapi = vapiRef.current;

    // Inicializar manager de reconexión
    reconnectionManagerRef.current = new VapiReconnectionManager(
      config.autoReconnect || {},
      {
        onReconnectAttempt: (attempt, delay) => {
          vapiLogger.info(`Intento de reconexión ${attempt}`, { delay });
          NotificationManager.vapiReconnecting(
            attempt,
            config.autoReconnect?.maxAttempts ||
              DEFAULT_RECONNECTION_CONFIG.maxAttempts
          );
          setCallStatus((prev) => ({
            ...prev,
            status: "reconnecting",
            reconnection: {
              ...prev.reconnection!,
              isReconnecting: true,
              attempt,
              nextRetryIn: delay, // almacenado en milisegundos
            },
          }));

          // Reiniciar intervalo de countdown
          if (reconnectionCountdownIntervalRef.current) {
            clearInterval(reconnectionCountdownIntervalRef.current);
            reconnectionCountdownIntervalRef.current = null;
          }
          reconnectionCountdownIntervalRef.current = window.setInterval(() => {
            setCallStatus((prev) => {
              const current = prev.reconnection?.nextRetryIn || 0;
              const next = Math.max(0, current - 1000);
              return {
                ...prev,
                reconnection: {
                  ...prev.reconnection!,
                  nextRetryIn: next,
                },
              };
            });
          }, 1000);
        },
        onReconnectSuccess: () => {
          vapiLogger.info("Reconexión exitosa");
          NotificationManager.vapiConnected();
          // Detener countdown
          if (reconnectionCountdownIntervalRef.current) {
            clearInterval(reconnectionCountdownIntervalRef.current);
            reconnectionCountdownIntervalRef.current = null;
          }
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
          // Detener countdown
          if (reconnectionCountdownIntervalRef.current) {
            clearInterval(reconnectionCountdownIntervalRef.current);
            reconnectionCountdownIntervalRef.current = null;
          }
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
      NotificationManager.vapiConnected();
    });

    vapi.on("call-end", () => {
      setCallStatus((prev) => ({
        ...prev,
        status: "inactive",
      }));
      NotificationManager.vapiDisconnected();
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

    // Nota: handler de "message" removido porque no hay UI que consuma transcripción o historial actualmente

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
      // No hay timers/volumen que limpiar
      // Detener countdown si estuviera activo
      if (reconnectionCountdownIntervalRef.current) {
        clearInterval(reconnectionCountdownIntervalRef.current);
        reconnectionCountdownIntervalRef.current = null;
      }

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
              config.assistantId ?? import.meta.env.VITE_VAPI_ASSISTANT_ID;
            if (!assistantId) {
              const missingError = createVapiError(
                new Error("assistant_id_missing"),
                "Falta configurar el asistente de voz (assistantId)."
              );
              notifyUser(missingError);
              throw new Error("No assistantId configured");
            }
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

    // Marcar que los listeners están configurados
    eventListenersSetupRef.current = true;

    return () => {
      eventListenersSetupRef.current = false;
      if (vapi) {
        vapi.stop();
      }
      // Cancelar reconexión si está en progreso
      if (reconnectionManagerRef.current) {
        reconnectionManagerRef.current.cancelReconnection();
      }
      // Limpiar intervalo de countdown si existe
      if (reconnectionCountdownIntervalRef.current) {
        clearInterval(reconnectionCountdownIntervalRef.current);
        reconnectionCountdownIntervalRef.current = null;
      }
    };
  }, [config.publicKey, config.assistantId, config.autoReconnect]);

  const start = useCallback(async () => {
    let loadingToast: string | undefined;
    try {
      vapiLogger.info("Iniciando llamada Vapi", {
        assistantId: config.assistantId,
      });

      // Verificar permisos de micrófono antes de iniciar
      if (!canUseMicrophone) {
        vapiLogger.warn("Permisos de micrófono no disponibles, solicitando...");
        setCallStatus((prev) => ({ ...prev, status: "permission-required" }));

        const hasPermission = await requestPermission();
        if (!hasPermission) {
          setCallStatus((prev) => ({ ...prev, status: "permission-denied" }));
          return;
        }
      }

      // Limpiar errores previos
      setCallStatus((prev) => ({ ...prev, status: "loading", error: null }));

      // Mostrar notificación de carga
      loadingToast = NotificationManager.vapiConnecting();

      const assistantId =
        config.assistantId ?? import.meta.env.VITE_VAPI_ASSISTANT_ID;
      if (!assistantId) {
        // Cerrar loading toast si se abrió
        if (loadingToast) {
          NotificationManager.dismiss(loadingToast);
        }
        const vapiError = createVapiError(
          new Error("assistant_id_missing"),
          "Falta configurar el asistente de voz (assistantId)."
        );
        setCallStatus((prev) => ({
          ...prev,
          status: "error",
          error: vapiError,
        }));
        notifyUser(vapiError);
        return;
      }

      // Starting call with Assistant ID
      await vapiRef.current?.start(assistantId);

      // Cerrar notificación de carga si la conexión es exitosa
      if (loadingToast) {
        NotificationManager.dismiss(loadingToast);
      }

      vapiLogger.info("Llamada Vapi iniciada exitosamente");
    } catch (error) {
      // Cerrar notificación de carga en caso de error
      if (loadingToast) {
        NotificationManager.dismiss(loadingToast);
      }

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
  }, [config.assistantId, canUseMicrophone, requestPermission]);

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
      NotificationManager.vapiReconnectionCancelled();
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
      // Detener countdown
      if (reconnectionCountdownIntervalRef.current) {
        clearInterval(reconnectionCountdownIntervalRef.current);
        reconnectionCountdownIntervalRef.current = null;
      }
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
    // Nuevas propiedades para manejo de permisos
    needsPermission:
      callStatus.status === "permission-required" || !canUseMicrophone,
    isPermissionDenied:
      callStatus.status === "permission-denied" ||
      permissionState.status === "denied",
    requestMicrophonePermission: requestPermission,
    // Propiedades de transcripción y mensajes
    messages: callStatus.messages || [],
    activeTranscript: callStatus.activeTranscript || "",
  };
};
