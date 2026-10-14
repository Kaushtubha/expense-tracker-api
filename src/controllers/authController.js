const authService = require('../services/authService');

/**
 * Controller to handle new user registration
 */
const signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const result = await authService.signup({ name, email, password });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller to handle user login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login({ email, password });

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  signup,
  login,
};
