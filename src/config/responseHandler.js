/**
 * Standard API Success Response
 * @param {string} message - Success message
 * @param {any} data - Response data
 * @param {number} statusCode - HTTP status code (default: 200)
 */
export const successResponse = (message, data = null, statusCode = 200) => {
  return {
    success: true,
    message,
    data,
    statusCode,
    timestamp: new Date().toISOString()
  };
};

/**
 * Standard API Error Response
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code (default: 500)
 * @param {any} errors - Detailed error information (optional)
 */
export const errorResponse = (message, statusCode = 500, errors = null) => {
  return {
    success: false,
    message,
    statusCode,
    errors,
    timestamp: new Date().toISOString()
  };
};

/**
 * Validation Error Response
 * @param {Array|Object} errors - Validation errors
 */
export const validationErrorResponse = (errors) => {
  return errorResponse('Validation failed', 422, errors);
};

/**
 * Not Found Error Response
 * @param {string} message - Custom not found message
 */
export const notFoundResponse = (message = 'Resource not found') => {
  return errorResponse(message, 404);
};

/**
 * Unauthorized Error Response
 * @param {string} message - Custom unauthorized message
 */
export const unauthorizedResponse = (message = 'Unauthorized access') => {
  return errorResponse(message, 401);
};

/**
 * Response Handler Middleware
 * Wraps the response in a consistent format
 */
export const responseHandler = (req, res, next) => {
  // Extend response object with custom methods
  res.success = function(message, data, statusCode = 200) {
    return res.status(statusCode).json(successResponse(message, data, statusCode));
  };

  res.error = function(message, statusCode = 500, errors = null) {
    return res.status(statusCode).json(errorResponse(message, statusCode, errors));
  };

  res.validationError = function(errors) {
    return res.status(422).json(validationErrorResponse(errors));
  };

  res.notFound = function(message) {
    return res.status(404).json(notFoundResponse(message));
  };

  res.unauthorized = function(message) {
    return res.status(401).json(unauthorizedResponse(message));
  };

  next();
};

// Example status codes for reference
export const STATUS_CODES = {
  SUCCESS: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  VALIDATION_ERROR: 422,
  SERVER_ERROR: 500
};