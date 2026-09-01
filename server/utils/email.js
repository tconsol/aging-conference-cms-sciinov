const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT, 10) || 587,
  secure: process.env.EMAIL_PORT === '465',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// `attachments` follows nodemailer's shape, e.g.
// [{ filename: 'letter.pdf', content: <Buffer>, contentType: 'application/pdf' }]
const sendEmail = async ({ to, subject, html, text, attachments }) => {
  return transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
    text,
    ...(attachments?.length ? { attachments } : {}),
  });
};

module.exports = { sendEmail };
