"use client";

import React, { useState, useRef, useEffect } from "react";

import { resolveMedicineToken as engineResolveMedicineToken } from "@/lib/token-engine";

// ============================================================================
// Types & Interfaces
// ============================================================================
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

export interface AudioPlayerProps {
  audioSrc?: string;
  stepId?: string;
  locale?: string;
  transcriptText?: string;
  size?: "small" | "medium" | "large";
  onAudioToggle?: (playing: boolean) => void;
  onCaptionsToggle?: (showing: boolean) => void;
  className?: string;
}

export interface SlideNavigationButtonsProps {
  onBack?: () => void;
  onNext?: () => void;
  isSpanish?: boolean;
  loading?: boolean;
  nextDisabled?: boolean;
  variant?: string;
  className?: string;
}

// ============================================================================
// Helper: Medicine Token Resolution
// ============================================================================
function resolveMedicineToken(
  text: string,
  medicationName?: string,
  isSpanish?: boolean
): string {
  const medicine =
    medicationName && medicationName.trim()
      ? medicationName.trim()
      : isSpanish
        ? "la amoxicilina"
        : "amoxicillin";

  return engineResolveMedicineToken(text, medicine, isSpanish)
    .replace(/\[\s*name\s*\]/gi, medicine)
    .replace(/\[name\]/gi, medicine)
    .replace(/\[Name\]/g, medicine)
    .replace(/name /g, medicine);
}

// ============================================================================
// Subcomponent 1: Self-contained AudioPlayer (Play/Pause & Closed Captions)
// ============================================================================
function InternalAudioPlayer({
  audioSrc,
  stepId,
  locale = "en",
  transcriptText,
  size = "large",
  onAudioToggle,
  onCaptionsToggle,
  className = "",
}: AudioPlayerProps) {
  const isSpanish = locale === "es";

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [showCaptions, setShowCaptions] = useState<boolean>(false);
  const [liveAnnouncement, setLiveAnnouncement] = useState<string>("");

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Stop audio on unmount or slide change
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [stepId]);

  // Dismiss captions on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showCaptions) {
        e.preventDefault();
        setShowCaptions(false);
        onCaptionsToggle?.(false);
        setLiveAnnouncement(
          isSpanish ? "Subtítulos ocultados" : "Closed captions hidden"
        );
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showCaptions, isSpanish, onCaptionsToggle]);

  const toggleCaptions = () => {
    const next = !showCaptions;
    setShowCaptions(next);
    onCaptionsToggle?.(next);
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

  const toggleAudio = () => {
    const next = !isPlaying;

    if (!next) {
      if (audioRef.current && !audioRef.current.paused) {
        audioRef.current.pause();
      }
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      setIsPlaying(false);
      onAudioToggle?.(false);
      setLiveAnnouncement(
        isSpanish ? "Narración de audio en pausa" : "Audio narration paused"
      );
      return;
    }

    if (audioSrc && audioRef.current) {
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          onAudioToggle?.(true);
          setLiveAnnouncement(
            isSpanish
              ? "Narración de audio en reproducción"
              : "Audio narration playing"
          );
        })
        .catch(() => {
          fallbackSpeechSynthesis();
        });
    } else {
      fallbackSpeechSynthesis();
    }
  };

  const fallbackSpeechSynthesis = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const textToRead = transcriptText || "";
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.lang = isSpanish ? "es-ES" : "en-US";
      utterance.rate = 0.95;

      utterance.onstart = () => {
        setIsPlaying(true);
        onAudioToggle?.(true);
        setLiveAnnouncement(
          isSpanish
            ? "Narración de audio en reproducción"
            : "Audio narration playing"
        );
      };

      utterance.onend = () => {
        setIsPlaying(false);
        onAudioToggle?.(false);
      };

      utterance.onerror = () => {
        setIsPlaying(false);
        onAudioToggle?.(false);
      };

      window.speechSynthesis.speak(utterance);
    } else {
      setIsPlaying(false);
    }
  };

  return (
    <div className={`relative flex flex-col items-end ${className}`}>
      {/* HTML5 Audio Element */}
      {audioSrc && (
        <audio
          ref={audioRef}
          src={audioSrc}
          onEnded={() => {
            setIsPlaying(false);
            onAudioToggle?.(false);
          }}
          className="hidden"
          preload="metadata"
        />
      )}

      {/* Screen Reader Live Status Region */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {liveAnnouncement}
      </div>

      {/* Closed Captions Panel */}
      {showCaptions && transcriptText && (
        <div
          role="region"
          aria-label={isSpanish ? "Subtítulos de narración" : "Audio narration captions"}
          className="mb-2 max-w-sm sm:max-w-md bg-[#143833] text-white p-3 rounded-xl shadow-xl border border-[#bddfd8] text-xs sm:text-sm font-medium leading-relaxed flex items-start gap-2.5 z-30 animate-fadeIn"
        >
          <span
            aria-hidden="true"
            className="bg-[#fdee8e] text-[#1a2624] font-extrabold text-[10px] sm:text-xs px-1.5 py-0.5 rounded flex-shrink-0 uppercase tracking-wider"
          >
            CC
          </span>
          <p className="m-0 text-slate-100 flex-1">{transcriptText}</p>
        </div>
      )}

      {/* Audio Controls Bar */}
      <div
        className="flex items-center gap-2"
        role="toolbar"
        aria-label={isSpanish ? "Controles de audio" : "Media controls"}
        style={{ color: "#144e57" }}
      >
        {/* Closed Captions Button */}
        <button
          type="button"
          onClick={toggleCaptions}
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
          title={
            showCaptions
              ? isSpanish
                ? "Ocultar subtítulos"
                : "Hide closed captions"
              : isSpanish
                ? "Mostrar subtítulos"
                : "Show closed captions"
          }
          className="s3-audio-btn"
        >
          <svg
            width="46"
            height="42"
            viewBox="0 0 40 36"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            focusable="false"
          >
            <path
              d="M 8.5 5.5 C 5.5 5.5 4 7.2 4 11 V 20 C 4 23.8 5.5 25.5 8.5 25.5 H 12 C 13 25.5 14 26.3 14.7 27.5 L 16.5 30.5 C 17.3 31.7 18.7 31.7 19.5 30.5 L 21.3 27.5 C 22 26.3 23 25.5 24 25.5 H 31.5 C 34.5 25.5 36 23.8 36 20 V 11 C 36 7.2 34.5 5.5 31.5 5.5 Z"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill={showCaptions ? "currentColor" : "none"}
            />
            <text
              x="20"
              y="15.5"
              textAnchor="middle"
              dominantBaseline="central"
              fill={showCaptions ? "#ffffff" : "currentColor"}
              fontSize="13"
              fontWeight="700"
              fontFamily="ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
              letterSpacing="0.3px"
            >
              CC
            </text>
          </svg>
        </button>

        {/* Play/Pause Button */}
        <button
          type="button"
          onClick={toggleAudio}
          aria-pressed={isPlaying}
          aria-label={
            isPlaying
              ? isSpanish
                ? "Pausar narración de audio"
                : "Pause audio narration"
              : isSpanish
                ? "Reproducir narración de audio"
                : "Play audio narration"
          }
          title={
            isPlaying
              ? isSpanish
                ? "Pausar narración de audio"
                : "Pause audio narration"
              : isSpanish
                ? "Reproducir narración de audio"
                : "Play audio narration"
          }
          className="s3-audio-btn"
        >
          {isPlaying ? (
            <svg
              width="58"
              height="42"
              viewBox="0 0 50 36"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              focusable="false"
            >
              <path
                d="M 4.5 8.5 C 4.5 5.5 6.8 4.2 9.5 5.8 L 28 16.2 C 29.8 17.2 29.8 18.8 28 19.8 L 9.5 30.2 C 6.8 31.8 4.5 30.5 4.5 27.5 Z"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinejoin="round"
                fill="none"
              />
              <line x1="11.5" y1="13" x2="11.5" y2="23" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
              <line x1="16.5" y1="13" x2="16.5" y2="23" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
              <path
                d="M 33 11 C 37 13.5 37 22.5 33 25"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
              <path
                d="M 38.5 6.5 C 44.5 10.5 44.5 25.5 38.5 29.5"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            <svg
              width="58"
              height="42"
              viewBox="0 0 50 36"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              focusable="false"
            >
              <path
                d="M 4.5 8.5 C 4.5 5.5 6.8 4.2 9.5 5.8 L 28 16.2 C 29.8 17.2 29.8 18.8 28 19.8 L 9.5 30.2 C 6.8 31.8 4.5 30.5 4.5 27.5 Z"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinejoin="round"
                fill="none"
              />
              <text
                x="14.8"
                y="17.2"
                textAnchor="middle"
                dominantBaseline="central"
                fill="currentColor"
                fontSize="8"
                fontWeight="700"
                fontFamily="ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                letterSpacing="0.1px"
              >
                play
              </text>
              <path
                d="M 33 11 C 37 13.5 37 22.5 33 25"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
              <path
                d="M 38.5 6.5 C 44.5 10.5 44.5 25.5 38.5 29.5"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// Subcomponent 2: Self-contained SlideNavigationButtons (Back & Next)
// ============================================================================
function InternalSlideNavigationButtons({
  onBack,
  onNext,
  isSpanish,
  loading = false,
  nextDisabled = false,
  className = "",
}: SlideNavigationButtonsProps) {
  return (
    <nav className={`slide-nav slide-nav-container ${className}`} aria-label="Slide navigation">
      <button
        type="button"
        className="slide-nav-btn slide-nav-btn--back"
        onClick={onBack}
        aria-label={isSpanish ? "Ir a la diapositiva anterior" : "Go to previous slide"}
      >
        {isSpanish ? "Atrás" : "Back"}
      </button>

      <button
        type="button"
        className="slide-nav-btn slide-nav-btn--next"
        onClick={onNext}
        disabled={loading || nextDisabled}
        aria-label={
          loading
            ? isSpanish
              ? "Cargando siguiente diapositiva"
              : "Loading next slide"
            : isSpanish
              ? "Ir a la siguiente diapositiva"
              : "Go to next slide"
        }
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="inline-block w-4 h-4 border-2 border-slate-700 border-t-transparent rounded-full animate-spin" />
            <span>{isSpanish ? "Cargando..." : "Loading..."}</span>
          </span>
        ) : isSpanish ? (
          "Siguiente"
        ) : (
          "Next"
        )}
      </button>
    </nav>
  );
}

// ============================================================================
// Constants & Vectors
// ============================================================================
const STAGE_W = 750;
const STAGE_H = 530;

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

// ============================================================================
// Responsive Styles
// ============================================================================
const mobileLayout = (scope: string) => `
  ${scope} {
    overflow-y: auto !important;
    overflow-x: hidden !important;
    -webkit-overflow-scrolling: touch !important;
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
  ${scope} .s3-stage {
    position: relative !important;
    width: 100% !important;
    max-width: 380px !important;
    height: auto !important;
    flex: 1 1 auto !important;
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
    gap: 16px !important;
  }
  ${scope} .s3-left-col {
    position: static !important;
    width: 100% !important;
    max-width: 340px !important;
    margin: 18px auto 0 auto !important;
    padding: 0 !important;
    display: flex !important;
    justify-content: center !important;
    text-align: center !important;
    flex-shrink: 0 !important;
  }
  ${scope} .s3-heading {
    position: static !important;
    width: 100% !important;
    font-size: clamp(16px, 2.4vh, 18.5px) !important;
    line-height: 1.38 !important;
    font-weight: 700 !important;
    letter-spacing: -0.015em !important;
    text-align: center !important;
    margin: 0 auto !important;
    color: #142724 !important;
    border: none !important;
    outline: none !important;
  }
  ${scope} .s3-heading:focus,
  ${scope} .s3-heading:focus-visible {
    outline: none !important;
  }
  ${scope} .s3-bubble {
    position: relative !important;
    left: auto !important;
    top: auto !important;
    width: clamp(255px, 76vw, 305px) !important;
    aspect-ratio: 380 / 250 !important;
    height: auto !important;
    margin: 0 auto !important;
    filter: drop-shadow(2px 3px 0px #1a3532) !important;
  }
  ${scope} .s3-bubble-text-wrap {
    top: 42% !important;
    left: 48% !important;
    width: 82% !important;
    max-width: 255px !important;
    padding: 0 4px !important;
    box-sizing: border-box !important;
  }
  ${scope} .s3-bubble-text {
    font-size: clamp(13px, 1.85vh, 14.5px) !important;
    line-height: 1.38 !important;
    word-break: normal !important;
    overflow-wrap: break-word !important;
    text-align: center !important;
  }
  ${scope} .s3-nurse {
    position: relative !important;
    left: auto !important;
    top: auto !important;
    width: clamp(80px, 20vw, 105px) !important;
    height: clamp(125px, 17vh, 160px) !important;
    margin-top: -20px !important;
    margin-left: auto !important;
    margin-right: 10% !important;
  }
  ${scope} .s3-nurse-img {
    height: 100% !important;
    max-height: 100% !important;
    object-fit: contain !important;
  }
  /* Two-tier bottom bar with generous separation */
  ${scope} .s3-bottom-bar-mobile {
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
  ${scope} .s3-audio {
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
    color: #144e57 !important;
  }
  ${scope} .s3-audio-btn {
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
  ${scope} .s3-audio-btn:hover {
    transform: scale(1.08) !important;
    opacity: 0.85 !important;
  }
  ${scope} .s3-audio-btn svg {
    height: 34px !important;
    width: auto !important;
    transition: transform 0.12s ease !important;
  }
  ${scope} .s3-audio-btn:hover svg,
  ${scope} .s3-audio-btn:active svg {
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
  }
`;

const SLIDE3_CSS = `
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
    top: 42px;
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

  /* Speech Bubble */
  .s3-bubble {
    position: absolute;
    left: 371px;
    top: 119px;
    width: 290px;
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
    width: 78%;
    max-width: 235px;
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
    font-size: 14.5px;
    line-height: 1.45;
    font-weight: 600;
    color: #142724;
    text-align: center;
    letter-spacing: -0.01em;
  }

  /* Nurse Anna */
  .s3-nurse {
    position: absolute;
    left: 620px;
    top: 240px;
    width: 100px;
    height: 200px;
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

  /* Navigation Buttons */
  .slide-nav-container {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    z-index: 30;
  }

  .slide-nav-btn {
    min-height: 48px;
    height: 48px;
    min-width: 124px;
    padding: 0 32px;
    border-radius: 9999px;
    font-family: inherit;
    font-size: 16px;
    font-weight: 700;
    cursor: pointer;
    border: 1.5px solid transparent;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: transform 0.1s ease, background-color 0.15s ease, box-shadow 0.15s ease;
    user-select: none;
    touch-action: manipulation;
  }

  .slide-nav-btn:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.14);
  }

  .slide-nav-btn:active:not(:disabled) {
    transform: translateY(1px);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }

  .slide-nav-btn:focus-visible {
    outline: 3px solid #143833 !important;
    outline-offset: 3px !important;
  }

  .slide-nav-btn--back {
    background-color: #bddfd8;
    border-color: #78a59b;
    color: #11332e;
  }
  .slide-nav-btn--back:hover:not(:disabled) {
    background-color: #a8d5cc;
  }

  .slide-nav-btn--next {
    background-color: #fdee8e;
    border-color: #c8b746;
    color: #1a2624;
  }
  .slide-nav-btn--next:hover:not(:disabled) {
    background-color: #f5e478;
  }

  .slide-nav-btn:disabled,
  .slide-nav-btn--disabled {
    opacity: 0.55;
    cursor: not-allowed;
    pointer-events: none;
    box-shadow: none;
  }

  /* Desktop Layout: Bottom controls */
  .s3-bottom-bar-mobile {
    display: none;
  }
  .s3-audio-desktop {
    position: absolute;
    right: 22px;
    bottom: clamp(16px, 3vh, 22px);
    display: flex;
    align-items: center;
    justify-content: flex-end;
    z-index: 30;
    color: #144e57;
  }
  .s3-audio-desktop .s3-audio-btn {
    background: transparent;
    border: none;
    cursor: pointer;
    color: #144e57;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px;
    min-width: 44px;
    min-height: 44px;
    border-radius: 8px;
    transition: transform 0.12s ease, opacity 0.15s ease;
  }
  .s3-audio-desktop .s3-audio-btn svg {
    height: 34px !important;
    width: auto !important;
  }
  .s3-nav-desktop {
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    bottom: clamp(16px, 3vh, 22px);
    left: 0;
    right: 0;
    margin: 0 auto;
    z-index: 25;
  }

  @media (max-width: 767px) {
    ${mobileLayout(".s3-root")}
    .s3-audio-desktop {
      display: none !important;
    }
    .s3-nav-desktop {
      display: none !important;
    }
    .s3-bottom-bar-mobile {
      display: flex !important;
    }
  }

  ${mobileLayout(".s3-root.is-mobile")}
  .s3-root.is-mobile .s3-audio-desktop {
    display: none !important;
  }
  .s3-root.is-mobile .s3-nav-desktop {
    display: none !important;
  }
  .s3-root.is-mobile .s3-bottom-bar-mobile {
    display: flex !important;
  }

  /* Accessibility: Prefers-Reduced-Motion */
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.001ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.001ms !important;
    }
  }
`;

// ============================================================================
// Main Component: Slide3EfficacyScreen
// ============================================================================
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

  const rawMed =
    medicationName && medicationName.trim()
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

  const variantClass =
    variant === "mobile" ? " is-mobile" : variant === "desktop" ? " is-desktop" : "";

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

      {/* Scaled stage container */}
      <div className="s3-stage" style={{ transform: `scale(${scale})` }}>
        {/* 1. Statement Heading */}
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

        {/* 2. Speech Bubble */}
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
            <blockquote className="s3-bubble-text">{bubbleText}</blockquote>
          </div>
        </figure>

        {/* 3. Nurse Anna */}
        <div className="s3-nurse" aria-hidden="true">
          <img
            src="/images/nurse-anna.png"
            alt={isEs ? "Ilustración de la enfermera Anna" : "Nurse Anna"}
            className="s3-nurse-img"
            draggable={false}
          />
        </div>
      </div>

      {/* 4. Desktop Audio narration & CC controls */}
      <div className="s3-audio-desktop">
        <InternalAudioPlayer
          audioSrc={effectiveAudioSrc}
          stepId={stepId}
          locale={isEs ? "es" : "en"}
          transcriptText={captionText}
          size="large"
        />
      </div>

      {/* 5. Desktop Centered Navigation */}
      <div className="s3-nav-desktop">
        <InternalSlideNavigationButtons
          onBack={onBack}
          onNext={onNext}
          isSpanish={isEs}
          loading={loading}
        />
      </div>

      {/* 6. Mobile Centered Stacked Bottom Bar */}
      <div className="s3-bottom-bar-mobile">
        <div className="s3-audio">
          <InternalAudioPlayer
            audioSrc={effectiveAudioSrc}
            stepId={stepId}
            locale={isEs ? "es" : "en"}
            transcriptText={captionText}
            size="large"
          />
        </div>

        <InternalSlideNavigationButtons
          onBack={onBack}
          onNext={onNext}
          isSpanish={isEs}
          loading={loading}
        />
      </div>
    </div>
  );
}

export default Slide3EfficacyScreen;


