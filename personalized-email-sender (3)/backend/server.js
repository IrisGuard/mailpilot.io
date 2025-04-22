require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Health check endpoint
app.get('/', (req, res) => {
  res.send('Email API is running');
});

// Send email endpoint
app.post('/send-email', async (req, res) => {
  try {
    const { to, cc, bcc, subject, html, from, smtpConfig } = req.body;
    
    // Validate required fields
    if (!to || !subject || !html || !smtpConfig) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Create transporter
    const transporter = nodemailer.createTransport(smtpConfig);
    
    // Send email
    const info = await transporter.sendMail({
      from,
      to,
      cc,
      bcc,
      subject,
      html,
    });
    
    res.status(200).json({ 
      success: true, 
      messageId: info.messageId 
    });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ 
      error: 'Failed to send email', 
      details: error.message 
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Email API server running on port ${PORT}`);
});