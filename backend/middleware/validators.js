// Input validation utilities
const { body, validationResult } = require('express-validator');

// Validation middleware runner
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation Error',
      details: errors.array().map(e => ({ field: e.param, message: e.msg })),
    });
  }
  next();
};

// Reusable validators
const validators = {
  // Email validation
  email: () => body('email')
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),

  // Full name validation
  fullName: () => body('fullName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),

  // Phone validation (Ghana format: 024XXXXXXX, 054XXXXXXX, etc.)
  phone: () => body('phone')
    .trim()
    .matches(/^(0|233)[0-9]{9}$/)
    .withMessage('Invalid phone number. Use Ghana format (024..., 054..., etc.)'),

  // Password validation
  password: () => body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),

  // Department validation
  department: (departments) => body('department')
    .isIn(departments)
    .withMessage(`Department must be one of: ${departments.join(', ')}`),

  // Role validation
  role: () => body('role')
    .isIn(['admin', 'leader', 'usher'])
    .withMessage('Role must be admin, leader, or usher'),

  // Status validation
  status: () => body('status')
    .isIn(['active', 'inactive', 'transferred'])
    .withMessage('Status must be active, inactive, or transferred'),

  // Service type validation
  serviceType: () => body('type')
    .isIn(['sunday', 'midweek', 'special', 'conference'])
    .withMessage('Service type must be sunday, midweek, special, or conference'),

  // Optional email (if provided, must be valid)
  optionalEmail: () => body('email')
    .optional()
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),

  // Optional phone (if provided, must be valid)
  optionalPhone: () => body('phone')
    .optional()
    .matches(/^(0|233)[0-9]{9}$/)
    .withMessage('Invalid phone number format'),
};

// Common validation chains
const memberValidators = [
  validators.fullName(),
  validators.optionalEmail(),
  validators.optionalPhone(),
  validators.department(['Ushers', 'Musicians', 'Dancers', 'Prayer', 'Hospitality', 'Youth', 'Children', 'Admin']),
  validate,
];

const visitorValidators = [
  validators.fullName(),
  validators.optionalEmail(),
  validators.optionalPhone(),
  validate,
];

const userValidators = [
  validators.email(),
  validators.password(),
  validators.role(),
  validate,
];

const updateMemberValidators = [
  body('fullName').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('email').optional().isEmail().normalizeEmail(),
  body('phone').optional().matches(/^(0|233)[0-9]{9}$/).withMessage('Invalid phone format'),
  body('department').optional().isIn(['Ushers', 'Musicians', 'Dancers', 'Prayer', 'Hospitality', 'Youth', 'Children', 'Admin']),
  validate,
];

module.exports = {
  validate,
  validators,
  memberValidators,
  visitorValidators,
  userValidators,
  updateMemberValidators,
};
