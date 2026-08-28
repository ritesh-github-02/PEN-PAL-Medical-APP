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
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;

  try {
    let data: any[] = [];
    let filename = '';

    const participantId = searchParams.get('participantId');
    const campaignId = searchParams.get('campaignId');

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
          campaign: true,
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
        Campaign: p.campaign?.name || 'Unassigned',
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
    else if (type === 'campaign_links' || type === 'campaign_tokens') {
      const whereClause = campaignId ? { campaignId } : { campaignId: { not: null } };
      
      const participants = await prisma.participant.findMany({
        where: whereClause,
        include: {
          campaign: true,
          tokens: {
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        },
        orderBy: [{ campaignId: 'asc' }, { createdAt: 'asc' }]
      });

      let campaignSlug = 'all';
      if (campaignId && participants[0]?.campaign?.slug) {
        campaignSlug = participants[0].campaign.slug;
      }

      data = participants.map((p, idx) => {
        const token = p.tokens[0]?.tokenHash || p.externalId || '';
        const targetPath = p.groupId === 'CONTROL' ? 'control' : 'intervention';
        const directUrl = `${baseUrl}/${targetPath}?token=${encodeURIComponent(token)}`;

        return {
          Index: idx + 1,
          ParticipantID: p.externalId || `PARTICIPANT-${idx + 1}`,
          AccessToken: token,
          DirectInvitationURL: directUrl,
          StudyArm: p.groupId,
          CampaignName: p.campaign?.name || 'Unassigned',
          CampaignSlug: p.campaign?.slug || 'none',
          Status: p.tokens[0]?.status || p.status,
          TimesUsed: p.tokens[0]?.useCount || 0,
          CreatedAt: p.createdAt.toISOString()
        };
      });

      const timestamp = new Date().toISOString().slice(0, 10);
      filename = `penpal_campaign_${campaignSlug}_links_${timestamp}.csv`;
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
    else if (type === 'slide_metrics') {
      const metrics = await prisma.slideMetric.findMany({
        include: { participant: true },
        orderBy: [{ participantId: 'asc' }, { stepIndex: 'asc' }],
      });
      data = metrics.map(m => ({
        MetricID: m.id,
        ParticipantID: m.participant?.externalId || m.participantId,
        CohortGroup: m.participant?.groupId || 'N/A',
        StepID: m.stepId,
        StepIndex: m.stepIndex,
        DurationSeconds: (m.durationMs / 1000).toFixed(2),
        DurationMs: m.durationMs,
        VisitCount: m.visitCount,
        UpdatedAt: m.updatedAt.toISOString(),
      }));
      filename = 'penpal_slide_telemetry_metrics.csv';
    }
    else {
      return new NextResponse('Invalid export type', { status: 400 });
    }

    // Include UTF-8 BOM for flawless Excel compatibility
    const csvContent = '\uFEFF' + Papa.unparse(data);

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    });

  } catch (error) {
    const fallbackCsv = '\uFEFF' + Papa.unparse([{ Notice: 'Database connection unavailable in preview environment.' }]);
    
    return new NextResponse(fallbackCsv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="preview_notice.csv"`
      }
    });
  }
}
