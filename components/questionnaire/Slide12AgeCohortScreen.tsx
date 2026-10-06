"use client";

import React, { useRef, useEffect } from "react";

export interface AgeCohortOption {
  value: string;
  titleEn: string;
  subtitleEn: string;
  titleEs: string;
  subtitleEs: string;
  imageSrc: string;
  altEn: string;
  altEs: string;
}

export const AGE_COHORTS: AgeCohortOption[] = [
  {
    value: "Baby (0-12 months)",
    titleEn: "Baby",
    subtitleEn: "(0-12 months)",
    titleEs: "Bebé",
    subtitleEs: "(0-12 meses)",
    imageSrc: "/images/cohorts/baby.png",
    altEn: "Baby aged 0 to 12 months",
    altEs: "Bebé de 0 a 12 meses",
  },
  {
    value: "Toddler (1-3 years)",
    titleEn: "Toddler",
    subtitleEn: "(1-3 years)",
    titleEs: "Niño pequeño",
    subtitleEs: "(1-3 años)",
    imageSrc: "/images/cohorts/toddler.png",
    altEn: "Toddler aged 1 to 3 years",
    altEs: "Niño pequeño de 1 a 3 años",
  },
  {
    value: "School-aged (4-12 years)",
    titleEn: "School-aged",
    subtitleEn: "(4-12 years)",
    titleEs: "Edad escolar",
    subtitleEs: "(4-12 años)",
    imageSrc: "/images/cohorts/school-aged.png",
    altEn: "School-aged child aged 4 to 12 years",
    altEs: "Niño en edad escolar de 4 a 12 años",
  },
  {
    value: "Teen (13-17 years)",
    titleEn: "Teen",
    subtitleEn: "(13-17 years)",
    titleEs: "Adolescente",
    subtitleEs: "(13-17 años)",
    imageSrc: "/images/cohorts/teen.png",
    altEn: "Teenager aged 13 to 17 years",
    altEs: "Adolescente de 13 a 17 años",
  },
  {
    value: "Adult (18+)",
    titleEn: "Adult",
    subtitleEn: "(18+)",
    titleEs: "Adulto",
    subtitleEs: "(18+)",
    imageSrc: "/images/cohorts/adult.png",
    altEn: "Adult aged 18 and older",
    altEs: "Adulto de 18 años o más",
  },
];

export interface Slide12AgeCohortScreenProps {
  isSpanish?: boolean;
  selected?: string;
  medicationName?: string;
  onSelect: (val: string) => void;
  navProps: {
    onNext: (explicitAnswer?: any) => void;
    onBack: () => void;
    loading?: boolean;
    headingRef?: React.RefObject<HTMLHeadingElement | null>;
  };
}

export function Slide12AgeCohortScreen({
  isSpanish = false,
  selected,
  medicationName,
  onSelect,
  navProps,
}: Slide12AgeCohortScreenProps) {
  const slideTitleRef = useRef<HTMLHeadingElement>(null);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // WCAG 2.1 AA Compliance (Auditor Karen): Focus heading on mount after 50ms without duplicate aria-live
  useEffect(() => {
    const timer = setTimeout(() => {
      if (slideTitleRef.current) {
        slideTitleRef.current.focus();
      }
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  // Medication token replacement
  const effectiveMedName =
    medicationName?.trim() || (isSpanish ? "la penicilina" : "penicillin");

  const titleText = isSpanish
    ? `¿Qué edad tenía su hijo cuando tuvo una reacción a ${effectiveMedName}?`
    : `How old was your child when they had a reaction to ${effectiveMedName}?`;

  // Standard Accessible Keyboard Navigation for Radiogroup (Arrows, Home, End)
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    let nextIndex = -1;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      nextIndex = (index + 1) % AGE_COHORTS.length;
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      nextIndex = (index - 1 + AGE_COHORTS.length) % AGE_COHORTS.length;
    } else if (e.key === "Home") {
      e.preventDefault();
      nextIndex = 0;
    } else if (e.key === "End") {
      e.preventDefault();
      nextIndex = AGE_COHORTS.length - 1;
    }

    if (nextIndex !== -1) {
      const nextCohort = AGE_COHORTS[nextIndex];
      onSelect(nextCohort.value);
      buttonRefs.current[nextIndex]?.focus();
    }
  };

  return (
    <div
      id="slide-content"
      className="bg-[#f4f8e8] border border-slate-200/60 rounded-3xl shadow-lg relative flex flex-col justify-between p-4 sm:p-6 md:p-8 min-h-0 sm:min-h-[520px] max-h-none overflow-y-auto w-full max-w-4xl mx-auto"
    >
      {/* Slide Heading */}
      <div className="mb-3 sm:mb-6 md:mb-8 text-center">
        <h2
          ref={slideTitleRef}
          tabIndex={-1}
          id="slide12-title"
          className="text-base sm:text-2xl md:text-3xl font-bold text-[#1f382f] tracking-tight leading-snug outline-none max-w-2xl mx-auto focus-visible:ring-4 focus-visible:ring-[#236f7a] rounded-lg p-1"
        >
          {titleText}
        </h2>
      </div>

      {/* 5 Interactive Age Cohort Cards */}
      <div
        role="radiogroup"
        aria-labelledby="slide12-title"
        className="grid grid-cols-5 gap-1.5 sm:gap-3 items-end justify-center w-full max-w-3xl mx-auto px-0.5 sm:px-2 my-auto"
      >
        {AGE_COHORTS.map((cohort, index) => {
          const isSelected = selected === cohort.value;
          const title = isSpanish ? cohort.titleEs : cohort.titleEn;
          const subtitle = isSpanish ? cohort.subtitleEs : cohort.subtitleEn;
          const fullLabel = `${title} ${subtitle}`;

          return (
            <div
              key={cohort.value}
              className="flex flex-col items-center justify-end w-full group cursor-pointer"
              onClick={() => {
                onSelect(cohort.value);
                buttonRefs.current[index]?.focus();
              }}
            >
              {/* Character Illustration standing directly on top of button */}
              <div className="h-12 sm:h-20 md:h-24 w-full flex items-end justify-center pb-1 select-none">
                <img
                  src={cohort.imageSrc}
                  alt=""
                  aria-hidden="true"
                  className="max-h-full w-auto object-contain transition-transform duration-200 group-hover:scale-105 pointer-events-none drop-shadow-2xs"
                  style={{ imageRendering: "-webkit-optimize-contrast" }}
                />
              </div>

              {/* Selection Button */}
              <button
                ref={(el) => {
                  buttonRefs.current[index] = el;
                }}
                type="button"
                role="radio"
                aria-checked={isSelected}
                tabIndex={isSelected || (!selected && index === 0) ? 0 : -1}
                aria-label={fullLabel}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(cohort.value);
                }}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className={`w-full min-h-[44px] px-1 py-1.5 rounded-xl flex flex-col items-center justify-center text-center transition-all duration-150 cursor-pointer shadow-2xs active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#236f7a] ${
                  isSelected
                    ? "bg-[#f0d411] hover:bg-[#e6ca0f] text-[#1f382f] border-2 border-[#cca900] shadow-xs"
                    : "bg-[#82afb5] hover:bg-[#729fa5] text-[#132c27] border border-[#689196]"
                }`}
              >
                <span className="font-bold text-[10px] sm:text-xs md:text-sm leading-tight block">
                  {title}
                </span>
                <span className="font-medium text-[8px] sm:text-[10px] md:text-xs leading-tight block mt-0.5 opacity-90">
                  {subtitle}
                </span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Centered Paired Navigation [ Back ] [ Next ] */}
      <div className="flex items-center justify-center gap-4 sm:gap-8 pt-4 sm:pt-6 pb-2 mt-auto">
        {/* Back Button */}
        <button
          type="button"
          onClick={navProps.onBack}
          aria-label={isSpanish ? "Volver al paso anterior" : "Go back to previous step"}
          className="px-8 sm:px-10 py-2.5 min-h-[44px] min-w-[110px] rounded-full font-bold text-sm sm:text-base bg-[#82afb5] hover:bg-[#709da3] text-[#132c27] border border-[#689196] shadow-xs cursor-pointer active:scale-95 transition-all flex items-center justify-center focus:outline-none focus-visible:ring-4 focus-visible:ring-[#236f7a]"
        >
          {isSpanish ? "Atrás" : "Back"}
        </button>

        {/* Next Button */}
        <button
          type="button"
          disabled={!selected}
          onClick={() => {
            if (selected) {
              navProps.onNext(selected);
            }
          }}
          aria-label={isSpanish ? "Continuar al siguiente paso" : "Continue to next step"}
          className={`px-8 sm:px-10 py-2.5 min-h-[44px] min-w-[110px] rounded-full font-bold text-sm sm:text-base shadow-xs transition-all flex items-center justify-center focus:outline-none focus-visible:ring-4 focus-visible:ring-[#236f7a] ${
            selected
              ? "bg-[#f0d411] hover:bg-[#e1c504] text-[#1f382f] border border-[#cca900] cursor-pointer active:scale-95"
              : "bg-[#f0d411]/50 text-[#1f382f]/50 border border-transparent cursor-not-allowed"
          }`}
        >
          {isSpanish ? "Siguiente" : "Next"}
        </button>
      </div>
    </div>
  );
}

export default Slide12AgeCohortScreen;
