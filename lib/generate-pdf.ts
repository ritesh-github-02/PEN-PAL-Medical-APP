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
  let y = 46;

  // 1. Title & Clinical Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(15, 23, 42); // slate-900
  const title = isSpanish ? "Pasos a seguir para los padres" : "Action Steps for Parents";
  doc.text(title, pageWidth / 2, y, { align: "center" });
  y += 24;

  // Professional Clinical Subtitle
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139); // slate-500
  const subtitle = isSpanish 
    ? "ESTUDIO CLÍNICO PEN-PAL • GUÍA DE DISCUSIÓN MÉDICA" 
    : "PEN-PAL CLINICAL STUDY • DOCTOR DISCUSSION GUIDE";
  doc.text(subtitle, pageWidth / 2, y, { align: "center" });
  y += 26;

  // 2. Numbered Action Steps (Spaced, Clean & Professional)
  const medName =
    data?.answers?.medicationName ||
    data?.medicationName ||
    (isSpanish ? "penicilina" : "penicillin");

  const steps: string[] =
    Array.isArray(data?.steps) && data.steps.length > 0
      ? data.steps
      : isSpanish
      ? [
          "Hable con el médico de su hijo sobre la alergia en su próxima visita.",
          "Comparta fotos de la reacción de su hijo con el médico.",
          `Entregue la siguiente tabla al médico de su hijo. Esto describe lo que ocurrió cuando su hijo tomó ${medName}:`,
        ]
      : [
          "Talk to your child's doctor about the allergy at their next visit.",
          "Share pictures of your child's reaction with the doctor.",
          `Give the table below to your child's doctor. This says what happened when your child took ${medName}:`,
        ];

  const badgeRadius = 10;
  const badgeX = margin + 14;
  const textX = margin + 36;
  const maxTextWidth = contentWidth - 44;

  steps.forEach((stepText, idx) => {
    // Step text formatting
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);
    doc.setTextColor(30, 41, 59); // slate-800
    const splitText = doc.splitTextToSize(stepText, maxTextWidth);

    const lineHeight = 15;
    const textBlockHeight = splitText.length * lineHeight;
    const itemHeight = Math.max(badgeRadius * 2, textBlockHeight);

    // Number circle badge (vertically aligned with first line of text)
    const badgeCenterY = y + 7.5;
    doc.setFillColor(239, 246, 255); // blue-50
    doc.setDrawColor(147, 197, 253); // blue-300
    doc.setLineWidth(0.75);
    doc.circle(badgeX, badgeCenterY, badgeRadius, "FD");

    // Badge Number
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(37, 99, 235); // blue-600
    doc.text(String(idx + 1), badgeX, badgeCenterY + 3.5, { align: "center" });

    // Step text rendered with clean line height
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);
    doc.setTextColor(30, 41, 59);
    doc.text(splitText, textX, y + 11);

    // Generous vertical separation
    y += itemHeight + 12;
  });

  // 2b. Doctor Discussion Prompt Callout Box (Slide 22 Specification)
  y += 4;
  const promptTitle = isSpanish
    ? "CONSEJO PARA LA CONVERSACIÓN CON EL MÉDICO:"
    : "DOCTOR DISCUSSION PROMPT:";
  const promptQuote = isSpanish
    ? '“Leí sobre las alergias a la penicilina en los niños. ¿Podríamos hablar sobre verificar si mi hijo realmente tiene una alergia?”'
    : '“I read about penicillin allergies in kids. Could we talk about checking to see if my child really has an allergy?”';

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(26, 86, 96);
  const promptLines = doc.splitTextToSize(promptQuote, contentWidth - 24);
  const promptBoxHeight = promptLines.length * 13 + 22;

  doc.setFillColor(240, 249, 250); // teal-50
  doc.setDrawColor(162, 210, 216); // teal-300
  doc.setLineWidth(0.75);
  doc.roundedRect(margin, y, contentWidth, promptBoxHeight, 6, 6, "FD");

  doc.text(promptTitle, margin + 12, y + 12);
  doc.setFont("helvetica", "bolditalic");
  doc.setFontSize(9.5);
  doc.setTextColor(19, 44, 39);
  doc.text(promptLines, margin + 12, y + 24);

  y += promptBoxHeight + 14;

  // Section divider before Summary Cards
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setLineWidth(0.75);
  doc.line(margin, y, pageWidth - margin, y);
  y += 16;

  // Section Header for the Clinical Cards
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(71, 85, 105); // slate-600
  const summaryHeader = isSpanish ? "RESUMEN DE LA REACCIÓN REPORTADA" : "REPORTED REACTION SUMMARY";
  doc.text(summaryHeader, margin, y);
  y += 14;

  // Helper to sanitize raw values (prevent "none_selected" or "undefined" from leaking)
  const sanitizeVal = (val: any): string | null => {
    if (val === undefined || val === null) return null;
    const s = String(val).trim();
    if (
      s === "" ||
      s.toLowerCase() === "none_selected" ||
      s.toLowerCase() === "undefined" ||
      s.toLowerCase() === "null"
    ) {
      return null;
    }
    return s;
  };

  // Helper to resolve card values from direct props, summarySections, answers, or defaults
  const resolveCardValue = (
    key: string,
    index: number,
    defaultValue: string
  ): string => {
    const directVal = sanitizeVal(data?.[key]);
    if (directVal) return directVal;

    if (Array.isArray(data?.summarySections) && data.summarySections.length > 0) {
      const byId = data.summarySections.find((s: any) => s.id === key);
      const byIdVal = sanitizeVal(byId?.value);
      if (byIdVal) return byIdVal;
      const byIndexVal = sanitizeVal(data.summarySections[index]?.value);
      if (byIndexVal) return byIndexVal;
    }

    if (data?.answers) {
      const ans = data.answers;
      if (key === "symptoms") {
        const s = ans.symptoms || ans.screen6_1_symptoms;
        if (s) {
          const list: string[] = Array.isArray(s) ? s : [String(s)];
          const cleanList = list.filter((item) => sanitizeVal(item) !== null);
          if (cleanList.length > 0) {
            let res = cleanList.join(", ");
            const rashArr = Array.isArray(ans.rashDetails)
              ? ans.rashDetails
              : (typeof ans.rashDetails === "string" ? (() => { try { return JSON.parse(ans.rashDetails); } catch { return []; } })() : []);
            if (rashArr.length > 0) {
              const formattedDetails = isSpanish
                ? rashArr.map((d: string) => {
                    if (d === "Hives") return "Ronchas";
                    if (d === "Blisters") return "Ampollas";
                    if (d === "Red, fine or bumpy rash") return "Rojo, fino o con protuberancias";
                    if (d === "Flushing") return "Enrojecimiento";
                    if (d === "Pus-filled pimples") return "Granos con pus";
                    if (d === "Unsure" || d.includes("Unsure")) return "No estoy seguro";
                    return d;
                  }).join(", ")
                : rashArr.join(", ");
              res = res.replace(/Rash/i, `Rash (${formattedDetails})`);
              res = res.replace(/Sarpullido/i, `Sarpullido (${formattedDetails})`);
            }
            const swellingArr = Array.isArray(ans.swellingDetails)
              ? ans.swellingDetails
              : (typeof ans.swellingDetails === "string" ? (() => { try { return JSON.parse(ans.swellingDetails); } catch { return []; } })() : []);
            if (swellingArr.length > 0) {
              const formattedSwelling = isSpanish
                ? swellingArr.map((d: string) => {
                    if (d === "Face or eyes" || d === "Face / Eyes") return "Cara u ojos";
                    if (d === "Lips") return "Labios";
                    if (d === "Tongue") return "Lengua";
                    if (d === "Throat") return "Garganta";
                    if (d === "Hands or feet" || d === "Hands / Feet") return "Manos o pies";
                    if (d === "Unsure" || d.includes("Unsure")) return "No estoy seguro";
                    return d;
                  }).join(", ")
                : swellingArr.join(", ");
              res = res.replace(/Swelling/i, `Swelling (${formattedSwelling})`);
              res = res.replace(/Inflamación/i, `Inflamación (${formattedSwelling})`);
            }
            if (ans.symptomsOther) {
              res += `, ${isSpanish ? "Otro" : "Other"}: ${ans.symptomsOther}`;
            }
            return res;
          }
        }
        return isSpanish ? "Ninguno reportado" : "None reported";
      }
      if (key === "age") {
        const a = ans.ageCohort ?? ans.ageAtReaction ?? ans.screen6_2_timing;
        if (a !== undefined && a !== null && a !== "") {
          if (typeof a === "number") return isSpanish ? `${a} años` : `${a} years old`;
          const aStr = String(a);
          if (isSpanish) {
            if (aStr.includes("Baby")) return "Bebé (0-12 meses)";
            if (aStr.includes("Toddler")) return "Niño pequeño (1-3 años)";
            if (aStr.includes("School")) return "Edad escolar (4-12 años)";
            if (aStr.includes("Teen")) return "Adolescente (13-17 años)";
            if (aStr.includes("Adult")) return "Adulto (18+)";
            return !isNaN(Number(aStr)) ? `${aStr} años` : aStr;
          }
          if (!isNaN(Number(aStr)) && !aStr.includes("(") && !aStr.includes("year") && !aStr.includes("month")) {
            return `${aStr} years old`;
          }
          return aStr;
        }
      }
      if (key === "onset") {
        const o = sanitizeVal(ans.onset || ans.screen6_3_onset);
        if (o) {
          if (isSpanish) {
            if (o === "Less than 1 hour" || o === "<1 hour") return "<1 hora";
            if (o === "1-24 hours") return "1-24 horas";
            if (o === "More than 24 hours" || o === "24+ hours") return "Más de 24 horas";
            if (o.startsWith("Unsure")) return "No estoy seguro/No sé";
          } else {
            if (o === "Less than 1 hour") return "<1 hour";
          }
          return o;
        }
        return isSpanish ? "No reportado" : "Not reported";
      }
      if (key === "medicalCare") {
        const m = sanitizeVal(ans.medicalCare || ans.screen6_4_resolution);
        if (m) {
          const loc = sanitizeVal(ans.locationSelected || ans.screen6_4_location);
          if ((m === "Yes" || m === "Sí") && loc) {
            return isSpanish ? `Sí (${loc})` : `Yes (${loc})`;
          }
          return isSpanish ? (m === "Yes" ? "Sí" : m) : m;
        }
      }
      if (key === "resolution") {
        const r = sanitizeVal(ans.resolution || ans.screen6_4b_resolution_type);
        if (r) {
          let medsList: string[] = [];
          if (Array.isArray(ans.resolutionMedicines)) {
            medsList = ans.resolutionMedicines;
          } else if (typeof ans.resolutionMedicines === "string") {
            try {
              const p = JSON.parse(ans.resolutionMedicines);
              medsList = Array.isArray(p) ? p : [ans.resolutionMedicines];
            } catch {
              medsList = [ans.resolutionMedicines];
            }
          } else if (ans.medicineSelected || ans.screen6_4b_medicine) {
            medsList = [ans.medicineSelected || ans.screen6_4b_medicine];
          }
          const medStr = medsList.filter((m) => sanitizeVal(m) !== null).join(", ");
          const rt = sanitizeVal(ans.routeSelected || ans.screen6_4b_route || ans.resolutionRoute);
          if ((r === "With medication" || r === "Con medicamentos") && (medStr || rt)) {
            const extra = [medStr, rt].filter(Boolean).join(" - ");
            return isSpanish ? `Con medicamentos (${extra})` : `With medication (${extra})`;
          }
          return isSpanish ? (r === "With medication" ? "Con medicamentos" : r) : r;
        }
      }
      if (key === "repeatUse") {
        const u = sanitizeVal(ans.repeatUse || ans.screen6_5_yetagain);
        if (u) {
          const d = sanitizeVal(ans.reactionDetailSelected || ans.screen6_5_reaction_detail);
          if ((u === "Yes" || u === "Sí") && d) {
            return isSpanish ? `Sí (${d})` : `Yes (${d})`;
          }
          return isSpanish ? (u === "Yes" ? "Sí" : u) : u;
        }
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
        data?.symptoms || (isSpanish ? "Ninguno reportado" : "None reported")
      ),
    },
    {
      label: isSpanish ? "EDAD AL MOMENTO DE LA REACCIÓN" : "AGE AT REACTION",
      value: resolveCardValue("age", 1, data?.age || (isSpanish ? "17 años" : "17 years old")),
    },
    {
      label: isSpanish ? "TIEMPO HASTA EL INICIO" : "TIME TO ONSET",
      value: resolveCardValue("onset", 2, data?.onset || (isSpanish ? "Más de 24 horas" : "24+ hours")),
    },
    {
      label: isSpanish ? "ATENCIÓN MÉDICA RECIBIDA" : "MEDICAL CARE RECEIVED",
      value: resolveCardValue("medicalCare", 3, data?.medicalCare || (isSpanish ? "No" : "No")),
    },
    {
      label: isSpanish ? "RESOLUCIÓN DE SÍNTOMAS" : "SYMPTOM RESOLUTION",
      value: resolveCardValue(
        "resolution",
        4,
        data?.resolution || (isSpanish ? "Por sí sola" : "On its own")
      ),
    },
    {
      label: isSpanish ? "PENICILINA DESDE LA REACCIÓN" : "PENICILLIN SINCE REACTION",
      value: resolveCardValue(
        "repeatUse",
        5,
        data?.repeatUse || (isSpanish ? "No" : "No")
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
    const cardHeight = Math.max(leftValLines.length, rightValLines.length, 1) * 14 + 44;

    // Draw Left Card Box
    doc.setFillColor(248, 250, 252); // slate-50 background
    doc.setDrawColor(226, 232, 240); // slate-200 border
    doc.setLineWidth(0.75);
    doc.roundedRect(margin, y, colWidth, cardHeight, 8, 8, "FD");

    // Left Card Label
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text(leftCard.label, margin + 14, y + 17);

    // Left Card Value
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text(leftValLines, margin + 14, y + 33);

    // Draw Right Card Box (if exists)
    if (rightCard) {
      const rightX = margin + colWidth + 16;
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.75);
      doc.roundedRect(rightX, y, colWidth, cardHeight, 8, 8, "FD");

      // Right Card Label
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139);
      doc.text(rightCard.label, rightX + 14, y + 17);

      // Right Card Value
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      doc.setTextColor(15, 23, 42);
      doc.text(rightValLines, rightX + 14, y + 33);
    }

    y += cardHeight + 12;
  }

  // 4. Footer Note
  y += 12;
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8.5);
  doc.setTextColor(148, 163, 184); // slate-400
  const footerText = isSpanish
    ? "Documento generado por la plataforma del estudio PEN-PAL para revisión clínica con su proveedor de salud."
    : "Document generated by the PEN-PAL Study Platform for clinical review with your healthcare provider.";
  doc.text(footerText, pageWidth / 2, y, { align: "center" });

  // Save the PDF
  const filename = `PEN-PAL_Summary_${data?.participantId || data?.token || "Participant"}.pdf`;
  doc.save(filename);
}

export default generateAssessmentPDF;
