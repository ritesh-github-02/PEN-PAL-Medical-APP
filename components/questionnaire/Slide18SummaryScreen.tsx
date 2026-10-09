"use client";

import React, { useRef, useEffect } from "react";
import { generateAssessmentPDF } from "@/lib/generate-pdf";

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

/* "Action Steps for Parents" Yellow Badge */
.s18-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: #fff475;
  border: 1.5px solid #142724;
  border-radius: 18px;
  padding: 0.32rem 1.35rem;
  box-shadow: 2px 2.5px 0px rgba(20, 50, 40, 0.18);
  margin-bottom: 0.45rem;
}

.s18-badge-title {
  font-size: 1.16rem;
  font-weight: 800;
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
  gap: 1.6rem;
  width: 100%;
  margin: 0;
  padding: 0;
  flex-shrink: 0;
}

.s18-btn {
  padding: 0.36rem 1.9rem;
  min-height: 36px;
  min-width: 98px;
  border-radius: 9999px;
  font-size: 0.9rem;
  font-weight: 600;
  color: #143833;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  outline: none;
  cursor: pointer;
  border: 1px solid #91b5ae;
  background-color: #adcac4;
  transition: all 0.15s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.s18-btn:hover {
  background-color: #9cbdb6;
  transform: translateY(-1px);
}

.s18-btn:active {
  transform: scale(0.97);
}

.s18-btn:focus-visible {
  box-shadow: 0 0 0 3px #236f7a;
}

/* Close ✕ button on bottom-right corner */
.s18-close-btn {
  position: absolute;
  right: 0;
  background-color: #ffffff;
  border: 1px solid #91b5ae;
  border-radius: 6px;
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #557871;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  transition: all 0.15s ease;
  outline: none;
}

.s18-close-btn:hover {
  background-color: #f7faf9;
  color: #c93b2b;
  border-color: #a6bbb5;
}

/* Responsive Scaling */
@media (max-height: 640px), (max-width: 768px) {
  .s18-root {
    padding: 0.6rem 1.5rem 0.35rem 1.5rem;
  }
  .s18-badge {
    padding: 0.25rem 1.1rem;
    margin-bottom: 0.35rem;
  }
  .s18-badge-title {
    font-size: 1.05rem;
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
  }
  .s18-btn {
    min-height: 32px;
    padding: 0.28rem 1.5rem;
    font-size: 0.84rem;
  }
}

@media (max-height: 520px) {
  .s18-root {
    overflow-y: auto;
    justify-content: flex-start;
  }
}

@media print {
  @page { size: A4 portrait; margin: 0.5cm; }
  .s18-nav { display: none !important; }
  .s18-root { background: white !important; padding: 0 !important; }
  * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; box-shadow: none !important; }
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

  useEffect(() => {
    const timer = setTimeout(() => {
      summaryTitleRef.current?.focus();
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  // Format symptoms string
  const rawSymptoms = answers?.symptoms || answers?.screen6_1_symptoms || [];
  const symptomsArray = Array.isArray(rawSymptoms) ? rawSymptoms : [rawSymptoms];
  const rashDetails = answers?.screen6_1_rash_types || answers?.rashTypes || [];
  const rashArray = Array.isArray(rashDetails) ? rashDetails : [rashDetails];

  let symptomsFormatted = isSpanish ? "Ninguno reportado" : "None reported";
  if (symptomsArray.length > 0) {
    symptomsFormatted = symptomsArray
      .map((s: string) => {
        if (s === "Rash" && rashArray.length > 0) {
          const detailStr = rashArray.join(", ");
          return isSpanish ? `Erupción cutánea   ${detailStr}` : `Rash   ${detailStr}`;
        }
        if (isSpanish) {
          if (s === "Rash") return "Erupción cutánea";
          if (s === "Hives") return "Urticaria";
          if (s === "Swelling") return "Hinchazón";
          if (s === "Throat tightness") return "Opresión en la garganta";
          if (s === "Trouble breathing") return "Dificultad para respirar";
          if (s === "Vomiting/Diarrhea") return "Vómitos/Diarrea";
          if (s.includes("Unsure") || s.includes("know")) return "No estoy seguro/ No lo sé";
        }
        return s;
      })
      .join(", ");
  }

  // Format age string
  const rawAge = answers?.ageCohort || answers?.ageAtReaction || answers?.screen6_2_timing;
  const formatAgeValue = (val: any) => {
    if (!val || val === "none_selected") return isSpanish ? "No reportado" : "Not reported";
    const valStr = String(val);
    if (!isNaN(Number(valStr))) {
      return isSpanish ? `${valStr} años` : `${valStr}-years old`;
    }
    if (valStr.includes("Toddler")) return isSpanish ? "Niño pequeño (1-3 años)" : "3-years old";
    if (valStr.includes("Baby")) return isSpanish ? "Bebé (0-12 meses)" : "Baby (0-12 months)";
    if (valStr.includes("School")) return isSpanish ? "Edad escolar (4-12 años)" : "School-aged (4-12 years)";
    if (valStr.includes("Teen")) return isSpanish ? "Adolescente (13-17 años)" : "Teen (13-17 years)";
    if (valStr.includes("Adult")) return isSpanish ? "Adulto (18+)" : "Adult (18+)";
    return valStr;
  };
  const ageFormatted = formatAgeValue(rawAge);

  // Format onset string
  const rawOnset = answers?.onset || answers?.screen6_3_onset;
  const formatOnsetValue = (val: any) => {
    if (!val || val === "none_selected") return isSpanish ? "No reportado" : "Not reported";
    const valStr = String(val);
    if (valStr.toLowerCase().includes("less") || valStr === "<1 hour" || valStr === "< 1 hour") {
      return isSpanish ? "<1 hora" : "<1 hour";
    }
    if (valStr.includes("1-24") || valStr.includes("1 to 24")) {
      return isSpanish ? "1-24 horas" : "1-24 hours";
    }
    if (valStr.includes("24+") || valStr.toLowerCase().includes("more than 24")) {
      return isSpanish ? "24+ horas" : "24+hours";
    }
    if (valStr.toLowerCase().includes("unsure") || valStr.toLowerCase().includes("know")) {
      return isSpanish ? "No estoy seguro" : "Unsure";
    }
    return valStr;
  };
  const onsetFormatted = formatOnsetValue(rawOnset);

  // Format resolution string
  const resVal = answers?.resolution || answers?.screen6_4b_resolution_type;
  let resolutionFormatted = isSpanish ? "Por sí sola" : "On its own";
  if (resVal === "With medication") {
    const meds = answers?.resolutionMedicines || [];
    const route = answers?.resolutionRoute || answers?.screen6_4b_route;
    if (meds.length > 0 || route) {
      const medName = meds[0]?.split(" (")[0] || "Allergy medicine";
      resolutionFormatted = route
        ? `${isSpanish ? "Con medicación" : "With medication"} (${medName}, ${route})`
        : `${isSpanish ? "Con medicación" : "With medication"} (${medName})`;
    } else {
      resolutionFormatted = isSpanish ? "Con medicación" : "With medication";
    }
  } else if (resVal === "On its own") {
    resolutionFormatted = isSpanish ? "Por sí sola" : "On its own";
  } else if (resVal && (resVal.toLowerCase().includes("unsure") || resVal.toLowerCase().includes("know"))) {
    resolutionFormatted = isSpanish ? "No estoy seguro" : "Unsure";
  }

  // Format repeat use string (matching spec p18_4.png: "Unsure if child has received penicillin since the reaction")
  const repeatVal = answers?.repeatUse || answers?.screen6_5_yetagain;
  const detailVal = answers?.reactionDetailSelected || answers?.screen6_5_reaction_detail;
  let repeatUseFormatted = isSpanish
    ? "No, el niño no ha recibido penicilina desde la reacción"
    : "No, child has not received penicillin since the reaction";

  if (repeatVal === "Unsure" || (repeatVal && repeatVal.toLowerCase().includes("unsure"))) {
    repeatUseFormatted = isSpanish
      ? "No estoy seguro si el niño ha recibido penicilina desde la reacción"
      : "Unsure if child has received penicillin since the reaction";
  } else if (repeatVal === "Yes") {
    if (detailVal && detailVal.includes("not have a reaction")) {
      repeatUseFormatted = isSpanish ? "Sí, y no tuvieron reacción" : "Yes, and they did not have a reaction";
    } else if (detailVal && detailVal.includes("had a reaction")) {
      repeatUseFormatted = isSpanish ? "Sí, y tuvieron reacción" : "Yes, and they had a reaction";
    } else {
      repeatUseFormatted = isSpanish ? "Sí" : "Yes";
    }
  } else if (repeatVal === "No") {
    repeatUseFormatted = isSpanish
      ? "No, el niño no ha recibido penicilina desde la reacción"
      : "No, child has not received penicillin since the reaction";
  }

  const effectiveMedName = answers?.medicationName || answers?.screen2_naming || (isSpanish ? "penicilina" : "penicillin");

  // Table rows matching Spec p18_4.png exactly
  const tableRows = [
    {
      label: isSpanish ? "Síntomas de la reacción del niño" : "Symptoms of child's reaction",
      value: symptomsFormatted,
    },
    {
      label: isSpanish ? "Edad del niño al momento de la reacción" : "Age of child at the time of the reaction",
      value: ageFormatted,
    },
    {
      label: isSpanish ? "Cuánto tiempo después de tomar penicilina ocurrió la reacción" : "How long reaction happened after taking penicillin",
      value: onsetFormatted,
    },
    {
      label: isSpanish ? "Cómo desapareció la reacción" : "How reaction went away",
      value: resolutionFormatted,
    },
    {
      label: isSpanish ? "Uso repetido de penicilina" : "Repeat use of penicillin",
      value: repeatUseFormatted,
    },
  ];

  const handleCompleteAndSave = () => {
    generateAssessmentPDF({
      locale: isSpanish ? "es" : "en",
      answers,
      participantId: participantId || activeToken,
      symptoms: symptomsFormatted,
      age: ageFormatted,
      onset: onsetFormatted,
      medicalCare: answers?.screen6_4_resolution || "None",
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

    if (onNavigateToSuccess) {
      onNavigateToSuccess();
    } else if (onNext) {
      onNext();
    }
  };

  return (
    <div id="slide-content" className="s18-root">
      <style>{SLIDE18_CSS}</style>

      {/* Main Centered Content */}
      <div className="s18-content">
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
      </div>

      {/* 4. Bottom Centered Navigation (Print & Save) + Close ✕ */}
      <div className="s18-nav">
        <button
          type="button"
          onClick={onPrint || (() => window.print())}
          className="s18-btn"
        >
          {isSpanish ? "Imprimir" : "Print"}
        </button>
        <button
          type="button"
          onClick={handleCompleteAndSave}
          className="s18-btn"
        >
          {isSpanish ? "Guardar" : "Save"}
        </button>

        <button
          type="button"
          onClick={handleCompleteAndSave}
          aria-label={isSpanish ? "Cerrar" : "Close"}
          title={isSpanish ? "Cerrar" : "Close"}
          className="s18-close-btn"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

export default Slide18SummaryScreen;
