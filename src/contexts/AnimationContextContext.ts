import { createContext } from "react";

export interface AnimationContextType {
  isActive: boolean;
  startAnimations: () => void;
  stopAnimations: () => void;
}

export const AnimationContext = createContext<AnimationContextType | null>(
  null
);
