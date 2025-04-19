import { AccountModel } from '@/models/account/account.model';

const accountResolvers = {
  Query: {
    accounts: async (_: any, __: any, context: any) => {
      if (!context.user) throw new Error('Unauthorized');
      return AccountModel.find({ userId: context.user.id });
    },
  },

  Mutation: {
    createAccount: async (
      _: any,
      { name, type, currency }: { name: string; type: string; currency: string },
      context: any,
    ) => {
      if (!context.user) throw new Error('Unauthorized');

      const account = new AccountModel({
        userId: context.user.id,
        name,
        type,
        currency,
      });

      return account.save();
    },
  },
};

export default accountResolvers;