"use client";

import React, { useRef, useEffect } from "react";
import { NurseAnna } from "./NurseAnna";
import { resolveMedicineToken } from "@/lib/token-engine";

export interface Slide9WhyItMattersScreenProps {
  isSpanish: boolean;
  medicationName?: string;
  onNext: () => void;
  onBack: () => void;
  loading?: boolean;
}

export function Slide9WhyItMattersScreen({
  isSpanish,
  medicationName,
  onNext,
  onBack,
  loading = false,
}: Slide9WhyItMattersScreenProps) {
  const headingRef = useRef<HTMLHeadingElement | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      headingRef.current?.focus();
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  const rawIntro = isSpanish
    ? "Cuando un niño necesita antibióticos y se cree que tiene alergia a [name], recibe diferentes antibióticos que..."
    : "When a child needs antibiotics and is believed to have an allergy to [name], they receive different antibiotics that...";

  const rawBullets = [
    {
      en: "Are more likely to cause diarrhea or other side effects",
      es: "Tienen más probabilidades de causar diarrea u otros efectos secundarios",
    },
    {
      en: "Cost more than [name]",
      es: "Cuestan más que [name]",
    },
    {
      en: "Taste worse than [name]",
      es: "Tienen peor sabor que [name]",
    },
    {
      en: "May make an infection harder to treat in the future",
      es: "Pueden hacer que una infección sea más difícil de tratar en el futuro",
    },
  ];

  const introText = resolveMedicineToken(rawIntro, medicationName, isSpanish);

  return (
    <div
      id="slide-content"
      className="bg-[#f4f8e8] border border-slate-200/80 rounded-3xl p-5 sm:p-7 shadow-md relative overflow-hidden flex flex-col justify-between min-h-[440px] max-h-[85vh]"
    >
      <div className="max-w-3xl mx-auto w-full flex-1 flex flex-col justify-center space-y-4">
        {/* Yellow Header Badge */}
        <div className="flex justify-start">
          <div className="inline-block bg-[#f0d411] text-[#132c27] border border-[#d6be0e] px-5 py-1.5 rounded-full shadow-2xs">
            <h1
              ref={headingRef}
              tabIndex={-1}
              className="text-xs sm:text-sm md:text-base font-bold tracking-tight outline-none focus-visible:ring-2 focus-visible:ring-[#236f7a]"
            >
              {isSpanish ? "¿Por qué es importante esto?" : "Why does this matter?"}
            </h1>
          </div>
        </div>

        {/* Content: Nurse Anna on Left + Explanatory Bullet List on Right */}
        <div className="flex items-center gap-5 sm:gap-6 pt-1">
          <div className="shrink-0 flex items-center justify-center">
            <NurseAnna size="md" isDecorative={true} />
          </div>

          <div className="space-y-2.5 flex-1 text-left">
            <p className="text-xs sm:text-sm md:text-base font-bold text-slate-800 leading-snug">
              {introText}
            </p>

            <ul className="space-y-2 text-xs sm:text-sm font-semibold text-slate-700 leading-snug">
              {rawBullets.map((b, idx) => {
                const text = resolveMedicineToken(isSpanish ? b.es : b.en, medicationName, isSpanish);
                return (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-[#236f7a] shrink-0 mt-1.5" aria-hidden="true"></span>
                    <span>{text}</span>
                  </li>
                );
              })}
            </ul>
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
          disabled={loading}
          className="px-7 py-2 min-h-[44px] min-w-[110px] rounded-full bg-[#f0d411] hover:bg-[#e1c504] text-[#1f382f] border border-[#d6be0e] font-bold text-xs sm:text-sm shadow-sm transition active:scale-95 cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-[#236f7a]"
        >
          {loading ? "..." : isSpanish ? "Siguiente" : "Next"}
        </button>
      </div>
    </div>
  );
}

export default Slide9WhyItMattersScreen;
