import { TransactionModel } from '@/models/transaction/transaction.model';
import { categorizeTransaction } from '@/utils/categorize';
import crypto from 'crypto';

import { TransactionLimitService } from '@/services/transactionLimitService';

const transactionResolvers = {
  Query: {
    transactionUsage: async (_: unknown, __: unknown, context: { user?: { id: string } }) => {
      if (!context.user) throw new Error('Unauthorized');
      return TransactionLimitService.getTransactionUsage(context.user.id);
    },
    transactions: async (
      _: unknown,
      args: {
        search?: string;
        category?: string;
        dateFrom?: string;
        dateTo?: string;
        sortBy?: { field: 'date' | 'amount'; order: 'ASC' | 'DESC' };
      },
      context: { user?: { id: string } }
    ) => {
      if (!context.user) throw new Error('Unauthorized');

      const { search, category, dateFrom, dateTo, sortBy } = args;

      const query: any = {
        userId: context.user.id,
      };

      if (search) {
        query.description = { $regex: search, $options: 'i' };
      }

      if (category && category !== 'any') {
        query.category = category;
      }

      if (dateFrom || dateTo) {
        query.date = {};
        if (dateFrom) query.date.$gte = new Date(dateFrom);
        if (dateTo) query.date.$lte = new Date(dateTo);
      }

      const sort: any = {};
      if (sortBy && sortBy.field && sortBy.order) {
        const direction = sortBy.order === 'ASC' ? 1 : -1;
        sort[sortBy.field] = direction;
      } else {
        sort.date = -1;
      }

      const limit = args.limit || 20;
      const skip = ((args.page || 1) - 1) * limit;
      
      const [transactions, totalCount] = await Promise.all([
        TransactionModel.find(query).sort(sort).skip(skip).limit(limit),
        TransactionModel.countDocuments(query)
      ]);

      return {
        transactions,
        totalCount,
        hasNextPage: skip + transactions.length < totalCount
      };
    },
  },

  Mutation: {
    addTransaction: async (_: any, { input }: any, context: any) => {
      if (!context.user) throw new Error('Unauthorized');
      
      const canAdd = await TransactionLimitService.checkAndIncrementTransactionCount(context.user.id);
      if (!canAdd) {
        throw new Error('Transaction limit exceeded for your subscription plan');
      }

      const signatureSource = `${context.user.id}_${Math.abs(input.amount)}_${input.description.trim().toLowerCase()}`;
      const signature = crypto.createHash('md5').update(signatureSource).digest('hex');

      const category = input.description ? await categorizeTransaction(input.description) : '';
      return new TransactionModel({
        ...input,
        category,
        signature,
        userId: context.user.id,
      }).save();
    },
    
    updateTransaction: async (_: any, { id, input }: any, context: any) => {
      if (!context.user) throw new Error('Unauthorized');
      const tx = await TransactionModel.findOneAndUpdate(
        { _id: id, userId: context.user.id },
        input,
        { new: true }
      );
      return tx;
    },

    deleteTransaction: async (_: any, { id }: any, context: any) => {
      if (!context.user) throw new Error('Unauthorized');
      const tx = await TransactionModel.findOneAndDelete({ _id: id, userId: context.user.id });
      return Boolean(tx);
    },
  },
};

export default transactionResolvers;