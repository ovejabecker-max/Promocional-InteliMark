// src/pages/Rebecca.tsx

import { useEffect, useRef, useState, memo } from "react";
import { createPortal } from "react-dom";
import { VapiChatButton } from "../components/VapiChatButton";
import { vapiConfig } from "../config/vapi.config";
import Robot3D from "../components/Robot3D";
import FuenteCero from "../components/FuenteCero";
import { NewsletterForm } from "../components/NewsletterForm";

import CTAButtonImage from "../assets/CTAButtonV2.png";
import ContenedorCreditos from "../assets/contenedor_creditos.png";
import "./Rebecca.css";

const Rebecca = memo(() => {
  // Estados para la sección CTA
  const [ctaScrollPercent, setCtaScrollPercent] = useState(0);
  const [isCtaButtonVisible, setIsCtaButtonVisible] = useState(false);
  const [isCtaTextVisible, setIsCtaTextVisible] = useState(false);
  const [isClickProcessing, setIsClickProcessing] = useState(false);

  const [effectsActivated, setEffectsActivated] = useState({
    typewriter: false,
    button: false,
    matrix: false,
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
          setCtaScrollPercent(ratio);

          // Matrix Rain activation at 30%
          if (ratio >= 0.3 && !effectsActivated.matrix) {
            setEffectsActivated((prev) => ({ ...prev, matrix: true }));
          } else if (ratio < 0.3 && effectsActivated.matrix) {
            setEffectsActivated((prev) => ({ ...prev, matrix: false }));
          }

          // Typewriter activation at 90%
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

          // WhatsApp button activation at 95%
          if (ratio >= 0.95 && !effectsActivated.button) {
            setEffectsActivated((prev) => ({ ...prev, button: true }));
            setIsCtaButtonVisible(true);
            setTimeout(() => setIsCtaTextVisible(true), 600);
          } else if (ratio < 0.3 && effectsActivated.button) {
            setEffectsActivated((prev) => ({ ...prev, button: false }));
            setIsCtaButtonVisible(false);
            setIsCtaTextVisible(false);
          }

          // Reset all effects at 10%
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
  }, [effectsActivated]);

  // Window resize handler for responsive typewriter animation
  useEffect(() => {
    const handleResize = () => {
      const lines = document.querySelectorAll(
        ".subtitle-line-1, .subtitle-line-2"
      );
      lines.forEach((line) => {
        const element = line as HTMLElement;
        element.style.display = "none";
        element.offsetHeight; // Trigger reflow
        element.style.display = "block";
      });
    };

    let resizeTimeout: number;
    const debouncedResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(handleResize, 250);
    };

    window.addEventListener("resize", debouncedResize);
    return () => {
      window.removeEventListener("resize", debouncedResize);
      clearTimeout(resizeTimeout);
    };
  }, []);

  const [showCreditsModal, setShowCreditsModal] = useState(false);

  // Sistema de cursor CAD
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Crear cursor CAD si no existe
    let cursorCross = container.querySelector(
      ".cursor-cross"
    ) as HTMLDivElement | null;
    if (!cursorCross) {
      cursorCross = document.createElement("div");
      cursorCross.className = "cursor-cross visible";
      container.appendChild(cursorCross);
    }

    const handleCursorMove = (e: MouseEvent) => {
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

            <div
              className={`cta-button-container ${
                isCtaButtonVisible ? "visible" : "hidden"
              }`}
            >
              <div
                className="cta-button-wrapper"
                onClick={() => {
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
                <img
                  src={CTAButtonImage}
                  alt="WhatsApp Button"
                  className="cta-button-image"
                  loading="eager"
                  decoding="async"
                />

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
                      <div className="data-stream ds1 triangle-container"></div>
                    </div>{" "}
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

            <div className="footer-robot">
              <div className="robot-3d-container">
                <Robot3D
                  width="380px"
                  height="480px"
                  scale={1.2}
                  enableScrollRotation={true}
                />
              </div>

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
