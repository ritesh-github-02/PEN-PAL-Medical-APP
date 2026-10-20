"use client";

import { useEffect, useRef, useState } from "react";
import AudioPlayer from "./AudioPlayer";
import SlideNavigationButtons from "./SlideNavigationButtons";
import { resolveMedicineToken } from "@/lib/token-engine";

export interface Slide3EfficacyScreenProps {
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

/** Fixed design stage, scaled to fit on tablet/desktop (same convention as the other slides). */
const STAGE_W = 896;
const STAGE_H = 620;

const HEADING_EN =
  "Many kids have had [name] because it's the best for treating common ear, sinus and throat infections. It is also one of the best antibiotics in adults, too.";
const HEADING_ES =
  "Muchos niños han tomado [name] porque es el mejor para tratar infecciones comunes de oído, senos paranasales y garganta. También es uno de los mejores antibióticos para adultos.";
const BUBBLE_EN =
  "[name] is a wonder drug, but like all antibiotics it doesn't work well for common colds or the flu.";
const BUBBLE_ES =
  "[name] es un medicamento maravilloso, pero como todos los antibióticos no funciona bien para los resfriados comunes o la gripe.";

/** Speech-bubble artwork (viewBox 0 0 320 220). */
const BUBBLE_PATH =
  "M 160.424 10.4243 C 241.879 10.4243 307.915 45.4852 307.915 88.7303 " +
  "C 307.915 121.168 279.799 147.469 235.875 158.077 " +
  "C 250.795 173.877 268.358 194.945 274.503 214.266 " +
  "C 255.19 198.461 227.094 180.902 195.483 165.1 " +
  "C 184.067 166.417 172.399 167.036 160.424 167.036 " +
  "C 78.9698 167.036 12.9333 131.975 12.9333 88.7303 " +
  "C 12.9333 45.4852 78.9698 10.4243 160.424 10.4243 Z";

/**
 * Stacked layout for phones. Declared once and reused for both the media query
 * and the explicit `variant="mobile"` mode instead of duplicating ~120 lines.
 */
const mobileLayout = (scope: string) => `
  ${scope} {
    overflow-y: auto;
    overflow-x: hidden;
    height: auto;
    min-height: 0;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    padding: 0.85rem 0.75rem 1rem;
  }
  ${scope} .s3-stage {
    width: 100%;
    max-width: 360px;
    height: auto;
    transform: none !important;
    padding: 16px 14px 14px;
    border-radius: 24px;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
  }
  ${scope} .s3-body {
    position: static;
    display: flex;
    flex-direction: column;
    gap: 10px;
    height: auto;
  }
  ${scope} .s3-heading {
    position: static;
    width: 100%;
    font-size: 15.5px;
    line-height: 1.4;
  }
  ${scope} .s3-character {
    position: static;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    height: auto;
  }
  ${scope} .s3-bubble {
    position: static;
    width: min(320px, 100%);
    height: auto;
    aspect-ratio: 320 / 220;
    margin: 0 auto;
  }
  ${scope} .s3-bubble-text {
    font-size: 12.5px;
    line-height: 1.38;
  }
  ${scope} .s3-bubble-text--long {
    font-size: 12px;
    line-height: 1.34;
  }
  ${scope} .s3-nurse {
    position: static;
    width: 105px;
    height: 190px;
    margin: -18px 24px 0 auto;
  }
  ${scope} .s3-footer {
    flex-direction: column;
    gap: 6px;
    align-items: center;
    margin-top: 8px;
  }
  ${scope} .s3-footer .slide-nav-flow {
    position: static !important;
    left: auto !important;
    top: auto !important;
    transform: none !important;
    width: auto !important;
    margin: 0 !important;
  }
`;

const SLIDE3_CSS = `
.s3-root,
.s3-root *,
.s3-root *::before,
.s3-root *::after {
  box-sizing: border-box;
}

.s3-root {
  position: relative;
  display: flex;
  flex: 1 1 0%;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  color: #142724;
  font-family: "Plus Jakarta Sans", "Inter", system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
}

/* Card that scales as one composition — no reflow, no overlap at any width. */
.s3-stage {
  position: relative;
  display: flex;
  flex: none;
  flex-direction: column;
  width: ${STAGE_W}px;
  height: ${STAGE_H}px;
  padding: 34px 50px 24px;
  transform-origin: center center;
  background-color: #f6faf0;
  border: 1px solid rgba(120, 165, 155, 0.28);
  border-radius: 28px;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

.s3-body {
  position: relative;
  flex: 1 1 auto;
  min-height: 0;
}

/* 1. Statement heading (WCAG AAA contrast: #142724 on #f6faf0 ≈ 14.7:1) */
.s3-heading {
  position: absolute;
  left: 0;
  top: 6px;
  width: 468px;
  margin: 0;
  padding: 0;
  color: #142724;
  font-size: 20px;
  font-weight: 700;
  line-height: 1.38;
  letter-spacing: -0.012em;
  outline: none;
}

.s3-heading:focus-visible {
  outline: 2px dashed #143833;
  outline-offset: 4px;
  border-radius: 4px;
}

/* 2. Character column: speech bubble + Nurse Anna */
.s3-character {
  position: absolute;
  right: 0;
  top: 0;
  width: 352px;
  height: 100%;
}

.s3-bubble {
  position: absolute;
  right: 18px;
  top: 8px;
  width: 334px;
  height: 220px;
  margin: 0;
  filter: drop-shadow(2.5px 3.5px 0 #1a3532);
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
  top: 39%;
  left: 48%;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 76%;
  max-width: 225px;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.s3-bubble-text {
  margin: 0;
  color: #142724;
  font-size: 13.5px;
  font-weight: 700;
  line-height: 1.44;
  letter-spacing: -0.005em;
  text-align: center;
  overflow-wrap: anywhere;
  hyphens: auto;
}

/* Longer brand names (e.g. "Amoxicillin Clavulanate") need a touch more room */
.s3-bubble-text--long {
  font-size: 12px;
  line-height: 1.34;
}

.s3-nurse {
  position: absolute;
  right: 32px;
  top: 186px;
  width: 132px;
  height: 260px;
  pointer-events: none;
  user-select: none;
}

.s3-nurse-img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  user-select: none;
  -webkit-user-drag: none;
}

/* 3. Footer: navigation stays centred, audio controls sit on the right */
.s3-footer {
  position: relative;
  display: flex;
  flex: none;
  align-items: center;
  justify-content: flex-end;
  min-height: 44px;
  margin-top: 8px;
}

.s3-footer .slide-nav-flow {
  position: absolute !important;
  left: 50% !important;
  right: auto !important;
  top: 50% !important;
  bottom: auto !important;
  width: auto !important;
  max-width: none !important;
  margin: 0 !important;
  transform: translate(-50%, -50%) !important;
  z-index: 30 !important;
}

.s3-audio {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

@media (max-width: 767px) {
${mobileLayout(".s3-root")}
}

${mobileLayout(".s3-root.is-mobile")}

@media (prefers-reduced-motion: reduce) {
  .s3-root *,
  .s3-root *::before,
  .s3-root *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
  }
}
`;

export function Slide3EfficacyScreen({
  isSpanish = false,
  medicationName,
  variant = "auto",
  onNext,
  onBack,
  loading = false,
  audioSrc,
  stepId = "slide3_efficacy",
  locale,
  transcriptText,
}: Slide3EfficacyScreenProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const [scale, setScale] = useState(1);

  const isEs = (locale ?? "").startsWith("es") || isSpanish;
  const activeLocale = isEs ? "es" : "en";

  // WCAG 2.4.3 — move reading order to the new heading (parent skips it on slide change).
  useEffect(() => {
    const frame = requestAnimationFrame(() => headingRef.current?.focus({ preventScroll: true }));
    return () => cancelAnimationFrame(frame);
  }, []);

  // Fit the fixed stage into the available frame. ResizeObserver covers window resizes too.
  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;

    const update = () => {
      if (variant === "mobile" || window.innerWidth < 768) {
        setScale(1);
        return;
      }
      const { clientWidth: w, clientHeight: h } = el;
      if (!w || !h) return;
      // Never upscale past the design size, never overflow the frame.
      setScale(Math.min((w - 24) / STAGE_W, (h - 24) / STAGE_H, 1));
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [variant]);

  // Single source of truth for the medication name, with a locale-aware fallback.
  const medName = medicationName?.trim() || (isEs ? "Amoxicilina" : "Amoxicillin");
  const headingText = resolveMedicineToken(isEs ? HEADING_ES : HEADING_EN, medName, isEs);
  const bubbleText = resolveMedicineToken(isEs ? BUBBLE_ES : BUBBLE_EN, medName, isEs);
  const isLongMedName = medName.length > 18;

  const effectiveAudioSrc =
    audioSrc ||
    (isEs ? "/audio/exported/slide3_efficacy_es.mp3" : "/audio/exported/slide3_efficacy_en.mp3");

  return (
    <div
      id="slide-content"
      ref={rootRef}
      className={`s3-root${variant === "mobile" ? " is-mobile" : variant === "desktop" ? " is-desktop" : ""}`}
      role="region"
      aria-roledescription="slide"
      aria-labelledby="s3-heading"
      lang={activeLocale}
    >
      <style dangerouslySetInnerHTML={{ __html: SLIDE3_CSS }} />

      <div className="s3-stage" style={{ transform: `scale(${scale})` }}>
        <div className="s3-body">
          <h1 ref={headingRef} tabIndex={-1} id="s3-heading" className="s3-heading">
            {headingText}
          </h1>

          <div className="s3-character">
            <figure className="s3-bubble" role="group" aria-label={isEs ? "Comentario de la enfermera Anna" : "Nurse Anna statement"}>
              <svg className="s3-bubble-svg" viewBox="0 0 320 220" fill="none" aria-hidden="true" focusable="false">
                <defs>
                  <pattern id="s3-dot-grid" width="16" height="16" patternUnits="userSpaceOnUse">
                    <circle cx="8" cy="8" r="0.75" fill="#cadada" opacity="0.6" />
                  </pattern>
                </defs>
                <path d={BUBBLE_PATH} fill="#ffffff" stroke="#7baea9" strokeWidth="2.8" strokeLinejoin="round" strokeLinecap="round" />
                <path d={BUBBLE_PATH} fill="url(#s3-dot-grid)" />
              </svg>

              <div className="s3-bubble-text-wrap">
                <blockquote className={`s3-bubble-text${isLongMedName ? " s3-bubble-text--long" : ""}`}>
                  {bubbleText}
                </blockquote>
              </div>
            </figure>

            <div className="s3-nurse" aria-hidden="true">
              <img src="/images/nurse-anna.png" alt="" className="s3-nurse-img" draggable={false} />
            </div>
          </div>
        </div>

        <footer className="s3-footer">
          <SlideNavigationButtons onBack={onBack} onNext={onNext} isSpanish={isEs} loading={loading} />

          <div className="s3-audio">
            <AudioPlayer
              audioSrc={effectiveAudioSrc}
              stepId={stepId}
              locale={activeLocale}
              transcriptText={transcriptText || `${headingText} ${bubbleText}`}
              size="large"
            />
          </div>
        </footer>
      </div>
    </div>
  );
}

export default Slide3EfficacyScreen;
