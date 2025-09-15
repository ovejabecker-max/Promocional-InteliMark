import React from "react";
import "./MicrophonePermissionModal.css";

interface MicrophonePermissionModalProps {
  isOpen: boolean;
  onRequestPermission: () => void;
  onCancel: () => void;
  permissionStatus: "prompt" | "denied" | "unsupported";
}

export const MicrophonePermissionModal: React.FC<
  MicrophonePermissionModalProps
> = ({ isOpen, onRequestPermission, onCancel, permissionStatus }) => {
  if (!isOpen) return null;

  const getModalContent = () => {
    switch (permissionStatus) {
      case "denied":
        return {
          title: "🎤 Permisos de Micrófono Requeridos",
          message:
            "Para usar el chat de voz, necesitamos acceso a tu micrófono. Los permisos fueron denegados anteriormente.",
          instructions: (
            <div className="permission-instructions">
              <p>Para habilitar el micrófono:</p>
              <ol>
                <li>
                  Haz clic en el ícono de bloqueo 🔒 en la barra de direcciones
                </li>
                <li>Cambia los permisos de micrófono a "Permitir"</li>
                <li>Recarga la página</li>
              </ol>
            </div>
          ),
          primaryButton: "Intentar de Nuevo",
          secondaryButton: "Cancelar",
        };

      case "unsupported":
        return {
          title: "🚫 Navegador No Compatible",
          message:
            "Tu navegador no soporta acceso al micrófono. Por favor, usa un navegador moderno como Chrome, Firefox, Safari o Edge.",
          instructions: null,
          primaryButton: "Entendido",
          secondaryButton: null,
        };

      default: // "prompt"
        return {
          title: "🎤 Permisos de Micrófono",
          message:
            "Para usar el chat de voz con Rebecca, necesitamos acceso a tu micrófono.",
          instructions: (
            <div className="permission-benefits">
              <h4>¿Por qué necesitamos este permiso?</h4>
              <ul>
                <li>✨ Comunicación natural por voz</li>
                <li>🎯 Respuestas precisas e inmediatas</li>
                <li>🔒 Tu audio se procesa de forma segura</li>
                <li>🎙️ Experiencia hands-free</li>
              </ul>
            </div>
          ),
          primaryButton: "Permitir Micrófono",
          secondaryButton: "Ahora No",
        };
    }
  };

  const content = getModalContent();

  const handlePrimaryAction = () => {
    if (permissionStatus === "unsupported") {
      onCancel();
    } else {
      onRequestPermission();
    }
  };

  return (
    <div className="permission-modal-overlay" onClick={onCancel}>
      <div className="permission-modal" onClick={(e) => e.stopPropagation()}>
        <div className="permission-modal-header">
          <h3>{content.title}</h3>
        </div>

        <div className="permission-modal-body">
          <p className="permission-message">{content.message}</p>
          {content.instructions && content.instructions}
        </div>

        <div className="permission-modal-footer">
          {content.secondaryButton && (
            <button
              className="permission-btn permission-btn-secondary"
              onClick={onCancel}
            >
              {content.secondaryButton}
            </button>
          )}
          <button
            className="permission-btn permission-btn-primary"
            onClick={handlePrimaryAction}
          >
            {content.primaryButton}
          </button>
        </div>
      </div>
    </div>
  );
};
