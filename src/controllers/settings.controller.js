/**
 * Site Settings Controller
 *
 * Manages the singleton SiteSettings row that drives the portfolio
 * hero and about section content (text + images).
 *
 * GET  /api/site-settings          — public, returns all settings
 * PUT  /api/admin/site-settings    — protected, updates text fields
 * PUT  /api/admin/site-settings/hero-image   — protected, uploads hero image
 * PUT  /api/admin/site-settings/about-image  — protected, uploads about image
 */

'use strict';

const prisma = require('../config/database');
const { success, error } = require('../utils/response');
const { deleteAsset } = require('../services/upload.service');
const logger = require('../utils/logger');

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Upsert the singleton row (id = "singleton") */
const upsert = (data) =>
  prisma.siteSettings.upsert({
    where: { id: 'singleton' },
    create: { id: 'singleton', ...data },
    update: data,
  });

/** Fetch (or create) the singleton row */
const fetchSettings = () =>
  prisma.siteSettings.upsert({
    where: { id: 'singleton' },
    create: { id: 'singleton' },
    update: {},
  });

// ─── Controllers ─────────────────────────────────────────────────────────────

// GET /api/site-settings
const getSettings = async (req, res, next) => {
  try {
    const settings = await fetchSettings();
    return success(res, settings);
  } catch (err) {
    next(err);
  }
};

// PUT /api/admin/site-settings  — update text fields
const updateSettings = async (req, res, next) => {
  try {
    const {
      heroLine1Prefix,
      heroLine1Highlight,
      heroLine2,
      statProjectsValue,
      statProjectsLabel,
      statClientsValue,
      statClientsLabel,
      statYearsValue,
      statYearsLabel,
      aboutHeading,
      aboutBodyDesktop,
      aboutBodyMobile,
    } = req.body;

    // Build update object — only include provided fields
    const data = {};
    if (heroLine1Prefix    !== undefined) data.heroLine1Prefix    = heroLine1Prefix;
    if (heroLine1Highlight !== undefined) data.heroLine1Highlight = heroLine1Highlight;
    if (heroLine2          !== undefined) data.heroLine2          = heroLine2;
    if (statProjectsValue  !== undefined) data.statProjectsValue  = statProjectsValue;
    if (statProjectsLabel  !== undefined) data.statProjectsLabel  = statProjectsLabel;
    if (statClientsValue   !== undefined) data.statClientsValue   = statClientsValue;
    if (statClientsLabel   !== undefined) data.statClientsLabel   = statClientsLabel;
    if (statYearsValue     !== undefined) data.statYearsValue     = statYearsValue;
    if (statYearsLabel     !== undefined) data.statYearsLabel     = statYearsLabel;
    if (aboutHeading       !== undefined) data.aboutHeading       = aboutHeading;
    if (aboutBodyDesktop   !== undefined) data.aboutBodyDesktop   = aboutBodyDesktop;
    if (aboutBodyMobile    !== undefined) data.aboutBodyMobile    = aboutBodyMobile;

    const settings = await upsert(data);

    logger.info(`Site settings updated by ${req.admin?.email}`);
    return success(res, settings, 'Site settings updated');
  } catch (err) {
    next(err);
  }
};

// PUT /api/admin/site-settings/hero-image
const updateHeroImage = async (req, res, next) => {
  try {
    if (!req.file) return error(res, 'No image file provided.', 400);

    const existing = await fetchSettings();

    // Delete old hero image from Cloudinary if one exists
    if (existing.heroImagePublicId) {
      await deleteAsset(existing.heroImagePublicId, 'image');
    }

    const settings = await upsert({
      heroImage:         req.file.path,      // Cloudinary secure_url
      heroImagePublicId: req.file.filename,  // Cloudinary public_id
    });

    logger.info(`Hero image updated by ${req.admin?.email}`);
    return success(res, settings, 'Hero image updated');
  } catch (err) {
    next(err);
  }
};

// PUT /api/admin/site-settings/about-image
const updateAboutImage = async (req, res, next) => {
  try {
    if (!req.file) return error(res, 'No image file provided.', 400);

    const existing = await fetchSettings();

    // Delete old about image from Cloudinary if one exists
    if (existing.aboutImagePublicId) {
      await deleteAsset(existing.aboutImagePublicId, 'image');
    }

    const settings = await upsert({
      aboutImage:         req.file.path,
      aboutImagePublicId: req.file.filename,
    });

    logger.info(`About image updated by ${req.admin?.email}`);
    return success(res, settings, 'About image updated');
  } catch (err) {
    next(err);
  }
};

module.exports = { getSettings, updateSettings, updateHeroImage, updateAboutImage };
