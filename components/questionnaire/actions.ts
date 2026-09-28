'use server';

import prisma from '@/lib/prisma';
import { cookies, headers } from 'next/headers';
import { questionnaireConfig } from '@/config/questionnaire';

// ─────────────────────────────────────────────────────────────────────────────
// submitAnswer
// ─────────────────────────────────────────────────────────────────────────────

export async function submitAnswer(questionId: string, answerValue: string | string[], timeSpentMs?: number, metadata?: string) {
  const finalValue = typeof answerValue === 'object' ? JSON.stringify(answerValue) : String(answerValue);
  const cookieStore = await cookies();
  const participantId = cookieStore.get('penpal_participant')?.value;

  if (!participantId) {
    console.warn('No active participant session found for submitAnswer. Silent fail for preview.');
    return;
  }

  try {
    const participantExists = await prisma.participant.findUnique({
      where: { id: participantId },
      select: { id: true },
    }).catch(() => null);

    if (!participantExists) {
      console.warn('Participant not found for submitAnswer.');
      return;
    }

    await prisma.questionnaireResponse.upsert({
      where: {
        participantId_questionId: {
          participantId: participantId,
          questionId: questionId,
        },
      },
      update: {
        answerValue: finalValue,
        timeSpentMs: timeSpentMs ? { increment: timeSpentMs } : undefined,
        ...(metadata !== undefined ? { metadata } : {}),
      },
      create: {
        participantId: participantId,
        questionId: questionId,
        answerValue: finalValue,
        timeSpentMs: timeSpentMs || 0,
        metadata: metadata || null,
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
    const participantExists = await prisma.participant.findUnique({
      where: { id: participantId },
      select: { id: true },
    }).catch(() => null);

    if (!participantExists) return;

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

  if (!participantId) {
    return { ok: false, reason: 'No active session', sessionId: null, participantId: null };
  }

  let participant = null;
  try {
    participant = await prisma.participant.findUnique({
      where: { id: participantId },
      select: { id: true },
    });
  } catch {
    return { ok: true, sessionId: sessionId || null, participantId };
  }

  if (!participant) {
    cookieStore.delete('penpal_session');
    cookieStore.delete('penpal_participant');
    return { ok: false, reason: 'Participant not found', sessionId: null, participantId: null };
  }

  let session: { id: string; ipFingerprint: string | null } | null = null;

  if (sessionId) {
    try {
      session = await prisma.session.findUnique({
        where: { id: sessionId },
        select: { id: true, ipFingerprint: true },
      });
    } catch {
      return { ok: true, sessionId, participantId };
    }
  }

  // Auto-heal session if session is missing or invalid
  if (!session) {
    try {
      const latest = await prisma.session.findFirst({
        where: { participantId },
        orderBy: { createdAt: 'desc' },
        select: { id: true, ipFingerprint: true },
      });

      if (latest) {
        session = latest;
      } else {
        session = await prisma.session.create({
          data: {
            participantId,
            status: 'IN_PROGRESS',
            startTime: new Date(),
          },
          select: { id: true, ipFingerprint: true },
        });
      }

      const isProd = process.env.NODE_ENV === 'production';
      cookieStore.set('penpal_session', session.id, {
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax',
        maxAge: 60 * 60 * 2,
        path: '/',
      });
    } catch {
      return { ok: true, sessionId: sessionId || null, participantId };
    }
  }

  return { ok: true, sessionId: session.id, participantId };
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

import { findNextUnansweredStepIndex as findNextSync } from '@/lib/questionnaire-progress';

export async function findNextUnansweredStepIndex(answers: Record<string, any>) {
  return findNextSync(answers);
}

export async function loadQuestionnaireProgress(tokenParam?: string, locale: string = 'en'): Promise<LoadProgressResult> {
  let ipResult = await enforceSessionIP();

  // If no session cookies yet but token is passed in URL/params, automatically validate and establish session!
  if ((!ipResult.ok || !ipResult.participantId) && tokenParam) {
    try {
      const authResult = await validateAndConsumeToken(tokenParam, locale, 'INTERVENTION');
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

  if (!participantId) return;

  try {
    const participant = await prisma.participant.findUnique({
      where: { id: participantId },
      select: { id: true },
    }).catch(() => null);

    if (!participant) return;

    let session = sessionId
      ? await prisma.session.findUnique({
          where: { id: sessionId },
          select: { id: true, startTime: true },
        }).catch(() => null)
      : null;

    if (!session) {
      session = await prisma.session.findFirst({
        where: { participantId },
        orderBy: { createdAt: 'desc' },
        select: { id: true, startTime: true },
      }).catch(() => null);
    }

    const now = new Date();
    let durationSeconds = 0;
    if (session?.startTime) {
      durationSeconds = Math.max(0, Math.round((now.getTime() - new Date(session.startTime).getTime()) / 1000));
    }

    if (session) {
      await prisma.session.update({
        where: { id: session.id },
        data: {
          status: 'COMPLETED',
          endTime: now,
          durationSeconds: durationSeconds > 0 ? durationSeconds : undefined,
        },
      }).catch(() => {});
    }

    await prisma.participant.update({
      where: { id: participantId },
      data: { status: 'COMPLETED' },
    }).catch(() => {});

    await prisma.participantToken.updateMany({
      where: { participantId },
      data: { status: 'CONSUMED', consumedAt: now },
    }).catch(() => {});

    await prisma.eventLog.create({
      data: {
        participantId,
        sessionId: session?.id || null,
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
