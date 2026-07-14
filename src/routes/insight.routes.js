const { Router } = require('express');
const {
  getInsights, getInsight,
  createInsight, updateInsight, deleteInsight, duplicateInsight,
} = require('../controllers/insight.controller');
const { authenticate }  = require('../middleware/auth');
const validate          = require('../middleware/validate');
const { insightRules }  = require('../validators/insight.validator');
const { upload }        = require('../services/upload.service');

const router = Router();

const resolveFolderKey = (req) => {
  const type = req.body?.type;
  if (type === 'CASE_STUDY') return 'CASE_STUDIES';
  if (type === 'BLOG_POST')  return 'DESIGN_BLOGS';
  return 'CASE_STUDIES';
};

const uploadCover = upload('coverImage', resolveFolderKey);

// ——— Public ———
router.get('/',          getInsights);
router.get('/:idOrSlug', getInsight);

// ——— Protected ———
router.post('/',              authenticate, ...uploadCover, insightRules, validate, createInsight);
router.post('/:id/duplicate', authenticate, duplicateInsight);
router.put('/:id',            authenticate, ...uploadCover, insightRules, validate, updateInsight);
router.delete('/:id',         authenticate, deleteInsight);

// Inline cover-image-only update
router.put('/:id/cover', authenticate, ...uploadCover, updateInsight);

module.exports = router;
