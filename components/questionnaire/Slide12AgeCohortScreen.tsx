"use client";

import React, { useRef, useEffect } from "react";
import { resolveMedicineToken } from "@/lib/token-engine";

const SLIDE12_CSS = `
/* ==========================================================
   Slide12AgeCohortScreen – Exact Target Design Pixel-Perfect Styles
   ========================================================== */

.s12-root,
.s12-root *,
.s12-root *::before,
.s12-root *::after {
  box-sizing: border-box;
}

.s12-root {
  position: relative;
  width: 100%;
  height: 100%;
  flex: 1 1 0%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background-color: #f6faee;
  padding: 1.5rem 2.5rem 0.85rem 2.5rem;
  overflow: hidden;
}

/* Heading */
.s12-top-section {
  width: 100%;
  text-align: center;
  margin-top: 0.25rem;
  margin-bottom: 0.5rem;
  flex-shrink: 0;
}
.s12-heading {
  font-size: 1.42rem;
  line-height: 1.35;
  font-weight: 700;
  color: #142724;
  letter-spacing: -0.015em;
  margin: 0;
  outline: none;
}
.s12-heading:focus-visible {
  box-shadow: 0 0 0 2px #236f7a;
}

/* Cohorts Row (Centered) */
.s12-middle {
  flex: 1 1 0%;
  min-height: 0;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: auto 0;
  padding: 0.25rem 0;
}

.s12-cohorts-grid {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 1.25rem;
  width: 100%;
  max-width: 820px;
}

.s12-cohort-col {
  flex: 1 1 0%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  cursor: pointer;
  user-select: none;
}

.s12-cohort-img-wrap {
  width: 100%;
  height: 185px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  margin-bottom: 0px;
  pointer-events: none;
}

.s12-cohort-img {
  height: 100%;
  width: auto;
  max-width: 100%;
  object-fit: contain;
  object-position: bottom center;
  display: block;
  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  filter: drop-shadow(0 2px 4px rgba(20, 50, 45, 0.08));
}

.s12-cohort-col:hover .s12-cohort-img {
  transform: translateY(-4px) scale(1.02);
}

.s12-cohort-col--selected .s12-cohort-img {
  transform: translateY(-3px);
}

.s12-cohort-btn {
  width: 100%;
  min-height: 52px;
  border-radius: 9px;
  padding: 0.45rem 0.35rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  cursor: pointer;
  background-color: #beddd7;
  border: 1.5px solid #4a867e;
  color: #142724;
  box-shadow: 0 3px 6px rgba(20, 50, 45, 0.12);
  transition: all 0.18s ease;
  outline: none;
}

.s12-cohort-btn:hover {
  background-color: #aed5ce;
  border-color: #3b746c;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(20, 50, 45, 0.18);
}

.s12-cohort-btn:active {
  transform: scale(0.97);
}

.s12-cohort-btn:focus-visible {
  box-shadow: 0 0 0 3px #1f4a43;
}

/* Checked / Selected Cohort Button */
.s12-cohort-btn--selected {
  background-color: #1f4d45;
  border-color: #153933;
  color: #ffffff;
  box-shadow: 0 4px 10px rgba(10, 40, 35, 0.28);
}

.s12-cohort-btn--selected:hover {
  background-color: #19433b;
}

.s12-cohort-title {
  font-size: 0.95rem;
  font-weight: 700;
  line-height: 1.2;
  color: inherit;
}

.s12-cohort-subtitle {
  font-size: 0.78rem;
  font-weight: 500;
  line-height: 1.2;
  margin-top: 2px;
  opacity: 0.92;
  color: inherit;
}

/* Navigation Bar */
.s12-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  padding: 0.25rem 0 0.5rem 0;
  flex-shrink: 0;
}

.s12-btn {
  padding: 0.45rem 2.2rem;
  min-height: 42px;
  min-width: 104px;
  border-radius: 9999px;
  font-size: 0.95rem;
  font-weight: 500;
  color: #143833;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
  outline: none;
  cursor: pointer;
  border: none;
  transition: all 0.15s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.s12-btn:active {
  transform: scale(0.96);
}
.s12-btn:focus-visible {
  box-shadow: 0 0 0 4px #236f7a;
}

.s12-btn--back {
  background-color: #adcbc7;
  border: 1px solid #94b9b4;
}
.s12-btn--back:hover {
  background-color: #9cbdb8;
}

.s12-btn--next {
  background-color: #fae98f;
  color: #143833;
  border: 1px solid #dac85e;
}
.s12-btn--next:hover {
  background-color: #f7e37b;
}

.s12-btn--disabled {
  background-color: rgba(250, 233, 143, 0.5);
  color: rgba(20, 56, 51, 0.45);
  border-color: rgba(218, 200, 94, 0.45);
  cursor: not-allowed;
  box-shadow: none;
}

/* Tablet & Mobile Scaling */
@media (max-height: 700px), (max-width: 860px) {
  .s12-root {
    padding: 1rem 1.75rem 0.5rem 1.75rem;
  }
  .s12-heading {
    font-size: 1.25rem;
  }
  .s12-cohorts-grid {
    gap: 0.85rem;
    max-width: 700px;
  }
  .s12-cohort-img-wrap {
    height: 155px;
  }
  .s12-cohort-btn {
    min-height: 46px;
    padding: 0.35rem 0.25rem;
  }
  .s12-cohort-title {
    font-size: 0.86rem;
  }
  .s12-cohort-subtitle {
    font-size: 0.72rem;
  }
  .s12-btn {
    padding: 0.38rem 1.8rem;
    font-size: 0.9rem;
    min-height: 38px;
  }
}

@media (max-height: 580px) {
  .s12-cohort-img-wrap {
    height: 125px;
  }
  .s12-cohort-btn {
    min-height: 42px;
  }
  .s12-cohort-title {
    font-size: 0.8rem;
  }
  .s12-cohort-subtitle {
    font-size: 0.68rem;
  }
}

@media (max-width: 640px) {
  .s12-root {
    overflow-y: auto;
    height: auto;
    min-height: 100%;
  }
  .s12-cohorts-grid {
    flex-wrap: wrap;
    gap: 0.75rem;
  }
  .s12-cohort-col {
    flex: 1 1 40%;
  }
  .s12-cohort-img-wrap {
    height: 130px;
  }
}
`;

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
    imageSrc: "/images/cohorts/clean_baby.png?v=3",
    altEn: "Baby aged 0 to 12 months",
    altEs: "Bebé de 0 a 12 meses",
  },
  {
    value: "Toddler (1-3 years)",
    titleEn: "Toddler",
    subtitleEn: "(1-3 years)",
    titleEs: "Niño pequeño",
    subtitleEs: "(1-3 años)",
    imageSrc: "/images/cohorts/clean_toddler.png?v=3",
    altEn: "Toddler aged 1 to 3 years",
    altEs: "Niño pequeño de 1 a 3 años",
  },
  {
    value: "School-aged (4-12 years)",
    titleEn: "School-aged",
    subtitleEn: "(4-12 years)",
    titleEs: "Edad escolar",
    subtitleEs: "(4-12 años)",
    imageSrc: "/images/cohorts/clean_school_aged.png?v=3",
    altEn: "School-aged child aged 4 to 12 years",
    altEs: "Niño en edad escolar de 4 a 12 años",
  },
  {
    value: "Teen (13-17 years)",
    titleEn: "Teen",
    subtitleEn: "(13-17 years)",
    titleEs: "Adolescente",
    subtitleEs: "(13-17 años)",
    imageSrc: "/images/cohorts/clean_teen.png?v=3",
    altEn: "Teenager aged 13 to 17 years",
    altEs: "Adolescente de 13 a 17 años",
  },
  {
    value: "Adult (18+)",
    titleEn: "Adult",
    subtitleEn: "(18+)",
    titleEs: "Adulto",
    subtitleEs: "(18+)",
    imageSrc: "/images/cohorts/clean_adult.png?v=3",
    altEn: "Adult aged 18 and older",
    altEs: "Adulto de 18 años o más",
  },
];

export interface Slide12AgeCohortScreenProps {
  isSpanish?: boolean;
  selected?: string;
  medicationName?: string;
  onSelect: (val: string) => void;
  onNext?: () => void;
  onBack?: () => void;
  loading?: boolean;
  navProps?: {
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
  onNext,
  onBack,
  loading = false,
  navProps,
}: Slide12AgeCohortScreenProps) {
  const slideTitleRef = useRef<HTMLHeadingElement>(null);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      slideTitleRef.current?.focus();
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  const rawTitle = isSpanish
    ? "¿Qué edad tenía su hijo cuando tuvo una reacción a [name]?"
    : "How old was your child when they had a reaction to [name]?";

  const titleText = resolveMedicineToken(rawTitle, medicationName, isSpanish);

  const handleNextClick = () => {
    if (onNext) {
      onNext();
    } else if (navProps?.onNext) {
      navProps.onNext(selected);
    }
  };

  const handleBackClick = () => {
    if (onBack) {
      onBack();
    } else if (navProps?.onBack) {
      navProps.onBack();
    }
  };

  const isLoading = loading || navProps?.loading || false;
  const isNextEnabled = !!selected && !isLoading;

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
    <div id="slide-content" className="s12-root">
      <style>{SLIDE12_CSS}</style>

      {/* 1. Slide Heading */}
      <div className="s12-top-section">
        <h1
          ref={slideTitleRef}
          tabIndex={-1}
          id="slide12-title"
          className="s12-heading"
        >
          {titleText}
        </h1>
      </div>

      {/* 2. 5 Interactive Age Cohort Characters & Buttons */}
      <div className="s12-middle">
        <div
          role="radiogroup"
          aria-labelledby="slide12-title"
          className="s12-cohorts-grid"
        >
          {AGE_COHORTS.map((cohort, index) => {
            const isSelected = selected === cohort.value;
            const title = isSpanish ? cohort.titleEs : cohort.titleEn;
            const subtitle = isSpanish ? cohort.subtitleEs : cohort.subtitleEn;
            const fullLabel = `${title} ${subtitle}`;

            return (
              <div
                key={cohort.value}
                className={`s12-cohort-col${isSelected ? " s12-cohort-col--selected" : ""}`}
                onClick={() => {
                  onSelect(cohort.value);
                  buttonRefs.current[index]?.focus();
                }}
              >
                {/* Character Illustration standing right above button */}
                <div className="s12-cohort-img-wrap">
                  <img
                    src={cohort.imageSrc}
                    alt=""
                    aria-hidden="true"
                    className="s12-cohort-img"
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
                  className={`s12-cohort-btn${isSelected ? " s12-cohort-btn--selected" : ""}`}
                >
                  <span className="s12-cohort-title">
                    {title}
                  </span>
                  <span className="s12-cohort-subtitle">
                    {subtitle}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Bottom Centered Navigation Buttons (Back & Next) */}
      <div className="s12-nav">
        <button
          type="button"
          onClick={handleBackClick}
          disabled={isLoading}
          className="s12-btn s12-btn--back"
        >
          {isSpanish ? "Atrás" : "Back"}
        </button>
        <button
          type="button"
          onClick={handleNextClick}
          disabled={!isNextEnabled}
          className={`s12-btn s12-btn--next${!isNextEnabled ? " s12-btn--disabled" : ""}`}
        >
          {isLoading ? "..." : isSpanish ? "Siguiente" : "Next"}
        </button>
      </div>
    </div>
  );
}

export default Slide12AgeCohortScreen;
