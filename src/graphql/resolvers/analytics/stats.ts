
import { TransactionModel } from '@/models/transaction/transaction.model';
import { groupBy, standardDeviation } from './utils';

export const statsResolvers = {
  statsSummary: async (_: any, __: any, context: any) => {
    if (!context.user) throw new Error('Unauthorized');
    const transactions = await TransactionModel.find({ userId: context.user.id });

    const totalIncome = transactions
      .filter((tx: any) => tx.type === 'income')
      .reduce((sum: number, tx: any) => sum + Number(tx.amount), 0);
    const totalExpense = transactions
      .filter((tx: any) => tx.type === 'expense')
      .reduce((sum: number, tx: any) => sum + Number(tx.amount), 0);
    return { totalIncome, totalExpense, balance: totalIncome - totalExpense };
  },

  statsByCategory: async (_: any, __: any, context: any) => {
    if (!context.user) throw new Error('Unauthorized');
    const transactions = await TransactionModel.find({ userId: context.user.id });
    const groups = groupBy(transactions, (tx: any) => tx.category);
    const totalExpense = transactions
      .filter((tx: any) => tx.type === 'expense')
      .reduce((sum: number, tx: any) => sum + Number(tx.amount), 0);
    const categoryStats = [];
    for (const [category, txs] of groups) {
      const total = txs.reduce((sum: number, tx: any) => sum + Number(tx.amount), 0);
      const percentage = totalExpense > 0 && txs[0].type === 'expense' ? (total / totalExpense) * 100 : 0;
      categoryStats.push({ category, total, percentage });
    }
    return categoryStats;
  },

  kpiStats: async (_: any, __: any, context: any) => {
    if (!context.user) throw new Error('Unauthorized');
    const transactions = await TransactionModel.find({ userId: context.user.id });
    if (transactions.length === 0) {
      return {
        averageTransaction: 0,
        minTransaction: 0,
        maxTransaction: 0,
        standardDeviation: 0,
      };
    }
    const amounts = transactions.map((tx: any) => Number(tx.amount));
    const total = amounts.reduce((sum: number, n: number) => sum + n, 0);
    const averageTransaction = total / amounts.length;
    const minTransaction = Math.min(...amounts);
    const maxTransaction = Math.max(...amounts);
    const stdDev = standardDeviation(amounts);
    return {
      averageTransaction,
      minTransaction,
      maxTransaction,
      standardDeviation: stdDev,
    };
  },
};
