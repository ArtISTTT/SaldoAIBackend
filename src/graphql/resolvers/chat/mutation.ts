
import { ChatModel } from '@/models/chat/chat.model';
import { TransactionModel } from '@/models/transaction/transaction.model';
import { getOpenAI } from '@/utils/openai';

export const chatMutations = {
  startChat: async (_: unknown, { input }: { input: { contextPeriod: number } }, context: { user?: { id: string } }) => {
    if (!context.user) throw new Error('Unauthorized');

    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - input.contextPeriod);
    
    const transactions = await TransactionModel.find({
      userId: context.user.id,
      date: { $gte: dateFrom }
    });

    const systemMessage = `You are a qualified financial assistant. You have access to the user's financial transactions for the past ${input.contextPeriod} days. Here are the transactions:\n\n${JSON.stringify(transactions, null, 2)}\n\nProvide professional and accurate financial advice based on this data.`;

    return new ChatModel({
      userId: context.user.id,
      contextPeriod: input.contextPeriod,
      messages: [{
        role: 'system',
        content: systemMessage,
        timestamp: new Date()
      }]
    }).save();
  },

  sendMessage: async (_: unknown, { input }: { input: { chatId: string; content: string } }, context: { user?: { id: string } }) => {
    if (!context.user) throw new Error('Unauthorized');

    const chat = await ChatModel.findOne({ _id: input.chatId, userId: context.user.id });
    if (!chat) throw new Error('Chat not found');

    const openai = getOpenAI();
    
    chat.messages.push({
      role: 'user',
      content: input.content,
      timestamp: new Date()
    });

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: chat.messages.map(m => ({
        role: m.role as 'system' | 'user' | 'assistant',
        content: m.content
      }))
    });

    chat.messages.push({
      role: 'assistant',
      content: completion.choices[0]?.message?.content || 'Sorry, I could not process your request',
      timestamp: new Date()
    });

    return chat.save();
  },
};
