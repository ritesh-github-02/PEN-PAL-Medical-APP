'use server';

import prisma from '@/lib/prisma';
import { cookies, headers } from 'next/headers';
import { questionnaireConfig } from '@/config/questionnaire';

// ─────────────────────────────────────────────────────────────────────────────
// submitAnswer
// ─────────────────────────────────────────────────────────────────────────────

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
          questionId: questionId,
        },
      },
      update: { answerValue: answerValue },
      create: {
        participantId: participantId,
        questionId: questionId,
        answerValue: answerValue,
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

/**
 * Reads penpal_session + penpal_participant cookies, loads the Session record,
 * and verifies the request's IP prefix matches the fingerprint captured at
 * session creation.
 *
 * Returns { ok: false, bindingError } when the fingerprint mismatches.
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

  if (!session.ipFingerprint) {
    // Sessions created before this feature was added have no fingerprint;
    // treat as a soft-fail so existing study participants aren't locked out.
    return {
      ok: true,
      sessionId,
      participantId,
      bindingError: 'Session was created before device binding was enabled. Please obtain a new token for full security.',
    };
  }

  const ip = await getClientIP();
  const requestPrefix = ip.split('.').slice(0, 3).join('.');

  if (requestPrefix !== session.ipFingerprint) {
    return {
      ok: false,
      reason: `IP prefix ${requestPrefix} !== ${session.ipFingerprint}`,
      sessionId,
      participantId,
      bindingError:
        'This session is linked to a different device or network. Please obtain a new access token.',
    };
  }

  return { ok: true, sessionId, participantId };
}

// ─────────────────────────────────────────────────────────────────────────────
// loadQuestionnaireProgress  (IP-binding gate centralised here)
// ─────────────────────────────────────────────────────────────────────────────

interface LoadProgressResult {
  answers: Record<string, any>;
  lastStepId: string | null;
  bindingError?: string;
}

export async function loadQuestionnaireProgress(): Promise<LoadProgressResult> {
  const ipResult = await enforceSessionIP();

  if (!ipResult.ok || !ipResult.participantId) {
    return {
      answers: {},
      lastStepId: null,
      bindingError: ipResult.reason ?? 'Session validation failed',
    };
  }

  const participantId = ipResult.participantId;
  let answers: Record<string, any> = {};

  try {
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
    return { answers, lastStepId: null, bindingError: ipResult.bindingError };
  }

  // ── Compute the furthest valid step ─────────────────────────────────────
  let index = 0;
  const visitedIds = new Set<string>();
  let computedLastStepId: string | null = null;

  while (index >= 0 && index < questionnaireConfig.length) {
    const step = questionnaireConfig[index];
    if (visitedIds.has(step.id)) break;
    visitedIds.add(step.id);

    const ans = answers[step.id];
    computedLastStepId = step.id;

    if (
      ans === undefined ||
      ans === null ||
      (Array.isArray(ans) && ans.length === 0 && step.required)
    ) {
      break;
    }

    let nextId = step.nextStepId;
    if (step.branchLogic && ans !== undefined) {
      const match = step.branchLogic.find((b: any) => b.value === String(ans));
      if (match) nextId = (match as any).targetStepId;
    }

    if (!nextId) break;

    const nextIdx = questionnaireConfig.findIndex((s: any) => s.id === nextId);
    if (nextIdx === -1) break;
    index = nextIdx;
  }

  return { answers, lastStepId: computedLastStepId, bindingError: ipResult.bindingError };
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
    await prisma.session.update({
      where: { id: sessionId },
      data: { status: 'COMPLETED', endTime: new Date() },
    });

    await prisma.participantToken.updateMany({
      where: { participantId },
      data: { status: 'CONSUMED' },
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Can't reach database server")) {
      return; // Silenced in preview
    }
    console.error('Complete error', error);
  }
}
