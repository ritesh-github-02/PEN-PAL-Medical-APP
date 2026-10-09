"use client";

import React, { useRef, useEffect } from "react";
import { NurseAnna } from "./NurseAnna";

const SLIDE2_CSS = `
/* ==========================================================
   Slide2MedicineNamingScreen – Scoped Pixel-Perfect Styles
   ========================================================== */

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
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #f4f8ec;
  padding: 1.5rem 2rem 1.25rem 2rem;
  overflow: hidden;
  gap: clamp(1.75rem, 4.5vh, 2.85rem);
}

/* 1. Top Banner Pill */
.s2-banner-wrap {
  display: flex;
  justify-content: center;
  flex-shrink: 0;
  width: 100%;
  padding: 0;
  margin: 0;
}
.s2-banner {
  display: inline-block;
  background-color: #fef794;
  color: #132623;
  border: 2.5px solid #296a63;
  padding: 0.55rem 2.85rem;
  border-radius: 28px;
  box-shadow: 0 5px 14px -2px rgba(20, 60, 55, 0.22);
  text-align: center;
  max-width: 44rem;
}
.s2-heading {
  font-size: 1.25rem;
  line-height: 1.35;
  font-weight: 700;
  letter-spacing: -0.015em;
  margin: 0;
  outline: none;
}
.s2-heading:focus-visible {
  box-shadow: 0 0 0 2px #236f7a;
}

/* 2. Middle Row */
.s2-middle {
  flex-shrink: 0;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: clamp(2rem, 4vw, 3.5rem);
  padding: 0 0.5rem;
  margin: 0;
}

/* Bottle */
.s2-bottle-wrap {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.s2-bottle {
  width: 6.25rem;
  height: auto;
  max-height: 225px;
  object-fit: contain;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.12));
  user-select: none;
  image-rendering: -webkit-optimize-contrast;
}

/* Checkbox Options */
.s2-options {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 1.05rem;
}
.s2-option {
  display: flex;
  align-items: center;
  gap: 1.05rem;
  padding: 0.15rem 0;
  text-align: left;
  cursor: pointer;
  background: transparent;
  border: none;
  outline: none;
  border-radius: 6px;
  transition: all 0.15s ease;
}
.s2-option:focus-visible {
  box-shadow: 0 0 0 2px #236f7a;
}

.s2-checkbox {
  width: 1.75rem;
  height: 1.75rem;
  flex-shrink: 0;
  border-radius: 3px;
  border: 2px solid #386e68;
  background-color: #cbd8d4;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}
.s2-option:hover .s2-checkbox:not(.s2-checkbox--checked) {
  border-color: #20524d;
}
.s2-checkbox--checked {
  background-color: #226a63;
  border-color: #174f49;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
.s2-check-icon {
  width: 1.2rem;
  height: 1.2rem;
  color: #ffffff;
}

.s2-option-label {
  font-size: 1.28rem;
  line-height: 1.2;
  font-weight: 400;
  color: #152925;
  user-select: none;
  transition: color 0.15s ease;
}
.s2-option:hover .s2-option-label {
  color: #0f221e;
}
.s2-option-label--checked {
  font-weight: 600;
  color: #0d1e1a;
}

/* Right Section: Speech Bubble + Nurse Anna Combo */
.s2-combo {
  position: relative;
  width: 365px;
  height: 260px;
  flex-shrink: 0;
}

.s2-bubble {
  position: absolute;
  top: 5px;
  left: 0;
  width: 270px;
  z-index: 2;
  filter: drop-shadow(2px 3px 5px rgba(20, 60, 55, 0.18));
}
.s2-bubble-svg {
  width: 100%;
  height: auto;
  display: block;
}
.s2-bubble-text-wrap {
  position: absolute;
  top: 5%;
  left: 5%;
  width: 82%;
  height: 84%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  pointer-events: none;
  padding: 0 10px;
}
.s2-bubble-text {
  font-size: 14.2px;
  font-weight: 500;
  line-height: 1.4;
  color: #152925;
  margin: 0;
}

.s2-nurse {
  position: absolute;
  bottom: 0;
  right: 6px;
  width: 110px;
  height: auto;
  max-height: 245px;
  z-index: 1;
}
.s2-nurse-img {
  width: 100%;
  height: auto;
  max-height: 245px;
  object-fit: contain;
  display: block;
}

/* 3. Navigation Bar */
.s2-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  padding: 0;
  flex-shrink: 0;
  margin: 0;
}
.s2-btn {
  padding: 0.45rem 2rem;
  border-radius: 9999px;
  font-size: 0.95rem;
  font-weight: 500;
  color: #143833;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  outline: none;
  cursor: pointer;
  border: none;
  transition: all 0.15s ease;
}
.s2-btn:active {
  transform: scale(0.96);
}
.s2-btn:focus-visible {
  box-shadow: 0 0 0 4px #236f7a;
}

.s2-btn--back {
  background-color: #adc9c4;
  border: 1px solid #96bcb5;
}
.s2-btn--back:hover {
  background-color: #9cbdb8;
}

.s2-btn--next {
  background-color: rgba(250, 232, 138, 0.75);
  color: rgba(20, 56, 51, 0.7);
  border: 1px solid rgba(216, 200, 92, 0.7);
  cursor: not-allowed;
}
.s2-btn--next-enabled {
  background-color: #fae88a;
  color: #143833;
  border: 1px solid #d8c85c;
  cursor: pointer;
}
.s2-btn--next-enabled:hover {
  background-color: #f6df6e;
}

/* Tablet & Smaller Screens Scaling */
@media (max-height: 600px), (max-width: 768px) {
  .s2-middle {
    gap: 1.5rem;
  }
  .s2-bottle {
    width: 4.5rem;
    max-height: 165px;
  }
  .s2-options {
    gap: 0.65rem;
  }
  .s2-checkbox {
    width: 1.35rem;
    height: 1.35rem;
  }
  .s2-check-icon {
    width: 0.95rem;
    height: 0.95rem;
  }
  .s2-option-label {
    font-size: 1.05rem;
  }
  .s2-combo {
    width: 300px;
    height: 220px;
  }
  .s2-bubble {
    width: 220px;
  }
  .s2-bubble-text {
    font-size: 11.5px;
    line-height: 1.32;
  }
  .s2-nurse {
    width: 90px;
    max-height: 200px;
    right: 4px;
  }
  .s2-nurse-img {
    max-height: 200px;
  }
  .s2-banner {
    padding: 0.4rem 2rem;
  }
  .s2-heading {
    font-size: 0.95rem;
  }
  .s2-btn {
    padding: 0.35rem 1.6rem;
    font-size: 0.85rem;
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
}

export const MEDICINE_OPTIONS_DISPLAY = [
  { value: "Penicillin", labelEn: "Penicillin", labelEs: "Penicilina" },
  { value: "Pink medicine", labelEn: "“Pink medicine”", labelEs: "“Medicina rosa”" },
  { value: "Amoxicillin", labelEn: "Amoxicillin", labelEs: "Amoxicilina" },
  { value: "Amoxicillin Clavulanate", labelEn: "Amoxicillin Clavulanate", labelEs: "Amoxicilina Clavulanato" },
  { value: "Augmentin", labelEn: "Augmentin", labelEs: "Augmentin" },
];

export function Slide2MedicineNamingScreen({
  isSpanish,
  selected,
  onSelect,
  onNext,
  onBack,
  loading = false,
}: Slide2MedicineNamingScreenProps) {
  const headingRef = useRef<HTMLHeadingElement | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      headingRef.current?.focus();
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  const nextEnabled = !!selected && !loading;

  return (
    <div id="slide-content" className="s2-root">
      <style>{SLIDE2_CSS}</style>

      {/* 1. Top Yellow Banner Pill */}
      <div className="s2-banner-wrap">
        <div className="s2-banner">
          <h1 ref={headingRef} tabIndex={-1} className="s2-heading">
            {isSpanish
              ? "¡Primero hablemos de la penicilina. ¡Tiene muchos nombres!"
              : "Let's first talk about penicillin. It has lots of names!"}
          </h1>
        </div>
      </div>

      {/* 2. Middle Content Row (Bottle + Checkboxes + Speech Bubble & Nurse Anna) */}
      <div className="s2-middle">
        {/* Pink Amoxicillin Bottle */}
        <div className="s2-bottle-wrap">
          <img
            src="/images/amoxicillin-bottle.png"
            alt={isSpanish ? "Frasco de amoxicilina rosa" : "Pink amoxicillin suspension bottle"}
            className="s2-bottle"
          />
        </div>

        {/* Checkbox Options List */}
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
                <div
                  className={`s2-checkbox${isChecked ? " s2-checkbox--checked" : ""}`}
                  aria-hidden="true"
                >
                  {isChecked && (
                    <svg
                      className="s2-check-icon"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth="3.5"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className={`s2-option-label${isChecked ? " s2-option-label--checked" : ""}`}>
                  {label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right Section: Speech Bubble + Nurse Anna Combo */}
        <div className="s2-combo">
          {/* Custom Vector Speech Bubble with natural round shape and downward pointer tail */}
          <div className="s2-bubble">
            <svg viewBox="0 0 430 260" fill="none" className="s2-bubble-svg">
              <path
                d="M 213, 8
                   C 317, 8  404, 56  404, 120
                   C 404, 146  388, 172  360, 189
                   C 375, 204  392, 222  409, 239
                   C 390, 241  356, 233  325, 214
                   C 292, 228  254, 236  213, 236
                   C 109, 236  28, 184  28, 120
                   C 28, 56  109, 8  213, 8
                   Z"
                fill="#ffffff"
                stroke="#27707e"
                strokeWidth="2.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {/* Centered Speech Text inside oval body */}
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

          {/* Nurse Anna Illustration standing on bottom-right, head directly under bubble tail */}
          <div className="s2-nurse">
            <NurseAnna
              size="md"
              imgClassName="s2-nurse-img"
              isDecorative={true}
              locale={isSpanish ? "es" : "en"}
            />
          </div>
        </div>
      </div>

      {/* 3. Bottom Centered Navigation Buttons (Back & Next) */}
      <div className="s2-nav">
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="s2-btn s2-btn--back"
        >
          {isSpanish ? "Atrás" : "Back"}
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!selected || loading}
          className={`s2-btn s2-btn--next${nextEnabled ? " s2-btn--next-enabled" : ""}`}
        >
          {loading ? "..." : isSpanish ? "Siguiente" : "Next"}
        </button>
      </div>
    </div>
  );
}

export default Slide2MedicineNamingScreen;