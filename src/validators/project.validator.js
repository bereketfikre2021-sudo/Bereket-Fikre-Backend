const { body, query } = require('express-validator');

const projectRules = [
  body('title').trim().notEmpty().withMessage('Title is required.').isLength({ max: 200 }),
  body('category').trim().notEmpty().withMessage('Category is required.'),
  body('shortDescription').trim().notEmpty().withMessage('Short description is required.').isLength({ max: 500 }),
  body('fullDescription').trim().notEmpty().withMessage('Full description is required.'),
  body('technologies').optional().isArray(),
  body('liveUrl').optional({ checkFalsy: true }).isURL().withMessage('Invalid live URL.'),
  body('githubUrl').optional({ checkFalsy: true }).isURL().withMessage('Invalid GitHub URL.'),
  body('featured').optional().isBoolean(),
  body('displayOrder').optional().isInt({ min: 0 }),
  body('status').optional().isIn(['DRAFT', 'PUBLISHED']),
  body('seoTitle').optional().isLength({ max: 60 }),
  body('seoDescription').optional().isLength({ max: 160 }),
];

const listRules = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isIn(['DRAFT', 'PUBLISHED']),
  query('featured').optional().isBoolean(),
  query('order').optional().isIn(['asc', 'desc']),
];

module.exports = { projectRules, listRules };
