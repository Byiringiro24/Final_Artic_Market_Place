import nodemailer from 'nodemailer';
import { prisma } from '../db/prisma';
import { logger } from './logger';

// ─── Build transporter from DB settings (with .env fallback) ─────────────────

async function getTransporter() {
  let host = process.env.SMTP_HOST || 'smtp.gmail.com';
  let port = parseInt(process.env.SMTP_PORT || '587');
  let secure = process.env.SMTP_SECURE === 'true';
  let user = process.env.SMTP_USER || '';
  let pass = process.env.SMTP_PASSWORD || '';

  try {
    const settings = await prisma.setting.findMany({
      where: { group: 'email' },
    });
    const settingMap = Object.fromEntries(settings.map((s) => [s.key, s.value]));

    if (settingMap['smtp_host']) host = settingMap['smtp_host'] as string;
    if (settingMap['smtp_port']) port = parseInt(settingMap['smtp_port'] as string);
    if (settingMap['smtp_secure']) secure = settingMap['smtp_secure'] === true;
    if (settingMap['smtp_user']) user = settingMap['smtp_user'] as string;
    if (settingMap['smtp_password']) pass = settingMap['smtp_password'] as string;
  } catch {
    // Fall back to env vars silently
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    tls: { rejectUnauthorized: process.env.NODE_ENV === 'production' },
  });
}

async function getFromAddress(): Promise<string> {
  const fromName = process.env.SMTP_FROM_NAME || 'ARTIC Marketplace';
  const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || '';
  return `"${fromName}" <${fromEmail}>`;
}

// ─── Core send function ───────────────────────────────────────────────────────

export interface SendEmailOptions {
  to: string;
  toName?: string;
  subject: string;
  template: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  reactComponent?: any; // React Email component
  html?: string;        // fallback raw HTML
  text?: string;        // plain text fallback
}

export async function sendEmail(options: SendEmailOptions): Promise<boolean> {
  const logEntry = await prisma.emailLog.create({
    data: {
      toEmail: options.to,
      toName: options.toName,
      subject: options.subject,
      template: options.template,
      status: 'PENDING',
    },
  });

  try {
    const transporter = await getTransporter();
    const from = await getFromAddress();

    let htmlContent = options.html || '';
    if (options.reactComponent) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { render } = require('@react-email/render');
      htmlContent = await render(options.reactComponent);
    }

    await transporter.sendMail({
      from,
      to: options.toName ? `"${options.toName}" <${options.to}>` : options.to,
      subject: options.subject,
      html: htmlContent,
      text: options.text || htmlContent.replace(/<[^>]+>/g, ''),
    });

    await prisma.emailLog.update({
      where: { id: logEntry.id },
      data: { status: 'SENT', sentAt: new Date() },
    });

    logger.info(`Email sent to ${options.to} | template: ${options.template}`);
    return true;
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);

    await prisma.emailLog.update({
      where: { id: logEntry.id },
      data: { status: 'FAILED', error: errMsg },
    });

    logger.error(`Email failed to ${options.to}:`, errMsg);
    return false;
  }
}
