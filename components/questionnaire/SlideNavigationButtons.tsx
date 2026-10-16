"use client";

import React, { memo } from "react";

export interface SlideNavigationButtonsProps {
  onBack?: () => void;
  onNext?: () => void;
  isSpanish?: boolean;
  backDisabled?: boolean; 
  nextDisabled?: boolean;
  loading?: boolean;
  backLabel?: string;
  nextLabel?: string;
  hideBack?: boolean;
  hideNext?: boolean;
  variant?: "stage" | "flow";
  className?: string;
}

/**
 * SlideNavigationButtons
 * 
 * Unified, consistent Back and Next navigation buttons across all PEN-PAL study slides.
 * - Back button: soft sage-mint (#bddfd8) with dark teal text (#143833)
 * - Next button: soft warm yellow (#fdee8e) with dark text (#232323)
 * - Sizing, typography, rounded-pill styling, hover states, active transitions,
 *   and WCAG 2.1 AA focus rings are 100% standardized across all slides.
 */
export const SlideNavigationButtons = memo(function SlideNavigationButtons({
  onBack,
  onNext,
  isSpanish = false,
  backDisabled = false,
  nextDisabled = false,
  loading = false,
  backLabel,
  nextLabel,
  hideBack = false,
  hideNext = false,
  variant = "flow",
  className = "",
}: SlideNavigationButtonsProps) {
  const resolvedBackText = backLabel || (isSpanish ? "Atrás" : "Back");
  const resolvedNextText = loading
    ? "..."
    : (nextLabel || (isSpanish ? "Siguiente" : "Next"));

  const backAria = isSpanish ? "Volver al paso anterior" : "Go back to previous step";
  const nextAria = isSpanish ? "Continuar al siguiente paso" : "Continue to next step";

  const containerClasses = `slide-nav slide-nav-${variant} no-print ${className}`.trim();

  return (
    <div className={containerClasses} role="group" aria-label={isSpanish ? "Navegación del estudio" : "Study navigation"}>
      {!hideBack && onBack && (
        <button
          type="button"
          onClick={onBack}
          disabled={backDisabled || loading}
          aria-label={backAria}
          className="slide-nav-btn slide-nav-btn--back"
        >
          {resolvedBackText}
        </button>
      )}

      {!hideNext && onNext && (
        <button
          type="button"
          onClick={onNext}
          disabled={nextDisabled || loading}
          aria-label={nextAria}
          className={`slide-nav-btn slide-nav-btn--next${nextDisabled || loading ? " slide-nav-btn--disabled" : ""}`}
        >
          {resolvedNextText}
        </button>
      )}
    </div>
  );
});

export default SlideNavigationButtons;
