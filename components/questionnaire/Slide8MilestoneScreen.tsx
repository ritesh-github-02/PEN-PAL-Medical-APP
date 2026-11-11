"use client";

import React, { useRef, useEffect } from "react";
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
     Slide 7 (Milestone Celebration)
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

  /* Universal High Contrast Focus Indicator (WCAG 2.4.7 Level AAA) */
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


  .s8-bubble-wrap
  {
      position: relative;
      width: 500px;
      max-width: 58%;
      aspect-ratio: 510 / 315;
      flex-shrink: 0;
      filter: drop-shadow(2.5px 3.5px 0px #1a3532);
      margin-right: -31px;
      margin-top: -233px;
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
    line-height: 1.4;
    font-weight: 600;
    color: #142724;
    text-align: center;
    letter-spacing: -0.01em;
    outline: none;
    word-break: break-word;
    overflow-wrap: break-word;
    font-family: "Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
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

  /* Wrapper collapses on desktop so audio + nav keep independent absolute positioning */
  .s8-bottom-bar {
    display: contents;
  }

  /* ------------------------------------------------------------
     Bottom Audio Narration & CC Controls (Bottom-Right like Slide 5)
     ------------------------------------------------------------ */
  .s8-audio-wrap {
    position: absolute;
    right: 22px;
    bottom: clamp(16px, 3vh, 22px);
    display: flex;
    align-items: center;
    justify-content: flex-end;
    z-index: 35;
    pointer-events: auto;
  }

  /* ------------------------------------------------------------
     Centered SlideNavigationButtons (100% Centered horizontally across card)
     ------------------------------------------------------------ */
  .s8-component-card .slide-nav {
    position: absolute !important;
    bottom: clamp(16px, 3vh, 22px) !important;
    left: 0 !important;
    right: 0 !important;
    top: auto !important;
    margin: 0 auto !important;
    display: flex !important;
    justify-content: center !important;
    align-items: center !important;
    gap: 16px !important;
    width: 100% !important;
    max-width: 100% !important;
    z-index: 30 !important;
    pointer-events: none !important;
  }

  .s8-component-card .slide-nav-btn {
    pointer-events: auto !important;
  }

  ${(() => {
    const mobileLayout = (scope: string) => `
      ${scope} {
        aspect-ratio: auto !important;
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
        box-sizing: border-box !important;
        background-color: transparent !important;
        border: none !important;
        box-shadow: none !important;
        border-radius: 0 !important;
      }
      ${scope} .s8-stage-body {
        width: 100% !important;
        max-width: 380px !important;
        flex: 1 1 auto !important;
        height: auto !important;
        min-height: 0 !important;
        overflow: visible !important;
        display: flex !important;
        flex-direction: column !important;
        align-items: center !important;
        justify-content: center !important;
        margin: 0 auto !important;
        gap: 6px !important;
      }
      ${scope} .s8-bubble-wrap {
        width: clamp(275px, 84vw, 345px) !important;
        max-width: 345px !important;
        aspect-ratio: 510 / 315 !important;
        height: auto !important;
        position: relative !important;
        left: auto !important;
        top: auto !important;
        margin: 16px auto 0 auto !important;
        filter: drop-shadow(2px 3px 0px #1a3532) !important;
      }
      ${scope} .s8-bubble-text-wrap {
        position: absolute !important;
        top: 44% !important;
        left: 46% !important;
        transform: translate(-50%, -50%) !important;
        width: 82% !important;
        max-width: 265px !important;
        padding: 0 6px !important;
        margin: 0 !important;
        display: flex !important;
        flex-direction: column !important;
        align-items: center !important;
        justify-content: center !important;
        text-align: center !important;
        box-sizing: border-box !important;
      }
      ${scope} .s8-heading {
        font-size: clamp(14.5px, 2.15vh, 16.5px) !important;
        line-height: 1.38 !important;
        font-weight: 700 !important;
        color: #142724 !important;
        text-align: center !important;
        letter-spacing: -0.015em !important;
        word-break: normal !important;
        overflow-wrap: break-word !important;
      }
      ${scope} .s8-heading-line {
        display: block !important;
        text-align: center !important;
        margin: 0 auto !important;
        width: 100% !important;
      }
      ${scope} .s8-nurse-wrap {
        width: clamp(88px, 22vw, 112px) !important;
        height: clamp(135px, 21vh, 185px) !important;
        margin: -12px 10% 0 auto !important;
        z-index: 2 !important;
        flex-shrink: 0 !important;
      }
      ${scope} .s8-nurse-img {
        height: 100% !important;
        max-height: 100% !important;
        width: auto !important;
        object-fit: contain !important;
      }
      ${scope} .s8-bottom-bar {
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
      }
      ${scope} .s8-audio-wrap {
        order: 1 !important;
        position: static !important;
        right: auto !important;
        bottom: auto !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        width: 100% !important;
        margin: 0 auto !important;
        color: #144e57 !important;
        z-index: 25 !important;
      }
      ${scope} .s8-audio-wrap > div {
        gap: 8px !important;
      }
      ${scope} .s8-audio-wrap .audio-cc-btn,
      ${scope} .s8-audio-wrap .audio-play-btn {
        color: #144e57 !important;
        min-width: 44px !important;
        min-height: 44px !important;
        padding: 4px !important;
      }
      ${scope} .s8-audio-wrap .audio-cc-btn svg,
      ${scope} .s8-audio-wrap .audio-play-btn svg {
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
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        gap: 16px !important;
        width: 100% !important;
        margin: 0 auto !important;
        pointer-events: auto !important;
      }
      ${scope} .slide-nav-btn {
        min-width: 128px !important;
        padding: 0 32px !important;
      }
    `;
    return `
      ${mobileLayout(".s8-component-card.is-mobile")}
      @media (max-width: 767px) {
        ${mobileLayout(".s8-component-card:not(.is-desktop)")}
        .s8-component-card:not(.is-desktop) {
          min-height: min(640px, calc(100dvh - 80px)) !important;
          max-height: calc(100dvh - 72px) !important;
        }
      }
    `;
  })()}

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
                  <span className="s8-heading-line">¡Buen trabajo!</span>
                  <span className="s8-heading-line">¡Ahora ya sabe lo que es verdad</span>
                  <span className="s8-heading-line">sobre las alergias a la penicilina!</span>
                </>
              ) : (
                <>
                  <span className="s8-heading-line">Great job!</span>
                  <span className="s8-heading-line">Now you know what is true</span>
                  <span className="s8-heading-line">about penicillin allergies!</span>
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

      {/* 2. Bottom Controls (Audio above Back/Next on mobile; independent on desktop) */}
      <div className="s8-bottom-bar">
        <div className="s8-audio-wrap">
          <AudioPlayer
            audioSrc={effectiveAudioSrc}
            stepId={stepId}
            locale={isEs ? "es" : "en"}
            transcriptText={spokenText}
            size="large"
          />
        </div>

        <SlideNavigationButtons
          onBack={onBack}
          onNext={onNext}
          isSpanish={isEs}
          loading={loading}
        />
      </div>
    </section>
  );
}

export default Slide8MilestoneScreen;
