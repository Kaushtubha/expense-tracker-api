/**
 * Custom AppError class for operational errors.
 * Operational errors are predictable errors (e.g. invalid user input, resource not found, unauthorized)
 * as opposed to programming bugs (e.g. syntax errors, undefined variable access).
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true; // Distinguishes operational errors from system bugs

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
