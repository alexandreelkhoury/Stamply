import { programRepo } from '../repositories/program.repo';
import { NotFoundError } from '../types';
import { generateQrCode } from '../lib/utils';

export const programService = {
  async list(merchantId: string) {
    return programRepo.findByMerchant(merchantId);
  },

  async getById(id: string, merchantId: string) {
    const program = await programRepo.findByIdWithCards(id, merchantId);
    if (!program) throw new NotFoundError('Program');
    return program;
  },

  async create(merchantId: string, data: {
    name: string;
    stampsRequired: number;
    rewardText: string;
    cardColor?: string;
    textColor?: string;
    category?: string;
    stampIcon?: string;
    showAddress?: boolean;
  }) {
    const enrollmentCode = generateQrCode();
    return programRepo.create({
      merchantId,
      name: data.name,
      stampsRequired: data.stampsRequired,
      rewardText: data.rewardText,
      cardColor: data.cardColor || '#6C63FF',
      textColor: data.textColor || '#FFFFFF',
      category: data.category || 'other',
      stampIcon: data.stampIcon || 'sparkles',
      showAddress: data.showAddress ?? false,
      enrollmentCode,
    });
  },

  async update(id: string, merchantId: string, data: Record<string, unknown>) {
    const existing = await programRepo.findByIdAndMerchant(id, merchantId);
    if (!existing) throw new NotFoundError('Program');

    return programRepo.update(id, data);
  },

  async delete(id: string, merchantId: string) {
    const existing = await programRepo.findByIdAndMerchant(id, merchantId);
    if (!existing) throw new NotFoundError('Program');

    return programRepo.softDelete(id);
  },
};
