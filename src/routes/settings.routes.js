/**
 * Site Settings Routes
 *
 * Public:
 *   GET  /api/site-settings
 *
 * Protected (admin):
 *   PUT  /api/admin/site-settings
 *   PUT  /api/admin/site-settings/hero-image
 *   PUT  /api/admin/site-settings/about-image
 */

'use strict';

const { Router } = require('express');
const {
  getSettings,
  updateSettings,
  updateHeroImage,
  updateAboutImage,
} = require('../controllers/settings.controller');
const { authenticate } = require('../middleware/auth');
const { upload } = require('../services/upload.service');

const router = Router();

const uploadSiteImage = upload('image', 'SITE_CONTENT');

// ── Public ───────────────────────────────────────────────────────────────────
router.get('/', getSettings);

// ── Protected ────────────────────────────────────────────────────────────────
router.put('/', authenticate, updateSettings);
router.put('/hero-image',  authenticate, ...uploadSiteImage, updateHeroImage);
router.put('/about-image', authenticate, ...uploadSiteImage, updateAboutImage);

module.exports = router;
