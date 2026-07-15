const { body } = require('express-validator');

const sharedRules = [
  // tags comes as repeated FormData fields — skip isArray(), controller handles coercion
  body('author').optional().trim(),
  body('readingTime').optional({ checkFalsy: true }).isInt({ min: 1 }).toInt(),
  body('publishDate').optional({ checkFalsy: true }).isISO8601().withMessage('Invalid publish date.'),
  body('status').optional().isIn(['DRAFT', 'PUBLISHED']),
  body('seoTitle').optional().isLength({ max: 60 }),
  body('seoDescription').optional().isLength({ max: 160 }),
];

// CREATE — required fields enforced
const createInsightRules = [
  body('type').isIn(['CASE_STUDY', 'BLOG_POST']).withMessage('Type must be CASE_STUDY or BLOG_POST.'),
  body('title').trim().notEmpty().withMessage('Title is required.').isLength({ max: 200 }),
  body('excerpt').trim().notEmpty().withMessage('Excerpt is required.'),
  body('content').trim().notEmpty().withMessage('Content is required.'),
  body('category').trim().notEmpty().withMessage('Category is required.'),
  ...sharedRules,
];

// UPDATE — all fields optional
const updateInsightRules = [
  body('type').optional().isIn(['CASE_STUDY', 'BLOG_POST']).withMessage('Type must be CASE_STUDY or BLOG_POST.'),
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty.').isLength({ max: 200 }),
  body('excerpt').optional().trim().notEmpty().withMessage('Excerpt cannot be empty.'),
  body('content').optional().trim().notEmpty().withMessage('Content cannot be empty.'),
  body('category').optional().trim().notEmpty().withMessage('Category cannot be empty.'),
  ...sharedRules,
];

module.exports = { createInsightRules, updateInsightRules };
