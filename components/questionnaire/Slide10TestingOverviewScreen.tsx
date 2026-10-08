"use client";

import React, { useRef, useEffect } from "react";
import { NurseAnna } from "./NurseAnna";
import { resolveMedicineToken } from "@/lib/token-engine";

const SLIDE10_CSS = `
/* ==========================================================
   Slide10TestingOverviewScreen – Scoped Pixel-Perfect Styles
   ========================================================== */

.s10-root,
.s10-root *,
.s10-root *::before,
.s10-root *::after {
  box-sizing: border-box;
}

.s10-root {
  position: relative;
  width: 100%;
  height: 100%;
  flex: 1 1 0%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background-color: #f4f8ec;
  padding: 1.5rem 2.75rem 0.85rem 2.75rem;
  overflow: hidden;
}

/* 1. Main Middle Area: Two-Column Layout (Info Left, Anna + Bubble Right) */
.s10-main {
  flex: 1 1 0%;
  min-height: 0;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  padding: 0 0.5rem;
  margin: auto 0;
}

/* Left Column: Headline, Subtitle, Bullets */
.s10-left {
  flex: 1 1 0%;
  max-width: 58%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.s10-heading {
  font-size: 1.35rem;
  line-height: 1.38;
  font-weight: 700;
  color: #142724;
  letter-spacing: -0.015em;
  margin: 0 0 1.25rem 0;
  outline: none;
}
.s10-heading:focus-visible {
  box-shadow: 0 0 0 2px #236f7a;
}

.s10-subheading {
  font-size: 1.2rem;
  line-height: 1.35;
  font-weight: 700;
  color: #142724;
  letter-spacing: -0.01em;
  margin: 0 0 0.75rem 0;
}

.s10-bullets {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.s10-bullet-item {
  display: flex;
  align-items: flex-start;
  gap: 0.65rem;
  font-size: 1.05rem;
  line-height: 1.4;
  font-weight: 400;
  color: #142724;
}

.s10-bullet-dot {
  width: 6.5px;
  height: 6.5px;
  border-radius: 50%;
  background-color: #142724;
  margin-top: 0.45rem;
  flex-shrink: 0;
}

.s10-bullet-text {
  flex: 1;
}

/* Right Column: Speech Bubble + Nurse Anna Combo */
.s10-right {
  flex-shrink: 0;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.s10-combo {
  position: relative;
  width: 330px;
  height: 360px;
  flex-shrink: 0;
}

.s10-bubble {
  position: absolute;
  top: 10px;
  left: 0;
  width: 260px;
  z-index: 2;
  filter: drop-shadow(2px 3px 5px rgba(20, 60, 55, 0.18));
}

.s10-bubble-svg {
  width: 100%;
  height: auto;
  display: block;
}

.s10-bubble-text-wrap {
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

.s10-bubble-text {
  font-size: 16px;
  font-weight: 600;
  line-height: 1.32;
  color: #152925;
  margin: 0;
  display: flex;
  flex-direction: column;
  text-align: center;
}

.s10-nurse {
  position: absolute;
  bottom: 0;
  right: 12px;
  width: 115px;
  height: auto;
  max-height: 245px;
  z-index: 1;
}

.s10-nurse-img {
  width: 100%;
  height: auto;
  max-height: 245px;
  object-fit: contain;
  display: block;
}

/* 2. Bottom Centered Navigation Bar */
.s10-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  padding: 0.25rem 0;
  flex-shrink: 0;
}

.s10-btn {
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
.s10-btn:active {
  transform: scale(0.96);
}
.s10-btn:focus-visible {
  box-shadow: 0 0 0 4px #236f7a;
}

.s10-btn--back {
  background-color: #adc9c4;
  border: 1px solid #96bcb5;
}
.s10-btn--back:hover {
  background-color: #9cbdb8;
}

.s10-btn--next {
  background-color: #fae88a;
  color: #143833;
  border: 1px solid #d8c85c;
}
.s10-btn--next:hover {
  background-color: #f6df6e;
}

/* Tablet & Smaller Screens Scaling */
@media (max-height: 650px), (max-width: 820px) {
  .s10-root {
    padding: 1rem 1.5rem 0.5rem 1.5rem;
  }
  .s10-main {
    gap: 1rem;
    padding: 0;
  }
  .s10-left {
    max-width: 56%;
  }
  .s10-heading {
    font-size: 1.15rem;
    margin-bottom: 0.85rem;
  }
  .s10-subheading {
    font-size: 1.05rem;
    margin-bottom: 0.55rem;
  }
  .s10-bullets {
    gap: 0.6rem;
  }
  .s10-bullet-item {
    font-size: 0.95rem;
    line-height: 1.35;
  }
  .s10-combo {
    width: 290px;
    height: 310px;
  }
  .s10-bubble {
    width: 225px;
    top: 5px;
  }
  .s10-bubble-text {
    font-size: 14px;
    line-height: 1.28;
  }
  .s10-nurse {
    width: 95px;
    max-height: 210px;
    right: 8px;
  }
  .s10-nurse-img {
    max-height: 210px;
  }
  .s10-btn {
    padding: 0.35rem 1.6rem;
    font-size: 0.85rem;
    min-height: 40px;
  }
}

@media (max-width: 640px) {
  .s10-root {
    overflow-y: auto;
    height: auto;
    min-height: 100%;
  }
  .s10-main {
    flex-direction: column;
    align-items: center;
  }
  .s10-left {
    max-width: 100%;
    width: 100%;
  }
  .s10-right {
    margin-top: 1rem;
  }
}
`;

export interface Slide10TestingOverviewScreenProps {
  isSpanish: boolean;
  medicationName?: string;
  onNext: () => void;
  onBack: () => void;
  loading?: boolean;
}

export function Slide10TestingOverviewScreen({
  isSpanish,
  medicationName,
  onNext,
  onBack,
  loading = false,
}: Slide10TestingOverviewScreenProps) {
  const headingRef = useRef<HTMLHeadingElement | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      headingRef.current?.focus();
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  const rawIntro = isSpanish
    ? "Hay una prueba que el médico de su hijo puede realizar. Esta prueba puede determinar si su hijo puede tomar penicilina de manera segura."
    : "There's a test that your child's doctor can perform. This test can determine if your child can safely take penicillin.";

  const rawSubtitle = isSpanish
    ? "Las pruebas son seguras y se realizan en el consultorio"
    : "Testing is safe and done in the office";

  const rawBullets = [
    {
      en: "For the test, kids take [name] by mouth and are monitored in a doctor's office for about an hour.",
      es: "Para la prueba, los niños toman [name] por vía oral y se les monitorea en el consultorio médico durante aproximadamente una hora.",
    },
    {
      en: "Kids can help decide whether they want to take [name] as a liquid or chewable tablet.",
      es: "Los niños pueden ayudar a decidir si quieren tomar [name] en forma líquida o en tabletas masticables.",
    },
    {
      en: "Fortunately, kids tend to like the way [name] tastes!",
      es: "¡Afortunadamente, a los niños les suele gustar el sabor de [name]!",
    },
  ];

  const introText = resolveMedicineToken(rawIntro, medicationName, isSpanish);
  const subtitleText = resolveMedicineToken(rawSubtitle, medicationName, isSpanish);

  return (
    <div id="slide-content" className="s10-root">
      <style>{SLIDE10_CSS}</style>

      {/* 1. Main Two-Column Row (Left text & bullets, Right Speech Bubble + Nurse Anna) */}
      <div className="s10-main">
        {/* Left Column: Heading, Subheading & Bullets */}
        <div className="s10-left">
          <h1 ref={headingRef} tabIndex={-1} className="s10-heading">
            {introText}
          </h1>

          <h2 className="s10-subheading">
            {subtitleText}
          </h2>

          <ul className="s10-bullets">
            {rawBullets.map((b, idx) => {
              const text = resolveMedicineToken(isSpanish ? b.es : b.en, medicationName, isSpanish);
              return (
                <li key={idx} className="s10-bullet-item">
                  <span className="s10-bullet-dot" aria-hidden="true" />
                  <span className="s10-bullet-text">{text}</span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Right Column: Speech Bubble + Nurse Anna Combo */}
        <div className="s10-right">
          <div className="s10-combo">
            {/* Round Speech Bubble with pointer tail pointing to Anna's head */}
            <div className="s10-bubble">
              <svg viewBox="0 0 430 260" fill="none" className="s10-bubble-svg" aria-hidden="true">
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

              {/* Centered Bubble Speech Text */}
              <div className="s10-bubble-text-wrap">
                <p className="s10-bubble-text">
                  {isSpanish ? (
                    <>
                      <span>¡Hable con el</span>
                      <span>médico de su hijo</span>
                      <span>sobre las pruebas!</span>
                    </>
                  ) : (
                    <>
                      <span>Talk to your</span>
                      <span>child&apos;s doctor</span>
                      <span>about testing!</span>
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* Nurse Anna Illustration standing on right, head directly under bubble tail */}
            <div className="s10-nurse">
              <NurseAnna
                size="md"
                imgClassName="s10-nurse-img"
                isDecorative={true}
                locale={isSpanish ? "es" : "en"}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Bottom Centered Navigation Buttons (Back & Next) */}
      <div className="s10-nav">
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="s10-btn s10-btn--back"
        >
          {isSpanish ? "Atrás" : "Back"}
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={loading}
          className="s10-btn s10-btn--next"
        >
          {loading ? "..." : isSpanish ? "Siguiente" : "Next"}
        </button>
      </div>
    </div>
  );
}

export default Slide10TestingOverviewScreen;
