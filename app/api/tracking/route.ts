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
    let sessionId = body.sessionId || cookieStore.get('penpal_session')?.value;
    let participantId = body.participantId || cookieStore.get('penpal_participant')?.value;

    const ipAddress =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    // ── Fallback Token Resolution (Guarantees tracking even if cookies were blocked/delayed) ──
    if (!participantId && body.token) {
      const cleanTok = String(body.token).trim();
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

        // Ensure participant status is ACTIVE
        await prisma.participant.update({
          where: { id: foundToken.participantId },
          data: { status: 'ACTIVE' },
        }).catch(() => {});

        // Ensure token status is ACTIVE and record access
        await prisma.participantToken.update({
          where: { id: foundToken.id },
          data: {
            status: foundToken.status === 'PENDING' ? 'ACTIVE' : foundToken.status,
            useCount: { increment: 1 },
            lastUsedAt: new Date(),
            lastUsedIp: ipAddress,
            lastUsedAgent: userAgent,
          },
        }).catch(() => {});

        // Find or create session
        const existingSession = await prisma.session.findFirst({
          where: { participantId: foundToken.participantId },
          orderBy: { createdAt: 'desc' },
        });

        if (existingSession && (Date.now() - new Date(existingSession.createdAt).getTime() < 7200000)) {
          sessionId = existingSession.id;
        } else {
          const newSess = await prisma.session.create({
            data: {
              participantId: foundToken.participantId,
              status: 'IN_PROGRESS',
              startTime: new Date(),
            },
          });
          sessionId = newSess.id;
        }
      }
    }

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

    const res = NextResponse.json({ success: true, participantId, sessionId });

    // Ensure session cookies are attached to response if resolved
    if (sessionId && participantId) {
      const isProd = process.env.NODE_ENV === 'production';
      res.cookies.set('penpal_session', sessionId, {
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax',
        maxAge: 60 * 60 * 2,
        path: '/',
      });
      res.cookies.set('penpal_participant', participantId, {
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax',
        maxAge: 60 * 60 * 2,
        path: '/',
      });
    }

    return res;
  } catch (error) {
    if (error instanceof Error && error.message.includes("Can't reach database server")) {
      return NextResponse.json({ success: false, error: 'Database cold start' }, { status: 503 });
    }
    console.error('Tracking API error:', error);
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 });
  }
}
