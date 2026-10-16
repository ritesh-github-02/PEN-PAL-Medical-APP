"use client";

import React, { useRef, useEffect, useState } from "react";
import AudioPlayer from "./AudioPlayer";
import { resolveMedicineToken } from "@/lib/token-engine";
import SlideNavigationButtons from "./SlideNavigationButtons";

/* ==========================================================
   Slide4AllergyBarrierScreen – Scoped Pixel-Perfect Stage Layout
   Exact Match to Reference Image:
   - Nurse Anna standing on left, mirrored horizontally, gesturing toward bubble
   - Large Speech Bubble on right with tail pointing down-left toward Anna
   - 4-line bold statement centered inside oval body
   - Centered Back and Next buttons at y = 544px (left: 352px & 483px)
   - Single CC & Play/Pause controls directly at left: 659px, y = 541px
   ========================================================== */

const STAGE_W = 750;
const STAGE_H = 530;

const SLIDE4_CSS = `
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
  overflow: hidden;
  background-color: #fafdf3;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: "Plus Jakarta Sans", "Inter", system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
  color: #262626;
}

.s4-stage {
  position: relative;
  width: ${STAGE_W}px;
  height: ${STAGE_H}px;
  flex: none;
  transform-origin: center center;
  background-color: #fafdf3;
}

/* ---------- 1. Nurse Anna standing on Left (Mirrored horizontally) ---------- */
.s4-nurse {
  position: absolute;
  left: 70px;
  top: 191px;
  width: 195px;
  height: 268px;
  pointer-events: none;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
}
.s4-nurse-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
  user-select: none;
  -webkit-user-drag: none;
  transform: scaleX(-1);
}

/* ---------- 2. Speech Bubble on Right (Tail pointing left toward Anna) ---------- */
.s4-bubble {
  position: absolute;
  left: 175px;
  top: 14px;
  width: 490px;
  height: 300px;
  pointer-events: none;
  z-index: 1;
}
.s4-bubble-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
}
.s4-bubble-text-wrap {
  position: absolute;
  top: 48%;
  left: 53.5%;
  transform: translate(-50%, -50%);
  width: 78%;
  max-width: 365px;
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
.s4-bubble-text {
  margin: 0;
  padding: 0;
  width: 100%;
  font-family: "Plus Jakarta Sans", "Inter", system-ui, -apple-system, sans-serif;
  font-size: 21px;
  line-height: 1.44;
  font-weight: 700;
  color: #232323;
  text-align: center;
  letter-spacing: -0.012em;
  outline: none;
  word-break: break-word;
  overflow-wrap: break-word;
}
.s4-bubble-text:focus-visible {
  box-shadow: 0 0 0 2px #236f7a;
}
.s4-bubble-line {
  display: block;
  text-align: center;
  margin: 0 auto;
  width: 100%;
}

/* ---------- 3. Centered Navigation Buttons (Back & Next) ---------- */
.s4-nav-back {
  position: absolute;
  left: 242px;
  top: 463px;
  z-index: 10;
}
.s4-nav-next {
  position: absolute;
  left: 373px;
  top: 463px;
  z-index: 10;
}
.s4-btn {
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
.s4-btn:active:not(:disabled) {
  transform: scale(0.96);
}
.s4-btn:focus-visible {
  box-shadow: 0 0 0 3px #236f7a;
}
.s4-btn--back {
  min-width: 64px;
  background-color: #bddfd8;
  border-color: #8ab8b0;
  color: #143833;
}
.s4-btn--back:hover:not(:disabled) {
  background-color: #a8d5cc;
}
.s4-btn--next {
  min-width: 62px;
  background-color: #fdee8e;
  border-color: #d4c65e;
  color: #232323;
  cursor: pointer;
}
.s4-btn--next:hover:not(:disabled) {
  background-color: #f5e478;
}

/* ---------- 4. CC & Play/Pause Controls ---------- */
.s4-audio {
  position: absolute;
  left: 549px;
  top: 455px;
  z-index: 20;
  display: flex;
  align-items: center;
  gap: 8px;
}
.s4-audio .audio-cc-btn svg {
  width: 52px !important;
  height: 47px !important;
}
.s4-audio .audio-play-btn svg {
  width: 70px !important;
  height: 47px !important;
}
`;

export interface Slide4AllergyBarrierScreenProps {
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

const BUBBLE_PATH_LEFT =
  "M 122.1,283.4 " +
  "C 124.2,284.6 128.8,287.9 134.9,290.7 " +
  "C 141.0,293.4 150.8,297.5 158.7,299.9 " +
  "C 166.6,302.3 174.8,303.8 182.4,305.3 " +
  "C 190.0,306.8 197.4,307.8 204.4,309.0 " +
  "C 211.4,310.2 217.5,312.1 224.5,312.7 " +
  "C 231.5,313.3 239.4,312.4 246.4,312.7 " +
  "C 253.4,313.0 259.8,314.5 266.5,314.5 " +
  "C 273.2,314.5 279.9,313.3 286.6,312.7 " +
  "C 293.3,312.1 299.4,311.4 306.7,310.8 " +
  "C 314.0,310.2 322.8,310.2 330.4,309.0 " +
  "C 338.0,307.8 344.5,305.3 352.4,303.5 " +
  "C 360.3,301.7 369.7,300.8 377.9,298.0 " +
  "C 386.1,295.3 393.2,291.3 401.7,287.0 " +
  "C 410.2,282.7 420.3,277.9 429.1,272.4 " +
  "C 437.9,266.9 446.2,261.1 454.7,254.1 " +
  "C 463.2,247.1 473.2,239.2 480.2,230.3 " +
  "C 487.2,221.5 493.0,211.4 496.7,201.0 " +
  "C 500.4,190.6 501.9,179.0 502.2,168.0 " +
  "C 502.5,157.0 500.9,146.0 498.5,135.0 " +
  "C 496.1,124.0 492.8,111.9 487.6,102.1 " +
  "C 482.4,92.3 475.4,84.0 467.5,76.4 " +
  "C 459.6,68.8 449.5,62.1 440.1,56.3 " +
  "C 430.6,50.5 420.2,45.6 410.8,41.6 " +
  "C 401.3,37.6 392.5,35.2 383.4,32.5 " +
  "C 374.3,29.8 364.5,27.0 356.0,25.2 " +
  "C 347.5,23.4 340.2,22.4 332.3,21.5 " +
  "C 324.4,20.6 316.1,20.3 308.5,19.7 " +
  "C 300.9,19.1 293.6,18.1 286.6,17.8 " +
  "C 279.6,17.5 274.1,17.5 266.5,17.8 " +
  "C 258.9,18.1 248.8,19.1 240.9,19.7 " +
  "C 233.0,20.3 226.3,20.6 219.0,21.5 " +
  "C 211.7,22.4 204.4,24.0 197.1,25.2 " +
  "C 189.8,26.4 183.0,27.0 175.1,28.8 " +
  "C 167.2,30.6 158.0,33.4 149.5,36.1 " +
  "C 141.0,38.9 132.8,41.6 124.0,45.3 " +
  "C 115.2,49.0 105.1,52.9 96.6,58.1 " +
  "C 88.1,63.3 81.3,69.7 72.8,76.4 " +
  "C 64.3,83.1 53.3,90.2 45.4,98.4 " +
  "C 37.5,106.7 29.6,115.8 25.3,125.9 " +
  "C 21.0,136.0 18.9,147.8 19.8,158.8 " +
  "C 20.7,169.8 26.2,181.4 30.8,191.8 " +
  "C 35.4,202.2 39.6,211.0 47.2,221.1 " +
  "C 54.8,231.2 71.6,247.0 76.5,252.2 " +
  "L 34.4,314.5 " +
  "L 122.1,283.4 " +
  "Z";

export function Slide4AllergyBarrierScreen({
  isSpanish,
  medicationName,
  onNext,
  onBack,
  loading = false,
  audioSrc,
  stepId,
  locale,
  transcriptText,
}: Slide4AllergyBarrierScreenProps) {
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
        setScale(Math.min(w / STAGE_W, h / STAGE_H));
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

  const rawText = isSpanish
    ? "[name] es uno de los mejores antibióticos. Pero muchos niños no lo reciben porque se cree que son alérgicos a él."
    : "[name] is one of the best antibiotics. But many kids do not get it because they are believed to be allergic to it.";

  const resolvedName = medicationName && medicationName.trim()
    ? medicationName
    : (isSpanish ? "[Nombre]" : "[Name]");

  const titleText = resolveMedicineToken(rawText, resolvedName, isSpanish);

  return (
    <div id="slide-content" className="s4-root" ref={rootRef}>
      <style>{SLIDE4_CSS}</style>

      <div className="s4-stage" style={{ transform: `scale(${scale})` }}>
        {/* 1. Nurse Anna on Left (Mirrored horizontally) */}
        <div className="s4-nurse">
          <img
            src="/images/nurse-anna.png"
            alt={isSpanish ? "Ilustración de la enfermera Anna" : "Nurse Anna"}
            className="s4-nurse-img"
            draggable={false}
            aria-hidden="true"
          />
        </div>

        {/* 2. Large Speech Bubble on Right */}
        <div className="s4-bubble">
          <svg
            className="s4-bubble-svg"
            viewBox="0 0 520 340"
            fill="none"
            aria-hidden="true"
          >
            <defs>
              <pattern id="s4-bubble-dots" width="18" height="18" patternUnits="userSpaceOnUse">
                <circle cx="9" cy="9" r="0.8" fill="#cadada" opacity="0.65" />
              </pattern>
            </defs>

            {/* Black shadow underneath */}
            <path
              d={BUBBLE_PATH_LEFT}
              transform="translate(4, 5)"
              fill="#000000"
              stroke="#000000"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* White bubble body */}
            <path d={BUBBLE_PATH_LEFT} fill="#ffffff" />

            {/* Subtle paper dot grid texture */}
            <path d={BUBBLE_PATH_LEFT} fill="url(#s4-bubble-dots)" />

            {/* Soft teal outline */}
            <path
              d={BUBBLE_PATH_LEFT}
              fill="none"
              stroke="#8ebfbb"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          {/* Centered Speech Text inside oval body */}
          <div className="s4-bubble-text-wrap">
            <h1 ref={headingRef} tabIndex={-1} className="s4-bubble-text">
              {isSpanish ? (
                <>
                  <span className="s4-bubble-line">{resolvedName} es uno de los mejores</span>
                  <span className="s4-bubble-line">antibióticos. Pero muchos niños no</span>
                  <span className="s4-bubble-line">lo reciben porque se cree</span>
                  <span className="s4-bubble-line">que son alérgicos a él.</span>
                </>
              ) : (
                <>
                  <span className="s4-bubble-line">{resolvedName} is one of the best</span>
                  <span className="s4-bubble-line">antibiotics. But many kids do</span>
                  <span className="s4-bubble-line">not get it because they are</span>
                  <span className="s4-bubble-line">believed to be allergic to it.</span>
                </>
              )}
            </h1>
          </div>
        </div>

        {/* 4. Caption (CC) & Play/Pause controls directly at right baseline */}
        <div className="s4-audio">
          <AudioPlayer
            audioSrc={audioSrc}
            stepId={stepId || "slide4_barrier"}
            locale={locale || (isSpanish ? "es" : "en")}
            transcriptText={transcriptText || titleText}
            size="large"
          />
        </div>
      </div>

      {/* 3. Centered Navigation Buttons (Back & Next) */}
      <SlideNavigationButtons
        onBack={onBack}
        onNext={onNext}
        isSpanish={isSpanish}
        loading={loading}
      />
    </div>
  );
}

export default Slide4AllergyBarrierScreen;
