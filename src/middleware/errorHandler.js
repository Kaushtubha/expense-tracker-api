const AppError = require('../utils/AppError');

/**
 * Handle Mongoose invalid ObjectId errors (CastError)
 */
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

/**
 * Handle Mongoose duplicate field errors (E11000)
 */
const handleDuplicateFieldsDB = (err) => {
  const field = Object.keys(err.keyValue || {})[0] || 'field';
  const value = err.keyValue ? err.keyValue[field] : '';
  const message = `Duplicate value '${value}' for field '${field}'. Please use another value.`;
  return new AppError(message, 400);
};

/**
 * Handle Mongoose schema validation errors
 */
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data: ${errors.join('. ')}`;
  return new AppError(message, 400);
};

/**
 * Handle JWT verification errors
 */
const handleJWTError = () =>
  new AppError('Invalid token. Please authenticate again.', 401);

/**
 * Handle JWT expired token errors
 */
const handleJWTExpiredError = () =>
  new AppError('Your token has expired. Please log in again.', 401);

/**
 * Central Error-Handling Middleware
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.name = err.name;
  error.statusCode = err.statusCode || 500;
  error.status = err.status || 'error';

  // Transform specific known errors into clean AppError instances
  if (err.name === 'CastError') error = handleCastErrorDB(err);
  if (err.code === 11000) error = handleDuplicateFieldsDB(err);
  if (err.name === 'ValidationError') error = handleValidationErrorDB(err);
  if (err.name === 'JsonWebTokenError') error = handleJWTError();
  if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

  // Log unexpected internal 500 errors for debugging
  if (error.statusCode === 500) {
    console.error('[UNEXPECTED ERROR]', err);
  }

  const isDev = process.env.NODE_ENV === 'development';

  return res.status(error.statusCode).json({
    success: false,
    status: error.status,
    message: error.message || 'Internal server error',
    ...(error.errors && { errors: error.errors }),
    ...(isDev && { stack: err.stack }),
  });
};

module.exports = errorHandler;
