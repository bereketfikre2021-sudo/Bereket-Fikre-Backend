const { body } = require('express-validator');

const serviceRules = [
  body('title').trim().notEmpty().withMessage('Title is required.'),
  body('category').trim().notEmpty().withMessage('Category is required.'),
  body('shortDescription').trim().notEmpty().withMessage('Short description is required.'),
  body('serviceNumber').optional().trim(),
  body('bulletPoints').optional().isArray().withMessage('Bullet points must be an array.'),
  body('technologies').optional().isArray(),
  body('displayOrder').optional().isInt({ min: 0 }).toInt(),
  body('featured').optional().isBoolean({ strict: false }),
  body('isActive').optional().isBoolean({ strict: false }),
  body('type').optional().trim(),
  body('deliveryTime').optional().trim(),
  body('seoTitle').optional().isLength({ max: 60 }),
  body('seoDescription').optional().isLength({ max: 160 }),
];

const processRules = [
  body('steps').isArray({ min: 1 }).withMessage('Steps must be a non-empty array.'),
  body('steps.*.stepNumber').isInt({ min: 1 }).withMessage('Each step needs a step number.'),
  body('steps.*.title').trim().notEmpty().withMessage('Each step needs a title.'),
  body('steps.*.description').trim().notEmpty().withMessage('Each step needs a description.'),
];

module.exports = { serviceRules, processRules };
