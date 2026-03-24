import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentMerchant } from '@/lib/auth';

export async function GET() {
  const merchant = await getCurrentMerchant();
  if (!merchant) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const programs = await db.program.findMany({
    where: { merchantId: merchant.id },
    select: { id: true },
  });

  const programIds = programs.map((p) => p.id);

  const [totalCustomers, totalStampsToday, totalRewards, recentStamps] = await Promise.all([
    db.card.count({ where: { programId: { in: programIds } } }),
    db.stamp.count({
      where: {
        merchantId: merchant.id,
        stampType: 'stamp',
        createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      },
    }),
    db.stamp.count({
      where: {
        merchantId: merchant.id,
        stampType: 'reward_redeemed',
      },
    }),
    db.stamp.findMany({
      where: { merchantId: merchant.id },
      include: {
        card: {
          include: {
            customer: { select: { name: true, phone: true } },
            program: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
  ]);

  return NextResponse.json({
    totalCustomers,
    totalStampsToday,
    totalRewards,
    recentStamps,
  });
}
