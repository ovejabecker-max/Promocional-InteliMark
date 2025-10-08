import { useState, useEffect, useCallback, useRef } from "react";
import { vapiLogger } from "../utils/logger";
import { NotificationManager } from "../utils/notifications";

// Tipado local para evitar usar tipos globales que disparen no-undef en ESLint
type MicrophonePermissionDescriptor = { name: "microphone" };

export type MicrophonePermissionStatus =
  | "prompt"
  | "granted"
  | "denied"
  | "checking"
  | "unsupported";

export interface MicrophonePermissionState {
  status: MicrophonePermissionStatus;
  isSupported: boolean;
  hasCheckedInitially: boolean;
  error?: string;
}

export interface UseMicrophonePermissionReturn {
  permissionState: MicrophonePermissionState;
  requestPermission: () => Promise<boolean>;
  checkPermission: () => Promise<MicrophonePermissionStatus>;
  refreshPermissionStatus: () => Promise<void>;
  canUseMicrophone: boolean;
}

/**
 * Hook para manejar permisos de micrófono de forma proactiva
 */
export const useMicrophonePermission = (): UseMicrophonePermissionReturn => {
  const [permissionState, setPermissionState] =
    useState<MicrophonePermissionState>({
      status: "checking",
      isSupported: false,
      hasCheckedInitially: false,
    });
  // Promise en vuelo para evitar múltiples solicitudes simultáneas
  const requestInFlightRef = useRef<Promise<boolean> | null>(null);

  // Verificar si el navegador soporta getUserMedia
  const checkBrowserSupport = useCallback((): boolean => {
    return !!(
      navigator.mediaDevices &&
      typeof navigator.mediaDevices.getUserMedia === "function" &&
      navigator.permissions
    );
  }, []);

  // Verificar el estado actual de permisos
  const checkPermission =
    useCallback(async (): Promise<MicrophonePermissionStatus> => {
      try {
        if (!checkBrowserSupport()) {
          vapiLogger.warn(
            "Navegador no soporta verificación de permisos de micrófono"
          );
          return "unsupported";
        }

        // Usar la API de Permissions si está disponible sin usar any
        const permissionStatus = await navigator.permissions.query({
          name: "microphone",
        } as MicrophonePermissionDescriptor);

        switch (permissionStatus.state) {
          case "granted":
            return "granted";
          case "denied":
            return "denied";
          case "prompt":
          default:
            return "prompt";
        }
      } catch (error) {
        vapiLogger.error(
          "Error al verificar permisos de micrófono",
          error as Error
        );

        // Fallback: intentar acceder al micrófono directamente para verificar permisos
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: false,
          });

          // Si llegamos aquí, tenemos permisos
          stream.getTracks().forEach((track) => track.stop());
          return "granted";
        } catch (mediaError) {
          const err = mediaError as DOMException;
          if (
            err.name === "NotAllowedError" ||
            err.name === "PermissionDeniedError"
          ) {
            return "denied";
          }
          return "prompt";
        }
      }
    }, [checkBrowserSupport]);

  // Solicitar permisos de micrófono
  const requestPermission = useCallback(async (): Promise<boolean> => {
    // Si ya hay una solicitud en curso, reutilizarla
    if (requestInFlightRef.current) return requestInFlightRef.current;

    const inFlight = (async (): Promise<boolean> => {
      setPermissionState((prev) => ({
        ...prev,
        status: "checking",
        error: undefined,
      }));

      try {
        if (!checkBrowserSupport()) {
          const error = "Su navegador no soporta acceso al micrófono";
          setPermissionState((prev) => ({
            ...prev,
            status: "unsupported",
            isSupported: false,
            error,
          }));
          NotificationManager.error(error);
          return false;
        }

        vapiLogger.info("Solicitando permisos de micrófono");

        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: false,
        });

        // Detener el stream inmediatamente ya que solo queríamos verificar permisos
        stream.getTracks().forEach((track) => track.stop());

        setPermissionState((prev) => ({
          ...prev,
          status: "granted",
          isSupported: true,
          error: undefined,
        }));

        vapiLogger.info("Permisos de micrófono concedidos");
        NotificationManager.success(
          "Permisos de micrófono concedidos correctamente"
        );

        return true;
      } catch (error) {
        const mediaError = error as DOMException;
        let errorMessage = "Error desconocido al acceder al micrófono";
        let status: MicrophonePermissionStatus = "denied";

        switch (mediaError.name) {
          case "NotAllowedError":
          case "PermissionDeniedError":
            errorMessage =
              "Permisos de micrófono denegados. Por favor, permita el acceso al micrófono en su navegador.";
            status = "denied";
            break;
          case "NotFoundError":
          case "DevicesNotFoundError":
            errorMessage =
              "No se encontró ningún micrófono. Por favor, conecte un micrófono e intente de nuevo.";
            status = "denied";
            break;
          case "NotReadableError":
          case "TrackStartError":
            errorMessage =
              "El micrófono está siendo usado por otra aplicación. Por favor, cierre otras aplicaciones que puedan estar usando el micrófono.";
            status = "denied";
            break;
          case "OverconstrainedError":
          case "ConstraintNotSatisfiedError":
            errorMessage =
              "La configuración del micrófono no es compatible con su dispositivo.";
            status = "denied";
            break;
          case "NotSupportedError":
            errorMessage = "Su navegador no soporta acceso al micrófono.";
            status = "unsupported";
            break;
          case "AbortError":
            errorMessage = "Solicitud de micrófono cancelada.";
            status = "prompt";
            break;
          default:
            errorMessage = `Error al acceder al micrófono: ${mediaError.message}`;
            break;
        }

        setPermissionState((prev) => ({
          ...prev,
          status,
          isSupported: status !== "unsupported",
          error: errorMessage,
        }));

        vapiLogger.error(
          "Error al solicitar permisos de micrófono",
          mediaError,
          {
            errorName: mediaError.name,
            errorMessage: mediaError.message,
          }
        );

        NotificationManager.error(errorMessage);

        return false;
      }
    })();

    requestInFlightRef.current = inFlight;
    try {
      const result = await inFlight;
      return result;
    } finally {
      // Limpiar promesa en vuelo
      requestInFlightRef.current = null;
    }
  }, [checkBrowserSupport]);

  // Refrescar el estado de permisos
  const refreshPermissionStatus = useCallback(async (): Promise<void> => {
    const status = await checkPermission();
    setPermissionState((prev) => ({
      ...prev,
      status,
      isSupported: checkBrowserSupport(),
      hasCheckedInitially: true,
      error: status === "denied" ? prev.error : undefined,
    }));
  }, [checkPermission, checkBrowserSupport]);

  // Verificación inicial de permisos al montar el componente
  useEffect(() => {
    refreshPermissionStatus();
  }, [refreshPermissionStatus]);

  // Escuchar cambios en los permisos (si el navegador lo soporta)
  useEffect(() => {
    let permissionStatus: PermissionStatus | null = null;
    let cleanup: (() => void) | null = null;

    const setupPermissionListener = async () => {
      try {
        if (checkBrowserSupport()) {
          permissionStatus = await navigator.permissions.query({
            name: "microphone",
          } as MicrophonePermissionDescriptor);

          const handlePermissionChange = () => {
            refreshPermissionStatus();
          };

          permissionStatus.addEventListener("change", handlePermissionChange);

          cleanup = () => {
            permissionStatus?.removeEventListener(
              "change",
              handlePermissionChange
            );
          };
        }
      } catch (error) {
        vapiLogger.warn("No se pudo configurar el listener de permisos", {
          error: (error as Error).message,
        });
      }
    };

    setupPermissionListener();

    return () => {
      cleanup?.();
    };
  }, [refreshPermissionStatus, checkBrowserSupport]);

  const canUseMicrophone =
    permissionState.status === "granted" && permissionState.isSupported;

  return {
    permissionState,
    requestPermission,
    checkPermission,
    refreshPermissionStatus,
    canUseMicrophone,
  };
};
