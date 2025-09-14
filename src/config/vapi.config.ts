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

// Configuración para desarrollo - requiere variables de entorno
export const vapiConfigDev: VapiConfig = {
  publicKey: import.meta.env.VITE_VAPI_PUBLIC_KEY!,
  assistantId: import.meta.env.VITE_VAPI_ASSISTANT_ID!,
  // Configuración de reconexión más agresiva para desarrollo
  autoReconnect: {
    enabled: true,
    maxAttempts: 5,
    initialDelay: 1000, // 1 segundo
    maxDelay: 5000, // 5 segundos
    backoffFactor: 1.5, // Crecimiento más gradual
  },
};

// Función para validar configuración
const validateConfig = (config: VapiConfig, environment: string): boolean => {
  const missingVars: string[] = [];

  if (!config.publicKey) {
    missingVars.push("VITE_VAPI_PUBLIC_KEY");
  }
  if (!config.assistantId) {
    missingVars.push("VITE_VAPI_ASSISTANT_ID");
  }

  if (missingVars.length > 0) {
    logger.error(
      `Variables de entorno faltantes para ${environment}: ${missingVars.join(
        ", "
      )}`
    );
    logger.error(
      "Por favor, crea un archivo .env con las variables necesarias o configúralas en tu entorno"
    );
    return false;
  }

  logger.info(`Configuración de ${environment} validada correctamente`);
  return true;
};

// Selección automática de configuración basada en el entorno
const selectConfig = (): VapiConfig => {
  const isDevelopment = import.meta.env.DEV;

  if (isDevelopment) {
    logger.debug("Usando configuración de desarrollo");
    if (!validateConfig(vapiConfigDev, "desarrollo")) {
      throw new Error(
        "Configuración de desarrollo inválida: faltan variables de entorno requeridas"
      );
    }
    return vapiConfigDev;
  } else {
    logger.info("Usando configuración de producción");
    if (!validateConfig(vapiConfigProd, "producción")) {
      throw new Error(
        "Configuración de producción inválida: faltan variables de entorno requeridas"
      );
    }
    return vapiConfigProd;
  }
};

// Configuración principal que se auto-selecciona según el entorno
export const vapiConfig: VapiConfig = selectConfig();
