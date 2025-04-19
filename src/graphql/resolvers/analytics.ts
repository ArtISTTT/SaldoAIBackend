// src/graphql/resolvers/analytics/index.ts
import { TransactionModel } from '@/models/transaction/transaction.model';
import { generateInsights } from '@/utils/generateInsights';

/** Вспомогательные функции для группировки данных */
const groupBy = <T>(data: T[], keyGetter: (item: T) => string) => {
  const map = new Map<string, T[]>();
  data.forEach((item) => {
    const key = keyGetter(item);
    const collection = map.get(key);
    if (!collection) {
      map.set(key, [item]);
    } else {
      collection.push(item);
    }
  });
  return map;
};

const getWeekString = (date: Date): string => {
  // Простой алгоритм для получения номера недели (ISO неделя)
  // (Замечание: для точного ISO-нумерования можно использовать библиотеку date-fns, moment или dayjs)
  const copy = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  // Устанавливаем понедельник как первый день недели
  const dayNum = copy.getUTCDay() || 7;
  copy.setUTCDate(copy.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(copy.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((copy.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${copy.getUTCFullYear()}-W${weekNo < 10 ? '0' + weekNo : weekNo}`;
};

const standardDeviation = (arr: number[]): number => {
  if (arr.length === 0) return 0;
  const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
  const sqDiff = arr.map(n => Math.pow(n - mean, 2));
  const avgSqDiff = sqDiff.reduce((a, b) => a + b, 0) / arr.length;
  return Math.sqrt(avgSqDiff);
};

import { ProfitabilityService } from '@/services/profitabilityService';
import { CashFlowService } from '@/services/cashFlowService';
import { BusinessHealthService } from '@/services/businessHealthService'; // Import the new service


const analyticsResolvers = {
  Query: {
    projectCashFlow: async (_: any, { monthsAhead }: { monthsAhead?: number }, context: any) => {
      if (!context.user) throw new Error('Unauthorized');
      return CashFlowService.projectCashFlow(context.user.id, monthsAhead);
    },
    simulateSalaryWithdrawal: async (_: any, { targetSalary }: { targetSalary: number }, context: any) => {
      if (!context.user) throw new Error('Unauthorized');
      return ProfitabilityService.simulateSalaryWithdrawal(context.user.id, targetSalary);
    },

    calculateNetProfit: async (_: any, __: any, context: any) => {
      if (!context.user) throw new Error('Unauthorized');
      return ProfitabilityService.calculateNetProfit(context.user.id);
    },

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
        // Подсчитываем процент от общего расхода
        const percentage = totalExpense > 0 && txs[0].type === 'expense' ? (total / totalExpense) * 100 : 0;
        categoryStats.push({ category, total, percentage });
      }
      return categoryStats;
    },

    statsByMonth: async (_: any, __: any, context: any) => {
      if (!context.user) throw new Error('Unauthorized');
      const transactions = await TransactionModel.find({ userId: context.user.id });
      const groups = groupBy(transactions, (tx: any) => {
        const date = new Date(tx.date);
        return date.toISOString().slice(0, 7); // YYYY-MM
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
        return date.toISOString().slice(0, 10); // YYYY-MM-DD
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
      const groups = groupBy(transactions, (tx: any) => {
        const date = new Date(tx.date);
        return getWeekString(date);
      });
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

    categoriesStats: async (_: any, { type }: { type: 'expense' | 'income' }, context: any) => {
      if (!context.user) throw new Error('Unauthorized');
      if (!type) throw new Error('Type is required');

      const transactions = await TransactionModel.find({
        userId: context.user.id,
        type,
      });

      const groups = groupBy(transactions, (tx: any) => tx.category);
      const categoryStats = [];

      for (const [category, txs] of groups.entries()) {
        const total = txs.reduce((sum: number, tx: any) => sum + Number(tx.amount), 0);
        const count = txs.length;
        categoryStats.push({ category, total, count });
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

    taxReminders: async (_: any, __: any, context: any) => {
      if (!context.user) throw new Error('Unauthorized');
      // Моки налоговых уведомлений (здесь можно добавить логику, привязанную к типу пользователя)
      return [
        {
          message: "Отчётность по УСН через 5 дней, проверьте данные!",
          dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          type: "usn",
        },
        {
          message: "Оплата налога для самозанятых через 3 дня.",
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          type: "self-employed",
        },
      ];
    },

    insights: async (_: any, __: any, context: any) => {
      if (!context.user) throw new Error('Unauthorized');
      return await generateInsights(context.user.id);
    },

    businessHealth: async (_: any, __: any, context: any) => {
      if (!context.user) throw new Error('Unauthorized');
      return BusinessHealthService.generateHealthDashboard(context.user.id);
    },
  },
};

export default analyticsResolvers;


// src/graphql/resolvers/analytics.ts
import analyticsResolvers from './analytics/index';
export default analyticsResolvers;