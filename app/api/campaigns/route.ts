import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// GET: List all campaigns with participant scan counts
export async function GET() {
  try {
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

// POST: Create a new campaign
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, arm } = body;

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

    const campaign = await prisma.campaign.create({
      data: {
        name: cleanName,
        slug,
        arm: arm === 'CONTROL' ? 'CONTROL' : 'INTERVENTION',
        status: 'ACTIVE',
      },
    });

    revalidatePath('/[locale]/admin', 'page');
    return NextResponse.json({ success: true, campaign });
  } catch (error: any) {
    console.error('API Error creating campaign:', error);
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
