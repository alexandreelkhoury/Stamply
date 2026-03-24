import { db } from '../lib/db';

export const stampRepo = {
  createWithCardUpdate(
    cardId: string,
    merchantId: string,
    stampType: string,
    cardUpdate: { currentStamps: number; rewardEarned: boolean },
  ) {
    return db.$transaction([
      db.stamp.create({
        data: { cardId, merchantId, stampType },
      }),
      db.card.update({
        where: { id: cardId },
        data: {
          currentStamps: cardUpdate.rewardEarned ? 0 : cardUpdate.currentStamps,
          totalStamps: { increment: 1 },
          ...(cardUpdate.rewardEarned && { rewardsEarned: { increment: 1 } }),
        },
      }),
    ]);
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
