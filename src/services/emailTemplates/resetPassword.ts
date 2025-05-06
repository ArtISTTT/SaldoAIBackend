
import { baseTemplate } from './baseTemplate';

export const getResetPasswordTemplate = (resetUrl: string) => {
  return baseTemplate(
    'Password Reset Request',
    'We received a request to reset your password. Click the button below to create a new password.',
    'Reset Password',
    resetUrl
  );
};
