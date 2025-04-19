export enum TransactionCategory {
  INCOME_FROM_CLIENTS = 'INCOME_FROM_CLIENTS',
  ONLINE_SALES = 'ONLINE_SALES',
  ADVERTISING_EXPENSES = 'ADVERTISING_EXPENSES',
  SUBSCRIPTIONS = 'SUBSCRIPTIONS',
  TRANSPORT = 'TRANSPORT',
  PAYROLL = 'PAYROLL',
  TRAVEL = 'TRAVEL',
  OFFICE = 'OFFICE',
  UTILITIES = 'UTILITIES',
  TAXES = 'TAXES',
  OTHER = 'OTHER',
}

export enum BusinessType {
  SELF_EMPLOYED = 'SELF_EMPLOYED',
  INDIVIDUAL_ENTREPRENEUR = 'INDIVIDUAL_ENTREPRENEUR',
  LLC = 'LLC'
}

export enum TaxSystem {
  NPD = 'NPD',
  USN_INCOME = 'USN_INCOME',
  USN_INCOME_EXPENSE = 'USN_INCOME_EXPENSE',
  OSN = 'OSN'
}

export const TAX_LIMITS = {
  [TaxSystem.NPD]: {
    yearly: 2400000,
    monthly: 200000,
    rate: 0.04
  },
  [TaxSystem.USN_INCOME]: {
    yearly: 60000000,
    monthly: 5000000,
    rate: 0.06
  },
  [TaxSystem.USN_INCOME_EXPENSE]: {
    yearly: 60000000,
    monthly: 5000000,
    rate: 0.15
  },
  [TaxSystem.OSN]: {
    yearly: Infinity,
    monthly: Infinity,
    rate: 0.20
  }
};