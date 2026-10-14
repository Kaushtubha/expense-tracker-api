const AppError = require('../utils/AppError');

/**
 * Handle Mongoose CastError (e.g. invalid ObjectId format in params)
 */
const handleCastErrorDB = (err) => {
  const message = `Invalid format for ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

/**
 * Handle MongoDB Duplicate Key Error (E11000)
 */
const handleDuplicateFieldsDB = (err) => {
  const field = Object.keys(err.keyValue || {})[0] || 'field';
  const value = err.keyValue ? err.keyValue[field] : '';
  const message = `An account or record with ${field} '${value}' already exists.`;
  return new AppError(message, 409); // 409 Conflict
};

/**
 * Handle Mongoose Schema Validation Errors
 */
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Validation error: ${errors.join('. ')}`;
  return new AppError(message, 400);
};

/**
 * Handle JWT Errors
 */
const handleJWTError = () =>
  new AppError('Invalid authentication token. Please log in again.', 401);

const handleJWTExpiredError = () =>
  new AppError('Your authentication token has expired. Please refresh your session.', 401);

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

  // Transform known DB and Auth errors into clean AppError instances
  if (err.name === 'CastError') error = handleCastErrorDB(err);
  if (err.code === 11000) error = handleDuplicateFieldsDB(err);
  if (err.name === 'ValidationError') error = handleValidationErrorDB(err);
  if (err.name === 'JsonWebTokenError') error = handleJWTError();
  if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

  // Log unexpected internal 500 errors
  if (error.statusCode === 500) {
    console.error(`[UNEXPECTED ERROR] [ReqID: ${req.id || 'N/A'}]`, err);
  }

  const isDev = process.env.NODE_ENV === 'development';

  return res.status(error.statusCode).json({
    success: false,
    status: error.status,
    message: error.message || 'Internal server error occurred',
    requestId: req.id || undefined,
    ...(error.errors && { errors: error.errors }),
    ...(isDev && { stack: err.stack }),
  });
};

module.exports = errorHandler;
