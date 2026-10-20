"use client";

import React, { useRef, useEffect, useState } from "react";
import AudioPlayer from "./AudioPlayer";
import { resolveMedicineToken } from "@/lib/token-engine";
import SlideNavigationButtons from "./SlideNavigationButtons";

/* ==========================================================
   Slide4AllergyBarrierScreen – Improved Speech Bubble & Responsive Layout
   - Nurse Anna standing on left gesturing toward bubble on desktop
   - Improved smooth Bezier speech bubble with crisp tail & paper dot grid
   - Mobile portrait: bubble on top, Nurse Anna below, audio controls,
     and navigation buttons with ZERO empty bottom space
   ========================================================== */

const STAGE_W = 750;
const STAGE_H = 530;

/* Smooth Bezier Silhouette from AI-improved design */
const BUBBLE_PATH_LEFT =
  "M 125 242 " +
  "C 95 255, 40 270, 18 276 " +
  "C 42 258, 76 230, 84 208 " +
  "C 42 172, 34 110, 82 62 " +
  "C 138 14, 270 8, 370 28 " +
  "C 460 46, 495 112, 485 168 " +
  "C 475 224, 420 264, 310 272 " +
  "C 230 278, 160 262, 125 242 Z";

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

/* ---------- 1. Nurse Anna standing on Left (mirrored horizontally to gesture at bubble) ---------- */
.s4-nurse {
  position: absolute;
  left: 55px;
  top: 118px;
  width: 165px;
  height: 310px;
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
  left: 188px;
  top: -14px;
  width: 458px;
  aspect-ratio: 510 / 315;
  pointer-events: none;
  z-index: 1;
  filter: drop-shadow(2.5px 3.5px 0px #1a3532);
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
  left: 54%;
  transform: translate(-50%, -50%);
  width: 78%;
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
  font-size: 18.5px;
  line-height: 1.42;
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

/* ---------- 3. CC & Play/Pause Controls ---------- */
/* Hidden on desktop/tablet web layout (the floating player handles those);
   the mobile layout below reveals this in-slide control row. */
.s4-audio {
  display: none !important;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

/* ==========================================================
   Mobile-First Responsive Layout (< 768px)
   ========================================================== */
@media (max-width: 767px) {
  .s4-root {
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
  .s4-stage {
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
  .s4-bubble {
    order: 1 !important;
    position: relative !important;
    left: 50% !important;
    top: -30px !important;
    transform: translateX(-50%) !important;
    width: 100% !important;
    max-width: 340px !important;
    aspect-ratio: 510 / 315 !important;
    height: auto !important;
    margin: 4px auto 0 auto !important;
    filter: drop-shadow(2px 3px 0px #1a3532) !important;
    z-index: 1 !important;
    pointer-events: none !important;
}
  .s4-bubble-svg {
    position: absolute !important;
    inset: 0 !important;
    width: 100% !important;
    height: 100% !important;
  }
  .s4-bubble-text-wrap {
    position: absolute !important;
    top: 51% !important;
    left: 55% !important;
    transform: translate(-50%, -50%) !important;
    width: 72% !important;
    max-width: 235px !important;
    padding: 0 4px !important;
    margin: 0 !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    justify-content: center !important;
    text-align: center !important;
  }
  .s4-bubble-text {
    font-size: 13px !important;
    line-height: 1.35 !important;
    font-weight: 700 !important;
    color: #232323 !important;
    text-align: center !important;
    letter-spacing: -0.012em !important;
  }
  .s4-bubble-line {
    display: inline !important;
  }
  .s4-nurse {
    order: 2 !important;
    position: relative !important;
    left: auto !important;
    top: auto !important;
    width: 120px !important;
    height: 200px !important;
    margin: -10px auto 0 auto !important;
    z-index: 2 !important;
    pointer-events: none !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
  }
  .s4-nurse-img {
    width: 100% !important;
    height: 100% !important;
    object-fit: contain !important;
    transform: none !important;
  }
  .s4-audio {
    order: 3 !important;
    position: relative !important;
    left: auto !important;
    bottom: auto !important;
    top: auto !important;
    margin: 8px auto 0 auto !important;
    z-index: 25 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    gap: 5px !important;
  }
  .s4-audio .audio-cc-btn svg {
    width: 32px !important;
    height: 28px !important;
  }
  .s4-audio .audio-play-btn svg {
    width: 42px !important;
    height: 28px !important;
  }
}

/* Tablet Portrait Enhancements (481px to 767px) */
@media (min-width: 481px) and (max-width: 767px) {
  .s4-stage {
    max-width: 430px !important;
  }
  .s4-bubble {
    max-width: 390px !important;
  }
  .s4-bubble-text-wrap {
    max-width: 300px !important;
  }
  .s4-bubble-text {
    font-size: 16px !important;
  }
  .s4-nurse {
    width: 135px !important;
    height: 225px !important;
  }
}

/* ==========================================================
   Mobile & Tablet Landscape Layout (< 520px height)
   ========================================================== */
@media (orientation: landscape) and (max-height: 520px) {
  .s4-root {
    overflow-y: auto !important;
    overflow-x: hidden !important;
    padding: 0.5rem 1rem 3.5rem 1rem !important;
  }
  .s4-stage {
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
  .s4-nurse {
    order: 1 !important;
    position: relative !important;
    left: auto !important;
    top: auto !important;
    width: 100px !important;
    height: 185px !important;
    margin: 0 !important;
    flex-shrink: 0 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
  }
  .s4-nurse-img {
    width: 100% !important;
    height: 100% !important;
    object-fit: contain !important;
    transform: scaleX(-1) !important;
  }
  .s4-bubble {
    order: 2 !important;
    position: relative !important;
    left: auto !important;
    top: auto !important;
    width: 320px !important;
    aspect-ratio: 510 / 315 !important;
    margin: 0 !important;
    filter: drop-shadow(2px 3px 0px #1a3532) !important;
    flex-shrink: 0 !important;
  }
  .s4-bubble-text-wrap {
    width: 82% !important;
  }
  .s4-bubble-text {
    font-size: 13.5px !important;
    line-height: 1.35 !important;
  }
  .s4-audio {
    order: 3 !important;
    position: relative !important;
    left: auto !important;
    top: auto !important;
    bottom: auto !important;
    margin: 0 !important;
    flex-shrink: 0 !important;
    display: none !important;
    align-items: center !important;
    gap: 5px !important;
  }
  .s4-audio .audio-cc-btn svg {
    width: 29px !important;
    height: 25px !important;
  }
  .s4-audio .audio-play-btn svg {
    width: 38px !important;
    height: 25px !important;
  }
  /* Mobile landscape only: reveal the in-slide controls */
  @media (max-width: 767px) {
    .s4-audio {
      display: flex !important;
      justify-content: center !important;
    }
  }
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

export function Slide4AllergyBarrierScreen({
  isSpanish,
  medicationName,
  onNext,
  onBack,
  loading = false,
  audioSrc = isSpanish ? "/audio/exported/slide4_barrier_es.mp3" : "/audio/exported/slide4_barrier_en.mp3",
  stepId = "slide4_barrier",
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
        if (typeof window !== "undefined" && window.innerWidth < 768) {
          setScale(1);
        } else if (
          typeof window !== "undefined" &&
          window.innerHeight < 520 &&
          window.innerWidth > window.innerHeight
        ) {
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
        {/* 1. Nurse Anna standing on Left gesturing toward bubble */}
        <div className="s4-nurse">
          <img
            src="/images/nurse-anna.png"
            alt={isSpanish ? "Ilustración de la enfermera Anna" : "Nurse Anna"}
            className="s4-nurse-img"
            draggable={false}
            aria-hidden="true"
          />
        </div>

        {/* 2. Speech Bubble on Right with smooth Bezier curve & drop shadow */}
        <div className="s4-bubble">
          <svg
            className="s4-bubble-svg"
            viewBox="-20 -10 540 330"
            fill="none"
            aria-hidden="true"
          >
            <defs>
              <pattern id="s4-card-dot-pattern" width="16" height="16" patternUnits="userSpaceOnUse">
                <circle cx="8" cy="8" r="0.75" fill="#cadada" opacity="0.6" />
              </pattern>
            </defs>

            {/* Smooth Bezier Silhouette */}
            <path
              d={BUBBLE_PATH_LEFT}
              fill="#ffffff"
              stroke="#7baea9"
              strokeWidth="3"
              strokeLinejoin="round"
              strokeLinecap="round"
            />

            {/* Faint Paper Dot Grid Overlay */}
            <path
              d={BUBBLE_PATH_LEFT}
              fill="url(#s4-card-dot-pattern)"
            />
          </svg>

          {/* Centered Speech Text inside oval body */}
          <div className="s4-bubble-text-wrap">
            <h1 ref={headingRef} tabIndex={-1} className="s4-bubble-text">
              {isSpanish ? (
                <>
                  <span className="s4-bubble-line">{resolvedName} es uno de los mejores </span>
                  <span className="s4-bubble-line">antibióticos. Pero muchos niños no </span>
                  <span className="s4-bubble-line">lo reciben porque se cree </span>
                  <span className="s4-bubble-line">que son alérgicos a él.</span>
                </>
              ) : (
                <>
                  <span className="s4-bubble-line">{resolvedName} is one of the best </span>
                  <span className="s4-bubble-line">antibiotics. But many kids do </span>
                  <span className="s4-bubble-line">not get it because they are </span>
                  <span className="s4-bubble-line">believed to be allergic to it.</span>
                </>
              )}
            </h1>
          </div>
        </div>

        {/* 3. Caption (CC) & Play/Pause Controls – rendered in the mobile layout only */}
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

      {/* 4. Navigation Buttons (Back & Next) */}
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
