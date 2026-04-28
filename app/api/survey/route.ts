import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    // Get participant and session from cookies
    const cookieStore = await cookies();
    const participantId = cookieStore.get('penpal_participant')?.value;
    const sessionId = cookieStore.get('penpal_session')?.value;

    if (!participantId || !sessionId) {
      return NextResponse.json(
        { error: 'No active session' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { answers, surveyType = 'FINAL_EVALUATION' } = body;

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
    await prisma.session.update({
      where: { id: sessionId },
      data: {
        status: 'COMPLETED',
        endTime: new Date()
      }
    });

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
