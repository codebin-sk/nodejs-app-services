import nodemailer from 'nodemailer';
import AWS from 'aws-sdk';

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
  private ses: AWS.SES | null = null;
  private provider: EmailProvider;

  constructor(config: {
    provider: EmailProvider;
    user?: string;
    pass?: string;
    sesConfig?: AWS.SES.ClientConfiguration;
  }) {
    this.provider = config.provider;

    if (this.provider === 'google') {
      this.transporter = nodemailer.createTransport({
        host: 'smtp-relay.gmail.com',
        port: 587,
        secure: false, // STARTTLS
        auth: config.user && config.pass ? { user: config.user, pass: config.pass } : undefined,
        tls: { rejectUnauthorized: true }
      });
    } else if (this.provider === 'ses') {
      this.ses = new AWS.SES(config.sesConfig);
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
      if (!this.ses) throw new Error('SES client not configured');
      const params: AWS.SES.SendEmailRequest = {
        Source: options.from,
        Destination: { ToAddresses: Array.isArray(options.to) ? options.to : [options.to] },
        Message: {
          Subject: { Data: options.subject },
          Body: {
            Text: options.text ? { Data: options.text } : undefined,
            Html: options.html ? { Data: options.html } : undefined
          }
        }
      };
      await this.ses.sendEmail(params).promise();
      return;
    }

    throw new Error('No valid email provider configured');
  }
}
