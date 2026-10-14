const { body } = require('express-validator');

const registerRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email address is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),

  body('role')
    .optional()
    .isIn(['student', 'admin', 'staff'])
    .withMessage('Role must be either student, admin, or staff'),

  body('roomNumber')
    .custom((value, { req }) => {
      const role = req.body.role || 'student';
      if (role === 'student' && (!value || !value.toString().trim())) {
        throw new Error('Room number is required for students');
      }
      return true;
    }),

  body('phone')
    .optional()
    .trim(),
];

const loginRules = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email address is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

const refreshTokenRules = [
  body('refreshToken')
    .notEmpty()
    .withMessage('Refresh token is required'),
];

module.exports = {
  registerRules,
  loginRules,
  refreshTokenRules,
};
