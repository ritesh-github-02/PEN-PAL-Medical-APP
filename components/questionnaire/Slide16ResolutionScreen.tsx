"use client";

import React, { useState, useRef, useEffect } from "react";

const SLIDE16_CSS = `
/* ==========================================================
   Slide16ResolutionScreen – Pixel-Perfect Styles Matching Target UI
   ========================================================== */

.s16-root,
.s16-root *,
.s16-root *::before,
.s16-root *::after {
  box-sizing: border-box;
}

.s16-root {
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
.s16-top-section {
  width: 100%;
  text-align: center;
  margin-top: 0.25rem;
  margin-bottom: 0.5rem;
  flex-shrink: 0;
}
.s16-heading {
  font-size: 1.42rem;
  line-height: 1.35;
  font-weight: 700;
  color: #142724;
  letter-spacing: -0.015em;
  margin: 0;
  outline: none;
}
.s16-heading:focus-visible {
  box-shadow: 0 0 0 2px #236f7a;
}

/* Middle Section: Teal Card + Nurse Anna */
.s16-middle {
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
.s16-card {
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
.s16-options-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  width: 100%;
}

/* White Option Buttons inside Teal Card */
.s16-option-btn {
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

.s16-option-btn:hover {
  background-color: #f2f8f6;
  border-color: #5f897e;
  transform: translateY(-1.5px);
  box-shadow: 0 3px 7px rgba(0, 0, 0, 0.12);
}

.s16-option-btn:active {
  transform: scale(0.97);
}

.s16-option-btn:focus-visible {
  box-shadow: 0 0 0 3px #1f4d45;
}

/* Selected Button State */
.s16-option-btn--selected {
  background-color: #1f4d45;
  border-color: #153a34;
  color: #ffffff;
  box-shadow: 0 3px 8px rgba(10, 40, 35, 0.28);
}

.s16-option-btn--selected:hover {
  background-color: #19433b;
  color: #ffffff;
}

/* Medication & Route Badge inside Card (when With medication is chosen) */
.s16-meds-badge {
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

.s16-meds-badge-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.s16-change-btn {
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
.s16-card-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 0.65rem;
  height: 22px;
}

.s16-wireframe-marker {
  font-family: monospace;
  font-size: 0.68rem;
  color: #4b6f67;
  user-select: none;
}

.s16-clear-btn {
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

.s16-clear-btn:hover {
  background-color: #f7faf9;
  color: #c93b2b;
  border-color: #a6bbb5;
}

.s16-clear-btn:focus-visible {
  box-shadow: 0 0 0 2px #1f4d45;
}

/* Nurse Anna Wrapper */
.s16-nurse-wrap {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  flex-shrink: 0;
  user-select: none;
}

.s16-nurse-img {
  height: 240px;
  width: auto;
  object-fit: contain;
  display: block;
  filter: drop-shadow(0 4px 10px rgba(20, 50, 45, 0.1));
}

/* Navigation Bar */
.s16-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  padding: 0.25rem 0 0.5rem 0;
  flex-shrink: 0;
}

.s16-btn {
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
.s16-btn:active {
  transform: scale(0.96);
}
.s16-btn:focus-visible {
  box-shadow: 0 0 0 4px #236f7a;
}

.s16-btn--back {
  background-color: #adcbc7;
  border: 1px solid #94b9b4;
}
.s16-btn--back:hover {
  background-color: #9cbdb8;
}

.s16-btn--next {
  background-color: #fae98f;
  color: #143833;
  border: 1px solid #dac85e;
}
.s16-btn--next:hover {
  background-color: #f7e37b;
}

.s16-btn--disabled {
  background-color: rgba(250, 233, 143, 0.5);
  color: rgba(20, 56, 51, 0.45);
  border-color: rgba(218, 200, 94, 0.45);
  cursor: not-allowed;
  box-shadow: none;
}

/* ==========================================================
   Modal 17: Medication Selection (Matches Spec p17_4.png)
   ========================================================== */
.s16-modal-overlay {
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

.s16-modal17-card {
  background-color: #f7f4ec;
  border: 1.5px solid #d8d2c2;
  border-radius: 18px;
  padding: 1.5rem 1.65rem 1.15rem 1.65rem;
  max-width: 530px;
  width: 100%;
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.22);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  animation: s16FadeIn 0.18s ease-out;
}

@keyframes s16FadeIn {
  from { opacity: 0; transform: scale(0.96); }
  to { opacity: 1; transform: scale(1); }
}

.s16-modal-heading {
  font-size: 1.15rem;
  font-weight: 700;
  line-height: 1.3;
  color: #142724;
  margin: 0;
  text-align: center;
  outline: none;
}

.s16-modal17-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  width: 100%;
}

.s16-med-btn {
  min-height: 48px;
  padding: 0.55rem 0.75rem;
  border-radius: 8px;
  background-color: #fae255;
  border: 1.5px solid #dac85e;
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

.s16-med-btn:hover {
  background-color: #f5da3d;
  transform: translateY(-1px);
}

.s16-med-btn--selected {
  background-color: #1f4d45;
  border-color: #153a34;
  color: #ffffff;
  box-shadow: 0 3px 8px rgba(10, 40, 35, 0.28);
}

.s16-med-btn--selected:hover {
  background-color: #19433b;
  color: #ffffff;
}

.s16-modal17-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.25rem;
  padding-top: 0.4rem;
}

.s16-more-questions-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background-color: #236f7a;
  color: #ffffff;
  border: none;
  border-radius: 9999px;
  padding: 0.45rem 1.15rem;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.12);
  transition: all 0.15s ease;
}

.s16-more-questions-btn:hover {
  background-color: #1a555e;
  transform: translateY(-1px);
}

.s16-modal-close-wrap {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.s16-modal-close-btn {
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

.s16-modal-close-btn:hover {
  background-color: #f7faf9;
  color: #c93b2b;
  border-color: #a6bbb5;
}

/* ==========================================================
   Modal 18: Route Administered (Matches Spec p17_6.png)
   ========================================================== */
.s16-modal18-card {
  background-color: #8cb2a7;
  border: 1.5px solid #759c92;
  border-radius: 18px;
  padding: 1.5rem 1.65rem 1.15rem 1.65rem;
  max-width: 530px;
  width: 100%;
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.22);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  animation: s16FadeIn 0.18s ease-out;
}

.s16-modal18-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  width: 100%;
}

.s16-route-btn {
  flex: 1 1 0%;
  min-height: 42px;
  padding: 0.5rem 0.65rem;
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
  white-space: nowrap;
}

.s16-route-btn:hover {
  background-color: #f2f8f6;
  border-color: #5f897e;
  transform: translateY(-1px);
}

.s16-route-btn--selected {
  background-color: #1f4d45;
  border-color: #153a34;
  color: #ffffff;
  box-shadow: 0 3px 8px rgba(10, 40, 35, 0.28);
}

.s16-route-btn--selected:hover {
  background-color: #19433b;
  color: #ffffff;
}

.s16-modal18-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.25rem;
}

.s16-save-continue-btn {
  background-color: #1f4d45;
  color: #ffffff;
  border: none;
  border-radius: 9999px;
  padding: 0.4rem 1.1rem;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.12);
  transition: all 0.15s ease;
}

.s16-save-continue-btn:hover {
  background-color: #153a34;
  transform: translateY(-1px);
}

/* Responsive Scaling */
@media (max-height: 700px), (max-width: 860px) {
  .s16-root {
    padding: 1rem 1.75rem 0.5rem 1.75rem;
  }
  .s16-heading {
    font-size: 1.25rem;
  }
  .s16-middle {
    gap: 1.5rem;
  }
  .s16-card {
    padding: 1.25rem 1.4rem 0.9rem 1.4rem;
    max-width: 480px;
  }
  .s16-option-btn {
    min-height: 40px;
    font-size: 0.84rem;
    padding: 0.45rem 0.65rem;
  }
  .s16-nurse-img {
    height: 195px;
  }
  .s16-btn {
    padding: 0.38rem 1.8rem;
    font-size: 0.9rem;
    min-height: 38px;
  }
}

@media (max-width: 720px) {
  .s16-middle {
    flex-direction: column-reverse;
    gap: 1rem;
  }
  .s16-options-row {
    flex-wrap: wrap;
  }
  .s16-option-btn {
    flex: 1 1 45%;
  }
  .s16-nurse-img {
    height: 150px;
  }
  .s16-modal18-row {
    flex-wrap: wrap;
  }
  .s16-route-btn {
    flex: 1 1 45%;
  }
}
`;

export interface Slide16ResolutionScreenProps {
  isSpanish?: boolean;
  selected?: string;
  medicines?: string[];
  resolutionMedicines?: string[];
  route?: string;
  resolutionRoute?: string;
  onSelectResolution?: (val: string) => void;
  onSelect?: (val: string) => void;
  onSelectMedicines?: (meds: string[]) => void;
  onMedicinesSelect?: (meds: string[]) => void;
  onSelectRoute?: (route: string) => void;
  onRouteChange?: (route: string) => void;
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

interface ResolutionOption {
  value: string;
  labelEn: string;
  labelEs: string;
}

export const RESOLUTION_OPTIONS: ResolutionOption[] = [
  { value: "With medication", labelEn: "With medication", labelEs: "Con medicación" },
  { value: "On its own", labelEn: "On its own", labelEs: "Por sí sola" },
  { value: "Unsure/I don't know", labelEn: "Unsure/I don't know", labelEs: "No estoy seguro/ No lo sé" },
];

export const MEDICATION_OPTIONS = [
  { value: "Allergy medicine (Benadryl, Zyrtec)", labelEn: "Allergy medicine\n(Benadryl, Zyrtec)", labelEs: "Medicina para la alergia\n(Benadryl, Zyrtec)" },
  { value: "Steroid medicine (Prednisone)", labelEn: "Steroid medicine\n(Prednisone)", labelEs: "Medicina esteroidea\n(Prednisona)" },
  { value: "Epinephrine (EpiPen)", labelEn: "Epinephrine\n(EpiPen)", labelEs: "Epinefrina\n(EpiPen)" },
  { value: "Unsure/I don't know", labelEn: "Unsure/I don't know", labelEs: "No estoy seguro/ No lo sé" },
];

export const ROUTE_OPTIONS = [
  { value: "Mouth", labelEn: "Mouth", labelEs: "Por la boca" },
  { value: "IV", labelEn: "IV", labelEs: "Vía intravenosa (IV)" },
  { value: "Shot", labelEn: "Shot", labelEs: "Inyección" },
  { value: "Unsure/I don't know", labelEn: "Unsure/I don't know", labelEs: "No estoy seguro/ No lo sé" },
];

function isResolutionSelected(optValue: string, currentSelected?: string): boolean {
  if (!currentSelected) return false;
  if (currentSelected === optValue) return true;
  if (optValue === "Unsure/I don't know" && currentSelected.toLowerCase().includes("unsure")) return true;
  return false;
}

export function Slide16ResolutionScreen({
  isSpanish = false,
  selected,
  medicines,
  resolutionMedicines,
  route,
  resolutionRoute,
  onSelectResolution,
  onSelect,
  onSelectMedicines,
  onMedicinesSelect,
  onSelectRoute,
  onRouteChange,
  onNext,
  onBack,
  loading = false,
  navProps,
}: Slide16ResolutionScreenProps) {
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const modal17HeadingRef = useRef<HTMLHeadingElement | null>(null);
  const modal18HeadingRef = useRef<HTMLHeadingElement | null>(null);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const initialMeds = medicines ?? resolutionMedicines ?? [];
  const initialRoute = route ?? resolutionRoute;
  const handleResolution = onSelectResolution ?? onSelect ?? (() => {});
  const handleMedicines = onSelectMedicines ?? onMedicinesSelect;
  const handleRoute = onSelectRoute ?? onRouteChange;

  const [modal17Open, setModal17Open] = useState(false);
  const [modal18Open, setModal18Open] = useState(false);

  const [activeMeds, setActiveMeds] = useState<string[]>(initialMeds);
  const [activeRoute, setActiveRoute] = useState<string | undefined>(initialRoute);

  useEffect(() => {
    if (medicines !== undefined || resolutionMedicines !== undefined) {
      setActiveMeds(medicines ?? resolutionMedicines ?? []);
    }
  }, [medicines, resolutionMedicines]);

  useEffect(() => {
    if (route !== undefined || resolutionRoute !== undefined) {
      setActiveRoute(route ?? resolutionRoute);
    }
  }, [route, resolutionRoute]);

  useEffect(() => {
    const timer = setTimeout(() => {
      headingRef.current?.focus();
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  // Trap focus & Escape for Modal 17 (Medicines)
  useEffect(() => {
    if (!modal17Open) return;
    const timer = setTimeout(() => {
      modal17HeadingRef.current?.focus();
    }, 50);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setModal17Open(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [modal17Open]);

  // Trap focus & Escape for Modal 18 (Route)
  useEffect(() => {
    if (!modal18Open) return;
    const timer = setTimeout(() => {
      modal18HeadingRef.current?.focus();
    }, 50);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setModal18Open(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [modal18Open]);

  const handleMainOption = (val: string) => {
    handleResolution(val);
    if (val === "With medication") {
      setTimeout(() => setModal17Open(true), 150);
    } else {
      setActiveMeds([]);
      setActiveRoute(undefined);
      if (handleMedicines) handleMedicines([]);
      if (handleRoute) handleRoute("");
    }
  };

  const toggleMed = (val: string) => {
    let updated: string[];
    if (val === "Unsure/I don't know") {
      updated = activeMeds.includes("Unsure/I don't know") ? [] : ["Unsure/I don't know"];
    } else {
      const withoutUnsure = activeMeds.filter((m) => m !== "Unsure/I don't know");
      if (withoutUnsure.includes(val)) {
        updated = withoutUnsure.filter((m) => m !== val);
      } else {
        updated = [...withoutUnsure, val];
      }
    }
    setActiveMeds(updated);
    if (handleMedicines) handleMedicines(updated);
  };

  const handleRouteSelect = (val: string) => {
    setActiveRoute(val);
    if (handleRoute) handleRoute(val);
  };

  const handleClear = () => {
    handleResolution("");
    setActiveMeds([]);
    setActiveRoute(undefined);
    if (handleMedicines) handleMedicines([]);
    if (handleRoute) handleRoute("");
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
      nextIndex = (index + 1) % RESOLUTION_OPTIONS.length;
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      nextIndex = (index - 1 + RESOLUTION_OPTIONS.length) % RESOLUTION_OPTIONS.length;
    } else if (e.key === "Home") {
      e.preventDefault();
      nextIndex = 0;
    } else if (e.key === "End") {
      e.preventDefault();
      nextIndex = RESOLUTION_OPTIONS.length - 1;
    }

    if (nextIndex !== -1) {
      const nextOpt = RESOLUTION_OPTIONS[nextIndex];
      handleMainOption(nextOpt.value);
      buttonRefs.current[nextIndex]?.focus();
    }
  };

  // Format meds summary label
  const medsSummary = activeMeds.length > 0
    ? activeMeds.map((m) => m.split(" (")[0]).join(", ")
    : "";

  return (
    <div id="slide-content" className="s16-root">
      <style>{SLIDE16_CSS}</style>

      {/* 1. Main Heading */}
      <div className="s16-top-section">
        <h1
          ref={headingRef}
          tabIndex={-1}
          id="slide16-title"
          className="s16-heading"
        >
          {isSpanish
            ? "¿Cómo desapareció la reacción de su hijo?"
            : "How did your child's reaction go away?"}
        </h1>
      </div>

      {/* 2. Middle Content Area: Rounded Teal Card + Nurse Anna */}
      <div className="s16-middle">
        {/* Teal Rounded Container Card */}
        <div className="s16-card">
          <div
            role="radiogroup"
            aria-labelledby="slide16-title"
            className="s16-options-row"
          >
            {RESOLUTION_OPTIONS.map((opt, index) => {
              const isChecked = isResolutionSelected(opt.value, selected);
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
                  onKeyDown={(e) => handleArrowKeyDown(e, index)}
                  className={`s16-option-btn${isChecked ? " s16-option-btn--selected" : ""}`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Active Meds & Route Badge (when With medication is selected) */}
          {selected === "With medication" && (activeMeds.length > 0 || activeRoute) && (
            <div className="s16-meds-badge">
              <span className="s16-meds-badge-text">
                <strong>{isSpanish ? "Medicamento: " : "Meds: "}</strong>
                {medsSummary || (isSpanish ? "Seleccionado" : "Selected")}
                {activeRoute && <span> ({activeRoute})</span>}
              </span>
              <button
                type="button"
                onClick={() => setModal17Open(true)}
                className="s16-change-btn"
              >
                {isSpanish ? "Cambiar" : "Change"}
              </button>
            </div>
          )}

          {/* Card Footer with Wireframe-spec Clear / Deselect icon */}
          <div className="s16-card-footer">
            <span className="s16-wireframe-marker" aria-hidden="true">7-5</span>
            <button
              type="button"
              onClick={handleClear}
              aria-label={isSpanish ? "Borrar selección" : "Clear selection"}
              title={isSpanish ? "Borrar selección" : "Clear selection"}
              className="s16-clear-btn"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Nurse Anna on the right */}
        <div className="s16-nurse-wrap" aria-hidden="true">
          <img
            src="/images/nurse-anna.png"
            alt=""
            className="s16-nurse-img"
          />
        </div>
      </div>

      {/* 3. Bottom Centered Navigation (Back & Next) */}
      <div className="s16-nav">
        <button
          type="button"
          onClick={handleBackClick}
          disabled={isLoading}
          className="s16-btn s16-btn--back"
        >
          {isSpanish ? "Atrás" : "Back"}
        </button>
        <button
          type="button"
          onClick={handleNextClick}
          disabled={!isNextEnabled}
          className={`s16-btn s16-btn--next${!isNextEnabled ? " s16-btn--disabled" : ""}`}
        >
          {isLoading ? "..." : isSpanish ? "Siguiente" : "Next"}
        </button>
      </div>

      {/* ==========================================================
          MODAL 17: Medication Selection (Matches Spec p17_4.png)
          ========================================================== */}
      {modal17Open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-17-heading"
          className="s16-modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModal17Open(false);
          }}
        >
          <div className="s16-modal17-card">
            <h2
              id="modal-17-heading"
              ref={modal17HeadingRef}
              tabIndex={-1}
              className="s16-modal-heading"
            >
              {isSpanish
                ? "¿Qué medicamento le dieron a su hijo para la reacción?"
                : "What medicine was given to your child for the reaction?"}
            </h2>

            <div className="s16-modal17-grid">
              {MEDICATION_OPTIONS.map((opt) => {
                const isChecked = activeMeds.includes(opt.value);
                const label = isSpanish ? opt.labelEs : opt.labelEn;

                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="checkbox"
                    aria-checked={isChecked}
                    onClick={() => toggleMed(opt.value)}
                    className={`s16-med-btn${isChecked ? " s16-med-btn--selected" : ""}`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            <div className="s16-modal17-footer">
              <button
                type="button"
                onClick={() => {
                  setModal17Open(false);
                  setTimeout(() => setModal18Open(true), 150);
                }}
                className="s16-more-questions-btn"
              >
                <span>{isSpanish ? "Más preguntas >>" : "More Questions >>"}</span>
              </button>

              <div className="s16-modal-close-wrap">
                <span className="s16-wireframe-marker" aria-hidden="true">7-4-1</span>
                <button
                  type="button"
                  onClick={() => setModal17Open(false)}
                  aria-label={isSpanish ? "Cerrar" : "Close"}
                  title={isSpanish ? "Cerrar" : "Close"}
                  className="s16-modal-close-btn"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================================
          MODAL 18: Route Administered (Matches Spec p17_6.png)
          ========================================================== */}
      {modal18Open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-18-heading"
          className="s16-modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModal18Open(false);
          }}
        >
          <div className="s16-modal18-card">
            <h2
              id="modal-18-heading"
              ref={modal18HeadingRef}
              tabIndex={-1}
              className="s16-modal-heading"
            >
              {isSpanish
                ? "¿Cómo recibió su hijo el medicamento?"
                : "Did your child receive the medicine by:"}
            </h2>

            <div className="s16-modal18-row">
              {ROUTE_OPTIONS.map((opt) => {
                const isChecked = activeRoute === opt.value;
                const label = isSpanish ? opt.labelEs : opt.labelEn;

                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="radio"
                    aria-checked={isChecked}
                    onClick={() => handleRouteSelect(opt.value)}
                    className={`s16-route-btn${isChecked ? " s16-route-btn--selected" : ""}`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            <div className="s16-modal18-footer">
              <button
                type="button"
                onClick={() => setModal18Open(false)}
                className="s16-save-continue-btn"
              >
                {isSpanish ? "Guardar" : "Save & Continue"}
              </button>

              <div className="s16-modal-close-wrap">
                <span className="s16-wireframe-marker" aria-hidden="true">7-4-1-1</span>
                <button
                  type="button"
                  onClick={() => setModal18Open(false)}
                  aria-label={isSpanish ? "Cerrar" : "Close"}
                  title={isSpanish ? "Cerrar" : "Close"}
                  className="s16-modal-close-btn"
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

export default Slide16ResolutionScreen;
