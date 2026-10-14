const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');

/**
 * Sign JWT token with user ID payload
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

/**
 * Service to register a new user
 */
const signup = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError('An account with this email already exists', 400);
  }

  const user = await User.create({ name, email, password });
  const token = generateToken(user._id);

  return {
    user,
    token,
  };
};

/**
 * Service to authenticate user login
 */
const login = async ({ email, password }) => {
  if (!email || !password) {
    throw new AppError('Please provide both email and password', 400);
  }

  // Find user and explicitly select password field
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password', 401);
  }

  const token = generateToken(user._id);

  // Return plain user object without password
  const userJson = user.toJSON();

  return {
    user: userJson,
    token,
  };
};

module.exports = {
  generateToken,
  signup,
  login,
};
