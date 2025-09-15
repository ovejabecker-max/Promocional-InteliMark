/**
 * Sistema de notificaciones unificado usando react-hot-toast
 * Proporciona notificaciones consistentes en toda la aplicación
 */
import React from "react";
import toast from "react-hot-toast";
import type { VapiError, VapiErrorType } from "../types/vapi";

interface NotificationOptions {
  duration?: number;
  position?: "top-center" | "top-right" | "bottom-center" | "bottom-right";
  style?: React.CSSProperties;
}

export class NotificationManager {
  private static defaultOptions: NotificationOptions = {
    duration: 4000,
    position: "top-right",
  };

  /**
   * Muestra una notificación de éxito
   */
  static success(message: string, options?: NotificationOptions) {
    const config = { ...this.defaultOptions, ...options };
    return toast.success(message, {
      duration: config.duration,
      position: config.position,
      style: {
        background: "#d36600e3",
        color: "white",
        ...config.style,
      },
      iconTheme: {
        primary: "#ff5e00ff",
        secondary: "#f86916e3",
      },
    });
  }

  /**
   * Muestra una notificación de error
   */
  static error(message: string, options?: NotificationOptions) {
    const config = { ...this.defaultOptions, ...options };
    return toast.error(message, {
      duration: config.duration,
      position: config.position,
      style: {
        background: "#fc7318ff",
        color: "white",
        ...config.style,
      },
      iconTheme: {
        primary: "#ffffff",
        secondary: "#ff7b00ff",
      },
    });
  }

  /**
   * Muestra una notificación de advertencia
   */
  static warning(message: string, options?: NotificationOptions) {
    const config = { ...this.defaultOptions, ...options };
    return toast(message, {
      duration: config.duration,
      position: config.position,
      icon: "⚠️",
      style: {
        background: "#f57c0bff",
        color: "white",
        ...config.style,
      },
    });
  }

  /**
   * Muestra una notificación informativa
   */
  static info(message: string, options?: NotificationOptions) {
    const config = { ...this.defaultOptions, ...options };
    return toast(message, {
      duration: config.duration,
      position: config.position,
      icon: "ℹ️",
      style: {
        background: "#fc6500d5",
        color: "white",
        ...config.style,
      },
    });
  }

  /**
   * Muestra una notificación de carga
   */
  static loading(message: string, options?: NotificationOptions) {
    const config = { ...this.defaultOptions, ...options };
    return toast.loading(message, {
      position: config.position,
      style: {
        background: "#da771aff",
        color: "white",
        ...config.style,
      },
    });
  }

  /**
   * Cierra una notificación específica
   */
  static dismiss(toastId?: string) {
    toast.dismiss(toastId);
  }

  /**
   * Cierra todas las notificaciones
   */
  static dismissAll() {
    toast.dismiss();
  }

  /**
   * Maneja errores de Vapi con notificaciones específicas
   */
  static handleVapiError(error: VapiError) {
    // Mensajes personalizados según el tipo de error
    const errorMessages: Record<VapiErrorType, string> = {
      connection_failed: "🔌 Sin conexión al servicio de voz",
      authentication_failed: "🔐 Error de autenticación",
      assistant_not_found: "🤖 Asistente no disponible",
      microphone_access_denied: "🎤 Acceso al micrófono denegado",
      network_error: "📡 Error de red",
      timeout_error: "⏰ Tiempo de espera agotado",
      unknown_error: "❓ Error inesperado",
    };

    const message = errorMessages[error.type] || error.message;

    // Duración más larga para errores críticos
    const duration = error.isRecoverable ? 4000 : 6000;

    this.error(message, {
      duration,
      style: {
        maxWidth: "400px",
        fontSize: "14px",
      },
    });

    // Para errores no recuperables, mostrar instrucciones adicionales
    if (!error.isRecoverable) {
      const instructions: Record<VapiErrorType, string> = {
        authentication_failed:
          "Contacta al administrador para verificar la configuración",
        assistant_not_found: "Contacta al soporte técnico",
        microphone_access_denied:
          "Ve a configuración del navegador y permite el acceso al micrófono",
        connection_failed: "",
        network_error: "",
        timeout_error: "",
        unknown_error: "",
      };

      const instruction = instructions[error.type];
      if (instruction) {
        setTimeout(() => {
          this.info(instruction, {
            duration: 8000,
            style: {
              maxWidth: "450px",
              fontSize: "13px",
            },
          });
        }, 1000);
      }
    }
  }

  /**
   * Notificaciones específicas para estados de Vapi
   */
  static vapiConnecting() {
    return this.loading("🔌 Conectando al asistente de voz...", {
      duration: 10000,
    });
  }

  static vapiConnected() {
    return this.success("✅ Conectado al asistente de voz", {
      duration: 2000,
    });
  }

  static vapiDisconnected() {
    return this.info("👋 Desconectado del asistente de voz", {
      duration: 2000,
    });
  }

  static vapiReconnecting(attempt: number, maxAttempts: number) {
    return this.warning(`🔄 Reconectando... (${attempt}/${maxAttempts})`, {
      duration: 3000,
    });
  }

  static vapiReconnectionCancelled() {
    return this.info("❌ Reconexión cancelada", {
      duration: 2000,
    });
  }
}

// Alias para facilidad de uso
// Alias eliminado por no uso
