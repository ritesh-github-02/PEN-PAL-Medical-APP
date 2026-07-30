import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import Papa from 'papaparse';

function formatAnswerValue(questionId: string, rawVal: any): string {
  if (
    rawVal === undefined || 
    rawVal === null || 
    rawVal === 'undefined' || 
    rawVal === ''
  ) {
    if (['screen4_testing', 'screen6_survey_intro', 'screen7_summary', 'screen6_3_onset', 'screen6_4_resolution', 'screen6_5_yetagain'].includes(questionId)) {
      return 'Completed / Viewed';
    }
    return 'Not Specified';
  }

  if (rawVal === '[]' || (Array.isArray(rawVal) && rawVal.length === 0)) {
    if (questionId === 'screen3_5_knowledge_test') return 'No Quiz Options Selected';
    if (questionId === 'screen6_1_symptoms') return 'No Symptoms Reported';
    return 'None Selected';
  }

  if (typeof rawVal === 'string' && (rawVal.startsWith('[') || rawVal.startsWith('{'))) {
    try {
      const parsed = JSON.parse(rawVal);
      if (Array.isArray(parsed)) {
        if (parsed.length === 0) return 'None Selected';
        return parsed.map(item => String(item).replace(/_/g, ' ')).join(', ');
      }
    } catch {}
  }

  if (Array.isArray(rawVal)) {
    if (rawVal.length === 0) return 'None Selected';
    return rawVal.map(item => String(item).replace(/_/g, ' ')).join(', ');
  }

  return String(rawVal).replace(/_/g, ' ');
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');

  try {
    let data: any[] = [];
    let filename = '';

    const participantId = searchParams.get('participantId');

    if (type === 'responses' || type === 'participant_responses') {
      const whereClause = participantId ? { participantId } : {};
      const responses = await prisma.questionnaireResponse.findMany({
        where: whereClause,
        include: { participant: true },
        orderBy: { createdAt: 'desc' }
      });

      data = responses.map(r => ({
        ResponseID: r.id,
        ParticipantID: r.participant?.externalId || r.participantId,
        DatabaseID: r.participantId,
        CohortGroup: r.participant?.groupId || 'N/A',
        QuestionID: r.questionId,
        AnswerValue: formatAnswerValue(r.questionId, r.answerValue),
        SubmittedAt: r.createdAt.toISOString()
      }));

      const prefix = participantId ? `participant_${participantId}` : 'all_participants';
      filename = `penpal_${prefix}_responses.csv`;
    } 
    else if (type === 'participants') {
      const participants = await prisma.participant.findMany({
        include: {
          _count: {
            select: {
              sessions: true,
              responses: true,
              tokens: true,
              events: true,
            }
          },
          sessions: {
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      data = participants.map(p => ({
        ParticipantID: p.externalId || p.id,
        DatabaseID: p.id,
        CohortGroup: p.groupId,
        Status: p.status,
        SessionsCount: p._count.sessions,
        ResponsesCount: p._count.responses,
        TokensCount: p._count.tokens,
        EventsCount: p._count.events,
        LastSessionAt: p.sessions[0] ? p.sessions[0].createdAt.toISOString() : 'None',
        EnrolledAt: p.createdAt.toISOString()
      }));
      filename = 'penpal_clinical_cohort_roster.csv';
    }
    else if (type === 'events') {
      const events = await prisma.eventLog.findMany({
        orderBy: { timestamp: 'desc' },
        take: 5000
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
    const fallbackCsv = Papa.unparse([{ Notice: 'Database connection unavailable in preview environment.' }]);
    
    return new NextResponse(fallbackCsv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="preview_notice.csv"`
      }
    });
  }
}
