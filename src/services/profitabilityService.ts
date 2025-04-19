
import { TransactionModel } from '@/models/transaction/transaction.model';
import { Types } from 'mongoose';

export class ProfitabilityService {
  static async simulateSalaryWithdrawal(userId: Types.ObjectId, targetSalary: number) {
    const transactions = await TransactionModel.find({
      userId,
      date: { $gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) },
    });

    const dailyIncome = this.calculateDailyAverage(transactions, 'income');
    const dailyExpense = this.calculateDailyAverage(transactions, 'expense');
    const monthlyIncome = dailyIncome * 30;
    const monthlyExpense = dailyExpense * 30;
    const monthlyBalance = monthlyIncome - monthlyExpense;

    const isSustainable = monthlyBalance >= targetSalary;
    const maxSustainableSalary = Math.max(0, monthlyBalance);

    return {
      isSustainable,
      maxSustainableSalary,
      monthlyIncome,
      monthlyExpense,
      message: this.getSalaryMessage(isSustainable, targetSalary, maxSustainableSalary)
    };
  }

  static async calculateNetProfit(userId: Types.ObjectId) {
    const currentMonth = new Date();
    currentMonth.setDate(1);

    const transactions = await TransactionModel.find({
      userId,
      date: { $gte: currentMonth }
    });

    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const subscriptions = transactions
      .filter(t => t.category === 'SUBSCRIPTION')
      .reduce((sum, t) => sum + t.amount, 0);

    const taxes = await this.estimateMonthlyTaxes(userId);

    const netProfit = income - expenses - subscriptions - taxes;

    return {
      income,
      expenses,
      subscriptions,
      taxes,
      netProfit,
      message: this.getProfitMessage(netProfit)
    };
  }

  private static calculateDailyAverage(transactions: any[], type: string): number {
    const filtered = transactions.filter(t => t.type === type);
    const total = filtered.reduce((sum, t) => sum + t.amount, 0);
    return total / 90; // 90 days average
  }

  private static async estimateMonthlyTaxes(userId: Types.ObjectId): Promise<number> {
    const currentYear = new Date().getFullYear();
    const transactions = await TransactionModel.find({
      userId,
      type: 'income',
      date: { $gte: new Date(currentYear, 0, 1) }
    });

    const yearlyIncome = transactions.reduce((sum, t) => sum + t.amount, 0);
    const estimatedYearlyTax = yearlyIncome * 0.06; // Simplified 6% tax rate
    return estimatedYearlyTax / 12; // Monthly estimate
  }

  private static getSalaryMessage(isSustainable: boolean, target: number, max: number): string {
    if (isSustainable) {
      return `✅ You can sustainably withdraw ₽${target.toLocaleString('ru-RU')} monthly`;
    }
    return `⚠️ Maximum sustainable monthly withdrawal: ₽${max.toLocaleString('ru-RU')}`;
  }

  private static getProfitMessage(netProfit: number): string {
    if (netProfit > 0) {
      return `✅ Net profit: ₽${netProfit.toLocaleString('ru-RU')}`;
    }
    return `⚠️ Net loss: ₽${Math.abs(netProfit).toLocaleString('ru-RU')}`;
  }
}
