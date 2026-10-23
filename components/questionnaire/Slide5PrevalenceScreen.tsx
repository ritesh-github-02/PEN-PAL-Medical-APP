"use client";

import React, { useState, useRef, useEffect } from "react";
import AudioPlayer from "./AudioPlayer";
import SlideNavigationButtons from "./SlideNavigationButtons";
import { resolveMedicineToken } from "@/lib/token-engine";

export interface Slide5PrevalenceScreenProps {
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
const STAGE_H = 427;

/**
 * Stacked mobile layout (< 768px). Declared once, reused for both
 * the media query and explicit `variant="mobile"` mode.
 */
const mobileLayout = (scope: string) => `
  ${scope} {
    overflow: visible !important;
    height: auto !important;
    max-height: calc(100dvh - 80px) !important;
    min-height: 0 !important;
    flex: 0 1 auto !important;
    display: flex !important;
    flex-direction: column !important;
    justify-content: center !important;
    align-items: center !important;
    padding: clamp(14px, 2.4vh, 20px) clamp(12px, 3.5vw, 18px) !important;
    gap: clamp(8px, 1.8vh, 14px) !important;
  }
  ${scope} .s5-stage {
    position: relative !important;
    width: 100% !important;
    max-width: 440px !important;
    height: auto !important;
    flex: 0 1 auto !important;
    min-height: 0 !important;
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
  ${scope} .s5-badge {
    position: static !important;
    min-width: 130px !important;
    height: clamp(30px, 4.2vh, 36px) !important;
    border-radius: 12px !important;
    margin: 0 auto 0 0 !important;
    padding: 0 14px !important;
  }
  ${scope} .s5-badge-title {
    font-size: clamp(12px, 1.8vh, 14px) !important;
  }
  ${scope} .s5-text-wrap {
    position: static !important;
    width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
  }
  ${scope} .s5-heading {
    font-size: clamp(12px, 1.7vh, 14px) !important;
    line-height: 1.35 !important;
    text-align: left !important;
    margin: 0 !important;
  }
  ${scope} .s5-bold {
    font-size: clamp(13px, 1.9vh, 15px) !important;
  }
  ${scope} .s5-nurse {
    position: static !important;
    left: auto !important;
    top: auto !important;
    width: auto !important;
    height: clamp(80px, 13vh, 115px) !important;
    max-height: 115px !important;
    margin: 0 auto !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
  }
  ${scope} .s5-nurse-img {
    height: 100% !important;
    max-height: clamp(80px, 13vh, 115px) !important;
    width: auto !important;
    object-fit: contain !important;
  }
  ${scope} .s5-audio {
    position: static !important;
    right: auto !important;
    bottom: auto !important;
    display: flex !important;
    justify-content: center !important;
    margin: 2px auto 0 auto !important;
    z-index: 25 !important;
  }
  ${scope} .slide-nav {
    margin: 4px auto 0 auto !important;
  }
`;

const SLIDE5_CSS = `
  /* ------------------------------------------------------------
     Slide 5: WCAG 2.1/2.2 Level AAA — Prevalence Screen
     Transparent stage scaled within frame (no double borders)
     ------------------------------------------------------------ */
  .s5-root,
  .s5-root *,
  .s5-root *::before,
  .s5-root *::after {
    box-sizing: border-box;
  }

  .s5-root {
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
    color: #232323;
  }

  /* Screen Reader Only Utility (WCAG 1.3.1, 4.1.2) */
  .s5-sr-only {
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

  /* Universal High Contrast Focus Indicator */
  .s5-root button:focus-visible,
  .s5-root [tabindex="0"]:focus-visible {
    outline: 3px solid #143833 !important;
    outline-offset: 3px !important;
  }

  /* Transparent stage that scales as one composition */
  .s5-stage {
    position: relative;
    width: ${STAGE_W}px;
    height: ${STAGE_H}px;
    flex: none;
    transform-origin: center center;
    background-color: transparent;
  }

  /* 1. "Did You Know?" Yellow Badge — top-left */
  .s5-badge {
    position: absolute;
    left: 40px;
    top: 28px;
    min-width: 200px;
    height: 58px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0 22px;
    background-color: #feff9f;
    border: 1.8px solid #236f7a;
    border-radius: 18px;
    box-shadow: 0 4px 6px rgba(34, 105, 118, 0.25);
    text-align: center;
    z-index: 5;
  }

  .s5-badge-title {
    margin: 0;
    font-size: 21px;
    line-height: 1.2;
    font-weight: 700;
    letter-spacing: -0.01em;
    color: #232323;
  }

  /* 2. Statement Text — left column */
  .s5-text-wrap {
    position: absolute;
    left: 40px;
    top: 118px;
    width: 430px;
    margin: 0;
    padding: 0;
    z-index: 5;
  }

  .s5-heading {
    font-size: 20px;
    line-height: 1.48;
    font-weight: 500;
    color: #232323;
    margin: 0;
    padding: 0;
    letter-spacing: -0.012em;
    text-align: left;
    outline: none;
  }

  .s5-heading:focus-visible {
    outline: 2px dashed #143833;
    outline-offset: 4px;
    border-radius: 4px;
  }

  .s5-bold {
    font-weight: 800;
    font-size: 22px;
    color: #111827;
  }

  /* 3. Nurse Anna holding bottle — right side */
  .s5-nurse {
    position: absolute;
    left: 510px;
    top: 12px;
    width: 200px;
    height: 410px;
    pointer-events: none;
    z-index: 4;
    display: flex;
    align-items: center;
    justify-content: center;
    user-select: none;
    -webkit-user-drag: none;
  }

  .s5-nurse-img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
    filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.08));
  }

  /* Audio narration & CC controls: bottom-right on desktop, centered on mobile */
  .s5-audio {
    position: absolute;
    right: 22px;
    bottom: clamp(16px, 3vh, 22px);
    display: flex;
    align-items: center;
    justify-content: flex-end;
    z-index: 30;
  }

  @media (max-width: 767px) {
    ${mobileLayout(".s5-root")}
  }

  ${mobileLayout(".s5-root.is-mobile")}

  /* Prefers-Reduced-Motion (WCAG 2.3.3 Level AAA) */
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.001ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.001ms !important;
    }
  }
`;

export function Slide5PrevalenceScreen({
  isSpanish = false,
  medicationName,
  variant = "auto",
  onNext,
  onBack,
  loading = false,
  audioSrc,
  stepId = "slide5_prevalence",
  locale,
  transcriptText,
}: Slide5PrevalenceScreenProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const [scale, setScale] = useState(1);

  const isEs = (locale ?? "").startsWith("es") || isSpanish;

  // Programmatic focus on mount (WCAG 2.4.3 Focus Order)
  useEffect(() => {
    const timer = setTimeout(() => headingRef.current?.focus(), 50);
    return () => clearTimeout(timer);
  }, []);

  // Responsive stage scaling across all viewports
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
    : isEs ? "la amoxicilina" : "amoxicillin";
  const medName = resolveMedicineToken(rawMed, rawMed, isEs);
  const article = /^[aeiou]/i.test(medName) ? "an" : "a";

  const titleEnglish = (
    <>
      Most people who think they are allergic to penicillin can safely take it. Out of{" "}
      <strong className="s5-bold">100</strong> kids with {article} {medName} allergy,{" "}
      <strong className="s5-bold">95</strong> can take {medName} without having a reaction.
    </>
  );

  const titleSpanish = (
    <>
      La mayoría de las personas que piensan que son alérgicas a la penicilina pueden tomarla de manera segura. De cada{" "}
      <strong className="s5-bold">100</strong> niños con una alergia a {medName},{" "}
      <strong className="s5-bold">95</strong> pueden tomar {medName} sin tener una reacción.
    </>
  );

  const captionText = transcriptText || (isEs
    ? `¿Sabías que...? La mayoría de las personas que piensan que son alérgicas a la penicilina pueden tomarla de manera segura. De cada 100 niños con una alergia a ${medName}, 95 pueden tomar ${medName} sin tener una reacción.`
    : `Did You Know? Most people who think they are allergic to penicillin can safely take it. Out of 100 kids with ${article} ${medName} allergy, 95 can take ${medName} without having a reaction.`);

  const effectiveAudioSrc =
    audioSrc ||
    (isEs
      ? "/audio/exported/screen2_statistics_es.mp3"
      : "/audio/exported/screen2_statistics_en.mp3");

  const variantClass = variant === "mobile" ? " is-mobile" : variant === "desktop" ? " is-desktop" : "";

  return (
    <div
      id="slide-content"
      ref={rootRef}
      className={`s5-root${variantClass}`}
      role="region"
      aria-roledescription="slide"
      aria-labelledby="slide5-heading"
      lang={isEs ? "es" : "en"}
    >
      <style dangerouslySetInnerHTML={{ __html: SLIDE5_CSS }} />

      {/* Scaled stage container */}
      <div className="s5-stage" style={{ transform: `scale(${scale})` }}>
        {/* 1. "Did You Know?" Yellow Badge */}
        <div className="s5-badge" aria-hidden="true">
          <span className="s5-badge-title">
            {isEs ? "¿Sabías que...?" : "Did You Know?"}
          </span>
        </div>

        {/* 2. Statement Text */}
        <div className="s5-text-wrap">
          <h1
            id="slide5-heading"
            ref={headingRef}
            className="s5-heading"
            tabIndex={-1}
          >
            <span className="s5-sr-only">
              {isEs ? "¿Sabías que...? " : "Did You Know? "}
            </span>
            {isEs ? titleSpanish : titleEnglish}
          </h1>
        </div>

        {/* 3. Nurse Anna holding bottle */}
        <div className="s5-nurse" aria-hidden="true">
          <img
            src="/images/nurse-anna-holding-bottle.png"
            alt=""
            className="s5-nurse-img"
            draggable={false}
          />
        </div>
      </div>

      {/* 4. Audio narration & CC controls (bottom-right on desktop, centered above nav on mobile) */}
      <div className="s5-audio">
        <AudioPlayer
          audioSrc={effectiveAudioSrc}
          stepId={stepId}
          locale={isEs ? "es" : "en"}
          transcriptText={captionText}
          size="large"
        />
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

export default Slide5PrevalenceScreen;
