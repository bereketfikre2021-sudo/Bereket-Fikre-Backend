/**
 * Slug generation utility
 */

const slugifyLib = require('slugify');
const prisma = require('../config/database');

/**
 * Generate a URL-safe slug from a string
 */
const generateSlug = (text) => {
  return slugifyLib(text, {
    lower: true,
    strict: true,
    trim: true,
  });
};

/**
 * Generate a unique slug for a Prisma model
 * Appends -2, -3, etc. if the slug already exists
 * @param {string} text - Source text
 * @param {string} model - Prisma model name (e.g. 'project')
 * @param {string|null} excludeId - ID to exclude (for updates)
 */
const generateUniqueSlug = async (text, model, excludeId = null) => {
  const base = generateSlug(text);
  let slug = base;
  let count = 1;

  while (true) {
    const where = { slug };
    if (excludeId) where.id = { not: excludeId };

    const existing = await prisma[model].findFirst({ where });
    if (!existing) break;

    count++;
    slug = `${base}-${count}`;
  }

  return slug;
};

module.exports = { generateSlug, generateUniqueSlug };
