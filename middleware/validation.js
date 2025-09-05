const { body, validationResult } = require('express-validator');

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// User registration validation
const validateUserRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('phone')
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  
  validate
];

// User login validation
const validateUserLogin = [
  body('phone')
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  validate
];

// Property validation
const validateProperty = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),
  
  body('type')
    .isIn(['apartment', 'house', 'villa', 'commercial'])
    .withMessage('Invalid property type'),
  
  body('bhk')
    .isIn(['1', '2', '3', '4', '5'])
    .withMessage('BHK must be between 1 and 5'),
  
  body('bathrooms')
    .isInt({ min: 1, max: 10 })
    .withMessage('Bathrooms must be between 1 and 10'),
  
  body('area')
    .isInt({ min: 100, max: 50000 })
    .withMessage('Area must be between 100 and 50,000 sq ft'),
  
  body('price')
    .isInt({ min: 1000, max: 1000000000 })
    .withMessage('Price must be between ₹1,000 and ₹100 crores'),
  
  body('location')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Location must be between 5 and 100 characters'),
  
  body('description')
    .trim()
    .isLength({ min: 20, max: 1000 })
    .withMessage('Description must be between 20 and 1000 characters'),
  
  body('status')
    .isIn(['sale', 'rent'])
    .withMessage('Status must be either sale or rent'),
  
  body('ownerName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Owner name must be between 2 and 50 characters'),
  
  body('ownerPhone')
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid owner phone number'),
  
  body('ownerEmail')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid owner email'),
  
  validate
];

// Inquiry validation
const validateInquiry = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('phone')
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number'),
  
  body('message')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Message must be between 10 and 1000 characters'),
  
  validate
];

module.exports = {
  validateUserRegistration,
  validateUserLogin,
  validateProperty,
  validateInquiry
};