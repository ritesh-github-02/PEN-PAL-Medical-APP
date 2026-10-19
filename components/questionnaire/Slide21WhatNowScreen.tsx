"use client";

import React, { useRef, useEffect } from "react";
import { resolveMedicineToken } from "@/lib/token-engine";
import { SlideNavigationButtons } from "./SlideNavigationButtons";
import AudioPlayer from "./AudioPlayer";

/* ==========================================================
   Slide21WhatNowScreen – Pixel-Perfect Styles Matching Figma UI
   (Figma Screen 17: "What Now?")
   - Prominent yellow "What Now?" pill badge (#feff9f)
   - Bold, clear doctor consultation heading & benefits bullets
   - High-impact, generously sized doctor consultation illustration
   - Desktop: Clean vertical column with centered artwork
   - Mobile Portrait: Balanced proportional typography and illustration
   - Mobile Landscape: Side-by-side split row (text column on left, artwork on right)
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
  padding: 18px 36px 76px 36px;
  overflow-y: auto;
  overflow-x: hidden;
  font-family: "Plus Jakarta Sans", "Inter", system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
  color: #232323;
}

/* Main Content Area */
.s21-content-wrap {
  width: 100%;
  max-width: 780px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  flex: 0 1 auto;
  min-height: 0;
}

.s21-text-col {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

/* Yellow Badge */
.s21-badge {
  width: 160px;
  height: 46px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: #feff9f;
  border: 1.8px solid #2b7f8f;
  border-radius: 18px;
  box-shadow: 0 3px 5px rgba(34, 105, 118, 0.3);
  margin-bottom: 12px;
  flex-shrink: 0;
}

.s21-badge-title {
  font-size: 19px;
  font-weight: 700;
  color: #232323;
  letter-spacing: -0.01em;
  margin: 0;
  line-height: 1;
  outline: none;
}

.s21-badge-title:focus-visible {
  box-shadow: 0 0 0 2px #236f7a;
  border-radius: 4px;
}

/* Heading Statement */
.s21-heading {
  font-size: 19px;
  font-weight: 700;
  color: #232323;
  margin: 0 0 8px 0;
  letter-spacing: -0.012em;
  line-height: 1.32;
  text-align: left;
}

/* Bullet Points */
.s21-bullets {
  margin: 0 0 8px 0;
  padding-left: 20px;
  list-style-type: disc;
  width: 100%;
}

.s21-bullet-item {
  font-size: 15.5px;
  line-height: 1.38;
  color: #232323;
  margin-bottom: 4px;
  font-weight: 500;
  letter-spacing: -0.01em;
  text-align: left;
}

/* Doctor Consultation Illustration */
.s21-illustration-wrap {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 4px auto 6px auto;
  flex: 0 1 auto;
}

.s21-illustration-img {
  width: 320px;
  max-width: 85%;
  height: auto;
  max-height: 170px;
  object-fit: contain;
  display: block;
}

/* Audio Controls Position */
.s21-audio {
  position: absolute;
  right: 28px;
  bottom: 20px;
  z-index: 25;
  display: flex;
  align-items: center;
  gap: 8px;
}

.s21-audio .audio-cc-btn svg {
  width: 44px !important;
  height: 38px !important;
}

.s21-audio .audio-play-btn svg {
  width: 58px !important;
  height: 38px !important;
}

/* Compact Laptop / Height-constrained screens */
@media (max-height: 700px) and (min-width: 768px) {
  .s21-root {
    padding: 12px 32px 68px 32px !important;
  }
  .s21-badge {
    height: 40px !important;
    width: 145px !important;
    margin-bottom: 8px !important;
  }
  .s21-badge-title {
    font-size: 17px !important;
  }
  .s21-heading {
    font-size: 17px !important;
    margin-bottom: 6px !important;
  }
  .s21-bullets {
    margin-bottom: 6px !important;
  }
  .s21-bullet-item {
    font-size: 14px !important;
    margin-bottom: 3px !important;
  }
  .s21-illustration-img {
    max-height: 145px !important;
    width: 270px !important;
  }
}

/* ==========================================================
   Mobile Portrait Mode (< 768px)
   ========================================================== */
@media (max-width: 767px) {
  .s21-root {
    padding: 14px 14px 72px 14px !important;
    overflow-y: auto !important;
    -webkit-overflow-scrolling: touch !important;
  }
  .s21-content-wrap {
    max-width: 100% !important;
  }
  .s21-badge {
    width: 130px !important;
    height: 38px !important;
    border-radius: 14px !important;
    box-shadow: 0 3px 5px rgba(34, 105, 118, 0.3) !important;
    margin-bottom: 8px !important;
  }
  .s21-badge-title {
    font-size: 15.5px !important;
  }
  .s21-heading {
    font-size: 15.5px !important;
    line-height: 1.3 !important;
    margin: 0 0 8px 0 !important;
  }
  .s21-bullets {
    margin: 0 0 8px 0 !important;
    padding-left: 18px !important;
  }
  .s21-bullet-item {
    font-size: 13px !important;
    line-height: 1.35 !important;
    margin-bottom: 4px !important;
  }
  .s21-illustration-wrap {
    margin: 4px auto 8px auto !important;
    max-height: 150px !important;
    flex: 0 1 auto !important;
  }
  .s21-illustration-img {
    width: 250px !important;
    max-width: 80% !important;
    max-height: 135px !important;
    height: auto !important;
    object-fit: contain !important;
  }
  .s21-audio {
    position: relative !important;
    right: auto !important;
    bottom: auto !important;
    margin: 4px auto 0 auto !important;
    justify-content: center !important;
  }
  .s21-audio .audio-cc-btn svg {
    width: 38px !important;
    height: 34px !important;
  }
  .s21-audio .audio-play-btn svg {
    width: 48px !important;
    height: 34px !important;
  }
}

/* ==========================================================
   Mobile Landscape Mode (< 520px height) - Split Screen Row
   ========================================================== */
@media (orientation: landscape) and (max-height: 520px) {
  .s21-root {
    padding: 8px 16px 60px 16px !important;
    overflow-y: auto !important;
  }
  .s21-content-wrap {
    flex-direction: row !important;
    align-items: center !important;
    justify-content: space-between !important;
    gap: 14px !important;
  }
  .s21-text-col {
    flex: 1 1 54% !important;
    width: 54% !important;
    justify-content: center !important;
  }
  .s21-badge {
    width: 115px !important;
    height: 32px !important;
    border-radius: 12px !important;
    box-shadow: 0 2px 4px rgba(34, 105, 118, 0.3) !important;
    margin-bottom: 6px !important;
  }
  .s21-badge-title {
    font-size: 14px !important;
  }
  .s21-heading {
    font-size: 14px !important;
    line-height: 1.22 !important;
    margin: 0 0 4px 0 !important;
  }
  .s21-bullets {
    margin: 0 !important;
    padding-left: 14px !important;
  }
  .s21-bullet-item {
    font-size: 11.5px !important;
    line-height: 1.25 !important;
    margin-bottom: 2px !important;
  }
  .s21-illustration-wrap {
    flex: 1 1 44% !important;
    width: 44% !important;
    max-height: 140px !important;
    margin: 0 !important;
  }
  .s21-illustration-img {
    max-width: 90% !important;
    max-height: 130px !important;
    height: auto !important;
  }
  .s21-audio {
    position: relative !important;
    right: auto !important;
    bottom: auto !important;
    margin: 2px auto 0 auto !important;
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

      {/* Caption (CC) & Play/Pause Controls (if audio is configured) */}
      {audioSrc && (
        <div className="s21-audio">
          <AudioPlayer
            audioSrc={audioSrc}
            stepId={stepId}
            locale={locale || (isSpanish ? "es" : "en")}
            transcriptText={transcriptText || spokenText}
            size="large"
          />
        </div>
      )}

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
