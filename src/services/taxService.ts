import { Types } from 'mongoose';
import { TransactionModel } from '@/models/transaction/transaction.model';
import { BusinessProfileModel } from '@/models/businessProfile/businessProfile.model';
import { TaxSystem } from '@/constants/enums';

export class TaxService {
  static async calculateTaxes(userId: Types.ObjectId) {
    const profile = await BusinessProfileModel.findOne({ userId });
    if (!profile) {
      throw new Error('Business profile not found');
    }

    const currentYear = new Date().getFullYear();
    const transactions = await TransactionModel.find({
      userId,
      date: {
        $gte: new Date(currentYear, 0, 1),
        $lte: new Date(currentYear, 11, 31)
      }
    });

    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const taxConfig = profile.taxConfig;
    const taxAmount = income * taxConfig.rate;

    return {
      taxAmount,
      nextPaymentDate: this.getNextQuarterEnd(),
      type: profile.businessType,
      taxSystem: profile.taxSystem,
      limits: taxConfig.limits,
      recommendations: this.getTaxRecommendations(income, taxConfig, profile)
    };
  }

  private static getNextQuarterEnd(): Date {
    const now = new Date();
    const quarter = Math.floor(now.getMonth() / 3);
    return new Date(now.getFullYear(), (quarter + 1) * 3, 0);
  }

  private static getTaxRecommendations(income: number, config: any, profile: any): string[] {
    const recommendations = [];

    if (income > config.limits.yearly * 0.8) {
      recommendations.push('⚠️ Приближение к годовому лимиту дохода');
    }

    if (profile.taxSystem === TaxSystem.NPD && income > 2400000) {
      recommendations.push('🚨 Превышен лимит для НПД. Рекомендуется перейти на УСН');
    }

    if (profile.taxSystem === TaxSystem.USN_INCOME && income > config.limits.yearly * 0.9) {
      recommendations.push('⚠️ Приближение к лимиту УСН. Рассмотрите переход на ОСН');
    }

    return recommendations;
  }
}