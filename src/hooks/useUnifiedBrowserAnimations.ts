import { useEffect, useRef } from "react";

// 🎯 CONFIGURACIÓN OPTIMIZADA PARA PERFORMANCE
const ANIMATION_CONFIG = {
  // Performance balanceada: 30fps para título, 15fps para favicon
  TARGET_FPS: 30,
  FAVICON_TARGET_FPS: 15, // ⚡ Optimizado específicamente para favicon
  // Título: actualización cada 400ms para mejor legibilidad
  TITLE_UPDATE_INTERVAL: 400,
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

// 🌟 SISTEMA SINGLETON GLOBAL PARA EVITAR MÚLTIPLES INSTANCIAS
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

  // 🔍 HELPER: Detectar si elemento está en viewport (para pausar favicon cuando Robot3D visible)
  const isElementInViewport = (element: HTMLElement): boolean => {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <=
        (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  };

  useEffect(() => {
    // 🛡️ SINGLETON: Prevenir múltiples instancias activas
    if (globalIsActive) {
      return;
    }

    globalIsActive = true;
    isActiveRef.current = true;

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
        faviconImg.src = "/src/assets/favicon_intelimark.png";
        faviconImg.onload = () => {
          isImageLoaded = true;
        };
        faviconImg.onerror = () => {
          console.warn("Error al cargar favicon image");
        };
      }
    }

    // 📝 CONFIGURACIÓN DEL TÍTULO
    let titleFrames: string[] = [];
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
    }

    // ⚡ VARIABLES DE CONTROL DE PERFORMANCE
    const frameInterval = 1000 / ANIMATION_CONFIG.TARGET_FPS;
    const faviconFrameInterval = 1000 / ANIMATION_CONFIG.FAVICON_TARGET_FPS; // ⚡ Intervalo específico favicon
    let lastFrameTime = 0;
    let lastTitleUpdate = 0;
    let lastFaviconUpdate = 0; // ⚡ Control separado para favicon
    let startTime: number | null = null;
    let currentTitleIndex = 0;
    let lastFaviconDataURL = "";
    let faviconFrameCount = 0; // ⚡ Contador para throttling escalonado

    // 🎬 BUCLE PRINCIPAL UNIFICADO DE ANIMACIÓN
    const unifiedAnimationLoop = (timestamp: number) => {
      // 🛑 VERIFICAR SI DEBE CONTINUAR - Si no, cancelar y salir completamente
      if (!isActiveRef.current || !globalIsActive) {
        if (globalAnimationId) {
          cancelAnimationFrame(globalAnimationId);
          globalAnimationId = null;
        }
        return; // Salir sin programar próximo frame
      }

      // 🚀 THROTTLING GLOBAL: Controlar FPS general
      if (timestamp - lastFrameTime < frameInterval) {
        // Solo programar próximo frame si aún está activo
        if (isActiveRef.current && globalIsActive) {
          globalAnimationId = requestAnimationFrame(unifiedAnimationLoop);
        }
        return;
      }

      // Inicializar tiempo de inicio
      if (!startTime) startTime = timestamp;

      // 📝 ACTUALIZACIÓN DEL TÍTULO (cada TITLE_UPDATE_INTERVAL)
      if (
        enableTitle &&
        titleFrames.length > 0 &&
        timestamp - lastTitleUpdate > ANIMATION_CONFIG.TITLE_UPDATE_INTERVAL
      ) {
        const currentFrame = titleFrames[currentTitleIndex];
        if (currentFrame && document.title !== currentFrame) {
          document.title = currentFrame;
        }
        currentTitleIndex = (currentTitleIndex + 1) % titleFrames.length;
        lastTitleUpdate = timestamp;
      }

      // 🎨 ACTUALIZACIÓN DEL FAVICON (optimizada con throttling escalonado)
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

          // 🎯 DETECCIÓN INTELIGENTE: Pausar favicon si Robot3D está activo en viewport
          const robot3DContainer = document.querySelector(
            ".robot-3d-container"
          );
          const isRobot3DVisible = robot3DContainer
            ? isElementInViewport(robot3DContainer as HTMLElement)
            : false;

          if (isRobot3DVisible) {
            // Pausar favicon cuando Robot3D está visible para reducir overhead
            // No hacer return aquí, continuar con el bucle pero saltarse el favicon
          } else {
            // 🚀 RENDERIZADO OPTIMIZADO CON requestIdleCallback (solo si Robot3D no visible)
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
          }

          lastFaviconUpdate = timestamp;
        } catch (error) {
          console.warn("Error al renderizar favicon:", error);
        }
      }

      lastFrameTime = timestamp;

      // 🔄 PROGRAMAR PRÓXIMO FRAME SOLO SI ESTÁ ACTIVO
      if (isActiveRef.current && globalIsActive) {
        globalAnimationId = requestAnimationFrame(unifiedAnimationLoop);
      } else {
        // 🛑 ASEGURAR CANCELACIÓN SI CONDICIONES CAMBIARON
        if (globalAnimationId) {
          cancelAnimationFrame(globalAnimationId);
          globalAnimationId = null;
        }
      }
    };

    // 👁️ MANEJO DE VISIBILIDAD DE PÁGINA
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Pausar animaciones cuando la pestaña no es visible
        if (globalAnimationId) {
          cancelAnimationFrame(globalAnimationId);
          globalAnimationId = null;
        }
      } else {
        // Reanudar animaciones cuando la pestaña vuelve a ser visible
        if (isActiveRef.current && globalIsActive && !globalAnimationId) {
          globalAnimationId = requestAnimationFrame(unifiedAnimationLoop);
        }
      }
    };

    // 🎯 PAUSAR DURANTE INTERACCIONES CRÍTICAS
    const handleUserInteraction = () => {
      if (globalAnimationId) {
        cancelAnimationFrame(globalAnimationId);
        globalAnimationId = null;

        // Reanudar después de breve pausa
        setTimeout(() => {
          if (isActiveRef.current && globalIsActive && !document.hidden) {
            globalAnimationId = requestAnimationFrame(unifiedAnimationLoop);
          }
        }, 100);
      }
    };

    // 🚀 INICIALIZACIÓN DE EVENT LISTENERS
    document.addEventListener("visibilitychange", handleVisibilityChange, {
      passive: true,
    });

    // Pausar durante clicks importantes para mejor UX
    document.addEventListener("click", handleUserInteraction, {
      passive: true,
    });

    // ▶️ INICIAR ANIMACIÓN PRINCIPAL
    if (!document.hidden) {
      globalAnimationId = requestAnimationFrame(unifiedAnimationLoop);
    }

    // 🧹 FUNCIÓN DE LIMPIEZA
    return () => {
      isActiveRef.current = false;
      globalIsActive = false;

      // Cancelar animaciones
      if (globalAnimationId) {
        cancelAnimationFrame(globalAnimationId);
        globalAnimationId = null;
      }

      // Limpiar event listeners
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("click", handleUserInteraction);

      // Restaurar título por defecto
      if (enableTitle) {
        document.title = TITLE_CONFIG.DEFAULT_TITLE;
      }
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
