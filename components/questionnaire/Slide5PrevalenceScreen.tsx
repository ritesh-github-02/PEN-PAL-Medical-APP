"use client";

import React, { useRef, useEffect, useState } from "react";
import AudioPlayer from "./AudioPlayer";
import SlideNavigationButtons from "./SlideNavigationButtons";

/* ==========================================================
   Slide5PrevalenceScreen – Scoped Pixel-Perfect Stage Layout
   - Yellow "Did You Know?" pill badge at top-left
   - Statement text with prominent bold 100 & 95 statistics
   - Nurse Anna standing on right holding pink medicine bottle
   - Standardized bottom-pinned SlideNavigationButtons
   - Integrated AudioPlayer narration controls
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
  left: 44px;
  top: 18px;
  min-width: 204px;
  height: 72px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 24px;
  background-color: #feff9f;
  border: 1.8px solid #2b7f8f;
  border-radius: 22px;
  box-shadow: 0 4px 6px rgba(34, 105, 118, 0.35);
  text-align: center;
  z-index: 5;
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
  left: 44px;
  top: 122px;
  width: 440px;
  max-width: 450px;
  margin: 0;
  padding: 0;
  z-index: 5;
}
.s5-heading {
  font-size: 21.5px;
  line-height: 1.44;
  font-weight: 500;
  color: #232323;
  margin: 0;
  padding: 0;
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

/* ---------- 3. Nurse Anna standing on Right holding bottle ---------- */
.s5-nurse {
  position: absolute;
  left: 495px;
  top: 32px;
  width: 205px;
  height: 410px;
  pointer-events: none;
  z-index: 4;
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
  filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.08));
}

.s5-audio {
  display: none !important;
}

/* ==========================================================
   Mobile-First Responsive Layout (< 768px)
   ========================================================== */
@media (max-width: 767px) {
  .s5-root {
    overflow-y: auto !important;
    overflow-x: hidden !important;
    -webkit-overflow-scrolling: touch !important;
    height: auto !important;
    min-height: auto !important;
    display: flex !important;
    flex-direction: column !important;
    justify-content: flex-start !important;
    align-items: center !important;
    padding: 0.85rem 0.85rem 1rem 0.85rem !important;
    gap: 0 !important;
  }
  .s5-stage {
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
  .s5-badge {
    position: static !important;
    left: auto !important;
    top: auto !important;
    min-width: 170px !important;
    height: 46px !important;
    border-radius: 16px !important;
    margin: 2px auto 12px auto !important;
    padding: 0 16px !important;
  }
  .s5-badge-title {
    font-size: 16px !important;
  }
  .s5-text-wrap {
    position: static !important;
    left: auto !important;
    top: auto !important;
    width: 100% !important;
    max-width: 100% !important;
    margin: 0 0 10px 0 !important;
    padding: 0 !important;
  }
  .s5-heading {
    font-size: 15.5px !important;
    line-height: 1.38 !important;
    text-align: center !important;
  }
  .s5-bold {
    font-size: 17px !important;
  }
  .s5-nurse {
    position: relative !important;
    left: auto !important;
    top: auto !important;
    width: 130px !important;
    height: 210px !important;
    margin: 4px auto 0 auto !important;
  }
  .s5-audio {
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
  .s5-audio .audio-cc-btn svg {
    width: 38px !important;
    height: 34px !important;
  }
  .s5-audio .audio-play-btn svg {
    width: 48px !important;
    height: 34px !important;
  }
}

/* Tablet Portrait Enhancements (481px to 767px) */
@media (min-width: 481px) and (max-width: 767px) {
  .s5-stage {
    max-width: 440px !important;
  }
  .s5-badge {
    min-width: 190px !important;
    height: 52px !important;
  }
  .s5-badge-title {
    font-size: 18px !important;
  }
  .s5-heading {
    font-size: 17px !important;
  }
  .s5-bold {
    font-size: 19px !important;
  }
  .s5-nurse {
    width: 150px !important;
    height: 240px !important;
  }
}

/* ==========================================================
   Mobile & Tablet Landscape Layout (< 520px height)
   ========================================================== */
@media (orientation: landscape) and (max-height: 520px) {
  .s5-root {
    overflow-y: auto !important;
    overflow-x: hidden !important;
    padding: 0.5rem 1rem 3.5rem 1rem !important;
  }
  .s5-stage {
    display: flex !important;
    flex-direction: row !important;
    align-items: center !important;
    justify-content: center !important;
    gap: 20px !important;
    width: 100% !important;
    max-width: 680px !important;
    height: auto !important;
    min-height: auto !important;
    transform: none !important;
    padding: 0 !important;
    margin: 0 auto !important;
  }
  .s5-badge {
    position: static !important;
    min-width: 160px !important;
    height: 42px !important;
    margin-bottom: 8px !important;
    padding: 0 14px !important;
  }
  .s5-badge-title {
    font-size: 15px !important;
  }
  .s5-text-wrap {
    position: static !important;
    width: 60% !important;
    margin: 0 !important;
  }
  .s5-heading {
    font-size: 14.5px !important;
    line-height: 1.34 !important;
    text-align: left !important;
  }
  .s5-bold {
    font-size: 16px !important;
  }
  .s5-nurse {
    position: relative !important;
    left: auto !important;
    top: auto !important;
    width: 100px !important;
    height: 180px !important;
    margin: 0 !important;
    flex-shrink: 0 !important;
  }
  .s5-audio {
    position: absolute !important;
    right: 12px !important;
    bottom: 8px !important;
    left: auto !important;
    top: auto !important;
    margin: 0 !important;
  }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.001ms !important;
    transition-duration: 0.001ms !important;
  }
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
  isSpanish = false,
  medicationName,
  onNext,
  onBack,
  loading = false,
  audioSrc = isSpanish ? "/audio/exported/screen2_statistics_es.mp3" : "/audio/exported/screen2_statistics_en.mp3",
  stepId = "slide5_prevalence",
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

  // Responsive stage scaling that fits container with zero distortion across viewports
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

  const medicine = medicationName && medicationName.trim()
    ? medicationName.trim()
    : (isSpanish ? "la amoxicilina" : "amoxicillin");
  const article = /^[aeiou]/i.test(medicine) ? "an" : "a";

  const titleEnglish = (
    <>
      Most people who think they are allergic to penicillin can safely take it. Out of{" "}
      <strong className="s5-bold">100</strong> kids with {article} {medicine} allergy,{" "}
      <strong className="s5-bold">95</strong> can take {medicine} without having a reaction.
    </>
  );

  const titleSpanish = (
    <>
      La mayoría de las personas que piensan que son alérgicas a la penicilina pueden tomarla de manera segura. De cada{" "}
      <strong className="s5-bold">100</strong> niños con una alergia a {medicine},{" "}
      <strong className="s5-bold">95</strong> pueden tomar {medicine} sin tener una reacción.
    </>
  );

  const plainHeadingText = transcriptText || (isSpanish
    ? `¿Sabías que...? La mayoría de las personas que piensan que son alérgicas a la penicilina pueden tomarla de manera segura. De cada 100 niños con una alergia a ${medicine}, 95 pueden tomar ${medicine} sin tener una reacción.`
    : `Did you know? Most people who think they are allergic to penicillin can safely take it. Out of 100 kids with ${article} ${medicine} allergy, 95 can take ${medicine} without having a reaction.`);

  return (
    <div
      id="slide-content"
      className="s5-root"
      ref={rootRef}
      role="region"
      aria-roledescription="slide"
      aria-labelledby="slide5-heading"
    >
      <style dangerouslySetInnerHTML={{ __html: SLIDE5_CSS }} />

      <div className="s5-stage" style={{ transform: `scale(${scale})` }}>
        {/* 1. "Did You Know?" Yellow Badge */}
        <div className="s5-badge" role="presentation">
          <span className="s5-badge-title">
            {isSpanish ? "¿Sabías que...?" : "Did You Know?"}
          </span>
        </div>

        {/* 2. Statement Text on Left Column */}
        <div className="s5-text-wrap">
          <h1
            id="slide5-heading"
            ref={headingRef}
            tabIndex={-1}
            className="s5-heading"
          >
            {isSpanish ? titleSpanish : titleEnglish}
          </h1>
        </div>

        {/* 3. Nurse Anna standing on Right holding bottle */}
        <div className="s5-nurse">
          <img
            src="/images/nurse-anna-holding-bottle.png"
            alt={isSpanish ? "Ilustración de la enfermera Anna sosteniendo el frasco" : "Nurse Anna holding medicine bottle"}
            className="s5-nurse-img"
            draggable={false}
            aria-hidden="true"
          />
        </div>

        {/* 4. Caption (CC) & Play/Pause Controls */}
        <div className="s5-audio">
          <AudioPlayer
            audioSrc={audioSrc}
            stepId={stepId || "slide5_prevalence"}
            locale={locale || (isSpanish ? "es" : "en")}
            transcriptText={plainHeadingText}
            size="large"
          />
        </div>
      </div>

      {/* 5. Standardized Navigation Buttons (Back & Next) pinned at slide bottom */}
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
