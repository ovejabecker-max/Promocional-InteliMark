import React, { memo, useCallback, useState } from "react";
import { useVapi } from "../hooks/useVapi";
import type { VapiConfig } from "../types/vapi";
import VapiIcon from "./VapiIcon";
import { MicrophonePermissionModal } from "./MicrophonePermissionModal";
import "./VapiChatButton.css";

interface VapiChatButtonProps {
  config: VapiConfig;
  className?: string;
  size?: "small" | "medium" | "large";
  variant?: "floating" | "center";
}

export const VapiChatButton: React.FC<VapiChatButtonProps> = memo(
  ({ config, className = "", size = "large", variant = "center" }) => {
    const [showPermissionModal, setShowPermissionModal] = useState(false);

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
      needsPermission,
      isPermissionDenied,
      requestMicrophonePermission,
    } = useVapi(config);

    const getButtonClass = useCallback(() => {
      const baseClass = "vapi-chat-button";
      const sizeClass = `vapi-chat-button--${size}`;
      const variantClass = `vapi-chat-button--${variant}`;

      const statusClass = hasError
        ? "vapi-chat-button--error"
        : isPermissionDenied
        ? "vapi-chat-button--permission-denied"
        : needsPermission
        ? "vapi-chat-button--permission-required"
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
      needsPermission,
      isPermissionDenied,
      className,
    ]);

    const handleRequestPermission = useCallback(async () => {
      const granted = await requestMicrophonePermission();
      if (granted) {
        setShowPermissionModal(false);
        // Intentar iniciar la llamada después de obtener permisos
        setTimeout(() => toggleCall(), 100);
      }
    }, [requestMicrophonePermission, toggleCall]);

    const handleCancelPermission = useCallback(() => {
      setShowPermissionModal(false);
    }, []);

    const getPermissionStatus = useCallback(() => {
      if (isPermissionDenied) return "denied";
      if (needsPermission) return "prompt";
      return "prompt";
    }, [isPermissionDenied, needsPermission]);

    const handleClick = useCallback(() => {
      if (isReconnecting) {
        // Si está reconectando, cancelar reconexión
        cancelReconnection();
      } else if (needsPermission || isPermissionDenied) {
        // Si necesita permisos, mostrar modal
        setShowPermissionModal(true);
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
      needsPermission,
      isPermissionDenied,
      hasError,
      error,
      cancelReconnection,
      retry,
      clearError,
      toggleCall,
      setShowPermissionModal,
    ]);

    const getAriaLabel = () => {
      if (isReconnecting) {
        return `Reconectando (${reconnectionAttempt}/${maxReconnectionAttempts}) - Próximo intento en ${nextRetryIn}s - Click para cancelar`;
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
    };

    const getTitle = () => {
      if (isReconnecting) {
        return `Reconectando... Intento ${reconnectionAttempt} de ${maxReconnectionAttempts}${
          nextRetryIn > 0 ? ` - Próximo intento en ${nextRetryIn}s` : ""
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
    };

    return (
      <>
        <div
          className="vapi-button-container"
          style={
            {
              "--assistant-volume-level": assistantVolume,
            } as React.CSSProperties
          }
        >
          <button
            onClick={handleClick}
            disabled={isLoading}
            className={getButtonClass()}
            aria-label={getAriaLabel()}
            title={getTitle()}
          >
            <VapiIcon />
          </button>
        </div>

        <MicrophonePermissionModal
          isOpen={showPermissionModal}
          onRequestPermission={handleRequestPermission}
          onCancel={handleCancelPermission}
          permissionStatus={getPermissionStatus()}
        />
      </>
    );
  }
);

VapiChatButton.displayName = "VapiChatButton";
