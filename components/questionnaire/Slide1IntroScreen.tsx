"use client";

import React, { useRef, useEffect, useCallback, memo } from "react";
import { NurseAnna } from "./NurseAnna";
import AudioPlayer from "./AudioPlayer";

export interface Slide1IntroScreenProps {
  title?: string;
  description?: string;
  content?: string;
  onNext?: (answer?: string) => void;
  onAnswer?: (val: string) => void;
  loading?: boolean;
  locale?: string;
  isSpanish?: boolean;
  headingRef?: React.RefObject<HTMLHeadingElement | null>;
  audioSrc?: string;
  stepId?: string;
  transcriptText?: string;
  autoFocusHeading?: boolean;
  variant?: "auto" | "desktop" | "mobile";
}

const SLIDE1_COMPONENT_CSS = `
  /* ------------------------------------------------------------
     Slide 1: WCAG 2.1/2.2 Level AAA, WAVE & Karen Accessibility Rules
     ------------------------------------------------------------ */

  /* Screen Reader Only Utility (WCAG 1.3.1, 4.1.2) */
  .s1-sr-only {
    position: absolute !important;
    width: 1px !important;
    height: 1px !important;
    padding: 0 !important;
    margin: -1px !important;
    overflow: hidden !important;
    clip: rect(0, 0, 0, 0) !important;
    white-space: nowrap !important;
    border: 0 !important;
  }

  /* Universal High Contrast Focus Indicator (WCAG 2.4.7, 2.4.11, 2.4.13 Level AAA) */
  .s1-component-root button:focus-visible,
  .s1-component-root a:focus-visible,
  .s1-component-root [tabindex="0"]:focus-visible {
    outline: 3px solid #143833 !important;
    outline-offset: 3px !important;
  }

  /* Heading programmatic focus without unwanted mouse-click rings */
  .s1-title:focus,
  .s1-title:focus-visible {
    outline: none !important;
  }

  /* Base container layout */
  .s1-content-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    max-width: 820px;
    margin: auto;
    gap: 32px;
    padding: 8px;
    box-sizing: border-box;
  }

  .s1-left-col {
    flex: 1 1 0%;
    max-width: 500px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    text-align: left;
    gap: 12px;
    z-index: 10;
  }

  .s1-nurse-col {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
  }

  /* "Get Started!" Action Button (WCAG 2.5.5 AAA Target Size >= 44px) */
  .s1-btn-start {
    min-height: 48px;
    min-width: 140px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 9999px;
    background-color: #fde989;
    color: #1b3b32;
    border: 1.5px solid #dcc65b;
    font-weight: 700;
    font-size: 16px;
    padding: 0 28px;
    box-shadow: 0 2px 6px rgba(18, 64, 61, 0.15);
    transition: transform 0.12s ease, background-color 0.15s ease, box-shadow 0.15s ease;
    cursor: pointer;
    user-select: none;
  }
  .s1-btn-start:hover:not(:disabled) {
    background-color: #f6df71;
    transform: translateY(-1px);
    box-shadow: 0 4px 10px rgba(18, 64, 61, 0.2);
  }
  .s1-btn-start:active:not(:disabled) {
    transform: translateY(1px);
    box-shadow: 0 1px 3px rgba(18, 64, 61, 0.12);
  }
  .s1-btn-start:focus-visible {
    outline: 3px solid #143833 !important;
    outline-offset: 3px !important;
  }
  .s1-btn-start:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    box-shadow: none;
  }

  /* -------------------------------------------------------------
     Mobile Layout (.is-mobile or screen width < 768px)
     - Content scaled up generously to fill modern tall phone screens
     - Clear vertical breathing room, centered illustration & bold copy
     - Seamless mobile controls toolbar
     ------------------------------------------------------------- */
  @media (max-width: 767px) {
    .s1-component-root {
      overflow-y: auto !important;
      height: 100% !important;
      max-height: 100% !important;
      min-height: 100% !important;
      flex: 1 1 auto !important;
      padding: clamp(16px, 3.5vh, 28px) clamp(16px, 5vw, 24px) clamp(16px, 3vh, 24px) clamp(16px, 5vw, 24px) !important;
      justify-content: space-between !important;
      box-sizing: border-box !important;
    }
    .s1-content-container {
      flex: 1 1 auto !important;
      flex-direction: column !important;
      align-items: center !important;
      text-align: center !important;
      justify-content: center !important;
      gap: 0 !important;
      width: 100% !important;
      max-width: 420px !important;
      margin: auto !important;
      padding: 0 !important;
    }
    .s1-header-group {
      order: -1 !important;
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      text-align: center !important;
      gap: 4px !important;
      width: 100% !important;
      margin-bottom: clamp(14px, 2.5vh, 22px) !important;
    }
    .s1-nurse-col {
      order: 0 !important;
      margin: 0 auto !important;
      padding: 0 !important;
    }
    .s1-nurse-col img {
      max-height: clamp(155px, 24vh, 220px) !important;
      width: auto !important;
      filter: drop-shadow(0 6px 14px rgba(0, 0, 0, 0.12)) !important;
    }
    .s1-left-col {
      display: contents !important;
    }
    .s1-title {
      font-size: clamp(3.8rem, 14vw, 5.2rem) !important;
      line-height: 0.98 !important;
      white-space: nowrap !important;
      letter-spacing: -0.03em !important;
      text-align: center !important;
      margin: 0 !important;
    }
    .s1-subtitle {
      font-size: clamp(1.25rem, 4.6vw, 1.6rem) !important;
      line-height: 1.25 !important;
      margin-top: 6px !important;
      max-width: 380px !important;
      color: #143e3b !important;
      text-align: center !important;
    }
    .s1-copy {
      order: 1 !important;
      font-size: clamp(1rem, 3.8vw, 1.15rem) !important;
      line-height: 1.45 !important;
      margin-top: clamp(14px, 2.4vh, 22px) !important;
      margin-bottom: 0 !important;
      max-width: 340px !important;
      color: #143833 !important;
      text-align: center !important;
    }
    .s1-btn-start {
      min-height: 52px !important;
      height: 52px !important;
      min-width: 180px !important;
      font-size: 18px !important;
      font-weight: 800 !important;
      padding: 0 36px !important;
      border-radius: 9999px !important;
      box-shadow: 0 4px 12px rgba(18, 64, 61, 0.18) !important;
    }
    .s1-desktop-start {
      display: none !important;
    }
    .s1-mobile-nav {
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      justify-content: center !important;
      width: 100% !important;
      max-width: 320px !important;
      margin: clamp(14px, 2.5vh, 24px) auto 0 auto !important;
      gap: 12px !important;
    }
    .s1-mobile-nav .s1-audio-wrapper {
      width: 100% !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      margin-bottom: 2px !important;
    }
    .s1-mobile-nav .s1-btn-start {
      width: 100% !important;
      max-width: 260px !important;
    }
    .s1-audio-desktop {
      display: none !important;
    }
  }

  .s1-component-root.is-mobile .s1-desktop-start {
    display: none !important;
  }
  .s1-component-root.is-mobile .s1-audio-desktop {
    display: none !important;
  }
  .s1-component-root.is-mobile .s1-mobile-nav {
    display: flex !important;
  }

  @media (min-width: 768px) {
    .s1-component-root:not(.is-mobile) .s1-desktop-start {
      display: block !important;
    }
    .s1-component-root:not(.is-mobile) .s1-audio-desktop {
      display: flex !important;
    }
    .s1-component-root:not(.is-mobile) .s1-mobile-nav {
      display: none !important;
    }
  }

  /* Prefers Reduced Motion (WCAG 2.3.3) */
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.001ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.001ms !important;
    }
  }
`;

export const Slide1IntroScreen = memo(function Slide1IntroScreen({
  title = "PEN-PAL",
  description,
  content,
  onNext,
  onAnswer,
  loading = false,
  locale = "en",
  isSpanish: isSpanishProp,
  headingRef: externalHeadingRef,
  audioSrc = "/audio/exported/screen1_intro_en.mp3",
  stepId = "screen1_intro",
  transcriptText,
  autoFocusHeading = true,
  variant = "auto",
}: Slide1IntroScreenProps) {
  const isSpanish = isSpanishProp ?? locale === "es";
  const internalHeadingRef = useRef<HTMLHeadingElement | null>(null);
  const headingRef = externalHeadingRef || internalHeadingRef;

  // Programmatic focus on mount per Karen's review (WCAG 2.4.3 Focus Order)
  useEffect(() => {
    if (autoFocusHeading) {
      headingRef.current?.focus({ preventScroll: true });
    }
  }, [headingRef, autoFocusHeading]);

  const introSubtitle =
    description ||
    (isSpanish
      ? "Padres Involucrados en Alergias a la Penicilina"
      : "Parents Engaged in Penicillin Allergies");

  const mainCopy =
    content ||
    (isSpanish
      ? "¡Hola! Soy la enfermera Anna. Hablemos sobre las alergias a la penicilina en los niños."
      : "Hi! I'm nurse Anna. Let's talk about penicillin allergies in kids.");

  const effectiveAudioSrc =
    audioSrc ||
    (isSpanish
      ? "/audio/exported/screen1_intro_es.mp3"
      : "/audio/exported/screen1_intro_en.mp3");

  const effectiveTranscript =
    transcriptText ||
    (isSpanish
      ? "PEN-PAL. Padres Involucrados en Alergias a la Penicilina. ¡Hola! Soy la enfermera Anna. Hablemos sobre las alergias a la penicilina en los niños. ¡Comenzar!"
      : "PEN-PAL. Parents Engaged in Penicillin Allergies. Hi! I'm nurse Anna. Let's talk about penicillin allergies in kids. Get started.");

  const handleStart = useCallback(() => {
    if (loading) return;
    if (onAnswer) onAnswer("yes");
    if (onNext) onNext("yes");
  }, [loading, onAnswer, onNext]);

  const variantClass = variant === "mobile" ? " is-mobile" : variant === "desktop" ? " is-desktop" : "";

  return (
    <section
      id="slide-content"
      role="region"
      aria-roledescription="slide"
      aria-labelledby="slide1-primary-heading"
      lang={isSpanish ? "es" : "en"}
      className={`s1-component-root relative w-full h-full flex-1 min-h-0 flex flex-col justify-center px-4 sm:px-8 md:px-14 lg:px-16 py-3 sm:py-6 pb-16 sm:pb-6 overflow-y-auto${variantClass}`}
      style={{
        background: `
          radial-gradient(circle at 18% 20%, rgba(186, 203, 246, 0.95) 0%, rgba(186, 203, 246, 0) 48%),
          radial-gradient(circle at 12% 75%, rgba(162, 230, 228, 0.9) 0%, rgba(162, 230, 228, 0) 50%),
          radial-gradient(circle at 82% 18%, rgba(204, 246, 219, 0.9) 0%, rgba(204, 246, 219, 0) 48%),
          radial-gradient(circle at 88% 82%, rgba(235, 248, 208, 0.95) 0%, rgba(235, 248, 208, 0) 52%),
          linear-gradient(135deg, #c4d4f8 0%, #b2e7e3 28%, #cdf3da 62%, #ecf9d4 100%)
        `,
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: SLIDE1_COMPONENT_CSS }} />

      <div className="s1-content-container">
        {/* Left Column: Heading, Subtitle, Copy, and CTA Button */}
        <div className="s1-left-col">
          <div className="s1-header-group">
            {/* Golden-Yellow Title with Dark Teal Stroke & Drop Shadow (Level AAA Contrast > 9.5:1) */}
            <h1
              id="slide1-primary-heading"
              ref={headingRef}
              tabIndex={-1}
              className="s1-title text-3xl sm:text-4xl md:text-5xl lg:text-[3.35rem] font-black tracking-tight font-display select-none text-[#ebb016]"
              style={{
                WebkitTextStroke: "1.6px #12403d",
                paintOrder: "stroke fill",
                textShadow: "0 2px 0 #12403d, 0 3px 2px rgba(18, 64, 61, 0.3)",
              }}
            >
              {title || "PEN–PAL"}
            </h1>
            <p className="s1-subtitle text-sm sm:text-base md:text-lg lg:text-xl font-bold text-[#143e3b] mt-1 sm:mt-1.5 tracking-tight">
              {introSubtitle}
            </p>
          </div>

          <p className="s1-copy text-sm sm:text-base md:text-lg lg:text-[1.05rem] font-medium text-[#143833] leading-relaxed max-w-xs sm:max-w-sm md:max-w-md pt-0.5 sm:pt-2">
            {mainCopy}
          </p>

          {/* Desktop "Get Started!" Action Button */}
          <div className="s1-desktop-start pt-2 sm:pt-4">
            <button
              type="button"
              onClick={handleStart}
              disabled={loading}
              className="s1-btn-start"
              aria-label={
                isSpanish
                  ? "Comenzar - Iniciar la guía PEN-PAL"
                  : "Get Started - Begin the PEN-PAL guide"
              }
            >
              {loading ? "..." : isSpanish ? "¡Comenzar!" : "Get Started!"}
            </button>
          </div>
        </div>

        {/* Right Column: Nurse Anna Formal Introduction (Slide 1 ONLY: isDecorative={false}) */}
        <div className="s1-nurse-col">
          <NurseAnna
            size="md"
            imgClassName="w-24 sm:w-28 md:w-32 lg:w-36 max-h-[145px] sm:max-h-[190px] md:max-h-[220px] object-contain"
            isDecorative={false}
            locale={isSpanish ? "es" : "en"}
          />
        </div>
      </div>

      {/* Audio (CC & Play/Pause) Controls - Desktop only */}
      <footer
        className="s1-audio-desktop absolute right-3 sm:right-6 md:right-8 bottom-3 sm:bottom-4 md:bottom-5 z-30 flex items-center"
        role="toolbar"
        aria-label={isSpanish ? "Controles de audio y subtítulos" : "Slide audio and caption controls"}
      >
        <AudioPlayer
          audioSrc={effectiveAudioSrc}
          stepId={stepId}
          locale={isSpanish ? "es" : "en"}
          transcriptText={effectiveTranscript}
          size="large"
        />
      </footer>

      {/* Mobile Action & Audio Controls Toolbar: Audio on top, Get Started below */}
      <div className="s1-mobile-nav z-30">
        <div className="s1-audio-wrapper">
          <AudioPlayer
            audioSrc={effectiveAudioSrc}
            stepId={stepId}
            locale={isSpanish ? "es" : "en"}
            transcriptText={effectiveTranscript}
            size="large"
          />
        </div>

        <button
          type="button"
          onClick={handleStart}
          disabled={loading}
          className="s1-btn-start"
          aria-label={
            isSpanish
              ? "Comenzar - Iniciar la guía PEN-PAL"
              : "Get Started - Begin the PEN-PAL guide"
          }
        >
          {loading ? "..." : isSpanish ? "¡Comenzar!" : "Get Started!"}
        </button>
      </div>
    </section>
  );
});

export default Slide1IntroScreen;

