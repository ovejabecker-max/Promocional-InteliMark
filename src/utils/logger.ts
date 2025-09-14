/**
 * Sistema de logging unificado para toda la aplicación
 * Maneja logs de manera inteligente según el entorno
 */

interface Logger {
  info: (
    message: string,
    error?: Error,
    context?: Record<string, unknown>
  ) => void;
  warn: (message: string, context?: Record<string, unknown>) => void;
  error: (
    message: string,
    error?: Error,
    context?: Record<string, unknown>
  ) => void;
  debug: (message: string, context?: Record<string, unknown>) => void;
}

const isDevelopment = import.meta.env.DEV;

class UnifiedLogger implements Logger {
  private sendToLoggingService(
    _level: string,
    _message: string,
    _error?: Error,
    _context?: Record<string, unknown>
  ) {
    // TODO: Integrar con servicio de logging como Sentry, LogRocket, etc.
    // Por ahora, solo en desarrollo
    if (isDevelopment && _level === "error") {
      // Simular envío a servicio de logging
      // console.log(`📡 Would send to logging service:`, {
      //   level: _level, message: _message, error: _error?.message, stack: _error?.stack,
      //   context: _context, timestamp: new Date().toISOString(),
      //   userAgent: navigator.userAgent, url: window.location.href,
      // });
    }
  }

  info(message: string, error?: Error, context?: Record<string, unknown>) {
    if (isDevelopment) {
      // eslint-disable-next-line no-console
      console.info(`[INFO] ${message}`, { error, context });
    }
    this.sendToLoggingService("info", message, error, context);
  }

  warn(message: string, context?: Record<string, unknown>) {
    if (isDevelopment) {
      // eslint-disable-next-line no-console
      console.warn(`[WARN] ${message}`, { context });
    }
    this.sendToLoggingService("warn", message, undefined, context);
  }

  error(message: string, error?: Error, context?: Record<string, unknown>) {
    // Errores siempre visibles
    // eslint-disable-next-line no-console
    console.error(`[ERROR] ${message}`, { error, context });
    this.sendToLoggingService("error", message, error, context);
  }

  debug(message: string, context?: Record<string, unknown>) {
    if (isDevelopment) {
      // eslint-disable-next-line no-console
      console.debug(`[DEBUG] ${message}`, { context });
    }
  }
}

export const logger = new UnifiedLogger();

// Funciones helper especializadas con prefijos específicos
export const vapiLogger = {
  info: (message: string, context?: Record<string, unknown>) =>
    logger.info(`🤖 Vapi: ${message}`, undefined, context),
  warn: (message: string, context?: Record<string, unknown>) =>
    logger.warn(`⚠️ Vapi: ${message}`, context),
  error: (message: string, error?: Error, context?: Record<string, unknown>) =>
    logger.error(`❌ Vapi: ${message}`, error, context),
  debug: (message: string, context?: Record<string, unknown>) =>
    logger.debug(`🤖 Vapi: ${message}`, context),
};

export const animationLogger = {
  info: (message: string, context?: Record<string, unknown>) =>
    logger.info(`🎬 Animation: ${message}`, undefined, context),
  warn: (message: string, context?: Record<string, unknown>) =>
    logger.warn(`⚠️ Animation: ${message}`, context),
  error: (message: string, error?: Error, context?: Record<string, unknown>) =>
    logger.error(`❌ Animation: ${message}`, error, context),
  debug: (message: string, context?: Record<string, unknown>) =>
    logger.debug(`🎬 Animation: ${message}`, context),
};

export const audioLogger = {
  info: (message: string, context?: Record<string, unknown>) =>
    logger.info(`🔊 Audio: ${message}`, undefined, context),
  warn: (message: string, context?: Record<string, unknown>) =>
    logger.warn(`⚠️ Audio: ${message}`, context),
  error: (message: string, error?: Error, context?: Record<string, unknown>) =>
    logger.error(`❌ Audio: ${message}`, error, context),
  debug: (message: string, context?: Record<string, unknown>) =>
    logger.debug(`🔊 Audio: ${message}`, context),
};
