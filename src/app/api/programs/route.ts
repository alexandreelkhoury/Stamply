import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentMerchant } from '@/lib/auth';

export async function GET() {
  const merchant = await getCurrentMerchant();
  if (!merchant) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const programs = await db.program.findMany({
    where: { merchantId: merchant.id },
    include: { _count: { select: { cards: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ programs });
}

export async function POST(req: NextRequest) {
  const merchant = await getCurrentMerchant();
  if (!merchant) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const { name, stampsRequired, rewardText, cardColor, textColor } = await req.json();

    if (!name || !stampsRequired || !rewardText) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const program = await db.program.create({
      data: {
        merchantId: merchant.id,
        name,
        stampsRequired: parseInt(stampsRequired),
        rewardText,
        cardColor: cardColor || '#6C63FF',
        textColor: textColor || '#FFFFFF',
      },
    });

    return NextResponse.json({ program }, { status: 201 });
  } catch (error) {
    console.error('Create program error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
