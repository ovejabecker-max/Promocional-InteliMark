import React from "react";
import { useMicrophonePermission } from "../hooks/useMicrophonePermission";

export const MicrophonePermissionStatus: React.FC = () => {
  const { permissionState, canUseMicrophone } = useMicrophonePermission();

  const getStatusColor = () => {
    // Todos los estados usan color naranjo
    return "#da8023";
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
          fontSize: "13px", // Reducido de 16px (20% menos)
          fontFamily:
            "Oxanium, Inter, Segoe UI, Roboto, system-ui, Avenir, Helvetica, Arial, sans-serif",
          fontWeight: "900",
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
            color: "#da8023",
            fontSize: "12px",
            fontFamily:
              "Inter, Segoe UI, Roboto, system-ui, Avenir, Helvetica, Arial, sans-serif",
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
            color: "#da8023",
            fontSize: "10px", // Reducido de 12px (20% menos)
            fontFamily:
              "Oxanium, Inter, Segoe UI, Roboto, system-ui, Avenir, Helvetica, Arial, sans-serif",
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
            color: "#da8023",
            fontSize: "9px", // Reducido de 11px (20% menos)
            fontFamily:
              "Oxanium, Inter, Segoe UI, Roboto, system-ui, Avenir, Helvetica, Arial, sans-serif",
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

/* Definir la animación pulse directamente */
if (typeof document !== "undefined") {
  const existingStyle = document.querySelector("#microphone-status-styles");
  if (!existingStyle) {
    const style = document.createElement("style");
    style.id = "microphone-status-styles";
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
  }
}
