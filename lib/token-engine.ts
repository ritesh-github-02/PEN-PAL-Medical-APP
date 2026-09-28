/**
 * PEN-PAL V2 Dynamic Token Engine
 * Replaces [name] and [Name] placeholders with parent-selected medication name.
 */

export const MEDICINE_OPTIONS = [
  { value: "Penicillin", labelEn: "Penicillin", labelEs: "Penicilina" },
  { value: "Pink medicine", labelEn: '"Pink medicine"', labelEs: '"Medicina rosa"' },
  { value: "Amoxicillin", labelEn: "Amoxicillin", labelEs: "Amoxicilina" },
  { value: "Amoxicillin Clavulanate", labelEn: "Amoxicillin Clavulanate", labelEs: "Amoxicilina clavulanato" },
  { value: "Augmentin", labelEn: "Augmentin", labelEs: "Augmentin" },
] as const;

export function resolveMedicineToken(
  text: string | undefined | null,
  medicationName?: string,
  isSpanish?: boolean
): string {
  if (!text) return "";
  const fallback = isSpanish ? "la penicilina" : "penicillin";
  const chosen = medicationName && medicationName.trim() ? medicationName : fallback;

  // Replace [ name ], [name], [NAME], [Name]
  return text
    .replace(/\[\s*name\s*\]/gi, chosen)
    .replace(/\[name\]/gi, chosen)
    .replace(/\[Name\]/g, chosen);
}
