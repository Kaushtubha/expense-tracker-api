require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

// Start Express HTTP Server
const server = app.listen(PORT, () => {
  console.log(`[Server] Expense Tracker API listening on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});

// Handle unhandled promise rejections (e.g. database down after startup)
process.on('unhandledRejection', (err) => {
  console.error('[Unhandled Rejection]', err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
