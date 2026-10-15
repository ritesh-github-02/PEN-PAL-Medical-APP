"use client";

import React, { useRef, useEffect } from "react";
import { NurseAnna } from "./NurseAnna";

const SLIDE8_CSS = `
/* ==========================================================
   Slide8MilestoneScreen – Scoped Pixel-Perfect Styles
   ========================================================== */

.s8-root,
.s8-root *,
.s8-root *::before,
.s8-root *::after {
  box-sizing: border-box;
}

.s8-root {
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
  padding: 0.35rem 0.75rem 0.35rem 0.75rem;
  overflow: hidden;
  gap: clamp(0.6rem, 2vh, 1.25rem);
}

/* Middle Content: Large Speech Bubble + Nurse Anna Combo */
.s8-middle {
  flex-shrink: 0;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  padding: 0;
}

.s8-combo {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  position: relative;
  width: 550px;
  height: 270px;
  max-width: 95%;
}

.s8-bubble {
  position: relative;
  width: 385px;
  height: 258px;
  flex-shrink: 0;
  align-self: flex-start;
  margin-top: 5px;
  z-index: 2;
  pointer-events: none;
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
  top: 10%;
  left: 6%;
  width: 78%;
  height: 75%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  pointer-events: none;
  padding: 0 16px;
}
.s8-bubble-text {
  font-size: 15.5px;
  font-weight: 500;
  line-height: 1.42;
  color: #1a2e2b;
  margin: 0;
  display: flex;
  flex-direction: column;
  outline: none;
  text-align: center;
}
.s8-bubble-text:focus-visible {
  box-shadow: 0 0 0 2px #236f7a;
}

.s8-nurse {
  position: relative;
  width: 110px;
  height: auto;
  max-height: 225px;
  object-fit: contain;
  align-self: flex-end;
  margin-left: -40px;
  z-index: 3;
  margin-bottom: 5px;
  flex-shrink: 0;
}
.s8-nurse-img {
  width: 100%;
  height: auto;
  max-height: 250px;
  object-fit: contain;
  display: block;
}

/* Bottom Centered Navigation */
.s8-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  margin: 0;
  padding: 0;
  flex-shrink: 0;
}
.s8-btn {
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
.s8-btn:active {
  transform: scale(0.96);
}
.s8-btn:focus-visible {
  box-shadow: 0 0 0 4px #236f7a;
}

.s8-btn--back {
  background-color: #adc9c4;
  border: 1px solid #96bcb5;
}
.s8-btn--back:hover {
  background-color: #9cbdb8;
}

.s8-btn--next {
  background-color: #fae88a;
  color: #143833;
  border: 1px solid #d8c85c;
}
.s8-btn--next:hover {
  background-color: #f6df6e;
}

/* Tablet & Smaller Screens Scaling */
@media (max-height: 600px), (max-width: 768px) {
  .s8-root {
    padding: 0.85rem 1rem 1rem 1rem;
    overflow-y: auto;
    height: 100%;
  }
  .s8-combo {
    display: flex !important;
    flex-direction: row !important;
    align-items: center !important;
    justify-content: center !important;
    width: 100% !important;
    max-width: 320px !important;
    height: auto !important;
    margin: 0.15rem auto !important;
    position: relative !important;
    flex-shrink: 0 !important;
  }
  .s8-bubble {
    position: relative !important;
    top: auto !important;
    left: auto !important;
    flex: 1 1 205px !important;
    max-width: 235px !important;
    min-width: 160px !important;
    height: 158px !important;
    width: auto !important;
    margin-top: 0 !important;
    z-index: 1 !important;
  }
  .s8-bubble-text-wrap {
    top: 10% !important;
    left: 6% !important;
    width: 78% !important;
    height: 75% !important;
    padding: 2px 8px !important;
    box-sizing: border-box !important;
  }
  .s8-bubble-text {
    font-size: 10.5px !important;
    line-height: 1.3 !important;
    display: block !important;
  }
  .s8-bubble-text span {
    display: inline !important;
  }
  .s8-nurse {
    position: relative !important;
    bottom: auto !important;
    right: auto !important;
    flex: 0 0 72px !important;
    width: 72px !important;
    margin-left: -6px !important;
    margin-top: 0 !important;
    z-index: 2 !important;
  }
  .s8-nurse-img {
    max-height: 145px !important;
    width: 100% !important;
    object-fit: contain !important;
  }
  .s8-nav {
    margin-top: 0.35rem;
    gap: 1.25rem;
    z-index: 10;
  }
  .s8-btn {
    padding: 0.32rem 1.4rem;
    font-size: 0.82rem;
    min-height: 38px;
  }
}
`;

export interface Slide8MilestoneScreenProps {
  isSpanish: boolean;
  onNext: () => void;
  onBack: () => void;
  loading?: boolean;
}

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

export function Slide8MilestoneScreen({
  isSpanish,
  onNext,
  onBack,
  loading = false,
}: Slide8MilestoneScreenProps) {
  const headingRef = useRef<HTMLHeadingElement | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      headingRef.current?.focus();
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div id="slide-content" className="s8-root">
      <style>{SLIDE8_CSS}</style>

      {/* Middle Content: Large Speech Bubble + Nurse Anna Combo */}
      <div className="s8-middle">
        <div className="s8-combo">
          {/* Hand-drawn Speech Bubble matching Slide 2 exact design */}
          <div className="s8-bubble">
            <svg
              className="s8-bubble-svg"
              viewBox="0 0 520 340"
              fill="none"
              aria-hidden="true"
            >
              <defs>
                <pattern id="s8-bubble-dots" width="18" height="18" patternUnits="userSpaceOnUse">
                  <circle cx="9" cy="9" r="0.8" fill="#cadada" opacity="0.65" />
                </pattern>
              </defs>

              {/* Black shadow underneath */}
              <path
                d={BUBBLE_PATH}
                transform="translate(4, 6)"
                fill="#000000"
                stroke="#000000"
                strokeWidth="8"
                strokeLinecap="round"
                strokeLinejoin="miter"
                strokeMiterlimit="4"
              />

              {/* White bubble body */}
              <path d={BUBBLE_PATH} fill="#ffffff" />

              {/* Subtle paper dot grid texture */}
              <path d={BUBBLE_PATH} fill="url(#s8-bubble-dots)" />

              {/* Soft teal outline with increased border width */}
              <path
                d={BUBBLE_PATH}
                fill="none"
                stroke="#8ebfbb"
                strokeWidth="8"
                strokeLinecap="round"
                strokeLinejoin="miter"
                strokeMiterlimit="4"
              />
            </svg>

            {/* Centered Speech Text inside oval body */}
            <div className="s8-bubble-text-wrap">
              <h1 ref={headingRef} tabIndex={-1} className="s8-bubble-text">
                {isSpanish ? (
                  <>
                    <span>¡Buen trabajo! Ahora ya sabe </span>
                    <span>lo que es verdad sobre las </span>
                    <span>alergias a la penicilina!</span>
                  </>
                ) : (
                  <>
                    <span>Great job! Now you know what </span>
                    <span>is true about penicillin allergies!</span>
                  </>
                )}
              </h1>
            </div>
          </div>

          {/* Nurse Anna standing on bottom-right, head directly under bubble tail */}
          <div className="s8-nurse">
            <NurseAnna
              size="md"
              imgClassName="s8-nurse-img"
              isDecorative={true}
              locale={isSpanish ? "es" : "en"}
            />
          </div>
        </div>
      </div>

      {/* Bottom Centered Navigation Buttons (Back & Next) */}
      <div className="s8-nav">
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="s8-btn s8-btn--back"
        >
          {isSpanish ? "Atrás" : "Back"}
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={loading}
          className="s8-btn s8-btn--next"
        >
          {loading ? "..." : isSpanish ? "Siguiente" : "Next"}
        </button>
      </div>
    </div>
  );
}

export default Slide8MilestoneScreen;
