const { body, param, query } = require('express-validator');

const createComplaintRules = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),

  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),

  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required')
    .isIn(['water', 'electricity', 'wifi', 'cleanliness', 'furniture', 'other'])
    .withMessage('Invalid category specified'),

  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Priority must be low, medium, high, or urgent'),

  body('roomNumber')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Room number cannot be empty if provided'),

  body('imageUrl')
    .optional()
    .trim(),
];

const updateStatusRules = [
  param('id')
    .isMongoId()
    .withMessage('Invalid complaint ID format'),

  body('status')
    .trim()
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['Open', 'In Progress', 'Resolved', 'Closed'])
    .withMessage('Status must be Open, In Progress, Resolved, or Closed'),

  body('note')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Note cannot exceed 500 characters'),
];

const assignStaffRules = [
  param('id')
    .isMongoId()
    .withMessage('Invalid complaint ID format'),

  body('staffId')
    .notEmpty()
    .withMessage('Staff ID is required')
    .isMongoId()
    .withMessage('Invalid staff ID format'),
];

const addCommentRules = [
  param('id')
    .isMongoId()
    .withMessage('Invalid complaint ID format'),

  body('text')
    .trim()
    .notEmpty()
    .withMessage('Comment text cannot be empty')
    .isLength({ max: 500 })
    .withMessage('Comment cannot exceed 500 characters'),

  body('isInternal')
    .optional()
    .isBoolean()
    .withMessage('isInternal must be a boolean flag'),
];

const complaintIdRule = [
  param('id')
    .isMongoId()
    .withMessage('Invalid complaint ID format'),
];

const getComplaintsQueryRules = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),

  query('status')
    .optional()
    .isIn(['Open', 'In Progress', 'Resolved', 'Closed'])
    .withMessage('Invalid status filter'),

  query('category')
    .optional()
    .isIn(['water', 'electricity', 'wifi', 'cleanliness', 'furniture', 'other'])
    .withMessage('Invalid category filter'),

  query('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority filter'),

  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('startDate must be in ISO 8601 format'),

  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('endDate must be in ISO 8601 format'),
];

module.exports = {
  createComplaintRules,
  updateStatusRules,
  assignStaffRules,
  addCommentRules,
  complaintIdRule,
  getComplaintsQueryRules,
};
