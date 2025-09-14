// src/contexts/TransitionContext.tsx

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";
import type { ReactNode } from "react";

// 🎯 TIPOS DE TRANSICIÓN
export type TransitionType = "portal" | "normal" | "direct";
export type TransitionDirection = "home-to-rebecca" | "rebecca-to-home";

// 📊 INTERFACE DEL ESTADO DE TRANSICIÓN
export interface TransitionState {
  isTransitioning: boolean;
  transitionType: TransitionType;
  direction: TransitionDirection | null;
  fromPage: string | null;
  toPage: string | null;
  transitionProgress: number;
  portalEffectsData?: {
    cameraPosition?: { x: number; y: number; z: number };
    sceneRotation?: { x: number; y: number; z: number };
    lastScrollPercentage?: number;
    glitchTriggered?: boolean;
  };
}

// 🛠️ ACTIONS DEL CONTEXT
export interface TransitionActions {
  startTransition: (config: {
    type: TransitionType;
    direction: TransitionDirection;
    fromPage: string;
    toPage: string;
    portalData?: TransitionState["portalEffectsData"];
  }) => void;
  updateProgress: (progress: number) => void;
  completeTransition: () => void;
  resetTransition: () => void;
}

// 🎭 CONTEXT INTERFACE COMPLETA
export interface TransitionContextType
  extends TransitionState,
    TransitionActions {}

// 🔧 ESTADO INICIAL
const initialState: TransitionState = {
  isTransitioning: false,
  transitionType: "normal",
  direction: null,
  fromPage: null,
  toPage: null,
  transitionProgress: 0,
  portalEffectsData: undefined,
};

// 🌐 CREAR CONTEXT
const TransitionContext = createContext<TransitionContextType | undefined>(
  undefined
);

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
export const useTransition = (): TransitionContextType => {
  const context = useContext(TransitionContext);

  if (context === undefined) {
    throw new Error("useTransition must be used within a TransitionProvider");
  }

  return context;
};

// 🎯 HOOK ESPECÍFICO PARA PORTAL TRANSITIONS
export const usePortalTransition = () => {
  const transition = useTransition();

  return useMemo(() => {
    const isFromPortal =
      transition.transitionType === "portal" &&
      transition.direction === "home-to-rebecca";

    const isToPortal =
      transition.transitionType === "portal" &&
      transition.direction === "rebecca-to-home";

    return {
      ...transition,
      isFromPortal,
      isToPortal,
      portalData: transition.portalEffectsData,
    };
  }, [transition]);
};

export default TransitionContext;
