
import { TransactionModel } from '@/models/transaction/transaction.model';
import { BusinessProfileModel, BusinessType, TaxSystem } from '@/models/businessProfile/businessProfile.model';
import { Types } from 'mongoose';

interface TaxConfig {
  rate: number;
  limits: {
    yearly: number;
    monthly: number;
  };
}

const DEFAULT_TAX_CONFIGS: Record<TaxSystem, TaxConfig> = {
  [TaxSystem.NPD]: {
    rate: 0.04, // 4% для физлиц
    limits: {
      yearly: 2400000, // 2.4M руб
      monthly: 200000 // 200K руб
    }
  },
  [TaxSystem.USN_INCOME]: {
    rate: 0.06, // 6%
    limits: {
      yearly: 60000000, // 60M руб
      monthly: 5000000 // ~5M руб
    }
  },
  [TaxSystem.USN_INCOME_EXPENSE]: {
    rate: 0.15, // 15%
    limits: {
      yearly: 60000000,
      monthly: 5000000
    }
  },
  [TaxSystem.OSN]: {
    rate: 0.20, // 20%
    limits: {
      yearly: Infinity,
      monthly: Infinity
    }
  }
};

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

    const config = profile.customTaxRate ? {
      rate: profile.customTaxRate,
      limits: profile.customTaxLimits || DEFAULT_TAX_CONFIGS[profile.taxSystem].limits
    } : DEFAULT_TAX_CONFIGS[profile.taxSystem];

    const taxAmount = income * config.rate;
    
    return {
      taxAmount,
      nextPaymentDate: this.getNextQuarterEnd(),
      type: profile.businessType,
      taxSystem: profile.taxSystem,
      limits: config.limits,
      recommendations: this.getTaxRecommendations(income, config, profile)
    };
  }

  private static getNextQuarterEnd(): Date {
    const now = new Date();
    const quarter = Math.floor(now.getMonth() / 3);
    return new Date(now.getFullYear(), (quarter + 1) * 3, 0);
  }

  private static getTaxRecommendations(income: number, config: TaxConfig, profile: any): string[] {
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
