// src/pages/Rebecca.tsx

import { useEffect, useRef, useState, memo, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { usePortalTransition } from "../hooks/usePortalTransition";
import { VapiChatButton } from "../components/VapiChatButton";
import { vapiConfig } from "../config/vapi.config";
import { useVapi } from "../hooks/useVapi";
import FuenteCero from "../components/FuenteCero";
import { NewsletterForm } from "../components/NewsletterForm";
import { RobotFooterModel } from "../components/RobotFooterModel";
import SimpleCreditsModal from "../components/SimpleCreditsModal";
import { TranscriptModal } from "../components/TranscriptModal";
import CadCursor from "../components/CadCursor";

import CTAButtonImage from "../assets/CTAButtonV2.png";
import ContenedorCreditos from "../assets/contenedor_creditos.png";
import "./Rebecca.css";

const Rebecca = memo(() => {
  // 🌀 HOOKS DE TRANSICIÓN: Detectar si viene de portal
  const location = useLocation();
  const portalTransition = usePortalTransition();
  const navigate = useNavigate();

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

  // Refs para spans typewriter (evita querySelector en observer)
  const line1Ref = useRef<HTMLSpanElement>(null);
  const line2Ref = useRef<HTMLSpanElement>(null);

  // Ancho de viewport memoizable para evitar leer window.innerWidth en cada render
  const [viewportWidth, setViewportWidth] = useState<number>(
    typeof window !== "undefined" ? window.innerWidth : 1920
  );

  // Debounce de resize para estabilidad y evitar thrash de layout
  useEffect(() => {
    let timeout: number | undefined;
    const handle = () => {
      if (timeout) window.clearTimeout(timeout);
      timeout = window.setTimeout(() => {
        setViewportWidth(window.innerWidth);
      }, 120); // 120ms suficiente para suavizar
    };
    window.addEventListener("resize", handle, { passive: true });
    return () => {
      if (timeout) window.clearTimeout(timeout);
      window.removeEventListener("resize", handle);
    };
  }, []);

  // Cálculo memoizado del movimiento del título TRABAJEMOS / JUNTOS
  const titleMotion = useMemo(() => {
    const start = 0.3;
    const end = 0.9;
    const raw = ctaState.scrollPercent;
    const progress = Math.max(0, Math.min(1, (raw - start) / (end - start)));
    const travelWidth = viewportWidth * 0.7; // distancia máxima lateral
    return {
      leftX: -travelWidth * (1 - progress),
      rightX: travelWidth * (1 - progress),
      visible: raw >= start,
    };
  }, [ctaState.scrollPercent, viewportWidth]);

  // 🎯 OPTIMIZACIÓN: Mantener ref actualizada
  useEffect(() => {
    ctaStateRef.current = ctaState;
  }, [ctaState]);

  // Controlador de scroll CTA
  useEffect(() => {
    // Batching optimizado: thresholds reducidos y un solo setState por frame
    let framePending = false;
    let scheduledState: typeof ctaStateRef.current | null = null;

    const requestFlush = () => {
      if (framePending) return;
      framePending = true;
      requestAnimationFrame(() => {
        framePending = false;
        if (scheduledState) {
          setCtaState(scheduledState);
          scheduledState = null;
        }
      });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        const ratio = entry.intersectionRatio;
        const current = ctaStateRef.current;
        let next: typeof current | null = null;

        const commitChange = () => {
          if (next) {
            scheduledState = next;
            requestFlush();
          }
        };

        // 1. scrollPercent
        if (current.scrollPercent !== ratio) {
          if (!next) next = { ...current };
          next.scrollPercent = ratio;
        }

        // 2. Activación sección CTA (matrix + text)
        const shouldActivateSection = ratio >= 0.3;
        if (shouldActivateSection !== current.effectsActivated.ctaSection) {
          if (!next) next = { ...current };
          next.effectsActivated = {
            ...next.effectsActivated,
            ctaSection: shouldActivateSection,
          };
        }

        // 3. Visibilidad botón CTA (histéresis simplificada: show >=0.95, hide <0.85)
        if (!current.buttonVisible && ratio >= 0.95) {
          if (!next) next = { ...current };
          next.buttonVisible = true;
        } else if (current.buttonVisible && ratio < 0.85) {
          if (!next) next = { ...current };
          next.buttonVisible = false;
        }

        // 4. Typewriter (activar >=0.95, reset <0.1)
        if (ratio >= 0.95 && !current.effectsActivated.typewriter) {
          if (!next) next = { ...current };
          next.effectsActivated = {
            ...next.effectsActivated,
            typewriter: true,
          };
          if (line1Ref.current)
            line1Ref.current.classList.add("typewriter-active");
          if (line2Ref.current)
            line2Ref.current.classList.add("typewriter-active");
        } else if (
          ratio < 0.1 &&
          (current.effectsActivated.typewriter ||
            current.effectsActivated.ctaSection)
        ) {
          if (!next) next = { ...current };
          next.effectsActivated = { typewriter: false, ctaSection: false };
          next.buttonVisible = false;
          if (line1Ref.current)
            line1Ref.current.classList.remove("typewriter-active");
          if (line2Ref.current)
            line2Ref.current.classList.remove("typewriter-active");
        }

        commitChange();
      },
      {
        threshold: [0, 0.1, 0.3, 0.9, 0.95, 1],
      }
    );

    const sectionElement = ctaSectionRef.current;
    if (sectionElement) observer.observe(sectionElement);

    return () => {
      observer.disconnect();
    };
  }, []);

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

  // 🌀 EFECTO: Detectar entrada desde portal y configurar animaciones (consolidado)
  useEffect(() => {
    if (entryState.hasInitialized) return;
    const fromPortal = portalDetectionData.isFromPortal;
    initializeEntry(fromPortal);
    setEntryState({ fromPortal, hasInitialized: true });
  }, [portalDetectionData, entryState.hasInitialized]);

  // 🎬 FUNCIÓN: Inicializar entrada (portal o normal) - unificada
  const initializeEntry = (_fromPortal: boolean) => {
    const container = containerRef.current;
    if (container) {
      container.style.opacity = "1";
      container.style.filter = "none";
      container.style.transform = "none";
      container.style.transition = "";
    }
  };

  return (
    <>
      {/* Cursor CAD estilo AutoCAD: visible dentro de .rebecca-container y oculto sobre CTA */}
      <CadCursor
        color="var(--color-orange-primary)"
        thickness={1}
        containerSelector=".rebecca-container"
      />
      <div
        ref={containerRef}
        className={`rebecca-container ${
          entryState.fromPortal ? "from-portal" : "normal-entry"
        } ${entryState.hasInitialized ? "animation-completed" : "animating"}`}
      >
        <div className="main-content-wrapper">
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
              <span
                className={`cta-title-span trabajemos ${
                  titleMotion.visible ? "visible" : ""
                }`}
                style={{ transform: `translateX(${titleMotion.leftX}px)` }}
              >
                TRABAJEMOS
              </span>
              <span
                className={`cta-title-span juntos ${
                  titleMotion.visible ? "visible" : ""
                }`}
                style={{ transform: `translateX(${titleMotion.rightX}px)` }}
              >
                JUNTOS
              </span>
            </h2>

            <div className="cta-subtitle">
              <p className="cta-subtitle">
                <span
                  ref={line1Ref}
                  className="subtitle-line-1 typewriter-line"
                  data-text="COMENZÓ UN NUEVO CAMBIO MUNDIAL, LA ERA TECNOLÓGICA."
                >
                  COMENZÓ UN NUEVO CAMBIO MUNDIAL, LA ERA TECNOLÓGICA.
                </span>
                <span
                  ref={line2Ref}
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
                  const newWindow = window.open(
                    "https://wa.me/56949459379",
                    "_blank",
                    "noopener,noreferrer"
                  );
                  if (newWindow) newWindow.opener = null; // Seguridad extra

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
                  loading="lazy"
                  decoding="async"
                  width="320"
                  height="320"
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
                    zIndex: 1000, // Normalizado desde 2000000
                  }}
                  onClick={() => navigate("/")}
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
