
import { TransactionModel } from '@/models/transaction/transaction.model';
import { groupBy, getWeekString } from './utils';

export const periodStatsResolvers = {
  statsByMonth: async (_: any, __: any, context: any) => {
    if (!context.user) throw new Error('Unauthorized');
    const transactions = await TransactionModel.find({ userId: context.user.id });
    const groups = groupBy(transactions, (tx: any) => {
      const date = new Date(tx.date);
      return date.toISOString().slice(0, 7);
    });
    const monthStats = [];
    for (const [month, txs] of groups) {
      const income = txs
        .filter((tx: any) => tx.type === 'income')
        .reduce((sum: number, tx: any) => sum + Number(tx.amount), 0);
      const expense = txs
        .filter((tx: any) => tx.type === 'expense')
        .reduce((sum: number, tx: any) => sum + Number(tx.amount), 0);
      monthStats.push({ month, income, expense });
    }
    return monthStats;
  },

  dailyStats: async (_: any, __: any, context: any) => {
    if (!context.user) throw new Error('Unauthorized');
    const transactions = await TransactionModel.find({ userId: context.user.id });
    const groups = groupBy(transactions, (tx: any) => {
      const date = new Date(tx.date);
      return date.toISOString().slice(0, 10);
    });
    const dailyStats = [];
    for (const [date, txs] of groups) {
      const income = txs
        .filter((tx: any) => tx.type === 'income')
        .reduce((sum: number, tx: any) => sum + Number(tx.amount), 0);
      const expense = txs
        .filter((tx: any) => tx.type === 'expense')
        .reduce((sum: number, tx: any) => sum + Number(tx.amount), 0);
      dailyStats.push({ date, income, expense });
    }
    return dailyStats;
  },

  weeklyStats: async (_: any, __: any, context: any) => {
    if (!context.user) throw new Error('Unauthorized');
    const transactions = await TransactionModel.find({ userId: context.user.id });
    const groups = groupBy(transactions, (tx: any) => getWeekString(new Date(tx.date)));
    const weeklyStats = [];
    for (const [week, txs] of groups) {
      const income = txs
        .filter((tx: any) => tx.type === 'income')
        .reduce((sum: number, tx: any) => sum + Number(tx.amount), 0);
      const expense = txs
        .filter((tx: any) => tx.type === 'expense')
        .reduce((sum: number, tx: any) => sum + Number(tx.amount), 0);
      weeklyStats.push({ week, income, expense });
    }
    return weeklyStats;
  },
};
