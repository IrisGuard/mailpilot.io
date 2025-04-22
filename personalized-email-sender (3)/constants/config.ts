// API configuration
export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.yourdomain.com';

// GitHub repository information
export const GITHUB_REPO = {
  OWNER: 'IrisGuard',
  REPO_NAME: 'mailpilot.io',
  URL: 'https://github.com/IrisGuard/mailpilot.io',
  BRANCH: 'main',
};

// Feature flags
export const FEATURES = {
  // Set to true to enable real email sending via SMTP
  // When false, emails are only mocked and added to history
  ENABLE_REAL_EMAIL_SENDING: false,
  
  // Enable contact import feature
  ENABLE_CONTACT_IMPORT: true,
  
  // Enable image uploads for logo and banner
  ENABLE_IMAGE_UPLOADS: true,
  
  // Enable GitHub integration
  ENABLE_GITHUB_INTEGRATION: true,
};

// App information
export const APP_INFO = {
  VERSION: '1.0.0',
  BUILD: '1',
  WEBSITE: 'https://mailpilot.io',
  SUPPORT_EMAIL: 'support@mailpilot.io',
};