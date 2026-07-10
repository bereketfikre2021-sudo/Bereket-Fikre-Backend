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

// Upload endpoints — only enforced when a file is actually present (see upload.service.js)
const UPLOAD_RATE_LIMIT_MAX = env.isDev ? 500 : 20;
const uploadLimiter = createLimiter(
  UPLOAD_RATE_LIMIT_MAX,
  'Too many uploads. Please try again later.'
);

/** Apply upload rate limit only after multer has parsed a file into req.file */
const enforceUploadLimitIfFile = (req, res, next) => {
  if (!req.file) return next();
  return uploadLimiter(req, res, next);
};

module.exports = {
  generalLimiter,
  authLimiter,
  contactLimiter,
  uploadLimiter,
  enforceUploadLimitIfFile,
};
