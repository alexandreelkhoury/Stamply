import { db } from '../lib/db';

export const stampRepo = {
  // #1: Use interactive transaction to prevent race conditions
  async createWithCardUpdate(cardId: string, merchantId: string) {
    return db.$transaction(async (tx) => {
      // Read current card state INSIDE the transaction
      const card = await tx.card.findUniqueOrThrow({
        where: { id: cardId },
        include: { program: true },
      });

      const newStampCount = card.currentStamps + 1;
      const rewardEarned = newStampCount >= card.program.stampsRequired;
      const stampType = rewardEarned ? 'reward_redeemed' : 'stamp';

      const stamp = await tx.stamp.create({
        data: { cardId, merchantId, stampType },
      });

      await tx.card.update({
        where: { id: cardId },
        data: {
          currentStamps: rewardEarned ? 0 : newStampCount,
          totalStamps: { increment: 1 },
          ...(rewardEarned && { rewardsEarned: { increment: 1 } }),
        },
      });

      return {
        stamp,
        currentStamps: rewardEarned ? 0 : newStampCount,
        stampsRequired: card.program.stampsRequired,
        rewardEarned,
        rewardText: card.program.rewardText,
        programName: card.program.name,
      };
    });
  },

  findByMerchant(merchantId: string, take = 50) {
    return db.stamp.findMany({
      where: { merchantId },
      include: {
        card: {
          include: {
            customer: { select: { name: true, phone: true } },
            program: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take,
    });
  },

  countToday(merchantId: string) {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    return db.stamp.count({
      where: {
        merchantId,
        stampType: 'stamp',
        createdAt: { gte: startOfDay },
      },
    });
  },

  countRewards(merchantId: string) {
    return db.stamp.count({
      where: { merchantId, stampType: 'reward_redeemed' },
    });
  },

  findRecent(merchantId: string, take = 20) {
    return db.stamp.findMany({
      where: { merchantId },
      include: {
        card: {
          include: {
            customer: { select: { name: true, phone: true } },
            program: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take,
    });
  },
};
