import { TransactionCategory } from './../constants/enums';

export const transactionCategoryToStrings: Record<any, string> = {
  [TransactionCategory.ADVERTISING_EXPENSES]: 'Расходы на рекламу',
  [TransactionCategory.INCOME_FROM_CLIENTS]: 'Доход от клиентов',
  [TransactionCategory.ONLINE_SALES]: 'Онлайн-продажи',
  [TransactionCategory.OFFICE]: 'Офисные расходы',
  [TransactionCategory.PAYROLL]: 'Зарплаты и выплаты',
  [TransactionCategory.SUBSCRIPTIONS]: 'Подписки и сервисы',
  [TransactionCategory.TAXES]: 'Налоги и взносы',
  [TransactionCategory.TRANSPORT]: 'Транспорт и логистика',
  [TransactionCategory.TRAVEL]: 'Командировки',
  [TransactionCategory.UTILITIES]: 'Коммунальные услуги',
  [TransactionCategory.OTHER]: 'Прочее',
};
