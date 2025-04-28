
import { Types } from 'mongoose';
import { BusinessMetricsService } from './businessMetrics';
import { CashFlowService } from './cashFlowService';
import { FinancialMetricsService } from './financialMetrics';
import { ProfitabilityService } from './profitabilityService';
import { TaxService } from './taxService';
import { BusinessProfileModel } from '@/models/businessProfile/businessProfile.model';
import { BusinessType } from '@/constants';

export class BusinessHealthService {
  static async generateHealthDashboard(userId: Types.ObjectId) {
    const businessProfile = await BusinessProfileModel.findOne({ userId });
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
      TaxService.calculateTaxes(userId)
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
    if (score >= 80) return 'Отлично';
    if (score >= 60) return 'Хорошо';
    if (score >= 40) return 'Плохо';
    return 'Критично';
  }

  private static generateSummary(score: number, alerts: any[]): string {
    const status = this.getHealthStatus(score);
    const alertCount = alerts.length;

    if (status === 'Отлично') {
      return `🌟 Бизнес процветает, индекс здоровья составляет ${score.toFixed(1)}`;
    }
    if (status === 'Хорошо') {
      return `✅ У бизнеса хорошее состояние, но есть ${alertCount} область(-ей) для оптимизации`;
    }
    if (status === 'Плохо') {
      return `⚠️ Бизнес требует внимания в ${alertCount} областях`;
    }
    return `🚨 Необходимы срочные меры — выявлено ${alertCount} критических проблем`;
  }

  private static generateAlerts(data: any): any[] {
    const alerts = [];

    // Add category growth alerts
    if (data.categoryGrowth) {
      alerts.push(...data.categoryGrowth.map((alert: any) => ({
        message: `🚨 Обнаружен возможный кассовый разрыв в ${data.cashFlow.cashGapMonth}`,
        severity: 'critical'
      })));
    }

    // Add cash flow alerts
    if (data.cashFlow.hasCashGap) {
      alerts.push({
        message: '🚨 Бизнес работает в убыток',
        severity: 'critical'
      });
    }

    // Add profitability alerts
    if (data.profitability.netProfit < 0) {
      alerts.push({
        message: '🚨 Business is operating at a loss',
        severity: 'critical'
      });
    }

    // Add tax alerts
    if (new Date(data.taxes.nextPaymentDate).getTime() - Date.now() < 15 * 24 * 60 * 60 * 1000) {
      alerts.push({
        severity: 'warning',
        message: `⚠️ Скоро срок уплаты налога — ${data.taxes.taxAmount.toFixed(2)} руб.`
      });
    }

    // Add tax system specific alerts
    if (data.taxes.recommendations) {
      data.taxes.recommendations.forEach((rec: string) => {
        alerts.push({
          severity: rec.includes('🚨') ? 'critical' : 'warning',
          message: rec
        });
      });
    }

    return alerts;
  }

  private static generateRecommendations(data: any): string[] {
    const recommendations = [];

    if (data.healthScore < 60) {
      recommendations.push('📊 Рекомендуется обратиться за профессиональной финансовой консультацией');
    }

    if (data.cashFlow.hasCashGap) {
      recommendations.push('💰 Создайте резервный фонд для покрытия прогнозируемых кассовых разрывов');
    }

    if (data.recurringExpenses.length > 0) {
      recommendations.push('🔍 Пересмотрите регулярные расходы на предмет возможной оптимизации');
    }

    if (data.profitability.netProfit > 0 && data.profitability.netProfit < data.profitability.income * 0.1) {
      recommendations.push('📈 Сфокусируйтесь на повышении рентабельности за счёт снижения затрат или оптимизации цен');
    }

    return recommendations;
  }
}
