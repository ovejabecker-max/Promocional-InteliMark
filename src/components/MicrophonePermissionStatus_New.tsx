import React from "react";
import { useMicrophonePermission } from "../hooks/useMicrophonePermission";

export const MicrophonePermissionStatus: React.FC = () => {
  const {
    permissionState,
    canUseMicrophone,
    requestPermission: _requestPermission,
    refreshPermissionStatus: _refreshPermissionStatus,
  } = useMicrophonePermission();

  const getStatusColor = () => {
    switch (permissionState.status) {
      case "granted":
        return "#da8023"; // Naranjo para estado exitoso
      case "denied":
        return "#9e9e9e"; // Gris para estado denegado
      case "checking":
        return "#da8023"; // Naranjo para verificando
      case "unsupported":
        return "#666666"; // Gris oscuro para no soportado
      default:
        return "#da8023"; // Naranjo por defecto
    }
  };

  const getStatusText = () => {
    switch (permissionState.status) {
      case "granted":
        return "MICRÓFONO AUTORIZADO";
      case "denied":
        return "ACCESO DENEGADO";
      case "checking":
        return "VERIFICANDO PERMISOS...";
      case "unsupported":
        return "DISPOSITIVO NO COMPATIBLE";
      default:
        return "SISTEMA DE AUDIO";
    }
  };

  return (
    <>
      {/* Texto principal del estado - SIN CONTENEDOR */}
      <div
        style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          color: getStatusColor(),
          fontSize: "16px",
          fontFamily: "'Segoe UI', 'Roboto', 'Arial', sans-serif",
          fontWeight: "700",
          zIndex: 9999,
          textTransform: "uppercase",
          letterSpacing: "1px",
          textShadow: `2px 2px 4px rgba(0, 0, 0, 0.3)`,
          animation:
            permissionState.status === "checking"
              ? "pulse 2s infinite"
              : "none",
        }}
      >
        {getStatusText()}
      </div>

      {/* Información adicional si hay error - SOLO TEXTO */}
      {permissionState.error && (
        <div
          style={{
            position: "fixed",
            top: "45px",
            right: "20px",
            color: "#9e9e9e",
            fontSize: "12px",
            fontFamily: "'Segoe UI', 'Roboto', 'Arial', sans-serif",
            fontWeight: "500",
            zIndex: 9999,
            maxWidth: "280px",
            opacity: 0.8,
            textShadow: `1px 1px 2px rgba(0, 0, 0, 0.2)`,
          }}
        >
          {permissionState.error}
        </div>
      )}

      {/* Estado de disponibilidad - SOLO TEXTO */}
      {!canUseMicrophone && permissionState.status !== "checking" && (
        <div
          style={{
            position: "fixed",
            top: "45px",
            right: "20px",
            color: "#666666",
            fontSize: "12px",
            fontFamily: "'Segoe UI', 'Roboto', 'Arial', sans-serif",
            fontWeight: "500",
            zIndex: 9999,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            textShadow: `1px 1px 2px rgba(0, 0, 0, 0.2)`,
          }}
        >
          MICRÓFONO NO DISPONIBLE
        </div>
      )}

      {/* Indicador de soporte - SOLO TEXTO */}
      {!permissionState.isSupported && (
        <div
          style={{
            position: "fixed",
            top: "65px",
            right: "20px",
            color: "#666666",
            fontSize: "11px",
            fontFamily: "'Segoe UI', 'Roboto', 'Arial', sans-serif",
            fontWeight: "400",
            zIndex: 9999,
            opacity: 0.7,
            textShadow: `1px 1px 2px rgba(0, 0, 0, 0.1)`,
          }}
        >
          Navegador no compatible
        </div>
      )}
    </>
  );
};

/* Definir la animación pulse aquí mismo para evitar dependencias externas */
const style = document.createElement("style");
style.textContent = `
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.7;
      transform: scale(1.02);
    }
  }
`;
document.head.appendChild(style);
