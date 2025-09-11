// src/components/CinematicCredits.tsx

import React, { useEffect, useRef, useState, useCallback, memo } from "react";
import "./CinematicCredits.css";

interface CreditItem {
  id: string;
  role: string;
  name: string;
  isFinal?: boolean;
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
  {
    id: "final",
    role: "INTELIMARK STUDIOS",
    name: "© 2025 - Todos los derechos reservados",
    isFinal: true,
  },
];

// Secuencia Konami para activar Matrix Mode
const KONAMI_CODE = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "KeyB",
  "KeyA",
];

export const CinematicCredits: React.FC<CinematicCreditsProps> = memo(
  ({ isOpen, onClose, backgroundImage }) => {
    // Estados principales
    const [isMatrixMode, setIsMatrixMode] = useState(false);
    const [_konamiSequence, setKonamiSequence] = useState<string[]>([]);
    const [_isAnimating, setIsAnimating] = useState(false);
    const [visibleCredits, setVisibleCredits] = useState<Set<string>>(
      new Set()
    );

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

    // Animación de transición Matrix Mode
    const animateMatrixTransition = useCallback(() => {
      if (!scrollContainerRef.current) return;

      const container = scrollContainerRef.current;

      // Efecto de glitch antes de cambiar
      const glitchAnimation = container.animate(
        [
          { filter: "hue-rotate(0deg) contrast(1) brightness(1)" },
          {
            filter: "hue-rotate(180deg) contrast(1.5) brightness(1.2)",
            offset: 0.2,
          },
          {
            filter: "hue-rotate(360deg) contrast(1) brightness(0.8)",
            offset: 0.4,
          },
          {
            filter: "hue-rotate(90deg) contrast(2) brightness(1.5)",
            offset: 0.6,
          },
          { filter: "hue-rotate(0deg) contrast(1) brightness(1)" },
        ],
        {
          duration: 1000,
          iterations: 2,
          easing: "steps(5, end)",
        }
      );

      glitchAnimation.addEventListener("finish", () => {
        setIsMatrixMode((prev) => !prev);
      });

      return glitchAnimation;
    }, []);

    // Detección de secuencia Konami
    useEffect(() => {
      const handleKeyPress = (event: KeyboardEvent) => {
        if (!isOpen) return;

        setKonamiSequence((prev) => {
          const newSequence = [...prev, event.code];

          // Mantener solo los últimos 10 inputs
          if (newSequence.length > 10) {
            newSequence.shift();
          }

          // Verificar si coincide con el código Konami
          if (newSequence.length === 10) {
            const isKonamiMatch = newSequence.every(
              (key, index) => key === KONAMI_CODE[index]
            );

            if (isKonamiMatch) {
              animateMatrixTransition();
              setKonamiSequence([]); // Reset
              return [];
            }
          }

          return newSequence;
        });
      };

      document.addEventListener("keydown", handleKeyPress);
      return () => document.removeEventListener("keydown", handleKeyPress);
    }, [isOpen, animateMatrixTransition]);

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

    // Intersection Observer para lazy loading de créditos
    useEffect(() => {
      if (!isOpen) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && entry.target instanceof HTMLElement) {
              const creditId = entry.target.dataset.creditId;
              if (creditId && !visibleCredits.has(creditId)) {
                setVisibleCredits((prev) => new Set([...prev, creditId]));

                // Animar entrada del crédito
                setTimeout(() => {
                  animateCreditItem(entry.target as HTMLElement);
                }, 100);
              }
            }
          });
        },
        {
          threshold: 0.3,
          rootMargin: "50px",
        }
      );

      // Observar todos los elementos de crédito
      const creditElements =
        scrollContainerRef.current?.querySelectorAll(".credit-item");
      creditElements?.forEach((element) => observer.observe(element));

      return () => observer.disconnect();
    }, [isOpen, visibleCredits, animateCreditItem]);

    // Efecto de hologram scanning
    useEffect(() => {
      if (!isOpen || isMatrixMode) return;

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
    }, [isOpen, isMatrixMode]);

    // Cleanup de animaciones al cerrar
    useEffect(() => {
      if (!isOpen) {
        animationsRef.current.forEach((animation) => animation.cancel());
        animationsRef.current.clear();
        setVisibleCredits(new Set());
        setKonamiSequence([]);
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
      <div
        className={`cinematic-credits-overlay ${
          isMatrixMode ? "matrix-mode" : ""
        }`}
      >
        <div
          ref={modalRef}
          className={`cinematic-credits-modal ${
            isMatrixMode ? "matrix-theme" : "hologram-theme"
          }`}
        >
          {/* Botón de cierre */}
          <button
            className="credits-close-btn"
            onClick={handleClose}
            aria-label="Cerrar créditos"
          >
            {isMatrixMode ? "[EXIT]" : "✕"}
          </button>

          {/* Marco tecnológico con imagen de fondo */}
          <div
            className="credits-tech-frame"
            style={{ backgroundImage: `url(${backgroundImage})` }}
          >
            {/* Efectos de holografía */}
            {!isMatrixMode && (
              <>
                <div ref={hologramScanRef} className="hologram-scan-line" />
                <div className="hologram-interference" />
                <div className="hologram-grid" />
              </>
            )}

            {/* Efectos Matrix */}
            {isMatrixMode && (
              <div className="matrix-rain">
                {Array.from({ length: 20 }, (_, i) => (
                  <div
                    key={i}
                    className="matrix-column"
                    style={{ left: `${i * 5}%` }}
                  >
                    {Array.from({ length: 10 }, (_, j) => (
                      <span key={j} className="matrix-char">
                        {String.fromCharCode(0x30a0 + Math.random() * 96)}
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            )}

            {/* Contenido principal */}
            <div className="credits-screen-content">
              {isMatrixMode && (
                <div className="credits-title">
                  <h2>SYSTEM_CREDITS.EXE</h2>
                  <div className="matrix-cursor">█</div>
                </div>
              )}

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
                        className={`credit-item ${
                          credit.isFinal ? "final-credit" : ""
                        } ${isMatrixMode ? "matrix-style" : "hologram-style"}`}
                        style={{
                          opacity: visibleCredits.has(credit.id) ? 1 : 0,
                          animationDelay: `${index * 0.1}s`,
                        }}
                      >
                        <h3>
                          {isMatrixMode ? `> ${credit.role}.EXE` : credit.role}
                          {isMatrixMode && (
                            <span className="matrix-loading">[■■■■■■■■■■]</span>
                          )}
                        </h3>
                        <p>{isMatrixMode ? `$ ${credit.name}` : credit.name}</p>
                        {!isMatrixMode && <div className="hologram-glow" />}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Instrucciones Easter Egg */}
              <div className="easter-egg-hint">
                {isMatrixMode ? (
                  <span className="matrix-hint">
                    PRESS_KONAMI_TO_EXIT_MATRIX
                  </span>
                ) : (
                  <span className="hologram-hint">
                    ↑↑↓↓←→←→BA para acceder al MATRIX
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

CinematicCredits.displayName = "CinematicCredits";

export default CinematicCredits;
