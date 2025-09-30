import { body, param, query } from 'express-validator';

// Custom sanitizer to remove suspicious patterns
const sanitizeInput = (value) => {
  if (typeof value === 'string') {
    // Remove potential script tags and suspicious patterns
    value = value.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    // Remove potential SQL injection patterns
    value = value.replace(/(\b(select|insert|update|delete|drop|union|exec|eval)\b)/gi, '');
    // Remove potential NoSQL injection patterns
    value = value.replace(/(\$gt|\$lt|\$ne|\$in|\$nin|\$or|\$and)/g, '');
    // Normalize whitespace
    value = value.replace(/\s+/g, ' ').trim();
  }
  return value;
};

export const createProductValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Product name is required')
    .isLength({ max: 100 })
    .withMessage('Product name cannot exceed 100 characters')
    .customSanitizer(sanitizeInput)
    .matches(/^[a-zA-Z0-9\s\-_,\.]+$/)
    .withMessage('Product name contains invalid characters')
    .escape(),
    
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Product description is required')
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters')
    .customSanitizer(sanitizeInput)
    .escape(),
    
  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
    
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required')
    .isIn([
      'Electronics',
      'Cameras',
      'Laptops',
      'Accessories',
      'Headphones',
      'Food',
      'Books',
      'Clothes/Shoes',
      'Beauty/Health',
      'Sports',
      'Outdoor',
      'Home'
    ])
    .withMessage('Invalid category selected'),
    
  body('stock')
    .notEmpty()
    .withMessage('Stock is required')
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer'),
    
  body('images')
    .isArray()
    .withMessage('Images must be an array')
    .optional(),
    
  body('images.*.public_id')
    .if(body('images').exists())
    .notEmpty()
    .withMessage('Image public_id is required'),
    
  body('images.*.url')
    .if(body('images').exists())
    .notEmpty()
    .withMessage('Image URL is required')
    .isURL()
    .withMessage('Invalid image URL')
];

export const updateProductValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid product ID'),
    
  body('name')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Product name cannot exceed 100 characters'),
    
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),
    
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
    
  body('category')
    .optional()
    .trim()
    .isIn([
      'Electronics',
      'Cameras',
      'Laptops',
      'Accessories',
      'Headphones',
      'Food',
      'Books',
      'Clothes/Shoes',
      'Beauty/Health',
      'Sports',
      'Outdoor',
      'Home'
    ])
    .withMessage('Invalid category selected'),
    
  body('stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer')
];

export const getProductsValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
    
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
    
  query('category')
    .optional()
    .trim()
    .isIn([
      'Electronics',
      'Cameras',
      'Laptops',
      'Accessories',
      'Headphones',
      'Food',
      'Books',
      'Clothes/Shoes',
      'Beauty/Health',
      'Sports',
      'Outdoor',
      'Home'
    ])
    .withMessage('Invalid category'),
    
  query('sort')
    .optional()
    .isIn(['price', '-price', 'name', '-name', 'createdAt', '-createdAt'])
    .withMessage('Invalid sort parameter'),
    
  query('search')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Search query cannot be empty')
];