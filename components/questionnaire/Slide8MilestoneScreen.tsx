"use client";

import React, { useState, useRef, useEffect } from "react";
import AudioPlayer from "./AudioPlayer";
import SlideNavigationButtons from "./SlideNavigationButtons";

export interface Slide8MilestoneScreenProps {
  isSpanish?: boolean;
  medicationName?: string;
  variant?: "auto" | "desktop" | "mobile";
  onNext?: () => void;
  onBack?: () => void;
  loading?: boolean;
  audioSrc?: string;
  stepId?: string;
  locale?: string;
  transcriptText?: string;
}

/* Organic curved Bezier speech bubble, sweeping rightward toward Anna */
const BUBBLE_PATH_RIGHT =
  "M 377 242 " +
  "C 407 255, 462 270, 484 276 " +
  "C 460 258, 426 230, 418 208 " +
  "C 460 172, 468 110, 420 62 " +
  "C 364 14, 232 8, 132 28 " +
  "C 42 46, 7 112, 17 168 " +
  "C 27 224, 82 264, 192 272 " +
  "C 272 278, 342 262, 377 242 Z";

const SLIDE8_COMPONENT_CSS = `
  /* ------------------------------------------------------------
     WCAG 2.1 / 2.2 Level AAA & WAVE Immunity Accessibility Rules
     ------------------------------------------------------------ */

  /* Screen Reader Only Utility (WCAG 1.3.1, 4.1.2, 4.1.3) */
  .s8-sr-only {
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
  .s8-component-card button:focus-visible,
  .s8-component-card [tabindex="0"]:focus-visible {
    outline: 3px solid #143833 !important;
    outline-offset: 3px !important;
  }

  /* Heading programmatic focus without unwanted mouse-click rings */
  .s8-heading:focus,
  .s8-heading:focus-visible {
    outline: none !important;
  }

  /* Primary Slide Card Container */
  .s8-component-card {
    position: relative;
    width: 100%;
    max-width: 896px;
    height: 100%;
    max-height: 100%;
    aspect-ratio: 896 / 620;
    background-color: #fafdf3;
    border-radius: 28px;
    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.04);
    border: 1px solid rgba(120, 165, 155, 0.28);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    overflow: hidden;
    padding: 30px 48px 24px 48px;
    box-sizing: border-box;
    font-family: "Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  }

  .s8-stage-body {
    flex: 1;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 16px;
    min-height: 0;
    position: relative;
  }

  /* 1. Speech Bubble on Left (Tail pointing rightward toward Nurse Anna) */
  .s8-bubble-wrap {
    position: relative;
    width: 500px;
    max-width: 60%;
    aspect-ratio: 510 / 315;
    flex-shrink: 0;
    filter: drop-shadow(2.5px 3.5px 0px #1a3532);
    margin-right: -23px;
    margin-top: -216px;
    z-index: 5;
  }

  .s8-bubble-svg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    overflow: visible;
    display: block;
  }

  .s8-bubble-text-wrap {
    position: absolute;
    top: 48%;
    left: 46%;
    transform: translate(-50%, -50%);
    width: 78%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 0;
    margin: 0;
    box-sizing: border-box;
    pointer-events: none;
    z-index: 2;
  }

  .s8-heading {
    margin: 0;
    padding: 0;
    width: 100%;
    font-size: 14.5px;
    line-height: 1.42;
    font-weight: 700;
    color: #142724;
    text-align: center;
    letter-spacing: -0.012em;
    outline: none;
    word-break: break-word;
    overflow-wrap: break-word;
  }

  .s8-heading-line {
    display: block;
    text-align: center;
    margin: 0 auto;
    width: 100%;
  }

  /* 2. Nurse Anna standing on Right (Strictly decorative on Slide 2+) */
  .s8-nurse-wrap {
    position: relative;
    width: 118px;
    height: 360px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: -10px;
    z-index: 10;
    pointer-events: none;
    user-select: none;
  }

  .s8-nurse-img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
    user-select: none;
    -webkit-user-drag: none;
    filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.08));
  }

  /* ------------------------------------------------------------
     Bottom Bar: Centered Navigation & Bottom-Right Audio Controls
     ------------------------------------------------------------ */
  .s8-bottom-bar {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-shrink: 0;
    padding-top: 10px;
    position: relative;
    z-index: 20;
  }

  .s8-spacer-side {
    width: 110px;
    flex-shrink: 0;
  }

  /* Shared SlideNavigationButtons kept inline inside the footer bar */
  .s8-bottom-bar .slide-nav {
    position: static !important;
    bottom: auto !important;
    left: auto !important;
    right: auto !important;
    top: auto !important;
    flex: 1 1 auto !important;
    width: auto !important;
    max-width: none !important;
    margin: 0 auto !important;
    padding: 0 !important;
    gap: 14px !important;
  }

  /* Audio Controls wrap */
  .s8-audio-wrap {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    width: 110px;
    flex-shrink: 0;
  }

  /* Closed Captions Panel (WCAG 1.2.2 Captions, Contrast 14.8:1 AAA) */
  .s8-captions-panel {
    background: #143833;
    color: #ffffff;
    border: 1.5px solid #bddfd8;
    border-radius: 12px;
    padding: 8px 14px;
    margin-top: 6px;
    margin-bottom: 6px;
    display: flex;
    align-items: flex-start;
    gap: 10px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.18);
    z-index: 15;
  }
  .s8-captions-tag {
    background: #fdee8e;
    color: #1a2624;
    font-size: 11px;
    font-weight: 800;
    text-transform: uppercase;
    padding: 2px 6px;
    border-radius: 4px;
    flex-shrink: 0;
    letter-spacing: 0.05em;
  }
  .s8-captions-text {
    font-size: 13.5px;
    line-height: 1.4;
    margin: 0;
    font-weight: 500;
    color: #ffffff;
  }

  /* -------------------------------------------------------------
     EXPLICIT PREVIEW & MOBILE EMBEDDED MODES (.is-mobile)
     ------------------------------------------------------------- */
  .s8-component-card.is-mobile {
    aspect-ratio: auto !important;
    max-height: none !important;
    height: 100% !important;
    border-radius: 24px !important;
    padding: 16px 14px 12px 14px !important;
    overflow-y: auto !important;
  }
  .s8-component-card.is-mobile .s8-stage-body {
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    justify-content: space-evenly !important;
    gap: 8px !important;
  }
  .s8-component-card.is-mobile .s8-bubble-wrap {
    width: 100% !important;
    max-width: 320px !important;
    aspect-ratio: 510 / 315 !important;
    height: auto !important;
    margin: 0 auto !important;
    filter: drop-shadow(2px 3px 0px #1a3532) !important;
  }
  .s8-component-card.is-mobile .s8-heading {
    font-size: 14.5px !important;
    line-height: 1.38 !important;
  }
  .s8-component-card.is-mobile .s8-nurse-wrap {
    width: 125px !important;
    height: 215px !important;
    margin-top: -24px !important;
    margin-left: auto !important;
    margin-right: 48px !important;
  }
  .s8-component-card.is-mobile .s8-bottom-bar {
    flex: 0 0 auto !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    justify-content: center !important;
    gap: 10px !important;
    width: 100% !important;
    margin-top: auto !important;
    padding: 0.35rem 2px calc(0.4rem + env(safe-area-inset-bottom, 0px)) !important;
  }
  .s8-component-card.is-mobile .s8-spacer-side {
    display: none !important;
  }
  .s8-component-card.is-mobile .s8-audio-wrap {
    order: 1 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    width: 100% !important;
    margin: 0 auto !important;
  }
  .s8-component-card.is-mobile .s8-bottom-bar .slide-nav {
    order: 2 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    gap: 12px !important;
    width: auto !important;
    margin: 0 auto !important;
  }

  /* Responsive Fallback (< 768px) */
  @media (max-width: 767px) {
    .s8-component-card {
      aspect-ratio: auto;
      max-height: none;
      height: 100%;
      border-radius: 24px;
      padding: 16px 14px 12px 14px;
      overflow-y: auto;
    }
    .s8-stage-body {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-evenly;
      gap: 8px;
    }
    .s8-bubble-wrap {
      width: 100%;
      max-width: 280px;
      aspect-ratio: 510 / 315;
      height: auto;
      margin: 0 auto;
      filter: drop-shadow(2px 3px 0px #1a3532);
      left: -45px;
      top: 26px;
    }
    .s8-heading {
      font-size: 11.5px;
      line-height: 1.38;
    }
    .s8-nurse-wrap {
      width: 125px;
      height: 215px;
      margin-top: -24px;
      margin-left: auto;
      margin-right: 48px;
    }
    .s8-bottom-bar {
      flex: 0 0 auto !important;
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      justify-content: center !important;
      gap: 10px !important;
      width: 100% !important;
      margin-top: auto !important;
      padding: 0.35rem 2px calc(0.4rem + env(safe-area-inset-bottom, 0px)) !important;
    }
    .s8-spacer-side {
      display: none !important;
    }
    .s8-audio-wrap {
      order: 1 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      width: 100% !important;
      margin: 0 auto !important;
    }
    .s8-bottom-bar .slide-nav {
      order: 2 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      gap: 12px !important;
      width: auto !important;
      margin: 0 auto !important;
    }
  }

  /* Prefers-Reduced-Motion (WCAG 2.3.3 Level AAA) */
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.001ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.001ms !important;
      scroll-behavior: auto !important;
    }
  }
`;

export function Slide8MilestoneScreen({
  isSpanish = false,
  medicationName,
  variant = "auto",
  onNext,
  onBack,
  loading = false,
  audioSrc,
  stepId = "slide8_milestone",
  locale,
  transcriptText,
}: Slide8MilestoneScreenProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  const activeLocale = locale || (isSpanish ? "es" : "en");
  const isEs = activeLocale.startsWith("es") || isSpanish;

  // Programmatic focus on mount (WCAG 2.4.3 Focus Order)
  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, []);

  const effectiveAudioSrc =
    audioSrc ||
    (isEs
      ? "/audio/exported/slide8_milestone_es.mp3"
      : "/audio/exported/slide8_milestone_en.mp3");

  const spokenText =
    transcriptText ||
    (isEs
      ? "¡Buen trabajo! ¡Ahora ya sabe lo que es verdad sobre las alergias a la penicilina!"
      : "Great job! Now you know what is true about penicillin allergies!");

  const variantClass = variant === "mobile" ? " is-mobile" : variant === "desktop" ? " is-desktop" : "";

  return (
    <section
      className={`s8-component-card${variantClass}`}
      role="region"
      aria-roledescription="slide"
      aria-labelledby="slide8-heading"
      lang={isEs ? "es" : "en"}
    >
      <style dangerouslySetInnerHTML={{ __html: SLIDE8_COMPONENT_CSS }} />

      {/* Stage Body */}
      <div className="s8-stage-body">
        {/* 1. Speech Bubble on Left */}
        <div
          className="s8-bubble-wrap"
          role="region"
          aria-label={isEs ? "Celebración de hito" : "Milestone celebration"}
        >
          <svg
            className="s8-bubble-svg"
            viewBox="-20 -10 540 330"
            fill="none"
            aria-hidden="true"
            focusable="false"
          >
            <defs>
              <pattern id="s8-card-dot-pattern" width="16" height="16" patternUnits="userSpaceOnUse">
                <circle cx="8" cy="8" r="0.75" fill="#cadada" opacity="0.6" />
              </pattern>
            </defs>

            {/* Smooth Bezier Silhouette sweeping rightward toward Nurse Anna */}
            <path
              d={BUBBLE_PATH_RIGHT}
              fill="#ffffff"
              stroke="#7baea9"
              strokeWidth="3"
              strokeLinejoin="round"
              strokeLinecap="round"
            />

            {/* Faint Paper Dot Grid Overlay */}
            <path
              d={BUBBLE_PATH_RIGHT}
              fill="url(#s8-card-dot-pattern)"
            />
          </svg>

          {/* Centered Speech Text inside oval body */}
          <div className="s8-bubble-text-wrap">
            <h1 ref={headingRef} tabIndex={-1} className="s8-heading" id="slide8-heading">
              {isEs ? (
                <>
                  <span className="s8-heading-line">¡Buen trabajo! ¡Ahora ya sabe lo que</span>
                  <span className="s8-heading-line">es verdad sobre las alergias a la penicilina!</span>
                </>
              ) : (
                <>
                  <span className="s8-heading-line">Great job! Now you know what</span>
                  <span className="s8-heading-line">is true about penicillin allergies!</span>
                </>
              )}
            </h1>
          </div>
        </div>

        {/* 2. Nurse Anna standing on Right (Strictly decorative on Slide 2+) */}
        <div className="s8-nurse-wrap" aria-hidden="true">
          <img
            src="/images/nurse-anna.png"
            alt=""
            className="s8-nurse-img"
            draggable={false}
          />
        </div>
      </div>

      {/* 3. Bottom Navigation & Audio Controls (WCAG 2.4.1 Toolbar) */}
      <footer
        className="s8-bottom-bar"
        role="toolbar"
        aria-label={isEs ? "Controles de navegación y audio" : "Slide navigation and media controls"}
      >
        <div className="s8-spacer-side" aria-hidden="true" />

        {/* Centered Navigation Buttons (Back & Next) */}
        <SlideNavigationButtons
          onBack={onBack}
          onNext={onNext}
          isSpanish={isEs}
          loading={loading}
        />

        {/* Audio narration & CC controls */}
        <div className="s8-audio-wrap s8-spacer-side">
          {/* <AudioPlayer
            audioSrc={effectiveAudioSrc}
            stepId={stepId}
            locale={isEs ? "es" : "en"}
            transcriptText={spokenText}
            size="large"
          /> */}
        </div>
      </footer>
    </section>
  );
}

export default Slide8MilestoneScreen;
