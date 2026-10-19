"use client";

import React, { useState, useRef, useEffect } from "react";
import AudioPlayer from "./AudioPlayer";
import SlideNavigationButtons from "./SlideNavigationButtons";

/* ==========================================================
   Slide8MilestoneScreen – Improved Speech Bubble & Responsive Layout
   - Milestone celebration: "Great job! Now you know what is true about penicillin allergies!"
   - Speech bubble on left sweeping rightward toward Nurse Anna standing on right
   - Clean cubic Bezier contour with rightward tail & faint paper dot grid
   - Desktop: Flex row layout (bubble order: 1, Nurse Anna order: 2)
   - Mobile portrait: Stacked flow (bubble on top, Anna below, audio controls, navigation)
   - Mobile & tablet landscape: Streamlined horizontal layout
   ========================================================== */

const STAGE_W = 750;
const STAGE_H = 530;

/* Exact horizontal mirror of Slide 4's organic curved Bezier speech bubble, sweeping rightward toward Anna */
const BUBBLE_PATH_RIGHT =
  "M 377 242 " +
  "C 407 255, 462 270, 484 276 " +
  "C 460 258, 426 230, 418 208 " +
  "C 460 172, 468 110, 420 62 " +
  "C 364 14, 232 8, 132 28 " +
  "C 42 46, 7 112, 17 168 " +
  "C 27 224, 82 264, 192 272 " +
  "C 272 278, 342 262, 377 242 Z";

const SLIDE8_CSS = `
.s8-root,
.s8-root *,
.s8-root *::before,
.s8-root *::after {
  box-sizing: border-box;
}

.s8-root {
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

.s8-stage {
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
}

/* ---------- 1. Speech Bubble on Left (Tail pointing right toward Anna) ---------- */
.s8-bubble {
  position: relative;
  width: 510px;
  aspect-ratio: 510 / 315;
  flex-shrink: 0;
  filter: drop-shadow(2.5px 3.5px 0px #1a3532);
  margin-right: -10px;
  margin-top: -70px;
  order: 1;
  pointer-events: none;
  z-index: 5;
}

.s8-bubble-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
  display: block;
}

.s8-bubble-text-wrap {
  position: absolute;
  top: 48%;
  left: 46%;
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

.s8-bubble-text {
  margin: 0;
  padding: 0;
  width: 100%;
  font-family: "Plus Jakarta Sans", "Inter", system-ui, -apple-system, sans-serif;
  font-size: 21.5px;
  line-height: 1.42;
  font-weight: 700;
  color: #232323;
  text-align: center;
  letter-spacing: -0.012em;
  outline: none;
  word-break: break-word;
  overflow-wrap: break-word;
}

.s8-bubble-text:focus-visible {
  box-shadow: 0 0 0 2px #236f7a;
  border-radius: 4px;
}

.s8-bubble-line {
  display: block;
  text-align: center;
  margin: 0 auto;
  width: 100%;
}

/* ---------- 2. Nurse Anna standing on Right ---------- */
.s8-nurse {
  position: relative;
  width: 175px;
  height: 355px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: -10px;
  order: 2;
  pointer-events: none;
  z-index: 10;
}

.s8-nurse-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
  user-select: none;
  -webkit-user-drag: none;
}

/* ---------- 3. Caption (CC) & Play/Pause Controls ---------- */
.s8-audio {
  position: absolute;
  left: 565px;
  top: 444px;
  z-index: 20;
  display: flex;
  align-items: center;
  gap: 8px;
}

.s8-audio .audio-cc-btn svg {
  width: 52px !important;
  height: 47px !important;
}

.s8-audio .audio-play-btn svg {
  width: 70px !important;
  height: 47px !important;
}

/* ==========================================================
   Mobile-First Responsive Layout (< 768px)
   ========================================================== */
@media (max-width: 767px) {
  .s8-root {
    overflow-y: auto !important;
    overflow-x: hidden !important;
    -webkit-overflow-scrolling: touch !important;
    height: auto !important;
    min-height: auto !important;
    flex: none !important;
    display: flex !important;
    flex-direction: column !important;
    justify-content: flex-start !important;
    align-items: center !important;
    padding: 0.85rem 0.85rem 1rem 0.85rem !important;
    gap: 0 !important;
  }
  .s8-stage {
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
    gap: 0 !important;
  }
  .s8-bubble {
    order: 1 !important;
    position: relative !important;
    left: auto !important;
    top: auto !important;
    width: 100% !important;
    max-width: 330px !important;
    aspect-ratio: 510 / 315 !important;
    height: auto !important;
    margin: 4px auto 0 auto !important;
    filter: drop-shadow(2px 3px 0px #1a3532) !important;
    z-index: 1 !important;
    pointer-events: none !important;
  }
  .s8-bubble-svg {
    position: absolute !important;
    inset: 0 !important;
    width: 100% !important;
    height: 100% !important;
  }
  .s8-bubble-text-wrap {
    position: absolute !important;
    top: 48% !important;
    left: 46% !important;
    transform: translate(-50%, -50%) !important;
    width: 78% !important;
    max-width: 255px !important;
    padding: 0 !important;
    margin: 0 !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    justify-content: center !important;
    text-align: center !important;
  }
  .s8-bubble-text {
    font-size: 14.5px !important;
    line-height: 1.4 !important;
    font-weight: 700 !important;
    color: #232323 !important;
    text-align: center !important;
    letter-spacing: -0.012em !important;
  }
  .s8-nurse {
    order: 2 !important;
    position: relative !important;
    left: auto !important;
    top: auto !important;
    width: 120px !important;
    height: 200px !important;
    margin: 6px auto 0 auto !important;
    z-index: 2 !important;
    pointer-events: none !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
  }
  .s8-nurse-img {
    width: 100% !important;
    height: 100% !important;
    object-fit: contain !important;
    transform: none !important;
  }
  .s8-audio {
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
    gap: 8px !important;
  }
  .s8-audio .audio-cc-btn svg {
    width: 38px !important;
    height: 34px !important;
  }
  .s8-audio .audio-play-btn svg {
    width: 48px !important;
    height: 34px !important;
  }
}

/* Tablet Portrait Enhancements (481px to 767px) */
@media (min-width: 481px) and (max-width: 767px) {
  .s8-stage {
    max-width: 430px !important;
  }
  .s8-bubble {
    max-width: 390px !important;
  }
  .s8-bubble-text-wrap {
    max-width: 300px !important;
  }
  .s8-bubble-text {
    font-size: 16px !important;
  }
  .s8-nurse {
    width: 145px !important;
    height: 245px !important;
  }
}

/* ==========================================================
   Mobile & Tablet Landscape Layout (< 520px height)
   ========================================================== */
@media (orientation: landscape) and (max-height: 520px) {
  .s8-root {
    overflow-y: auto !important;
    overflow-x: hidden !important;
    padding: 0.5rem 1rem 3.5rem 1rem !important;
  }
  .s8-stage {
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
  .s8-bubble {
    order: 1 !important;
    position: relative !important;
    left: auto !important;
    top: auto !important;
    width: 320px !important;
    aspect-ratio: 510 / 315 !important;
    margin: 0 !important;
    filter: drop-shadow(2px 3px 0px #1a3532) !important;
    flex-shrink: 0 !important;
  }
  .s8-bubble-text-wrap {
    top: 48% !important;
    left: 46% !important;
    width: 78% !important;
  }
  .s8-bubble-text {
    font-size: 13.5px !important;
    line-height: 1.35 !important;
  }
  .s8-nurse {
    order: 2 !important;
    position: relative !important;
    left: auto !important;
    top: auto !important;
    width: 110px !important;
    height: 200px !important;
    margin: 0 !important;
    flex-shrink: 0 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
  }
  .s8-nurse-img {
    width: 100% !important;
    height: 100% !important;
    object-fit: contain !important;
  }
  .s8-audio {
    order: 3 !important;
    position: relative !important;
    left: auto !important;
    top: auto !important;
    bottom: auto !important;
    margin: 0 !important;
    flex-shrink: 0 !important;
    display: flex !important;
    align-items: center !important;
    gap: 6px !important;
  }
  .s8-audio .audio-cc-btn svg {
    width: 34px !important;
    height: 30px !important;
  }
  .s8-audio .audio-play-btn svg {
    width: 44px !important;
    height: 30px !important;
  }
}
`;

export interface Slide8MilestoneScreenProps {
  isSpanish: boolean;
  onNext: () => void;
  onBack: () => void;
  loading?: boolean;
  audioSrc?: string;
  stepId?: string;
  locale?: string;
  transcriptText?: string;
}

export function Slide8MilestoneScreen({
  isSpanish,
  onNext,
  onBack,
  loading = false,
  audioSrc,
  stepId = "slide8_milestone",
  locale,
  transcriptText,
}: Slide8MilestoneScreenProps) {
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

  const spokenText = isSpanish
    ? "¡Buen trabajo! ¡Ahora ya sabe lo que es verdad sobre las alergias a la penicilina!"
    : "Great job! Now you know what is true about penicillin allergies!";

  return (
    <div id="slide-content" className="s8-root" ref={rootRef}>
      <style>{SLIDE8_CSS}</style>

      <div className="s8-stage" style={{ transform: `scale(${scale})` }}>
        {/* 1. Speech Bubble on Left with smooth Bezier curve & drop shadow */}
        <div className="s8-bubble">
          <svg
            className="s8-bubble-svg"
            viewBox="-20 -10 540 330"
            fill="none"
            aria-hidden="true"
          >
            <defs>
              <pattern id="s8-card-dot-pattern" width="16" height="16" patternUnits="userSpaceOnUse">
                <circle cx="8" cy="8" r="0.75" fill="#cadada" opacity="0.6" />
              </pattern>
            </defs>

            {/* Smooth Bezier Silhouette sweeping rightward toward Nurse Anna */}
            <path
              d={BUBBLE_PATH_RIGHT}
              fill="#ffffff"
              stroke="#7baea9"
              strokeWidth="3"
              strokeLinejoin="round"
              strokeLinecap="round"
            />

            {/* Faint Paper Dot Grid Overlay */}
            <path
              d={BUBBLE_PATH_RIGHT}
              fill="url(#s8-card-dot-pattern)"
            />
          </svg>

          {/* Centered Speech Text inside oval body */}
          <div className="s8-bubble-text-wrap">
            <h1 ref={headingRef} tabIndex={-1} className="s8-bubble-text">
              {isSpanish ? (
                <>
                  <span className="s8-bubble-line">¡Buen trabajo! ¡Ahora ya sabe lo que</span>
                  <span className="s8-bubble-line">es verdad sobre las alergias a la penicilina!</span>
                </>
              ) : (
                <>
                  <span className="s8-bubble-line">Great job! Now you know what</span>
                  <span className="s8-bubble-line">is true about penicillin allergies!</span>
                </>
              )}
            </h1>
          </div>
        </div>

        {/* 2. Nurse Anna standing on Right gesturing toward bubble */}
        <div className="s8-nurse">
          <img
            src="/images/nurse-anna.png"
            alt={isSpanish ? "Ilustración de la enfermera Anna" : "Nurse Anna"}
            className="s8-nurse-img"
            draggable={false}
            aria-hidden="true"
          />
        </div>

        {/* 3. Caption (CC) & Play/Pause Controls */}
        <div className="s8-audio">
          <AudioPlayer
            audioSrc={audioSrc}
            stepId={stepId}
            locale={locale || (isSpanish ? "es" : "en")}
            transcriptText={transcriptText || spokenText}
            size="large"
          />
        </div>
      </div>

      {/* 4. Standardized Navigation Buttons (Back & Next) pinned at bottom */}
      <SlideNavigationButtons
        onBack={onBack}
        onNext={onNext}
        isSpanish={isSpanish}
        loading={loading}
      />
    </div>
  );
}

export default Slide8MilestoneScreen;
