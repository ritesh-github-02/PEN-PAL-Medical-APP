"use client";

import React, { useRef, useEffect, useState } from "react";
import AudioPlayer from "./AudioPlayer";
import { resolveMedicineToken } from "@/lib/token-engine";
import SlideNavigationButtons from "./SlideNavigationButtons";

/* ==========================================================
   Slide5PrevalenceScreen – Scoped Pixel-Perfect Stage Layout
   Exact Match to User Reference Image 1:
   - "Did You Know?" yellow rounded badge at top-left
   - Statement text on left with bold 100 & 95 numbers
   - Nurse Anna standing on right holding pink medicine bottle
   - Centered Back (left: 352px) & Next (left: 483px) buttons at y = 544px
   - Audio player at left: 659px, y = 541px
   ========================================================== */

const STAGE_W = 750;
const STAGE_H = 530;

const SLIDE5_CSS = `
.s5-root,
.s5-root *,
.s5-root *::before,
.s5-root *::after {
  box-sizing: border-box;
}

.s5-root {
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

.s5-stage {
  position: relative;
  width: ${STAGE_W}px;
  height: ${STAGE_H}px;
  flex: none;
  transform-origin: center center;
  background-color: #fafdf3;
}

/* ---------- 1. "Did You Know?" Yellow Badge (Top Left) ---------- */
.s5-badge {
  position: absolute;
  left: 41px;
  top: 8px;
  width: 205px;
  height: 75px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 16px;
  background-color: #feff9f;
  border: 1.8px solid #2b7f8f;
  border-radius: 22px;
  box-shadow: 0 4px 6px rgba(34, 105, 118, 0.35);
  text-align: center;
}
.s5-badge-title {
  margin: 0;
  font-size: 22px;
  line-height: 1.2;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: #232323;
  outline: none;
}
.s5-badge-title:focus-visible {
  box-shadow: 0 0 0 2px #236f7a;
}

/* ---------- 2. Statement Text (Left Column) ---------- */
.s5-text-wrap {
  position: absolute;
  left: 40px;
  top: 154px;
  width: 405px;
  max-width: 415px;
  margin: 0;
  padding: 0;
}
.s5-heading {
  font-size: 21.5px;
  line-height: 1.42;
  font-weight: 500;
  color: #232323;
  margin: 0;
  letter-spacing: -0.012em;
  text-align: left;
  outline: none;
}
.s5-heading:focus-visible {
  box-shadow: 0 0 0 2px #236f7a;
  border-radius: 4px;
}
.s5-bold {
  font-weight: 800;
  font-size: 23px;
  color: #111827;
}

/* ---------- 3. Nurse Anna holding Pink Bottle (Right) ---------- */
.s5-nurse {
  position: absolute;
  left: 493px;
  top: 88px;
  width: 194px;
  height: 385px;
  pointer-events: none;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
}
.s5-nurse-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
  user-select: none;
  -webkit-user-drag: none;
}

/* ---------- 4. Centered Navigation Buttons (Back & Next) ---------- */
.s5-nav-back {
  position: absolute;
  left: 271px;
  top: 468px;
  z-index: 10;
}
.s5-nav-next {
  position: absolute;
  left: 402px;
  top: 468px;
  z-index: 10;
}
.s5-btn {
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
.s5-btn:active:not(:disabled) {
  transform: scale(0.96);
}
.s5-btn:focus-visible {
  box-shadow: 0 0 0 3px #236f7a;
}
.s5-btn--back {
  min-width: 64px;
  background-color: #bddfd8;
  border-color: #8ab8b0;
  color: #143833;
}
.s5-btn--back:hover:not(:disabled) {
  background-color: #a8d5cc;
}
.s5-btn--next {
  min-width: 62px;
  background-color: #fdee8e;
  border-color: #d4c65e;
  color: #232323;
  cursor: pointer;
}
.s5-btn--next:hover:not(:disabled) {
  background-color: #f5e478;
}

/* ---------- 5. CC & Play/Pause Controls ---------- */
.s5-audio {
  position: absolute;
  left: 578px;
  top: 460px;
  z-index: 20;
  display: flex;
  align-items: center;
  gap: 8px;
}
.s5-audio .audio-cc-btn svg {
  width: 52px !important;
  height: 47px !important;
}
.s5-audio .audio-play-btn svg {
  width: 70px !important;
  height: 47px !important;
}
`;

export interface Slide5PrevalenceScreenProps {
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

export function Slide5PrevalenceScreen({
  isSpanish,
  medicationName,
  onNext,
  onBack,
  loading = false,
  audioSrc,
  stepId,
  locale,
  transcriptText,
}: Slide5PrevalenceScreenProps) {
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

  const resolvedName = medicationName && medicationName.trim()
    ? medicationName
    : (isSpanish ? "la penicilina" : "[name]");

  const titleText = isSpanish
    ? `La mayoría de las personas que piensan que son alérgicas a la penicilina pueden tomarla de manera segura. De cada 100 niños con alergia a ${resolvedName}, 95 pueden tomar ${resolvedName} sin tener una reacción.`
    : `Most people who think they are allergic to penicillin can safely take it. Out of 100 kids with a ${resolvedName} allergy, 95 can take ${resolvedName} without having a reaction.`;

  return (
    <div id="slide-content" className="s5-root" ref={rootRef}>
      <style>{SLIDE5_CSS}</style>

      <div className="s5-stage" style={{ transform: `scale(${scale})` }}>
        {/* 1. "Did You Know?" Yellow Badge */}
        <div className="s5-badge">
          <h2 tabIndex={-1} className="s5-badge-title">
            {isSpanish ? "¿Sabías que...?" : "Did You Know?"}
          </h2>
        </div>

        {/* 2. Statement Text on Left */}
        <div className="s5-text-wrap">
          <h1 ref={headingRef} tabIndex={-1} className="s5-heading">
            {isSpanish ? (
              <>
                La mayoría de las personas que piensan que son alérgicas a la penicilina pueden tomarla de manera segura. De cada <strong className="s5-bold">100</strong> niños con una alergia a {resolvedName}, <strong className="s5-bold">95</strong> pueden tomar {resolvedName} sin tener una reacción.
              </>
            ) : (
              <>
                Most people who think they are allergic to penicillin can safely take it. Out of <strong className="s5-bold">100</strong> kids with a {resolvedName} allergy, <strong className="s5-bold">95</strong> can take {resolvedName} without having a reaction.
              </>
            )}
          </h1>
        </div>

        {/* 3. Nurse Anna holding Pink Medicine Bottle on Right */}
        <div className="s5-nurse">
          <img
            src="/images/nurse-anna-holding-bottle.png"
            alt={isSpanish ? "La enfermera Anna sosteniendo un frasco de medicina" : "Nurse Anna holding a pink medicine bottle"}
            className="s5-nurse-img"
            draggable={false}
            aria-hidden="true"
          />
        </div>

        {/* 5. Caption (CC) & Play/Pause controls directly at right baseline */}
        <div className="s5-audio">
          <AudioPlayer
            audioSrc={audioSrc}
            stepId={stepId || "slide5_prevalence"}
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

export default Slide5PrevalenceScreen;
