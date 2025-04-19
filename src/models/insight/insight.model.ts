import { Schema, model, Document, Types } from 'mongoose';

export enum InsightSeverity {
  INFO = 'info',
  WARNING = 'warning',
  CRITICAL = 'critical',
}

export enum InsightPeriod {
  WEEK = '7d',
  MONTH = '30d',
  QUARTER = '90d',
  CUSTOM = 'custom',
}

export interface IInsight extends Document {
  userId: Types.ObjectId;
  insights: {
    message: string;
    severity: InsightSeverity;
  }[];
  generatedAt: Date;
  period: InsightPeriod;
}

const insightSchema = new Schema<IInsight>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    period: {
      type: String,
      enum: Object.values(InsightPeriod),
      default: InsightPeriod.MONTH,
    },
    insights: [
      {
        message: { type: String, required: true },
        severity: {
          type: String,
          enum: Object.values(InsightSeverity),
          required: true,
        },
      },
    ],
    generatedAt: {
      type: Date,
      default: () => new Date(),
    },
  },
  { timestamps: true },
);

export const InsightModel = model<IInsight>('Insight', insightSchema);