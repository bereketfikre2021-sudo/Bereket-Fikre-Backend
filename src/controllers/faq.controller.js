/**
 * FAQ Controller
 */

const prisma = require('../config/database');
const { success, created, error, paginated } = require('../utils/response');
const { parsePagination, parseSort } = require('../utils/pagination');
const logger = require('../utils/logger');

// GET /api/faqs  (public)
const getFaqs = async (req, res, next) => {
  try {
    const { page, limit, skip, take } = parsePagination(req.query);
    const orderBy = parseSort(req.query, 'displayOrder', 'asc');

    const where = {};
    if (!req.admin) where.isActive = true;
    if (req.query.isActive !== undefined) where.isActive = req.query.isActive === 'true';
    if (req.query.category) where.category = { contains: req.query.category, mode: 'insensitive' };
    if (req.query.search) {
      where.OR = [
        { question: { contains: req.query.search, mode: 'insensitive' } },
        { answer: { contains: req.query.search, mode: 'insensitive' } },
      ];
    }

    const [faqs, total] = await Promise.all([
      prisma.faq.findMany({ where, orderBy, skip, take }),
      prisma.faq.count({ where }),
    ]);

    return paginated(res, faqs, total, page, limit);
  } catch (err) {
    next(err);
  }
};

// GET /api/faqs/:id
const getFaq = async (req, res, next) => {
  try {
    const faq = await prisma.faq.findUnique({ where: { id: req.params.id } });
    if (!faq) return error(res, 'FAQ not found.', 404);
    return success(res, faq);
  } catch (err) {
    next(err);
  }
};

// POST /api/admin/faqs  (protected)
const createFaq = async (req, res, next) => {
  try {
    const { question, answer, category, displayOrder, isActive } = req.body;

    const faq = await prisma.faq.create({
      data: {
        question: question.trim(),
        answer: answer.trim(),
        category: category?.trim() || 'General',
        displayOrder: parseInt(displayOrder, 10) || 0,
        isActive: isActive !== false && isActive !== 'false',
      },
    });

    logger.info(`FAQ created: ${faq.id}`);
    req.logActivity('CREATED', 'FAQ', faq.id, faq.question.substring(0,50));
    return created(res, faq, 'FAQ created successfully');
  } catch (err) {
    next(err);
  }
};

// PUT /api/admin/faqs/:id  (protected)
const updateFaq = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await prisma.faq.findUnique({ where: { id } });
    if (!existing) return error(res, 'FAQ not found.', 404);

    const { question, answer, category, displayOrder, isActive } = req.body;

    const updated = await prisma.faq.update({
      where: { id },
      data: {
        ...(question && { question: question.trim() }),
        ...(answer && { answer: answer.trim() }),
        ...(category !== undefined && { category: category?.trim() || 'General' }),
        ...(displayOrder !== undefined && { displayOrder: parseInt(displayOrder, 10) || 0 }),
        ...(isActive !== undefined && { isActive: isActive !== false && isActive !== 'false' }),
      },
    });

    req.logActivity('UPDATED', 'FAQ', updated.id, updated.question.substring(0,50));

    return success(res, updated, 'FAQ updated successfully');
  } catch (err) {
    next(err);
  }
};

// DELETE /api/admin/faqs/:id  (protected)
const deleteFaq = async (req, res, next) => {
  try {
    const { id } = req.params;

    const faq = await prisma.faq.findUnique({ where: { id } });
    if (!faq) return error(res, 'FAQ not found.', 404);

    await prisma.faq.delete({ where: { id } });

    logger.info(`FAQ deleted: ${id}`);
    req.logActivity('DELETED', 'FAQ', id, faq.question.substring(0,50));
    return success(res, null, 'FAQ deleted successfully');
  } catch (err) {
    next(err);
  }
};

// PUT /api/admin/faqs/reorder  (protected)
const reorderFaqs = async (req, res, next) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items)) return error(res, 'Items array is required.', 400);

    await Promise.all(
      items.map(({ id, displayOrder }) =>
        prisma.faq.update({ where: { id }, data: { displayOrder: parseInt(displayOrder, 10) } })
      )
    );

    return success(res, null, 'FAQs reordered successfully');
  } catch (err) {
    next(err);
  }
};

module.exports = { getFaqs, getFaq, createFaq, updateFaq, deleteFaq, reorderFaqs };
