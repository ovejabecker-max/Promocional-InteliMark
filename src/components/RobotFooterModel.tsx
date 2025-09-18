import React, { Suspense, useEffect, useRef } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { Environment, useGLTF } from "@react-three/drei";
import * as THREE from "three";

// Componente que carga y ajusta el modelo
interface RobotModelProps {
  targetAnglesRef: React.MutableRefObject<{ yaw: number; pitch: number }>;
}

function RobotModel({ targetAnglesRef }: RobotModelProps) {
  const group = useRef<THREE.Group>(null!);
  const { scene } = useGLTF("/Robot_footer.glb", true);
  const { size } = useThree();
  const currentAnglesRef = useRef({ yaw: 0, pitch: 0 });

  // Ajustar escala automáticamente para caber en el contenedor
  useEffect(() => {
    if (!group.current) return;
    // Clonar escena para evitar mutar original si se reutiliza
    const cloned = scene.clone(true);
    // Limpiar hijos previos (si hot reload)
    group.current.clear();
    group.current.add(cloned);

    // Calcular bounding box y escalar
    const box = new THREE.Box3().setFromObject(cloned);
    const sizeVec = new THREE.Vector3();
    box.getSize(sizeVec);
    const maxDim = Math.max(sizeVec.x, sizeVec.y, sizeVec.z);
    // Parámetros de ajuste fino (se pueden retocar rápidamente si hace falta)
    const TARGET_SIZE = 2.5; // antes 2.6 (ligeramente menor => más margen)
    const PADDING_PERCENT = 0.9; // antes 0.95 (más aire alrededor)
    const scale = (TARGET_SIZE / maxDim) * PADDING_PERCENT;
    cloned.scale.setScalar(scale);

    // Recentrar en origen
    const center = new THREE.Vector3();
    box.getCenter(center);
    cloned.position.sub(center); // mover al origen
    cloned.position.y -= sizeVec.y * 0.02; // ajuste vertical más sutil tras reducción
  }, [scene, size]);

  // Seguimiento de cursor: interpolar hacia ángulos objetivo
  useFrame(() => {
    const smoothing = 0.08; // factor de suavizado
    const { yaw: ty, pitch: tp } = targetAnglesRef.current;
    const ca = currentAnglesRef.current;
    ca.yaw += (ty - ca.yaw) * smoothing;
    ca.pitch += (tp - ca.pitch) * smoothing;
    if (group.current) {
      group.current.rotation.set(ca.pitch, ca.yaw, 0);
    }
  });

  return <group ref={group} />;
}

// Adaptar cámara a un encuadre cómodo
function AdjustCamera() {
  const { camera } = useThree();
  useEffect(() => {
    camera.position.set(0, 0.4, 4.2);
    camera.near = 0.01;
    camera.far = 100;
    camera.updateProjectionMatrix();
  }, [camera]);
  return null;
}

export const RobotFooterModel: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const targetAnglesRef = useRef({ yaw: 0, pitch: 0 });

  useEffect(() => {
    // Usar footer completo como área de interacción
    const footerEl = document.getElementById("footer-reveal");
    const targetEl = footerEl || containerRef.current; // fallback al contenedor
    if (!targetEl) return;
    const MAX_YAW = 0.5; // ~28.6°
    const MAX_PITCH = 0.35; // ~20°

    const INVERT_VERTICAL = false; // si se pone true vuelve al comportamiento anterior
    const handlePointerMove = (e: PointerEvent) => {
      const rect = targetEl.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const nx = (x - rect.width / 2) / (rect.width / 2); // -1 a 1
      const ny = (y - rect.height / 2) / (rect.height / 2); // -1 a 1
      targetAnglesRef.current.yaw = Math.max(
        -MAX_YAW,
        Math.min(MAX_YAW, nx * MAX_YAW)
      );
      const mappedPitch = ny * MAX_PITCH * (INVERT_VERTICAL ? -1 : 1);
      targetAnglesRef.current.pitch = Math.max(
        -MAX_PITCH,
        Math.min(MAX_PITCH, mappedPitch)
      );
    };
    const handleLeave = () => {
      targetAnglesRef.current.yaw = 0;
      targetAnglesRef.current.pitch = 0;
    };
    targetEl.addEventListener("pointermove", handlePointerMove);
    targetEl.addEventListener("pointerleave", handleLeave);
    return () => {
      targetEl.removeEventListener("pointermove", handlePointerMove);
      targetEl.removeEventListener("pointerleave", handleLeave);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="robot-footer-container"
      style={{
        width: "380px",
        height: "400px",
        position: "relative",
        background: "transparent",
        borderRadius: "10px",
        overflow: "hidden",
        // Permitimos pointer events para capturar movimiento
        pointerEvents: "auto",
      }}
    >
      <Canvas
        style={{ position: "absolute", inset: 0 }}
        dpr={[1, 2]}
        gl={{ alpha: true, antialias: true }}
        camera={{ fov: 35, position: [0, 0.4, 4.2] }}
      >
        <Suspense fallback={null}>
          <AdjustCamera />
          <ambientLight intensity={0.7} />
          <directionalLight position={[5, 5, 5]} intensity={1.2} castShadow />
          <Environment preset="city" />
          <RobotModel targetAnglesRef={targetAnglesRef} />
        </Suspense>
      </Canvas>
    </div>
  );
};

// Pre-cargar el modelo
useGLTF.preload("/Robot_footer.glb");

export default RobotFooterModel;
