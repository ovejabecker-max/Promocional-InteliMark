import { useEffect } from "react";
import { useTabAnimations } from "../contexts/AnimationContext";

/**
 * Hook simplificado para activar animaciones de pestaña
 * Reemplaza completamente useUnifiedBrowserAnimations
 *
 * @param enabled - Si las animaciones deben estar activas (por defecto true)
 */
export const useOptimizedTabAnimations = (enabled: boolean = true) => {
  const { isActive, startAnimations, stopAnimations } = useTabAnimations();

  useEffect(() => {
    if (enabled) {
      startAnimations();
    } else {
      stopAnimations();
    }

    // Cleanup automático cuando el componente se desmonta
    return () => {
      if (enabled) {
        stopAnimations();
      }
    };
  }, [enabled, startAnimations, stopAnimations]);

  return {
    isActive,
  };
};

export default useOptimizedTabAnimations;
