export const DEFAULT_SUBSCRIPTION_PLANS = [
  {
    name: 'Free',
    price: 0,
    period: 'monthly',
    features: [
      'До 100 транзакций в месяц',
      'Базовая аналитика',
    ],
  },
  {
    name: 'Pro',
    price: 1999,
    period: 'monthly',
    features: [
      'До 30 000 транзакций в месяц',
      'Расширенная аналитика',
      'AI-рекомендации',
    ],
  },
  {
    name: 'Business',
    price: 4499,
    period: 'monthly',
    features: [
      'Безлимит',
      'Приоритетная поддержка',
      'CSV-экспорт и отчёты',
    ],
  },
];