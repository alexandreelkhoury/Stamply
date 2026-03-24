import { db } from '../lib/db';

const publicSelect = {
  id: true,
  email: true,
  businessName: true,
  phone: true,
  logoUrl: true,
  subscriptionStatus: true,
} as const;

const summarySelect = {
  id: true,
  email: true,
  businessName: true,
  subscriptionStatus: true,
} as const;

export const merchantRepo = {
  findByEmail(email: string) {
    return db.merchant.findUnique({ where: { email } });
  },

  findById(id: string) {
    return db.merchant.findUnique({
      where: { id },
      select: publicSelect,
    });
  },

  create(data: { email: string; passwordHash: string; businessName: string; trialEndsAt: Date }) {
    return db.merchant.create({
      data: {
        ...data,
        subscriptionStatus: 'trial',
      },
      select: summarySelect,
    });
  },
};
