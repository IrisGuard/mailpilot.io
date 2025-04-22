export interface Template {
  id: string;
  name: string;
  subject: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  company?: string;
  role?: string;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface EmailHistory {
  id: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  content: string;
  templateId?: string;
  contactIds?: string[];
  sentAt: number;
  status: 'sent' | 'failed';
  error?: string;
}

export interface UserProfile {
  name: string;
  email: string;
  company?: string;
  website?: string;
  phone?: string;
  address?: string;
}

export interface SmtpSettings {
  host: string;
  port: number;
  username: string;
  password: string;
  fromName: string;
  fromEmail: string;
  useTLS: boolean;
}

export interface AppImages {
  logo?: string;
  banner?: string;
}

export interface Variable {
  key: string;
  label: string;
  example: string;
}