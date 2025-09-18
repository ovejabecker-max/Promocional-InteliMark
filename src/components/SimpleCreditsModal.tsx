// src/components/SimpleCreditsModal.tsx

import React from "react";
import "./SimpleCreditsModal.css";

interface SimpleCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
  backgroundImage: string;
}

export const SimpleCreditsModal: React.FC<SimpleCreditsModalProps> = ({
  isOpen,
  onClose,
  backgroundImage,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="simple-credits-overlay"
      onClick={onClose}
      style={{ cursor: "pointer" }}
    >
      <div className="simple-credits-modal">
        <img
          src={backgroundImage}
          alt="Marco tecnológico de créditos"
          className="credits-image"
        />
        {/* Capa de créditos animados */}
        <div
          className="credits-text-layer"
          aria-label="Listado de créditos"
          role="group"
        >
          <div className="credits-viewport">
            <div
              className="credits-fade credits-fade-top"
              aria-hidden="true"
            ></div>
            <div
              className="credits-fade credits-fade-bottom"
              aria-hidden="true"
            ></div>
            <div className="credits-track">
              {/* Bloques de créditos */}
              <div className="credit-block">
                <h5 className="credit-role">DIRECTOR CREATIVO</h5>
                <p className="credit-name">Pablo Carrasco</p>
              </div>
              <div className="credit-block">
                <h5 className="credit-role">DISEÑADOR UX/UI</h5>
                <p className="credit-name">Pablo Carrasco</p>
              </div>
              <div className="credit-block">
                <h5 className="credit-role">DESARROLLADOR FRONTEND</h5>
                <p className="credit-name">Pablo Carrasco</p>
              </div>
              <div className="credit-block">
                <h5 className="credit-role">DESARROLLADOR BACKEND</h5>
                <p className="credit-name">Pablo Carrasco</p>
              </div>
              <div className="credit-block">
                <h5 className="credit-role">ARTISTA 3D</h5>
                <p className="credit-name">Pablo Carrasco</p>
              </div>
              <div className="credit-block">
                <h5 className="credit-role">DISEÑADOR DE SONIDO</h5>
                <p className="credit-name">Pablo Carrasco</p>
              </div>
              <div className="credit-block">
                <h5 className="credit-role">DIRECTOR DE ARTE</h5>
                <p className="credit-name">Pablo Carrasco · Sandra Gangas</p>
              </div>
              <div className="credit-block">
                <h5 className="credit-role">ESPECIALISTA SEO</h5>
                <p className="credit-name">Pablo Carrasco</p>
              </div>
              <div className="credit-block">
                <h5 className="credit-role">ESTRATEGA DE IA</h5>
                <p className="credit-name">Pablo Carrasco</p>
              </div>
              <div className="credit-block">
                <h5 className="credit-role">DISEÑADOR GRÁFICO</h5>
                <p className="credit-name">Sandra Gangas</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleCreditsModal;
