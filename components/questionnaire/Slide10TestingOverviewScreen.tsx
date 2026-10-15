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
  justify-content: center;
  align-items: center;
  background-color: #f4f8ec;
  padding: 0.35rem 0.75rem 0.35rem 0.75rem;
  overflow: hidden;
  gap: clamp(0.6rem, 2vh, 1.25rem);
}

/* 1. Main Middle Area: Two-Column Layout (Info Left, Anna + Bubble Right) */
.s10-main {
  flex-shrink: 0;
  width: 100%;
  max-width: 820px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: clamp(1.2rem, 3vw, 2.2rem);
  padding: 0;
  margin: 0 auto;
}

/* Left Column: Headline, Subtitle, Bullets */
.s10-left {
  flex: 0 1 430px;
  width: 100%;
  max-width: 440px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.s10-heading {
  font-size: clamp(1.1rem, 2vw, 1.3rem);
  line-height: 1.35;
  font-weight: 700;
  color: #142724;
  letter-spacing: -0.015em;
  margin: 0 0 0.85rem 0;
  outline: none;
}
.s10-heading:focus-visible {
  box-shadow: 0 0 0 2px #236f7a;
}

.s10-subheading {
  font-size: clamp(0.95rem, 1.8vw, 1.15rem);
  line-height: 1.32;
  font-weight: 700;
  color: #142724;
  letter-spacing: -0.01em;
  margin: 0 0 0.5rem 0;
}

.s10-bullets {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

.s10-bullet-item {
  display: flex;
  align-items: flex-start;
  gap: 0.65rem;
  font-size: clamp(0.85rem, 1.5vw, 0.95rem);
  line-height: 1.35;
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
  height: 175px;
  z-index: 2;
  pointer-events: none;
}

.s10-bubble-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
  display: block;
}

.s10-bubble-text-wrap {
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
  padding: 0 10px;
}

.s10-bubble-text {
  font-size: 14.5px;
  font-weight: 500;
  line-height: 1.36;
  color: #1a2e2b;
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
  margin: 0;
  padding: 0;
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
    max-width: 640px;
    gap: 1.25rem;
    padding: 0;
  }
  .s10-left {
    max-width: 360px;
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
    height: 152px;
    top: 5px;
  }
  .s10-bubble-text {
    font-size: 12.5px;
    line-height: 1.3;
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
            {/* Hand-drawn Speech Bubble matching Slide 2 exact design */}
            <div className="s10-bubble">
              <svg
                className="s10-bubble-svg"
                viewBox="0 0 520 340"
                fill="none"
                aria-hidden="true"
              >
                <defs>
                  <pattern id="s10-bubble-dots" width="18" height="18" patternUnits="userSpaceOnUse">
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
                <path d={BUBBLE_PATH} fill="url(#s10-bubble-dots)" />

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

              {/* Centered Bubble Speech Text */}
              <div className="s10-bubble-text-wrap">
                <p className="s10-bubble-text">
                  {isSpanish ? (
                    <>
                      <span>¡Hable con el </span>
                      <span>médico de su hijo </span>
                      <span>sobre las pruebas!</span>
                    </>
                  ) : (
                    <>
                      <span>Talk to your </span>
                      <span>child&apos;s doctor </span>
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
