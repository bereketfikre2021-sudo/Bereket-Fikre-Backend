const { Router } = require('express');
const {
  getInsights, getInsight,
  createInsight, updateInsight, deleteInsight,
} = require('../controllers/insight.controller');
const { authenticate }  = require('../middleware/auth');
const { uploadLimiter } = require('../middleware/rateLimiter');
const validate          = require('../middleware/validate');
const { insightRules }  = require('../validators/insight.validator');
const { upload }        = require('../services/upload.service');

const router = Router();

/**
 * Insight folder is resolved dynamically at request time based on the
 * `type` field in the multipart body:
 *
 *   type === 'CASE_STUDY'  →  bereketfikre/case-studies/
 *   type === 'BLOG_POST'   →  bereketfikre/design-blogs/
 *
 * This keeps images organised per content type without needing separate
 * endpoints for case studies vs blog posts.
 */
const resolveFolderKey = (req) => {
  const type = req.body?.type;
  if (type === 'CASE_STUDY') return 'CASE_STUDIES';
  if (type === 'BLOG_POST')  return 'DESIGN_BLOGS';
  // Fallback: put unknown types in case-studies so nothing is lost
  return 'CASE_STUDIES';
};

const uploadCover = [uploadLimiter, ...upload('coverImage', resolveFolderKey)];

// ——— Public ———
router.get('/',          getInsights);
router.get('/:idOrSlug', getInsight);

// ——— Protected ———
router.post('/',    authenticate, ...uploadCover, insightRules, validate, createInsight);
router.put('/:id',  authenticate, ...uploadCover, insightRules, validate, updateInsight);
router.delete('/:id', authenticate, deleteInsight);

// Inline cover-image-only update (no validation rules — image field only)
router.put('/:id/cover', authenticate, ...uploadCover, updateInsight);

module.exports = router;
