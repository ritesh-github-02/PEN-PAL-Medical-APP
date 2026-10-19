"use client";

import React, { useRef, useEffect, useState } from "react";
import { Printer, Download, Loader2 } from "lucide-react";
import { generateAssessmentPDF } from "@/lib/generate-pdf";
import { formatAssessmentData } from "@/lib/format-assessment";
import { toPng } from "html-to-image";
import { submitAnswer, completeQuestionnaire } from "./actions";

const SLIDE18_CSS = `
/* ==========================================================
   Slide18SummaryScreen – Pixel-Perfect Styles Matching Target UI (p18_4.png)
   ========================================================== */

.s18-root,
.s18-root *,
.s18-root *::before,
.s18-root *::after {
  box-sizing: border-box;
}

.s18-root {
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
  padding: 0.8rem 2.2rem 0.55rem 2.2rem;
  overflow: hidden;
  gap: clamp(0.75rem, 2vh, 1.25rem);
}

/* Centered Content Container */
.s18-content {
  width: 100%;
  max-width: 730px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  flex-shrink: 0;
}

/* "Action Steps for Parents" Yellow Badge - Enlarged to match Figma */
.s18-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: #fff677;
  border: 2px solid #142724;
  border-radius: 18px;
  padding: 0.75rem 2.2rem;
  box-shadow: 2.5px 3.5px 0px #1a3532;
  margin-bottom: 0.85rem;
}

.s18-badge-title {
  font-size: 1.65rem;
  font-weight: 800;
  letter-spacing: -0.015em;
  color: #142724;
  line-height: 1.2;
  margin: 0;
  outline: none;
}

.s18-badge-title:focus-visible {
  box-shadow: 0 0 0 2px #236f7a;
}

/* Numbered Steps Section */
.s18-steps-list {
  display: flex;
  flex-direction: column;
  gap: 0.22rem;
  width: 100%;
  margin-bottom: 0.5rem;
}

.s18-step-line {
  font-size: 0.88rem;
  font-weight: 600;
  color: #142724;
  line-height: 1.28;
  margin: 0;
  text-align: left;
}

.s18-quote-line {
  font-size: 0.84rem;
  font-weight: 500;
  color: #142724;
  line-height: 1.28;
  margin: 0;
  text-align: left;
}

.s18-quote-text {
  font-style: italic;
}

/* Summary Table (Exact replica of Spec p18_4.png) */
.s18-table-container {
  width: 100%;
  max-width: 730px;
  border: 1px solid #90b3ab;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(20, 50, 40, 0.05);
  flex-shrink: 0;
}

.s18-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.s18-table tr {
  border-bottom: 1px solid #90b3ab;
}

.s18-table tr:last-child {
  border-bottom: none;
}

.s18-table-label {
  width: 45%;
  background-color: #b0cdc7;
  color: #142724;
  font-size: 0.82rem;
  font-weight: 500;
  line-height: 1.25;
  padding: 0.28rem 0.72rem;
  border-right: 1px solid #90b3ab;
  vertical-align: middle;
}

.s18-table-value {
  width: 55%;
  background-color: #ebf4f1;
  color: #142724;
  font-size: 0.82rem;
  font-weight: 450;
  line-height: 1.25;
  padding: 0.28rem 0.72rem;
  vertical-align: middle;
}

/* Bottom Navigation Bar */
.s18-nav {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.25rem;
  width: 100%;
  margin: 0;
  padding: 0;
  flex-shrink: 0;
}

.s18-btn {
  padding: 0.38rem 1.35rem;
  min-height: 38px;
  border-radius: 9999px;
  font-size: 0.92rem;
  font-weight: 600;
  color: #143833;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  outline: none;
  cursor: pointer;
  border: 1px solid #91b5ae;
  background-color: #adcac4;
  transition: all 0.15s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  white-space: nowrap;
}

.s18-btn-icon {
  width: 1.05rem;
  height: 1.05rem;
  flex-shrink: 0;
  stroke-width: 2.2;
}

.s18-btn:hover {
  background-color: #9cbdb6;
  transform: translateY(-1px);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.12);
}

.s18-btn:active {
  transform: scale(0.97);
}

.s18-btn:focus-visible {
  box-shadow: 0 0 0 3px #236f7a;
}



/* Print-only elements hidden on screen */
.s18-print-header,
.s18-print-footer {
  display: none;
}

/* Responsive Scaling */
@media (max-height: 640px), (max-width: 768px) {
  .s18-root {
    padding: 0.6rem 1.5rem 0.35rem 1.5rem;
  }
  .s18-badge {
    padding: 0.55rem 1.6rem;
    margin-bottom: 0.55rem;
    border-radius: 16px;
  }
  .s18-badge-title {
    font-size: 1.35rem;
  }
  .s18-steps-list {
    gap: 0.18rem;
    margin-bottom: 0.35rem;
  }
  .s18-step-line {
    font-size: 0.82rem;
  }
  .s18-quote-line {
    font-size: 0.78rem;
  }
  .s18-table-label,
  .s18-table-value {
    font-size: 0.76rem;
    padding: 0.22rem 0.55rem;
  }
  .s18-nav {
    margin-top: 0.35rem;
    gap: 0.6rem !important;
    flex-wrap: wrap !important;
  }
  .s18-btn {
    min-height: 34px;
    padding: 0.3rem 0.95rem;
    font-size: 0.82rem;
    gap: 0.35rem;
  }
  .s18-btn-icon {
    width: 0.95rem;
    height: 0.95rem;
  }
}

@media (max-height: 520px) {
  .s18-root {
    overflow-y: auto;
    justify-content: flex-start;
  }
}

@media print {
  @page {
    size: portrait;
    margin: 12mm 15mm;
  }

  .s18-nav,
  .no-print {
    display: none !important;
  }

  .s18-root {
    position: static !important;
    display: block !important;
    width: 100% !important;
    max-width: 100% !important;
    height: auto !important;
    min-height: 0 !important;
    background: #ffffff !important;
    background-color: #ffffff !important;
    padding: 0 !important;
    margin: 0 !important;
    overflow: visible !important;
    gap: 0 !important;
  }

  .s18-content {
    display: block !important;
    width: 100% !important;
    max-width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
  }

  /* Printable Clinical Header */
  .s18-print-header {
    display: flex !important;
    justify-content: space-between !important;
    align-items: flex-end !important;
    border-bottom: 2px solid #142724 !important;
    padding-bottom: 8px !important;
    margin-bottom: 14px !important;
  }

  .s18-print-brand {
    display: flex !important;
    flex-direction: column !important;
    gap: 2px !important;
  }

  .s18-print-logo {
    font-size: 18pt !important;
    font-weight: 900 !important;
    color: #142724 !important;
    letter-spacing: -0.02em !important;
    line-height: 1 !important;
  }

  .s18-print-tagline {
    font-size: 8.5pt !important;
    font-weight: 600 !important;
    color: #3b5a54 !important;
  }

  .s18-print-meta {
    display: flex !important;
    flex-direction: column !important;
    align-items: flex-end !important;
    gap: 2px !important;
  }

  .s18-print-doc-type {
    font-size: 8.5pt !important;
    font-weight: 700 !important;
    color: #142724 !important;
  }

  .s18-print-date {
    font-size: 8pt !important;
    color: #557871 !important;
  }

  /* "Action Steps for Parents" Badge */
  .s18-badge {
    display: inline-block !important;
    background-color: #fff677 !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    border: 2px solid #142724 !important;
    border-radius: 16px !important;
    padding: 8px 24px !important;
    box-shadow: none !important;
    margin-bottom: 14px !important;
  }

  .s18-badge-title {
    font-size: 16pt !important;
    font-weight: 800 !important;
    color: #142724 !important;
    line-height: 1.2 !important;
    margin: 0 !important;
  }

  /* Numbered Steps Section */
  .s18-steps-list {
    display: flex !important;
    flex-direction: column !important;
    gap: 7px !important;
    width: 100% !important;
    margin-bottom: 16px !important;
  }

  .s18-step-line {
    font-size: 10pt !important;
    font-weight: 650 !important;
    color: #142724 !important;
    line-height: 1.35 !important;
    margin: 0 !important;
  }

  .s18-quote-line {
    font-size: 9.5pt !important;
    font-weight: 500 !important;
    color: #1a3631 !important;
    line-height: 1.35 !important;
    margin: 0 0 2px 14px !important;
  }

  .s18-quote-text {
    font-style: italic !important;
    color: #0f172a !important;
  }

  /* Summary Table */
  .s18-table-container {
    width: 100% !important;
    max-width: 100% !important;
    border: 1.5px solid #7da39c !important;
    border-radius: 6px !important;
    overflow: hidden !important;
    box-shadow: none !important;
    margin-bottom: 14px !important;
    page-break-inside: avoid !important;
    break-inside: avoid !important;
  }

  .s18-table {
    width: 100% !important;
    border-collapse: collapse !important;
  }

  .s18-table tr {
    border-bottom: 1px solid #90b3ab !important;
    page-break-inside: avoid !important;
    break-inside: avoid !important;
  }

  .s18-table tr:last-child {
    border-bottom: none !important;
  }

  .s18-table-label {
    width: 42% !important;
    background-color: #b0cdc7 !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    color: #0a1f1b !important;
    font-size: 9.5pt !important;
    font-weight: 600 !important;
    line-height: 1.3 !important;
    padding: 8px 12px !important;
    border-right: 1.5px solid #90b3ab !important;
    vertical-align: middle !important;
  }

  .s18-table-value {
    width: 58% !important;
    background-color: #ebf4f1 !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    color: #0a1f1b !important;
    font-size: 9.5pt !important;
    font-weight: 500 !important;
    line-height: 1.3 !important;
    padding: 8px 12px !important;
    vertical-align: middle !important;
  }

  /* Printable Footer */
  .s18-print-footer {
    display: flex !important;
    justify-content: space-between !important;
    align-items: center !important;
    border-top: 1px solid #90b3ab !important;
    padding-top: 8px !important;
    margin-top: 12px !important;
    page-break-inside: avoid !important;
    break-inside: avoid !important;
  }

  .s18-print-footer-text {
    font-size: 8pt !important;
    color: #3b5a54 !important;
    font-weight: 500 !important;
    margin: 0 !important;
  }

  .s18-print-footer-tag {
    font-size: 8pt !important;
    font-weight: 700 !important;
    color: #143833 !important;
    white-space: nowrap !important;
    margin-left: 12px !important;
  }

  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    box-shadow: none !important;
  }
}
`;

export interface Slide18SummaryScreenProps {
  isSpanish?: boolean;
  answers: Record<string, any>;
  activeToken?: string | null;
  participantId?: string | null;
  onBack?: () => void;
  onPrint?: () => void;
  onNavigateToSuccess?: () => void;
  onNext?: () => void;
}

export function Slide18SummaryScreen({
  isSpanish = false,
  answers,
  activeToken,
  participantId,
  onBack,
  onPrint,
  onNavigateToSuccess,
  onNext,
}: Slide18SummaryScreenProps) {
  const summaryTitleRef = useRef<HTMLHeadingElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [isSavingPicture, setIsSavingPicture] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      summaryTitleRef.current?.focus();
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  // Unified clinical data formatting across Slide 18, Report Page, and PDF
  const formatted = formatAssessmentData(answers, isSpanish);
  const symptomsFormatted = formatted.symptoms;
  const ageFormatted = formatted.age;
  const onsetFormatted = formatted.onset;
  const medicalCareFormatted = formatted.medicalCare;
  const resolutionFormatted = formatted.resolution;
  const repeatUseFormatted = formatted.repeatUse;
  const effectiveMedName = formatted.medicationName;
  const tableRows = formatted.summaryTableRows;


  const handleSaveAsPicture = async () => {
    if (isSavingPicture) return;
    setIsSavingPicture(true);

    try {
      const element = cardRef.current;
      if (!element) return;

      const dataUrl = await toPng(element, {
        quality: 0.98,
        pixelRatio: 2,
        backgroundColor: "#f4f8ec",
        filter: (node) => {
          if (node instanceof HTMLElement && node.classList.contains("no-print")) {
            return false;
          }
          return true;
        },
      });

      const filename = isSpanish
        ? `PEN-PAL-Resumen-Acciones-${effectiveMedName || "Alergia"}.png`
        : `PEN-PAL-Action-Steps-${effectiveMedName || "Allergy"}.png`;

      const link = document.createElement("a");
      link.download = filename;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);

      // Persist completion status in the background
      submitAnswer("screen7_summary", "completed", 0).catch(() => {});
      completeQuestionnaire().catch(() => {});
    } catch (err) {
      console.error("Failed to capture PNG screenshot:", err);
      // Fallback: generate PDF if canvas export fails
      generateAssessmentPDF({
        locale: isSpanish ? "es" : "en",
        answers,
        participantId: participantId || activeToken,
        medicationName: effectiveMedName,
        symptoms: symptomsFormatted,
        age: ageFormatted,
        onset: onsetFormatted,
        medicalCare: medicalCareFormatted,
        resolution: resolutionFormatted,
        repeatUse: repeatUseFormatted,
        summarySections: tableRows.map((r, i) => ({
          id: `row-${i}`,
          label: r.label,
          value: r.value,
        })),
        steps: [
          isSpanish
            ? "Hable con el médico de su hijo sobre la alergia en su próxima visita."
            : "Talk to your child's doctor about the allergy at their next visit.",
          isSpanish
            ? "Comparta fotos de la reacción de su hijo con el médico."
            : "Share pictures of your child's reaction with the doctor.",
          isSpanish
            ? `Entregue la siguiente tabla al médico de su hijo. Esto describe lo que ocurrió cuando su hijo tomó ${effectiveMedName}.`
            : `Give the table below to your child's doctor. This says what happened when your child took ${effectiveMedName}.`,
        ],
      });
    } finally {
      setIsSavingPicture(false);
    }
  };

  const handleClose = () => {
    if (onNavigateToSuccess) {
      onNavigateToSuccess();
    } else if (onNext) {
      onNext();
    }
  };

  return (
    <div id="slide-content" className="s18-root" ref={cardRef}>
      <style>{SLIDE18_CSS}</style>

      {/* Main Centered Content */}
      <div className="s18-content">
        {/* Printable Clinical Header (Visible ONLY when printing) */}
        <div className="s18-print-header" aria-hidden="true">
          <div className="s18-print-brand">
            <span className="s18-print-logo">PEN-PAL</span>
            <span className="s18-print-tagline">
              {isSpanish
                ? "Estudio Clínico sobre Alergia a la Penicilina en Pediatría"
                : "Pediatric Penicillin Allergy Evaluation Study"}
            </span>
          </div>
          <div className="s18-print-meta">
            <span className="s18-print-doc-type">
              {isSpanish ? "Guía de Discusión Médica y Resumen" : "Doctor Discussion Guide & Summary"}
            </span>
            <span className="s18-print-date">
              {new Date().toLocaleDateString(isSpanish ? "es-US" : "en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </div>

        {/* 1. Yellow Badge */}
        <div className="s18-badge">
          <h1
            ref={summaryTitleRef}
            tabIndex={-1}
            id="slide18-title"
            className="s18-badge-title"
          >
            {isSpanish ? "Pasos a seguir para los padres" : "Action Steps for Parents"}
          </h1>
        </div>

        {/* 2. Numbered Steps matching Spec p18_4.png */}
        <div className="s18-steps-list">
          <p className="s18-step-line">
            {isSpanish
              ? "1. Hable con el médico de su hijo sobre la alergia en su próxima visita."
              : "1. Talk to your child’s doctor about the allergy at their next visit."}
          </p>
          <p className="s18-quote-line">
            {isSpanish ? "Esto es lo que puede decir: " : "Here’s what you can say: "}
            <span className="s18-quote-text">
              {isSpanish
                ? "«Leí sobre las alergias a la penicilina en niños. ¿Podríamos hablar sobre verificar si mi hijo realmente tiene una alergia?»"
                : '“I read about penicillin allergies in kids. Could we talk about checking to see if my child really has an allergy?”'}
            </span>
          </p>

          <p className="s18-step-line">
            {isSpanish
              ? "2. Comparta fotos de la reacción de su hijo con el médico."
              : "2. Share pictures of your child’s reaction with the doctor."}
          </p>

          <p className="s18-step-line">
            {isSpanish
              ? `3. Entregue la siguiente tabla al médico de su hijo. Esto describe lo que ocurrió cuando su hijo tomó ${effectiveMedName}.`
              : `3. Give the table below to your child’s doctor. This says what happened when your child took ${effectiveMedName}.`}
          </p>
        </div>

        {/* 3. The 2-Column Summary Table (Spec p18_4.png) */}
        <div className="s18-table-container">
          <table className="s18-table" aria-label={isSpanish ? "Resumen de la reacción" : "Reaction Summary"}>
            <tbody>
              {tableRows.map((row, idx) => (
                <tr key={idx}>
                  <td className="s18-table-label">{row.label}</td>
                  <td className="s18-table-value">{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Printable Footer (Visible ONLY when printing) */}
        <div className="s18-print-footer" aria-hidden="true">
          <p className="s18-print-footer-text">
            {isSpanish
              ? "Entregue esta hoja a su pediatra o médico para evaluar el historial de alergia a la penicilina."
              : "Please bring this sheet to your child's pediatrician or doctor to discuss penicillin allergy evaluation."}
          </p>
          <span className="s18-print-footer-tag">PEN-PAL Medical Study</span>
        </div>
      </div>

      {/* 4. Bottom Centered Navigation (Back, Print & Save) + Close ✕ */}
      <div className="s18-nav no-print">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="slide-nav-btn slide-nav-btn--back"
            aria-label={isSpanish ? "Atrás" : "Back"}
          >
            {isSpanish ? "Atrás" : "Back"}
          </button>
        )}
        <button
          type="button"
          onClick={onPrint || (() => window.print())}
          className="s18-btn"
          aria-label={isSpanish ? "Imprimir hoja de resumen" : "Print summary sheet"}
          title={isSpanish ? "Imprimir" : "Print"}
        >
          <Printer className="s18-btn-icon" aria-hidden="true" />
          <span>{isSpanish ? "Imprimir" : "Print"}</span>
        </button>
        <button
          type="button"
          onClick={handleSaveAsPicture}
          disabled={isSavingPicture}
          className={`s18-btn${isSavingPicture ? " opacity-80 cursor-wait" : ""}`}
          aria-label={isSpanish ? "Guardar resumen como imagen PNG" : "Save summary as picture PNG"}
          title={isSpanish ? "Guardar como imagen" : "Save as Picture"}
        >
          {isSavingPicture ? (
            <Loader2 className="s18-btn-icon animate-spin" aria-hidden="true" />
          ) : (
            <Download className="s18-btn-icon" aria-hidden="true" />
          )}
          <span>
            {isSavingPicture
              ? isSpanish
                ? "Guardando..."
                : "Saving..."
              : saveSuccess
              ? isSpanish
                ? "¡Guardado!"
                : "Saved!"
              : isSpanish
              ? "Guardar como imagen"
              : "Save as Picture"}
          </span>
        </button>
      </div>
    </div>
  );
}

export default Slide18SummaryScreen;
