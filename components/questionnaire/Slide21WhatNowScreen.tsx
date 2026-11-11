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

/* Wrapper Containers (transparent to desktop layout, structural on mobile) */
.s21-main-stage {
  display: contents;
}
.s21-bottom-bar {
  display: contents;
}

.s21-audio {
  position: absolute;
  right: 22px;
  bottom: clamp(16px, 3vh, 22px);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  z-index: 30;
}
.s21-root .slide-nav {
  margin: 10px auto 0.25rem auto !important;
}

${(() => {
  const s21MobileLayout = (scope: string) => `
    ${scope} {
      --s21-nav-space: 0px !important;
      overflow-y: auto !important;
      overflow-x: hidden !important;
      height: 100% !important;
      max-height: 100% !important;
      min-height: 100% !important;
      flex: 1 1 auto !important;
      display: flex !important;
      flex-direction: column !important;
      justify-content: space-between !important;
      align-items: center !important;
      padding: 14px 16px 12px 16px !important;
      gap: 10px !important;
      background-color: transparent !important;
      border: none !important;
      box-shadow: none !important;
      border-radius: 0 !important;
      box-sizing: border-box !important;
    }
    ${scope} .s21-main-stage {
      width: 100% !important;
      flex: 1 1 auto !important;
      min-height: 0 !important;
      display: flex !important;
      flex-direction: column !important;
      justify-content: space-evenly !important;
      align-items: center !important;
      margin: auto 0 !important;
    }
    ${scope} .s21-content {
      max-width: 360px !important;
      width: 100% !important;
      flex: 1 1 auto !important;
      min-height: 0 !important;
      display: flex !important;
      flex-direction: column !important;
      justify-content: space-evenly !important;
      align-items: center !important;
      gap: clamp(10px, 2vh, 18px) !important;
    }
    ${scope} .s21-text {
      width: 100% !important;
      align-items: center !important;
      flex-shrink: 0 !important;
    }
    ${scope} .s21-badge {
      min-width: 165px !important;
      height: auto !important;
      min-height: 44px !important;
      padding: 8px 20px !important;
      margin-bottom: 12px !important;
      border-radius: 14px !important;
    }
    ${scope} .s21-badge-title {
      font-size: clamp(16px, 2.4vh, 19px) !important;
      line-height: 1.2 !important;
    }
    ${scope} .s21-badge-title:focus:not(:focus-visible) {
      outline: none !important;
      box-shadow: none !important;
    }
    ${scope} .s21-heading {
      font-size: clamp(14px, 2vh, 16px) !important;
      line-height: 1.35 !important;
      font-weight: 600 !important;
      text-align: left !important;
      width: 100% !important;
      padding: 0 4px !important;
      margin-bottom: 6px !important;
    }
    ${scope} .s21-bullets {
      width: 100% !important;
      padding-left: 22px !important;
      margin: 2px 0 !important;
      display: flex !important;
      flex-direction: column !important;
      gap: 6px !important;
    }
    ${scope} .s21-bullet {
      font-size: clamp(13px, 1.8vh, 14.5px) !important;
      line-height: 1.38 !important;
      text-align: left !important;
    }
    ${scope} .s21-figure {
      flex: 1 1 0% !important;
      min-height: 110px !important;
      max-height: clamp(150px, 27vh, 220px) !important;
      width: 100% !important;
      margin: 0 auto !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
    }
    ${scope} .s21-image {
      position: relative !important;
      inset: auto !important;
      max-height: 100% !important;
      height: 100% !important;
      width: auto !important;
      max-width: 100% !important;
      margin: 0 auto !important;
      display: block !important;
      object-fit: contain !important;
      object-position: center center !important;
    }
    ${scope} .s21-bottom-bar {
      width: 100% !important;
      max-width: 360px !important;
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      justify-content: center !important;
      gap: clamp(10px, 1.8vh, 16px) !important;
      padding-top: 6px !important;
      padding-bottom: calc(10px + env(safe-area-inset-bottom, 0px)) !important;
      margin: 0 auto !important;
      flex-shrink: 0 !important;
      z-index: 25 !important;
      pointer-events: auto !important;
    }
    ${scope} .s21-audio {
      order: 1 !important;
      position: static !important;
      right: auto !important;
      bottom: auto !important;
      width: 100% !important;
      display: flex !important;
      justify-content: center !important;
      margin: 0 auto !important;
      color: #144e57 !important;
      z-index: 25 !important;
      pointer-events: auto !important;
    }
    ${scope} .s21-audio > div {
      gap: 8px !important;
    }
    ${scope} .s21-audio .audio-cc-btn,
    ${scope} .s21-audio .audio-play-btn {
      color: #144e57 !important;
      min-width: 44px !important;
      min-height: 44px !important;
      padding: 4px !important;
    }
    ${scope} .s21-audio .audio-cc-btn svg,
    ${scope} .s21-audio .audio-play-btn svg {
      height: 34px !important;
      width: auto !important;
    }
    ${scope} .slide-nav {
      order: 2 !important;
      position: relative !important;
      bottom: auto !important;
      top: auto !important;
      left: auto !important;
      right: auto !important;
      margin: 0 auto !important;
      gap: 16px !important;
      pointer-events: auto !important;
    }
    ${scope} .slide-nav-btn {
      min-width: 128px !important;
      padding: 0 32px !important;
    }
  `;
  return `
    ${s21MobileLayout(".s21-root.is-mobile")}
    @media (max-width: 767px) {
      ${s21MobileLayout(".s21-root:not(.is-desktop)")}
      .s21-root:not(.is-desktop) {
        min-height: min(640px, calc(100dvh - 80px)) !important;
        max-height: calc(100dvh - 72px) !important;
      }
    }
    @media (max-width: 767px) and (max-height: 620px) {
      .s21-root:not(.is-desktop) .s21-figure {
        min-height: 85px !important;
        max-height: clamp(105px, 20vh, 145px) !important;
      }
    }
  `;
})()}

/* ---------- Phone landscape: text left, image right ---------- */
@media (orientation: landscape) and (max-height: 520px) {
  .s21-root {
    --s21-nav-space: 64px;
    padding-top: 10px !important;
  }
  .s21-root:not(.is-desktop) .s21-content {
    max-width: 100% !important;
    flex-direction: row !important;
    align-items: stretch !important;
    gap: 16px !important;
  }
  .s21-root:not(.is-desktop) .s21-text {
    flex: 1 1 50% !important;
    align-items: flex-start !important;
    justify-content: center !important;
  }
  .s21-badge {
    min-width: 110px !important;
    min-height: 38px !important;
    height: 40px !important;
    padding: 0 14px !important;
    margin-bottom: 8px !important;
  }
  .s21-badge-title { font-size: 14px !important; }
  .s21-heading,
  .s21-bullet { font-size: 13px !important; line-height: 1.3 !important; }
  .s21-bullets { padding-left: 18px !important; }
  .s21-root:not(.is-desktop) .s21-figure {
    flex: 1 1 50% !important;
    min-height: 120px !important;
    max-height: none !important;
    align-self: stretch !important;
  }
  .s21-image { object-position: center center !important; }
}
`;

export interface Slide21WhatNowScreenProps {
  variant?: "auto" | "desktop" | "mobile";
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
  variant = "auto",
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

  const variantClass =
    variant === "mobile"
      ? " is-mobile"
      : variant === "desktop"
      ? " is-desktop"
      : "";

  return (
    <div id="slide-content" className={`s21-root${variantClass}`}>
      <style>{SLIDE21_CSS}</style>

      <div className="s21-main-stage">
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
      </div>

      {/* Bottom Controls Container (audio on top of pill navigation on mobile) */}
      <div className="s21-bottom-bar">
        {/* Audio narration & CC controls (bottom-right like Slide 5) */}
        <div className="s21-audio">
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
    </div>
  );
}

export default Slide21WhatNowScreen;