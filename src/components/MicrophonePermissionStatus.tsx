import React from "react";
import { useMicrophonePermission } from "../hooks/useMicrophonePermission";

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
        return "#4caf50";
      case "denied":
        return "#f44336";
      case "checking":
        return "#ff9800";
      case "unsupported":
        return "#9e9e9e";
      default:
        return "#2196f3";
    }
  };

  const getStatusIcon = () => {
    switch (permissionState.status) {
      case "granted":
        return "✅";
      case "denied":
        return "❌";
      case "checking":
        return "🔄";
      case "unsupported":
        return "🚫";
      default:
        return "❓";
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        background: "rgba(0, 0, 0, 0.8)",
        color: "white",
        padding: "16px",
        borderRadius: "8px",
        fontSize: "14px",
        fontFamily: "monospace",
        border: `2px solid ${getStatusColor()}`,
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
        minWidth: "250px",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "8px",
        }}
      >
        <span style={{ fontSize: "18px" }}>{getStatusIcon()}</span>
        <strong>Estado del Micrófono</strong>
      </div>

      <div>
        <strong>Status:</strong> {permissionState.status}
      </div>

      <div>
        <strong>Soportado:</strong> {permissionState.isSupported ? "Sí" : "No"}
      </div>

      <div>
        <strong>Puede usar:</strong> {canUseMicrophone ? "Sí" : "No"}
      </div>

      {permissionState.error && (
        <div style={{ color: "#f44336", marginTop: "8px", fontSize: "12px" }}>
          <strong>Error:</strong> {permissionState.error}
        </div>
      )}

      <div style={{ marginTop: "12px", display: "flex", gap: "8px" }}>
        <button
          onClick={requestPermission}
          style={{
            background: "#2196f3",
            color: "white",
            border: "none",
            padding: "6px 12px",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "12px",
          }}
        >
          Solicitar
        </button>

        <button
          onClick={refreshPermissionStatus}
          style={{
            background: "#ff9800",
            color: "white",
            border: "none",
            padding: "6px 12px",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "12px",
          }}
        >
          Refrescar
        </button>
      </div>
    </div>
  );
};
