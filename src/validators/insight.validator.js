const { body } = require('express-validator');

const insightRules = [
  body('type').isIn(['CASE_STUDY', 'BLOG_POST']).withMessage('Type must be CASE_STUDY or BLOG_POST.'),
  body('title').trim().notEmpty().withMessage('Title is required.').isLength({ max: 200 }),
  body('excerpt').trim().notEmpty().withMessage('Excerpt is required.'),
  body('content').trim().notEmpty().withMessage('Content is required.'),
  body('category').trim().notEmpty().withMessage('Category is required.'),
  body('tags').optional().isArray(),
  body('author').optional().trim(),
  body('readingTime').optional({ checkFalsy: true }).isInt({ min: 1 }).toInt(),
  body('publishDate').optional({ checkFalsy: true }).isISO8601().withMessage('Invalid publish date.'),
  body('status').optional().isIn(['DRAFT', 'PUBLISHED']),
  body('seoTitle').optional().isLength({ max: 60 }),
  body('seoDescription').optional().isLength({ max: 160 }),
];

module.exports = { insightRules };
