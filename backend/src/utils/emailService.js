// backend/src/utils/emailService.js
// Email sending utility using Nodemailer

const nodemailer = require('nodemailer');
const logger = require('./logger');

// Email configuration from environment variables
const emailConfig = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
};

const emailFrom = process.env.EMAIL_FROM || process.env.SMTP_USER || 'noreply@studytracker.com';

// Create transporter
let transporter = null;

function initializeTransporter() {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    logger.warn('Email configuration missing. Email sending will be simulated.', {
      hasUser: !!process.env.SMTP_USER,
      hasPass: !!process.env.SMTP_PASS
    });
    return null;
  }

  try {
    transporter = nodemailer.createTransport(emailConfig);
    logger.info('Email transporter initialized successfully');
    return transporter;
  } catch (error) {
    logger.error('Failed to initialize email transporter', { error: error.message });
    return null;
  }
}

// Initialize on module load
initializeTransporter();

/**
 * Send an email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text body
 * @param {string} options.html - HTML body (optional)
 * @returns {Promise<Object>} - Result with success status and messageId
 */
async function sendEmail({ to, subject, text, html }) {
  // If no transporter, simulate email sending
  if (!transporter) {
    logger.warn('Email sending simulated (no SMTP configured)', {
      to,
      subject,
      textPreview: text.substring(0, 100)
    });
    
    return {
      success: true,
      simulated: true,
      messageId: `simulated-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      message: 'Email simulated (SMTP not configured)'
    };
  }

  try {
    const mailOptions = {
      from: emailFrom,
      to,
      subject,
      text,
      html: html || text
    };

    const info = await transporter.sendMail(mailOptions);
    
    logger.logNotification('email_sent', {
      to,
      subject,
      messageId: info.messageId
    });

    return {
      success: true,
      simulated: false,
      messageId: info.messageId,
      message: 'Email sent successfully'
    };
  } catch (error) {
    logger.error('Failed to send email', {
      to,
      subject,
      error: error.message
    });

    return {
      success: false,
      simulated: false,
      error: error.message,
      message: 'Failed to send email'
    };
  }
}

/**
 * Send focus-loss alert email
 */
async function sendFocusLossAlert({ to, studentName, courseName, elapsedMinutes, thresholdMinutes }) {
  const subject = '⚠️ Focus Alert - Study Session Running Long';
  const text = `Hi ${studentName},

You've been studying ${courseName} for ${elapsedMinutes} minutes.

Based on your typical study patterns, you usually lose focus around ${thresholdMinutes} minutes. Consider taking a break soon to maintain productivity!

Best regards,
Smart Study Tracker`;

  const html = `
    <h2>⚠️ Focus Alert</h2>
    <p>Hi <strong>${studentName}</strong>,</p>
    <p>You've been studying <strong>${courseName}</strong> for <strong>${elapsedMinutes} minutes</strong>.</p>
    <p>Based on your typical study patterns, you usually lose focus around <strong>${thresholdMinutes} minutes</strong>. Consider taking a break soon to maintain productivity!</p>
    <p>Best regards,<br>Smart Study Tracker</p>
  `;

  return sendEmail({ to, subject, text, html });
}

/**
 * Send weekly report email
 */
async function sendWeeklyReportEmail({ to, studentName, weeklyHours, focusScore, recommendations }) {
  const subject = '📊 Your Weekly Study Report';
  const text = `Hi ${studentName},

Here's your study summary for this week:

Total Study Hours: ${weeklyHours}
Focus Score: ${focusScore}%

${recommendations.length > 0 ? 'Recommendations:\n' + recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n') : ''}

Keep up the great work!

Best regards,
Smart Study Tracker`;

  return sendEmail({ to, subject, text });
}

module.exports = {
  sendEmail,
  sendFocusLossAlert,
  sendWeeklyReportEmail
};

