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
      className="w-full h-full flex-1 min-h-0 flex flex-col justify-center items-center bg-[#f4f8ec] px-4 sm:px-6 py-3 sm:py-4 overflow-hidden gap-[clamp(1.25rem,3.5vh,2.25rem)]"
    >
      <div className="max-w-3xl mx-auto w-full shrink-0 flex flex-col justify-center space-y-2.5 sm:space-y-3 m-0">
        {/* Heading */}
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="text-sm sm:text-base md:text-lg font-bold text-slate-900 text-center tracking-tight leading-snug outline-none focus-visible:ring-2 focus-visible:ring-[#236f7a] px-2"
        >
          {isSpanish
            ? "¿Por qué se piensa que tantos niños tienen alergia a la penicilina cuando no es así? ¡Haga clic en cada cuadro para revelar la verdad!"
            : "Why are so many kids thought to have a penicillin allergy when they don't? Click each box to reveal the truth!"}
        </h1>

        {/* 4 Interactive Flip Cards */}
        <div className="space-y-2 sm:space-y-2.5 pt-1">
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
                className={`w-full min-h-[44px] px-4 py-2 sm:py-2.5 rounded-xl text-left font-semibold text-xs sm:text-sm md:text-[14.5px] leading-snug transition-all duration-200 shadow-2xs cursor-pointer border focus:outline-none focus-visible:ring-4 focus-visible:ring-[#236f7a] active:scale-[0.99] flex items-center justify-between gap-3 ${
                  isRevealed
                    ? "bg-[#b2ded6] border-[#8bc6bb] text-[#132c27]"
                    : "bg-[#fdd2b8] border-[#f4b693] text-[#4a2618] hover:bg-[#fadfcb]"
                }`}
              >
                <span className="flex-1">{displayText}</span>
                <span className="shrink-0 text-xs sm:text-sm font-bold opacity-75">
                  {isRevealed ? "✓" : "→"}
                </span>
              </button>
            );
          })}
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
          disabled={!allRevealed || loading}
          className={`px-8 py-2 min-h-[42px] min-w-[110px] rounded-full font-medium text-sm shadow-sm transition active:scale-95 cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-[#236f7a] ${
            allRevealed && !loading
              ? "bg-[#fae88a] hover:bg-[#f6df6e] text-[#143833] border border-[#d8c85c]"
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
