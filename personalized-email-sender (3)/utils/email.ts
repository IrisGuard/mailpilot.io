import { Platform } from 'react-native';
import { useSmtpStore } from '@/store/smtp-store';
import { useHistoryStore } from '@/store/history-store';
import { generateId } from './id';

// Define email data interface
export interface EmailData {
  to: string;
  cc?: string;
  bcc?: string;
  subject: string;
  html: string;
  from?: string;
}

// Function to send email
export const sendEmail = async (emailData: EmailData): Promise<boolean> => {
  try {
    const smtpStore = useSmtpStore.getState();
    const historyStore = useHistoryStore.getState();
    const { saveToHistory } = smtpStore;
    
    // If SMTP is not configured, return false
    if (!smtpStore.isConfigured) {
      console.error('SMTP not configured');
      return false;
    }
    
    // Set from address if not provided
    if (!emailData.from) {
      emailData.from = `${smtpStore.fromName} <${smtpStore.fromEmail}>`;
    }
    
    // Use different approaches for web and native
    if (Platform.OS === 'web') {
      // For web, use the backend API
      const apiUrl = process.env.NODE_ENV === 'production' 
        ? 'https://mailpilot-api.onrender.com/send-email' 
        : 'http://localhost:3001/send-email';
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
        throw new Error('Failed to send email');
      }
      
      // Save to history if enabled
      if (saveToHistory) {
        historyStore.addHistoryItem({
          id: generateId(),
          to: emailData.to,
          subject: emailData.subject,
          content: emailData.html,
          date: new Date().toISOString(),
        });
      }
      
      return true;
    } else {
      // For native, use a similar approach but with a different endpoint
      // This is a placeholder - in a real app, you'd implement native email sending
      console.log('Sending email in native mode', {
        to: emailData.to,
        from: emailData.from,
        subject: emailData.subject,
        smtpConfig: {
          host: smtpStore.host,
          port: smtpStore.port,
          secure: smtpStore.useTLS,
        }
      });
      
      // Save to history if enabled
      if (saveToHistory) {
        historyStore.addHistoryItem({
          id: generateId(),
          to: emailData.to,
          subject: emailData.subject,
          content: emailData.html,
          date: new Date().toISOString(),
        });
      }
      
      // Simulate success for testing
      return true;
    }
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

// Function to send bulk emails
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
      const success = await sendEmail({
        ...emailData,
        to: recipient,
      });
      
      if (success) {
        results.success.push(recipient);
      } else {
        results.failed.push(recipient);
      }
    } catch (error) {
      console.error(`Error sending email to ${recipient}:`, error);
      results.failed.push(recipient);
    }
  }
  
  return results;
};

export default {
  sendEmail,
  sendBulkEmails,
};