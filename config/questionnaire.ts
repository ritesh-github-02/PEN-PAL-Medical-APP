export type QuestionType = 'single_choice' | 'multiple_choice' | 'text' | 'boolean' | 'likert';

export interface QuestionnaireOption {
  value: string;
  labelEn: string;
  labelEs: string;
}

export interface QuestionnaireStep {
  id: string;
  type: QuestionType;
  titleEn: string;
  titleEs: string;
  descriptionEn?: string;
  descriptionEs?: string;
  audioEn?: string; // Voiceover URL for English
  audioEs?: string; // Voiceover URL for Spanish
  options?: QuestionnaireOption[];
  required?: boolean;
  // Next step if this question is answered (can be overridden by option-level branching)
  nextStepId?: string | null;
  // Branching: if answer equals `value`, go to `targetStepId`
  branchLogic?: {
    value: string;
    targetStepId: string;
  }[];
  isTerminal?: boolean; // If true, end of questionnaire
}

export const questionnaireConfig: QuestionnaireStep[] = [
  {
    id: 'q1_history',
    type: 'boolean',
    titleEn: 'Does your child have a documented history of an allergy?',
    titleEs: '¿Tiene su hijo(a) un historial documentado de alergia?',
    required: true,
    branchLogic: [
      { value: 'true', targetStepId: 'q2_allergy' },
      { value: 'false', targetStepId: 'q_terminal_not_eligible' }
    ],
    nextStepId: 'q2_allergy'
  },
  {
    id: 'q2_allergy',
    type: 'single_choice',
    titleEn: 'Which allergy does your child have?',
    titleEs: '¿Qué alergia tiene su hijo(a)?',
    options: [
      { value: 'Penicillin', labelEn: 'Penicillin', labelEs: 'Penicilina' },
      { value: 'Peanut', labelEn: 'Peanut', labelEs: 'Maní (Cacahuate)' },
      { value: 'Dust Mite', labelEn: 'Dust Mite', labelEs: 'Ácaros del polvo' },
      { value: 'Pet Dander', labelEn: 'Pet Dander', labelEs: 'Caspa de mascotas' },
      { value: 'Other', labelEn: 'Other / Unknown', labelEs: 'Otra / No lo sé' }
    ],
    required: true,
    nextStepId: 'q3_symptoms'
  },
  {
    id: 'q3_symptoms',
    type: 'multiple_choice',
    titleEn: 'What symptoms did they experience? (Select all that apply)',
    titleEs: '¿Qué síntomas experimentaron? (Seleccione todas las que apliquen)',
    options: [
      { value: 'Rash or Hives', labelEn: 'Rash or Hives', labelEs: 'Sarpullido o ronchas' },
      { value: 'Difficulty breathing', labelEn: 'Difficulty breathing', labelEs: 'Dificultad para respirar' },
      { value: 'Swelling of face/throat', labelEn: 'Swelling of face/throat', labelEs: 'Hinchazón de cara/garganta' },
      { value: 'Vomiting or Nausea', labelEn: 'Vomiting or Nausea', labelEs: 'Vómitos o Náuseas' },
      { value: 'Unknown', labelEn: 'I do not know', labelEs: 'No lo sé' }
    ],
    required: true,
    nextStepId: 'q_terminal_success'
  },
  {
    id: 'q_terminal_not_eligible',
    type: 'text',
    titleEn: 'Not Eligible',
    titleEs: 'No Elegible',
    descriptionEn: 'Based on your response, you are not eligible for this branch of the study. Thank you.',
    descriptionEs: 'Basado en su respuesta, no es elegible para esta rama del estudio. Gracias.',
    isTerminal: true
  },
  {
    id: 'q_terminal_success',
    type: 'text',
    titleEn: 'Questionnaire Complete',
    titleEs: 'Cuestionario Completado',
    descriptionEn: 'You have completed the initial questionnaire. We have generated a report for you.',
    descriptionEs: 'Ha completado el cuestionario inicial. Hemos generado un reporte para usted.',
    isTerminal: true
  }
];
