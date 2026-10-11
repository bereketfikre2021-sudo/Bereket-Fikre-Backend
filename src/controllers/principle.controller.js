/**
 * Working Principle Controller
 */
'use strict';

const prisma = require('../config/database');
const { success, created, error, paginated } = require('../utils/response');
const { parsePagination, parseSort } = require('../utils/pagination');
const logger = require('../utils/logger');

// GET /api/principles  (public)
const getPrinciples = async (req, res, next) => {
  try {
    const { page, limit, skip, take } = parsePagination(req.query);
    const orderBy = parseSort(req.query, 'displayOrder', 'asc');
    const where = {};
    if (!req.admin) where.isActive = true;
    const [items, total] = await Promise.all([
      prisma.workingPrinciple.findMany({ where, orderBy, skip, take }),
      prisma.workingPrinciple.count({ where }),
    ]);
    return paginated(res, items, total, page, limit);
  } catch (err) { next(err); }
};

// GET /api/admin/principles/:id
const getPrinciple = async (req, res, next) => {
  try {
    const item = await prisma.workingPrinciple.findUnique({ where: { id: req.params.id } });
    if (!item) return error(res, 'Principle not found.', 404);
    return success(res, item);
  } catch (err) { next(err); }
};

// POST /api/admin/principles  (protected)
const createPrinciple = async (req, res, next) => {
  try {
    const { number, heading, body, displayOrder, isActive } = req.body;
    const item = await prisma.workingPrinciple.create({
      data: {
        number: number.trim(),
        heading: heading.trim(),
        body: body.trim(),
        displayOrder: parseInt(displayOrder, 10) || 0,
        isActive: isActive !== false && isActive !== 'false',
      },
    });
    logger.info(`Principle created: ${item.id}`);
    return created(res, item, 'Principle created successfully');
  } catch (err) { next(err); }
};

// PUT /api/admin/principles/:id  (protected)
const updatePrinciple = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await prisma.workingPrinciple.findUnique({ where: { id } });
    if (!existing) return error(res, 'Principle not found.', 404);
    const { number, heading, body, displayOrder, isActive } = req.body;
    const updated = await prisma.workingPrinciple.update({
      where: { id },
      data: {
        ...(number !== undefined && { number: number.trim() }),
        ...(heading !== undefined && { heading: heading.trim() }),
        ...(body !== undefined && { body: body.trim() }),
        ...(displayOrder !== undefined && { displayOrder: parseInt(displayOrder, 10) || 0 }),
        ...(isActive !== undefined && { isActive: isActive !== false && isActive !== 'false' }),
      },
    });
    return success(res, updated, 'Principle updated successfully');
  } catch (err) { next(err); }
};

// DELETE /api/admin/principles/:id  (protected)
const deletePrinciple = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await prisma.workingPrinciple.findUnique({ where: { id } });
    if (!existing) return error(res, 'Principle not found.', 404);
    await prisma.workingPrinciple.delete({ where: { id } });
    logger.info(`Principle deleted: ${id}`);
    return success(res, null, 'Principle deleted successfully');
  } catch (err) { next(err); }
};

// PUT /api/admin/principles/reorder  (protected)
const reorderPrinciples = async (req, res, next) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items)) return error(res, 'Items array is required.', 400);
    await Promise.all(
      items.map(({ id, displayOrder }) =>
        prisma.workingPrinciple.update({ where: { id }, data: { displayOrder: parseInt(displayOrder, 10) } })
      )
    );
    return success(res, null, 'Principles reordered successfully');
  } catch (err) { next(err); }
};

module.exports = { getPrinciples, getPrinciple, createPrinciple, updatePrinciple, deletePrinciple, reorderPrinciples };
