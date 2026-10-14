const mongoose = require('mongoose');

/**
 * Connect to MongoDB instance using Mongoose.
 * In development, if a local MongoDB service is not running,
 * it automatically falls back to an embedded in-memory database
 * so the application and frontend work out of the box with zero setup.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 2500, // Quick timeout to fallback in dev
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.log(
        `[Database Notice] Could not connect to external MongoDB (${error.message}).`
      );
      console.log(
        '[Database Notice] Starting embedded in-memory MongoDB for zero-config local testing...'
      );

      try {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        const mongod = await MongoMemoryServer.create();
        const uri = mongod.getUri();
        const conn = await mongoose.connect(uri);
        console.log(
          `[Database] Embedded in-memory MongoDB is active: ${conn.connection.host}`
        );
        return;
      } catch (fallbackError) {
        console.error(
          `[Database Error] Fallback initialization failed: ${fallbackError.message}`
        );
      }
    }

    console.error(`[Database Error] Failed to connect to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
