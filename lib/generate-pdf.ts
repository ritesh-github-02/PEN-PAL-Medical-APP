import { jsPDF } from 'jspdf';

export interface AssessmentPdfData {
  participantId?: string;
  token?: string;
  locale?: string;
  dateStr?: string;
  answers: Record<string, any>;
  summarySections: {
    label: string;
    value: string;
  }[];
  steps?: string[];
}

export function generateAssessmentPDF(data: AssessmentPdfData): void {
  const isSpanish = data.locale === 'es';
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const primaryColor = [35, 111, 122]; // #236f7a Teal
  const darkColor = [31, 41, 55]; // #1f2937
  const grayColor = [100, 116, 139]; // #64748b
  const cardBgColor = [248, 250, 252]; // #f8fafc
  const cardBorderColor = [226, 232, 240]; // #e2e8f0

  let y = 16;

  // ── Header Banner ────────────────────────────────────────────────────────
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(14, y, 182, 20, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('PEN-PAL CLINICAL ASSESSMENT REPORT', 20, y + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(
    isSpanish
      ? 'Padres Involucrados en Alergias a la Penicilina'
      : 'Parents Engaged in Penicillin Allergies — Clinical Decision Support',
    20,
    y + 14
  );

  y += 26;

  // ── Patient Info Box ──────────────────────────────────────────────────────
  doc.setFillColor(cardBgColor[0], cardBgColor[1], cardBgColor[2]);
  doc.setDrawColor(cardBorderColor[0], cardBorderColor[1], cardBorderColor[2]);
  doc.roundedRect(14, y, 182, 18, 2, 2, 'FD');

  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(isSpanish ? 'ID / TOKEN DE ESTUDIO:' : 'STUDY ID / ACCESS TOKEN:', 20, y + 7);

  doc.setFont('courier', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(data.token || data.participantId || 'ANONYMOUS', 72, y + 7);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.text(isSpanish ? 'FECHA DE GENERACIÓN:' : 'DATE GENERATED:', 20, y + 13);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(data.dateStr || new Date().toLocaleDateString(isSpanish ? 'es-ES' : 'en-US'), 72, y + 13);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(isSpanish ? 'ESTADO:' : 'STATUS:', 130, y + 7);

  doc.setTextColor(16, 149, 116);
  doc.text(isSpanish ? '✓ COMPLETADO Y GUARDADO' : '✓ COMPLETED & SAVED', 150, y + 7);

  y += 24;

  // ── Action Steps for Parents ──────────────────────────────────────────────
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(isSpanish ? 'Pasos de Acción para los Padres' : 'Action Steps for Parents', 14, y);

  y += 6;

  const defaultSteps = isSpanish
    ? [
        '1. Entregue la siguiente tabla al médico de su hijo. Esto describe lo que ocurrió cuando tomó penicilina.',
        '2. Lleve fotos de la reacción de su hijo a la consulta médica.',
        '3. Pregúntele al médico si la prueba de alergia es adecuada para su hijo.',
      ]
    : [
        "1. Give the table below to your child's doctor. This says what happened when your child took penicillin.",
        "2. Bring pictures of your child's reaction to the doctor's visit.",
        "3. Ask your child's doctor if testing is right for your child.",
      ];

  const stepsToUse = data.steps && data.steps.length > 0 ? data.steps : defaultSteps;

  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);

  stepsToUse.forEach((step) => {
    const lines = doc.splitTextToSize(step, 178);
    doc.text(lines, 16, y);
    y += lines.length * 4.5 + 1.5;
  });

  y += 4;

  // ── Clinical Assessment Summary Grid ──────────────────────────────────────
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(isSpanish ? 'Resumen de Evaluación Clínica' : 'Clinical Assessment Questionnaire Summary', 14, y);

  y += 6;

  const sections = data.summarySections || [];
  const colWidth = 88;
  const rowHeight = 15;

  for (let i = 0; i < sections.length; i += 2) {
    const sec1 = sections[i];
    const sec2 = sections[i + 1];

    // Left Box
    if (sec1) {
      doc.setFillColor(cardBgColor[0], cardBgColor[1], cardBgColor[2]);
      doc.setDrawColor(cardBorderColor[0], cardBorderColor[1], cardBorderColor[2]);
      doc.roundedRect(14, y, colWidth, rowHeight, 1.5, 1.5, 'FD');

      doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.text(sec1.label.toUpperCase(), 18, y + 4.5);

      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      const val1Lines = doc.splitTextToSize(sec1.value || 'N/A', colWidth - 8);
      doc.text(val1Lines, 18, y + 9.5);
    }

    // Right Box
    if (sec2) {
      doc.setFillColor(cardBgColor[0], cardBgColor[1], cardBgColor[2]);
      doc.setDrawColor(cardBorderColor[0], cardBorderColor[1], cardBorderColor[2]);
      doc.roundedRect(108, y, colWidth, rowHeight, 1.5, 1.5, 'FD');

      doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.text(sec2.label.toUpperCase(), 112, y + 4.5);

      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      const val2Lines = doc.splitTextToSize(sec2.value || 'N/A', colWidth - 8);
      doc.text(val2Lines, 112, y + 9.5);
    }

    y += rowHeight + 3;
  }

  y += 3;

  // ── Clinical Guidance Box ─────────────────────────────────────────────────
  doc.setFillColor(240, 248, 250); // Light teal tint
  doc.setDrawColor(180, 215, 220);
  doc.roundedRect(14, y, 182, 22, 2, 2, 'FD');

  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text(isSpanish ? 'ORIENTACIÓN CLÍNICA:' : 'CLINICAL GUIDANCE:', 18, y + 6);

  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  const guidanceText = isSpanish
    ? 'Basado en las respuestas proporcionadas, este informe resume el historial de reacción a la penicilina reportado por el paciente. Por favor comparta este documento con su pediatra o alergólogo para evaluar la desensibilización o reevaluación de la alergia.'
    : 'Based on the responses provided, this report summarizes the reported penicillin reaction history. Please share this document with your pediatrician or allergist for allergy de-labeling consideration or diagnostic testing.';
  const guidanceLines = doc.splitTextToSize(guidanceText, 174);
  doc.text(guidanceLines, 18, y + 11);

  // ── Footer ────────────────────────────────────────────────────────────────
  doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text(
    'PEN-PAL Study Clinical Decision Support Tool — Confidential Participant Report',
    14,
    285
  );
  doc.text(
    `Generated: ${new Date().toISOString().slice(0, 19).replace('T', ' ')} UTC`,
    150,
    285
  );

  // Download directly
  const safeFilename = `PEN-PAL_Assessment_${data.token || data.participantId || 'Summary'}.pdf`;
  doc.save(safeFilename);
}
