const { body } = require('express-validator');

const partnerRules = [
  body('companyName').trim().notEmpty().withMessage('Company name is required.').isLength({ max: 100 }),
  body('website').optional({ checkFalsy: true }).isURL().withMessage('Invalid website URL.'),
  body('displayOrder').optional().isInt({ min: 0 }).toInt(),
  body('isActive').optional().isBoolean({ strict: false }),
];

const testimonialRules = [
  body('clientName').trim().notEmpty().withMessage('Client name is required.').isLength({ max: 100 }),
  body('company').optional().trim().isLength({ max: 100 }),
  body('position').optional().trim().isLength({ max: 100 }),
  body('testimonial').trim().notEmpty().withMessage('Testimonial text is required.').isLength({ max: 1000 }),
  body('rating').optional({ checkFalsy: true }).isInt({ min: 1, max: 5 }).toInt().withMessage('Rating must be between 1 and 5.'),
  body('featured').optional().isBoolean({ strict: false }),
  body('displayOrder').optional().isInt({ min: 0 }).toInt(),
  body('isActive').optional().isBoolean({ strict: false }),
];

module.exports = { partnerRules, testimonialRules };
