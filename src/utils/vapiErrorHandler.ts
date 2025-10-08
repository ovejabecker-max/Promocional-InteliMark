// src/utils/vapiErrorHandler.ts
import type { VapiError, VapiErrorType } from "../types/vapi";
import { vapiLogger } from "./logger";
import { NotificationManager } from "./notifications";

// Clasificador de errores para determinar el tipo y recuperabilidad
export const classifyVapiError = (error: unknown): VapiErrorType => {
  // Normalizar el mensaje de error de forma segura incluso si `error` no
  // es una instancia de Error o no tiene `message`.
  // Detectar objetos Response (fetch) con status
  try {
    if (typeof error === "object" && error !== null) {
      const maybeStatus = (error as Record<string, unknown>)["status"];
      if (typeof maybeStatus === "number" && maybeStatus === 403) {
        return "authentication_failed";
      }
    }
  } catch (_e) {
    // ignore
  }
  let rawMessage: string;
  if (
    typeof error === "object" &&
    error !== null &&
    typeof (error as Record<string, unknown>)["message"] === "string"
  ) {
    rawMessage = (error as Record<string, unknown>)["message"] as string;
  } else {
    rawMessage = String(error ?? "");
  }
  const message = rawMessage.toLowerCase();

  // Errores de autenticación
  if (
    message.includes("auth") ||
    message.includes("unauthorized") ||
    message.includes("forbidden")
  ) {
    return "authentication_failed";
  }

  // Errores de conexión
  if (
    message.includes("connection") ||
    message.includes("network") ||
    message.includes("fetch")
  ) {
    return "connection_failed";
  }

  // Errores de micrófono
  if (
    message.includes("microphone") ||
    message.includes("audio") ||
    message.includes("permission")
  ) {
    return "microphone_access_denied";
  }

  // Errores de timeout
  if (message.includes("timeout") || message.includes("abort")) {
    return "timeout_error";
  }

  // Errores de asistente
  if (message.includes("assistant") || message.includes("not found")) {
    return "assistant_not_found";
  }

  return "unknown_error";
};

// Determinar si un error es recuperable
export const isErrorRecoverable = (errorType: VapiErrorType): boolean => {
  switch (errorType) {
    case "connection_failed":
    case "network_error":
    case "timeout_error":
      return true; // Estos errores pueden resolverse con retry

    case "authentication_failed":
    case "assistant_not_found":
    case "microphone_access_denied":
      return false; // Estos requieren intervención del usuario

    case "unknown_error":
      return true; // Intentar recovery por defecto

    default:
      return false;
  }
};

// Factory para crear objetos VapiError estandarizados
export const createVapiError = (
  originalError: unknown,
  customMessage?: string
): VapiError => {
  const errorType = classifyVapiError(originalError);
  const isRecoverable = isErrorRecoverable(errorType);

  // Mensajes amigables para el usuario
  const userFriendlyMessages: Record<VapiErrorType, string> = {
    connection_failed:
      "No se pudo conectar con el servicio de voz. Verifica tu conexión a internet.",
    authentication_failed:
      "Error de autenticación. Verifica las credenciales de la aplicación.",
    assistant_not_found:
      "El asistente de voz no está disponible en este momento.",
    microphone_access_denied:
      "Se necesita acceso al micrófono para usar el chat de voz.",
    network_error: "Error de red. Verifica tu conexión a internet.",
    timeout_error:
      "La conexión tardó demasiado en establecerse. Intenta nuevamente.",
    unknown_error: "Ocurrió un error inesperado. Intenta nuevamente.",
  };

  // Preferir customMessage; si no existe, usar el mensaje amigable.
  const message = customMessage || userFriendlyMessages[errorType];

  // Mantener originalError solo si es una instancia de Error, de lo
  // contrario almacenamos undefined para evitar objetos inesperados.
  const safeOriginalError =
    originalError instanceof Error ? originalError : undefined;

  return {
    type: errorType,
    message,
    originalError: safeOriginalError,
    timestamp: new Date(),
    isRecoverable,
  };
};

// Función para mostrar notificaciones al usuario usando el sistema unificado
export const notifyUser = (error: VapiError) => {
  // Usar el sistema de notificaciones unificado
  NotificationManager.handleVapiError(error);

  // Log del error para debugging
  vapiLogger.error("Error notificado al usuario", undefined, {
    errorType: error.type,
    message: error.message,
    isRecoverable: error.isRecoverable,
    timestamp: error.timestamp,
  });
};
