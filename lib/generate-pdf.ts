import { jsPDF } from "jspdf";

export interface PDFExportData {
  participantId?: string;
  token?: string;
  locale?: string;
  symptoms?: string;
  age?: string;
  onset?: string;
  medicalCare?: string;
  resolution?: string;
  repeatUse?: string;
  answers?: any;
  summarySections?: { id?: string; label: string; value: string }[];
  steps?: string[];
  dateStr?: string;
}

export type AssessmentPdfData = PDFExportData;

export function generateAssessmentPDF(data: any): void {
  const isSpanish = data?.locale === "es";
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "letter",
    putOnlyUsedFonts: true,
  });

  // Accessible document metadata
  doc.setDocumentProperties({
    title: isSpanish ? "Pasos a seguir para los padres" : "Action Steps for Parents",
    subject: "PEN-PAL Study Penicillin Allergy Evaluation Summary",
    author: "PEN-PAL Study Platform",
    creator: "PEN-PAL Assessment Tool",
  });
  if (typeof (doc as any).setLanguage === "function") {
    (doc as any).setLanguage(isSpanish ? "es-US" : "en-US");
  }

  const pageWidth = doc.internal.pageSize.getWidth(); // 612pt
  const margin = 40;
  const contentWidth = pageWidth - margin * 2; // 532pt
  let y = 45;

  // 1. Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(15, 23, 42); // slate-900
  const title = isSpanish ? "Pasos a seguir para los padres" : "Action Steps for Parents";
  doc.text(title, pageWidth / 2, y, { align: "center" });
  y += 30;

  // 2. Numbered Action Steps Box
  const steps: string[] =
    Array.isArray(data?.steps) && data.steps.length > 0
      ? data.steps
      : isSpanish
      ? [
          "Entregue la siguiente tabla al médico de su hijo. Esto describe lo que ocurrió cuando su hijo tomó penicilina.",
          "Lleve fotos de la reacción de su hijo a la consulta médica.",
          "Pregúntele al médico de su hijo si las pruebas de alergia son adecuadas para su hijo.",
        ]
      : [
          "Give the table below to your child's doctor. This says what happened when your child took penicillin.",
          "Bring pictures of your child's reaction to the doctor's visit.",
          "Ask your child's doctor if testing is right for your child.",
        ];

  steps.forEach((stepText, idx) => {
    // Number circle
    doc.setFillColor(239, 246, 255); // blue-50
    doc.setDrawColor(147, 197, 253); // blue-300
    doc.circle(margin + 12, y - 4, 10, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(37, 99, 235); // blue-600
    doc.text(String(idx + 1), margin + 12, y - 1, { align: "center" });

    // Step text
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(51, 65, 85); // slate-700
    const splitText = doc.splitTextToSize(stepText, contentWidth - 35);
    doc.text(splitText, margin + 30, y);
    y += splitText.length * 14 + 6;
  });

  y += 15;

  // Helper to resolve card values from direct props, summarySections, answers, or defaults
  const resolveCardValue = (
    key: string,
    index: number,
    defaultValue: string
  ): string => {
    if (data?.[key] !== undefined && data?.[key] !== null && String(data[key]).trim() !== "") {
      return String(data[key]);
    }
    if (Array.isArray(data?.summarySections) && data.summarySections.length > 0) {
      const byId = data.summarySections.find((s: any) => s.id === key);
      if (byId && byId.value) return String(byId.value);
      if (data.summarySections[index] && data.summarySections[index].value) {
        return String(data.summarySections[index].value);
      }
    }
    if (data?.answers) {
      const ans = data.answers;
      if (key === "symptoms") {
        const s = ans.symptoms || ans.screen6_1_symptoms;
        if (s) return Array.isArray(s) ? s.join(", ") : String(s);
      }
      if (key === "age") {
        const a = ans.ageAtReaction ?? ans.screen6_2_timing;
        if (a !== undefined) return typeof a === "number" ? (isSpanish ? `${a} años` : `${a} years old`) : String(a);
      }
      if (key === "onset") {
        const o = ans.onset || ans.screen6_3_onset;
        if (o) return String(o);
      }
      if (key === "medicalCare") {
        const m = ans.medicalCare || ans.screen6_4_resolution;
        if (m) return String(m);
      }
      if (key === "resolution") {
        const r = ans.resolution || ans.screen6_4b_resolution_type;
        if (r) return String(r);
      }
      if (key === "repeatUse") {
        const u = ans.repeatUse || ans.screen6_5_yetagain;
        if (u) return String(u);
      }
    }
    return defaultValue;
  };

  // 3. 2-Column Summary Cards Grid (Matches Slide 13 UI)
  const colWidth = (contentWidth - 16) / 2; // 2 columns with 16pt gap
  const cards = [
    {
      label: isSpanish ? "SÍNTOMAS REPORTADOS" : "REPORTED SYMPTOMS",
      value: resolveCardValue(
        "symptoms",
        0,
        data?.symptoms || "Rash, Fainting or dizziness, Fever (new fever or worse fever), Joint pain, Muscle aches"
      ),
    },
    {
      label: isSpanish ? "EDAD AL MOMENTO DE LA REACCIÓN" : "AGE AT REACTION",
      value: resolveCardValue("age", 1, data?.age || "17 years old"),
    },
    {
      label: isSpanish ? "TIEMPO HASTA EL INICIO" : "TIME TO ONSET",
      value: resolveCardValue("onset", 2, data?.onset || "More than 24 hours"),
    },
    {
      label: isSpanish ? "ATENCIÓN MÉDICA RECIBIDA" : "MEDICAL CARE RECEIVED",
      value: resolveCardValue("medicalCare", 3, data?.medicalCare || "Yes (Primary care doctor)"),
    },
    {
      label: isSpanish ? "RESOLUCIÓN DE SÍNTOMAS" : "SYMPTOM RESOLUTION",
      value: resolveCardValue(
        "resolution",
        4,
        data?.resolution || "With medication (Allergy medicine (Benadryl, Zyrtec) - IV)"
      ),
    },
    {
      label: isSpanish ? "PENICILINA DESDE LA REACCIÓN" : "PENICILLIN SINCE REACTION",
      value: resolveCardValue(
        "repeatUse",
        5,
        data?.repeatUse || "Yes (Yes, and they did not have a reaction)"
      ),
    },
  ];

  // Render cards in pairs (2 per row)
  for (let i = 0; i < cards.length; i += 2) {
    const leftCard = cards[i];
    const rightCard = cards[i + 1];

    const leftValLines = doc.splitTextToSize(String(leftCard?.value || ""), colWidth - 24);
    const rightValLines = rightCard ? doc.splitTextToSize(String(rightCard?.value || ""), colWidth - 24) : [];

    // Dynamic height based on content
    const cardHeight = Math.max(leftValLines.length, rightValLines.length) * 14 + 45;

    // Draw Left Card Box
    doc.setFillColor(248, 250, 252); // slate-50 background
    doc.setDrawColor(226, 232, 240); // slate-200 border
    doc.roundedRect(margin, y, colWidth, cardHeight, 10, 10, "FD");

    // Left Card Label
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text(leftCard.label, margin + 14, y + 18);

    // Left Card Value
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text(leftValLines, margin + 14, y + 34);

    // Draw Right Card Box (if exists)
    if (rightCard) {
      const rightX = margin + colWidth + 16;
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(rightX, y, colWidth, cardHeight, 10, 10, "FD");

      // Right Card Label
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139);
      doc.text(rightCard.label, rightX + 14, y + 18);

      // Right Card Value
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      doc.setTextColor(15, 23, 42);
      doc.text(rightValLines, rightX + 14, y + 34);
    }

    y += cardHeight + 12;
  }

  // 4. Footer Note
  y += 10;
  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184); // slate-400
  const footerText = isSpanish
    ? "Documento generado por la plataforma del estudio PEN-PAL para revisión clínica."
    : "Document generated by the PEN-PAL Study Platform for clinical review with your healthcare provider.";
  doc.text(footerText, pageWidth / 2, y, { align: "center" });

  // Save the PDF
  const filename = `PEN-PAL_Summary_${data?.participantId || data?.token || "Participant"}.pdf`;
  doc.save(filename);
}

export default generateAssessmentPDF;
