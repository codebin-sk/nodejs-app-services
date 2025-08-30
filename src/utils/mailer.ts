import nodemailer from 'nodemailer';
import {
  SMTP_USERNAME,
  SMTP_PASSWORD,
  SMTP_HOST,
  SMTP_PORT,
  SMTP_SECURE
} from '../config/email';

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
