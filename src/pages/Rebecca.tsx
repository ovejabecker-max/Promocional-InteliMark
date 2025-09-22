// src/pages/Rebecca.tsx

import { useEffect, useRef, useState, memo, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { usePortalTransition } from "../hooks/usePortalTransition";
import { VapiChatButton } from "../components/VapiChatButton";
import { vapiConfig } from "../config/vapi.config";
import { useVapi } from "../hooks/useVapi";
import FuenteCero from "../components/FuenteCero";
import { NewsletterForm } from "../components/NewsletterForm";
import { RobotFooterModel } from "../components/RobotFooterModel";
import SimpleCreditsModal from "../components/SimpleCreditsModal";
import { TranscriptModal } from "../components/TranscriptModal";


import CTAButtonImage from "../assets/CTAButtonV2.png";
import ContenedorCreditos from "../assets/contenedor_creditos.png";
import Home3DIcon from "../assets/Home3D.png";
import "./Rebecca.css";

const Rebecca = memo(() => {
  // 🌀 HOOKS DE TRANSICIÓN: Detectar si viene de portal
  const location = useLocation();
  const portalTransition = usePortalTransition();

  const vapiProps = useVapi(vapiConfig);
  const { isSessionActive, messages } = vapiProps;

  const transcripts = useMemo(() => {
    return (messages || []).map((message) => ({
      role: message.role as "user" | "assistant",
      text: message.content,
    }));
  }, [messages]);

  // 🎯 ESTADO DE ENTRADA: Desde portal o navegación normal
  const [entryState, setEntryState] = useState({
    fromPortal: false,
    hasInitialized: false,
    portalAnimationCompleted: false,
  });

  // Estados consolidados para CTA
  const [ctaState, setCtaState] = useState({
    scrollPercent: 0,
    buttonVisible: false,
    clickProcessing: false,
    effectsActivated: {
      typewriter: false,
      ctaSection: false, // 🎯 UNIFICADO: matrix + button container + text
    },
  });

  // Estados de UI
  const [uiState, setUiState] = useState({
    showCreditsModal: false,
  });

  // Referencias
  const containerRef = useRef<HTMLDivElement>(null);
  const ctaSectionRef = useRef<HTMLElement>(null);
  const ctaStateRef = useRef(ctaState); // 🎯 Ref para acceso actual del estado

  // 🎯 OPTIMIZACIÓN: Mantener ref actualizada
  useEffect(() => {
    ctaStateRef.current = ctaState;
  }, [ctaState]);

  // Controlador de scroll CTA
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const ratio = entry.intersectionRatio;
          const currentState = ctaStateRef.current; // 🎯 Usar ref para estado actual

          setCtaState((prev) => ({ ...prev, scrollPercent: ratio }));

          // 🎯 CTA Section (Matrix + Text) activation at 30%
          if (ratio >= 0.3 && !currentState.effectsActivated.ctaSection) {
            setCtaState((prev) => ({
              ...prev,
              effectsActivated: { ...prev.effectsActivated, ctaSection: true },
            }));
          } else if (ratio < 0.3 && currentState.effectsActivated.ctaSection) {
            setCtaState((prev) => ({
              ...prev,
              effectsActivated: { ...prev.effectsActivated, ctaSection: false },
            }));
          }

          // 🎯 BOTÓN CTA: Mostrar cuando la sección está completamente visible (con tolerancia)
          // Usamos las dimensiones del rectángulo de intersección vs el bounding rect del target
          const bcr = entry.boundingClientRect;
          const ir = entry.intersectionRect;
          const tol = 6; // tolerancia más robusta por variaciones de layout/scrollbar
          // Usar dimensiones de viewport “útiles” en lugar de innerWidth/innerHeight
          const viewportW = document.documentElement.clientWidth;
          const viewportH = document.documentElement.clientHeight;
          // Cubre prácticamente todo el viewport (aunque el target sea más alto que la ventana)
          const coversViewport =
            ir.width >= viewportW - tol && ir.height >= viewportH - tol;
          // Caso clásico: target y viewport del mismo tamaño
          const fullyVisibleTarget =
            ir.width >= bcr.width - tol && ir.height >= bcr.height - tol;

          // Histéresis de respaldo basada en ratio
          const SHOW_RATIO = 0.95; // más laxo para asegurar aparición
          const HIDE_RATIO = 0.9; // histéresis para evitar parpadeos
          const shouldShow =
            coversViewport || fullyVisibleTarget || ratio >= SHOW_RATIO;
          const shouldHide =
            !coversViewport && !fullyVisibleTarget && ratio < HIDE_RATIO;

          if (shouldShow && !currentState.buttonVisible) {
            setCtaState((prev) => ({ ...prev, buttonVisible: true }));
          } else if (shouldHide && currentState.buttonVisible) {
            setCtaState((prev) => ({ ...prev, buttonVisible: false }));
          }

          // Typewriter activation at 95%
          if (ratio >= 0.95 && !currentState.effectsActivated.typewriter) {
            setCtaState((prev) => ({
              ...prev,
              effectsActivated: { ...prev.effectsActivated, typewriter: true },
            }));

            const line1 = document.querySelector(
              ".subtitle-line-1.typewriter-line"
            );
            const line2 = document.querySelector(
              ".subtitle-line-2.typewriter-line"
            );

            if (line1) line1.classList.add("typewriter-active");
            if (line2) line2.classList.add("typewriter-active");
          }

          // Reset all effects at 10%
          if (
            ratio < 0.1 &&
            (currentState.effectsActivated.typewriter ||
              currentState.effectsActivated.ctaSection)
          ) {
            setCtaState((prev) => ({
              ...prev,
              effectsActivated: {
                typewriter: false,
                ctaSection: false,
              },
              buttonVisible: false,
            }));

            const line1 = document.querySelector(
              ".subtitle-line-1.typewriter-line"
            );
            const line2 = document.querySelector(
              ".subtitle-line-2.typewriter-line"
            );

            if (line1) line1.classList.remove("typewriter-active");
            if (line2) line2.classList.remove("typewriter-active");
          }
        });
      },
      {
        // 🎯 Mayor granularidad para evitar saltos: 0..1 con paso de 0.01
        threshold: Array.from({ length: 101 }, (_, i) => i / 100),
      }
    );

    const sectionElement = ctaSectionRef.current;
    if (sectionElement) {
      observer.observe(sectionElement);
    }

    return () => {
      if (sectionElement) {
        observer.unobserve(sectionElement);
      }
    };
  }, []); // 🎯 OPTIMIZADO: Sin dependencias para evitar re-creación del observer

  //  OPTIMIZACIÓN: Estabilizar dependencias del portal para evitar re-ejecuciones
  const portalDetectionData = useMemo(
    () => ({
      isFromPortal: location.state?.fromPortal || portalTransition.isFromPortal,
      transitionData:
        location.state?.transitionData || portalTransition.portalData,
      isTransitioning: portalTransition.isTransitioning,
      transitionType: portalTransition.transitionType,
    }),
    [
      location.state?.fromPortal,
      location.state?.transitionData,
      portalTransition.isFromPortal,
      portalTransition.portalData,
      portalTransition.isTransitioning,
      portalTransition.transitionType,
    ]
  );

  // 🌀 EFECTO: Detectar entrada desde portal y configurar animaciones
  useEffect(() => {
    // ✅ GUARD: Solo ejecutar si no se ha inicializado
    if (entryState.hasInitialized) return;

    // 🚫 LOG ELIMINADO: Portal detection - verificación innecesaria para usuario final
    // Solo mantenemos logs esenciales en desarrollo

    if (portalDetectionData.isFromPortal) {
      setEntryState((prev) => ({
        ...prev,
        fromPortal: true,
        hasInitialized: true,
      }));

      // 🎬 INICIAR ANIMACIÓN DE CONTINUIDAD PORTAL
      initializePortalContinuity(portalDetectionData.transitionData);
    } else {
      setEntryState((prev) => ({
        ...prev,
        fromPortal: false,
        hasInitialized: true,
      }));

      // 🎬 INICIAR ANIMACIÓN NORMAL
      initializeNormalEntry();
    }
  }, [portalDetectionData, entryState.hasInitialized]);

  // 🎬 FUNCIÓN: Inicializar continuidad desde portal
  const initializePortalContinuity = (_transitionData: unknown) => {
    // 🚫 LOG ELIMINADO: Portal continuity - proceso interno innecesario para usuario

    // ✅ SIN ANIMACIÓN: Rebecca aparece directamente
    const container = containerRef.current;
    if (container) {
      // Mostrar inmediatamente sin efectos
      container.style.opacity = "1";
      container.style.filter = "none";
      container.style.transform = "none";
      container.style.transition = "";

      // Marcar como completado inmediatamente
      setEntryState((prev) => ({
        ...prev,
        portalAnimationCompleted: true,
      }));
    }
  };

  // 🎬 FUNCIÓN: Inicializar entrada normal
  const initializeNormalEntry = () => {
    // 🚫 LOG ELIMINADO: Normal entry - proceso interno innecesario para usuario

    const container = containerRef.current;
    if (container) {
      // ✅ SIN ANIMACIÓN: Mostrar inmediatamente
      container.style.opacity = "1";
      container.style.filter = "none";
      container.style.transform = "none";
      container.style.transition = "";

      // Marcar como completado inmediatamente
      setEntryState((prev) => ({ ...prev, portalAnimationCompleted: true }));
    }
  };

  return (
    <>
      <div
        ref={containerRef}
        className={`rebecca-container ${
          entryState.fromPortal ? "from-portal" : "normal-entry"
        } ${
          entryState.portalAnimationCompleted
            ? "animation-completed"
            : "animating"
        }`}
      >
        <div className="main-content-wrapper">
          {/* 🎯 BOTÓN PARA ABRIR HOMEPAGE MODAL - Solo imagen */}
          <button
            className="homepage-modal-button"
            onClick={() =>
              setUiState((prev) => ({ ...prev, showHomePageModal: true }))
            }
            aria-label="Ver experiencia 3D completa"
            title="Ver experiencia 3D completa"
          >
            <img src={Home3DIcon} alt="3D Icon" />
          </button>

          <h1 className="portal-title">
            {entryState.fromPortal
              ? "¡Bienvenido al futuro!"
              : "¡Bienvenido al futuro!"}
            {/* Opcional: Texto diferente según el origen */}
          </h1>
          <div className="vapi-content center-absolute">
            <VapiChatButton {...vapiProps} />
          </div>
          <div className="portal-effects center-absolute">
            <div className="glow-ring"></div>
            <div className="pulse-ring"></div>
            <div className="rotating-ring-outer"></div>
            <div className="rotating-ring-inner"></div>
            <div className="wave-effect"></div>
          </div>
          <TranscriptModal isOpen={isSessionActive} transcripts={transcripts} />
        </div>

        <section
          ref={ctaSectionRef}
          className={`call-to-action-section ${
            ctaState.effectsActivated.ctaSection ? "active-effect" : ""
          }`}
          id="cta-section"
        >
          {ctaState.effectsActivated.ctaSection && (
            <FuenteCero parentRef={ctaSectionRef} />
          )}

          <div className="cta-content">
            <h2 className="cta-title cta-title-container">
              {(() => {
                // 🎯 Normalizar progreso entre 0.3 y 0.9 para un movimiento suave
                const start = 0.3;
                const end = 0.9;
                const raw = ctaState.scrollPercent;
                const progress = Math.max(
                  0,
                  Math.min(1, (raw - start) / (end - start))
                );
                const w = window.innerWidth * 0.7;
                const leftX = -w * (1 - progress); // -w → 0
                const rightX = w * (1 - progress); //  w → 0
                return (
                  <>
                    <span
                      className={`cta-title-span trabajemos ${
                        raw >= start ? "visible" : ""
                      }`}
                      style={{ transform: `translateX(${leftX}px)` }}
                    >
                      TRABAJEMOS
                    </span>
                    <span
                      className={`cta-title-span juntos ${
                        raw >= start ? "visible" : ""
                      }`}
                      style={{ transform: `translateX(${rightX}px)` }}
                    >
                      JUNTOS
                    </span>
                  </>
                );
              })()}
            </h2>

            <div className="cta-subtitle">
              <p className="cta-subtitle">
                <span
                  className="subtitle-line-1 typewriter-line"
                  data-text="COMENZÓ UN NUEVO CAMBIO MUNDIAL, LA ERA TECNOLÓGICA."
                >
                  COMENZÓ UN NUEVO CAMBIO MUNDIAL, LA ERA TECNOLÓGICA.
                </span>
                <span
                  className="subtitle-line-2 typewriter-line"
                  data-text="AVANZA MUY RÁPIDO Y NO ESPERARÁ A NADIE. NO TE QUEDES ATRÁS."
                >
                  AVANZA MUY RÁPIDO Y NO ESPERARÁ A NADIE. NO TE QUEDES ATRÁS.
                </span>
              </p>
            </div>

            <div
              className={`cta-button-container ${
                ctaState.buttonVisible ? "visible" : "hidden"
              }`}
            >
              <div
                className="cta-button-wrapper"
                onClick={() => {
                  if (ctaState.clickProcessing) return;

                  setCtaState((prev) => ({ ...prev, clickProcessing: true }));
                  window.open("https://wa.me/56949459379", "_blank");

                  setTimeout(
                    () =>
                      setCtaState((prev) => ({
                        ...prev,
                        clickProcessing: false,
                      })),
                    300
                  );
                }}
                onMouseEnter={(e) => {
                  const wrapper = e.currentTarget;
                  wrapper.classList.add("hover-active");
                }}
                onMouseLeave={(e) => {
                  const wrapper = e.currentTarget;
                  wrapper.classList.remove("hover-active");
                }}
              >
                <img
                  src={CTAButtonImage}
                  alt="WhatsApp Button"
                  className="cta-button-image"
                  loading="eager"
                  decoding="async"
                />

                <div className="cta-button-text-overlay center-absolute flex-center">
                  <span className="cta-button-text-display">WHATSAPP</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <footer className="footer-reveal" id="footer-reveal">
          <div className="footer-content">
            <div className="footer-info">
              <NewsletterForm />

              <div className="navigation-section">
                <button
                  className="homepage-access-button ai-matrix-button"
                  style={{
                    marginLeft: "5px",
                    transform: "translateY(35px)",
                    position: "relative",
                    zIndex: 2000000,
                  }}
                  onClick={() => {
                    window.location.href = "/";
                  }}
                >
                  <div className="ai-matrix-container">
                    <div className="data-matrix arrow-shape">
                      <div className="triangle-container"></div>
                    </div>
                    <div className="holo-text">
                      <span
                        className="text-glitch"
                        data-text="VOLVER AL INICIO"
                      >
                        VOLVER AL INICIO
                      </span>
                    </div>
                    <div className="hologram-layers"></div>
                    <div className="depth-scanner"></div>
                  </div>
                </button>
              </div>
            </div>

            <div
              style={{
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "flex-start",
                transform: "translateY(20px)",
                gap: 0,
              }}
            >
              <RobotFooterModel />

              <div className="footer-credits">
                <button
                  className="credits-link"
                  onClick={() =>
                    setUiState((prev) => ({ ...prev, showCreditsModal: true }))
                  }
                >
                  VER TODOS LOS CREDITOS
                </button>
                <p>© 2025 InteliMark - Todos los derechos reservados</p>
              </div>
            </div>

            <div className="contact-info">
              <h4>PONTE EN CONTACTO</h4>

              <div className="contact-item general">
                <div className="contact-icon">
                  <div>📧</div>
                </div>
                <p>info@intelimark.cl</p>
                <span className="contact-label">Información General</span>
              </div>

              <div className="contact-item commercial">
                <div className="contact-icon">
                  <div>💼</div>
                </div>
                <p>pcarrasco@intelimark.cl</p>
                <span className="contact-label">Departamento Comercial</span>
              </div>

              <div className="contact-item phone">
                <div className="contact-icon">
                  <div>📱</div>
                </div>
                <p>+56 9 4945 9379</p>
                <span className="contact-label">WhatsApp / Llamadas</span>
              </div>

              <div className="contact-item address">
                <div className="contact-icon">
                  <div>📍</div>
                </div>
                <p>
                  Alcázar 356, oficina 603
                  <br />
                  Rancagua Centro, Chile
                </p>
                <span className="contact-label">Oficina Principal</span>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* 🖼️ MODAL SIMPLE DE CRÉDITOS - SOLO IMAGEN */}
      <SimpleCreditsModal
        isOpen={uiState.showCreditsModal}
        onClose={() =>
          setUiState((prev) => ({ ...prev, showCreditsModal: false }))
        }
        backgroundImage={ContenedorCreditos}
      />

      
    </>
  );
});

Rebecca.displayName = "Rebecca";

export default Rebecca;
