/**
 * Rate limiters for different endpoint types
 */

const rateLimit = require('express-rate-limit');
const env = require('../config/env');

const createLimiter = (max, message) =>
  rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max,
    message: { success: false, message },
    standardHeaders: true,
    legacyHeaders: false,
  });

// General API requests
const generalLimiter = createLimiter(
  env.RATE_LIMIT_MAX,
  'Too many requests. Please try again later.'
);

// Auth endpoints (login/refresh) - strict
const authLimiter = createLimiter(
  env.AUTH_RATE_LIMIT_MAX,
  'Too many authentication attempts. Please try again in 15 minutes.'
);

// Contact/project request forms - prevent spam
const contactLimiter = createLimiter(
  env.CONTACT_RATE_LIMIT_MAX,
  'Too many submissions. Please try again in 15 minutes.'
);

// Upload endpoints
const uploadLimiter = createLimiter(
  20,
  'Too many uploads. Please try again later.'
);

module.exports = { generalLimiter, authLimiter, contactLimiter, uploadLimiter };
