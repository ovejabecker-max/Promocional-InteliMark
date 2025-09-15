import React, { memo, useCallback, useMemo } from "react";
import type { VapiHookReturn } from "../types/vapi";
import VapiIcon from "./VapiIcon";
import "./VapiChatButton.css";

// Make the component accept all properties from VapiHookReturn as props
interface VapiChatButtonProps extends Partial<VapiHookReturn> {
  className?: string;
}

export const VapiChatButton: React.FC<VapiChatButtonProps> = memo(
  ({
    isSessionActive,
    isLoading,
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
    needsPermission,
    isPermissionDenied,
    requestMicrophonePermission,
    className = "",
  }) => {
    // Convertir ms -> segundos para mostrar al usuario
    const nextRetrySeconds = useMemo(
      () => Math.ceil((nextRetryIn || 0) / 1000),
      [nextRetryIn]
    );

    const getButtonClass = useCallback(() => {
      const baseClass = "vapi-chat-button";

      const statusClass = hasError
        ? "vapi-chat-button--error"
        : isPermissionDenied
        ? "vapi-chat-button--permission-denied"
        : needsPermission
        ? "vapi-chat-button--permission-required"
        : isReconnecting
        ? "vapi-chat-button--reconnecting"
        : isSessionActive
        ? "vapi-chat-button--active"
        : isLoading
        ? "vapi-chat-button--loading"
        : "vapi-chat-button--inactive";

      return `${baseClass} ${statusClass} ${className}`;
    }, [
      isSessionActive,
      isLoading,
      hasError,
      isReconnecting,
      needsPermission,
      isPermissionDenied,
      className,
    ]);

    const containerStyle = undefined;

    const ariaLabel = useMemo(() => {
      if (isReconnecting) {
        return `Reconectando (${reconnectionAttempt}/${maxReconnectionAttempts}) - Próximo intento en ${nextRetrySeconds}s - Click para cancelar`;
      }
      if (needsPermission || isPermissionDenied) {
        return "Configurar permisos de micrófono";
      }
      if (hasError) {
        return error?.isRecoverable
          ? "Reintentar conexión"
          : "Limpiar error e intentar de nuevo";
      }
      return isSessionActive ? "Terminar llamada" : "Iniciar llamada";
    }, [
      isReconnecting,
      reconnectionAttempt,
      maxReconnectionAttempts,
      nextRetrySeconds,
      needsPermission,
      isPermissionDenied,
      hasError,
      error,
      isSessionActive,
    ]);

    const title = useMemo(() => {
      if (isReconnecting) {
        return `Reconectando... Intento ${reconnectionAttempt} de ${maxReconnectionAttempts}${
          nextRetrySeconds > 0
            ? ` - Próximo intento en ${nextRetrySeconds}s`
            : ""
        }`;
      }
      if (needsPermission) {
        return "Se requieren permisos de micrófono para usar el chat de voz";
      }
      if (isPermissionDenied) {
        return "Permisos de micrófono denegados - Click para configurar";
      }
      if (hasError) {
        return error?.message;
      }
      return undefined;
    }, [
      isReconnecting,
      reconnectionAttempt,
      maxReconnectionAttempts,
      nextRetrySeconds,
      needsPermission,
      isPermissionDenied,
      hasError,
      error,
    ]);

    const handleClick = useCallback(() => {
      if (isReconnecting) {
        cancelReconnection?.();
      } else if (needsPermission || isPermissionDenied) {
        requestMicrophonePermission?.().then((granted) => {
          if (granted) {
            setTimeout(() => toggleCall?.(), 100);
          }
        });
      } else if (hasError && error?.isRecoverable) {
        retry?.();
      } else if (hasError) {
        clearError?.();
        toggleCall?.();
      } else {
        toggleCall?.();
      }
    }, [
      isReconnecting,
      needsPermission,
      isPermissionDenied,
      hasError,
      error,
      cancelReconnection,
      retry,
      clearError,
      toggleCall,
      requestMicrophonePermission,
    ]);

    const getAriaLabel = () => {
      return ariaLabel;
    };

    const getTitle = () => {
      return title;
    };

    return (
      <div className="vapi-button-container" style={containerStyle}>
        <button
          onClick={handleClick}
          disabled={isLoading}
          className={getButtonClass()}
          aria-label={getAriaLabel()}
          title={getTitle()}
        >
          <VapiIcon />
          {isReconnecting && (
            <div className="reconnection-indicator">
              <span className="reconnection-text">
                {reconnectionAttempt}/{maxReconnectionAttempts}
              </span>
              {nextRetrySeconds > 0 && (
                <span className="retry-countdown">{nextRetrySeconds}s</span>
              )}
            </div>
          )}
        </button>
      </div>
    );
  }
);

VapiChatButton.displayName = "VapiChatButton";