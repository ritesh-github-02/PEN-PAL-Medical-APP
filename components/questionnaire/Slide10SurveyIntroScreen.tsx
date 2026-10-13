"use client";

import React, { useRef, useEffect } from "react";
import { NurseAnna } from "./NurseAnna";

const SLIDE10_SURVEY_INTRO_CSS = `
/* ==========================================================
   Slide10SurveyIntroScreen – Scoped Pixel-Perfect Styles
   ========================================================== */

.s10b-root,
.s10b-root *,
.s10b-root *::before,
.s10b-root *::after {
  box-sizing: border-box;
}

.s10b-root {
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
  padding: 0.85rem 1.8rem 0.6rem 1.8rem;
  overflow: hidden;
  gap: clamp(0.6rem, 2vh, 1.25rem);
}

/* Middle Content: Nurse Anna (Left) + Large Speech Bubble (Right) */
.s10b-middle {
  flex-shrink: 0;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  padding: 0;
}

.s10b-combo {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  position: relative;
  width: 480px;
  height: 245px;
}

/* Nurse Anna standing on Left, mirrored horizontally to gesture toward the right */
.s10b-nurse {
  position: relative;
  width: 105px;
  height: auto;
  max-height: 220px;
  object-fit: contain;
  align-self: flex-end;
  margin-right: -32px;
  margin-bottom: 2px;
  z-index: 1;
  flex-shrink: 0;
  transform: scaleX(-1);
}

.s10b-nurse-img {
  width: 100%;
  height: auto;
  max-height: 220px;
  object-fit: contain;
  display: block;
}

/* Speech Bubble with pointer tail pointing to Anna on the left */
.s10b-bubble {
  position: relative;
  width: 375px;
  flex-shrink: 0;
  align-self: flex-start;
  margin-top: 4px;
  filter: drop-shadow(2px 3px 6px rgba(20, 60, 55, 0.18));
  z-index: 2;
}

.s10b-bubble-svg {
  width: 100%;
  height: auto;
  display: block;
}

.s10b-bubble-text-wrap {
  position: absolute;
  top: 5%;
  left: 10%;
  width: 82%;
  height: 85%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  pointer-events: none;
  padding: 0 12px;
}

.s10b-bubble-text {
  font-size: 14.5px;
  font-weight: 600;
  line-height: 1.36;
  color: #142724;
  margin: 0;
  display: flex;
  flex-direction: column;
  outline: none;
}
.s10b-bubble-text:focus-visible {
  box-shadow: 0 0 0 2px #236f7a;
}

/* Bottom Centered Navigation */
.s10b-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  margin: 0;
  padding: 0;
  flex-shrink: 0;
}

.s10b-btn {
  padding: 0.45rem 2rem;
  min-height: 44px;
  min-width: 100px;
  border-radius: 9999px;
  font-size: 0.95rem;
  font-weight: 500;
  color: #143833;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  outline: none;
  cursor: pointer;
  border: none;
  transition: all 0.15s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.s10b-btn:active {
  transform: scale(0.96);
}
.s10b-btn:focus-visible {
  box-shadow: 0 0 0 4px #236f7a;
}

.s10b-btn--back {
  background-color: #adc9c4;
  border: 1px solid #96bcb5;
}
.s10b-btn--back:hover {
  background-color: #9cbdb8;
}

.s10b-btn--next {
  background-color: #fae88a;
  color: #143833;
  border: 1px solid #d8c85c;
}
.s10b-btn--next:hover {
  background-color: #f6df6e;
}

/* Tablet & Smaller Screens Scaling */
@media (max-height: 600px), (max-width: 768px) {
  .s10b-root {
    padding: 0.75rem 1.25rem 0.45rem 1.25rem;
  }
  .s10b-combo {
    width: 420px;
    height: 220px;
  }
  .s10b-bubble {
    width: 330px;
    margin-top: 4px;
  }
  .s10b-bubble-text {
    font-size: 13px;
    line-height: 1.34;
  }
  .s10b-nurse {
    width: 95px;
    max-height: 195px;
    margin-right: -28px;
  }
  .s10b-nurse-img {
    max-height: 195px;
  }
  .s10b-btn {
    padding: 0.35rem 1.6rem;
    font-size: 0.85rem;
  }
}

@media (max-width: 640px) {
  .s10b-combo {
    display: block;
    position: relative;
    width: 100%;
    max-width: 320px;
    height: 150px;
    margin: 0.2rem auto 0 auto;
    flex-shrink: 0;
  }
  .s10b-nurse {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 70px;
    margin-right: 0;
    margin-top: 0;
    z-index: 1;
  }
  .s10b-nurse-img {
    max-height: 145px;
    width: 100%;
    object-fit: contain;
  }
  .s10b-bubble {
    position: absolute;
    top: 0;
    right: 0;
    width: 235px;
    margin-top: 0;
    z-index: 2;
  }
  .s10b-bubble-text-wrap {
    top: 10% !important;
    left: 17% !important;
    width: 76% !important;
    height: 76% !important;
    padding: 2px 8px !important;
    box-sizing: border-box !important;
  }
  .s10b-bubble-text {
    font-size: 9.6px !important;
    line-height: 1.24 !important;
    display: block !important;
  }
  .s10b-bubble-text span {
    display: inline !important;
  }
}
`;

export interface Slide10SurveyIntroScreenProps {
  isSpanish: boolean;
  onNext: () => void;
  onBack: () => void;
  loading?: boolean;
}

export function Slide10SurveyIntroScreen({
  isSpanish,
  onNext,
  onBack,
  loading = false,
}: Slide10SurveyIntroScreenProps) {
  const headingRef = useRef<HTMLHeadingElement | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      headingRef.current?.focus();
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div id="slide-content" className="s10b-root">
      <style>{SLIDE10_SURVEY_INTRO_CSS}</style>

      {/* Middle Content: Nurse Anna (Left) + Large Speech Bubble (Right) */}
      <div className="s10b-middle">
        <div className="s10b-combo">
          {/* Nurse Anna standing on Left, mirrored to gesture toward speech bubble */}
          <div className="s10b-nurse">
            <NurseAnna
              size="md"
              imgClassName="s10b-nurse-img"
              isDecorative={true}
              locale={isSpanish ? "es" : "en"}
            />
          </div>

          {/* Large Vector Speech Bubble with pointer tail pointing to Anna on the left */}
          <div className="s10b-bubble">
            <svg viewBox="0 0 430 260" fill="none" className="s10b-bubble-svg" aria-hidden="true">
              {/* Desktop pointer tail */}
              <path
                className="hidden md:inline"
                d="M 213, 8
                   C 317, 8  404, 56  404, 120
                   C 404, 146  388, 172  360, 189
                   C 375, 204  392, 222  409, 239
                   C 390, 241  356, 233  325, 214
                   C 292, 228  254, 236  213, 236
                   C 109, 236  28, 184  28, 120
                   C 28, 56  109, 8  213, 8
                   Z"
                transform="translate(430, 0) scale(-1, 1)"
                fill="#ffffff"
                stroke="#27707e"
                strokeWidth="2.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Mobile pointer tail: naturally points directly at Nurse Anna's head/face */}
              <path
                className="inline md:hidden"
                d="M 195, 12
                   C 265, 12  338, 48  364, 93
                   C 382, 98  405, 107  422, 118
                   C 400, 136  378, 148  359, 158
                   C 336, 202  265, 230  195, 230
                   C 98, 230  20, 182  20, 121
                   C 20, 60  98, 12  195, 12
                   Z"
                transform="translate(430, 0) scale(-1, 1)"
                fill="#ffffff"
                stroke="#27707e"
                strokeWidth="2.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            {/* Centered Speech Text inside oval body */}
            <div className="s10b-bubble-text-wrap">
              <h1 ref={headingRef} tabIndex={-1} className="s10b-bubble-text">
                {isSpanish ? (
                  <>
                    <span>El siguiente conjunto de preguntas puede </span>
                    <span>ayudarlo a usted y al médico a decidir </span>
                    <span>qué es lo mejor para su hijo.</span>
                  </>
                ) : (
                  <>
                    <span>The next set of questions can help </span>
                    <span>you and the doctor see what&apos;s best </span>
                    <span>for your child.</span>
                  </>
                )}
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Centered Navigation Buttons (Back & Next) */}
      <div className="s10b-nav">
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="s10b-btn s10b-btn--back"
        >
          {isSpanish ? "Atrás" : "Back"}
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={loading}
          className="s10b-btn s10b-btn--next"
        >
          {loading ? "..." : isSpanish ? "Siguiente" : "Next"}
        </button>
      </div>
    </div>
  );
}

export default Slide10SurveyIntroScreen;
