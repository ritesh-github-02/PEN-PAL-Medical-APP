"use client";

import React, { useState, useRef, useEffect } from "react";
import { resolveMedicineToken } from "@/lib/token-engine";

export interface Slide6MythTruthScreenProps {
  isSpanish: boolean;
  medicationName?: string;
  revealedCards?: number[];
  onRevealedChange?: (revealed: number[]) => void;
  onNext: () => void;
  onBack: () => void;
  loading?: boolean;
}

interface MythTruthItem {
  id: number;
  mythEn: string;
  mythEs: string;
  truthEn: string;
  truthEs: string;
}

const MYTH_TRUTH_DATA: MythTruthItem[] = [
  {
    id: 1,
    mythEn: "Myth 1 - If a child gets a rash when taking [name], it means they are allergic to [name].",
    mythEs: "Mito 1 - Si un niño tiene sarpullido al tomar [name], significa que es alérgico a [name].",
    truthEn: "Truth - A rash does not always mean an allergy. Rashes are common in kids, especially when they are sick. The underlying illness may have caused the rash.",
    truthEs: "Verdad - Un sarpullido no siempre significa alergia. Los sarpullidos son comunes en los niños, especialmente cuando están enfermos. La enfermedad subyacente puede haber causado el sarpullido.",
  },
  {
    id: 2,
    mythEn: "Myth 2 - If a child gets a belly ache or has diarrhea while taking [name], it means they are allergic to [name]",
    mythEs: "Mito 2 - Si un niño tiene dolor de estómago o diarrea mientras toma [name], significa que es alérgico a [name]",
    truthEn: "Truth - Belly aches and diarrhea are common side effects of antibiotics.",
    truthEs: "Verdad - Los dolores de estómago y la diarrea son efectos secundarios comunes de los antibióticos.",
  },
  {
    id: 3,
    mythEn: "Myth 3 - If a parent is allergic to penicillin, their child will be too.",
    mythEs: "Mito 3 - Si uno de los padres es alérgico a la penicilina, su hijo también lo será.",
    truthEn: "Truth - A penicillin allergy is not passed down from a parent to child.",
    truthEs: "Verdad - La alergia a la penicilina no se transmite de padres a hijos.",
  },
  {
    id: 4,
    mythEn: "Myth 4 - If a child has a [name] allergy, they will always have it.",
    mythEs: "Mito 4 - Si un niño tiene alergia a [name], siempre la tendrá.",
    truthEn: "Truth - A child may outgrow their allergy to [name].",
    truthEs: "Verdad - Un niño puede superar su alergia a [name].",
  },
];

export function Slide6MythTruthScreen({
  isSpanish,
  medicationName,
  revealedCards = [],
  onRevealedChange,
  onNext,
  onBack,
  loading = false,
}: Slide6MythTruthScreenProps) {
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const [revealed, setRevealed] = useState<number[]>(revealedCards);

  useEffect(() => {
    const timer = setTimeout(() => {
      headingRef.current?.focus();
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  const toggleCard = (id: number) => {
    const updated = revealed.includes(id)
      ? revealed.filter((i) => i !== id)
      : [...revealed, id];
    setRevealed(updated);
    if (onRevealedChange) {
      onRevealedChange(updated);
    }
  };

  const allRevealed = revealed.length === MYTH_TRUTH_DATA.length;

  return (
    <div
      id="slide-content"
      className="bg-[#f4f8e8] border border-slate-200/80 rounded-3xl p-5 sm:p-7 lg:p-10 xl:p-12 shadow-md relative overflow-hidden flex flex-col justify-between min-h-[400px] sm:min-h-[440px] lg:min-h-[520px] xl:min-h-[600px] 2xl:min-h-[660px] max-h-[85vh]"
    >
      <div className="max-w-3xl lg:max-w-4xl xl:max-w-5xl 2xl:max-w-6xl mx-auto w-full flex-1 flex flex-col justify-center space-y-3 lg:space-y-5">
        {/* Heading */}
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl font-bold text-slate-900 text-center tracking-tight leading-snug outline-none focus-visible:ring-2 focus-visible:ring-[#236f7a]"
        >
          {isSpanish
            ? "¿Por qué se piensa que tantos niños tienen alergia a la penicilina cuando no es así? ¡Haga clic en cada cuadro para revelar la verdad!"
            : "Why are so many kids thought to have a penicillin allergy when they don't? Click each box to reveal the truth!"}
        </h1>

        {/* 4 Interactive Flip Cards */}
        <div className="space-y-2 lg:space-y-3 pt-1">
          {MYTH_TRUTH_DATA.map((item) => {
            const isRevealed = revealed.includes(item.id);
            const rawText = isRevealed
              ? isSpanish ? item.truthEs : item.truthEn
              : isSpanish ? item.mythEs : item.mythEn;
            const displayText = resolveMedicineToken(rawText, medicationName, isSpanish);

            return (
              <button
                key={item.id}
                type="button"
                aria-expanded={isRevealed}
                onClick={() => toggleCard(item.id)}
                className={`w-full min-h-[44px] lg:min-h-[56px] xl:min-h-[62px] px-3.5 lg:px-5 py-2.5 lg:py-3.5 rounded-xl lg:rounded-2xl text-left font-semibold text-xs sm:text-sm lg:text-base xl:text-lg leading-snug transition-all duration-200 shadow-2xs cursor-pointer border focus:outline-none focus-visible:ring-4 focus-visible:ring-[#236f7a] active:scale-[0.99] flex items-center justify-between gap-2.5 ${
                  isRevealed
                    ? "bg-[#b2ded6] border-[#8bc6bb] text-[#132c27]"
                    : "bg-[#fdd2b8] border-[#f4b693] text-[#4a2618] hover:bg-[#fadfcb]"
                }`}
              >
                <span className="flex-1">{displayText}</span>
                <span className="shrink-0 text-xs sm:text-sm lg:text-base font-bold opacity-75">
                  {isRevealed ? "✓" : "→"}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Paired Navigation Buttons */}
      <div className="flex items-center justify-center gap-4 lg:gap-6 pt-4 lg:pt-6 mt-3 lg:mt-5 border-t border-slate-200/60">
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="px-7 sm:px-9 lg:px-11 xl:px-12 py-2 sm:py-2.5 lg:py-3 xl:py-3.5 min-h-[44px] lg:min-h-[50px] xl:min-h-[56px] min-w-[110px] lg:min-w-[130px] xl:min-w-[150px] rounded-full bg-[#7da199] hover:bg-[#6c8e86] text-[#132c27] font-bold text-xs sm:text-sm lg:text-base xl:text-lg shadow-xs transition active:scale-95 cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-[#236f7a]"
        >
          {isSpanish ? "Atrás" : "Back"}
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!allRevealed || loading}
          className={`px-7 sm:px-9 lg:px-11 xl:px-12 py-2 sm:py-2.5 lg:py-3 xl:py-3.5 min-h-[44px] lg:min-h-[50px] xl:min-h-[56px] min-w-[110px] lg:min-w-[130px] xl:min-w-[150px] rounded-full font-bold text-xs sm:text-sm lg:text-base xl:text-lg shadow-sm transition active:scale-95 cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-[#236f7a] ${
            allRevealed && !loading
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

export default Slide6MythTruthScreen;
