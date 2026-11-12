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
     and navigation buttons matching Slide 2 & 3 canvas hierarchy
   ========================================================== */

const STAGE_W = 750;
const STAGE_H = 530;

/* Smooth Bezier Silhouette for Desktop (Tail pointing left toward Anna) */
const BUBBLE_PATH_LEFT =
  "M 125 242 " +
  "C 95 255, 40 270, 18 276 " +
  "C 42 258, 76 230, 84 208 " +
  "C 42 172, 34 110, 82 62 " +
  "C 138 14, 270 8, 370 28 " +
  "C 460 46, 495 112, 485 168 " +
  "C 475 224, 420 264, 310 272 " +
  "C 230 278, 160 262, 125 242 Z";

/* Dedicated Smooth Curved Silhouette for Mobile Portrait (Tail pointing downward toward Nurse Anna)
   Further expanded vertically (height 248) and horizontally (width 416)
   to maximize internal breathing padding while maintaining large font.
   Tail tip at (300, 296), cleanly reaching toward Nurse Anna */
const BUBBLE_PATH_MOBILE =
  "M 208 8 " +
  "C 322 8, 416 54, 416 128 " +
  "C 416 186, 356 226, 280 242 " +
  "C 290 262, 297 280, 300 296 " +
  "C 282 274, 254 256, 220 246 " +
  "C 210 246.5, 198 247, 184 247 " +
  "C 76 247, 8 194, 8 128 " +
  "C 8 54, 94 8, 208 8 " +
  "Z";

const mobileLayout = (scope: string) => `
  ${scope} {
    overflow: hidden !important;
    height: calc(100dvh - 140px) !important;
    min-height: calc(100dvh - 140px) !important;
    max-height: calc(100dvh - 140px) !important;
    flex: 1 1 auto !important;
    display: flex !important;
    flex-direction: column !important;
    justify-content: space-between !important;
    align-items: center !important;
    padding: 14px 16px 12px 16px !important;
    gap: 10px !important;
    box-sizing: border-box !important;
    background-color: transparent !important;
    border: none !important;
    box-shadow: none !important;
    border-radius: 0 !important;
  }
  ${scope} .s4-stage {
    position: relative !important;
    width: 100% !important;
    max-width: 398px !important;
    height: auto !important;
    flex: 1 1 0% !important;
    min-height: 0 !important;
    overflow: visible !important;
    transform: none !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    justify-content: center !important;
    background-color: transparent !important;
    padding: 0 10px !important;
    margin: 0 auto !important;
    gap: 12px !important;
    box-sizing: border-box !important;
  }
  ${scope} .s4-bubble {
    order: 1 !important;
    position: relative !important;
    left: auto !important;
    top: auto !important;
    transform: none !important;
    width: 100% !important;
    max-width: 355px !important;
    aspect-ratio: 438 / 312 !important;
    height: auto !important;
    flex-shrink: 1 !important;
    margin: 0 auto !important;
    filter: drop-shadow(2px 3px 0px #1a3532) !important;
    z-index: 1 !important;
    pointer-events: none !important;
    overflow: visible !important;
  }
  ${scope} .s4-bubble-desktop-svg {
    display: none !important;
  }
  ${scope} .s4-bubble-mobile-svg {
    display: block !important;
    position: absolute !important;
    inset: 0 !important;
    width: 100% !important;
    height: 100% !important;
    overflow: visible !important;
  }
  ${scope} .s4-bubble-text-wrap {
    position: absolute !important;
    top: 42.5% !important;
    left: 50% !important;
    transform: translate(-50%, -50%) !important;
    width: 80% !important;
    max-width: 285px !important;
    padding: 0 6px !important;
    margin: 0 !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    justify-content: center !important;
    text-align: center !important;
    box-sizing: border-box !important;
  }
  ${scope} .s4-bubble-text {
    font-size: clamp(14px, 1.95vh, 16px) !important;
    line-height: 1.34 !important;
    font-weight: 700 !important;
    color: #142724 !important;
    text-align: center !important;
    text-wrap: pretty !important;
    letter-spacing: -0.015em !important;
    word-break: normal !important;
    overflow-wrap: break-word !important;
    outline: none !important;
    margin: 0 auto !important;
    width: 100% !important;
    display: block !important;
  }
  ${scope} .s4-bubble-text:focus,
  ${scope} .s4-bubble-text:focus-visible {
    outline: none !important;
    box-shadow: none !important;
  }
  ${scope} .s4-nurse {
    order: 2 !important;
    position: relative !important;
    left: auto !important;
    top: auto !important;
    width: clamp(110px, 27vw, 138px) !important;
    height: clamp(150px, 21vh, 195px) !important;
    margin-top: -14px !important;
    margin-left: auto !important;
    margin-right: 4% !important;
    flex-shrink: 1 !important;
    z-index: 2 !important;
    pointer-events: none !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
  }
  ${scope} .s4-nurse-img {
    width: 100% !important;
    height: 100% !important;
    object-fit: contain !important;
    transform: none !important;
  }
  ${scope} .s4-bottom-bar-mobile {
    width: 100% !important;
    max-width: 360px !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    justify-content: center !important;
    gap: clamp(10px, 1.8vh, 16px) !important;
    padding-top: 6px !important;
    padding-bottom: calc(10px + env(safe-area-inset-bottom, 0px)) !important;
    margin: 0 auto !important;
    flex-shrink: 0 !important;
    z-index: 25 !important;
  }
  ${scope} .s4-audio {
    position: static !important;
    right: auto !important;
    bottom: auto !important;
    display: flex !important;
    justify-content: center !important;
    align-items: center !important;
    margin: 0 auto !important;
    z-index: 25 !important;
  }
  ${scope} .slide-nav-container {
    margin: 0 auto !important;
    justify-content: center !important;
    width: 100% !important;
    gap: 16px !important;
  }
  ${scope} .slide-nav-btn {
    min-width: 128px !important;
    padding: 0 32px !important;
    white-space: nowrap !important;
    flex: 0 1 auto !important;
  }
`;

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
  left: 175px;
  top: -20px;
  width: 485px;
  aspect-ratio: 510 / 315;
  pointer-events: none;
  z-index: 1;
  filter: drop-shadow(2.5px 3.5px 0px #1a3532);
}
.s4-bubble-desktop-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
}
.s4-bubble-mobile-svg {
  display: none;
}
.s4-bubble-text-wrap {
  position: absolute;
  top: 50%;
  left: 56%;
  transform: translate(-50%, -50%);
  width: 72%;
  max-width: 340px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 0 10px;
  margin: 0;
  box-sizing: border-box;
  pointer-events: none;
}
.s4-bubble-text {
  margin: 0 auto;
  padding: 0;
  width: 100%;
  font-family: "Plus Jakarta Sans", "Inter", system-ui, -apple-system, sans-serif;
  font-size: 21.5px;
  line-height: 1.44;
  font-weight: 700;
  color: #142724;
  text-align: center !important;
  text-wrap: balance !important;
  letter-spacing: -0.015em;
  outline: none;
  word-break: normal;
  overflow-wrap: break-word;
  display: block;
}
.s4-bubble-text:focus,
.s4-bubble-text:focus-visible {
  outline: none !important;
  box-shadow: none !important;
}

/* Desktop Bottom Controls */
.s4-bottom-bar-mobile {
  display: none;
}
.s4-audio-desktop {
  position: absolute;
  right: clamp(14px, 3.5vw, 22px);
  bottom: clamp(14px, 2.5vh, 22px);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  z-index: 35;
}
.s4-nav-desktop {
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  bottom: clamp(14px, 2.5vh, 22px);
  left: 0;
  right: 0;
  margin: 0 auto;
  z-index: 30;
}

@media (max-width: 767px) {
  ${mobileLayout(".s4-root")}
  .s4-audio-desktop {
    display: none !important;
  }
  .s4-nav-desktop {
    display: none !important;
  }
  .s4-bottom-bar-mobile {
    display: flex !important;
  }
}

${mobileLayout(".s4-root.is-mobile")}
.s4-root.is-mobile .s4-audio-desktop {
  display: none !important;
}
.s4-root.is-mobile .s4-nav-desktop {
  display: none !important;
}
.s4-root.is-mobile .s4-bottom-bar-mobile {
  display: flex !important;
}
`;

export interface Slide4AllergyBarrierScreenProps {
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

export function Slide4AllergyBarrierScreen({
  isSpanish = false,
  medicationName,
  variant = "auto",
  onNext,
  onBack,
  loading = false,
  audioSrc,
  stepId = "slide4_barrier",
  locale,
  transcriptText,
}: Slide4AllergyBarrierScreenProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const [scale, setScale] = useState(1);

  const isEs = (locale ?? "").startsWith("es") || isSpanish;

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
        if (variant === "mobile" || window.innerWidth < 768) {
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
  }, [variant]);

  const rawText = isEs
    ? "[name] es uno de los mejores antibióticos. Pero muchos niños no lo reciben porque se cree que son alérgicos a él."
    : "[name] is one of the best antibiotics. But many kids do not get it because they are believed to be allergic to it.";

  const resolvedName = medicationName && medicationName.trim()
    ? medicationName.trim()
    : (isEs ? "la amoxicilina" : "amoxicillin");

  const titleText = resolveMedicineToken(rawText, resolvedName, isEs);

  const effectiveAudioSrc =
    audioSrc ||
    (isEs
      ? "/audio/exported/slide4_barrier_es.mp3"
      : "/audio/exported/slide4_barrier_en.mp3");

  const variantClass = variant === "mobile" ? " is-mobile" : variant === "desktop" ? " is-desktop" : "";

  return (
    <div id="slide-content" className={`s4-root${variantClass}`} ref={rootRef}>
      <style>{SLIDE4_CSS}</style>

      <div className="s4-stage" style={{ transform: `scale(${scale})` }}>
        {/* 1. Nurse Anna standing on Left gesturing toward bubble */}
        <div className="s4-nurse">
          <img
            src="/images/nurse-anna.png"
            alt={isEs ? "Ilustración de la enfermera Anna" : "Nurse Anna"}
            className="s4-nurse-img"
            draggable={false}
            aria-hidden="true"
          />
        </div>

        {/* 2. Speech Bubble on Right with smooth Bezier curve & drop shadow */}
        <div className="s4-bubble">
          {/* Desktop Bezier SVG (Pointing left toward Anna) */}
          <svg
            className="s4-bubble-desktop-svg"
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

          {/* Mobile Bezier SVG (Pointing down-right toward Anna below) */}
          <svg
            className="s4-bubble-mobile-svg"
            viewBox="-6 -6 438 312"
            fill="none"
            aria-hidden="true"
          >
            <defs>
              <pattern id="s4-card-dot-pattern-m" width="16" height="16" patternUnits="userSpaceOnUse">
                <circle cx="8" cy="8" r="0.75" fill="#cadada" opacity="0.6" />
              </pattern>
            </defs>

            <path
              d={BUBBLE_PATH_MOBILE}
              fill="#ffffff"
              stroke="#7baea9"
              strokeWidth="3.5"
              strokeLinejoin="round"
              strokeLinecap="round"
            />

            <path
              d={BUBBLE_PATH_MOBILE}
              fill="url(#s4-card-dot-pattern-m)"
            />
          </svg>

          {/* Centered Speech Text inside oval body */}
          <div className="s4-bubble-text-wrap">
            <h1 ref={headingRef} tabIndex={-1} className="s4-bubble-text">
              {titleText}
            </h1>
          </div>
        </div>
      </div>

      {/* 3. Desktop Audio narration & CC controls */}
      <div className="s4-audio-desktop">
        <AudioPlayer
          audioSrc={effectiveAudioSrc}
          stepId={stepId || "slide4_barrier"}
          locale={locale || (isEs ? "es" : "en")}
          transcriptText={transcriptText || titleText}
          size="large"
        />
      </div>

      {/* 4. Desktop Centered Navigation Buttons (Back & Next) */}
      <div className="s4-nav-desktop">
        <SlideNavigationButtons
          onBack={onBack}
          onNext={onNext}
          isSpanish={isEs}
          loading={loading}
        />
      </div>

      {/* 5. Mobile Centered Stacked Bottom Bar: Audio on top, Navigation below */}
      <div className="s4-bottom-bar-mobile">
        <div className="s4-audio">
          <AudioPlayer
            audioSrc={effectiveAudioSrc}
            stepId={stepId || "slide4_barrier"}
            locale={locale || (isEs ? "es" : "en")}
            transcriptText={transcriptText || titleText}
            size="large"
          />
        </div>

        <SlideNavigationButtons
          onBack={onBack}
          onNext={onNext}
          isSpanish={isEs}
          loading={loading}
        />
      </div>
    </div>
  );
}

export default Slide4AllergyBarrierScreen;


