const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');

const getAccessSecret = () =>
  process.env.JWT_ACCESS_SECRET ||
  process.env.JWT_SECRET ||
  'hostel_default_access_secret_key_2026';

const getRefreshSecret = () =>
  process.env.JWT_REFRESH_SECRET || 'hostel_default_refresh_secret_key_2026';

/**
 * Generate short-lived Access Token (15 mins by default)
 */
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    getAccessSecret(),
    { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || process.env.JWT_EXPIRES_IN || '15m' }
  );
};

/**
 * Generate long-lived Refresh Token (7 days by default)
 * Uses RFC 7519 jti (JWT ID) claim to guarantee uniqueness on rotation
 */
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { id: userId, jti: crypto.randomUUID() },
    getRefreshSecret(),
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );
};

/**
 * Register a new user (Student, Admin, or Staff)
 */
const register = async (userData) => {
  const { name, email, password, role, roomNumber, phone } = userData;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError('An account with this email address already exists', 409);
  }

  // Create user
  const user = new User({
    name,
    email,
    password,
    role: role || 'student',
    roomNumber: role === 'student' ? roomNumber : undefined,
    phone: phone || '',
  });

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user._id);

  // Store refresh token for revocation capability
  user.refreshTokens = [refreshToken];
  await user.save();

  return {
    user: user.toJSON(),
    accessToken,
    refreshToken,
  };
};

/**
 * Authenticate user login and issue dual tokens
 */
const login = async ({ email, password }) => {
  if (!email || !password) {
    throw new AppError('Please provide both email and password', 400);
  }

  // Explicitly select password and refreshTokens
  const user = await User.findOne({ email }).select('+password +refreshTokens');

  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password', 401);
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user._id);

  // Maintain at most 5 concurrent active refresh tokens
  user.refreshTokens = [...(user.refreshTokens || []).slice(-4), refreshToken];
  await user.save();

  return {
    user: user.toJSON(),
    accessToken,
    refreshToken,
  };
};

/**
 * Rotate Refresh Token and issue fresh Access Token
 */
const refreshAccessToken = async (oldRefreshToken) => {
  if (!oldRefreshToken) {
    throw new AppError('Refresh token is required', 400);
  }

  let decoded;
  try {
    decoded = jwt.verify(oldRefreshToken, getRefreshSecret());
  } catch (err) {
    throw new AppError('Refresh token is invalid or expired. Please log in again.', 401);
  }

  const user = await User.findById(decoded.id).select('+refreshTokens');
  if (!user) {
    throw new AppError('The user belonging to this token no longer exists', 401);
  }

  // Verify the refresh token is in the user's active whitelist
  if (!user.refreshTokens || !user.refreshTokens.includes(oldRefreshToken)) {
    // Possible reuse attack: revoke all tokens for this user
    user.refreshTokens = [];
    await user.save();
    throw new AppError(
      'Compromised or revoked refresh token. All sessions terminated for security. Please log in again.',
      401
    );
  }

  // Token Rotation: remove the old token and issue a fresh pair
  const newAccessToken = generateAccessToken(user);
  const newRefreshToken = generateRefreshToken(user._id);

  user.refreshTokens = user.refreshTokens.filter((t) => t !== oldRefreshToken);
  user.refreshTokens.push(newRefreshToken);
  await user.save();

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};

/**
 * Invalidate Refresh Token upon logout
 */
const logout = async (userId, refreshToken) => {
  if (!refreshToken) return;

  const user = await User.findById(userId).select('+refreshTokens');
  if (user && user.refreshTokens) {
    user.refreshTokens = user.refreshTokens.filter((token) => token !== refreshToken);
    await user.save();
  }
};

/**
 * Get profile of current logged-in user
 */
const getMe = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }
  return user;
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  register,
  login,
  refreshAccessToken,
  logout,
  getMe,
};
