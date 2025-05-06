import nodemailer from 'nodemailer';
import { getConfirmEmailTemplate } from './emailTemplates/confirmEmail';
import { getResetPasswordTemplate } from './emailTemplates/resetPassword';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export class EmailService {
  static async sendConfirmationEmail(email: string, token: string) {
    const confirmUrl = `${process.env.APP_URL}/confirm-email?token=${token}`;

    return transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Confirm Your Email Address',
      html: getConfirmEmailTemplate(confirmUrl),
    });
  }

  static async sendPasswordResetEmail(email: string, token: string) {
    const resetUrl = `${process.env.APP_URL}/reset-password?token=${token}`;

    return transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Reset Your Password',
      html: getResetPasswordTemplate(resetUrl),
    });
  }
}