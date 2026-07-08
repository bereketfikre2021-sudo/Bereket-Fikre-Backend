/**
 * Services Controller
 * Matches the service data structure used in Services.jsx and ServicesModal.jsx
 */

const prisma = require('../config/database');
const { success, created, error, paginated } = require('../utils/response');
const { generateUniqueSlug } = require('../utils/slugify');
const { deleteAsset } = require('../services/upload.service');
const { parsePagination, parseSort } = require('../utils/pagination');
const logger = require('../utils/logger');

// GET /api/services  (public)
// Returns services in the exact structure expected by ServicesModal.jsx
const getServices = async (req, res, next) => {
  try {
    const { page, limit, skip, take } = parsePagination(req.query);
    const orderBy = parseSort(req.query, 'displayOrder', 'asc');

    const where = {};
    if (req.query.isActive !== undefined) where.isActive = req.query.isActive === 'true';
    if (req.query.featured !== undefined) where.featured = req.query.featured === 'true';
    if (req.query.search) {
      where.OR = [
        { title: { contains: req.query.search, mode: 'insensitive' } },
        { category: { contains: req.query.search, mode: 'insensitive' } },
        { shortDescription: { contains: req.query.search, mode: 'insensitive' } },
      ];
    }

    // Public endpoint: only return active services by default
    if (req.query.isActive === undefined && !req.admin) {
      where.isActive = true;
    }

    const [services, total] = await Promise.all([
      prisma.service.findMany({
        where,
        include: {
          galleryImages: { orderBy: { order: 'asc' } },
          processList: { orderBy: { stepNumber: 'asc' } },
        },
        orderBy,
        skip,
        take,
      }),
      prisma.service.count({ where }),
    ]);

    return paginated(res, services, total, page, limit);
  } catch (err) {
    next(err);
  }
};

// GET /api/services/:idOrSlug  (public)
const getService = async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;

    const service = await prisma.service.findFirst({
      where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }] },
      include: {
        galleryImages: { orderBy: { order: 'asc' } },
        processList: { orderBy: { stepNumber: 'asc' } },
      },
    });

    if (!service) return error(res, 'Service not found.', 404);

    return success(res, service);
  } catch (err) {
    next(err);
  }
};

// POST /api/admin/services  (protected)
const createService = async (req, res, next) => {
  try {
    const {
      serviceNumber, title, category, iconSvg, iconClass,
      shortDescription, fullDescription, bulletPoints, technologies,
      ctaText, ctaLink, displayOrder, featured, isActive,
      seoTitle, seoDescription, type, deliveryTime,
    } = req.body;

    const slug = await generateUniqueSlug(title, 'service');

    let featuredImage = null;
    let featuredImagePublicId = null;
    if (req.file) {
      featuredImage = req.file.path;
      featuredImagePublicId = req.file.filename;
    }

    const service = await prisma.service.create({
      data: {
        serviceNumber: serviceNumber || '01',
        title: title.trim(),
        slug,
        category: category.trim(),
        iconSvg: iconSvg || null,
        iconClass: iconClass || null,
        shortDescription: shortDescription.trim(),
        fullDescription: fullDescription?.trim() || null,
        bulletPoints: Array.isArray(bulletPoints) ? bulletPoints : [],
        featuredImage,
        featuredImagePublicId,
        technologies: Array.isArray(technologies) ? technologies : [],
        ctaText: ctaText || 'Request a Quote',
        ctaLink: ctaLink || '#contact',
        displayOrder: parseInt(displayOrder, 10) || 0,
        featured: featured === true || featured === 'true',
        isActive: isActive !== false && isActive !== 'false',
        seoTitle: seoTitle || null,
        seoDescription: seoDescription || null,
        type: type || null,
        deliveryTime: deliveryTime || null,
      },
      include: {
        galleryImages: true,
        processList: { orderBy: { stepNumber: 'asc' } },
      },
    });

    logger.info(`Service created: ${service.id} - ${service.title}`);
    return created(res, service, 'Service created successfully');
  } catch (err) {
    next(err);
  }
};

// PUT /api/admin/services/:id  (protected)
const updateService = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await prisma.service.findUnique({ where: { id } });
    if (!existing) return error(res, 'Service not found.', 404);

    const {
      serviceNumber, title, category, iconSvg, iconClass,
      shortDescription, fullDescription, bulletPoints, technologies,
      ctaText, ctaLink, displayOrder, featured, isActive,
      seoTitle, seoDescription, type, deliveryTime,
    } = req.body;

    let slug = existing.slug;
    if (title && title.trim() !== existing.title) {
      slug = await generateUniqueSlug(title, 'service', id);
    }

    let featuredImage = existing.featuredImage;
    let featuredImagePublicId = existing.featuredImagePublicId;
    if (req.file) {
      if (existing.featuredImagePublicId) {
        await deleteAsset(existing.featuredImagePublicId);
      }
      featuredImage = req.file.path;
      featuredImagePublicId = req.file.filename;
    }

    const updated = await prisma.service.update({
      where: { id },
      data: {
        ...(serviceNumber && { serviceNumber }),
        ...(title && { title: title.trim(), slug }),
        ...(category && { category: category.trim() }),
        ...(iconSvg !== undefined && { iconSvg: iconSvg || null }),
        ...(iconClass !== undefined && { iconClass: iconClass || null }),
        ...(shortDescription && { shortDescription: shortDescription.trim() }),
        ...(fullDescription !== undefined && { fullDescription: fullDescription?.trim() || null }),
        ...(bulletPoints !== undefined && { bulletPoints: Array.isArray(bulletPoints) ? bulletPoints : [] }),
        featuredImage,
        featuredImagePublicId,
        ...(technologies !== undefined && { technologies: Array.isArray(technologies) ? technologies : [] }),
        ...(ctaText !== undefined && { ctaText }),
        ...(ctaLink !== undefined && { ctaLink }),
        ...(displayOrder !== undefined && { displayOrder: parseInt(displayOrder, 10) || 0 }),
        ...(featured !== undefined && { featured: featured === true || featured === 'true' }),
        ...(isActive !== undefined && { isActive: isActive !== false && isActive !== 'false' }),
        ...(seoTitle !== undefined && { seoTitle: seoTitle || null }),
        ...(seoDescription !== undefined && { seoDescription: seoDescription || null }),
        ...(type !== undefined && { type: type || null }),
        ...(deliveryTime !== undefined && { deliveryTime: deliveryTime || null }),
      },
      include: {
        galleryImages: { orderBy: { order: 'asc' } },
        processList: { orderBy: { stepNumber: 'asc' } },
      },
    });

    return success(res, updated, 'Service updated successfully');
  } catch (err) {
    next(err);
  }
};

// DELETE /api/admin/services/:id  (protected)
const deleteService = async (req, res, next) => {
  try {
    const { id } = req.params;

    const service = await prisma.service.findUnique({
      where: { id },
      include: { galleryImages: true },
    });
    if (!service) return error(res, 'Service not found.', 404);

    const deleteOps = [];
    if (service.featuredImagePublicId) {
      deleteOps.push(deleteAsset(service.featuredImagePublicId));
    }
    service.galleryImages.forEach((img) => {
      deleteOps.push(deleteAsset(img.publicId));
    });
    await Promise.allSettled(deleteOps);

    await prisma.service.delete({ where: { id } });

    logger.info(`Service deleted: ${id}`);
    return success(res, null, 'Service deleted successfully');
  } catch (err) {
    next(err);
  }
};

// PUT /api/admin/services/:id/process  (protected) — replaces all process steps
const updateServiceProcess = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { steps } = req.body;

    const service = await prisma.service.findUnique({ where: { id } });
    if (!service) return error(res, 'Service not found.', 404);

    // Delete existing and recreate
    await prisma.serviceProcess.deleteMany({ where: { serviceId: id } });
    await prisma.serviceProcess.createMany({
      data: steps.map((step) => ({
        serviceId: id,
        stepNumber: step.stepNumber,
        title: step.title.trim(),
        description: step.description.trim(),
      })),
    });

    const updated = await prisma.service.findUnique({
      where: { id },
      include: { processList: { orderBy: { stepNumber: 'asc' } } },
    });

    return success(res, updated.processList, 'Process steps updated');
  } catch (err) {
    next(err);
  }
};

// POST /api/admin/services/:id/gallery  (protected)
const addGalleryImage = async (req, res, next) => {
  try {
    const { id } = req.params;

    const service = await prisma.service.findUnique({ where: { id } });
    if (!service) return error(res, 'Service not found.', 404);

    if (!req.file) return error(res, 'No image file uploaded.', 400);

    const { altText, order } = req.body;
    const highest = await prisma.serviceImage.findFirst({
      where: { serviceId: id },
      orderBy: { order: 'desc' },
    });

    const image = await prisma.serviceImage.create({
      data: {
        serviceId: id,
        url: req.file.path,
        publicId: req.file.filename,
        altText: altText || null,
        order: order !== undefined ? parseInt(order, 10) : (highest?.order ?? -1) + 1,
      },
    });

    return created(res, image, 'Gallery image added');
  } catch (err) {
    next(err);
  }
};

// DELETE /api/admin/services/:id/gallery/:imageId  (protected)
const deleteGalleryImage = async (req, res, next) => {
  try {
    const { id, imageId } = req.params;

    const image = await prisma.serviceImage.findFirst({
      where: { id: imageId, serviceId: id },
    });
    if (!image) return error(res, 'Image not found.', 404);

    await deleteAsset(image.publicId);
    await prisma.serviceImage.delete({ where: { id: imageId } });

    return success(res, null, 'Gallery image deleted');
  } catch (err) {
    next(err);
  }
};

// PUT /api/admin/services/reorder
const reorderServices = async (req, res, next) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items)) return error(res, 'Items array is required.', 400);

    await Promise.all(
      items.map(({ id, displayOrder }) =>
        prisma.service.update({ where: { id }, data: { displayOrder: parseInt(displayOrder, 10) } })
      )
    );

    return success(res, null, 'Services reordered successfully');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getServices, getService,
  createService, updateService, deleteService,
  updateServiceProcess,
  addGalleryImage, deleteGalleryImage,
  reorderServices,
};
