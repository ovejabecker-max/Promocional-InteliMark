// src/utils/vapiReconnection.ts
import { vapiLogger } from "./vapiErrorHandler";

export interface ReconnectionConfig {
  enabled: boolean;
  maxAttempts: number;
  initialDelay: number;
  maxDelay: number;
  backoffFactor: number;
}

// Configuración por defecto para reconexión
export const DEFAULT_RECONNECTION_CONFIG: ReconnectionConfig = {
  enabled: true,
  maxAttempts: 3,
  initialDelay: 1000, // 1 segundo
  maxDelay: 10000, // 10 segundos
  backoffFactor: 2, // Duplicar el delay en cada intento
};

export class VapiReconnectionManager {
  private reconnectionTimeoutId: number | null = null;
  private currentAttempt = 0;
  private config: ReconnectionConfig;
  private onReconnectAttempt?: (attempt: number, delay: number) => void;
  private onReconnectSuccess?: () => void;
  private onReconnectFailure?: (finalAttempt: boolean) => void;

  constructor(
    config: Partial<ReconnectionConfig> = {},
    callbacks: {
      onReconnectAttempt?: (attempt: number, delay: number) => void;
      onReconnectSuccess?: () => void;
      onReconnectFailure?: (finalAttempt: boolean) => void;
    } = {}
  ) {
    this.config = { ...DEFAULT_RECONNECTION_CONFIG, ...config };
    this.onReconnectAttempt = callbacks.onReconnectAttempt;
    this.onReconnectSuccess = callbacks.onReconnectSuccess;
    this.onReconnectFailure = callbacks.onReconnectFailure;
  }

  /**
   * Calcula el delay para el siguiente intento usando exponential backoff
   */
  private calculateDelay(attempt: number): number {
    const delay =
      this.config.initialDelay *
      Math.pow(this.config.backoffFactor, attempt - 1);
    return Math.min(delay, this.config.maxDelay);
  }

  /**
   * Determina si debería intentar reconectar basado en el tipo de error
   */
  shouldAttemptReconnection(errorType: string): boolean {
    if (!this.config.enabled) {
      return false;
    }

    // Solo reconectar para errores de red/conexión
    const reconnectableErrors = [
      "connection_failed",
      "network_error",
      "timeout_error",
      "unknown_error",
    ];

    return (
      reconnectableErrors.includes(errorType) &&
      this.currentAttempt < this.config.maxAttempts
    );
  }

  /**
   * Inicia el proceso de reconexión automática
   */
  async startReconnection(
    reconnectFunction: () => Promise<void>
  ): Promise<void> {
    if (
      !this.config.enabled ||
      this.currentAttempt >= this.config.maxAttempts
    ) {
      vapiLogger.warn(
        "Reconexión automática deshabilitada o excedido máximo de intentos"
      );
      return;
    }

    this.currentAttempt++;
    const delay = this.calculateDelay(this.currentAttempt);

    vapiLogger.info(`Iniciando reconexión automática`, {
      attempt: this.currentAttempt,
      maxAttempts: this.config.maxAttempts,
      delay,
      config: this.config,
    });

    // Notificar que se va a intentar reconectar
    this.onReconnectAttempt?.(this.currentAttempt, delay);

    return new Promise((resolve, reject) => {
      this.reconnectionTimeoutId = setTimeout(async () => {
        try {
          vapiLogger.info(
            `Ejecutando intento de reconexión ${this.currentAttempt}/${this.config.maxAttempts}`
          );

          await reconnectFunction();

          // Reconexión exitosa
          vapiLogger.info(
            `Reconexión exitosa en intento ${this.currentAttempt}`
          );
          this.reset();
          this.onReconnectSuccess?.();
          resolve();
        } catch (error) {
          vapiLogger.error(
            `Fallo en intento de reconexión ${this.currentAttempt}`,
            error as Error
          );

          const isFinalAttempt = this.currentAttempt >= this.config.maxAttempts;
          this.onReconnectFailure?.(isFinalAttempt);

          if (isFinalAttempt) {
            vapiLogger.error(
              `Agotados todos los intentos de reconexión (${this.config.maxAttempts})`
            );
            this.reset();
            reject(
              new Error(
                `Reconexión fallida después de ${this.config.maxAttempts} intentos`
              )
            );
          } else {
            // Intentar nuevamente
            try {
              await this.startReconnection(reconnectFunction);
              resolve();
            } catch (finalError) {
              reject(finalError);
            }
          }
        }
      }, delay);
    });
  }

  /**
   * Cancela el proceso de reconexión
   */
  cancelReconnection(): void {
    if (this.reconnectionTimeoutId) {
      clearTimeout(this.reconnectionTimeoutId);
      this.reconnectionTimeoutId = null;
    }

    vapiLogger.info(
      `Reconexión automática cancelada en intento ${this.currentAttempt}`
    );
    this.reset();
  }

  /**
   * Resetea el estado de reconexión
   */
  reset(): void {
    this.currentAttempt = 0;
    if (this.reconnectionTimeoutId) {
      clearTimeout(this.reconnectionTimeoutId);
      this.reconnectionTimeoutId = null;
    }
  }

  /**
   * Getters para el estado actual
   */
  get isReconnecting(): boolean {
    return this.reconnectionTimeoutId !== null;
  }

  get currentAttemptNumber(): number {
    return this.currentAttempt;
  }

  get maxAttempts(): number {
    return this.config.maxAttempts;
  }

  get nextRetryDelay(): number {
    if (!this.isReconnecting) return 0;
    return this.calculateDelay(this.currentAttempt + 1);
  }

  /**
   * Actualiza la configuración de reconexión
   */
  updateConfig(newConfig: Partial<ReconnectionConfig>): void {
    this.config = { ...this.config, ...newConfig };
    vapiLogger.debug("Configuración de reconexión actualizada", {
      config: this.config,
    });
  }
}

/**
 * Función helper para crear un manager de reconexión con configuración por defecto
 */
export const createReconnectionManager = (
  customConfig?: Partial<ReconnectionConfig>,
  callbacks?: {
    onReconnectAttempt?: (attempt: number, delay: number) => void;
    onReconnectSuccess?: () => void;
    onReconnectFailure?: (finalAttempt: boolean) => void;
  }
): VapiReconnectionManager => {
  return new VapiReconnectionManager(customConfig, callbacks);
};
