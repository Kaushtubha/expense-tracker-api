const express = require('express');
const authController = require('../controllers/authController');
const validate = require('../middleware/validate');
const {
  signupRules,
  loginRules,
} = require('../middleware/validators/authValidators');

const router = express.Router();

// Public routes
router.post('/signup', validate(signupRules), authController.signup);
router.post('/login', validate(loginRules), authController.login);

module.exports = router;
