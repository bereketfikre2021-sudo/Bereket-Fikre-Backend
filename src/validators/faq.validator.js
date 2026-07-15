const { body } = require('express-validator');

const faqRules = [
  body('question').trim().notEmpty().withMessage('Question is required.').isLength({ max: 300 }),
  body('answer').trim().notEmpty().withMessage('Answer is required.'),
  body('category').optional().trim().isLength({ max: 100 }),
  body('displayOrder').optional().isInt({ min: 0 }).toInt(),
  body('isActive').optional().isBoolean({ strict: false }),
];

const reorderRules = [
  body('items').isArray({ min: 1 }).withMessage('Items array is required.'),
  body('items.*.id').notEmpty().withMessage('Each item must have an id.'),
  body('items.*.displayOrder').isInt({ min: 0 }).withMessage('Each item must have a valid displayOrder.'),
];

module.exports = { faqRules, reorderRules };
