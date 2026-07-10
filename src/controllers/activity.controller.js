/**
 * Activity Log Controller
 */

const prisma = require('../config/database');
const { paginated } = require('../utils/response');
const { parsePagination } = require('../utils/pagination');

// GET /api/admin/activity
const getActivityLogs = async (req, res, next) => {
  try {
    const { page, limit, skip, take } = parsePagination(req.query);

    const where = {};
    if (req.query.entity) where.entity = req.query.entity;
    if (req.query.action) where.action = req.query.action;

    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      prisma.activityLog.count({ where }),
    ]);

    return paginated(res, logs, total, page, limit);
  } catch (err) {
    next(err);
  }
};

module.exports = { getActivityLogs };
