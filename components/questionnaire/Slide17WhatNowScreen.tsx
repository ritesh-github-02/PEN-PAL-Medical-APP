"use client";

import React, { useState, useRef, useEffect } from "react";
import { resolveMedicineToken } from "@/lib/token-engine";
import { SlideNavigationButtons } from "./SlideNavigationButtons";

/* ==========================================================
   Slide17WhatNowScreen – "What Now?" (Figma Screen 17)
   - Prominent yellow "What Now?" pill badge (#feff9f)
   - Bold doctor-consultation heading & benefit bullets
   - High-impact illustration (doctor-consultation.png)
   - Inline audio narration with SpeechSynthesis fallback
   - Closed-captions panel (WCAG 1.2.2) + CC / Play toggle buttons
   - Desktop: vertical column with centred artwork
   - Mobile Portrait: scaled-down proportions, scrollable
   - Mobile Landscape: side-by-side split row
   - Standardised SlideNavigationButtons pinned at bottom
   ========================================================== */

const SLIDE17_CSS = `
.s17-root,
.s17-root *,
.s17-root *::before,
.s17-root *::after {
  box-sizing: border-box;
}

.s17-root {
  position: relative;
  width: 100%;
  height: 100%;
  flex: 1 1 0%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  background-color: #fafdf3;
  padding: clamp(16px, 2.8vh, 26px) clamp(20px, 4vw, 44px) clamp(68px, 9vh, 80px) clamp(20px, 4vw, 44px);
  overflow-y: auto;
  overflow-x: hidden;
  font-family: "Plus Jakarta Sans", "Inter", system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
  color: #232323;
}

.s17-sr-only {
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

.s17-root button:focus-visible,
.s17-root [tabindex="0"]:focus-visible {
  outline: 3px solid #143833 !important;
  outline-offset: 3px !important;
}

.s17-badge-title:focus,
.s17-badge-title:focus-visible {
  outline: none !important;
}

.s17-content-wrap {
  width: 100%;
  max-width: 760px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  flex: 1 1 auto;
  min-height: 0;
}

.s17-text-col {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  flex-shrink: 0;
}

.s17-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: auto;
  min-width: 154px;
  height: 44px;
  padding: 0 22px;
  background-color: #feff9f;
  border: 1.8px solid #2b7f8f;
  border-radius: 18px;
  box-shadow: 0 3px 5px rgba(34, 105, 118, 0.28);
  margin-bottom: clamp(10px, 1.8vh, 14px);
  flex-shrink: 0;
}

.s17-badge-title {
  font-size: 19px;
  font-weight: 700;
  color: #142724;
  letter-spacing: -0.01em;
  margin: 0;
  line-height: 1;
  outline: none;
}

.s17-heading {
  font-size: 19.5px;
  font-weight: 700;
  color: #142724;
  margin: 0 0 clamp(6px, 1.2vh, 10px) 0;
  letter-spacing: -0.012em;
  line-height: 1.32;
  text-align: left;
  outline: none;
}

.s17-bullets {
  margin: 0 0 clamp(8px, 1.5vh, 14px) 0;
  padding-left: 22px;
  list-style-type: disc;
  width: 100%;
}

.s17-bullet-item {
  font-size: 15.5px;
  line-height: 1.42;
  color: #142724;
  margin-bottom: 5px;
  font-weight: 500;
  letter-spacing: -0.008em;
  text-align: left;
}

.s17-illustration-wrap {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: clamp(4px, 1.2vh, 12px) auto clamp(8px, 1.8vh, 18px) auto;
  flex: 1 1 auto;
  min-height: 0;
}

.s17-illustration-img {
  width: 100%;
  max-width: 580px;
  height: auto;
  max-height: clamp(240px, 40vh, 325px);
  object-fit: contain;
  display: block;
  user-select: none;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.04));
}

.s17-captions-panel {
  width: 100%;
  max-width: 760px;
  margin: 0 auto clamp(6px, 1.2vh, 10px) auto;
  background: #143833;
  color: #ffffff;
  border: 1.5px solid #bddfd8;
  border-radius: 12px;
  padding: 8px 14px;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.18);
  flex-shrink: 0;
}

.s17-captions-tag {
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

.s17-captions-text {
  font-size: 13.5px;
  line-height: 1.4;
  margin: 0;
  font-weight: 500;
  color: #ffffff;
}

.s17-audio-row {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
  width: 100%;
  max-width: 760px;
  margin: 0 auto clamp(4px, 0.8vh, 8px) auto;
  flex-shrink: 0;
}

.s17-audio-btn {
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

.s17-audio-btn:hover {
  transform: scale(1.08);
  opacity: 0.85;
}

@media (max-height: 720px) and (min-width: 768px) {
  .s17-root { padding: 12px 28px 62px 28px !important; }
  .s17-badge { height: 38px !important; min-width: 140px !important; padding: 0 18px !important; margin-bottom: 8px !important; }
  .s17-badge-title { font-size: 16.5px !important; }
  .s17-heading { font-size: 17px !important; margin-bottom: 6px !important; }
  .s17-bullets { margin-bottom: 6px !important; padding-left: 20px !important; }
  .s17-bullet-item { font-size: 13.5px !important; margin-bottom: 3px !important; }
  .s17-illustration-wrap { margin: 4px auto 6px auto !important; }
  .s17-illustration-img { max-width: 480px !important; max-height: clamp(190px, 32vh, 250px) !important; }
}

@media (max-width: 767px) {
  .s17-root { padding: 14px 14px 72px 14px !important; overflow-y: auto !important; -webkit-overflow-scrolling: touch !important; }
  .s17-content-wrap { max-width: 100% !important; }
  .s17-badge { width: auto !important; min-width: 130px !important; height: 38px !important; padding: 0 16px !important; border-radius: 14px !important; margin-bottom: 10px !important; }
  .s17-badge-title { font-size: 15px !important; }
  .s17-heading { font-size: 16px !important; line-height: 1.32 !important; margin: 0 0 8px 0 !important; }
  .s17-bullets { margin: 0 0 10px 0 !important; padding-left: 18px !important; }
  .s17-bullet-item { font-size: 13.5px !important; line-height: 1.38 !important; margin-bottom: 4px !important; }
  .s17-illustration-wrap { width: 100% !important; margin: 4px auto 10px auto !important; flex: 0 1 auto !important; }
  .s17-illustration-img { width: 100% !important; max-width: 380px !important; max-height: clamp(190px, 32vh, 250px) !important; height: auto !important; object-fit: contain !important; margin: 0 auto !important; }
  .s17-audio-row { max-width: 100% !important; }
  .s17-captions-panel { max-width: 100% !important; }
}

@media (orientation: landscape) and (max-height: 520px) {
  .s17-root { padding: 8px 18px 58px 18px !important; overflow-y: auto !important; }
  .s17-content-wrap { flex-direction: row !important; align-items: center !important; justify-content: space-between !important; gap: 16px !important; max-width: 100% !important; }
  .s17-text-col { flex: 1 1 54% !important; width: 54% !important; justify-content: center !important; }
  .s17-badge { width: auto !important; min-width: 115px !important; height: 32px !important; padding: 0 14px !important; border-radius: 12px !important; margin-bottom: 6px !important; }
  .s17-badge-title { font-size: 13.5px !important; }
  .s17-heading { font-size: 13.5px !important; line-height: 1.25 !important; margin: 0 0 4px 0 !important; }
  .s17-bullets { margin: 0 !important; padding-left: 14px !important; }
  .s17-bullet-item { font-size: 11.5px !important; line-height: 1.25 !important; margin-bottom: 2px !important; }
  .s17-illustration-wrap { flex: 1 1 44% !important; width: 44% !important; max-height: 190px !important; margin: 0 !important; }
  .s17-illustration-img { width: 100% !important; max-width: 340px !important; max-height: clamp(140px, 52vh, 190px) !important; height: auto !important; }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
    scroll-behavior: auto !important;
  }
}
`;

export interface Slide17WhatNowScreenProps {
  isSpanish?: boolean;
  medicationName?: string;
  onNext?: () => void;
  onBack?: () => void;
  loading?: boolean;
  navProps?: {
    onNext: (explicitAnswer?: any) => void;
    onBack: () => void;
    loading?: boolean;
    headingRef?: React.RefObject<HTMLHeadingElement | null>;
  };
  audioSrc?: string;
  stepId?: string;
  locale?: string;
  transcriptText?: string;
}

export function Slide17WhatNowScreen({
  isSpanish = false,
  medicationName,
  onNext,
  onBack,
  loading = false,
  navProps,
  audioSrc,
  stepId = "slide17_what_now",
  locale,
  transcriptText,
}: Slide17WhatNowScreenProps) {
  const [audioPlaying, setAudioPlaying] = useState<boolean>(false);
  const [showCaptions, setShowCaptions] = useState<boolean>(false);
  const [liveAnnouncement, setLiveAnnouncement] = useState<string>("");

  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const activeLocale = locale || (isSpanish ? "es" : "en");
  const isEs = activeLocale.startsWith("es") || isSpanish;

  useEffect(() => {
    const timer = setTimeout(() => {
      headingRef.current?.focus();
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showCaptions) {
        setShowCaptions(false);
        setLiveAnnouncement(isEs ? "Subtitulos ocultados" : "Closed captions dismissed");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showCaptions, isEs]);

  const rawTitle = isEs
    ? "Hable con el medico de su hijo sobre la prueba de alergia a [name]!"
    : "Talk to your child's doctor about [name] allergy testing!";

  const rawBullets = [
    {
      en: "The test can help you learn the truth about your child's past reaction.",
      es: "La prueba puede ayudarle a conocer la verdad sobre la reaccion pasada de su hijo.",
    },
    {
      en: "The test may help your child get better medicine in the future.",
      es: "La prueba puede ayudar a que su hijo reciba mejores medicamentos en el futuro.",
    },
  ];

  const titleText = resolveMedicineToken(rawTitle, medicationName, isEs);

  const effectiveAudioSrc =
    audioSrc ||
    (isEs
      ? "/audio/exported/slide17_what_now_es.mp3"
      : "/audio/exported/slide17_what_now_en.mp3");

  const plainText =
    transcriptText ||
    (isEs
      ? ("Que sigue ahora? " + titleText + " " + rawBullets.map((b) => resolveMedicineToken(b.es, medicationName, isEs)).join(" "))
      : ("What Now? " + titleText + " " + rawBullets.map((b) => resolveMedicineToken(b.en, medicationName, isEs)).join(" ")));

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
        ? isEs ? "Reproduciendo narracion de audio" : "Audio narration playing"
        : isEs ? "Narracion de audio pausada" : "Audio narration paused"
    );
    if (willPlay) {
      if (audioEl && audioEl.src && !audioEl.src.endsWith(".undefined")) {
        audioEl.play().catch(() => {
          if (typeof window !== "undefined" && "speechSynthesis" in window) {
            window.speechSynthesis.cancel();
            const utt = new SpeechSynthesisUtterance(plainText);
            utt.lang = isEs ? "es-US" : "en-US";
            utt.rate = 0.95;
            utt.onstart = () => setAudioPlaying(true);
            utt.onend = () => setAudioPlaying(false);
            utt.onerror = () => setAudioPlaying(false);
            window.speechSynthesis.speak(utt);
          }
        });
      } else if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const utt = new SpeechSynthesisUtterance(plainText);
        utt.lang = isEs ? "es-US" : "en-US";
        utt.rate = 0.95;
        utt.onstart = () => setAudioPlaying(true);
        utt.onend = () => setAudioPlaying(false);
        utt.onerror = () => setAudioPlaying(false);
        window.speechSynthesis.speak(utt);
      }
    } else {
      if (audioEl) audioEl.pause();
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
        ? isEs ? "Subtitulos mostrados" : "Closed captions displayed"
        : isEs ? "Subtitulos ocultados" : "Closed captions hidden"
    );
  };

  const handleNextClick = () => {
    if (onNext) onNext();
    else if (navProps?.onNext) navProps.onNext();
  };

  const handleBackClick = () => {
    if (onBack) onBack();
    else if (navProps?.onBack) navProps.onBack();
  };

  const isLoading = loading || navProps?.loading || false;

  return (
    <div id="slide-content" className="s17-root">
      <style>{SLIDE17_CSS}</style>

      <audio
        ref={audioRef}
        src={effectiveAudioSrc}
        preload="metadata"
        className="s17-sr-only"
        aria-hidden="true"
      />

      <div className="s17-sr-only" role="status" aria-live="polite" aria-atomic="true">
        {liveAnnouncement}
      </div>

      <main className="s17-content-wrap">
        <div className="s17-text-col">
          <div className="s17-badge">
            <h2
              ref={headingRef}
              tabIndex={-1}
              id="slide17-title"
              className="s17-badge-title"
            >
              {isEs ? "Que sigue ahora?" : "What Now?"}
            </h2>
          </div>

          <h1 className="s17-heading">{titleText}</h1>

          <ul className="s17-bullets" aria-label={titleText}>
            {rawBullets.map((b, idx) => {
              const text = resolveMedicineToken(isEs ? b.es : b.en, medicationName, isEs);
              return (
                <li key={idx} className="s17-bullet-item">
                  {text}
                </li>
              );
            })}
          </ul>
        </div>

        <div className="s17-illustration-wrap" aria-hidden="true">
          <img
            src="/images/doctor-consultation.png"
            alt={
              isEs
                ? "Madre e hija consultando con la pediatra sobre las pruebas de alergia"
                : "Mother and daughter consulting with pediatrician about allergy testing"
            }
            className="s17-illustration-img"
            draggable={false}
          />
        </div>
      </main>

      {showCaptions && (
        <div
          className="s17-captions-panel"
          role="region"
          aria-label={isEs ? "Subtitulos de narracion" : "Closed captions"}
        >
          <span className="s17-captions-tag" aria-hidden="true">CC</span>
          <p className="s17-captions-text">{plainText}</p>
        </div>
      )}

      <div
        className="s17-audio-row"
        role="toolbar"
        aria-label={isEs ? "Controles de audio" : "Audio controls"}
      >
        <button
          type="button"
          className="s17-audio-btn"
          onClick={toggleCaptions}
          aria-pressed={showCaptions}
          aria-label={showCaptions ? (isEs ? "Ocultar subtitulos" : "Hide closed captions") : (isEs ? "Mostrar subtitulos" : "Show closed captions")}
          title={showCaptions ? (isEs ? "Ocultar subtitulos" : "Hide closed captions") : (isEs ? "Mostrar subtitulos" : "Show closed captions")}
        >
          <svg width="40" height="36" viewBox="0 0 52 47" fill="none" aria-hidden="true" focusable="false">
            <rect x="2" y="2" width="48" height="43" rx="10" fill={showCaptions ? "#144e57" : "#e6f4f1"} stroke="#144e57" strokeWidth="2.5" />
            <text x="26" y="28" textAnchor="middle" fill={showCaptions ? "#ffffff" : "#144e57"} fontSize="18" fontFamily="Plus Jakarta Sans, sans-serif" fontWeight="800" letterSpacing="1" aria-hidden="true">CC</text>
          </svg>
        </button>

        <button
          type="button"
          className="s17-audio-btn"
          onClick={toggleAudio}
          aria-pressed={audioPlaying}
          aria-label={audioPlaying ? (isEs ? "Pausar narracion de audio" : "Pause audio narration") : (isEs ? "Reproducir narracion de audio" : "Play audio narration")}
          title={audioPlaying ? (isEs ? "Pausar narracion de audio" : "Pause audio narration") : (isEs ? "Reproducir narracion de audio" : "Play audio narration")}
        >
          {audioPlaying ? (
            <svg width="52" height="36" viewBox="0 0 70 47" fill="none" aria-hidden="true" focusable="false">
              <rect x="2" y="2" width="66" height="43" rx="10" fill="#144e57" stroke="#144e57" strokeWidth="2.5" />
              <rect x="25" y="14" width="6" height="19" rx="2" fill="#ffffff" />
              <rect x="39" y="14" width="6" height="19" rx="2" fill="#ffffff" />
            </svg>
          ) : (
            <svg width="52" height="36" viewBox="0 0 70 47" fill="none" aria-hidden="true" focusable="false">
              <rect x="2" y="2" width="66" height="43" rx="10" fill="#e6f4f1" stroke="#144e57" strokeWidth="2.5" />
              <polygon points="28,14 46,23.5 28,33" fill="#144e57" />
            </svg>
          )}
        </button>
      </div>

      <SlideNavigationButtons
        onBack={handleBackClick}
        onNext={handleNextClick}
        isSpanish={isEs}
        loading={isLoading}
      />
    </div>
  );
}

export const Slide21WhatNowScreen = Slide17WhatNowScreen;
export default Slide17WhatNowScreen;
