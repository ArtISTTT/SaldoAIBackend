import { SubscriptionPlanModel } from '@/models/subscriptionPlan/subscriptionPlan.model';

const subscriptionPlanResolvers = {
  Query: {
    subscriptionPlans: async () => {
      return SubscriptionPlanModel.find();
    },
  },
};

export default subscriptionPlanResolvers;