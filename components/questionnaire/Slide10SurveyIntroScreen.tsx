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
  justify-content: space-between;
  background-color: #f4f8ec;
  padding: 1.5rem 2.25rem 0.85rem 2.25rem;
  overflow: hidden;
}

/* Middle Content: Nurse Anna (Left) + Large Speech Bubble (Right) */
.s10b-middle {
  flex: 1 1 0%;
  min-height: 0;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: auto;
}

.s10b-combo {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  position: relative;
  width: 700px;
  height: 350px;
}

/* Nurse Anna standing on Left, mirrored horizontally to gesture toward the right */
.s10b-nurse {
  position: relative;
  width: 125px;
  height: auto;
  max-height: 265px;
  object-fit: contain;
  align-self: flex-end;
  margin-right: -42px;
  margin-bottom: 5px;
  z-index: 1;
  flex-shrink: 0;
  transform: scaleX(-1);
}

.s10b-nurse-img {
  width: 100%;
  height: auto;
  max-height: 265px;
  object-fit: contain;
  display: block;
}

/* Speech Bubble with pointer tail pointing to Anna on the left */
.s10b-bubble {
  position: relative;
  width: 505px;
  flex-shrink: 0;
  align-self: flex-start;
  margin-top: 10px;
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
  padding: 0 16px;
}

.s10b-bubble-text {
  font-size: 19.5px;
  font-weight: 600;
  line-height: 1.4;
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
  padding: 0.25rem 0;
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
    padding: 1rem 1.5rem 0.5rem 1.5rem;
  }
  .s10b-combo {
    width: 590px;
    height: 300px;
  }
  .s10b-bubble {
    width: 430px;
    margin-top: 8px;
  }
  .s10b-bubble-text {
    font-size: 16.5px;
    line-height: 1.35;
  }
  .s10b-nurse {
    width: 105px;
    max-height: 225px;
    margin-right: -36px;
  }
  .s10b-nurse-img {
    max-height: 225px;
  }
  .s10b-btn {
    padding: 0.35rem 1.6rem;
    font-size: 0.85rem;
  }
}

@media (max-width: 640px) {
  .s10b-combo {
    flex-direction: column-reverse;
    align-items: center;
    width: 100%;
    height: auto;
  }
  .s10b-nurse {
    margin-right: 0;
    margin-top: 10px;
  }
  .s10b-bubble {
    width: 100%;
    max-width: 380px;
  }
  .s10b-bubble-text {
    font-size: 15px;
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
                    <span>El siguiente conjunto de preguntas puede</span>
                    <span>ayudarlo a usted y al médico a decidir</span>
                    <span>qué es lo mejor para su hijo.</span>
                  </>
                ) : (
                  <>
                    <span>The next set of questions can help</span>
                    <span>you and the doctor see what&apos;s best</span>
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
