// Archivo: src/pages/HomePage.tsx (Versión Final y Definitiva)

import {
  Suspense,
  useRef,
  useLayoutEffect,
  useState,
  useCallback,
  useEffect,
  useMemo,
  memo,
} from "react";
import type { FC } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useTexture, PerspectiveCamera, Text } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useNavigate } from "react-router-dom";
import LogoWithGlitchEffect from "../components/LogoWithGlitchEffect";
import AnimatedTextPhrase1 from "../components/AnimatedTextPhrase1";
import AudioVisualizer from "../components/AudioVisualizer";
import "./HomePage.css";

// Configuración de audio
const AUDIO_CONFIG = {
  AMBIENT_VOLUME: 0.15,
  TRANSITION_VOLUME: 0.4,
  TRANSITION_DURATION: 3500,
  AMBIENT_PATH: "/ambient_sound_HomePage.mp3",
  TRANSITION_PATH: "/transition.mp3",
} as const;

const SCROLL_CONFIG = {
  PORTAL_TRIGGER_PERCENTAGE: 70,
  GLITCH_TRIGGER_PERCENTAGE: 68,
  GLITCH_DURATION: 600,
  TEXT_VISIBILITY_THRESHOLD: 70,
  SETUP_RETRY_DELAY: 300,
  MOUSE_IDLE_TIMEOUT: 300,
} as const;

const ANIMATION_CONFIG = {
  CAMERA_TARGET_Z: -50,
  CAMERA_TUNNEL_Z: -300,
  LOGO_TARGET_Z: 50,
  TEXT_LINE1_Z: 50,
  TEXT_LINE2_Z: 40,
  TEXT_LINE3_Z: 35,
  TEXT2_LINE1_Z: 20,
  TEXT2_LINE2_Z: 15,
} as const;

const TRAIL_CONFIG = {
  COLOR_RGB: "218, 128, 35", // Color base del trail
  LINE_WIDTH: 3,
  SHADOW_BLUR: 10,
  OPACITY_DECAY: 0.85,
  MIN_OPACITY: 0.05,
} as const;

const ROUTES = {
  REBECCA: "/rebecca",
} as const;

gsap.registerPlugin(ScrollTrigger);

const LandscapeScene: FC = memo(() => {
  const materialRef = useRef<THREE.ShaderMaterial>(null!);
  const texture = useTexture("https://i.imgur.com/kv7xqKt.png");

  // Optimizar textura una sola vez
  useMemo(() => {
    if (texture) {
      texture.generateMipmaps = false;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.wrapS = THREE.ClampToEdgeWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
    }
  }, [texture]);

  useFrame((_, delta) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value += delta;
    }
  });

  return (
    <mesh rotation-x={-Math.PI / 2} position-y={-5}>
      <planeGeometry args={[100, 100, 30, 30]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={{
          uTime: { value: 0 },
          uTexture: { value: texture },
        }}
        vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform float uTime;
          uniform sampler2D uTexture;
          varying vec2 vUv;

          void main() {
            gl_FragColor = texture2D(uTexture, vUv);
          }
        `}
      />
    </mesh>
  );
});

LandscapeScene.displayName = "LandscapeScene";

const TextPhrase2: FC<{ scrollPercentage: number }> = memo(
  ({ scrollPercentage }) => {
    // Función para calcular opacidad basada en rango de scroll
    const calculateOpacity = useCallback(
      (start: number, end: number): number => {
        if (scrollPercentage < start) return 0;
        if (scrollPercentage > end) return 1;
        return (scrollPercentage - start) / (end - start);
      },
      [scrollPercentage]
    );

    const opacidades = useMemo(() => {
      const line1Opacity = scrollPercentage > 70 ? 1 : calculateOpacity(45, 55);
      const line2Opacity = scrollPercentage > 70 ? 1 : calculateOpacity(55, 60);

      return { line1Opacity, line2Opacity };
    }, [scrollPercentage, calculateOpacity]);

    return (
      <group>
        <Text
          position={[0, 5, -140]}
          fontSize={1.728}
          color="white"
          anchorX="center"
          anchorY="middle"
          material-transparent={true}
          material-opacity={opacidades.line1Opacity}
        >
          NO ES UNA IA GENÉRICA
        </Text>
        <Text
          position={[0, 0, -143]}
          fontSize={1.728}
          color="white"
          anchorX="center"
          anchorY="middle"
          material-transparent={true}
          material-opacity={opacidades.line2Opacity}
        >
          ES UNA IA ENTRENADA PARA LA PRESICIÓN
        </Text>
      </group>
    );
  }
);

TextPhrase2.displayName = "TextPhrase2";

interface HomePageProps {
  scrollContainer?: string;
  isEmbedded?: boolean;
  maxScrollPercentage?: number;
}

const HomePage: FC<HomePageProps> = ({
  scrollContainer,
  isEmbedded = false,
  maxScrollPercentage = 100,
}) => {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null!);
  const sceneRef = useRef<THREE.Group>(null!);
  const mainRef = useRef<HTMLDivElement>(null!);
  const scrollRef = useRef<HTMLDivElement>(null!);
  const canvasRef = useRef<HTMLDivElement>(null!);
  const [scrollPercentage, setScrollPercentage] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isDigitalGlitch, setIsDigitalGlitch] = useState(false);
  const portalTriggeredRef = useRef(false);
  const glitchTriggeredRef = useRef(false);

  const ambientAudioRef = useRef<HTMLAudioElement | null>(null);
  const [hasStartedAmbientSound, setHasStartedAmbientSound] = useState(false);
  const [areSoundsEnabled, setAreSoundsEnabled] = useState(false);

  const transitionAudioRef = useRef<HTMLAudioElement | null>(null);

  const navigate = useNavigate();

  const responsiveConfig = useMemo(() => {
    return {
      webgl: {
        antialias: true,
        precision: "highp" as const,
        powerPreference: "high-performance" as const,
        pixelRatio: Math.min(window.devicePixelRatio, 2),
      },
      animations: {
        duration: 1.2,
        fps: 60,
        scrollThrottleInterval: 1,
      },
      mouseTrail: {
        maxPoints: 35,
        updateInterval: 16,
        particleSize: 12,
      },
    };
  }, []);

  useEffect(() => {
    return () => {
      try {
        if (THREE.Cache) {
          THREE.Cache.clear();
        }

        if (sceneRef.current) {
          sceneRef.current.traverse((child: THREE.Object3D) => {
            if (child instanceof THREE.Mesh) {
              if (child.geometry) child.geometry.dispose();
              if (child.material) {
                if (Array.isArray(child.material)) {
                  child.material.forEach((material) => material.dispose());
                } else {
                  child.material.dispose();
                }
              }
            }
          });
        }

        if ((window as any).gc) {
          (window as any).gc();
        }
      } catch (error) {
        console.debug("Cleanup WebGL context:", error);
      }
    };
  }, []);

  // ✅ NUEVA VERIFICACIÓN: Detectar problemas de scroll en tiempo real
  useEffect(() => {
    if (typeof window === "undefined") return;

    const detectScrollIssues = () => {
      const scrollElement = scrollRef.current;
      if (scrollElement) {
        const hasHeight = scrollElement.offsetHeight > 0;

        // ✅ CORREGIDO: Solo loggear si hay problemas reales
        // Si no hay altura, es un problema real
        if (!hasHeight) {
          console.warn("⚠️ Scroll element has no height:", {
            offsetHeight: scrollElement.offsetHeight,
            scrollHeight: scrollElement.scrollHeight,
            clientHeight: scrollElement.clientHeight,
          });
        }
        // Si hay altura pero scrollHeight es menor que clientHeight, es un problema real
        else if (
          hasHeight &&
          scrollElement.scrollHeight < scrollElement.clientHeight
        ) {
          console.warn("⚠️ Scroll element height inconsistency:", {
            offsetHeight: scrollElement.offsetHeight,
            scrollHeight: scrollElement.scrollHeight,
            clientHeight: scrollElement.clientHeight,
          });
        }
        // ✅ CASO NORMAL: scrollHeight === clientHeight (no hay contenido que desborde)
        // No mostrar warning en este caso
      }
    };

    // ✅ OPTIMIZADO: Verificar solo una vez después de que el componente se estabilice
    // En modo desarrollo, React ejecuta efectos dos veces, así que esto previene spam de logs
    const timeoutId = setTimeout(detectScrollIssues, 500); // Una sola verificación optimizada

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  // 🎵 HELPER FUNCTION: Configuración consolidada de audio con TypeScript y manejo de errores
  const createAudioElement = useCallback(
    (config: {
      src: string;
      volume: number;
      loop?: boolean;
      preload?: "auto" | "metadata" | "none";
      onError?: (error: Error) => void;
    }): HTMLAudioElement => {
      try {
        const audio = new Audio(config.src);

        // Configuración básica
        audio.volume = Math.max(0, Math.min(1, config.volume)); // Clamp entre 0 y 1
        audio.preload = config.preload || "auto";

        // Configuración opcional
        if (config.loop) {
          audio.loop = config.loop;
        }

        // Manejo de errores opcional
        if (config.onError) {
          audio.addEventListener("error", () => {
            config.onError?.(new Error(`Audio load failed: ${config.src}`));
          });
        }

        return audio;
      } catch (error) {
        console.error(`Error creating audio element for ${config.src}:`, error);
        return new Audio();
      }
    },
    []
  );

  useEffect(() => {
    const audio = createAudioElement({
      src: AUDIO_CONFIG.AMBIENT_PATH,
      volume: AUDIO_CONFIG.AMBIENT_VOLUME,
      loop: true,
      preload: "auto",
      onError: (error) => {
        console.warn("Error cargando audio ambiente:", error.message);
      },
    });

    ambientAudioRef.current = audio;

    return () => {
      if (ambientAudioRef.current) {
        ambientAudioRef.current.pause();
        ambientAudioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const transitionAudio = createAudioElement({
      src: AUDIO_CONFIG.TRANSITION_PATH,
      volume: AUDIO_CONFIG.TRANSITION_VOLUME,
      preload: "auto",
      onError: (error) => {
        console.warn("Error cargando audio de transición:", error.message);
      },
    });

    transitionAudioRef.current = transitionAudio;

    return () => {
      if (transitionAudioRef.current) {
        transitionAudioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    return () => {
      if (ambientAudioRef.current && hasStartedAmbientSound) {
        ambientAudioRef.current.pause();
      }

      if (transitionAudioRef.current) {
        transitionAudioRef.current.pause();
      }
    };
  }, [hasStartedAmbientSound]);

  const handleAudioVisualizerToggle = useCallback(async (isActive: boolean) => {
    try {
      if (isActive) {
        setAreSoundsEnabled(true);
        if (ambientAudioRef.current) {
          await ambientAudioRef.current.play();
          setHasStartedAmbientSound(true);
        }
      } else {
        setAreSoundsEnabled(false);

        if (ambientAudioRef.current) {
          ambientAudioRef.current.pause();
        }

        if (transitionAudioRef.current) {
          transitionAudioRef.current.pause();
        }
      }
    } catch (error) {
      console.warn("Error al manejar audio:", error);
    }
  }, []);

  const trailPointsRef = useRef<{ x: number; y: number; opacity: number }[]>(
    []
  );
  const trailCanvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>(0);
  const lastUpdateTimeRef = useRef<number>(0);
  const isMouseActiveRef = useRef<boolean>(false);
  const mouseStoppedTimeoutRef = useRef<number | null>(null);

  const triggerPortalTransition = useCallback(() => {
    const canvas = canvasRef.current;
    const scene = sceneRef.current;
    const camera = cameraRef.current;

    if (!canvas || !scene || !camera) return;

    if (
      transitionAudioRef.current &&
      hasStartedAmbientSound &&
      areSoundsEnabled
    ) {
      transitionAudioRef.current.currentTime = 0;

      const playTransitionSound = async () => {
        try {
          if (areSoundsEnabled) {
            await transitionAudioRef.current?.play();

            setTimeout(() => {
              if (transitionAudioRef.current) {
                transitionAudioRef.current.pause();
              }
            }, AUDIO_CONFIG.TRANSITION_DURATION);
          }
        } catch (error) {
          if (import.meta.env.DEV) {
            console.log("Transition audio skipped");
          }
        }
      };

      playTransitionSound();
    }

    scene.position.set(0, 0, 0);
    camera.lookAt(0, 0, 0);

    const portalTimeline = gsap.timeline({
      ease: "power3.out",
    });

    setTimeout(() => {
      navigate(ROUTES.REBECCA);
    }, 2000);

    portalTimeline
      .to(
        camera.position,
        {
          z: -80,
          duration: 0.3,
          ease: "power2.in",
        },
        0
      )
      .to(
        scene.scale,
        {
          x: 0.1,
          y: 0.1,
          z: 0.1,
          duration: 0.6,
          ease: "power2.in",
        },
        0.2
      )
      .to(
        camera.position,
        {
          z: ANIMATION_CONFIG.CAMERA_TUNNEL_Z,
          duration: 0.7,
          ease: "power3.in",
        },
        0.4
      )
      .to(
        scene.rotation,
        {
          z: Math.PI * 2,
          x: Math.PI * 0.3,
          duration: 1.4,
          ease: "power2.in",
        },
        0.1
      )
      .to(
        scene.scale,
        {
          x: 0.02,
          y: 0.02,
          z: 0.02,
          duration: 0.5,
          ease: "power4.in",
        },
        0.8
      )
      .to(
        canvas,
        {
          filter: "brightness(400%) contrast(300%) blur(2px)",
          duration: 0.3,
          ease: "power2.in",
        },
        1.5
      )
      .to(
        canvas,
        {
          opacity: 0,
          duration: 0.3,
          ease: "power3.out",
        },
        1.7
      );
  }, [navigate]);

  const renderTrail = useCallback(() => {
    const canvas = trailCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (trailPointsRef.current.length > 1) {
      ctx.globalCompositeOperation = "lighter";
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      const activePoints = trailPointsRef.current;

      if (activePoints.length > 1) {
        const firstPoint = activePoints[0];
        const lastPoint = activePoints[activePoints.length - 1];

        const gradient = ctx.createLinearGradient(
          firstPoint.x,
          firstPoint.y,
          lastPoint.x,
          lastPoint.y
        );

        gradient.addColorStop(0, `rgba(${TRAIL_CONFIG.COLOR_RGB}, 0.1)`);
        gradient.addColorStop(0.5, `rgba(${TRAIL_CONFIG.COLOR_RGB}, 0.4)`);
        gradient.addColorStop(1, `rgba(${TRAIL_CONFIG.COLOR_RGB}, 0.8)`);

        ctx.strokeStyle = gradient;
        ctx.lineWidth = TRAIL_CONFIG.LINE_WIDTH;

        // Dibujar línea continua
        ctx.beginPath();
        ctx.moveTo(activePoints[0].x, activePoints[0].y);

        for (let i = 1; i < activePoints.length; i++) {
          ctx.lineTo(activePoints[i].x, activePoints[i].y);
        }

        ctx.stroke();

        ctx.shadowBlur = TRAIL_CONFIG.SHADOW_BLUR;
        ctx.shadowColor = `rgba(${TRAIL_CONFIG.COLOR_RGB}, 0.6)`;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
    }

    trailPointsRef.current = trailPointsRef.current
      .map((point) => ({
        ...point,
        opacity: point.opacity * TRAIL_CONFIG.OPACITY_DECAY,
      }))
      .filter((point) => point.opacity > TRAIL_CONFIG.MIN_OPACITY);

    if (trailPointsRef.current.length > 0 || isMouseActiveRef.current) {
      animationFrameRef.current = requestAnimationFrame(renderTrail);
    } else {
      animationFrameRef.current = 0;
    }
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      const currentTime = performance.now();

      // 🎯 THROTTLING RESPONSIVO: Intervalos adaptativos según dispositivo
      const updateInterval = responsiveConfig.mouseTrail.updateInterval;
      if (currentTime - lastUpdateTimeRef.current < updateInterval) return;
      lastUpdateTimeRef.current = currentTime;

      isMouseActiveRef.current = true;

      if (mouseStoppedTimeoutRef.current) {
        clearTimeout(mouseStoppedTimeoutRef.current);
      }

      trailPointsRef.current.push({
        x: e.clientX,
        y: e.clientY,
        opacity: 1,
      });

      const maxPoints = responsiveConfig.mouseTrail.maxPoints;
      if (trailPointsRef.current.length > maxPoints) {
        trailPointsRef.current.shift();
      }

      if (animationFrameRef.current === 0) {
        animationFrameRef.current = requestAnimationFrame(renderTrail);
      }

      mouseStoppedTimeoutRef.current = setTimeout(() => {
        isMouseActiveRef.current = false;
      }, SCROLL_CONFIG.MOUSE_IDLE_TIMEOUT);
    },
    [
      renderTrail,
      responsiveConfig.mouseTrail.updateInterval,
      responsiveConfig.mouseTrail.maxPoints,
    ]
  );

  const handleMouseLeave = useCallback(() => {
    isMouseActiveRef.current = false;

    if (mouseStoppedTimeoutRef.current) {
      clearTimeout(mouseStoppedTimeoutRef.current);
      mouseStoppedTimeoutRef.current = null;
    }

    trailPointsRef.current = [];

    const canvas = trailCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = 0;
    }
  }, []);

  const [isCanvasReady, setIsCanvasReady] = useState(false);
  const setupScrollTriggerRef = useRef<(() => void) | null>(null);

  // ✅ COORDINACIÓN MEJORADA: Sincronizar Canvas ready con ScrollTrigger setup
  useEffect(() => {
    if (isCanvasReady && setupScrollTriggerRef.current) {
      setupScrollTriggerRef.current();
    }
  }, [isCanvasReady]);

  useLayoutEffect(() => {
    const canvas = trailCanvasRef.current;
    const container = mainRef.current;

    if (!canvas || !container) return;

    const updateCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("resize", updateCanvasSize);
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
      mouseStoppedTimeoutRef.current &&
        clearTimeout(mouseStoppedTimeoutRef.current);
      animationFrameRef.current &&
        cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = 0;
    };
  }, [handleMouseMove, handleMouseLeave]);

  useLayoutEffect(() => {
    const isReady = () => {
      return !!(
        sceneRef.current?.children.length >= 4 &&
        cameraRef.current?.position &&
        scrollRef.current?.offsetHeight > 0
      );
    };

    const setupScrollTrigger = (attempt = 1) => {
      if (!isReady()) {
        if (attempt < 10) {
          setTimeout(
            () => setupScrollTrigger(attempt + 1),
            SCROLL_CONFIG.SETUP_RETRY_DELAY
          );
        } else {
          console.warn("ScrollTrigger setup failed after 10 attempts");
        }
        return;
      }

      const logoMesh = sceneRef.current.children[1] as THREE.Mesh;
      const textPhrase1 = sceneRef.current.children[2] as THREE.Group;
      const textPhrase2 = sceneRef.current.children[3] as THREE.Group;

      ScrollTrigger.killAll();

      const scrollElement = scrollRef.current;

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: scrollElement,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
          invalidateOnRefresh: true,
          refreshPriority: -1,
          scroller: scrollContainer ? `#${scrollContainer}` : window,
          onUpdate: (self) => {
            const progress = Math.round(self.progress * 100);

            const effectiveProgress = isEmbedded
              ? Math.min(progress, maxScrollPercentage)
              : progress;

            const throttleInterval =
              responsiveConfig.animations.scrollThrottleInterval;
            if (
              Math.abs(effectiveProgress - scrollPercentage) >= throttleInterval
            ) {
              setScrollPercentage(effectiveProgress);
            }
          },
        },
      });

      if (!isEmbedded) {
        ScrollTrigger.create({
          trigger: scrollElement,
          start: "top top",
          end: "bottom bottom",
          scroller: scrollContainer ? `#${scrollContainer}` : window,
          onUpdate: (self) => {
            const progress = self.progress * 100;

            // 🔥 Activar efecto de falla digital al 68%
            if (
              progress >= SCROLL_CONFIG.GLITCH_TRIGGER_PERCENTAGE &&
              progress < SCROLL_CONFIG.PORTAL_TRIGGER_PERCENTAGE &&
              !glitchTriggeredRef.current
            ) {
              glitchTriggeredRef.current = true;
              setIsDigitalGlitch(true);

              // Desactivar el efecto después de 600ms (duración de la animación)
              setTimeout(() => {
                setIsDigitalGlitch(false);
              }, SCROLL_CONFIG.GLITCH_DURATION);
            }

            // Activar portal exactamente al 70% del scroll progress
            if (
              progress >= SCROLL_CONFIG.PORTAL_TRIGGER_PERCENTAGE &&
              !portalTriggeredRef.current &&
              !isTransitioning
            ) {
              portalTriggeredRef.current = true;
              setIsTransitioning(true);
              triggerPortalTransition();
            }
          },
        });
      } else {
        // 🎯 SCROLL TRIGGER PARA VERSIÓN EMBEBIDA - Sin transición de portal
        ScrollTrigger.create({
          trigger: scrollElement,
          start: "top top",
          end: "bottom bottom",
          scroller: scrollContainer ? `#${scrollContainer}` : window,
          onUpdate: (self) => {
            const progress = self.progress * 100;

            // 🎯 LIMITAR SCROLL AL MÁXIMO PERMITIDO (por defecto 65% para evitar portal)
            const clampedProgress = Math.min(progress, maxScrollPercentage);

            // 🔥 Activar efecto de falla digital solo si está dentro del rango permitido
            if (
              clampedProgress >= 60 &&
              clampedProgress < 65 &&
              !glitchTriggeredRef.current &&
              maxScrollPercentage > 65
            ) {
              glitchTriggeredRef.current = true;
              setIsDigitalGlitch(true);

              // Desactivar el efecto después de 600ms
              setTimeout(() => {
                setIsDigitalGlitch(false);
              }, SCROLL_CONFIG.GLITCH_DURATION);
            }

            // 🚫 NO ACTIVAR PORTAL EN VERSIÓN EMBEBIDA
          },
        });
      }

      // MANTENER todas las animaciones exactamente iguales
      timeline.to(
        cameraRef.current.position,
        {
          y: 2,
          z: ANIMATION_CONFIG.CAMERA_TARGET_Z,
          ease: "none",
        },
        0
      );

      // ✅ SIMPLIFICADO: Animaciones de elementos de la escena sin verificaciones redundantes
      if (logoMesh?.position) {
        timeline.to(
          logoMesh.position,
          { z: ANIMATION_CONFIG.LOGO_TARGET_Z, ease: "none" },
          0
        );
      }

      if (textPhrase1?.children) {
        const [line1, line2, line3] = textPhrase1.children;
        if (line1?.position)
          timeline.to(
            line1.position,
            { z: ANIMATION_CONFIG.TEXT_LINE1_Z, ease: "none" },
            0
          );
        if (line2?.position)
          timeline.to(
            line2.position,
            { z: ANIMATION_CONFIG.TEXT_LINE2_Z, ease: "none" },
            0
          );
        if (line3?.position)
          timeline.to(
            line3.position,
            { z: ANIMATION_CONFIG.TEXT_LINE3_Z, ease: "none" },
            0
          );
      }

      if (textPhrase2?.children) {
        const [line1, line2] = textPhrase2.children;
        if (line1?.position)
          timeline.to(
            line1.position,
            { z: ANIMATION_CONFIG.TEXT2_LINE1_Z, ease: "none" },
            0
          );
        if (line2?.position)
          timeline.to(
            line2.position,
            { z: ANIMATION_CONFIG.TEXT2_LINE2_Z, ease: "none" },
            0
          );
      }

      ScrollTrigger.refresh();

      // ✅ VALIDACIÓN FINAL: Solo loggear en caso de problemas
      const activeScrollTriggers = ScrollTrigger.getAll();
      if (activeScrollTriggers.length === 0) {
        console.warn("⚠️ No ScrollTriggers were created");
      }
    };

    // ✅ INICIALIZACIÓN MEJORADA: Usar requestAnimationFrame para mejor sincronización
    const initializeScrollTrigger = () => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setupScrollTrigger();
        });
      });
    };

    // ✅ INICIALIZACIÓN MEJORADA: Guardar la función para coordinarla con Canvas
    setupScrollTriggerRef.current = initializeScrollTrigger;

    // ✅ DELAY AUMENTADO: Dar más tiempo para que Three.js se inicialice completamente
    const timeoutId = setTimeout(() => {
      // Solo ejecutar si el Canvas no está listo aún (fallback)
      if (!isCanvasReady) {
        initializeScrollTrigger();
      }
    }, 500); // Aumentado para dar más tiempo

    return () => {
      clearTimeout(timeoutId);
      ScrollTrigger.killAll();
      // Reset portal trigger state
      portalTriggeredRef.current = false;
      // Reset glitch trigger state
      glitchTriggeredRef.current = false;
    };
  }, [
    triggerPortalTransition,
    responsiveConfig.animations.scrollThrottleInterval,
    scrollContainer,
    isEmbedded,
    maxScrollPercentage,
  ]); // 🎯 Dependencias corregidas - hasStartedAmbientSound removido para estabilidad

  return (
    <div ref={mainRef} className="homepage-container">
      {/* Canvas optimizado para la estela del cursor */}
      <canvas ref={trailCanvasRef} className="cursor-trail-canvas" />

      <div
        ref={canvasRef}
        className={`canvas-container ${
          isTransitioning ? "transitioning" : ""
        } ${isDigitalGlitch ? "digital-glitch" : ""}`}
      >
        <Canvas
          gl={{
            preserveDrawingBuffer: false, // Optimización: reducir uso de memoria
            powerPreference: responsiveConfig.webgl.powerPreference, // 🎯 RESPONSIVE: Configuración adaptiva
            antialias: responsiveConfig.webgl.antialias, // 🎯 RESPONSIVE: Antialias adaptivo
            alpha: true,
            stencil: false, // Optimización: desactivar stencil buffer
            depth: true,
            precision: responsiveConfig.webgl.precision, // 🎯 RESPONSIVE: Precisión adaptiva
          }}
          onCreated={({ gl }) => {
            gl.setClearColor(0x000000, 0);
            // 🎯 RESPONSIVE: Optimizaciones adicionales del renderer
            gl.setPixelRatio(responsiveConfig.webgl.pixelRatio); // Pixel ratio adaptivo
            gl.outputColorSpace = THREE.SRGBColorSpace;

            // ✅ NUEVA COORDINACIÓN: Señalar que el Canvas está listo
            setIsCanvasReady(true);
          }}
        >
          <Suspense fallback={null}>
            <PerspectiveCamera
              ref={cameraRef}
              makeDefault
              position={[0, 10, 30]}
              fov={75}
            />
            <group ref={sceneRef}>
              <LandscapeScene />
              <LogoWithGlitchEffect
                scrollPercentage={scrollPercentage}
                position={[0, 9, 15]}
              />
              <AnimatedTextPhrase1 scrollPercentage={scrollPercentage} />
              <TextPhrase2 scrollPercentage={scrollPercentage} />
            </group>
          </Suspense>
        </Canvas>
      </div>

      {/* Div que genera la barra de scroll */}
      <div className="scroll-content" ref={scrollRef}>
        {/* Contenido de la página - aquí puedes agregar tus elementos */}
      </div>

      {/* 🎵 Visualizador de Audio - Control del Audio Ambiente */}
      <AudioVisualizer onAudioToggle={handleAudioVisualizerToggle} />
    </div>
  );
};

export default HomePage;
