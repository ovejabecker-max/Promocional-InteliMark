// src/hooks/usePortalTransition.ts

import { useMemo } from "react";
import { useTransition } from "./useTransition";

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

export default usePortalTransition;
