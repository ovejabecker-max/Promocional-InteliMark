// src/contexts/TransitionContext.tsx

import React, { useState, useCallback, useMemo } from "react";
import type { ReactNode } from "react";
import {
  TransitionContext,
  initialTransitionState as initialState,
  type TransitionDirection,
  type TransitionState,
  type TransitionType,
} from "./TransitionContextContext";

// 🏗️ PROVIDER COMPONENT
export const TransitionProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<TransitionState>(initialState);

  // 🚀 INICIAR TRANSICIÓN
  const startTransition = useCallback(
    (config: {
      type: TransitionType;
      direction: TransitionDirection;
      fromPage: string;
      toPage: string;
      portalData?: TransitionState["portalEffectsData"];
    }) => {
      // console.log("🌀 Transition Context: Starting transition", config);

      setState({
        isTransitioning: true,
        transitionType: config.type,
        direction: config.direction,
        fromPage: config.fromPage,
        toPage: config.toPage,
        transitionProgress: 0,
        portalEffectsData: config.portalData,
      });
    },
    []
  );

  // 📈 ACTUALIZAR PROGRESO
  const updateProgress = useCallback((progress: number) => {
    setState((prev) => ({
      ...prev,
      transitionProgress: Math.max(0, Math.min(100, progress)),
    }));
  }, []);

  // ✅ COMPLETAR TRANSICIÓN
  const completeTransition = useCallback(() => {
    // console.log("✅ Transition Context: Transition completed");

    setState((prev) => ({
      ...prev,
      isTransitioning: false,
      transitionProgress: 100,
    }));
  }, []);

  // 🔄 RESET TRANSICIÓN
  const resetTransition = useCallback(() => {
    // console.log("🔄 Transition Context: Resetting transition state");
    setState(initialState);
  }, []);

  // 🎯 VALOR DEL CONTEXT
  const contextValue = useMemo(
    () => ({
      ...state,
      startTransition,
      updateProgress,
      completeTransition,
      resetTransition,
    }),
    [
      state,
      startTransition,
      updateProgress,
      completeTransition,
      resetTransition,
    ]
  );

  return (
    <TransitionContext.Provider value={contextValue}>
      {children}
    </TransitionContext.Provider>
  );
};

// 🪝 CUSTOM HOOK
// Nota: hooks movidos a archivos dedicados para cumplir con react-refresh

// Nota: no exportar el contexto por defecto aquí para cumplir con react-refresh
