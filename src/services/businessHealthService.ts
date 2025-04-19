
import { Types } from 'mongoose';
import { BusinessMetricsService } from './businessMetrics';
import { CashFlowService } from './cashFlowService';
import { FinancialMetricsService } from './financialMetrics';
import { ProfitabilityService } from './profitabilityService';
import { TaxService, TaxationType } from './taxService';

export class BusinessHealthService {
  static async generateHealthDashboard(userId: Types.ObjectId) {
    const [
      categoryGrowth,
      roi,
      paymentIntervals,
      cashFlow,
      recurringExpenses,
      profitability,
      taxes
    ] = await Promise.all([
      BusinessMetricsService.analyzeCategoryGrowth(userId),
      BusinessMetricsService.calculateROI(userId),
      BusinessMetricsService.analyzePaymentIntervals(userId),
      CashFlowService.projectCashFlow(userId, 3),
      FinancialMetricsService.findRecurringExpenses(userId),
      ProfitabilityService.calculateNetProfit(userId),
      TaxService.calculateTaxes(userId, TaxationType.SELF_EMPLOYED)
    ]);

    const healthScore = this.calculateHealthScore({
      roi: roi.roi,
      hasCashGap: cashFlow.hasCashGap,
      profitMargin: (profitability.netProfit / profitability.income) * 100,
      paymentTrend: paymentIntervals.trend === 'stable' ? 1 : 0
    });

    const alerts = this.generateAlerts({
      categoryGrowth,
      cashFlow,
      profitability,
      taxes
    });

    return {
      overview: {
        healthScore,
        status: this.getHealthStatus(healthScore),
        summary: this.generateSummary(healthScore, alerts)
      },
      metrics: {
        profitMargin: ((profitability.netProfit / profitability.income) * 100).toFixed(1),
        cashFlowStatus: cashFlow.summary,
        roiStatus: roi.message,
        recurringExpensesTotal: recurringExpenses.reduce((sum, exp) => sum + exp.yearAheadCost, 0)
      },
      projections: {
        cashFlow: cashFlow.monthlyProjections,
        nextTaxDue: taxes.nextPaymentDate,
        estimatedTaxAmount: taxes.taxAmount
      },
      alerts: alerts,
      recommendations: this.generateRecommendations({
        healthScore,
        cashFlow,
        profitability,
        recurringExpenses
      })
    };
  }

  private static calculateHealthScore(metrics: {
    roi: number;
    hasCashGap: boolean;
    profitMargin: number;
    paymentTrend: number;
  }): number {
    const weights = {
      roi: 0.3,
      cashFlow: 0.3,
      profitMargin: 0.3,
      paymentTrend: 0.1
    };

    const scores = {
      roi: Math.min(metrics.roi * 50, 100),
      cashFlow: metrics.hasCashGap ? 30 : 100,
      profitMargin: Math.min(metrics.profitMargin * 2, 100),
      paymentTrend: metrics.paymentTrend * 100
    };

    return Object.entries(weights).reduce(
      (score, [key, weight]) => score + scores[key as keyof typeof scores] * weight,
      0
    );
  }

  private static getHealthStatus(score: number): string {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'fair';
    return 'needs_attention';
  }

  private static generateSummary(score: number, alerts: any[]): string {
    const status = this.getHealthStatus(score);
    const alertCount = alerts.length;

    if (status === 'excellent') {
      return `🌟 Business is thriving with a health score of ${score.toFixed(1)}`;
    }
    if (status === 'good') {
      return `✅ Business is healthy with ${alertCount} areas for optimization`;
    }
    if (status === 'fair') {
      return `⚠️ Business needs attention in ${alertCount} areas`;
    }
    return `🚨 Immediate action required - ${alertCount} critical issues identified`;
  }

  private static generateAlerts(data: any): any[] {
    const alerts = [];

    // Add category growth alerts
    if (data.categoryGrowth) {
      alerts.push(...data.categoryGrowth.map((alert: any) => ({
        message: alert.message,
        severity: 'warning'
      })));
    }

    // Add cash flow alerts
    if (data.cashFlow.hasCashGap) {
      alerts.push({
        message: `🚨 Potential cash gap detected in ${data.cashFlow.cashGapMonth}`,
        severity: 'critical'
      });
    }

    // Add profitability alerts
    if (data.profitability.netProfit < 0) {
      alerts.push({
        message: '🚨 Business is operating at a loss',
        severity: 'critical'
      });
    }s'
      });
    }

    // Add tax alerts
    if (new Date(data.taxes.nextPaymentDate).getTime() - Date.now() < 15 * 24 * 60 * 60 * 1000) {
      alerts.push({
        type: 'warning',
        message: `⚠️ Tax payment of ${data.taxes.taxAmount.toFixed(2)} due soon`
      });
    }

    return alerts;
  }

  private static generateRecommendations(data: any): string[] {
    const recommendations = [];

    if (data.healthScore < 60) {
      recommendations.push('📊 Consider professional financial consultation');
    }

    if (data.cashFlow.hasCashGap) {
      recommendations.push('💰 Build emergency fund to cover projected cash gaps');
    }

    if (data.recurringExpenses.length > 0) {
      recommendations.push('🔍 Review recurring expenses for potential cost optimization');
    }

    if (data.profitability.netProfit > 0 && data.profitability.netProfit < data.profitability.income * 0.1) {
      recommendations.push('📈 Focus on improving profit margins through cost reduction or price optimization');
    }

    return recommendations;
  }
}
