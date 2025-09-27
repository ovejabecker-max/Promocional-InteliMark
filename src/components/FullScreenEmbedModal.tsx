import React, { useEffect, useRef, useState } from "react";
import "./FullScreenEmbedModal.css";

interface FullScreenEmbedModalProps {
  isOpen: boolean;
  onClose: () => void;
  src: string; // URL a cargar, ej: /home-embed
}

export const FullScreenEmbedModal: React.FC<FullScreenEmbedModalProps> = ({
  isOpen,
  onClose,
  src,
}) => {
  const [ready, setReady] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Bloquear scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      // doble rAF para permitir animación de entrada
      requestAnimationFrame(() => requestAnimationFrame(() => setReady(true)));
      return () => {
        document.body.style.overflow = prev;
        setReady(false);
      };
    } else {
      setReady(false);
    }
  }, [isOpen]);

  // Cerrar con ESC
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fs-embed-overlay" role="dialog" aria-modal="true">
      <button className="fs-embed-close" aria-label="Cerrar" onClick={onClose}>
        ✕
      </button>
      <div className={`fs-embed-modal ${ready ? "ready" : "pre"}`}>
        <iframe
          ref={iframeRef}
          src={src}
          title="Vista embebida"
          className="fs-embed-frame"
          loading="eager"
          // sandbox para seguridad: permitir solo lo necesario
          sandbox="allow-same-origin allow-scripts allow-forms allow-pointer-lock"
          // política de permisos reducida
          allow="fullscreen; accelerometer; gyroscope; clipboard-read; clipboard-write"
        />
      </div>
    </div>
  );
};

export default FullScreenEmbedModal;
