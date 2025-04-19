import { TransactionCategory } from '@/constants/enums';
import { getOpenAI } from './openai';

export const categorizeTransaction = async (description: string): Promise<TransactionCategory> => {
  const openai = getOpenAI();
  if (!description) return TransactionCategory.OTHER;

  const prompt = `
Ты — финансовый помощник. Классифицируй транзакцию по одной из следующих категорий (ответ — только машинное имя категории):

${Object.values(TransactionCategory).map(c => `- ${c}`).join('\n')}

Описание: "${description}"

Ответь только названием категории в формате EXACTLY как в списке выше.
`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'Ты классифицируешь бизнес-транзакции строго по Enum.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 20,
    });

    const result = response.choices[0]?.message?.content?.trim() as TransactionCategory;

    if (!Object.values(TransactionCategory).includes(result)) {
      console.warn('⚠️ Unexpected AI result:', result);
      return TransactionCategory.OTHER;
    }

    return result;
  } catch (error) {
    console.error('AI categorize error:', error);
    return TransactionCategory.OTHER;
  }
};