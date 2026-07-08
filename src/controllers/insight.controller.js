/**
 * Insights Controller
 * Handles both Case Studies and Blog Posts
 */

const prisma = require('../config/database');
const { success, created, error, paginated } = require('../utils/response');
const { generateUniqueSlug } = require('../utils/slugify');
const { deleteAsset } = require('../services/upload.service');
const { parsePagination, parseSort } = require('../utils/pagination');
const logger = require('../utils/logger');

/**
 * Auto-calculate reading time from content (approx 200 words/min)
 */
const calcReadingTime = (content) => {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
};

// GET /api/insights  (public)
const getInsights = async (req, res, next) => {
  try {
    const { page, limit, skip, take } = parsePagination(req.query);
    const orderBy = parseSort(req.query, 'publishDate', 'desc');

    const where = {};
    if (req.query.type) where.type = req.query.type; // CASE_STUDY | BLOG_POST
    if (req.query.status) where.status = req.query.status;
    if (req.query.category) where.category = { contains: req.query.category, mode: 'insensitive' };
    if (req.query.tag) where.tags = { has: req.query.tag };
    if (req.query.search) {
      where.OR = [
        { title: { contains: req.query.search, mode: 'insensitive' } },
        { excerpt: { contains: req.query.search, mode: 'insensitive' } },
        { category: { contains: req.query.search, mode: 'insensitive' } },
      ];
    }

    // Public: only published by default
    if (!req.query.status && !req.admin) {
      where.status = 'PUBLISHED';
    }

    const [insights, total] = await Promise.all([
      prisma.insight.findMany({
        where,
        orderBy,
        skip,
        take,
        select: {
          id: true, type: true, title: true, slug: true,
          coverImage: true, excerpt: true, category: true,
          tags: true, author: true, readingTime: true,
          publishDate: true, status: true, createdAt: true,
        },
      }),
      prisma.insight.count({ where }),
    ]);

    return paginated(res, insights, total, page, limit);
  } catch (err) {
    next(err);
  }
};

// GET /api/insights/:idOrSlug  (public)
const getInsight = async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;

    const insight = await prisma.insight.findFirst({
      where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }] },
    });

    if (!insight) return error(res, 'Insight not found.', 404);

    return success(res, insight);
  } catch (err) {
    next(err);
  }
};

// POST /api/admin/insights  (protected)
const createInsight = async (req, res, next) => {
  try {
    const {
      type, title, excerpt, content, category, tags,
      author, readingTime, publishDate, status,
      seoTitle, seoDescription,
    } = req.body;

    const slug = await generateUniqueSlug(title, 'insight');

    let coverImage = null;
    let coverPublicId = null;
    if (req.file) {
      coverImage = req.file.path;
      coverPublicId = req.file.filename;
    }

    const calculatedReadingTime = readingTime
      ? parseInt(readingTime, 10)
      : calcReadingTime(content);

    const insight = await prisma.insight.create({
      data: {
        type,
        title: title.trim(),
        slug,
        coverImage,
        coverPublicId,
        excerpt: excerpt.trim(),
        content: content.trim(),
        category: category.trim(),
        tags: Array.isArray(tags) ? tags : [],
        author: author?.trim() || 'Bereket Fikre',
        readingTime: calculatedReadingTime,
        publishDate: publishDate ? new Date(publishDate) : null,
        status: status || 'DRAFT',
        seoTitle: seoTitle || null,
        seoDescription: seoDescription || null,
      },
    });

    logger.info(`Insight created: ${insight.id} - ${insight.title}`);
    return created(res, insight, 'Insight created successfully');
  } catch (err) {
    next(err);
  }
};

// PUT /api/admin/insights/:id  (protected)
const updateInsight = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await prisma.insight.findUnique({ where: { id } });
    if (!existing) return error(res, 'Insight not found.', 404);

    const {
      type, title, excerpt, content, category, tags,
      author, readingTime, publishDate, status,
      seoTitle, seoDescription,
    } = req.body;

    let slug = existing.slug;
    if (title && title.trim() !== existing.title) {
      slug = await generateUniqueSlug(title, 'insight', id);
    }

    let coverImage = existing.coverImage;
    let coverPublicId = existing.coverPublicId;
    if (req.file) {
      if (existing.coverPublicId) {
        await deleteAsset(existing.coverPublicId);
      }
      coverImage = req.file.path;
      coverPublicId = req.file.filename;
    }

    const calculatedReadingTime = readingTime
      ? parseInt(readingTime, 10)
      : content ? calcReadingTime(content) : existing.readingTime;

    const updated = await prisma.insight.update({
      where: { id },
      data: {
        ...(type && { type }),
        ...(title && { title: title.trim(), slug }),
        coverImage,
        coverPublicId,
        ...(excerpt && { excerpt: excerpt.trim() }),
        ...(content && { content: content.trim() }),
        ...(category && { category: category.trim() }),
        ...(tags !== undefined && { tags: Array.isArray(tags) ? tags : [] }),
        ...(author !== undefined && { author: author?.trim() || 'Bereket Fikre' }),
        readingTime: calculatedReadingTime,
        publishDate: publishDate !== undefined ? (publishDate ? new Date(publishDate) : null) : existing.publishDate,
        ...(status && { status }),
        ...(seoTitle !== undefined && { seoTitle: seoTitle || null }),
        ...(seoDescription !== undefined && { seoDescription: seoDescription || null }),
      },
    });

    return success(res, updated, 'Insight updated successfully');
  } catch (err) {
    next(err);
  }
};

// DELETE /api/admin/insights/:id  (protected)
const deleteInsight = async (req, res, next) => {
  try {
    const { id } = req.params;

    const insight = await prisma.insight.findUnique({ where: { id } });
    if (!insight) return error(res, 'Insight not found.', 404);

    if (insight.coverPublicId) {
      await deleteAsset(insight.coverPublicId);
    }

    await prisma.insight.delete({ where: { id } });

    logger.info(`Insight deleted: ${id}`);
    return success(res, null, 'Insight deleted successfully');
  } catch (err) {
    next(err);
  }
};

module.exports = { getInsights, getInsight, createInsight, updateInsight, deleteInsight };
