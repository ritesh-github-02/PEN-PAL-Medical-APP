"use client";

import React, { useRef, useEffect, useState } from "react";
import AudioPlayer from "./AudioPlayer";
import { resolveMedicineToken } from "@/lib/token-engine";
import SlideNavigationButtons from "./SlideNavigationButtons";

/* ==========================================================
   Slide3EfficacyScreen – Scoped Pixel-Perfect Stage Layout
   Exact Match to Reference Image 2:
   - Left-aligned bold statement across 4 lines at top-left
   - Speech bubble on right with tail landing properly on Anna's head/hair
   - Properly centered font in speech bubble both horizontally & vertically
   - Nurse Anna standing on right with hair under bubble tail
   - Centered Back and Next buttons at y = 544px
   - Single CC & Play/Pause controls directly below Nurse Anna at y = 541px
   ========================================================== */

const STAGE_W = 750;
const STAGE_H = 530;

const SLIDE3_CSS = `
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
  overflow: hidden;
  background-color: #fafdf3;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: "Plus Jakarta Sans", "Inter", system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
  color: #262626;
}

.s3-stage {
  position: relative;
  width: ${STAGE_W}px;
  height: ${STAGE_H}px;
  flex: none;
  transform-origin: center center;
  background-color: #fafdf3;
}

/* ---------- 1. Left-aligned Statement Heading (4 lines matching exact reference image) ---------- */
.s3-heading {
  position: absolute;
  left: 48px;
  top: 24px;
  width: 510px;
  max-width: 515px;
  margin: 0;
  padding: 0;
  text-align: left;
  font-size: 22.5px;
  line-height: 1.38;
  font-weight: 700;
  letter-spacing: -0.012em;
  color: #232323;
  outline: none;
}
.s3-heading:focus-visible {
  box-shadow: 0 0 0 2px #236f7a;
}

/* ---------- 2. Speech Bubble on Right (tail lands directly on Anna's head) ---------- */
.s3-bubble {
  position: absolute;
  left: 346px;
  top: 96px;
  width: 292px;
  height: 192px;
  pointer-events: none;
  z-index: 1;
}
.s3-bubble-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
}
.s3-bubble-text-wrap {
  position: absolute;
  top: 45%;
  left: 48%;
  transform: translate(-50%, -50%);
  width: 78%;
  max-width: 228px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 0;
  margin: 0;
  box-sizing: border-box;
  pointer-events: none;
}
.s3-bubble-text {
  margin: 0;
  padding: 0;
  width: 100%;
  font-family: "Plus Jakarta Sans", "Inter", system-ui, -apple-system, sans-serif;
  font-size: 14.5px;
  line-height: 1.45;
  font-weight: 500;
  color: #1a2e2b;
  text-align: center;
  letter-spacing: -0.01em;
}
.s3-bubble-line {
  display: block;
  text-align: center;
  margin: 0 auto;
  width: 100%;
}

/* ---------- 3. Nurse Anna standing on Right ---------- */
.s3-nurse {
  position: absolute;
  left: 584px;
  top: 222px;
  width: 112px;
  height: 211px;
  pointer-events: none;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
}
.s3-nurse-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
  user-select: none;
  -webkit-user-drag: none;
}

/* ---------- 4. Centered Navigation Buttons (Back & Next) ---------- */
.s3-nav-back {
  position: absolute;
  left: 264px;
  top: 458px;
  z-index: 10;
}
.s3-nav-next {
  position: absolute;
  left: 395px;
  top: 458px;
  z-index: 10;
}
.s3-btn {
  height: 35px;
  padding: 0 18px;
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
.s3-btn:active:not(:disabled) {
  transform: scale(0.96);
}
.s3-btn:focus-visible {
  box-shadow: 0 0 0 3px #236f7a;
}
.s3-btn--back {
  min-width: 64px;
  background-color: #bddfd8;
  border-color: #8ab8b0;
  color: #143833;
}
.s3-btn--back:hover:not(:disabled) {
  background-color: #a8d5cc;
}
.s3-btn--next {
  min-width: 62px;
  background-color: #fdee8e;
  border-color: #d4c65e;
  color: #232323;
  cursor: pointer;
}
.s3-btn--next:hover:not(:disabled) {
  background-color: #f5e478;
}

/* ---------- 5. CC & Play/Pause Controls directly below Nurse Anna ---------- */
.s3-audio {
  position: absolute;
  left: 565px;
  top: 444px;
  z-index: 20;
  display: flex;
  align-items: center;
  gap: 8px;
}
.s3-audio .audio-cc-btn svg {
  width: 52px !important;
  height: 47px !important;
}
.s3-audio .audio-play-btn svg {
  width: 70px !important;
  height: 47px !important;
}

/* ==========================================================
   Mobile-First Responsive Layout (< 768px)
   ========================================================== */
@media (max-width: 767px) {
  .s3-root {
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
  .s3-stage {
    position: relative !important;
    width: 100% !important;
    max-width: 360px !important;
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
  .s3-heading {
    position: static !important;
    left: auto !important;
    top: auto !important;
    width: 100% !important;
    max-width: 100% !important;
    font-size: 15px !important;
    line-height: 1.35 !important;
    font-weight: 700 !important;
    text-align: left !important;
    color: #232323 !important;
    margin: 0 0 10px 0 !important;
    padding: 0 4px !important;
  }
  .s3-bubble {
    position: relative !important;
    left: auto !important;
    top: auto !important;
    width: 285px !important;
    max-width: 95% !important;
    height: 172px !important;
    margin: 4px auto 0 auto !important;
    z-index: 1 !important;
    pointer-events: none !important;
  }
  .s3-bubble-svg {
    position: absolute !important;
    inset: 0 !important;
    width: 100% !important;
    height: 100% !important;
  }
  .s3-bubble-text-wrap {
    position: absolute !important;
    top: 45% !important;
    left: 48% !important;
    transform: translate(-50%, -50%) !important;
    width: 78% !important;
    max-width: 228px !important;
    padding: 0 !important;
    margin: 0 !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    justify-content: center !important;
    text-align: center !important;
  }
  .s3-bubble-text {
    font-size: 13.5px !important;
    line-height: 1.4 !important;
    font-weight: 500 !important;
    color: #1a2e2b !important;
    text-align: center !important;
    display: block !important;
    margin: 0 !important;
  }
  .s3-bubble-line {
    display: block !important;
    width: 100% !important;
    text-align: center !important;
  }
  .s3-nurse {
    position: relative !important;
    left: auto !important;
    top: auto !important;
    width: 95px !important;
    height: 160px !important;
    margin-top: -30px !important;
    margin-left: auto !important;
    margin-right: 20px !important;
    z-index: 2 !important;
    pointer-events: none !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
  }
  .s3-nurse-img {
    width: 100% !important;
    height: 100% !important;
    object-fit: contain !important;
  }
  .s3-audio {
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
  .s3-audio .audio-cc-btn svg {
    width: 38px !important;
    height: 34px !important;
  }
  .s3-audio .audio-play-btn svg {
    width: 48px !important;
    height: 34px !important;
  }
}
`;

export interface Slide3EfficacyScreenProps {
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

export function Slide3EfficacyScreen({
  isSpanish,
  medicationName,
  onNext,
  onBack,
  loading = false,
  audioSrc,
  stepId,
  locale,
  transcriptText,
}: Slide3EfficacyScreenProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => headingRef.current?.focus(), 50);
    return () => clearTimeout(timer);
  }, []);

  // Responsive stage scaling that fits container with zero distortion across all viewports
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

  const rawTitle = isSpanish
    ? "Muchos niños han tomado [name] porque es el mejor para tratar infecciones comunes de oído, senos paranasales y garganta. También es uno de los mejores antibióticos para adultos."
    : "Many kids have had [ name ] because it's the best for treating common ear, sinus and throat infections. It is also one of the best antibiotics in adults, too.";

  const titleText = medicationName && medicationName.trim()
    ? resolveMedicineToken(rawTitle, medicationName, isSpanish)
    : (isSpanish
        ? "Muchos niños han tomado [name] porque es el mejor para tratar infecciones comunes de oído, senos paranasales y garganta. También es uno de los mejores antibióticos para adultos."
        : "Many kids have had [ name ] because it's the best for treating common ear, sinus and throat infections. It is also one of the best antibiotics in adults, too.");

  const resolvedName = medicationName && medicationName.trim()
    ? medicationName
    : (isSpanish ? "[Name]" : "[Name]");

  return (
    <div id="slide-content" className="s3-root" ref={rootRef}>
      <style>{SLIDE3_CSS}</style>

      <div className="s3-stage" style={{ transform: `scale(${scale})` }}>
        {/* 1. Statement Heading */}
        <h1 ref={headingRef} tabIndex={-1} className="s3-heading">
          {titleText}
        </h1>

        {/* 2. Speech Bubble */}
        <div className="s3-bubble">
          <svg
            className="s3-bubble-svg"
            viewBox="0 0 520 340"
            fill="none"
            aria-hidden="true"
          >
            <defs>
              <pattern id="s3-bubble-dots" width="18" height="18" patternUnits="userSpaceOnUse">
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
            <path d={BUBBLE_PATH} fill="url(#s3-bubble-dots)" />

            {/* Soft teal outline */}
            <path
              d={BUBBLE_PATH}
              fill="none"
              stroke="#8ebfbb"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          {/* Centered Speech Text inside oval body */}
          <div className="s3-bubble-text-wrap">
            <p className="s3-bubble-text">
              {isSpanish ? (
                <>
                  <span className="s3-bubble-line">{resolvedName} es un medicamento maravilloso,</span>
                  <span className="s3-bubble-line">pero como todos los antibióticos no funciona</span>
                  <span className="s3-bubble-line">bien para los resfriados comunes</span>
                  <span className="s3-bubble-line">o la gripe.</span>
                </>
              ) : (
                <>
                  <span className="s3-bubble-line">{resolvedName} is a wonder drug, but</span>
                  <span className="s3-bubble-line">like all antibiotics it doesn&apos;t</span>
                  <span className="s3-bubble-line">work well for common colds</span>
                  <span className="s3-bubble-line">or the flu.</span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* 3. Nurse Anna standing on bottom-right, head directly under bubble tail */}
        <div className="s3-nurse">
          <img
            src="/images/nurse-anna.png"
            alt={isSpanish ? "Ilustración de la enfermera Anna" : "Nurse Anna"}
            className="s3-nurse-img"
            draggable={false}
            aria-hidden="true"
          />
        </div>

        {/* 5. Caption (CC) & Play/Pause controls directly below Nurse Anna */}
        <div className="s3-audio">
          <AudioPlayer
            audioSrc={audioSrc}
            stepId={stepId || "slide3_efficacy"}
            locale={locale || (isSpanish ? "es" : "en")}
            transcriptText={transcriptText || titleText}
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

export default Slide3EfficacyScreen;
