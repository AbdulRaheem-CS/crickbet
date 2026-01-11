/**
 * Validation Middleware
 * Request validation using express-validator
 */

const { validationResult } = require('express-validator');

/**
 * Handle validation errors
 */
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const extractedErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      code: 'VALIDATION_ERROR',
      errors: extractedErrors,
    });
  }

  next();
};

/**
 * Sanitize request body
 */
const sanitizeBody = (allowedFields) => {
  return (req, res, next) => {
    if (req.body) {
      const sanitized = {};
      allowedFields.forEach((field) => {
        if (req.body[field] !== undefined) {
          sanitized[field] = req.body[field];
        }
      });
      req.body = sanitized;
    }
    next();
  };
};

module.exports = {
  handleValidation,
  sanitizeBody,
};
