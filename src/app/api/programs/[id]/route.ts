import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentMerchant } from '@/lib/auth';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const merchant = await getCurrentMerchant();
  if (!merchant) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { id } = await params;

  const program = await db.program.findFirst({
    where: { id, merchantId: merchant.id },
  });

  if (!program) {
    return NextResponse.json({ error: 'Program not found' }, { status: 404 });
  }

  try {
    const data = await req.json();
    const updated = await db.program.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.stampsRequired !== undefined && { stampsRequired: parseInt(data.stampsRequired) }),
        ...(data.rewardText !== undefined && { rewardText: data.rewardText }),
        ...(data.cardColor !== undefined && { cardColor: data.cardColor }),
        ...(data.textColor !== undefined && { textColor: data.textColor }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });

    return NextResponse.json({ program: updated });
  } catch (error) {
    console.error('Update program error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const merchant = await getCurrentMerchant();
  if (!merchant) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { id } = await params;

  const program = await db.program.findFirst({
    where: { id, merchantId: merchant.id },
  });

  if (!program) {
    return NextResponse.json({ error: 'Program not found' }, { status: 404 });
  }

  await db.program.update({ where: { id }, data: { isActive: false } });
  return NextResponse.json({ success: true });
}
