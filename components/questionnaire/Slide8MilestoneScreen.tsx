"use client";

import React, { useState, useRef, useEffect } from "react";

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
    max-width: 58%;
    aspect-ratio: 510 / 315;
    flex-shrink: 0;
    filter: drop-shadow(2.5px 3.5px 0px #1a3532);
    margin-right: -10px;
    margin-top: -30px;
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
    font-size: 21.5px;
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
    width: 185px;
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

  .s8-nav-center {
    display: flex;
    align-items: center;
    gap: 14px;
    margin: 0 auto;
    flex-shrink: 0;
  }

  /* Navigation Buttons (WCAG 2.5.5 AAA Target Size >= 44px) */
  .s8-btn-nav {
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
  .s8-btn-nav:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.14);
  }
  .s8-btn-nav:active:not(:disabled) {
    transform: translateY(1px);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }
  .s8-btn-nav:disabled {
    opacity: 0.55;
    cursor: not-allowed;
    box-shadow: none;
  }

  /* Back Button (Contrast #11332e on #bddfd8 = 9.4:1 AAA) */
  .s8-btn-back {
    background-color: #bddfd8;
    color: #11332e;
    border-color: #78a59b;
  }
  .s8-btn-back:hover:not(:disabled) {
    background-color: #a8d5cc;
  }

  /* Next Button (Contrast #1a2624 on #fdee8e = 12.8:1 AAA) */
  .s8-btn-next {
    background-color: #fdee8e;
    color: #1a2624;
    border-color: #c8b746;
  }
  .s8-btn-next:hover:not(:disabled) {
    background-color: #f5e478;
  }

  /* Audio Controls (WCAG 1.4.3 AAA Contrast: #144e57 on #fafdf3 = 8.2:1) */
  .s8-audio-controls {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #144e57;
    justify-content: flex-end;
  }
  .s8-audio-btn {
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
  .s8-audio-btn:hover {
    transform: scale(1.08);
    opacity: 0.85;
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
  .s8-component-card.is-mobile .s8-btn-nav {
    min-height: 44px !important;
    min-width: 72px !important;
    font-size: 14px !important;
    padding: 0 16px !important;
  }
  .s8-component-card.is-mobile .s8-spacer-side {
    width: 60px !important;
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
      max-width: 320px;
      aspect-ratio: 510 / 315;
      height: auto;
      margin: 0 auto;
      filter: drop-shadow(2px 3px 0px #1a3532);
    }
    .s8-heading {
      font-size: 14.5px;
      line-height: 1.38;
    }
    .s8-nurse-wrap {
      width: 125px;
      height: 215px;
      margin-top: -24px;
      margin-left: auto;
      margin-right: 48px;
    }
    .s8-btn-nav {
      min-height: 44px;
      min-width: 72px;
      font-size: 14px;
      padding: 0 16px;
    }
    .s8-spacer-side {
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
            const utterance = new SpeechSynthesisUtterance(spokenText);
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
        const utterance = new SpeechSynthesisUtterance(spokenText);
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
      className={`s8-component-card${variantClass}`}
      role="region"
      aria-roledescription="slide"
      aria-labelledby="slide8-heading"
      lang={isEs ? "es" : "en"}
    >
      <style dangerouslySetInnerHTML={{ __html: SLIDE8_COMPONENT_CSS }} />

      {/* Screen Reader Live Region for WCAG 4.1.3 */}
      <div className="s8-sr-only" role="status" aria-live="polite" aria-atomic="true">
        {liveAnnouncement}
      </div>

      {/* Hidden audio element for audio narration */}
      <audio
        ref={audioRef}
        src={effectiveAudioSrc}
        preload="metadata"
        className="s8-sr-only"
        aria-hidden="true"
      />

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

      {/* Closed Caption Drawer (WCAG 1.2.2 Captions) */}
      {showCaptions && (
        <div
          className="s8-captions-panel"
          role="region"
          aria-label={isEs ? "Subtítulos de narración" : "Closed captions"}
        >
          <span className="s8-captions-tag" aria-hidden="true">
            CC
          </span>
          <p className="s8-captions-text">
            {spokenText}
          </p>
        </div>
      )}

      {/* 3. Bottom Navigation & Audio Controls (WCAG 2.4.1 Toolbar) */}
      <footer
        className="s8-bottom-bar"
        role="toolbar"
        aria-label={isEs ? "Controles de navegación y audio" : "Slide navigation and media controls"}
      >
        <div className="s8-spacer-side" aria-hidden="true" />

        {/* Centered Navigation Buttons (Back & Next) */}
        <nav
          className="s8-nav-center"
          aria-label={isEs ? "Navegación de diapositiva" : "Slide pagination"}
        >
          <button
            type="button"
            className="s8-btn-nav s8-btn-back"
            onClick={onBack}
            disabled={loading}
            aria-label={isEs ? "Volver a la diapositiva anterior" : "Back to previous slide"}
          >
            {isEs ? "Atrás" : "Back"}
          </button>
          <button
            type="button"
            className="s8-btn-nav s8-btn-next"
            onClick={onNext}
            disabled={loading}
            aria-label={isEs ? "Continuar a la siguiente diapositiva" : "Next slide"}
          >
            {isEs ? "Siguiente" : "Next"}
          </button>
        </nav>

        {/* Audio narration & CC controls */}
        <div className="s8-audio-controls s8-spacer-side">
          <button
            type="button"
            className="s8-audio-btn"
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
            className="s8-audio-btn"
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

export default Slide8MilestoneScreen;
