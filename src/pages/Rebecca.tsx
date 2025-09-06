// src/pages/Rebecca.tsx (Versión Optimizada para Performance)

import { useEffect, useRef, useState, memo } from "react";
import { createPortal } from "react-dom";
import { VapiChatButton } from "../components/VapiChatButton";
import { vapiConfig } from "../config/vapi.config";
import Robot3D from "../components/Robot3D";
import FuenteCero from "../components/FuenteCero";
import { NewsletterForm } from "../components/NewsletterForm";

import CTAButtonImage from "../assets/CTAButtonV2.png"; // Imagen optimizada V2
import ContenedorCreditos from "../assets/contenedor_creditos.png"; // Importar imagen del contenedor tecnológico
import "./Rebecca.css";

const Rebecca = memo(() => {
  // 🎯 ESTADOS CONSOLIDADOS PARA LA SECCIÓN CTA
  const [ctaScrollPercent, setCtaScrollPercent] = useState(0); // 0 a 1
  const [isCtaButtonVisible, setIsCtaButtonVisible] = useState(false); // Control de fade-in tecnológico
  const [isCtaTextVisible, setIsCtaTextVisible] = useState(false); // Control de texto
  const [isClickProcessing, setIsClickProcessing] = useState(false); // Control click CTA

  // Banderas simplificadas para control de activación
  const [effectsActivated, setEffectsActivated] = useState({
    typewriter: false,
    button: false,
    matrix: false,
  });

  // 🎯 ESTADOS CONSOLIDADOS PARA EFECTOS DE HOVER/MOUSE
  // Estados removidos para simplificación

  // 🎯 REFERENCIAS CONSOLIDADAS PARA EL CTA
  const containerRef = useRef<HTMLDivElement>(null); // Referencia principal del contenedor
  const ctaSectionRef = useRef<HTMLElement>(null); // Referencia principal de la sección CTA

  // CONTROLADOR DE SCROLL CTA SIMPLIFICADO
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const ratio = entry.intersectionRatio;
          setCtaScrollPercent(ratio);

          // Control Matrix Rain (30% visible)
          if (ratio >= 0.3 && !effectsActivated.matrix) {
            setEffectsActivated((prev) => ({ ...prev, matrix: true }));
          } else if (ratio < 0.3 && effectsActivated.matrix) {
            setEffectsActivated((prev) => ({ ...prev, matrix: false }));
          }

          // Control Typewriter (90% visible)
          if (ratio >= 0.9 && !effectsActivated.typewriter) {
            setEffectsActivated((prev) => ({ ...prev, typewriter: true }));

            const line1 = document.querySelector(
              ".subtitle-line-1.typewriter-line"
            );
            const line2 = document.querySelector(
              ".subtitle-line-2.typewriter-line"
            );

            if (line1) line1.classList.add("typewriter-active");
            if (line2) line2.classList.add("typewriter-active");
          }

          // Control Botón WhatsApp (95% visible)
          if (ratio >= 0.95 && !effectsActivated.button) {
            setEffectsActivated((prev) => ({ ...prev, button: true }));
            setIsCtaButtonVisible(true);
            setTimeout(() => setIsCtaTextVisible(true), 600);
          } else if (ratio < 0.3 && effectsActivated.button) {
            setEffectsActivated((prev) => ({ ...prev, button: false }));
            setIsCtaButtonVisible(false);
            setIsCtaTextVisible(false);
          }

          // Reset completo (10% visible)
          if (
            ratio < 0.1 &&
            (effectsActivated.typewriter || effectsActivated.button)
          ) {
            setEffectsActivated({
              typewriter: false,
              button: false,
              matrix: false,
            });

            const line1 = document.querySelector(
              ".subtitle-line-1.typewriter-line"
            );
            const line2 = document.querySelector(
              ".subtitle-line-2.typewriter-line"
            );

            if (line1) line1.classList.remove("typewriter-active");
            if (line2) line2.classList.remove("typewriter-active");

            setIsCtaButtonVisible(false);
            setIsCtaTextVisible(false);
          }
        });
      },
      {
        threshold: [0, 0.1, 0.3, 0.9, 0.95, 1], // Solo los thresholds necesarios
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
  }, [effectsActivated]); // Dependencia simplificada

  // 🎯 Listener para redimensionamiento de ventana para mejorar responsividad
  useEffect(() => {
    const handleResize = () => {
      // Forzar recálculo de estilos del subtítulo para mejor adaptabilidad
      const lines = document.querySelectorAll(
        ".subtitle-line-1, .subtitle-line-2"
      );
      lines.forEach((line) => {
        const element = line as HTMLElement;
        // Forzar reflow para recalcular dimensiones responsive
        element.style.display = "none";
        element.offsetHeight; // Trigger reflow
        element.style.display = "block";
      });
    };

    let resizeTimeout: number;
    const debouncedResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(handleResize, 250); // Debounce para performance
    };

    window.addEventListener("resize", debouncedResize);
    return () => {
      window.removeEventListener("resize", debouncedResize);
      clearTimeout(resizeTimeout);
    };
  }, []);

  // 🎯 ESTADO PARA MODAL DE CRÉDITOS
  const [showCreditsModal, setShowCreditsModal] = useState(false);

  // SISTEMA DE CURSOR CAD SIMPLIFICADO
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Crear cursor CAD si no existe
    let cursorCross = container.querySelector(
      ".cursor-cross"
    ) as HTMLDivElement | null;
    if (!cursorCross) {
      cursorCross = document.createElement("div");
      cursorCross.className = "cursor-cross visible"; // Siempre visible
      container.appendChild(cursorCross);
    }

    // Handler unificado: Solo actualizar posición del cursor
    const handleCursorMove = (e: MouseEvent) => {
      // Detección de zona CTA para ocultar cursor
      const ctaSection = document.getElementById("cta-section");
      let inCTA = false;

      if (ctaSection) {
        const rect = ctaSection.getBoundingClientRect();
        inCTA =
          e.clientX >= rect.left &&
          e.clientX <= rect.right &&
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom;
      }

      if (inCTA) {
        cursorCross.style.display = "none";
        container.style.setProperty("--cursor-x", "-100px");
        container.style.setProperty("--cursor-y", "-100px");
      } else {
        cursorCross.style.display = "block";
        // 🎯 Actualizar posición del cursor CAD
        requestAnimationFrame(() => {
          container.style.setProperty("--cursor-x", `${e.clientX}px`);
          container.style.setProperty("--cursor-y", `${e.clientY}px`);
          cursorCross.style.left = `${e.clientX}px`;
          cursorCross.style.top = `${e.clientY}px`;
        });
      }
    };

    const handleMouseLeave = () => {
      cursorCross.style.display = "none";
    };

    const handleMouseEnter = () => {
      cursorCross.style.display = "block";
    };

    // Listeners simplificados
    document.addEventListener("mousemove", handleCursorMove);
    container.addEventListener("mouseleave", handleMouseLeave);
    container.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      document.removeEventListener("mousemove", handleCursorMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
      container.removeEventListener("mouseenter", handleMouseEnter);
      if (cursorCross && container.contains(cursorCross)) {
        container.removeChild(cursorCross);
      }
    };
  }, []);

  return (
    <>
      <div ref={containerRef} className="rebecca-container">
        <div className="main-content-wrapper">
          <h1 className="portal-title">¡Bienvenido al futuro!</h1>
          <div className="vapi-content center-absolute">
            <VapiChatButton config={vapiConfig} variant="center" size="large" />
          </div>
          <div className="portal-effects center-absolute">
            <div className="glow-ring"></div>
            <div className="pulse-ring"></div>
            <div className="rotating-ring-outer"></div>
            <div className="rotating-ring-inner"></div>
            <div className="particle-ring"></div>
            <div className="energy-pulse"></div>
            <div className="wave-effect"></div>
          </div>
        </div>

        <section
          ref={ctaSectionRef}
          className={`call-to-action-section ${
            effectsActivated.matrix ? "active-effect" : ""
          }`}
          id="cta-section"
        >
          {effectsActivated.matrix && <FuenteCero parentRef={ctaSectionRef} />}

          <div className="cta-content">
            <h2 className="cta-title cta-title-container">
              <span
                className={`cta-title-span trabajemos ${
                  ctaScrollPercent >= 0.3 ? "visible" : ""
                }`}
                style={{
                  transform: `translateX(${
                    -window.innerWidth * 0.7 +
                    (Math.min(ctaScrollPercent, 0.9) / 0.9) *
                      window.innerWidth *
                      0.7
                  }px)`,
                }}
              >
                TRABAJEMOS
              </span>
              <span
                className={`cta-title-span juntos ${
                  ctaScrollPercent >= 0.3 ? "visible" : ""
                }`}
                style={{
                  transform: `translateX(${
                    window.innerWidth * 0.7 -
                    (Math.min(ctaScrollPercent, 0.9) / 0.9) *
                      window.innerWidth *
                      0.7
                  }px)`,
                }}
              >
                JUNTOS
              </span>
            </h2>

            {/* Subtítulo CTA */}
            <div className="cta-subtitle-space">
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

            {/* Botón CTA */}
            <div
              className={`cta-button-container ${
                isCtaButtonVisible ? "visible" : "hidden"
              }`}
            >
              <div
                className="cta-button-wrapper"
                onClick={() => {
                  // 🔧 OPTIMIZACIÓN: Prevenir clicks múltiples rápidos
                  if (isClickProcessing) return;

                  setIsClickProcessing(true);
                  window.open("https://wa.me/56949459379", "_blank");

                  // Reset después de un breve delay
                  setTimeout(() => setIsClickProcessing(false), 300);
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
                {/* Imagen del botón optimizada */}
                <img
                  src={CTAButtonImage}
                  alt="WhatsApp Button"
                  className="cta-button-image"
                  loading="eager"
                  decoding="async"
                />

                {/* Texto del botón adaptado a la pantalla rectangular existente */}
                <div
                  className={`cta-button-text-overlay center-absolute flex-center ${
                    isCtaTextVisible ? "text-visible" : "text-hidden"
                  }`}
                >
                  <span className="cta-button-text-display">WHATSAPP</span>
                  <div className="digital-glitch-overlay"></div>
                  <div className="electrical-interference"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <footer className="footer-reveal" id="footer-reveal">
          <div className="footer-content">
            {/* COLUMNA IZQUIERDA: Newsletter + AI Matrix Button */}
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
                    {/* 🏹 TRIÁNGULO GEOMÉTRICO SIMPLE APUNTANDO A LA IZQUIERDA */}
                    <div className="data-matrix arrow-shape">
                      {/* Contenedor principal del triángulo */}
                      <div className="data-stream ds1 triangle-container"></div>
                    </div>

                    <div className="hologram-layers">
                      <div className="holo-layer layer1"></div>
                      <div className="holo-layer layer2"></div>
                      <div className="holo-layer layer3"></div>
                    </div>

                    <div className="holo-text">
                      <span
                        className="text-glitch"
                        data-text="VOLVER AL INICIO"
                      >
                        VOLVER AL INICIO
                      </span>
                    </div>

                    <div className="depth-scanner"></div>
                  </div>
                </button>
              </div>
            </div>

            {/* COLUMNA CENTRO: Robot3D + Créditos + Copyright */}
            <div className="footer-robot">
              <div className="robot-3d-container">
                <Robot3D
                  width="380px"
                  height="480px"
                  scale={1.2}
                  enableScrollRotation={true}
                />
              </div>

              {/* 🎯 CRÉDITOS DIRECTAMENTE DEBAJO DEL ROBOT */}
              <div className="footer-credits">
                <button
                  className="credits-link"
                  onClick={() => setShowCreditsModal(true)}
                >
                  VER TODOS LOS CREDITOS
                </button>
                <p>© 2025 InteliMark - Todos los derechos reservados</p>
              </div>
            </div>

            {/* COLUMNA DERECHA: Información de Contacto */}
            <div className="contact-info">
              <h4>PONTE EN CONTACTO</h4>

              <div className="contact-item general">
                <div className="contact-icon">
                  <div className="icon-general">📧</div>
                </div>
                <p>info@intelimark.cl</p>
                <span className="contact-label">Información General</span>
              </div>

              <div className="contact-item commercial">
                <div className="contact-icon">
                  <div className="icon-commercial">💼</div>
                </div>
                <p>pcarrasco@intelimark.cl</p>
                <span className="contact-label">Departamento Comercial</span>
              </div>

              <div className="contact-item phone">
                <div className="contact-icon">
                  <div className="icon-phone">📱</div>
                </div>
                <p>+56 9 4945 9379</p>
                <span className="contact-label">WhatsApp / Llamadas</span>
              </div>

              <div className="contact-item address">
                <div className="contact-icon">
                  <div className="icon-location">📍</div>
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

      {/* � MODAL OFICIAL DE CRÉDITOS - CONTENEDOR TECNOLÓGICO */}
      {showCreditsModal &&
        createPortal(
          <div
            className="credits-modal-overlay"
            onClick={() => setShowCreditsModal(false)}
          >
            <div className="credits-modal-container">
              <button
                className="credits-close-button"
                onClick={() => setShowCreditsModal(false)}
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
