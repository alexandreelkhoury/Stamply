import { merchantRepo } from '../repositories/merchant.repo';
import { hashPassword, verifyPassword, createToken } from '../lib/auth';
import { BadRequestError, UnauthorizedError } from '../types';

export const authService = {
  async register(email: string, password: string, businessName: string) {
    const existing = await merchantRepo.findByEmail(email);
    if (existing) {
      throw new BadRequestError('Email already registered');
    }

    const passwordHash = await hashPassword(password);
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 14);

    const merchant = await merchantRepo.create({ email, passwordHash, businessName, trialEndsAt });
    const token = createToken(merchant.id);

    return { merchant, token };
  },

  async login(email: string, password: string) {
    const merchant = await merchantRepo.findByEmail(email);
    if (!merchant) {
      throw new UnauthorizedError();
    }

    const valid = await verifyPassword(password, merchant.passwordHash);
    if (!valid) {
      throw new UnauthorizedError();
    }

    const token = createToken(merchant.id);

    return {
      merchant: {
        id: merchant.id,
        email: merchant.email,
        businessName: merchant.businessName,
        subscriptionStatus: merchant.subscriptionStatus,
      },
      token,
    };
  },
};
