"use client";

import React, { useRef, useEffect } from "react";
import Image from "next/image";
import { resolveMedicineToken } from "@/lib/token-engine";

export interface Slide21WhatNowScreenProps {
  isSpanish: boolean;
  medicationName?: string;
  onNext: () => void;
  onBack: () => void;
  loading?: boolean;
}

export function Slide21WhatNowScreen({
  isSpanish,
  medicationName,
  onNext,
  onBack,
  loading = false,
}: Slide21WhatNowScreenProps) {
  const headingRef = useRef<HTMLHeadingElement | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      headingRef.current?.focus();
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  const rawTitle = isSpanish
    ? "¡Hable con el médico de su hijo sobre las pruebas de alergia a [name]!"
    : "Talk to your child's doctor about [name] allergy testing!";

  const rawBullets = [
    {
      en: "The test can help you learn the truth about your child's past reaction.",
      es: "La prueba puede ayudarle a saber la verdad sobre la reacción pasada de su hijo.",
    },
    {
      en: "The test may help your child get better medicine in the future.",
      es: "La prueba puede ayudar a que su hijo reciba mejores medicamentos en el futuro.",
    },
  ];

  const titleText = resolveMedicineToken(rawTitle, medicationName, isSpanish);

  return (
    <div
      id="slide-content"
      className="bg-[#f4f8e8] border border-slate-200/80 rounded-3xl p-4 sm:p-7 shadow-md relative flex flex-col justify-between min-h-0 sm:min-h-[440px] max-h-none overflow-y-auto"
    >
      <div className="max-w-3xl mx-auto w-full flex-1 flex flex-col justify-center space-y-3">
        {/* Yellow Header Badge */}
        <div className="flex justify-start">
          <div className="inline-block bg-[#f0d411] text-[#1f382f] border border-[#d6be0e] px-5 py-1.5 rounded-full shadow-2xs">
            <h1
              ref={headingRef}
              tabIndex={-1}
              className="text-xs sm:text-sm md:text-base font-bold tracking-tight outline-none focus-visible:ring-2 focus-visible:ring-[#236f7a]"
            >
              {isSpanish ? "¿Qué sigue ahora?" : "What Now?"}
            </h1>
          </div>
        </div>

        {/* Content & Doctor Consultation Artwork Side-by-Side */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center pt-1">
          <div className="sm:col-span-7 space-y-2.5 text-left">
            <h2 className="text-sm sm:text-base md:text-lg font-bold text-slate-900 tracking-tight leading-snug">
              {titleText}
            </h2>

            <ul className="space-y-2 text-xs sm:text-sm font-medium text-slate-700 leading-snug">
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

          <div className="sm:col-span-5 flex justify-center items-center">
            <div className="relative w-36 sm:w-48 h-32 sm:h-44 filter drop-shadow-sm">
              <Image
                src="/images/doctor-consultation.png"
                alt={
                  isSpanish
                    ? "Madre e hija consultando con la pediatra sobre las pruebas de alergia"
                    : "Mother and daughter consulting with pediatrician about allergy testing"
                }
                fill
                unoptimized
                style={{ imageRendering: "-webkit-optimize-contrast" }}
                className="object-contain"
                priority
              />
            </div>
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

export default Slide21WhatNowScreen;
