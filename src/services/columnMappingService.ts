
import { getOpenAI } from '@/utils/openai';

interface ColumnMapping {
  amount: string;
  date: string;
  description: string;
  category?: string;
  type?: string;
}

export async function identifyColumns(columns: string[]): Promise<ColumnMapping> {
  const openai = getOpenAI();

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content: "Ты - аналитическая система, которая помогает определить соответствие столбцов в файлах транзакций. Нужно идентифицировать, какие столбцы содержат какую информацию."
        },
        {
          role: "user",
          content: `В файле транзакций есть следующие столбцы: ${columns.join(', ')}. 
          Определи, какой столбец соответствует: 
          1. Сумме транзакции (amount)
          2. Дате транзакции (date)
          3. Описанию транзакции (description)
          4. Категории транзакции (category), если есть
          5. Типу транзакции (type), если есть
          
          Верни ответ в формате JSON: {
            "amount": "название столбца",
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
