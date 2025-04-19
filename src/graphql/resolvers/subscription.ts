import { SubscriptionModel } from '@/models/subscription/subscription.model';

const subscriptionResolvers = {
  Query: {
    mySubscription: async (_: any, __: any, context: any) => {
      if (!context.user) throw new Error('Unauthorized');
      return SubscriptionModel.findOne({ userId: context.user.id, active: true });
    },
  },

  Mutation: {
    subscribe: async (_: any, { planId }: any, context: any) => {
      if (!context.user) throw new Error('Unauthorized');

      const now = new Date();
      const end = new Date();
      end.setMonth(end.getMonth() + 1); // Мок: 1 месяц

      const sub = new SubscriptionModel({
        userId: context.user.id,
        planId,
        startDate: now,
        endDate: end,
        active: true,
      });

      return sub.save();
    },

    cancelSubscription: async (_: any, __: any, context: any) => {
      if (!context.user) throw new Error('Unauthorized');

      const sub = await SubscriptionModel.findOne({ userId: context.user.id, active: true });
      if (!sub) return false;

      sub.active = false;
      await sub.save();
      return true;
    },
  },
};

export default subscriptionResolvers;