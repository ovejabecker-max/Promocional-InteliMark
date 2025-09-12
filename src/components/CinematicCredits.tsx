// src/components/CinematicCredits.tsx

import React, { useEffect, useRef, useState, useCallback, memo } from "react";
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
    // Estados principales - sin Matrix Mode
    const [_isAnimating, setIsAnimating] = useState(false);

    // Referencias para animaciones
    const modalRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const hologramScanRef = useRef<HTMLDivElement>(null);
    const animationsRef = useRef<Map<string, Animation>>(new Map());

    // Web Animations API - Animación de entrada del modal
    const animateModalEntrance = useCallback(() => {
      if (!modalRef.current) return;

      const modal = modalRef.current;

      // Limpiar animaciones previas
      modal.getAnimations().forEach((animation) => animation.cancel());

      // Animación de entrada cinematográfica
      const entranceAnimation = modal.animate(
        [
          {
            opacity: "0",
            transform: "scale(0.8) translateY(50px)",
            filter: "blur(10px) brightness(0.5)",
          },
          {
            opacity: "0.7",
            transform: "scale(0.95) translateY(20px)",
            filter: "blur(5px) brightness(0.8)",
            offset: 0.6,
          },
          {
            opacity: "1",
            transform: "scale(1) translateY(0)",
            filter: "blur(0) brightness(1)",
          },
        ],
        {
          duration: 1200,
          easing: "cubic-bezier(0.4, 0, 0.2, 1)",
          fill: "forwards",
        }
      );

      return entranceAnimation;
    }, []);

    // Web Animations API - Animación de créditos individuales
    const animateCreditItem = useCallback(
      (element: HTMLElement, delay: number = 0) => {
        const animation = element.animate(
          [
            {
              opacity: "0",
              transform: "translateY(50px) translateZ(0)",
              filter: "blur(5px)",
            },
            {
              opacity: "1",
              transform: "translateY(0) translateZ(0)",
              filter: "blur(0)",
            },
          ],
          {
            duration: 800,
            delay,
            easing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
            fill: "forwards",
          }
        );

        // Almacenar referencia para control posterior
        animationsRef.current.set(element.id, animation);

        return animation;
      },
      []
    );

    // Detección de secuencia Konami - ELIMINADA
    // useEffect(() => {
    //   // Código Konami eliminado
    // }, [isOpen]);

    // Animación de entrada cuando se abre el modal
    useEffect(() => {
      if (isOpen) {
        setIsAnimating(true);
        const animation = animateModalEntrance();

        animation?.addEventListener("finish", () => {
          setIsAnimating(false);
        });
      }
    }, [isOpen, animateModalEntrance]);

    // Activación automática inmediata de todos los créditos
    useEffect(() => {
      if (!isOpen) return;

      // Animar entrada de todos los créditos con delay escalonado
      setTimeout(() => {
        const creditElements =
          scrollContainerRef.current?.querySelectorAll(".credit-item");
        creditElements?.forEach((element, index) => {
          if (element instanceof HTMLElement) {
            // Delay escalonado para efecto cinematográfico
            setTimeout(() => {
              animateCreditItem(element, index * 50);
            }, index * 100); // 100ms entre cada elemento (más rápido)
          }
        });
      }, 200); // 200ms después de que el modal esté visible (más rápido)
    }, [isOpen, animateCreditItem]);

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

    // Cleanup de animaciones al cerrar
    useEffect(() => {
      if (!isOpen) {
        animationsRef.current.forEach((animation) => animation.cancel());
        animationsRef.current.clear();
      }
    }, [isOpen]);

    const handleClose = useCallback(() => {
      if (!modalRef.current) {
        onClose();
        return;
      }

      // Animación de salida
      const exitAnimation = modalRef.current.animate(
        [
          {
            opacity: "1",
            transform: "scale(1)",
            filter: "blur(0)",
          },
          {
            opacity: "0",
            transform: "scale(0.9)",
            filter: "blur(5px)",
          },
        ],
        {
          duration: 400,
          easing: "cubic-bezier(0.4, 0, 1, 1)",
          fill: "forwards",
        }
      );

      exitAnimation.addEventListener("finish", onClose);
    }, [onClose]);

    if (!isOpen) return null;

    return (
      <div className="cinematic-credits-overlay">
        <div ref={modalRef} className="cinematic-credits-modal hologram-theme">
          {/* Botón de cierre */}
          <button
            className="credits-close-btn"
            onClick={handleClose}
            aria-label="Cerrar créditos"
          >
            ✕
          </button>

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
                    {CREDITS_DATA.map((credit, index) => (
                      <div
                        key={credit.id}
                        data-credit-id={credit.id}
                        className="credit-item hologram-style"
                        style={{
                          animationDelay: `${index * 0.1}s`,
                        }}
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
