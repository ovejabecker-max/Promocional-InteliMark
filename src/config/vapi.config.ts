import type { VapiConfig } from "../types/vapi";

// Configuración simplificada que usa tu asistente pre-configurado en Vapi
export const vapiConfig: VapiConfig = {
  // Solo credenciales - El asistente está configurado en tu dashboard de Vapi
  publicKey:
    import.meta.env.VITE_VAPI_PUBLIC_KEY ||
    "8da5a082-ebd4-4894-8c60-625beb1aa32c",
  assistantId:
    import.meta.env.VITE_VAPI_ASSISTANT_ID ||
    "8a540a3e-e5f2-43c9-a398-723516f8bf80",
  // Configuración de reconexión automática
  autoReconnect: {
    enabled: true,
    maxAttempts: 3,
    initialDelay: 2000, // 2 segundos
    maxDelay: 8000, // 8 segundos
    backoffFactor: 2, // Duplicar delay en cada intento
  },
};

// Configuración para desarrollo (usa el mismo asistente)
export const vapiConfigDev: VapiConfig = {
  publicKey:
    import.meta.env.VITE_VAPI_PUBLIC_KEY ||
    "8da5a082-ebd4-4894-8c60-625beb1aa32c",
  assistantId:
    import.meta.env.VITE_VAPI_ASSISTANT_ID ||
    "8a540a3e-e5f2-43c9-a398-723516f8bf80",
  // Configuración de reconexión más agresiva para desarrollo
  autoReconnect: {
    enabled: true,
    maxAttempts: 5,
    initialDelay: 1000, // 1 segundo
    maxDelay: 5000, // 5 segundos
    backoffFactor: 1.5, // Crecimiento más gradual
  },
};
