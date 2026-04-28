'use server';

import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function logInteraction(eventType: string, eventData: any, path: string) {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('penpal_session')?.value;
    const participantId = cookieStore.get('penpal_participant')?.value;

    if (!sessionId || !participantId) {
      console.warn('Logging interaction without active session.');
      return;
    }

    await prisma.eventLog.create({
      data: {
        participantId: participantId,
        sessionId: sessionId,
        eventType: eventType,
        eventData: JSON.stringify(eventData),
        path: path
      }
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Can\'t reach database server')) {
       // Silenced in preview environment
       return;
    }
    console.error('Failed to log interaction', error);
  }
}
