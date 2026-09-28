"use client";

import React, { useState, useRef, useEffect } from "react";
import { NurseAnna } from "./NurseAnna";
import { resolveMedicineToken } from "@/lib/token-engine";

export interface Slide11SymptomsScreenProps {
  isSpanish: boolean;
  medicationName?: string;
  selectedSymptoms?: string[];
  symptomsOther?: string;
  rashDetails?: string[];
  onSelectSymptoms: (symptoms: string[]) => void;
  onSymptomsOtherChange?: (val: string) => void;
  onRashDetailsChange?: (details: string[]) => void;
  onNext: () => void;
  onBack: () => void;
  loading?: boolean;
}

interface SymptomOption {
  value: string;
  labelEn: string;
  labelEs: string;
}

const SYMPTOM_OPTIONS: SymptomOption[] = [
  { value: "Rash", labelEn: "Rash", labelEs: "Sarpullido" },
  { value: "Swelling", labelEn: "Swelling", labelEs: "Inflamación" },
  { value: "Fainting or dizziness", labelEn: "Fainting or dizziness", labelEs: "Desmayos o mareos" },
  { value: "Itchiness", labelEn: "Itchiness", labelEs: "Picazón" },
  { value: "Throat tightness", labelEn: "Throat tightness", labelEs: "Opresión en la garganta" },
  { value: "Shortness of breath", labelEn: "Shortness of breath or hard time breathing", labelEs: "Dificultad para respirar" },
  { value: "Fever", labelEn: "Fever (new or worse)", labelEs: "Fiebre (nueva o peor)" },
  { value: "Belly pain", labelEn: "Belly pain", labelEs: "Dolor abdominal" },
  { value: "Diarrhea", labelEn: "Diarrhea", labelEs: "Diarrea" },
  { value: "Joint pain", labelEn: "Joint pain", labelEs: "Dolor articular" },
  { value: "Vomiting", labelEn: "Wanted to throw up or threw up", labelEs: "Ganas de vomitar o vomitó" },
  { value: "Muscle aches", labelEn: "Muscle aches", labelEs: "Dolores musculares" },
  { value: "Other", labelEn: "Other: Please describe", labelEs: "Otro: Describa" },
  { value: "Unsure", labelEn: "Unsure/I don't know", labelEs: "No estoy seguro" },
];

const RASH_SUBTYPE_OPTIONS: SymptomOption[] = [
  { value: "Hives", labelEn: "Hives", labelEs: "Ronchas (Urticaria)" },
  { value: "Blisters", labelEn: "Blisters", labelEs: "Ampollas" },
  { value: "Red, fine or bumpy rash", labelEn: "Red, fine or bumpy rash", labelEs: "Sarpullido rojo, fino o con protuberancias" },
  { value: "Flushing", labelEn: "Flushing", labelEs: "Enrojecimiento" },
  { value: "Pus-filled pimples", labelEn: "Pus-filled pimples", labelEs: "Granos con pus" },
  { value: "Unsure", labelEn: "Unsure/I don't know", labelEs: "No estoy seguro" },
];

export function Slide11SymptomsScreen({
  isSpanish,
  medicationName,
  selectedSymptoms = [],
  symptomsOther = "",
  rashDetails = [],
  onSelectSymptoms,
  onSymptomsOtherChange,
  onRashDetailsChange,
  onNext,
  onBack,
  loading = false,
}: Slide11SymptomsScreenProps) {
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const modalHeadingRef = useRef<HTMLHeadingElement | null>(null);
  const modalTriggerRef = useRef<HTMLButtonElement | null>(null);

  const [symptoms, setSymptoms] = useState<string[]>(selectedSymptoms);
  const [otherText, setOtherText] = useState<string>(symptomsOther);
  const [rashModalOpen, setRashModalOpen] = useState(false);
  const [activeRashDetails, setActiveRashDetails] = useState<string[]>(rashDetails);

  useEffect(() => {
    const timer = setTimeout(() => {
      headingRef.current?.focus();
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  // Trap focus & escape key for Modal 11B
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

  const rawTitle = isSpanish
    ? "Seleccione lo que sucedió cuando se le dijo que su hijo era alérgico a [name]."
    : "Select what happened when your child was said to be allergic to [name].";

  const titleText = resolveMedicineToken(rawTitle, medicationName, isSpanish);

  return (
    <div
      id="slide-content"
      className="bg-[#f4f8e8] border border-slate-200/80 rounded-3xl p-5 sm:p-7 shadow-md relative overflow-hidden flex flex-col justify-between min-h-[440px] max-h-[85vh]"
    >
      <div className="max-w-3xl mx-auto w-full flex-1 flex flex-col justify-center space-y-3">
        {/* Main Heading */}
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="text-xs sm:text-sm md:text-base font-bold text-slate-900 tracking-tight leading-snug text-left outline-none focus-visible:ring-2 focus-visible:ring-[#236f7a]"
        >
          {titleText}
        </h1>

        {/* Symptoms List & Nurse Anna Side-by-Side */}
        <div className="flex items-center gap-4">
          {/* Symptoms Grid */}
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-1.5" role="group" aria-label={titleText}>
            {SYMPTOM_OPTIONS.map((opt) => {
              const isChecked = symptoms.includes(opt.value);
              const label = isSpanish ? opt.labelEs : opt.labelEn;
              const isRashWithSubtypes = opt.value === "Rash" && isChecked && activeRashDetails.length > 0;

              return (
                <button
                  key={opt.value}
                  type="button"
                  role="checkbox"
                  aria-checked={isChecked}
                  onClick={(e) => toggleSymptom(opt.value, e)}
                  className={`flex items-center justify-between gap-1.5 px-2.5 py-1.5 min-h-[40px] rounded-xl text-left font-semibold text-[11px] sm:text-xs transition cursor-pointer border ${
                    isChecked
                      ? "bg-[#236f7a] text-white border-[#1a555e] shadow-2xs"
                      : "bg-white text-slate-800 border-slate-300 hover:bg-slate-50 hover:border-slate-400"
                  } focus:outline-none focus-visible:ring-2 focus-visible:ring-[#236f7a] active:scale-[0.99]`}
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <div
                      className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${
                        isChecked ? "border-white bg-[#1a555e]" : "border-slate-400 bg-white"
                      }`}
                      aria-hidden="true"
                    >
                      {isChecked && (
                        <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className="truncate leading-tight">{label}</span>
                  </div>

                  {opt.value === "Rash" && isChecked && (
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        modalTriggerRef.current = e.currentTarget as any;
                        setRashModalOpen(true);
                      }}
                      className="text-[10px] bg-white/25 hover:bg-white/40 text-white font-bold px-1.5 py-0.5 rounded cursor-pointer shrink-0 transition"
                      aria-label={isSpanish ? "Editar tipo de sarpullido" : "Edit rash type"}
                    >
                      ✎
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Nurse Anna on the Right */}
          <div className="shrink-0 hidden sm:flex items-center justify-center">
            <NurseAnna size="sm" isDecorative={true} />
          </div>
        </div>

        {/* Other text description input if Other is checked */}
        {symptoms.includes("Other") && (
          <div className="pt-1">
            <input
              id="symptoms-other"
              type="text"
              value={otherText}
              onChange={(e) => {
                setOtherText(e.target.value);
                if (onSymptomsOtherChange) onSymptomsOtherChange(e.target.value);
              }}
              placeholder={isSpanish ? "Describa otros síntomas..." : "Describe other symptoms..."}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900 font-medium text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-[#236f7a]"
            />
          </div>
        )}
      </div>

      {/* Paired Navigation Buttons */}
      <div className="flex items-center justify-center gap-4 pt-4 mt-3 border-t border-slate-200/60">
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="px-7 py-2 min-h-[44px] min-w-[110px] rounded-full bg-[#7da199] hover:bg-[#6c8e86] text-[#132c27] font-bold text-xs sm:text-sm shadow-xs transition active:scale-95 cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-[#236f7a]"
        >
          {isSpanish ? "Atrás" : "Back"}
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={symptoms.length === 0 || loading}
          className={`px-7 py-2 min-h-[44px] min-w-[110px] rounded-full font-bold text-xs sm:text-sm shadow-sm transition active:scale-95 cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-[#236f7a] ${
            symptoms.length > 0 && !loading
              ? "bg-[#f0d411] hover:bg-[#e1c504] text-[#1f382f] border border-[#d6be0e]"
              : "bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300 shadow-none"
          }`}
        >
          {loading ? "..." : isSpanish ? "Siguiente" : "Next"}
        </button>
      </div>

      {/* MODAL 11B: Rash Sub-types Branching Modal */}
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

            <div className="flex justify-end pt-2 border-t border-slate-100">
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
    </div>
  );
}

export default Slide11SymptomsScreen;
