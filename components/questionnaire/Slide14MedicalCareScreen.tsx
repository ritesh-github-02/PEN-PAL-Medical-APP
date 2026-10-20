"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import SlideNavigationButtons from "./SlideNavigationButtons";

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
  {
    value: "Emergency room (ER)",
    labelEn: "Emergency room\n(ER)",
    labelEs: "Sala de emergencias\n(ER)",
  },
  {
    value: "Urgent care",
    labelEn: "Urgent care",
    labelEs: "Centro de urgencias",
  },
  {
    value: "Primary care doctor",
    labelEn: "Primary care doctor",
    labelEs: "Médico de atención primaria",
  },
  {
    value: "Hospital",
    labelEn: "Hospital",
    labelEs: "Hospital",
  },
  {
    value: "Phone call with doctor",
    labelEn: "Phone call with doctor",
    labelEs: "Llamada con el médico",
  },
  {
    value: "Unsure",
    labelEn: "Unsure/I don't know",
    labelEs: "No estoy seguro",
  },
];

function isCareSelected(optValue: string, currentSelected?: string): boolean {
  if (!currentSelected) return false;
  if (currentSelected === optValue) return true;
  if (
    optValue === "Unsure" &&
    (currentSelected.toLowerCase().includes("unsure") ||
      currentSelected.toLowerCase().includes("know") ||
      currentSelected.toLowerCase().includes("seguro"))
  ) {
    return true;
  }
  return false;
}

function isLocationSelected(optValue: string, currentLocation?: string): boolean {
  if (!currentLocation) return false;
  if (currentLocation === optValue) return true;
  if (
    optValue === "Unsure" &&
    (currentLocation.toLowerCase().includes("unsure") ||
      currentLocation.toLowerCase().includes("know") ||
      currentLocation.toLowerCase().includes("seguro"))
  ) {
    return true;
  }
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
  initialModalOpen?: boolean;
  navProps?: {
    onNext: (explicitAnswer?: any) => void;
    onBack: () => void;
    loading?: boolean;
    headingRef?: React.RefObject<HTMLHeadingElement | null>;
  };
}

const SLIDE14_CSS = `
/* ==========================================================
   Slide 14: Medical Care Screen
   WCAG 2.1 / 2.2 Level AAA Compliant Design
   ========================================================== */

.s14-sr-only {
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  padding: 0 !important;
  margin: -1px !important;
  overflow: hidden !important;
  clip: rect(0, 0, 0, 0) !important;
  white-space: nowrap !important;
  border: 0 !important;
}

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
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  background-color: #fafdf3;
  padding: clamp(14px, 2.2vh, 24px) clamp(16px, 3.5vw, 40px) 4rem clamp(16px, 3.5vw, 40px);
  overflow-y: auto;
  overflow-x: hidden;
  font-family: "Plus Jakarta Sans", "Inter", system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
  color: #142724;
}

/* Heading */
.s14-top-section {
  width: 100%;
  max-width: 760px;
  text-align: center;
  margin: 0 auto;
  padding: 0;
  flex-shrink: 0;
}

.s14-heading {
  font-size: clamp(1.15rem, 2.2vw, 1.45rem);
  line-height: 1.35;
  font-weight: 700;
  color: #142724;
  letter-spacing: -0.015em;
  margin: 0;
  outline: none;
}
.s14-heading:focus,
.s14-heading:focus-visible {
  outline: none !important;
}

/* Middle Section: Teal Card + Nurse Anna */
.s14-middle {
  flex: 1 1 auto;
  width: 100%;
  max-width: 780px;
  margin: auto 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: clamp(1rem, 3vw, 2rem);
  padding: 0.5rem 0;
}

/* Main Rounded Teal Card Container */
.s14-card {
  background-color: #8cb2a7;
  border: 2px solid #638d82;
  border-radius: 24px;
  padding: clamp(1.2rem, 2.5vw, 2rem);
  box-shadow: 0 8px 24px rgba(20, 55, 50, 0.14);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  max-width: 520px;
  width: 100%;
  transition: all 0.2s ease;
}

/* Options Row */
.s14-options-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  width: 100%;
  flex-wrap: wrap;
}

/* White Option Buttons inside Teal Card (WCAG AAA Contrast > 14:1) */
.s14-option-btn {
  flex: 1 1 0%;
  min-height: 48px;
  min-width: 80px;
  padding: 0.55rem 0.75rem;
  border-radius: 10px;
  background-color: #ffffff;
  border: 2px solid #1c5249;
  color: #142724;
  font-family: inherit;
  font-size: 0.88rem;
  font-weight: 700;
  line-height: 1.2;
  text-align: center;
  white-space: normal;
  box-sizing: border-box;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.15s ease;
  outline: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  touch-action: manipulation;
  word-wrap: break-word;
  overflow: hidden;
}

.s14-option-btn:hover {
  background-color: #f2f8f6;
  border-color: #143833;
  transform: translateY(-1.5px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.14);
}

.s14-option-btn:active {
  transform: scale(0.97);
}

.s14-option-btn:focus-visible {
  outline: 3px solid #143833 !important;
  outline-offset: 3px !important;
}

/* Selected Button State: High contrast Yellow badge with dark text */
.s14-option-btn--selected {
  background-color: #ffd41d !important;
  border: 2.5px solid #143833 !important;
  color: #142724 !important;
  box-shadow: 0 4px 12px rgba(10, 40, 35, 0.25) !important;
}

.s14-option-btn--selected:hover {
  background-color: #f5c80a !important;
}

/* Location Badge inside Card (when Yes is chosen) */
.s14-location-badge {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #ffffff;
  border: 2px solid #143833;
  border-radius: 12px;
  padding: 0.5rem 0.7rem;
  margin-top: 0.7rem;
  font-size: 0.82rem;
  color: #142724;
  width: 100%;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  gap: 0.4rem;
  flex-wrap: wrap;
}

.s14-location-badge-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.2;
  flex: 1;
}

.s14-location-change-btn {
  background: #e6f4f1;
  border: 1.5px solid #143833;
  border-radius: 8px;
  color: #143833;
  font-family: inherit;
  font-weight: 700;
  cursor: pointer;
  padding: 0.35rem 0.75rem;
  font-size: 0.82rem;
  flex-shrink: 0;
  min-height: 36px;
  transition: all 0.15s ease;
}
.s14-location-change-btn:hover {
  background: #bddfd8;
}
.s14-location-change-btn:focus-visible {
  outline: 3px solid #143833 !important;
  outline-offset: 2px !important;
}

/* Nurse Anna Wrapper (WCAG Decorative Slide 2+) */
.s14-nurse-wrap {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  flex-shrink: 0;
  user-select: none;
}

.s14-nurse-img {
  height: clamp(180px, 26vh, 230px);
  width: auto;
  object-fit: contain;
  display: block;
  filter: drop-shadow(0 4px 10px rgba(20, 50, 45, 0.12));
}

/* ==========================================================
   UNIFIED BOTTOM TOOLBAR (44px+ touch targets, AAA contrast)
   ========================================================== */
.s14-footer {
  width: 100%;
  max-width: 896px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 10px;
  flex-shrink: 0;
  position: relative;
  z-index: 10;
}

.s14-spacer-side {
  width: 110px;
  flex-shrink: 0;
  display: flex;
  justify-content: flex-end;
}

.s14-nav-center {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.s14-btn {
  height: 44px;
  min-width: 82px;
  padding: 0 24px;
  border-radius: 9999px;
  font-family: inherit;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  border: 1.5px solid transparent;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
  user-select: none;
  touch-action: manipulation;
  outline: none;
}

.s14-btn:focus-visible {
  outline: 3px solid #143833 !important;
  outline-offset: 3px !important;
}

.s14-btn--back {
  background-color: #bddfd8;
  border-color: #78a59b;
  color: #143833;
}
.s14-btn--back:hover:not(:disabled) {
  background-color: #a8d5cc;
}
.s14-btn--back:active:not(:disabled) {
  transform: scale(0.96);
}

.s14-btn--next {
  background-color: #ffd41d;
  border-color: #d4a900;
  color: #142724;
}
.s14-btn--next:hover:not(:disabled) {
  background-color: #f0c30a;
}
.s14-btn--next:active:not(:disabled) {
  transform: scale(0.96);
}

.s14-btn--disabled,
.s14-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

/* Audio narration & CC controls */
.s14-audio-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.s14-audio-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.15s ease;
  outline: none;
  min-width: 40px;
  min-height: 40px;
  flex-shrink: 0;
}
.s14-audio-btn:hover {
  transform: scale(1.05);
}
.s14-audio-btn:active {
  transform: scale(0.95);
}
.s14-audio-btn:focus-visible {
  outline: 3px solid #143833 !important;
  outline-offset: 3px !important;
}

/* Closed Captions Drawer */
.s14-captions-drawer {
  position: absolute;
  bottom: 60px;
  right: 0;
  width: 100%;
  max-width: 420px;
  background: #ffffff;
  border: 2px solid #143833;
  border-radius: 14px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  padding: 14px 16px;
  z-index: 50;
  animation: s14CaptionsIn 0.2s ease-out;
}

@keyframes s14CaptionsIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.s14-captions-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  border-bottom: 1px solid #d8e5e2;
  padding-bottom: 6px;
}

.s14-captions-title {
  font-size: 13px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #143833;
  margin: 0;
}

.s14-captions-close {
  background: transparent;
  border: none;
  color: #143833;
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
}
.s14-captions-close:hover {
  background: #e6f4f1;
}
.s14-captions-close:focus-visible {
  outline: 2px solid #143833;
}

.s14-captions-text {
  font-size: 14px;
  line-height: 1.45;
  color: #142724;
  margin: 0;
  font-weight: 500;
}

/* ==========================================================
   MODAL 15: Where did your child get medical care? (WCAG AAA)
   ========================================================== */
.s14-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background-color: rgba(14, 39, 36, 0.6);
  backdrop-filter: blur(3px);
  animation: s14OverlayFade 0.18s ease-out;
}

@keyframes s14OverlayFade {
  from { opacity: 0; }
  to { opacity: 1; }
}

.s14-modal-card {
  background-color: #fafdf3;
  border: 2px solid #143833;
  border-radius: 20px;
  padding: 1.6rem 1.6rem 1.3rem 1.6rem;
  max-width: 530px;
  width: 100%;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.28);
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
  position: relative;
  animation: s14ModalPop 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes s14ModalPop {
  from { opacity: 0; transform: scale(0.94); }
  to { opacity: 1; transform: scale(1); }
}

.s14-modal-top-bar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
}

.s14-modal-heading {
  font-size: clamp(1.05rem, 2vw, 1.25rem);
  font-weight: 700;
  line-height: 1.35;
  color: #142724;
  margin: 0;
  text-align: left;
  outline: none;
  flex: 1;
}
.s14-modal-heading:focus,
.s14-modal-heading:focus-visible {
  outline: none !important;
}

.s14-modal-dismiss-btn {
  background: transparent;
  border: 1.5px solid #143833;
  border-radius: 8px;
  color: #143833;
  cursor: pointer;
  padding: 4px 10px;
  font-size: 13px;
  font-weight: 700;
  flex-shrink: 0;
  min-height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}
.s14-modal-dismiss-btn:hover {
  background: #e6f4f1;
}
.s14-modal-dismiss-btn:focus-visible {
  outline: 3px solid #143833 !important;
  outline-offset: 2px !important;
}

.s14-modal-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  width: 100%;
}

.s14-modal-btn {
  min-height: 48px;
  padding: 0.65rem 0.85rem;
  border-radius: 12px;
  background-color: #ffffff;
  border: 2px solid #1c5249;
  color: #142724;
  font-family: inherit;
  font-size: 0.88rem;
  font-weight: 700;
  line-height: 1.25;
  text-align: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.15s ease;
  outline: none;
  display: flex;
  align-items: center;
  justify-content: center;
  white-space: pre-line;
  touch-action: manipulation;
}

.s14-modal-btn:hover {
  background-color: #f2f8f6;
  border-color: #143833;
  transform: translateY(-1.5px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);
}

.s14-modal-btn:active {
  transform: scale(0.97);
}

.s14-modal-btn:focus-visible {
  outline: 3px solid #143833 !important;
  outline-offset: 3px !important;
}

.s14-modal-btn--selected {
  background-color: #ffd41d !important;
  border: 2.5px solid #143833 !important;
  color: #142724 !important;
  box-shadow: 0 4px 12px rgba(10, 40, 35, 0.25) !important;
}

.s14-modal-btn--selected:hover {
  background-color: #f5c80a !important;
}

/* Responsive Scaling */
@media (max-width: 768px) {
  .s14-middle {
    flex-direction: column;
    gap: 0.75rem;
  }
  .s14-card {
    max-width: 100%;
  }
  .s14-nurse-img {
    height: clamp(140px, 20vh, 180px);
  }
  .s14-spacer-side {
    width: auto;
  }
}

@media (max-width: 540px) {
  .s14-root {
    padding: 12px 14px 12px 14px;
  }
  .s14-heading {
    font-size: 1.15rem;
  }
  .s14-options-row {
    flex-direction: column;
    gap: 0.55rem;
  }
  .s14-option-btn {
    width: 100%;
    min-height: 46px;
    font-size: 0.9rem;
  }
  .s14-location-badge {
    padding: 0.4rem 0.5rem;
    font-size: 0.75rem;
  }
  .s14-location-badge-text {
    font-size: 0.7rem;
  }
}
  .s14-modal-grid {
    grid-template-columns: 1fr;
  }
  .s14-footer {
    justify-content: space-between;
  }
  .s14-nav-center {
    gap: 8px;
  }
  .s14-btn {
    padding: 0 16px;
    font-size: 14px;
    min-width: 70px;
  }
  .s14-captions-drawer {
    left: 0;
    right: 0;
    max-width: 100%;
    bottom: 56px;
  }
}

/* Landscape on short viewports */
@media (max-height: 520px) and (orientation: landscape) {
  .s14-root {
    padding: 8px 20px 3.25rem 20px;
  }
  .s14-heading {
    font-size: 1.05rem;
    margin-bottom: 4px;
  }
  .s14-middle {
    flex-direction: row;
    gap: 1.2rem;
    padding: 0;
  }
  .s14-card {
    padding: 0.8rem 1rem;
    max-width: 440px;
  }
  .s14-option-btn {
    min-height: 40px;
    padding: 0.45rem 0.9rem;
    font-size: 0.85rem;
    min-width: 80px;
    white-space: normal;
    word-wrap: break-word;
    overflow: hidden;
  }
  .s14-nurse-img {
    height: 130px;
  }
  .s14-footer {
    padding-top: 4px;
  }
  .s14-btn {
    height: 38px;
    padding: 0 18px;
    font-size: 14px;
  }
}

/* Scoped Mobile Layout (.is-mobile) */
.s14-root.is-mobile {
  padding: 14px 16px 14px 16px !important;
}
.s14-root.is-mobile .s14-heading {
  font-size: 1.15rem !important;
}
.s14-root.is-mobile .s14-middle {
  flex-direction: column !important;
  gap: 0.6rem !important;
  width: 100% !important;
  align-items: center !important;
  margin: auto 0 !important;
}
.s14-root.is-mobile .s14-card {
  max-width: 100% !important;
  width: 100% !important;
  padding: 1.1rem 1rem !important;
  border-radius: 18px !important;
}
.s14-root.is-mobile .s14-options-row {
  flex-direction: column !important;
  gap: 0.55rem !important;
  width: 100% !important;
}
.s14-root.is-mobile .s14-option-btn {
  width: 100% !important;
  min-height: 44px !important;
  font-size: 0.92rem !important;
  min-width: 80px !important;
  white-space: normal !important;
  word-wrap: break-word !important;
  overflow: hidden !important;
}
.s14-root.is-mobile .s14-nurse-wrap {
  margin-top: 2px !important;
}
.s14-root.is-mobile .s14-nurse-img {
  height: clamp(120px, 16vh, 145px) !important;
}
.s14-root.is-mobile .s14-modal-grid {
  grid-template-columns: 1fr !important;
}
.s14-root.is-mobile .s14-footer {
  justify-content: space-between !important;
  width: 100% !important;
  padding-top: 6px !important;
}
.s14-root.is-mobile .s14-spacer-side {
  width: auto !important;
  flex-shrink: 1 !important;
}
.s14-root.is-mobile .s14-nav-center {
  gap: 10px !important;
}
.s14-root.is-mobile .s14-btn {
  padding: 0 16px !important;
  font-size: 14px !important;
  min-width: 72px !important;
  min-height: 44px !important;
}
.s14-root.is-mobile .s14-audio-controls {
  gap: 6px !important;
}
`;

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
  stepId = "slide14_medical_care",
  locale,
  transcriptText,
  variant = "auto",
  initialModalOpen = false,
  navProps,
}: Slide14MedicalCareScreenProps) {
  const isEs = isSpanish || locale === "es";

  // Accessibility refs
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const modalHeadingRef = useRef<HTMLHeadingElement | null>(null);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const lastTriggerRef = useRef<HTMLButtonElement | null>(null);

  // States
  const [modalOpen, setModalOpen] = useState(initialModalOpen);
  const [showCaptions, setShowCaptions] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [liveAnnouncement, setLiveAnnouncement] = useState("");

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Effective transcript for TTS & CC
  const effectiveTranscript =
    transcriptText ||
    (isEs
      ? "¿Su hijo recibió atención médica por su reacción? Seleccione Sí, No o No estoy seguro."
      : "Did your child receive medical care for their reaction? Select Yes, No, or Unsure.");

  const effectiveAudioSrc =
    audioSrc ||
    (isEs
      ? "/audio/exported/slide14_medical_care_es.mp3"
      : "/audio/exported/slide14_medical_care_en.mp3");

  // Focus heading on mount (WCAG 2.4.3 & Karen audit rule)
  useEffect(() => {
    const timer = setTimeout(() => {
      headingRef.current?.focus({ preventScroll: true });
    }, 60);
    return () => clearTimeout(timer);
  }, []);

  // Global keydown: ESC dismisses Captions or Modal (WCAG 1.4.13 & 2.1.2)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (modalOpen) {
          e.preventDefault();
          setModalOpen(false);
          setLiveAnnouncement(
            isEs ? "Ventana emergente cerrada" : "Dialog closed"
          );
          setTimeout(() => lastTriggerRef.current?.focus(), 40);
        } else if (showCaptions) {
          e.preventDefault();
          setShowCaptions(false);
          setLiveAnnouncement(
            isEs ? "Subtítulos ocultos" : "Closed captions dismissed"
          );
        }
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [modalOpen, showCaptions, isEs]);

  // Trap focus & focus heading when modal opens
  useEffect(() => {
    if (!modalOpen) return;
    const timer = setTimeout(() => {
      modalHeadingRef.current?.focus({ preventScroll: true });
    }, 60);
    return () => clearTimeout(timer);
  }, [modalOpen]);

  // Audio synchronization with HTMLAudioElement and SpeechSynthesis
  useEffect(() => {
    const audioEl = audioRef.current;
    if (!audioEl) return;

    const handlePlay = () => setAudioPlaying(true);
    const handlePause = () => setAudioPlaying(false);
    const handleEnded = () => setAudioPlaying(false);

    audioEl.addEventListener("play", handlePlay);
    audioEl.addEventListener("pause", handlePause);
    audioEl.addEventListener("ended", handleEnded);

    return () => {
      audioEl.removeEventListener("play", handlePlay);
      audioEl.removeEventListener("pause", handlePause);
      audioEl.removeEventListener("ended", handleEnded);
      audioEl.pause();
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [effectiveAudioSrc, stepId]);

  const toggleAudio = useCallback(() => {
    const audioEl = audioRef.current;
    const willPlay = !audioPlaying;

    setLiveAnnouncement(
      willPlay
        ? isEs
          ? "Reproduciendo narración de audio"
          : "Audio narration playing"
        : isEs
        ? "Narración de audio pausada"
        : "Audio narration paused"
    );

    if (willPlay) {
      if (audioEl && audioEl.src && !audioEl.src.endsWith(".undefined")) {
        audioEl.play().catch(() => {
          if (typeof window !== "undefined" && "speechSynthesis" in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(effectiveTranscript);
            utterance.lang = isEs ? "es-US" : "en-US";
            utterance.rate = 0.95;
            utterance.onstart = () => setAudioPlaying(true);
            utterance.onend = () => setAudioPlaying(false);
            utterance.onerror = () => setAudioPlaying(false);
            window.speechSynthesis.speak(utterance);
          }
        });
      } else if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(effectiveTranscript);
        utterance.lang = isEs ? "es-US" : "en-US";
        utterance.rate = 0.95;
        utterance.onstart = () => setAudioPlaying(true);
        utterance.onend = () => setAudioPlaying(false);
        utterance.onerror = () => setAudioPlaying(false);
        window.speechSynthesis.speak(utterance);
      }
    } else {
      if (audioEl) audioEl.pause();
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      setAudioPlaying(false);
    }
  }, [audioPlaying, isEs, effectiveTranscript]);

  const toggleCaptions = useCallback(() => {
    const next = !showCaptions;
    setShowCaptions(next);
    setLiveAnnouncement(
      next
        ? isEs
          ? "Subtítulos mostrados"
          : "Closed captions shown"
        : isEs
        ? "Subtítulos ocultos"
        : "Closed captions hidden"
    );
  }, [showCaptions, isEs]);

  const handleMainOption = (val: string, triggerBtn?: HTMLButtonElement | null) => {
    if (triggerBtn) lastTriggerRef.current = triggerBtn;
    onSelect(val);
    setLiveAnnouncement(isEs ? `Seleccionado: ${val}` : `Selected: ${val}`);
    if (val === "Yes") {
      setModalOpen(true);
    } else {
      onLocationSelect("");
    }
  };

  const handleLocationSelect = (locVal: string) => {
    onLocationSelect(locVal);
    const locObj = LOCATION_OPTIONS.find((l) => l.value === locVal);
    const label = isEs ? locObj?.labelEs || locVal : locObj?.labelEn || locVal;
    setLiveAnnouncement(
      isEs
        ? `Lugar seleccionado: ${label.replace("\n", " ")}`
        : `Location selected: ${label.replace("\n", " ")}`
    );
    setModalOpen(false);
    setTimeout(() => lastTriggerRef.current?.focus(), 40);
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

  // Arrow key roving tabindex navigation for RadioGroup (WCAG 2.1)
  const handleArrowKeyDown = (e: React.KeyboardEvent, index: number) => {
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
      const targetBtn = buttonRefs.current[nextIndex];
      handleMainOption(nextOpt.value, targetBtn);
      targetBtn?.focus();
    }
  };

  const selectedLocObj = LOCATION_OPTIONS.find((l) =>
    isLocationSelected(l.value, locationSelected)
  );
  const selectedLocLabel = isEs
    ? selectedLocObj?.labelEs.replace("\n", " ") || locationSelected
    : selectedLocObj?.labelEn.replace("\n", " ") || locationSelected;

  const variantClass =
    variant === "mobile"
      ? " is-mobile"
      : variant === "desktop"
      ? " is-desktop"
      : "";

  return (
    <section
      id="slide-content"
      aria-labelledby="slide14-title"
      className={`s14-root${variantClass}`}
    >
      <style>{SLIDE14_CSS}</style>

      {/* Screen reader live region */}
      <div className="s14-sr-only" aria-live="polite" aria-atomic="true">
        {liveAnnouncement}
      </div>

      {/* Hidden audio element for synchronous narration */}
      <audio
        ref={audioRef}
        src={effectiveAudioSrc}
        preload="metadata"
        className="s14-sr-only"
        aria-hidden="true"
        tabIndex={-1}
      />

      {/* 1. Main Heading Level 1 (WCAG 1.3.1 & 2.4.6) */}
      <div className="s14-top-section">
        <h1
          ref={headingRef}
          tabIndex={-1}
          id="slide14-title"
          className="s14-heading"
        >
          {isEs
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
              const label = isEs ? opt.labelEs : opt.labelEn;

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
                  onClick={(e) => handleMainOption(opt.value, e.currentTarget)}
                  onKeyDown={(e) => handleArrowKeyDown(e, index)}
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
              <span className="s14-location-badge-text">
                <strong>{isEs ? "Lugar: " : "Location: "}</strong>
                {selectedLocLabel}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  lastTriggerRef.current = e.currentTarget;
                  setModalOpen(true);
                }}
                className="s14-location-change-btn"
                aria-label={
                  isEs
                    ? `Cambiar lugar de atención: actualmente ${selectedLocLabel}`
                    : `Change care location: currently ${selectedLocLabel}`
                }
              >
                {isEs ? "Cambiar" : "Change"}
              </button>
            </div>
          )}
        </div>

        {/* Nurse Anna on the right (Strictly Decorative Slide 2+) */}
        <div className="s14-nurse-wrap" aria-hidden="true">
          <img
            src="/images/nurse-anna.png"
            alt=""
            draggable={false}
            className="s14-nurse-img"
          />
        </div>
      </div>

      {/* 3. Standardized Back & Next Navigation (shared SlideNavigationButtons) */}
      <SlideNavigationButtons
        onBack={handleBackClick}
        onNext={handleNextClick}
        isSpanish={isEs}
        loading={isLoading}
        nextDisabled={!isNextEnabled}
        variant="flow"
      />

      {/* Bottom audio / closed-captions toolbar */}
      <footer className="s14-footer">
        {/* Audio narration & CC controls */}
        <div className="s14-audio-controls s14-spacer-side">
          {/* <button
            type="button"
            className="s14-audio-btn"
            onClick={toggleCaptions}
            aria-pressed={showCaptions}
            aria-label={
              showCaptions
                ? isEs
                  ? "Ocultar subtítulos"
                  : "Hide closed captions"
                : isEs
                ? "Mostrar subtítulos"
                : "Show closed captions"
            }
            title={
              showCaptions
                ? isEs
                  ? "Ocultar subtítulos"
                  : "Hide closed captions"
                : isEs
                ? "Mostrar subtítulos"
                : "Show closed captions"
            }
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 40 40"
              fill="none"
              aria-hidden="true"
              focusable="false"
            >
              <rect
                x="5"
                y="5"
                width="30"
                height="30"
                rx="4"
                fill={showCaptions ? "#144e57" : "#e6f4f1"}
                stroke="#144e57"
                strokeWidth="2"
              />
              <text
                x="20"
                y="24"
                textAnchor="middle"
                fill={showCaptions ? "#ffffff" : "#144e57"}
                fontSize="14"
                fontFamily="Plus Jakarta Sans, sans-serif"
                fontWeight="800"
                letterSpacing="1"
                aria-hidden="true"
              >
                CC
              </text>
            </svg>
          </button> */}

          {/* <button
            type="button"
            className="s14-audio-btn"
            onClick={toggleAudio}
            aria-pressed={audioPlaying}
            aria-label={
              audioPlaying
                ? isEs
                  ? "Pausar narración de audio"
                  : "Pause audio narration"
                : isEs
                ? "Reproducir narración de audio"
                : "Play audio narration"
            }
            title={
              audioPlaying
                ? isEs
                  ? "Pausar narración de audio"
                  : "Pause audio narration"
                : isEs
                ? "Reproducir narración de audio"
                : "Play audio narration"
            }
          >
            {audioPlaying ? (
              <svg
                width="32"
                height="32"
                viewBox="0 0 40 40"
                fill="none"
                aria-hidden="true"
                focusable="false"
              >
                <rect
                  x="5"
                  y="5"
                  width="30"
                  height="30"
                  rx="4"
                  fill="#144e57"
                  stroke="#144e57"
                  strokeWidth="2"
                />
                <rect x="15" y="16" width="6" height="14" rx="2" fill="#ffffff" />
                <rect x="27" y="16" width="6" height="14" rx="2" fill="#ffffff" />
              </svg>
            ) : (
              <svg
                width="32"
                height="32"
                viewBox="0 0 40 40"
                fill="none"
                aria-hidden="true"
                focusable="false"
              >
                <rect
                  x="5"
                  y="5"
                  width="30"
                  height="30"
                  rx="4"
                  fill="#e6f4f1"
                  stroke="#144e57"
                  strokeWidth="2"
                />
                <polygon points="18,12 30,24 18,36" fill="#144e57" />
              </svg>
            )}
          </button> */}
        </div>

        {/* Closed Captions Drawer Popup */}
        {showCaptions && (
          <div
            className="s14-captions-drawer"
            role="region"
            aria-label={isEs ? "Subtítulos" : "Closed Captions"}
          >
            <div className="s14-captions-header">
              <span className="s14-captions-title">
                {isEs ? "Subtítulos" : "Closed Captions"}
              </span>
              <button
                type="button"
                className="s14-captions-close"
                onClick={() => setShowCaptions(false)}
                aria-label={isEs ? "Cerrar subtítulos" : "Dismiss captions"}
              >
                ✕
              </button>
            </div>
            <p className="s14-captions-text">{effectiveTranscript}</p>
          </div>
        )}
      </footer>

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
            if (e.target === e.currentTarget) {
              setModalOpen(false);
              setTimeout(() => lastTriggerRef.current?.focus(), 40);
            }
          }}
        >
          <div className="s14-modal-card">
            <div className="s14-modal-top-bar">
              <h2
                id="modal-15-heading"
                ref={modalHeadingRef}
                tabIndex={-1}
                className="s14-modal-heading"
              >
                {isEs
                  ? "¿Dónde recibió atención médica para la reacción?"
                  : "Where did your child get medical care for the reaction?"}
              </h2>
              <button
                type="button"
                className="s14-modal-dismiss-btn"
                onClick={() => {
                  setModalOpen(false);
                  setTimeout(() => lastTriggerRef.current?.focus(), 40);
                }}
                aria-label={isEs ? "Cerrar ventana emergente" : "Close dialog"}
              >
                {isEs ? "Cerrar" : "Close"}
              </button>
            </div>

            <div
              className="s14-modal-grid"
              role="radiogroup"
              aria-labelledby="modal-15-heading"
            >
              {LOCATION_OPTIONS.map((loc) => {
                const isLocChecked = isLocationSelected(loc.value, locationSelected);
                const locLabel = isEs ? loc.labelEs : loc.labelEn;

                return (
                  <button
                    key={loc.value}
                    type="button"
                    role="radio"
                    aria-checked={isLocChecked}
                    onClick={() => handleLocationSelect(loc.value)}
                    className={`s14-modal-btn${isLocChecked ? " s14-modal-btn--selected" : ""}`}
                  >
                    {locLabel}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default Slide14MedicalCareScreen;
