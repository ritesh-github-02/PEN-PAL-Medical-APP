"use client";

import React, { useState, useRef, useEffect } from "react";
import { NurseAnna } from "./NurseAnna";
import { resolveMedicineToken } from "@/lib/token-engine";

const SLIDE11_CSS = `
/* ==========================================================
   Slide11SymptomsScreen – Scoped Pixel-Perfect Styles
   ========================================================== */

.s11-root,
.s11-root *,
.s11-root *::before,
.s11-root *::after {
  box-sizing: border-box;
}

.s11-root {
  position: relative;
  width: 100%;
  height: 100%;
  flex: 1 1 0%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background-color: #f4f8ec;
  padding: 1.5rem 2.5rem 0.85rem 2.5rem;
  overflow: hidden;
}

/* Top Heading */
.s11-top-section {
  width: 100%;
  padding-left: 0.25rem;
  margin-bottom: 0.5rem;
  flex-shrink: 0;
}
.s11-heading {
  font-size: 1.35rem;
  line-height: 1.38;
  font-weight: 700;
  color: #142724;
  letter-spacing: -0.015em;
  margin: 0;
  outline: none;
}
.s11-heading:focus-visible {
  box-shadow: 0 0 0 2px #236f7a;
}

/* Middle Content: Sage Green Card (Left) + Nurse Anna (Right) */
.s11-middle {
  flex: 1 1 0%;
  min-height: 0;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  padding: 0 0.25rem;
  margin: auto 0;
}

/* Sage Green Container Card */
.s11-card {
  flex: 1 1 0%;
  max-width: 580px;
  background-color: #84aba0;
  border-radius: 20px;
  padding: 1.25rem 1.4rem;
  box-shadow: 0 4px 14px -3px rgba(20, 60, 55, 0.18);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

/* Rows of symptom chips */
.s11-chip-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.6rem;
}

.s11-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  padding: 0.45rem 0.85rem;
  background-color: #ffffff;
  color: #142724;
  font-size: 0.88rem;
  font-weight: 600;
  border-radius: 9px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  border: 1.5px solid transparent;
  cursor: pointer;
  transition: all 0.15s ease;
  user-select: none;
  outline: none;
}

.s11-chip:hover {
  background-color: #f7faf8;
  transform: translateY(-1px);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.12);
}

.s11-chip:active {
  transform: scale(0.97);
}

.s11-chip:focus-visible {
  box-shadow: 0 0 0 3px #1f4a43;
}

/* Checked / Active Chip State */
.s11-chip--checked {
  background-color: #1f4d45;
  color: #ffffff;
  border-color: #163d36;
  box-shadow: 0 2px 6px rgba(10, 40, 35, 0.25);
}

.s11-chip--checked:hover {
  background-color: #19423b;
}

.s11-chip-edit {
  font-size: 0.75rem;
  margin-left: 0.25rem;
  background: rgba(255, 255, 255, 0.25);
  border-radius: 4px;
  padding: 1px 4px;
}

/* Row 5: Other describe underline + Unsure chip */
.s11-row-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 0.25rem;
}

.s11-other-wrap {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  flex: 1;
}

.s11-other-label {
  font-size: 0.88rem;
  font-weight: 600;
  color: #142724;
  white-space: nowrap;
}

.s11-other-input {
  flex: 1;
  background: transparent;
  border: none;
  border-bottom: 2px solid #142724;
  outline: none;
  font-size: 0.88rem;
  font-weight: 500;
  color: #142724;
  padding: 2px 4px;
}

.s11-other-input::placeholder {
  color: rgba(20, 39, 36, 0.55);
}

.s11-other-input:focus {
  border-bottom-color: #0b1f1c;
  background-color: rgba(255, 255, 255, 0.15);
  border-radius: 4px 4px 0 0;
}

/* Right Section: Nurse Anna */
.s11-right {
  flex-shrink: 0;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.s11-nurse {
  width: 120px;
  height: auto;
  max-height: 255px;
}

.s11-nurse-img {
  width: 100%;
  height: auto;
  max-height: 255px;
  object-fit: contain;
  display: block;
}

/* Bottom Centered Navigation */
.s11-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  padding: 0.25rem 0;
  flex-shrink: 0;
}

.s11-btn {
  padding: 0.45rem 2rem;
  min-height: 44px;
  min-width: 100px;
  border-radius: 9999px;
  font-size: 0.95rem;
  font-weight: 500;
  color: #143833;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  outline: none;
  cursor: pointer;
  border: none;
  transition: all 0.15s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.s11-btn:active {
  transform: scale(0.96);
}
.s11-btn:focus-visible {
  box-shadow: 0 0 0 4px #236f7a;
}

.s11-btn--back {
  background-color: #adc9c4;
  border: 1px solid #96bcb5;
}
.s11-btn--back:hover {
  background-color: #9cbdb8;
}

.s11-btn--next {
  background-color: #fae88a;
  color: #143833;
  border: 1px solid #d8c85c;
}
.s11-btn--next:hover {
  background-color: #f6df6e;
}

.s11-btn--disabled {
  background-color: rgba(250, 232, 138, 0.5);
  color: rgba(20, 56, 51, 0.45);
  border-color: rgba(216, 200, 92, 0.45);
  cursor: not-allowed;
}
.s11-btn--disabled:hover {
  background-color: rgba(250, 232, 138, 0.5);
}

/* Tablet & Smaller Screens Scaling */
@media (max-height: 650px), (max-width: 820px) {
  .s11-root {
    padding: 1rem 1.5rem 0.5rem 1.5rem;
  }
  .s11-card {
    max-width: 480px;
    padding: 1rem 1.2rem;
    gap: 0.55rem;
  }
  .s11-chip {
    padding: 0.35rem 0.65rem;
    font-size: 0.8rem;
  }
  .s11-other-label, .s11-other-input {
    font-size: 0.8rem;
  }
  .s11-nurse {
    width: 95px;
    max-height: 215px;
  }
  .s11-nurse-img {
    max-height: 215px;
  }
  .s11-btn {
    padding: 0.35rem 1.6rem;
    font-size: 0.85rem;
    min-height: 40px;
  }
}

@media (max-width: 640px) {
  .s11-root {
    overflow-y: auto;
    height: auto;
    min-height: 100%;
  }
  .s11-middle {
    flex-direction: column;
    align-items: center;
  }
  .s11-card {
    max-width: 100%;
    width: 100%;
  }
  .s11-right {
    margin-top: 1rem;
  }
}
`;

export interface Slide11SymptomsScreenProps {
  isSpanish: boolean;
  medicationName?: string;
  selectedSymptoms?: string[];
  symptomsOther?: string;
  rashDetails?: string[];
  swellingDetails?: string[];
  onSelectSymptoms: (symptoms: string[]) => void;
  onSymptomsOtherChange?: (val: string) => void;
  onRashDetailsChange?: (details: string[]) => void;
  onSwellingDetailsChange?: (details: string[]) => void;
  onNext: () => void;
  onBack: () => void;
  loading?: boolean;
}

interface SymptomItem {
  value: string;
  labelEn: string;
  labelEs: string;
}

const ROW_1: SymptomItem[] = [
  { value: "Rash", labelEn: "Rash", labelEs: "Sarpullido" },
  { value: "Swelling", labelEn: "Swelling", labelEs: "Inflamación" },
  { value: "Fainting or dizziness", labelEn: "Fainting or dizziness", labelEs: "Desmayos o mareos" },
  { value: "Itchiness", labelEn: "Itchiness", labelEs: "Picazón" },
];

const ROW_2: SymptomItem[] = [
  { value: "Throat tightness", labelEn: "Throat tightness", labelEs: "Opresión en la garganta" },
  { value: "Shortness of breath", labelEn: "Shortness of breath or hard time breathing", labelEs: "Dificultad para respirar" },
];

const ROW_3: SymptomItem[] = [
  { value: "Fever", labelEn: "Fever (new fever or worse fever)", labelEs: "Fiebre (nueva o peor)" },
  { value: "Belly pain", labelEn: "Belly pain", labelEs: "Dolor abdominal" },
  { value: "Diarrhea", labelEn: "Diarrhea", labelEs: "Diarrea" },
];

const ROW_4: SymptomItem[] = [
  { value: "Joint pain", labelEn: "Joint pain", labelEs: "Dolor articular" },
  { value: "Vomiting", labelEn: "Wanted to throw up or threw up", labelEs: "Ganas de vomitar o vomitó" },
  { value: "Muscle aches", labelEn: "Muscle aches", labelEs: "Dolores musculares" },
];

const RASH_SUBTYPE_OPTIONS: SymptomItem[] = [
  { value: "Hives", labelEn: "Hives", labelEs: "Ronchas (Urticaria)" },
  { value: "Blisters", labelEn: "Blisters", labelEs: "Ampollas" },
  { value: "Red, fine or bumpy rash", labelEn: "Red, fine or bumpy rash", labelEs: "Sarpullido rojo, fino o con protuberancias" },
  { value: "Flushing", labelEn: "Flushing", labelEs: "Enrojecimiento" },
  { value: "Pus-filled pimples", labelEn: "Pus-filled pimples", labelEs: "Granos con pus" },
  { value: "Unsure", labelEn: "Unsure/I don't know", labelEs: "No estoy seguro" },
];

const SWELLING_SUBTYPE_OPTIONS: SymptomItem[] = [
  { value: "Face or eyes", labelEn: "Face or eyes", labelEs: "Cara u ojos" },
  { value: "Lips", labelEn: "Lips", labelEs: "Labios" },
  { value: "Tongue", labelEn: "Tongue", labelEs: "Lengua" },
  { value: "Throat", labelEn: "Throat", labelEs: "Garganta" },
  { value: "Hands or feet", labelEn: "Hands or feet", labelEs: "Manos o pies" },
  { value: "Unsure", labelEn: "Unsure/I don't know", labelEs: "No estoy seguro/ No lo sé" },
];

export function Slide11SymptomsScreen({
  isSpanish,
  medicationName,
  selectedSymptoms = [],
  symptomsOther = "",
  rashDetails = [],
  swellingDetails = [],
  onSelectSymptoms,
  onSymptomsOtherChange,
  onRashDetailsChange,
  onSwellingDetailsChange,
  onNext,
  onBack,
  loading = false,
}: Slide11SymptomsScreenProps) {
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const modalHeadingRef = useRef<HTMLHeadingElement | null>(null);
  const modalTriggerRef = useRef<HTMLButtonElement | null>(null);

  const swellingHeadingRef = useRef<HTMLHeadingElement | null>(null);
  const swellingTriggerRef = useRef<HTMLButtonElement | null>(null);

  const [symptoms, setSymptoms] = useState<string[]>(selectedSymptoms);
  const [otherText, setOtherText] = useState<string>(symptomsOther);
  
  const [rashModalOpen, setRashModalOpen] = useState(false);
  const [activeRashDetails, setActiveRashDetails] = useState<string[]>(rashDetails);

  const [swellingModalOpen, setSwellingModalOpen] = useState(false);
  const [activeSwellingDetails, setActiveSwellingDetails] = useState<string[]>(swellingDetails);

  useEffect(() => {
    const timer = setTimeout(() => {
      headingRef.current?.focus();
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  // Trap focus & escape key for Modal 11B (Rash)
  useEffect(() => {
    if (!rashModalOpen) return;
    const timer = setTimeout(() => {
      modalHeadingRef.current?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setRashModalOpen(false);
        modalTriggerRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [rashModalOpen]);

  // Trap focus & escape key for Modal 11C (Swelling)
  useEffect(() => {
    if (!swellingModalOpen) return;
    const timer = setTimeout(() => {
      swellingHeadingRef.current?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSwellingModalOpen(false);
        swellingTriggerRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [swellingModalOpen]);

  const toggleSymptom = (val: string, e?: React.MouseEvent<HTMLButtonElement>) => {
    let updated: string[];
    if (val === "Unsure") {
      updated = symptoms.includes("Unsure") ? [] : ["Unsure"];
    } else {
      const withoutUnsure = symptoms.filter((s) => s !== "Unsure");
      if (withoutUnsure.includes(val)) {
        updated = withoutUnsure.filter((s) => s !== val);
      } else {
        updated = [...withoutUnsure, val];
      }
    }
    setSymptoms(updated);
    onSelectSymptoms(updated);

    // If selecting Rash for the first time, automatically pop Modal 11B
    if (val === "Rash" && !symptoms.includes("Rash")) {
      if (e) modalTriggerRef.current = e.currentTarget;
      setTimeout(() => setRashModalOpen(true), 150);
    }

    // If selecting Swelling for the first time, automatically pop Modal 11C (Swelling details)
    if (val === "Swelling" && !symptoms.includes("Swelling")) {
      if (e) swellingTriggerRef.current = e.currentTarget;
      setTimeout(() => setSwellingModalOpen(true), 150);
    }
  };

  const handleOtherChange = (text: string) => {
    setOtherText(text);
    if (onSymptomsOtherChange) onSymptomsOtherChange(text);

    let updated = [...symptoms];
    if (text.trim() && !updated.includes("Other")) {
      updated = [...updated.filter((s) => s !== "Unsure"), "Other"];
      setSymptoms(updated);
      onSelectSymptoms(updated);
    } else if (!text.trim() && updated.includes("Other")) {
      updated = updated.filter((s) => s !== "Other");
      setSymptoms(updated);
      onSelectSymptoms(updated);
    }
  };

  const toggleRashDetail = (val: string) => {
    let updated: string[];
    if (val === "Unsure") {
      updated = activeRashDetails.includes("Unsure") ? [] : ["Unsure"];
    } else {
      const withoutUnsure = activeRashDetails.filter((s) => s !== "Unsure");
      if (withoutUnsure.includes(val)) {
        updated = withoutUnsure.filter((s) => s !== val);
      } else {
        updated = [...withoutUnsure, val];
      }
    }
    setActiveRashDetails(updated);
    if (onRashDetailsChange) {
      onRashDetailsChange(updated);
    }
  };

  const toggleSwellingDetail = (val: string) => {
    let updated: string[];
    if (val === "Unsure") {
      updated = activeSwellingDetails.includes("Unsure") ? [] : ["Unsure"];
    } else {
      const withoutUnsure = activeSwellingDetails.filter((s) => s !== "Unsure");
      if (withoutUnsure.includes(val)) {
        updated = withoutUnsure.filter((s) => s !== val);
      } else {
        updated = [...withoutUnsure, val];
      }
    }
    setActiveSwellingDetails(updated);
    if (onSwellingDetailsChange) {
      onSwellingDetailsChange(updated);
    }
  };

  const rawTitle = isSpanish
    ? "Seleccione lo que sucedió cuando se le dijo que su hijo era alérgico a [name]."
    : "Select what happened when your child was said to be allergic to [name].";

  const titleText = resolveMedicineToken(rawTitle, medicationName, isSpanish);

  const isNextEnabled = symptoms.length > 0 || otherText.trim().length > 0;

  const renderChip = (item: SymptomItem) => {
    const isChecked = symptoms.includes(item.value);
    const label = isSpanish ? item.labelEs : item.labelEn;

    return (
      <button
        key={item.value}
        type="button"
        role="checkbox"
        aria-checked={isChecked}
        onClick={(e) => toggleSymptom(item.value, e)}
        className={`s11-chip${isChecked ? " s11-chip--checked" : ""}`}
      >
        <span>{label}</span>
        {item.value === "Rash" && isChecked && activeRashDetails.length > 0 && (
          <span
            onClick={(e) => {
              e.stopPropagation();
              modalTriggerRef.current = e.currentTarget as any;
              setRashModalOpen(true);
            }}
            className="s11-chip-edit"
            title={isSpanish ? "Editar tipo de sarpullido" : "Edit rash details"}
            aria-label={isSpanish ? "Editar tipo de sarpullido" : "Edit rash details"}
          >
            ✎
          </span>
        )}
        {item.value === "Swelling" && isChecked && activeSwellingDetails.length > 0 && (
          <span
            onClick={(e) => {
              e.stopPropagation();
              swellingTriggerRef.current = e.currentTarget as any;
              setSwellingModalOpen(true);
            }}
            className="s11-chip-edit"
            title={isSpanish ? "Editar tipo de inflamación" : "Edit swelling details"}
            aria-label={isSpanish ? "Editar tipo de inflamación" : "Edit swelling details"}
          >
            ✎
          </span>
        )}
      </button>
    );
  };

  return (
    <div id="slide-content" className="s11-root">
      <style>{SLIDE11_CSS}</style>

      {/* 1. Main Heading */}
      <div className="s11-top-section">
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="s11-heading"
        >
          {titleText}
        </h1>
      </div>

      {/* 2. Middle Content: Sage Green Card + Nurse Anna */}
      <div className="s11-middle">
        {/* Sage Green Card Container */}
        <div className="s11-card" role="group" aria-label={titleText}>
          {/* Row 1 */}
          <div className="s11-chip-row">
            {ROW_1.map(renderChip)}
          </div>

          {/* Row 2 */}
          <div className="s11-chip-row">
            {ROW_2.map(renderChip)}
          </div>

          {/* Row 3 */}
          <div className="s11-chip-row">
            {ROW_3.map(renderChip)}
          </div>

          {/* Row 4 */}
          <div className="s11-chip-row">
            {ROW_4.map(renderChip)}
          </div>

          {/* Row 5: Other Input + Unsure Chip */}
          <div className="s11-row-bottom">
            <div className="s11-other-wrap">
              <label htmlFor="symptoms-other-input" className="s11-other-label">
                {isSpanish ? "Otro: Describa" : "Other: Please describe"}
              </label>
              <input
                id="symptoms-other-input"
                type="text"
                value={otherText}
                onChange={(e) => handleOtherChange(e.target.value)}
                placeholder="________________"
                className="s11-other-input"
                aria-label={isSpanish ? "Otro síntoma, por favor describa" : "Other symptom, please describe"}
              />
            </div>

            {/* Unsure/I don't know */}
            <button
              type="button"
              role="checkbox"
              aria-checked={symptoms.includes("Unsure")}
              onClick={(e) => toggleSymptom("Unsure", e)}
              className={`s11-chip${symptoms.includes("Unsure") ? " s11-chip--checked" : ""}`}
            >
              <span>{isSpanish ? "No estoy seguro/ No lo sé" : "Unsure/I don't know"}</span>
            </button>
          </div>
        </div>

        {/* Nurse Anna on Right */}
        <div className="s11-right">
          <div className="s11-nurse">
            <NurseAnna
              size="md"
              imgClassName="s11-nurse-img"
              isDecorative={true}
              locale={isSpanish ? "es" : "en"}
            />
          </div>
        </div>
      </div>

      {/* 3. Bottom Centered Navigation Buttons (Back & Next) */}
      <div className="s11-nav">
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="s11-btn s11-btn--back"
        >
          {isSpanish ? "Atrás" : "Back"}
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!isNextEnabled || loading}
          className={`s11-btn s11-btn--next${!isNextEnabled || loading ? " s11-btn--disabled" : ""}`}
        >
          {loading ? "..." : isSpanish ? "Siguiente" : "Next"}
        </button>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 11B (Figma 7-1-1): Rash Sub-types Branching Modal */}
      {/* ========================================================================= */}
      {rashModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-11b-heading"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
        >
          <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="space-y-1">
              <h2
                id="modal-11b-heading"
                ref={modalHeadingRef}
                tabIndex={-1}
                className="text-base sm:text-lg font-bold text-slate-900 tracking-tight outline-none"
              >
                {isSpanish ? "¿Cómo era el sarpullido?" : "What did the rash look like?"}
              </h2>
              <p className="text-xs font-medium text-slate-500">
                {isSpanish
                  ? "Seleccione todas las opciones que correspondan."
                  : "Select all that apply."}
              </p>
            </div>

            <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
              {RASH_SUBTYPE_OPTIONS.map((sub) => {
                const isChecked = activeRashDetails.includes(sub.value);
                const label = isSpanish ? sub.labelEs : sub.labelEn;
                return (
                  <button
                    key={sub.value}
                    type="button"
                    role="checkbox"
                    aria-checked={isChecked}
                    onClick={() => toggleRashDetail(sub.value)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 min-h-[42px] rounded-xl text-left font-semibold text-xs sm:text-sm transition cursor-pointer border ${
                      isChecked
                        ? "bg-[#236f7a] text-white border-[#1a555e] shadow-2xs"
                        : "bg-[#f8faf7] text-slate-800 border-slate-300 hover:bg-slate-100"
                    } focus:outline-none focus-visible:ring-2 focus-visible:ring-[#236f7a] active:scale-[0.99]`}
                  >
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                        isChecked ? "border-white bg-[#1a555e]" : "border-slate-400 bg-white"
                      }`}
                      aria-hidden="true"
                    >
                      {isChecked && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className="leading-tight">{label}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-[11px] font-mono text-slate-400">7-1-1</span>
              <button
                type="button"
                onClick={() => {
                  setRashModalOpen(false);
                  modalTriggerRef.current?.focus();
                }}
                className="px-6 py-2 min-h-[44px] rounded-full bg-[#132338] hover:bg-[#0c1827] text-white font-bold text-xs sm:text-sm shadow-sm transition active:scale-95 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#236f7a]"
              >
                {isSpanish ? "Guardar y continuar" : "Save and Continue"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 11C (Figma 7-1-2): Swelling Sub-types Modal */}
      {/* ========================================================================= */}
      {swellingModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-11c-heading"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
        >
          <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="space-y-1">
              <h2
                id="modal-11c-heading"
                ref={swellingHeadingRef}
                tabIndex={-1}
                className="text-base sm:text-lg font-bold text-slate-900 tracking-tight outline-none"
              >
                {isSpanish ? "¿Dónde ocurrió la inflamación?" : "Where was the swelling?"}
              </h2>
              <p className="text-xs font-medium text-slate-500">
                {isSpanish
                  ? "Seleccione todas las opciones que correspondan."
                  : "Select all that apply."}
              </p>
            </div>

            <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
              {SWELLING_SUBTYPE_OPTIONS.map((sub) => {
                const isChecked = activeSwellingDetails.includes(sub.value);
                const label = isSpanish ? sub.labelEs : sub.labelEn;
                return (
                  <button
                    key={sub.value}
                    type="button"
                    role="checkbox"
                    aria-checked={isChecked}
                    onClick={() => toggleSwellingDetail(sub.value)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 min-h-[42px] rounded-xl text-left font-semibold text-xs sm:text-sm transition cursor-pointer border ${
                      isChecked
                        ? "bg-[#236f7a] text-white border-[#1a555e] shadow-2xs"
                        : "bg-[#f8faf7] text-slate-800 border-slate-300 hover:bg-slate-100"
                    } focus:outline-none focus-visible:ring-2 focus-visible:ring-[#236f7a] active:scale-[0.99]`}
                  >
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                        isChecked ? "border-white bg-[#1a555e]" : "border-slate-400 bg-white"
                      }`}
                      aria-hidden="true"
                    >
                      {isChecked && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className="leading-tight">{label}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-[11px] font-mono text-slate-400">7-1-2</span>
              <button
                type="button"
                onClick={() => {
                  setSwellingModalOpen(false);
                  swellingTriggerRef.current?.focus();
                }}
                className="px-6 py-2 min-h-[44px] rounded-full bg-[#132338] hover:bg-[#0c1827] text-white font-bold text-xs sm:text-sm shadow-sm transition active:scale-95 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#236f7a]"
              >
                {isSpanish ? "Guardar y continuar" : "Save and Continue"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Slide11SymptomsScreen;
