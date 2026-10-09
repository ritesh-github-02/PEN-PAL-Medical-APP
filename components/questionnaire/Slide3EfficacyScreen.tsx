"use client";

import React, { useRef, useEffect } from "react";
import { NurseAnna } from "./NurseAnna";
import { resolveMedicineToken } from "@/lib/token-engine";

const SLIDE3_CSS = `
/* ==========================================================
   Slide3EfficacyScreen – Scoped Pixel-Perfect Styles
   ========================================================== */

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
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #f4f8ec;
  padding: 1.25rem 2.5rem 1rem 2.5rem;
  overflow: hidden;
  gap: clamp(1.5rem, 4vh, 2.75rem);
}

/* 1. Top Section: Bold Statement */
.s3-top-section {
  width: 100%;
  max-width: 44rem;
  padding: 0;
  margin: 0;
  flex-shrink: 0;
}
.s3-heading {
  font-size: 1.55rem;
  line-height: 1.42;
  font-weight: 700;
  color: #142724;
  letter-spacing: -0.015em;
  margin: 0;
  outline: none;
}
.s3-heading:focus-visible {
  box-shadow: 0 0 0 2px #236f7a;
}

/* 2. Below Statement: Speech Bubble + Nurse Anna Combo (aligned to the right) */
.s3-bottom-content-row {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  width: 100%;
  max-width: 44rem;
  flex-shrink: 0;
  margin: 0;
  padding: 0;
}

.s3-combo {
  position: relative;
  width: 420px;
  height: 275px;
  flex-shrink: 0;
  margin-right: 1.5rem;
}

.s3-bubble {
  position: absolute;
  top: 0;
  left: 0;
  width: 315px;
  z-index: 2;
  filter: drop-shadow(2px 3px 5px rgba(20, 60, 55, 0.18));
}
.s3-bubble-svg {
  width: 100%;
  height: auto;
  display: block;
}
.s3-bubble-text-wrap {
  position: absolute;
  top: 5%;
  left: 4%;
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
.s3-bubble-text {
  font-size: 14.2px;
  font-weight: 500;
  line-height: 1.38;
  color: #152925;
  margin: 0;
  display: flex;
  flex-direction: column;
}

.s3-nurse {
  position: absolute;
  bottom: 0;
  right: 8px;
  width: 112px;
  height: auto;
  max-height: 245px;
  z-index: 1;
}
.s3-nurse-img {
  width: 100%;
  height: auto;
  max-height: 230px;
  object-fit: contain;
  display: block;
}

/* 3. Bottom Centered Navigation Bar */
.s3-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  margin: 0;
  padding: 0;
  flex-shrink: 0;
}
.s3-btn {
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
.s3-btn:active {
  transform: scale(0.96);
}
.s3-btn:focus-visible {
  box-shadow: 0 0 0 4px #236f7a;
}

.s3-btn--back {
  background-color: #adc9c4;
  border: 1px solid #96bcb5;
}
.s3-btn--back:hover {
  background-color: #9cbdb8;
}

.s3-btn--next {
  background-color: #fae88a;
  color: #143833;
  border: 1px solid #d8c85c;
}
.s3-btn--next:hover {
  background-color: #f6df6e;
}

/* Tablet & Smaller Screens Scaling */
@media (max-height: 600px), (max-width: 768px) {
  .s3-root {
    padding: 1rem 1.5rem 0.5rem 1.5rem;
  }
  .s3-top-section {
    max-width: 32rem;
    padding: 0;
    margin: 0;
  }
  .s3-heading {
    font-size: 1.25rem;
    line-height: 1.32;
  }
  .s3-combo {
    width: 340px;
    height: 235px;
    margin-right: 0.5rem;
  }
  .s3-bubble {
    width: 250px;
  }
  .s3-bubble-text {
    font-size: 11.5px;
    line-height: 1.32;
  }
  .s3-nurse {
    width: 92px;
    max-height: 205px;
    right: 4px;
  }
  .s3-nurse-img {
    max-height: 205px;
  }
  .s3-btn {
    padding: 0.35rem 1.6rem;
    font-size: 0.85rem;
  }
}
`;

export interface Slide3EfficacyScreenProps {
  isSpanish: boolean;
  medicationName?: string;
  onNext: () => void;
  onBack: () => void;
  loading?: boolean;
}

export function Slide3EfficacyScreen({
  isSpanish,
  medicationName,
  onNext,
  onBack,
  loading = false,
}: Slide3EfficacyScreenProps) {
  const headingRef = useRef<HTMLHeadingElement | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      headingRef.current?.focus();
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  const rawTitle = isSpanish
    ? "Muchos niños han tomado [name] porque es el mejor para tratar infecciones comunes de oído, senos paranasales y garganta. También es uno de los mejores antibióticos para adultos."
    : "Many kids have had [name] because it's the best for treating common ear, sinus and throat infections. It is also one of the best antibiotics in adults, too.";

  const titleText = resolveMedicineToken(rawTitle, medicationName, isSpanish);
  const resolvedName = medicationName && medicationName.trim()
    ? medicationName
    : (isSpanish ? "La penicilina" : "[Name]");

  return (
    <div id="slide-content" className="s3-root">
      <style>{SLIDE3_CSS}</style>

      {/* 1. Top Section: Bold Statement Heading */}
      <div className="s3-top-section">
        <h1 ref={headingRef} tabIndex={-1} className="s3-heading">
          {titleText}
        </h1>
      </div>

      {/* 2. Below That: Speech Bubble + Nurse Anna Combo (aligned to the right) */}
      <div className="s3-bottom-content-row">
        <div className="s3-combo">
          {/* Custom Vector Speech Bubble with natural round shape and downward pointer tail */}
          <div className="s3-bubble">
            <svg viewBox="0 0 430 260" fill="none" className="s3-bubble-svg">
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
            <div className="s3-bubble-text-wrap">
              <p className="s3-bubble-text">
                {isSpanish ? (
                  <>
                    <span>{resolvedName} es un medicamento maravilloso,</span>
                    <span>pero como todos los antibióticos</span>
                    <span>no funciona bien para los resfriados</span>
                    <span>comunes o la gripe.</span>
                  </>
                ) : (
                  <>
                    <span>{resolvedName} is a wonder drug, but</span>
                    <span>like all antibiotics it doesn&apos;t</span>
                    <span>work well for common colds</span>
                    <span>or the flu.</span>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Nurse Anna Illustration standing on bottom-right, head directly under bubble tail */}
          <div className="s3-nurse">
            <NurseAnna
              size="md"
              imgClassName="s3-nurse-img"
              isDecorative={true}
              locale={isSpanish ? "es" : "en"}
            />
          </div>
        </div>
      </div>

      {/* 3. Bottom Centered Navigation Buttons (Back & Next) */}
      <div className="s3-nav">
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="s3-btn s3-btn--back"
        >
          {isSpanish ? "Atrás" : "Back"}
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={loading}
          className="s3-btn s3-btn--next"
        >
          {loading ? "..." : isSpanish ? "Siguiente" : "Next"}
        </button>
      </div>
    </div>
  );
}

export default Slide3EfficacyScreen;
