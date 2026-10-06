"use client";

import React, { useRef, useEffect } from "react";
import { NurseAnna } from "./NurseAnna";
import { resolveMedicineToken } from "@/lib/token-engine";

export interface Slide13OnsetScreenProps {
  isSpanish: boolean;
  medicationName?: string;
  selected?: string;
  onSelect: (value: string) => void;
  onNext: () => void;
  onBack: () => void;
  loading?: boolean;
}

const ONSET_OPTIONS = [
  { value: "<1 hour", labelEn: "<1 hour", labelEs: "<1 hora" },
  { value: "1-24 hours", labelEn: "1-24 hours", labelEs: "1-24 horas" },
  { value: "24+ hours", labelEn: "24+ hours", labelEs: "24+ horas" },
  { value: "Unsure/I don't know", labelEn: "Unsure", labelEs: "No estoy seguro" },
];

export function Slide13OnsetScreen({
  isSpanish,
  medicationName,
  selected,
  onSelect,
  onNext,
  onBack,
  loading = false,
}: Slide13OnsetScreenProps) {
  const headingRef = useRef<HTMLHeadingElement | null>(null);

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

  return (
    <div
      id="slide-content"
      className="bg-[#f4f8e8] border border-slate-200/80 rounded-3xl p-4 sm:p-7 shadow-md relative flex flex-col justify-between min-h-0 sm:min-h-[440px] max-h-none overflow-y-auto"
    >
      <div className="max-w-3xl mx-auto w-full flex-1 flex flex-col justify-center space-y-4">
        {/* Main Heading */}
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="text-xs sm:text-sm md:text-base font-bold text-slate-900 tracking-tight leading-snug text-left outline-none focus-visible:ring-2 focus-visible:ring-[#236f7a]"
        >
          {titleText}
        </h1>

        {/* Content: Options Row & Nurse Anna */}
        <div className="flex items-center gap-4 sm:gap-6 pt-1">
          {/* Horizontal / Grid Buttons */}
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-2" role="radiogroup" aria-label={titleText}>
            {ONSET_OPTIONS.map((opt) => {
              const isChecked = selected === opt.value || (selected === "Less than 1 hour" && opt.value === "<1 hour") || (selected === "More than 24 hours" && opt.value === "24+ hours");
              const label = isSpanish ? opt.labelEs : opt.labelEn;

              return (
                <button
                  key={opt.value}
                  type="button"
                  role="radio"
                  aria-checked={isChecked}
                  onClick={() => onSelect(opt.value)}
                  className={`flex flex-col items-center justify-center p-3 min-h-[56px] rounded-xl text-center font-bold text-xs sm:text-sm transition cursor-pointer border ${
                    isChecked
                      ? "bg-[#236f7a] text-white border-[#1a555e] shadow-xs"
                      : "bg-[#82bdad] text-[#132c27] border-[#6fa99b] hover:bg-[#72ae9e]"
                  } focus:outline-none focus-visible:ring-2 focus-visible:ring-[#236f7a] active:scale-95`}
                >
                  <span className="leading-tight">{label}</span>
                </button>
              );
            })}
          </div>

          {/* Nurse Anna on Right */}
          <div className="shrink-0 flex items-center justify-center">
            <NurseAnna size="sm" isDecorative={true} />
          </div>
        </div>
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
          disabled={!selected || loading}
          className={`px-7 py-2 min-h-[44px] min-w-[110px] rounded-full font-bold text-xs sm:text-sm shadow-sm transition active:scale-95 cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-[#236f7a] ${
            selected && !loading
              ? "bg-[#f0d411] hover:bg-[#e1c504] text-[#1f382f] border border-[#d6be0e]"
              : "bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300 shadow-none"
          }`}
        >
          {loading ? "..." : isSpanish ? "Siguiente" : "Next"}
        </button>
      </div>
    </div>
  );
}

export default Slide13OnsetScreen;
