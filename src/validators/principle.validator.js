const { body } = require('express-validator');

const principleCreateRules = [
  body('number').notEmpty().withMessage('Number is required.').trim().isLength({ max: 10 }),
  body('heading').notEmpty().withMessage('Heading is required.').trim().isLength({ max: 300 }),
  body('body').notEmpty().withMessage('Body is required.').trim(),
  body('displayOrder').optional().isInt({ min: 0 }).toInt(),
  body('isActive').optional().isBoolean({ strict: false }),
];

const principleRules = [
  body('number').optional().trim().isLength({ max: 10 }),
  body('heading').optional().trim().isLength({ max: 300 }),
  body('body').optional().trim(),
  body('displayOrder').optional().isInt({ min: 0 }).toInt(),
  body('isActive').optional().isBoolean({ strict: false }),
];

const reorderRules = [
  body('items').isArray({ min: 1 }).withMessage('Items array is required.'),
  body('items.*.id').notEmpty().withMessage('Each item must have an id.'),
  body('items.*.displayOrder').isInt({ min: 0 }).withMessage('Each item must have a valid displayOrder.'),
];

module.exports = { principleCreateRules, principleRules, reorderRules };
