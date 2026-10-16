"use client";

import React, { useRef, useEffect } from "react";
import { resolveMedicineToken } from "@/lib/token-engine";
import { SlideNavigationButtons } from "./SlideNavigationButtons";

const SLIDE21_CSS = `
/* ==========================================================
   Slide21WhatNowScreen – Pixel-Perfect Styles Matching Figma UI
   - Large prominent yellow "What Now?" pill badge
   - Bold, clear doctor consultation heading & benefits bullets
   - High-impact, generously sized doctor consultation illustration
   - Responsive scaling with clean mobile adaptation
   ========================================================== */

.s21-root,
.s21-root *,
.s21-root *::before,
.s21-root *::after {
  box-sizing: border-box;
}

.s21-root {
  position: relative;
  width: 100%;
  height: 100%;
  flex: 1 1 0%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  background-color: #fafdf3;
  padding: clamp(0.75rem, 2.2vh, 1.75rem) clamp(1.25rem, 3.5vw, 3rem) 4.5rem clamp(1.25rem, 3.5vw, 3rem);
  overflow: hidden;
  font-family: "Plus Jakarta Sans", "Inter", system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
  color: #232323;
}

/* Centered Content Container */
.s21-content {
  flex: 1 1 auto;
  min-height: 0;
  width: 100%;
  max-width: 820px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  padding: 0;
}

/* "What Now?" Yellow Badge (Matching Figma Specification) */
.s21-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: #feff9f;
  border: 2px solid #2b7f8f;
  border-radius: 22px;
  padding: 0.7rem 2.5rem;
  min-height: 58px;
  box-shadow: 0 4px 6px rgba(34, 105, 118, 0.35);
  margin-bottom: clamp(0.5rem, 1.5vh, 0.9rem);
  flex-shrink: 0;
}

.s21-badge-title {
  font-size: clamp(1.3rem, 2.3vw, 1.48rem);
  font-weight: 700;
  color: #1a2e2b;
  line-height: 1.2;
  margin: 0;
  letter-spacing: -0.015em;
  outline: none;
}

.s21-badge-title:focus-visible {
  box-shadow: 0 0 0 2px #236f7a;
  border-radius: 4px;
}

/* Main Heading */
.s21-heading {
  font-size: clamp(1.12rem, 2.1vw, 1.35rem);
  font-weight: 700;
  line-height: 1.35;
  color: #1a2e2b;
  letter-spacing: -0.01em;
  margin: 0 0 clamp(0.35rem, 1.2vh, 0.65rem) 0;
  text-align: left;
  flex-shrink: 0;
}

/* Bullet Points */
.s21-bullets {
  list-style: none;
  padding: 0;
  margin: 0 0 clamp(0.4rem, 1.3vh, 0.75rem) 0;
  display: flex;
  flex-direction: column;
  gap: clamp(0.35rem, 1vh, 0.55rem);
  width: 100%;
  flex-shrink: 0;
}

.s21-bullet-item {
  display: flex;
  align-items: flex-start;
  gap: 0.65rem;
  font-size: clamp(0.94rem, 1.55vw, 1.06rem);
  font-weight: 500;
  color: #232323;
  line-height: 1.42;
  text-align: left;
}

.s21-bullet-dot {
  font-size: 1.15rem;
  line-height: 1.2;
  color: #1a2e2b;
  user-select: none;
  flex-shrink: 0;
}

/* Illustration Container & Large Doctor Consultation Image */
.s21-illustration-wrap {
  width: 100%;
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: clamp(0.35rem, 1.2vh, 0.75rem);
  user-select: none;
}

.s21-illustration-img {
  width: min(580px, 100%);
  max-width: 580px;
  height: auto;
  max-height: clamp(240px, 39vh, 325px);
  object-fit: contain;
  display: block;
  filter: drop-shadow(0 4px 14px rgba(20, 50, 45, 0.08));
}

/* Mobile & Small Screen Adaptations */
@media (max-width: 767px) {
  .s21-root {
    height: auto !important;
    min-height: auto !important;
    flex: none !important;
    overflow-y: auto !important;
    overflow-x: hidden !important;
    padding: 0.85rem 0.85rem 4.5rem 0.85rem !important;
    gap: 0.4rem !important;
  }

  .s21-content {
    max-width: 100% !important;
    width: 100% !important;
    align-items: flex-start !important;
    flex: none !important;
  }

  .s21-badge {
    padding: 0.55rem 1.6rem !important;
    min-height: 48px !important;
    border-radius: 18px !important;
    margin-bottom: 0.6rem !important;
  }

  .s21-badge-title {
    font-size: 1.18rem !important;
  }

  .s21-heading {
    font-size: 1.05rem !important;
    line-height: 1.35 !important;
    margin-bottom: 0.55rem !important;
  }

  .s21-bullets {
    gap: 0.45rem !important;
    margin-bottom: 0.65rem !important;
  }

  .s21-bullet-item {
    font-size: 0.88rem !important;
    line-height: 1.4 !important;
    gap: 0.45rem !important;
  }

  .s21-bullet-dot {
    font-size: 1rem !important;
  }

  .s21-illustration-wrap {
    flex: none !important;
    margin-top: 0.45rem !important;
    width: 100% !important;
  }

  .s21-illustration-img {
    max-width: 350px !important;
    max-height: 200px !important;
    margin: 0 auto !important;
  }
}

@media (max-height: 700px) and (min-width: 768px) {
  .s21-root {
    padding: 0.65rem 1.75rem 4.2rem 1.75rem;
  }
  .s21-badge {
    padding: 0.45rem 1.75rem;
    min-height: 48px;
    margin-bottom: 0.45rem;
  }
  .s21-badge-title {
    font-size: 1.25rem;
  }
  .s21-heading {
    font-size: 1.15rem;
    margin-bottom: 0.35rem;
  }
  .s21-bullet-item {
    font-size: 0.95rem;
  }
  .s21-illustration-img {
    max-height: clamp(180px, 30vh, 230px);
    max-width: 520px;
  }
}
`;

export interface Slide21WhatNowScreenProps {
  isSpanish?: boolean;
  medicationName?: string;
  onNext?: () => void;
  onBack?: () => void;
  loading?: boolean;
  navProps?: {
    onNext: (explicitAnswer?: any) => void;
    onBack: () => void;
    loading?: boolean;
    headingRef?: React.RefObject<HTMLHeadingElement | null>;
  };
}

export function Slide21WhatNowScreen({
  isSpanish = false,
  medicationName,
  onNext,
  onBack,
  loading = false,
  navProps,
}: Slide21WhatNowScreenProps) {
  const headingRef = useRef<HTMLHeadingElement | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      headingRef.current?.focus();
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  const rawTitle = isSpanish
    ? "¡Hable con el médico de su hijo sobre las pruebas de alergia a [name]!"
    : "Talk to your child's doctor about [name] allergy testing!";

  const rawBullets = [
    {
      en: "The test can help you learn the truth about your child's past reaction.",
      es: "La prueba puede ayudarle a saber la verdad sobre la reacción pasada de su hijo.",
    },
    {
      en: "The test may help your child get better medicine in the future.",
      es: "La prueba puede ayudar a que su hijo reciba mejores medicamentos en el futuro.",
    },
  ];

  const titleText = resolveMedicineToken(rawTitle, medicationName, isSpanish);

  const handleNextClick = () => {
    if (onNext) {
      onNext();
    } else if (navProps?.onNext) {
      navProps.onNext();
    }
  };

  const handleBackClick = () => {
    if (onBack) {
      onBack();
    } else if (navProps?.onBack) {
      navProps.onBack();
    }
  };

  const isLoading = loading || navProps?.loading || false;

  return (
    <div id="slide-content" className="s21-root">
      <style>{SLIDE21_CSS}</style>

      {/* Main Centered Content */}
      <div className="s21-content">
        {/* Yellow "What Now?" Badge */}
        <div className="s21-badge">
          <h1
            ref={headingRef}
            tabIndex={-1}
            id="slide21-title"
            className="s21-badge-title"
          >
            {isSpanish ? "¿Qué sigue ahora?" : "What Now?"}
          </h1>
        </div>

        {/* Heading */}
        <h2 className="s21-heading">
          {titleText}
        </h2>

        {/* Bullet Points */}
        <ul className="s21-bullets" aria-label={titleText}>
          {rawBullets.map((b, idx) => {
            const text = resolveMedicineToken(isSpanish ? b.es : b.en, medicationName, isSpanish);
            return (
              <li key={idx} className="s21-bullet-item">
                <span className="s21-bullet-dot" aria-hidden="true">•</span>
                <span>{text}</span>
              </li>
            );
          })}
        </ul>

        {/* Doctor Consultation Illustration */}
        <div className="s21-illustration-wrap" aria-hidden="true">
          <img
            src="/images/doctor-consultation.png"
            alt={
              isSpanish
                ? "Madre e hija consultando con la pediatra sobre las pruebas de alergia"
                : "Mother and daughter consulting with pediatrician about allergy testing"
            }
            className="s21-illustration-img"
          />
        </div>
      </div>

      {/* Centered Bottom Navigation (Back & Next) */}
      <SlideNavigationButtons
        onBack={handleBackClick}
        onNext={handleNextClick}
        isSpanish={isSpanish}
        loading={isLoading}
        variant="flow"
      />
    </div>
  );
}

export default Slide21WhatNowScreen;
