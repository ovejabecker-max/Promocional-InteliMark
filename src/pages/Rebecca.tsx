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

  // Banderas para prevenir múltiples activaciones
  const [typewriterTriggered, setTypewriterTriggered] = useState(false);
  const [buttonTriggered, setButtonTriggered] = useState(false);
  const [resetTriggered, setResetTriggered] = useState(false);
  const [isTypewriterActive, setIsTypewriterActive] = useState(false); // Control del typewriter
  const [isEffectActive, setIsEffectActive] = useState(false); // Control FuenteCero/Matrix Rain

  // 🎯 ESTADOS CONSOLIDADOS PARA EFECTOS DE HOVER/MOUSE
  const [isHovering, setIsHovering] = useState(false); // Hover general

  // 🎯 REFERENCIAS CONSOLIDADAS PARA EL CTA
  const magneticRefs = useRef<(HTMLSpanElement | null)[]>([]); // Referencias magnéticas del subtítulo
  const titleMagneticRefs = useRef<(HTMLSpanElement | null)[]>([]); // Referencias magnéticas del título
  const ctaSectionRef = useRef<HTMLElement>(null); // Referencia principal de la sección CTA

  // 🎯 Efecto magnético para textos del CTA (título y subtítulo)
  useEffect(() => {
    let rafId: number | null = null;
    let isProcessing = false;

    // Handler único para todos los efectos magnéticos
    const handleUnifiedMouseMove = (e: MouseEvent) => {
      // 🚀 Throttling unificado con requestAnimationFrame
      if (isProcessing) return;

      isProcessing = true;
      rafId = requestAnimationFrame(() => {
        try {
          // 🎯 Procesar elementos del subtítulo (efectos magnéticos)
          magneticRefs.current.forEach((textElement) => {
            if (
              !textElement ||
              !textElement.classList.contains("typewriter-complete")
            )
              return;

            applyMagneticEffect(e, textElement);
          });

          // 🎯 Procesar elementos del título (efectos magnéticos)
          titleMagneticRefs.current.forEach((titleElement) => {
            if (!titleElement) return;
            applyMagneticEffect(e, titleElement, true);
          });
        } catch (error) {
          // Silent error handling
        } finally {
          isProcessing = false;
        }
      });
    };

    // 🌟 Función para aplicar el efecto magnético
    const applyMagneticEffect = (
      e: MouseEvent,
      element: HTMLSpanElement,
      isTitle = false
    ) => {
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Calcular distancia del mouse al centro del texto
      const distance = Math.sqrt(
        Math.pow(e.clientX - centerX, 2) + Math.pow(e.clientY - centerY, 2)
      );

      // Zona de influencia más grande para el título
      const maxDistance = isTitle ? 400 : 300;
      const normalizedDistance = Math.max(
        0,
        Math.min(1, distance / maxDistance)
      );
      const intensity = 1 - normalizedDistance;

      // Posición relativa del mouse dentro del elemento
      const relativeX = ((e.clientX - rect.left) / rect.width) * 100;
      const relativeY = ((e.clientY - rect.top) / rect.height) * 100;

      // Aplicar variables CSS para el efecto
      element.style.setProperty(
        "--mouse-x",
        `${Math.max(0, Math.min(100, relativeX))}%`
      );
      element.style.setProperty(
        "--mouse-y",
        `${Math.max(0, Math.min(100, relativeY))}%`
      );
      element.style.setProperty("--distance", normalizedDistance.toString());
      element.style.setProperty("--intensity", intensity.toString());

      // Activar clase magnética si está muy cerca
      const threshold = isTitle ? 0.6 : 0.7; // Umbral más bajo para el título
      if (intensity > threshold) {
        element.classList.add("magnetic-active");
      } else {
        element.classList.remove("magnetic-active");
      }
    };

    // Detectar cuando las animaciones typewriter terminan
    const checkTypewriterComplete = () => {
      magneticRefs.current.forEach((textElement, index) => {
        if (!textElement) return;

        // Tiempo estimado cuando cada línea termina
        const completionTimes = [6500, 11000]; // 3s delay + 3.5s typing, 7s delay + 4s typing
        const lineIndex = index;

        setTimeout(() => {
          textElement.classList.add("typewriter-complete");
        }, completionTimes[lineIndex]);
      });
    };

    // Agregar listener al documento y ejecutar detección
    document.addEventListener("mousemove", handleUnifiedMouseMove);
    checkTypewriterComplete();

    return () => {
      document.removeEventListener("mousemove", handleUnifiedMouseMove);
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, []);

  // CONTROLADOR DE SCROLL CTA
  useEffect(() => {
    /* 
    📊 UMBRALES DE ACTIVACIÓN CTA:
    • Matrix Rain: 30% visible → Activa lluvia de códigos
    • Typewriter: 90% visible → Inicia animación de escritura
    • Botón WhatsApp: 95% visible → Aparece botón + texto
    • Reset: 10% visible → Resetea todos los efectos
    • Desvanecimiento: 30% visible → Oculta botón
    */

    // 🎯 Función helper para control de typewriter (CON GUARD)
    const handleTypewriterControl = (ratio: number, isActive: boolean) => {
      if (ratio >= 0.9 && !isActive && !typewriterTriggered) {
        setIsTypewriterActive(true);
        setTypewriterTriggered(true); // Prevenir múltiples activaciones

        const line1 = document.querySelector(
          ".subtitle-line-1.typewriter-line"
        );
        const line2 = document.querySelector(
          ".subtitle-line-2.typewriter-line"
        );

        if (line1) {
          line1.classList.add("typewriter-active");
        }
        if (line2) {
          line2.classList.add("typewriter-active");
          console.log("✅ Typewriter línea 2 activada");
        }
      }
    };

    // 🎯 Función helper para control del botón WhatsApp (CON GUARD)
    const handleButtonControl = (ratio: number) => {
      if (ratio >= 0.95 && !buttonTriggered) {
        setIsCtaButtonVisible(true);
        setButtonTriggered(true); // Prevenir múltiples activaciones
        setTimeout(() => setIsCtaTextVisible(true), 600);
      } else if (ratio < 0.3 && buttonTriggered) {
        setIsCtaButtonVisible(false);
        setIsCtaTextVisible(false);
        setButtonTriggered(false); // Reset para permitir reactivación
      }
    };

    // 🎯 Función helper para reset completo (CON GUARD)
    const handleResetEffects = (ratio: number, isActive: boolean) => {
      if (ratio < 0.1 && isActive && !resetTriggered) {
        setIsTypewriterActive(false);
        setTypewriterTriggered(false); // Reset banderas
        setResetTriggered(true); // Prevenir múltiples resets

        const line1 = document.querySelector(
          ".subtitle-line-1.typewriter-line"
        );
        const line2 = document.querySelector(
          ".subtitle-line-2.typewriter-line"
        );

        if (line1) line1.classList.remove("typewriter-active");
        if (line2) line2.classList.remove("typewriter-active");
      } else if (ratio > 0.2) {
        setResetTriggered(false); // Permitir nuevo reset cuando scroll sube
      }
    };

    // 🎯 Función helper para FuenteCero/Matrix Rain
    const handleMatrixRainControl = (ratio: number) => {
      if (ratio >= 0.3) {
        setIsEffectActive(true);
      } else {
        setIsEffectActive(false);
      }
    };

    // 🎯 Observer principal reorganizado
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const ratio = entry.intersectionRatio;
          setCtaScrollPercent(ratio);

          // 🎯 Ejecutar controles en orden lógico
          handleTypewriterControl(ratio, isTypewriterActive);
          handleButtonControl(ratio);
          handleResetEffects(ratio, isTypewriterActive);
          handleMatrixRainControl(ratio);
        });
      },
      {
        threshold: Array.from({ length: 101 }, (_, i) => i / 100), // Precisión 0.01
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
  }, [
    isTypewriterActive,
    typewriterTriggered,
    buttonTriggered,
    resetTriggered,
  ]); // Dependencias actualizadas

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
  const containerRef = useRef<HTMLDivElement>(null!);
  const tooltipRef = useRef<HTMLDivElement>(null!);

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
          <div
            className="portal-effects center-absolute"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            <div className="glow-ring"></div>
            <div className="pulse-ring"></div>
            <div className="rotating-ring-outer"></div>
            <div className="rotating-ring-inner"></div>
            <div className="particle-ring"></div>
            <div className="energy-pulse"></div>
            <div className="wave-effect"></div>
          </div>
          <div
            ref={tooltipRef}
            className="cursor-tooltip"
            style={{ opacity: isHovering ? 1 : 0 }}
          >
            HABLA CON NUESTRA IA
          </div>
        </div>

        <section
          ref={ctaSectionRef}
          className={`call-to-action-section ${
            isEffectActive ? "active-effect" : ""
          }`}
          id="cta-section"
        >
          {isEffectActive && <FuenteCero parentRef={ctaSectionRef} />}

          <div className="cta-content">
            <h2
              className="cta-title"
              style={{
                textAlign: "center",
                position: "relative",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "clamp(8px, 2vw, 12px)",
                width: "100%",
                maxWidth: "none", // 🎯 REMOVIDO: límite de ancho para permitir animación completa
                margin: "0 auto",
                overflow: "visible", // 🎯 CAMBIADO: de hidden a visible para permitir animación desde bordes
                minHeight: "clamp(120px, 15vh, 180px)", // Altura mínima para evitar corte
                paddingTop: "clamp(10px, 2vh, 20px)", // 🎯 AGREGADO: padding superior
                paddingBottom: "clamp(10px, 2vh, 20px)", // 🎯 AGREGADO: padding inferior
              }}
            >
              <span
                ref={(el) => (titleMagneticRefs.current[0] = el)}
                className="magnetic-text"
                style={{
                  display: "inline-block",
                  transform: `translateX(${
                    -window.innerWidth * 0.7 +
                    (Math.min(ctaScrollPercent, 0.9) / 0.9) *
                      window.innerWidth *
                      0.7
                  }px)`, // 🎯 RESTAURADO: Animación original desde bordes completos
                  opacity: ctaScrollPercent >= 0.3 ? 1 : 0,
                  transition: "transform 0.1s linear, opacity 0.2s",
                  fontFamily: "SohoPro, Montserrat, Arial, sans-serif",
                  fontWeight: 900,
                  fontStyle: "italic",
                  fontVariationSettings: '"wght" 900',
                  letterSpacing: "clamp(0.02em, 0.5vw, 0.04em)",
                  zIndex: 10,
                  lineHeight: 1.1, // Evitar corte de texto
                  fontSize: "clamp(2.5rem, 7vw, 5.5rem)",
                  color: "#ffffff",
                  textShadow: "2px 2px 8px rgba(0, 0, 0, 0.7)",
                  textAlign: "center",
                  width: "auto",
                  whiteSpace: "nowrap",
                }}
              >
                TRABAJEMOS
              </span>
              <span
                ref={(el) => (titleMagneticRefs.current[1] = el)}
                className="magnetic-text"
                style={{
                  display: "inline-block",
                  transform: `translateX(${
                    window.innerWidth * 0.7 -
                    (Math.min(ctaScrollPercent, 0.9) / 0.9) *
                      window.innerWidth *
                      0.7
                  }px)`, // 🎯 RESTAURADO: Animación original desde bordes completos
                  opacity: ctaScrollPercent >= 0.3 ? 1 : 0,
                  transition: "transform 0.1s linear, opacity 0.2s",
                  fontFamily: "SohoPro, Montserrat, Arial, sans-serif",
                  fontWeight: 900,
                  fontStyle: "italic",
                  fontVariationSettings: '"wght" 900',
                  letterSpacing: "clamp(0.02em, 0.5vw, 0.04em)",
                  zIndex: 10,
                  lineHeight: 1.1, // Evitar corte de texto
                  textTransform: "uppercase",
                  fontSize: "clamp(2.5rem, 7vw, 5.5rem)",
                  color: "#ffffff",
                  textShadow: "2px 2px 8px rgba(0, 0, 0, 0.7)",
                  textAlign: "center",
                  width: "auto",
                  whiteSpace: "nowrap",
                }}
              >
                JUNTOS
              </span>
            </h2>

            {/* Subtítulo CTA */}
            <div className="cta-subtitle-space">
              <p className="cta-subtitle">
                <span
                  ref={(el) => (magneticRefs.current[0] = el)}
                  className="subtitle-line-1 typewriter-line"
                  data-text="COMENZÓ UN NUEVO CAMBIO MUNDIAL, LA ERA TECNOLÓGICA."
                >
                  COMENZÓ UN NUEVO CAMBIO MUNDIAL, LA ERA TECNOLÓGICA.
                </span>
                <span
                  ref={(el) => (magneticRefs.current[1] = el)}
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
                  style={{
                    maxWidth: "100%",
                    height: "auto",
                    display: "block",
                  }}
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
