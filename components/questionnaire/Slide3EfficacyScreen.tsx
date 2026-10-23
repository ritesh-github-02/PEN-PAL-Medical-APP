"use client";

import React, { useState, useRef, useEffect } from "react";
import AudioPlayer from "./AudioPlayer";
import SlideNavigationButtons from "./SlideNavigationButtons";
import { resolveMedicineToken } from "@/lib/token-engine";

export interface Slide3EfficacyScreenProps {
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

const STAGE_W = 750;
const STAGE_H = 530;

/** Speech-bubble smooth curved Bezier artwork pointing down-right toward Nurse Anna. */
const BUBBLE_BEZIER_PATH =
  "M 182.5 12 " +
  "C 275 12, 350 52, 350 101 " +
  "C 350 138, 318 168, 268 180 " +
  "C 285 198, 305 222, 312 244 " +
  "C 290 226, 258 206, 222 188 " +
  "C 209 189.5, 196 190, 182.5 190 " +
  "C 90 190, 15 150, 15 101 " +
  "C 15 52, 90 12, 182.5 12 " +
  "Z";

/**
 * Stacked layout for phones (< 768px). Declared once and reused for both
 * the media query and the explicit `variant="mobile"` mode.
 */
const mobileLayout = (scope: string) => `
  ${scope} {
    overflow-y: auto !important;
    overflow-x: hidden !important;
    -webkit-overflow-scrolling: touch !important;
    height: auto !important;
    max-height: calc(100dvh - 80px) !important;
    min-height: 0 !important;
    overflow: visible !important;
    flex: 0 1 auto !important;
    display: flex !important;
    flex-direction: column !important;
    justify-content: center !important;
    align-items: center !important;
    padding: clamp(14px, 2.4vh, 20px) clamp(12px, 3.5vw, 18px) !important;
    gap: clamp(8px, 1.8vh, 14px) !important;
  }
  ${scope} .s3-stage {
    position: relative !important;
    width: 100% !important;
    max-width: 380px !important;
    height: auto !important;
    flex: 0 1 auto !important;
    min-height: 0 !important;
    overflow: visible !important;
    transform: none !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    justify-content: center !important;
    background-color: transparent !important;
    padding: 0 !important;
    margin: 0 auto !important;
    gap: 8px !important;
  }
  ${scope} .s3-left-col {
    position: static !important;
    width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
  }
  ${scope} .s3-heading {
    position: static !important;
    width: 100% !important;
    font-size: clamp(12.5px, 1.8vh, 14.5px) !important;
    line-height: 1.3 !important;
    text-align: center !important;
    margin: 0 !important;
  }
  ${scope} .s3-character-wrap {
    position: relative !important;
    left: auto !important;
    top: auto !important;
    width: 100% !important;
    height: auto !important;
    flex: 0 1 auto !important;
    min-height: 0 !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    justify-content: center !important;
    margin: 0 !important;
  }
  ${scope} .s3-bubble {
    position: relative !important;
    left: auto !important;
    top: auto !important;
    width: clamp(220px, 66vw, 275px) !important;
    aspect-ratio: 380 / 250 !important;
    height: auto !important;
    margin: 0 auto !important;
    filter: drop-shadow(2px 3px 0px #1a3532) !important;
  }
  ${scope} .s3-bubble-text-wrap {
    top: 42% !important;
    left: 48% !important;
    width: 82% !important;
    max-width: 240px !important;
    padding: 0 6px !important;
    box-sizing: border-box !important;
  }
  ${scope} .s3-bubble-text {
    font-size: clamp(10.5px, 1.45vh, 12px) !important;
    line-height: 1.34 !important;
    word-break: normal !important;
    overflow-wrap: break-word !important;
  }
  ${scope} .s3-nurse {
    position: relative !important;
    left: auto !important;
    top: auto !important;
    width: clamp(55px, 14vw, 75px) !important;
    height: clamp(80px, 12vh, 105px) !important;
    margin-top: -14px !important;
    margin-left: auto !important;
    margin-right: 14% !important;
  }
  ${scope} .s3-nurse-img {
    height: 100% !important;
    max-height: 100% !important;
    object-fit: contain !important;
  }
  ${scope} .s3-audio {
    display: flex !important;
    justify-content: center !important;
    margin: 4px auto 0 auto !important;
    z-index: 25 !important;
  }
  ${scope} .slide-nav {
    margin: 4px auto 0.15rem auto !important;
  }
`;

const SLIDE3_CSS = `
  /* ------------------------------------------------------------
     WCAG 2.1 / 2.2 Level AAA Accessibility & Stage Layout
     ------------------------------------------------------------ */
  .s3-root,
  .s3-root *,
  .s3-root *::before,
  .s3-root *::after {
    box-sizing: border-box;
  }

  .s3-root {
    position: relative;
    width: 100%;
    height: 100%;
    flex: 1 1 0%;
    min-height: 0;
    overflow: hidden;
    background-color: #fafdf3;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: "Plus Jakarta Sans", "Inter", system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
    color: #142724;
  }

  .s3-stage {
    position: relative;
    width: ${STAGE_W}px;
    height: ${STAGE_H}px;
    flex: none;
    transform-origin: center center;
    background-color: transparent;
  }



  .s3-left-col {
    position: absolute;
    left: 40px;
    top: 33px;
    width: 440px;
    margin: 0;
    padding: 0;
    z-index: 5;
}

  .s3-heading {
    margin: 0;
    padding: 0;
    font-size: 20px;
    line-height: 1.38;
    font-weight: 700;
    letter-spacing: -0.012em;
    color: #142724;
    outline: none;
  }

  .s3-heading:focus-visible {
    outline: 2px dashed #143833;
    outline-offset: 4px;
    border-radius: 4px;
  }

  /* 2. Speech Bubble (Oval with tail pointing down-right toward Nurse Anna) */
  .s3-bubble {
    position: absolute;
    left: 378px;
    top: 106px;
    width:  297px;
    aspect-ratio: 380 / 250;
    height: auto;
    filter: drop-shadow(2.5px 3.5px 0px #1a3532);
    z-index: 6;
    margin: 0;
    padding: 0;
  }

  .s3-bubble-svg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    overflow: visible;
  }

  .s3-bubble-text-wrap {
    position: absolute;
    top: 40%;
    left: 48%;
    transform: translate(-50%, -50%);
    width: 76%;
    max-width: 220px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    pointer-events: none;
  }

  .s3-bubble-text {
    margin: 0;
    padding: 0;
    font-size: 13px;
    line-height: 1.45;
    font-weight: 600;
    color: #142724;
    text-align: center;
    letter-spacing: -0.01em;
  }

  /* 3. Nurse Anna standing on Right under bubble tail */
  .s3-nurse {
    position: absolute;
    left: 585px;
    top: 228px;
    width: 120px;
    height: 236px;
    z-index: 20;
    pointer-events: none;
    display: flex;
    align-items: center;
    justify-content: center;
    user-select: none;
    -webkit-user-drag: none;
  }

  .s3-nurse-img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
    filter: drop-shadow(0 4px 10px rgba(20, 50, 45, 0.08));
  }

  /* Audio Player: Desktop provided by PenpalIntervention tablet frame, mobile inline */
  .s3-audio {
    display: none !important;
  }

  @media (max-width: 767px) {
    ${mobileLayout(".s3-root")}
  }

  ${mobileLayout(".s3-root.is-mobile")}

  /* Prefers-Reduced-Motion (WCAG 2.3.3) */
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.001ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.001ms !important;
    }
  }
`;

export function Slide3EfficacyScreen({
  isSpanish = false,
  medicationName,
  variant = "auto",
  onNext,
  onBack,
  loading = false,
  audioSrc,
  stepId = "slide3_efficacy",
  locale,
  transcriptText,
}: Slide3EfficacyScreenProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const [scale, setScale] = useState(1);

  const isEs = (locale ?? "").startsWith("es") || isSpanish;

  // Programmatic focus on mount (WCAG 2.4.3 Focus Order)
  useEffect(() => {
    const timer = setTimeout(() => headingRef.current?.focus(), 50);
    return () => clearTimeout(timer);
  }, []);

  // Standardized dynamic responsive stage scaling across all viewports
  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;

    const update = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (w && h) {
        if (variant === "mobile" || window.innerWidth < 768) {
          setScale(1);
        } else {
          const safeW = Math.max(0, w - 24);
          const safeH = Math.max(0, h - 24);
          setScale(Math.min(safeW / STAGE_W, safeH / STAGE_H));
        }
      }
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [variant]);

  const rawMed = medicationName && medicationName.trim()
    ? medicationName.trim()
    : isEs
      ? "la amoxicilina"
      : "amoxicillin";

  const rawHeadingEn = `Many kids have had [name] because it's the best for treating common ear, sinus and throat infections. It is also one of the best antibiotics in adults, too.`;
  const rawHeadingEs = `Muchos niños han tomado [name] porque es el mejor para tratar infecciones comunes de oído, senos paranasales y garganta. También es uno de los mejores antibióticos para adultos.`;

  const headingText = resolveMedicineToken(isEs ? rawHeadingEs : rawHeadingEn, rawMed, isEs);

  const bubbleText = isEs
    ? `${rawMed} es un medicamento maravilloso, pero como todos los antibióticos no funciona bien para los resfriados comunes o la gripe.`
    : `${rawMed} is a wonder drug, but like all antibiotics it doesn't work well for common colds or the flu.`;

  const captionText = transcriptText || `${headingText} ${bubbleText}`;

  const effectiveAudioSrc =
    audioSrc ||
    (isEs
      ? "/audio/exported/slide3_efficacy_es.mp3"
      : "/audio/exported/slide3_efficacy_en.mp3");

  const variantClass = variant === "mobile" ? " is-mobile" : variant === "desktop" ? " is-desktop" : "";

  return (
    <div
      id="slide-content"
      ref={rootRef}
      className={`s3-root${variantClass}`}
      role="region"
      aria-roledescription="slide"
      aria-labelledby="s3-screen-heading"
      lang={isEs ? "es" : "en"}
    >
      <style dangerouslySetInnerHTML={{ __html: SLIDE3_CSS }} />

      {/* Scaled stage container (Seamless with tablet frame — no double card borders/shadows) */}
      <div className="s3-stage" style={{ transform: `scale(${scale})` }}>
        {/* 1. Left Column: Statement Heading */}
        <div className="s3-left-col">
          <h1
            ref={headingRef}
            tabIndex={-1}
            className="s3-heading"
            id="s3-screen-heading"
          >
            {headingText}
          </h1>
        </div>

        {/* 2. Speech Bubble pointing down-right toward Nurse Anna */}
        <figure
          className="s3-bubble"
          role="group"
          aria-label={isEs ? "Comentario de la enfermera Anna" : "Nurse Anna statement"}
        >
          <svg
            className="s3-bubble-svg"
            viewBox="0 0 380 250"
            fill="none"
            aria-hidden="true"
            focusable="false"
          >
            <defs>
              <pattern id="s3-cmp-dot-grid" width="16" height="16" patternUnits="userSpaceOnUse">
                <circle cx="8" cy="8" r="0.75" fill="#cadada" opacity="0.6" />
              </pattern>
            </defs>

            <path
              d={BUBBLE_BEZIER_PATH}
              fill="#ffffff"
              stroke="#7baea9"
              strokeWidth="3.5"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            <path d={BUBBLE_BEZIER_PATH} fill="url(#s3-cmp-dot-grid)" />
          </svg>

          <div className="s3-bubble-text-wrap">
            <blockquote className="s3-bubble-text">
              {bubbleText}
            </blockquote>
          </div>
        </figure>

        {/* 3. Nurse Anna standing on Right under bubble tail */}
        <div className="s3-nurse" aria-hidden="true">
          <img
            src="/images/nurse-anna.png"
            alt={isEs ? "Ilustración de la enfermera Anna" : "Nurse Anna"}
            className="s3-nurse-img"
            draggable={false}
          />
        </div>

        {/* 4. Inline Audio Player for Mobile (hidden on desktop; desktop uses PenpalIntervention frame player) */}
        <div className="s3-audio">
          <AudioPlayer
            audioSrc={effectiveAudioSrc}
            stepId={stepId}
            locale={isEs ? "es" : "en"}
            transcriptText={captionText}
            size="large"
          />
        </div>
      </div>

      {/* 5. Fixed Centered Bottom Navigation (Back & Next) */}
      <SlideNavigationButtons
        onBack={onBack}
        onNext={onNext}
        isSpanish={isEs}
        loading={loading}
      />
    </div>
  );
}

export default Slide3EfficacyScreen;
