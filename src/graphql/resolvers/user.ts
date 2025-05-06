import { UserModel } from '@/models/user/user.model';
import { AccountModel } from '@/models/account/account.model';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { EmailService } from '@/services/emailService';


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

      EmailService.sendConfirmationEmail(email, confirmToken);

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
      const user = await UserModel.findOne({ email });
      if (!user) {
        throw new Error('User not found');
      }

      const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, { expiresIn: '1h' });
      user.passwordResetToken = resetToken;
      user.passwordResetExpires = new Date(Date.now() + 3600000); // 1 hour
      await user.save();

      await EmailService.sendPasswordResetEmail(email, resetToken);
      return true;
    },

    resetPassword: async (_parent: any, { token, newPassword }: { token: string; newPassword: string }) => {
      const user = await UserModel.findOne({
        passwordResetToken: token,
        passwordResetExpires: { $gt: Date.now() }
      });

      if (!user) {
        throw new Error('Invalid or expired reset token');
      }

      const passwordHash = await bcrypt.hash(newPassword, 10);
      user.passwordHash = passwordHash;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();

      return true;
    },

    confirmEmail: async (_parent: any, { token }: { token: string }) => {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
        const user = await UserModel.findOne({ 
          _id: decoded.id,
          emailConfirmToken: token
        });

        if (!user) {
          throw new Error('Invalid confirmation token');
        }

        user.isEmailConfirmed = true;
        user.emailConfirmToken = undefined;
        await user.save();

        return true;
      } catch (error) {
        throw new Error('Invalid or expired confirmation token');
      }
    }
  },
};

export default userResolvers;