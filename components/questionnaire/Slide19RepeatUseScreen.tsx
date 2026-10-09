"use client";

import React, { useState, useRef, useEffect } from "react";

const SLIDE19_CSS = `
/* ==========================================================
   Slide19RepeatUseScreen – Pixel-Perfect Styles Matching Target UI
   ========================================================== */

.s19-root,
.s19-root *,
.s19-root *::before,
.s19-root *::after {
  box-sizing: border-box;
}

.s19-root {
  position: relative;
  width: 100%;
  height: 100%;
  flex: 1 1 0%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #f4f8ec;
  padding: 1.25rem 2.5rem 1rem 2.5rem;
  overflow: hidden;
  gap: clamp(1.75rem, 4.5vh, 2.75rem);
}

/* Heading */
.s19-top-section {
  width: 100%;
  text-align: center;
  margin: 0;
  padding: 0;
  flex-shrink: 0;
}
.s19-heading {
  font-size: 1.55rem;
  line-height: 1.35;
  font-weight: 700;
  color: #142724;
  letter-spacing: -0.015em;
  margin: 0;
  outline: none;
}
.s19-heading:focus-visible {
  box-shadow: 0 0 0 2px #236f7a;
}

/* Middle Section: Teal Card + Nurse Anna */
.s19-middle {
  flex-shrink: 0;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2.5rem;
  margin: 0;
  padding: 0;
}

/* Main Rounded Teal Card Container */
.s19-card {
  background-color: #8cb2a7;
  border: 1.5px solid #759c92;
  border-radius: 20px;
  padding: 1.6rem 1.85rem 1.1rem 1.85rem;
  box-shadow: 0 4px 14px rgba(20, 55, 50, 0.12);
  display: flex;
  flex-direction: column;
  align-items: stretch;
  max-width: 560px;
  width: 100%;
  transition: all 0.2s ease;
}

/* Options Row */
.s19-options-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  width: 100%;
}

/* White Option Buttons inside Teal Card */
.s19-option-btn {
  min-height: 44px;
  padding: 0.55rem 1.1rem;
  border-radius: 8px;
  background-color: #ffffff;
  border: 1px solid #759c92;
  color: #142724;
  font-size: 0.9rem;
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

.s19-option-btn--compact {
  padding: 0.55rem 1rem;
  min-width: 60px;
}

.s19-option-btn--wide {
  padding: 0.55rem 1.15rem;
}

.s19-option-btn:hover {
  background-color: #f2f8f6;
  border-color: #5f897e;
  transform: translateY(-1.5px);
  box-shadow: 0 3px 7px rgba(0, 0, 0, 0.12);
}

.s19-option-btn:active {
  transform: scale(0.97);
}

.s19-option-btn:focus-visible {
  box-shadow: 0 0 0 3px #1f4d45;
}

/* Selected Button State */
.s19-option-btn--selected {
  background-color: #1f4d45;
  border-color: #153a34;
  color: #ffffff;
  box-shadow: 0 3px 8px rgba(10, 40, 35, 0.28);
}

.s19-option-btn--selected:hover {
  background-color: #19433b;
  color: #ffffff;
}

/* Detail Badge inside Card (when Yes is chosen) */
.s19-detail-badge {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(20, 58, 52, 0.25);
  border-radius: 8px;
  padding: 0.4rem 0.75rem;
  margin-top: 0.65rem;
  font-size: 0.8rem;
  color: #143833;
}

.s19-detail-badge-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.s19-change-btn {
  background: none;
  border: none;
  color: #1f4d45;
  font-weight: 700;
  text-decoration: underline;
  cursor: pointer;
  padding: 0;
  margin-left: 0.5rem;
  font-size: 0.78rem;
  shrink: 0;
}

/* Card Footer with Wireframe-spec Clear / Deselect icon & marker */
.s19-card-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 0.65rem;
  height: 22px;
}

.s19-wireframe-marker {
  font-family: monospace;
  font-size: 0.68rem;
  color: #4b6f67;
  user-select: none;
}

.s19-clear-btn {
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

.s19-clear-btn:hover {
  background-color: #f7faf9;
  color: #c93b2b;
  border-color: #a6bbb5;
}

.s19-clear-btn:focus-visible {
  box-shadow: 0 0 0 2px #1f4d45;
}

/* Nurse Anna Wrapper */
.s19-nurse-wrap {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  flex-shrink: 0;
  user-select: none;
}

.s19-nurse-img {
  height: 240px;
  width: auto;
  object-fit: contain;
  display: block;
  filter: drop-shadow(0 4px 10px rgba(20, 50, 45, 0.1));
}

/* Navigation Bar */
.s19-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  padding: 0;
  margin: 0;
  flex-shrink: 0;
}

.s19-btn {
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
.s19-btn:active {
  transform: scale(0.96);
}
.s19-btn:focus-visible {
  box-shadow: 0 0 0 4px #236f7a;
}

.s19-btn--back {
  background-color: #adcbc7;
  border: 1px solid #94b9b4;
}
.s19-btn--back:hover {
  background-color: #9cbdb8;
}

.s19-btn--next {
  background-color: #fae98f;
  color: #143833;
  border: 1px solid #dac85e;
}
.s19-btn--next:hover {
  background-color: #f7e37b;
}

.s19-btn--disabled {
  background-color: rgba(250, 233, 143, 0.5);
  color: rgba(20, 56, 51, 0.45);
  border-color: rgba(218, 200, 94, 0.45);
  cursor: not-allowed;
  box-shadow: none;
}

/* ==========================================================
   MODAL 20: Repeat Exposure Detail (Matches Spec p17_10.png)
   ========================================================== */
.s19-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background-color: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(2px);
}

.s19-modal-card {
  background-color: #f7f4ec;
  border: 1.5px solid #d8d2c2;
  border-radius: 18px;
  padding: 1.5rem 1.65rem 1.15rem 1.65rem;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.22);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  animation: s19FadeIn 0.18s ease-out;
}

@keyframes s19FadeIn {
  from { opacity: 0; transform: scale(0.96); }
  to { opacity: 1; transform: scale(1); }
}

.s19-modal-heading {
  font-size: 1.12rem;
  font-weight: 700;
  line-height: 1.35;
  color: #142724;
  margin: 0;
  text-align: center;
  outline: none;
}

.s19-modal-options {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  width: 100%;
}

.s19-modal-row {
  display: flex;
  gap: 0.65rem;
  width: 100%;
}

.s19-modal-btn {
  min-height: 44px;
  padding: 0.55rem 0.85rem;
  border-radius: 8px;
  background-color: #ffffff;
  border: 1px solid #759c92;
  color: #142724;
  font-size: 0.86rem;
  font-weight: 700;
  line-height: 1.25;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.15s ease;
  outline: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.s19-modal-btn--full {
  width: 100%;
}

.s19-modal-btn--half {
  flex: 1 1 0%;
}

.s19-modal-btn:hover {
  background-color: #f2f8f6;
  border-color: #5f897e;
  transform: translateY(-1px);
}

.s19-modal-btn--selected {
  background-color: #1f4d45;
  border-color: #153a34;
  color: #ffffff;
  box-shadow: 0 3px 8px rgba(10, 40, 35, 0.28);
}

.s19-modal-btn--selected:hover {
  background-color: #19433b;
  color: #ffffff;
}

.s19-modal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.25rem;
}

.s19-modal-close-wrap {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: auto;
}

.s19-modal-close-btn {
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

.s19-modal-close-btn:hover {
  background-color: #f7faf9;
  color: #c93b2b;
  border-color: #a6bbb5;
}

/* Responsive Scaling */
@media (max-height: 700px), (max-width: 860px) {
  .s19-root {
    padding: 1rem 1.75rem 0.5rem 1.75rem;
  }
  .s19-heading {
    font-size: 1.25rem;
  }
  .s19-middle {
    gap: 1.5rem;
  }
  .s19-card {
    padding: 1.25rem 1.4rem 0.9rem 1.4rem;
    max-width: 470px;
  }
  .s19-option-btn {
    min-height: 40px;
    font-size: 0.84rem;
    padding: 0.45rem 0.85rem;
  }
  .s19-nurse-img {
    height: 195px;
  }
  .s19-btn {
    padding: 0.38rem 1.8rem;
    font-size: 0.9rem;
    min-height: 38px;
  }
}

@media (max-width: 720px) {
  .s19-middle {
    flex-direction: column-reverse;
    gap: 1rem;
  }
  .s19-options-row {
    flex-wrap: wrap;
  }
  .s19-option-btn {
    flex: 1 1 45%;
  }
  .s19-nurse-img {
    height: 150px;
  }
  .s19-modal-row {
    flex-direction: column;
  }
}
`;

export interface Slide19RepeatUseScreenProps {
  isSpanish?: boolean;
  selected?: string;
  reactionDetailSelected?: string;
  onSelect: (val: string) => void;
  onReactionDetailSelect: (detail: string) => void;
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

export interface RepeatOption {
  value: string;
  labelEn: string;
  labelEs: string;
  variant?: "compact" | "wide";
}

export const REPEAT_OPTIONS: RepeatOption[] = [
  { value: "Yes", labelEn: "Yes", labelEs: "Sí", variant: "compact" },
  { value: "No", labelEn: "No", labelEs: "No", variant: "compact" },
  { value: "Unsure", labelEn: "Unsure/I don't know", labelEs: "No estoy seguro/ No lo sé", variant: "wide" },
];

export const REPEAT_DETAIL_OPTIONS = [
  {
    value: "Yes, and they did not have a reaction",
    labelEn: "Yes, and they did not have a reaction",
    labelEs: "Sí, y no tuvieron reacción",
  },
  {
    value: "Yes, and they had a reaction",
    labelEn: "Yes, and they had a reaction",
    labelEs: "Sí, y tuvieron reacción",
  },
  {
    value: "Unsure",
    labelEn: "Unsure / I don't know",
    labelEs: "No estoy seguro/ No lo sé",
  },
];

function isRepeatSelected(optValue: string, currentSelected?: string): boolean {
  if (!currentSelected) return false;
  if (currentSelected === optValue) return true;
  if (optValue === "Unsure" && (currentSelected.toLowerCase().includes("unsure") || currentSelected.toLowerCase().includes("know"))) {
    return true;
  }
  return false;
}

function isDetailSelected(optValue: string, currentSelected?: string): boolean {
  if (!currentSelected) return false;
  if (currentSelected === optValue) return true;
  if (optValue === "Unsure" && (currentSelected.toLowerCase().includes("unsure") || currentSelected.toLowerCase().includes("know"))) {
    return true;
  }
  return false;
}

export function Slide19RepeatUseScreen({
  isSpanish = false,
  selected,
  reactionDetailSelected,
  onSelect,
  onReactionDetailSelect,
  onNext,
  onBack,
  loading = false,
  navProps,
}: Slide19RepeatUseScreenProps) {
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const modalHeadingRef = useRef<HTMLHeadingElement | null>(null);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      headingRef.current?.focus();
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!modalOpen) return;
    const timer = setTimeout(() => {
      modalHeadingRef.current?.focus();
    }, 50);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setModalOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [modalOpen]);

  const handleMainOption = (val: string) => {
    onSelect(val);
    if (val === "Yes") {
      setModalOpen(true);
    } else {
      onReactionDetailSelect("");
    }
  };

  const handleClear = () => {
    onSelect("");
    onReactionDetailSelect("");
  };

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

  const handleArrowKeyDown = (e: React.KeyboardEvent, index: number) => {
    let nextIndex = -1;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      nextIndex = (index + 1) % REPEAT_OPTIONS.length;
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      nextIndex = (index - 1 + REPEAT_OPTIONS.length) % REPEAT_OPTIONS.length;
    } else if (e.key === "Home") {
      e.preventDefault();
      nextIndex = 0;
    } else if (e.key === "End") {
      e.preventDefault();
      nextIndex = REPEAT_OPTIONS.length - 1;
    }

    if (nextIndex !== -1) {
      const nextOpt = REPEAT_OPTIONS[nextIndex];
      handleMainOption(nextOpt.value);
      buttonRefs.current[nextIndex]?.focus();
    }
  };

  const selectedDetailObj = REPEAT_DETAIL_OPTIONS.find((d) => isDetailSelected(d.value, reactionDetailSelected));
  const selectedDetailLabel = isSpanish
    ? selectedDetailObj?.labelEs || reactionDetailSelected
    : selectedDetailObj?.labelEn || reactionDetailSelected;

  return (
    <div id="slide-content" className="s19-root">
      <style>{SLIDE19_CSS}</style>

      {/* 1. Main Heading */}
      <div className="s19-top-section">
        <h1
          ref={headingRef}
          tabIndex={-1}
          id="slide19-title"
          className="s19-heading"
        >
          {isSpanish
            ? "¿Ha recibido su hijo penicilina desde la reacción?"
            : "Has your child received penicillin since the reaction?"}
        </h1>
      </div>

      {/* 2. Middle Content Area: Rounded Teal Card + Nurse Anna */}
      <div className="s19-middle">
        {/* Teal Rounded Container Card */}
        <div className="s19-card">
          <div
            role="radiogroup"
            aria-labelledby="slide19-title"
            className="s19-options-row"
          >
            {REPEAT_OPTIONS.map((opt, index) => {
              const isChecked = isRepeatSelected(opt.value, selected);
              const label = isSpanish ? opt.labelEs : opt.labelEn;
              const sizeClass = opt.variant === "compact" ? " s19-option-btn--compact" : " s19-option-btn--wide";

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
                  onClick={() => handleMainOption(opt.value)}
                  onKeyDown={(e) => handleArrowKeyDown(e, index)}
                  className={`s19-option-btn${sizeClass}${isChecked ? " s19-option-btn--selected" : ""}`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Active Detail Badge (when Yes was chosen) */}
          {selected === "Yes" && reactionDetailSelected && (
            <div className="s19-detail-badge">
              <span className="s19-detail-badge-text">
                <strong>{isSpanish ? "Detalle: " : "Detail: "}</strong>
                {selectedDetailLabel}
              </span>
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="s19-change-btn"
              >
                {isSpanish ? "Cambiar" : "Change"}
              </button>
            </div>
          )}

          {/* Card Footer with Wireframe-spec Clear / Deselect icon */}
          <div className="s19-card-footer">
            <span className="s19-wireframe-marker" aria-hidden="true">7-6</span>
            <button
              type="button"
              onClick={handleClear}
              aria-label={isSpanish ? "Borrar selección" : "Clear selection"}
              title={isSpanish ? "Borrar selección" : "Clear selection"}
              className="s19-clear-btn"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Nurse Anna on the right */}
        <div className="s19-nurse-wrap" aria-hidden="true">
          <img
            src="/images/nurse-anna.png"
            alt=""
            className="s19-nurse-img"
          />
        </div>
      </div>

      {/* 3. Bottom Centered Navigation (Back & Next) */}
      <div className="s19-nav">
        <button
          type="button"
          onClick={handleBackClick}
          disabled={isLoading}
          className="s19-btn s19-btn--back"
        >
          {isSpanish ? "Atrás" : "Back"}
        </button>
        <button
          type="button"
          onClick={handleNextClick}
          disabled={!isNextEnabled}
          className={`s19-btn s19-btn--next${!isNextEnabled ? " s19-btn--disabled" : ""}`}
        >
          {isLoading ? "..." : isSpanish ? "Siguiente" : "Next"}
        </button>
      </div>

      {/* ==========================================================
          MODAL 20: Repeat Exposure Detail (Matches Spec p17_10.png)
          ========================================================== */}
      {modalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-20-heading"
          className="s19-modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalOpen(false);
          }}
        >
          <div className="s19-modal-card">
            <h2
              id="modal-20-heading"
              ref={modalHeadingRef}
              tabIndex={-1}
              className="s19-modal-heading"
            >
              {isSpanish
                ? "¿Ha tomado su hijo penicilina (amoxicilina) nuevamente desde la reacción?"
                : "Has your child taken penicillin (amoxicillin) again since the reaction?"}
            </h2>

            <div className="s19-modal-options">
              {/* Option 1: Full width on top */}
              {(() => {
                const opt1 = REPEAT_DETAIL_OPTIONS[0];
                const isChecked1 = isDetailSelected(opt1.value, reactionDetailSelected);
                const label1 = isSpanish ? opt1.labelEs : opt1.labelEn;
                return (
                  <button
                    type="button"
                    onClick={() => {
                      onReactionDetailSelect(opt1.value);
                      setModalOpen(false);
                    }}
                    className={`s19-modal-btn s19-modal-btn--full${isChecked1 ? " s19-modal-btn--selected" : ""}`}
                  >
                    {label1}
                  </button>
                );
              })()}

              {/* Options 2 & 3: Side-by-side row */}
              <div className="s19-modal-row">
                {REPEAT_DETAIL_OPTIONS.slice(1).map((opt) => {
                  const isChecked = isDetailSelected(opt.value, reactionDetailSelected);
                  const label = isSpanish ? opt.labelEs : opt.labelEn;

                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        onReactionDetailSelect(opt.value);
                        setModalOpen(false);
                      }}
                      className={`s19-modal-btn s19-modal-btn--half${isChecked ? " s19-modal-btn--selected" : ""}`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="s19-modal-footer">
              <div className="s19-modal-close-wrap">
                <span className="s19-wireframe-marker" aria-hidden="true">7-5-1</span>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  aria-label={isSpanish ? "Cerrar" : "Close"}
                  title={isSpanish ? "Cerrar" : "Close"}
                  className="s19-modal-close-btn"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Slide19RepeatUseScreen;
