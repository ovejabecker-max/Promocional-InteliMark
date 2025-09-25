// src/utils/responsive.ts

import { useState, useEffect } from "react";

/**
 * 📱 UTILIDADES RESPONSIVE PARA HOMEPAGE
 * Proporciona configuraciones adaptativas manteniendo la experiencia desktop intacta
 */

export interface DeviceConfig {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  pixelRatio: number;
  mouseTrail: {
    maxPoints: number;
    updateInterval: number;
  };
  canvas: {
    minWidth: number;
    minHeight: number;
  };
  textScale: number;
}

export interface ResponsiveBreakpoints {
  mobile: number;
  tablet: number;
  desktop: number;
}

const BREAKPOINTS: ResponsiveBreakpoints = {
  mobile: 480,
  tablet: 768,
  desktop: 1025,
} as const;

/**
 * Detecta el tipo de dispositivo basado en el ancho de pantalla y características del dispositivo
 */
export const detectDeviceType = (): Pick<
  DeviceConfig,
  "isMobile" | "isTablet" | "isDesktop"
> => {
  const width = window.innerWidth;
  const isTouchDevice =
    "ontouchstart" in window || navigator.maxTouchPoints > 0;

  // Detección específica de móviles
  const isMobile =
    width <= BREAKPOINTS.mobile ||
    (isTouchDevice && width <= BREAKPOINTS.tablet);

  // Detección de tablets
  const isTablet = !isMobile && width <= BREAKPOINTS.desktop && isTouchDevice;

  // Desktop por defecto
  const isDesktop = !isMobile && !isTablet;

  return {
    isMobile,
    isTablet,
    isDesktop,
  };
};

/**
 * Obtiene la configuración responsive basada en CSS variables y detección de dispositivo
 * Mantiene los valores desktop como base y los adapta proporcionalmente
 */
export const getResponsiveConfig = (): DeviceConfig => {
  const deviceType = detectDeviceType();
  const width = window.innerWidth;

  // Obtener valores de CSS variables (con fallbacks desktop)
  const getCustomProperty = (property: string, fallback: string): string => {
    if (typeof document !== "undefined") {
      return (
        getComputedStyle(document.documentElement)
          .getPropertyValue(property)
          .trim() || fallback
      );
    }
    return fallback;
  };

  // Valores base desktop (preservados)
  const desktopConfig = {
    pixelRatio: 1,
    mouseTrail: { maxPoints: 45, updateInterval: 12 },
    canvas: { minWidth: 1200, minHeight: 800 },
    textScale: 1,
  };

  // Configuración responsive basada en breakpoints
  if (deviceType.isMobile) {
    return {
      ...deviceType,
      pixelRatio: Math.min(window.devicePixelRatio || 2, 2), // Máximo 2x para rendimiento
      mouseTrail: {
        maxPoints: parseInt(getCustomProperty("--mouse-trail-points", "15")),
        updateInterval: parseInt(
          getCustomProperty("--mouse-trail-interval", "25")
        ),
      },
      canvas: {
        minWidth: Math.max(width, 320), // Mínimo móvil
        minHeight: Math.max(window.innerHeight, 480),
      },
      textScale: parseFloat(getCustomProperty("--text-scale-factor", "0.65")),
    };
  }

  if (deviceType.isTablet) {
    return {
      ...deviceType,
      pixelRatio: Math.min(window.devicePixelRatio || 1.5, 2),
      mouseTrail: {
        maxPoints: parseInt(getCustomProperty("--mouse-trail-points", "25")),
        updateInterval: parseInt(
          getCustomProperty("--mouse-trail-interval", "20")
        ),
      },
      canvas: {
        minWidth: Math.max(width, 768),
        minHeight: Math.max(window.innerHeight, 600),
      },
      textScale: parseFloat(getCustomProperty("--text-scale-factor", "0.8")),
    };
  }

  // Desktop - mantener configuración original intacta
  return {
    ...deviceType,
    ...desktopConfig,
  };
};

/**
 * Hook personalizado para obtener configuración responsive con actualizaciones en resize
 */
export const useResponsiveConfig = (): DeviceConfig => {
  const [config, setConfig] = useState<DeviceConfig>(getResponsiveConfig);

  useEffect(() => {
    const handleResize = () => {
      // Debounce para evitar demasiadas actualizaciones
      const newConfig = getResponsiveConfig();
      setConfig((prevConfig: DeviceConfig) => {
        // Solo actualizar si hay cambios significativos
        if (
          prevConfig.isMobile !== newConfig.isMobile ||
          prevConfig.isTablet !== newConfig.isTablet ||
          prevConfig.isDesktop !== newConfig.isDesktop
        ) {
          return newConfig;
        }
        return prevConfig;
      });
    };

    let timeoutId: number;
    const debouncedResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleResize, 150) as unknown as number;
    };

    window.addEventListener("resize", debouncedResize);

    return () => {
      window.removeEventListener("resize", debouncedResize);
      clearTimeout(timeoutId);
    };
  }, []);

  return config;
};
