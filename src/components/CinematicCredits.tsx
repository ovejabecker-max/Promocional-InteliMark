// src/components/CinematicCredits.tsx

import React, { useEffect, useRef, useCallback, memo } from "react";
import "./CinematicCredits.css";

interface CreditItem {
  id: string;
  role: string;
  name: string;
}

interface CinematicCreditsProps {
  isOpen: boolean;
  onClose: () => void;
  backgroundImage: string;
}

const CREDITS_DATA: CreditItem[] = [
  {
    id: "1",
    role: "DIRECTOR CREATIVO",
    name: "Pablo Carrasco · Sandra Gangas",
  },
  { id: "2", role: "DISEÑADOR UX/UI", name: "Pablo Carrasco" },
  { id: "3", role: "DESARROLLADOR FRONTEND", name: "Pablo Carrasco" },
  { id: "4", role: "DESARROLLADOR BACKEND", name: "Pablo Carrasco" },
  { id: "5", role: "ARTISTA 3D", name: "Pablo Carrasco" },
  { id: "6", role: "DISEÑADOR DE SONIDO", name: "Pablo Carrasco" },
  { id: "7", role: "DIRECTOR DE ARTE", name: "Pablo Carrasco · Sandra Gangas" },
  { id: "8", role: "ESPECIALISTA SEO", name: "Pablo Carrasco" },
  { id: "9", role: "ESTRATEGA DE IA", name: "Pablo Carrasco" },
  { id: "10", role: "DISEÑADOR GRÁFICO", name: "Sandra Gangas" },
];

export const CinematicCredits: React.FC<CinematicCreditsProps> = memo(
  ({ isOpen, onClose, backgroundImage }) => {
    // Referencias para elementos
    const modalRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const hologramScanRef = useRef<HTMLDivElement>(null);

    // Activación automática inmediata de todos los créditos
    useEffect(() => {
      if (!isOpen) return;

      // Los créditos aparecen inmediatamente sin delays
      const creditElements =
        scrollContainerRef.current?.querySelectorAll(".credit-item");
      creditElements?.forEach((element) => {
        if (element instanceof HTMLElement) {
          // Sin animación de entrada - aparición inmediata
          element.style.opacity = "1";
          element.style.transform = "translateY(0)";
          element.style.filter = "blur(0)";
        }
      });
    }, [isOpen]);

    // Efecto de hologram scanning
    useEffect(() => {
      if (!isOpen) return;

      const scanInterval = setInterval(() => {
        if (hologramScanRef.current) {
          hologramScanRef.current.style.animation = "none";
          // Force reflow
          hologramScanRef.current.offsetHeight;
          hologramScanRef.current.style.animation =
            "hologram-scan 2s ease-in-out";
        }
      }, 4000);

      return () => clearInterval(scanInterval);
    }, [isOpen]);

    // Cleanup al cerrar - simplificado
    useEffect(() => {
      // No necesitamos cleanup de animaciones ya que no las estamos usando
    }, [isOpen]);

    const handleClose = useCallback(() => {
      if (!modalRef.current) {
        onClose();
        return;
      }

      // Animación de salida elegante y suave
      const exitAnimation = modalRef.current.animate(
        [
          {
            opacity: "1",
            transform: "scale(1) translateY(0)",
            filter: "blur(0) brightness(1)",
          },
          {
            opacity: "0.7",
            transform: "scale(0.98) translateY(10px)",
            filter: "blur(2px) brightness(0.8)",
            offset: 0.3,
          },
          {
            opacity: "0.3",
            transform: "scale(0.95) translateY(20px)",
            filter: "blur(4px) brightness(0.5)",
            offset: 0.7,
          },
          {
            opacity: "0",
            transform: "scale(0.9) translateY(30px)",
            filter: "blur(8px) brightness(0.2)",
          },
        ],
        {
          duration: 800, // Más tiempo para fade suave
          easing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)", // Easing más suave
          fill: "forwards",
        }
      );

      exitAnimation.addEventListener("finish", onClose);
    }, [onClose]);

    if (!isOpen) return null;

    return (
      <div
        className="cinematic-credits-overlay"
        onClick={handleClose}
        style={{ cursor: "pointer" }}
      >
        <div ref={modalRef} className="cinematic-credits-modal hologram-theme">
          {/* Marco tecnológico con imagen de fondo */}
          <div
            className="credits-tech-frame"
            style={{ backgroundImage: `url(${backgroundImage})` }}
          >
            {/* Efectos de holografía */}
            <>
              <div ref={hologramScanRef} className="hologram-scan-line" />
              <div className="hologram-interference" />
              <div className="hologram-grid" />
            </>

            {/* Contenido principal */}
            <div className="credits-screen-content">
              <div
                ref={scrollContainerRef}
                className="credits-scroll-container"
              >
                <div className="credits-scroll">
                  <div className="credit-section">
                    {CREDITS_DATA.map((credit) => (
                      <div
                        key={credit.id}
                        data-credit-id={credit.id}
                        className="credit-item hologram-style"
                      >
                        <h3>{credit.role}</h3>
                        <p>{credit.name}</p>
                        <div className="hologram-glow" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Nota: Easter Egg Konami eliminado */}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

CinematicCredits.displayName = "CinematicCredits";

export default CinematicCredits;
