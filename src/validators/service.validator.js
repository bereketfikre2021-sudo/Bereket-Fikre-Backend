const { body } = require('express-validator');

const sharedRules = [
  body('serviceNumber').optional().trim(),
  // bulletPoints and technologies come as repeated FormData fields — skip isArray(), controller handles coercion
  body('displayOrder').optional().isInt({ min: 0 }).toInt(),
  body('featured').optional().isBoolean({ strict: false }),
  body('isActive').optional().isBoolean({ strict: false }),
  body('type').optional().trim(),
  body('deliveryTime').optional().trim(),
  body('seoTitle').optional().isLength({ max: 60 }),
  body('seoDescription').optional().isLength({ max: 160 }),
];

// CREATE — required fields enforced
const createServiceRules = [
  body('title').trim().notEmpty().withMessage('Title is required.'),
  body('category').trim().notEmpty().withMessage('Category is required.'),
  body('shortDescription').trim().notEmpty().withMessage('Short description is required.'),
  ...sharedRules,
];

// UPDATE — all fields optional
const updateServiceRules = [
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty.'),
  body('category').optional().trim().notEmpty().withMessage('Category cannot be empty.'),
  body('shortDescription').optional().trim().notEmpty().withMessage('Short description cannot be empty.'),
  ...sharedRules,
];

const processRules = [
  body('steps').isArray({ min: 1 }).withMessage('Steps must be a non-empty array.'),
  body('steps.*.stepNumber').isInt({ min: 1 }).withMessage('Each step needs a step number.'),
  body('steps.*.title').trim().notEmpty().withMessage('Each step needs a title.'),
  body('steps.*.description').trim().notEmpty().withMessage('Each step needs a description.'),
];

module.exports = { createServiceRules, updateServiceRules, processRules };
