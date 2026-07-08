/**
 * Global error handler middleware
 * Must be registered last in Express app
 */

const logger = require('../utils/logger');
const env = require('../config/env');

const errorHandler = (err, req, res, next) => {
  // Log the error
  logger.error(`${err.name}: ${err.message}`, { stack: err.stack, url: req.url, method: req.method });

  // Prisma unique constraint violation
  if (err.code === 'P2002') {
    const field = err.meta?.target?.join(', ') || 'field';
    return res.status(409).json({
      success: false,
      message: `A record with this ${field} already exists.`,
    });
  }

  // Prisma record not found
  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      message: 'Record not found.',
    });
  }

  // Multer file size limit
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'File too large. Maximum size is 10MB.',
    });
  }

  // Multer file type error
  if (err.message?.includes('File type not allowed')) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  // JWT errors (shouldn't normally reach here, caught in auth middleware)
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, message: 'Invalid token.' });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: 'Token expired.' });
  }

  // Default server error
  const statusCode = err.statusCode || err.status || 500;
  const message = env.isProd && statusCode === 500 ? 'Internal server error.' : err.message;

  return res.status(statusCode).json({
    success: false,
    message,
    ...(env.isDev && { stack: err.stack }),
  });
};

/**
 * 404 handler for undefined routes
 */
const notFound = (req, res) => {
  return res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

module.exports = { errorHandler, notFound };
