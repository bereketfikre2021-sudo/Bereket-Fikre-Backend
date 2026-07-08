const { body } = require('express-validator');

const loginRules = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required.'),
  body('password').notEmpty().withMessage('Password is required.'),
];

const changePasswordRules = [
  body('currentPassword').notEmpty().withMessage('Current password is required.'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters.')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain uppercase, lowercase, and a number.'),
];

const refreshRules = [
  body('refreshToken').notEmpty().withMessage('Refresh token is required.'),
];

module.exports = { loginRules, changePasswordRules, refreshRules };
