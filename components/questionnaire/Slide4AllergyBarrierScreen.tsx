"use client";

import React, { useRef, useEffect } from "react";
import { NurseAnna } from "./NurseAnna";
import { resolveMedicineToken } from "@/lib/token-engine";

const SLIDE4_CSS = `
/* ==========================================================
   Slide4AllergyBarrierScreen – Scoped Pixel-Perfect Styles
   ========================================================== */

.s4-root,
.s4-root *,
.s4-root *::before,
.s4-root *::after {
  box-sizing: border-box;
}

.s4-root {
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
.s4-middle {
  flex: 1 1 0%;
  min-height: 0;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: auto;
}

.s4-combo {
  position: relative;
  width: 595px;
  height: 385px;
  max-width: 95%;
  margin: 0 auto;
}

.s4-bubble {
  position: absolute;
  top: 0;
  left: 0;
  width: 460px;
  filter: drop-shadow(2px 4px 10px rgba(20, 60, 55, 0.16));
  z-index: 2;
}
.s4-bubble-svg {
  width: 100%;
  height: auto;
  display: block;
}
.s4-bubble-text-wrap {
  position: absolute;
  top: 6%;
  left: 5%;
  width: 79%;
  height: 80%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  pointer-events: none;
  padding: 0 14px;
}
.s4-bubble-text {
  font-size: 18px;
  font-weight: 600;
  line-height: 1.4;
  color: #142724;
  margin: 0;
  display: flex;
  flex-direction: column;
  outline: none;
}
.s4-bubble-text:focus-visible {
  box-shadow: 0 0 0 2px #236f7a;
}

.s4-nurse {
  position: absolute;
  bottom: 0;
  left: 442px;
  width: 125px;
  height: auto;
  z-index: 1;
}
.s4-nurse-img {
  width: 100%;
  height: auto;
  max-height: 250px;
  object-fit: contain;
  display: block;
}

/* Bottom Centered Navigation */
.s4-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  padding: 0.25rem 0;
  flex-shrink: 0;
}
.s4-btn {
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
.s4-btn:active {
  transform: scale(0.96);
}
.s4-btn:focus-visible {
  box-shadow: 0 0 0 4px #236f7a;
}

.s4-btn--back {
  background-color: #adc9c4;
  border: 1px solid #96bcb5;
}
.s4-btn--back:hover {
  background-color: #9cbdb8;
}

.s4-btn--next {
  background-color: #fae88a;
  color: #143833;
  border: 1px solid #d8c85c;
}
.s4-btn--next:hover {
  background-color: #f6df6e;
}

/* Tablet & Smaller Screens Scaling */
@media (max-height: 640px), (max-width: 768px) {
  .s4-root {
    padding: 0.85rem 1.5rem 0.5rem 1.5rem;
  }
  .s4-combo {
    width: 510px;
    height: 330px;
  }
  .s4-bubble {
    width: 390px;
  }
  .s4-bubble-text {
    font-size: 15px;
    line-height: 1.35;
  }
  .s4-nurse {
    left: 374px;
    width: 105px;
  }
  .s4-nurse-img {
    max-height: 215px;
  }
  .s4-btn {
    padding: 0.35rem 1.6rem;
    font-size: 0.85rem;
  }
}

@media (max-height: 520px) {
  .s4-combo {
    width: 440px;
    height: 285px;
  }
  .s4-bubble {
    width: 335px;
  }
  .s4-bubble-text {
    font-size: 13.5px;
  }
  .s4-nurse {
    left: 320px;
    width: 90px;
  }
  .s4-nurse-img {
    max-height: 180px;
  }
}
`;

export interface Slide4AllergyBarrierScreenProps {
  isSpanish: boolean;
  medicationName?: string;
  onNext: () => void;
  onBack: () => void;
  loading?: boolean;
}

export function Slide4AllergyBarrierScreen({
  isSpanish,
  medicationName,
  onNext,
  onBack,
  loading = false,
}: Slide4AllergyBarrierScreenProps) {
  const headingRef = useRef<HTMLHeadingElement | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      headingRef.current?.focus();
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  const resolvedName = medicationName && medicationName.trim()
    ? medicationName
    : (isSpanish ? "La penicilina" : "[Name]");

  return (
    <div id="slide-content" className="s4-root">
      <style>{SLIDE4_CSS}</style>

      {/* Middle Content: Large Speech Bubble + Nurse Anna Combo */}
      <div className="s4-middle">
        <div className="s4-combo">
          {/* Custom Large Vector Speech Bubble with natural round shape and downward pointer tail */}
          <div className="s4-bubble">
            <svg viewBox="0 0 430 260" fill="none" className="s4-bubble-svg">
              <path
                d="M 213, 8
                   C 317, 8  404, 56  404, 120
                   C 404, 146  392, 172  372, 186
                   C 388, 198  412, 212  432, 224
                   C 398, 228  362, 226  328, 222
                   C 292, 230  254, 236  213, 236
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
            <div className="s4-bubble-text-wrap">
              <h1 ref={headingRef} tabIndex={-1} className="s4-bubble-text">
                {isSpanish ? (
                  <>
                    <span>{resolvedName} es uno de los mejores</span>
                    <span>antibióticos. Pero muchos niños no</span>
                    <span>lo reciben porque se cree</span>
                    <span>que son alérgicos a él.</span>
                  </>
                ) : (
                  <>
                    <span>{resolvedName} is one of the best</span>
                    <span>antibiotics. But many kids do</span>
                    <span>not get it because they are</span>
                    <span>believed to be allergic to it.</span>
                  </>
                )}
              </h1>
            </div>
          </div>

          {/* Nurse Anna standing on bottom-right, head directly under bubble tail */}
          <div className="s4-nurse">
            <NurseAnna
              size="md"
              imgClassName="s4-nurse-img"
              isDecorative={true}
              locale={isSpanish ? "es" : "en"}
            />
          </div>
        </div>
      </div>

      {/* Bottom Centered Navigation Buttons (Back & Next) */}
      <div className="s4-nav">
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="s4-btn s4-btn--back"
        >
          {isSpanish ? "Atrás" : "Back"}
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={loading}
          className="s4-btn s4-btn--next"
        >
          {loading ? "..." : isSpanish ? "Siguiente" : "Next"}
        </button>
      </div>
    </div>
  );
}

export default Slide4AllergyBarrierScreen;
