
import { ProfitabilityService } from '@/services/profitabilityService';
import { CashFlowService } from '@/services/cashFlowService';
import { BusinessHealthService } from '@/services/businessHealthService';
import { generateInsights } from '@/utils/generateInsights';

export const businessAnalyticsResolvers = {
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

  businessHealth: async (_: any, __: any, context: any) => {
    if (!context.user) throw new Error('Unauthorized');
    return BusinessHealthService.generateHealthDashboard(context.user.id);
  },

  insights: async (_: any, __: any, context: any) => {
    if (!context.user) throw new Error('Unauthorized');
    return await generateInsights(context.user.id);
  },
};
