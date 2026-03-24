import { db } from '../lib/db';

export const cardRepo = {
  findByQrCode(qrCode: string) {
    return db.card.findUnique({
      where: { qrCode },
      include: { program: true, customer: true },
    });
  },

  findByQrCodePublic(qrCode: string) {
    return db.card.findUnique({
      where: { qrCode },
      include: {
        customer: { select: { name: true, phone: true } },
        program: {
          select: {
            name: true,
            stampsRequired: true,
            rewardText: true,
            cardColor: true,
            textColor: true,
          },
        },
      },
    });
  },

  findByCustomerAndProgram(customerId: string, programId: string) {
    return db.card.findUnique({
      where: { customerId_programId: { customerId, programId } },
    });
  },

  findByMerchant(merchantId: string) {
    return db.card.findMany({
      where: { program: { merchantId } },
      include: {
        customer: { select: { name: true, phone: true } },
        program: { select: { name: true, stampsRequired: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  findByIdAndMerchant(id: string, merchantId: string) {
    return db.card.findFirst({
      where: { id, program: { merchantId } },
      include: {
        customer: true,
        program: true,
        stamps: { orderBy: { createdAt: 'desc' }, take: 50 },
      },
    });
  },

  create(data: { customerId: string; programId: string; qrCode: string }) {
    return db.card.create({
      data,
      include: {
        customer: true,
        program: { select: { name: true, stampsRequired: true, rewardText: true } },
      },
    });
  },

  uniqueCustomerCount(programIds: string[]) {
    return db.card.groupBy({
      by: ['customerId'],
      where: { programId: { in: programIds } },
    });
  },
};
