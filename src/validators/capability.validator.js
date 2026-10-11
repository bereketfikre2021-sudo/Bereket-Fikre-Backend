const { body } = require('express-validator');

const capabilityRules = [
  body('pillar').optional().trim().isLength({ max: 50 }),
  body('label').optional().trim().isLength({ max: 200 }),
  body('headline').optional().trim().isLength({ max: 500 }),
  body('description').optional().trim(),
  body('displayOrder').optional().isInt({ min: 0 }).toInt(),
  body('isActive').optional().isBoolean({ strict: false }),
];

const reorderRules = [
  body('items').isArray({ min: 1 }).withMessage('Items array is required.'),
  body('items.*.id').notEmpty().withMessage('Each item must have an id.'),
  body('items.*.displayOrder').isInt({ min: 0 }).withMessage('Each item must have a valid displayOrder.'),
];

module.exports = { capabilityRules, reorderRules };
