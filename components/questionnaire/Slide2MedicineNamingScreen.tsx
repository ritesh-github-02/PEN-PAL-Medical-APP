"use client";


import React, { useState, useRef, useEffect } from "react";
export interface Slide2MedicineNamingScreenProps {
 isSpanish?: boolean;
 selected?: string;
 onSelect: (value: string) => void;
 onNext: () => void;
 onBack: () => void;
 loading?: boolean;
 audioSrc?: string;
 stepId?: string;
 locale?: string;
 transcriptText?: string;
 variant?: "auto" | "desktop" | "mobile";
}


export const MEDICINE_OPTIONS_DISPLAY = [
 { value: "Penicillin", labelEn: "Penicillin", labelEs: "Penicilina" },
 { value: "Amoxicillin", labelEn: "Amoxicillin", labelEs: "Amoxicilina" },
 { value: "Pink medicine", labelEn: "“Pink medicine”", labelEs: "“Medicina rosa”" },
 { value: "Amoxicillin Clavulanate", labelEn: "Amoxicillin Clavulanate", labelEs: "Amoxicilina Clavulanato" },
 { value: "Augmentin", labelEn: "Augmentin", labelEs: "Augmentin" },
];


/* Hand-drawn style bubble body + sharp tail matching Slide 2 reference */
const BUBBLE_PATH =
 "M 397.9,283.4 " +
 "C 395.8,284.6 391.2,287.9 385.1,290.7 " +
 "C 379.0,293.4 369.2,297.5 361.3,299.9 " +
 "C 353.4,302.3 345.2,303.8 337.6,305.3 " +
 "C 330.0,306.8 322.6,307.8 315.6,309.0 " +
 "C 308.6,310.2 302.5,312.1 295.5,312.7 " +
 "C 288.5,313.3 280.6,312.4 273.6,312.7 " +
 "C 266.6,313.0 260.2,314.5 253.5,314.5 " +
 "C 246.8,314.5 240.1,313.3 233.4,312.7 " +
 "C 226.7,312.1 220.6,311.4 213.3,310.8 " +
 "C 206.0,310.2 197.2,310.2 189.6,309.0 " +
 "C 182.0,307.8 175.5,305.3 167.6,303.5 " +
 "C 159.7,301.7 150.3,300.8 142.1,298.0 " +
 "C 133.9,295.3 126.8,291.3 118.3,287.0 " +
 "C 109.8,282.7 99.7,277.9 90.9,272.4 " +
 "C 82.1,266.9 73.8,261.1 65.3,254.1 " +
 "C 56.8,247.1 46.8,239.2 39.8,230.3 " +
 "C 32.8,221.5 27.0,211.4 23.3,201.0 " +
 "C 19.6,190.6 18.1,179.0 17.8,168.0 " +
 "C 17.5,157.0 19.1,146.0 21.5,135.0 " +
 "C 23.9,124.0 27.2,111.9 32.4,102.1 " +
 "C 37.6,92.3 44.6,84.0 52.5,76.4 " +
 "C 60.4,68.8 70.5,62.1 79.9,56.3 " +
 "C 89.4,50.5 99.8,45.6 109.2,41.6 " +
 "C 118.7,37.6 127.5,35.2 136.6,32.5 " +
 "C 145.7,29.8 155.5,27.0 164.0,25.2 " +
 "C 172.5,23.4 179.8,22.4 187.7,21.5 " +
 "C 195.6,20.6 203.9,20.3 211.5,19.7 " +
 "C 219.1,19.1 226.4,18.1 233.4,17.8 " +
 "C 240.4,17.5 245.9,17.5 253.5,17.8 " +
 "C 261.1,18.1 271.2,19.1 279.1,19.7 " +
 "C 287.0,20.3 293.7,20.6 301.0,21.5 " +
 "C 308.3,22.4 315.6,24.0 322.9,25.2 " +
 "C 330.2,26.4 337.0,27.0 344.9,28.8 " +
 "C 352.8,30.6 362.0,33.4 370.5,36.1 " +
 "C 379.0,38.9 387.2,41.6 396.0,45.3 " +
 "C 404.8,49.0 414.9,52.9 423.4,58.1 " +
 "C 431.9,63.3 438.7,69.7 447.2,76.4 " +
 "C 455.7,83.1 466.7,90.2 474.6,98.4 " +
 "C 482.5,106.7 490.4,115.8 494.7,125.9 " +
 "C 499.0,136.0 501.1,147.8 500.2,158.8 " +
 "C 499.3,169.8 493.8,181.4 489.2,191.8 " +
 "C 484.6,202.2 480.4,211.0 472.8,221.1 " +
 "C 465.2,231.2 448.4,247.0 443.5,252.2 " +
 "L 485.6,314.5 " +
 "L 397.9,283.4 " +
 "Z";


const SLIDE2_COMPONENT_CSS = `
 /* ------------------------------------------------------------
    Slide 2: WCAG 2.1 / 2.2 Level AAA, WAVE & Karen Accessibility Rules
    ------------------------------------------------------------ */


 .s2-sr-only {
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


 .s2-component-card button:focus-visible,
 .s2-component-card [tabindex="0"]:focus-visible {
   outline: 3px solid #143833 !important;
   outline-offset: 3px !important;
 }


 .s2-heading:focus,
 .s2-heading:focus-visible {
   outline: none !important;
 }


 .s2-component-card {
   position: relative;
   width: 100%;
   max-width: 1000px;
   height: 100%;
   max-height: 100%;
   background-color: #fafdf3;
   border-radius: 28px;
   box-shadow: 0 16px 40px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.04);
   border: 1px solid rgba(120, 165, 155, 0.28);
   display: flex;
   flex-direction: column;
   justify-content: space-between;
   overflow: hidden;
   padding: 24px 38px 20px 38px;
   box-sizing: border-box;
   font-family: "Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
 }


 /* Seamless fill when placed inside an outer app frame (prevents double rectangle / empty bottom canvas) */
 .tablet-mockup-frame .s2-component-card,
 .tablet-screen-inner .s2-component-card,
 .tablet-slide-content .s2-component-card,
 .intervention-frame-outer .s2-component-card {
   border: none !important;
   box-shadow: none !important;
   background-color: transparent !important;
   border-radius: 0 !important;
   max-width: 100% !important;
   width: 100% !important;
   height: 100% !important;
   padding: 24px 38px 20px 38px !important;
 }


 /* 1. Yellow Banner & Heading (WCAG AAA Contrast: #142724 on #feff9f = 14.2:1) */
 .s2-banner-wrap {
   width: 100%;
   max-width: 760px;
   margin: 0 auto 10px auto;
   background-color: #feff9f;
   border: 2px solid #236f7a;
   border-radius: 9999px;
   box-shadow: 0 4px 6px rgba(34, 105, 118, 0.25);
   padding: 10px 24px;
   text-align: center;
   flex-shrink: 0;
 }
 .s2-heading {
   margin: 0;
   font-size: 20px;
   line-height: 1.3;
   font-weight: 700;
   letter-spacing: -0.01em;
   color: #142724;
   outline: none;
 }


 /* 2. Middle Content Area (Keeps checklist & Nurse Anna centered and cohesive at all screen resolutions) */
 .s2-stage-middle {
   flex: 1;
   display: flex;
   align-items: center;
   justify-content: center;
   width: 100%;
   max-width: 820px;
   margin: 0 auto;
   min-height: 0;
   padding: 0 4px;
   gap: 48px;
 }


 .s2-options-col {
   display: flex;
   align-items: center;
   gap: 22px;
   flex: 0 0 auto;
   width: auto;
   max-width: 440px;
 }


 .s2-bottle-wrap {
   flex-shrink: 0;
   width: 90px;
   height: 175px;
   display: flex;
   align-items: center;
   justify-content: center;
 }
 .s2-bottle-img {
   width: 100%;
   height: 100%;
   object-fit: contain;
   filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.08));
   user-select: none;
 }


 /* Radio Group */
 .s2-radiogroup {
   display: flex;
   flex-direction: column;
   gap: 10px;
   flex: 1;
 }


 .s2-option-row {
   display: flex;
   align-items: center;
   gap: 12px;
   min-height: 44px;
   cursor: pointer;
   user-select: none;
   padding: 4px 8px;
   border-radius: 10px;
   transition: background-color 0.12s ease;
 }
 .s2-option-row:hover {
   background-color: rgba(189, 223, 216, 0.3);
 }
 .s2-option-row:focus-within {
   outline: 3px solid #143833 !important;
   outline-offset: 2px !important;
 }


 .s2-checkbox-box {
   width: 28px;
   height: 28px;
   flex-shrink: 0;
   border-radius: 6px;
   border: 2px solid #236f7a;
   background-color: #e8ece9;
   display: flex;
   align-items: center;
   justify-content: center;
   transition: all 0.15s ease;
 }
 .s2-checkbox-box.checked {
   background-color: #144e57;
   border-color: #143833;
   color: #ffffff;
 }


 .s2-option-text {
   font-size: 17.5px;
   line-height: 1.3;
   font-weight: 500;
   color: #142724;
   transition: color 0.12s ease, font-weight 0.12s ease;
   word-break: break-word;
 }
 .s2-option-text.checked {
   font-weight: 700;
   color: #0a1c1a;
 }


 /* Character & Bubble Area */
 .s2-character-col {
   position: relative;
   width: 320px;
   height: 265px;
   flex-shrink: 0;
 }
 .s2-bubble-wrap {
   position: absolute;
   left: 0;
   top: 0;
   width: 245px;
   aspect-ratio: 520 / 340;
   z-index: 5;
   pointer-events: none;
   filter: drop-shadow(2px 3px 0px #1a3532);
 }
 .s2-bubble-svg {
   position: absolute;
   inset: 0;
   width: 100%;
   height: 100%;
   overflow: visible;
 }
 .s2-bubble-text-wrap {
   position: absolute;
   top: 45%;
   left: 48%;
   transform: translate(-50%, -50%);
   width: 78%;
   max-width: 200px;
   display: flex;
   flex-direction: column;
   align-items: center;
   justify-content: center;
   text-align: center;
   pointer-events: none;
 }
 .s2-bubble-text {
   margin: 0;
   padding: 0;
   font-size: 13.5px;
   line-height: 1.42;
   font-weight: 600;
   color: #142724;
   text-align: center;
 }


 /* Nurse Anna (Post-Slide 1 Decorative Character) */
 .s2-nurse-wrap {
   position: absolute;
   right: 8px;
   bottom: 2px;
   width: 105px;
   height: 195px;
   z-index: 6;
   pointer-events: none;
   display: flex;
   align-items: flex-end;
   justify-content: center;
 }
 .s2-nurse-img {
   width: 100%;
   height: 100%;
   object-fit: contain;
   user-select: none;
   filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.08));
 }


 /* ------------------------------------------------------------
    Bottom Bar: Centered Navigation & Bottom-Right Audio Controls
    ------------------------------------------------------------ */
 .s2-bottom-bar {
   width: 100%;
   display: flex;
   align-items: center;
   justify-content: space-between;
   flex-shrink: 0;
   padding-top: 8px;
   position: relative;
   z-index: 20;
 }


 .s2-spacer-side {
   width: 110px;
   flex-shrink: 0;
 }


 .s2-nav-center {
   display: flex;
   align-items: center;
   gap: 14px;
   margin: 0 auto;
   flex-shrink: 0;
 }


 .s2-btn-nav {
   border-radius: 9999px;
   font-weight: 700;
   border: 1.5px solid transparent;
   cursor: pointer;
   display: inline-flex;
   align-items: center;
   justify-content: center;
   box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
   min-height: 48px;
   min-width: 98px;
   font-size: 16px;
   padding: 0 24px;
   transition: transform 0.1s ease, background-color 0.15s ease;
 }
 .s2-btn-nav:hover:not(:disabled) {
   transform: translateY(-1px);
   box-shadow: 0 4px 8px rgba(0, 0, 0, 0.14);
 }
 .s2-btn-nav:active:not(:disabled) {
   transform: translateY(1px);
   box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
 }
 .s2-btn-nav:disabled {
   opacity: 0.55;
   cursor: not-allowed;
   box-shadow: none;
 }


 .s2-btn-back {
   background-color: #bddfd8;
   color: #11332e;
   border-color: #78a59b;
 }
 .s2-btn-back:hover:not(:disabled) {
   background-color: #a8d5cc;
 }


 .s2-btn-next {
   background-color: #fdee8e;
   color: #1a2624;
   border-color: #c8b746;
 }
 .s2-btn-next:hover:not(:disabled) {
   background-color: #f5e478;
 }


 /* Audio Narration & CC Controls */
 .s2-audio-controls {
   display: flex;
   align-items: center;
   gap: 6px;
   color: #144e57;
   justify-content: flex-end;
 }
 .s2-audio-btn {
   background: transparent;
   border: none;
   cursor: pointer;
   color: #144e57;
   display: flex;
   align-items: center;
   justify-content: center;
   padding: 6px;
   min-width: 44px;
   min-height: 44px;
   border-radius: 8px;
   transition: transform 0.12s ease, opacity 0.15s ease;
 }
 .s2-audio-btn:hover {
   transform: scale(1.08);
   opacity: 0.85;
 }


 /* Closed Captions Panel (WCAG 1.2.2 Captions) */
 .s2-captions-panel {
   background: #143833;
   color: #ffffff;
   border: 1.5px solid #bddfd8;
   border-radius: 12px;
   padding: 8px 14px;
   margin-top: 6px;
   margin-bottom: 6px;
   display: flex;
   align-items: flex-start;
   gap: 10px;
   box-shadow: 0 4px 12px rgba(0, 0, 0, 0.18);
   z-index: 15;
 }
 .s2-captions-tag {
   background: #fdee8e;
   color: #1a2624;
   font-size: 11px;
   font-weight: 800;
   text-transform: uppercase;
   padding: 2px 6px;
   border-radius: 4px;
   flex-shrink: 0;
   letter-spacing: 0.05em;
 }
 .s2-captions-text {
   font-size: 13.5px;
   line-height: 1.4;
   margin: 0;
   font-weight: 500;
   color: #ffffff;
 }


 /* -------------------------------------------------------------
    Mobile Layout (.is-mobile or screen width < 768px)
    Refined UX/UI for 9:16 vertical ratio:
    - Clear visual hierarchy & generous touch targets (Fitts's Law)
    - Optimal reading flow: Header -> Character cue -> Options -> Actions
    - Polished contrast, consistent spacing & zero clipped elements
    ------------------------------------------------------------- */
 .s2-component-card.is-mobile {
   aspect-ratio: auto !important;
   max-height: none !important;
   height: 100% !important;
   background-color: transparent !important;
   border: none !important;
   box-shadow: none !important;
   border-radius: 0 !important;
   padding: 14px 16px 12px 16px !important;
   display: flex !important;
   flex-direction: column !important;
   justify-content: space-between !important;
   overflow-y: auto !important;
   gap: 10px !important;
 }
 .s2-component-card.is-mobile .s2-banner-wrap {
   width: 100% !important;
   max-width: 100% !important;
   border-radius: 20px !important;
   padding: 10px 16px !important;
   margin: 0 0 4px 0 !important;
   box-shadow: 0 2px 6px rgba(35, 111, 122, 0.2) !important;
   flex-shrink: 0 !important;
 }
 .s2-component-card.is-mobile .s2-heading {
   font-size: 15px !important;
   line-height: 1.35 !important;
   text-align: center !important;
 }


 .s2-component-card.is-mobile .s2-stage-middle {
   flex: 1 1 auto !important;
   display: flex !important;
   flex-direction: column !important;
   align-items: center !important;
   justify-content: center !important;
   gap: 16px !important;
   width: 100% !important;
   max-width: 100% !important;
   padding: 0 !important;
   min-height: 0 !important;
 }


 /* 1. Character Area: Nurse Anna + Speech Bubble side-by-side */
 .s2-component-card.is-mobile .s2-character-col {
   order: 1 !important;
   position: relative !important;
   width: 100% !important;
   max-width: 340px !important;
   height: auto !important;
   display: flex !important;
   flex-direction: row !important;
   align-items: flex-end !important;
   justify-content: center !important;
   gap: 8px !important;
   margin: 0 auto !important;
   padding: 0 4px !important;
   flex-shrink: 0 !important;
 }
 .s2-component-card.is-mobile .s2-bubble-wrap {
   position: relative !important;
   left: auto !important;
   top: auto !important;
   width: 210px !important;
   max-width: 68% !important;
   aspect-ratio: 520 / 340 !important;
   flex-shrink: 1 !important;
   margin-bottom: 12px !important;
   filter: drop-shadow(0 3px 6px rgba(20, 56, 51, 0.12)) !important;
 }
 .s2-component-card.is-mobile .s2-bubble-text-wrap {
   top: 45% !important;
   left: 48% !important;
   width: 82% !important;
   max-width: 175px !important;
 }
 .s2-component-card.is-mobile .s2-bubble-text {
   font-size: 11.5px !important;
   line-height: 1.35 !important;
   font-weight: 600 !important;
   color: #143833 !important;
 }
 .s2-component-card.is-mobile .s2-nurse-wrap {
   position: relative !important;
   right: auto !important;
   bottom: auto !important;
   width: 72px !important;
   height: 138px !important;
   flex-shrink: 0 !important;
   display: flex !important;
   align-items: flex-end !important;
   justify-content: center !important;
 }
 .s2-component-card.is-mobile .s2-nurse-img {
   max-height: 100% !important;
   width: auto !important;
   object-fit: contain !important;
   filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1)) !important;
 }


 /* 2. Options Area: Bottle hidden on mobile for perfect horizontal symmetry and centered checklist */
 .s2-component-card.is-mobile .s2-options-col {
   order: 2 !important;
   display: flex !important;
   flex-direction: column !important;
   align-items: center !important;
   justify-content: center !important;
   width: 100% !important;
   max-width: 320px !important;
   margin: 0 auto !important;
   margin-bottom: 14px !important;
   flex-shrink: 0 !important;
 }
 .s2-component-card.is-mobile .s2-bottle-wrap {
   display: none !important;
 }
 .s2-component-card.is-mobile .s2-radiogroup {
   width: 100% !important;
   display: flex !important;
   flex-direction: column !important;
   gap: 8px !important;
 }
 .s2-component-card.is-mobile .s2-option-row {
   width: 100% !important;
   min-height: 44px !important;
   gap: 12px !important;
   padding: 8px 14px !important;
   border-radius: 12px !important;
   border: 1.5px solid rgba(35, 111, 122, 0.2) !important;
   background-color: rgba(255, 255, 255, 0.75) !important;
   box-shadow: 0 1px 3px rgba(20, 56, 51, 0.06) !important;
   transition: all 0.15s ease !important;
   justify-content: flex-start !important;
 }
 .s2-component-card.is-mobile .s2-option-row:hover,
 .s2-component-card.is-mobile .s2-option-row:active {
   background-color: rgba(189, 223, 216, 0.4) !important;
   border-color: #236f7a !important;
   transform: translateY(-1px) !important;
 }
 .s2-component-card.is-mobile .s2-checkbox-box {
   width: 22px !important;
   height: 22px !important;
   border-radius: 5px !important;
   border: 2px solid #236f7a !important;
   flex-shrink: 0 !important;
 }
 .s2-component-card.is-mobile .s2-checkbox-box.checked {
   background-color: #144e57 !important;
   border-color: #143833 !important;
 }
 .s2-component-card.is-mobile .s2-option-text {
   font-size: 14.5px !important;
   line-height: 1.3 !important;
   font-weight: 600 !important;
   color: #143833 !important;
 }


 /* 3. Bottom Controls Bar: Two-tier stack with Play/CC ABOVE and Back/Next BELOW */
 .s2-component-card.is-mobile .s2-bottom-bar {
   width: 100% !important;
   max-width: 320px !important;
   display: flex !important;
   flex-direction: column !important;
   align-items: center !important;
   justify-content: center !important;
   gap: 30px !important;
   padding-top: 10px !important;
   padding-bottom: calc(10px + env(safe-area-inset-bottom, 0px)) !important;
   margin: 0 auto !important;
   flex-shrink: 0 !important;
 }
 .s2-component-card.is-mobile .s2-spacer-side {
   display: none !important;
 }
 /* Tier 1 (TOP): CC & Audio player nicely centered */
 .s2-component-card.is-mobile .s2-audio-controls {
   order: 1 !important;
   width: auto !important;
   display: flex !important;
   align-items: center !important;
   justify-content: center !important;
   gap: 8px !important;
   margin: 0 auto !important;
   background-color: transparent !important;
   padding: 0 !important;
   border: none !important;
   box-shadow: none !important;
 }
 .s2-component-card.is-mobile .s2-audio-btn {
   min-width: 44px !important;
   min-height: 44px !important;
   padding: 4px !important;
   display: flex !important;
   align-items: center !important;
   justify-content: center !important;
 }
 .s2-component-card.is-mobile .s2-audio-btn svg {
   height: 28px !important;
   width: auto !important;
   transition: transform 0.12s ease !important;
 }
 .s2-component-card.is-mobile .s2-audio-btn:hover svg,
 .s2-component-card.is-mobile .s2-audio-btn:active svg {
   transform: scale(0.96) !important;
 }
 /* Tier 2 (BOTTOM): Back & Next full-width side-by-side with generous gap */
 .s2-component-card.is-mobile .s2-nav-center {
   order: 2 !important;
   display: flex !important;
   align-items: center !important;
   justify-content: space-between !important;
   gap: 14px !important;
   width: 100% !important;
   margin: 0 !important;
 }
 .s2-component-card.is-mobile .s2-btn-nav {
   flex: 1 1 0% !important;
   min-height: 48px !important;
   height: 48px !important;
   font-size: 16px !important;
   font-weight: 700 !important;
   padding: 0 16px !important;
   border-radius: 9999px !important;
   box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12) !important;
   text-align: center !important;
 }


 @media (max-width: 767px) {
   .s2-component-card {
     aspect-ratio: auto;
     max-height: none;
     height: 100%;
     background-color: transparent;
     border: none;
     box-shadow: none;
     border-radius: 0;
     padding: 14px 16px 12px 16px;
     display: flex;
     flex-direction: column;
     justify-content: space-between;
     overflow-y: auto;
     gap: 10px;
   }
   .s2-banner-wrap {
     width: 100%;
     max-width: 100%;
     border-radius: 20px;
     padding: 10px 16px;
     margin: 0 0 4px 0;
     box-shadow: 0 2px 6px rgba(35, 111, 122, 0.2);
     flex-shrink: 0;
   }
   .s2-heading {
     font-size: 15px;
     line-height: 1.35;
     text-align: center;
   }
   .s2-stage-middle {
     flex: 1 1 auto;
     display: flex;
     flex-direction: column;
     align-items: center;
     justify-content: center;
     gap: 16px;
     width: 100%;
     max-width: 100%;
     padding: 0;
     min-height: 0;
   }
   /* 1. Character Area */
   .s2-character-col {
     order: 1;
     position: relative;
     width: 100%;
     max-width: 340px;
     height: auto;
     display: flex;
     flex-direction: row;
     align-items: flex-end;
     justify-content: center;
     gap: 8px;
     margin: 0 auto;
     padding: 0 4px;
     flex-shrink: 0;
   }
   .s2-bubble-wrap {
     position: relative;
     left: auto;
     top: auto;
     width: 210px;
     max-width: 68%;
     aspect-ratio: 520 / 340;
     flex-shrink: 1;
     margin-bottom: 12px;
     filter: drop-shadow(0 3px 6px rgba(20, 56, 51, 0.12));
   }
   .s2-bubble-text-wrap {
     top: 45%;
     left: 48%;
     width: 82%;
     max-width: 175px;
   }
   .s2-bubble-text {
     font-size: 11.5px;
     line-height: 1.35;
     font-weight: 600;
     color: #143833;
   }
   .s2-nurse-wrap {
     position: relative;
     right: auto;
     bottom: auto;
     width: 72px;
     height: 138px;
     flex-shrink: 0;
     display: flex;
     align-items: flex-end;
     justify-content: center;
   }
   .s2-nurse-img {
     max-height: 100%;
     width: auto;
     object-fit: contain;
     filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
   }
   /* 2. Options Area */
   .s2-options-col {
     order: 2;
     display: flex;
     flex-direction: column;
     align-items: center;
     justify-content: center;
     width: 100%;
     max-width: 320px;
     margin: 0 auto;
     margin-bottom: 14px;
     flex-shrink: 0;
   }
   .s2-bottle-wrap {
     display: none;
   }
   .s2-radiogroup {
     width: 100%;
     display: flex;
     flex-direction: column;
     gap: 8px;
   }
   .s2-option-row {
     width: 100%;
     min-height: 44px;
     gap: 12px;
     padding: 8px 14px;
     border-radius: 12px;
     border: 1.5px solid rgba(35, 111, 122, 0.2);
     background-color: rgba(255, 255, 255, 0.75);
     box-shadow: 0 1px 3px rgba(20, 56, 51, 0.06);
     transition: all 0.15s ease;
     justify-content: flex-start;
   }
   .s2-option-row:hover,
   .s2-option-row:active {
     background-color: rgba(189, 223, 216, 0.4);
     border-color: #236f7a;
     transform: translateY(-1px);
   }
   .s2-checkbox-box {
     width: 22px;
     height: 22px;
     border-radius: 5px;
     border: 2px solid #236f7a;
     flex-shrink: 0;
   }
   .s2-checkbox-box.checked {
     background-color: #144e57;
     border-color: #143833;
   }
   .s2-option-text {
     font-size: 14.5px;
     line-height: 1.3;
     font-weight: 600;
     color: #143833;
   }
   /* 3. Bottom Controls: Two-tier layout with Play/CC ABOVE and Back/Next BELOW */
   .s2-bottom-bar {
     width: 100%;
     max-width: 320px;
     display: flex;
     flex-direction: column;
     align-items: center;
     justify-content: center;
     gap: 30px;
     padding-top: 10px;
     padding-bottom: calc(10px + env(safe-area-inset-bottom, 0px));
     margin: 0 auto;
     flex-shrink: 0;
   }
   .s2-spacer-side {
     display: none;
   }
   .s2-audio-controls {
     order: 1;
     width: auto;
     display: flex;
     align-items: center;
     justify-content: center;
     gap: 8px;
     margin: 0 auto;
     background-color: transparent;
     padding: 0;
     border: none;
     box-shadow: none;
   }
   .s2-audio-btn {
     min-width: 44px;
     min-height: 44px;
     padding: 4px;
     display: flex;
     align-items: center;
     justify-content: center;
   }
   .s2-audio-btn svg {
     height: 28px !important;
     width: auto !important;
     transition: transform 0.12s ease;
   }
   .s2-audio-btn:hover svg,
   .s2-audio-btn:active svg {
     transform: scale(0.96);
   }
   .s2-nav-center {
     order: 2;
     display: flex;
     align-items: center;
     justify-content: space-between;
     gap: 14px;
     width: 100%;
     margin: 0;
   }
   .s2-btn-nav {
     flex: 1 1 0%;
     min-height: 48px;
     height: 48px;
     font-size: 16px;
     font-weight: 700;
     padding: 0 16px;
     border-radius: 9999px;
     box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
     text-align: center;
   }
 }


 /* Prefers Reduced Motion (WCAG 2.3.3) */
 @media (prefers-reduced-motion: reduce) {
   *, *::before, *::after {
     animation-duration: 0.001ms !important;
     animation-iteration-count: 1 !important;
     transition-duration: 0.001ms !important;
     scroll-behavior: auto !important;
   }
 }
`;


export function Slide2MedicineNamingScreen({
 isSpanish = false,
 selected,
 onSelect,
 onNext,
 onBack,
 loading = false,
 audioSrc,
 stepId = "slide2_naming",
 locale,
 transcriptText,
 variant = "auto",
}: Slide2MedicineNamingScreenProps) {
 const [audioPlaying, setAudioPlaying] = useState<boolean>(false);
 const [showCaptions, setShowCaptions] = useState<boolean>(false);
 const [liveAnnouncement, setLiveAnnouncement] = useState<string>("");


 const headingRef = useRef<HTMLHeadingElement | null>(null);
 const audioRef = useRef<HTMLAudioElement | null>(null);


 const activeLocale = locale || (isSpanish ? "es" : "en");
 const isEs = activeLocale.startsWith("es") || isSpanish;


 // Programmatic focus on mount per Karen's review (WCAG 2.4.3 Focus Order)
 useEffect(() => {
   headingRef.current?.focus({ preventScroll: true });
 }, []);


 // Keyboard Escape listener for Closed Captions dismissal (WCAG 1.4.13)
 useEffect(() => {
   const handleKeyDown = (e: KeyboardEvent) => {
     if (e.key === "Escape" && showCaptions) {
       setShowCaptions(false);
       setLiveAnnouncement(isEs ? "Subtítulos ocultados" : "Closed captions dismissed");
     }
   };
   window.addEventListener("keydown", handleKeyDown);
   return () => window.removeEventListener("keydown", handleKeyDown);
 }, [showCaptions, isEs]);


 const nextEnabled = !!selected && !loading;


 const handleOptionSelect = (val: string, label: string) => {
   onSelect(val);
   setLiveAnnouncement(
     isEs
       ? `Seleccionado: ${label}`
       : `Selected: ${label}`
   );
 };


 const handleKeyDown = (e: React.KeyboardEvent, currentIndex: number) => {
   if (e.key === "ArrowDown" || e.key === "ArrowRight") {
     e.preventDefault();
     const nextIndex = (currentIndex + 1) % MEDICINE_OPTIONS_DISPLAY.length;
     const nextOpt = MEDICINE_OPTIONS_DISPLAY[nextIndex];
     handleOptionSelect(nextOpt.value, isEs ? nextOpt.labelEs : nextOpt.labelEn);
   } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
     e.preventDefault();
     const prevIndex = (currentIndex - 1 + MEDICINE_OPTIONS_DISPLAY.length) % MEDICINE_OPTIONS_DISPLAY.length;
     const prevOpt = MEDICINE_OPTIONS_DISPLAY[prevIndex];
     handleOptionSelect(prevOpt.value, isEs ? prevOpt.labelEs : prevOpt.labelEn);
   }
 };


 const effectiveTranscript =
   transcriptText ||
   (isEs
     ? "¡Primero hablemos de la penicilina. ¡Tiene muchos nombres! ¡Seleccione cómo lo llama! Usaremos el nombre que elija durante nuestro tiempo juntos."
     : "Let's first talk about penicillin. It has lots of names! Select what you call it! We'll use the name you choose during our time together.");


 const effectiveAudioSrc =
   audioSrc ||
   (isEs
     ? "/audio/exported/slide2_naming_es.mp3"
     : "/audio/exported/slide2_naming_en.mp3");


 // Synchronize audio playback state with audio element events and SpeechSynthesis
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


 const toggleAudio = () => {
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
 };


 const toggleCaptions = () => {
   const next = !showCaptions;
   setShowCaptions(next);
   setLiveAnnouncement(
     next
       ? isEs
         ? "Subtítulos mostrados"
         : "Closed captions displayed"
       : isEs
       ? "Subtítulos ocultados"
       : "Closed captions hidden"
   );
 };


 const variantClass = variant === "mobile" ? " is-mobile" : variant === "desktop" ? " is-desktop" : "";


 return (
   <section
     id="slide-content"
     role="region"
     aria-roledescription="slide"
     aria-labelledby="slide2-heading"
     lang={isEs ? "es" : "en"}
     className={`s2-component-card${variantClass}`}
   >
     <style dangerouslySetInnerHTML={{ __html: SLIDE2_COMPONENT_CSS }} />


     {/* Screen Reader Live Region for WCAG 4.1.3 */}
     <div className="s2-sr-only" role="status" aria-live="polite" aria-atomic="true">
       {liveAnnouncement}
     </div>


     {/* Hidden audio element for narration */}
     <audio
       ref={audioRef}
       src={effectiveAudioSrc}
       preload="metadata"
       className="s2-sr-only"
       aria-hidden="true"
     />


     {/* 1. Accessible Banner & Title (Level AAA Contrast 14.2:1) */}
     <div className="s2-banner-wrap">
       <h1
         id="slide2-heading"
         ref={headingRef}
         tabIndex={-1}
         className="s2-heading"
       >
         {isEs
           ? "¡Primero hablemos de la penicilina. ¡Tiene muchos nombres!"
           : "Let's first talk about penicillin. It has lots of names!"}
       </h1>
     </div>


     {/* 2. Middle Interactive Content Area */}
     <div className="s2-stage-middle">
       {/* Left Column: Pink Bottle + Accessible Radio Options */}
       <div className="s2-options-col">
         {/* Pink Bottle (WCAG 1.1.1 Non-text Content) */}
         <div className="s2-bottle-wrap">
           <img
             src="/images/amoxicillin-bottle.png"
             alt={isEs ? "Frasco de medicina rosa" : "Pink medicine bottle"}
             className="s2-bottle-img"
             draggable={false}
           />
         </div>


         {/* Accessible Radio Group (WCAG 1.3.1 & 2.1.1) */}
         <div
           className="s2-radiogroup"
           role="radiogroup"
           aria-label={
             isEs
               ? "Seleccione el nombre que usa para el medicamento"
               : "Select what you call the medicine"
           }
         >
           {MEDICINE_OPTIONS_DISPLAY.map((opt, idx) => {
             const isChecked = selected === opt.value;
             const label = isEs ? opt.labelEs : opt.labelEn;


             return (
               <label
                 key={opt.value}
                 className="s2-option-row"
                 onKeyDown={(e) => handleKeyDown(e, idx)}
               >
                 <input
                   type="radio"
                   name="medicine_selection"
                   value={opt.value}
                   checked={isChecked}
                   onChange={() => handleOptionSelect(opt.value, label)}
                   className="s2-sr-only"
                 />
                 <span
                   className={`s2-checkbox-box ${isChecked ? "checked" : ""}`}
                   aria-hidden="true"
                 >
                   {isChecked && (
                     <svg
                       width="18"
                       height="18"
                       viewBox="0 0 24 24"
                       fill="none"
                       stroke="currentColor"
                       strokeWidth="3.5"
                       strokeLinecap="round"
                       strokeLinejoin="round"
                       aria-hidden="true"
                       focusable="false"
                     >
                       <polyline points="20 6 9 17 4 12" />
                     </svg>
                   )}
                 </span>
                 <span className={`s2-option-text ${isChecked ? "checked" : ""}`}>
                   {label}
                 </span>
               </label>
             );
           })}
         </div>
       </div>


       {/* Right Column: Speech Bubble + Nurse Anna */}
       <div className="s2-character-col">
         {/* Hand-drawn SVG Speech Bubble */}
         <div
           className="s2-bubble-wrap"
           role="group"
           aria-label={isEs ? "Instrucción de selección" : "Selection instruction"}
         >
           <svg
             className="s2-bubble-svg"
             viewBox="0 0 520 340"
             fill="none"
             aria-hidden="true"
             focusable="false"
           >
             <defs>
               <pattern id="s2-bubble-dots" width="18" height="18" patternUnits="userSpaceOnUse">
                 <circle cx="9" cy="9" r="0.8" fill="#cadada" opacity="0.65" />
               </pattern>
             </defs>


             {/* 3D shadow underneath */}
             <path
               d={BUBBLE_PATH}
               transform="translate(4, 5)"
               fill="#1a3532"
               stroke="#1a3532"
               strokeWidth="4"
               strokeLinecap="round"
               strokeLinejoin="round"
             />


             {/* White bubble body */}
             <path d={BUBBLE_PATH} fill="#ffffff" />


             {/* Subtle paper dot grid texture */}
             <path d={BUBBLE_PATH} fill="url(#s2-bubble-dots)" />


             {/* Soft teal outline */}
             <path
               d={BUBBLE_PATH}
               fill="none"
               stroke="#8ebfbb"
               strokeWidth="5"
               strokeLinecap="round"
               strokeLinejoin="round"
             />
           </svg>


           <div className="s2-bubble-text-wrap">
             <p className="s2-bubble-text">
               {isEs ? (
                 <>
                   ¡Seleccione cómo lo llama!<br />
                   Usaremos el nombre que elija<br />
                   durante nuestro tiempo juntos.
                 </>
               ) : (
                 <>
                   Select what you call it! We&apos;ll<br />
                   use the name you choose<br />
                   during our time together.
                 </>
               )}
             </p>
           </div>
         </div>


         {/* Nurse Anna (Decorative after Slide 1 per Karen & Eileen's Rule) */}
         <div className="s2-nurse-wrap" aria-hidden="true">
           <img
             src="/images/nurse-anna.png"
             alt=""
             className="s2-nurse-img"
             draggable={false}
           />
         </div>
       </div>
     </div>


     {/* Closed Caption Drawer (WCAG 1.2.2 Captions) */}
     {showCaptions && (
       <div
         className="s2-captions-panel"
         role="region"
         aria-label={isEs ? "Subtítulos de narración" : "Closed captions"}
       >
         <span className="s2-captions-tag" aria-hidden="true">
           CC
         </span>
         <p className="s2-captions-text">
           {effectiveTranscript}
         </p>
       </div>
     )}


     {/* 3. Bottom Navigation & Audio Controls (WCAG 2.4.1 Toolbar) */}
     <footer
       className="s2-bottom-bar"
       role="toolbar"
       aria-label={isEs ? "Controles de navegación y audio" : "Slide navigation and media controls"}
     >
       <div className="s2-spacer-side" aria-hidden="true" />


       {/* Centered Back & Next Navigation with 44px+ touch targets */}
       <nav
         className="s2-nav-center"
         aria-label={isEs ? "Navegación de diapositiva" : "Slide pagination"}
       >
         <button
           type="button"
           onClick={onBack}
           disabled={loading}
           className="s2-btn-nav s2-btn-back"
           aria-label={isEs ? "Volver a la diapositiva anterior" : "Back to previous slide"}
         >
           {isEs ? "Atrás" : "Back"}
         </button>
         <button
           type="button"
           onClick={onNext}
           disabled={!nextEnabled}
           aria-disabled={!nextEnabled}
           className="s2-btn-nav s2-btn-next"
           aria-label={isEs ? "Continuar a la siguiente diapositiva" : "Next slide"}
         >
           {loading ? "..." : isEs ? "Siguiente" : "Next"}
         </button>
       </nav>


       {/* Audio narration & CC controls */}
       <div className="s2-audio-controls s2-spacer-side">
         <button
           type="button"
           className="s2-audio-btn"
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
             viewBox="0 0 40 36"
             fill="none"
             xmlns="http://www.w3.org/2000/svg"
             aria-hidden="true"
             focusable="false"
           >
             <path
               d="M 8.5 5.5 C 5.5 5.5 4 7.2 4 11 V 20 C 4 23.8 5.5 25.5 8.5 25.5 H 12 C 13 25.5 14 26.3 14.7 27.5 L 16.5 30.5 C 17.3 31.7 18.7 31.7 19.5 30.5 L 21.3 27.5 C 22 26.3 23 25.5 24 25.5 H 31.5 C 34.5 25.5 36 23.8 36 20 V 11 C 36 7.2 34.5 5.5 31.5 5.5 Z"
               stroke="currentColor"
               strokeWidth="2.2"
               strokeLinecap="round"
               strokeLinejoin="round"
               fill={showCaptions ? "currentColor" : "none"}
             />
             <text
               x="20"
               y="15.5"
               textAnchor="middle"
               dominantBaseline="central"
               fill={showCaptions ? "#ffffff" : "currentColor"}
               fontSize="13"
               fontWeight="700"
               fontFamily="ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
               letterSpacing="0.3px"
             >
               CC
             </text>
           </svg>
         </button>


         <button
           type="button"
           className="s2-audio-btn"
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
               width="50"
               height="36"
               viewBox="0 0 50 36"
               fill="none"
               xmlns="http://www.w3.org/2000/svg"
               aria-hidden="true"
               focusable="false"
             >
               <path
                 d="M 4.5 8.5 C 4.5 5.5 6.8 4.2 9.5 5.8 L 28 16.2 C 29.8 17.2 29.8 18.8 28 19.8 L 9.5 30.2 C 6.8 31.8 4.5 30.5 4.5 27.5 Z"
                 stroke="currentColor"
                 strokeWidth="2.2"
                 strokeLinejoin="round"
                 fill="none"
               />
               <line x1="11.5" y1="13" x2="11.5" y2="23" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
               <line x1="16.5" y1="13" x2="16.5" y2="23" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
               <path
                 d="M 33 11 C 37 13.5 37 22.5 33 25"
                 stroke="currentColor"
                 strokeWidth="2.2"
                 strokeLinecap="round"
               />
               <path
                 d="M 38.5 6.5 C 44.5 10.5 44.5 25.5 38.5 29.5"
                 stroke="currentColor"
                 strokeWidth="2.2"
                 strokeLinecap="round"
               />
             </svg>
           ) : (
             <svg
               width="50"
               height="36"
               viewBox="0 0 50 36"
               fill="none"
               xmlns="http://www.w3.org/2000/svg"
               aria-hidden="true"
               focusable="false"
             >
               <path
                 d="M 4.5 8.5 C 4.5 5.5 6.8 4.2 9.5 5.8 L 28 16.2 C 29.8 17.2 29.8 18.8 28 19.8 L 9.5 30.2 C 6.8 31.8 4.5 30.5 4.5 27.5 Z"
                 stroke="currentColor"
                 strokeWidth="2.2"
                 strokeLinejoin="round"
                 fill="none"
               />
               <text
                 x="14.8"
                 y="17.2"
                 textAnchor="middle"
                 dominantBaseline="central"
                 fill="currentColor"
                 fontSize="8"
                 fontWeight="700"
                 fontFamily="ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                 letterSpacing="0.1px"
               >
                 play
               </text>
               <path
                 d="M 33 11 C 37 13.5 37 22.5 33 25"
                 stroke="currentColor"
                 strokeWidth="2.2"
                 strokeLinecap="round"
               />
               <path
                 d="M 38.5 6.5 C 44.5 10.5 44.5 25.5 38.5 29.5"
                 stroke="currentColor"
                 strokeWidth="2.2"
                 strokeLinecap="round"
               />
             </svg>
           )}
         </button>
       </div>
     </footer>
   </section>
 );
}


export default Slide2MedicineNamingScreen;