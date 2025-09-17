// src/contexts/TransitionContextContext.ts

import { createContext } from "react";

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
export const initialTransitionState: TransitionState = {
  isTransitioning: false,
  transitionType: "normal",
  direction: null,
  fromPage: null,
  toPage: null,
  transitionProgress: 0,
  portalEffectsData: undefined,
};

// 🌐 CREAR CONTEXT
export const TransitionContext = createContext<
  TransitionContextType | undefined
>(undefined);

export default TransitionContext;
