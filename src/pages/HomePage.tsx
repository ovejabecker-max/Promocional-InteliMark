import {
  Suspense,
  useRef,
  useState,
  useCallback,
  useEffect,
  useMemo,
  memo,
} from "react";
import type { FC } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  useTexture,
  PerspectiveCamera,
  Text,
  useProgress,
} from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useNavigate } from "react-router-dom";
import { useTransition } from "../hooks/useTransition";
import LogoWithGlitchEffect from "../components/LogoWithGlitchEffect";
import AnimatedTextPhrase1 from "../components/AnimatedTextPhrase1";
import AudioVisualizer from "../components/AudioVisualizer";
import marDeDatosTexture from "../assets/mar_de_datos2.webp";
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
  SETUP_RETRY_DELAY: 300,
  MOUSE_IDLE_TIMEOUT: 300,
  TEXT_PHASE2_LINE1_START: 45,
  TEXT_PHASE2_LINE1_END: 55,
  TEXT_PHASE2_LINE2_START: 55,
  TEXT_PHASE2_LINE2_END: 60,
  TEXT_PHASE2_VISIBLE_THRESHOLD: 70,
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
  // ✅ MEJORADO: Configuración basada en duración real calculada
  NAVIGATION_FALLBACK_DELAY: 3000, // Fallback si onComplete falla
  PORTAL_TOTAL_DURATION: 2.0, // Duración total calculada de la animación
} as const;

const TRAIL_CONFIG = {
  COLOR_RGB: "218, 128, 35",
  LINE_WIDTH: 3,
  SHADOW_BLUR: 10,
  OPACITY_DECAY: 0.85,
  MIN_OPACITY: 0.05,
} as const;

const UI_CONFIG = {
  SCROLL_HEIGHT: "200vh",
  CSS_FILTER_TRANSITION: "brightness(400%) contrast(300%) blur(2px)",
  SCENE_READY_MIN_CHILDREN: 4,
  MAX_SETUP_ATTEMPTS: 10,
} as const;

const EASING_CONFIG = {
  PORTAL_MAIN: "power3.out",
  PORTAL_CAMERA_INITIAL: "power2.in",
  PORTAL_SCALE_INITIAL: "power2.in",
  PORTAL_CAMERA_TUNNEL: "power3.in",
  PORTAL_ROTATION: "power2.in",
  PORTAL_SCALE_FINAL: "power4.in",
  PORTAL_FILTER: "power2.in",
  PORTAL_FADEOUT: "power3.out",
  SCROLL_ANIMATION: "none",
} as const;

const ROUTES = {
  REBECCA: "/rebecca",
} as const;

gsap.registerPlugin(ScrollTrigger);

const LandscapeScene: FC = memo(() => {
  const texture = useTexture(marDeDatosTexture);
  const materialRef = useRef<THREE.ShaderMaterial>(null!);

  // Optimizar textura una sola vez
  useMemo(() => {
    if (texture) {
      texture.generateMipmaps = true; // ✅ Habilitado para mejor LOD
      texture.minFilter = THREE.LinearMipmapLinearFilter; // ✅ Mejor filtrado con mipmaps
      texture.magFilter = THREE.LinearFilter;
      texture.anisotropy = Math.min(4, 16); // ✅ Mejora calidad en ángulos
      texture.wrapS = THREE.ClampToEdgeWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      // Nota: El espacio de color se maneja en el renderer con gl.outputColorSpace
    }
  }, [texture]);

  // Animar el tiempo para los efectos
  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
    }
  });

  return (
    <mesh rotation-x={-Math.PI / 2} position-y={-5}>
      <planeGeometry args={[100, 100, 30, 30]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={{
          uTexture: { value: texture },
          uTime: { value: 0 },
        }}
        vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform sampler2D uTexture;
          uniform float uTime;
          varying vec2 vUv;

          void main() {
            // 1) Flujo y Distorsión Líquida
            vec2 uv = vUv;
            uv.x += sin(vUv.y * 10.0 + uTime * 1.5) * 0.01;
            uv.y += cos(vUv.x * 8.0 + uTime * 1.2) * 0.008;

            vec4 tex = texture2D(uTexture, uv);
            vec3 color = tex.rgb;

            // 2) Ondas de Luz en Movimiento (cáusticas suaves)
            float lightWave = sin(vUv.x * 20.0 + uTime * 3.0) * cos(vUv.y * 15.0 + uTime * 2.5) * 0.05;
            color += lightWave * vec3(0.15, 0.15, 0.15);

            // 3) Viñeta sutil
            float dist = length(vUv - 0.5);
            color *= (1.0 - dist * 0.2);

            // 4) Pulso de brillo global
            float pulse = sin(uTime * 2.0) * 0.05 + 0.95;
            color *= pulse;

            // 5) Ondas concéntricas (ripples)
            float centerDist = length(vUv - 0.5);
            float ripple = sin(centerDist * 30.0 - uTime * 5.0) * 0.02;
            color += vec3(ripple);

            gl_FragColor = vec4(color, tex.a);
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
      const line1Opacity =
        scrollPercentage > SCROLL_CONFIG.TEXT_PHASE2_VISIBLE_THRESHOLD
          ? 1
          : calculateOpacity(
              SCROLL_CONFIG.TEXT_PHASE2_LINE1_START,
              SCROLL_CONFIG.TEXT_PHASE2_LINE1_END
            );
      const line2Opacity =
        scrollPercentage > SCROLL_CONFIG.TEXT_PHASE2_VISIBLE_THRESHOLD
          ? 1
          : calculateOpacity(
              SCROLL_CONFIG.TEXT_PHASE2_LINE2_START,
              SCROLL_CONFIG.TEXT_PHASE2_LINE2_END
            );

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

interface HomePageProps {}

const HomePage: FC<HomePageProps> = () => {
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const sceneRef = useRef<THREE.Group | null>(null);
  const mainRef = useRef<HTMLDivElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const [scrollPercentage, setScrollPercentage] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isDigitalGlitch, setIsDigitalGlitch] = useState(false);
  const portalTriggeredRef = useRef(false);
  const glitchTriggeredRef = useRef(false);
  // ✅ NUEVO: Control de estado de navegación
  const navigationExecutedRef = useRef(false);

  const ambientAudioRef = useRef<HTMLAudioElement | null>(null);
  const [hasStartedAmbientSound, setHasStartedAmbientSound] = useState(false);
  const [areSoundsEnabled, setAreSoundsEnabled] = useState(false);

  const transitionAudioRef = useRef<HTMLAudioElement | null>(null);

  const navigate = useNavigate();

  // 🌀 NUEVO: Hook de gestión de transiciones
  const transitionContext = useTransition();
  // Carga de assets (drei) para gatear la inicialización
  const { active } = useProgress();

  // Refs para valores/funciones usados en callbacks de ScrollTrigger
  const isTransitioningRef = useRef(isTransitioning);
  useEffect(() => {
    isTransitioningRef.current = isTransitioning;
  }, [isTransitioning]);

  // Se inicializa con noop y se actualiza después de declarar la función
  const triggerPortalTransitionRef = useRef<() => void>(() => {});

  const transitionContextRef = useRef(transitionContext);
  useEffect(() => {
    transitionContextRef.current = transitionContext;
  }, [transitionContext]);

  // Ref estable para evitar re-creación por cambios de scroll
  const scrollPercentageRef = useRef(scrollPercentage);
  useEffect(() => {
    scrollPercentageRef.current = scrollPercentage;
  }, [scrollPercentage]);

  const config = useMemo(() => {
    return {
      webgl: {
        antialias: true,
        powerPreference: "high-performance" as const,
        pixelRatio: Math.min(window.devicePixelRatio, 1.5),
      },
      mouseTrail: {
        maxPoints: 35,
        updateInterval: 16,
      },
    };
  }, []);

  useEffect(() => {
    const sceneAtMount = sceneRef.current;
    return () => {
      try {
        if (THREE.Cache) {
          THREE.Cache.clear();
        }

        if (sceneAtMount) {
          sceneAtMount.traverse((child: THREE.Object3D) => {
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
      } catch (error) {
        // Ignorar errores de limpieza de WebGL
      }
    };
  }, []);

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

        audio.volume = Math.max(0, Math.min(1, config.volume));
        audio.preload = config.preload || "auto";

        if (config.loop) {
          audio.loop = config.loop;
        }

        if (config.onError) {
          audio.addEventListener("error", () => {
            config.onError?.(new Error(`Audio load failed: ${config.src}`));
          });
        }

        return audio;
      } catch (_error) {
        // Ignorar errores de creación de audio
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
      onError: (_error) => {
        // Commented for production - console.warn("Error cargando audio ambiente:", error.message);
      },
    });

    ambientAudioRef.current = audio;

    return () => {
      if (ambientAudioRef.current) {
        ambientAudioRef.current.pause();
        ambientAudioRef.current = null;
      }
    };
  }, [createAudioElement]);

  useEffect(() => {
    const transitionAudio = createAudioElement({
      src: AUDIO_CONFIG.TRANSITION_PATH,
      volume: AUDIO_CONFIG.TRANSITION_VOLUME,
      preload: "auto",
      onError: (_error) => {
        // Ignorar errores de carga del audio de transición
      },
    });

    transitionAudioRef.current = transitionAudio;

    return () => {
      if (transitionAudioRef.current) {
        transitionAudioRef.current = null;
      }
    };
  }, [createAudioElement]);

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

  const handleAudioVisualizerToggle = useCallback(
    async (isActive: boolean) => {
      try {
        if (isActive) {
          setAreSoundsEnabled(true);
          if (ambientAudioRef.current) {
            await ambientAudioRef.current.play();
            setHasStartedAmbientSound(true);
          }
          // 🎯 Desbloquear/preparar el audio de transición con el gesto del usuario
          // Reproducimos en volumen 0 y pausamos inmediatamente para que luego pueda
          // sonar sin bloqueo durante la transición.
          if (transitionAudioRef.current) {
            const transition = transitionAudioRef.current;
            try {
              transition.currentTime = 0;
              // Usar muted para evitar cambios de volumen persistentes
              transition.muted = true; // evitar sonido al activar
              await transition.play();
              transition.pause();
            } catch (_err) {
              // En algunos navegadores, play() puede fallar; ignoramos silenciosamente
            } finally {
              // Asegurar estado consistente para futura reproducción
              transition.muted = false;
              transition.volume = AUDIO_CONFIG.TRANSITION_VOLUME; // restaurar volumen objetivo
            }
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
      } catch (_error) {
        // Ignorar errores al manejar audio
      }
    },
    [setAreSoundsEnabled, setHasStartedAmbientSound]
  );

  const trailPointsRef = useRef<{ x: number; y: number; opacity: number }[]>(
    []
  );
  const trailCanvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>(0);
  const lastUpdateTimeRef = useRef<number>(0);
  const isMouseActiveRef = useRef<boolean>(false);
  const mouseStoppedTimeoutRef = useRef<number | null>(null);

  const triggerPortalTransition = useCallback(() => {
    // console.log("🚀 triggerPortalTransition INICIADO");

    const canvas = canvasRef.current;
    const scene = sceneRef.current;
    const camera = cameraRef.current;

    if (!canvas || !scene || !camera) {
      return;
    }

    // console.log("✅ Elementos encontrados, iniciando transición...");

    if (areSoundsEnabled) {
      // Ducking: bajar volumen del ambiente durante la transición
      if (ambientAudioRef.current) {
        try {
          gsap.to(ambientAudioRef.current, {
            volume: Math.max(0, Math.min(1, 0.03)),
            duration: 0.35,
            ease: "power2.out",
            overwrite: true,
          });
        } catch (_e) {
          // ignorar
        }
      }

      // Asegurar que el audio de transición exista
      if (!transitionAudioRef.current) {
        transitionAudioRef.current = createAudioElement({
          src: AUDIO_CONFIG.TRANSITION_PATH,
          volume: AUDIO_CONFIG.TRANSITION_VOLUME,
          preload: "auto",
        });
      }

      const el = transitionAudioRef.current;
      // Forzar estado correcto antes de reproducir
      if (el) {
        el.muted = false;
        el.volume = AUDIO_CONFIG.TRANSITION_VOLUME;
        try {
          // currentTime puede fallar si no hay metadata aún
          el.currentTime = 0;
        } catch (_e) {
          // ignorar
        }

        const playTransitionSound = async () => {
          try {
            await el.play();
            setTimeout(() => {
              try {
                el.pause();
              } catch (_e) {
                // ignorar
              }
            }, AUDIO_CONFIG.TRANSITION_DURATION);
          } catch (_error) {
            // Ignorado: algunos navegadores pueden bloquear play() fuera de gesto directo
          }
        };

        playTransitionSound();
      }
    }

    scene.position.set(0, 0, 0);
    camera.lookAt(0, 0, 0);

    // ✅ MEJORADO: Timeline con callback de finalización sincronizado
    const portalTimeline = gsap.timeline({
      ease: EASING_CONFIG.PORTAL_MAIN,
      onUpdate: () => {
        // 📊 Actualizar progreso en TransitionContext
        const progress = Math.round(portalTimeline.progress() * 100);
        transitionContext.updateProgress(progress);

        // 📊 OPCIONAL: Tracking de progreso para debugging
        if (import.meta.env.DEV) {
          if (progress % 25 === 0) {
            // Log cada 25%
            // console.log(`Portal transition progress: ${progress}%`);
          }
        }
      },
    });

    // ❌ REMOVIDO: setTimeout fijo reemplazado por onComplete callback

    portalTimeline
      .to(
        camera.position,
        {
          z: -80,
          duration: 0.3,
          ease: EASING_CONFIG.PORTAL_CAMERA_INITIAL,
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
          ease: EASING_CONFIG.PORTAL_SCALE_INITIAL,
        },
        0.2
      )
      .to(
        camera.position,
        {
          z: ANIMATION_CONFIG.CAMERA_TUNNEL_Z,
          duration: 0.7,
          ease: EASING_CONFIG.PORTAL_CAMERA_TUNNEL,
        },
        0.4
      )
      .to(
        scene.rotation,
        {
          z: Math.PI * 2,
          x: Math.PI * 0.3,
          duration: 1.4,
          ease: EASING_CONFIG.PORTAL_ROTATION,
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
          ease: EASING_CONFIG.PORTAL_SCALE_FINAL,
        },
        0.8
      )
      .to(
        canvas,
        {
          filter: UI_CONFIG.CSS_FILTER_TRANSITION,
          duration: 0.3,
          ease: EASING_CONFIG.PORTAL_FILTER,
        },
        1.5
      )
      .to(
        canvas,
        {
          opacity: 0,
          duration: 0.3,
          ease: EASING_CONFIG.PORTAL_FADEOUT,
        },
        1.7
      );

    // 🛡️ SISTEMA DE RESPALDO: Navegación garantizada como última línea de defensa
    const navigationFallback = setTimeout(() => {
      if (!navigationExecutedRef.current) {
        navigationExecutedRef.current = true;
        document.body.style.overflow = "";
        navigate(ROUTES.REBECCA);
      }
    }, ANIMATION_CONFIG.NAVIGATION_FALLBACK_DELAY);

    // 🔄 Restaurar volumen ambiente si por alguna razón no navegamos
    const restoreAmbientOnStall = setTimeout(() => {
      if (!navigationExecutedRef.current && ambientAudioRef.current) {
        try {
          gsap.to(ambientAudioRef.current, {
            volume: AUDIO_CONFIG.AMBIENT_VOLUME,
            duration: 0.3,
            ease: "power2.out",
            overwrite: true,
          });
        } catch (_e) {
          // ignorar
        }
      }
    }, AUDIO_CONFIG.TRANSITION_DURATION + 300);

    // 🧹 LIMPIEZA Y NAVEGACIÓN: Todo consolidado en un solo callback
    portalTimeline.eventCallback("onComplete", () => {
      // 🎯 NAVEGACIÓN SINCRONIZADA: Se ejecuta al completar la animación real
      if (!navigationExecutedRef.current) {
        navigationExecutedRef.current = true;

        // 🔓 RESTAURAR SCROLL: Habilitar scroll antes de navegar
        document.body.style.overflow = "";

        // ✅ COMPLETAR TRANSICIÓN EN CONTEXT
        transitionContext.completeTransition();

        // console.log("Portal animation completed, navigating to Rebecca...");

        // 🚀 NAVEGAR CON ESTADO DE TRANSICIÓN
        navigate(ROUTES.REBECCA, {
          state: {
            fromPortal: true,
            transitionData: transitionContext.portalEffectsData,
          },
        });
      }

      // Cancelar fallback y restauración condicional
      clearTimeout(navigationFallback);
      clearTimeout(restoreAmbientOnStall);

      // Reset para futuras transiciones
      portalTriggeredRef.current = false;
      setTimeout(() => {
        navigationExecutedRef.current = false;
      }, 1000);
    });
  }, [navigate, areSoundsEnabled, transitionContext, createAudioElement]);

  // Enlazar función en ref estable
  useEffect(() => {
    triggerPortalTransitionRef.current = triggerPortalTransition;
  }, [triggerPortalTransition]);

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

      const updateInterval = config.mouseTrail.updateInterval;
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

      const maxPoints = config.mouseTrail.maxPoints;
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
    [renderTrail, config.mouseTrail.updateInterval, config.mouseTrail.maxPoints]
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
  const setupAttemptsRef = useRef(0);

  useEffect(() => {
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

  useEffect(() => {
    // Gatear por readiness real: Canvas creado y assets listos (drei)
    const isReady = () => {
      return !!(
        isCanvasReady &&
        !active &&
        cameraRef.current &&
        scrollRef.current &&
        scrollRef.current.offsetHeight > 0 &&
        sceneRef.current &&
        sceneRef.current.children &&
        sceneRef.current.children.length >= UI_CONFIG.SCENE_READY_MIN_CHILDREN
      );
    };

    let ctx: gsap.Context | null = null;

    const setupScrollTrigger = () => {
      if (!isReady()) {
        if (setupAttemptsRef.current < 20) {
          setupAttemptsRef.current += 1;
          setTimeout(() => {
            // rAF doble para asegurar layout estable
            requestAnimationFrame(() =>
              requestAnimationFrame(setupScrollTrigger)
            );
          }, 120);
        }
        return;
      }
      setupAttemptsRef.current = 0;

      const scene = sceneRef.current!;
      const scrollElement = scrollRef.current!;

      const logoMesh = (scene.children?.[1] as THREE.Mesh) || null;
      const textPhrase1 = (scene.children?.[2] as THREE.Group) || null;
      const textPhrase2 = (scene.children?.[3] as THREE.Group) || null;

      ctx = gsap.context(() => {
        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: scrollElement,
            start: "top top",
            end: "bottom bottom",
            scrub: 1,
            invalidateOnRefresh: true,
            refreshPriority: -1,
            scroller: window,
            onUpdate: (self) => {
              const progress = Math.round(self.progress * 100);
              if (Math.abs(progress - scrollPercentageRef.current) >= 1) {
                setScrollPercentage(progress);
              }
            },
          },
        });

        ScrollTrigger.create({
          trigger: scrollElement,
          start: "top top",
          end: "bottom bottom",
          scroller: window,
          onUpdate: (self) => {
            const progress = self.progress * 100;

            if (
              progress >= SCROLL_CONFIG.GLITCH_TRIGGER_PERCENTAGE &&
              progress < SCROLL_CONFIG.PORTAL_TRIGGER_PERCENTAGE &&
              !glitchTriggeredRef.current
            ) {
              glitchTriggeredRef.current = true;
              setIsDigitalGlitch(true);
              setTimeout(
                () => setIsDigitalGlitch(false),
                SCROLL_CONFIG.GLITCH_DURATION
              );
            }

            if (
              progress >= SCROLL_CONFIG.PORTAL_TRIGGER_PERCENTAGE &&
              !portalTriggeredRef.current &&
              !isTransitioningRef.current
            ) {
              portalTriggeredRef.current = true;
              setIsTransitioning(true);

              transitionContextRef.current.startTransition({
                type: "portal",
                direction: "home-to-rebecca",
                fromPage: "home",
                toPage: "rebecca",
                portalData: {
                  cameraPosition: cameraRef.current
                    ? {
                        x: cameraRef.current.position.x,
                        y: cameraRef.current.position.y,
                        z: cameraRef.current.position.z,
                      }
                    : undefined,
                  sceneRotation: sceneRef.current
                    ? {
                        x: sceneRef.current.rotation.x,
                        y: sceneRef.current.rotation.y,
                        z: sceneRef.current.rotation.z,
                      }
                    : undefined,
                  lastScrollPercentage: progress,
                  glitchTriggered: glitchTriggeredRef.current,
                },
              });

              document.body.style.overflow = "hidden";
              triggerPortalTransitionRef.current();
            }
          },
        });

        timeline.to(
          cameraRef.current!.position,
          {
            y: 2,
            z: ANIMATION_CONFIG.CAMERA_TARGET_Z,
            ease: EASING_CONFIG.SCROLL_ANIMATION,
          },
          0
        );

        if (logoMesh?.position) {
          timeline.to(
            logoMesh.position,
            {
              z: ANIMATION_CONFIG.LOGO_TARGET_Z,
              ease: EASING_CONFIG.SCROLL_ANIMATION,
            },
            0
          );
        }

        if (textPhrase1?.children) {
          const [line1, line2, line3] =
            textPhrase1.children as THREE.Object3D[];
          if (line1?.position)
            timeline.to(
              line1.position,
              {
                z: ANIMATION_CONFIG.TEXT_LINE1_Z,
                ease: EASING_CONFIG.SCROLL_ANIMATION,
              },
              0
            );
          if (line2?.position)
            timeline.to(
              line2.position,
              {
                z: ANIMATION_CONFIG.TEXT_LINE2_Z,
                ease: EASING_CONFIG.SCROLL_ANIMATION,
              },
              0
            );
          if (line3?.position)
            timeline.to(
              line3.position,
              {
                z: ANIMATION_CONFIG.TEXT_LINE3_Z,
                ease: EASING_CONFIG.SCROLL_ANIMATION,
              },
              0
            );
        }

        if (textPhrase2?.children) {
          const [line1, line2] = textPhrase2.children as THREE.Object3D[];
          if (line1?.position)
            timeline.to(
              line1.position,
              {
                z: ANIMATION_CONFIG.TEXT2_LINE1_Z,
                ease: EASING_CONFIG.SCROLL_ANIMATION,
              },
              0
            );
          if (line2?.position)
            timeline.to(
              line2.position,
              {
                z: ANIMATION_CONFIG.TEXT2_LINE2_Z,
                ease: EASING_CONFIG.SCROLL_ANIMATION,
              },
              0
            );
        }

        ScrollTrigger.refresh();
      }, mainRef);
    };

    // Ejecutar cuando pase a listo
    // rAF doble inicial y luego reintentos silenciosos dentro de setupScrollTrigger
    requestAnimationFrame(() => requestAnimationFrame(setupScrollTrigger));

    return () => {
      document.body.style.overflow = "";
      ctx?.revert();
      portalTriggeredRef.current = false;
      glitchTriggeredRef.current = false;
      navigationExecutedRef.current = false;
      setIsTransitioning(false);
    };
  }, [active, isCanvasReady]);

  return (
    <div ref={mainRef} className="homepage-container">
      <canvas
        ref={trailCanvasRef}
        className="cursor-trail-canvas full-viewport-fixed gpu-accelerated"
      />

      <div
        ref={canvasRef}
        className={`canvas-container full-viewport-fixed gpu-accelerated ${
          isTransitioning ? "transitioning gpu-accelerated-transition" : ""
        } ${isDigitalGlitch ? "digital-glitch" : ""}`}
      >
        <Canvas
          gl={{
            preserveDrawingBuffer: false,
            powerPreference: config.webgl.powerPreference,
            antialias: config.webgl.antialias,
            alpha: true,
            stencil: false,
            depth: true,
          }}
          onCreated={({ gl }) => {
            gl.setClearColor(0x000000, 0);
            gl.setPixelRatio(config.webgl.pixelRatio);
            gl.outputColorSpace = THREE.SRGBColorSpace;

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

      <div
        className="scroll-content responsive-scroll-height gpu-accelerated-scroll"
        ref={scrollRef}
      ></div>

      <AudioVisualizer onAudioToggle={handleAudioVisualizerToggle} />
    </div>
  );
};

export default HomePage;
