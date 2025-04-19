import { NotificationModel } from '@/models/notification/notification.model';

const notificationResolvers = {
  Query: {
    notifications: async (_: any, __: any, context: any) => {
      if (!context.user) throw new Error('Unauthorized');
      return NotificationModel.find({ userId: context.user.id }).sort({ createdAt: -1 });
    },
  },

  Mutation: {
    markNotificationRead: async (_: any, { id }: any, context: any) => {
      if (!context.user) throw new Error('Unauthorized');
      const notif = await NotificationModel.findOneAndUpdate(
        { _id: id, userId: context.user.id },
        { read: true },
      );
      return Boolean(notif);
    },
  },
};

export default notificationResolvers;