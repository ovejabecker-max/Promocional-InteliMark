import { useEffect, useRef } from "react";

// ⚠️ DEPRECADO: Este hook ha sido reemplazado por useUnifiedBrowserAnimations
// para mejor performance y consolidación de requestAnimationFrame loops.
// Se mantiene por compatibilidad pero se recomienda migrar.

interface FaviconAnimationConfig {
  faviconSize?: number;
  rotationAnimationDuration?: number;
}

// Singleton: Asegurar una sola instancia de animación
let globalAnimationId: number | null = null;
let globalIsActive = false;

export const useFaviconAnimation = (config: FaviconAnimationConfig = {}) => {
  const { faviconSize = 32, rotationAnimationDuration = 3000 } = config;
  const isActiveRef = useRef<boolean>(false);

  useEffect(() => {
    // ⚠️ ADVERTENCIA DE DEPRECACIÓN
    console.warn(
      "useFaviconAnimation está deprecado. Use useUnifiedBrowserAnimations para mejor performance."
    );

    // Prevenir múltiples instancias
    if (globalIsActive) {
      return;
    }

    globalIsActive = true;
    isActiveRef.current = true;

    // Crear elementos canvas y imagen
    const faviconCanvas = document.createElement("canvas");
    faviconCanvas.width = faviconSize;
    faviconCanvas.height = faviconSize;
    const ctx = faviconCanvas.getContext("2d");

    if (!ctx) {
      console.error("No se pudo crear contexto canvas para favicon");
      globalIsActive = false;
      return;
    }

    const faviconImg = new Image();
    faviconImg.src = "/favicon.ico"; // 🎯 RUTA CORREGIDA PARA PRODUCCIÓN

    // Obtener o crear favicon link
    let favicon = document.querySelector(
      "link[rel~='icon']"
    ) as HTMLLinkElement;
    if (!favicon) {
      favicon = document.createElement("link");
      favicon.rel = "icon";
      document.head.appendChild(favicon);
    }

    // Variables de control de rendimiento
    let lastRenderTime = 0;
    const TARGET_FPS = 15; // 15fps para mejor performance
    const frameInterval = 1000 / TARGET_FPS;
    let startTime: number | null = null;
    let isImageLoaded = false;
    let lastDataURL = ""; // Cache: Evitar comparaciones costosas

    // Función de renderizado optimizada
    const renderFavicon = (timestamp: number) => {
      // Verificar si debe continuar
      if (!isActiveRef.current || !globalIsActive || document.hidden) {
        return;
      }

      // Throttling estricto: Mayor intervalo entre frames
      if (timestamp - lastRenderTime < frameInterval) {
        globalAnimationId = requestAnimationFrame(renderFavicon);
        return;
      }

      // Verificar si la imagen está cargada
      if (!isImageLoaded || !faviconImg.complete) {
        globalAnimationId = requestAnimationFrame(renderFavicon);
        return;
      }

      // Inicializar tiempo de inicio
      if (!startTime) startTime = timestamp;
      lastRenderTime = timestamp;

      // Calcular progreso de animación
      const elapsedTime = timestamp - startTime;
      const rotationProgress =
        (elapsedTime % rotationAnimationDuration) / rotationAnimationDuration;
      const currentAngle = rotationProgress * Math.PI * 2;

      try {
        // Optimización: Usar requestIdleCallback si está disponible
        const renderOperation = () => {
          // Renderizar favicon animado
          ctx.clearRect(0, 0, faviconSize, faviconSize);
          ctx.save();
          ctx.translate(faviconSize / 2, faviconSize / 2);

          // Giro 3D sobre eje Y
          const scaleX = Math.cos(currentAngle);
          ctx.scale(scaleX, 1);

          // Dibujar imagen
          ctx.drawImage(
            faviconImg,
            -faviconSize / 2,
            -faviconSize / 2,
            faviconSize,
            faviconSize
          );

          ctx.restore();

          // Optimización: Solo actualizar cada 3 frames para reducir overhead
          if (Math.floor(elapsedTime / frameInterval) % 3 === 0) {
            const newDataURL = faviconCanvas.toDataURL("image/png");
            if (favicon.href !== newDataURL && lastDataURL !== newDataURL) {
              favicon.href = newDataURL;
              lastDataURL = newDataURL;
            }
          }
        };

        // Usar requestIdleCallback si está disponible, sino ejecutar inmediatamente
        if ("requestIdleCallback" in window) {
          requestIdleCallback(renderOperation, { timeout: frameInterval });
        } else {
          renderOperation();
        }
      } catch (error) {
        console.error("Error al renderizar favicon:", error);
      }

      // Continuar animación
      if (isActiveRef.current && globalIsActive) {
        globalAnimationId = requestAnimationFrame(renderFavicon);
      }
    };

    // Manejo de visibilidad y pausa de página
    const handleVisibilityChange = () => {
      if (document.hidden && globalAnimationId) {
        cancelAnimationFrame(globalAnimationId);
        globalAnimationId = null;
      } else if (!document.hidden && isActiveRef.current && globalIsActive) {
        globalAnimationId = requestAnimationFrame(renderFavicon);
      }
    };

    // Pausar animación durante interacciones importantes
    const handleUserInteraction = () => {
      if (globalAnimationId) {
        cancelAnimationFrame(globalAnimationId);
        globalAnimationId = null;

        // Reanudar después de un breve delay
        setTimeout(() => {
          if (isActiveRef.current && globalIsActive && !document.hidden) {
            globalAnimationId = requestAnimationFrame(renderFavicon);
          }
        }, 100);
      }
    };

    // Inicializar cuando la imagen se carga
    faviconImg.onload = () => {
      isImageLoaded = true;

      // Agregar listeners de visibilidad y interacción
      document.addEventListener("visibilitychange", handleVisibilityChange, {
        passive: true,
      });

      // Pausar durante clicks importantes
      document.addEventListener("click", handleUserInteraction, {
        passive: true,
      });

      // Iniciar animación
      if (!globalAnimationId) {
        globalAnimationId = requestAnimationFrame(renderFavicon);
      }
    };

    faviconImg.onerror = () => {
      console.error("Error al cargar favicon image");
      globalIsActive = false;
      isActiveRef.current = false;
    };

    // Cleanup function
    return () => {
      isActiveRef.current = false;
      globalIsActive = false;

      if (globalAnimationId) {
        cancelAnimationFrame(globalAnimationId);
        globalAnimationId = null;
      }

      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("click", handleUserInteraction);
    };
  }, [faviconSize, rotationAnimationDuration]);

  return {
    isActive: isActiveRef.current,
  };
};
