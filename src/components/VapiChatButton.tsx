import React, { memo, useCallback } from "react";
import { useVapi } from "../hooks/useVapi";
import type { VapiConfig } from "../types/vapi";
import VapiIcon from "./VapiIcon";
import "./VapiChatButton.css";

interface VapiChatButtonProps {
  config: VapiConfig;
  className?: string;
  size?: "small" | "medium" | "large";
  variant?: "floating" | "center";
}

export const VapiChatButton: React.FC<VapiChatButtonProps> = memo(
  ({ config, className = "", size = "large", variant = "center" }) => {
    const {
      isSessionActive,
      isLoading,
      isUserSpeaking,
      assistantVolume,
      error,
      hasError,
      isReconnecting,
      reconnectionAttempt,
      maxReconnectionAttempts,
      nextRetryIn,
      toggleCall,
      retry,
      clearError,
      cancelReconnection,
    } = useVapi(config);
    const getButtonClass = useCallback(() => {
      const baseClass = "vapi-chat-button";
      const sizeClass = `vapi-chat-button--${size}`;
      const variantClass = `vapi-chat-button--${variant}`;

      const statusClass = hasError
        ? "vapi-chat-button--error"
        : isReconnecting
        ? "vapi-chat-button--reconnecting"
        : isUserSpeaking
        ? "vapi-chat-button--listening"
        : isSessionActive
        ? "vapi-chat-button--active"
        : isLoading
        ? "vapi-chat-button--loading"
        : "vapi-chat-button--inactive";

      return `${baseClass} ${sizeClass} ${variantClass} ${statusClass} ${className}`;
    }, [
      size,
      variant,
      isSessionActive,
      isLoading,
      isUserSpeaking,
      hasError,
      isReconnecting,
      className,
    ]);

    const handleClick = useCallback(() => {
      if (isReconnecting) {
        // Si está reconectando, cancelar reconexión
        cancelReconnection();
      } else if (hasError && error?.isRecoverable) {
        // Si hay un error recuperable, intentar retry
        retry();
      } else if (hasError) {
        // Si el error no es recuperable, limpiar error e intentar de nuevo
        clearError();
        toggleCall();
      } else {
        // Comportamiento normal
        toggleCall();
      }
    }, [
      isReconnecting,
      hasError,
      error,
      cancelReconnection,
      retry,
      clearError,
      toggleCall,
    ]);

    return (
      <div
        className="vapi-button-container"
        style={
          { "--assistant-volume-level": assistantVolume } as React.CSSProperties
        }
      >
        <button
          onClick={handleClick}
          disabled={isLoading}
          className={getButtonClass()}
          aria-label={
            isReconnecting
              ? `Reconectando (${reconnectionAttempt}/${maxReconnectionAttempts}) - Próximo intento en ${nextRetryIn}s - Click para cancelar`
              : hasError
              ? error?.isRecoverable
                ? "Reintentar conexión"
                : "Limpiar error e intentar de nuevo"
              : isSessionActive
              ? "Terminar llamada"
              : "Iniciar llamada"
          }
          title={
            isReconnecting
              ? `Reconectando... Intento ${reconnectionAttempt} de ${maxReconnectionAttempts}${
                  nextRetryIn > 0 ? ` - Próximo intento en ${nextRetryIn}s` : ""
                }`
              : hasError
              ? error?.message
              : undefined
          }
        >
          <VapiIcon />
        </button>
      </div>
    );
  }
);

VapiChatButton.displayName = "VapiChatButton";
