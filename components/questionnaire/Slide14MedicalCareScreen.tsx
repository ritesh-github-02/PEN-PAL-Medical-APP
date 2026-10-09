"use client";

import React, { useState, useRef, useEffect } from "react";

const SLIDE14_CSS = `
/* ==========================================================
   Slide14MedicalCareScreen – Pixel-Perfect Styles Matching Target UI
   ========================================================== */

.s14-root,
.s14-root *,
.s14-root *::before,
.s14-root *::after {
  box-sizing: border-box;
}

.s14-root {
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
.s14-top-section {
  width: 100%;
  text-align: center;
  margin: 0;
  padding: 0;
  flex-shrink: 0;
}
.s14-heading {
  font-size: 1.55rem;
  line-height: 1.35;
  font-weight: 700;
  color: #142724;
  letter-spacing: -0.015em;
  margin: 0;
  outline: none;
}
.s14-heading:focus-visible {
  box-shadow: 0 0 0 2px #236f7a;
}

/* Middle Section: Teal Card + Nurse Anna */
.s14-middle {
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
.s14-card {
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
.s14-options-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  width: 100%;
}

/* White Option Buttons inside Teal Card */
.s14-option-btn {
  flex: 1 1 0%;
  min-height: 44px;
  padding: 0.55rem 0.85rem;
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

.s14-option-btn:hover {
  background-color: #f2f8f6;
  border-color: #5f897e;
  transform: translateY(-1.5px);
  box-shadow: 0 3px 7px rgba(0, 0, 0, 0.12);
}

.s14-option-btn:active {
  transform: scale(0.97);
}

.s14-option-btn:focus-visible {
  box-shadow: 0 0 0 3px #1f4d45;
}

/* Selected Button State */
.s14-option-btn--selected {
  background-color: #1f4d45;
  border-color: #153a34;
  color: #ffffff;
  box-shadow: 0 3px 8px rgba(10, 40, 35, 0.28);
}

.s14-option-btn--selected:hover {
  background-color: #19433b;
  color: #ffffff;
}

/* Location Badge inside Card (when Yes is chosen) */
.s14-location-badge {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(20, 58, 52, 0.25);
  border-radius: 8px;
  padding: 0.35rem 0.65rem;
  margin-top: 0.55rem;
  font-size: 0.8rem;
  color: #143833;
}

.s14-location-change-btn {
  background: none;
  border: none;
  color: #1f4d45;
  font-weight: 700;
  text-decoration: underline;
  cursor: pointer;
  padding: 0;
  margin-left: 0.5rem;
  font-size: 0.78rem;
}

/* Card Footer with Wireframe-spec Clear / Deselect icon */
.s14-card-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-top: 0.65rem;
  height: 22px;
}

.s14-clear-btn {
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

.s14-clear-btn:hover {
  background-color: #f7faf9;
  color: #c93b2b;
  border-color: #a6bbb5;
}

.s14-clear-btn:focus-visible {
  box-shadow: 0 0 0 2px #1f4d45;
}

/* Nurse Anna Wrapper */
.s14-nurse-wrap {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  flex-shrink: 0;
  user-select: none;
}

.s14-nurse-img {
  height: 240px;
  width: auto;
  object-fit: contain;
  display: block;
  filter: drop-shadow(0 4px 10px rgba(20, 50, 45, 0.1));
}

/* Navigation Bar */
.s14-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  padding: 0;
  margin: 0;
  flex-shrink: 0;
}

.s14-btn {
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
.s14-btn:active {
  transform: scale(0.96);
}
.s14-btn:focus-visible {
  box-shadow: 0 0 0 4px #236f7a;
}

.s14-btn--back {
  background-color: #adcbc7;
  border: 1px solid #94b9b4;
}
.s14-btn--back:hover {
  background-color: #9cbdb8;
}

.s14-btn--next {
  background-color: #fae98f;
  color: #143833;
  border: 1px solid #dac85e;
}
.s14-btn--next:hover {
  background-color: #f7e37b;
}

.s14-btn--disabled {
  background-color: rgba(250, 233, 143, 0.5);
  color: rgba(20, 56, 51, 0.45);
  border-color: rgba(218, 200, 94, 0.45);
  cursor: not-allowed;
  box-shadow: none;
}

/* ==========================================================
   Modal 15: Care Location Dialog Styles
   ========================================================== */
.s14-modal-overlay {
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

.s14-modal-card {
  background-color: #f7f4ec;
  border: 1.5px solid #d8d2c2;
  border-radius: 18px;
  padding: 1.5rem 1.65rem 1.15rem 1.65rem;
  max-width: 490px;
  width: 100%;
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.22);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  animation: s14FadeIn 0.18s ease-out;
}

@keyframes s14FadeIn {
  from { opacity: 0; transform: scale(0.96); }
  to { opacity: 1; transform: scale(1); }
}

.s14-modal-heading {
  font-size: 1.15rem;
  font-weight: 700;
  line-height: 1.3;
  color: #142724;
  margin: 0;
  text-align: center;
  outline: none;
}

.s14-modal-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.65rem;
  width: 100%;
}

.s14-modal-btn {
  min-height: 44px;
  padding: 0.55rem 0.65rem;
  border-radius: 8px;
  background-color: #ffffff;
  border: 1px solid #759c92;
  color: #142724;
  font-size: 0.85rem;
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
  white-space: pre-line;
}

.s14-modal-btn:hover {
  background-color: #f2f8f6;
  border-color: #5f897e;
  transform: translateY(-1px);
}

.s14-modal-btn--selected {
  background-color: #1f4d45;
  border-color: #153a34;
  color: #ffffff;
  box-shadow: 0 3px 8px rgba(10, 40, 35, 0.28);
}

.s14-modal-btn--selected:hover {
  background-color: #19433b;
  color: #ffffff;
}

.s14-modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  height: 22px;
  margin-top: 0.25rem;
}

.s14-modal-close-btn {
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

.s14-modal-close-btn:hover {
  background-color: #f7faf9;
  color: #c93b2b;
  border-color: #a6bbb5;
}

/* Responsive Scaling */
@media (max-height: 700px), (max-width: 860px) {
  .s14-root {
    padding: 1rem 1.75rem 0.5rem 1.75rem;
  }
  .s14-heading {
    font-size: 1.25rem;
  }
  .s14-middle {
    gap: 1.5rem;
  }
  .s14-card {
    padding: 1.25rem 1.4rem 0.9rem 1.4rem;
    max-width: 460px;
  }
  .s14-option-btn {
    min-height: 40px;
    font-size: 0.84rem;
    padding: 0.45rem 0.65rem;
  }
  .s14-nurse-img {
    height: 195px;
  }
  .s14-btn {
    padding: 0.38rem 1.8rem;
    font-size: 0.9rem;
    min-height: 38px;
  }
}

@media (max-width: 720px) {
  .s14-middle {
    flex-direction: column-reverse;
    gap: 1rem;
  }
  .s14-options-row {
    flex-wrap: wrap;
  }
  .s14-option-btn {
    flex: 1 1 45%;
  }
  .s14-nurse-img {
    height: 150px;
  }
}
`;

export interface CareOption {
  value: string;
  labelEn: string;
  labelEs: string;
}

export const CARE_OPTIONS: CareOption[] = [
  { value: "Yes", labelEn: "Yes", labelEs: "Sí" },
  { value: "No", labelEn: "No", labelEs: "No" },
  { value: "Unsure", labelEn: "Unsure/I don't know", labelEs: "No estoy seguro" },
];

export const LOCATION_OPTIONS = [
  { value: "Emergency room (ER)", labelEn: "Emergency room\n(ER)", labelEs: "Sala de emergencias\n(ER)" },
  { value: "Urgent care", labelEn: "Urgent care", labelEs: "Centro de urgencias" },
  { value: "Primary care doctor", labelEn: "Primary care doctor", labelEs: "Médico de atención primaria" },
  { value: "Hospital", labelEn: "Hospital", labelEs: "Hospital" },
  { value: "Phone call with doctor", labelEn: "Phone call with doctor", labelEs: "Llamada con el médico" },
  { value: "Unsure", labelEn: "Unsure/I don't know", labelEs: "No estoy seguro" },
];

function isCareSelected(optValue: string, currentSelected?: string): boolean {
  if (!currentSelected) return false;
  if (currentSelected === optValue) return true;
  if (optValue === "Unsure" && currentSelected.toLowerCase().includes("unsure")) return true;
  return false;
}

function isLocationSelected(optValue: string, currentLocation?: string): boolean {
  if (!currentLocation) return false;
  if (currentLocation === optValue) return true;
  if (optValue === "Unsure" && currentLocation.toLowerCase().includes("unsure")) return true;
  return false;
}

export interface Slide14MedicalCareScreenProps {
  isSpanish?: boolean;
  selected?: string;
  locationSelected?: string;
  onSelect: (val: string) => void;
  onLocationSelect: (loc: string) => void;
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

export function Slide14MedicalCareScreen({
  isSpanish = false,
  selected,
  locationSelected,
  onSelect,
  onLocationSelect,
  onNext,
  onBack,
  loading = false,
  navProps,
}: Slide14MedicalCareScreenProps) {
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
      onLocationSelect("");
    }
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

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    let nextIndex = -1;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      nextIndex = (index + 1) % CARE_OPTIONS.length;
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      nextIndex = (index - 1 + CARE_OPTIONS.length) % CARE_OPTIONS.length;
    } else if (e.key === "Home") {
      e.preventDefault();
      nextIndex = 0;
    } else if (e.key === "End") {
      e.preventDefault();
      nextIndex = CARE_OPTIONS.length - 1;
    }

    if (nextIndex !== -1) {
      const nextOpt = CARE_OPTIONS[nextIndex];
      handleMainOption(nextOpt.value);
      buttonRefs.current[nextIndex]?.focus();
    }
  };

  const selectedLocLabel = isSpanish
    ? LOCATION_OPTIONS.find((l) => isLocationSelected(l.value, locationSelected))?.labelEs || locationSelected
    : LOCATION_OPTIONS.find((l) => isLocationSelected(l.value, locationSelected))?.labelEn?.replace("\n", " ") || locationSelected;

  return (
    <div id="slide-content" className="s14-root">
      <style>{SLIDE14_CSS}</style>

      {/* 1. Main Heading */}
      <div className="s14-top-section">
        <h1
          ref={headingRef}
          tabIndex={-1}
          id="slide14-title"
          className="s14-heading"
        >
          {isSpanish
            ? "¿Su hijo recibió atención médica por su reacción?"
            : "Did your child receive medical care for their reaction?"}
        </h1>
      </div>

      {/* 2. Middle Content Area: Rounded Teal Card + Nurse Anna */}
      <div className="s14-middle">
        {/* Teal Rounded Container Card */}
        <div className="s14-card">
          <div
            role="radiogroup"
            aria-labelledby="slide14-title"
            className="s14-options-row"
          >
            {CARE_OPTIONS.map((opt, index) => {
              const isChecked = isCareSelected(opt.value, selected);
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
                  onClick={() => handleMainOption(opt.value)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  className={`s14-option-btn${isChecked ? " s14-option-btn--selected" : ""}`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Selected Location Indicator (when Yes was chosen) */}
          {selected === "Yes" && locationSelected && (
            <div className="s14-location-badge">
              <span>
                <strong>{isSpanish ? "Lugar: " : "Location: "}</strong>
                {selectedLocLabel}
              </span>
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="s14-location-change-btn"
              >
                {isSpanish ? "Cambiar" : "Change"}
              </button>
            </div>
          )}

          {/* Card Footer with Wireframe-spec Clear / Deselect icon */}
          <div className="s14-card-footer">
            <button
              type="button"
              onClick={() => {
                onSelect("");
                onLocationSelect("");
              }}
              aria-label={isSpanish ? "Borrar selección" : "Clear selection"}
              title={isSpanish ? "Borrar selección" : "Clear selection"}
              className="s14-clear-btn"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Nurse Anna on the right */}
        <div className="s14-nurse-wrap" aria-hidden="true">
          <img
            src="/images/nurse-anna.png"
            alt=""
            className="s14-nurse-img"
          />
        </div>
      </div>

      {/* 3. Bottom Centered Navigation (Back & Next) */}
      <div className="s14-nav">
        <button
          type="button"
          onClick={handleBackClick}
          disabled={isLoading}
          className="s14-btn s14-btn--back"
        >
          {isSpanish ? "Atrás" : "Back"}
        </button>
        <button
          type="button"
          onClick={handleNextClick}
          disabled={!isNextEnabled}
          className={`s14-btn s14-btn--next${!isNextEnabled ? " s14-btn--disabled" : ""}`}
        >
          {isLoading ? "..." : isSpanish ? "Siguiente" : "Next"}
        </button>
      </div>

      {/* ==========================================================
          MODAL 15: Where did your child get medical care?
          ========================================================== */}
      {modalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-15-heading"
          className="s14-modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalOpen(false);
          }}
        >
          <div className="s14-modal-card">
            <h2
              id="modal-15-heading"
              ref={modalHeadingRef}
              tabIndex={-1}
              className="s14-modal-heading"
            >
              {isSpanish
                ? "¿Dónde recibió atención médica para la reacción?"
                : "Where did your child get medical care for the reaction?"}
            </h2>

            <div className="s14-modal-grid">
              {LOCATION_OPTIONS.map((loc) => {
                const isLocChecked = isLocationSelected(loc.value, locationSelected);
                const locLabel = isSpanish ? loc.labelEs : loc.labelEn;

                return (
                  <button
                    key={loc.value}
                    type="button"
                    onClick={() => {
                      onLocationSelect(loc.value);
                      setModalOpen(false);
                    }}
                    className={`s14-modal-btn${isLocChecked ? " s14-modal-btn--selected" : ""}`}
                  >
                    {locLabel}
                  </button>
                );
              })}
            </div>

            <div className="s14-modal-footer">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                aria-label={isSpanish ? "Cerrar" : "Close"}
                title={isSpanish ? "Cerrar" : "Close"}
                className="s14-modal-close-btn"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Slide14MedicalCareScreen;
