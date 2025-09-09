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
  });

  const vapiRef = useRef<Vapi | null>(null);
  const volumeTimeoutRef = useRef<number | null>(null);

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
    });

    vapi.on("message", (_message: VapiMessage) => {
      // User started speaking
    });

    vapi.on("speech-end", () => {
      // User stopped speaking
    });

    vapi.on("message", (message: VapiMessage) => {
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
      }
      if (
        message.type === "transcript" &&
        message.transcriptType === "partial"
      ) {
        setCallStatus((prev) => ({
          ...prev,
          activeTranscript: message.transcript,
        }));
      }
    });

    vapi.on("error", (_error: Error) => {
      setCallStatus((prev) => ({
        ...prev,
        status: "inactive",
      }));
    });

    return () => {
      if (vapi) {
        vapi.stop();
        if (volumeTimeoutRef.current) {
          clearTimeout(volumeTimeoutRef.current);
        }
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
    start,
    stop,
    toggleCall,
    messages: callStatus.messages,
    activeTranscript: callStatus.activeTranscript || "",
  };
};
