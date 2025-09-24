/**
 * Utilidad para manejar conflictos entre contextos WebGL y APIs de audio
 */
import { vapiLogger } from "./logger";

export class WebGLAudioCoordinator {
  private static instance: WebGLAudioCoordinator;
  private isWebGLActive = false;
  private pendingAudioOperations: (() => void)[] = [];

  static getInstance(): WebGLAudioCoordinator {
    if (!WebGLAudioCoordinator.instance) {
      WebGLAudioCoordinator.instance = new WebGLAudioCoordinator();
    }
    return WebGLAudioCoordinator.instance;
  }

  /**
   * Registra que WebGL está activo
   */
  setWebGLActive(active: boolean): void {
    this.isWebGLActive = active;

    // Si WebGL ya no está activo, ejecutar operaciones pendientes
    if (!active && this.pendingAudioOperations.length > 0) {
      setTimeout(() => {
        this.pendingAudioOperations.forEach((operation) => operation());
        this.pendingAudioOperations = [];
      }, 50);
    }
  }

  /**
   * Ejecuta una operación de audio, coordinando con WebGL si es necesario
   */
  async executeAudioOperation<T>(operation: () => Promise<T>): Promise<T> {
    // Si WebGL está activo, esperar un poco para evitar conflictos
    if (this.isWebGLActive) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    try {
      return await operation();
    } catch (error) {
      // Si hay error y WebGL está activo, podría ser un conflicto de contexto
      if (this.isWebGLActive && error instanceof Error) {
        vapiLogger.warn("Posible conflicto WebGL-Audio:", {
          errorMessage: error.message,
        });

        // Reintentar después de un breve delay
        await new Promise((resolve) => setTimeout(resolve, 200));
        return await operation();
      }
      throw error;
    }
  }

  /**
   * Programa una operación de audio para ejecutar cuando WebGL no esté ocupado
   */
  scheduleAudioOperation(operation: () => void): void {
    if (this.isWebGLActive) {
      this.pendingAudioOperations.push(operation);
    } else {
      setTimeout(operation, 0);
    }
  }
}

export const webGLAudioCoordinator = WebGLAudioCoordinator.getInstance();
