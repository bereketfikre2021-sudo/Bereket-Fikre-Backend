/**
 * Activity Logger Middleware
 * Attaches req.logActivity helper after authentication.
 */

const { logActivity } = require('../utils/activityLog');

const attachActivityLogger = (req, _res, next) => {
  req.logActivity = (params) => logActivity(req, params);
  next();
};

module.exports = { attachActivityLogger };
