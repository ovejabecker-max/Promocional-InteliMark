import React, { Suspense, useEffect, useRef } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Environment, OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";

// Componente que carga y ajusta el modelo
function RobotModel() {
  const group = useRef<THREE.Group>(null!);
  const { scene } = useGLTF("/Robot_footer.glb", true);
  const { size } = useThree();

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

  // Rotación eliminada según solicitud del usuario

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
  return (
    <div
      className="robot-footer-container"
      style={{
        width: "380px",
        height: "400px",
        position: "relative",
        background: "transparent",
        borderRadius: "10px",
        overflow: "hidden",
        pointerEvents: "none", // impedir interferir con UI circundante
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
          {/* Luz direccional suave */}
          <directionalLight position={[5, 5, 5]} intensity={1.2} castShadow />
          <Environment preset="city" />
          <RobotModel />
          <OrbitControls
            enablePan={false}
            enableZoom={false}
            autoRotate={false}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};

// Pre-cargar el modelo
useGLTF.preload("/Robot_footer.glb");

export default RobotFooterModel;
