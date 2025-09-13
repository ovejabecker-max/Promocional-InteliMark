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
        <img src={backgroundImage} alt="Créditos" className="credits-image" />
      </div>
    </div>
  );
};

export default SimpleCreditsModal;
