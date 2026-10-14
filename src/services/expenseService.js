const mongoose = require('mongoose');
const Expense = require('../models/Expense');
const AppError = require('../utils/AppError');

/**
 * Service to create a new expense for an authenticated user
 */
const createExpense = async (userId, expenseData) => {
  const expense = await Expense.create({
    ...expenseData,
    user: userId,
  });

  return expense;
};

/**
 * Service to retrieve a paginated list of expenses with optional category and date filters
 */
const getExpenses = async (userId, query) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 10));
  const skip = (page - 1) * limit;

  // Base filter scoped to the authenticated user
  const filter = { user: userId };

  // Filter by category (case-insensitive)
  if (query.category) {
    filter.category = new RegExp(`^${query.category.trim()}$`, 'i');
  }

  // Filter by date range
  if (query.startDate || query.endDate) {
    filter.date = {};
    if (query.startDate) {
      filter.date.$gte = new Date(query.startDate);
    }
    if (query.endDate) {
      const end = new Date(query.endDate);
      // Set to end of day if only YYYY-MM-DD was provided
      if (query.endDate.length === 10) {
        end.setUTCHours(23, 59, 59, 999);
      }
      filter.date.$lte = end;
    }
  }

  const [total, expenses] = await Promise.all([
    Expense.countDocuments(filter),
    Expense.find(filter)
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit),
  ]);

  return {
    expenses,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

/**
 * Service to get a single expense by ID, enforcing user isolation
 */
const getExpenseById = async (userId, expenseId) => {
  const expense = await Expense.findById(expenseId);

  if (!expense) {
    throw new AppError('Expense not found', 404);
  }

  // Strict User Isolation Check: verify ownership
  if (expense.user.toString() !== userId.toString()) {
    throw new AppError('You do not have permission to access this expense', 403);
  }

  return expense;
};

/**
 * Service to update an expense by ID, enforcing user isolation
 */
const updateExpense = async (userId, expenseId, updateData) => {
  const expense = await Expense.findById(expenseId);

  if (!expense) {
    throw new AppError('Expense not found', 404);
  }

  // Strict User Isolation Check: verify ownership
  if (expense.user.toString() !== userId.toString()) {
    throw new AppError('You do not have permission to modify this expense', 403);
  }

  // Apply allowed updates
  const allowedFields = ['amount', 'category', 'description', 'date'];
  allowedFields.forEach((field) => {
    if (updateData[field] !== undefined) {
      expense[field] = updateData[field];
    }
  });

  await expense.save();
  return expense;
};

/**
 * Service to delete an expense by ID, enforcing user isolation
 */
const deleteExpense = async (userId, expenseId) => {
  const expense = await Expense.findById(expenseId);

  if (!expense) {
    throw new AppError('Expense not found', 404);
  }

  // Strict User Isolation Check: verify ownership
  if (expense.user.toString() !== userId.toString()) {
    throw new AppError('You do not have permission to delete this expense', 403);
  }

  await expense.deleteOne();
  return { id: expenseId };
};

/**
 * Service to aggregate monthly spending per category for a user
 * Month format: YYYY-MM (e.g., '2026-10')
 */
const getMonthlySummary = async (userId, month) => {
  if (!month || !/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
    throw new AppError('Please provide a valid month in YYYY-MM format', 400);
  }

  const [yearStr, monthStr] = month.split('-');
  const year = parseInt(yearStr, 10);
  const monthNum = parseInt(monthStr, 10);

  // UTC boundaries for the entire target month
  const startDate = new Date(Date.UTC(year, monthNum - 1, 1, 0, 0, 0));
  const endDate = new Date(Date.UTC(year, monthNum, 1, 0, 0, 0));

  // MongoDB Aggregation Pipeline
  const breakdown = await Expense.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
        date: {
          $gte: startDate,
          $lt: endDate,
        },
      },
    },
    {
      $group: {
        _id: '$category',
        totalAmount: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { totalAmount: -1 },
    },
    {
      $project: {
        _id: 0,
        category: '$_id',
        totalAmount: { $round: ['$totalAmount', 2] },
        count: 1,
      },
    },
  ]);

  const totalSpent = breakdown.reduce((acc, curr) => acc + curr.totalAmount, 0);

  return {
    month,
    totalSpent: Math.round(totalSpent * 100) / 100,
    categoriesCount: breakdown.length,
    breakdown,
  };
};

module.exports = {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  getMonthlySummary,
};
