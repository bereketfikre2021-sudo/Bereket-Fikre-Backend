const { body } = require('express-validator');

const VALID_PILLARS = ['CREATE', 'BUILD', 'GROW', 'EXPLORE'];

const sharedRules = [
  body('author').optional({ values: 'falsy' }).trim(),
  body('readingTime')
    .optional({ values: 'falsy' })
    .isInt({ min: 1 })
    .toInt(),
  body('publishDate')
    .optional({ values: 'falsy' })
    .isISO8601()
    .withMessage('Invalid publish date.'),
  body('status')
    .optional({ values: 'falsy' })
    .isIn(['DRAFT', 'PUBLISHED']),
  // Coerce to string first so isLength never sees a non-string value
  body('seoTitle')
    .optional({ values: 'falsy' })
    .customSanitizer((v) => (v == null ? '' : String(v)))
    .isLength({ max: 60 })
    .withMessage('SEO title must be 60 characters or fewer.'),
  body('seoDescription')
    .optional({ values: 'falsy' })
    .customSanitizer((v) => (v == null ? '' : String(v)))
    .isLength({ max: 160 })
    .withMessage('SEO description must be 160 characters or fewer.'),
  body('pillar')
    .optional({ values: 'falsy' })
    .isIn(VALID_PILLARS)
    .withMessage(`pillar must be one of: ${VALID_PILLARS.join(', ')}.`),
  body('projectId')
    .optional({ values: 'falsy' })
    .isUUID()
    .withMessage('projectId must be a valid UUID.'),
  body('removeCoverImage').optional(),
];

// CREATE — required fields enforced
const createInsightRules = [
  body('type')
    .isIn(['CASE_STUDY', 'BLOG_POST'])
    .withMessage('Type must be CASE_STUDY or BLOG_POST.'),
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required.')
    .isLength({ max: 200 }),
  body('excerpt')
    .trim()
    .notEmpty()
    .withMessage('Excerpt is required.'),
  body('content')
    .notEmpty()
    .withMessage('Content is required.'),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required.'),
  ...sharedRules,
];

// UPDATE — all fields optional
const updateInsightRules = [
  body('type')
    .optional({ values: 'falsy' })
    .isIn(['CASE_STUDY', 'BLOG_POST'])
    .withMessage('Type must be CASE_STUDY or BLOG_POST.'),
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Title cannot be empty.')
    .isLength({ max: 200 }),
  body('excerpt')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Excerpt cannot be empty.'),
  body('content')
    .optional()
    .notEmpty()
    .withMessage('Content cannot be empty.'),
  body('category')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Category cannot be empty.'),
  ...sharedRules,
];

module.exports = { createInsightRules, updateInsightRules };
