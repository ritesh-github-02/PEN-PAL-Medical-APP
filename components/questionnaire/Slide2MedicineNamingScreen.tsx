"use client";

import React, { useRef, useEffect } from "react";
import Image from "next/image";
import { NurseAnna } from "./NurseAnna";
import { SpeechBubble } from "./SpeechBubble";
import { MEDICINE_OPTIONS } from "@/lib/token-engine";

export interface Slide2MedicineNamingScreenProps {
  isSpanish: boolean;
  selected?: string;
  onSelect: (value: string) => void;
  onNext: () => void;
  onBack: () => void;
  loading?: boolean;
}

export function Slide2MedicineNamingScreen({
  isSpanish,
  selected,
  onSelect,
  onNext,
  onBack,
  loading = false,
}: Slide2MedicineNamingScreenProps) {
  const headingRef = useRef<HTMLHeadingElement | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      headingRef.current?.focus();
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      id="slide-content"
      className="bg-[#f4f8e8] border border-slate-200/80 rounded-3xl p-5 sm:p-7 shadow-md relative overflow-hidden flex flex-col justify-between min-h-[440px] max-h-[85vh]"
    >
      <div className="max-w-3xl mx-auto w-full flex-1 flex flex-col justify-center space-y-4">
        {/* 1. Header Pill (Yellow badge matching Figma) */}
        <div className="flex justify-center">
          <div className="inline-block bg-[#f0d411] text-[#1f382f] border border-[#d6be0e] px-5 py-1.5 rounded-full shadow-2xs text-center">
            <h1
              ref={headingRef}
              tabIndex={-1}
              className="text-xs sm:text-sm md:text-base font-bold tracking-tight outline-none focus-visible:ring-2 focus-visible:ring-[#236f7a]"
            >
              {isSpanish
                ? "¡Primero hablemos de la penicilina. ¡Tiene muchos nombres!"
                : "Let's first talk about penicillin. It has lots of names!"}
            </h1>
          </div>
        </div>

        {/* 2. Main Content Grid (Bottle, Radio Options, Nurse Anna with Speech Bubble) */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center pt-1">
          {/* Left: Amoxicillin Bottle Artwork */}
          <div className="sm:col-span-3 flex justify-center items-center">
            <div className="relative w-24 sm:w-32 h-40 sm:h-48 filter drop-shadow-sm">
              <Image
                src="/images/TonicBottle.png"
                alt={isSpanish ? "Frasco de amoxicilina rosa para niños" : "Pink amoxicillin suspension bottle"}
                fill
                unoptimized
                className="object-contain"
                priority
              />
            </div>
          </div>

          {/* Center: 5 Interactive Options */}
          <div
            className="sm:col-span-5 space-y-1.5"
            role="radiogroup"
            aria-label={isSpanish ? "Seleccione el nombre que usa para el medicamento" : "Select what you call the medicine"}
          >
            {MEDICINE_OPTIONS.map((opt) => {
              const isChecked = selected === opt.value;
              const label = isSpanish ? opt.labelEs : opt.labelEn;
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="radio"
                  aria-checked={isChecked}
                  onClick={() => onSelect(opt.value)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 min-h-[44px] rounded-xl text-left font-bold text-xs sm:text-sm transition cursor-pointer border ${
                    isChecked
                      ? "bg-[#236f7a] text-white border-[#1a555e] shadow-xs ring-2 ring-[#236f7a]/30"
                      : "bg-white text-slate-800 border-slate-300 hover:bg-slate-50 hover:border-slate-400 shadow-2xs"
                  } focus:outline-none focus-visible:ring-4 focus-visible:ring-[#236f7a] active:scale-[0.99]`}
                >
                  <div
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 ${
                      isChecked ? "border-white bg-[#1a555e]" : "border-slate-400 bg-white"
                    }`}
                    aria-hidden="true"
                  >
                    {isChecked && (
                      <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className="leading-tight">{label}</span>
                </button>
              );
            })}
          </div>

          {/* Right: Nurse Anna with Speech Bubble pointing right to Anna */}
          <div className="sm:col-span-4 flex items-center justify-center sm:justify-end gap-2">
            <SpeechBubble
              tailPosition="right-center"
              className="max-w-[190px] p-3 text-center"
            >
              <p className="text-[11px] sm:text-xs font-semibold text-slate-800 leading-snug">
                {isSpanish
                  ? "¡Seleccione cómo lo llama! Usaremos el nombre que elija durante nuestro tiempo juntos."
                  : "Select what you call it! We'll use the name you choose during our time together."}
              </p>
            </SpeechBubble>

            <div className="shrink-0 flex items-center justify-center">
              <NurseAnna size="sm" isDecorative={true} />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Bottom Paired Navigation Buttons */}
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

export default Slide2MedicineNamingScreen;
