"use client";

import React, { useRef, useEffect, useState } from "react";
import AudioPlayer from "./AudioPlayer";
import SlideNavigationButtons from "./SlideNavigationButtons";

/* ==========================================================
   Slide2MedicineNamingScreen
   Pixel-perfect match to Image 2 (iPad mockup 896 x 645):
   - Yellow banner centered at top
   - Pink Amoxicillin bottle on left
   - Checkboxes aligned vertically with bottle top & bottom
   - Speech bubble with tail pointing to Nurse Anna's head
   - Nurse Anna standing on right
   - Back and Next buttons centered at y = 544px
   - CC & Play/Pause controls at y = 541px directly below Nurse Anna
   ========================================================== */

const STAGE_W = 750;
const STAGE_H = 530;

const SLIDE2_CSS = `
.s2-root,
.s2-root *,
.s2-root *::before,
.s2-root *::after {
  box-sizing: border-box;
}

.s2-root {
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
  color: #262626;
}

.s2-stage {
  position: relative;
  width: ${STAGE_W}px;
  height: ${STAGE_H}px;
  flex: none;
  transform-origin: center center;
  background-color: #fafdf3;
}

/* ---------- 1. Yellow banner ---------- */
.s2-banner {
  position: absolute;
  left: 20px;
  top: 16px;
  width: 710px;
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 20px;
  background-color: #feff9f;
  border: 1.8px solid #2b7f8f;
  border-radius: 28px;
  box-shadow: 0 4px 6px rgba(34, 105, 118, 0.35);
  text-align: center;
}
.s2-heading {
  margin: 0;
  font-size: 21.5px;
  line-height: 1.25;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: #232323;
  white-space: nowrap;
  outline: none;
}
.s2-heading:focus-visible {
  box-shadow: 0 0 0 2px #236f7a;
}

/* ---------- 2. Bottle (decreased slightly and vertically centered with options) ---------- */
.s2-bottle {
  position: absolute;
  left: 28px;
  top: 180px;
  width: 107px;
  height: 172px;
  object-fit: contain;
  user-select: none;
  -webkit-user-drag: none;
}

/* ---------- 3. Options (centered vertically between banner and navigation) ---------- */
.s2-options {
  position: absolute;
  left: 155px;
  top: 168px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.s2-option {
  display: flex;
  align-items: center;
  gap: 14px;
  height: 28px;
  padding: 0;
  margin: 0;
  background: transparent;
  border: none;
  outline: none;
  cursor: pointer;
  text-align: left;
  font-family: inherit;
}
.s2-option:focus-visible .s2-checkbox {
  box-shadow: 0 0 0 3px #236f7a;
}
.s2-checkbox {
  width: 28px;
  height: 28px;
  flex-shrink: 0;
  background-color: #d9d9d9;
  border: 2px solid #55939e;
  border-radius: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.15s ease, border-color 0.15s ease;
}
.s2-option:hover .s2-checkbox:not(.s2-checkbox--checked) {
  border-color: #3b7c89;
  background-color: #e2e2e2;
}
.s2-checkbox--checked {
  background-color: #2b7f8f;
  border-color: #1f6672;
}
.s2-check-icon {
  width: 18px;
  height: 18px;
  color: #ffffff;
}
.s2-option-label {
  font-size: 21.5px;
  line-height: 1.25;
  font-weight: 400;
  color: #242c30;
  white-space: nowrap;
  user-select: none;
}
.s2-option-label--checked {
  font-weight: 600;
  color: #141414;
}

/* ---------- 4. Speech bubble & Nurse Anna wrapper ---------- */
.s2-character-wrap {
  display: contents;
}

.s2-bubble {
  position: absolute;
  left: 385px;
  top: 105px;
  width: 270px;
  height: 178px;
  pointer-events: none;
  z-index: 1;
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
  max-width: 215px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 0;
  margin: 0;
  box-sizing: border-box;
  pointer-events: none;
}
.s2-bubble-text {
  margin: 0;
  padding: 0;
  width: 100%;
  font-family: "Plus Jakarta Sans", "Inter", system-ui, -apple-system, sans-serif;
  font-size: 13.5px;
  line-height: 1.45;
  font-weight: 500;
  color: #1a2e2b;
  text-align: center;
}

/* ---------- 5. Nurse Anna ---------- */
.s2-nurse {
  position: absolute;
  left: 600px;
  top: 236px;
  width: 112px;
  height: 206px;
  pointer-events: none;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
}
.s2-nurse-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
  user-select: none;
  -webkit-user-drag: none;
}

/* ---------- 6. Centered Navigation Buttons (Back & Next) ---------- */
.s2-nav-back {
  position: absolute;
  left: 285px;
  top: 462px;
  z-index: 10;
}
.s2-nav-next {
  position: absolute;
  left: 415px;
  top: 462px;
  z-index: 10;
}
.s2-btn {
  height: 35px;
  padding: 0 18px;
  border-radius: 9999px;
  font-family: inherit;
  font-size: 15px;
  font-weight: 500;
  outline: none;
  cursor: pointer;
  border: 1.5px solid transparent;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}
.s2-btn:active:not(:disabled) {
  transform: scale(0.96);
}
.s2-btn:focus-visible {
  box-shadow: 0 0 0 3px #236f7a;
}
.s2-btn--back {
  min-width: 64px;
  background-color: #bddfd8;
  border-color: #8ab8b0;
  color: #143833;
}
.s2-btn--back:hover:not(:disabled) {
  background-color: #a8d5cc;
}
.s2-btn--next {
  min-width: 62px;
  background-color: #fdee8e;
  border-color: #d4c65e;
  color: #232323;
  opacity: 0.6;
  cursor: not-allowed;
}
.s2-btn--next-enabled {
  opacity: 1;
  cursor: pointer;
}
.s2-btn--next-enabled:hover {
  background-color: #f5e478;
}

/* ---------- 7. CC & Play/Pause Controls (Desktop provided by PenpalIntervention tablet frame, mobile inline below Nurse Anna) ---------- */
.s2-audio {
  display: none !important;
}

/* ==========================================================
   Mobile-First Responsive Layout (< 768px)
   ========================================================== */
@media (max-width: 767px) {
  .s2-root {
    overflow-y: auto !important;
    overflow-x: hidden !important;
    -webkit-overflow-scrolling: touch !important;
    height: auto !important;
    min-height: auto !important;
    flex: none !important;
    display: flex !important;
    flex-direction: column !important;
    justify-content: flex-start !important;
    align-items: center !important;
    padding: 0.85rem 0.85rem 1rem 0.85rem !important;
    gap: 0 !important;
  }
  .s2-stage {
    position: relative !important;
    width: 100% !important;
    max-width: 360px !important;
    height: auto !important;
    min-height: auto !important;
    transform: none !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    justify-content: flex-start !important;
    background-color: transparent !important;
    padding: 0 !important;
    margin: 0 auto !important;
  }
  .s2-banner {
    position: static !important;
    left: auto !important;
    top: auto !important;
    width: 100% !important;
    max-width: 100% !important;
    height: auto !important;
    min-height: 46px !important;
    padding: 8px 12px !important;
    border-radius: 16px !important;
    margin: 0 0 8px 0 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
  }
  .s2-heading {
    white-space: normal !important;
    font-size: 14.5px !important;
    line-height: 1.3 !important;
    text-align: center !important;
  }
  .s2-bottle {
    display: none !important;
  }
  .s2-options {
    position: static !important;
    left: auto !important;
    top: auto !important;
    width: 100% !important;
    max-width: 100% !important;
    display: flex !important;
    flex-direction: column !important;
    gap: 7px !important;
    margin: 4px 0 10px 0 !important;
  }
  .s2-option {
    display: flex !important;
    align-items: center !important;
    gap: 10px !important;
    min-height: 38px !important;
    height: auto !important;
    padding: 6px 12px !important;
    border-radius: 12px !important;
    background: #ffffff !important;
    border: 1.5px solid #c2ded7 !important;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04) !important;
  }
  .s2-option:active {
    background-color: #e5f4ef !important;
  }
  .s2-option-label {
    font-size: 14px !important;
    font-weight: 600 !important;
    color: #1a2e2b !important;
  }
  .s2-checkbox {
    width: 22px !important;
    height: 22px !important;
    min-width: 22px !important;
  }
  .s2-character-wrap {
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    width: 100% !important;
    max-width: 330px !important;
    margin: 4px auto 0 auto !important;
    gap: 8px !important;
    position: relative !important;
  }
  .s2-bubble {
    display: block !important;
    position: relative !important;
    left: auto !important;
    top: auto !important;
    width: 200px !important;
    height: 130px !important;
    flex-shrink: 0 !important;
    margin: 0 !important;
    z-index: 1 !important;
    pointer-events: none !important;
  }
  .s2-bubble-svg {
    position: absolute !important;
    inset: 0 !important;
    width: 100% !important;
    height: 100% !important;
  }
  .s2-bubble-text-wrap {
    position: absolute !important;
    top: 44% !important;
    left: 47% !important;
    transform: translate(-50%, -50%) !important;
    width: 78% !important;
    max-width: 155px !important;
    padding: 0 !important;
    margin: 0 !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    justify-content: center !important;
    text-align: center !important;
  }
  .s2-bubble-text {
    font-size: 10.5px !important;
    line-height: 1.35 !important;
    font-weight: 600 !important;
    color: #1a2e2b !important;
    text-align: center !important;
  }
  .s2-nurse {
    position: relative !important;
    left: auto !important;
    top: auto !important;
    width: 65px !important;
    height: 115px !important;
    flex-shrink: 0 !important;
    margin: 0 !important;
    z-index: 2 !important;
    pointer-events: none !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
  }
  .s2-nurse-img {
    width: 100% !important;
    height: 100% !important;
    object-fit: contain !important;
  }
  .s2-audio {
    position: relative !important;
    left: auto !important;
    bottom: auto !important;
    top: auto !important;
    margin: 8px auto 0 auto !important;
    z-index: 25 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    gap: 5px !important;
  }
  .s2-audio .audio-cc-btn svg {
    width: 32px !important;
    height: 28px !important;
  }
  .s2-audio .audio-play-btn svg {
    width: 42px !important;
    height: 28px !important;
  }
}
`;

export interface Slide2MedicineNamingScreenProps {
  isSpanish: boolean;
  selected?: string;
  onSelect: (value: string) => void;
  onNext: () => void;
  onBack: () => void;
  loading?: boolean;
  audioSrc?: string;
  stepId?: string;
  locale?: string;
  transcriptText?: string;
}

export const MEDICINE_OPTIONS_DISPLAY = [
  { value: "Penicillin", labelEn: "Penicillin", labelEs: "Penicilina" },
  { value: "Pink medicine", labelEn: "“Pink medicine”", labelEs: "“Medicina rosa”" },
  { value: "Amoxicillin", labelEn: "Amoxicillin", labelEs: "Amoxicilina" },
  { value: "Amoxicillin Clavulanate", labelEn: "Amoxicillin Clavulanate", labelEs: "Amoxicilina Clavulanato" },
  { value: "Augmentin", labelEn: "Augmentin", labelEs: "Augmentin" },
];

/* Hand-drawn style bubble body + sharp tail matching Image 2 exactly */
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

export function Slide2MedicineNamingScreen({
  isSpanish,
  selected,
  onSelect,
  onNext,
  onBack,
  loading = false,
  audioSrc = isSpanish ? "/audio/exported/slide2_naming_es.mp3" : "/audio/exported/slide2_naming_en.mp3",
  stepId = "slide2_naming",
  locale,
  transcriptText,
}: Slide2MedicineNamingScreenProps) {
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => headingRef.current?.focus(), 50);
    return () => clearTimeout(timer);
  }, []);

  // Responsive stage scaling that fits container with zero distortion across all viewports
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const update = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (w && h) {
        if (typeof window !== "undefined" && window.innerWidth < 768) {
          setScale(1);
        } else {
          const safeW = Math.max(0, w - 24);
          const safeH = Math.max(0, h - 36);
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
  }, []);

  const nextEnabled = !!selected && !loading;

  return (
    <div id="slide-content" className="s2-root" ref={rootRef}>
      <style>{SLIDE2_CSS}</style>

      <div className="s2-stage" style={{ transform: `scale(${scale})` }}>
        {/* 1. Banner */}
        <div className="s2-banner">
          <h1 ref={headingRef} tabIndex={-1} className="s2-heading">
            {isSpanish
              ? "¡Primero hablemos de la penicilina. ¡Tiene muchos nombres!"
              : "Let's first talk about penicillin. It has lots of names!"}
          </h1>
        </div>

        {/* 2. Bottle */}
        <img
          src="/images/amoxicillin-bottle.png"
          alt={isSpanish ? "Frasco de amoxicilina rosa" : "Pink amoxicillin suspension bottle"}
          className="s2-bottle"
          draggable={false}
        />

        {/* 3. Options */}
        <div
          className="s2-options"
          role="radiogroup"
          aria-label={isSpanish ? "Seleccione el nombre que usa para el medicamento" : "Select what you call the medicine"}
        >
          {MEDICINE_OPTIONS_DISPLAY.map((opt) => {
            const isChecked = selected === opt.value;
            const label = isSpanish ? opt.labelEs : opt.labelEn;
            return (
              <button
                key={opt.value}
                type="button"
                role="radio"
                aria-checked={isChecked}
                onClick={() => onSelect(opt.value)}
                className="s2-option"
              >
                <div className={`s2-checkbox${isChecked ? " s2-checkbox--checked" : ""}`} aria-hidden="true">
                  {isChecked && (
                    <svg className="s2-check-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className={`s2-option-label${isChecked ? " s2-option-label--checked" : ""}`}>{label}</span>
              </button>
            );
          })}
        </div>

        {/* 4 & 5. Nurse Anna with Speech Bubble */}
        <div className="s2-character-wrap">
          {/* 4. Speech bubble matching Image 1 exact shape and black shadow */}
          <div className="s2-bubble">
            <svg
              className="s2-bubble-svg"
              viewBox="0 0 520 340"
              fill="none"
              aria-hidden="true"
            >
              <defs>
                <pattern id="s2-bubble-dots" width="18" height="18" patternUnits="userSpaceOnUse">
                  <circle cx="9" cy="9" r="0.8" fill="#cadada" opacity="0.65" />
                </pattern>
              </defs>

              {/* Black shadow underneath */}
              <path
                d={BUBBLE_PATH}
                transform="translate(4, 5)"
                fill="#000000"
                stroke="#000000"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
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
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            <div className="s2-bubble-text-wrap">
              <p className="s2-bubble-text">
                {isSpanish ? (
                  <span>
                    ¡Seleccione cómo lo llama!
                    <br />
                    Usaremos el nombre que elija
                    <br />
                    durante nuestro tiempo juntos.
                  </span>
                ) : (
                  <span>
                    Select what you call it! We&apos;ll
                    <br />
                    use the name you choose
                    <br />
                    during our time together.
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* 5. Nurse Anna */}
          <div className="s2-nurse">
            <img
              src="/images/nurse-anna.png"
              alt={isSpanish ? "Ilustración de la enfermera Anna" : "Nurse Anna"}
              className="s2-nurse-img"
              draggable={false}
              aria-hidden="true"
            />
          </div>
        </div>

        {/* 7. Caption (CC) & Play/Pause controls directly below Nurse Anna */}
        <div className="s2-audio">
          <AudioPlayer
            audioSrc={audioSrc}
            stepId={stepId}
            locale={locale || (isSpanish ? "es" : "en")}
            transcriptText={
              transcriptText ||
              (isSpanish
                ? "Primero hablemos de la penicilina. Tiene muchos nombres. Seleccione cómo lo llama. Usaremos el nombre que elija durante nuestro tiempo juntos. Penicilina, Amoxicilina, Medicina rosa, Amoxicilina-clavulanato, Augmentin. Botón atrás, Botón siguiente."
                : "Let's first talk about penicillin. It has lots of names. Select what you call it. We'll use the name you choose during our time together. Penicillin. Amoxicillin. Pink medicine. Amoxicillin-clavulanate. Augmentin. Back button. Next button.")
            }
            size="large"
          />
        </div>
      </div>

      {/* 6. Centered Navigation Buttons (Back & Next) */}
      <SlideNavigationButtons
        onBack={onBack}
        onNext={onNext}
        isSpanish={isSpanish}
        loading={loading}
        nextDisabled={!selected || loading}
      />
    </div>
  );
}

export default Slide2MedicineNamingScreen;