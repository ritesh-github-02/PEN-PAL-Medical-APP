"use client";

import React, { useRef, useEffect } from "react";
import AudioPlayer from "./AudioPlayer";
import { resolveMedicineToken } from "@/lib/token-engine";
import { SlideNavigationButtons } from "./SlideNavigationButtons";

/* ==========================================================
   Slide21WhatNowScreen – "What Now?" (Figma Screen 17)
   Layout: badge → heading → bullets → illustration (fills the
   remaining space) → Back / Next pinned at the bottom.
   - Desktop / tablet / phone portrait: vertical column
   - Phone landscape: text left, image right
   ========================================================== */

const SLIDE21_CSS = `
.s21-root,
.s21-root *,
.s21-root *::before,
.s21-root *::after {
  box-sizing: border-box;
}

.s21-root {
  --s21-nav-space: 88px; /* room reserved for Back / Next */
  position: relative;
  width: 100%;
  height: 100%;
  flex: 1 1 0%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: clamp(14px, 3vh, 32px) clamp(16px, 4vw, 48px) var(--s21-nav-space);
  background-color: #fafdf3;
  overflow-x: hidden;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  font-family: "Plus Jakarta Sans", "Inter", system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
  color: #232323;
}

/* ---------- Layout ---------- */
.s21-content {
  width: 100%;
  max-width: 800px;
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: clamp(8px, 1.6vh, 16px);
}

.s21-text {
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

/* ---------- Badge ---------- */
.s21-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: clamp(130px, 22vw, 180px);
  height: clamp(48px, 8vh, 78px);
  padding: 0 clamp(20px, 3vw, 30px);
  margin-bottom: clamp(12px, 2.6vh, 28px);
  background-color: #feff9f;
  border: 2px solid #2b7f8f;
  border-radius: clamp(14px, 2vw, 22px);
  box-shadow: 0 4px 5px rgba(34, 105, 118, 0.45);
}

.s21-badge-title {
  margin: 0;
  font-size: clamp(17px, 2.4vw, 25px);
  font-weight: 700;
  line-height: 1;
  letter-spacing: -0.01em;
  white-space: nowrap;
  color: #232323;
  outline: none;
}

.s21-badge-title:focus-visible {
  box-shadow: 0 0 0 2px #236f7a;
  border-radius: 4px;
}

/* ---------- Heading + bullets (same size, regular weight) ---------- */
.s21-heading,
.s21-bullet {
  font-size: clamp(16px, 2.3vw, 26px);
  font-weight: 400;
  line-height: 1.3;
  letter-spacing: -0.005em;
  text-align: left;
  color: #232323;
}

.s21-heading {
  margin: 0;
}

.s21-bullets {
  width: 100%;
  margin: 0;
  padding-left: clamp(24px, 3.4vw, 38px);
  list-style: disc;
}

/* ---------- Illustration: fills the leftover space ---------- */
.s21-figure {
  position: relative;
  flex: 1 1 0;
  width: 100%;
  max-width: 620px;
  min-height: 160px; /* below this the slide scrolls instead of shrinking */
  align-self: center;
  margin: 0;
}

.s21-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center top;
  mix-blend-mode: multiply; /* hides the beige box against the page background */
  user-select: none;
}

/* ---------- Small phones ---------- */
@media (max-width: 599px) {
  .s21-root { --s21-nav-space: 96px; }
  .s21-figure { min-height: 180px; }
}

/* ---------- Phone landscape: text left, image right ---------- */
@media (orientation: landscape) and (max-height: 520px) {
  .s21-root {
    --s21-nav-space: 64px;
    padding-top: 10px;
  }
  .s21-content {
    max-width: 100%;
    flex-direction: row;
    align-items: stretch;
    gap: 16px;
  }
  .s21-text {
    flex: 1 1 50%;
    justify-content: center;
  }
  .s21-badge {
    min-width: 110px;
    height: 40px;
    margin-bottom: 8px;
  }
  .s21-badge-title { font-size: 14px; }
  .s21-heading,
  .s21-bullet { font-size: 14px; line-height: 1.3; }
  .s21-bullets { padding-left: 18px; }
  .s21-figure {
    flex: 1 1 50%;
    min-height: 120px;
    align-self: stretch;
  }
  .s21-image { object-position: center center; }
}

@media (max-width: 640px) {
  .s21-root {
    padding-bottom: 1.5rem !important;
  }
}

.s21-audio {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 10px auto 0 auto;
  z-index: 25;
}
.s21-root .slide-nav {
  margin: 10px auto 0.25rem auto !important;
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

const BULLETS = [
  {
    en: "The test can help you learn the truth about your child’s past reaction.",
    es: "La prueba puede ayudarle a conocer la verdad sobre la reacción pasada de su hijo.",
  },
  {
    en: "The test may help your child get better medicine in the future.",
    es: "La prueba puede ayudar a que su hijo reciba mejores medicamentos en el futuro.",
  },
];

export function Slide21WhatNowScreen({
  isSpanish = false,
  medicationName,
  onNext,
  onBack,
  loading = false,
  navProps,
  audioSrc,
  stepId,
  locale,
  transcriptText,
}: Slide21WhatNowScreenProps) {
  const headingRef = useRef<HTMLHeadingElement | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => headingRef.current?.focus(), 50);
    return () => clearTimeout(timer);
  }, []);

  const rawTitle = isSpanish
    ? "¡Hable con el médico de su hijo sobre la prueba de alergia a [name]!"
    : "Talk to your child’s doctor about [name] allergy testing!";

  const titleText = resolveMedicineToken(rawTitle, medicationName, isSpanish);

  const handleNext = () => (onNext ? onNext() : navProps?.onNext());
  const handleBack = () => (onBack ? onBack() : navProps?.onBack());
  const isLoading = loading || navProps?.loading || false;

  const effectiveAudioSrc =
    audioSrc ||
    (isSpanish
      ? "/audio/es/step-21.mp3"
      : "/audio/en/step-21.mp3");

  const effectiveTranscript =
    transcriptText ||
    (isSpanish
      ? "¿Qué sigue ahora? Hable con el médico de su hijo sobre la prueba de alergia a la medicina."
      : "What Now? Talk to your child’s doctor about allergy testing.");

  return (
    <div id="slide-content" className="s21-root">
      <style>{SLIDE21_CSS}</style>

      <main className="s21-content">
        <div className="s21-text">
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

          <h1 className="s21-heading">{titleText}</h1>

          <ul className="s21-bullets" aria-label={titleText}>
            {BULLETS.map((b) => {
              const text = resolveMedicineToken(
                isSpanish ? b.es : b.en,
                medicationName,
                isSpanish
              );
              return (
                <li key={b.en} className="s21-bullet">
                  {text}
                </li>
              );
            })}
          </ul>
        </div>

        <figure className="s21-figure" aria-hidden="true">
          <img
            src="/images/doctor-consultation.png"
            alt={
              isSpanish
                ? "Madre e hija consultando con la pediatra sobre las pruebas de alergia"
                : "Mother and daughter consulting with pediatrician about allergy testing"
            }
            className="s21-image"
            draggable={false}
          />
        </figure>
      </main>

      {/* Audio narration & CC controls (mobile: centered above Back & Next) */}
      <div className="s21-audio md:hidden">
        <AudioPlayer
          audioSrc={effectiveAudioSrc}
          stepId={stepId || "slide21_what_now"}
          locale={locale || (isSpanish ? "es" : "en")}
          transcriptText={effectiveTranscript}
          size="large"
        />
      </div>

      <SlideNavigationButtons
        onBack={handleBack}
        onNext={handleNext}
        isSpanish={isSpanish}
        loading={isLoading}
      />
    </div>
  );
}

export default Slide21WhatNowScreen;