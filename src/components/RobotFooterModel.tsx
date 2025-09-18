import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, OrbitControls, useGLTF } from "@react-three/drei";
import { Suspense, useRef } from "react";
import * as THREE from "three";

// Pre-carga del modelo (ruta en public)
// El archivo se encuentra en public/Robot_footer.glb por lo que se referencia como "/Robot_footer.glb"

interface RobotModelProps {
  rotationSpeed?: number;
}

function RobotModel({ rotationSpeed = 0.15 }: RobotModelProps) {
  const group = useRef<THREE.Group>(null!);
  const { scene } = useGLTF("/Robot_footer.glb");

  // Ajustes iniciales del modelo (escala y rotación base)
  if (scene && !scene.userData.__initialized) {
    scene.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        mesh.castShadow = false;
        mesh.receiveShadow = false;
      }
    });
    scene.scale.set(2.2, 2.2, 2.2);
    scene.rotation.y = Math.PI; // Girar para que mire al frente
    scene.userData.__initialized = true;
  }

  useFrame((_, delta) => {
    if (group.current) {
      group.current.rotation.y += delta * rotationSpeed * 0.2; // Rotación muy lenta
    }
  });

  return <primitive ref={group} object={scene} position={[0, -0.6, 0]} />;
}

function AutoFitCamera() {
  const { camera } = useThree();
  // Posición fija pensada para un modelo de cabeza centrado
  camera.position.set(0, 0.4, 3.2);
  camera.lookAt(0, 0.2, 0);
  return null;
}

export const RobotFooterModel = () => {
  return (
    <div className="robot-footer-3d-wrapper">
      <Canvas
        shadows={false}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        camera={{ fov: 35, near: 0.1, far: 50 }}
      >
        <color attach="background" args={[0, 0, 0]} />
        <Suspense fallback={null}>
          <AutoFitCamera />
          <ambientLight intensity={0.6} />
          <directionalLight
            intensity={1.1}
            position={[2, 3, 4]}
            castShadow={false}
          />
          <directionalLight intensity={0.4} position={[-3, 2, -2]} />
          <spotLight
            intensity={1.2}
            position={[0, 4, 3]}
            angle={0.5}
            penumbra={0.4}
          />
          <RobotModel />
          <Environment preset="city" />
          <OrbitControls
            enablePan={false}
            enableZoom={false}
            enableRotate={true}
            autoRotate={false}
            makeDefault={false}
            minPolarAngle={Math.PI / 2 - 0.4}
            maxPolarAngle={Math.PI / 2 + 0.2}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};

// Declaración GLTF para permitir el pre-load en build
useGLTF.preload("/Robot_footer.glb");
