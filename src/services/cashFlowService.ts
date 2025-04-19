
import { TransactionModel } from '@/models/transaction/transaction.model';
import { Types } from 'mongoose';

export class CashFlowService {
  static async projectCashFlow(userId: Types.ObjectId, monthsAhead: number = 3) {
    const transactions = await TransactionModel.find({
      userId,
      date: { $gte: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000) }, // 6 months history
    });

    const monthlyProjections = [];
    const currentBalance = this.getCurrentBalance(transactions);
    let runningBalance = currentBalance;

    const monthlyIncome = this.calculateMonthlyAverage(transactions, 'income');
    const monthlyExpense = this.calculateMonthlyAverage(transactions, 'expense');
    const seasonalFactors = this.calculateSeasonalFactors(transactions);

    for (let i = 0; i < monthsAhead; i++) {
      const month = new Date();
      month.setMonth(month.getMonth() + i);
      const monthKey = month.getMonth();
      
      const projectedIncome = monthlyIncome * (seasonalFactors[monthKey]?.income || 1);
      const projectedExpense = monthlyExpense * (seasonalFactors[monthKey]?.expense || 1);
      runningBalance += (projectedIncome - projectedExpense);

      monthlyProjections.push({
        month: month.toISOString().slice(0, 7),
        projectedIncome,
        projectedExpense,
        projectedBalance: runningBalance,
        seasonalityImpact: seasonalFactors[monthKey]?.impact || 'neutral'
      });
    }

    const cashGap = monthlyProjections.find(p => p.projectedBalance < 0);
    const lowestBalance = Math.min(...monthlyProjections.map(p => p.projectedBalance));

    return {
      currentBalance,
      monthlyProjections,
      hasCashGap: !!cashGap,
      cashGapMonth: cashGap?.month,
      lowestProjectedBalance: lowestBalance,
      summary: this.generateSummary(monthlyProjections, currentBalance)
    };
  }

  private static getCurrentBalance(transactions: any[]): number {
    return transactions.reduce((balance, t) => 
      balance + (t.type === 'income' ? t.amount : -t.amount), 0);
  }

  private static calculateMonthlyAverage(transactions: any[], type: string): number {
    const filtered = transactions.filter(t => t.type === type);
    const total = filtered.reduce((sum, t) => sum + t.amount, 0);
    return total / 6; // 6 months average
  }

  private static calculateSeasonalFactors(transactions: any[]): Record<number, any> {
    const monthlyTotals: Record<number, { income: number; expense: number; count: number }> = {};
    
    transactions.forEach(tx => {
      const month = new Date(tx.date).getMonth();
      if (!monthlyTotals[month]) {
        monthlyTotals[month] = { income: 0, expense: 0, count: 0 };
      }
      
      if (tx.type === 'income') {
        monthlyTotals[month].income += tx.amount;
      } else {
        monthlyTotals[month].expense += tx.amount;
      }
      monthlyTotals[month].count++;
    });

    const factors: Record<number, any> = {};
    Object.entries(monthlyTotals).forEach(([month, data]) => {
      const avgIncome = data.income / data.count;
      const avgExpense = data.expense / data.count;
      
      factors[Number(month)] = {
        income: avgIncome > 0 ? avgIncome / this.calculateMonthlyAverage(transactions, 'income') : 1,
        expense: avgExpense > 0 ? avgExpense / this.calculateMonthlyAverage(transactions, 'expense') : 1,
        impact: this.determineSeasonalImpact(avgIncome, avgExpense)
      };
    });

    return factors;
  }

  private static determineSeasonalImpact(avgIncome: number, avgExpense: number): string {
    const ratio = avgIncome / avgExpense;
    if (ratio > 1.2) return 'positive';
    if (ratio < 0.8) return 'negative';
    return 'neutral';
  }

  private static generateSummary(projections: any[], currentBalance: number): string {
    const endBalance = projections[projections.length - 1].projectedBalance;
    const trend = endBalance > currentBalance ? 'positive' : 'negative';
    const changePercent = Math.abs(((endBalance - currentBalance) / currentBalance) * 100).toFixed(1);

    if (trend === 'positive') {
      return `📈 Projected ${changePercent}% balance growth over next ${projections.length} months`;
    }
    return `📉 Projected ${changePercent}% balance decrease over next ${projections.length} months`;
  }
}
