const express = require('express');
const dashboardController = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Dashboard metrics restricted to Admins and Staff
router.use(protect);
router.use(authorize('admin', 'staff'));

router.get('/summary', dashboardController.getSummary);

module.exports = router;
