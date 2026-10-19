/**
 * Unified clinical data formatting engine for PEN-PAL assessment results.
 * Used identically across:
 * 1. Slide18SummaryScreen (In-flow parent summary)
 * 2. Assessment Report Page (/intervention/report)
 * 3. Assessment PDF Generator (generateAssessmentPDF)
 */

export interface FormattedAssessmentData {
  medicationName: string;
  symptoms: string;
  symptomsArray: string[];
  age: string;
  onset: string;
  medicalCare: string;
  medicalCareLocation?: string;
  resolution: string;
  resolutionMedicines?: string[];
  resolutionRoute?: string;
  repeatUse: string;
  repeatUseDetail?: string;
  summaryTableRows: { label: string; value: string }[];
}

export function formatAssessmentData(
  answers: Record<string, any> = {},
  isSpanish: boolean = false
): FormattedAssessmentData {
  // 1. Medication Name
  const medicationName =
    answers?.medicationName ||
    answers?.screen2_naming ||
    answers?.slide2_naming ||
    answers?.q2_allergy ||
    (isSpanish ? "penicilina" : "penicillin");

  // 2. Symptoms, Rash Details, Swelling Details, and Other
  let rawSymptoms = answers?.symptoms || answers?.screen6_1_symptoms || answers?.q3_symptoms || [];
  if (typeof rawSymptoms === "string") {
    try {
      if (rawSymptoms.startsWith("[")) rawSymptoms = JSON.parse(rawSymptoms);
      else rawSymptoms = [rawSymptoms];
    } catch {
      rawSymptoms = [rawSymptoms];
    }
  }
  const symptomsArray: string[] = Array.isArray(rawSymptoms)
    ? rawSymptoms.filter(Boolean)
    : [String(rawSymptoms)].filter(Boolean);

  let rawRash = answers?.rashDetails || answers?.screen6_1_rash_types || answers?.rashTypes || [];
  if (typeof rawRash === "string") {
    try {
      if (rawRash.startsWith("[")) rawRash = JSON.parse(rawRash);
      else rawRash = [rawRash];
    } catch {
      rawRash = [rawRash];
    }
  }
  const rashArray: string[] = Array.isArray(rawRash) ? rawRash.filter(Boolean) : [];

  let rawSwelling = answers?.swellingDetails || answers?.screen6_1_swelling_types || answers?.swellingTypes || [];
  if (typeof rawSwelling === "string") {
    try {
      if (rawSwelling.startsWith("[")) rawSwelling = JSON.parse(rawSwelling);
      else rawSwelling = [rawSwelling];
    } catch {
      rawSwelling = [rawSwelling];
    }
  }
  const swellingArray: string[] = Array.isArray(rawSwelling) ? rawSwelling.filter(Boolean) : [];

  let symptomsFormatted = isSpanish ? "Ninguno reportado" : "None reported";
  if (symptomsArray.length > 0) {
    const formattedItems = symptomsArray.map((s) => {
      if (s === "Rash" || s === "Erupción cutánea" || s === "Sarpullido") {
        if (rashArray.length > 0) {
          const detailStr = isSpanish
            ? rashArray
                .map((d) => {
                  if (d === "Hives") return "Urticaria";
                  if (d === "Blisters") return "Ampollas";
                  if (d === "Red, fine or bumpy rash") return "Rojo, fino o con protuberancias";
                  if (d === "Flushing") return "Enrojecimiento";
                  if (d === "Pus-filled pimples") return "Granos con pus";
                  if (d.includes("Unsure")) return "No estoy seguro";
                  return d;
                })
                .join(", ")
            : rashArray.join(", ");
          return isSpanish ? `Erupción cutánea (${detailStr})` : `Rash (${detailStr})`;
        }
        return isSpanish ? "Erupción cutánea" : "Rash";
      }

      if (s === "Swelling" || s === "Hinchazón" || s === "Inflamación") {
        if (swellingArray.length > 0) {
          const detailStr = isSpanish
            ? swellingArray
                .map((d) => {
                  if (d === "Face swelling" || d.includes("Face")) return "Cara u ojos";
                  if (d === "Lip swelling" || d.includes("Lip")) return "Labios";
                  if (d === "Throat swelling" || d.includes("Throat")) return "Garganta";
                  if (d === "Tongue swelling" || d.includes("Tongue")) return "Lengua";
                  if (d.includes("Hands") || d.includes("feet")) return "Manos o pies";
                  if (d.includes("Unsure")) return "No estoy seguro/No lo sé";
                  return d;
                })
                .join(", ")
            : swellingArray.join(", ");
          return isSpanish ? `Hinchazón (${detailStr})` : `Swelling (${detailStr})`;
        }
        return isSpanish ? "Hinchazón" : "Swelling";
      }

      if (isSpanish) {
        if (s === "Hives") return "Urticaria";
        if (s === "Throat tightness") return "Opresión en la garganta";
        if (s === "Trouble breathing") return "Dificultad para respirar";
        if (s === "Vomiting/Diarrhea") return "Vómitos/Diarrea";
        if (s.includes("Unsure") || s.includes("know")) return "No estoy seguro/ No lo sé";
      }
      return s;
    });

    if (answers?.symptomsOther) {
      formattedItems.push(isSpanish ? `Otro: ${answers.symptomsOther}` : `Other: ${answers.symptomsOther}`);
    }
    symptomsFormatted = formattedItems.join(", ");
  }

  // 3. Age at Reaction
  const rawAge = answers?.ageCohort || answers?.ageAtReaction || answers?.screen6_2_timing;
  const formatAgeValue = (val: any) => {
    if (!val || val === "none_selected") return isSpanish ? "No reportado" : "Not reported";
    const valStr = String(val);
    if (!isNaN(Number(valStr))) return isSpanish ? `${valStr} años` : `${valStr}-years old`;
    if (valStr.includes("Baby")) return isSpanish ? "Bebé (0-12 meses)" : "Baby (0-12 months)";
    if (valStr.includes("Toddler")) return isSpanish ? "Niño pequeño (1-3 años)" : "Toddler (1-3 years)";
    if (valStr.includes("School")) return isSpanish ? "Edad escolar (4-12 años)" : "School-aged (4-12 years)";
    if (valStr.includes("Teen")) return isSpanish ? "Adolescente (13-17 años)" : "Teen (13-17 years)";
    if (valStr.includes("Adult")) return isSpanish ? "Adulto (18+)" : "Adult (18+)";
    return valStr;
  };
  const ageFormatted = formatAgeValue(rawAge);

  // 4. Time to Onset
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
      return isSpanish ? "24+ horas" : "24+ hours";
    }
    if (valStr.toLowerCase().includes("unsure") || valStr.toLowerCase().includes("know")) {
      return isSpanish ? "No estoy seguro" : "Unsure";
    }
    return valStr;
  };
  const onsetFormatted = formatOnsetValue(rawOnset);

  // 5. Medical Care Received & Location
  const rawMedicalCare = answers?.medicalCareReceived || answers?.screen6_4_resolution || answers?.medicalCare;
  const rawLocation = answers?.medicalCareLocation || answers?.screen6_4_location || answers?.locationSelected;
  let medicalCareFormatted = isSpanish ? "No" : "No";
  if (rawMedicalCare === "Yes" || rawMedicalCare === "Sí") {
    if (rawLocation && rawLocation !== "none_selected") {
      let locDisplay = rawLocation;
      if (isSpanish) {
        if (locDisplay.includes("Doctor") || locDisplay.includes("Clinic")) locDisplay = "Consultorio médico / Clínica";
        else if (locDisplay.includes("Emergency") || locDisplay.includes("Hospital")) locDisplay = "Sala de emergencias / Hospital";
        else if (locDisplay.includes("Urgent")) locDisplay = "Atención de urgencia";
      }
      medicalCareFormatted = isSpanish ? `Sí (${locDisplay})` : `Yes (${locDisplay})`;
    } else {
      medicalCareFormatted = isSpanish ? "Sí" : "Yes";
    }
  } else if (rawMedicalCare && (rawMedicalCare.toLowerCase().includes("unsure") || rawMedicalCare.toLowerCase().includes("know"))) {
    medicalCareFormatted = isSpanish ? "No estoy seguro" : "Unsure";
  } else if (rawMedicalCare === "No") {
    medicalCareFormatted = isSpanish ? "No" : "No";
  }

  // 6. Symptom Resolution, Medicines, & Administration Route
  const resVal = answers?.resolution || answers?.screen6_4b_resolution_type;
  let resolutionFormatted = isSpanish ? "Por sí sola" : "On its own";
  if (resVal === "With medication" || resVal === "Con medicamentos" || resVal === "Con medicación") {
    let meds = answers?.resolutionMedicines || (answers?.screen6_4b_medicine ? [answers.screen6_4b_medicine] : []);
    if (typeof meds === "string") {
      try {
        meds = JSON.parse(meds);
      } catch {
        meds = [meds];
      }
    }
    const route = answers?.resolutionRoute || answers?.screen6_4b_route || answers?.routeSelected;
    let medStr = Array.isArray(meds) && meds.length > 0 ? meds[0]?.split(" (")[0] : "Allergy medicine";
    if (isSpanish) {
      if (medStr.includes("Antihistamine") || medStr.includes("Benadryl")) medStr = "Antihistamínico";
      else if (medStr.includes("Steroid")) medStr = "Esteroides";
      else if (medStr.includes("Epi")) medStr = "Epinefrina";
    }
    let routeDisplay = route;
    if (isSpanish && route) {
      if (route.includes("mouth") || route.includes("liquid") || route.includes("pill")) routeDisplay = "Por boca";
      else if (route.includes("Shot") || route.includes("Injection")) routeDisplay = "Inyección";
      else if (route.includes("IV") || route.includes("vein")) routeDisplay = "Vía intravenosa";
    }
    if (medStr && routeDisplay) {
      resolutionFormatted = isSpanish
        ? `Con medicación (${medStr}, ${routeDisplay})`
        : `With medication (${medStr}, ${routeDisplay})`;
    } else if (medStr) {
      resolutionFormatted = isSpanish ? `Con medicación (${medStr})` : `With medication (${medStr})`;
    } else {
      resolutionFormatted = isSpanish ? "Con medicación" : "With medication";
    }
  } else if (resVal && (resVal.toLowerCase().includes("unsure") || resVal.toLowerCase().includes("know"))) {
    resolutionFormatted = isSpanish ? "No estoy seguro" : "Unsure";
  }

  // 7. Repeat Penicillin Exposure & Reaction Outcome
  const repeatVal = answers?.repeatPenicillin || answers?.screen6_5_yetagain || answers?.repeatUse;
  const detailVal = answers?.repeatPenicillinDetail || answers?.screen6_5_reaction_detail || answers?.reactionDetailSelected;
  let repeatUseFormatted = isSpanish
    ? "No, el niño no ha recibido penicilina desde la reacción"
    : "No, child has not received penicillin since the reaction";

  if (repeatVal === "Unsure" || (repeatVal && repeatVal.toLowerCase().includes("unsure"))) {
    repeatUseFormatted = isSpanish
      ? "No estoy seguro si el niño ha recibido penicilina desde la reacción"
      : "Unsure if child has received penicillin since the reaction";
  } else if (repeatVal === "Yes" || repeatVal === "Sí") {
    if (detailVal && detailVal.includes("not have a reaction")) {
      repeatUseFormatted = isSpanish ? "Sí, y no tuvieron reacción" : "Yes, and they did not have a reaction";
    } else if (detailVal && detailVal.includes("had a reaction")) {
      repeatUseFormatted = isSpanish ? "Sí, y tuvieron reacción" : "Yes, and they had a reaction";
    } else {
      repeatUseFormatted = isSpanish ? "Sí" : "Yes";
    }
  }

  // Summary Table Rows in chronological questionnaire sequence
  const summaryTableRows = [
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
      label: isSpanish ? "Atención médica recibida" : "Medical care received for reaction",
      value: medicalCareFormatted,
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

  return {
    medicationName,
    symptoms: symptomsFormatted,
    symptomsArray,
    age: ageFormatted,
    onset: onsetFormatted,
    medicalCare: medicalCareFormatted,
    medicalCareLocation: rawLocation,
    resolution: resolutionFormatted,
    resolutionMedicines: answers?.resolutionMedicines,
    resolutionRoute: answers?.screen6_4b_route || answers?.resolutionRoute,
    repeatUse: repeatUseFormatted,
    repeatUseDetail: detailVal,
    summaryTableRows,
  };
}
