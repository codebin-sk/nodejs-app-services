
import nodemailer from 'nodemailer';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import {
  SMTP_USERNAME,
  SMTP_PASSWORD,
  SMTP_HOST,
  SMTP_PORT,
  SMTP_SECURE
} from '../config/email';

export type EmailProvider = 'google' | 'ses';

export interface EmailOptions {
  from: string;
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export class EmailSystem {
  private transporter: nodemailer.Transporter | null = null;
  private sesClient: SESClient | null = null;
  private provider: EmailProvider;

  constructor(config: {
    provider: EmailProvider;
    user?: string;
    pass?: string;
    sesConfig?: any;
  }) {
    this.provider = config.provider;

    if (this.provider === 'google') {
      this.transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT,
        secure: SMTP_SECURE,
        auth: {
          user: SMTP_USERNAME,
          pass: SMTP_PASSWORD
        }
      });
    } else if (this.provider === 'ses') {
      this.sesClient = new SESClient(config.sesConfig ?? {});
    }
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    if (this.provider === 'google') {
      if (!this.transporter) throw new Error('Google SMTP transporter not configured');
      await this.transporter.sendMail({
        from: options.from,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html
      });
      return;
    }

    if (this.provider === 'ses') {
      if (!this.sesClient) throw new Error('SES client not configured');
      const params: any = {
        Source: options.from,
        Destination: { ToAddresses: Array.isArray(options.to) ? options.to : [options.to] },
        Message: {
          Subject: { Data: options.subject },
          Body: {}
        }
      };
      if (options.text) {
        params.Message.Body = { ...params.Message.Body, Text: { Data: options.text } };
      }
      if (options.html) {
        params.Message.Body = { ...params.Message.Body, Html: { Data: options.html } };
      }
      const command = new SendEmailCommand(params);
      await this.sesClient.send(command);
      return;
    }

    throw new Error('No valid email provider configured');
  }
}

// Standalone mailer for direct usage
export const mailTransport = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_SECURE,
  auth: {
    user: SMTP_USERNAME,
    pass: SMTP_PASSWORD
  }
});

export async function sendMail({ to, subject, text, html }: { to: string; subject: string; text?: string; html?: string }) {
  return mailTransport.sendMail({
    from: SMTP_USERNAME,
    to,
    subject,
    text,
    html
  });
}

