/**
 * JWT Authentication Middleware
 * Protects admin routes
 */

const jwt = require('jsonwebtoken');
const prisma = require('../config/database');
const env = require('../config/env');
const { error } = require('../utils/response');
const { logActivity } = require('../utils/activityLog');

/**
 * Verify access token and attach admin to req.admin
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return error(res, 'Access denied. No token provided.', 401);
    }

    const token = authHeader.split(' ')[1];

    let decoded;
    try {
      decoded = jwt.verify(token, env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return error(res, 'Token expired. Please refresh your session.', 401);
      }
      return error(res, 'Invalid token.', 401);
    }

    const admin = await prisma.admin.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    if (!admin) {
      return error(res, 'Admin not found.', 401);
    }

    if (!admin.isActive) {
      return error(res, 'Account is deactivated.', 403);
    }

    req.admin = admin;
    req.logActivity = (params) => logActivity(req, params);
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Require SUPER_ADMIN role
 */
const requireSuperAdmin = (req, res, next) => {
  if (!req.admin || req.admin.role !== 'SUPER_ADMIN') {
    return error(res, 'Insufficient permissions.', 403);
  }
  next();
};

module.exports = { authenticate, requireSuperAdmin };
