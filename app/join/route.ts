import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto';

// Generate a random 6-character alphanumeric token code (e.g. PEN-849201 or PEN-X7A9K2)
function generateParticipantTokenString(): string {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const randomBytes = crypto.randomBytes(6);
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars[randomBytes[i] % chars.length];
  }
  return `PEN-${result}`;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawArm = searchParams.get('arm') || 'intervention';
    const campaignSlug = searchParams.get('campaign');
    const locale = searchParams.get('locale') || 'en';

    // Normalize arm to "intervention" or "control"
    const isControl = rawArm.toLowerCase().trim() === 'control';
    const armGroup = isControl ? 'CONTROL' : 'INTERVENTION';

    // Optional campaign lookup
    let campaignId: string | null = null;
    if (campaignSlug) {
      const campaign = await prisma.campaign.findFirst({
        where: {
          OR: [{ slug: campaignSlug }, { id: campaignSlug }],
          status: 'ACTIVE',
        },
      });
      if (campaign) {
        campaignId = campaign.id;
      }
    }

    // Generate unique participant token (e.g. P-84920)
    let token = generateParticipantTokenString();
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 10) {
      attempts++;
      const existing = await prisma.participant.findFirst({
        where: { externalId: token },
      });
      if (!existing) {
        isUnique = true;
      } else {
        token = generateParticipantTokenString();
      }
    }

    // Create fresh Participant & Token in PostgreSQL
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 7 * 24 * 3600 * 1000); // 7 days TTL

    const participant = await prisma.participant.create({
      data: {
        externalId: token,
        groupId: armGroup,
        status: 'ACTIVE',
        campaignId: campaignId,
        tokens: {
          create: {
            tokenHash: token,
            tokenPayload: token.replace(/^(?:PEN|P)-/, ''),
            hmacTag: '',
            status: 'PENDING',
            useLimit: 100,
            useCount: 0,
            expiresAt: expiresAt,
          },
        },
      },
    });

    // Determine target redirect path
    const destinationPath = isControl
      ? `/${locale}/control?token=${encodeURIComponent(token)}`
      : `/${locale}/intervention?token=${encodeURIComponent(token)}`;

    const redirectUrl = new URL(destinationPath, request.url);
    return NextResponse.redirect(redirectUrl, 302);
  } catch (error) {
    console.error('Error handling /join gateway request:', error);
    // Fallback redirect to main entry page
    const fallbackUrl = new URL('/en/intervention', request.url);
    return NextResponse.redirect(fallbackUrl, 302);
  }
}
