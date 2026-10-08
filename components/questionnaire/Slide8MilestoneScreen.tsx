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
  justify-content: space-between;
  background-color: #f4f8ec;
  padding: 1.5rem 2.25rem 0.85rem 2.25rem;
  overflow: hidden;
}

/* Middle Content: Large Speech Bubble + Nurse Anna Combo */
.s8-middle {
  flex: 1 1 0%;
  min-height: 0;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: auto;
}

.s8-combo {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  position: relative;
  width: 680px;
  height: 335px;
}

.s8-bubble {
  position: relative;
  width: 490px;
  flex-shrink: 0;
  align-self: flex-start;
  margin-top: 10px;
  filter: drop-shadow(2px 4px 10px rgba(20, 60, 55, 0.18));
  z-index: 2;
}
.s8-bubble-svg {
  width: 100%;
  height: auto;
  display: block;
}
.s8-bubble-text-wrap {
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
  padding: 0 16px;
}
.s8-bubble-text {
  font-size: 21px;
  font-weight: 600;
  line-height: 1.4;
  color: #142724;
  margin: 0;
  display: flex;
  flex-direction: column;
  outline: none;
}
.s8-bubble-text:focus-visible {
  box-shadow: 0 0 0 2px #236f7a;
}

.s8-nurse {
  position: relative;
  width: 118px;
  height: auto;
  max-height: 250px;
  object-fit: contain;
  align-self: flex-end;
  margin-left: -54px;
  z-index: 1;
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
  padding: 0.25rem 0;
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
    padding: 1rem 1.5rem 0.5rem 1.5rem;
  }
  .s8-combo {
    width: 580px;
    height: 290px;
  }
  .s8-bubble {
    width: 420px;
    margin-top: 8px;
  }
  .s8-bubble-text {
    font-size: 17px;
    line-height: 1.35;
  }
  .s8-nurse {
    width: 100px;
    max-height: 215px;
    margin-left: -46px;
  }
  .s8-nurse-img {
    max-height: 215px;
  }
  .s8-btn {
    padding: 0.35rem 1.6rem;
    font-size: 0.85rem;
  }
}
`;

export interface Slide8MilestoneScreenProps {
  isSpanish: boolean;
  onNext: () => void;
  onBack: () => void;
  loading?: boolean;
}

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
          {/* Custom Large Vector Speech Bubble with natural round shape and downward pointer tail */}
          <div className="s8-bubble">
            <svg viewBox="0 0 430 260" fill="none" className="s8-bubble-svg">
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
            <div className="s8-bubble-text-wrap">
              <h1 ref={headingRef} tabIndex={-1} className="s8-bubble-text">
                {isSpanish ? (
                  <>
                    <span>¡Buen trabajo! Ahora ya sabe</span>
                    <span>lo que es verdad sobre las</span>
                    <span>alergias a la penicilina!</span>
                  </>
                ) : (
                  <>
                    <span>Great job! Now you know what</span>
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
