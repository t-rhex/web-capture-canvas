import nodemailer from 'nodemailer';
import axios from 'axios';
import { NotificationSettings, NotificationEvent } from './types';

export class NotificationService {
  private emailTransporter: nodemailer.Transporter;

  constructor() {
    // Initialize email transporter
    this.emailTransporter = nodemailer.createTransport({
      // Configure your email service here
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendNotification(settings: NotificationSettings, event: NotificationEvent): Promise<void> {
    try {
      // Send webhook notification if configured
      if (settings.webhook) {
        await this.sendWebhook(settings.webhook.url, event, settings.webhook.headers);
      }

      // Send email notification if configured
      if (settings.email) {
        await this.sendEmail(settings.email, event);
      }
    } catch (error) {
      console.error('Failed to send notification:', error);
      throw error;
    }
  }

  private async sendWebhook(
    url: string,
    event: NotificationEvent,
    headers?: Record<string, string>
  ): Promise<void> {
    try {
      await axios.post(url, event, { headers });
    } catch (error) {
      console.error(`Failed to send webhook to ${url}:`, error);
      throw error;
    }
  }

  private async sendEmail(
    emailSettings: NotificationSettings['email'],
    event: NotificationEvent
  ): Promise<void> {
    if (!emailSettings?.to.length) return;

    const subject = emailSettings.subject || `Screenshot Capture ${event.type}`;
    const template = this.getEmailTemplate(event, emailSettings.template);

    try {
      await this.emailTransporter.sendMail({
        from: process.env.SMTP_FROM,
        to: emailSettings.to.join(', '),
        subject,
        html: template,
      });
    } catch (error) {
      console.error('Failed to send email:', error);
      throw error;
    }
  }

  private getEmailTemplate(event: NotificationEvent, template?: string): string {
    // If custom template is provided, use it (implement template engine if needed)
    if (template) {
      return template
        .replace('{{type}}', event.type)
        .replace('{{url}}', event.url)
        .replace('{{timestamp}}', event.timestamp.toISOString());
    }

    // Default template
    return `
      <h2>Screenshot Capture ${event.type}</h2>
      <p><strong>Task ID:</strong> ${event.taskId}</p>
      <p><strong>URL:</strong> ${event.url}</p>
      <p><strong>Timestamp:</strong> ${event.timestamp.toISOString()}</p>
      ${event.error ? `<p><strong>Error:</strong> ${event.error}</p>` : ''}
      ${event.data ? `<pre>${JSON.stringify(event.data, null, 2)}</pre>` : ''}
    `;
  }
}
