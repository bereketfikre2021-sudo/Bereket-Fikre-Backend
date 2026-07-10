/**
 * Activity Log utility
 * Records admin actions to the activity_logs table (fire-and-forget).
 */

const prisma = require('../config/database');
const logger = require('./logger');

/**
 * Resolve action for content with PUBLISHED/DRAFT status fields.
 */
const resolveContentAction = (existing, nextStatus) => {
  if (nextStatus === 'PUBLISHED' && existing?.status !== 'PUBLISHED') return 'PUBLISHED';
  if (nextStatus === 'DRAFT' && existing?.status === 'PUBLISHED') return 'UNPUBLISHED';
  return 'UPDATED';
};

/**
 * Resolve action for entities with isActive boolean.
 */
const resolveActiveAction = (existing, nextActive) => {
  const wasActive = existing?.isActive !== false;
  const nowActive = nextActive !== false && nextActive !== 'false';
  if (nowActive && !wasActive) return 'ACTIVATED';
  if (!nowActive && wasActive) return 'DEACTIVATED';
  return 'UPDATED';
};

/**
 * Write an activity log entry. Non-blocking — errors are logged, not thrown.
 */
const logActivity = (req, { action, entity, entityId, entityName, meta }) => {
  if (!req?.admin) return;

  prisma.activityLog
    .create({
      data: {
        adminId: req.admin.id,
        adminName: req.admin.name,
        action,
        entity,
        entityId: entityId || null,
        entityName: entityName || null,
        meta: meta || null,
      },
    })
    .catch((err) => logger.error(`Activity log failed: ${err.message}`));
};

module.exports = { logActivity, resolveContentAction, resolveActiveAction };
