const expenseService = require('../services/expenseService');

/**
 * Controller to create a new expense
 */
const createExpense = async (req, res, next) => {
  try {
    const expense = await expenseService.createExpense(req.user._id, req.body);
    res.status(201).json({
      success: true,
      message: 'Expense created successfully',
      data: expense,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller to list expenses with pagination and filters
 */
const getExpenses = async (req, res, next) => {
  try {
    const result = await expenseService.getExpenses(req.user._id, req.query);
    res.status(200).json({
      success: true,
      message: 'Expenses fetched successfully',
      data: result.expenses,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller to get a single expense by ID
 */
const getExpenseById = async (req, res, next) => {
  try {
    const expense = await expenseService.getExpenseById(
      req.user._id,
      req.params.id
    );
    res.status(200).json({
      success: true,
      message: 'Expense fetched successfully',
      data: expense,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller to update an existing expense
 */
const updateExpense = async (req, res, next) => {
  try {
    const expense = await expenseService.updateExpense(
      req.user._id,
      req.params.id,
      req.body
    );
    res.status(200).json({
      success: true,
      message: 'Expense updated successfully',
      data: expense,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller to delete an expense
 */
const deleteExpense = async (req, res, next) => {
  try {
    await expenseService.deleteExpense(req.user._id, req.params.id);
    res.status(200).json({
      success: true,
      message: 'Expense deleted successfully',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller to get aggregated monthly summary
 */
const getMonthlySummary = async (req, res, next) => {
  try {
    const summary = await expenseService.getMonthlySummary(
      req.user._id,
      req.query.month
    );
    res.status(200).json({
      success: true,
      message: 'Monthly summary calculated successfully',
      data: summary,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  getMonthlySummary,
};
