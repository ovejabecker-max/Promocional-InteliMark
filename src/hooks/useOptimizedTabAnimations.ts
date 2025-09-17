import { useEffect } from "react";
import { useContext } from "react";
import { AnimationContext } from "../contexts/AnimationContextContext";

/**
 * Hook simplificado para activar animaciones de pestaña
 * Reemplaza completamente useUnifiedBrowserAnimations
 *
 * @param enabled - Si las animaciones deben estar activas (por defecto true)
 */
export const useOptimizedTabAnimations = (enabled: boolean = true) => {
  const ctx = useContext(AnimationContext);
  if (!ctx) {
    throw new Error(
      "useOptimizedTabAnimations debe usarse dentro de AnimationProvider"
    );
  }
  const { isActive, startAnimations, stopAnimations } = ctx;

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
