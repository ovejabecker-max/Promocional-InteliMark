// src/components/HomePageModalProvider.tsx

import React, { createContext, type ReactNode } from "react";
import {
  useNavigate as useRouterNavigate,
  type To,
  type NavigateOptions,
} from "react-router-dom";

// Tipo para la función navigate
type NavigateFunction = (to: To, options?: NavigateOptions) => void;

// Context para proveer navigate interceptado
interface HomePageModalContextType {
  navigate: NavigateFunction;
  isEmbedded: boolean;
  closeModal?: () => void;
}

const HomePageModalContext = createContext<HomePageModalContextType | null>(
  null
);

interface HomePageModalProviderProps {
  children: ReactNode;
  onModalClose?: () => void;
}

export const HomePageModalProvider: React.FC<HomePageModalProviderProps> = ({
  children,
  onModalClose,
}) => {
  const originalNavigate = useRouterNavigate();

  // 🎯 FUNCIÓN NAVIGATE INTERCEPTADA: No navega, cierra el modal
  const interceptedNavigate: NavigateFunction = (
    to: To,
    options?: NavigateOptions
  ) => {
    // Si intenta navegar a Rebecca, cierra el modal en su lugar
    if (
      to === "/rebecca" ||
      (typeof to === "string" && to.includes("rebecca"))
    ) {
      if (onModalClose) {
        onModalClose();
      }
      return;
    }

    // Para cualquier otra navegación, también cerramos el modal y navegamos
    if (onModalClose) {
      onModalClose();
    }

    // Opcionalmente, ejecutar la navegación real después de cerrar el modal
    setTimeout(() => {
      originalNavigate(to, options);
    }, 100);
  };

  const contextValue: HomePageModalContextType = {
    navigate: interceptedNavigate,
    isEmbedded: true,
    closeModal: onModalClose,
  };

  return (
    <HomePageModalContext.Provider value={contextValue}>
      {children}
    </HomePageModalContext.Provider>
  );
};

export { HomePageModalContext };
export type { HomePageModalContextType, NavigateFunction };
