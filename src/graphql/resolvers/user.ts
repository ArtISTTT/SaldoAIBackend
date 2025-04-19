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
      await user.save();

      // Создание дефолтного аккаунта для нового пользователя
      await AccountModel.create({
        userId: user._id,
        name: 'Default Account',
        type: 'other',
        balance: 0,
        currency: 'RUB',
      });

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
  },
};

export default userResolvers;