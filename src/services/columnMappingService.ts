import { getOpenAI } from '@/utils/openai';

export interface ColumnMapping {
  amountCredit?: string | null;
  amountDebit?: string | null;
  date: string;
  description: string;
  category?: string | null;
  type?: string | null;
}

export async function identifyColumns(columns: string[]): Promise<ColumnMapping> {
  const openai = getOpenAI();

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content: `Ты — аналитическая система, которая помогает определить соответствие столбцов в файлах транзакций. 
Внимание: сумма может быть в одной колонке (с положительными и отрицательными значениями), либо в двух — например "Кредит" и "Дебет", "Приход" и "Расход".
Нужно определить:
- колонку amountCredit (если есть) — где отражаются положительные суммы (приход, кредит),
- колонку amountDebit (если есть) — где отражаются отрицательные суммы (расход, дебет),
Если есть только одна колонка с суммой (с положительными и отрицательными числами), то amountCredit и amountDebit должны быть равны названию этой одной колонки.
Остальные поля определить как раньше.`
        },
        {
          role: "user",
          content: `В файле транзакций есть следующие столбцы: ${columns.join(', ')}. 
            Определи, какие столбцы соответствуют следующим полям:

            1. amountCredit — сумма поступлений, кредит, приход
            2. amountDebit — сумма списаний, дебет, расход

            Некоторые названия могут быть сложными — например, "Сумма по дебету", "Сумма по кредиту", "Сумма списания", "Сумма зачисления" и т.п.

            Верни ответ строго в формате JSON:
            {
              "amountCredit": "название столбца или null",
              "amountDebit": "название столбца или null",
              "date": "название столбца",
              "description": "название столбца",
              "category": "название столбца или null",
              "type": "название столбца или null"
          }`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("Не удалось получить ответ от OpenAI");
    }

    return JSON.parse(content) as ColumnMapping;
  } catch (error) {
    console.error("Ошибка при идентификации столбцов:", error);
    throw new Error("Не удалось определить соответствие столбцов");
  }
}

export default { identifyColumns };