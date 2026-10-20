"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";

export interface Slide15ResolutionScreenProps {
  isSpanish?: boolean;
  selected?: string;
  medicines?: string[];
  resolutionMedicines?: string[];
  route?: string;
  resolutionRoute?: string;
  onSelectResolution?: (val: string) => void;
  onSelect?: (val: string) => void;
  onSelectMedicines?: (meds: string[]) => void;
  onMedicinesSelect?: (meds: string[]) => void;
  onSelectRoute?: (route: string) => void;
  onRouteChange?: (route: string) => void;
  onNext?: () => void;
  onBack?: () => void;
  loading?: boolean;
  audioSrc?: string;
  stepId?: string;
  locale?: string;
  transcriptText?: string;
  variant?: "auto" | "desktop" | "mobile";
  initialModal17Open?: boolean;
  initialModal18Open?: boolean;
  navProps?: {
    onNext: (explicitAnswer?: any) => void;
    onBack: () => void;
    loading?: boolean;
    headingRef?: React.RefObject<HTMLHeadingElement | null>;
  };
}

export interface ResolutionOption {
  value: string;
  labelEn: string;
  labelEs: string;
}

export const RESOLUTION_OPTIONS: ResolutionOption[] = [
  { value: "With medication", labelEn: "With medication", labelEs: "Con medicación" },
  { value: "On its own", labelEn: "On its own", labelEs: "Por sí sola" },
  { value: "Unsure/I don't know", labelEn: "Unsure/I don't know", labelEs: "No estoy seguro/ No lo sé" },
];

export const MEDICATION_OPTIONS = [
  {
    value: "Allergy medicine (Benadryl, Zyrtec)",
    labelEn: "Allergy medicine\n(Benadryl, Zyrtec)",
    labelEs: "Medicina para la alergia\n(Benadryl, Zyrtec)",
  },
  {
    value: "Steroid medicine (Prednisone)",
    labelEn: "Steroid medicine\n(Prednisone)",
    labelEs: "Medicina esteroidea\n(Prednisona)",
  },
  {
    value: "Epinephrine (EpiPen)",
    labelEn: "Epinephrine\n(EpiPen)",
    labelEs: "Epinefrina\n(EpiPen)",
  },
  {
    value: "Unsure/I don't know",
    labelEn: "Unsure/I don't know",
    labelEs: "No estoy seguro/ No lo sé",
  },
];

export const ROUTE_OPTIONS = [
  { value: "Mouth", labelEn: "Mouth", labelEs: "Por la boca" },
  { value: "IV", labelEn: "IV", labelEs: "Vía intravenosa (IV)" },
  { value: "Shot", labelEn: "Shot", labelEs: "Inyección" },
  { value: "Unsure/I don't know", labelEn: "Unsure/I don't know", labelEs: "No estoy seguro/ No lo sé" },
];

function isResolutionSelected(optValue: string, currentSelected?: string): boolean {
  if (!currentSelected) return false;
  if (currentSelected === optValue) return true;
  if (
    optValue === "Unsure/I don't know" &&
    (currentSelected.toLowerCase().includes("unsure") ||
      currentSelected.toLowerCase().includes("know") ||
      currentSelected.toLowerCase().includes("seguro"))
  ) {
    return true;
  }
  return false;
}

const SLIDE15_CSS = `
/* ==========================================================
   Slide 15: Resolution Screen
   WCAG 2.1 / 2.2 Level AAA Compliant Design
   ========================================================== */

.s15-sr-only {
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

.s15-root,
.s15-root *,
.s15-root *::before,
.s15-root *::after {
  box-sizing: border-box;
}

.s15-root {
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
  padding: clamp(14px, 2.2vh, 24px) clamp(16px, 3.5vw, 40px) 16px clamp(16px, 3.5vw, 40px);
  overflow-y: auto;
  overflow-x: hidden;
  font-family: "Plus Jakarta Sans", "Inter", system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
  color: #142724;
}

/* Heading */
.s15-top-section {
  width: 100%;
  max-width: 760px;
  text-align: center;
  margin: 0 auto;
  padding: 0;
  flex-shrink: 0;
}

.s15-heading {
  font-size: clamp(1.15rem, 2.2vw, 1.45rem);
  line-height: 1.35;
  font-weight: 700;
  color: #142724;
  letter-spacing: -0.015em;
  margin: 0;
  outline: none;
}
.s15-heading:focus,
.s15-heading:focus-visible {
  outline: none !important;
}

/* Middle Section: Teal Card + Nurse Anna */
.s15-middle {
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
.s15-card {
  background-color: #8cb2a7;
  border: 2px solid #638d82;
  border-radius: 24px;
  padding: clamp(1.2rem, 2.5vw, 2rem);
  box-shadow: 0 8px 24px rgba(20, 55, 50, 0.14);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  max-width: 540px;
  width: 100%;
  transition: all 0.2s ease;
}

/* Options Row */
.s15-options-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  width: 100%;
  flex-wrap: wrap;
}

/* White Option Buttons inside Teal Card (WCAG AAA Contrast > 14:1) */
.s15-option-btn {
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
  white-space: nowrap;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.15s ease;
  outline: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  touch-action: manipulation;
}

.s15-option-btn:hover {
  background-color: #f2f8f6;
  border-color: #143833;
  transform: translateY(-1.5px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.14);
}

.s15-option-btn:active {
  transform: scale(0.97);
}

.s15-option-btn:focus-visible {
  outline: 3px solid #143833 !important;
  outline-offset: 3px !important;
}

/* Selected Button State: High contrast Yellow badge with dark text */
.s15-option-btn--selected {
  background-color: #ffd41d !important;
  border: 2.5px solid #143833 !important;
  color: #142724 !important;
  box-shadow: 0 4px 12px rgba(10, 40, 35, 0.25) !important;
}

.s15-option-btn--selected:hover {
  background-color: #f5c80a !important;
}

/* Medication & Route Badge inside Card (when With medication is chosen) */
.s15-meds-badge {
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

.s15-meds-badge-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.2;
  flex: 1;
}

.s15-change-btn {
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
.s15-change-btn:hover {
  background: #bddfd8;
}
.s15-change-btn:focus-visible {
  outline: 3px solid #143833 !important;
  outline-offset: 2px !important;
}

/* Nurse Anna Wrapper (WCAG Decorative Slide 2+) */
.s15-nurse-wrap {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  flex-shrink: 0;
  user-select: none;
}

.s15-nurse-img {
  height: clamp(180px, 26vh, 230px);
  width: auto;
  object-fit: contain;
  display: block;
  filter: drop-shadow(0 4px 10px rgba(20, 50, 45, 0.12));
}

/* ==========================================================
   UNIFIED BOTTOM TOOLBAR (44px+ touch targets, AAA contrast)
   ========================================================== */
.s15-footer {
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

.s15-spacer-side {
  width: 110px;
  flex-shrink: 0;
  display: flex;
  justify-content: flex-end;
}

.s15-nav-center {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.s15-btn {
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

.s15-btn:focus-visible {
  outline: 3px solid #143833 !important;
  outline-offset: 3px !important;
}

.s15-btn--back {
  background-color: #bddfd8;
  border-color: #78a59b;
  color: #143833;
}
.s15-btn--back:hover:not(:disabled) {
  background-color: #a8d5cc;
}
.s15-btn--back:active:not(:disabled) {
  transform: scale(0.96);
}

.s15-btn--next {
  background-color: #ffd41d;
  border-color: #d4a900;
  color: #142724;
}
.s15-btn--next:hover:not(:disabled) {
  background-color: #f0c30a;
}
.s15-btn--next:active:not(:disabled) {
  transform: scale(0.96);
}

.s15-btn--disabled,
.s15-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

/* Audio narration & CC controls */
.s15-audio-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.s15-audio-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 2px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.15s ease;
  outline: none;
  min-width: 44px;
  min-height: 44px;
}
.s15-audio-btn:hover {
  transform: scale(1.05);
}
.s15-audio-btn:active {
  transform: scale(0.95);
}
.s15-audio-btn:focus-visible {
  outline: 3px solid #143833 !important;
  outline-offset: 3px !important;
}

/* Closed Captions Drawer */
.s15-captions-drawer {
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
  animation: s15CaptionsIn 0.2s ease-out;
}

@keyframes s15CaptionsIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.s15-captions-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  border-bottom: 1px solid #d8e5e2;
  padding-bottom: 6px;
}

.s15-captions-title {
  font-size: 13px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #143833;
  margin: 0;
}

.s15-captions-close {
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
.s15-captions-close:hover {
  background: #e6f4f1;
}
.s15-captions-close:focus-visible {
  outline: 2px solid #143833;
}

.s15-captions-text {
  font-size: 14px;
  line-height: 1.45;
  color: #142724;
  margin: 0;
  font-weight: 500;
}

/* ==========================================================
   MODAL DIALOGS: Modals 17 & 18 (WCAG AAA Accessible)
   ========================================================== */
.s15-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background-color: rgba(14, 39, 36, 0.6);
  backdrop-filter: blur(3px);
  animation: s15OverlayFade 0.18s ease-out;
}

@keyframes s15OverlayFade {
  from { opacity: 0; }
  to { opacity: 1; }
}

.s15-modal-card {
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
  animation: s15ModalPop 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes s15ModalPop {
  from { opacity: 0; transform: scale(0.94); }
  to { opacity: 1; transform: scale(1); }
}

.s15-modal-top-bar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
}

.s15-modal-heading {
  font-size: clamp(1.05rem, 2vw, 1.25rem);
  font-weight: 700;
  line-height: 1.35;
  color: #142724;
  margin: 0;
  text-align: left;
  outline: none;
  flex: 1;
}
.s15-modal-heading:focus,
.s15-modal-heading:focus-visible {
  outline: none !important;
}

.s15-modal-dismiss-btn {
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
.s15-modal-dismiss-btn:hover {
  background: #e6f4f1;
}
.s15-modal-dismiss-btn:focus-visible {
  outline: 3px solid #143833 !important;
  outline-offset: 2px !important;
}

/* Modal 17: Medication Selection Grid */
.s15-modal17-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  width: 100%;
}

.s15-med-btn {
  min-height: 52px;
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

.s15-med-btn:hover {
  background-color: #f2f8f6;
  border-color: #143833;
  transform: translateY(-1.5px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);
}

.s15-med-btn:active {
  transform: scale(0.97);
}

.s15-med-btn:focus-visible {
  outline: 3px solid #143833 !important;
  outline-offset: 3px !important;
}

.s15-med-btn--selected {
  background-color: #ffd41d !important;
  border: 2.5px solid #143833 !important;
  color: #142724 !important;
  box-shadow: 0 4px 12px rgba(10, 40, 35, 0.25) !important;
}

.s15-med-btn--selected:hover {
  background-color: #f5c80a !important;
}

.s15-modal17-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-top: 0.4rem;
  padding-top: 0.4rem;
  gap: 12px;
}

.s15-more-questions-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background-color: #143833;
  color: #ffffff;
  border: none;
  border-radius: 9999px;
  padding: 0.6rem 1.4rem;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.16);
  transition: all 0.15s ease;
  min-height: 44px;
}

.s15-more-questions-btn:hover {
  background-color: #0c2622;
  transform: translateY(-1px);
}

.s15-more-questions-btn:focus-visible {
  outline: 3px solid #ffd41d !important;
  outline-offset: 2px !important;
}

/* Modal 18: Route Administered Row */
.s15-modal18-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.65rem;
  width: 100%;
}

.s15-route-btn {
  flex: 1 1 0%;
  min-height: 48px;
  padding: 0.6rem 0.75rem;
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
  white-space: nowrap;
  touch-action: manipulation;
}

.s15-route-btn:hover {
  background-color: #f2f8f6;
  border-color: #143833;
  transform: translateY(-1.5px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);
}

.s15-route-btn:active {
  transform: scale(0.97);
}

.s15-route-btn:focus-visible {
  outline: 3px solid #143833 !important;
  outline-offset: 3px !important;
}

.s15-route-btn--selected {
  background-color: #ffd41d !important;
  border: 2.5px solid #143833 !important;
  color: #142724 !important;
  box-shadow: 0 4px 12px rgba(10, 40, 35, 0.25) !important;
}

.s15-route-btn--selected:hover {
  background-color: #f5c80a !important;
}

/* Responsive Scaling */
@media (max-width: 768px) {
  .s15-middle {
    flex-direction: column;
    gap: 0.75rem;
  }
  .s15-card {
    max-width: 100%;
  }
  .s15-nurse-img {
    height: clamp(140px, 20vh, 180px);
  }
  .s15-spacer-side {
    width: auto;
  }
}

@media (max-width: 540px) {
  .s15-root {
    padding: 12px 14px 12px 14px;
  }
  .s15-heading {
    font-size: 1.15rem;
  }
  .s15-options-row {
    flex-direction: column;
    gap: 0.55rem;
  }
  .s15-option-btn {
    width: 100%;
    min-height: 46px;
    font-size: 0.9rem;
  }
  .s15-meds-badge {
    padding: 0.4rem 0.5rem;
    font-size: 0.75rem;
  }
  .s15-meds-badge-text {
    font-size: 0.7rem;
  }
  .s15-modal17-grid {
    grid-template-columns: 1fr;
  }
  .s15-modal18-row {
    flex-direction: column;
  }
  .s15-route-btn {
    width: 100%;
  }
  .s15-footer {
    justify-content: space-between;
  }
  .s15-nav-center {
    gap: 8px;
  }
  .s15-btn {
    padding: 0 16px;
    font-size: 14px;
    min-width: 70px;
  }
  .s15-captions-drawer {
    left: 0;
    right: 0;
    max-width: 100%;
    bottom: 56px;
  }
}

/* Landscape on short viewports */
@media (max-height: 520px) and (orientation: landscape) {
  .s15-root {
    padding: 8px 20px 8px 20px;
  }
  .s15-heading {
    font-size: 1.05rem;
    margin-bottom: 4px;
  }
  .s15-middle {
    flex-direction: row;
    gap: 1.2rem;
    padding: 0;
  }
  .s15-card {
    padding: 0.8rem 1rem;
    max-width: 460px;
  }
  .s15-option-btn {
    min-height: 40px;
    padding: 0.45rem 0.8rem;
    font-size: 0.85rem;
    min-width: 80px;
    white-space: nowrap;
  }
  .s15-nurse-img {
    height: 130px;
  }
  .s15-footer {
    padding-top: 4px;
  }
  .s15-btn {
    height: 38px;
    padding: 0 18px;
    font-size: 14px;
  }
}

/* Scoped Mobile Layout (.is-mobile) */
.s15-root.is-mobile {
  padding: 14px 16px 14px 16px !important;
}
.s15-root.is-mobile .s15-heading {
  font-size: 1.15rem !important;
}
.s15-root.is-mobile .s15-middle {
  flex-direction: column !important;
  gap: 0.6rem !important;
  width: 100% !important;
  align-items: center !important;
  margin: auto 0 !important;
}
.s15-root.is-mobile .s15-card {
  max-width: 100% !important;
  width: 100% !important;
  padding: 1.1rem 1rem !important;
  border-radius: 18px !important;
}
.s15-root.is-mobile .s15-options-row {
  flex-direction: column !important;
  gap: 0.55rem !important;
  width: 100% !important;
}
.s15-root.is-mobile .s15-option-btn {
  width: 100% !important;
  min-height: 44px !important;
  font-size: 0.92rem !important;
  min-width: 80px !important;
}
.s15-root.is-mobile .s15-nurse-wrap {
  margin-top: 2px !important;
}
.s15-root.is-mobile .s15-nurse-img {
  height: clamp(120px, 16vh, 145px) !important;
}
.s15-root.is-mobile .s15-modal17-grid {
  grid-template-columns: 1fr !important;
}
.s15-root.is-mobile .s15-modal18-row {
  flex-direction: column !important;
}
.s15-root.is-mobile .s15-route-btn {
  width: 100% !important;
}
.s15-root.is-mobile .s15-footer {
  justify-content: space-between !important;
  width: 100% !important;
  padding-top: 6px !important;
}
.s15-root.is-mobile .s15-spacer-side {
  width: auto !important;
  flex-shrink: 1 !important;
}
.s15-root.is-mobile .s15-nav-center {
  gap: 10px !important;
}
.s15-root.is-mobile .s15-btn {
  padding: 0 16px !important;
  font-size: 14px !important;
  min-width: 72px !important;
  min-height: 44px !important;
}
.s15-root.is-mobile .s15-audio-controls {
  gap: 6px !important;
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
    scroll-behavior: auto !important;
  }
}
`;

export function Slide15ResolutionScreen({
  isSpanish = false,
  selected,
  medicines,
  resolutionMedicines,
  route,
  resolutionRoute,
  onSelectResolution,
  onSelect,
  onSelectMedicines,
  onMedicinesSelect,
  onSelectRoute,
  onRouteChange,
  onNext,
  onBack,
  loading = false,
  audioSrc,
  stepId = "slide15_resolution",
  locale,
  transcriptText,
  variant = "auto",
  initialModal17Open = false,
  initialModal18Open = false,
  navProps,
}: Slide15ResolutionScreenProps) {
  const isEs = isSpanish || locale === "es";

  // Accessibility refs
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const modal17HeadingRef = useRef<HTMLHeadingElement | null>(null);
  const modal18HeadingRef = useRef<HTMLHeadingElement | null>(null);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const lastTriggerRef = useRef<HTMLButtonElement | null>(null);

  const initialMeds = medicines ?? resolutionMedicines ?? [];
  const initialRoute = route ?? resolutionRoute;
  const handleResolution = onSelectResolution ?? onSelect ?? (() => {});
  const handleMedicines = onSelectMedicines ?? onMedicinesSelect;
  const handleRoute = onSelectRoute ?? onRouteChange;

  // States
  const [modal17Open, setModal17Open] = useState(initialModal17Open);
  const [modal18Open, setModal18Open] = useState(initialModal18Open);
  const [showCaptions, setShowCaptions] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [liveAnnouncement, setLiveAnnouncement] = useState("");

  const [activeMeds, setActiveMeds] = useState<string[]>(initialMeds);
  const [activeRoute, setActiveRoute] = useState<string | undefined>(initialRoute);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Sync external state props
  useEffect(() => {
    if (medicines !== undefined || resolutionMedicines !== undefined) {
      setActiveMeds(medicines ?? resolutionMedicines ?? []);
    }
  }, [medicines, resolutionMedicines]);

  useEffect(() => {
    if (route !== undefined || resolutionRoute !== undefined) {
      setActiveRoute(route ?? resolutionRoute);
    }
  }, [route, resolutionRoute]);

  // Effective transcript for TTS & CC
  const effectiveTranscript =
    transcriptText ||
    (isEs
      ? "¿Cómo desapareció la reacción de su hijo? Seleccione Con medicación, Por sí sola o No estoy seguro."
      : "How did your child's reaction go away? Select With medication, On its own, or Unsure.");

  const effectiveAudioSrc =
    audioSrc ||
    (isEs
      ? "/audio/exported/screen6_4b_resolution_type_es.mp3"
      : "/audio/exported/screen6_4b_resolution_type_en.mp3");

  // Focus heading on mount (WCAG 2.4.3 & Karen audit rule)
  useEffect(() => {
    const timer = setTimeout(() => {
      headingRef.current?.focus({ preventScroll: true });
    }, 60);
    return () => clearTimeout(timer);
  }, []);

  // Global keydown: ESC dismisses Captions or Modals (WCAG 1.4.13 & 2.1.2)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (modal18Open) {
          e.preventDefault();
          setModal18Open(false);
          setLiveAnnouncement(isEs ? "Ventana emergente cerrada" : "Dialog closed");
          setTimeout(() => lastTriggerRef.current?.focus(), 40);
        } else if (modal17Open) {
          e.preventDefault();
          setModal17Open(false);
          setLiveAnnouncement(isEs ? "Ventana emergente cerrada" : "Dialog closed");
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
  }, [modal17Open, modal18Open, showCaptions, isEs]);

  // Trap focus & focus heading when Modal 17 opens
  useEffect(() => {
    if (!modal17Open) return;
    const timer = setTimeout(() => {
      modal17HeadingRef.current?.focus({ preventScroll: true });
    }, 60);
    return () => clearTimeout(timer);
  }, [modal17Open]);

  // Trap focus & focus heading when Modal 18 opens
  useEffect(() => {
    if (!modal18Open) return;
    const timer = setTimeout(() => {
      modal18HeadingRef.current?.focus({ preventScroll: true });
    }, 60);
    return () => clearTimeout(timer);
  }, [modal18Open]);

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
      if (audioEl) {
        audioEl.pause();
      }
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
    handleResolution(val);
    setLiveAnnouncement(isEs ? `Seleccionado: ${val}` : `Selected: ${val}`);
    if (val === "With medication") {
      setModal17Open(true);
    } else {
      setActiveMeds([]);
      setActiveRoute(undefined);
      if (handleMedicines) handleMedicines([]);
      if (handleRoute) handleRoute("");
    }
  };

  const toggleMed = (val: string) => {
    let updated: string[];
    if (val === "Unsure/I don't know") {
      updated = activeMeds.includes("Unsure/I don't know") ? [] : ["Unsure/I don't know"];
    } else {
      const withoutUnsure = activeMeds.filter((m) => m !== "Unsure/I don't know");
      if (withoutUnsure.includes(val)) {
        updated = withoutUnsure.filter((m) => m !== val);
      } else {
        updated = [...withoutUnsure, val];
      }
    }
    setActiveMeds(updated);
    if (handleMedicines) handleMedicines(updated);
    setLiveAnnouncement(
      isEs
        ? `Medicamento actualizado: ${updated.join(", ") || "Ninguno"}`
        : `Medication updated: ${updated.join(", ") || "None"}`
    );
  };

  const handleRouteSelect = (val: string) => {
    setActiveRoute(val);
    if (handleRoute) handleRoute(val);
    setLiveAnnouncement(isEs ? `Vía seleccionada: ${val}` : `Route selected: ${val}`);
    setModal18Open(false);
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
      nextIndex = (index + 1) % RESOLUTION_OPTIONS.length;
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      nextIndex = (index - 1 + RESOLUTION_OPTIONS.length) % RESOLUTION_OPTIONS.length;
    } else if (e.key === "Home") {
      e.preventDefault();
      nextIndex = 0;
    } else if (e.key === "End") {
      e.preventDefault();
      nextIndex = RESOLUTION_OPTIONS.length - 1;
    }

    if (nextIndex !== -1) {
      const nextOpt = RESOLUTION_OPTIONS[nextIndex];
      const targetBtn = buttonRefs.current[nextIndex];
      handleMainOption(nextOpt.value, targetBtn);
      targetBtn?.focus();
    }
  };

  // Format meds summary label
  const medsSummary =
    activeMeds.length > 0
      ? activeMeds
          .map((m) => {
            const opt = MEDICATION_OPTIONS.find((o) => o.value === m);
            const raw = isEs ? opt?.labelEs || m : opt?.labelEn || m;
            return raw.split("\n")[0].split(" (")[0];
          })
          .join(", ")
      : "";

  const variantClass =
    variant === "mobile"
      ? " is-mobile"
      : variant === "desktop"
      ? " is-desktop"
      : "";

  return (
    <section
      id="slide-content"
      aria-labelledby="slide15-title"
      className={`s15-root${variantClass}`}
    >
      <style>{SLIDE15_CSS}</style>

      {/* Screen reader live region */}
      <div className="s15-sr-only" aria-live="polite" aria-atomic="true">
        {liveAnnouncement}
      </div>

      {/* Hidden audio element for synchronous narration */}
      <audio
        ref={audioRef}
        src={effectiveAudioSrc}
        preload="metadata"
        className="s15-sr-only"
        aria-hidden="true"
        tabIndex={-1}
      />

      {/* 1. Main Heading Level 1 (WCAG 1.3.1 & 2.4.6) */}
      <div className="s15-top-section">
        <h1
          ref={headingRef}
          tabIndex={-1}
          id="slide15-title"
          className="s15-heading"
        >
          {isEs
            ? "¿Cómo desapareció la reacción de su hijo?"
            : "How did your child's reaction go away?"}
        </h1>
      </div>

      {/* 2. Middle Content Area: Rounded Teal Card + Nurse Anna */}
      <div className="s15-middle">
        {/* Teal Rounded Container Card */}
        <div className="s15-card">
          <div
            role="radiogroup"
            aria-labelledby="slide15-title"
            className="s15-options-row"
          >
            {RESOLUTION_OPTIONS.map((opt, index) => {
              const isChecked = isResolutionSelected(opt.value, selected);
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
                  className={`s15-option-btn${
                    isChecked ? " s15-option-btn--selected" : ""
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Active Meds & Route Badge (when With medication is selected) */}
          {selected === "With medication" && (activeMeds.length > 0 || activeRoute) && (
            <div className="s15-meds-badge">
              <span className="s15-meds-badge-text">
                <strong>{isEs ? "Medicamento: " : "Meds: "}</strong>
                {medsSummary || (isEs ? "Seleccionado" : "Selected")}
                {activeRoute && <span> ({activeRoute})</span>}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  lastTriggerRef.current = e.currentTarget;
                  setModal17Open(true);
                }}
                className="s15-change-btn"
                aria-label={
                  isEs
                    ? `Cambiar detalles del medicamento: actualmente ${medsSummary} ${activeRoute || ""}`
                    : `Change medication details: currently ${medsSummary} ${activeRoute || ""}`
                }
              >
                {isEs ? "Cambiar" : "Change"}
              </button>
            </div>
          )}
        </div>

        {/* Nurse Anna on the right (Strictly Decorative Slide 2+) */}
        <div className="s15-nurse-wrap" aria-hidden="true">
          <img
            src="/images/nurse-anna.png"
            alt=""
            draggable={false}
            className="s15-nurse-img"
          />
        </div>
      </div>

      {/* 3. Bottom Centered Navigation & Audio Toolbar */}
      <footer className="s15-footer">
        {/* Left spacer for optical center alignment */}
        <div className="s15-spacer-side" aria-hidden="true" />

        {/* Centered Back & Next Buttons */}
        <nav
          className="s15-nav-center"
          aria-label={
            isEs ? "Navegación del cuestionario" : "Questionnaire Navigation"
          }
        >
          <button
            type="button"
            className="s15-btn s15-btn--back"
            onClick={handleBackClick}
            disabled={isLoading}
            aria-label={
              isEs ? "Volver a la pantalla anterior" : "Back to previous screen"
            }
          >
            {isEs ? "Atrás" : "Back"}
          </button>

          <button
            type="button"
            className={`s15-btn s15-btn--next ${
              !isNextEnabled ? "s15-btn--disabled" : ""
            }`}
            onClick={handleNextClick}
            disabled={!isNextEnabled}
            aria-disabled={!isNextEnabled}
            aria-label={
              isEs
                ? isNextEnabled
                  ? "Siguiente pantalla"
                  : "Siguiente pantalla (deshabilitado hasta seleccionar una opción)"
                : isNextEnabled
                ? "Next screen"
                : "Next screen (disabled until an option is selected)"
            }
          >
            {isLoading ? (isEs ? "Cargando..." : "Loading...") : isEs ? "Siguiente" : "Next"}
          </button>
        </nav>

        {/* Right Audio narration & CC controls */}
        <div className="s15-audio-controls s15-spacer-side">
          <button
            type="button"
            className="s15-audio-btn"
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
              width="40"
              height="36"
              viewBox="0 0 52 47"
              fill="none"
              aria-hidden="true"
              focusable="false"
            >
              <rect
                x="2"
                y="2"
                width="48"
                height="43"
                rx="10"
                fill={showCaptions ? "#144e57" : "#e6f4f1"}
                stroke="#144e57"
                strokeWidth="2.5"
              />
              <text
                x="26"
                y="28"
                textAnchor="middle"
                fill={showCaptions ? "#ffffff" : "#144e57"}
                fontSize="18"
                fontFamily="Plus Jakarta Sans, sans-serif"
                fontWeight="800"
                letterSpacing="1"
                aria-hidden="true"
              >
                CC
              </text>
            </svg>
          </button>

          <button
            type="button"
            className="s15-audio-btn"
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
                width="52"
                height="36"
                viewBox="0 0 70 47"
                fill="none"
                aria-hidden="true"
                focusable="false"
              >
                <rect
                  x="2"
                  y="2"
                  width="66"
                  height="43"
                  rx="10"
                  fill="#144e57"
                  stroke="#144e57"
                  strokeWidth="2.5"
                />
                <rect x="25" y="14" width="6" height="19" rx="2" fill="#ffffff" />
                <rect x="39" y="14" width="6" height="19" rx="2" fill="#ffffff" />
              </svg>
            ) : (
              <svg
                width="52"
                height="36"
                viewBox="0 0 70 47"
                fill="none"
                aria-hidden="true"
                focusable="false"
              >
                <rect
                  x="2"
                  y="2"
                  width="66"
                  height="43"
                  rx="10"
                  fill="#e6f4f1"
                  stroke="#144e57"
                  strokeWidth="2.5"
                />
                <polygon points="28,14 46,23.5 28,33" fill="#144e57" />
              </svg>
            )}
          </button>
        </div>

        {/* Closed Captions Drawer Popup */}
        {showCaptions && (
          <div
            className="s15-captions-drawer"
            role="region"
            aria-label={isEs ? "Subtítulos" : "Closed Captions"}
          >
            <div className="s15-captions-header">
              <span className="s15-captions-title">
                {isEs ? "Subtítulos" : "Closed Captions"}
              </span>
              <button
                type="button"
                className="s15-captions-close"
                onClick={() => setShowCaptions(false)}
                aria-label={isEs ? "Cerrar subtítulos" : "Dismiss captions"}
              >
                ✕
              </button>
            </div>
            <p className="s15-captions-text">{effectiveTranscript}</p>
          </div>
        )}
      </footer>

      {/* ==========================================================
          MODAL 17: Medication Selection (WCAG AAA Accessible Dialog)
          ========================================================== */}
      {modal17Open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-17-heading"
          className="s15-modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              if (handleMedicines) handleMedicines(activeMeds);
              setModal17Open(false);
              setTimeout(() => lastTriggerRef.current?.focus(), 40);
            }
          }}
        >
          <div className="s15-modal-card">
            <div className="s15-modal-top-bar">
              <h2
                id="modal-17-heading"
                ref={modal17HeadingRef}
                tabIndex={-1}
                className="s15-modal-heading"
              >
                {isEs
                  ? "¿Qué medicamento le dieron a su hijo para la reacción?"
                  : "What medicine was given to your child for the reaction?"}
              </h2>
              <button
                type="button"
                className="s15-modal-dismiss-btn"
                onClick={() => {
                  if (handleMedicines) handleMedicines(activeMeds);
                  setModal17Open(false);
                  setTimeout(() => lastTriggerRef.current?.focus(), 40);
                }}
                aria-label={isEs ? "Cerrar ventana emergente" : "Close dialog"}
              >
                {isEs ? "Cerrar" : "Close"}
              </button>
            </div>

            <div
              className="s15-modal17-grid"
              role="group"
              aria-labelledby="modal-17-heading"
            >
              {MEDICATION_OPTIONS.map((opt) => {
                const isChecked = activeMeds.includes(opt.value);
                const label = isEs ? opt.labelEs : opt.labelEn;

                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="checkbox"
                    aria-checked={isChecked}
                    onClick={() => toggleMed(opt.value)}
                    className={`s15-med-btn${
                      isChecked ? " s15-med-btn--selected" : ""
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            <div className="s15-modal17-footer">
              <button
                type="button"
                onClick={() => {
                  if (handleMedicines) handleMedicines(activeMeds);
                  setModal17Open(false);
                  setModal18Open(true);
                }}
                className="s15-more-questions-btn"
                aria-label={
                  isEs
                    ? "Continuar a preguntas sobre la vía de administración"
                    : "Continue to administration route questions"
                }
              >
                <span>{isEs ? "Más preguntas >>" : "More Questions >>"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================================
          MODAL 18: Route Administered (WCAG AAA Accessible Dialog)
          ========================================================== */}
      {modal18Open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-18-heading"
          className="s15-modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setModal18Open(false);
              setTimeout(() => lastTriggerRef.current?.focus(), 40);
            }
          }}
        >
          <div className="s15-modal-card">
            <div className="s15-modal-top-bar">
              <h2
                id="modal-18-heading"
                ref={modal18HeadingRef}
                tabIndex={-1}
                className="s15-modal-heading"
              >
                {isEs
                  ? "¿Cómo recibió su hijo el medicamento?"
                  : "Did your child receive the medicine by:"}
              </h2>
              <button
                type="button"
                className="s15-modal-dismiss-btn"
                onClick={() => {
                  setModal18Open(false);
                  setTimeout(() => lastTriggerRef.current?.focus(), 40);
                }}
                aria-label={isEs ? "Cerrar ventana emergente" : "Close dialog"}
              >
                {isEs ? "Cerrar" : "Close"}
              </button>
            </div>

            <div
              className="s15-modal18-row"
              role="radiogroup"
              aria-labelledby="modal-18-heading"
            >
              {ROUTE_OPTIONS.map((opt) => {
                const isChecked = activeRoute === opt.value;
                const label = isEs ? opt.labelEs : opt.labelEn;

                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="radio"
                    aria-checked={isChecked}
                    onClick={() => handleRouteSelect(opt.value)}
                    className={`s15-route-btn${
                      isChecked ? " s15-route-btn--selected" : ""
                    }`}
                  >
                    {label}
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

// Backward-compatibility export matching legacy filename alias
export const Slide16ResolutionScreen = Slide15ResolutionScreen;
export default Slide15ResolutionScreen;
