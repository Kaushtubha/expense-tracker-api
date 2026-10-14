const express = require('express');
const expenseController = require('../controllers/expenseController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  createExpenseRules,
  updateExpenseRules,
  getExpensesQueryRules,
  expenseIdRule,
  summaryQueryRules,
} = require('../middleware/validators/expenseValidators');

const router = express.Router();

// Protect all expense routes - requires valid JWT Bearer token
router.use(protect);

/**
 * NOTE ON ROUTING ORDER:
 * /summary MUST be registered BEFORE /:id.
 * If /:id were declared first, Express would treat the literal string "summary"
 * as an :id parameter, causing a CastError or 400 Bad Request.
 */
router.get(
  '/summary',
  validate(summaryQueryRules),
  expenseController.getMonthlySummary
);

// Standard CRUD endpoints
router
  .route('/')
  .post(validate(createExpenseRules), expenseController.createExpense)
  .get(validate(getExpensesQueryRules), expenseController.getExpenses);

router
  .route('/:id')
  .get(validate(expenseIdRule), expenseController.getExpenseById)
  .put(validate(updateExpenseRules), expenseController.updateExpense)
  .delete(validate(expenseIdRule), expenseController.deleteExpense);

module.exports = router;
