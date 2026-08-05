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
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [statusGroups, usageResult, usedToday] = await Promise.all([
      prisma.participantToken.groupBy({
        by: ['status'],
        _count: { _all: true },
      }),
      prisma.participantToken.aggregate({ _sum: { useCount: true } }),
      prisma.participantToken.count({ where: { lastUsedAt: { gte: todayStart } } }),
    ]);

    let totalTokens = 0;
    let validTokens = 0;
    let completedTokens = 0;
    let revokedTokens = 0;
    let expiredTokens = 0;

    for (const group of statusGroups) {
      const cnt = group._count._all;
      totalTokens += cnt;
      if (group.status === 'VALID' || group.status === 'PENDING' || group.status === 'ACTIVE') {
        validTokens += cnt;
      } else if (group.status === 'COMPLETED') {
        completedTokens += cnt;
      } else if (group.status === 'REVOKED') {
        revokedTokens += cnt;
      } else if (group.status === 'EXPIRED') {
        expiredTokens += cnt;
      }
    }

    const totalUsage = usageResult._sum?.useCount || 0;
    const avgUsage = totalTokens > 0 ? Math.round((totalUsage / totalTokens) * 10) / 10 : 0;

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
        usedToday,
      },
    };
  } catch (error) {
    console.error('Failed to fetch token stats:', error);
    return { error: 'Failed to fetch token stats' };
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
        },
        slideMetrics: {
          orderBy: { stepIndex: 'asc' }
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

// ── Campaign Management Server Actions ─────────────────────────────────────────

// Create a new campaign QR & general link
export async function createCampaign(name: string, arm: 'INTERVENTION' | 'CONTROL') {
  try {
    if (!name || name.trim().length < 2) {
      return { success: false, error: 'Campaign name must be at least 2 characters.' };
    }

    const cleanName = name.trim();
    let baseSlug = cleanName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');

    if (!baseSlug) baseSlug = 'campaign';

    let slug = baseSlug;
    let count = 1;
    while (await prisma.campaign.findUnique({ where: { slug } })) {
      slug = `${baseSlug}_${count++}`;
    }

    const campaign = await prisma.campaign.create({
      data: {
        name: cleanName,
        slug,
        arm,
        status: 'ACTIVE',
      },
    });

    return { success: true, campaign };
  } catch (error) {
    console.error('Failed to create campaign:', error);
    return { success: false, error: 'Failed to create campaign record.' };
  }
}

// Toggle campaign active/deactivated status
export async function toggleCampaignStatus(id: string, status: 'ACTIVE' | 'DEACTIVATED') {
  try {
    const updated = await prisma.campaign.update({
      where: { id },
      data: { status },
    });
    return { success: true, campaign: updated };
  } catch (error) {
    console.error('Failed to toggle campaign status:', error);
    return { success: false, error: 'Failed to update campaign status.' };
  }
}

// Get all active & deactivated campaigns with participant scan metrics
export async function getCampaigns() {
  try {
    const campaigns = await prisma.campaign.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { participants: true },
        },
      },
    });

    return {
      success: true,
      campaigns: campaigns.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        arm: c.arm,
        status: c.status,
        createdAt: c.createdAt,
        totalScans: c._count.participants,
      })),
    };
  } catch (error) {
    console.error('Failed to fetch campaigns:', error);
    return { success: false, error: 'Failed to load campaigns.' };
  }
}

