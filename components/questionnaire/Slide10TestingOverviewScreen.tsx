"use client";

import React, { useRef, useEffect } from "react";
import { resolveMedicineToken } from "@/lib/token-engine";

export interface Slide10TestingOverviewScreenProps {
  isSpanish: boolean;
  medicationName?: string;
  onNext: () => void;
  onBack: () => void;
  loading?: boolean;
}

export function Slide10TestingOverviewScreen({
  isSpanish,
  medicationName,
  onNext,
  onBack,
  loading = false,
}: Slide10TestingOverviewScreenProps) {
  const headingRef = useRef<HTMLHeadingElement | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      headingRef.current?.focus();
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  const rawIntro = isSpanish
    ? "Hay una prueba que el médico de su hijo puede realizar. Esta prueba puede determinar si su hijo puede tomar penicilina de manera segura."
    : "There's a test that your child's doctor can perform. This test can determine if your child can safely take penicillin.";

  const rawSubtitle = isSpanish
    ? "Las pruebas son seguras y se realizan en el consultorio"
    : "Testing is safe and done in the office";

  const rawBullets = [
    {
      en: "For the test, kids take [name] by mouth and are monitored in a doctor's office for about an hour.",
      es: "Para la prueba, los niños toman [name] por vía oral y se les monitorea en el consultorio médico durante aproximadamente una hora.",
    },
    {
      en: "Kids can help decide whether they want to take [name] as a liquid or chewable tablet.",
      es: "Los niños pueden ayudar a decidir si quieren tomar [name] en forma líquida o en tabletas masticables.",
    },
    {
      en: "Fortunately, kids tend to like the way [name] tastes!",
      es: "¡Afortunadamente, a los niños les suele gustar el sabor de [name]!",
    },
  ];

  const introText = resolveMedicineToken(rawIntro, medicationName, isSpanish);
  const subtitleText = resolveMedicineToken(rawSubtitle, medicationName, isSpanish);

  return (
    <div
      id="slide-content"
      className="bg-[#f4f8e8] border border-slate-200/80 rounded-3xl p-5 sm:p-7 shadow-md relative overflow-hidden flex flex-col justify-between min-h-[440px] max-h-[85vh]"
    >
      <div className="max-w-3xl mx-auto w-full flex-1 flex flex-col justify-center space-y-3.5">
        {/* Yellow Header Badge */}
        <div className="flex justify-start">
          <div className="inline-block bg-[#f0d411] text-[#1f382f] border border-[#d6be0e] px-5 py-1.5 rounded-full shadow-2xs">
            <h1
              ref={headingRef}
              tabIndex={-1}
              className="text-xs sm:text-sm md:text-base font-bold tracking-tight outline-none focus-visible:ring-2 focus-visible:ring-[#236f7a]"
            >
              {isSpanish ? "¡Hable con el médico de su hijo sobre las pruebas!" : "Talk to your child's doctor about testing!"}
            </h1>
          </div>
        </div>

        {/* Informational Content */}
        <div className="space-y-3 text-left pt-1">
          <p className="text-xs sm:text-sm md:text-base font-bold text-slate-800 leading-snug">
            {introText}
          </p>

          <div className="space-y-2 bg-white/70 border border-slate-200/80 rounded-2xl p-3.5 sm:p-4">
            <h2 className="text-xs sm:text-sm font-extrabold text-[#193630]">
              {subtitleText}
            </h2>

            <ul className="space-y-1.5 text-xs sm:text-sm font-medium text-slate-700 leading-snug">
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

export default Slide10TestingOverviewScreen;
