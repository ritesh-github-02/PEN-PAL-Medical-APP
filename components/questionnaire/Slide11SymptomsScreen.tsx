"use client";

import React, { useState, useRef, useEffect } from "react";
import AudioPlayer from "./AudioPlayer";
import { NurseAnna } from "./NurseAnna";
import { resolveMedicineToken } from "@/lib/token-engine";
import SlideNavigationButtons from "./SlideNavigationButtons";

/* ==========================================================
   Slide11SymptomsScreen – Scoped Pixel-Perfect Styles
   ========================================================== */

const SLIDE11_CSS = `
.s11-root,
.s11-root *,
.s11-root *::before,
.s11-root *::after {
  box-sizing: border-box;
}

.s11-root {
  position: relative;
  width: 100%;
  height: 100%;
  flex: 1 1 0%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #f4f8ec;
  padding: 0.85rem 1.8rem 4.5rem 1.8rem;
  overflow: hidden;
  gap: clamp(0.5rem, 1.8vh, 1rem);
}

/* Top Heading */
.s11-top-section {
  width: 100%;
  max-width: 790px;
  margin: 0 auto;
  padding: 0;
  flex-shrink: 0;
}
.s11-heading {
  font-size: clamp(1.05rem, 2vw, 1.25rem);
  line-height: 1.35;
  font-weight: 700;
  color: #142724;
  letter-spacing: -0.015em;
  margin: 0;
  outline: none;
}
.s11-heading:focus-visible {
  box-shadow: 0 0 0 2px #236f7a;
}

/* Middle Content: Sage Green Card (Left) + Nurse Anna (Right) */
.s11-middle {
  flex-shrink: 0;
  width: 100%;
  max-width: 790px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  padding: 0;
  margin: 0 auto;
}

/* Sage Green Container Card */
.s11-card {
  flex: 0 1 auto;
  width: 630px;
  max-width: 100%;
  background-color: #84aba0;
  border-radius: 20px;
  padding: 0.95rem 1.15rem;
  box-shadow: 0 4px 14px -3px rgba(20, 60, 55, 0.18);
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

/* Rows of symptom chips */
.s11-chip-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.6rem;
}

.s11-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  padding: 0.45rem 0.85rem;
  background-color: #ffffff;
  color: #142724;
  font-size: 0.88rem;
  font-weight: 600;
  border-radius: 9px;
  box-shadow: 0 1.5px 3.5px rgba(0, 0, 0, 0.12);
  border: 1.5px solid #236f7a;
  cursor: pointer;
  transition: all 0.15s ease;
  user-select: none;
  outline: none;
}

.s11-chip:hover {
  background-color: #f3f8f6;
  border-color: #1c5249;
  transform: translateY(-1px);
  box-shadow: 0 2.5px 5px rgba(0, 0, 0, 0.14);
}

.s11-chip:active {
  transform: scale(0.97);
}

.s11-chip:focus-visible {
  box-shadow: 0 0 0 3px rgba(31, 77, 69, 0.4);
}

/* Checked / Active Chip State: Yellowish background with greenish border (Figma / Images 2 & 3) */
.s11-chip--checked {
  background-color: #ffd41d !important;
  color: #142724 !important;
  border-color: #1c5249 !important;
  box-shadow: 0 2px 5px rgba(10, 40, 35, 0.2) !important;
}

.s11-chip--checked:hover {
  background-color: #f7ca12 !important;
  border-color: #143e37 !important;
}

.s11-chip-edit {
  font-size: 0.75rem;
  margin-left: 0.35rem;
  background: rgba(20, 39, 36, 0.12);
  color: #142724;
  border: 1px solid rgba(20, 39, 36, 0.25);
  border-radius: 4px;
  padding: 1px 5px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.s11-chip-edit:hover {
  background: rgba(20, 39, 36, 0.22);
}

/* Row 5: Other describe underline + Unsure chip */
.s11-row-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 0.25rem;
}

.s11-other-wrap {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  flex: 1;
}

.s11-other-label {
  font-size: 0.88rem;
  font-weight: 600;
  color: #142724;
  white-space: nowrap;
}

.s11-other-input {
  flex: 1;
  background: transparent;
  border: none;
  border-bottom: 2px solid #142724;
  outline: none;
  font-size: 0.88rem;
  font-weight: 500;
  color: #142724;
  padding: 2px 4px;
}

.s11-other-input:focus {
  border-bottom-color: #0b1f1c;
  background-color: rgba(255, 255, 255, 0.15);
  border-radius: 4px 4px 0 0;
}

/* ==========================================================
   Rash Pop-up (Figma 7-1-1) Pixel-Perfect Styles
   ========================================================== */
.s11-rash-dialog {
  background-color: #fffef2;
  border-radius: 24px;
  padding: 1.85rem 2rem 1.6rem 2rem;
  max-width: 480px;
  width: 100%;
  box-shadow: 0 16px 40px -8px rgba(20, 40, 35, 0.28);
  border: 1.5px solid #142724;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.s11-rash-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.s11-rash-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: #ffffff;
  color: #142724;
  font-size: 0.92rem;
  font-weight: 600;
  padding: 0.5rem 0.95rem;
  border-radius: 9px;
  border: 1.5px solid #236f7a;
  box-shadow: 0 1.5px 3.5px rgba(0, 0, 0, 0.12);
  cursor: pointer;
  transition: all 0.15s ease;
  user-select: none;
  outline: none;
  min-height: 40px;
}

.s11-rash-btn:hover {
  background-color: #f3f8f6;
  border-color: #1c5249;
  transform: translateY(-1px);
  box-shadow: 0 2.5px 5px rgba(0, 0, 0, 0.14);
}

.s11-rash-btn:active {
  transform: scale(0.97);
}

.s11-rash-btn:focus-visible {
  box-shadow: 0 0 0 3px rgba(31, 77, 69, 0.4);
}

.s11-rash-btn--checked {
  background-color: #ffd41d !important;
  color: #142724 !important;
  border-color: #1c5249 !important;
  box-shadow: 0 2px 5px rgba(10, 40, 35, 0.2) !important;
}

.s11-rash-btn--checked:hover {
  background-color: #f7ca12 !important;
  border-color: #143e37 !important;
}

/* ==========================================================
   Swelling Pop-up (Figma 7-1-2) Pixel-Perfect Styles
   ========================================================== */
.s11-swelling-dialog {
  background-color: #fffef2;
  border-radius: 24px;
  padding: 1.85rem 2rem 1.35rem 2rem;
  max-width: 440px;
  width: 100%;
  box-shadow: 0 16px 40px -8px rgba(20, 40, 35, 0.28);
  border: 1px solid #e5ded0;
  display: flex;
  flex-direction: column;
  gap: 0.95rem;
}

.s11-swelling-row {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.s11-swelling-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: #ffffff;
  color: #142724;
  font-size: 0.95rem;
  font-weight: 600;
  padding: 0.55rem 1.25rem;
  border-radius: 9px;
  border: 1.5px solid #236f7a;
  box-shadow: 0 1.5px 3.5px rgba(0, 0, 0, 0.12);
  cursor: pointer;
  transition: all 0.15s ease;
  user-select: none;
  outline: none;
  min-height: 42px;
}

.s11-swelling-btn:hover {
  background-color: #f3f8f6;
  border-color: #1c5249;
  transform: translateY(-1px);
  box-shadow: 0 2.5px 5px rgba(0, 0, 0, 0.14);
}

.s11-swelling-btn:active {
  transform: scale(0.97);
}

.s11-swelling-btn:focus-visible {
  box-shadow: 0 0 0 3px rgba(31, 77, 69, 0.4);
}

.s11-swelling-btn--checked {
  background-color: #ffd41d !important;
  color: #142724 !important;
  border-color: #1c5249 !important;
  box-shadow: 0 2px 5px rgba(10, 40, 35, 0.2) !important;
}

.s11-swelling-btn--checked:hover {
  background-color: #f7ca12 !important;
  border-color: #143e37 !important;
}

.s11-swelling-other {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.65rem;
  width: 100%;
}

.s11-swelling-other-label {
  font-size: 0.92rem;
  font-weight: 600;
  color: #142724;
  white-space: nowrap;
}

.s11-swelling-other-input {
  flex: 1;
  background: transparent;
  border: none;
  border-bottom: 2px solid #142724;
  outline: none;
  font-size: 0.92rem;
  font-weight: 500;
  color: #142724;
  padding: 2px 4px;
}

.s11-swelling-other-input:focus {
  border-bottom-color: #0b1f1c;
  background-color: rgba(0, 0, 0, 0.04);
}

.s11-swelling-footer {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
  margin-top: 0.5rem;
}

.s11-swelling-code {
  font-size: 0.72rem;
  color: #78716c;
  font-family: monospace;
}

.s11-swelling-close-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: 1px solid #d6d1c4;
  background-color: #ffffff;
  color: #4b5563;
  cursor: pointer;
  transition: all 0.15s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.s11-swelling-close-btn:hover {
  background-color: #f7f5ed;
  color: #111827;
  border-color: #a8a29e;
}

.s11-swelling-close-btn:active {
  transform: scale(0.92);
}

.s11-swelling-close-btn:focus-visible {
  box-shadow: 0 0 0 2px #236f7a;
}

/* Right Section: Nurse Anna */
.s11-right {
  flex-shrink: 0;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.s11-nurse {
  width: 105px;
  height: auto;
  max-height: 220px;
}

.s11-nurse-img {
  width: 100%;
  height: auto;
  max-height: 220px;
  object-fit: contain;
  display: block;
}

/* Tablet & Smaller Screens Scaling */
@media (max-height: 650px), (max-width: 820px) {
  .s11-root {
    padding: 0.85rem 1.25rem 1rem 1.25rem;
  }
  .s11-top-section,
  .s11-middle {
    max-width: 620px;
    gap: 1.25rem;
  }
  .s11-card {
    max-width: 490px;
    padding: 1rem 1.2rem;
    gap: 0.55rem;
  }
  .s11-chip {
    padding: 0.35rem 0.65rem;
    font-size: 0.8rem;
  }
  .s11-other-label, .s11-other-input {
    font-size: 0.8rem;
  }
  .s11-nurse {
    width: 95px;
    max-height: 215px;
  }
  .s11-nurse-img {
    max-height: 215px;
  }
}

/* ==========================================================
   Mobile-First Enhanced Responsive Layout (<= 640px)
   ========================================================== */
@media (max-width: 767px) {
  .s11-root {
    overflow: hidden !important;
    height: 100% !important;
    max-height: 100% !important;
    min-height: 0 !important;
    flex: 1 1 0% !important;
    display: flex !important;
    flex-direction: column !important;
    justify-content: space-between !important;
    align-items: center !important;
    padding: 0.45rem 0.65rem !important;
    gap: 0.25rem !important;
  }

  .s11-top-section {
    padding: 0 !important;
    margin: 0 !important;
  }

  .s11-heading {
    font-size: clamp(12px, 1.8vh, 13.5px) !important;
    line-height: 1.3 !important;
    text-align: left !important;
  }

  .s11-middle {
    flex-direction: column !important;
    align-items: center !important;
    justify-content: space-between !important;
    flex: 1 1 0% !important;
    min-height: 0 !important;
    gap: 0.35rem !important;
    width: 100% !important;
  }

  .s11-card {
    max-width: 100% !important;
    width: 100% !important;
    padding: 0.55rem 0.75rem !important;
    border-radius: 14px !important;
    gap: 0.35rem !important;
  }

  .s11-chip-row {
    gap: 0.35rem !important;
  }

  .s11-chip {
    padding: 0.28rem 0.55rem !important;
    font-size: clamp(10px, 1.4vh, 11px) !important;
    line-height: 1.2 !important;
    border-radius: 7px !important;
    white-space: normal !important;
    text-align: left !important;
    word-break: break-word !important;
    max-width: 100% !important;
  }

  /* Row 5: Stack Other describe input and Unsure chip */
  .s11-row-bottom {
    flex-direction: row !important;
    align-items: center !important;
    justify-content: space-between !important;
    gap: 0.45rem !important;
    margin-top: 0.15rem !important;
    padding-top: 0.15rem !important;
    border-top: 1px solid rgba(255, 255, 255, 0.18) !important;
  }

  .s11-other-wrap {
    flex: 1 1 auto !important;
    display: flex !important;
    align-items: center !important;
    gap: 0.35rem !important;
  }

  .s11-other-label {
    font-size: clamp(9.5px, 1.3vh, 10.5px) !important;
    white-space: nowrap !important;
  }

  .s11-other-input {
    width: 100% !important;
    min-width: 0 !important;
    font-size: clamp(10px, 1.35vh, 11px) !important;
    padding: 1px 3px !important;
  }

  .s11-row-bottom .s11-chip {
    align-self: center !important;
    flex-shrink: 0 !important;
  }

  /* Nurse Anna sizing on mobile */
  .s11-right {
    margin: 0 auto !important;
    display: flex !important;
    justify-content: center !important;
    align-items: flex-end !important;
    flex-shrink: 0 !important;
  }

  .s11-nurse {
    width: auto !important;
    height: clamp(60px, 9.5vh, 75px) !important;
    max-height: 75px !important;
    display: flex !important;
    align-items: flex-end !important;
    justify-content: center !important;
  }

  .s11-nurse-img {
    height: 100% !important;
    max-height: clamp(60px, 9.5vh, 75px) !important;
    width: auto !important;
    object-fit: contain !important;
  }

  .s11-audio {
    display: flex !important;
    justify-content: center !important;
    margin: 2px auto 0 auto !important;
    z-index: 25 !important;
  }

  .s11-root .slide-nav {
    margin: 4px auto 0 auto !important;
  }

  /* Modal 11B (Rash) Mobile Overrides */
  .s11-rash-dialog {
    padding: 1.25rem 1rem 1rem 1rem;
    border-radius: 20px;
    max-width: 92vw;
    max-height: 88vh;
    overflow-y: auto;
    gap: 0.65rem;
  }

  .s11-rash-row {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }

  .s11-rash-btn {
    width: 100%;
    text-align: center;
    padding: 0.55rem 0.85rem;
    font-size: 0.88rem;
    min-height: 40px;
  }

  /* Modal 11C (Swelling) Mobile Overrides */
  .s11-swelling-dialog {
    padding: 1.25rem 1rem 1rem 1rem;
    border-radius: 20px;
    max-width: 92vw;
    max-height: 88vh;
    overflow-y: auto;
    gap: 0.75rem;
  }

  .s11-swelling-row {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }

  .s11-swelling-btn {
    width: 100%;
    text-align: center;
    padding: 0.55rem 0.85rem;
    font-size: 0.88rem;
    min-height: 42px;
  }

  .s11-swelling-other {
    flex-direction: column;
    align-items: stretch;
    gap: 0.35rem;
    margin-top: 0.4rem;
  }

  .s11-swelling-other-input {
    width: 100%;
  }
}

.s11-audio {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 10px auto 0 auto;
  z-index: 25;
}
.s11-root .slide-nav {
  margin: 10px auto 0.25rem auto !important;
}
`;

export interface Slide11SymptomsScreenProps {
  isSpanish: boolean;
  medicationName?: string;
  selectedSymptoms?: string[];
  symptomsOther?: string;
  rashDetails?: string[];
  swellingDetails?: string[];
  onSelectSymptoms: (symptoms: string[]) => void;
  onSymptomsOtherChange?: (val: string) => void;
  onRashDetailsChange?: (details: string[]) => void;
  onSwellingDetailsChange?: (details: string[]) => void;
  onNext: () => void;
  onBack: () => void;
  loading?: boolean;
  audioSrc?: string;
  transcriptText?: string;
  stepId?: string;
  locale?: string;
}

interface SymptomItem {
  value: string;
  labelEn: string;
  labelEs: string;
}

const ROW_1: SymptomItem[] = [
  { value: "Rash", labelEn: "Rash", labelEs: "Sarpullido" },
  { value: "Swelling", labelEn: "Swelling", labelEs: "Inflamación" },
  { value: "Fainting or dizziness", labelEn: "Fainting or dizziness", labelEs: "Desmayos o mareos" },
  { value: "Itchiness", labelEn: "Itchiness", labelEs: "Picazón" },
];

const ROW_2: SymptomItem[] = [
  { value: "Throat tightness", labelEn: "Throat tightness", labelEs: "Opresión en la garganta" },
  { value: "Shortness of breath", labelEn: "Shortness of breath or hard time breathing", labelEs: "Dificultad para respirar" },
];

const ROW_3: SymptomItem[] = [
  { value: "Fever", labelEn: "Fever (new fever or worse fever)", labelEs: "Fiebre (nueva o peor)" },
  { value: "Belly pain", labelEn: "Belly pain", labelEs: "Dolor abdominal" },
  { value: "Diarrhea", labelEn: "Diarrhea", labelEs: "Diarrea" },
];

const ROW_4: SymptomItem[] = [
  { value: "Joint pain", labelEn: "Joint pain", labelEs: "Dolor articular" },
  { value: "Vomiting", labelEn: "Wanted to throw up or threw up", labelEs: "Ganas de vomitar o vomitó" },
  { value: "Muscle aches", labelEn: "Muscle aches", labelEs: "Dolores musculares" },
];

const RASH_SUBTYPE_OPTIONS: SymptomItem[] = [
  { value: "Hives", labelEn: "Hives", labelEs: "Ronchas (Urticaria)" },
  { value: "Blisters", labelEn: "Blisters", labelEs: "Ampollas" },
  { value: "Red, fine or bumpy rash", labelEn: "Red, fine or bumpy rash", labelEs: "Sarpullido rojo, fino o con protuberancias" },
  { value: "Flushing", labelEn: "Flushing", labelEs: "Enrojecimiento" },
  { value: "Pus-filled pimples", labelEn: "Pus-filled pimples", labelEs: "Granos con pus" },
  { value: "Unsure", labelEn: "Unsure/I don't know", labelEs: "No estoy seguro" },
];

const SWELLING_SUBTYPE_OPTIONS: SymptomItem[] = [
  { value: "Face swelling", labelEn: "Face swelling", labelEs: "Inflamación de la cara" },
  { value: "Throat swelling", labelEn: "Throat swelling", labelEs: "Inflamación de la garganta" },
  { value: "Lip swelling", labelEn: "Lip swelling", labelEs: "Inflamación de los labios" },
  { value: "Tongue swelling", labelEn: "Tongue swelling", labelEs: "Inflamación de la lengua" },
  { value: "Unsure", labelEn: "Unsure/I don't know", labelEs: "No estoy seguro/No lo sé" },
];

export function Slide11SymptomsScreen({
  isSpanish,
  medicationName,
  selectedSymptoms = [],
  symptomsOther = "",
  rashDetails = [],
  swellingDetails = [],
  onSelectSymptoms,
  onSymptomsOtherChange,
  onRashDetailsChange,
  onSwellingDetailsChange,
  onNext,
  onBack,
  loading = false,
  audioSrc,
  transcriptText,
  stepId = "screen6_1_symptoms",
  locale,
}: Slide11SymptomsScreenProps) {
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const rashFirstBtnRef = useRef<HTMLButtonElement | null>(null);
  const modalTriggerRef = useRef<HTMLElement | null>(null);

  const effectiveAudioSrc =
    audioSrc ||
    (isSpanish
      ? "/audio/exported/screen6_1_symptoms_es.mp3"
      : "/audio/exported/screen6_1_symptoms_en.mp3");

  const effectiveTranscript =
    transcriptText ||
    (isSpanish
      ? "Seleccione lo que sucedió cuando se le dijo que su hijo era alérgico a la penicilina."
      : "Select what happened when your child was said to be allergic to penicillin.");

  const swellingTriggerRef = useRef<HTMLElement | null>(null);
  const swellingFirstBtnRef = useRef<HTMLButtonElement | null>(null);

  const [symptoms, setSymptoms] = useState<string[]>(selectedSymptoms);
  const [otherText, setOtherText] = useState<string>(symptomsOther);

  const [rashModalOpen, setRashModalOpen] = useState(false);
  const [activeRashDetails, setActiveRashDetails] = useState<string[]>(rashDetails);

  const [swellingModalOpen, setSwellingModalOpen] = useState(false);
  const [activeSwellingDetails, setActiveSwellingDetails] = useState<string[]>(swellingDetails);
  const [swellingOtherText, setSwellingOtherText] = useState<string>(() => {
    const found = (swellingDetails || []).find((d) => d.startsWith("Other:"));
    return found ? found.replace(/^Other:\s*/, "") : "";
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      headingRef.current?.focus();
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  // Trap focus & escape key for Modal 11B (Rash)
  useEffect(() => {
    if (!rashModalOpen) return;
    const timer = setTimeout(() => {
      rashFirstBtnRef.current?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setRashModalOpen(false);
        modalTriggerRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [rashModalOpen]);

  // Trap focus & escape key for Modal 11C (Swelling)
  useEffect(() => {
    if (!swellingModalOpen) return;
    const timer = setTimeout(() => {
      swellingFirstBtnRef.current?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSwellingModalOpen(false);
        swellingTriggerRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [swellingModalOpen]);

  const toggleSymptom = (val: string, e?: React.MouseEvent<HTMLElement>) => {
    let updated: string[];
    if (val === "Unsure") {
      updated = symptoms.includes("Unsure") ? [] : ["Unsure"];
    } else {
      const withoutUnsure = symptoms.filter((s) => s !== "Unsure");
      if (withoutUnsure.includes(val)) {
        updated = withoutUnsure.filter((s) => s !== val);
      } else {
        updated = [...withoutUnsure, val];
      }
    }
    setSymptoms(updated);
    onSelectSymptoms(updated);

    // If selecting Rash for the first time, automatically pop Modal 11B
    if (val === "Rash" && !symptoms.includes("Rash")) {
      if (e) modalTriggerRef.current = e.currentTarget;
      setTimeout(() => setRashModalOpen(true), 150);
    }

    // If selecting Swelling for the first time, automatically pop Modal 11C (Swelling details)
    if (val === "Swelling" && !symptoms.includes("Swelling")) {
      if (e) swellingTriggerRef.current = e.currentTarget;
      setTimeout(() => setSwellingModalOpen(true), 150);
    }
  };

  const handleOtherChange = (text: string) => {
    setOtherText(text);
    if (onSymptomsOtherChange) onSymptomsOtherChange(text);

    let updated = [...symptoms];
    if (text.trim() && !updated.includes("Other")) {
      updated = [...updated.filter((s) => s !== "Unsure"), "Other"];
      setSymptoms(updated);
      onSelectSymptoms(updated);
    } else if (!text.trim() && updated.includes("Other")) {
      updated = updated.filter((s) => s !== "Other");
      setSymptoms(updated);
      onSelectSymptoms(updated);
    }
  };

  const toggleRashDetail = (val: string) => {
    let updated: string[];
    if (val === "Unsure") {
      updated = activeRashDetails.includes("Unsure") ? [] : ["Unsure"];
    } else {
      const withoutUnsure = activeRashDetails.filter((s) => s !== "Unsure");
      if (withoutUnsure.includes(val)) {
        updated = withoutUnsure.filter((s) => s !== val);
      } else {
        updated = [...withoutUnsure, val];
      }
    }
    setActiveRashDetails(updated);
    if (onRashDetailsChange) {
      onRashDetailsChange(updated);
    }
  };

  const toggleSwellingDetail = (val: string) => {
    let updated: string[];
    if (val === "Unsure") {
      updated = activeSwellingDetails.includes("Unsure") ? [] : ["Unsure"];
      setSwellingOtherText("");
    } else {
      const withoutUnsure = activeSwellingDetails.filter((s) => s !== "Unsure");
      if (withoutUnsure.includes(val)) {
        updated = withoutUnsure.filter((s) => s !== val);
      } else {
        updated = [...withoutUnsure, val];
      }
    }
    setActiveSwellingDetails(updated);
    if (onSwellingDetailsChange) {
      onSwellingDetailsChange(updated);
    }
  };

  const handleSwellingOtherChange = (text: string) => {
    setSwellingOtherText(text);
    const withoutOther = activeSwellingDetails.filter(
      (d) => !d.startsWith("Other:") && d !== "Unsure"
    );
    const next = text.trim() ? [...withoutOther, `Other: ${text.trim()}`] : withoutOther;
    setActiveSwellingDetails(next);
    if (onSwellingDetailsChange) {
      onSwellingDetailsChange(next);
    }
  };

  const rawTitle = isSpanish
    ? "Seleccione lo que sucedió cuando se le dijo que su hijo era alérgico a [name]."
    : "Select what happened when your child was said to be allergic to [name].";

  const titleText = resolveMedicineToken(rawTitle, medicationName, isSpanish);

  const isNextEnabled = symptoms.length > 0 || otherText.trim().length > 0;

  const renderChip = (item: SymptomItem) => {
    const isChecked = symptoms.includes(item.value);
    const label = isSpanish ? item.labelEs : item.labelEn;

    return (
      <button
        key={item.value}
        type="button"
        role="checkbox"
        aria-checked={isChecked}
        onClick={(e) => toggleSymptom(item.value, e)}
        className={`s11-chip${isChecked ? " s11-chip--checked" : ""}`}
      >
        <span>{label}</span>
        {item.value === "Rash" && isChecked && activeRashDetails.length > 0 && (
          <span
            onClick={(e) => {
              e.stopPropagation();
              modalTriggerRef.current = e.currentTarget;
              setRashModalOpen(true);
            }}
            className="s11-chip-edit"
            title={isSpanish ? "Editar tipo de sarpullido" : "Edit rash details"}
            aria-label={isSpanish ? "Editar tipo de sarpullido" : "Edit rash details"}
          >
            ✎
          </span>
        )}
        {item.value === "Swelling" && isChecked && activeSwellingDetails.length > 0 && (
          <span
            onClick={(e) => {
              e.stopPropagation();
              swellingTriggerRef.current = e.currentTarget;
              setSwellingModalOpen(true);
            }}
            className="s11-chip-edit"
            title={isSpanish ? "Editar tipo de inflamación" : "Edit swelling details"}
            aria-label={isSpanish ? "Editar tipo de inflamación" : "Edit swelling details"}
          >
            ✎
          </span>
        )}
      </button>
    );
  };

  return (
    <div id="slide-content" className="s11-root">
      <style dangerouslySetInnerHTML={{ __html: SLIDE11_CSS }} />

      {/* 1. Main Heading */}
      <div className="s11-top-section">
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="s11-heading"
        >
          {titleText}
        </h1>
      </div>

      {/* 2. Middle Content: Sage Green Card + Nurse Anna */}
      <div className="s11-middle">
        {/* Sage Green Card Container */}
        <div className="s11-card" role="group" aria-label={titleText}>
          {/* Row 1 */}
          <div className="s11-chip-row">
            {ROW_1.map(renderChip)}
          </div>

          {/* Row 2 */}
          <div className="s11-chip-row">
            {ROW_2.map(renderChip)}
          </div>

          {/* Row 3 */}
          <div className="s11-chip-row">
            {ROW_3.map(renderChip)}
          </div>

          {/* Row 4 */}
          <div className="s11-chip-row">
            {ROW_4.map(renderChip)}
          </div>

          {/* Row 5: Other Input + Unsure Chip */}
          <div className="s11-row-bottom">
            <div className="s11-other-wrap">
              <label htmlFor="symptoms-other-input" className="s11-other-label">
                {isSpanish ? "Otro: Describa" : "Other: Please describe"}
              </label>
              <input
                id="symptoms-other-input"
                type="text"
                value={otherText}
                onChange={(e) => handleOtherChange(e.target.value)}
                className="s11-other-input"
                aria-label={isSpanish ? "Otro síntoma, por favor describa" : "Other symptom, please describe"}
              />
            </div>

            {/* Unsure/I don't know */}
            <button
              type="button"
              role="checkbox"
              aria-checked={symptoms.includes("Unsure")}
              onClick={(e) => toggleSymptom("Unsure", e)}
              className={`s11-chip${symptoms.includes("Unsure") ? " s11-chip--checked" : ""}`}
            >
              <span>{isSpanish ? "No estoy seguro/ No lo sé" : "Unsure/I don't know"}</span>
            </button>
          </div>
        </div>

        {/* Nurse Anna on Right */}
        <div className="s11-right">
          <div className="s11-nurse">
            <NurseAnna
              size="md"
              imgClassName="s11-nurse-img"
              isDecorative={true}
              locale={isSpanish ? "es" : "en"}
            />
          </div>
        </div>
      </div>

      {/* Audio narration & CC controls (mobile: centered above Back & Next) */}
      <div className="s11-audio md:hidden">
        <AudioPlayer
          audioSrc={effectiveAudioSrc}
          stepId={stepId || "screen6_1_symptoms"}
          locale={locale || (isSpanish ? "es" : "en")}
          transcriptText={effectiveTranscript}
        />
      </div>

      {/* 3. Bottom Centered Navigation Buttons (Back & Next) */}
      <SlideNavigationButtons
        onBack={onBack}
        onNext={onNext}
        isSpanish={isSpanish}
        loading={loading}
        nextDisabled={!isNextEnabled || loading}
        variant="flow"
      />

      {/* ========================================================================= */}
      {/* MODAL 11B (Figma 7-1-1): Rash Sub-types Branching Modal */}
      {/* ========================================================================= */}
      {rashModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={isSpanish ? "Detalles del sarpullido" : "Rash details"}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-[2px]"
          onClick={() => {
            setRashModalOpen(false);
            modalTriggerRef.current?.focus();
          }}
        >
          <div
            className="s11-rash-dialog animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Row 1: Hives, Blisters, Red, fine or bumpy rash */}
            <div className="s11-rash-row">
              <button
                ref={rashFirstBtnRef}
                type="button"
                role="checkbox"
                aria-checked={activeRashDetails.includes("Hives")}
                onClick={() => toggleRashDetail("Hives")}
                className={`s11-rash-btn${activeRashDetails.includes("Hives") ? " s11-rash-btn--checked" : ""}`}
              >
                {isSpanish ? "Ronchas (Urticaria)" : "Hives"}
              </button>
              <button
                type="button"
                role="checkbox"
                aria-checked={activeRashDetails.includes("Blisters")}
                onClick={() => toggleRashDetail("Blisters")}
                className={`s11-rash-btn${activeRashDetails.includes("Blisters") ? " s11-rash-btn--checked" : ""}`}
              >
                {isSpanish ? "Ampollas" : "Blisters"}
              </button>
              <button
                type="button"
                role="checkbox"
                aria-checked={activeRashDetails.includes("Red, fine or bumpy rash")}
                onClick={() => toggleRashDetail("Red, fine or bumpy rash")}
                className={`s11-rash-btn${activeRashDetails.includes("Red, fine or bumpy rash") ? " s11-rash-btn--checked" : ""}`}
              >
                {isSpanish ? "Sarpullido rojo, fino o con protuberancias" : "Red, fine or bumpy rash"}
              </button>
            </div>

            {/* Row 2: Flushing, Pus-filled pimples */}
            <div className="s11-rash-row">
              <button
                type="button"
                role="checkbox"
                aria-checked={activeRashDetails.includes("Flushing")}
                onClick={() => toggleRashDetail("Flushing")}
                className={`s11-rash-btn${activeRashDetails.includes("Flushing") ? " s11-rash-btn--checked" : ""}`}
              >
                {isSpanish ? "Enrojecimiento" : "Flushing"}
              </button>
              <button
                type="button"
                role="checkbox"
                aria-checked={activeRashDetails.includes("Pus-filled pimples")}
                onClick={() => toggleRashDetail("Pus-filled pimples")}
                className={`s11-rash-btn${activeRashDetails.includes("Pus-filled pimples") ? " s11-rash-btn--checked" : ""}`}
              >
                {isSpanish ? "Granos con pus" : "Pus-filled pimples"}
              </button>
            </div>

            {/* Row 3: Unsure/I don't know */}
            <div className="s11-rash-row">
              <button
                type="button"
                role="checkbox"
                aria-checked={activeRashDetails.includes("Unsure")}
                onClick={() => toggleRashDetail("Unsure")}
                className={`s11-rash-btn${activeRashDetails.includes("Unsure") ? " s11-rash-btn--checked" : ""}`}
              >
                {isSpanish ? "No estoy seguro" : "Unsure/I don't know"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 11C (Figma 7-1-2): Swelling Sub-types Modal */}
      {/* ========================================================================= */}
      {swellingModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={isSpanish ? "Detalles de inflamación" : "Swelling details"}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-[2px]"
          onClick={() => {
            setSwellingModalOpen(false);
            swellingTriggerRef.current?.focus();
          }}
        >
          <div
            className="s11-swelling-dialog animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Row 1: Face swelling & Throat swelling */}
            <div className="s11-swelling-row">
              <button
                ref={swellingFirstBtnRef}
                type="button"
                role="checkbox"
                aria-checked={activeSwellingDetails.includes("Face swelling")}
                onClick={() => toggleSwellingDetail("Face swelling")}
                className={`s11-swelling-btn${activeSwellingDetails.includes("Face swelling") ? " s11-swelling-btn--checked" : ""}`}
              >
                {isSpanish ? "Inflamación de la cara" : "Face swelling"}
              </button>
              <button
                type="button"
                role="checkbox"
                aria-checked={activeSwellingDetails.includes("Throat swelling")}
                onClick={() => toggleSwellingDetail("Throat swelling")}
                className={`s11-swelling-btn${activeSwellingDetails.includes("Throat swelling") ? " s11-swelling-btn--checked" : ""}`}
              >
                {isSpanish ? "Inflamación de la garganta" : "Throat swelling"}
              </button>
            </div>

            {/* Row 2: Lip swelling & Tongue swelling */}
            <div className="s11-swelling-row">
              <button
                type="button"
                role="checkbox"
                aria-checked={activeSwellingDetails.includes("Lip swelling")}
                onClick={() => toggleSwellingDetail("Lip swelling")}
                className={`s11-swelling-btn${activeSwellingDetails.includes("Lip swelling") ? " s11-swelling-btn--checked" : ""}`}
              >
                {isSpanish ? "Inflamación de los labios" : "Lip swelling"}
              </button>
              <button
                type="button"
                role="checkbox"
                aria-checked={activeSwellingDetails.includes("Tongue swelling")}
                onClick={() => toggleSwellingDetail("Tongue swelling")}
                className={`s11-swelling-btn${activeSwellingDetails.includes("Tongue swelling") ? " s11-swelling-btn--checked" : ""}`}
              >
                {isSpanish ? "Inflamación de la lengua" : "Tongue swelling"}
              </button>
            </div>

            {/* Row 3: Unsure/I don't know */}
            <div className="s11-swelling-row">
              <button
                type="button"
                role="checkbox"
                aria-checked={activeSwellingDetails.includes("Unsure")}
                onClick={() => toggleSwellingDetail("Unsure")}
                className={`s11-swelling-btn${activeSwellingDetails.includes("Unsure") ? " s11-swelling-btn--checked" : ""}`}
              >
                {isSpanish ? "No estoy seguro/No lo sé" : "Unsure/I don't know"}
              </button>
            </div>

            {/* Other: Please describe */}
            <div className="s11-swelling-other">
              <label htmlFor="swelling-other-input" className="s11-swelling-other-label">
                {isSpanish ? "Otro: Describa" : "Other: Please describe"}
              </label>
              <input
                id="swelling-other-input"
                type="text"
                value={swellingOtherText}
                onChange={(e) => handleSwellingOtherChange(e.target.value)}
                className="s11-swelling-other-input"
                aria-label={isSpanish ? "Otro tipo de inflamación, por favor describa" : "Other swelling, please describe"}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Slide11SymptomsScreen;