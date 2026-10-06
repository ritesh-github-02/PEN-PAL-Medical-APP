"use client";

import React, { useRef, useEffect } from "react";
import { NurseAnna } from "./NurseAnna";
import { SpeechBubble } from "./SpeechBubble";
import { resolveMedicineToken } from "@/lib/token-engine";

export interface Slide3EfficacyScreenProps {
  isSpanish: boolean;
  medicationName?: string;
  onNext: () => void;
  onBack: () => void;
  loading?: boolean;
}

export function Slide3EfficacyScreen({
  isSpanish,
  medicationName,
  onNext,
  onBack,
  loading = false,
}: Slide3EfficacyScreenProps) {
  const headingRef = useRef<HTMLHeadingElement | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      headingRef.current?.focus();
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  const rawTitle = isSpanish
    ? "Muchos niños han tomado [name] porque es el mejor para tratar infecciones comunes de oído, senos paranasales y garganta. También es uno de los mejores antibióticos para adultos."
    : "Many kids have had [name] because it's the best for treating common ear, sinus and throat infections. It is also one of the best antibiotics in adults, too.";

  const rawBubble = isSpanish
    ? "[Name] es un medicamento maravilloso, pero no funciona bien para resfriados comunes o la gripe."
    : "[Name] is a wonder drug, but it doesn't work well for common colds or the flu.";

  const titleText = resolveMedicineToken(rawTitle, medicationName, isSpanish);
  const bubbleText = resolveMedicineToken(rawBubble, medicationName, isSpanish);

  return (
    <div
      id="slide-content"
      className="bg-[#f4f8e8] border border-slate-200/80 rounded-3xl p-4 sm:p-7 shadow-md relative flex flex-col justify-between min-h-0 sm:min-h-[440px] max-h-none overflow-y-auto"
    >
      <div className="max-w-3xl mx-auto w-full flex-1 flex flex-col justify-center space-y-6 sm:space-y-8">
        {/* Main Body Statement */}
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="text-base sm:text-lg md:text-xl font-bold text-slate-900 tracking-tight leading-snug text-left outline-none focus-visible:ring-2 focus-visible:ring-[#236f7a]"
        >
          {titleText}
        </h1>

        {/* Speech Bubble pointing right to Nurse Anna */}
        <div className="flex items-center justify-end gap-3 sm:gap-4 pr-1 sm:pr-4">
          <SpeechBubble
            tailPosition="right-center"
            className="max-w-xs sm:max-w-sm md:max-w-md"
          >
            <p className="text-xs sm:text-sm md:text-base font-semibold text-slate-800 leading-snug">
              {bubbleText}
            </p>
          </SpeechBubble>

          <div className="shrink-0 flex items-center justify-center">
            <NurseAnna size="md" isDecorative={true} />
          </div>
        </div>
      </div>

      {/* Paired Bottom Navigation */}
      <div className="flex items-center justify-center gap-4 pt-4 mt-4 border-t border-slate-200/60">
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

export default Slide3EfficacyScreen;
