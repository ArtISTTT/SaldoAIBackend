import { TransactionCategory } from '@/constants';
import { Schema, model, Document, Types } from 'mongoose';

export interface ITransaction extends Document {
  userId: Types.ObjectId;
  accountId: Types.ObjectId;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description?: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
  signature: string;
}

import { encrypt, decrypt } from '@/utils/encryption';

const transactionSchema = new Schema<ITransaction>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    accountId: { type: Schema.Types.ObjectId, ref: 'Account', required: true },
    amount: { 
      type: String, 
      required: true,
      set: (value: number) => encrypt(value.toString()),
      get: (value: string) => Number(decrypt(value))
    },
    type: { type: String, enum: ['income', 'expense'], required: true },
    category: { type: String, enum: Object.values(TransactionCategory), required: true },
    description: { 
      type: String,
      set: (value: string) => value ? encrypt(value) : value,
      get: (value: string) => value ? decrypt(value) : value
    },
    date: { type: Date, required: true },
    signature: {
      type: String,
      required: true,
      index: true,
    },
  },
  { timestamps: true, toJSON: { getters: true }, toObject: { getters: true } },
);

export const TransactionModel = model<ITransaction>('Transaction', transactionSchema);