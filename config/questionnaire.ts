export type QuestionType =
  | 'intro'
  | 'statistics'
  | 'education'
  | 'testing_info'
  | 'testimonial'
  | 'single_choice'
  | 'multiple_choice'
  | 'slider'
  | 'text'
  | 'boolean'
  | 'likert'
  | 'summary'
  | 'knowledge_revelation';

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
  // Slide 1: Welcome & Introduction
  {
    id: 'screen1_intro',
    type: 'intro',
    titleEn: 'PEN-PAL',
    titleEs: 'PEN-PAL',
    descriptionEn: 'Parents Engaged in Penicillin Allergies',
    descriptionEs: 'Padres Involucrados en Alergias a la Penicilina',
    contentEn: "Hi! I'm nurse Anna. Let's talk about penicillin allergies in kids. Get started.",
    contentEs: "¡Hola! Soy la enfermera Anna. Hablemos sobre las alergias a la penicilina en niños. ¡Comenzar!",
    audioEn: '/audio/exported/screen1_intro_en.mp3',
    audioEs: '/audio/exported/screen1_intro_es.mp3',
    required: true,
    branchLogic: [
      { value: 'yes', targetStepId: 'slide2_naming' },
      { value: 'no', targetStepId: 'screen_end' }
    ]
  },
  // Slide 2: Medicine Naming & Token Engine
  {
    id: 'slide2_naming',
    type: 'single_choice',
    titleEn: "Let's first talk about penicillin. It has lots of names!",
    titleEs: "¡Primero hablemos de la penicilina. ¡Tiene muchos nombres!",
    descriptionEn: "Select what you call it. We'll use the name you choose during our time together. Penicillin, Amoxicillin, Pink medicine, Amoxicillin-clavulanate, Augmentin. Back button, Next button.",
    descriptionEs: "Seleccione cómo lo llama. Usaremos el nombre que elija durante nuestro tiempo juntos. Penicilina, Amoxicilina, Medicina rosa, Amoxicilina-clavulanato, Augmentin. Botón atrás, Botón siguiente.",
    audioEn: '/audio/exported/slide2_naming_en.mp3',
    audioEs: '/audio/exported/slide2_naming_es.mp3',
    required: true,
    nextStepId: 'slide3_efficacy'
  },
  // Slide 3: Pediatric Indications & Efficacy
  {
    id: 'slide3_efficacy',
    type: 'education',
    titleEn: "Many kids have had [name] because it's the best for treating common infections.",
    titleEs: "Muchos niños han tomado [name] porque es el mejor para tratar infecciones comunes.",
    descriptionEn: "Many kids have had penicillin because it's the best for treating common ear, sinus, and throat infections. It is also one of the best antibiotics in adults, too. Penicillin is a wonder drug, but like all antibiotics, it doesn't work well for common colds or the flu.",
    descriptionEs: "Muchos niños han tomado [name] porque es el mejor para tratar infecciones comunes. También es uno de los mejores antibióticos para adultos. [Name] es un medicamento maravilloso, pero como todos los antibióticos, no funciona bien para los resfriados comunes o la gripe.",
    audioEn: '/audio/exported/slide3_efficacy_en.mp3',
    audioEs: '/audio/exported/slide3_efficacy_es.mp3',
    required: true,
    nextStepId: 'slide4_barrier'
  },
  // Slide 4: Believed Allergy Barrier
  {
    id: 'slide4_barrier',
    type: 'education',
    titleEn: "[Name] is one of the best antibiotics. But many kids do not get it because they are believed to be allergic to it.",
    titleEs: "[Name] es uno de los mejores antibióticos. Pero muchos niños no lo reciben porque se cree que son alérgicos a él.",
    descriptionEn: "Penicillin is one of the best antibiotics, but many kids do not get it because they are believed to be allergic to it.",
    descriptionEs: "[Name] es uno de los mejores antibióticos. Pero muchos niños no lo reciben porque se cree que son alérgicos a él.",
    audioEn: '/audio/exported/slide4_barrier_en.mp3',
    audioEs: '/audio/exported/slide4_barrier_es.mp3',
    required: true,
    nextStepId: 'slide5_prevalence'
  },
  // Slide 5: 95% Prevalence Graphic
  {
    id: 'slide5_prevalence',
    type: 'statistics',
    titleEn: 'Most people who think they are allergic to penicillin can safely take it.',
    titleEs: 'La mayoría de las personas que piensan que son alérgicas a la penicilina pueden tomarla de manera segura.',
    descriptionEn: "Did you know? Most people who think they are allergic to penicillin can safely take it. Out of 100 kids with a penicillin allergy, 95 can take penicillin without having a reaction.",
    descriptionEs: "¿Sabías que...? La mayoría de las personas que piensan que son alérgicas a la penicilina pueden tomarla de manera segura. De cada 100 niños con alergia a la penicilina, 95 pueden tomarla sin presentar una reacción.",
    audioEn: '/audio/exported/screen2_statistics_en.mp3',
    audioEs: '/audio/exported/screen2_statistics_es.mp3',
    required: true,
    nextStepId: 'slide6_myths'
  },
  // Slides 6-7: 4 Myth vs. Truth Interactive Cards
  {
    id: 'slide6_myths',
    type: 'knowledge_revelation',
    titleEn: "Why are so many kids thought to have a penicillin allergy when they don't? Click each box to reveal the truth!",
    titleEs: "¿Por qué se piensa que tantos niños tienen alergia a la penicilina cuando no es así? ¡Haga clic en cada cuadro para revelar la verdad!",
    descriptionEn: "Why are so many kids thought to have a penicillin allergy when they don't? Click each box to reveal the truth. Myth 1: If a child gets a rash when taking penicillin, it means they are allergic to penicillin? Truth: A rash does not always mean an allergy. Rashes are common in kids, especially when they are sick. The underlying illness may have caused the rash. Myth 2: If a child gets a bellyache or has diarrhea while taking penicillin, it means they are allergic to penicillin? Truth: Bellyaches and diarrhea are common side effects of antibiotics. Myth 3: If a parent is allergic to penicillin, their child will be too? Truth: A penicillin allergy is not passed down from a parent to child. Myth 4: If a child has a penicillin allergy, they will always have it? Truth: A child may outgrow their allergy to penicillin.",
    descriptionEs: "¿Por qué se piensa que tantos niños tienen alergia a la penicilina cuando no es así? Haga clic en cada casilla para revelar la verdad.",
    audioEn: '/audio/exported/screen3_5_knowledge_test_en.mp3',
    audioEs: '/audio/exported/screen3_5_knowledge_test_es.mp3',
    required: true,
    nextStepId: 'slide8_milestone'
  },
  // Slide 8: Milestone Encouragement
  {
    id: 'slide8_milestone',
    type: 'education',
    titleEn: "Great job! Now you know what is true about penicillin allergies!",
    titleEs: "¡Buen trabajo! ¡Ahora ya sabe lo que es verdad sobre las alergias a la penicilina!",
    descriptionEn: "Great job! Now you know what is true about penicillin allergies!",
    descriptionEs: "¡Buen trabajo! ¡Ahora ya sabe lo que es verdad sobre las alergias a la penicilina!",
    audioEn: '/audio/exported/slide8_milestone_en.mp3',
    audioEs: '/audio/exported/slide8_milestone_es.mp3',
    required: true,
    nextStepId: 'slide9_why_it_matters'
  },
  // Slide 9: Second-Line Risks
  {
    id: 'slide9_why_it_matters',
    type: 'education',
    titleEn: "Why does this matter?",
    titleEs: "¿Por qué es importante esto?",
    descriptionEn: "When a child needs antibiotics and is believed to have an allergy to penicillin, they receive different antibiotics that: are more likely to cause diarrhea or other side effects, cost more than penicillin, taste worse than penicillin, may make an infection harder to treat in the future.",
    descriptionEs: "Cuando un niño necesita antibióticos y se cree que tiene alergia a la penicilina, recibe diferentes antibióticos que tienen más probabilidades de causar diarrea u otros efectos secundarios, cuestan más que la penicilina, tienen peor sabor que la penicilina y pueden hacer que una infección sea más difícil de tratar en el futuro.",
    audioEn: '/audio/exported/slide9_why_it_matters_en.mp3',
    audioEs: '/audio/exported/slide9_why_it_matters_es.mp3',
    required: true,
    nextStepId: 'slide10_testing'
  },
  // Slide 10: In-Office Testing Overview
  {
    id: 'slide10_testing',
    type: 'testing_info',
    titleEn: "Talk to your child's doctor about testing!",
    titleEs: "¡Hable con el médico de su hijo sobre las pruebas!",
    audioEn: '/audio/exported/screen4_testing_en.mp3',
    audioEs: '/audio/exported/screen4_testing_es.mp3',
    required: true,
    nextStepId: 'screen6_survey_intro'
  },
  // Slide 10b / Survey Intro Transition: Clinical Survey Overview
  {
    id: 'screen6_survey_intro',
    type: 'education',
    titleEn: "The next set of questions can help you and the doctor see what's best for your child.",
    titleEs: "El siguiente conjunto de preguntas puede ayudarlo a usted y al médico a decidir qué es lo mejor para su hijo.",
    audioEn: '/audio/exported/screen6_survey_intro_en.mp3',
    audioEs: '/audio/exported/screen6_survey_intro_es.mp3',
    required: true,
    nextStepId: 'screen6_1_symptoms'
  },
  // Slide 11: Reported Symptoms Checklist (& Modal 11B)
  {
    id: 'screen6_1_symptoms',
    type: 'multiple_choice',
    titleEn: 'Select what happened when your child was said to be allergic to penicillin.',
    titleEs: 'Seleccione lo que sucedió cuando se le dijo que su hijo era alérgico a la penicilina.',
    audioEn: '/audio/exported/screen6_1_symptoms_en.mp3',
    audioEs: '/audio/exported/screen6_1_symptoms_es.mp3',
    required: true,
    nextStepId: 'screen6_2_timing'
  },
  // Slide 12: Age Cohort at Reaction
  {
    id: 'screen6_2_timing',
    type: 'single_choice',
    titleEn: 'How old was your child when they had a reaction to [name]?',
    titleEs: '¿Qué edad tenía su hijo cuando tuvo una reacción a [name]?',
    descriptionEn: 'Baby: up to 12 months, Toddler: 1 to 3 years, School-aged: 4 to 12 years, Teen: 13 to 17 years, Adult: 18+ years.',
    descriptionEs: 'Bebé: hasta 12 meses, Niño pequeño: 1 a 3 años, Edad escolar: 4 a 12 años, Adolescente: 13 a 17 años, Adulto: más de 18 años.',
    audioEn: '/audio/exported/screen6_2_timing_en.mp3',
    audioEs: '/audio/exported/screen6_2_timing_es.mp3',
    options: [
      { value: 'Baby (0-12 months)', labelEn: 'Baby (0-12 months)', labelEs: 'Bebé (0-12 meses)' },
      { value: 'Toddler (1-3 years)', labelEn: 'Toddler (1-3 years)', labelEs: 'Niño pequeño (1-3 años)' },
      { value: 'School-aged (4-12 years)', labelEn: 'School-aged (4-12 years)', labelEs: 'Edad escolar (4-12 años)' },
      { value: 'Teen (13-17 years)', labelEn: 'Teen (13-17 years)', labelEs: 'Adolescente (13-17 años)' },
      { value: 'Adult (18+)', labelEn: 'Adult (18+)', labelEs: 'Adulto (18+)' }
    ],
    required: true,
    nextStepId: 'screen6_3_onset'
  },
  // Slide 13: Time to Onset
  {
    id: 'screen6_3_onset',
    type: 'single_choice',
    titleEn: "When did your child's symptoms start after taking penicillin?",
    titleEs: "¿Cuándo comenzaron los síntomas de su hijo después de tomar penicilina?",
    descriptionEn: "Less than 1 hour, 1 to 24 hours, 24+ hours, Unsure / don't know.",
    descriptionEs: "Menos de 1 hora, 1 a 24 horas, Más de 24 horas, No estoy seguro / no sé.",
    audioEn: '/audio/exported/screen6_3_onset_en.mp3',
    audioEs: '/audio/exported/screen6_3_onset_es.mp3',
    required: true,
    nextStepId: 'screen6_4_resolution'
  },
  // Slide 14: Medical Care Received (& Modal 15)
  {
    id: 'screen6_4_resolution',
    type: 'single_choice',
    titleEn: 'Did your child receive medical care for their reaction?',
    titleEs: '¿Su hijo recibió atención médica por su reacción?',
    descriptionEn: 'Yes, No, Unsure / I don\'t know.',
    descriptionEs: 'Sí, No, No estoy seguro / no sé.',
    audioEn: '/audio/exported/Slide14..mp3',
    audioEs: '/audio/exported/screen6_4_resolution_es.mp3',
    required: true,
    nextStepId: 'screen6_4b_resolution_type'
  },
  // Slide 16: Symptom Resolution (& Modal 17/18)
  {
    id: 'screen6_4b_resolution_type',
    type: 'single_choice',
    titleEn: "How did your child's reaction go away?",
    titleEs: "¿Cómo desapareció la reacción de su hijo?",
    descriptionEn: "With medication, On its own, Unsure / I don't know.",
    descriptionEs: "Con medicamentos, Por sí sola, No estoy seguro / no sé.",
    audioEn: '/audio/exported/screen6_4b_resolution_type_en.mp3',
    audioEs: '/audio/exported/screen6_4b_resolution_type_es.mp3',
    required: true,
    nextStepId: 'screen6_5_yetagain'
  },
  // Slide 19: Repeat Penicillin Exposure (& Modal 20)
  {
    id: 'screen6_5_yetagain',
    type: 'single_choice',
    titleEn: 'Has your child received penicillin since the reaction?',
    titleEs: '¿Ha recibido su hijo penicilina desde la reacción?',
    descriptionEn: "Yes, No, Unsure / I don't know.",
    descriptionEs: "Sí, No, No estoy seguro / no sé.",
    audioEn: '/audio/exported/screen6_5_yetagain_en.mp3',
    audioEs: '/audio/exported/screen6_5_yetagain_es.mp3',
    required: true,
    nextStepId: 'slide21_what_now'
  },
  // Slide 21: "What Now?" Pediatrician & Family Transition
  {
    id: 'slide21_what_now',
    type: 'education',
    titleEn: "What now? Talk to your child's doctor about penicillin allergy testing.",
    titleEs: "¡Hable con el médico de su hijo sobre las pruebas de alergia a [name]!",
    descriptionEn: "The test can help you learn the truth about your child's past reaction. The test may help your child get better medicine in the future.",
    descriptionEs: "Hable con el médico de su hijo sobre las pruebas de alergia. Las pruebas pueden confirmar si su hijo es realmente alérgico, para que pueda recibir con seguridad el mejor medicamento cuando sea necesario.",
    audioEn: '/audio/exported/slide21_what_now_en.mp3',
    audioEs: '/audio/exported/slide21_what_now_es.mp3',
    required: true,
    nextStepId: 'screen7_summary'
  },
  // Slide 22: Summary Table & PDF Export
  {
    id: 'screen7_summary',
    type: 'summary',
    titleEn: 'Action Steps for Parents',
    titleEs: 'Pasos de Acción para Padres',
    descriptionEn: "1. Talk to your child's doctor about the allergy at their next visit. Here's what you can say: I read about penicillin allergies in kids. Could we talk about checking to see if my child really has an allergy? 2. Share pictures of your child's reaction with the doctor. 3. Give the table below to your child's doctor. This says what happened when your child took penicillin.",
    descriptionEs: "1. Hable con el médico de su hijo sobre la alergia en su próxima visita. 2. Comparta fotos de la reacción de su hijo con el médico. 3. Entregue la siguiente tabla al médico de su hijo.",
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
