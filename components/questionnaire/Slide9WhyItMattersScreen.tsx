"use client";

import React, { useState, useRef, useEffect } from "react";
import AudioPlayer from "./AudioPlayer";
import { resolveMedicineToken } from "@/lib/token-engine";
import SlideNavigationButtons from "./SlideNavigationButtons";

/* ==========================================================
   Slide9WhyItMattersScreen – Scoped Pixel-Perfect Stage Layout
   Exact Match to User Reference Image (Slide 8 / Why It Matters):
   - 896 x 645 scaled stage with background #fafdf3
   - Top-left yellow pill badge ("Why does this matter?"):
     left: 119px, top: 66px, width: 310px, height: 74px with dark teal 3D drop shadow
   - Nurse Anna on the LEFT at left: 117px, top: 225px, width: 136px, height: 271px
     Flipped horizontally (scaleX(-1)) with hand pointed toward the right side
   - Right-side explanatory text & 4 bullet points at left: 270px, top: 174px, width: 512px
   - Centered Back (left: 352px) & Next (left: 483px) buttons at y = 544px
   - Single stage audio controls at left: 659px, y = 538px
   ========================================================== */

const STAGE_W = 750;
const STAGE_H = 530;

const SLIDE9_CSS = `
.s9-root,
.s9-root *,
.s9-root *::before,
.s9-root *::after {
  box-sizing: border-box;
}

.s9-root {
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

.s9-stage {
  position: relative;
  width: ${STAGE_W}px;
  height: ${STAGE_H}px;
  flex: none;
  transform-origin: center center;
  background-color: #fafdf3;
}

/* ---------- 1. Top-Left Yellow Header Badge ---------- */
.s9-badge {
  position: absolute;
  left: 39px;
  top: 12px;
  width: 310px;
  height: 74px;
  border-radius: 20px;
  background-color: #fdee8e;
  border: 2px solid #508e82;
  box-shadow: 0 5px 0 #3a6d65;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}
.s9-badge-title {
  margin: 0;
  font-family: inherit;
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.015em;
  color: #232323;
  text-align: center;
  outline: none;
}
.s9-badge-title:focus-visible {
  box-shadow: 0 0 0 2px #236f7a;
  border-radius: 4px;
}

/* ---------- 2. Nurse Anna on the LEFT (Pointed to the Right) ---------- */
.s9-nurse {
  position: absolute;
  left: 37px;
  top: 161px;
  width: 136px;
  height: 271px;
  z-index: 10;
  pointer-events: none;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}
.s9-nurse-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: bottom center;
  display: block;
}

/* ---------- 3. Right-Side Text & Bullet Points ---------- */
.s9-content {
  position: absolute;
  left: 195px;
  top: 114px;
  width: 515px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  z-index: 10;
}

.s9-intro {
  margin: 0;
  font-family: inherit;
  font-size: 19.5px;
  font-weight: 500;
  line-height: 1.38;
  color: #232323;
  letter-spacing: -0.01em;
  text-align: left;
}

.s9-bullets {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.s9-bullet-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  font-family: inherit;
  font-size: 19px;
  font-weight: 500;
  line-height: 1.36;
  color: #232323;
  letter-spacing: -0.01em;
  text-align: left;
}

.s9-bullet-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #232323;
  flex-shrink: 0;
  margin-top: 10px;
}

/* ---------- 4. Centered Navigation Buttons (Back & Next) ---------- */
.s9-nav-back {
  position: absolute;
  left: 272px;
  top: 462px;
  z-index: 20;
}
.s9-nav-next {
  position: absolute;
  left: 403px;
  top: 462px;
  z-index: 20;
}
.s9-btn {
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
.s9-btn:active:not(:disabled) {
  transform: scale(0.96);
}
.s9-btn:focus-visible {
  box-shadow: 0 0 0 3px #236f7a;
}
.s9-btn--back {
  width: 64px;
  background-color: #bddfd8;
  border-color: #8ab8b0;
  color: #143833;
}
.s9-btn--back:hover:not(:disabled) {
  background-color: #a8d5cc;
}
.s9-btn--next {
  width: 62px;
  background-color: #fdee8e;
  border-color: #d4c65e;
  color: #232323;
  cursor: pointer;
}
.s9-btn--next:hover:not(:disabled) {
  background-color: #f5e478;
}

/* ---------- 5. Caption (CC) & Play/Pause Controls ---------- */
.s9-audio {
  position: absolute;
  left: 579px;
  top: 454px;
  z-index: 20;
  display: flex;
  align-items: center;
  gap: 8px;
}
.s9-audio .audio-cc-btn svg {
  width: 52px !important;
  height: 47px !important;
}
.s9-audio .audio-play-btn svg {
  width: 70px !important;
  height: 47px !important;
}
`;

export interface Slide9WhyItMattersScreenProps {
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

export function Slide9WhyItMattersScreen({
  isSpanish,
  medicationName,
  onNext,
  onBack,
  loading = false,
  audioSrc,
  stepId = "slide9_why_it_matters",
  locale,
  transcriptText,
}: Slide9WhyItMattersScreenProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      headingRef.current?.focus();
    }, 50);
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

  const badgeTitle = isSpanish ? "¿Por qué es importante esto?" : "Why does this matter?";

  const rawIntro = isSpanish
    ? "Cuando un niño necesita antibióticos y se cree que tiene alergia a [name], recibe diferentes antibióticos que..."
    : "When a child needs antibiotics and is believed to have an allergy to [name], they receive different antibiotics that...";

  const rawBullets = [
    {
      en: "Are more likely to cause diarrhea or other side effects",
      es: "Tienen más probabilidades de causar diarrea u otros efectos secundarios",
    },
    {
      en: "Cost more than [name]",
      es: "Cuestan más que [name]",
    },
    {
      en: "Taste worse than [name]",
      es: "Tienen peor sabor que [name]",
    },
    {
      en: "May make an infection harder to treat in the future",
      es: "Pueden hacer que una infección sea más difícil de tratar en el futuro",
    },
  ];

  const introText = medicationName
    ? resolveMedicineToken(rawIntro, medicationName, isSpanish)
    : rawIntro;

  return (
    <div id="slide-content" className="s9-root" ref={rootRef}>
      <style>{SLIDE9_CSS}</style>

      <div className="s9-stage" style={{ transform: `scale(${scale})` }}>
        {/* 1. Top-Left Yellow Header Badge with 3D Teal Shadow */}
        <div className="s9-badge">
          <h1 ref={headingRef} tabIndex={-1} className="s9-badge-title">
            {badgeTitle}
          </h1>
        </div>

        {/* 2. Nurse Anna on the LEFT (Hand pointed toward the right) */}
        <div className="s9-nurse">
          <img
            src="/images/nurse-anna-explaining.png"
            alt={isSpanish ? "Ilustración de la enfermera Anna" : "Illustration of Nurse Anna"}
            className="s9-nurse-img"
          />
        </div>

        {/* 3. Right-Side Text & Explanatory Bullet List */}
        <div className="s9-content">
          <p className="s9-intro">
            {introText}
          </p>

          <ul className="s9-bullets">
            {rawBullets.map((b, idx) => {
              const raw = isSpanish ? b.es : b.en;
              const text = medicationName
                ? resolveMedicineToken(raw, medicationName, isSpanish)
                : raw;
              return (
                <li key={idx} className="s9-bullet-item">
                  <span className="s9-bullet-dot" aria-hidden="true" />
                  <span>{text}</span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* 5. Caption (CC) & Play/Pause controls directly at right baseline */}
        <div className="s9-audio">
          <AudioPlayer
            audioSrc={audioSrc}
            stepId={stepId}
            locale={locale || (isSpanish ? "es" : "en")}
            transcriptText={transcriptText || `${badgeTitle}. ${introText}`}
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

export default Slide9WhyItMattersScreen;
