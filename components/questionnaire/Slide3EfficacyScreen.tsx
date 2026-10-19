"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
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

const SLIDE3_COMPONENT_CSS = `
  /* ------------------------------------------------------------
     WCAG 2.1 / 2.2 Level AAA & WAVE Immunity Accessibility Rules
     ------------------------------------------------------------ */

  /* Screen Reader Only Utility (WCAG 1.3.1, 4.1.2) */
  .s3-sr-only {
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
  .s3-component-card button:focus-visible,
  .s3-component-card [tabindex="0"]:focus-visible {
    outline: 3px solid #143833 !important;
    outline-offset: 3px !important;
  }

  /* Primary Slide Card Container */
  .s3-component-card {
    position: relative;
    width: 100%;
    max-width: 896px;
    max-height: 100%;
    aspect-ratio: 896 / 620;
    background-color: #f6faf0;
    border-radius: 28px;
    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.04);
    border: 1px solid rgba(120, 165, 155, 0.28);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    overflow: hidden;
    padding: 34px 50px 24px 50px;
    box-sizing: border-box;
    font-family: "Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  }

  .s3-stage-body {
    flex: 1;
    position: relative;
    width: 100%;
    min-height: 0;
  }

  /* 1. Primary Left Heading (WCAG 1.4.3 AAA Contrast: #142724 on #f6faf0 = 14.75:1) */
  .s3-heading {
    position: absolute;
    left: 0;
    top: 6px;
    width: 468px;
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

  /* 2. Speech Bubble Container (Positioned on Right over Anna's hair) */
  .s3-bubble-wrap {
    position: absolute;
    right: 18px;
    top: 8px;
    width: 334px;
    height: 220px;
    filter: drop-shadow(2.5px 3.5px 0px #1a3532);
    z-index: 5;
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
    top: 39%;
    left: 48%;
    transform: translate(-50%, -50%);
    width: 76%;
    max-width: 225px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    pointer-events: none;
  }

  /* Bubble Text (WCAG 1.4.3 AAA Contrast: #142724 on #ffffff = 15.61:1) */
  .s3-bubble-text {
    margin: 0;
    padding: 0;
    font-size: 13.5px;
    line-height: 1.44;
    font-weight: 600;
    color: #142724;
    text-align: center;
    letter-spacing: -0.01em;
  }

  /* 3. Nurse Anna standing with hair under bubble tail */
  .s3-nurse-wrap {
    position: absolute;
    right: 36px;
    top: 200px;
    width: 132px;
    height: 260px;
    z-index: 10;
    pointer-events: none;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .s3-nurse-img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
    user-select: none;
  }

  /* 4. Bottom Controls Bar (Figma Pinned Bottom) */
  .s3-bottom-bar {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-shrink: 0;
    padding-top: 8px;
    position: relative;
    z-index: 20;
  }

  .s3-spacer-side {
    width: 110px;
    flex-shrink: 0;
  }

  .s3-nav-center {
    display: flex;
    align-items: center;
    gap: 14px;
    margin: 0 auto;
    flex-shrink: 0;
  }

  /* Navigation Buttons (WCAG 2.5.5 AAA Target Size >= 44px) */
  .s3-btn-nav {
    border-radius: 9999px;
    font-weight: 700;
    border: 1.5px solid transparent;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    min-height: 46px;
    min-width: 98px;
    font-size: 16px;
    padding: 0 24px;
    transition: transform 0.1s ease, background-color 0.15s ease;
  }
  .s3-btn-nav:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.14);
  }
  .s3-btn-nav:active:not(:disabled) {
    transform: translateY(1px);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }
  .s3-btn-nav:disabled {
    opacity: 0.55;
    cursor: not-allowed;
    box-shadow: none;
  }

  /* Back Button (Contrast #11332e on #bddfd8 = 9.57:1 AAA) */
  .s3-btn-back {
    background-color: #bddfd8;
    color: #11332e;
    border-color: #78a59b;
  }
  .s3-btn-back:hover:not(:disabled) {
    background-color: #a8d5cc;
  }

  /* Next Button (Contrast #1a2624 on #fdee8e = 13.22:1 AAA) */
  .s3-btn-next {
    background-color: #fdee8e;
    color: #1a2624;
    border-color: #c8b746;
  }
  .s3-btn-next:hover:not(:disabled) {
    background-color: #f5e478;
  }

  /* Audio Controls (Desktop provided by PenpalIntervention tablet frame, mobile inline) */
  @media (min-width: 768px) {
    .s3-audio-controls {
      display: none !important;
    }
  }
  .s3-audio-controls {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #144e57;
    justify-content: flex-end;
  }
  .s3-audio-btn {
    background: transparent;
    border: none;
    cursor: pointer;
    color: #144e57;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 6px;
    min-width: 44px;
    min-height: 44px;
    border-radius: 8px;
    transition: transform 0.12s ease, opacity 0.15s ease;
  }
  .s3-audio-btn:hover {
    transform: scale(1.08);
    opacity: 0.85;
  }

  /* Closed Captions Panel (WCAG 1.2.2 Captions) */
  .s3-captions-panel {
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
  .s3-captions-tag {
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
  .s3-captions-text {
    font-size: 13.5px;
    line-height: 1.4;
    margin: 0;
    font-weight: 500;
    color: #ffffff;
  }

  /* -------------------------------------------------------------
     EXPLICIT PREVIEW & MOBILE EMBEDDED MODES (.is-mobile)
     ------------------------------------------------------------- */
  .s3-component-card.is-mobile {
    aspect-ratio: auto !important;
    max-height: none !important;
    height: 100% !important;
    border-radius: 24px !important;
    padding: 16px 14px 14px 14px !important;
    overflow-y: auto !important;
  }
  .s3-component-card.is-mobile .s3-stage-body {
    display: flex !important;
    flex-direction: column !important;
    justify-content: space-between !important;
  }
  .s3-component-card.is-mobile .s3-heading {
    position: static !important;
    width: 100% !important;
    font-size: 14.5px !important;
    line-height: 1.34 !important;
    margin-bottom: 6px !important;
  }
  .s3-component-card.is-mobile .s3-characters-group {
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    justify-content: center !important;
    position: relative !important;
    width: 100% !important;
    margin-top: -2px !important;
  }
  .s3-component-card.is-mobile .s3-bubble-wrap {
    position: relative !important;
    right: auto !important;
    top: auto !important;
    width: 290px !important;
    height: 190px !important;
    margin: 0 auto !important;
    filter: drop-shadow(2px 3px 0px #1a3532) !important;
  }
  .s3-component-card.is-mobile .s3-bubble-text-wrap {
    top: 39% !important;
    left: 48% !important;
    width: 76% !important;
    max-width: 195px !important;
  }
  .s3-component-card.is-mobile .s3-bubble-text {
    font-size: 12px !important;
    line-height: 1.38 !important;
  }
  .s3-component-card.is-mobile .s3-nurse-wrap {
    position: relative !important;
    right: auto !important;
    top: auto !important;
    width: 105px !important;
    height: 185px !important;
    margin-top: -22px !important;
    margin-left: auto !important;
    margin-right: 32px !important;
  }
  .s3-component-card.is-mobile .s3-btn-nav {
    min-height: 44px !important;
    min-width: 68px !important;
    font-size: 13.5px !important;
    padding: 0 14px !important;
  }
  .s3-component-card.is-mobile .s3-spacer-side {
    width: 60px !important;
  }

  /* Responsive Fallback (< 768px) */
  @media (max-width: 767px) {
    .s3-component-card {
      aspect-ratio: auto;
      max-height: none;
      height: 100%;
      border-radius: 24px;
      padding: 16px 14px 14px 14px;
      overflow-y: auto;
    }
    .s3-stage-body {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .s3-heading {
      position: static;
      width: 100%;
      font-size: 14.5px;
      line-height: 1.34;
      margin-bottom: 6px;
    }
    .s3-characters-group {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      position: relative;
      width: 100%;
      margin-top: -2px;
    }
    .s3-bubble-wrap {
      position: relative;
      right: auto;
      top: auto;
      width: 290px;
      height: 190px;
      margin: 0 auto;
      filter: drop-shadow(2px 3px 0px #1a3532);
    }
    .s3-bubble-text-wrap {
      top: 39%;
      left: 48%;
      width: 76%;
      max-width: 195px;
    }
    .s3-bubble-text {
      font-size: 12px;
      line-height: 1.38;
    }
    .s3-nurse-wrap {
      position: relative;
      right: auto;
      top: auto;
      width: 105px;
      height: 185px;
      margin-top: -22px;
      margin-left: auto;
      margin-right: 32px;
    }
    .s3-btn-nav {
      min-height: 44px;
      min-width: 68px;
      font-size: 13.5px;
      padding: 0 14px;
    }
    .s3-spacer-side {
      width: 60px;
    }
  }

  /* Prefers-Reduced-Motion (WCAG 2.3.3) */
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.001ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.001ms !important;
    }
  }
`;

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

export function Slide3EfficacyScreen({
  isSpanish = false,
  medicationName = "Amoxicillin",
  variant = "auto",
  onNext,
  onBack,
  loading = false,
  audioSrc,
  stepId = "slide3_efficacy",
  locale,
  transcriptText,
}: Slide3EfficacyScreenProps) {
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [showCaptions, setShowCaptions] = useState(false);
  const [liveAnnouncement, setLiveAnnouncement] = useState("");

  const headingRef = useRef<HTMLHeadingElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Set programmatic focus on heading when slide mounts (WCAG 2.4.3 Focus Order)
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  const name =
    medicationName && medicationName.trim()
      ? medicationName.trim()
      : isSpanish
      ? "Amoxicilina"
      : "Amoxicillin";

  const rawHeadingEn = `Many kids have had [name] because it's the best for treating common ear, sinus and throat infections. It is also one of the best antibiotics in adults, too.`;
  const rawHeadingEs = `Muchos niños han tomado [name] porque es el mejor para tratar infecciones comunes de oído, senos paranasales y garganta. También es uno de los mejores antibióticos para adultos.`;

  const headingText = resolveMedicineToken(isSpanish ? rawHeadingEs : rawHeadingEn, name, isSpanish);

  const captionText =
    transcriptText ||
    (isSpanish
      ? `${headingText} ${name} es un medicamento maravilloso, pero como todos los antibióticos no funciona bien para los resfriados comunes o la gripe.`
      : `${headingText} ${name} is a wonder drug, but like all antibiotics it doesn't work well for common colds or the flu.`);

  const effectiveAudioSrc =
    audioSrc ||
    (isSpanish
      ? "/audio/exported/slide3_efficacy_es.mp3"
      : "/audio/exported/slide3_efficacy_en.mp3");

  // Synchronize audio playback state with audio element events
  useEffect(() => {
    const audioEl = audioRef.current;
    if (!audioEl) return;

    const handlePlay = () => setAudioPlaying(true);
    const handlePause = () => setAudioPlaying(false);
    const handleEnded = () => setAudioPlaying(false);

    audioEl.addEventListener("play", handlePlay);
    audioEl.addEventListener("pause", handlePause);
    audioEl.addEventListener("ended", handleEnded);

    return () => {
      audioEl.removeEventListener("play", handlePlay);
      audioEl.removeEventListener("pause", handlePause);
      audioEl.removeEventListener("ended", handleEnded);
      audioEl.pause();
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [effectiveAudioSrc, stepId]);

  const toggleAudio = () => {
    const audioEl = audioRef.current;
    const willPlay = !audioPlaying;

    setLiveAnnouncement(
      willPlay
        ? isSpanish
          ? "Reproduciendo narración de audio"
          : "Audio narration playing"
        : isSpanish
        ? "Narración de audio pausada"
        : "Audio narration paused"
    );

    if (willPlay) {
      if (audioEl) {
        audioEl.play().catch(() => {
          if (typeof window !== "undefined" && "speechSynthesis" in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(captionText);
            utterance.lang = isSpanish || locale === "es" ? "es-US" : "en-US";
            utterance.rate = 0.95;
            utterance.onstart = () => setAudioPlaying(true);
            utterance.onend = () => setAudioPlaying(false);
            utterance.onerror = () => setAudioPlaying(false);
            window.speechSynthesis.speak(utterance);
          }
        });
      }
    } else {
      if (audioEl) {
        audioEl.pause();
      }
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      setAudioPlaying(false);
    }
  };

  const toggleCaptions = () => {
    const next = !showCaptions;
    setShowCaptions(next);
    setLiveAnnouncement(
      next
        ? isSpanish
          ? "Subtítulos mostrados"
          : "Closed captions displayed"
        : isSpanish
        ? "Subtítulos ocultados"
        : "Closed captions hidden"
    );
  };

  const variantClass = variant === "mobile" ? " is-mobile" : variant === "desktop" ? " is-desktop" : "";

  return (
    <section
      className={`s3-component-card${variantClass}`}
      role="region"
      aria-roledescription="slide"
      aria-labelledby="s3-screen-heading"
      lang={isSpanish ? "es" : "en"}
    >
      <style dangerouslySetInnerHTML={{ __html: SLIDE3_COMPONENT_CSS }} />

      {/* Screen Reader Live Status Announcer (WCAG 4.1.3 Status Messages) */}
      <div className="s3-sr-only" role="status" aria-live="polite" aria-atomic="true">
        {liveAnnouncement}
      </div>

      {/* Hidden audio element for screen reader & audio playback */}
      <audio
        ref={audioRef}
        src={effectiveAudioSrc}
        preload="metadata"
        className="s3-sr-only"
        aria-hidden="true"
      />

      {/* Stage Body */}
      <div className="s3-stage-body">
        {/* 1. Left-aligned Statement Heading (WCAG 1.3.1, 2.4.6) */}
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="s3-heading"
          id="s3-screen-heading"
        >
          {headingText}
        </h1>

        {/* Grouping for mobile responsive arrangement */}
        <div className="s3-characters-group">
          {/* 2. Speech Bubble Container (Semantic quote block without redundant region) */}
          <figure
            className="s3-bubble-wrap"
            role="group"
            aria-label={isSpanish ? "Comentario de la enfermera Anna" : "Nurse Anna statement"}
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

              {/* Smooth cubic Bézier body */}
              <path
                d={BUBBLE_BEZIER_PATH}
                fill="#ffffff"
                stroke="#7baea9"
                strokeWidth="3"
                strokeLinejoin="round"
                strokeLinecap="round"
              />

              {/* Dot texture */}
              <path d={BUBBLE_BEZIER_PATH} fill="url(#s3-cmp-dot-grid)" />
            </svg>

            {/* Centered Speech Bubble Text with guaranteed padding on all 4 sides */}
            <div className="s3-bubble-text-wrap">
              <blockquote className="s3-bubble-text">
                {isSpanish ? (
                  <>
                    {name} es un medicamento maravilloso,<br />
                    pero como todos los antibióticos<br />
                    no funciona bien para los resfriados<br />
                    comunes o la gripe.
                  </>
                ) : (
                  <>
                    {name} is a wonder drug, but<br />
                    like all antibiotics it doesn&apos;t<br />
                    work well for common colds<br />
                    or the flu.
                  </>
                )}
              </blockquote>
            </div>
          </figure>

          {/* 3. Nurse Anna standing with hair under bubble tail (WCAG 1.1.1 Non-text Content) */}
          <div className="s3-nurse-wrap" aria-hidden="true">
            <Image
              src="/images/nurse-anna.png"
              alt=""
              className="s3-nurse-img"
              width={132}
              height={260}
              priority
              unoptimized
              draggable={false}
            />
          </div>
        </div>
      </div>

      {/* Closed Captions Panel (WCAG 1.2.2 Captions) */}
      {showCaptions && (
        <div className="s3-captions-panel" role="region" aria-label={isSpanish ? "Subtítulos de narración" : "Audio narration captions"}>
          <span className="s3-captions-tag" aria-hidden="true">CC</span>
          <p className="s3-captions-text">{captionText}</p>
        </div>
      )}

      {/* Bottom Controls Bar (WCAG 2.4.1 Landmark & Toolbar) */}
      <footer
        className="s3-bottom-bar"
        role="toolbar"
        aria-label={isSpanish ? "Controles de navegación y audio" : "Slide navigation and media controls"}
      >
        <div className="s3-spacer-side" aria-hidden="true" />

        {/* Centered Back & Next Buttons (WCAG 2.5.5 AAA Target Size >= 44px) */}
        <nav className="s3-nav-center" aria-label={isSpanish ? "Navegación de diapositiva" : "Slide pagination"}>
          <button
            type="button"
            onClick={onBack}
            className="s3-btn-nav s3-btn-back"
            aria-label={isSpanish ? "Volver a la diapositiva anterior" : "Back to previous slide"}
            disabled={loading}
          >
            {isSpanish ? "Atrás" : "Back"}
          </button>
          <button
            type="button"
            onClick={onNext}
            className="s3-btn-nav s3-btn-next"
            aria-label={isSpanish ? "Continuar a la siguiente diapositiva" : "Next slide"}
            disabled={loading}
          >
            {isSpanish ? "Siguiente" : "Next"}
          </button>
        </nav>

        {/* Audio Controls */}
        <div className="s3-audio-controls s3-spacer-side">
          {/* CC Toggle */}
          <button
            type="button"
            onClick={toggleCaptions}
            className="s3-audio-btn"
            aria-pressed={showCaptions}
            aria-label={
              showCaptions
                ? isSpanish
                  ? "Ocultar subtítulos"
                  : "Hide closed captions"
                : isSpanish
                ? "Mostrar subtítulos"
                : "Show closed captions"
            }
            title={showCaptions ? "Hide closed captions" : "Show closed captions"}
          >
            <svg
              width="34"
              height="28"
              viewBox="0 0 46 38"
              fill="none"
              aria-hidden="true"
              focusable="false"
            >
              <path
                d="M6 5C6 3.89543 6.89543 3 8 3H38C39.1046 3 40 3.89543 40 5V26C40 27.1046 39.1046 28 38 28H15L7 35V28H8C6.89543 28 6 27.1046 6 26V5Z"
                stroke="#144e57"
                strokeWidth="2.5"
                strokeLinejoin="round"
                fill={showCaptions ? "rgba(20, 78, 87, 0.18)" : "none"}
              />
              <text
                x="13"
                y="20"
                fill="#144e57"
                fontSize="13"
                fontWeight="bold"
                fontFamily="sans-serif"
                aria-hidden="true"
              >
                CC
              </text>
            </svg>
          </button>

          {/* Audio Play/Pause Toggle */}
          <button
            type="button"
            onClick={toggleAudio}
            className="s3-audio-btn"
            aria-pressed={audioPlaying}
            aria-label={
              audioPlaying
                ? isSpanish
                  ? "Pausar narración de audio"
                  : "Pause audio narration"
                : isSpanish
                ? "Reproducir narración de audio"
                : "Play audio narration"
            }
            title={audioPlaying ? "Pause audio narration" : "Play audio narration"}
          >
            <svg
              width="36"
              height="28"
              viewBox="0 0 52 38"
              fill="none"
              aria-hidden="true"
              focusable="false"
            >
              <polygon
                points="10,6 26,19 10,32"
                stroke="#144e57"
                strokeWidth="2.5"
                fill={audioPlaying ? "#144e57" : "none"}
                strokeLinejoin="round"
              />
              <text
                x="12"
                y="21"
                fill={audioPlaying ? "#ffffff" : "#144e57"}
                fontSize="9.5"
                fontWeight="bold"
                fontFamily="sans-serif"
                aria-hidden="true"
              >
                {audioPlaying ? "pause" : "play"}
              </text>
              <path
                d="M32 10C35 13 36 16 36 19C36 22 35 25 32 28"
                stroke="#144e57"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path
                d="M38 6C43 10 44 14 44 19C44 24 43 28 38 32"
                stroke="#144e57"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </footer>
    </section>
  );
}

export default Slide3EfficacyScreen;
