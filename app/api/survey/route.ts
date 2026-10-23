import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { answers, surveyType = 'FINAL_EVALUATION', token } = body;

    // Get participant and session from cookies or fallback token
    const cookieStore = await cookies();
    let participantId = cookieStore.get('penpal_participant')?.value;
    let sessionId = cookieStore.get('penpal_session')?.value;

    if ((!participantId || !sessionId) && token) {
      const cleanTok = String(token).trim();
      const normTok = cleanTok.toUpperCase();
      const rawWithoutPrefix = normTok.replace(/^(?:PEN|P)-/i, '');

      const foundToken = await prisma.participantToken.findFirst({
        where: {
          OR: [
            { tokenHash: { equals: normTok, mode: 'insensitive' } },
            { tokenHash: { equals: cleanTok, mode: 'insensitive' } },
            { tokenPayload: { equals: normTok, mode: 'insensitive' } },
            { tokenPayload: { equals: rawWithoutPrefix, mode: 'insensitive' } },
            { participant: { externalId: { equals: normTok, mode: 'insensitive' } } },
            { participant: { externalId: { equals: cleanTok, mode: 'insensitive' } } },
          ],
        },
        include: { participant: true },
      });

      if (foundToken) {
        participantId = foundToken.participantId;
        const existingSession = await prisma.session.findFirst({
          where: { participantId },
          orderBy: { createdAt: 'desc' },
        });
        if (existingSession) {
          sessionId = existingSession.id;
        } else {
          const newSess = await prisma.session.create({
            data: {
              participantId,
              status: 'IN_PROGRESS',
              startTime: new Date(),
            },
          });
          sessionId = newSess.id;
        }
      }
    }

    if (!participantId || !sessionId) {
      return NextResponse.json(
        { error: 'No active session' },
        { status: 401 }
      );
    }

    if (!answers || typeof answers !== 'object') {
      return NextResponse.json(
        { error: 'Invalid answers format' },
        { status: 400 }
      );
    }

    // Check if survey response already exists
    const existingSurvey = await prisma.surveyResponse.findFirst({
      where: {
        participantId,
        surveyType
      },
      orderBy: { createdAt: 'desc' }
    });

    let surveyResponse;

    if (existingSurvey) {
      // Update existing response
      surveyResponse = await prisma.surveyResponse.update({
        where: { id: existingSurvey.id },
        data: {
          answers: JSON.stringify(answers)
        }
      });
    } else {
      // Create new response
      surveyResponse = await prisma.surveyResponse.create({
        data: {
          participantId,
          surveyType,
          answers: JSON.stringify(answers)
        }
      });
    }

    // Update session status to completed
    if (sessionId) {
      const sessionExists = await prisma.session.findUnique({
        where: { id: sessionId },
        select: { id: true },
      }).catch(() => null);

      if (sessionExists) {
        await prisma.session.update({
          where: { id: sessionId },
          data: {
            status: 'COMPLETED',
            endTime: new Date(),
          },
        }).catch(() => {});
      }
    }

    return NextResponse.json(
      {
        success: true,
        surveyResponseId: surveyResponse.id,
        isUpdate: !!existingSurvey,
        message: existingSurvey 
          ? 'Survey response updated successfully' 
          : 'Survey response recorded successfully'
      },
      { status: existingSurvey ? 200 : 201 }
    );
  } catch (error) {
    console.error('Survey submission error:', error);
    return NextResponse.json(
      { error: 'Failed to submit survey' },
      { status: 500 }
    );
  }
}
