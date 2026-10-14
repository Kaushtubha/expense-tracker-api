const express = require('express');
const complaintController = require('../controllers/complaintController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { complaintCreationLimiter } = require('../middleware/rateLimiter');
const {
  createComplaintRules,
  updateStatusRules,
  assignStaffRules,
  addCommentRules,
  complaintIdRule,
  getComplaintsQueryRules,
} = require('../middleware/validators/complaintValidators');

const router = express.Router();

// All complaint endpoints require active authentication
router.use(protect);

router
  .route('/')
  .post(
    complaintCreationLimiter,
    validate(createComplaintRules),
    complaintController.createComplaint
  )
  .get(validate(getComplaintsQueryRules), complaintController.getComplaints);

router
  .route('/:id')
  .get(validate(complaintIdRule), complaintController.getComplaintById);

router.patch(
  '/:id/status',
  validate(updateStatusRules),
  complaintController.updateStatus
);

router.patch(
  '/:id/assign',
  authorize('admin'),
  validate(assignStaffRules),
  complaintController.assignStaff
);

router.post(
  '/:id/comments',
  validate(addCommentRules),
  complaintController.addComment
);

module.exports = router;
