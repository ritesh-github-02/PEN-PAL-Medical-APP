import { jsPDF } from "jspdf";

export interface PDFExportData {
  participantId?: string;
  token?: string;
  locale?: string;
  answers: any;
  summarySections: { label: string; value: string }[];
  steps?: string[];
  dateStr?: string;
}

export type AssessmentPdfData = PDFExportData;

export function generateAssessmentPDF(data: AssessmentPdfData): void {
  const isSpanish = data.locale === "es";

  // Initialize jsPDF with full tagging enabled and standard format
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "letter",
    putOnlyUsedFonts: true,
  });

  // Set Document Metadata & Language for PDF Screen Readers (PDF/UA Requirement)
  doc.setDocumentProperties({
    title: isSpanish ? "PEN-PAL Resumen de Evaluación Médica" : "PEN-PAL Clinical Assessment Summary",
    subject: "Penicillin Allergy Evaluation Summary for Healthcare Providers",
    author: "PEN-PAL Study Group",
    keywords: "penicillin, allergy, pediatrics, assessment",
    creator: "PEN-PAL Study Platform",
  });
  doc.setLanguage((isSpanish ? "es-US" : "en-US") as any);

  const margin = 40;
  let yPos = 50;

  // Title (Tagged as H1)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42); // slate-900
  const docTitle = isSpanish ? "Pasos a seguir para los padres" : "Action Steps for Parents";
  doc.text(docTitle, margin, yPos);
  yPos += 25;

  // Action Steps List (Tagged as List)
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85); // slate-700

  const stepsList = data.steps && data.steps.length > 0 
    ? data.steps 
    : (isSpanish
        ? ["Hable con el médico de su hijo acerca de la prueba de provocación oral de amoxicilina."]
        : ["Discuss amoxicillin oral challenge testing with your child's doctor."]);

  stepsList.forEach((step, idx) => {
    const stepText = `${idx + 1}. ${step}`;
    const splitStep = doc.splitTextToSize(stepText, 520);
    doc.text(splitStep, margin, yPos);
    yPos += splitStep.length * 14 + 4;
  });

  yPos += 15;
  doc.setDrawColor(226, 232, 240); // slate-200 divider
  doc.line(margin, yPos, 560, yPos);
  yPos += 25;

  // Summary Header (Tagged as H2)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  const subTitle = isSpanish ? "Resumen de la Reacción" : "Reaction Assessment Summary";
  doc.text(subTitle, margin, yPos);
  yPos += 20;

  // 2-Column Structured Table for Screen Readers
  const sections = data.summarySections || [];
  sections.forEach((section) => {
    // Check for page overflow
    if (yPos > 720) {
      doc.addPage();
      yPos = 50;
    }

    // Label
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105); // slate-600 (High contrast)
    doc.text((section.label || "").toUpperCase(), margin, yPos);
    yPos += 12;

    // Value
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(2, 6, 23); // slate-950
    const splitVal = doc.splitTextToSize(section.value || "N/A", 520);
    doc.text(splitVal, margin, yPos);
    yPos += splitVal.length * 15 + 10;
  });

  // Save PDF
  doc.save(`PEN-PAL_Summary_${data.participantId || data.token || "Participant"}.pdf`);
}

export default generateAssessmentPDF;
