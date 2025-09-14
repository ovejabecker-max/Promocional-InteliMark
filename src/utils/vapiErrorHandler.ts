// src/utils/vapiErrorHandler.ts
import type { VapiError, VapiErrorType } from "../types/vapi";

interface ErrorLogger {
  error: (
    message: string,
    error?: Error,
    context?: Record<string, unknown>
  ) => void;
  warn: (message: string, context?: Record<string, unknown>) => void;
  info: (message: string, context?: Record<string, unknown>) => void;
  debug: (message: string, context?: Record<string, unknown>) => void;
}

// Logger simple que en producción podría integrarse con servicios como Sentry
class VapiLogger implements ErrorLogger {
  private isDevelopment = import.meta.env.DEV;

  error(message: string, error?: Error, context?: Record<string, unknown>) {
    if (this.isDevelopment) {
      console.error(`[VAPI ERROR] ${message}`, { error, context });
    }
    // En producción, aquí se enviaría a un servicio de logging
    this.sendToLoggingService("error", message, error, context);
  }

  warn(message: string, context?: Record<string, unknown>) {
    if (this.isDevelopment) {
      console.warn(`[VAPI WARN] ${message}`, { context });
    }
    this.sendToLoggingService("warn", message, undefined, context);
  }

  info(message: string, context?: Record<string, unknown>) {
    if (this.isDevelopment) {
      console.info(`[VAPI INFO] ${message}`, { context });
    }
    this.sendToLoggingService("info", message, undefined, context);
  }

  debug(message: string, context?: Record<string, unknown>) {
    if (this.isDevelopment) {
      console.debug(`[VAPI DEBUG] ${message}`, { context });
    }
  }

  private sendToLoggingService(
    level: string,
    message: string,
    error?: Error,
    context?: Record<string, unknown>
  ) {
    // TODO: Integrar con servicio de logging como Sentry, LogRocket, etc.
    // Por ahora, solo en desarrollo
    if (this.isDevelopment && level === "error") {
      // Simular envío a servicio de logging
      console.log(`📡 Would send to logging service:`, {
        level,
        message,
        error: error?.message,
        stack: error?.stack,
        context,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      });
    }
  }
}

export const vapiLogger = new VapiLogger();

// Clasificador de errores para determinar el tipo y recuperabilidad
export const classifyVapiError = (error: Error): VapiErrorType => {
  const message = error.message.toLowerCase();

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
  originalError: Error,
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

  const message = customMessage || userFriendlyMessages[errorType];

  return {
    type: errorType,
    message,
    originalError,
    timestamp: new Date(),
    isRecoverable,
  };
};

// Función para mostrar notificaciones al usuario (puede integrarse con toast libraries)
export const notifyUser = (error: VapiError) => {
  // Por ahora, usar console, pero en producción sería un toast/notification
  if (import.meta.env.DEV) {
    console.warn(`🔔 User Notification: ${error.message}`);
  }

  // TODO: Integrar con biblioteca de notificaciones como react-hot-toast
  // toast.error(error.message);

  // Para errores no recuperables, mostrar instrucciones adicionales
  if (!error.isRecoverable) {
    const instructions: Record<VapiErrorType, string> = {
      authentication_failed:
        "Contacta al administrador para verificar la configuración.",
      assistant_not_found: "Contacta al soporte técnico.",
      microphone_access_denied:
        "Ve a configuración del navegador y permite el acceso al micrófono.",
      connection_failed: "",
      network_error: "",
      timeout_error: "",
      unknown_error: "",
    };

    const instruction = instructions[error.type];
    if (instruction && import.meta.env.DEV) {
      console.info(`💡 Instruction: ${instruction}`);
    }
  }
};
