"use client";

import React, { useRef, useEffect, useState } from "react";
import AudioPlayer from "./AudioPlayer";
import SlideNavigationButtons from "./SlideNavigationButtons";

/* ==========================================================
   Slide10SurveyIntroScreen – Improved Speech Bubble & Responsive Layout
   - Nurse Anna standing on left gesturing toward speech bubble
   - Smooth Bezier speech bubble on right with tail sweeping left toward Anna
   - Subtle paper dot grid pattern overlay (#s10b-card-dot-pattern)
   - Desktop: Flex row layout (Nurse Anna order: 1, bubble order: 2)
   - Mobile portrait: Stacked flow (bubble on top, Anna below, audio controls, navigation)
   - Mobile & tablet landscape: Streamlined horizontal layout
   ========================================================== */

const STAGE_W = 750;
const STAGE_H = 530;

/* Clean cubic Bezier contour with leftward tail sweeping toward Anna */
const BUBBLE_PATH_LEFT =
  "M 125 242 " +
  "C 95 255, 40 270, 18 276 " +
  "C 42 258, 76 230, 84 208 " +
  "C 42 172, 34 110, 82 62 " +
  "C 138 14, 270 8, 370 28 " +
  "C 460 46, 495 112, 485 168 " +
  "C 475 224, 420 264, 310 272 " +
  "C 230 278, 160 262, 125 242 Z";

const SLIDE10_SURVEY_INTRO_CSS = `
.s10b-root,
.s10b-root *,
.s10b-root *::before,
.s10b-root *::after {
  box-sizing: border-box;
}

.s10b-root {
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

.s10b-stage {
  position: relative;
  width: ${STAGE_W}px;
  height: ${STAGE_H}px;
  flex: none;
  transform-origin: center center;
  background-color: #fafdf3;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 10px;
}

/* ---------- 1. Nurse Anna on the LEFT (Gesturing right toward bubble) ---------- */
.s10b-nurse {
  position: relative;
  width: 190px;
  height: 355px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  order: 1;
  pointer-events: none;
  z-index: 10;
}

.s10b-nurse-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
  user-select: none;
  -webkit-user-drag: none;
  transform: none;
  filter: drop-shadow(0 4px 12px rgba(20, 50, 45, 0.12));
}

/* ---------- 2. Speech Bubble on the RIGHT ---------- */
.s10b-bubble {
  position: relative;
  width: 490px;
  aspect-ratio: 510 / 315;
  flex-shrink: 0;
  filter: drop-shadow(2.5px 3.5px 0px #1a3532);
  margin-left: -60px;
  margin-top: -293px;
  order: 2;
  pointer-events: none;
  z-index: 5;
}

.s10b-bubble-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
  display: block;
}

.s10b-bubble-text-wrap {
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

.s10b-bubble-text {
  margin: 0;
  padding: 0;
  width: 100%;
  font-family: "Plus Jakarta Sans", "Inter", system-ui, -apple-system, sans-serif;
  font-size: 20.5px;
  line-height: 1.42;
  font-weight: 700;
  color: #232323;
  text-align: center;
  letter-spacing: -0.012em;
  outline: none;
  word-break: break-word;
  overflow-wrap: break-word;
}

.s10b-bubble-text:focus-visible {
  box-shadow: 0 0 0 2px #236f7a;
  border-radius: 4px;
}

.s10b-bubble-line {
  display: block;
  text-align: center;
  margin: 0 auto;
  width: 100%;
}

/* Wrapper collapses on desktop so audio + nav keep independent absolute positioning */
.s10b-bottom-bar {
  display: contents;
}

/* ---------- 3. Caption (CC) & Play/Pause Controls (bottom-right like Slide 5) ---------- */
.s10b-audio {
  position: absolute !important;
  right: clamp(14px, 3.5vw, 22px) !important;
  bottom: clamp(14px, 2.5vh, 22px) !important;
  top: auto !important;
  left: auto !important;
  margin: 0 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: flex-end !important;
  z-index: 35 !important;
}

${(() => {
  const mobileLayout = (scope: string) => `
    ${scope} {
      overflow-y: auto !important;
      overflow-x: hidden !important;
      height: 100% !important;
      max-height: 100% !important;
      min-height: 100% !important;
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
    ${scope} .s10b-stage {
      position: relative !important;
      width: 100% !important;
      max-width: 380px !important;
      height: auto !important;
      flex: 1 1 auto !important;
      min-height: 0 !important;
      overflow: visible !important;
      transform: none !important;
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      justify-content: center !important;
      background-color: transparent !important;
      padding: 0 !important;
      margin: 0 auto !important;
      gap: 6px !important;
    }
    ${scope} .s10b-bubble {
      order: 1 !important;
      position: relative !important;
      left: auto !important;
      top: auto !important;
      width: clamp(275px, 84vw, 345px) !important;
      max-width: 345px !important;
      aspect-ratio: 510 / 315 !important;
      height: auto !important;
      margin: 16px auto 0 auto !important;
      filter: drop-shadow(2px 3px 0px #1a3532) !important;
      z-index: 1 !important;
      pointer-events: none !important;
    }
    ${scope} .s10b-bubble-svg {
      position: absolute !important;
      inset: 0 !important;
      width: 100% !important;
      height: 100% !important;
    }
    ${scope} .s10b-bubble-text-wrap {
      position: absolute !important;
      top: 42% !important;
      left: 54% !important;
      transform: translate(-50%, -50%) !important;
      width: 80% !important;
      max-width: 265px !important;
      padding: 0 6px !important;
      margin: 0 !important;
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      justify-content: center !important;
      text-align: center !important;
      box-sizing: border-box !important;
    }
    ${scope} .s10b-bubble-text {
      font-size: clamp(14.5px, 2.15vh, 16.5px) !important;
      line-height: 1.38 !important;
      font-weight: 700 !important;
      color: #142724 !important;
      text-align: center !important;
      letter-spacing: -0.015em !important;
      word-break: normal !important;
      overflow-wrap: break-word !important;
    }
    ${scope} .s10b-bubble-text:focus:not(:focus-visible) {
      outline: none !important;
    }
    ${scope} .s10b-bubble-line {
      display: block !important;
      text-align: center !important;
      margin: 0 auto !important;
      width: 100% !important;
    }
    ${scope} .s10b-nurse {
      order: 2 !important;
      position: relative !important;
      left: auto !important;
      top: auto !important;
      width: clamp(88px, 22vw, 112px) !important;
      height: clamp(135px, 21vh, 185px) !important;
      margin: -12px auto 0 10% !important;
      z-index: 2 !important;
      pointer-events: none !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      flex-shrink: 0 !important;
    }
    ${scope} .s10b-nurse-img {
      height: 100% !important;
      max-height: 100% !important;
      width: auto !important;
      object-fit: contain !important;
      transform: none !important;
      filter: drop-shadow(0 4px 10px rgba(20, 50, 45, 0.12)) !important;
    }
    ${scope} .s10b-bottom-bar {
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
    ${scope} .s10b-audio {
      order: 1 !important;
      position: static !important;
      right: auto !important;
      bottom: auto !important;
      top: auto !important;
      left: auto !important;
      width: 100% !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      margin: 0 auto !important;
      color: #144e57 !important;
      z-index: 25 !important;
    }
    ${scope} .s10b-audio > div {
      gap: 8px !important;
    }
    ${scope} .s10b-audio .audio-cc-btn,
    ${scope} .s10b-audio .audio-play-btn {
      color: #144e57 !important;
      min-width: 44px !important;
      min-height: 44px !important;
      padding: 4px !important;
    }
    ${scope} .s10b-audio .audio-cc-btn svg,
    ${scope} .s10b-audio .audio-play-btn svg {
      height: 34px !important;
      width: auto !important;
    }
    ${scope} .slide-nav {
      order: 2 !important;
      position: relative !important;
      bottom: auto !important;
      top: auto !important;
      left: auto !important;
      right: auto !important;
      margin: 0 auto !important;
      gap: 16px !important;
    }
    ${scope} .slide-nav-btn {
      min-width: 128px !important;
      padding: 0 32px !important;
    }
  `;
  return `
    /* ==========================================================
       Mobile-First Responsive Layout (< 768px & .is-mobile)
       ========================================================== */
    @media (max-width: 767px) {
      ${mobileLayout(".s10b-root:not(.is-desktop)")}
      .s10b-root:not(.is-desktop) {
        min-height: min(640px, calc(100dvh - 80px)) !important;
        max-height: calc(100dvh - 72px) !important;
      }
    }
    ${mobileLayout(".s10b-root.is-mobile")}
  `;
})()}

/* ==========================================================
   Mobile & Tablet Landscape Layout (< 520px height)
   ========================================================== */
@media (orientation: landscape) and (max-height: 520px) {
  .s10b-root {
    overflow-y: auto !important;
    overflow-x: hidden !important;
    padding: 0.5rem 1rem 3.5rem 1rem !important;
  }
  .s10b-stage {
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
  .s10b-nurse {
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
  .s10b-nurse-img {
    width: 100% !important;
    height: 100% !important;
    object-fit: contain !important;
    transform: scaleX(-1) !important;
  }
  .s10b-bubble {
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
  .s10b-bubble-text-wrap {
    width: 82% !important;
  }
  .s10b-bubble-text {
    font-size: 13.5px !important;
    line-height: 1.35 !important;
  }
  .s10b-audio {
    position: static !important;
    right: auto !important;
    bottom: auto !important;
    top: auto !important;
    left: auto !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    margin: 4px auto 0 auto !important;
    z-index: 25 !important;
  }
}
`;

export interface Slide10SurveyIntroScreenProps {
  isSpanish: boolean;
  onNext: () => void;
  onBack: () => void;
  loading?: boolean;
  audioSrc?: string;
  stepId?: string;
  locale?: string;
  transcriptText?: string;
  variant?: "auto" | "desktop" | "mobile";
}

export function Slide10SurveyIntroScreen({
  isSpanish,
  onNext,
  onBack,
  loading = false,
  audioSrc = isSpanish ? "/audio/exported/screen6_survey_intro_es.mp3" : "/audio/exported/screen6_survey_intro_en.mp3",
  stepId = "screen6_survey_intro",
  locale,
  transcriptText,
  variant = "auto",
}: Slide10SurveyIntroScreenProps) {
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
        if (variant === "mobile" || (variant !== "desktop" && typeof window !== "undefined" && window.innerWidth < 768)) {
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
  }, [variant]);

  const spokenText = isSpanish
    ? "El siguiente conjunto de preguntas puede ayudarlo a usted y al médico a decidir qué es lo mejor para su hijo."
    : "The next set of questions can help you and the doctor see what’s best for your child.";

  const variantClass =
    variant === "mobile" ? " is-mobile" : variant === "desktop" ? " is-desktop" : "";

  return (
    <div id="slide-content" className={`s10b-root${variantClass}`} ref={rootRef}>
      <style>{SLIDE10_SURVEY_INTRO_CSS}</style>

      <div className="s10b-stage" style={{ transform: `scale(${scale})` }}>
        {/* 1. Nurse Anna on the LEFT gesturing toward bubble (Figma-spec explaining vector) */}
        <div className="s10b-nurse">
          <img
            src="/images/nurse-anna-explaining.png"
            srcSet="/images/nurse-anna-explaining.png 1x, /images/nurse-anna-explaining-2x.png 2x"
            alt={isSpanish ? "Ilustración de la enfermera Anna" : "Nurse Anna"}
            className="s10b-nurse-img"
            draggable={false}
            aria-hidden="true"
          />
        </div>

        {/* 2. Speech Bubble on the RIGHT with smooth Bezier curve & drop shadow */}
        <div className="s10b-bubble">
          <svg
            className="s10b-bubble-svg"
            viewBox="-20 -10 540 330"
            fill="none"
            aria-hidden="true"
          >
            <defs>
              <pattern id="s10b-card-dot-pattern" width="16" height="16" patternUnits="userSpaceOnUse">
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
              fill="url(#s10b-card-dot-pattern)"
            />
          </svg>

          {/* Centered Speech Text inside oval body */}
          <div className="s10b-bubble-text-wrap">
            <h1 ref={headingRef} tabIndex={-1} className="s10b-bubble-text">
              {isSpanish ? (
                <>
                  <span className="s10b-bubble-line">El siguiente conjunto de preguntas</span>
                  <span className="s10b-bubble-line">puede ayudarlo a usted y al médico</span>
                  <span className="s10b-bubble-line">a decidir qué es mejor para su hijo.</span>
                </>
              ) : (
                <>
                  <span className="s10b-bubble-line">The next set of questions</span>
                  <span className="s10b-bubble-line">can help you and the doctor see</span>
                  <span className="s10b-bubble-line">what’s best for your child.</span>
                </>
              )}
            </h1>
          </div>
        </div>
      </div>

      {/* 3. Bottom Controls (Audio above Back/Next on mobile; independent on desktop) */}
      <div className="s10b-bottom-bar">
        <div className="s10b-audio">
          <AudioPlayer
            audioSrc={audioSrc}
            stepId={stepId}
            locale={locale || (isSpanish ? "es" : "en")}
            transcriptText={transcriptText || spokenText}
            size="large"
          />
        </div>

        <SlideNavigationButtons
          onBack={onBack}
          onNext={onNext}
          isSpanish={isSpanish}
          loading={loading}
        />
      </div>
    </div>
  );
}

export default Slide10SurveyIntroScreen;