import React, { Suspense, useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, Html } from "@react-three/drei";
import * as THREE from "three";

class Robot3DErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            color: "#da8023",
            fontSize: "16px",
            fontWeight: "bold",
            textAlign: "center",
            background: "rgba(26, 26, 26, 0.8)",
            borderRadius: "10px",
            padding: "20px",
            height: "100%",
          }}
        >
          🤖 Robot no disponible
        </div>
      );
    }

    return this.props.children;
  }
}

interface RobotModelProps {
  scale?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scrollRotation?: number;
  isFooterActive?: boolean; // 🔧 Estado compartido desde useFooterController
}

function RobotModel({
  scale = 1,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scrollRotation = 0,
  isFooterActive = false, // 🔧 Usar prop en lugar de estado interno
}: RobotModelProps) {
  const meshRef = useRef<THREE.Group>(null);
  // 🔧 RESTAURADO: Estado para seguimiento del mouse (necesario para interacción)
  const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });
  const [animationIntensity, setAnimationIntensity] = React.useState(0.1);
  // 🔧 Usar prop isFooterActive en lugar de estado interno y observer

  const { scene } = useGLTF("/cabeza_robot.glb");

  // 🔧 ELIMINADO: IntersectionObserver redundante - usar estado compartido

  React.useEffect(() => {
    if (!isFooterActive) {
      setAnimationIntensity(0.1);
      return;
    }

    const animatePulsation = () => {
      const time = Date.now() * 0.004;
      const pulse = Math.sin(time) * 0.5 + 0.5;
      const intensity = 0.1 + pulse * 2;
      setAnimationIntensity(Math.min(intensity, 2.5));
    };

    const intervalId = setInterval(animatePulsation, 60);
    return () => clearInterval(intervalId);
  }, [isFooterActive]);

  React.useEffect(() => {
    if (scene) {
      scene.traverse((child: THREE.Object3D) => {
        if (child instanceof THREE.Mesh && child.material) {
          const material = child.material;

          if (material.color) {
            const color = material.color;
            const hsl = { h: 0, s: 0, l: 0 };
            color.getHSL(hsl);

            if (hsl.h >= 0 && hsl.h <= 0.15 && hsl.s > 0.5) {
              if (!material.emissive) material.emissive = new THREE.Color();

              const emissionIntensity = animationIntensity * 1.5;

              material.emissive.setRGB(
                color.r * emissionIntensity * 0.9,
                color.g * emissionIntensity * 0.5,
                color.b * emissionIntensity * 0.1
              );

              material.emissiveIntensity = animationIntensity * 3;
              material.roughness = Math.max(0.1, 1 - animationIntensity * 0.4);
              material.metalness = Math.min(1, 0.2 + animationIntensity * 0.3);
              material.needsUpdate = true;
            }
          }
        }
      });
    }
  }, [scene, animationIntensity]);

  // 🔧 RESTORED: MouseMove global with footer detection
  React.useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const footerContainer = document.querySelector("#footer-reveal");
      if (!footerContainer) {
        setMousePosition({ x: 0, y: 0 });
        return;
      }

      const rect = footerContainer.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const isInside =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom;

      if (isInside && isFooterActive) {
        const x = (event.clientX - centerX) / (rect.width / 2);
        const y = (event.clientY - centerY) / (rect.height / 2);

        const clampedX = Math.max(-1, Math.min(1, x));
        const clampedY = Math.max(-1, Math.min(1, y));

        setMousePosition({ x: clampedX, y: clampedY });
      } else {
        setMousePosition({ x: 0, y: 0 });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [isFooterActive]);

  useFrame(() => {
    if (meshRef.current) {
      // 🔧 RESTAURADO: Rotación base + scroll + seguimiento de mouse
      let baseRotationY = rotation[1] + scrollRotation;
      const mouseRotationY = mousePosition.x * 0.3;
      const mouseRotationX = mousePosition.y * 0.2;

      baseRotationY += mouseRotationY;
      meshRef.current.rotation.x = rotation[0] + mouseRotationX;
      meshRef.current.rotation.y = baseRotationY;
    }
  });

  if (!scene) {
    return null;
  }

  return (
    <group>
      <primitive
        ref={meshRef}
        object={scene.clone()}
        scale={scale}
        position={position}
        rotation={rotation}
      />

      {isFooterActive && (
        <>
          <pointLight
            position={[0.2, 0.1, 0.5]}
            color="#ff3300"
            intensity={animationIntensity * 8}
            distance={8}
            decay={0.5}
          />

          <pointLight
            position={[0, 0.4, 0.3]}
            color="#ff5500"
            intensity={animationIntensity * 4}
            distance={3}
            decay={1.5}
          />

          <pointLight
            position={[0.2, 0.3, 0.4]}
            color="#ff6600"
            intensity={animationIntensity * 3}
            distance={2.5}
            decay={2}
          />
        </>
      )}
    </group>
  );
}

function LoadingSpinner() {
  return (
    <Html center>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          color: "#da8023",
          fontSize: "18px",
          fontWeight: "bold",
          textAlign: "center",
          padding: "20px",
        }}
      >
        🤖 Cargando robot...
      </div>
    </Html>
  );
}

interface Robot3DProps {
  width?: string;
  height?: string;
  scale?: number;
  enableScrollRotation?: boolean;
  isFooterActive?: boolean; // 🔧 Recibir estado desde useFooterController
}

const Robot3D: React.FC<Robot3DProps> = ({
  width = "300px",
  height = "300px",
  scale = 15,
  enableScrollRotation = false,
  isFooterActive = false, // 🔧 Usar estado compartido en lugar de propio observer
}) => {
  const [scrollRotation, setScrollRotation] = React.useState(0);

  useEffect(() => {
    if (!enableScrollRotation) return;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      const normalizedScroll = (scrollY / Math.max(maxScroll, 1)) * 2 - 1;
      const rotationAngle = normalizedScroll * 1.57;
      setScrollRotation(rotationAngle);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [enableScrollRotation]);

  return (
    <Robot3DErrorBoundary>
      <div style={{ width, height, pointerEvents: "auto" }}>
        <Canvas
          camera={{
            position: [0, 0, 3.2],
            fov: 50,
            near: 0.1,
            far: 1000,
          }}
          style={{
            background: "transparent",
            borderRadius: "10px",
          }}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: "high-performance",
          }}
        >
          <Suspense fallback={<LoadingSpinner />}>
            <ambientLight intensity={0.3} color="#ffffff" />
            <directionalLight
              position={[5, 5, 5]}
              intensity={0.8}
              color="#ffffff"
            />
            <directionalLight
              position={[-3, -3, 3]}
              intensity={0.5}
              color="#da8023"
            />
            <RobotModel
              scale={scale}
              position={[0, -1.05, 0]}
              rotation={[0, 0, 0]}
              scrollRotation={scrollRotation}
              isFooterActive={isFooterActive}
            />
          </Suspense>
        </Canvas>
      </div>
    </Robot3DErrorBoundary>
  );
};

useGLTF.preload("/cabeza_robot.glb");

export default Robot3D;
