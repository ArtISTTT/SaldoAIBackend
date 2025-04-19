
import { TransactionModel } from '@/models/transaction/transaction.model';
import { Types } from 'mongoose';

export enum TaxationType {
  SELF_EMPLOYED = 'self_employed',
  SOLE_PROPRIETOR = 'sole_proprietor'
}

export class TaxService {
  static async calculateTaxes(userId: Types.ObjectId, taxationType: TaxationType) {
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

    if (taxationType === TaxationType.SELF_EMPLOYED) {
      return {
        taxAmount: income * 0.06, // 6% for B2B
        nextPaymentDate: this.getNextQuarterEnd(),
        type: 'self_employed',
        recommendation: this.getTaxRecommendation()
      };
    }

    // Sole Proprietor (УСН)
    const insurancePayment = 45842; // Fixed for 2024
    const taxRate = 0.06; // 6% revenue
    
    return {
      taxAmount: income * taxRate,
      insurancePayment,
      totalDue: income * taxRate + insurancePayment,
      nextPaymentDate: this.getNextQuarterEnd(),
      type: 'sole_proprietor',
      recommendation: this.getTaxRecommendation()
    };
  }

  private static getNextQuarterEnd(): Date {
    const now = new Date();
    const quarter = Math.floor(now.getMonth() / 3);
    return new Date(now.getFullYear(), (quarter + 1) * 3, 0);
  }

  private static getTaxRecommendation(): string {
    const now = new Date();
    const month = now.getMonth();
    
    if (month === 6) { // July
      return "⚠️ File your tax return by July 25";
    }
    return `Next tax report due: ${this.getNextQuarterEnd().toLocaleDateString('ru-RU')}`;
  }
}
