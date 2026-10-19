"use client";

import React, { useState, useRef, useEffect } from "react";
import AudioPlayer from "./AudioPlayer";
import SlideNavigationButtons from "./SlideNavigationButtons";

export interface Slide5PrevalenceScreenProps {
  isSpanish?: boolean;
  medicationName?: string;
  variant?: "auto" | "desktop" | "mobile";
  onNext?: () => void;
  onBack?: () => void;
  loading?: boolean;
  audioSrc?: string;
  stepId?: string;
  locale?: string;
  transcriptText?: string;
}

const STAGE_W = 750;
const STAGE_H = 530;

const SLIDE5_CSS = `
/* ------------------------------------------------------------
   WCAG 2.1 / 2.2 Level AAA Accessibility & Stage Layout
   ------------------------------------------------------------ */
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
  color: #232323;
}

.s5-stage {
  position: relative;
  width: ${STAGE_W}px;
  height: ${STAGE_H}px;
  flex: none;
  transform-origin: center center;
  background-color: #fafdf3;
}

/* 1. "Did You Know?" Yellow Badge (WCAG 1.4.3 AAA Contrast: #232323 on #feff9f = 13.8:1) */
.s5-badge {
  position: absolute;
  left: 38px;
  top: 28px;
  min-width: 195px;
  height: 60px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 24px;
  background-color: #feff9f;
  border: 1.8px solid #236f7a;
  border-radius: 22px;
  box-shadow: 0 4px 6px rgba(34, 105, 118, 0.25);
  text-align: center;
  z-index: 5;
}

.s5-badge-title {
  margin: 0;
  font-size: 21px;
  line-height: 1.2;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: #232323;
}

/* 2. Statement Text (Left Column, WCAG 1.4.3 AAA Contrast: #232323 on #fafdf3 = 16.5:1) */
.s5-text-wrap {
  position: absolute;
  left: 38px;
  top: 112px;
  width: 420px;
  margin: 0;
  padding: 0;
  z-index: 5;
}

.s5-heading {
  font-size: 20px;
  line-height: 1.45;
  font-weight: 500;
  color: #232323;
  margin: 0;
  padding: 0;
  letter-spacing: -0.012em;
  text-align: left;
  outline: none;
}

.s5-heading:focus-visible {
  outline: 2px dashed #143833;
  outline-offset: 4px;
  border-radius: 4px;
}

.s5-bold {
  font-weight: 800;
  font-size: 21.5px;
  color: #111827;
}

/* 3. Nurse Anna standing on Right holding bottle */
.s5-nurse {
  position: absolute;
  left: 492px;
  top: 68px;
  width: 200px;
  height: 350px;
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

/* Audio Player (Desktop provided by PenpalIntervention tablet frame, mobile inline) */
.s5-audio {
  display: none !important;
}

/* ==========================================================
   Mobile Responsive Layout (< 768px)
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
    padding: 0.85rem 0.75rem 1rem 0.75rem !important;
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
    min-width: 160px !important;
    height: 44px !important;
    border-radius: 16px !important;
    margin: 2px auto 12px auto !important;
    padding: 0 16px !important;
  }

  .s5-badge-title {
    font-size: 16px !important;
  }

  .s5-text-wrap {
    position: static !important;
    width: 100% !important;
    max-width: 100% !important;
    margin: 0 0 12px 0 !important;
    padding: 0 !important;
  }

  .s5-heading {
    font-size: 15.5px !important;
    line-height: 1.4 !important;
    text-align: center !important;
  }

  .s5-bold {
    font-size: 16.5px !important;
  }

  .s5-nurse {
    position: relative !important;
    left: auto !important;
    right: auto !important;
    top: auto !important;
    width: 130px !important;
    height: 228px !important;
    margin: 4px auto 0 auto !important;
  }

  .s5-audio {
    display: flex !important;
    justify-content: center !important;
    margin: 10px auto 4px auto !important;
    z-index: 25 !important;
  }
}

/* Explicit mobile mode via variant="mobile" */
.s5-root.is-mobile {
  overflow-y: auto !important;
  overflow-x: hidden !important;
  -webkit-overflow-scrolling: touch !important;
  height: auto !important;
  min-height: auto !important;
  display: flex !important;
  flex-direction: column !important;
  justify-content: flex-start !important;
  align-items: center !important;
  padding: 0.85rem 0.75rem 1rem 0.75rem !important;
  gap: 0 !important;
}

.s5-root.is-mobile .s5-stage {
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

.s5-root.is-mobile .s5-badge {
  position: static !important;
  min-width: 160px !important;
  height: 44px !important;
  border-radius: 16px !important;
  margin: 2px auto 12px auto !important;
  padding: 0 16px !important;
}

.s5-root.is-mobile .s5-badge-title {
  font-size: 16px !important;
}

.s5-root.is-mobile .s5-text-wrap {
  position: static !important;
  width: 100% !important;
  max-width: 100% !important;
  margin: 0 0 12px 0 !important;
  padding: 0 !important;
}

.s5-root.is-mobile .s5-heading {
  font-size: 15.5px !important;
  line-height: 1.4 !important;
  text-align: center !important;
}

.s5-root.is-mobile .s5-bold {
  font-size: 16.5px !important;
}

.s5-root.is-mobile .s5-nurse {
  position: relative !important;
  left: auto !important;
  right: auto !important;
  top: auto !important;
  width: 130px !important;
  height: 228px !important;
  margin: 4px auto 0 auto !important;
}

.s5-root.is-mobile .s5-audio {
  display: flex !important;
  justify-content: center !important;
  margin: 10px auto 4px auto !important;
  z-index: 25 !important;
}

/* Prefers-Reduced-Motion (WCAG 2.3.3) */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
  }
}
`;

export function Slide5PrevalenceScreen({
  isSpanish = false,
  medicationName,
  variant = "auto",
  onNext,
  onBack,
  loading = false,
  audioSrc,
  stepId = "slide5_prevalence",
  locale,
  transcriptText,
}: Slide5PrevalenceScreenProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const [scale, setScale] = useState(1);

  // Set programmatic focus on heading when slide mounts (WCAG 2.4.3 Focus Order)
  useEffect(() => {
    const timer = setTimeout(() => headingRef.current?.focus(), 50);
    return () => clearTimeout(timer);
  }, []);

  // Standardized dynamic responsive stage scaling across all viewports
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

  const effectiveAudioSrc =
    audioSrc ||
    (isSpanish
      ? "/audio/exported/screen2_statistics_es.mp3"
      : "/audio/exported/screen2_statistics_en.mp3");

  const variantClass = variant === "mobile" ? " is-mobile" : variant === "desktop" ? " is-desktop" : "";

  return (
    <div
      id="slide-content"
      ref={rootRef}
      className={`s5-root${variantClass}`}
      role="region"
      aria-roledescription="slide"
      aria-labelledby="s5-heading"
      lang={isSpanish ? "es" : "en"}
    >
      <style dangerouslySetInnerHTML={{ __html: SLIDE5_CSS }} />

      {/* Scaled stage container */}
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
            id="s5-heading"
            ref={headingRef}
            className="s5-heading"
            tabIndex={-1}
          >
            {isSpanish ? titleSpanish : titleEnglish}
          </h1>
        </div>

        {/* 3. Nurse Anna standing on Right holding bottle */}
        <div className="s5-nurse" aria-hidden="true">
          <img
            src="/images/nurse-anna-holding-bottle.png"
            alt={isSpanish ? "Ilustración de la enfermera Anna sosteniendo el frasco" : "Nurse Anna holding medicine bottle"}
            className="s5-nurse-img"
            draggable={false}
          />
        </div>

        {/* 4. Inline Audio Player for Mobile */}
        <div className="s5-audio">
          <AudioPlayer
            audioSrc={effectiveAudioSrc}
            stepId={stepId || "slide5_prevalence"}
            locale={locale || (isSpanish ? "es" : "en")}
            transcriptText={plainHeadingText}
            size="large"
          />
        </div>
      </div>

      {/* 5. Unified Slide Navigation Buttons (Back & Next) */}
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
