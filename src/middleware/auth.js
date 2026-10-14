const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');

/**
 * Authentication middleware to protect private routes
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // 1. Check for token in Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(
        new AppError('You are not logged in. Please provide a Bearer token.', 401)
      );
    }

    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Check if user still exists in database
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(
        new AppError('The user belonging to this token no longer exists.', 401)
      );
    }

    // 4. Grant access to protected route and attach user to request object
    req.user = currentUser;
    next();
  } catch (error) {
    // Passes any JWT verification or expiration error to centralized error handler
    next(error);
  }
};

module.exports = {
  protect,
};
