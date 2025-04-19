import { gql } from 'graphql-tag';

const analyticsTypeDefs = gql`
  # Сводная статистика
  type SummaryStats {
    totalIncome: Float!
    totalExpense: Float!
    balance: Float!
  }

  # Статистика по категориям с дополнительным процентным соотношением (если нужно)
  type CategoryStat {
    category: String!
    total: Float!
    percentage: Float!
  }

  # Статистика по месяцам
  type MonthStat {
    month: String!  # формат "YYYY-MM"
    income: Float!
    expense: Float!
  }

  # Статистика по дням
  type DailyStat {
    date: String!   # формат "YYYY-MM-DD"
    income: Float!
    expense: Float!
  }
  
  # Статистика по неделям
  type WeeklyStat {
    week: String!   # формат "YYYY-W##"
    income: Float!
    expense: Float!
  }

  # KPI для транзакций
  type KPIStats {
    averageTransaction: Float!
    minTransaction: Float!
    maxTransaction: Float!
    standardDeviation: Float!
  }

  # Налоговое уведомление
  type TaxReminder {
    message: String!
    dueDate: String!
    type: String!
  }

  # Инсайт/рекомендация
  type Insight {
    message: String!
    severity: String!
  }

  type CategoryStatWithAmount {
    category: TransactionCategory!
    total: Float!
    count: Int!
  }

  enum InsightSeverity {
    info
    warning
    critical
  }

  enum InsightPeriod {
    "Last 7 days"
    WEEK
    "Last 30 days"
    MONTH
    "Last 90 days"
    QUARTER
    "Custom range"
    CUSTOM
  }

  extend type Query {
    statsSummary: SummaryStats!
    statsByCategory: [CategoryStat!]!
    statsByMonth: [MonthStat!]!
    dailyStats: [DailyStat!]!
    weeklyStats: [WeeklyStat!]!
    kpiStats: KPIStats!
    taxReminders: [TaxReminder!]!
    insights: [Insight!]!
    categoriesStats(type: String!): [CategoryStatWithAmount!]!
  }
`;

export default analyticsTypeDefs;