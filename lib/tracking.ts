'use server';

import prisma from '@/lib/prisma';
import { cookies, headers } from 'next/headers';

export async function logInteraction(eventType: string, eventData: any, path: string) {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('penpal_session')?.value;
    const participantId = cookieStore.get('penpal_participant')?.value;

    if (!sessionId && !participantId) {
      return;
    }

    let ipAddress = 'unknown';
    let userAgent = 'unknown';
    try {
      const h = await headers();
      ipAddress = h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip') || 'unknown';
      userAgent = h.get('user-agent') || 'unknown';
    } catch {}

    // Verify foreign keys exist to avoid constraint violation errors (P2003)
    let validParticipantId: string | null = null;
    if (participantId) {
      const p = await prisma.participant.findUnique({
        where: { id: participantId },
        select: { id: true },
      }).catch(() => null);
      if (p) validParticipantId = p.id;
    }

    let validSessionId: string | null = null;
    if (sessionId) {
      const s = await prisma.session.findUnique({
        where: { id: sessionId },
        select: { id: true },
      }).catch(() => null);
      if (s) validSessionId = s.id;
    }

    // Auto-heal session association if participant is valid but session is stale/missing
    if (validParticipantId && !validSessionId) {
      const activeSession = await prisma.session.findFirst({
        where: { participantId: validParticipantId },
        orderBy: { createdAt: 'desc' },
        select: { id: true },
      }).catch(() => null);
      if (activeSession) {
        validSessionId = activeSession.id;
      }
    }

    try {
      await prisma.eventLog.create({
        data: {
          participantId: validParticipantId,
          sessionId: validSessionId,
          eventType: eventType,
          eventData: eventData ? JSON.stringify(eventData) : null,
          path: path || null,
          ipAddress,
          userAgent,
        },
      });
    } catch (createErr: any) {
      // Fallback if foreign key constraint failed
      if (createErr.code === 'P2003') {
        await prisma.eventLog.create({
          data: {
            eventType: eventType,
            eventData: eventData ? JSON.stringify(eventData) : null,
            path: path || null,
            ipAddress,
            userAgent,
          },
        }).catch(() => {});
      }
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes("Can't reach database server")) {
       return;
    }
    console.error('Failed to log interaction', error);
  }
}

export async function completeUserSession(path: string = '/control') {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('penpal_session')?.value;
    const participantId = cookieStore.get('penpal_participant')?.value;

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
            updatedAt: new Date(),
          },
        }).catch(() => {});
      }
    }

    if (participantId) {
      const participantExists = await prisma.participant.findUnique({
        where: { id: participantId },
        select: { id: true },
      }).catch(() => null);

      if (participantExists) {
        await prisma.participant.update({
          where: { id: participantId },
          data: {
            status: 'COMPLETED',
            updatedAt: new Date(),
          },
        }).catch(() => {});
      }
    }

    await logInteraction('SESSION_COMPLETE', { completedAt: new Date().toISOString() }, path);
  } catch (error) {
    console.error('Failed to complete session', error);
  }
}
