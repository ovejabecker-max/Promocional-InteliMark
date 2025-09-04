// src/hooks/useFooterController.ts
// ✨ FOOTER CONTROLLER LIMPIO Y DEFINITIVO

import { useState, useEffect, useRef } from "react";

interface FooterComponentsStatus {
  newsletter: boolean;
  robot3D: boolean;
  aiMatrix: boolean;
  credits: boolean;
  contactInfo: boolean;
}

interface FooterState {
  isActive: boolean;
  isVisible: boolean;
  isHovered: boolean;
  componentsStatus: FooterComponentsStatus;
}

export const useFooterController = () => {
  const [footerState, setFooterState] = useState<FooterState>({
    isActive: false,
    isVisible: false,
    isHovered: false,
    componentsStatus: {
      newsletter: false,
      robot3D: false,
      aiMatrix: false,
      credits: false,
      contactInfo: false,
    },
  });

  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastStateRef = useRef<boolean>(false);

  useEffect(() => {
    const footerElement = document.getElementById("footer-reveal");
    if (!footerElement) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const footerEntry = entries[0];
        const isNowVisible = footerEntry.intersectionRatio >= 0.5;

        if (isNowVisible !== lastStateRef.current) {
          lastStateRef.current = isNowVisible;

          setFooterState((prev) => ({
            ...prev,
            isVisible: isNowVisible,
            isActive: isNowVisible,
            componentsStatus: {
              newsletter: isNowVisible,
              robot3D: isNowVisible,
              aiMatrix: isNowVisible,
              credits: isNowVisible,
              contactInfo: isNowVisible,
            },
          }));
        }
      },
      {
        threshold: 0.5,
        rootMargin: "0px",
      }
    );

    observerRef.current.observe(footerElement);

    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  const handleFooterHover = (isHovering: boolean) => {
    setFooterState((prev) => ({
      ...prev,
      isHovered: isHovering,
    }));
  };

  const updateComponentStatus = (
    component: keyof FooterComponentsStatus,
    status: boolean
  ) => {
    setFooterState((prev) => ({
      ...prev,
      componentsStatus: {
        ...prev.componentsStatus,
        [component]: status,
      },
    }));
  };

  return {
    footerState,
    handleFooterHover,
    updateComponentStatus,
  };
};
