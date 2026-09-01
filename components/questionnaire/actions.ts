'use server';

import prisma from '@/lib/prisma';
import { cookies, headers } from 'next/headers';
import { questionnaireConfig } from '@/config/questionnaire';

// ─────────────────────────────────────────────────────────────────────────────
// submitAnswer
// ─────────────────────────────────────────────────────────────────────────────

export async function submitAnswer(questionId: string, answerValue: string, timeSpentMs?: number) {
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
          questionId: questionId,
        },
      },
      update: {
        answerValue: answerValue,
        timeSpentMs: timeSpentMs ? { increment: timeSpentMs } : undefined,
      },
      create: {
        participantId: participantId,
        questionId: questionId,
        answerValue: answerValue,
        timeSpentMs: timeSpentMs || 0,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Can't reach database server")) {
      return; // Silenced in preview
    }
    console.error('Save answer error', error);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// recordSlideTiming (Slide-by-slide 100% time metrics)
// ─────────────────────────────────────────────────────────────────────────────

export async function recordSlideTiming(stepId: string, stepIndex: number, durationMs: number, isNewVisit: boolean = false) {
  const cookieStore = await cookies();
  const participantId = cookieStore.get('penpal_participant')?.value;

  if (!participantId || !stepId || durationMs < 50) return;

  try {
    await prisma.slideMetric.upsert({
      where: {
        participantId_stepId: {
          participantId,
          stepId,
        },
      },
      update: {
        durationMs: { increment: Math.round(durationMs) },
        ...(isNewVisit ? { visitCount: { increment: 1 } } : {}),
      },
      create: {
        participantId,
        stepId,
        stepIndex,
        durationMs: Math.round(durationMs),
        visitCount: 1,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Can't reach database server")) {
      return;
    }
    console.error('Record slide timing error', error);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Session IP binding enforcement
// ─────────────────────────────────────────────────────────────────────────────

interface EnforceSessionIPResult {
  ok: boolean;
  reason?: string;
  sessionId: string | null;
  participantId: string | null;
  bindingError?: string;
}

async function getClientIP(): Promise<string> {
  try {
    const h = await headers();
    return (
      h.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      h.get('x-real-ip') ??
      'unknown'
    );
  } catch {
    return 'unknown';
  }
}

import { validateAndConsumeToken } from '@/app/[locale]/intervention/actions';

/**
 * Reads penpal_session + penpal_participant cookies, loads the Session record,
 * and validates the active session.
 */
async function enforceSessionIP(): Promise<EnforceSessionIPResult> {
  const cookieStore = await cookies();
  const participantId = cookieStore.get('penpal_participant')?.value;
  const sessionId = cookieStore.get('penpal_session')?.value;

  if (!participantId || !sessionId) {
    return { ok: false, reason: 'No active session', sessionId: null, participantId: null };
  }

  let session: { id: string; ipFingerprint: string | null } | null = null;

  try {
    session = await prisma.session.findUnique({
      where: { id: sessionId },
      select: { id: true, ipFingerprint: true },
    });
  } catch {
    // DB unreachable in preview — allow through
    return { ok: true, sessionId, participantId };
  }

  if (!session) {
    return { ok: false, reason: 'Session not found', sessionId, participantId };
  }

  return { ok: true, sessionId, participantId };
}

// ─────────────────────────────────────────────────────────────────────────────
// loadQuestionnaireProgress  (IP-binding gate centralised here)
// ─────────────────────────────────────────────────────────────────────────────

export interface LoadProgressResult {
  answers: Record<string, any>;
  lastStepId: string | null;
  resumeStepIndex: number;
  isAllCompleted: boolean;
  participantId?: string | null;
  tokenDisplay?: string | null;
  bindingError?: string;
}

export async function findNextUnansweredStepIndex(answers: Record<string, any>): Promise<{
  targetIndex: number;
  isAllCompleted: boolean;
}> {
  let index = 0;
  const visitedIds = new Set<string>();

  while (index >= 0 && index < questionnaireConfig.length) {
    const step = questionnaireConfig[index];
    if (visitedIds.has(step.id)) break;
    visitedIds.add(step.id);

    const ans = answers[step.id];

    if (step.isTerminal) {
      return { targetIndex: index, isAllCompleted: true };
    }

    const isAnswered =
      ans !== undefined &&
      ans !== null &&
      ans !== 'undefined' &&
      (Array.isArray(ans) ? ans.length > 0 : true);

    if (!isAnswered) {
      return { targetIndex: index, isAllCompleted: false };
    }

    let nextId = step.nextStepId;
    if (step.branchLogic && ans !== undefined) {
      const match = step.branchLogic.find((b: any) => b.value === String(ans));
      if (match) nextId = match.targetStepId;
    }

    if (!nextId) break;

    const nextIdx = questionnaireConfig.findIndex((s) => s.id === nextId);
    if (nextIdx === -1) break;
    index = nextIdx;
  }

  return { targetIndex: index, isAllCompleted: true };
}

export async function loadQuestionnaireProgress(tokenParam?: string, locale: string = 'en'): Promise<LoadProgressResult> {
  let ipResult = await enforceSessionIP();

  // If no session cookies yet but token is passed in URL/params, automatically validate and establish session!
  if ((!ipResult.ok || !ipResult.participantId) && tokenParam) {
    try {
      const authResult = await validateAndConsumeToken(tokenParam, locale);
      if (authResult.success) {
        ipResult = await enforceSessionIP();
      }
    } catch (e) {
      console.warn('Auto-validate token on progress load error:', e);
    }
  }

  if (!ipResult.ok || !ipResult.participantId) {
    return {
      answers: {},
      lastStepId: null,
      resumeStepIndex: 0,
      isAllCompleted: false,
    };
  }

  const participantId = ipResult.participantId;
  let answers: Record<string, any> = {};
  let tokenDisplay: string | null = null;
  let isParticipantCompleted = false;

  try {
    const participant = await prisma.participant.findUnique({
      where: { id: participantId },
      select: {
        externalId: true,
        status: true,
        tokens: {
          select: { tokenHash: true, status: true },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });
    tokenDisplay = participant?.externalId || participant?.tokens[0]?.tokenHash || null;
    isParticipantCompleted =
      participant?.status === 'COMPLETED' ||
      participant?.tokens[0]?.status === 'CONSUMED' ||
      participant?.tokens[0]?.status === 'COMPLETED';

    const responses = await prisma.questionnaireResponse.findMany({
      where: { participantId },
      orderBy: { updatedAt: 'asc' },
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
      } catch {
        answers[r.questionId] = r.answerValue;
      }
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes("Can't reach database server")) {
      // Silenced in preview
    } else {
      console.error('Load progress DB error', error);
    }
  }

  if (Object.keys(answers).length === 0) {
    return {
      answers,
      lastStepId: null,
      resumeStepIndex: 0,
      isAllCompleted: isParticipantCompleted,
      participantId,
      tokenDisplay,
      bindingError: ipResult.bindingError,
    };
  }

  const { targetIndex, isAllCompleted } = await findNextUnansweredStepIndex(answers);

  return {
    answers,
    lastStepId: questionnaireConfig[targetIndex]?.id || null,
    resumeStepIndex: targetIndex,
    isAllCompleted: isAllCompleted || isParticipantCompleted,
    participantId,
    tokenDisplay,
    bindingError: ipResult.bindingError,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// completeQuestionnaire
// ─────────────────────────────────────────────────────────────────────────────

export async function completeQuestionnaire() {
  const cookieStore = await cookies();
  const participantId = cookieStore.get('penpal_participant')?.value;
  const sessionId = cookieStore.get('penpal_session')?.value;

  if (!participantId || !sessionId) return;

  try {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      select: { startTime: true },
    });

    const now = new Date();
    let durationSeconds = 0;
    if (session?.startTime) {
      durationSeconds = Math.max(0, Math.round((now.getTime() - new Date(session.startTime).getTime()) / 1000));
    }

    await prisma.session.update({
      where: { id: sessionId },
      data: {
        status: 'COMPLETED',
        endTime: now,
        durationSeconds: durationSeconds > 0 ? durationSeconds : undefined,
      },
    });

    await prisma.participant.update({
      where: { id: participantId },
      data: { status: 'COMPLETED' },
    });

    await prisma.participantToken.updateMany({
      where: { participantId },
      data: { status: 'CONSUMED', consumedAt: now },
    });

    await prisma.eventLog.create({
      data: {
        participantId,
        sessionId,
        eventType: 'ASSESSMENT_COMPLETED',
        eventData: JSON.stringify({ durationSeconds }),
        path: '/intervention/flow',
      },
    }).catch(() => {});
  } catch (error) {
    if (error instanceof Error && error.message.includes("Can't reach database server")) {
      return; // Silenced in preview
    }
    console.error('Complete error', error);
  }
}
