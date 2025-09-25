import { useRef, useMemo, memo, useCallback } from "react";
import type { FC } from "react";
import { Text } from "@react-three/drei";
import * as THREE from "three";

interface AnimatedTextPhrase1Props {
  scrollPercentage: number;
  textScale?: number; // ✅ RESPONSIVE: Prop opcional para scaling
}

const AnimatedTextPhrase1: FC<AnimatedTextPhrase1Props> = memo(
  ({ scrollPercentage, textScale = 1 }) => {
    // ✅ RESPONSIVE: Default scale 1
    const groupRef = useRef<THREE.Group>(null!);

    // Función para calcular opacidad basada en rango de scroll
    const calculateOpacity = useCallback(
      (start: number, end: number): number => {
        if (scrollPercentage < start) return 0;
        if (scrollPercentage > end) return 1;
        return (scrollPercentage - start) / (end - start);
      },
      [scrollPercentage]
    );

    // Calcular opacidades para cada línea - SIN EFECTOS DE GLITCH
    const opacidades = useMemo(() => {
      return {
        line1: {
          // Línea 1: fade-in del 12% al 15%
          opacity:
            scrollPercentage < 12 ? 0 : Math.min(1, calculateOpacity(12, 15)),
        },
        line2: {
          // Línea 2: fade-in del 22% al 27%
          opacity: calculateOpacity(22, 27),
        },
        line3: {
          // Línea 3: fade-in del 27% al 36%
          opacity: calculateOpacity(27, 36),
        },
      };
    }, [scrollPercentage, calculateOpacity]);

    // ✅ RESPONSIVE: Calcular tamaños de fuente adaptivos
    const fontSizes = useMemo(
      () => ({
        line1: 1.2 * textScale,
        line2: 1.2 * textScale,
        line3: 1.2 * textScale,
      }),
      [textScale]
    );

    return (
      <group ref={groupRef}>
        {/* Línea 1: Texto principal - SIN EFECTOS */}
        <Text
          position={[0, 8, -46]}
          fontSize={fontSizes.line1}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          material-transparent={true}
          material-opacity={opacidades.line1.opacity}
        >
          EL FUTURO DE LA INGENIERÍA EXIGE UNA NUEVA IA.
        </Text>

        {/* Línea 2: Fade-in simple - SIN EFECTOS */}
        <Text
          position={[0, 5, -47]}
          fontSize={fontSizes.line2}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          material-transparent={true}
          material-opacity={opacidades.line2.opacity}
        >
          LA ESTAMOS CONSTRUYENDO.
        </Text>

        {/* Línea 3: Fade-in simple - SIN EFECTOS */}
        <Text
          position={[0, 2, -48]}
          fontSize={fontSizes.line3}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          material-transparent={true}
          material-opacity={opacidades.line3.opacity}
        >
          ¡VUELVE PRONTO Y DESCÚBRELA!
        </Text>
      </group>
    );
  }
);

AnimatedTextPhrase1.displayName = "AnimatedTextPhrase1";

export default AnimatedTextPhrase1;
