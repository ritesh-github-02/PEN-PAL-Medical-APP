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
      className="s9-root w-full h-full flex-1 min-h-0 flex flex-col justify-center items-center bg-[#f4f8ec] px-3 sm:px-5 py-2 sm:py-3 overflow-hidden gap-[clamp(0.6rem,2vh,1.25rem)]"
    >
      <div className="max-w-3xl mx-auto w-full shrink-0 flex flex-col justify-center space-y-2.5 sm:space-y-3 m-0">
        {/* Yellow Header Badge */}
        <div className="flex justify-start">
          <div className="inline-block bg-[#fae88a] text-[#132c27] border border-[#d8c85c] px-5 py-1.5 rounded-full shadow-2xs">
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
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-7 pt-0.5">
          <div className="shrink-0 flex items-center justify-center">
            <NurseAnna size="md" imgClassName="w-16 sm:w-24 md:w-28 max-h-[150px] sm:max-h-[185px] object-contain" isDecorative={true} />
          </div>

          <div className="space-y-2 flex-1 text-left">
            <p className="text-xs sm:text-sm md:text-base font-bold text-slate-800 leading-snug">
              {introText}
            </p>

            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-[13px] md:text-sm font-semibold text-slate-700 leading-snug">
              {rawBullets.map((b, idx) => {
                const text = resolveMedicineToken(isSpanish ? b.es : b.en, medicationName, isSpanish);
                return (
                  <li key={idx} className="flex items-start gap-2">
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
      <div className="flex items-center justify-center gap-6 m-0 p-0 shrink-0">
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="px-8 py-2 min-h-[42px] min-w-[110px] rounded-full bg-[#adc9c4] hover:bg-[#9cbdb8] text-[#143833] font-medium text-sm shadow-xs transition active:scale-95 cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-[#236f7a]"
        >
          {isSpanish ? "Atrás" : "Back"}
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={loading}
          className="px-8 py-2 min-h-[42px] min-w-[110px] rounded-full bg-[#fae88a] hover:bg-[#f6df6e] text-[#143833] border border-[#d8c85c] font-medium text-sm shadow-sm transition active:scale-95 cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-[#236f7a]"
        >
          {loading ? "..." : isSpanish ? "Siguiente" : "Next"}
        </button>
      </div>
    </div>
  );
}

export default Slide9WhyItMattersScreen;
