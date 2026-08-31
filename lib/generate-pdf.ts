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

function cleanPdfToken(raw?: string): string {
  if (!raw) return 'ANONYMOUS';
  let str = raw.trim();
  if (str.includes('token=') || str.includes('TOKEN=') || str.includes('Token=') || str.includes('t=')) {
    const match = str.match(/[?&](?:token|TOKEN|Token|t)=([^&#\s]+)/i);
    if (match && match[1]) return decodeURIComponent(match[1]).trim();
  }
  if (str.startsWith('http://') || str.startsWith('https://')) {
    try {
      const u = new URL(str);
      const t = u.searchParams.get('token') || u.searchParams.get('TOKEN') || u.searchParams.get('t');
      if (t) return t.trim();
    } catch {}
  }
  return str;
}

export function generateAssessmentPDF(data: AssessmentPdfData): void {
  const isSpanish = data.locale === 'es';
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const primaryColor = [35, 111, 122]; // #236f7a Teal
  const darkColor = [30, 41, 59]; // #1e293b Slate 800
  const grayColor = [100, 116, 139]; // #64748b Slate 500
  const cardBgColor = [248, 250, 252]; // #f8fafc
  const cardBorderColor = [226, 232, 240]; // #e2e8f0
  const emeraldColor = [16, 149, 116]; // #109574

  let y = 14;

  // ── 1. Top Header Banner ──────────────────────────────────────────────────
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(14, y, 182, 18, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('PEN-PAL CLINICAL ASSESSMENT REPORT', 20, y + 7.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(
    isSpanish
      ? 'Padres Involucrados en Alergias a la Penicilina — Apoyo a la Decisión Clínica'
      : 'Parents Engaged in Penicillin Allergies — Clinical Decision Support',
    20,
    y + 13.5
  );

  y += 22;

  // ── 2. Patient Info Box (Fixed 2-Column Grid to prevent overlaps) ───────────
  const displayToken = cleanPdfToken(data.token || data.participantId);
  const infoBoxHeight = 18;

  doc.setFillColor(cardBgColor[0], cardBgColor[1], cardBgColor[2]);
  doc.setDrawColor(cardBorderColor[0], cardBorderColor[1], cardBorderColor[2]);
  doc.roundedRect(14, y, 182, infoBoxHeight, 2, 2, 'FD');

  // Column 1: Study ID & Date
  doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text(isSpanish ? 'ID / TOKEN DE ESTUDIO:' : 'STUDY ID / ACCESS TOKEN:', 20, y + 6);

  doc.setFont('courier', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  const tokenTruncated = doc.splitTextToSize(displayToken, 48);
  doc.text(tokenTruncated[0] || displayToken, 68, y + 6);

  doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text(isSpanish ? 'FECHA DE GENERACIÓN:' : 'DATE GENERATED:', 20, y + 13);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.text(data.dateStr || new Date().toLocaleDateString(isSpanish ? 'es-ES' : 'en-US'), 68, y + 13);

  // Column 2: Status & Protocol
  doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text(isSpanish ? 'ESTADO:' : 'STATUS:', 125, y + 6);

  doc.setTextColor(emeraldColor[0], emeraldColor[1], emeraldColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text(isSpanish ? '✓ COMPLETADO Y GUARDADO' : '✓ COMPLETED & SAVED', 145, y + 6);

  doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text(isSpanish ? 'PROTOCOLO:' : 'PROTOCOL:', 125, y + 13);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.text('PEN-PAL INTERVENTION', 145, y + 13);

  y += infoBoxHeight + 5;

  // ── 3. Action Steps for Parents ───────────────────────────────────────────
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(isSpanish ? 'Pasos de Acción para los Padres' : 'Action Steps for Parents', 14, y);

  y += 5;

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
  doc.setFontSize(8);

  stepsToUse.forEach((step, idx) => {
    const cleanText = step.replace(/^#?\d+[\.\)]\s*/, '');
    const stepLabel = `${idx + 1}. ${cleanText}`;
    const lines = doc.splitTextToSize(stepLabel, 180);
    doc.text(lines, 16, y);
    y += lines.length * 3.8 + 1;
  });

  y += 3;

  // ── 4. Clinical Assessment Questionnaire Summary Grid (Dynamic Height Cards) ─
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(
    isSpanish
      ? 'Resumen de Evaluación Clínica'
      : 'Clinical Assessment Questionnaire Summary',
    14,
    y
  );

  y += 5;

  const sections = data.summarySections || [];
  const colWidth = 88;

  for (let i = 0; i < sections.length; i += 2) {
    const sec1 = sections[i];
    const sec2 = sections[i + 1];

    // Compute wrapped line count for both columns to avoid text cutting
    const val1Lines = sec1 ? doc.splitTextToSize(sec1.value || 'N/A', colWidth - 8) : [];
    const val2Lines = sec2 ? doc.splitTextToSize(sec2.value || 'N/A', colWidth - 8) : [];
    const maxValLines = Math.max(val1Lines.length, val2Lines.length, 1);
    
    // Dynamic height based on lines of text
    const dynamicRowHeight = Math.max(13, 6 + maxValLines * 3.8);

    // Left Card
    if (sec1) {
      doc.setFillColor(cardBgColor[0], cardBgColor[1], cardBgColor[2]);
      doc.setDrawColor(cardBorderColor[0], cardBorderColor[1], cardBorderColor[2]);
      doc.roundedRect(14, y, colWidth, dynamicRowHeight, 1.5, 1.5, 'FD');

      doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.8);
      const label1 = doc.splitTextToSize(sec1.label.toUpperCase(), colWidth - 8);
      doc.text(label1[0] || sec1.label.toUpperCase(), 18, y + 4.2);

      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.8);
      doc.text(val1Lines, 18, y + 8.2);
    }

    // Right Card
    if (sec2) {
      doc.setFillColor(cardBgColor[0], cardBgColor[1], cardBgColor[2]);
      doc.setDrawColor(cardBorderColor[0], cardBorderColor[1], cardBorderColor[2]);
      doc.roundedRect(108, y, colWidth, dynamicRowHeight, 1.5, 1.5, 'FD');

      doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.8);
      const label2 = doc.splitTextToSize(sec2.label.toUpperCase(), colWidth - 8);
      doc.text(label2[0] || sec2.label.toUpperCase(), 112, y + 4.2);

      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.8);
      doc.text(val2Lines, 112, y + 8.2);
    }

    y += dynamicRowHeight + 2.5;
  }

  y += 2;

  // ── 5. Clinical Guidance Box (Clean Teal Tint) ────────────────────────────
  doc.setFillColor(240, 248, 250);
  doc.setDrawColor(180, 215, 220);

  const guidanceText = isSpanish
    ? 'Basado en las respuestas proporcionadas, este informe resume el historial de reacción a la penicilina reportado por el paciente. Por favor comparta este documento con su pediatra o alergólogo para evaluar la desensibilización o reevaluación de la alergia.'
    : 'Based on the responses provided, this report summarizes the reported penicillin reaction history. Please share this document with your pediatrician or allergist for allergy de-labeling consideration or diagnostic testing.';
  
  const guidanceLines = doc.splitTextToSize(guidanceText, 174);
  const guidanceBoxHeight = Math.max(18, 7 + guidanceLines.length * 3.6);

  doc.roundedRect(14, y, 182, guidanceBoxHeight, 2, 2, 'FD');

  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text(isSpanish ? 'ORIENTACIÓN CLÍNICA:' : 'CLINICAL GUIDANCE:', 18, y + 5.2);

  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text(guidanceLines, 18, y + 9.5);

  // ── 6. Page Footer ────────────────────────────────────────────────────────
  doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text(
    'PEN-PAL Study Clinical Decision Support Tool — Confidential Participant Report',
    14,
    286
  );
  doc.text(
    `Generated: ${new Date().toISOString().slice(0, 19).replace('T', ' ')} UTC`,
    148,
    286
  );

  // Direct safe download trigger
  const safeFilename = `PEN-PAL_Assessment_${displayToken}.pdf`;
  doc.save(safeFilename);
}
