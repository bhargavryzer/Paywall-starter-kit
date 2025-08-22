 
import nodemailer from 'nodemailer';
import config from '../config/config.js';

interface EmailOptions {
  email: string;
  subject: string;
  message: string;
}

const sendEmail = async (options: EmailOptions) => {
  // 1) Create a transporter
  const transporter = nodemailer.createTransport({
    host: config.smtpHost,
    port: 587, // Common ports: 587 (TLS), 465 (SSL)
    secure: false, // true for 465, false for other ports
    auth: {
      user: config.smtpUser,
      pass: config.smtpPass,
    },
  });

  // 2) Define the email options
  const mailOptions = {
    from: 'Your App Name <no-reply@yourapp.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html: 
  };

  // 3) Actually send the email
  await transporter.sendMail(mailOptions);
};

export default sendEmail;
 