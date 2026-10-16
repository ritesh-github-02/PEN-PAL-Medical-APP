"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import AudioPlayer from "./AudioPlayer";
import { resolveMedicineToken } from "@/lib/token-engine";
import SlideNavigationButtons from "./SlideNavigationButtons";

/* ==========================================================
   Slide6MythTruthScreen – Scoped Pixel-Perfect Stage Layout
   Exact Match to User Reference Image:
   - 896 x 645 scaled stage with background #fafdf3
   - 2-line bold question heading at left: 107px, top: 97px, width: 682px
   - 4 Peach rounded Myth cards (#f1c9a9) vertically stacked (gap: 18px)
   - Click to reveal Truth with smooth teal state (#bce3dc)
   - Centered Back (left: 352px) & Next (left: 483px) buttons at y = 544px
   - Single audio player at left: 659px, y = 538px
   ========================================================== */

const STAGE_W = 750;
const STAGE_H = 530;

const SLIDE6_CSS = `
.s6-root,
.s6-root *,
.s6-root *::before,
.s6-root *::after {
  box-sizing: border-box;
}

.s6-root {
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

.s6-stage {
  position: relative;
  width: ${STAGE_W}px;
  height: ${STAGE_H}px;
  flex: none;
  transform-origin: center center;
  background-color: #fafdf3;
}

/* ---------- 1. Question Heading ---------- */
.s6-heading {
  position: absolute;
  left: 34px;
  top: 15px;
  width: 682px;
  margin: 0;
  padding: 0;
  font-size: 21.5px;
  line-height: 1.28;
  font-weight: 700;
  letter-spacing: -0.015em;
  color: #232323;
  text-align: left;
  outline: none;
}
.s6-heading:focus-visible {
  box-shadow: 0 0 0 2px #236f7a;
  border-radius: 4px;
}

/* ---------- 2. 4 Myth Cards Stack ---------- */
.s6-cards {
  position: absolute;
  left: 34px;
  top: 83px;
  width: 682px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.s6-card {
  width: 100%;
  border-radius: 16px;
  background-color: #f1c9a9;
  border: 1.5px solid transparent;
  text-align: left;
  cursor: pointer;
  outline: none;
  transition: background-color 0.18s cubic-bezier(0.16, 1, 0.3, 1),
              border-color 0.18s cubic-bezier(0.16, 1, 0.3, 1),
              transform 0.12s ease;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
  font-family: inherit;
}
.s6-card--1 {
  min-height: 108px;
  padding: 18px 28px;
}
.s6-card--2 {
  min-height: 88px;
  padding: 16px 28px;
}
.s6-card--3 {
  min-height: 54px;
  padding: 14px 28px;
}
.s6-card--4 {
  min-height: 48px;
  padding: 12px 28px;
}

.s6-card:hover {
  background-color: #f5cfb1;
}
.s6-card:active {
  transform: scale(0.995);
}
.s6-card:focus-visible {
  box-shadow: 0 0 0 3px #236f7a;
}

/* Revealed Truth State */
.s6-card--revealed {
  background-color: #bce3dc;
  border-color: #8ab8b0;
}
.s6-card--revealed:hover {
  background-color: #c7ebe5;
}

.s6-card-text {
  margin: 0;
  font-family: inherit;
  font-size: 16.5px;
  line-height: 1.4;
  font-weight: 500;
  color: #232323;
  letter-spacing: -0.01em;
}

/* ---------- 3. Centered Navigation Buttons (Back & Next) ---------- */
.s6-nav-back {
  position: absolute;
  left: 279px;
  top: 462px;
  z-index: 10;
}
.s6-nav-next {
  position: absolute;
  left: 410px;
  top: 462px;
  z-index: 10;
}
.s6-btn {
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
.s6-btn:active:not(:disabled) {
  transform: scale(0.96);
}
.s6-btn:focus-visible {
  box-shadow: 0 0 0 3px #236f7a;
}
.s6-btn--back {
  width: 64px;
  background-color: #bddfd8;
  border-color: #8ab8b0;
  color: #143833;
}
.s6-btn--back:hover:not(:disabled) {
  background-color: #a8d5cc;
}
.s6-btn--next {
  width: 62px;
  background-color: #fdee8e;
  border-color: #d4c65e;
  color: #232323;
  cursor: pointer;
}
.s6-btn--next:hover:not(:disabled) {
  background-color: #f5e478;
}

/* ---------- 4. Caption (CC) & Play/Pause Controls ---------- */
.s6-audio {
  position: absolute;
  left: 570px;
  top: 444px;
  z-index: 20;
  display: flex;
  align-items: center;
  gap: 8px;
}
.s6-audio .audio-cc-btn svg {
  width: 52px !important;
  height: 47px !important;
}
.s6-audio .audio-play-btn svg {
  width: 70px !important;
  height: 47px !important;
}

/* ==========================================================
   Mobile-First Responsive Layout (< 768px)
   ========================================================== */
@media (max-width: 767px) {
  .s6-root {
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
  .s6-stage {
    position: relative !important;
    width: 100% !important;
    max-width: 380px !important;
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
  .s6-heading {
    position: static !important;
    left: auto !important;
    top: auto !important;
    width: 100% !important;
    max-width: 100% !important;
    font-size: 14px !important;
    line-height: 1.35 !important;
    font-weight: 700 !important;
    text-align: left !important;
    color: #232323 !important;
    margin: 0 0 10px 0 !important;
    padding: 0 2px !important;
  }
  .s6-cards {
    position: static !important;
    left: auto !important;
    top: auto !important;
    width: 100% !important;
    display: flex !important;
    flex-direction: column !important;
    gap: 8px !important;
    margin: 0 0 12px 0 !important;
  }
  .s6-card {
    border-radius: 12px !important;
    min-height: auto !important;
    padding: 9px 13px !important;
  }
  .s6-card-text {
    font-size: 12.5px !important;
    line-height: 1.35 !important;
    font-weight: 500 !important;
  }
  .s6-audio {
    position: relative !important;
    right: auto !important;
    bottom: auto !important;
    left: auto !important;
    top: auto !important;
    align-self: center !important;
    margin: 8px auto 0 auto !important;
    z-index: 25 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    gap: 8px !important;
  }
  .s6-audio .audio-cc-btn svg {
    width: 38px !important;
    height: 34px !important;
  }
  .s6-audio .audio-play-btn svg {
    width: 48px !important;
    height: 34px !important;
  }
}
`;

export interface Slide6MythTruthScreenProps {
  isSpanish: boolean;
  medicationName?: string;
  revealedCards?: number[];
  onRevealedChange?: (revealed: number[]) => void;
  onNext: () => void;
  onBack: () => void;
  loading?: boolean;
  audioSrc?: string;
  stepId?: string;
  locale?: string;
  transcriptText?: string;
}

interface MythTruthItem {
  id: number;
  mythEn: string;
  mythEs: string;
  truthEn: string;
  truthEs: string;
  compact?: boolean;
}

const MYTH_TRUTH_DATA: MythTruthItem[] = [
  {
    id: 1,
    mythEn: "Myth 1 - If a child gets a rash when taking [name], it means they are allergic to [name].",
    mythEs: "Mito 1 - Si un niño tiene sarpullido al tomar [name], significa que es alérgico a [name].",
    truthEn: "Truth - A rash does not always mean an allergy. Rashes are common in kids, especially when they are sick. The underlying illness may have caused the rash.",
    truthEs: "Verdad - Un sarpullido no siempre significa alergia. Los sarpullidos son comunes en los niños, especialmente cuando están enfermos. La enfermedad subyacente puede haber causado el sarpullido.",
  },
  {
    id: 2,
    mythEn: "Myth 2 – If a child gets a belly ache or has diarrhea while taking [name], it means they are allergic to [name].",
    mythEs: "Mito 2 – Si un niño tiene dolor de estómago o diarrea mientras toma [name], significa que es alérgico a [name].",
    truthEn: "Truth - Belly aches and diarrhea are common side effects of antibiotics.",
    truthEs: "Verdad - Los dolores de estómago y la diarrea son efectos secundarios comunes de los antibióticos.",
  },
  {
    id: 3,
    mythEn: "Myth 3 – If a parent is allergic to penicillin, their child will be too.",
    mythEs: "Mito 3 – Si uno de los padres es alérgico a la penicilina, su hijo también lo será.",
    truthEn: "Truth - A penicillin allergy is not passed down from a parent to child.",
    truthEs: "Verdad - La alergia a la penicilina no se transmite de padres a hijos.",
    compact: true,
  },
  {
    id: 4,
    mythEn: "Myth 4 – If a child has a [name] allergy, they will always have it.",
    mythEs: "Mito 4 – Si un niño tiene alergia a [name], siempre la tendrá.",
    truthEn: "Truth - A child may outgrow their allergy to [name].",
    truthEs: "Verdad - Un niño puede superar su alergia a [name].",
    compact: true,
  },
];

export function Slide6MythTruthScreen({
  isSpanish,
  medicationName,
  revealedCards = [],
  onRevealedChange,
  onNext,
  onBack,
  loading = false,
  audioSrc,
  stepId = "slide6_myths",
  locale,
  transcriptText,
}: Slide6MythTruthScreenProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const [scale, setScale] = useState(1);
  const [revealed, setRevealed] = useState<number[]>(revealedCards);

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

  // Sync state if parent revealedCards prop updates
  useEffect(() => {
    if (Array.isArray(revealedCards)) {
      setRevealed(revealedCards);
    }
  }, [revealedCards]);

  const toggleCard = useCallback(
    (id: number) => {
      const current = revealed || [];
      const updated = current.includes(id)
        ? current.filter((i) => i !== id)
        : [...current, id];

      setRevealed(updated);

      if (onRevealedChange) {
        onRevealedChange(updated);
      }
    },
    [revealed, onRevealedChange]
  );

  const questionTitle = isSpanish
    ? "¿Por qué se piensa que tantos niños tienen alergia a la penicilina cuando no es así? ¡Haga clic en cada cuadro para revelar la verdad!"
    : "Why are so many kids thought to have a penicillin allergy when they don't? Click each box to reveal the truth!";

  return (
    <div id="slide-content" className="s6-root" ref={rootRef}>
      <style>{SLIDE6_CSS}</style>

      <div className="s6-stage" style={{ transform: `scale(${scale})` }}>
        {/* 1. Question Heading */}
        <h1 ref={headingRef} tabIndex={-1} className="s6-heading">
          {questionTitle}
        </h1>

        {/* 2. 4 Interactive Myth / Truth Cards */}
        <div className="s6-cards" role="region" aria-label={questionTitle}>
          {MYTH_TRUTH_DATA.map((item) => {
            const isRevealed = revealed.includes(item.id);
            const rawText = isRevealed
              ? isSpanish ? item.truthEs : item.truthEn
              : isSpanish ? item.mythEs : item.mythEn;
            const displayText = medicationName
              ? resolveMedicineToken(rawText, medicationName, isSpanish)
              : rawText;

            return (
              <button
                key={item.id}
                type="button"
                aria-expanded={isRevealed}
                onClick={() => toggleCard(item.id)}
                className={`s6-card s6-card--${item.id}${isRevealed ? " s6-card--revealed" : ""}`}
              >
                <p className="s6-card-text">
                  {displayText}
                </p>
              </button>
            );
          })}
        </div>

        {/* 4. Caption (CC) & Play/Pause controls directly at right baseline */}
        <div className="s6-audio">
          <AudioPlayer
            audioSrc={audioSrc}
            stepId={stepId}
            locale={locale || (isSpanish ? "es" : "en")}
            transcriptText={transcriptText || questionTitle}
            size="large"
          />
        </div>
      </div>

      {/* 3. Centered Navigation Buttons (Back & Next) */}
      <SlideNavigationButtons
        onBack={onBack}
        onNext={onNext}
        isSpanish={isSpanish}
        loading={loading}
      />
    </div>
  );
}

export default Slide6MythTruthScreen;
