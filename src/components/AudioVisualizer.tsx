// src/components/AudioVisualizer.tsx
import React, { useState, useEffect } from "react";
import "./AudioVisualizer.css";

interface AudioVisualizerProps {
  onAudioToggle?: (isActive: boolean) => void;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ onAudioToggle }) => {
  const [isAudioActive, setIsAudioActive] = useState(false);
  const [showInstructionMessage, setShowInstructionMessage] = useState(false);

  const handleToggleAudio = (e?: React.MouseEvent) => {
    // Prevenir propagación para evitar cerrar modales padre
    if (e) {
      e.stopPropagation();
    }

    const newAudioState = !isAudioActive;
    // Commented for production - console.log("AudioVisualizer Toggle - Estado actual:", isAudioActive, "→ Nuevo estado:", newAudioState);

    setIsAudioActive(newAudioState);

    // 🎯 MOSTRAR MENSAJE DE INSTRUCCIÓN SOLO AL ACTIVAR
    if (newAudioState) {
      setShowInstructionMessage(true);
    }

    // Comunicar el cambio al HomePage para que maneje su propio audio
    if (onAudioToggle) {
      onAudioToggle(newAudioState);
    }
  };

  // 🎯 EFECTO PARA CONTROLAR LA DURACIÓN DEL MENSAJE
  useEffect(() => {
    if (showInstructionMessage) {
      const timer = setTimeout(() => {
        setShowInstructionMessage(false);
      }, 6000); // 🎯 AUMENTADO: de 4000 a 6000ms (6 segundos)

      return () => clearTimeout(timer);
    }
  }, [showInstructionMessage]);

  return (
    <>
      <div className="audio-visualizer-container">
        {!isAudioActive ? (
          // Estado inactivo: Texto elegante
          <button
            className="audio-activate-button"
            onClick={handleToggleAudio}
            aria-label="Activar sonido 3D"
          >
            <span className="audio-text">ACTIVAR SONIDO 3D</span>
            <div className="text-glow"></div>
          </button>
        ) : (
          // Estado activo: Visualizador de audio animado
          <button
            className="audio-visualizer-active"
            onClick={handleToggleAudio}
            aria-label="Desactivar sonido 3D"
          >
            <div className="visualizer-bars">
              {[...Array(6)].map((_, index) => (
                <div
                  key={index}
                  className={`bar bar-${index + 1}`}
                  style={{
                    animationDelay: `${index * 0.1}s`,
                  }}
                />
              ))}
            </div>
            <div className="visualizer-reflection">
              {[...Array(6)].map((_, index) => (
                <div
                  key={index}
                  className={`bar-reflection bar-reflection-${index + 1}`}
                  style={{
                    animationDelay: `${index * 0.1}s`,
                  }}
                />
              ))}
            </div>
          </button>
        )}
      </div>

      {/* 🎯 MENSAJE DE INSTRUCCIÓN PARA AURICULARES */}
      {showInstructionMessage && (
        <div
          className={`audio-instruction-message ${
            showInstructionMessage ? "visible" : ""
          }`}
        >
          <p className="instruction-text">
            PARA LA EXPERIENCIA DE AUDIO 3D ES NECESARIO USAR AURICULARES
          </p>
        </div>
      )}
    </>
  );
};

export default AudioVisualizer;
