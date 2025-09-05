// src/hooks/useNewsletter.ts
// ✨ HOOK ESPECIALIZADO PARA NEWSLETTER - REFACTORIZADO Y OPTIMIZADO

import { useState, useCallback } from "react";

interface NewsletterState {
  isSubmitting: boolean;
  message: string;
  messageType: "idle" | "loading" | "success" | "error";
}

export const useNewsletter = () => {
  const [state, setState] = useState<NewsletterState>({
    isSubmitting: false,
    message: "",
    messageType: "idle",
  });

  const validateEmail = useCallback((email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  }, []);

  const submitEmail = useCallback(
    async (email: string) => {
      if (!validateEmail(email)) {
        setState({
          isSubmitting: false,
          message: "Por favor, ingresa un correo electrónico válido.",
          messageType: "error",
        });
        return;
      }

      setState({
        isSubmitting: true,
        message: "Registrando tu correo...",
        messageType: "loading",
      });

      try {
        const googleScriptURL =
          "https://script.google.com/macros/s/AKfycbwxEGdjC28M49Fy1q4uaxMSfRo35jMvRBNI3R0XqDCfIREcyZWKQ9nbDPqOQy44xnHOIQ/exec";

        // Usar fetch con FormData para mejor compatibilidad
        const formData = new FormData();
        formData.append("email", email);

        await fetch(googleScriptURL, {
          method: "POST",
          body: formData,
        });

        // Asumir éxito si no hay error de red
        setState({
          isSubmitting: false,
          message: "✅ ¡Gracias! Te mantendremos informado.",
          messageType: "success",
        });

        // Auto-limpiar mensaje después de 5 segundos
        setTimeout(() => {
          setState((prev) => ({ ...prev, message: "", messageType: "idle" }));
        }, 5000);
      } catch (error) {
        setState({
          isSubmitting: false,
          message: "Error al registrar el correo. Inténtalo nuevamente.",
          messageType: "error",
        });
      }
    },
    [validateEmail]
  );

  const resetState = useCallback(() => {
    setState({
      isSubmitting: false,
      message: "",
      messageType: "idle",
    });
  }, []);

  return {
    ...state,
    submitEmail,
    resetState,
    validateEmail,
  };
};
