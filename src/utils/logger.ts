/**
 * Logger utility para manejar logs de manera inteligente
 * Elimina automáticamente console.logs en producción
 */

interface Logger {
  info: (message: string, ...args: unknown[]) => void;
  warn: (message: string, ...args: unknown[]) => void;
  error: (message: string, ...args: unknown[]) => void;
  debug: (message: string, ...args: unknown[]) => void;
}

const isDevelopment = import.meta.env.DEV;

const createLogger = (): Logger => {
  const noop = () => {}; // No operation for production

  return {
    // eslint-disable-next-line no-console
    info: isDevelopment ? console.info : noop,
    // eslint-disable-next-line no-console
    warn: isDevelopment ? console.warn : noop,
    // eslint-disable-next-line no-console
    error: console.error, // Errores siempre visibles
    // eslint-disable-next-line no-console
    debug: isDevelopment ? console.debug : noop,
  };
};

export const logger = createLogger();

// Funciones helper con prefijos específicos
export const vapiLogger = {
  info: (message: string, ...args: unknown[]) =>
    logger.info(`🤖 Vapi: ${message}`, ...args),
  warn: (message: string, ...args: unknown[]) =>
    logger.warn(`⚠️ Vapi: ${message}`, ...args),
  error: (message: string, ...args: unknown[]) =>
    logger.error(`❌ Vapi: ${message}`, ...args),
};

export const animationLogger = {
  info: (message: string, ...args: unknown[]) =>
    logger.info(`🎬 Animation: ${message}`, ...args),
  warn: (message: string, ...args: unknown[]) =>
    logger.warn(`⚠️ Animation: ${message}`, ...args),
  error: (message: string, ...args: unknown[]) =>
    logger.error(`❌ Animation: ${message}`, ...args),
};

export const audioLogger = {
  info: (message: string, ...args: unknown[]) =>
    logger.info(`🔊 Audio: ${message}`, ...args),
  warn: (message: string, ...args: unknown[]) =>
    logger.warn(`⚠️ Audio: ${message}`, ...args),
  error: (message: string, ...args: unknown[]) =>
    logger.error(`❌ Audio: ${message}`, ...args),
};
