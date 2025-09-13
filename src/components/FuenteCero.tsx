// src/components/FuenteCero.tsx

import React, { useRef, useEffect } from "react";

// --- Tipos para la Simulación ---
interface Point {
  x: number;
  y: number;
}

// --- Hook para el Aura ---
// Aura ahora contenida dentro del CTA con coordenadas relativas
const useArchitectAura = (
  easingFactor: number = 0.025,
  parentRef: React.RefObject<HTMLElement>
) => {
  // Aura contenida dentro del CTA
  const [auraStyle, setAuraStyle] = React.useState<React.CSSProperties>({});
  const [cursorStyle, setCursorStyle] = React.useState<React.CSSProperties>({});
  const [mousePos, setMousePos] = React.useState<Point>({
    x: 0,
    y: 0,
  });
  const mouse = useRef<Point>({
    x: 0,
    y: 0,
  });
  const aura = useRef<Point>({
    x: 0,
    y: 0,
  });
  const prevMouse = useRef<Point>({
    x: 0,
    y: 0,
  });
  const animationFrameId = useRef<number>(0);

  useEffect(() => {
    // 🔧 OPTIMIZACIÓN: Un solo mouse listener con coordenadas relativas al CTA
    const handleMouseMove = (event: MouseEvent) => {
      if (!parentRef.current) return;

      const rect = parentRef.current.getBoundingClientRect();
      const relativeX = event.clientX - rect.left;
      const relativeY = event.clientY - rect.top;

      // Solo actualizar si el mouse está dentro del CTA
      if (
        relativeX >= 0 &&
        relativeX <= rect.width &&
        relativeY >= 0 &&
        relativeY <= rect.height
      ) {
        mouse.current = { x: relativeX, y: relativeY };
        setMousePos({ x: relativeX, y: relativeY }); // 🔧 RELATIVO: Coordenadas relativas al CTA
        setCursorStyle({
          transform: `translate(${relativeX}px, ${relativeY}px)`,
        });
      }
    };
    window.addEventListener("mousemove", handleMouseMove);

    const animate = () => {
      const dx = mouse.current.x - aura.current.x;
      const dy = mouse.current.y - aura.current.y;
      aura.current.x += dx * easingFactor;
      aura.current.y += dy * easingFactor;
      const speed = Math.min(
        Math.hypot(
          mouse.current.x - prevMouse.current.x,
          mouse.current.y - prevMouse.current.y
        ) / 15,
        1.5
      );

      setAuraStyle({
        transform: `translate(${aura.current.x}px, ${aura.current.y}px)`,
        // @ts-ignore: Permitir variable CSS personalizada
        "--mouse-speed": `${1 + speed}`,
      } as React.CSSProperties);
      prevMouse.current = { ...mouse.current };
      animationFrameId.current = requestAnimationFrame(animate);
    };
    animate();
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId.current);
    };
  }, [easingFactor, parentRef]);

  return { auraStyle, cursorStyle, auraPosition: aura.current, mousePos };
};

// --- Componente del Canvas de Matrix ---
const MatrixCanvas: React.FC<{
  auraPosition: Point;
  parentRef: React.RefObject<HTMLElement>;
}> = ({ auraPosition, parentRef }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Números, letras y símbolos de programación
  const characterSet = (
    "0123456789" +
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ" +
    "abcdefghijklmnopqrstuvwxyz" +
    "{}[]()<>;:,.=+-*/%&|!?" +
    "\"'#@^~$"
  ).split("");

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = parentRef.current;
    if (!canvas || !parent) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = parent.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform before scaling
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // --- Cambios solicitados ---
    // - Fuente VT323, tamaño más delgado
    // - Reducir tamaño otro 10%
    // - Aumentar velocidad de cambio
    // - Grupos de 5-8 caracteres por columna
    // - Estela corta y de apagado rápido, semitransparente, efecto luz
    const fontSize = 24.95 * 1.03 * 1.05; // aumento del 3% y luego 5% más
    const columns = Math.floor(parent.clientWidth / fontSize);
    // Aumentar la cantidad de caracteres por columna en un 20% adicional
    const minTrail = Math.round(5 * 1.45),
      maxTrail = Math.round(8 * 1.45);
    // Disminuir la velocidad de cambio de carácter en otro 20% adicional
    const changeTickLimit = 5.86 / 0.8; // era ~5.86, ahora ~7.33
    const rainDrops = Array.from({ length: columns }, () => {
      const trailLength =
        Math.floor(Math.random() * (maxTrail - minTrail + 1)) + minTrail;
      return {
        y: Math.floor((Math.random() * parent.clientHeight) / fontSize),
        chars: Array.from(
          { length: trailLength },
          () => characterSet[Math.floor(Math.random() * characterSet.length)]
        ),
        speed: Math.random() * 0.11 + 0.045,
        changeTick: Math.floor(Math.random() * changeTickLimit),
        trailLength,
      };
    });

    const draw = () => {
      const rect = parent.getBoundingClientRect();
      // --- Estela corta y de apagado rápido, semitransparente ---
      ctx.fillStyle = "rgba(0, 0, 0, 0.12)";
      ctx.globalCompositeOperation = "source-over";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < rainDrops.length; i++) {
        rainDrops[i].changeTick = (rainDrops[i].changeTick || 0) + 1;
        if (rainDrops[i].changeTick > changeTickLimit) {
          rainDrops[i].chars.pop();
          rainDrops[i].chars.unshift(
            characterSet[Math.floor(Math.random() * characterSet.length)]
          );
          rainDrops[i].changeTick = 0;
        }
        const x = i * fontSize;
        const relativeAuraX = auraPosition.x - rect.left;
        const relativeAuraY = auraPosition.y - rect.top;

        for (let t = 0; t < rainDrops[i].trailLength; t++) {
          const y = (rainDrops[i].y - t) * fontSize;
          if (y < 0 || y > parent.clientHeight) continue;
          const distToAura = Math.hypot(x - relativeAuraX, y - relativeAuraY);
          ctx.save();
          if (t === 0 && distToAura < 90) {
            // Carácter principal cerca del aura: efecto premium y dramático, tonos naranjos más oscuros
            const intensity = 1 - distToAura / 90;
            const highlightColor = `rgba(180, 90, 20, ${Math.min(
              intensity * 2.5,
              0.6
            )})`;
            const coreColor = `rgba(220, 140, 60, ${Math.min(
              intensity * 2.5,
              0.7
            )})`;
            ctx.globalCompositeOperation = "lighter";
            ctx.fillStyle = coreColor;
            ctx.shadowColor = highlightColor;
            ctx.shadowBlur = 32 * intensity;
            ctx.font = `normal ${
              fontSize + 10 * intensity
            }px 'VT323', monospace`;
            ctx.globalAlpha = 5.0;
          } else if (t === 0) {
            // Carácter principal lejos del aura: visible y oscuro
            ctx.globalAlpha = 0.32;
            ctx.fillStyle = "#232323"; // gris oscuro pero visible
            ctx.shadowColor = "transparent";
            ctx.shadowBlur = 0;
            ctx.font = `${fontSize}px 'VT323', monospace`;
          } else {
            // Estela corta y de apagado rápido, tonos más oscuros
            ctx.globalAlpha = Math.max(0.13 - t * 0.07, 0.03);
            ctx.fillStyle = "#101010";
            ctx.font = `${fontSize}px 'VT323', monospace`;
          }
          ctx.fillText(rainDrops[i].chars[t], x, y);
          ctx.restore();
        }
        // Velocidad diferenciada: cerca del aura cae más lento
        const yHead = rainDrops[i].y * fontSize;
        const distHeadToAura = Math.hypot(
          x - relativeAuraX,
          yHead - relativeAuraY
        );
        if (distHeadToAura < 90) {
          const intensity = 1 - distHeadToAura / 90;
          rainDrops[i].y +=
            rainDrops[i].speed * (0.25 + 0.75 * (1 - intensity)); // mucho más lento cerca del aura
        } else {
          rainDrops[i].y += rainDrops[i].speed;
        }
        if (rainDrops[i].y * fontSize > parent.clientHeight) {
          if (Math.random() > 0.99) {
            rainDrops[i].y = 0;
          }
        }
      }
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [auraPosition, parentRef]);

  return <canvas ref={canvasRef} className="matrix-canvas" />;
};

// --- Componente Visual del Aura ---
interface ChromaticAuraProps {
  style: React.CSSProperties;
}
const ChromaticAura: React.FC<ChromaticAuraProps> = ({ style }) => (
  <div className="aura-container" style={style}>
    <div className="aura-eco" id="eco1"></div>
    <div className="aura-eco" id="eco2"></div>
    <div className="aura-nucleo"></div>
  </div>
);

// --- Componente Principal "Fuente Cero" ---
const FuenteCero: React.FC<{ parentRef: React.RefObject<HTMLElement> }> = ({
  parentRef,
}) => {
  // 🔧 OPTIMIZACIÓN: Eliminar estado duplicado - ahora viene del hook unificado con contención del CTA
  const { auraStyle, auraPosition, mousePos } = useArchitectAura(
    0.06,
    parentRef
  );

  return (
    <div className="fuente-cero-container">
      <style>{`
        html, body, #root, .rebecca-container, .fuente-cero-container {
            background: #000 !important;
            min-width: 100vw !important;
            min-height: 100vh !important;
        }

        .fuente-cero-container {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            /* Fondo negro puro en el centro, degradado premium y sutil a gris oscuro en los bordes */
            background:
              linear-gradient(
                to bottom,
                #000 0%,
                #181818 40%,
                #232323 60%,
                #fff 100%
              );
            /* Degradado vertical, transición a blanco comienza más arriba */
        }

        .matrix-canvas {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 1;
        }

        .aura-container {
          position: absolute; /* 🎯 CAMBIADO: De 'fixed' a 'absolute' para contención dentro del CTA */
          top: -170px;
          left: -170px;
          width: 340px;
          height: 340px;
          pointer-events: none;
          z-index: 2;
        }
        .aura-nucleo, .aura-eco {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }
        .aura-nucleo {
          filter: blur(38px) saturate(1.1);
          background: radial-gradient(circle, rgba(180, 90, 20, 0.16) 0%, rgba(40, 30, 20, 0.18) 60%, transparent 100%);
          animation: cinematic-glow 10s infinite ease-in-out, morph-shape 14s infinite ease-in-out;
        }
        .aura-eco {
          filter: blur(22px) saturate(1.2);
          transform-origin: center center;
        }
        #eco1 {
          background: radial-gradient(circle, rgba(180, 90, 20, 0.16) 0%, rgba(40, 30, 20, 0.12) 60%, transparent 100%);
          animation: orbit 7s linear infinite, morph-shape 12s infinite ease-in-out reverse;
        }
        #eco2 {
          background: radial-gradient(circle, rgba(120, 120, 120, 0.10) 0%, rgba(40, 30, 20, 0.09) 60%, transparent 100%);
          animation: orbit 9s -4s linear infinite reverse, morph-shape 10s infinite ease-in-out;
        }
        .aura-cursor-dot-global {
          position: absolute; /* 🎯 CAMBIADO: De 'fixed' a 'absolute' para contención dentro del CTA */
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255, 220, 120, 1) 0%, rgba(255, 130, 0, 0.5) 60%, transparent 100%);
          box-shadow: 0 0 8px 2px rgba(255, 220, 120, 0.5);
          z-index: 9999;
          pointer-events: none;
        }
      `}</style>
      <MatrixCanvas auraPosition={auraPosition} parentRef={parentRef} />
      <ChromaticAura style={auraStyle} />
      {/* Punto luminoso contenido dentro del CTA, posición absolute */}
      <div
        className="aura-cursor-dot-global"
        style={{
          position:
            "absolute" /* 🎯 CAMBIADO: De 'fixed' a 'absolute' para contención */,
          left: mousePos.x + "px",
          top: mousePos.y + "px",
          width: "5px",
          height: "5px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255, 220, 120, 1) 0%, rgba(255, 130, 0, 0.5) 60%, transparent 100%)",
          boxShadow: "0 0 8px 2px rgba(255, 220, 120, 0.5)",
          zIndex: 9999,
          pointerEvents: "none",
        }}
      ></div>
    </div>
  );
};

export default FuenteCero;
