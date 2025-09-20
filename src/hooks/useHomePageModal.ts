// src/hooks/useHomePageModal.ts

import { useContext } from "react";
import { useNavigate as useRouterNavigate } from "react-router-dom";
import {
  HomePageModalContext,
  type HomePageModalContextType,
  type NavigateFunction,
} from "../components/HomePageModalProvider";

// Hook personalizado para usar el contexto
export const useHomePageModalContext = (): HomePageModalContextType => {
  const routerNavigate = useRouterNavigate();
  const context = useContext(HomePageModalContext);

  if (!context) {
    // Si no está en el contexto del modal, usa navegación normal
    return {
      navigate: routerNavigate,
      isEmbedded: false,
    };
  }
  return context;
};

// Hook que HomePage puede usar en lugar de useNavigate
export const useModalAwareNavigate = (): NavigateFunction => {
  const context = useContext(HomePageModalContext);
  const routerNavigate = useRouterNavigate();

  return context ? context.navigate : routerNavigate;
};
