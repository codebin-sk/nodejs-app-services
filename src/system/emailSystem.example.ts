import { EmailSystem, EmailOptions } from './emailSystem';

// Replace with your Google Workspace SMTP relay credentials
const smtpUser = 'your-google-workspace-email@yourdomain.com';
const smtpPass = 'your-app-password-or-oauth-token';

const emailSystem = new EmailSystem({ provider: 'google', user: smtpUser, pass: smtpPass });

const mailOptions: EmailOptions = {
  from: smtpUser,
  to: 'recipient@example.com',
  subject: 'Test Email from Google SMTP Relay',
  text: 'This is a test email sent using Google Workspace SMTP relay with TLS.'
};

async function sendTestEmail() {
  try {
    await emailSystem.sendEmail(mailOptions);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

sendTestEmail();
