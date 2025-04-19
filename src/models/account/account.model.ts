import { Schema, model, Document, Types } from 'mongoose';

export interface IAccount extends Document {
  userId: Types.ObjectId;
  name: string;
  type: 'bank' | 'cash' | 'card' | 'other';
  balance: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

const accountSchema = new Schema<IAccount>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    type: { type: String, enum: ['bank', 'cash', 'card', 'other'], default: 'other' },
    balance: { type: Number, default: 0 },
    currency: { type: String, default: 'RUB' },
  },
  { timestamps: true },
);

export const AccountModel = model<IAccount>('Account', accountSchema);