const { body, param, query } = require('express-validator');

const createExpenseRules = [
  body('amount')
    .notEmpty()
    .withMessage('Amount is required')
    .isFloat({ gt: 0 })
    .withMessage('Amount must be a positive number greater than 0'),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Category must be between 2 and 50 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Description cannot exceed 255 characters'),
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be a valid ISO 8601 date string (e.g., 2026-10-14)'),
];

const updateExpenseRules = [
  param('id')
    .isMongoId()
    .withMessage('Invalid expense ID format'),
  body('amount')
    .optional()
    .isFloat({ gt: 0 })
    .withMessage('Amount must be a positive number greater than 0'),
  body('category')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Category cannot be empty')
    .isLength({ min: 2, max: 50 })
    .withMessage('Category must be between 2 and 50 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Description cannot exceed 255 characters'),
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be a valid ISO 8601 date string (e.g., 2026-10-14)'),
];

const getExpensesQueryRules = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be an integer between 1 and 100'),
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('startDate must be a valid ISO 8601 date'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('endDate must be a valid ISO 8601 date'),
];

const expenseIdRule = [
  param('id')
    .isMongoId()
    .withMessage('Invalid expense ID format'),
];

const summaryQueryRules = [
  query('month')
    .notEmpty()
    .withMessage('Month query parameter is required')
    .matches(/^\d{4}-(0[1-9]|1[0-2])$/)
    .withMessage('Month must be in YYYY-MM format (e.g., 2026-10)'),
];

module.exports = {
  createExpenseRules,
  updateExpenseRules,
  getExpensesQueryRules,
  expenseIdRule,
  summaryQueryRules,
};
