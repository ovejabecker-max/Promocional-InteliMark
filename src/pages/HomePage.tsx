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
  NAVIGATION_DELAY: 2000,
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
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
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

  const ambientAudioRef = useRef<HTMLAudioElement | null>(null);
  const [hasStartedAmbientSound, setHasStartedAmbientSound] = useState(false);
  const [areSoundsEnabled, setAreSoundsEnabled] = useState(false);

  const transitionAudioRef = useRef<HTMLAudioElement | null>(null);

  const navigate = useNavigate();

  const config = useMemo(() => {
    return {
      webgl: {
        antialias: true,
        powerPreference: "high-performance" as const,
        pixelRatio: Math.min(window.devicePixelRatio, 2),
      },
      mouseTrail: {
        maxPoints: 35,
        updateInterval: 16,
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
      } catch (error) {
        console.warn("Cleanup WebGL context:", error);
      }
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const timeoutId = setTimeout(() => {
      const scrollElement = scrollRef.current;
      if (scrollElement && scrollElement.offsetHeight === 0) {
        scrollElement.style.minHeight = UI_CONFIG.SCROLL_HEIGHT;
      }
    }, 500);

    return () => {
      clearTimeout(timeoutId);
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
      } catch (error) {
        console.warn(`Error creating audio element for ${config.src}:`, error);
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

  const handleAudioVisualizerToggle = useCallback(
    async (isActive: boolean) => {
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
    const canvas = canvasRef.current;
    const scene = sceneRef.current;
    const camera = cameraRef.current;

    if (!canvas || !scene || !camera) return;

    if (transitionAudioRef.current && areSoundsEnabled) {
      transitionAudioRef.current.currentTime = 0;

      const playTransitionSound = async () => {
        try {
          await transitionAudioRef.current?.play();

          setTimeout(() => {
            if (transitionAudioRef.current) {
              transitionAudioRef.current.pause();
            }
          }, AUDIO_CONFIG.TRANSITION_DURATION);
        } catch (error) {
          if (import.meta.env.DEV) {
            console.warn("Transition audio skipped:", error);
          }
        }
      };

      playTransitionSound();
    }

    scene.position.set(0, 0, 0);
    camera.lookAt(0, 0, 0);

    const portalTimeline = gsap.timeline({
      ease: EASING_CONFIG.PORTAL_MAIN,
    });

    setTimeout(() => {
      navigate(ROUTES.REBECCA);
    }, ANIMATION_CONFIG.NAVIGATION_DELAY);

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
    [renderTrail, config.mouseTrail.updateInterval]
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

  useEffect(() => {
    if (isCanvasReady && setupScrollTriggerRef.current) {
      setupScrollTriggerRef.current();
    }
  }, [isCanvasReady]);

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
    const isReady = () => {
      return !!(
        sceneRef.current?.children.length &&
        sceneRef.current.children.length >=
          UI_CONFIG.SCENE_READY_MIN_CHILDREN &&
        cameraRef.current?.position &&
        scrollRef.current?.offsetHeight &&
        scrollRef.current.offsetHeight > 0
      );
    };

    const setupScrollTrigger = (attempt = 1) => {
      if (!isReady()) {
        if (attempt < UI_CONFIG.MAX_SETUP_ATTEMPTS) {
          setTimeout(
            () => setupScrollTrigger(attempt + 1),
            SCROLL_CONFIG.SETUP_RETRY_DELAY
          );
        } else {
          console.warn(
            `ScrollTrigger setup failed after ${UI_CONFIG.MAX_SETUP_ATTEMPTS} attempts`
          );
        }
        return;
      }

      // Safe access after isReady check
      const scene = sceneRef.current!;
      const scrollElement = scrollRef.current!;

      const logoMesh = scene.children[1] as THREE.Mesh;
      const textPhrase1 = scene.children[2] as THREE.Group;
      const textPhrase2 = scene.children[3] as THREE.Group;

      ScrollTrigger.killAll();

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

            const effectiveProgress = progress;

            if (Math.abs(effectiveProgress - scrollPercentage) >= 1) {
              setScrollPercentage(effectiveProgress);
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

            setTimeout(() => {
              setIsDigitalGlitch(false);
            }, SCROLL_CONFIG.GLITCH_DURATION);
          }

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
        const [line1, line2, line3] = textPhrase1.children;
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
        const [line1, line2] = textPhrase2.children;
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

      const activeScrollTriggers = ScrollTrigger.getAll();
      if (activeScrollTriggers.length === 0) {
        console.warn("No ScrollTriggers were created");
      }
    };

    const initializeScrollTrigger = () => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setupScrollTrigger();
        });
      });
    };

    setupScrollTriggerRef.current = initializeScrollTrigger;

    if (isCanvasReady) {
      initializeScrollTrigger();
    }

    return () => {
      ScrollTrigger.killAll();
      portalTriggeredRef.current = false;
      glitchTriggeredRef.current = false;
      setIsTransitioning(false);
    };
  }, [triggerPortalTransition]);

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
