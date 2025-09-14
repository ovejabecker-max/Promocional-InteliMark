import { useState, useEffect, useCallback, useRef } from "react";
import Vapi from "@vapi-ai/web";
import type { VapiConfig, VapiCallStatus, VapiHookReturn } from "../types/vapi";

interface VapiMessage {
  type?: string;
  role?: string;
  content?: string;
  transcriptType?: string;
  transcript?: string;
}

export const useVapi = (config: VapiConfig): VapiHookReturn => {
  const [callStatus, setCallStatus] = useState<VapiCallStatus>({
    status: "inactive",
    messages: [],
    activeTranscript: "",
    isUserSpeaking: false,
  });

  const [assistantVolume, setAssistantVolume] = useState<number>(0);

  const vapiRef = useRef<Vapi | null>(null);

  useEffect(() => {
    vapiRef.current = new Vapi(config.publicKey);
    const vapi = vapiRef.current;

    vapi.on("call-start", () => {
      setCallStatus((prev) => ({ ...prev, status: "active" }));
    });

    vapi.on("call-end", () => {
      setCallStatus((prev) => ({
        ...prev,
        status: "inactive",
        activeTranscript: "",
      }));
      setAssistantVolume(0); // Reset volume when call ends
    });

    vapi.on("speech-start", () => {
      // User started speaking - evento específico para cuando el usuario habla
      setCallStatus((prev) => ({
        ...prev,
        isUserSpeaking: true,
      }));
    });

    vapi.on("speech-end", () => {
      // User stopped speaking - evento específico para cuando el usuario para de hablar
      setCallStatus((prev) => ({
        ...prev,
        isUserSpeaking: false,
      }));
    });

    // Consolidado: Un solo handler para todos los mensajes de Vapi
    vapi.on("message", (message: VapiMessage) => {
      // Manejar mensajes del asistente
      if (
        message.type === "assistant-message" ||
        (message.role === "assistant" && message.content)
      ) {
        if (message.role && message.content) {
          setCallStatus((prev) => ({
            ...prev,
            messages: [
              ...(prev.messages || []),
              {
                role: message.role as string,
                content: message.content as string,
                timestamp: new Date(),
              },
            ],
          }));
        }
        // Simular volumen cuando el asistente habla
        setAssistantVolume(0.8); // Volume spike when assistant speaks
      }

      // Manejar transcripciones parciales
      if (
        message.type === "transcript" &&
        message.transcriptType === "partial"
      ) {
        setCallStatus((prev) => ({
          ...prev,
          activeTranscript: message.transcript,
        }));
      }

      // Si es una transcripción final del asistente, reducir volumen gradualmente
      if (
        message.type === "transcript" &&
        message.transcriptType === "final" &&
        message.role === "assistant"
      ) {
        // Gradual volume fade after assistant finishes speaking
        setTimeout(() => setAssistantVolume(0.3), 500);
        setTimeout(() => setAssistantVolume(0.1), 1000);
        setTimeout(() => setAssistantVolume(0), 1500);
      }
    });

    vapi.on("error", (_error: Error) => {
      setCallStatus((prev) => ({
        ...prev,
        status: "inactive",
      }));
      setAssistantVolume(0); // Reset volume on error
    });

    return () => {
      if (vapi) {
        vapi.stop();
      }
    };
  }, [config.publicKey]);

  const start = useCallback(async () => {
    try {
      setCallStatus((prev) => ({ ...prev, status: "loading" }));
      const assistantId =
        config.assistantId ||
        import.meta.env.VITE_VAPI_ASSISTANT_ID ||
        "8a540a3e-e5f2-43c9-a398-723516f8bf80";
      // Starting call with Assistant ID
      await vapiRef.current?.start(assistantId);
    } catch (error) {
      // Handle error by setting status to inactive
      setCallStatus((prev) => ({ ...prev, status: "inactive" }));
    }
  }, [config.assistantId]);

  const stop = useCallback(() => {
    try {
      // Stopping call manually
      vapiRef.current?.stop();
    } catch (error) {
      setCallStatus((prev) => ({ ...prev, status: "inactive" }));
    }
  }, []);

  const toggleCall = useCallback(() => {
    if (callStatus.status === "active") {
      stop();
    } else if (callStatus.status === "inactive") {
      start();
    }
  }, [callStatus.status, start, stop]);

  return {
    isSessionActive: callStatus.status === "active",
    isLoading: callStatus.status === "loading",
    isUserSpeaking: callStatus.isUserSpeaking || false,
    assistantVolume,
    start,
    stop,
    toggleCall,
    messages: callStatus.messages,
    activeTranscript: callStatus.activeTranscript || "",
  };
};
