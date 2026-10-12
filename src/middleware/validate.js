/**
 * Validation middleware using express-validator
 * Runs validationResult and returns 422 on failures
 */

const { validationResult } = require('express-validator');
const { error } = require('../utils/response');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errs = errors.array().map((e) => ({ field: e.path, message: e.msg }));
    // Temporary: log to server console so we can diagnose 422s
    const logger = require('../utils/logger');
    logger.warn(`Validation failed [${req.method} ${req.path}]: ${JSON.stringify(errs)}`);
    return error(res, 'Validation failed.', 422, errs);
  }
  next();
};

module.exports = validate;
