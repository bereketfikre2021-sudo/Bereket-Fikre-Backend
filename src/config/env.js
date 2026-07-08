/**
 * Centralised environment configuration
 *
 * All values are read exclusively from process.env — nothing is hardcoded.
 * dotenv loads the .env file so variables are available in development.
 * On Render (production) the variables are injected directly by the platform.
 *
 * Required variables — the process exits immediately if any are missing:
 *   DATABASE_URL            Neon PostgreSQL connection string
 *   JWT_SECRET              Access-token signing secret  (64+ random hex chars)
 *   JWT_REFRESH_SECRET      Refresh-token signing secret (64+ random hex chars)
 *   CLOUDINARY_CLOUD_NAME   Cloudinary account cloud name
 *   CLOUDINARY_API_KEY      Cloudinary API key
 *   CLOUDINARY_API_SECRET   Cloudinary API secret
 *
 * Optional variables have sensible defaults shown below.
 */

'use strict';

require('dotenv').config();

// ─── Hard-required — app will not start if any are missing ───────────────────
const REQUIRED = [
  'DATABASE_URL',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
];

const missing = REQUIRED.filter((key) => !process.env[key]);
if (missing.length > 0) {
  console.error(
    '❌  Missing required environment variables:\n' +
    missing.map((k) => `     • ${k}`).join('\n') + '\n' +
    '   Add them to your .env file (development) or Render dashboard (production).'
  );
  process.exit(1);
}

// ─── Export ───────────────────────────────────────────────────────────────────
module.exports = {

  // ── Server ──────────────────────────────────────────────────────────────────
  NODE_ENV : process.env.NODE_ENV || 'development',
  PORT     : parseInt(process.env.PORT, 10) || 5000,
  isDev    : process.env.NODE_ENV !== 'production',
  isProd   : process.env.NODE_ENV === 'production',

  // ── Database ─────────────────────────────────────────────────────────────────
  DATABASE_URL: process.env.DATABASE_URL,

  // ── JWT ──────────────────────────────────────────────────────────────────────
  JWT_SECRET             : process.env.JWT_SECRET,
  JWT_EXPIRES_IN         : process.env.JWT_EXPIRES_IN          || '15m',
  JWT_REFRESH_SECRET     : process.env.JWT_REFRESH_SECRET,
  JWT_REFRESH_EXPIRES_IN : process.env.JWT_REFRESH_EXPIRES_IN  || '7d',

  // ── Cloudinary ───────────────────────────────────────────────────────────────
  // Values are guaranteed non-empty here because they passed the REQUIRED check.
  CLOUDINARY_CLOUD_NAME : process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY    : process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET : process.env.CLOUDINARY_API_SECRET,

  // Convenience flag — always true once env.js loads successfully
  cloudinaryConfigured: true,

  // ── Admin seed credentials ────────────────────────────────────────────────────
  ADMIN_EMAIL    : process.env.ADMIN_EMAIL    || 'admin@bereketfikre.et',
  ADMIN_PASSWORD : process.env.ADMIN_PASSWORD || 'ChangeMe!Strong#2024',
  ADMIN_NAME     : process.env.ADMIN_NAME     || 'Bereket Fikre',

  // ── CORS ─────────────────────────────────────────────────────────────────────
  FRONTEND_URL : process.env.FRONTEND_URL || 'https://bereketfikre.et',
  ADMIN_URL    : process.env.ADMIN_URL    || 'http://localhost:3000',

  // ── Email (Nodemailer) ───────────────────────────────────────────────────────
  EMAIL_HOST : process.env.EMAIL_HOST || 'smtp.gmail.com',
  EMAIL_PORT : parseInt(process.env.EMAIL_PORT, 10) || 587,
  EMAIL_USER : process.env.EMAIL_USER || null,
  EMAIL_PASS : process.env.EMAIL_PASS || null,
  EMAIL_FROM : process.env.EMAIL_FROM || 'noreply@bereketfikre.et',
  EMAIL_TO   : process.env.EMAIL_TO   || 'bereketfikre2021@gmail.com',

  // ── Rate limiting ────────────────────────────────────────────────────────────
  RATE_LIMIT_WINDOW_MS    : parseInt(process.env.RATE_LIMIT_WINDOW_MS,    10) || 15 * 60 * 1000,
  RATE_LIMIT_MAX          : parseInt(process.env.RATE_LIMIT_MAX,          10) || 100,
  AUTH_RATE_LIMIT_MAX     : parseInt(process.env.AUTH_RATE_LIMIT_MAX,     10) || 10,
  CONTACT_RATE_LIMIT_MAX  : parseInt(process.env.CONTACT_RATE_LIMIT_MAX,  10) || 5,
};
