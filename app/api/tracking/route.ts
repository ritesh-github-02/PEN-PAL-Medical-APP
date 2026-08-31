import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    let body: any;
    const contentType = req.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      body = await req.json();
    } else {
      const text = await req.text();
      try {
        body = JSON.parse(text);
      } catch {
        body = {};
      }
    }

    const cookieStore = await cookies();
    const sessionId = body.sessionId || cookieStore.get('penpal_session')?.value;
    const participantId = body.participantId || cookieStore.get('penpal_participant')?.value;

    const ipAddress =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    const { eventType, eventData, stepId, stepIndex, durationMs, isNewVisit, path, isComplete } = body;

    // 1. Log generic interaction event
    if (eventType) {
      if (participantId || sessionId) {
        await prisma.eventLog.create({
          data: {
            participantId: participantId || null,
            sessionId: sessionId || null,
            eventType: eventType,
            eventData: eventData ? JSON.stringify(eventData) : null,
            path: path || null,
            ipAddress,
            userAgent,
          },
        });
      }
    }

    // 2. Record duration metrics (for slides or control page)
    if (durationMs && durationMs > 50 && participantId && stepId) {
      const isVisit = Boolean(isNewVisit);
      await prisma.slideMetric.upsert({
        where: {
          participantId_stepId: {
            participantId,
            stepId,
          },
        },
        update: {
          durationMs: { increment: Math.round(durationMs) },
          ...(isVisit ? { visitCount: { increment: 1 } } : {}),
        },
        create: {
          participantId,
          stepId,
          stepIndex: stepIndex || 0,
          durationMs: Math.round(durationMs),
          visitCount: 1,
        },
      });
    }

    // 3. Update session duration & heartbeat
    if (sessionId) {
      const additionalSeconds = durationMs ? Math.round(durationMs / 1000) : 0;
      await prisma.session.update({
        where: { id: sessionId },
        data: {
          updatedAt: new Date(),
          durationSeconds: additionalSeconds > 0 ? { increment: additionalSeconds } : undefined,
          status: isComplete ? 'COMPLETED' : undefined,
          endTime: isComplete ? new Date() : undefined,
        },
      }).catch(() => {});
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Can't reach database server")) {
      return NextResponse.json({ success: false, error: 'Database cold start' }, { status: 503 });
    }
    console.error('Tracking API error:', error);
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 });
  }
}
