const rateLimit = require('express-rate-limit');

/**
 * Standard handler for rate limit violations returning 429 status code
 */
const rateLimitHandler = (message) => (req, res) => {
  res.status(429).json({
    success: false,
    status: 'fail',
    message,
    requestId: req.id,
  });
};

/**
 * Rate limiter for sensitive authentication endpoints (Login / Register)
 * Prevents brute-force credential stuffing attacks
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test', // Bypass in test suites
  handler: rateLimitHandler(
    'Too many login/registration attempts from this IP. Please try again after 15 minutes.'
  ),
});

/**
 * Rate limiter for complaint creation
 * Prevents spamming maintenance complaints
 */
const complaintCreationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 30, // 30 complaints per IP per hour
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test', // Bypass in test suites
  handler: rateLimitHandler(
    'Too many complaints created from this IP. Please wait before submitting more.'
  ),
});

module.exports = {
  authLimiter,
  complaintCreationLimiter,
};
