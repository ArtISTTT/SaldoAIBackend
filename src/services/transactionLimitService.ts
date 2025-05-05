
import { SubscriptionModel } from '../models/subscription/subscription.model';
import { SubscriptionPlanModel } from '../models/subscriptionPlan/subscriptionPlan.model';
import { Types } from 'mongoose';

export class TransactionLimitService {
  private static getMonthlyLimit(planName: string): number {
    switch (planName.toLowerCase()) {
      case 'free':
        return 500;
      case 'pro':
        return 30000;
      case 'business':
        return Infinity;
      default:
        return 0;
    }
  }

  static async checkAndIncrementTransactionCount(userId: Types.ObjectId, count: number = 1): Promise<boolean> {
    const subscription = await SubscriptionModel.findOne({ 
      userId,
      active: true,
    }).populate('planId');

    if (!subscription) {
      throw new Error('No active subscription found');
    }

    const plan = subscription.planId as any;
    const limit = this.getMonthlyLimit(plan.name);
    
    if ((subscription.transactionCount + count) >= limit) {
      return false;
    }

    await SubscriptionModel.updateOne(
      { _id: subscription._id },
      { $inc: { transactionCount: count } }
    );

    return true;
  }

  static async getTransactionUsage(userId: Types.ObjectId) {
    const subscription = await SubscriptionModel.findOne({ 
      userId,
      active: true,
      endDate: { $gt: new Date() }
    }).populate('planId');

    if (!subscription) {
      throw new Error('No active subscription found');
    }

    const plan = subscription.planId as any;
    const limit = this.getMonthlyLimit(plan.name);
    
    return {
      used: subscription.transactionCount,
      limit,
      remaining: limit === Infinity ? Infinity : limit - subscription.transactionCount
    };
  }
}
