
import { TransactionModel } from '@/models/transaction/transaction.model';
import { Types } from 'mongoose';

export class BusinessMetricsService {
  static async analyzeCategoryGrowth(userId: Types.ObjectId) {
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

    const transactions = await TransactionModel.find({
      userId,
      date: { $gte: twoMonthsAgo }
    });

    const lastMonthByCategory = this.groupByCategory(
      transactions.filter(t => t.date >= lastMonth)
    );
    
    const previousMonthByCategory = this.groupByCategory(
      transactions.filter(t => t.date < lastMonth && t.date >= twoMonthsAgo)
    );

    const alerts = [];
    for (const [category, amount] of lastMonthByCategory) {
      const prevAmount = previousMonthByCategory.get(category) || 0;
      const growth = prevAmount ? (amount - prevAmount) / prevAmount : 1;
      
      if (growth >= 0.8) { // 80% growth
        alerts.push({
          category,
          growth: growth * 100,
          message: `⚠️ ${category} expenses grew by ${Math.round(growth * 100)}%`
        });
      }
    }

    // Check category share
    const totalExpense = Array.from(lastMonthByCategory.values())
      .reduce((sum, amount) => sum + amount, 0);

    for (const [category, amount] of lastMonthByCategory) {
      const share = amount / totalExpense;
      if (share > 0.45) { // 45% threshold
        alerts.push({
          category,
          share: share * 100,
          message: `📊 ${category} takes ${Math.round(share * 100)}% of expenses`
        });
      }
    }

    return alerts;
  }

  static async calculateROI(userId: Types.ObjectId) {
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const transactions = await TransactionModel.find({
      userId,
      date: { $gte: lastMonth }
    });

    const advertising = transactions
      .filter(t => t.category === 'ADVERTISING_EXPENSES')
      .reduce((sum, t) => sum + t.amount, 0);

    const revenue = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const roi = advertising ? revenue / advertising : 0;

    return {
      roi,
      isEfficient: roi > 2,
      isProfitable: roi > 1,
      message: this.getRoiMessage(roi)
    };
  }

  static async analyzePaymentIntervals(userId: Types.ObjectId) {
    const transactions = await TransactionModel.find({
      userId,
      type: 'income',
    }).sort({ date: 1 });

    if (transactions.length < 2) {
      return { average: 0, trend: 'insufficient_data' };
    }

    const intervals = [];
    for (let i = 1; i < transactions.length; i++) {
      const days = Math.floor(
        (transactions[i].date.getTime() - transactions[i-1].date.getTime()) 
        / (1000 * 60 * 60 * 24)
      );
      intervals.push(days);
    }

    const average = intervals.reduce((sum, i) => sum + i, 0) / intervals.length;
    const recentAvg = intervals.slice(-3).reduce((sum, i) => sum + i, 0) / 3;

    return {
      average,
      trend: recentAvg > average * 1.2 ? 'increasing' : 'stable',
      message: this.getIntervalMessage(average, recentAvg)
    };
  }

  private static groupByCategory(transactions: any[]): Map<string, number> {
    const map = new Map<string, number>();
    for (const tx of transactions) {
      const current = map.get(tx.category) || 0;
      map.set(tx.category, current + tx.amount);
    }
    return map;
  }

  private static getRoiMessage(roi: number): string {
    if (roi > 2) return "🔥 Marketing is highly efficient";
    if (roi > 1) return "✅ Marketing is profitable";
    return "⚠️ Marketing ROI needs improvement";
  }

  private static getIntervalMessage(avg: number, recent: number): string {
    if (recent > avg * 1.2) {
      return "⚠️ Payment intervals are increasing - possible decrease in orders";
    }
    return `✅ Average payment interval: ${Math.round(avg)} days`;
  }
}
