import { db } from '../lib/db';

export const programRepo = {
  findByMerchant(merchantId: string) {
    return db.program.findMany({
      where: { merchantId, isActive: true },
      include: { _count: { select: { cards: true } } },
      orderBy: { createdAt: 'desc' },
    });
  },

  findByIdAndMerchant(id: string, merchantId: string) {
    return db.program.findFirst({
      where: { id, merchantId },
    });
  },

  findByIdWithCards(id: string, merchantId: string) {
    return db.program.findFirst({
      where: { id, merchantId },
      include: {
        _count: { select: { cards: true } },
        cards: {
          include: { customer: true },
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
      },
    });
  },

  findActiveByIdAndMerchant(id: string, merchantId: string) {
    return db.program.findFirst({
      where: { id, merchantId, isActive: true },
    });
  },

  create(data: {
    merchantId: string;
    name: string;
    stampsRequired: number;
    rewardText: string;
    cardColor: string;
    textColor: string;
  }) {
    return db.program.create({ data });
  },

  update(id: string, data: Record<string, unknown>) {
    return db.program.update({ where: { id }, data });
  },

  softDelete(id: string) {
    return db.program.update({
      where: { id },
      data: { isActive: false },
    });
  },

  findIdsByMerchant(merchantId: string) {
    return db.program.findMany({
      where: { merchantId },
      select: { id: true },
    });
  },
};
