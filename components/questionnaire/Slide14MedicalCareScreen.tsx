"use client";

import React, { useState, useRef, useEffect } from "react";
import AudioPlayer from "./AudioPlayer";
import SlideNavigationButtons from "./SlideNavigationButtons";

const SLIDE14_CSS = `
/* ==========================================================
   Slide14MedicalCareScreen – Pixel-Perfect Styles Matching Target UI
   ========================================================== */

.s14-root,
.s14-root *,
.s14-root *::before,
.s14-root *::after {
  box-sizing: border-box;
}

.s14-root {
  position: relative;
  width: 100%;
  height: 100%;
  flex: 1 1 0%;
  min-height: 0;
  display: grid;
  grid-template-columns: minmax(0, 550px) auto;
  justify-content: center;
  align-content: center;
  align-items: center;
  column-gap: 2.5rem;
  row-gap: clamp(0.85rem, 2.2vh, 1.5rem);
  background-color: #f4f8ec;
  padding: 1.25rem 2.5rem 4.25rem 2.5rem;
  overflow: hidden;
}

/* Heading */
.s14-top-section {
  width: 100%;
  text-align: center;
  margin: 0;
  padding: 0;
  flex-shrink: 0;
  grid-column: 1;
  grid-row: 1;
  align-self: end;
}
.s14-heading {
 font-size: clamp(1.05rem, 2vw, 1.25rem);
    line-height: 1.35;
    font-weight: 700;
    color: #142724;
    letter-spacing: -0.015em;
    margin: 0;
    outline: none;

}
.s14-heading:focus-visible {
  box-shadow: 0 0 0 2px #236f7a;
}

/* Middle Section: card + Nurse Anna participate in the root grid so the
   heading shares the card's column and stays centred over it */
.s14-middle {
  display: contents;
}

/* Main Rounded Teal Card Container */
.s14-card {
  background-color: #8cb2a7;
  border: 1.5px solid #759c92;
  border-radius: 20px;
  padding: 1.6rem 1.85rem;
  box-shadow: 0 4px 14px rgba(20, 55, 50, 0.12);
  display: flex;
  flex-direction: column;
  align-items: stretch;
  max-width: 550px;
  width: 100%;
  transition: all 0.2s ease;
  grid-column: 1;
  grid-row: 2;
  align-self: start;
}

/* Options Row */
.s14-options-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  width: 100%;
}

/* White Option Buttons inside Teal Card */
.s14-option-btn {
  flex: 1 1 0%;
  min-height: 44px;
  padding: 0.55rem 0.85rem;
  border-radius: 8px;
  background-color: #ffffff;
  border: 1px solid #759c92;
  color: #142724;
  font-size: 0.9rem;
  font-weight: 700;
  line-height: 1.25;
  text-align: center;
  white-space: nowrap;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.16s ease;
  outline: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.s14-option-btn:hover {
  background-color: #f2f8f6;
  border-color: #5f897e;
  transform: translateY(-1.5px);
  box-shadow: 0 3px 7px rgba(0, 0, 0, 0.12);
}

.s14-option-btn:active {
  transform: scale(0.97);
}

.s14-option-btn:focus-visible {
  box-shadow: 0 0 0 3px #1f4d45;
}


/* Selected Button State: Yellowish background with greenish border (same as the other survey slides) */
.s14-option-btn--selected {
  background-color: #ffd41d !important;
  border-color: #1c5249 !important;
  color: #142724 !important;
  box-shadow: 0 3px 8px rgba(10, 40, 35, 0.22) !important;
}

.s14-option-btn--selected:hover {
  background-color: #f7ca12 !important;
  border-color: #143e37 !important;
  color: #142724 !important;
}
/* Location Badge inside Card (when Yes is chosen) */
.s14-location-badge {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(20, 58, 52, 0.25);
  border-radius: 8px;
  padding: 0.35rem 0.65rem;
  margin-top: 0.55rem;
  font-size: 0.8rem;
  color: #143833;
}

.s14-location-change-btn {
  background: none;
  border: none;
  color: #1f4d45;
  font-weight: 700;
  text-decoration: underline;
  cursor: pointer;
  padding: 0;
  margin-left: 0.5rem;
  font-size: 0.78rem;
}

/* Nurse Anna Wrapper */
.s14-nurse-wrap {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  flex-shrink: 0;
  grid-column: 2;
  grid-row: 1 / span 2;
  align-self: center;
  justify-self: center;
  user-select: none;
}

.s14-nurse-img {
  height: clamp(210px, 34vh, 270px);
  width: auto;
  object-fit: contain;
  display: block;
  filter: drop-shadow(0 4px 12px rgba(20, 50, 45, 0.12));
}

/* ==========================================================
   Modal 15: Care Location Dialog Styles
   ========================================================== */
.s14-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background-color: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(2px);
}

.s14-modal-card {
  background-color: #f7f4ec;
  border: 1.5px solid #d8d2c2;
  border-radius: 18px;
  padding: 1.5rem 1.65rem 1.15rem 1.65rem;
  max-width: 490px;
  width: 100%;
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.22);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  animation: s14FadeIn 0.18s ease-out;
}

@keyframes s14FadeIn {
  from { opacity: 0; transform: scale(0.96); }
  to { opacity: 1; transform: scale(1); }
}

.s14-modal-heading {
  font-size: 1.15rem;
  font-weight: 700;
  line-height: 1.3;
  color: #142724;
  margin: 0;
  text-align: center;
  outline: none;
}

.s14-modal-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.65rem;
  width: 100%;
}

.s14-modal-btn {
  min-height: 44px;
  padding: 0.55rem 0.65rem;
  border-radius: 8px;
  background-color: #ffffff;
  border: 1px solid #759c92;
  color: #142724;
  font-size: 0.85rem;
  font-weight: 700;
  line-height: 1.25;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.15s ease;
  outline: none;
  display: flex;
  align-items: center;
  justify-content: center;
  white-space: pre-line;
}

.s14-modal-btn:hover {
  background-color: #f2f8f6;
  border-color: #5f897e;
  transform: translateY(-1px);
}

/* Selected location option: yellowish, same as the card options */
.s14-modal-btn--selected {
  background-color: #ffd41d !important;
  border-color: #1c5249 !important;
  color: #142724 !important;
  box-shadow: 0 3px 8px rgba(10, 40, 35, 0.22) !important;
}

.s14-modal-btn--selected:hover {
  background-color: #f7ca12 !important;
  border-color: #143e37 !important;
  color: #142724 !important;
}

.s14-modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  height: 22px;
  margin-top: 0.25rem;
}

.s14-modal-close-btn {
  background-color: #ffffff;
  border: 1px solid #759c92;
  border-radius: 6px;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #557871;
  font-size: 0.72rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  transition: all 0.15s ease;
  outline: none;
}

.s14-modal-close-btn:hover {
  background-color: #f7faf9;
  color: #c93b2b;
  border-color: #a6bbb5;
}

/* Responsive Scaling (Tablet / Short Desktop) */
@media (min-width: 768px) and (max-height: 700px), (min-width: 768px) and (max-width: 860px) {
  .s14-root {
    padding: 1rem 1.75rem 4.25rem 1.75rem;
    column-gap: 1.5rem;
    row-gap: clamp(0.65rem, 1.8vh, 1.15rem);
    grid-template-columns: minmax(0, 460px) auto;
  }
  .s14-heading {
    font-size: 1.2rem;
  }
  .s14-card {
    padding: 1.25rem 1.4rem 1.05rem 1.4rem;
    max-width: 460px;
  }
  .s14-option-btn {
    min-height: 40px;
    font-size: 0.84rem;
    padding: 0.45rem 0.65rem;
  }
  .s14-nurse-img {
    height: clamp(175px, 28vh, 220px);
  }
}

/* Wrapper collapses on desktop so root grid + absolute audio/nav stay identical */
.s14-main-stage {
  display: contents;
}
.s14-bottom-bar {
  display: contents;
}

.s14-audio {
  position: absolute;
  right: 22px;
  bottom: clamp(16px, 3vh, 22px);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  z-index: 30;
}
.s14-root .slide-nav {
  margin: 10px auto 0.25rem auto !important;
}

${(() => {
  const mobileLayout = (scope: string) => `
    ${scope} {
      display: flex !important;
      flex-direction: column !important;
      justify-content: space-between !important;
      align-items: center !important;
      overflow-y: auto !important;
      overflow-x: hidden !important;
      height: 100% !important;
      max-height: 100% !important;
      min-height: 100% !important;
      flex: 1 1 auto !important;
      padding: 14px 16px 12px 16px !important;
      gap: 10px !important;
      box-sizing: border-box !important;
      background-color: transparent !important;
      border: none !important;
      box-shadow: none !important;
      border-radius: 0 !important;
    }
    ${scope} .s14-main-stage {
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      justify-content: space-evenly !important;
      width: 100% !important;
      max-width: 380px !important;
      flex: 1 0 auto !important;
      min-height: 0 !important;
      margin: auto 0 !important;
      padding: 4px 0 !important;
      gap: clamp(16px, 2.8vh, 26px) !important;
    }
    ${scope} .s14-top-section {
      grid-column: auto !important;
      grid-row: auto !important;
      align-self: center !important;
      width: 100% !important;
      max-width: 345px !important;
      margin: 0 auto !important;
      flex-shrink: 0 !important;
    }
    ${scope} .s14-heading {
      font-size: clamp(16.5px, 2.4vh, 19px) !important;
      line-height: 1.36 !important;
      text-align: center !important;
    }
    ${scope} .s14-heading:focus:not(:focus-visible) {
      outline: none !important;
      box-shadow: none !important;
    }
    ${scope} .s14-middle {
      display: contents !important;
    }
    ${scope} .s14-card {
      grid-column: auto !important;
      grid-row: auto !important;
      align-self: center !important;
      max-width: 360px !important;
      width: 100% !important;
      padding: 16px 14px !important;
      border-radius: 18px !important;
      flex-shrink: 0 !important;
    }
    ${scope} .s14-options-row {
      display: grid !important;
      grid-template-columns: minmax(68px, 0.9fr) minmax(68px, 0.9fr) minmax(132px, 1.55fr) !important;
      gap: 8px !important;
      width: 100% !important;
    }
    ${scope} .s14-option-btn {
      width: 100% !important;
      min-height: clamp(50px, 6.8vh, 56px) !important;
      font-size: clamp(12.5px, 1.75vh, 14px) !important;
      line-height: 1.25 !important;
      white-space: normal !important;
      overflow-wrap: break-word !important;
      padding: 8px 6px !important;
      border-radius: 11px !important;
    }
    ${scope} .s14-location-badge {
      flex-wrap: wrap !important;
      gap: 8px !important;
      margin-top: 10px !important;
      padding: 8px 12px !important;
      font-size: 13px !important;
    }
    ${scope} .s14-location-change-btn {
      min-height: 28px !important;
      font-size: 13px !important;
    }
    ${scope} .s14-nurse-wrap {
      grid-column: auto !important;
      grid-row: auto !important;
      align-self: center !important;
      justify-self: center !important;
      width: 100% !important;
      height: auto !important;
      max-height: none !important;
      margin: 0 auto !important;
      display: flex !important;
      justify-content: center !important;
      align-items: flex-end !important;
      flex-shrink: 0 !important;
    }
    ${scope} .s14-nurse-img {
      height: clamp(150px, 23vh, 200px) !important;
      max-height: 200px !important;
      width: auto !important;
      max-width: 100% !important;
      object-fit: contain !important;
      display: block !important;
      filter: drop-shadow(0 4px 10px rgba(20, 50, 45, 0.12)) !important;
    }
    ${scope} .s14-bottom-bar {
      width: 100% !important;
      max-width: 360px !important;
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      justify-content: center !important;
      gap: clamp(10px, 1.8vh, 16px) !important;
      padding-top: 6px !important;
      padding-bottom: calc(10px + env(safe-area-inset-bottom, 0px)) !important;
      margin: 0 auto !important;
      flex-shrink: 0 !important;
      z-index: 25 !important;
      pointer-events: auto !important;
    }
    ${scope} .s14-audio {
      order: 1 !important;
      position: static !important;
      right: auto !important;
      bottom: auto !important;
      width: 100% !important;
      display: flex !important;
      justify-content: center !important;
      margin: 0 auto !important;
      color: #144e57 !important;
      z-index: 25 !important;
      pointer-events: auto !important;
    }
    ${scope} .s14-audio > div {
      gap: 8px !important;
    }
    ${scope} .s14-audio .audio-cc-btn,
    ${scope} .s14-audio .audio-play-btn {
      color: #144e57 !important;
      min-width: 44px !important;
      min-height: 44px !important;
      padding: 4px !important;
    }
    ${scope} .s14-audio .audio-cc-btn svg,
    ${scope} .s14-audio .audio-play-btn svg {
      height: 34px !important;
      width: auto !important;
    }
    ${scope} .slide-nav {
      order: 2 !important;
      position: relative !important;
      bottom: auto !important;
      top: auto !important;
      left: auto !important;
      right: auto !important;
      margin: 0 auto !important;
      gap: 16px !important;
      pointer-events: auto !important;
    }
    ${scope} .slide-nav-btn {
      min-width: 128px !important;
      padding: 0 32px !important;
    }
    ${scope} .s14-modal-card {
      padding: 1.25rem 1rem 1rem 1rem !important;
      border-radius: 16px !important;
      max-height: 88dvh !important;
      overflow-y: auto !important;
    }
    ${scope} .s14-modal-grid {
      gap: 0.55rem !important;
    }
    ${scope} .s14-modal-btn {
      min-height: 46px !important;
      font-size: 0.84rem !important;
      padding: 0.5rem 0.5rem !important;
    }
  `;
  return `
    ${mobileLayout(".s14-root.is-mobile")}
    @media (max-width: 767px) {
      ${mobileLayout(".s14-root:not(.is-desktop)")}
      .s14-root:not(.is-desktop) {
        min-height: min(640px, calc(100dvh - 80px)) !important;
        max-height: calc(100dvh - 72px) !important;
      }
    }
    @media (max-width: 767px) and (max-height: 620px) {
      .s14-root:not(.is-desktop) .s14-nurse-img {
        height: clamp(105px, 16vh, 135px) !important;
        max-height: 135px !important;
      }
    }
    @media (max-width: 359px) {
      .s14-root:not(.is-desktop) .s14-options-row {
        grid-template-columns: repeat(2, 1fr) !important;
      }
      .s14-root:not(.is-desktop) .s14-option-btn:last-child {
        grid-column: 1 / -1 !important;
      }
      .s14-root:not(.is-desktop) .s14-modal-grid {
        grid-template-columns: 1fr !important;
      }
    }
  `;
})()}
`;

export interface CareOption {
  value: string;
  labelEn: string;
  labelEs: string;
}

export const CARE_OPTIONS: CareOption[] = [
  { value: "Yes", labelEn: "Yes", labelEs: "Sí" },
  { value: "No", labelEn: "No", labelEs: "No" },
  { value: "Unsure", labelEn: "Unsure/I don't know", labelEs: "No estoy seguro" },
];

export const LOCATION_OPTIONS = [
  { value: "Emergency room (ER)", labelEn: "Emergency room\n(ER)", labelEs: "Sala de emergencias\n(ER)" },
  { value: "Urgent care", labelEn: "Urgent care", labelEs: "Centro de urgencias" },
  { value: "Primary care doctor", labelEn: "Primary care doctor", labelEs: "Médico de atención primaria" },
  { value: "Hospital", labelEn: "Hospital", labelEs: "Hospital" },
  { value: "Phone call with doctor", labelEn: "Phone call with doctor", labelEs: "Llamada con el médico" },
  { value: "Unsure", labelEn: "Unsure/I don't know", labelEs: "No estoy seguro" },
];

function isCareSelected(optValue: string, currentSelected?: string): boolean {
  if (!currentSelected) return false;
  if (currentSelected === optValue) return true;
  if (optValue === "Unsure" && currentSelected.toLowerCase().includes("unsure")) return true;
  return false;
}

function isLocationSelected(optValue: string, currentLocation?: string): boolean {
  if (!currentLocation) return false;
  if (currentLocation === optValue) return true;
  if (optValue === "Unsure" && currentLocation.toLowerCase().includes("unsure")) return true;
  return false;
}

export interface Slide14MedicalCareScreenProps {
  isSpanish?: boolean;
  selected?: string;
  locationSelected?: string;
  onSelect: (val: string) => void;
  onLocationSelect: (loc: string) => void;
  onNext?: () => void;
  onBack?: () => void;
  loading?: boolean;
  audioSrc?: string;
  stepId?: string;
  locale?: string;
  transcriptText?: string;
  variant?: "auto" | "desktop" | "mobile";
  navProps?: {
    onNext: (explicitAnswer?: any) => void;
    onBack: () => void;
    loading?: boolean;
    headingRef?: React.RefObject<HTMLHeadingElement | null>;
  };
}

export function Slide14MedicalCareScreen({
  isSpanish = false,
  selected,
  locationSelected,
  onSelect,
  onLocationSelect,
  onNext,
  onBack,
  loading = false,
  audioSrc,
  stepId = "screen6_4_resolution",
  locale,
  transcriptText,
  variant = "auto",
  navProps,
}: Slide14MedicalCareScreenProps) {
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const modalHeadingRef = useRef<HTMLHeadingElement | null>(null);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  const isEs = isSpanish || (locale ? locale.startsWith("es") : false);
  const effectiveAudioSrc =
    audioSrc ||
    (isEs
      ? "/audio/exported/screen6_4_care_es.mp3"
      : "/audio/exported/screen6_4_care_en.mp3");

  const effectiveTranscript =
    transcriptText ||
    (isEs
      ? "¿Su hijo recibió atención médica por su reacción?"
      : "Did your child receive medical care for their reaction?");

  useEffect(() => {
    const timer = setTimeout(() => {
      headingRef.current?.focus();
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!modalOpen) return;
    const timer = setTimeout(() => {
      modalHeadingRef.current?.focus();
    }, 50);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setModalOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [modalOpen]);

  const handleMainOption = (val: string) => {
    onSelect(val);
    if (val === "Yes") {
      setModalOpen(true);
    } else {
      onLocationSelect("");
    }
  };

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
      nextIndex = (index + 1) % CARE_OPTIONS.length;
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      nextIndex = (index - 1 + CARE_OPTIONS.length) % CARE_OPTIONS.length;
    } else if (e.key === "Home") {
      e.preventDefault();
      nextIndex = 0;
    } else if (e.key === "End") {
      e.preventDefault();
      nextIndex = CARE_OPTIONS.length - 1;
    }

    if (nextIndex !== -1) {
      const nextOpt = CARE_OPTIONS[nextIndex];
      handleMainOption(nextOpt.value);
      buttonRefs.current[nextIndex]?.focus();
    }
  };

  const selectedLocLabel = isSpanish
    ? LOCATION_OPTIONS.find((l) => isLocationSelected(l.value, locationSelected))?.labelEs || locationSelected
    : LOCATION_OPTIONS.find((l) => isLocationSelected(l.value, locationSelected))?.labelEn?.replace("\n", " ") || locationSelected;

  const variantClass =
    variant === "mobile" ? " is-mobile" : variant === "desktop" ? " is-desktop" : "";

  return (
    <div id="slide-content" className={`s14-root${variantClass}`}>
      <style>{SLIDE14_CSS}</style>

      <div className="s14-main-stage">
        {/* 1. Main Heading */}
        <div className="s14-top-section">
          <h1
            ref={headingRef}
            tabIndex={-1}
            id="slide14-title"
            className="s14-heading"
          >
            {isSpanish
              ? "¿Su hijo recibió atención médica por su reacción?"
              : "Did your child receive medical care for their reaction?"}
          </h1>
        </div>

        {/* 2. Middle Content Area: Rounded Teal Card + Nurse Anna */}
        <div className="s14-middle">
        {/* Teal Rounded Container Card */}
        <div className="s14-card">
          <div
            role="radiogroup"
            aria-labelledby="slide14-title"
            className="s14-options-row"
          >
            {CARE_OPTIONS.map((opt, index) => {
              const isChecked = isCareSelected(opt.value, selected);
              const label = isSpanish ? opt.labelEs : opt.labelEn;

              return (
                <button
                  key={opt.value}
                  ref={(el) => {
                    buttonRefs.current[index] = el;
                  }}
                  type="button"
                  role="radio"
                  aria-checked={isChecked}
                  tabIndex={isChecked || (!selected && index === 0) ? 0 : -1}
                  onClick={() => handleMainOption(opt.value)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  className={`s14-option-btn${isChecked ? " s14-option-btn--selected" : ""}`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Selected Location Indicator (when Yes was chosen) */}
          {selected === "Yes" && locationSelected && (
            <div className="s14-location-badge">
              <span>
                <strong>{isSpanish ? "Lugar: " : "Location: "}</strong>
                {selectedLocLabel}
              </span>
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="s14-location-change-btn"
              >
                {isSpanish ? "Cambiar" : "Change"}
              </button>
            </div>
          )}

        </div>

        {/* Nurse Anna on the right */}
        <div className="s14-nurse-wrap" aria-hidden="true">
          <img
            src="/images/nurse-anna.png"
            alt=""
            className="s14-nurse-img"
          />
        </div>
      </div>
      </div>

      {/* 3. Bottom Controls: Audio above Back/Next on mobile; independent on desktop */}
      <div className="s14-bottom-bar">
        <div className="s14-audio">
          <AudioPlayer
            audioSrc={effectiveAudioSrc}
            stepId={stepId || "screen6_4_resolution"}
            locale={isEs ? "es" : "en"}
            transcriptText={effectiveTranscript}
            size="large"
          />
        </div>

        <SlideNavigationButtons
          onBack={handleBackClick}
          onNext={handleNextClick}
          isSpanish={isEs}
          loading={isLoading}
          nextDisabled={!isNextEnabled}
          variant="flow"
        />
      </div>

      {/* ==========================================================
          MODAL 15: Where did your child get medical care?
          ========================================================== */}
      {modalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-15-heading"
          className="s14-modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalOpen(false);
          }}
        >
          <div className="s14-modal-card">
            <h2
              id="modal-15-heading"
              ref={modalHeadingRef}
              tabIndex={-1}
              className="s14-modal-heading"
            >
              {isSpanish
                ? "¿Dónde recibió atención médica para la reacción?"
                : "Where did your child get medical care for the reaction?"}
            </h2>

            <div className="s14-modal-grid">
              {LOCATION_OPTIONS.map((loc) => {
                const isLocChecked = isLocationSelected(loc.value, locationSelected);
                const locLabel = isSpanish ? loc.labelEs : loc.labelEn;

                return (
                  <button
                    key={loc.value}
                    type="button"
                    onClick={() => {
                      onLocationSelect(loc.value);
                      setModalOpen(false);
                    }}
                    className={`s14-modal-btn${isLocChecked ? " s14-modal-btn--selected" : ""}`}
                  >
                    {locLabel}
                  </button>
                );
              })}
            </div>

            <div className="s14-modal-footer">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                aria-label={isSpanish ? "Cerrar" : "Close"}
                title={isSpanish ? "Cerrar" : "Close"}
                className="s14-modal-close-btn"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Slide14MedicalCareScreen;


