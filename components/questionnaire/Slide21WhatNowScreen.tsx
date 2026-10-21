"use client";

import React, { useRef, useEffect } from "react";
import { resolveMedicineToken } from "@/lib/token-engine";
import { SlideNavigationButtons } from "./SlideNavigationButtons";

/* ==========================================================
   Slide21WhatNowScreen – Styles matching Figma UI
   (Figma Screen 17: "What Now?")
   - Yellow "What Now?" pill badge (#feff9f) with teal border + shadow
   - Regular-weight heading & bullets, same size (like Figma)
   - Illustration centred right under the text, blended into background
   - Desktop: vertical column
   - Mobile Portrait: scaled-down proportions
   - Mobile Landscape: side-by-side split row
   - Standardized SlideNavigationButtons pinned at bottom
   ========================================================== */

const SLIDE21_CSS = `
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
  padding: clamp(18px, 3.4vh, 34px) clamp(20px, 4vw, 48px) clamp(80px, 11vh, 96px) clamp(20px, 4vw, 48px);
  overflow-y: auto;
  overflow-x: hidden;
  font-family: "Plus Jakarta Sans", "Inter", system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
  color: #232323;
}

/* Main Content Area */
.s21-content-wrap {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  flex: 0 0 auto;
}

.s21-text-col {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  flex-shrink: 0;
}

/* Yellow Badge matching Figma */
.s21-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: auto;
  min-width: 180px;
  height: 78px;
  padding: 0 30px;
  background-color: #feff9f;
  border: 2px solid #2b7f8f;
  border-radius: 22px;
  box-shadow: 0 4px 5px rgba(34, 105, 118, 0.45);
  margin: 0 0 clamp(18px, 3.4vh, 32px) 0;
  flex-shrink: 0;
}

.s21-badge-title {
  font-size: 25px;
  font-weight: 700;
  color: #232323;
  letter-spacing: -0.01em;
  margin: 0;
  line-height: 1;
  outline: none;
  white-space: nowrap;
}

.s21-badge-title:focus-visible {
  box-shadow: 0 0 0 2px #236f7a;
  border-radius: 4px;
}

/* Heading Statement (regular weight, like Figma) */
.s21-heading {
  font-size: clamp(20px, 2.7vw, 26px);
  font-weight: 400;
  color: #232323;
  margin: 0;
  letter-spacing: -0.005em;
  line-height: 1.3;
  text-align: left;
}

/* Bullet Points (same size as heading, like Figma) */
.s21-bullets {
  margin: 0;
  padding-left: 38px;
  list-style-type: disc;
  width: 100%;
}

.s21-bullet-item {
  font-size: clamp(20px, 2.7vw, 26px);
  line-height: 1.3;
  color: #232323;
  margin: 0;
  font-weight: 400;
  letter-spacing: -0.005em;
  text-align: left;
}

/* Illustration - centred right under the text, blended into background */
.s21-illustration-wrap {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  margin: clamp(2px, 0.8vh, 8px) auto 0 auto;
  flex: 0 0 auto;
}

.s21-illustration-img {
  width: 100%;
  max-width: 420px;
  height: auto;
  max-height: clamp(220px, 38vh, 300px);
  object-fit: contain;
  display: block;
  user-select: none;
  background: transparent;
  mix-blend-mode: multiply;
  box-shadow: none;
  filter: none;
}

/* Compact Laptop / Height-constrained screens */
@media (max-height: 720px) and (min-width: 768px) {
  .s21-root {
    padding: 14px 28px 68px 28px !important;
  }
  .s21-badge {
    height: 60px !important;
    min-width: 150px !important;
    padding: 0 24px !important;
    margin-bottom: 14px !important;
  }
  .s21-badge-title {
    font-size: 20px !important;
  }
  .s21-heading,
  .s21-bullet-item {
    font-size: 19px !important;
  }
  .s21-illustration-img {
    max-width: 340px !important;
    max-height: clamp(170px, 30vh, 230px) !important;
  }
}

/* ==========================================================
   Mobile Portrait Mode (< 768px)
   ========================================================== */
@media (max-width: 767px) {
  .s21-root {
    padding: 16px 16px 76px 16px !important;
    overflow-y: auto !important;
    -webkit-overflow-scrolling: touch !important;
  }
  .s21-content-wrap {
    max-width: 100% !important;
  }
  .s21-badge {
    min-width: 128px !important;
    height: 54px !important;
    padding: 0 22px !important;
    border-radius: 16px !important;
    margin-bottom: 14px !important;
  }
  .s21-badge-title {
    font-size: 18px !important;
  }
  .s21-heading {
    font-size: 17px !important;
    line-height: 1.32 !important;
  }
  .s21-bullets {
    padding-left: 26px !important;
  }
  .s21-bullet-item {
    font-size: 17px !important;
    line-height: 1.32 !important;
  }
  .s21-illustration-wrap {
    margin: 6px auto 4px auto !important;
  }
  .s21-illustration-img {
    max-width: 340px !important;
    max-height: clamp(190px, 34vh, 270px) !important;
    margin: 0 auto !important;
  }
}

/* ==========================================================
   Mobile Landscape Mode (< 520px height) - Split Screen Row
   ========================================================== */
@media (orientation: landscape) and (max-height: 520px) {
  .s21-root {
    padding: 10px 18px 60px 18px !important;
    overflow-y: auto !important;
  }
  .s21-content-wrap {
    flex-direction: row !important;
    align-items: center !important;
    justify-content: space-between !important;
    gap: 16px !important;
    max-width: 100% !important;
  }
  .s21-text-col {
    flex: 1 1 54% !important;
    width: 54% !important;
    justify-content: center !important;
  }
  .s21-badge {
    min-width: 110px !important;
    height: 40px !important;
    padding: 0 16px !important;
    border-radius: 13px !important;
    margin-bottom: 8px !important;
  }
  .s21-badge-title {
    font-size: 14px !important;
  }
  .s21-heading {
    font-size: 14px !important;
    line-height: 1.3 !important;
  }
  .s21-bullets {
    padding-left: 18px !important;
  }
  .s21-bullet-item {
    font-size: 14px !important;
    line-height: 1.3 !important;
  }
  .s21-illustration-wrap {
    flex: 1 1 44% !important;
    width: 44% !important;
    margin: 0 !important;
    align-items: center !important;
  }
  .s21-illustration-img {
    max-width: 320px !important;
    max-height: clamp(130px, 50vh, 190px) !important;
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
  audioSrc?: string;
  stepId?: string;
  locale?: string;
  transcriptText?: string;
}

export function Slide21WhatNowScreen({
  isSpanish = false,
  medicationName,
  onNext,
  onBack,
  loading = false,
  navProps,
  audioSrc,
  stepId = "slide21_what_now",
  locale,
  transcriptText,
}: Slide21WhatNowScreenProps) {
  const headingRef = useRef<HTMLHeadingElement | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      headingRef.current?.focus();
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  const rawTitle = isSpanish
    ? "¡Hable con el médico de su hijo sobre la prueba de alergia a [name]!"
    : "Talk to your child’s doctor about [name] allergy testing!";

  const rawBullets = [
    {
      en: "The test can help you learn the truth about your child’s past reaction.",
      es: "La prueba puede ayudarle a conocer la verdad sobre la reacción pasada de su hijo.",
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

  const spokenText = `${isSpanish ? "Qué sigue ahora. " : "What Now? "}${titleText}. ${rawBullets
    .map((b) => resolveMedicineToken(isSpanish ? b.es : b.en, medicationName, isSpanish))
    .join(" ")}`;

  return (
    <div id="slide-content" className="s21-root">
      <style>{SLIDE21_CSS}</style>

      {/* Main Content Area */}
      <main className="s21-content-wrap">
        <div className="s21-text-col">
          {/* Yellow Badge */}
          <div className="s21-badge">
            <h2
              ref={headingRef}
              tabIndex={-1}
              id="slide21-title"
              className="s21-badge-title"
            >
              {isSpanish ? "¿Qué sigue ahora?" : "What Now?"}
            </h2>
          </div>

          {/* Heading Statement */}
          <h1 className="s21-heading">
            {titleText}
          </h1>

          {/* Bullet Points */}
          <ul className="s21-bullets" aria-label={titleText}>
            {rawBullets.map((b, idx) => {
              const text = resolveMedicineToken(isSpanish ? b.es : b.en, medicationName, isSpanish);
              return (
                <li key={idx} className="s21-bullet-item">
                  {text}
                </li>
              );
            })}
          </ul>
        </div>

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
            draggable={false}
          />
        </div>
      </main>

      {/* Standardized Navigation Buttons (Back & Next) pinned at bottom */}
      <SlideNavigationButtons
        onBack={handleBackClick}
        onNext={handleNextClick}
        isSpanish={isSpanish}
        loading={isLoading}
      />
    </div>
  );
}

export default Slide21WhatNowScreen;