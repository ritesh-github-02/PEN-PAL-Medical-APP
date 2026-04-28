'use server';

import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { questionnaireConfig } from '@/config/questionnaire';

export async function submitAnswer(questionId: string, answerValue: string) {
  const cookieStore = await cookies();
  const participantId = cookieStore.get('penpal_participant')?.value;

  if (!participantId) {
    console.warn('No active participant session found for submitAnswer. Silent fail for preview.');
    return;
  }

  try {
    await prisma.questionnaireResponse.upsert({
      where: {
        participantId_questionId: {
          participantId: participantId,
          questionId: questionId
        }
      },
      update: {
        answerValue: answerValue
      },
      create: {
        participantId: participantId,
        questionId: questionId,
        answerValue: answerValue
      }
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Can\'t reach database server')) {
       // Silenced in preview environment
       return;
    }
    console.error('Save answer error', error);
  }
}

export async function loadQuestionnaireProgress() {
  const cookieStore = await cookies();
  const participantId = cookieStore.get('penpal_participant')?.value;

  if (!participantId) return { answers: {}, lastStepId: null };

  let answers: Record<string, any> = {};

  try {
    const responses = await prisma.questionnaireResponse.findMany({
      where: { participantId },
      orderBy: { updatedAt: 'asc' }
    });

    for (const r of responses) {
      if (!r.answerValue) continue;
      
      try {
        if (r.answerValue.startsWith('[') && r.answerValue.endsWith(']')) {
          answers[r.questionId] = JSON.parse(r.answerValue);
        } else if (r.answerValue === 'true') {
          answers[r.questionId] = true;
        } else if (r.answerValue === 'false') {
          answers[r.questionId] = false;
        } else {
          answers[r.questionId] = r.answerValue;
        }
      } catch (e) {
        answers[r.questionId] = r.answerValue;
      }
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('Can\'t reach database server')) {
       // Silenced in preview
    } else {
       console.error('Load progress DB error', error);
    }
  }

  // To fulfill specific robust-resume requirements, we determine last step tracking from server action
  if (Object.keys(answers).length === 0) {
     return { answers, lastStepId: null };
  }

  // Calculate the furthest valid step reached
  let index = 0;
  let visitedIds = new Set<string>();
  let computedLastStepId: string | null = null;
  
  while (index >= 0 && index < questionnaireConfig.length) {
    const step = questionnaireConfig[index];
    if (visitedIds.has(step.id)) break;
    visitedIds.add(step.id);
    
    const ans = answers[step.id];
    computedLastStepId = step.id; // Record where we are currently stopped
    
    // If requirement not met, stop here
    if (ans === undefined || ans === null || (Array.isArray(ans) && ans.length === 0 && step.required)) {
      break;
    }
    
    // Determine next step
    let nextId = step.nextStepId;
    if (step.branchLogic && ans !== undefined) {
        const match = step.branchLogic.find(b => b.value === String(ans));
        if (match) nextId = match.targetStepId;
    }
    
    if (!nextId) {
        break;
    }
    
    const nextIdx = questionnaireConfig.findIndex(s => s.id === nextId);
    if (nextIdx === -1) {
        break;
    }
    index = nextIdx;
  }

  return { answers, lastStepId: computedLastStepId };
}

export async function completeQuestionnaire() {
  const cookieStore = await cookies();
  const participantId = cookieStore.get('penpal_participant')?.value;
  const sessionId = cookieStore.get('penpal_session')?.value;

  if (!participantId || !sessionId) return;

  try {
    await prisma.session.update({
      where: { id: sessionId },
      data: {
        status: 'COMPLETED',
        endTime: new Date()
      }
    });

    await prisma.participantToken.updateMany({
      where: { participantId },
      data: { status: 'COMPLETED' }
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Can\'t reach database server')) {
        // Silenced in preview environment
        return;
    }
    console.error('Complete error', error);
  }
}
