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

    try {
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
    } catch (createErr: any) {
      // If foreign key constraint failed (e.g. session was already deleted), safely fallback without foreign keys
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
      await prisma.session.update({
        where: { id: sessionId },
        data: {
          status: 'COMPLETED',
          endTime: new Date(),
          updatedAt: new Date(),
        },
      }).catch(() => {});
    }

    if (participantId) {
      await prisma.participant.update({
        where: { id: participantId },
        data: {
          status: 'COMPLETED',
          updatedAt: new Date(),
        },
      }).catch(() => {});
    }

    await logInteraction('SESSION_COMPLETE', { completedAt: new Date().toISOString() }, path);
  } catch (error) {
    console.error('Failed to complete session', error);
  }
}
