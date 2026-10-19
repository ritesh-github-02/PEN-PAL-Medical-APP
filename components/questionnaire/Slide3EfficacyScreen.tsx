"use client";

import React, { useRef, useEffect, useState } from "react";
import AudioPlayer from "./AudioPlayer";
import { resolveMedicineToken } from "@/lib/token-engine";
import SlideNavigationButtons from "./SlideNavigationButtons";

/* ==========================================================
   Slide3EfficacyScreen – Improved Speech Bubble & Responsive Layout
   - Left-aligned bold statement across top-left
   - Improved smooth cubic Bézier speech bubble with paper dot grid
   - Speech bubble tail tip at (312, 244) landing directly on Nurse Anna's hair
   - Perfectly centered speech bubble text with 4-side padding
   - Nurse Anna standing on right under bubble tail
   - Standardized bottom-pinned SlideNavigationButtons
   - Integrated AudioPlayer narration controls
   ========================================================== */

const STAGE_W = 750;
const STAGE_H = 530;

/* Smooth cubic Bézier geometry with tail pointing down toward Anna's head (Desktop) */
const BUBBLE_BEZIER_PATH_DESKTOP =
  "M 182.5 12 " +
  "C 275 12, 350 52, 350 101 " +
  "C 350 138, 318 168, 268 180 " +
  "C 285 198, 305 222, 312 244 " +
  "C 290 226, 258 206, 222 188 " +
  "C 209 189.5, 196 190, 182.5 190 " +
  "C 90 190, 15 150, 15 101 " +
  "C 15 52, 90 12, 182.5 12 " +
  "Z";

/* Decreased, proportionate cubic Bézier tail for mobile portrait with proper space */
const BUBBLE_BEZIER_PATH_MOBILE =
  "M 182.5 12 " +
  "C 275 12, 350 52, 350 101 " +
  "C 350 138, 318 168, 268 180 " +
  "C 278 191, 290 205, 294 218 " +
  "C 276 208, 251 198, 222 188 " +
  "C 209 189.5, 196 190, 182.5 190 " +
  "C 90 190, 15 150, 15 101 " +
  "C 15 52, 90 12, 182.5 12 " +
  "Z";

const SLIDE3_CSS = `
.s3-bubble-path-desktop {
  display: block;
}
.s3-bubble-path-mobile {
  display: none;
}

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

/* ---------- 1. Left-aligned Statement Heading ---------- */
.s3-heading {
  position: absolute;
  left: 42px;
  top: 64px;
  width: 365px;
  max-width: 375px;
  margin: 0;
  padding: 0;
  text-align: left;
  font-size: 20px;
  line-height: 1.4;
  font-weight: 700;
  letter-spacing: -0.012em;
  color: #232323;
  outline: none;
}
.s3-heading:focus-visible {
  box-shadow: 0 0 0 2px #236f7a;
}

/* ---------- 2. Speech Bubble on Right (Tail landing on Anna's hair) ---------- */
.s3-bubble-wrap {
  position: absolute;
  left: 418px;
  top: 38px;
  width: 290px;
  height: 191px;
  filter: drop-shadow(2.5px 3.5px 0px #1a3532);
  z-index: 5;
  pointer-events: none;
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
  transform: translate(-50%, -50%);
  width: 76%;
  max-width: 205px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  pointer-events: none;
}

.s3-bubble-text {
  margin: 0;
  padding: 0;
  font-size: 12.2px;
  line-height: 1.42;
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

/* ---------- 3. Nurse Anna standing with hair under bubble tail ---------- */
.s3-nurse-wrap {
  position: absolute;
  left: 596px;
  top: 194px;
  width: 114px;
  height: 220px;
  z-index: 10;
  pointer-events: none;
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

/* ---------- 4. Caption & Play/Pause Controls ---------- */
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
  .s3-bubble-path-desktop {
    display: none !important;
  }
  .s3-bubble-path-mobile {
    display: block !important;
  }
  .s3-root {
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
    line-height: 1.36 !important;
    font-weight: 700 !important;
    text-align: left !important;
    color: #232323 !important;
    margin: 0 0 10px 0 !important;
    padding: 0 4px !important;
  }
  .s3-characters-group {
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    justify-content: center !important;
    position: relative !important;
    width: 100% !important;
    margin-top: 2px !important;
  }
  .s3-bubble-wrap {
    position: relative !important;
    left: auto !important;
    top: auto !important;
    width: 260px !important;
    height: 172px !important;
    margin: 0 auto !important;
    filter: drop-shadow(2px 3px 0px #1a3532) !important;
  }
  .s3-bubble-text-wrap {
    top: 39% !important;
    left: 48% !important;
    width: 76% !important;
    max-width: 185px !important;
  }
  .s3-bubble-text {
    font-size: 11px !important;
    line-height: 1.36 !important;
  }
  .s3-nurse-wrap {
    position: relative !important;
    left: auto !important;
    top: auto !important;
    width: 95px !important;
    height: 170px !important;
    margin-top: -4px !important;
    margin-left: auto !important;
    margin-right: 28px !important;
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

/* Tablet Portrait Enhancements (481px to 767px) */
@media (min-width: 481px) and (max-width: 767px) {
  .s3-stage {
    max-width: 440px !important;
  }
  .s3-heading {
    font-size: 16px !important;
  }
  .s3-bubble-wrap {
    width: 285px !important;
    height: 188px !important;
  }
  .s3-bubble-text-wrap {
    max-width: 200px !important;
  }
  .s3-bubble-text {
    font-size: 12px !important;
  }
  .s3-nurse-wrap {
    width: 108px !important;
    height: 195px !important;
    margin-top: -6px !important;
  }
}

/* ==========================================================
   Mobile & Tablet Landscape Layout (< 520px height)
   ========================================================== */
@media (orientation: landscape) and (max-height: 520px) {
  .s3-root {
    overflow-y: auto !important;
    overflow-x: hidden !important;
    padding: 0.5rem 1rem 3.5rem 1rem !important;
  }
  .s3-stage {
    display: flex !important;
    flex-direction: row !important;
    align-items: center !important;
    justify-content: center !important;
    gap: 16px !important;
    width: 100% !important;
    max-width: 680px !important;
    height: auto !important;
    min-height: auto !important;
    transform: none !important;
    padding: 0 !important;
    margin: 0 auto !important;
  }
  .s3-heading {
    position: relative !important;
    left: auto !important;
    top: auto !important;
    width: 48% !important;
    font-size: 14.5px !important;
    line-height: 1.34 !important;
    margin: 0 !important;
  }
  .s3-characters-group {
    display: flex !important;
    flex-direction: row !important;
    align-items: center !important;
    justify-content: center !important;
    width: 48% !important;
    position: relative !important;
    margin: 0 !important;
  }
  .s3-bubble-wrap {
    position: relative !important;
    left: auto !important;
    top: auto !important;
    width: 220px !important;
    height: 145px !important;
    margin: 0 !important;
  }
  .s3-bubble-text-wrap {
    max-width: 155px !important;
  }
  .s3-bubble-text {
    font-size: 10px !important;
    line-height: 1.3 !important;
  }
  .s3-nurse-wrap {
    position: relative !important;
    left: auto !important;
    top: auto !important;
    width: 80px !important;
    height: 150px !important;
    margin: 0 0 0 -18px !important;
  }
  .s3-audio {
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

export function Slide3EfficacyScreen({
  isSpanish = false,
  medicationName,
  onNext,
  onBack,
  loading = false,
  audioSrc = isSpanish ? "/audio/exported/slide3_efficacy_es.mp3" : "/audio/exported/slide3_efficacy_en.mp3",
  stepId = "slide3_efficacy",
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

  const rawHeading = isSpanish
    ? "Muchos niños han tomado [name] porque es el mejor para tratar infecciones comunes de oído, senos paranasales y garganta. También es uno de los mejores antibióticos para adultos."
    : "Many kids have had [name] because it's the best for treating common ear, sinus and throat infections. It is also one of the best antibiotics in adults, too.";

  const resolvedName = medicationName && medicationName.trim()
    ? medicationName.trim()
    : (isSpanish ? "Amoxicilina" : "Amoxicillin");

  const headingText = resolveMedicineToken(rawHeading, resolvedName, isSpanish);

  const spokenText = isSpanish
    ? `${headingText} ${resolvedName} es un medicamento maravilloso, pero como todos los antibióticos no funciona bien para los resfriados comunes o la gripe.`
    : `${headingText} ${resolvedName} is a wonder drug, but like all antibiotics it doesn't work well for common colds or the flu.`;

  return (
    <div
      id="slide-content"
      className="s3-root"
      ref={rootRef}
      role="region"
      aria-roledescription="slide"
      aria-labelledby="s3-screen-heading"
    >
      <style dangerouslySetInnerHTML={{ __html: SLIDE3_CSS }} />

      <div className="s3-stage" style={{ transform: `scale(${scale})` }}>
        {/* 1. Left-aligned Bold Statement */}
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="s3-heading"
          id="s3-screen-heading"
        >
          {headingText}
        </h1>

        {/* Grouping for mobile responsive arrangement */}
        <div className="s3-characters-group">
          {/* 2. Speech Bubble with Tail Landing on Nurse Anna's Hair */}
          <div
            className="s3-bubble-wrap"
            role="region"
            aria-label={isSpanish ? "Burbuja de diálogo: Enfermera Anna" : "Speech bubble: Nurse Anna"}
          >
            <svg
              className="s3-bubble-svg"
              viewBox="0 0 380 250"
              fill="none"
              aria-hidden="true"
              focusable="false"
            >
              <defs>
                <pattern
                  id="s3-card-dot-pattern"
                  width="16"
                  height="16"
                  patternUnits="userSpaceOnUse"
                >
                  <circle cx="8" cy="8" r="0.75" fill="#cadada" opacity="0.6" />
                </pattern>
              </defs>

              {/* Desktop: Smooth cubic Bézier body */}
              <path
                className="s3-bubble-path-desktop"
                d={BUBBLE_BEZIER_PATH_DESKTOP}
                fill="#ffffff"
                stroke="#7baea9"
                strokeWidth="3"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              <path
                className="s3-bubble-path-desktop"
                d={BUBBLE_BEZIER_PATH_DESKTOP}
                fill="url(#s3-card-dot-pattern)"
              />

              {/* Mobile: Decreased tail design with proper space above Nurse Anna */}
              <path
                className="s3-bubble-path-mobile"
                d={BUBBLE_BEZIER_PATH_MOBILE}
                fill="#ffffff"
                stroke="#7baea9"
                strokeWidth="3"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              <path
                className="s3-bubble-path-mobile"
                d={BUBBLE_BEZIER_PATH_MOBILE}
                fill="url(#s3-card-dot-pattern)"
              />
            </svg>

            {/* Centered Speech Bubble Text with guaranteed padding on all 4 sides */}
            <div className="s3-bubble-text-wrap">
              <p className="s3-bubble-text">
                {isSpanish ? (
                  <>
                    <span className="s3-bubble-line">{resolvedName} es un medicamento maravilloso,</span>
                    <span className="s3-bubble-line">pero como todos los antibióticos</span>
                    <span className="s3-bubble-line">no funciona bien para los resfriados</span>
                    <span className="s3-bubble-line">comunes o la gripe.</span>
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

          {/* 3. Nurse Anna standing with hair under bubble tail */}
          <div className="s3-nurse-wrap">
            <img
              src="/images/nurse-anna.png"
              alt={isSpanish ? "Ilustración de la enfermera Anna" : "Nurse Anna"}
              className="s3-nurse-img"
              width="134"
              height="258"
              draggable={false}
              aria-hidden="true"
            />
          </div>
        </div>

        {/* 4. Caption (CC) & Play/Pause Controls */}
        <div className="s3-audio">
          <AudioPlayer
            audioSrc={audioSrc}
            stepId={stepId || "slide3_efficacy"}
            locale={locale || (isSpanish ? "es" : "en")}
            transcriptText={transcriptText || spokenText}
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

export default Slide3EfficacyScreen;
