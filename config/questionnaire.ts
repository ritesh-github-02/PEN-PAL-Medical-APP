export type QuestionType = 'intro' | 'statistics' | 'education' | 'testing_info' | 'testimonial' | 'single_choice' | 'multiple_choice' | 'slider' | 'text' | 'boolean' | 'likert' | 'summary';

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
  contentEn?: string; // For narrative content
  contentEs?: string;
  audioEn?: string; // Voiceover URL for English
  audioEs?: string; // Voiceover URL for Spanish
  options?: QuestionnaireOption[];
  required?: boolean;
  // For slider: min, max, unit
  min?: number;
  max?: number;
  unitEn?: string;
  unitEs?: string;
  nextStepId?: string | null;
  branchLogic?: {
    value: string;
    targetStepId: string;
  }[];
  isTerminal?: boolean;
}

export const questionnaireConfig: QuestionnaireStep[] = [
  // Screen 1: Introduction
  {
    id: 'screen1_intro',
    type: 'intro',
    titleEn: 'PEN-PAL',
    titleEs: 'PEN-PAL',
    descriptionEn: 'Parents Engaged in Penicillin Allergies',
    descriptionEs: 'Padres Involucrados en Alergias a la Penicilina',
    contentEn: 'This is nurse Anna. Anna is giving information about allergies to penicillin in kids.\n\nDo you want to know more?',
    contentEs: 'Esta es la enfermera Anna. Anna está brindando información sobre alergias a la penicilina en niños.\n\n¿Quieres saber más?',
    required: true,
    branchLogic: [
      { value: 'yes', targetStepId: 'screen2_statistics' },
      { value: 'no', targetStepId: 'screen_end' }
    ]
  },
  // Screen 2: Statistics
  {
    id: 'screen2_statistics',
    type: 'statistics',
    titleEn: 'Most kids who are told they are allergic to penicillin can safely take it.',
    titleEs: 'La mayoría de los niños a quienes se les dice que son alérgicos a la penicilina pueden tomarla de manera segura.',
    contentEn: 'Out of 100 kids who are said to have a penicillin allergy, only 5 have a real allergy',
    contentEs: 'De 100 niños que se dice que tienen alergia a la penicilina, solo 5 tienen una alergia real',
    required: true,
    nextStepId: 'screen3_education'
  },
  // Screen 3: Education
  {
    id: 'screen3_education',
    type: 'education',
    titleEn: 'Why do people often think children are allergic to penicillin when they are not?',
    titleEs: '¿Por qué la gente a menudo piensa que los niños son alérgicos a la penicilina cuando no lo son?',
    contentEn: '• The rash came from a virus, not penicillin.\n• Some kids felt sick or had diarrhea, but that was not an allergy.\n• People think allergies come from parents, but they do not.\n• Some kids had an allergy, but the allergy went away as they got older.',
    contentEs: '• El sarpullido provino de un virus, no de la penicilina.\n• Algunos niños se sintieron mal o tuvieron diarrea, pero eso no fue una alergia.\n• La gente piensa que las alergias provienen de los padres, pero no es así.\n• Algunos niños tenían una alergia, pero la alergia desapareció cuando crecieron.',
    required: true,
    nextStepId: 'screen4_testing'
  },
  // Screen 4: Testing Info
  {
    id: 'screen4_testing',
    type: 'testing_info',
    titleEn: 'Speak with your child\'s doctor to see if testing is right for your child!',
    titleEs: '¡Hable con el médico de su hijo para ver si las pruebas son apropiadas para su hijo!',
    contentEn: '• There is a test that can tell if your child has a penicillin allergy.\n• For the test, kids take medicine by mouth.\n• Sometimes, kids also take medicine through a skin prick.\n\nIf your child can safely take penicillin, have the allergy removed from their medical record.',
    contentEs: '• Hay una prueba que puede determinar si su hijo tiene alergia a la penicilina.\n• Para la prueba, los niños toman medicina por la boca.\n• A veces, los niños también toman medicina a través de un pinchazo en la piel.\n\nSi su hijo puede tomar penicilina de manera segura, retire la alergia de su historial médico.',
    required: true,
    nextStepId: 'screen5_testimonial'
  },
  // Screen 5: Testimonials
  {
    id: 'screen5_testimonial',
    type: 'testimonial',
    titleEn: 'Here\'s what parents had to say about testing:',
    titleEs: 'Esto es lo que los padres tenían que decir sobre las pruebas:',
    contentEn: '• Parents liked knowing the truth about their child.\n• Parents were happy knowing that their child could receive the best medicine.\n• Parents felt good knowing they had one less thing to worry about.\n• Parents were happy because penicillin doesn\'t cost much and is easy to get.',
    contentEs: '• A los padres les gustó conocer la verdad sobre su hijo.\n• Los padres estaban felices sabiendo que su hijo podría recibir la mejor medicina.\n• Los padres se sintieron bien sabiendo que tenían una cosa menos de qué preocuparse.\n• Los padres estaban felices porque la penicilina no cuesta mucho y es fácil de conseguir.',
    required: true,
    nextStepId: 'screen6_survey_intro'
  },
  // Screen 6: Survey Introduction
  {
    id: 'screen6_survey_intro',
    type: 'text',
    titleEn: 'Tell us what happened when your child was said to be allergic to penicillin',
    titleEs: 'Cuéntanos qué pasó cuando se dijo que tu hijo era alérgico a la penicilina',
    contentEn: 'This will help determine if testing is right for your child.',
    contentEs: 'Esto ayudará a determinar si las pruebas son apropiadas para su hijo.',
    required: true,
    nextStepId: 'screen6_1_symptoms'
  },
  // Screen 6.1: Symptoms
  {
    id: 'screen6_1_symptoms',
    type: 'multiple_choice',
    titleEn: 'What happened to your child after taking penicillin?',
    titleEs: '¿Qué le pasó a su hijo después de tomar penicilina?',
    options: [
      { value: 'Rash', labelEn: 'Rash', labelEs: 'Sarpullido' },
      { value: 'Swelling', labelEn: 'Swelling', labelEs: 'Hinchazón' },
      { value: 'Fainting or dizziness', labelEn: 'Fainting or dizziness', labelEs: 'Desmayo o mareo' },
      { value: 'Itchiness', labelEn: 'Itchiness', labelEs: 'Picazón' },
      { value: 'Throat tightness', labelEn: 'Throat tightness', labelEs: 'Estrechez de garganta' },
      { value: 'Shortness of breath', labelEn: 'Shortness of breath', labelEs: 'Falta de aire' },
      { value: 'Fever', labelEn: 'Fever (new fever or worse fever)', labelEs: 'Fiebre (fiebre nueva o peor)' },
      { value: 'Abdominal pain', labelEn: 'Abdominal pain', labelEs: 'Dolor abdominal' },
      { value: 'Diarrhea', labelEn: 'Diarrhea', labelEs: 'Diarrea' },
      { value: 'Joint pain and swelling', labelEn: 'Joint pain and swelling', labelEs: 'Dolor e hinchazón articular' },
      { value: 'Nausea or vomiting', labelEn: 'Nausea or vomiting', labelEs: 'Náuseas o vómitos' },
      { value: 'Muscle aches', labelEn: 'Muscle aches', labelEs: 'Dolores musculares' }
    ],
    required: true,
    nextStepId: 'screen6_2_timing'
  },
  // Screen 6.2: Timing (Age)
  {
    id: 'screen6_2_timing',
    type: 'slider',
    titleEn: 'What age was your child when something happened after taking penicillin?',
    titleEs: '¿Qué edad tenía su hijo cuando algo sucedió después de tomar penicilina?',
    min: 1,
    max: 26,
    unitEn: 'year-old',
    unitEs: 'años',
    required: true,
    nextStepId: 'screen6_3_onset'
  },
  // Screen 6.3: Onset
  {
    id: 'screen6_3_onset',
    type: 'single_choice',
    titleEn: 'How long after taking penicillin did your child have a reaction?',
    titleEs: '¿Cuánto tiempo después de tomar penicilina tuvo su hijo una reacción?',
    options: [
      { value: 'Less than 1 hour', labelEn: '<1 hour', labelEs: '<1 hora' },
      { value: '1-24 hours', labelEn: '1-24 hours', labelEs: '1-24 horas' },
      { value: 'More than 24 hours', labelEn: '24+ hours', labelEs: '24+ horas' },
      { value: 'Unsure', labelEn: 'Unsure/I don\'t know', labelEs: 'Inseguro/No lo sé' }
    ],
    required: true,
    nextStepId: 'screen6_4_resolution'
  },
  // Screen 6.4: Resolution
  {
    id: 'screen6_4_resolution',
    type: 'single_choice',
    titleEn: 'How did your child\'s reaction go away?',
    titleEs: '¿Cómo desapareció la reacción de su hijo?',
    options: [
      { value: 'With medication', labelEn: 'With medication', labelEs: 'Con medicación' },
      { value: 'On its own', labelEn: 'On its own', labelEs: 'Por sí solo' },
      { value: 'Over time', labelEn: 'Over time', labelEs: 'Con el tiempo' },
      { value: 'Unknown', labelEn: 'Unknown', labelEs: 'Desconocido' }
    ],
    required: true,
    nextStepId: 'screen6_5_yetagain'
  },
  // Screen 6.5: Yet Again
  {
    id: 'screen6_5_yetagain',
    type: 'single_choice',
    titleEn: 'Has your child received penicillin since the reaction?',
    titleEs: '¿Ha recibido su hijo penicilina desde la reacción?',
    options: [
      { value: 'Yes', labelEn: 'Yes', labelEs: 'Sí' },
      { value: 'No', labelEn: 'No', labelEs: 'No' },
      { value: 'Unsure', labelEn: 'Unsure/Don\'t know', labelEs: 'Inseguro/No lo sé' }
    ],
    required: true,
    nextStepId: 'screen7_summary'
  },
  // Screen 7: Summary & Action Steps
  {
    id: 'screen7_summary',
    type: 'summary',
    titleEn: 'Action Steps for Parents',
    titleEs: 'Pasos de Acción para Padres',
    contentEn: '#1. Give the table below to your child\'s doctor. This says what happened when your child took penicillin.\n\n#2. Bring pictures of your child\'s reaction to the doctor\'s visit.\n\n#3. Ask your child\'s doctor if testing is right for your child.\n\nHere\'s what you can say:\n"I read about penicillin allergy testing in kids. It seems testing is good for kids. Could we talk about whether this might be right for my child?"',
    contentEs: '#1. Dé la tabla a continuación al médico de su hijo. Esto dice lo que pasó cuando su hijo tomó penicilina.\n\n#2. Traiga fotos de la reacción de su hijo a la cita del médico.\n\n#3. Pregúntele al médico de su hijo si las pruebas son apropiadas para su hijo.\n\nAquí está lo que puede decir:\n"Leí sobre las pruebas de alergia a la penicilina en niños. Parece que las pruebas son buenas para los niños. ¿Podríamos hablar sobre si esto podría ser apropiado para mi hijo?"',
    required: true,
    isTerminal: true
  },
  // End screen
  {
    id: 'screen_end',
    type: 'text',
    titleEn: 'Thank you',
    titleEs: 'Gracias',
    descriptionEn: 'Thank you for your interest in PEN-PAL.',
    descriptionEs: 'Gracias por su interés en PEN-PAL.',
    isTerminal: true
  }
];
