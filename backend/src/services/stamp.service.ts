import { cardRepo } from '../repositories/card.repo';
import { stampRepo } from '../repositories/stamp.repo';
import { NotFoundError, ForbiddenError, RateLimitError } from '../types';

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
    const card = await cardRepo.findByQrCode(qrCode);
    if (!card) throw new NotFoundError('Card');

    if (card.program.merchantId !== merchantId) {
      throw new ForbiddenError('This card does not belong to your program');
    }

    checkRateLimit(card.id);

    const newStampCount = card.currentStamps + 1;
    const rewardEarned = newStampCount >= card.program.stampsRequired;
    const stampType = rewardEarned ? 'reward_redeemed' : 'stamp';

    const [stamp] = await stampRepo.createWithCardUpdate(
      card.id,
      merchantId,
      stampType,
      { currentStamps: newStampCount, rewardEarned },
    );

    rateLimitMap.set(card.id, Date.now());
    cleanupRateLimitMap();

    return {
      stamp,
      customerName: card.customer.name || card.customer.phone,
      currentStamps: rewardEarned ? 0 : newStampCount,
      stampsRequired: card.program.stampsRequired,
      rewardEarned,
      rewardText: card.program.rewardText,
      programName: card.program.name,
    };
  },

  async list(merchantId: string) {
    return stampRepo.findByMerchant(merchantId);
  },
};
