const { body, query } = require('express-validator');

// Shared optional field rules (used in both create and update)
const sharedRules = [
  body('technologies').optional().isArray(),
  body('liveUrl').optional({ checkFalsy: true }).isURL().withMessage('Invalid live URL.'),
  body('githubUrl').optional({ checkFalsy: true }).isURL().withMessage('Invalid GitHub URL.'),
  body('featured').optional().isBoolean({ strict: false }),
  body('displayOrder').optional().isInt({ min: 0 }).toInt(),
  body('status').optional().isIn(['DRAFT', 'PUBLISHED']),
  body('seoTitle').optional().isLength({ max: 60 }),
  body('seoDescription').optional().isLength({ max: 160 }),
];

// CREATE — required fields enforced
const createProjectRules = [
  body('title').trim().notEmpty().withMessage('Title is required.').isLength({ max: 200 }),
  body('category').trim().notEmpty().withMessage('Category is required.'),
  body('shortDescription').trim().notEmpty().withMessage('Short description is required.').isLength({ max: 500 }),
  body('fullDescription').trim().notEmpty().withMessage('Full description is required.'),
  ...sharedRules,
];

// UPDATE — all fields optional (only validate format if present)
const updateProjectRules = [
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty.').isLength({ max: 200 }),
  body('category').optional().trim().notEmpty().withMessage('Category cannot be empty.'),
  body('shortDescription').optional().trim().notEmpty().withMessage('Short description cannot be empty.').isLength({ max: 500 }),
  body('fullDescription').optional().trim().notEmpty().withMessage('Full description cannot be empty.'),
  ...sharedRules,
];

const listRules = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isIn(['DRAFT', 'PUBLISHED']),
  query('featured').optional().isBoolean(),
  query('order').optional().isIn(['asc', 'desc']),
];

module.exports = { createProjectRules, updateProjectRules, listRules };
