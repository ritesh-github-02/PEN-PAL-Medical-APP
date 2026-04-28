'use server';

import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function validateToken(tokenStr: string, locale: string) {
  if (!tokenStr) return { error: 'No token provided' };

  let successRedirect = false;
  let tokenRecord = null;

  try {
    // --- DEMO BYPASS FOR PREVIEW ENVIRONMENT ---
    if (tokenStr === 'DEMO') {
      const demoParticipantId = 'demo-participant-123';
      const demoSessionId = 'demo-session-123';

      // Ensure demo participant exists
      await prisma.participant.upsert({
        where: { id: demoParticipantId },
        update: {},
        create: {
          id: demoParticipantId,
          groupId: 'INTERVENTION',
          status: 'ACTIVE'
        }
      });

      // Ensure demo session exists
      await prisma.session.upsert({
        where: { id: demoSessionId },
        update: { status: 'IN_PROGRESS' },
        create: {
          id: demoSessionId,
          participantId: demoParticipantId,
          status: 'IN_PROGRESS'
        }
      });

      const cookieStore = await cookies();
      cookieStore.set('penpal_session', demoSessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 2
      });
      cookieStore.set('penpal_participant', demoParticipantId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 2
      });
      successRedirect = true;
    }
    // --- END DEMO BYPASS ---

    if (!successRedirect) {
      tokenRecord = await prisma.participantToken.findUnique({
        where: { token: tokenStr },
        include: { participant: true }
      });

      if (!tokenRecord) {
        return { error: 'Invalid token' };
      }

      if (tokenRecord.status !== 'VALID' && tokenRecord.status !== 'COMPLETED') {
        return { error: `Token is ${tokenRecord.status.toLowerCase()}` };
      }

      if (tokenRecord.expiresAt && tokenRecord.expiresAt < new Date()) {
        return { error: 'Token has expired' };
      }

      // Create a new session
      const session = await prisma.session.create({
        data: {
          participantId: tokenRecord.participantId,
          status: 'IN_PROGRESS'
        }
      });

      // --- EDIT MODE LOGIC ---
      // We no longer delete responses here so the user can re-visit and edit their answers.
      // -----------------------

      // Save session in cookie
      const cookieStore = await cookies();
      cookieStore.set('penpal_session', session.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 2 // 2 hours
      });

      cookieStore.set('penpal_participant', tokenRecord.participantId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 2
      });
      successRedirect = true;
    }
  } catch (error) {
    // Silence console logging for DB errors in the preview environment
    if (error instanceof Error && error.message.includes('Can\'t reach database server')) {
      return { error: 'Database connection unavailable. Please contact the research team or check your database settings.' };
    }
    return { error: 'Internal system error' };
  }

  if (successRedirect) {
    return { 
      success: true, 
      isCompleted: tokenRecord ? (tokenRecord as any).status === 'COMPLETED' : false
    };
  }
}

export async function requestToken(userId: string) {
  if (!userId || userId.trim().length < 3) {
    return { error: 'Please enter a valid User ID (min 3 characters).' };
  }

  try {
    // 1. Check if a participant with this externalId already exists
    const existingParticipant = await prisma.participant.findFirst({
      where: { externalId: userId },
      include: { tokens: true }
    });

    if (existingParticipant && existingParticipant.tokens.length > 0) {
      return {
        success: true,
        token: existingParticipant.tokens[0].token,
        message: 'Token found for this User ID:'
      };
    }

    // 2. If not, create a new participant and token
    // Using a prefix for clarity
    const newTokenValue = `PEN-${userId.toUpperCase().replace(/\s+/g, '-')}`;

    await prisma.participant.create({
      data: {
        externalId: userId,
        groupId: 'INTERVENTION',
        tokens: {
          create: {
            token: newTokenValue,
            status: 'VALID'
          }
        }
      }
    });

    return {
      success: true,
      token: newTokenValue,
      message: 'New token generated successfully!'
    };

  } catch (error) {
    console.error('Request token error:', error);
    return { error: 'This User ID is already taken or invalid.' };
  }
}

export async function getSurveyResponse() {
  try {
    const cookieStore = await cookies();
    const participantId = cookieStore.get('penpal_participant')?.value;

    if (!participantId) {
      return { error: 'No active session' };
    }

    const existingSurvey = await prisma.surveyResponse.findFirst({
      where: {
        participantId,
        surveyType: 'FINAL_EVALUATION'
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!existingSurvey) {
      return { data: null };
    }

    return {
      data: {
        id: existingSurvey.id,
        answers: JSON.parse(existingSurvey.answers),
        updatedAt: existingSurvey.updatedAt
      }
    };
  } catch (error) {
    console.error('Error fetching survey response:', error);
    return { error: 'Failed to load survey data' };
  }
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('penpal_session');
  cookieStore.delete('penpal_participant');
  redirect('/');
}
