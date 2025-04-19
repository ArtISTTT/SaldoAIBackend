import { Schema, model, Document } from 'mongoose';

export interface ISubscriptionPlan extends Document {
  name: string;
  price: number;
  period: 'monthly' | 'yearly';
  features: string[];
  createdAt: Date;
  updatedAt: Date;
}

const subscriptionPlanSchema = new Schema<ISubscriptionPlan>(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    period: { type: String, enum: ['monthly', 'yearly'], required: true },
    features: [{ type: String }],
  },
  { timestamps: true },
);

export const SubscriptionPlanModel = model<ISubscriptionPlan>('SubscriptionPlan', subscriptionPlanSchema);