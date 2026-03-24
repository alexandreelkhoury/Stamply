import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentMerchant } from '@/lib/auth';

// Simple in-memory rate limiting (use Redis in production)
const recentStamps = new Map<string, number>();

export async function POST(req: NextRequest) {
  const merchant = await getCurrentMerchant();
  if (!merchant) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const { qrCode } = await req.json();

    if (!qrCode) {
      return NextResponse.json({ error: 'Missing QR code' }, { status: 400 });
    }

    // Find the card
    const card = await db.card.findUnique({
      where: { qrCode },
      include: {
        program: true,
        customer: { select: { name: true, phone: true } },
      },
    });

    if (!card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    // Verify merchant owns this program
    if (card.program.merchantId !== merchant.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Rate limit: 1 stamp per card per 15 minutes
    const rateLimitKey = `${card.id}`;
    const lastStamp = recentStamps.get(rateLimitKey);
    const fifteenMinutes = 15 * 60 * 1000;
    if (lastStamp && Date.now() - lastStamp < fifteenMinutes) {
      return NextResponse.json(
        { error: 'Already stamped recently. Please wait before stamping again.' },
        { status: 429 }
      );
    }

    // Check if reward is earned
    const newStampCount = card.currentStamps + 1;
    const rewardEarned = newStampCount >= card.program.stampsRequired;

    // Transaction: create stamp + update card
    const [stamp] = await db.$transaction([
      db.stamp.create({
        data: {
          cardId: card.id,
          merchantId: merchant.id,
          stampType: rewardEarned ? 'reward_redeemed' : 'stamp',
        },
      }),
      db.card.update({
        where: { id: card.id },
        data: {
          currentStamps: rewardEarned ? 0 : newStampCount,
          totalStamps: card.totalStamps + 1,
          rewardsEarned: rewardEarned ? card.rewardsEarned + 1 : card.rewardsEarned,
        },
      }),
    ]);

    // Set rate limit
    recentStamps.set(rateLimitKey, Date.now());

    // Clean up old entries periodically
    if (recentStamps.size > 10000) {
      const cutoff = Date.now() - fifteenMinutes;
      for (const [key, time] of recentStamps) {
        if (time < cutoff) recentStamps.delete(key);
      }
    }

    return NextResponse.json({
      success: true,
      stamp: {
        id: stamp.id,
        customerName: card.customer.name || card.customer.phone,
        currentStamps: rewardEarned ? 0 : newStampCount,
        stampsRequired: card.program.stampsRequired,
        rewardEarned,
        rewardText: card.program.rewardText,
        programName: card.program.name,
      },
    });
  } catch (error) {
    console.error('Stamp error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
