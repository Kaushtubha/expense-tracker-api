const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const requestId = require('./middleware/requestId');
const errorHandler = require('./middleware/errorHandler');
const AppError = require('./utils/AppError');

const app = express();

// 1. Security Headers via Helmet
app.use(helmet());

// 2. CORS Allowlist Configuration
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, Postman, curl, or server-to-server)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new AppError(`Origin ${origin} not allowed by CORS policy`, 403));
    },
    credentials: true,
  })
);

// 3. Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 4. Request Correlation ID
app.use(requestId);

// 5. Morgan Request Logging (with Request ID)
morgan.token('reqId', (req) => req.id || '-');
if (process.env.NODE_ENV !== 'test') {
  app.use(
    morgan(
      '[:date[iso]] :method :url :status :response-time ms - reqId: :reqId'
    )
  );
}

// 6. Base Health Check Endpoints
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Hostel Complaint Tracker API is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    requestId: req.id,
  });
});

app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Hostel Complaint Tracker API v1 is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    requestId: req.id,
  });
});

// Route Imports
const authRoutes = require('./routes/authRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

// 7. API Routes Mount Point
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/complaints', complaintRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);

// 8. 404 Catch-All Handler
app.all('*', (req, res, next) => {
  next(new AppError(`Route ${req.method} ${req.originalUrl} not found on this server`, 404));
});

// 9. Centralized Error Handler (must be registered last)
app.use(errorHandler);

module.exports = app;
