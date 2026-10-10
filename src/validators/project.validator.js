const { body, query } = require('express-validator');

const VALID_PILLARS = ['CREATE', 'BUILD', 'GROW'];
const VALID_PROJECT_TYPES = ['client-work', 'personal-product', 'business', 'employment', 'experiment'];
const VALID_TIERS = ['flagship', 'selected', 'archive'];

// Shared optional field rules (used in both create and update)
const sharedRules = [
  // technologies, secondaryPillars, responsibilities, relatedProjectIds come as
  // repeated FormData fields — skip isArray(), controller handles coercion
  body('liveUrl').optional({ checkFalsy: true }).isURL().withMessage('Invalid live URL.'),
  body('githubUrl').optional({ checkFalsy: true }).isURL().withMessage('Invalid GitHub URL.'),
  body('appUrl').optional({ checkFalsy: true }).isURL().withMessage('Invalid app URL.'),
  body('featured').optional().isBoolean({ strict: false }),
  body('displayOrder').optional().isInt({ min: 0 }).toInt(),
  body('status').optional().isIn(['DRAFT', 'PUBLISHED']),
  body('seoTitle').optional().isLength({ max: 60 }),
  body('seoDescription').optional().isLength({ max: 160 }),
  // Taxonomy fields
  body('primaryPillar')
    .optional({ checkFalsy: true })
    .isIn(VALID_PILLARS)
    .withMessage(`primaryPillar must be one of: ${VALID_PILLARS.join(', ')}.`),
  body('projectType')
    .optional({ checkFalsy: true })
    .isIn(VALID_PROJECT_TYPES)
    .withMessage(`projectType must be one of: ${VALID_PROJECT_TYPES.join(', ')}.`),
  body('tier')
    .optional({ checkFalsy: true })
    .isIn(VALID_TIERS)
    .withMessage(`tier must be one of: ${VALID_TIERS.join(', ')}.`),
  body('client').optional({ checkFalsy: true }).trim().isLength({ max: 200 }),
  body('role').optional({ checkFalsy: true }).trim().isLength({ max: 300 }),
  body('year')
    .optional({ checkFalsy: true })
    .isInt({ min: 1990, max: 2100 })
    .withMessage('year must be a valid 4-digit year.')
    .toInt(),
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
  query('primaryPillar').optional().isIn(VALID_PILLARS),
  query('tier').optional().isIn(VALID_TIERS),
  query('projectType').optional().isIn(VALID_PROJECT_TYPES),
];

module.exports = { createProjectRules, updateProjectRules, listRules };
