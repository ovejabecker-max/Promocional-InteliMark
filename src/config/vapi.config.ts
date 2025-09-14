import type { VapiConfig } from "../types/vapi";
import { logger } from "../utils/logger";

// Configuración para producción
export const vapiConfigProd: VapiConfig = {
  // Solo variables de entorno - NO valores hardcodeados
  publicKey: import.meta.env.VITE_VAPI_PUBLIC_KEY!,
  assistantId: import.meta.env.VITE_VAPI_ASSISTANT_ID!,
  // Configuración de reconexión más conservadora para producción
  autoReconnect: {
    enabled: true,
    maxAttempts: 3,
    initialDelay: 3000, // 3 segundos
    maxDelay: 15000, // 15 segundos
    backoffFactor: 2, // Duplicar delay en cada intento
  },
};

// Configuración para desarrollo (mantiene fallbacks para facilitar desarrollo)
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

// Función para validar configuración de producción
const validateProdConfig = (config: VapiConfig): boolean => {
  if (!config.publicKey) {
    logger.error("VITE_VAPI_PUBLIC_KEY no está definida");
    return false;
  }
  if (!config.assistantId) {
    logger.error("VITE_VAPI_ASSISTANT_ID no está definida");
    return false;
  }
  return true;
};

// Selección automática de configuración basada en el entorno
const selectConfig = (): VapiConfig => {
  const isDevelopment = import.meta.env.DEV;

  if (isDevelopment) {
    logger.debug("Usando configuración de desarrollo");
    return vapiConfigDev;
  } else {
    logger.info("Usando configuración de producción");
    if (!validateProdConfig(vapiConfigProd)) {
      logger.warn(
        "Configuración de producción inválida, usando desarrollo como fallback"
      );
      return vapiConfigDev;
    }
    return vapiConfigProd;
  }
};

// Configuración principal que se auto-selecciona según el entorno
export const vapiConfig: VapiConfig = selectConfig();
