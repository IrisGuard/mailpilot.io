import { Platform } from 'react-native';
import { useSmtpStore } from '@/store/smtp-store';
import { useHistoryStore } from '@/store/history-store';
import { generateId } from './id';

// ===================
// 🔶 TYPES
// ===================

export interface EmailData {
  to: string;
  cc?: string;
  bcc?: string;
  subject: string;
  html: string;
  from?: string;
}

export interface SmtpSettings {
  host: string;
  port: number;
  useTLS: boolean;
  username: string;
  password: string;
  fromEmail: string;
  fromName: string;
}

// ===================
// 🔷 HELPERS
// ===================

export const replaceTemplateVariables = (
  template: string,
  variables: { [key: string]: string }
): string => {
  return Object.keys(variables).reduce((result, key) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    return result.replace(regex, variables[key]);
  }, template);
};

export const formatEmailWithImages = (
  html: string,
  logoUri?: string,
  bannerUri?: string
): string => {
  let finalHtml = html;
  if (logoUri) {
    finalHtml = `<img src="${logoUri}" alt="Logo" /><br />` + finalHtml;
  }
  if (bannerUri) {
    finalHtml += `<br /><img src="${bannerUri}" alt="Banner" />`;
  }
  return finalHtml;
};

export const validateSmtpSettings = (settings: Partial<SmtpSettings> | null): settings is SmtpSettings => {
  return !!(
    settings &&
    settings.host &&
    settings.port &&
    settings.username &&
    settings.password &&
    settings.fromEmail &&
    settings.fromName
  );
};

export const mockSendEmail = async (
  to: string,
  subject: string,
  body: string
): Promise<void> => {
  console.log(`[MOCK] Email sent to ${to} with subject "${subject}"`);
  console.log('Body:', body);
};

// ===================
// 📬 SEND EMAIL
// ===================

export const sendEmail = async (emailData: EmailData): Promise<{
  success: boolean;
  message?: string;
}> => {
  try {
    const smtpStore = useSmtpStore.getState();
    const historyStore = useHistoryStore.getState();
    const { saveToHistory } = smtpStore;

    if (!validateSmtpSettings(smtpStore)) {
      return { success: false, message: 'SMTP settings not configured' };
    }

    if (!emailData.from) {
      emailData.from = `${smtpStore.fromName} <${smtpStore.fromEmail}>`;
    }

    if (Platform.OS === 'web') {
      const apiUrl =
        process.env.NODE_ENV === 'production'
          ? 'https://mailpilot-api.onrender.com/send-email'
          : 'http://localhost:3001/send-email';

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...emailData,
          smtpConfig: {
            host: smtpStore.host,
            port: smtpStore.port,
            secure: smtpStore.useTLS,
            auth: {
              user: smtpStore.username,
              pass: smtpStore.password,
            },
          },
        }),
      });
      if (!response.ok) {
        const text = await response.text();
        return { success: false, message: text || 'Failed to send email' };
      }

      if (saveToHistory) {
        historyStore.addToHistory({
          to: [emailData.to],
          subject: emailData.subject,
          body: emailData.html,
          status: 'sent',
        });
      }
      
      return { success: true };
    } else {
      console.log('Native email send simulation:', {
        ...emailData,
        smtp: {
          host: smtpStore.host,
          port: smtpStore.port,
          secure: smtpStore.useTLS,
        },
      });
      if (saveToHistory) {
        historyStore.addToHistory({
          to: [emailData.to],
          subject: emailData.subject,
          body: emailData.html,
          status: 'sent',
        });
      }
      
          

      return { success: true };
    }
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || 'Unknown error',
    };
  }
};

// ===================
// 📤 SEND BULK EMAILS
// ===================

export const sendBulkEmails = async (
  emailData: Omit<EmailData, 'to'>,
  recipients: string[]
): Promise<{ success: string[]; failed: string[] }> => {
  const results = {
    success: [] as string[],
    failed: [] as string[],
  };

  for (const recipient of recipients) {
    try {
      const result = await sendEmail({
        ...emailData,
        to: recipient,
      });

      if (result.success) {
        results.success.push(recipient);
      } else {
        results.failed.push(recipient);
      }
    } catch (err) {
      console.error(`Error sending to ${recipient}:`, err);
      results.failed.push(recipient);
    }
  }

  return results;
};

export default {
  sendEmail,
  sendBulkEmails,
  replaceTemplateVariables,
  formatEmailWithImages,
  mockSendEmail,
  validateSmtpSettings,
};
