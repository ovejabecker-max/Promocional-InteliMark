import { useEffect, useRef } from "react";

// Constantes de configuración optimizadas
const STATIC_PART = "InteliMark || ";
const SEPARATOR = "   ";
const VISIBLE_WIDTH = 35;
const UPDATE_INTERVAL = 250; // Reducido para animación más fluida
const TARGET_FPS = 60; // Aumentado para mejor suavidad
const FRAME_INTERVAL = 1000 / TARGET_FPS;
const DEFAULT_TITLE = "InteliMark";

/** Configuración para la animación del título */
interface TitleAnimationConfig {
  /** Partes del texto que se desplazarán. Por defecto incluye mensaje de construcción y "Vuelve pronto." */
  scrollingParts?: string[];
}

export const useTitleAnimation = (config: TitleAnimationConfig = {}) => {
  const {
    scrollingParts = ["Sitio en construcción... |", "Vuelve pronto. |"],
  } = config;

  const animationFrameRef = useRef<number>(0);
  const isActiveRef = useRef<boolean>(false);

  useEffect(() => {
    // Establecer título inicial inmediatamente
    document.title = STATIC_PART.slice(0, -3); // "InteliMark"

    // Generar frames de animación optimizado
    const scrollContent = scrollingParts.join(SEPARATOR) + SEPARATOR;
    const contentLength = scrollContent.length;
    const titleFrames: string[] = [];

    // Pre-calcular el prefijo una vez
    const prefix = STATIC_PART;

    // Algoritmo optimizado de rotación con menos operaciones de string
    for (let i = 0; i < contentLength; i++) {
      const rotated =
        scrollContent.substring(i) + scrollContent.substring(0, i);
      titleFrames.push(prefix + rotated.substring(0, VISIBLE_WIDTH));
    }

    let lastUpdate = 0;
    let lastFrameTime = 0;
    let currentIndex = 0;
    const totalFrames = titleFrames.length;

    const titleAnimationLoop = (timestamp: number) => {
      // Throttling de performance optimizado
      if (timestamp - lastFrameTime < FRAME_INTERVAL) {
        if (isActiveRef.current) {
          animationFrameRef.current = requestAnimationFrame(titleAnimationLoop);
        }
        return;
      }

      if (timestamp - lastUpdate > UPDATE_INTERVAL) {
        lastUpdate = timestamp;
        lastFrameTime = timestamp;

        const currentFrame = titleFrames[currentIndex];
        if (currentFrame && document.title !== currentFrame) {
          document.title = currentFrame;
        }
        currentIndex = (currentIndex + 1) % totalFrames;
      }

      if (isActiveRef.current) {
        animationFrameRef.current = requestAnimationFrame(titleAnimationLoop);
      }
    };

    const handleVisibilityChange = () => {
      const isHidden = document.hidden;

      if (isHidden) {
        isActiveRef.current = false;
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = 0;
        }
      } else {
        isActiveRef.current = true;
        animationFrameRef.current = requestAnimationFrame(titleAnimationLoop);
      }
    };

    // Inicialización optimizada
    document.addEventListener("visibilitychange", handleVisibilityChange, {
      passive: true,
    });
    isActiveRef.current = true;
    animationFrameRef.current = requestAnimationFrame(titleAnimationLoop);

    // Cleanup optimizado
    return () => {
      isActiveRef.current = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = 0;
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.title = DEFAULT_TITLE;
    };
  }, [scrollingParts]); // Solo scrollingParts puede cambiar
};
