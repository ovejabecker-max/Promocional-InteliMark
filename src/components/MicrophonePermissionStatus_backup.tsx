import React from "react";
import { useMicrophonePermission } from "../hooks/useMicrophonePermission";
import "./TechAnimations.css";

export const MicrophonePermissionStatus: React.FC = () => {
  const {
    permissionState,
    canUseMicrophone,
    requestPermission,
    refreshPermissionStatus,
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
    <div
      className="quantum-container neural-interface"
      style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        color: "white",
        padding: "20px",
        fontSize: "14px",
        fontFamily: "'Segoe UI', 'Roboto', 'Arial', sans-serif",
        minWidth: "280px",
        zIndex: 9999,
        backdropFilter: "blur(10px)",
        borderRadius: "12px",
        background: `linear-gradient(135deg, 
          rgba(0, 0, 0, 0.15) 0%, 
          rgba(0, 0, 0, 0.08) 50%, 
          rgba(0, 0, 0, 0.15) 100%)`,
        border: "1px solid rgba(255, 255, 255, 0.1)",
        boxShadow: `
          0 8px 32px rgba(0, 0, 0, 0.3),
          0 0 0 1px rgba(255, 255, 255, 0.05),
          inset 0 1px 0 rgba(255, 255, 255, 0.1),
          ${getStatusGlow()}
        `,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "16px",
          padding: "8px 0",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <span
          className={`status-indicator ${
            permissionState.status === "checking" ? "status-checking" : ""
          }`}
          style={{
            fontSize: "20px",
            filter: `drop-shadow(0 0 8px ${getStatusColor()})`,
          }}
        >
          {getStatusIcon()}
        </span>
        <div>
          <strong
            className="futuristic-text"
            style={{
              background: `linear-gradient(45deg, ${getStatusColor()}, white)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontSize: "16px",
              fontWeight: "600",
              letterSpacing: "0.5px",
            }}
          >
            SISTEMA DE AUDIO
          </strong>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span
            style={{
              opacity: 0.8,
              fontSize: "13px",
              textTransform: "uppercase",
              letterSpacing: "1px",
            }}
          >
            Status
          </span>
          <span
            style={{
              color: getStatusColor(),
              fontWeight: "600",
              textShadow: `0 0 10px ${getStatusColor()}40`,
              fontSize: "13px",
              textTransform: "uppercase",
            }}
          >
            {permissionState.status}
          </span>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span
            style={{
              opacity: 0.8,
              fontSize: "13px",
              textTransform: "uppercase",
              letterSpacing: "1px",
            }}
          >
            Soporte
          </span>
          <span
            style={{
              color: permissionState.isSupported ? "#00ff88" : "#ff4757",
              fontWeight: "600",
              textShadow: permissionState.isSupported
                ? "0 0 10px #00ff8840"
                : "0 0 10px #ff475740",
              fontSize: "13px",
            }}
          >
            {permissionState.isSupported ? "ACTIVO" : "INACTIVO"}
          </span>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span
            style={{
              opacity: 0.8,
              fontSize: "13px",
              textTransform: "uppercase",
              letterSpacing: "1px",
            }}
          >
            Disponible
          </span>
          <span
            style={{
              color: canUseMicrophone ? "#00ff88" : "#ff4757",
              fontWeight: "600",
              textShadow: canUseMicrophone
                ? "0 0 10px #00ff8840"
                : "0 0 10px #ff475740",
              fontSize: "13px",
            }}
          >
            {canUseMicrophone ? "SÍ" : "NO"}
          </span>
        </div>
      </div>

      {permissionState.error && (
        <div
          style={{
            color: "#ff4757",
            marginTop: "16px",
            fontSize: "12px",
            padding: "8px",
            background: "rgba(255, 71, 87, 0.1)",
            border: "1px solid rgba(255, 71, 87, 0.3)",
            borderRadius: "6px",
            textShadow: "0 0 8px #ff475740",
          }}
        >
          <strong style={{ textTransform: "uppercase", letterSpacing: "1px" }}>
            Error:
          </strong>
          <br />
          {permissionState.error}
        </div>
      )}

      <div
        style={{
          marginTop: "20px",
          display: "flex",
          gap: "12px",
          flexDirection: "column",
        }}
      >
        <button
          className="tech-button"
          onClick={requestPermission}
          style={{
            background: `linear-gradient(45deg, ${getStatusColor()}20, ${getStatusColor()}40)`,
            color: "white",
            border: `1px solid ${getStatusColor()}60`,
            padding: "10px 16px",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "12px",
            fontWeight: "600",
            textTransform: "uppercase",
            letterSpacing: "1px",
            transition: "all 0.3s ease",
            backdropFilter: "blur(10px)",
            boxShadow: `
              0 4px 15px ${getStatusColor()}20,
              inset 0 1px 0 rgba(255, 255, 255, 0.1)
            `,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = `
              0 6px 20px ${getStatusColor()}30,
              inset 0 1px 0 rgba(255, 255, 255, 0.2)
            `;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = `
              0 4px 15px ${getStatusColor()}20,
              inset 0 1px 0 rgba(255, 255, 255, 0.1)
            `;
          }}
        >
          🎤 Solicitar Acceso
        </button>

        <button
          className="tech-button"
          onClick={refreshPermissionStatus}
          style={{
            background: "rgba(255, 255, 255, 0.05)",
            color: "rgba(255, 255, 255, 0.8)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            padding: "8px 16px",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "11px",
            fontWeight: "500",
            textTransform: "uppercase",
            letterSpacing: "1px",
            transition: "all 0.3s ease",
            backdropFilter: "blur(10px)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
            e.currentTarget.style.color = "white";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
            e.currentTarget.style.color = "rgba(255, 255, 255, 0.8)";
          }}
        >
          🔄 Actualizar Estado
        </button>
      </div>
    </div>
  );
};
