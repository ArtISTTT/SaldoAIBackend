import { UserModel } from '@/models/user/user.model';
import { AccountModel } from '@/models/account/account.model';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';


const userResolvers = {
  Query: {
    me: async (_parent: any, _args: any, context: any) => {
      if (!context.user) return null;

      const account = await AccountModel.findOne({ userId: context.user.id });

      const user = await UserModel.findById(context.user.id);

      return {
        user,
        account
      }
    },

    getUser: async (_parent: any, { id }: { id: string }) => {
      return UserModel.findById(id);
    },
  },

  Mutation: {
    register: async (
      _parent: any,
      { email, name, password }: { email: string; name: string; password: string },
    ) => {
      const existing = await UserModel.findOne({ email });
      if (existing) {
        throw new Error('User already exists');
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const user = new UserModel({ email, name, passwordHash, role: 'user' });

      const confirmToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, { expiresIn: '24h' });
      user.emailConfirmToken = confirmToken;
      await user.save();

      // Create default account
      const account = await AccountModel.create({
        userId: user._id,
        name: 'Default Account',
        type: 'other',
        balance: 0,
        currency: 'RUB',
      });

      await account.save();

      return user;
    },

    login: async (
      _parent: any,
      { email, password }: { email: string; password: string },
    ) => {
      const user = await UserModel.findOne({ email });
      if (!user) {
        throw new Error('User not found');
      }

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        throw new Error('Incorrect password');
      }

      const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET!, {
        expiresIn: '7d',
      });

      return token;
    },
    forgotPassword: async (_parent: any, { email }: { email: string }) => {
      return 'Password reset email sent';
    },
    resetPassword: async (_parent: any, { token, password }: { token: string; password: string }) => {
      return 'Password reset successfully';
    },
    confirmEmail: async (_parent: any, { token }: { token: string }) => {
      return 'Email confirmed successfully';
    }
  },
};

export default userResolvers;