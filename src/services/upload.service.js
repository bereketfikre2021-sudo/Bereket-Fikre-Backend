/**
 * Upload Service
 *
 * Single source of truth for every Cloudinary operation in the application.
 *
 * Responsibilities:
 *   - Define the canonical folder map (module → Cloudinary folder)
 *   - Expose a multer middleware factory (memory storage, validated file types)
 *   - Upload a buffer to a specific folder with per-folder transformations
 *   - Delete an asset by public_id (handles both image and raw resource types)
 *   - Replace an asset (delete old → upload new) in one atomic helper
 *   - Expose an Express middleware factory used by route files
 *
 * Cloudinary folder structure:
 *   bereketfikre/
 *   ├── services/
 *   ├── featured-projects/
 *   ├── case-studies/
 *   ├── design-blogs/
 *   ├── testimonials/
 *   └── trusted-partners/
 *
 * Environment variables consumed (all loaded via src/config/env.js):
 *   CLOUDINARY_CLOUD_NAME
 *   CLOUDINARY_API_KEY
 *   CLOUDINARY_API_SECRET
 */

'use strict';

const multer       = require('multer');
const streamifier  = require('streamifier');
const cloudinary   = require('../config/cloudinary');
const logger       = require('../utils/logger');

// ─────────────────────────────────────────────────────────────────────────────
// 1.  FOLDER CONSTANTS
//     Maps every admin module to its Cloudinary sub-folder under bereketfikre/
// ─────────────────────────────────────────────────────────────────────────────

/** @type {Record<string, string>} */
const FOLDERS = Object.freeze({
  SERVICES:          'bereketfikre/services',
  FEATURED_PROJECTS: 'bereketfikre/featured-projects',
  CASE_STUDIES:      'bereketfikre/case-studies',
  DESIGN_BLOGS:      'bereketfikre/design-blogs',
  TESTIMONIALS:      'bereketfikre/testimonials',
  TRUSTED_PARTNERS:  'bereketfikre/trusted-partners',
});

// ─────────────────────────────────────────────────────────────────────────────
// 2.  PER-FOLDER TRANSFORMATION PRESETS
//     Applied automatically on upload so all stored images are optimised.
//     SVG files bypass transformations (kept as raw/vector).
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns the Cloudinary upload options for a given folder key.
 * @param {string} folderKey - One of the FOLDERS keys
 * @param {boolean} isSvg
 * @returns {object} Cloudinary upload options
 */
const getUploadOptions = (folderKey, isSvg = false) => {
  const folder = FOLDERS[folderKey];

  if (isSvg) {
    // SVG → store as raw so the vector is preserved; no raster transformation
    return { folder, resource_type: 'raw' };
  }

  // Base options applied to every raster image
  const base = {
    folder,
    resource_type: 'image',
    // Auto-select best format (WebP in modern browsers, JPEG fallback)
    fetch_format: 'auto',
    // Compress without visible quality loss
    quality: 'auto:good',
  };

  // Per-folder transformations ──────────────────────────────────────────────

  const transformMap = {
    // Service featured images — wide card format
    [FOLDERS.SERVICES]: [
      { width: 1200, height: 800, crop: 'limit' },
    ],

    // Featured project thumbnails — standard 3:2 card
    [FOLDERS.FEATURED_PROJECTS]: [
      { width: 1200, height: 800, crop: 'limit' },
    ],

    // Case study covers — landscape editorial
    [FOLDERS.CASE_STUDIES]: [
      { width: 1200, height: 630, crop: 'fill', gravity: 'auto' },
    ],

    // Design blog covers — landscape editorial (same as case studies)
    [FOLDERS.DESIGN_BLOGS]: [
      { width: 1200, height: 630, crop: 'fill', gravity: 'auto' },
    ],

    // Testimonial profile pictures — square avatar
    [FOLDERS.TESTIMONIALS]: [
      { width: 400, height: 400, crop: 'fill', gravity: 'face' },
    ],

    // Trusted partner logos — small, contained, no crop
    [FOLDERS.TRUSTED_PARTNERS]: [
      { width: 400, height: 200, crop: 'limit' },
    ],
  };

  const transformation = transformMap[folder];
  if (transformation) {
    base.transformation = transformation;
  }

  return base;
};

// ─────────────────────────────────────────────────────────────────────────────
// 3.  MULTER FACTORY
//     Shared instance that all route files use.  Memory storage means the file
//     buffer is available as req.file.buffer before it reaches Cloudinary.
// ─────────────────────────────────────────────────────────────────────────────

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/svg+xml',
  'image/gif',
]);

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

/**
 * Creates a multer upload middleware that accepts a single file field.
 * Uses memory storage — the buffer is later streamed to Cloudinary.
 *
 * @returns {import('multer').Multer}
 */
const createMulter = () =>
  multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_FILE_SIZE_BYTES },
    fileFilter: (_req, file, cb) => {
      if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
        cb(null, true);
      } else {
        cb(
          new Error(
            `Unsupported file type: ${file.mimetype}. ` +
            `Accepted types: jpg, png, webp, svg, gif`
          ),
          false
        );
      }
    },
  });

// Singleton multer instance — reused across all routes
const multerUpload = createMulter();

// ─────────────────────────────────────────────────────────────────────────────
// 4.  CORE UPLOAD FUNCTION
//     Streams a Buffer directly to Cloudinary (no temp file on disk).
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Uploads a Buffer to Cloudinary.
 *
 * @param {Buffer} buffer        - Raw file buffer from multer memory storage
 * @param {string} folderKey     - Key from FOLDERS (e.g. 'FEATURED_PROJECTS')
 * @param {string} mimeType      - Original file MIME type
 * @returns {Promise<{ url: string, publicId: string, resourceType: string }>}
 */
const uploadBuffer = (buffer, folderKey, mimeType) => {
  return new Promise((resolve, reject) => {
    const isSvg = mimeType === 'image/svg+xml';
    const options = getUploadOptions(folderKey, isSvg);

    const stream = cloudinary.uploader.upload_stream(options, (err, result) => {
      if (err) return reject(err);
      resolve({
        url:          result.secure_url,
        publicId:     result.public_id,
        resourceType: result.resource_type,
        width:        result.width,
        height:       result.height,
        format:       result.format,
        bytes:        result.bytes,
      });
    });

    streamifier.createReadStream(buffer).pipe(stream);
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// 5.  DELETE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Deletes an asset from Cloudinary.
 * Safe to call with null/undefined publicId (no-op).
 *
 * @param {string|null} publicId
 * @param {'image'|'raw'|'video'} [resourceType='image']
 * @returns {Promise<object|null>}
 */
const deleteAsset = async (publicId, resourceType = 'image') => {
  if (!publicId) return null;

  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
      invalidate: true, // purge from Cloudinary CDN cache
    });
    logger.debug(`Cloudinary delete: ${publicId} → ${result.result}`);
    return result;
  } catch (err) {
    // Log but never throw — a failed delete must not block the DB operation
    logger.error(`Cloudinary delete failed for "${publicId}": ${err.message}`);
    return null;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 6.  REPLACE  (delete old + upload new in one call)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Replaces an existing Cloudinary asset with a new one.
 * Deletes the old asset first (fire-and-forget, non-blocking on failure),
 * then uploads the new buffer.
 *
 * @param {Buffer}      newBuffer
 * @param {string}      folderKey
 * @param {string}      mimeType
 * @param {string|null} oldPublicId  - public_id of the asset to delete first
 * @param {string}      [oldResourceType='image']
 * @returns {Promise<{ url: string, publicId: string, resourceType: string }>}
 */
const replaceAsset = async (
  newBuffer,
  folderKey,
  mimeType,
  oldPublicId,
  oldResourceType = 'image'
) => {
  // Delete old asset (non-blocking — don't await result)
  if (oldPublicId) {
    deleteAsset(oldPublicId, oldResourceType).catch(() => {});
  }
  return uploadBuffer(newBuffer, folderKey, mimeType);
};

// ─────────────────────────────────────────────────────────────────────────────
// 7.  EXPRESS MIDDLEWARE FACTORY
//     Combines multer (parses multipart) + Cloudinary upload into a single
//     middleware chain.  Controllers read req.uploadResult instead of
//     manually calling uploadBuffer.
//
//     Usage in routes:
//       const { upload } = require('../services/upload.service');
//       router.post('/', upload('thumbnail', 'FEATURED_PROJECTS'), handler);
//
//     The folderKey can be a string constant OR a function:
//       upload('coverImage', (req) =>
//         req.body.type === 'CASE_STUDY' ? 'CASE_STUDIES' : 'DESIGN_BLOGS'
//       )
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns [multerMiddleware, cloudinaryMiddleware] for use in route arrays.
 *
 * @param {string} fieldName        - multipart field name (e.g. 'thumbnail')
 * @param {string|Function} folderKeyOrFn
 *        - A FOLDERS key string, OR
 *        - A function (req) => FOLDERS key string  (resolved at request time)
 * @returns {[Function, Function]}  Two Express middleware functions
 */
const upload = (fieldName, folderKeyOrFn) => {
  // Middleware 1: parse multipart with multer
  const parseMultipart = multerUpload.single(fieldName);

  // Middleware 2: stream buffer → Cloudinary
  const toCloudinary = async (req, res, next) => {
    // No file in this request — skip silently
    if (!req.file) return next();

    // Resolve folder key (supports dynamic resolution from req)
    const folderKey =
      typeof folderKeyOrFn === 'function'
        ? folderKeyOrFn(req)
        : folderKeyOrFn;

    if (!FOLDERS[folderKey]) {
      return next(
        new Error(
          `Unknown upload folder key: "${folderKey}". ` +
          `Valid keys: ${Object.keys(FOLDERS).join(', ')}`
        )
      );
    }

    try {
      const result = await uploadBuffer(
        req.file.buffer,
        folderKey,
        req.file.mimetype
      );

      // Attach result to req so controllers can read it without importing the service
      req.file.cloudinary = result;
      // Also set the legacy req.file.path / req.file.filename so existing
      // controller code keeps working without any changes.
      req.file.path     = result.url;
      req.file.filename = result.publicId;

      next();
    } catch (err) {
      next(err);
    }
  };

  return [parseMultipart, toCloudinary];
};

// ─────────────────────────────────────────────────────────────────────────────
// 8.  EXPORTS
// ─────────────────────────────────────────────────────────────────────────────

module.exports = {
  /** Folder key → Cloudinary path map */
  FOLDERS,

  /**
   * Express middleware factory.
   * @type {(fieldName: string, folderKeyOrFn: string|Function) => [Function, Function]}
   */
  upload,

  /**
   * Low-level upload: stream a Buffer directly to Cloudinary.
   * @type {(buffer: Buffer, folderKey: string, mimeType: string) => Promise}
   */
  uploadBuffer,

  /**
   * Delete an asset from Cloudinary by public_id.
   * @type {(publicId: string|null, resourceType?: string) => Promise}
   */
  deleteAsset,

  /**
   * Delete old asset + upload new buffer in one call.
   * @type {Function}
   */
  replaceAsset,
};
