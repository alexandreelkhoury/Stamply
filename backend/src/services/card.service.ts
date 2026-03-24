import { cardRepo } from '../repositories/card.repo';
import { NotFoundError } from '../types';

export const cardService = {
  async getPublic(qrCode: string) {
    const card = await cardRepo.findByQrCodePublic(qrCode);
    if (!card) throw new NotFoundError('Card');
    return card;
  },

  async list(merchantId: string) {
    return cardRepo.findByMerchant(merchantId);
  },

  async getById(id: string, merchantId: string) {
    const card = await cardRepo.findByIdAndMerchant(id, merchantId);
    if (!card) throw new NotFoundError('Card');
    return card;
  },
};
