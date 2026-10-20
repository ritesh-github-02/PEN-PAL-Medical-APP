"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
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

const SLIDE5_COMPONENT_CSS = `
  /* ------------------------------------------------------------
     WCAG 2.1 / 2.2 Level AAA & WAVE Immunity Accessibility Rules
     ------------------------------------------------------------ */

  /* Screen Reader Only Utility (WCAG 1.3.1, 4.1.2, 4.1.3) */
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

  /* Universal High Contrast Focus Indicator (WCAG 2.4.7, 2.4.11, 2.4.13 Level AAA) */
  .s5-component-card button:focus-visible,
  .s5-component-card [tabindex="0"]:focus-visible {
    outline: 3px solid #143833 !important;
    outline-offset: 3px !important;
  }

  /* Heading programmatic focus without unwanted mouse-click rings */
  .s5-heading:focus,
  .s5-heading:focus-visible {
    outline: none !important;
  }

  /* Primary Slide Card Container */
  .s5-component-card {
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
    padding: 34px 50px 24px 50px;
    box-sizing: border-box;
    font-family: "Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  }

  .s5-stage-body {
    flex: 1;
    position: relative;
    width: 100%;
    min-height: 0;
  }

  .s5-content-left {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  /* 1. "Did You Know?" Yellow Badge (WCAG 1.4.3 AAA Contrast: #232323 on #feff9f = 13.8:1) */
  .s5-badge {
    position: absolute;
    left: 0;
    top: 0;
    min-width: 200px;
    height: 72px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0 24px;
    background-color: #feff9f;
    border: 1.8px solid #236f7a;
    border-radius: 22px;
    box-shadow: 0 4px 6px rgba(34, 105, 118, 0.25);
    text-align: center;
    z-index: 5;
  }
  .s5-badge-title {
    margin: 0;
    font-size: 22px;
    line-height: 1.2;
    font-weight: 700;
    letter-spacing: -0.01em;
    color: #232323;
  }

  /* 2. Statement Text (Left Column, WCAG 1.4.3 AAA Contrast: #232323 on #fafdf3 = 16.5:1) */
  .s5-text-wrap {
    position: absolute;
    left: 0;
    top: 104px;
    width: 480px;
    max-width: 490px;
    margin: 0;
    padding: 0;
    z-index: 5;
  }
  .s5-heading {
    font-size: 21.5px;
    line-height: 1.44;
    font-weight: 500;
    color: #232323;
    margin: 0;
    padding: 0;
    letter-spacing: -0.012em;
    text-align: left;
  }
  .s5-bold {
    font-weight: 800;
    font-size: 23px;
    color: #111827;
  }

  /* 3. Nurse Anna standing on Right (Strictly decorative on Slide 2+) */
  .s5-nurse {
    position: absolute;
    right: 32px;
    top: 20px;
    width: 205px;
    height: 410px;
    pointer-events: none;
    z-index: 4;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .s5-nurse-img {
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
  .s5-bottom-bar {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-shrink: 0;
    padding-top: 8px;
    position: relative;
    z-index: 20;
  }

  .s5-spacer-side {
    width: 110px;
    flex-shrink: 0;
  }

  .s5-nav-center {
    display: flex;
    align-items: center;
    gap: 14px;
    margin: 0 auto;
    flex-shrink: 0;
  }

  /* Navigation Buttons (WCAG 2.5.5 AAA Target Size >= 44px) */
  .s5-btn-nav {
    border-radius: 9999px;
    font-weight: 700;
    border: 1.5px solid transparent;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    min-height: 48px;
    min-width: 98px;
    font-size: 16px;
    padding: 0 24px;
    transition: transform 0.1s ease, background-color 0.15s ease;
  }
  .s5-btn-nav:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.14);
  }
  .s5-btn-nav:active:not(:disabled) {
    transform: translateY(1px);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }
  .s5-btn-nav:disabled {
    opacity: 0.55;
    cursor: not-allowed;
    box-shadow: none;
  }

  /* Back Button (Contrast #11332e on #bddfd8 = 9.4:1 AAA) */
  .s5-btn-back {
    background-color: #bddfd8;
    color: #11332e;
    border-color: #78a59b;
  }
  .s5-btn-back:hover:not(:disabled) {
    background-color: #a8d5cc;
  }

  /* Next Button (Contrast #1a2624 on #fdee8e = 12.8:1 AAA) */
  .s5-btn-next {
    background-color: #fdee8e;
    color: #1a2624;
    border-color: #c8b746;
  }
  .s5-btn-next:hover:not(:disabled) {
    background-color: #f5e478;
  }

  /* Audio Controls (WCAG 1.4.3 AAA Contrast: #144e57 on #fafdf3 = 8.2:1) */
  .s5-audio-controls {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #144e57;
    justify-content: flex-end;
  }
  .s5-audio-btn {
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
  .s5-audio-btn:hover {
    transform: scale(1.08);
    opacity: 0.85;
  }

  /* Closed Captions Panel (WCAG 1.2.2 Captions, Contrast 14.8:1 AAA) */
  .s5-captions-panel {
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
  .s5-captions-tag {
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
  .s5-captions-text {
    font-size: 13.5px;
    line-height: 1.4;
    margin: 0;
    font-weight: 500;
    color: #ffffff;
  }

  /* -------------------------------------------------------------
     EXPLICIT PREVIEW & MOBILE EMBEDDED MODES (.is-mobile)
     ------------------------------------------------------------- */
  .s5-component-card.is-mobile {
    aspect-ratio: auto !important;
    max-height: none !important;
    height: 100% !important;
    border-radius: 24px !important;
    padding: 16px 14px 12px 14px !important;
    overflow-y: auto !important;
  }
  .s5-component-card.is-mobile .s5-stage-body {
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    justify-content: flex-start !important;
  }
  .s5-component-card.is-mobile .s5-badge {
    position: static !important;
    min-width: 170px !important;
    height: 46px !important;
    border-radius: 16px !important;
    margin: 2px auto 12px auto !important;
    padding: 0 16px !important;
  }
  .s5-component-card.is-mobile .s5-badge-title {
    font-size: 16px !important;
  }
  .s5-component-card.is-mobile .s5-text-wrap {
    position: static !important;
    width: 100% !important;
    max-width: 100% !important;
    margin: 0 0 10px 0 !important;
    padding: 0 !important;
  }
  .s5-component-card.is-mobile .s5-heading {
    font-size: 15.5px !important;
    line-height: 1.38 !important;
    text-align: center !important;
  }
  .s5-component-card.is-mobile .s5-bold {
    font-size: 17px !important;
  }
  .s5-component-card.is-mobile .s5-nurse {
    position: relative !important;
    right: auto !important;
    top: auto !important;
    width: 130px !important;
    height: 200px !important;
    margin: 4px auto 0 auto !important;
  }
  .s5-component-card.is-mobile .s5-btn-nav {
    min-height: 44px !important;
    min-width: 72px !important;
    font-size: 14px !important;
    padding: 0 16px !important;
  }
  .s5-component-card.is-mobile .s5-spacer-side {
    width: 60px !important;
  }

  /* Responsive Fallback (< 768px) */
  @media (max-width: 767px) {
    .s5-component-card {
      aspect-ratio: auto;
      max-height: none;
      height: 100%;
      border-radius: 24px;
      padding: 16px 14px 12px 14px;
      overflow-y: auto;
    }
    .s5-stage-body {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
    }
    .s5-badge {
      position: static;
      min-width: 170px;
      height: 46px;
      border-radius: 16px;
      margin: 2px auto 12px auto;
      padding: 0 16px;
    }
    .s5-badge-title {
      font-size: 16px;
    }
    .s5-text-wrap {
      position: static;
      width: 100%;
      max-width: 100%;
      margin: 0 0 10px 0;
      padding: 0;
    }
    .s5-heading {
      font-size: 15.5px;
      line-height: 1.38;
      text-align: center;
    }
    .s5-bold {
      font-size: 17px;
    }
    .s5-nurse {
      position: relative;
      right: auto;
      top: auto;
      width: 130px;
      height: 200px;
      margin: 4px auto 0 auto;
    }
    .s5-btn-nav {
      min-height: 44px;
      min-width: 72px;
      font-size: 14px;
      padding: 0 16px;
    }
    .s5-spacer-side {
      width: 60px;
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
  const [audioPlaying, setAudioPlaying] = useState<boolean>(false);
  const [showCaptions, setShowCaptions] = useState<boolean>(false);
  const [liveAnnouncement, setLiveAnnouncement] = useState<string>("");

  const headingRef = useRef<HTMLHeadingElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const activeLocale = locale || (isSpanish ? "es" : "en");
  const isEs = activeLocale.startsWith("es") || isSpanish;

  // Programmatic focus on mount (WCAG 2.4.3 Focus Order)
  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, []);

  const medicine = medicationName && medicationName.trim()
    ? resolveMedicineToken(medicationName.trim(), isEs ? "es" : "en")
    : (isEs ? "la amoxicilina" : "amoxicillin");
  const article = /^[aeiou]/i.test(medicine) ? "an" : "a";

  const titleEnglish = (
    <>
      Most people who think they are allergic to penicillin can safely take it. Out of{" "}
      <strong className="s5-bold">100</strong> kids with {article} {medicine} allergy,{" "}
      <strong className="s5-bold">95</strong> can take {medicine} without having a reaction.
    </>
  );

  const titleSpanish = (
    <>
      La mayoría de las personas que piensan que son alérgicas a la penicilina pueden tomarla de manera segura. De cada{" "}
      <strong className="s5-bold">100</strong> niños con una alergia a {medicine},{" "}
      <strong className="s5-bold">95</strong> pueden tomar {medicine} sin tener una reacción.
    </>
  );

  const plainHeadingText = transcriptText || (isEs
    ? `¿Sabías que...? La mayoría de las personas que piensan que son alérgicas a la penicilina pueden tomarla de manera segura. De cada 100 niños con una alergia a ${medicine}, 95 pueden tomar ${medicine} sin tener una reacción.`
    : `Did You Know? Most people who think they are allergic to penicillin can safely take it. Out of 100 kids with ${article} ${medicine} allergy, 95 can take ${medicine} without having a reaction.`);

  const effectiveAudioSrc =
    audioSrc ||
    (isEs
      ? "/audio/exported/screen2_statistics_es.mp3"
      : "/audio/exported/screen2_statistics_en.mp3");

  // Keyboard Escape listener for Closed Captions dismissal (WCAG 1.4.13)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showCaptions) {
        setShowCaptions(false);
        setLiveAnnouncement(isEs ? "Subtítulos ocultados" : "Closed captions dismissed");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showCaptions, isEs]);

  // Synchronize audio playback state with audio element events and SpeechSynthesis
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
        ? isEs
          ? "Reproduciendo narración de audio"
          : "Audio narration playing"
        : isEs
        ? "Narración de audio pausada"
        : "Audio narration paused"
    );

    if (willPlay) {
      if (audioEl && audioEl.src && !audioEl.src.endsWith(".undefined")) {
        audioEl.play().catch(() => {
          if (typeof window !== "undefined" && "speechSynthesis" in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(plainHeadingText);
            utterance.lang = isEs ? "es-US" : "en-US";
            utterance.rate = 0.95;
            utterance.onstart = () => setAudioPlaying(true);
            utterance.onend = () => setAudioPlaying(false);
            utterance.onerror = () => setAudioPlaying(false);
            window.speechSynthesis.speak(utterance);
          }
        });
      } else if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(plainHeadingText);
        utterance.lang = isEs ? "es-US" : "en-US";
        utterance.rate = 0.95;
        utterance.onstart = () => setAudioPlaying(true);
        utterance.onend = () => setAudioPlaying(false);
        utterance.onerror = () => setAudioPlaying(false);
        window.speechSynthesis.speak(utterance);
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
        ? isEs
          ? "Subtítulos mostrados"
          : "Closed captions displayed"
        : isEs
        ? "Subtítulos ocultados"
        : "Closed captions hidden"
    );
  };

  const variantClass = variant === "mobile" ? " is-mobile" : variant === "desktop" ? " is-desktop" : "";

  return (
    <section
      className={`s5-component-card${variantClass}`}
      role="region"
      aria-roledescription="slide"
      aria-labelledby="slide5-heading"
      lang={isEs ? "es" : "en"}
    >
      <style>{SLIDE5_COMPONENT_CSS}</style>

      {/* Screen Reader Live Region for WCAG 4.1.3 */}
      <div className="s5-sr-only" role="status" aria-live="polite" aria-atomic="true">
        {liveAnnouncement}
      </div>

      {/* Hidden audio element for audio narration */}
      <audio
        ref={audioRef}
        src={effectiveAudioSrc}
        preload="metadata"
        className="s5-sr-only"
        aria-hidden="true"
      />

      {/* Stage Body */}
      <div className="s5-stage-body">
        <div className="s5-content-left">
          {/* 1. "Did You Know?" Yellow Badge */}
          <div className="s5-badge" aria-hidden="true">
            <span className="s5-badge-title">
              {isEs ? "¿Sabías que...?" : "Did You Know?"}
            </span>
          </div>

          {/* 2. Statement Text on Left Column */}
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
        </div>

        {/* 3. Nurse Anna standing on Right (Strictly decorative on Slide 2+) */}
        <div className="s5-nurse" aria-hidden="true">
          <img
            src="/images/nurse-anna-holding-bottle.png"
            alt=""
            className="s5-nurse-img"
            draggable={false}
          />
        </div>
      </div>

      {/* Closed Caption Drawer (WCAG 1.2.2 Captions) */}
      {showCaptions && (
        <div
          className="s5-captions-panel"
          role="region"
          aria-label={isEs ? "Subtítulos de narración" : "Closed captions"}
        >
          <span className="s5-captions-tag" aria-hidden="true">
            CC
          </span>
          <p className="s5-captions-text">
            {plainHeadingText}
          </p>
        </div>
      )}

      {/* 4. Bottom Navigation & Audio Controls (WCAG 2.4.1 Toolbar) */}
      <footer
        className="s5-bottom-bar"
        role="toolbar"
        aria-label={isEs ? "Controles de navegación y audio" : "Slide navigation and media controls"}
      >
        <div className="s5-spacer-side" aria-hidden="true" />

        {/* Centered Navigation Buttons (Back & Next) */}
        <nav
          className="s5-nav-center"
          aria-label={isEs ? "Navegación de diapositiva" : "Slide pagination"}
        >
          <button
            type="button"
            className="s5-btn-nav s5-btn-back"
            onClick={onBack}
            disabled={loading}
            aria-label={isEs ? "Volver a la diapositiva anterior" : "Back to previous slide"}
          >
            {isEs ? "Atrás" : "Back"}
          </button>
          <button
            type="button"
            className="s5-btn-nav s5-btn-next"
            onClick={onNext}
            disabled={loading}
            aria-label={isEs ? "Continuar a la siguiente diapositiva" : "Next slide"}
          >
            {isEs ? "Siguiente" : "Next"}
          </button>
        </nav>

        {/* Audio narration & CC controls */}
        <div className="s5-audio-controls s5-spacer-side">
          <button
            type="button"
            className="s5-audio-btn"
            onClick={toggleCaptions}
            aria-pressed={showCaptions}
            aria-label={
              showCaptions
                ? isEs
                  ? "Ocultar subtítulos"
                  : "Hide closed captions"
                : isEs
                ? "Mostrar subtítulos"
                : "Show closed captions"
            }
            title={
              showCaptions
                ? isEs
                  ? "Ocultar subtítulos"
                  : "Hide closed captions"
                : isEs
                ? "Mostrar subtítulos"
                : "Show closed captions"
            }
          >
            <svg
              width="40"
              height="36"
              viewBox="0 0 52 47"
              fill="none"
              aria-hidden="true"
              focusable="false"
            >
              <rect
                x="2"
                y="2"
                width="48"
                height="43"
                rx="10"
                fill={showCaptions ? "#144e57" : "#e6f4f1"}
                stroke="#144e57"
                strokeWidth="2.5"
              />
              <text
                x="26"
                y="28"
                textAnchor="middle"
                fill={showCaptions ? "#ffffff" : "#144e57"}
                fontSize="18"
                fontFamily="Plus Jakarta Sans, sans-serif"
                fontWeight="800"
                letterSpacing="1"
                aria-hidden="true"
              >
                CC
              </text>
            </svg>
          </button>

          <button
            type="button"
            className="s5-audio-btn"
            onClick={toggleAudio}
            aria-pressed={audioPlaying}
            aria-label={
              audioPlaying
                ? isEs
                  ? "Pausar narración de audio"
                  : "Pause audio narration"
                : isEs
                ? "Reproducir narración de audio"
                : "Play audio narration"
            }
            title={
              audioPlaying
                ? isEs
                  ? "Pausar narración de audio"
                  : "Pause audio narration"
                : isEs
                ? "Reproducir narración de audio"
                : "Play audio narration"
            }
          >
            {audioPlaying ? (
              <svg
                width="52"
                height="36"
                viewBox="0 0 70 47"
                fill="none"
                aria-hidden="true"
                focusable="false"
              >
                <rect
                  x="2"
                  y="2"
                  width="66"
                  height="43"
                  rx="10"
                  fill="#144e57"
                  stroke="#144e57"
                  strokeWidth="2.5"
                />
                <rect x="25" y="14" width="6" height="19" rx="2" fill="#ffffff" />
                <rect x="39" y="14" width="6" height="19" rx="2" fill="#ffffff" />
              </svg>
            ) : (
              <svg
                width="52"
                height="36"
                viewBox="0 0 70 47"
                fill="none"
                aria-hidden="true"
                focusable="false"
              >
                <rect
                  x="2"
                  y="2"
                  width="66"
                  height="43"
                  rx="10"
                  fill="#e6f4f1"
                  stroke="#144e57"
                  strokeWidth="2.5"
                />
                <polygon points="28,14 46,23.5 28,33" fill="#144e57" />
              </svg>
            )}
          </button>
        </div>
      </footer>
    </section>
  );
}

export default Slide5PrevalenceScreen;
