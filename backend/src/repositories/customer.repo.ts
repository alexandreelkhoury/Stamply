import { db } from '../lib/db';

export const customerRepo = {
  findByMerchant(merchantId: string) {
    return db.customer.findMany({
      where: {
        cards: {
          some: { program: { merchantId } },
        },
      },
      include: {
        cards: {
          where: { program: { merchantId } },
          include: { program: { select: { name: true, stampsRequired: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  findByPhone(phone: string) {
    return db.customer.findUnique({ where: { phone } });
  },

  findByIdWithCards(id: string, merchantId: string) {
    return db.customer.findUnique({
      where: { id },
      include: {
        cards: {
          where: { program: { merchantId } },
          include: {
            program: { select: { name: true, stampsRequired: true, rewardText: true } },
            stamps: { orderBy: { createdAt: 'desc' }, take: 20 },
          },
        },
      },
    });
  },

  create(data: { phone: string; name: string | null }) {
    return db.customer.create({ data });
  },
};
