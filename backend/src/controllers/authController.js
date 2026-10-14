const authService = require('../services/authService');

/**
 * Controller: Register a new user
 */
const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      requestId: req.id,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller: Authenticate user login
 */
const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      requestId: req.id,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller: Issue new access token using refresh token
 */
const refreshToken = async (req, res, next) => {
  try {
    const result = await authService.refreshAccessToken(req.body.refreshToken);

    res.status(200).json({
      success: true,
      message: 'Access token refreshed successfully',
      requestId: req.id,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller: Invalidate refresh token on logout
 */
const logout = async (req, res, next) => {
  try {
    await authService.logout(req.user._id, req.body.refreshToken);

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
      requestId: req.id,
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller: Retrieve current authenticated user profile
 */
const getMe = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      message: 'User profile retrieved successfully',
      requestId: req.id,
      data: req.user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  getMe,
};
