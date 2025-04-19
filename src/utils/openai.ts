import OpenAI from 'openai';

let openaiInstance: OpenAI | null = null;

export const getOpenAI = (): OpenAI => {
  if (!openaiInstance) {
    const key = process.env.OPENAI_API_KEY;
    if (!key) throw new Error('OPENAI_API_KEY is not set');
    openaiInstance = new OpenAI({ apiKey: key });
  }

  return openaiInstance;
};