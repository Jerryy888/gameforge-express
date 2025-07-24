import { Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult, ValidationChain } from 'express-validator';

export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: errors.array()
    });
  }
  
  next();
};

// Game validation rules
export const validateGame = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  
  body('categoryId')
    .isInt({ min: 1 })
    .withMessage('Category ID must be a positive integer'),
  
  body('thumbnail')
    .isURL()
    .withMessage('Thumbnail must be a valid URL'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  
  body('fileUrl')
    .optional()
    .isURL()
    .withMessage('File URL must be a valid URL'),
  
  body('gameUrl')
    .optional()
    .isURL()
    .withMessage('Game URL must be a valid URL'),
  
  body('developer')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Developer name must not exceed 100 characters'),
  
  handleValidationErrors
];

// Category validation rules
export const validateCategory = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters'),
  
  body('slug')
    .trim()
    .isLength({ min: 1, max: 100 })
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Slug must contain only lowercase letters, numbers, and hyphens'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  
  body('icon')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Icon must not exceed 50 characters'),
  
  body('sortOrder')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Sort order must be a non-negative integer'),
  
  handleValidationErrors
];

// Authentication validation rules
export const validateLogin = [
  body('username')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Username is required'),
  
  body('password')
    .isLength({ min: 1 })
    .withMessage('Password is required'),
  
  handleValidationErrors
];

export const validateRegister = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 50 })
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username must be 3-50 characters and contain only letters, numbers, and underscores'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Must be a valid email address'),
  
  body('password')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must be at least 8 characters with uppercase, lowercase, and number'),
  
  handleValidationErrors
];

// Advertisement validation rules
export const validateAd = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters'),
  
  body('position')
    .isIn(['HEADER', 'SIDEBAR', 'CONTENT', 'FOOTER', 'POPUP', 'BANNER', 'SKYSCRAPER'])
    .withMessage('Invalid ad position'),
  
  body('size')
    .matches(/^\d+x\d+$/)
    .withMessage('Size must be in format WIDTHxHEIGHT (e.g., 300x250)'),
  
  body('code')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Ad code is required'),
  
  handleValidationErrors
];

// Common validation rules
export const validateId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID must be a positive integer'),
  
  handleValidationErrors
];

export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  handleValidationErrors
];

export const validateSearch = [
  query('q')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Search query must be between 1 and 255 characters'),
  
  query('category')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Category must be a positive integer'),
  
  query('minRating')
    .optional()
    .isFloat({ min: 0, max: 5 })
    .withMessage('Minimum rating must be between 0 and 5'),
  
  query('sortBy')
    .optional()
    .isIn(['relevance', 'newest', 'oldest', 'popular', 'rating', 'name'])
    .withMessage('Invalid sort option'),
  
  handleValidationErrors
];