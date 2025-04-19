import { TransactionModel } from '@/models/transaction/transaction.model';
import { InsightModel } from '@/models/insight/insight.model';
import { getOpenAI } from './openai';

export type Insight = {
  message: string;
  severity: 'info' | 'warning' | 'critical';
};

const CACHE_TTL_HOURS = 24;

export const generateInsights = async (userId: string): Promise<Insight[]> => {
  const openai = getOpenAI();
  const now = new Date();
  const threshold = new Date(now.getTime() - CACHE_TTL_HOURS * 60 * 60 * 1000);

  // 1. Попытка найти свежие инсайты
  const existing = await InsightModel.findOne({
    userId,
    period: '30d',
    generatedAt: { $gte: threshold },
  });

  if (existing) {
    return existing.insights;
  }

  // 2. Получаем транзакции за последние 30 дней
  const date30DaysAgo = new Date();
  date30DaysAgo.setDate(date30DaysAgo.getDate() - 30);

  const transactions = await TransactionModel.find({
    userId,
    date: { $gte: date30DaysAgo },
  });

  const compacted = transactions.map((tx) => ({
    date: tx.date.toISOString().split('T')[0],
    amount: tx.amount,
    type: tx.type,
    category: tx.category,
  }));

  // 3. Подготовка prompt для AI
  const prompt = `
Ты — финансовый ассистент для малого бизнеса. На основе данных о транзакциях за последние 30 дней сгенерируй от 1 до 3 полезных инсайтов.
Каждый инсайт должен быть полезным, лаконичным и начинаться с эмодзи (например: "📉", "⚠️", "💡").
Ответь в формате JSON-массива:

[
  { "message": "<инсайт>", "severity": "info" | "warning" | "critical" }
]

Данные транзакций:
${JSON.stringify(compacted)}
`;

  try {
    const res = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'Ты финансовый аналитик.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.5,
      max_tokens: 600,
    });

    const jsonRaw = res.choices[0]?.message?.content;
    const clean = (jsonRaw || '')
      .replace(/^```json/, '')
      .replace(/^```/, '')
      .replace(/```$/, '')
      .trim();

    const parsed = JSON.parse(clean || '[]');

    const validInsights = Array.isArray(parsed)
      ? parsed.filter(
          (i) =>
            typeof i.message === 'string' &&
            ['info', 'warning', 'critical'].includes(i.severity)
        )
      : [];

    // 4. Сохраняем инсайты
    await InsightModel.findOneAndUpdate(
      { userId, period: '30d' },
      { insights: validInsights, generatedAt: new Date() },
      { upsert: true }
    );

    return validInsights;
  } catch (error) {
    console.error('AI insight generation error:', error);
    return [];
  }
};