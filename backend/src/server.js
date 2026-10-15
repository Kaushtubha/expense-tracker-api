require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const cache = require('./config/redis');

const PORT = process.env.PORT || 5001;

// 1. Connect to Database
connectDB();

// 2. Start HTTP Server on all interfaces (0.0.0.0)
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(
    `[Server] Hostel Complaint Tracker running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`
  );
});

// 3. Graceful Shutdown Management
const gracefulShutdown = async (signal) => {
  console.log(`\n[Server] Received ${signal}. Initiating graceful shutdown...`);

  server.close(async () => {
    console.log('[Server] HTTP server closed.');
    await cache.disconnect();
    process.exit(0);
  });

  // Force shutdown if cleanup takes too long
  setTimeout(() => {
    console.error('[Server] Forced shutdown due to timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// 4. Catch Unhandled Rejections and Uncaught Exceptions
process.on('unhandledRejection', (err) => {
  console.error('[FATAL] Unhandled Promise Rejection:', err.name, err.message);
  server.close(() => process.exit(1));
});

process.on('uncaughtException', (err) => {
  console.error('[FATAL] Uncaught Exception:', err.name, err.message);
  process.exit(1);
});
