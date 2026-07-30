'use server';

import prisma, { withDbRetry } from '@/lib/prisma';
import { cookies } from 'next/headers';

// Get recent token access logs with participant details
export async function getTokenAccessLogs(limit: number = 50) {
  try {
    const logs = await withDbRetry(() =>
      prisma.eventLog.findMany({
        where: {
          eventType: 'TOKEN_VALIDATED'
        },
        include: {
          participant: {
            select: {
              externalId: true,
              groupId: true
            }
          }
        },
        orderBy: {
          timestamp: 'desc'
        },
        take: limit
      })
    );

    return { success: true, logs };
  } catch (error) {
    console.error('Failed to fetch token access logs:', error);
    return { error: 'Failed to fetch logs' };
  }
}

// Get token statistics
export async function getTokenStats() {
  try {
    const statsData = await withDbRetry(async () => {
      const totalTokens = await prisma.participantToken.count();
      const validTokens = await prisma.participantToken.count({
        where: { status: 'VALID' }
      });
      const completedTokens = await prisma.participantToken.count({
        where: { status: 'COMPLETED' }
      });
      const revokedTokens = await prisma.participantToken.count({
        where: { status: 'REVOKED' }
      });
      const expiredTokens = await prisma.participantToken.count({
        where: { status: 'EXPIRED' }
      });

      const usageResult = await prisma.participantToken.aggregate({
        _sum: { useCount: true }
      });
      const totalUsage = (usageResult._sum?.useCount) || 0;
      const avgUsage = totalTokens > 0 ? Math.round((totalUsage / totalTokens) * 10) / 10 : 0;

      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const usedToday = await prisma.participantToken.count({
        where: {
          lastUsedAt: { gte: todayStart }
        }
      });

      return {
        totalTokens,
        validTokens,
        completedTokens,
        revokedTokens,
        expiredTokens,
        totalUsage,
        avgUsage,
        usedToday
      };
    });

    return {
      success: true,
      stats: statsData
    };
  } catch (error) {
    console.error('Failed to fetch token stats:', error);
    return { error: 'Failed to fetch stats' };
  }
}

// Get detailed token usage per participant
export async function getTokenUsageDetails(limit: number = 20) {
  try {
    const tokens = await withDbRetry(() =>
      prisma.participantToken.findMany({
        take: limit,
        orderBy: {
          lastUsedAt: 'desc'
        },
        include: {
          participant: {
            select: {
              externalId: true,
              groupId: true,
              status: true
            }
          }
        }
      })
    );

    return { success: true, tokens };
  } catch (error) {
    console.error('Failed to fetch token usage details:', error);
    return { error: 'Failed to fetch token details' };
  }
}

// Revoke a token (admin action)
export async function revokeToken(tokenId: string) {
  try {
    await withDbRetry(async () => {
      await prisma.participantToken.update({
        where: { id: tokenId },
        data: { status: 'REVOKED' }
      });

      await prisma.eventLog.create({
        data: {
          eventType: 'TOKEN_REVOKED',
          eventData: JSON.stringify({ tokenId })
        }
      });
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to revoke token:', error);
    return { error: 'Failed to revoke token' };
  }
}

// Get real-time active sessions count
export async function getActiveSessionsCount() {
  try {
    const thirtyMinutesAgo = new Date();
    thirtyMinutesAgo.setMinutes(thirtyMinutesAgo.getMinutes() - 30);

    const count = await withDbRetry(() =>
      prisma.session.count({
        where: {
          createdAt: { gte: thirtyMinutesAgo }
        }
      })
    );

    return { success: true, count };
  } catch (error) {
    console.error('Failed to fetch active sessions:', error);
    return { error: 'Failed to fetch active sessions' };
  }
}

// Get authentication events timeline
export async function getAuthTimeline(limit: number = 10) {
  try {
    const events = await withDbRetry(() =>
      prisma.eventLog.findMany({
        where: {
          eventType: {
            in: ['TOKEN_VALIDATED', 'TOKEN_INVALID', 'TOKEN_CREATED', 'TOKEN_REVOKED']
          }
        },
        include: {
          participant: {
            select: {
              externalId: true
            }
          }
        },
        orderBy: {
          timestamp: 'desc'
        },
        take: limit
      })
    );

    return { success: true, events };
  } catch (error) {
    console.error('Failed to fetch auth timeline:', error);
    return { error: 'Failed to fetch timeline' };
  }
}

// Get comprehensive details for a specific participant
export async function getParticipantDetails(participantId: string) {
  try {
    const participant = await prisma.participant.findFirst({
      where: {
        OR: [
          { id: participantId },
          { externalId: participantId }
        ]
      },
      include: {
        responses: {
          orderBy: { createdAt: 'desc' }
        },
        sessions: {
          orderBy: { createdAt: 'desc' }
        },
        tokens: {
          orderBy: { createdAt: 'desc' }
        },
        events: {
          orderBy: { timestamp: 'desc' },
          take: 50
        }
      }
    });

    if (!participant) {
      return { error: 'Participant not found' };
    }

    return { success: true, participant };
  } catch (error) {
    console.error('Failed to fetch participant details:', error);
    return { error: 'Failed to fetch details' };
  }
}
