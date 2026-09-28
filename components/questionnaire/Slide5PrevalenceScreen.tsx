"use client";

import React, { useRef, useEffect } from "react";
import Image from "next/image";
import { resolveMedicineToken } from "@/lib/token-engine";

export interface Slide5PrevalenceScreenProps {
  isSpanish: boolean;
  medicationName?: string;
  onNext: () => void;
  onBack: () => void;
  loading?: boolean;
}

export function Slide5PrevalenceScreen({
  isSpanish,
  medicationName,
  onNext,
  onBack,
  loading = false,
}: Slide5PrevalenceScreenProps) {
  const headingRef = useRef<HTMLHeadingElement | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      headingRef.current?.focus();
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  const rawCopy = isSpanish
    ? "La mayoría de las personas que piensan que son alérgicas a la penicilina pueden tomarla de manera segura. De cada 100 niños con alergia a [name], 95 pueden tomar [name] sin tener ninguna reacción."
    : "Most people who think they are allergic to penicillin can safely take it. Out of 100 kids with a [name] allergy, 95 can take [name] without having any reaction.";

  const copyText = resolveMedicineToken(rawCopy, medicationName, isSpanish);

  return (
    <div
      id="slide-content"
      className="bg-[#f4f8e8] border border-slate-200/80 rounded-3xl p-5 sm:p-7 shadow-md relative overflow-hidden flex flex-col justify-between min-h-[440px] max-h-[85vh]"
    >
      <div className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8 max-w-3xl mx-auto w-full py-2">
        {/* Left: Pink Bottle & Boy with 95% Shield */}
        <div className="flex items-center justify-center gap-3 sm:gap-5 shrink-0">
          <div className="relative w-16 sm:w-24 h-32 sm:h-44 filter drop-shadow-sm">
            <Image
              src="/images/amoxicillin-bottle.png"
              alt={isSpanish ? "Frasco de amoxicilina rosa" : "Pink amoxicillin suspension bottle"}
              fill
              className="object-contain"
              priority
            />
          </div>
          <div className="relative w-24 sm:w-36 h-40 sm:h-52 filter drop-shadow-sm">
            <Image
              src="/images/boy-95-percent.png"
              alt={
                isSpanish
                  ? "Niño sosteniendo escudo: El 95% de los niños pueden tomarlo de forma segura"
                  : "Boy holding shield badge: 95% of kids can take it safely"
              }
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Right: Main Content Text */}
        <div className="flex-1 text-left">
          <h1
            ref={headingRef}
            tabIndex={-1}
            className="text-sm sm:text-base md:text-lg font-bold text-slate-800 leading-relaxed outline-none focus-visible:ring-2 focus-visible:ring-[#236f7a]"
          >
            {copyText}
          </h1>
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

export default Slide5PrevalenceScreen;
