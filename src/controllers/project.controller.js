/**
 * Featured Projects Controller
 */

const prisma = require('../config/database');
const { success, created, error, paginated } = require('../utils/response');
const { generateUniqueSlug } = require('../utils/slugify');
const { deleteAsset } = require('../services/upload.service');
const { parsePagination, parseSort } = require('../utils/pagination');
const logger = require('../utils/logger');
const { resolveContentAction } = require('../utils/activityLog');

// GET /api/projects  (public)
const getProjects = async (req, res, next) => {
  try {
    const { page, limit, skip, take } = parsePagination(req.query);
    const orderBy = parseSort(req.query, 'displayOrder', 'asc');

    const where = {};
    if (req.query.status) where.status = req.query.status;
    if (req.query.featured !== undefined) where.featured = req.query.featured === 'true';

    // Admin filter tabs — maps to seeded category slugs
    const FILTER_GROUPS = {
      'brand-identity': ['brand-identity-design', 'logo-design', 'visual-identity-systems'],
      'digital-design': ['digital-social-media-design', 'marketing-campaign-design'],
      'print-marketing': ['print-design', 'brand-applications-assets'],
      'creative-direction': ['art-direction-visual-guidance'],
    };
    if (req.query.filter && FILTER_GROUPS[req.query.filter]) {
      where.category = { in: FILTER_GROUPS[req.query.filter] };
    } else if (req.query.category) {
      where.category = { contains: req.query.category, mode: 'insensitive' };
    }
    if (req.query.search) {
      where.OR = [
        { title: { contains: req.query.search, mode: 'insensitive' } },
        { shortDescription: { contains: req.query.search, mode: 'insensitive' } },
        { category: { contains: req.query.search, mode: 'insensitive' } },
      ];
    }

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        include: {
          galleryImages: { orderBy: { order: 'asc' } },
        },
        orderBy,
        skip,
        take,
      }),
      prisma.project.count({ where }),
    ]);

    return paginated(res, projects, total, page, limit);
  } catch (err) {
    next(err);
  }
};

// GET /api/projects/:idOrSlug  (public)
const getProject = async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;

    const project = await prisma.project.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
      include: {
        galleryImages: { orderBy: { order: 'asc' } },
      },
    });

    if (!project) return error(res, 'Project not found.', 404);

    return success(res, project);
  } catch (err) {
    next(err);
  }
};

// POST /api/admin/projects  (protected)
const createProject = async (req, res, next) => {
  try {
    const {
      title, category, shortDescription, fullDescription,
      technologies, liveUrl, githubUrl, featured, displayOrder,
      status, seoTitle, seoDescription,
    } = req.body;

    const slug = await generateUniqueSlug(title, 'project');

    // Handle thumbnail upload
    let thumbnail = null;
    let thumbnailPublicId = null;
    if (req.file) {
      thumbnail = req.file.path;
      thumbnailPublicId = req.file.filename;
    }

    const project = await prisma.project.create({
      data: {
        title: title.trim(),
        slug,
        category: category.trim(),
        shortDescription: shortDescription.trim(),
        fullDescription: fullDescription.trim(),
        thumbnail,
        thumbnailPublicId,
        technologies: Array.isArray(technologies) ? technologies : [],
        liveUrl: liveUrl || null,
        githubUrl: githubUrl || null,
        featured: featured === true || featured === 'true',
        displayOrder: parseInt(displayOrder, 10) || 0,
        status: status || 'DRAFT',
        seoTitle: seoTitle || null,
        seoDescription: seoDescription || null,
      },
      include: { galleryImages: true },
    });

    logger.info(`Project created: ${project.id} - ${project.title}`);
    req.logActivity?.({
      action: project.status === 'PUBLISHED' ? 'PUBLISHED' : 'CREATED',
      entity: 'Project',
      entityId: project.id,
      entityName: project.title,
    });
    return created(res, project, 'Project created successfully');
  } catch (err) {
    next(err);
  }
};

// PUT /api/admin/projects/:id  (protected)
const updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await prisma.project.findUnique({ where: { id } });
    if (!existing) return error(res, 'Project not found.', 404);

    const {
      title, category, shortDescription, fullDescription,
      technologies, liveUrl, githubUrl, featured, displayOrder,
      status, seoTitle, seoDescription,
    } = req.body;

    // Regenerate slug if title changed
    let slug = existing.slug;
    if (title && title.trim() !== existing.title) {
      slug = await generateUniqueSlug(title, 'project', id);
    }

    // Handle new thumbnail
    let thumbnail = existing.thumbnail;
    let thumbnailPublicId = existing.thumbnailPublicId;
    if (req.file) {
      // Delete old thumbnail from Cloudinary
      if (existing.thumbnailPublicId) {
        await deleteAsset(existing.thumbnailPublicId);
      }
      thumbnail = req.file.path;
      thumbnailPublicId = req.file.filename;
    }

    const updated = await prisma.project.update({
      where: { id },
      data: {
        ...(title && { title: title.trim(), slug }),
        ...(category && { category: category.trim() }),
        ...(shortDescription && { shortDescription: shortDescription.trim() }),
        ...(fullDescription && { fullDescription: fullDescription.trim() }),
        thumbnail,
        thumbnailPublicId,
        ...(technologies !== undefined && { technologies: Array.isArray(technologies) ? technologies : [] }),
        liveUrl: liveUrl !== undefined ? (liveUrl || null) : existing.liveUrl,
        githubUrl: githubUrl !== undefined ? (githubUrl || null) : existing.githubUrl,
        ...(featured !== undefined && { featured: featured === true || featured === 'true' }),
        ...(displayOrder !== undefined && { displayOrder: parseInt(displayOrder, 10) || 0 }),
        ...(status && { status }),
        seoTitle: seoTitle !== undefined ? (seoTitle || null) : existing.seoTitle,
        seoDescription: seoDescription !== undefined ? (seoDescription || null) : existing.seoDescription,
      },
      include: { galleryImages: { orderBy: { order: 'asc' } } },
    });

    req.logActivity?.({
      action: status ? resolveContentAction(existing, status) : 'UPDATED',
      entity: 'Project',
      entityId: updated.id,
      entityName: updated.title,
    });

    return success(res, updated, 'Project updated successfully');
  } catch (err) {
    next(err);
  }
};

// DELETE /api/admin/projects/:id  (protected)
const deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;

    const project = await prisma.project.findUnique({
      where: { id },
      include: { galleryImages: true },
    });
    if (!project) return error(res, 'Project not found.', 404);

    // Delete all Cloudinary assets
    const deleteOps = [];
    if (project.thumbnailPublicId) {
      deleteOps.push(deleteAsset(project.thumbnailPublicId));
    }
    project.galleryImages.forEach((img) => {
      deleteOps.push(deleteAsset(img.publicId));
    });
    await Promise.allSettled(deleteOps);

    await prisma.project.delete({ where: { id } });

    logger.info(`Project deleted: ${id}`);
    req.logActivity?.({
      action: 'DELETED',
      entity: 'Project',
      entityId: id,
      entityName: project.title,
    });
    return success(res, null, 'Project deleted successfully');
  } catch (err) {
    next(err);
  }
};

// POST /api/admin/projects/:id/gallery  (protected)
const addGalleryImage = async (req, res, next) => {
  try {
    const { id } = req.params;

    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) return error(res, 'Project not found.', 404);

    if (!req.file) return error(res, 'No image file uploaded.', 400);

    const { altText, order } = req.body;
    const highestOrder = await prisma.projectImage.findFirst({
      where: { projectId: id },
      orderBy: { order: 'desc' },
    });

    const image = await prisma.projectImage.create({
      data: {
        projectId: id,
        url: req.file.path,
        publicId: req.file.filename,
        altText: altText || null,
        order: order !== undefined ? parseInt(order, 10) : (highestOrder?.order ?? -1) + 1,
      },
    });

    return created(res, image, 'Gallery image added');
  } catch (err) {
    next(err);
  }
};

// DELETE /api/admin/projects/:id/gallery/:imageId  (protected)
const deleteGalleryImage = async (req, res, next) => {
  try {
    const { id, imageId } = req.params;

    const image = await prisma.projectImage.findFirst({
      where: { id: imageId, projectId: id },
    });
    if (!image) return error(res, 'Image not found.', 404);

    await deleteAsset(image.publicId);
    await prisma.projectImage.delete({ where: { id: imageId } });

    return success(res, null, 'Gallery image deleted');
  } catch (err) {
    next(err);
  }
};

// PUT /api/admin/projects/reorder  (protected) — bulk display order update
const reorderProjects = async (req, res, next) => {
  try {
    const { items } = req.body; // [{ id, displayOrder }]

    if (!Array.isArray(items)) return error(res, 'Items array is required.', 400);

    await Promise.all(
      items.map(({ id, displayOrder }) =>
        prisma.project.update({ where: { id }, data: { displayOrder: parseInt(displayOrder, 10) } })
      )
    );

    return success(res, null, 'Projects reordered successfully');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProjects, getProject,
  createProject, updateProject, deleteProject,
  addGalleryImage, deleteGalleryImage,
  reorderProjects,
};
