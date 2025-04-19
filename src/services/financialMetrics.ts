
import { TransactionModel } from '@/models/transaction/transaction.model';
import { Types } from 'mongoose';

export class FinancialMetricsService {
  static async projectCashFlow(userId: Types.ObjectId, daysAhead: number = 30) {
    const transactions = await TransactionModel.find({
      userId,
      date: { $gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) },
    });

    // Calculate daily averages
    const dailyIncome = this.calculateDailyAverage(transactions, 'income');
    const dailyExpense = this.calculateDailyAverage(transactions, 'expense');
    const currentBalance = this.getCurrentBalance(transactions);
    
    // Project future balance
    const projectedBalances = Array.from({ length: daysAhead }, (_, i) => ({
      day: i + 1,
      balance: currentBalance + (dailyIncome - dailyExpense) * (i + 1),
    }));

    // Find potential cash gap
    const cashGap = projectedBalances.find(p => p.balance < 0);

    return {
      dailyIncome,
      dailyExpense,
      currentBalance,
      projectedBalances,
      hasCashGap: !!cashGap,
      cashGapDay: cashGap?.day,
    };
  }

  static async findRecurringExpenses(userId: Types.ObjectId) {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const transactions = await TransactionModel.find({
      userId,
      type: 'expense',
      date: { $gte: threeMonthsAgo },
    });

    const subscriptions = this.identifyRecurringTransactions(transactions);
    return subscriptions.map(sub => ({
      ...sub,
      yearAheadCost: sub.averageAmount * 12,
    }));
  }

  private static calculateDailyAverage(transactions: any[], type: 'income' | 'expense'): number {
    const filtered = transactions.filter(t => t.type === type);
    const total = filtered.reduce((sum, t) => sum + t.amount, 0);
    const days = 90; // Using 90 days of history
    return total / days;
  }

  private static getCurrentBalance(transactions: any[]): number {
    return transactions.reduce((balance, t) => 
      balance + (t.type === 'income' ? t.amount : -t.amount), 0);
  }

  private static identifyRecurringTransactions(transactions: any[]) {
    // Group by similar descriptions and dates
    const grouped = new Map<string, any[]>();
    
    transactions.forEach(tx => {
      const key = tx.description.toLowerCase().replace(/\s+/g, '');
      const existing = grouped.get(key) || [];
      grouped.set(key, [...existing, tx]);
    });

    // Filter for recurring patterns (at least 2 occurrences)
    const recurring = Array.from(grouped.entries())
      .filter(([_, txs]) => txs.length >= 2)
      .map(([key, txs]) => ({
        description: txs[0].description,
        frequency: 'monthly',
        occurrences: txs.length,
        averageAmount: txs.reduce((sum, t) => sum + t.amount, 0) / txs.length,
        lastDate: new Date(Math.max(...txs.map(t => t.date.getTime()))),
      }));

    return recurring;
  }
}
