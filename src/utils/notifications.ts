/**
 * Sistema de noti  static s  static success(message: string, options?: NotificationOptions) {
    const config = { ...this.defaultOptions, ...options };
    return toast.success(message, {
      duration: config.duration,
      position: config.position,
      style: {
        background: "transparent",
        color: "#da8023",
        fontFamily: "Oxanium, Inter, Segoe UI, Roboto, system-ui, Avenir, Helvetica, Arial, sans-serif",
        fontWeight: "700",
        fontSize: "13px", // Reducido de 16px (20% menos)
        border: "none",ge: string, options?: NotificationOptions) {
    const config = { ...this.defaultOptions, ...options };
    return toast.success(message, {
      duration: config.duration,
      position: config.position,
      style: {
        background: "transparent",
        color: "#da8023",
        fontFamily: "Oxanium, Inter, Segoe UI, Roboto, system-ui, Avenir, Helvetica, Arial, sans-serif",
        fontWeight: "700",
        fontSize: "16px",unificado usando react-hot-toast
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
        background: "transparent",
        color: "#da8023",
        fontFamily: "'Segoe UI', 'Roboto', 'Arial', sans-serif",
        fontWeight: "700",
        fontSize: "16px",
        border: "none",
        borderRadius: "0",
        padding: "8px",
        textShadow: "2px 2px 4px rgba(0, 0, 0, 0.3)",
        boxShadow: "none",
        textTransform: "uppercase",
        letterSpacing: "1px",
        ...config.style,
      },
      icon: "", // Sin icono
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
        background: "transparent",
        color: "#da8023",
        fontFamily:
          "Oxanium, Inter, Segoe UI, Roboto, system-ui, Avenir, Helvetica, Arial, sans-serif",
        fontWeight: "700",
        fontSize: "13px", // Reducido de 16px (20% menos)
        border: "none",
        borderRadius: "0",
        padding: "8px",
        textShadow: "2px 2px 4px rgba(0, 0, 0, 0.3)",
        boxShadow: "none",
        textTransform: "uppercase",
        letterSpacing: "1px",
        ...config.style,
      },
      icon: "", // Sin icono
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
      style: {
        background: "transparent",
        color: "#da8023",
        fontFamily:
          "Oxanium, Inter, Segoe UI, Roboto, system-ui, Avenir, Helvetica, Arial, sans-serif",
        fontWeight: "700",
        fontSize: "13px", // Reducido de 16px (20% menos)
        border: "none",
        borderRadius: "0",
        padding: "8px",
        textShadow: "2px 2px 4px rgba(0, 0, 0, 0.3)",
        boxShadow: "none",
        textTransform: "uppercase",
        letterSpacing: "1px",
        ...config.style,
      },
      icon: "", // Sin icono
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
      style: {
        background: "transparent",
        color: "#da8023",
        fontFamily:
          "Oxanium, Inter, Segoe UI, Roboto, system-ui, Avenir, Helvetica, Arial, sans-serif",
        fontWeight: "700",
        fontSize: "13px", // Reducido de 16px (20% menos)
        border: "none",
        borderRadius: "0",
        padding: "8px",
        textShadow: "2px 2px 4px rgba(0, 0, 0, 0.3)",
        boxShadow: "none",
        textTransform: "uppercase",
        letterSpacing: "1px",
        ...config.style,
      },
      icon: "", // Sin icono
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
        background: "transparent",
        color: "#da8023",
        fontFamily:
          "Oxanium, Inter, Segoe UI, Roboto, system-ui, Avenir, Helvetica, Arial, sans-serif",
        fontWeight: "700",
        fontSize: "13px", // Reducido de 16px (20% menos)
        border: "none",
        borderRadius: "0",
        padding: "8px",
        textShadow: "2px 2px 4px rgba(0, 0, 0, 0.3)",
        boxShadow: "none",
        textTransform: "uppercase",
        letterSpacing: "1px",
        ...config.style,
      },
      icon: "", // Sin icono
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
      connection_failed: "Sin conexión al servicio de voz",
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
    return this.loading("Conectando al asistente de voz...", {
      duration: 10000,
    });
  }

  static vapiConnected() {
    return this.success("Conectado al asistente de voz", {
      duration: 2000,
    });
  }

  static vapiDisconnected() {
    return this.info("Desconectado del asistente de voz", {
      duration: 2000,
    });
  }

  static vapiReconnecting(attempt: number, maxAttempts: number) {
    return this.warning(`Reconectando... (${attempt}/${maxAttempts})`, {
      duration: 3000,
    });
  }

  static vapiReconnectionCancelled() {
    return this.info("Reconexión cancelada", {
      duration: 2000,
    });
  }
}

// Alias para facilidad de uso
// Alias eliminado por no uso
