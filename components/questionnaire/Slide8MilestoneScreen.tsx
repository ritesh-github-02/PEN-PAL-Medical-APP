"use client";

import React, { useRef, useEffect } from "react";
import { NurseAnna } from "./NurseAnna";
import { SpeechBubble } from "./SpeechBubble";

export interface Slide8MilestoneScreenProps {
  isSpanish: boolean;
  onNext: () => void;
  onBack: () => void;
  loading?: boolean;
}

export function Slide8MilestoneScreen({
  isSpanish,
  onNext,
  onBack,
  loading = false,
}: Slide8MilestoneScreenProps) {
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
      className="bg-[#f4f8e8] border border-slate-200/80 rounded-3xl p-4 sm:p-7 shadow-md relative flex flex-col justify-between min-h-0 sm:min-h-[440px] max-h-none overflow-y-auto"
    >
      <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col justify-center py-2">
        {/* Large Congratulatory Speech Bubble with Nurse Anna */}
        <div className="flex items-center justify-center gap-4 sm:gap-6 w-full">
          <SpeechBubble
            tailPosition="right-center"
            className="flex-1 p-6 sm:p-8"
          >
            <h1
              ref={headingRef}
              tabIndex={-1}
              className="text-base sm:text-lg md:text-xl font-bold text-slate-800 leading-relaxed outline-none focus-visible:ring-2 focus-visible:ring-[#236f7a]"
            >
              {isSpanish
                ? "¡Buen trabajo! ¡Ahora ya sabe lo que es verdad sobre las alergias a la penicilina!"
                : "Great job! Now you know what is true about penicillin allergies!"}
            </h1>
          </SpeechBubble>

          <div className="shrink-0 flex items-center justify-center">
            <NurseAnna size="md" isDecorative={true} />
          </div>
        </div>
      </div>

      {/* Paired Navigation Buttons */}
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

export default Slide8MilestoneScreen;
