import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { generateSecureToken } from '@/lib/security';

const ADMIN_SECRET = (process.env.ADMIN_SECRET || 'penpal-secure-session-key-2026').trim();

// GET: List all campaigns with participant & token counts, or get links for a specific campaign
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const campaignId = searchParams.get('campaignId');

    // If a specific campaignId is requested, return its detailed participants and tokens
    if (campaignId) {
      const campaign = await prisma.campaign.findUnique({
        where: { id: campaignId },
        include: {
          participants: {
            orderBy: { createdAt: 'asc' },
            include: {
              tokens: {
                orderBy: { createdAt: 'desc' },
                take: 1,
              },
            },
          },
        },
      });

      if (!campaign) {
        return NextResponse.json(
          { success: false, error: 'Campaign not found.' },
          { status: 404 }
        );
      }

      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;
      const targetPath = campaign.arm === 'CONTROL' ? 'control' : 'intervention';

      const links = campaign.participants.map((p, idx) => {
        const token = p.tokens[0]?.tokenHash || p.externalId || '';
        const url = `${baseUrl}/en/${targetPath}?token=${encodeURIComponent(token)}`;
        return {
          index: idx + 1,
          participantId: p.id,
          externalId: p.externalId || `PARTICIPANT-${idx + 1}`,
          token,
          url,
          arm: campaign.arm,
          status: p.tokens[0]?.status || p.status,
          useCount: p.tokens[0]?.useCount || 0,
          lastUsedAt: p.tokens[0]?.lastUsedAt || null,
          createdAt: p.createdAt,
        };
      });

      return NextResponse.json({
        success: true,
        campaign: {
          id: campaign.id,
          name: campaign.name,
          slug: campaign.slug,
          arm: campaign.arm,
          status: campaign.status,
          createdAt: campaign.createdAt,
          totalGenerated: links.length,
        },
        links,
      });
    }

    // Default: List all campaigns with participant counts
    const campaigns = await prisma.campaign.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { participants: true },
        },
      },
    });

    return NextResponse.json({
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
    });
  } catch (error: any) {
    console.error('API Error fetching campaigns:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to load campaigns' },
      { status: 500 }
    );
  }
}

// POST: Create a new campaign and generate N unique links and tokens
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, arm, quantity = 1, campaignId: existingCampaignId } = body;

    // Mode A: Append more tokens to an existing campaign
    if (existingCampaignId) {
      const campaign = await prisma.campaign.findUnique({
        where: { id: existingCampaignId },
        include: { _count: { select: { participants: true } } },
      });

      if (!campaign) {
        return NextResponse.json(
          { success: false, error: 'Campaign not found' },
          { status: 404 }
        );
      }

      const countToGenerate = Math.max(1, Math.min(Number(quantity) || 1, 500));
      const currentCount = campaign._count.participants;
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;
      const targetPath = campaign.arm === 'CONTROL' ? 'control' : 'intervention';

      const generatedLinks: any[] = [];

      for (let i = 1; i <= countToGenerate; i++) {
        const participantNumber = currentCount + i;
        const externalId = `${campaign.slug.toUpperCase().slice(0, 8)}-${String(participantNumber).padStart(3, '0')}`;

        // Create participant
        const participant = await prisma.participant.create({
          data: {
            externalId,
            groupId: campaign.arm,
            status: 'ACTIVE',
            campaignId: campaign.id,
          },
        });

        // Create cryptographically secure token
        const { raw, sha, payload, hmac } = generateSecureToken(ADMIN_SECRET, participant.id);

        await prisma.participantToken.create({
          data: {
            tokenHash: raw,
            tokenPayload: payload,
            hmacTag: hmac,
            participantId: participant.id,
            status: 'PENDING',
            useLimit: 100, // Multi-use permitted for campaign cohorts
            useCount: 0,
          },
        });

        const url = `${baseUrl}/${targetPath}?token=${encodeURIComponent(raw)}`;

        generatedLinks.push({
          index: participantNumber,
          participantId: participant.id,
          externalId,
          token: raw,
          url,
          arm: campaign.arm,
          status: 'PENDING',
          createdAt: participant.createdAt,
        });
      }

      revalidatePath('/[locale]/admin', 'page');

      return NextResponse.json({
        success: true,
        campaign: {
          id: campaign.id,
          name: campaign.name,
          slug: campaign.slug,
          arm: campaign.arm,
          status: campaign.status,
          totalGenerated: currentCount + countToGenerate,
        },
        newlyGenerated: generatedLinks,
        totalAdded: countToGenerate,
      });
    }

    // Mode B: Create brand new campaign with N tokens
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: 'Campaign name must be at least 2 characters.' },
        { status: 400 }
      );
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

    const targetArm = arm === 'CONTROL' ? 'CONTROL' : 'INTERVENTION';

    // 1. Create Campaign
    const campaign = await prisma.campaign.create({
      data: {
        name: cleanName,
        slug,
        arm: targetArm,
        status: 'ACTIVE',
      },
    });

    // 2. Generate N Unique Participants & Secure Tokens
    const countToGenerate = Math.max(1, Math.min(Number(quantity) || 1, 500));
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;
    const targetPath = targetArm === 'CONTROL' ? 'control' : 'intervention';

    const generatedLinks: any[] = [];

    for (let i = 1; i <= countToGenerate; i++) {
      const externalId = `${slug.toUpperCase().slice(0, 8)}-${String(i).padStart(3, '0')}`;

      // Create Participant bound to Campaign
      const participant = await prisma.participant.create({
        data: {
          externalId,
          groupId: targetArm,
          status: 'ACTIVE',
          campaignId: campaign.id,
        },
      });

      // Generate clean token e.g. PEN-AB12CD
      const { raw, sha, payload, hmac } = generateSecureToken(ADMIN_SECRET, participant.id);

      await prisma.participantToken.create({
        data: {
          tokenHash: raw,
          tokenPayload: payload,
          hmacTag: hmac,
          participantId: participant.id,
          status: 'PENDING',
          useLimit: 100,
          useCount: 0,
        },
      });

      const url = `${baseUrl}/${targetPath}?token=${encodeURIComponent(raw)}`;

      generatedLinks.push({
        index: i,
        participantId: participant.id,
        externalId,
        token: raw,
        url,
        arm: targetArm,
        status: 'PENDING',
        createdAt: participant.createdAt,
      });
    }

    revalidatePath('/[locale]/admin', 'page');

    return NextResponse.json({
      success: true,
      campaign: {
        id: campaign.id,
        name: campaign.name,
        slug: campaign.slug,
        arm: campaign.arm,
        status: campaign.status,
        createdAt: campaign.createdAt,
        totalGenerated: countToGenerate,
      },
      links: generatedLinks,
      totalGenerated: countToGenerate,
    });
  } catch (error: any) {
    console.error('API Error creating campaign batch:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to create campaign' },
      { status: 500 }
    );
  }
}

// PATCH: Toggle campaign active/deactivated status
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status } = body;

    if (!id || (status !== 'ACTIVE' && status !== 'DEACTIVATED')) {
      return NextResponse.json(
        { success: false, error: 'Invalid campaign ID or status.' },
        { status: 400 }
      );
    }

    const updated = await prisma.campaign.update({
      where: { id },
      data: { status },
    });

    revalidatePath('/[locale]/admin', 'page');
    return NextResponse.json({ success: true, campaign: updated });
  } catch (error: any) {
    console.error('API Error updating campaign status:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to update campaign status' },
      { status: 500 }
    );
  }
}
