/**
 * Email utility using Nodemailer
 * Sends notification emails to admin when contact/project requests arrive
 */

const nodemailer = require('nodemailer');
const env = require('../config/env');
const logger = require('./logger');

let transporter = null;

const getTransporter = () => {
  if (!transporter && env.EMAIL_USER && env.EMAIL_PASS) {
    transporter = nodemailer.createTransport({
      host: env.EMAIL_HOST,
      port: env.EMAIL_PORT,
      secure: env.EMAIL_PORT === 465,
      auth: {
        user: env.EMAIL_USER,
        pass: env.EMAIL_PASS,
      },
    });
  }
  return transporter;
};

/**
 * Send admin notification for a contact form submission
 */
const sendContactNotification = async (submission) => {
  const t = getTransporter();
  if (!t) {
    logger.warn('Email transporter not configured — skipping contact notification');
    return;
  }

  try {
    await t.sendMail({
      from: `"Portfolio Contact" <${env.EMAIL_FROM}>`,
      to: env.EMAIL_TO,
      subject: `New Contact: ${submission.subject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <table style="border-collapse:collapse;width:100%">
          <tr><td><strong>Name:</strong></td><td>${submission.name}</td></tr>
          <tr><td><strong>Email:</strong></td><td>${submission.email}</td></tr>
          <tr><td><strong>Subject:</strong></td><td>${submission.subject}</td></tr>
          <tr><td><strong>Message:</strong></td><td style="white-space:pre-wrap">${submission.message}</td></tr>
        </table>
      `,
    });
    logger.info(`Contact notification sent for: ${submission.email}`);
  } catch (err) {
    logger.error(`Failed to send contact notification: ${err.message}`);
  }
};

/**
 * Send admin notification for a project request submission
 */
const sendProjectRequestNotification = async (req) => {
  const t = getTransporter();
  if (!t) {
    logger.warn('Email transporter not configured — skipping project request notification');
    return;
  }

  try {
    await t.sendMail({
      from: `"Portfolio Contact" <${env.EMAIL_FROM}>`,
      to: env.EMAIL_TO,
      subject: `New Project Request from ${req.firstName} ${req.lastName}`,
      html: `
        <h2>New Project Request</h2>
        <table style="border-collapse:collapse;width:100%">
          <tr><td><strong>Name:</strong></td><td>${req.firstName} ${req.lastName}</td></tr>
          <tr><td><strong>Email:</strong></td><td>${req.email}</td></tr>
          <tr><td><strong>Phone:</strong></td><td>${req.phone || 'N/A'}</td></tr>
          <tr><td><strong>Company:</strong></td><td>${req.company || 'N/A'}</td></tr>
          <tr><td><strong>Service:</strong></td><td>${req.serviceNeeded}</td></tr>
          <tr><td><strong>Budget:</strong></td><td>${req.budgetRange}</td></tr>
          <tr><td><strong>Timeline:</strong></td><td>${req.timeline}</td></tr>
          <tr><td><strong>Contact Preference:</strong></td><td>${req.preferredContactMethod}</td></tr>
          <tr><td><strong>Description:</strong></td><td style="white-space:pre-wrap">${req.projectDescription}</td></tr>
        </table>
      `,
    });
    logger.info(`Project request notification sent for: ${req.email}`);
  } catch (err) {
    logger.error(`Failed to send project request notification: ${err.message}`);
  }
};

module.exports = { sendContactNotification, sendProjectRequestNotification };
