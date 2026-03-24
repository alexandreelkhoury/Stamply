import { programRepo } from '../repositories/program.repo';
import { cardRepo } from '../repositories/card.repo';
import { stampRepo } from '../repositories/stamp.repo';

export const analyticsService = {
  async getDashboard(merchantId: string) {
    const programs = await programRepo.findIdsByMerchant(merchantId);
    const programIds = programs.map((p) => p.id);

    const [customerGroups, totalStampsToday, totalRewards, recentStamps] = await Promise.all([
      cardRepo.uniqueCustomerCount(programIds),
      stampRepo.countToday(merchantId),
      stampRepo.countRewards(merchantId),
      stampRepo.findRecent(merchantId),
    ]);

    return {
      totalCustomers: customerGroups.length,
      totalStampsToday,
      totalRewards,
      recentStamps,
    };
  },
};
