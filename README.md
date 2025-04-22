# mailpilot.io

![mailpilot.io Logo](https://via.placeholder.com/150x50?text=mailpilot.io)

A modern email marketing platform built with React Native and Expo, designed for easy deployment and cross-platform compatibility.

## Features

- **Email Template Management**: Create, edit, and manage reusable email templates
- **Contact Management**: Organize your contacts with detailed information
- **Bulk Email Sending**: Send personalized emails to multiple contacts at once
- **Email History**: Track all sent emails with detailed information
- **SMTP Configuration**: Connect to your preferred email service provider
- **Customizable Branding**: Add your company logo and banner
- **Multi-language Support**: Available in English and Greek
- **Responsive Design**: Works on mobile, tablet, and web platforms
- **Data Export/Import**: Easily backup and restore your data
- **GitHub Integration**: One-click upload to GitHub repository

## Installation

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI

### Setup

1. Clone the repository:
```bash
git clone https://github.com/IrisGuard/mailpilot.io.git
cd mailpilot.io
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
npm start
# or
yarn start
```

4. Run on web:
```bash
npm run start-web
# or
yarn start-web
```

## Usage

### Creating Templates

1. Navigate to the Templates tab
2. Click "New Template"
3. Fill in the template name, subject, and content
4. Save your template

### Managing Contacts

1. Navigate to the Contacts tab
2. Click "New Contact" to add contacts individually
3. Or use the Import feature to add multiple contacts at once

### Sending Emails

1. Navigate to the Bulk Send tab
2. Select a template
3. Choose your recipients
4. Review and send your emails

### Configuring SMTP

1. Navigate to the Settings tab
2. Select "Email Settings"
3. Enter your SMTP server details
4. Test the connection

## Deployment

### Deploy to GitHub

1. Navigate to the Settings tab
2. Select "Deployment"
3. Click "Upload to GitHub" button
4. Follow the on-screen instructions

### Manual GitHub Deployment

1. Initialize Git in your project folder:
```bash
git init
git add .
git commit -m "Initial commit"
```
2. Connect to your GitHub repository:
```bash
git remote add origin https://github.com/IrisGuard/mailpilot.io.git
git push -u origin main
```

### Deploy to Netlify

1. Sign up for a Netlify account at https://app.netlify.com/signup
2. Click "New site from Git"
3. Select GitHub and authorize Netlify
4. Select your repository
5. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `web-build`
6. Click "Deploy site"

## Technologies Used

- React Native
- Expo
- React Navigation
- Zustand (State Management)
- AsyncStorage
- Expo FileSystem
- Lucide React Native (Icons)

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue on the GitHub repository or contact support@mailpilot.io.