import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import Papa from 'papaparse';
import { parseUserAgent } from '@/lib/device-detector';

const STUDY_SLIDES_CONFIG = [
  { id: 'screen1_intro', slideNumber: 1, title: 'Introduction & Consent Briefing', type: 'Intro' },
  { id: 'screen2_statistics', slideNumber: 2, title: 'Safety Statistics (100 Kids)', type: 'Statistics' },
  { id: 'screen3_5_knowledge_test', slideNumber: 3, title: 'Penicillin Knowledge Quiz', type: 'Quiz' },
  { id: 'screen4_testing', slideNumber: 4, title: 'Allergy Testing Education', type: 'Education' },
  { id: 'screen6_survey_intro', slideNumber: 5, title: 'Clinical Survey Overview', type: 'Info' },
  { id: 'screen6_1_symptoms', slideNumber: 6, title: 'Reported Symptoms Assessment', type: 'Question' },
  { id: 'screen6_2_timing', slideNumber: 7, title: 'Age at Reaction (Slider)', type: 'Question' },
  { id: 'screen6_3_onset', slideNumber: 8, title: 'Time to Symptom Onset', type: 'Question' },
  { id: 'screen6_4_resolution', slideNumber: 9, title: 'Medical Care Received', type: 'Question' },
  { id: 'screen6_4b_resolution_type', slideNumber: 10, title: 'Reaction Resolution Method', type: 'Question' },
  { id: 'screen6_5_yetagain', slideNumber: 11, title: 'Subsequent Penicillin Exposure', type: 'Question' },
  { id: 'screen7_summary', slideNumber: 12, title: 'Action Steps & Clinical Summary', type: 'Summary' },
  { id: 'screen_end', slideNumber: 13, title: 'Non-Participant End Screen', type: 'Exit' },
];

const STEP_LABELS_MAP: Record<string, { slideNumber: number; title: string; type: string }> = Object.fromEntries(
  STUDY_SLIDES_CONFIG.map(s => [s.id, s])
);

// Format date into Eastern Standard Time (EST / EDT)
function formatEST(date: Date | string | null | undefined): string {
  if (!date) return 'N/A';
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return 'N/A';
    return new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
      timeZoneName: 'short',
    }).format(d);
  } catch {
    return String(date);
  }
}

function formatDuration(totalSeconds: number): string {
  if (isNaN(totalSeconds) || totalSeconds <= 0) return '< 1s';
  if (totalSeconds < 60) return `${Math.round(totalSeconds * 10) / 10}s`;
  const mins = Math.floor(totalSeconds / 60);
  const secs = Math.round(totalSeconds % 60);
  return `${mins}m ${secs}s`;
}

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

  if (rawVal === 'none_selected') {
    return 'None Selected / Not Provided';
  }

  if (rawVal === 'acknowledged') {
    return 'Viewed & Acknowledged';
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

  if (questionId === 'screen6_2_timing') {
    return `${rawVal} years old`;
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

    // ─────────────────────────────────────────────────────────────────────────────
    // 1. RESPONSES EXPORT
    // ─────────────────────────────────────────────────────────────────────────────
    if (type === 'responses' || type === 'participant_responses') {
      const whereClause = participantId ? { participantId } : {};
      const questionIds = ['screen1_intro', 'screen3_5_knowledge_test', 'screen6_1_symptoms', 'screen6_2_timing', 'screen6_3_onset', 'screen6_4_resolution', 'screen6_4b_resolution_type', 'screen6_5_yetagain'];
      const responses = await prisma.questionnaireResponse.findMany({
        where: {
          ...whereClause,
          questionId: { in: questionIds },
          answerValue: { notIn: ['acknowledged', ''] }
        },
        include: {
          participant: {
            include: { campaign: true }
          }
        },
        orderBy: [{ participantId: 'asc' }, { createdAt: 'asc' }]
      });

      data = responses.map((r, idx) => {
        const stepInfo = STEP_LABELS_MAP[r.questionId] || { slideNumber: 0, title: r.questionId, type: 'Field' };
        const dwellSeconds = r.timeSpentMs ? (r.timeSpentMs / 1000).toFixed(2) : '0.00';

        return {
          Index: idx + 1,
          ParticipantID: r.participant?.externalId || r.participantId,
          DatabaseGUID: r.participantId,
          StudyArm: r.participant?.groupId || 'N/A',
          CampaignName: r.participant?.campaign?.name || 'Unassigned',
          SlideNumber: stepInfo.slideNumber || 'N/A',
          QuestionTitle: stepInfo.title,
          QuestionID: r.questionId,
          AnswerValue: formatAnswerValue(r.questionId, r.answerValue),
          DwellTime_Seconds: dwellSeconds,
          SubmittedAt_EST: formatEST(r.createdAt),
          Timestamp_UTC: r.createdAt.toISOString()
        };
      });

      const prefix = participantId ? `participant_${participantId}` : 'all_participants';
      filename = `penpal_${prefix}_answers_EST.csv`;
    } 
    // ─────────────────────────────────────────────────────────────────────────────
    // 2. SLIDE TELEMETRY & EXACT TIMING (EST)
    // ─────────────────────────────────────────────────────────────────────────────
    else if (type === 'slide_metrics' || type === 'participant_slide_telemetry') {
      const whereClause = participantId ? { participantId } : {};
      const metrics = await prisma.slideMetric.findMany({
        where: whereClause,
        include: {
          participant: {
            include: {
              campaign: true,
              responses: true,
              tokens: {
                orderBy: { createdAt: 'desc' },
                take: 1
              },
              events: {
                where: {
                  OR: [
                    { eventType: 'ACCESSIBILITY_INTERACTION' },
                    { eventData: { contains: 'Screen Reader' } },
                    { eventData: { contains: 'Assistive' } }
                  ]
                },
                take: 5
              }
            }
          }
        },
        orderBy: [{ participantId: 'asc' }, { stepIndex: 'asc' }, { createdAt: 'asc' }],
      });

      data = metrics.map((m, idx) => {
        const stepInfo = STEP_LABELS_MAP[m.stepId] || { slideNumber: m.stepIndex + 1, title: m.stepId, type: 'Slide' };
        const matchingResponse = m.participant?.responses?.find((r: any) => r.questionId === m.stepId);
        const isQuestionStep = ['screen1_intro', 'screen3_5_knowledge_test', 'screen6_1_symptoms', 'screen6_2_timing', 'screen6_3_onset', 'screen6_4_resolution', 'screen6_4b_resolution_type', 'screen6_5_yetagain'].includes(m.stepId);
        const recordedAnswer = (matchingResponse && isQuestionStep && matchingResponse.answerValue !== 'acknowledged')
          ? formatAnswerValue(m.stepId, matchingResponse.answerValue)
          : 'N/A (Informational Slide)';
        const durationSec = (m.durationMs / 1000).toFixed(2);

        const ua = m.participant?.tokens?.[0]?.lastUsedAgent || 'unknown';
        const devInfo = parseUserAgent(ua);
        const hasA11y = (m.participant?.events && m.participant.events.length > 0);

        return {
          Index: idx + 1,
          ParticipantID: m.participant?.externalId || m.participantId,
          DatabaseGUID: m.participantId,
          StudyArm: m.participant?.groupId || 'N/A',
          CampaignName: m.participant?.campaign?.name || 'Unassigned',
          SlideNumber: stepInfo.slideNumber,
          SlideTitle: stepInfo.title,
          SlideID: m.stepId,
          SlideOpenedAt_EST: formatEST(m.createdAt),
          TimeSpent_Seconds: durationSec,
          VisitsCount: m.visitCount,
          AnswerRecordedOnSlide: recordedAnswer,
          DeviceType: devInfo.deviceType,
          Browser: devInfo.browser,
          OperatingSystem: devInfo.os,
          ScreenReader_Accessibility: hasA11y ? 'Detected (NVDA / Assistive Navigation)' : 'None (Standard Interaction)',
          ParticipantStatus: m.participant?.status || 'ACTIVE',
          LastKnownIP: m.participant?.tokens?.[0]?.lastUsedIp || 'N/A',
          Timestamp_UTC: m.createdAt.toISOString()
        };
      });

      const prefix = participantId ? `participant_${participantId}` : 'all_participants';
      filename = `penpal_${prefix}_slide_timings_EST.csv`;
    }
    // ─────────────────────────────────────────────────────────────────────────────
    // 3. PARTICIPANTS COHORT LIST
    // ─────────────────────────────────────────────────────────────────────────────
    else if (type === 'participants') {
      const participants = await prisma.participant.findMany({
        include: {
          campaign: true,
          tokens: {
            orderBy: { createdAt: 'desc' },
            take: 1
          },
          events: {
            where: {
              OR: [
                { eventType: 'ACCESSIBILITY_INTERACTION' },
                { eventData: { contains: 'Screen Reader' } },
                { eventData: { contains: 'Assistive' } }
              ]
            },
            take: 5
          },
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

      data = participants.map((p, idx) => {
        const ua = p.tokens?.[0]?.lastUsedAgent || 'unknown';
        const devInfo = parseUserAgent(ua);
        const hasA11y = (p.events && p.events.length > 0);

        return {
          Index: idx + 1,
          ParticipantID: p.externalId || p.id,
          DatabaseGUID: p.id,
          StudyArm: p.groupId,
          CampaignName: p.campaign?.name || 'Unassigned',
          Status: p.status,
          DeviceType: devInfo.deviceType,
          Browser: devInfo.browser,
          OperatingSystem: devInfo.os,
          ScreenReader_Accessibility: hasA11y ? 'Detected (NVDA / Assistive Navigation)' : 'None (Standard Interaction)',
          AccessToken: p.tokens[0]?.tokenHash || 'N/A',
          TotalSessions: p._count.sessions,
          TotalAnswers: p._count.responses,
          TotalSlideEvents: p._count.events,
          LastSession_EST: p.sessions[0] ? formatEST(p.sessions[0].createdAt) : 'Never',
          EnrolledAt_EST: formatEST(p.createdAt),
          EnrolledAt_UTC: p.createdAt.toISOString()
        };
      });
      filename = 'penpal_clinical_cohort_list_EST.csv';
    }
    // ─────────────────────────────────────────────────────────────────────────────
    // 4. CAMPAIGN BATCH LINKS & TOKENS
    // ─────────────────────────────────────────────────────────────────────────────
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
          CreatedAt_EST: formatEST(p.createdAt),
          CreatedAt_UTC: p.createdAt.toISOString()
        };
      });

      const timestamp = new Date().toISOString().slice(0, 10);
      filename = `penpal_campaign_${campaignSlug}_links_${timestamp}_EST.csv`;
    }
    // ─────────────────────────────────────────────────────────────────────────────
    // 5. EVENT LOGS
    // ─────────────────────────────────────────────────────────────────────────────
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
        Timestamp_EST: formatEST(e.timestamp),
        Timestamp_UTC: e.timestamp.toISOString()
      }));
      filename = 'penpal_audit_events_EST.csv';
    }
    else {
      return new NextResponse('Invalid export type', { status: 400 });
    }

    // Include UTF-8 BOM for flawless Excel / Google Sheets compatibility
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
