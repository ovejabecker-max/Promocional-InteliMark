// src/components/HomePageModal.tsx

import React, { Suspense, useEffect, useRef } from "react";
import { AnimationProvider } from "../contexts/AnimationContext";
import { TransitionProvider } from "../contexts/TransitionContext";
import { HomePageModalProvider } from "./HomePageModalProvider";
import { PageLoader } from "./PageLoader";
import "./HomePageModal.css";

// Lazy load HomePage to maintain performance
const HomePage = React.lazy(() => import("../pages/HomePage"));

interface HomePageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HomePageModal: React.FC<HomePageModalProps> = ({
  isOpen,
  onClose,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      // Restore body scroll when modal closes
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  // Handle click outside to close modal
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === modalRef.current) {
      onClose();
    }
  };

  // Reset scroll when modal opens
  useEffect(() => {
    if (isOpen && contentRef.current) {
      contentRef.current.scrollTo(0, 0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      ref={modalRef}
      className="homepage-modal-overlay"
      onClick={handleOverlayClick}
    >
      <div className="homepage-modal-container">
        {/* Close button */}
        <button
          className="homepage-modal-close"
          onClick={onClose}
          aria-label="Cerrar modal"
        >
          ✕
        </button>

        {/* Modal content with independent scroll */}
        <div ref={contentRef} className="homepage-modal-content">
          {/* Wrap HomePage with our custom providers */}
          <HomePageModalProvider onModalClose={onClose}>
            <AnimationProvider>
              <TransitionProvider>
                <Suspense fallback={<PageLoader />}>
                  <div className="homepage-modal-wrapper">
                    <HomePage />
                  </div>
                </Suspense>
              </TransitionProvider>
            </AnimationProvider>
          </HomePageModalProvider>
        </div>
      </div>
    </div>
  );
};
