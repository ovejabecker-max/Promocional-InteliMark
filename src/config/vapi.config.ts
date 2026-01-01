import type { VapiConfig } from "../types/vapi";
import { logger } from "../utils/logger";

// Configuración para producción
export const vapiConfigProd: VapiConfig = {
  // Solo variables de entorno - NO valores hardcodeados
  publicKey: import.meta.env.VITE_VAPI_PUBLIC_KEY!,
  assistantId: import.meta.env.VITE_VAPI_ASSISTANT_ID!,
  // Reconexión automática DESACTIVADA - solo conexión manual por clic del usuario
  autoReconnect: {
    enabled: false,
    maxAttempts: 0,
    initialDelay: 3000,
    maxDelay: 15000,
    backoffFactor: 2,
  },
};

// Configuración para desarrollo - requiere variables de entorno
export const vapiConfigDev: VapiConfig = {
  publicKey: import.meta.env.VITE_VAPI_PUBLIC_KEY!,
  assistantId: import.meta.env.VITE_VAPI_ASSISTANT_ID!,
  // Reconexión automática DESACTIVADA - solo conexión manual por clic del usuario
  autoReconnect: {
    enabled: false,
    maxAttempts: 0,
    initialDelay: 1000,
    maxDelay: 5000,
    backoffFactor: 1.5,
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
