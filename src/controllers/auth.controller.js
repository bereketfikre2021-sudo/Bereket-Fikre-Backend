/**
 * Auth Controller
 * Handles login, logout, token refresh, and password management
 */

const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const prisma = require('../config/database');
const env = require('../config/env');
const { success, error } = require('../utils/response');
const { deleteAsset } = require('../services/upload.service');
const { sendPasswordResetEmail } = require('../utils/email');
const logger = require('../utils/logger');

/**
 * Generate access token
 */
const generateAccessToken = (admin) => {
  return jwt.sign(
    { id: admin.id, email: admin.email, role: admin.role },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );
};

/**
 * Generate refresh token and save to DB
 */
const generateRefreshToken = async (adminId) => {
  const token = uuidv4();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  await prisma.refreshToken.create({
    data: { token, adminId, expiresAt },
  });

  return token;
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const admin = await prisma.admin.findUnique({ where: { email } });

    if (!admin || !admin.isActive) {
      return error(res, 'Invalid email or password.', 401);
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return error(res, 'Invalid email or password.', 401);
    }

    // Update last login
    await prisma.admin.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() },
    });

    const accessToken = generateAccessToken(admin);
    const refreshToken = await generateRefreshToken(admin.id);

    logger.info(`Admin login: ${admin.email}`);

    return success(res, {
      accessToken,
      refreshToken,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        avatar: admin.avatar || null,
      },
    }, 'Login successful');
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/refresh
const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    const tokenRecord = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { admin: true },
    });

    if (!tokenRecord) {
      return error(res, 'Invalid refresh token.', 401);
    }

    if (tokenRecord.expiresAt < new Date()) {
      // Clean up expired token
      await prisma.refreshToken.delete({ where: { id: tokenRecord.id } });
      return error(res, 'Refresh token expired. Please log in again.', 401);
    }

    if (!tokenRecord.admin.isActive) {
      return error(res, 'Account is deactivated.', 403);
    }

    // Issue new access token
    const accessToken = generateAccessToken(tokenRecord.admin);

    return success(res, { accessToken }, 'Token refreshed');
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/logout
const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
    }

    logger.info(`Admin logout: ${req.admin?.email}`);
    return success(res, null, 'Logged out successfully');
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    const admin = await prisma.admin.findUnique({
      where: { id: req.admin.id },
      select: {
        id: true, name: true, email: true, role: true,
        avatar: true, lastLoginAt: true, createdAt: true,
      },
    });
    return success(res, admin);
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/profile  (public — returns avatar for the login page)
const getProfile = async (req, res, next) => {
  try {
    // Return the first active SUPER_ADMIN's public-facing profile info
    const admin = await prisma.admin.findFirst({
      where: { isActive: true, role: 'SUPER_ADMIN' },
      select: { id: true, name: true, avatar: true },
    });
    return success(res, admin || { name: 'Admin', avatar: null });
  } catch (err) {
    next(err);
  }
};

// PUT /api/auth/avatar  (protected — upload new avatar)
const updateAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return error(res, 'No image file provided.', 400);
    }

    const existing = await prisma.admin.findUnique({ where: { id: req.admin.id } });

    // Delete old avatar from Cloudinary
    if (existing.avatarPublicId) {
      await deleteAsset(existing.avatarPublicId, 'image');
    }

    const updated = await prisma.admin.update({
      where: { id: req.admin.id },
      data: {
        avatar: req.file.path,          // Cloudinary secure_url
        avatarPublicId: req.file.filename, // Cloudinary public_id
      },
      select: {
        id: true, name: true, email: true, role: true,
        avatar: true, lastLoginAt: true, createdAt: true,
      },
    });

    logger.info(`Avatar updated: ${req.admin.email}`);
    return success(res, updated, 'Avatar updated successfully');
  } catch (err) {
    next(err);
  }
};

// PUT /api/auth/change-password
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const admin = await prisma.admin.findUnique({ where: { id: req.admin.id } });

    const isValid = await bcrypt.compare(currentPassword, admin.password);
    if (!isValid) {
      return error(res, 'Current password is incorrect.', 400);
    }

    const hashed = await bcrypt.hash(newPassword, 12);
    await prisma.admin.update({ where: { id: req.admin.id }, data: { password: hashed } });

    // Invalidate all refresh tokens
    await prisma.refreshToken.deleteMany({ where: { adminId: req.admin.id } });

    logger.info(`Password changed: ${req.admin.email}`);
    return success(res, null, 'Password changed successfully. Please log in again.');
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/forgot-password
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Always respond 200 to prevent email enumeration
    const admin = await prisma.admin.findUnique({ where: { email } });
    if (!admin || !admin.isActive) {
      return success(res, null, 'If that email is registered, a reset link has been sent.');
    }

    // Invalidate any existing unused tokens for this admin
    await prisma.passwordResetToken.deleteMany({ where: { adminId: admin.id } });

    // Generate a cryptographically secure raw token
    const rawToken = crypto.randomBytes(32).toString('hex');
    // Store only the SHA-256 hash — raw token travels only in the email
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    await prisma.passwordResetToken.create({
      data: {
        token: hashedToken,
        adminId: admin.id,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      },
    });

    const resetLink = `${env.ADMIN_URL}/reset-password?token=${rawToken}`;

    try {
      await sendPasswordResetEmail({ to: admin.email, resetLink });
    } catch (emailErr) {
      // Roll back token so admin can retry once email is configured
      await prisma.passwordResetToken.deleteMany({ where: { adminId: admin.id } });
      logger.error(`Forgot-password email failed: ${emailErr.message}`);
      return error(res, 'Failed to send reset email. Please check the server email configuration.', 503);
    }

    logger.info(`Password reset requested for: ${admin.email}`);
    return success(res, null, 'If that email is registered, a reset link has been sent.');
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/reset-password
const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    // Hash the incoming raw token to look up the stored hash
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const record = await prisma.passwordResetToken.findUnique({
      where: { token: hashedToken },
      include: { admin: true },
    });

    if (!record) {
      return error(res, 'Invalid or expired reset link.', 400);
    }

    if (record.usedAt) {
      return error(res, 'This reset link has already been used.', 400);
    }

    if (record.expiresAt < new Date()) {
      await prisma.passwordResetToken.delete({ where: { id: record.id } });
      return error(res, 'This reset link has expired. Please request a new one.', 400);
    }

    if (!record.admin.isActive) {
      return error(res, 'Account is deactivated.', 403);
    }

    const hashed = await bcrypt.hash(newPassword, 12);

    // Update password and mark token as used in a transaction
    await prisma.$transaction([
      prisma.admin.update({
        where: { id: record.admin.id },
        data: { password: hashed },
      }),
      prisma.passwordResetToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
      // Invalidate all active sessions
      prisma.refreshToken.deleteMany({ where: { adminId: record.admin.id } }),
    ]);

    logger.info(`Password reset completed for: ${record.admin.email}`);
    return success(res, null, 'Password reset successfully. You can now log in with your new password.');
  } catch (err) {
    next(err);
  }
};

module.exports = { login, refresh, logout, getMe, getProfile, updateAvatar, changePassword, forgotPassword, resetPassword };
