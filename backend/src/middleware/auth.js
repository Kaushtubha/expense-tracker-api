const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');

/**
 * Protect middleware: Verifies JWT Bearer Access Token
 */
const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(
        new AppError('Authentication required. Please provide a Bearer access token.', 401)
      );
    }

    // Verify Access Token
    const jwtSecret =
      process.env.JWT_ACCESS_SECRET ||
      process.env.JWT_SECRET ||
      'hostel_default_access_secret_key_2026';
    const decoded = jwt.verify(token, jwtSecret);

    // Verify user still exists in database
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(
        new AppError('The user account belonging to this token no longer exists.', 401)
      );
    }

    // Attach user to request
    req.user = currentUser;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Role-Based Access Control (RBAC) middleware
 * Restricts access to specified roles (e.g. 'admin', 'staff')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new AppError(
          `Forbidden: Role '${req.user ? req.user.role : 'unauthenticated'}' does not have permission to access this resource`,
          403
        )
      );
    }
    next();
  };
};

module.exports = {
  protect,
  authorize,
};
