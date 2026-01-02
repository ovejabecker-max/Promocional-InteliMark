// src/hooks/useNewsletter.ts
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
        // REEMPLAZA ESTA URL CON LA QUE COPIASTE EN EL PASO ANTERIOR
        const googleScriptURL = "https://script.google.com/macros/s/AKfycbxaol_emXs2-nZBRXaHWIjK9mRyCtEplevYdEZhpvsDpPP4gfjX9wV1tTb5CK_81D2p/exec";

        const formData = new FormData();
        formData.append("email", email);

        // MEJORA: Uso de 'mode: no-cors' para evitar bloqueos de navegador con Google Scripts
        // si solo necesitas enviar el dato y no leer un JSON de vuelta.
        await fetch(googleScriptURL, {
          method: "POST",
          body: formData,
          mode: "no-cors",
        });

        // Al usar no-cors, no podemos leer el body, pero si llegamos aquí, 
        // la petición salió del navegador hacia Google.
        setState({
          isSubmitting: false,
          message: "✅ ¡Gracias! Te mantendremos informado.",
          messageType: "success",
        });

        setTimeout(() => {
          setState((prev) => ({ ...prev, message: "", messageType: "idle" }));
        }, 5000);

      } catch (error) {
        console.error("Newsletter Error:", error);
        setState({
          isSubmitting: false,
          message: "Error de conexión. Inténtalo nuevamente.",
          messageType: "error",
        });
      }
    },
    [validateEmail]
  );

  const resetState = useCallback(() => {
    setState({ isSubmitting: false, message: "", messageType: "idle" });
  }, []);

  return { ...state, submitEmail, resetState, validateEmail };
};