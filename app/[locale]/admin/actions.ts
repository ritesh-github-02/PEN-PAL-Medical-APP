'use server';

import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

// Get recent token access logs with participant details
export async function getTokenAccessLogs(limit: number = 50) {
  try {
    const logs = await prisma.eventLog.findMany({
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
    });

    return { success: true, logs };
  } catch (error) {
    console.error('Failed to fetch token access logs:', error);
    return { error: 'Failed to fetch logs' };
  }
}

// Get token statistics
export async function getTokenStats() {
  try {
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

    // Total usage count
    const usageResult = await prisma.participantToken.aggregate({
      _sum: { useCount: true }
    });
    const totalUsage = (usageResult._sum?.useCount) || 0;

    // Average usage per token
    const avgUsage = totalTokens > 0 ? Math.round((totalUsage / totalTokens) * 10) / 10 : 0;

    // Tokens used today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const usedToday = await prisma.participantToken.count({
      where: {
        lastUsedAt: { gte: todayStart }
      }
    });

    return {
      success: true,
      stats: {
        totalTokens,
        validTokens,
        completedTokens,
        revokedTokens,
        expiredTokens,
        totalUsage,
        avgUsage,
        usedToday
      }
    };
  } catch (error) {
    console.error('Failed to fetch token stats:', error);
    return { error: 'Failed to fetch stats' };
  }
}

// Get detailed token usage per participant
export async function getTokenUsageDetails(limit: number = 20) {
  try {
    const tokens = await prisma.participantToken.findMany({
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
    });

    return { success: true, tokens };
  } catch (error) {
    console.error('Failed to fetch token usage details:', error);
    return { error: 'Failed to fetch token details' };
  }
}

// Revoke a token (admin action)
export async function revokeToken(tokenId: string) {
  try {
    await prisma.participantToken.update({
      where: { id: tokenId },
      data: { status: 'REVOKED' }
    });

    // Log the revocation
    await prisma.eventLog.create({
      data: {
        eventType: 'TOKEN_REVOKED',
        eventData: JSON.stringify({ tokenId })
      }
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

    const count = await prisma.session.count({
      where: {
        createdAt: { gte: thirtyMinutesAgo }
      }
    });

    return { success: true, count };
  } catch (error) {
    console.error('Failed to fetch active sessions:', error);
    return { error: 'Failed to fetch active sessions' };
  }
}

// Get authentication events timeline
export async function getAuthTimeline(limit: number = 10) {
  try {
    const events = await prisma.eventLog.findMany({
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
    });

    return { success: true, events };
  } catch (error) {
    console.error('Failed to fetch auth timeline:', error);
    return { error: 'Failed to fetch timeline' };
  }
}
