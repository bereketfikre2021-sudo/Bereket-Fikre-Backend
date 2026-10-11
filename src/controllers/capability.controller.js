/**
 * Capability Controller
 */
'use strict';

const prisma = require('../config/database');
const { success, created, error, paginated } = require('../utils/response');
const { parsePagination, parseSort } = require('../utils/pagination');
const logger = require('../utils/logger');

// GET /api/capabilities  (public)
const getCapabilities = async (req, res, next) => {
  try {
    const { page, limit, skip, take } = parsePagination(req.query);
    const orderBy = parseSort(req.query, 'displayOrder', 'asc');
    const where = {};
    if (!req.admin) where.isActive = true;
    const [items, total] = await Promise.all([
      prisma.capability.findMany({ where, orderBy, skip, take }),
      prisma.capability.count({ where }),
    ]);
    return paginated(res, items, total, page, limit);
  } catch (err) { next(err); }
};

// GET /api/admin/capabilities/:id
const getCapability = async (req, res, next) => {
  try {
    const item = await prisma.capability.findUnique({ where: { id: req.params.id } });
    if (!item) return error(res, 'Capability not found.', 404);
    return success(res, item);
  } catch (err) { next(err); }
};

// POST /api/admin/capabilities  (protected)
const createCapability = async (req, res, next) => {
  try {
    const { pillar, label, headline, description, displayOrder, isActive } = req.body;
    const item = await prisma.capability.create({
      data: {
        pillar: pillar.trim().toUpperCase(),
        label: label.trim(),
        headline: headline.trim(),
        description: description.trim(),
        displayOrder: parseInt(displayOrder, 10) || 0,
        isActive: isActive !== false && isActive !== 'false',
      },
    });
    logger.info(`Capability created: ${item.id}`);
    return created(res, item, 'Capability created successfully');
  } catch (err) { next(err); }
};

// PUT /api/admin/capabilities/:id  (protected)
const updateCapability = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await prisma.capability.findUnique({ where: { id } });
    if (!existing) return error(res, 'Capability not found.', 404);
    const { pillar, label, headline, description, displayOrder, isActive } = req.body;
    const updated = await prisma.capability.update({
      where: { id },
      data: {
        ...(pillar !== undefined && { pillar: pillar.trim().toUpperCase() }),
        ...(label !== undefined && { label: label.trim() }),
        ...(headline !== undefined && { headline: headline.trim() }),
        ...(description !== undefined && { description: description.trim() }),
        ...(displayOrder !== undefined && { displayOrder: parseInt(displayOrder, 10) || 0 }),
        ...(isActive !== undefined && { isActive: isActive !== false && isActive !== 'false' }),
      },
    });
    return success(res, updated, 'Capability updated successfully');
  } catch (err) { next(err); }
};

// DELETE /api/admin/capabilities/:id  (protected)
const deleteCapability = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await prisma.capability.findUnique({ where: { id } });
    if (!existing) return error(res, 'Capability not found.', 404);
    await prisma.capability.delete({ where: { id } });
    logger.info(`Capability deleted: ${id}`);
    return success(res, null, 'Capability deleted successfully');
  } catch (err) { next(err); }
};

// PUT /api/admin/capabilities/reorder  (protected)
const reorderCapabilities = async (req, res, next) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items)) return error(res, 'Items array is required.', 400);
    await Promise.all(
      items.map(({ id, displayOrder }) =>
        prisma.capability.update({ where: { id }, data: { displayOrder: parseInt(displayOrder, 10) } })
      )
    );
    return success(res, null, 'Capabilities reordered successfully');
  } catch (err) { next(err); }
};

module.exports = { getCapabilities, getCapability, createCapability, updateCapability, deleteCapability, reorderCapabilities };
