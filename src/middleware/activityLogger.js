/**
 * Activity Logger Middleware
 * Attaches req.logActivity() to every authenticated request.
 * Call it anywhere in a controller after a successful DB write.
 *
 * Usage:
 *   req.logActivity('CREATED', 'Project', project.id, project.title);
 */

'use strict';

const { logActivity } = require('../utils/activity');

const activityLogger = (req, res, next) => {
  /**
   * @param {'CREATED'|'UPDATED'|'DELETED'|'PUBLISHED'|'UNPUBLISHED'|'UPLOADED'|'LOGIN'|'LOGOUT'|'PASSWORD_CHANGED'} action
   * @param {string} entity     e.g. 'Project'
   * @param {string} [entityId]
   * @param {string} [entityName]
   * @param {object} [meta]
   */
  req.logActivity = (action, entity, entityId, entityName, meta) => {
    logActivity({
      admin:      req.admin || null,
      action,
      entity,
      entityId,
      entityName,
      meta,
    });
  };
  next();
};

module.exports = activityLogger;
