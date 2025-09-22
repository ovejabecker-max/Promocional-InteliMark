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

  // 🎯 FUNCIÓN NAVIGATE INTERCEPTADA: Cierra el modal y navega si es necesario.
  const interceptedNavigate: NavigateFunction = (
    to: To,
    options?: NavigateOptions
  ) => {
    // Siempre cerramos el modal al intentar navegar.
    if (onModalClose) {
      onModalClose();
    }

    // Si el destino no es la página actual de Rebecca, procedemos con la navegación
    // después de un breve retraso para que la animación de cierre del modal se complete.
    const isNavigatingToRebecca =
      to === "/rebecca" || (typeof to === "string" && to.includes("rebecca"));

    if (!isNavigatingToRebecca) {
      setTimeout(() => {
        originalNavigate(to, options);
      }, 100); // Retraso para la animación de cierre.
    }
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
