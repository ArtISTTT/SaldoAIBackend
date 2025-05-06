
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const getEmailTemplate = (title: string, message: string, buttonText: string, buttonUrl: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;
      color: #333;
      padding: 20px;
    }
    .header {
      background: #4CAF50;
      color: white;
      padding: 20px;
      text-align: center;
      border-radius: 8px 8px 0 0;
    }
    .content {
      background: white;
      padding: 30px;
      border: 1px solid #eee;
      border-radius: 0 0 8px 8px;
      line-height: 1.6;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background: #4CAF50;
      color: white;
      text-decoration: none;
      border-radius: 4px;
      margin: 20px 0;
    }
    .footer {
      text-align: center;
      margin-top: 20px;
      color: #666;
      font-size: 0.9em;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>${title}</h1>
    </div>
    <div class="content">
      <p>${message}</p>
      <div style="text-align: center;">
        <a href="${buttonUrl}" class="button">${buttonText}</a>
      </div>
      <p>If the button doesn't work, copy and paste this link into your browser:</p>
      <p style="word-break: break-all;">${buttonUrl}</p>
    </div>
    <div class="footer">
      <p>This is an automated message, please do not reply to this email.</p>
    </div>
  </div>
</body>
</html>
`;

export class EmailService {
  static async sendConfirmationEmail(email: string, token: string) {
    const confirmUrl = `${process.env.APP_URL}/confirm-email?token=${token}`;
    
    return transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Confirm Your Email Address',
      html: getEmailTemplate(
        'Email Confirmation',
        'Thank you for registering! Please confirm your email address to complete your registration.',
        'Confirm Email',
        confirmUrl
      ),
    });
  }

  static async sendPasswordResetEmail(email: string, token: string) {
    const resetUrl = `${process.env.APP_URL}/reset-password?token=${token}`;
    
    return transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Reset Your Password',
      html: getEmailTemplate(
        'Password Reset Request',
        'We received a request to reset your password. Click the button below to create a new password.',
        'Reset Password',
        resetUrl
      ),
    });
  }
}
