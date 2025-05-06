import { UserModel } from '@/models/user/user.model';
import { AccountModel } from '@/models/account/account.model';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sendEmail } from '@/utils/sendEmail'; // Assumed function for sending emails


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

      // Create default account
      const account = await AccountModel.create({
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
    forgotPassword: async (_parent: any, { email }: { email: string }) => {
      const user = await UserModel.findOne({ email });
      if (!user) {
        throw new Error('User not found');
      }
      // Generate reset token and send email (Implementation needed)
      const resetToken = await user.generatePasswordResetToken();
      await user.save();
      await sendEmail(email, `Reset password: ${resetToken}`);
      return 'Password reset email sent';
    },
    resetPassword: async (_parent: any, { token, password }: { token: string; password: string }) => {
      const user = await UserModel.findOne({ passwordResetToken: token, passwordResetExpires: { $gt: Date.now() } });
      if (!user) {
        throw new Error('Invalid or expired token');
      }
      user.passwordHash = await bcrypt.hash(password, 10);
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();
      return 'Password reset successfully';
    },
    confirmEmail: async (_parent: any, { token }: { token: string }) => {
      //Implementation needed to verify email confirmation token
      const user = await UserModel.findOne({ emailConfirmationToken: token, emailConfirmationExpires: { $gt: Date.now() } });
      if (!user) {
        throw new Error('Invalid or expired token');
      }
      user.emailConfirmed = true;
      user.emailConfirmationToken = undefined;
      user.emailConfirmationExpires = undefined;
      await user.save();
      return 'Email confirmed successfully';
    }
  },
};

export default userResolvers;