import React, {
  createContext,
  useContext,
  useCallback,
  useRef,
  useEffect,
  useState,
} from "react";

// 🎯 CONFIGURACIÓN OPTIMIZADA
const ANIMATION_CONFIG = {
  TITLE_UPDATE_INTERVAL: 600,
  FAVICON_ROTATION_DURATION: 3000,
  FAVICON_FRAME_COUNT: 60, // 60 frames pre-renderizados para rotación suave
  FAVICON_SIZE: 32,
} as const;

const TITLE_CONFIG = {
  STATIC_PART: "InteliMark || ",
  SEPARATOR: "   ",
  VISIBLE_WIDTH: 35,
  DEFAULT_TITLE: "InteliMark",
  SCROLLING_PARTS: ["Sitio en construcción... |", "Vuelve pronto. |"],
} as const;

interface AnimationContextType {
  isActive: boolean;
  startAnimations: () => void;
  stopAnimations: () => void;
}

const AnimationContext = createContext<AnimationContextType | null>(null);

// 🔍 DETECTAR DISPOSITIVOS MÓVILES
const isMobileDevice = (): boolean => {
  return (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    ) || (navigator.maxTouchPoints ? navigator.maxTouchPoints > 1 : false)
  );
};

export const AnimationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isActive, setIsActive] = useState(false);
  const [isMobile] = useState(isMobileDevice());

  // 🎯 REFS PARA GESTIÓN DE RECURSOS
  const titleIntervalRef = useRef<number | null>(null);
  const faviconIntervalRef = useRef<number | null>(null);
  const preRenderedFramesRef = useRef<string[]>([]);
  const currentFrameIndexRef = useRef(0);
  const titleFramesRef = useRef<string[]>([]);
  const currentTitleIndexRef = useRef(0);
  const cleanupFunctionsRef = useRef<(() => void)[]>([]);

  // 🎨 PRE-RENDERIZAR FAVICON FRAMES (UNA SOLA VEZ)
  const preRenderFaviconFrames = useCallback(() => {
    if (isMobile || preRenderedFramesRef.current.length > 0) {
      return; // No renderizar en móviles o si ya están renderizados
    }

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = ANIMATION_CONFIG.FAVICON_SIZE;
    canvas.height = ANIMATION_CONFIG.FAVICON_SIZE;

    const img = new Image();

    img.onload = () => {
      const frames: string[] = [];

      console.log("🎨 Pre-renderizando frames del favicon...");

      for (let i = 0; i < ANIMATION_CONFIG.FAVICON_FRAME_COUNT; i++) {
        const progress = i / ANIMATION_CONFIG.FAVICON_FRAME_COUNT;
        const angle = progress * Math.PI * 2;

        // Limpiar canvas
        ctx.clearRect(
          0,
          0,
          ANIMATION_CONFIG.FAVICON_SIZE,
          ANIMATION_CONFIG.FAVICON_SIZE
        );

        // Transformaciones para efecto 3D
        ctx.save();
        ctx.translate(
          ANIMATION_CONFIG.FAVICON_SIZE / 2,
          ANIMATION_CONFIG.FAVICON_SIZE / 2
        );

        // Efecto 3D: escalado en X
        const scaleX = Math.cos(angle);
        ctx.scale(scaleX, 1);

        // Dibujar imagen
        ctx.drawImage(
          img,
          -ANIMATION_CONFIG.FAVICON_SIZE / 2,
          -ANIMATION_CONFIG.FAVICON_SIZE / 2,
          ANIMATION_CONFIG.FAVICON_SIZE,
          ANIMATION_CONFIG.FAVICON_SIZE
        );

        ctx.restore();

        // Convertir a DataURL (SOLO UNA VEZ POR FRAME)
        frames.push(canvas.toDataURL("image/png"));
      }

      preRenderedFramesRef.current = frames;
      console.log(`✅ ${frames.length} frames del favicon pre-renderizados`);
    };

    img.onerror = () => {
      console.warn("⚠️ Error al cargar favicon, intentando fallback...");
      img.src = "/favicon.ico";
    };

    img.src = "/favicon.png";
  }, [isMobile]);

  // 📝 PRE-CALCULAR FRAMES DEL TÍTULO
  const preCalculateTitleFrames = useCallback(() => {
    const scrollContent =
      TITLE_CONFIG.SCROLLING_PARTS.join(TITLE_CONFIG.SEPARATOR) +
      TITLE_CONFIG.SEPARATOR;
    const frames: string[] = [];

    for (let i = 0; i < scrollContent.length; i++) {
      const rotated =
        scrollContent.substring(i) + scrollContent.substring(0, i);
      frames.push(
        TITLE_CONFIG.STATIC_PART +
          rotated.substring(0, TITLE_CONFIG.VISIBLE_WIDTH)
      );
    }

    titleFramesRef.current = frames;
    console.log(`✅ ${frames.length} frames del título pre-calculados`);
  }, []);

  // 🚀 INICIAR ANIMACIONES
  const startAnimations = useCallback(() => {
    if (isActive) return; // Ya están activas

    console.log("🚀 Iniciando animaciones de pestaña...");
    setIsActive(true);

    // 📝 ANIMACIÓN DEL TÍTULO (siempre activa)
    preCalculateTitleFrames();

    if (titleFramesRef.current.length > 0) {
      titleIntervalRef.current = setInterval(() => {
        if (!document.hidden) {
          document.title = titleFramesRef.current[currentTitleIndexRef.current];
          currentTitleIndexRef.current =
            (currentTitleIndexRef.current + 1) % titleFramesRef.current.length;
        }
      }, ANIMATION_CONFIG.TITLE_UPDATE_INTERVAL);

      cleanupFunctionsRef.current.push(() => {
        if (titleIntervalRef.current) {
          clearInterval(titleIntervalRef.current);
          titleIntervalRef.current = null;
        }
      });
    }

    // 🎨 ANIMACIÓN DEL FAVICON (solo en desktop)
    if (!isMobile) {
      preRenderFaviconFrames();

      // Esperar a que se pre-rendericen los frames
      const startFaviconAnimation = () => {
        if (preRenderedFramesRef.current.length === 0) {
          setTimeout(startFaviconAnimation, 100);
          return;
        }

        const favicon = document.querySelector(
          'link[rel~="icon"]'
        ) as HTMLLinkElement;
        if (!favicon) {
          const newFavicon = document.createElement("link");
          newFavicon.rel = "icon";
          document.head.appendChild(newFavicon);
        }

        faviconIntervalRef.current = setInterval(() => {
          if (!document.hidden && preRenderedFramesRef.current.length > 0) {
            const faviconElement = document.querySelector(
              'link[rel~="icon"]'
            ) as HTMLLinkElement;
            if (faviconElement) {
              faviconElement.href =
                preRenderedFramesRef.current[currentFrameIndexRef.current];
              currentFrameIndexRef.current =
                (currentFrameIndexRef.current + 1) %
                preRenderedFramesRef.current.length;
            }
          }
        }, ANIMATION_CONFIG.FAVICON_ROTATION_DURATION / ANIMATION_CONFIG.FAVICON_FRAME_COUNT); // ~50ms por frame = 20fps SEGURO

        cleanupFunctionsRef.current.push(() => {
          if (faviconIntervalRef.current) {
            clearInterval(faviconIntervalRef.current);
            faviconIntervalRef.current = null;
          }
        });
      };

      startFaviconAnimation();
    }
  }, [isActive, isMobile, preRenderFaviconFrames, preCalculateTitleFrames]);

  // 🛑 DETENER ANIMACIONES
  const stopAnimations = useCallback(() => {
    if (!isActive) return;

    console.log("🛑 Deteniendo animaciones de pestaña...");
    setIsActive(false);

    // Ejecutar todas las funciones de limpieza
    cleanupFunctionsRef.current.forEach((cleanup) => cleanup());
    cleanupFunctionsRef.current = [];

    // Restaurar título por defecto
    document.title = TITLE_CONFIG.DEFAULT_TITLE;

    // Reset índices
    currentFrameIndexRef.current = 0;
    currentTitleIndexRef.current = 0;

    console.log("✅ Animaciones detenidas y recursos limpiados");
  }, [isActive]);

  // 👁️ MANEJO DE VISIBILIDAD DE PÁGINA
  useEffect(() => {
    const handleVisibilityChange = () => {
      // Las animaciones se pausan automáticamente con document.hidden checks
      // No necesitamos detenerlas completamente
      if (document.hidden) {
        console.log("🔲 Pestaña oculta - animaciones pausadas automáticamente");
      } else {
        console.log(
          "👁️ Pestaña visible - animaciones reanudadas automáticamente"
        );
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange, {
      passive: true,
    });

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // 🧹 CLEANUP GLOBAL AL DESMONTAR PROVIDER
  useEffect(() => {
    return () => {
      stopAnimations();
    };
  }, [stopAnimations]);

  const contextValue = {
    isActive,
    startAnimations,
    stopAnimations,
  };

  return (
    <AnimationContext.Provider value={contextValue}>
      {children}
    </AnimationContext.Provider>
  );
};

// 🎯 HOOK PERSONALIZADO PARA USO FÁCIL
export const useTabAnimations = () => {
  const context = useContext(AnimationContext);
  if (!context) {
    throw new Error("useTabAnimations debe usarse dentro de AnimationProvider");
  }
  return context;
};

export default AnimationContext;
