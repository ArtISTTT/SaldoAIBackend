import { SubscriptionPlanModel } from '../models/subscriptionPlan/subscriptionPlan.model';
import { DEFAULT_SUBSCRIPTION_PLANS } from '../constants/subscriptionPlans';

export const ensureSubscriptionPlans = async () => {
  for (const plan of DEFAULT_SUBSCRIPTION_PLANS) {
    const existing = await SubscriptionPlanModel.findOne({ name: plan.name });

    if (!existing) {
      await SubscriptionPlanModel.create(plan);
      console.log(`🆕 Created plan: ${plan.name}`);
    } else {
      let needsUpdate = false;

      if (
        existing.price !== plan.price ||
        existing.period !== plan.period ||
        JSON.stringify(existing.features) !== JSON.stringify(plan.features)
      ) {
        needsUpdate = true;
      }

      if (needsUpdate) {
        existing.price = plan.price;
        existing.period = plan.period as any;
        existing.features = plan.features;
        await existing.save();
        console.log(`🔄 Updated plan: ${plan.name}`);
      }
    }
  }
};