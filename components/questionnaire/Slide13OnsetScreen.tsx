"use client";

import React, { useRef, useEffect } from "react";
import { resolveMedicineToken } from "@/lib/token-engine";

const SLIDE13_CSS = `
/* ==========================================================
   Slide13OnsetScreen – Pixel-Perfect Styles Matching Target UI
   ========================================================== */

.s13-root,
.s13-root *,
.s13-root *::before,
.s13-root *::after {
  box-sizing: border-box;
}

.s13-root {
  position: relative;
  width: 100%;
  height: 100%;
  flex: 1 1 0%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background-color: #f6faee;
  padding: 1.5rem 2.5rem 0.85rem 2.5rem;
  overflow: hidden;
}

/* Heading */
.s13-top-section {
  width: 100%;
  text-align: center;
  margin-top: 0.25rem;
  margin-bottom: 0.5rem;
  flex-shrink: 0;
}
.s13-heading {
  font-size: 1.42rem;
  line-height: 1.35;
  font-weight: 700;
  color: #142724;
  letter-spacing: -0.015em;
  margin: 0;
  outline: none;
}
.s13-heading:focus-visible {
  box-shadow: 0 0 0 2px #236f7a;
}

/* Middle Section: Teal Card + Nurse Anna */
.s13-middle {
  flex: 1 1 0%;
  min-height: 0;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2.5rem;
  margin: auto 0;
  padding: 0.5rem 0;
}

/* Main Rounded Teal Card Container */
.s13-card {
  background-color: #8cb2a7;
  border: 1.5px solid #759c92;
  border-radius: 20px;
  padding: 1.6rem 1.85rem 1.1rem 1.85rem;
  box-shadow: 0 4px 14px rgba(20, 55, 50, 0.12);
  display: flex;
  flex-direction: column;
  align-items: stretch;
  max-width: 550px;
  width: 100%;
  transition: all 0.2s ease;
}

/* Options Row */
.s13-options-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  width: 100%;
}

/* White Option Buttons inside Teal Card */
.s13-option-btn {
  flex: 1 1 0%;
  min-height: 44px;
  padding: 0.55rem 0.75rem;
  border-radius: 8px;
  background-color: #ffffff;
  border: 1px solid #759c92;
  color: #142724;
  font-size: 0.88rem;
  font-weight: 700;
  line-height: 1.25;
  text-align: center;
  white-space: nowrap;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.16s ease;
  outline: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.s13-option-btn:hover {
  background-color: #f2f8f6;
  border-color: #5f897e;
  transform: translateY(-1.5px);
  box-shadow: 0 3px 7px rgba(0, 0, 0, 0.12);
}

.s13-option-btn:active {
  transform: scale(0.97);
}

.s13-option-btn:focus-visible {
  box-shadow: 0 0 0 3px #1f4d45;
}

/* Selected Button State */
.s13-option-btn--selected {
  background-color: #1f4d45;
  border-color: #153a34;
  color: #ffffff;
  box-shadow: 0 3px 8px rgba(10, 40, 35, 0.28);
}

.s13-option-btn--selected:hover {
  background-color: #19433b;
  color: #ffffff;
}

/* Card Footer / Clear Button matching wireframe */
.s13-card-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-top: 0.65rem;
  height: 22px;
}

.s13-clear-btn {
  background-color: #ffffff;
  border: 1px solid #759c92;
  border-radius: 6px;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #557871;
  font-size: 0.72rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  transition: all 0.15s ease;
  outline: none;
}

.s13-clear-btn:hover {
  background-color: #f7faf9;
  color: #c93b2b;
  border-color: #a6bbb5;
}

.s13-clear-btn:focus-visible {
  box-shadow: 0 0 0 2px #1f4d45;
}

/* Nurse Anna Wrapper */
.s13-nurse-wrap {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  flex-shrink: 0;
  user-select: none;
}

.s13-nurse-img {
  height: 240px;
  width: auto;
  object-fit: contain;
  display: block;
  filter: drop-shadow(0 4px 10px rgba(20, 50, 45, 0.1));
}

/* Navigation Bar */
.s13-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  padding: 0.25rem 0 0.5rem 0;
  flex-shrink: 0;
}

.s13-btn {
  padding: 0.45rem 2.2rem;
  min-height: 42px;
  min-width: 104px;
  border-radius: 9999px;
  font-size: 0.95rem;
  font-weight: 500;
  color: #143833;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
  outline: none;
  cursor: pointer;
  border: none;
  transition: all 0.15s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.s13-btn:active {
  transform: scale(0.96);
}
.s13-btn:focus-visible {
  box-shadow: 0 0 0 4px #236f7a;
}

.s13-btn--back {
  background-color: #adcbc7;
  border: 1px solid #94b9b4;
}
.s13-btn--back:hover {
  background-color: #9cbdb8;
}

.s13-btn--next {
  background-color: #fae98f;
  color: #143833;
  border: 1px solid #dac85e;
}
.s13-btn--next:hover {
  background-color: #f7e37b;
}

.s13-btn--disabled {
  background-color: rgba(250, 233, 143, 0.5);
  color: rgba(20, 56, 51, 0.45);
  border-color: rgba(218, 200, 94, 0.45);
  cursor: not-allowed;
  box-shadow: none;
}

/* Responsive Scaling */
@media (max-height: 700px), (max-width: 860px) {
  .s13-root {
    padding: 1rem 1.75rem 0.5rem 1.75rem;
  }
  .s13-heading {
    font-size: 1.25rem;
  }
  .s13-middle {
    gap: 1.5rem;
  }
  .s13-card {
    padding: 1.25rem 1.4rem 0.9rem 1.4rem;
    max-width: 480px;
  }
  .s13-option-btn {
    min-height: 40px;
    font-size: 0.82rem;
    padding: 0.45rem 0.55rem;
  }
  .s13-nurse-img {
    height: 195px;
  }
  .s13-btn {
    padding: 0.38rem 1.8rem;
    font-size: 0.9rem;
    min-height: 38px;
  }
}

@media (max-width: 720px) {
  .s13-middle {
    flex-direction: column-reverse;
    gap: 1rem;
  }
  .s13-options-row {
    flex-wrap: wrap;
  }
  .s13-option-btn {
    flex: 1 1 45%;
  }
  .s13-nurse-img {
    height: 150px;
  }
}
`;

export interface OnsetOption {
  value: string;
  labelEn: string;
  labelEs: string;
}

export const ONSET_OPTIONS: OnsetOption[] = [
  { value: "<1 hour", labelEn: "<1 hour", labelEs: "<1 hora" },
  { value: "1-24 hours", labelEn: "1-24 hours", labelEs: "1-24 horas" },
  { value: "24+ hours", labelEn: "24+ hours", labelEs: "24+ horas" },
  { value: "Unsure/I don't know", labelEn: "Unsure/I don't know", labelEs: "No estoy seguro" },
];

function isOptionSelected(optValue: string, currentSelected?: string): boolean {
  if (!currentSelected) return false;
  if (currentSelected === optValue) return true;
  const s = currentSelected.toLowerCase().replace(/\s+/g, "");
  const o = optValue.toLowerCase().replace(/\s+/g, "");
  if (s === o) return true;
  if (o.startsWith("<1") && (s.includes("less") || s.includes("<1"))) return true;
  if (o.startsWith("24+") && (s.includes("more") || s.includes("24+"))) return true;
  if (o.includes("unsure") && s.includes("unsure")) return true;
  return false;
}

export interface Slide13OnsetScreenProps {
  isSpanish?: boolean;
  medicationName?: string;
  selected?: string;
  onSelect: (value: string) => void;
  onNext?: () => void;
  onBack?: () => void;
  loading?: boolean;
  navProps?: {
    onNext: (explicitAnswer?: any) => void;
    onBack: () => void;
    loading?: boolean;
    headingRef?: React.RefObject<HTMLHeadingElement | null>;
  };
}

export function Slide13OnsetScreen({
  isSpanish = false,
  medicationName,
  selected,
  onSelect,
  onNext,
  onBack,
  loading = false,
  navProps,
}: Slide13OnsetScreenProps) {
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      headingRef.current?.focus();
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  const rawTitle = isSpanish
    ? "¿Cuándo comenzaron los síntomas de su hijo después de tomar [name]?"
    : "When did your child's symptoms start after taking [name]?";

  const titleText = resolveMedicineToken(rawTitle, medicationName, isSpanish);

  const handleNextClick = () => {
    if (onNext) {
      onNext();
    } else if (navProps?.onNext) {
      navProps.onNext(selected);
    }
  };

  const handleBackClick = () => {
    if (onBack) {
      onBack();
    } else if (navProps?.onBack) {
      navProps.onBack();
    }
  };

  const isLoading = loading || navProps?.loading || false;
  const isNextEnabled = !!selected && !isLoading;

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    let nextIndex = -1;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      nextIndex = (index + 1) % ONSET_OPTIONS.length;
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      nextIndex = (index - 1 + ONSET_OPTIONS.length) % ONSET_OPTIONS.length;
    } else if (e.key === "Home") {
      e.preventDefault();
      nextIndex = 0;
    } else if (e.key === "End") {
      e.preventDefault();
      nextIndex = ONSET_OPTIONS.length - 1;
    }

    if (nextIndex !== -1) {
      const nextOpt = ONSET_OPTIONS[nextIndex];
      onSelect(nextOpt.value);
      buttonRefs.current[nextIndex]?.focus();
    }
  };

  return (
    <div id="slide-content" className="s13-root">
      <style>{SLIDE13_CSS}</style>

      {/* 1. Main Heading */}
      <div className="s13-top-section">
        <h1
          ref={headingRef}
          tabIndex={-1}
          id="slide13-title"
          className="s13-heading"
        >
          {titleText}
        </h1>
      </div>

      {/* 2. Middle Content Area: Rounded Teal Card + Nurse Anna */}
      <div className="s13-middle">
        {/* Teal Rounded Container Card */}
        <div className="s13-card">
          <div
            role="radiogroup"
            aria-labelledby="slide13-title"
            className="s13-options-row"
          >
            {ONSET_OPTIONS.map((opt, index) => {
              const isChecked = isOptionSelected(opt.value, selected);
              const label = isSpanish ? opt.labelEs : opt.labelEn;

              return (
                <button
                  key={opt.value}
                  ref={(el) => {
                    buttonRefs.current[index] = el;
                  }}
                  type="button"
                  role="radio"
                  aria-checked={isChecked}
                  tabIndex={isChecked || (!selected && index === 0) ? 0 : -1}
                  onClick={() => onSelect(opt.value)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  className={`s13-option-btn${isChecked ? " s13-option-btn--selected" : ""}`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Card Footer with Wireframe-spec Clear / Deselect icon */}
          <div className="s13-card-footer">
            <button
              type="button"
              onClick={() => onSelect("")}
              aria-label={isSpanish ? "Borrar selección" : "Clear selection"}
              title={isSpanish ? "Borrar selección" : "Clear selection"}
              className="s13-clear-btn"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Nurse Anna on the right */}
        <div className="s13-nurse-wrap" aria-hidden="true">
          <img
            src="/images/nurse-anna.png"
            alt=""
            className="s13-nurse-img"
          />
        </div>
      </div>

      {/* 3. Bottom Centered Navigation (Back & Next) */}
      <div className="s13-nav">
        <button
          type="button"
          onClick={handleBackClick}
          disabled={isLoading}
          className="s13-btn s13-btn--back"
        >
          {isSpanish ? "Atrás" : "Back"}
        </button>
        <button
          type="button"
          onClick={handleNextClick}
          disabled={!isNextEnabled}
          className={`s13-btn s13-btn--next${!isNextEnabled ? " s13-btn--disabled" : ""}`}
        >
          {isLoading ? "..." : isSpanish ? "Siguiente" : "Next"}
        </button>
      </div>
    </div>
  );
}

export default Slide13OnsetScreen;
