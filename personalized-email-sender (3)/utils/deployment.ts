import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { Template, Contact, SmtpSettings, ImageData } from '@/types';
import { GITHUB_REPO } from '@/constants/config';

// Define the type for Sharing module
interface SharingModule {
  isAvailableAsync: () => Promise<boolean>;
  shareAsync: (url: string, options?: any) => Promise<any>;
}

// Import Sharing conditionally to avoid dynamic imports
let Sharing: SharingModule | null = null;
if (Platform.OS !== 'web') {
  try {
    // Static import that will be evaluated at build time
    Sharing = require('expo-sharing');
  } catch (error) {
    console.log('expo-sharing not available');
  }
}

interface AppData {
  templates: Template[];
  contacts: Contact[];
  smtpSettings: SmtpSettings | null;
  user: any | null;
  logo?: ImageData | null;
  banner?: ImageData | null;
}

export const validateDeploymentData = (data: Partial<AppData>): { valid: boolean; message?: string } => {
  console.log("Validating deployment data:", {
    templatesCount: data.templates?.length || 0,
    contactsCount: data.contacts?.length || 0,
    hasSmtp: !!data.smtpSettings,
    hasUser: !!data.user
  });

  // Check if we have templates
  if (!data.templates || data.templates.length === 0) {
    return { 
      valid: false, 
      message: 'No templates found. Please create at least one template before deploying.' 
    };
  }

  // Check if we have contacts
  if (!data.contacts || data.contacts.length === 0) {
    return { 
      valid: false, 
      message: 'No contacts found. Please add at least one contact before deploying.' 
    };
  }

  // Make SMTP settings optional for deployment
  // We'll just log a warning instead of blocking deployment
  if (!data.smtpSettings || !data.smtpSettings.host || !data.smtpSettings.username) {
    console.warn('SMTP settings are not configured. You can configure them later.');
    // Return valid: true to allow deployment without SMTP settings
  }

  // Check if user profile is set up
  if (!data.user || !data.user.name || !data.user.email) {
    return { 
      valid: false, 
      message: 'User profile is not complete. Please set up your profile before deploying.' 
    };
  }

  return { valid: true };
};

export const exportAppData = async (data: AppData): Promise<void> => {
  try {
    // Convert data to JSON string
    const jsonData = JSON.stringify(data, null, 2);
    
    // Create a file with the data
    if (Platform.OS === 'web') {
      // For web, create a download link
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'mailpilot-data.json';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else {
      // For mobile, save to file system
      const fileUri = `${FileSystem.documentDirectory}mailpilot-data.json`;
      await FileSystem.writeAsStringAsync(fileUri, jsonData);
      
      // Try to share the file if possible
      try {
        if (Sharing && typeof Sharing.isAvailableAsync === 'function') {
          const isAvailable = await Sharing.isAvailableAsync();
          if (isAvailable) {
            await Sharing.shareAsync(fileUri, {
              mimeType: 'application/json',
              dialogTitle: 'Export MailPilot Data',
              UTI: 'public.json'
            });
          } else {
            console.log('Sharing is not available, file saved to:', fileUri);
          }
        } else {
          console.log('Sharing module not available, file saved to:', fileUri);
        }
      } catch (sharingError) {
        console.log('Sharing error:', sharingError);
        console.log('File saved to:', fileUri);
      }
    }
  } catch (error) {
    console.error('Error exporting data:', error);
    throw error;
  }
};

export const importAppData = async (fileUri: string): Promise<AppData> => {
  try {
    const jsonData = await FileSystem.readAsStringAsync(fileUri);
    return JSON.parse(jsonData) as AppData;
  } catch (error) {
    console.error('Error importing data:', error);
    throw error;
  }
};

// Simulate GitHub upload process
export const simulateGitHubUpload = async (
  data: AppData, 
  onStepChange: (step: number) => void
): Promise<void> => {
  console.log("Starting GitHub upload simulation");
  
  try {
    // Step 1: Preparing files
    console.log("Step 1: Preparing files");
    onStepChange(0);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Step 2: Connecting to GitHub
    console.log("Step 2: Connecting to GitHub");
    onStepChange(1);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Step 3: Uploading files
    console.log("Step 3: Uploading files");
    onStepChange(2);
    
    // Generate the files to upload
    const files = await generateGitHubFiles(data);
    console.log("Generated files:", Object.keys(files).length);
    
    // In a real implementation, we would upload these files to GitHub
    // For now, we'll just simulate the upload with a delay
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Step 4: Finalizing upload
    console.log("Step 4: Finalizing upload");
    onStepChange(3);
    
    // For web, we can try to actually create a file for download
    if (Platform.OS === 'web') {
      try {
        // Create a JSON file with all the data
        const jsonData = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'mailpilot-data.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch (webError) {
        console.error("Error creating web download:", webError);
      }
    }
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Done!
    console.log("GitHub upload simulation completed");
    return Promise.resolve();
  } catch (error) {
    console.error("Error in GitHub upload simulation:", error);
    throw error;
  }
};

// Generate GitHub repository files structure
export const generateGitHubFiles = async (data: AppData): Promise<Record<string, string>> => {
  console.log("Generating GitHub files");
  
  try {
    // This function would normally generate the files to be uploaded to GitHub
    // Since we can't actually upload to GitHub from the app, this is just a simulation
    
    const files: Record<string, string> = {
      'README.md': `# ${GITHUB_REPO.REPO_NAME}

A modern email marketing platform built with React Native and Expo.

## Features

- Create and manage email templates
- Manage contacts and contact lists
- Send individual and bulk emails
- Track email history
- Customize with your company branding
- Deploy to web with Netlify

## Getting Started

1. Clone this repository
2. Install dependencies with \`npm install\`
3. Run the app with \`npx expo start\`

## Deployment

This app can be deployed to Netlify or any other static hosting service.`,
      'package.json': JSON.stringify({
        name: 'mailpilot',
        version: '1.0.0',
        main: 'index.js',
        dependencies: {
          'expo': '^52.0.0',
          'react': '^18.2.0',
          'react-native': '^0.76.0',
          'expo-router': '^2.0.0',
          'zustand': '^4.3.8',
          '@react-native-async-storage/async-storage': '^1.18.2',
          'lucide-react-native': '^0.252.0'
        },
        scripts: {
          'start': 'expo start',
          'android': 'expo start --android',
          'ios': 'expo start --ios',
          'web': 'expo start --web',
          'build': 'expo export:web'
        }
      }, null, 2),
      'app.json': JSON.stringify({
        expo: {
          name: 'MailPilot',
          slug: 'mailpilot',
          version: '1.0.0',
          orientation: 'portrait',
          icon: './assets/icon.png',
          userInterfaceStyle: 'light',
          splash: {
            image: './assets/splash.png',
            resizeMode: 'contain',
            backgroundColor: '#ffffff'
          },
          assetBundlePatterns: [
            '**/*'
          ],
          ios: {
            supportsTablet: true
          },
          android: {
            adaptiveIcon: {
              foregroundImage: './assets/adaptive-icon.png',
              backgroundColor: '#ffffff'
            }
          },
          web: {
            favicon: './assets/favicon.png'
          }
        }
      }, null, 2),
      'data/templates.json': JSON.stringify(data.templates, null, 2),
      'data/contacts.json': JSON.stringify(data.contacts, null, 2),
      'data/settings.json': JSON.stringify({
        smtp: data.smtpSettings,
        user: data.user
      }, null, 2),
      'netlify.toml': `[build]
  command = "npm run build"
  publish = "web-build"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200`,
      'app/_layout.tsx': `import React from 'react';
import { Stack } from 'expo-router';
import { I18nProvider } from '../components/I18nProvider';

export default function RootLayout() {
  return (
    <I18nProvider>
      <Stack />
    </I18nProvider>
  );
}`,
      'constants/colors.ts': `export default {
  light: {
    primary: '#6366f1',
    secondary: '#f59e0b',
    background: '#f9fafb',
    card: '#ffffff',
    text: '#1f2937',
    subtext: '#6b7280',
    border: '#e5e7eb',
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6',
  },
  dark: {
    primary: '#818cf8',
    secondary: '#fbbf24',
    background: '#1f2937',
    card: '#374151',
    text: '#f9fafb',
    subtext: '#9ca3af',
    border: '#4b5563',
    success: '#34d399',
    error: '#f87171',
    warning: '#fbbf24',
    info: '#60a5fa',
  },
}`
    };
    
    // Add all templates, contacts, and settings data
    files['mailpilot-data.json'] = JSON.stringify(data, null, 2);
    
    console.log("GitHub files generated:", Object.keys(files).length);
    return files;
  } catch (error) {
    console.error("Error generating GitHub files:", error);
    throw error;
  }
};