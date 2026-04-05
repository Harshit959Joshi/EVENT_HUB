/**
 * Email Utility using NodeMailer
 */
const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

/**
 * Send an email
 * @param {object} options - { to, subject, html, text }
 */
const sendEmail = async (options) => {
  if (!process.env.EMAIL_USER) {
    console.log('📧 Email skipped (no EMAIL_USER set):', options.subject);
    return;
  }
  const transporter = createTransporter();
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'EventHub <noreply@eventhub.in>',
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text,
  };
  const info = await transporter.sendMail(mailOptions);
  console.log('📧 Email sent:', info.messageId);
  return info;
};

module.exports = { sendEmail };
