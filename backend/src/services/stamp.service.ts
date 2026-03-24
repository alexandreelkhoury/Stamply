import { cardRepo } from '../repositories/card.repo';
import { stampRepo } from '../repositories/stamp.repo';
import { NotFoundError, ForbiddenError, RateLimitError, BadRequestError } from '../types';

// In-memory rate limiting (1 stamp per card per 15 minutes)
const rateLimitMap = new Map<string, number>();
const RATE_LIMIT_MS = 15 * 60 * 1000;

function cleanupRateLimitMap() {
  if (rateLimitMap.size > 10000) {
    const now = Date.now();
    for (const [key, timestamp] of rateLimitMap) {
      if (now - timestamp > RATE_LIMIT_MS) {
        rateLimitMap.delete(key);
      }
    }
  }
}

function checkRateLimit(cardId: string) {
  const lastStamp = rateLimitMap.get(cardId);
  if (lastStamp && Date.now() - lastStamp < RATE_LIMIT_MS) {
    const remainingMs = RATE_LIMIT_MS - (Date.now() - lastStamp);
    const remainingMin = Math.ceil(remainingMs / 60000);
    throw new RateLimitError(remainingMin);
  }
}

export const stampService = {
  async addStamp(qrCode: string, merchantId: string) {
    // Lookup card for ownership/active checks
    const card = await cardRepo.findByQrCode(qrCode);
    if (!card) throw new NotFoundError('Card');

    if (card.program.merchantId !== merchantId) {
      throw new ForbiddenError('This card does not belong to your program');
    }

    // #8: Block stamps on inactive programs
    if (!card.program.isActive) {
      throw new BadRequestError('This program is no longer active');
    }

    checkRateLimit(card.id);

    // #1: Stamp creation + card update inside transaction (race-safe)
    const result = await stampRepo.createWithCardUpdate(card.id, merchantId);

    rateLimitMap.set(card.id, Date.now());
    cleanupRateLimitMap();

    return {
      ...result,
      customerName: card.customer.name || card.customer.phone,
    };
  },

  async list(merchantId: string) {
    return stampRepo.findByMerchant(merchantId);
  },
};
