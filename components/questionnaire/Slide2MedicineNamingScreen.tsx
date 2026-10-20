"use client";

import React, { useRef, useEffect } from "react";
import AudioPlayer from "./AudioPlayer";

export interface Slide2MedicineNamingScreenProps {
  isSpanish?: boolean;
  selected?: string;
  onSelect: (value: string) => void;
  onNext: () => void;
  onBack: () => void;
  loading?: boolean;
  audioSrc?: string;
  stepId?: string;
  locale?: string;
  transcriptText?: string;
  variant?: "auto" | "desktop" | "mobile";
}

export const MEDICINE_OPTIONS_DISPLAY = [
  { value: "Penicillin", labelEn: "Penicillin", labelEs: "Penicilina" },
  { value: "Pink medicine", labelEn: "“Pink medicine”", labelEs: "“Medicina rosa”" },
  { value: "Amoxicillin", labelEn: "Amoxicillin", labelEs: "Amoxicilina" },
  { value: "Amoxicillin Clavulanate", labelEn: "Amoxicillin Clavulanate", labelEs: "Amoxicilina Clavulanato" },
  { value: "Augmentin", labelEn: "Augmentin", labelEs: "Augmentin" },
];

/* Hand-drawn style bubble body + sharp tail matching Image 2 */
const BUBBLE_PATH =
  "M 397.9,283.4 " +
  "C 395.8,284.6 391.2,287.9 385.1,290.7 " +
  "C 379.0,293.4 369.2,297.5 361.3,299.9 " +
  "C 353.4,302.3 345.2,303.8 337.6,305.3 " +
  "C 330.0,306.8 322.6,307.8 315.6,309.0 " +
  "C 308.6,310.2 302.5,312.1 295.5,312.7 " +
  "C 288.5,313.3 280.6,312.4 273.6,312.7 " +
  "C 266.6,313.0 260.2,314.5 253.5,314.5 " +
  "C 246.8,314.5 240.1,313.3 233.4,312.7 " +
  "C 226.7,312.1 220.6,311.4 213.3,310.8 " +
  "C 206.0,310.2 197.2,310.2 189.6,309.0 " +
  "C 182.0,307.8 175.5,305.3 167.6,303.5 " +
  "C 159.7,301.7 150.3,300.8 142.1,298.0 " +
  "C 133.9,295.3 126.8,291.3 118.3,287.0 " +
  "C 109.8,282.7 99.7,277.9 90.9,272.4 " +
  "C 82.1,266.9 73.8,261.1 65.3,254.1 " +
  "C 56.8,247.1 46.8,239.2 39.8,230.3 " +
  "C 32.8,221.5 27.0,211.4 23.3,201.0 " +
  "C 19.6,190.6 18.1,179.0 17.8,168.0 " +
  "C 17.5,157.0 19.1,146.0 21.5,135.0 " +
  "C 23.9,124.0 27.2,111.9 32.4,102.1 " +
  "C 37.6,92.3 44.6,84.0 52.5,76.4 " +
  "C 60.4,68.8 70.5,62.1 79.9,56.3 " +
  "C 89.4,50.5 99.8,45.6 109.2,41.6 " +
  "C 118.7,37.6 127.5,35.2 136.6,32.5 " +
  "C 145.7,29.8 155.5,27.0 164.0,25.2 " +
  "C 172.5,23.4 179.8,22.4 187.7,21.5 " +
  "C 195.6,20.6 203.9,20.3 211.5,19.7 " +
  "C 219.1,19.1 226.4,18.1 233.4,17.8 " +
  "C 240.4,17.5 245.9,17.5 253.5,17.8 " +
  "C 261.1,18.1 271.2,19.1 279.1,19.7 " +
  "C 287.0,20.3 293.7,20.6 301.0,21.5 " +
  "C 308.3,22.4 315.6,24.0 322.9,25.2 " +
  "C 330.2,26.4 337.0,27.0 344.9,28.8 " +
  "C 352.8,30.6 362.0,33.4 370.5,36.1 " +
  "C 379.0,38.9 387.2,41.6 396.0,45.3 " +
  "C 404.8,49.0 414.9,52.9 423.4,58.1 " +
  "C 431.9,63.3 438.7,69.7 447.2,76.4 " +
  "C 455.7,83.1 466.7,90.2 474.6,98.4 " +
  "C 482.5,106.7 490.4,115.8 494.7,125.9 " +
  "C 499.0,136.0 501.1,147.8 500.2,158.8 " +
  "C 499.3,169.8 493.8,181.4 489.2,191.8 " +
  "C 484.6,202.2 480.4,211.0 472.8,221.1 " +
  "C 465.2,231.2 448.4,247.0 443.5,252.2 " +
  "L 485.6,314.5 " +
  "L 397.9,283.4 " +
  "Z";

const SLIDE2_COMPONENT_CSS = `
  /* ------------------------------------------------------------
     Slide 2: WCAG 2.1/2.2 Level AAA, WAVE & Karen Accessibility Rules
     ------------------------------------------------------------ */

  .s2-component-card {
    position: relative;
    width: 100%;
    max-width: 896px;
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
    padding: 24px 36px 20px 36px;
    box-sizing: border-box;
    font-family: "Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  }

  .s2-component-card button:focus-visible,
  .s2-component-card [tabindex="0"]:focus-visible,
  .s2-component-card input[type="radio"]:focus-visible + span {
    outline: 3px solid #143833 !important;
    outline-offset: 3px !important;
  }

  /* 1. Yellow Banner & Heading */
  .s2-banner-wrap {
    width: 100%;
    max-width: 760px;
    margin: 0 auto 12px auto;
    background-color: #feff9f;
    border: 2px solid #236f7a;
    border-radius: 9999px;
    box-shadow: 0 4px 6px rgba(34, 105, 118, 0.25);
    padding: 10px 24px;
    text-align: center;
    flex-shrink: 0;
  }
  .s2-heading {
    margin: 0;
    font-size: 20px;
    line-height: 1.3;
    font-weight: 700;
    letter-spacing: -0.01em;
    color: #232323;
    outline: none;
  }
  .s2-heading:focus,
  .s2-heading:focus-visible {
    outline: none;
  }

  /* 2. Middle Content Area */
  .s2-stage-middle {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    min-height: 0;
    padding: 0 8px;
    gap: 16px;
  }

  .s2-options-col {
    display: flex;
    align-items: center;
    gap: 24px;
    flex: 1;
    max-width: 480px;
  }

  .s2-bottle-wrap {
    flex-shrink: 0;
    width: 90px;
    height: 170px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .s2-bottle-img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.08));
    user-select: none;
  }

  /* Radio Group */
  .s2-radiogroup {
    display: flex;
    flex-direction: column;
    gap: 10px;
    flex: 1;
  }
  .s2-option-row {
    display: flex;
    align-items: center;
    gap: 12px;
    min-height: 44px;
    cursor: pointer;
    user-select: none;
    padding: 2px 4px;
    border-radius: 8px;
    transition: background-color 0.12s ease;
  }
  .s2-option-row:hover {
    background-color: rgba(189, 223, 216, 0.25);
  }

  .s2-checkbox-box {
    width: 28px;
    height: 28px;
    flex-shrink: 0;
    border-radius: 4px;
    border: 2px solid #236f7a;
    background-color: #e8ece9;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s ease;
  }
  .s2-checkbox-box.checked {
    background-color: #144e57;
    border-color: #143833;
    color: #ffffff;
  }

  .s2-option-text {
    font-size: 18px;
    line-height: 1.3;
    font-weight: 500;
    color: #143833;
    transition: color 0.12s ease, font-weight 0.12s ease;
  }
  .s2-option-text.checked {
    font-weight: 700;
    color: #0a1c1a;
  }

  /* Character & Bubble Area */
  .s2-character-col {
    position: relative;
    width: 320px;
    height: 270px;
    flex-shrink: 0;
  }
  .s2-bubble-wrap {
    position: absolute;
    left: 0;
    top: 0;
    width: 260px;
    height: 175px;
    z-index: 5;
    pointer-events: none;
  }
  .s2-bubble-svg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    overflow: visible;
  }
  .s2-bubble-text-wrap {
    position: absolute;
    top: 45%;
    left: 48%;
    transform: translate(-50%, -50%);
    width: 78%;
    max-width: 200px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    pointer-events: none;
  }
  .s2-bubble-text {
    margin: 0;
    padding: 0;
    font-size: 13px;
    line-height: 1.42;
    font-weight: 600;
    color: #143833;
    text-align: center;
  }

  /* Nurse Anna (Post-Slide 1 Decorative Character) */
  .s2-nurse-wrap {
    position: absolute;
    right: 8px;
    bottom: 0;
    width: 105px;
    height: 200px;
    z-index: 6;
    pointer-events: none;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .s2-nurse-img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    user-select: none;
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.08));
  }

  /* 3. Bottom Controls Bar */
  .s2-bottom-bar {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-shrink: 0;
    padding-top: 8px;
    position: relative;
    z-index: 20;
  }

  .s2-spacer-side {
    width: 110px;
    flex-shrink: 0;
  }

  .s2-nav-center {
    display: flex;
    align-items: center;
    gap: 14px;
    margin: 0 auto;
    flex-shrink: 0;
  }

  .s2-btn-nav {
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
  .s2-btn-nav:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.14);
  }
  .s2-btn-nav:active:not(:disabled) {
    transform: translateY(1px);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }
  .s2-btn-nav:disabled {
    opacity: 0.55;
    cursor: not-allowed;
    box-shadow: none;
  }

  .s2-btn-back {
    background-color: #bddfd8;
    color: #11332e;
    border-color: #78a59b;
  }
  .s2-btn-back:hover:not(:disabled) {
    background-color: #a8d5cc;
  }

  .s2-btn-next {
    background-color: #fdee8e;
    color: #1a2624;
    border-color: #c8b746;
  }
  .s2-btn-next:hover:not(:disabled) {
    background-color: #f5e478;
  }

  .s2-audio-wrap {
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }

  /* -------------------------------------------------------------
     Mobile Layout (.is-mobile or screen width < 768px)
     ------------------------------------------------------------- */
  .s2-component-card.is-mobile {
    aspect-ratio: auto !important;
    max-height: none !important;
    height: 100% !important;
    border-radius: 24px !important;
    padding: 14px 12px 12px 12px !important;
    overflow-y: auto !important;
  }
  .s2-component-card.is-mobile .s2-banner-wrap {
    border-radius: 18px !important;
    padding: 8px 14px !important;
    margin-bottom: 8px !important;
  }
  .s2-component-card.is-mobile .s2-heading {
    font-size: 15px !important;
  }
  .s2-component-card.is-mobile .s2-stage-middle {
    flex-direction: column !important;
    align-items: center !important;
    gap: 12px !important;
  }
  .s2-component-card.is-mobile .s2-options-col {
    max-width: 100% !important;
    width: 100% !important;
    gap: 12px !important;
  }
  .s2-component-card.is-mobile .s2-bottle-wrap {
    width: 60px !important;
    height: 120px !important;
  }
  .s2-component-card.is-mobile .s2-option-row {
    min-height: 44px !important;
    gap: 10px !important;
  }
  .s2-component-card.is-mobile .s2-option-text {
    font-size: 14.5px !important;
  }
  .s2-component-card.is-mobile .s2-character-col {
    width: 100% !important;
    height: auto !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    gap: 12px !important;
    margin-top: 4px !important;
  }
  .s2-component-card.is-mobile .s2-bubble-wrap {
    position: relative !important;
    width: 220px !important;
    height: 145px !important;
  }
  .s2-component-card.is-mobile .s2-bubble-text {
    font-size: 11px !important;
  }
  .s2-component-card.is-mobile .s2-nurse-wrap {
    position: relative !important;
    width: 75px !important;
    height: 145px !important;
    right: auto !important;
    bottom: auto !important;
  }
  .s2-component-card.is-mobile .s2-btn-nav {
    min-height: 44px !important;
    min-width: 72px !important;
    font-size: 14px !important;
    padding: 0 16px !important;
  }
  .s2-component-card.is-mobile .s2-spacer-side {
    width: 60px !important;
  }

  @media (max-width: 767px) {
    .s2-component-card {
      aspect-ratio: auto;
      max-height: none;
      border-radius: 24px;
      padding: 14px 12px 12px 12px;
      overflow-y: auto;
    }
    .s2-banner-wrap {
      border-radius: 18px;
      padding: 8px 14px;
      margin-bottom: 8px;
    }
    .s2-heading {
      font-size: 15px;
    }
    .s2-stage-middle {
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }
    .s2-options-col {
      max-width: 100%;
      width: 100%;
      gap: 12px;
    }
    .s2-bottle-wrap {
      width: 60px;
      height: 120px;
    }
    .s2-option-row {
      min-height: 44px;
      gap: 10px;
    }
    .s2-option-text {
      font-size: 14.5px;
    }
    .s2-character-col {
      width: 100%;
      height: auto;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      margin-top: 4px;
    }
    .s2-bubble-wrap {
      position: relative;
      width: 220px;
      height: 145px;
    }
    .s2-bubble-text {
      font-size: 11px;
    }
    .s2-nurse-wrap {
      position: relative;
      width: 75px;
      height: 145px;
      right: auto;
      bottom: auto;
    }
    .s2-btn-nav {
      min-height: 44px;
      min-width: 72px;
      font-size: 14px;
      padding: 0 16px;
    }
    .s2-spacer-side {
      width: 60px;
    }
  }

  /* Prefers Reduced Motion (WCAG 2.3.3) */
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.001ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.001ms !important;
    }
  }
`;

export function Slide2MedicineNamingScreen({
  isSpanish = false,
  selected,
  onSelect,
  onNext,
  onBack,
  loading = false,
  audioSrc,
  stepId = "slide2_naming",
  locale,
  transcriptText,
  variant = "auto",
}: Slide2MedicineNamingScreenProps) {
  const headingRef = useRef<HTMLHeadingElement | null>(null);

  // Programmatic focus on mount per Karen's review (WCAG 2.4.3 Focus Order)
  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, []);

  const nextEnabled = !!selected && !loading;

  const handleKeyDown = (e: React.KeyboardEvent, currentIndex: number) => {
    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      e.preventDefault();
      const nextIndex = (currentIndex + 1) % MEDICINE_OPTIONS_DISPLAY.length;
      onSelect(MEDICINE_OPTIONS_DISPLAY[nextIndex].value);
    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      e.preventDefault();
      const prevIndex = (currentIndex - 1 + MEDICINE_OPTIONS_DISPLAY.length) % MEDICINE_OPTIONS_DISPLAY.length;
      onSelect(MEDICINE_OPTIONS_DISPLAY[prevIndex].value);
    }
  };

  const effectiveAudioSrc =
    audioSrc ||
    (isSpanish
      ? "/audio/exported/slide2_naming_es.mp3"
      : "/audio/exported/slide2_naming_en.mp3");

  const effectiveTranscript =
    transcriptText ||
    (isSpanish
      ? "¡Primero hablemos de la penicilina. ¡Tiene muchos nombres! ¡Seleccione cómo lo llama! Usaremos el nombre que elija durante nuestro tiempo juntos."
      : "Let's first talk about penicillin. It has lots of names! Select what you call it! We'll use the name you choose during our time together.");

  const variantClass = variant === "mobile" ? " is-mobile" : variant === "desktop" ? " is-desktop" : "";

  return (
    <section
      id="slide-content"
      role="region"
      aria-roledescription="slide"
      aria-labelledby="slide2-heading"
      lang={isSpanish ? "es" : "en"}
      className={`s2-component-card${variantClass}`}
    >
      <style dangerouslySetInnerHTML={{ __html: SLIDE2_COMPONENT_CSS }} />

      {/* 1. Accessible Banner & Title (Level AAA Contrast 13.8:1) */}
      <div className="s2-banner-wrap">
        <h1
          id="slide2-heading"
          ref={headingRef}
          tabIndex={-1}
          className="s2-heading"
        >
          {isSpanish
            ? "¡Primero hablemos de la penicilina. ¡Tiene muchos nombres!"
            : "Let's first talk about penicillin. It has lots of names!"}
        </h1>
      </div>

      {/* 2. Middle Interactive Content Area */}
      <div className="s2-stage-middle">
        {/* Left Column: Pink Bottle + Accessible Radio Options */}
        <div className="s2-options-col">
          {/* Pink Bottle (WCAG 1.1.1 Non-text Content) */}
          <div className="s2-bottle-wrap">
            <img
              src="/images/amoxicillin-bottle.png"
              alt={isSpanish ? "Frasco de medicina rosa" : "Pink medicine bottle"}
              className="s2-bottle-img"
              draggable={false}
            />
          </div>

          {/* Accessible Radio Group (WCAG 1.3.1 & 2.1.1) */}
          <div
            className="s2-radiogroup"
            role="radiogroup"
            aria-label={
              isSpanish
                ? "Seleccione el nombre que usa para el medicamento"
                : "Select what you call the medicine"
            }
          >
            {MEDICINE_OPTIONS_DISPLAY.map((opt, idx) => {
              const isChecked = selected === opt.value;
              const label = isSpanish ? opt.labelEs : opt.labelEn;

              return (
                <label
                  key={opt.value}
                  className="s2-option-row"
                  onKeyDown={(e) => handleKeyDown(e, idx)}
                >
                  <input
                    type="radio"
                    name="medicine_selection"
                    value={opt.value}
                    checked={isChecked}
                    onChange={() => onSelect(opt.value)}
                    className="sr-only"
                  />
                  <span
                    className={`s2-checkbox-box ${isChecked ? "checked" : ""}`}
                    aria-hidden="true"
                  >
                    {isChecked && (
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                        focusable="false"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </span>
                  <span className={`s2-option-text ${isChecked ? "checked" : ""}`}>
                    {label}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Right Column: Speech Bubble + Nurse Anna */}
        <div className="s2-character-col">
          {/* Hand-drawn SVG Speech Bubble */}
          <div
            className="s2-bubble-wrap"
            role="group"
            aria-label={isSpanish ? "Instrucción de selección" : "Selection instruction"}
          >
            <svg
              className="s2-bubble-svg"
              viewBox="0 0 520 340"
              fill="none"
              aria-hidden="true"
              focusable="false"
            >
              <defs>
                <pattern id="s2-bubble-dots" width="18" height="18" patternUnits="userSpaceOnUse">
                  <circle cx="9" cy="9" r="0.8" fill="#cadada" opacity="0.65" />
                </pattern>
              </defs>

              {/* Black shadow underneath */}
              <path
                d={BUBBLE_PATH}
                transform="translate(4, 6)"
                fill="#143833"
                opacity="0.35"
              />

              {/* White bubble body */}
              <path d={BUBBLE_PATH} fill="#ffffff" />

              {/* Subtle paper dot grid texture */}
              <path d={BUBBLE_PATH} fill="url(#s2-bubble-dots)" />

              {/* Soft teal outline */}
              <path
                d={BUBBLE_PATH}
                fill="none"
                stroke="#8ebfbb"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="miter"
              />
            </svg>

            <div className="s2-bubble-text-wrap">
              <p className="s2-bubble-text">
                {isSpanish ? (
                  <>
                    ¡Seleccione cómo lo llama!<br />
                    Usaremos el nombre que elija<br />
                    durante nuestro tiempo juntos.
                  </>
                ) : (
                  <>
                    Select what you call it! We&apos;ll<br />
                    use the name you choose<br />
                    during our time together.
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Nurse Anna (Decorative after Slide 1 per Karen & Eileen's Rule) */}
          <div className="s2-nurse-wrap" aria-hidden="true">
            <img
              src="/images/nurse-anna.png"
              alt=""
              className="s2-nurse-img"
              draggable={false}
            />
          </div>
        </div>
      </div>

      {/* 3. Bottom Controls Bar */}
      <footer
        className="s2-bottom-bar"
        role="toolbar"
        aria-label={isSpanish ? "Controles de navegación y audio" : "Slide navigation and media controls"}
      >
        <div className="s2-spacer-side" aria-hidden="true" />

        {/* Centered Back & Next Navigation with 44px+ touch targets */}
        <nav
          className="s2-nav-center"
          aria-label={isSpanish ? "Navegación de diapositiva" : "Slide pagination"}
        >
          <button
            type="button"
            onClick={onBack}
            disabled={loading}
            className="s2-btn-nav s2-btn-back"
            aria-label={isSpanish ? "Volver a la diapositiva anterior" : "Back to previous slide"}
          >
            {isSpanish ? "Atrás" : "Back"}
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={!nextEnabled}
            aria-disabled={!nextEnabled}
            className="s2-btn-nav s2-btn-next"
            aria-label={isSpanish ? "Continuar a la siguiente diapositiva" : "Next slide"}
          >
            {loading ? "..." : isSpanish ? "Siguiente" : "Next"}
          </button>
        </nav>

        {/* Audio Player */}
        <div className="s2-audio-wrap s2-spacer-side">
          <AudioPlayer
            audioSrc={effectiveAudioSrc}
            stepId={stepId}
            locale={locale || (isSpanish ? "es" : "en")}
            transcriptText={effectiveTranscript}
            size="large"
          />
        </div>
      </footer>
    </section>
  );
}

export default Slide2MedicineNamingScreen;