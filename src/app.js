const path = require('path');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const AppError = require('./utils/AppError');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const expenseRoutes = require('./routes/expenseRoutes');

const app = express();

// Global Middleware
app.use(cors());
app.use(express.json());

// Request logging in development
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Serve static frontend assets from public/
app.use(express.static(path.join(__dirname, '../public')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Expense Tracker API is running smoothly',
    timestamp: new Date().toISOString(),
  });
});

// Mount API Routers
app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);

// Catch-all route for undefined endpoints
app.all('*', (req, res, next) => {
  // If the request is for an API endpoint, return standard 404 JSON
  if (req.originalUrl.startsWith('/api')) {
    return next(new AppError(`Cannot find ${req.method} ${req.originalUrl} on this server!`, 404));
  }

  // Otherwise, serve index.html for client-side SPA routing
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Centralized error-handling middleware (must be registered last)
app.use(errorHandler);

module.exports = app;
