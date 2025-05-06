
import { baseTemplate } from './baseTemplate';

export const getConfirmEmailTemplate = (confirmUrl: string) => {
  return baseTemplate(
    'Email Confirmation',
    'Thank you for registering! Please confirm your email address to complete your registration.',
    'Confirm Email',
    confirmUrl
  );
};
