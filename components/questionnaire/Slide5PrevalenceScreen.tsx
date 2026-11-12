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
const STAGE_H = 530;

/**
 * Stacked mobile layout (< 768px) with Badge, Content, and Nurse Anna
 * vertically center-aligned inside the stage.
 */
const mobileLayout = (scope: string) => `
  #slide-content${scope},
  ${scope} {
    overflow: hidden !important;
    height: 100% !important;
    min-height: clamp(610px, calc(100dvh - 185px), 730px) !important;
    max-height: calc(100dvh - 175px) !important;
    flex: 1 1 0% !important;
    display: flex !important;
    flex-direction: column !important;
    justify-content: space-between !important;
    align-items: center !important;
    padding: 10px 16px 10px 16px !important;
    gap: 6px !important;
    box-sizing: border-box !important;
    background-color: transparent !important;
    border: none !important;
    box-shadow: none !important;
    border-radius: 0 !important;
  }
  #slide-content${scope} .s5-stage,
  ${scope} .s5-stage {
    position: relative !important;
    width: 100% !important;
    max-width: 398px !important;
    height: auto !important;
    min-height: clamp(460px, calc(100dvh - 320px), 540px) !important;
    flex: 1 1 0% !important;
    overflow: visible !important;
    transform: none !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    justify-content: center !important;
    background-color: transparent !important;
    padding: 8px 4px !important;
    margin: 0 auto !important;
    gap: 16px !important;
    box-sizing: border-box !important;
  }
  ${scope} .s5-badge {
    position: static !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    min-width: 184px !important;
    height: 46px !important;
    padding: 0 24px !important;
    background-color: #feff9f !important;
    border: 1.8px solid #236f7a !important;
    border-radius: 14px !important;
    box-shadow: 0 4px 6px rgba(34, 105, 118, 0.22) !important;
    margin: 0 auto !important;
    text-align: center !important;
    flex-shrink: 0 !important;
    align-self: center !important;
  }
  ${scope} .s5-badge-title {
    margin: 0 !important;
    font-size: 16.5px !important;
    line-height: 1.2 !important;
    font-weight: 700 !important;
    letter-spacing: -0.01em !important;
    color: #142724 !important;
    text-align: center !important;
  }
  ${scope} .s5-text-wrap {
    position: static !important;
    width: 100% !important;
    max-width: 340px !important;
    margin: 0 auto !important;
    padding: 0 4px !important;
    text-align: center !important;
    flex-shrink: 0 !important;
  }
  ${scope} .s5-heading {
    font-size: clamp(15px, 2.05dvh, 17px) !important;
    line-height: 1.42 !important;
    font-weight: 500 !important;
    text-align: center !important;
    text-wrap: balance !important;
    margin: 0 auto !important;
    color: #232323 !important;
  }
  ${scope} .s5-bold {
    font-size: 1.05em !important;
    font-weight: 800 !important;
    color: #111827 !important;
  }
${scope} .s5-nurse {
    position: static !important;
    left: auto !important;
    top: auto !important;
    width: clamp(112px, 28vw, 142px) !important;
    height: clamp(160px, 22vh, 202px) !important;
    margin: 4px auto 0 auto !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    flex-shrink: 0 !important;
  }
  ${scope} .s5-nurse-img {
    width: 100% !important;
    height: 100% !important;
    object-fit: contain !important;
    transform: none !important;
  }
  /* Two-tier bottom bar matching Slide 3 & Slide 4 (Audio on top, Nav below) */
  ${scope} .s5-bottom-bar-mobile {
    width: 100% !important;
    max-width: 360px !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    justify-content: center !important;
    gap: clamp(8px, 1.4dvh, 14px) !important;
    padding-top: 2px !important;
    padding-bottom: calc(6px + env(safe-area-inset-bottom, 0px)) !important;
    margin: 0 auto !important;
    flex-shrink: 0 !important;
    z-index: 25 !important;
  }
${scope} .s5-audio {
    order: 1 !important;
    position: static !important;
    right: auto !important;
    bottom: auto !important;
    top: auto !important;
    left: auto !important;
    width: 100% !important;
    display: flex !important;
    justify-content: center !important;
    align-items: center !important;
    margin: 0 auto !important;
    z-index: 25 !important;
    flex-shrink: 0 !important;
    color: #144e57 !important;
  }
  ${scope} .s5-audio button {
    background: transparent !important;
    border: none !important;
    cursor: pointer !important;
    color: #144e57 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    padding: 4px !important;
    min-width: 44px !important;
    min-height: 44px !important;
    border-radius: 8px !important;
    transition: transform 0.12s ease, opacity 0.15s ease !important;
  }
  ${scope} .s5-audio button:hover {
    transform: scale(1.08) !important;
    opacity: 0.85 !important;
  }
  ${scope} .s5-audio button svg {
    height: 34px !important;
    width: auto !important;
    transition: transform 0.12s ease !important;
  }
  ${scope} .s5-audio button:hover svg,
  ${scope} .s5-audio button:active svg {
    transform: scale(0.96) !important;
  }
  ${scope} .slide-nav,
  ${scope} .slide-nav-container {
    order: 2 !important;
    margin: 0 auto !important;
    display: flex !important;
    justify-content: center !important;
    align-items: center !important;
    width: 100% !important;
    gap: 16px !important;
  }
  ${scope} .slide-nav-btn {
    min-width: 128px !important;
    padding: 0 32px !important;
    white-space: nowrap !important;
    flex: 0 1 auto !important;
  }
`;

const SLIDE5_CSS = `
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

  .s5-root button:focus-visible,
  .s5-root [tabindex="0"]:focus-visible {
    outline: 3px solid #143833 !important;
    outline-offset: 3px !important;
  }

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
    top: 42px;
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
    top: 132px;
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


/* 3. Nurse Anna — right side (exact Slide 4 desktop dimensions) */
  .s5-nurse {
    position: absolute;
    left: 525px;
    top: 82px;
    width: 165px;
    height: 310px;
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

  /* Desktop Bottom Controls */
  .s5-bottom-bar-mobile {
    display: none;
  }
.s5-audio-desktop {
    position: absolute;
    right: 22px;
    bottom: clamp(16px, 3vh, 22px);
    display: flex;
    align-items: center;
    justify-content: flex-end;
    z-index: 30;
    color: #144e57;
  }
  .s5-audio-desktop button {
    background: transparent !important;
    border: none !important;
    cursor: pointer !important;
    color: #144e57 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    padding: 4px !important;
    min-width: 44px !important;
    min-height: 44px !important;
    border-radius: 8px !important;
    transition: transform 0.12s ease, opacity 0.15s ease !important;
  }
  .s5-audio-desktop button svg {
    height: 34px !important;
    width: auto !important;
  }
  .s5-nav-desktop {
    position: absolute;
    bottom: clamp(16px, 3vh, 22px);
    left: 0;
    right: 0;
    margin: 0 auto;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 25;
    pointer-events: auto;
  }

  @media (max-width: 767px) {
    ${mobileLayout(".s5-root:not(.is-desktop)")}
    .s5-audio-desktop {
      display: none !important;
    }
    .s5-nav-desktop {
      display: none !important;
    }
    .s5-bottom-bar-mobile {
      display: flex !important;
    }
  }

  ${mobileLayout(".s5-root.is-mobile")}
  .s5-root.is-mobile .s5-audio-desktop {
    display: none !important;
  }
  .s5-root.is-mobile .s5-nav-desktop {
    display: none !important;
  }
  .s5-root.is-mobile .s5-bottom-bar-mobile {
    display: flex !important;
  }

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
        if (variant === "mobile" || (variant !== "desktop" && window.innerWidth < 768)) {
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

  const rawMed =
    medicationName && medicationName.trim()
      ? medicationName.trim()
      : isEs
        ? "la amoxicilina"
        : "amoxicillin";
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

  const captionText =
    transcriptText ||
    (isEs
      ? `¿Sabías que...? La mayoría de las personas que piensan que son alérgicas a la penicilina pueden tomarla de manera segura. De cada 100 niños con una alergia a ${medName}, 95 pueden tomar ${medName} sin tener una reacción.`
      : `Did You Know? Most people who think they are allergic to penicillin can safely take it. Out of 100 kids with ${article} ${medName} allergy, 95 can take ${medName} without having a reaction.`);

  const effectiveAudioSrc =
    audioSrc ||
    (isEs
      ? "/audio/exported/screen2_statistics_es.mp3"
      : "/audio/exported/screen2_statistics_en.mp3");

  const variantClass =
    variant === "mobile" ? " is-mobile" : variant === "desktop" ? " is-desktop" : "";

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

        {/* 3. Nurse Anna */}
        <div className="s5-nurse" aria-hidden="true">
          <img
            src="/images/nurse-anna.png"
            alt=""
            className="s5-nurse-img"
            draggable={false}
          />
        </div>
      </div>

      {/* 4. Desktop Audio narration & CC controls */}
      <div className="s5-audio-desktop">
        <AudioPlayer
          audioSrc={effectiveAudioSrc}
          stepId={stepId}
          locale={isEs ? "es" : "en"}
          transcriptText={captionText}
          size="large"
        />
      </div>

      {/* 5. Desktop Centered Navigation */}
      <div className="s5-nav-desktop">
        <SlideNavigationButtons
          onBack={onBack}
          onNext={onNext}
          isSpanish={isEs}
          loading={loading}
        />
      </div>

      {/* 6. Mobile Centered Stacked Bottom Bar (Audio on top, Back/Next below) */}
      <div className="s5-bottom-bar-mobile">
        <div className="s5-audio">
          <AudioPlayer
            audioSrc={effectiveAudioSrc}
            stepId={stepId}
            locale={isEs ? "es" : "en"}
            transcriptText={captionText}
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
    </div>
  );
}

export default Slide5PrevalenceScreen;