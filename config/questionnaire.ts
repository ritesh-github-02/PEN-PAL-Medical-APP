export type QuestionType = 'intro' | 'statistics' | 'education' | 'testing_info' | 'testimonial' | 'single_choice' | 'multiple_choice' | 'slider' | 'text' | 'boolean' | 'likert' | 'summary' | 'knowledge_revelation';

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
    audioEn: '/audio/exported/screen1_intro_en.mp3',
    audioEs: '/audio/exported/screen1_intro_es.mp3',
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
    titleEn: 'Most kids who are told they are allergic to penicillin (amoxicillin) can safely take it.',
    titleEs: 'La mayoría de los niños a los que se les dice que son alérgicos a la penicilina (amoxicilina) pueden tomarla de manera segura.',
    contentEn: 'Out of 100 kids who are said to have a penicillin (amoxicillin) allergy',
    contentEs: 'De cada 100 niños que se dice que tienen alergia a la penicilina (amoxicilina)',
    audioEn: '/audio/exported/screen2_statistics_en.mp3',
    audioEs: '/audio/exported/screen2_statistics_es.mp3',
    required: true,
    nextStepId: 'screen3_5_knowledge_test'
  },
  // Screen 3.5: Knowledge Test
  {
    id: 'screen3_5_knowledge_test',
    type: 'multiple_choice',
    titleEn: 'What is true about penicillin?',
    titleEs: '¿Qué es cierto sobre la penicilina?',
    descriptionEn: 'Test your knowledge!',
    descriptionEs: '¡Ponga a prueba sus conocimientos!',
    audioEn: '/audio/exported/screen3_5_knowledge_test_en.mp3',
    audioEs: '/audio/exported/screen3_5_knowledge_test_es.mp3',
    options: [
      { value: 'curing_illnesses', labelEn: 'It is the best at curing many illnesses in kids and adults.', labelEs: 'Es lo mejor para curar muchas enfermedades en niños y adultos.' },
      { value: 'less_side_effects', labelEn: 'It has less side-effects than other antibiotics.', labelEs: 'Tiene menos efectos secundarios que otros antibióticos.' },
      { value: 'tastes_bubblegum', labelEn: 'Kids tend to like the way it tastes, like bubblegum!', labelEs: '¡A los niños les gusta cómo sabe, como el chicle!' },
      { value: 'cheaper_antibiotics', labelEn: 'It is cheaper than other antibiotics.', labelEs: 'Es más barata que otros antibióticos.' }
    ],
    required: false,
    nextStepId: 'screen3_6_all_correct'
  },
  // Screen 3.6: All Correct Revelation
  {
    id: 'screen3_6_all_correct',
    type: 'knowledge_revelation',
    titleEn: 'All the statements about penicillin are correct!',
    titleEs: '¡Todas las afirmaciones sobre la penicilina son correctas!',
    descriptionEn: 'All 4 facts are true:',
    descriptionEs: 'Los 4 datos son verdaderos:',
    audioEn: '/audio/exported/screen3_5_knowledge_test_en.mp3',
    audioEs: '/audio/exported/screen3_5_knowledge_test_es.mp3',
    options: [
      { value: 'curing_illnesses', labelEn: '1. It is the best at curing many illnesses in kids and adults.', labelEs: '1. Es lo mejor para curar muchas enfermedades en niños y adultos.' },
      { value: 'less_side_effects', labelEn: '2. It has less side-effects than other antibiotics.', labelEs: '2. Tiene menos efectos secundarios que otros antibióticos.' },
      { value: 'tastes_bubblegum', labelEn: '3. Kids tend to like the way it tastes, like bubblegum!', labelEs: '3. ¡A los niños les gusta cómo sabe, como el chicle!' },
      { value: 'cheaper_antibiotics', labelEn: '4. It is cheaper than other antibiotics.', labelEs: '4. Es más barata que otros antibióticos.' }
    ],
    required: true,
    nextStepId: 'screen4_testing'
  },
  // Screen 4: Testing Info
  {
    id: 'screen4_testing',
    type: 'testing_info',
    titleEn: 'Talk to the doctor about your child\'s allergy!',
    titleEs: '¡Hable con el médico sobre la alergia de su hijo!',
    contentEn: '• Doctors can check to see if your child\'s reaction was just a side-effect and not an allergy.\n• There is also a simple test that can tell if your child has an allergy.\n    For the test, kids swallow medicine.\n    Sometimes, kids also take medicine through a skin prick.\n\nIf your child can safely take penicillin, they are not allergic.',
    contentEs: 'Los médicos pueden comprobar si la reacción de su hijo fue solo un efecto secundario y no una alergia.\n\nTambién hay una prueba simple que puede saber si su hijo tiene una alergia.\n* Para la prueba, los niños tragan medicamentos.\n* A veces, los niños también toman medicamentos a través de un pinchazo en la piel.\n\nSi su hijo puede tomar penicilina de manera segura, no es alérgico.',
    audioEn: '/audio/exported/screen4_testing_en.mp3',
    audioEs: '/audio/exported/screen4_testing_es.mp3',
    required: true,
    nextStepId: 'screen6_survey_intro'
  },
  // Screen 6: Survey Introduction
  {
    id: 'screen6_survey_intro',
    type: 'text',
    titleEn: 'The next set of questions can help you and the doctor see what\'s best for your child.',
    titleEs: 'El siguiente conjunto de preguntas puede ayudarlo a usted y al médico a decidir qué es lo mejor para su hijo.',
    audioEn: '/audio/exported/screen6_survey_intro_en.mp3',
    audioEs: '/audio/exported/screen6_survey_intro_es.mp3',
    required: true,
    nextStepId: 'screen6_1_symptoms'
  },
  // Screen 6.1: Symptoms
  {
    id: 'screen6_1_symptoms',
    type: 'multiple_choice',
    titleEn: 'Select what happened when your child was said to be allergic to penicillin.',
    titleEs: 'Seleccione lo que sucedió cuando se le dijo que su hijo era alérgico a la penicilina.',
    audioEn: '/audio/exported/screen6_1_symptoms_en.mp3',
    audioEs: '/audio/exported/screen6_1_symptoms_es.mp3',
    options: [
      { value: 'Rash', labelEn: 'Rash', labelEs: 'Sarpullido' },
      { value: 'Swelling', labelEn: 'Swelling', labelEs: 'Inflamación' },
      { value: 'Fainting or dizziness', labelEn: 'Fainting or dizziness', labelEs: 'Desmayos o mareos' },
      { value: 'Itchiness', labelEn: 'Itchiness', labelEs: 'Picazón' },
      { value: 'Throat tightness', labelEn: 'Throat tightness', labelEs: 'Opresión en la garganta' },
      { value: 'Shortness of breath', labelEn: 'Shortness of breath or hard time breathing', labelEs: 'Falta de aire o dificultad para respirar' },
      { value: 'Fever', labelEn: 'Fever (new fever or worse fever)', labelEs: 'Fiebre (aparición de fiebre o empeoramiento de la fiebre)' },
      { value: 'Belly pain', labelEn: 'Belly pain', labelEs: 'Dolor abdominal' },
      { value: 'Diarrhea', labelEn: 'Diarrhea', labelEs: 'Diarrea' },
      { value: 'Joint pain', labelEn: 'Joint pain', labelEs: 'Dolor en articulaciones' },
      { value: 'Vomiting', labelEn: 'Wanted to throw up or threw up', labelEs: 'Ganas de vomitar o vomitó' },
      { value: 'Muscle aches', labelEn: 'Muscle aches', labelEs: 'Dolores musculares' },
      { value: 'Other', labelEn: 'Other: Please describe ________', labelEs: 'Otro: por favor describa' },
      { value: 'Unsure', labelEn: 'Unsure/I don\'t know', labelEs: 'No estoy seguro/ No lo sé' }
    ],
    required: true,
    nextStepId: 'screen6_2_timing'
  },
  // Screen 6.2: Timing (Age)
  {
    id: 'screen6_2_timing',
    type: 'slider',
    titleEn: 'How old was your child when the reaction happened?',
    titleEs: '¿Qué edad tenía su hijo cuando ocurrió la reacción?',
    descriptionEn: 'At what age did your child have the reaction to penicillin (amoxicillin)?',
    descriptionEs: '¿A qué edad tuvo su hijo la reacción a la penicilina (amoxicilina)?',
    audioEn: '/audio/exported/screen6_2_timing_en.mp3',
    audioEs: '/audio/exported/screen6_2_timing_es.mp3',
    min: 1,
    max: 26,
    unitEn: 'year old',
    unitEs: 'años',
    required: true,
    nextStepId: 'screen6_3_onset'
  },
  // Screen 6.3: Onset
  {
    id: 'screen6_3_onset',
    type: 'single_choice',
    titleEn: 'When did your child\'s symptoms start after taking penicillin?',
    titleEs: '¿Cuándo comenzaron los síntomas de su hijo después de tomar penicilina?',
    audioEn: '/audio/exported/screen6_3_onset_en.mp3',
    audioEs: '/audio/exported/screen6_3_onset_es.mp3',
    options: [
      { value: 'Less than 1 hour', labelEn: '<1 hour', labelEs: '<1 hora' },
      { value: '1-24 hours', labelEn: '1-24 hours', labelEs: '1-24 horas' },
      { value: 'More than 24 hours', labelEn: '24+ hours', labelEs: 'Más de 24 horas' },
      { value: 'Unsure', labelEn: 'Unsure/I don\'t know', labelEs: 'No estoy seguro/ No lo sé' }
    ],
    required: true,
    nextStepId: 'screen6_4_resolution'
  },
  // Screen 6.4: Resolution
  {
    id: 'screen6_4_resolution',
    type: 'single_choice',
    titleEn: 'Did your child receive medical care for their reaction?',
    titleEs: '¿Su hijo recibió atención médica por su reacción?',
    audioEn: '/audio/exported/screen6_4_resolution_en.mp3',
    audioEs: '/audio/exported/screen6_4_resolution_es.mp3',
    options: [
      { value: 'Yes', labelEn: 'Yes', labelEs: 'Sí' },
      { value: 'No', labelEn: 'No', labelEs: 'No' },
      { value: 'Unsure', labelEn: 'Unsure/I don\'t know', labelEs: 'No estoy seguro/ No lo sé' }
    ],
    required: true,
    nextStepId: 'screen6_4b_resolution_type'
  },
  // Screen 6.4b: Reaction Resolution Type
  {
    id: 'screen6_4b_resolution_type',
    type: 'single_choice',
    titleEn: 'How did your child\'s reaction go away?',
    titleEs: '¿Cómo desapareció la reacción de su hijo?',
    audioEn: '/audio/exported/screen6_4b_resolution_type_en.mp3',
    audioEs: '/audio/exported/screen6_4b_resolution_type_es.mp3',
    options: [
      { value: 'With medication', labelEn: 'With medication', labelEs: 'Con medicación' },
      { value: 'On its own', labelEn: 'On its own', labelEs: 'Por sí sola' },
      { value: 'Unsure', labelEn: 'Unsure/I don\'t know', labelEs: 'No estoy seguro/ No lo sé' }
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
    audioEn: '/audio/exported/screen6_5_yetagain_en.mp3',
    audioEs: '/audio/exported/screen6_5_yetagain_es.mp3',
    options: [
      { value: 'Yes', labelEn: 'Yes', labelEs: 'Sí' },
      { value: 'No', labelEn: 'No', labelEs: 'No' },
      { value: 'Unsure', labelEn: 'Unsure/I don\'t know', labelEs: 'No estoy seguro/ No lo sé' }
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
    audioEn: '/audio/exported/screen7_summary_en.mp3',
    audioEs: '/audio/exported/screen7_summary_es.mp3',
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
    audioEn: '/audio/exported/screen_end_en.mp3',
    audioEs: '/audio/exported/screen_end_es.mp3',
    isTerminal: true
  }
];
