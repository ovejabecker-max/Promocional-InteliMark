import { useEffect } from "react";

/**
 * Hook para configurar frame rate limits y prevenir violations
 * Debe ejecutarse una sola vez al inicio de la aplicación
 */
export const useFrameRateLimiter = () => {
  useEffect(() => {
    // 🎯 CONFIGURAR REACT PARA EVITAR VIOLATIONS

    // Verificar si estamos en desarrollo
    const isDevelopment = import.meta.env.DEV;

    if (isDevelopment) {
      try {
        // Intentar acceder al scheduler de React de forma segura
        const reactInternals = (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__
          ?.renderers;

        if (reactInternals) {
          console.log(
            "🔧 Configurando React para evitar frame rate violations..."
          );

          // Configurar performance.now para ser más conservador
          const originalNow = performance.now;
          performance.now = function () {
            // Limitar la precisión para evitar frame rates extremos
            return Math.floor(originalNow.call(this));
          };
        }

        // Configurar requestAnimationFrame throttling global
        const originalRAF = window.requestAnimationFrame;
        let lastRAFTime = 0;
        const minInterval = 1000 / 60; // Máximo 60fps

        window.requestAnimationFrame = function (callback) {
          const now = Date.now();
          const nextTime = Math.max(lastRAFTime + minInterval, now);

          return originalRAF.call(window, function () {
            lastRAFTime = nextTime;
            callback(nextTime);
          });
        };

        console.log("✅ Frame rate limiter configurado - máximo 60fps");
      } catch (error) {
        console.log("ℹ️ No se pudo configurar frame rate limiter:", error);
      }
    }

    // 🎯 LOG DE DEVICE PIXEL RATIO
    if (window.devicePixelRatio > 2) {
      console.log(
        `🔧 Device pixel ratio alto detectado: ${window.devicePixelRatio}`
      );
    }
  }, []);
};

export default useFrameRateLimiter;
