/**
 * Trusted Partners & Testimonials Controller
 */

const prisma = require('../config/database');
const { success, created, error, paginated } = require('../utils/response');
const { deleteAsset } = require('../services/upload.service');
const { parsePagination, parseSort } = require('../utils/pagination');
const logger = require('../utils/logger');

// ============================================================
// TRUSTED PARTNERS
// ============================================================

// GET /api/partners  (public)
const getPartners = async (req, res, next) => {
  try {
    const { page, limit, skip, take } = parsePagination(req.query);
    const orderBy = parseSort(req.query, 'displayOrder', 'asc');

    const where = {};
    if (!req.admin) where.isActive = true; // public: only active
    if (req.query.isActive !== undefined) where.isActive = req.query.isActive === 'true';

    const [partners, total] = await Promise.all([
      prisma.trustedPartner.findMany({ where, orderBy, skip, take }),
      prisma.trustedPartner.count({ where }),
    ]);

    return paginated(res, partners, total, page, limit);
  } catch (err) {
    next(err);
  }
};

// GET /api/partners/:id
const getPartner = async (req, res, next) => {
  try {
    const partner = await prisma.trustedPartner.findUnique({ where: { id: req.params.id } });
    if (!partner) return error(res, 'Partner not found.', 404);
    return success(res, partner);
  } catch (err) {
    next(err);
  }
};

// POST /api/admin/partners  (protected)
const createPartner = async (req, res, next) => {
  try {
    const { companyName, website, displayOrder, isActive } = req.body;

    let logo = null;
    let logoPublicId = null;
    if (req.file) {
      logo = req.file.path;
      logoPublicId = req.file.filename;
    }

    const partner = await prisma.trustedPartner.create({
      data: {
        companyName: companyName.trim(),
        logo,
        logoPublicId,
        website: website || null,
        displayOrder: parseInt(displayOrder, 10) || 0,
        isActive: isActive !== false && isActive !== 'false',
      },
    });

    logger.info(`Partner created: ${partner.id} - ${partner.companyName}`);
    return created(res, partner, 'Partner created successfully');
  } catch (err) {
    next(err);
  }
};

// PUT /api/admin/partners/:id  (protected)
const updatePartner = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await prisma.trustedPartner.findUnique({ where: { id } });
    if (!existing) return error(res, 'Partner not found.', 404);

    const { companyName, website, displayOrder, isActive } = req.body;

    let logo = existing.logo;
    let logoPublicId = existing.logoPublicId;
    if (req.file) {
      if (existing.logoPublicId) await deleteAsset(existing.logoPublicId);
      logo = req.file.path;
      logoPublicId = req.file.filename;
    }

    const updated = await prisma.trustedPartner.update({
      where: { id },
      data: {
        ...(companyName && { companyName: companyName.trim() }),
        logo,
        logoPublicId,
        website: website !== undefined ? (website || null) : existing.website,
        ...(displayOrder !== undefined && { displayOrder: parseInt(displayOrder, 10) || 0 }),
        ...(isActive !== undefined && { isActive: isActive !== false && isActive !== 'false' }),
      },
    });

    return success(res, updated, 'Partner updated successfully');
  } catch (err) {
    next(err);
  }
};

// DELETE /api/admin/partners/:id  (protected)
const deletePartner = async (req, res, next) => {
  try {
    const { id } = req.params;

    const partner = await prisma.trustedPartner.findUnique({ where: { id } });
    if (!partner) return error(res, 'Partner not found.', 404);

    if (partner.logoPublicId) await deleteAsset(partner.logoPublicId);
    await prisma.trustedPartner.delete({ where: { id } });

    logger.info(`Partner deleted: ${id}`);
    return success(res, null, 'Partner deleted successfully');
  } catch (err) {
    next(err);
  }
};

// PUT /api/admin/partners/reorder
const reorderPartners = async (req, res, next) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items)) return error(res, 'Items array is required.', 400);

    await Promise.all(
      items.map(({ id, displayOrder }) =>
        prisma.trustedPartner.update({ where: { id }, data: { displayOrder: parseInt(displayOrder, 10) } })
      )
    );

    return success(res, null, 'Partners reordered');
  } catch (err) {
    next(err);
  }
};

// ============================================================
// TESTIMONIALS
// ============================================================

// GET /api/testimonials  (public)
const getTestimonials = async (req, res, next) => {
  try {
    const { page, limit, skip, take } = parsePagination(req.query);
    const orderBy = parseSort(req.query, 'displayOrder', 'asc');

    const where = {};
    if (!req.admin) where.isActive = true;
    if (req.query.isActive !== undefined) where.isActive = req.query.isActive === 'true';
    if (req.query.featured !== undefined) where.featured = req.query.featured === 'true';

    const [testimonials, total] = await Promise.all([
      prisma.testimonial.findMany({ where, orderBy, skip, take }),
      prisma.testimonial.count({ where }),
    ]);

    return paginated(res, testimonials, total, page, limit);
  } catch (err) {
    next(err);
  }
};

// GET /api/testimonials/:id
const getTestimonial = async (req, res, next) => {
  try {
    const t = await prisma.testimonial.findUnique({ where: { id: req.params.id } });
    if (!t) return error(res, 'Testimonial not found.', 404);
    return success(res, t);
  } catch (err) {
    next(err);
  }
};

// POST /api/admin/testimonials  (protected)
const createTestimonial = async (req, res, next) => {
  try {
    const {
      clientName, company, position, testimonial,
      rating, featured, displayOrder, isActive,
    } = req.body;

    let profileImage = null;
    let profilePublicId = null;
    if (req.file) {
      profileImage = req.file.path;
      profilePublicId = req.file.filename;
    }

    const t = await prisma.testimonial.create({
      data: {
        clientName: clientName.trim(),
        company: company?.trim() || null,
        position: position?.trim() || null,
        profileImage,
        profilePublicId,
        testimonial: testimonial.trim(),
        rating: parseInt(rating, 10) || 5,
        featured: featured === true || featured === 'true',
        displayOrder: parseInt(displayOrder, 10) || 0,
        isActive: isActive !== false && isActive !== 'false',
      },
    });

    logger.info(`Testimonial created: ${t.id}`);
    return created(res, t, 'Testimonial created successfully');
  } catch (err) {
    next(err);
  }
};

// PUT /api/admin/testimonials/:id  (protected)
const updateTestimonial = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await prisma.testimonial.findUnique({ where: { id } });
    if (!existing) return error(res, 'Testimonial not found.', 404);

    const {
      clientName, company, position, testimonial,
      rating, featured, displayOrder, isActive,
    } = req.body;

    let profileImage = existing.profileImage;
    let profilePublicId = existing.profilePublicId;
    if (req.file) {
      if (existing.profilePublicId) await deleteAsset(existing.profilePublicId);
      profileImage = req.file.path;
      profilePublicId = req.file.filename;
    }

    const updated = await prisma.testimonial.update({
      where: { id },
      data: {
        ...(clientName && { clientName: clientName.trim() }),
        company: company !== undefined ? (company?.trim() || null) : existing.company,
        position: position !== undefined ? (position?.trim() || null) : existing.position,
        profileImage,
        profilePublicId,
        ...(testimonial && { testimonial: testimonial.trim() }),
        ...(rating !== undefined && { rating: parseInt(rating, 10) || 5 }),
        ...(featured !== undefined && { featured: featured === true || featured === 'true' }),
        ...(displayOrder !== undefined && { displayOrder: parseInt(displayOrder, 10) || 0 }),
        ...(isActive !== undefined && { isActive: isActive !== false && isActive !== 'false' }),
      },
    });

    return success(res, updated, 'Testimonial updated successfully');
  } catch (err) {
    next(err);
  }
};

// DELETE /api/admin/testimonials/:id  (protected)
const deleteTestimonial = async (req, res, next) => {
  try {
    const { id } = req.params;

    const t = await prisma.testimonial.findUnique({ where: { id } });
    if (!t) return error(res, 'Testimonial not found.', 404);

    if (t.profilePublicId) await deleteAsset(t.profilePublicId);
    await prisma.testimonial.delete({ where: { id } });

    logger.info(`Testimonial deleted: ${id}`);
    return success(res, null, 'Testimonial deleted successfully');
  } catch (err) {
    next(err);
  }
};

// PUT /api/admin/testimonials/reorder
const reorderTestimonials = async (req, res, next) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items)) return error(res, 'Items array is required.', 400);

    await Promise.all(
      items.map(({ id, displayOrder }) =>
        prisma.testimonial.update({ where: { id }, data: { displayOrder: parseInt(displayOrder, 10) } })
      )
    );

    return success(res, null, 'Testimonials reordered');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getPartners, getPartner, createPartner, updatePartner, deletePartner, reorderPartners,
  getTestimonials, getTestimonial, createTestimonial, updateTestimonial, deleteTestimonial, reorderTestimonials,
};
