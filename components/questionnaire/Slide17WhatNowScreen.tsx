"use client";

import React, { useState, useRef, useEffect } from "react";
import { resolveMedicineToken } from "@/lib/token-engine";
import { SlideNavigationButtons } from "./SlideNavigationButtons";

/* ==========================================================
   Slide17WhatNowScreen - "What Now?" (Figma Screen 17)
   - Yellow "What Now?" pill badge (#feff9f), top-left
   - Regular-weight heading & bullets (same size, like Figma)
   - Illustration centred right under the text
   - CC / Play icons on the right, same line as Back / Next
   - Inline audio narration with SpeechSynthesis fallback
   - Closed-captions panel (WCAG 1.2.2)
   - Mobile Portrait: scaled-down, scrollable
   - Mobile Landscape: side-by-side split row
   ========================================================== */

const SLIDE17_CSS = `
.s17-root,
.s17-root *,
.s17-root *::before,
.s17-root *::after {
  box-sizing: border-box;
}

.s17-root {
  --s17-audio-bottom: 14px;
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
  padding: clamp(18px, 3.4vh, 34px) clamp(20px, 4vw, 48px) clamp(80px, 11vh, 96px) clamp(20px, 4vw, 48px);
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
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  flex: 0 0 auto;
}

.s17-text-col {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  flex-shrink: 0;
}

/* ---------- Badge ---------- */
.s17-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: auto;
  min-width: 180px;
  height: 78px;
  padding: 0 30px;
  background-color: #feff9f;
  border: 2px solid #2b7f8f;
  border-radius: 22px;
  box-shadow: 0 4px 5px rgba(34, 105, 118, 0.45);
  margin: 0 0 clamp(18px, 3.4vh, 32px) 0;
  flex-shrink: 0;
}

.s17-badge-title {
  font-size: 25px;
  font-weight: 700;
  color: #142724;
  letter-spacing: -0.01em;
  margin: 0;
  line-height: 1;
  outline: none;
  white-space: nowrap;
}

/* ---------- Heading + bullets (regular weight, same size) ---------- */
.s17-heading {
  font-size: clamp(20px, 2.7vw, 26px);
  font-weight: 400;
  color: #232323;
  margin: 0;
  letter-spacing: -0.005em;
  line-height: 1.3;
  text-align: left;
  outline: none;
}

.s17-bullets {
  margin: 0;
  padding-left: 38px;
  list-style-type: disc;
  width: 100%;
}

.s17-bullet-item {
  font-size: clamp(20px, 2.7vw, 26px);
  line-height: 1.3;
  color: #232323;
  margin: 0;
  font-weight: 400;
  letter-spacing: -0.005em;
  text-align: left;
}

/* ---------- Illustration ---------- */
.s17-illustration-wrap {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  margin: clamp(2px, 0.8vh, 8px) auto 0 auto;
  flex: 0 0 auto;
}

.s17-illustration-img {
  width: 100%;
  max-width: 420px;
  height: auto;
  max-height: clamp(220px, 38vh, 300px);
  object-fit: contain;
  display: block;
  user-select: none;
  background: transparent;
  mix-blend-mode: multiply;
  box-shadow: none;
  filter: none;
}

/* ---------- Captions ---------- */
.s17-captions-panel {
  width: 100%;
  max-width: 800px;
  margin: 8px auto 0 auto;
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

/* ---------- Audio row: same line as Back / Next, right side ---------- */
.s17-audio-row {
  position: absolute;
  right: clamp(16px, 4vw, 44px);
  bottom: var(--s17-audio-bottom);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  z-index: 5;
}

.s17-audio-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  color: #144e57;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2px;
  min-width: 44px;
  min-height: 44px;
  border-radius: 8px;
  transition: transform 0.12s ease, opacity 0.15s ease;
}

.s17-audio-btn:hover {
  transform: scale(1.08);
  opacity: 0.85;
}

/* ---------- Short desktop screens ---------- */
@media (max-height: 720px) and (min-width: 768px) {
  .s17-root { padding: 14px 28px 68px 28px !important; }
  .s17-badge { height: 60px !important; min-width: 150px !important; padding: 0 24px !important; margin-bottom: 14px !important; }
  .s17-badge-title { font-size: 20px !important; }
  .s17-heading, .s17-bullet-item { font-size: 19px !important; }
  .s17-illustration-img { max-width: 340px !important; max-height: clamp(170px, 30vh, 230px) !important; }
}

/* ---------- Mobile portrait ---------- */
@media (max-width: 767px) {
  .s17-root { padding: 16px 16px 76px 16px !important; overflow-y: auto !important; -webkit-overflow-scrolling: touch !important; }
  .s17-content-wrap { max-width: 100% !important; }
  .s17-badge { min-width: 128px !important; height: 54px !important; padding: 0 22px !important; border-radius: 16px !important; margin-bottom: 14px !important; }
  .s17-badge-title { font-size: 18px !important; }
  .s17-heading { font-size: 17px !important; line-height: 1.32 !important; }
  .s17-bullets { padding-left: 26px !important; }
  .s17-bullet-item { font-size: 17px !important; line-height: 1.32 !important; }
  .s17-illustration-wrap { margin: 6px auto 4px auto !important; }
  .s17-illustration-img { max-width: 340px !important; max-height: clamp(190px, 34vh, 270px) !important; margin: 0 auto !important; }
  .s17-captions-panel { max-width: 100% !important; }
}

/* Small phones: icons sit on their own row just above Back / Next */
@media (max-width: 599px) {
  .s17-root { padding-bottom: 124px !important; }
  .s17-audio-row {
    right: 12px;
    bottom: 70px;
    gap: 6px;
  }
  .s17-audio-btn svg { transform: scale(0.9); }
}

/* ---------- Mobile landscape ---------- */
@media (orientation: landscape) and (max-height: 520px) {
  .s17-root { --s17-audio-bottom: 8px; padding: 10px 18px 60px 18px !important; overflow-y: auto !important; }
  .s17-content-wrap { flex-direction: row !important; align-items: center !important; justify-content: space-between !important; gap: 16px !important; max-width: 100% !important; }
  .s17-text-col { flex: 1 1 54% !important; width: 54% !important; justify-content: center !important; }
  .s17-badge { min-width: 110px !important; height: 40px !important; padding: 0 16px !important; border-radius: 13px !important; margin-bottom: 8px !important; }
  .s17-badge-title { font-size: 14px !important; }
  .s17-heading { font-size: 14px !important; line-height: 1.3 !important; }
  .s17-bullets { padding-left: 18px !important; }
  .s17-bullet-item { font-size: 14px !important; line-height: 1.3 !important; }
  .s17-illustration-wrap { flex: 1 1 44% !important; width: 44% !important; margin: 0 !important; align-items: center !important; }
  .s17-illustration-img { max-width: 320px !important; max-height: clamp(130px, 50vh, 190px) !important; }
  .s17-audio-row { right: 14px !important; bottom: 8px !important; }
  .s17-audio-btn svg { transform: scale(0.8); }
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
    ? "Hable con el medico de su hijo sobre Pink medicine allergy testing!"
    : "Talk to your child's doctor about Pink medicine allergy testing!"

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
        {/* CC - speech bubble icon (Figma) */}
        <button
          type="button"
          className="s17-audio-btn"
          onClick={toggleCaptions}
          aria-pressed={showCaptions}
          aria-label={showCaptions ? (isEs ? "Ocultar subtitulos" : "Hide closed captions") : (isEs ? "Mostrar subtitulos" : "Show closed captions")}
          title={showCaptions ? (isEs ? "Ocultar subtitulos" : "Hide closed captions") : (isEs ? "Mostrar subtitulos" : "Show closed captions")}
        >
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true" focusable="false">
            <path
              d="M8 3H32C34.2 3 36 4.8 36 7V26C36 28.2 34.2 30 32 30H17L9 37V30H8C5.8 30 4 28.2 4 26V7C4 4.8 5.8 3 8 3Z"
              fill={showCaptions ? "#144e57" : "#e6f4f1"}
              stroke="#1b6f7c"
              strokeWidth="2.4"
              strokeLinejoin="round"
            />
            <text
              x="20"
              y="22"
              textAnchor="middle"
              fill={showCaptions ? "#ffffff" : "#1b6f7c"}
              fontSize="15"
              fontFamily="Plus Jakarta Sans, sans-serif"
              fontWeight="600"
              aria-hidden="true"
            >
              CC
            </text>
          </svg>
        </button>

        {/* Play - triangle with sound waves (Figma) */}
        <button
          type="button"
          className="s17-audio-btn"
          onClick={toggleAudio}
          aria-pressed={audioPlaying}
          aria-label={audioPlaying ? (isEs ? "Pausar narracion de audio" : "Pause audio narration") : (isEs ? "Reproducir narracion de audio" : "Play audio narration")}
          title={audioPlaying ? (isEs ? "Pausar narracion de audio" : "Pause audio narration") : (isEs ? "Reproducir narracion de audio" : "Play audio narration")}
        >
          {audioPlaying ? (
            <svg width="52" height="40" viewBox="0 0 52 40" fill="none" aria-hidden="true" focusable="false">
              <rect x="4" y="4" width="8" height="26" rx="2.5" fill="#1b6f7c" />
              <rect x="18" y="4" width="8" height="26" rx="2.5" fill="#1b6f7c" />
              <path d="M33 11C36.5 14.5 36.5 21.5 33 25" stroke="#1b6f7c" strokeWidth="2.4" strokeLinecap="round" />
              <path d="M39 6C45.5 12.5 45.5 23.5 39 30" stroke="#1b6f7c" strokeWidth="2.4" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="52" height="40" viewBox="0 0 52 40" fill="none" aria-hidden="true" focusable="false">
              <path
                d="M5 5.5C5 3.6 7 2.5 8.6 3.5L30 16.2C31.5 17.1 31.5 19.3 30 20.2L8.6 32.9C7 33.9 5 32.8 5 30.9V5.5Z"
                fill="#e6f4f1"
                stroke="#1b6f7c"
                strokeWidth="2.4"
                strokeLinejoin="round"
              />
              <text
                x="15"
                y="23"
                textAnchor="middle"
                fill="#1b6f7c"
                fontSize="9"
                fontFamily="Plus Jakarta Sans, sans-serif"
                fontWeight="700"
                aria-hidden="true"
              >
                play
              </text>
              <path d="M35 11C38.5 14.5 38.5 21.5 35 25" stroke="#1b6f7c" strokeWidth="2.4" strokeLinecap="round" />
              <path d="M41 6C47.5 12.5 47.5 23.5 41 30" stroke="#1b6f7c" strokeWidth="2.4" strokeLinecap="round" />
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