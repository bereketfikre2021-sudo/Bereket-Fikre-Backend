const { body } = require('express-validator');

// Contact form — matches frontend Contact.jsx field names exactly
const contactRules = [
  body('name').trim().notEmpty().withMessage('Name is required.').isLength({ max: 100 }),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required.'),
  body('subject').trim().notEmpty().withMessage('Subject is required.').isLength({ max: 200 }),
  body('message').trim().notEmpty().withMessage('Message is required.').isLength({ max: 5000 }),
];

// Project request — matches frontend ProjectRequestModal.jsx field names exactly
const projectRequestRules = [
  body('first_name').trim().notEmpty().withMessage('First name is required.').isLength({ max: 50 }),
  body('last_name').trim().notEmpty().withMessage('Last name is required.').isLength({ max: 50 }),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required.'),
  body('phone').optional({ nullable: true, checkFalsy: true }).trim(),
  body('company').optional().trim().isLength({ max: 100 }),
  body('service_needed')
    .notEmpty()
    .isIn(['brand-identity', 'digital-design', 'print-marketing', 'creative-direction', 'multiple', 'other'])
    .withMessage('Invalid service selection.'),
  body('budget_range')
    .notEmpty()
    .isIn(['under-1k', '1k-5k', '5k-10k', '10k-25k', '25k-plus', 'discuss'])
    .withMessage('Invalid budget range selection.'),
  body('timeline')
    .notEmpty()
    .isIn(['asap', '1-month', '2-3-months', '3-6-months', 'flexible'])
    .withMessage('Invalid timeline selection.'),
  body('project_description')
    .trim()
    .notEmpty()
    .isLength({ min: 20, max: 5000 })
    .withMessage('Project description must be at least 20 characters.'),
  body('preferred_contact_method')
    .optional()
    .isIn(['email', 'phone', 'telegram', 'either'])
    .withMessage('Invalid contact method.'),
];

module.exports = { contactRules, projectRequestRules };
