import { useEffect, useRef } from "react";

// 🎯 CONFIGURACIÓN OPTIMIZADA PARA PERFORMANCE
const ANIMATION_CONFIG = {
  // Performance ultra-conservadora: 20fps para reducir violaciones
  TARGET_FPS: 20, // ⚡ Reducido de 30fps a 20fps para menos overhead
  FAVICON_TARGET_FPS: 15, // ⚡ Optimizado específicamente para favicon
  // Título: actualización cada 600ms para menor impacto en performance
  TITLE_UPDATE_INTERVAL: 600, // ⚡ Aumentado de 400ms a 600ms
  // Favicon: 3 segundos por rotación completa
  FAVICON_ROTATION_DURATION: 3000,
  // Favicon: tamaño estándar
  FAVICON_SIZE: 32,
} as const;

// Configuración del título animado
const TITLE_CONFIG = {
  STATIC_PART: "InteliMark || ",
  SEPARATOR: "   ",
  VISIBLE_WIDTH: 35,
  DEFAULT_TITLE: "InteliMark",
  SCROLLING_PARTS: ["Sitio en construcción... |", "Vuelve pronto. |"],
} as const;

/** Configuración para las animaciones unificadas del navegador */
interface UnifiedBrowserAnimationsConfig {
  /** Tamaño del favicon. Por defecto 32px */
  faviconSize?: number;
  /** Duración de rotación del favicon en ms. Por defecto 3000ms */
  faviconRotationDuration?: number;
  /** Partes del texto que se desplazarán en el título */
  titleScrollingParts?: string[];
  /** Habilitar animación del favicon. Por defecto true */
  enableFavicon?: boolean;
  /** Habilitar animación del título. Por defecto true */
  enableTitle?: boolean;
}

// 🌟 SISTEMA SINGLETON GLOBAL MEJORADO PARA EVITAR MÚLTIPLES INSTANCIAS
let globalAnimationId: number | null = null;
let globalIsActive = false;

export const useUnifiedBrowserAnimations = (
  config: UnifiedBrowserAnimationsConfig = {}
) => {
  const {
    faviconSize = ANIMATION_CONFIG.FAVICON_SIZE,
    faviconRotationDuration = ANIMATION_CONFIG.FAVICON_ROTATION_DURATION,
    titleScrollingParts = TITLE_CONFIG.SCROLLING_PARTS,
    enableFavicon = true,
    enableTitle = true,
  } = config;

  const isActiveRef = useRef<boolean>(false);

  useEffect(() => {
    // 🛡️ SINGLETON MEJORADO: Prevenir múltiples instancias activas
    if (globalIsActive) {
      console.warn(
        "⚠️ Intento de crear múltiples instancias de animación. Ignorando."
      );
      return;
    }

    // 🔄 RESET PREVENTIVO: Limpiar cualquier estado residual
    if (globalAnimationId) {
      cancelAnimationFrame(globalAnimationId);
      globalAnimationId = null;
    }

    globalIsActive = true;
    isActiveRef.current = true;
    console.log("🚀 Nueva instancia de animación iniciada");

    // ⚡ VARIABLES DE CONTROL OPTIMIZADAS
    const faviconFrameInterval = 1000 / ANIMATION_CONFIG.FAVICON_TARGET_FPS;
    let lastFaviconUpdate = 0;
    let startTime: number | null = null;
    let currentTitleIndex = 0;
    let lastFaviconDataURL = "";
    let faviconFrameCount = 0;
    let titleInterval: number | null = null;
    let titleFrames: string[] = [];

    // 🎯 INICIALIZACIÓN DE ELEMENTOS DOM
    let favicon: HTMLLinkElement | null = null;
    let faviconCanvas: HTMLCanvasElement | null = null;
    let faviconCtx: CanvasRenderingContext2D | null = null;
    let faviconImg: HTMLImageElement | null = null;
    let isImageLoaded = false;

    // 📐 CONFIGURACIÓN DEL FAVICON
    if (enableFavicon) {
      faviconCanvas = document.createElement("canvas");
      faviconCanvas.width = faviconSize;
      faviconCanvas.height = faviconSize;
      faviconCtx = faviconCanvas.getContext("2d");

      if (!faviconCtx) {
        console.warn("No se pudo crear contexto canvas para favicon");
      } else {
        favicon = document.querySelector(
          "link[rel~='icon']"
        ) as HTMLLinkElement;
        if (!favicon) {
          favicon = document.createElement("link");
          favicon.rel = "icon";
          document.head.appendChild(favicon);
        }

        faviconImg = new Image();
        // 🎯 USAR PNG EN LUGAR DE ICO PARA MEJOR COMPATIBILIDAD CON CANVAS
        faviconImg.src = "/favicon.png";
        faviconImg.onload = () => {
          isImageLoaded = true;
          console.log("✅ Favicon PNG cargado exitosamente");
        };
        faviconImg.onerror = () => {
          console.warn("⚠️ Error al cargar favicon PNG, intentando con ICO");
          // Fallback: intentar con favicon.ico
          if (faviconImg) {
            faviconImg.src = "/favicon.ico";
            faviconImg.onload = () => {
              isImageLoaded = true;
              console.log("✅ Favicon ICO cargado como fallback");
            };
            faviconImg.onerror = () => {
              console.error("❌ Error al cargar ambos favicon (PNG y ICO)");
              isImageLoaded = false;
            };
          }
        };
      }
    }

    // 📝 SISTEMA SEPARADO DE TÍTULO (Optimizado con setInterval)
    if (enableTitle) {
      // Establecer título inicial inmediatamente
      document.title = TITLE_CONFIG.STATIC_PART.slice(0, -3); // "InteliMark"

      // Pre-calcular frames del título para mejor performance
      const scrollContent =
        titleScrollingParts.join(TITLE_CONFIG.SEPARATOR) +
        TITLE_CONFIG.SEPARATOR;
      const contentLength = scrollContent.length;
      const prefix = TITLE_CONFIG.STATIC_PART;

      for (let i = 0; i < contentLength; i++) {
        const rotated =
          scrollContent.substring(i) + scrollContent.substring(0, i);
        titleFrames.push(
          prefix + rotated.substring(0, TITLE_CONFIG.VISIBLE_WIDTH)
        );
      }

      // 🎯 TÍTULO INDEPENDIENTE: setInterval optimizado sin overhead del loop principal
      titleInterval = setInterval(() => {
        if (!document.hidden && enableTitle && titleFrames.length > 0) {
          document.title = titleFrames[currentTitleIndex];
          currentTitleIndex = (currentTitleIndex + 1) % titleFrames.length;
        }
      }, ANIMATION_CONFIG.TITLE_UPDATE_INTERVAL);
    }

    // 🎬 BUCLE PRINCIPAL OPTIMIZADO EXCLUSIVAMENTE PARA FAVICON
    // 🎬 BUCLE PRINCIPAL OPTIMIZADO EXCLUSIVAMENTE PARA FAVICON
    const faviconAnimationLoop = (timestamp: number) => {
      // � VERIFICACIÓN SIMPLIFICADA: Solo para favicon
      if (!isActiveRef.current || !globalIsActive || document.hidden) {
        if (globalAnimationId) {
          cancelAnimationFrame(globalAnimationId);
          globalAnimationId = null;
        }
        globalIsActive = false;
        return;
      }

      // Inicializar tiempo de inicio
      if (!startTime) startTime = timestamp;

      // 🎨 ACTUALIZACIÓN EXCLUSIVA DEL FAVICON
      if (
        enableFavicon &&
        faviconCtx &&
        faviconCanvas &&
        faviconImg &&
        isImageLoaded &&
        favicon &&
        timestamp - lastFaviconUpdate > faviconFrameInterval
      ) {
        try {
          const elapsedTime = timestamp - startTime;
          const rotationProgress =
            (elapsedTime % faviconRotationDuration) / faviconRotationDuration;
          const currentAngle = rotationProgress * Math.PI * 2;

          // 🚀 RENDERIZADO OPTIMIZADO CON requestIdleCallback
          const renderFaviconOperation = () => {
            // Renderizar favicon con rotación 3D
            faviconCtx.clearRect(0, 0, faviconSize, faviconSize);
            faviconCtx.save();
            faviconCtx.translate(faviconSize / 2, faviconSize / 2);

            // Efecto 3D: escalado en X según el coseno del ángulo
            const scaleX = Math.cos(currentAngle);
            faviconCtx.scale(scaleX, 1);

            faviconCtx.drawImage(
              faviconImg,
              -faviconSize / 2,
              -faviconSize / 2,
              faviconSize,
              faviconSize
            );

            faviconCtx.restore();

            // 🎯 TRIPLE THROTTLING ESCALONADO: Solo actualizar cada 3 frames para máxima eficiencia
            faviconFrameCount++;
            if (faviconFrameCount % 3 === 0) {
              const newDataURL = faviconCanvas.toDataURL("image/png");
              if (
                favicon.href !== newDataURL &&
                lastFaviconDataURL !== newDataURL
              ) {
                favicon.href = newDataURL;
                lastFaviconDataURL = newDataURL;
              }
            }
          };

          // 🌟 OPTIMIZACIÓN HÍBRIDA: requestIdleCallback si está disponible
          if ("requestIdleCallback" in window) {
            (window as any).requestIdleCallback(renderFaviconOperation, {
              timeout: faviconFrameInterval,
            });
          } else {
            renderFaviconOperation();
          }

          lastFaviconUpdate = timestamp;
        } catch (error) {
          console.warn("Error al renderizar favicon:", error);
        }
      }

      // 🔄 PROGRAMAR PRÓXIMO FRAME SOLO SI HAY FAVICON ACTIVO
      if (isActiveRef.current && globalIsActive && !document.hidden) {
        globalAnimationId = requestAnimationFrame(faviconAnimationLoop);
      } else {
        if (globalAnimationId) {
          cancelAnimationFrame(globalAnimationId);
          globalAnimationId = null;
        }
        globalIsActive = false;
        isActiveRef.current = false;
        console.log("🛑 FaviconLoop detenido: condiciones no cumplidas");
      }
    };

    // 👁️ MANEJO ESTRICTO DE VISIBILIDAD DE PÁGINA
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // 🛑 PARADA INMEDIATA cuando la pestaña no es visible
        isActiveRef.current = false;
        globalIsActive = false;
        if (globalAnimationId) {
          cancelAnimationFrame(globalAnimationId);
          globalAnimationId = null;
        }
        console.log("🔲 Animaciones pausadas: pestaña oculta");
      } else {
        // ▶️ REACTIVACIÓN CONTROLADA cuando la pestaña vuelve a ser visible
        if (!globalIsActive) {
          globalIsActive = true;
          isActiveRef.current = true;
          console.log("▶️ Animaciones reanudadas: pestaña visible");
          globalAnimationId = requestAnimationFrame(faviconAnimationLoop);
        }
      }
    };

    // 🚀 INICIALIZACIÓN DE EVENT LISTENERS
    document.addEventListener("visibilitychange", handleVisibilityChange, {
      passive: true,
    });

    // ▶️ INICIALIZACIÓN CONTROLADA DE ANIMACIÓN
    if (!document.hidden && !globalAnimationId) {
      console.log("🚀 Iniciando sistema de animaciones optimizado");
      globalAnimationId = requestAnimationFrame(faviconAnimationLoop);
    }

    // 🧹 FUNCIÓN DE LIMPIEZA EXHAUSTIVA
    return () => {
      console.log("🧹 Ejecutando limpieza completa de animaciones");

      // 🛑 PARADA INMEDIATA Y COMPLETA
      isActiveRef.current = false;
      globalIsActive = false;

      // 🔥 CANCELACIÓN AGRESIVA DE ANIMACIONES
      if (globalAnimationId) {
        cancelAnimationFrame(globalAnimationId);
        globalAnimationId = null;
        console.log("✅ requestAnimationFrame cancelado exitosamente");
      }

      // 🧹 LIMPIEZA DE EVENT LISTENERS
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      console.log("✅ Event listeners removidos");

      // 🧹 LIMPIEZA DEL TÍTULO SEPARADO
      if (titleInterval) {
        clearInterval(titleInterval);
        titleInterval = null;
        console.log("✅ Título interval limpiado");
      }

      // 🔄 RESTAURACIÓN DEL TÍTULO
      if (enableTitle) {
        document.title = TITLE_CONFIG.DEFAULT_TITLE;
        console.log("✅ Título restaurado a estado por defecto");
      }

      console.log("🎯 Limpieza de animaciones completada exitosamente");
    };
  }, [
    faviconSize,
    faviconRotationDuration,
    titleScrollingParts,
    enableFavicon,
    enableTitle,
  ]);

  return {
    isActive: isActiveRef.current,
  };
};
