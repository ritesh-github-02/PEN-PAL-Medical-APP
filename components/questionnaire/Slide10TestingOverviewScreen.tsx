"use client";

import React, { useState, useRef, useEffect } from "react";
import AudioPlayer from "./AudioPlayer";
import { resolveMedicineToken } from "@/lib/token-engine";
import SlideNavigationButtons from "./SlideNavigationButtons";

/* ==========================================================
   Slide10TestingOverviewScreen – Scoped Pixel-Perfect Stage Layout
   Exact Match to User Reference Image (Slide 9 / Testing Overview):
   - 896 x 645 scaled stage with background #fafdf3
   - Left-side Content (left: 104px, top: 86px, width: 485px):
     1. Intro text (3 lines):
        "There's a test that your child's doctor can perform.
         This test can determine if your child can safely take penicillin."
     2. Bold subheading:
        "Testing is safe and done in the office"
     3. 3 Bullet points with solid black circular dots:
        • For the test, kids take [name] by mouth and are monitored in a doctor's office for about an hour.
        • Kids can help decide whether they want to take [name] as a liquid or chewable tablet.
        • Fortunately, kids tend to like the way [name] tastes!
   - Right-side Speech Bubble (left: 590px, top: 96px, width: 236px, height: 165px):
     "Talk to your child's doctor about testing!"
   - Nurse Anna on the right (left: 652px, top: 250px, width: 156px, height: 310px):
     Natural illustration pointing toward the left side at the bullet points
   - Centered Back (left: 352px) & Next (left: 483px) buttons at y = 544px
   - Single stage audio controls at left: 659px, y = 538px
   ========================================================== */

const STAGE_W = 750;
const STAGE_H = 530;

const SLIDE10_CSS = `
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
  overflow: hidden;
  background-color: #fafdf3;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: "Plus Jakarta Sans", "Inter", system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
  color: #232323;
}

.s10-stage {
  position: relative;
  width: ${STAGE_W}px;
  height: ${STAGE_H}px;
  flex: none;
  transform-origin: center center;
  background-color: #fafdf3;
}

/* ---------- 1. Left-Side Information Area ---------- */
.s10-left {
  position: absolute;
  left: 32px;
  top: 82px;
  width: 456px;
  display: flex;
  flex-direction: column;
  z-index: 10;
}

.s10-heading {
  margin: 0 0 16px 0;
  font-family: inherit;
  font-size: 20px;
  font-weight: 500;
  line-height: 1.38;
  color: #232323;
  letter-spacing: -0.01em;
  text-align: left;
  outline: none;
}
.s10-heading:focus-visible {
  box-shadow: 0 0 0 2px #236f7a;
  border-radius: 4px;
}

.s10-subheading {
  margin: 0 0 16px 0;
  font-family: inherit;
  font-size: 20px;
  font-weight: 700;
  line-height: 1.32;
  color: #232323;
  letter-spacing: -0.01em;
  text-align: left;
}

.s10-bullets {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.s10-bullet-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  font-family: inherit;
  font-size: 18.5px;
  font-weight: 500;
  line-height: 1.38;
  color: #232323;
  letter-spacing: -0.01em;
  text-align: left;
}

.s10-bullet-dot {
  width: 6.5px;
  height: 6.5px;
  border-radius: 50%;
  background-color: #232323;
  flex-shrink: 0;
  margin-top: 9px;
}

/* ---------- 2. Right-Side Speech Bubble ---------- */
.s10-bubble {
  position: absolute;
  left: 510px;
  top: 29px;
  width: 236px;
  height: 165px;
  z-index: 5;
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
  top: 25px;
  left: 18px;
  width: 195px;
  height: 98px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  pointer-events: none;
  padding: 0 4px;
}

.s10-bubble-text {
  font-family: inherit;
  font-size: 18px;
  font-weight: 600;
  line-height: 1.25;
  color: #232323;
  letter-spacing: -0.01em;
  margin: 0;
  text-align: center;
}

/* ---------- 3. Nurse Anna Illustration (Standing on Right) ---------- */
.s10-nurse {
  position: absolute;
  left: 572px;
  top: 141px;
  width: 127px;
  height: 310px;
  z-index: 10;
  pointer-events: none;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}
.s10-nurse-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: bottom center;
  display: block;
}

/* ---------- 4. Centered Navigation Buttons (Back & Next) ---------- */
.s10-nav-back {
  position: absolute;
  left: 272px;
  top: 462px;
  z-index: 20;
}
.s10-nav-next {
  position: absolute;
  left: 403px;
  top: 462px;
  z-index: 20;
}
.s10-btn {
  height: 35px;
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
.s10-btn:active:not(:disabled) {
  transform: scale(0.96);
}
.s10-btn:focus-visible {
  box-shadow: 0 0 0 3px #236f7a;
}
.s10-btn--back {
  width: 64px;
  background-color: #bddfd8;
  border-color: #8ab8b0;
  color: #143833;
}
.s10-btn--back:hover:not(:disabled) {
  background-color: #a8d5cc;
}
.s10-btn--next {
  width: 62px;
  background-color: #fdee8e;
  border-color: #d4c65e;
  color: #232323;
  cursor: pointer;
}
.s10-btn--next:hover:not(:disabled) {
  background-color: #f5e478;
}

/* ---------- 5. Caption (CC) & Play/Pause Controls ---------- */
.s10-audio {
  position: absolute;
  left: 565px;
  top: 444px;
  z-index: 20;
  display: flex;
  align-items: center;
  gap: 8px;
}
.s10-audio .audio-cc-btn svg {
  width: 52px !important;
  height: 47px !important;
}
.s10-audio .audio-play-btn svg {
  width: 70px !important;
  height: 47px !important;
}

/* ==========================================================
   Mobile-First Responsive Layout (< 768px)
   ========================================================== */
@media (max-width: 767px) {
  .s10-root {
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
  .s10-stage {
    position: relative !important;
    width: 100% !important;
    max-width: 380px !important;
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
  .s10-left {
    position: static !important;
    left: auto !important;
    top: auto !important;
    width: 100% !important;
    margin: 0 0 8px 0 !important;
    padding: 0 4px !important;
  }
  .s10-heading {
    font-size: 13.5px !important;
    line-height: 1.35 !important;
    margin: 0 0 6px 0 !important;
    text-align: left !important;
  }
  .s10-subheading {
    font-size: 14px !important;
    line-height: 1.3 !important;
    font-weight: 700 !important;
    margin: 0 0 8px 0 !important;
    text-align: left !important;
  }
  .s10-bullets {
    display: flex !important;
    flex-direction: column !important;
    gap: 6px !important;
    margin: 0 !important;
    padding: 0 !important;
  }
  .s10-bullet-item {
    font-size: 12.5px !important;
    line-height: 1.35 !important;
    gap: 8px !important;
  }
  .s10-bullet-dot {
    width: 6px !important;
    height: 6px !important;
    min-width: 6px !important;
    margin-top: 5px !important;
  }
  .s10-bubble {
    position: relative !important;
    left: auto !important;
    top: auto !important;
    width: 220px !important;
    height: 105px !important;
    margin: 6px auto 0 auto !important;
    z-index: 1 !important;
    pointer-events: none !important;
  }
  .s10-bubble-text-wrap {
    position: absolute !important;
    top: 45% !important;
    left: 48% !important;
    transform: translate(-50%, -50%) !important;
    width: 78% !important;
    max-width: 175px !important;
  }
  .s10-bubble-text {
    font-size: 12px !important;
    line-height: 1.25 !important;
    font-weight: 700 !important;
    text-align: center !important;
  }
  .s10-nurse {
    position: relative !important;
    left: auto !important;
    top: auto !important;
    width: 75px !important;
    height: 120px !important;
    margin-top: -15px !important;
    margin-left: auto !important;
    margin-right: 25px !important;
    z-index: 2 !important;
    pointer-events: none !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
  }
  .s10-nurse-img {
    width: 100% !important;
    height: 100% !important;
    object-fit: contain !important;
  }
  .s10-audio {
    position: relative !important;
    left: auto !important;
    bottom: auto !important;
    top: auto !important;
    margin: 8px auto 0 auto !important;
    z-index: 25 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    gap: 8px !important;
  }
  .s10-audio .audio-cc-btn svg {
    width: 38px !important;
    height: 34px !important;
  }
  .s10-audio .audio-play-btn svg {
    width: 48px !important;
    height: 34px !important;
  }
}
`;

export interface Slide10TestingOverviewScreenProps {
  isSpanish: boolean;
  medicationName?: string;
  onNext: () => void;
  onBack: () => void;
  loading?: boolean;
  audioSrc?: string;
  stepId?: string;
  locale?: string;
  transcriptText?: string;
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
  audioSrc,
  stepId = "slide10_testing",
  locale,
  transcriptText,
}: Slide10TestingOverviewScreenProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      headingRef.current?.focus();
    }, 50);
    return () => clearTimeout(timer);
  }, []);

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

  const introText = medicationName
    ? resolveMedicineToken(rawIntro, medicationName, isSpanish)
    : rawIntro;

  const subtitleText = medicationName
    ? resolveMedicineToken(rawSubtitle, medicationName, isSpanish)
    : rawSubtitle;

  const spokenText = `${introText}. ${subtitleText}`;

  return (
    <div id="slide-content" className="s10-root" ref={rootRef}>
      <style>{SLIDE10_CSS}</style>

      <div className="s10-stage" style={{ transform: `scale(${scale})` }}>
        {/* 1. Left-Side Information Column */}
        <div className="s10-left">
          <h1 ref={headingRef} tabIndex={-1} className="s10-heading">
            {introText}
          </h1>

          <h2 className="s10-subheading">
            {subtitleText}
          </h2>

          <ul className="s10-bullets">
            {rawBullets.map((b, idx) => {
              const raw = isSpanish ? b.es : b.en;
              const text = medicationName
                ? resolveMedicineToken(raw, medicationName, isSpanish)
                : raw;
              return (
                <li key={idx} className="s10-bullet-item">
                  <span className="s10-bullet-dot" aria-hidden="true" />
                  <span>{text}</span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* 2. Right-Side Speech Bubble */}
        <div className="s10-bubble">
          <svg
            className="s10-bubble-svg"
            viewBox="0 0 520 330"
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
            <path d={BUBBLE_PATH} fill="url(#s10-bubble-dots)" />

            {/* Soft teal outline */}
            <path
              d={BUBBLE_PATH}
              fill="none"
              stroke="#94bbb9"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          {/* Centered Speech Text inside bubble */}
          <div className="s10-bubble-text-wrap">
            <p className="s10-bubble-text">
              {isSpanish ? (
                <>
                  ¡Hable con el
                  <br />
                  médico de su hijo
                  <br />
                  sobre las pruebas!
                </>
              ) : (
                <>
                  Talk to your
                  <br />
                  child&apos;s doctor
                  <br />
                  about testing!
                </>
              )}
            </p>
          </div>
        </div>

        {/* 3. Nurse Anna standing on the right, gesturing toward the left */}
        <div className="s10-nurse">
          <img
            src="/images/nurse-anna.png"
            alt={isSpanish ? "Ilustración de la enfermera Anna" : "Illustration of Nurse Anna"}
            className="s10-nurse-img"
          />
        </div>

        {/* 5. Caption (CC) & Play/Pause controls directly at right baseline */}
        <div className="s10-audio">
          <AudioPlayer
            audioSrc={audioSrc}
            stepId={stepId}
            locale={locale || (isSpanish ? "es" : "en")}
            transcriptText={transcriptText || spokenText}
            size="large"
          />
        </div>
      </div>

      {/* 4. Centered Navigation Buttons (Back & Next) */}
      <SlideNavigationButtons
        onBack={onBack}
        onNext={onNext}
        isSpanish={isSpanish}
        loading={loading}
      />
    </div>
  );
}

export default Slide10TestingOverviewScreen;
