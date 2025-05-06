
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com', // replace with your SMTP host
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
      subject: 'Confirm your email',
      html: `Please confirm your email by clicking this link: <a href="${confirmUrl}">${confirmUrl}</a>`,
    });
  }

  static async sendPasswordResetEmail(email: string, token: string) {
    const resetUrl = `${process.env.APP_URL}/reset-password?token=${token}`;
    
    return transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Reset your password',
      html: `Click this link to reset your password: <a href="${resetUrl}">${resetUrl}</a>`,
    });
  }
}
