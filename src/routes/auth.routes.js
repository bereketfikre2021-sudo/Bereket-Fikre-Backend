const { Router } = require('express');
const {
  login, refresh, logout,
  getMe, getProfile,
  updateAvatar, changePassword,
} = require('../controllers/auth.controller');
const { authenticate }  = require('../middleware/auth');
const { authLimiter, uploadLimiter } = require('../middleware/rateLimiter');
const validate          = require('../middleware/validate');
const { loginRules, changePasswordRules, refreshRules } = require('../validators/auth.validator');
const { upload }        = require('../services/upload.service');

const router = Router();

// Multer + Cloudinary for avatar — stored in bereketfikre/admin-avatars/
// We reuse TRUSTED_PARTNERS folder key (small square image, same transform)
// or we can use a dedicated constant — add it inline here via the low-level call.
// Use TESTIMONIALS since it has the same 400×400 face-crop transform.
const uploadAvatar = upload('avatar', 'TESTIMONIALS');

// ── Public ──────────────────────────────────────────────────────────────────
// GET /api/auth/profile  — login page fetches this to show admin avatar
router.get('/profile', getProfile);

// POST /api/auth/login
router.post('/login', authLimiter, loginRules, validate, login);

// POST /api/auth/refresh
router.post('/refresh', authLimiter, refreshRules, validate, refresh);

// ── Protected ───────────────────────────────────────────────────────────────
// POST /api/auth/logout
router.post('/logout', authenticate, logout);

// GET /api/auth/me
router.get('/me', authenticate, getMe);

// PUT /api/auth/avatar  — click-to-change profile picture
router.put('/avatar', authenticate, uploadLimiter, ...uploadAvatar, updateAvatar);

// PUT /api/auth/change-password
router.put('/change-password', authenticate, changePasswordRules, validate, changePassword);

module.exports = router;
