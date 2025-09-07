// src/components/NewsletterForm.tsx
// ✨ COMPONENTE NEWSLETTER REFACTORIZADO - SISTEMA SIMPLIFICADO

import React, { useState } from "react";
import { useNewsletter } from "../hooks/useNewsletter";

export const NewsletterForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const { isSubmitting, message, messageType, submitEmail } = useNewsletter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitEmail(email);
    if (messageType === "success") {
      setEmail(""); // Limpiar input solo en caso de éxito
    }
  };

  const getMessageStyles = () => {
    switch (messageType) {
      case "loading":
        return { color: "white" };
      case "success":
        return { color: "#7CFC00" };
      case "error":
        return { color: "#ffcc00" };
      default:
        return { color: "transparent" };
    }
  };

  return (
    <div className="newsletter-section">
      <h4>MANTENTE ACTUALIZADO</h4>
      <h3>
        suscríbete a<br />
        nuestro boletín
      </h3>
      <p>
        Recibe las últimas novedades de nuestra fecha de lanzamiento y los
        increíbles descuentos y regalos que tenemos para ti.
      </p>

      <form className="newsletter-form" onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="newsletter-input"
          placeholder="Tu correo electrónico"
          disabled={isSubmitting}
          required
        />
        <button
          type="submit"
          className="newsletter-button modern-arrow-button"
          disabled={isSubmitting}
        >
          <div className="button-background">
            <div className="metallic-surface"></div>
          </div>
          <div className="arrow-container">
            <svg className="arrow-icon" viewBox="0 0 42 30" fill="none">
              <defs>
                {/* Gradientes premium para renderizado de alta calidad */}
                <linearGradient
                  id="arrowGradientPremium"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                >
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                  <stop offset="50%" stopColor="#f8f9fa" stopOpacity="0.98" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0.95" />
                </linearGradient>
                <filter id="dropShadowPremium">
                  <feDropShadow
                    dx="0"
                    dy="1"
                    stdDeviation="1"
                    floodColor="#000000"
                    floodOpacity="0.3"
                  />
                </filter>
              </defs>
              <g className="arrow-group">
                <path
                  d="M12 8L20 15L12 22"
                  stroke="url(#arrowGradientPremium)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  filter="url(#dropShadowPremium)"
                  className="main-arrow"
                />
                <circle
                  cx="20"
                  cy="15"
                  r="1.5"
                  fill="url(#arrowGradientPremium)"
                  className="arrow-point"
                  opacity="0.8"
                />
                <path
                  d="M8 8L16 15L8 22"
                  stroke="url(#arrowGradientPremium)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  className="secondary-arrow"
                  opacity="0.4"
                />
                <g className="energy-lines" opacity="0">
                  <line
                    x1="5"
                    y1="10"
                    x2="25"
                    y2="10"
                    stroke="#ffffff"
                    strokeWidth="0.2"
                    strokeLinecap="round"
                    className="energy-line"
                    opacity="0"
                  />
                  <line
                    x1="5"
                    y1="15"
                    x2="25"
                    y2="15"
                    stroke="#ffffff"
                    strokeWidth="0.3"
                    strokeLinecap="round"
                    className="energy-line"
                    opacity="0"
                  />
                  <line
                    x1="5"
                    y1="20"
                    x2="25"
                    y2="20"
                    stroke="#ffffff"
                    strokeWidth="0.2"
                    strokeLinecap="round"
                    className="energy-line"
                    opacity="0"
                  />
                </g>
              </g>
            </svg>
          </div>
          <div className="neon-glow center-absolute"></div>
        </button>
      </form>

      <p
        className="newsletter-message"
        style={{
          ...getMessageStyles(),
          minHeight: "24px",
          marginTop: "16px",
          fontSize: "1rem",
          fontWeight: "500",
          transition: "all 0.3s ease",
          opacity: message ? 1 : 0,
          fontFamily: '"Oxanium", sans-serif',
        }}
      >
        {message}
      </p>
    </div>
  );
};
