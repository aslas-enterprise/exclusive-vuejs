import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { CustomLoggerService } from '../logger/logger.service';

export interface EmailOptions {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}

export interface WelcomeEmailData {
  name: string;
  email: string;
}

export interface VerificationEmailData {
  name: string;
  email: string;
  code: string;
}

export interface PasswordResetEmailData {
  name: string;
  email: string;
  resetLink: string;
}

@Injectable()
export class EmailService {
  private transporter!: nodemailer.Transporter;

  constructor(private logger: CustomLoggerService) {
    this.createTransporter();
  }

  private createTransporter() {
    const emailProvider = process.env.EMAIL_PROVIDER || 'gmail';
    
    // Check if email credentials are provided in .env
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      // Use real email provider with .env credentials
      this.createProductionTransporter(emailProvider);
    } else {
      // Fallback to Ethereal Email for development/testing
      this.createEtherealTransporter();
    }
  }

  private async createEtherealTransporter() {
    try {
      // Create test account for development
      const testAccount = await nodemailer.createTestAccount();
      
      this.transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: process.env.EMAIL_SECURE === 'true' || false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });

      this.logger.log(`Development email transporter created with Ethereal Email using ${process.env.EMAIL_HOST || 'smtp.ethereal.email'}:${process.env.EMAIL_PORT || '587'} (secure: ${process.env.EMAIL_SECURE === 'true' || false})`, 'EmailService');
    } catch (error) {
      this.logger.error('Failed to create Ethereal email transporter', error instanceof Error ? error.stack : 'Unknown error', 'EmailService');
      throw error;
    }
  }

  private createProductionTransporter(provider: string) {
    const config: any = {
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    };

    // Provider-specific configurations
    switch (provider.toLowerCase()) {
      case 'gmail':
        config.service = 'gmail';
        config.host = process.env.EMAIL_HOST || 'smtp.gmail.com';
        config.port = parseInt(process.env.EMAIL_PORT || '587');
        config.secure = process.env.EMAIL_SECURE === 'true' || false;
        break;
      case 'outlook':
        config.service = 'hotmail';
        config.host = process.env.EMAIL_HOST || 'smtp-mail.outlook.com';
        config.port = parseInt(process.env.EMAIL_PORT || '587');
        config.secure = process.env.EMAIL_SECURE === 'true' || false;
        break;
      case 'yahoo':
        config.service = 'yahoo';
        config.host = process.env.EMAIL_HOST || 'smtp.mail.yahoo.com';
        config.port = parseInt(process.env.EMAIL_PORT || '587');
        config.secure = process.env.EMAIL_SECURE === 'true' || false;
        break;
      case 'sendgrid':
        config.host = process.env.EMAIL_HOST || 'smtp.sendgrid.net';
        config.port = parseInt(process.env.EMAIL_PORT || '587');
        config.secure = process.env.EMAIL_SECURE === 'true' || false;
        break;
      case 'mailgun':
        config.host = process.env.EMAIL_HOST || 'smtp.mailgun.org';
        config.port = parseInt(process.env.EMAIL_PORT || '587');
        config.secure = process.env.EMAIL_SECURE === 'true' || false;
        break;
      case 'ses':
        config.host = process.env.EMAIL_HOST || 'email-smtp.us-east-1.amazonaws.com';
        config.port = parseInt(process.env.EMAIL_PORT || '587');
        config.secure = process.env.EMAIL_SECURE === 'true' || false;
        break;
      case 'custom':
        config.host = process.env.EMAIL_HOST;
        config.port = parseInt(process.env.EMAIL_PORT || '587');
        config.secure = process.env.EMAIL_SECURE === 'true' || false;
        if (!config.host) {
          throw new Error('EMAIL_HOST is required for custom email provider');
        }
        break;
      default:
        config.host = process.env.EMAIL_HOST || 'smtp.gmail.com';
        config.port = parseInt(process.env.EMAIL_PORT || '587');
        config.secure = process.env.EMAIL_SECURE === 'true' || false;
    }

    // Additional security options
    if (config.secure === false && config.port === 587) {
      config.requireTLS = true;
    }

    this.transporter = nodemailer.createTransport(config);
    this.logger.log(`Production email transporter created for ${provider} using ${config.host}:${config.port} (secure: ${config.secure})`, 'EmailService');
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@exclusive.com',
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      };
console.log({mailOptions});

      const info = await this.transporter.sendMail(mailOptions);
      
      if (process.env.NODE_ENV === 'development') {
        this.logger.log(`Email sent to ${options.to}`, 'EmailService');
        this.logger.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`, 'EmailService');
      } else {
        this.logger.log(`Email sent to ${options.to} - Message ID: ${info.messageId}`, 'EmailService');
      }

      return true;
    } catch (error) {
      this.logger.error(`Failed to send email to ${options.to}`, error instanceof Error ? error.stack : 'Unknown error', 'EmailService');
      return false;
    }
  }

  async sendWelcomeEmail(userData: WelcomeEmailData): Promise<boolean> {
    const welcomeHtml = this.generateWelcomeEmailTemplate(userData);
    const welcomeText = this.generateWelcomeEmailText(userData);

    return this.sendEmail({
      to: userData.email,
      subject: 'Welcome to Exclusive! 🎉',
      html: welcomeHtml,
      text: welcomeText,
    });
  }

  async sendVerificationEmail(userData: VerificationEmailData): Promise<boolean> {
    const verificationHtml = this.generateVerificationEmailTemplate(userData);
    const verificationText = this.generateVerificationEmailText(userData);

    return this.sendEmail({
      to: userData.email,
      subject: 'Verify Your Email Address 📧',
      html: verificationHtml,
      text: verificationText,
    });
  }

  async sendPasswordResetEmail(userData: PasswordResetEmailData): Promise<boolean> {
    const resetHtml = this.generatePasswordResetEmailTemplate(userData);
    const resetText = this.generatePasswordResetEmailText(userData);

    return this.sendEmail({
      to: userData.email,
      subject: 'Reset Your Password 🔒',
      html: resetHtml,
      text: resetText,
    });
  }

  private generateWelcomeEmailTemplate(userData: WelcomeEmailData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Exclusive</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Welcome to Exclusive!</h1>
          <p>Your journey starts here</p>
        </div>
        <div class="content">
          <h2>Hello ${userData.name}! 👋</h2>
          <p>We're thrilled to have you join the Exclusive community. Your account has been successfully created and you're now ready to explore all the amazing features we have to offer.</p>
          
          <h3>What's next?</h3>
          <ul>
            <li>Complete your profile setup</li>
            <li>Explore our exclusive features</li>
            <li>Connect with other members</li>
            <li>Discover personalized content</li>
          </ul>
          
          <p>If you have any questions or need assistance, our support team is here to help!</p>
          
          <p>Best regards,<br>The Exclusive Team</p>
        </div>
        <div class="footer">
          <p>This email was sent to ${userData.email}</p>
          <p>© ${new Date().getFullYear()} Exclusive. All rights reserved.</p>
        </div>
      </body>
      </html>
    `;
  }

  private generateWelcomeEmailText(userData: WelcomeEmailData): string {
    return `
Welcome to Exclusive!

Hello ${userData.name}!

We're thrilled to have you join the Exclusive community. Your account has been successfully created and you're now ready to explore all the amazing features we have to offer.

What's next?
- Complete your profile setup
- Explore our exclusive features
- Connect with other members
- Discover personalized content

If you have any questions or need assistance, our support team is here to help!

Best regards,
The Exclusive Team

This email was sent to ${userData.email}
© ${new Date().getFullYear()} Exclusive. All rights reserved.
    `;
  }

  private generateVerificationEmailTemplate(userData: VerificationEmailData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .code { background: #fff; padding: 20px; border: 2px dashed #667eea; border-radius: 10px; text-align: center; margin: 20px 0; }
          .code-number { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Verify Your Email</h1>
          <p>Please confirm your email address</p>
        </div>
        <div class="content">
          <h2>Hello ${userData.name}! 👋</h2>
          <p>Thanks for joining Exclusive! To complete your registration, please verify your email address using the code below:</p>
          
          <div class="code">
            <p>Your verification code is:</p>
            <div class="code-number">${userData.code}</div>
            <p><small>This code will expire in 15 minutes</small></p>
          </div>
          
          <p>If you didn't create an account with us, please ignore this email.</p>
          
          <p>Best regards,<br>The Exclusive Team</p>
        </div>
        <div class="footer">
          <p>This email was sent to ${userData.email}</p>
          <p>© ${new Date().getFullYear()} Exclusive. All rights reserved.</p>
        </div>
      </body>
      </html>
    `;
  }

  private generateVerificationEmailText(userData: VerificationEmailData): string {
    return `
Verify Your Email

Hello ${userData.name}!

Thanks for joining Exclusive! To complete your registration, please verify your email address using the code below:

Your verification code is: ${userData.code}

This code will expire in 15 minutes.

If you didn't create an account with us, please ignore this email.

Best regards,
The Exclusive Team

This email was sent to ${userData.email}
© ${new Date().getFullYear()} Exclusive. All rights reserved.
    `;
  }

  private generatePasswordResetEmailTemplate(userData: PasswordResetEmailData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 15px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Reset Your Password</h1>
          <p>Secure password reset request</p>
        </div>
        <div class="content">
          <h2>Hello ${userData.name}! 👋</h2>
          <p>We received a request to reset your password for your Exclusive account. Click the button below to create a new password:</p>
          
          <div style="text-align: center;">
            <a href="${userData.resetLink}" class="button">Reset Password</a>
          </div>
          
          <p><strong>Important:</strong> This link will expire in 1 hour for security reasons.</p>
          
          <p>If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</p>
          
          <p>For security reasons, never share this email with anyone.</p>
          
          <p>Best regards,<br>The Exclusive Team</p>
        </div>
        <div class="footer">
          <p>This email was sent to ${userData.email}</p>
          <p>© ${new Date().getFullYear()} Exclusive. All rights reserved.</p>
        </div>
      </body>
      </html>
    `;
  }

  private generatePasswordResetEmailText(userData: PasswordResetEmailData): string {
    return `
Reset Your Password

Hello ${userData.name}!

We received a request to reset your password for your Exclusive account. 

Click the link below to create a new password:
${userData.resetLink}

Important: This link will expire in 1 hour for security reasons.

If you didn't request a password reset, please ignore this email. Your password will remain unchanged.

For security reasons, never share this email with anyone.

Best regards,
The Exclusive Team

This email was sent to ${userData.email}
© ${new Date().getFullYear()} Exclusive. All rights reserved.
    `;
  }

  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      this.logger.log('Email service connection verified successfully', 'EmailService');
      return true;
    } catch (error) {
      this.logger.error('Email service connection failed', error instanceof Error ? error.stack : 'Unknown error', 'EmailService');
      return false;
    }
  }
}
