
import { ChatModel } from '@/models/chat/chat.model';

export const chatQueries = {
  chats: async (_: unknown, __: unknown, context: { user?: { id: string } }) => {
    if (!context.user) throw new Error('Unauthorized');
    return ChatModel.find({ userId: context.user.id });
  },
    
  chat: async (_: unknown, { id }: { id: string }, context: { user?: { id: string } }) => {
    if (!context.user) throw new Error('Unauthorized');
    return ChatModel.findOne({ _id: id, userId: context.user.id });
  },
};
