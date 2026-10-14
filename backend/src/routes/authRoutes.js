const express = require('express');
const authController = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimiter');
const {
  registerRules,
  loginRules,
  refreshTokenRules,
} = require('../middleware/validators/authValidators');

const router = express.Router();

// Public routes with rate limiting
router.post(
  '/register',
  authLimiter,
  validate(registerRules),
  authController.register
);

router.post(
  '/login',
  authLimiter,
  validate(loginRules),
  authController.login
);

router.post(
  '/refresh-token',
  validate(refreshTokenRules),
  authController.refreshToken
);

// Protected routes
router.get('/me', protect, authController.getMe);
router.post('/logout', protect, authController.logout);

// RBAC check route (restricted strictly to admin role)
router.get('/admin-only', protect, authorize('admin'), (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome Admin: Authorized access granted',
    requestId: req.id,
  });
});

module.exports = router;
