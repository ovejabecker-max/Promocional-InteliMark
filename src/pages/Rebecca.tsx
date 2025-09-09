// src/pages/Rebecca.tsx

import { useEffect, useRef, useState, memo } from "react";
import { createPortal } from "react-dom";
import { useLocation } from "react-router-dom";
import { usePortalTransition } from "../contexts/TransitionContext";
import { VapiChatButton } from "../components/VapiChatButton";
import { vapiConfig } from "../config/vapi.config";
import FuenteCero from "../components/FuenteCero";
import { NewsletterForm } from "../components/NewsletterForm";

import CTAButtonImage from "../assets/CTAButtonV2.png";
import ContenedorCreditos from "../assets/contenedor_creditos.png";
import "./Rebecca.css";

const Rebecca = memo(() => {
  // 🌀 HOOKS DE TRANSICIÓN: Detectar si viene de portal
  const location = useLocation();
  const portalTransition = usePortalTransition();

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
    textVisible: false,
    clickProcessing: false,
    effectsActivated: {
      typewriter: false,
      button: false,
      matrix: false,
    },
  });

  // Estados de UI
  const [uiState, setUiState] = useState({
    showCreditsModal: false,
  });

  // Referencias
  const containerRef = useRef<HTMLDivElement>(null);
  const ctaSectionRef = useRef<HTMLElement>(null);

  // Controlador de scroll CTA
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const ratio = entry.intersectionRatio;
          setCtaState((prev) => ({ ...prev, scrollPercent: ratio }));

          // Matrix Rain activation at 30%
          if (ratio >= 0.3 && !ctaState.effectsActivated.matrix) {
            setCtaState((prev) => ({
              ...prev,
              effectsActivated: { ...prev.effectsActivated, matrix: true },
            }));
          } else if (ratio < 0.3 && ctaState.effectsActivated.matrix) {
            setCtaState((prev) => ({
              ...prev,
              effectsActivated: { ...prev.effectsActivated, matrix: false },
            }));
          }

          // Typewriter activation at 90%
          if (ratio >= 0.9 && !ctaState.effectsActivated.typewriter) {
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

          // WhatsApp button activation at 95%
          if (ratio >= 0.95 && !ctaState.effectsActivated.button) {
            setCtaState((prev) => ({
              ...prev,
              effectsActivated: { ...prev.effectsActivated, button: true },
              buttonVisible: true,
            }));
            setTimeout(
              () => setCtaState((prev) => ({ ...prev, textVisible: true })),
              600
            );
          } else if (ratio < 0.3 && ctaState.effectsActivated.button) {
            setCtaState((prev) => ({
              ...prev,
              effectsActivated: { ...prev.effectsActivated, button: false },
              buttonVisible: false,
              textVisible: false,
            }));
          }

          // Reset all effects at 10%
          if (
            ratio < 0.1 &&
            (ctaState.effectsActivated.typewriter ||
              ctaState.effectsActivated.button)
          ) {
            setCtaState((prev) => ({
              ...prev,
              effectsActivated: {
                typewriter: false,
                button: false,
                matrix: false,
              },
              buttonVisible: false,
              textVisible: false,
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
        threshold: [0, 0.1, 0.3, 0.9, 0.95, 1],
      }
    );

    if (ctaSectionRef.current) {
      observer.observe(ctaSectionRef.current);
    }

    return () => {
      if (ctaSectionRef.current) {
        observer.unobserve(ctaSectionRef.current);
      }
    };
  }, [ctaState]);

  // 🌀 EFECTO: Detectar entrada desde portal y configurar animaciones
  useEffect(() => {
    const isFromPortalNavigation =
      location.state?.fromPortal || portalTransition.isFromPortal;
    const transitionData =
      location.state?.transitionData || portalTransition.portalData;

    console.log("🎯 Rebecca initialized - Portal detection:", {
      isFromPortalNavigation,
      portalTransitionActive: portalTransition.isTransitioning,
      transitionType: portalTransition.transitionType,
      hasTransitionData: !!transitionData,
    });

    if (isFromPortalNavigation && !entryState.hasInitialized) {
      setEntryState((prev) => ({
        ...prev,
        fromPortal: true,
        hasInitialized: true,
      }));

      // 🎬 INICIAR ANIMACIÓN DE CONTINUIDAD PORTAL
      initializePortalContinuity(transitionData);
    } else if (!entryState.hasInitialized) {
      setEntryState((prev) => ({
        ...prev,
        fromPortal: false,
        hasInitialized: true,
      }));

      // 🎬 INICIAR ANIMACIÓN NORMAL
      initializeNormalEntry();
    }
  }, [location.state, portalTransition, entryState.hasInitialized]);

  // 🎬 FUNCIÓN: Inicializar continuidad desde portal
  const initializePortalContinuity = (transitionData: any) => {
    console.log("🌀 Initializing portal continuity with data:", transitionData);

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
    console.log("🎯 Initializing normal entry");

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
          <h1 className="portal-title">
            {entryState.fromPortal
              ? "¡Bienvenido al futuro!"
              : "¡Bienvenido al futuro!"}
            {/* Opcional: Texto diferente según el origen */}
          </h1>
          <div className="vapi-content center-absolute">
            <VapiChatButton config={vapiConfig} variant="center" size="large" />
          </div>
          <div className="portal-effects center-absolute">
            <div className="glow-ring"></div>
            <div className="pulse-ring"></div>
            <div className="rotating-ring-outer"></div>
            <div className="rotating-ring-inner"></div>
            <div className="wave-effect"></div>
          </div>
        </div>

        <section
          ref={ctaSectionRef}
          className={`call-to-action-section ${
            ctaState.effectsActivated.matrix ? "active-effect" : ""
          }`}
          id="cta-section"
        >
          {ctaState.effectsActivated.matrix && (
            <FuenteCero parentRef={ctaSectionRef} />
          )}

          <div className="cta-content">
            <h2 className="cta-title cta-title-container">
              <span
                className={`cta-title-span trabajemos ${
                  ctaState.scrollPercent >= 0.3 ? "visible" : ""
                }`}
                style={{
                  transform: `translateX(${
                    -window.innerWidth * 0.7 +
                    (Math.min(ctaState.scrollPercent, 0.9) / 0.9) *
                      window.innerWidth *
                      0.7
                  }px)`,
                }}
              >
                TRABAJEMOS
              </span>
              <span
                className={`cta-title-span juntos ${
                  ctaState.scrollPercent >= 0.3 ? "visible" : ""
                }`}
                style={{
                  transform: `translateX(${
                    window.innerWidth * 0.7 -
                    (Math.min(ctaState.scrollPercent, 0.9) / 0.9) *
                      window.innerWidth *
                      0.7
                  }px)`,
                }}
              >
                JUNTOS
              </span>
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

                <div
                  className={`cta-button-text-overlay center-absolute flex-center ${
                    ctaState.textVisible ? "text-visible" : "text-hidden"
                  }`}
                >
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
                transform: "translateY(50px)",
                gap: 0,
              }}
            >
              <div
                style={{
                  width: "380px",
                  height: "480px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(218, 128, 35, 0.1)",
                  border: "2px dashed rgba(218, 128, 35, 0.3)",
                  borderRadius: "10px",
                  color: "#da8023",
                  fontSize: "16px",
                  fontWeight: "bold",
                  textAlign: "center",
                  margin: "0 auto",
                }}
              >
                🤖 Robot 3D
                <br />
                (Temporalmente deshabilitado)
              </div>

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

      {uiState.showCreditsModal &&
        createPortal(
          <div
            className="credits-modal-overlay"
            onClick={() =>
              setUiState((prev) => ({ ...prev, showCreditsModal: false }))
            }
          >
            <div className="credits-modal-container">
              <button
                className="credits-close-button"
                onClick={() =>
                  setUiState((prev) => ({ ...prev, showCreditsModal: false }))
                }
              >
                ✕
              </button>
              <div
                className="credits-tech-frame"
                style={{ backgroundImage: `url(${ContenedorCreditos})` }}
              >
                <div className="credits-screen-content">
                  <div className="credits-title">
                    <h2>CRÉDITOS DEL PROYECTO</h2>
                  </div>
                  <div className="credits-scroll-container">
                    <div className="credits-scroll">
                      <div className="credit-section">
                        <div className="credit-item">
                          <h3>DIRECTOR CREATIVO</h3>
                          <p>Pablo Carrasco · Sandra Gangas</p>
                        </div>
                        <div className="credit-item">
                          <h3>DISEÑADOR UX/UI</h3>
                          <p>Pablo Carrasco</p>
                        </div>
                        <div className="credit-item">
                          <h3>DESARROLLADOR FRONTEND</h3>
                          <p>Pablo Carrasco</p>
                        </div>
                        <div className="credit-item">
                          <h3>DESARROLLADOR BACKEND</h3>
                          <p>Pablo Carrasco</p>
                        </div>
                        <div className="credit-item">
                          <h3>ARTISTA 3D</h3>
                          <p>Pablo Carrasco</p>
                        </div>
                        <div className="credit-item">
                          <h3>DISEÑADOR DE SONIDO</h3>
                          <p>Pablo Carrasco</p>
                        </div>
                        <div className="credit-item">
                          <h3>DIRECTOR DE ARTE</h3>
                          <p>Pablo Carrasco · Sandra Gangas</p>
                        </div>
                        <div className="credit-item">
                          <h3>ESPECIALISTA SEO</h3>
                          <p>Pablo Carrasco</p>
                        </div>
                        <div className="credit-item">
                          <h3>ESTRATEGA DE IA</h3>
                          <p>Pablo Carrasco</p>
                        </div>
                        <div className="credit-item">
                          <h3>DISEÑADOR GRÁFICO</h3>
                          <p>Sandra Gangas</p>
                        </div>
                        <div className="credit-item final-credit">
                          <h3>INTELIMARK STUDIOS</h3>
                          <p>© 2025 - Todos los derechos reservados</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
});

Rebecca.displayName = "Rebecca";

export default Rebecca;
