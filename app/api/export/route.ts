import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import Papa from 'papaparse';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');

  try {
    let data: any[] = [];
    let filename = '';

    if (type === 'responses') {
      const responses = await prisma.questionnaireResponse.findMany({
        include: { participant: true },
        orderBy: { createdAt: 'desc' }
      });
      data = responses.map(r => ({
        ResponseID: r.id,
        ParticipantID: r.participantId,
        Group: r.participant.groupId,
        QuestionID: r.questionId,
        Answer: r.answerValue,
        Timestamp: r.createdAt.toISOString()
      }));
      filename = 'penpal_responses.csv';
    } 
    else if (type === 'events') {
      const events = await prisma.eventLog.findMany({
        orderBy: { timestamp: 'desc' },
        take: 5000 // Limit for safety
      });
      data = events.map(e => ({
        EventID: e.id,
        ParticipantID: e.participantId || 'unknown',
        SessionID: e.sessionId || 'unknown',
        EventType: e.eventType,
        EventData: e.eventData,
        Path: e.path,
        Timestamp: e.timestamp.toISOString()
      }));
      filename = 'penpal_events.csv';
    }
    else {
      return new NextResponse('Invalid export type', { status: 400 });
    }

    const csv = Papa.unparse(data);

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    });

  } catch (error) {
    // Silence console logging for DB errors in the preview environment
    const fallbackCsv = Papa.unparse([{ Notice: 'Database connection unavailable in preview environment. Please configure DATABASE_URL for actual data.' }]);
    
    return new NextResponse(fallbackCsv, {
      status: 200, // Return 200 so the user gets a downloadable file instead of a browser error
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="preview_notice.csv"`
      }
    });
  }
}
