import { useEffect, useRef } from "react";
import "./CadCursor.css";

type CadCursorProps = {
  color?: string; // Color del cursor (por defecto: naranja InteliMark)
  thickness?: number; // Grosor de las líneas en px
  squareSize?: number; // Tamaño del cuadrado central en px
  /**
   * Si se entrega, el cursor solo se mostrará cuando el puntero esté dentro de este contenedor.
   * Útil para aislar el comportamiento a la página Rebecca.
   */
  containerSelector?: string;
};

/**
 * Cursor estilo AutoCAD: líneas infinitas horizontal/vertical con un cuadrado central.
 * Las líneas se detienen exactamente en los bordes del cuadrado (no ingresan al interior).
 * Implementación performante: se actualizan variables CSS (sin re-render reactivo por movimiento).
 */
export default function CadCursor({
  color,
  thickness,
  squareSize,
  containerSelector = ".rebecca-container",
}: CadCursorProps) {
  const overlayRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const overlay = overlayRef.current!;
    // Setear variables iniciales solo si se proveen por props
    if (typeof color !== "undefined") {
      overlay.style.setProperty("--cursor-color", color);
    }
    if (typeof thickness !== "undefined") {
      overlay.style.setProperty("--line-thickness", `${thickness}px`);
    }
    if (typeof squareSize !== "undefined") {
      overlay.style.setProperty("--square-size", `${squareSize}px`);
    }

    const container: Element | null = document.querySelector(containerSelector);

    let raf = 0;
    let x = 0;
    let y = 0;

    const update = () => {
      raf = 0;
      overlay.style.setProperty("--x", `${x}px`);
      overlay.style.setProperty("--y", `${y}px`);
    };

    const inCTASection = (cx: number, cy: number) => {
      const el = document.elementFromPoint(cx, cy);
      return (
        !!el &&
        (!!el.closest("#cta-section") ||
          !!el.closest(".call-to-action-section"))
      );
    };

    const inContainer = (cx: number, cy: number) => {
      if (!container) return true; // si no hay selector, mostrar siempre
      const rect = (container as HTMLElement).getBoundingClientRect();
      return (
        cx >= rect.left &&
        cx <= rect.right &&
        cy >= rect.top &&
        cy <= rect.bottom
      );
    };

    const onMove = (e: MouseEvent) => {
      x = e.clientX;
      y = e.clientY;

      // Mostrar/ocultar según zona activa
      const visible = inContainer(x, y) && !inCTASection(x, y);
      overlay.style.opacity = visible ? "1" : "0";

      if (!raf) raf = requestAnimationFrame(update);
    };

    const onLeave = () => {
      overlay.style.opacity = "0";
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);
    window.addEventListener("blur", onLeave);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("blur", onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [color, thickness, squareSize, containerSelector]);

  return (
    <div className="cad-cursor-overlay" ref={overlayRef} aria-hidden="true">
      {/* Segmentos horizontales */}
      <div className="cad-line h left" />
      <div className="cad-line h right" />

      {/* Segmentos verticales */}
      <div className="cad-line v top" />
      <div className="cad-line v bottom" />

      {/* Cuadrado central */}
      <div className="cad-cursor-square" />
    </div>
  );
}
