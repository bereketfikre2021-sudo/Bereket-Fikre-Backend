/**
 * Activity Log Utility
 * Call logActivity() inside any controller after a successful action.
 * Fire-and-forget — never throws, never blocks the response.
 */

'use strict';

const prisma  = require('../config/database');
const logger  = require('./logger');

/**
 * @param {object} opts
 * @param {object|null} opts.admin     - req.admin (may be null for system actions)
 * @param {'CREATED'|'UPDATED'|'DELETED'|'PUBLISHED'|'UNPUBLISHED'|'UPLOADED'|'LOGIN'|'LOGOUT'|'PASSWORD_CHANGED'} opts.action
 * @param {string} opts.entity         - e.g. 'Project', 'Service', 'FAQ'
 * @param {string} [opts.entityId]
 * @param {string} [opts.entityName]   - human-readable name
 * @param {object} [opts.meta]         - any extra context
 */
const logActivity = (opts) => {
  const { admin, action, entity, entityId, entityName, meta } = opts;

  prisma.activityLog
    .create({
      data: {
        adminId:    admin?.id   || null,
        adminName:  admin?.name || 'System',
        action,
        entity,
        entityId:   entityId   || null,
        entityName: entityName || null,
        meta:       meta       || undefined,
      },
    })
    .catch((err) => logger.error(`Activity log failed: ${err.message}`));
};

module.exports = { logActivity };
