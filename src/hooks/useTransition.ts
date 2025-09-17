// src/hooks/useTransition.ts

import { useContext } from "react";
import {
  TransitionContext,
  type TransitionContextType,
} from "../contexts/TransitionContextContext";

export const useTransition = (): TransitionContextType => {
  const context = useContext(TransitionContext);

  if (context === undefined) {
    throw new Error("useTransition must be used within a TransitionProvider");
  }

  return context;
};

export default useTransition;
